const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const alarmTestSchema = new Schema(
  {
    status: { type: String},
    storeId: { type: Schema.Types.ObjectId, ref: 'store' },
  },
  { timestamps: true }
);
;
const AlarmTest = mongoose.model('alarmTest', alarmTestSchema, 'alarmTest');
module.exports = AlarmTest;
