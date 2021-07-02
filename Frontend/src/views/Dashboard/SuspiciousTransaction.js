import React, { PureComponent } from 'react';
import { suspiciousTransactions, getReceipt } from '../../redux/actions/httpRequest';
import { connect } from 'react-redux';
import utils from '../../Util/Util';
import ReactLoading from 'react-loading';


export class SuspiciousTransaction extends PureComponent {
    constructor() {
        super();
        this.state = {
            suspiciousTransaction: [],
            backgroundStatus:true
        }
    }

    componentDidMount() {
        let params = { page: 1, pageSize: 5, sort: 'EventTime', sortDir: 'DESC' };
        params = utils.updateSiteAndTagsFilter(this, params);
        this.props.dispatch(suspiciousTransactions.request(params));
    }

    componentWillReceiveProps(nextProps) {
        const { storeChange } = this.props;
        if ((nextProps['suspiciousTransactions'] && nextProps['suspiciousTransactions'] !== this.props['suspiciousTransactions'])) {
            const { data, isFetching } = nextProps['suspiciousTransactions'];
            if (!isFetching) {
                if (data) {
                    this.props.onDataLoaded(data.count, data.openCount)
                    this.setState({ suspiciousTransaction: storeChange.selectedStore.length > 0 && data.data || [] });
                }
            }
        }
    }

    onClickVideo = (item) => {
        
        const {checkedStatus}=this.props
        if (!item.IsVideoAvailable)
            return;

        this.props.dispatch(getReceipt.request({ InvoiceId: item.InvoiceId }));
        checkedStatus(this.state.backgroundStatus)
    }

    render() {
        const { suspiciousTransaction } = this.state;
        const { suspiciousTransactions } = this.props;
        let isFetching = suspiciousTransactions.isFetching;
        return (suspiciousTransaction && suspiciousTransaction.length && !isFetching > 0 ?
            <div>
                <div className="suspiciousTransaction-view">
                    {
                        suspiciousTransaction && suspiciousTransaction.map((item, index) => {
                            return <div className="data-row">
                                <div className="col-data">{item.OperatorName}</div>
                                <div className="col-data second">{item.Status}</div>
                                <div className="col-data">{item.Total}</div>
                                <div className="col-data" onClick={() => this.onClickVideo(item)}>{!item.IsVideoAvailable ?
                                    <i className="fa fa-ban gridVideoNotAvailable" /> :
                                    <div className="gridVideoContainer video-thumbnail">
                                        <img className="image-video-js" src={utils.serverUrl + "/api/eventVideoThumbnail?tid=" + item._id} />
                                    </div>
                                }
                                </div>
                            </div>
                        })
                    }
                </div>
                <div className="text-center cursor show-more" onClick={() => { { this.props.history.push('/transaction/suspicioustransactions') } }}>Show More</div>
            </div> : isFetching ? <div id="overlay"><div id="overlay-loader"><ReactLoading type={'bars'} color={'#ffffff'} height={50} width={50} /></div></div> : <p className="empty-result">No result found</p>
        )
    }
}

function mapStateToProps(state, ownProps) {
    return {
        suspiciousTransactions: state.suspiciousTransactions,
        storeChange: state.storeChange
    };
}

var SuspiciousTransactionModule = connect(mapStateToProps)(SuspiciousTransaction);
export default SuspiciousTransactionModule;
