import React, { PureComponent } from 'react';
import {
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
} from "reactstrap";
import { connect } from "react-redux";
import { Tooltip } from "antd";
import LoadingDialog from "./../../component/LoadingDialog";
import Select from "react-select";
import utils from "./../../Util/Util";

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

export class MapBrowsing extends PureComponent {

	constructor(props) {
		super(props);
		this.state = {
			openLoader: false,
			isScanning: false,
			selectedValues: []
		}
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

	render() {
		const { isOpen } = this.props;
		const { openLoader, isScanning, selectedValues } = this.state;
		let loadingMessage = isScanning ? { message: "Scanning..." } : {};
		return (
			<Modal 
				isOpen={isOpen}
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
					<LoadingDialog {...loadingMessage} isOpen={openLoader} />
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
		)
	}
}

function mapStateToProps(state, ownProps) {
  const { storeData } = state;
  const { data } = storeData;
  return {
    initialValues: data && data.data ? data.data : data || {},
    storeData: state.storeData,
    getCombos: state.getCombos,
    storesData: state.storesData,
    cameraData: state.cameraData,
    storeChange: state.storeChange,
    daemon: state.daemon,
    weekDays1: state.weekDays1
  };
}

export default connect(mapStateToProps)(MapBrowsing)