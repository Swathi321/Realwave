import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { FormGroup, Label, Row, Col, Input } from 'reactstrap';
import { connect } from 'react-redux';
import CardWrapper from './../../component/CardWrapper';
import { saveFace, getFace, deleteFace, getUploadedFaces, saveActivityLog } from './../../redux/actions/httpRequest';
import swal from 'sweetalert';
import Util from '../../../src/Util/Util';
import LoadingDialog from './../../component/LoadingDialog';
import moment from 'moment';
import utils from '../../../src/Util/Util';
import Modal from 'react-modal';
import ReactCrop from 'react-image-crop';
import "react-image-crop/dist/ReactCrop.css";
import consts from '../../../src/Util/consts';

const customStyles = {
    btnStyle: {
        marginLeft: 5
    },
    content: {
        top: '50%',
        left: '50%',
        right: 'auto',
        bottom: 'auto',
        marginRight: '-5%',
        transform: 'translate(-50%, -50%)'
    }
};

class AddFace extends Component {
    constructor(props) {
        super(props);
        this.state = {
            canvas: '',
            cropped: false,
            file: '',
            imagePreviewUrl: '',
            croppedImageUrl: null,
            form: {
                Name: '',
                Images: [],
                Files: '',
                id: '0'
            },
            crop: {
                aspect: 1,
                width: 50,
                x: 0,
                y: 0,
            },
            modalIsOpen: false
        };
    }

    openModal = (file) => {
        this.targetFileName = file.name;
        this.setState({ modalIsOpen: true });
    }

    closeModal = () => {
        this.setState({ modalIsOpen: false });
    }

    componentWillReceiveProps(nextProps) {
        let me = this;
        if ((nextProps.saveFace && nextProps.saveFace !== this.props.saveFace)) {
            let { data, isFetching, error } = nextProps.saveFace;
            let title = "", text = "", icon = "";
            if (!isFetching) {
                if (error || data && data.errmsg) {
                    title = "Error";
                    text = error || data.errmsg;
                    icon = "error";
                } else {
                    let id = this.state.form.id;
                    if (id !== "0") {
                        me.props.dispatch(getFace.request({ action: 'load' }, id));
                    }
                    else {
                        me.props.toggle(this.props.scope)
                    }
                    me.props.dispatch(getUploadedFaces.request({}));
                    title = "Success";
                    text = "Face Uploaded Successfully";
                    icon = "success";
                }
                this.setState({
                    file: null,
                    imagePreviewUrl: null

                })
                swal({ title, text, icon });
            }
        }

        if ((nextProps.getFace && !nextProps.getFace.isFetching && nextProps.getFace !== this.props.getFace)) {
            let { data, isFetching, error } = nextProps.getFace;
            if (!isFetching) {
                if (error || data && data.errmsg) {
                    swal({ title: "Error", text: error || data.errmsg, icon: "error", });
                    return;
                } else {
                    var filesArr = [];
                    if (data.Files && data.Files.length > 0) {
                        var files = data.Files || '';
                        filesArr = files.split(',').filter(String);
                    }
                    let formObj = Object.assign({}, this.state.form);
                    formObj.Name = data.Name || "";
                    formObj.Images = filesArr;
                    formObj.id = data._id || '0';
                    formObj.Files = data.Files || "";
                    this.setState({
                        form: formObj
                    })
                }
            }

        }

        if ((nextProps.deleteFace && nextProps.deleteFace !== this.props.deleteFace)) {

            let { data, isFetching, error } = nextProps.deleteFace;
            let title = "", text = "", icon = "";
            if (!isFetching) {
                if (error || data && data.errmsg) {
                    title = "Error";
                    text = error || data.errmsg;
                    icon = "error";
                } else {

                    title = "Success";
                    text = "Face Deleted Successfully";
                    icon = "success";
                }
                data = data.data;
                var filesArr = [];
                if (data.Files && data.Files.length > 0) {
                    var files = data.Files || '';
                    filesArr = files.split(',').filter(String);
                }
                let formObj = Object.assign({}, this.state.form);
                formObj.Name = data.Name || "";
                formObj.Images = filesArr;
                formObj.id = data._id || '0';
                formObj.Files = data.Files || "";
                this.setState({
                    form: formObj
                })
                me.props.dispatch(getUploadedFaces.request({}));
                swal({ title, text, icon });
            }
        }

    }

