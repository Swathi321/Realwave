import React, { PureComponent } from 'react'
import PropTypes from 'prop-types';
import Grid from '../Grid/GridBase';
import { getIndustry, getReport, getWidget, getsmartDeviceType, getSmartDeviceTypes } from '../../redux/actions/httpRequest';
import { connect } from 'react-redux';
import utils from './../../Util/Util';
import classNames from 'classnames';
import { Collapse, Nav, NavItem, NavLink, TabContent, TabPane, Row, Card, CardBody, Col, CardHeader } from 'reactstrap';

export class Configuration extends PureComponent {
    constructor(props) {
        super(props)

        this.onRowClick = this.onRowClick.bind(this);
        this.beforeRender = this.beforeRender.bind(this);
        this.alreadyclicked = false;
        this.alreadyclickedTimeout = null;
        this.toggle = this.toggle.bind(this);

        let currentPageSize = localStorage.getItem("currentPageSize")
        let currentPage = localStorage.getItem("currentPage")

        const columns = [
            { key: 'name', name: 'Name', width: '25%', filter: true, sort: true, type: 'string' },
            { key: 'description', name: 'Description', width: '75%', filter: true, sort: true, type: 'string' }
        ];

        this.state = {
            prevPathDone: false,
            prevPropSmartDeviceType: false,
            searchValActive: false,
            activeTab: '1',
            tabs: {
                industries_reports: columns,
                widgets: [
                    { key: 'name', name: 'Name', width: '25%', filter: true, sort: true, type: 'string' },
                    { key: 'description', name: 'Description', width: '65%', filter: true, sort: true, type: 'string' },
                    { key: 'size', name: 'Size', width: '10%', filter: true, sort: true, type: 'string' }
                ],
                camera: [
                    { key: 'name', name: 'Name', width: '25%', filter: true, sort: true, type: 'string' },
                    { key: 'nativeConnectivity', name: 'Native Connection', width: '25%', filter: true, sort: true, type: 'string', 
                        formatter: (props, record) =>  record.nativeConnectivity === true ? <div>Yes</div> : <div>No</div> },
                    { key: 'notes', name: 'Notes', width: '75%', filter: true, sort: true, type: 'string' }
                ],
                smartDevices: [
                    { key: 'name', name: 'Name', width: '25%', filter: true, sort: true, type: 'string' },
                    { key: 'notes', name: 'Notes', width: '75%', filter: true, sort: true, type: 'string' }
                ],
            },
            columns: columns,
            collapse: -1,
            smartDeviceTypes: [],
            SmartDevicesTypesData: {},
            currentPageSize: currentPageSize,
            currentPage: currentPage
        };

        props.dispatch(getSmartDeviceTypes.request({ page: 1, pageSize: 20 }, '', "GET"));
    }

    toggleAccodion = (index) => {
        this.setState({ collapse: this.state.collapse === Number(index) ? -1 : Number(index) });
    }

    getFilters = name => {
        return [
            {
                "operator": "like",
                "value": 0,
                "property": `${name}Status`,
                "type": "numeric"
            }
        ]
    }

    toggle(tab, removeStorage) {

        const { activeTab, tabs } = this.state;

        if(removeStorage){
            localStorage.removeItem("currentPageSize");
            localStorage.removeItem("currentPage");
        }
       
        this.setState({ searchValActive: true, changePage: false });

        if (activeTab !== tab) {
            this.setState({ activeTab: tab });
        }

        if (tab == 1 || tab == 2) { // industries and reports
            this.setState({ columns: tabs.industries_reports });

        } else if (tab == 3) { // widgets
            this.setState({ columns: tabs.widgets });

        } else if (tab == 4) { // smart Devices
            this.setState({ columns: tabs.smartDevices });
        }
    }

    onRowClick = (FormType, index, record) => {
        if (this.alreadyclicked) {
            this.alreadyclicked = false;
            this.alreadyclickedTimeout && clearTimeout(this.alreadyclickedTimeout);
            utils.onNavigate({
                props: this.props,
                type: "push",
                route: '/admin/configuration/' + FormType + '/' + record._id
            });
        }
        else {
            this.alreadyclicked = true;
            this.alreadyclickedTimeout = setTimeout(() => {
                this.alreadyclicked = false;
            }, 300);
        }
    }

    addNew = (FormType, type) => {
        utils.onNavigate({
            props: this.props,
            type: "push",
            route: FormType == 'smartDeviceForm' ? '/admin/configuration/' + FormType + '/' + type + '/' + 0 : '/admin/configuration/' + FormType + '/' + 0
        });
    }

    getStoreName(storeData) {
        let name = '';
        storeData.forEach(element => {
            name += ", " + element.name;
        });
        if (name[0] == ",") {
            name = name.substring(1);
        }
        return name;
    }

    componentWillMount() {
        localStorage.removeItem("currentPage");
    }

