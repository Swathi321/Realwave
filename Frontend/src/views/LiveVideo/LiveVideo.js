import React, { Component } from 'react';
import { Col, Row, Navbar, Card, CardBody, Modal, ModalHeader, ModalBody, ModalFooter, Button } from 'reactstrap';
import VideoPlayer from '../../component/VideoPlayer';
import { connect } from 'react-redux';
import { exitFullScreen, fullScreenVideo, storeChange, timelinePlayer, liveVideoClick, selectedCameraData as updateCameraData } from './../../redux/actions';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import { preferenceData, storesData, deleteCamPreference } from '../../redux/actions/httpRequest';
import swal from 'sweetalert';
import utils from '../../Util/Util';
import { arrayMove, SortableElement, SortableContainer } from 'react-sortable-hoc';
import { Button as AntButton, Tooltip } from 'antd';
import Select from 'react-select';
import consts from '../../Util/consts';
import { saveActivityLog } from './../../redux/actions/httpRequest';
import { Button as FloatButton, Container } from 'react-floating-action-button';
import LoadingDialog from './../../component/LoadingDialog';
import Slider from "../../component/Slider";
import { ReactComponent as GoLive } from '../../assets/img/Newicon/goto live.svg';
import { ReactComponent as SyncVideoIcon } from '../../assets/img/Newicon/sync video windows.svg';

const cameraScreenMinHeight = 200, headerFooterHeight = 245, fullScreenHeaderFooterHeight = 90;

const gridStyles = {
  gridTemplateColumns: 'repeat(4, 1fr)',
  gridGap: '16px',
  color: "#000 !important",
  width: "101.80%"
};

const GridItem = SortableElement(({ value, height, className }) => {
  let minHeight = (height < cameraScreenMinHeight ? cameraScreenMinHeight : height) + "px";

  return (
    <div style={{ minHeight: minHeight }} className={className}>
      {value}
    </div>
  );
});

const Grid = SortableContainer(({ items, gridItemProvider }) =>
  <Row className={'site-video site-video-padding card-body cam-layout-body'} style={gridStyles}>
    {items.map(gridItemProvider)}
  </Row>
);

class LiveVideo extends Component {
  constructor(props) {
    super(props)
    this.state = {
      camLayoutCal: { layout: '2x2', col: '6', row: 2 },
      cameraData: [],
      cameraDataList: [],
      isFull: false,
      timeLine: {
        isOpen: false,
        camId: '',
        storeId: '',
        isHeatMapCamera: false
      },
      filterData: [],
      isOpen: false,
      preference: {},
      configuration: [],
      stretchList: [],
      selectedTag: null,
      refreshing: false,
      renderCamAgain: false,
      settings: {
        columns: 2,
        rows: 2
      },
      isAIStream: false
    };
    this.windowOpen = null;
    this.onSelect = this.onSelect.bind(this);
    this.goFull = this.goFull.bind(this);
    this.onChangeFullScreen = this.onChangeFullScreen.bind(this);
    this.fullScreenState = this.fullScreenState.bind(this);
    this.exit = this.exit.bind(this);
    this.onActionVideo = this.onActionVideo.bind(this);
    this.timelineAction = this.timelineAction.bind(this);
    this.onClickFab = this.onClickFab.bind(this);
    this.onGoSyncPlayback = this.onGoSyncPlayback.bind(this);
    this.onClearPreference = this.onClearPreference.bind(this);
  }

  loadUserPreference = () => {
    this.props.dispatch(preferenceData.request({ action: 'load' }));
  }

  onClickFab(camId) {
    this.props.dispatch(timelinePlayer({
      isPlay: false,
    }))

    if (camId) {
      let wrapper = document.getElementById(`VIDEO_CONTAINER${camId}`);
      if (wrapper) {
        //wrapper = wrapper[0];
        wrapper.style.display = "block";
      }
    }
  }

  componentDidMount() {
    this.loadUserPreference();
    // document.addEventListener("scroll", () => {
    // 	let players = document.getElementsByTagName('video');
    // 	if (players && players.length > 1) {
    // 		players = Array.from(players);
    // 		players.forEach(player => {
    // 			let camId = player.id.split('LIVE_VIDEO_PLAYER_')[1];
    // 			camId = camId.split('_')[0];
    // 			let state = utils.containerVisibility(`VIDEO_CONTAINER${camId}`) ? 'play' : 'pause';
    // 			if (player[state] && state === 'play') {
    // 				player[state]().then(() => {
    // 					// Automatic playback started!
    // 					// Show playing UI.
    // 				}).catch(error => {
    // 					console.log("streaming not ready...");
    // 				});
    // 			} else {
    // 				player[state]();
    // 			}
    // 			console.log(`${camId}: ${state}`);
    // 		});
    // 	}
    // });
  }

