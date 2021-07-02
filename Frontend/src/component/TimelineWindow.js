import React, { PureComponent } from 'react';
import { connect } from 'react-redux';
import TimelinePlayerSync from './TimelinePlayerSync';
import { timelinePlayer } from '../redux/actions';
import { Col, Row, Card, CardBody } from 'reactstrap';
import TimelineSocketSupprt from './TimelineSocketSupprt';
import utils from './../Util/Util';
import io from 'socket.io-client';
import moment from 'moment';
import swal from 'sweetalert';
import { getBookMarks, storesData } from '../redux/actions/httpRequest';
const loader = require('./../../src/assets/img/loader.gif');

const actiontype = {
  Timeline: "Timeline",
  VideoPublishing: "VideoPublishing",
  VideoPublished: "VideoPublished",
  VideoFinished: "VideoFinished",
  VideoFailed: "VideoFailed",
  Playback: "Playback",
  PlaybackUrl: "PlaybackUrl",
  HubNotConnected: 'HubNotConnected',
  PlaybackSpeed: 'PlaybackSpeed'
}
const maxMinutesForStart = 60;

class TimelineWindow extends React.Component {
  constructor(props) {
    super(props);
    this.typeMethod = "syncPlayback";
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
      initialDateTime: null
    };
    this.timeline = null;
    this.timelineBookMark = null;
    this.onPlayback = this.onPlayback.bind(this);
    this.onRequestTimelout = this.onRequestTimelout.bind(this);

