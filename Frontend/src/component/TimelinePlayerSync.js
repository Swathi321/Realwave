import React from 'react';
import { connect } from 'react-redux';
import moment from 'moment';
import consts from '../Util/consts';
import { getEventFeedTimeline, getReceipt } from '../redux/actions/httpRequest';
import 'react-tagsinput/react-tagsinput.css';
import PlaybackReceipt from './PlaybackReceipt';
import util from '../Util/Util';
import './../scss/timeline.scss';
import { timelinePlayer, selectedCameraData as updateCameraData, syncplaybackState as syncplaybackStateAction } from '../redux/actions';
import FLVPlayer from './FLVPlayer';
import AntMediaPlayer from './Player/AntMediaPlayer';
import swal from 'sweetalert';
let properties = ['transform', 'WebkitTransform', 'MozTransform', 'msTransform', 'OTransform'];
let prop = properties[0];
const show_timeline = { display: 'block' };
const hide_timeline = { display: 'none' };
const funcList = ["doubleClickHandler", "handleVideoPlayPause"];

class AntMediaPlayerWrapper extends React.PureComponent {
  render() {
    const { camId, storeId, videoToken, mediaInfo, streamId, isPublished, onToggle, onTimeUpdate, onLoadedMetadata } = this.props;
    console.log("IsPublished: " + isPublished)
    return (
      isPublished ?
        <AntMediaPlayer
          ref="playerVideo"
          camId={camId}
          key={camId}
          storeId={storeId}
          token={videoToken}
          mediaInfo={mediaInfo}
          componentKey={streamId}
          isTimeline={true}
          onTimeUpdate={onTimeUpdate}
          onToggle={onToggle}
          onLoadedMetadata={onLoadedMetadata}
        /> : <video id={`TIMELINE_PLAYER_${camId}`} onLoadedMetadata={onLoadedMetadata} />
    )
  }
}

class TimelinePlayerSyncjs extends React.PureComponent {
  constructor(props) {
    super(props);
    let { storeId, camId } = this.props;
    this.state = {
      EventData: null,
      bookmarkModal: false,
      form: {},
      error: {},
      videoURL: null,
      clickTime: null,
      startMinute: 0,
      videoHeight: 60,
      receipt: null,
      helpText: false,
      eventStart: null,
      eventEnd: null,
      fetchEvent: false,
      showSpinner: true,
      tlSelectedDate: new Date(),
      heatMapLoadError: false,
      zoom: 1,
      rotate: 0,
      left: 0,
      up: 0,
      right: 0,
      down: 0,
      requestId: null,
      published: false,
      startedTime: this.props.initialDateTime,
      videoToken: null,
      streamId: null,
      timeZoneOffsetValue: null,
      currentServerTime: null,
      isHovering: true,
      playbackSpeed: null,
      pbPopupOpen: false,
      showhideBookMark: false
    };
    util.bindContext(funcList, this);
    this.visOptions = Object.assign({ // create time line config
      stack: false,
      groupOrder: 'content',
      orientation: 'bottom',
      autoResize: false,
      tooltip: {
        followMouse: true,
        overflowMethod: 'flip'
      },
    }, this.props.defaultOptions);
    this.itemsCheckDuplicate = [];
    this.timeline = { camId: null }
    this.timelineBookMark = null;
    this.isPlay = true;
    this.groups = new window.vis.DataSet();
    this.groups.add({ id: 0, content: "" }) // Bookmark Panel
    this.groups.add({ id: 1, content: "" }) // Video panel

    this.groupsBookMark = new window.vis.DataSet();// for multiple bookmark
    this.groupsBookMark.add({ id: 0, content: "" }) // Bookmark Panel

    this.onTimelineModalClose = this.onTimelineModalClose.bind(this);
    this.handleMouseMove = this.handleMouseMove.bind(this);
    this.handleMouseLeave = this.handleMouseLeave.bind(this);
    this.visDataSet = new window.vis.DataSet(this.visOptions); // Get and Set TimeLine Data Set Object
    this.filters = [{ "value": storeId, "property": "storeId", "type": "object" }, { "value": camId, "property": "camId", "type": "object" }];
    this.alreadyRequestTimeout = null;
    this.videoPlayer = null;
  }

