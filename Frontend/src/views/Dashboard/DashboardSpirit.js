import React, { PureComponent } from "react";
import './DashboardSpirit.css';
import Highcharts from 'highcharts';
import HighchartsReact from 'highcharts-react-official';
import HeatMapChart from './HeatMap';
import MapView from '../MapView/MapView';

import axios from 'axios'
import { connect } from 'react-redux'
import serverAPI from '../../redux/httpUtil/serverApi'
import consts from '../../Util/consts';
import { Table, Row, Col, Card, CardBody, CardHeader, Modal, ModalHeader, ModalBody, ModalFooter, CardSubtitle, CardTitle, Button } from 'reactstrap';
import { Button as AntButton, Tooltip } from 'antd';
import Select from 'react-select';


const options = {
    chart: {
        type: 'area',
        height: 344
    },
    title: {
        text: ''
    },
    xAxis: {
        allowDecimals: false,
        labels: {
            formatter: function () {
                return this.value; // clean, unformatted number for year
            }
        },
        accessibility: {
            rangeDescription: 'Range: 1940 to 2017.'
        }
    },
    yAxis: {
        title: {
            text: ''
        },
        labels: {
            formatter: function () {
                return this.value / 1000 + 'k';
            }
        }
    },
    tooltip: {
        pointFormat: '{series.name} had stockpiled <b>{point.y:,.0f}</b><br/>warheads in {point.x}',
        enabled: false
    },
    plotOptions: {
        area: {
            color: '#4dc3bb',
            pointStart: 39,
            pointInterval: 1,
            marker: {
                enabled: false,
                symbol: 'circle',
                radius: 2,
                states: {
                    hover: {
                        enabled: true
                    }
                }
            }
        }
    },
    responsive: {
        rules: [{
            condition: {
                maxHeight: 220
            }

        }]
    },
    series: [{
        name: 'Spirit',
        data: [
            null, null, null, null, null, 6, 11, 32, 110, 235,
            369, 640, 1005, 36, 63, 57, 618, 444, 220, 158,
            234, 226, 287, 259, 356, 382, 320, 313, 294, 272,
            262, 266, 272, 289, 285, 276, 259, 252, 226, 205,
            244, 234, 238, 249, 247, 247, 241, 244, 286, 280,
            214, 177, 147, 136, 125, 124, 119, 100, 171, 124,
            107, 107, 105, 121, 108, 105, 104, 514, 620, 260,
            513, 513, 454, 484, 471, 477, 438, 18
        ]
    }],
    color: '#000 !important'
}

class DashboardSpirit extends PureComponent {

    constructor(props) {
        super(props)

        this.state = {
            dashboard: [],
            isLoading: false,
            isScrollingDown: false
        }

    }

    componentDidMount() {
        //this.loadData()
       // this.intervalId = setInterval(this.loadData.bind(this), 60000);
    }

    componentDidUpdate(prevProps, prevState) {
        if( JSON.stringify(prevProps.siteDashboardData) !== JSON.stringify(this.props.siteDashboardData)) {
            this.setState({ dashboard: this.props.siteDashboardData });
        }
    }

    // componentWillUnmount() {
    //     clearInterval(this.intervalId);
    // }

    // async loadData() {
    //     try {
    //         axios.get(serverAPI.DASHBOARD_DATA)
    //             .then(response => {
    //                 console.log('Dashboard2:', response.data.alldata.length)
    //                 const dataCount = response.data.alldata.length - 1;
    //                 var result = {};
    //                 for (var i = 0; i < response.data.alldata.length; i++) {
    //                     result[response.data.alldata[i]._id] = response.data.alldata[i];
    //                 }
    //                 this.setState({ dashboard: result })
    //                 this.setState({ isLoading: false });

    //             })
    //             .catch(err => console.log(err))
    //     } catch (e) {
    //         console.log(e);
    //     }
    // }

    getColor = (wait_time_ind) => {
        if (wait_time_ind == 2) {
            return "red"
        } else if (wait_time_ind == 1) {
            return "yellow"
        } else {
            return "green"
        }
    }

    displayData = (data) => {
        return data ? data : "00:00";
    }

    getStoresStatus = (stoteStatus) => {
        const { data, isFetching } = this.props.storesData || {};
        if (!isFetching) {
            return data && data.stores ? data.stores.filter(({ status }) => status === stoteStatus).length : 0;
        }
    }

    getCamerasStatus = (cameraStatus) => {
        const { data, isFetching } = this.props.storesData || {};
        if (!isFetching) {
            return data && data.data ? data.data.filter(({ status }) => status === cameraStatus).length : 0;
        }
    }

