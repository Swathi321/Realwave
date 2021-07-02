const restHandler = require('./restHandler')();
restHandler.setModelId('deviceConnectivityLog');
const deviceConnectivityLog = require('../modals/DeviceConnectivityLog');
const common = require('./common');
/**
 * function to handle GET request to receive all the locations
 * @param {object} req 
 * @param {object} res 
 */
function getDeviceConnectivities(req, res) {
	switch (req.body.action) {
		case 'export':
			restHandler.getExportRecord(req, res);
			break;
		default:
			restHandler.getResources(req, res);
			break;
	}
}

function getDeviceConnectivity(req, res) {
	common.getData(req, res, restHandler);
}

module.exports = { getDeviceConnectivities, getDeviceConnectivity };
