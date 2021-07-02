import React, { Component } from 'react';
import { connect } from 'react-redux';
import { getSales, saveActivityLog, updateReceipt, getReceipt, universalSearch } from '../../redux/actions/httpRequest';
import SalesBase from '../Sales/SalesBase';
import common from '../../common';
import utils from '../../Util/Util';
import { Tooltip } from 'antd';
import noVideoBlack from '../../assets/img/Newicon/no_video_black.svg';
import noVideoWhite from '../../assets/img/Newicon/no_video_white.svg';

class Search extends SalesBase {

  getColumns() {
    return [
      {
        key: 'StoreId', name: 'STORE ID', width: 110, sort: true, type:"storegrid", filter: true, formatter: (props, record) => {
          let title = `Event Id: ${record.EventId} <br /> Store: ${record.StoreId && record.StoreId.name ? record.StoreId.name : ""} <br /> Category: ${record.Category  ? record.Category.join(",") : ""}
          <br /> Item Discount: ${record.Discount} <br /> Camera: ${record.CamId && record.CamId.name ? record.CamId.name : ""}`;
          return (
            <Tooltip title={<div dangerouslySetInnerHTML={{ __html: title }} />} >{props}</Tooltip >
          )
        }
      },
      { key: 'InvoiceId', name: 'Invoice Id', width: 120, sort: true, filter: true, type:"numeric", align: 'right' },
      { key: 'EventId', name: 'Event Id', width: 120, sort: true, filter: true, type:"numeric", align: 'right', hidden: true, type: 'numeric' },
      { key: 'EventTime', name: 'Event Time', width: 180, sort: true, filter: true, type: 'date' },
      { key: 'OperatorName', name: 'Operator Name', width: 165, sort: true, filter: true },
      { key: 'Register', name: 'Register', width: 120, type:"numeric", sort: true, filter: true, align: 'right' },
      { key: 'Status', name: 'Status', width: 100, sort: true, filter: true },
      { key: 'Total', name: 'Total', width: 100, sort: true, filter: true, type:"total", align: 'right', currency: true, formatter: (props, record) => { return (record.SubTotal + record.Tax).toFixed(2) } },
      { key: 'StoreName', name: 'Store', width: 140, sort: true, filter: true, hidden: true },
      { key: 'CamName', name: 'Camera', width: 140, sort: true, filter: true, hidden: true },
      { key: 'Category', name: 'Category', width: 120, sort: true, filter: true, hidden: true },
      { key: 'ItemId', name: 'Item Id', width: 100, sort: true, filter: true, type:"numeric", align: 'right', hidden: true },
      { key: 'Name', name: 'Name', width: 120, sort: true, filter: true },
      { key: 'Price', name: 'Price', width: 90, sort: true, filter: true, type:"numeric", align: 'right', currency: true },
      { key: 'Qty', name: 'Quantity', width: 120, sort: true, filter: true, type:"numeric", align: 'right', hidden: true },
      { key: 'Discount', name: 'Item Discount', width: 160, sort: true, filter: true, type:"numeric", align: 'right', hidden: true },
      {
        key: 'IsVideoAvailable',
        name: 'VIDEO',
        width: 70,
        export: false,
        sort: true,
        formatter: (props, record, index, scope) => {
        return (
          <div
            className="cursor"
            // onClick={() => this.playCamera(record)}
          >
            {
              !record.IsVideoAvailable
                ? <img src={scope.props.appliedTheme.className === 'theme-dark' ? noVideoWhite : noVideoBlack} alt="noVideo" className='width_1_5em no-video' />
                : (
                  <div className="gridVideoContainer video-thumbnail">
                    <img className="image-video-js" src={utils.serverUrl + "/api/eventVideoThumbnail?tid=" + record._id} />
                  </div>
                )
            }
          </div>
        )}
      }
    ];
  }

  // componentWillReceiveProps(nextProps) {
    // const { receiptActionName } = this.props;
    // if (nextProps[receiptActionName] !== this.props[receiptActionName]) {
    //   let { data, error, isFetching } = nextProps[receiptActionName];
    //   let valid = common.responseHandler(data, error, isFetching);
    //   if (valid) {
    //     this.setState({ isOpen: this.state.isGridView, currentReceipt: data.data, isGridView: this.state.isGridView });
    //   }
    // }
    // utils.updateGrid(this, nextProps, 'sales');
  // }

  // playCamera = (row) => {
  //   if (row.IsVideoAvailable) {
  //     this.props.dispatch(this.props.receiptAction.request({ InvoiceId: row.InvoiceId }));
  //   }
  // }
  // componentDidUpdate() {
  //   let { isOpen } = this.state
  //   // on Playing Video scroll should be at last.
  //   let antTable = document.getElementsByClassName('ant-table-body');
  //   if (isOpen && antTable && antTable.length > 0) {
  //     document.getElementsByClassName('ant-table-body')[0].scrollBy(9000, 0);
  //   }
  // }
}

Search.defaultProps = {
  listAction: universalSearch,
  actionName: 'universalSearch',
  receiptAction: getReceipt,
  receiptActionName: 'getReceipt',
  updateReceiptAction: updateReceipt,
  updateReceiptActionName: 'updateReceipt',
  sortColumn: 'EventTime',
  sortDirection: 'DESC',
  isExchange: true,
}

function mapStateToProps(state, ownProps) {
  return {
    getSales: state.getSales,
    universalSearch: state.universalSearch,
    getReceipt: state.getReceipt,
    updateReceipt: state.updateReceipt,
    getGridData: getSales,
    storesData: state.storesData,
    storeChange: state.storeChange,
    getGridFilter: state.getGridFilter,
    theme: state.theme
  };
}
var SearchModule = connect(mapStateToProps)(Search);
export default SearchModule;
