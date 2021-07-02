import React, { Component } from 'react';
import { HashRouter, Route, Switch } from 'react-router-dom';
import './App.scss';
import { Provider } from 'react-redux';
import store from './redux/store';
// Containers
import { DefaultLayout } from './containers';
import Cameras from './views/LiveVideo/Cameras';
// Pages
import { Login, Page500, Register, ForgotPassword } from './views/Pages';
import utils from './Util/Util';
import ThemeWrapper from './component/ThemeWrapper';
import download from 'downloadjs';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import FullScreenVideo from './component/FullScreenVideo';

var videoDownloadQueue = [];

window.downloadRequest = function (url, InvoiceId) {
  let req = new XMLHttpRequest();

  let vIns = videoDownloadQueue.findIndex((e) => e.id === InvoiceId);

  if (vIns > -1) {
    toast.error(`This video already in process for download.`, { position: toast.POSITION.TOP_RIGHT, autoClose: true });
    return;
  }

  toast.warn(`${InvoiceId} Download started will notify when download completed.`, { position: toast.POSITION.TOP_RIGHT, autoClose: true });
  videoDownloadQueue.push({ id: InvoiceId, request: req });
  let rq = videoDownloadQueue.find((e) => e.id == InvoiceId);

  // rq.request.addEventListener('progress', function (e) {
  // 	let percent_complete = (e.loaded / e.total) * 100;
  // 	let downloadPer = percent_complete && Math.ceil(percent_complete) || 0
  // 	//toast.update(rq.toastId, { render: `Downloading video:  ${downloadPer}  %`, type: toast.TYPE.SUCCESS });
  // });

  rq.request.open('GET', url, true);
  rq.request.responseType = 'blob';
  rq.request.onload = function () {
    if (this.status === 200) {
      var videoBlob = this.response;
      download(videoBlob, rq.id + ".mp4");
      let reqInstance = videoDownloadQueue.findIndex((e) => e.id === rq.id);
      if (reqInstance > -1) {
        videoDownloadQueue.splice(reqInstance, 1);
      }
      toast.success(`${rq.id} Download complete`, { position: toast.POSITION.TOP_RIGHT, autoClose: true });
    }
  }

  rq.request.onerror = function (err) {
    toast.error(`${rq.InvoiceId} Download Failed`, { position: toast.POSITION.TOP_RIGHT, autoClose: true });
  }

  rq.request.send();
}

class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      screen: {
        width: 0,
        height: 0
      }
    }
    this.updateDimensions = this.updateDimensions.bind(this);
  }

  updateDimensions() {
    this.setState({ screen: { width: window.screen.width, height: window.screen.height } });
  }

  componentDidMount() {
    window.addEventListener("resize", this.updateDimensions);
  }

  componentWillUnmount() {
    window.removeEventListener("resize", this.updateDimensions);
  }

  render() {
    return (
      <React.Fragment>
        <ToastContainer />
        <Provider store={store}>
          <ThemeWrapper>
            <HashRouter>
              <Switch>
                <Route exact path="/" name="Login Page" component={Login} />
                <Route exact path="/login" name="Login Page" component={Login} />
                <Route exact path="/forgotPassword" name="forget Password Page" component={ForgotPassword} />
                <Route exact path="/forgotPassword/:id" name="forget Password Page" component={ForgotPassword} />
                <Route exact path="/register" name="Register Page" component={Register} />
                <Route exact path="/500" name="Page 500" component={Page500} />
                <Route path="/cameras/:storename" name="Site Name" component={Cameras} />
                <Route path="/video/:id" name="Site Full Screen Video" component={FullScreenVideo} />
                <Route path='/' component={DefaultLayout} />
              </Switch>
            </HashRouter>
          </ThemeWrapper>
        </Provider>
      </React.Fragment>
    );
  }
}

export default App;
