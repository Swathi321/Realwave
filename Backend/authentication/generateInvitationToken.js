const JWT = require('jsonwebtoken');
const {JWT_SECRET } = require('../config/index')
invitationToken = (user)=>{
  return JWT.sign({
       iss : 'AVSystems',
       sub : user.email,
       iat : Math.floor (Date.now () / 1000) + ((60 * 60)*24),
       exp : new Date().setDate(new Date().getDate()+ 1)
   },JWT_SECRET )
}
module.exports = invitationToken;