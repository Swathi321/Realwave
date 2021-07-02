import React from 'react';
import PropTypes from 'prop-types';
import Hls from 'hls.js';
import classnames from 'classnames';
import utils from '../Util/Util';

class TimelineHLSPLayer extends React.PureComponent {
    constructor(props) {
        super(props);

        this.hls = null;
        this.player = null;
        this.timeout = null;

        this.isUnmounted = false;
    }

    componentDidUpdate() {
        this._initPlayer();
    }

    componentDidMount() {
        this._initPlayer();
    }

    componentWillUnmount() {
        this.isUnmounted = true;
        this.dispose();
    }

    dispose() {
        if (this.hls) {
            this.hls.destroy();
        }
        if (this.player) {
            this.player.removeEventListener('loadstart', null);
            this.player.removeEventListener('contextmenu', null);
            this.player.removeEventListener('canplay', null);
            this.player.removeEventListener('error', null);
        }
    }

    refresh = () => {
        this.dispose();
        clearTimeout(this.timeout);
        this.timeout = setTimeout(() => {
            if (!this.isUnmounted) {
                this._initPlayer();
            }
        }, 3000);
    }

    _initPlayer() {
        if (this.hls) {
            this.hls.destroy();
        }
        let { url, autoplay, hlsConfig, camId } = this.props;
        if (url) {
            this.player = this.refs[`TIMELINE_PLAYER_${camId}`];
            let hls = new Hls(hlsConfig);
            hls.loadSource(url);
            hls.attachMedia(this.player);
            this.player.addEventListener('contextmenu', (e) => {
                e.preventDefault();
                return false;
            })

            hls.on(Hls.Events.MANIFEST_LOADED, () => {
                if (autoplay) {
                    this.player.play().then(res => {
                        // Automatic playback started!
                        // Show playing UI.
                    }).catch(error => {
                        console.log("streaming not ready...");
                    });
                }
            });

            hls.on(Hls.Events.ERROR, this.refresh);

            this.player.onloadstart = (event) => {
                this.player.classList.add("video-loader");
                this.player.setAttribute("poster", `${utils.serverUrl}/images/loading.svg`);
            }

            this.player.oncanplay = (event) => {
                this.player.classList.remove("video-loader");
                this.player.removeAttribute("poster");
            }

            this.player.onerror = (event) => {
                //todo
            }

            this.hls = hls;
        }
    }

    onEnd = (e) => {
        this.refresh();
    }

    render() {
        const { controls, width, height, videoProps, camId, onChange } = this.props;
        let vidClass = classnames({
            'red5pro-media': true,
            'red5pro-media-background': true
        });
        return (
            <div key={camId} >
                <video ref="player" style={{ position: 'relative' }} ref={`TIMELINE_PLAYER_${camId}`} draggable={true}
                    preload="none"
                    autoPlay={true}
                    className={vidClass}
                    id={`TIMELINE_PLAYER_${camId}`}
                    controls={controls}
                    width={width}
                    height={height}
                    onChange={onChange}
                    onEnded={this.onEnd}
                    {...videoProps}>
                </video>
            </div>
        )
    }
}

TimelineHLSPLayer.propTypes = {
    url: PropTypes.string.isRequired,
    autoplay: PropTypes.bool,
    hlsConfig: PropTypes.object, //https://github.com/dailymotion/hls.js/blob/master/API.md#fine-tuning
    controls: PropTypes.bool,
    width: PropTypes.number,
    height: PropTypes.number,
    poster: PropTypes.string,
    videoProps: PropTypes.object
}

TimelineHLSPLayer.defaultProps = {
    autoplay: false,
    hlsConfig: {},
    controls: true,
    width: 500,
    height: 375
}

export default TimelineHLSPLayer;