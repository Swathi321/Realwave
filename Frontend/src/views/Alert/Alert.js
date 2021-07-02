import React, { PureComponent } from 'react'
import PropTypes from 'prop-types';
import Grid from '../Grid/GridBase';
import { alertData, getAlertCommentList, addAlertComment } from '../../redux/actions/httpRequest';
import { connect } from 'react-redux';
import { Col, Row, Card, CardBody } from 'reactstrap';
import common from '../../common';
import Comments from '../../component/Comments';
import util from '../../Util/Util';

export class Alert extends PureComponent {
  constructor(props) {
    super(props)

    this.state = {
      currentAlert: {},
      columns: this.getColumns(),
      page: localStorage.getItem('currentPage')
    }
    this.onRowClick = this.onRowClick.bind(this);
    this.alreadyclicked = false;
    this.alreadyclickedTimeout = null;
  };

  getColumns() {
    return [
      { key: 'storeId', name: 'Site', width: 170, filter: true, sort: false, type: "string", nested: "storeId.name", formatter: (props, record) => record.storeId ? record.storeId.name : "" },
      { key: 'cameraId', name: 'Camera', width: 200, filter: true, sort: false, type: "string", nested: "cameraId.name", formatter: (props, record) => record.cameraId ? record.cameraId.name : "" },
      { key: 'type', name: 'Type', filter: true, sort: true, width: 120, type: "string" },
      { key: 'eventTime', name: 'Date/Time', width: 170, filter: true, sort: true, type: 'date' },
      { key: 'status', name: 'Status', filter: true, sort: true, width: 100, type: "string" },
      { key: 'details', name: 'Details', filter: true, sort: true, width: 170, type: "string" },
      { key: 'closedOn', name: 'Closed On', width: 170, filter: true, sort: true, type: 'date' },
      { key: 'rating', name: 'Comments', width: 190, sort: true, formatter: (props, record) => <Comments gridName="alert" scope={this} siteModalHeader={this.props.siteModalHeader} data={record} addCommentProps="addAlertComment" addComponentType={addAlertComment} commentRequestType={getAlertCommentList} commentRequest={"getAlertCommentList"} mappingId="id" componentId="alertId" getCommentList={this.props.getAlertCommentList} /> }
    ]
  }
  
  componentWillMount() {
    localStorage.removeItem("currentPage");
  }
  
  componentWillReceiveProps(nextProps) {
    const { alertActionName } = this.props;
    if (nextProps[alertActionName] !== this.props[alertActionName]) {
      let { data, error, isFetching } = nextProps[alertActionName];
      let valid = common.responseHandler(data, error, isFetching);
      if (valid) {
        this.setState({ isOpen: true, currentAlert: data.data });
      }
    }
    util.updateGrid(this, nextProps, 'alert');
  }

  onRowClick = (index, record) => { }

  render() {
    const { loadedData, columns, page } = this.state;
    const { listAction, actionName, sortColumn, sortDirection } = this.props;
    const url = this.props.match.url.split('/');
    var filters = [{ "value": 'Open', "property": "status", "type": "string" }]
    url.includes('huboffline') ? filters.push({ "value": 'Hub Offline', "property": "type", "type": "string" }) : url.includes('cameraoffline') ? filters.push({ "value": 'Camera Offline', "property": "type", "type": "string" }) : filters = [];
    return (
      <div>
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
                filename={"Alert"}
                screen={"alert"}
                populate={"storeId cameraId"}
                defaultSort={{ sortColumn: sortColumn, sortDirection: sortDirection }}
                localPaging={this.props.localPaging || false}
                onRowClick={this.onRowClick}
                exportButton={true}
                filters={filters}
                screenPathLocation={this.props.location}
                height={450}
                pageProps={page}
              />
            </Col>
          </Row>
        </div>
      </div>
    )
  }
}

Alert.defaultProps = {
  listAction: alertData,
  actionName: 'alertData',
  sortColumn: 'eventTime',
  sortDirection: 'DESC',
  alertAction: getAlertCommentList,
  alertActionName: 'getAlertCommentList',
  siteModalHeader: 'Site',
}

Alert.contextTypes = {
  router: PropTypes.object.isRequired
};

function mapStateToProps(state, ownProps) {
  return {
    alertData: state.alertData,
    getAlertCommentList: state.getAlertCommentList,
    storeChange: state.storeChange
  };
}

export default connect(mapStateToProps)(Alert);
