import React, { PureComponent } from 'react';
import {
	Button,
	Col,
  Collapse,
  CardBody,
	Card,
	CardHeader,
  FormGroup,
  Input,
  Modal,
  ModalBody,
  ModalFooter,
  ModalHeader,
} from "reactstrap";
import utils from "./../../Util/Util";
import moment from "moment";
import Select from "react-select";
import swal from "sweetalert";
import TimezonePicker from "react-timezone";
import { Tooltip } from "antd";
import TreeStore from "./TreeStore";
import LoadingDialog from "./../../component/LoadingDialog";
import { cloneDeep, clone } from 'lodash';
import "react-tagsinput/react-tagsinput.css";
import "../User/styles.scss";
import "./store.scss";

const TooltipContent = () => {
  return (
    <>
      <div>
        <span>
          1. <b>For Add Camera - </b>
        </span>
        Click on particular camera in the available camera list.
      </div>
      <div>
        <span>
          2. <b>For Remove Camera - </b>
        </span>
        Click on already added camera which is highlighted in the available
        camera list.
      </div>
      <div>
        <span>
          3. <b>For Save Map - </b>
        </span>
        Click on save.
      </div>
      <div>
        <span>
          4. <b>For Edit Map - </b>
        </span>
        Double click On preview image.
      </div>
    </>
  );
};

export class BasicInfoCollapse extends PureComponent {
  constructor(props) {
		super(props);
		this.state = {
			addressLine1: clone(props.addressLine1),
			addressLine2: clone(props.addressLine2),
			city: clone(props.city),
			collapseOpen: props.item && clone(props.item.status),
			country: clone(props.country),
			file: clone(props.file),
      imageName: clone(props.imageName),
      imagePreviewUrl: clone(props.imagePreviewUrl),
			isLoading: false,
			latitude: clone(props.latitude),
			latitudeErr: clone(props.latitudeErr),
			longitude: clone(props.longitude),
			longitudeErr: clone(props.longitudeErr),
			macAddress: clone(props.macAddress),
			macAddressError: clone(props.macAddressError),
			mapImage: clone(props.mapImage),
			modal: false,
			notifysStatus: clone(props.notifysStatus),
			openLoader: false,
			originalImage: clone(props.originalImage),
			RegionErr: clone(props.RegionErr),
			selectedRegion: clone(props.selectedRegion),
      selectedValues: clone(props.selectedValues),
			SerialKeyError: false,
			showTree: false,
			siteErrorLogLevel: clone(props.siteErrorLogLevel),
			siteErrorLogLevelOption: clone(props.siteErrorLogLevelOption),
			siteLogLevelError: clone(props.siteLogLevelError),
			siteName: clone(props.siteName),
			siteNotes: clone(props.siteNotes),
			siteNameErr: clone(props.siteNameErr),
			siteStreamConfig: clone(props.siteStreamConfig),
			siteStreamConfigError: clone(props.siteStreamConfigError),
			stateC: clone(props.stateC),
			timezoneValue: clone(props.timezoneValue),
			timeZoneErr: clone(props.timeZoneErr),
			zipCode: clone(props.zipCode),
			zipcodeErr: clone(props.zipcodeErr),
		}
		this.alreadyclicked = false;
    this.alreadyclickedTimeout = null;
    // utils.bindContext(memberFunctions, this);
    this.wsCloseRequest = false;
    this.ws = null;
    this.mouseIsDown = false;
    this.lastX = 0;
    this.lastY = 0;
    this.circles = [];
    this.offsetX = 0;
    this.offsetY = 0;
    this.canvas = null;
    this.ctx = null;
    this.canvasWidth = 0;
    this.canvasHeight = 0;
    this.count = 0;
	}

