import React from 'react';
import { Tooltip } from 'reactstrap';
import TooltipContent from './../../component/ToolTip';

export default class UserFaceDetectionInfo extends React.Component {
    constructor(props) {
        super(props);
        this.toggle = this.toggle.bind(this);
        this.state = {
            tooltipOpen: false
        };
    }

    toggle() {
        this.setState({
            tooltipOpen: !this.state.tooltipOpen
        });
    }

    render() {
        const { data } = this.props;
        const { UserInfo } = data;
        let { tooltipOpen } = this.state;
        let Name = "", RecognizeScore = 0;
        if (UserInfo && UserInfo.length > 0) {
            let Info = UserInfo[0];
            Name = Info.Name;
            RecognizeScore = Math.trunc(Info.RecognizeScore * 100) + "%";
        }
        let toolTipKey = "Tooltip" + (data._id + 1).toString()
        return (
            <React.Fragment>
                <div id={toolTipKey}>
                    <span>{Name}</span>&emsp;
                    <span>{RecognizeScore}</span>
                </div>
                <Tooltip placement="top" isOpen={tooltipOpen} autohide={false} toggle={this.toggle} target={toolTipKey}>
                    <table>
                        {UserInfo && UserInfo.length > 0 && <TooltipContent userInfo={UserInfo} isEventFeed={false} />}
                    </table>
                </Tooltip>
            </React.Fragment>
        );
    }
}