const restHandler = require('./restHandler')();
const ActivityLogModal = require('./../modals/ActivityLog');
restHandler.setModelId('activityLog');

/**
 * function to handle GET request to receive all the locations
 * @param {object} req 
 * @param {object} res 
 */

function activityLogData(req, res) {
    switch (req.body.action) {
        case 'save':
            restHandler.insertResource(req, res);
            break;       
        default:
            restHandler.getResource(req, res);
            break;
    }
}
module.exports = { activityLogData };