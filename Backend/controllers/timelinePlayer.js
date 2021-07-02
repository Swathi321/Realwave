
const events = require('events');
var eventEmitter = new events.EventEmitter();
const socket = require('../plugin/Socket');
var streamifier = require('streamifier');
const StoreModel = require('./../modals/store');
const util = require('./../util/util');
module.exports = function () {
    var handler = {
        /**
         * @desc - Listen the Get timeline request
         * @param {object} req - hold request object
         * @param {object} res - hold response object
         */
        timelinePlayer: function (req, res) {
            var params = Object.assign({}, req.body, req.query);
            var { storeId, camId, startDate, endDate } = params;
            StoreModel.findOne({ _id: util.mongooseObjectId(storeId) }, (err, storeData) => {
                let resp = { connected: false, message: '' };
                resp.connected = storeData.isConnected;
                if (err) {
                    resp.message = err.message;
                    res.json(response);
                    return;
                }

                if (storeData.isConnected) {
                    let range = {};
                    if (!util.isNull(startDate) && !util.isNull(endDate)) {
                        range = {
                            startDate,
                            endDate
                        }
                    }
                    socket.Send({ action: 'videoTimeLine', data: { storeId: storeId, camId: camId, ...range } });
                    let videoTimeLineResponseHandler = (response) => {
                        res.json(Object.assign({}, response, { connected: true }));
                    };
                    eventEmitter.once('videoTimeLineResponse', videoTimeLineResponseHandler);
                    return;
                }

                resp.message = "Hub is not connected";
                res.json(resp);
            });
        },
        /**
         * @desc - Listen the video TimeLine response from On Site
         * @param {object} req - hold request object
         * @param {object} res - hold response object
         */
        reponseTimelinePlayer: function (req, res) {
            let { data } = req.body;
            eventEmitter.emit('videoTimeLineResponse', JSON.parse(data));
            res.json({ success: true, message: 'data updated' });
        },
        /**
         * @desc - Listen the get video request
         * @param {object} req - hold request object
         * @param {object} res - hold response object
         */
        loadVideo: function (req, res) {
            let { storeId, video, size, camId, dir } = req.params;
            let range = req.headers.range;
            let parts = range ? range.replace(/bytes=/, "").split("-") : [0];
            let start = parseInt(parts[0], 10);
            let end = start + process.env.defaultChunkSize < size - 1 ? start + process.env.defaultChunkSize : size - 1;
            //"5c3847754e9e0f38f4e6607c"
            socket.Send({ action: 'loadTimeLineVideo', data: { storeId: storeId, dir: dir, camId: camId, start: start, end: end, video: video, size: size } });
            let videoResponseHandler = (response) => {
                //streamifier.createReadStream(_Response).pipe(res);
                let file = streamifier.createReadStream(response);
                let chunksize = (end - start) + 1
                let head = {
                    'Content-Range': `bytes ${start}-${end}/${size}`,
                    'Accept-Ranges': 'bytes',
                    'Content-Length': chunksize,
                    'Content-Type': 'video/mp4',
                }
                res.writeHead(206, head)
                file.pipe(res);
            };
            eventEmitter.once('videoResponse', videoResponseHandler);
        },
        /**
         * @desc - Listen the video response from On Site
         * @param {object} req - hold request object
         * @param {object} res - hold response object
         */
        reponseTimelineVideo: function (req, res) {
            eventEmitter.emit('videoResponse', req.body);
        }
    }
    return handler;
};