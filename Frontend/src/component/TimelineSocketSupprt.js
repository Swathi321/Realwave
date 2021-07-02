import React from 'react';
import io from 'socket.io-client';
import utils from './../Util/Util';
import moment from 'moment';
import swal from 'sweetalert';
import { getBookMarks } from '../redux/actions/httpRequest';

const actiontype = {
  Timeline: "Timeline",
  VideoPublishing: "VideoPublishing",
  VideoPublished: "VideoPublished",
  VideoFinished: "VideoFinished",
  VideoFailed: "VideoFailed",
  Playback: "Playback",
  PlaybackUrl: "PlaybackUrl",
  HubNotConnected: 'HubNotConnected',
  PlaybackSpeed: 'PlaybackSpeed',
  PlaybackState: 'PlaybackState',
  PlaybackTimeStamp: 'PlaybackTimeStamp'
}
const maxMinutesForStart = 60;

class TimelineSocketSupprt extends React.Component {
  //socketClient = null;
  //clientId = null;

  constructor(props) {
    super(props);
    this.typeMethod = "playback";
    this.onPlayback = this.onPlayback.bind(this);
    this.onRequestTimelout = this.onRequestTimelout.bind(this);

    this.requestTimeout = null;
    this.isUnmounted = false;
    this.timeout = 60 * 1000;
    this.restartPlayerTimeout = null;

    this.isBookmarkRequestCanceled = false;
    this.bookmarkRequestRetryCount = 0;
    this.bookmarkPage = 1;
    this.bookmarkLimit = 500;
  }

  get isSearchRequest() {
    const { startDate, endDate } = this.props.timelinePlayer;
    return !utils.isEmpty(startDate) && !utils.isEmpty(endDate)
  }

  get hasCustomTime() {
    let toReturn = false;
    try {
      return this.timeline.getCustomTime('t1');
    } catch {
      return null;
    }
  }

  onUnmount() {
    this.socketClient.disconnect();
    this.socketClient.close();
    clearTimeout(this.requestTimeout);
    this.isUnmounted = true;
  }

  componentWillUnmount() {
    clearTimeout(this.restartPlayerTimeout);
    clearTimeout(this.bookmarkRequestTimeout);
    //this.isBookmarkRequestCanceled = true;
    if (this.bookMarkRequestAbort) {
      this.bookMarkRequestAbort.abort();
    }
    this.onUnmount();
  }

  componentWillMount() {
    const { storeId, isMultiple } = this.props;
    let me = this;
    me.clientId = utils.guid();
    let socketUri = `${utils.serverUrl}?type=client&storeId=${storeId}&clientId=${me.clientId}`;
    me.socketClient = io(socketUri);
    me.socketClient.on('connect', me.onConnect);
    me.socketClient.on('disconnect', me.onDisconnect);
    me.socketClient.on(this.typeMethod, me.onPlayback);
    if (isMultiple) {
      window.addEventListener("beforeunload", (ev) => {
        me.onUnmount();
      });
    }
  }

  onConnect = (evt) => {
    console.log(`onConnect ${this.clientId}`);
    let { storeId, camId, timelinePlayer, isNvrOrRex, recordingStreamId, primaryCameraId } = this.props;
    const { startDate, endDate } = timelinePlayer;

    let options = {
      camId: camId
    }

    if (startDate && endDate) {
      options.startDate = startDate
      options.endDate = endDate
    }

    if (isNvrOrRex) {
      options.recordingStreamId = recordingStreamId;
      options.primaryCameraId = primaryCameraId;
    }
    this.requestTimeline(options);
  }

  onDisconnect = (evt) => {
    console.log(`Disconnect ${this.clientId}`);
  }

  alert = (evt) => {
    let alertMsg = '';
    if (this.props.camName) {
      alertMsg = evt.message ? (`${this.props.camName}:` + evt.message) : `${this.props.camName}: No video available.`;
    }
    else {
      alertMsg = evt.message || 'No video available.';
    }
    swal({
      title: `Can't play video`,
      text: alertMsg,
      icon: 'error'
    }).then(() => {
      this.setState({ showSpinner: false });
    });
  }

  processTimelineData(record) {
    let minCount = 0
    for (let i = record.length; i > 0; i--) {
      let data = record[i - 1];
      let mins = moment(data.end).diff(moment(data.start), 'minutes');
      if (mins + minCount > maxMinutesForStart) {
        let subMin = mins > maxMinutesForStart ? maxMinutesForStart : (maxMinutesForStart - minCount)
        return moment(data.end).subtract(subMin, 'minutes');
      }
      else {
        minCount += mins;
      }
    }
    return record[0].start;
  }

