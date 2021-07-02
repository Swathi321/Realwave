const restHandler = require('./restHandler')();
restHandler.setModelId('preference');
var mongoose = require("mongoose");
var PreferenceModal = require('./../modals/preference');
const util = require("../util/util");

String.prototype.toObjectId = function () {
	var ObjectId = (require('mongoose').Types.ObjectId);
	return ObjectId(this.toString());
};

/**
 * function to handle all GET/POST request for preferences.
 * @param {object} req 
 * @param {object} res 
 */
function handleAction(req, res) {
	switch (req.body.action) {
		case 'load':
			getPreferenceByUser(req, res);
			break;
		case 'save':
			savePreference(req, res);
			break;
		case 'delete':
			let params = Object.assign({}, req.body, req.query, req.params);
			req.params = params;
			restHandler.deleteResource(req, res)
			break;
		default:
			res.status(403).json({ success: false, message: "Invalid request." });
			break;
	}
}

/**
 * function to handle GET/POST request to create/update preference data for requested user.
 * @param {object} req 
 * @param {object} res 
 */
function savePreference(req, res) {
	var params = Object.assign({}, req.body, req.query, req.params);
	let { id, data } = params,
		userId = util.mongooseObjectId(req.session.user._id);

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
}

/**
 * function to handle GET/POST request to get preference data for requested user.
 * @param {object} req 
 * @param {object} res 
 */
function getPreferenceByUser(req, res) {
	userId = req.session.user._id;
	var userModal = mongoose.model("user");

	// Get user details.
	userModal.findOne({ _id: mongoose.Types.ObjectId(userId) }, (err, user) => {
		let response = { success: false, message: "" };
		if (err) {
			response.message = err.message;
			res.json(response);
			return;
		}
		if (!user) {
			response.message = "User does not found.";
			res.json(response);
			return;
		}
		PreferenceModal.findOne({ userId: user._id }, (err, preference) => {
			if (err) {
				response.message = err.message;
				res.json(response);
				return;
			}
			if (!preference) {
				res.json(response);
				return;
			}
			response.success = true;
			response.data = preference;
			res.json(response);
		});
	});
}

module.exports = { handleAction };