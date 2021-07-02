import React, { Fragment } from "react";
import {
  Col,
  Row,
  Button,
  InputGroup,
  UncontrolledDropdown,
  DropdownToggle,
  DropdownMenu,
  Form,
  FormGroup,
  Label,
  DropdownItem,
  Input as InputStrap,
  ButtonDropdown,
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Card,
  CardBody,
  CardHeader,
  Table as ReactStrapTable,
} from "reactstrap";
import utils from "./../../Util/Util";
import {
  Table,
  Input,
  Icon,
  Button as AntButton,
  Tooltip,
  Divider,
} from "antd";
import { connect } from "react-redux";
import DateFilter from "./dateFilter";
import Select from "react-select";
import moment from "moment";
import swal from "sweetalert";
import util from "../../Util/Util";
import common from "../../common";
import LoadingDialog from "./../../component/LoadingDialog";
import LiveCameraCard from "../../component/LiveCameraCard";
import "antd/dist/antd.css";
import "../../scss/gridview.scss";
import "react-bootstrap-table/css/react-bootstrap-table.css";
import {
  updateGridData,
  getGridFilter,
  getGridSearch,
} from "../../redux/actions";
import {
  saveUserPreference,
  getUserPreference,
  deletePreference,
  saveActivityLog,
  storesData,
  getReceiptClip,
  getReceipt as getReceiptAPI,
} from "../../redux/actions/httpRequest";
import consts from "../../Util/consts";
import DatePicker from "react-datepicker";

const defaultPageNumber = 1;
const defaultPageSize = 20

const colourStyles = {
  control: (styles) => ({ ...styles, backgroundColor: "white" }),
  option: (styles, { data, isDisabled, isFocused, isSelected }) => {
    return {
      ...styles,
      backgroundColor: isDisabled
        ? null
        : isSelected
          ? data.color
          : isFocused
            ? null
            : null,
      cursor: isDisabled ? "not-allowed" : "default",
      color: isDisabled ? "#ccc" : isSelected ? "black" : "black",
      ":active": {
        ...styles[":active"],
        backgroundColor: !isDisabled && (isSelected ? data.color : "red"),
      },
    };
  },
};

// const CustomInputFromDate = ({ value, onClick }) => {
//   console.log('from valueeeeeeeee', value)
//   return (
//     <div className="buttoncontainer">
//       <button style={{ height: "33px" }} onClick={onClick}>
//         {value == "" ? 'From Date' : value}
//       </button></div>)
// }

// const CustomInputToDate = ({ value, onClick }) => {
//   console.log('To valueeeeeeeee', value)
//   return (
//     <button style={{ height: "33px" }} onClick={onClick}>
//       {value == "" ? 'To Date' : value}
//     </button>)
// }

// setting initial date time for scale reports starts ==============
var currentdate = new Date();

var myEndDate = new Date();
myEndDate.setHours("23");
myEndDate.setMinutes("59");
myEndDate.setSeconds("59");
// myEndDate.setHours(currentdate.getHours());
// myEndDate.setMinutes(currentdate.getMinutes());
// myEndDate.setSeconds(currentdate.getSeconds());

let previousDays = 6;
let myStartDate = new Date(
  currentdate.getTime() - previousDays * 24 * 60 * 60 * 1000
);
myStartDate.setHours("00");
myStartDate.setMinutes("00");
myStartDate.setSeconds("00");
// setting initial date time for scale reports ends ==============

class GridView extends React.Component {
  constructor(props, context) {
    super(props, context);
    this.width = 0;
    this.filters = {};

    let timezone = moment.tz.guess();

    this.state = {
      rows: [],
      storeChange: [],
      startDate: myStartDate,
      endDate: myEndDate,
      toDate: moment(moment(myEndDate)).tz(timezone).format("YYYY-MM-DD"),
      toTime: moment(moment(myEndDate)).tz(timezone).format("HH:mm"),
      fromDate: moment(moment(myStartDate)).tz(timezone).format("YYYY-MM-DD"),
      fromTime: moment(moment(myStartDate)).tz(timezone).format("HH:mm"),
      startDuration: moment().format(utils.dateTimeFormatAmPmPOS),
      endDuration: moment().format(utils.dateTimeFormatAmPmPOS),
      dateRange: {
        start: myStartDate,
        end: myEndDate,
      },
      gridData: [],
      timezone: timezone,
      scaleData: {},
      storesDataHit: false,
      storeData: [],
      siteSelected: { label: "", value: "" },
      videoFilterdefault: {label: "All", value: ""},
      videoData: [{label: "All", value: ""},{label: "With Video", value: "withVideo"},{label: "Without Video", value: "withOutVideo"}],
      videoFilterselected: false,
      videoFilterlabel: "",
      videoFiltervalue: "",
      changePage: true,
      filtersGrid: {},
      pageSize: localStorage.getItem("currentPageSize") || 20,
      // pageSize: this.props.pageSize || 20,
      page: localStorage.getItem("currentPage") || 1,
      total: 0,
      pageTotal: 1,
      isLoading: false,
      combos: {},
      searchValue: "",
      // isWeightModalOpen: false,
      sortInfo: this.props.defaultSort ? this.props.defaultSort : {},
      columns: [...this.props.columns],
      isFilter: false,
      isTogglePreference: false,
      isToggleAddPreference: false,
      addForm: {},
      preferenceData: [],
      defaultIndexPreference: null,
      isManagePreference: false,
      selectedPreference: null,
      errorForm: null,
      ismodify: false,
      checked: false,
      isComingFromEventFeed: false,
      siteName: "",
      fromWeight: "",
      toWeight: "",
      // video in grid base
      videoClicked: false,
      videoLoading: false,
      currentReceipt: null,
      currentRecord: null,
    };

    this.selectVideofilter = React.createRef();
    this.onChange = this.onChange.bind(this);
    this.dropdownOptions = [
      {
        name: "Pending",
        icon: "fa fa-clock-o",
        onClick: this.getAuditUpdateStatus.bind(this, "Pending"),
      },
      {
        name: "Reviewed",
        icon: "fa fa-check",
        onClick: this.getAuditUpdateStatus.bind(this, "Reviewed"),
      },
      {
        name: "Not Reviewed",
        icon: "fa fa-close",
        onClick: this.getAuditUpdateStatus.bind(this, "Not Reviewed"),
      },
      {
        name: "Comment",
        icon: "fa fa-comment",
        onClick: (row) =>
          this.setState({
            isOpen: true,
            isCommentBox: true,
            currentReceipt: row,
          }),
      },
    ];
    this.printDocument = this.printDocument.bind(this);
    this.exportExcelRecord = this.exportExcelRecord.bind(this);
    this.handleChange = this.handleChange.bind(this);
  }

  selectSiteOnChange = (storeData) => {
    if (storeData.length) {
      this.setState({ siteSelected: storeData[0] }, () => {
        this.validateScaleSearch();
      });
    } else this.validateScaleSearch();
  };

