const thumbnail = require('./previewThumbnail');
const eventModel = require('./../../modals/Event');
const moment = require('moment');
const fs = require('fs');
const path = require('path');
const logger = require('./../../util/logger');
const config = require('./../../config');
const utils = require('./../../util/util');
const azure = require('azure-storage');
const ffmpeg = require('fluent-ffmpeg');
const videoClip = require('../../controllers/videoClip');
const videoClipModal = require('./../../modals/VideoClip');
const blobService = azure.createBlobService(config.azure.account, config.azure.key);

class PreviewThumbnail {
    constructor() {
        this.inProcess = false;
        this.lastTransactionId = null;
    }

    /**
     * @description - Task/cron job for create the vtt and sprite image file for video.
     */
    async execute() {
        if (!this.inProcess) {
            logger.info("PreviewThumnail creation Started");
            this.inProcess = true;
            try {

                if (!fs.existsSync(path.resolve(`plugin/PreviewThumbnail/download/`))) {
                    fs.mkdirSync(path.resolve(`plugin/PreviewThumbnail/download/`));
                }
                let eventsData = await eventModel.find({
                    //  _id: '5c879a169117253ac4a19b01', //Specific record for testing.
                    IsVideoAvailable: true,
                    IsVttAvailable: false
                }).sort({ EventTime: -1 });
                let videoClipData = await videoClipModal.find({
                    // _id: '5efddc1742658920c8ee0f4e', //Specific record for testing.
                    IsVideoAvailable: true,
                    IsVttAvailable: false
                }).sort({ EventTime: -1 });

                await this.processRecord(eventsData);
                await this.processRecord(videoClipData)
                this.inProcess = false;
            } catch (ex) {
                this.inProcess = false;
                logger.error(ex);
            }
            this.inProcess = false;
        }
    }

    async processRecord(events) {
        if (events && events.length > 0) {

            logger.info("PreviewThumbnail creation record found :" + events.length);
            for (let i = 0, len = events.length; i < len; i++) {
                const event = events[i];
                try {
                    logger.info("PreviewThumbnail File Downloading Started for :" + event.id);
                    let isDownloaded = await this.downloadVideo(event);
                    this.lastTransactionId = event._id;
                    if (isDownloaded && isDownloaded.statusCode && isDownloaded.statusCode == 404) {
                        await event.update({ IsVideoAvailable: false });
                        isDownloaded = false;
                    }
                    if (isDownloaded) {
                        logger.info("PreviewThumbnail File Downloaded for :" + event.id);
                        let videoPath = path.resolve(`plugin/PreviewThumbnail/download/${event._id}.mp4`);
                        let vttPath = path.resolve(`client/sprite/${event._id}.vtt`);
                        let response = await this.generateSprite({ videoPath: videoPath, vttPath: vttPath, spriteName: event._id.toString() });
                        if (response.success) {
                            if (fs.existsSync(videoPath)) {
                                let updateEvent = await event.update({ IsVttAvailable: true });
                                if (updateEvent) {
                                    fs.unlinkSync(videoPath);
                                }
                            }
                        } else {
                            logger.error(`PreviewThumbnail Error: ${response.message}`);
                        }
                    } else {
                        logger.error(`PreviewThumbnail Error: file download failed file ID: ${event._id}`);
                    }
                }
                catch (ex) {
                    logger.error(`PreviewThumbnail Error: ${event._id.toString()} ${ex}`);
                }
            }
        }
    }

    /**
     * @description - function for fetch the video file informatio like duration, size etc
     * @param {String} file - video file path 
     */
    async fileInfo(file) {
        return new Promise(resolve => {
            ffmpeg.ffprobe(file, (err, metadata) => {
                resolve(metadata);
            });
        });
    }

    /**
     * @description - Function for calculate how many thumbnails we need to generate for a video according to video duration.
     * @param {Number} duration - Duration of the video in seconds
     */
    getThumbSize(duration) {
        //TODO: Need to implement
    }

    /**
     * @description - function for create the vtt and sprite image
     * @param {Object} - { videoPath, vttPath, options = {}, spriteName } 
     */
    async generateSprite({ videoPath, vttPath, options = {}, spriteName }) {
        logger.info("PreviewThumbnail sprite creation started :" + spriteName);
        return new Promise(async (resolve) => {
            let response = { success: false, message: null };
            let thumbSize = 20;
            if (fs.existsSync(videoPath)) {
                let stats = await this.fileInfo(videoPath);
                //thumbSize = this.getThumbSize(Math.round(Number(stats.format.duration) / 3);
            }
            options = {
                ...{
                    output: vttPath,
                    size: {
                        width: 168
                    },
                    numThumbnails: thumbSize,
                    spriteSheetName: spriteName,
                    assetsDirectory: 'sprite',
                    spritesheet: true
                },
                ...options
            }
            thumbnail(videoPath, options, (err, metadata) => {
                if (err) {
                    logger.info("Sprite Image process error :" + err.message);
                    response.message = err.message;
                    resolve(response);
                    return;
                }
                response.success = true;
                response.message = "Sprite Image Successfully generated.";
                logger.info("Sprite Image Successfully generated :" + videoPath);
                resolve(response);
            });
        });
    }

    async downloadVideo(eventRecord) {
        let videoPath = path.resolve(`plugin/PreviewThumbnail/download/${eventRecord._id}.mp4`);
            let videoName = eventRecord._id + utils.eventVideoExtension,
                azureVideoFileName = '';
            if (eventRecord.CamId) {
                let storeId = eventRecord.StoreId ? eventRecord.StoreId.toString() : "";
                let videoDate = moment.utc(eventRecord.EventTime).format(utils.dateFormat.dateFolderName);
                azureVideoFileName = path.join(storeId, videoDate, utils.videoPath, videoName); // Create path: storeId/date/eventId.mp4. 
            }
            else {
                azureVideoFileName = videoName;
            }
            return new Promise((resolve) => {
                blobService.getBlobProperties(config.azure.container, azureVideoFileName, function (err, blobResult, headers) {
                    if (err) {
                        resolve(err);
                        return;
                    }
                    blobService.createReadStream(config.azure.container, azureVideoFileName, null)
                        .pipe(fs.createWriteStream(videoPath))
                        .on('close', () => {
                            resolve(true);
                        });
                });
        });
    }
}
module.exports = PreviewThumbnail;