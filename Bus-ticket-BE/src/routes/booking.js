// routes/bookings.js - FIXED VERSION
const express = require('express');
const Booking = require('../models/Booking');
const Schedule = require('../models/Schedule');
const Payment = require('../models/Payment');
const emailService = require('../utils/emailService');
const { auth } = require('../middleware/auth');

const router = express.Router(); // CHỈ KHAI BÁO MỘT LẦN

// Create booking
router.post('/', auth, async (req, res) => {
  try {
    const {
      scheduleId,
      departureStop,
      arrivalStop,
      passengers,
      contactInfo,
      specialRequests
    } = req.body;

    // Check schedule availability
    const schedule = await Schedule.findById(scheduleId)
      .populate('routeId')
      .populate('busId');

    if (!schedule) {
      return res.status(400).json({ message: 'Schedule not found' });
    }

    if (schedule.availableSeats < passengers.length) {
      return res.status(400).json({ message: 'Not enough available seats' });
    }

    // Calculate total amount
    const totalAmount = schedule.basePrice * passengers.length;

    const booking = new Booking({
      userId: req.user._id,
      scheduleId,
      departureStop,
      arrivalStop,
      totalAmount,
      numberOfSeats: passengers.length,
      contactInfo,
      passengers,
      specialRequests
    });

    await booking.save();

    // Update available seats
    schedule.availableSeats -= passengers.length;
    await schedule.save();

    const populatedBooking = await Booking.findById(booking._id)
      .populate({
        path: 'scheduleId',
        populate: {
          path: 'routeId busId'
        }
      });

    res.status(201).json({
      message: 'Booking created successfully',
      booking: populatedBooking
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get user bookings
router.get('/my-bookings', auth, async (req, res) => {
  try {
    const bookings = await Booking.find({ userId: req.user._id })
      .populate({
        path: 'scheduleId',
        populate: {
          path: 'routeId busId',
          populate: {
            path: 'departureStationId arrivalStationId companyId'
          }
        }
      })
      .sort({ bookedAt: -1 });

    res.json({ bookings });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get booking by reference
router.get('/:bookingReference', async (req, res) => {
  try {
    const booking = await Booking.findOne({ 
      bookingReference: req.params.bookingReference 
    })
    .populate({
      path: 'scheduleId',
      populate: {
        path: 'routeId busId',
        populate: {
          path: 'departureStationId arrivalStationId companyId'
        }
      }
    });

    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    res.json({ booking });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Cancel booking
router.patch('/:bookingId/cancel', auth, async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.bookingId);
    
    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    if (booking.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Access denied' });
    }

    if (booking.bookingStatus !== 'reserved' && booking.bookingStatus !== 'confirmed') {
      return res.status(400).json({ message: 'Cannot cancel this booking' });
    }

    booking.bookingStatus = 'cancelled';
    await booking.save();

    // Return seats to schedule
    const schedule = await Schedule.findById(booking.scheduleId);
    if (schedule) {
      schedule.availableSeats += booking.numberOfSeats;
      await schedule.save();
    }

    res.json({ message: 'Booking cancelled successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router; 