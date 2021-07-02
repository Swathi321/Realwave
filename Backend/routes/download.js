var express = require('express');
var router = express.Router();
var download = require('../controllers/download');

router.route('/playVideo')
  .get(download.playVideo)
  .post(download.playVideo);

router.route('/downloadUpdate')
  .get(download.downloadUpdate)
  .post(download.downloadUpdate)
  
router.route('/downloadFile')
  .get(download.downloadFile)
  .post(download.downloadFile);

module.exports = router;