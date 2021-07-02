const ScaleModel = require("./../modals/scale");
const moment = require('moment');
const util = require('./../util/util');
class DataUpload {
    static get UploadAction() {
        return {
            SCALE: 1,
            POS: 2
        }
    }

    static execute = async (req, res, next) => {
        let response = { success: false, message: 'Data not able upload' };
        const params = Object.assign({}, req.body, req.query);

        switch (Number(params.action)) {
            case DataUpload.UploadAction.SCALE:
                response = await this.ScaleUpload(params);
                break;

            default:
                response.message = "invalid Action";
                break;
        }

        res.json(response);
    }

    static ScaleUpload = async (params) => {
        const { data = [], storeId } = params;
        var bulkInsert = ScaleModel.collection.initializeUnorderedBulkOp();
        let scaleRecord = JSON.parse(data);
        scaleRecord.forEach(item => {
            bulkInsert
                .find({ Uid: item.Uid })
                .upsert()
                .updateOne({
                    $set: {
                        CamId: util.mongooseObjectId(item.CamId),
                        Uid: item.Uid,
                        StoreId: util.mongooseObjectId(storeId),
                        ScaleId: util.mongooseObjectId(item.ScaleId),
                        DateTime: moment(moment.utc(item.DateTime).format("YYYY-MM-DD HH:mm:ss")).toDate(),
                        DateTimeString : moment(item.DateTime).format(util.dateFormat.dateTimeFormatAmPm),
                        Weight: Number(item.Weight),
                        isProcessed : false
                    }
                });
        });
        if (bulkInsert.length > 0) {
            let result = await bulkInsert.execute();
            if (result.ok) {
                return { success: true }
            } else {
                return {
                    success: false,
                    message: "Data Not inserted"
                }
            }
        }
    }
}
module.exports = DataUpload;