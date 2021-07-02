const restHandler = require('./restHandler')();
restHandler.setModelId('dashboardConfig');
const DashboardConfigModal = require('../modals/DashboardConfig');
const decodeToken = require('../authentication/decodeToken');

String.prototype.toObjectId = function () {
	var ObjectId = (require('mongoose').Types.ObjectId);
	return ObjectId(this.toString());
};

/**
 * function to handle all GET/POST request for dashboardConfigs.
 * @param {object} req 
 * @param {object} res 
 */
function handleAction(req, res) {
	switch (req.body.action) {
		case 'load':
			getDashboardConfigByUser(req, res);
			break;
		case 'save':
			saveDashboardConfig(req, res);
			break;
		default:
			res.status(403).json({ success: false, message: "Invalid request." });
			break;
	}
}

/**
 * function to handle GET/POST request to create/update dashboardConfig data for requested user.
 * @param {object} req 
 * @param {object} res 
 */
function saveDashboardConfig(req, res) {
	let response = { success: false, message: "" };
	let params = Object.assign({}, req.body, req.query, req.params);
	if (req.cookies.rwave) {
		let userId = decodeToken(req.cookies.rwave)[0];
		let { id, data } = params;

		if (data) {
			data = JSON.parse(data);
			data.userId = userId;
			req.body.data = JSON.stringify(data);
		}

		if (id) {
			restHandler.updateResource(req, res);
		}
		else {
			restHandler.insertResource(req, res);
		}
	} else {
		response.error = "You can't access this page directly without login.";
		res.json(response);
	}
}

/**
 * function to handle GET/POST request to get dashboardConfig data for requested user.
 * @param {object} req 
 * @param {object} res 
 */
function getDashboardConfigByUser(req, res) {
	let response = { success: false, message: '' };
	if (req.cookies.rwave) {
		let userId = decodeToken(req.cookies.rwave)[0];

		// Get user details.
		DashboardConfigModal.findOne({ userId: userId }, (err, dashboardConfig) => {
			if (err) {
				response.message = err.message;
				res.json(response);
				return;
			}
			if (!dashboardConfig) {
				res.json(response);
				return;
			}
			response.success = true;
			response.data = dashboardConfig;
			res.json(response);
		});
	} else {
		response.error = "You can't access this page directly without login.";
		res.json(response);
	}
}

module.exports = { handleAction };