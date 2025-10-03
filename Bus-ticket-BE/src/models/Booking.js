const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid');

const bookingSchema = new mongoose.Schema({
  bookingReference: {
    type: String,
    unique: true,
    default: () => uuidv4().slice(0, 8).toUpperCase()
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  scheduleId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Schedule',
    required: true
  },
  departureStop: {
    stopId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Station'
    },
    stopName: String,
    pickupPrice: Number
  },
  arrivalStop: {
    stopId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Station'
    },
    stopName: String,
    dropoffPrice: Number
  },
  totalAmount: {
    type: Number,
    required: true
  },
  numberOfSeats: {
    type: Number,
    default: 1
  },
  paymentStatus: {
    type: String,
    enum: ['pending', 'paid', 'failed', 'refunded'],
    default: 'pending'
  },
  bookingStatus: {
    type: String,
    enum: ['reserved', 'confirmed', 'cancelled', 'completed'],
    default: 'reserved'
  },
  contactInfo: {
    email: String,
    phone: String
  },
  passengers: [{
    fullName: String,
    dateOfBirth: Date,
    idNumber: String,
    seatNumber: String
  }],
  specialRequests: String,
  bookedAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Booking', bookingSchema);