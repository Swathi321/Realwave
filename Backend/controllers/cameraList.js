const restHandler = require('./restHandler')();
restHandler.setModelId('camera');
const camera = require('../modals/camera');
const webSocket = require("../plugin/Socket");
const storeModel = require("./../modals/store");
const logger = require('./../util/logger');
const PTZConfig = require('./../config/PTZConfig');
var util = require('./../util/util');
const AntMediaAdapter = require('./../util/AntMediaAdapter');
const { guid } = require('./../util/util');
const common = require('./common');
const { LIVE_STREAM_CONFIG } = require('./../util/enum');
const Camera = require('../modals/camera');
const ReverseSSH = require('./../util/ReverseSSH');
const DaemonSocket = require('./../plugin/DaemonSocket');
const moment = require('moment');

String.prototype.toObjectId = function () {
	var ObjectId = (require('mongoose').Types.ObjectId);
	return ObjectId(this.toString());
};

/**
 * function to handle GET request to receive all the locations
 * @param {object} req 
 * @param {object} res 
 */
function getCameras(req, res) {
	switch (req.body.action) {
		case 'export':
			restHandler.getExportRecord(req, res);
			break;
		case 'get':
			let defaultFilter = [];
			if (req.body.covert == 'false') {
				defaultFilter.push({
					$and: [{ covertCamera: false }],
				});
			}

			restHandler.getResources(req, res, null, false, defaultFilter);
			break;
		default:
			restHandler.getResources(req, res);
			break;
	}
}

function populateCameras(req, res) {
	var bulk = camera.collection.initializeUnorderedBulkOp();
	camera.find({
		storeId: {
			$exists: false
		}
	}, {}, {}, function (err, results) {
		if (!err) {
			if (results) {
				results.map(function (rec, index) {
					if (rec.siteId && !rec.storeId) {
						rec.storeId = rec.siteId.storeId
						bulk.find({ _id: rec._id }).upsert().updateOne({ $set: rec });
					}
				});
				if (bulk.length > 0) {
					bulk.execute().then(function (data) {
						res.json({ message: "Record updated successfully.", data: data });
					});
				} else {
					res.json({ message: "Record updated successfully.", data: [] });
				}
			}

		}
	}).populate("siteId").lean();
}

const antMediaAdapterIntance = async (storeId) => {
	let storeData = await storeModel.findOne({ _id: storeId });
	let mediaServerUrl = new URL(storeData.mediaServerUrl);
	return {
		ami: new AntMediaAdapter(`https://xyz.${mediaServerUrl.hostname}:${storeData.mediaServerOutboundPort}`),
		store: storeData,
		mediaServerUrl: mediaServerUrl
	}
}

