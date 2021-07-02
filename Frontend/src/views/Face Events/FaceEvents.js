import React from 'react';
import { getFaceEvents, getReceipt, updateReceipt } from '../../redux/actions/httpRequest';
import { connect } from 'react-redux';
import SalesBase from './../Sales/SalesBase';
import cameraImage from './../../assets/img/icons/camera-off.png';
import InvestigatorComments from './../../component/formatter/InvestigatorComments';
import DropdownList from '../../component/DropdownList';
import utils from '../../Util/Util';

const Names = (props) => {
    const { UserInfo, column } = props;
    let toReturn = '';
    if (UserInfo && UserInfo.length > 0) {
        if (column == "RecognizeScore") {
            toReturn = UserInfo.map((e) => `${e[column]} %`).join(', ');
        } else {
            toReturn = UserInfo.map((e) => e[column]).join(', ');
        }
    }
    return toReturn;
}

class FaceEvents extends SalesBase {

    beforeRender(data) {
        let customData = [];
        if (data && data.length > 0) {
            data.forEach(item => {
                let option = Object.assign({}, item);
                if (option.UserInfo && option.UserInfo.length > 0) {
                    let info = option.UserInfo[0];
                    option.RecognizeScore = info.RecognizeScore;
                    option.Name = info.Name;
                }
                customData.push(option);
            });
        }
        return customData;
    }

    getColumns() {
        return [
            { key: 'InvoiceId', name: 'Event Id', width: 140, sort: true, filter: true, align: 'right', type: 'numeric' },
            { key: 'OperatorName', name: 'Operator Name', width: 220, filter: true, sort: true, type: 'string' },
            { key: 'Register', name: 'Register', width: 120, filter: true, sort: true, align: 'right', type: 'numeric' },
            { key: 'EventTime', name: 'Date/Time', width: 180, filter: true, sort: true, type: 'date' },
            { key: 'Name', name: 'Name', nested: "UserInfo.Name", width: 160, sort: true, filter: true, type: 'string', formatter: (props, record) => <Names column="Name" {...record} /> },
            { key: 'RecognizeScore', name: 'Confidence Level', nested: "UserInfo.RecognizeScore", sort: true, filter: true, width: 250, type: 'numeric', formatter: (props, record) => <Names column="RecognizeScore" {...record} /> },
            {
                key: 'Rating', name: 'Comments', width: 190, sort: true,
                formatter: (props, record, data) => <InvestigatorComments screenName={this.props.location} data={record} />
            },
            {
                key: 'AuditStatus', name: 'Audit', width: 118, editable: false, filter: false, sort: true, formatter: (props, record) => <DropdownList
                    row={record}
                    className={"text-center"}
                    isDropdownOpen={this.state.isDropdownOpen}
                    Dropdownoggle={this.Dropdownoggle}
                    record={props}
                    index={record._id}
                    value={record.AuditStatus}
                    iconClass={utils.clipStatusEvents(record.AuditStatus)}
                    options={this.dropdownOptions} />
            },
            {
                key: 'CameraChanges', width: 100, export: false, name: 'VIDEO', formatter: (props, record) => <div className="cursor" onClick={() => this.playCamera(record)}>{!record.IsVideoAvailable ? <i class="fa fa-ban gridVideoNotAvailable" /> :
                    <div className="gridVideoContainer video-thumbnail"><img className="image-video-js" src={utils.serverUrl + "/api/eventVideoThumbnail?tid=" + record._id} /></div>}
                </div>
            }
        ];
    }
}

FaceEvents.defaultProps = {
    listAction: getFaceEvents,
    actionName: 'getFaceEvents',
    receiptAction: getReceipt,
    receiptActionName: 'getReceipt',
    updateReceiptAction: updateReceipt,
    updateReceiptActionName: 'updateReceipt',
    sortColumn: 'EventTime',
    sortDirection: 'DESC',
    isExchange: true,
    hideReceipt: true,
    screenName: 'Face Events'
}

function mapStateToProps(state, ownProps) {
    return {
        getFaceEvents: state.getFaceEvents,
        getReceipt: state.getReceipt,
        updateReceipt: state.updateReceipt,
        getGridData: getFaceEvents,
        updateGridData: state.updateGridData
    };
}

var FaceEventsModule = connect(mapStateToProps)(FaceEvents);
export default FaceEventsModule;
