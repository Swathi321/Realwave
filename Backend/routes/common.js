const commonUtil = require('./../util/util');

let heatMapData = function (req, res, next) {
	let params = Object.assign({}, req.body, req.params, req.query);
	let resp = {};

	let dateString = (new Date().getFullYear()) + '-' + ("0" + (new Date().getMonth() + 1)).slice(-2) + '-' + ("0" + (new Date().getDate())).slice(-2);
	if (params.camId && params.camId != 'undefined') {
		commonUtil.getCameraDetail(req, res).then(function (data) {
			let camData = data[0];
			let getCamDetails = commonUtil.getIpAndPort(camData.cameraRTSPUrl);
			let cameraPort = camData.heatMapCameraPort && camData.heatMapCameraPort.toString().length >= 2 ? camData.heatMapCameraPort : getCamDetails.port;
			let cameraIP = "http://" + getCamDetails.ip;
			if (getCamDetails.username && getCamDetails.password) {
				let digestRequest = require('request-digest')(getCamDetails.username, getCamDetails.password);
				let urlPath = "/stw-cgi/recording.cgi?msubmenu=heatmapsearch&action=control&ChannelIDList=0&Mode=Start&FromDate=" + dateString + "T00:00:00Z&ToDate=" + dateString + "T23:59:59Z&ResultAsImage=True&ResultImageType=WithoutBackground&SunapiSeqId=13"
				digestRequest.requestAsync({
					host: cameraIP,
					path: urlPath,
					port: cameraPort,
					method: 'GET',
					excludePort: false
				})
					.then(function (response) {
						searchToken = response.body;
						digestRequest.requestAsync({
							host: cameraIP,
							path: urlPath,
							port: cameraPort,
							method: 'GET',
							excludePort: false
						})
							.then(function (response) {
								digestRequest.request({
									host: cameraIP,
									path: '/stw-cgi/recording.cgi?msubmenu=heatmapsearch&action=view&Type=Results&' + searchToken,
									port: cameraPort,
									encoding: null,
									method: 'GET',
									excludePort: false
								}, function (error, response, body) {
									res.contentType = 'image/png';
									res.end(body)
								})
							})
							.catch(function (error) {
								res.end(null);
							});
					})
					.catch(function (error) {
						res.end(null);
					});
			}
			else {
				resp.success = false;
				resp.data = null;
				res.json(resp);
				res.end(resp);
			}
		});
	} else {
		res.json({
			success: false,
			message: 'camid not defined'
		});
	}
}

module.exports = { heatMapData }