const onActionComplete = async (err, respData, req) => {
	if (!err) {
		let params = Object.assign({}, req.params, req.body),
			data = JSON.parse(params.data);
		let ama = await antMediaAdapterIntance(data.storeId);
		let options = {
			action: 'videoRecordStatus',
			data: {
				action: params.action,
				camId: respData.id,
				cameraRTSPUrl: data.cameraRTSPUrl,
				cameraThumbnailRTSPUrl: data.cameraThumbnailRTSPUrl,
				storeId: data.storeId,
				recordTimeLimit: data.recordTimeLimit,
				isRecordingStarted: ama.store.isNvr ? false : respData.isRecordingStarted,
				protocolType: respData.protocolType,
				status: respData.status,
				cameraBrand: respData.cameraBrand,
				httpPort: respData.httpPort,
				smartDevices: respData.smartDevices,
				cameraAIUrl: respData.cameraAIUrl,
				primaryStreamId: respData.primaryStreamId,
				secondaryStreamId: respData.secondaryStreamId
			}
		}
		webSocket.Send(options);

		let storeData = await storeModel.findOne({ _id: data.storeId });
		let response = {};
		let lowStreamId, highStreamId, aiStreamId;
		let streamName = `${ama.store.name} - ${data.name}`;

		try {
			switch (params.action) {
				case "save":
					if (storeData.isAntMedia) {
						response = await ama.ami.save({ name: `${streamName} - LOW`, streamId: `${respData.id}-LOW` });
						if (response.success) {
							lowStreamId = response.streamId;
						} else {
							logger.error(`AntMediaServer API Error: ${streamName}`);
						}
						response = await ama.ami.save({ name: `${streamName} - HIGH`, streamId: `${respData.id}-HIGH` });
						if (response.success) {
							highStreamId = response.streamId;
						} else {
							logger.error(`AntMediaServer API Error: ${streamName}`);
						}
						response = await ama.ami.save({ name: `${streamName} - AI`, streamId: `${respData.id}-AI` });
						if (response.success) {
							aiStreamId = response.streamId;
						} else {
							logger.error(`AntMediaServer API Error: ${streamName}`);
						}
					} else {
						lowStreamId = await guid(true);
						highStreamId = await guid(true);
						aiStreamId = await guid(true);
					}
					await camera.updateOne({ _id: respData.id }, { $set: { lowStreamId: lowStreamId, highStreamId: highStreamId, aiStreamId: aiStreamId } });
					break;

				case "update":
					let newStreamIDs = {};
					let updateStreams = false;
					if (storeData.isAntMedia) {
						if (util.isNull(respData.lowStreamId)) {
							response = await ama.ami.save({ name: `${streamName} - LOW`, streamId: `${respData.id}-LOW` });
							if (response.success) {
								updateStreams = true;
								newStreamIDs.lowStreamId = response.streamId;
							} else {
								logger.error(`AntMediaServer API Error: ${streamName}`);
							}
						}

						if (util.isNull(respData.highStreamId)) {
							response = await ama.ami.save({ name: `${streamName} - HIGH`, streamId: `${respData.id}-HIGH` });
							if (response.success) {
								updateStreams = true;
								newStreamIDs.highStreamId = response.streamId;
							} else {
								logger.error(`AntMediaServer API Error: ${streamName}`);
							}
						}

						if (util.isNull(respData.aiStreamId)) {
							response = await ama.ami.save({ name: `${streamName} - AI`, streamId: `${respData.id}-AI` });
							if (response.success) {
								updateStreams = true;
								newStreamIDs.aiStreamId = response.streamId;
							} else {
								logger.error(`AntMediaServer API Error: ${streamName}`);
							}
						}
					} else {
						if (util.isNull(respData.lowStreamId)) {
							updateStreams = true;
							newStreamIDs.lowStreamId = await guid(true);
						}
						if (util.isNull(respData.highStreamId)) {
							updateStreams = true;
							newStreamIDs.highStreamId = await guid(true);
						}
						if (util.isNull(respData.aiStreamId)) {
							updateStreams = true;
							newStreamIDs.aiStreamId = await guid(true);
						}
					}
					if (updateStreams) {
						await camera.updateOne({ _id: respData.id }, { $set: newStreamIDs });
					}
					break;
			}

			if (!response.success) {
				logger.error(`AntMediaServer API Error: ${streamName}`, response.message);
			}
		} catch (ex) {
			logger.error(`AntMediaServer API Error: ${streamName}`, response.message);
		}

		util.storeCamInfo(data.storeId).then((camData) => {
			webSocket.Send({
				action: "AllCamData",
				data: {
					storeId: data.storeId,
					camData: camData
				}
			})
		});
	}
}


/**
 * @desc function to validate the camera registers
 * @param {object} req client request object data 
 * @return {object} return validate response object. 
 */
function validate(req) {
	const params = Object.assign({}, req.params, req.body);
	const { storeId, register } = JSON.parse(params.data);
	return new Promise(function (resolve, reject) {
		let filter = {
			storeId: storeId.toObjectId(),
			register: Number(register)
		}
		if (params.action === 'update') {
			filter._id = { $ne: params.id.toObjectId() }
		}
		camera.find(filter, function (err, camData) {
			let response = { success: true, message: '', data: null };
			if (err) {
				response.success = false;
				response.message = err.message;
				resolve(response);
			}
			if (camData && camData.length > 0) {
				response.success = false;
				response.message = `Register number '${register}' is already mapped with other camera`;
			}
			resolve(response);
		});
	});
}

const onLoad = (data, res) => {
	let tempData = JSON.parse(JSON.stringify(data));
	tempData = util.updateCamerasPublishUrls([tempData]);
	res.json(tempData[0]);
}

