import React, { Component } from 'react';
import { Button, Modal, ModalHeader, ModalBody, ModalFooter } from 'reactstrap';
class InfModal extends React.PureComponent {
    render() {
        let { isOpen, onClose, config } = this.props;
        return (
            <div >
                <Modal isOpen={isOpen} style={{ width: "477px" }} >
                    <ModalHeader style={{ width: "475px" }} className="widgetHeaderColor"> Info </ModalHeader>
                    <ModalBody style={{ width: "475px" }} className="reorderBody">
                        {config && config.storeId && <ul>
                            <ul />
                            <li>Brand : {config.cameraBrand}</li>
                            <li>Is PTZ ? : {config.cameraType == "PTZ" ? "Yes" : "No"}</li>
                            <li>Is 360 ? : {config.cameraType === "360" ? "Yes" : "No"}</li>
                            <li>StreamId Low : {config.lowStreamId}</li>
                            <li>StreamId High : {config.highStreamId}</li>
                            {config.aiStreamId && <li>StreamId AI : {config.aiStreamId}</li>}
                            <li>Low Stream Token : {config.streamToken ? config.streamToken.low : ""}</li>
                            <li>High Stream Token : {config.streamToken ? config.streamToken.high : ""}</li>
                            {config.streamToken && config.streamToken.ai && <li>AI Stream Token : {config.streamToken.ai}</li>}
                            <li>Cam Recording Url : {config.cameraRTSPUrl ? config.cameraRTSPUrl : ""}</li>
                            <li>Cam Url : {config.cameraThumbnailRTSPUrl ? config.cameraThumbnailRTSPUrl : ""}</li>
                            {config.cameraAIUrl && <li>AI Stream Url : {config.cameraAIUrl}</li>}
                            <li>Is Ant : {config.storeId.isAntMedia ? "Yes" : "No"}</li>
                            <li>Site Type : {config.storeId.type || "Default"}</li>
                            <li>FLV or HLS or WebRTC : {config.storeId.liveVideoConfig ? config.storeId.liveVideoConfig : ""}</li>
                            <li>Cash Register # : {config.register ? config.register : ""}</li>
                        </ul>}
                    </ModalBody>
                    <ModalFooter style={{ width: "475px" }} >
                        <Button color="primary" onClick={onClose}>Close</Button>
                    </ModalFooter>
                </Modal>
            </div>
        );
    }
}

export default InfModal;