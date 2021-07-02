const router = require('express').Router();
const mongoose = require('mongoose');
const mongoDB = require('mongodb');
let Store = require('../modals/store');
//mongoose.set('debug', true);
mongoose.set('useFindAndModify', false);

router.route('/:id').get((req, res) => {
  Store.findById(req.params.id)
    .then(store => res.json(store))
    .catch(err => res.status(400).json('Error: ' + err));
});

router.route('/getbyserial/:id').get((req, res) => {
  Store.find({ serialNumber: req.params.id })
    .then(store => res.json(store))
    .catch(err => res.status(400).json('Error: ' + err));
});

router.route('/').get((req, res) => {
  Store.find()
    .then(store => res.json(store))
    .catch(err => res.status(400).json('Error: ' + err));
});

router.route('/update/:id').post(async (req, res) => {
  var query = { 'id': req.params.id };
  try {
    await Store.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      upsert: true,
      strict: false  //update didn't work without this option
    });
    res.json('Store Updated!');
  } catch (err) {
    console.error(err);
    res.status(500).send("Server Error");
  }
});

module.exports = router;