import React, { Component } from 'react';
import { connect } from 'react-redux';
import { checkValidForgotLink, forgotPassword, resetPassword, saveActivityLog } from '../../redux/actions/httpRequest';
import utils from '../../Util/Util';
import swal from 'sweetalert';
import common from '../../common';
import { Button, Card, CardBody, CardGroup, Col, Container, Input, InputGroup, Row, FormFeedback } from 'reactstrap';
import ReactLoading from 'react-loading';
import PropTypes from 'prop-types';
import consts from '../../Util/consts';
import regex from './../../Util/regex';

class ForgotPassword extends Component {
  constructor(props) {
    super(props);
    this.state = {
      data: {
        email: '',
        newPassword: '',
        confirmPassword: '',
      },
      linkExpired: false,
      error: {},
      isForgot: true
    }
    this.onFormSubmit = this.onFormSubmit.bind(this);
  }

  componentWillMount() {
    const secretKey = this.props.match.params.id || null;
    if (secretKey) {
      this.props.dispatch(checkValidForgotLink.request({ secretKey: secretKey }));
      this.setState({ isForgot: false });
    }
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.forgotPassword !== this.props.forgotPassword) {
      let { data, isFetching, error } = nextProps.forgotPassword;
      let me = this;
      if (data) {
        let valid = common.responseHandler(data, error, isFetching);
        if (valid) {
          swal({
            title: "success",
            text: data.message,
            icon: "success"
          }).then(function (isConfirm) {
            if (isConfirm) {
              utils.onNavigate({
                props: me.props,
                type: "push",
                route: '/login'
              });
            }
          });
          return;
        }
      }
    }

    if (nextProps.resetPassword !== this.props.resetPassword) {
      let { data, isFetching, error } = nextProps.resetPassword;
      if (data) {
        let valid = common.responseHandler(data, error, isFetching);
        let me = this;
        if (valid) {
          swal({
            title: "success",
            text: data.message,
            icon: "success",
          }).then(function (isConfirm) {
            if (isConfirm) {
              utils.onNavigate({
                props: me.props,
                type: "replace",
                route: '/login'
              });
            }
          });
          return;
        }
      }
    }

