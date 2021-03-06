const fs = require('fs');
const path = require('path');
const moment = require('moment');
const CameraModel = require('./../modals/camera');
const Event = require('./../modals/Event');
const util = require('./../util/util');
const logger = require('./../util/logger');
const StoreModal = require('./../modals/store');
const parseString = require('xml2js').parseString;
const config = require('./../config');
const azure = require('azure-storage');
const eventDetailModel = require("./../modals/EventDetail");
var blobService = azure.createBlobService(config.azure.account, config.azure.key);
String.prototype.toObjectId = function () {
    var ObjectId = (require('mongoose').Types.ObjectId);
    return ObjectId(this.toString());
};

function createVideoThumbnails(base64Data, tid) {
    let fileName = util.getDirectory('thumbnails') + tid + util.thumbnailExtension;
    return new Promise((resolve, reject) => {
        fs.writeFile(fileName, base64Data, 'base64', function (err) {
            if (err) {
                reject(err);
                return;
            }
            resolve({ success: true });
        });
    });
}

function facialProcces(req, res, json) {
    let { Image, Info, UtcDate, SerialKey, CamURL } = json,
        userInfo = Info ? JSON.parse(Info) : [],
        eventTime = moment.utc(UtcDate, util.dateFormat.dateTimeFormatAmPm),
        capturedImage = Image;
    let response = { success: false, message: '', data: [] };

    if (!CamURL) {
        response.messge = 'Invalid camera Url.';
        res.json(response);
        return;
    }
    if (!SerialKey) {
        response.messge = 'Invalid serial key.';
        res.json(response);
        return;
    }
    StoreModal.findOne({ serialNumber: SerialKey }, function (err, storeResult) {
        if (err) {
            response.message = err.message;
            res.json(response);
            return;
        }
        if (!storeResult) {
            response.messge = 'Store not found.';
            res.json(response);
            return;
        }
        let storeId = storeResult._id;
        util.getCamIdFormStore(storeId, CamURL, function (camId) {
            if (!camId) {
                response.message = 'Camera Not found.';
                res.json(response);
                return;
            }
            CameraModel.find({ cameraRTSPUrl: CamURL.trim(), _id: camId }, function (err, cameraResult) {
                if (err) {
                    response.messge = err.message;
                    res.json(response);
                    return;
                }
                if (!cameraResult) {
                    response.messge = 'Camera Not found.';
                    res.json(response);
                    return;
                }
                cameraResult.forEach(cameraRecord => {
                    let category = util.getCategory({
                        EventType: 'Face',
                        Total: 0,
                        Status: 'Face'
                    });
                    let eventId = moment.utc().format(util.dateFormat.eventId);
                    let newEvent = new Event({
                        EventId: eventId,
                        EventTime: eventTime,
                        EventType: 'Face',
                        InvoiceId: eventId,
                        Register: 0,
                        New: false,
                        SubTotal: 0.0,
                        Tax: 0.0,
                        Total: 0.0,
                        Discount: 0.0,
                        Payment: [],
                        OperatorName: 'Devesh Kumar',
                        Status: 'Face',
                        AuditStatus: '',
                        IsVideoAvailable: false,
                        Category: category,
                        CamId: util.mongooseObjectId(camId),
                        StoreId: util.mongooseObjectId(storeId),
                        UserInfo: userInfo,
                        IsRejected: false,
                        IsImageAvailable: true
                    });
                    newEvent.save()
                        .then(inserted => {
                            // insert event face details
                            new eventDetailModel({
                                EventId: eventId,
                                EventTime: eventTime,
                                EventType: 'Face',
                                InvoiceId: eventId,
                                Register: 0,
                                New: false,
                                SubTotal: 0.0,
                                Tax: 0.0,
                                Total: 0.0,
                                Discount: 0.0,
                                Payment: [],
                                OperatorName: 'Devesh Kumar',
                                Status: 'Face',
                                AuditStatus: '',
                                Category: category,
                                CamId: util.mongooseObjectId(camId),
                                StoreId: util.mongooseObjectId(storeId),
                                StoreName: storeResult && storeResult.name || '',
                                CamName: cameraResult && cameraResult.name || '',
                                IsVideoAvailable: true,
                                PrimaryId: inserted._id.toString(),
                                InvoiceTotal: 0.0,
                                InvoiceDiscount: 0.0
                            }).save();

                            let tid = inserted._id.toString(),
                                event = {
                                    eventId: tid
                                };
                            var userName = '';
                            if (userInfo && userInfo.length > 0) {
                                var users = [];
                                userInfo.forEach(element => {
                                    users.push(element.Name)
                                });
                                userName = users.join(',')
                            }
                            util.createAlert({
                                storeId: storeId,
                                cameraId: camId,
                                type: 'Face Detected',
                                eventTime: moment.utc(),
                                status: 'Open',
                                details: userName,
                                closedOn: null
                            }, true)
                            if (!capturedImage) {
                                response.success = true;
                                response.data = event;
                                res.json(response);
                                return;
                            }
                            if (capturedImage) {
                                if (config.isLocal) {
                                    storeId = storeId.toString();
                                    let eventDate = moment.utc(inserted.EventTime).format(util.dateFormat.dateFolderName),
                                        azureImageFileName = path.join(storeId, eventDate, util.thumbnailsPath, tid + '.jpg'); // Create path: storeId/date/Thumbnails/eventId.jpg.

                                    let defaultFilePath = util.getDirectory('realwavecamfeed');
                                    if (!fs.existsSync(defaultFilePath)) {
                                        fs.mkdirSync(defaultFilePath)
                                    }

                                    if (!fs.existsSync(defaultFilePath + '/' + storeId)) {
                                        fs.mkdirSync(defaultFilePath + '/' + storeId)
                                    }

                                    if (!fs.existsSync(defaultFilePath + '/' + storeId + '/' + eventDate)) {
                                        fs.mkdirSync(defaultFilePath + '/' + storeId + '/' + eventDate)
                                    }

                                    if (!fs.existsSync(defaultFilePath + '/' + storeId + '/' + eventDate + '/' + util.thumbnailsPath)) {
                                        fs.mkdirSync(defaultFilePath + '/' + storeId + '/' + eventDate + '/' + util.thumbnailsPath)
                                    }


                                    var base64Data = capturedImage.replace(/^data:image\/png;base64,/, "");
                                    fs.writeFile(defaultFilePath + "/" + azureImageFileName, base64Data, 'base64', function (err) {
                                        logger.error(err);
                                        if (err) {
                                            logger.error('FacialRec:' + err);
                                            response.messge = err.message;
                                            res.json(response);
                                            return;
                                        }
                                        response.success = true;
                                        response.data = event;
                                        res.json(response);
                                        return;
                                    });
                                } else {
                                    createVideoThumbnails(capturedImage, tid)
                                        .then(function (result) {
                                            // Create container if does not exists.
                                            blobService.createContainerIfNotExists(config.azure.container, {
                                                publicAccessLevel: 'blob'
                                            }, function (createError, createResult, createResponse) {
                                                if (createError) {
                                                    response.success = false;
                                                    response.message = createError.message;
                                                    res.json(response);
                                                    return;
                                                }

                                                // Create image old path, to get the file.
                                                let imageOldPath = utils.getDirectory('thumbnails') + tid + util.thumbnailExtension;

                                                // Upload local image file on Azure storage.
                                                blobService.createBlockBlobFromLocalFile(config.azure.container, azureImageFileName, imageOldPath,
                                                    function (imageUploadError, imageUploadResult, imageUploadResponse) {
                                                        if (imageUploadError) {
                                                            response.success = false;
                                                            response.message = imageUploadError.message;
                                                            res.json(response);
                                                            return;
                                                        }

                                                        // Once file uploaded to Azure, delete the file from local.
                                                        fs.unlinkSync(imageOldPath);
                                                    }
                                                );
                                            }, function (err) {
                                                logger.error('FacialRec:' + err);
                                                response.messge = err.message;
                                                res.json(response);
                                                return;
                                            });

                                        });
                                };
                            };
                        });
                });
            });
        });
    });
}

