import React, { Component } from 'react';
import PropTypes from 'prop-types';
import utils from '../../Util/Util';
import Build from '../../../src/metadata.json';
import { withRouter } from "react-router";
import { connect } from 'react-redux';

const propTypes = {
  children: PropTypes.node
};

const defaultProps = {};

class DefaultFooter extends Component {
  render() {
    // eslint-disable-next-line
    const { screenResizedReducer, children, ...attributes } = this.props;
    utils.setNavigationProps();

    return (
      <React.Fragment>
        <div style={{ display: 'flex' }}>
          <span style={{ flex: '.5' }}>Realwave &copy; {new Date().getFullYear()}.</span>
          <span style={{ flex: '.5', textAlign: 'right' }}>
            <span style={{ marginRight: 5 }}>Version:</span>
            <span>v{Build.build1}.</span>
            <span>{Build.build2}.</span>
            <span>{Build.build3}</span>
          </span>
        </div>
      </React.Fragment>
    );
  }
}

DefaultFooter.contextTypes = {
  router: PropTypes.object.isRequired
};

function mapStateToProps(state, ownProps) {
  return {
    screenResizedReducer: state.screenResizedReducer
  };
}

var DefaultFooterModule = connect(mapStateToProps)(withRouter(DefaultFooter));
export default DefaultFooterModule;
