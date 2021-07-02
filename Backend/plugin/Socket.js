const logger = require('./../util/logger');
var util = require('./../util/util');
var alertController = require('../controllers/alertList');
var cameraLogsController = require('../controllers/cameralogsHandler');
const moment = require('moment');
const cameraModal = require('./../modals/camera');
const storeModal = require('./../modals/store');
const userModel = require('./../modals/user');
const cameraModel = require('./../modals/camera');
const videoClipModel = require("./../modals/VideoClip");
const { STORE_NOTIFICATION_TYPE } = require('./../util/enum');
var peopeCountController = require('../controllers/peopleCountDataHandler');
const { Notification, NotificationParams, Template } = require('./../util/Notification');
const macAddress = require('./../modals/macAddress');
const SiteNotificationLog = require("./../modals/SiteNotificationLog");
const appConfig = require("../config/config");
const common = require('../controllers/common');
const decodeToken = require('./../authentication/decodeToken');
const EventModel = require("../modals/Event");
const eventDetailModel = require("./../modals/EventDetail");
const MediaServerInfo = require('../util/MediaServerInfo');
const testAlarmModel = require('../modals/alarmTest')
// const testAlarmModel = require('../modals/alarmTest')
let socketState = {
	CLOSED: 'closed',
	CLOSING: 'closing',
	CONNECTED: 'connected',
	CONNECTING: 'connecting',
	OPEN: 'open'
}

let camNotificationStatus = [];

const parseCookies = (value) => {
	let cookies = {};
	value.split(';').forEach(function (cookie) {
		var parts = cookie.match(/(.*?)=(.*)$/)
		cookies[parts[1].trim()] = (parts[2] || '').trim();
	});
	return cookies;
};

