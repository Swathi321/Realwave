import React, { PureComponent } from 'react'
import PropTypes from 'prop-types';
import Grid from '../Grid/GridBase';
import { reloadGrid } from '../../redux/actions/';
import { alarmData, getAlarmCommentList, updateAlarm, addAlarmComment } from '../../redux/actions/httpRequest';
import { connect } from 'react-redux';
import { Col, Row } from 'reactstrap';
import common from '../../common';
import Comments from '../../component/Comments';
import DropdownList from '../../component/DropdownList';
import util from '../../Util/Util';

export class Alarm extends PureComponent {
  constructor(props) {
    super(props)

    this.state = {
      currentAlarm: {},
      isDropdownOpen: false,
      columns: this.getColumns(),
      page: localStorage.getItem('currentPage')
    }

    this.dropdownOptions = [
      { name: 'PENDING', icon: "fa fa-clock-o", onClick: this.getAuditUpdateStatus.bind(this, 'Pending') },
      { name: 'REVIEWED', icon: "fa fa-check", onClick: this.getAuditUpdateStatus.bind(this, 'Reviewed') },
      { name: 'NO REVIEW', icon: "fa fa-close", onClick: this.getAuditUpdateStatus.bind(this, 'Not Reviewed') }
    ];
    this.onRowClick = this.onRowClick.bind(this);
    this.alreadyclicked = false;
    this.alreadyclickedTimeout = null;
  };

  getColumns() {
    return [
      { key: 'storeId', name: 'Site', width: 130, filter: true, type: "string", nested: "storeId.name", formatter: (props, record) => record.storeId ? record.storeId.name : "" },
      { key: 'type', name: 'Type', filter: true, sort: true, width: 90, type: "string" },
      { key: 'location', name: 'Location', filter: true, sort: true, width: 80, type: "string" },
      { key: 'eventTime', name: 'Date/Time', width: 100, filter: true, sort: true, type: 'date' },
      { key: 'status', name: 'Status', filter: true, sort: true, width: 70, type: "string" },
      { key: 'details', name: 'Details', filter: true, sort: true, width: 130, type: "string" },
      { key: 'closedOn', name: 'Closed On', width: 120, filter: true, sort: true, type: 'date' },
      {
        key: 'auditStatus', name: 'Audit Status', width: 90, editable: false, filter: false, sort: true, formatter: (props, record) => <DropdownList
          row={record}
          className={"text-center"}
          isDropdownOpen={this.state.isDropdownOpen}
          Dropdownoggle={this.Dropdownoggle}
          record={props}
          index={record._id}
          value={record.AuditStatus}
          iconClass={util.clipStatusEvents(record.auditStatus)}
          options={this.dropdownOptions} />
      },
      { key: 'rating', name: 'Comments', width: 80, sort: true, formatter: (props, record) => <Comments siteModalHeader={this.props.siteModalHeader} gridName="alarm" scope={this} data={record} addCommentProps="addAlarmComment" addComponentType={addAlarmComment} commentRequestType={getAlarmCommentList} commentRequest={"getAlarmCommentList"} mappingId="id" componentId="alarmId" getCommentList={this.props.getAlarmCommentList} /> }
    ]
  }

  getAuditUpdateStatus(status, data) {
    this.props.dispatch(this.props.updateAlarmAction.request({ action: 'update', data: { auditStatus: status, id: data._id } }));
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
  
  componentWillMount() {
    localStorage.removeItem("currentPage");
  }

  componentWillReceiveProps(nextProps) {
    const { alarmActionName, updateAlarmActionName } = this.props;
    if (nextProps[alarmActionName] !== this.props[alarmActionName]) {
      let { data, error, isFetching } = nextProps[alarmActionName];
      let valid = common.responseHandler(data, error, isFetching);
      if (valid) {
        this.setState({ isOpen: true, currentAlarm: data.data });
      }
    }

    if (nextProps[updateAlarmActionName] !== this.props[updateAlarmActionName]) {
      let { data, error, isFetching } = nextProps[updateAlarmActionName];
      let valid = common.responseHandler(data, error, isFetching);
      if (valid) {
        this.props.dispatch(reloadGrid({
          grid: 'alarm'
        }));
      }
    }
    util.updateGrid(this, nextProps, 'alarm');
  }

  onRowClick = (index, record) => { }

  setPage = (page) => {
    localStorage.setItem('currentPage', page)
    this.setState({
      page: page
    })
  }

  render() {
    const { loadedData, columns, page } = this.state;
    const { listAction, actionName, sortColumn, sortDirection } = this.props;
    return (
      <div className="grid-wrapper-area">
        <Row>
          <Col>
            <Grid
              beforeRender={this.beforeRender}
              loadedData={loadedData}
              listAction={listAction}
              dataProperty={actionName}
              columns={columns}
              autoHeight={true}
              filename={"Alarm"}
              screen={"alarm"}
              populate={"storeId cameraId"}
              defaultSort={{ sortColumn: sortColumn, sortDirection: sortDirection }}
              localPaging={this.props.localPaging || false}
              onRowClick={this.onRowClick}
              exportButton={true}
              screenPathLocation={this.props.location}
              height={450}
              pageProps={page}
              setPage={this.setPage}
            />
          </Col>
        </Row>
      </div>
    )
  }
}

Alarm.defaultProps = {
  listAction: alarmData,
  actionName: 'alarmData',
  sortColumn: 'eventTime',
  sortDirection: 'DESC',
  updateAlarmAction: updateAlarm,
  updateAlarmActionName: 'updateAlarm',
  alarmAction: getAlarmCommentList,
  alarmActionName: 'getAlarmCommentList',
  siteModalHeader: 'Site',
}

Alarm.contextTypes = {
  router: PropTypes.object.isRequired
};

function mapStateToProps(state, ownProps) {
  return {
    alarmData: state.alarmData,
    getAlarmCommentList: state.getAlarmCommentList,
    updateAlarm: state.updateAlarm,
    storeChange: state.storeChange
  };
}

export default connect(mapStateToProps)(Alarm);
