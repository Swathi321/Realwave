const restHandler = require('./restHandler')();
restHandler.setModelId('realwaveVideoClip', ["CamId.name"], "realwaveVideoClip");
const util = require("../util/util");
const RealwaveVideoClip = require("../modals/VideoClips");
const moment = require('moment');
const logger = require("../util/logger");
const common = require('./common');
var userModel = new require("../modals/user");
const EventModel = require("../modals/Event");
const enums = require('../util/enum');


const createVideoClip = async (req, res, next) => {
    let params = Object.assign({}, req.body, req.query, req.params);
    let { storeId, camId, startTime, endTime, utcOffSet, type, videoDescription, preTime, postTime } = params;
    let response = { success: false, message: null };
    try {
        let newVideoClip = new RealwaveVideoClip({
            CamId: camId,
            StoreId: storeId,
            CreatedByUserId: req.session.user._id,
            IsVideoAvailable: false,
            Type: type,
            Description: videoDescription,
            StartTime: moment(startTime).format(util.dateFormat.dateTimeFormatAmPm),
            EndTime: moment(endTime).format(util.dateFormat.dateTimeFormatAmPm),
            PreTime: preTime,
            PostTime: postTime,
            TimezoneOffset: -(utcOffSet),

        });
        let resp = await newVideoClip.save();
        if (resp) {
            response.success = true;
            response.message = "Video clip creation has started. Continue working as clip creation completes.";
        } else {
            response.message = "Something went wrong, please try again.";
        }
    } catch (ex) {
        response.message = ex.message;
    }
    res.json(response);
}

const getNonProcessedVideoClip = async (req, res, next) => {
        let params = Object.assign({}, req.body, req.query, req.params),
        requestDateTime = moment.utc(params.CurrentDateTime, util.dateFormat.dateTimeFormatAmPm),
        maxDateTime = requestDateTime.subtract({ hours: 1 }),
        response = { success: false, message: null, data: [] };
    let encryptedValue = await common.sha256(params.StoreId + process.env.secretKey);
    let timezoneOffSetValue = params.TimeZoneOffset;
    let isValidRequest = params.token.toLowerCase() == encryptedValue.toLowerCase();
    let checkValidityOfRequest = await common.decrypt(params.validity);
    let isPOS = params.IsPOSTask;
    if (!isValidRequest || !checkValidityOfRequest) {
        // logger.info("Invalid Request due to API time validity expires : " + checkValidityOfRequest + ", is token Invalid : " + isValidRequest);
        response.message = "Invalid request";
        return res.json(response);
    }

    let filtersObject = {
        IsProcessed: false,
        StoreId: params.StoreId,
        IsVideoAvailable: false
    };

    logger.info(`Create Clip Request StoreId: ${params.StoreId}`);
    
    try {
        logger.info('Create Clip Request Filter: ' + JSON.stringify(filtersObject));
        // Get Ecent details by storeId and camera URL.

        let result = await RealwaveVideoClip.find(filtersObject).populate('CamId StoreId');
        let videoClip = [];

        logger.info('Create Clip, Recound Count: ' + result.length);

        // Loop through result events to create required event object list.
        result.forEach(async (item) => {
            logger.info('Create Clip: ' + item.EventTime);
            if (item.CamId && item.StoreId) {
                if (item.Type == enums.VIDEO_CLIP_TYPE.POS || item.Type == enums.VIDEO_CLIP_TYPE.SCALE || item.Type == enums.VIDEO_CLIP_TYPE.ACCESSCONTROL) {
                    let preTime = 15;
                    let postTime = 15;

                    if (item.CamId) {
                        preTime = item.PreTime;
                        postTime = item.PostTime;
                    }

                    let currentEventTime = moment(item.StartTime); //10:10
                    let currentEndTime = item.EndTime ? moment(item.EndTime) : moment(item.StartTime); // 10:17

                    let maxEndTime = moment(currentEventTime._d).add(2, "minutes"); // 10:12

                    if (currentEndTime >= maxEndTime) { //10:11 >= 10:12
                        currentEndTime = maxEndTime;
                    }

                    let currentTimeStart = moment(currentEventTime._d);
                    let currentTimeEnd = moment(currentEndTime._d);
                    item.StartTime = currentTimeStart.subtract(preTime, "seconds");
                    item.EndTime = currentTimeEnd.add(postTime, "seconds");

                }

                let recordPreTime = util.GetStoreLocalTimeByStore(item.StartTime),
                    recordPostTime = util.GetStoreLocalTimeByStore(item.EndTime),
                    startTime = recordPreTime.format(util.dateFormat.dateTimeFormatAmPm),
                    endTime = recordPostTime.format(util.dateFormat.dateTimeFormatAmPm);

                let camera = item.CamId;
                // Create event object and add to events list.
                data = {
                    clipId: item._id.toString(),
                    type: item.Type,
                    startTime: startTime,
                    endTime: endTime,
                    camId: camera._id.toString(),
                    recordingStreamId: camera.recordingStreamId,
                    primaryCameraId: camera.primaryCameraId

                }
                videoClip.push(data);
            }

        });

        logger.info('Create Clip, Recound Count Send Back: ' + videoClip.length);

        // create final response.
        response.success = true;
        response.data = videoClip;
    } catch (ex) {
        logger.error("API_GetNonProcessedVideoClipError", ex);
        response.success = false;
        response.message = ex.message || ex;
    }
    res.json(response);
}

