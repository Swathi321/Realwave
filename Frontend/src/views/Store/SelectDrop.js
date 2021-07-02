import React, { Component } from 'react';
import { Select } from 'antd';
import regex from '../../Util/regex';

const { Option } = Select;

// const customStyles = {
//   clearIndicator: (styles) => ({ ...styles, width: "16", padding: "0px" }),
//   control: (styles) => ({ ...styles, backgroundColor: "white" }),
// };
// var children1 = [];
// var children2 = [];
// for (let i = 10; i < 36; i++) {
//   children.push(<Option key={i.toString(36) + i}>{i.toString(36) + i}</Option>);
// }



export class SelectDrop extends Component {
  constructor(props) {
    super(props)
    this.state = {
      status: true,
      clientId: "",
      // children1: []
    }
  }

  componentDidUpdate(props) {
    // let { children1 } = this.state

    // // console.log(this.state.clientId,this.props.clientId,this.state.clientId!=this.props.clientId,this.props);

    // if (this.state.clientId == this.props.clientId) {
    //   //console.log("xxxxxxxxxxx",children1);
    //   this.state.children1 = []
    //   this.state.children2 = []

    // }

    // if (children1.length == 0) {
    //   //console.log("222222");
    //   if (this.props && this.props.userEmailsPhones && this.props.userEmailsPhones.length > 0) {
    //     //   console.log(this.props.emailList,this.state.status);
    //     // debugger

    //     // this.props.userEmailsPhones.map(option=> (
    //     //   children1.push(<Option key={option._id}>{option.firstName}</Option>)
    //     // ))

    //     for (let i = 0; i < this.props.userEmailsPhones.length; i++) {
    //       // children1.push(<Option value={this.props.userEmailsPhones[i]._id} label={this.props.userEmailsPhones[i].firstName} ></Option>);

    //       children1.push(<Option key={this.props.userEmailsPhones[i]._id} >{this.props.userEmailsPhones[i].firstName}</Option>);
    //     }
    //   }
    // }
    // if (children1.length == 0) {
    //   //console.log("222222");
    //   if (this.props && this.props.emailList && this.props.emailList.length > 0) {
    //     //   console.log(this.props.emailList,this.state.status);
    //     debugger
    //     for (let i = 0; i < this.props.emailList.length; i++) {
    //       children1.push(<Option key={this.props.emailList[i]} >{this.props.emailList[i]}</Option>);
    //     }
    //   }


    //   if (this.props.check == "email") {
    //     if (this.props && this.props.emailList && this.props.emailList.length > 0) {
    //       //   console.log(this.props.emailList,this.state.status);
    //       debugger
    //       for (let i = 0; i < this.props.emailList.length; i++) {
    //         children1.push(<Option key={this.props.emailList[i]} >{this.props.emailList[i]}</Option>);
    //       }
    //     }
    //   }
    // }
    // if (children2.length == 0) {
    //   if (this.props.check == "phone") {
    //     if (this.props && this.props.phoneList && this.props.phoneList.length > 0) {
    //       // console.log(this.props.phoneList,this.state.status);
    //       debugger
    //       for (let i = 0; i < this.props.phoneList.length; i++) {
    //         children2.push(<Option key={this.props.phoneList[i]} >{this.props.phoneList[i]}</Option>);
    //       }
    //     }
    //   }
    // }



    if (this.state.clientId != this.props.clientId) {
      this.state.clientId = this.props.clientId
    }


  }
  handleChange = async (value, index) => {
    console.log(`selected ${value}`, index);
    const { userEmailsPhones } = this.props;

    let count = 0;
    let len = value.length;
    let error = false;

    // validationg if all the entries are valid or not
    len ? value.forEach(async element => {
      count++;
      let Valid = await this.Validate(element);

      let record = true;
      if (!Valid) record = userEmailsPhones && userEmailsPhones.find(ob => ob._id == element);

      error = error || (!record && !Valid) ? true : false;
      if (count === len) {
        this.sendValue(error, value)
      }
    }) : this.sendValue(false, value);

  }

  sendValue = (error, value) => {
    if (this.props.check == "email") {
      this.props.selectEmail(value, this.props.weekDay, this.props.index, error, this.props.stateVar)
    } if (this.props.check == "phone") {
      this.props.selectPhone(value, this.props.weekDay, this.props.index, error, this.props.stateVar)
    }
  }


  Validate = (value) => {
    let Regex = this.props.check == "email" ? regex.emailValidation : regex.tenDigitNumberValidation;
    return Regex.test(value) ? true : false;
  }

  render() {
    //console.log(children2,this.props);
    // let { children1 } = this.state
    let { userEmailsPhones } = this.props

    return (
      <div className="emailList">

        <Select
          mode="tags"
          placeholder="Select..."
          value={this.props.defaultEmail}
          defaultValue={this.props.defaultEmail}
          onChange={(value) => this.handleChange(value)}
          // onChange={(value, index) => this.handleChange(value, index)}
          style={{ width: '100%', backgroundColor: "white" }}
          tokenSeparators={[',']}>

          {userEmailsPhones && userEmailsPhones.length && userEmailsPhones.map(option => (
            <Option key={option._id}>{option.firstName}</Option>
          ))}

          {/* {this.props.check == "email" ? children1 : children2} */}
        </Select>

      </div>
    )
  }
}

export default SelectDrop;
