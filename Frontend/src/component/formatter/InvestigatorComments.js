import React, { Component } from 'react';
import Rating from 'react-rating';
import { Tooltip } from 'antd';
import util from '../../Util/Util'
import CommentBox from '../CommentBox';
import { Modal, ModalHeader, ModalBody } from 'reactstrap';
import moment from 'moment';
import { getReceipt, updateReceipt, addComment, getCommentList } from '../../redux/actions/httpRequest';
import { connect } from 'react-redux';

class InvestigatorComments extends Component {
    constructor(props) {
        super(props);
        this.state = {
            isOpen: false
        };
        this.onCommentClick = this.onCommentClick.bind(this);
    }

    onCommentClick = () => this.setState({ isOpen: !this.state.isOpen })

    onActionComplete = () => {
        const { data } = this.props;
        this.props.dispatch(this.props.updateReceiptAction.request({ action: 'update', data: { auditStatus: data.AuditStatus, id: data._id } }));
    }

    render() {
        const { isOpen } = this.state;
        const { data, screenName } = this.props;
        let screenDetails = util.getSalesScreenDetails(screenName.pathname);
        return (
            <div>
                <div onClick={() => this.onCommentClick()}>
                    <Tooltip title={data && data.Comment ? util.textWrapperOnLimit(data.Comment) : ''} arrowPointAtCenter placement="rightTop" >
                        <span>
                            <Rating
                                initialRating={data && data.Rating ? data.Rating : ''}
                                readonly
                                emptySymbol="fa fa-star-o fa-1x"
                                fullSymbol="fa fa-star fa-1x"
                            />
                        </span>
                    </Tooltip>
                </div>
                {data && Object.keys(data).length > 0 && <Modal isOpen={isOpen} className={"popup-sales comment-box"}>
                    <ModalHeader className={"widgetHeaderColor"} toggle={() => this.setState({ isOpen: !isOpen })}>{screenDetails.name + " - " + " Register " + (data.Register || '') + " - " + moment(data.EventTime).format(util.dateFormat)}</ModalHeader>
                    <ModalBody className={"reorderBody"} >
                        <CommentBox onActionComplete={this.onActionComplete} addCommentProps="addComment" addComponentType={addComment} commentRequestType={getCommentList} commentRequest={"getCommentList"} mappingId="InvoiceId" componentId="InvoiceId" className="receipt-popup-comment" data={data} getCommentList={this.props.getCommentList} onClose={() => console.log("CommentBox Closed")} />
                    </ModalBody>
                </Modal>}
            </div>
        );
    }
}

InvestigatorComments.defaultProps = {
    updateReceiptAction: updateReceipt,
    updateReceiptActionName: 'updateReceipt'
}

function mapStateToProps(state, ownProps) {
    return {
        updateReceipt: state.updateReceipt,
        getCommentList: state.getCommentList
    };
}

var InvestigatorCommentsModule = connect(mapStateToProps)(InvestigatorComments);
export default InvestigatorCommentsModule;