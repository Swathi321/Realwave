const restHandler = require('./restHandler')();
const eventLikeModel = require('../modals/EventLike');
restHandler.setModelId('eventLike');
var util = require("../util/util");
/**
 * function to handle GET request to receive all the locations
 * @param {object} req 
 * @param {object} res 
 */

String.prototype.toObjectId = function () {
    var ObjectId = (require('mongoose').Types.ObjectId);
    return ObjectId(this.toString());
};

function getSetEventLikeData(req, res) {
    let params = Object.assign({}, req.body, req.query),
        response = { success: true, message: "", data: null };
    util.getUserDetail(req.session.user._id).then(function (data) {
        if (data && data._id) {
            eventLikeModel.update({ eventId: params.id.toObjectId(), userId: data._id },
                { $set: { userId: data._id, eventId: params.id, status: params.status } }, { upsert: true }, function (err, data) {
                    if (err) {
                        response.success = false;
                        response.message = err.message;
                    } else {
                        response.success = true;
                        response.message = "success";
                    }
                    res.json(response);
                }
            )
        }
    })

}
module.exports = { getSetEventLikeData };