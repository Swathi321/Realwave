var utils = require("../util/util");
const webSocket = require("../plugin/Socket");
const fs = require('fs');
const sharp = require('sharp');
const moment = require('moment');
var imageBufferArray = [];
const events = require('events');
const _ = require('lodash');
var eventEmitter = new events.EventEmitter();

function getImage(req, res) {
	var data = Object.assign({}, req.body, req.query);
	let options = {
		action: 'liveImageStream',
		data: {
			storeId: data.storeId,
			cameraImageUrl: data.cameraImageUrl,
			cameraRTSPUrl: data.cameraRTSPUrl,
			camId: data.camId,
			imageEnabled: false
		}
	}
	webSocket.Send(options);

	let dataSend = null,
		dateSend = null,
		connected = false,
		invoiceData = null;
	if (utils.dict[data.storeId] && utils.dict[data.storeId][data.camId] && utils.dict[data.storeId][data.camId].image) {
		dataSend = utils.dict[data.storeId][data.camId].image;
		dateSend = utils.dict[data.storeId][data.camId].dateTime;
		connected = utils.dict[data.storeId].connected ? utils.dict[data.storeId][data.camId].connected : false;
	}
	res.set('Access-Control-Expose-Headers', 'image-time,connected,invoiceData');
	res.contentType('image/jpeg');
	res.set('image-time', dateSend);
	res.set('connected', connected);
	let lastRecord = utils.lastInvoiceRecord[data.storeId];
	if (utils.lastInvoiceRecord && lastRecord && lastRecord[data.camId]) {
		invoiceData = lastRecord[data.camId];
	}
	res.set('invoiceData', JSON.stringify(invoiceData));
	res.send(dataSend);
}

function receiveImage(req, res) {
	let data = Object.assign({}, req.query, req.params),
		invoiceRecord = req.headers["invoice-data"] ? JSON.parse(req.headers["invoice-data"]) : null;

	if (!utils.dict[data.storeId]) {
		utils.dict[data.storeId] = {};
		utils.dict[data.storeId][data.camId] = { image: req.body, dateTime: null, connected: false, invoiceData: invoiceRecord }
	}
	if (!utils.dict[data.storeId][data.camId]) {
		utils.dict[data.storeId][data.camId] = { image: null, dateTime: null, connected: false, invoiceData: invoiceRecord }
	}

	if (!utils.dict[data.storeId][data.camId].image) {
		utils.dict[data.storeId][data.camId] = { image: null, dateTime: null, connected: false, invoiceData: invoiceRecord }
	}

	if (!utils.dict[data.storeId][data.camId].connected) {
		utils.dict[data.storeId][data.camId] = { image: null, dateTime: null, connected: false, invoiceData: invoiceRecord }
	}
	let index = imageBufferArray.findIndex(function (element) { return element.camId == data.camId; });

	if (!utils.dict.oldBuffer) {
		let thumbPath = utils.getDirectory('assets/img') + 'NoVideoAvailable.jpg';
		fs.readFile(thumbPath, function (err, body) {
			if (!err) {
				utils.dict.oldBuffer = body;
			}
		});
	}

	if (Buffer.isBuffer(req.body)) {
		//console.log('Buffer - ' + Buffer.compare(oldBuffer, new Buffer(req.body)));
		if (!utils.dict.oldBuffer || Buffer.compare(new Buffer(req.body), utils.dict.oldBuffer)) {
			utils.dict[data.storeId][data.camId].image = req.body;
			utils.dict[data.storeId][data.camId].dateTime = moment.utc().format("MM-DD-YYYY HH:mm:ss");
			utils.dict[data.storeId][data.camId].connected = true;
			if (index > -1) {
				imageBufferArray[index].buffer = new Buffer(req.body)
				imageBufferArray[index].time = moment.utc().format("MM-DD-YYYY HH:mm:ss")
				imageBufferArray[index].connected = true;
				imageBufferArray[index].invoiceData = invoiceRecord;
			}
			else {
				imageBufferArray.push({ camId: data.camId, buffer: new Buffer(req.body), time: moment.utc().format("MM-DD-YYYY HH:mm:ss"), connected: true })
			}
		} else {
			utils.dict[data.storeId][data.camId].image = req.body;
			utils.dict[data.storeId][data.camId].dateTime = imageBufferArray[index] ? imageBufferArray[index].time : null;
			utils.dict[data.storeId][data.camId].connected = false;
			utils.dict[data.storeId][data.camId].invoiceData = invoiceRecord;
		}
	}
}

function facesThumbnail(req, res) {
	let { dir, imageName } = Object.assign({}, req.params, req.query, req.body);
	res.writeHead(200, { 'content-type': 'image/png' });
	let thumbImg = utils.getDirectory("images/UserFaces/" + dir) + imageName,
		na = utils.getDirectory('assets/img') + 'No_picture_available.png';
	fs.exists(thumbImg, function (exists) {
		thumbImg = exists ? thumbImg : na;
		sharp(thumbImg)
			.resize({
				width: 200,
				fit: sharp.fit.contain,
				position: sharp.strategy.entropy
			})
			.pipe(res);
	});
}

function clientThumbnail(req, res) {
	let { imageName, width, height, isMobile } = Object.assign({}, req.params, req.query, req.body);
	res.writeHead(200, { 'content-type': 'image/png' });
	let thumbImg = utils.getDirectory("images/Client/") + imageName,
		na = utils.getDirectory('assets/img') + 'No_picture_available.png';

	if (isMobile) {
		na = utils.getDirectory('assets/img') + 'map_pin.png';
	}

	fs.exists(thumbImg, function (exists) {
		thumbImg = exists ? thumbImg : na;
		let resizeOption = Object.assign({}, {
			width: Number(width),
			fit: sharp.fit.inside,
			position: sharp.strategy.entropy,
		});
		if (height) {
			resizeOption.height = Number(height)
		}
		else {
			resizeOption.height = 100
		}

		sharp(thumbImg)
			.resize(resizeOption).pipe(res);
	});
}

function mapThumbnail(req, res) {
	let { imageName } = Object.assign({}, req.params, req.query, req.body);
	let thumbImg = utils.getDirectory("images/Map/") + imageName,
		na = utils.getDirectory('assets/img') + 'No_picture_available.png';
	fs.exists(thumbImg, function (exists) {
		thumbImg = exists ? thumbImg : na;
		fs.createReadStream(thumbImg).pipe(res);
	})
}

function userProfile(req, res) {
	let { imageName, width, height } = Object.assign({}, req.params, req.query, req.body);
	res.writeHead(200, { 'content-type': 'image/png' });
	let thumbImg = utils.getDirectory("images/UserProfile/") + imageName,
		na = utils.getDirectory('assets/img') + 'No_picture_available.png';
	fs.exists(thumbImg, function (exists) {
		thumbImg = exists ? thumbImg : na;
		let resizeOption = Object.assign({}, {
			width: Number(width),
			fit: sharp.fit.inside,
			position: sharp.strategy.entropy,
		});
		if (height) {
			resizeOption.height = Number(height)
		}
		else {
			resizeOption.height = 100
		}

		sharp(thumbImg)
			.resize(resizeOption).pipe(res);
	});
}

module.exports = { getImage, receiveImage, facesThumbnail, clientThumbnail, mapThumbnail, userProfile };