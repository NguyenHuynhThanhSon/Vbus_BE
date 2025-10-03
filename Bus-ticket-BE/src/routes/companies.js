const express = require('express');
const BusCompany = require('../models/BusCompany');
const Bus = require('../models/Bus');
const { auth, authorize } = require('../middleware/auth');

const router = express.Router();

// Get all companies
router.get('/', async (req, res) => {
  try {
    const companies = await BusCompany.find({ isActive: true });
    res.json({ companies });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Create company (Admin only)
router.post('/', auth, authorize('admin'), async (req, res) => {
  try {
    const company = new BusCompany(req.body);
    await company.save();
    
    res.status(201).json({
      message: 'Company created successfully',
      company
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ message: 'Company code already exists' });
    }
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get company buses
router.get('/:companyId/buses', async (req, res) => {
  try {
    const buses = await Bus.find({ 
      companyId: req.params.companyId,
      isActive: true 
    }).populate('driverId', 'firstName lastName');
    
    res.json({ buses });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;