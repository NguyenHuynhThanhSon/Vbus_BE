const mongoose = require('mongoose');

const busCompanySchema = new mongoose.Schema({
  companyName: {
    type: String,
    required: true
  },
  companyCode: {
    type: String,
    required: true,
    unique: true
  },
  logoURL: String,
  contactNumber: String,
  email: String,
  address: {
    street: String,
    city: String,
    province: String,
    postalCode: String
  },
  isActive: {
    type: Boolean,
    default: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('BusCompany', busCompanySchema);