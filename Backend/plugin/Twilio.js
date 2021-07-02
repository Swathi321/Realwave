const twilio = require('twilio');

let twilioMessage = {
    /**
    * @desc Send SMS to mobile devices
    * @param {String} to - it is a mobile number which we need to send message.
    * @param {String} body - Conetent/message body of test message.
    * @returns {ObjectId} - return cam object id or null
    */
    createSMS: async (to, body) => {
        //to = "+918800846237";
        let client = new twilio(process.env.twilio_account_sid, process.env.twilio_auth_Token);
        return client.messages.create({
            body: body,
            to: to,  // Text this number
            from: process.env.twilio_auth_from // From a valid Twilio number
        });
    }
}
module.exports = twilioMessage;