  componentDidMount() {
    let me = this;
    me.visDataSet.add(this.props.videoData);
    setTimeout(() => {
      me.timeline[camId].focus();
      //me.timeline.fit();
      me.timeline[camId].addCustomTime(this.props.initialDateTime, 't1');
      me.timeline[camId].setCustomTimeMarker(moment(this.props.initialDateTime).format('LTS'), 't1');
      me.timeline[camId].setWindow(moment(this.props.initialDateTime).add(-24, "hour").toDate(), moment(this.props.initialDateTime).toDate());
    }, 1000);
    this.handleMouseMove();
    const { camId, isMultiple } = me.props;
    const { isHovering, showhideBookMark } = me.state;
    let container = document.getElementById(`timeline-area-${camId}`); // Get timeline Show div id
    // Create a Timeline Area
    me.timeline[camId] = new window.vis.Timeline(container, me.visDataSet, me.groups, me.visOptions); // Set timeline view

    me.timelineTimeChangeTimeout = null;
    me.timeline[camId].on("timechange", (props) => {
      me.dragInProgress = true;
      clearTimeout(me.timelineTimeChangeTimeout);
      me.timeline[camId].setCustomTimeMarker(moment(props.time).format('LTS'), 't1');
      me.timelineTimeChangeTimeout = setTimeout(() => {
        me.dragInProgress = false;
        if (me.validateSelectedTimelineRange(props, 'Drag')) {
          me.isDragVaild = true;
          let { dispatch, isMultiple, camId } = me.props;
          dispatch(updateCameraData({ seekProp: { seekCamId: camId, ...props } }));
          console.log(`timeline time change: ${props.time}`);
          me.clickHandler(props);
        } else {
          me.isDragVaild = false;
        }
      }, 1000);
    });


    me.timeline[camId].on("click", (props) => {
      if (me.dragInProgress) {
        return;
      }
      // Double click was not working properly
      // Timeout added to handle Doubleclick directly and not call Click first.
      // Bookmark functionality was not working without this.
      console.log(`timeline Click: ${props.time}`);
      if (this.validateSelectedTimelineRange(props, 'Click')) {
        clearTimeout(me.timelineTimeChangeTimeout);
        //me.timeline.setCustomTimeMarker(moment(props.time).format('LTS'), 't1');
        let startTime = moment(props.time);
        try {
          if (me.timeline[camId] != null && me.timeline[camId].getCustomTime("t1")) {
            me.timeline[camId].setCustomTime(startTime, 't1');
            me.timeline[camId].setCustomTimeMarker(startTime.format('LTS'), 't1');
            me.timeline[camId].moveTo(startTime);
          }
        }
        catch (err) {

        }
        me.timelineTimeChangeTimeout = setTimeout(() => {
          let { dispatch, isMultiple, camId } = me.props;
          dispatch(updateCameraData({ seekProp: { seekCamId: camId, ...props } }));
          console.log(`timeline time change: ${props.time}`);
          me.clickHandler(props);
        }, 1000);
      }
    });
    // onDoubleClick on timeline
    me.timeline[camId].on('doubleClick', me.doubleClickHandler);
    if (me.props.isHeatMapCamera) {
      me.timeline[camId].on('timechanged', function (properties) {
        me.setState({ tlSelectedDate: moment(properties.time).format('LLLL') });
        console.log("Time Change - " + me.state.tlSelectedDate);
      }.bind(me));
    }

    // window height for video player show area
    let windowHeight = document.body.clientHeight;
    let extraSpaceHeight = document.getElementsByClassName("layout-hide")[0] ? document.getElementsByClassName("layout-hide")[0].clientHeight + 40 || 0 : 100;
    //let timelineHeight = document.getElementsByClassName("vis-timeline")[0].clientHeight || 0;

    let videoHeight = windowHeight - extraSpaceHeight;
    me.setState({ videoHeight: videoHeight });

    // range event
    me.timeline[camId].on('rangechanged', function (properties) {
      if (!me.state.fetchEvent) {
        clearTimeout(me.alreadyRequestTimeout);
        me.alreadyRequestTimeout = setTimeout(() => {
          me.setState({ eventStart: properties.start, eventEnd: properties.end, fetchEvent: true });
          me.props.dispatch(getEventFeedTimeline.request({ action: 'list', filter: me.filters, startDate: properties.start, endData: properties.end }));
        }, 1000);
      }
    });


    if (me.videoPlayer) {
      for (let i = 0, j = properties.length; i < j; i++) {
        if (typeof me.videoPlayer.style[properties[i]] !== 'undefined') {
          prop = properties[i];
          break;
        }
      }
    }

  }
  componentWillReceiveProps(nextProps) {
    let me = this, { onAction, selectedCameraData, videoData, isMultiple } = this.props;
    let camProp = selectedCameraData.seekProp;
    if (camProp && camProp.seekCamId !== nextProps.camId) {
      let startTime = moment(camProp.time);
      try {
        if (me.timeline[nextProps.camId] != null && me.timeline[nextProps.camId].getCustomTime("t1")) {
          me.timeline[nextProps.camId].setCustomTime(startTime, 't1');
          me.timeline[nextProps.camId].setCustomTimeMarker(startTime.format('LTS'), 't1');
        }
      } catch (err) { }
      if (!me.isHovering) {
        me.timeline[nextProps.camId].moveTo(startTime);
      }
    }

    if (this.props.syncplaybackState != nextProps.syncplaybackState && isMultiple) {
      const { isPaused } = nextProps.syncplaybackState;
      try {
        if (this.videoPlayer) {
          this.videoPlayer[isPaused ? 'pause' : 'play']();
          let pauseButtons = document.getElementsByClassName("livePlayButton");

          for (let idx = 0; idx < pauseButtons.length; idx++) {
            let pauseButton = pauseButtons[idx];
            if (this.videoPlayer.paused) {
              pauseButton.style.visibility = 'visible';
            } else {
              pauseButton.style.visibility = 'hidden';
            }
          }

        }
      } catch (ex) {
        console.error(ex);
      }
    }
  }

