const mongoose = require('mongoose');
const Schema = mongoose.Schema;

//RealwaveVideoClip schema
const RealwaveVideoClipSchema = new Schema({
    CamId: { type: Schema.Types.ObjectId, ref: 'camera' },
    StoreId: { type: Schema.Types.ObjectId, ref: 'store' },
    CreatedByUserId: { type: Schema.Types.ObjectId, ref: 'user' },
    IsVideoAvailable: { type: Boolean, default: false },
    IsProcessed: { type: Boolean, default: false },
    Status: { type: Number, default: 0 },
    Type: { type: Number, default: 0 },
    Description: { type: String },
    StartTime: { type: String },
    EndTime: { type: String },
    PreTime: { type: Number, default: 10 },
    PostTime: { type: Number, default: 10 },
    RecordingStreamId: { type: Number },
    PrimaryCameraId: { type: Number },
    TimezoneOffset: { type: String },
    RejectedReason: { type: String },
    AuditStatus : { type : String}
}, { timestamps: true });

module.exports = mongoose.model('realwaveVideoClip', RealwaveVideoClipSchema, "realwaveVideoClip");;