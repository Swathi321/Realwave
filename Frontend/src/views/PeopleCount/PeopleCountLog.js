import { connect } from 'react-redux';
import SalesBase from '../Sales/SalesBase';
import { getPeopleCountLogs } from '../../redux/actions/httpRequest';

class PeopleCountLog extends SalesBase {

    gridOverrides = {
        sortInfo: { sortColumn: 'PeopleCountDate' }
    };

    beforeRender(data) {
        let customData = [];
        data && data.length > 0 && data.forEach(item => {
            item.StoreId = item.StoreId && item.StoreId !== null && item.StoreId.name ? item.StoreId.name : item.StoreId;
            item.CameraId = item.CameraId && item.CameraId !== null && item.CameraId.name ? item.CameraId.name : item.CameraId;
            customData.push(item);
        });
        return customData;
    }

    getColumns() {
        return [
            { key: 'CameraId', name: 'Camera', width: 150, filter: true, sort: true, type: 'string' },
            { key: 'StoreId', name: 'Site', width: 200, filter: true, sort: true, type: 'string' },
            { key: 'PeopleCountDate', name: 'Count Log Date', width: 180, sort: false, filter: true, type: 'date' },
            { key: 'InCount', name: 'In Count', width: 200, filter: false, sort: false, type: 'numeric' },
            { key: 'OutCount', name: 'Out Count', width: 200, filter: false, sort: false, type: 'numeric' }
        ]
    }
}

PeopleCountLog.defaultProps = {
    listAction: getPeopleCountLogs,
    actionName: 'getPeopleCountLogs',
    defaultSort: 'PeopleCountDate',
    screenName: 'People Count',
    populate: 'StoreId CameraId'
}

function mapStateToProps(state, ownProps) {
    return {
        getPeopleCount: state.getPeopleCount,
        getPeopleCountLogs: state.getPeopleCountLogs,
    };
}

var PeopleCountModule = connect(mapStateToProps)(PeopleCountLog);
export default PeopleCountModule;