  componentWillUnmount() {
    document.removeEventListener("scroll", null);
  }

  // fake data generator
  getItems = (options) => {
    let data = [];
    options.map(option => {
      if (option._id && option.name) {
        data.push(
          {
            value: option._id,
            label: option.storeId.name + " / " + option.name
          });
      }
    });
    return data;
  }

  // a little function to help us with reordering the result
  reorder = (list, startIndex, endIndex) => {
    const result = Array.from(list);
    const [removed] = result.splice(startIndex, 1);
    result.splice(endIndex, 0, removed);
    return result;
  };

  setAIStreamOff = () => {
    this.setState({ isAIStream: false });
  }

  getItemStyle = (isDragging, draggableStyle) => ({
    // some basic styles to make the items look a bit nicer
    userSelect: 'none',
    padding: "10px 15px",
    margin: "0 0 5px 0",
    borderRadius: "4px",

    // change background colour if dragging
    background: isDragging ? '#20a8d8' : 'grey',

    // styles we need to apply on draggables
    ...draggableStyle,
  });

  getGridItemStyle = (isDragging, draggableStyle, height) => ({
    // some basic styles to make the items look a bit nicer
    userSelect: 'none',
    minHeight: (height < cameraScreenMinHeight ? cameraScreenMinHeight : height) + "px",

    // styles we need to apply on draggables
    ...draggableStyle,
  });

  getListStyle = (isDraggingOver) => ({
    // background: 'lightgrey',
    padding: 10,
    minHeight: "60vh",
    maxHeight: "60vh",
    overflow: "auto",
    color: '#fff'
  });

  getDataSourceKey = (isRequestFromGrid) => {
    return isRequestFromGrid ? "cameraData" : "cameraDataList";
  }

  clearImageSourceAndStopRequest(oldIndex, newIndex, startStopImageRequest) {
    this.setState({ stopImageRequest: startStopImageRequest });
    let cameraData = this.state.cameraData;
    if (cameraData && cameraData[oldIndex] && cameraData[newIndex]) {
      let oldComponent = document.getElementById(cameraData[oldIndex]._id + "_Image");
      let newComponent = document.getElementById(cameraData[newIndex]._id + "_Image");
      if (oldComponent && newComponent && oldComponent != newComponent) {
        oldComponent.src = "#";
        newComponent.src = "#";
      }
    }

  }

  onSortOver = ({ index, oldIndex, newIndex, collection }, e) => {
    this.clearImageSourceAndStopRequest(oldIndex, newIndex, true);

  }


  onDragEnd = (result, isRequestFromGrid) => {
    // dropped outside the list
    if (!result.destination) {
      return;
    }
    let oldIndex = result.source.index,
      newIndex = result.destination.index;
    // sort records.
    this.onSortEnd({ oldIndex, newIndex }, isRequestFromGrid);
  }

  onSortEnd = ({ oldIndex, newIndex }, isRequestFromGrid) => {
    this.clearImageSourceAndStopRequest(oldIndex, newIndex, false);
    let dataKey = this.getDataSourceKey(isRequestFromGrid),
      orderedItems = arrayMove(this.state[dataKey], oldIndex, newIndex),
      configuration = this.getConfiguration(orderedItems),
      stateObject = { configuration: configuration };

    stateObject[dataKey] = orderedItems;
    this.state.stopImageRequest = false;
    this.setState(stateObject);
  };

  getLayoutStyle(layout) {
    let toReturn = {};
    let { settings } = this.state;

    switch (layout) {
      case "1x1":
        toReturn = { layout: layout, col: '12', row: 1 };
        settings.columns = 1;
        settings.rows = 1;
        break;

      case "2x2":
        toReturn = { layout: layout, col: '6', row: 2 };
        settings.columns = 2;
        settings.rows = 2;
        break;

      case "3x3":
        toReturn = { layout: layout, col: '4', row: 3 };
        settings.columns = 3;
        settings.rows = 3;
        break;

      case "2x3":
        toReturn = { layout: layout, col: '4', row: 2 };
        settings.columns = 3;
        settings.rows = 2;
        break;

      case "3x4":
        toReturn = { layout: layout, col: '3', row: 3 };
        settings.columns = 4;
        settings.rows = 3;
        break;
      default:
        toReturn = { layout: '2x2', col: '6', row: 2 };
        settings.columns = 2;
        settings.rows = 2;
        break;
    }
    this.setState({
      settings: settings
    });
    return toReturn;
  }


