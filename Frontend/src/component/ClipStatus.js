import React from 'react';

const ClipStatus = (props) => {
    let { flag } = props || {};
    let icon;
    flag = flag || '';
    switch (flag.toLocaleUpperCase()) {
        case "REVIEWED":
            icon = <center><i className="fa fa-check-square text-green"></i></center>
            break;

        case "NOT REVIEWED":
            icon = <center><i className="fa fa-times-circle"></i></center>
            break;

        case "ISSUE":
            icon = <center><i className="fa fa-exclamation-triangle text-red"></i></center>
            break;

        case "PENDING":
            icon = <center><i className="fa fa-clock-o text-red"></i></center>
            break;

        default:
            icon = <center><i className="fa fa-times-circle"></i></center>
            break;
    }
    return icon;
};


export default ClipStatus;