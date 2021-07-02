const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const Payment = new Schema({
    InvPaid: { type: Number, default: null },
    PayMethod: { type: String, default: null },
});

const EventDetailSchema = new Schema({
    EventId: { type: Schema.Types.ObjectId, ref: 'event' },
    InvoiceId: { type: Number },
    ItemId: { type: Number },
    Upc: { type: String },
    Name: { type: String },
    Size: { type: String },
    Category: { type: String },
    Price: { type: Number },
    RegPrice: { type: Number },
    Qty: { type: Number },
    Total: { type: Number },
    Cost: { type: Number },
    Discount: { type: Number },
    LineId: { type: Number },
    StoreId: { type: Schema.Types.ObjectId, ref: 'store' },
    CamId: { type: Schema.Types.ObjectId, ref: 'camera' },
    IsVideoAvailable: { type: Boolean, default: false },
    EventTime: { type: Date },
    EventType: { type: String, default: 'Default' },
    Register: { type: Number },
    SubTotal: { type: Number, default: 0.0 },
    Tax: { type: Number, default: 0.0 },
    Payment: [Payment],
    OperatorName: { type: String },
    Status: { type: String },
    AuditStatus: { type: String },
    StoreName: { type: String },
    CamName: { type: String },
    PrimaryId: { type: String },
    InvoiceTotal: { type: Number, default: 0.0 },
    InvoiceDiscount: { type: Number, default: 0.0 },
    Category: [String]
}, { timestamps: true });

EventDetailSchema.index({StoreId : 1 , ItemId : 1, InvoiceId  :1});

module.exports = mongoose.model('eventDetail', EventDetailSchema, 'eventDetail');