    this.requestTimeout = null;
    this.isUnmounted = false;
    this.timeout = 60 * 1000;
    this.restartPlayerTimeout = null;
  }
  onPlaybackSpeedChange = (value, fromTimelineChange) => {
    if (fromTimelineChange) {
      this.setPlaybackSpeed({ speed: value });
    } else {
      this.setState({ playbackSpeed: value.target.id });
      this.setPlaybackSpeed({ speed: value.target.id });
    }
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
    this.onUnmount();
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
        start: moment(start).toDate(),
        end: moment(end).toDate(),
      });
    }

    return tempData;
  }
  onPlayback = (evt) => {
    clearTimeout(this.requestTimeout);
    let { camId, recordingStreamId, primaryCameraId, isNvrOrRex } = this.props;
    let me = this;
    let videoDataCam = [];
    let camInfo = [], initialDateTime;
    if (this.clientId === evt.clientId) {
      switch (evt.action) {
        case actiontype.Timeline:
          let { storeData, timelinePlayer } = this.props;
          const { data } = storeData;
          const storeId = this.props.match.params.storeId;

          if (me.timeline && me.timeline.itemsData && me.timeline.itemsData.length > 0) {
            console.log('Timeline already built');
            return;
          }
          console.log(`VideoTimeline Id:${evt.clientId}--------------------------`);
          if (data != null && evt.success && evt.camInfo && data.data) {
            evt.camInfo.forEach((element, index) => {
              let camData = data.data.find(x => x._id === element.camId);

              if (evt.EventData && evt.EventData && evt.EventData.invoice && evt.EventData.invoice.length > 0 && evt.TimeZoneOffset && evt.CurrentDateTime) {
                this.setState({ EventData: evt.EventData, timeZoneOffsetValue: evt.TimeZoneOffset, currentServerTime: evt.CurrentDateTime });
              }
              videoDataCam = this.timelineDataFormat(element.data);
              if (videoDataCam.length == 0) {
                camData.data = [];
                camInfo.push(camData);
                this.setState({ videoData: camInfo });
                return;
              }
              camData.data = videoDataCam;
              let emptySegment = [];

              for (let index = 0; index < videoDataCam.length; index++) {
                const first = videoDataCam[index];
                let second = index + 1 <= videoDataCam.length ? videoDataCam[index + 1] : null;
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
              if (index == 0) {
                initialDateTime = moment(this.initialTime(videoDataCam));
                if (isNvrOrRex) {
                  initialDateTime = moment(initialDateTime).add('seconds', 2)
                }
                initialDateTime = initialDateTime.format('YYYY/MM/DD hh:mm:ss A');
              }
              camData.initialDateTime = initialDateTime;
              camData.emptySegment = emptySegment;
              camInfo.push(camData);
            });
            this.setState({ videoData: camInfo, initialDateTime: initialDateTime });
            me.requestPlaybackSync({ initialDateTime: initialDateTime });
          } else {

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
          let { videoData } = this.state;
          videoData.forEach((item, index) => {
            let element = evt.playbackCamInfo.filter(e => e.camId == item._id)[0];
            if (element) {
              let option = {
                requestId: evt.requestId,
                videoURL: element.playUrl, videoToken: element.token,
                streamId: element.streamId, published: true
              };
              videoData[index] = Object.assign({}, videoData[index], option);
            }
          });
          this.setState({ videoData: videoData, published: true }, () => {
            this.requestTimeout = setTimeout(this.onRequestTimelout, this.timeout);
          });
          break;
        case actiontype.HubNotConnected:
          console.log(`HubNotConnected Id:${evt.clientId}--------------------------`);
          this.alert({ message: "Hub is not connected" });
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
    const { storeId } = this.props;
    const { requestId } = this.state;
    let data = {
      type: 'request',
      requestType: actiontype.PlaybackSpeed,
      clientId: this.clientId,
      storeId: storeId,
      camId: option.camId,
      requestId: requestId
    }
    data = Object.assign({}, data, option);
    this.socketClient.emit(this.typeMethod, data);
    console.log(`Playback Speed ${JSON.stringify(data)}`);
    this.restartPlayer();
  }

  requestPlayback(option) {
    clearTimeout(this.restartPlayerTimeout);
    const { storeId } = this.props;
    this.setState({ published: false, showSpinner: true, initialDateTime: option.time });
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
  componentWillMount() {
    const { isMultiple, storeData } = this.props;
    let storeId = this.props.match.params.storeId;
    let me = this;
    const { data } = storeData;
    if (data == null) {
      this.props.dispatch(storesData.request({ stores: [] }, null, null, (response) => {
        me.clientId = utils.guid();
        this.socketUri = `${utils.serverUrl}?type=client&storeId=${storeId}&clientId=${me.clientId}`;
        me.socketClient = io(this.socketUri);
        me.socketClient.on('connect', me.onConnect);
        me.socketClient.on('disconnect', me.onDisconnect);
        me.socketClient.on(this.typeMethod, me.onPlayback);
        this.props.dispatch(timelinePlayer({
          isPlay: true
        }));
      }));
    }

  }
  onConnect = (evt) => {
    console.log(`onConnect ${this.clientId}`);
    let { camId, timelinePlayer } = this.props;
    let { storeData } = this.props;
    const { data } = storeData;

    const { startDate, endDate } = timelinePlayer;
    let camInfo = [];
    const selectedIds = this.props.match.params.ids.split(',');
    const storeId = this.props.match.params.storeId;
    let newArray = [];
    if (data && data.data.length > 0) {
      selectedIds.forEach((item, index) => {
        let camData = data.data.find(x => x._id === item);
        if (camData) {
          camInfo.push({
            primaryCameraId: camData.primaryCameraId || 0,
            recordingStreamId: camData.recordingStreamId || 0,
            startTime: startDate,
            endTime: endDate,
            camId: camData._id
          })
        }
      });
      let options = {
        playbackCamInfo: camInfo,
        storeId: storeId
      }
      this.requestTimeline(options);
    }
  }

  requestPlaybackSync = (option) => {
    let camInfo = [];
    let { videoData } = this.state;
    let { storeData, timelinePlayer } = this.props;
    const { data } = storeData;
    const { startDate, endDate } = timelinePlayer;
    const selectedIds = this.props.match.params.ids.split(',');
    const storeId = this.props.match.params.storeId;
    let requestId = 0;
    if (data && data.data.length > 0) {
      selectedIds.forEach((item, index) => {
        let camData = data.data.find(x => x._id === item);
        if (camData) {
          const requestItem = videoData.find(e => e._id == camData._id);
          let item = {
            primaryCameraId: camData.primaryCameraId,
            recordingStreamId: camData.recordingStreamId,
            startTime: startDate,
            endTime: endDate,
            camId: camData._id
          }
          if (requestItem) {
            requestId = requestItem ? requestItem.requestId : 0;
          }
          camInfo.push(item)
        }
      });
      const options = {
        time: option.initialDateTime, // "2020/09/08 10:37:00 AM"
        playbackCamInfo: camInfo,
        storeId: storeId
      }
      if (requestId) {
        options.requestId = requestId;
      }
      this.requestPlayback(options);
    }
  };

  onClickFab = () => {
    const { dispatch } = this.props;
    dispatch(timelinePlayer({
      isPlay: false,
      startDate: null,
      endDate: null
    }));
  }
  render() {
    let { storeData } = this.props;
    const { data } = storeData;
    const { videoData, published, showSpinner, initialDateTime } = this.state;
    let backgroundImage = { backgroundImage: `url(${loader})` };
    return (
      <React.Fragment>
        {videoData.length == 0 && <div className="load-video" style={backgroundImage}></div>}
        {published && videoData.length > -1 && <Col xs={12} sm={12} md={12} className="content">
          <Card>
            <CardBody>
              <Row className="layout-hide">{
                videoData.map((item, index) => {
                  let { ...rest } = videoData;
                  return (
                    <div className={videoData.length > 4 ? "col-sm-3 col-md-3" : "col-sm-6 col-md-6"} style={{ paddingBottom: 10 }} key={`multi-div-${item._id}`}>
                      <label className="syncPlaybackCameraStoreTitle" key={`multi-label-${item._id}`}>{item.storeId.name} {item.name}</label>
                      {item.data.length ? <TimelinePlayerSync
                        onClickFab={this.onClickFab}
                        storeId={item.storeId._id}
                        connected={item.storeId.isConnected}
                        camId={item._id}
                        mediaServerUrl={item.storeId.mediaServerUrl}
                        mediaServerOutboundPort={item.storeId.mediaServerOutboundPort}
                        isAntMedia={item.storeId.isAntMedia}
                        isHeatMapCamera={item.isHeatMapCamera}
                        primaryStreamId={item.primaryStreamId}
                        isNvrOrRex={item.storeId.type == "Rex" || item.storeId.type == "Nvr"}
                        isMultiple={true}
                        playBackCount={videoData.length}
                        cameraName={item.name}
                        onPlaybackSpeedChange={this.onPlaybackSpeedChange}
                        requestPlayback={this.requestPlaybackSync}
                        videoData={item.data}
                        emptySegment={item.emptySegment}
                        published={published}
                        showSpinner={showSpinner}
                        streamId={item.streamId}
                        initialDateTime={initialDateTime}
                        videoToken={item.videoToken}
                        {...rest}
                      /> :
                        <div style={videoData.length > 2 ? { width: '-webkit-fill-available', height: '40vh', textAlign: 'center', padding: '100px' } : { width: '-webkit-fill-available', height: '80vh', textAlign: 'center', padding: '100px' }}>
                          Recording Not Available
                      </div>}
                    </div>
                  )
                })
              }
              </Row>
            </CardBody>
          </Card>
        </Col>
        }
      </React.Fragment >
    )
  }
}

function mapStateToProps(state, ownProps) {
  return {
    storeData: state.storesData,
    timelinePlayer: state.timelinePlayer
  };
}

var TimelineWindowModule = connect(mapStateToProps)(TimelineWindow);
export default TimelineWindowModule;
