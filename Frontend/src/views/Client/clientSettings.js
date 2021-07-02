import React, { PureComponent } from 'react'
import { connect } from 'react-redux'
import { getSmartDevice, globalWidgetsReports, clientData, deleteClientBookmark, bookmarkTypeClient, cameraTags, deleteClientCameraTags } from '../../redux/actions/httpRequest';
import PropTypes from 'prop-types';
import swal from 'sweetalert';
import { Formik } from 'formik';
import * as Yup from 'yup';
import LoadingDialog from './../../component/LoadingDialog';
import BookmarkTag from './BookmarkTag';
import utils from './../../Util/Util';
import Select from 'react-select';
import { Steps } from 'rsuite';
import 'rsuite/dist/styles/rsuite-default.css';
import api from '../../redux/httpUtil/serverApi';
import { instance } from '../../redux/actions/index'
import { Input, Col, Label, FormGroup, Row, Collapse, Card, CardBody, CardHeader } from 'reactstrap';
import { Button as AntButton } from 'antd';
import { ConsoleSqlOutlined, FastBackwardFilled } from '@ant-design/icons';

const customStyles = {
    clearIndicator: styles => ({ ...styles, width: '16', padding: '0px' }),
    control: styles => ({ ...styles, backgroundColor: 'white' })
}

