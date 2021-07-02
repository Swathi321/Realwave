const cameraLogsModel = require('../modals/cameraLogs');
var moment = require("moment");
const util = require("../util/util");
var mongoose = require("mongoose");
String.prototype.toObjectId = function () {
    var ObjectId = (require('mongoose').Types.ObjectId);
    return ObjectId(this.toString());
};

function saveCameraLogs(data) {
    let cameraLogsData = data.data
    if (cameraLogsData && cameraLogsData.length > 0) {
        var bulkLogs = cameraLogsModel.collection.initializeUnorderedBulkOp();
        cameraLogsData.forEach(logContent => {
            let camLogDateFilterValue = new Date(moment.utc(logContent.camLogDate, util.dateFormat.cameraLogDateFormat).format(util.dateFormat.cameraLogMongoDateFormat) + "Z");
            bulkLogs
                .find({ CameraId: logContent.cameraId.toObjectId(), CamLogDate : camLogDateFilterValue, CamLogDescription : logContent.camLogDescription, CamLogInformation : logContent.camLogInformation })
                .upsert()
                .updateOne({
                    $set: {
                        StoreId: logContent.storeId.toObjectId(),
                        CameraId: logContent.cameraId.toObjectId(),
                        CamLogDate: camLogDateFilterValue,
                        CamLogType: logContent.camLogType,
                        CamLogDescription: logContent.camLogDescription,
                        CamLogInformation : logContent.camLogInformation
                    }
                });
        });

        if (bulkLogs.length > 0) {

            new Promise(function (resolve, reject) {
                bulkLogs.execute().then(function (data) {
                    resolve(data)
                });
            })
        }
    }
}


module.exports = { saveCameraLogs };
