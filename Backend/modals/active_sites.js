const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const active_sitesSchema = new Schema({
    ACTIVE_CAMERAS:{ type: Number}
}
);
const Active_sites = mongoose.model('active_sites', active_sitesSchema, 'active_sites');
module.exports = Active_sites;