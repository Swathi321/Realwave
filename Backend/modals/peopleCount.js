const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const peopleCountSchema = new Schema({
    StoreId: { type: Schema.Types.ObjectId, ref: 'store' },
    CameraId: { type: Schema.Types.ObjectId, ref: 'camera' },
    PeopleCountDate: { type: Date },
    InCount: { type: Number },
    OutCount: { type: Number }
}, { timestamps: true });

const PeopleCountModal = mongoose.model('peopleCount', peopleCountSchema, 'peopleCount');
module.exports = PeopleCountModal;