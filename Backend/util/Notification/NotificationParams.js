class NotificationParams {

    static get NotificationType() {
        return {
            Email: 0,
            Text: 1
        }
    };
    get subject() { return this.resolveTags(this.template && this.template["Subject"] || this._subject) };
    set subject(val) { this._subject = val; };
    get body() { return this.resolveTags(this.template && this.template["Body"] || this._body) };
    set body(val) { this._body = val; };
    get from() { return this._from || 'Realwave <noreply@realwave.io>' };
    set from(val) { this._from = val; };
    isHtml = true;
    to = null;
    cc = null;
    bcc = null;
    tags = {};
    type = NotificationParams.NotificationType.Email;
    template = null;
    associationId = null;
    eventType = null;

    constructor(notificationParams = {}) {
        Object.assign(this, notificationParams);
    }

    resolveTags(text) {
        if (text) {
            for (var o in this.tags) {
                text = text.replace(new RegExp('{' + o + '}', 'g'), this.tags[o]);
            }
        }
        return text;
    }
}
module.exports = NotificationParams;