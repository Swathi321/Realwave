import React from "react";
import PropTypes from "prop-types";
import { connect } from 'react-redux';
import { storeChange, sameWindow, selectedCameraData as updateCameraData, liveVideoClick } from '../redux/actions';
import { cameraData, storesData, storeData } from '../redux/actions/httpRequest';
import utils from "../Util/Util";
import redDot from '../assets/img/rec_Reddot_icon_24.svg';
import aiIcon from '../assets/img/black_letter_aiicon.ico';
import swal from 'sweetalert';
import { Input, Col } from 'reactstrap';

class FullScreen extends React.PureComponent {
  static propTypes = {
    children: PropTypes.node.isRequired,
    enabled: PropTypes.bool.isRequired,
    onChange: PropTypes.func
  };

  static defaultProps = {
    enabled: false
  };

  constructor(props) {
    super(props);
    this.alreadyclicked = false;
    this.alreadyclickedTimeout = null;
    this.onRowClick = this.onRowClick.bind(this);

    this.onClickCheckBox = this.onClickCheckBox.bind(this);
    this.enablePlayback = this.enablePlayback.bind(this);
    this.isFull = false;
    this.state = {
      isEnablePlayback: false,
      videoConfig: {}
    }
    this.prevClick = this.nextPrevClick.bind(this, false);
    this.nextClick = this.nextPrevClick.bind(this, true);
  }

  componentWillReceiveProps(nextProps) {

    if ((nextProps.cameraData && nextProps.cameraData !== this.props.cameraData)) {
      let { isFetching } = nextProps.cameraData;
      if (!isFetching) {
        this.props.dispatch(storesData.request({ stores: [] }));
      }
    }

    if ((nextProps.storesData && nextProps.storesData !== this.props.storesData)) {
      let { data, isFetching } = nextProps.storesData;
      if (!isFetching) {
        if (data) {
          let storeChangeValues = this.props.storeChange;
          storeChangeValues = Object.assign({}, storeChangeValues, { data: data.data });
          this.props.dispatch(storeChange(storeChangeValues));
        }
      }
    }
  }

  nextPrevClick(isNext) {
    debugger
    const { getNextPrevConfig, videoIndex } = this.props;
    const { videoConfig } = this.state;
    const nextConfig = getNextPrevConfig(videoConfig.index || videoIndex, isNext);
    var lastVideo = null;
    if (Object.keys(videoConfig).length !== 0) {
      lastVideo = document.getElementById('liveStopButton' + videoConfig.config._id);
    }
    else {
      lastVideo = document.getElementById('liveStopButton' + this.props.config._id);
    }
    if (lastVideo) {
      lastVideo.click();
    }
    if (nextConfig) {
      this.setState({ videoConfig: nextConfig });
    }
  }

  onRowClick(row, data) {
    if (this.alreadyclicked) {
      // double
      this.alreadyclicked = false;
      this.alreadyclickedTimeout && clearTimeout(this.alreadyclickedTimeout);
      this.siteVideoControl('full');
    } else {
      this.alreadyclicked = true;
      this.alreadyclickedTimeout = setTimeout(() => {
        this.alreadyclicked = false;
      }, 300);
    }
  }

