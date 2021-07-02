const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const aggregatedSchema = new Schema({
    site_id: { type: Schema.Types.ObjectId, ref: 'store' },

    KIOSK : [{
        wait_time:{ type: String },
        service_time:{ type:String }
    }],
    BAG_DROP : [{
        wait_time:{ type: String },
        service_time:{ type: String }
    }],
    FULL_SERVICE : [{
        wait_time:{ type: String },
        service_time:{type: String }
    }],
    SELF_SERVICE : [{
        wait_time :{ type: String },
        service_time :{ type: String}
    }],
    AGENTS : [{
        counter1 :{ type: Number },
        counter2 :{ type: Number },
        counter3 :{ type: Number },
        counter4 :{ type: Number },
        counter5 :{ type: Number },
        counter6 :{ type: Number },
        counter7 :{ type: Number },
        counter8 :{ type: Number },
        counter9 :{ type: Number },
        counter10:{ type: Number },
        counter11:{ type: Number },
        counter12:{ type: Number },
        counter13:{ type: Number },
        counter14:{ type: Number },
        counter15:{ type: Number },
        counter16:{ type: Number }
    }],
    CUSTOMER_PROCESSED_LH : [{
        counter1 :{ type: Number },
        counter2 :{ type: Number },
        counter3 :{ type: Number },
        counter4 :{ type: Number },
        counter5 :{ type: Number },
        counter6 :{ type: Number },
        counter7 :{ type: Number },
        counter8 :{ type: Number },
        counter9 :{ type: Number },
        counter10 :{ type: Number },
        counter11 :{ type: Number },
        counter12 :{ type: Number },
        counuter13 :{ type: Number },
        counter14 :{ type: Number },
        counter15 :{ type: Number },
        counter16 :{ type: Number }
    }],
    ACTIVE_CAMERAS :{ type: Number},
    ACTIVE_SITES :{ type: Number},
}, {timestamps:true });
const Aggregated = mongoose.model('aggregated', aggregatedSchema,'aggregated');
module.exports = Aggregated;