const mongoose = require('mongoose');
const Schema = mongoose.Schema;

//Receipt schema
const receiptSchema = new Schema({
  InvoiceId: { type: Number },
  SeqNo: { type: Number },
  Register: { type: Number },
  Cashier: { type: String },
  OrderNumber: { type: Number },
  EventTime: { type: Date },
  EventType: { type: String, default: 'Default' },
  ItemNumber: { type: Number },
  ItemId: { type: String },
  Modifier1Id: { type: Number },
  Modifier2Id: { type: Number },
  Modifier3Id: { type: Number },
  ItemType: { type: String },
  Description: { type: String },
  UnitPrice: { type: Number },
  ExtendedPrice: { type: Number },
  Quantity: { type: Number },
  AgeMinimum: { type: Number },
  Amount: { type: Number },
  TaxAmount: { type: Number },
  TransactionCompletionType: { type: String },
  MOPDescription: { type: String },
  MOPId: { type: Number },
  EventId: { type: Number },
  TerminalNumber: { type: Number },
  TransactionNumber: { type: Number },
  TransactionType: { type: String },
  DrawerOpenReasonType: { type: String },
  CashDrawerId: { type: Number },
  OperatorId: { type: Number },
  OperatorName: { type: String },
  OperatorShiftNumber: { type: String },
  BusinessDate: { type: Date },
  NewQuantity: { type: Number },
  Status: { type: String },
  AuditStatus: { type: String },
  IsVideoAvailable: { type: Boolean, default: false },
  VerificationType: { type: String },
  VerifiedAge: { type: Number },
  CamId: { type: Schema.Types.ObjectId, ref: 'camera' },
  StoreId: { type: Schema.Types.ObjectId, ref: 'store' },
  UserInfo: [],
}, { timestamps: true });

//create a model (mongo will create collection with 'Receipt' add s)
const Receipt = mongoose.model('receipt', receiptSchema, "receipt");

//Export the model
module.exports = Receipt;