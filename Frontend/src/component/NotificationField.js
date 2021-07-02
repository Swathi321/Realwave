
import React, { Component } from "react";
import { Col, FormGroup, Input, Collapse, Card, CardHeader, CardBody } from "reactstrap";
import { Radio, TimePicker, Button as AntButton } from "antd";
import SelectDrop from "./../views/Store/SelectDrop";
import { DeleteOutlined } from "@ant-design/icons";
import moment from "moment";
import swal from "sweetalert";
import utils from "../Util/Util"
import { Select as AntSelect } from 'antd';

const { Option } = AntSelect;

const format = "HH:mm a";

const colourStyles2 = {
    menu: (provided, state) => ({
        ...provided,
        height: "100px",
        overflowY: "scroll"
    })
}

class NotificationField extends Component {

    constructor(props) {
        super(props);
        this.state = {
            weekDaysAccordian: [
                {
                    id: 0,
                    day: "Monday",
                    weekDay: "Mon",
                    checked: false,
                    status: false,
                    entireDay: false,
                    copiedWeekDays: [],
                    weekDaysOptions: [],
                    timeLine: [
                        { start: "12:00 am", end: "11:59 pm", emails: [], phone: [], delStatus: false },
                    ],
                },
                {
                    id: 1,
                    day: "Tuesday",
                    weekDay: "Tue",
                    checked: false,
                    status: false,
                    entireDay: false,
                    copiedWeekDays: [],
                    weekDaysOptions: [],
                    timeLine: [
                        { start: "12:00 am", end: "11:59 pm", emails: [], phone: [], delStatus: false },
                    ],
                },
                {
                    id: 2,
                    day: "Wednesday",
                    weekDay: "Wed",
                    checked: false,
                    status: false,
                    copiedWeekDays: [],
                    entireDay: false,
                    weekDaysOptions: [],
                    timeLine: [
                        { start: "12:00 am", end: "11:59 pm", emails: [], phone: [], delStatus: false },
                    ],
                },
                {
                    id: 3,
                    day: "Thursday",
                    weekDay: "Thu",
                    checked: false,
                    status: false,
                    copiedWeekDays: [],
                    entireDay: false,
                    weekDaysOptions: [],
                    timeLine: [
                        { start: "12:00 am", end: "11:59 pm", emails: [], phone: [], delStatus: false },
                    ],
                },
                {
                    id: 4,
                    day: "Friday",
                    weekDay: "Fri",
                    checked: false,
                    status: false,
                    copiedWeekDays: [],
                    entireDay: false,
                    weekDaysOptions: [],
                    timeLine: [
                        { start: "12:00 am", end: "11:59 pm", emails: [], phone: [], delStatus: false },
                    ],
                },
                {
                    id: 5,
                    day: "Saturday",
                    weekDay: "Sat",
                    checked: false,
                    status: false,
                    copiedWeekDays: [],
                    entireDay: false,
                    weekDaysOptions: [],
                    timeLine: [
                        { start: "12:00 am", end: "11:59 pm", emails: [], phone: [], delStatus: false },
                    ],
                },
                {
                    id: 6,
                    day: "Sunday",
                    weekDay: "Sun",
                    checked: false,
                    status: false,
                    copiedWeekDays: [],
                    entireDay: false,
                    weekDaysOptions: [],
                    timeLine: [
                        { start: "12:00 am", end: "11:59 pm", emails: [], phone: [], delStatus: false },
                    ],
                },
            ],
            entireDayStatus: "",
            notifyStatus: this.props.notifyStatus || false,
            timeStart: "12:00 am",
            timeEnd: "11:59 pm",
            selectedEmailNotify: "",
            selectedPhoneNotify: "",
            copyWeekDays: [],
            weekDays: [
                { value: "Monday", label: "Monday" },
                { value: "Tuesday", label: "Tuesday" },
                { value: "Wednesday", label: "Wednesday" },
                { value: "Thursday", label: "Thursday" },
                { value: "Friday", label: "Friday" },
                { value: "Saturday", label: "Saturday" },
                { value: "Sunday", label: "Sunday" }
            ],
            // Take from parent as props
            clientId: this.props.clientId,
            userEmailsPhones: this.props.userEmailsPhones
        };

        this.creatingNotificationArray();
    }