    handleSubmit = (e) => {
        e.preventDefault();
        let { form, file } = this.state;
        if (!form.Name || !file) {
            let msg = form.Name ? "Please choose file" : "Please Enter Name";
            swal({ title: "Error", text: msg });
            return;
        }
        let loggedData;
        let imageName = form.Name.trim().replace(/[^A-Z0-9]/ig, "_");
        let id = this.state.form.id;
        if (id === "0") {
            loggedData = utils.getScreenDetails(utils.getLoggedUser(), this.props.scope.props.location, consts.Added + ' - ' + imageName);
            this.props.dispatch(saveActivityLog.request({ action: 'save', data: loggedData }));
            this.props.dispatch(saveFace.request({ action: 'save', data: { Name: imageName, Files: form.Files }, file: file }, id));
        } else {
            loggedData = utils.getScreenDetails(utils.getLoggedUser(), this.props.scope.props.location, consts.Update + ' - ' + imageName);
            this.props.dispatch(saveActivityLog.request({ action: 'save', data: loggedData }));
            this.props.dispatch(saveFace.request({ action: 'update', data: { Name: imageName, Files: form.Files }, file: file }, id));
        }
    }

    handleChange = (e) => {
        let fieldId = e.target.id;
        let value = e.target.value;
        let objForm = Object.assign(this.state.form);
        if (fieldId == "name") {
            objForm.Name = value
        }
        this.setState({ form: objForm });
    }

    onCancel = (e) => {
        this.props.toggle(this.props.scope)
    }

    handleImageChange(e) {
        e.preventDefault();
        let reader = new FileReader();
        if (e.target.files.length > 0) {
            let file = e.target.files[0];
            if (/\.(jpe?g|png)$/i.test(file.name) === false) {
                swal({ title: "Error", text: "Only PNG and JPEG/JPG are allowed." });
                return;
            }

            if (file.size > 5242880) {
                swal({ title: "Error", text: "Image size exceeds 5 MB." });
                return;
            }
            reader.onloadend = () => {
                this.setState({
                    file: file,
                    imagePreviewUrl: reader.result,
                    cropped: false
                });
            }
            reader.readAsDataURL(file);
            this.openModal(file);
        }
    }

    getImage(item) {
        return Util.serverUrl + "/api/facesThumbnail/" + this.state.form.id + "/" + item
    }

    getDateTime(item) {
        var date = "";
        date = item.substr(item.lastIndexOf("_") + 1);
        date = date.substr(0, date.lastIndexOf("."));
        return moment(Number(date)).format(utils.dateTimeFormatAmPm);
    }

    onDelete(item) {
        let me = this;
        swal({
            title: "Are you sure?",
            text: "You will not be able to recover this face!",
            icon: "warning",
            buttons: true,
            dangerMode: true,
        }).then((willDelete) => {
            if (willDelete) {
                let { Images, id, Name, Files } = me.state.form
                if (Images.length > 0) {
                    let loggedData = utils.getScreenDetails(utils.getLoggedUser(), this.props.scope.props.location, consts.Delete + ' - ' + Files);
                    me.props.dispatch(saveActivityLog.request({ action: 'save', data: loggedData }));
                    me.props.dispatch(deleteFace.request({ action: 'imageDelete', fileName: item, data: { Name: Name, Files: Files } }, id));
                }
            }
        });
    }

    onImageLoaded = (image) => {
        this.imageRef = image;
    };

    onCropComplete = (crop, pixelCrop) => {
        this.makeClientCrop(crop, pixelCrop);
    };

    onCropChange = crop => {
        this.setState({ crop });
    };

    async makeClientCrop(crop, pixelCrop) {
        if (this.imageRef && crop.width && crop.height) {
            const croppedImageUrl = await this.getCroppedImg(
                this.imageRef,
                pixelCrop,
                this.targetFileName ? this.targetFileName : "sample.jpeg"
            );
            this.setState({ croppedImageUrl: croppedImageUrl });
        }
    }