    componentWillReceiveProps(nextProps) {

        if (nextProps.location.prevPath && !this.state.prevPathDone) {

            if (nextProps.location.prevPath.indexOf("reportForm") != -1) {
                this.toggle('2');
            } else if (nextProps.location.prevPath.indexOf("widgetForm") != -1) {
                this.toggle('3');
            } else if (nextProps.location.prevPath.indexOf("smartDeviceForm") != -1) {
                this.toggle('4');
            } else {
                this.toggle('1');
            }

            this.setState({ prevPathDone: true, changePage: true });
        }

        if (nextProps.SmartDevicesDiffTypesData && nextProps.SmartDevicesDiffTypesData.data) {

            let smartDeviceTypesData = nextProps.SmartDevicesDiffTypesData.data.data;
            let displaySmartDeviceTypes = []
            if (smartDeviceTypesData.length) {
                smartDeviceTypesData.forEach(option => {
                    displaySmartDeviceTypes.push(option);
                });
            }

            this.setState({ smartDeviceTypes: displaySmartDeviceTypes });

            if (nextProps.location.smartDeviceType && !this.state.prevPropSmartDeviceType) {
                let SmartDeviceIndex = displaySmartDeviceTypes.findIndex(item => item.toLowerCase() === nextProps.location.smartDeviceType.toLowerCase());

                this.setState({prevPropSmartDeviceType: true, collapse: SmartDeviceIndex });
            }
        }
    }

    beforeRender(data) {
        let customData = [];
        if (data && data.length > 0) {
            data.forEach(item => {
                let storeData = item.storeId;
                item.storeId = storeData instanceof Array ? this.getStoreName(storeData) : storeData;
                customData.push(item);
            });
        }
        this.setState({ searchValActive: false });
        return customData;
    }

    setPage = (page) => {
        localStorage.setItem('currentPage', page)
        this.setState({
            page: page
        })
    }

