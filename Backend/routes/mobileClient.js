const router = require('express').Router();
const mongoose = require('mongoose');
const mongoDB = require('mongodb');
let Client = require('../modals/client');
//mongoose.set('debug', true);
mongoose.set('useFindAndModify', false);

router.route('/').get((req, res) => {
  Client.find().sort({ name: 1 })
    .then(client => res.json(client))
    .catch(err => res.status(400).json('Error: ' + err));
});


module.exports = router;