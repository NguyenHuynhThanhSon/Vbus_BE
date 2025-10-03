const mongoose = require('mongoose');

const stationSchema = new mongoose.Schema({
  stationCode: {
    type: String,
    required: true,
    unique: true
  },
  stationName: {
    type: String,
    required: true
  },
  city: {
    type: String,
    required: true
  },
  province: {
    type: String,
    required: true
  },
  address: {
    street: String,
    ward: String,
    district: String
  },
  contactNumber: String,
  coordinates: {
    latitude: Number,
    longitude: Number
  },
  facilities: [String],
  isActive: {
    type: Boolean,
    default: true
  }
});

module.exports = mongoose.model('Station', stationSchema);
