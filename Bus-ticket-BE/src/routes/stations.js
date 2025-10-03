// routes/stations.js
const express = require('express');
const Station = require('../models/Station');

const router = express.Router();

// Search stations by city name
router.get('/search', async (req, res) => {
  try {
    const { keyword } = req.query;

    if (!keyword) {
      return res.status(400).json({ 
        message: 'Keyword is required' 
      });
    }

    // Search stations by city or station name
    const stations = await Station.find({
      isActive: true,
      $or: [
        { city: { $regex: keyword, $options: 'i' } },
        { stationName: { $regex: keyword, $options: 'i' } },
        { province: { $regex: keyword, $options: 'i' } }
      ]
    })
    .select('stationCode stationName city province address')
    .sort({ city: 1, stationName: 1 })
    .limit(20);

    // Group by city for better UX
    const groupedByCity = stations.reduce((acc, station) => {
      const city = station.city;
      if (!acc[city]) {
        acc[city] = [];
      }
      acc[city].push({
        id: station._id,
        stationCode: station.stationCode,
        stationName: station.stationName,
        city: station.city,
        province: station.province,
        fullAddress: `${station.stationName}, ${station.city}`
      });
      return acc;
    }, {});

    // Convert to array format
    const result = Object.keys(groupedByCity).map(city => ({
      city: city,
      stations: groupedByCity[city]
    }));

    res.json({
      success: true,
      count: stations.length,
      data: result,
      flatList: stations.map(s => ({
        id: s._id,
        stationCode: s.stationCode,
        stationName: s.stationName,
        city: s.city,
        province: s.province,
        displayName: `${s.stationName}, ${s.city}`
      }))
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ 
      success: false,
      message: 'Server error' 
    });
  }
});

// Get all unique cities
router.get('/cities', async (req, res) => {
  try {
    const cities = await Station.distinct('city', { isActive: true });
    
    res.json({
      success: true,
      count: cities.length,
      cities: cities.sort()
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ 
      success: false,
      message: 'Server error' 
    });
  }
});

// Get stations by city
router.get('/by-city/:city', async (req, res) => {
  try {
    const { city } = req.params;
    
    const stations = await Station.find({
      city: { $regex: city, $options: 'i' },
      isActive: true
    })
    .select('stationCode stationName city province address contactNumber')
    .sort({ stationName: 1 });

    res.json({
      success: true,
      count: stations.length,
      city: city,
      stations: stations
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ 
      success: false,
      message: 'Server error' 
    });
  }
});

// Get station detail by ID
router.get('/:stationId', async (req, res) => {
  try {
    const station = await Station.findById(req.params.stationId);
    
    if (!station) {
      return res.status(404).json({ 
        success: false,
        message: 'Station not found' 
      });
    }

    res.json({
      success: true,
      station: station
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ 
      success: false,
      message: 'Server error' 
    });
  }
});

module.exports = router;