const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const smartDevicesSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    notes: { type: String },
    smartDeviceType: { type: String },
    nativeConnectivity: { type: Boolean, default: false },
    connectionType: [{ type: String }],
    streamIdOptions: [{ type: String }], //streamIdOptions
    smartDeviceStatus: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);


smartDevicesSchema.pre(/^find/, function (next) {
  this.find({ smartDeviceStatus: { $ne: 1 } });

  next();
});

const SmartDevice = mongoose.model(
  'smartDevice',
  smartDevicesSchema,
  'smartDevice'
);
module.exports = SmartDevice;
