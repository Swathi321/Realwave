const restHandler = require('./restHandler')();
restHandler.setModelId('permission', ["name"], "Permission name already exists");
const permission = require('../modals/permission');
const common = require('./common');


/**
 * function to handle GET & POST request to receive all the Permissions
 * @param {object} req 
 * @param {object} res 
 */
function getPermissions(req, res) {
	switch (req.body.action) {
		case 'export':
			restHandler.getExportRecord(req, res);
			break;
		default:
			restHandler.getResources(req, res);
			break;
	}
}



/**
 * function to handle GET & POST request to create a the Permission
 * @param {object} req 
 * @param {object} res 
 */
function getPermission(req, res) {
	common.getData(req, res, restHandler);
}

module.exports = { getPermissions, getPermission };
