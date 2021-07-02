const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// Create Schema for Dashboard Configurations
const dashboardConfigSchema = new Schema({
	userId: { type: Schema.Types.ObjectId, ref: 'user', required: true },
  layout: {}
}, { timestamps: true });

//create a model (mongo will create collection with 'User' add s)
const DashboardConfig = mongoose.model('dashboardConfig', dashboardConfigSchema, 'dashboardConfig');
//Export the model
module.exports = DashboardConfig;