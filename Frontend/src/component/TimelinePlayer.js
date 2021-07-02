import React from 'react';
import { connect } from 'react-redux';
import moment from 'moment';
import consts from '../Util/consts';
import { saveBookmark, deleteBookMarkData, getEventFeedTimeline, getReceipt, playbackStop, getCombos } from '../redux/actions/httpRequest';
import { Button, Modal, ModalHeader, ModalBody, ModalFooter, Col, Form, FormGroup, Label, Input } from 'reactstrap';
import 'react-tagsinput/react-tagsinput.css';
import PlaybackReceipt from './PlaybackReceipt';
import common from '../common';
import util from './../Util/Util';
import './../scss/timeline.scss';
import { timelinePlayer } from '../redux/actions';
import TimelineSocketSupprt from './TimelineSocketSupprt';
import FLVPlayer from './FLVPlayer';
import AntMediaPlayer from './Player/AntMediaPlayer';
import swal from 'sweetalert';
import Select from 'react-select';
import DatePicker from 'react-datepicker';
import Switch from "react-switch";
import io from 'socket.io-client';
import DateRangePicker from '../component/DateRangePicker';
import { createCustomVideoClip } from './../redux/actions/httpRequest';
import createManualClip from '../assets/img/Newicon/create_manual_clip.svg';
import LoadingDialog from './LoadingDialog';
import utils from './../Util/Util';


let properties = ['transform', 'WebkitTransform', 'MozTransform',
  'msTransform', 'OTransform'];
let prop = properties[0];
const ptz_fullscreen_style = { display: 'block', width: '85%', height: '4%', zIndex: 1 };
const show_timeline = { display: 'block' };
const hide_timeline = { display: 'none' };
const funcList = ["clickHandler", "doubleClickHandler", "handleVideoPlayPause", "doubleClickHandlerBookMark"];


class AntMediaPlayerWrapper extends React.PureComponent {
  render() {
    const { camId, storeId, videoToken, mediaInfo, streamId, isPublished, onToggle, onTimeUpdate, is360 } = this.props;
    console.log("IsPublished: " + isPublished)
    return (
      isPublished && (is360 ?
        <AntMediaPlayer
          ref="playerVideo"
          camId={camId}
          storeId={storeId}
          token={videoToken}
          mediaInfo={mediaInfo}
          componentKey={streamId}
          isTimeline={true}
          onTimeUpdate={onTimeUpdate}
          onToggle={onToggle}
          is360={is360}
        /> : <AntMediaPlayer
          ref="playerVideo"
          camId={camId}
          storeId={storeId}
          token={videoToken}
          mediaInfo={mediaInfo}
          componentKey={streamId}
          isTimeline={true}
          onTimeUpdate={onTimeUpdate}
          onToggle={onToggle}
          is360={is360}

        />)
    )
  }
}

