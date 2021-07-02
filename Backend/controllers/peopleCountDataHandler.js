const PeopleCountModal = require('../modals/peopleCount');
const CameraModal = require('../modals/camera');
var moment = require("moment");
const logger = require("../util/logger");
String.prototype.toObjectId = function () {
    var ObjectId = (require('mongoose').Types.ObjectId);
    return ObjectId(this.toString());
};

function savePeopleCountData(data) {
    let peopleCountData = data.data;
    let prevCameraId = data.camId;
    let prevStoreId = data.storeId
    let oldPeopleCountDate = null;
    logger.info('Save People Count Data: People Count Data: ' + peopleCountData);
    if (peopleCountData && peopleCountData.length > 0) {
        var bulkPeopleCountData = PeopleCountModal.collection.initializeUnorderedBulkOp();
        peopleCountData.forEach(countData => {
            oldPeopleCountDate = countData.PeopleCountDate;
            let camLogDateFilterValue = moment.utc(new Date(countData.PeopleCountDate), 'MM/DD/YYYY 00:00:00')._d;
            bulkPeopleCountData
                .find({ CameraId: countData.CameraId.toObjectId(), PeopleCountDate: camLogDateFilterValue })
                .upsert()
                .updateOne({
                    $set: {
                        StoreId: countData.StoreId.toObjectId(),
                        CameraId: countData.CameraId.toObjectId(),
                        PeopleCountDate: camLogDateFilterValue,
                        InCount: countData.InCount,
                        OutCount: countData.OutCount
                    }
                });
        });

        if (bulkPeopleCountData.length > 0) {
            logger.info('Save People Count Data: Bulk People Count Data: ' + bulkPeopleCountData);
            new Promise(function (resolve, reject) {
                bulkPeopleCountData.execute().then(function (data) {
                    updatePeopleCountDateForCamera(oldPeopleCountDate, prevCameraId, prevStoreId)
                    resolve(data)
                });
            })
        }
    }
}

function updatePeopleCountDateForCamera(date, camId, storeId) {
    CameraModal.find({ _id: camId.toObjectId(), storeId: storeId.toObjectId() }).then((camData, err) => {
        if (err) {
            logger.error(err);
            return;
        }
        if (camData.length > 0 && new Date(date) < new Date()) {
            let new_date = new Date(date);
            new_date = new_date.setDate(new_date.getDate() + 1);
            new_date = moment.utc(new Date(new_date), 'MM/DD/YYYY 00:00:00')._d;
            let updateQuery = { $set: { "lastPeopleCountDate": new_date } }
            CameraModal.updateOne({ _id: camId.toObjectId() }, updateQuery, (err, resp) => {
                if (err) {
                    logger.error(err);
                    return;
                }
            })
        }
    })
}

module.exports = { savePeopleCountData };
