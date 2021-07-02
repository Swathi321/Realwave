const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// const healthSchema = new Schema({
//     Temperature: { type: Number },
//     LightIntensity: { type: Number },
//     IsDoorOpen: { type: Boolean },
//     BatteryLevel: { type: Number },
//     isLightOn: { type: Boolean }
// }, { timestamps: true });

// const doorSchema = new Schema({
//     DoorOpen: { type: Date },
//     DoorClose: { type: Date }
// }, { timestamps: true });

// const movementSchema = new Schema({
//     MovementType: { type: String },
//     StartTime: { type: Date },
//     EndTime: { type: Date }
// }, { timestamps: true });


const stockSchema = new Schema({
    Shelf: { type: Number },
    Position: { type: Number },
    ProductCode: { type: String }
}, { timestamps: true });

// const visionSchema = new Schema({
//     AssetId: { type: Number },
//     AssetSerialNumber: { type: String },
//     DeviceSerial: { type: String },
//     LocationCode: { type: String },
//     PlanogramName: { type: String },
//     PurityPercentage: { type: Number },
//     PlanogramCompliance: { type: Number },
//     StockPercentage: { type: Number },
//     ImageId: { type: Number },
//     CaptureTime: { type: Date },
//     Stocks: [stockSchema]
// }, { timestamps: true });

const smartDeviceLogSchema = new Schema({
    Id: { type: String },
    AssetSerialNumber: { type: String },
    DeviceSerial: { type: String },
    LocationCode: { type: String },
    EventTime: { type: Date },
    EventId: { type: Number },
    AssetId: { type: Number },
    RecordType: { type: String },
    Temperature: { type: Number },
    LightIntensity: { type: Number },
    IsDoorOpen: { type: Boolean },
    BatteryLevel: { type: Number },
    isLightOn: { type: Boolean },
    DoorOpen: { type: Date },
    DoorClose: { type: Date },
    MovementType: { type: String },
    StartTime: { type: Date },
    EndTime: { type: Date },
    PlanogramName: { type: String },
    PurityPercentage: { type: Number },
    PlanogramCompliance: { type: Number },
    StockPercentage: { type: Number },
    ImageId: { type: Number },
    CaptureTime: { type: Date },
    Stocks: [stockSchema],
    storeId: { type: Schema.Types.ObjectId, ref: 'store' },
    clientId: { type: Schema.Types.ObjectId, ref: 'client' },
}, { timestamps: true });

const SmartDeviceLog = mongoose.model('smartDeviceLog', smartDeviceLogSchema, 'smartDeviceLog');
module.exports = SmartDeviceLog;