import React, { PureComponent } from 'react';
import util from './../../Util/Util';
import AntMediaPlayer from './AntMediaPlayer';
import { connect } from 'react-redux';
import { liveVideoClick } from './../../redux/actions';
import FLVPLayer from '../../component/FLVPlayer';
import Red5Player from './Red5Player';
import NodeMediaPlayer from './NodeMedia';
import HLSPlayer from '../ReactHLS';

class WebRTCPlayer extends PureComponent {

  get isRed5() {
    const { storeNotes } = this.props.config.storeId;
    return storeNotes && storeNotes.toLocaleLowerCase().indexOf("red5") > -1
  }

  get mediaInfo() {
    const { config } = this.props;
    const { mediaServerUrl, mediaServerOutboundPort } = config.storeId;
    let url = mediaServerUrl;

    if (url && url.length > 0) {
      let checkWildCard = url.split(".");
      if (checkWildCard && checkWildCard.length == 3) {
        let serverURL = url.split("//");
        url = serverURL[0] + "//" + config._id + "." + serverURL[1];
      }

      if (url.indexOf("rtmp") > -1) {
        url = url.replace('rtmp', 'http');
      }


      if (this.isValidURL(url)) {

        url = new URL(url);

        return {
          host: url.hostname,
          port: mediaServerOutboundPort
        }
      } else {
        return {
          host: 'z.realwave.io',
          port: 5080
        }
      }

    }
    return {
      host: 'z.realwave.io',
      port: 5080
    }
  }

  isValidURL = (string) => {
    var res = string.match(/(http(s)?:\/\/.)?(www\.)?[-a-zA-Z0-9@:%._\+~#=]{2,256}\.[a-z]{2,6}\b([-a-zA-Z0-9@:%_\+.~#?&//=]*)/g);
    return (res !== null)
  };

  render() {
    const { componentKey, is360, refreshing, token, config, url, isSingleLayout, liveVideoClick, isFullScreen, stretchProperty, secondaryStream, videoIndex, isAIStream, liveVideScope, isDewarpEnable, isOnDemandPlay, onStateChange } = this.props;

    let currentURL = window.location.href.toLowerCase();
    let videoConfigType = this.props.config && this.props.config.storeId && this.props.config.storeId.liveVideoConfig ? this.props.config.storeId.liveVideoConfig : 'WebRTC';
    if (videoConfigType == 'NodeMedia' && this.props.config && (this.props.config.cameraType == "360" || is360)) {
      videoConfigType = 'FLV';
    }
    return this.isRed5 ? <Red5Player
      camId={config._id}
      storeId={config.storeId._id}
      token={token}
      siteConfig={this.props.config}
      mediaInfo={this.mediaInfo}
      componentKey={componentKey}
      is360={is360}
      refreshing={refreshing}
    /> : videoConfigType == 'HLS' ?
      <HLSPlayer controls={false}
        autoplay={true}
        storeId={config.storeId._id}
        siteConfig={this.props.config}
        componentKey={componentKey}
        is360={is360}
        url={url}
      /> : videoConfigType == 'FLV' ?

        liveVideoClick != false && <FLVPLayer
          camId={config._id}
          liveVideScope={liveVideScope}
          videoIndex={videoIndex}
          storeId={config.storeId._id}
          componentKey={componentKey}
          controls={false}
          isSingleLayout={isSingleLayout}
          is360={is360}
          siteConfig={this.props.config}
          url={url}
          stretchProperty={stretchProperty}
          config={config}
          secondaryStream={secondaryStream}
          isAIStream={isAIStream}
          isDewarpEnable={isDewarpEnable}
          onStateChange={onStateChange}
        /> :

        videoConfigType == 'NodeMedia' ?
          liveVideoClick != false && <NodeMediaPlayer
            camId={config._id}
            liveVideScope={liveVideScope}
            videoIndex={videoIndex}
            singleLayoutStream={isSingleLayout}
            secondaryStream={secondaryStream}
            storeId={config.storeId._id}
            siteConfig={this.props.config}
            componentKey={componentKey}
            controls={false}
            is360={is360}
            url={url ? url : config.flv.highStreamURL}
            config={config}
            isAIStream={isAIStream}
            isDewarpEnable={isDewarpEnable}
            onStateChange={onStateChange}
          /> :
          liveVideoClick != false && <AntMediaPlayer
            camId={config._id}
            liveVideScope={liveVideScope}
            videoIndex={videoIndex}
            isFullScreen={isFullScreen}
            storeId={config.storeId._id}
            siteConfig={this.props.config}
            isSingleLayout={isSingleLayout}
            secondaryStream={secondaryStream}
            token={token}
            mediaInfo={this.mediaInfo}
            componentKey={componentKey}
            is360={is360}
            stretchProperty={stretchProperty}
            refreshing={refreshing}
            isAIStream={isAIStream}
            isDewarpEnable={isDewarpEnable}
            isOnDemandPlay={isOnDemandPlay}
            onStateChange={onStateChange}
          />
  }
}

function mapStateToProps(state, ownProps) {
  return {
    liveVideoClick: state.liveVideoClick
  };
}

var WebRTCModule = connect(mapStateToProps)(WebRTCPlayer);
export default WebRTCModule;

