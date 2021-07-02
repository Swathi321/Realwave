import React, { PureComponent } from 'react';
import {
  Col,
  FormGroup,
  Input,
  Collapse,
  CardBody,
	Card,
	CardHeader
} from "reactstrap";
import { TimePicker } from "antd";
import utils from "./../../Util/Util";
import { Radio } from "antd";
import moment from "moment";
import SelectDrop from "./SelectDrop";
import { cloneDeep, clone } from 'lodash';
import { Button as AntButton } from 'antd';
import { Select as AntSelect } from 'antd';
import swal from "sweetalert";
import { DeleteOutlined } from "@ant-design/icons";
import "react-tagsinput/react-tagsinput.css";
import "../User/styles.scss";
import "./store.scss";

const format = "HH:mm a";
const { Option } = AntSelect;

export class BasicInfoCollapse extends PureComponent {
  constructor(props) {
		super(props);
		this.state = {
			collapseOpen: props.item && clone(props.item.status),
			copyWeekDays: [],
			entireDayStatus: clone(props.entireDayStatus),
			notificationFrequency: clone(props.notificationFrequency),
			notificationFrequencyErr: clone(props.notificationFrequencyErr),
			notifyStatus: clone(props.notifyStatus),
      selectedEmailNotify: clone(props.selectedEmailNotify),
      selectedPhoneNotify: clone(props.selectedPhoneNotify),
      timeStart: clone(props.timeStart),
      timeEnd: clone(props.timeEnd),
			weekDays: [
				{ value: "Monday", label: "Monday" },
				{ value: "Tuesday", label: "Tuesday" },
				{ value: "Wednesday", label: "Wednesday" },
				{ value: "Thursday", label: "Thursday" },
				{ value: "Friday", label: "Friday" },
				{ value: "Saturday", label: "Saturday" },
				{ value: "Sunday", label: "Sunday" },
			],
			weekDaysAccordian: cloneDeep(props.weekDaysAccordian)
			// weekDaysAccordian: [
      //   {
      //     id: 0,
      //     day: "Monday",
      //     weekDay: "Mon",
      //     checked: false,
      //     status: false,
      //     entireDay: false,
      //     copiedWeekDays: [],
      //     weekDaysOptions: [],
      //     timeLine: [
      //       { start: "12:00 am", end: "11:59 pm", emails: [], phone: [], delStatus: false },
      //     ],
      //   },
      //   {
      //     id: 1,
      //     day: "Tuesday",
      //     weekDay: "Tue",
      //     checked: false,
      //     status: false,
      //     entireDay: false,
      //     copiedWeekDays: [],
      //     weekDaysOptions: [],
      //     timeLine: [
      //       { start: "12:00 am", end: "11:59 pm", emails: [], phone: [], delStatus: false },
      //     ],
      //   },
      //   {
      //     id: 2,
      //     day: "Wednesday",
      //     weekDay: "Wed",
      //     checked: false,
      //     status: false,
      //     copiedWeekDays: [],
      //     entireDay: false,
      //     weekDaysOptions: [],
      //     timeLine: [
      //       { start: "12:00 am", end: "11:59 pm", emails: [], phone: [], delStatus: false },
      //     ],
      //   },
      //   {
      //     id: 3,
      //     day: "Thursday",
      //     weekDay: "Thu",
      //     checked: false,
      //     status: false,
      //     copiedWeekDays: [],
      //     entireDay: false,
      //     weekDaysOptions: [],
      //     timeLine: [
      //       { start: "12:00 am", end: "11:59 pm", emails: [], phone: [], delStatus: false },
      //     ],
      //   },
      //   {
      //     id: 4,
      //     day: "Friday",
      //     weekDay: "Fri",
      //     checked: false,
      //     status: false,
      //     copiedWeekDays: [],
      //     entireDay: false,
      //     weekDaysOptions: [],
      //     timeLine: [
      //       { start: "12:00 am", end: "11:59 pm", emails: [], phone: [], delStatus: false },
      //     ],
      //   },
      //   {
      //     id: 5,
      //     day: "Saturday",
      //     weekDay: "Sat",
      //     checked: false,
      //     status: false,
      //     copiedWeekDays: [],
      //     entireDay: false,
      //     weekDaysOptions: [],
      //     timeLine: [
      //       { start: "12:00 am", end: "11:59 pm", emails: [], phone: [], delStatus: false },
      //     ],
      //   },
      //   {
      //     id: 6,
      //     day: "Sunday",
      //     weekDay: "Sun",
      //     checked: false,
      //     status: false,
      //     copiedWeekDays: [],
      //     entireDay: false,
      //     weekDaysOptions: [],
      //     timeLine: [
      //       { start: "12:00 am", end: "11:59 pm", emails: [], phone: [], delStatus: false },
      //     ],
      //   },
      // ],
		}
	}