  fullScreenToggle() {
    const { onChange, resetStream } = this.props;
    let elem = document.getElementById(this.props.cameraId);
    if (!this.isFull) {
      if (document.fullscreenEnabled) {
        utils.requestFullscreen(elem);
      }
    } else {
      utils.exitFullScreen(document);
      resetStream();
    }
    this.isFull = !this.isFull;
    if (onChange) {
      onChange(this.isFull);
    }
  }
  fullScreenOnWindoToggle() {
    const { onChange, resetStream } = this.props;
    let me = this;
    let elem = document.getElementById('VIDEO_CONTAINER' + me.props.cameraId);
    let isIpad = utils.isIpad;
    if (isIpad) {
      var allVideos = document.getElementsByClassName("red5pro-media red5pro-media-background");
      for (var i = 0; i < allVideos.length; i++) {
        var currentId = allVideos[i].id;
        if (currentId.includes(me.props.cameraId)) {
          elem = document.getElementsByClassName('red5pro-media red5pro-media-background')[i];
        }
      }
    }
    if (!me.isFull) {
      me.isFull = true;
      if (elem) {
        elem.addEventListener('fullscreenchange', (event) => {
          me.props.dispatch(liveVideoClick(false));
          me.setState({ refreshing: true }, () => {
            setTimeout(() => {
              me.props.dispatch(liveVideoClick(true));
              me.setState({ refreshing: false });
            }, 3000);
          });
        });
        me.props.dispatch(sameWindow({ isSame: true, cameraId: me.props.cameraId }));
        utils.requestFullscreen(elem);
        elem.addEventListener("webkitendfullscreen", function () {
          me.isFull = false;
          me.props.dispatch(sameWindow({ isSame: false }));
          utils.exitFullScreen(document);
          document.getElementsByClassName("site-video-layout cursor kpi-text")[5].click();
        }, false);
      }
    } else {
      me.isFull = false;
      utils.exitFullScreen(document);
      resetStream();
    }
  }

  siteVideoControl = (key, isFullScreen) => {
    switch (key) {
      case 'full':
        if (!isFullScreen) {
          if (this.props && this.props.liveVideScope && this.props.liveVideScope) {
            let me = this;
            me.props.liveVideScope.onSelect("1x1");
            setTimeout(() => {
              me.props.liveVideScope.refs.SliderComp.scrollToSlide(me.props.fullScreenVideoIndex + 1);
            }, 500);
          }
        }
        else {
          this.fullScreenOnWindoToggle();
        }
        break;
      case 'aspectRatio':
        this.props.maintainAspectRatio();
        break;
      default:
        break;
    }
  }
  eventClick(item) {
    if (this.isFull) {
      const { resetStream } = this.props;
      this.isFull = false;
      utils.exitFullScreen(document);
      resetStream();
    }
    item.callBack();
  }

  onClickCheckBox = (value) => {
    const { cameraId, storeId, register, cameraRTSPUrl } = this.props;
    this.props.dispatch(cameraData.requestcameraRTSPUrl({
      action: 'update', data: {
        enableHeatMap: value,
        storeId: storeId,
        register: register,
        cameraRTSPUrl: cameraRTSPUrl
      }
    }, cameraId));
  }

  enablePlayback = (e) => {
    const { storesData, selectedCameraData, storeId } = this.props;
    if (selectedCameraData && selectedCameraData.cameraData && selectedCameraData.cameraData.length > 0) {
      let records = selectedCameraData.cameraData.filter((cam) => cam.storeId._id == storeId);
      if (records.length == 0) {
        return swal(`Alert`, `Cameras can be selected from the same site only`, 'warning');
      }
    }

    const { data } = storesData;
    let getAllSelectedCameras = data && data.data && data.data.filter(function (cam) { return cam.checked == true });
    let getCheckedCamera = data && data.data && data.data.filter(function (cam) { return cam._id == e.target.id });

    if (getCheckedCamera && getCheckedCamera.length > 0 && (getAllSelectedCameras.length <= 4 || getAllSelectedCameras.length == null || e.target.checked == false)) {
      getCheckedCamera[0].checked = e.target.checked;
      getCheckedCamera = getCheckedCamera[0]
    }

    getAllSelectedCameras = data && data.data && data.data.filter(function (cam) { return cam.checked == true })
    getCheckedCamera = data && data.data && data.data.filter(function (cam) { return cam._id == e.target.id });
    if (getAllSelectedCameras && getAllSelectedCameras.length > 4 && getCheckedCamera && getCheckedCamera.length > 0) {//upto 4 Cam
      swal(`Alert`, `You can only select up to 4 cams`, 'warning');
      getCheckedCamera[0].checked = false;
      getCheckedCamera = getCheckedCamera[0]
      this.props.dispatch(updateCameraData({ cameraData: getAllSelectedCameras, seekProp: null }));
    } else {
      this.props.dispatch(updateCameraData({ cameraData: getAllSelectedCameras, seekProp: null }));
    }
  }