const getCamera = async (req, res) => {
	switch (req.body.action) {
		case 'load':
			restHandler.getResource(req, res, onLoad);
			break;
		case 'update':
			validate(req).then(function (resp) {
				if (resp.success) {
					restHandler.updateResource(req, res, onActionComplete);
					return;
				}
				res.json(resp);
			})
			break;
		case 'save':
			validate(req).then(function (resp) {
				if (resp.success) {
					restHandler.insertResource(req, res, onActionComplete);
					return;
				}
				res.json(resp);
			});
			break;
		case 'delete':
			let camRecord = await camera.findOne({ _id: req.params.id });
			let ama = await antMediaAdapterIntance(camRecord.storeId);

			if (camRecord.lowStreamId) { await ama.ami.delete(camRecord.lowStreamId); }
			if (camRecord.highStreamId) { await ama.ami.delete(camRecord.highStreamId); }
			if (camRecord.aiStreamId) { await ama.ami.delete(camRecord.aiStreamId); }
			restHandler.deleteResource(req, res);
			break;
		default:
			restHandler.getResource(req, res);
			break;
	}
}

/**
 * function to handle Camera PTZ request to Onsite server
 * @param {object} req 
 * @param {object} res 
 */
let ptzRequest = (req, res) => {
	const params = Object.assign({}, req.params, req.body);
	let response = { sucess: true };
	camera.findOne({ _id: params.camId.toObjectId() }, (err, camData) => {
		if (camData._doc && camData._doc.cameraBrand && camData._doc.cameraBrand.name) {
			let cameraBrand = camData._doc.cameraBrand.name;
			let info = getPTZUrl({ ...camData, ...params, cameraBrand: cameraBrand });
			if (info) {
				info.cameraBrand = cameraBrand;
				let option = {
					action: "ptzCommand",
					data: Object.assign({ storeId: params.storeId, }, info)
				}
				webSocket.SendToOnSite(option);
				if (info.StopCommand) {
					let stopInfo = { username: info.username, password: info.password, url: info.StopCommand, cameraBrand: cameraBrand }
					let stopCommandOption = {
						action: "ptzCommand",
						data: Object.assign({ storeId: params.storeId, }, stopInfo)
					}
					setTimeout(() => webSocket.SendToOnSite(stopCommandOption), 1000);
				}
			}
			else {
				response.sucess = false;
				response.message = "Unable to construct PTZ Url";
				logger.debug("Error while contstucting PTZ URL for Cam : " + JSON.stringify(camData._doc));
			}
		}
	}).populate({ path: 'cameraBrand', select: ["name"] });
	res.json(response);
};


let urlInfo = function (doc) {
	let src = doc.cameraRTSPUrl;
	let httpPort = doc.httpPort || 80;
	let uri = new URL(src), username = null, password = null;
	if (uri.href.indexOf('@') > -1) {
		try {
			let rawUrl = uri.href.split("@");
			rawUrl = rawUrl[0];
			rawUrl = rawUrl.split("//");
			rawUrl = rawUrl[1];
			rawUrl = rawUrl.split(":");
			username = rawUrl[0];
			password = rawUrl[1];
		} catch (ex) {
			logger.error(`PTZ Url Info ERROR: ${ex.message}`);
		}
	}
	return {
		url: `http://${uri.hostname}:${httpPort}`,
		username: username,
		password: password
	}
}

let getPTZUrl = (options) => {
	let toreturn = null
	let config = PTZConfig.templates.find(e => (e.brand).toLocaleUpperCase() === (options.cameraBrand).toLocaleUpperCase()), url = '';
	if (config) {
		let rawCamUrl = urlInfo(options._doc);
		if (options.cameraBrand == "Hanwha") {
			let camURLConfig = rawCamUrl.url.split(":");
			if (camURLConfig && camURLConfig.length == 3) {
				rawCamUrl.url = camURLConfig[0] + ":" + camURLConfig[1] + ":" + config.PTZPort;
			}

		}

		url = config.commandUrl;
		url = url.replace('{action}', config.actions[options.action]);
		url = url.replace('{url}', rawCamUrl.url);
		logger.info(`PTZ Control URL: ${url}`);
		toreturn = { url: url, username: rawCamUrl.username, password: rawCamUrl.password }
		if (options.cameraBrand == "Hanwha") {
			if (options.action != "HOME") {
				toreturn.StopCommand = config.stopCommandURL;
				toreturn.StopCommand = toreturn.StopCommand.replace('{url}', rawCamUrl.url);
			}
			else {
				url = config.homeCommandURL;
				url = url.replace('{url}', rawCamUrl.url);
				toreturn.url = url;
			}

		}

	}
	return toreturn;
}

