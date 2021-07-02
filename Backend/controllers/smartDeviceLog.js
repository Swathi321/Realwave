const restHandler = require('./restHandler')();
restHandler.setModelId('smartDeviceLog');
const smartDeviceLog = require('../modals/smartDeviceLog');
const common = require('./common');
const dashboard = require("./dashboard");
const util = require("../util/util");
/**
 * function to handle GET request to receive all the locations
 * @param {object} req 
 * @param {object} res 
 */
function getSmartDeviceLogs(req, res) {
	common.getListData(req, res, restHandler, dashboard, util, "storeId");
}

function getSmartDeviceLog(req, res) {
	common.getData(req, res, restHandler);
}

module.exports = { getSmartDeviceLogs, getSmartDeviceLog };
