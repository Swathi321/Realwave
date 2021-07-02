class MediaServerInfo {

    //Contents
    static get SECRET_KEY() { return 'Supernova2020' };
    static get PLAYBACK() { return true };

    //Property for identify the which media server configured
    get isAntMedia() {
        const { isAntMedia, isRecordedMediaSameAsLive, isRecordedAntMedia } = this.store;
        if (!this.isForPlayback)
            return isAntMedia || false;

        return isRecordedMediaSameAsLive ? isAntMedia : isRecordedAntMedia;
    }
    //Property for identify if it is request for playback
    get isForPlayback() { return this._isForPlayback || false; }
    //Store Info
    get store() { return this._store; }
    //Media Server hostname
    get hostname() { return this.url.hostname }
    //Media Server URL
    get url() {
        const { mediaServerUrl, recordedMediaServerUrl, isRecordedMediaSameAsLive } = this.store;
        if (!this.isForPlayback)
            return new URL(mediaServerUrl)

        return new URL(isRecordedMediaSameAsLive ? mediaServerUrl : recordedMediaServerUrl);
    }
    //Media server outbound port use play video using http or socket
    get outboundPort() {
        const { mediaServerOutboundPort, isRecordedMediaSameAsLive, recordedMediaServerOutboundPort } = this.store;
        if (!this.isForPlayback)
            return mediaServerOutboundPort;

        return isRecordedMediaSameAsLive ? mediaServerOutboundPort : recordedMediaServerOutboundPort;
    }

    //Media server inbound port use for RTMP
    get inboundPort() {
        const { mediaServerInboundPort, isRecordedMediaSameAsLive, recordedMediaServerInboundPort } = this.store;
        if (!this.isForPlayback)
            return mediaServerInboundPort;

        return isRecordedMediaSameAsLive ? mediaServerInboundPort : recordedMediaServerInboundPort;
    }

    //constructor - initialize based on store info
    constructor(store, isForPlayback = false) {
        this._store = store;
        this._isForPlayback = isForPlayback;
    }
}
module.exports = MediaServerInfo;