import { getTopSellingItems } from '../../redux/actions/httpRequest';
import { connect } from 'react-redux';
import SalesBase from './SalesBase';

class TopSelling extends SalesBase {

    gridOverrides = {
        grid: { rowSelection: { showCheckbox: false } },
        sortInfo: { sortColumn: 'count' }
    };

    getColumns() {
        return [
            { key: 'Name', name: 'Description', width: 210, filter: true, sort: true, type: 'string' },
            { key: 'Total', name: 'Price', width: 120, filter: true, sort: true, align: 'right', type: 'numeric', currency: true  },
            { key: 'Category', name: 'Item Type', filter: true, sort: true, width: 180, type: 'string' },
            { key: 'count', name: 'Count',width: 50,  filter: false, sort: true }
        ];
    }
}

TopSelling.defaultProps = {
    listAction: getTopSellingItems,
    actionName: 'getTopSellingItems',
    sortColumn: 'count',
    sortDirection: 'DESC'
}

function mapStateToProps(state, ownProps) {
    return {
        getTopSellingItems: state.getTopSellingItems,
        updateGridData: state.updateGridData
    };
}

var TopSellingModule = connect(mapStateToProps)(TopSelling);
export default TopSellingModule;
