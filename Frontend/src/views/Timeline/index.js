import React, { Component } from 'react';
import TimelinePlayer from './../../component/TimelinePlayer';
import CardWrapper from '../../component/CardWrapper';

class Timeline extends Component {
	render() {
		return (
			<div className="animated fadeIn">
				<CardWrapper title={'Timeline'} subTitle={'Recorded Video Feed'}>
					<TimelinePlayer width="100%" height="400px" storeId="5c34a57c65031db47c45aa1b" camId="5c3d98eb6cde00d84c40b263" />
				</CardWrapper>
			</div>
		);
	}
}
export default Timeline;