  validateSelectedTimelineRange(props, actionName) {
    let { item, time } = props;
    let { videoData } = this.props;
    if (videoData.length !== 0) {
      let startAvailable = videoData[0].start;
      let endAvailable = videoData[videoData.length - 1].end;
      if (startAvailable > time || endAvailable < time) {
        swal(`${actionName} not permitted`, `You can ${actionName} between ${moment(startAvailable).format('YYYY/MM/DD hh:mm:ss A')} and ${moment(endAvailable).format('YYYY/MM/DD hh:mm:ss A')}`, 'warning');
        return false;
      }
    }
    return true;
  }
  validateSubmitedTimelineRange(time, actionName) {
    let { videoData } = this.props;
    if (videoData.length !== 0) {
      let startAvailable = videoData[0].start;
      let endAvailable = videoData[videoData.length - 1].end;
      if (startAvailable > new Date(time) || endAvailable < new Date(time)) {
        let errorData = { ...this.state.error };
        errorData.dateTimeLargeMessage = `You can ${actionName} between ${moment(startAvailable).format('YYYY/MM/DD hh:mm:ss A')} and ${moment(endAvailable).format('YYYY/MM/DD hh:mm:ss A')}`;
        this.setState({ error: errorData });
        return false;
      }
    }
    return true;
  }
  clickHandler(props) {
    console.log(`-------------------------Call clickHandler----------------------------- ${moment().format('YYYY-MM-DD hh:mm:ss A')}`);
    let { item, time } = props;
    let me = this;
    let itemData = null;
    let itemIndex = -1;
    let selectedTime;
    let startTime;
    let result = [];
    me.setState({ receipt: null });
    let data = me.visDataSet._data;
    data.forEach(value => {
      result.push(value);
    });
    // Get video data from event and bookmark
    if (item > -1 && item != null) {
      itemData = me.visDataSet.get(item);
      result = result.sort((objFirst, objSecond) => new Date(objFirst.start) - new Date(objSecond.start));
      if (itemData.group !== 1) {
        itemIndex = result.findIndex(data => {
          selectedTime = moment(itemData.start).format('YYYY/MM/DD hh:mm:ss A');
          startTime = moment(data.start).format('YYYY/MM/DD hh:mm:ss A');
          return moment(selectedTime).isBetween(moment(startTime), moment(data.endTime)) && data.group == 1
        })
        if (itemIndex > -1) {
          itemData = result[itemIndex];
        }
      }
    } else {
      result = result.sort((objFirst, objSecond) => new Date(objFirst.start) - new Date(objSecond.start));
      itemIndex = result.findIndex(data => {
        selectedTime = moment(time).format('YYYY/MM/DD hh:mm:ss A');
        startTime = moment(data.start).format('YYYY/MM/DD hh:mm:ss A');
        return moment(selectedTime).isBetween(moment(startTime), moment(data.endTime)) && data.group == 1
      })
      if (itemIndex > -1) {
        itemData = result[itemIndex];
      }
    }

    if (itemData && itemData.EventType && itemData.EventType != "Face") { // show receipt
      this.props.dispatch(getReceipt.request({ InvoiceId: itemData.InvoiceId }));
    }

    this.setState({ published: false, startedTime: time }, () => {
      me.props.requestPlayback({ initialDateTime: moment(time).format("YYYY/MM/DD hh:mm:ss A") });
    });
  }