class TimelinePlayer extends TimelineSocketSupprt {
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
      videoData: [],
      startedTime: null,
      videoToken: null,
      streamId: null,
      timeZoneOffsetValue: null,
      currentServerTime: null,
      isHovering: true,
      playbackSpeed: null,
      pbPopupOpen: false,
      showhideBookMark: false,
      checked: false,
      openDateRangePicker: false,
      startDuration: moment().format('MM/DD/YYYY hh:mm:ss a'),
      endDuration: moment().format('MM/DD/YYYY hh:mm:ss a'),
      isLoad: false,
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
      template: function (item, element, data) { // Show bookmark template like green box
        if (item && item.bookmark && !(Object.keys(item.bookmark).length === 0) && item.bookmark.constructor === Object && item.bookmark.bookmarkName) {
          return '<div class="bookmark-ring" style="background :' + item.bookmark.bookmarkColor + '"> </div>';
        }
        else {
          return `<div></div>`;
        }
      }
    }, this.props.defaultOptions);
    this.itemsCheckDuplicate = [];
    this.timeline = null;
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
    this.onShowHideBookmark = this.onShowHideBookmark.bind(this);
    this.changeHandler = this.changeHandler.bind(this);

    // this.lastBookmarkRequestedDate = {
    //   startDate: null,
    //   endDate: null
    // }
  }

  get videoPlayer() {
    const { camId } = this.props;
    return window.document.getElementById(`TIMELINE_PLAYER_${camId}`);
    //return this.refs.playerVideo.refs[`TIMELINE_PLAYER_${camId}`];
  }

  componentDidMount() {
    let me = this;
    this.props.dispatch(getCombos.request({ combos: "bookmarkType" }));
    let container = document.getElementById(`timeline-area`); // Get timeline Show div id
    let containerBookmark = document.getElementById(`timeline-area-bookmark`); // Get timeline Show div id

    // Create a Timeline Area
    me.timeline = new window.vis.Timeline(container, me.visDataSet, me.groups, me.visOptions); // Set timeline view
    var options = Object.assign({
      showMajorLabels: false, showMinorLabels: false,
      order: function (a, b) {
        return b.group - a.group;
      },
    }, me.visOptions);
    let isIpad = utils.isIpad;
    me.timelineBookMark = new window.vis.Timeline(containerBookmark, me.visDataSet, me.groupsBookMark, options); // Set timeline view
    me.timelineTimeChangeTimeout = null;
    me.timeline.on("timechange", (props) => {
      me.dragInProgress = true;
      clearTimeout(me.timelineTimeChangeTimeout);
      me.timeline.setCustomTimeMarker(moment(props.time).format('LTS'), 't1');
      me.timelineTimeChangeTimeout = setTimeout(() => {
        me.dragInProgress = false;
        if (me.validateSelectedTimelineRange(props, 'Drag')) {
          me.isDragVaild = true;
          console.log(`timeline time change: ${props.time}`);
          me.clickHandler(props);
        } else {
          me.isDragVaild = false;
        }
      }, 1000);
    });

    me.timelineBookMark.on('doubleClick', me.doubleClickHandlerBookMark);
    if (isIpad) {
      me.timelineBookMark.on('click', me.doubleClickHandlerBookMark);
    }

    me.timeline.on("click", (props) => {
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
        me.timeline.setCustomTime(startTime, 't1');
        me.timeline.setCustomTimeMarker(startTime.format('LTS'), 't1');
        me.timeline.moveTo(startTime);
        //me.timelineTimeChangeTimeout = setTimeout(() => {
        console.log(`timeline time change: ${props.time}`);
        me.clickHandler(props);
        // }, 1000);
      }
    });
    // onDoubleClick on timeline

    if (me.props.isHeatMapCamera) {
      me.timeline.on('timechanged', function (properties) {
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

    const { camId, storeId } = this.props;

    // range event
    me.timeline.on('rangechanged', function (properties) {
      var range = me.timeline.getWindow();
      me.timelineBookMark.setWindow(range.start, range.end);

      // console.log(`TIMELINE_START: ${range.start}`);
      // console.log(`TIMELINE_END: ${range.end}`);
      // console.log(`TIMELINE-#####################################################################################`);

      // clearTimeout(me.bookmarkRequestTimeout);
      // me.bookmarkRequestTimeout = setTimeout(() => {

      //   let lastStartDate = moment(me.lastBookmarkRequestedDate.startDate).startOf('day');
      //   let changedStartDate = moment(range.start).startOf('day');

      //   if (changedStartDate < lastStartDate) {
      //     me.lastBookmarkRequestedDate.startDate = range.start;
      //     me.lastBookmarkRequestedDate.endDate = range.end;

      //     let startDate = moment(me.lastBookmarkRequestedDate.startDate).startOf('day').format('YYYY/MM/DD hh:mm:ss A');
      //     let endDate = moment(me.lastBookmarkRequestedDate.endDate).endOf('day').format('YYYY/MM/DD hh:mm:ss A');

      //     me.props.dispatch(getBookMarksAction.request({
      //       action: 'list',
      //       camId: camId,
      //       storeId: storeId,
      //       startDate: startDate,
      //       endDate: endDate
      //     }));

      //     console.log(`TIMELINE New Bookmark http request StartDate: ${startDate} EndDate: ${endDate}`);
      //   }
      // }, 2000);

      if (!me.state.fetchEvent) {
        clearTimeout(me.alreadyRequestTimeout);
        me.alreadyRequestTimeout = setTimeout(() => {
          me.setState({ eventStart: properties.start, eventEnd: properties.end, fetchEvent: true });
          // me.props.dispatch(getEventFeedTimeline.request({ action: 'list', filter: me.filters, startDate: properties.start, endData: properties.end }));
        }, 1000);
      }
    });

    me.timelineBookMark.on('rangechanged', function (properties) {
      var range = me.timelineBookMark.getWindow();
      me.timeline.setWindow(range.start, range.end);
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

  timelineDataFormat(data) {
    let tempData = [];

    for (let index = 0, len = data.length; index < len; index++) {
      const item = data[index];

      let start = item[0];
      let end = item[1];
      let duration = item[2];
        tempData.push({
          id: index,
          group: 1,
          type: "background",
          // title: start,
          // selectedTime: start,
          // endTime: end,
          // duration: duration,
          start: moment(start, "YYYY-MM-DD hh:mm:ss A").format('YYYY/MM/DD hh:mm:ss A'),
          end: moment(end, "YYYY-MM-DD hh:mm:ss A").format('YYYY/MM/DD hh:mm:ss A'),
        });
    }

    return tempData;
  }

  processBookmarkData = async (data = []) => {
    let me = this;
    let videoData = this.state.videoData;

    //remove old book mark when set to new records
    let toRemove = me.visDataSet.get().filter(e => e.group === 0);
    if (toRemove.length > 0) {
      me.visDataSet.remove(toRemove);
    }

    for (let i = 0; i < data.length; i++) {
      if (this.isBookmarkRequestCanceled) {
        break;
      }
      const element = data[i];
      let dataIndex = videoData.findIndex((x, i) => moment(element.start).isSame(x.start) && moment(element.endDate).isSame(x.endTime));
      const bookmarkColorData = me.state && me.state.combos && me.state.combos.bookmarkType ? me.state.combos.bookmarkType.filter(e => element && element.bookmarkType && e.LookupId == element.bookmarkType.value) : [];
      const colorValue = bookmarkColorData && bookmarkColorData.length > 0 ? bookmarkColorData[0].Color : '';
      if (dataIndex > -1) {
        videoData[dataIndex].group = 0;
        videoData[dataIndex].element.title = element.bookmarkName;
        videoData[dataIndex].bookmark = {
          bookmarkColor: colorValue,
          bookmarkName: element.bookmarkName, bookmarkDescription: element.bookmarkDescription, tags: element.tags ? element.tags.split(",") : []
        }
        videoData[dataIndex]._id = element._id;
        me.visDataSet.update(videoData[dataIndex]);
      }
      else {
        me.itemsCheckDuplicate.push({ start: moment(element.start, "YYYY-MM-DD hh:mm:ss A").format('YYYY/MM/DD hh:mm:ss A') });
        element.start = moment(element.start, "YYYY-MM-DD hh:mm:ss A").format('YYYY/MM/DD hh:mm:ss A');
        element.id = me.visDataSet.length + 1;
        element.group = 0;
        element.title = element.bookmarkName;
        element.hidden = true;
        element.visible = false;
        element.bookmark = {
          bookmarkName: element.bookmarkName,
          bookmarkColor: colorValue,
          bookmarkDescription: element.bookmarkDescription,
          tags: element.tags ? element.tags.split(",") : []
        }
        me.visDataSet.update(element);
        //bookmarkData.push(element);
      }
    }
    //Update bookmark data
    // if (bookmarkData.length > 0) {
    //   me.visDataSet.update(bookmarkData);
    // }
  }

  componentWillReceiveProps(nextProps) {
    let me = this, { onAction, selectedCameraData } = this.props;
    // Get timeline video
    let videoData = this.state.videoData;

    // Get/Set Event Data in Time Line
    if (nextProps.getEventFeedTimeline && nextProps.getEventFeedTimeline.data && !nextProps.getEventFeedTimeline.isFetching) {
      if (nextProps.getEventFeedTimeline !== this.props.getEventFeedTimeline && nextProps.getEventFeedTimeline.data.success) {

        // Delete old event data -
        if (me.visDataSet.length > 0) {
          me.visDataSet.get().map((item, i) => {
            let time = moment(item.start, "YYYY-MM-DD hh:mm:ss A")._d;
            if (time >= me.state.eventStart && time <= me.state.eventEnd && item.EventId) {
              me.visDataSet.remove(item.id);
            }
          });
        }

        let timelineDataCount = me.visDataSet.length + 1;
        let eventDataArray = nextProps.getEventFeedTimeline.data.data || [];
        eventDataArray.map((d) => { // set start / end time in event for timeline
          let eventTime = moment(d.EventTime).format("YYYY-MM-DD hh:mm:ss A");
          d.start = eventTime;
          d.endTime = eventTime;
          d.title = eventTime;
          d.id = timelineDataCount;
          d.group = 0;
          d.type = "point"
          timelineDataCount++;
        })
        me.visDataSet.update(eventDataArray)
        me.setState({ fetchEvent: false })
      }
    }

    // // Set Bookmark data
    // if (nextProps.getBookMarks && nextProps.getBookMarks.data && !nextProps.getBookMarks.isFetching) {
    //   this.processBookmarkData(nextProps);
    // }
    if ((nextProps.getCombos && nextProps.getCombos !== this.props.getCombos)) {
      let { data, isFetching } = nextProps.getCombos;
      if (!isFetching) {
        this.setState({ combos: data });
      }
    }
    if (nextProps.getReceipt !== this.props.getReceipt) {
      let { data, error, isFetching } = nextProps.getReceipt;
      let valid = common.responseHandler(data, error, isFetching);
      if (valid) {
        me.setState({ receipt: data.data });
      }
    }

    if (nextProps.saveBookmark && nextProps.saveBookmark.data && !nextProps.saveBookmark.isFetching) {
      if (nextProps.saveBookmark !== this.props.saveBookmark && nextProps.saveBookmark.data.success) {
        let savedBookMark = nextProps.saveBookmark.data.data;
        let res = me.visDataSet.get();
        let dataIndex = res.findIndex((x, i) => moment(savedBookMark.start).isSame(x.start) && moment(savedBookMark.endDate).isSame(x.endTime))
        if (dataIndex > -1) {
          res[dataIndex]._id = savedBookMark._id;
          me.visDataSet.update(res[dataIndex]);
        }
      }
    }
  }
  validateSelectedTimelineRange(props, actionName) {
    let { item, time } = props;
    let videoData = this.state.videoData;
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
    let videoData = this.state.videoData;
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
    me.setState({ receipt: null, playbackSpeed: null });
    let data = me.visDataSet._data;
    data.forEach(value => {
      result.push(value);
    });
    if (result.length > 0) {
      result = result.filter(data => { return data.type == "background" });
    }
    // Get video data from event and bookmark
    if (item > -1 && item != null) {
      itemData = me.visDataSet.get(item);
      result = result.sort((objFirst, objSecond) => new Date(objFirst.start) - new Date(objSecond.start));
      if (itemData.group !== 1) {
        itemIndex = result.findIndex(data => {
          selectedTime = moment(itemData.start).format('YYYY/MM/DD hh:mm:ss A');
          startTime = moment(data.start).format('YYYY/MM/DD hh:mm:ss A');
          return moment(selectedTime).isBetween(moment(startTime), moment(data.end)) && data.group == 1
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
        return moment(selectedTime).isBetween(moment(startTime), moment(data.end)) && data.group == 1
      })
      if (itemIndex > -1) {
        itemData = result[itemIndex];
      }
    }

    if (itemData && itemData.EventType && itemData.EventType != "Face") { // show receipt
      this.props.dispatch(getReceipt.request({ InvoiceId: itemData.InvoiceId }));
    }

    this.setState({ published: false, startedTime: time }, () => {
      let startDate = moment(time).format("YYYY/MM/DD hh:mm:ss A");
      let playbackOption = {
        recordingStreamId: this.props.recordingStreamId || 0,
        primaryCameraId: this.props.primaryCameraId || 0,
        camId: this.props.camId,
        time: startDate,
        requestId: this.state.requestId
      };
      this.requestPlayback(playbackOption);

      const { videoData } = this.state;

      this.bookmarkRequestOption.startDate = moment(videoData[0].start).startOf('day').format('YYYY/MM/DD hh:mm:ss A');
      this.bookmarkRequestOption.endDate = startDate;
      this.bookMarkRequest();
    });
    // setTimeout(function () {
    //   if (me.state.playbackSpeed && me.state.playbackSpeed != 1 && me.props.isNvrOrRex)
    //     me.onPlaybackSpeedChange(me.state.playbackSpeed, true);
    // }, 5000);
  }

  /**
   * close bookmark modal
   */

  closeModal = () => {
    this.setState({ bookmarkModal: !this.state.bookmarkModal, form: {}, selectedTime: null, error: {} })
  };

  /**
   * On change form data
   */
  changeHandler = (event, fieldName) => {
    let formData = { ...this.state.form }
    let errorData = { ...this.state.error }

    if (event && event.constructor === Array) {
      formData.tags = event;
    }
    else {
      let { target } = event || { target: '' };
      if (target && !fieldName && target.name) {
        event.stopPropagation();
        if (target.name == 'bookmarkName') {
          errorData.bookmarkName = false;
        }
        formData[target.name] = target.value;
      }
      else if (fieldName) {
        switch (fieldName) {
          case 'bookmarkType':
            formData.bookmarkColor = '';
            formData[fieldName] = '';
            if (event) {
              formData[fieldName] = event;
              formData.bookmarkColor = this.state.combos.bookmarkType.filter(e => e.LookupId == event.value)[0].Color;
            }
            break;
          default:
            formData[fieldName] = event;
            break;
        }
      }
      errorData.bookmarkName = false;
      this.setState({ form: formData, error: errorData });
    }
  }

  /**
   * double Click Handler
   */
  doubleClickHandler(props) {
    let { item, time } = props;
    let form = {};
    let itemData = item > -1 && item != null ? this.visDataSet.get(item) : item;
    if (this.validateSelectedTimelineRange(props, 'Click')) {

      let tlContainer = this.refs.timeline_container;
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
        divArray[divArray.length - 1].style.zIndex = 999999;
      }, 50)
    }
  }

  /**
   * double Click Handler
   */
  doubleClickHandlerBookMark(props) {
    if (props.event.target.className === 'bookmark-ring') {
      this.doubleClickHandler(props)
    }
  }
  /**
   *  submit book mark data
   */
  submitBookmark = () => {
    let me = this;
    let { size, storeId, camId } = this.props;
    let formData = { ...this.state.form }
    if (formData && !formData.bookmarkName || !formData.bookmarkType) {
      let error = {};
      if (!formData.bookmarkType) {
        error.bookmarkType = true;
      }
      if (!formData.bookmarkName) {
        error.bookmarkName = true;
      }
      this.setState({ error });
      return false;
    }
    let timelineId = formData.id || this.state.item;
    let time = moment(this.state.form.bookmarkDate || this.state.time).format("YYYY-MM-DD hh:mm:ss A");
    if (this.validateSubmitedTimelineRange(time, 'Submit')) {
      if (timelineId > -1 && timelineId != null) {
        let item = this.visDataSet.get(timelineId);
        item = Object.assign(item, this.state.form);
        item.bookmark = this.state.form;
        item.title = this.state.form.bookmarkName;
        item.start = time;
        time = item.start;
        this.visDataSet.update(item);
      }
      else {
        let rec = this.visDataSet.get();
        let lastData = rec[rec.length - 1];
        if (lastData) {
          timelineId = lastData.id + 1;
        }
        else {
          timelineId = this.visDataSet.length;
        }
        var items = me.itemsCheckDuplicate.filter((x, i) => moment(time).format('YYYY-MM-DD hh:mm:00 A') == moment(x.start).format('YYYY-MM-DD hh:mm:00 A'));
        if (me.groupsBookMark.length - 1 < items.length) {
          me.groupsBookMark.add({ id: items.length, content: "" })
        }
        me.itemsCheckDuplicate.push({ start: moment(time, "YYYY-MM-DD hh:mm:ss A").format('YYYY/MM/DD hh:mm:ss A') });
        this.visDataSet.add({
          camId,
          group: 0,
          endTime: time, fileName: "", id: timelineId,
          selectedTime: time,
          size,
          start: moment(time, "YYYY-MM-DD hh:mm:ss A").format('YYYY/MM/DD hh:mm:ss A'), storeId,
          title: this.state.form.bookmarkName,
          bookmark: this.state.form,
          className: 'vis-item.red'
        })
      }

      let data = { storeId, camId, endDate: time, start: time, bookmarkId: timelineId };

      Object.keys(me.state.form).forEach(function (key) {
        let value = me.state.form[key]
        if (key == 'tags') {
          value = me.state.form[key].join(",");
        }
        data[key] = value;
      });

      let action = 'save';
      let idSave = 0;
      if (formData.id) {
        action = 'update';
        idSave = this.visDataSet.get(timelineId)._id;
      }

      let option = { action, data };

      this.props.dispatch(saveBookmark.request(option, idSave));
      this.setState({ bookmarkModal: false, form: {}, error: {}, item: null, clickTime: null });
    }
  }

  deleteBookmark = (id) => {
    let data = Object.assign({}, this.visDataSet.get(id));
    if (data.bookmark && data.group == 1) {
      if (!data.bookmark.bookmarkName) {
        return false;
      }
      data.bookmark = { bookmarkName: undefined, bookmarkDescription: undefined, tags: [] };
      this.visDataSet.update(data);
    } else if (data.bookmark && data.group !== 1) {
      this.visDataSet.remove(id);
    }
    this.props.dispatch(deleteBookMarkData.request({ action: 'delete' }, data._id || id))
    this.setState({ bookmarkModal: false, form: {}, error: {}, item: null, clickTime: null });
  }

  handleVideoPlayPause = () => {
    this.refs.playerVideo[`${this.isPlay ? 'pause' : 'play'}`]();
    this.isPlay = !this.isPlay;
  }
  heatmapimagehandle = (e) => {
    e.target.style.display = 'none'
    this.setState({ heatMapLoadError: true });
  }
  videoController = (control) => {
    let { zoom } = this.state;
    let videoStyle = this.videoPlayer.style;
    let getVideoLeft = videoStyle.left || 0;
    let getVideoTop = videoStyle.top || 0;

    switch (control) {
      case util.controller.ZOOMIN:
        this.setState({ zoom: zoom + 0.1 }, () => {
          videoStyle[prop] = 'rotate(' + 0 + 'deg) scale(' + this.state.zoom + ')';
        });
        break;
      case util.controller.ZOOMOUT:
        if (zoom > 1) {
          this.setState({ zoom: zoom - 0.1 }, () => {
            videoStyle[prop] = 'rotate(' + 0 + 'deg) scale(' + this.state.zoom + ')';
          });
        }
        break;
      case util.controller.LEFT:
        this.setState({ left: parseInt(getVideoLeft, 10) - 10 }, () => {
          videoStyle.left = (this.state.left) + 'px';
        });
        break;
      case util.controller.RIGHT:
        this.setState({ right: parseInt(getVideoLeft, 10) + 10 }, () => {
          videoStyle.left = (this.state.right) + 'px';
        });
        break;
      case util.controller.UP:
        this.setState({ up: parseInt(getVideoTop, 10) - 10 }, () => {
          videoStyle.top = (this.state.up) + 'px';
        });
        break;
      case util.controller.DOWN:
        this.setState({ down: parseInt(getVideoTop, 10) + 10 }, () => {
          videoStyle.top = (this.state.down) + 'px';
        });
        break;
      default:
        this.setState({ zoom: 1, top: 0, right: 0, left: 0, down: 0 }, () => {
          videoStyle[prop] = 'rotate(' + 0 + 'deg) scale(' + 1 + ')';
          videoStyle.top = '';
          videoStyle.left = '';
        });
        break;
    }

  }
  timelineRedrawTimeout = null;
  fullScreenToggle = () => {
    let me = this;
    let tlContainer = this.refs.timeline_container;
    if (tlContainer.offsetWidth === window.screen.availWidth) {
      util.exitFullScreen(document.documentElement);
    } else {
      util.requestFullscreen(tlContainer);
    }
    clearTimeout(this.timelineRedrawTimeout);
    this.timelineRedrawTimeout = setTimeout(() => {
      me.timeline.redraw();
    }, 300);
  }
  onShowHideBookmark() {
    const me = this;
    const { showhideBookMark } = me.state;
    const timlineDiv = document.getElementById(`timeline-area-bookmark`);
    if (timlineDiv) {
      this.setState({ showhideBookMark: !showhideBookMark }, () => {
        timlineDiv.style.height = showhideBookMark ? "0%" : "86%";
        let startTime = moment(me.state.startedTime);
        if (me.props.published) {
          me.timeline.setCustomTime(startTime, 't1');
          me.timeline.setCustomTimeMarker(startTime.format('LTS'), 't1');
          me.timeline.moveTo(startTime);
        }
      });
    }
  }
  onTimelineModalClose() {
    this.videoPlayer['pause']();
    this.props.dispatch(timelinePlayer({
      isPlay: false
    }));
    this.props.onClickFab();
  }

  lastSecond = null;
  onTimeUpdate = (evt) => {
    let me = this;
    const { showhideBookMark, isHovering } = me.state;
    let seconds = Math.floor(evt.target.currentTime);
    if (evt.target.playbackTimeStamp) {
      seconds = new Date(evt.target.currentTime).valueOf();
    }

    if (me.lastSecond !== seconds) {
      let { time = null, inDragMode = false } = me.innerTimmerInfo || {};
      me.lastSecond = seconds;
      let hasCustomTime = null
      try {
        hasCustomTime = me.timeline.getCustomTime('t1');
      } catch {
        hasCustomTime = null;
      }
      if (hasCustomTime) {
        if ((me.dragInProgress || isHovering) && time != null) {
          let timeToSet = time.add(1, 'seconds');
          me.innerTimmerInfo = { inDragMode: true, time: time };
          return;
        }
        me.timeline.removeCustomTime('t1');
        let startTime = moment(inDragMode && !me.isDragVaild ? time : hasCustomTime);
        startTime = evt.target.playbackTimeStamp ? moment(new Date(evt.target.currentTime)) : startTime.add(1, 'seconds');

        let actualTime = me.getActualTime(startTime);
        if (actualTime.isJumped) {
          me.setState({ startedTime: actualTime.time });
          startTime = moment(actualTime.time);
        }

        me.timeline.addCustomTime(startTime, 't1');
        me.timeline.setCustomTimeMarker(startTime.format('LTS'), 't1');
        me.timeline.moveTo(startTime);
        if (!showhideBookMark) {
          me.timelineBookMark.moveTo(startTime);
        }
      } else {
        let videoStartTime = moment(inDragMode && !me.isDragVaild ? time : me.state.startedTime);
        me.timeline.addCustomTime(videoStartTime, 't1');
        me.timeline.setCustomTimeMarker(videoStartTime.format('LTS'), 't1')
        me.timeline.moveTo(videoStartTime);
        if (!showhideBookMark) {
          me.timelineBookMark.moveTo(videoStartTime);
        }
        me.innerTimmerInfo = { time: videoStartTime, inDragMode: false };
      }
    }
  }

  getActualTime = (time) => {
    const { emptySegment } = this.state;
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
    let pauseButton = document.getElementById("livePlayButton");
    const { published } = this.state;
    clearTimeout(this.requestTimeout);
    if (player.target.paused) {
      published && this.setPlaybackState({ action: "pause" });
      if (pauseButton) {
        pauseButton.style.visibility = 'visible';
      }
      this.setState({ helpText: true });
    }
    else {
      if (pauseButton) {
        pauseButton.style.visibility = 'hidden';
        this.setPlaybackState({ action: "play" });
      }
      published && this.setState({ helpText: false });
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
    const timlineDiv = document.getElementById(`timeline-area-bookmark`);
    let isIpad = utils.isIpad;
    me.setState({ isHovering: true }, () => {
      if (timlineDiv) {
        timlineDiv.style.height = showhideBookMark ? "86%" : "0%";
      }
      if (me.setTimeoutMouseMove) {
        clearTimeout(me.setTimeoutMouseMove);
      }
      if (!isIpad) {
        me.setTimeoutMouseMove = setTimeout(() => {
          me.setState({ isHovering: false });
        }, 10000);
      }
    });

  }
  handleMouseLeave() {
    const { showhideBookMark } = this.state;
    const timlineDiv = document.getElementById(`timeline-area-bookmark`);
    let isIpad = utils.isIpad;
    this.setState({ isHovering: isIpad ? true : false });
    if (showhideBookMark) {
      timlineDiv.style.height = "86%";
    }
  }

  onPlaybackSpeedChange = (value, fromTimelineChange) => {
    let speed = value.target.id;
    this.setState({ playbackSpeed: speed }, () => {
      this.setPlaybackSpeed({ speed: speed });
    });
  }
  handleChange = (checked) => {
    this.setState({ checked });
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
  requestDuration(option) {
    clearTimeout(this.requestTimeout);
    const { requestId } = this.state;
    const { camId, storeId } = this.props;
    let data = {
      type: 'request',
      clientId: this.clientId,
      storeId: storeId,
      camId: camId
    }

    data = Object.assign({}, data, option);
    console.log(`Request Grid Search ${JSON.stringify(data)}`);
    this.setState({ isLoad: true, startDuration: option.startDuration, endDuration: option.endDuration });
    this.socketClient.emit('gridsearchStartEndDuration', data);
    this.requestTimeout = setTimeout(this.onRequestTimelout, this.timeout);
  }
  Connect = (evt) => {
    const { camId } = this.props;
    const { startDuration, endDuration } = this.state;
    this.requestDuration({ startDuration: this.formatDate(startDuration), endDuration: this.formatDate(endDuration) });
  }
  formatDate(date) {
    return moment(date).format('MM/DD/YYYY hh:mm:ss a')
  }
  onSearchGrid() {
    debugger;
    const { storeId } = this.props;
    this.clientId = utils.guid();
    let socketUri = `${utils.serverUrl}?type=client&storeId=${storeId._id}&clientId=${this.clientId}`;
    this.socketClient = io(socketUri);
    this.socketClient.on('connect', this.Connect);
    this.socketClient.on('disconnect', this.onDisconnect);
    this.socketClient.on('gridsearchStartEndDuration', this.onResult);
  }
  onClickSearch = (option) => {
    this.gridSearchData = {
      uid: null,
      equalTimeSplit: null,
      time: {
        start: null,
        end: null
      }
    }

    let stateOption = { openDateRangePicker: true };

    if (!option) {
      this.onSearchGrid();
    } else {
      stateOption.startDuration = option.start;
      stateOption.endDuration = option.end;
    }
    this.setState(stateOption);
  }
  closeDateRangePicker = () => {
    this.setState({ openDateRangePicker: false, isLoad: false }, () => {
      this.socketClient.disconnect();
      this.socketClient.close();
    });
  }
  openGridSearch = (dateRange, action) => {
    let { start, end } = dateRange;

    const { camId, storeId } = this.props;
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
                    storeId: storeId,
                    utcOffSet: moment().utcOffset(),
                    camId: camId
                  }));
                }
              });
          }

          this.props.dispatch(createCustomVideoClip.request({
            startTime: moment(start).format('YYYY-MM-DD hh:mm:ss A'),
            endTime: moment(end).format('YYYY-MM-DD hh:mm:ss A'),
            storeId: storeId,
            utcOffSet: moment().utcOffset(),
            camId: camId
          }));
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
  CreateBookmarkHandler = () => {
    this.setState({ bookmarkModal: true })
  }

  onClipCreateFromPlayback = () => {
    this.onClickSearch({
      start: this.bookmarkRequestOption.startDate,
      end: this.bookmarkRequestOption.endData
    });
  }

  render() {


    let { camId, storeId, isHeatMapCamera, isAntMedia, isNvrOrRex, cameratype, config } = this.props;
    let { form, error, videoURL, clickTime, receipt, helpText, showSpinner, tlSelectedDate, heatMapLoadError, published, requestId,
      videoToken, streamId, isHovering, playbackSpeed, showhideBookMark, combos, checked, openDateRangePicker, startDuration, endDuration, isLoad } = this.state;
    let { bookmarkType } = combos || {};
    let isFetching = createCustomVideoClip.isFetching || isLoad;
    //let url = published ? `https://xyz.test.realwave.io:8444/LiveApp/${requestId}.flv` : null;
    //let url = published ? videoURL : null;
    console.log('Date bookmarkDate: ' + form.bookmarkDate + 'Date Time' + clickTime);
    let isIpad = utils.isIpad;
    let timelineDivStyle = { width: '-webkit-fill-available', background: '#000', height: '80vh' };
    if (isIpad) {
      timelineDivStyle = { width: '-webkit-fill-available', background: '#000', height: '77vh' };
    }
    return (
      <>
        <LoadingDialog isOpen={isFetching} />
        <div style={timelineDivStyle}
          ref={'timeline_container'} id="timeline_container" onMouseMove={this.handleMouseMove} onWheel={this.handleMouseMove}
          onMouseLeave={this.handleMouseLeave}>
          {
            isAntMedia ?
              <AntMediaPlayerWrapper
                ref="playerVideo"
                camId={camId}
                storeId={storeId}
                videoToken={videoToken}
                mediaInfo={this.mediaInfo}
                streamId={this.state.requestId}
                isPublished={published}
                //onTimeUpdate={this.onTimeUpdate}
                onToggle={this.onToggle}
                is360={checked}
              />
              :
              <FLVPlayer
                ref="playerVideo"
                componentKey={this.state.requestId}
                url={videoURL}
                controls={false}
                isTimeline={true}
                camId={camId}
                //onTimeUpdate={this.onTimeUpdate}
                onToggle={this.onToggle}
              />
          }
          {!showhideBookMark && <div className="timelineOverlayer">{receipt && <PlaybackReceipt data={receipt} />} </div>}

          <table className={"fullscreen-table timeline-btn-full"} style={ptz_fullscreen_style}>
            {(cameratype == "360") && <Switch
              onChange={this.handleChange}
              checked={checked}
              onColor="#86d3ff"
              onHandleColor="#2693e6"
              handleDiameter={20}
              height={13}
              width={35}
              className={"switch-button video-switch-toggle"}
            />}

            <tbody>
              <tr style={{ float: 'right' }}>
                <button className="timeline-fullscreen" onClick={this.fullScreenToggle} ><i className="cursor fa fa-arrows-alt fa-3x" style={{ color: "white" }} aria-hidden={true}></i></button>
              </tr>
              <tr style={{ float: 'right', paddingRight: 40 }} >
                <button title={showhideBookMark ? "Hide Bookmark" : "Show Bookmark"} type="button" id="showhideBookMark" onClick={this.onShowHideBookmark} className={showhideBookMark ? "showHidebookmarkSelected" : "showHidebookmarkButton"}>
                  <div className={showhideBookMark ? "cursor image-bookmark-white" : "cursor image-bookmark"} aria-hidden={true}></div>
                </button>
              </tr>
              <tr style={{ display: "flex", float: "right", marginRight: 17, paddingTop: 3 }}>
                <button title="Create Clip" className="btn date_range_picker_button_color " style={{ fontSize: 16, marginRight: 13 }} onClick={this.onClipCreateFromPlayback}><img src={createManualClip} alt="createManualClip" className='create_clip_search_width' /> </button><div className="clear" />


                <button title="Create Bookmark" style={{ width: 40, background: 'white' }} onClick={this.CreateBookmarkHandler} ><i className="fa fa-bookmark" style={{ fontSize: 27 }} aria-hidden={true}></i></button>
              </tr>

            </tbody>
          </table>

          <div id={`timeline-area-bookmark`} className={showhideBookMark ? `timelineBookmark bookmark-height` : 'timelineBookmark'}></div>

          <div id={`timeline-area`} style={isHovering ? show_timeline : hide_timeline} className="timeline"></div>
          {isNvrOrRex &&
            <div style={isHovering ? show_timeline : hide_timeline} className="pdTop_FF" >
              <button type="button" id="1" className={playbackSpeed == "1" ? "btn ffButtonSelected" : "btn ffButton"} onClick={this.onPlaybackSpeedChange}>1 FPS</button>
              <button type="button" id="0.25" className={playbackSpeed == "0.25" ? "btn ffButtonSelected" : "btn ffButton"} onClick={this.onPlaybackSpeedChange}>0.25X</button>
              <button type="button" id="0.5" className={playbackSpeed == "0.5" ? "btn ffButtonSelected" : "btn ffButton"} onClick={this.onPlaybackSpeedChange}>0.5X</button>
              <button type="button" id="1x" className={playbackSpeed == "1x" ? "btn ffButtonSelected" : "btn ffButton"} onClick={this.onPlaybackSpeedChange}>1X</button>
              <button type="button" id="2x" className={playbackSpeed == "2x" ? "btn ffButtonSelected" : "btn ffButton"} onClick={this.onPlaybackSpeedChange}>2X</button>
              <button type="button" id="4x" className={playbackSpeed == "4x" ? "btn ffButtonSelected" : "btn ffButton"} onClick={this.onPlaybackSpeedChange}>4X</button>
              <button type="button" id="8x" className={playbackSpeed == "8x" ? "btn ffButtonSelected" : "btn ffButton"} onClick={this.onPlaybackSpeedChange}>8X</button>
            </div>
          }

          {isHeatMapCamera &&
            <div className="image-container-timeline" onClick={() => this.handleVideoPlayPause()}>
              <img src={`${util.serverUrl}/heatMapData?clientId=${storeId}&camId=${camId}&timeLineDate=${tlSelectedDate}`} onError={this.heatmapimagehandle} className="live-video-image-cover video-image-loading" alt={'Heat map data not available'} />
              {
                heatMapLoadError && <div className="heatmap-overlay">
                  <span className='heatmap-overlay-text'>Heat map data not available.</span>
                </div>
              }
            </div>}

          <DateRangePicker
            isOpen={openDateRangePicker}
            onClose={this.closeDateRangePicker}
            onSelect={this.openGridSearch}
            camData={config}
            startDuration={startDuration}
            endDuration={endDuration}
            ontimeLine={true}

          />
          {this.state.bookmarkModal && <div className={"timeline-modal2"}>
            <Modal isOpen={this.state.bookmarkModal} className={"modal-style"}>
              <ModalHeader toggle={() => this.closeModal()}>Bookmark - {form && form.bookmarkName}</ModalHeader>
              <ModalBody>
                {error.dateTimeLargeMessage && <span className={'text-danger'}>{error.dateTimeLargeMessage}</span>}
                <Form>
                  <FormGroup row>
                    <Label sm={2}>Date/Time</Label>
                    <Col sm={10}>
                      <DatePicker
                        name="bookmarkDate"
                        id="bookmarkDate"
                        dateFormat="MM/dd/yyyy h:mmaa"
                        selected={(form && form.bookmarkDate) || clickTime}
                        onChange={(e) => this.changeHandler(e, 'bookmarkDate')}
                        timeInputLabel="Bookmark Time:"
                        showTimeInput
                        className="form-control"
                        placeholderText='Bookmark Date/Time'
                        minDate={moment((form && form.bookmarkDate) || clickTime)}
                        maxDate={new Date()}
                      />
                    </Col>
                  </FormGroup>
                  <FormGroup row>
                    <Label for="bookmarkName" sm={2}>Name <span className={'text-danger'}>*</span></Label>
                    <Col sm={10}>

                      <Input type="text" value={form && form.bookmarkName} onChange={(e) => this.changeHandler(e)}
                        name="bookmarkName" id="bookmarkName" placeholder="Please enter Bookmark name" />
                      {error.bookmarkName && <span className={'text-danger'}>Bookmark name is blank!</span>}
                    </Col>
                  </FormGroup>
                  <FormGroup row>
                    <Label for="bookmarkType" sm={2}>Type<span className={'text-danger'}>*</span></Label>
                    <Col sm={10}>
                      <Select
                        isClearable={true}
                        name="bookmarkType"
                        id="bookmarkType"
                        value={form && form.bookmarkType}
                        options={utils.selectOptionGenerator(bookmarkType)}
                        placeholder='Bookmark Type'
                        onChange={(e) => this.changeHandler(e, 'bookmarkType')}
                        className="custom-select-list"
                      />
                      {error.bookmarkType && <span className={'text-danger'}>Bookmark type is blank!</span>}
                    </Col>
                  </FormGroup>
                  <FormGroup row>
                    <Label for="bookmarkDescription" sm={2}>Notes</Label>
                    <Col sm={10}>
                      <Input type="textarea" value={form && form.bookmarkDescription} onChange={(e) => this.changeHandler(e)} name="bookmarkDescription" id="bookmarkDescription" placeholder="Please enter bookmark description" />
                    </Col>
                  </FormGroup>
                </Form>
              </ModalBody>
              <ModalFooter>
                <Button color="primary" onClick={() => this.submitBookmark()}>Save</Button>{' '}
                {form && form.id > -1 && form.id != null && <Button color="danger" onClick={() => this.deleteBookmark(form.id)}>Delete</Button>}
                <Button color="secondary" onClick={() => this.closeModal()}>Cancel</Button>
              </ModalFooter>
            </Modal>
          </div>}
        </div>
      </>
    );
  }
}

