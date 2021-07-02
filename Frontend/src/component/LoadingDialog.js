import React, { PureComponent } from 'react';
import ReactLoading from 'react-loading';
// import { Modal } from 'reactstrap';
import  {Modal } from 'antd'


class LoadingDialog extends PureComponent {
  render() {
    const { message, isOpen, isMultiple } = this.props;
    return (
      <div className="wrapper" >
        {isMultiple && isOpen ?
          <div className="loader_position">
            <ReactLoading className="playback_loader" type='bars' color='#2f4050' delay={0} />
          </div> :
          // <Modal 
          //   zIndex={1050}
          //   centered={true}
          //   className={`dialog-modal loading-dialog`}
          //   isOpen={isOpen}
          //   size="modal-sm"
          //   trapFocus={false}
          // >
          <Modal
            zIndex={1050}
            closable={false}
            // centered={true}
            mask={true}
            visible={isOpen}
            footer={null}
            maskClosable={false}
          >
            <center >
              <ReactLoading className="modal-backdrop" type='bars' color='#2f4050' delay={0} />
              <h4 className="loader-text loadingText">{message ? message : 'Loading...'}</h4>
            </center>
          </Modal>
        }
      </div>
    );
  }
}

export default LoadingDialog;
