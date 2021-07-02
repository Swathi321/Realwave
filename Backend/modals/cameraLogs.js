const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const cameraLogsSchema = new Schema({
    StoreId: { type: Schema.Types.ObjectId, ref: 'store' },
    CameraId: { type: Schema.Types.ObjectId, ref: 'camera' },
    CamLogDate: { type: Date },
    CamLogType: { type: String },
    CamLogDescription: { type: String },
    CamLogInformation : {type : String}
}, { timestamps: true });

const CameraLogModal = mongoose.model('cameraLogs', cameraLogsSchema, 'cameraLogs');
module.exports = CameraLogModal;