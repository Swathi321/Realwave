var express = require('express');
var router = express.Router();
var logsController = require('../controllers/logs');

router.route('/uploadLogs')
    .get(logsController.uploadLogs)
    .post(logsController.uploadLogs);

router.route('/uploadLogsCore')
    .get(logsController.uploadLogsCore)
    .post(logsController.uploadLogsCore);

module.exports = router;
