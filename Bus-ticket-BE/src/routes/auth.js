// routes/auth.js - OTP-based Authentication
const express = require('express');
const { body, validationResult } = require('express-validator');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const emailService = require('../utils/emailService');
const { generateOTP } = require('../utils/otpGenerator');
const { auth } = require('../middleware/auth');

const router = express.Router();

// Send OTP - For both registration and login
router.post('/send-otp', [
  body('email').isEmail().normalizeEmail()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email } = req.body;

    // Generate OTP
    const otp = generateOTP();
    const otpExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    // Check if user exists
    let user = await User.findOne({ email });

    if (user) {
      // Existing user - just update OTP
      user.otpCode = otp;
      user.otpExpires = otpExpires;
      await user.save();
    } else {
      // New user - create account with minimal info
      user = new User({
        email,
        passwordHash: Math.random().toString(36), // Dummy password, not used
        firstName: 'User', // Default value
        lastName: email.split('@')[0], // Use email prefix as default
        phone: '', // Empty, can be updated later
        otpCode: otp,
        otpExpires,
        isEmailVerified: false,
        isActive: false
      });
      await user.save();
    }

    // Send OTP email
    await emailService.sendOTP(email, otp);

    res.json({
      message: 'OTP sent to your email',
      email,
      isNewUser: !user.isEmailVerified
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Verify OTP and login
router.post('/verify-otp', [
  body('email').isEmail().normalizeEmail(),
  body('otp').notEmpty().isLength({ min: 6, max: 6 })
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, otp } = req.body;

    const user = await User.findOne({ email });
    
    if (!user) {
      return res.status(400).json({ message: 'User not found' });
    }

    // Verify OTP
    if (user.otpCode !== otp || user.otpExpires < new Date()) {
      return res.status(400).json({ message: 'Invalid or expired OTP' });
    }

    // First time verification
    if (!user.isEmailVerified) {
      user.isEmailVerified = true;
      user.isActive = true;
    }

    // Clear OTP and update last login
    user.otpCode = undefined;
    user.otpExpires = undefined;
    user.lastLogin = new Date();
    await user.save();

    // Generate JWT token
    const token = jwt.sign(
      { id: user._id }, 
      process.env.JWT_SECRET || 'your-secret-key', 
      { expiresIn: '7d' }
    );

    res.json({
      message: 'Login successful',
      token,
      user: {
        id: user._id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        phone: user.phone,
        role: user.role,
        isEmailVerified: user.isEmailVerified,
        loyaltyPoints: user.loyaltyPoints,
        loyaltyTier: user.loyaltyTier
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Resend OTP
router.post('/resend-otp', [
  body('email').isEmail().normalizeEmail()
], async (req, res) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: 'User not found' });
    }

    const otp = generateOTP();
    const otpExpires = new Date(Date.now() + 10 * 60 * 1000);

    user.otpCode = otp;
    user.otpExpires = otpExpires;
    await user.save();

    await emailService.sendOTP(email, otp);

    res.json({ message: 'OTP resent successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get current user
router.get('/me', auth, async (req, res) => {
  res.json({
    user: {
      id: req.user._id,
      email: req.user.email,
      firstName: req.user.firstName,
      lastName: req.user.lastName,
      phone: req.user.phone,
      dateOfBirth: req.user.dateOfBirth,
      idNumber: req.user.idNumber,
      role: req.user.role,
      loyaltyPoints: req.user.loyaltyPoints,
      loyaltyTier: req.user.loyaltyTier,
      isEmailVerified: req.user.isEmailVerified
    }
  });
});

// Logout (Optional - mainly for clearing token on client side)
router.post('/logout', auth, async (req, res) => {
  res.json({ message: 'Logout successful' });
});

module.exports = router;