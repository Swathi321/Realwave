import React, { PureComponent } from 'react'
import { connect } from 'react-redux'
import { getDirectoriesAndLogs } from '../../redux/actions/httpRequest';
import Grid from '../Grid/GridBase';
import { Col, Row } from 'reactstrap';
import util from './../../Util/Util';
import { screenDetails } from '../../redux/actions/';

export class Logs extends PureComponent {
    constructor(props) {
        super(props)
        this.state = {
            columns: [
                { key: 'fileName', name: 'File Name', width: 400, filter: true, sort: true },
                { key: 'createdAt', name: 'Log Date', width: 160, type: 'date', filter: true, sort: true },
                { key: 'extension', name: 'Extension', width: 90 },
                { key: 'fileSize', name: 'Size(bytes)', width: 90,/* align: 'right'*/ },
                { key: 'download', name: 'Download', width: 90, formatter: (props, record) => <a href={this.generatDownloadUrl(record)} target="new"><div className="cursor"><i className="fa fa-download fa-2x logDownload" /></div></a> }
            ]
        }
    }

    generatDownloadUrl(record) {
        //The variable to be returned
        var URL = util.serverUrl + "/api2/getDirectoriesAndLogs?"

        //Forming the variable to return   
        URL += "action=download&";
        URL += "directoryName=" + this.props.match.params.id + "&";
        URL += "fileName=" + record.fileName;
        return URL;
    }

    onRowClick = (index, record) => {
    }

    setScreenName = (data) => {
        this.props.dispatch(screenDetails(data));
    }

    componentWillMount() {
        // localStorage.removeItem("currentPage");
    }

    componentWillReceiveProps(nextProps) {
        if (nextProps.getDirectoriesAndLogs && nextProps.getDirectoriesAndLogs !== this.props.getDirectoriesAndLogs) {
            const { isFetching, data } = nextProps.getDirectoriesAndLogs;

            if (!isFetching && data && data.storeData) {
                let screenData = { name: data.storeData.name };
                this.setScreenName(screenData);
            }
        }
    }
    componentWillUnmount() {
        this.setScreenName(null);
    }

    render() {
        const { columns } = this.state;
        let { listAction, actionName, match, sortColumn, sortDirection } = this.props;

        return (
            <div className="grid-wrapper-area">
                <Row>
                    <Col>
                        <Grid
                            listAction={listAction}
                            dataProperty={actionName}
                            columns={columns}
                            autoHeight={true}
                            filename={"Logs"}
                            action={'getLogs'}
                            onRowClick={this.onRowClick}
                            directoryName={match.params.id}
                            defaultSort={{ sortColumn: sortColumn, sortDirection: sortDirection }}
                            pageProps={localStorage.getItem("currentPage")}
                            filters={[{ "value": this.props.match.params.id, "property": "storeId", "type": "string" }]}
                            //height="350"
                        />
                    </Col>
                </Row>
            </div>
        )
    }
}

Logs.defaultProps = {
    listAction: getDirectoriesAndLogs,
    actionName: 'getDirectoriesAndLogs',
    sortDirection: 'DESC',
    sortColumn: 'createdAt'
}

function mapStateToProps(state, ownProps) {
    return {
        getDirectoriesAndLogs: state.getDirectoriesAndLogs,
    };
}

export default connect(mapStateToProps)(Logs)