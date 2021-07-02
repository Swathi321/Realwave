import React, { PureComponent } from 'react';
import classnames from 'classnames';
import './red5pro-media.css';
import { startStream } from './../../redux/actions/httpRequest';
import store from './../../redux/store';
import consts from '../../Util/consts';
import utils from '../../Util/Util';

const loader = require('./../../assets/img/loader.gif');


class AntMediaPlayer extends PureComponent {

    constructor(props) {
        super(props);
        this.state = {
            streamNotAvailable: false,
            isLoad: false,
            available: false,
            isHighLoaded: false,
            onDemandPlayStarted: false,
            loadStreamType: "Low",
            loadSecondaryStream: null,
            showHighLowSelection: false,
            showVideo: true,
            showPlayButton: false
        }

        this.config = {
            token: this.props.token,
            pc_config: null,
            sdpConstraints: {
                OfferToReceiveAudio: true,
                OfferToReceiveVideo: true
            },
            mediaConstraints: {
                video: false,
                audio: false
            }
        }
        this.webRTCAdaptor = null;
        this.webRTCAdaptorHigh = null;
        this.restartClearTimeout = null;
    }

    addClickEvent = (forHigh) => {
        const { camId, storeId, secondaryStream, componentKey } = this.props;
        let componentKeyHigh = secondaryStream.streamHigh;
        let videoTag = null;
        if (forHigh) {
            videoTag = document.getElementById(componentKeyHigh);
        }
        else {
            videoTag = document.getElementById(componentKey);
        }

        if (videoTag) {
            videoTag.onclick = () => {
                this.stopOnDemandPlay();
            }
        }
    }


    stopOnDemandPlay = () => {
        let me = this;
        let { liveVideScope, isDewarpEnable, siteConfig } = me.props;
        let isOnDemand = siteConfig && siteConfig.storeId && siteConfig.storeId.siteStreamConfig && siteConfig.storeId.siteStreamConfig == consts.StreamConfig.OnDemand ? true : false;;
        if (isOnDemand && me.state.onDemandPlayStarted && !me.state.showPlayButton && !isDewarpEnable) {
            me.dispose();
            me.setState({ onDemandPlayStarted: false, showVideo: false }, function () {
                me.setState({ showVideo: true });
            });
            if (liveVideScope && liveVideScope.state) {
                liveVideScope.setState({ isAIStream: false });
            }
            if (me.props.onStateChange) {
                me.props.onStateChange({ value: false });
            }
        }
    }

    startAndPlayStream = (event) => {
        let { secondaryStream, componentKey, isSingleLayout, siteConfig, camId, storeId, } = this.props;
        let isOnDemand = siteConfig && siteConfig.storeId && siteConfig.storeId.siteStreamConfig && siteConfig.storeId.siteStreamConfig == consts.StreamConfig.OnDemand ? true : false;
        let { showHighLowSelection } = this.state;
        let toStartStream = {};
        let streamId = null;
        let forSecondaryStream = true
        switch (event.target.id) {
            case "HDPlayButton":
                forSecondaryStream = isOnDemand ? true : !this.state.loadSecondaryStream; //
                toStartStream = { loadSecondaryStream: forSecondaryStream }
                if (isOnDemand) {
                    toStartStream.onDemandPlayStarted = true;
                }
                if (forSecondaryStream) {
                    streamId = secondaryStream.streamId;
                } else {
                    streamId = componentKey;
                }

                break;
            case "AIPlayButton":

                break;
            case "LowPlayButton":
            case "livePlayButton":
                if (!showHighLowSelection && isSingleLayout) {
                    toStartStream = { showHighLowSelection: true, loadSecondaryStream: false }
                }
                else {
                    toStartStream = { onDemandPlayStarted: true, loadSecondaryStream: false }
                    streamId = componentKey;
                    forSecondaryStream = false;
                }
                break;
        }
        this.setState(toStartStream, () => {
            if (streamId) {
                this.subscriberVideo(this.props, streamId, forSecondaryStream);
                let getStream = { camId: camId, storeId: storeId, streamId: streamId }
                if (forSecondaryStream) {
                    getStream.streamType = "High";
                }
                this.startStreamRequest(getStream);
                if (this.props.onStateChange) {
                    this.props.onStateChange({ value: true });
                }
            }
        });

        let highStreamLoader = document.getElementById("antHDLoader");
        if (highStreamLoader) {
            highStreamLoader.style.display = "";
        }
    }

    startStreamRequest(option) {
        clearTimeout(this.startStreamRequestTimeout);
        this.startStreamRequestTimeout = setTimeout(() => {
            store.dispatch(startStream.request(option));
        }, 3000);
    }