  /**
   * close bookmark modal
   */



  /**
   * double Click Handler
   */
  doubleClickHandler(props) {
    let { item, time, camId } = props;
    let form = {};
    let itemData = item > -1 && item != null ? this.visDataSet.get(item) : item;
    if (this.validateSelectedTimelineRange(props, 'Click')) {
      let tlContainer = this.refs.timeline_container + '-' + camId;
      if (tlContainer.offsetWidth === window.screen.availWidth) {
        this.fullScreenToggle()
      }
      if (itemData) {
        form = itemData.bookmark || {}
        if (!Object.keys(form).includes('tags')) {
          form.tags = [];
        }
        time = new Date(itemData.start);
        form.bookmarkType = itemData.bookmarkType || itemData.bookmark.bookmarkType;
        form.bookmarkColor = itemData.bookmarkColor || itemData.bookmark.bookmarkColor;
        form.id = item;
      }
      this.setState({ bookmarkModal: true, time, item: item, form, clickTime: time });

      setTimeout(function () {
        let tabindexArray = [].slice.call(document.querySelectorAll('[tabindex]'));
        let divArray = tabindexArray.filter((d, i) => d.className == "" && d.tagName == "DIV");
        if (divArray[divArray.length - 1]) {
          divArray[divArray.length - 1].style.zIndex = 999999;
        }
      }, 50)
    }
  }


  handleVideoPlayPause = () => {
    const { isMultiple, dispatch } = this.props;
    this.refs.playerVideo[`${this.isPlay ? 'pause' : 'play'}`]();
    this.isPlay = !this.isPlay;
    try {
      if (isMultiple) {
        dispatch(syncplaybackStateAction({ isPaused: this.refs.playerVideo.paused }));
      }
    } catch (ex) {
      console.error(ex);
    }
  }
  heatmapimagehandle = (e) => {
    e.target.style.display = 'none'
    this.setState({ heatMapLoadError: true });
  }

  timelineRedrawTimeout = null;
  fullScreenToggle = () => {
    let me = this;
    let tlContainer = this.refs.timeline_container + '-' + me.props.camId;
    if (tlContainer.offsetWidth === window.screen.availWidth) {
      util.exitFullScreen(document.documentElement);
    } else {
      util.requestFullscreen(tlContainer);
    }
    clearTimeout(this.timelineRedrawTimeout);
    this.timelineRedrawTimeout = setTimeout(() => {
      me.timeline[me.props.camId].redraw();
    }, 300);
  }