  getNextPrevConfig = (currentIndex, isNext) => {
    let toReturn = null;
    const { cameraData, filterData } = this.state;
    const camList = utils.getClone(filterData && filterData.length > 0 ? filterData : cameraData);
    if (camList.length === 0) {
      return toReturn;
    }
    const len = camList.length - 1;
    let newIndex = isNext ? currentIndex + 1 : currentIndex - 1;
    //In case of first and last config we need rotation
    newIndex = newIndex > len ? 0 : newIndex < 0 ? len : newIndex;
    return { config: camList[newIndex], index: newIndex };
  }

  getCameraView = (item, index, options) => {
    const { camLayoutCal, isFull, refreshing } = this.state;
    let minHeight = (window.innerHeight < 415),
      rowValue = null,
      key = ("key-" + index),
      winHeight = (window.innerHeight - headerFooterHeight), height = 0, camHeight = '';
    switch (camLayoutCal.row) {
      case 1:
        rowValue = item.isHeatMapCamera ? "site-video-row-one layout-row-one" : "site-video-row-one";
        height = winHeight;
        if (isFull) {
          camHeight = '77.8em';
        }

        break;
      case 2:
        rowValue = item.isHeatMapCamera ? (camLayoutCal.col == 3 || camLayoutCal.col == 6 ? "site-video-row-two layout-col-three" : "site-video-row-two layout-row-two") : "site-video-row-two";
        height = (winHeight / 2) - 11;
        if (isFull) {
          camHeight = '38.2em';
        }

        break;
      case 3:
        rowValue = item.isHeatMapCamera ? (camLayoutCal.col == 4 ? "site-video-row-two layout-col-four" : "site-video-row-three layout-row-three") : "site-video-row-three";
        let fullNewHeight = (window.innerHeight - fullScreenHeaderFooterHeight);
        height = (isFull ? fullNewHeight : winHeight) / 3;
        camHeight = '25.6em';
        break;
      default:
        break;
    }
    let fullScreenVideo = this.props.fullScreenVideo;
    if (fullScreenVideo && fullScreenVideo.value != null) {
      if (fullScreenVideo.value !== index) {
        return null;
      }
    }
    camLayoutCal.col = minHeight ? 6 : camLayoutCal.col;
    rowValue = minHeight ? "site-video-row-one" : rowValue;
    let className = ("col-sm-12 col-md-12 " + rowValue);

    let minHeightComp = (height < cameraScreenMinHeight ? cameraScreenMinHeight : height) + "px";
    let styleObj = { minHeight: minHeightComp };
    if (isFull)
      Object.assign(styleObj, { height: camHeight });

    let muted = camLayoutCal.layout !== "1x1";
    return (
      <div style={styleObj} className={className}>
        <VideoPlayer muted={muted} onClickFab={this.onClickFab} stopImageRequest={this.state.stopImageRequest} onAction={this.onActionVideo} isStretchable={true} layout={camLayoutCal} config={item}
          isBlank={!item || !item._id || item.isBlank} url={null} videoIndex={index} getNextPrevConfig={this.getNextPrevConfig} scope={this} refreshing={refreshing} />
      </div>
    );
  }

