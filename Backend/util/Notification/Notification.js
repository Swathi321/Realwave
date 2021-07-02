const logger = require('./../logger');
const NotificationParams = require('./NotificationParams');
const EmailEngine = require("./EmailEngine");
const TextEngine = require("./TextEngine");
const NotificationQueue = require('./../../modals/NotificationQueue');

class Notification {
    static get inProcess() { return this._inProcess || false; }
    static set inProcess(val) { this._inProcess = val; }

    //Function for add email in table for process
    static async sendEmail(param = new NotificationParams()) {
        let nq = new NotificationQueue({
            to: param.to,
            from: param.from,
            subject: param.subject,
            body: param.body,

            //Optional fields
            cc: param.cc,
            bcc: param.bcc,

            //Management fields
            type: NotificationParams.NotificationType.Email, //Email/Text
            isSent: false,
            isHtml: param.isHtml,
            associationId : param.associationId,
            eventType : param.eventType
        });
        await nq.save();
    }

    //Function for add sms in table for process
    static async sendText(param = new NotificationParams()) {
        let nq = new NotificationQueue({
            to: param.to,
            body: param.body,
            //Management fields
            type: NotificationParams.NotificationType.Text,
            isSent: false,
            associationId : param.associationId,
            eventType : param.eventType
        });
        await nq.save();
    }

    //Function for send email instant without email queue
    static async sendInstantEmail(params) {
        let ee = new EmailEngine();
        return await ee.sendMail(params);
    }

    //Function for send SMS instant without email queue
    static async sendInstantText(params) {
        let te = new TextEngine();
        return await te.sendText(params);
    }

    //Execute - Function Fired from the JOB/Task
    static async execute() {
        if (this.inProcess)
            return

        try {
            this.inProcess = true;
            let results = await NotificationQueue.find({ isSent: false, retryCount: { $lte: 2 } });
            for (let i = 0; i < results.length; i++) {
                const result = results[i];
                let param = new NotificationParams(result._doc);
                try {
                    let isSent = false;
                    switch (result.type) {
                        case NotificationParams.NotificationType.Email:
                            isSent = await this.sendInstantEmail(param);
                            break;

                        case NotificationParams.NotificationType.Text:
                            isSent = await this.sendInstantText(param);
                            break;

                        default:
                            isSent = await this.sendInstantEmail(param);
                            break;
                    }
                    await this.updateRecord(result, isSent);
                } catch (ex) {
                    //If SMTP Fail then update record too for prevent to loop
                    await this.updateRecord(result, false);
                    logger.error(ex);
                }
            }
        } catch (ex) {
            logger.error(ex);
        } finally {
            this.inProcess = false;
        }
    }

    //Update email record
    static async updateRecord(record, status) {
        try {
            let retryCount = record.retryCount;
            retryCount++;

            let updateOption = {
                isSent: status,
                retryCount: retryCount
            }
            if (status) {
                updateOption.sentOn = new Date();
            }
            await NotificationQueue.update({ _id: record.id }, { $set: updateOption });
        } catch (ex) {
            logger.error(ex);
        }
    }
}
module.exports = Notification;