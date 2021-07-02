const jwtDecode = require('jwt-decode');

decodeToken = (token) => {
    var decodedData=[]; 
    var decoded = jwtDecode(token);
    var userTypes = decoded.sub.split(",");
    for (let index = 0; index < userTypes.length; index++) {
        decodedData[index] = userTypes[index];
    }
    return decodedData;
}
module.exports = decodeToken;