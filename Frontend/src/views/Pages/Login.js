import React, { PureComponent } from 'react';
import { connect } from 'react-redux';
import { loginAction, userDetail, saveActivityLog, socialGoogleAction, socialFacebookAction, storesData } from '../../redux/actions/httpRequest';
import utils from '../../Util/Util';
import swal from 'sweetalert';
import { Button, Card, CardBody, CardGroup, Col, Container, Input, InputGroup, Row, FormFeedback } from 'reactstrap';
import ReactLoading from 'react-loading';
import GoogleLogin from 'react-google-login';
import { storeChange, changeThemeToDark, changeThemeToDark2, changeThemeToSnowWhite, changeThemeToLight, changeThemeToBacardi, changeThemeToCocacola, changeThemeToStarbucks, changeThemeToHanwha, changeThemeToGeutebruck } from './../../redux/actions/index';

class Login extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      data: {
        email: '',
        password: ''
      },
      error: {}
    }
    this.onLogin = this.onLogin.bind(this);
    this.onForgetPassword = this.onForgetPassword.bind(this)
  }

  componentDidMount() {
    if(localStorage.getItem("sessionExpired") == "true") {
      localStorage.setItem("sessionExpired", false);
      swal({
        title: "Session Timeout",
        icon: "info",
        text: "Your session has been expired due to inactivity"
      })
    }
  }

  redirectLogged() {
    let user = utils.getLoggedUser();
    if (user) {
      if (user.clientId && user.clientId.theme) {
        localStorage.setItem('ThemeSelected', user.clientId.theme);
      }
      if (localStorage.getItem('previousHash')) {
        console.log('redirecting to: ' + localStorage.getItem('previousHash'));
        let tempHash = localStorage.getItem('previousHash');
        localStorage.removeItem('previousHash');
        utils.onNavigate({
          props: this.props,
          type: "replace",
          route: "/" + tempHash
        });

      } else {
        console.log('redirecting and getting menu');
        utils.onNavigate({
          props: this.props,
          type: "replace",
          route: utils.getMenu(true)
        });
      }
      return;
    }
  }

  componentWillMount() {
    this.props.dispatch(storeChange({ data: null }));
    this.props.dispatch(storesData.request({ stores: [] }));
    let user = utils.getLoggedUser();
    if (user) {
      this.redirectLogged();
    } else {
      this.props.dispatch(userDetail.request({}))
    }

  }

  setTheme = (theme) => {
    let Obj = {
      'theme-dark': changeThemeToDark,
      'theme-dark2': changeThemeToDark2,
      'theme-light': changeThemeToLight,
      'theme-bacardi': changeThemeToBacardi,
      'theme-cocacola': changeThemeToCocacola,
      'theme-starbucks': changeThemeToStarbucks,
      'theme-snowwhite': changeThemeToSnowWhite,
      'theme-hanwha': changeThemeToHanwha,
      'theme-geutebruck': changeThemeToGeutebruck
    };
    utils.addThemetoBody(`theme-${theme.toLowerCase()}`);
    console.log("Theme Selected From SetTheme : " + theme);
    // this.props.dispatch(Obj[`theme-${theme.toLowerCase()}`]());
    localStorage.setItem('ThemeSelected', theme);
  }

  componentWillReceiveProps(nextProps) {
    let loggedData;

    if (nextProps.login && nextProps.login.data && nextProps.login.data.success && nextProps.login.data!==this.props.login.data) {
      const { data } = nextProps.login;

      if(!data.user.roleId){
        swal({
          title: "Error",
          text: "No Role is assigned to this user.",
          icon: "error"
        });
        return;
      }

      let selectedTheme = localStorage.getItem('ThemeSelected');
      console.log("User selected theme : " + selectedTheme);
      if (data && data.success && selectedTheme != data.user.theme) {
        console.log("User selected theme found : " + data.user.theme);

        setTimeout(() => {
          this.setTheme(data.user.theme);
        }, 100);
      }
    }

    if (nextProps.login !== this.props.login) {
      this.getUserLogin(nextProps.login);
    }

    if (nextProps.socialfacebookAction !== this.props.socialfacebookAction) {
      this.getUserLogin(nextProps.socialfacebookAction)
    }

    if (nextProps.socialgoogleAction !== this.props.socialgoogleAction) {
      this.getUserLogin(nextProps.socialgoogleAction)
      this.props.dispatch(userDetail.request({}));
    }

    if (nextProps.userDetail !== this.props.userDetail) {
      const { data } = nextProps.userDetail;
      if (data && data.success) {
        let defaultFilter = [{ label: "All", value: "All" }];
        loggedData = utils.getScreenDetails(utils.getLoggedUser(), this.props.location, data.success);
        this.props.dispatch(saveActivityLog.request({ action: 'save', data: loggedData }));
        localStorage.setItem('SelectedStore', JSON.stringify(defaultFilter));
        this.redirectLogged();
      }
    }
  }
  onForgetPassword() {
    let me = this;
    utils.onNavigate({
      props: me.props,
      type: "replace",
      route: '/ForgotPassword'
    });
  }

  getUserLogin = ({ data, isFetching, error }) => {
    console.log('loggeddataaaaa', data)
    if(data != null) {
      if(data.user && data.user.clientId != null) {
        localStorage.setItem('user_client', data.user.clientId.name);
      }else{
        localStorage.setItem('user_client', '');

      }

    }
    let loggedData;
    if (error) {
      swal("Error", error);
      return;
    }

    if (!isFetching) {
      if (data && data.success) {
        
        loggedData = utils.getScreenDetails(utils.getLoggedUser(), this.props.location, data.success);
        this.props.dispatch(saveActivityLog.request({ action: 'save', data: loggedData }));
        // this.setTheme(data.user.theme);
        this.redirectLogged();
      } else {
        const { error } = data || {};
        console.log("login data is present but failed to login");
        swal({
          title: "Error",
          text: error,
          icon: "error"
        });
      }
    }
  }

  onLogin() {
    let { data, error } = this.state;
    let hasError = false;
    let email = data['email'];
    let password = data['password'];
    if (email == "") {
      error["email"] = "Email Cannot be Empty";
      hasError = true
    }
    else {
      error["email"] = undefined;
    }
    if (password == "") {
      error["password"] = "Password Cannot Be Empty";
      hasError = true;
    }
    else {
      error["password"] = undefined;
    }
    if (email != "" && utils.email(email)) {
      error["email"] = "Please Enter Valid Email";
      hasError = true;
    }

    if (hasError) {
      this.setState(error);
    }
    else {
      this.props.dispatch(loginAction.request(data, '', '', () => this.props.dispatch(userDetail.request({}))));
    }

    this.props.dispatch(storeChange({ data: null }));
  }

  onChange(field, value) {
    let { data } = this.state;
    switch (field) {
      case "email":
        data["email"] = value;
        break;

      case "password":
        data["password"] = value;
        break;
    }
  }

  responseGoogle = (response) => {
    this.props.dispatch(socialGoogleAction.request({ tokenId: response.tokenId }));
  }

  responseFailureGoogle = (response) => {
    console.log(response);
  }

  responseFacebook = (response) => {
    if (response && response.accessToken) {
      this.props.dispatch(socialFacebookAction.request({ tokenId: response.accessToken }));
    }
  }

  render() {
    let { error, data } = this.state;
    const { isFetching } = this.props.login || {};
    return (
      <div className="app flex-row align-items-center login-container">
        <Container className="login-containers">
          <Row className="justify-content-center">
            <Col md="6" sm="6">
              <CardGroup>
                <CardBody className="login-container">
                  <form className="login-form" onSubmit={(e) => {
                    e.preventDefault();
                    this.onLogin();
                  }}>

                    <center>
                      <img src={require('./../../assets/img/logo.png')} alt="Real Wave" />
                      <p className="text-center login-caption">Intelligent Video Surveillance Cloud</p>
                    </center>
                    <br />

                    <h2 className="text-center login-text">Welcome</h2>
                    <p className="text-center login-text">Use your credentials to login below</p>

                    <InputGroup className="mb-2">
                      <Input invalid={error["email"] !== undefined} type="text" disabled={isFetching} className="login-input" onChange={(val) => data["email"] = val.target.value} name="email" placeholder="Email" autoComplete="new-password" />
                      <FormFeedback>{error["email"]}</FormFeedback>
                    </InputGroup>

                    <InputGroup className="mb-2">
                      <Input invalid={error["password"] !== undefined} type="password" disabled={isFetching} className="login-input" onChange={(val) => data["password"] = val.target.value} name="password" placeholder="Password" autoComplete="new-password" />
                      <FormFeedback>{error["password"]}</FormFeedback>
                    </InputGroup>

                    <InputGroup className="mb-2">
                      <Button color="primary" disabled={isFetching} className="login-button">
                        <center>
                          {isFetching ? <ReactLoading type={'bars'} color={'white'} height="1.5em" width="1.5em" /> : <i className="fa fa-unlock" aria-hidden="true"> <span> Login</span></i>}
                        </center>
                      </Button>
                    </InputGroup>


                    <Row>
                      <Col md={12} className="text-center">
                        <div className="login-bottom-text">
                          <a onClick={() => this.onForgetPassword()} className="cursor">Password Help</a>
                          <p> | </p>
                          <a className="text-left cursor">Contact Us</a>
                        </div>
                      </Col>
                    </Row>
                    {/* Currently not been implemented completely of social login */}
                    <p className="text-center login-text bottomContent">OR SIGN IN WITH</p>
                    <InputGroup>
                      <Col md={12} className="text-center">
                        <GoogleLogin
                          buttonText="Google"
                          clientId={utils.sso.google.clientId} //CLIENTID NOT CREATED YET
                          onSuccess={(response) => this.responseGoogle(response)}
                          onFailure={(response) => this.responseFailureGoogle(response)}
                          className="custom-login-google"
                          cookiePolicy={'single_host_origin'}
                          disabledStyle
                        />
                      </Col>
                    </InputGroup>
                  </form>
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
    login: state.login,
    userDetail: state.userDetail,
    socialgoogleAction: state.socialgoogleAction,
    socialfacebookAction: state.socialfacebookAction
  };
}

var LoginUser = connect(mapStateToProps)(Login);
export default LoginUser;
