import React, { PureComponent } from 'react'
import { connect } from 'react-redux'
import { Col, FormGroup, Input, Label, Row } from 'reactstrap';
import { clientData, deleteClientRegion, regionsByClientId, updateClientRegion } from '../../redux/actions/httpRequest';
import PropTypes from 'prop-types';
import swal from 'sweetalert';
import LoadingDialog from './../../component/LoadingDialog';
import utils from './../../Util/Util';
import { Steps } from 'rsuite';
import 'rsuite/dist/styles/rsuite-default.css';
import api from '../../redux/httpUtil/serverApi';
import { instance } from '../../redux/actions/index'
import "antd/dist/antd.css";
import { Tree, Button as AntButton } from 'antd';
import { flattenDeep } from "lodash";

const { TreeNode } = Tree;

export class ClientRegion extends PureComponent {
    constructor(props) {
        super(props);

        let ClientID = localStorage.getItem("ClientID");
        let ClientDetails = JSON.parse(localStorage.getItem("ClientDetails"));

        let GlobalNodeName = "Global";
        let GlobalReq = {
            name: GlobalNodeName,
            parentRegionId: null,
            clientId: ClientID
        }

        this.state = {
            GlobalNodeName: GlobalNodeName,
            treeData: [],
            expandedKeys: ["", ""],
            autoExpandParent: true,
            checkedKeys: [""],
            selectedKeys: [],
            dataRef: {},
            title: '',
            UpdateName: '',
            FormName: '',
            editMode: false,
            UpdatedRecently: false,
            showButtons: false,
            showTitle: false,
            addMode: false,
            GlobalReq: GlobalReq,
            ClientID: ClientID,
            ClientData1: {},
            recentlyUpdated: false,
            ClientName: ClientDetails ? ClientDetails.name : ' ',
            disabled: false
        }

        this.onSave = this.onSave.bind(this);
        this.onCancel = this.onCancel.bind(this);
        this.handleNavigate = this.handleNavigate.bind(this);
        this.isUpdate = this.props.match.params.id !== "0";

        this.props.dispatch(clientData.request({ action: 'load', id: ClientID }, ClientID));
    }

    onExpand = expandedKeys => {
        this.setState({
            expandedKeys,
            autoExpandParent: false
        });
    };

    getAllKeys = data => {

        // This function makes an array of keys
        const nestedKeys = data.map(node => {
            let childKeys = [];
            if (node.items) {
                childKeys = this.getAllKeys(node.items);
            }
            return [childKeys, node._id];
        });

        return flattenDeep(nestedKeys);
    };

    onSelect = (selectedKeys, info) => {
        this.setState({ selectedKeys });
    };

    renderTreeNodes = data =>
        data.map(item => {
            if (item.items) {
                return (
                    <TreeNode defaultExpandAll={true} title={item.name} key={item._id} dataRef={item}>
                        {this.renderTreeNodes(item.items)}
                    </TreeNode>
                );
            }
            return <TreeNode key={item._id} {...item} />;
        });

    CancelAllModes = () => {
        this.setState({
            addMode: false,
            editMode: false,
            dataRef: {},
            showButtons: false,
            showTitle: false,
            title: '',
            FormName: ''
        });
    }

    handleNavigate = (stateVar, page) => {
        if (this.state.ClientData1 && this.state.ClientData1[stateVar]) {
            utils.onNavigate({
                props: this.props,
                type: "replace",
                route: `/admin/clients/${page}/${this.props.match.params.id}`
            });
        }
    }

    componentDidMount() {
        let ID = this.state.ClientID;
        this.props.dispatch(regionsByClientId.request({ action: 'load', id: ID }, ID));
    }

