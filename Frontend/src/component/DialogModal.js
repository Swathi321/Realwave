import React from "react";
import Dialog from 'react-dialog';
import propTypes from 'prop-types';
import 'react-dialog/css/index.css';

class DialogModal extends React.Component {
    render() {
        let { title, isResizable, allowMinimize, width, height, isDraggable, open } = this.props;
        return (open ?
            <Dialog
                position={{ x: -148, y: -200 }}
                title={title}
                isResizable={isResizable}
                allowMinimize={allowMinimize}
                width={width}
                isDraggable={isDraggable}
                height={height}
                onClose={() => this.props.onClose()}
            >
                {this.props.children}
            </Dialog > : null
        );
    }
}

DialogModal.propTypes = {
    open: propTypes.bool,
    onClose: propTypes.func
};

DialogModal.defaultProps = {
    title: '',
    isResizable: false,
    allowMinimize: false,
    width: 300,
    height: 300,
    isDraggable: false
};

export default DialogModal;