function mapStateToProps(state, ownProps) {
  return {
    saveBookmark: state.saveBookmark,
    deleteBookMarkData: state.deleteBookMarkData,
    getEventFeedTimeline: state.getEventFeedTimeline,
    getReceipt: state.getReceipt,
    liveCamFullscreenStatus: state.liveCamFullscreenStatus,
    selectedCameraData: state.selectedCameraData,
    getCombos: state.getCombos
  };
}

var TimelinePlayerModule = connect(mapStateToProps)(TimelinePlayer);
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



class TimelineWarpper extends React.Component {

  render() {
    const { cameratype, onClickFab, onAction, width, height, storeId, connected, camId, isHeatMapCamera, timelinePlayer, isNvrOrRex, recordingStreamId, primaryCameraId, onClose, playBackCount, cameraName, isAntMedia, mediaServerUrl, mediaServerOutboundPort, config } = this.props;
    console.log('TimelineWarpper');
    return (
      timelinePlayer && timelinePlayer.isPlay &&
      // <Modal isOpen={true}>
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
        playBackCount={playBackCount}
        camName={cameraName}
        isAntMedia={isAntMedia}
        mediaServerUrl={mediaServerUrl}
        mediaServerOutboundPort={mediaServerOutboundPort}
        cameratype={cameratype}
        config={config}


      />
      // </Modal>
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

