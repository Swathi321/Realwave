const mongoose = require('mongoose');
const RETRY_TIMEOUT = 5000
const permissionModel = require('../modals/permission');

module.exports = function (uri) {
    mongoose.Promise = global.Promise
    const connect = function () {
        return mongoose.connect(uri, {
            useNewUrlParser: true,
            useCreateIndex: true,
            autoReconnect: true,
            keepAlive: 30000,
            poolSize: 100,
            reconnectInterval: RETRY_TIMEOUT,
            reconnectTries: Number.MAX_VALUE
        }).catch(err => console.error('Mongoose connect(...) failed with err: ', err))
    }

    connect()

    mongoose.connection.on('error', function (err) {
        console.error('Could not connect to MongoDB ' + err)
    })

    mongoose.connection.on('disconnected', function () {
        console.error('Lost MongoDB connection...')
        // if (!isConnectedBefore) {
        //     setTimeout(() => connect(), RETRY_TIMEOUT)
        // }
    })
    mongoose.connection.on('connected', function () {
        permissionModel.createDefaultPermission();
        // permissionModel.createnewPermission();
        // permissionModel.updateAdminRolePermission();
        permissionModel.createSeraDevices();
        console.info('Connection established to MongoDB')
    })

    mongoose.connection.on('reconnected', function () {
        console.info('Reconnected to MongoDB')
    })

    // Close the Mongoose connection, when receiving SIGINT
    process.on('SIGINT', function () {
        mongoose.connection.close(function () {
            console.warn('Force to close the MongoDB connection after SIGINT')
            process.exit(0)
        })
    });
}