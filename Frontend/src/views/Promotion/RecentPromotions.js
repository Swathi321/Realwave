import { getRecentPromotions } from '../../redux/actions/httpRequest';
import { connect } from 'react-redux';
import SalesBase from './../Sales/SalesBase';

class RecentPromotions extends SalesBase {

  gridOverrides = {
    grid: { rowSelection: { showCheckbox: false } },
    sortInfo: { sortColumn: 'type' }
  };

  getColumns() {
    return [
      { key: 'name', name: 'Name', width: 150 },
      { key: 'views', name: 'Views', width: 120, align: 'right' },
      { key: 'clicks', name: 'Clicks', width: 120, align: 'right' },
      { key: 'itemInCart', name: 'Items in cart', width: 150, align: 'right' },
      { key: 'purchase', name: 'Purchase', width: 150, align: 'right' }
    ];
  }
}

RecentPromotions.defaultProps = {
  listAction: getRecentPromotions,
  actionName: 'getRecentPromotions',
  hiddenExport: true
}

function mapStateToProps(state, ownProps) {
  return {
    getRecentPromotions: state.getRecentPromotions
  };
}

var RecentPromotionsModule = connect(mapStateToProps)(RecentPromotions);
export default RecentPromotionsModule;