    getCroppedImg(image, pixelCrop, fileName) {
        //Creating a canvas element to create a cropped image on it
        const canvas = document.createElement('canvas');
        canvas.setAttribute("id", "canvasImage");
        canvas.width = pixelCrop.width;
        canvas.height = pixelCrop.height;
        const ctx = canvas.getContext('2d');
        this.setState({ canvas: canvas });
        ctx.drawImage(
            image,
            pixelCrop.x,
            pixelCrop.y,
            pixelCrop.width,
            pixelCrop.height,
            0,
            0,
            pixelCrop.width,
            pixelCrop.height
        );

        return new Promise((resolve, reject) => {
            canvas.toBlob(blob => {
                if (!blob) {
                    //reject(new Error('Canvas is empty'));
                    console.error('Canvas is empty');
                    return;
                }
                blob.name = fileName;
                window.URL.revokeObjectURL(this.fileUrl);
                this.fileUrl = window.URL.createObjectURL(blob);
                resolve(this.fileUrl);
            }, 'image/jpeg');
        });
    }

    //on Crop Image we are changing Canvas => Base64 => Binary to create image file
    cropImage = () => {
        let { canvas, croppedImageUrl, file } = this.state;
        let canvasFile = this.dataURItoBlob(canvas.toDataURL());
        canvasFile.name = file.name;
        canvasFile.lastModified = file.lastModified;
        canvasFile.lastModifiedDate = file.lastModifiedDate;
        this.setState({ cropped: true, modalIsOpen: false, imagePreviewUrl: croppedImageUrl, file: canvasFile });
    }

    dataURItoBlob(dataURI) {
        // convert base64/URLEncoded data component to raw binary data held in a string
        let byteString;
        let dataURIContent = dataURI.split(',');
        if (dataURIContent && dataURIContent[0].indexOf('base64') >= 0)
            byteString = atob(dataURIContent[1]);
        else
            byteString = unescape(dataURIContent[1]);
        // separate out the mime component
        let mimeString = dataURIContent[0].split(':')[1].split(';')[0];
        // write the bytes of the string to a typed array
        let byteStringLength = byteString.length;
        let ia = new Uint8Array(byteStringLength);
        for (var i = 0; i < byteStringLength; i++) {
            ia[i] = byteString.charCodeAt(i);
        }
        return new Blob([ia], { type: mimeString });
    }

