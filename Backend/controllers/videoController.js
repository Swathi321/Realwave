const utils = require("../util/util");
const config = require('./../config');
const azure = require('azure-storage');
const fs = require('fs');
const path = require('path');
const EventModel = require('./../modals/Event');
const CameraModel = require('./../modals/camera');
const moment = require("moment");
const { Notification, NotificationParams, Template } = require('./../util/Notification');
const UserModel = require('./../modals/user');
const StoreModel = require('./../modals/store');
const logger = require('./../util/logger');
const VideoClipModel = require("./../modals/VideoClip");
const common = require('./common');
const blobService = azure.createBlobService(config.azure.account, config.azure.key);

String.prototype.toObjectId = function () {
    var ObjectId = (require('mongoose').Types.ObjectId);
    return ObjectId(this.toString());
};

const azureToken = async (req, res) => {
    const { key, expireLimit, blobName, storeId, token, validity } = Object.assign(req.body, req.query, req.params);
    let response = { success: false, message: '', data: null };
    let encryptedValue = await common.sha256(storeId + process.env.secretKey);
    let isValidRequest = token.toLowerCase() == encryptedValue.toLowerCase();
    let checkValidityOfRequest = await common.decrypt(validity);
    try {
        if (utils.isNull(key) || !isValidRequest || !checkValidityOfRequest) {
            logger.info("Invalid Request due to API time validity expires : " + checkValidityOfRequest + ", is token Invalid : " + isValidRequest);
            response.message = "Invalid Request";
            return res.json(response);
        }
        let keyValue = utils.reverseString(key);
        // let lastFive = keyValue.substr(0, 5);
        // let restKey = keyValue.slice(5);
        // keyValue = restKey + lastFive;
        let storeRecord = await StoreModel.findOne({ _id: keyValue });
        if (storeRecord) {
            var startDate = new Date();
            var expiryDate = new Date(startDate);
            expiryDate.setMinutes(startDate.getMinutes() + 100);
            startDate.setMinutes(startDate.getMinutes() - 100);

            var sharedAccessPolicy = {
                AccessPolicy: {
                    Permissions: azure.BlobUtilities.SharedAccessPermissions.READ + azure.BlobUtilities.SharedAccessPermissions.WRITE + azure.BlobUtilities.SharedAccessPermissions.DELETE,
                    Start: startDate,
                    Expiry: expiryDate
                }
            };

            var azToken = blobService.generateSharedAccessSignature(config.azure.container, blobName, sharedAccessPolicy);
            var sasUrl = blobService.getUrl(config.azure.container, blobName, azToken);
            response.success = true;
            response.data = {
                token: azToken,
                sasUrl: sasUrl
            }
        } else {
            response.message = "Invalid Request";
        }
    } catch (ex) {
        logger.error(ex);
        response.message = ex.message;
        if (ex.message.indexOf("Cast to ObjectId") > -1) {
            response.message = "Invalid Request";
        }
        response.success = false;
    }
    res.json(response);
}

function upload(req, res) {
    let fileName = req.header("content-disposition").split('filename')[1].split("=")[1];
    blobService.createContainerIfNotExists(config.azure.container, {
        publicAccessLevel: 'blob'
    }, function (error, result, response) {
        if (!error) {
            let filePath = utils.getDirectory('/') + fileName + utils.eventVideoExtension;
            const strm = fs.createWriteStream(filePath);
            strm.write(req.body, "binary");
            strm.end();

            // Perform post actions when video file is created and ready to use.
            strm.on('finish', function () {
                // Invoke function to create video thumbnail.
                // Upload video file to Azure.
                blobService.createBlockBlobFromLocalFile(config.azure.container, fileName + utils.eventVideoExtension, filePath, function (error, result, response) {
                    if (error) {
                        res.json({ success: false, message: error });
                        return;
                    }
                    fs.unlinkSync(filePath);
                    res.json({ success: true, message: "Video Uploaded." });
                });
            });
        }
    });
}