    if (nextProps.checkValidForgotLink !== this.props.checkValidForgotLink) {
      let { data, isFetching, error } = nextProps.checkValidForgotLink;
      let me = this;
      if (error) {
        swal({ title: "Error", text: error, icon: "error" });
        return;
      }
      if (!isFetching) {
        if (data && !data.success) {
          swal({
            title: "Error",
            text: data.message,
            icon: "warning"
          }).then(function (isConfirm) {
            if (isConfirm) {
              utils.onNavigate({
                props: me.props,
                type: "forgotPassword",
                route: '/login'
              });
              window.location.reload();
            }
          });
          return;
        }
      }
    }
  }

  onFormSubmit() {
    let { data, error, isForgot } = this.state;
    const secretKey = this.props.match.params.id || null;
    let hasError = false;
    let email = data["email"];
    let newPassword = data["newPassword"];
    let confirmPassword = data["confirmPassword"];
    let loggedData;
    if (isForgot) {
      if (email == "") {
        error["email"] = "Email Cannot be Empty";
        hasError = true
      }
      else {
        error["email"] = undefined;
      }

      if (email != "" && utils.email(email)) {
        error["email"] = "Please Enter Valid Email";
        hasError = true;
      }
    } else {
      if (newPassword == "") {
        error["newPassword"] = "New Password Cannot Be Empty";
        hasError = true;
      }
      else if (!newPassword.match(regex.passwordValidation)) {
        error["newPassword"] = "Password should contain 8 characters, one uppercase,one lower case letter,one number and one special character";
        hasError = true;
      }
      else {
        error["newPassword"] = undefined;
      }

      if (confirmPassword == "") {
        error["confirmPassword"] = "confirm Password Cannot Be Empty";
        hasError = true;
      }
      if (newPassword != confirmPassword) {
        error["confirmPassword"] = "Passwords do not match";
        hasError = true;
      }
      else {
        error["confirmPassword"] = undefined;
      }
    }
    if (hasError) {
      this.setState(error);
    } else {
      if (isForgot) {
        loggedData = utils.getScreenDetails(utils.getLoggedUser(), this.props.location, consts.ForgetPassword + email);
        this.props.dispatch(saveActivityLog.request({ action: 'save', data: loggedData }));
        this.props.dispatch(forgotPassword.request(data));
      }
      else {
        loggedData = utils.getScreenDetails(utils.getLoggedUser(), this.props.location, consts.ResetPassword + email);
        this.props.dispatch(saveActivityLog.request({ action: 'save', data: loggedData }));
        this.props.dispatch(resetPassword.request({ password: data.newPassword, secretKey: secretKey }));
      }
    }
  }

  onBack() {
    utils.onNavigate({
      props: this.props,
      type: "push",
      route: '/login'
    });
  }

  ForgotPassword = (props) => {
    let { error, data } = this.state;
    return (
      <div>
        <h2 className="text-center login-text">Welcome</h2>
        <p className="text-center login-text">Enter registered email ID</p>

        <InputGroup className="mb-2">
          <Input invalid={error["email"] !== undefined} type="text" className="login-input" onChange={(val) => data["email"] = val.target.value} name="email" placeholder="Email" autoComplete="new-password" />
          <FormFeedback>{error["email"]}</FormFeedback>
        </InputGroup>
      </div>
    );
  }


  ResetPassword = (props) => {
    let { error, data } = this.state;
    return (
      <div>
        <h2 className="text-center login-text">Welcome</h2>
        <p className="text-center login-text">Please create new password</p>

        <InputGroup className="mb-2">
          <Input invalid={error["newPassword"] !== undefined} type="password" onChange={(val) => data["newPassword"] = val.target.value} className="login-input" name="newPassword" placeholder="New Password" />
          <FormFeedback>{error["newPassword"]}</FormFeedback>
        </InputGroup>
        <InputGroup className="mb-2">
          <Input invalid={error["confirmPassword"] !== undefined} type="password" onChange={(val) => data["confirmPassword"] = val.target.value} className="login-input" name="confirmPassword" placeholder="Confirm Password" />
          <FormFeedback>{error["confirmPassword"]}</FormFeedback>
        </InputGroup>
      </div>
    );
  }

  render() {
    let { isForgot, linkExpired } = this.state;
    const { forgotPassword, resetPassword } = this.props;
    let isFetching = forgotPassword.isFetching || resetPassword.isFetching;

    return (
      <div className="app flex-row align-items-center login-container">
        <Container className="login-containers">
          <Row className="justify-content-center">
            <Col md="6" sm="6">
              <CardGroup>
                <CardBody>
                  {linkExpired ? <div></div> : <form className="login-form" onSubmit={(e) => {
                    e.preventDefault();
                    this.onFormSubmit();
                  }}>
                    <center>
                      <img src={require('./../../assets/img/logo.png')} alt="Real Wave" />
                      <p className="text-center login-caption">cloud and security business data</p>
                    </center>
                    <br />
                    {
                      isForgot ? <this.ForgotPassword /> : <this.ResetPassword />
                    }

                    <InputGroup className="mb-2">
                      <Button color="primary" disabled={isFetching} className="login-button">
                        <center>
                          {isFetching ? <ReactLoading type={'bars'} color={'white'} height="1.5em" width="1.5em" /> : (isForgot ? 'Submit' : 'Reset Password')}
                        </center>
                      </Button>
                    </InputGroup>

                  </form>}
                  <InputGroup className="mb-2">
                    <Button onClick={() => this.onBack()} color="primary" className="login-button">Back</Button>
                  </InputGroup>
                </CardBody>
              </CardGroup>
            </Col>
          </Row>
        </Container>
      </div>
    );
  }
}

function mapStateToProps(state, ownProps) {
  return {
    checkValidForgotLink: state.checkValidForgotLink,
    forgotPassword: state.forgotPassword,
    resetPassword: state.resetPassword
  };
}

var ForgotPasswordModule = connect(mapStateToProps)(ForgotPassword);
export default ForgotPasswordModule;