function facialRecPOST(req, res) {
    let params = Object.assign({}, req.body, req.params);
    var body = '';
    let response = { success: false, message: '', data: [] };
    req.on('data', function (data) {
        body += data;
        parseString(body, function (err, json) {
            if (err) {
                logger.error(err);
                return;
            }
            let { storeId, camId } = params;

            if (!camId) {
                response.messge = 'Invalid camera Url.';
                res.json(response);
                return;
            }
            if (!storeId) {
                response.messge = 'Invalid serial key.';
                res.json(response);
                return;
            }

            var envelope = json["SOAP-ENV:Envelope"];
            var CamURL = "";
            var eventTime = null;
            var userInfo = [];
            var image = null;
            if (envelope) {
                let body = envelope["SOAP-ENV:Body"];
                if (body && Array.isArray(body)) {
                    for (let index = 0, len = body.length; index < len; index++) {
                        const element = body[index];
                        if (element && element.CustomerInfoRequest && Array.isArray(element.CustomerInfoRequest)) {
                            for (let j = 0; j < element.CustomerInfoRequest.length; j++) {
                                const customerInfoRequest = element.CustomerInfoRequest[j];
                                CamURL = customerInfoRequest.conn_info[0];
                                eventTime = moment.utc(customerInfoRequest.utcTime[0], "YYYY-MM-DDTHH:mm:ss");
                                userInfo.push({
                                    Name: customerInfoRequest && customerInfoRequest.externalId.length > 0 ? customerInfoRequest.externalId[0] : null,
                                    PersonId: customerInfoRequest && customerInfoRequest.person_id.length > 0 ? customerInfoRequest.person_id[0] : null,
                                    RecognizeTime: customerInfoRequest && customerInfoRequest.utcTime.length > 0 ? customerInfoRequest.utcTime[0] : null,
                                    RecognizeScore: customerInfoRequest && customerInfoRequest.Image1.length > 0 ? (Number(customerInfoRequest.Image1[0].MatchScore[0]) * 100) : null
                                });
                                image = customerInfoRequest && customerInfoRequest.Image1.length > 0 ? customerInfoRequest.Image1[0].capturedImage[0]._ : null;
                            }
                        }
                    }
                }
            }

            StoreModal.findById(storeId, function (err, storeResult) {
                if (err) {
                    response.message = err.message;
                    res.json(response);
                    return;
                }
                if (!storeResult) {
                    response.messge = 'Store not found.';
                    res.json(response);
                    return;
                }
                let storeId = storeResult._id;
                CameraModel.findOne({ cameraRTSPUrl: CamURL.trim(), storeId: storeId }, function (err, cameraResult) {
                    let category = util.getCategory({
                        EventType: 'Face',
                        Total: 0,
                        Status: 'Face'
                    });
                    let eventId = moment.utc().format(util.dateFormat.eventId);
                    let newEvent = new Event({
                        EventId: eventId,
                        EventTime: eventTime,
                        EventType: 'Face',
                        InvoiceId: eventId,
                        Register: 0,
                        New: false,
                        SubTotal: 0.0,
                        Tax: 0.0,
                        Total: 0.0,
                        Discount: 0.0,
                        Payment: [],
                        OperatorName: 'Devesh Kumar',
                        Status: 'Face',
                        AuditStatus: '',
                        IsVideoAvailable: true,
                        Category: category,
                        CamId: util.mongooseObjectId(camId),
                        StoreId: util.mongooseObjectId(storeId)
                    });
                    newEvent.save()
                        .then(inserted => {
                            // insert event face details
                            new eventDetailModel({
                                EventId: eventId,
                                EventTime: eventTime,
                                EventType: 'Face',
                                InvoiceId: eventId,
                                Register: 0,
                                New: false,
                                SubTotal: 0.0,
                                Tax: 0.0,
                                Total: 0.0,
                                Discount: 0.0,
                                Payment: [],
                                OperatorName: 'Devesh Kumar',
                                Status: 'Face',
                                AuditStatus: '',
                                Category: category,
                                CamId: util.mongooseObjectId(camId),
                                StoreId: util.mongooseObjectId(storeId),
                                StoreName: storeResult && storeResult.name || '',
                                CamName: cameraResult && cameraResult.name || '',
                                IsVideoAvailable: true,
                                PrimaryId: inserted._id.toString(),
                                InvoiceTotal: 0.0,
                                InvoiceDiscount: 0.0
                            }).save();

                            let tid = inserted._id.toString(),
                                event = {
                                    eventId: tid
                                };
                            var userName = '';
                            if (userInfo && userInfo.length > 0) {
                                var users = [];
                                userInfo.forEach(element => {
                                    users.push(element.Name)
                                });
                                userName = users.join(',')
                            }

                            let storeId = inserted.StoreId.toString(),
                                eventDate = moment.utc(inserted.EventTime).format(util.dateFormat.dateFolderName),
                                azureImageFileName = path.join(storeId, eventDate, util.thumbnailsPath, tid + '.jpg'); // Create path: storeId/date/Thumbnails/eventId.jpg.

                            let defaultFilePath = util.getDirectory('realwavecamfeed');
                            if (!fs.existsSync(defaultFilePath)) {
                                fs.mkdirSync(defaultFilePath)
                            }

                            if (!fs.existsSync(defaultFilePath + '/' + storeId)) {
                                fs.mkdirSync(defaultFilePath + '/' + storeId)
                            }

                            if (!fs.existsSync(defaultFilePath + '/' + storeId + '/' + eventDate)) {
                                fs.mkdirSync(defaultFilePath + '/' + storeId + '/' + eventDate)
                            }

                            if (!fs.existsSync(defaultFilePath + '/' + storeId + '/' + eventDate + '/' + util.thumbnailsPath)) {
                                fs.mkdirSync(defaultFilePath + '/' + storeId + '/' + eventDate + '/' + util.thumbnailsPath)
                            }

                            if (image) {
                                var base64Data = image.replace(/^data:image\/png;base64,/, "");
                                fs.writeFile(defaultFilePath + "/" + azureImageFileName, base64Data, 'base64', function (err) {
                                    logger.error(err);
                                });
                            }
                            util.createAlert({
                                storeId: storeId,
                                cameraId: camId,
                                type: 'Face Detected',
                                eventTime: moment.utc(),
                                status: 'Open',
                                details: userName,
                                closedOn: null
                            }, true)

                            response.success = true;
                            response.data = event;
                            res.json(response);

                        });
                });
            });
        });
    });

}


function facialRec(req, res) {
    let josnData = Object.assign({}, req.body, req.params);
    facialProcces(req, res, josnData);
}

module.exports = { facialRec, facialRecPOST };