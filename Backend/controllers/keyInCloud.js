const axios = require('axios');
const keyInCloud = require('./keyInCloudToken');
const siteSmartDevice = require('../modals/siteSmartDevices');
const { response } = require('express');


async function getLocations(req, res){
    try {
        const token = await keyInCloud.getAccessToken(req);
        axios({
            method: 'get',
            url: 'https://api.remotelock.com/locations',
            headers: {
                 'Authorization': `Bearer ${token.access_token}`
            }
          }).then((response) => {
            var api_res = {
                error: false,
                success: true,
                pages: 1,
                total: response.data.data.length,
                data: response.data.data,
                combos: [],
              };
            if (req.body.pageSize > 0)
            api_res.pages = Math.ceil( response.data.data.length / req.body.pageSize);
            console.log('Locations:', api_res.data)
            return res.status(200).json(api_res);
            })
    } catch(err){
        const response={ error: true, errmsg: err.message }
        if(err&&err.response&&err.response.status&&err.response.status==401){
            response.errmsg=err.response.data.error_description
        }
        return res.send(response);
    }
}

async function getDevices(req, res){
    return new Promise(async function(resolve, reject){
        try {
            const token = await keyInCloud.getAccessToken(req);
            // const token = {
            //     "access_token": "fd83678062077411cb836cb0574872b6d020b8dcc81038378a631a42f6f057bd",
            //     "token_type": "Bearer",
            //     "expires_in": 7199,
            //     "scope": "all",
            //     "created_at": 1613639683
            // };
            axios({
                method: 'get',
                url: 'https://api.remotelock.com/devices',
                headers: {
                     'Authorization': `Bearer ${token.access_token}`
                }
              }).then((response) => {
                if(!res)
                resolve(response.data);
                else{
                    console.log('Devices:', response.data.data)
                    resolve(res.status(200).json(response.data));
                }
                })
        } catch{
            reject(res.send({ error: true, message: err.message }));
        }
    })
}

async function getAccount(req, res){
    try {
        token = await keyInCloud.getAccessToken(req);
        axios({
            method: 'get',
            url: 'https://api.remotelock.com/account',
            headers: {
                 'Authorization': `Bearer ${token.access_token}`
            }
          }).then((response) => {
            console.log('Account:', response.data.data)
            return res.status(200).json(response.data);
            })
    } catch{
        return res.send({ error: true, message: err.message });
    }
}

async function getEvents(req, res){
    try {
        access_token = await keyInCloud.getAccessToken(req);
        axios({
            method: 'get',
            url: 'https://api.remotelock.com/events',
            headers: {
                 'Authorization': `Bearer ${token.access_token}`
            }
          }).then((response) => {
            console.log('Events:', response.data.data)
            return res.status(200).json(response.data);
            })
    } catch{
        return res.send({ error: true, message: err.message });
    }
}

async function getDevicesByLocation(req, res){
    try{
        const {locationId} = req.body;
        const devices = await getDevices(req);
        devByloc = [];
        if (!req.body.pageSize || req.body.pageSize <=0)
        req.body.pageSize = 20;
        devices.data.forEach(element => {
            if(locationId == element.attributes.location_id){
                devByloc.push(element);
            }
        })
        if(devByloc.length > 0){
            var api_res = {
                error: false,
                success: true,
                pages: 1,
                total: devByloc.length,
                data: devByloc,
                combos: [],
              };
            if (req.body.pageSize > 0)
            api_res.pages = Math.ceil(devByloc.length / req.body.pageSize);
            console.log('Device By Locations:', api_res.data);
            return res.status(200).json(api_res);
        }
        else{
            res.send({ error: true, message: 'No devices found for this location' });
        }
    } catch (err) {
        return res.send({ error: true, message: err.message });
    } 
}

module.exports = {
    getLocations,
    getDevices,
    getAccount,
    getEvents,
    getDevicesByLocation
  };