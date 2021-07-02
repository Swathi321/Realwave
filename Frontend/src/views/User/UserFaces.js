import React, { Component, Fragment } from 'react';
import { Row, Col, CardBody, Card, CardHeader, Button, Input } from 'reactstrap';
import { connect } from 'react-redux';
import { getUploadedFaces, getFace } from '../../redux/actions/httpRequest';
import LoadingDialog from '../../component/LoadingDialog';
import swal from 'sweetalert';
import AddFace from './AddFace';
import PropTypes from 'prop-types';
import UserFacesPagination from '../User/UserFacesPagination';
import { Button as AntButton, Tooltip } from 'antd';
import consts from '../../Util/consts';
import utils from '../../Util/Util';

class UserFaces extends Component {
    constructor(props) {
        super(props);
        this.state = {
            Faces: [],
            SearchedFaces: [],
            selectedFace: null,
            isAdd: false,
            searchValue: "",
            isSearched: false,
            //Pagination Params
            pageSize: 18,
            page: 1,
            total: 0,
            pageTotal: 1,
            hasMore: true
            //END
        }
        this.alreadyclicked = false;
        this.alreadyclickedTimeout = null;
        this.onSelectFace = this.onSelectFace.bind(this);
        this.paginate = this.paginate.bind(this);
    }

    componentWillReceiveProps(nextProps) {
        if ((nextProps.getUploadedFaces && nextProps.getUploadedFaces !== this.props.getUploadedFaces)) {
            let { data, isFetching, error } = nextProps.getUploadedFaces;
            let title = "", text = "", icon = "";
            if (!isFetching) {
                if (error || data && data.errmsg) {
                    title = "Error";
                    text = error || data.errmsg;
                    icon = "error";
                    swal({ title, text, icon });
                } else {
                    let { isSearched } = this.state;
                    var filesArr = [], FacesList = [];
                    var len = data.data.length;
                    for (let i = 0; i < len; i++) {
                        var Files = data.data[i].Files;
                        if (Files && Files.length > 0) {
                            var files = Files || '';
                            filesArr = files.split(',').filter(String);
                        }
                        var length = filesArr.length;
                        if (!isSearched) {
                            var listIndex = this.state.Faces.findIndex(e => e.Id == data.data[i]._id);
                            if (listIndex == -1) {
                                if (length > 0) {
                                    FacesList.push({ Id: data.data[i]._id, Name: data.data[i].Name, Face: filesArr[length - 1] });
                                } else {
                                    FacesList.push({ Id: data.data[i]._id, Name: data.data[i].Name, Face: null });
                                }
                            } else {
                                if (length > 0) {
                                    this.state.Faces[listIndex] = { Id: data.data[i]._id, Name: data.data[i].Name, Face: filesArr[length - 1] }
                                } else {
                                    this.state.Faces[listIndex] = { Id: data.data[i]._id, Name: data.data[i].Name, Face: null }
                                }

                            }
                        } else {
                            if (length > 0) {
                                FacesList.push({ Id: data.data[i]._id, Name: data.data[i].Name, Face: filesArr[length - 1] });
                            } else {
                                FacesList.push({ Id: data.data[i]._id, Name: data.data[i].Name, Face: null });
                            }
                        }
                    }
                    if (isSearched) {
                        let SearchedFacesObj = Object.assign({}, this.state.SearchedFaces)
                        SearchedFacesObj = FacesList;
                        this.setState({
                            SearchedFaces: SearchedFacesObj,
                            total: data.total
                        })
                    } else {
                        let UserFacesObj = this.state.Faces;
                        UserFacesObj.push(...FacesList);
                        this.setState({
                            Faces: UserFacesObj,
                            total: data.total
                        })
                    }
                }
            }
        }
    }
    componentWillMount() {
        this.bindStore();
    }
    onSelectFace(face) {
        if (this.alreadyclicked) {
            this.alreadyclicked = false;
            this.setState({ isAdd: true, selectedFace: face.Id });
            this.alreadyclickedTimeout && clearTimeout(this.alreadyclickedTimeout);
            this.props.dispatch(getFace.request({ action: 'load' }, face.Id));
        }
        else {
            this.alreadyclicked = true;
            this.alreadyclickedTimeout = setTimeout(() => {
                this.alreadyclicked = false;
            }, 300);
        }
    }
    togglePanel() {
        const { state } = this;
        let id = state && state.Faces[0].Id;
        if (state) {
            this.props.dispatch(getFace.request({ action: 'load' }, state.selectedFace ? state.selectedFace : id));
            this.setState({ isAdd: !state.isAdd });
        } else {
            this.scope.setState({ isAdd: !this.scope.state });
        }
    }

    addNew = () => {
        if (!this.state.isAdd) {
            this.setState({ isAdd: !this.state.isAdd });
        }
        this.props.dispatch(getFace.request({ action: 'load' }, '0'));
    }

