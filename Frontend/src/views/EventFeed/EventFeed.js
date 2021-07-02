import React, { PureComponent, Fragment } from 'react';
import { Row, Col, CardBody, Card, CardHeader, Button, Modal, ModalBody, FormGroup, Input, ModalHeader } from 'reactstrap';
import { connect } from 'react-redux';
import { getEventFeed, getReceipt, videoShare, updateReceipt, overlayGraphData, saveActivityLog, getCommentList, addComment } from '../../redux/actions/httpRequest';
import common from '../../common';
import Receipt from '../../component/Receipt';
import Select from 'react-select';
import LoadingDialog from './../../component/LoadingDialog';
import CommentBox from './../../component/CommentBox';
import VideoPlayerRreact from '../../component/VideoPlayerRreact';
import swal from 'sweetalert';
import EventFeedPagination from '../Pagination/EventFeedPagination';
import moment from 'moment';
import consts from '../../Util/consts';
import { Tooltip } from 'antd';
import util from '../../Util/Util';

const filterOption = [
  { value: 'NoSales', label: 'No Sales' },
  { value: 'Void', label: 'Void' },
  { value: 'SavedSales', label: 'Sales' },
  { value: 'FaceEvents', label: 'Face' },
  { value: 'Alert', label: 'Alert' },
  { value: 'CustomVideoClip', label: 'Door/Open Close event' }
]

