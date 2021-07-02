var express = require('express');
var router = express.Router();
var usersController = require('../controllers/user');
const imageController = require('../controllers/imageController');
const passport = require('passport');

/* GET Login. */
router.route('/login').post(passport.authenticate('local', { session: false }), usersController.login);
router.post('/register', usersController.register);
router.post('/logout', usersController.logout);

router.post('/setNewPassword', usersController.setNewPassword);
router.post('/forgotPassword', usersController.forgotPassword);
router.post('/checkValidForgotLink', usersController.checkValidForgotLink);
router.post('/resetPassword', usersController.resetPassword);
router.post('/getUserDetails', usersController.getUserDetail);
router.post('/googlelogin', usersController.googlelogin);
router.post('/facebooklogin', usersController.facebooklogin);
router.get('/getSpiritDashboardData', usersController.getSpiritDashboardData);
router.post('/getSpiritDashboardData', usersController.getSpiritDashboardDataByStore);
router.get('/myip', (req, res, next) => {
    let remoteAddress = null;
    if (req.headers.hasOwnProperty("x-forwarded-for")) {
        remoteAddress = req.headers['x-forwarded-for']
        remoteAddress = remoteAddress.split(":")[0];
    } else {
        remoteAddress = req.socket.remoteAddress.split(":");
        remoteAddress = remoteAddress[remoteAddress.length - 1];
    }
    res.send(remoteAddress);
});

router.route('/image')
    .get(imageController.getImage)
    .post(imageController.getImage);
module.exports = router;