  componentWillReceiveProps(nextProps) {

    if ((nextProps['storesData'] && nextProps['storesData'] !== this.props['storesData'])) {
      let data = nextProps['storesData'].stores;
      let fetching = nextProps['storesData'].isFetching;
      if (!fetching && data) {
        let storeChangeValues = this.props.storeChange;
        this.setState({ storeData: data.stores, cameraData: data.data });
        this.props.dispatch(storeChange({ data: storeChangeValues && storeChangeValues.data && storeChangeValues.data.length > 0 ? storeChangeValues.data : data.data }));
      }
    }
    if (nextProps.storeChange && nextProps.storeChange != this.props.storeChange && nextProps.storeChange.data) {
      if (nextProps.storeChange.data.length > 0) {
        let camData = nextProps.storeChange.data,
          length = camData.length,
          storeCameraData = [];
        let iOS = window.navigator.userAgent.match(/iPad|iPhone|iPod/);
        if (nextProps.storeChange.selectedStore && nextProps.storeChange.selectedStore.length === 0) {
          this.state.cameraData = [];
        }
        if (nextProps.storeChange.selectedStore && nextProps.storeChange.selectedStore.length > 0 && length > 0) {
          if (nextProps.storeChange.selectedStore[0].label != 'All') {
            nextProps.storeChange.selectedStore.forEach(function (item) {
              storeCameraData = storeCameraData.concat(camData.filter((cam) => cam.storeId._id == item.value));
            })
            if (storeCameraData.length > 0) {
              camData = storeCameraData;
              length = camData.length;
            }
          }
          if (camData && Array.isArray(camData)) {
            let { preference } = this.state,
              cameraData = utils.getClone(camData);

            let sortedCameraData = this.getSortedCameraData(preference.configuration, cameraData);
            this.state.cameraData = sortedCameraData;
            this.state.cameraDataList = sortedCameraData;
            this.isFilterChange = true;

          }
        }
      }
    }
    else if (nextProps.storeChange && nextProps.storeChange == this.props.storeChange) {
      this.isFilterChange = false;
    }
    let { data, isFetching, error } = nextProps.preferenceData;
    let { isFull, preference } = this.state;
    if (!isFetching && data && data.data && JSON.stringify(data.data) !== JSON.stringify(preference)) {
      if (error || data && data.error) {
        swal({ title: "Error", text: error || data.error, icon: "error", });
        return;
      }
      if (nextProps.preferenceData.data && nextProps.preferenceData.data.message) {
        swal({
          title: utils.getAlertBoxTitle(nextProps.preferenceData.data.success),
          text: nextProps.preferenceData.data.message,
          icon: utils.getAlertBoxIcon(nextProps.preferenceData.data.success)
        });
        this.loadUserPreference();
        return;
      }
      let preferenceInfo = data.data;
      if (preferenceInfo && !isFull) {
        let { configuration, stretchList, camLayoutCal } = preferenceInfo;
        let sortedCameraData = this.getSortedCameraData(configuration);
        this.setState({
          cameraData: sortedCameraData,
          cameraDataList: sortedCameraData,
          preference: preferenceInfo,
          configuration: configuration,
          stretchList: stretchList || []
        });
        camLayoutCal && this.onSelect(camLayoutCal.layout);
      }
      else if (isFull) {
        this.onSelect(this.state.camLayoutCal.layout);
      }
    }
  }

  getSortedCameraData = (configuration, cameraData) => {
    if (!cameraData) {
      cameraData = this.state.cameraData;
    }
    let returnIndex = 0;

    if (Array.isArray(cameraData) && cameraData.length > 0 && configuration && configuration.length > 0) {
      let sortData = cameraData.sort(function (a, b) {
        let aIndex = configuration.findIndex(config => {
          return config.id == a._id;
        });
        let bIndex = configuration.findIndex(config => {
          return config.id == b._id;
        });

        if (aIndex != -1 && bIndex != -1) {
          if (aIndex < bIndex) {
            returnIndex = -1;
          }
          if (aIndex > bIndex) {
            returnIndex = 1;
          }
        }
        else {
          if (bIndex != -1) {
            returnIndex = 1;
          } else if (aIndex != -1) {
            returnIndex = -1;
          } else {
            returnIndex = 0;
          }
        }
        return returnIndex;
      });
      cameraData = sortData;
    }
    return cameraData;
  }

  componentWillMount() {
    const { selectedStore } = this.props.storeChange;
    let selectedStoreData = selectedStore;
    if (selectedStore.length == 1 && selectedStore[0].label == 'All') {
      selectedStoreData = JSON.parse(localStorage.getItem('SelectedStore'));
    }
    this.props.dispatch(storesData.request({ stores: [] }));
    this.props.dispatch(storeChange({ selectedStore: selectedStoreData }));
  }

  onSelect = (layoutView, isAIStream) => {
    let camLayoutCal = this.getLayoutStyle(layoutView);
    const { storeChange } = this.props;
    const { data } = storeChange || [];
    let cameraData = [];

    if (data) {
      if (data && Array.isArray(data)) {
        data.forEach(item => {
          item.isBlank = false;
          cameraData.push(item);
        });
      }
      let updateStateData = { camLayoutCal: camLayoutCal };
      if (isAIStream != null) {
        updateStateData.isAIStream = isAIStream;
      }
      this.setState(updateStateData);
    }
  }

  exit() {
    this.props.dispatch(exitFullScreen(false));
  }