const updateStreamAnt = async (req, res) => {
	let camRecord = await camera.find({
		highStreamId: null,
		lowStreamId: null
	});
	let finalResponse = { success: true, message: '', record: [] };
	let proceedRecord = [];

	for (let index = 0, len = camRecord.length; index < len; index++) {
		const record = camRecord[index];

		if (record.lowStreamId && record.lowStreamId.length > 0) {
			//skipping if already defined
			continue;
		}

		const mediaServerUrl = "https://testant.spraxa.com:5443";
		let antMediaAdapter = new AntMediaAdapter(mediaServerUrl);

		let storeRecord = await storeModel.findOne({ _id: record.storeId });

		if (storeRecord) {

			let response = {};
			let lowStreamId, highStreamId;
			let streamName = `${storeRecord.name} - ${record.name}`;

			try {
				response = await antMediaAdapter.save({ name: `${streamName} - LOW` });
				if (response.success) {
					lowStreamId = response.streamId;
				} else {
					logger.error(`AntMediaServer API Error: ${streamName}`);
				}
				response = await antMediaAdapter.save({ name: `${streamName} - HIGH` });
				if (response.success) {
					highStreamId = response.streamId;
				} else {
					logger.error(`AntMediaServer API Error: ${streamName}`);
				}
				logger.debug({ lowStreamId: lowStreamId, highStreamId: highStreamId });
				proceedRecord.push({
					camId: record._id,
					lowStreamId: lowStreamId,
					highStreamId: highStreamId
				});
				await camera.updateOne({ _id: record._id }, { $set: { lowStreamId: lowStreamId, highStreamId: highStreamId } });
			} catch (ex) {
				finalResponse.message = ex.message;
				finalResponse.success = false;
			}
		} else {
			logger.info("We can delete those camera record which not have store they assigned");
		}
	}
	finalResponse.record = proceedRecord;
	res.json(finalResponse);
}
const updateStreamNMS = async (req, res) => {
	let camRecord = await camera.find({
		highStreamId: null,
		lowStreamId: null
	});
	let finalResponse = { success: true, message: '', record: [] };
	let proceedRecord = [];

	for (let index = 0, len = camRecord.length; index < len; index++) {
		const record = camRecord[index];

		if (record.lowStreamId && record.lowStreamId.length > 0) {
			//skipping if already defined
			continue;
		}

		let storeRecord = await storeModel.findOne({ _id: record.storeId });

		if (storeRecord) {
			try {
				let lowStreamId = await guid(true),
					highStreamId = await guid(true);

				await camera.updateOne({ _id: record._id }, { $set: { lowStreamId: lowStreamId, highStreamId: highStreamId } });

				proceedRecord.push({
					camId: record._id,
					lowStreamId: lowStreamId,
					highStreamId: highStreamId
				});
			} catch (ex) {
				finalResponse.message = ex.message;
				finalResponse.success = false;
			}
		} else {
			logger.info("We can delete those camera record which not have store they assigned");
		}
	}
	finalResponse.record = proceedRecord;
	res.json(finalResponse);
}