    creatingNotificationArray = () => {
        let days = this.props.weekDaysAccordian;
        let timeLine = [];

        days.map((x) => {
            this.state.weekDaysAccordian.map((y) => {
                if (x.doW == y.day) {
                    y.checked = true;
                    y.entireDay = x.entireDay;
                    console.log(x.timeSlot.length);
                    if (x.entireDay) {
                        console.log(x.timeSlot);
                        let emptyData = {
                            start: "",
                            end: "",
                            emails: [],
                            phone: [],
                            delStatus: false,
                        };
                        emptyData.start = "12:00 am";
                        emptyData.end = "11:59 pm";
                        emptyData.delStatus = false;

                        if (x.timeSlot[0].emailNotificationTo.length > 0)
                            emptyData.emails = x.timeSlot[0].emailNotificationTo;
                        if (
                            Object.keys(x.timeSlot[0].emailNotificationUsers).length >
                            0
                        ) {
                            x.timeSlot[0].emailNotificationUsers.forEach((email) => {
                                console.log(email);
                                emptyData.emails.push(email._id);
                            });
                        }
                        if (x.timeSlot[0].smsNotificationTo.length > 0)
                            emptyData.phone = x.timeSlot[0].smsNotificationTo;
                        if (
                            Object.keys(x.timeSlot[0].smsNotificationUsers).length > 0
                        ) {
                            x.timeSlot[0].smsNotificationUsers.forEach((phone) => {
                                emptyData.phone.push(phone._id);
                            });
                        }

                        y.timeLine = [emptyData]
                        return y
                    } else {
                        let emptyData = {
                            start: "",
                            end: "",
                            emails: [],
                            phone: [],
                            delStatus: false,
                        };
                        if (x.timeSlot.length > 0) {
                            let timeSlot = x.timeSlot;
                            for (let i = 0; i < timeSlot.length; i++) {
                                console.log(timeSlot[i]);

                                if (timeSlot[i].emailNotificationTo.length > 0)
                                    emptyData.emails = timeSlot[i].emailNotificationTo;
                                if (
                                    Object.keys(timeSlot[i].emailNotificationUsers).length >
                                    0
                                ) {
                                    timeSlot[i].emailNotificationUsers.forEach((email) => {
                                        console.log(email);
                                        emptyData.emails.push(email._id);
                                    });
                                }
                                if (timeSlot[i].smsNotificationTo.length > 0)
                                    emptyData.phone = timeSlot[i].smsNotificationTo;
                                if (
                                    Object.keys(timeSlot[i].smsNotificationUsers).length > 0
                                ) {
                                    timeSlot[i].smsNotificationUsers.forEach((phone) => {
                                        emptyData.phone.push(phone._id);
                                    });
                                }
                                emptyData.start = timeSlot[i].StartTime;
                                emptyData.end = timeSlot[i].EndTime;
                                emptyData.delStatus = true;
                                timeLine.push(emptyData);
                                y.timeLine = timeLine;
                                emptyData = {
                                    start: "",
                                    end: "",
                                    emails: [],
                                    phone: [],
                                    delStatus: false,
                                };
                            }
                            timeLine = [];
                        }

                        console.log(y);
                        return y;
                    }
                } else {

                    if (x.doW) y.weekDaysOptions.push({ value: x.doW, label: x.doW });
                    return y;
                }
            });
        });
    }

    callBack = () => {
        const { weekDaysAccordian, notifyStatus } = this.state;
        const { onChange } = this.props;
        onChange && onChange({
            weekDaysAccordian: weekDaysAccordian,
            notificationStatus: notifyStatus
        });
    }

    enableNotification = (status) => {
        this.setState({ notifyStatus: !status }, this.callBack);
    };

    toggleAccWeek = async (e) => {
        let data = this.state.weekDaysAccordian;
        data = await data.map((x) => {
            if (e == x.id) {
                x.status = !x.status;
                return x;
            } else {
                return x;
            }
        })

        this.setState({ weekDaysAccordian: data }, this.callBack);
    };

    setDayStatus = async (e, day) => {
        let value = e.target.value;
        let { weekDaysAccordian, entireDayStatus } = this.state;
        console.log(weekDaysAccordian, value);
        let data = [];
        console.log(day);
        data = await weekDaysAccordian.map((x) => {
            console.log(x);
            if (x.weekDay == day) {
                x.entireDay = value;
                console.log("Monday", x.entireDay);

                if (value)
                    x.timeLine = [
                        { start: "12:00 am", end: "11:59 pm", emails: [], phone: [], delStatus: false },
                    ];

                return x;
            } else {
                return x;
            }
        });

        this.setState({ weekDaysAccordian: data, entireDayStatus: value }, this.callBack);
    }