let clients = [];
let sIO = null;
exports.clients = clients;
exports.io = sIO;
exports.Initialize = function (server, app) {
	const io = require("socket.io")(server, {
		pingInterval: 15000,
		pingTimeout: 30000
	});
	sIO = io;
	// let interval;
	io.on('connection', async (socket) => {
		let query = Object.assign({}, socket.client.request._query);
		console.log('web socket connection is alive ' + query.storeId);
		if (query.type == 'alarm') {
			try {
				var CronJob = require('cron').CronJob;
			var job = new CronJob('*/3 * * * * *', function () {
				getApiAndEmit(socket)
			});
			job.start();
			} catch (err) {
				logger.error(er)
			}
			
			// interval = setInterval(() => getApiAndEmit(socket), 1000);
			// 	getApiAndEmit(socket)

		}

		else if (query.type == "client") {
			let cookie = parseCookies(socket.conn.request.headers.cookie);
			if (cookie.hasOwnProperty("rwave")) {
				try {
					let user = decodeToken(cookie["rwave"]);
					if (user.length <= 0) {
						logger.info("Unauthorized request for Socket connection, hence disconnecting the socket request and returning back");
						return socket.disconnect();
					}
				}
				catch (ex) {
					logger.info("Unauthorized request for Socket connection, hence disconnecting the socket request and returning back");
					return socket.disconnect();
				}
			}
			else {
				logger.info("Unauthorized request for Socket connection, hence disconnecting the socket request and returning back");
				return socket.disconnect();
			}
			socket.on('subscribeReceiptPull', function (camId) {
				logger.info("info", "Room Joined with CamID" + camId);
				socket.join(camId);
			})
			socket.on('unsubscribeReceiptPull', function (camId) {
				logger.info("info", "Leaved Room by CamID' : " + camId);
				socket.leave(camId);
			})
		}
		else {
			let encryptedValue = await common.sha256(query.storeId + process.env.secretKey);
			let isValidRequest = query.token.toLowerCase() == encryptedValue.toLowerCase();
			if (!isValidRequest) {
				return socket.disconnect();
			}
		}


		clients.push({
			storeId: query.storeId,
			socket: socket,
			type: query.type,
			clientId: query.clientId || null
		});

		if ((query.type == 'onsite')) {
			alertController.saveAlert({
				storeId: query.storeId,
				cameraId: null,
				type: 'Hub Offline',
				status: 'Closed',
				closedOn: moment.utc()
			});
			let lastRecordFromNotification = await SiteNotificationLog.find({ storeId: query.storeId.toObjectId(), type: 'STORE' });
			util.updateMachineStatusConnected({ storeId: query.storeId }, true);
		}

		//listen on change_username
		socket.on('message', async (response) => {
			let params = response;

			logger.info('Socket message received: action: ' + params.action + ' data:' + JSON.stringify(params));

			switch (params.action) {

				case "versionUpdate":
					let option = {
						version: params.data.version,
						publicIp: params.data.publicIp,
						rexLibVersion: params.data.rexLibVersion || null
					};
					storeModal.update({ _id: params.data.storeId }, { $set: option }, (err, docs) => {
						if (err) {
							logger.error('Socket:versionUpdate:' + err);
							return
						}

						logger.info('Store Version number updated: ' + params);
						logger.info(docs);
					});
					break;

				case "AllCamData":

					var reqMacAddress = params.macAddress;

					// Add a check for Ticket 21860 to validate mac
					var chuncks = reqMacAddress ? reqMacAddress.match(/.{1,2}/g) : null;
					var found = await macAddress.find({
						$or: [{
							macaddress: chuncks ? chuncks.join("-") : null //returns 12-34-56-78-90
						}, {
							macaddress: chuncks ? chuncks.join(":") : null//returns 12:34:56:78:90
						}]
					});

					//Don't continue further
					if (!found || found.length <= 0) {
						logger.info('Unauthorized request from MAC:' + reqMacAddress);
						Send({
							action: params.action,
							data: {
								storeId: params.data.storeId,
								camData: []
							}
						})
						return;
					}
					util.storeCamInfo(params.data.storeId).then((camData) => {
						Send({
							action: params.action,
							data: {
								storeId: params.data.storeId,
								camData: camData
							}
						})
					});
					break;

				case "AllCameraLogs":
					let cameraLogsData = params.data.cameraLogs;
					cameraLogsController.saveCameraLogs({ data: cameraLogsData });
					break;
				case "PeopleCountData":
					let peopleCountData = params.data.countData;
					let oldCameraId = params.data.camId;
					let oldStoreId = params.data.storeId;
					peopeCountController.savePeopleCountData({ data: peopleCountData, camId: oldCameraId, storeId: oldStoreId });
					util.storeCamInfo(params.data.storeId).then((camData) => {
						Send({
							action: "AllCamData",
							data: {
								storeId: params.data.storeId,
								camData: camData
							}
						})
					});
					break;
				case "cameraStatus":
					let requests = [];

					//TODO: Devesh needs to check why same camid coming multiple times
					params.data.camData.forEach(item => {
						requests.push(cameraModal.update({ _id: item.camId }, { $set: { isConnected: item.isWorking } }));
					});
					Promise.all(requests).then((resp) => {
						console.log('----------------camResponse-----------------');
						console.log(resp);
					}, (err) => {
						console.log('----------------camError-----------------');
						console.log(err);
					});
					break;

				case "getCameraConfig":
					var allWs = clients.filter(e => e.storeId == params.data.storeId);
					if (allWs && allWs.length > 0) {
						allWs = allWs[0];
						util.getConfiguredCamera(params.data.storeId).then(
							(data) => {
								data.forEach(item => {
									let option = {
										action: 'videoRecordStatus',
										data: {
											camId: item._id.toString(),
											cameraRTSPUrl: item.cameraRTSPUrl,
											storeId: params.data.storeId,
											recordTimeLimit: item.recordTimeLimit || 1800,
											isRecordingStarted: item.isRecordingStarted,
											protocolType: item.protocolType
										}
									}
									allWs.socket.emit('message', option);
								});
							},
							(error) => {
								logger.error(error.message)
							}
						)
					}
					break;
				case "message":
					console.log(params);
					break;

				case "scanDeviceRequest":
					let onSiteClient = clients.find(e => e.type == 'onsite' && e.storeId == params.data.storeId);
					if (onSiteClient) {
						SendToOnSite(params);
					} else {
						params.error = "Hub is offline.";
						params.action = "scanDevicesReponse";
						BroadcastToClient(params);
					}
					break;

				case "scanDevicesReponse":
					BroadcastToClient(params);
					break;
				case "ptzCommand":
					SendToOnSite(params);
					break;
				case "alarm":
					alarmHandler(params);
					break;
				case "camNotification":
					let statusCam = params.data.cameraStatus === 'True' || params.data.cameraStatus === 'true' || params.data.cameraStatus === true;
					let streamType = params.data.streamType;
					let storeId1 = params.data.storeId;
					let camId1 = params.data.camId;
					let disConnectDateTime = params.data.conDisconnectDate;
					let connectedDate = params.data.connectedDateTime;
					let isCamPing = camId1 && camId1.length > 0;
					logger.info(`Cam Status from camNotification: ${statusCam} ${camId1}`);
					if (isCamPing) {
						let updateToData = {
							"status": statusCam,
							type: "CAMERA",
							isCam: true,
							camId: camId1,
							storeId: storeId1,
							isEmailMessage: true,
							remarkHistory: `Camera Notification received for CamId : ${camId1} Status : ${statusCam}`
						}
						//Updating Camera Status in Camera Collection
						await cameraModal.update({ _id: camId1 }, { $set: { isConnected: statusCam } });
						let camNotification = await SiteNotificationLog.find({ camId: camId1, type: "CAMERA", isCam: true, storeId: storeId1 });
						if (statusCam) {
							await util.AddDeviceConnectivityLog(camId1, storeId1, true, false, "CAMERA", true, "CAMERA CONNECTED");
						}
						else {
							// AddDeviceConnectivityLog for Camera Disconnected
							await util.AddDeviceConnectivityLog(camId1, storeId1, true, false, "CAMERA", false, "CAMERA Disconnected");
						}
						if (camNotification.length > 0) {
							let lastStatus = camNotification[0].status;
							if (lastStatus != statusCam) {
								if (statusCam) {
									updateToData.connectDateTime = connectedDate;
									updateToData.emailSentForConnect = false;
								} else {
									updateToData.disConnectDateTime = disConnectDateTime;
									updateToData.emailSentForConnect = true;
								}
							}
							await SiteNotificationLog.updateOne({ camId: camId1, type: "CAMERA", isCam: true }, {
								$set: updateToData
							});
						}
						else {
							if (statusCam) {
								updateToData.connectDateTime = connectedDate;
								updateToData.emailSentForConnect = false;
							} else {
								updateToData.disConnectDateTime = disConnectDateTime;
								updateToData.emailSentForConnect = true;
							}
							await SiteNotificationLog.insertMany(updateToData);
						}

						let streamAvailable = params.data.streamAvailable === 'True' || params.data.streamAvailable === 'true' || params.data.streamAvailable === true;
						logger.info(`Cam stream Status from camStatus: ${statusCam} ${camId1} ${streamType}`);
						let dataToUpdate = {
							"status": streamAvailable,
							type: "CAMERA_" + streamType,
							isCam: true,
							camId: camId1,
							storeId: storeId1,
							isStore: false,
							isEmailMessage: true,
							isTextMessage: false,
							remarkHistory: `Camera Notification received for CamId : ${camId1} Status : ${statusCam}`
						}
						let camStreamNotification = await SiteNotificationLog.find({ camId: camId1, type: "CAMERA_" + streamType, storeId: storeId1, isCam: true });
						if (streamAvailable) {
							// AddDeviceConnectivityLog for Camera Stream Connected
							await util.AddDeviceConnectivityLog(camId1, storeId1, true, false, "CAMERA_" + streamType, true, `Camera Stream ${streamType} Connected `);
						}
						else {
							// AddDeviceConnectivityLog for Camera Stream Connected
							await util.AddDeviceConnectivityLog(camId1, storeId1, true, false, "CAMERA_" + streamType, false, `Camera Stream ${streamType} Disconnected`);

						}

						if (camStreamNotification.length > 0) {
							if (statusCam) {
								let lastStreamStatus = camStreamNotification[0].status;
								if (lastStreamStatus != streamAvailable) {
									if (streamAvailable) {
										dataToUpdate.connectDateTime = connectedDate;
										dataToUpdate.emailSentForConnect = false;
									}
									else {
										dataToUpdate.disConnectDateTime = disConnectDateTime;
										dataToUpdate.emailSentForConnect = true;
									}
								}

								await SiteNotificationLog.updateOne({ camId: camId1, type: "CAMERA_" + streamType, storeId: storeId1, isCam: true }, {
									$set: dataToUpdate
								});
							}
						}
						else {
							if (streamAvailable) {
								dataToUpdate.connectDateTime = connectedDate;
								dataToUpdate.emailSentForConnect = false;
							}
							else {
								dataToUpdate.disConnectDateTime = disConnectDateTime;
								dataToUpdate.emailSentForConnect = true;
							}
							await SiteNotificationLog.insertMany(dataToUpdate);
						}
					}
					if (!isCamPing) {
						logger.info('Store ping received: ' + storeId1);
						util.UpdateStorePing(params.data, true, 'camNotification');
					}
					break;
				case "clipEventUpdate":
					const { Id, IsVideoAvailable, IsRejected, RejectedReason, Status, StoreId, IsPOSEvent } = params.data;
					let updateOptions = {};
					try {
						logger.info(`clipEventUpdate EventId: ${Id} Success Status: ${Status}`);

						if (!util.isNull(IsVideoAvailable)) { updateOptions["IsVideoAvailable"] = IsVideoAvailable };
						if (!util.isNull(IsRejected)) { updateOptions["IsRejected"] = IsRejected };
						if (!util.isNull(RejectedReason)) { updateOptions["RejectedReason"] = RejectedReason };
						if (!util.isNull(Status)) {
							updateOptions["Status"] = Status;
							updateOptions["RejectedReason"] = Status;
							if (Status == "ClipUploaded") {
								let camName = '', siteName = '';
								let clipRecord = []
								if (IsPOSEvent) {
									clipRecord = await EventModel.findOne({ _id: Id });
								}
								else {
									clipRecord = await videoClipModel.findOne({ _id: Id });
								}
								let userData = {};
								if (clipRecord.CreatedByUserId == null || clipRecord.CreatedByUserId.toString() == "000000000000000000000000") {
									userData.firstName = "System";
									userData.lastName = "";
									userData.email = "";
								}
								else {
									userData = await userModel.findOne({ _id: clipRecord.CreatedByUserId });
								}
								let cameraDetail = await cameraModel.find({ _id: clipRecord.CamId }).populate('storeId');
								let camera = []
								if (cameraDetail && cameraDetail.length > 0 && cameraDetail[0].storeId) {
									if (cameraDetail[0].storeId.status == "Active") {
										camera = cameraDetail[0];
										camName = camera.name;
										siteName = camera.storeId.name;
									}
								}

								let emailForSite = camera && camera.storeId && camera.storeId.email ? camera.storeId.email : null;
								if (emailForSite) {
									let np = new NotificationParams();
									np.to = emailForSite;
									np.template = Template.Email.CustomVideoClip;
									np.tags = {
										SITE: siteName,
										CAMERA: camName,
										StartTime: util.GetStoreLocalTimeByStore(clipRecord.EventTime, clipRecord.TimezoneOffset).format(util.dateFormat.dateTimeFormatAmPm),
										EndTime: util.GetStoreLocalTimeByStore(clipRecord.EventEndTime, clipRecord.TimezoneOffset).format(util.dateFormat.dateTimeFormatAmPm),
										Email: camera && camera.storeId && camera.storeId.email ? camera.storeId.email : null,
										URL: process.env.baseUrl + `/download/playVideo?modelName=videoClip&tid=${clipRecord._id}`
									};
									// Notification.sendInstantEmail(np);
									Notification.sendEmail(np);
									if (IsPOSEvent) {
										await EventModel.findOneAndUpdate({ _id: Id }, { $set: { RejectedReason: 'Email sent' } });
									}
									else {
										await videoClipModel.findOneAndUpdate({ _id: Id }, { $set: { RejectedReason: 'Email sent' } });
									}
									logger.info(`Video Upload Email Success: ${camera && camera.storeId && camera.storeId.email ? camera.storeId.email : null} EventId: ${clipRecord._id}`)
								}
							}
							else {
								logger.info(`Video Upload Status (Email Not Sent) EventId: ${clipRecord._id} Success Status: ${Status}`);
							}
						} else {
							logger.info(`Video Upload Status Is Null (Email Not Sent) EventId: ${clipRecord._id} Success Status: ${Status}`);
						}

						if (IsPOSEvent) {
							await EventModel.update({ _id: Id }, { $set: updateOptions });
						}
						else {
							await videoClipModel.update({ _id: Id }, { $set: updateOptions });
						}
					} catch (ex) {
						logger.error('clipEventUpdate failed');
						logger.error(ex);
					}
					break;

				default:
					break;
			}
		});

		socket.on('disconnect', function (reason) {
			let index = clients.findIndex(x => x.socket === this);
			if (index > -1) {
				let cnt = clients[index];
				if (cnt.type === 'onsite') {
					alertController.saveAlert({
						storeId: cnt.storeId,
						cameraId: null,
						type: 'Hub Offline',
						eventTime: moment.utc(),
						status: 'Open',
						closedOn: null
					});
					if (reason == "transport close" || reason == "ping timeout") {
						util.updateMachineStatus({ storeId: cnt.storeId }, false, "disconnect"); //false means machine offline/Disconnected from server.
						//util.deleteAntStream(cnt.storeId);
					}
				}
				if (cnt.type === 'client' && cnt.timeline) {
					let options = {
						action: 'stopPlayback',
						data: {
							storeId: cnt.timeline.storeId,
							requestId: cnt.timeline.requestId
						}
					}
					Send(options);
				}
				clients.splice(index, 1);
			}
		});
		socket.on('error', function (e) {
			let index = clients.findIndex(x => x.ws === this);
			if (index > -1) {
				let cnt = clients[index];
				if (cnt.type === 'onsite') {
					alertController.saveAlert({
						storeId: cnt.storeId,
						cameraId: null,
						type: 'Hub Offline',
						eventTime: moment.utc(),
						status: 'Open',
						closedOn: null
					});
					util.updateMachineStatus({ storeId: cnt.storeId }, false, e.message); //false means machine offline/Disconnected from server.
				}
				clients.splice(index, 1);
			}
			console.error(e.message);
			logger.info({ user: query.user, camUrl: query.camUrl })
			logger.error('Socket Error: ' + e);
		});

		socket.on('playback', async function (option) {
			if (option.requestType == "PlaybackSpeed" && !option.speed) {
				return;
			}
			// //Console for Testing
			// if (option.type) {
			// 	console.log("***********************************************");
			// 	console.log(option);
			// 	console.log("***********************************************");
			// }
			let { storeId, camId, primaryStreamId, primaryCameraId, time, requestId, CurrentDateTime, TimezoneOffset, recordingStreamId } = option;
			let clientAll = [];
			let playUrl;
			let publishUrl;
			let oldRequestId;
			let rtmp;
			let token = "",
				streamId = "";

			if (option.requestType == "PlaybackSpeed") {
				let storeData = await storeModal.findOne({ _id: storeId });
				let msi = new MediaServerInfo(storeData, MediaServerInfo.PLAYBACK);
				option.publishUrl = `rtmp://${msi.hostname}${util.getPublishUrl(option.requestId, '', msi.isAntMedia)}`;;
			}
			if (option.requestType == "Playback") {
				oldRequestId = requestId;
				requestId = await util.guid();

				let storeData = await storeModal.findOne({ _id: storeId });
				let msi = new MediaServerInfo(storeData, MediaServerInfo.PLAYBACK);
				publishUrl = `rtmp://${msi.hostname}${util.getPublishUrl(requestId, '', msi.isAntMedia)}`;
				if (msi.isAntMedia) {
					token = util.generateHash(`${requestId}play${MediaServerInfo.SECRET_KEY}`);
					streamId = requestId;

					playUrl = `https://cam-${requestId}.${msi.hostname}:${msi.outboundPort}/LiveApp/streams/${requestId}.m3u8?token=${token}`;
					rtmp = `rtmp://cam-${requestId}.${msi.hostname}:${msi.inboundPort}/LiveApp/${requestId}`;
				} else {
					playUrl = `https://cam-${requestId}.${msi.hostname}:${msi.outboundPort}/LiveApp/${requestId}.flv`;
					rtmp = `rtmp://cam-${requestId}.${msi.hostname}:${msi.inboundPort}/LiveApp/${requestId}`;

					//Secured play stream
					var isStreamSecured = util.isNodeMediaSecured();
					if (isStreamSecured) {
						playUrl = playUrl + "?sign=" + util.getNodeMediaSign('LiveApp', requestId);
						rtmp = rtmp + "?sign=" + util.getNodeMediaSign('LiveApp', requestId);
					}
				}

				this.emit('playback', {
					action: 'PlaybackUrl',
					clientId: option.clientId,
					publishUrl: publishUrl,
					requestId: requestId,
					playUrl: playUrl,
					rtmp: rtmp,
					token: token,
					streamId: streamId
				});
			}

			//Request to OSS from browser client
			if (option.type == 'request') {
				let socClient = clients.filter(e => e.socket.id === this.id);
				if (socClient && socClient.length > 0) {
					socClient = socClient[0];
					socClient.timeline = {
						requestId: requestId,
						storeId: option.storeId,
						clientId: option.clientId
					}
				}
				clientAll = clients.filter(e => e.type == 'onsite' && e.storeId == option.storeId);
				if (clientAll && clientAll.length > 0) {
					clientAll.forEach(function (client) {
						try {
							if (client.socket.conn.readyState === socketState.OPEN) {
								if (option.requestType == "Playback") {
									option.publishUrl = publishUrl;
									option.requestId = requestId;
									option.primaryStreamId = primaryStreamId;
									option.primaryCameraId = primaryCameraId;
									option.recordingStreamId = recordingStreamId;
									option.time = time;
									option.camId = camId;
								}
								if (oldRequestId) {
									option.oldRequestId = oldRequestId;
								}
								client.socket.emit('playback', option);
							}
						} catch (e) {
							logger.error(Object.assign({}, clients, { error: e }));
						}
					});
				} else {
					this.emit('playback', { action: 'HubNotConnected', clientId: option.clientId });
				}
			}

			//Request to browser client from OSS
			if (option.type == 'response') {
				clientAll = clients.filter(e => e.type == 'client' && e.clientId == option.clientId);
				if (clientAll && clientAll.length > 0) {
					clientAll.forEach(async function (client) {
						try {
							if (client.socket.conn.readyState === socketState.OPEN) {
								if (option.camId) {
									let EventTime = { $gte: moment.utc(CurrentDateTime, util.dateFormat.dateFormat).subtract(util.ReceiptTotalDays, "days") };
									let eventFilter = { CamId: option.camId.toObjectId(), EventTime: EventTime }
									let detailData = [];
									let eventData = await EventModel.find(eventFilter).sort({ EventTime: -1 }).populate("StoreId CamId");

									if (eventData && eventData.length > 0) {
										let filteredEventId = [];
										let eventDetailData = eventData;
										eventDetailData.forEach(element => {
											filteredEventId.push(element.InvoiceId);
										});

										match = {
											InvoiceId: { $in: filteredEventId.map(function (strVale) { return strVale }) }
										};
										detailData = await eventDetailModel.find(match);
									}
									option.EventData = { invoice: eventData, invoiceDetail: detailData };
								}
								client.socket.emit('playback', option);

							}
						} catch (e) {
							logger.error(Object.assign({}, clients, { error: e }));
						}
					});
				}
			}
		});

		socket.on('gridsearch', async function (option) {
			let { storeId, camId, primaryStreamId, primaryCameraId, time, requestId, requestType } = option;
			let clientAll = [];
			option.requestId = option.requestId || await util.guid();

			//Request to OSS from browser client
			if (option.type == 'request') {
				clientAll = clients.filter(e => e.type == 'onsite' && e.storeId == storeId);
				if (clientAll && clientAll.length > 0) {
					clientAll.forEach(function (client) {
						try {
							client.socket.emit('gridsearch', option);
						} catch (e) {
							logger.error(Object.assign({}, clients, { error: e }));
						}
					});
				} else {
					this.emit('gridsearch', { success: false, message: 'Hub not connected', clientId: option.clientId, requestId: option.requestId });
				}
			}

			//Request to browser client from OSS
			if (option.type == 'response') {
				clientAll = clients.filter(e => e.type == 'client' && e.clientId == option.clientId);
				if (clientAll && clientAll.length > 0) {
					clientAll.forEach(async function (client) {
						try {
							if (client.socket.conn.readyState === socketState.OPEN) {
								client.socket.emit('gridsearch', option);
							}
						} catch (e) {
							logger.error(Object.assign({}, clients, { error: e }));
						}
					});
				}
			}
		});
		socket.on('gridsearchStartEndDuration', async function (option) {
			let { storeId, camId, primaryStreamId, primaryCameraId, time, requestId, requestType } = option;
			let clientAll = [];
			option.requestId = option.requestId || await util.guid();

			//Request to OSS from browser client
			if (option.type == 'request') {
				clientAll = clients.filter(e => e.type == 'onsite' && e.storeId == storeId);
				if (clientAll && clientAll.length > 0) {
					clientAll.forEach(function (client) {
						try {
							client.socket.emit('gridsearchStartEndDuration', option);
						} catch (e) {
							logger.error(Object.assign({}, clients, { error: e }));
						}
					});
				} else {
					this.emit('gridsearchStartEndDuration', { success: false, message: 'Hub not connected', clientId: option.clientId, requestId: option.requestId });
				}
			}

			//Request to browser client from OSS
			if (option.type == 'response') {
				clientAll = clients.filter(e => e.type == 'client' && e.clientId == option.clientId);
				if (clientAll && clientAll.length > 0) {
					clientAll.forEach(async function (client) {
						try {
							if (client.socket.conn.readyState === socketState.OPEN) {
								client.socket.emit('gridsearchStartEndDuration', option);
							}
						} catch (e) {
							logger.error(Object.assign({}, clients, { error: e }));
						}
					});
				}
			}
		});
		socket.on('syncPlayback', async function (option) {
			let { storeId, clientId, type, requestType, playbackCamInfo, requestId } = option;

			let playUrl;
			let oldRequestId;
			let rtmp;
			let token = null;
			let client = null;

			if (requestType == "Playback") {
				oldRequestId = requestId;
				requestId = await util.guid();

				let storeData = await storeModal.findOne({ _id: storeId });
				let msi = new MediaServerInfo(storeData, MediaServerInfo.PLAYBACK);

				for (let i = 0; i < playbackCamInfo.length; i++) {
					let streamId = await util.guid();
					playbackCamInfo[i]["streamId"] = streamId;
					playbackCamInfo[i]["publishUrl"] = `rtmp://${msi.hostname}${util.getPublishUrl(streamId, '', msi.isAntMedia)}`;

					if (msi.isAntMedia) {
						token = util.generateHash(`${streamId}play${MediaServerInfo.SECRET_KEY}`);
						playUrl = `https://cam-${streamId}.${msi.hostname}:${msi.outboundPort}/LiveApp/streams/${streamId}.m3u8?token=${token}`;
						rtmp = `rtmp://cam-${streamId}.${msi.hostname}:${msi.inboundPort}/LiveApp/${streamId}`;
					} else {
						playUrl = `https://cam-${streamId}.${msi.hostname}:${msi.outboundPort}/LiveApp/${streamId}.flv`;
						rtmp = `rtmp://cam-${streamId}.${msi.hostname}:${msi.inboundPort}/LiveApp/${streamId}`;

						//Secured play stream
						var isStreamSecured = util.isNodeMediaSecured();
						if (isStreamSecured) {
							playUrl = playUrl + "?sign=" + util.getNodeMediaSign('LiveApp', streamId);
							rtmp = rtmp + "?sign=" + util.getNodeMediaSign('LiveApp', streamId);
						}
					}
					playbackCamInfo[i]["playUrl"] = playUrl;
					playbackCamInfo[i]["rtmp"] = rtmp;
					if (token) {
						playbackCamInfo[i]["token"] = rtmp;
					}
				}

				this.emit('syncPlayback', {
					action: 'PlaybackUrl',
					clientId: clientId,
					requestId: requestId,
					playbackCamInfo: playbackCamInfo
				});
			}

			//Request to OSS from browser client
			if (option.type == 'request') {
				let socClient = clients.find(e => e.socket.id === this.id);
				if (socClient) {
					socClient.timeline = {
						requestId: requestId,
						storeId: option.storeId,
						clientId: option.clientId
					}
				}
				client = clients.find(e => e.type == 'onsite' && e.storeId == option.storeId);
				if (client && client.socket.conn.readyState === socketState.OPEN) {
					try {
						if (option.requestType == "Playback") {
							option.requestId = requestId;
							option.playbackCamInfo = playbackCamInfo;
						}
						if (oldRequestId) {
							option.oldRequestId = oldRequestId;
						}
						client.socket.emit('syncPlayback', option);
					} catch (e) {
						logger.error(Object.assign({}, clients, { error: e }));
						this.emit('syncPlayback', { action: 'HubNotConnected', clientId: option.clientId });
					}
				} else {
					this.emit('syncPlayback', { action: 'HubNotConnected', clientId: option.clientId });
				}
			}

			//Request to browser client from OSS
			if (option.type == 'response') {
				client = clients.find(e => e.type == 'client' && e.clientId == option.clientId);
				if (client && client.socket.conn.readyState === socketState.OPEN) {
					try {
						client.socket.emit('syncPlayback', option);
					} catch (e) {
						logger.error(Object.assign({}, clients, { error: e }));
					}
				}
			}
		});
	})
	const getApiAndEmit = async socket => {
		let query = Object.assign({}, socket.client.request._query);
		let userId = query.userId;
		let storeData = await userModel.findById(userId, { storeId: 1 });

		let activeAlarmSites = await testAlarmModel.find({ storeId: { '$in': storeData.storeId }, status: 'activated' }).populate('storeId');
		let storeNames = activeAlarmSites.map(el => el.storeId.name);
		console.log(storeNames, '%%%%%%%%%%%%%%%%%%%%%%');

		// Emitting a new message. Will be consumed by the client
		socket.emit("alarm", storeNames);
	};
}

