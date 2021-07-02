import React from 'react';
import PropTypes from 'prop-types';
import Hls from 'hls.js';
import classnames from 'classnames';
import utils from '../Util/Util';

class ReactHls extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            playerId: Date.now()
        };

        this.hls = null;
    }

    componentDidUpdate() {
        this._initPlayer();
    }

    componentDidMount() {
        this._initPlayer();
    }

    componentWillUnmount() {
        let { hls } = this;

        if (hls) {
            hls.destroy();
        }
    }

    _initPlayer() {
        if (this.hls) {
            this.hls.destroy();
        }
        let { url, autoplay, hlsConfig, is360 } = this.props;
        if (url) {

            let player = this.refs[`react-hls-${this.state.playerId}`];
            let hls = new Hls(hlsConfig);
            if (is360) {
                
                var HLSplayer = window.videojs(player, {}, function () { });
                HLSplayer.panorama({
                    clickAndDrag: true,
                    autoMobileOrientation: true,
                    maxLat: -10,
                    initLat: -10,
                    rotateX: -Math.PI,
                    videoType: 'fisheye',
                    MouseEnable: true,
                });
            }
            hls.loadSource(url);
            hls.attachMedia(player);
            player.addEventListener('contextmenu', (e) => {
                e.preventDefault();
                return false;
            })

            hls.on(Hls.Events.MANIFEST_LOADED, () => {
                if (autoplay) {
                    player.play().then(res => {
                        // Automatic playback started!
                        // Show playing UI.
                    }).catch(error => {
                        console.log("streaming not ready...");
                    });
                }
            });

            hls.on(Hls.Events.ERROR, function (event, data) {
                if (data.fatal) {
                    switch (data.type) {
                        case Hls.ErrorTypes.NETWORK_ERROR:
                            // try to recover network error
                            console.log("fatal network error encountered, try to recover");
                            hls.startLoad();
                            break;
                        case Hls.ErrorTypes.MEDIA_ERROR:
                            console.log("fatal media error encountered, try to recover");
                            hls.recoverMediaError();
                            break;
                        default:
                            // cannot recover
                            hls.destroy();
                            break;
                    }
                } else {
                    setTimeout(() => { hls.startLoad(); }, 2000)
                }
            });

            player.onloadstart = function (event) {
                player.classList.add("video-loader");
                player.setAttribute("poster", `${utils.serverUrl}/images/loading.svg`);
            }

            player.oncanplay = function (event) {
                player.classList.remove("video-loader");
                player.removeAttribute("poster");
            }

            player.onerror = function (event) {
                //todo
            }

            this.hls = hls;
        }

    }

    render() {
        let { playerId } = this.state;
        const { controls, width, height, videoProps, componentKey } = this.props;
        let vidClass = classnames({
            'red5pro-media': true,
            'red5pro-media-background': true
        });
        return (
            <div key={playerId} >
                <video style={{ position: 'inherit' }} ref={`react-hls-${playerId}`} draggable={true}
                    preload="none"
                    className={vidClass}
                    id={`LIVE_VIDEO_PLAYER_${componentKey}`}
                    controls={controls}
                    width={width}
                    height={height}
                    {...videoProps}></video>
            </div>
        )
    }
}

ReactHls.propTypes = {
    url: PropTypes.string.isRequired,
    autoplay: PropTypes.bool,
    hlsConfig: PropTypes.object, //https://github.com/dailymotion/hls.js/blob/master/API.md#fine-tuning
    controls: PropTypes.bool,
    width: PropTypes.number,
    height: PropTypes.number,
    poster: PropTypes.string,
    videoProps: PropTypes.object
}

ReactHls.defaultProps = {
    autoplay: false,
    hlsConfig: {},
    controls: true,
    width: 500,
    height: 375
}

export default ReactHls;