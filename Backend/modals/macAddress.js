const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const macaddressesSchema = new Schema({
  macaddress: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    minlength: 17
  },
}, {
  timestamps: true,
});

const MacAddresses = mongoose.model('macaddresses', macaddressesSchema,'macaddresses');

module.exports = MacAddresses;