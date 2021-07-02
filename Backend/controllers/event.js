const restHandler = require('./restHandler')();
restHandler.setModelId('event', ["CamId.name"], "Event");
const util = require("../util/util");
const EventModel = require("./../modals/Event");
const moment = require('moment');
const logger = require("./../util/logger");
const common = require('./common');

const createCustomVideoClip = async (req, res, next) => {
    let params = Object.assign({}, req.body, req.query, req.params);
    let { storeId, camId, startTime, endTime } = params;
    let response = { success: false, message: null };
    try {
        let eventId = moment.utc().format(util.dateFormat.eventId);
        let newEvent = new EventModel({
            EventId: eventId,
            InvoiceId: eventId,
            EventTime: startTime,
            EventEndTime: endTime,
            EventType: 'CustomVideoClip',
            IsVideoAvailable: false,
            StoreId: storeId,
            CamId: camId,
            CreatedByUserId: req.session.user._id
        });
        let resp = await newEvent.save();
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

    let filtersObject = {
        IsRejected: false,
        StoreId: params.StoreId,
        //EventTime: { $lt: maxDateTime },
        IsVideoAvailable: false,
        EventType: 'CustomVideoClip'
    };

    try {
        // Get Ecent details by storeId and camera URL.
        let result = await EventModel.find(filtersObject).populate('CamId');
        let events = [];
        // Loop through result events to create required event object list.
        result.forEach(item => {
            if (item.EventTime) {
                let recordPreTime = moment(item.EventTime),
                    recordPostTime = moment(item.EventEndTime),
                    startTime = recordPreTime.format(util.dateFormat.dateTimeFormatAmPm),
                    endTime = recordPostTime.format(util.dateFormat.dateTimeFormatAmPm);

                let camera = item.CamId;
                // Create event object and add to events list.
                events.push({
                    eventId: item._id,
                    eventType: item.EventType,
                    eventTime: item.EventTime,
                    startTime: startTime,
                    endTime: endTime,
                    camId: camera._id.toString(),
                    primaryStreamId: camera.primaryStreamId,
                    primaryCameraId: camera.primaryCameraId
                });
            }
        });

        // create final response.
        response.success = true;
        response.data = events;
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

module.exports = {
    createCustomVideoClip,
    getNonProcessedVideoClip
}