import React, { Component } from 'react';
import { Col, Row, Card, CardBody, CardHeader } from 'reactstrap';
import { reloadGrid, getGridFilter } from '../../redux/actions/';
import LiveCameraCard from '../../component/LiveCameraCard';
import Grid from '../Grid/GridBase';
import moment from 'moment';
import common from '../../common';
import util from '../../Util/Util';
import EventFeed from '../../views/EventFeed/EventFeed';
import InvestigatorComments from './../../component/formatter/InvestigatorComments';
import DropdownList from '../../component/DropdownList';
import { getSales, getReceipt, updateReceipt, saveActivityLog } from '../../redux/actions/httpRequest';
import { connect } from 'react-redux';
import consts from '../../Util/consts';
import noVideoBlack from '../../assets/img/Newicon/no_video_black.svg';
import noVideoWhite from '../../assets/img/Newicon/no_video_white.svg';

class SalesBase extends Component {
  constructor(props) {
    super(props);
    this.toggle = this.toggle.bind(this);
    this.onRowClick = this.onRowClick.bind(this);
    this.state = {
      selectedRowKeys: [], // Check here to configure the default column
      isOpen: false,
      receiptData: [],
      isDropdownOpen: false,
      currentReceipt: {},
      columns: this.getColumns(),
      updatedStatus: '',
      isGridView: true,
      isComingFromEventFeed: false,
      appliedTheme: '',
      page: localStorage.getItem('currentPage')
    };

    this.dropdownOptions = [
      { name: 'PENDING', icon: "fa fa-clock-o", onClick: this.getAuditUpdateStatus.bind(this, 'Pending') },
      { name: 'REVIEWED', icon: "fa fa-check", onClick: this.getAuditUpdateStatus.bind(this, 'Reviewed') },
      { name: 'NO REVIEW', icon: "fa fa-close", onClick: this.getAuditUpdateStatus.bind(this, 'Not Reviewed') }
    ];
  }

  getColumns() {
    return [
      { key: 'InvoiceId', name: 'EVENT ID', width: 130, sort: true, filter: true, align: 'right', type: 'numeric' },
      { key: 'OperatorName', name: 'NAME', width: 150, sort: true, filter: true, type: 'string' },
      { key: 'Register', name: 'REGISTER', width: 120, sort: true, filter: true, align: 'right', type: 'string' },
      {
        key: 'Status', name: 'STATUS', width: 100, sort: true, filter: true, type: 'string', formatter: function (record, data) {
          return util.splitWordFromCapitalLater(record);
        }
      },
      { key: 'EventTime', name: 'DATE/TIME', width: 160, filter: true, sort: true, type: 'date' },
      { key: 'EventTime', name: 'Site - DATE/TIME ', width: 160, filter: true, sort: true, type: 'date', converWithStoreTimezone: true },
      { key: 'Rating', name: 'COMMENTS', width: 120, sort: true, formatter: (props, record, data) => <InvestigatorComments data={record} screenName={this.props.location} /> },
      {
        key: 'AuditStatus', name: 'AUDIT', width: 118, editable: false, filter: false, sort: true, formatter: (props, record) => <DropdownList
          row={record}
          className={"text-center"}
          isDropdownOpen={this.state.isDropdownOpen}
          Dropdownoggle={this.Dropdownoggle}
          record={props}
          index={record._id}
          value={record.AuditStatus}
          iconClass={util.clipStatusEvents(record.AuditStatus)}
          options={this.dropdownOptions} />
      },
      {
        key: 'Category', name: 'TYPE', width: 140, sort: false, filter: false, type: 'string', formatter: function (record, data) {
          return util.splitWordFromCapitalLater(data.Category);
        }
      },
      { key: 'Total', name: 'TOTAL', width: 90, sort: true, filter: true, align: 'right', type: 'numeric', currency: true },
      {
        key: 'IsVideoAvailable',
        name: 'VIDEO',
        width: 90,
        filter: true,
        toggle: true,
        sort: true,
        type: 'bool',
        export: false,
        formatter: (props, record, index, scope) => {
          return (
            <div
              className="cursor"
              // onClick={() => this.playCamera(record)}
            >
              { !record.IsVideoAvailable
                ? ( <img
                    src={scope.props.appliedTheme.className === 'theme-dark' ? noVideoWhite : noVideoBlack}
                    alt="noVideo"
                    className='width_1_5em no-video'
                /> ) : (
                  <div className="gridVideoContainer video-thumbnail">
                    <img
                      className="image-video-js"
                      src={util.serverUrl + "/api/eventVideoThumbnail?tid=" + record._id}
                    />
                  </div>
                )
              }
            </div>
          )
        }
      }
    ];
  }

  componentWillMount() {
    localStorage.removeItem("currentPage");
  }

  componentWillReceiveProps(nextProps) { // NOTE component will receive props
    const { receiptActionName, updateReceiptActionName } = this.props;
    // if (nextProps[receiptActionName] !== this.props[receiptActionName]) {
    //   let { data, error, isFetching } = nextProps[receiptActionName];
    //   let valid = common.responseHandler(data, error, isFetching);
    //   if (valid) {
    //     if (this.state.isGridView) {
    //       this.setState({ isOpen: true, currentReceipt: data.data });
    //     }
    //   }
    // }
    if (nextProps.theme) {
      this.setState({ appliedTheme: nextProps.theme });
    }

    if (nextProps[updateReceiptActionName] !== this.props[updateReceiptActionName]) {
      let { data, error, isFetching } = nextProps[updateReceiptActionName];
      let valid = common.responseHandler(data, error, isFetching);
      if (valid) {
        this.props.dispatch(reloadGrid({
          grid: 'sales'
        }));
      }
    }
    util.updateGrid(this, nextProps, 'sales');
  }