  initialTime = (rc = []) => {
    const { isNvrOrRex } = this.props;
    let records = [];
    records = rc.sort((a, b) => new Date(a.start) - new Date(b.start));
    if (this.isSearchRequest) {
      return records[0].start;
    } else {
      let playDate = moment().format('YYYY-MM-DD');
      let start = records[0].start;
      let end = records[records.length - 1].end;

      if (!moment(playDate).isBetween(start, end)) {
        playDate = moment(end).format('YYYY-MM-DD');
      }
      let tempRecord = records.filter(e => moment(e.start).format('YYYY-MM-DD') == playDate || moment(e.end).format('YYYY-MM-DD') == playDate);
      if (tempRecord && tempRecord.length > 0) {
        return this.processTimelineData(tempRecord);
      } else {
        return this.processTimelineData(records);
      }
    }
  }

  sleep = ms => {
    return new Promise(resolve => setTimeout(resolve, ms))
  }

  setTimelineData = (data) => {
    let me = this;
    let recordPerDataSet = 1000;
    let sleepTime = 100; //Milliseconds
    let tempRecords = [];
    return new Promise(async resolve => {
      let count = 0;
      let start = moment();
      let canAdd = false;
      for (let index = 0; index < data.length; index++) {
        //Break Process if component is unmounted
        if (me.isUnmounted) {
          break;
        }
        const item = data[index];
        console.log(`Adding: ${item.id}`);
        tempRecords.push(item);
        //me.visDataSet.add(item);
        if (count == recordPerDataSet) {
          count = 0;
          console.log(`${index}. Timeline loading`);
          canAdd = true
        }
        if (canAdd || data.length - 1 == index) {
          me.visDataSet.add(tempRecords);
          me.timeline.fit();
          tempRecords = [];
          await this.sleep(sleepTime);
        }
        count++;
      }
      console.log(`Timeline Data Set Time: ${moment.duration(moment().diff(start)).asSeconds()}`)
      resolve(null);
    });
  }

  // bookMarkRequest = async (page, pageSize) => {
  //   let me = this;
  //   if (this.bookmarkRequestRetryCount > 3) {
  //     console.error("bookMark Request maximum limit exceeded");
  //     return;
  //   }

  //   if (this.isBookmarkRequestCanceled) {
  //     return;
  //   }

  //   // get bookmark event
  //   this.props.dispatch(getBookMarks.request(Object.assign({}, this.bookmarkRequestOption, {
  //     pageSize: pageSize,
  //     page: page
  //   }), null, null, (res) => {

  //     if (this.isBookmarkRequestCanceled) {
  //       return;
  //     }

  //     if (res.success) {

  //       if (utils.isEmpty(this.bookmarkTotal)) {
  //         this.bookmarkTotal = res.total;
  //       }

  //       let totalPages = Math.ceil(this.bookmarkTotal / this.bookmarkLimit);

  //       me.bookmarkPage++;
  //       this.processBookmarkData(res.data, () => {
  //         // if(condistion to skip or end request)
  //         if (totalPages >= me.bookmarkPage) {
  //           this.bookMarkRequest(this.bookmarkPage, this.bookmarkLimit);
  //         }
  //       });
  //     } else {
  //       this.bookmarkRequestRetryCount++;
  //       this.bookMarkRequest(this.bookmarkPage, this.bookmarkLimit);
  //     }
  //   }));
  // }

  bookMarkRequest = async () => {
    this.isBookmarkRequestCanceled = true;
    if (this.bookMarkRequestAbort) {
      this.bookMarkRequestAbort.abort();
    }
    this.bookMarkRequestAbort = new AbortController();

    // get bookmark event
    this.props.dispatch(getBookMarks.request(this.bookmarkRequestOption, null, null, (res) => {
      this.isBookmarkRequestCanceled = false;
      if (res.success) {
        this.processBookmarkData(res.data);
      } else {
        console.error("Bookmark request error");
      }
    }));
  }

