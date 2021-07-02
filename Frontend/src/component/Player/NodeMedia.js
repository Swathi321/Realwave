
import React, { PureComponent } from 'react';
import ReactDOM from 'react-dom';
import { startStream } from './../../redux/actions/httpRequest';
import store from './../../redux/store';
import consts from '../../Util/consts'

const loader = require('./../../assets/img/loader.gif');
class NodeMediaPlayer extends PureComponent {
    constructor(props) {
        super(props);
        this.state = {
            stopCam: false,
            onDemandPlayStarted: false,
            loadSecondaryStream: false,
            showHighLowSelection: false,
            showPlayButton: false
        }
        this.playerComp = null;
        this.player = null;
        this.clearPlayerInitialize = null;
    }

    componentWillUnmount() {
        this.stopLivePlay();
    }

    stopLivePlay() {
        if (this.player) {
            this.player.stop();
        }
        clearInterval(this.playerComp);
    }

    componentDidCatch(error, info) {
        this.refreshPlayer();
    }

    componentDidMount() {
        const { siteConfig, isOnDemandPlay, isDewarpEnable } = this.props;
        // On Demand sitestream config ? -> Do not start player to start streaming of video else start video in normal way
        let isOnDemand = siteConfig.storeId && siteConfig.storeId.siteStreamConfig && siteConfig.storeId.siteStreamConfig == "OnDemand" ? true : false;
        if (!isOnDemand || (isOnDemandPlay && isDewarpEnable)) {
            this.startPlay();
        }
        if (isOnDemandPlay) {
            this.startPlay();
            this.setState({ onDemandPlayStarted: true });
        }
    }

    startPlay() {
        let { videoIndex } = this.props;
        let timeToInitialize = videoIndex ? +videoIndex.toString().split('').pop() : 2;
        setTimeout(() => {
            this.playerInitialize();//startplay in beginning

        }, 600 * timeToInitialize);
    }

    playerInitialize() {
        let { url, camId, secondaryStream } = this.props;
        let { loadSecondaryStream } = this.state;
        try {
            var player = new window.NodePlayer(); //Initializing player
            if (player) {
                this.player = player;
                player.hasAudio = false;
                let canvas = document.getElementById("NP" + camId);
                let lowStreamLoader = document.getElementById(`NPLowLoader${camId}`);
                let liveStopButton = document.getElementById(`liveStopButton${camId}`);
                if (canvas != null) {
                    player.setView("NP" + camId);
                    player.setBufferTime(200);
                    player.start(loadSecondaryStream ? secondaryStream : url);//loadSecondaryStream for high stream & url for low stream
                    player.on("videoInfo", () => {
                        if (lowStreamLoader) {
                            lowStreamLoader.style.visibility = "hidden";
                        }
                        if (liveStopButton) {
                            liveStopButton.style.visibility = "visible";
                        }
                    });
                    clearInterval(this.playerComp);
                    this.playerComp = setInterval(() => {
                        this.refreshPlayer();
                    }, 300000);
                }
            }
        }
        catch (er) {
            console.log(er);
            this.refreshPlayer();
        }
    }

    startOnDemandPlay = (event) => {
        this.setState({ showHighLowSelection: true })//to show hd & sd in case of ondemand
    }

    stopOnDemandPlay = () => {
        let me = this;
        let { isDewarpEnable, siteConfig } = me.props;
        let isOnDemand = siteConfig && siteConfig.storeId && siteConfig.storeId.siteStreamConfig && siteConfig.storeId.siteStreamConfig == consts.StreamConfig.OnDemand ? true : false;;
        if (isOnDemand && me.state.onDemandPlayStarted && !me.state.showPlayButton && !isDewarpEnable) {
            this.stopLivePlay();
            this.setState({ onDemandPlayStarted: false, stopCam: true }, function () {
                this.setState({ stopCam: false });
            });
        }
    }

    switchStreams = () => {
        let { camId, storeId, siteConfig } = this.props;
        // stop current stream before switching
        let { loadSecondaryStream } = this.state;
        let streamConfigType = siteConfig && siteConfig.storeId && siteConfig.storeId.siteStreamConfig && siteConfig.storeId.siteStreamConfig;
        this.stopLivePlay();

        // start current stream before switching
        let isHighStreamConfig = (streamConfigType === consts.StreamConfig.HighOnly)
        this.setState({ loadSecondaryStream: !loadSecondaryStream, stopCam: true }, function () {
            if (isHighStreamConfig && !loadSecondaryStream) {
                store.dispatch(startStream.request({ camId: camId, storeId: storeId }));//for low stream
            }
            else {
                store.dispatch(startStream.request({ camId: camId, storeId: storeId, streamType: "High" }));//for high stream
            }

            this.setState({ stopCam: false }, function () {
                this.playerInitialize();
            });
        });
    }

