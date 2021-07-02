const Notification = require('./Notification');
const NotificationParams = require('./NotificationParams');
const Template = require('./Template');

class NotificationInfo {
    static get Notification() { return Notification; }
    static get NotificationParams() { return NotificationParams; }
    static get Template() { return Template; }
}
module.exports = NotificationInfo;