  onPlayback = async (evt) => {
    clearTimeout(this.requestTimeout);
    let { camId, recordingStreamId, primaryCameraId, isNvrOrRex, storeId } = this.props;
    let me = this;
    let videoData = [];
    if (this.clientId === evt.clientId) {
      switch (evt.action) {
        case actiontype.Timeline:
          if (me.timeline.itemsData.length > 0) {
            console.log('Timeline already built');
            return;
          }
          console.log(`VideoTimeline Id:${evt.clientId}--------------------------`);
          if (evt.success) {
            if (evt.EventData && evt.EventData && evt.EventData.invoice && evt.EventData.invoice.length > 0 && evt.TimeZoneOffset && evt.CurrentDateTime) {
              this.setState({ EventData: evt.EventData, timeZoneOffsetValue: evt.TimeZoneOffset, currentServerTime: evt.CurrentDateTime });
            }
            if (evt.data) {
              videoData = this.timelineDataFormat(evt.data);
            }
            if (videoData.length == 0) {
              this.alert(evt);
              return;
            }

            // // Sample data for test timeline with large data
            // videoData = [];
            // let now = moment();
            // for (let index = 0; index < 5000; index++) {
            //     now = now.add('seconds', 600);
            //     let start = moment(now).toDate();
            //     let end = moment(start).add('seconds', 1).toDate();

            //     videoData.push({
            //         id: index,
            //         group: 1,
            //         type: "background",
            //         //title: start,
            //         //selectedTime: start,
            //         //endTime: end,
            //         //duration: duration,
            //         start: start,
            //         end: end
            //     });
            // }

            //await me.setTimelineData(videoData);
            me.visDataSet.add(videoData);

            let emptySegment = [];

            for (let index = 0; index < videoData.length; index++) {
              const first = videoData[index];
              let second = index + 1 <= videoData.length ? videoData[index + 1] : null;
              if (second) {

                let start = moment(second.start);
                let end = moment(first.end);

                let diff = Math.abs(start.diff(end, 'seconds'));
                if (diff > 0) {
                  emptySegment.push({
                    start: end.toDate(),
                    end: start.toDate(),
                    jump: diff
                  });
                }
              }
            }

            let initialDateTime = moment(this.initialTime(videoData), "YYYY-MM-DD hh:mm:ss A");
            if (isNvrOrRex) {
              initialDateTime = moment(initialDateTime).add('seconds', 2)
            }
            initialDateTime = initialDateTime.format('YYYY/MM/DD hh:mm:ss A');
            if (videoData.length > 0) {
              setTimeout(() => {
                me.timeline.focus();
                //me.timeline.fit();
                this.timeline.addCustomTime(initialDateTime, 't1');
                this.timeline.setCustomTimeMarker(moment(initialDateTime).format('LTS'), 't1');
                me.timeline.setWindow(moment(initialDateTime).add(-24, "hour").toDate(), moment(initialDateTime).toDate());
              }, 1000);
            }
            this.setState({ videoData: videoData, startedTime: initialDateTime, emptySegment: emptySegment });


            // let startDate = moment(initialDateTime).add(-24, "hour").format('YYYY/MM/DD hh:mm:ss A');
            // let endDate = moment(initialDateTime).format('YYYY/MM/DD hh:mm:ss A');

            // this.lastBookmarkRequestedDate.startDate = startDate;
            // this.lastBookmarkRequestedDate.endDate = endDate

            let startDate = moment(videoData[0].start, "YYYY-MM-DD hh:mm:ss A").startOf('day').format('YYYY/MM/DD hh:mm:ss A');
            let endDate = moment(initialDateTime).endOf('day').format('YYYY/MM/DD hh:mm:ss A');

            this.bookmarkRequestOption = {
              action: 'list',
              camId: camId,
              storeId: storeId,
              startDate: startDate,
              endDate: endDate
            }

            // get bookmark event
            //me.props.dispatch(getBookMarks.request({ action: 'list', camId: camId, storeId: storeId, startDate: startDate, endDate: endDate }));
            this.bookMarkRequest();

            me.requestPlayback({
              recordingStreamId: recordingStreamId || 0,
              primaryCameraId: primaryCameraId || 0,
              camId: camId,
              time: initialDateTime // "2020/09/08 10:37:00 AM"
            });
            this.handleMouseMove();
          } else {
            this.alert(evt);
          }
          break;
        case actiontype.VideoPublishing:
          console.log(`VideoPublished Id:${evt.clientId}--------------------------`);
          console.log("Video Start Publishing ID:" + evt.clientId);
          this.requestTimeout = setTimeout(this.onRequestTimelout, this.timeout);
          break;
        case actiontype.VideoPublished:
          console.log(`VideoPublished Id:${evt.clientId}--------------------------`);
          this.setState({ published: true, showSpinner: false });
          break;
        case actiontype.VideoFinished:
          console.log(`VideoFinished Id:${evt.clientId}--------------------------`);
          break;
        case actiontype.VideoFailed:
          console.log(`VideoFailed Id:${evt.clientId}--------------------------`);
          this.setState({ published: false, showSpinner: false }, () => {
            swal({ title: `Stop`, text: evt.message || 'Playback not able to start, Please try again', icon: 'error' }).then(() => {
              const { onClose } = this.props;
              onClose && onClose();
            });
          });
          break;
        case actiontype.PlaybackUrl:
          console.log(`PlaybackUrl Id:${evt.clientId}--------------------------`);
          console.log(`Video URL: ${evt.playUrl}`);
          let option = { requestId: evt.requestId, videoURL: evt.playUrl, videoToken: evt.token, streamId: evt.streamId };
          // if (isNvrOrRex) {
          //     option.published = true;
          // }
          this.setState(option, () => {
            this.requestTimeout = setTimeout(this.onRequestTimelout, this.timeout);
          });
          break;
        case actiontype.HubNotConnected:
          console.log(`HubNotConnected Id:${evt.clientId}--------------------------`);
          this.alert({ message: "Hub is not connected" });
          break;
        case actiontype.PlaybackTimeStamp:
          if (this.onTimeUpdate && this.state.requestId == evt.requestId && !this.state.showSpinner) {
            this.onTimeUpdate({ target: { currentTime: evt.message, playbackTimeStamp: true } })
          }
          break;
        default:
          console.log(`Invalide Response ${JSON.stringify(evt)}`);
          break;
      }
    }
  }