class EventFeed extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      eventFeed: [],
      selectedReceipt: null,
      receipt: {},
      selectedOption: [],
      modal: false,
      path: null,
      errorEmail: null,
      //Pagination Params
      rows: [],
      pageSize: 12,
      page: 0,
      total: 0,
      pageTotal: 0,
      isLoading: false,
      combos: {},
      filter: [],
      filterState: false
      //END
    }

    this.onSelectReceipt = this.onSelectReceipt.bind(this);
    this.videoShare = this.videoShare.bind(this);
    this.paginate = this.paginate.bind(this);
  }

  componentWillMount() {
    this.bindStore();
  }

  //Paginate Functionality
  bindStore(nextProps) {
    const { exchange, screenDetails, storeChange, salesFilter } = this.props;
    let category = [], noCategory = [];
    var { page, pageSize, selectedOption, filter } = this.state;
    if (salesFilter) {
      filter = Object.assign({}, filter, { gridFilter: this.getFilterParams(this.props.filters) });
    }
    if (exchange || (selectedOption && selectedOption.value)) {
      let value = null;
      if (screenDetails && screenDetails.fileName) {
        value = screenDetails.fileName
      } else if (selectedOption.value) {
        value = selectedOption.value
      }
      var categoryFilters = util.getCategoryFilters(value)
      category = categoryFilters.category;
      noCategory = categoryFilters.noCategory;
    }

    let params = {
      action: undefined,
      directoryName: undefined,
      page: page,
      pageSize: pageSize,
      populate: "StoreId",
      sort: undefined,
      sortDir: undefined,
      filter: filter,
      Category: category || [],
      NoCategory: noCategory || [],
      combos: '',
      selectedOptionVal: selectedOption || {},
      isFromEventFeed: this.props.location.pathname == "/eventfeed"
    }

    let searchOldProps = this.props.currentSearchResult || null;
    if (searchOldProps && searchOldProps.match && searchOldProps.match.params && searchOldProps.match.params.searchValue && searchOldProps.match.params.searchValue.length > 0) {
      params.query = searchOldProps.match.params.searchValue;
    }
    params = util.updateSiteAndTagsFilter(this, params, nextProps ? true : false);

    this.props.dispatch(getEventFeed.request(params));
  }
  getFilterParams(newFilters) {
    var filters = [];
    if (this.props.defaultFilter && this.props.defaultFilter.length > 0) {
      filters = filters.concat(this.props.defaultFilter);
    }
    if (Object.keys(newFilters).length !== 0) {
      for (var columnFilter in newFilters) {
        if (newFilters.hasOwnProperty(columnFilter)) {
          var filterValue,
            type,
            operator,
            convert,
            isDate = false,
            timezoneOffset = 0,
            columnFilterOj = newFilters[columnFilter];
          let Type = columnFilterOj.column.type && columnFilterOj.column.type.toLowerCase() || 'None';
          switch (Type) {
            case 'int':
            case 'numeric':
              var isArray = columnFilterOj.filterTerm instanceof Array;
              filterValue = isArray ? columnFilterOj.filterTerm[0].value : columnFilterOj.filterTerm;
              var compareOperator = filterValue ? filterValue.charAt(0) : ''; // First Values as Compare Operator
              operator = columnFilterOj.column.operator || 'eq';
              if (['<', '>'].indexOf(compareOperator) != -1) {
                switch (compareOperator) {
                  case '<':
                    operator = 'lt';
                    break;
                  case '>':
                    operator = 'gt';
                    break;
                }
                filterValue = filterValue.substring(1, filterValue.length);
              }
              type = 'numeric';
              if (isNaN(filterValue)) {
                return false;
              }
              break;
            case 'date':
              filterValue = moment(columnFilterOj.filterTerm).format(util.dateTimeFormatAmPm);
              type = 'date';
              operator = columnFilterOj.column.operator || 'eq';
              convert = columnFilterOj.column.convert ? 'true' : 'false';
              isDate = true;
              timezoneOffset = new Date().getTimezoneOffset();
              break;
            case 'bool':
              filterValue = columnFilterOj.filterTerm;
              type = 'boolean';
              operator = 'eq';
              break;
            default:
              filterValue = columnFilterOj.filterTerm;
              type = 'string';
              operator = 'like';
              break;
          }
          let cName = columnFilterOj.column.key;
          if (isDate) {
            filters.push({ "operator": operator, "value": filterValue, "property": cName, "type": type, convert: convert, timezoneOffset: timezoneOffset });
          }
          else {
            filters.push({ "operator": operator, "value": filterValue, "property": cName, "type": type, "gridFilter": true, gridFilterValue: filterValue });
          }
        }
      }
    }
    return filters;
  }

  componentWillReceiveProps(nextProps) {
    const { storeChange } = this.props;
    if (nextProps.getEventFeed !== this.props.getEventFeed) {
      let { data, error, isFetching } = nextProps.getEventFeed;
      let valid = common.responseHandler(data, error, isFetching);
      if (valid) {
        if (data.data) {

          let eventFeedData = data.data;
          let option = {
            eventFeed: storeChange.selectedStore.length > 0 && eventFeedData || [],
            pageTotal: storeChange.selectedStore.length > 0 && data.recordCount || 0
          };



          if (this.state.selectedReceipt) {
            option.selectedReceipt = this.state.page === 0 && eventFeedData.length > 0 ? eventFeedData[0] : this.state.page === 0 && eventFeedData.length === 0 ? null : this.state.selectedReceipt;
          }
          option.filterState = false;
          this.setState(option);
          if (eventFeedData && eventFeedData.length > 0) {
            this.props.dispatch(getReceipt.request({ InvoiceId: option.selectedReceipt ? option.selectedReceipt.InvoiceId : eventFeedData[0].InvoiceId }))
          }
        }
      }
    }

    if (nextProps.getReceipt !== this.props.getReceipt) {
      let { data, error, isFetching } = nextProps.getReceipt;
      let valid = common.responseHandler(data, error, isFetching);
      if (valid) {
        this.setState({ receipt: storeChange.selectedStore.length > 0 && data.data || [] });
      }
    }

    if (nextProps.videoShare !== this.props.videoShare) {
      let { data, error, isFetching } = nextProps.videoShare;
      let valid = common.responseHandler(data, error, isFetching);
      if (valid) {
        swal({
          title: "Success",
          text: "Video shared on email successfully",
          icon: "success"
        });
      }
    }

    let selectedStoreData = nextProps.storeChange.selectedStore;
    let selectedTagsData = nextProps.storeChange.selectedTag;
    let storeChangeData = this.props.storeChange;
    if ((storeChangeData.selectedStore != selectedStoreData) || (storeChangeData.selectedTag != selectedTagsData)) {
      this.newParams = nextProps.storeChange;
      this.setState({ page: 0 }, () => {
        this.bindStore(nextProps);
      })

    }

  }

  onSelectReceipt(receipt) {
    this.setState({ selectedReceipt: receipt });
    let loggedData = util.getScreenDetails(util.getLoggedUser(), this.props.location, consts.Played + receipt.InvoiceId + ' (' + receipt.Status + ')');
    this.props.dispatch(getReceipt.request({ InvoiceId: receipt.InvoiceId }));
    this.props.dispatch(overlayGraphData.request({ jsonFile: Math.floor(Math.random() * 4) + 1 }));
    this.props.dispatch(saveActivityLog.request({ action: 'save', data: loggedData }));
  }

  togglePanel() {
    const { eventFeed, selectedReceipt } = this.state;
    let option = {};
    if (selectedReceipt) {
      option.selectedReceipt = null;
    } else {
      option.selectedReceipt = eventFeed.length > 0 ? eventFeed[0] : null;
    }
    this.setState(option);
  }

  transactionFilterChanges = (selectedOption) => {
    let filter = [];
    let filterState = true;
    if (selectedOption) {
      filter.push(selectedOption.value);
    }
    this.setState({ selectedOption, filter: filter, page: 0, filterState }, () => {
      this.bindStore();
    });
  }


  videoShare = () => {
    let { path, email, selectedReceipt } = this.state;
    if (path && email && !util.email(email) && selectedReceipt) {
      this.props.dispatch(videoShare.request({ path, email, selectedReceipt, eventDate: selectedReceipt && selectedReceipt.EventTime && moment(selectedReceipt.EventTime).format(util.dateTimeFormatAmPm) }));
      this.setState({ modal: false, path: null, email: null, selectedReceipt: null });
    }
    else {
      this.setState({ errorEmail: true });
    }
  }

  showHideModal = (path) => {
    this.setState({ modal: !this.state.modal, path, errorEmail: null })
  }

  handleChange = (event) => {
    let { value, name } = event.target;
    this.setState({ [name]: value, errorEmail: false });
  }

  onActionComplete = () => {
    const { selectedReceipt } = this.state;
    this.props.dispatch(updateReceipt.request({ action: 'update', data: { auditStatus: selectedReceipt.AuditStatus, id: selectedReceipt._id } }));
  }

  paginate() {
    let options = {};
    options.page = this.state.page + 1;
    options.filterState = false;
    if (!this.state.filterState) {
      this.setState(options, () => {
        this.bindStore();
      });
    }
  }

  renderUserInfo(data, index) {
    return (
      <>
        <Col md={4}>Name : {data.Name}</Col>
        <Col md={8} className="text-right">Percentage : {Number(data.RecognizeScore).toFixed(2) + '%'}</Col>
      </>
    )
  }

  render() {
    const { toggle, state, videoShare, showHideModal, handleChange, paginate } = this;
    const { eventFeed, selectedReceipt, receipt, selectedOption, modal, errorEmail, pageTotal, page } = state;
    const { getEventFeed, getReceipt, graphDataProps, exchange, storeChange } = this.props;
    let { isFetching } = getEventFeed;
    isFetching = getReceipt.isFetching || isFetching;
    let status = selectedReceipt && selectedReceipt.Category ? selectedReceipt.Category : 'N/A';
    let heights = window.innerHeight;
    let graphData = graphDataProps && graphDataProps.data && graphDataProps.data.records || {};
    let { event } = receipt;
    return (
      <Fragment>
        <LoadingDialog isOpen={isFetching} />
        <Row>
          <Col md={selectedReceipt ? 6 : 12}>
            <Card>
              <CardHeader className="eventFeed-title contentText">
                <div>
                  <b> {"TOTAL RECORDS: " + pageTotal} </b>
                </div>
                {!exchange &&
                  <div>
                    <Select
                      className={"selectField"}
                      isClearable={true}
                      id="TransactionFilter"
                      value={selectedOption}
                      onChange={this.transactionFilterChanges}
                      options={filterOption}
                    />
                  </div>
                }
                {exchange && <Tooltip placement="bottom" title={consts.SwitchBtn}><Button onClick={() => exchange(this.props.filters, this.isComingFromEventFeed = true)} outline className="no-sales-header-button exchage-button"><i className="fa fa-exchange fa-2px"></i></Button></Tooltip>}
                <div>
                  <span onClick={() => this.togglePanel()} className="event-header-right-icon"> <i title={selectedReceipt ? "Expand" : "Collapse"} className={'fa fa-chevron-' + (selectedReceipt ? 'right' : 'left') + ' cursor'}></i> </span>
                </div>
              </CardHeader>
              <CardBody className="eventfeed-cardbody">
                <Col className="event-feed-stop-scroll" style={{ height: heights - 200 }}>
                  <EventFeedPagination col={selectedReceipt ? 6 : 3}
                    tabcol={selectedReceipt ? 12 : 6}
                    onSelectReceipt={this.onSelectReceipt}
                    data={eventFeed}
                    page={page}
                    paginateEvent={paginate.bind(this)}
                    selectedOption={this.state.selectedOption}
                  />
                </Col>
              </CardBody>
            </Card>
          </Col>
          {
            selectedReceipt && <Col md={6}>
              <Card className="camera-card-height">
                <CardHeader className="eventFeed-title contentText">
                  <Row>
                    <Col md={8}>
                      EVENT ID: <b>{selectedReceipt.InvoiceId}</b>
                    </Col>
                    <Col md={4}>
                      <div className="text-right card-text-left textConvert">EVENT STATUS: <b>{util.splitWordFromCapitalLater(status)}</b></div>
                    </Col>
                  </Row>
                </CardHeader>
                <CardBody className="event-feed-transaction">
                  <Col className="event-feed-video-margin" style={{ height: heights - 183 }}>
                    {
                      <React.Fragment>
                        <VideoPlayerRreact
                          videoShare={videoShare}
                          data={receipt}
                          IsVideoAvailable={selectedReceipt.IsVideoAvailable}
                          toggle={toggle}
                          height={370}
                          overVideoReceipt={true}
                          downloadVideo={true}
                          modelName="event"
                          showHideModal={showHideModal}
                          graphData={graphData}
                          key={selectedReceipt._id}
                          videoId={selectedReceipt._id}
                        />
                        <div>
                          {!['Face', 'BackDoor'].includes(status) ?
                            event && event.EventType != consts.FaceEvent && <Card>
                              <CardBody>
                                <Receipt data={receipt} />
                              </CardBody>
                            </Card> :
                            <Card>
                              <CardBody>
                                <div className={'receipt-view-video'}>
                                  <Row >
                                    <Col md={12} >
                                      <Row className="container-ie">
                                        <Col md={6}>
                                          <h6>Event Time : { event && event.EventTime && moment(event.EventTime).format(util.dateTimeFormat) || "N/A"}</h6>
                                        </Col>
                                        <Col md={6}>
                                          <h6 className="text-right card-text-left">Number: {event.InvoiceId}</h6>
                                          {/* <h6 className="text-right card-text-left">Name: {receipt.event.UserInfo && receipt.event.UserInfo.length > 0} </h6>
                                                                                    <h6 className="text-right card-text-left">Tran Seq No: {event.InvoiceId}</h6> */}
                                        </Col>
                                        <div className="row col-md-12">
                                          {
                                            event.UserInfo && event.UserInfo.length > 0 && event.UserInfo.map(this.renderUserInfo)
                                          }
                                        </div>
                                      </Row>
                                      <div className={'dashed-border'}></div>
                                    </Col>
                                  </Row>
                                </div>
                              </CardBody>
                            </Card>}
                          {selectedReceipt &&
                            <CommentBox onActionComplete={this.onActionComplete} addCommentProps="addComment" addComponentType={addComment} commentRequestType={getCommentList} commentRequest={"getCommentList"} mappingId="InvoiceId" componentId="InvoiceId" className="receipt-popup-comment" data={selectedReceipt} getCommentList={this.props.getCommentList} ></CommentBox>}
                        </div>
                      </React.Fragment>
                    }
                  </Col>
                </CardBody>
              </Card>
            </Col>
          }
        </Row>
        <Modal isOpen={modal} className={'this.props.className video-modal'}>
          <ModalHeader className={"widgetHeaderColor"}>User Email</ModalHeader>
          <ModalBody className={"reorderBody"}>
            <FormGroup>
              <Input type="email" name="email" id="Email" onChange={(e) => handleChange(e)} placeholder="Enter User Email" />
              {errorEmail && <span className="text-red"> Please enter the valid email id </span>}
            </FormGroup>
            <FormGroup>
              <Button className="grid-button" onClick={() => videoShare()} >Send</Button>{' '}
              <Button className="grid-button" onClick={() => showHideModal(null)} >Cancel</Button>
            </FormGroup>
          </ModalBody>
        </Modal>
      </Fragment>
    );
  }
}

function mapStateToProps(state, ownProps) {
  return {
    getEventFeed: state.getEventFeed,
    getReceipt: state.getReceipt,
    videoShare: state.videoShare,
    graphDataProps: state.overlayGraphData,
    storeChange: state.storeChange,
    getCommentList: state.getCommentList
  };
}

var EventFeedModule = connect(mapStateToProps)(EventFeed);
export default EventFeedModule;
