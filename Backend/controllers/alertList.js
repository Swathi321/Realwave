const restHandler = require('./restHandler')();
restHandler.setModelId('alert');
const alert = require('../modals/Alerts');
var User = require("./../modals/user");
const AlertComments = require('../modals/AlertComments');
const dashboard = require("./dashboard");
const common = require('./common');
const util = require("../util/util");
const logger = require('../util/logger');
/**
 * function to handle GET request to receive all the locations
 * @param {object} req 
 * @param {object} res 
 */
function getAlerts(req, res) {
	common.getListData(req, res, restHandler, dashboard, util, "storeId");
}


function saveAlert(data) {
	let req = {
		body: {
			data: JSON.stringify(data)
		},
		params: {
			id: 0
		}
	}
	let res = {
		send: function () {
		},
		json: function () {
		}
	}

	alert.findOne({ storeId: data.storeId, type: data.type, closedOn: null }, {}, {}, function (err, modelData) {
		if (err) {
			logger.error(err)
		} else {
			if (modelData) {
				req.params.id = modelData._id.toString();
				restHandler.updateResource(req, res);
			} else {
				if (data.status == "Open") {
					restHandler.insertResource(req, res);
				}
			}
		}
	})
}

function getAlertCommentList(req, res) {
	var params = Object.assign({}, req.body, req.query);
	AlertComments.find({ alertId: params.alertId })
		.sort({ _id: -1 })
		.populate("userId", User)
		.then(result => {
			res.status(200).json({
				success: true,
				data: result,
				recordCount: result.length
			});
		})
		.catch(err => {
			res.status(404).json({
				success: false,
				message: err.message
			});
		});
}


function addAlertComment(req, res, next) {
	common.addComment(req, res, AlertComments, alert, "alertId");
}

function getAlert(req, res) {
	common.getData(req, res, restHandler);
}

module.exports = { getAlerts, getAlert, saveAlert, getAlertCommentList, addAlertComment };
