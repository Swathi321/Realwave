import React from 'react'
import { Player } from 'video-react';
import utils from './../Util/Util';
import posterImage from '../assets/img/camsample/videoImage.jpg';
import VideoReceipt from '../component/VideoReceipt';
import download from 'downloadjs';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const streamDownloadVideoFile = (TransactionNumber, url) => {
	toast.success("Downloading...", { position: toast.POSITION.TOP_RIGHT, autoClose: 1000 });
	var req = new XMLHttpRequest();
	req.open('GET', url, true);
	req.responseType = 'blob';
	req.onload = function () {
		if (this.status === 200) {
			var videoBlob = this.response;
			download(videoBlob, TransactionNumber + ".mp4");
			toast.success("Download complete", { position: toast.POSITION.TOP_RIGHT, autoClose: 1000 });
		}
	}
	req.onerror = function () {
		toast.warn("Download Failed", { position: toast.POSITION.TOP_RIGHT, autoClose: 1000 });
	}
	req.send();

}

const VideoReact = (props) => {
	let { isFileDeleted, isShowExpandArea, height, data, overVideoReceipt, id, downloadVideo, showHideModal } = props;
	let { TransactionNumber } = data;

	if (!height) {
		height = '328';
	}

	let user = utils.getLoggedUser();
	//let path = TransactionNumber ? utils.baseUrl + 'transaction/' + TransactionNumber + '.mp4' : null;
	let thumbnail = isFileDeleted ? posterImage : '';
	let currentDate = new Date();
	let videoPath = utils.baseUrl + "download/playVideo?camId=" + 1 + "&userId=" + user._id + "&storeId=" + 10 + "&transactionNumber=" + TransactionNumber + "&v=" + currentDate;
	return <div>
		<ToastContainer />
		{isShowExpandArea ? <div className={'video-wrapper align-middle'} id={id} ></div> : null}
		{TransactionNumber ? <Player height={height} width={'100%'} fluid="false" playsInline poster={thumbnail}>
			<source src={videoPath} type="video/mp4" />
			{downloadVideo ? <div><div className={'download-share'} onClick={() => videoPath ? showHideModal(videoPath) : null}><i title="Share" className="fa fa-share-alt" aria-hidden="true"></i></div>
				<a className={'download-video'} onClick={() => streamDownloadVideoFile(TransactionNumber, videoPath)
				}><i title="Download" className="fa fa-download" aria-hidden="true"></i></a></div> : null}
			{overVideoReceipt ? <div className={'video-receipt-view'}>
				<VideoReceipt data={data} />
			</div> : null}
		</Player> : <img src={posterImage} height={height + 'px'} width={'100%'} className={"img-fluid"} />}
	</div>
}
export default VideoReact;