    render() {
        let { imagePreviewUrl, form, crop, croppedImageUrl, cropped } = this.state;
        const { isFetching } = this.props.saveFace;
        let imageListLength = form.Images.length;
        let images = [];
        if (imageListLength > 0) {
            for (let i = imageListLength - 1; i >= 0; i--) {
                images.push(form.Images[i]);
            }
        }
        // let images = form.Images;
        let imagePreview = null;
        if (imagePreviewUrl) {
            imagePreview = (<img src={cropped ? croppedImageUrl : imagePreviewUrl} />);
        }
        let iOS = utils.isIOS(); //window.navigator.userAgent.match(/iPad|iPhone|iPod/);
        return (
            <div>
                {/* To do - Need to use reactstrap Model */}
                <Modal
                    isOpen={this.state.modalIsOpen}
                    onRequestClose={() => this.closeModal()}
                    style={customStyles}
                >
                    <div>
                        {imagePreviewUrl && (
                            <ReactCrop
                                src={imagePreviewUrl}
                                crop={crop}
                                onImageLoaded={this.onImageLoaded}
                                onComplete={this.onCropComplete}
                                onChange={this.onCropChange}
                            />
                        )}
                    </div>
                    <div className={'form-button-group'}>
                        <button className="btn formButton" onClick={() => this.cropImage()}><i className="fa fa-crop" aria-hidden="true"></i> Crop</button>
                        <button className="btn formButton" style={customStyles.btnStyle} onClick={() => this.closeModal()}><i className="fa fa-close" aria-hidden="true"></i> Cancel</button>
                    </div>

                </Modal>
                <LoadingDialog isOpen={isFetching} />
                <Row>
                    <Col md={12}>
                        <form onSubmit={(e) => this.handleSubmit(e)}>
                            <CardWrapper lg={12} title={"Add Face"} footer={
                                !iOS ? <div className={'form-button-group'}>
                                    <div><button type="submit" className="btn formButton"><i className="fa fa-save" aria-hidden="true"></i> Save</button></div>
                                    <div> <button type="button" className="btn formButton" onClick={(e) => this.onCancel(e)}><i className="fa fa-close" aria-hidden="true"></i> Cancel</button></div>
                                </div> : null
                            }>
                                {form.id !== "0" && <FormGroup row>
                                    <Label htmlFor="id" sm={2} className="formFields">Id</Label>
                                    <Col sm={8} xs={10}>
                                        <Input
                                            disabled={true}
                                            value={form.id}
                                            type="text"
                                            className="form-control"
                                            maxLength={100}
                                        />
                                    </Col>
                                </FormGroup>
                                }
                                <FormGroup row>
                                    <Label htmlFor="Name" sm={2} className="formFields">Name</Label>
                                    <Col sm={8} xs={10}>
                                        <Input
                                            id="name"
                                            placeholder="Enter Name"
                                            type="text"
                                            value={form.Name}
                                            onChange={(e) => this.handleChange(e)}
                                            className="form-control"
                                            disabled={form.id !== "0"}
                                            maxLength={50}
                                        />
                                    </Col>
                                </FormGroup>
                                {!iOS ?
                                    <div><FormGroup row>
                                        <Label sm={2}>File</Label>
                                        <Col sm={8} xs={10}>
                                            <label htmlFor="file" className="custom-file-upload choose-file"><i className="fa fa-file" aria-hidden="true"></i> Browse</label>
                                            <input name="file" id="file" type="file" onChange={(e) => this.handleImageChange(e)} onClick={(event) => { event.target.value = null }} />
                                            <label htmlFor="fileInfo" style={{ color: "red" }}>Note - Only PNG and JPEG/JPG are allowed and size must be 5 MB or below.</label>
                                        </Col>
                                    </FormGroup>
                                        <FormGroup row>
                                            <Label sm={2}>Preview</Label>
                                            <Col sm={6} xs={6}>
                                                {imagePreview ?
                                                    <div className="imgPreview">
                                                        {imagePreview}
                                                    </div> : <i className="fa fa-camera fa-2x"></i>
                                                }
                                            </Col>
                                        </FormGroup>
                                    </div> : null}
                            </CardWrapper>
                        </form>
                    </Col>
                </Row>
                {
                    images && images.length > 0 &&
                    <Row>
                        <Col md="12">
                            <CardWrapper lg={12} title={"Available Faces"}>
                                <Row>
                                    {images && images.map(function (item, index) {
                                        return (
                                            <div className="col-lg-4 col-md-12 col-sm-12 col-xs-12" key={index}>
                                                <div className="card">
                                                    <span className="trash" onClick={() => this.onDelete(item)}><i className="fa fa-trash fa-2x"></i></span>
                                                    <a className="lightbox" href={this.getImage(item)} target="_blank">
                                                        <div className="thumbnailSmall" style={{ backgroundImage: `url(${this.getImage(item)})` }}> </div>
                                                    </a>
                                                    <div className="caption" style={{ textAlign: "center" }}>
                                                        <b>{this.getDateTime(item)}</b>
                                                    </div>
                                                </div>
                                            </div>
                                        )
                                    }, this)}
                                </Row>
                            </CardWrapper>
                        </Col>
                    </Row>
                }

            </div>
        );
    }
}

AddFace.contextTypes = {
    router: PropTypes.object.isRequired
};

function mapStateToProps(state, ownProps) {
    return {
        saveFace: state.saveFace,
        getFace: state.getFace,
        deleteFace: state.deleteFace,
        getUploadedFaces: getUploadedFaces
    };
}

var AddFaceModule = connect(mapStateToProps)(AddFace);
export default AddFaceModule;