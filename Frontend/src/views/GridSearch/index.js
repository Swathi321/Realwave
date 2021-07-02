import React, { PureComponent } from 'react';
import { Modal, ModalHeader, ModalBody, Row, Col } from 'reactstrap';
import util from './../../Util/Util';
import api from './../../redux/httpUtil/serverApi';
import moment from 'moment';
import swal from 'sweetalert';
import io from 'socket.io-client';
import LoadingDialog from './../../component/LoadingDialog';

class Delayed extends React.Component {

  constructor(props) {
    super(props);
    this.state = { hidden: true };
  }

  componentDidMount() {
    setTimeout(() => {
      this.setState({ hidden: false });
    }, this.props.waitBeforeShow);
  }

  render() {
    return this.state.hidden ? '' : this.props.children;
  }
}

class ImageContainer extends PureComponent {

  // onError = () => {
  //   console.log("GRID_SEARCH_ImageContainer_onError");
  //   this.forceUpdate();
  // }

  encode(input) {
    var keyStr = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=";
    var output = "";
    var chr1, chr2, chr3, enc1, enc2, enc3, enc4;
    var i = 0;

    while (i < input.length) {
      chr1 = input[i++];
      chr2 = i < input.length ? input[i++] : Number.NaN; // Not sure if the index 
      chr3 = i < input.length ? input[i++] : Number.NaN; // checks are needed here

      enc1 = chr1 >> 2;
      enc2 = ((chr1 & 3) << 4) | (chr2 >> 4);
      enc3 = ((chr2 & 15) << 2) | (chr3 >> 6);
      enc4 = chr3 & 63;

      if (isNaN(chr2)) {
        enc3 = enc4 = 64;
      } else if (isNaN(chr3)) {
        enc4 = 64;
      }
      output += keyStr.charAt(enc1) + keyStr.charAt(enc2) +
        keyStr.charAt(enc3) + keyStr.charAt(enc4);
    }
    return output;
  }

  componentDidMount() {
    const { data, index } = this.props;
    let imgData = new Uint8Array(data);
    let elem = window.document.getElementById(`gs_img_tag_${index}`);
    elem.src = `data:image/png;base64,${this.encode(imgData)}`
  }

  render() {
    const { index } = this.props;
    return (
      <img
        id={`gs_img_tag_${index}`}
        ref="imgTag"
        className="grid-box"
        style={{ width: 'inherit' }}
      />
    )
  }
}

class GridSearch extends React.Component {

  constructor(props) {
    super(props);

    const { start, end } = this.props.time;

    this.state = {
      start: start,
      end: end.isValid() ? end : moment(),
      requestId: null
    }

    this.onResult = this.onResult.bind(this);
    this.isInitialRequest = false;
    this.timeout = 60 * 1000;
    this.requestTimeout = null;
  }

  onUnmount() {
    this.socketClient.disconnect();
    this.socketClient.close();
    clearTimeout(this.requestTimeout);
  }

  componentWillUnmount() {
    this.onUnmount();
  }

  componentDidMount() {
    const { storeId } = this.props;
    this.clientId = util.guid();
    let socketUri = `${util.serverUrl}?type=client&storeId=${storeId}&clientId=${this.clientId}`;
    this.socketClient = io(socketUri);
    this.socketClient.on('connect', this.onConnect);
    this.socketClient.on('disconnect', this.onDisconnect);
    this.socketClient.on('gridsearch', this.onResult);
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
    const { start, end } = this.state;
    if (!this.isInitialRequest) {
      this.isInitialRequest = true;
      this.request({ startDate: this.formatDate(start), endDate: this.formatDate(end) });
    }
  }

  onSelect = (isProcessed, start, end, event) => {
    if (event && event.target && event.target.id == "playButton") {
      return;
    }
    if (!isProcessed) {
      return;
    }

    let startTime = moment(start);
    let endTime = moment(end);
    var duration = moment.duration(endTime.diff(startTime));
    if (duration.asSeconds() <= 60) {
      return swal({ title: 'Info', text: "Cannot split screen shorter then this intervals", icon: 'info', });
    }

    this.request({ startDate: start, endDate: end });
  }

  formatDate(date) {
    return moment(date).format('MM/DD/YYYY hh:mm:ss a')
  }

  request(option) {
    clearTimeout(this.requestTimeout);
    const { requestId } = this.state;
    const { storeId, camId, isNvrOrRex, recordingStreamId, primaryCameraId } = this.props;
    let data = {
      type: 'request',
      clientId: this.clientId,
      storeId: storeId,
      camId: camId
    }
    if (requestId) {
      data.requestId = requestId;
    }
    if (isNvrOrRex) {
      data.recordingStreamId = recordingStreamId;
      data.primaryCameraId = primaryCameraId;
    }
    data = Object.assign({}, data, option);
    console.log(`Request Grid Search ${JSON.stringify(data)}`);
    this.setState({ isLoad: true, start: option.startDate, end: option.endDate });
    this.socketClient.emit('gridsearch', data);
    this.requestTimeout = setTimeout(this.onRequestTimelout, this.timeout);
  }

  onResult = (res) => {
    clearTimeout(this.requestTimeout);
    let option = {};
    if (res && res.success) {
      option = { requestId: res.requestId, data: res.data };
    } else {
      swal({ title: 'Error', text: res.message, icon: 'error' });
    }
    option.isLoad = false;
    this.setState(option);
  }

  onPlayButtonSelect = (isProcessed, start, end, event) => {
    let { onTimeLineSearch } = this.props;
    let dateRange = {};
    dateRange.start = moment(start);
    dateRange.end = moment();
    onTimeLineSearch(dateRange, "SEARCH");
  }


  render() {
    let { onClose, title } = this.props;
    const { isLoad, data, start, end } = this.state;
    return (
      <>
        <LoadingDialog isOpen={isLoad} />
        <Modal isOpen={true} className="grid-search">
          <ModalHeader toggle={onClose}>
            Grid Search - {title}
          </ModalHeader>
          <ModalBody>
            <>
              <p>
                <span>{moment(start).format('MM/DD/YYYY hh:mm:ss A')}</span>
                <span><b> - </b></span>
                <span>{moment(end).format('MM/DD/YYYY hh:mm:ss A')}</span>
              </p>
              <Row className="grid-search">
                {
                  !isLoad && data && data.map((imgData, index) => {
                    //let url = `${api.GRID_SEARCH_IMAGE}?clientId=${storeId}&image=${videos.url}&v=${util.guid()}&uid=${uid}`;
                    return (
                      <Col key={index} sm={4} md={4} lg={4} onClick={e => this.onSelect(imgData.isProcessed, imgData.startTime, imgData.endTime, e)}>
                        <ImageContainer index={index} data={imgData.imageBuffer} />
                        <i
                          ref={`imgPlayButton${index}`}
                          id="playButton"
                          className={'fa fa-play fa-2x gridPlayButton'}
                          onClick={e => this.onPlayButtonSelect(imgData.isProcessed, imgData.startTime, imgData.endTime, e)}
                        />
                      </Col>
                    )
                  })
                }
              </Row>
            </>
          </ModalBody>
        </Modal>
      </>
    )
  }
}

export default GridSearch;

