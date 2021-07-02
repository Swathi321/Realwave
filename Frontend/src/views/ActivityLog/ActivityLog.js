import { getActivityLogs } from '../../redux/actions/httpRequest';
import { connect } from 'react-redux';
import SalesBase from '../Sales/SalesBase';

class ActivityLog extends SalesBase {

  gridOverrides = {
    grid: { rowSelection: { showCheckbox: false } },
    sortInfo: { sortColumn: 'createdAt' }
  };

  getColumns() {
    return [
      { key: 'userName', name: 'User Name', type: 'string', width: 150, sort: true, filter: true },
      { key: 'screen', name: 'Action', type: 'string', width: 240, sort: true, filter: true },
      { key: 'route', name: 'Route', type: 'string', width: 180, sort: true, filter: true },
      { key: 'createdAt', name: 'Event Time', type: 'date', width: 180, sort: true, filter: true },
      { key: 'email', name: 'email', type: 'string',  width: 240, nested: "userId.email", formatter: (props, record) => record.userId ? record.userId.email : "" }
    ]
  }
}

ActivityLog.defaultProps = {
  listAction: getActivityLogs,
  actionName: 'getActivityLogs',
  defaultSort: 'createdAt',
  screenName: 'Activity Logs',
  populate: 'userId'
}

function mapStateToProps(state, ownProps) {
  return {
    getActivityLog: state.getActivityLog,
  };
}

var ActivityLogModule = connect(mapStateToProps)(ActivityLog);
export default ActivityLogModule;