	componentDidUpdate(prevProps, prevState) {
		const {
			entireDayStatus,
			item,
			notificationFrequency,
			notificationFrequencyErr,
			notifyStatus,
			selectedEmailNotify,
			selectedPhoneNotify,
      timeStart,
      timeEnd,
			weekDaysAccordian,
		} = this.props;
		if (entireDayStatus && entireDayStatus !== prevProps.entireDayStatus) {
			this.setState({
				entireDayStatus: entireDayStatus
			})
		}
		if (item && item.status && item.status !== prevProps.item.status) {
			this.setState({
				collapseOpen: item.status
			})
		}
		if (notificationFrequency && notificationFrequency !== prevProps.notificationFrequency) {
			this.setState({
				notificationFrequency: notificationFrequency
			})
		}
		if (notificationFrequencyErr && notificationFrequencyErr !== prevProps.notificationFrequencyErr) {
			this.setState({
				notificationFrequencyErr: notificationFrequencyErr
			})
		}
		if (notifyStatus && notifyStatus !== prevProps.notifyStatus) {
			this.setState({
				notifyStatus: notifyStatus
			})
		}
		if (selectedEmailNotify && selectedEmailNotify !== prevProps.selectedEmailNotify) {
			this.setState({
				selectedEmailNotify: selectedEmailNotify
			})
		}
		if (selectedPhoneNotify && selectedPhoneNotify !== prevProps.selectedPhoneNotify) {
			this.setState({
				selectedPhoneNotify: selectedPhoneNotify
			})
		}
		if (timeStart && timeStart !== prevProps.timeStart) {
			this.setState({
				timeStart: timeStart
			})
		}
		if (timeStart && timeStart !== prevProps.timeStart) {
			this.setState({
				timeStart: timeStart
			})
		}
		if (timeEnd && timeEnd !== prevProps.timeEnd) {
			this.setState({
				timeEnd: timeEnd
			})
		}
		if (
			weekDaysAccordian && 
			weekDaysAccordian.length > 0 && 
			JSON.stringify(weekDaysAccordian) !== JSON.stringify(prevProps.weekDaysAccordian)
			) {
			this.setState({
				weekDaysAccordian: weekDaysAccordian,
			})
		}
	}

	componentWillReceiveProps(nextProps) {
		const {
			entireDayStatus,
			item,
			notificationFrequency,
			notificationFrequencyErr,
			notifyStatus,
			selectedEmailNotify,
			selectedPhoneNotify,
      timeStart,
      timeEnd,
			weekDaysAccordian,
		} = nextProps;
		if (entireDayStatus && entireDayStatus !== this.state.entireDayStatus) {
			this.setState({
				entireDayStatus: entireDayStatus
			})
		}
		if (item && item.status && item.status !== this.state.collapseOpen) {
			this.setState({
				collapseOpen: item.status
			})
		}
		if (notificationFrequency && notificationFrequency !== this.state.notificationFrequency) {
			this.setState({
				notificationFrequency: notificationFrequency
			})
		}
		if (notificationFrequencyErr && notificationFrequencyErr !== this.state.notificationFrequencyErr) {
			this.setState({
				notificationFrequencyErr: notificationFrequencyErr
			})
		}
		if (notifyStatus && notifyStatus !== this.state.notifyStatus) {
			this.setState({
				notifyStatus: notifyStatus
			})
		}
		if (selectedEmailNotify && selectedEmailNotify !== this.state.selectedEmailNotify) {
			this.setState({
				selectedEmailNotify: selectedEmailNotify
			})
		}
		if (selectedPhoneNotify && selectedPhoneNotify !== this.state.selectedPhoneNotify) {
			this.setState({
				selectedPhoneNotify: selectedPhoneNotify
			})
		}
		if (timeStart && timeStart !== this.state.timeStart) {
			this.setState({
				timeStart: timeStart
			})
		}
		if (timeStart && timeStart !== this.state.timeStart) {
			this.setState({
				timeStart: timeStart
			})
		}
		if (timeEnd && timeEnd !== this.state.timeEnd) {
			this.setState({
				timeEnd: timeEnd
			})
		}
		if (
			weekDaysAccordian && 
			weekDaysAccordian.length > 0 && 
			JSON.stringify(weekDaysAccordian) !== JSON.stringify(this.state.weekDaysAccordian)
			) {
			this.setState({
				weekDaysAccordian: weekDaysAccordian,
			})
		}
	}

