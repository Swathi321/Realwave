var mongoose = require("mongoose");
var util = require("../util/util");
function getTemperature(req, res) {
    var data = Object.assign({}, req.body, req.query);
    var StoreModel = mongoose.model("store");
    var SmartDeviceLogModel = mongoose.model("smartDeviceLog");
    if (data.storeId) {
        StoreModel.findById(data.storeId).then(function (store) {
            if (store) {
                SmartDeviceLogModel.aggregate([
                    {
                        $match: {
                            DeviceSerial: { $in: store.smartDevices },
                            RecordType: 'HealthRecord'
                        }
                    },
                    {
                        $sort: {
                            EventTime: 1
                        }
                    },
                    {
                        $group: {
                            _id: '$DeviceSerial',
                            lastId: { $last: '$_id' },
                            Temperature: { $last: '$Temperature' },
                            EventTime: { $last: '$EventTime' }
                        }
                    },
                    {
                        $project: {
                            _id: '$lastId',
                            DeviceSerial: '$_id',
                            Temperature: 1,
                            EventTime: 1
                        }
                    },
                ]).then((data, error) => {
                    res.json({
                        success: true, data: data
                    })
                })
            } else {
                res.json({
                    success: false, data: []
                })
            }
        })
    } else {
        res.json({
            success: false, data: []
        })
    }
}

module.exports = { getTemperature };