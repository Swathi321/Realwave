import React, { PureComponent } from 'react'
import download from 'downloadjs';
import { Tooltip } from 'antd';
import posterImage from '../assets/img/logo.png';
import posterImage1 from '../assets/img/3x4.png';
import posterImage2 from '../assets/img/minLogo.png';
import posterImage3 from '../assets/img/SiteVideoIcon.png';
import utils from './../Util/Util';
import OverlayerGraph from './OverlayerGraph';
import common from '../common';
import LoadingDialog from '../component/LoadingDialog';
import { connect } from "react-redux";
import shareIcon from '../assets/img/Newicon/share.ico';
import downloadIcon from '../assets/img/Newicon/download.ico';
import { getPlayUrl } from './../redux/actions/httpRequest';


function getComputedStyle(el, pseudo) {
  return function (prop) {
    if (window.getComputedStyle) {
      return window.getComputedStyle(el, pseudo)[prop];
    } else {
      return el.currentStyle[prop];
    }
  };
}

function getScrollOffset() {
  if (window.pageXOffset) {
    return {
      x: window.pageXOffset,
      y: window.pageYOffset
    };
  }
  return {
    x: document.documentElement.scrollLeft,
    y: document.documentElement.scrollTop
  };
};

function offsetParent(el) {
  if (el.nodeName !== 'HTML' && getComputedStyle(el)('position') === 'static') {
    return offsetParent(el.offsetParent);
  }
  return el;
}



class ReactVideoPlayer extends React.Component {
  constructor(props) {
    super(props);

    this.id = new Date().valueOf();
  }

  componentDidMount() {
    let me = this;
    const options = {
      controlBar: {
        volumeMenuButton: {
          inline: false,
          vertical: true
        }
      }
    };
    if (this.props.IsVideoAvailable) {
      this.player = window.videojs("video_" + this.id, options);
      this.player.ready(() => {
        window.thumb(this.player);

        // Stop loader
        this.player.on(['play', 'suspend', 'abort', 'error'], function (e) {
          me.setState({ showSpinner: false });
        });
        let overLayerId = document.getElementById("overLayer-view");
        if (overLayerId) {
          overLayerId.style["visibility"] = "hidden";
          this.player.setTime = setTimeout(function () {
            me.player.overlay({
              align: "bottom-right",
              content: overLayerId
            });
          }, 100);
        }


        this.player.on('fullscreenchange', function (e) {

          if (this.isFullscreen() && document.getElementById("overLayer-view")) {
            document.getElementById("overLayer-view").style["visibility"] = "visible";
          } else {
            document.getElementById("overLayer-view").style["visibility"] = "hidden";
          }
        });

        this.player.play();
      });
    } else {
      me.setState({ showSpinner: false })
    }
  }
  render() {
    const { poster, dataSetup, videoPath, vttPath } = this.props;
    return (<>
      {
        videoPath &&
        <video
          id={"video_" + this.id}
          className="video-js vjs-default-skin video-height"
          poster={poster}
          controls
          autoPlay
          preload="none"
          data-setup={JSON.stringify(dataSetup)}
        >
          <source src={videoPath} type='video/mp4' />
          <track src={vttPath} kind="metadata" default={false} />
        </video>
      }
    </>
    )
  }
}

class VideoPlayerRreact extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      isFull: false,
      showSpinner: true,
      azureFilePath: null
      // videoPath: '' #25985 - Portal || Mobile Event Video Enhancement
    }

    this.id = null;
    this.player = null;
    this.setTime = null;
    this.toastId = null;
  }

  componentWillUnmount() {
    if (this.player) {
      this.player.dispose();
      clearTimeout(this.setTime);
    }
  }
  componentDidMount() {
    let { data, modelName, videoId } = this.props;
    let { _id } = data && data.event || {};
    let params = {};
    if (videoId) {
      if (modelName) {
        params = {
          tid: videoId, play: true, modelName: modelName
        };
      }
      else {
        params = {
          tid: videoId, play: true
        };
      }
    }
    else {
      if (modelName) {
        params = {
          tid: _id, play: true, modelName: modelName
        };
      }
      else {
        params = {
          tid: _id, play: true
        };
      }
    }
    // #25985 - Portal || Mobile Event Video Enhancement
    this.props.dispatch(getPlayUrl.request(params, null, null, (res) => {
      if (res) {
        this.setState({ azureFilePath: res.uri });
      }
    }));
  }

  render() {
    let { IsVideoAvailable, height, data, downloadVideo, showHideModal, graphData, videoId, getReceipt, modelName, fromVideoClip } = this.props;
    let { azureFilePath } = this.state;
    let { InvoiceId, _id } = data && data.event || {};
    let videoPath = '', poster = '', vttPath = '', downloadUrl = '';
    // let { videoPath } = this.state;
    //let uniqueId = utils.guid(true);
    // Base url make a common function.

    let dataSetup = {};
    dataSetup.fluid = true
    dataSetup.height = height || 400;
    dataSetup.controlBar = {
      fullscreenToggle: true,
      volumeMenuBar: true,
      muteToggle: true,
      volumeControl: true
    }
    let iOS = window.navigator.userAgent.match(/iPad|iPhone|iPod/);
    console.log(getReceipt);
    return (
      <div className={'video-player-react'}>
        {/* {this.state.showSpinner ? <LoadingDialog isOpen={true} /> : null} */}
        {IsVideoAvailable && !getReceipt.isFetching ?
          <React.Fragment>
            <span>
              {azureFilePath && <ReactVideoPlayer videoPath={azureFilePath} vttPath={vttPath} poster={poster} dataSetup={dataSetup} data={data} IsVideoAvailable={IsVideoAvailable}></ReactVideoPlayer>}
            </span>
            {downloadVideo ?
              <div>
                <Tooltip placement="bottom" title={'Share'}>
                  <a className={'download-share'}
                    onClick={() => azureFilePath ? showHideModal(azureFilePath) : null}>
                    <img src={shareIcon} alt="shareIcon" className='share_icon_width' />
                  </a>
                </Tooltip>
                <Tooltip placement="bottom" title={'Download'}>
                  {modelName == "realwaveVideoClip" ? <a className={'download-video'} href={azureFilePath} download={data && data.event && data.event._id}>
                    {!iOS && <img src={downloadIcon} alt="downloadIcon" className='share_icon_width' />}
                  </a> : <a className={'download-video'}
                    onClick={() => window.downloadRequest && window.downloadRequest(downloadUrl, InvoiceId)}>
                    {!iOS && <img src={downloadIcon} alt="downloadIcon" className='share_icon_width' />}
                  </a>}
                </Tooltip>
              </div> : null}
            <div style={{ visibility: 'hidden' }}>
              {!fromVideoClip && <OverlayerGraph data={data} graphData={graphData} />}
            </div>
          </React.Fragment> : <React.Fragment>
            {!getReceipt.isFetching ? <img src={require('./../assets/img/na.png')} className="video-player-vna" /> : null}
          </React.Fragment>}
      </div>
    )
  }
}

export default connect((state) => {
  return {
    getEventFeed: state.getEventFeed,
    getReceipt: state.getReceipt
  }
})(VideoPlayerRreact);
