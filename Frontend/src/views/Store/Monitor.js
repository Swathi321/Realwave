import React, { PureComponent } from 'react'
import { connect } from 'react-redux'
import PropTypes from 'prop-types';
import Grid from '../Grid/GridBase';
import { Col, Row } from 'reactstrap';
import { storeData } from '../../redux/actions/httpRequest';
import util from '../../Util/Util';
import LoadingDialog from './../../component/LoadingDialog';

export class Monitor extends PureComponent {
    constructor(props) {
        super(props)
        this.state = {
            columns: [
                { key: 'name', name: 'Name', width: 400, filter: true, sort: true, type: 'string' },
                { key: 'storeType', name: 'Type', width: 100, filter: true, sort: true, type: 'string' },
                { key: 'status', name: 'Status', width: 100, filter: true, sort: true, type: 'string' },
                { key: 'serialNumber', name: 'Serial Key', width: 400, filter: true, sort: true, type: 'string' },
                { key: 'isConnected', name: 'Machine Status', width: 300, sort: true, formatter: (props, record) => record.isConnected ? 'Connected' : 'Disconnected' },
                { key: 'lastConnectedOn', name: 'Last Connected On', width: 300, type: 'date' },
                { key: 'version', name: 'Version', width: 150, filter: true, sort: true, type: 'string' },
                { key: 'address', name: 'Address', width: 270, filter: true, sort: true, type: 'string' },
                { key: 'city', name: 'City', width: 110, filter: true, sort: true, type: 'string' },
                { key: 'state', name: 'State', width: 110, filter: true, sort: true, type: 'string' },
                { key: 'zipCode', name: 'Zip Code', width: 180, filter: true, sort: true, type: 'number', align: 'right' },
                { key: 'country', name: 'Country', width: 150, filter: true, sort: true, type: 'string' }
            ],
            page: localStorage.getItem("currentPage")
        }
        this.alreadyclicked = false;
        this.alreadyclickedTimeout = null;
        this.onRowClick = this.onRowClick.bind(this);


    }

    componentWillMount() {
        localStorage.removeItem("currentPage");
    }

    componentWillReceiveProps(nextProps) {
        util.UpdateDataForGrid(this, nextProps);
        util.updateGrid(this, nextProps, 'Monitor');

    }

    onRowClick = (index, record) => {
        if (this.alreadyclicked) {
            this.alreadyclicked = false;
            this.alreadyclickedTimeout && clearTimeout(this.alreadyclickedTimeout);
            if (record._id) {
                this.context.router.history.push({ pathname: '/health/MonitorSummary/' + record._id, state: { storeId: record._id } })
            }
        }
        else {
            this.alreadyclicked = true;
            this.alreadyclickedTimeout = setTimeout(() => {
                this.alreadyclicked = false;
            }, 300);
        }
    }


    setPage = (page) => {
        localStorage.setItem('currentPage', page)
        this.setState({
            page: page
        })
    }

    render() {
        const { props, state } = this;
        const { columns, page } = state;
        let { listAction, actionName, sortColumn, sortDirection, localPaging, storeData, match } = props;
        let { isFetching } = storeData;
        let gridProps = match.params.type ? { monitorTypeSelected: match.params.type } : {};
        return (
            <div>
                <LoadingDialog isOpen={isFetching} />
                <div className="grid-wrapper-area">
                    <Row>
                        <Col>
                            <Grid
                                listAction={listAction}
                                dataProperty={actionName}
                                columns={columns}
                                autoHeight={true}
                                filename={"Store"}
                                screen={"Monitor"}
                                defaultSort={{ sortColumn: sortColumn, sortDirection: sortDirection }}
                                localPaging={localPaging || false}
                                onRowClick={this.onRowClick}
                                exportButton={false}
                                {...gridProps}
                                height={450}
                                pageProps={page}
                                setPage={this.setPage}
                            />
                        </Col>
                    </Row>
                </div>
            </div>
        )
    }
}

Monitor.defaultProps = {
    listAction: storeData,
    actionName: 'storeData'
}

Monitor.contextTypes = {
    router: PropTypes.object.isRequired
};

const mapStateToProps = (state) => ({
    storeData: state.storeData,
    storeChange: state.storeChange
})

export default connect(mapStateToProps)(Monitor)
