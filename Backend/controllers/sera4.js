const axios = require('axios');
const Sera4Host = require('./sera4Host');
const Client = require('../modals/client');

async function getLocations(req, res){
    try{
        const TwsHost = await Sera4Host.getTwsHost(req);
        console.log('HOST DATA------------------->',TwsHost);
        var data = '';
        var config = {
            method: 'get',
            url: `${TwsHost.sera4Url}/sites?order=asc`, // /locks/locations?open_status=0`,
            headers: { 
            //   'Content-Type': 'application/json', 
              'tws-membership-id': `${TwsHost.TwsMembershipId}`,
              'tws-organization-token': `${TwsHost.sera4Token}`, 
              'Authorization': `Bearer ${TwsHost.tws_token}`,
            },
            data : data
          };
          axios(config)
          .then(function (response) {
            console.log('locations---------------->',JSON.stringify(response.data));
            var api_res ={ 
                error: false,
                success: true,
                pages: 1,
                total: response.data.length,
                data: response.data,
                combos: [],
            };
            if (req.body.pageSize > 0)
            api_res.pages = Math.ceil( response.data.length / req.body.pageSize);
            return res.status(200).json(api_res);
          }).catch(err => {
              console.log('api error --->',err);
            const response={ error: true, errmsg: err.message }
            throw response;
          })
    } catch(err) {
        const response={ error: true, errmsg: err.message }
        console.log('error---->',err);
        if(err&&err.response&&err.response.status&&err.response.status==401){
            console.log('401---->',err);
            response.errmsg=err.response.statusText
        }
        return res.send(response);
    }
}

async function getSeraByLocation(req, res) {
    try{
            const TwsHost = await Sera4Host.getTwsHost(req);
            // var obj = {};
            var statusObj = [];
            var data = '';

            var config = {
            method: 'get',
            url: `${TwsHost.sera4Url}/sites/${req.body.locationId}/locks`,
            headers: { 
                'tws-membership-id': `${TwsHost.TwsMembershipId}`,
                'tws-organization-token': `${TwsHost.sera4Token}`, 
                'Authorization': `Bearer ${TwsHost.tws_token}`,
             },
            data : data
            };
            axios(config)
            .then(async function (response) {
                console.log('lock data---------------->',JSON.stringify(response.data.data));
                var tempObj =  response.data.data
                function test(){
                    return new Promise ((resolve, reject)=>{
                        const obj   = tempObj.map(async (item,i) => {
                            var con = {
                                method: 'get',
                                url: `${TwsHost.sera4Url}/locks/${item.id}/status`,
                                headers: { 
                                    'tws-membership-id': `${TwsHost.TwsMembershipId}`,
                                    'tws-organization-token': `${TwsHost.sera4Token}`, 
                                    'Authorization': `Bearer ${TwsHost.tws_token}`,
                                },
                                data: data
                            }
                           let resp = await axios(con)
                            console.log('map console.le',resp.data.data);
                            return {...item,...resp.data.data}
                        });
                        resolve(obj);
                        }
                    )
                }
                test().then(val =>{
                    Promise.all(val).then(vol=>{
                    console.log("promise---->",vol);
                    var api_res ={ 
                        error: false,
                        success: true,
                        pages: 1,
                        total: response.data.length,
                        data: vol,
                        combos: [],
                    };
                    if (req.body.pageSize > 0)
                    api_res.pages = Math.ceil( response.data.length / req.body.pageSize);
                    return res.status(200).json(api_res);
                    })
                })
             
            })
            .catch(function (error) {
                console.log("err----------->",error);
                const response={ error: true, errmsg: err.message }
                console.log('error---->',err);
                if(err&&err.response&&err.response.status&&err.response.status==401){
                    console.log('401---->',err);
                    response.errmsg=err.response.data.error_description
                }
                return res.send(response);
            });
    } catch(err) {
        const response={ error: true, errmsg: err.message }
        console.log('error---->',err);
        if(err&&err.response&&err.response.status&&err.response.status==401){
            console.log('401---->',err);
            response.errmsg=err.response.data.error_description
        }
        return res.send(response);
    }
}

module.exports = {
    getLocations,
    getSeraByLocation
}