	componentDidUpdate(prevProps, prevState) {
		const {
			addressLine1,
			addressLine2,
			city,
			country,
			file,
			item,
      imagePreviewUrl,
			latitude,
			latitudeErr,
			longitude,
			longitudeErr,
			macAddress,
			macAddressError,
			mapImage,
			notifysStatus,
			originalImage,
			RegionErr,
			selectedRegion,
			siteErrorLogLevel,
			siteErrorLogLevelOption,
			siteLogLevelError,
			siteName,
			siteNameErr,
			siteStreamConfigError,
			sitesNotes,
			stateC,
			timezoneValue,
			timeZoneErr,
			zipCode,
			zipcodeErr,
			imageName
		} = this.props;

		if (item && item.status && item.status !== prevProps.item.status) {
			this.setState({
				collapseOpen: item.status
			})
		}
		if (siteName && siteName.length > 0 && siteName !== prevProps.siteName) {
			this.setState({
				siteName: siteName
			})
		}
		if (addressLine1 && addressLine1.length > 0 && addressLine1 !== prevProps.addressLine1) {
			this.setState({
				addressLine1: addressLine1
			})
		}
		if (addressLine2 && addressLine2.length > 0 && addressLine2 !== prevProps.addressLine2) {
			this.setState({
				addressLine2: addressLine2
			})
		}
		if (city && city.length > 0 && city !== prevProps.city) {
			this.setState({
				city: city
			})
		}
		if (country && country.length > 0 && country !== prevProps.country) {
			this.setState({
				country: country
			})
		}
		if (file && file !== prevProps.file) {
			this.setState({
				file: file
			})
		}
		if (imageName && imageName !== prevProps.imageName) {
			this.setState({
				imageName: imageName
			})
		}
		if (imagePreviewUrl && imagePreviewUrl !== prevProps.imagePreviewUrl) {
			this.setState({
				imagePreviewUrl: imagePreviewUrl
			})
		}
		if (latitude && latitude.length > 0 && latitude !== prevProps.latitude) {
			this.setState({
				latitude: latitude
			})
		}
		if (latitudeErr && latitudeErr !== prevProps.latitudeErr) {
			this.setState({
				latitudeErr: latitudeErr
			})
		}
		if (longitude && longitude.length > 0 && longitude !== prevProps.longitude) {
			this.setState({
				longitude: longitude
			})
		}
		if (longitudeErr && longitudeErr !== prevProps.longitudeErr) {
			this.setState({
				longitudeErr: longitudeErr
			})
		}
		if (macAddress && macAddress.length > 0 && macAddress !== prevProps.macAddress) {
			this.setState({
				macAddress: macAddress
			})
		}
		if (macAddressError && macAddressError !== prevProps.macAddressError) {
			this.setState({
				macAddressError: macAddressError
			})
		}
		if (mapImage && mapImage !== prevProps.mapImage) {
			this.setState({
				mapImage: mapImage
			})
		}
		if (originalImage && originalImage !== prevProps.originalImage) {
			this.setState({
				originalImage: originalImage
			})
		}
		if (notifysStatus && notifysStatus !== prevProps.notifysStatus) {
			this.setState({
				notifysStatus: notifysStatus,
				isLoading: false,
			})
		}
		if (RegionErr && RegionErr !== prevProps.RegionErr) {
			this.setState({
				RegionErr: RegionErr
			})
		}
		if (selectedRegion && selectedRegion.length > 0 && selectedRegion !== prevProps.selectedRegion) {
			this.setState({
				selectedRegion: selectedRegion
			})
		}
		if (siteLogLevelError && siteLogLevelError !== prevProps.siteLogLevelError) {
			this.setState({
				siteLogLevelError: siteLogLevelError
			})
		}
		if (siteErrorLogLevel && siteErrorLogLevel.length > 0 && siteErrorLogLevel !== prevProps.siteErrorLogLevel) {
			this.setState({
				siteErrorLogLevel: siteErrorLogLevel
			})
		}
		if (siteErrorLogLevelOption && siteErrorLogLevelOption.length > 0 &&siteErrorLogLevelOption !== prevProps.siteErrorLogLevelOption) {
			this.setState({
				siteErrorLogLevelOption: siteErrorLogLevelOption
			})
		}
		if (sitesNotes && sitesNotes !== prevProps.sitesNotes) {
			this.setState({
				sitesNotes: sitesNotes
			})
		}
		if (siteNameErr && siteNameErr !== prevProps.siteNameErr) {
			this.setState({
				siteNameErr: siteNameErr
			})
		}
		if (siteStreamConfigError && siteStreamConfigError !== prevProps.siteStreamConfigError) {
			this.setState({
				siteStreamConfigError: siteStreamConfigError
			})
		}
		if (stateC && stateC.length > 0 && stateC !== prevProps.stateC) {
			this.setState({
				stateC: stateC
			})
		}
		if (timezoneValue && timezoneValue !== prevProps.timezoneValue) {
			this.setState({
				timezoneValue: timezoneValue
			})
		}
		if (timeZoneErr && timeZoneErr !== prevProps.timeZoneErr) {
			this.setState({
				timeZoneErr: timeZoneErr
			})
		}
		if (zipCode && zipCode.length > 0 && zipCode !== prevProps.zipCode) {
			this.setState({
				zipCode: zipCode
			})
		}
		if (zipcodeErr && zipcodeErr !== prevProps.zipcodeErr) {
			this.setState({
				zipcodeErr: zipcodeErr
			})
		}
	}

