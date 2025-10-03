// models/User.js - Updated with optional fields
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true
  },
  passwordHash: {
    type: String,
    required: true
  },
  firstName: {
    type: String,
    default: 'User'
  },
  lastName: {
    type: String,
    default: ''
  },
  phone: {
    type: String,
    default: ''
  },
  dateOfBirth: {
    type: Date
  },
  idNumber: {
    type: String
  },
  role: {
    type: String,
    enum: ['passenger', 'booking_agent', 'bus_manager', 'driver', 'admin', 'partner'],
    default: 'passenger'
  },
  loyaltyPoints: {
    type: Number,
    default: 0
  },
  loyaltyTier: {
    type: String,
    enum: ['standard', 'silver', 'gold', 'platinum'],
    default: 'standard'
  },
  isActive: {
    type: Boolean,
    default: false
  },
  isEmailVerified: {
    type: Boolean,
    default: false
  },
  emailVerificationToken: String,
  emailVerificationExpires: Date,
  passwordResetToken: String,
  passwordResetExpires: Date,
  otpCode: String,
  otpExpires: Date,
  createdAt: {
    type: Date,
    default: Date.now
  },
  lastLogin: Date
});

userSchema.pre('save', async function(next) {
  if (!this.isModified('passwordHash')) return next();
  this.passwordHash = await bcrypt.hash(this.passwordHash, 12);
  next();
});

userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.passwordHash);
};

module.exports = mongoose.model('User', userSchema);