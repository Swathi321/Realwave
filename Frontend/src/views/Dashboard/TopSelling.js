import React, { PureComponent } from 'react';
import { getTopSelling } from './../../redux/actions/httpRequest';
import { connect } from 'react-redux';
import { Table } from 'reactstrap';
import util from '../../Util/Util';
import ReactLoading from 'react-loading';

export class TopSelling extends PureComponent {
    constructor() {
        super();
        this.state = {
            topSellingData: []
        }
    }

    componentDidMount() {
        let params = { page: 1, pageSize: 5, sort: 'count', sortDir: 'DESC' };
        params = util.updateSiteAndTagsFilter(this, params);
        this.props.dispatch(getTopSelling.request(params));
    }

    componentWillReceiveProps(nextProps) {
        const { storeChange } = this.props;
        if ((nextProps['getTopSelling'] && nextProps['getTopSelling'] !== this.props['getTopSelling'])) {
            const { data, isFetching } = nextProps['getTopSelling'];
            if (!isFetching) {
                if (data) {
                    this.setState({ topSellingData: storeChange.selectedStore.length > 0 && data.data || [] });
                }
            }
        }
    }

    render() {
        const { topSellingData } = this.state;
        const { getTopSelling } = this.props;
        let isFetching = getTopSelling.isFetching;
        return (topSellingData && topSellingData.length && !isFetching > 0 ?
            <div>
                <Table hover responsive className="table-outline table table-hover">
                    <thead>
                        <tr>
                            <th className="dashboard-table-border-top">NAME</th>
                            <th className="dashboard-table-border-top">TYPE</th>
                            <th className="dashboard-table-border-top">SALES</th>
                            <th className="dashboard-table-border-top">TREND</th>
                        </tr>
                    </thead>
                    <tbody>
                        {
                            topSellingData.map(function (item, index) {
                                return (<tr key={index}>
                                    <td className="dashboard-table-border-top">{item.Description}</td>
                                    <td className="dashboard-table-border-top">{item.ItemType}</td>
                                    <td className="dashboard-table-border-top">${item.UnitPrice}</td>
                                    <td className="dashboard-table-border-top">
                                        <div className={"small" + item.isSaleDown ? 'topselling-down-color' : 'topselling-up-color'}>{item.upDownPrice} <i className={item.isSaleDown ? 'fa fa-arrow-down' : 'fa fa-arrow-up'} /></div>
                                    </td>
                                </tr>)
                            }, this)
                        }
                    </tbody>
                </Table>
                <div className="text-center cursor show-more" onClick={() => { this.props.history.push('/sales/topsellingitem') }}>Show More</div>
            </div > : isFetching ? <div id="overlay"><div id="overlay-loader"><ReactLoading type={'bars'} color={'#ffffff'} height={50} width={50} /></div></div> : <p className="empty-result">No result found</p>
        );
    }
}

function mapStateToProps(state, ownProps) {
    return {
        getTopSelling: state.getTopSelling,
        storeChange: state.storeChange
    };
}

var TopSellingModule = connect(mapStateToProps)(TopSelling);
export default TopSellingModule;