    startOnDemand = (event) => {
        let { camId, storeId } = this.props;
        if (event.target.id == "HDPlayButton") //High Stream in On Demand Case
        {
            this.setState({ onDemandPlayStarted: true, stopCam: true, loadSecondaryStream: true }, function () {
                store.dispatch(startStream.request({ camId: camId, storeId: storeId, streamType: "High" }));
            })
        }
        else //Low Stream in On Demand Case
        {
            this.setState({ onDemandPlayStarted: true, stopCam: true, loadSecondaryStream: false })
            store.dispatch(startStream.request({ camId: camId, storeId: storeId }));
        }
        this.setState({ stopCam: false }, function () {
            this.playerInitialize();
        });
        if (this.props.onStateChange) {
            this.props.onStateChange({ value: true });
        }
    }

    refreshPlayer() {
        let { camId } = this.props;
        if (this.player) {
            this.player.stop();
            let nodePlayer = document.getElementById("NP" + camId);
            if (nodePlayer) {
                ReactDOM.unmountComponentAtNode(document.getElementById("NP" + camId));
            }
        }
        this.setState({ stopCam: true });
        clearTimeout(this.clearPlayerInitialize);
        this.clearPlayerInitialize = setTimeout(() => {
            this.setState({ stopCam: false });
            this.playerInitialize();
        }, 2000);
    }


    render() {
        const { camId, singleLayoutStream, siteConfig, isOnDemandPlay, isDewarpEnable } = this.props;
        const { stopCam, onDemandPlayStarted, showHighLowSelection, loadSecondaryStream, showPlayButton } = this.state;
        let isOnDemand = siteConfig.storeId && siteConfig.storeId.siteStreamConfig && siteConfig.storeId.siteStreamConfig == "OnDemand" ? true : false;//ondemand Case
        let onDemandStartPlay = !isOnDemand || onDemandPlayStarted;
        let backgroundImage = { backgroundImage: `url(${loader})` };//loader
        let streamConfigType = siteConfig && siteConfig.storeId && siteConfig.storeId.siteStreamConfig && siteConfig.storeId.siteStreamConfig;
        let isHighStream = (streamConfigType === consts.StreamConfig.HighOnly && !loadSecondaryStream) //for high stream only default
            || (streamConfigType === consts.StreamConfig.LowOnly && loadSecondaryStream)//for low stream only default

        return (
            <span>
                {!stopCam &&
                    <span>
                        {
                            <span onClick={this.stopOnDemandPlay}>
                                {/* loader */}
                                {onDemandStartPlay &&
                                    <div className="load-video" id={`NPLowLoader${camId}`} style={backgroundImage}></div>
                                }
                                {/* Buttons for switching between High and Low Stream in in single layout */}
                                {singleLayoutStream && !isOnDemand &&
                                    <div id={`${isHighStream ? "SD" : "HD"}`} onClick={this.switchStreams} className={'highPlay fullscreenHighRes'}>{`${isHighStream ? "SD" : "HD"}`}</div>}
                                {/* Player */}
                                <canvas id={"NP" + camId} style={{ width: "100%", height: '100%' }} className="NodeMediaPlayer"></canvas>

                                {isOnDemand && !onDemandPlayStarted && !showHighLowSelection && !isOnDemandPlay && ((!isDewarpEnable || !showPlayButton)) &&
                                    < i ref={`livePlayButton${camId}`} id="livePlayButton" onClick={this.startOnDemandPlay} className={'fa fa-play fa-3x livePlayButton'} />
                                }
                                {/* HD & SD Button in On Demand Case*/}
                                {isOnDemand && !onDemandPlayStarted && showHighLowSelection &&
                                    <span className="onDemandPlayButtons" >
                                        <div ref={`HDPlay${camId}`} id="HDPlayButton" onClick={this.startOnDemand} className={'highPlay'} > HD </div>
                                        <div ref={`LowPlay${camId}`} id="LowPlayButton" onClick={this.startOnDemand} className={'lowPlay'} > SD</div>
                                        {/* {isAIStreamAvaialble && <div ref={`AIPlay${camId}`} id="AIPlayButton" onClick={this.fromSingleLayout} className={'aiPlay'}> AI Stream </div>} */}
                                    </span>}
                            </span>
                        }

                    </span>
                }
            </span>

        )
    }
}

export default NodeMediaPlayer;
