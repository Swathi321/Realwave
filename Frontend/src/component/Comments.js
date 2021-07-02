import React from 'react';
import Rating from 'react-rating';
import { Tooltip } from 'antd';
import util from './../Util/Util';
import { Modal, ModalHeader, ModalBody } from 'reactstrap';
import { reloadGrid } from '../redux/actions/';
import CommentBox from './../component/CommentBox';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
class Comments extends React.Component {
    constructor(props) {
        super(props);
        this.state = { isOpen: false };
        this.onCommentClick = this.onCommentClick.bind(this);
    }

    onCommentClick = () => {
        this.setState({ isOpen: !this.state.isOpen });
    }

    onActionComplete = () => {
        this.props.scope.props.dispatch(reloadGrid({ grid: this.props.gridName }));
    }

    render() {
        const { isOpen } = this.state;
        const { data, siteModalHeader } = this.props;
        const { comment, rating } = data;
        return (
            <div>
                <div onClick={() => this.onCommentClick()}>
                    <Tooltip title={comment ? util.textWrapperOnLimit(comment) : ''} arrowPointAtCenter placement="rightTop" >
                        <span>
                            <Rating
                                initialRating={rating || ''}
                                readonly
                                emptySymbol="fa fa-star-o fa-1x"
                                fullSymbol="fa fa-star fa-1x"
                            />
                        </span>
                    </Tooltip>
                </div>
                {data && Object.keys(data).length > 0 && <Modal isOpen={isOpen} className={"popup-sales comment-box"}>
                    <ModalHeader className={"widgetHeaderColor"} toggle={() => this.setState({ isOpen: !isOpen })}>{siteModalHeader + " - " + (data.storeId ? data.storeId.name : '')}</ModalHeader>
                    <ModalBody className={"reorderBody"} >
                        <CommentBox onActionComplete={this.onActionComplete} addCommentProps={this.props.addCommentProps} addComponentType={this.props.addComponentType} commentRequestType={this.props.commentRequestType} commentRequest={this.props.commentRequest} mappingId={this.props.mappingId} componentId={this.props.componentId} className="receipt-popup-comment" data={data} onClose={() => console.log("CommentBox Closed")} id={data._id} getCommentList={this.props.getCommentList} />
                    </ModalBody>
                </Modal>}
            </div>
        );
    }
}

Comments.contextTypes = {
    router: PropTypes.object.isRequired
};

function mapStateToProps(state, ownProps) {
}

var CommentsModule = connect(mapStateToProps)(Comments);
export default Comments;