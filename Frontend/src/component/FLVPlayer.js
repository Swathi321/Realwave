import React, { PureComponent } from 'react';
import ReactPlayer from 'reactjs-player';
import { connect } from 'react-redux';
import { startStream } from './../redux/actions/httpRequest';
import store from './../redux/store';
const loader = require('../assets/img/loader.gif');
const ReactPlayerContext = ReactPlayer.ReactPlayerContext;


class RefreshSupport extends React.Component {

  constructor(props) {
    super(props);

    this.retryLimit = 3;
    this.retry = 0;
    this.controller = null;
    this.state = {
      isVideoAvailable: false,
      onDemandPlayStarted: false,
      loadStreamType: "Low",
      showHighLowSelection: false
    }
    this.clearPlayerInitialize = null;
    this.clearTimeout = null;
    this.timeoutLimit = 10000;
    this.playerComp = null;
  }

  componentWillUnmount() {
    this.stopLivePlay();
  }

  timeout = (ms, promise) => {
    return new Promise((resolve, reject) => {
      this.clearTimeout = setTimeout(() => {
        reject(new Error("timeout"))
      }, ms)
      promise.then(resolve, reject)
    });
  }

  stopLivePlay = () => {
    let { camId } = this.props;
    let player = document.getElementById(`${'react-flv-'}${camId}`);

    clearTimeout(this.clearPlayerInitialize);
    clearTimeout(this.clearTimeout);
    clearTimeout(this.playerComp);
    if (player && player.pause) {
      player.pause();
    }
  }

  request = (nextUrl) => {
    let { url } = this.props;
    if (!nextUrl && !url) {
      return;
    }
    this.controller = new AbortController();
    let requestOption = fetch(url || nextUrl, {
      method: 'GET',
      signal: this.controller.signal
    });
    this.timeout(this.timeoutLimit, requestOption).then(this.onSuccess).catch(this.onFail);
  }

  onSuccess = (response) => {
    const { siteConfig } = this.props;
    this.controller.abort();
    let isOnDemand = siteConfig && siteConfig.storeId && siteConfig.storeId.siteStreamConfig && siteConfig.storeId.siteStreamConfig == "OnDemand" ? true : false;
    if (response.status === 200 && !isOnDemand) {
      this.setState({ isVideoAvailable: true }, () => {
        this._initPlayer();
      });
    } else {
      this.onFail();
    }
  }

  onFail = (err) => {
    this.controller.abort();
    const { url } = this.props;
    console.log(`Reconnecting: ${url}`);
    this.retry++;
    if (this.retry > this.retryLimit) {
      console.log(`Not able to connect with media server, may be link expired`);
      return;
    }
    this.request();
  }
}

class FLVPlayer extends RefreshSupport {
  constructor(props) {
    super(props);
    this.onTimeUpdate = this.onTimeUpdate.bind(this);
  }

  componentDidMount() {
    let { isTimeline, camId, storeId, videoIndex, siteConfig } = this.props;
    let isOnDemand = siteConfig && siteConfig.storeId && siteConfig.storeId.siteStreamConfig && siteConfig.storeId.siteStreamConfig == "OnDemand" ? true : false;
    if (!isOnDemand) {
      if (!isTimeline) {
        let timeToInitialize = videoIndex ? +videoIndex.toString().split('').pop() : 2;
        setTimeout(() => {
          store.dispatch(startStream.request({ camId: camId, storeId: storeId }));
        }, 600 * timeToInitialize);
      }
      this.request();
    }

  }

  componentWillReceiveProps(nextProps) {
    if (this.props.url !== nextProps.url) {
      this.request(nextProps.url);
    }
  }

  onTimeUpdate = (e, v) => {
    let { onTimeUpdate, config } = this.props;
    onTimeUpdate && onTimeUpdate(e, v);
    if (config && config.cameraType && config.cameraType == '360') {
      e.target.style.objectFit = "contain"
    }
  }

  refreshPlayer() {
    this.setState({ isVideoAvailable: false });
    clearTimeout(this.clearPlayerInitialize);
    this.clearPlayerInitialize = setTimeout(() => {
      this.setState({ isVideoAvailable: true });
      this._initPlayer();
    }, 2000);
  }

