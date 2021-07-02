const axios = require('axios');
const Client = require('../modals/client');

async function getTwsHost(req, res) {
    return new Promise(async function(resolve, reject){
        try{
            const clientId = req.body.clientId;
            const ClientResult = await Client.find({_id: clientId});
            if(ClientResult.length > 0){
                const sera4Url = ClientResult[0].sera4Url;
                const sera4Token = ClientResult[0].sera4Token;
                const TwsUser = ClientResult[0].TwsUser;
                const TwsPass = ClientResult[0].TwsPass;

                var data = JSON.stringify({
                    "username": `${TwsUser}`,
                    "password": `${TwsPass}`
                });

                var config ={
                    method: 'post',
                    url: `${sera4Url}/sessions`,
                    headers: { 
                      'Content-Type': 'application/json'
                    },
                    data : data
                }

                axios(config).then(function (res) {
                    console.log("SessionResp--------------------->",JSON.stringify(res.data.tws_memberships[0].id));
                    const response = {
                        sera4Url: sera4Url,
                        sera4Token: sera4Token,
                        TwsMembershipId: res.data.tws_memberships[0].id,
                        tws_token: res.data.tws_token.tws_token_data,
                    };
                    console.log('resp data-------------------->',response);
                    resolve(response);
                }).catch(err =>{
                    console.log('config error ----->',err.response);
                    reject(err);
                })
                
            }
        } catch(err) {
            console.log('ErrorHost---->',err)
            reject(err);
        }
    })
}

module.exports = {
    getTwsHost
};