let Send = function (args) {
	let options = args;
	var clientAll = clients.filter(e => e.storeId == options.data.storeId);
	if (clientAll && clientAll.length > 0) {
		clientAll.forEach(function (client) {
			try {
				if (client.socket.client.conn.readyState === socketState.OPEN) {
					client.socket.emit('message', options);
					if (!util.dict[options.data.storeId]) {
						util.dict[options.data.storeId] = {
							connected: true
						}
					} else {
						util.dict[options.data.storeId].connected = true;
					}
				}
			} catch (e) {
				if (!util.dict[options.data.storeId]) {
					util.dict[options.data.storeId] = {
						connected: false
					}
				} else {
					util.dict[options.data.storeId].connected = false;
				}
				logger.info('Socket: Send: ' + clients);
				logger.error("Sync error: " + e);
			}
		});
	} else {
		if (!util.dict[options.data.storeId]) {
			util.dict[options.data.storeId] = {
				connected: false
			}
		} else {
			util.dict[options.data.storeId].connected = false;
		}
	}
};

exports.Send = Send;


let POSBroadCast = (room, data, event = "receiptPOS") => {
	sIO.to(room).emit(event, data);
}

exports.POSBroadCast = POSBroadCast;

exports.BroadcastToOnsite = function (options) {
	var clientAll = clients.filter(e => e.type == 'onsite');
	if (clientAll && clientAll.length > 0) {
		clientAll.forEach(function (client) {
			try {
				if (client.socket.conn.readyState === socketState.OPEN) {
					client.socket.emit('message', options);
				}
			} catch (e) {
				logger.info(clients)
				logger.error("BroadcastToSite: Sync error: " + e);
			}
		});
	}
};