    timePick1 = (ts, t, day, index) => {
        let data = JSON.parse(JSON.stringify(this.state.weekDaysAccordian));
        data.map(async (x) => {
            if (x.day == day) {
                await x.timeLine.map((y, uni) => {
                    if (uni == index) {
                        y.start = t;
                        console.log(y.start, "y.start");
                    }
                    return y;
                });
                return x;
            } else {
                return x;
            }
        });

        this.setState({ weekDaysAccordian: data, timeStart: t }, this.callBack);
    };

    timePick2 = async (ts, t, day, index) => {
        let data = JSON.parse(JSON.stringify(this.state.weekDaysAccordian));
        data.map((x) => {
            if (x.day == day) {
                x.timeLine.map((y, uni) => {
                    if (uni == index) {
                        y.end = t;
                    }
                    return y;
                });
                if (x.timeLine.length > 1 && index != x.timeLine.length - 1) {
                    x.timeLine[index + 1].start = t;
                }
            }


        });

        this.setState({ weekDaysAccordian: data, timeEnd: t }, this.callBack);
    }

    saveTimeSlots = async (e, day, id) => {
        e.preventDefault();
        console.log(
            this.state.timeEnd,
            this.state.timeStart,
            this.state.selectedEmailNotify,
            this.state.selectedPhoneNotify,
            this.state.entireDayStatus
        );
        let {
            weekDaysAccordian,
            timeEnd,
            timeStart,
            selectedPhoneNotify,
            selectedEmailNotify,
            copyWeekDays,
        } = this.state;

        console.log(
            weekDaysAccordian,
            timeEnd,
            timeStart,
            selectedPhoneNotify,
            selectedEmailNotify
        );
        let data = [];
        let weekDaysAccordianCopy = JSON.parse(JSON.stringify(this.state.weekDaysAccordian));

        let sendStartTime = "";
        if (
            timeEnd.length > 0 &&
            timeStart.length > 0 && selectedPhoneNotify &&
            selectedEmailNotify
        ) {
            data = await weekDaysAccordianCopy.map((x) => {
                if (x.day == day) {
                    x.timeLine = x.timeLine.map((y, index) => {
                        let data = {
                            start: timeStart,
                            end: timeEnd,
                            emails: selectedEmailNotify.email,
                            phone: selectedPhoneNotify.phone,
                            delStatus: true,
                        };
                        if (index == id) {
                            if (y.delStatus == true) return y;
                            else return data;
                        } else {
                            return y;
                        }
                    });
                    sendStartTime = x.timeLine[x.timeLine.length - 1].end;

                    return x;
                } else {
                    return x;
                }
            });

            let data1 = [...data];
            this.setState({
                weekDaysAccordian: data1,
                selectedEmailNotify: [],
                selectedPhoneNotify: [],
                timeEnd: "12:00 am",
                timeStart: sendStartTime,
            });

        }

        if (copyWeekDays.length > 0) {

            swal({
                title: "Status",
                text: "It will Override the timeslots",
                icon: "warning",
                showCancelButton: true,
                showConfirmButton: true,
            }).then(
                async function () {

                    let data = weekDaysAccordianCopy.find(x => x.day == day);
                    let CopyData = JSON.parse(JSON.stringify(data));

                    copyWeekDays = await copyWeekDays.map(async (y) => {
                        weekDaysAccordianCopy.map((x) => {
                            if (x.day == y) {
                                console.log(x.day, y);
                                x.entireDay = CopyData.entireDay;
                                x.timeLine = [...CopyData.timeLine];
                                return x;
                            } else {
                                return x;
                            }
                        });
                    });

                    this.setState({ weekDaysAccordian: [...weekDaysAccordianCopy] }, this.callBack);

                }.bind(this)
            );
        }
    };

    addTimeSlot = (e, day) => {
        let data = [...this.state.weekDaysAccordian];
        let selectedWeekday = data.find(option => option.day === day);
        let NewTimeLine = { start: "", end: "", emails: [], phone: [], delStatus: false };
        selectedWeekday.timeLine.push(NewTimeLine);

        this.setState({ weekDaysAccordian: data }, this.callBack);
    }

