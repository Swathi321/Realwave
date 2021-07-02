const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const clientSchema = new Schema(
  {
    name: { type: String, required: true, unique: true },
    // url: { type: String, required: true },
    address1: { type: String },
    address2: { type: String },
    city: { type: String },
    state: { type: String },
    country: { type: String },
    zipcode: { type: String },
    phoneNumber: { type: String },
    contactName: { type: String },
    contactPhone: { type: String },
    contactEmail: { type: String },
    industry: { type: Schema.Types.ObjectId, ref: 'industry' }, // Foreign Key
    allowedThemes: [{ type: String }],
    status: { type: String },
    theme: {
      type: String,
      default: 'Dark',
    },
    clientType: { type: String },
    installerId: { type: Schema.Types.ObjectId, ref: 'client' }, // Foreign Key
    //rolesAllowed: [{ type: Schema.Types.ObjectId, ref: 'role' }], // Foreign Key
    widgetsAllowed: [{ type: Schema.Types.ObjectId, ref: 'widgets' }], // Foreign Key
    reportsAllowed: [{ type: Schema.Types.ObjectId, ref: 'reports' }], // Foreign Key
    smartDevicesAllowed: [{ type: Schema.Types.ObjectId, ref: 'smartDevice' }], // Foreign Key
    bookmarkTypeAllowed: [{ type: Schema.Types.ObjectId, ref: 'bookmarkType' }],
    cameraTagsAllowed:[{ type: Schema.Types.ObjectId, ref: 'cameraTags' }],

    keyInCloudClientId: { type: String },
    keyInCloudSecretKey: { type: String },

    sera4Url: {type: String},
    sera4Token: {type: String},
    TwsUser: {type: String},
    TwsPass: {type: String},

    logo: { type: String },
    isDeleted: { type: Number },
    createdByUserId: { type: Number },

    isProfileCompleted: { type: Boolean, default: false },
    isRoleCompleted: { type: Boolean, default: false },
    isRegionCompleted: { type: Boolean, default: false },
    isSystemSettingsCompleted: { type: Boolean, default: false },
  },
  { timestamps: true }
);

const Client = mongoose.model('client', clientSchema, 'client');
module.exports = Client;                  