const twilio = require('twilio');
const NotificationParams = require('./NotificationParams');
const logger = require('./../logger');

class TextEngine {

    constructor(config = {}) {
        this.config = Object.assign({}, {
            accountSid: process.env.twilio_account_sid,
            authToken: process.env.twilio_auth_Token
        }, config);
    }

    /**
    * @desc Send text message to
    * @param {NotificationParams} - parameters
    */
    async sendText(params = new NotificationParams()) {
        const { accountSid, authToken } = this.config;
        let client = new twilio(accountSid, authToken);
        return await (
            new Promise((resolve) => {
                client.messages.create({
                    body: params.body,
                    to: params.to,  // Text this number
                    from: process.env.twilio_auth_from // From a valid Twilio number
                }).then((res) => {
                    resolve(true);
                }, (err) => {
                    logger.error(err);
                    resolve(false);
                });
            })
        )
    }
}
module.exports = TextEngine;