	componentWillReceiveProps(nextProps) {
		const {
			addressLine1,
			addressLine2,
			city,
			country,
			file,
			item,
      imagePreviewUrl,
			latitude,
			latitudeErr,
			longitude,
			longitudeErr,
			macAddress,
			macAddressError,
			mapImage,
			notifysStatus,
			originalImage,
			RegionErr,
			selectedRegion,
			siteErrorLogLevel,
			siteErrorLogLevelOption,
			siteLogLevelError,
			siteName,
			siteNameErr,
			siteStreamConfigError,
			sitesNotes,
			stateC,
			timezoneValue,
			timeZoneErr,
			zipCode,
			zipcodeErr,
			imageName
		} = nextProps;

		if (item && item.status && item.status !== this.state.collapseOpen) {
			this.setState({
				collapseOpen: item.status
			})
		}
		if (siteName && siteName.length > 0 && siteName !== this.state.siteName) {
			this.setState({
				siteName: siteName
			})
		}
		if (addressLine1 && addressLine1.length > 0 && addressLine1 !== this.state.addressLine1) {
			this.setState({
				addressLine1: addressLine1
			})
		}
		if (addressLine2 && addressLine2.length > 0 && addressLine2 !== this.state.addressLine2) {
			this.setState({
				addressLine2: addressLine2
			})
		}
		if (city && city.length > 0 && city !== this.state.city) {
			this.setState({
				city: city
			})
		}
		if (country && country.length > 0 && country !== this.state.country) {
			this.setState({
				country: country
			})
		}
		if (file && file !== this.state.file) {
			this.setState({
				file: file
			})
		}
		if (imageName && imageName !== this.state.imageName) {
			this.setState({
				imageName: imageName
			})
		}
		if (imagePreviewUrl && imagePreviewUrl !== this.state.imagePreviewUrl) {
			this.setState({
				imagePreviewUrl: imagePreviewUrl
			})
		}
		if (latitude && latitude.length > 0 && latitude !== this.state.latitude) {
			this.setState({
				latitude: latitude
			})
		}
		if (latitudeErr && latitudeErr !== this.state.latitudeErr) {
			this.setState({
				latitudeErr: latitudeErr
			})
		}
		if (longitude && longitude.length > 0 && longitude !== this.state.longitude) {
			this.setState({
				longitude: longitude
			})
		}
		if (longitudeErr && longitudeErr !== this.state.longitudeErr) {
			this.setState({
				longitudeErr: longitudeErr
			})
		}
		if (macAddress && macAddress.length > 0 && macAddress !== this.state.macAddress) {
			this.setState({
				macAddress: macAddress
			})
		}
		if (macAddressError && macAddressError !== this.state.macAddressError) {
			this.setState({
				macAddressError: macAddressError
			})
		}
		if (mapImage && mapImage !== this.state.mapImage) {
			this.setState({
				mapImage: mapImage
			})
		}
		if (originalImage && originalImage !== this.state.originalImage) {
			this.setState({
				originalImage: originalImage
			})
		}
		if (notifysStatus && notifysStatus !== this.state.notifysStatus) {
			this.setState({
				notifysStatus: notifysStatus,
				isLoading: false,
			})
		}
		if (RegionErr && RegionErr !== this.state.RegionErr) {
			this.setState({
				RegionErr: RegionErr
			})
		}
		if (selectedRegion && selectedRegion.length > 0 && selectedRegion !== this.state.selectedRegion) {
			this.setState({
				selectedRegion: selectedRegion
			})
		}
		if (siteLogLevelError && siteLogLevelError !== this.state.siteLogLevelError) {
			this.setState({
				siteLogLevelError: siteLogLevelError
			})
		}
		if (siteErrorLogLevel && siteErrorLogLevel.length > 0 && siteErrorLogLevel !== this.state.siteErrorLogLevel) {
			this.setState({
				siteErrorLogLevel: siteErrorLogLevel
			})
		}
		if (siteErrorLogLevelOption && siteErrorLogLevelOption.length > 0 &&siteErrorLogLevelOption !== this.state.siteErrorLogLevelOption) {
			this.setState({
				siteErrorLogLevelOption: siteErrorLogLevelOption
			})
		}
		if (sitesNotes && sitesNotes !== this.state.sitesNotes) {
			this.setState({
				sitesNotes: sitesNotes
			})
		}
		if (siteNameErr && siteNameErr !== this.state.siteNameErr) {
			this.setState({
				siteNameErr: siteNameErr
			})
		}
		if (siteStreamConfigError && siteStreamConfigError !== this.state.siteStreamConfigError) {
			this.setState({
				siteStreamConfigError: siteStreamConfigError
			})
		}
		if (stateC && stateC.length > 0 && stateC !== this.state.stateC) {
			this.setState({
				stateC: stateC
			})
		}
		if (timezoneValue && timezoneValue !== this.state.timezoneValue) {
			this.setState({
				timezoneValue: timezoneValue
			})
		}
		if (timeZoneErr && timeZoneErr !== this.state.timeZoneErr) {
			this.setState({
				timeZoneErr: timeZoneErr
			})
		}
		if (zipCode && zipCode.length > 0 && zipCode !== this.state.zipCode) {
			this.setState({
				zipCode: zipCode
			})
		}
		if (zipcodeErr && zipcodeErr !== this.state.zipcodeErr) {
			this.setState({
				zipcodeErr: zipcodeErr
			})
		}
	}

	editMap = () => {
    if (this.alreadyclicked) {
      this.alreadyclicked = false;
      this.alreadyclickedTimeout && clearTimeout(this.alreadyclickedTimeout);

      let { cameraCoordinates, originalImage, selectedValues } = this.state;
      let mapImage = null;
      if (!originalImage) {
        let { storeData } = this.props;
        if (storeData.data && storeData.data.cameraCoordinates) {
          mapImage = this.setMap(storeData.data.map);
        }
      }
      if (mapImage && cameraCoordinates.length == 0) {
        let { storeData, cameraData } = this.props,
          data = cameraData && cameraData.data,
          camera = data && data.data,
          activeCameraIds = [],
          newCameraCoordinate = [];

        camera &&
          Array.isArray(camera) &&
          camera.forEach((el) => {
            if (el.status == utils.cameraStatus.Active) {
              activeCameraIds.push({ id: el._id });
            }
          });

        activeCameraIds &&
          activeCameraIds.length > 0 &&
          activeCameraIds.map((el) => {
            storeData.data.cameraCoordinates.filter((element) => {
              if (element.camId == el.id) {
                newCameraCoordinate.push(element);
              }
            });
          });

        newCameraCoordinate &&
          newCameraCoordinate.length > 0 &&
          newCameraCoordinate.map((element) => {
            this.circles.push(element);
            selectedValues.push({
              label: element.cameraData.name,
              value: element.cameraData._id,
            });
          });
      } else {
        cameraCoordinates &&
          cameraCoordinates.map((element) => {
            this.circles.push(element);
            selectedValues.push({
              label: element.cameraData.name,
              value: element.cameraData._id,
            });
          });
      }

      this.setState(
        (prevState) => ({
          modal: !prevState.modal,
          selectedValues: selectedValues,
          openLoader: true,
        }),
        () =>
          setTimeout(() => {
            this.updateCanvas(this.circles, true);
          }, 500)
      );
    } else {
      this.alreadyclicked = true;
      this.alreadyclickedTimeout = setTimeout(() => {
        this.alreadyclicked = false;
      }, 300);
    }
  };