/**
 * function to handle GET request to receive all the locations
 * @param {object} req 
 * @param {object} res 
 */
const getPendingVideoClip = async (req, res) => {
    let params = Object.assign({}, req.body, req.query, req.params);
    let defaultFilter = [];
    let loggedInUser = await userModel.find({ _id: req.session.user._id }).populate("roleId");
    // if (loggedInUser && loggedInUser.length > 0 && loggedInUser[0].roleId && loggedInUser[0].roleId.name == "Admin") {

    // }
    // else {
    //     defaultFilter = [
    //         { CreatedByUserId: { $in: [req.session.user._id] } }
    //     ];
    // }

    if (!params.showAllRecords) {
        defaultFilter.push({ IsVideoAvailable: { $eq: false } })
    }
    if (params.filterText && params.filterText != "undefined") {
        defaultFilter = defaultFilter.concat([{ RejectedReason: { $regex: params.filterText, $options: '$i' } }])
    }
    if (params.selectedValue) {
        let selectedValue = JSON.parse(params.selectedValue);
        if (selectedValue.length > 0) {
            defaultFilter = defaultFilter.concat([{ StoreId: { $in: selectedValue.map((storeId) => storeId) } }])
        }
    }
    switch (params.action) {
        case 'delete':
            restHandler.deleteResource(req, res);
            break;
        default:
            restHandler.getResources(req, res, null, null, defaultFilter);
            break;
    }
}

const syncClipData = async (req, res) => {
    let params = Object.assign({}, req.body, req.query, req.params);
    let { storeId, status, clipId, rejectedReason } = params;
    let videoAvailable = false;
    let videoStatus = enums.VIDEO_CLIP_STATUS.NOT_CREATED;
    switch (status) {
        case "Created":
        case "created":
            videoAvailable = true;
            videoStatus = enums.VIDEO_CLIP_STATUS.CREATED;

            break;
        case "Failed":
        case "failed":
            videoStatus = enums.VIDEO_CLIP_STATUS.FAILED;
            break;
        default:
            break;
    }
    let response = { success: false, message: null, data: [] };
    let filtersObject = {
        StoreId: params.storeId,
        _id: params.clipId
    };

    let updateQuery = { IsVideoAvailable: videoAvailable, Status: videoStatus, IsProcessed: true, RejectedReason: rejectedReason }

    let result = null;
    try {
        logger.info('Create Clip Request Filter: ' + JSON.stringify(filtersObject));
        // Get Ecent details by storeId and camera URL.

        result = await RealwaveVideoClip.findByIdAndUpdate(params.clipId, updateQuery, { new: true },
            function (err, data) {
                // Handle any possible database errors
                if (!err) {
                    response.success = true;
                    response.data = data;
                }

            });

    }
    catch (ex) {
        response.success = false;
        response.message = ex.message || ex;
    }
    res.json(response);
}

module.exports = {
    createVideoClip,
    getNonProcessedVideoClip,
    getPendingVideoClip,
    syncClipData
}