let BroadcastToClient = function (options) {
	var clientAll = clients.filter(e => e.type == 'client');
	if (clientAll && clientAll.length > 0) {
		clientAll.forEach(function (client) {
			try {
				if (client.socket.conn.readyState === socketState.OPEN) {
					if ((options.data && options.data.storeId) || (options.params && options.params.storeId)) {
						if ((options.data && options.data.storeId && client.storeId === options.data.storeId) || (options.params && options.params.storeId && client.storeId === options.params.storeId)) {
							client.socket.emit('message', options);
						}
					} else {
						client.socket.emit('message', options);
					}
				}
			} catch (e) {
				logger.error(Object.assign({}, clients, { error: e }));
			}
		});
	}
};

exports.BroadcastToClient = BroadcastToClient;

let SendToOnSite = function (options) {
	let clientAll = clients.filter(e => e.type == 'onsite');
	if (clientAll && clientAll.length > 0) {
		clientAll.forEach(function (client) {
			try {
				if (client.socket.conn.readyState === socketState.OPEN) {
					if (client.storeId === options.data.storeId) {
						client.socket.emit('message', options);
					}
				}
			} catch (e) {
				logger.error(Object.assign({}, clients, { error: e }));
			}
		});
	}
};
exports.SendToOnSite = SendToOnSite;



let alarmHandler = async function (params) {
	let { status, storeId, doorId, camId, userId } = params.data;
	try {
		status = 'close';
		videoClipModel.findOneAndUpdate(
			{ $and: [{ StoreId: storeId }, { CamId: camId }, { EventEndTime: null }, { EventType: 'Alarm' }] },//Need to add doorid
			{ $set: { EventEndTime: new Date(), Status: status } },
			{ new: true }, async (err, doc) => {
				if (doc == null) {
					status = 'open';
					let eventId = moment.utc().format(util.dateFormat.eventId);
					let newEvent = new videoClipModel({
						VideoClipId: eventId,
						InvoiceId: eventId,
						EventTime: new Date(),
						EventType: 'Alarm',
						Status: status,
						IsVideoAvailable: false,
						StoreId: storeId,
						CamId: camId,
						DoorId: moment.utc().format(util.dateFormat.eventId),
						EventEndTime: null,
						CreatedByUserId: userId
					});
					let response = await newEvent.save();
				}
			});
	} catch (ex) {
		console.log(ex);
	}
};