	handleMouseDown = (e) => {
    // tell the browser we're handling this mouse event
    e.preventDefault();
    e.stopPropagation();
    let mouseX = parseInt(e.clientX - this.offsetX);
    let mouseY = parseInt(e.clientY - this.offsetY);

    // mousedown stuff here
    this.lastX = mouseX;
    this.lastY = mouseY;
    for (var i = 0; i < this.circles.length; i++) {
      var circle = this.circles[i];
      var dx = circle.x - mouseX;
      var dy = circle.y - mouseY;
      if (dx * dx + dy * dy < circle.r * circle.r) {
        this.circles[i].isDragging = true;
        this.mouseIsDown = true;
      }
    }
  };

  handleMouseUp = (e) => {
    // tell the browser we're handling this mouse event
    e.preventDefault();
    e.stopPropagation();

    // mouseup stuff here
    this.mouseIsDown = false;
    for (var i = 0; i < this.circles.length; i++) {
      this.circles[i].isDragging = false;
    }
  };

  handleMouseMove = (e) => {
    if (!this.mouseIsDown) {
      return;
    }
    // tell the browser we're handling this mouse event
    e.preventDefault();
    e.stopPropagation();

    let mouseX = parseInt(e.clientX - this.offsetX);
    let mouseY = parseInt(e.clientY - this.offsetY);

    if (
      mouseY < this.centerShift_y + 18 ||
      mouseY > this.canvasHeight - (this.centerShift_y + 18)
    ) {
      return;
    }
    if (
      mouseX < this.centerShift_x + 18 ||
      mouseX > this.canvasWidth - (this.centerShift_x + 18)
    ) {
      return;
    }
    // mousemove stuff here
    for (var i = 0; i < this.circles.length; i++) {
      var circle = this.circles[i];
      if (circle.isDragging) {
        //move
        circle.x = mouseX;
        circle.y = mouseY;
      }
    }
    this.lastX = mouseX;
    this.lastY = mouseY;
    this.updateCanvas(this.circles);
  };

	saveMap = () => {
    let base64CanvasImage = this.canvas.toDataURL();
    this.setState(
      {
        cameraCoordinates: this.circles,
        imagePreviewUrl: base64CanvasImage,
      },
      () => {
        this.toggle();
				this.props.saveMap(base64CanvasImage, this.circles);
      }
    );
  };

	removeEvents = (canvas) => {
    var me = this;
    this.eventAdded = false;
    canvas.removeEventListener("mousedown", function (e) {
      me.handleMouseDown(e);
    });

    canvas.removeEventListener("mouseup", function (e) {
      me.handleMouseUp(e);
    });
    canvas.removeEventListener("mousemove", function (e) {
      me.handleMouseMove(e);
    });
  };

  makeCircle = (x, y, fill, camera) => {
    var circle = {
      x: x,
      y: y,
      r: 20,
      isDragging: false,
      fill: fill,
      cameraData: camera,
      camId: camera._id,
    };
    this.circles.push(circle);
  };

	showTree = () => {
    if (!this.state.showTree) {
      this.setState({ showTree: true });
    }
  };

	onSelectCamera = (selectedValues) => {
    const oldSelectedValues = cloneDeep(this.state.selectedValues);

    // Get previous common values.
    let oldValues = oldSelectedValues.filter((oldValue) => {
      let index = selectedValues.findIndex((newValue) => {
        return newValue.value == oldValue.value;
      });
      return index == -1;
    });
    // Get current common values.
    let newValues = selectedValues.filter((newValue) => {
      let index = oldSelectedValues.findIndex((oldValue) => {
        return oldValue.value == newValue.value;
      });
      return index == -1;
    });

    // Merge previous and current common values.
    let updatedRecords = oldValues.concat(newValues),
      isSelectionUpdate = updatedRecords && updatedRecords.length > 0; // Check for new added or removed item.
    this.setState({ selectedValues, isApplyEnabled: isSelectionUpdate });

    if (newValues.length > 0) {
      this.setState({ newSelectedValue: newValues }, () => {
        this.addCameraToCanvas();
      });
    }
    if (oldValues.length > 0) {
      let index = this.circles.findIndex((element) => {
        return element.camId == oldValues[0].value;
      });
      if (index > -1) {
        this.circles.splice(index, 1);
      }
      this.updateCanvas(this.circles);
    }
  };

	addCameraToCanvas = () => {
    let { count, props, state } = this;
    let { cameraData } = props;
    let data = cameraData.data.data;
    let noOfCamera = data && data.length;
    let noOfCircles = this.circles.length;
    let { newSelectedValue } = state;
    let newSelectedValueindex = -1;
    if (newSelectedValue.length > 0 && data) {
      newSelectedValueindex = data.findIndex((element) => {
        return element._id == newSelectedValue[0].value;
      });
    }
    if (count >= 300) {
      this.count = 0; // for circle reset to start position
    }
    if (noOfCamera > noOfCircles && newSelectedValueindex > -1) {
      let { canvas, count, circles, makeCircle, updateCanvas } = this;

      makeCircle(20, 20 + count, "salmon", data[newSelectedValueindex]);
      updateCanvas(circles);
      this.count = count + 40;
      this.addEventsToCanvas(canvas);
    } else {
      swal({
        title: "Error",
        text: "You have already added available cameras.",
        icon: "error",
      });
    }
  };

