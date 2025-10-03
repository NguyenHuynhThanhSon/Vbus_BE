const express = require('express');
const Schedule = require('../models/Schedule');
const Route = require('../models/Route');
const Bus = require('../models/Bus');
const { auth, authorize } = require('../middleware/auth');

const router = express.Router();

// Search schedules
router.get('/search', async (req, res) => {
  try {
    const { 
      departureCity, 
      arrivalCity, 
      departureDate, 
      passengers = 1 
    } = req.query;

    if (!departureCity || !arrivalCity || !departureDate) {
      return res.status(400).json({ 
        message: 'Departure city, arrival city, and departure date are required' 
      });
    }

    const startDate = new Date(departureDate);
    const endDate = new Date(startDate);
    endDate.setDate(endDate.getDate() + 1);

    const schedules = await Schedule.find({
      departureTime: {
        $gte: startDate,
        $lt: endDate
      },
      availableSeats: { $gte: parseInt(passengers) },
      status: 'scheduled'
    })
    .populate({
      path: 'routeId',
      populate: {
        path: 'departureStationId arrivalStationId',
        match: {
          $or: [
            { city: departureCity },
            { city: arrivalCity }
          ]
        }
      }
    })
    .populate({
      path: 'busId',
      populate: {
        path: 'companyId'
      }
    })
    .populate('driverId', 'firstName lastName');

    const filteredSchedules = schedules.filter(schedule => 
      schedule.routeId && 
      schedule.routeId.departureStationId && 
      schedule.routeId.arrivalStationId &&
      schedule.routeId.departureStationId.city === departureCity &&
      schedule.routeId.arrivalStationId.city === arrivalCity
    );

    res.json({
      schedules: filteredSchedules,
      count: filteredSchedules.length
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Create schedule (Bus Manager only)
router.post('/', auth, authorize('bus_manager', 'admin'), async (req, res) => {
  try {
    const {
      routeId,
      busId,
      departureTime,
      arrivalTime,
      driverId,
      basePrice
    } = req.body;

    // Get bus info for available seats
    const bus = await Bus.findById(busId);
    if (!bus) {
      return res.status(400).json({ message: 'Bus not found' });
    }

    const schedule = new Schedule({
      routeId,
      busId,
      departureTime: new Date(departureTime),
      arrivalTime: new Date(arrivalTime),
      driverId,
      basePrice,
      availableSeats: bus.busType.seatCapacity
    });

    await schedule.save();

    const populatedSchedule = await Schedule.findById(schedule._id)
      .populate('routeId')
      .populate('busId')
      .populate('driverId', 'firstName lastName');

    res.status(201).json({
      message: 'Schedule created successfully',
      schedule: populatedSchedule
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;