const StreamStatus = async (req, res) => {
	const { cameraId, streamId, storeId, token } = Object.assign({}, req.params, req.body, req.query);
	let lowStreamCount = 0, highStreamCount = 0;
	let response = { success: true, message: '', data: false, highStreamCount: 0, lowStreamCount: 0, viewCount: 0 };
	let isAuthenticated = await common.isAuthenticated(token, storeId, res);
	if (!isAuthenticated) {
		response.message = "Invalid request";
		return res.json(response);
	}
	let antMedia;
	let streamResponse;
	let mediaServerUrl;
	let apiResponse;
	let count = 0;

	try {
		if (streamId) {
			antMedia = await antMediaAdapterIntance(storeId);
			if (antMedia.store.isAntMedia) {
				streamResponse = await antMedia.ami.load(streamId);
				if (streamResponse.success) {
					const { hlsViewerCount, webRTCViewerCount, rtmpViewerCount } = streamResponse;
					response.viewCount += hlsViewerCount + webRTCViewerCount + rtmpViewerCount;
					if (response.viewCount == 0) {
						await antMedia.ami.stop(streamId);
					}
				} else {
					response.success = false;
					logger.error(`Stream Record Error: ${streamResponse}`);
				}
			} else {
				mediaServerUrl = antMedia.mediaServerUrl;
				apiResponse = await AntMediaAdapter.apiRequest({
					url: `https://xyz.${mediaServerUrl.hostname}:${antMedia.store.mediaServerOutboundPort}/api/streams`,
					rejectUnauthorized: false,
					json: true,
					method: 'GET',
					headers: {
						'Content-Type': 'application/json'
					}
				});
				if (apiResponse.success) {
					response.success = true;
					let stremInfo = apiResponse.LiveApp[streamId];
					if (stremInfo) {
						response.viewCount = stremInfo.subscribers.length;
					} else {
						response.viewCount = 0;
					}
				} else {
					response.success = false;
					logger.error(`Stream Record Error: ${apiResponse}`);
				}
			}
		} else {
			let record = await camera.findOne({ _id: cameraId }).populate('storeId');
			if (record) {
				if (record.storeId.isAntMedia) {
					antMedia = await antMediaAdapterIntance(record.storeId.id);
					let lowStreamRecord = await antMedia.ami.load(record.lowStreamId);
					let highStreamRecord = await antMedia.ami.load(record.highStreamId);
					logger.debug(lowStreamRecord);
					logger.debug(highStreamRecord);

					if (lowStreamRecord.success) {
						const { hlsViewerCount, webRTCViewerCount, rtmpViewerCount } = lowStreamRecord;
						count = hlsViewerCount + webRTCViewerCount + rtmpViewerCount;
						response.viewCount += count;
						response.lowStreamCount = count;
						if (response.lowStreamCount == 0 && antMedia.store.siteStreamConfig !== LIVE_STREAM_CONFIG.LowStreamOnly) {
							await antMedia.ami.stop(record.lowStreamId);
						}
					} else {
						response.viewCount = 0;
						await antMedia.ami.stop(record.lowStreamId);
						logger.error(`Low Stream Record Error: ${lowStreamRecord.message} StreamId: ${record.lowStreamId}`);
					}

					if (highStreamRecord.success) {
						const { hlsViewerCount, webRTCViewerCount, rtmpViewerCount } = highStreamRecord;
						count = hlsViewerCount + webRTCViewerCount + rtmpViewerCount;
						response.viewCount += count;
						response.highStreamCount = count;
						if (response.highStreamCount == 0 && antMedia.store.siteStreamConfig !== LIVE_STREAM_CONFIG.LowHighAlways) {
							await antMedia.ami.stop(record.highStreamId);
						}
					} else {
						response.viewCount = 0;
						await antMedia.ami.stop(record.highStreamId);
						logger.error(`High Stream Record Error: ${highStreamRecord.message} StreamId: ${record.lowStreamId}`);
					}
				} else {
					mediaServerUrl = new URL(record.storeId.mediaServerUrl);
					apiResponse = await AntMediaAdapter.apiRequest({
						url: `https://xyz.${mediaServerUrl.hostname}:${record.storeId.mediaServerOutboundPort}/api/streams`,
						rejectUnauthorized: false,
						json: true,
						method: 'GET',
						headers: {
							'Content-Type': 'application/json'
						}
					});
					if (apiResponse.success) {
						response.success = true;
						let lowStreamInfo = apiResponse.LiveApp[record.lowStreamId];
						let highStreamInfo = apiResponse.LiveApp[record.highStreamId];

						if (lowStreamInfo) {
							response.lowStreamCount = lowStreamInfo.subscribers.length;
						}
						if (highStreamInfo) {
							response.highStreamCount = highStreamInfo.subscribers.length;
						}
						response.viewCount = lowStreamCount + highStreamCount;
					} else {
						logger.error(`Stream Record Error: ${apiResponse}`);
					}
				}
			} else {
				response.success = false;
				response.message = "Camera not found";
			}
		}
	} catch (ex) {
		response.success = false;
		response.message = ex.message;
		logger.error(`StreamStatus: ${ex.message}`);
	}
	res.json(response);
}