	getCameraNames = () => {
    let data = this.props.cameraData.data;
    let camera = data && data.data;
    let cameraNames = [];
    camera &&
      Array.isArray(camera) &&
      camera.forEach((element, index) => {
        if (element.status == utils.cameraStatus.Active) {
          cameraNames.push({ label: element.name, value: element._id });
        }
      });
    return cameraNames;
  };

	handleZipCode = (event) => {
		const eventCopy = {...event}
    this.setState({ zipCode: event.target.value }, () => this.props.handleZipCode(eventCopy));
    if (isNaN(Number(event.target.value)) || event.target.value.length == 0) {
      return this.setState({ zipcodeErr: "Required" })
    }
    else {
      this.setState({ zipcodeErr: "" });
    }
  }

	handleDropChange = (stateVar, option) => {
		this.setState({ [stateVar]: option }, () => this.props.handleDropChange(stateVar, option));
    if (stateVar == "siteStreamConfig" && option) {
			this.setState({ siteStreamConfigError: false });
    } else if (stateVar == "siteStreamConfig" && !option) {
			this.setState({ siteStreamConfigError: true });
    } else {
			if (option.length) this.setState({ siteLogLevelError: false });
      else this.setState({ siteLogLevelError: true });
    }
  }

//   handleDropChange = (stateVar, option) => {
//     if(this.props.handleDropChange) {
//       this.props.handleDropChange(stateVar, option);
//       return;
//     }
//     else {
//       this.setState({ [stateVar]: option });
//       if (stateVar == "siteStreamConfig" && option) {
//         this.setState({ siteStreamConfigError: false });
//       } else if (stateVar == "siteStreamConfig" && !option) {
//         this.setState({ siteStreamConfigError: true });
//       } else {
//         if (option.length) this.setState({ siteLogLevelError: false });
//         else this.setState({ siteLogLevelError: true });
//       }
//     }
//   }

	handleTimezoneValue = (timezoneValue) => {
    this.setState({ timezoneValue }, () => this.props.handleTimezoneValue(timezoneValue));
    if (timezoneValue) this.setState({ timeZoneErr: false });
  };


	handleChange = (e, ErrorStateVar) => { 
		let name = e.target.name
		const eventCopy = {...e};
		this.setState({ [name]: e.target.value }, () => this.props.handleChange(eventCopy, ErrorStateVar));
		if (
			name === "siteName" ||
			name === "latitude" ||
			name === "longitude" 
			) {
				if (e.target.value.length == 0) {
					this.setState({ [ErrorStateVar]: "Required" });
				} else {
					this.setState({ [ErrorStateVar]: "" });
				}
			}
	}

	enableStatus = (status) => {
    this.setState({
      notifysStatus: status,
    }, () => this.props.enableStatus(status))
  }

	showRegion = (reg) => {
    
    this.setState({
      selectedRegion: reg.name,
      selectedRegionId: reg._id,
    }, () => this.props.showRegion(reg));

    if (reg.name) this.setState({ RegionErr: false });
  };

	addEventsToCanvas = (canvas) => {
    var me = this;
    if (!this.eventAdded) {
      
      this.eventAdded = true;
      canvas.addEventListener("mousedown", function (e) {
        me.handleMouseDown(e);
      });

      canvas.addEventListener("mouseup", function (e) {
        me.handleMouseUp(e);
      });
      canvas.addEventListener("mousemove", function (e) {
        me.handleMouseMove(e);
      });

      canvas.addEventListener("mouseleave", function (e) {
        this.mouseIsDown = false;
      });
    }
  };

	drawImageScaled(img, circles, isCommingFromEdit) {
    this.setState({ openLoader: false });
    let { ctx } = this;

    var canvas = ctx.canvas;
    this.offsetX = canvas.getBoundingClientRect().left;
    this.offsetY = canvas.getBoundingClientRect().top;
    this.canvasWidth = canvas.width;
    this.canvasHeight = canvas.height;
    var hRatio = canvas.width / img.width;
    var vRatio = canvas.height / img.height;
    var ratio = Math.min(hRatio, vRatio);
    var centerShift_x = (canvas.width - img.width * ratio) / 2;
    var centerShift_y = (canvas.height - img.height * ratio) / 2;
    this.centerShift_x = centerShift_x;
    this.centerShift_y = centerShift_y;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(
      img,
      0,
      0,
      img.width,
      img.height,
      centerShift_x,
      centerShift_y,
      img.width * ratio,
      img.height * ratio
    );

    if (circles) {
      for (var i = 0; i < circles.length; i++) {
        var circle = circles[i];
        utils.drawCircle(
          circle,
          ctx,
          this.canvasHeight,
          this.canvasWidth,
          this.circles
        );
        ctx.fillStyle = circle.fill;
        ctx.fill();
        ctx.stroke();
      }
    }

    if (isCommingFromEdit) {
      this.addEventsToCanvas(canvas);
    }
  }