  componentWillReceiveProps(nextProps) {
    // NOTE component will receive props
    const {
      dataProperty,
      dispatch,
      getReceipt,
      updateReceiptActionName,
    } = this.props;
    const { page, pageSize, sortInfo, filtersGrid, filterVal } = this.state;

    if (Object.keys(nextProps.gridSearchParam).length !== 0) {
      let { parentRoute } = nextProps.gridSearchParam;
      if (parentRoute === window.location.hash.split("/")[2]) {
        let filterText = nextProps.gridSearchParam[window.location.hash];
        if (filterText && filterVal !== filterText) {
          this.setState({ filterVal: filterText });
        }
      } else {
        dispatch(getGridSearch(null));
      }
    }
    if (
      nextProps.storeChange &&
      nextProps.storeChange != this.props.storeChange
    ) {
      if (
        nextProps.storeChange.selectedStore.length == 1 &&
        nextProps.storeChange.selectedStore[0].label == "All"
      )
        this.setState({
          storeData: this.state.origStoreData ? this.state.origStoreData : [],
        });
      else {
        //if site selected on top header than filtering the site dropdown and also checking if options of site scale dropdown has the selected site or not
        let StoreData = [...nextProps.storeChange.selectedStore];
        if (this.state.origStoreData) {
          StoreData = this.state.origStoreData.filter((x) =>
            nextProps.storeChange.selectedStore.find((y) => x.value === y.value)
          );
        }

        this.setState({ storeData: StoreData });
        let CheckSelectedSitePresent = StoreData.find(
          (x) => x.value === this.state.siteSelected.value
        );
        if (!CheckSelectedSitePresent) this.selectSiteOnChange(StoreData);
      }
    }

    if (
      nextProps["storesData"] &&
      nextProps["storesData"] !== this.props["storesData"]
    ) {
      const { data, isFetching } = nextProps["storesData"];
      if (!isFetching && data) {
        data.stores.length &&
          data.stores.map((site) => {
            site.label = site.name;
            site.value = site._id;
          });
        if (
          nextProps.storeChange &&
          nextProps.storeChange.selectedStore.length == 1 &&
          nextProps.storeChange.selectedStore[0].label == "All"
        ) {
          this.setState({ storeData: data.stores });
          this.selectSiteOnChange(data.stores);
        } else {
          //if site selected on top header than filtering the site dropdown and also checking if options of site scale dropdown has the selected site or not
          let filteredStore = data.stores.filter((x) =>
            nextProps.storeChange.selectedStore.find((y) => x.value === y.value)
          );
          this.setState({ storeData: filteredStore });
          let CheckSelectedSitePresent = filteredStore.find(
            (x) => x.value === this.state.siteSelected.value
          );
          if (!CheckSelectedSitePresent) this.selectSiteOnChange(filteredStore);
        }

        this.setState({ origStoreData: data.stores });
      }
    }
    if (
      nextProps[dataProperty] &&
      nextProps[dataProperty] !== this.props[dataProperty]
    ) {
      const { data, isFetching } = nextProps[dataProperty];
      if (!isFetching) {
        this.setState({ isLoading: false });
        if (data && !data.error) {
          if (!data.message) {
            if (
              this.props.screen == "Access Control Devices" &&
              this.props.saveAccessDevices
            ) {
              this.props.saveAccessDevices(data.data);
            }

            let options = {
              gridData: data.data || data.records,
              pageTotal: data.pages,
              total: data.total || data.recordCount,
              combos: data.combos,
            };
            if (nextProps.storeChange.selectedStore.length === 0) {
              options.gridData = [];
              options.pageTotal = 0;
              options.total = 0;
              options.combos = [];
            }
            this.setState(options);

            this.props.dispatch(
              updateGridData({
                page: page,
                pageSize: pageSize,
                sort: sortInfo.sortColumn || sortInfo,
                sortDir: sortInfo.sortDirection || sortInfo,
                filters: JSON.stringify(
                  this.props.filters || this.getFilterParams(filtersGrid) || {}
                ),
                combos: this.props.combos || "",
              })
            );

            if (!util.isComputer) {
              setTimeout(function () {
                window.scrollTo({ top: 0, behavior: "smooth" });
              }, 500);
            }
          }
        }
      }
    } else if (nextProps[dataProperty] && !nextProps[dataProperty].isFetching) {
      this.setState({ isLoading: false });
    }

    if (
      nextProps["reloadGrid"] &&
      nextProps["reloadGrid"] !== this.props["reloadGrid"]
    ) {
      const { data } = nextProps["reloadGrid"];
      if (this.props.screen == data.grid) {
        this.bindStore();
      }
    }

    // save User Prefrence Data
    if (
      nextProps.userPreference &&
      nextProps.userPreference !== this.props.userPreference &&
      !nextProps.userPreference.isFetching &&
      nextProps.userPreference.data
    ) {
      let { data, success } = nextProps.userPreference.data;
      if (success && data.length > 0) {
        let defaultIndex = data.findIndex((d) => d.checkDefault == "true");
        if (defaultIndex > -1) {
          let defaultData = data[defaultIndex];
          if (defaultData.info != "undefined") {
            let info =
              Object.keys(defaultData.info).length > 0
                ? JSON.parse(defaultData.info)
                : {};
            let columnsArray = [...this.state.columns];
            if (info.columns) {
              info.columns.map((d, i) => {
                let colIndex = columnsArray.findIndex((f) => f.key == d.key);
                if (colIndex > -1) {
                  columnsArray[colIndex].filteredValue = d.filteredValue
                    ? d.filteredValue
                    : "";
                  columnsArray[colIndex].filter = d.filter;
                  columnsArray[colIndex].hidden = !!d.hidden;
                }
              });
            }
            let {
              action,
              directoryName,
              page,
              pageSize,
              populate,
              sort,
              sortDir,
              filters,
              combos,
            } = info;
            let sortInfo = { sortColumn: sort, sortDirection: sortDir };
            let filtersArray = filters ? JSON.parse(filters) : [];

            let newFilters = { ...this.filters };
            filtersArray.map((d) => {
              let colIndex = columnsArray.findIndex(
                (c) => c.key == d.property || c.nested == d.property
              );
              if (colIndex > -1) {
                newFilters[columnsArray[colIndex].key] = {
                  column: columnsArray[colIndex],
                  filterTerm: d.value,
                };
                columnsArray[colIndex].filteredValue = [d.value];
                columnsArray[colIndex].filtered = true;
              }
            });

            this.filters = newFilters;
            let isFilter = false;
            let index = columnsArray.findIndex((e) => e.hidden);
            if (index > -1 || Object.keys(newFilters).length > 0) {
              isFilter = true;
            }
            this.setState(
              {
                isLoading: false,
                selectedPreference: defaultData,
                defaultIndexPreference: defaultIndex,
                preferenceData: data,
                columns: columnsArray,
                sortInfo,
                action,
                directoryName,
                page,
                pageSize,
                populate,
                sort,
                sortDir,
                filters,
                isFilter,
                combos: combos ? combos : {},
              },
              () => {
                this.bindStore();
              }
            );
          }
        } else {
          this.setState(
            {
              isLoading: false,
              preferenceData: data,
              selectedPreference: null,
              defaultIndexPreference: null,
              isComingFromEventFeed: Boolean(nextProps.isComingFromEventFeed),
            },
            () => {
              if (this.props.filters) {
                if (Object.keys(this.props.filters).length > 0) {
                  this.bindStore();
                } else {
                  this.cleanFilter();
                }
              } else {
                this.cleanFilter();
              }
            }
          );
        }
      } else {
        this.setState(
          { isComingFromEventFeed: Boolean(nextProps.isComingFromEventFeed) },
          () => {
            if (
              !this.props.scaleSearchOptions ||
              !this.props.AccessControlFilter
            )
              this.bindStore();
          }
        );
      }
    }

    if (
      nextProps.savePreference &&
      nextProps.savePreference !== this.props.savePreference &&
      !nextProps.savePreference.isFetching &&
      nextProps.savePreference.data
    ) {
      let { data, success } = nextProps.savePreference.data;
      if (success) {
        let preferenceArray = [...this.state.preferenceData];
        let updateIndex = preferenceArray.findIndex((d) => d._id == data._id);
        preferenceArray[updateIndex] = data;
        let defaultIndex =
          this.state.defaultIndexPreference == updateIndex &&
            preferenceArray[updateIndex].checkDefault == "false"
            ? null
            : updateIndex;
        this.setState(
          {
            isLoading: true,
            preferenceData: preferenceArray,
            defaultIndexPreference: defaultIndex,
            addForm: {},
          },
          () => {
            // load Preference
            this.props.dispatch(
              getUserPreference.request({
                action: "load",
                type: "grid",
                prefName: window.location.hash.substr(2),
              })
            );
          }
        );
      }
    }

    if (
      nextProps.deleteData &&
      nextProps.deleteData !== this.props.deleteData &&
      !nextProps.deleteData.isFetching &&
      nextProps.deleteData.data
    ) {
      let { success } = nextProps.deleteData.data;
      if (success) {
        this.props.dispatch(
          getUserPreference.request({
            action: "load",
            type: "grid",
            prefName: window.location.hash.substr(2),
          })
        );
      }
    }

    // video clip
    if (nextProps["getReceiptClip"] !== this.props["getReceiptClip"]) {
      let { data, error, isFetching } = nextProps["getReceiptClip"];
      let valid = common.responseHandler(data, error, isFetching);
      if (valid) {
        this.setState({ currentReceipt: data.data }, () => {
          this.setState({
            videoLoading: false,
          });
        });
      }
    }

    // video clip with different action dispatch
    if (nextProps["getReceipt"] !== this.props["getReceipt"]) {
      let { data, error, isFetching } = nextProps["getReceipt"];
      let valid = common.responseHandler(data, error, isFetching);
      if (valid) {
        // if (this.state.isGridView) {
        this.setState({ currentReceipt: data.data }, () => {
          this.setState({
            videoLoading: false,
          });
        });
        // }
      }
    }

    if ((nextProps['getCameraClipData'] && nextProps['getCameraClipData'] !== this.props['getCameraClipData'])) {
      const { data, isFetching } = nextProps['getCameraClipData'];
      if (!isFetching && data) {
        this.setState({ data: data.data });
      }
    }

  }

  // scaleFilter = () => {
  //   const { siteSelected, fromDate, toDate, toTime, fromTime } = this.state;
  //   const postData = {
  //     fromDate: fromDate !== "" ? moment(moment(fromDate)).format('yyyy-MM-DD') : "",
  //     toDate: toDate == "" ? fromDate == "" ? "" : moment(moment(fromDate)).format('yyyy-MM-DD') : moment(moment(toDate)).format('yyyy-MM-DD'),
  //     toTime: toTime,
  //     fromTime: fromTime,
  //     storeName: siteSelected ? siteSelected.value : ''
  //   }

  //   console.log('postDataaaa', postData);

  //   this.setState({ scaleData: postData }, () => {
  //     this.bindStore();
  //   });
  // }

  onPressCollapse = () => {
    this.setState(
      {
        videoClicked: !this.state.videoClicked,
      },
      () => {
        this.props.onToggle && this.props.onToggle();
      }
    );
  };

  getAuditUpdateStatus(status, data) {
    this.props.dispatch(
      this.props.updateReceiptAction.request({
        action: "update",
        data: { auditStatus: status, id: data._id },
      })
    );
  }

  getFilterParams(newFilters) {
    var filters = [];
    if (this.props.defaultFilter && this.props.defaultFilter.length > 0) {
      filters = filters.concat(this.props.defaultFilter);
    }
    if (Object.keys(newFilters).length !== 0) {
      for (var columnFilter in newFilters) {
        if (newFilters.hasOwnProperty(columnFilter)) {
          var filterValue,
            type,
            operator,
            convert,
            isDate = false,
            timezoneOffset = 0,
            columnFilterOj = newFilters[columnFilter];

          let Type = columnFilterOj.column.type && columnFilterOj.column.type.toLowerCase() || 'None';
          switch (Type) {
            case 'int':
            case 'total':
            case 'numeric':
              var isArray = columnFilterOj.filterTerm instanceof Array;
              filterValue = isArray
                ? columnFilterOj.filterTerm[0].value
                : columnFilterOj.filterTerm;
              var compareOperator = filterValue ? filterValue.charAt(0) : ""; // First Values as Compare Operator
              operator = columnFilterOj.column.operator || "eq";
              if (["<", ">"].indexOf(compareOperator) != -1) {
                switch (compareOperator) {
                  case "<":
                    operator = "lt";
                    break;
                  case ">":
                    operator = "gt";
                    break;
                }
                filterValue = filterValue.substring(1, filterValue.length);
              }
              type = Type == 'total' ? 'total' : 'numeric';
              //operator = isArray ? (columnFilterOj.filterTerm[0].type == 1 ? 'eq' : (columnFilterOj.filterTerm[0].type == 3 ? 'gt' : 'lt')) : 'eq';
              if (isNaN(filterValue)) {
                return false;
              }
              break;
            case "date":
              filterValue = moment(columnFilterOj.filterTerm).format(
                util.dateTimeFormatAmPm
              );
              type = "date";
              operator = columnFilterOj.column.operator || "eq";
              convert = columnFilterOj.column.convert ? "true" : "false";
              isDate = true;
              timezoneOffset = new Date().getTimezoneOffset();

              break;
            case "bool":
              filterValue = columnFilterOj.filterTerm;
              type = "boolean";
              operator = "eq";
              break;
            default:
              filterValue = columnFilterOj.filterTerm; // temparary fix for now
              type = Type ? Type : "string";
              operator = "like";
              break;
          }
          let cName = this.getProperty(columnFilterOj.column.key);
          if (isDate) {
            if (
              this.props.dataProperty === "scaleReport" ||
              this.props.dataProperty === "kicReports"
            ) {
              filters.push({
                operator: operator,
                value: filterValue,
                property: cName,
                type: type,
                convert: convert,
                timezoneOffset: this.state.siteSelected
                  ? this.state.siteSelected.timeZone
                  : "",
                gridFilter: true,
                gridFilterValue: filterValue,
              });
            } else {
              filters.push({
                operator: operator,
                value: filterValue,
                property: cName,
                type: type,
                convert: convert,
                timezoneOffset: timezoneOffset,
              });
            }

          }
          else {
            let obj = { "operator": operator, "value": filterValue, "property": cName, "type": type, "gridFilter": true, gridFilterValue: filterValue };

            if (this.props.dataProperty === "universalSearch" && cName === "Total") {
              // obj.gridFilterValue = filterValue+".00";
              // obj.value = filterValue+".00";
              obj.query = this.props.query;
            }

            filters.push(obj);
          }

          if (cName === "ScaleId" || cName === "CamId") {
            let SelectedFilter = filters.find((op) => op.property === cName);
            SelectedFilter.storeId = this.state.siteSelected
              ? this.state.siteSelected.value
              : "";
          }
        }
      }
    }
    return filters;
  }