export class ClientSettings extends PureComponent {
    constructor(props) {
        super(props);

        let ClientID = localStorage.getItem("ClientID");
        let ClientDetails = JSON.parse(localStorage.getItem("ClientDetails"));

        this.state = {
            ClientID: ClientID,
            SmartCollapse: true,
            BookCollapse: true,
            TagCollapse: true,
            PlusCollapse: false,
            DelCollapse: true,
            TagCollapse: true,
            firstTime: true,
            deleteTags: false,
            AddTags: false,
            showKeyClientID: false,
            ShowSubmit: false,
            keyInCloudClientId: '',
            keyInCloudSecretKey: '',
            sera4Url: '',
            sera4Token: '',
            showSera: false,
            TwsUser: '',
            TwsPass: '',
            smartDeviceTypesData: [],
            SelectedReports: [],
            Selectedwidgets: [],
            selectedDevices: [],
            SelectedBookmarks: [],
            bookmarkType: [],
            SelectedTags: [],
            tags: [],
            checked: [],
            delBoxID: [],
            accessControlName: 'Access Control',
            sera4AccessControl: '',
            ClientDetails: ClientDetails,
            ClientName: ClientDetails ? ClientDetails.name : ' '
        }

        this.onSave = this.onSave.bind(this);
        this.onCancel = this.onCancel.bind(this);
        this.delBoxDelete = this.delBoxDelete.bind(this);
        this.isUpdate = this.props.match.params.id !== "0";

        props.dispatch(getSmartDevice.request({ action: 'find' }));
        props.dispatch(globalWidgetsReports.request({ action: 'load' }));
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

    handleChange = (option, stateVar, check) => {

        const { selectedDevices, smartDeviceTypesData } = this.state;
        this.setState({ [stateVar]: option });


        if (stateVar === "selectedDevices" && check) {

            let RemovedDevices = selectedDevices.filter(obj => { return option.findIndex(obj2 => obj._id === obj2._id) == -1; });

            let TypeDevices = [...smartDeviceTypesData];
            if (RemovedDevices && RemovedDevices.length) {
                RemovedDevices.map(device => {

                    let TypeData = TypeDevices.find(option => option.type === device.smartDeviceType);

                    if (TypeData && TypeData.device && TypeData.device.length) {
                        TypeData.device.map(option => {
                            if (option._id === device._id) {

                                option.checked = !option.checked;
                            }
                        });
                    }

                });
            }
            this.checkAccessControlDeviceChecked(option);
        }
    }

    handleCheck = (delBox, stateVar) => {

        this.setState({
            [stateVar]: delBox
        })

        this.state.delBoxID = delBox._id;
    }

    delBoxDelete = (delBoxIDs, type) => {

        const { deleteBook, deleteTags, ClientID, bookmarkType, SelectedBookmarks, tags, SelectedTags } = this.state;

        let me = this;
        // let message = "The selected Bookmark Type(s) will get deleted for this client." : "The selected Tag(s) will get deleted for this client.";

        let message = "The selected "+ type+"(s) will get deleted for this client.";


        swal({
            title: "Are you sure?",
            text: message,
            icon: "warning",
            showCancelButton: true,
            showConfirmButton: true,
            buttons: ["Cancel", "OK"],
            dangerMode: true
        }).then(function (willDelete) {

            if (willDelete) {

                let apiName = deleteBook ? deleteClientBookmark : deleteClientCameraTags;
                let ReqObj = deleteBook ? 'bookMarkTypeIds' : 'cameraTagIds';

                this.props.dispatch(apiName.request({ [ReqObj]: delBoxIDs }, ClientID, null, (response) => {
                    let { success, message, error, errmsg, data } = response;
                    if (success) {
                        swal({
                            title: utils.getAlertBoxTitle(success),
                            text: message,
                            icon: "success",
                            showConfirmButton: true
                        });

                        if (deleteBook) {
                            let bookmarkTypes = bookmarkType.filter(ob => delBoxIDs.indexOf(ob._id) === -1);

                            let SelectedBookmarkss = SelectedBookmarks.filter(SB => delBoxIDs.indexOf(SB._id) === -1);

                            this.setState({ bookmarkType: bookmarkTypes, SelectedBookmarks: SelectedBookmarkss }, me.deleteCancel("deleteBook", "bookmarkType"));
                        } else {
                            let newTags = tags.filter(ob => delBoxIDs.indexOf(ob._id) === -1);

                            let SelectedTagss = SelectedTags.filter(SB => delBoxIDs.indexOf(SB._id) === -1);

                            this.setState({ tags: newTags, SelectedTags: SelectedTagss }, me.deleteCancel("deleteTags", "tags"));
                        }
                    } else {
                        swal({
                            title: "Warning !",
                            text: errmsg,
                            icon: "warning",
                            showConfirmButton: true
                        })
                    }
                }))
            }
        }.bind(this));
    }

    handleClick = (type, ClickedData, e, statevar) => {
        const { accessControlName, deleteBook, deleteTags } = this.state;
        let CheckedValue = e.target.checked;
        let Data = [...this.state[statevar]];

        if ((statevar === "SelectedBookmarks" && deleteBook) || (statevar === "SelectedTags" && deleteTags)) ClickedData.toDelete = !ClickedData.toDelete;
        else ClickedData.checked = !ClickedData.checked;

        if (CheckedValue) {
            Data.push(ClickedData);
        } else {
            let index = Data.findIndex(option => option._id === ClickedData._id);
            Data.splice(index, 1);
        }

        if (statevar == 'selectedDevices' && type.toLowerCase() == accessControlName.toLowerCase()) {
            this.checkAccessControlDeviceChecked(Data,ClickedData.name);
        }

        this.handleChange(Data, statevar);
    }

    checkAccessControlDeviceChecked = (Devices,CLickedName) => {
        let CheckedValue = false;

        if (Devices.length) {
            Devices.map(option => {
                if (option.smartDeviceType.toLowerCase() == this.state.accessControlName.toLowerCase()) {
                    CheckedValue = true;
                }
            });
        }
        if (!CheckedValue) {
            this.setState({ keyInCloudClientId: '', keyInCloudSecretKey: '' });
        }
        if(CLickedName === 'KIC'){
            console.log('ch88',CheckedValue)
        this.setState({ showKeyClientID: !this.state.showKeyClientID })
        }

        if(CLickedName === 'Sera4'){
            this.setState({ showSera: !this.state.showSera })
        }
       
    }

    handleInputChange = (e, stateVar) => {
        this.setState({ [stateVar]: e.target.value });
    }

    componentDidMount = async () => {
        const { ClientID } = this.state;

        let bookmarkType = await this.props.dispatch(bookmarkTypeClient.request({ clientId: ClientID, clientget: 'true', action: 'client' }));

        let cameraTagss = this.props.dispatch(cameraTags.request({ clientId: ClientID, clientget: 'true', action: 'client' }));

        this.props.dispatch(clientData.request({ action: 'find' }, ClientID));
    }

    creatingDevicesList = (SmartDeviceData, list) => {

        if (SmartDeviceData && SmartDeviceData.length) {
            if (list) {
                SmartDeviceData.map(option => {
                    option.value = option._id;
                    option.label = option.name;

                    if (list.length) {
                        list.map(dev => {
                            if (option._id === dev._id) {
                                option.checked = true;
                            }
                        })
                    }
                });
            } else {
                SmartDeviceData.map(option => {
                    option.value = option._id;
                    option.label = option.name;
                });
            }

            this.setState({ SmartDeviceData: SmartDeviceData })

            let smartDeviceTypes = [...new Set(SmartDeviceData.map(obj => obj.smartDeviceType))];
            let smartDeviceTypesData = [];

            if (smartDeviceTypes.length) {
                smartDeviceTypes.map(type => {
                    let obj = {
                        type: type,
                        device: []
                    };

                    SmartDeviceData.map(device => {
                        if (type.toLowerCase() == device.smartDeviceType.toLowerCase()) {
                            obj.device.push(device)
                        }
                    });
                    smartDeviceTypesData.push(obj)
                    console.log('dev99',obj);
                });
            }

            this.setState({ smartDeviceTypesData: smartDeviceTypesData });
        }
    }
    componentWillReceiveProps(nextProps) {

        const { bookmarkType, tags, ClientDetails, ClientID, accessControlName } = this.state;

        if (nextProps.globalWidgetsReports && nextProps.globalWidgetsReports.data) {
            let GloablData = nextProps.globalWidgetsReports.data;
            if (!GloablData.error) {
                this.setState({
                    widgetData: GloablData.widgetData,
                    reportData: GloablData.reportData
                });
            }
        }

        if (nextProps.bookmarkTypeClient && nextProps.bookmarkTypeClient.data && nextProps.bookmarkTypeClient !== this.props.bookmarkTypeClient) {

            let res = nextProps.bookmarkTypeClient;

            if (!res.isFetching) {

                this.setState({ DisableAddBook: false });

                if (res.error) {
                    let errorMessage = res.error || "";
                    if (res.data && res.data.errmsg && typeof res.data.errmsg == "object") {
                        errorMessage = res.data.errmsg.message;
                    } else if (res.data && res.data.errmsg) {
                        errorMessage = res.data.errmsg;
                    }
                    swal({ title: "Error", text: errorMessage, icon: "error", });
                    return;
                } else if (res.data && res.data.message) {


                    if (res.data.success && res.data.message === "Record saved successfully") {
                        // when creating new bookmarks
                        swal({ title: "Success", text: res.data.message, icon: "success" });

                        let bookmarkTypee = [...bookmarkType];
                        bookmarkTypee.push(res.data.data);
                        this.setState({ bookmarkType: bookmarkTypee, PlusCollapse: false });

                    } else this.props.history.goBack(-1);
                } else {
                    if (res.data.success) {
                        // for fetchung the bookmarks for client and global ones to bind on UI 
                        this.setState({ bookmarkType: res.data.data });
                    } else {
                        swal({ title: "Error", text: res.data.errmsg, icon: "error", });
                    }

                }
            }

        }

        if (nextProps.cameraTags && nextProps.cameraTags.data && nextProps.cameraTags.data !== this.props.cameraTags.data) {

            const { error, data, isFetching } = nextProps.cameraTags;

            if (!isFetching) {

                this.setState({ DisableAddTag: false });

                if (error) {
                    let errorMessage = error || "";
                    if (data && data.errmsg && typeof data.errmsg == "object") {
                        errorMessage = data.errmsg.message;
                    } else if (data && data.errmsg) {
                        errorMessage = data.errmsg;
                    }
                    swal({ title: "Error", text: errorMessage, icon: "error", });
                    return;
                } else if (data && data.message) {


                    if (data.success && data.message === "Record saved successfully") {
                        // when creating new bookmarks
                        swal({ title: "Success", text: data.message, icon: "success" });

                        let tagss = [...tags];
                        tagss.push(data.data);
                        console.log('tagss', tagss);
                        this.setState({ tags: tagss, AddTags: false });

                    } else this.props.history.goBack(-1)
                } else {
                    if (data.success) {
                        // for fetchung the tags for client and global ones to bind on UI 
                        this.setState({ tags: data.data });
                    } else {
                        swal({ title: "Error", text: data.errmsg, icon: "error" });
                    }

                }
            }

        }


        if (nextProps.clientData && nextProps.clientData !== this.props.clientData && nextProps.SmartDeviceData && nextProps.SmartDeviceData.data && nextProps.SmartDeviceData.data.data && nextProps.SmartDeviceData.data.data.length) {

            let SmartDeviceData = nextProps.SmartDeviceData.data.data;
            console.log('data--->',nextProps.clientData);
            let { data, isFetching, error } = nextProps.clientData;
            if (!isFetching) {

                if (error || data && data.errmsg) {
                    let errorMessage = error || "";
                    if (data && data.errmsg && typeof data.errmsg == "object") {
                        errorMessage = data.errmsg.message;
                    } else if (data && data.errmsg) {
                        errorMessage = data.errmsg;
                    }
                    swal({ title: "Error", text: errorMessage, icon: "error", });
                    return;
                } else if (data && data.message) {
                    this.props.history.goBack(-1)
                } else {

                    let WidgetsResult = [];
                    let ReportResult = [];

                    // checking if no client settings are saved yet then displayed the deafult industries and reports
                    if (!data.reportsAllowed.length && !data.widgetsAllowed.length && !data.smartDevicesAllowed.length && !data.bookmarkTypeAllowed && !data.cameraTagsAllowed) {

                        this.creatingDevicesList(SmartDeviceData);

                        this.setState({ ShowSubmit: true });

                        let industry = null;
                        if (ClientDetails) industry = ClientDetails.industry;

                        instance.post(`${api.GET_WIDGETS_REPORTS}`, { industryId: [industry], clientId: [ClientID] })
                            .then(res => {
                                if (!res.data.error) {
                                    let WidgetsAndReportsData = res.data;

                                    WidgetsResult = WidgetsAndReportsData.WidgetsResult;
                                    ReportResult = WidgetsAndReportsData.ReportResult;

                                    if (WidgetsResult.length) {
                                        WidgetsResult.map(option => {
                                            option.value = option._id;
                                            option.label = option.name;
                                        });
                                    }
                                    if (ReportResult.length) {
                                        ReportResult.map(option => {
                                            option.value = option._id;
                                            option.label = option.name;
                                        });
                                    }

                                    this.setState({
                                        SelectedReports: ReportResult,
                                        Selectedwidgets: WidgetsResult
                                    });

                                }
                            }).catch(err => {
                                console.log(err);
                            });

                    } else {

                        WidgetsResult = data.widgetsAllowed;
                        ReportResult = data.reportsAllowed;
                        let SmartDevicesResult = data.smartDevicesAllowed;

                        if (WidgetsResult.length) {
                            WidgetsResult.map(option => {
                                option.value = option._id;
                                option.label = option.name;
                            });
                        }
                        if (ReportResult.length) {
                            ReportResult.map(option => {
                                option.value = option._id;
                                option.label = option.name;
                            });
                        }
                        if (SmartDevicesResult.length) {
                            SmartDevicesResult.map(option => {
                                option.value = option._id;
                                option.label = option.name;
                                option.checked = true;

                                if (option.smartDeviceType.toLowerCase() === accessControlName.toLocaleLowerCase()) {
                                    // this.setState({ showKeyClientID: true })
                                    if(data.keyInCloudClientId !== null){
                                        this.setState({ showKeyClientID: true });
                                    }
                                    if(data.sera4Url !== null){
                                        this.setState({ sera4AccessControl: 'Sera4', showSera: true });
                                    }
                                }
                            });
                        }
                        this.creatingDevicesList(SmartDeviceData, SmartDevicesResult);

                        let SelectedBookmarks = [];
                        let SelectedTags = [];

                        //only checked ones are coming in response
                        bookmarkType.length && bookmarkType.map(book1 => {
                            data.bookmarkTypeAllowed.length && data.bookmarkTypeAllowed.map(book2 => {

                                if (book1 && book2 && book1._id === book2._id) {
                                    book1.checked = true;
                                    SelectedBookmarks.push(book1);
                                }
                            });
                        });

                        //only checked ones are coming in response
                        tags.length && tags.map(tag1 => {
                            data.cameraTagsAllowed.length && data.cameraTagsAllowed.map(tag2 => {

                                if (tag1 && tag2 && tag1._id === tag2) {
                                    tag1.checked = true;
                                    SelectedTags.push(tag1);
                                }
                            });
                        });

                        this.setState({
                            SelectedReports: ReportResult,
                            Selectedwidgets: WidgetsResult,
                            selectedDevices: SmartDevicesResult,
                            SelectedBookmarks: SelectedBookmarks,
                            SelectedTags: SelectedTags,
                            keyInCloudClientId: data.keyInCloudClientId,
                            keyInCloudSecretKey: data.keyInCloudSecretKey,
                            sera4Url: data.sera4Url,
                            sera4Token: data.sera4Token,
                            TwsUser: data.TwsUser,
                            TwsPass: data.TwsPass,
                            // showSera: data.TwsUser !== '' ? true : false,
                            ShowSubmit: false
                        });
                    }
                }
            }
        }
    }

    deleteCancel = (stateVar, stateArray) => {
        this.setState({ [stateVar]: false });

        this.state[stateArray].forEach(ob => {
            ob.toDelete = false;
        });

        if (stateVar === "deleteBook") this.toggleAccodion('DelCollapse');
    }

    deleteSelectedOptions = (stateVar, typeName) => {
        let toBeDeleted = []
        this.state[stateVar].forEach(ob => {
            if (ob.toDelete) toBeDeleted.push(ob._id);
        });

        let type = stateVar==='tags' ? 'tag.' : 'bookmark.';
        let message = `${'Please select atleast one ' + type }`; 

        if(toBeDeleted.length) this.delBoxDelete(toBeDeleted, typeName);
        else swal({ title: "Error", text: message, icon: "error" });
    }
  
    // cancelling adding neww bookmark or tag
    CancelAddBookTag = () => {
        this.setState({ PlusCollapse: false, AddTags: false });
    }

    // for saving new bookmark
    saveBookmark = values => {
        if(!this.state.DisableAddBook){
            this.setState({ DisableAddBook: true });
            this.props.dispatch(bookmarkTypeClient.request({
                action: 'client',
                data: { bookmarkType: values.bookmarkType, bookmarkColor: values.bookmarkColor, clientId: this.state.ClientID },
                clientsave: 'true'
            }));
        }
    }

    // for saving new tag
    saveTags = values => {
        if(!this.state.DisableAddTag){
            this.setState({ DisableAddTag: true })
            this.props.dispatch(cameraTags.request({
                action: 'client',
                data: { name: values.tagName, isGlobal: false, clientId: this.state.ClientID },
                clientsave: 'true'
            }));
        }
    }

    toggleAccodion = (stateVar) => {
        let Collapse = this.state[stateVar];
        this.setState({ [stateVar]: !Collapse });
    }

    onCancel = () => {
        this.props.history.goBack(-1)
    }

    onSave(values, { setSubmitting }) {

        const { keyInCloudClientId, keyInCloudSecretKey, sera4Url, sera4Token, TwsUser,TwsPass, selectedDevices, SelectedReports, Selectedwidgets, SelectedBookmarks, SelectedTags } = this.state;

        setSubmitting(false);

        values = {
            smartDevicesAllowed: [],
            widgetsAllowed: [],
            bookmarkTypeAllowed: [],
            reportsAllowed: [],
            cameraTagsAllowed: [],
            keyInCloudClientId: keyInCloudClientId ? keyInCloudClientId : null,
            keyInCloudSecretKey: keyInCloudSecretKey ? keyInCloudSecretKey : null,
            sera4Url: sera4Url ? sera4Url : null,
            sera4Token: sera4Token ? sera4Token : null,
            TwsUser: TwsUser ? TwsUser : null,
            TwsPass: TwsPass ? TwsPass : null,
            checked: 'False'
        }
        selectedDevices.map(option => {
            values.smartDevicesAllowed.push(option.value)
        });
        SelectedReports.map(option => {
            values.reportsAllowed.push(option.value)
        });
        Selectedwidgets.map(option => {
            values.widgetsAllowed.push(option.value)
        });
        SelectedBookmarks.map(option => {
            values.bookmarkTypeAllowed.push(option._id);
        });
        SelectedTags.map(option => {
            values.cameraTagsAllowed.push(option._id);
        });

        this.apiHit(values);
    }

    apiHit = values => {
        instance.post(`${api.CLIENT_SYSTEM_SETTINGS}/${this.state.ClientID}`, values)
            .then(res => {

                if (res.data.error && res.data.errmsg) {

                    if (res.data.errmsg.indexOf("The used Client ID and Secret Key combination is already used for some other client") > -1) {

                        swal({
                            text: res.data.errmsg,
                            showCancelButton: true,
                            showConfirmButton: true,
                            buttons: ["Cancel", "Proceed Anyway"],
                        }).then(function (willDelete) {
                            if (willDelete) {
                                values.checked = "True"
                                this.apiHit(values);
                            }
                        }.bind(this));
                    } else {
                        swal({
                            title: "Status",
                            text: res.data.errmsg,
                            icon: "warning",
                            showCancelButton: false,
                            showConfirmButton: true,
                            dangerMode: true,
                        });
                    }
                    return;
                }
                if (!res.data.error) {

                    localStorage.removeItem('ClientID');
                    localStorage.removeItem('ClientDetails');
                    utils.onNavigate({
                        props: this.props,
                        type: "replace",
                        route: '/admin/clients'
                    });
                }
            }).catch(err => {
                console.log(err);
            });
    }

    render() {
        const { props, isUpdate, state, CancelAddBookTag, saveTags } = this;
        const { initialValues } = props;
        const { name } = initialValues || { name: '' };
        let { smartDeviceTypesData, SmartCollapse, BookCollapse, TagCollapse, PlusCollapse, DelCollapse, reportData, widgetData, SelectedReports, Selectedwidgets, selectedDevices, SmartDeviceData, showKeyClientID, accessControlName, keyInCloudClientId, keyInCloudSecretKey, sera4Url, sera4Token,TwsUser,TwsPass, ClientName, ShowSubmit, bookmarkType, tags, delBox, deleteBook, deleteTags, AddTags } = state;
        console.log('tokin----',sera4Url,sera4Token);
        let ClientData1;
        let { clientData } = this.props;
        let isFetching = clientData && clientData.isFetching;
        isFetching = isFetching || clientData && clientData.isFetching;
        if (clientData && clientData.data) {

            ClientData1 = clientData.data;
            this.setState({ ClientData1: clientData.data })
        }

        console.log('sm00',smartDeviceTypesData);
        smartDeviceTypesData.map(op => {
            console.log('on001',op);

            if(op.type === "Access Control"){
                console.log('op00',op)
                op.device.map(ac => {
                    console.log('po00',ac)
                    if(ac.name === "Sera4"){
                        console.log('ac00',ac.checked,ac)
                        if(ac.checked == undefined && sera4Url !== ''){
                            console.log('dn00',ac.checked,ac)
                                this.setState({showSera: false});
                            }
                    }
                })
               
            }
        })
        return (
            <div className="animated fadeIn">
                <LoadingDialog isOpen={isFetching} />
                <Formik
                    enableReinitialize={true}
                    // initialValues={initialValuesEdit}
                    onSubmit={this.onSave}
                    setError={(err) => console.log(err)}
                    validationSchema={
                        Yup.object().shape({
                            // name: Yup.string().trim().required('Required'),
                        })
                    }>
                    {function (props) {
                        const {
                            handleBlur,
                            handleSubmit,
                            isClicked
                        } = props;
                        return (
                            <Row>
                                <div class="col-12 mb-4 m-2">
                                    <Steps class="col-12" current={3}>
                                        <Steps.Item className={ClientData1 && ClientData1.isProfileCompleted ? 'pointer' : null} onClick={() => this.handleNavigate('isProfileCompleted', 'Profile')} title={'Profile(' + ClientName + ')'} />
                                        <Steps.Item className={ClientData1 && ClientData1.isRoleCompleted ? 'pointer' : null} onClick={() => this.handleNavigate('isRoleCompleted', 'Roles')} title="Roles" />
                                        <Steps.Item className={ClientData1 && ClientData1.isRegionCompleted ? 'pointer' : null} onClick={() => this.handleNavigate('isRegionCompleted', 'Regions')} title="Regions" />
                                        <Steps.Item title="System Settings" />
                                    </Steps>
                                </div>
                                <br />
                                <Col>
                                    <form onSubmit={handleSubmit}>
                                        <div style={{ padding: "12px" }}>
                                            <FormGroup col>
                                                <Col sm={10} className="text-field">
                                                    <Select
                                                        isMulti={true}
                                                        styles={customStyles}
                                                        id="widgets"
                                                        isClearable={true}
                                                        value={Selectedwidgets}
                                                        onChange={(option) => this.handleChange(option, 'Selectedwidgets')}
                                                        onBlur={handleBlur}
                                                        options={widgetData}
                                                        class="form-control custom-select blckClr"
                                                    />
                                                    <label class="fixed-label">Widgets</label>
                                                </Col>
                                            </FormGroup>

                                            <FormGroup col>
                                                <Col sm={10} className="text-field">
                                                    <Select
                                                        isMulti={true}
                                                        styles={customStyles}
                                                        id="reports"
                                                        isClearable={true}
                                                        value={SelectedReports}
                                                        onChange={(option) => this.handleChange(option, 'SelectedReports')}
                                                        onBlur={handleBlur}
                                                        options={reportData}
                                                        class="form-control custom-select blckClr"
                                                    />
                                                    <label class="fixed-label">Reports</label>
                                                </Col>
                                            </FormGroup>

                                            <Card style={{ marginBottom: '1rem' }} key={true} className="SmartDeviceCard">
                                                <CardHeader className="pointer" onClick={() => this.toggleAccodion('SmartCollapse')} data-event={true}> Devices
                                                {SmartCollapse ? <i className="fa fa-angle-up floatRight" /> : <i className="fa fa-angle-down floatRight" />}
                                                </CardHeader>

                                                <Collapse isOpen={SmartCollapse}>
                                                    <CardBody className="mb-3">
                                                        {SmartCollapse ? <div>
                                                            <Row>
                                                                <Col>
                                                                    <FormGroup col>
                                                                        <Col sm={10} className="text-field clientSmartDevicesSS">
                                                                            <Select
                                                                                isMulti={true}
                                                                                styles={customStyles}
                                                                                id="devices"
                                                                                isSearchable={false}
                                                                                isClearable={true}
                                                                                value={selectedDevices}
                                                                                onChange={(option) => this.handleChange(option, 'selectedDevices', true)
                                                                                }
                                                                                class="form-control custom-select blckClr"
                                                                            />

                                                                        </Col>
                                                                    </FormGroup>
                                                                </Col>
                                                            </Row>

                                                            {smartDeviceTypesData && smartDeviceTypesData.length ?
                                                                smartDeviceTypesData.map(option => <FormGroup className="m-0 mt-3">
                                                                    <Col sm={12} className="p-0"> <Label htmlFor={option.type} className="lable blckClr">{option.type}</Label>
                                                                    </Col>
                                                                    <Row>
                                                                        {option.device.length ? option.device.map(device => <Col sm={2} className="mt-2">
                                                                            <input
                                                                                onClick={(e) => this.handleClick(option.type, device, e, 'selectedDevices')}
                                                                                type="checkbox"
                                                                                id={device._id}
                                                                                checked={device.checked}
                                                                            />
                                                                            <span className="ml-1 blckClr">{device.name} </span>
                                                                        </Col>) : null}
                                                                    </Row>

                                                                    {option.type.toLowerCase() == accessControlName.toLowerCase() && showKeyClientID ? <FormGroup row className="m-0 mt-2">
                                                                    <Col sm={12} className="p-0"> <span className="ml-1 blckClr">KIC  </span>
                                                                    </Col>
                                                                        <Col sm className="text-field">
                                                                            <Input
                                                                                id="keyInCloudClientId"
                                                                                type="text"
                                                                                onBlur={handleBlur}
                                                                                value={keyInCloudClientId}
                                                                                onChange={e => this.handleInputChange(e, 'keyInCloudClientId')}
                                                                                className="form-control text-form"
                                                                                required
                                                                            />
                                                                            <label className="text-label">ClientID</label>
                                                                        </Col>
                                                                        <Col sm className="text-field" >
                                                                            <Input
                                                                                id="keyInCloudSecretKey"
                                                                                type="text"
                                                                                onBlur={handleBlur}
                                                                                value={keyInCloudSecretKey}
                                                                                onChange={e => this.handleInputChange(e, 'keyInCloudSecretKey')}
                                                                                className="form-control text-form"
                                                                                required
                                                                            />
                                                                            <label className="text-label">Key</label>
                                                                        </Col>
                                                                    </FormGroup> : null}
                                                                    {option.type.toLowerCase() == accessControlName.toLowerCase()  && this.state.showSera  ? <FormGroup row className="m-0 mt-2">
                                                                    <Col sm={12} className="p-0">  <span className="ml-1 blckClr">Sera4  </span>
                                                                    </Col>
                                                                       <Col sm className="text-field">
                                                                       <Input
                                                                           id="sera4Url"
                                                                           type="text"
                                                                           onBlur={handleBlur}
                                                                           value={sera4Url}
                                                                           onChange={e => this.handleInputChange(e, 'sera4Url')}
                                                                           className="form-control text-form"
                                                                           required
                                                                       />
                                                                       <label className="text-label">ORG-URL</label>
                                                                   </Col>
                                                                   <Col sm className="text-field" >
                                                                       <Input
                                                                           id="sera4Token"
                                                                           type="text"
                                                                           onBlur={handleBlur}
                                                                           value={sera4Token}
                                                                           onChange={e => this.handleInputChange(e, 'sera4Token')}
                                                                           className="form-control text-form"
                                                                           required
                                                                       />
                                                                       <label className="text-label">ORG-TOKEN</label>
                                                                   </Col>
                                                                   <Col sm className="text-field" >
                                                                       <Input
                                                                           id="TwsUser"
                                                                           type="text"
                                                                           onBlur={handleBlur}
                                                                           value={TwsUser}
                                                                           onChange={e => this.handleInputChange(e, 'TwsUser')}
                                                                           className="form-control text-form"
                                                                           required
                                                                       />
                                                                       <label className="text-label">TWS User</label>
                                                                   </Col>
                                                                   <Col sm className="text-field" >
                                                                       <Input
                                                                           id="TwsPass"
                                                                           type="text"
                                                                           onBlur={handleBlur}
                                                                           value={TwsPass}
                                                                           onChange={e => this.handleInputChange(e, 'TwsPass')}
                                                                           className="form-control text-form"
                                                                           required
                                                                       />
                                                                       <label className="text-label">TWS Pass</label>
                                                                   </Col>
                                                                   </FormGroup> : null
                                                                }
                                                                </FormGroup>) : null}
                                                        </div> : null}
                                                    </CardBody>
                                                </Collapse>
                                            </Card>

                                            <Card style={{ marginBottom: '1rem' }} key={true} className="SmartDeviceCard">
                                                <CardHeader className="pointer" onClick={() => this.toggleAccodion('BookCollapse')} data-event={true}>
                                                    Bookmark
                                                {BookCollapse ?
                                                        <i className="fa fa-angle-up floatRight" />
                                                        :
                                                        <i className="fa fa-angle-down floatRight" />
                                                    }
                                                </CardHeader>

                                                <Collapse isOpen={BookCollapse}>
                                                    <CardBody className="mb-3">
                                                        <Row style={{ paddingBottom: '10px', paddingTop: '10px' }} >
                                                            {DelCollapse &&

                                                                <span style={{ marginLeft: "82%" }}>
                                                                    <button
                                                                        type="button"
                                                                        className="btn formButton mr-3"
                                                                        onClick={() => { this.toggleAccodion('DelCollapse'); this.setState({ deleteBook: true }) }}
                                                                    >
                                                                        <i className="fa fa-trash" aria-hidden="true"></i> {" "}
                                                                            Select to Delete
                                                                    </button>

                                                                    <AntButton
                                                                        className="mb-1 pointer dashboard-button gridAdd" shape="circle"
                                                                        icon="plus" ghost
                                                                        disabled={isClicked ? true : false}
                                                                        onClick={() => this.toggleAccodion('PlusCollapse')}
                                                                    />
                                                                </span>
                                                            }
                                                        </Row>

                                                        {BookCollapse ? <div>

                                                            <Row>
                                                                {bookmarkType && bookmarkType.length ?
                                                                    bookmarkType.map(bookmarkColor => {

                                                                        var divStyle = {
                                                                            backgroundColor: bookmarkColor.bookmarkColor
                                                                        }

                                                                        return <Col sm={2} className="mt-2">

                                                                            <input
                                                                                onChange={(e) => this.handleClick('', bookmarkColor, e, 'SelectedBookmarks')}
                                                                                type="checkbox"
                                                                                id={bookmarkColor._id}
                                                                                disabled={!bookmarkColor.clientId && deleteBook}
                                                                                checked={deleteBook ? bookmarkColor.toDelete : bookmarkColor.checked}
                                                                            />

                                                                            <span class="ml-1" style={divStyle}>  <span style={{ visibility: 'hidden' }}>Col</span></span>
                                                                            <span className="ml-1 blckClr">{bookmarkColor.bookmarkType} </span>
                                                                        </Col>
                                                                    }) : null}
                                                            </Row>
                                                        </div> : null}
                                                        {PlusCollapse ?
                                                            <div>
                                                                <BookmarkTag
                                                                    onCancel={CancelAddBookTag.bind(this)}
                                                                    saveBookmark={this.saveBookmark.bind(this)}
                                                                    type="bookmark"
                                                                />
                                                            </div>
                                                            : null}
                                                        {deleteBook &&
                                                            <span className="floatRight mb-2 mt-2">

                                                                <button
                                                                    type="button"
                                                                    onClick={() => this.deleteCancel("deleteBook", "bookmarkType")}
                                                                    className="btn formButton mr-2" >
                                                                    <i className="fa fa-close" aria-hidden="true" ></i> Cancel
                                                                </button>

                                                                <button
                                                                    type="button"
                                                                    onClick={() => this.deleteSelectedOptions('bookmarkType', 'Bookmark Type')}
                                                                    className="btn formButton" >
                                                                    <i className="fa fa-trash mr-1" aria-hidden="true" ></i>
                                                                    Delete Selected
                                                                 </button>
                                                            </span>}
                                                    </CardBody>
                                                </Collapse>
                                            </Card>

                                            <Card style={{ marginBottom: '1rem' }} key={true} className="SmartDeviceCard">
                                                <CardHeader className="pointer" onClick={() => this.toggleAccodion('TagCollapse')} data-event={true}>
                                                    Tags
                                                {TagCollapse ?
                                                        <i className="fa fa-angle-up floatRight" />
                                                        :
                                                        <i className="fa fa-angle-down floatRight" />
                                                    }
                                                </CardHeader>

                                                <Collapse isOpen={TagCollapse}>
                                                    <CardBody className="mb-3">
                                                        <Row style={{ paddingBottom: '10px', paddingTop: '10px' }} >
                                                            {!deleteTags && !AddTags &&

                                                                <span style={{ marginLeft: "82%" }}>
                                                                    <button
                                                                        type="button"
                                                                        className="btn formButton mr-3"
                                                                        onClick={() => this.setState({ deleteTags: true })}
                                                                    >
                                                                        <i className="fa fa-trash" aria-hidden="true"></i> {" "}
                                                                            Select to Delete
                                                                    </button>

                                                                    <AntButton
                                                                        className="mb-1 pointer dashboard-button gridAdd" shape="circle"
                                                                        icon="plus" ghost
                                                                        disabled={isClicked ? true : false}
                                                                        onClick={() => this.setState({ AddTags: true })}
                                                                    />
                                                                </span>
                                                            }
                                                        </Row>

                                                        {TagCollapse ? <div>

                                                            <Row>
                                                                {tags && tags.length ?
                                                                    tags.map(tag => {

                                                                        return <Col sm={2} className="mt-2">

                                                                            <input
                                                                                onChange={(e) => this.handleClick('', tag, e, 'SelectedTags')}
                                                                                type="checkbox"
                                                                                id={tag._id}
                                                                                disabled={tag.isGlobal && deleteTags}
                                                                                checked={deleteTags ? tag.toDelete : tag.checked}
                                                                            />

                                                                            <span className="ml-1 blckClr">{tag.name} </span>
                                                                        </Col>
                                                                    }) : null}
                                                            </Row>
                                                        </div> : null}
                                                        {AddTags ?
                                                            <div>
                                                                <BookmarkTag
                                                                    onCancel={CancelAddBookTag.bind(this)}
                                                                    saveTags={saveTags.bind(this)}
                                                                    type="tags"
                                                                />
                                                            </div>
                                                            : null}
                                                        {deleteTags &&
                                                            <span className="floatRight mb-2 mt-2">

                                                                <button
                                                                    type="button"
                                                                    onClick={() => this.deleteCancel('deleteTags', "tags")}
                                                                    className="btn formButton mr-2" >
                                                                    <i className="fa fa-close" aria-hidden="true" ></i> Cancel
                                                                </button>

                                                                <button
                                                                    type="button"
                                                                    onClick={() => this.deleteSelectedOptions('tags', 'Tag')}
                                                                    className="btn formButton" >
                                                                    <i className="fa fa-trash mr-1" aria-hidden="true" ></i>
                                                                    Delete Selected
                                                                 </button>
                                                            </span>}
                                                    </CardBody>
                                                </Collapse>
                                            </Card>

                                            {/* <Card style={{ marginBottom: '1rem' }} key={true} className="SmartDeviceCard" >
                                                <CardHeader className="pointer" onClick={() => this.toggleAccodion('TagCollapse')} data-event={true} >
                                                    Camera Tags
                                                    {TagCollapse ?
                                                        <i className="fa fa-angle-up floatRight" />
                                                        :
                                                        <i className="fa fa-angle-down floatRight" />
                                                    }
                                                </CardHeader>

                                                <Collapse isOpen={TagCollapse} >
                                                    <CardBody className="mb-3" >
                                                        Listed out here
                                                    </CardBody>
                                                </Collapse>
                                            </Card> */}
                                        </div>
                                        <div>
                                            {DelCollapse && !PlusCollapse && !deleteTags && !AddTags &&
                                                <button type="submit" className="btn formButton floatRight mb-2 mr-3" > <i className="fa fa-save" aria-hidden="true"></i> {" "}  Save {ShowSubmit ? ' & Submit' : null} </button>
                                            }
                                        </div>
                                    </form>
                                </Col>
                            </Row>
                        );
                    }.bind(this)}
                </Formik>
            </div >
        )
    }
}

ClientSettings.contextTypes = {
    router: PropTypes.object.isRequired
};

function mapStateToProps(state, ownProps) {

    return {
        initialValues: state.clientData.data || {},
        clientData: state.clientData,
        SmartDeviceData: state.getSmartDevice,
        WidgetsAndReportsData: state.getWidgetsAndReports,
        clientSystemSettings: state.clientSystemSettings,
        globalWidgetsReports: state.globalWidgetsReports,
        bookmarkTypeClient: state.bookmarkTypeClient,
        cameraTags: state.cameraTags,
        // getCombos: state.getCombos
    };
}

var ClientFormModule = connect(mapStateToProps)(ClientSettings);
export default ClientFormModule;
