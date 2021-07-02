var util = require('./../util/util');

module.exports = {
  getCurrentImage: (req, res, next) => {
    var camUrl = "http://webcam.iowa.uiowa.edu/live/readImage.asp"; //"http://localhost:5000/imageHandler/getCurrentImage?camUrl=http://localhost:5000/imageHandler/getCurrentImage";
    var index = util.camConfig.findIndex(function (e) { return e.camUrl === camUrl });
    if (index > -1) {
      var config = util.camConfig[index];
      res.contentType('image/jpeg');
      req.setEncoding('binary');
      req.on('data', function (chunk) {
        data += chunk;
      });
      req.on('end', function () {
        req.rawBody = config.imageData;
        next();
      });
    }
    // var contentType = req.headers['content-type'] || ''
    // var mime = contentType.split(';')[0];
    // // Only use this middleware for content-type: application/octet-stream
    // if (mime != 'application/octet-stream') {
    //   return next();
    // }
    // var data = '';
  }
}