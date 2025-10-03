const express = require('express');
const Route = require('../models/Route');
const Station = require('../models/Station');
const { auth, authorize } = require('../middleware/auth');

const router = express.Router();

// Get all routes
router.get('/', async (req, res) => {
  try {
    const routes = await Route.find({ isActive: true })
      .populate('departureStationId arrivalStationId')
      .populate({
        path: 'stops.stopId',
        model: 'Station'
      });
    
    res.json({ routes });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Create route (Bus Manager/Admin only)
router.post('/', auth, authorize('bus_manager', 'admin'), async (req, res) => {
  try {
    const route = new Route(req.body);
    await route.save();
    
    const populatedRoute = await Route.findById(route._id)
      .populate('departureStationId arrivalStationId');
    
    res.status(201).json({
      message: 'Route created successfully',
      route: populatedRoute
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ message: 'Route code already exists' });
    }
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get popular routes
router.get('/popular', async (req, res) => {
  try {
    // This would typically involve aggregating booking data
    // For now, return all active routes
    const routes = await Route.find({ isActive: true })
      .populate('departureStationId arrivalStationId')
      .limit(10);
    
    res.json({ routes });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;