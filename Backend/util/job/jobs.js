const { StartUpdateProcess } = require('./../../services/facialConfigService');
const logger = require('./../logger');
const { request } = require('express');
const PreviewThumbnail = new (require('./../../plugin/PreviewThumbnail'));
const StoreNotificationTask = new (require('./StoreNotificationTask'));
PreviewThumbnail.execute = PreviewThumbnail.execute.bind(PreviewThumbnail);
StoreNotificationTask.Execute = StoreNotificationTask.Execute.bind(StoreNotificationTask);
const SpiritNotificationTask = require('./SpiritNotificationTask');
const SSHConnection = new (require('./SSHConnection'));
const CameraNotificationTask = new (require('./CameraNotificationTask'));
CameraNotificationTask.Execute = CameraNotificationTask.Execute.bind(CameraNotificationTask);
const { Notification } = require('./../Notification')
const ScaleNotificationTask = require('./ScaleNotificationTask')
ScaleNotificationTask.Execute = ScaleNotificationTask.Execute.bind(ScaleNotificationTask);

const AccessControlTask = require('./AccessControlTask');
AccessControlTask.Execute = AccessControlTask.Execute.bind(AccessControlTask);


/**
* @desc Start Procces of creattion facial gallery file.
*/
let facialConfigUpdate = () => {
    logger.info('Function Call from jobs');
    StartUpdateProcess().then(function (resp) {
        //ws.BroadcastToOnsite({ action: "facialConfigUpdate" });
    }, function (err) {
        logger.error(err)
    });
};

let jobs = [
    {
        "Name": "Facial Gallery Config Update",
        "Interval": "0 */1 * * * *",
        "Action": facialConfigUpdate,
        "Options": {},
        "Priority": "normal",
        "Disabled": true
    },
    {
        "Name": "Preview Thumbnail & vtt and sprite image for transaction videos",
        "Interval": "*/30 * * * * *",
        "Action": PreviewThumbnail.execute,
        "Options": {},
        "Priority": "normal",
        "Disabled": true
    },
    {
        "Name": "Store Notification Task",
        "Interval": "*/5 * * * * *",
        "Action": StoreNotificationTask.Execute,
        "Options": {},
        "Priority": "normal",
        "Disabled": true
    },
    {
        "Name": "Spirit Notification Task",
        "Interval": "*/5 * * * *",
        "Action": SpiritNotificationTask("SPIRITKWAIT").Execute,
        "Options": {},
        "Priority": "normal",
        "Disabled": true
    },
    {
        "Name": "Spirit Notification Task",
        "Interval": "*/5 * * * *",
        "Action": SpiritNotificationTask("SPIRITKSER").Execute,
        "Options": {},
        "Priority": "normal",
        "Disabled": true
    },
    {
        "Name": "Spirit Notification Task",
        "Interval": "*/5 * * * *",
        "Action": SpiritNotificationTask("SPIRITBWAIT").Execute,
        "Options": {},
        "Priority": "normal",
        "Disabled": true
    },
    {
        "Name": "Spirit Notification Task",
        "Interval": "*/5 * * * *",
        "Action": SpiritNotificationTask("SPIRITBSER").Execute,
        "Options": {},
        "Priority": "normal",
        "Disabled": true
    },
    {
        "Name": "Spirit Notification Task",
        "Interval": "*/5 * * * *",
        "Action": SpiritNotificationTask("SPIRITSSER").Execute,
        "Options": {},
        "Priority": "normal",
        "Disabled": true
    },
    {
        "Name": "Spirit Notification Task",
        "Interval": "*/5 * * * *",
        "Action": SpiritNotificationTask("SPIRITFWAIT").Execute,
        "Options": {},
        "Priority": "normal",
        "Disabled": true
    },
    {
        "Name": "Spirit Notification Task",
        "Interval": "*/5 * * * *",
        "Action": SpiritNotificationTask("SPIRITFSER").Execute,
        "Options": {},
        "Priority": "normal",
        "Disabled": true
    },
    {
        "Name": "SSH Connections",
        "Interval": "* */2 * * *",
        "Action": SSHConnection.Execute,
        "Options": {},
        "Priority": "normal",
        "Disabled": true
    },
    {
        "Name": "Camera Notification Task",
        "Interval": "*/1 * * * *",
        "Action": CameraNotificationTask.Execute,
        "Options": {},
        "Priority": "normal",
        "Disabled": true
    },
    {
        "Name": "NotificationQueue",
        "Interval": "*/30 * * * * *",
        "Action": Notification.execute.bind(Notification),
        "Options": {},
        "Priority": "normal",
        "Disabled": true
    },
    {
        "Name": "Scale Notification Task",
        "Interval": "*/1 * * * *",
        "Action": ScaleNotificationTask.Execute,
        "Options": {},
        "Priority": "normal",
        "Disabled": true
    },
    {
        "Name": "Access Control Task",
        "Interval": "*/1 * * * *",
        "Action": AccessControlTask.Execute,
        "Options": {},
        "Priority": "normal",
        "Disabled": true
    },

];

module.exports = jobs;