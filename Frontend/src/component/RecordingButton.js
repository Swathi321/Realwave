import React, { PureComponent } from 'react';
import Switch from "react-switch";
import { videoRecording } from './../redux/actions/httpRequest';
import { connect } from 'react-redux';

class RecordingButton extends React.PureComponent {

    state = {};

    componentDidMount() {
        this.setState({
            isEnabled: this.props.config.isRecordingStarted || false
        })
    }

    componentWillReceiveProps(nextProps) {
        if ((nextProps.videoRecording && nextProps.videoRecording !== this.props.videoRecording)) {
            const { data, isFetching } = nextProps.videoRecording;
            if (!isFetching) {
                if (data && data.success) {
                    this.setState({ isEnabled: data.data.isRecordingStarted });
                }
            }
        }
    }

    onClickRecording = (status) => {
        const { config, dispatch } = this.props;
        const { isEnabled } = this.state;
        let options = {};
        dispatch(videoRecording.request({
            action: 'update',
            data: {
                isRecordingStarted: status,
                storeId: config.storeId._id,
                register: config.register,
                cameraRTSPUrl: config.cameraRTSPUrl,
                recordTimeLimit: config.recordTimeLimit
            }
        }, config._id));
        options.isEnabled = !isEnabled;
        this.setState(options);
    }

    render() {
        const { isEnabled } = this.state;
        return (
            <div className="video-player-recording-button">
                <div className="video-player-recording-button-text">
                    Recording
				</div>
                <div>
                    <Switch
                        onChange={this.onClickRecording}
                        checked={isEnabled}
                        onColor="#86d3ff"
                        onHandleColor="#2693e6"
                        handleDiameter={20}
                        uncheckedIcon={false}
                        checkedIcon={false}
                        height={13}
                        width={35}
                    />
                </div>
            </div>
        )
    }
}

function mapStateToProps(state, ownProps) {
    return {
        videoRecording: state.videoRecording
    };
}

RecordingButton = connect(mapStateToProps)(RecordingButton);
export default RecordingButton;
