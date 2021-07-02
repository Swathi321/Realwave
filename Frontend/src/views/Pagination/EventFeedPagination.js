import * as React from 'react';
import Util from '../../Util/Util';
import CameraCard from '../../component/CameraCard';
import InfiniteScroll from "react-infinite-scroll-component";

export default class EventFeedPagination extends React.PureComponent {
    constructor(props) {
        super(props);
        this.state = {
            items: []
        }
    }

    fetchMoreData = () => {
        this.props.paginateEvent()
    };

    componentWillReceiveProps(nextProps) {
        let me = this;
        if (nextProps.selectedOption !== this.props.selectedOption) {
            me.setState({ items: [] }, () => {
                if (nextProps.data !== this.props.data) {
                    if (nextProps.data.length > 0) {
                        nextProps.data.map((d, i) => {
                            me.state.items.push(d);
                        })
                    }
                }
            })
        } else {
            if (nextProps.data !== this.props.data) {
                if (this.props.page == 0) {
                    me.setState({ items: [] }, () => {
                        if (nextProps.data.length > 0) {
                            nextProps.data.map((d, i) => {
                                me.state.items.push(d);
                            })
                        }
                    })
                }
                if (nextProps.data.length > 0) {
                    nextProps.data.map((d, i) => {
                        me.state.items.push(d);
                    })
                }
            }
        }
    }

    renderItem = (item, index) => {
        const { onSelectReceipt, col, tabcol } = this.props;
        item.image = Util.serverUrl + "/api2/eventVideoThumbnail?tid=" + item._id + "&EventTime=" + item.EventTime;
        return (
            <CameraCard
                onClick={() => onSelectReceipt(item)}
                className="cursor"
                key={item.InvoiceId + '_' + item.EventId} xs={12} sm={tabcol} md={tabcol} lg={col}
                transactionNumber={item.InvoiceId}
                status={item.Status}
                register={item.Register}
                imagePath={item.image}
                IsVideoAvailable={item.IsVideoAvailable}
                IsImageAvailable={item.IsImageAvailable}
                item={item}
                index={index}
            />
        )
    }

    render() {
        const { items } = this.state;
        let winHeight = window.innerHeight - 228 + "px";
        return (
            <div id="scrollableDiv" style={{ height: winHeight, overflow: "auto" }}>
                <InfiniteScroll
                    dataLength={items.length}
                    next={this.fetchMoreData}
                    hasMore={true}
                    scrollableTarget="scrollableDiv">
                    <div className={"row cardCardMargin"}>
                        {items.map((i, index) => { return this.renderItem(i, index) }

                        )}
                    </div>
                </InfiniteScroll>
            </div>
        );
    }
}
