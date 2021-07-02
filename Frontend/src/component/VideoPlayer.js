import React, { PureComponent } from 'react';
import FullScreen from './FullScreen';
import { exitFullScreen, fullScreenVideo, liveCamFullscreenStatus, timelinePlayer, sameWindow } from './../redux/actions';
import { createCustomVideoClip, hasBoxRecentlyRestarted } from './../redux/actions/httpRequest';
import { connect } from 'react-redux';
import utils from '../Util/Util';
import VideoReceipt from './VideoReceipt';
import PTZControls from './PTZControls';
import Switch from "react-switch";
import moment from 'moment';
import TimelinePlayer from './TimelinePlayer';
import swal from 'sweetalert';
import GridSearch from '../views/GridSearch';
import DateRangePicker from '../component/DateRangePicker';
import InfoModal from '../component/InfoModal'
import LoadingDialog from './LoadingDialog';
import { Modal, ModalBody, ModalHeader, Button } from 'reactstrap';
import md5 from 'md5';
import WebRTCPlayer from './Player/WebRTCPlayer';
import io from 'socket.io-client';
import consts from '../Util/consts';

class HLSPlayer extends PureComponent {
  constructor(props) {
    super(props);
    this.state = { checked: false, heatMapLoadError: false };
    this.onEnded = this.onEnded.bind(this);
    this.interval = null;
    this.isUnmounted = false;
    this.clipTimeRange = null;
    this.isAIStream = this.props.isAIStream;
    this.dewarpVideo = null;
  }

  getNMSHash(camId) {
    let dateTime = new Date();
    dateTime = dateTime.setHours(dateTime.getHours() + 1);
    let hashValue = md5(`/live/${camId}-${dateTime}-8f273cc043a2a6ebe764ebad7e7338d6`);
    return `${dateTime}-${hashValue}`;
  }

  onEnded() {
    if (!this.isUnmounted) {
      this.forceUpdate();
    }
  }

  componentDidMount() {
    let { config, dispatch } = this.props;
    if (config && config.cameraBrand == "Hanwha") {
      let timezoneOffset = moment.utc().utcOffset(),
        currentDate = moment().format('YYYY-MM-DD 00:00:00');
      let options = { action: 'load', stores: [config.storeId._id], camId: config._id, currentDate: currentDate, timezoneOffset: timezoneOffset };
      //dispatch(getPeopleCount.request(options));
    }
  }

  componentWillUnmount() {
    this.isUnmounted = true;
  }

  handleChange = (checked) => {
    if (this.dewarpVideo) {
      clearTimeout(this.dewarpVideo);
    }
    this.dewarpVideo = setTimeout(() => {
      this.setState({ checked });
    }, 500);
  }

  onVideoStateChange = ({ value }) => {
    this.setState({ isOnDemandPlay: value });
  };

  heatmapimagehandle = (e) => {
    e.target.style.display = 'none'
    this.setState({ heatMapLoadError: true });
  }

  getStreamURL(videoConfigType) {
    let { config, liveVideScope } = this.props;
    let siteConfig = config && config.storeId && config.storeId.siteStreamConfig && config.storeId.siteStreamConfig;
    let isAIStream = liveVideScope && liveVideScope.state && liveVideScope.state && liveVideScope.state.isAIStream ? liveVideScope.state.isAIStream : false;
    let streamURL = {};
    switch (videoConfigType) {
      case "FLV":
      case "NodeMedia":
        if (siteConfig == consts.StreamConfig.LowOnly || siteConfig == consts.StreamConfig.OnDemand) {
          streamURL.primaryStream = config.flv.lowStreamURL;
          streamURL.secondaryStream = config.flv.highStreamURL;
        }
        else if (siteConfig == consts.StreamConfig.HighOnly) {
          streamURL.primaryStream = config.flv.highStreamURL;
          streamURL.secondaryStream = config.flv.lowStreamURL;
        }
        // if (isAIStream) {
        //   streamURL = config.flv.aIStreamURL;
        // }
        break;
      case "WebRTC":

        if (siteConfig == consts.StreamConfig.HighOnly) {
          streamURL.primaryStream = { streamId: config.streamHigh, streamToken: config.streamToken.high };
          streamURL.secondaryStream = { streamId: config.streamLow, streamToken: config.streamToken.low };
        }
        else {
          streamURL.primaryStream = { streamId: config.streamLow, streamToken: config.streamToken.low };
          streamURL.secondaryStream = { streamId: config.streamHigh, streamToken: config.streamToken.high };
        }
        break
      default:
        streamURL = "";
        break;
    }

    return streamURL;

  }

