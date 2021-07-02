const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const moment = require('moment');
let AntMediaAdapter = require('./../util/AntMediaAdapter');
const camera = require('./../modals/camera');
const logger = require('./../util/logger');
const util = require('./../util/util');

const storeSchema = new Schema(
  {
    name: { type: String },
    isAntMedia: { type: Boolean, default: false },
    liveVideoConfig: { type: String }, //transport type
    storeType: { type: String },
    serialNumber: { type: String, unique: true },
    status: { type: String },
    clientId: { type: Schema.Types.ObjectId, ref: 'client' },
    addressLine1: { type: String },
    addressLine2: { type: String },
    city: { type: String },
    state: { type: String },
    country: { type: String },
    zipCode: { type: String },
    clientRegion: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'clientRegions',
    },
    isConnected: { type: Boolean },
    version: { type: String },
    daemonVersion: { type: String, default: "" },
    lastConnectedOn: { type: Date },
    lastInvoiceId: { type: Number },
    lastVoidItemId: { type: Number },
    isDeleted: { type: Number },
    createdByUserId: { type: Number },
    tags: [{ type: String }],
    storeNotes: { type: String },
    videoDir: { type: String },
    driveLists: { type: String },
    latitude: { type: String },
    longitude: { type: String },
    mobile: { type: String }, //migration
    map: { type: String },
    timezoneOffset: { type: Number },
    isSMSEnable: { type: Boolean },
    timeZone: { type: Number }, //simplification expected
    siteOnMonitor: { type: Boolean, default: false }, // migration - notif
    email: { type: String, default: true }, // migration - notif
    lastStatus: { type: Date }, //connected/disconnected
    notificationFrequency: { type: Number, default: 15 }, //migration
    mediaServerUrl: { type: String, default: 'rtmp://live.realwave.io' },
    mediaServerInboundPort: { type: Number, default: 1935 },
    mediaServerOutboundPort: { type: Number, default: 8443 },
    timezoneValue: { type: String },
    macAddress: { type: String },
    isNvr: { type: Boolean, default: false },
    nvrUsername: { type: String },
    nvrPassword: { type: String },
    nvrAddress: { type: String },
    nvrPort: { type: Number },
    type: { type: String, default: 'Default' },
    totalDaysOfRecording: { type: Number, default: 0 },
    hasDedicatedPort: { type: Boolean, default: false },
    sshPort: { type: Number, default: null },
    sshConnStartTime: { type: Date, default: null },
    sshConnEndTime: { type: Date, default: null },
    sshLocalServerPort: { type: Number, default: 22 },

    hasDedicatedVNCPort: { type: Boolean, default: false },
    vncPort: { type: Number, default: null },
    vncConnStartTime: { type: Date, default: null },
    vncConnEndTime: { type: Date, default: null },
    vncLocalServerPort: { type: Number, default: 5900 },

    publicIp: { type: String },
    siteStreamConfig: { type: String, default: 'LowStreamOnly' },
    siteErrorLogLevel: [{ type: String }],
    rexLibVersion: { type: String, default: null },
    isAntMediaForPlayback: { type: Boolean, default: false },
    isRecordedMediaSameAsLive: { type: Boolean, default: false },
    isRecordedAntMedia: { type: Boolean, default: false },
    recordedMediaServerUrl: {
      type: String,
      default: 'rtmp://live.realwave.io',
    },
    recordedMediaServerInboundPort: { type: Number, default: 1935 },
    recordedMediaServerOutboundPort: { type: Number, default: 8443 },
    recordedVideoConfig: { type: String }, nvrLivePort: { type: Number },
    nvrPlaybackPort: { type: Number },
    recordingLocation: { type: String },
    storeNotificationEnabled: { type: Boolean, default: true },
    storeNotificationId: {
      type: Schema.Types.ObjectId,
      ref: 'storeNotifications',
    },

    totalDaysOfRecording: { type: Number, default: 0 },


    // KeyInCloud Specific Fields
    kicLocationID: { type: String },
    kicLocationURL: { type: String },
    kicName: { type: String },
    kicPhone: { type: String },
    kicAddress: { type: String },
    kicAddress2: { type: String },
    kicCity: { type: String },
    kicState: { type: String },
    kicPostalCode: { type: String },
    kicCountry: { type: String },
    lastDisconnectedOn: { type: Date },



    // eventPreTime: { type: Number },
    // eventPostTime: { type: Number },
    // smartDevices: [{ type: String }],
    // tunnelPort: { type: Number },
    // cameraCoordinates: [],
  },
  {
    timestamps: true,
    toObject: { virtuals: true },
    toJSON: { virtuals: true },
  }
);