  _initPlayer() {
    let { is360, camId, isTimeline, onTimeUpdate, onToggle, url, stretchProperty, siteConfig } = this.props;
    let isOnDemand = siteConfig && siteConfig.storeId && siteConfig.storeId.siteStreamConfig && siteConfig.storeId.siteStreamConfig == "OnDemand" ? true : false;
    let player = document.getElementById(`${isTimeline ? 'TIMELINE_PLAYER_' : 'react-flv-'}${camId}`);
    let playerHigh = document.getElementById(`${isTimeline ? 'TIMELINE_PLAYER_' : 'react-flv-'}${camId}-High`);

    if (player) {
      if (stretchProperty && player) {
        player.style.objectFit = stretchProperty;
      }

      if (is360) {
        var flvPlayer = window.videojs(player, {}, function () { });
        flvPlayer.panorama({
          clickAndDrag: true,
          autoMobileOrientation: true,
          maxLat: -10,
          initLat: -10,
          rotateX: -Math.PI,
          videoType: 'fisheye',
          MouseEnable: true,
        });
        player.style.objectFit = 'contain';
      }

      player.ontimeupdate = this.onTimeUpdate;
      player.onplaying = this.onPlaying;
    }



    if (playerHigh) {
      playerHigh.onplaying = this.onPlayingHigh;
      playerHigh.style.objectFit = stretchProperty;
      if (is360) {
        var flvPlayerHigh = window.videojs(playerHigh, {}, function () { });
        flvPlayerHigh.panorama({
          clickAndDrag: true,
          autoMobileOrientation: true,
          maxLat: -10,
          initLat: -10,
          rotateX: -Math.PI,
          videoType: 'fisheye',
          MouseEnable: true,
        });
        playerHigh.style.objectFit = 'contain';
        flvPlayerHigh.onclick = () => {
          this.stopOnDemandPlay();
        }
      }
      if (isOnDemand) {
        playerHigh.onclick = () => {
          this.stopOnDemandPlay();
        }
      }
    }

    if (isOnDemand) {
      player.onclick = () => {
        this.stopOnDemandPlay();
      }
    }

    if (onToggle) {
      player.onplay = onToggle;
      player.onpause = onToggle;
      player.onclick = (e) => {
        if (e.target.paused) {
          e.target.play().then(res => {
            //Playing
          }).catch(err => {
            console.log('Not Able to play');
          })
        } else {
          e.target.pause();
        }
      }
    }
    else {
      clearInterval(this.playerComp);
      this.playerComp = setInterval(() => {
        this.refreshPlayer();
      }, 300000);
    }
    if (url) {
      player.onerror = () => {
        console.log('Failed to load video try to forceUpdate the component and restart the video');
        this._initPlayer();
      }
    }
  }

  onPlaying = () => {
    let { camId } = this.props;
    let lowStreamLoader = document.getElementById(`StreamLoader${camId}`);
    setTimeout(() => {
      if (lowStreamLoader) {
        lowStreamLoader.style.visibility = "hidden";
      }
    }, 2000);

  }

  onPlayingHigh = () => {
    let { camId } = this.props;
    let player = document.getElementById(`${'react-flv-'}${camId}`);
    let playerHigh = document.getElementById(`${'react-flv-'}${camId}-High`);
    let lowStreamLoader = document.getElementById(`flvHDloader${camId}`);
    if (player && player.src) {
      setTimeout(() => {
        if (lowStreamLoader) {
          lowStreamLoader.style.visibility = "hidden";
        }
        player.hidden = true;
        this.stopLivePlay();
        if (playerHigh) {
          playerHigh.style.visibility = "visible";
        }
      }, 5000);
    }
  }

  startPlay() {
    let { camId, storeId, videoIndex } = this.props;
    let timeToInitialize = videoIndex ? +videoIndex.toString().split('').pop() : 2;
    this._initPlayer();
    setTimeout(() => {
      store.dispatch(startStream.request({ camId: camId, storeId: storeId }));
    }, 600 * timeToInitialize);
  }

  startOnDemandPlay = (event, hideLowHDIcon, forHigh) => {
    let liveStopButton = document.getElementById(`liveStopButton${camId}`);
    if (liveStopButton) {
      liveStopButton.style.visibility = "hidden";
    }
    const { camId, storeId, singleLayoutStream, url } = this.props;
    let playerURL = this.state.loadStreamType == "Low" ? url : singleLayoutStream
    if (singleLayoutStream == null || singleLayoutStream == "") {
      this.setState({ onDemandPlayStarted: true, playURL: playerURL }, () => {
        this.startPlay();
      });
    } else {
      if (!hideLowHDIcon) {
        this.setState({ showHighLowSelection: true });
      }
      else {
        if (forHigh) {
          store.dispatch(startStream.request({ camId: camId, storeId: storeId, streamType: "High" }));
          this.setState({ onDemandPlayStarted: true, playURL: playerURL }, () => {
            this._initPlayer();
          });
        }
        else {
          this.setState({ onDemandPlayStarted: true, playURL: playerURL }, () => {
            this.startPlay();
          });
        }
      }
    }
  }

  fromSingleLayout = (event) => {
    let { liveVideScope } = this.props;
    let isHighStream = event.target.id == "HDPlayButton" || event.target.id == "AIPlayButton";
    if (isHighStream) {
      if (event.target.id == "AIPlayButton" && liveVideScope && liveVideScope.state) {
        liveVideScope.setState({ isAIStream: true }, () => {
          this.setState({ loadStreamType: "High" }, () => {
            this.startOnDemandPlay(event, true, true);
          });
        });
      }
      else {
        this.setState({ loadStreamType: "High" }, () => {
          this.startOnDemandPlay(event, true, true);
        });
      }
    } else {
      this.startOnDemandPlay(event, true, false);
    }
  }

