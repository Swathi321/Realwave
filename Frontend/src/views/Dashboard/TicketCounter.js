import React, { PureComponent } from "react";
import './DashboardSpirit.css';
//import axios from 'axios'
import { connect, connectAdvanced } from 'react-redux'
//import serverAPI from '../../redux/httpUtil/serverApi'


class TicketCounter extends PureComponent {

    constructor(props) {
        super(props)

        this.state = {
            dashboard: [],
            isLoading: false,
            isScrollingDown: false,
            selectedData: { AGENTS: {}, CUSTOMER_PROCESSED_LH: {} },
            oneHourData: { AGENTS: {}, CUSTOMER_PROCESSED_LH: {} }
        }

    }

    componentDidMount() {
        this.setCounterData();
    }
    
    componentDidUpdate(prevProps, prevState) {
        if( JSON.stringify(prevProps.siteDashboardData) !== JSON.stringify(this.props.siteDashboardData) ) {
            this.setCounterData();
        }

        const hourChanged = JSON.stringify(prevProps.selectedHour) !== JSON.stringify(this.props.selectedHour)
        if (hourChanged) {
            this.setCounterData();
        }
    }

    setCounterData = () => {
        const DATA_FOR = this.props.selectedHour[0].value;
        this.setState({ 
            selectedData: this.getSiteData(this.props.siteDashboardData, DATA_FOR),
            oneHourData: this.getSiteData(this.props.siteDashboardData, '1 Hour')
        });
    }

    getSiteData = (siteDashboardData, DATA_FOR) => {
        const fallbackData = { AGENTS: {}, CUSTOMER_PROCESSED_LH: {} };
        return siteDashboardData[DATA_FOR] ? siteDashboardData[DATA_FOR].top_one[0] : fallbackData;
    }

    // loadDataByStoreId = () => {
    //     const { selectedStore, selectedHour } = this.props;
    //     const { value: storeId } = selectedStore.length > 0 ? selectedStore[0] : { value: '' };
    //     const { value: DATA_FOR } = selectedHour[0];

    //     axios.post(serverAPI.DASHBOARD_DATA, {
    //         storeId,
    //         DATA_FOR
    //     }).then((response) => {
    //         const { alldata } = response.data;
    //         this.setState({ selectedData: alldata.length > 0 ? alldata[0] : { AGENTS: {}, CUSTOMER_PROCESSED_LH: {} } })
    //         //console.log(alldata);
    //     }, (error) => {
    //         console.log(error);
    //     });
    // }

    // async loadData() {
    //     try {
    //         console.log("loadData", this.props)
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

    displayCustomerProcessed = (counter) => {
        return counter > 0 ? counter : <div>&nbsp;</div>;
    }