  onTimelineModalClose() {
    this.videoPlayer && this.videoPlayer['pause']();
    this.props.dispatch(timelinePlayer({
      isPlay: false
    }));
    this.props.onClickFab();
  }
  get hasCustomTime() {
    let toReturn = false;
    try {
      return this.timeline[this.props.camId].getCustomTime('t1');
    } catch {
      return null;
    }
  }
  lastSecond = null;
  onTimeUpdate = (evt) => {
    let me = this;
    const { isHovering } = me.state;
    let seconds = Math.floor(evt.target.currentTime);
    if (me.lastSecond !== seconds && me.props.published) {
      let { time = null, inDragMode = false } = me.innerTimmerInfo || {};
      me.lastSecond = seconds;
      let hasCustomTime = null
      try {
        hasCustomTime = me.timeline[me.props.camId].getCustomTime('t1');
      } catch {
        hasCustomTime = null;
      }
      if (hasCustomTime) {
        if ((me.dragInProgress || isHovering) && time != null) {
          let timeToSet = time.add(1, 'seconds');
          me.innerTimmerInfo = { inDragMode: true, time: timeToSet };
          return;
        }
        me.timeline[me.props.camId].removeCustomTime('t1');
        let startTime = moment(inDragMode && !me.isDragVaild ? time : hasCustomTime);
        startTime = startTime.add(1, 'seconds');

        let actualTime = me.getActualTime(startTime);
        if (actualTime.isJumped) {
          me.setState({ startedTime: actualTime.time });
          startTime = moment(actualTime.time);
        }
        me.timeline[me.props.camId].addCustomTime(startTime, 't1');
        me.timeline[me.props.camId].setCustomTimeMarker(startTime.format('LTS'), 't1');
        me.timeline[me.props.camId].moveTo(startTime);
      } else {
        let videoStartTime = moment(inDragMode && !me.isDragVaild ? time : me.state.startedTime);
        if (!me.timeline[me.props.camId]) {
          me.timeline[me.props.camId].addCustomTime(videoStartTime, 't1');
          me.timeline[me.props.camId].setCustomTimeMarker(videoStartTime.format('LTS'), 't1')
          me.timeline[me.props.camId].moveTo(videoStartTime);
        }
        me.innerTimmerInfo = { time: videoStartTime, inDragMode: false };
      }
    }
  }

  getActualTime = (time) => {
    const { emptySegment } = this.props;
    let record = emptySegment.find(record => record.start < time.toDate() && record.end > time.toDate());
    let isJumped = false;
    if (record) {
      time = record.end;
      isJumped = true;
    }
    let me = this;
    let eventData = this.state.EventData;
    if (eventData && eventData.invoice && eventData.invoice.length > 0) {
      let currentReceipt = this.state.EventData.invoice.filter(function (data) {
        let timeZoneValue = data.StoreId.timeZone;
        let preTime = 5;
        let postTime = 15;

        if (data.CamId) {
          preTime = data.CamId.recordPreTime && data.CamId.recordPreTime < 5 ? preTime : data.CamId.recordPreTime;
          postTime = data.CamId.recordPostTime && data.CamId.recordPostTime < 5 ? preTime : data.CamId.recordPostTime;
        }
        let eventTimeMoment = moment(data.EventTime).utcOffset(timeZoneValue).format(util.dateTimeFormatAmPmPOS);
        let eventStartTime = moment(eventTimeMoment).subtract(preTime, "seconds").format(util.dateTimeFormatAmPmPOS);
        let eventEndTime = moment(eventTimeMoment).add(postTime, "seconds").format(util.dateTimeFormatAmPmPOS);
        var isFound = moment(time).isBetween(eventStartTime, eventEndTime);
        return isFound;

      });
      if (currentReceipt.length > 0) {
        let InvoiceDetailData = [];
        if (eventData.invoiceDetail && eventData.invoiceDetail.length > 0) {
          InvoiceDetailData = eventData.invoiceDetail.filter(function (data) { return data.InvoiceId && currentReceipt[0].InvoiceId && data.InvoiceId == currentReceipt[0].InvoiceId });
        }
        this.setState({ receipt: { invoice: currentReceipt[0], eventDetail: InvoiceDetailData } });
      }
      else {
        if (this.state.receipt) {
          this.setState({ receipt: null });
        }
      }
    }

    return {
      isJumped: isJumped,
      time: time
    }
  }

