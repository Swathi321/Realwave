import React, { PureComponent } from 'react';
import { ptzRequest } from './../redux/actions/httpRequest';

const PTZ = {
    UP: 'UP',
    DOWN: 'DOWN',
    LEFT: 'LEFT',
    RIGHT: 'RIGHT',
    ZOOM_IN: 'ZOOM_IN',
    ZOOM_OUT: 'ZOOM_OUT',
    HOME: 'HOME'
};

class PTZControls extends PureComponent {

    send = (action) => {
        const { config, dispatch } = this.props;
        dispatch(ptzRequest.request({ camId: config._id, storeId: config.storeId._id, action: action }));
    }

    render() {
        const { config } = this.props;
        if (!config.storeId) {
            return null;
        }

        return (<>
            <table className="ptz_box">
                <tbody>
                    <tr id="ptz_direction">
                        <td colSpan="2">
                            <table>
                                <tbody>
                                    <tr>
                                        <td className="ptz_btn_back"></td>
                                        <td className="ptz_btn_back">
                                            <button className="btn_ptz" onClick={() => this.send(PTZ.UP)} ><i className="fa fa-arrow-up" /></button>
                                        </td>
                                        <td className="ptz_btn_back"></td>
                                    </tr>
                                    <tr>
                                        <td className="ptz_btn_back">
                                            <button className="btn_ptz" onClick={() => this.send(PTZ.LEFT)} ><i className="fa fa-arrow-left" /></button>
                                        </td>
                                        <td className="ptz_btn_back">
                                            <button className="btn_ptz" onClick={() => this.send(PTZ.HOME)} ><i className="fa fa-home" /></button>
                                        </td>
                                        <td className="ptz_btn_back">
                                            <button className="btn_ptz" onClick={() => this.send(PTZ.RIGHT)} ><i className="fa fa-arrow-right" /></button>
                                        </td>
                                    </tr>
                                    <tr>
                                        <td className="ptz_btn_back"></td>
                                        <td className="ptz_btn_back">
                                            <button className="btn_ptz" onClick={() => this.send(PTZ.DOWN)} ><i className="fa fa-arrow-down" /></button>
                                        </td>
                                        <td className="ptz_btn_back"></td>
                                    </tr>
                                </tbody>
                            </table>
                        </td>
                    </tr>
                </tbody>
            </table>
            <table className="ptz_zoom_option">
                <tr>
                    <td><button className="btn_ptz" onClick={() => this.send(PTZ.ZOOM_IN)}><i className="fa fa-plus" /></button></td>
                    <td>&nbsp;</td>
                    <td><button className="btn_ptz right" onClick={() => this.send(PTZ.ZOOM_OUT)}><i className="fa fa-minus" /></button></td>
                </tr>
            </table>
        </>)
    }
}

export default PTZControls;