// using post method before saving site and check if site is moved from nodemedia to antmedia
storeSchema.post('validate', true, async function (doc, next) {
  try {
    // Check if current doc is available or not & document is old not the new one
    if (doc && doc._id && !this.isNew) {
      // fetching old values to check is it saved as antMedia or not previosly
      let storeData = await Store.findById(doc._id);
      if (storeData && storeData._doc) {
        let oldAntMediaStatus = storeData._doc.isAntMedia;
        let newAntMediaStatus = doc.isAntMedia;
        // condition set to true if Old status of site is Node Media and new Status is AntMedia
        if (newAntMediaStatus && !oldAntMediaStatus) {
          await updateAntMediaCameraStreamIds(doc);
        }
      }
    }
  }
  catch (ex) {
    logger.error(`Failed to generate new StreamIds on Ant Media server, error : ${ex}`);
  }
  next();
});

storeSchema.virtual('VirtualConnected').get(function () {
  var virtualConnected = this.lastConnectedOn
    ? moment.utc().diff(moment.utc(this.lastConnectedOn), 'seconds') < 60
    : false;
  return virtualConnected;
});

storeSchema.index({ status: 1, tags: 1, clientId: 1 });
const Store = mongoose.model('store', storeSchema, 'store');

updateAntMediaCameraStreamIds = async (storeData) => {
  let allCameras = await camera.find({ storeId: storeData._id });
  //Stream Ids to generate for (Low, High and AI (if AI cameraURL is added for camera))
  let streams = [{ streamName: "LOW", streamIdName: "lowStreamId" }, { streamName: "HIGH", streamIdName: "highStreamId" }];

  for (let i = 0; i < allCameras.length; i++) {
    const cameraRecord = allCameras[i];
    if (!util.isNull(cameraRecord.cameraAIUrl)) {
      streams.push({ streamName: "AI", streamIdName: "aiStreamId" });
    }
    for (let j = 0; j < streams.length; j++) {
      const stream = streams[j];
      //Updating stream Ids for all above 3 streams
      await checkAndUpdateStreamId(cameraRecord, stream, storeData);
    }
  }
}

checkAndUpdateStreamId = async (cameraRecord, currentStream, storeData) => {

  let mediaServerUrl = new URL(storeData.mediaServerUrl);
  let ami = new AntMediaAdapter(`https://xyz.${mediaServerUrl.hostname}:${storeData.mediaServerOutboundPort}`);
  let streamIdType = currentStream.streamIdName;
  let streamId = cameraRecord[streamIdType];

  // Check if stream Id is already present on AntMedia Server or not
  let streamResponse = await ami.load(streamId);
  //If StreamId is not available or not registered on AntMedia Server then get streamId
  if (!streamResponse.success) {
    let streamName = `${storeData.name}-${cameraRecord.name}`;
    let newStreamId = `${cameraRecord._id}-${currentStream.streamName}`;
    // Generating new Streamid for particular stream
    await ami.save({ name: `${streamName} - ${currentStream.streamName}`, streamId: newStreamId });
    //if get stream successfull then adding in object to do save in mongo DB
    await camera.findOneAndUpdate({ _id: cameraRecord._id }, { $set: { [streamIdType]: newStreamId } });
    // if (response.success) {
    //   await camera.findOneAndUpdate({ _id: cameraRecord._id }, { $set: { [streamIdType]: response.streamId } });
    // }
  }
}


module.exports = Store;