  onToggle = (player) => {
    const { isMultiple, dispatch } = this.props;
    let pauseButton = document.getElementById("livePlayButton");
    if (player.target.paused) {
      if (pauseButton) {
        pauseButton.style.visibility = 'visible';
      }
      clearTimeout(this.requestTimeout);
      this.setState({ helpText: true });
    } else {
      if (pauseButton) {
        pauseButton.style.visibility = 'hidden';
      }
      this.setState({ helpText: false });
    }

    if (isMultiple) {
      dispatch(syncplaybackStateAction({ isPaused: player.target.paused }));
    }
  }

  get mediaInfo() {
    const { camId, mediaServerUrl, mediaServerOutboundPort } = this.props;
    let url = mediaServerUrl;
    if (url && url.length > 0) {

      let checkWildCard = url.split(".");
      if (checkWildCard && checkWildCard.length == 3) {
        let serverURL = url.split("//");
        url = serverURL[0] + "//" + camId + "." + serverURL[1];
      }

      if (url.indexOf("rtmp") > -1) {
        url = url.replace('rtmp', 'http');
      }
      url = new URL(url);
      return {
        host: url.hostname,
        port: mediaServerOutboundPort
      }
    }
    return {
      host: 'z.realwave.io',
      port: 5080
    }
  }
  handleMouseMove() {
    let me = this;
    const { showhideBookMark } = this.state;
    const { isMultiple, camId } = this.props;
    me.setState({ isHovering: true }, function () {
      if (me.setTimeoutMouseMove) {
        clearTimeout(me.setTimeoutMouseMove);
      }
      me.setTimeoutMouseMove = setTimeout(() => {
        me.setState({ isHovering: false });
      }, 10000);
    });

  }
  handleMouseLeave() {
    const { isMultiple, camId } = this.props;
    this.setState({ isHovering: false });
  }

  onLoadedMetadata = (e) => {
    this.videoPlayer = e.target;
  }

  render() {
    let { camId, storeId, isHeatMapCamera, isMultiple, playBackCount, isAntMedia, isNvrOrRex, newArray, videoURL, videoToken, requestId, published, onPlaybackSpeedChange, showSpinner } = this.props;
    let { form, error, clickTime, receipt, helpText, tlSelectedDate, heatMapLoadError,
      streamId, isHovering, playbackSpeed, showhideBookMark, combos } = this.state;
    let { bookmarkType } = combos || {};
    //let url = published ? `https://xyz.test.realwave.io:8444/LiveApp/${requestId}.flv` : null;
    //let url = published ? videoURL : null;
    return (
      <div style={playBackCount > 2 ? { width: '-webkit-fill-available', height: '40vh' } : { width: '-webkit-fill-available', height: '80vh' }}
        id={`timeline_container-${camId}`} onMouseMove={this.handleMouseMove} onWheel={this.handleMouseMove} onMouseLeave={this.handleMouseLeave} >
        {
          isAntMedia ?
            <AntMediaPlayerWrapper
              ref="playerVideo"
              camId={camId}
              storeId={storeId}
              videoToken={videoToken}
              mediaInfo={this.mediaInfo
              }
              streamId={this.state.requestId ? this.state.requestId : this.props.streamId}
              isPublished={published}
              onTimeUpdate={this.onTimeUpdate}
              onToggle={this.onToggle}
              onLoadedMetadata={this.onLoadedMetadata}
            />
            :
            <FLVPlayer
              ref="playerVideo"
              componentKey={this.state.requestId}
              url={videoURL}
              controls={false}
              isTimeline={true}
              camId={camId}
              onTimeUpdate={this.onTimeUpdate}
              onToggle={this.onToggle}
              isMultiple={isMultiple}
              onLoadedMetadata={this.onLoadedMetadata}
            />
        }
        <div className="timelineOverlayer">{receipt && <PlaybackReceipt data={receipt} />} </div>
        {
          helpText && <p className="timelineHelp"><i className="fa fa-info-circle" aria-hidden="true">
          </i> Timeline will be visible on paused video </p>
        }
        {/* <table className={"fullscreen-table timeline-btn-full"} style={ptz_fullscreen_style}>
          <tbody>
            <tr style={{ float: 'right', paddingTop: 12 }}>
              <button className="timeline-fullscreen" onClick={this.fullScreenToggle}>
                <i className="cursor fa fa-arrows-alt fa-3x" style={{ color: "white" }} aria-hidden={true}>
                </i></button>
            </tr>
          </tbody>
        </table> */}
        <div id={`timeline-area-${camId}`} style={isHovering ? show_timeline : hide_timeline} className="timeline-area-multi pdTop_timline_window timeline"></div>
      </div >
    );
  }
}

