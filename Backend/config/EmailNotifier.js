const nodemailer = require('nodemailer');
const emailTemplates = require('./EmailTemplates');

module.exports = {
    templates: emailTemplates,
    resolveTags: function (text, tags) {
        if (text) {
            for (var o in tags) {
                text = text.replace(new RegExp('{' + o + '}', 'g'), tags[o]);
            }
        }
        return text
    },
    send: function (options) {
        //https://nodemailer.com/about/ <--Help link
        let transporter = nodemailer.createTransport({
            host: process.env.smtp_config_host,
            port: process.env.smtp_config_port,
            secure: Boolean(process.env.smtp_config_secure || false),
            auth: {
                user: process.env.smtp_config_username,
                pass: process.env.smtp_config_password
            }
        });

        let mailOptions = {
            from: 'Realwave Local <noreply@realwave.io>' // sender address
        };

        if (process.env.baseUrl) {
            if (process.env.baseUrl.indexOf("test") > -1) {
                mailOptions.from = 'Realwave Test <noreply@realwave.io>';
            }
            if (process.env.baseUrl.indexOf("live") > -1) {
                mailOptions.from = 'Realwave <noreply@realwave.io>';
            }
        }

        Object.assign(mailOptions, options);

        mailOptions.html = this.resolveTags(mailOptions.template.Body, options.tags);
        mailOptions.subject = this.resolveTags(mailOptions.template.Subject, options.tags);
        return transporter.sendMail(mailOptions);
    }
}