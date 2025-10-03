const mongoose = require('mongoose');

const scheduleSchema = new mongoose.Schema({
  routeId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Route',
    required: true
  },
  busId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Bus',
    required: true
  },
  departureTime: {
    type: Date,
    required: true
  },
  arrivalTime: {
    type: Date,
    required: true
  },
  driverId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  basePrice: {
    type: Number,
    required: true
  },
  availableSeats: {
    type: Number,
    required: true
  },
  status: {
    type: String,
    enum: ['scheduled', 'boarding', 'departed', 'arrived', 'delayed', 'cancelled'],
    default: 'scheduled'
  },
  currentStopIndex: {
    type: Number,
    default: 0
  },
  actualDepartureTime: Date,
  actualArrivalTime: Date,
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Schedule', scheduleSchema);