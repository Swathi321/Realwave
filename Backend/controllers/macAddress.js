const restHandler = require('./restHandler')();
const MacAddress = require('./../modals/macAddress');
const store = require('./../modals/store');
restHandler.setModelId('macaddresses');
const util = require('../util/util');
const common = require('./common');
const webSocket = require("../plugin/Socket");
/**
 * function to handle GET request to receive all the locations
 * @param {object} req 
 * @param {object} res 
 */

async function MakeRange(MacBase, res) {
    const dlm = '-';
    try {
        if (MacBase.length == 16) {
            for (var i = 0; i < 16; i++) {
                var newMA = new MacAddress({ macaddress: MacBase + i.toString(16).toUpperCase() });
                newMA.save();
            }
        }
        else if (MacBase.length == 15) {
            for (var j = 0; j < 16; j++) {
                for (var i = 0; i < 16; i++) {
                    var newMA = new MacAddress({ macaddress: MacBase + j.toString(16).toUpperCase() + i.toString(16).toUpperCase() });
                    newMA.save();

                }
            }
        }
        else if (MacBase.length == 14) {
            for (var j = 0; j < 16; j++) {
                for (var i = 0; i < 16; i++) {
                    var newMA = new MacAddress({ macaddress: MacBase + dlm + j.toString(16).toUpperCase() + i.toString(16).toUpperCase() });
                    newMA.save();

                }
            }
        }
        else if (MacBase.length == 13) {
            for (var k = 0; k < 16; k++) {
                for (var j = 0; j < 16; j++) {
                    for (var i = 0; i < 16; i++) {
                        var newMA = new MacAddress({ macaddress: MacBase + k.toString(16).toUpperCase() + dlm + j.toString(16).toUpperCase() + i.toString(16).toUpperCase() });
                        newMA.save();

                    }
                }
            }
        }
        else if (MacBase.length == 12) {
            for (var m = 0; m < 16; m++) {
                for (var k = 0; k < 16; k++) {
                    for (var j = 0; j < 16; j++) {
                        for (var i = 0; i < 16; i++) {
                            var newMA = new MacAddress({ macaddress: MacBase + m.toString(16).toUpperCase() + k.toString(16).toUpperCase() + dlm + j.toString(16).toUpperCase() + i.toString(16).toUpperCase() });
                            newMA.save();

                        }
                    }
                }
            }
        }
        else if (MacBase.length == 11) {
            for (var m = 0; m < 16; m++) {
                for (var k = 0; k < 16; k++) {
                    for (var j = 0; j < 16; j++) {
                        for (var i = 0; i < 16; i++) {
                            var newMA = new MacAddress({ macaddress: MacBase + dlm + m.toString(16).toUpperCase() + k.toString(16).toUpperCase() + dlm + j.toString(16).toUpperCase() + i.toString(16).toUpperCase() });
                            newMA.save();

                        }
                    }
                }
            }
        }
        else if (MacBase.length == 10) {
            //getDBStatus();
            for (var n = 0; n < 16; n++) {
                for (var m = 0; m < 16; m++) {
                    var x = await Make65536(MacBase + n.toString(16).toUpperCase() + dlm + m.toString(16).toUpperCase(), dlm);

                    // for(var m=0; m<16; m++) {
                    //     for(var k=0; k<16; k++) {
                    //         for(var j=0; j<16; j++) {
                    //             for(var i=0; i<16; i++) {
                    //                 try {
                    //                 var newMA = new MacAddress({ macaddress: MacBase + n.toString(16).toUpperCase() + dlm + m.toString(16).toUpperCase() + k.toString(16).toUpperCase() + dlm + j.toString(16).toUpperCase() + i.toString(16).toUpperCase() });
                    //                 await newMA.save();
                    //                 //console.log(newMA.macaddress + ' Saved.');
                    //                 }
                    //                 catch {
                    //                     //console.log(newMA.macaddress + ' Exists');
                    //                  }
                    //             }
                    //         }               
                    //     }
                }
            }
        }
    }
    catch (err) { logger.error(err); }
    logger.info('Range Creation Complete');
    res.json({ message: "Range Creation Complete", success: true });
}

function Make65536(current, dlm) {
    var myPromises = [];
    for (var k = 0; k < 16; k++) {
        for (var j = 0; j < 16; j++) {
            for (var i = 0; i < 16; i++) {
                try {
                    var newMA = new MacAddress({ macaddress: current + k.toString(16).toUpperCase() + dlm + j.toString(16).toUpperCase() + i.toString(16).toUpperCase() });
                    var p = newMA.save();
                    myPromises.push(p);
                    //console.log(newMA.macaddress + ' Saved.');
                }
                catch (err) {
                    //console.log(current + k.toString(16).toUpperCase() + dlm + j.toString(16).toUpperCase() + i.toString(16).toUpperCase(), err);
                }
            }
        }
    }

    Promise.allSettled(myPromises).then(() => console.log(myPromises[0]));
}


let beforeDelete = (req, res, cb) => {
    let params = Object.assign({}, req.body, req.query, req.params);
    oSSRestart(params.id, true);
    cb();
}

let afterSave = (req, res) => {
    let params = Object.assign({}, req.body, req.query, req.params);
    let macDetail = JSON.parse(params.data);
    oSSRestart(macDetail.macaddress, false);
}

async function oSSRestart(macId, fullRestart) {
    let macDetail = null;
    if (!fullRestart) {
        macDetail = [{macaddress: macId}];
    }
    else {
        macDetail = await MacAddress.find({ _id: macId.toObjectId() });
    }

    if (macDetail && macDetail.length > 0) {
        let macInStore = await store.find({ macAddress: macDetail[0].macaddress.replace(/[^\w\s]/gi, "") });
        if (macInStore.length > 0) {
            macInStore.forEach(storeDetail => {
                let options = {
                    action: 'restart',
                    isFullRestart: fullRestart,
                    data: {
                        storeId: storeDetail._id.toString()
                    }
                }
                webSocket.Send(options);
            });

        }
    }
}


function macAddresses(req, res) {
    switch (req.body.action) {
        case 'export':
            restHandler.getExportRecord(req, res);
            break;
        case 'load':
            common.getData(req, res, restHandler);
            break;
        case 'update':
            restHandler.updateResource(req, res);
            break;
        case 'save':
            restHandler.insertResource(req, res, afterSave(req, res));
            break;
        case 'create_range':
            var jsonData = JSON.parse(req.body.data);
            var basemacaddress = jsonData.basemacaddress;
            MakeRange(basemacaddress, res);
            break;
        case 'delete':
            beforeDelete(req, res, () => {
                restHandler.deleteResource(req, res);
            });
            break;
        default:
            restHandler.getResources(req, res);
            break;
    }

}

module.exports = { macAddresses };