    componentWillUnmount() {
        clearTimeout(this.startStreamRequestTimeout);
        console.log("VideoPlayer: componentWillUnmount");
        this.dispose();
    }

    dispose() {
        const { componentKey, isSingleLayout, secondaryStream } = this.props;
        let liveStopButton = document.getElementById(`liveStopButton${componentKey}`);
        if (liveStopButton) {
            liveStopButton.style.display = "hidden";
        }
        if (this.webRTCAdaptor) {
            this.webRTCAdaptor.closePeerConnection(componentKey);
            this.webRTCAdaptor.closeWebSocket();
            this.webRTCAdaptor.remoteVideo = null;
            this.webRTCAdaptor = null;
            console.log(`WebRTC Player Disposed ${componentKey}`);
        }
        if (isSingleLayout && this.webRTCAdaptorHigh) {
            this.webRTCAdaptorHigh.closePeerConnection(secondaryStream.streamHigh);
            this.webRTCAdaptorHigh.closeWebSocket();
            this.webRTCAdaptorHigh.remoteVideo = null;
            this.webRTCAdaptorHigh = null;
            console.log(`WebRTC Player Disposed ${secondaryStream.streamHigh}`);
        }
    }

    onConnectionClosed = (evt) => {
        console.log("onConnectionClosed" + Date.now());
    }

    restart(forSecondaryStream) {
        const { componentKey, camId, storeId, isTimeline, videoIndex, secondaryStream } = this.props;
        let { loadSecondaryStream } = this.state;
        let timeToInitialize = videoIndex ? +videoIndex.toString().split('').pop() : 2;
        console.log('restarting stream: ' + componentKey);

        if (!isTimeline) {

            clearTimeout(this.restartClearTimeout);
            console.log('reloading stream after 3000ms: ' + componentKey);
            this.restartClearTimeout = setTimeout(() => {
                if (this.webRTCAdaptor) {
                    this.webRTCAdaptor.getStreamInfo(componentKey);
                }
                if (this.webRTCAdaptorHigh && loadSecondaryStream && secondaryStream && secondaryStream.streamId) {
                    this.webRTCAdaptorHigh.getStreamInfo(secondaryStream.streamId);
                }
            }, 3000);
        }
        else {
            clearTimeout(this.restartClearTimeout);
            if (isTimeline) {
                let lowStreamLoader = document.getElementById(`antLowStreamLoader${componentKey}`);
                if (lowStreamLoader) {
                    lowStreamLoader.style.display = "block";
                }
            }
            console.log('reloading stream after 3000ms: ' + componentKey);
            this.restartClearTimeout = setTimeout(() => {
                if (this.webRTCAdaptor) {
                    this.webRTCAdaptor.getStreamInfo(componentKey);
                }
            }, 3000);
        }
    }

    componentDidMount() {
        const { siteConfig, isDewarpEnable, isOnDemandPlay } = this.props;
        let isOnDemand = siteConfig && siteConfig.storeId && siteConfig.storeId.siteStreamConfig && siteConfig.storeId.siteStreamConfig == consts.StreamConfig.OnDemand ? true : false;
        if (!isOnDemand || (isOnDemandPlay && isDewarpEnable)) {
            this.startPlay();
        }
        if (isOnDemandPlay) {
            this.startPlay();
            this.setState({ onDemandPlayStarted: true });
        }
    }