  onActionVideo(data) {
    let wrapper = document.getElementById(`VIDEO_CONTAINER${data.camId}`);
    if (wrapper) {
      wrapper.style.display = data.isPlay ? "block" : "none";
    }
    this.props.dispatch(timelinePlayer({
      isPlay: true,
      camId: data.camId,
      storeId: data.storeId,
      connected: data.connected,
      isHeatMapCamera: data.isHeatMapCamera
    }));
  }

  goFull = () => {
    const { isFull } = this.state;
    let sidebar = document.getElementsByClassName("sidebar");
    let footer = document.getElementsByClassName("app-footer");
    if(!isFull) {
      if(footer && footer.length > 0) {
        footer[0].style.display = "none";
      }
      if(sidebar && sidebar.length > 0) {
        sidebar[0].style.display = "none";
      }
    }
    else {
      if(footer && footer.length > 0) {
        footer[0].style.display = "flex";
      }
      if(sidebar && sidebar.length > 0) {
        sidebar[0].style.display = "flex";
      }
    }
    this.setState({ isFull: !isFull }, () => {
      let isExitFullScreen = !isFull;
      let details = isExitFullScreen == true ? ' - Exit Full Screen' : ' - Full Screen';
      let loggedData = utils.getScreenDetails(utils.getLoggedUser(), this.props.location, details);
      this.props.dispatch(saveActivityLog.request({ action: 'save', data: loggedData }));
      if (isExitFullScreen) {
        this.setState({
          timeLine: {
            isOpen: false,
            camId: '',
            storeId: '',
            isHeatMapCamera: false
          }
        });
      }
    });
  }

  onChangeFullScreen(full) {
    this.setState({ isFull: full });
  }

  fullScreenState() {
    this.setState({
      videoStyle: {
        width: '100%', height: '100%'
      }
    });
  }

  notAvailableCell(cameraData, layout) {
    let available = cameraData.length;
    let videoCount = 6;

    switch (layout) {
      case "1x1":
        videoCount = 1;
        break;

      case "2x2":
        videoCount = 4;
        break;

      case "3x3":
        videoCount = 9;
        break;

      case "2x3":
        videoCount = 6;
        break;

      case "3x4":
        videoCount = 12;
        break;
      default:
        break;
    }

    if (available == 0) return videoCount;
    let notAvailable = available % videoCount;
    return notAvailable == 0 ? notAvailable : (videoCount - notAvailable);
  }

  handleCameraList = (value) => {
    let { storeChange } = this.props,
      objState = { isOpen: value },
      { preference } = this.state;

    if (storeChange && storeChange.data && preference && preference.configuration) {
      let camData = storeChange.selectedStore.length > 0 && storeChange.selectedStore[0].label != 'All' ? [] : storeChange.data;
      if (camData.length == 0) {
        storeChange.selectedStore.forEach(function (item) {
          let filteredCameraData = storeChange.data.filter(function (e) { return e.storeId._id === item.value });
          filteredCameraData.forEach(function (data) {
            camData.push(data);
          });
        })
      }
      let sortedCameraData = this.getSortedCameraData(preference.configuration, camData);
      objState.cameraDataList = sortedCameraData;
    }
    this.setState(objState);
  }

  onSortMove() {
    this.setState({ stopImageRequest: true });
  }

  getConfiguration = (records) => {
    let configurations = [];

    if (records && records.length > 0) {
      records.forEach((item, index) => {
        if (item && item._id) {
          let configuration = { id: item._id, index };
          configurations.push(configuration);
        }
      });
    }
    return configurations;
  }

