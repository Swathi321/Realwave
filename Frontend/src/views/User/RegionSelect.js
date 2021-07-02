import React, { Component } from 'react'
import { Select } from 'antd';
import 'antd/dist/antd.css';
const { Option } = Select;
export class RegionSelect extends Component {
  constructor(props) {
    super(props)

    this.state = {
       regionSites:[]
    }
  }
  componentDidUpdate(){
    console.log(this.props);
    let {region,selectReg} =this.props

    let data=[]
    if(region.length>0){
    for (let i = 0; i < region.length; i++) {
      data.push(<Option key={i.toString(36) + i}>{region[i].key}</Option>);
    }
      this.state.regionSites=data

  }
  }
  handleChange=(e)=>{
 console.log(e);
  }
  render() {
    let {region,selectReg} =this.props
    let {regionSites} =this.state
    console.log(region,regionSites);
    return (
      <div className="search_Region "   >

{/* style={{backgroundColor:"white", color:"black"}} */}
 {/* {region.length>0 &&  */}

    <Select
      mode="multiple"
      allowClear
      style={{ width: '100%' }}
      placeholder="Search"
      onChange={(e)=>this.handleChange(e)}
    >
      {regionSites}
    </Select>
  {/* } */}
      </div>
    )
  }
}

export default RegionSelect