    render() {
        //const dashboardText3 = this.state.dashboard;
        let dashboardText = {};
        let twentyfour_hour = {};
        if (this.state.dashboard["24 Hour"]) {
            twentyfour_hour = this.state.dashboard["24 Hour"];
            twentyfour_hour = twentyfour_hour.top_one[0];
        }

        const one_hour = this.state.dashboard["1 Hour"];

        if (one_hour) {
            dashboardText = one_hour.top_one[0];
        }
        let { KIOSK, BAG_DROP, SELF_SERVICE, FULL_SERVICE } = dashboardText;

        return (

            <div className="col-md-12">
                {
                    this.state.isLoading ? null
                        :
                        <div id="main">

                            <div class="service-top">
                                <div class="box1" style={{marginLeft: "20px"}}>
                                    <table>
                                        <tr>
                                            <th></th>
                                            <th class="text-center">Active</th>
                                            <th class="text-center">Offline</th>
                                        </tr>
                                        <tr>
                                            <td class="pb-2">Sites</td>
                                            {/* <td class="text-center">{dashboardText.ACTIVE_SITES}</td> */}
                                            <td class="text-center">{this.getStoresStatus('Active')}</td>

                                            <td class="text-center">{this.getStoresStatus('Inactive')}</td>
                                        </tr>
                                        <tr>
                                            <td>Cameras</td>
                                            {/* <td class="text-center">{dashboardText.ACTIVE_CAMERAS}</td> */}
                                            <td class="text-center">{this.getCamerasStatus('Active')}</td>
                                            <td class="text-center">{this.getCamerasStatus('Inactive')}</td>

                                        </tr>

                                    </table>
                                </div>
                                <div class="box2">
                                    <h6>kiosk</h6>
                                    <table>
                                        <tr class="box2content">
                                            <th>wait<br /> time</th>
                                            <td><span class={this.getColor(KIOSK && KIOSK.wait_time_ind)}>{this.displayData(KIOSK && KIOSK.wait_time)}</span><br /><p>avg hour</p></td>
                                            <td class="d-flex"><span class="addbefore" style={{ 'color': `${this.getColor(KIOSK && KIOSK.wait_time_var_ind)}` }}>{this.displayData(KIOSK && KIOSK.wait_time_var)}<br /><small>var</small></span>
                                                <div>
                                                    <span>{this.displayData(twentyfour_hour.KIOSK && twentyfour_hour.KIOSK.wait_time)}</span><br /><p>avg Today</p>
                                                </div>
                                            </td>
                                        </tr>
                                        <tr class="box2content">
                                            <th class="text-center">service<br /> time</th>
                                            <td><span class={this.getColor(KIOSK && KIOSK.service_time_ind)}>{this.displayData(KIOSK && KIOSK.service_time)}</span></td>
                                            <td><div class="d-flex"><span class="addbefore" style={{ 'color': `${this.getColor(KIOSK && KIOSK.service_time_var_ind)}` }}>{this.displayData(KIOSK && KIOSK.service_time_var)}</span> <span class="ml-auto">
                                                {this.displayData(twentyfour_hour.KIOSK && twentyfour_hour.KIOSK.service_time)}</span></div></td>                                        </tr>

                                    </table>
                                </div>
                                <div class="box2">
                                    <h6>bag drop</h6>
                                    <table>
                                        <tr class="box2content">
                                            <th>wait<br /> time</th>
                                            <td><span class={this.getColor(BAG_DROP && BAG_DROP.wait_time_ind)}>{this.displayData(BAG_DROP && BAG_DROP.wait_time)}</span><br /><p>avg hour</p></td>
                                            <td class="d-flex"><span class="addbefore" style={{ 'color': `${this.getColor(BAG_DROP && BAG_DROP.wait_time_var_ind)}` }}>{this.displayData(BAG_DROP && BAG_DROP.wait_time_var)}<br /><small>var</small></span>
                                                <div><span>{this.displayData(twentyfour_hour.BAG_DROP && twentyfour_hour.BAG_DROP.wait_time)}</span><br /><p>avg Today</p></div></td>
                                        </tr>
                                        <tr class="box2content">
                                            <th class="text-center">service<br /> time</th>
                                            <td><span class={this.getColor(BAG_DROP && BAG_DROP.service_time_ind)}>{this.displayData(BAG_DROP && BAG_DROP.service_time)}</span></td>
                                            <td><div class="d-flex"><span class="addbefore" style={{ 'color': `${this.getColor(BAG_DROP && BAG_DROP.service_time_var_ind)}` }}>{this.displayData(BAG_DROP && BAG_DROP.service_time_var)}</span> <span class="ml-auto">
                                                {this.displayData(twentyfour_hour.BAG_DROP && twentyfour_hour.BAG_DROP.service_time)}</span></div></td>                                        </tr>

                                    </table>
                                </div>
                                <div class="box2">
                                    <h6>self service</h6>
                                    <table>
                                        <tr class="box2content">
                                            <th>wait<br /> time</th>
                                            <td><span >{this.displayData(SELF_SERVICE && SELF_SERVICE.wait_time)}</span><br /><p>avg hour</p></td>

                                        </tr>
                                        <tr class="box2content">
                                            <th class="text-center">service<br /> time</th>
                                            <td><span >{this.displayData(SELF_SERVICE && SELF_SERVICE.service_time)}</span></td>

                                        </tr>

                                    </table>
                                </div>
                                <div class="box2">
                                    <h6>full service</h6>
                                    <table>
                                        <tr class="box2content">
                                            <th>wait<br /> time</th>
                                            <td><span class={this.getColor(FULL_SERVICE && FULL_SERVICE.wait_time_ind)}>{this.displayData(FULL_SERVICE && FULL_SERVICE.wait_time)}</span><br /><p>avg hour</p></td>
                                            <td class="d-flex"><span class="addbefore" style={{ 'color': `${this.getColor(FULL_SERVICE && FULL_SERVICE.wait_time_var_ind)}` }}>{this.displayData(FULL_SERVICE && FULL_SERVICE.wait_time_var)}<br /><small>var</small></span>
                                                <div><span>{this.displayData(twentyfour_hour.FULL_SERVICE && twentyfour_hour.FULL_SERVICE.wait_time)}</span><br /><p>avg Today</p></div></td>
                                        </tr>
                                        <tr class="box2content">
                                            <th class="text-center">service<br /> time</th>
                                            <td><span class={this.getColor(FULL_SERVICE && FULL_SERVICE.service_time_ind)}>{this.displayData(FULL_SERVICE && FULL_SERVICE.service_time)}</span></td>
                                            <td><div class="d-flex"><span class="addbefore" style={{ 'color': `${this.getColor(FULL_SERVICE && FULL_SERVICE.service_time_var_ind)}` }}>{this.displayData(FULL_SERVICE && FULL_SERVICE.service_time_var)}</span> <span class="ml-auto">
                                                {this.displayData(twentyfour_hour.FULL_SERVICE && twentyfour_hour.FULL_SERVICE.service_time)}</span></div></td>
                                        </tr>

                                    </table>
                                </div>
                            </div>
                            <Card>
                                <CardHeader className="dashboardMain-cardheader">
                                    <Tooltip placement="bottom" title={consts.PendingClip} {...this.props.showTooltip} onClick={() => this.props.handlePendingClip(true)}>
                                        <i className="ml-3 dashboard-button float-right fa fa-video-camera customLeftSeparator dashboard-Body-Content-Divider cursor dashboardvideoicon" />
                                    </Tooltip>
                                    <Tooltip placement="bottom" title={consts.AddWidgets} {...this.props.showTooltip} onClick={() => this.props.handleWidget(true)}>
                                        <i className="ml-3 dashboard-button float-right fa icon2-add-widget-icon customLeftSeparator dashboard-Body-Content-Divider cursor" />
                                    </Tooltip>
                                    <Tooltip placement="bottom" title={consts.DragSwitch}>
                                        <i onClick={() => this.props.enableDisableDragAndDrop()} className={`ml-3 dashboard-button float-right customLeftSeparator dashboard-Body-Content-Divider cursor fa icon2-drag-widget-icon ${this.props.checked ? '' : ' icon2'}`} />
                                    </Tooltip>
                                    <Tooltip placement="bottom" title={consts.SaveLayout}>
                                        <i onClick={() => this.props.onSaveConfiguration()} className="ml-3 dashboard-button float-right fa icon2-save-layout-icon cursor" />
                                    </Tooltip>
                                    <Select className="fausd"
                                        isClearable={false}
                                        placeholder="Select"
                                        id="TransactionFilter"
                                        value={this.props.selectedStore || []}
                                        options={this.props.storeOptions}
                                        onChange={this.props.onStoreChange}
                                    />
                                </CardHeader>

                            </Card>

                            {/* <div class="mylayout">
                        <div aria-label="breadcrumb">
                            <ol class="breadcrumb">
                                <li class="breadcrumb-item"><a href="#">SAVED LAYOUT </a></li>
                                <li class="breadcrumb-item active" aria-current="page"><a href="#">Spirit1</a></li>
                            </ol>
                        </div>
                        <span>MY LAYOUT</span>
                        <ul class="list-inline">
                            <li><i class="fas fa-file-invoice"></i></li>
                            <li class="list-border"><i class="fas fa-hand-point-up"></i></li>
                            <li><i class="far fa-calendar"></i></li>
                        </ul>
                    </div> */}
                            {/* <div class="wrapper">
                                <div class="card">
                                    <div class="card-header">
                                        <h5><span><i class="fas fa-user-friends"></i></span> ticket counter layout view</h5>
                                        <h5> ticket counter layout view</h5>
                                        <div class="dropdown float-right mr-5">
                                            <button class="btn dropdown-toggle" type="button" id="dropdownMenuButton" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
                                                atl airport <i class="fas fa-angle-down"></i>
                                            </button>
                                            <div class="dropdown-menu" aria-labelledby="dropdownMenuButton">
                                                <a class="dropdown-item" href="#">option1</a>
                                                <a class="dropdown-item" href="#">option2</a>
                                                <a class="dropdown-item" href="#">option3</a>
                                            </div>
                                        </div>
                                        <div class="close-btn"><i class="far fa-times-circle"></i></div>
                                    </div>
                                    <div class="card-body">
                                        <div class="card-title">
                                            <h5>atl airport</h5>
                                            <div class="dropdown float-right mr-5">
                                                <button class="btn dropdown-toggle pt-0" type="button" id="dropdownMenuButton2" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
                                                    total guests within last hour <i class="fas fa-angle-down"></i>
                                                </button>
                                                <div class="dropdown-menu" aria-labelledby="dropdownMenuButton2">
                                                    <a class="dropdown-item" href="#">option1</a>
                                                    <a class="dropdown-item" href="#">option2</a>
                                                    <a class="dropdown-item" href="#">option3</a>
                                                </div>
                                            </div>
                                            <div class="close-btn" style={{ top: 2 }}><i class="fas fa-compress-alt"></i></div>
                                        </div>
                                        <div class="card-text">
                                            <div class="ticket-counter">
                                                <div class="bg-img">
                                                    <div class="bg-bar">
                                                        <svg version="1.1" id="Layer_1" xmlns="http://www.w3.org/2000/svg" xlink="http://www.w3.org/1999/xlink" x="0px" y="0px" width="943px" height="37px" viewBox="0 0 943 37" enable-background="new 0 0 943 37" space="preserve">
                                                            <rect x="-3" y="-4" opacity="0" width="950" height="44" />
                                                            <rect x="0.811" y="-0.864" fill="#CECECE" width="943" height="37" />
                                                        </svg>
                                                    </div>
                                                    <div class="ticket-computers">
                                                        <div>
                                                            <div class="top-reading d-flex">
                                                                <span class="w-50 border-right">{CUSTOMER_PROCESSED_LH && CUSTOMER_PROCESSED_LH.counter16}</span>
                                                                <span class="w-50">{CUSTOMER_PROCESSED_LH && CUSTOMER_PROCESSED_LH.counter15}</span>
                                                            </div>
                                                            <svg version="1.1" id="Layer_1" xmlns="http://www.w3.org/2000/svg" xlink="http://www.w3.org/1999/xlink" x="0px" y="0px" width="115px" height="63px" viewBox="0 0 115 63" enable-background="new 0 0 115 63" space="preserve">
                                                                <path fill="#E4E4E4" d="M3.855,42.189V22.74c0-3.696,2.997-6.693,6.693-6.693h94.791c3.696,0,6.693,2.997,6.693,6.693v19.449
            							c0,3.695-2.997,6.693-6.693,6.693H10.549C6.852,48.883,3.855,45.885,3.855,42.189z"/>
                                                                <polygon fill="#808080" points="5.668,46.027 15.092,60.758 102.675,60.795 110.601,45.752 " />
                                                                <path fill="#676767" d="M25.925,21.088c-3.276,3.272-3.276,8.577,0,11.85c3.276,3.271,8.587,3.271,11.863,0
            							c3.276-3.272,3.276-8.578,0-11.85C34.512,17.815,29.201,17.815,25.925,21.088"/>
                                                                <polygon fill="#676767" points="48.629,30.282 14.185,25.631 11.931,7.908 54.02,13.549 " />
                                                                <polygon fill={AGENTS && AGENTS.counter16 == 1 ? "#FFE52A" : "#BFBFBF"} points="45.966,28.127 17.331,24.26 15.627,11.196 49.967,15.802 " />
                                                                <rect x="12.045" y="5.696" transform="matrix(0.991 0.1338 -0.1338 0.991 1.3994 -4.3909)" fill="#9A9A9A" width="42.642" height="5.04" />
                                                                <path fill="#676767" d="M80.539,20.796c-3.275,3.272-3.275,8.578,0,11.85c3.276,3.272,8.588,3.272,11.863,0
            							c3.276-3.272,3.276-8.577,0-11.85C89.127,17.523,83.815,17.523,80.539,20.796"/>
                                                                <polygon fill="#676767" points="103.097,24.317 68.881,30.426 61.307,14.243 103.103,6.739 " />
                                                                <polygon fill={AGENTS && AGENTS.counter15 == 1 ? "#FFE52A" : "#BFBFBF"} points="99.901,23.082 71.456,28.159 65.832,16.243 99.934,10.124 " />
                                                                <rect x="60.481" y="5.461" transform="matrix(0.9844 -0.1757 0.1757 0.9844 -0.1296 14.4989)" fill="#9A9A9A" width="42.641" height="5.041" />
                                                            </svg>
                                                        </div>

                                                        <div>
                                                            <div class="top-reading d-flex">
                                                                <span class="w-50 border-right ">{CUSTOMER_PROCESSED_LH && CUSTOMER_PROCESSED_LH.counter14}</span>
                                                                <span class="w-50 ">{CUSTOMER_PROCESSED_LH && CUSTOMER_PROCESSED_LH.counter13}</span>
                                                            </div>
                                                            <svg version="1.1" id="Layer_1" xmlns="http://www.w3.org/2000/svg" xlink="http://www.w3.org/1999/xlink" x="0px" y="0px" width="115px" height="63px" viewBox="0 0 115 63" enable-background="new 0 0 115 63" space="preserve">
                                                                <path fill="#E4E4E4" d="M3.855,42.189V22.74c0-3.696,2.997-6.693,6.693-6.693h94.791c3.696,0,6.693,2.997,6.693,6.693v19.449
            							c0,3.695-2.997,6.693-6.693,6.693H10.549C6.852,48.883,3.855,45.885,3.855,42.189z"/>
                                                                <polygon fill="#808080" points="5.668,46.027 15.092,60.758 102.675,60.795 110.601,45.752 " />
                                                                <path fill="#676767" d="M25.925,21.088c-3.276,3.272-3.276,8.577,0,11.85c3.276,3.271,8.587,3.271,11.863,0
            							c3.276-3.272,3.276-8.578,0-11.85C34.512,17.815,29.201,17.815,25.925,21.088"/>
                                                                <polygon fill="#676767" points="48.629,30.282 14.185,25.631 11.931,7.908 54.02,13.549 " />
                                                                <polygon fill={AGENTS && AGENTS.counter14 == 1 ? "#FFE52A" : "#BFBFBF"} points="45.966,28.127 17.331,24.26 15.627,11.196 49.967,15.802 " />
                                                                <rect x="12.045" y="5.696" transform="matrix(0.991 0.1338 -0.1338 0.991 1.3994 -4.3909)" fill="#9A9A9A" width="42.642" height="5.04" />
                                                                <path fill="#676767" d="M80.539,20.796c-3.275,3.272-3.275,8.578,0,11.85c3.276,3.272,8.588,3.272,11.863,0
            							c3.276-3.272,3.276-8.577,0-11.85C89.127,17.523,83.815,17.523,80.539,20.796"/>
                                                                <polygon fill="#676767" points="103.097,24.317 68.881,30.426 61.307,14.243 103.103,6.739 " />
                                                                <polygon fill={AGENTS && AGENTS.counter13 == 1 ? "#FFE52A" : "#BFBFBF"} points="99.901,23.082 71.456,28.159 65.832,16.243 99.934,10.124 " />
                                                                <rect x="60.481" y="5.461" transform="matrix(0.9844 -0.1757 0.1757 0.9844 -0.1296 14.4989)" fill="#9A9A9A" width="42.641" height="5.041" />
                                                            </svg>
                                                        </div>

                                                        <div>
                                                            <div class="top-reading d-flex">
                                                                <span class="w-50 border-right">{CUSTOMER_PROCESSED_LH && CUSTOMER_PROCESSED_LH.counter12}</span>
                                                                <span class="w-50 ">{CUSTOMER_PROCESSED_LH && CUSTOMER_PROCESSED_LH.counter11}</span>
                                                            </div>
                                                            <svg version="1.1" id="Layer_1" xmlns="http://www.w3.org/2000/svg" xlink="http://www.w3.org/1999/xlink" x="0px" y="0px" width="115px" height="63px" viewBox="0 0 115 63" enable-background="new 0 0 115 63" space="preserve">
                                                                <path fill="#E4E4E4" d="M3.855,42.189V22.74c0-3.696,2.997-6.693,6.693-6.693h94.791c3.696,0,6.693,2.997,6.693,6.693v19.449
            							c0,3.695-2.997,6.693-6.693,6.693H10.549C6.852,48.883,3.855,45.885,3.855,42.189z"/>
                                                                <polygon fill="#808080" points="5.668,46.027 15.092,60.758 102.675,60.795 110.601,45.752 " />
                                                                <path fill="#676767" d="M25.925,21.088c-3.276,3.272-3.276,8.577,0,11.85c3.276,3.271,8.587,3.271,11.863,0
            							c3.276-3.272,3.276-8.578,0-11.85C34.512,17.815,29.201,17.815,25.925,21.088"/>
                                                                <polygon fill="#676767" points="48.629,30.282 14.185,25.631 11.931,7.908 54.02,13.549 " />
                                                                <polygon fill={AGENTS && AGENTS.counter12 == 1 ? "#FFE52A" : "#BFBFBF"} points="45.966,28.127 17.331,24.26 15.627,11.196 49.967,15.802 " />
                                                                <rect x="12.045" y="5.696" transform="matrix(0.991 0.1338 -0.1338 0.991 1.3994 -4.3909)" fill="#9A9A9A" width="42.642" height="5.04" />
                                                                <path fill="#676767" d="M80.539,20.796c-3.275,3.272-3.275,8.578,0,11.85c3.276,3.272,8.588,3.272,11.863,0
            							c3.276-3.272,3.276-8.577,0-11.85C89.127,17.523,83.815,17.523,80.539,20.796"/>
                                                                <polygon fill="#676767" points="103.097,24.317 68.881,30.426 61.307,14.243 103.103,6.739 " />
                                                                <polygon fill={AGENTS && AGENTS.counter11 == 1 ? "#FFE52A" : "#BFBFBF"} points="99.901,23.082 71.456,28.159 65.832,16.243 99.934,10.124 " />
                                                                <rect x="60.481" y="5.461" transform="matrix(0.9844 -0.1757 0.1757 0.9844 -0.1296 14.4989)" fill="#9A9A9A" width="42.641" height="5.041" />
                                                            </svg>
                                                        </div>

                                                        <div>
                                                            <div class="top-reading d-flex">
                                                                <span class="w-50 border-right ">{CUSTOMER_PROCESSED_LH && CUSTOMER_PROCESSED_LH.counter10}</span>
                                                                <span class="w-50 ">{CUSTOMER_PROCESSED_LH && CUSTOMER_PROCESSED_LH.counter9}</span>
                                                            </div>
                                                            <svg version="1.1" id="Layer_1" xmlns="http://www.w3.org/2000/svg" xlink="http://www.w3.org/1999/xlink" x="0px" y="0px" width="115px" height="63px" viewBox="0 0 115 63" enable-background="new 0 0 115 63" space="preserve">
                                                                <path fill="#E4E4E4" d="M3.855,42.189V22.74c0-3.696,2.997-6.693,6.693-6.693h94.791c3.696,0,6.693,2.997,6.693,6.693v19.449
            							c0,3.695-2.997,6.693-6.693,6.693H10.549C6.852,48.883,3.855,45.885,3.855,42.189z"/>
                                                                <polygon fill="#808080" points="5.668,46.027 15.092,60.758 102.675,60.795 110.601,45.752 " />
                                                                <path fill="#676767" d="M25.925,21.088c-3.276,3.272-3.276,8.577,0,11.85c3.276,3.271,8.587,3.271,11.863,0
            							c3.276-3.272,3.276-8.578,0-11.85C34.512,17.815,29.201,17.815,25.925,21.088"/>
                                                                <polygon fill="#676767" points="48.629,30.282 14.185,25.631 11.931,7.908 54.02,13.549 " />
                                                                <polygon fill={AGENTS && AGENTS.counter10 == 1 ? "#FFE52A" : "#BFBFBF"} points="45.966,28.127 17.331,24.26 15.627,11.196 49.967,15.802 " />
                                                                <rect x="12.045" y="5.696" transform="matrix(0.991 0.1338 -0.1338 0.991 1.3994 -4.3909)" fill="#9A9A9A" width="42.642" height="5.04" />
                                                                <path fill="#676767" d="M80.539,20.796c-3.275,3.272-3.275,8.578,0,11.85c3.276,3.272,8.588,3.272,11.863,0
            							c3.276-3.272,3.276-8.577,0-11.85C89.127,17.523,83.815,17.523,80.539,20.796"/>
                                                                <polygon fill="#676767" points="103.097,24.317 68.881,30.426 61.307,14.243 103.103,6.739 " />
                                                                <polygon fill={AGENTS && AGENTS.counter9 == 1 ? "#FFE52A" : "#BFBFBF"} points="99.901,23.082 71.456,28.159 65.832,16.243 99.934,10.124 " />
                                                                <rect x="60.481" y="5.461" transform="matrix(0.9844 -0.1757 0.1757 0.9844 -0.1296 14.4989)" fill="#9A9A9A" width="42.641" height="5.041" />
                                                            </svg>
                                                        </div>

                                                        <div>
                                                            <div class="top-reading d-flex">
                                                                <span class="w-50 border-right">{CUSTOMER_PROCESSED_LH && CUSTOMER_PROCESSED_LH.counter8}</span>
                                                                <span class="w-50 ">{CUSTOMER_PROCESSED_LH && CUSTOMER_PROCESSED_LH.counter7}</span>
                                                            </div>
                                                            <svg version="1.1" id="Layer_1" xmlns="http://www.w3.org/2000/svg" xlink="http://www.w3.org/1999/xlink" x="0px" y="0px" width="115px" height="63px" viewBox="0 0 115 63" enable-background="new 0 0 115 63" space="preserve">
                                                                <path fill="#E4E4E4" d="M3.855,42.189V22.74c0-3.696,2.997-6.693,6.693-6.693h94.791c3.696,0,6.693,2.997,6.693,6.693v19.449
            							c0,3.695-2.997,6.693-6.693,6.693H10.549C6.852,48.883,3.855,45.885,3.855,42.189z"/>
                                                                <polygon fill="#808080" points="5.668,46.027 15.092,60.758 102.675,60.795 110.601,45.752 " />
                                                                <path fill="#676767" d="M25.925,21.088c-3.276,3.272-3.276,8.577,0,11.85c3.276,3.271,8.587,3.271,11.863,0
            							c3.276-3.272,3.276-8.578,0-11.85C34.512,17.815,29.201,17.815,25.925,21.088"/>
                                                                <polygon fill="#676767" points="48.629,30.282 14.185,25.631 11.931,7.908 54.02,13.549 " />
                                                                <polygon fill={AGENTS && AGENTS.counter8 == 1 ? "#FFE52A" : "#BFBFBF"} points="45.966,28.127 17.331,24.26 15.627,11.196 49.967,15.802 " />
                                                                <rect x="12.045" y="5.696" transform="matrix(0.991 0.1338 -0.1338 0.991 1.3994 -4.3909)" fill="#9A9A9A" width="42.642" height="5.04" />
                                                                <path fill="#676767" d="M80.539,20.796c-3.275,3.272-3.275,8.578,0,11.85c3.276,3.272,8.588,3.272,11.863,0
            							c3.276-3.272,3.276-8.577,0-11.85C89.127,17.523,83.815,17.523,80.539,20.796"/>
                                                                <polygon fill="#676767" points="103.097,24.317 68.881,30.426 61.307,14.243 103.103,6.739 " />
                                                                <polygon fill={AGENTS && AGENTS.counter7 == 1 ? "#FFE52A" : "#BFBFBF"} points="99.901,23.082 71.456,28.159 65.832,16.243 99.934,10.124 " />
                                                                <rect x="60.481" y="5.461" transform="matrix(0.9844 -0.1757 0.1757 0.9844 -0.1296 14.4989)" fill="#9A9A9A" width="42.641" height="5.041" />
                                                            </svg>
                                                        </div>

                                                        <div>
                                                            <div class="top-reading d-flex">
                                                                <span class="w-50 border-right">{CUSTOMER_PROCESSED_LH && CUSTOMER_PROCESSED_LH.counter6}</span>
                                                                <span class="w-50 ">{CUSTOMER_PROCESSED_LH && CUSTOMER_PROCESSED_LH.counter5}</span>
                                                            </div>
                                                            <svg version="1.1" id="Layer_1" xmlns="http://www.w3.org/2000/svg" xlink="http://www.w3.org/1999/xlink" x="0px" y="0px" width="115px" height="63px" viewBox="0 0 115 63" enable-background="new 0 0 115 63" space="preserve">
                                                                <path fill="#E4E4E4" d="M3.855,42.189V22.74c0-3.696,2.997-6.693,6.693-6.693h94.791c3.696,0,6.693,2.997,6.693,6.693v19.449
            							c0,3.695-2.997,6.693-6.693,6.693H10.549C6.852,48.883,3.855,45.885,3.855,42.189z"/>
                                                                <polygon fill="#808080" points="5.668,46.027 15.092,60.758 102.675,60.795 110.601,45.752 " />
                                                                <path fill="#676767" d="M25.925,21.088c-3.276,3.272-3.276,8.577,0,11.85c3.276,3.271,8.587,3.271,11.863,0
            							c3.276-3.272,3.276-8.578,0-11.85C34.512,17.815,29.201,17.815,25.925,21.088"/>
                                                                <polygon fill="#676767" points="48.629,30.282 14.185,25.631 11.931,7.908 54.02,13.549 " />
                                                                <polygon fill={AGENTS && AGENTS.counter6 == 1 ? "#FFE52A" : "#BFBFBF"} points="45.966,28.127 17.331,24.26 15.627,11.196 49.967,15.802 " />
                                                                <rect x="12.045" y="5.696" transform="matrix(0.991 0.1338 -0.1338 0.991 1.3994 -4.3909)" fill="#9A9A9A" width="42.642" height="5.04" />
                                                                <path fill="#676767" d="M80.539,20.796c-3.275,3.272-3.275,8.578,0,11.85c3.276,3.272,8.588,3.272,11.863,0
            							c3.276-3.272,3.276-8.577,0-11.85C89.127,17.523,83.815,17.523,80.539,20.796"/>
                                                                <polygon fill="#676767" points="103.097,24.317 68.881,30.426 61.307,14.243 103.103,6.739 " />
                                                                <polygon fill={AGENTS && AGENTS.counter5 == 1 ? "#FFE52A" : "#BFBFBF"} points="99.901,23.082 71.456,28.159 65.832,16.243 99.934,10.124 " />
                                                                <rect x="60.481" y="5.461" transform="matrix(0.9844 -0.1757 0.1757 0.9844 -0.1296 14.4989)" fill="#9A9A9A" width="42.641" height="5.041" />
                                                            </svg>
                                                        </div>

                                                        <div>
                                                            <div class="top-reading d-flex">
                                                                <span class="w-50 border-right">{CUSTOMER_PROCESSED_LH && CUSTOMER_PROCESSED_LH.counter4}</span>
                                                                <span class="w-50 ">{CUSTOMER_PROCESSED_LH && CUSTOMER_PROCESSED_LH.counter3}</span>
                                                            </div>
                                                            <svg version="1.1" id="Layer_1" xmlns="http://www.w3.org/2000/svg" xlink="http://www.w3.org/1999/xlink" x="0px" y="0px" width="115px" height="63px" viewBox="0 0 115 63" enable-background="new 0 0 115 63" space="preserve">
                                                                <path fill="#E4E4E4" d="M3.855,42.189V22.74c0-3.696,2.997-6.693,6.693-6.693h94.791c3.696,0,6.693,2.997,6.693,6.693v19.449
            							c0,3.695-2.997,6.693-6.693,6.693H10.549C6.852,48.883,3.855,45.885,3.855,42.189z"/>
                                                                <polygon fill="#808080" points="5.668,46.027 15.092,60.758 102.675,60.795 110.601,45.752 " />
                                                                <path fill="#676767" d="M25.925,21.088c-3.276,3.272-3.276,8.577,0,11.85c3.276,3.271,8.587,3.271,11.863,0
            							c3.276-3.272,3.276-8.578,0-11.85C34.512,17.815,29.201,17.815,25.925,21.088"/>
                                                                <polygon fill="#676767" points="48.629,30.282 14.185,25.631 11.931,7.908 54.02,13.549 " />
                                                                <polygon fill={AGENTS && AGENTS.counter4 == 1 ? "#FFE52A" : "#BFBFBF"} points="45.966,28.127 17.331,24.26 15.627,11.196 49.967,15.802 " />
                                                                <rect x="12.045" y="5.696" transform="matrix(0.991 0.1338 -0.1338 0.991 1.3994 -4.3909)" fill="#9A9A9A" width="42.642" height="5.04" />
                                                                <path fill="#676767" d="M80.539,20.796c-3.275,3.272-3.275,8.578,0,11.85c3.276,3.272,8.588,3.272,11.863,0
            							c3.276-3.272,3.276-8.577,0-11.85C89.127,17.523,83.815,17.523,80.539,20.796"/>
                                                                <polygon fill="#676767" points="103.097,24.317 68.881,30.426 61.307,14.243 103.103,6.739 " />
                                                                <polygon fill={AGENTS && AGENTS.counter3 == 1 ? "#FFE52A" : "#BFBFBF"} points="99.901,23.082 71.456,28.159 65.832,16.243 99.934,10.124 " />
                                                                <rect x="60.481" y="5.461" transform="matrix(0.9844 -0.1757 0.1757 0.9844 -0.1296 14.4989)" fill="#9A9A9A" width="42.641" height="5.041" />
                                                            </svg>
                                                        </div>

                                                        <div>
                                                            <div class="top-reading d-flex">
                                                                <span class="w-50 border-right ">{CUSTOMER_PROCESSED_LH && CUSTOMER_PROCESSED_LH.counter2}</span>
                                                                <span class="w-50 ">{CUSTOMER_PROCESSED_LH && CUSTOMER_PROCESSED_LH.counter1}</span>
                                                            </div>
                                                            <svg version="1.1" id="Layer_1" xmlns="http://www.w3.org/2000/svg" xlink="http://www.w3.org/1999/xlink" x="0px" y="0px" width="115px" height="63px" viewBox="0 0 115 63" enable-background="new 0 0 115 63" space="preserve">
                                                                <path fill="#E4E4E4" d="M3.855,42.189V22.74c0-3.696,2.997-6.693,6.693-6.693h94.791c3.696,0,6.693,2.997,6.693,6.693v19.449
            							c0,3.695-2.997,6.693-6.693,6.693H10.549C6.852,48.883,3.855,45.885,3.855,42.189z"/>
                                                                <polygon fill="#808080" points="5.668,46.027 15.092,60.758 102.675,60.795 110.601,45.752 " />
                                                                <path fill="#676767" d="M25.925,21.088c-3.276,3.272-3.276,8.577,0,11.85c3.276,3.271,8.587,3.271,11.863,0
            							c3.276-3.272,3.276-8.578,0-11.85C34.512,17.815,29.201,17.815,25.925,21.088"/>
                                                                <polygon fill="#676767" points="48.629,30.282 14.185,25.631 11.931,7.908 54.02,13.549 " />
                                                                <polygon fill={AGENTS && AGENTS.counter2 == 1 ? "#FFE52A" : "#BFBFBF"} points="45.966,28.127 17.331,24.26 15.627,11.196 49.967,15.802 " />
                                                                <rect x="12.045" y="5.696" transform="matrix(0.991 0.1338 -0.1338 0.991 1.3994 -4.3909)" fill="#9A9A9A" width="42.642" height="5.04" />
                                                                <path fill="#676767" d="M80.539,20.796c-3.275,3.272-3.275,8.578,0,11.85c3.276,3.272,8.588,3.272,11.863,0
            							c3.276-3.272,3.276-8.577,0-11.85C89.127,17.523,83.815,17.523,80.539,20.796"/>
                                                                <polygon fill="#676767" points="103.097,24.317 68.881,30.426 61.307,14.243 103.103,6.739 " />
                                                                <polygon fill={AGENTS && AGENTS.counter1 == 1 ? "#FFE52A" : "#BFBFBF"} points="99.901,23.082 71.456,28.159 65.832,16.243 99.934,10.124 " />
                                                                <rect x="60.481" y="5.461" transform="matrix(0.9844 -0.1757 0.1757 0.9844 -0.1296 14.4989)" fill="#9A9A9A" width="42.641" height="5.041" />
                                                            </svg>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                            <div class="ticket-person">
                                                <div class="block1 d-flex">

                                                    <span class="text-center" >

                                                        {AGENTS && AGENTS.counter16 == 1 ? <svg version="1.1" id="Layer_1" xmlns="http://www.w3.org/2000/svg" xlink="http://www.w3.org/1999/xlink" x="0px" y="0px" width="40px" height="19px" viewBox="0 0 40 19" enable-background="new 0 0 40 19" space="preserve">
                                                            <path fill="#FECB3E" d="M0.958,11.566L0.958,11.566c0-4.119,3.339-7.458,7.458-7.458h22.603c4.119,0,7.458,3.34,7.458,7.458c0,4.117-3.339,7.457-7.458,7.457H8.415C4.296,19.023,0.958,15.684,0.958,11.566z" />
                                                            <path fill="#676767" d="M25.908,3.454c3.276,3.273,3.276,8.58,0,11.851c-3.275,3.271-8.587,3.271-11.864,0
            					c-3.275-3.271-3.275-8.578,0-11.851C17.321,0.182,22.633,0.182,25.908,3.454"/>
                                                        </svg> : ""}
                                                    </span>
                                                    <span class="text-center">
                                                        {AGENTS && AGENTS.counter15 == 1 ? <svg version="1.1" id="Layer_1" xmlns="http://www.w3.org/2000/svg" xlink="http://www.w3.org/1999/xlink" x="0px" y="0px" width="40px" height="19px" viewBox="0 0 40 19" enable-background="new 0 0 40 19" space="preserve">
                                                            <path fill="#FECB3E" d="M0.958,11.566L0.958,11.566c0-4.119,3.339-7.458,7.458-7.458h22.603c4.119,0,7.458,3.34,7.458,7.458c0,4.117-3.339,7.457-7.458,7.457H8.415C4.296,19.023,0.958,15.684,0.958,11.566z" />
                                                            <path fill="#676767" d="M25.908,3.454c3.276,3.273,3.276,8.58,0,11.851c-3.275,3.271-8.587,3.271-11.864,0
            					c-3.275-3.271-3.275-8.578,0-11.851C17.321,0.182,22.633,0.182,25.908,3.454"/>
                                                        </svg> : ""}
                                                    </span>
                                                </div>
                                                <div class="block1 d-flex">
                                                    <span class="text-center">
                                                        {AGENTS && AGENTS.counter14 == 1 ? <svg version="1.1" id="Layer_1" xmlns="http://www.w3.org/2000/svg" xlink="http://www.w3.org/1999/xlink" x="0px" y="0px" width="40px" height="19px" viewBox="0 0 40 19" enable-background="new 0 0 40 19" space="preserve">
                                                            <path fill="#FECB3E" d="M0.958,11.566L0.958,11.566c0-4.119,3.339-7.458,7.458-7.458h22.603c4.119,0,7.458,3.34,7.458,7.458c0,4.117-3.339,7.457-7.458,7.457H8.415C4.296,19.023,0.958,15.684,0.958,11.566z" />
                                                            <path fill="#676767" d="M25.908,3.454c3.276,3.273,3.276,8.58,0,11.851c-3.275,3.271-8.587,3.271-11.864,0
            					c-3.275-3.271-3.275-8.578,0-11.851C17.321,0.182,22.633,0.182,25.908,3.454"/>
                                                        </svg> : ""}
                                                    </span>
                                                    <span class="text-center">
                                                        {AGENTS && AGENTS.counter13 == 1 ? <svg version="1.1" id="Layer_1" xmlns="http://www.w3.org/2000/svg" xlink="http://www.w3.org/1999/xlink" x="0px" y="0px" width="40px" height="19px" viewBox="0 0 40 19" enable-background="new 0 0 40 19" space="preserve">
                                                            <path fill="#FECB3E" d="M0.958,11.566L0.958,11.566c0-4.119,3.339-7.458,7.458-7.458h22.603c4.119,0,7.458,3.34,7.458,7.458c0,4.117-3.339,7.457-7.458,7.457H8.415C4.296,19.023,0.958,15.684,0.958,11.566z" />
                                                            <path fill="#676767" d="M25.908,3.454c3.276,3.273,3.276,8.58,0,11.851c-3.275,3.271-8.587,3.271-11.864,0
            					c-3.275-3.271-3.275-8.578,0-11.851C17.321,0.182,22.633,0.182,25.908,3.454"/>
                                                        </svg> : ""}
                                                    </span>
                                                </div>
                                                <div class="block1 d-flex">
                                                    <span class="text-center">
                                                        {AGENTS && AGENTS.counter12 == 1 ? <svg version="1.1" id="Layer_1" xmlns="http://www.w3.org/2000/svg" xlink="http://www.w3.org/1999/xlink" x="0px" y="0px" width="40px" height="19px" viewBox="0 0 40 19" enable-background="new 0 0 40 19" space="preserve">
                                                            <path fill="#FECB3E" d="M0.958,11.566L0.958,11.566c0-4.119,3.339-7.458,7.458-7.458h22.603c4.119,0,7.458,3.34,7.458,7.458c0,4.117-3.339,7.457-7.458,7.457H8.415C4.296,19.023,0.958,15.684,0.958,11.566z" />
                                                            <path fill="#676767" d="M25.908,3.454c3.276,3.273,3.276,8.58,0,11.851c-3.275,3.271-8.587,3.271-11.864,0
            					c-3.275-3.271-3.275-8.578,0-11.851C17.321,0.182,22.633,0.182,25.908,3.454"/>
                                                        </svg> : ""}
                                                    </span>
                                                    <span class="text-center">
                                                        {AGENTS && AGENTS.counter11 == 1 ? <svg version="1.1" id="Layer_1" xmlns="http://www.w3.org/2000/svg" xlink="http://www.w3.org/1999/xlink" x="0px" y="0px" width="40px" height="19px" viewBox="0 0 40 19" enable-background="new 0 0 40 19" space="preserve">
                                                            <path fill="#FECB3E" d="M0.958,11.566L0.958,11.566c0-4.119,3.339-7.458,7.458-7.458h22.603c4.119,0,7.458,3.34,7.458,7.458c0,4.117-3.339,7.457-7.458,7.457H8.415C4.296,19.023,0.958,15.684,0.958,11.566z" />
                                                            <path fill="#676767" d="M25.908,3.454c3.276,3.273,3.276,8.58,0,11.851c-3.275,3.271-8.587,3.271-11.864,0
            					c-3.275-3.271-3.275-8.578,0-11.851C17.321,0.182,22.633,0.182,25.908,3.454"/>
                                                        </svg> : ""}
                                                    </span>
                                                </div>
                                                <div class="block1 d-flex">
                                                    <span class="text-center">
                                                        {AGENTS && AGENTS.counter10 == 1 ? <svg version="1.1" id="Layer_1" xmlns="http://www.w3.org/2000/svg" xlink="http://www.w3.org/1999/xlink" x="0px" y="0px" width="40px" height="19px" viewBox="0 0 40 19" enable-background="new 0 0 40 19" space="preserve">
                                                            <path fill="#FECB3E" d="M0.958,11.566L0.958,11.566c0-4.119,3.339-7.458,7.458-7.458h22.603c4.119,0,7.458,3.34,7.458,7.458c0,4.117-3.339,7.457-7.458,7.457H8.415C4.296,19.023,0.958,15.684,0.958,11.566z" />
                                                            <path fill="#676767" d="M25.908,3.454c3.276,3.273,3.276,8.58,0,11.851c-3.275,3.271-8.587,3.271-11.864,0
            					c-3.275-3.271-3.275-8.578,0-11.851C17.321,0.182,22.633,0.182,25.908,3.454"/>
                                                        </svg> : ""}
                                                    </span>
                                                    <span class="text-center">
                                                        {AGENTS && AGENTS.counter9 == 1 ? <svg version="1.1" id="Layer_1" xmlns="http://www.w3.org/2000/svg" xlink="http://www.w3.org/1999/xlink" x="0px" y="0px" width="40px" height="19px" viewBox="0 0 40 19" enable-background="new 0 0 40 19" space="preserve">
                                                            <path fill="#FECB3E" d="M0.958,11.566L0.958,11.566c0-4.119,3.339-7.458,7.458-7.458h22.603c4.119,0,7.458,3.34,7.458,7.458c0,4.117-3.339,7.457-7.458,7.457H8.415C4.296,19.023,0.958,15.684,0.958,11.566z" />
                                                            <path fill="#676767" d="M25.908,3.454c3.276,3.273,3.276,8.58,0,11.851c-3.275,3.271-8.587,3.271-11.864,0
            					c-3.275-3.271-3.275-8.578,0-11.851C17.321,0.182,22.633,0.182,25.908,3.454"/>
                                                        </svg> : ""}
                                                    </span>
                                                </div>
                                                <div class="block1 d-flex">
                                                    <span class="text-center">
                                                        {AGENTS && AGENTS.counter8 == 1 ? <svg version="1.1" id="Layer_1" xmlns="http://www.w3.org/2000/svg" xlink="http://www.w3.org/1999/xlink" x="0px" y="0px" width="40px" height="19px" viewBox="0 0 40 19" enable-background="new 0 0 40 19" space="preserve">
                                                            <path fill="#FECB3E" d="M0.958,11.566L0.958,11.566c0-4.119,3.339-7.458,7.458-7.458h22.603c4.119,0,7.458,3.34,7.458,7.458c0,4.117-3.339,7.457-7.458,7.457H8.415C4.296,19.023,0.958,15.684,0.958,11.566z" />
                                                            <path fill="#676767" d="M25.908,3.454c3.276,3.273,3.276,8.58,0,11.851c-3.275,3.271-8.587,3.271-11.864,0
            					c-3.275-3.271-3.275-8.578,0-11.851C17.321,0.182,22.633,0.182,25.908,3.454"/>
                                                        </svg> : ""}
                                                    </span>
                                                    <span class="text-center">
                                                        {AGENTS && AGENTS.counter7 == 1 ? <svg version="1.1" id="Layer_1" xmlns="http://www.w3.org/2000/svg" xlink="http://www.w3.org/1999/xlink" x="0px" y="0px" width="40px" height="19px" viewBox="0 0 40 19" enable-background="new 0 0 40 19" space="preserve">
                                                            <path fill="#FECB3E" d="M0.958,11.566L0.958,11.566c0-4.119,3.339-7.458,7.458-7.458h22.603c4.119,0,7.458,3.34,7.458,7.458c0,4.117-3.339,7.457-7.458,7.457H8.415C4.296,19.023,0.958,15.684,0.958,11.566z" />
                                                            <path fill="#676767" d="M25.908,3.454c3.276,3.273,3.276,8.58,0,11.851c-3.275,3.271-8.587,3.271-11.864,0
            					c-3.275-3.271-3.275-8.578,0-11.851C17.321,0.182,22.633,0.182,25.908,3.454"/>
                                                        </svg> : ""}
                                                    </span>
                                                </div>
                                                <div class="block1 d-flex">
                                                    <span class="text-center">
                                                        {AGENTS && AGENTS.counter6 == 1 ? <svg version="1.1" id="Layer_1" xmlns="http://www.w3.org/2000/svg" xlink="http://www.w3.org/1999/xlink" x="0px" y="0px" width="40px" height="19px" viewBox="0 0 40 19" enable-background="new 0 0 40 19" space="preserve">
                                                            <path fill="#FECB3E" d="M0.958,11.566L0.958,11.566c0-4.119,3.339-7.458,7.458-7.458h22.603c4.119,0,7.458,3.34,7.458,7.458c0,4.117-3.339,7.457-7.458,7.457H8.415C4.296,19.023,0.958,15.684,0.958,11.566z" />
                                                            <path fill="#676767" d="M25.908,3.454c3.276,3.273,3.276,8.58,0,11.851c-3.275,3.271-8.587,3.271-11.864,0
            					c-3.275-3.271-3.275-8.578,0-11.851C17.321,0.182,22.633,0.182,25.908,3.454"/>
                                                        </svg> : ""}
                                                    </span>
                                                    <span class="text-center">
                                                        {AGENTS && AGENTS.counter5 == 1 ? <svg version="1.1" id="Layer_1" xmlns="http://www.w3.org/2000/svg" xlink="http://www.w3.org/1999/xlink" x="0px" y="0px" width="40px" height="19px" viewBox="0 0 40 19" enable-background="new 0 0 40 19" space="preserve">
                                                            <path fill="#FECB3E" d="M0.958,11.566L0.958,11.566c0-4.119,3.339-7.458,7.458-7.458h22.603c4.119,0,7.458,3.34,7.458,7.458c0,4.117-3.339,7.457-7.458,7.457H8.415C4.296,19.023,0.958,15.684,0.958,11.566z" />
                                                            <path fill="#676767" d="M25.908,3.454c3.276,3.273,3.276,8.58,0,11.851c-3.275,3.271-8.587,3.271-11.864,0
            					c-3.275-3.271-3.275-8.578,0-11.851C17.321,0.182,22.633,0.182,25.908,3.454"/>
                                                        </svg> : ""}
                                                    </span>
                                                </div>
                                                <div class="block1 d-flex">
                                                    <span class="text-center">
                                                        {AGENTS && AGENTS.counter4 == 1 ? <svg version="1.1" id="Layer_1" xmlns="http://www.w3.org/2000/svg" xlink="http://www.w3.org/1999/xlink" x="0px" y="0px" width="40px" height="19px" viewBox="0 0 40 19" enable-background="new 0 0 40 19" space="preserve">
                                                            <path fill="#FECB3E" d="M0.958,11.566L0.958,11.566c0-4.119,3.339-7.458,7.458-7.458h22.603c4.119,0,7.458,3.34,7.458,7.458c0,4.117-3.339,7.457-7.458,7.457H8.415C4.296,19.023,0.958,15.684,0.958,11.566z" />
                                                            <path fill="#676767" d="M25.908,3.454c3.276,3.273,3.276,8.58,0,11.851c-3.275,3.271-8.587,3.271-11.864,0
            					c-3.275-3.271-3.275-8.578,0-11.851C17.321,0.182,22.633,0.182,25.908,3.454"/>
                                                        </svg> : ""}
                                                    </span>
                                                    <span class="text-center">
                                                        {AGENTS && AGENTS.counter3 == 1 ? <svg version="1.1" id="Layer_1" xmlns="http://www.w3.org/2000/svg" xlink="http://www.w3.org/1999/xlink" x="0px" y="0px" width="40px" height="19px" viewBox="0 0 40 19" enable-background="new 0 0 40 19" space="preserve">
                                                            <path fill="#FECB3E" d="M0.958,11.566L0.958,11.566c0-4.119,3.339-7.458,7.458-7.458h22.603c4.119,0,7.458,3.34,7.458,7.458c0,4.117-3.339,7.457-7.458,7.457H8.415C4.296,19.023,0.958,15.684,0.958,11.566z" />
                                                            <path fill="#676767" d="M25.908,3.454c3.276,3.273,3.276,8.58,0,11.851c-3.275,3.271-8.587,3.271-11.864,0
            					c-3.275-3.271-3.275-8.578,0-11.851C17.321,0.182,22.633,0.182,25.908,3.454"/>
                                                        </svg> : ""}
                                                    </span>
                                                </div>
                                                <div class="block1 d-flex">
                                                    <span class="text-center">
                                                        {AGENTS && AGENTS.counter2 == 1 ? <svg version="1.1" id="Layer_1" xmlns="http://www.w3.org/2000/svg" xlink="http://www.w3.org/1999/xlink" x="0px" y="0px" width="40px" height="19px" viewBox="0 0 40 19" enable-background="new 0 0 40 19" space="preserve">
                                                            <path fill="#FECB3E" d="M0.958,11.566L0.958,11.566c0-4.119,3.339-7.458,7.458-7.458h22.603c4.119,0,7.458,3.34,7.458,7.458c0,4.117-3.339,7.457-7.458,7.457H8.415C4.296,19.023,0.958,15.684,0.958,11.566z" />
                                                            <path fill="#676767" d="M25.908,3.454c3.276,3.273,3.276,8.58,0,11.851c-3.275,3.271-8.587,3.271-11.864,0
            					c-3.275-3.271-3.275-8.578,0-11.851C17.321,0.182,22.633,0.182,25.908,3.454"/>
                                                        </svg> : ""}
                                                    </span>
                                                    <span class="text-center">
                                                        {AGENTS && AGENTS.counter1 == 1 ? <svg version="1.1" id="Layer_1" xmlns="http://www.w3.org/2000/svg" xlink="http://www.w3.org/1999/xlink" x="0px" y="0px" width="40px" height="19px" viewBox="0 0 40 19" enable-background="new 0 0 40 19" space="preserve">
                                                            <path fill="#FECB3E" d="M0.958,11.566L0.958,11.566c0-4.119,3.339-7.458,7.458-7.458h22.603c4.119,0,7.458,3.34,7.458,7.458c0,4.117-3.339,7.457-7.458,7.457H8.415C4.296,19.023,0.958,15.684,0.958,11.566z" />
                                                            <path fill="#676767" d="M25.908,3.454c3.276,3.273,3.276,8.58,0,11.851c-3.275,3.271-8.587,3.271-11.864,0
            					c-3.275-3.271-3.275-8.578,0-11.851C17.321,0.182,22.633,0.182,25.908,3.454"/>
                                                        </svg> : ""}
                                                    </span>
                                                </div>
                                            </div>
                                            <div class="numbers">
                                                <div class="d-flex">
                                                    <span>16</span>
                                                    <span>15</span>
                                                </div>
                                                <div class="d-flex">
                                                    <span>14</span>
                                                    <span>13</span>
                                                </div>
                                                <div class="d-flex">
                                                    <span>12</span>
                                                    <span>11</span>
                                                </div>
                                                <div class="d-flex">
                                                    <span>10</span>
                                                    <span>9</span>
                                                </div>

                                                <div class="d-flex">
                                                    <span>8</span>
                                                    <span>7</span>
                                                </div>

                                                <div class="d-flex">
                                                    <span>6</span>
                                                    <span>5</span>
                                                </div>
                                                <div class="d-flex">
                                                    <span>4</span>
                                                    <span>3</span>
                                                </div>
                                                <div class="d-flex">
                                                    <span>2</span>
                                                    <span>1</span>
                                                </div>

                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div> */}
                            {/* <div class="wrapper content-container">
                        <div class="service-counter">
                            <div class="card mr-0">
                                <div class="card-header">
                                    <h5><span><i class="fas fa-user-friends"></i></span> serviced accounts over time</h5>
                                    <div class="close-btn"><i class="far fa-times-circle"></i></div>
                                </div>
                                <div class="card-body mt-4">
                                    <ul class="nav nav-tabs" id="myTab" role="tablist">
                                        <li class="nav-item nav-blue">
                                            <a class="nav-link" id="home-tab" data-toggle="tab" href="javascript:;" role="tab" aria-controls="home" aria-selected="true">hourly</a>
                                        </li>
                                        <li class="nav-item nav-green">
                                            <a class="nav-link active" id="profile-tab" data-toggle="tab" href="javascript:;" role="tab" aria-controls="profile" aria-selected="false">daily</a>
                                        </li>
                                        <li class="nav-item nav-light">
                                            <a class="nav-link" id="contact-tab" data-toggle="tab" href="javascript:;" role="tab" aria-controls="contact" aria-selected="false">weekly</a>
                                        </li>
                                    </ul>
                                    <div class="tab-content" id="myTabContent">
                                        <div class="tab-pane fade" id="home" role="tabpanel" aria-labelledby="home-tab">Lorem ipsum dolor sit amet, consectetur adipisicing elit. Aliquam dolorem, sit ducimus, inventore unde nulla, assumenda recusandae modi natus incidunt praesentium accusamus ab tenetur odit! Est animi deleniti, eveniet quos!</div>
                                        <div class="tab-pane fade show active" id="profile" role="tabpanel" aria-labelledby="profile-tab">
                                            <span class="d-block">

                                                <div><HighchartsReact
                                                    highcharts={Highcharts}
                                                    options={options}
                                                /></div></span>
                                        </div>
                                        <div class="tab-pane fade" id="contact" role="tabpanel" aria-labelledby="contact-tab">
                                            Lorem ipsum dolor sit amet, consectetur adipisicing elit. Ullam obcaecati amet cumque blanditiis fuga, nesciunt suscipit tempore, alias fugit labore excepturi assumenda ipsum quisquam libero ea odio. Nobis saepe ad neque voluptatibus dignissimos placeat doloribus sint. Quia voluptas aliquid quisquam.
            	                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div class="counter-assignments">
                            <div class="card ml-0">
                                <div class="card-header">
                                    <h5><span><i class="fas fa-user-friends"></i></span> ticket counter assignments</h5>
                                    <div class="dropdown float-right mr-5">
                                        <button class="btn dropdown-toggle" type="button" id="dropdownMenuButton" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
                                            show last 24 hours <i class="fas fa-angle-down"></i>
                                        </button>
                                        <div class="dropdown-menu" aria-labelledby="dropdownMenuButton">
                                            <a class="dropdown-item" href="#">option1</a>
                                            <a class="dropdown-item" href="#">option2</a>
                                            <a class="dropdown-item" href="#">option3</a>
                                        </div>
                                    </div>
                                    <div class="close-btn"><i class="far fa-times-circle"></i></div>
                                </div>
                                <div class="card-body" style={{ backgroundColor: 'transparent' }}>
                                    <table class="table">
                                        <thead>
                                            <tr>
                                                <th>ticket counter team</th>
                                                <th>position</th>
                                                <th>daily guests</th>
                                                <th>hourly guests</th>
                                                <th>shift total</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            <tr>
                                                <th scope="row"><span>1</span> victoria</th>
                                                <td>1</td>
                                                <td>76</td>
                                                <td>19</td>
                                                <td>76</td>
                                            </tr>
                                            <tr>
                                                <th scope="row"><span>2</span> jeffrey</th>
                                                <td>2</td>
                                                <td>58</td>
                                                <td>16</td>
                                                <td>64</td>
                                            </tr>
                                            <tr>
                                                <th scope="row"><span>3</span> alan</th>
                                                <td>3</td>
                                                <td>45</td>
                                                <td>17</td>
                                                <td>66</td>
                                            </tr>
                                            <tr>
                                                <th scope="row"><span>4</span> jeremy</th>
                                                <td>4</td>
                                                <td>64</td>
                                                <td>19</td>
                                                <td>80</td>
                                            </tr>
                                            <tr>
                                                <th scope="row"><span>5</span> wendy</th>
                                                <td>5</td>
                                                <td>53</td>
                                                <td>15</td>
                                                <td>81</td>
                                            </tr>
                                            <tr>
                                                <th scope="row"><span>6</span> jeff</th>
                                                <td>6</td>
                                                <td>61</td>
                                                <td>14</td>
                                                <td>74</td>
                                            </tr>

                                        </tbody>
                                    </table>
                                    <div class="show-morebtn text-center">
                                        <span>show more</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div class="wrapper">
                        <div class="station-counts">
                            <div class="card">
                                <div class="card-header">
                                    <h5><span><i class="fas fa-user-friends"></i></span> station counts</h5>
                                    <div class="dropdown float-right mr-5">
                                        <button class="btn dropdown-toggle" type="button" id="dropdownMenuButton" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
                                            last week 3/14-3/20 <i class="fas fa-angle-down"></i>
                                        </button>
                                        <div class="dropdown-menu" aria-labelledby="dropdownMenuButton">
                                            <a class="dropdown-item" href="#">option1</a>
                                            <a class="dropdown-item" href="#">option2</a>
                                            <a class="dropdown-item" href="#">option3</a>
                                        </div>
                                    </div>
                                </div>
                                <div class="card-body mt-4">
                                    <ul class="nav nav-tabs" id="myTab" role="tablist">
                                        <li class="nav-item nav-blue">
                                            <a class="nav-link" id="team-tab" data-toggle="tab" href="javascript:;" role="tab" aria-controls="team" aria-selected="true">team</a>
                                        </li>
                                        <li class="nav-item nav-green">
                                            <a class="nav-link" id="search-tab" data-toggle="tab" href="javascript:;" role="tab" aria-controls="search" aria-selected="false">search</a>
                                        </li>
                                        <li class="nav-item nav-light">
                                            <a class="nav-link" id="week-tab" data-toggle="tab" href="javascript:;" role="tab" aria-controls="week" aria-selected="false">last week</a>
                                        </li>
                                        <li class="nav-item nav-dark">
                                            <a class="nav-link active" id="current-tab" data-toggle="tab" href="javascript:;" role="tab" aria-controls="current" aria-selected="false">current</a>
                                        </li>
                                    </ul>
                                    <div class="tab-content" id="myTabContent">
                                        <div class="tab-pane fade" id="team" role="tabpanel" aria-labelledby="team-tab">Lorem ipsum dolor sit amet, consectetur adipisicing elit. Aliquam dolorem, sit ducimus, inventore unde nulla, assumenda recusandae modi natus incidunt praesentium accusamus ab tenetur odit! Est animi deleniti, eveniet quos!</div>
                                        <div class="tab-pane fade" id="search" role="tabpanel" aria-labelledby="search-tab">
                                            <span class="d-block"><img src="img/area_graph.png" alt="" /></span>
                                        </div>
                                        <div class="tab-pane fade" id="week" role="tabpanel" aria-labelledby="week-tab">
                                            Lorem ipsum dolor sit amet, consectetur adipisicing elit. Ullam obcaecati amet cumque blanditiis fuga, nesciunt suscipit tempore, alias fugit labore excepturi assumenda ipsum quisquam libero ea odio. Nobis saepe ad neque voluptatibus dignissimos placeat doloribus sint. Quia voluptas aliquid quisquam.
            	                        </div>
                                        <div class="tab-pane fade show active" id="current" role="tabpanel" aria-labelledby="current-tab">
                                            <HeatMapChart />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div class="wrapper">
                        <div class="card">
                            <div class="card-header">
                                <h5><span><i class="far fa-map"></i></span> map</h5>
                                <div class="dropdown float-right mr-5">
                                    <button class="btn dropdown-toggle" type="button" id="dropdownMenuButton" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
                                        all locations <i class="fas fa-angle-down"></i>
                                    </button>
                                    <div class="dropdown-menu" aria-labelledby="dropdownMenuButton">
                                        <a class="dropdown-item" href="#">option1</a>
                                        <a class="dropdown-item" href="#">option2</a>
                                        <a class="dropdown-item" href="#">option3</a>
                                    </div>
                                </div>
                                <div class="close-btn"><i class="far fa-times-circle"></i></div>
                            </div>
                            <div class="card-body" style={{ backgroundColor: 'transparent' }}>
                                <div class="card-title">
                                    <h5>all locations</h5>
                                    <div class="close-btn" style={{ top: 2 }}><i class="fas fa-compress-alt"></i></div>

                                </div>
                                <div style={{ width: '100%', height: '500px' }}><MapView /></div>
                            </div>
                        </div>
                    </div> */}
                        </div>
                }
            </div>

        );
    }
}

const mapStateToProps = state => ({})

export default connect(mapStateToProps, null)(DashboardSpirit);