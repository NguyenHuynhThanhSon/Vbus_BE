// routes/payments.js
const express = require('express');
const Payment = require('../models/Payment');
const Booking = require('../models/Booking');
const emailService = require('../utils/emailService');
const { auth } = require('../middleware/auth');

const router = express.Router();

// Process payment
router.post('/', auth, async (req, res) => {
  try {
    const { bookingId, paymentMethod, paymentDetails } = req.body;

    const booking = await Booking.findById(bookingId)
      .populate({
        path: 'scheduleId',
        populate: {
          path: 'routeId',
          populate: {
            path: 'departureStationId arrivalStationId'
          }
        }
      });

    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    if (booking.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Access denied' });
    }

    if (booking.paymentStatus === 'paid') {
      return res.status(400).json({ message: 'Booking already paid' });
    }

    const payment = new Payment({
      bookingId,
      amount: booking.totalAmount,
      paymentMethod,
      paymentDetails,
      transactionId: `TXN_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      paymentStatus: 'completed',
      paidAt: new Date()
    });

    await payment.save();

    // Update booking status
    booking.paymentStatus = 'paid';
    booking.bookingStatus = 'confirmed';
    await booking.save();

    // Send confirmation email
    const bookingDetails = {
      bookingReference: booking.bookingReference,
      routeName: `${booking.scheduleId.routeId.departureStationId.stationName} - ${booking.scheduleId.routeId.arrivalStationId.stationName}`,
      departureTime: booking.scheduleId.departureTime.toLocaleString('vi-VN'),
      numberOfSeats: booking.numberOfSeats,
      totalAmount: booking.totalAmount
    };

    await emailService.sendBookingConfirmation(booking.contactInfo.email, bookingDetails);

    res.json({
      message: 'Payment processed successfully',
      payment,
      booking
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get payment history
router.get('/history', auth, async (req, res) => {
  try {
    const payments = await Payment.find()
      .populate({
        path: 'bookingId',
        match: { userId: req.user._id },
        populate: {
          path: 'scheduleId',
          populate: {
            path: 'routeId'
          }
        }
      })
      .sort({ createdAt: -1 });

    const filteredPayments = payments.filter(payment => payment.bookingId);

    res.json({ payments: filteredPayments });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get payment by ID
router.get('/:paymentId', auth, async (req, res) => {
  try {
    const payment = await Payment.findById(req.params.paymentId)
      .populate({
        path: 'bookingId',
        populate: {
          path: 'scheduleId',
          populate: {
            path: 'routeId'
          }
        }
      });

    if (!payment) {
      return res.status(404).json({ message: 'Payment not found' });
    }

    // Check if user owns this payment
    if (payment.bookingId.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Access denied' });
    }

    res.json({ payment });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;