  getAuditUpdateStatus(status, data) {
    this.props.dispatch(this.props.updateReceiptAction.request({ action: 'update', data: { auditStatus: status, id: data._id } }));
  }

  toggle() {
    let { isOpen } = this.state
    this.setState({ isOpen: !isOpen });
  }

  onRowClick(index, row, col) {
    //Todo: Implement as per need
  }

  Dropdownoggle = (index) => {
    let { isDropdownOpen } = this.state

    if (isDropdownOpen == index) {
      this.setState({ isDropdownOpen: null });
    }
    else {
      this.setState({ isDropdownOpen: index });
    }

  }

  editRow = (index) => {
    //TODO EDIT
    this.setState({ editingKey: index });
  }

  playCamera = (row) => { // NOTE play camera
    if (row.IsVideoAvailable) {
      // this.setState({ isOpen: true, isCommentBox: false, currentReceipt: row });
      let loggedData = util.getScreenDetails(util.getLoggedUser(), this.props.location, consts.Played + row.EventId + ' (' + row.Status + ')');
      this.props.dispatch(saveActivityLog.request({ action: 'save', data: loggedData }));
      this.props.dispatch(this.props.receiptAction.request({ InvoiceId: row.InvoiceId }));
    }
  }

  componentDidUpdate() {
    let { isOpen } = this.state
    // on Playing Video scroll should be at last.
    if (isOpen) {
      let antTableBody = document.getElementsByClassName('ant-table-body');
      if (antTableBody && antTableBody.length > 0) {
        antTableBody[0].scrollBy(9000, 0);
      }
    }
  }

  exchange = (data, value) => {
    this.setState({ isGridView: !this.state.isGridView, filters: data, isComingFromEventFeed: value });
  }


  setPage = (page) => {
    localStorage.setItem('currentPage', page)
    this.setState({
      page: page
    })
  }

  render() {
    const { isOpen, currentReceipt, columns, isGridView, filters, isComingFromEventFeed, appliedTheme, page } = this.state;
    let { listAction, actionName, sortColumn, sortDirection, hiddenExport, isExchange, getGridFilter } = this.props;
    let height = window.innerHeight - 300;
    let screenDetails = util.getSalesScreenDetails(this.props.location.pathname);
    let heights = window.innerHeight;
    return (
      <div className="grid-wrapper-area">
        {isGridView ?
          <Row>
            <Col md={isOpen ? 6 : 12}>
              <div className="grid-wrapper-area grid-collapse">
                <Grid
                  appliedTheme={appliedTheme}
                  beforeRender={this.beforeRender ? this.beforeRender : null}
                  height={height}
                  isSearch={this.props.isSearch}
                  listAction={listAction}
                  dataProperty={actionName}
                  columns={columns}
                  autoHeight={true}
                  screen='sales'
                  populate='StoreId'
                  defaultSort={{ sortColumn: sortColumn, sortDirection: sortDirection }}
                  isSalesGrid={true}
                  Category={screenDetails.category}
                  NoCategory={screenDetails.noCategory}
                  combos={'stores'}
                  filename={screenDetails.fileName}
                  localPaging={this.props.localPaging || false}
                  // onRowClick={() => { }}
                  exportButton={hiddenExport ? false : true}
                  exchange={isExchange && this.exchange}
                  filters={filters || {}}
                  screenName={screenDetails.name}
                  screenPathLocation={this.props.location}
                  isComingFromEventFeed={isComingFromEventFeed}
                  hidePref={false}
                  // showCollapse={isOpen}
                  // onToggle={() => this.toggle()}
                  isPOS={true}
                  model="old"
                  screenDetails={screenDetails}
                  pageProps={page}
                  setPage={this.setPage}
                />
              </div>
            </Col>
            {/* {currentReceipt && currentReceipt.event && isGridView && isOpen &&
              <Col md={6} className="event-feed-stop-scroll grid-video" style={{ height: heights - 130 }}>
                <Card className="camera-card-height">
                  <CardHeader className="eventFeed-title contentText">
                    <Row>
                      <Col md={12}>
                        {screenDetails.name + " Register " + (currentReceipt.event.Register || '') + "-" + moment(currentReceipt.event.EventTime).format(util.dateFormat)}
                      </Col>
                    </Row>
                  </CardHeader>
                  <CardBody className="event-feed-transaction">
                    <LiveCameraCard
                      className="receipt-popup"
                      data={currentReceipt}
                      hideReceipt={this.props.hideReceipt || false}
                      overVideoReceipt={true}
                      downloadVideo={true}
                    />
                  </CardBody>
                </Card>
              </Col>
            } */}
          </Row> :
          <EventFeed screenDetails={screenDetails} currentSearchResult={this.props} exchange={this.exchange} location={this.props.location} salesFilter={getGridFilter} filters={filters} />
        }
      </div>
    )
  }
}

SalesBase.defaultProps = {
  listAction: getSales,
  actionName: 'getSales',
  receiptAction: getReceipt,
  receiptActionName: 'getReceipt',
  updateReceiptAction: updateReceipt,
  updateReceiptActionName: 'updateReceipt',
  sortColumn: 'EventTime',
  sortDirection: 'DESC',
  isExchange: true
}

function mapStateToProps(state, ownProps) {
  return {
    getSales: state.getSales,
    getReceipt: state.getReceipt,
    updateReceipt: state.updateReceipt,
    getGridData: getSales,
    storesData: state.storesData,
    storeChange: state.storeChange,
    getGridFilter: state.getGridFilter,
    theme: state.theme
  };
}

var SalesBaseModule = connect(mapStateToProps)(SalesBase);
export default SalesBaseModule;