  stopOnDemandPlay = () => {
    let { liveVideScope } = this.props;
    this.stopLivePlay();
    this.setState({ onDemandPlayStarted: false, loadStreamType: "Low" });
    if (liveVideScope && liveVideScope.state) {
      liveVideScope.setState({ isAIStream: false });
    }
  }

  render() {
    const { isVideoAvailable, onDemandPlayStarted, showHighLowSelection, loadStreamType, playURL } = this.state;
    const { controls, componentKey, url, timelinePlayer, camId, isTimeline, isMultiple, siteConfig, singleLayoutStream, isAIStream } = this.props;
    let isOnDemand = siteConfig && siteConfig.storeId && siteConfig.storeId.siteStreamConfig && siteConfig.storeId.siteStreamConfig == "OnDemand" ? true : false;
    let isAIStreamAvaialble = siteConfig && siteConfig.flv && siteConfig.flv.aIStreamURL;
    let onDemandStartPlay = !isOnDemand || onDemandPlayStarted;
    let backgroundImage = { backgroundImage: `url(${loader})` };
    return !isOnDemand ? <div>
      {!singleLayoutStream && <div className="load-video" id={`StreamLoader${camId}`} style={backgroundImage}></div>}
      {singleLayoutStream && <div className="loadHD-video" id={`flvHDloader${camId}`} >{!isAIStream ? loadStreamType == "High" && "Loading High Resolution..." : "Loading AI Stream..."}</div>}
      <ReactPlayer
        videoProps={{
          id: `${isTimeline ? 'TIMELINE_PLAYER_' : 'react-flv-'}${camId}`
        }}
        controls={controls}
        kernel="flvjs"
        type="video/x-flv"
        src={url} //Need to change server url according to multi port
        className={isMultiple ? "multiple_playbacks" : ""}
      >
        {isTimeline && <i ref={`imgPauseButton${componentKey}`} id="pauseButton" className={`fa fa-play fa-5x timeLinePauseButton ${isMultiple && ' timeLinePauseButton_multi'}`} />}
      </ReactPlayer>
      {singleLayoutStream && !isTimeline && <ReactPlayer
        videoProps={{
          id: `${isTimeline ? 'TIMELINE_PLAYER_' : 'react-flv-'}${camId}-High`
        }}
        controls={controls}
        kernel="flvjs"
        type="video/x-flv"
        src={singleLayoutStream} //Need to change server url according to multi port
        className={isMultiple ? "multiple_playbacks" : "FLVHighStreamPlayer"}
      >
        {isTimeline && <i ref={`imgPauseButton${componentKey}`} id="pauseButton" className={`fa fa-play fa-5x timeLinePauseButton ${isMultiple && ' timeLinePauseButton_multi'}`} />}
      </ReactPlayer>}
    </div>
      :
      <span>
        {isOnDemand && !onDemandPlayStarted && !showHighLowSelection && <i ref={`livePlayButton${camId}`} id="livePlayButton" onClick={this.startOnDemandPlay} className={'fa fa-play fa-3x livePlayButton'} />}
        {isOnDemand && !onDemandPlayStarted && showHighLowSelection && <span className="onDemandPlayButtonsFLV" >
          <div ref={`HDPlay${camId}`} id="HDPlayButton" onClick={this.fromSingleLayout} className={'highPlay'} > High Res </div>
          <div ref={`LowPlay${camId}`} id="LowPlayButton" onClick={this.fromSingleLayout} className={'lowPlay'} > Low Res </div>
          {isAIStreamAvaialble && <div ref={`AIPlay${camId}`} id="AIPlayButton" onClick={this.fromSingleLayout} className={'aiPlay'}> AI Stream </div>}
        </span>}
        {isOnDemand && onDemandPlayStarted && <i id={`liveStopButton${camId}`} onClick={this.stopOnDemandPlay} className="stopLiveButton" />}
        {onDemandPlayStarted && <div className="load-video" id={`StreamLoader${camId}`} style={backgroundImage}></div>}

        {onDemandStartPlay &&
          <ReactPlayer
            videoProps={{
              id: `${isTimeline ? 'TIMELINE_PLAYER_' : 'react-flv-'}${camId}`
            }}
            controls={controls}
            kernel="flvjs"
            type="video/x-flv"
            src={playURL} //Need to change server url according to multi port
            className={isMultiple ? "multiple_playbacks" : ""}
          />}
      </span>
  }
}

function mapStateToProps(state, ownProps) {
  return {
    timelinePlayer: state.timelinePlayer
  };
}
export default connect(mapStateToProps)(FLVPlayer);