	updateCanvas = (circles, isCommingFromEdit) => {
    let { mapImage, originalImage } = this.state;
    this.canvas = document.getElementById("canvas");
    this.ctx = this.canvas.getContext("2d");
    let img = new Image();
    img.onload = this.drawImageScaled.bind(
      this,
      img,
      circles,
      isCommingFromEdit
    );
    img.setAttribute("crossOrigin", "anonymous");
    img.src = mapImage ? mapImage : originalImage;
  };

	handleImageChange(e) {
    e.preventDefault();
    let reader = new FileReader();
    let files = e.target ? e.target.files : [];
    if (files.length > 0) {
      let file = files[0];
      reader.onloadend = () => {
        this.setState({
          file: file,
					imageName: file.name,
          imagePreviewUrl: reader.result,
          originalImage: reader.result,
          mapImage: null
        }, () => {
          this.updateCanvas()
        });
				this.props.handleImageChange(files)
      }
      reader.readAsDataURL(file);
      this.toggle();
    }
  }

	toggle = () => {
    this.setState(
      (prevState) => ({
        modal: !prevState.modal,
        selectedValues: [],
      }),
      () => {
        let { modal } = this.state;
        !modal && this.ctx.clearRect(0, 0, this.canvasWidth, this.canvasHeight);
        !modal && this.removeEvents(this.canvas);
      }
    );
    this.count = 0;
    this.circles = [];
  };

	handleCollapse = (id) => {
		const {collapseOpen} = this.state;
		const e = cloneDeep(id)
		this.setState({collapseOpen: !collapseOpen}, () => this.props.toggleAcc(e))
	} 

