import React, { PureComponent } from 'react';
import classnames from 'classnames';
import './red5pro-media.css';
import snaImage from './../../assets/img/streamNotAvailable.png';
import { startStream } from './../../redux/actions/httpRequest';
import store from './../../redux/store';
const loader = require('./../../assets/img/loader.gif');

class Red5Player extends PureComponent {

    constructor(props) {
        super(props);

        this.state = {
            streamNotAvailable: false,
            isLoad: false
        }
        this.subscriber = null;
    }

    componentWillUnmount() {
        this.dispose();
    }

    dispose() {
        const { componentKey } = this.props;
        // if (this.webRTCAdaptor) {
        //     this.webRTCAdaptor.closePeerConnection(componentKey);
        //     this.webRTCAdaptor.closeWebSocket();
        //     this.webRTCAdaptor.remoteVideo = null;
        //     this.webRTCAdaptor = null;
        // }
    }

    onConnectionClosed = (evt) => {
        const { camId, storeId } = this.props;
        console.log("onConnectionClosed" + Date.now());
        this.setState({ streamNotAvailable: true, isLoad: false }, () => {
            this.restart();
            store.dispatch(startStream.request({ camId: camId, storeId: storeId }));
        });
    }

    restart() {
        const { componentKey } = this.props;
        setTimeout(() => {
            if (this.webRTCAdaptor) {
                this.setState({ isLoad: true });
                this.subscriberVideo();
            }
        }, 3000);
    }

    componentDidMount() {
        this.subscriberVideo();
    }

    componentWillReceiveProps(nextProps) {
        const me = this;
        if (me.props.componentKey !== nextProps.componentKey) {
            me.dispose();
            setTimeout(() => { me.subscriberVideo(nextProps) }, 400);
        }
    }

    subscriberVideo = (nextProps) => {
        this.setState({ isLoad: true });
        const { componentKey, is360, mediaInfo } = nextProps || this.props;

        // Create a new instance of the WebRTC subcriber.
        this.subscriber = new window.red5prosdk.RTCSubscriber();
        // Initialize
        this.subscriber.init({
            protocol: 'ws',
            port: mediaInfo.port,
            host: mediaInfo.host,
            app: 'live',
            streamName: componentKey,
            rtcConfiguration: {
                iceServers: [{ urls: 'stun:stun2.l.google.com:19302' }],
                iceCandidatePoolSize: 2,
                bundlePolicy: 'max-bundle'
            },
            mediaElementId: componentKey,
            videoEncoding: 'NONE',
            audioEncoding: 'NONE'
        });
        this.subscriber.onConnectionClosed = this.onConnectionClosed;
        this.subscriber.subscribe();

        if (is360) {
            let videoElem = document.getElementById(componentKey);
            var player = window.videojs(videoElem, {}, function () { });
            player.panorama({
                clickAndDrag: true,
                autoMobileOrientation: true,
                maxLat: -10,
                initLat: -10,
                rotateX: -Math.PI,
                videoType: 'fisheye',
                MouseEnable: true,
            });
        }
    }

    onPlaying = () => {
        this.setState({ isLoad: false });
    }

    render() {
        const { componentKey, style } = this.props;
        const { streamNotAvailable, isLoad } = this.state;
        let imgClass = classnames({
            'stream-not-available': true,
            'display-none': !streamNotAvailable
        });

        let vidClass = classnames({
            'display-none': streamNotAvailable,
            'red5pro-media': true,
            'red5pro-media-background': true
        });
        let backgroundImage = isLoad ? { backgroundImage: `url(${loader})` } : {}
        return (
            <div>
                <div className="load-video" style={backgroundImage}></div>
                <img src={snaImage} className={imgClass} style={style} width='100%' />
                <video onPlaying={this.onPlaying} id={componentKey} loop className={vidClass} autoPlay="1" style={style} />
            </div>
        )
    }
}
export default Red5Player;