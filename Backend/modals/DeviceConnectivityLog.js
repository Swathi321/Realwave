const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const deviceConnectivityLog = new Schema({
    storeId: { type: Schema.Types.ObjectId, ref: 'store' },
    camId: { type: Schema.Types.ObjectId, ref: 'camera' },
    type: { type: Schema.Types.String },  // Site/Camera
    eventTime: { type: Date },
    status:{ type: Boolean },
    isCam:{ type: Boolean },
    isStore:{ type: Boolean },
    isEmailMessage:{ type: Boolean },
    isTextMessage:{ type: Boolean },
    remarkHistory: { type: Schema.Types.String }
}, { timestamps: true });

deviceConnectivityLog.index({ storeId: 1 });

const DeviceConnectivityLogModel = mongoose.model('deviceConnectivityLog', deviceConnectivityLog, 'deviceConnectivityLog');

function createDefaultDeviceConnectivityLog() {
    DeviceConnectivityLogModel.find({}).exec(function (err, collection) {
      if (collection.length === 0) {
        DeviceConnectivityLogModel.create({
          _id: "5ed9253651c027338431c065".toObjectId(),
          storeId: '5ed9253551c027338431c064'.toObjectId(),
          type : 'STORE',
          eventTime : new Date("2020-06-08T23:32:41.402+05:30"),
          status :true,
          isCam : false,
          isStore : true
        });
  
        DeviceConnectivityLogModel.create({
            _id: "5ed8e383328ad11e6c69f5e6".toObjectId(),
            camId: '5ed7bbae39cbf033b8b7f168'.toObjectId(),
            type : 'CAMERA',
            eventTime : new Date("2020-06-04T17:35:23.308+05:30"),
            status :true,
            isCam : true,
            isStore : false
          });

          DeviceConnectivityLogModel.create({
            _id: "5ed7a1bdbf6d901ec8567c9d".toObjectId(),
            camId: '5ed7a1a3bf6d901ec8567c99'.toObjectId(),
            type : 'CAMERA',
            eventTime : new Date("2020-06-03T19:43:22.258+05:30"),
            status :true,
            isCam : true,
            isStore : false
          });

      }
    })
  };

  module.exports = { DeviceConnectivityLogModel, createDefaultDeviceConnectivityLog };