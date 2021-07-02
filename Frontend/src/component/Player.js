import React, { Component } from 'react';
import PropTypes from 'prop-types';

class Player extends Component {
    constructor(props) {
        super(props);

        this.state = {
            playerId: Date.now()
        }
        this.checkInterval = 5; // seconds
        this.readyStateOneDuration = 0;
        this.readyStateTwoDuration = 0;
        this.video = null;
        this.player = null;
        this.interval = null;
        this.parentRef = null;
    }

    componentWillUnmount() {
        if (this.player) {
            this.player.dispose();
        }
        if (this.interval) {
            clearInterval(this.interval);
        }
    }

    healthCheck() {
        var error = this.player.error();
        console.log(error);
        if (error) {
            this.play();
            return;
        }

        var readyState = this.player.readyState();
        console.log(readyState);
        switch (readyState) {
            case 0:
                this.play();
                return;
            case 1:
                this.readyStateOneDuration += this.checkInterval;
                break;
            case 2:
                this.readyStateTwoDuration += this.checkInterval;
                break;
            default:
                return;
        }

        if (this.readyStateOneDuration >= 20
            || this.readyStateTwoDuration >= 20) {
            this.play();
            return;
        }

    }

    play() {
        this.readyStateOneDuration = 0;
        this.readyStateTwoDuration = 0;
        if (!this.player) {
            this.player = window.videojs(this.video, {
                html5: {
                    nativeAudioTracks: false,
                    nativeVideoTracks: false,
                    hls: {
                        autoStartLoad: true,
                        debug: true,
                        overrideNative: true
                    }
                },
                children: { loadingSpinner: false }
            });
        }
        console.log(this.props.url)
        this.player.src({
            src: this.props.url,
            type: 'application/x-mpegURL',
            overrideNative: true
        });
        this.player.play();
    }

    startVideo(video) {
        if (video && !this.player) {
            this.video = video;
            this.player = window.videojs(video, {
                html5: {
                    nativeAudioTracks: false,
                    nativeVideoTracks: false,
                    hls: {
                        autoStartLoad: true,
                        debug: true,
                        overrideNative: true
                    }
                },
                children: { loadingSpinner: false }
            });

            this.video.addEventListener('contextmenu', (e) => {
                e.preventDefault();
                return false;
            })

            this.player.src({
                src: this.props.url,
                type: 'application/x-mpegURL',
                overrideNative: true
            });

            this.player.on('error', () => {
                setTimeout(() => {
                    this.play();
                }, 500)
            });

            this.player.on('ended', () => {
                setTimeout(() => {
                    this.play();
                }, 500)
            });
            this.player.loadingSpinner.hide();
            this.player.addClass('vjs-waiting')
            this.player.play();

            this.interval = setInterval(this.healthCheck.bind(this), this.checkInterval * 1000);
        }
    }

    render() {
        return (
            <div className="default-videoContainer-height" key={this.state.playerId}>
                <video id={`video-hls-${this.state.playerId}`} ref={this.startVideo.bind(this)} width={this.props.width} height={this.props.height} className="video-js vjs-default-skin" controls={this.props.controls} preload="auto" playsInline webkit-playsinline="" data-setup='{"children": {"loadingSpinner": false}}'>
                    <source src={this.props.url} type="application/x-mpegURL" />
                </video>
            </div>
        );
    }
}

Player.propTypes = {
    width: PropTypes.string.isRequired,
    height: PropTypes.string.isRequired,
    url: PropTypes.string.isRequired,
};

export default Player;