    deleteTimeSlot = async (unique, day) => {
        let data = this.state.weekDaysAccordian;
        console.log(unique, day, this.state.weekDaysAccordian);
        let sendStartTime = "";
        data = await data.map((x) => {
            if (x.day == day) {
                console.log(x.day, x.timeLine);
                let store = [];
                x.timeLine.forEach((y, index) => {
                    console.log(index != unique, index, unique);
                    if (index != unique) store.push(y);
                });

                x.timeLine = store;
                console.log(x.timeLine, store);
                return x;
            } else {
                return x;
            }
        });
        console.log(data, sendStartTime);
        this.setState({ weekDaysAccordian: data }, this.callBack);
    };

    // schedule notify check boxes and copy weekdays options
    selectDays = async (id) => {

        console.log(id);
        let data = [...this.state.weekDaysAccordian];
        let selectedData = data.find(item => item.id === id);

        let add = selectedData.checked ? false : true;
        let dayName = selectedData.day;
        let weekDays = [...this.state.weekDays];

        data = await data.map((x) => {

            let options = [...x.weekDaysOptions];
            if (add) {
                if (id != x.id) options.push({ value: dayName, label: dayName });

                let filtterDays = weekDays.filter(ob => options.find(ob2 => ob.label === ob2.label));
                options = [...filtterDays];
            }
            else {
                let DayIndex = options.findIndex(dayy => dayy.value.toLowerCase() === dayName.toLowerCase());
                if (DayIndex !== -1) options.splice(DayIndex, 1);
            }

            x.weekDaysOptions = options;

            if (id == x.id) {
                x.checked = !x.checked;
                return x;
            } else {
                return x;
            }
        });
        this.setState({ weekDaysAccordian: data }, this.callBack);
    };


    // copy the above schedule to other days
    copyWeekDays = (val, day) => {
        let weekDaysAccordianCopy = [...this.state.weekDaysAccordian];
        let weekDaysAccordian = weekDaysAccordianCopy.map(x => {
            if (x.day == day) {
                x.copiedWeekDays = [...val]
                return x
            } else {
                return x
            }
        })

        this.setState({ weekDaysAccordian: this.state.weekDaysAccordian, copyWeekDays: val }, this.callBack);
    };

    selectEmail = (value, day, index, error) => {
        console.log(value, this.state.weekDaysAccordian, day, index);
        let data = JSON.parse(JSON.stringify(this.state.weekDaysAccordian));
        data.map(async (x) => {
            if (x.day == day) {
                await x.timeLine.map((y, uni) => {
                    if (uni == index) {
                        y.emails = value;
                        y.error = false;
                        y.EmailError = error;
                    }
                    return y;
                });


                return x;
            } else {
                console.log(x);
                return x;
            }
        });
        console.log(data);


        this.setState({ weekDaysAccordian: data, selectedEmailNotify: { email: value, day: day } }, this.callBack);
    };

    selectPhone = (value, day, index, error) => {
        let data = JSON.parse(JSON.stringify(this.state.weekDaysAccordian));
        data.map(async (x) => {
            if (x.day == day) {
                await x.timeLine.map((y, uni) => {
                    if (uni == index) {
                        y.phone = value;
                        y.error = false;
                        y.PhoneError = error;
                    }
                    return y;
                });
                return x;
            } else {
                return x;
            }
        });

        this.setState({ weekDaysAccordian: data, selectedPhoneNotify: { phone: value, day: day }, }, this.callBack);
    };

