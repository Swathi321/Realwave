const common = require('./common');
const user = require('./user');

async function refreshSession(req, res, next) {
  let response = { success: false, error: 'Session Expired' };
  let options = {
    maxAge: 1000 * 60 * 22, // would expire after 20 Minutes
    signed: true, // Indicates if the cookie should be signed,
    overwrite: true
  };


  if (req.cookies.rwave) {
    if (req.body.isComingFromMobile == 'true' || req.body.isComingFromMobile == true) {
      options.maxAge = 365 * 24 * 60 * 60 * 1000; // for a year
    }
    response.success = true;
    response.error = "";
    req.sessionCookies.set('rwave', req.cookies.rwave, options);
  }
  return res.json(response);
}

module.exports = { refreshSession };
