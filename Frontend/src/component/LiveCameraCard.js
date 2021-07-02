import React, { Component } from 'react';
import { Card, CardBody, Col, Modal, ModalBody, FormGroup, Label, Input, Button, ModalHeader } from 'reactstrap';
import 'video-react/dist/video-react.css';
import Receipt from '../component/Receipt'
import VideoPlayerRreact from '../component/VideoPlayerRreact';
import { videoShare } from '../redux/actions/httpRequest';
import Util from '../Util/Util';
import { connect } from 'react-redux';
import swal from 'sweetalert';
import common from '../common';
import moment from 'moment';

class LiveCameraCard extends Component {
  constructor(props) {
    super(props);
    this.state = {
      modal: false,
      path: null,
      errorEmail: null
    }
    this.videoShare = this.videoShare.bind(this);
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.videoShare !== this.props.videoShare) {
      let { data, error, isFetching } = nextProps.videoShare;
      let valid = common.responseHandler(data, error, isFetching);
      if (valid) {
        swal({
          title: "Success",
          text: "Video shared on email successfully",
          icon: "success"
        });
      }
    }
  }

  videoShare = () => {
    const { data } = this.props;
    const selectedReceipt = Object.keys(data.event).length > 0 ? data.event : null;
    let { path, email } = this.state;
    if (path && email && !Util.email(email) && selectedReceipt) {
      this.props.dispatch(videoShare.request({ path, email, selectedReceipt, eventDate: moment(selectedReceipt.EventTime).format(Util.dateTimeFormatAmPm) }));
      this.setState({ modal: false, path: null, email: null });
    }
    else {
      this.setState({ errorEmail: true });
    }
  }

  showHideModal = (path) => {
    this.setState({ modal: !this.state.modal, path, errorEmail: null })
  }

  handleChange = (event) => {
    let { value, name } = event.target;
    this.setState({ [name]: value, errorEmail: false });
  }

  render() {
    const { state, videoShare, showHideModal, handleChange } = this;
    const { modal, errorEmail } = state;
    const { xs, sm, lg, className, data, hideReceipt, modelName, fromVideoClip } = this.props;
    return (
      <div>
        <Col xs={xs} sm={sm} lg={lg}>
          <VideoPlayerRreact
            key={data && data.event && data.event._id}
            fromVideoClip={fromVideoClip}
            videoShare={videoShare}
            IsVideoAvailable={data.IsVideoAvailable || (data.event && data.event.IsVideoAvailable)}
            data={data}
            height={100}
            overVideoReceipt={true}
            downloadVideo={true}
            modelName={modelName}
            showHideModal={showHideModal}
          />
          <br />

          {hideReceipt ? null :
            <Card className={className}>
              <CardBody className={"reorderBody"}>
                <Receipt data={data} />
              </CardBody>
            </Card>}
        </Col>
        <Modal isOpen={modal} className={'this.props.className video-modal'}>
          <ModalHeader className={"widgetHeaderColor"}>User Email</ModalHeader>
          <ModalBody className={"reorderBody"}>
            <FormGroup>
              <Input type="email" name="email" id="Email" onChange={(e) => handleChange(e)} placeholder="Enter User Email" />
              {errorEmail && <span className="text-red"> Please enter the valid email id </span>}
            </FormGroup>
            <FormGroup>
              <Button onClick={() => videoShare()} >Send</Button>{' '}
              <Button onClick={() => showHideModal(null)} >Cancel</Button>
            </FormGroup>
          </ModalBody>
        </Modal>
      </div>
    );
  }
}

LiveCameraCard.defaultProps = {
  title: null,
  subTitle: null
}

function mapStateToProps(state, ownProps) {
  return {
    videoShare: state.videoShare
  };
}
var LiveCameraCardModule = connect(mapStateToProps)(LiveCameraCard);
export default LiveCameraCardModule;
