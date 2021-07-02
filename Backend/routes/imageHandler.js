var express = require('express');
var router = express.Router();
var imageHandler = require('../controllers/imageHandler');

router.route('/getCurrentImage').get(imageHandler.getCurrentImage);

module.exports = router;