// Upload video on Azure,msave thumbnail on server.
function uploadThumbnails(req, res) {
    let response = { success: false, message: '' }, storeId = '', eventRecordsCount = 0;

    // Get all events.
    EventModel.find({}, (err, eventRecords) => {
        if (err) {
            response.message = err.message;
            res.json(response);
            return;
        }
        eventRecordsCount = eventRecords.length;
        if (eventRecordsCount == 0) {
            response.message = err.message;
            res.json(response);
            return;
        }

        // Process all event to uplaod thumbnail.
        for (let index = 0; index < eventRecordsCount; index++) {
            // Create container if does not exists.
            blobService.createContainerIfNotExists(config.azure.container, {
                publicAccessLevel: 'blob'
            },
                function (createError, createResult, createResponse) {
                    if (createError) {
                        logger.error('Unable to save thumbnail due to error: ', createError);
                    }
                    else if (createResponse && createResponse.isSuccessful) {
                        let eventRecord = eventRecords[index],
                            storeId = eventRecord.StoreId.toString(),
                            eventId = eventRecord._id.toString(),
                            imageName = eventId + utils.thumbnailExtension,
                            imageOldPath = utils.getDirectory(utils.thumbnailsPath) + imageName,
                            eventDate = moment.utc(eventRecord.EventTime).format(utils.dateFormat.dateFolderName),
                            azureImageFileName = path.join(storeId, eventDate, utils.thumbnailsPath, imageName); // Create path: storeId/date/Thumbnails/eventId.mp4.          

                        // Upload loal image file on Azure storage.
                        blobService.createBlockBlobFromLocalFile(config.azure.container, azureImageFileName, imageOldPath,
                            function (imageUploadError, imageUploadResult, imageUploadResponse) {
                                if (imageUploadError) {
                                    logger.error('Unable to save thumbnail due to error: ', imageUploadError);
                                }
                                else if (imageUploadResponse && imageUploadResponse.isSuccessful) {
                                    // Once tjumbnail uploaded, move it to processed directory path. 
                                    let imageNewPath = utils.getDirectory(utils.thumbnailsProcessedPath) + imageName;

                                    // Once thumbnail uploadd on Azure, move it to processed folder path. 
                                    fs.rename(imageOldPath, imageNewPath, (moveErr) => {
                                        if (moveErr) {
                                            logger.error('Unable to save thumbnail due to error: ', moveErr);
                                        }
                                        else {
                                            console.info('Thumbnail moved.');
                                        }F
                                    });
                                    if (index + 1 == eventRecordsCount) {
                                        response.success = true;
                                        response.message = "Thumbnails are uploaded.";
                                        res.json(response);
                                    }
                                }
                            }
                        );
                    }
                }
            );
        }
    });
}

// Upload video on Azure.
function uploadOverlayVideo(req, res) {
    let response = { success: false, message: '' };

    if (!req.files || req.files.length <= 0) {
        response.message = "File does not exist.";
        res.json(response);
        return;
    }
    let videoName = req.files[0].filename
    eventId = videoName.split('.')[0];

    EventModel.findById({ _id: eventId.toObjectId() }, (err, eventRecord) => {
        if (err) {
            res.json({ success: false, message: err.message });
            return;
        }
        let storeId = eventRecord.StoreId.toString(),
            eventDate = moment.utc(eventRecord.EventTime).format(utils.dateFormat.dateFolderName),
            azureVideoFileName = path.join(storeId, eventDate, utils.videoPath, videoName); // Create path: storeId/date/Videos/eventId.mp4.

        // Create container if does not exists.
        blobService.createContainerIfNotExists(config.azure.container, {
            publicAccessLevel: 'blob'
        }, function (createError, createResult, createResponse) {
            if (createError) {
                response.message = createError.message;
                res.json(response);
                return;
            }

            // Create video old path, to get the file.
            let videoOldPath = utils.getDirectory('Temp') + videoName;

            // Upload load video file on Azure storage.
            blobService.createBlockBlobFromLocalFile(config.azure.container, azureVideoFileName, videoOldPath,
                function (videoUploadError, videoUploadResult, videoUploadResponse) {
                    if (videoUploadError) {
                        response.message = "Video did not uploaded due to error: " + videoUploadError.message;
                        res.json(response);
                        return;
                    }

                    // Once file uploaded to Azure, delete the file from local.
                    fs.unlinkSync(videoOldPath);

                    // Update event with video availability.
                    EventModel.update({ _id: eventId.toObjectId() }, { $set: { IsOverlayCreated: true } },
                        function (updateError, data) {
                            if (updateError) {
                                response.message = updateError.message;
                                res.json(response);
                                return;
                            }
                            response.success = true;
                            response.message = "Video uploaded successfully.";
                            res.json(response);
                        }
                    );
                }
            );
        });
    });
}

