var express = require('express');
var router = express.Router();
var dashboard = require('../controllers/dashboard');

router.route('/getDashboardData')
  .get(dashboard.getDashboardData)
  .post(dashboard.getDashboardData);

router.route('/getTopSelling')
  .get(dashboard.getTopSelling)
  .post(dashboard.getTopSelling);

router.route('/suspiciousTransactions')
  .get(dashboard.suspiciousTransactions)
  .post(dashboard.suspiciousTransactions);

router.route('/getSalesData')
  .get(dashboard.chartSales)
  .post(dashboard.chartSales);

//spiritDashboard
  // router.route('/getSpiritDashboardData')
  // .get(dashboard.getSpiritDashboardData)
  // .post(dashboard.getSpiritDashboardData);
module.exports = router;
