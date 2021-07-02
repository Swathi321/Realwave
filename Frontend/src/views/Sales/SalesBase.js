import React from 'react';
import { Col, Row, CardBody, Card, CardHeader } from 'reactstrap';
import { reloadGrid, getGridFilter } from '../../redux/actions/';
import LiveCameraCard from '../../component/LiveCameraCard';
import Grid from '../Grid/GridBase';
import moment from 'moment';
import common from '../../common';
import util from '../../Util/Util';
import EventFeed from '../../views/EventFeed/EventFeed';
import { getSales, saveActivityLog, updateReceipt, getReceipt, universalSearch } from '../../redux/actions/httpRequest';
import consts from '../../Util/consts';
import { connect } from 'react-redux';

import { Tooltip } from 'antd';
import utils from '../../Util/Util';
class SalesBase extends React.Component {
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
      page: localStorage.getItem('currentPage')
    };

    this.dropdownOptions = [
      { name: 'PENDING', icon: "fa fa-clock-o", onClick: this.getAuditUpdateStatus.bind(this, 'Pending') },
      { name: 'REVIEWED', icon: "fa fa-check", onClick: this.getAuditUpdateStatus.bind(this, 'Reviewed') },
      { name: 'NO REVIEW', icon: "fa fa-close", onClick: this.getAuditUpdateStatus.bind(this, 'Not Reviewed') }
    ];
  }

  componentWillMount() {
    localStorage.removeItem("currentPage");
  }

  componentWillReceiveProps(nextProps) {
    const { actionName, receiptActionName, updateReceiptActionName, screenName } = this.props;
    if (nextProps[receiptActionName] !== this.props[receiptActionName]) {
      let { data, error, isFetching } = nextProps[receiptActionName];
      let valid = common.responseHandler(data, error, isFetching);
      if (valid) {
        if (this.state.isGridView) {
          this.setState({ isOpen: true, currentReceipt: data.data });
        }
      }
    }
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
    util.updateGrid(this, nextProps, screenName || 'sales');
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

  playCamera = (row) => {
    if (row.IsVideoAvailable) {
      // this.setState({ isOpen: true, isCommentBox: false, currentReceipt: row });
      let loggedData = util.getScreenDetails(util.getLoggedUser(), this.props.location, consts.Played + row.EventId + ' (' + row.Status + ')');
      this.props.dispatch(saveActivityLog.request({ action: 'save', data: loggedData }));
      this.props.dispatch(this.props.receiptAction.request({ InvoiceId: row.InvoiceId }));
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
    let { isOpen, currentReceipt, columns, isGridView, page } = this.state;
    let { listAction, actionName, sortColumn, sortDirection, hiddenExport, isExchange, hideSearch, disablePagination, screenName, populate, match, getGridFilter } = this.props;
    let height = window.innerHeight - 300;

    let screenDetails = util.getSalesScreenDetails(this.props.location.pathname);
    let gridProps = populate ? { populate: populate } : {};
    let heights = window.innerHeight;
    return (
      <div>
        {isGridView ?
          <div>
            <Col md={12}>
              <div className="grid-wrapper-area grid-collapse">
                <Grid
                  appliedTheme={this.props.theme}
                  {...gridProps}
                  beforeRender={this.beforeRender ? this.beforeRender : null}
                  height={height}
                  isSearch={this.props.isSearch}
                  listAction={listAction}
                  dataProperty={actionName}
                  columns={columns}
                  autoHeight={true}
                  screen={screenName || 'sales'}
                  subTitle={match.params.searchValue || ''}
                  defaultSort={{ sortColumn: sortColumn, sortDirection: sortDirection }}
                  combos={'stores'}
                  localPaging={this.props.localPaging || false}
                  onRowClick={() => { }}
                  exportButton={hiddenExport ? false : true}
                  exchange={isExchange && this.exchange}
                  hideSearch={hideSearch ? true : false}
                  disablePagination={disablePagination ? true : false}
                  screenPathLocation={this.props.location}
                  hidePref={true}
                  query={match.params.searchValue || ''}
                  showCollapse={isOpen}
                  onToggle={() => this.toggle()}
                  height={450}
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
                    <LiveCameraCard className="receipt-popup" data={currentReceipt} hideReceipt={this.props.hideReceipt || false} overVideoReceipt={true} downloadVideo={true} modelName="event" />
                  </CardBody>
                </Card>
              </Col>
            } */}
          </div> :
          <EventFeed screenDetails={screenDetails} currentSearchResult={this.props} exchange={this.exchange} location={this.props.location} />
        }
      </div>
    )
  }
}

export default SalesBase;