const startStream = async (req, res) => {
	const params = Object.assign({}, req.params, req.body, req.query);
	try {
		let options = {
			action: 'startStream',
			data: {
				camId: params.camId,
				storeId: params.storeId,
				streamType: params.streamType,
				isForHighStream: params.streamType == "High"
			}
		}

		//Temporary change
		if (!params.streamId) {
			webSocket.Send(options);
		} else {
			//Request to mdedia Server and check view count
			let result = await util.isBroadcasting(params.streamId, params.storeId);
			if (!result.success) {
				webSocket.Send(options);
			}
		}
	} catch (ex) {
		logger.error(ex);
	}
	res.json({ success: true, message: 'Your request will proceed' });
}

const createCamera = async (req, res) => {

	let { key, cameraList, storeId, token, validity } = Object.assign({}, req.params, req.body, req.query);
	let encryptedValue = await common.sha256(storeId + process.env.secretKey);
	let isValidRequest = token.toLowerCase() == encryptedValue.toLowerCase();
	let checkValidityOfRequest = await common.decrypt(validity);
	let response = { success: false, message: '', data: null };

	if (util.isNull(key) || !isValidRequest || !checkValidityOfRequest) {
		logger.info("Invalid Request due to API time validity expires : " + checkValidityOfRequest + ", is token Invalid : " + isValidRequest);
		response.message = "Invalid request";
		return res.json(response);
	}

	let store = await storeModel.findOne({ serialNumber: key });
	if (store) {

		let mediaServerUrl = new URL(store.mediaServerUrl);
		mediaServerUrl = `https://${mediaServerUrl.hostname}:${store.mediaServerOutboundPort}`;
		let ami = new AntMediaAdapter(mediaServerUrl);

		let newRecord;
		let configuredCams = await camera.find({ storeId: store._id });
		cameraList = JSON.parse(cameraList);
		for (let i = 0, len = cameraList.length; i < len; i++) {
			let camRecord = cameraList[i];
			let index = configuredCams.findIndex(e => {
				return e.primaryCameraId === camRecord.primaryCameraId && e.primaryStreamId == camRecord.primaryStreamId
			});

			//Record Already Exists
			if (index > -1) {
				continue;
			}

			let lowStreamId, highStreamId = '', aiStreamId = '';

			try {
				if (store.isAntMedia) {
					let streamName = `${store.name}-${camRecord.name}`;
					response = await ami.save({ name: `${streamName} - LOW`, streamId: `${e.id}-LOW` });
					if (response.success) {
						lowStreamId = response.streamId;
					} else {
						logger.error(`AntMediaServer API Error: ${streamName}`);
					}
					response = await ami.save({ name: `${streamName} - HIGH`, streamId: `${e.id}-HIGH` });
					if (response.success) {
						highStreamId = response.streamId;
					} else {
						logger.error(`AntMediaServer API Error: ${streamName}`);
					}
					response = await ami.save({ name: `${streamName} - AI`, streamId: `${e.id}-AI` });
					if (response.success) {
						aiStreamId = response.streamId;
					} else {
						logger.error(`AntMediaServer API Error: ${streamName}`);
					}
				}
				else {
					lowStreamId = await guid(true);
					highStreamId = await guid(true);
					aiStreamId = await guid(true);
				}

				newRecord = new camera(Object.assign({}, camRecord, { lowStreamId: lowStreamId, highStreamId: highStreamId, aiStreamId: aiStreamId }));
				await newRecord.save();
			} catch (ex) {
				logger.error(`Record Add failed: ${JSON.stringify(camRecord)}`);
			}
		}
		response.data = await camera.find({ storeId: store._id });
		response.success = true;
	} else {
		response.message = "Store not found";
	}
	res.json(response);
}

const getPublishUrl = async (req, res) => {
	let { key, streamId, storeId, token, validity } = Object.assign({}, req.params, req.body, req.query);
	let response = { success: false, message: '', data: null };

	let encryptedValue = await common.sha256(storeId + process.env.secretKey);
	let isValidRequest = token.toLowerCase() == encryptedValue.toLowerCase();
	let checkValidityOfRequest = await common.decrypt(validity);

	if (util.isNull(key) || !isValidRequest || !checkValidityOfRequest) {
		logger.info("Invalid Request due to API time validity expires : " + checkValidityOfRequest + ", is token Invalid : " + isValidRequest);
		response.message = "Invalid request";
		return res.json(response);
	}

	let store = await storeModel.findOne({ serialNumber: key });
	if (store) {
		let publishUrl = `${store.mediaServerUrl}${util.getPublishUrl(streamId, '', store.isAntMedia)}`;
		response.success = true;
		response.data = {
			publishUrl: publishUrl,
			playToken: util.generateHash(`${streamId}play${AntMediaAdapter.secretKey}`)
		};
	} else {
		response.message = "Store not found";
	}
	res.json(response);
}

