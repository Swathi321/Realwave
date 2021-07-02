const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const Payment = new Schema({
    InvPaid: { type: Number, default: null },
    PayMethod: { type: String, default: null },
});

const eventSchema = new Schema({
    EventId: { type: Number },
    EventTime: { type: Date },
    EventType: { type: String, default: 'Default' },
    InvoiceId: { type: Number },
    Register: { type: String },
    New: { type: Boolean, default: false },
    SubTotal: { type: Number, default: 0.0 },
    Tax: { type: Number, default: 0.0 },
    Total: { type: Number, default: 0.0 },
    Discount: { type: Number, default: 0.0 },
    Payment: [Payment],
    OperatorName: { type: String },
    Status: { type: String },
    AuditStatus: { type: String },
    IsVideoAvailable: { type: Boolean, default: false },
    CamId: { type: Schema.Types.ObjectId, ref: 'camera' },
    StoreId: { type: Schema.Types.ObjectId, ref: 'store' },
    CreatedByUserId: { type: Schema.Types.ObjectId, ref: 'user' },
    UserInfo: [],
    Category: [String],
    IsRejected: { type: Boolean, default: false },
    RejectedReason: { type: String, default: '' },
    Comment: {
        type: String
    },
    Rating: {
        type: Number
    },
    IsOverlayCreated: { type: Boolean, default: false },
    IsImageAvailable: { type: Boolean, default: false },
    DoorId: { type: Number, default: 0 },
    EventEndTime: { type: Date },
    IsVttAvailable: { type: Boolean, default: false }
}, { timestamps: true });

eventSchema.index({ EventTime: 1, Category: 1, EventType: 1, Status: 1, Total: 1, StoreId: 1, InvoiceId: 1, IsVideoAvailable: 1 });

module.exports = mongoose.model('event', eventSchema, 'event');