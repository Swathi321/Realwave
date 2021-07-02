import React, { PureComponent } from 'react';
import { Table, Row, Col, Card, CardBody, CardHeader, Modal, ModalHeader, ModalBody, ModalFooter, CardSubtitle, CardTitle, Button } from 'reactstrap';
import SalesChart from '../../component/SalesChart';
import StoreChart from '../../component/StoreChart';
import DashboardStrip from '../../component/DashboardStrip';
import { getDashboardData, dashboardConfigAction, saveActivityLog, getEventFeed, getCameraData, storesData, getPendingVideoClip, getCameraClipData } from '../../redux/actions/httpRequest';
import { connect } from 'react-redux';
import common from '../../common';
import { Responsive, WidthProvider } from 'react-grid-layout';
import './../../../node_modules/react-grid-layout/css/styles.css';
import './../../../node_modules/react-resizable/css/styles.css';
import utils from '../../Util/Util';
import { Button as AntButton, Tooltip } from 'antd';
import swal from 'sweetalert';
import Select from 'react-select';
import MapView from '../MapView/MapView'
import LoadingDialog from './../../component/LoadingDialog';
import TopVideoClips from './TopVideoClips';
import TopSelling from './TopSelling';
import SuspiciousTransaction from './SuspiciousTransaction';
import TopEvent from './TopEvent';
import consts from '../../Util/consts';
import moment from 'moment';
import { Bar } from 'react-chartjs-2';
import { CustomTooltips } from '@coreui/coreui-plugin-chartjs-custom-tooltips';
import { screenResizedReducer } from '../../redux/actions';
import ReactLoading from 'react-loading';
import PeopleCounting from '../../component/PeopleCounting';
import Grid from '../Grid/GridBase';
import dateUtils from '../../Util/dateUtil';
import DashboardSpirit from './DashboardSpirit';
import TicketCounter from './TicketCounter.js';
import axios from 'axios'
import serverAPI from '../../redux/httpUtil/serverApi'

const cardChartTopData = {
  labels: ['', '', '', '', '', '', '', '', '', '', '', '', '', '', '', ''],
  datasets: [
    {
      label: 'Sales',
      backgroundColor: 'rgba(1,210,108,1)',
      borderColor: 'transparent',
      data: [78, 81, 80, 45, 34, 12, 40, 75, 34, 89, 32, 68, 54, 72, 18, 98],
    },
  ],
};

const cardChartTopOpts = {
  tooltips: {
    enabled: false,
    custom: CustomTooltips
  },
  maintainAspectRatio: false,
  legend: {
    display: false,
  },
  scales: {
    xAxes: [
      {
        display: false,
        barPercentage: 0.6,
      }],
    yAxes: [
      {
        display: false,
      }],
  },
};

const ResponsiveGridLayout = WidthProvider(Responsive);

const RecentPromotion = (props, context) => {
  const { recentPromotions } = props.data || {};
  const { getDashboardData } = props;
  let isFetching = getDashboardData.isFetching;
  return (recentPromotions && recentPromotions.length > 0 && !isFetching ?
    <div>
      <Table hover responsive className="table-outline table table-hover table-bordered">
        <thead>
          <tr>
            <th>Name</th>
            <th>Views</th>
            <th>Clicks</th>
            <th>Items in cart</th>
            <th>Purchase</th>
          </tr>
        </thead>
        <tbody>
          {
            recentPromotions.map(function (item, index) {
              return (
                <tr key={index}>
                  <td>{item.name}</td>
                  <td className="text-right">{item.views}</td>
                  <td className="text-right">{item.clicks}</td>
                  <td className="text-right">{item.itemInCart}</td>
                  <td className="text-right">{item.purchase}</td>
                </tr>)
            }, this)
          }
        </tbody>
      </Table>
      <div className="text-center cursor show-more" onClick={() => { { props.history.push('/promotions/recentpromotions') } }}>Show More</div>
    </div> : isFetching ? <div id="overlay"><div id="overlay-loader"><ReactLoading type={'bars'} color={'#ffffff'} height={50} width={50} /></div></div> : null
  )
}

const filterOption = [
  { value: 'NoSales', label: 'No Sales' },
  { value: 'Void', label: 'Void' },
  { value: 'SavedSales', label: 'Sales' },
  { value: 'FaceEvents', label: 'Face' },
  { value: 'Alert', label: 'Alert' },
  { value: 'Alarm', label: 'Alarm' }
]

const HourOptions = [
  { value: '1 Hour', label: 'Total Guests within Last Hour' },
  { value: '24 Hour', label: 'Total Guests Today' },
  { value: 'Yesterday', label: 'Total Guests Yesterday' }
]