  startDateChange = (selectedDate) => {
    let newObj = { ...this.state.dateRange };
    newObj.start = selectedDate;
    this.setState({
      dateRange: newObj,
      startDate: selectedDate ? selectedDate : "",
    });
  };

  endDateChange = (selectedDate) => {
    let newObj = { ...this.state.dateRange };
    newObj.end = selectedDate;
    this.setState({
      dateRange: newObj,
      endDate: selectedDate ? selectedDate : "",
    });
  };

  validateScaleSearch = () => {
    localStorage.removeItem('currentPage');
    this.setState({ page: defaultPageNumber, currentPage: defaultPageNumber });
    const { timezone, dateRange, toWeight, fromWeight } = this.state;
    let { start, end } = dateRange;

    let StartDate = start
      ? moment(moment(start)).tz(timezone).format("YYYY-MM-DD")
      : "";
    let StartTime = start
      ? moment(moment(start)).tz(timezone).format("HH:mm")
      : "";
    let EndDate = end
      ? moment(moment(end)).tz(timezone).format("YYYY-MM-DD")
      : "";
    let EndTime = end ? moment(moment(end)).tz(timezone).format("HH:mm") : "";

    if (start && end) {
      if (moment.utc(start).valueOf() > moment.utc(end).valueOf()) {
        swal({
          title: "Warning",
          text: "Please select end date/time greater than start date/time",
          icon: "warning",
        });
        return;
      }
    }

    let isInvalid;
    if (start && !moment(start).isValid()) isInvalid = "start";
    if (end && !moment(end).isValid()) isInvalid = "end";

    if (isInvalid) {
      swal({
        title: "Warning",
        text: `Please select valid ${isInvalid} date/time`,
        icon: "warning",
      });
      return;
    }

    if (+fromWeight && +toWeight && +fromWeight > +toWeight) {
      swal({
        title: "Warning",
        text: "Please select To Weight greater than From Weight",
        icon: "warning",
      });
      return;
    }

    this.setState(
      {
        fromDate: StartDate,
        fromTime: StartTime,
        toDate: EndDate,
        toTime: EndTime,
      },
      () => {
        this.bindStore();
      }
    );
  };

  getProperty(columnName) {
    const { columns } = this.props;
    let cl = columns.find((e) => e.key === columnName);
    if (cl && cl.nested) {
      columnName = cl.nested;
    }
    return columnName;
  }

  bindStore() {
    const {
      searchFilter,
      isSearch,
      action,
      directoryName,
      monitorTypeSelected,
      deviceType,
      scaleSearchOptions,
      AccessControlFilter,
      covert,
      locationId,
      clientId,
      screen,
      storeId,
    } = this.props;
    const {
      page,
      pageSize,
      searchValue,
      sortInfo,
      isComingFromEventFeed,
      filterVal,
      fromDate,
      toDate,
      toTime,
      fromTime,
      siteSelected,
      fromWeight,
      toWeight,
      changePagination,
      dataProperty,
      options,
    } = this.state;

    if (siteSelected) {
      document.querySelectorAll("input");
      // this.setState({
      // startDate: '',
      // endDate: '',
      // fromWeight: '',
      // toWeight: ''
      // })
    }
    if ((searchValue && searchValue != "" && searchValue != "") || filterVal) {
      this.quickSearch(this);
    } else {
      if (!this.props.isLocal) {
        if (isComingFromEventFeed) {
          this.filters = Object.values(this.props.filters);
        }
        var filterInfo = Object.assign(
          [],
          this.props.filters,
          this.getFilterParams(this.filters)
        );
        this.props.dispatch(getGridFilter({ filter: this.filters }));
        let params = {
          action: this.state.action || action,
          directoryName: this.state.directoryName || directoryName,
          page: page,
          pageSize: pageSize,
          populate: this.state.populate || this.props.populate || "",
          sort: sortInfo.sortColumn || this.state.sort,
          sortDir: sortInfo.sortDirection || this.state.sortDir,
          filters: JSON.stringify(isSearch ? searchFilter.filter : filterInfo),
          combos: this.props.combos || "",
          query: this.props.query || "",
          filterText: filterVal,
        };

        if (covert === true || covert === false) {
          params.covert = covert;
        }

        if (
          this.props.dataProperty === "universalSearch" &&
          params.filters.length > 2
        )
          params.gridFilter = "true";

        if (scaleSearchOptions) {
          // let scaleData = {
          //   populate: "StoreId ScaleId CamId VideoClipId",
          //   fromDate: fromDate,
          //   toDate: toDate,
          //   toTime: toTime,
          //   fromTime: fromTime,
          //   storeName: siteSelected ? siteSelected.value : '5f9abaf5dfab1630a8b19d4d',
          //   fromWeight: fromWeight,
          //   toWeight: toWeight,
          //   timezoneOffset: siteSelected ? siteSelected.timeZone : ''
          // }
          // params = { ...params, ...scaleData };
          params.fromWeight = fromWeight;
          params.toWeight = toWeight;
        }

        if (AccessControlFilter || scaleSearchOptions) {

          let videoFiltervalue = this.state.videoFiltervalue

          if(this.state.videoFilterlabel === "All") {
            this.state.videoFilterselected = false;
          };

          let videoFilterselected = this.state.videoFilterselected

          let filterData = {
            populate: "StoreId ScaleId CamId VideoClipId",
            fromDate: fromDate,
            toDate: toDate,
            toTime: toTime,
            fromTime: fromTime,
            storeName: siteSelected
              ? siteSelected.value
              : "5f9abaf5dfab1630a8b19d4d",
            timezoneOffset: siteSelected ? siteSelected.timeZone : "",
            videoFilter: videoFilterselected,
            [videoFiltervalue]: true
          };
          params = { ...params, ...filterData };
        }

        if (screen === "Access Control Devices") {
          let obj = { clientId: clientId, storeId: storeId };
          params.locationId = locationId;
          params.clientId = clientId;
          params.data = obj;
        }

        if (deviceType) {
          params.deviceType = deviceType;
        }

        if (monitorTypeSelected) {
          params.monitorTypeSelected = monitorTypeSelected;
        }

        if (this.props.isSalesGrid) {
          params.Category = this.props.Category;
          params.NoCategory = this.props.NoCategory;
        }
        params = util.updateSiteAndTagsFilter(this, params);

        if (this.props.showAllRecords) {
          params.showAllRecords = true;
        }

        if (dataProperty && dataProperty == "smartAcco") {
          changePagination.bind(this, params);
        } else {
          this.setState({ isLoading: true });
        }

        if (this.props && dataProperty !== "smart") {
          this.props.listAction &&
            this.props.dispatch(this.props.listAction.request(params));
        }
      }
    }
  }

  componentWillMount() {
    if (this.props.isSearch) {
      return;
    }
    // load Preference
    if (this.props.dataProperty && this.props.dataProperty != "smartAcco") {
      this.setState({ isLoading: true });
      this.props.dispatch(
        getUserPreference.request({
          action: "load",
          type: "grid",
          prefName: window.location.hash.substr(2),
        })
      );
    }
  }

  pageSize(pageSize = 50) {
    let page = 1;
    if (pageSize < 1) {
      pageSize = 10;
    }
    if (pageSize > 100) {
      pageSize = 100;
    }
    // this.state.page = 1;
    // this.state.pageSize = pageSize;
    this.setState({
      pageSize: pageSize,
      page: page
    });
    this.props.setPage && this.props.setPage(String(page))
  }

  pageChange(page) { // NOTE - page Change
    const { pageTotal } = this.state;
    if (page < 1) {
      page = 1;
    }
    if (page > pageTotal) {
      page = pageTotal - 1;
    }
    // this.state.page = page;
    this.setState({
      page: String(page),
      currentPage: String(page)
    });
    this.props.setPage && this.props.setPage(String(page))
  }

  getPagingOptions() { // NOTE - get Paging options
    // PAGINATION OPTIONS
    const { page, pageSize, total } = this.state;
    const { localPaging } = this.props;

    return {
      defaultCurrent: defaultPageNumber,
      current: page,
      pageSize: pageSize,
      showSizeChanger: true,
      showQuickJumper: true,
      onShowSizeChange: (_, pageSize) => {
        this.pageSize(pageSize);
        if (localPaging) {
          return;
        }
        // this.bindStore()
      },
      onChange: (page) => {
        if (page == this.state.page) {
          return;
        }
        console.log("🚀 ~ file: GridBase.js ~ line 1050 ~ GridView ~ getPagingOptions ~ page", page)
        this.pageChange(page);
        // this.state.page = page;
        this.setState({
          page: page
        })
        if (localPaging) {
          return;
        }
        //this.bindStore();
      },
      pageSizeOptions: ["5", "10", "20", "30", "50", "100"],
      total: total,
      showTotal: (total, range) => `${range[0]} to ${range[1]} of ${total}`,
    };
  }

  handleSearch = (column, selectedKeys, confirm) => () => {
    if (confirm) {
      confirm();
    }
    this.handleFilterChange({ filterTerm: selectedKeys[0], column });
  };

  onClearFilters = () => {
    this.filters = {};
    this.setState({ filtersGrid: {} });
    this.bindStore();
  };

  handleReset = (column, clearFilters) => () => {
    clearFilters();
    this.handleFilterChange({ column });
  };

  handleFilterChange = (filter) => {
    let newFilters = { ...this.filters };
    /** add filtered state */
    let columnsArray = [...this.state.columns];
    let colIndex = columnsArray.findIndex((c, i) => c.key == filter.column.key);
    let filterTerm = !!filter.filterTerm;
    if (colIndex > -1) {
      if (filterTerm) {
        if (filter.column.type == "date") {
          columnsArray[
            colIndex
          ].timezoneOffset = new Date().getTimezoneOffset();
          columnsArray[colIndex].convert = filterTerm;
        }
        columnsArray[colIndex].filtered = filterTerm;
      } else {
        columnsArray[colIndex].filtered =
          columnsArray[colIndex].key == "IsVideoAvailable" ? 0 : filterTerm;
        columnsArray[colIndex].filteredValue =
          columnsArray[colIndex].key == "IsVideoAvailable" ? 0 : [];
      }
    }
    /** end filtered state */

    if (filterTerm) {
      if (filter.column.type == "date") {
        filter.column.timezoneOffset = new Date().getTimezoneOffset();
        filter.column.convert = true;
      }
      newFilters[filter.column.key] = filter;
    } else if (filter.column.key == "IsVideoAvailable") {
      newFilters[filter.column.key] = filter;
    } else {
      delete newFilters[filter.column.key];
    }

    let isFilter = false;
    columnsArray.map((d, i) => {
      if (columnsArray[i].filtered) {
        isFilter = true;
      }
    });

    this.filters = newFilters;
    this.setState(
      {
        filtersGrid: newFilters,
        page: 1,
        currentPage: 1,
        columns: columnsArray,
        isFilter,
      },
      () => {
        // this.setState({ filtersGrid: newFilters, columns: columnsArray, isFilter }, () => {
        // this.setState({ filtersGrid: newFilters, page: localStorage.getItem('currentPage'), currentPage: localStorage.getItem('currentPage'), columns: columnsArray, isFilter }, () => {
        // this.setState({ filtersGrid: newFilters, page: this.props.page, currentPage: this.props.page, columns: columnsArray, isFilter }, () => {

        this.bindStore();
      }
    );
  };