	addTimeSlot = (day) => {
    // let data = [...this.state.weekDaysAccordian];
    let data = cloneDeep(this.state.weekDaysAccordian);
    let selectedWeekday = data.find(option => option.day === day);
    // if (this.addTimeSlot) {
    let NewTimeLine = { start: "", end: "", emails: [], phone: [], delStatus: false };
    selectedWeekday.timeLine.push(NewTimeLine);
    this.setState({ weekDaysAccordian: data }, () => this.props.addTimeSlot(day));
    // }
  }

	handleChange = (e, ErrorStateVar) => { 
		let name = e.target.name
		const eventCopy = {...e};
		this.setState({ [name]: e.target.value }, () => this.props.handleChange(eventCopy, ErrorStateVar));
		if (
			name === "notificationFrequency"
		) {
				if (e.target.value.length == 0) {
					this.setState({ [ErrorStateVar]: "Required" });
				} else {
					this.setState({ [ErrorStateVar]: "" });
				}
			}
	}

	copyWeekDays = (val, day) => {
    // let data = [...this.state.weekDaysAccordian];
    let data = cloneDeep(this.state.weekDaysAccordian);

		for (let i=0; i < data.length; i++) {
			const x = data[i]
			if (x.day == day) {
				x.copiedWeekDays = [...val]
			}
			data[i] = x;
		}
    // let weekDaysAccordian = weekDaysAccordianCopy.map(x => {
    //   if (x.day == day) {
    //     x.copiedWeekDays = [...val]
    //     return x
    //   } else {
    //     return x
    //   }
    // })
    this.setState({
      weekDaysAccordian: data,
      copyWeekDays: [...val]
    }, () => this.props.copyWeekDays(val, day));
  };

	selectDays = (id) => {
    let data = cloneDeep(this.state.weekDaysAccordian);
    let selectedData = data.find(item => item.id === id);
    let add = selectedData.checked ? false : true;
    let dayName = selectedData.day;
    let weekDays = cloneDeep(this.state.weekDays);

    for (let i=0; i < data.length; i++) {
			const x = data[i];
      let options = cloneDeep(x.weekDaysOptions);
      if (add) {
        if (id != x.id) options.push({ value: dayName, label: dayName });

        let filtterDays = weekDays.filter(ob => options.find(ob2 => ob.label === ob2.label));
        options = cloneDeep(filtterDays);
      }
      else {
        let DayIndex = options.findIndex(dayy => dayy.value.toLowerCase() === dayName.toLowerCase());
        if (DayIndex !== -1) options.splice(DayIndex, 1);
      }

      x.weekDaysOptions = options;

      if (id == x.id) {
        x.checked = !x.checked;
			}
			data[i] = cloneDeep(x);
    }
    this.setState({ weekDaysAccordian: data}, () => this.props.selectDays(id)); 
  };

	// selectDays = async (id) => {
  //   let data = [...this.state.weekDaysAccordian];
  //   let selectedData = data.find(item => item.id === id);
  //   let add = selectedData.checked ? false : true;
  //   let dayName = selectedData.day;
  //   let weekDays = [...this.state.weekDays]

  //   data = await data.map((x) => {
  //     let options = [...x.weekDaysOptions];
  //     if (add) {
  //       if (id != x.id) options.push({ value: dayName, label: dayName });

  //       let filtterDays = weekDays.filter(ob => options.find(ob2 => ob.label === ob2.label));
  //       options = [...filtterDays];
  //     }
  //     else {
  //       let DayIndex = options.findIndex(dayy => dayy.value.toLowerCase() === dayName.toLowerCase());
  //       if (DayIndex !== -1) options.splice(DayIndex, 1);
  //     }

  //     x.weekDaysOptions = options;

  //     if (id == x.id) {
  //       x.checked = !x.checked;
  //       return x;
  //     } else {
  //       return x;
  //     }
  //   });
  //   this.setState({ weekDaysAccordian: data}, () => this.props.selectDays(id)); 
  // };