  render() {
    const { config, peopleInCount, peopleOutCount, isFull, muted, refreshing, isSameWindow, stretchProperty, layout, videoIndex, liveVideScope } = this.props;
    let isAIStream = liveVideScope && liveVideScope.state && liveVideScope.state.isAIStream ? this.props.liveVideScope.state.isAIStream : false;
    const { checked, heatMapLoadError, isOnDemandPlay } = this.state;
    let videoConfigType = this.props.config.storeId.liveVideoConfig ? this.props.config.storeId.liveVideoConfig : 'WebRTC';
    if (config.isBlank) {
      return null;
    }
    let isSingleLayout = (layout && layout.layout && layout.layout == "1x1") || isSameWindow;
    let streamURLs = this.getStreamURL(videoConfigType, config);

    let objectFitProp = stretchProperty;
    if (config.cameraType == "360") {
      objectFitProp = "contain"
    }
    return (
      <div style={videoConfigType == "NodeMedia" ? { height: "100%", width: "100%" } : null} key={config._id}>
        {
          config.isHeatMapCamera ?
            (
              <div className="default-videoContainer-height">
                {
                  config.cameraBrand == "Hanwha" &&
                  <div className="people-count">
                    <div className="people-count-inner-first-div"><i className="fa fa-user-plus" /><span className="people-count-font"> {peopleInCount && peopleInCount}</span></div>
                    <div>
                      <i className="fa fa-user-minus" />
                      <span className="people-count-font"> {peopleOutCount && peopleOutCount}</span>
                    </div>&nbsp;&nbsp;
                    <Switch
                      onChange={this.handleChange}
                      checked={checked}
                      onColor="#86d3ff"
                      onHandleColor="#2693e6"
                      handleDiameter={20}
                      height={13}
                      width={35}

                    />
                  </div>
                }

                {
                  config.isHeatMapCamera && checked &&
                  <span>
                    <img src={`${utils.serverUrl}/heatMapData?clientId=${config.storeId._id}&camId=${config._id}`} onError={this.heatmapimagehandle} className="live-video-image-cover video-image-loading" />
                    {
                      heatMapLoadError && <div className="heatmap-overlay">
                        <span className='heatmap-overlay-text'>Heat map data not available.</span>
                      </div>
                    }
                  </span>
                }
                {
                  //Need enhancement
                  checked ?
                    streamURLs.primaryStream && <WebRTCPlayer onStateChange={this.onVideoStateChange} liveVideScope={liveVideScope} videoIndex={videoIndex} stretchProperty={objectFitProp} isSingleLayout={isSingleLayout} secondaryStream={streamURLs.secondaryStream} isFullScreen={isSameWindow} token={streamURLs.primaryStream.streamToken} config={config} muted={muted} key={checked} is360={true} componentKey={streamURLs.primaryStream.streamId} refreshing={refreshing} url={streamURLs.primaryStream} isAIStream={isAIStream} isDewarpEnable={checked} isOnDemandPlay={isOnDemandPlay} />
                    :
                    streamURLs.primaryStream && <WebRTCPlayer onStateChange={this.onVideoStateChange} videoIndex={videoIndex} liveVideScope={liveVideScope} stretchProperty={objectFitProp} isSingleLayout={isSingleLayout} secondaryStream={streamURLs.secondaryStream} isFullScreen={isSameWindow} token={streamURLs.primaryStream.streamToken} config={config} muted={muted} key={checked} componentKey={streamURLs.primaryStream.streamId} refreshing={refreshing} url={streamURLs.primaryStream} isAIStream={isAIStream} isDewarpEnable={checked} isOnDemandPlay={isOnDemandPlay} />
                }
              </div>
            )
            :
            (
              config.cameraType == "360" ?
                <div className="default-videoContainer-height">

                  <Switch
                    onChange={this.handleChange}
                    checked={checked}
                    onColor="#86d3ff"
                    onHandleColor="#2693e6"
                    handleDiameter={20}
                    height={13}
                    width={35}
                    className={"switch-button video-switch-toggle"} />

                  <div className={config.cameraBrand == "Hanwha" ? "change-three-layout" : ''} style={{ height: "100%", width: "100%" }}>
                    {
                      //Need enhancement
                      checked ?
                        streamURLs.primaryStream && <WebRTCPlayer onStateChange={this.onVideoStateChange} liveVideScope={liveVideScope} videoIndex={videoIndex} isSingleLayout={isSingleLayout} secondaryStream={streamURLs.secondaryStream} stretchProperty={objectFitProp} isFullScreen={isSameWindow} token={streamURLs.primaryStream.streamToken} config={config} muted={muted} key={checked} is360={true} componentKey={streamURLs.primaryStream.streamId} refreshing={refreshing} url={streamURLs.primaryStream} isAIStream={isAIStream} isDewarpEnable={checked} isOnDemandPlay={isOnDemandPlay} />
                        :
                        streamURLs.primaryStream && <WebRTCPlayer onStateChange={this.onVideoStateChange} liveVideScope={liveVideScope} videoIndex={videoIndex} isSingleLayout={isSingleLayout} secondaryStream={streamURLs.secondaryStream} stretchProperty={objectFitProp} isFullScreen={isSameWindow} token={streamURLs.primaryStream.streamToken} config={config} muted={muted} key={checked} componentKey={streamURLs.primaryStream.streamId} refreshing={refreshing} url={streamURLs.primaryStream} isAIStream={isAIStream} isDewarpEnable={checked} isOnDemandPlay={isOnDemandPlay} />
                    }
                  </div>
                </div>
                :
                streamURLs.primaryStream && <WebRTCPlayer liveVideScope={liveVideScope} videoIndex={videoIndex} isSingleLayout={isSingleLayout} secondaryStream={streamURLs.secondaryStream} stretchProperty={objectFitProp} isFullScreen={isSameWindow} token={streamURLs.primaryStream.streamToken} config={config} muted={muted} url={streamURLs.primaryStream} componentKey={streamURLs.primaryStream.streamId} refreshing={refreshing} isAIStream={isAIStream} />
            )
        }
      </div>
    )
  }
}