    componentWillReceiveProps(nextProps) {

        if (nextProps.updateClientRegion && nextProps.updateClientRegion.data && this.state.recentlyUpdated) {
            let { data, isFetching, error } = nextProps.updateClientRegion;
            if (!isFetching) {
                this.setState({ isLoading: false });
                console.log('update region Data', data)
                if (error || data && data.errmsg) {
                    
                } else {
                   
                    let treeData = data.treeData;

                    this.setState({
                        treeData: treeData,
                        recentlyUpdated: false,
                        expandedKeys: this.getAllKeys(treeData) //for auto-expanding full tree 
                    });

                    this.CancelAllModes();
                    return
                }
            }
        }

        if ((nextProps.regionsByClientId && nextProps.regionsByClientId !== this.props.regionsByClientId)) {
            let { data, isFetching, error, success } = nextProps.regionsByClientId;

            if (!isFetching) {

                if (success === false || error || data && data.errmsg) {
                    let errorMessage = error || "";
                    if (data && data.errmsg && typeof data.errmsg == "object") {
                        errorMessage = data.errmsg.message;
                    } else if (data && data.errmsg) {
                        errorMessage = data.errmsg;
                    }
                    swal({ title: "Error", text: errorMessage, icon: "error", });
                    return;

                } else if (data && data.message && !data.success) {
                    // this.props.history.goBack(-1)
                    
                    this.props.history.push(`/admin/clients`);
                  } else {

                    if (data && data.success) {
                        if (data.message == "No Records Found") {
                            this.createNewRegion(true);
                        } else {

                            this.setState({
                                data: data,
                                treeData: data.clientRegionsResult,
                                expandedKeys: this.getAllKeys(data.clientRegionsResult) //for auto-expanding full tree
                            });
                        }
                    }
                }
            }
        }

        if (nextProps.deleteClientRegion && nextProps.deleteClientRegion.data && nextProps.deleteClientRegion.data !== this.props.deleteClientRegion.data) {

            let DeleteData = nextProps.deleteClientRegion.data;

            if (!DeleteData.error) {
                this.setState({
                    treeData: DeleteData.treeData,
                    expandedKeys: this.getAllKeys(DeleteData.treeData) //for auto-expanding full tree
                });

                this.CancelAllModes();

            } else {
                swal({
                    title: "Status",
                    text: DeleteData.errmsg,
                    icon: "warning",
                    showCancelButton: false,
                    showConfirmButton: true,
                    dangerMode: true,
                }).then(
                    function (res) {
                    }
                )
            }
        }
    }

    onSaveContinue = () => {

        let state = this.state;
        if (state.treeData[0].items.length) {
            utils.onNavigate({
                props: this.props,
                type: "replace",
                route: '/admin/clients/System Settings/' + this.props.match.params.id
            });
        } else {
            swal({
                title: "Error",
                text: "Atleast add one region.",
                icon: "warning",
                showCancelButton: false,
                showConfirmButton: true,
                dangerMode: true,
            });
        }
    }

    onCancel = () => {
        this.props.history.goBack(-1)
    }

    handleNameChange = e => {
        this.setState({ FormName: e.target.value })
    }

    updateRegion = () => {

        const { FormName, dataRef, ClientID } = this.state;
        let data = {
            name: FormName,
            parentRegionId: dataRef.parentRegionId,
            clientId: ClientID
        }

        this.setState({ recentlyUpdated: true })
        this.props.dispatch(updateClientRegion.request({ data: data }, dataRef._id, 'put'))
    }

    onSave = (e) => {

        e.preventDefault();

        const { addMode, editMode } = this.state;
        console.log("region onsave", addMode, editMode)
       
        if (addMode) this.createNewRegion(false);
        else if (editMode) this.updateRegion();

        if(this.state.disabled){
            return
        }
        this.setState({ disabled: true })
    }

    createNewRegion = (global) => {
        let action = 'create';
        let { GlobalReq, FormName, dataRef, ClientID } = this.state;

        let data = {};

        if (global) {
            data = GlobalReq;
        } else {
            data = {
                name: FormName,
                parentRegionId: dataRef._id,
                clientId: ClientID
            }
        }

        let bodyFormData = new FormData();
        bodyFormData.append('data', JSON.stringify(data));
        bodyFormData.append('action', action);

        instance.post(`${api.SAVE_CLIENT_REGION}/${ClientID}`, bodyFormData)
            .then(res => {

                this.setState({ isLoading: false });

                if (res.data.error) {
                    swal({
                        title: "Status",
                        text: res.data.errmsg,
                        icon: "warning",
                        showCancelButton: false,
                        showConfirmButton: true,
                        dangerMode: true,
                    })
                }
                if (!res.data.error) {
                    let treeData = res.data.treeData;
                    this.setState({ 
                        treeData: treeData,
                        expandedKeys: this.getAllKeys(treeData) //for auto-expanding full tree 
                    });
                    this.CancelAllModes();
                }
            }).catch(err => {
                this.setState({ isLoading: false });
                console.log(err);
            });
    }

    onDelete = () => {

        swal({
            title: "Are you sure?",
            text: `Do you really want to delete region - ${this.state.title}? This process can not be undone.`,
            icon: "warning",
            buttons: true,
            dangerMode: true,
        }).then(function (willDelete) {
            let id = this.state.ClientID;
            console.log('delete region', this.state.dataRef._id, id)
            if (willDelete) {
                this.props.dispatch(deleteClientRegion.request({ id: this.state.dataRef._id, clientID: id }, '', 'put'));
            }
        }.bind(this));
    }

    onEdit = () => {
        this.setState({ editMode: true, FormName: this.state.title, addMode: false });
    }

    onTreeClick = (event, info) => {
        let title = info.props.title;
        this.setState({
            title: title,
            dataRef: info.props.dataRef,
            showButtons: true,
            showTitle: true,
            disabled: false
        });
    }

    getInitialValueTemplate() {
        return {
            name: "",
            url: "",
            status: "",
            logo: "",
            theme: "",
            clientType: 'direct'
        }
    }

    AddRegion = () => {
        this.setState({ addMode: true, editMode: false, FormName: '' });
    }

