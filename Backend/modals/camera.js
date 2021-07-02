const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const cameraSchema = new Schema(
  {
    name: { type: String },
    place: { type: String },
    status: { type: String },
    cameraType: { type: String },
    // tags: { type: String },
    tags: [{
      type: Schema.Types.ObjectId,
      ref: 'cameraTags',
    }],
    roiData: [
      {
         roiId:{type: Schema.Types.ObjectId, ref: 'roiTagMaster'},//
      
          top:{ type : Number},
          left:{ type : Number},
          height:{ type : Number},
          width:{ type : Number},
          angle:{type: Number}
        
      }
    ],

    cameraRTSPUrl: { type: String },
    cameraThumbnailRTSPUrl: { type: String, default: null },
    isRecordingStarted: { type: Boolean },
    storeId: { type: Schema.Types.ObjectId, ref: 'store', required: true },
    isDeleted: { type: Number },
    recordTimeLimit: { type: Number },
    recordPreTime: { type: Number },
    recordPostTime: { type: Number },
    createdByUserId: { type: Number },
    cameraNotes: { type: String },
    register: { type: String }, // remove at migration
    isConnected: { type: Boolean },
    cameraBrand: {
      type: Schema.Types.ObjectId,
      ref: 'smartDevice',
      required: true,
    },
    isHeatMapCamera: { type: Boolean },
    heatMapCameraPort: { type: Number },
    enableHeatMap: { type: Boolean },
    isPtzControl: { type: Boolean },
    protocolType: { type: String, default: 'TCP' },
    lowStreamId: { type: String },
    highStreamId: { type: String },
    aiStreamId: { type: String },
    primaryCameraId: { type: Number },
    primaryStreamId: { type: Number },
    secondaryStreamId: { type: Number },
    recordingStreamId: { type: Number },
    cameraAIUrl: { type: String },
    smartDevices: [{ type: String }],
    alarmEventId: { type: String },
    siteSmartDevices: [
      {
        deviceId: {
          type: Schema.Types.ObjectId,
          ref: 'siteSmartDevices',
        }, // Foreign Key
        devicePreRecordingDuration: { type: String },
        devicePostRecordingDuration: { type: String },
      },
    ],
    aiStreamRTSPURL: { type: String },
    isRecordingEnabled: { type: Boolean },
    RecordingStreamID: { type: Number },
    RecordingStreamURL: { type: String },
    covertCamera: { type: Boolean },
    //Camera Connectivity
    isNativeConnection: { type: Boolean, default: false },
    username: { type: String },
    password: { type: String },
    port: { type: Number, default: 80 },
    ip: { type: String },
    //SSH Details
    sshCameraPort: { type: Number, default: null }, // Port to be open on Server
    sshConnStartTime: { type: Date, default: null },
    sshConnEndTime: { type: Date, default: null },
    sshCameraIp: { type: String },
    sshCameraLocalPort: { type: Number, default: 80 }
  },
  { timestamps: true }
);

const Camera = mongoose.model('camera', cameraSchema, 'camera');
module.exports = Camera;
