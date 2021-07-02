import React, { PureComponent } from 'react';
import { smartDeviceData } from '../../redux/actions/httpRequest';
import { connect } from 'react-redux';
import Grid from '../Grid/GridBase';
import { Col, Row } from 'reactstrap';
import util from '../../Util/Util';

class Temperature extends PureComponent {

    constructor(props) {
        super(props)

        this.state = {
            columns: this.getColumns(),
            page: localStorage.getItem("currentPage")
        }
        this.onRowClick = this.onRowClick.bind(this);
        this.alreadyclicked = false;
        this.alreadyclickedTimeout = null;
    };

    componentWillMount() {
        localStorage.removeItem("currentPage");
    }

    componentWillReceiveProps(nextProps) {
        util.UpdateDataForGrid(this, nextProps);
        util.updateGrid(this, nextProps, 'Temperature');
    }

    getColumns() {
        return [
            { key: 'storeId', name: 'Site', width: 170, filter: true, sort: false, type: "string", nested: "storeId.name", formatter: (props, record) => record.storeId ? record.storeId.name : "" },
            { key: 'Temperature', name: 'Temperature', width: 120, sort: true, filter: false, align: 'right', type: 'numeric', formatter: (props, record) => record.Temperature ? (record.Temperature * 9 / 5 + 32).toFixed(2) + "°F" : "" },
            { key: 'LightIntensity', name: 'Light', width: 100, sort: true, filter: true, align: 'right', type: 'numeric' },
            { key: 'BatteryLevel', name: 'Battery', width: 100, sort: true, filter: true, align: 'right', type: 'numeric' },
            { key: 'EventTime', name: 'Date/Time', filter: true, sort: true, type: 'date', width: 200, isLocal: true },
            { key: 'DeviceSerial', name: 'Device Serial', filter: true, sort: true, width: 100,type: 'string' }
        ];
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
                            loadedData={loadedData}
                            listAction={listAction}
                            dataProperty={actionName}
                            columns={columns}
                            autoHeight={true}
                            defaultFilter={[{ "operator": 'like', "value": 'HealthRecord', "property": 'RecordType', "type": 'string' }]}
                            filename={"Temperature"}
                            screen={"Temperature"}
                            populate={"storeId"}
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

Temperature.defaultProps = {
    listAction: smartDeviceData,
    actionName: 'smartDeviceData',
    sortColumn: 'EventTime',
    sortDirection: 'DESC',
}

function mapStateToProps(state, ownProps) {
    return {
        smartDeviceData: state.smartDeviceData,
        storeChange: state.storeChange
    };
}

var TemperatureModule = connect(mapStateToProps)(Temperature);
export default TemperatureModule;


