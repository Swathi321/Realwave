import React, { PureComponent } from 'react';
import { getEventFeed, getReceipt, getCameraData } from '../../redux/actions/httpRequest';
import { connect } from 'react-redux';
import { Modal, ModalHeader, ModalBody, Spinner } from 'reactstrap';
import CameraCard from '../../component/CameraCard';
import moment from 'moment';
import LiveCameraCard from '../../component/LiveCameraCard';
import util from '../../Util/Util';
import common from '../../common';
import ReactLoading from 'react-loading';


export class TopEvent extends PureComponent {
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
    this.props.dispatch(getEventFeed.request(params));
    this.props.dispatch(getCameraData.request(params));
  }

  componentWillReceiveProps(nextProps) {
    if ((nextProps['getEventFeed'] && nextProps['getEventFeed'] !== this.props['getEventFeed'])) {
      const { data, isFetching } = nextProps['getEventFeed'];
      if (!isFetching && data) {
        this.setState({ data: data.data });
      }
    }

    if (nextProps['getReceipt'] !== this.props['getReceipt']) {
      let { data, error, isFetching } = nextProps['getReceipt'];
      let valid = common.responseHandler(data, error, isFetching);
      if (valid) {
        this.setState({ isOpen: true, currentReceipt: data.data });
      }
    }

    if ((nextProps['getCameraData'] && nextProps['getCameraData'] !== this.props['getCameraData'])) {
      const { data, isFetching } = nextProps['getCameraData'];
      if (!isFetching && data) {
        this.setState({ data: data.data });
      }
    }
  }

  onSelectReceipt(row) {
   
    const {checkedStatus}=this.props
    if (row.IsVideoAvailable) {
      // this.setState({ isOpen: true, isCommentBox: false, currentReceipt: row });
      this.props.dispatch(getReceipt.request({ InvoiceId: row.InvoiceId }));
      checkedStatus(this.state.backgroundStatus)
    }
  }
  setDataState=()=>{
    const {checkedStatus}=this.props
    this.setState({ isOpen: false })
    checkedStatus(!this.state.backgroundStatus)}

  render() {
    
    const { data, currentReceipt, isOpen } = this.state;
    const { getEventFeed, getCameraData, storeChange ,checkedStatus} = this.props;
    let isFetching = getEventFeed.isFetching || getCameraData.isFetching;
    let eventData = storeChange.selectedStore.length > 0 && data || [];
    return (eventData && eventData.length && !isFetching > 0 ?
      <div>
        {
          eventData.map(function (item, index) {
            item.image = util.serverUrl + "/api2/eventVideoThumbnail?tid=" + item._id + "&EventTime=" + item.EventTime;
            return (
              <CameraCard
                onClick={() => this.onSelectReceipt(item)}
                className="cursor"
                key={item.InvoiceId + '_' + item.EventId} xs={12} sm={6} md={6} lg={3}
                transactionNumber={item.InvoiceId}
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
        {currentReceipt && currentReceipt.event && <Modal isOpen={isOpen} className={"popup-sales video-modal"} size="lg">
          <ModalHeader className="widgetHeaderColor" toggle={() => this.setDataState()}>{" Register " + (currentReceipt.event.Register || '') + "-" + moment(currentReceipt.event.EventTime).format(util.dateFormat)}</ModalHeader>
          <ModalBody className="reorderBody">
            <LiveCameraCard className="receipt-popup" data={currentReceipt} hideReceipt={this.props.hideReceipt || false} overVideoReceipt={true} downloadVideo={true} modelName="event" />
          </ModalBody>
        </Modal>}
      </div > : isFetching ? <div id="overlay"><div id="overlay-loader"><ReactLoading type={'bars'} color={'#ffffff'} height={50} width={50} /></div></div> : <p className="empty-result">No result found</p>
    );
  }
}

function mapStateToProps(state, ownProps) {
  return {
    getEventFeed: state.getEventFeed,
    getReceipt: state.getReceipt,
    storeChange: state.storeChange,
    getCameraData: state.getCameraData
  };
}

var TopEventModule = connect(mapStateToProps)(TopEvent);
export default TopEventModule;
