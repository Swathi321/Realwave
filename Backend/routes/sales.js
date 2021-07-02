var express = require('express');
var router = express.Router();
var sales = require('../controllers/sales');

router.route('/getSales')
  .get(sales.getSalesData)
  .post(sales.getSalesData);



module.exports = router;
