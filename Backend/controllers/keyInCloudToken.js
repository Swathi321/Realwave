const axios = require('axios');
const Client = require('../modals/client');
const siteSmartDevice = require('../modals/siteSmartDevices');


async function getAccessToken(req, res) {
    return new Promise(async function(resolve, reject){
        try{
            const clientId = req.body.clientId;
            const ClientResult = await Client.find({_id: clientId});
            if (ClientResult.length > 0){
                const clientID = ClientResult[0].keyInCloudClientId;
                const clientSecret = ClientResult[0].keyInCloudSecretKey;
                const grant_type = "client_credentials";
                axios({
                        // make a POST request
                        method: 'post',
                        // to the Github authentication API, with the client ID, client secret
                        // and request token
                        url: `https://connect.remotelock.com/oauth/token?client_id=${clientID}&client_secret=${clientSecret}&grant_type=${grant_type}`,
                        // Set the content type header, so that we get the response in JSOn
                        headers: {
                            accept: 'application/json'
                        }
                    }).then((response) => {
                        if(!res)
                        resolve(response.data);
                        else
                        resolve(res.status(200).json(response.data.access_token));
                    }).catch ((err) => {
                        reject(err)
                    });
            }
            else {
                reject(res.send({ error: true, errmsg: 'No Client ID found for this site' }));
              }
            
        }catch (err) {
            // reject(res.send({ error: false, errmsg: err.message }));
            res.send({ error: false, errmsg: err.message })
        }
    })
}

function isTokenValid(token){
    let time = Date.now();
    var time_now = Math.floor(time/1000);
    var isValid = false;
    if((token.created_at + token.expires_in) > time_now){
        isValid = true;
    };
    return isValid;
}


module.exports = {
    getAccessToken,
    isTokenValid
  };