class DashboardALT extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      checked: true,
      dashboardData: {},
      suspiciousTransaction: 0,
      layoutConfigurations: {},
      dashboardConfigs: [],
      selectedValues: [],
      isOpen: false,
      suspiciousTransactionOpen: 0,
      dashboardWidgets: utils.dashboardWidgets,
      isApplyEnabled: true,
      updateDiv: false,
      selectedOption: [],
      selectedCameraOption: [],
      isOpenPendingClip: false,
      columns: [
        { key: 'StoreId.name', name: 'Store Name', width: 150, filter: false, sort: true, type: 'string' },
        { key: 'CamId.name', name: 'Camera Name', width: 150, filter: false, sort: true, type: 'string' },
        { key: 'AlarmEventId', name: 'Event Type', width: 150, formatter: (props, record, index, gridScope) => consts.EventType[record.Type] },
        // { Key: 'EventDetail', name: 'Event Name', width: 150, formatter: (props, record, index, gridScope) => record.EventDetail ? <div > {record.EventDetail}</div> : null },
        { key: 'EventTime', name: 'Start Time', width: 150, filter: false, sort: true, type: 'date', formatter: (props, record) => record.StartTime },
        { key: 'EventEndTime', name: 'End Time', width: 150, filter: false, sort: true, type: 'date', formatter: (props, record) => record.EndTime },
        { key: 'RejectedReason', name: 'Rejected Reason', width: 200, filter: false, sort: true, type: 'string', formatter: (props, record) => <div style={{ "wordBreak": "break-word" }}> {record && record.RejectedReason && record.RejectedReason.indexOf("There is not enough") > 0 ? "There is not enough space on the disk" : record && record.RejectedReason}</div> },
        { key: 'CreatedByUserId.name', name: 'Created By', width: 150, filter: false, sort: true, type: 'string', formatter: (props, record) => {
          console.log("record.CreatedByUserId", record.CreatedByUserId)
          return record && record.CreatedByUserId ? record.CreatedByUserId.firstName + ' ' + record.CreatedByUserId.lastName : '';
        } },
        { key: 'createdAt', name: 'Created On', width: 150, filter: false, sort: true, type: 'date' },
        { key: '', name: 'Delete Clip', width: 150, formatter: (props, record, index, gridScope) => <div className="create_clip_trash" ><i className="fa fa-trash fa-2x cursor" onClick={() => this.handleDeleteClip(record, gridScope)} /> </div> }
      ],
      selectedStore: [],
      selectedHour: [HourOptions[0]],
      siteDashboardData: [],
    }
    this.onDataLoaded = this.onDataLoaded.bind(this);
  }

  componentDidMount() {
    let user = utils.getLoggedUser();
    if (user) {
      this.loadDashboardConfig();
    }
  }

  handleDeleteClip = (value, gridScope) => {
    let me = this;
    swal({
      title: "Are you sure?",
      text: "Once deleted, you will not be able to recover this clip.",
      icon: "warning",
      buttons: {
        confirm: 'OK',
        cancel: 'Cancel'
      },
    }).then(function (willDelete) {
      let id = value && value._id;
      if (willDelete) {
        me.props.dispatch(getPendingVideoClip.request({ action: 'delete' }, id))
        const { total, pageSize, page } = gridScope.state;
        if ((total - 1) % pageSize === 0 && page > 1) {
          gridScope.setState({ page: page - 1 }, () => {
            gridScope.bindStore();
          });
        }
        else {
          gridScope.bindStore();
        }
      }
    });
  }
  getFilterDashboardWidgets = (inputDashboardWidgets) => {
    if (!inputDashboardWidgets) {
      inputDashboardWidgets = [];
    }
    const dashboardWidgets = inputDashboardWidgets.filter((widget) => {
      let hasPermission = true;

      if (typeof (widget.hasPermission) == 'function') {
        hasPermission = widget.hasPermission();
      }
      return hasPermission;
    });
    return dashboardWidgets;
  }

  // Get Dashboard configuration for logged in user.
  loadDashboardConfig = () => {
    let options = { action: 'load' };
    this.props.dispatch(dashboardConfigAction.request(options));
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.getDashboardData !== this.props.getDashboardData) {
      let { data, error, isFetching } = nextProps.getDashboardData;
      let valid = common.responseHandler(data, error, isFetching);
      if (valid) {
        this.setState({ dashboardData: data.data }, () => {
          setTimeout(() => {
            this.setState({ updateDiv: true });
            this.props.dispatch(screenResizedReducer({ updateDiv: true }));
          }, 1000);
        });
      }
      else {
        this.setState({ updateDiv: true });
      }
    }
    if (nextProps.dashboardConfigAction && !nextProps.dashboardConfigAction.isFetching && nextProps.dashboardConfigAction != this.props.dashboardConfigAction) {
      let { data } = nextProps.dashboardConfigAction;

      if (data && data.success && data.data) {
        if (data.message) {
          swal(utils.getAlertBoxTitle(data.success), data.message, utils.getAlertBoxIcon(data.success));
        }
        this.setDashboardConfig(data.data);
      }
    }

    //TODO - Need to improve this when code improvement done/ gets better solution for components resized accordingly to screen resized.
    if (nextProps.screenResizedReducer && nextProps.screenResizedReducer != this.props.screenResizedReducer && Object.keys(nextProps.screenResizedReducer).length > 0 && nextProps.screenResizedReducer != true) {
      // For now, it makes multiple request, so commented it till better solution

      // for (let i = 0; i < 2; i++) {
      //   setTimeout(() => {
      //     this.setState({ updateDiv: i });
      //   }, 500);
      // }
    }
  }

  componentWillMount() {
    localStorage.removeItem("currentPage");
    let user = utils.getLoggedUser();
    if (user) {
      let timezoneOffset = new Date().getTimezoneOffset();
      let startDate = moment.utc(moment().startOf('day')).format(utils.dateTimeFormatSecond);
      let endDate = moment.utc(moment().endOf('day')).format(utils.dateTimeFormatSecond);
      let params = { timezoneOffset: timezoneOffset, startDate: startDate, endDate: endDate };
      params = utils.updateSiteAndTagsFilter(this, params);
      this.props.dispatch(getDashboardData.request(params));
    } else {
      console.log('reached here.. Dashboard 1');
      //this.props.history.replace('/login');
    }
    this.props.dispatch(storesData.request({ stores: [] }));
  }

  setDashboardConfig = (dashboardConfig) => {
    let { layout } = dashboardConfig,
      dashboardConfigs = [];
    const { dashboardWidgets } = this.state;

    if (layout && typeof (layout) == 'object' && Array.isArray(dashboardWidgets)) {
      Object.keys(layout).forEach(function (key) {
        let configurations = layout[key];

        if (configurations && Array.isArray(configurations)) {
          configurations.forEach(function (configuration) {
            let dashboardConfigIndex = dashboardConfigs.findIndex((dashboardConfig) => {
              return dashboardConfig.value == configuration.i;
            });
            if (dashboardConfigIndex == -1) {
              let widget = dashboardWidgets.find((widget) => {
                return widget.value == configuration.i;
              });
              if (widget) {
                dashboardConfigs.push(widget);
              }
            }
          });
        }
      });
      this.setState({ dashboardConfigs: dashboardConfigs, selectedValues: [...dashboardConfigs], layoutConfigurations: layout });
    }
  }

  handleWidget = (value) => {
    let objState = { isOpen: value };
    if (value) {
      let { dashboardConfigs } = this.state;
      objState.selectedValues = dashboardConfigs;
      objState.isApplyEnabled = false;
    }
    this.setState(objState);
  }

  handlePendingClip = (value) => {
    let objState = { isOpenPendingClip: value };
    this.setState(objState);
  }



  enableDisableDragAndDrop = () => {
    this.setState({ checked: !this.state.checked });
  }

  // Fire on change layout of configuration, eg. resize/drag & drop.
  onResizeStop = (allLayouts, oldLayout, newLayout) => {
    let layoutConfigurations = { ...this.state.layoutConfigurations };

    Object.keys(layoutConfigurations).forEach(function (key) {
      let configurations = layoutConfigurations[key],
        configurationIndex = configurations.findIndex(configuration => {
          return configuration.i == newLayout.i;
        });
      if (configurationIndex != -1) {
        configurations[configurationIndex] = newLayout;
      }
    });
    this.setState({ layoutConfigurations: layoutConfigurations });
  }

  reverseArr = (input) => {
    var ret = new Array;
    for (var i = input.length - 1; i >= 0; i--) {
      ret.push(input[i]);
    }
    return ret;
  }

  // Fire on change layout of configuration, eg. resize/drag & drop.
  onLayoutChange = (currentLayout, allLayouts) => {

    Object.keys(allLayouts).forEach(function (key) {
      let configurations = allLayouts[key];

      // Set min/max height and width.
      configurations.forEach(configuration => {
        if (configuration.i == "10") {
          return configuration;
        }
        if (configuration.w < utils.defaultChatConfig.minWidth) {
          configuration.w = configuration.minW = utils.defaultChatConfig.minWidth;
        }
        if (configuration.h < utils.defaultChatConfig.minHeight) {
          configuration.h = configuration.minH = utils.defaultChatConfig.minHeight;
        }
        if (configuration.w > utils.defaultChatConfig.maxWidth) {
          configuration.w = configuration.maxW = utils.defaultChatConfig.maxWidth;
        }
        if (configuration.h > utils.defaultChatConfig.maxHeight) {
          configuration.h = configuration.maxH = utils.defaultChatConfig.maxHeight;
        }
      });
    });
    if (this.state.layoutConfigurations && this.state.layoutConfigurations.lg && this.state.layoutConfigurations.lg.length === currentLayout.length) {
      return this.setState({ layoutConfigurations: allLayouts });
    } else {
      const allLayoutsM = {
        ...allLayouts,
        md: utils.generateTwoGridLayout(allLayouts.md ? [...allLayouts.md] : []),
        lg: utils.generateTwoGridLayout(allLayouts.lg ? [...allLayouts.lg] : [])
      };
      this.setState({ layoutConfigurations: allLayoutsM });
    }
  }

  onWidgetClick = (e) => {
    let value = e.currentTarget.value;
    this.setState({ selectedValue: value });
  }

  // Add chart for selected Visualize.
  onAddWidget = () => {
    let selectedValues = [...this.state.selectedValues],
      dashboardConfigs = [...this.state.dashboardConfigs],
      layoutConfigurations = { ...this.state.layoutConfigurations };

    if (!selectedValues || !Array.isArray(selectedValues)) {
      selectedValues = [];
    }
    if (!dashboardConfigs || !Array.isArray(dashboardConfigs)) {
      dashboardConfigs = [];
    }
    if (!layoutConfigurations || typeof (layoutConfigurations) != 'object') {
      layoutConfigurations = {};
    }
    dashboardConfigs = selectedValues;

    // Remove layout configurations for non selected visualize.
    Object.keys(layoutConfigurations).forEach(function (key) {
      let filteredConfigurations = layoutConfigurations[key].filter(configuration => {
        let dashboardConfigIndex = dashboardConfigs.findIndex(dashboardConfig => {
          return dashboardConfig.value == configuration.i;
        });
        return dashboardConfigIndex != -1;
      });
      layoutConfigurations[key] = filteredConfigurations;
    });
    this.setState({ dashboardConfigs: dashboardConfigs, layoutConfigurations: layoutConfigurations })
    this.handleWidget(false);
  }

  // Fire on change layout of widgets, eg. resize/drag & drop.
  dropRemovedWidget = (layoutConfigurations, id) => {
    if (!layoutConfigurations) {
      layoutConfigurations = { ...this.state.layoutConfigurations };
    }
    Object.keys(layoutConfigurations).forEach(function (key) {
      let configurations = layoutConfigurations[key],
        configurationIndex = configurations.findIndex(configuration => {
          return configuration.i == id
        });
      if (configurationIndex != -1) {
        configurations.splice(configurationIndex, 1);
        layoutConfigurations[key] = configurations;
      }
    });
    this.setState({ layoutConfigurations: layoutConfigurations });
  }

  // Remove selected chart.
  onRemoveChart = (id) => {
    let dashboardConfigs = [...this.state.dashboardConfigs],
      layoutConfigurations = { ...this.state.layoutConfigurations };

    if (Array.isArray(dashboardConfigs)) {
      let dashboardConfigIndex = dashboardConfigs.findIndex(dashboardConfig => {
        return dashboardConfig.value == id;
      });
      if (dashboardConfigIndex != -1) {
        dashboardConfigs.splice(dashboardConfigIndex, 1);
        this.dropRemovedWidget(layoutConfigurations, id);
        this.setState({ dashboardConfigs: dashboardConfigs, selectedValues: [...dashboardConfigs] });
      }
    }
  }

  // Save dashboard configuration with chart details: eg. Chart's size, position.
  onSaveConfiguration = () => {
    let { layoutConfigurations, selectedValues } = this.state;
    //return;
    let availableWidgets = '';
    selectedValues.forEach(items => {
      availableWidgets += items.label + ", ";
    })
    availableWidgets = utils.trimEnd(availableWidgets);
    if (layoutConfigurations) {
      let dashboardConfig = null,
        { data } = this.props.dashboardConfigAction;

      if (data && data.data) {
        dashboardConfig = data.data;
      }
      if (!dashboardConfig) { dashboardConfig = {} };
      dashboardConfig.layout = layoutConfigurations;
      let options = { action: 'save', data: dashboardConfig };
      let loggedData = utils.getScreenDetails(utils.getLoggedUser(), this.props.location, consts.Widgets + availableWidgets);
      this.props.dispatch(saveActivityLog.request({ action: 'save', data: loggedData }));
      this.props.dispatch(dashboardConfigAction.request(options, dashboardConfig._id));
      this.handleWidget(false);
    }
  }

  onWidgetChange = (selectedValues) => {
    const oldSelectedValues = this.state.dashboardConfigs;

    // Get previous common values.
    let oldValues = oldSelectedValues.filter(oldValue => {
      let index = selectedValues.findIndex(newValue => {
        return newValue.value == oldValue.value;
      })
      return index == -1;
    });
    // Get current common values.
    let newValues = selectedValues.filter(newValue => {
      let index = oldSelectedValues.findIndex(oldValue => {
        return oldValue.value == newValue.value;
      })
      return index == -1;
    });

    // Merge previous and current common values.
    let updatedRecords = oldValues.concat(newValues),
      isSelectionUpdate = updatedRecords && updatedRecords.length > 0; // Check for new added or removed item.
    this.setState({ selectedValues, isApplyEnabled: isSelectionUpdate });
  }

  onDataLoaded(count, open) {
    this.setState({ suspiciousTransaction: count, suspiciousTransactionOpen: open });
  }

  dashboardComponentHeader(dashboardConfig) {
    let dashboardComponent;
    switch (dashboardConfig.label) {
      case "Video Clips":
        dashboardComponent = <div><i className="fa icon2-events"></i> VIDEO CLIPS</div>
        break;
      case "Latest Events":
        dashboardComponent = <div><i className="fa icon2-events"></i> EVENTS</div>
        break;
      case "Store Chart":
        dashboardComponent = <div><i className="fa icon2-location-icon" /> STORE CHART</div>
        break;
      case "Sales Chart":
        dashboardComponent = <div><i className="fa fa-usd" /> SALES CHART</div>
        break;
      case "Recent Promotions":
        dashboardComponent = <div><i className="fa fa-usd" /> RECENT PROMOTIONS</div>
        break;
      case "Top Selling Items":
        dashboardComponent = <div><i className="fa fa-usd" /> TOP SELLERS</div>
        break;
      case "Map":
        dashboardComponent = <div><i className="fa icon2-map" /> MAP</div>
        break;
      case "Suspicious Transactions":
        dashboardComponent = <div><i className="fa icon2-alerts" /> SUSPICIOUS TRANSACTIONS</div>
        break;
      case "People Counting":
        dashboardComponent = <div><i className="fa fa-users" /> PEOPLE COUNTING</div>
        break;
      case "Ticket Counter Layout View":
        dashboardComponent = <div>TICKET COUNTER LAYOUT VIEW</div>
        break;
      default: dashboardComponent = dashboardConfig.label;
        break;
    }
    return dashboardComponent;
  }

  bindStore() {
    const { filter, selectedOption } = this.state;
    let category = [], noCategory = [];
    if (selectedOption && selectedOption.value) {
      var categoryFilters = utils.getCategoryFilters(selectedOption.value)
      category = categoryFilters.category;
      noCategory = categoryFilters.noCategory;
    }
    let params = {
      page: 0,
      pageSize: 5,
      populate: "",
      filter: filter,
      combos: '',
      Category: category || [],
      NoCategory: noCategory || [],
      selectedOptionVal: selectedOption || {},
      isFromEventFeed: true
    }
    this.props.dispatch(getEventFeed.request(params));
  }

  bindCamera(isClipFilter) {
    const { filter, selectedCameraOption } = this.state;
    let params = {
      page: 0,
      pageSize: 5,
      populate: "",
      camId: filter.length > 0 ? filter[0] : "",
      filter: filter,
      combos: '',
      selectedCameraOptionVal: selectedCameraOption || {},
      isFromEventFeed: true
    }
    if (!isClipFilter) {
      this.props.dispatch(getCameraData.request(params));
    }
    else {
      this.props.dispatch(getCameraClipData.request(params));
    }
  }

  transactionFilterChanges = (selectedOption) => {
    let filter = [];
    if (selectedOption) {
      filter.push(selectedOption.value);
    }
    this.setState({ selectedOption, filter, filterState: true }, () => {
      this.bindStore();
    });
  }

  onCameraChange = (selectedCameraOption) => {
    let filter = [];
    if (selectedCameraOption) {
      filter.push(selectedCameraOption.value);
    }
    this.setState({ selectedCameraOption, filter, filterState: true }, () => {
      this.bindCamera();
    });
  }
  onCameraClipDataChange = (selectedCameraOption) => {
    let filter = [];
    if (selectedCameraOption) {
      filter.push(selectedCameraOption.value);
    }
    this.setState({ selectedCameraOption, filter, filterState: true }, () => {
      this.bindCamera(true);
    });
  }

  // Moving Ticket Counter Layout View at first position in the configs array
  reArrangeLayoutConfigs = (configs) => {
    const cfgs = [...configs];
    const res = cfgs.unshift(
      cfgs.splice(
        cfgs.findIndex(
          config => config.value == '10'),
        1)[0]
    )
    return cfgs;
  }

  getStoreList = () => {
    const { storesData } = this.props;
    const stores = storesData && storesData.data && storesData.data.stores ? storesData.data.stores : [];
    return stores.map(({ _id, name }) => ({ value: _id, label: name }));
  }

  componentDidUpdate(prevProps, prevState) {
    if (prevProps.storesData.data !== this.props.storesData.data) {
      const { storesData } = this.props;
      const stores = storesData && storesData.data && storesData.data.stores ? storesData.data.stores : [];
      if (!this.props.storesData.isFetching) {
        const firstStore = stores.length > 0 ? [{ value: stores[0]._id, label: stores[0].name }] : []
        this.setState({ selectedStore: firstStore }, () => {
          this.loadDataByStoreId();
          this.loadDataByStoreId();
          this.intervalId = setInterval(this.loadDataByStoreId.bind(this), 60000);
        })
      }
    }
  }

  onStoreChange = (stores) => {
    const selectedStore = [stores];
    this.setState({ selectedStore }, () => this.loadDataByStoreId())
  }

  loadDataByStoreId = () => {
    const { selectedStore, selectedHour } = this.state;
    const { value: storeId } = selectedStore.length > 0 ? selectedStore[0] : { value: '' };
    const { value: DATA_FOR } = selectedHour[0];

    axios.post(serverAPI.DASHBOARD_DATA, {
      storeId,
      DATA_FOR
    }).then((response) => {
      const { alldata } = response.data;
      //this.setState({ selectedData: alldata.length > 0 ? alldata[0] : { AGENTS: {}, CUSTOMER_PROCESSED_LH: {} } })
      var result = {};
      for (var i = 0; i < response.data.alldata.length; i++) {
        result[response.data.alldata[i]._id] = response.data.alldata[i];
      }
      this.setState({ siteDashboardData: result })
    }, (error) => {
      console.log(error);
    });
  }

  onHourChange = (options) => {
    this.setState({ selectedHour: [options] });
  }

  render() {
    const { dashboardData, dashboardWidgets, dashboardConfigs, isOpen, selectedValues, layoutConfigurations, checked, suspiciousTransaction, suspiciousTransactionOpen, updateDiv, selectedOption, selectedCameraOption, isOpenPendingClip, columns, } = this.state,
      dashboardWidgetsFiltered = this.getFilterDashboardWidgets(dashboardWidgets);
    const { getDashboardData, dashboardConfigAction, storesData, storeChange, listAction, actionName, sortColumn, sortDirection, localPaging } = this.props;
    let storeIsFetching = storesData && storesData.isFetching;
    let store_Data = storesData && storesData.data && storesData.data.data;
    let isFetching = (dashboardConfigAction && dashboardConfigAction.isFetching);
    let showTooltip = { visible: false };
    if (utils.isComputer()) {
      delete showTooltip.visible;
    }

    let filterCameraOption = [];
    if (!storeIsFetching && store_Data) {
      store_Data.forEach((element) => {
        let { name, _id } = element;
        filterCameraOption.push({ label: name, value: _id });
      });
    }
    return (
      <div className="animated fadeIn" id="dashboardBody" style={{width: "99%"}}>
        <Row>
          <LoadingDialog isOpen={isFetching || !updateDiv} />
          <DashboardSpirit
            showTooltip={this.showTooltip}
            handlePendingClip={this.handlePendingClip}
            handleWidget={this.handleWidget}
            enableDisableDragAndDrop={this.enableDisableDragAndDrop}
            checked={this.state.checked}
            onSaveConfiguration={this.onSaveConfiguration}
            storesData={this.props.storesData}
            selectedStore={this.state.selectedStore}
            storeOptions={this.getStoreList()}
            onStoreChange={this.onStoreChange}
            siteDashboardData={this.state.siteDashboardData}
          />
          {/* <DashboardStrip data={dashboardData} suspiciousTransaction={suspiciousTransaction} suspiciousTransactionOpen={suspiciousTransactionOpen} /> */}
        </Row>
        <Card>
          {/* <CardHeader className="dashboardMain-cardheader">
            <Tooltip placement="bottom" title={consts.PendingClip} {...showTooltip} onClick={() => this.handlePendingClip(true)}>
              <i className="ml-3 dashboard-button float-right fa fa-video-camera customLeftSeparator dashboard-Body-Content-Divider cursor dashboardvideoicon" />
            </Tooltip>
            <Tooltip placement="bottom" title={consts.AddWidgets} {...showTooltip} onClick={() => this.handleWidget(true)}>
              <i className="ml-3 dashboard-button float-right fa icon2-add-widget-icon customLeftSeparator dashboard-Body-Content-Divider cursor" />
            </Tooltip>
            <Tooltip placement="bottom" title={consts.DragSwitch}>
              <i onClick={() => this.enableDisableDragAndDrop()} className={`ml-3 dashboard-button float-right customLeftSeparator dashboard-Body-Content-Divider cursor fa icon2-drag-widget-icon ${checked ? '' : ' icon2'}`} />
            </Tooltip>
            <Tooltip placement="bottom" title={consts.SaveLayout}>
              <i onClick={() => this.onSaveConfiguration()} className="ml-3 dashboard-button float-right fa icon2-save-layout-icon cursor" />
            </Tooltip>
          </CardHeader> */}
          <CardBody className="dashboardMain-body" style={{ minHeight: 684 }}>
            {dashboardConfigs.length > 0 ?
              updateDiv && <ResponsiveGridLayout className="layout custom-grid-body"
                layouts={layoutConfigurations}
                onLayoutChange={(currentLayout, allLayouts) => this.onLayoutChange(currentLayout, allLayouts)}
                onResizeStop={(allLayouts, oldLayout, newLayout) => this.onResizeStop(allLayouts, oldLayout, newLayout)}
                breakpoints={{ lg: 1200, md: 996, sm: 768, xs: 480, xxs: 0 }}
                cols={{ lg: 12, md: 10, sm: 6, xs: 4, xxs: 2 }}
                margin={[10, 10]}
                containerPadding={[10, 10]}
                autoSize={true}
                isDraggable={checked}
                isResizable={checked}
                compactType="vertical"
                useCSSTransforms={true}
              >
                {this.reArrangeLayoutConfigs(dashboardConfigs).map(dashboardConfig => {

                  let component = null, rightCount = null, countClick = null,
                    hasPermission = typeof (dashboardConfig.hasPermission) == 'function' ? dashboardConfig.hasPermission() : true;
                  console.log('haspermissionnnn', hasPermission, dashboardConfig)
                  if (hasPermission) {
                    switch (dashboardConfig.label) {
                      case "Recent Promotions":
                        component = <RecentPromotion data={dashboardData} {...this.props} />
                        break;
                      case "Sales Chart":
                        component = <SalesChart theme={this.props.theme} />;
                        break;
                      case "Store Chart":
                        component = <StoreChart data={dashboardData} storeChange={storeChange} theme={this.props.theme} />
                        break;
                      case "Top Selling Items":
                        component = <TopSelling data={dashboardData} {...this.props} />
                        break;
                      case "Suspicious Transactions":
                        rightCount = suspiciousTransaction;
                        countClick = () => this.props.history.push('/transaction/suspicioustransactions');
                        component = <SuspiciousTransaction data={dashboardData} onDataLoaded={this.onDataLoaded} {...this.props} />
                        break;
                      case "Map":
                        component = <div style={{ width: '100%', height: '100%', minHeight: '300px' }}><MapView /></div>
                        break;
                      case "Latest Events":
                        component = <TopEvent data={dashboardData} {...this.props} isFromDashboard />
                        break;
                      case "Video Clips":
                        component = <TopVideoClips data={dashboardData} {...this.props} isFromDashboard />
                        break;
                      case "People Counting":
                        component = <PeopleCounting theme={this.props.theme} />
                        break;
                      case "Ticket Counter Layout View":
                        component = <TicketCounter 
                          options={HourOptions} 
                          selectedStore={this.state.selectedStore} 
                          selectedHour={this.state.selectedHour} 
                          onHourChange={this.onHourChange}
                          siteDashboardData={this.state.siteDashboardData}
                        />
                        break;
                      default:
                        break;
                    }
                  }

                  let latestEvents = dashboardConfig.label == 'Latest Events' || dashboardConfig.label == 'Video Clips';
                  let latestVideoClips = dashboardConfig.label == 'Video Clips' || dashboardConfig.label == 'Ticket Counter Layout View';
                  let topSellers = dashboardConfig.label == 'Top Selling Items' || dashboardConfig.label == 'Ticket Counter Layout View';
                  return (
                    <div key={dashboardConfig.value} className={`${hasPermission ? "custom-card" : "custom-hide"} ${
                      dashboardConfig.label === "Ticket Counter Layout View" ? "ticket-layout" : ""
                      }`}>
                      <Card className="dashboard-card">
                        <CardHeader className="cursor-pointer dashboard-cardheader">
                          <Row>
                            <Col lg={latestEvents ? 3 : 7} md={latestEvents ? 12 : 8}>
                              {dashboardConfig.label && <CardTitle>{this.dashboardComponentHeader(dashboardConfig)}</CardTitle>}
                              {dashboardConfig.subTitle && <CardSubtitle>{dashboardConfig.subTitle}</CardSubtitle>}
                            </Col>
                            {!latestEvents && <Col lg={5} md={4}>
                              <div className="react-Select-wrapper-area">
                                {!topSellers && <div className="select-area combo-spacing">
                                  <Select className="fatag widgetTag" isClearable={true} required={true} placeholder="Select" />
                                </div>}
                                {latestVideoClips && <div className="select-area dashboard-widget-header-text combo-spacing">
                                  <Select className="fausd"
                                    isClearable={false}
                                    placeholder="Select"
                                    id="TransactionFilter"
                                    value={this.state.selectedHour}
                                    onChange={this.onHourChange}
                                    options={HourOptions} />
                                </div>
                                }
                                <h3>
                                  <div className={topSellers ? "card-header-actions close-widget-icon close-widget-topsellers" : "card-header-actions close-widget-icon"}>
                                    <Button color="link" className="card-header-action btn-close layoutText" onClick={() => this.onRemoveChart(dashboardConfig.value)}><i className="fa icon2-close-window-icon"></i></Button>
                                  </div>
                                </h3>
                              </div>
                            </Col>}
                            <Col lg={9} md={12}>
                              <Row>
                                <Col lg={12} md={12}>
                                  {latestEvents && <div className="react-Select-wrapper-area">
                                    <div className="event-grap chart-width" >
                                      <Bar data={cardChartTopData} options={cardChartTopOpts} height={20} />
                                    </div>
                                    <div className="dashboard-Event-Component dashboard-widget-header-text">76 <br /> <span>WEEK</span></div>
                                    <div className="select-area dashboard-widget-header-text">
                                      <Select className="fatag"
                                        isClearable={true}
                                        placeholder="Select"
                                        id={"CameraFilter" + dashboardConfig.label}
                                        value={selectedCameraOption}
                                        onChange={latestVideoClips ? this.onCameraClipDataChange : this.onCameraChange}
                                        options={filterCameraOption} />
                                    </div>
                                    {!latestVideoClips && <div className="select-area dashboard-widget-header-text combo-spacing">
                                      <Select className="fausd"
                                        isClearable={true}
                                        placeholder="Select"
                                        id="TransactionFilter"
                                        value={selectedOption}
                                        onChange={this.transactionFilterChanges}
                                        options={filterOption} />
                                    </div>
                                    }
                                    <h3>
                                      <div className="card-header-actions close-widget-icon">
                                        <Button color="link" className="card-header-action btn-close layoutText cursor-margin " onClick={() => this.onRemoveChart(dashboardConfig.value)}><i className="fa icon2-close-window-icon"></i></Button>
                                      </div>
                                    </h3>
                                  </div>}
                                </Col>
                              </Row>
                            </Col>
                          </Row>
                        </CardHeader>
                        <CardBody className="custom-card-body dashboard-cardbody">
                          {component}
                        </CardBody>
                      </Card>
                    </div>
                  );
                })}
              </ResponsiveGridLayout>
              : null}
          </CardBody>
        </Card>
        <Modal isOpen={isOpen} className={"popup-sales dashboard-widget add-widget-modal"} >
          <ModalHeader className={"widgetHeaderColor"} toggle={() => this.setState({ isOpen: false })}>
            Add Widgets
					    </ModalHeader>
          <ModalBody className={"reorderBody"}>
            <Select
              isClearable={true}
              id="widgetProvider"
              value={selectedValues}
              onChange={this.onWidgetChange}
              options={dashboardWidgetsFiltered}
              isMulti
              menuIsOpen
              hideSelectedOptions={false}
              className="custom-select-list"
            />
          </ModalBody>
          <ModalFooter className={"widgetHeaderColor"}>
            <Button onClick={() => this.onAddWidget()} disabled={!this.state.isApplyEnabled} className="ml-3"><i className="fa fa-check" aria-hidden="true"></i> Apply</Button>
            <Button onClick={() => this.handleWidget(false)} className="ml-3"><i className="fa fa-close" aria-hidden="true"></i> Cancel</Button>
          </ModalFooter>
        </Modal>
        <Modal isOpen={isOpenPendingClip} className={"dashboard-grid"} size='lg'>
          <ModalHeader className={"widgetHeaderColor"} toggle={() => this.setState({ isOpenPendingClip: false })}>
            Pending Clip(s)
					</ModalHeader>
          <ModalBody className={"reorderBody"}>
            <Row>
              <Col>
                <Grid
                  listAction={listAction}
                  dataProperty={actionName}
                  columns={columns}
                  hidePref={true}
                  onRowClick={() => { }}
                  defaultSort={{ sortColumn: 'createdAt', sortDirection: 'DESC' }}
                  localPaging={localPaging || false}
                  screenPathLocation={this.props.location}
                  populate={'CamId StoreId CreatedByUserId'}
                  height={370}

                />
              </Col>
            </Row>
          </ModalBody>
        </Modal>
      </div>
    );
  }
}
DashboardALT.defaultProps = {
  listAction: getPendingVideoClip,
  actionName: 'getPendingVideoClip'
}
function mapStateToProps(state, ownProps) {
  return {
    getEventFeed: state.getEventFeed,
    getDashboardData: state.getDashboardData,
    dashboardConfigAction: state.dashboardConfigAction,
    storeChange: state.storeChange,
    theme: state.theme,
    storesData: state.storesData,
    getCameraData: state.getCameraData,
    getCameraClipData: state.getCameraClipData,
    screenResizedReducer: state.screenResizedReducer,
    getPendingVideoClip: state.getPendingVideoClip
  };
}

var DashboardALTModule = connect(mapStateToProps)(DashboardALT);
export default DashboardALTModule;
