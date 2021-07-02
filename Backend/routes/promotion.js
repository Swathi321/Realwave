var express = require('express');
var router = express.Router();
var promotion = require('../controllers/promotion');

router.route('/getRecentPromotions')
  .get(promotion.getRecentPromotions)
  .post(promotion.getRecentPromotions);

module.exports = router;
