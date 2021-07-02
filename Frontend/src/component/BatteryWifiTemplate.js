
import React, { Component } from 'react';
import wifi_full from '../assets/img/wifi_full.png';
import wifi_half from '../assets/img/wifi_half.png';
import wifi_quarter from '../assets/img/wifi_quarter.png';
import wifi_third_quarter from '../assets/img/wifi_third_quarter.png';

class BatteryWifiTemplate extends Component {
    constructor(props) {
        super(props)
    }

    render() {
        const { wifi, power } = this.props;
        return <>
            {wifi > 75 ? <span style={{ color: "green" }}><i class="fa fa-battery-full"></i></span> :
                wifi > 50 ? <span style={{ color: "green" }}><i class="fa fa-battery-three-quarters"></i></span> : wifi > 25 ? <span style={{ color: "yellow" }}><i class="fa fa-battery-half"></i></span> : <span style={{ color: "red" }}><i class="fa fa-battery-quarter"></i></span>}

            <span><img style={{ width: "20px" }} class="floatRight" src={power > 75 ? wifi_full : power <= 75 && power > 50 ? wifi_third_quarter : power <= 50 && power > 25 ? wifi_half : wifi_quarter} /></span>
        </>
    }
}

export default BatteryWifiTemplate;