    render() {
        const { notifiToggle } = this.props;
        const { weekDaysAccordian, notifyStatus, clientId, weekDays, userEmailsPhones } = this.state;
        return (
            <>
                <br />
                <div style={{ padding: "0px 10px" }}>
                    <div className="row site-tab-holder">
                        <div className="col-lg-7">
                            &nbsp; Schedule Notifications <br />
                            {weekDaysAccordian.map((x) => {
                                return (
                                    <React.Fragment>
                                        <input
                                            type="checkbox"
                                            className="weekDays"
                                            checked={x.checked}
                                            value={x.weekDay}
                                            onClick={() => this.selectDays(x.id)}
                                        />
                                        <span>{x.weekDay}</span>
                                    </React.Fragment>
                                );
                            })}
                        </div>
                        {notifiToggle && <>
                            <div className="col-lg-1"></div>
                            <div className="col-lg-2 ">Enable Notification</div>
                            <div className="col-lg-1">
                                <label className="switch">
                                    <Input
                                        type="checkbox"
                                        className="toggle"
                                        checked={notifyStatus}
                                        onClick={() =>
                                            this.enableNotification(notifyStatus)
                                        }
                                        id="isActive"
                                    />
                                    <span className="slider round"></span>
                                </label>
                            </div>

                        </>}

                    </div>
                </div>
                <br />

                { weekDaysAccordian.map((item, index) => {
                    return (
                        <div style={{ padding: "0px 10px" }}>
                            {item.checked && (
                                <Card
                                    style={{
                                        marginBottom: "1rem"
                                    }}
                                    key={item.id}
                                    className="ml-auto mr-auto abc"
                                >
                                    <CardHeader className="p-2"
                                        onClick={() => this.toggleAccWeek(item.id)}
                                    >
                                        {item.day}
                                        {item.status ? (
                                            <i className="fa fa-angle-up floatRight" />
                                        ) : (
                                            <i className="fa fa-angle-down floatRight" />
                                        )}
                                    </CardHeader>

                                    <Collapse
                                        isOpen={item.id == index && item.status}
                                    >
                                        <CardBody>
                                            <div className="row site-tab-holder pl-2 ">
                                                <div className="col-lg-6">
                                                    Entire Day
                                                    <Radio.Group
                                                        className="ml-3"
                                                        onChange={(e) =>
                                                            this.setDayStatus(e, item.weekDay)
                                                        }
                                                        value={item.entireDay}
                                                    >
                                                        <Radio value={true} style={{ color: "white" }}>Yes</Radio>
                                                        <Radio value={false} style={{ color: "white" }}>No</Radio>
                                                    </Radio.Group>
                                                </div>
                                            </div>
                                            <br />


                                            {item.timeLine.map((x, unique) => {
                                                return (
                                                    <div key={unique}>
                                                        <div className="row site-tab-holder NotificationTime" style={{ margin: "1px 0px -14px" }}>
                                                            <div className="col-lg-2 ">
                                                                <FormGroup className="time-sty" row>
                                                                    <Col
                                                                        sm={12}
                                                                        className="text-field"
                                                                    >
                                                                        <div>
                                                                            <TimePicker
                                                                                value={moment(
                                                                                    x.start ? x.start : "12:00 am",
                                                                                    format
                                                                                )}
                                                                                disabled={item.entireDay}
                                                                                use12Hours
                                                                                format="h:mm a"
                                                                                onChange={(ts, t) =>
                                                                                    this.timePick1(
                                                                                        ts,
                                                                                        t,
                                                                                        item.day,
                                                                                        unique
                                                                                    )
                                                                                }
                                                                            />
                                                                            <label className="fixed-label">From</label>
                                                                        </div>
                                                                    </Col>
                                                                </FormGroup>
                                                            </div>
                                                            <div className="col-lg-2 ">
                                                                <FormGroup row>
                                                                    <Col
                                                                        sm={12}
                                                                        className="text-field"
                                                                    >

                                                                        <>
                                                                            <TimePicker
                                                                                use12Hours
                                                                                value={moment(item.entireDay ? "12:00 am" : x.end ? x.end.toLowerCase() : "11:59 pm", format)}
                                                                                disabled={item.entireDay}
                                                                                format="h:mm a"
                                                                                onChange={(ts, t) =>
                                                                                    this.timePick2(
                                                                                        ts,
                                                                                        t,
                                                                                        item.day,
                                                                                        unique
                                                                                    )
                                                                                }
                                                                            />
                                                                            <label className="fixed-label">To</label>
                                                                        </>
                                                                        {item.entireDay && <div style={{ fontSize: '9px' }}>Next Day</div>}
                                                                    </Col>
                                                                </FormGroup>
                                                            </div>
                                                            <div className="col-lg-3 customAntChanges">
                                                                <FormGroup row className="pr-3">
                                                                    <Col
                                                                        sm={12}
                                                                        className="text-field"
                                                                    >
                                                                        <SelectDrop
                                                                            index={unique}
                                                                            defaultEmail={x.emails}
                                                                            weekDay={item.day}
                                                                            selectEmail={
                                                                                this.selectEmail
                                                                            }
                                                                            check="email"
                                                                            clientId={clientId}
                                                                            userEmailsPhones={userEmailsPhones}
                                                                        />
                                                                        <label class="fixed-label">Email Notifications Users<span className={"text-danger"}>*</span>
                                                                        </label>

                                                                        {x.error && <div className="input-feedback">Required </div>}


                                                                        {x.EmailError && <div className="input-feedback"> {utils.NotiyEmailError}  </div>}
                                                                    </Col>
                                                                </FormGroup>
                                                            </div>

                                                            <div className="col-lg-3 customAntChanges ml-4">
                                                                <FormGroup row className="pr-3">
                                                                    <Col
                                                                        sm={12}
                                                                        className="text-field"
                                                                    >
                                                                        <SelectDrop
                                                                            index={unique}
                                                                            defaultEmail={x.phone}
                                                                            weekDay={item.day}
                                                                            selectPhone={
                                                                                this.selectPhone
                                                                            }
                                                                            check="phone"
                                                                            clientId={clientId}
                                                                            userEmailsPhones={userEmailsPhones}
                                                                        />
                                                                        <label class="fixed-label">Phone SMS Notifications Users<span className={"text-danger"}>*</span>
                                                                        </label>

                                                                        {x.error && <div className="input-feedback">Required </div>}

                                                                        {x.PhoneError && <div className="input-feedback"> {utils.NotiyPhoneError} </div>}
                                                                    </Col>
                                                                </FormGroup>
                                                            </div>
                                                            <div className="col-lg-1">
                                                                <FormGroup row >
                                                                    <Col sm={10} className="text-field" style={{ textAlign: "right" }}>
                                                                        {item.timeLine.length - 1 === unique && unique != 2 && !item.entireDay ?
                                                                            <AntButton
                                                                                className="ml-3 mb-1 pointer dashboard-button gridAdd" shape="circle"
                                                                                icon="plus"
                                                                                ghost
                                                                                onClick={(e) => this.addTimeSlot(e, item.day)}
                                                                            /> : null}
                                                                    </Col>
                                                                </FormGroup>
                                                            </div>

                                                            <div className="col-lg-1">
                                                                <FormGroup row>
                                                                    <Col
                                                                        sm={12}
                                                                        className="text-field"
                                                                    >
                                                                        {unique != 0 && (
                                                                            <DeleteOutlined
                                                                                onClick={() =>
                                                                                    this.deleteTimeSlot(
                                                                                        unique,
                                                                                        item.day
                                                                                    )
                                                                                }
                                                                                disabled={false}
                                                                                className="deleteIcon"
                                                                                style={{
                                                                                    fontSize: "20px",
                                                                                }}
                                                                            />
                                                                        )}
                                                                    </Col>
                                                                </FormGroup>
                                                            </div>
                                                        </div>
                                                        {item.timeLine.length - 1 == unique && (
                                                            <div className="row site-tab-holder mt-2" style={{ margin: "0px -10px" }}>
                                                                <div className="col-lg-4 ">

                                                                    <AntSelect
                                                                        mode="tags"
                                                                        placeholder="Select..."
                                                                        name="colors"
                                                                        className="basic-multi-select"
                                                                        classNamePrefix="select"
                                                                        onChange={(values) => this.copyWeekDays(values, item.day)}
                                                                        style={{ width: '100%', backgroundColor: "white" }}
                                                                    >
                                                                        {item.weekDaysOptions.map(option => (
                                                                            <Option key={option.value}>{option.label}</Option>
                                                                        ))}


                                                                    </AntSelect>
                                                                    <label class="fixed-label" style={{ margin: "-4px 10px" }}>Copy the above schedule to other days</label>
                                                                </div>
                                                                <div className="col-lg-3" />
                                                                <div className="col-lg-2 ">
                                                                    <button
                                                                        className="floatRight btn formButton"
                                                                        onClick={(e) =>
                                                                            this.saveTimeSlots(e,
                                                                                item.day,
                                                                                unique
                                                                            )
                                                                        }
                                                                    >Save</button>
                                                                </div>
                                                            </div>
                                                        )}
                                                    </div>
                                                );
                                            })}
                                        </CardBody>
                                    </Collapse>
                                </Card>
                            )}
                        </div>
                    );
                })
                }
            </>
        )
    }
}
export default NotificationField;