class VideoPlayer extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      isMounted: true,
      isFull: false,
      videoStyle: {},
      isPlay: true,
      lastStreamResponse: null,
      captureStart: false,
      isFetching: false,
      showGridSearch: false,
      isLoad: false,
      isExpand: false,
      videoConfig: {},
      timelineModalOpen: false,
      openInfoModal: false,
      stretchProperty: "fill",
      startDuration: moment().format('MM/DD/YYYY hh:mm:ss a'),
      endDuration: moment().format('MM/DD/YYYY hh:mm:ss a'),
      isAIStream: false
    }
    this.alreadyclicked = false;
    this.alreadyclickedTimeout = null;
    this.exit = this.exit.bind(this);
    this.goFull = this.goFull.bind(this);
    this.onChangeFullScreen = this.onChangeFullScreen.bind(this);
    this.imageInterval = true;
    this.maintainAspectRatio = this.maintainAspectRatio.bind(this);
    this.pausePlayVideo = this.pausePlayVideo.bind(this);
    this.onClickFab = this.onClickFab.bind(this);
    this.createClip = this.createClip.bind(this);
    this.prevClick = this.nextPrevClick.bind(this, false);
    this.nextClick = this.nextPrevClick.bind(this, true);
    this.resetStream = this.resetStream.bind(this);
    this.requestDuration = this.requestDuration.bind(this);
    this.onResult = this.onResult.bind(this);
    this.gridSearchData = {
      uid: null,
      equalTimeSplit: null,
      time: {
        start: null,
        end: null
      }
    }
    this.timeout = 60 * 1000;
    this.requestTimeout = null;
    this.gsDateRange = null;
  }

  pausePlayVideo = (action) => {
    const { isPlay, isFull } = this.state;
    const { onAction, config } = this.props;
    this.props.dispatch(liveCamFullscreenStatus({ [config._id]: { isFull: utils.isFullScreen } }));
    this.setState({ timelineModalOpen: true }, () => {
      if (onAction) {
        onAction({ isPlay: this.state.isPlay, storeId: config.storeId._id, camId: config._id, isHeatMapCamera: config.isHeatMapCamera });
      }
    });
    utils.exitFullScreen(document);
  }
  exit = () => {
    this.props.dispatch(fullScreenVideo(null));
    this.props.dispatch(exitFullScreen(false));
  }

  componentWillReceiveProps(nextProps) {
    let { captureStart, isFetching } = this.state;
    const { config } = nextProps;
    if (nextProps.config != this.props.config && !nextProps.config.isBlank) {
      if (this.imageInterval && !captureStart) {
        this.setState({ captureStart: true });
      }
    }

    if (nextProps.createCustomVideoClip != this.props.createCustomVideoClip) {
      const { isFetching, data, error } = nextProps.createCustomVideoClip;
      if (!isFetching) {
        if (data.success) {
          this.setState({ openDateRangePicker: false });
        }
        swal({
          title: data.success ? 'Success' : 'Error',
          text: data.success ? data.message : (error || data.message),
          icon: data.success ? 'success' : 'error',
        });
      }
    }
    this.updateCamLayout();
  }

  goFull = () => {
    if (this.alreadyclicked) {
      this.alreadyclicked = false;
      this.alreadyclickedTimeout && clearTimeout(this.alreadyclickedTimeout);
      this.setState({ isFull: !this.state.isFull });
    }
    else {
      this.alreadyclicked = true;
      this.alreadyclickedTimeout = setTimeout(() => {
        this.alreadyclicked = false;
      }, 300);
    }
  }

  onChangeFullScreen(full) {
    this.props.dispatch(fullScreenVideo(full ? this.props.videoIndex : null));
    this.setState({ isFull: full });
  }

  maintainAspectRatio() {
    if (Object.keys(this.state.videoStyle).length > 0) {
      this.setState({ videoStyle: {} });
    } else {
      this.setState({ videoStyle: { height: 'auto' } });
    }
  }

  onClickFab(camId) {
    const { onClickFab, dispatch } = this.props;
    this.setState({ isPlay: true, timelineModalOpen: false }, () => {
      onClickFab(camId);
      dispatch(timelinePlayer({
        isPlay: false,
        startDate: null,
        endDate: null
      }));
    })
  }

  createClip = () => {
    if (this.clipTimeRange) {
      const { start, end } = this.clipTimeRange;
      const { _id, storeId } = this.props.config;
      this.props.dispatch(createCustomVideoClip.request({
        startTime: moment(start).format('YYYY-MM-DD hh:mm:ss A'),
        endTime: moment(end).format('YYYY-MM-DD hh:mm:ss A'),
        storeId: storeId._id,
        camId: _id
      }));
    } else {
      swal({
        title: "Warning",
        text: "Please select valid time",
        icon: "warning"
      });
    }
  }

  onDateTimePick = (time) => {
    this.clipTimeRange = time;
  }

  onSearchGrid() {
    const { storeId } = this.props.config;
    this.clientId = utils.guid();
    let socketUri = `${utils.serverUrl}?type=client&storeId=${storeId._id}&clientId=${this.clientId}`;
    this.socketClient = io(socketUri);
    this.socketClient.on('connect', this.onConnect);
    this.socketClient.on('disconnect', this.onDisconnect);
    this.socketClient.on('gridsearchStartEndDuration', this.onResult);
  }
  requestDuration(option) {
    clearTimeout(this.requestTimeout);
    const { requestId } = this.state;
    const { camId, config } = this.props;
    let data = {
      type: 'request',
      clientId: this.clientId,
      storeId: config.storeId._id,
      camId: config._id
    }
    if (config.storeId.type == "Rex" || config.storeId.type == "Nvr") {
      data.recordingStreamId = config.recordingStreamId;
      data.primaryCameraId = config.primaryCameraId;
    }
    data = Object.assign({}, data, option);
    console.log(`Request Grid Search ${JSON.stringify(data)}`);
    this.setState({ isLoad: true, startDuration: option.startDuration, endDuration: option.endDuration });
    this.socketClient.emit('gridsearchStartEndDuration', data);
    this.requestTimeout = setTimeout(this.onRequestTimelout, this.timeout);
  }
  onResult = (res) => {
    clearTimeout(this.requestTimeout);
    let option = {};
    if (res && res.success) {
      option = { requestId: res.requestId, data: res.data, isLoad: false };
      if (option.data && option.data.hasOwnProperty('VideoId') && option.data.VideoId > 0) {
        option.startDuration = option.data.StartTime;
        option.endDuration = option.data.EndTime;
        option.openDateRangePicker = true;
      }
      else {
        swal({ title: 'Error', text: res.message, icon: 'error' });
      }
    }
    else {
      swal({ title: 'Error', text: res.message, icon: 'error' });
    }
    option.isLoad = false;
    this.setState(option);
  }
  onDisconnect = (evt) => {
    console.log(`GridSearch Socket Disconnect ${this.clientId}`);
  }

  onRequestTimelout = () => {
    swal({
      title: 'Request timeout',
      text: 'Rex/Server not responding, please try again.',
      icon: 'error'
    }).then(() => {
      const { onClose } = this.props;
      onClose && onClose();
    });
  }

  onConnect = (evt) => {
    const { camId } = this.props;
    const { startDuration, endDuration } = this.state;
    this.requestDuration({ startDuration: this.formatDate(startDuration), endDuration: this.formatDate(endDuration) });
  }
  formatDate(date) {
    return moment(date).format('MM/DD/YYYY hh:mm:ss a')
  }
  onClickSearch = () => {
    this.gridSearchData = {
      uid: null,
      equalTimeSplit: null,
      time: {
        start: null,
        end: null
      }
    }
    this.onSearchGrid();
    this.setState({ openDateRangePicker: true });
    utils.exitFullScreen(document);
  }

  onClickInfo = () => {
    this.setState({ openInfoModal: true });
  }

  closeInfoModal = () => {
    this.setState({ openInfoModal: false });
  }
  closeDateRangePicker = () => {
    this.setState({ openDateRangePicker: false, isLoad: false }, () => {
      this.socketClient.disconnect();
      this.socketClient.close();
    });
  }

  closeGridSearch = () => {
    this.setState({ showGridSearch: false });
  }

  openGridSearch = (dateRange, action) => {
    let { start, end } = dateRange;
    const { _id, storeId } = this.props.config;
    this.gridSearchData.time = dateRange;
    if (start && end) {
      if (start.toDate() > end.toDate()) {
        swal({
          title: "Warning",
          text: "Start Date can not be greater than end date",
          icon: "warning"
        });
        return;
      }
      else if (moment(start).valueOf() == moment(end).valueOf()) {
        swal({
          title: "Warning",
          text: "Please select end date/time greater than start date/time",
          icon: "warning"
        });
        return;
      }
      else if (!moment(start).isValid()) {
        swal({
          title: "Warning",
          text: "Please select valid start date/time",
          icon: "warning"
        });
        return;
      }
      switch (action) {
        case "SEARCH":
          const { config } = this.props;
          this.props.dispatch(timelinePlayer({
            isPlay: true,
            isRegularSearch: true,
            storeId: config.storeId._id,
            camId: config._id,
            isHeatMapCamera: config.isHeatMapCamera,
            startDate: start.format('MM/DD/YYYY hh:mm:ss a'),
            endDate: end.format('MM/DD/YYYY hh:mm:ss a')
          }));
          this.setState({ openDateRangePicker: false, timelineModalOpen: true });
          break;

        case "CREATE_CLIP":
          var duration = moment.duration(end.diff(start));
          if (duration.asHours() > 12) {
            return swal({ title: 'Warning', text: "You cannot proceed with video duration more than 12 hours", icon: 'warning', });
          }

          if (duration.asHours() > 2) {

            return swal({
              title: "Are you sure?",
              text: "You want to create a clip longer than 2 hours?",
              icon: "warning",
              buttons: true,
              dangerMode: true,
            })
              .then((isConfirm) => {
                if (isConfirm) {
                  this.props.dispatch(createCustomVideoClip.request({
                    startTime: moment(start).format('YYYY-MM-DD hh:mm:ss A'),
                    endTime: moment(end).format('YYYY-MM-DD hh:mm:ss A'),
                    storeId: storeId._id,
                    utcOffSet: moment().utcOffset(),
                    camId: _id
                  }));
                }
              });
          }

          this.props.dispatch(createCustomVideoClip.request({
            startTime: moment(start).format('YYYY-MM-DD hh:mm:ss A'),
            endTime: moment(end).format('YYYY-MM-DD hh:mm:ss A'),
            storeId: storeId._id,
            utcOffSet: moment().utcOffset(),
            camId: _id
          }));
          break;

        case "GRID_SEARCH":
          this.gsDateRange = dateRange;
          this.setState({ showGridSearch: true, openDateRangePicker: false });
          break;
      }
    } else {
      swal({
        title: "Warning",
        text: "Please select valid dates",
        icon: "warning"
      });
    }
  }

  componentDidMount() {
    this.updateCamLayout();
  }

  updateCamLayout() {
    const me = this;
    const { config, scope } = me.props
    let { preference } = scope.state;
    if (preference.stretchList && preference.stretchList.includes(config._id)) {
      me.onExpand(false);
    } else {
      let player = document.getElementById(`${config.lowStreamId}`);
      if (player && player.style && player.style.display == "none") {
        player = document.getElementById(`${config.highStreamId}`);
      }
      else if (!player) {
        player = document.getElementById(`${config.highStreamId}`);
      }
      if (config && config.storeId && config.storeId.liveVideoConfig == "FLV") {
        player = document.getElementById(`react-flv-${config._id}`);
      }
      else if (config && config.storeId && config.storeId.liveVideoConfig == "NodeMedia") {
        player = document.getElementById(`NP${config._id}`);
      }
      if (preference.stretchList && preference.stretchList.includes(config._id)) {
        me.onExpand(false);
        return false;
      }
      else if (player) {
        // #23387 - Full width shouldn't applied on 360
        if (config.cameraType == '360') {
          player.style.objectFit = "contain";
        }
        this.setState({ stretchProperty: player.style.objectFit });
      }
      if (player && config.cameraType != '360') {
        this.setState({ stretchProperty: player.style.objectFit });
      }
      else if (config.cameraType == '360') {
        this.setState({ stretchProperty: "contain" });
      }
      if (player && player.style.objectFit == "" && config.cameraType != '360') {
        this.setState({ stretchProperty: "fill" });
        player.style.objectFit = "fill";
        if (player.tagName !== "VIDEO") {
          player.style.width = utils.playerFillWidth;
        }
      }
    }
  }

  onExpand = (isClickEvent) => {
    const { isExpand } = this.state;
    const { config, scope } = this.props
    let player = document.getElementById(`${config.lowStreamId}`);
    if (player && player.style && player.style.display == "none") {
      player = document.getElementById(`${config.highStreamId}`);
    }
    else if (!player) {
      player = document.getElementById(`${config.highStreamId}`);
    }
    if (config.storeId.liveVideoConfig == "FLV") {
      player = document.getElementById(`react-flv-${config._id}`);
    }
    else if (config.storeId.liveVideoConfig == "NodeMedia") {
      player = document.getElementById(`NP${config._id}`);
    }
    if (player) {
      let { preference } = scope.state;
      if (preference.stretchList && isClickEvent) {
        var index = preference.stretchList.indexOf(config._id);
        if (index == -1) {
          preference.stretchList.push(config._id);
          if (player.style.objectFit === "fill") {
            player.style.objectFit = "contain";
            if (player.tagName !== "VIDEO") {
              player.style.width = utils.playerWidth;
              player.width = player.clientWidth - utils.playerInnerWidth;
              player.height = player.clientHeight;
            }
          }
          else {
            player.style.objectFit = "fill";
            if (player.tagName !== "VIDEO") {
              player.style.width = utils.playerFillWidth;
            }
          }
        }
        else {
          preference.stretchList.splice(index, 1);
          if (player.style.objectFit == "contain" || player.style.objectFit == "") {
            player.style.objectFit = "fill";
            if (player.tagName !== "VIDEO") {
              player.style.width = utils.playerFillWidth;
            }
          }
          else {
            player.style.objectFit = "contain";
            if (player.tagName !== "VIDEO") {
              player.style.width = utils.playerWidth;
              player.width = player.clientWidth - utils.playerInnerWidth;
              player.height = player.clientHeight;
            }
          }
        }
      }
      else if (isClickEvent) {
        preference.stretchList = [config._id];
        if (player.style.objectFit == "contain" || player.style.objectFit == "") {
          player.style.objectFit = "fill";

        }
        else {
          player.style.objectFit = "contain";
          if (player.tagName !== "VIDEO") {
            player.style.width = utils.playerWidth;
            player.width = player.clientWidth - utils.playerInnerWidth;
            player.height = player.clientHeight;
          }
        }
      }
      else if (preference.stretchList) {
        var index = preference.stretchList.indexOf(config._id);
        if (index == -1) {
          player.style.objectFit = "fill";
          player.style.width = utils.playerFillWidth;
        } else {
          player.style.objectFit = "contain";
          if (player.tagName !== "VIDEO") {
            player.style.width = utils.playerWidth;
            player.width = player.clientWidth - utils.playerInnerWidth;
            player.height = player.clientHeight;
          }
        }
      }
      this.setState({ stretchProperty: player.style.objectFit });
      if (config.cameraType == '360') {
        this.setState({ stretchProperty: "contain" });
      }
    }
    if (player) {
      this.setState({ stretchProperty: player.style.objectFit });
      if (config.cameraType == '360') {
        this.setState({ stretchProperty: "contain" });
      }
    }
    if (player && player.style.objectFit == "" && config.cameraType != '360') {
      player.style.objectFit = "fill";
      if (player.tagName !== "VIDEO") {
        player.style.width = utils.playerFillWidth;
      }
    }
  }

  switchTOAICamera = () => {
    let { scope, videoIndex } = this.props;
    scope.onSelect("1x1", true);
    setTimeout(() => {
      scope.refs.SliderComp.scrollToSlide(videoIndex + 1);
    }, 1000);
  }

  nextPrevClick(isNext) {
    const { getNextPrevConfig, videoIndex } = this.props;
    const { videoConfig } = this.state;
    let nextIndex = videoIndex;
    if (!videoConfig.index) {
      nextIndex = videoIndex;
    }
    else {
      nextIndex = videoConfig.index;
    }
    const nextConfig = getNextPrevConfig(nextIndex, isNext);
    if (nextConfig) {
      this.setState({ videoConfig: nextConfig });
    }
  }

  resetStream() {
    if (Object.keys(this.state.videoConfig).length !== 0) {
      this.setState({ videoConfig: {} });
    }
  }

  hasRecentlyRestarted = (callback) => {
    const { config } = this.props;
    let storeId = config.storeId._id;
    this.props.dispatch(hasBoxRecentlyRestarted.request({ storeId: storeId }, null, "post", (res) => {
      if (res.hasBoxRecentlyRestarted) {
        swal({
          title: "Warning",
          text: res.message,
          icon: 'warning',
        });
      } else {
        callback();
      }
    }))
  }

  siteVideoControl = () => {
    var me = this;
    let currentURL = window.location.href.toLowerCase();
    let isHLS = currentURL.indexOf("ishls=true") > 0;
    let url = "/#/video/" + me.props.config._id + "?videoIndex=" + me.props.videoIndex;
    var params = [
      'height=' + window.screen.height,
      'width=' + window.screen.width,
      'fullscreen=yes' // only works in IE, but here for completeness
    ].join(',');
    window.open(url, 'Full Screen Video Camera - ' + this.props.config._id, params);
  }

  fullScreenRenderer() {

    const { isFull, isPlay, videoConfig, stretchProperty, startDuration, endDuration } = this.state;
    let { isBlank, config, hiddenController, dispatch, getPeopleCount, videoIndex, layout, createCustomVideoClip, muted, refreshing, sameWindow, scope } = this.props;

    let loggedUser = utils.getLoggedUser();
    // let isAdminRole = loggedUser && loggedUser.roleId._id == utils.adminRoleId || false;

    let roleId = loggedUser.roleId;

    let buttons = [];

    buttons = [
      { title: 'Full screen in separate window', icon: 'cursor fa fa-window-maximize', callBack: () => this.hasRecentlyRestarted(this.siteVideoControl) },
      { title: 'Playback', icon: 'cursor fa fa-clock-o', callBack: utils.isIOS() ? null : () => this.hasRecentlyRestarted(this.pausePlayVideo) },
      { title: 'Search', icon: 'cursor fa fa-search', callBack: () => this.hasRecentlyRestarted(this.onClickSearch) }
    ];
    if (config.cameraType != '360') {
      buttons.push(
        { title: 'Expand', icon: 'cursor fa fa-arrows-h', callBack: () => this.onExpand(true) }
      )
    }

    if (config.aiStreamRTSPURL) {
      buttons.push(
        {
          title: 'AI Stream URL', icon: 'cursor ai-icon', isImage: true, callBack: this.switchTOAICamera
        }
      )
    }

    if (roleId.isAdminRole) {
      buttons.push(
        { title: 'Info', icon: 'cursor fa fa-info-circle', callBack: this.onClickInfo })
    }

    if (isFull) {
      buttons.push(
        { title: 'Prev Camera', icon: 'fa fa-angle-left', callBack: this.prevClick },
        { title: 'Next Camera', icon: 'fa fa-angle-right', callBack: this.nextClick }
      );
    }
    let peopleInCount = null, peopleOutCount = null;
    if (getPeopleCount && getPeopleCount.data && getPeopleCount.data.records && getPeopleCount.data.records.length > 0) {
      let peopleData = getPeopleCount.data;
      peopleInCount = peopleData.todayInCount;
      peopleOutCount = peopleData.todayOutCount;
    }
    let recordingEnabled = config.storeId.type == "Rex" && config.recordingStreamId != null ? true : config.isRecordingStarted;
    //we have taken this for updating few things only in full screen mode, we are not going to update the Actual configration of Player
    let camConfig = videoConfig && videoConfig.config ? videoConfig.config : config;
    return <FullScreen
      enabled={utils.isFullScreen}
      onChange={full => this.onChangeFullScreen(full)}
      maintainAspectRatio={this.maintainAspectRatio}
      // <li title="Expand" onClick={() => siteVideoControl('aspectRatio')}><i className="cursor fa fa-arrows-h" aria-hidden="true"></i></li>
      buttons={buttons}
      is360={config.cameraType}
      draggable={!isBlank}
      hiddenController={hiddenController || false}
      cameraName={camConfig.name}
      storeName={camConfig.storeId.name}
      storeId={config.storeId._id}
      register={config.register}
      cameraId={config._id}
      isEnabledHeatmap={config.enableHeatMap}
      isHeatMapCamera={config.isHeatMapCamera}
      cameraRTSPUrl={config.cameraRTSPUrl}
      isPlay={isPlay}
      fullScreenVideoIndex={videoIndex}
      resetStream={this.resetStream}
      isRecordingStarted={recordingEnabled}
      liveVideScope={scope}
      isAIStream={this.state.isAIStream}
      prevClick={this.prevClick}
      nextClick={this.nextClick}
      getNextPrevConfig={this.props.getNextPrevConfig}
    >
      <center className="default-videoContainer-height">
        <div id={`VIDEO_CONTAINER${config._id}`} className="default-videoContainer-height">
          {
            <HLSPlayer
              muted={muted}
              isFull={isFull}
              width={'100%'}
              heigth={'100%'}
              autoplay={true}
              config={camConfig}
              layout={layout}
              dispatch={dispatch}
              videoIndex={videoIndex}
              peopleInCount={peopleInCount && peopleInCount}
              peopleOutCount={peopleOutCount && peopleOutCount}
              refreshing={refreshing}
              isSameWindow={sameWindow.isSame}
              stretchProperty={stretchProperty}
              liveVideScope={scope}
            />
          }
          {sameWindow.isSame &&
            <>
              <div className={"carousel-left fullscreenBtns"} onClick={this.prevClick}>
                <img src='assets/img/left-o.png' className="arrow-img" />
              </div>
              <div className={"carousel-right fullscreenBtns"} onClick={this.nextClick}>
                <img src='assets/img/right-o.png' className="arrow-img" />
              </div>
              <div className={"site-video-control"}>
                <ul>
                  <tr style={{ float: 'right' }}>
                    <li title='Full screen in separate window' className="live-fullscreen-btns" onClick={() => this.hasRecentlyRestarted(this.siteVideoControl)} ><i className={`fullscreen-icons cursor fa fa-window-maximize`} aria-hidden="true"></i></li>
                    <li title='Playback' className="live-fullscreen-btns" onClick={utils.isIOS() ? null : () => this.hasRecentlyRestarted(this.pausePlayVideo)} ><i className={`fullscreen-icons cursor fa fa-clock-o`} aria-hidden="true"></i></li>
                    <li title='Search' className="live-fullscreen-btns" onClick={() => this.hasRecentlyRestarted(this.onClipCreateFromPlayback)} ><i className={`fullscreen-icons cursor fa fa-search`} aria-hidden="true"></i></li>
                  </tr>
                </ul>
              </div>
            </>
          }
          {
            isFull && !config.isBlank && createCustomVideoClip.isFetching && <div className="overlayLiveVideo">
              <VideoReceipt config={config} />
            </div>
          }
          {camConfig.cameraType == "PTZ" && <PTZControls config={camConfig} dispatch={dispatch} />}
          {/* {<RecordingButton config={config} dispatch={dispatch} />} */}
        </div>
      </center>
    </FullScreen >
  }
  getTimelineModal() {
    const { isFull, videoConfig } = this.state;
    let { config, getPeopleCount, createCustomVideoClip, layout, dispatch, videoIndex, scope } = this.props;
    let camConfig = videoConfig && videoConfig.config ? videoConfig.config : config;
    let peopleInCount = null, peopleOutCount = null;
    if (getPeopleCount && getPeopleCount.data && getPeopleCount.data.records && getPeopleCount.data.records.length > 0) {
      let peopleData = getPeopleCount.data;
      peopleInCount = peopleData.todayInCount;
      peopleOutCount = peopleData.todayOutCount;
    }
    return <center className="default-videoContainer-height">
      <div id={`VIDEO_CONTAINER${config._id}`} className="default-videoContainer-height">
        {
          <HLSPlayer
            isFull={isFull}
            width={'100%'}
            heigth={'100%'}
            autoplay={true}
            videoIndex={videoIndex}
            config={camConfig}
            layout={layout}
            dispatch={dispatch}
            peopleInCount={peopleInCount && peopleInCount}
            peopleOutCount={peopleOutCount && peopleOutCount}
            isAIStream={this.state.isAIStream}
            liveVideScope={scope}
          />
        }
        {
          isFull && !config.isBlank && createCustomVideoClip.isFetching && <div className="overlayLiveVideo">
            <VideoReceipt config={config} />
          </div>
        }
        {camConfig.cameraType == 'PTZ' && <PTZControls config={camConfig} dispatch={dispatch} />}
        {/* {<RecordingButton config={config} dispatch={dispatch} />} */}
      </div>
    </center>
  }

  onCloseTimeline = () => {
    this.setState({ timelineModalOpen: false });
  }
  onClipCreateFromPlayback = () => {
    this.onClickSearch();
  }

  render() {
    const { isPlay, openDateRangePicker, isLoad, timelineModalOpen, videoConfig, startDuration, endDuration, isAIStream } = this.state;
    let { isBlank, config, getPeopleCount, createCustomVideoClip, layout, dispatch } = this.props;
    let isFetching = createCustomVideoClip.isFetching || isLoad;
    let camConfig = videoConfig.config || config;
    let peopleInCount = null, peopleOutCount = null;
    if (getPeopleCount && getPeopleCount.data && getPeopleCount.data.records && getPeopleCount.data.records.length > 0) {
      let peopleData = getPeopleCount.data;
      peopleInCount = peopleData.todayInCount;
      peopleOutCount = peopleData.todayOutCount;
    }
    if (config._id == "5e71f4949f07ac3634dab5da") {
      console.log('----------------------------' + Date.now())
    };

    return (
      <React.Fragment>
        <LoadingDialog isOpen={isFetching} />
        <div
          //id={`${config._id}`}
          className={`image-container video-player-container ${!isPlay && 'video-wrapper-fullview'} VIDEO_WRAPPER${config._id || ''}`}
          draggable={!isBlank}
        >
          {(isBlank && <p className="video-image-loading">Camera not Setup</p>) || this.fullScreenRenderer(isAIStream)}
          <Modal
            backdrop="static"
            isOpen={timelineModalOpen}
            className={"popup-sales video-modal video-popup-box"}

          >
            <ModalHeader className="widgetHeaderColor" toggle={this.onClickFab}>{camConfig && camConfig.storeId ? camConfig.storeId.name + " / " + camConfig.name : ""}</ModalHeader>
            <ModalBody className="reorderBody">
              {
                config.storeId && config.storeId._id && timelineModalOpen && <TimelinePlayer
                  onClickFab={this.onClickFab}
                  storeId={config.storeId._id}
                  connected={true}
                  camId={config._id}
                  mediaServerUrl={config.storeId.recordedMediaServerUrl}
                  mediaServerOutboundPort={config.storeId.recordedMediaServerOutboundPort}
                  isAntMedia={config.storeId.isRecordedMediaSameAsLive}
                  isHeatMapCamera={config.isHeatMapCamera}
                  recordingStreamId={config.recordingStreamId}
                  primaryCameraId={config.primaryCameraId}
                  isNvrOrRex={config.storeId.type == "Rex" || config.storeId.type == "Nvr"}
                  onClose={this.onCloseTimeline}
                  cameratype={config.cameraType}
                  config={config}
                />
              }
            </ModalBody>
          </Modal>
        </div>

        {!isBlank && <InfoModal config={config} isOpen={this.state.openInfoModal}
          onClose={this.closeInfoModal}
        />}

        <DateRangePicker
          timezone={config.storeId && config.storeId.timezoneValue || null}
          isOpen={openDateRangePicker}
          onClose={this.closeDateRangePicker}
          onSelect={this.openGridSearch}
          camData={config}
          startDuration={startDuration}
          endDuration={endDuration}
        />

        {
          !isBlank && this.state.showGridSearch && <GridSearch
            title={config ? `${config.storeId.name} - ${config.name}` : ''}
            time={this.gsDateRange}
            storeId={config && config.storeId && config.storeId._id || ''}
            camId={config && config._id || ''}
            onClose={this.closeGridSearch}
            onTimeLineSearch={this.openGridSearch}
            recordingStreamId={config.recordingStreamId}
            primaryCameraId={config.primaryCameraId}
            isNvrOrRex={config.storeId.type == "Rex" || config.storeId.type == "Nvr"}
          />
        }
      </React.Fragment>
    )
  }
}

function mapStateToProps(state, ownProps) {
  return {
    exitFullScreen: state.exitFullScreen,
    getPeopleCount: state.getPeopleCount,
    createCustomVideoClip: state.createCustomVideoClip,
    fullScreenVideo: state.fullScreenVideo,
    sameWindow: state.sameWindow
  };
}

var VideoPlayerModule = connect(mapStateToProps)(VideoPlayer);
export default VideoPlayerModule;

