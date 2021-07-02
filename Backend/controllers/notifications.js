const siteNotificationModal = require("./../modals/SiteNotificationLog");
const User = require('../modals/user');
var mongoose = require("mongoose");
/**
 * function to handle GET request to receive all the locations
 * @param {object} req 
 * @param {object} res 
 */
const getNotifications = async (req, res) => {
    var filter = {};
    var storeFilter = {};
    if ((req.session && req.session.user) || req.cookies.rwave) {
        var userId = null;
        if (req.session && req.session.user) {
            userId = req.session.user._id;
        }

        if (userId) {
            User.findById(userId).then(function (user) {
                if (user) {
                    storeFilter = { 'storeId': { $in: user.storeId } };
                    if (user.clientId) {
                        storeFilter.clientId = { '$eq': user.clientId }
                    }
                    var cameraModal = mongoose.model("camera");
                    var queryStore = cameraModal.find(storeFilter);
                    queryStore.lean().exec(function (err, cameraData) {
                        if (!err) {
                            filter = { 'camId': { $in: cameraData.map(function (strVale) { return strVale._id }) }, 'status': { $eq: true } };
                            var query = siteNotificationModal.find(filter).populate('camId');
                            query.lean().exec(function (err, data) {
                                if (!err) {
                                    res.json({
                                        offlineCameraCount: data.length, success: true
                                    });
                                } else {
                                    res.json({
                                        stores: [], data: [], success: false
                                    });
                                }
                            });
                        } else {
                            res.json({
                                stores: [], data: [], success: false
                            });
                        }
                    })
                } else {
                    res.json({
                        stores: [], data: [], success: false
                    });
                }
            }).catch(function () {
                res.json({
                    stores: [], data: [], success: false
                });
            })
        } else {
            res.json({
                stores: [], data: [], success: false
            });
        }
    } else {
        res.json({
            stores: [], data: [], success: false
        });
    }
}
module.exports = {
    getNotifications

}