import React, { Component } from 'react';
import { Col, Container, Row } from 'reactstrap';
import { page404 } from './../../redux/actions';
import { connect } from 'react-redux';

class Page404 extends Component {

  componentDidMount() {
    this.props.dispatch(page404({}));
  }

  render() {
    return (
      <div className="page-404-center" >
        <Container>
          <Row className="justify-content-center">
            <Col md={12}>
              <div className="clearfix">
                <center>
                  <h4 className="pt-3">Not implemented!</h4>
                  <p >Sorry, the page you are looking for was not implemented.</p>
                </center>
              </div><br />
              <div className="clearfix">
                <center>
                  <p >Or you can return to our <a href=" "> home page</a> or <a href=" "> contact us </a> if you can't find what you are looking for.</p>
                </center>
              </div>
            </Col>
          </Row>
        </Container>
      </div>
    );
  }
}

function mapStateToProps(state, ownProps) {
  return {
    Page404: state.Page404
  };
}

var Page404Module = connect(mapStateToProps)(Page404);
export default Page404Module;