function mapStateToProps(state, ownProps) {
  return {
    saveBookmark: state.saveBookmark,
    getBookMarks: state.getBookMarks,
    deleteBookMarkData: state.deleteBookMarkData,
    getEventFeedTimeline: state.getEventFeedTimeline,
    getReceipt: state.getReceipt,
    liveCamFullscreenStatus: state.liveCamFullscreenStatus,
    selectedCameraData: state.selectedCameraData,
    getCombos: state.getCombos,
    syncplaybackState: state.syncplaybackState
  };
}

var TimelinePlayerModule = connect(mapStateToProps)(TimelinePlayerSyncjs);
TimelinePlayerModule.defaultProps = {
  defaultOptions: {
    zoomMax: 1000000000,
    zoomMin: 100000,
    showCurrentTime: false,
    start: moment().subtract().format(consts.DateTimeFormat.Date),
    end: moment().format(consts.DateTimeFormat.Date),
    easingFunction: 'easeInQuint',
    format: {
      minorLabels: {
        minute: consts.DateTimeFormat.HourAMPM,
        hour: consts.DateTimeFormat.Hour
      },
      minorLabels: {
        minute: consts.DateTimeFormat.HourAMPM,
        hour: consts.DateTimeFormat.Hour
      }
    },
    showTooltips: true,
    tooltip: {
      followMouse: true,
      overflowMethod: 'flip'
    }
  }
};
//export default TimelinePlayerModule;



class TimelineWarpper extends React.PureComponent {
  render() {
    const { onClickFab, onAction, width, height, storeId, connected, camId, isHeatMapCamera, timelinePlayer, isNvrOrRex,
      recordingStreamId, primaryCameraId, onClose,
      isMultiple, playBackCount, cameraName, isAntMedia, mediaServerUrl, mediaServerOutboundPort, requestPlayback,
      onPlaybackSpeedChange, videoData, emptySegment, showSpinner, streamId, videoToken, initialDateTime, onLoadedMetadata, ...rest } = this.props;
    let { videoURL, published } = rest[0];
    console.log('TimelineWarpper');
    return (
      timelinePlayer && timelinePlayer.isPlay &&
      <TimelinePlayerModule
        onClickFab={onClickFab}
        onAction={onAction}
        width={width}
        height={height}
        storeId={storeId || timelinePlayer.storeId}
        connected={connected || timelinePlayer.connected}
        camId={camId || timelinePlayer.camId}
        isHeatMapCamera={isHeatMapCamera || timelinePlayer.isHeatMapCamera}
        timelinePlayer={timelinePlayer}
        recordingStreamId={recordingStreamId}
        primaryCameraId={primaryCameraId}
        isNvrOrRex={isNvrOrRex}
        onClose={onClose}
        isMultiple={isMultiple}
        playBackCount={playBackCount}
        camName={cameraName}
        isAntMedia={isAntMedia}
        mediaServerUrl={mediaServerUrl}
        mediaServerOutboundPort={mediaServerOutboundPort}
        onPlaybackSpeedChange={onPlaybackSpeedChange}
        requestPlayback={requestPlayback}
        videoData={videoData}
        emptySegment={emptySegment}
        published={published}
        videoURL={videoURL}
        showSpinner={showSpinner}
        streamId={streamId}
        videoToken={videoToken}
        initialDateTime={initialDateTime}
      />
      || null
    )
  }
}
let TimelineWarpperModule = connect((state, ownProps) => {
  return {
    timelinePlayer: state.timelinePlayer
  }
})(TimelineWarpper);

export default TimelineWarpperModule;

