import React, { PureComponent } from 'react';
import flvjs from 'flv.js';
import hlsjs from 'hls.js'; // TODO
import 'mediaelement';

// Import stylesheet and shims
import 'mediaelement/build/mediaelementplayer.min.css';
import 'mediaelement/build/mediaelement-flash-video.swf';

class MediaElement extends PureComponent {

    constructor(props) {
        super(props)
        this.state = {
            playerId: Date.now(),
            player: null
        }
    }

    componentWillReceiveProps(nextProps) {
        let { player } = this.state;
        if (nextProps.isFull !== this.props.isFull) {
            if (nextProps.isFull && player) {
                this.playMedia(player)
            }
        }
    }


    playMedia = async (media) => {
        if (media != undefined && media != null) {
            try {
                console.log('video start playMedia ')
                await media.play();
            } catch (err) {
                console.log('video start playMedia err')
                console.log(err)
            }
        }
    }

    success(media, node, instance) {
        let mediaInstance = this.state.player;
        if (mediaInstance) {
            let url = mediaInstance.src;
            this.playMedia(mediaInstance)

            console.log('success')
            if (mediaInstance) {
                mediaInstance.addEventListener('play', () => {
                    console.log('video start play')
                }, false);


                mediaInstance.addEventListener('ended', () => {
                    console.log('video start ended')
                    this.playMedia(mediaInstance)
                }, false);


                mediaInstance.addEventListener('pause', () => {
                    console.log('video start pause')
                    this.playMedia(mediaInstance)
                }, false);


                if (window.Hls) {
                    mediaInstance.hlsPlayer.on(window.Hls.Events.MANIFEST_PARSED, (event, data) => {
                        console.log("manifest loaded, found MANIFEST_PARSED");
                        this.playMedia(mediaInstance)
                    });
                }


                if (mediaInstance.hlsPlayer && mediaInstance.hlsPlayer.addListener) {
                    console.log(`mediaInstance.hlsPlayer.addListener`);
                    mediaInstance.hlsPlayer.addListener('hlsError', (e, data) => {
                        switch (data.type) {
                            case window.Hls.ErrorTypes.NETWORK_ERROR:
                                // try to recover network error
                                console.log(`NETWORK_ERROR`);
                                if (data.details === window.Hls.ErrorDetails.MANIFEST_LOAD_ERROR || data.details === window.Hls.ErrorDetails.MANIFEST_LOAD_TIMEOUT || data.details === window.Hls.ErrorDetails.MANIFEST_PARSING_ERROR) {
                                    console.log(`data.details === window.Hls.ErrorDetails.MANIFEST_LOAD_ERROR`);
                                    if (mediaInstance != undefined && mediaInstance != null) {
                                        console.log(` data.details === window.Hls.ErrorDetails.MANIFEST_LOAD_ERROR mediaInstance`);
                                        mediaInstance.hlsPlayer.loadSource(url)
                                    }
                                }
                                else {
                                    if (mediaInstance != undefined && mediaInstance != null) {
                                        console.log(`data.details === window.Hls.ErrorDetails.MANIFEST_LOAD_ERROR mediaInstance != undefined && mediaInstance != null`);
                                        mediaInstance.hlsPlayer.startLoad()
                                    }
                                }
                                break

                            case window.Hls.ErrorTypes.MEDIA_ERROR:
                                console.log(`hlsjs: trying to recover from media error, evt ${e}, data ${data} `);
                                this.playMedia(mediaInstance)
                                break;
                            default:
                                console.log(`default `);
                                this.playMedia(mediaInstance)
                                break
                        }
                    })
                }

            }
        }
    }

    error(media, node) {
        let mediaInstance = this.state.player;
        console.log('error section');
        if (mediaInstance != undefined && mediaInstance != null) {
            console.log(`error section mediaInstance`);
            mediaInstance.play();
        }
    }

    render() {
        let props = this.props;
        let { playerId } = this.state;
        return props.url ? <div key={playerId} className="player-area default-videoContainer-height">
            <video id={`react-hls-${playerId}`} style={{ "maxWidth": "100%" }} preload={'none'} width={'100%'} autoPlay height={'100%'} loop={false} playsInline webkit-playsinline>
                <source src={props.url} type={props.type} />
            </video>
        </div> : null
    }

    componentDidMount() {
        const { MediaElementPlayer } = global;
        let { playerId } = this.state;
        if (!MediaElementPlayer) {
            return;
        }

        let id = document.getElementById(`react-hls-${playerId}`);
        const options = Object.assign({}, {
            pluginPath: 'https://cdnjs.com/libraries/mediaelement/',
            shimScriptAccess: 'always',
            pauseOtherPlayers: false,
            features: ['chromecast'],
            enableAutosize: true,
            iPadUseNativeControls: false,
            // force iPhone's native controls
            iPhoneUseNativeControls: false,
            // force Android's native controls
            AndroidUseNativeControls: false,
            stretching: 'responsive',
            enablePluginDebug: false,
            autoRewind: false,
            castIsLive: true,
            hls: {
                autoStartLoad: true
            },
            // width of audio player
            success: (media, node, instance) => this.success(media, node, instance),
            error: (media, node) => this.error(media, node)
        });
        window.flvjs = flvjs;
        // window.Hls = hlsjs; // close for local test


        this.setState({
            player: new MediaElementPlayer(id, options)
        });

    }

    componentWillUnmount() {
        if (this.state.player) {
            this.state.player.media.remove();
            this.setState({ player: null });
            console.log(`error component Will Unmount`);
        }
    }
}

export default MediaElement;