// Upload video and thumbnail on Azure.
async function uploadAureus(req, res) {
    let response = { success: false, message: '' };
    let fromClipCreation = req.body.fromClipCreation;
    logger.error(`Upload Azure Initial: Request Received`);
    let modelName = fromClipCreation == "False" ? EventModel : VideoClipModel;
    if (!req.files || req.files.length <= 0) {
        logger.error(`Upload Azure Initial: Files Count is Zero`);
        response.message = "File does not exist.";
        res.json(response);
        return;
    }
    try {
        let videoName = req.files[0].filename,
            imageName = req.files[1].filename,
            eventId = imageName.split('.')[0];

        logger.error(`Upload Azure Step 1: ${eventId}, videoName: ${videoName}, imageName: ${eventId}`);

        let eventRecord = await modelName.findById({ _id: eventId.toObjectId() });
        if (eventRecord) {
            logger.error(`Upload Azure Step Last - Record found: ${eventId}, videoName: ${videoName}, imageName: ${eventId}`);
            await modelName.findOneAndUpdate({ _id: eventId.toObjectId() }, { $set: { RejectedReason: "Uploading Video to azure" } });

            let eventDetailsInvoiceId = eventRecord.InvoiceId;
            let storeId = eventRecord.StoreId.toString(),
                eventDate = moment.utc(eventRecord.EventTime).format(utils.dateFormat.dateFolderName),
                azureImageFileName = path.join(storeId, eventDate, utils.thumbnailsPath, imageName), // Create path: storeId/date/Thumbnails/eventId.jpg.
                azureVideoFileName = path.join(storeId, eventDate, utils.videoPath, videoName); // Create path: storeId/date/Videos/eventId.mp4.


            // Create container if does not exists.
            blobService.createContainerIfNotExists(config.azure.container, {
                publicAccessLevel: 'blob'
            }, (createError, createResult, createResponse) => {
                if (createError) {
                    logger.error(`Upload Azure Step Blob Container Creation Failed`);
                    response.message = createError.message;
                    res.json(response);
                    return;
                }

                // Create image old path, to get the file.
                let imageOldPath = utils.getDirectory('Temp') + imageName;

                // Upload local image file on Azure storage.
                blobService.createBlockBlobFromLocalFile(config.azure.container, azureImageFileName, imageOldPath,
                    (imageUploadError, imageUploadResult, imageUploadResponse) => {
                        if (imageUploadError) {
                            logger.error(`Upload Azure Step Image Upload Failed: ` + azureImageFileName);
                            response.message = imageUploadError.message;
                            res.json(response);
                            return;
                        }

                        // Once file uploaded to Azure, delete the file from local.
                        fs.unlinkSync(imageOldPath);

                        // Create video old path, to get the file.
                        let videoOldPath = utils.getDirectory('Temp') + videoName;

                        // Upload load video file on Azure storage.
                        blobService.createBlockBlobFromLocalFile(config.azure.container, azureVideoFileName, videoOldPath,
                            async (videoUploadError, videoUploadResult, videoUploadResponse) => {
                                if (videoUploadError) {
                                    logger.error(`Upload Azure Step Video Upload Failed: ` + azureVideoFileName);
                                    response.message = "Thumbnail uploaded but video does not uploaded due to error: " + videoUploadError.message;
                                    res.json(response);

                                    await modelName.findOneAndUpdate({ _id: eventId.toObjectId() }, { $set: { RejectedReason: 'Upload on azure failed: ' + videoUploadError.message, IsRejected: true } });
                                    return;
                                }

                                // Once file uploaded to Azure, delete the file from local.
                                fs.unlinkSync(videoOldPath);

                                // Update event with video availability.
                                modelName.findOneAndUpdate({ _id: eventId.toObjectId() },
                                    { $set: { IsVideoAvailable: true, RejectedReason: 'Available on azure.' } },
                                    async (updateError, data) => {
                                        if (updateError) {
                                            await modelName.findOneAndUpdate({ _id: eventId.toObjectId() }, { $set: { RejectedReason: 'Upload on azure failed', IsRejected: true } });
                                            logger.error(`Upload Azure Update in DB - Failed`);
                                            response.message = updateError.message;
                                            res.json(response);
                                            return;
                                        }
                                        if (data.EventType == 'CustomVideoClip' || data.EventType == 'Alarm') {
                                            let camName = '', siteName = '';
                                            let cameraDetail = await CameraModel.find({ _id: eventRecord.CamId, status: "Active" }).populate('storeId');
                                            if (cameraDetail && cameraDetail.length > 0 && cameraDetail[0].storeId) {
                                                if (cameraDetail[0].storeId.status == "Active") {
                                                    let camera = cameraDetail[0];
                                                    camName = camera.name;
                                                    siteName = camera.storeId.name;
                                                }
                                            }

                                            await modelName.findOneAndUpdate({ _id: eventId.toObjectId() }, { $set: { RejectedReason: 'Sending email...' } });

                                            UserModel.findOne({ _id: data.CreatedByUserId }, async (err, userData) => {
                                                let np = new NotificationParams();
                                                np.tags = {
                                                    FirstName: userData.firstName,
                                                    LastName: userData.lastName,
                                                    SITE: siteName,
                                                    CAMERA: camName,
                                                    StartTime: data.EventTime,
                                                    EndTime: data.EventEndTime,
                                                    Email: userData.email,
                                                    URL: fromClipCreation == "False" ? `https://${req.headers.host}/download/playVideo?&tid=${data._id}` : `https://${req.headers.host}/download/playVideo?modelName=videoClip&tid=${data._id}`
                                                };
                                                np.to = userData.email;
                                                np.template =
                                                    Template.Email.CustomVideoClip;
                                                // Notification.sendInstantEmail(
                                                //   np
                                                // );

                                                Notification.sendEmail(np);

                                                await modelName.findOneAndUpdate({ _id: eventId.toObjectId() }, { $set: { RejectedReason: 'Email sent' } })
                                                response.success = true;
                                                response.message = "Thumbnail and video are uploaded.";
                                                logger.error(`Video Upload Email Success: ${userData.email} EventId: ${eventId}`)
                                                res.json(response);
                                            });
                                        } else {
                                            response.success = true;
                                            response.message = "Thumbnail and video are uploaded.";
                                            res.json(response);
                                        }
                                    }
                                );
                            }
                        );
                    }
                );
            });
        } else {
            logger.error(`Upload Azure Step Last - Record not found: ${eventId}, videoName: ${videoName}, imageName: ${eventId}`);
            await modelName.findOneAndUpdate({ _id: eventId.toObjectId() }, { $set: { RejectedReason: "Event Record not found in DB" } });
            response.success = false;
            response.message = 'Event Record not found in DB';
            res.json(response);
        }

    } catch (ex) {
        logger(`uploadAureusException: ${ex.message || JSON.stringify(ex)}`);
        response.success = false;
        response.message = ex.message || JSON.stringify(ex);
        res.json(response);
    }

}
module.exports = { upload, uploadAureus, uploadThumbnails, uploadOverlayVideo, azureToken };