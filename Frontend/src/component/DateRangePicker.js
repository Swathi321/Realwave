import React from 'react';
import { Modal, ModalHeader, ModalBody, Label } from 'reactstrap';
import gridSearch from '../assets/img/Newicon/grid_search.svg';
import createManualClip from '../assets/img/Newicon/create_manual_clip.svg';
import dateSearch from '../assets/img/Newicon/date_search.svg';
import 'react-datetime/css/react-datetime.css';
import DatePicker from 'react-datepicker';
import moment from 'moment-timezone';
import swal from 'sweetalert';

import 'react-datepicker/dist/react-datepicker.css';

class DateRangePicker extends React.PureComponent {
    state = {
        startDate: '',
        endDate: '',
        dateRange: {
            start: null,
            end: null
        }
    }

    startDateChange = (selectedDate) => {
        let newObj = { ...this.state.dateRange }
        newObj.start = selectedDate;
        this.setState({ dateRange: newObj, startDate: selectedDate ? selectedDate : '' });
    }

    endDateChange = (selectedDate) => {
        let newObj = { ...this.state.dateRange }
        newObj.end = selectedDate;
        this.setState({ dateRange: newObj, endDate: selectedDate ? selectedDate : '' })
    }

    onSearch = (event) => {
        event.preventDefault();
        let { dateRange } = this.state;
        const { onSelect, timezone } = this.props;
        dateRange.start = moment(dateRange.start);
        if (dateRange.end) {
            dateRange.end = moment(dateRange.end);
        } else {
            if (timezone) {
                dateRange.end = moment().tz(timezone);
            } else {
                dateRange.end = moment()
            }
        }

        if (this.onValidateDateRange(dateRange)) {
            //     //dateRange.end = dateRange.end ? moment(dateRange.end) : moment();
            onSelect(dateRange, "SEARCH", timezone);
            this.setState({ startDate: '', endDate: '', dateRange: { start: null, end: null } });
        }
    }