  handleResize = (index) => (e, { size }) => {
    let columns = [...this.state.gridColumns];
    let currentWidth = columns[index].width;
    this.width = this.width - currentWidth + size.width;
    columns[index].width = size.width;
    this.setState({ gridColumns: columns });
  };

  onChangeDateFilter(columnKey, value) {
    this.handleFilterChange({
      column: { key: columnKey, type: "date", convert: true },
      filterTerm: value ? value : "",
    });
  }

  columnRenderer(col, index, value, data) {
    if (typeof value == "object" && value != null) {
      value = value.name;
    }
    if (col.type == "date") {
      value = util.standardDate(
        value,
        data,
        col.isLocal,
        col.converWithStoreTimezone
      );
    }
    if (col.type == "int" && col.render != false) {
      value = util.rendererFloat(value, data);
    }
    if (col.type == "bool") {
      value = util.rendererBool(value, data);
    }
    if (col.type == "store") {
      value = util.rendererStore(value, data, col);
    }
    if (col.formatter) {
      value = col.formatter(value, data, index, this);
    }
    if (col.currency) {
      value = util.rendererCurrency(value, data, col);
    }
    return <span>{value}</span>;
  }

  cloneOfColumnRenderer(col, index) {
    const { currentRecord } = this.state;
    // let value = currentRecord[col.key];
    let value = util.deepFind(currentRecord, col.key);
    if (typeof value == "object" && value != null) {
      value = value.name;
    }
    if (col.type == "date") {
      value = util.standardDate(
        value,
        currentRecord,
        col.isLocal,
        col.converWithStoreTimezone
      );
    }
    if (col.type == "int" && col.render != false) {
      value = util.rendererFloat(value, currentRecord);
    }
    if (col.type == "bool") {
      value = util.rendererBool(value, currentRecord);
    }
    if (col.type == "store") {
      value = util.rendererStore(value, currentRecord, col);
    }
    if (col.formatter) {
      value = col.formatter(value, currentRecord, index, this);
    }
    if (col.currency) {
      value = util.rendererCurrency(value, currentRecord, col);
    }
    if (
      col.key === "NotificationDetail" &&
      currentRecord.NotifcationData &&
      currentRecord.NotifcationData.length > 0
    ) {
      const NotificationObject = currentRecord.NotifcationData[0];
      value = (
        <div>
          {
            currentRecord.NotifcationData.map((NotificationObject, _i) => {
              return (
                <div key={_i} style={{ marginTop: _i > 0 ? 10 : 0 }}>
                  {
                    NotificationObject.to && (
                      <div>
                        <b>To:</b> {NotificationObject.to}
                      </div>
                    )
                  }
                  {
                    NotificationObject.from && (
                      <div>
                        <b>From:</b> {NotificationObject.from}
                      </div>
                    )
                  }
                  {
                    NotificationObject.subject && (
                      <div>
                        <b>Subject:</b> {NotificationObject.subject}
                      </div>
                    )
                  }
                  {
                    NotificationObject.body && (
                      <>
                        <div>
                          <b>Message:</b>
                        </div>
                        <div
                          dangerouslySetInnerHTML={{
                            __html: NotificationObject.body,
                          }}
                        >
                          {/* {NotificationObject.body} */}
                        </div>
                      </>
                    )
                  }
                </div>
              )
            })
          }
        </div>
      )
    } else if (
      col.key === "NotificationDetail" &&
      currentRecord.NotifcationData &&
      currentRecord.NotifcationData.length === 0
    ) {
      value = <span>No Notification Found</span>;
    }
    return <span>{value}</span>;
  }

  filterSearchChange = (name, value, operator) => {
    let columnsArray = [...this.state.columns];
    let colIndex = columnsArray.findIndex((c, i) => c.key == name);
    if (colIndex > -1) {
      switch (operator) {
        case ">":
          if (columnsArray[colIndex].greaterValue) {
            columnsArray[colIndex].greaterValue[0] = value;
          } else {
            columnsArray[colIndex].greaterValue = [value];
          }
          break;
        case "<":
          if (columnsArray[colIndex].smallerValue) {
            columnsArray[colIndex].smallerValue[0] = value;
          } else {
            columnsArray[colIndex].smallerValue = [value];
          }
          break;
        default:
          if (columnsArray[colIndex].searchExactValue) {
            columnsArray[colIndex].searchExactValue[0] = value;
          } else {
            columnsArray[colIndex].searchExactValue = [value];
          }
          break;
      }
      if (columnsArray[colIndex].filteredValue) {
        columnsArray[colIndex].filteredValue[0] =
          operator && value ? operator + value : value;
      } else {
        columnsArray[colIndex].filteredValue = [
          operator && value ? operator + value : value,
        ];
      }
    }

    this.setState({ columns: columnsArray });
  };

  handleChange = (checked) => {
    this.setState({ checked: !checked });
    let column = { key: "IsVideoAvailable", type: "bool" };
    this.handleFilterChange({ filterTerm: checked ? 0 : 1, column: column });
  };

  onVideoClick = (index, record, col) => { // NOTE - on video click
    console.log('this.props.model, record', this.props.model, record, col)
    if (
      // (
      //   this.props.model === 'realWave'
      //   && ((record.VideoClipId && record.VideoClipId._id && record.IsVideoAvailable) || (record._id && record.IsVideoAvailable))
      // ) || (
      //   this.props.model === 'old'
      //   && record.InvoiceId
      // ) || (
      //   this.props.model === undefined
      //   && record.InvoiceId
      // )
      (record.IsVideoAvailable || (record.VideoClipId && record.VideoClipId.IsVideoAvailable)) ||
      (record.videoClipdata && record.videoClipdata._id)
      // record.VideoClipId
    ) {
      this.setState(
        {
          videoClicked: true,
          videoLoading: true,
          currentRecord: record,
        },
        () => {
          switch (this.props.model) {
            case "realWave":
              this.props.dispatch(
                getReceiptClip.request({
                  InvoiceId:
                    record.VideoClipId && record.VideoClipId.InvoiceId
                      ? record.VideoClipId.InvoiceId
                      : record.InvoiceId,
                  modelName: "realwaveVideoClip",
                  ViewedOn: new Date().toISOString(),
                  Id:
                    record.videoClipdata ?
                      record.videoClipdata._id :
                      record.VideoClipId && record.VideoClipId._id
                        ? record.VideoClipId._id
                        : record._id,
                })
              );
              break;
            case "old":
              let loggedData = util.getScreenDetails(
                util.getLoggedUser(),
                this.props.location,
                consts.Played + record.EventId + " (" + record.Status + ")"
              );
              this.props.dispatch(
                saveActivityLog.request({ action: "save", data: loggedData })
              );
              this.props.dispatch(
                getReceiptAPI.request({ InvoiceId: record.InvoiceId })
              );
              break;
            default:
              let loggedDataDefault = util.getScreenDetails(
                util.getLoggedUser(),
                this.props.location,
                consts.Played + record.EventId + " (" + record.Status + ")"
              );
              this.props.dispatch(
                saveActivityLog.request({ action: "save", data: loggedDataDefault })
              );
              this.props.dispatch(
                getReceiptAPI.request({ InvoiceId: record.InvoiceId })
              );
              break;
          }
        }
      );
    }
  };

