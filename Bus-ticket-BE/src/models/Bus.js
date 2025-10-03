const mongoose = require('mongoose');

const busSchema = new mongoose.Schema({
  busNumber: {
    type: String,
    required: true,
    unique: true
  },
  licensePlate: {
    type: String,
    required: true,
    unique: true
  },
  companyId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'BusCompany',
    required: true
  },
  busType: {
    typeName: String,
    seatCapacity: Number,
    seatLayout: mongoose.Schema.Types.Mixed
  },
  driverId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  amenities: [String],
  lastMaintenance: Date,
  nextMaintenance: Date,
  isActive: {
    type: Boolean,
    default: true
  },
  seats: [{
    seatNumber: String,
    seatType: {
      type: String,
      enum: ['normal', 'vip', 'sleeping'],
      default: 'normal'
    },
    isAvailable: {
      type: Boolean,
      default: true
    },
    features: [String]
  }],
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Bus', busSchema);