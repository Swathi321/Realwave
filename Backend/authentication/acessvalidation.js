const jwtDecode = require('jwt-decode');
    haveAccess = (token,userRole) =>{
        var decoded = jwtDecode(token);
        var userTypes = decoded.sub.split(",");
        for (let index = 0; index < userTypes.length; index++) {
            if (userTypes[index] === userRole) {
                validate = true;
                break;
            }
            validate = false;
        }
     return validate; 
    }
 module.exports = haveAccess;