  onSavePreference = (isRequestFromGrid) => {
    let { preference, camLayoutCal } = this.state;
    if (!preference) {
      preference = {};
    }
    let dataKey = this.getDataSourceKey(isRequestFromGrid),
      configurationData = this.state[dataKey];
    preference.configuration = this.getConfiguration(configurationData);
    preference.camLayoutCal = camLayoutCal;
    let loggedData = utils.getScreenDetails(utils.getLoggedUser(), this.props.location, consts.ReorderList);
    this.props.dispatch(saveActivityLog.request({ action: 'save', data: loggedData }));
    this.props.dispatch(preferenceData.request({ action: 'save', data: preference }, preference._id));
    this.handleCameraList(false);
  }
  onClearPreference = (isRequestFromGrid) => {
    let dataKey = this.getDataSourceKey(isRequestFromGrid);
    swal({
      title: "Are you sure?",
      text: `Do you really want to clear Preference for this site? This process can not be undone.`,
      icon: "warning",
      buttons: true,
      dangerMode: true,
    }).then(function (willDelete) {
      let { preference } = this.state;
      if (preference && Object.keys(preference).length > 0 && preference._id) {
        let loggedData = utils.getScreenDetails(utils.getLoggedUser(), this.props.location, consts.ReorderList);
        this.props.dispatch(saveActivityLog.request({ action: 'save', data: loggedData }));
        this.props.dispatch(deleteCamPreference.request({ action: 'delete', id: preference._id }));
        this.setState({
          preference: {}
        }, () => {
          this.props.dispatch(preferenceData.request({ action: 'load' }));
          this.onGoLive();
        });
      }
    }.bind(this));
  }
  onChangeTag(selectedValue) {
    let storeChangeData = this.props.storeChange;
    let cameraData = storeChangeData && storeChangeData.cameraData ? storeChangeData.cameraData : this.state.cameraData;
    let camData = [];
    let selectedMultipleTagsLength = selectedValue.length;
    if (selectedValue && selectedMultipleTagsLength > 0) {
      let allStores = this.props.storesData.data.stores;
      let storeIds = [];
      allStores.forEach(function (data) {
        let allTags = data.tags;
        if (allTags) {
          for (var i = 0; i < selectedMultipleTagsLength; i++) {
            let validtag = allTags.filter(function (data) { return data == selectedValue[i].value });
            if (validtag.length > 0) {
              let filteredCameraData = cameraData.filter(function (e) { return e.storeId._id === data._id });
              filteredCameraData.forEach(function (data) {
                camData.push(data);
              });
              break;
            }
          }
        }
      });
    }
    this.setState({ filterData: camData, selectedTag: selectedValue, cameraData: cameraData });
    this.props.dispatch(preferenceData.request({ action: 'load' }));
  }

  timelineAction(action) {
    switch (action) {
      case "HUB_NOT_CONNECTED":
        this.goFull();
        break;

      default:
        break;
    }
  }

  onGoLive = () => {
    this.props.dispatch(liveVideoClick(false));
    this.setState({ refreshing: true }, () => {
      setTimeout(() => {
        this.props.dispatch(liveVideoClick(true));
        this.setState({ refreshing: false, isAIStream: false });
      }, 3000);
    })
  }

  onGoSyncPlayback = () => {
    const { cameraData } = this.props.selectedCameraData;
    let ids = [], storeId = 0;
    cameraData.forEach((item, index) => {
      ids.push(item._id);
      storeId = item.storeId._id;
    })
    if (ids.length < 2) {
      swal({ title: "Info", text: "Please select two or more cameras for sync playback", icon: "info" });
      return;
    }
    const isSameStoreId = cameraData.length > 0 ? cameraData.find((el) => { return el.storeId._id != storeId }) : false;
    if (isSameStoreId) {
      swal(`Alert`, `You can select same Store's Camera(s)`, 'warning');
      return false;
    }
    let url = `/#/timelineWindow/${storeId}/` + (ids.length > 0 ? `${ids.join(',')}` : '');
    var params = [
      'height=' + window.screen.height,
      'width=' + window.screen.width,
      'fullscreen=yes' // only works in IE, but here for completeness
    ].join(',');
    if (this.windowOpen != null) {
      this.windowOpen.close();
    }
    this.windowOpen = window.open(url, 'Playback', params);
    this.props.dispatch(updateCameraData({ seekProp: null, cameraData: [] }));

    let { storesData } = this.props;
    let { data } = storesData;
    let getCheckedCamera = data && data.data;
    if (getCheckedCamera && getCheckedCamera.length > 0) {
      for (let i = 0; i < getCheckedCamera.length; i++) {
        getCheckedCamera[i].checked = false;
      }
    }
  }