  onRequestTimelout = () => {
    if (!this.isUnmounted) {
      swal({
        title: this.props.camName ? `${this.props.camName}: Request timeout` : `Request timeout`,
        text: 'Rex/Server not responding, please try again.',
        icon: 'error'
      }).then(() => {
        this.setState({ showSpinner: false }, () => {
          const { onClose } = this.props;
          onClose && onClose();
        });
      });
    }
  }

  restartPlayer() {
    clearTimeout(this.restartPlayerTimeout);
    let videoURL = this.state.videoURL;
    if (!this.props.isAntMedia) {
      this.restartPlayerTimeout = setTimeout(() => {
        this.setState({ videoURL: null }, () => {
          this.setState({ videoURL: videoURL });
        });
      });
    }
  }

  setPlaybackSpeed(option) {
    const { storeId, primaryCameraId, recordingStreamId } = this.props;
    const { requestId } = this.state;
    let data = {
      type: 'request',
      requestType: actiontype.PlaybackSpeed,
      clientId: this.clientId,
      storeId: storeId,
      camId: option.camId,
      requestId: requestId,
      recordingStreamId: recordingStreamId,
      primaryCameraId: primaryCameraId
    }
    data = Object.assign({}, data, option);
    this.socketClient.emit(this.typeMethod, data);
    console.log(`Playback Speed ${JSON.stringify(data)}`);
    this.restartPlayer();
  }


  setPlaybackState(option) {
    const { storeId, primaryCameraId, recordingStreamId } = this.props;
    const { requestId } = this.state;
    let data = {
      type: 'request',
      requestType: actiontype.PlaybackState,
      clientId: this.clientId,
      storeId: storeId,
      camId: option.camId,
      requestId: requestId,
      recordingStreamId: recordingStreamId,
      primaryCameraId: primaryCameraId
    }
    data = Object.assign({}, data, option);
    this.socketClient.emit(this.typeMethod, data);
    console.log(`Playback Speed ${JSON.stringify(data)}`);
    this.restartPlayer();
  }

  requestPlayback(option) {
    clearTimeout(this.restartPlayerTimeout);
    const { storeId } = this.props;
    this.setState({ published: false, showSpinner: true });
    let data = {
      type: 'request',
      requestType: actiontype.Playback,
      clientId: this.clientId,
      storeId: storeId,
      camId: option.camId
    }
    data = Object.assign({}, data, option);
    this.socketClient.emit(this.typeMethod, data);
    console.log(`Request Playback ${JSON.stringify(data)}`);
    clearTimeout(this.requestTimeout);
    this.requestTimeout = setTimeout(this.onRequestTimelout, this.timeout);
  }

  requestTimeline(option) {
    clearTimeout(this.restartPlayerTimeout);
    const { storeId } = this.props;
    let data = {
      type: 'request',
      requestType: actiontype.Timeline,
      clientId: this.clientId,
      storeId: storeId
    }
    data = Object.assign({}, data, option);
    console.log(`Request Playback ${JSON.stringify(data)}`);
    this.socketClient.emit(this.typeMethod, data);
    this.requestTimeout = setTimeout(this.onRequestTimelout, this.timeout);
  }
}
export default TimelineSocketSupprt;