  constructGridColumns(columns) {
    this.width = 0;
    let { sortInfo, checked } = this.state;

    if (sortInfo.sortDirection == "ASC") var direction = "ascend";
    else if (sortInfo.sortDirection == "DESC") var direction = "descend";
    return columns.map((col, index) => {
      let colKey = col.key;
      var width = col.width || 0;
      this.width += width;
      var column = {
        key: col.key,
        render: col.formatter,
        onCell: (record, index) => {
          var rowIndex = 0;
          return {
            // onClick: this.props.onRowClick ? this.props.onRowClick.bind(this, rowIndex, record, col) : false
            onClick:
              col.key === "IsVideoAvailable"
                ? this.onVideoClick.bind(this, rowIndex, record, col)
                : this.props.onRowClick
                  ? this.props.onRowClick.bind(this, rowIndex, record, col)
                  : false,
          };
        },
        title: col.name,
        dataIndex: col.key,
        type: col.type || "string",
        align: col.align == "right" ? "right" : "left",
        sorter: col.sort ? true : false,
        sortOrder: sortInfo.sortColumn === col.key ? direction : false,
        width: width,
        className: col.cellClass || "",
        render: this.columnRenderer.bind(this, col, index),
        export: col.export || true,
        hidden: col.hidden || false,
        toggle: col.toggle || false,
        formatter: col.formatter,
        converWithStoreTimezone: col.converWithStoreTimezone,
        isLocal: col.isLocal
      };
      column.onHeaderCell = (column) => ({
        width: column.width,
      });

      if (column.type == "date" && col.filter) {
        Object.assign(column, {
          filterDropdown: ({
            setSelectedKeys,
            selectedKeys,
            confirm,
            clearFilters,
          }) => {
            var options = {
              placeholder: "Search " + col.name,
            };
            return (
              <DateFilter
                column={column}
                options={options}
                onChange={(val) => {
                  this.filterSearchChange(colKey, val);
                }}
                handleSearch={() =>
                  this.handleSearch(
                    column,
                    col.filteredValue || selectedKeys,
                    confirm
                  )
                }
                handleReset={() => this.handleReset(column, clearFilters)}
                filterProps={{
                  selectedKeys: col.filteredValue || selectedKeys,
                  confirm,
                  clearFilters,
                }}
              />
            );
          },
          filterIcon: (filtered) => (
            <Icon
              type="filter"
              className={
                col.filtered
                  ? "gridbase-filter-color"
                  : "gridbase-nonfilter-color"
              }
            />
          ),
          onFilterDropdownVisibleChange: (visible) => {
            if (visible) {
              setTimeout(() => {
                this.searchInput.focus();
              });
            }
          },
        });
      } else if (column.type == "bool" && col.toggle && col.filter) {
        Object.assign(column, {
          filterDropdown: () => {
            return true;
          },
          filterMultiple: false,
          filterIcon: (filtered) => (
            <>
              <input
                id={`box-${col.name}`}
                className={"box-1"}
                type="checkbox"
              />
              {/* <Icon title='Filter menu' htmlFor={`box-${col.name}`} onClick={() => this.handleChange(checked)} className={((checked ? 'gridbase-filter-color' : 'gridbase-nonfilter-color') + ' video-filter')} type="filter" /> */}
            </>
          ),
        });
      } else {
        if (col.filter) {
          Object.assign(column, {
            filterDropdown: ({
              setSelectedKeys,
              selectedKeys,
              confirm,
              clearFilters,
            }) => (
              <div className="custom-filter-dropdown">
                {column.type == 'numeric' || column.type == 'total' && (
                  <>
                    <Input
                      ref={(ele) => (this.searchInput = ele)}
                      placeholder={"Greater Than " + col.name}
                      value={
                        (col.greaterValue && col.greaterValue[0]) ||
                        selectedKeys[0]
                      }
                      onChange={(e) =>
                        this.filterSearchChange(colKey, e.target.value, ">")
                      }
                      onPressEnter={this.handleSearch(
                        column,
                        col.filteredValue || selectedKeys,
                        confirm
                      )}
                      name={col.key}
                      disabled={
                        (col.searchExactValue && col.searchExactValue[0]) ||
                          (col.smallerValue && col.smallerValue[0])
                          ? true
                          : false
                      }
                    />
                    <Input
                      ref={(ele) => (this.searchInput = ele)}
                      placeholder={"Smaller Than " + col.name}
                      value={
                        (col.smallerValue && col.smallerValue[0]) ||
                        selectedKeys[0]
                      }
                      onChange={(e) =>
                        this.filterSearchChange(colKey, e.target.value, "<")
                      }
                      onPressEnter={this.handleSearch(
                        column,
                        col.filteredValue || selectedKeys,
                        confirm
                      )}
                      name={col.key}
                      disabled={
                        (col.searchExactValue && col.searchExactValue[0]) ||
                          (col.greaterValue && col.greaterValue[0])
                          ? true
                          : false
                      }
                    />
                  </>
                )}
                <Input
                  ref={(ele) => (this.searchInput = ele)}
                  placeholder={"Search " + col.name}
                  value={
                    (col.greaterValue && col.greaterValue[0]) ||
                      (col.smallerValue && col.smallerValue[0])
                      ? ""
                      : (col.filteredValue && col.filteredValue[0]) ||
                      selectedKeys[0]
                  }
                  onChange={(e) =>
                    this.filterSearchChange(colKey, e.target.value)
                  }
                  onPressEnter={this.handleSearch(
                    column,
                    col.filteredValue || selectedKeys,
                    confirm
                  )}
                  name={col.key}
                  disabled={
                    (col.greaterValue && col.greaterValue[0]) ||
                      (col.smallerValue && col.smallerValue[0])
                      ? true
                      : false
                  }
                />
                <Button
                  type="primary"
                  onClick={this.handleSearch(
                    column,
                    col.filteredValue || selectedKeys,
                    confirm
                  )}
                >
                  Search
                </Button>
                <Button onClick={this.handleReset(column, clearFilters)}>
                  Reset
                </Button>
              </div>
            ),
            filterIcon: (filtered) => (
              <Icon
                type="filter"
                className={
                  col.filtered
                    ? "gridbase-filter-color"
                    : "gridbase-nonfilter-color"
                }
              />
            ),
            onFilterDropdownVisibleChange: (visible) => {
              if (visible) {
                setTimeout(() => {
                  this.searchInput.focus();
                });
              }
            },
          });
        }
      }
      return column;
    });
  }

  onChange(pagination, filters, sorter) {
    localStorage.setItem("currentPage", pagination.current);
    localStorage.setItem("currentPageSize", pagination.pageSize);
    var sortDirection = "";
    if (sorter.order == "descend" || sorter.order == "DESC") {
      sortDirection = "DESC";
    } else if (sorter.order == "ascend" || sorter.order == "ASC") {
      sortDirection = "ASC";
    } else {
      if (Object.keys(sorter).length == 0) {
        sortDirection =
          this.state.sortInfo.sortDirection == "ASC" ? "DESC" : "ASC";
        sorter.columnKey = this.state.sortInfo.sortColumn;
      } else {
        sortDirection = "NONE";
      }
    }

    this.setState(
      {
        sortInfo:
          sortDirection == "NONE"
            ? {}
            : { sortColumn: sorter.columnKey, sortDirection: sortDirection },
      },
      () => {
        let originalName = this.state.sortInfo.sortColumn;
        this.state.sortInfo["sortColumn"] = this.getProperty(originalName);
        let searchColumn = Object.keys(filters);
        var me = this;
        for (let index = 0; index < searchColumn.length; index++) {
          let matchColumn = me.props.columns.findIndex(
            (e) => e.key == searchColumn[index]
          );
          const element = filters[searchColumn[index]];
          if (matchColumn != 0 && matchColumn != -1) {
            if (
              !me.filters.hasOwnProperty(me.props.columns[matchColumn].key) ||
              (me.filters[me.props.columns[matchColumn].key] &&
                me.filters[me.props.columns[matchColumn].key].filterTerm !=
                element[0])
            ) {
              if (
                element[0] ||
                me.filters.hasOwnProperty(me.props.columns[matchColumn].key)
              ) {
                me.handleFilterChange({
                  filterTerm: element[0],
                  column: me.props.columns[matchColumn],
                });
              }
            }
          }
        }
        this.bindStore();
      }
    );
  }

  exportExcelRecord = () => {
    let {
      filtersGrid,
      sortInfo,
      fromDate,
      toDate,
      toTime,
      fromTime,
      siteSelected,
      fromWeight,
      toWeight,
      videoFiltervalue
    } = this.state;
    let { props } = this;
    let screenInfo = this.capitalize(
      props.screenName == "Sales"
        ? "Saved Sales"
        : props.screenName || (props.screen == "Store" ? "Sites" : props.screen)
    );
    let params = {
      action: "export",
      sort: sortInfo.sortColumn,
      populate: props.populate,
      sortDir: sortInfo.sortDirection,
      filters: JSON.stringify(
        props.filters || this.getFilterParams(filtersGrid) || {}
      ),
      combos: props.combos || "",
      columns: props.columns,
      fileName: props.filename || props.dataProperty || "Report",
      utcTime: moment().utcOffset(),
      query: this.props.query || "",
    };
    if (props.isSalesGrid) {
      params.Category = props.Category;
      params.NoCategory = props.NoCategory;
    }

    if (this.props.dataProperty === "universalSearch")
      params.gridFilter = "true";

    if (props.scaleSearchOptions || props.AccessControlFilter) {

      let videoFilterselected = this.state.videoFilterselected

      let filterData = {
        fromDate: fromDate,
        toDate: toDate,
        toTime: toTime,
        fromTime: fromTime,
        storeName: siteSelected ? siteSelected.value : "",
        videoFilter: videoFilterselected,
        [videoFiltervalue]: true
        // fromWeight: fromWeight,
        // toWeight: toWeight,
      };
      params = { ...params, ...filterData };

      params.timezoneOffset = siteSelected ? siteSelected.timeZone : "";
    }
    if (props.scaleSearchOptions) {
      params.fromWeight = fromWeight;
      params.toWeight = toWeight;
    }

    this.setState({ isLoading: true });
    let loggedData = util.getScreenDetails(
      util.getLoggedUser(),
      props.screenPathLocation,
      consts.Export + screenInfo
    );
    this.props.dispatch(
      saveActivityLog.request({ action: "save", data: loggedData })
    );
    this.props.dispatch(this.props.listAction.request(params));
  };

  printDocument = () => {
    return;
    var content = document.getElementsByClassName("print-table");
    let { props } = this;
    let screenInfo = this.capitalize(
      props.screenName == "Sales"
        ? "Saved Sales"
        : props.screenName || (props.screen == "Store" ? "Sites" : props.screen)
    );
    if (content) {
      let loggedData = util.getScreenDetails(
        util.getLoggedUser(),
        props.screenPathLocation,
        consts.Print + screenInfo
      );
      this.props.dispatch(
        saveActivityLog.request({ action: "save", data: loggedData })
      );
      var pri = document.getElementById("ifmcontentstoprint").contentWindow;
      pri.document.open();
      pri.document.write(content[0].innerHTML);
      pri.document.close();
      pri.focus();
      pri.print();
    }
  };

  capitalize = (s) => {
    if (typeof s !== "string") return "";
    return s.charAt(0).toUpperCase() + s.slice(1);
  };

  onInputChange(event, val) {
    //
    const { dispatch } = this.props;
    clearTimeout(this.timer);
    // this.quickSearchvalue = event.target.value;
    this.quickSearchvalue = event ? event.target.value : val;
    this.fromQuickSearch = true;
    dispatch(
      getGridSearch({
        parentRoute: window.location.hash.split("/")[2],
        [window.location.hash]: this.quickSearchvalue,
      })
    );
    this.setState(
      {
        searchValue: this.quickSearchvalue,
        searchloader: this.quickSearchvalue,
        filterVal: this.quickSearchvalue,
      },
      () => {
        this.timer = setTimeout(this.quickSearch.bind(this), 1000);
      }
    );
  }

  quickSearchFilterValue(value, scope) {
    let me = scope;
    let valueType = "string";
    if (!isNaN(Number(value))) {
      valueType = "numeric";
    } else if (moment(value).isValid()) {
      valueType = "date";
    }
    let columns = this.props.columns.filter(function (columns) {
      return columns.filter == true;
    }),
      filter = [];
    columns.forEach((item) => {
      let localFilter = me.state.filtersGrid[item.key];
      if (
        (valueType === item.type || item.type === "string") &&
        item.type != "date"
      ) {
        let isInLocalFilter = !!localFilter;
        let filterValue = {
          operator: "like",
          value: value,
          property: item.nested ? item.nested : item.key,
          type: item.type,
        };
        if (isInLocalFilter) {
          filterValue.gridFilter = true;
          filterValue.gridFilterValue = localFilter.filterTerm;
        }
        if (
          filterValue.property === "ScaleId" ||
          filterValue.property === "CamId"
        ) {
          filterValue.storeId = this.state.siteSelected
            ? this.state.siteSelected.value
            : "";
        }
        filter.push(filterValue);
      }
      if (item.type == "date") {
        if (valueType == "date") {
          filter.push({
            operator: "eq",
            value: moment(value).format(util.dateTimeFormatAmPm),
            property: item.nested ? item.nested : item.key,
            type: item.type,
            convert: item.convert ? "true" : "false",
            timezoneOffset: new Date().getTimezoneOffset(),
          });
        }
        if (
          localFilter &&
          localFilter.filterTerm &&
          localFilter.filterTerm != null
        ) {
          filter.push({
            operator: "eq",
            gridFilter: true,
            gridFilterValue: moment(localFilter.filterTerm).format(
              util.dateTimeFormatAmPm
            ),
            property: item.nested ? item.nested : item.key,
            type: item.type,
            convert: item.convert ? "true" : "false",
            timezoneOffset: new Date().getTimezoneOffset(),
          });
        }
      }

      if (item.type == "numeric") {
        if (valueType == "numeric") {
          filter.push({
            operator: "eq",
            value: value,
            property: item.nested ? item.nested : item.key,
            type: item.type,
          });
        }
        if (
          localFilter &&
          localFilter.filterTerm &&
          localFilter.filterTerm != null
        ) {
          filter.push({
            operator: "eq",
            gridFilter: true,
            gridFilterValue: localFilter.filterTerm,
            property: item.nested ? item.nested : item.key,
            type: item.type,
          });
        }
      }
    });
    return JSON.stringify(filter);
  }

