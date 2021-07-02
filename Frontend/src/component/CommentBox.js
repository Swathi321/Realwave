import React, { Component } from 'react';
import { Card, CardBody, Col, Input, FormGroup, Label, Button, Row } from 'reactstrap';
import { connect } from 'react-redux';
import { getCommentList, addComment, getAlertCommentList } from './../redux/actions/httpRequest';
import utils from './../Util/Util';
import Rating from 'react-rating';
import swal from 'sweetalert';
import ReactLoading from 'react-loading';
import moment from 'moment';
import consts from './../Util/consts';

class CommentBox extends Component {
  constructor(props) {
    super(props);
    this.state = {
      data: {
        comment: '',
        rating: 0,
        invoiceId: 0,
        userId: ''
      },
      value: '',
      commentData: [],
      error: {}
    }
  }

  componentWillReceiveProps(nextProps) {
    let { onActionComplete, commentRequest, addCommentProps, componentId, mappingId } = this.props;
    if (nextProps[commentRequest] !== this.props[commentRequest]) {
      let { data, isFetching } = nextProps[commentRequest];
      if (!isFetching) {
        if (data.success) {
          this.setState({ commentData: data.data });
        }
      }
    }
    if (nextProps[addCommentProps] !== this.props[addCommentProps]) {
      let { data, isFetching } = nextProps[addCommentProps];
      if (!isFetching) {
        if (data && data.success) {
          let data = { comment: '', rating: 0, userId: '' }
          data[mappingId] = 0;
          this.setState({ data });
          let requestData = { [componentId]: mappingId == "InvoiceId" ? Number(this.props.data[mappingId]) : this.props[mappingId] }
          this.props.dispatch(this.props.commentRequestType.request(requestData));
          if (onActionComplete) {
            onActionComplete();
          }
        }
      }
    }
  }

  componentWillMount() {
    let { componentId, mappingId } = this.props;
    let invoiceId = mappingId == "InvoiceId" ? Number(this.props.data[mappingId]) : this.props[mappingId];
    let requestData = { [componentId]: invoiceId }
    if (invoiceId) {
      this.props.dispatch(this.props.commentRequestType.request(requestData));
    }
  }

  onComment() {
    const { data } = this.state;
    let { mappingId } = this.props;
    let user = utils.getLoggedUser();
    let { EnterComment, RateComment } = consts.Comment;
    let params = {
      comment: data.comment,
      rating: data.rating,
      userId: user._id
    };

    params[mappingId] = mappingId == "InvoiceId" ? this.props.data[mappingId] : this.props[mappingId];
    if (data.comment.trim() === '' && data.rating === 0) {
      swal(utils.swalErrorTitle, EnterComment);
      return;
    } else if (data.rating === 0) {
      swal(utils.swalErrorTitle, RateComment);
      return;
    } else if (data.comment.trim() === '') {
      swal(utils.swalErrorTitle, EnterComment);
      return;
    }

    this.props.dispatch(this.props.addComponentType.request(params));
  }

  renderComment(item, index) {
    let commentDate = moment(item.createdAt).format(utils.dateTimeFormatAmPm);
    let userId = item.userId;
    let firstName = userId && userId.firstName ? userId.firstName : '';
    let lastName = userId && userId.lastName ? userId.lastName : '';
    return (
      <Row key={index}>
        <Col lg={2} md={3} sm={4} xs={3}>
          <i className="fa fa-user fa-5x"></i>
        </Col>
        <Col lg={10} md={9} sm={8} xs={9}>
          <Row>
            <Label className={"loadingText"}><b>{firstName + ' ' + lastName}</b></Label>
          </Row>
          <Row>
            <Col className="commentbox-col loadingText">
              <Rating
                initialRating={item.rating}
                readonly
                emptySymbol="fa fa-star-o fa-1x"
                fullSymbol="fa fa-star fa-1x"
              /> &nbsp;<span>{commentDate}</span>
            </Col>
          </Row>
          <Row>
            <Label className="comment-list loadingText">{item.comment}</Label>
          </Row>
        </Col>
      </Row>
    )
  }
  render() {
    const { xs, sm, lg, className, getCommentList, addComment } = this.props;
    let isFetching = addComment.isFetching || getCommentList.isFetching;
    const { commentData, data } = this.state;
    console.log("comment load = " + isFetching);
    return (
      <div className="commentbox-container" >
        <Col xs={xs} sm={sm} lg={lg} className="commentbox-container">
          <Card className={className}>
            <CardBody className={"reorderBody"} >
              {isFetching ? <center><ReactLoading type="bars" color="#000000" height={'10%'} width={'10%'} /> </center> :
                <div>
                  <FormGroup>
                    <Label className="loadingText">Comments<span className="comment-box">*</span></Label>
                    <Input type="textarea" onChange={(e) => { data["comment"] = e.target.value }} />
                  </FormGroup>
                  <Row>
                    <Col className={"loadingText"} md={6}>
                      <Rating emptySymbol="fa fa-star-o fa-2x"
                        fullSymbol="fa fa-star fa-2x"
                        onChange={(val) => { data["rating"] = val }} />
                    </Col>
                    <Col md={6} className="text-right">
                      <Button onClick={(e) => this.onComment()} data={data}>Submit </Button>
                    </Col>
                  </Row>
                  <Row>
                    <Col>
                      <span className={"loadingText"}>Tap a star to rate</span>
                    </Col>
                  </Row>
                </div>
              }
              <br />
              {commentData.length > 0 && commentData.map(this.renderComment, this)}
            </CardBody>
          </Card>
        </Col>
      </div>
    );
  }
}

CommentBox.defaultProps = {
  title: null,
  subTitle: null
}

function mapStateToProps(state, ownProps) {
  return {
    getCommentList: state.getCommentList,
    addComment: state.addComment,
    getAlertCommentList: state.getAlertCommentList,
    addAlertComment: state.addAlertComment,
    getAlarmCommentList: state.getAlarmCommentList,
    addAlarmComment: state.addAlarmComment
  };
}

var CommentBoxModule = connect(mapStateToProps)(CommentBox);
export default CommentBoxModule;