    onSearchChange(e) {
        let value = e.target.value;
        if (!value) {
            this.onCancelClick();
        }
        this.setState({ searchValue: value });
    }
    //Paginate Functionality
    bindStore() {
        const { page, pageSize } = this.state;
        let params = {
            action: undefined,
            page: page,
            pageSize: pageSize,
            populate: "",
            sort: undefined,
            sortDir: undefined,
        }
        this.props.dispatch(getUploadedFaces.request(params));
    }
    paginate() {
        let options = {};
        options.page = this.state.page + 1;
        let { Faces, total } = this.state;
        if (Faces.length < total) {
            this.setState(options, () => {
                this.bindStore();
            });
        }
    }

    onSearchClick() {
        let { searchValue, isSearched } = this.state;
        if (searchValue != "") {
            let filters = [
                { "operator": "like", "value": searchValue, "property": "Name", "type": "string" }
            ];
            isSearched = true
            this.setState({ isSearched });
            this.props.dispatch(getUploadedFaces.request({ filters }));
        } else {
            swal({ title: "Error", text: "Please Enter Search Value", icon: "error" });
        }
    }

    onCancelClick() {
        this.setState({ searchValue: "", Faces: [], isSearched: false, page: 1 }, () => {
            this.bindStore();
        });
    }

    render() {
        const { state } = this;
        const { Faces, isAdd, searchValue, hasMore, isSearched, SearchedFaces } = state;
        const { getUploadedFaces } = this.props;
        let { isFetching } = getUploadedFaces;
        let heights = window.innerHeight;
        let ios = window.navigator.userAgent.match(/iPad|iPhone|iPod/);

        return (
            <Fragment>
                <LoadingDialog isOpen={isFetching} />
                <Row>
                    <Col md={isAdd ? 6 : 12}>
                        <Card>
                            <CardHeader className="eventFeed-title user-face-upload">
                                <div className="userfaces-padding contentText cameracardText textConvert gridHeader "><i className="fa fa fa-smile-o" /> {consts.UserFaces}</div>
                                <form onSubmit={() => this.onSearchClick()}>
                                    <div style={{ display: 'flex' }}>
                                        <Input placeholder="Search..." value={searchValue} onChange={(e) => this.onSearchChange(e)} />
                                        <span className='btn btn-secondary addFace-margin' onClick={() => this.onSearchClick()}><i className={"fa fa-search"} aria-hidden="true"></i></span>
                                        {searchValue != "" && <span style={{ borderLeft: "1px solid" }} className='btn btn-secondary addFace-margin' onClick={() => this.onCancelClick()}><i className={"fa fa-remove"} aria-hidden="true"></i></span>}
                                    </div>
                                </form>
                                {!ios && <div>
                                    <Tooltip placement="bottom" title={consts.Add}>
                                        <AntButton className="ml-3 dashboard-button formAddButton addFace-top " shape="circle" icon="plus" ghost onClick={() => this.addNew()} />
                                    </Tooltip>
                                    {/* <Button outline color="btn formAddButton" onClick={() => this.addNew()}>Add <i className="fa fa-plus add-icon"></i></Button> */}
                                </div>}
                                {!ios && <div>
                                    <span onClick={() => this.togglePanel()} className="event-header-right-icon padding-top"> <i title={isAdd ? "Expand" : "Collapse"} className={'fa fa-chevron-' + (isAdd ? 'right' : 'left') + ' cursor'}></i> </span>
                                </div>}
                            </CardHeader>
                            <CardBody className="eventfeed-cardbody">
                                <Col className="event-feed-stop-scroll" style={{ height: heights - 202, overflowY: 'auto' }}>
                                    {(Faces || SearchedFaces) && (Faces.length > 0 || SearchedFaces.length > 0) &&
                                        <UserFacesPagination
                                            data={isSearched ? SearchedFaces : Faces}
                                            paginateEvent={this.paginate.bind(this)}
                                            onSelectFace={this.onSelectFace}
                                            isAdd={isAdd}
                                            hasMore={hasMore}
                                        />
                                    }
                                </Col>
                            </CardBody>
                        </Card>
                    </Col>
                    {
                        isAdd && <Col md={6}>
                            <Card className="camera-card-height">
                                <CardHeader className="eventFeed-title contentText">
                                    <Row>
                                        <Col md={8}>
                                            <b>Available Faces</b>
                                        </Col>
                                    </Row>
                                </CardHeader>
                                <CardBody className="event-feed-transaction">
                                    <Col className="event-feed-video-margin" style={{ height: heights - 183 }}>
                                        <AddFace toggle={this.togglePanel} scope={this} />
                                    </Col>
                                </CardBody>
                            </Card>
                        </Col>
                    }
                </Row>
            </Fragment>
        );
    }
}

function mapStateToProps(state, ownProps) {
    return {
        getUploadedFaces: state.getUploadedFaces,
        getFace: state.getFace
    };
}

UserFaces.contextTypes = {
    router: PropTypes.object.isRequired
};

var UserFacesModule = connect(mapStateToProps)(UserFaces);
export default UserFacesModule;
