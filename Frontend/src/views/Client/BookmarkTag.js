import React, { PureComponent } from 'react'
import { connect } from 'react-redux'
import { Col, FormGroup, Input, Label, Row } from 'reactstrap';
import PropTypes from 'prop-types';
import InputColor from 'react-input-color';
import 'react-tagsinput/react-tagsinput.css';

export class BookmarkTag extends PureComponent {
    constructor(props) {
        super(props);

        this.state = {
            bookmarkType: '',
            bookmarkColor: "#5e72e4"
        }
        this.onCreateBookmarkTypeClient = this.onCreateBookmarkTypeClient.bind(this);
    }

    onCreateBookmarkTypeClient() {
        const { type, saveBookmark, saveTags } = this.props;
        const { bookmarkType, tagName } = this.state;

        if (type !== "tags"){
           if(bookmarkType) saveBookmark(this.state); 
           else this.setState({ TypeErr: true });
        }else{
            if(tagName) saveTags(this.state); 
            else this.setState({ TagNameErr: true });
        }

        this.setState({ isSubmitting: false });
    }

    render() {
        const { onCancel, type } = this.props;
        const { bookmarkColor, bookmarkType, isSubmitting, TypeErr, tagName, TagNameErr } = this.state;

        return (
            <div>
                <Row>
                    <Col md={12} >
                        <div className="mt-3 ml-2" >
                            <form>
                                <Label>Create New {type === "tags" ? ' Tags' : ' Bookmark Type'}</Label>
                                <div className="ml-4" >
                                    {type !== "tags" ? <>
                                        <FormGroup row className="pt-2" >
                                            <Label htmlFor="bookmarkType" >Bookmark Type<span className={'text-danger'}>*</span></Label>
                                            <Col sm={6} >
                                                <Input
                                                    id="bookmarkType"
                                                    placeholder="Enter Bookmark Type"
                                                    type="text"
                                                    className="form-control ml-4"
                                                    value={bookmarkType}
                                                    onChange={(e) => this.setState({ bookmarkType: e.target.value, TypeErr: false })}
                                                />
                                                {TypeErr && <div className="input-feedback ml-4"> Required </div>}
                                            </Col>
                                        </FormGroup>
                                        <FormGroup row className="pt-2" >
                                            <Label for="bookmarkColor" >Color</Label>
                                            <Col sm={10} >
                                                <InputColor
                                                    initialValue={(bookmarkColor) || "#5e72e4"}
                                                    value={bookmarkColor}
                                                    onChange={(e) => this.setState({ bookmarkColor: e.hex })}
                                                    style={{ marginLeft: '100px' }}
                                                    placement="Bottom"
                                                />
                                            </Col>
                                        </FormGroup>
                                    </> :
                                        <FormGroup row className="pt-2" >
                                            <Label htmlFor="tagss" >Tags<span className={'text-danger'}>*</span></Label>
                                            <Col sm={6} >
                                                <Input
                                                    id="tagss"
                                                    placeholder="Enter Tags Name"
                                                    type="text"
                                                    className="form-control ml-4"
                                                    value={tagName}
                                                    onChange={(e) => this.setState({ tagName: e.target.value, TypeErr: false })}
                                                />
                                                {TagNameErr && <div className="input-feedback ml-4"> Required </div>}
                                            </Col>
                                        </FormGroup> }

                                    <div className={'form-button-group floatRight mt-3'} >
                                        <button
                                            type="button"
                                            onClick={() => this.setState({ isSubmitting: true }, () => this.onCreateBookmarkTypeClient())}
                                            className="btn formButton mr-2"
                                            disabled={isSubmitting} >
                                            <i className="fa fa-save mr-1" aria-hidden="true" ></i>
                                            Save
                                        </button>

                                        <button onClick={onCancel} type="button" className="btn formButton" >
                                            <i className="fa fa-close" aria-hidden="true" ></i> Cancel
                                        </button>
                                    </div>
                                </div>
                            </form> 
                        </div>
                    </Col>
                </Row>
            </div>
        )
    }
}

BookmarkTag.contextTypes = {
    router: PropTypes.object.isRequired
};

function mapStateToProps(state, ownProps) {
    return {
        initialValues: state.bookmarkTypeClient.data || {},
        bookmarkTypeClient: state.bookmarkTypeClient
    };
}

var BookmarkTagModule = connect(mapStateToProps)(BookmarkTag);
export default BookmarkTagModule;