  quickSearch = (event) => {
    let scope = this;
    let { searchValue, filterVal } = scope.state;
    let value = searchValue || filterVal;

    if (value && value != "" && value != "") {
      let {
        combos,
        directoryName,
        populate,
        isSalesGrid,
        Category,
        NoCategory,
        action,
      } = scope.props;
      let { page, pageSize, sortInfo } = scope.state;
      scope.setState(() => {
        let quickSearchParams = {
          filters: scope.quickSearchFilterValue(value, scope),
          combos: combos || "",
          filterText: value,
          directoryName: directoryName || "",
          page: page,
          pageSize: pageSize,
          populate: populate || "",
          sort: sortInfo.sortColumn,
          sortDir: sortInfo.sortDirection,
          action: action,
        };
        if (isSalesGrid) {
          quickSearchParams.Category = Category;
          quickSearchParams.NoCategory = NoCategory;
        }
        if (value == "") {
          quickSearchParams.filters = [];
        }
        scope.setState({ isLoading: true });
        if (scope.fromQuickSearch) {
          quickSearchParams.page = 1;
          scope.setState({ page: 1 });
          scope.fromQuickSearch = false;
        }
        quickSearchParams = util.updateSiteAndTagsFilter(
          this,
          quickSearchParams
        );
        let loggedData = util.getScreenDetails(
          util.getLoggedUser(),
          this.props.screenPathLocation,
          consts.Search + value.trim()
        );
        this.props.dispatch(
          saveActivityLog.request({ action: "save", data: loggedData })
        );
        scope.props.dispatch(scope.props.listAction.request(quickSearchParams));
      });
    } else {
      this.bindStore();
    }
  };

  onShowHideCheckUncheck = (value, item) => {
    const { columns } = this.state;
    columns.map((d, i) => {
      if (d.name == item) {
        d.hidden = !d.hidden;
      }
    });
    this.setState({ columns: columns });
  };

  /**
   * Clean All column filter
   */
  cleanFilter = (clearScaleValues) => {
    this.filters = {};
    let columnsArray = [...this.state.columns];
    columnsArray.map((d, i) => {
      columnsArray[i].filtered = false;
      columnsArray[i].hidden = false;
      columnsArray[i].filteredValue = [];
      columnsArray[i].smallerValue = [];
      columnsArray[i].greaterValue = [];
    });
    // this.setState({ filtersGrid: newFilters, columns: columnsArray, isFilter }, () => {
    // this.setState({ filtersGrid: newFilters, page: localStorage.getItem('currentPage'), currentPage: localStorage.getItem('currentPage'), columns: columnsArray, isFilter }, () => {
    // this.setState({ filtersGrid: newFilters, page: this.props.page, currentPage: this.props.page, columns: columnsArray, isFilter }, () => {
    localStorage.removeItem('currentPage');
    this.setState(
      {
        filtersGrid: {},
        // page: localStorage.getItem("currentPage"),
        // currentPage: localStorage.getItem("currentPage"),
        page: defaultPageNumber,
        currentPage: defaultPageNumber,
        columns: columnsArray,
        isFilter: false,
        errorForm: false,
        checked: false,
        isComingFromEventFeed: false
      },
      () => {
        if (clearScaleValues) {
          let dateRange = { start: "", end: "" };

          if(this.selectVideofilter && this.selectVideofilter.current){
            this.selectVideofilter.current.select.setValue(this.state.videoFilterdefault);
            if (this.state.videoFilterdefault.label === "All") {this.setState({ videoFilterselected: false })};
          }
          this.setState(
            {
              fromDate: "",
              toDate: "",
              toTime: "",
              fromTime: "",
              fromWeight: "",
              toWeight: "",
              startDate: "",
              endDate: "",
              dateRange: dateRange,
            },
            () => {
              this.bindStore();
            }
          );
        } else {
          this.bindStore();
        }
        // this.bindStore();
      }
    );
  };

  togglePreference = () => {
    this.setState({ isTogglePreference: !this.state.isTogglePreference });
  };

  /**
   * Save Preferences
   */
  savePreferences = () => {
    const { searchFilter, isSearch, action, directoryName } = this.props;
    const {
      page,
      pageSize,
      sortInfo,
      populate,
      isToggleAddPreference,
      columns,
    } = this.state;
    const formObj = { ...this.state.addForm };
    const { id, name, description, checkDefault } = formObj;
    let saveName = (name && name != "undefined" && name.trim()) || "";
    if (saveName) {
      // if (!id) {
      //   let preferenceDataArray = [...this.state.preferenceData];
      //   preferenceDataArray.unshift(formObj);
      //   this.setState({ preferenceData: preferenceDataArray })
      // }

      var filterInfo = Object.assign(
        [],
        this.props.filters,
        this.getFilterParams(this.filters)
      );
      let params = {
        action: this.state.action || action,
        directoryName: this.state.directoryName || directoryName,
        page: page,
        pageSize: pageSize,
        populate: populate || this.props.populate || "",
        sort: sortInfo.sortColumn || this.state.sort,
        sortDir: sortInfo.sortDirection || this.state.sortDir,
        filters: JSON.stringify(isSearch ? searchFilter.filter : filterInfo),
        combos: this.props.combos || "",
        columns: columns,
        query: this.props.query || "",
      };

      if (this.props.isSalesGrid) {
        params.Category = this.props.Category;
        params.NoCategory = this.props.NoCategory;
      }

      params = util.updateSiteAndTagsFilter(this, params);
      this.setState({ isToggleAddPreference: !isToggleAddPreference }, () => {
        this.props.dispatch(
          saveUserPreference.request({
            action: "save",
            id,
            name: saveName,
            description: description || "",
            checkDefault: checkDefault || false,
            type: "grid",
            prefName: window.location.hash.substr(2),
            info: JSON.stringify(params),
          })
        );
      });
    } else {
      this.setState({ errorForm: true });
    }
  };

  onChangeHandle = (e) => {
    let formObj = { ...this.state.addForm };
    let { name, value, type, checked } = e.target;
    formObj[name] = type == "checkbox" ? checked : value;
    this.setState({ addForm: formObj });
  };

  applyPreference = (data) => {
    if (data.info != "undefined") {
      let info = Object.keys(data.info).length > 0 ? JSON.parse(data.info) : {};
      let columnsArray = [...this.state.columns];
      if (info.columns) {
        info.columns.map((d, i) => {
          let colIndex = columnsArray.findIndex((f) => f.key == d.key);
          if (colIndex > -1) {
            columnsArray[colIndex].filteredValue = d.filteredValue
              ? d.filteredValue
              : "";
            columnsArray[colIndex].filter = d.filter;
            columnsArray[colIndex].hidden = !!d.hidden;
          }
        });
      }
      let {
        action,
        directoryName,
        page,
        pageSize,
        populate,
        sort,
        sortDir,
        filters,
        combos,
      } = info;
      let sortInfo = { sortColumn: sort, sortDirection: sortDir };
      let filtersArray = filters ? JSON.parse(filters) : [];

      let newFilters = {};

      columnsArray.map((m, index) => {
        let colIndex = filtersArray.findIndex(
          (c, i) => c.property == m.key || c.property == m.nested
        );
        if (colIndex > -1) {
          newFilters[columnsArray[index].key] = {
            column: columnsArray[index],
            filterTerm: filtersArray[colIndex].value,
          };
          columnsArray[index].filteredValue = [filtersArray[colIndex].value];
          columnsArray[index].filtered = true;
        } else {
          columnsArray[index].filteredValue = [];
          columnsArray[index].filtered = false;
        }
      });

      this.filters = newFilters;
      let isFilter = false;
      let index = columnsArray.findIndex((e) => e.hidden);
      if (index > -1 || Object.keys(newFilters).length > 0) {
        isFilter = true;
      }
      this.setState(
        {
          selectedPreference: data,
          isToggleAddPreference: false,
          columns: columnsArray,
          sortInfo,
          action,
          directoryName,
          page,
          pageSize,
          populate,
          sort,
          sortDir,
          filters,
          isFilter,
          combos: combos ? combos : {},
        },
        () => {
          this.bindStore();
        }
      );
    }
  };

  modifyDeletePreference = (data, type) => {
    let { defaultIndexPreference, isToggleAddPreference } = this.state;
    if (type == "Delete" && data.id) {
      this.props.dispatch(
        deletePreference.request({ action: "delete", id: data.id })
      );
    } else {
      data.description =
        data.description == "undefined" ? undefined : data.description;
      data.checkDefault = defaultIndexPreference == data.key;
      let formObj = {
        id: data.id,
        name: data.name,
        description: data.description || "",
        checkDefault: data.checkDefault,
      };
      this.setState({
        isToggleAddPreference: !isToggleAddPreference,
        addForm: formObj,
        ismodify: true,
      });
    }
  };

  renderTableData = (columnData) => {
    return (
      columnData.length > 0 && (
        <Col md={12} xs={12} className="receipt-data">
          <ReactStrapTable borderless size="sm">
            <tbody>
              {columnData.map((col, i) => {
                return (
                  col.dataIndex !== "IsVideoAvailable" &&
                  col.dataIndex !== "RejectedReason" && (
                    <tr key={col.i}>
                      <th
                        className="receiptdata"
                        style={{ width: "35%" }}
                      >
                        {col.title}
                      </th>
                      <td
                        className="receipt-total receiptdata"
                        style={{ position: "absolute", width: "65%" }}
                      >
                        {this.cloneOfColumnRenderer(col, i)}
                      </td>
                    </tr>
                  )
                );
              })}
            </tbody>
          </ReactStrapTable>
        </Col>
      )
    );
  };

