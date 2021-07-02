const events = require('events');
const eventEmitter = new events.EventEmitter();
const socket = require('../plugin/Socket');
const streamifier = require('streamifier');
const fs = require('fs');
const util = require('./../util/util');
const config = require('./../config');
const azure = require('azure-storage');
const blobService = azure.createBlobService(config.azure.account, config.azure.key);
const moment = require("moment");
const path = require('path');

function getDefaultImageStream(res) {
    // Create default file path.
    let defaultFilePath = util.getDirectory('assets/img') + 'na.png';

    // Check if file exists.
    fs.exists(defaultFilePath, function (exists) {
        if (!exists) {
            response.message = 'Default file does not exist';
            res.json(response);
            return;
        }

        // Create file stream.
        fs.createReadStream(defaultFilePath, { highWaterMark: 512 * 1024 }).pipe(res);
    });
}

module.exports = function () {
    var handler = {
        _Response: undefined,
        _ResObj: undefined,
        /**
         * @desc - Listen the get thumbnail request
         * @param {object} req - hold request object
         * @param {object} res - hold response object
         */
        loadThumbnail: function (req, res) {
            _ResObj = res;
            let { storeId, video, camId, dir } = req.params;
            socket.Send({ action: 'loadVideoThumbnail', data: { storeId: storeId, dir: dir, video: video, camId: camId } });
            eventEmitter.once('thumbnailResponse', () => {
                streamifier.createReadStream(_Response).pipe(_ResObj);
            });
        },
        /**
         * @desc - Listen  the video thumbnail response from On Site
         * @param {object} req - hold request object
         * @param {object} res - hold response object
         */
        reponseThumbnail: function (req, res) {
            req.on('data', function (data) {
                _Response = data;
                eventEmitter.emit('thumbnailResponse');
            });
        },
        /**
         * @desc - Listen  the event video thumbnail
         * @param {object} req - hold request object
         * @param {object} res - hold response object
         */
        eventVideoThumbnail: async function (req, res) {
            let { tid, modelName } = Object.assign({}, req.params, req.query, req.body);
            if (!modelName) {
                modelName = 'event';
            }
            const resourceModel = await util.getModel(modelName);
            res.writeHead(200, { 'content-type': 'image/png' });

            // Get event details by event id.
            resourceModel.findById({ _id: util.mongooseObjectId(tid) }, (err, eventRecord) => {
                if (err || !eventRecord) {
                    getDefaultImageStream(res);
                    return;
                }
                let imageName = (tid + util.thumbnailExtension),
                    storeId = (eventRecord.StoreId ? eventRecord.StoreId.id.toString() : ""),
                    eventDate = util.GetStoreLocalTimeByStore(modelName == 'event' ? eventRecord.EventTime: eventRecord.StartTime, modelName == 'realwaveVideoClip' ? null: eventRecord.StoreId.timeZone).format(util.dateFormat.dateFolderName),
                    azureImageFileName = path.join(storeId, eventDate, util.thumbnailsPath, imageName); // Create path: storeId/date/thumbnails/eventId.png. 

                if (config.isLocal) {
                    // Create default file path.
                    let defaultFilePath = util.getDirectory('realwavecamfeed') + azureImageFileName;

                    // Check if file exists.
                    fs.exists(defaultFilePath, function (exists) {
                        if (!exists) {
                            getDefaultImageStream(res);
                            return;
                        }

                        // Create file stream.
                        fs.createReadStream(defaultFilePath, { highWaterMark: 512 * 1024 }).pipe(res);
                    });
                } else {
                    // Read file stream from Azure.
                    blobService.getBlobToStream(config.azure.container, azureImageFileName, res,
                        function (readError, fileResult, fileResponse) {
                            if ((readError && readError.statusCode != 200) || !fileResult || fileResult.contentLength == 0) {
                                getDefaultImageStream(res);
                            }
                        }
                    );
                }
            }).populate('CamId StoreId');
        }
    }
    return handler;
};