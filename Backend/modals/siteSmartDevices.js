const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const siteSmartDevicesSchema = new mongoose.Schema(
  {
    device: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'smartDevice',
    }, // Foreign Key

    // secretKey: { type: String },
    clientId: { type: Schema.Types.ObjectId, ref: 'client' }, // Foreign Key
    storeId: { type: Schema.Types.ObjectId, ref: 'store' }, // Foreign Key
    notes: { type: String },
    name: { type: String },
    POSdeviceRegisterNo: { type: String },
    // Sera4 Specific Fields
    sera4LocationID: {type: String},
    sera4DeviceID: {type: String},
    sera4Name: {type: String},
    sera4Open: {type: Boolean},
    sera4LastUpdated: {type: String},
    // KeyInCloud Specific Fields
    kicDeviceID: { type: String },
    kicDeviceType: { type: String },
    kicVendorName: { type: String },
    kicDeviceName: { type: String },
    kicSerialNumber: { type: String },
    kicStatus: { type: String },
    kicLocationID: { type: String },

    kicPowerLevel: { type: Number },
    kicWifiLevel: { type: Number },
    kicConnectedAt: { type: Date },
    isDeviceConnected: { type: Boolean },
    deviceLocation: { type: String },
    deviceNotificationSettings: [{ type: Boolean, default: false }],

    day: [
      {
        doW: { type: String },
        entireDay: { type: Boolean, default: false },
        timeSlot: [
          {
            _id: false,
            StartTime: { type: String },
            EndTime: { type: String },
            emailNotificationUsers: [ { type: Schema.Types.ObjectId, ref: 'user' },], //Foreign key User Schema email id

            smsNotificationUsers: [{ type: Schema.Types.ObjectId, ref: 'user' }],

            emailNotificationTo: [{ type: String }],
            smsNotificationTo: [{ type: String }],
          },
        ],

      },
    ],
    
    kicEvent: [
      {
        // _id: false,
        bookMarkTypeId: { type: Schema.Types.ObjectId, ref: 'bookmarkType' },
        eventType: { type: String },
        createClip: { type: Boolean, default: true },
        bookMark: { type: Boolean, default: false },
        emailNotificationUsers: [{ type: Schema.Types.ObjectId, ref: 'user' }],
        smsNotificationUsers: [{ type: Schema.Types.ObjectId, ref: 'user' }],
        emailNotificationTo: [{ type: String }],
        smsNotificationTo: [{ type: String }]
      }

    ],

    seraEvent: [
      {
        // _id: false,
        bookMarkTypeId: { type: Schema.Types.ObjectId, ref: 'bookmarkType' },
        eventType: { type: String },
        createClip: { type: Boolean, default: true },
        bookMark: { type: Boolean, default: false },
        emailNotificationUsers: [{ type: Schema.Types.ObjectId, ref: 'user' }],
        smsNotificationUsers: [{ type: Schema.Types.ObjectId, ref: 'user' }],
        emailNotificationTo: [{ type: String }],
        smsNotificationTo: [{ type: String }]
      }

    ],
    // storeNotificationId: {
    //   type: Schema.Types.ObjectId,
    //   ref: 'storeNotification',
    // }, // Foreign Key

    //Scale fields
    scaleIP: { type: String },
    scalePort: { type: Number },
    connectionType: { type: String },
    scaleUserName: { type: String },
    scalePassword: { type: String },

    siteSmartDeviceStatus: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);
siteSmartDevicesSchema.pre(/^find/, function (next) {
  this.find({ siteSmartDeviceStatus: { $ne: 1 } });

  next();
});
const SiteSmartDevices = mongoose.model(
  'siteSmartDevices',
  siteSmartDevicesSchema,
  'siteSmartDevices'
);
module.exports = SiteSmartDevices;