  renderVideoClipComponent = (columnData) => {
    let timezone = moment.tz.guess();
    const { currentReceipt } = this.state;
    return (
      currentReceipt &&
      currentReceipt.event && (
        <Card
          className="camera-card-height"
          style={{ marginLeft: 10 }}
        >
          <CardHeader className="eventFeed-title contentText">
            <Row>
              <Col md={12}>
                <div style={{ marginBottom: 8, marginTop: 2 }}>
                  {this.props.screenDetails && this.props.screenDetails.name + " Register " + (currentReceipt.event.Register || '') + "-" + moment(currentReceipt.event.EventTime).format(util.dateFormat)}
                </div>
                <div>
                  <LiveCameraCard
                    fromVideoClip={true}
                    // className="receipt-popup"
                    data={currentReceipt}
                    hideReceipt={!this.props.isPOS}
                    overVideoReceipt={false}
                    downloadVideo={true}
                    modelName={this.props.model === 'realWave' && 'realwaveVideoClip'}
                  // modelName={'realwaveVideoClip'}
                  />
                </div>
              </Col>
            </Row>
          </CardHeader>
          {this.state.videoClicked && !this.props.isPOS &&
            <CardBody className="event-feed-transaction">
              {this.renderTableData(columnData)}
            </CardBody>
          }
        </Card>
      )
    );
  };

