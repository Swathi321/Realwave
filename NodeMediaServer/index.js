const NodeMediaServer = require('node-media-server');
const cluster = require('cluster')
const numCPUs = require('os').cpus().length;

let IsDev = (process.env.NODE_ENV || 'development') == 'development';

let config = {
	rtmp: {
		port: 1935,
		chunk_size: 60000,
		gop_cache: true,
		ping: 30,
		ping_timeout: 60
	},
	http: {
		port: 8000,
		allow_origin: '*',
		mediaroot: './media',
	},
	/* 	https: {
			port: 8443,
			allow_origin: '*',
			key:'./pkey.txt',
			cert:'./Realwave.cer',
			mediaroot: path.resolve('media')
		} */
	auth: {
		api: true,
		api_user: 'realwave',
		api_pass: 'Realwave2020!',
		play: true,
		publish: true,
		secret: '8f273cc043a2a6ebe764ebad7e7338d6'
	},
	trans: {
		ffmpeg: 'C://ffmpeg//bin//ffmpeg.exe',
		tasks: [
			{
				app: 'live',
				hls: true,
				hlsFlags: '[hls_time=2:hls_list_size=3:hls_flags=delete_segments]',
				dash: true,
				dashFlags: '[f=dash:window_size=3:extra_window_size=5]',
			},
		],
	},
	cluster: {
		num: numCPUs
	}
};


if (cluster.isMaster) {
	// Master:
	// Let's fork as many workers as you have CPU cores

	for (let i = 0; i < numCPUs; ++i) {
		cluster.fork()
	}
} else {
	// Worker:
	// Let's spawn a HTTP server
	// (Workers can share any TCP connection.
	//  In this case its a HTTP server)
	if (IsDev) {
		delete config["auth"]
	}
	let nms = new NodeMediaServer(config)
	nms.run();
}