    render() {
        const { activeTab, loadedData, smartDeviceTypes, collapse, searchValActive, currentPageSize, changePage, currentPage, tabs } = this.state;

        let { sortColumn, sortDirection, industryAction, industryActionName, reportAction, reportActionName, widgetAction, widgetActionName, smartDeviceTypeAction, smartDeviceTypeActionName, localPaging } = this.props;

        return (
            <div className="mt-3 configTabs">

                <Nav tabs>
                    <NavItem>
                        <NavLink className={classNames({ active: activeTab === '1' })}
                            onClick={() => {
                                this.toggle('1', true);
                            }}>
                            Industries
                            </NavLink>
                    </NavItem>
                    <NavItem>
                        <NavLink className={classNames({ active: activeTab === '2' })}
                            onClick={() => {
                                this.toggle('2', true);
                            }}>
                            Reports
                            </NavLink>
                    </NavItem>
                    <NavItem>
                        <NavLink className={classNames({ active: activeTab === '3' })}
                            onClick={() => {
                                this.toggle('3', true);
                            }}>
                            Widgets
                            </NavLink>
                    </NavItem>
                    <NavItem>
                        <NavLink className={classNames({ active: activeTab === '4' })}
                            onClick={() => {
                                this.toggle('4', true);
                            }}>
                            Smart Devices
                            </NavLink>
                    </NavItem>
                </Nav>
                <TabContent activeTab={activeTab}>

                    <TabPane tabId="1">
                    { activeTab=="1" ?  <Row>
                            <Col>
                                <Grid
                                    beforeRender={this.beforeRender.bind(this)}
                                    loadedData={loadedData}
                                    listAction={industryAction}
                                    dataProperty={industryActionName}
                                    columns={tabs.industries_reports}
                                    autoHeight={true}
                                    filename={"Industry"}
                                    defaultSort={{ sortDirection: sortDirection }}
                                    localPaging={this.props.localPaging || false}
                                    onRowClick={this.onRowClick.bind(this, 'industryForm')}
                                    exportButton={false}
                                    add={() => this.addNew('industryForm')}
                                    screen={"Industries"}
                                    screenPathLocation={this.props.location}
                                    hidePref={true}
                                    searchVal={''}
                                    filters={this.getFilters('industry')}
                                    searchValActive={searchValActive}
                                    hideColumnButton={true}
                                    height={450}
                                    pageSizeProps={changePage ? currentPageSize : false}
                                    pageProps={changePage ? currentPage : false}
                                    setPage={this.setPage}
                                />
                            </Col>
                        </Row> : null}
                    </TabPane>
                </TabContent>
                <TabContent activeTab={activeTab}>
                    <TabPane tabId="2">
                    { activeTab=="2" ? <Row>
                            <Col>
                                <Grid
                                    beforeRender={this.beforeRender.bind(this)}
                                    loadedData={loadedData}
                                    listAction={reportAction}
                                    dataProperty={reportActionName}
                                    columns={tabs.industries_reports}
                                    autoHeight={true}
                                    filename={"Configuration"}
                                    defaultSort={{ sortColumn: sortColumn, sortDirection: sortDirection }}
                                    localPaging={this.props.localPaging || false}
                                    onRowClick={this.onRowClick.bind(this, 'reportForm')}
                                    exportButton={false}
                                    add={() => this.addNew('reportForm')}
                                    screen={"Reports"}
                                    screenPathLocation={this.props.location}
                                    hidePref={true}
                                    searchVal={''}
                                    filters={this.getFilters('report')}
                                    searchValActive={searchValActive}
                                    hideColumnButton={true}
                                    height={450}
                                    pageSizeProps={changePage ? currentPageSize : false}
                                    pageProps={changePage ? currentPage : false}
                                    setPage={this.setPage}
                                />
                            </Col>
                        </Row> : null}
                    </TabPane>
                </TabContent>
                <TabContent activeTab={activeTab}>
                    <TabPane tabId="3">
                        { activeTab=="3" ? <Row>
                            <Col>
                                <Grid
                                    beforeRender={this.beforeRender.bind(this)}
                                    loadedData={loadedData}
                                    listAction={widgetAction}
                                    dataProperty={widgetActionName}
                                    columns={tabs.widgets}
                                    autoHeight={true}
                                    filename={"Configuration"}
                                    defaultSort={{ sortColumn: sortColumn, sortDirection: sortDirection }}
                                    localPaging={this.props.localPaging || false}
                                    onRowClick={this.onRowClick.bind(this, 'widgetForm')}
                                    exportButton={false}
                                    add={() => this.addNew('widgetForm')}
                                    screen={"Widgets"}
                                    hidePref={true}
                                    searchVal={''}
                                    filters={this.getFilters('widget')}
                                    searchValActive={searchValActive}
                                    hideColumnButton={true}
                                    height={450}
                                    pageSizeProps={changePage ? currentPageSize : false}
                                    pageProps={changePage ? currentPage : false}
                                    setPage={this.setPage}
                                />
                            </Col>
                        </Row>  : null}
                    </TabPane>
                </TabContent>
                <TabContent activeTab={activeTab}>
                    <TabPane tabId="4">
                        <Col xs={12} sm={12} md={4} lg={5} >
                            <div className="cameracardText textConvert gridHeader mb-2">
                                <i className="fa icon2-events" aria-hidden="true" /> SMART DEVICES
                            </div>
                        </Col>

                        {smartDeviceTypes.map((item, index) => {
                            return (
                                <Card style={{ marginBottom: '1rem' }} key={index} className="SmartDeviceCard">
                                    <CardHeader onClick={() => this.toggleAccodion(index)} data-event={index}>{item}
                                        {collapse === index ? <i className="fa fa-angle-up floatRight" /> : <i className="fa fa-angle-down floatRight" />}
                                    </CardHeader>

                                    <Collapse isOpen={collapse === index}>

                                        <CardBody>
                                            {collapse === index ? <Row>
                                                <Col>
                                                    <Grid
                                                        beforeRender={this.beforeRender.bind(this)}
                                                        loadedData={loadedData}
                                                        listAction={smartDeviceTypeAction}
                                                        dataProperty={smartDeviceTypeActionName}
                                                        columns={item.toLowerCase()==="camera" ? tabs.camera : tabs.smartDevices}
                                                        autoHeight={true}
                                                        defaultSort={{ sortColumn: sortColumn, sortDirection: sortDirection }}
                                                        localPaging={this.props.localPaging || false}
                                                        onRowClick={this.onRowClick.bind(this, 'smartDeviceForm')}
                                                        exportButton={false}
                                                        add={() => this.addNew('smartDeviceForm', item)}
                                                        hidePref={true}
                                                        hideColumnButton={true}
                                                        hideSearch={true}
                                                        searchVal={''}
                                                        deviceType={item}
                                                        action="type"
                                                        pageSizeProps={changePage ? currentPageSize : false}
                                                        pageProps={changePage ? currentPage : false}
                                                        MoveAddInAccodian={" PlusSmartDeviceConfig"}
                                                        zeroHeight={" zeroHeight"}
                                                        setPage={this.setPage}
                                                    />
                                                </Col>
                                            </Row> : null}
                                        </CardBody>
                                    </Collapse>
                                </Card>
                            )
                        })}
                    </TabPane>
                </TabContent>
            </div>
        )
    }
}

Configuration.defaultProps = {
    industryAction: getIndustry,
    industryActionName: 'getIndustry',
    reportAction: getReport,
    reportActionName: 'getReport',
    widgetAction: getWidget,
    widgetActionName: 'getWidget',
    smartDeviceTypeAction: getsmartDeviceType,
    smartDeviceTypeActionName: 'getsmartDeviceType',
}

Configuration.contextTypes = {
    router: PropTypes.object.isRequired
};

function mapStateToProps(state, ownProps) {
    return {
        industryData: state.getIndustry,
        reportData: state.getReport,
        widgetData: state.getWidget,
        smartDeviceData: state.getSmartDevice,
        SmartDevicesDiffTypesData: state.getSmartDeviceTypes,
        smartDeviceTypesData: state.getsmartDeviceType
    };
}

var ConfigurationModule = connect(mapStateToProps)(Configuration);
export default ConfigurationModule;
