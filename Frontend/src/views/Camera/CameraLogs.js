import { connect } from 'react-redux';
import SalesBase from '../Sales/SalesBase';
import { getCameraLogs } from '../../redux/actions/httpRequest';

class CameraLogs extends SalesBase {

    gridOverrides = {
        // grid: { rowSelection: { showCheckbox: false } },
        sortInfo: { sortColumn: 'CamLogDate' }
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
            { key: 'CamLogDate', name: 'Log Date', width: 180, sort: false, filter: true, type: 'date' },
            { key: 'CamLogType', name: 'Log Type', width: 100, filter: true, sort: true, type: 'string' },
            { key: 'CamLogDescription', name: 'Log Description', width: 200, filter: true, sort: true, type: 'string' },
            { key: 'CamLogInformation', name: 'Log Information', width: 200, filter: true, sort: true, type: 'string' }
        ]
    }
}

CameraLogs.defaultProps = {
    listAction: getCameraLogs,
    actionName: 'getCameraLogs',
    defaultSort: 'CamLogDate',
    screenName: 'Camera Logs',
    populate: 'StoreId CameraId'
}

function mapStateToProps(state, ownProps) {
    return {
        getCameraLogs: state.getCameraLogs,
        storeChange: state.storeChange
    };
}

var CameraLogsModule = connect(mapStateToProps)(CameraLogs);
export default CameraLogsModule;
