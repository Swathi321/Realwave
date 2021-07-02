import React, { Component, Fragment } from 'react';
import {
  Col, Form,
  FormGroup, Label, Input,
  Button
} from 'reactstrap';
import { setNewPassword } from '../../redux/actions/httpRequest';
import { connect } from 'react-redux';
import utils from '../../Util/Util';
import common from '../../common';
import swal from 'sweetalert';
import PropTypes from 'prop-types';
import CardWrapper from '../../component/CardWrapper';
import LoadingDialog from './../../component/LoadingDialog';
import regex from './../../Util/regex';

const propTypes = {
  children: PropTypes.node,
};

const defaultProps = {};

class ChangePassword extends Component {
  constructor(props) {
    super(props);
    this.state = {
      'oldPassword': '',
      'newPassword': '',
      'confirmPassword': '',
      'email': '',
      validate: {
        match: true,
        requiredField: {},
        emailState: false,
        error: ''
      },
    }
    this.handleChange = this.handleChange.bind(this);
    this.checkPasswordsMatch = this.checkPasswordsMatch.bind(this);
  }

  handleChange = async (event) => {
    const { target } = event;
    const value = target.value;
    const { name } = target;
    const { validate } = this.state;
    if (name == "oldPassword") {
      validate.requiredField["oldPassword"] = false
    }
    if (name == "newPassword") {
      validate.requiredField["newPassword"] = false
    }
    if (name == "confirmPassword") {
      validate.requiredField["confirmPassword"] = false
    }
    if (name == "confirmPassword" && !validate.match) {
      validate.match = true
    }
    await this.setState({
      [name]: value, validate
    });
  }

  checkPasswordsMatch() {
    const { confirmPassword, newPassword } = this.state
    return (confirmPassword === newPassword)
  }

  submitForm(e) {
    e.preventDefault();
    let user = utils.getLoggedUser();
    if (this.formIsValid()) {
      const { oldPassword, newPassword } = this.state;
      this.props.dispatch(setNewPassword.request({ email: user.email, newPassword: newPassword, oldPassword: oldPassword }));
    }
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.setNewPassword !== this.props.setNewPassword) {
      let { data, error, isFetching } = nextProps.setNewPassword;
      let valid = common.responseHandler(data, error, isFetching);
      if (valid) {
        swal({
          title: "success",
          text: data.message,
          icon: "success"
        }).then(function () {
          this.setState({
            oldPassword: '',
            newPassword: '',
            confirmPassword: '',
            email: '',
          });
        }.bind(this));;
      }
    }
  }

  formIsValid = () => {
    const { oldPassword, newPassword, confirmPassword, validate } = this.state;
    let isValid = true;
    if (oldPassword == '') {
      isValid = false;
      validate.requiredField["oldPassword"] = true;
    }
    if (newPassword == '') {
      isValid = false;
      validate.requiredField["newPassword"] = true;
    }
    else if (!newPassword.match(regex.passwordValidation)) {
      isValid = false;
      validate.requiredField["newPassword"] = true;
    }
    if (confirmPassword == '') {
      isValid = false;
      validate.requiredField["confirmPassword"] = true;
    }
    if (isValid) {
      validate.match = isValid = this.checkPasswordsMatch();
    }

    this.setState({ validate });
    return isValid;
  }

  render() {
    const { oldPassword, newPassword, confirmPassword, validate } = this.state;
    const { match, requiredField } = validate;
    const { isFetching } = this.props.setNewPassword || {};
    return (
      <Fragment>
        <LoadingDialog isOpen={isFetching} />
        <CardWrapper title={'Change Password'} subTitle={'Enter a new password for your account.'}>
          <Form className="form" onSubmit={(e) => this.submitForm(e)}>
            <Col lg={6}>
              <FormGroup>
                <Label>Old Password</Label>
                <Input
                  type="password"
                  name="oldPassword"
                  id="oldpassword"
                  placeholder="Enter your current password"
                  value={oldPassword}
                  maxLength={36}
                  onChange={(e) => this.handleChange(e)}
                />
              </FormGroup>
              {
                requiredField["oldPassword"] &&
                <div className="reset-alert">
                  Oops Required Field.
                            </div>
              }

            </Col>
            <Col lg={6}>
              <FormGroup>
                <Label>New Password</Label>
                <Input
                  type="password"
                  name="newPassword"
                  id="newpassword"
                  placeholder="Enter new password"
                  value={newPassword}
                  maxLength={36}
                  onChange={(e) => this.handleChange(e)}
                />
              </FormGroup>
              {
                requiredField["newPassword"] &&
                <div className="reset-alert">
                  Password should contain 8 characters, one uppercase,one lower case letter,one number and one special character
                            </div>
              }
            </Col>
            <Col lg={6}>
              <FormGroup>
                <Label>Confirm Password</Label>
                <Input
                  type="password"
                  name="confirmPassword"
                  id="confirmpassword"
                  value={confirmPassword}
                  placeholder="Enter confirm password"
                  maxLength={36}
                  onChange={(e) => this.handleChange(e)}
                />
              </FormGroup>
              {
                !match &&
                <div className="reset-alert">
                  Oops Password Not Match.
                            </div>
              }
              {
                requiredField["confirmPassword"] &&
                <div className="reset-alert">
                  Oops Required Field.
                            </div>
              }
            </Col>
            <Col lg={6}>
              <FormGroup>
                <Label></Label>
                <Button>Change Password</Button>
              </FormGroup>
            </Col>
          </Form>
        </CardWrapper>
      </Fragment>
    );
  }
}

ChangePassword.contextTypes = {
  router: PropTypes.object.isRequired
};
ChangePassword.propTypes = propTypes;
ChangePassword.defaultProps = defaultProps;

function mapStateToProps(state, ownProps) {
  return {
    setNewPassword: state.setNewPassword
  };
}

var ChangePasswordModule = connect(mapStateToProps)(ChangePassword);
export default ChangePasswordModule;
