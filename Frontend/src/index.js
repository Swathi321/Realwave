import 'react-app-polyfill/ie9'; // For IE 9-11 support
import 'react-app-polyfill/ie11'; // For IE 11 support
import "@babel/polyfill";
import React from 'react';
import ReactDOM from 'react-dom';
import App from './App';
import Util from './Util/Util'

// import WebRTCPlayer from './component/Player/WebRTCPlayer';

Util.initializeLogger();

// ReactDOM.render(<WebRTCPlayer componentKey={"5e71f4949f07ac3634dab5da"} />, document.getElementById('root'));
ReactDOM.render(<App />, document.getElementById('root'));