const playbackRequest = async (req, res) => {
	let { storeId, camId, primaryStreamId, time, requestId } = Object.assign(req.body, req.query, req.params);
	let oldRequestId = requestId;
	requestId = Date.now();

	let storeData = await storeModel.findOne({ _id: storeId });
	let mediaServerUrl = new URL(storeData.mediaServerUrl);

	let publishUrl = `rtmp://${mediaServerUrl.hostname}${util.getPublishUrl(requestId, '', storeData.isAntMedia)}`;
	let playUrl;
	if (storeData.isAntMedia) {
		playUrl = `https://cam-${requestId}.${mediaServerUrl.hostname}:${storeData.mediaServerOutboundPort}/LiveApp/streams/${requestId}.m3u8`;
		playUrl = playUrl + "?token=" + util.generateHash(`${requestId}play${AntMediaAdapter.secretKey}`);
	} else {
		playUrl = `https://cam-${requestId}.${mediaServerUrl.hostname}:${storeData.mediaServerOutboundPort}/LiveApp/${requestId}/index.m3u8`;
		var isStreamSecured = util.isNodeMediaSecured();
		if (isStreamSecured) {
			playUrl = playUrl + "?sign=" + util.getNodeMediaSign('LiveApp', requestId);
		}
	}


	//Testing for local
	// if (Boolean(process.env.isPlaybackUseNMS)) {
	// 	publishUrl = `rtmp://localhost/live/${requestId}`;
	// 	playUrl = `http://localhost:8000/live/${requestId}/index.m3u8`;
	// }

	let options = {
		action: 'playbackRequest',
		data: {
			storeId: storeId,
			camId: camId,
			primaryStreamId: primaryStreamId,
			time: time,
			publishUrl: publishUrl,
			requestId: requestId
		}
	}

	//Old Request Id
	if (oldRequestId) {
		options.data.oldRequestId = oldRequestId;
	}

	//Request send to oss for start publishing video to media server
	webSocket.Send(options);

	//Send response to timeline player
	res.json({
		success: true,
		data: {
			requestId: requestId,
			playUrl: playUrl
		}
	});
}

const stopPlayback = (req, res) => {
	let { storeId, requestId } = Object.assign(req.body, req.query, req.params);
	let response = { success: false, message: '' };
	if (util.isNull(storeId) || util.isNull(requestId)) {
		response.message = "Invalid Request";
	} else {
		let options = {
			action: 'stopPlayback',
			data: {
				storeId: storeId,
				requestId: requestId
			}
		}
		response.message = 'Request Accepted';
		response.success = true;
		webSocket.Send(options);
	}
	res.json(response);
}

const streamRegistered = async (req, res) => {
	let { storeId, camId, streamType } = Object.assign({}, req.body, req.params);
	let response = { success: false, message: '' };
	try {
		let store = await storeModel.findById(storeId);
		let cameraRecord = await camera.findById(camId);
		switch (streamType) {
			case "HighQuality":
				streamType = "HIGH";
				break;

			case "LowBandwidth":
				streamType = "LOW";
				break;

			case "AIStream":
				streamType = "AI";
				break;
		}
		let streamId = util.getStreamId(cameraRecord.id, streamType)
		if (store) {
			let mediaServerUrl = new URL(store.mediaServerUrl);
			mediaServerUrl = `https://${mediaServerUrl.hostname}:${store.mediaServerOutboundPort}`;
			let adapter = new AntMediaAdapter(mediaServerUrl);
			let result = await adapter.load(streamId);
			let streamName = `${store.name}-${cameraRecord.name}`;
			if (result.success) {
				await adapter.stop(streamId);
				await util.delay(2000);
			} else {
				await adapter.save({ name: `${streamName} - ${streamType}`, streamId: streamId });
			}
			response.success = true;
		} else {
			response.message = "Store Not Found";
		}
	} catch (ex) {
		response.message = ex.message;
		logger.error(ex);
	}
	res.json(response);
}

