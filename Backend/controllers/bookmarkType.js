const restHandler = require('./restHandler')();
restHandler.setModelId('bookmarkType');

const BookmarkType = require('../modals/bookmarkType');
const store = require('../modals/store');
// restHandler.setModelId('bookmarkType');
const util = require('../util/util');
const common = require('./common');
const webSocket = require("../plugin/Socket");
const bookMark = require('../modals/bookMark');

async function bookmarkType(req, res) {
    switch (req.body.action) {
        case 'load':
            common.getData(req, res, restHandler);
            break;
        case 'update':
            // restHandler.updateResource(req, res);
            const { id } = req.params;
            const data1 = JSON.parse(req.body.data)
            let result1 = await BookmarkType.findById(id);
            if (result1) {
                console.log(result1,'######');
                let query = {
                    _id: { $ne: result1._id },
                    bookmarkType: data1.bookmarkType,
                    $or: [{ clientId: null }, { clientId: { $exists: false } }]
                }
                const duplicate = await BookmarkType.findOne(query);
                if (duplicate) {
                    return res.json({
                        success: false,
                        errmsg: 'Bookmark Type  already exists',
                    });
                } else {
                    const data = await BookmarkType.findByIdAndUpdate(id, data1, { new: true });
                    return res.json({
                        message: 'Record updated successfully.',
                        data,
                        success: true,
                    });
                }
            }
            break;
        case 'save':
            // restHandler.insertResource(req, res);
            beforeSave(req, res, () => {
                restHandler.insertResource(req, res);
            });
            break;
        case 'client':
            if (req.body.clientsave == 'true') {
                req.body.data = JSON.parse(req.body.data);
                if (req.body.data.clientId) {
                    req.body.data = JSON.stringify(req.body.data)
                    // restHandler.insertResource(req, res);
                    beforeClientSave(req, res, () => {
                        restHandler.insertResource(req, res);
                    });
                } else {
                    res.send({ success: false, errmsg: 'ClientId Required' });

                }
            }
            if (req.body.clientedit == 'true') {
                req.body.data = JSON.parse(req.body.data);
                if (req.body.data.clientId) {
                    req.body.data = JSON.stringify(req.body.data)
                    restHandler.updateResource(req, res);
                } else {
                    res.send({ success: false, errmsg: 'ClientId Required' });

                }
            }
            if (req.body.clientget == 'true') {
                let defaultFilter = [{
                    $or: [{ clientId: { $exists: false } }, { clientId: null }],

                }
                ];
                if (req.body.clientId) {
                    defaultFilter[0]['$or'].push({ clientId: req.body.clientId })
                }
                restHandler.getResources(req, res, null, false, defaultFilter);
            }

            break;

        case 'get':
            let defaultFilter = [
                { $or: [{ clientId: { $exists: false } }, { clientId: null }] }
            ];
            restHandler.getResources(req, res, null, false, defaultFilter);

            break;
        case 'delete':
            await bookMark.deleteMany({ "bookmarkType.value": req.params.id });
            restHandler.deleteResource(req, res);
            break;
        default:
            let defaultFilter1 = [
                { $or: [{ clientId: { $exists: false } }, { clientId: null }] }
            ];
            restHandler.getResources(req, res, null, false, defaultFilter1);

            break;
    }

}

let beforeSave = (req, res, cb) => {
    const data = JSON.parse(req.body.data);
    let query = {};
    // if(data.clientId){
    //      query.clientId= data.clientId 
    // }
    query.bookmarkType = data.bookmarkType;
    BookmarkType.find(query, async (err, data) => {
        if (err) {
            return res.send({
                success: false,
                errmsg: err.message,
            });
        }
        if (data.length > 0) {
            return res.send({
                success: false,
                errmsg: 'Bookmark Type already exists',
            });
        }
        cb();
    });
};
let beforeClientSave = (req, res, cb) => {
    try {
        const data = JSON.parse(req.body.data);
        let query = {};
        if (data.clientId) {
            query.clientId = data.clientId
        }
        query.bookmarkType = data.bookmarkType;
        BookmarkType.find({ bookmarkType: data.bookmarkType, $or: [{ clientId: { $exists: false } }, { clientId: null }] }, async (err, data) => {

            if (data.length > 0) {
                return res.send({
                    success: false,
                    errmsg: 'Bookmark Type already exists',
                });
            } else {
                const data1 = JSON.parse(req.body.data);

                BookmarkType.find({ bookmarkType: data1.bookmarkType, clientId: data1.clientId }, async (err, data) => {

                    if (data.length > 0) {
                        return res.send({
                            success: false,
                            errmsg: 'Bookmark Type already exists',
                        });
                    } else {
                        cb();

                    }
                });
            }
        });
    } catch (err) {
        return res.send({
            success: false,
            errmsg: err.message,
        });
    }

};
module.exports = { bookmarkType };