  getScreenLayout() {
    const { isFull, refreshing, camLayoutCal, timeLine, isOpen, cameraData, cameraDataList, selectedTag, filterData, settings } = this.state;

    let iOS = window.navigator.userAgent.match(/iPad|iPhone|iPod/);
    let tagsCombo = [];
    let tags = [];
    let storesData = this.props.storesData;
    if (storesData && storesData.data && storesData.data.stores) {
      storesData.data.stores.forEach(function (data) {
        let currentStoreTags = data.tags;
        if (currentStoreTags && currentStoreTags.length > 0) {
          currentStoreTags.forEach(function (data) {
            tags.push(data);
          });
        }
      });

      if (tags.length > 0) {
        tags = tags.sort();
        tags = tags.filter(function (item, pos, self) {
          return self.indexOf(item) == pos;
        });
        tags.forEach(function (data) {
          tagsCombo.push({ value: data, label: data });
        });
      }
    }

    let { onSelect } = this,
      cameraDataClone = utils.getClone(filterData && filterData.length > 0 ? filterData : cameraData),
      notAvailableCell = this.notAvailableCell(cameraDataClone, camLayoutCal.layout); // Get number of required grid items.

    // Create required camera items to fill the gris screen.
    if (notAvailableCell > 0) {
      for (let index = 0; index < notAvailableCell; index++) {
        cameraDataClone.push({ isBlank: true });
      }
    }
    let cameraList = cameraDataClone.map((ele, index) => {
      return <div key={ele._id} className={'site-video site-video-padding card-body cam-layout-body'}>
        {this.getCameraView(ele, index)}
      </div>
    })

    return (
      <Col xs={12} sm={12} md={12} className="content">
        <Card>
          <CardBody>
            {isFull && <Container>
              <FloatButton
                tooltip={consts.Back}
                icon="fa fa-close"
                onClick={() => this.goFull()} />
            </Container>}
            <Row className="layout-hide">
              <Col>
                {!isFull && <ul className="full-screen-button">
                  {!timeLine.isOpen && <li>
                    <Navbar color="light" light expand="md">
                      <ul className="nav video-control-wrapper" >
                        <React.Fragment>
                          <li className="nav-item">
                            <div className="site-layout-style layoutText d-md-none d-lg-block" >Layout:</div>
                          </li>
                          <li title="1x1" className="nav-item layout-icon " onClick={() => onSelect("1x1", false)}>
                            <div className="site-video-layout cursor kpi-text"><i className="fa fa-square fa-2x " aria-hidden="true"></i></div>
                            <div className="headerDivider"></div>
                          </li>
                          <li title="2x2" className="nav-item layout-icon" onClick={() => onSelect("2x2", false)} >
                            <div className="site-video-layout cursor kpi-text"><i className="fa fa-th-large fa-2x" aria-hidden="true"></i> </div>
                            {!iOS ? <div className="headerDivider"></div> : null}
                          </li>
                          {!iOS ? <li title="2x3" className="nav-item layout-icon" onClick={() => onSelect("2x3", false)}>
                            <div className="site-video-layout cursor kpi-text"><i className="fa fa-2x layoutVideoIcon icon2-b3Nu9I7nJp" aria-hidden="true"></i> </div>
                            <div className="headerDivider"></div>
                          </li> : null}
                          {!iOS ? <li title="3x3" className="nav-item layout-icon" onClick={() => onSelect("3x3", false)} >
                            <div className="site-video-layout cursor kpi-text"> <i className="fa fa-th fa-2x" aria-hidden="true"></i> </div>
                            <div className="headerDivider"></div>
                          </li> : null}
                          {!iOS ? <li title="3x4" className="nav-item layout-icon" onClick={() => onSelect("3x4", false)}>
                            <div className="site-video-layout cursor kpi-text"> <i className="fa fa-2x layoutVideoIcon icon2-whb2rPE9JE " aria-hidden="true"></i> </div>
                            <div className="headerDivider"></div>
                          </li> : null}

                          <li title="Go Live!" className="nav-item layout-icon" onClick={this.onGoLive}>
                            <div className="site-video-layout cursor kpi-text">
                              <GoLive fill={utils.getThemeBasedColor()} style={{ width: '4em', height: 'inherit' }} className="kpi-text" />
                            </div>
                            <div className="headerDivider"></div>
                          </li>

                          <li title="Sync Playback" className="nav-item layout-icon" onClick={this.onGoSyncPlayback}>
                            <div className="site-video-layout cursor kpi-text">
                              <SyncVideoIcon fill={utils.getThemeBasedColor()} style={{ width: '2em', height: 'inherit' }} className="kpi-text" />
                            </div>
                            <div className="headerDivider"></div>
                          </li>
                        </React.Fragment>
                      </ul>
                    </Navbar>
                  </li>}
                  <li className={!isFull ? 'live-video-full float-right' : 'live-video-none float-right'}>
                    <li className="tagDropDown">
                      <Select
                        isClearable={true}
                        isMulti={true}
                        onChange={(val) => this.onChangeTag(val)}
                        required={true}
                        options={tagsCombo}
                        value={selectedTag}
                        placeholder="Select Tag"
                      />
                    </li>
                    <div className="live-right-button">
                      <Tooltip placement="bottom" title={consts.Reorder}>
                        <AntButton className="ml-3 dashboard-button " shape="circle" icon="bars" ghost onClick={() => this.handleCameraList(true)} />
                      </Tooltip>
                      <Tooltip placement="bottom" title={consts.Save}>
                        <AntButton className="ml-3 dashboard-button " shape="circle" icon="save" ghost onClick={() => this.onSavePreference(true)} />
                      </Tooltip>
                      <Tooltip placement="bottom" title={consts.RemovePrefrence}>
                        <AntButton className="ml-3 dashboard-button " shape="circle" icon="delete" ghost onClick={() => this.onClearPreference(true)} />
                      </Tooltip>
                    </div>
                  </li>
                  <Navbar expand="md ml-auto">
                    <ul className={timeLine.isOpen && "timeline-Player-tools"}>
                      <li className="text-center" onClick={() => this.goFull()}>
                        <i title={isFull ? "Exit Full Screen" : "Full Screen"} className={"layoutText cursor fa " + (isFull ? "fa-compress" : "icon2-full_screen-icon")} />
                      </li>
                    </ul>
                  </Navbar>
                </ul>}
                <Modal isOpen={isOpen} className={"popup-camera-list dashboard-widget"} style={{ maxWidth: 200 }} >
                  <ModalHeader className={"widgetHeaderColor"} toggle={() => this.setState({ isOpen: false })}>
                    Reorder
									</ModalHeader>
                  <ModalBody className="reorderBody">
                    {cameraDataList && cameraDataList.length > 0 ?
                      <DragDropContext onDragEnd={(result) => this.onDragEnd(result, false)}>
                        <Droppable droppableId="droppable">
                          {(provided, snapshot) => (
                            <div className="reorderBody" ref={provided.innerRef} style={this.getListStyle(snapshot.isDraggingOver)}>
                              {cameraDataList.map((item, index) => {
                                let key = "key-" + index;
                                return (
                                  <Draggable key={key} draggableId={key} index={index}>
                                    {(provided, snapshot) => (
                                      <div
                                        className={snapshot.isDragging ? 'dragging' : 'notDragging'}
                                        ref={provided.innerRef}
                                        {...provided.draggableProps}
                                        {...provided.dragHandleProps}
                                        style={this.getItemStyle(
                                          snapshot.isDragging,
                                          provided.draggableProps.style
                                        )}
                                      >
                                        {item.storeId && item.storeId.name && item.name ? (item.storeId.name + " / " + item.name) : "Blank"}
                                      </div>
                                    )}
                                  </Draggable>
                                );
                              })}
                              {provided.placeholder}
                            </div>
                          )}
                        </Droppable>
                      </DragDropContext>
                      : null}
                  </ModalBody>
                  <ModalFooter className="widgetHeaderColor">
                    <Button onClick={() => this.onSavePreference(false)} className="ml-3"><i className="fa fa-check" aria-hidden="true"></i> Apply</Button>
                    <Button onClick={() => this.handleCameraList(false)} className="ml-3"><i className="fa fa-close" aria-hidden="true"></i> Cancel</Button>
                  </ModalFooter>
                </Modal>
              </Col>
            </Row>
            {/* {<Slider ref="SliderComp" key={cameraDataClone.map((obj) => obj._id).join().substring(0, 100)} {...settings} camLayout={this.state.settings} scope={this} navStatus={localStorage.getItem("navInfo")} extraInfo={cameraDataClone.map((obj) => obj._id)}> */}
            {<Slider ref="SliderComp" key={cameraDataClone.map((obj) => obj._id).join()} {...settings} camLayout={this.state.settings} scope={this} navStatus={localStorage.getItem("navInfo")} extraInfo={cameraDataClone.map((obj) => obj._id)}>
              {cameraList}
            </Slider>}
          </CardBody>
        </Card>
      </Col>
    );
  }

  render() {
    const { isFull, refreshing } = this.state;
    const camLayout = this.getScreenLayout();
    return (
      <>
        <LoadingDialog isOpen={refreshing} />
        <Row className="live-video-screen">
          {isFull ? <div className='video-fullscreen-modal'>{camLayout}</div> : camLayout}
        </Row>
      </>
    );
  }
}

function mapStateToProps(state, ownProps) {
  return {
    storeChange: state.storeChange,
    preferenceData: state.preferenceData,
    exitFullScreen: state.exitFullScreen,
    storesData: state.storesData,
    fullScreenVideo: state.fullScreenVideo,
    cameraData: state.cameraData,
    liveVideoClick: state.liveVideoClick,
    selectedCameraData: state.selectedCameraData
  };
}

var LiveVideoModule = connect(mapStateToProps)(LiveVideo);
export default LiveVideoModule;