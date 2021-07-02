const restHandler = require('./restHandler')();
restHandler.setModelId('alarm');
const alarm = require('../modals/Alarm');
var User = require("../modals/user");
const AlarmComments = require('../modals/AlarmComments');
const dashboard = require("./dashboard");
const common = require('./common');
const util = require("../util/util");
const logger = require('../util/logger');
/**
 * function to handle GET request to receive all the locations
 * @param {object} req 
 * @param {object} res 
 */
function getAlarms(req, res) {
	common.getListData(req, res, restHandler, dashboard, util, "storeId");
}

function saveAlarm(data) {
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
			// console.log("send")
		},
		json: function () {
			// console.log("json")
		}
	}

	alarm.findOne({ storeId: data.storeId, type: data.type, closedOn: null }, {}, {}, function (err, modelData) {
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

function getAlarmCommentList(req, res) {
	var params = Object.assign({}, req.body, req.query);
	AlarmComments.find({ alarmId: params.alarmId })
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


function addAlarmComment(req, res, next) {
	common.addComment(req, res, AlarmComments, alarm, "alarmId");
}

function updateAlarm(req, res, next) {
	let params = Object.assign({}, req.body, req.query);
	let paramsData = JSON.parse(params.data);
	alarm.findOneAndUpdate(
		{ _id: paramsData.id },
		{ $set: { auditStatus: paramsData.auditStatus } },
		{ new: false },
		(err, doc) => {
			let resp = {};
			if (err) {
				resp["success"] = false;
				resp["error"] = error;
				res.status(200).json(resp);
				return;
			}
			resp["success"] = true;
			resp["message"] = "Receipt have been successfully updated.";
			res.status(200).json(resp);
		}
	);
}

function getAlarm(req, res) {
	common.getData(req, res, restHandler);
}

module.exports = { getAlarms, getAlarm, saveAlarm, getAlarmCommentList, addAlarmComment, updateAlarm };