    onCreateClip = (event) => {
        event.preventDefault();
        let { dateRange } = this.state;
        let { camData } = this.props;
        dateRange.start = moment(dateRange.start);
        if (dateRange.end) {
            dateRange.end = moment(dateRange.end);
        } else {
            if (this.props.timezone) {
                dateRange.end = moment().tz(this.props.timezone);
            } else {
                dateRange.end = moment()
            }
        }
        if (this.onValidateDateRange(dateRange)) {
            //dateRange.end = dateRange.end ? moment(dateRange.end) : moment();
            if (camData && camData.storeId && camData.storeId.type && camData.storeId.type == "Rex" && window.isHostedApp) {
                let retMe = {
                    address: camData.storeId.nvrAddress,
                    username: camData.storeId.nvrUsername,
                    password: camData.storeId.nvrPassword,
                    start: dateRange.start,
                    end: dateRange.end,
                    cameraid: camData.primaryCameraId,
                    streamid: camData.recordingStreamId,
                    timezone: camData.storeId.timezoneValue,
                    nvrPort: camData.storeId.nvrPort
                };
                try {
                    window.external.notify(retMe);
                    window.alert("Call done for window.external.notify");
                }
                catch (ex) {
                    window.alert("Error in calling window.external.notify : " + ex);
                }

                try {
                    window.chrome.webview.postMessage(retMe);
                    window.alert("Call done for window.chrome.webview");
                }
                catch (ex) {
                    window.alert("Error in calling window.chrome.webview : " + ex);
                }
                this.onClose();
            }
            else {
                this.props.onSelect(dateRange, "CREATE_CLIP", this.props.timezone);
            }

            this.setState({ startDate: '', endDate: '', dateRange: { start: null, end: null } });
        }
    }
    onValidateDateRange = (dateRange) => {
        let { startDuration, endDuration } = this.props;
        let start = moment(startDuration);
        let end = moment(endDuration);
        let startDiff = dateRange.start.diff(start, "minute");
        let startEndDiff = dateRange.start.diff(end, "minute");
        let endDiff = dateRange.end.diff(end, "minute");
        let endStartDiff = dateRange.end.diff(start, "minute");
        if ((startDiff < 0 || endStartDiff < 0) || (endDiff > 0 || startEndDiff > 0)) {
            swal({
                title: "Warning",
                text: "Please select valid time",
                icon: "warning"
            });
            return false;
        }
        return true;
    }
    onGridSearch = (event) => {
        event.preventDefault();
        let { dateRange } = this.state;
        dateRange.start = moment(dateRange.start);
        if (dateRange.end) {
            dateRange.end = moment(dateRange.end);
        } else {
            if (this.props.timezone) {
                dateRange.end = moment().tz(this.props.timezone);
            } else {
                dateRange.end = moment();
            }
        }
        if (this.onValidateDateRange(dateRange)) {
            //dateRange.end = dateRange.end ? moment(dateRange.end) : moment();
            this.props.onSelect(dateRange, "GRID_SEARCH", this.props.timezone);
            this.setState({ startDate: '', endDate: '', dateRange: { start: null, end: null } });
        }
    }
    onClose = () => {
        this.setState({ startDate: '', endDate: '' });
        this.props.onClose();
    }
    render() {
        let { isOpen, onClose, camData, startDuration, endDuration, ontimeLine } = this.props;
        let { startDate, endDate } = this.state;
        let minDate = new Date();
        minDate = minDate.setMonth(minDate.getMonth() - 2);
        return (
            <Modal isOpen={isOpen} className={"popup-sales timeline-modal"}>
                <ModalHeader className="widgetHeaderColor" toggle={this.onClose}>
                    <div>
                        <div>
                            Select Date Range
                        </div>
                        <div className="dateRangeDiv">
                            {`${moment(startDuration).format('MM/DD/YYYY hh:mm:ss A')} - ${moment(endDuration).format('MM/DD/YYYY hh:mm:ss A')}`}
                        </div>
                    </div>
                </ModalHeader>
                <ModalBody className="reorderBody">
                    <div>
                        <DatePicker
                            selected={startDate}
                            onChange={this.startDateChange}
                            timeInputLabel="Time:"
                            dateFormat="MM/dd/yyyy h:mmaa"
                            showTimeInput
                            className="form-control"
                            placeholderText='Start Date'
                            minDate={moment(startDuration)}
                            maxDate={moment(endDuration)}
                        />
                        <br />
                        <DatePicker
                            selected={endDate}
                            onChange={this.endDateChange}
                            timeInputLabel="Time:"
                            dateFormat="MM/dd/yyyy h:mmaa"
                            showTimeInput
                            className="form-control"
                            placeholderText='End Date'
                            minDate={moment(startDuration)}
                            maxDate={moment(endDuration)}
                        />
                    </div>
                    <br />
                    {ontimeLine ?
                        <div className="form-button-group center">
                            <button title="Create Clip" className="btn date_range_picker_button_color" onClick={this.onCreateClip}><img src={createManualClip} alt="createManualClip" className='create_clip_search_width' /> </button><div className="clear" />
                        </div> :
                        <div className="form-button-group center">

                            <button title="Search" className="btn date_range_picker_button_color" onClick={this.onSearch}><img src={dateSearch} alt="dateSearch" className='create_clip_search_width' /></button><div className="clear" />
                            <button title="Create Clip" className="btn date_range_picker_button_color" onClick={this.onCreateClip}><img src={createManualClip} alt="createManualClip" className='create_clip_search_width' /> </button><div className="clear" />
                            <button title="Grid Search" className="btn date_range_picker_button_color" onClick={this.onGridSearch}><img src={gridSearch} alt="gridSearch" className='grid_search_width' /> </button><div className="clear" />
                            <button title="Cancel" className="btn date_range_picker_button_color" onClick={onClose}><i className="fa search-grid-cancel fa-close" aria-hidden="true"></i></button>

                        </div>}


                </ModalBody>
            </Modal>
        )
    }
}

export default DateRangePicker;