  render() {
    // NOTE render
    const {
      beforeRender,
      exportButton,
      height,
      autoHeight,
      isLocal,
      hideHeader,
      add,
      exchange,
      hideSearch,
      disablePagination,
      isSearch,
      screen,
      screenName,
      filename,
      storeChange,
      hidePref,
      showCleanFilter,
      showCollapse,
      onToggle,
      subTitle,
      hideColumnButton,
      searchVal,
      searchValActive,
      pageSizeProps,
      pageProps,
      customButton,
      scaleSearchOptions,
      AccessControlFilter,
      MoveAddInAccodian,
      zeroHeight,
      noScreenTtitle,
      AutoHeightClass,
      dataProperty,
      isLoadingdata,
      removeHeader
    } = this.props;
    let {
      gridData,
      isLoading,
      searchValue,
      columns,
      isFilter,
      isTogglePreference,
      isToggleAddPreference,
      addForm,
      preferenceData,
      defaultIndexPreference,
      isManagePreference,
      selectedPreference,
      errorForm,
      ismodify,
      filterVal,
      changePage,
      storeData,
      siteSelected,
      storesDataHit,
      startDuration,
      endDuration,
      timezone,
      fromWeight,
      toWeight,
      startDate,
      endDate,
      videoClicked,
      videoData,
      videoFilterdefault,
      // video clip
      currentReceipt,
      videoLoading,
    } = this.state;
    var searchValActivesds = searchValActive;
    let AutoHeightClass1 = AutoHeightClass ? AutoHeightClass : "";

    if ((AccessControlFilter || scaleSearchOptions) && !storesDataHit) {
      this.setState({ storesDataHit: true });
      this.props.dispatch(storesData.request({ stores: [] }));
    }

    const pagination = this.getPagingOptions();
    let gridColumns = this.constructGridColumns(columns);
    let gridColumnsData = [...gridColumns];
    gridColumns.map((d) => {
      if (d.hidden) {
        let indexFind = gridColumnsData.findIndex((p) => p.key == d.key);
        gridColumnsData.splice(indexFind, 1);
      }
    });
    let scroll =
      isLocal || autoHeight
        ? { x: this.width, y: height }
        : { x: this.width, y: height };
    let ios = util.isIOS();
    let widths = window.innerWidth < consts.ScreenWidth;
    let mobileCheck = ios || window.innerWidth < consts.MobileDeviceWidthCheck;

    const preferenceColumns = [
      {
        title: "Name",
        dataIndex: "name",
        filters: [],
        sorter: (a, b) => a.name.length - b.name.length,
        sortDirections: ["descend"],
      },
      {
        title: "Description",
        dataIndex: "description",
      },
      {
        title: "Default",
        dataIndex: "default",
        render: (text, record) =>
          record.key == defaultIndexPreference ? (
            <Form>
              <Input type="checkbox" name="defaultCheck" checked={true} />
            </Form>
          ) : (
            ""
          ),
      },
      {
        title: "Action",
        key: "action",
        render: (text, record) => (
          <span>
            <a
              href="javascript:;"
              onClick={() => this.modifyDeletePreference(record, "Modify")}
            >
              Modify{" "}
              <i className="fa fa-pencil-square-o" aria-hidden="true"></i>
            </a>
            <Divider type="vertical" />
            <a
              href="javascript:;"
              onClick={() => this.modifyDeletePreference(record, "Delete")}
            >
              Delete <i className="fa fa-minus-circle" aria-hidden="true"></i>
            </a>
          </span>
        ),
      },
    ];

    let preferenceDataGrid = [];
    preferenceData.length > 0 &&
      preferenceData.map((d, i) => {
        if (d.name) {
          preferenceDataGrid.push({
            key: i,
            name: d.name,
            description: d.description,
            default: d.checkDefault,
            id: d._id,
          });
        }
      });
    let val = searchValue || filterVal;

    // for auto-selecting the page and page size when coming back to the list after updating, deleting or cancelling
    if (pageSizeProps && pageSizeProps != this.state.pageSize && changePage) {
      this.setState({ pageSize: +pageSizeProps, changePage: false });
    }
    if (pageProps && pageProps != this.state.page && changePage) {
      this.setState({ page: +pageProps, changePage: false });
    }

    // for auto-selecting the page and page size when coming back to the list after updating, deleting or cancelling
    // if(pageSizeProps && pageSizeProps!=this.state.pageSize && changePage){
    //   this.setState({ pageSize: +pageSizeProps, changePage: false});
    // }
    // if(pageProps && pageProps!=this.state.page && changePage){
    //   this.setState({ page: +pageProps , changePage:false});
    // }

    if (searchValActive) this.onInputChange("", searchVal);
    let zeroHeight1 = zeroHeight ? zeroHeight : "";
    let MoveAddInAccodian1 = MoveAddInAccodian ? MoveAddInAccodian : "";

    return (
      <Fragment>
        <LoadingDialog isOpen={isLoadingdata ? false : isLoading} />
        { removeHeader ? "" :
          <Row className={"container-ie table-header-area" + zeroHeight1}>
            {widths ? (
              <Col xs={12}>
                {!hideSearch ? (
                  <div className="px-2">
                    <form
                      onSubmit={(e) => {
                        e.preventDefault();
                      }}
                    >
                      <InputGroup className="header-search-widths">
                        <Input
                          placeholder="Search"
                          value={val}
                          onChange={(evt) => this.onInputChange(evt)}
                        />
                      </InputGroup>
                    </form>
                  </div>
                ) : null}
              </Col>
            ) : null}
            {/* <Col xs={12} sm={12} md={4} lg={5} > */}
            {!noScreenTtitle && (
              <Col
                xs={12}
                sm={12}
                md={4}
                lg={2}
                class="col-lg-3"
                className=" pr-2"
              >
                <div className="cameracardText textConvert gridHeader">
                  {((this.props && screen) || screenName || filename) && (
                    <i className="fa icon2-events" aria-hidden="true" />
                  )}
                  {(this.props && screen) || screenName || filename}{" "}
                  {subTitle && `- ${subTitle}`}
                </div>
              </Col>
            )}
            {/* filter Prefrence */}

            <Col
              xs={12}
              sm={12}
              md={8}
              lg={10}
              className="text-right export-panel"
            >
              {/* <Col xs={12} sm={12} md={8} lg={7} className="text-right export-panel"> */}

              {this.state.videoClicked && (
                <div className="grid-collapse-icon">
                  <span onClick={() => this.onPressCollapse()}>
                    {" "}
                    <i
                      title="Expand"
                      className={"fa fa-chevron-right cursor"}
                    ></i>{" "}
                  </span>
                </div>
              )}
              <UncontrolledDropdown>
                {hideColumnButton == true ? null : (
                  <Tooltip placement="bottom" title={consts.HideUnhideColumns}>
                    <DropdownToggle
                      caret
                      className="btn-outline-secondary headerToolbar-button"
                    >
                      {mobileCheck ? <i className="fa fa-gear" /> : "COLUMNS"}
                    </DropdownToggle>
                  </Tooltip>
                )}
                <DropdownMenu>
                  <Form className={columns.length > 6 ? "column-filter" : ""}>
                    {columns.map((item, index) => {
                      let itemHideCheck = item.hidden ? item.hidden : false;
                      return (
                        <Row key={index} className="hide-show-button-row">
                          <Col className="hide-show-button-col ">
                            <FormGroup check>
                              <Label>
                                <InputStrap
                                  onClick={() =>
                                    this.onShowHideCheckUncheck("", item.name)
                                  }
                                  type="checkbox"
                                  checked={!itemHideCheck}
                                  readOnly
                                  id="checkbox2"
                                />
                                {item.name}
                              </Label>
                            </FormGroup>
                          </Col>
                        </Row>
                      );
                    })}
                  </Form>
                </DropdownMenu>
              </UncontrolledDropdown>
              {add ? (
                <Tooltip placement="bottom" title={consts.Add}>
                  <AntButton
                    className={
                      "ml-3 mb-1 dashboard-button gridAdd " + MoveAddInAccodian1
                    }
                    shape="circle"
                    icon="plus"
                    ghost
                    onClick={add}
                  />
                </Tooltip>
              ) : null}
              {exchange ? (
                <Tooltip placement="bottom" title={consts.SwitchBtn}>
                  <Button
                    onClick={() => exchange(this.filters)}
                    outline
                    className="no-sales-header-button grid-exchange-button"
                  >
                    {" "}
                    <i className="fa fa-exchange fa-2px"></i>
                  </Button>
                </Tooltip>
              ) : null}
              {(!hidePref ||
                showCleanFilter ||
                dataProperty === "universalSearch") && (
                  <Tooltip placement="bottom" title={consts.CleanFilter}>
                    <Button
                      onClick={() => this.cleanFilter(true)}
                      outline
                      className="no-sales-header-button"
                    >
                      <i
                        className={
                          "fa fa-filter-slash fa-2px " +
                          (isFilter ? "gridbase-filter-color" : "")
                        }
                      ></i>
                    </Button>
                  </Tooltip>
                )}
              {!hidePref && (
                <ButtonDropdown
                  className="gridPrefBtn"
                  isOpen={isTogglePreference}
                  toggle={this.togglePreference}
                >
                  <DropdownToggle
                    className="btn-outline-secondary headerToolbar-button"
                    caret
                  >
                    {mobileCheck ? <i className="fa fa-save" /> : "PREFERENCE"}{" "}
                    {!mobileCheck
                      ? selectedPreference &&
                      "( " +
                      util.trunString(selectedPreference.name, 10) +
                      " )"
                      : ""}{" "}
                  </DropdownToggle>
                  <DropdownMenu className={"dropdown-preference"}>
                    <DropdownItem
                      onClick={() =>
                        this.setState({
                          isToggleAddPreference: !isToggleAddPreference,
                          ismodify: false,
                        })
                      }
                    >
                      Add Preference
                    </DropdownItem>
                    <DropdownItem
                      onClick={() =>
                        this.setState({
                          isManagePreference: !isManagePreference,
                        })
                      }
                    >
                      Manage Preferences
                    </DropdownItem>
                    <Form>
                      {preferenceData.length > 0 &&
                        preferenceData.map((d, i) => {
                          let checked = d.checkDefault == "true";
                          return (
                            <FormGroup check>
                              {d.name && (
                                <Label>
                                  {defaultIndexPreference == i ? (
                                    <Input
                                      className="check-input"
                                      onChange={() => this.applyPreference(d)}
                                      checked={checked || false}
                                      type="checkbox"
                                    />
                                  ) : (
                                    <div style={{ width: "14px" }}></div>
                                  )}{" "}
                                  <DropdownItem
                                    onClick={() => this.applyPreference(d)}
                                  >
                                    {d.name}
                                  </DropdownItem>
                                </Label>
                              )}
                            </FormGroup>
                          );
                        })}
                    </Form>
                  </DropdownMenu>
                </ButtonDropdown>
              )}
              <Modal
                isOpen={isToggleAddPreference}
                className={"blackColor preference-modal"}
              >
                <ModalHeader
                  toggle={() =>
                    this.setState({
                      isToggleAddPreference: !isToggleAddPreference,
                      addForm: {},
                      errorForm: false,
                    })
                  }
                >
                  {ismodify ? "Edit" : "Add"} preference
                </ModalHeader>
                <ModalBody>
                  <Form>
                    <FormGroup row>
                      <Label htmlFor="name" sm={2}>
                        Name:
                      </Label>
                      <Col sm={10}>
                        <Input
                          type="text"
                          name="name"
                          value={addForm.name || ""}
                          id="name"
                          placeholder="Enter Name"
                          onChange={(e) => this.onChangeHandle(e)}
                        />
                        {errorForm && (
                          <i className={"red"}>please enter name</i>
                        )}
                      </Col>
                    </FormGroup>
                    <FormGroup row>
                      <Label htmlFor="description" sm={2}>
                        Description:
                      </Label>
                      <Col sm={10}>
                        <Input
                          type="text"
                          name="description"
                          value={addForm.description || ""}
                          id="description"
                          placeholder="Enter Description"
                          onChange={(e) => this.onChangeHandle(e)}
                        />
                      </Col>
                    </FormGroup>
                    <FormGroup row>
                      <Label htmlFor="checkDefault" sm={2}>
                        Default:
                      </Label>
                      <Col sm={10} className={"input-line-hight"}>
                        <Input
                          type="checkbox"
                          name="checkDefault"
                          id="default-checkbox"
                          checked={addForm.checkDefault || false}
                          onChange={(e) => this.onChangeHandle(e)}
                        />{" "}
                      </Col>
                    </FormGroup>
                  </Form>
                </ModalBody>
                <ModalFooter>
                  <Button
                    color="primary"
                    onClick={() => this.savePreferences()}
                  >
                    OK
                  </Button>{" "}
                  <Button
                    color="secondary"
                    onClick={() =>
                      this.setState({
                        isToggleAddPreference: !isToggleAddPreference,
                        addForm: {},
                        errorForm: false,
                      })
                    }
                  >
                    Cancel
                  </Button>
                </ModalFooter>
              </Modal>
              <Modal
                isOpen={isManagePreference}
                className={"blackColor preference-modal"}
              >
                <ModalHeader
                  toggle={() =>
                    this.setState({ isManagePreference: !isManagePreference })
                  }
                >
                  Manage preference
                </ModalHeader>
                <ModalBody>
                  <Table
                    columns={preferenceColumns}
                    dataSource={preferenceDataGrid}
                    className="grid-base-table"
                    responsive
                  />
                </ModalBody>
              </Modal>
              {customButton}
              <Tooltip placement="bottom" title={consts.PrintBtn}>
                {exportButton && (
                  <Button
                    outline
                    className="no-sales-header-button grid-button"
                    onClick={this.printDocument}
                  >
                    {""} <i className="fa fa-print" />
                  </Button>
                )}
              </Tooltip>
              <Tooltip placement="bottom" title={consts.ExportBtn}>
                {exportButton && (
                  <Button
                    outline
                    className="no-sales-header-button grid-button"
                    onClick={this.exportExcelRecord}
                  >
                    {""} <i className="fa fa-download" />
                  </Button>
                )}
              </Tooltip>
              {!hideSearch && !widths ? (
                <div className="px-2">
                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                    }}
                  >
                    <InputGroup className="header-search">
                      <Input
                        placeholder="Search"
                        value={val}
                        onChange={(evt) => this.onInputChange(evt)}
                      />
                      {/* <InputGroupAddon addonType="append">
                    <i className="fa fa-2x icon2-search-icon" />
                  </InputGroupAddon> */}
                    </InputGroup>
                  </form>
                </div>
              ) : null}

              {scaleSearchOptions || AccessControlFilter ? (
                <Col className="scaleOptionsGRID form-row mr-0">
                  {/* <div class="col"></div> */}
                  {AccessControlFilter && (
                    <>
                      <div class="col"></div>
                      <div class="col"></div>
                    </>
                  )}

                  <div className={"col col-sm-3"}>
                    <InputGroup
                      className="header-search"
                      style={{ display: "block" }}
                    >
                      <Select
                        class="form-control custom-select"
                        id="siteFilter"
                        value={siteSelected || ""}
                        placeholder="Site Name"
                        onChange={(site) => {
                          this.setState({ siteSelected: site, videoClicked: false }, () => {
                            this.validateScaleSearch();
                          });
                        }}
                        options={storeData}
                      />
                    </InputGroup>
                  </div>

                  <div class="col col-sm-2">
                    <DatePicker
                      selected={startDate}
                      onChange={this.startDateChange}
                      timeInputLabel="Time:"
                      dateFormat="MM/dd/yyyy h:mmaa"
                      showTimeInput
                      className="form-control"
                      placeholderText="Start Date"
                      minDate={moment(startDuration)}
                      maxDate={moment(endDuration)}
                      minTime
                    />
                  </div>

                  <div class="col col-sm-2">
                    <DatePicker
                      selected={endDate}
                      onChange={this.endDateChange}
                      timeInputLabel="Time:"
                      dateFormat="MM/dd/yyyy h:mmaa"
                      showTimeInput
                      className="form-control"
                      placeholderText="End Date"
                      minDate={moment(startDuration)}
                      maxDate={moment(endDuration)}
                    />
                  </div>

                  {scaleSearchOptions && (
                    <>
                      <div class="col col-sm-1.5">
                        <Input
                          placeholder="From Weight"
                          type="number"
                          style={{ height: "36px" }}
                          value={fromWeight}
                          onChange={(e) =>
                            this.setState({ fromWeight: e.target.value })
                          }
                        />
                      </div>

                      <div class="col col-sm-1.5">
                        <Input
                          placeholder="To Weight"
                          type="number"
                          style={{ height: "36px" }}
                          value={toWeight}
                          onChange={(e) =>
                            this.setState({ toWeight: e.target.value })
                          }
                        />
                      </div>

                      <div class="col col-sm-1.5" >
                        <Select
                          class="form-control custom-select"
                          style={{ height: "36px" }}
                          ref={this.selectVideofilter}
                          placeholder="VideoFilter"
                          options={videoData}
                          defaultValue={videoFilterdefault}
                          hideSelectedOptions={true}
                          onChange={(e) => this.setState({ videoFilterlabel: e.label, videoFiltervalue: e.value, videoFilterselected: true })}
                        />
                      </div>

                    </>
                  )}

                  <Button
                    type="secondary"
                    style={{ height: "93%" }}
                    className={AccessControlFilter ? "mr-1 ml-1" : ""}
                    onClick={() => {
                      this.validateScaleSearch();
                    }}
                  >
                    Apply
                  </Button>
                </Col>
              ) : null}
            </Col>
          </Row>
        }
        <br />
        {/* <div style={{height: videoClicked && 'calc(100vh - 150px)'}}> */}
        <div>
          <div
            className={
              ios && window.innerWidth > consts.MobileDeviceWidthCheck
                ? "print-table table-responsive-ios"
                : "print-table table-responsive table-border "
            }
            style={{
              width: videoClicked ? "50%" : "100%",
              float: "left",
              overflowY: "hidden",
              overflowX: "auto",
            }}
          >{ // NOTE - ant design table rendering
              <Table
                rowKey="uid"
                pagination={
                  isLocal ||
                    disablePagination ||
                    (this.props.dataProperty &&
                      this.props.dataProperty == "smartAcco" &&
                      this.props.hidePagination)
                    ? false
                    : pagination
                }
                responsive
                showHeader={hideHeader ? false : true}
                className={"grid-base-table " + AutoHeightClass1}
                columns={gridColumnsData}
                dataSource={
                  this.props.dataProperty &&
                    this.props.dataProperty != "smartAcco"
                    ? (beforeRender ? beforeRender(gridData) : gridData) || []
                    : this.props.smartData
                }
                bordered={true}
                size={"small"}
                rowSelection={this.props.rowSelection || null}
                onChange={this.onChange}
                // loading={isLocal ? false : isLoading}
                current={2}
                scroll={scroll}
              />
            }
          </div>
          {videoClicked ? (
            <div>
              <LoadingDialog isOpen={videoLoading} />
              <div
                style={{
                  width: "50%",
                  float: "left",
                  margin: "auto",
                  overflowY: "hidden",
                }}
              >
                {this.renderVideoClipComponent(gridColumnsData)}
              </div>
            </div>
          ) : null}
        </div>
      </Fragment>
    );
  }
}

function mapStateToProps(state, ownProps) {
  return {
    [ownProps.dataProperty]: state[ownProps.dataProperty],
    reloadGrid: state.reloadGrid,
    searchFilter: state.searchFilter,
    storeChange: state.storeChange,
    storesData: state.storesData,
    userPreference: state.getUserPreference,
    savePreference: state.saveUserPreference,
    deleteData: state.deletePreference,
    gridSearchParam: state.getGridSearch,
    localPaging: state.localPaging,
    pageSize: state.pageSize,
    // video clip functionality #3
    getReceiptClip: state.getReceiptClip,
    getReceipt: state.getReceipt,
    clientData: state.clientData,
  };
}

export default connect(mapStateToProps)(GridView);