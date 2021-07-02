const nodemailer = require('nodemailer');
const NotificationParams = require('./NotificationParams');
const sgMail = require('@sendgrid/mail');
const logger = require('../logger');
sgMail.setApiKey(process.env.smtp_config_sendgrid_key);

class EmailEngine {
    constructor(config = {}) {
        this.smtpConfig = Object.assign({}, {
            host: process.env.smtp_config_host,
            username: process.env.smtp_config_username,
            password: process.env.smtp_config_password,
            port: process.env.smtp_config_port,
            secure: Boolean(process.env.smtp_config_secure || false),
        }, config);
        this.useSendGrid = Boolean(process.env.smtp_config_useSendGrid)
        if (!this.useSendGrid) {
            this.transporter = nodemailer.createTransport({
                host: this.smtpConfig.host,
                port: this.smtpConfig.port,
                secure: this.smtpConfig.secure,
                auth: {
                    user: this.smtpConfig.username,
                    pass: this.smtpConfig.password
                },
                tls: {
                    rejectUnauthorized: false
                }
            });
        }
    }

    sendGridEmail(emailoption) {
        return new Promise((res) => {
            sgMail.send(emailoption).then(() => {
                res(true)
            }, error => {
                logger.error("email send error" +error);

                if (error.response) {
                    logger.error("email send error" + error.response.body);
                }
                res(false)
            });
        })
    }

    async sendMail(option = new NotificationParams()) {
        let getAllEmails = option.to.split(",");
        let emailoption = {
            to: getAllEmails,
            from: option.from,
            subject: option.subject,
            cc: option.cc,
            bcc: option.bcc
        };
        if(getAllEmails.length > 1) {
            emailoption.isMultiple = true;
        }
        emailoption[option.isHtml ? "html" : "text"] = option.body;
        if (this.useSendGrid) {
            return await this.sendGridEmail(emailoption)
        }
        else {
            let isConnectionOK = await this.transporter.verify();
            if (!isConnectionOK) {
                return isConnectionOK;
            }
            //TODO: Need to veriy is mail sent or falied
            await this.transporter.sendMail(emailoption);
            return true;
        }
    }
}
module.exports = EmailEngine;