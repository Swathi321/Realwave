import React, { PureComponent } from 'react';
// import ReactPlayer from 'reactjs-player';
import { connect } from 'react-redux';

class ThreeSixtyComp extends PureComponent {
  constructor(props) {
    super(props);
    this.player = null;
    this.isUnmounted = false;
  }

  // initializePlayer = () => {
  //   let id = `LIVE_VIDEO_PLAYER_${this.props.componentKey}`;
  //   const options = { controls: false };
  //   return new Promise((resolve, reject) => {
  //     try {
  //       new window.videojs(id, options, function onPlayerReady() {
  //         resolve(this);
  //       });
  //     } catch (error) {
  //       reject(error);
  //     }
  //   })
  // }

  // componentWillUnmount() {
  //   this.isUnmounted = true;
  //   if (this.player) {
  //     this.player.dispose();
  //   }
  // }

  // componentDidMount() {
  //   this.initializePlayer().then((player) => {
  //     this.player = player;
  //     let { url, type } = this.props;
  //     player.src({ src: url, type: "video/flv" });
  //     if (type == "360") {
  //       player.panorama({
  //         autoMobileOrientation: true,
  //         maxLat: -10,
  //         initLat: -10,
  //         rotateX: -Math.PI,
  //         videoType: 'fisheye',
  //         MouseEnable: true,
  //         clickAndDrag: false,
  //         callback: () => { //TODO
  //           this.player.play();
  //         }
  //       })
  //     } else {//TODO
  //       this.player.play();
  //     }
  //   }).catch(() => {
  //     console.log('videojs is not defined')
  //   })
  // }

  // onEnded = () => {
  //   if (!this.isUnmounted) {
  //     this.forceUpdate();
  //   }
  // }

  // componentDidUpdate(prevProps, prevState) {
  //   if ((prevProps.layout !== this.props.layout) && this.player) {
  //     var canvas = this.player.getChild('Canvas');
  //     if (canvas) {
  //       canvas.handleResize();
  //     }
  //   }
  // }

  render() {
    const { timelinePlayer, componentKey, controls, url } = this.props;
    return <div />
    // const toRender = <ReactPlayer
    //   controls={false}
    //   kernel="flvjs"
    //   src={this.props.url} //Need to change server url according to multi port
    // />
    // return timelinePlayer && timelinePlayer.isPlay ? (timelinePlayer.isRegularSearch ? toRender : null) : toRender;
  }
}

function mapStateToProps(state, ownProps) {
  return {
    timelinePlayer: state.timelinePlayer
  };
}
export default connect(mapStateToProps)(ThreeSixtyComp);