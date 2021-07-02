import React, { PureComponent } from 'react';
import FullScreen from './FullScreen';
import { exitFullScreen, fullScreenVideo, liveCamFullscreenStatus, timelinePlayer, storeChange } from './../redux/actions';
import { getPeopleCount, createCustomVideoClip, gridSearchImage, cameraData, preferenceData, storesData } from './../redux/actions/httpRequest';
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
import InfoModal from '../component/InfoModal';
import LoadingDialog from './LoadingDialog';
import { Modal, ModalBody, ModalHeader } from 'reactstrap';
import md5 from 'md5';
import consts from '../Util/consts';
import WebRTCPlayer from './Player/WebRTCPlayer';
import io from 'socket.io-client';

class HLSPlayer extends PureComponent {
  constructor(props) {
    super(props);
    this.state = { checked: false, heatMapLoadError: false };
    this.onEnded = this.onEnded.bind(this);
    this.interval = null;
    this.isUnmounted = false;
    this.dewarpVideo = null;

    this.clipTimeRange = null;
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
      dispatch(getPeopleCount.request(options));
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
    }, 1200);
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
        else {
          streamURL.primaryStream = config.flv.lowStreamURL;
          streamURL.secondaryStream = config.flv.highStreamURL;
        }
        // if (isAIStream) {
        //   streamURL = config.flv.aIStreamURL;
        // }
        break;
      case "WebRTC":
        if (siteConfig == consts.StreamConfig.LowOnly || siteConfig == consts.StreamConfig.OnDemand) {
          streamURL.primaryStream = { streamId: config.streamLow, streamToken: config.streamToken.low };
          streamURL.secondaryStream = { streamId: config.streamHigh, streamToken: config.streamToken.high };
        }
        else if (siteConfig == consts.StreamConfig.HighOnly) {
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
    const { config, peopleInCount, peopleOutCount, isFull } = this.props;
    const { checked, heatMapLoadError, isOnDemandPlay } = this.state;

    if (config.isBlank) {
      return null;
    }

    let videoConfigType = config.storeId.liveVideoConfig ? config.storeId.liveVideoConfig : 'WebRTC';
    // let otherStreamURL = videoConfigType == 'FLV' || videoConfigType == "NodeMedia" ? config.flv.lowStreamURL : videoConfigType == "HLS" ? config.hls.lowStreamURL : "";
    let streamURLs = this.getStreamURL(videoConfigType);
    let isSingleLayout = true;
    // const token = config.streamToken && config.streamToken.low;

    return (
      <div>
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
                  checked ? <WebRTCPlayer onStateChange={this.onVideoStateChange} isSingleLayout={isSingleLayout} secondaryStream={streamURLs.secondaryStream} isFullScreen={true} token={streamURLs.primaryStream.streamToken} config={config} key={checked} is360={true} componentKey={streamURLs.primaryStream.streamId} isDewarpEnable={checked} isOnDemandPlay={isOnDemandPlay} /> :
                    <WebRTCPlayer onStateChange={this.onVideoStateChange} isSingleLayout={isSingleLayout} secondaryStream={streamURLs.secondaryStream} isFullScreen={true} token={streamURLs.primaryStream.streamToken} config={config} key={checked} componentKey={streamURLs.primaryStream.streamId} isDewarpEnable={checked} isOnDemandPlay={isOnDemandPlay} />
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
                    className="switch-button video-switch-toggle"
                  />
                  <div className={config.cameraBrand == "Hanwha" ? "change-three-layout" : ''}>
                    {checked ? <WebRTCPlayer onStateChange={this.onVideoStateChange} url={streamURLs.primaryStream} isSingleLayout={isSingleLayout} secondaryStream={streamURLs.secondaryStream} isFullScreen={true} token={streamURLs.primaryStream.streamToken} config={config} key={checked} is360={true} componentKey={streamURLs.primaryStream.streamId} isDewarpEnable={checked} isOnDemandPlay={isOnDemandPlay} /> :
                      <WebRTCPlayer onStateChange={this.onVideoStateChange} isSingleLayout={isSingleLayout} secondaryStream={streamURLs.secondaryStream} url={streamURLs.primaryStream} isFullScreen={true} token={streamURLs.primaryStream.streamToken} config={config} key={checked} componentKey={streamURLs.primaryStream.streamId} isDewarpEnable={checked} isOnDemandPlay={isOnDemandPlay} />}
                  </div>
                </div>
                :
                <WebRTCPlayer isFullScreen={true} token={streamURLs.primaryStream.streamToken} config={config} url={streamURLs.primaryStream} isSingleLayout={isSingleLayout} secondaryStream={streamURLs.secondaryStream} componentKey={streamURLs.primaryStream.streamId} />
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
      searchResult: [],
      isLoad: false,
      isExpand: false,
      videoConfig: {},
      timelineModalOpen: false,
      preference: {},
      openFullScreenInfoModal: false,
      filterData: [],
      cameraData: [],
      startDuration: moment().format('MM/DD/YYYY hh:mm:ss a'),
      endDuration: moment().format('MM/DD/YYYY hh:mm:ss a')
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

    this.gridSearchData = {
      uid: null,
      equalTimeSplit: null,
      time: {
        start: null,
        end: null
      }
    }

    this.gsDateRange = null;
  }

  pausePlayVideo = (action) => {
    const { isPlay, isFull } = this.state;
    const { config } = this.props;
    this.props.dispatch(liveCamFullscreenStatus({ [config._id]: { isFull: utils.isFullScreen } }));
    this.setState({ timelineModalOpen: true }, () => {
      this.onActionVideo({ isPlay: this.state.isPlay, storeId: config.storeId._id, camId: config._id, isHeatMapCamera: config.isHeatMapCamera });
    });
  }
  exit = () => {
    this.props.dispatch(fullScreenVideo(null));
    this.props.dispatch(exitFullScreen(false));
  }

  getSortedCameraData = (configuration, cameraData) => {
    if (!cameraData) {
      cameraData = this.state.cameraData;
    }
    let returnIndex = 0;

    if (Array.isArray(cameraData) && cameraData.length > 0 && configuration && configuration.length > 0) {
      let sortData = cameraData.sort(function (a, b) {
        let aIndex = configuration.findIndex(config => {
          return config.id == a._id;
        });
        let bIndex = configuration.findIndex(config => {
          return config.id == b._id;
        });

        if (aIndex != -1 && bIndex != -1) {
          if (aIndex < bIndex) {
            returnIndex = -1;
          }
          if (aIndex > bIndex) {
            returnIndex = 1;
          }
        }
        else {
          if (bIndex != -1) {
            returnIndex = 1;
          } else if (aIndex != -1) {
            returnIndex = -1;
          } else {
            returnIndex = 0;
          }
        }
        return returnIndex;
      });
      cameraData = sortData;
    }
    return cameraData;
  }

  componentWillReceiveProps(nextProps) {
    let { captureStart, isFetching } = this.state;
    let data;
    let error;
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
    isFetching = nextProps.preferenceData.isFetching;
    data = nextProps.preferenceData.data;
    error = nextProps.preferenceData.error;
    if (!isFetching) {
      if (error || data && data.error) {
        swal({ title: "Error", text: error || data.error, icon: "error", });
        return;
      }
      if (nextProps.preferenceData.data && nextProps.preferenceData.data.message) {
        swal({
          title: utils.getAlertBoxTitle(nextProps.preferenceData.data.success),
          text: nextProps.preferenceData.data.message,
          icon: utils.getAlertBoxIcon(nextProps.preferenceData.data.success)
        });
        this.loadUserPreference();
        return;
      }
      let preferenceInfo = data.data;

      if (preferenceInfo) {
        let { configuration, stretchList, camLayoutCal } = preferenceInfo;
        let sortedCameraData = this.getSortedCameraData(configuration);
        this.setState({
          cameraData: sortedCameraData,
          cameraDataList: sortedCameraData,
          preference: preferenceInfo,
          configuration: configuration,
          stretchList: stretchList || []
        });
      }
    }
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
          let finalCamList = this.getAllCameraData(data);
          this.setState({
            cameraDataList: finalCamList
          });
        }
      }
    }
  }

  getAllCameraData = (cameraData) => {
    let { preferenceData } = this.props;
            let selectedStore = JSON.parse(localStorage.getItem("SelectedStore"));
            let selectedStoreCams = [];
            if (selectedStore.length > 0) {
              for (var i = 0; i < selectedStore.length; i++) {
                if (selectedStore[i].value) {
          let currentSelectedStoreCams = cameraData.data.filter(function (selectedCam) { return selectedCam.storeId._id == selectedStore[i].value });
                  if (currentSelectedStoreCams.length > 0) {
                    selectedStoreCams = selectedStoreCams.concat(currentSelectedStoreCams);
                  }
                }
              }
            }
    let finalCamList = selectedStoreCams && selectedStoreCams.length > 0 ? selectedStoreCams : cameraData.data;
    if (preferenceData && preferenceData.data && preferenceData.data.data && preferenceData.data.data.configuration) {
      finalCamList = this.getSortedCameraData(preferenceData.data.data.configuration, finalCamList);
          }
    return finalCamList;
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
    const { dispatch } = this.props;
    this.setState({ isPlay: true, timelineModalOpen: false }, () => {
      if (camId) {
        let wrapper = document.getElementById(`VIDEO_CONTAINER${camId}`);
        if (wrapper) {
          //wrapper = wrapper[0];
          wrapper.style.display = "block";
        }
      }
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
  formatDate(date) {
    return moment(date).format('MM/DD/YYYY hh:mm:ss a')
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
  onConnect = (evt) => {
    const { camId } = this.props;
    const { startDuration, endDuration } = this.state;
    this.requestDuration({ startDuration: this.formatDate(startDuration), endDuration: this.formatDate(endDuration) });
  }
  onDisconnect = (evt) => {
    console.log(`GridSearch Socket Disconnect ${this.clientId}`);
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
    this.setState({ openFullScreenInfoModal: true });
  }

  fullScreenCloseInfoModal = () => {
    this.setState({ openFullScreenInfoModal: false });
  }

  closeDateRangePicker = () => {
    this.setState({ openDateRangePicker: false });
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
          this.props.dispatch(createCustomVideoClip.request({
            startTime: moment(start).format('YYYY-MM-DD hh:mm:ss A'),
            endTime: moment(end).format('YYYY-MM-DD hh:mm:ss A'),
            utcOffSet: moment().utcOffset(),
            storeId: storeId._id,
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

  onSelectFrmae = (isProcessed, start, end) => {
    if (!isProcessed) {
      return;
    }
    const { uid } = this.gridSearchData;
    const { _id, storeId } = this.props.config;
    this.gridSearchData.time.start = start;
    this.gridSearchData.time.end = end;
    const options = {
      action: 'generate',
      start: moment(start).format('MM/DD/YYYY hh:mm:ss a'),
      end: moment(end).format('MM/DD/YYYY hh:mm:ss a'),
      clientId: storeId._id,
      camId: _id,
      frameLimit: 9,
      uid: uid
    }
    this.setState({ isLoad: true, showGridSearch: false });
    this.props.dispatch(gridSearchImage.request(options, null, "GET", (data) => {
      this.setState({ isLoad: false, showGridSearch: true });
      if (data && data.success) {
        this.setState({ showGridSearch: true, searchResult: data.data, openDateRangePicker: false });
        this.gridSearchData.equalTimeSplit = data.equalTimeSplit;
        this.gridSearchData.uid = data.uid;
      } else {
        swal({
          title: 'Error',
          text: data.message,
          icon: 'error',
        });
      }
    }));
  }
  loadUserPreference = () => {
    this.props.dispatch(preferenceData.request({ action: 'load' }));
  }
  componentDidMount() {
    this.loadUserPreference();
    if (this.props.match && this.props.match.params && this.props.match.params.id !== "0") {
      this.props.dispatch(cameraData.request({ action: 'load', id: this.props.match.params.id, populate: 'storeId' }, this.props.match.params.id));
      this.setState({ isFull: true });
    }
  }
  updateCamLayout() {
    const me = this;
    let { config } = me.props;
    if (config != null) {
      let { preference } = me.state;
      if (preference && preference.stretchList && preference.stretchList.includes(config._id)) {
        me.onExpand(false);
      }
    }
  }

  onExpand = (isClickEvent) => {
    const { isExpand } = this.state;
    const { config } = this.props
    let player = document.getElementById(`react-flv-${config._id}`);
    if (player) {
      player.style.objectFit = !isClickEvent ? "fill" : isExpand ? "contain" : "fill";
      this.setState({ isExpand: !isClickEvent || !isExpand });
      if (isClickEvent) {
        let { preference } = this.state;
        if (preference.stretchList) {
          if (isExpand) {
            preference.stretchList = preference.stretchList.filter(id => id !== config._id);
          }
          else {
            preference.stretchList.push(config._id);
          }
        }
        else {
          preference.stretchList = [config._id];
        }
      }
    }
  }
  nextPrevClick(isNext) {
    let { cameraData, storesData } = this.props;
    let { videoConfig, cameraDataList } = this.state;
    if (cameraData) {
      if (cameraDataList.length <= 0 && storesData && storesData.data && storesData.data.data && storesData.data.data.length > 0) {
        cameraDataList = this.getAllCameraData(storesData.data);
      }
      if (cameraDataList.length > 0) {
      var currentCameraId = videoConfig && videoConfig.config && videoConfig.config._id ? videoConfig.config._id : cameraData.data._id
      let videoIndexParams = cameraDataList.findIndex(function (cam) { return cam._id == currentCameraId });
        let nextConfig = this.getNextPrevConfig(videoIndexParams, isNext);
      if (nextConfig) {
          this.setState({ videoConfig: nextConfig });
      }
    }
    }

  }

  resetStream() {
    if (Object.keys(this.state.videoConfig).length !== 0) {
      this.setState({ videoConfig: {} });
    }
  }

  fullScreenRenderer() {
  
    const { isFull, isPlay, videoConfig } = this.state;
    let { isBlank, config, hiddenController, dispatch, getPeopleCount, videoIndex, layout, createCustomVideoClip } = this.props;

    let buttons = [
      { title: isPlay ? 'Playback' : 'Playback', icon: isPlay ? 'cursor fa fa-clock-o' : 'cursor fa fa-clock-o', callBack: utils.isIOS() ? null : this.pausePlayVideo },
      { title: 'Search', icon: 'fa fa-search', callBack: this.onClickSearch }
    ];
    let loggedUser = utils.getLoggedUser();
    let isAdminRole = loggedUser && loggedUser.roleId._id == utils.adminRoleId || false;

    if (isAdminRole) {
      buttons.push({ title: 'Info', icon: 'cursor fa fa-info-circle ', callBack: this.onClickInfo });
    }
    let peopleInCount = null, peopleOutCount = null;
    if (getPeopleCount && getPeopleCount.data && getPeopleCount.data.records && getPeopleCount.data.records.length > 0) {
      let peopleData = getPeopleCount.data;
      peopleInCount = peopleData.todayInCount;
      peopleOutCount = peopleData.todayOutCount;
    }
    //we have taken this for updating few things only in full screen mode, we are not going to update the Actual configration of Player
    let camConfig = videoConfig && videoConfig.config ? videoConfig.config : config;
    return <FullScreen
      enabled={utils.isFullScreen}
      disableFullScreen={true}
      is360={camConfig.cameraType}
      onChange={full => this.onChangeFullScreen(full)}
      maintainAspectRatio={this.maintainAspectRatio}
      // <li title="Expand" onClick={() => siteVideoControl('aspectRatio')}><i className="cursor fa fa-arrows-h" aria-hidden="true"></i></li>
      buttons={buttons}
      draggable={!isBlank}
      hiddenController={hiddenController || false}
      cameraName={camConfig.name}
      storeName={camConfig.storeId.name}
      storeId={camConfig.storeId._id}
      register={camConfig.register}
      cameraId={camConfig._id}
      isEnabledHeatmap={camConfig.enableHeatMap}
      isHeatMapCamera={camConfig.isHeatMapCamera}
      cameraRTSPUrl={camConfig.cameraRTSPUrl}
      isPlay={isPlay}
      fullScreenVideoIndex={videoIndex}
      resetStream={this.resetStream}
      prevClick={this.prevClick}
      nextClick={this.nextClick}
    //getNextPrevConfig={this.getNextPrevConfig}
    // fromScreenAnamika={'fromScreenAnamika'}
    >
      <center className="default-videoContainer-height">
        <div id={`VIDEO_CONTAINER${config._id}`} className="default-videoContainer-height">
          {
            <HLSPlayer
              isFull={isFull}
              width={'100%'}
              heigth={'100%'}
              autoplay={true}
              config={camConfig}
              layout={layout}
              dispatch={dispatch}
              peopleInCount={peopleInCount && peopleInCount}
              peopleOutCount={peopleOutCount && peopleOutCount}
            />
          }
          {
            // isFull && !config.isBlank && <div className="overlayLiveVideo">
            //   <VideoReceipt config={config} forLiveVideo={true} />
            // </div>
          }
          {camConfig.cameraType == 'PTZ' && <PTZControls config={camConfig} dispatch={dispatch} />}
          {/* {<RecordingButton config={config} dispatch={dispatch} />} */}
        </div>
      </center>
    </FullScreen>
  }
  getTimelineModal() {
    const { isFull, videoConfig } = this.state;
    let { config, getPeopleCount, createCustomVideoClip, layout, dispatch } = this.props;
    let camConfig = videoConfig.config || config;
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
            config={camConfig}
            layout={layout}
            dispatch={dispatch}
            peopleInCount={peopleInCount && peopleInCount}
            peopleOutCount={peopleOutCount && peopleOutCount}
          />
        }
        {
          // isFull && !config.isBlank && createCustomVideoClip.isFetching && <div className="overlayLiveVideo">
          //   <VideoReceipt config={config} />
          // </div>
        }
        {config.cameraType == "PTZ" && <PTZControls config={config} dispatch={dispatch} />}
        {/* {<RecordingButton config={config} dispatch={dispatch} />} */}
      </div>
    </center>
  }
  getNextPrevConfig = (currentIndex, isNext) => {
    let toReturn = null;
    let { storesData } = this.props;
    let { cameraDataList } = this.state;
    if (cameraDataList.length <= 0 && storesData && storesData.data && storesData.data.data && storesData.data.data.length > 0) {
      cameraDataList = this.getAllCameraData(storesData.data);
    }
    const camList = utils.getClone(cameraDataList);
    if (camList.length === 0) {
      return toReturn;
    }
    const len = camList.length - 1;
    let newIndex = isNext ? currentIndex + 1 : currentIndex - 1;
    //In case of first and last config we need rotation
    newIndex = newIndex > len ? 0 : newIndex < 0 ? len : newIndex;
    return { config: camList[newIndex], index: newIndex };
  }
  onActionVideo(data) {
    let wrapper = document.getElementById(`VIDEO_CONTAINER${data.camId}`);
    if (wrapper) {
      wrapper.style.display = data.isPlay ? "block" : "none";
    }
    this.props.dispatch(timelinePlayer({
      isPlay: true,
      camId: data.camId,
      storeId: data.storeId,
      connected: data.connected,
      isHeatMapCamera: data.isHeatMapCamera
    }));
  }

  onCloseTimeline = () => {
    this.setState({ timelineModalOpen: false });
  }

  render() {
    const { isPlay, openDateRangePicker, isLoad, timelineModalOpen, startDuration, endDuration } = this.state;
    let { isBlank, config, getPeopleCount, createCustomVideoClip, layout, dispatch } = this.props;
    let isFetching = createCustomVideoClip.isFetching || isLoad;

    let peopleInCount = null, peopleOutCount = null;
    if (getPeopleCount && getPeopleCount.data && getPeopleCount.data.records && getPeopleCount.data.records.length > 0) {
      let peopleData = getPeopleCount.data;
      peopleInCount = peopleData.todayInCount;
      peopleOutCount = peopleData.todayOutCount;
    }

    return (
      <React.Fragment>
        <LoadingDialog isOpen={isFetching} />

        {config && <><div className={`image-container video-player-container ${!isPlay && 'video-wrapper-fullview'} VIDEO_WRAPPER${config._id || ''}`} draggable={!isBlank}>
          {(isBlank && <p className="video-image-loading">Camera not Setup</p>) || this.fullScreenRenderer()}
          <Modal
            backdrop="static"
            isOpen={timelineModalOpen}
            className={"popup-sales video-modal video-popup-box"}

          >
            <ModalHeader className="widgetHeaderColor" toggle={this.onClickFab}></ModalHeader>
            <ModalBody className="reorderBody">
              {config.storeId && config.storeId._id && timelineModalOpen && <TimelinePlayer
                onClickFab={this.onClickFab}
                onAction={() => { }}
                storeId={config.storeId._id}
                connected={true}
                camId={config._id}
                config={config}


                mediaServerUrl={config.storeId.mediaServerUrl}
                mediaServerOutboundPort={config.storeId.mediaServerOutboundPort}
                isAntMedia={config.storeId.isAntMedia}
                isHeatMapCamera={config.isHeatMapCamera}
                recordingStreamId={config.recordingStreamId}
                primaryCameraId={config.primaryCameraId}
                isNvrOrRex={config.storeId.type == "Rex" || config.storeId.type == "Nvr"}
                onClose={this.onCloseTimeline}
              />}
            </ModalBody>
          </Modal>
        </div>

          <InfoModal data={this.props} isOpen={this.state.openFullScreenInfoModal}
            onClose={this.fullScreenCloseInfoModal}
          />

          <DateRangePicker
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
        </>
        }
      </React.Fragment>
    )
  }
}

function mapStateToProps(state, ownProps) {
  const { cameraData } = state;
  const { data } = cameraData;
  return {
    cameraData: state.cameraData,
    storesData: state.storesData,
    config: data,
    exitFullScreen: state.exitFullScreen,
    getPeopleCount: state.getPeopleCount,
    createCustomVideoClip: state.createCustomVideoClip,
    fullScreenVideo: state.fullScreenVideo,
    isBlank: !data || !data._id || data.isBlank,
    layout: null,
    preferenceData: state.preferenceData
  };
}

var VideoPlayerModule = connect(mapStateToProps)(VideoPlayer);
export default VideoPlayerModule;