	render() {
		const {
			item,
			clientList,
			clientSelected,
			colourStyles,
			serialNumber,
			siteId,
			handleClientChange,
			treeData,
			storeData,
			paramsid
		} = this.props;
		const { // NOTE - states used
			addressLine1,
			addressLine2,
			city,
			collapseOpen, 
			country,
			imageName,
			imagePreviewUrl,
			isLoading,
			latitude,
			latitudeErr,
			longitude,
			longitudeErr,
			macAddress,
			macAddressError,
			modal,
			notifysStatus,
			openLoader,
			RegionErr,
			selectedRegion,
      selectedValues,
			SerialKeyError,
			siteLogLevelError,
			siteErrorLogLevel,
			siteName,
			siteNameErr,
			sitesNotes,
			siteStreamConfig,
			siteStreamConfigError,
			stateC,
			timezoneValue,
			timeZoneErr,
			zipCode,
			zipcodeErr,
		} = this.state;
		const siteErrorLogLevelOption = [
      { value: 'Error', label: 'Error' },
      { value: 'Trace', label: 'Trace' },
      { value: 'Debug', label: 'Debug' }
    ]
		const siteConfigOptions = [
			{ value: 'LowStreamOnly', label: 'Low Stream Always' },
			{ value: 'OnDemand', label: 'On Demand' },
			{ value: 'LowHighAlways', label: 'High Stream Always' }
		]
		let imagePreview = null;
    let version = "/?v=" + moment().format(utils.dateTimeFormat);
    // 
    imagePreview = imagePreviewUrl ? (
      <img src={imagePreviewUrl} style={{ width: "100% ", height: "100%" }} />
    ) : (
      storeData &&
      storeData.data &&
      storeData.data.map &&
      paramsid && (
        <img
          src={
            imagePreviewUrl
              ? imagePreviewUrl
              // : util.serverUrl +
              : utils.serverImageUrl +
              "/api/mapThumbnail/" +
              paramsid +
              ".png" +
              version
          }
        />
      )
    );
		return (
			<>
        <LoadingDialog isOpen={isLoading} />
				<Card style={{ marginBottom: "1rem", width: "", cursor: 'pointer' }} key={item.id} className="ml-auto mr-auto " >
					<CardHeader onClick={() => this.handleCollapse(item.id)} className="p-2"> {}
						{item.siteName}
						{collapseOpen ? (
							<i className="fa fa-angle-up floatRight" />
						) : (
							<i className="fa fa-angle-down floatRight" />
						)}
					</CardHeader>
					<Collapse isOpen={collapseOpen} ref={this.basic_info} className="basic_info">
						<CardBody>
							<div className='row site-tab-holder'>
								<div className='col-lg-6'>
									<FormGroup col>
										<Col sm={12} className="text-field">
											<Select
												id="clientId"
												isClearable={true}
												value={clientSelected}
												onChange={handleClientChange}
												options={clientList}
												styles={colourStyles}
											/>
											<label class="fixed-label" for="userName">Clients</label>
										</Col>
									</FormGroup>
									<FormGroup col >
										{this.isUpdate && (
											<Col xs="12" className="text-field">
												<Input
													id="siteId"
													type="text"
													value={siteId}
													className="form-control text-form disfont"
													required
													disabled
												/>
												<label className="fixed-label">
													Site Id{" "}
												</label>
											</Col>
										)}
									</FormGroup>
									<FormGroup col >
										<Col xs="12" className="text-field">
											<Input
												id="addressLine1"
												type="text"
												name="addressLine1"
												value={addressLine1}
												onChange={(e) => this.handleChange(e)}
												className="form-control text-form"
												required
											/>
											<label className="text-label">
												Address Line 1
											</label>
										</Col>
									</FormGroup>
									<FormGroup row className="m-0">
										<Col sm className="text-field">
											<Input
												type="text"
												id="city"
												name="city"
												value={city}
												onChange={(e) => this.handleChange(e)}
												className="form-control text-form"
												required
											/>
											<label className="text-label">City</label>
										</Col>
										<Col sm className="text-field pr-0 mr-0" >
											<Input
												type="text"
												id="stateC"
												name="stateC"
												value={stateC}
												onChange={(e) => this.handleChange(e)}
												className="form-control text-form"
												required
											/>
											<label className="text-label">State</label>
										</Col>
									</FormGroup>
									<FormGroup row className="m-0">
										<Col sm className="text-field">
											<Input
												type="text"
												onClick={() => this.showTree()}
												className="form-control text-form"
												value={selectedRegion}
											/>
											<label className="text-label">
												Region<span className={"text-danger"}>*</span>
											</label>
											{RegionErr ? <div className="input-feedback">Required</div> : null}
										</Col>
										<Col sm className="text-field pr-0 mr-0">
											<TimezonePicker
												id="timezoneValue"
												name="timezoneValue"
												value={timezoneValue}
												onChange={(e) => this.handleTimezoneValue(e)}
												inputProps={{
													placeholder: "Select Timezone...",
													className: "form-control",
												}}
												className="timezone-style"
											/>
											<label className="fixed-label">Timezone<span className={'text-danger'}>*</span></label>
											{timeZoneErr ? <div className="input-feedback">Required</div> : null}
											{}
										</Col>
									</FormGroup>
									<FormGroup row className="m-0 ml-1">
										{treeData && treeData.length > 0 && (
											<div>
												<TreeStore
													treeData={treeData}
													showReg={this.showRegion}
												/>
											</div>
										)}
										{treeData && treeData.length == 0 && (
											<div>
												{" "}
												<br />
												<label>No Regions</label>
											</div>
										)}
									</FormGroup>
									{}
								</div>
								<div className='col-lg-6'>
									<FormGroup row className="mr-1 pt-1" style={{ minHeight: '40px' }} >
										{}
										<div className="col-lg-6"></div>
										<div className="col-lg-2">Status</div>
										<div className="col-lg-4">
											<label className="switch">
												<Input
													type="checkbox"
													className="toggle"
													checked={notifysStatus === "Active"}
													onClick={() =>
														this.enableStatus(notifysStatus === "Inactive" ? "Active" : "Inactive")
													}
													id="isActive"
												/>
												<span className="slider round"></span>
											</label>
										</div>
										{}
									</FormGroup>
									<FormGroup col className="mr-1">
										<Col xs="12" className="text-field">
											<Input
												type="text"
												id="siteName"
												name="siteName"
												value={siteName} 
												onChange={(e) => this.handleChange(e, 'siteNameErr')}
												className="form-control text-form"
												required
											/>
											<label className="text-label">
												Site Name
											<span className={"text-danger"}>*</span>
											</label>
											{siteNameErr !== "" ? <div className="input-feedback">Required</div>
												: null}
											{}
										</Col>
									</FormGroup>
									<FormGroup col className="mr-1">
										<Col xs="12" className="text-field">
											<Input
												type="text"
												id="addressLine2"
												name="addressLine2"
												value={addressLine2}
												onChange={(e) => this.handleChange(e)}
												className="form-control text-form"
												required
											/>
											<label className="text-label">
												Address Line 2
											</label>
										</Col>
									</FormGroup>
									<FormGroup row style={{ margin: "0px" }} className="mr-1">
										<Col sm className="text-field">
											<Input
												id="country"
												type="text"
												name="country"
												value={country}
												onChange={(e) => this.handleChange(e)}
												className="form-control text-form"
												required
											/>
											<label className="text-label">
												Country
											</label>
										</Col>
										<Col sm className="text-field pr-0 mr-0">
											<Input
												id="zipCode"
												type="text"
												name="zipCode"
												value={zipCode}
												onChange={(event) => this.handleZipCode(event)}
												className="form-control text-form"
												required
												maxLength="10"
											/>
											<label className="text-label">
												Zip Code
											</label>
											{ zipcodeErr !== "" && 
												<div className="input-feedback">
													Invalid Zipcode (Number/Max length 10)
													<span style={{ color: "red" }}>*</span>
												</div>}
										</Col>
									</FormGroup>
									<FormGroup row style={{ margin: "0px" }} >
										<Col sm className="text-field pr-0 mr-0" >
											<Input
												id="latitude"
												name="latitude"
												type="text"
												className="form-control text-form"
												value={latitude}
												onChange={(e) => this.handleChange(e, 'latitudeErr')}
												required
											/>
											<label className="text-label">
												Latitude<span className={"text-danger"}>*</span>
											</label>
											{latitudeErr !== "" ? <div className="input-feedback">Required</div> : null}
										</Col>
										<Col sm className="text-field ml-2 pr-0">
											<Input
												id="longitude"
												type="text"
												name="longitude"
												className="form-control text-form"
												value={longitude}
												onChange={(e) => this.handleChange(e, 'longitudeErr')}
												required
											/>
											<label className="text-label">
												Longitude<span className={"text-danger"}>*</span>
											</label>
											{longitudeErr !== "" ? <div className="input-feedback">Required</div> : null}
											{}
										</Col>
									</FormGroup>
									<FormGroup row className="m-0 mr-1">
										<Col sm className="text-field mr-1">
											<Input
												id="macAddress"
												type="text"
												className="form-control text-form disfont "
												value={macAddress}
												required
												disabled
											/>
											<label className="fixed-label ml-1">Mac Address<span className={'text-danger'}>*</span></label>
											{macAddressError && <div className="input-feedback">Required</div>}
										</Col>
										<Col sm className="text-field pr-0 mr-0" >
											<Input
												id="serialNumber"
												type="text"
												className="form-control text-form disfont"
												value={serialNumber}
												required
												disabled
											/>
											<label className="fixed-label ml-1">
												SerialKey<span className={'text-danger'}>*</span>
											</label>
											{SerialKeyError && <div className="input-feedback">Required</div>}
										</Col>
									</FormGroup>
									<FormGroup row className="m-0 mr-1">
										<Col sm className="text-field mr-1">
											<Select
												id="siteErrorLogLevel"
												name="siteErrorLogLevel"
												isMulti={true}
												isClearable={true}
												value={siteErrorLogLevel}
												onChange={(option) => this.handleDropChange('siteErrorLogLevel', option)}
												options={siteErrorLogLevelOption}
											/>
											<label class="fixed-label ml-1"> Site Logs Level <span className={'text-danger'}>*</span></label>
											{siteLogLevelError && <div className="input-feedback">Required</div>}
										</Col>
										<Col sm className="text-field pr-0 mr-0" >
											<Select
												id="siteStreamConfig"
												name="siteStreamConfig"
												isClearable={true}
												value={siteStreamConfig}
												defaultValue={siteStreamConfig}
												onChange={(option) => this.handleDropChange('siteStreamConfig', option)}
												options={siteConfigOptions}
											/>
											<label class="fixed-label ml-1"> Site Stream Config<span className={'text-danger'}>*</span>
											</label>
											{siteStreamConfigError && <div className="input-feedback">Required</div>}
										</Col>
									</FormGroup>
									<Col sm style={{ visibility: "hidden", opacity: 0, position: 'absolute', left: '-100000px' }} >
										<Select
											noOptionsMessage={() => null}
										/>
									</Col>
									{}
									<FormGroup row className="m-0 mr-1">
										<Col sm className="text-field pr-0 mr-0" >
											<Input
												id="sitesNotes"
												type="textarea"
												className="form-control text-form"
												name="sitesNotes"
												value={sitesNotes}
												onChange={this.handleChange}
												rows="5"
												style={{ height: "90px", width: "100%", color: "black", padding: "5px" }}
											/>
											<label className="text-label">
												Site Notes
											</label>
										</Col>
									</FormGroup>
									<FormGroup row className="m-0">
										<Col sm className="pl-2"> Map</Col>
									</FormGroup>
									<FormGroup row className="m-0 mr-1">
										<div className='col-lg-6 pl-0'>
											<FormGroup col>
												<Col sm={12} className="text-field">
													<label
														htmlFor="file"
														className="custom-file-upload choose-file"
													>
														<i
															className="fa fa-file"
															aria-hidden="true"
														></i>{" "}
												Browse
											</label>
													<input
														name="file"
														id="file"
														type="file"
														onChange={(e) => {
															var file = e.target.files[0];
															this.handleImageChange(e);
														}}
													/>
												</Col>
											</FormGroup>
										</div>
										<div className='col-lg-6 pl-0'>
											<FormGroup col>
												<Col sm={12} className="text-field">
													{
														imageName !== "" && imageName ?
															<div className="imgPreview" >
																<img src={utils.serverImageUrl + '/Map/' + (imageName)} />
															</div> : (
																<i className="fa fa-camera fa-2x"></i>
															)
													}
													{imagePreview ? (
														<div className="imgPreview" onClick={this.editMap} >
															{imagePreview}
														</div>
													) : (
														null
													)}
												</Col>
											</FormGroup>
										</div>
									</FormGroup>
								</div>
							</div>
						</CardBody>
					</Collapse>
				</Card>
				<Modal // NOTE Canvas modal
					isOpen={modal}
					toggle={() => this.toggle()}
					className={"modal-parent ImageModalML"}
				>
					<ModalHeader
						className="site-map-upload-header pt-2 pb-2"
						toggle={() => this.toggle()}
					>
						<span className="site-map-upload">Add Camera On Map</span>
						<Tooltip placement="bottom" title={<TooltipContent />}>
							<i
								className="fa fa-question-circle fa-2x add-map-help"
								aria-hidden="true"
							></i>
						</Tooltip>
					</ModalHeader>
					<ModalBody>
						<LoadingDialog message={'Scanning...'} isOpen={openLoader} />
						<div className="canvas-display">
							<canvas id="canvas" width={582} height={425} />
							<div className="add-map-camera-list">
								<div className="site-map-upload text-center">
									<b>Available Camera</b>
								</div>
								<Select
									isClearable={true}
									value={selectedValues}
									onChange={(selectedValues) =>
										this.onSelectCamera(selectedValues)
									}
									options={this.getCameraNames()}
									isMulti
									menuIsOpen
									hideSelectedOptions={false}

									className="custom-select-list ImageModalwidth"
								/>
							</div>
						</div>
					</ModalBody>
					<ModalFooter>
						<Button className="btn formButton" onClick={() => this.saveMap()}>
							Save
						</Button>{" "}
						<Button className="btn formButton" onClick={() => this.toggle()}>
							Cancel
						</Button>
					</ModalFooter>
				</Modal>
			</>
		)
	}
}
export default BasicInfoCollapse
