var express = require('express');
var router = express.Router();
var comboController = require('../controllers/combos');

router.route('/combo')
  .get(comboController.loadCombo)
  .post(comboController.loadCombo);

module.exports = router;
