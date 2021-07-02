const utils = require("./../util/util");
const config = require('./../config');
const azure = require('azure-storage');
const blobService = azure.createBlobService(config.azure.account, config.azure.key);
const socket = require('../plugin/Socket');
const fs = require('fs');
const EventModel = require('./../modals/Event');
const VideoClipModel = require('./../modals/VideoClip');
const RealwaveVideoClip = require('./../modals/VideoClips');
const path = require('path');
const logger = require('./../util/logger');

const getVideoContentLength = async (fileName) => {
  return new Promise((resolve) => {
    blobService.getBlobProperties(config.azure.container, fileName, function (err, blobResult, headers) {
      if (err) {
        resolve(0);
        return;
      }
      resolve(blobResult.contentLength);
    })
  })
}

module.exports = {

  playVideo: async (req, res, next) => {
    const params = Object.assign({}, req.body, req.query),
      tranNumber = params.tid;
    // const range = req.headers.range;
    let model = params.modelName;
    // let sendURL = params.sendURL;
    try {
      let modeName = !model ? "event" : model ? model : "VideoClipModel";
      let videoName = tranNumber + utils.eventVideoExtension, azureVideoFileName = '';
      let getModelName = await utils.getModel(modeName);
      let rec = await getModelName.findById({ _id: tranNumber.toObjectId() }).populate('StoreId');
      let storeId = rec.StoreId ? rec.StoreId : rec.storeId;
      if (rec.CamId && storeId) {
        let videoDate = utils.GetStoreLocalTimeByStore(model == "realwaveVideoClip" ? rec.StartTime : rec.EventTime, model == "realwaveVideoClip" ? 0 : storeId.timeZone).format(utils.dateFormat.dateFolderName);
        azureVideoFileName = `${storeId.id}/${videoDate}/${utils.videoPath}/${videoName}`;
      } else {
        azureVideoFileName = videoName;
      }
      let playUrl = utils.getAzurePlayUrl(azureVideoFileName);
      let contentLength = await getVideoContentLength(azureVideoFileName);
      let option = {
        EventId: tranNumber,
        ContentLength: contentLength,
        AzureVideoFileName: azureVideoFileName
      },
      eventRecord = option;

      // Create buffer for video.
      if (params.isMobileDownload) {
        logger.info(`Downloading file from Azure to send to user: ${eventRecord.AzureVideoFileName}`);
        const head = {
          'Content-Length': eventRecord.ContentLength,
          'Content-Type': 'video/mp4',
          'Content-Disposition': 'attachment; filename=' + videoName
        }
        res.writeHead(200, head);
        blobService.createReadStream(config.azure.container, eventRecord.AzureVideoFileName, null).pipe(res)
        return;
      }

      res.json({
        uri: playUrl
      });
    }
    catch (err) {
      res.json({
        uri: ""
      });
    }
  },

  downloadFile: (req, res) => {
    let params = Object.assign({}, req.body, req.query);

    let isLocal = req.headers.host.indexOf('localhost') > -1 ? true : false;

    let
      requestUrl = (isLocal ? 'http' : 'https') + '://' + req.headers.host + req.baseUrl + "/playVideo" + req._parsedUrl.search + '&download=true',
      targetFilePath = process.cwd() + "/Temp/" + params.tid + utils.eventVideoExtension;

    logger.info(`Download request received: ${requestUrl} targetFilePath: ${targetFilePath}`);

    // download request file.
    utils.downloadFile(requestUrl, targetFilePath)
      .then((response) => {
        if (response && response.success) {
          res.download(targetFilePath, () => {
            // Once download finish, delete the file from local.
            logger.info(`Download request completed: ${requestUrl} targetFilePath: ${targetFilePath}`);
            try {
              // Delete file from local.
              fs.unlinkSync(targetFilePath);
            } catch (ex) {
              logger.error(ex);
              logger.error(`Download request failed-1: ${requestUrl} targetFilePath: ${targetFilePath} ex: ${ex}`);
              logger.error(ex)
            }
          });
        }
        // return res.json(response);
      }).catch((response) => {
        logger.error(response);
        logger.error(`Download request failed-2: ${requestUrl} targetFilePath: ${targetFilePath} response: ${response}`);
        return res.json(response);
      });
  },
  downloadUpdate: (req, res, next) => {
    var data = Object.assign({}, req.body, req.query);
    if (data && data.storeId) {
      socket.Send(Object.assign({}, { data: { storeId: data.storeId }, action: "downloadUpdate" }));
      res.json({ message: 'Update sent!', data: null });
    } else {
      res.json({ message: 'Store id not found!', data: null });
    }
  },
  receiveVideo: (req, res, next) => { }
}