import React from 'react'

const ProgressBar = (props) => {

  return (<div className="BarContainer">
    <div className='displayBarNameMnt'>
      <span className="mntText">{props.lable}</span>
      <div className="operatingDriveBar">
        <div className="progressbar-complete " style={{ width: props.totalUsage + "%" }}>
          <div className="progressbar-liquid" style={{ backgroundColor: `rgba(${props.colorCode})` }}></div>
        </div>
        <span className="CommonSpan" >{props.totalUsage}%</span>
      </div>
    </div>
  </div>
  )
}
export default ProgressBar