	selectEmail = (value, day, index, error) => {
    // let data = JSON.parse(JSON.stringify(this.state.weekDaysAccordian));
		let data = cloneDeep(this.state.weekDaysAccordian)
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
        return x;
      }
    });
    
    this.setState({
      weekDaysAccordian: [...data],
      selectedEmailNotify: { email: value, day: day },
    }, () => this.props.selectEmail(value, day, index, error));
  };

  selectPhone = (value, day, index, error) => {
    // let data = JSON.parse(JSON.stringify(this.state.weekDaysAccordian));
    let data = cloneDeep(this.state.weekDaysAccordian)
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
    
    this.setState({
      weekDaysAccordian: [...data],
      selectedPhoneNotify: { phone: value, day: day },
    }, () => this.props.selectPhone(value, day, index, error));
  };

	toggleAccWeek = (id) => {
    // var data = [...this.state.weekDaysAccordian];
    let data = cloneDeep(this.state.weekDaysAccordian);
		const idCopy = id;
		for (let i=0 ; i < data.length; i++){
			const x = data[i];
			if (id === x.id) {
        x.status = !x.status;
      } 
			data[i]=x;
		}
    this.setState({ weekDaysAccordian: data }, () => this.props.toggleAccWeek(idCopy));
  };

	// toggleAccWeek = async (e) => {
  //   // var data = this.state.weekDaysAccordian;
  //   let data = cloneDeep(this.state.weekDaysAccordian);
	// 	const eventCopy = {...e};
  //   data = await data.map((x) => {
  //     if (e == x.id) {
  //       x.status = !x.status;
  //       return x;
  //     } else {
  //       return x;
  //     }
  //   })
  //   this.setState({ weekDaysAccordian: data }, () => this.props.toggleAccWeek(eventCopy));
  // };

	enableNotification = (status) => {
    let option = { notifyStatus: !status, };
    if (status) {
      option.notificationFrequencyErr = "";
    } else {
      if (this.state.notificationFrequency.length == 0) {
        option.notificationFrequencyErr = "Required";
      }
    }
    this.setState(option, () => this.props.enableNotification(status));
  };

	saveTimeSlots = async (e, day, id) => {
    e.preventDefault()
		// const eventCopy = cloneDeep(e);

    let {
      weekDaysAccordian,
      entireDayStatus,
      timeEnd,
      timeStart,
      selectedPhoneNotify,
      weekDays,
      selectedEmailNotify,
      copyWeekDays,
    } = this.state;

    let data = [];
    // let weekDaysAccordianCopy = [...weekDaysAccordian];
		let weekDaysAccordianCopy = cloneDeep(weekDaysAccordian);
    
    // if ( weekDaysAccordian.day == day ) {
    let sendStartTime = "";
    if (
      timeEnd.length > 0 &&
      timeStart.length > 0 && selectedPhoneNotify &&
      selectedEmailNotify
    ) {
      data = await weekDaysAccordianCopy.map((x) => {
        if (x.day == day) {
          // 
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
          // if(x.timeLine.length>0){
          //   
          sendStartTime = x.timeLine[x.timeLine.length - 1].end;
          // }
          return x;
        } else {
          return x;
        }
        // x.timeLine.push(emptyData)
      });
      

      // data = await weekDaysAccordianCopy.map((x) => {
      //   if (x.day == day) {
      //     let emptyData = {
      //       start: sendStartTime,
      //       end: "",
      //       emails: [],
      //       phone: [],
      //       delStatus: false,
      //     };
      //     if (x.timeLine.length < 3) {
      //       x.timeLine.push(emptyData);
      //     }
      //     return x;
      //   } else {
      //     return x;
      //   }
      // });
      

      // let data1 = [...data];
			let data1 = cloneDeep(data);
      this.setState({
        weekDaysAccordian: data1,
        selectedEmailNotify: [],
        selectedPhoneNotify: [],
        timeEnd: "12:00 am",
        timeStart: sendStartTime,
      });
      // }

    }

    if (copyWeekDays.length > 0) {
      let data = {};
      
      swal({
        title: "Status",
        text: "It will Override the timeslots",
        icon: "warning",
        showCancelButton: true,
        showConfirmButton: true,
      }).then(
        async function () {
          

          // weekDaysAccordianCopy.some((x) => {
          //   if (x.day == day) data = {...x};
          //   return x.day == day;
          // });

          // if( copyWeekDays.value == weekDaysAccordianCopy.day ) {
          let data = weekDaysAccordianCopy.find(x => x.day == day);
          copyWeekDays = await copyWeekDays.map(async (y) => {
            weekDaysAccordianCopy.map((x) => {
              if (x.day == y) {
                // if (x.day == y.value) {
                
                x.entireDay = data.entireDay;
                x.timeLine = [...data.timeLine];
                return x;
              } else {
                return x;
              }
            });
          });
          
          this.setState({
            weekDaysAccordian: cloneDeep(weekDaysAccordianCopy)
          },  () => this.props.saveTimeSlots(day, id, { copyWeekDays : true }));
          // }
        }.bind(this)
      );
    } else {
			this.props.saveTimeSlots(day, id, { copyWeekDays : false })
		}
  };

	setDayStatus = async (e, day) => {
    //  this.setState({
    //    entireDayStatus:e.target.value
    //  })
    let value = e.target.value;
		const eventCopy = {...e};
    let { weekDaysAccordian, entireDayStatus } = this.state;
    
    let data = [];
    
    data = await weekDaysAccordian.map((x) => {
      
      if (x.weekDay == day) {
        x.entireDay = value;
        

        if (value)
          x.timeLine = [
            { start: "12:00 am", end: "11:59 pm", emails: [], phone: [], delStatus: false },
          ];

        return x;
      } else {
        return x;
      }
    });
    this.setState({
      weekDaysAccordian: data,
      entireDayStatus: value,
    }, () => this.props.setDayStatus(eventCopy, day));
  };

	timePick1 = (ts, t, day, index) => {
    
    // let data = this.state.weekDaysAccordian;
    // let data = JSON.parse(JSON.stringify(this.state.weekDaysAccordian));
		let data = cloneDeep(this.state.weekDaysAccordian)
    data.map(async (x) => {
      if (x.day == day) {
        await x.timeLine.map((y, uni) => {
          if (uni == index) {
            y.start = t;
            
          }
          return y;
        });
        return x;
      } else {
        return x;
      }
    });
    
    this.setState({
      weekDaysAccordian: data,
      timeStart: t,
    }, () => this.props.timePick1(ts, t, day, index));
  };
	
  timePick2 = async (ts, t, day, index) => {
    // let data = JSON.parse(JSON.stringify(this.state.weekDaysAccordian));
		let data = cloneDeep(this.state.weekDaysAccordian);
    // data = await 
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

        // return x;
      }
      // else {
      //   return x;
      // }
    });
    
    this.setState({
      weekDaysAccordian: data,
      timeEnd: t,
    }, () => this.props.timePick2(ts, t, day, index));
  };

	handleCollapse = (id) => {
		const {collapseOpen} = this.state;
		const e = cloneDeep(id)
		this.setState({collapseOpen: !collapseOpen}, () => this.props.toggleAcc(e))
	}

	deleteTimeSlot = async (unique, day) => {
    // let data = this.state.weekDaysAccordian;
    let data = cloneDeep(this.state.weekDaysAccordian)
    let sendStartTime = "";
    data = await data.map((x) => {
      if (x.day == day) {
        let store = [];
        x.timeLine.forEach((y, index) => {
          if (index != unique) store.push(y);
        });

        x.timeLine = store;
        return x;
      } else {
        return x;
      }
    });
    
    this.setState(
      {
        weekDaysAccordian: data,
      },
      () => {
        this.props.deleteTimeSlot(unique, day);
      }
    );
  };

	render() {
		const {
			clientId,
			isClicked,
			item,
			userEmailsPhones,
		} = this.props;
		const {
			collapseOpen,
			notificationFrequency,
			notificationFrequencyErr,
			notifyStatus,
			weekDaysAccordian,
		} = this.state;
		
		return (
			<Card style={{ marginBottom: "1rem", width: "", cursor: 'pointer' }} key={item.id} className="ml-auto mr-auto" >
				<CardHeader onClick={() => this.handleCollapse(item.id)} className="p-2"> {}
					{item.siteName}
					{collapseOpen ? (
						<i className="fa fa-angle-up floatRight" />
					) : (
						<i className="fa fa-angle-down floatRight" />
					)}
				</CardHeader>
				<Collapse isOpen={collapseOpen} ref={this.notifications_list} className="pl-2 pr-2 notifications_list">
					<br />
					<div className="row site-tab-holder pl-2">
						<div className="col-lg-6">
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

						<div className="col-lg-1">
							Frequency (Mins) {notifyStatus && <span className={'text-danger'}>*</span>}
						</div>

						<div className="col-lg-1">
							<Input
								disabled={!notifyStatus}
								id="notificationFrequency"
								name="notificationFrequency"
								placeholder="Notification Frequency"
								type="number"
								value={notificationFrequency}
								onChange={e => this.handleChange(e, 'notificationFrequencyErr')}
								required
							/>
							{notificationFrequencyErr !== "" ? <div className="input-feedback">Required</div> : null}
						</div>

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
					</div>
					<br />

					{weekDaysAccordian.map((item, index) => {
						return (
							<div style={{ padding: "0px 10px" }}>
								{item.checked && (
									<Card
										style={{ marginBottom: "1rem" }}
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
															<div className="row site-tab-holder NotificationTime " style={{ margin: "1px 0px -14px" }}>
																<div className="col-lg-2 ">
																	<FormGroup className="time-sty" row>
																		<Col sm={12} className="text-field" >
																			{/*   {x.start &&
																				((x.start != "12.00 AM" || x.start == "") && (x.end != "11.59 PM" || x.end == "")) ? ( */}
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
																			{/* ) : (
																				<div>
																					<TimePicker
																						use12Hours
																						value={moment(
																							"00:00 am",
																							format
																						)}
																						format="h:mm a"
																						disabled={item.entireDay}
																						onChange={(ts, t) =>
																							this.timePick1(
																								ts,
																								t,
																								item.day,
																								unique
																							)
																						}
																					/>
																					<label className="fixed-label">From2</label>
																				</div>
																					)}*/}
																		</Col>
																	</FormGroup>
																</div>
																<div className="col-lg-2 ">
																	<FormGroup row>
																		<Col
																			sm={12}
																			className="text-field"
																		>
																			{/*   {x.end &&
																				((x.start != "12.00 AM" || x.start == "") && (x.end != "11.59 PM" || x.end == "")) ? ( 
																				<>
																					<TimePicker
																						value={moment(
																							x.end.toLowerCase(),
																							format
																						)}
																						use12Hours
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
																					<label className="fixed-label">To1</label>
																				</>
																			) : (*/}
																			<>
																				<TimePicker
																					use12Hours
																					value={moment(item.entireDay ? "12:00 am" : x.end ? x.end.toLowerCase() : "11:59 pm", format)}
																					// value={moment( item.entireDay? "12:00 am" : "11:59 pm", format )}
																					disabled={item.entireDay}
																					format="h:mm a"
																					onChange={(ts, t) =>
																						this.timePick2(ts, t, item.day, unique)
																					}
																				/>
																				<label className="fixed-label">To</label>
																			</>
																			{/* )} */}
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
																				// emailList={notifyEmailList}
																				userEmailsPhones={userEmailsPhones}
																			/>
																			<label class="fixed-label">
																				Email Notifications Users
																			<span className={"text-danger"} > * </span>
																			</label>

																			{x.error && <div className="input-feedback">Required </div>}

																			{x.EmailError && <div className="input-feedback"> {utils.NotiyEmailError}  </div>}

																		</Col>
																	</FormGroup>
																</div>

																<div className="col-lg-3 customAntChanges">
																	<FormGroup row className="pl-3">
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
																			// phoneList={notifyPhoneList}
																			/>
																			<label class="fixed-label">
																				Phone SMS Notifications Users
																			<span className={"text-danger"}
																				> * </span>
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
																					icon="plus" ghost
																					disabled={isClicked ? true : false}
																					onClick={(e) => this.addTimeSlot(item.day)}
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
															{item.timeLine.length - 1 == unique &&
																// !item.entireDay && 
																(
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
																			// options={item.weekDaysOptions}
																			// styles={colourStyles2}
																			>
																				{item.weekDaysOptions.map(option => (
																					<Option key={option.value}>{option.label}</Option>
																				))}


																			</AntSelect>
																			{/* <Select
																				unique
																				menuPlacement="top"
																				isMulti
																				name="colors"
																				defaultValue={
																					item.copiedWeekDays
																				}
																				className="basic-multi-select"
																				classNamePrefix="select"
																				onChange={(values) => this.copyWeekDays(values, item.day)}
																				options={item.weekDaysOptions}
																				styles={colourStyles2}
																			/> */}
																			<label class="fixed-label" style={{ margin: "-4px 10px" }}>
																				Copy the above schedule to other days
																			</label>
																		</div>
																		<div className="col-lg-4" />
																		<div className="col-lg-2 ">
																			<button
																				className="floatRight btn formButton"
																				onClick={(e) =>
																					this.saveTimeSlots(e,
																						item.day,
																						unique
																					)}
																			>
																				Save
																			</button>
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
					})}
					<CardBody></CardBody>
				</Collapse>
			</Card>
		)
	}
}
export default BasicInfoCollapse