    render() {
        let { CUSTOMER_PROCESSED_LH } = this.state.selectedData;
        let { AGENTS } = this.state.oneHourData;
        return (

            <div className="col-md-12">

                <div id="main">

                    <div class="wrapper">
                        {/* <Select className="fausd"
                            isClearable={false}
                            placeholder="Select"
                            id="TransactionFilter"
                            defaultValue={this.props.selectedHour || []}
                            onChange={this.props.onHourChange}
                            options={this.props.options} /> */}

                        {/* <div class="card"> */}
                        {/* <div class="card-header">
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
                                    </div> */}
                        <div class="card-body">
                            {/* <div class="card-title">
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
                            </div> */}
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
                                                    <span class="w-50 border-right">{CUSTOMER_PROCESSED_LH && this.displayCustomerProcessed(CUSTOMER_PROCESSED_LH.counter16)}</span>
                                                    <span class="w-50">{CUSTOMER_PROCESSED_LH && this.displayCustomerProcessed(CUSTOMER_PROCESSED_LH.counter15)}</span>
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
                                                    <span class="w-50 border-right ">{CUSTOMER_PROCESSED_LH && this.displayCustomerProcessed(CUSTOMER_PROCESSED_LH.counter14)}</span>
                                                    <span class="w-50 ">{CUSTOMER_PROCESSED_LH && this.displayCustomerProcessed(CUSTOMER_PROCESSED_LH.counter13)}</span>
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
                                                    <span class="w-50 border-right">{CUSTOMER_PROCESSED_LH && this.displayCustomerProcessed(CUSTOMER_PROCESSED_LH.counter12)}</span>
                                                    <span class="w-50 ">{CUSTOMER_PROCESSED_LH && this.displayCustomerProcessed(CUSTOMER_PROCESSED_LH.counter11)}</span>
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
                                                    <span class="w-50 border-right ">{CUSTOMER_PROCESSED_LH && this.displayCustomerProcessed(CUSTOMER_PROCESSED_LH.counter10)}</span>
                                                    <span class="w-50 ">{CUSTOMER_PROCESSED_LH && this.displayCustomerProcessed(CUSTOMER_PROCESSED_LH.counter9)}</span>
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
                                                    <span class="w-50 border-right">{CUSTOMER_PROCESSED_LH && this.displayCustomerProcessed(CUSTOMER_PROCESSED_LH.counter8)}</span>
                                                    <span class="w-50 ">{CUSTOMER_PROCESSED_LH && this.displayCustomerProcessed(CUSTOMER_PROCESSED_LH.counter7)}</span>
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
                                                    <span class="w-50 border-right">{CUSTOMER_PROCESSED_LH && this.displayCustomerProcessed(CUSTOMER_PROCESSED_LH.counter6)}</span>
                                                    <span class="w-50 ">{CUSTOMER_PROCESSED_LH && this.displayCustomerProcessed(CUSTOMER_PROCESSED_LH.counter5)}</span>
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
                                                    <span class="w-50 border-right">{CUSTOMER_PROCESSED_LH && this.displayCustomerProcessed(CUSTOMER_PROCESSED_LH.counter4)}</span>
                                                    <span class="w-50 ">{CUSTOMER_PROCESSED_LH && this.displayCustomerProcessed(CUSTOMER_PROCESSED_LH.counter3)}</span>
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
                                                    <span class="w-50 border-right ">{CUSTOMER_PROCESSED_LH && this.displayCustomerProcessed(CUSTOMER_PROCESSED_LH.counter2)}</span>
                                                    <span class="w-50 ">{CUSTOMER_PROCESSED_LH && this.displayCustomerProcessed(CUSTOMER_PROCESSED_LH.counter1)}</span>
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
                                <br></br>
                                <br></br>
                                <div class="ticket-counter">
                                    <div class="bg-img">
                                        {/* <div class="bg-bar">
                                            <svg version="1.1" id="Layer_1" xmlns="http://www.w3.org/2000/svg" xlink="http://www.w3.org/1999/xlink" x="0px" y="0px" width="943px" height="37px" viewBox="0 0 943 37" enable-background="new 0 0 943 37" space="preserve">
                                                <rect x="-3" y="-4" opacity="0" width="950" height="44" />
                                                <rect x="0.811" y="-0.864" fill="#CECECE" width="943" height="37" />
                                            </svg>
                                        </div> */}
                                        <div class="ticket-computers">
                                            <div>
                                                <div class="top-reading d-flex counterno101">
                                                    <span class="w-50">

                                                        {AGENTS && AGENTS.counter16 == 1 ? <svg version="1.1" id="Layer_1" xmlns="http://www.w3.org/2000/svg" xlink="http://www.w3.org/1999/xlink" x="0px" y="0px" width="40px" height="19px" viewBox="0 0 40 19" enable-background="new 0 0 40 19" space="preserve">
                                                            <path fill="#FECB3E" d="M0.958,11.566L0.958,11.566c0-4.119,3.339-7.458,7.458-7.458h22.603c4.119,0,7.458,3.34,7.458,7.458c0,4.117-3.339,7.457-7.458,7.457H8.415C4.296,19.023,0.958,15.684,0.958,11.566z" />
                                                            <path fill="#676767" d="M25.908,3.454c3.276,3.273,3.276,8.58,0,11.851c-3.275,3.271-8.587,3.271-11.864,0
c-3.275-3.271-3.275-8.578,0-11.851C17.321,0.182,22.633,0.182,25.908,3.454"/>
                                                        </svg> : ""}
                                                    </span>
                                                    <span class="w-50">
                                                        {AGENTS && AGENTS.counter15 == 1 ? <svg version="1.1" id="Layer_1" xmlns="http://www.w3.org/2000/svg" xlink="http://www.w3.org/1999/xlink" x="0px" y="0px" width="40px" height="19px" viewBox="0 0 40 19" enable-background="new 0 0 40 19" space="preserve">
                                                            <path fill="#FECB3E" d="M0.958,11.566L0.958,11.566c0-4.119,3.339-7.458,7.458-7.458h22.603c4.119,0,7.458,3.34,7.458,7.458c0,4.117-3.339,7.457-7.458,7.457H8.415C4.296,19.023,0.958,15.684,0.958,11.566z" />
                                                            <path fill="#676767" d="M25.908,3.454c3.276,3.273,3.276,8.58,0,11.851c-3.275,3.271-8.587,3.271-11.864,0
            					c-3.275-3.271-3.275-8.578,0-11.851C17.321,0.182,22.633,0.182,25.908,3.454"/>
                                                        </svg> : ""}
                                                    </span>
                                                </div>
                                                <svg version="1.1" id="Layer_1" xmlns="http://www.w3.org/2000/svg" xlink="http://www.w3.org/1999/xlink" x="0px" y="0px" width="115px" height="63px" viewBox="0 0 115 63" enable-background="new 0 0 115 63" space="preserve">

                                                </svg>
                                            </div>

                                            <div>
                                                <div class="top-reading d-flex counterno101">
                                                    <span class="w-50 ">
                                                        {AGENTS && AGENTS.counter14 == 1 ? <svg version="1.1" id="Layer_1" xmlns="http://www.w3.org/2000/svg" xlink="http://www.w3.org/1999/xlink" x="0px" y="0px" width="40px" height="19px" viewBox="0 0 40 19" enable-background="new 0 0 40 19" space="preserve">
                                                            <path fill="#FECB3E" d="M0.958,11.566L0.958,11.566c0-4.119,3.339-7.458,7.458-7.458h22.603c4.119,0,7.458,3.34,7.458,7.458c0,4.117-3.339,7.457-7.458,7.457H8.415C4.296,19.023,0.958,15.684,0.958,11.566z" />
                                                            <path fill="#676767" d="M25.908,3.454c3.276,3.273,3.276,8.58,0,11.851c-3.275,3.271-8.587,3.271-11.864,0
            					c-3.275-3.271-3.275-8.578,0-11.851C17.321,0.182,22.633,0.182,25.908,3.454"/>
                                                        </svg> : ""}
                                                    </span>
                                                    <span class="w-50 ">
                                                        {AGENTS && AGENTS.counter13 == 1 ? <svg version="1.1" id="Layer_1" xmlns="http://www.w3.org/2000/svg" xlink="http://www.w3.org/1999/xlink" x="0px" y="0px" width="40px" height="19px" viewBox="0 0 40 19" enable-background="new 0 0 40 19" space="preserve">
                                                            <path fill="#FECB3E" d="M0.958,11.566L0.958,11.566c0-4.119,3.339-7.458,7.458-7.458h22.603c4.119,0,7.458,3.34,7.458,7.458c0,4.117-3.339,7.457-7.458,7.457H8.415C4.296,19.023,0.958,15.684,0.958,11.566z" />
                                                            <path fill="#676767" d="M25.908,3.454c3.276,3.273,3.276,8.58,0,11.851c-3.275,3.271-8.587,3.271-11.864,0
            					c-3.275-3.271-3.275-8.578,0-11.851C17.321,0.182,22.633,0.182,25.908,3.454"/>
                                                        </svg> : ""}
                                                    </span>
                                                </div>
                                                <svg version="1.1" id="Layer_1" xmlns="http://www.w3.org/2000/svg" xlink="http://www.w3.org/1999/xlink" x="0px" y="0px" width="115px" height="63px" viewBox="0 0 115 63" enable-background="new 0 0 115 63" space="preserve">

                                                </svg>
                                            </div>

                                            <div>
                                                <div class="top-reading d-flex counterno101">
                                                    <span class="w-50">
                                                        {AGENTS && AGENTS.counter12 == 1 ? <svg version="1.1" id="Layer_1" xmlns="http://www.w3.org/2000/svg" xlink="http://www.w3.org/1999/xlink" x="0px" y="0px" width="40px" height="19px" viewBox="0 0 40 19" enable-background="new 0 0 40 19" space="preserve">
                                                            <path fill="#FECB3E" d="M0.958,11.566L0.958,11.566c0-4.119,3.339-7.458,7.458-7.458h22.603c4.119,0,7.458,3.34,7.458,7.458c0,4.117-3.339,7.457-7.458,7.457H8.415C4.296,19.023,0.958,15.684,0.958,11.566z" />
                                                            <path fill="#676767" d="M25.908,3.454c3.276,3.273,3.276,8.58,0,11.851c-3.275,3.271-8.587,3.271-11.864,0
            					c-3.275-3.271-3.275-8.578,0-11.851C17.321,0.182,22.633,0.182,25.908,3.454"/>
                                                        </svg> : ""}
                                                    </span>
                                                    <span class="w-50 ">
                                                        {AGENTS && AGENTS.counter11 == 1 ? <svg version="1.1" id="Layer_1" xmlns="http://www.w3.org/2000/svg" xlink="http://www.w3.org/1999/xlink" x="0px" y="0px" width="40px" height="19px" viewBox="0 0 40 19" enable-background="new 0 0 40 19" space="preserve">
                                                            <path fill="#FECB3E" d="M0.958,11.566L0.958,11.566c0-4.119,3.339-7.458,7.458-7.458h22.603c4.119,0,7.458,3.34,7.458,7.458c0,4.117-3.339,7.457-7.458,7.457H8.415C4.296,19.023,0.958,15.684,0.958,11.566z" />
                                                            <path fill="#676767" d="M25.908,3.454c3.276,3.273,3.276,8.58,0,11.851c-3.275,3.271-8.587,3.271-11.864,0
            					c-3.275-3.271-3.275-8.578,0-11.851C17.321,0.182,22.633,0.182,25.908,3.454"/>
                                                        </svg> : ""}
                                                    </span>
                                                </div>
                                                <svg version="1.1" id="Layer_1" xmlns="http://www.w3.org/2000/svg" xlink="http://www.w3.org/1999/xlink" x="0px" y="0px" width="115px" height="63px" viewBox="0 0 115 63" enable-background="new 0 0 115 63" space="preserve">

                                                </svg>
                                            </div>

                                            <div>
                                                <div class="top-reading d-flex counterno101">
                                                    <span class="w-50 ">
                                                        {AGENTS && AGENTS.counter10 == 1 ? <svg version="1.1" id="Layer_1" xmlns="http://www.w3.org/2000/svg" xlink="http://www.w3.org/1999/xlink" x="0px" y="0px" width="40px" height="19px" viewBox="0 0 40 19" enable-background="new 0 0 40 19" space="preserve">
                                                            <path fill="#FECB3E" d="M0.958,11.566L0.958,11.566c0-4.119,3.339-7.458,7.458-7.458h22.603c4.119,0,7.458,3.34,7.458,7.458c0,4.117-3.339,7.457-7.458,7.457H8.415C4.296,19.023,0.958,15.684,0.958,11.566z" />
                                                            <path fill="#676767" d="M25.908,3.454c3.276,3.273,3.276,8.58,0,11.851c-3.275,3.271-8.587,3.271-11.864,0
            					c-3.275-3.271-3.275-8.578,0-11.851C17.321,0.182,22.633,0.182,25.908,3.454"/>
                                                        </svg> : ""}
                                                    </span>
                                                    <span class="w-50 ">
                                                        {AGENTS && AGENTS.counter9 == 1 ? <svg version="1.1" id="Layer_1" xmlns="http://www.w3.org/2000/svg" xlink="http://www.w3.org/1999/xlink" x="0px" y="0px" width="40px" height="19px" viewBox="0 0 40 19" enable-background="new 0 0 40 19" space="preserve">
                                                            <path fill="#FECB3E" d="M0.958,11.566L0.958,11.566c0-4.119,3.339-7.458,7.458-7.458h22.603c4.119,0,7.458,3.34,7.458,7.458c0,4.117-3.339,7.457-7.458,7.457H8.415C4.296,19.023,0.958,15.684,0.958,11.566z" />
                                                            <path fill="#676767" d="M25.908,3.454c3.276,3.273,3.276,8.58,0,11.851c-3.275,3.271-8.587,3.271-11.864,0
            					c-3.275-3.271-3.275-8.578,0-11.851C17.321,0.182,22.633,0.182,25.908,3.454"/>
                                                        </svg> : ""}
                                                    </span>
                                                </div>
                                                <svg version="1.1" id="Layer_1" xmlns="http://www.w3.org/2000/svg" xlink="http://www.w3.org/1999/xlink" x="0px" y="0px" width="115px" height="63px" viewBox="0 0 115 63" enable-background="new 0 0 115 63" space="preserve">

                                                </svg>
                                            </div>

                                            <div>
                                                <div class="top-reading d-flex counterno101">
                                                    <span class="w-50">
                                                        {AGENTS && AGENTS.counter8 == 1 ? <svg version="1.1" id="Layer_1" xmlns="http://www.w3.org/2000/svg" xlink="http://www.w3.org/1999/xlink" x="0px" y="0px" width="40px" height="19px" viewBox="0 0 40 19" enable-background="new 0 0 40 19" space="preserve">
                                                            <path fill="#FECB3E" d="M0.958,11.566L0.958,11.566c0-4.119,3.339-7.458,7.458-7.458h22.603c4.119,0,7.458,3.34,7.458,7.458c0,4.117-3.339,7.457-7.458,7.457H8.415C4.296,19.023,0.958,15.684,0.958,11.566z" />
                                                            <path fill="#676767" d="M25.908,3.454c3.276,3.273,3.276,8.58,0,11.851c-3.275,3.271-8.587,3.271-11.864,0
            					c-3.275-3.271-3.275-8.578,0-11.851C17.321,0.182,22.633,0.182,25.908,3.454"/>
                                                        </svg> : ""}
                                                    </span>
                                                    <span class="w-50 ">
                                                        {AGENTS && AGENTS.counter7 == 1 ? <svg version="1.1" id="Layer_1" xmlns="http://www.w3.org/2000/svg" xlink="http://www.w3.org/1999/xlink" x="0px" y="0px" width="40px" height="19px" viewBox="0 0 40 19" enable-background="new 0 0 40 19" space="preserve">
                                                            <path fill="#FECB3E" d="M0.958,11.566L0.958,11.566c0-4.119,3.339-7.458,7.458-7.458h22.603c4.119,0,7.458,3.34,7.458,7.458c0,4.117-3.339,7.457-7.458,7.457H8.415C4.296,19.023,0.958,15.684,0.958,11.566z" />
                                                            <path fill="#676767" d="M25.908,3.454c3.276,3.273,3.276,8.58,0,11.851c-3.275,3.271-8.587,3.271-11.864,0
            					c-3.275-3.271-3.275-8.578,0-11.851C17.321,0.182,22.633,0.182,25.908,3.454"/>
                                                        </svg> : ""}
                                                    </span>
                                                </div>
                                                <svg version="1.1" id="Layer_1" xmlns="http://www.w3.org/2000/svg" xlink="http://www.w3.org/1999/xlink" x="0px" y="0px" width="115px" height="63px" viewBox="0 0 115 63" enable-background="new 0 0 115 63" space="preserve">

                                                </svg>
                                            </div>

                                            <div>
                                                <div class="top-reading d-flex counterno101">
                                                    <span class="w-50">
                                                        {AGENTS && AGENTS.counter6 == 1 ? <svg version="1.1" id="Layer_1" xmlns="http://www.w3.org/2000/svg" xlink="http://www.w3.org/1999/xlink" x="0px" y="0px" width="40px" height="19px" viewBox="0 0 40 19" enable-background="new 0 0 40 19" space="preserve">
                                                            <path fill="#FECB3E" d="M0.958,11.566L0.958,11.566c0-4.119,3.339-7.458,7.458-7.458h22.603c4.119,0,7.458,3.34,7.458,7.458c0,4.117-3.339,7.457-7.458,7.457H8.415C4.296,19.023,0.958,15.684,0.958,11.566z" />
                                                            <path fill="#676767" d="M25.908,3.454c3.276,3.273,3.276,8.58,0,11.851c-3.275,3.271-8.587,3.271-11.864,0
            					c-3.275-3.271-3.275-8.578,0-11.851C17.321,0.182,22.633,0.182,25.908,3.454"/>
                                                        </svg> : ""}
                                                    </span>
                                                    <span class="w-50 ">
                                                        {AGENTS && AGENTS.counter5 == 1 ? <svg version="1.1" id="Layer_1" xmlns="http://www.w3.org/2000/svg" xlink="http://www.w3.org/1999/xlink" x="0px" y="0px" width="40px" height="19px" viewBox="0 0 40 19" enable-background="new 0 0 40 19" space="preserve">
                                                            <path fill="#FECB3E" d="M0.958,11.566L0.958,11.566c0-4.119,3.339-7.458,7.458-7.458h22.603c4.119,0,7.458,3.34,7.458,7.458c0,4.117-3.339,7.457-7.458,7.457H8.415C4.296,19.023,0.958,15.684,0.958,11.566z" />
                                                            <path fill="#676767" d="M25.908,3.454c3.276,3.273,3.276,8.58,0,11.851c-3.275,3.271-8.587,3.271-11.864,0
            					c-3.275-3.271-3.275-8.578,0-11.851C17.321,0.182,22.633,0.182,25.908,3.454"/>
                                                        </svg> : ""}
                                                    </span>
                                                </div>
                                                <svg version="1.1" id="Layer_1" xmlns="http://www.w3.org/2000/svg" xlink="http://www.w3.org/1999/xlink" x="0px" y="0px" width="115px" height="63px" viewBox="0 0 115 63" enable-background="new 0 0 115 63" space="preserve">

                                                </svg>
                                            </div>

                                            <div>
                                                <div class="top-reading d-flex counterno101">
                                                    <span class="w-50">
                                                        {AGENTS && AGENTS.counter4 == 1 ? <svg version="1.1" id="Layer_1" xmlns="http://www.w3.org/2000/svg" xlink="http://www.w3.org/1999/xlink" x="0px" y="0px" width="40px" height="19px" viewBox="0 0 40 19" enable-background="new 0 0 40 19" space="preserve">
                                                            <path fill="#FECB3E" d="M0.958,11.566L0.958,11.566c0-4.119,3.339-7.458,7.458-7.458h22.603c4.119,0,7.458,3.34,7.458,7.458c0,4.117-3.339,7.457-7.458,7.457H8.415C4.296,19.023,0.958,15.684,0.958,11.566z" />
                                                            <path fill="#676767" d="M25.908,3.454c3.276,3.273,3.276,8.58,0,11.851c-3.275,3.271-8.587,3.271-11.864,0
            					c-3.275-3.271-3.275-8.578,0-11.851C17.321,0.182,22.633,0.182,25.908,3.454"/>
                                                        </svg> : ""}
                                                    </span>
                                                    <span class="w-50 ">
                                                        {AGENTS && AGENTS.counter3 == 1 ? <svg version="1.1" id="Layer_1" xmlns="http://www.w3.org/2000/svg" xlink="http://www.w3.org/1999/xlink" x="0px" y="0px" width="40px" height="19px" viewBox="0 0 40 19" enable-background="new 0 0 40 19" space="preserve">
                                                            <path fill="#FECB3E" d="M0.958,11.566L0.958,11.566c0-4.119,3.339-7.458,7.458-7.458h22.603c4.119,0,7.458,3.34,7.458,7.458c0,4.117-3.339,7.457-7.458,7.457H8.415C4.296,19.023,0.958,15.684,0.958,11.566z" />
                                                            <path fill="#676767" d="M25.908,3.454c3.276,3.273,3.276,8.58,0,11.851c-3.275,3.271-8.587,3.271-11.864,0
            					c-3.275-3.271-3.275-8.578,0-11.851C17.321,0.182,22.633,0.182,25.908,3.454"/>
                                                        </svg> : ""}
                                                    </span>
                                                </div>
                                                <svg version="1.1" id="Layer_1" xmlns="http://www.w3.org/2000/svg" xlink="http://www.w3.org/1999/xlink" x="0px" y="0px" width="115px" height="63px" viewBox="0 0 115 63" enable-background="new 0 0 115 63" space="preserve">

                                                </svg>
                                            </div>

                                            <div>
                                                <div class="top-reading d-flex counterno101">
                                                    <span class="w-50 ">
                                                        {AGENTS && AGENTS.counter2 == 1 ? <svg version="1.1" id="Layer_1" xmlns="http://www.w3.org/2000/svg" xlink="http://www.w3.org/1999/xlink" x="0px" y="0px" width="40px" height="19px" viewBox="0 0 40 19" enable-background="new 0 0 40 19" space="preserve">
                                                            <path fill="#FECB3E" d="M0.958,11.566L0.958,11.566c0-4.119,3.339-7.458,7.458-7.458h22.603c4.119,0,7.458,3.34,7.458,7.458c0,4.117-3.339,7.457-7.458,7.457H8.415C4.296,19.023,0.958,15.684,0.958,11.566z" />
                                                            <path fill="#676767" d="M25.908,3.454c3.276,3.273,3.276,8.58,0,11.851c-3.275,3.271-8.587,3.271-11.864,0
            					c-3.275-3.271-3.275-8.578,0-11.851C17.321,0.182,22.633,0.182,25.908,3.454"/>
                                                        </svg> : ""}</span>
                                                    <span class="w-50 ">
                                                        {AGENTS && AGENTS.counter1 == 1 ? <svg version="1.1" id="Layer_1" xmlns="http://www.w3.org/2000/svg" xlink="http://www.w3.org/1999/xlink" x="0px" y="0px" width="40px" height="19px" viewBox="0 0 40 19" enable-background="new 0 0 40 19" space="preserve">
                                                            <path fill="#FECB3E" d="M0.958,11.566L0.958,11.566c0-4.119,3.339-7.458,7.458-7.458h22.603c4.119,0,7.458,3.34,7.458,7.458c0,4.117-3.339,7.457-7.458,7.457H8.415C4.296,19.023,0.958,15.684,0.958,11.566z" />
                                                            <path fill="#676767" d="M25.908,3.454c3.276,3.273,3.276,8.58,0,11.851c-3.275,3.271-8.587,3.271-11.864,0
            					c-3.275-3.271-3.275-8.578,0-11.851C17.321,0.182,22.633,0.182,25.908,3.454"/>
                                                        </svg> : ""}
                                                    </span>
                                                </div>
                                                <svg version="1.1" id="Layer_1" xmlns="http://www.w3.org/2000/svg" xlink="http://www.w3.org/1999/xlink" x="0px" y="0px" width="115px" height="63px" viewBox="0 0 115 63" enable-background="new 0 0 115 63" space="preserve">

                                                </svg>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <br></br>
                                <br></br>

                                <div class="ticket-counter">
                                    <div class="bg-img">
                                        {/* <div class="bg-bar">
                                            <svg version="1.1" id="Layer_1" xmlns="http://www.w3.org/2000/svg" xlink="http://www.w3.org/1999/xlink" x="0px" y="0px" width="943px" height="37px" viewBox="0 0 943 37" enable-background="new 0 0 943 37" space="preserve">
                                                <rect x="-3" y="-4" opacity="0" width="950" height="44" />
                                                <rect x="0.811" y="-0.864" fill="#CECECE" width="943" height="37" />
                                            </svg>
                                        </div> */}
                                        <div class="ticket-computers">
                                            <div>
                                                <div class="top-reading d-flex counterno101">
                                                    <span class="w-50">16</span>
                                                    <span class="w-50">15</span>
                                                </div>
                                                <svg version="1.1" id="Layer_1" xmlns="http://www.w3.org/2000/svg" xlink="http://www.w3.org/1999/xlink" x="0px" y="0px" width="115px" height="63px" viewBox="0 0 115 63" enable-background="new 0 0 115 63" space="preserve">

                                                </svg>
                                            </div>

                                            <div>
                                                <div class="top-reading d-flex counterno101">
                                                    <span class="w-50 ">14</span>
                                                    <span class="w-50 ">13</span>
                                                </div>
                                                <svg version="1.1" id="Layer_1" xmlns="http://www.w3.org/2000/svg" xlink="http://www.w3.org/1999/xlink" x="0px" y="0px" width="115px" height="63px" viewBox="0 0 115 63" enable-background="new 0 0 115 63" space="preserve">

                                                </svg>
                                            </div>

                                            <div>
                                                <div class="top-reading d-flex counterno101">
                                                    <span class="w-50">12</span>
                                                    <span class="w-50 ">11</span>
                                                </div>
                                                <svg version="1.1" id="Layer_1" xmlns="http://www.w3.org/2000/svg" xlink="http://www.w3.org/1999/xlink" x="0px" y="0px" width="115px" height="63px" viewBox="0 0 115 63" enable-background="new 0 0 115 63" space="preserve">

                                                </svg>
                                            </div>

                                            <div>
                                                <div class="top-reading d-flex counterno101">
                                                    <span class="w-50 ">10</span>
                                                    <span class="w-50 ">9</span>
                                                </div>
                                                <svg version="1.1" id="Layer_1" xmlns="http://www.w3.org/2000/svg" xlink="http://www.w3.org/1999/xlink" x="0px" y="0px" width="115px" height="63px" viewBox="0 0 115 63" enable-background="new 0 0 115 63" space="preserve">

                                                </svg>
                                            </div>

                                            <div>
                                                <div class="top-reading d-flex counterno101">
                                                    <span class="w-50">8</span>
                                                    <span class="w-50 ">7</span>
                                                </div>
                                                <svg version="1.1" id="Layer_1" xmlns="http://www.w3.org/2000/svg" xlink="http://www.w3.org/1999/xlink" x="0px" y="0px" width="115px" height="63px" viewBox="0 0 115 63" enable-background="new 0 0 115 63" space="preserve">

                                                </svg>
                                            </div>

                                            <div>
                                                <div class="top-reading d-flex counterno101">
                                                    <span class="w-50">6</span>
                                                    <span class="w-50 ">5</span>
                                                </div>
                                                <svg version="1.1" id="Layer_1" xmlns="http://www.w3.org/2000/svg" xlink="http://www.w3.org/1999/xlink" x="0px" y="0px" width="115px" height="63px" viewBox="0 0 115 63" enable-background="new 0 0 115 63" space="preserve">

                                                </svg>
                                            </div>

                                            <div>
                                                <div class="top-reading d-flex counterno101">
                                                    <span class="w-50">4</span>
                                                    <span class="w-50 ">3</span>
                                                </div>
                                                <svg version="1.1" id="Layer_1" xmlns="http://www.w3.org/2000/svg" xlink="http://www.w3.org/1999/xlink" x="0px" y="0px" width="115px" height="63px" viewBox="0 0 115 63" enable-background="new 0 0 115 63" space="preserve">

                                                </svg>
                                            </div>

                                            <div>
                                                <div class="top-reading d-flex counterno101">
                                                    <span class="w-50 ">2</span>
                                                    <span class="w-50 ">1</span>
                                                </div>
                                                <svg version="1.1" id="Layer_1" xmlns="http://www.w3.org/2000/svg" xlink="http://www.w3.org/1999/xlink" x="0px" y="0px" width="115px" height="63px" viewBox="0 0 115 63" enable-background="new 0 0 115 63" space="preserve">

                                                </svg>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        {/* </div> */}
                    </div>

                </div>

            </div>

        );
    }
}

const mapStateToProps = state => ({})

export default connect(mapStateToProps, null)(TicketCounter);