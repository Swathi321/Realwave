const decodeToken = require('../authentication/decodeToken');
const User = require('../modals/user');
const _ignoreUrl = ['/storeConnect', '/facialConfigDownload/', '/image'];
module.exports = (req, res, next) => {
  if (_ignoreUrl.indexOf(req.url) != -1) {
    return next();
  }

  if (req.session && req.session.user) {
    return next();
  } else {
    let response = { success: false, error: 'Session Expired' };
    let options = {
      signed: true,
      overwrite: true,
      maxAge: 1000 * 60 * 22
    };
    if (req.cookies.rwave) {
      if (req.body.isComingFromMobile == 'true' || req.body.isComingFromMobile == true) {
        options.maxAge = 365 * 24 * 60 * 60 * 1000; // for a year
      }
      req.sessionCookies.set('rwave', req.cookies.rwave, options);
      var data = decodeToken(req.cookies.rwave);
      if (data[0]) {
        User.findById(data[0])
          .populate([
            {
              path: 'roleId',
              //   populate: { path: 'permissions', select: { _id: 1, name: 1 } },
              populate: [
                'permissions.widgetId',
                'permissions.pageId',
                'permissions.reportId',
                'permissions.functionId',
              ],
              select: { _id: 1, name: 1 },
            },
            { path: 'storeId', select: { _id: 1, name: 1 } },
            {
              path: 'clientId',
              select: { _id: 1, name: 1, theme: 1, logo: 1, clientType: 1 },
            },
          ])
          .then(function (user) {
            if (user) {
              if (user.status !== 'Active') {
                return res.json(response);
              } else {
                req.session.user = user;
                return next();
              }
            } else {

              return res.json(response);
            }
          })
          .catch(function () {
            return res.json(response);
          });
      }
    } else {
      response.error = "You can't access this page directly without login.";
      response.message = "Session Expired. Please re-login.";
      return res.json(response);
    }
  }
};
