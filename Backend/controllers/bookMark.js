const restHandler = require('./restHandler')();
const bookMarkModal = require('./../modals/bookMark');
restHandler.setModelId('bookMark');
const common = require('./common');
const moment = require('moment');
const logger = require('./../util/logger');

/**
 * function to handle GET request to receive all the locations
 * @param {object} req 
 * @param {object} res 
 */

async function bookMarkData(req, res) {
    let requestOption = Object.assign(req.body, req.query, req.params);
    let { action, storeId, camId, startDate, endDate, page, pageSize } = requestOption;

    let response = {
        error: false,
        data: [],
        success: true,
        total: 0
    };

    try {

        if (action != "list")
            return common.getData(req, res, restHandler);

        let aggregateOption = [{
            $addFields: {
                convertedDate: { $toDate: "$start" }
            }
        },
        {
            "$match":
            {
                storeId: storeId,
                camId: camId,
            }
        }];

        if (startDate) {
            if (!aggregateOption[1].$match["convertedDate"]) { aggregateOption[1].$match["convertedDate"] = {} }
            aggregateOption[1].$match["convertedDate"]["$gte"] = moment(startDate).startOf('day').toDate();
        }

        if (endDate) {
            if (!aggregateOption[1].$match["convertedDate"]) { aggregateOption[1].$match["convertedDate"] = {} }
            aggregateOption[1].$match["convertedDate"]["$lte"] = moment(endDate).toDate();
        }

        aggregateOption.push({ '$sort': { '_id': -1 } });
        aggregateOption.push({ $limit: Number(pageSize || 100) });
        // aggregateOption.push({
        //     '$facet': {
        //         pagination: [{ $count: "total" }],
        //         record: [{ $skip: (Number(page || 1) - 1) * Number(pageSize || 500) }, { $limit: Number(pageSize || 500) }] // add projection here wish you re-shape the docs
        //     }
        // });

        let data = await bookMarkModal.aggregate(aggregateOption);

        // response.total = data[0].pagination[0].total;
        // response.data = data[0].record;
        response.data = data;
    } catch (ex) {
        logger.error(ex);
        response.success = false;
    }

    res.json(response);
}
module.exports = { bookMarkData };