  render() {
    const { siteVideoControl, props } = this;
    const { buttons, storeName, cameraName, isEnabledHeatmap, isHeatMapCamera, isPlay, fullScreenVideoIndex, showOptionClass, disableFullScreen, cameraData, isRecordingStarted, is360, cameraId, selectedCameraData, prevClick, nextClick } = props;
    const className = ["fullscreen"];
    if (this.props.enabled) {
      className.push("fullscreen-enabled");
    }
    let isRecordingEnabled = isRecordingStarted || (cameraData && cameraData.data && cameraData.data.isRecordingStarted); // so that Fullscreen also shows the Red Dot icon
    if (cameraData && cameraData.data && cameraData.data.storeId && cameraData.data.storeId.type == "Rex" && cameraData.data.recordingStreamId != null) {
      isRecordingEnabled = true;
    }
    let isCamera360 = is360 == "360";
    let redDotIconClass = isCamera360 ? "normalvideo-withdot CameraIcon360" : "normalvideo-withdot";
    let isCameraSelectedForPlayback = false;
    let camSelected = selectedCameraData && selectedCameraData.cameraData && selectedCameraData.cameraData.length > 0 && selectedCameraData.cameraData.filter(function (cam) { return cam._id == cameraId && cam.checked == true });
    if (camSelected && camSelected.length > 0) {
      isCameraSelectedForPlayback = true;
    }
    let selectedId = window.location.hash.indexOf("videoIndex") > 1;
    let location = window.location.hash.includes("videoIndex");
    return (
      <div ref={node => (this.node = node)} onClick={this.onRowClick} className={`${props.enabled ? 'fullscreen-container' : 'default-videoContainer-height'}`}>
        {cameraName && isPlay && <div className={'site-video-content'} draggable={this.props.draggable}>
          {storeName + " / " + cameraName}
        </div>}
        {isRecordingEnabled && <img className={redDotIconClass} src={redDot}></img>}
        {selectedId &&
          <>
            <div className={"carousel-left fullscreenBtns"} onClick={prevClick}>
              <img src='assets/img/left-o.png' className="arrow-img" />
            </div>
            <div className={"carousel-right fullscreenBtns"} onClick={nextClick}>
              <img src='assets/img/right-o.png' className="arrow-img" />
            </div>
          </>
        }

        {<div className={'site-video-control ' + showOptionClass} >
          {isPlay &&
            <>
              <ul>
                <li className="pdRight_20">
                  {!location && <div className="checkbox_position">
                    <Input title="Select camera for Sync playback" className='cursor sms-Checkbox playback_checkbox' checked={isCameraSelectedForPlayback}
                      type="checkbox" onClick={this.enablePlayback} id={cameraId} />
                  </div>}
                </li>
                <li title={props.enabled ? "Exit Full Screen" : "Full Screen in same window"} id={`full_screen_btn_${fullScreenVideoIndex}`}
                  onClick={() => siteVideoControl('full', true)}>
                  <i className={"cursor fa fa-" + (props.enabled ? "compress" : "arrows-alt")} aria-hidden="true"></i>
                </li>
                {buttons && !this.props.hiddenController && buttons.length > 0 && buttons.map(function (item, index) {
                  return (
                    <li title={item.title} onClick={() => this.eventClick(item)} key={index}>{!item.isImage ? <i className={item.icon} aria-hidden="true"></i> :
                      <img src={aiIcon} className={item.icon}></img>
                    }</li>
                  )

                }, this)}
              </ul>
            </>
          }
        </div>}
        {this.props.children}
      </div>
    );
  }
}

function mapStateToProps(state, ownProps) {
  return {
    exitFullScreen: state.exitFullScreen,
    cameraData: state.cameraData,
    storeChange: state.storeChange,
    storesData: state.storesData,
    selectedCameraData: state.selectedCameraData,
    sameWindow: state.sameWindow
  };
}

var FullScreenModule = connect(mapStateToProps)(FullScreen);
export default FullScreenModule;
