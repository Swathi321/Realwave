import * as React from 'react';
import Util from '../../Util/Util';
import FaceCard from './FaceCard';
import InfiniteScroll from "react-infinite-scroll-component";

export default class UserFacesPagination extends React.PureComponent {
    constructor(props) {
        super(props);

    }

    renderFaceCard(item, index) {
        let widths = window.innerWidth < 1025;
        item.image = this.getImage(item);
        let col = this.props.isAdd && widths ? 6 : this.props.isAdd ? 4 : widths ? 4 : 2;
        return (
            <FaceCard
                onClick={() => this.props.onSelectFace(item)}
                className="cursor"
                key={index} xs={12} sm={col} md={col}
                imagePath={item.image}
                item={item}
            />
        )
    }

    getImage(item) {
        return Util.serverUrl + "/api/facesThumbnail/" + item.Id + "/" + item.Face
    }

    render() {
        const { data, paginateEvent, hasMore } = this.props;
        let winHeight = window.innerHeight - 228 + "px";
        return (
            <div id="scrollableDiv" style={{ height: winHeight, overflow: "auto" }}>
                <InfiniteScroll
                    dataLength={data.length}
                    next={paginateEvent ? paginateEvent : () => { }}
                    hasMore={hasMore}
                    scrollableTarget="scrollableDiv">
                    <div className={"row cardCardMargin"} >
                        {data && data.length > 0 &&
                            data.map((i, index) => {
                                return this.renderFaceCard(i, index)
                            })
                        }
                    </div>
                </InfiniteScroll>
            </div>
        );
    }
}