    render() {
        const { state } = this;
        let { treeData, autoExpandParent, expandedKeys, checkedKeys, selectedKeys, FormName, showButtons, addMode, title, showTitle, editMode, dataRef, ClientName, isLoading } = state;

        let ClientData1;
        let { clientData } = this.props;
        let isFetching = clientData && clientData.isFetching;
        isFetching = isFetching || clientData && clientData.isFetching;

        if (clientData && clientData.data) {
            ClientData1 = clientData.data;
            this.setState({ ClientData1: ClientData1 })
        }
        return (
            <div className="animated fadeIn">
                <LoadingDialog isOpen={isFetching || isLoading} />
                <Row>
                    <div class="col-12 mb-4 m-2">
                        <Steps class="col-12" current={2}>
                            <Steps.Item className={ClientData1 && ClientData1.isProfileCompleted ? 'pointer' : null} onClick={() => this.handleNavigate('isProfileCompleted', 'Profile')} title={'Profile(' + ClientName + ')'} />
                            <Steps.Item className={ClientData1 && ClientData1.isRoleCompleted ? 'pointer' : null} onClick={() => this.handleNavigate('isRoleCompleted', 'Roles')} title="Roles" />
                            <Steps.Item title="Regions" />
                            <Steps.Item className={ClientData1 && ClientData1.isSystemSettingsCompleted ? 'pointer' : null} onClick={() => this.handleNavigate('isSystemSettingsCompleted', 'System Settings')} title="System Settings" />
                        </Steps>
                    </div>
                    <br />
                    <Col >
                        <form onSubmit={this.onSave}>
                            <div style={{ padding: "12px" }}>
                                <div className='row'>
                                    <div className='col-lg-6'>
                                        <Tree
                                            defaultExpandAll={true}
                                            onClick={this.onTreeClick}
                                            onExpand={this.onExpand}
                                            expandedKeys={expandedKeys}
                                            defaultExpandedKeys={expandedKeys}
                                            autoExpandParent={autoExpandParent}
                                            checkedKeys={checkedKeys}
                                            onSelect={this.onSelect}
                                            onSelectorClick={this.onSelectorClick}
                                            selectedKeys={selectedKeys}
                                        >
                                            {this.renderTreeNodes(treeData)}
                                        </Tree>
                                    </div>
                                    <div className='col-lg-6'>

                                        <div class="row">
                                            <div className='col-lg-6'>
                                                {showTitle ? <label>{title}</label> : null}
                                            </div>
                                            <div className='col-lg-6'>
                                                {showButtons ? <div>
                                                    <AntButton onClick={this.AddRegion} className="ml-3 mb-1 dashboard-button gridAdd" shape="circle" icon="plus" ghost />

                                                    {dataRef.parentRegionId === null ? null : <AntButton onClick={this.onDelete} className="ml-3 mb-1 dashboard-button gridAdd" shape="circle" icon="minus" ghost />}

                                                    <AntButton onClick={this.onEdit} className="ml-3 mb-1 dashboard-button gridAdd" shape="circle" icon="edit" ghost />

                                                </div> : null}
                                            </div>
                                        </div>

                                        {addMode || editMode ? <FormGroup col className="col-sm-9">

                                            <Label>{addMode ? 'Add region under' : 'Update region'} {title}</Label>

                                            <Col sm className="text-field">
                                                <Input
                                                    id="name"
                                                    type="text"
                                                    value={FormName}
                                                    onChange={this.handleNameChange}
                                                    className="form-control text-form"
                                                    required
                                                />
                                                <label className="text-label">Name</label>
                                            </Col>

                                            <button type="submit" className="floatRight btn formButton" disabled={this.state.disabled} >  <i className="fa fa-save" aria-hidden="true"
                                            ></i>{" "} {editMode ? 'Update ' : 'Save '} Region </button>

                                            <button type="button" onClick={this.CancelAllModes} className="floatRight btn formButton mr-3" >  <i className="fa fa-close" aria-hidden="true" ></i>
                                            {" "} Cancel </button>

                                        </FormGroup> : null}
                                    </div>
                                </div>
                            </div>
                        </form>
                    </Col>
                </Row>
                <button type="button" onClick={this.onSaveContinue} className="btn formButton floatRight RegionSaveSubmit" > <i className="fa fa-save" aria-hidden="true"></i> {" "} Save & Continue</button>
            </div>
        )
    }
}

ClientRegion.contextTypes = {
    router: PropTypes.object.isRequired
};

function mapStateToProps(state, ownProps) {

    return {
        initialValues: state.regionsByClientId.data || {},
        regionsByClientId: state.regionsByClientId,
        deleteClientRegion: state.deleteClientRegion,
        clientData: state.clientData,
        updateClientRegion: state.updateClientRegion,
    };
}

var ClientFormModule = connect(mapStateToProps)(ClientRegion);
export default ClientFormModule;