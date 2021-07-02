import React, { PureComponent } from 'react';
import { getReceiptClip, getCameraClipData } from '../../redux/actions/httpRequest';
import { connect } from 'react-redux';
import { Modal, ModalHeader, ModalBody, Spinner } from 'reactstrap';
import CameraCard from '../../component/CameraCard';
import moment from 'moment';
import LiveCameraCard from '../../component/LiveCameraCard';
import util from '../../Util/Util';
import common from '../../common';
import ReactLoading from 'react-loading';

export class TopVideoClips extends PureComponent {
  constructor() {
    super();
    this.state = {
      data: [],
      currentReceipt: null,
      backgroundStatus:true
    }
  }

  componentDidMount() {
    let params = {
      page: 0,
      pageSize: 5,
      populate: "",
      sort: undefined,
      sortDir: undefined,
      filter: {},
      Category: [],
      NoCategory: [],
      combos: '',
      selectedOptionVal: {},
      isFromEventFeed: true
    };
    params = util.updateSiteAndTagsFilter(this, params);
    this.props.dispatch(getCameraClipData.request(params));
  }

  componentWillReceiveProps(nextProps) {

    if (nextProps['getReceiptClip'] !== this.props['getReceiptClip']) {
      let { data, error, isFetching } = nextProps['getReceiptClip'];
      let valid = common.responseHandler(data, error, isFetching);
      if (valid) {
        this.setState({ isOpen: true, currentReceipt: data.data });
      }
    }

    if ((nextProps['getCameraClipData'] && nextProps['getCameraClipData'] !== this.props['getCameraClipData'])) {
      const { data, isFetching } = nextProps['getCameraClipData'];
      if (!isFetching && data) {
        this.setState({ data: data.data });
      }
    }
  }

  onSelectReceipt(row) {
    if (row.IsVideoAvailable) {
      const {checkedStatus}=this.props
      // this.setState({ isOpen: true, isCommentBox: false, currentReceipt: row });
      this.props.dispatch(getReceiptClip.request({ modelName: 'realwaveVideoClip', fromVideoSceen: true, ViewedOn: (new Date()).toISOString(), Id: row._id, }));
      checkedStatus(this.state.backgroundStatus)
    }
  }
  setDataState=()=>{
    const {checkedStatus}=this.props
    this.setState({ isOpen: false })
    checkedStatus(!this.state.backgroundStatus)
  }

  render() {
    const { data, currentReceipt, isOpen } = this.state;
    const { getCameraClipData, storeChange ,checkedStatus } = this.props;
    let isFetching = getCameraClipData.isFetching;
    let videoClipsData = storeChange.selectedStore.length > 0 && data || [];
    return (videoClipsData && videoClipsData.length && !isFetching > 0 ?
      <div>
        {
          videoClipsData.map(function (item, index) {
            item.image = util.serverUrl + "/api2/eventVideoThumbnail?tid=" + item._id + "&EventTime=" + moment(item.StartTime).toISOString() + "&modelName=realwaveVideoClip"
            return (
              <CameraCard
                onClick={() => this.onSelectReceipt(item)}
                className="cursor"
                key={index} xs={12} sm={6} md={6} lg={3}
                transactionNumber={item._id}
                status={item.Status}
                height={"250px"}
                register={item.Register}
                imagePath={item.image}
                IsVideoAvailable={item.IsVideoAvailable}
                IsImageAvailable={item.IsImageAvailable}
                item={item}
                index={index}
                isFromDashboard
              />
            )
          }, this)
        }
        {currentReceipt && !isFetching && currentReceipt.event && <Modal isOpen={isOpen} className={"popup-sales video-modal"} size="lg">
          <ModalHeader className="widgetHeaderColor" toggle={() => this.setDataState()}>{" Register " + (currentReceipt.event.Register || '') + "-" + moment(currentReceipt.event.EventTime).format(util.dateFormat)}</ModalHeader>
          <ModalBody className="reorderBody">
            <LiveCameraCard className="receipt-popup" data={currentReceipt} hideReceipt={this.props.hideReceipt || false} overVideoReceipt={true} downloadVideo={true} modelName={'realwaveVideoClip'} />
          </ModalBody>
        </Modal>}
      </div > : isFetching ? <div id="overlay"><div id="overlay-loader"><ReactLoading type={'bars'} color={'#ffffff'} height={50} width={50} /></div></div> : <p className="empty-result">No result found</p>
    );
  }
}

function mapStateToProps(state, ownProps) {
  return {
    getReceiptClip: state.getReceiptClip,
    storeChange: state.storeChange,
    getCameraClipData: state.getCameraClipData
  };
}

var TopVideoClipsModule = connect(mapStateToProps)(TopVideoClips);
export default TopVideoClipsModule;