    startPlay() {
        const { camId, storeId, onToggle, componentKey, onTimeUpdate, videoIndex } = this.props;
        this.subscriberVideo(this.props, componentKey);
        let player = document.getElementById(componentKey);
        let isIpad = utils.isIpad;
        if (isIpad) {
            if (player && player.paused) {
                player.play().then(res => {
                    let highStreamLoader = document.getElementById("antHDLoader");
                    if (highStreamLoader) {
                        highStreamLoader.style.display = 'none';
                    }
                }).catch(err => {
                    console.log('Not Able to play');
                })
            }
        }
        if (onToggle && player) {
            player.onplay = onToggle;
            player.onpause = onToggle;
            player.onclick = (e) => {
                if (e.target.paused) {
                    e.target.play().then(res => {
                    }).catch(err => {
                        console.log('Not Able to play');
                    })
                } else {
                    if (e && e.target && e.target.pause)
                        e.target.pause();
                }
            }
        }
    }
    componentDidUpdate() {
        const { camId, storeId, onToggle, componentKey, onTimeUpdate } = this.props;
        let player = document.getElementById(componentKey);
        console.log('componentDidUpdate fun');
        if (onTimeUpdate && player) {
            console.log('componentDidUpdate hit');
            player.ontimeupdate = onTimeUpdate;
        }
    }
    componentWillReceiveProps(nextProps) {
        const me = this;
        const { componentKey, refreshing, token, onTimeUpdate, isTimeline, is360 } = nextProps;
        if (me.props.componentKey !== componentKey || refreshing) {
            me.dispose();
            setTimeout(() => {
                let player = document.getElementById(componentKey);
                if (onTimeUpdate && player) {
                    console.log('componentWillReceiveProps hit');
                    player.ontimeupdate = onTimeUpdate;
                }
                me.config.token = token;
                me.subscriberVideo(nextProps, componentKey);
            }, 400);
        }

        if (this.props.is360 !== nextProps.is360 && isTimeline) {
            this.setState({ showVideo: false }, () => {
                setTimeout(() => {
                    this.setState({ showVideo: true }, () => {
                        this.startPlay();
                    });
                }, 200);
            })

        }
    }
    subscriberVideo = (nextProps, componentKey, isForSecondaryStream) => {
        this.setState({ isLoad: true });
        const { is360, mediaInfo, isDewarpEnable } = nextProps || this.props;
        let websocketURL = `wss://${mediaInfo.host}:${mediaInfo.port}/LiveApp/websocket`;
        if (isForSecondaryStream) {
            this.webRTCAdaptorHigh = new window.WebRTCAdaptor({
                websocket_url: websocketURL,
                mediaConstraints: this.config.mediaConstraints,
                peerconnection_config: this.config.pc_config,
                sdp_constraints: this.config.sdpConstraints,
                remoteVideoId: componentKey,
                isPlayMode: true,
                debug: true,
                candidateTypes: ["tcp", "udp"],
                callback: this.onSecondaryStream,
                callbackError: this.onStreamHighError
            });
        }
        else {
            this.webRTCAdaptor = new window.WebRTCAdaptor({
                websocket_url: websocketURL,
                mediaConstraints: this.config.mediaConstraints,
                peerconnection_config: this.config.pc_config,
                sdp_constraints: this.config.sdpConstraints,
                remoteVideoId: componentKey,
                isPlayMode: true,
                debug: true,
                candidateTypes: ["tcp", "udp"],
                callback: this.onSuccess,
                callbackError: this.onError
            });
        }
        setTimeout(() => {
            if (isDewarpEnable) {
                let videoElem = document.getElementById(componentKey);
                var player = window.videojs(videoElem, {}, function () { });
                if (player) {
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
        }, 1000);

    }


    onSecondaryStream = (info, obj) => {
        const { secondaryStream, camId, storeId, componentKey, stretchProperty } = this.props;
        let token = secondaryStream.streamToken;
        if (info == "initialized") {
            console.log("initialized");
            this.webRTCAdaptorHigh.getStreamInfo(secondaryStream.streamId);
        } else if (info == "streamInformation") {
            console.log("stream information");
            this.webRTCAdaptorHigh.play(secondaryStream.streamId, token);
        }
        else if (info == "play_started") {
            let lowStreamLoader = document.getElementById(`antLowStreamLoader${componentKey}`);
            // let liveStopButton = document.getElementById(`liveStopButton${componentKey}`);

            if (lowStreamLoader) {
                lowStreamLoader.style.display = "none";
            }

            // if (liveStopButton) {
            //     liveStopButton.style.display = "visible";
            // }

            setTimeout(() => {
                let videoElemLow = document.getElementById(componentKey);
                let videoElemHigh = document.getElementById(secondaryStream.streamId);
                if (videoElemLow && componentKey && !this.state.isHighLoaded && componentKey != "" && this.webRTCAdaptor) {
                    this.webRTCAdaptor.closePeerConnection(componentKey);
                    this.webRTCAdaptor.closeWebSocket();
                    this.webRTCAdaptor.remoteVideo = null;
                    this.webRTCAdaptor = null;
                    videoElemLow.style.display = "none";
                }
                if (videoElemHigh) {
                    videoElemHigh.style.display = "";
                    if (videoElemLow) { videoElemHigh.style.objectFit = videoElemLow.style.objectFit; }
                }

                if (videoElemLow) {
                    videoElemLow.style.display = "";
                    if (videoElemHigh) { videoElemLow.style.objectFit = videoElemHigh.style.objectFit; }
                }
                var player = document.getElementById(secondaryStream.streamId);
                if (player && stretchProperty) {
                    player.style.objectFit = stretchProperty
                }


                console.log(`WebRTC Player for Low Stream Disposed ${componentKey}`);
                let highStreamLoader = document.getElementById("antHDLoader");
                if (highStreamLoader) {
                    highStreamLoader.style.display = "none";
                }
                // this.setState({ isHighLoaded: true });
            }, 2000);
            console.log("play started: camId: " + secondaryStream);
        } else if (info == "play_finished") {
            this.restart();
        } else if (info == "closed") {
        } else if (info == "ice_connection_state_changed") {
            console.log("iceConnectionState Changed: ", JSON.stringify(obj));
            this.setState({ available: true });
        } else if (info == "updated_stats") {
            console.log("Average incoming kbits/sec: " + obj.averageIncomingBitrate
                + " Current incoming kbits/sec: " + obj.currentIncomingBitrate
                + " packetLost: " + obj.packetsLost
                + " fractionLost: " + obj.fractionLost
                + " audio level: " + obj.audioLevel);
        } else if (info == "data_received") {
            console.log("Data received: " + obj.event.data + " type: " + obj.event.type + " for stream: " + obj.streamId);
        }
    }

    onStreamHighError = (error) => {
        const { secondaryStream, camId, storeId } = this.props;
        let componentKey = secondaryStream.streamId;
        let me = this;
        let errorText = JSON.stringify(error);
        console.log("error callback: camId: " + componentKey + ' error: ' + errorText);
        if (!errorText.includes("already_playing") || errorText.includes("no_stream_exist")) {
            this.setState({ isLoad: false }, () => {
                this.restart(true);
            });
        }
    }


    onSuccess = (info, obj) => {
        const { componentKey, camId, storeId, secondaryStream, isTimeline, siteConfig, stretchProperty } = this.props;
        let isOnDemand = siteConfig && siteConfig.storeId && siteConfig.storeId.siteStreamConfig && siteConfig.storeId.siteStreamConfig == consts.StreamConfig.OnDemand ? true : false;
        if (info == "initialized") {
            console.log("initialized");
            if(this.webRTCAdaptor){
                this.webRTCAdaptor.getStreamInfo(componentKey);
            }
        } else if (info == "streamInformation") {
            console.log("stream information");
            this.webRTCAdaptor.play(componentKey, this.config.token);
        }
        else if (info == "play_started") {
            //joined the stream
            let lowStreamLoader = document.getElementById(`antLowStreamLoader${componentKey}`);

            if (lowStreamLoader) {
                lowStreamLoader.style.display = "none";
            }

            let liveStopButton = document.getElementById(`liveStopButton${componentKey}`);
            if (liveStopButton) {
                liveStopButton.style.display = "visible";
            }
            let highStreamLoader = document.getElementById("antHDLoader");
            if (highStreamLoader) {
                highStreamLoader.style.display = "none";
            }
            var player = document.getElementById(componentKey);
            if (player && stretchProperty) {
                player.style.objectFit = stretchProperty;
            }

        } else if (info == "play_finished") {
            this.restart();
        } else if (info == "closed") {
        } else if (info == "ice_connection_state_changed") {
            console.log("iceConnectionState Changed: ", JSON.stringify(obj));
            this.setState({ available: true });
        } else if (info == "updated_stats") {
            console.log("Average incoming kbits/sec: " + obj.averageIncomingBitrate
                + " Current incoming kbits/sec: " + obj.currentIncomingBitrate
                + " packetLost: " + obj.packetsLost
                + " fractionLost: " + obj.fractionLost
                + " audio level: " + obj.audioLevel);
        } else if (info == "data_received") {
            console.log("Data received: " + obj.event.data + " type: " + obj.event.type + " for stream: " + obj.streamId);
        }
    }

    onError = (error) => {
        const { componentKey, camId, storeId, isTimeline } = this.props;
        let me = this;
        let errorText = JSON.stringify(error);
        console.log("error callback: camId: " + componentKey + ' error: ' + errorText);
        if (isTimeline) {
            clearTimeout(this.to);
            this.to = setTimeout(() => {
                if (me.webRTCAdaptor) {
                    me.webRTCAdaptor.getStreamInfo(componentKey);
                }
            }, 2000);
        }
        else {
            if (!errorText.includes("already_playing") || errorText.includes("no_stream_exist")) {
                this.setState({ isLoad: false }, () => {
                    this.restart();
                });
            }
        }

    }

    onPlaying = () => {
        this.setState({ isLoad: false });
    }

    render() {
        const { componentKey, style, isFullScreen, isTimeline, onTimeUpdate, secondaryStream, siteConfig, isAIStream, isSingleLayout, is360, onToggle, onLoadedMetadata, isDewarpEnable, isOnDemandPlay } = this.props;
        const { streamNotAvailable, isLoad, onDemandPlayStarted, loadStreamType, showHighLowSelection, loadSecondaryStream, onTogglePlayStarted, showVideo, showPlayButton } = this.state;
        let vidClass = classnames({
            'display-none': false,
            'red5pro-media': true,
            'red5pro-media-background': true
        });

        let highVidClass = classnames({
            'red5pro-media': true,
            'red5pro-media-background': true
        });
        let isOnDemand = siteConfig && siteConfig.storeId && siteConfig.storeId.siteStreamConfig && siteConfig.storeId.siteStreamConfig == consts.StreamConfig.OnDemand ? true : false;
        let streamConfigType = siteConfig && siteConfig.storeId && siteConfig.storeId.siteStreamConfig && siteConfig.storeId.siteStreamConfig;
        // let isAIStreamAvaialble = siteConfig && siteConfig.flv && siteConfig.flv.aIStreamURL;
        let backgroundImage = { backgroundImage: `url(${loader})` };
        let onDemandStartPlay = !isOnDemand || onDemandPlayStarted;

        let isHighStream = (streamConfigType === consts.StreamConfig.HighOnly && !loadSecondaryStream) //for high stream only default
            || (streamConfigType === consts.StreamConfig.LowOnly && loadSecondaryStream)//for low stream only default
        return (
            <div>
                {showVideo &&
                    <div onClick={this.stopOnDemandPlay}>
                        {/* <div ref={`secondaryStream`} id="secondaryStreamButton" onClick={this.fromSingleLayout} className={'lowPlay'} > {streamConfigType == "LowStreamOnly" ? "HD" : "SD"}</div> */}

                        {/* Video comp to show primary stream */}
                        {!loadSecondaryStream &&
                            <video
                                onPlaying={this.onPlaying}
                                ontimeupdate={onTimeUpdate}
                                id={componentKey}
                                loop
                                className={vidClass}
                                autoPlay
                                muted={isTimeline ? false : !isFullScreen}
                                style={style}
                                onLoadedMetadata={onLoadedMetadata}
                            />}
                        {loadSecondaryStream == true &&
                            <div>
                                <video onLoadedMetadata={onLoadedMetadata} onPlaying={this.onPlaying} id={secondaryStream.streamId} loop className={highVidClass} style={{ display: "none" }} autoPlay
                                    muted={isTimeline ? false : !isFullScreen} />
                            </div>
                        }
                        {(!isOnDemand || onDemandStartPlay) && <div className="load-video" id={`antLowStreamLoader${componentKey}`} style={backgroundImage}></div>}
                        {/* Buttons for switching between High and Low Stream in in single layout */}
                        {(isSingleLayout && !isOnDemand) && !is360 &&
                            <div
                                ref={`HDPlay${componentKey}`}
                                id="HDPlayButton"
                                onClick={this.startAndPlayStream}
                                className={'highPlay fullscreenHighRes'}
                            >
                                {`${isHighStream ? "SD" : "HD"}`}
                            </div>}
                        {/* On-demand video components */}
                        {(isOnDemand && !onDemandPlayStarted && !showHighLowSelection && !isOnDemandPlay) && (!isDewarpEnable || !showPlayButton) && <i ref={`livePlayButton${componentKey}`} id="livePlayButton"
                            onClick={this.startAndPlayStream} className={'fa fa-play fa-3x livePlayButton'} />}


                        {onToggle && <i ref={`livePlayButton${componentKey}`} className="livePlayButton" id="livePlayButton"
                            onClick={this.startAndPlayStream} style={{ visibility: 'hidden' }} className={'fa fa-play fa-3x livePlayButton'} />}
                        {isOnDemand && !onDemandPlayStarted && showHighLowSelection && isSingleLayout &&
                            <span className="onDemandPlayButtons" >
                                <div ref={`HDPlay${componentKey}`} id="HDPlayButton" onClick={this.startAndPlayStream} className={'highPlay'} > HD </div>
                                <div ref={`LowPlay${componentKey}`} id="LowPlayButton" onClick={this.startAndPlayStream} className={'lowPlay'} > SD </div>
                                {/* {isAIStreamAvaialble && <div ref={`AIPlay${componentKey}`} id="AIPlayButton" onClick={this.fromSingleLayout} className={'aiPlay'}> AI Stream </div>} */}
                            </span>
                        }

                        {/* Component to show loader while switching streams */}
                        {(!isOnDemand && loadSecondaryStream !== null && isSingleLayout) && <div className="loadHD-video" id={"antHDLoader"} >{`Loading ${isHighStream ? "HD" : "SD"}...`}</div>}

                        {/* Video comp to show secondary stream */}
                    </div>}
            </div>
        )
    }
}
export default AntMediaPlayer;
