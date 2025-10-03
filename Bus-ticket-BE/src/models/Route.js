const mongoose = require('mongoose');

const routeSchema = new mongoose.Schema({
  routeCode: {
    type: String,
    required: true,
    unique: true
  },
  routeName: {
    type: String,
    required: true
  },
  departureStationId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Station',
    required: true
  },
  arrivalStationId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Station',
    required: true
  },
  distance: Number,
  estimatedDuration: Number, // in minutes
  stops: [{
    stopId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Station'
    },
    stopOrder: Number,
    distanceFromStart: Number,
    estimatedTimeFromStart: Number,
    pickupPrice: {
      type: Number,
      default: 0
    },
    dropoffPrice: {
      type: Number,
      default: 0
    }
  }],
  isActive: {
    type: Boolean,
    default: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Route', routeSchema);