const deleteStream = async (req, res) => {
	let { key, storeId, token, validity } = Object.assign({}, req.params, req.body, req.query);

	//-------------------Validate Request-------------------
	let encryptedValue = await common.sha256(storeId + process.env.secretKey);
	let isValidRequest = token.toLowerCase() == encryptedValue.toLowerCase();
	let checkValidityOfRequest = await common.decrypt(validity);
	let response = { success: false, message: '', data: null };
	if (util.isNull(key) || !isValidRequest || !checkValidityOfRequest) {
		logger.info("Invalid Request due to API time validity expires : " + checkValidityOfRequest + ", is token Invalid : " + isValidRequest);
		response.message = "Invalid request";
		return res.json(response);
	}
	//-------------------Validate Request-------------------
	let resp = await util.deleteAntStream(storeId);
	res.json(resp);
}

const cameraReverseSSH = async (req, res) => {
	// Need Params as 
	// cameraId : Camera Object Id
	var params = Object.assign({}, req.body, req.params, req.query);
	let response = { success: false, message: '' };

	try {
		let remoteAddress = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
		if (remoteAddress) {
			remoteAddress = remoteAddress.split(":")[0];
		}
		ReverseSSH.deleteKnownHost();

		let isHubAvailable = DaemonSocket.isHubAvailable(params.serialKey);
		if (!isHubAvailable) {
			response.message = 'Hub is not connected';
			return res.json(response);
		}

		let camera = await Camera.findOne({ _id: params.cameraId }).populate("storeId");
		let sshConnStartTime, sshConnEndTime;

		if (!camera) {
			response.message = 'camera not found';
			return res.json(response);
		}

		let ips = [];
		ips.push(camera.storeId.publicIp);
		if (remoteAddress && remoteAddress.length > 0) {
			ips.push(remoteAddress);
		}
		let current = moment();
		let hasInfo =
			!util.isNull(camera.sshConnStartTime) &&
			!util.isNull(camera.sshConnEndTime) &&
			!util.isNull(camera.sshCameraPort);
		if (hasInfo) {
			sshConnStartTime = moment(camera.sshConnStartTime);
			sshConnEndTime = moment(camera.sshConnEndTime);
			sshConnEndTime.add(15, 'minutes');
		}

		//Check if connection is not expired, then renew if not expired and get the request for connection
		if (hasInfo && current.isBetween(sshConnStartTime, sshConnEndTime)) {
			response.success = true;

			params.port = camera.sshCameraPort;
			params.action = 'StartCameraSSH';
			params.cameraIp = camera.sshCameraIp;
			params.sshCameraLocalPort = camera.sshCameraLocalPort;
			//ReverseSSH.portMapToLocal(params.port);
			ReverseSSH.openPort(params.port, ips, "camera" + camera._id.toString());
			response = DaemonSocket.send(params.serialKey, params);
			if (response.success) {
				response.message = `Your request has been processed\n Connect ssh over port ${params.port}`;
			}
		} else {
			params.port = await ReverseSSH.getCameraSSHPort(camera._id);
			params.action = 'StartCameraSSH';
			params.cameraIp = camera.sshCameraIp;
			params.sshCameraLocalPort = camera.sshCameraLocalPort;

			ReverseSSH.openPort(params.port, ips, "camera" + camera._id.toString());

			sshConnStartTime = moment();
			sshConnEndTime = moment(sshConnStartTime).add(30, 'minutes');

			//Update Connection time info in DB
			await Camera.updateOne(
				{ _id: params.cameraId },
				{
					$set: {
						sshConnStartTime: sshConnStartTime,
						sshConnEndTime: sshConnEndTime,
						sshCameraPort: params.port,
					},
				}
			);

			response = DaemonSocket.send(params.serialKey, params);
			if (response.success) {
				response.message = `Your request has been processed\n Connect ssh over port ${params.port}`;
			}
		}
	} catch (ex) {
		response.success = false;
		response.message = ex.message;
		logger.error(ex);
	}

	res.json(response);
};


module.exports = {
	getCameras,
	getCamera,
	populateCameras,
	ptzRequest,
	updateStreamAnt,
	updateStreamNMS,
	StreamStatus,
	startStream,
	createCamera,
	getPublishUrl,
	playbackRequest,
	stopPlayback,
	streamRegistered,
	deleteStream,
	cameraReverseSSH
};