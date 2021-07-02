const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const alarmEndpointSchema = new Schema(
    {
        alarmStatus: { type: String },
        storeId: { type: Schema.Types.ObjectId, ref: 'store' },
        alarmTriggerTime: { type: Date },
        alarmDeactivatedTime: { type: Date }
    },
    { timestamps: true }
);
;
const AlarmEndPoint = mongoose.model('AlarmEndpointInsert', alarmEndpointSchema, 'AlarmEndpointInsert');
module.exports = AlarmEndPoint;
