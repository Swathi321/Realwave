import { actionType } from '../actions';
import Util from '../../Util/Util';
const initialState = {
  themeInitialState: {
    className: 'theme-dark',
    desktopLogo: 'logo.png',
    mobileLogo: 'logo.png'
  },
  timelinePlayerInitialState: {
    isPlay: false,
    camId: '',
    storeId: '',
    connected: false,
    isHeatMapCamera: false
  },
  modalInitialState: {
    isModalOpen: false,
    isModalTimelinePlayer: true,
    startDate: '',
    endDate: ''
  },
  isSameWindow: {
    isSame: false
  },
  selectedCameraData: {
    isEnablePlayback: false,
    cameraData: [],
    seekProp: null
  },
  roleIdData: {
    roleIdData: []
  },
  createRole: {
    createRole: {}
  },
  updateRole: {
    updateRole: {}
  },
  syncplaybackState: {
    isPaused: false
  }
  // createClientProfile:{
  //   createClientProfile:{}
  // }
};


let themeReducer = function (state = initialState.themeInitialState, action) {
  switch (action.type) {
    case actionType.CHANGE_THEME_TO_DARK:
      return { className: 'theme-dark', desktopLogo: 'logo.png', mobileLogo: 'logo.png' };
    case actionType.CHANGE_THEME_TO_DARK2:
      return { className: 'theme-dark2', desktopLogo: 'logo.png', mobileLogo: 'logo.png' };
    case actionType.CHANGE_THEME_TO_LIGHT:
      return { className: 'theme-light', desktopLogo: 'logo.png', mobileLogo: 'logo.png' };
    case actionType.CHANGE_THEME_TO_BACARDI:
      return { className: 'theme-bacardi', desktopLogo: 'Bacardi.png', mobileLogo: 'Bacardi.png' };
    case actionType.CHANGE_THEME_TO_COCACOLA:
      return { className: 'theme-cocacola', desktopLogo: 'CocaCola.png', mobileLogo: 'CocaCola.png' };
    case actionType.CHANGE_THEME_TO_STARBUCKS:
      return { className: 'theme-starbucks', desktopLogo: 'Starbucks.png', mobileLogo: 'Starbucks.png' };
    case actionType.CHANGE_THEME_TO_SNOWWHITE:
      return { className: 'theme-snowwhite', desktopLogo: 'logo.png', mobileLogo: 'logo.png' };
    case actionType.CHANGE_THEME_TO_HANWHA:
      return { className: 'theme-hanwha', desktopLogo: 'Hanwha.jpg', mobileLogo: 'Hanwha.jpg' };
    case actionType.CHANGE_THEME_TO_GEUTEBRUCK:
      return { className: 'theme-geutebruck', desktopLogo: 'Geutebruck.png', mobileLogo: 'Geutebruck.png' };
    default:
      return state;
  }
}

let storeChange = function (state = { selectedStore: [{ label: "All", value: "All" }] }, action) {
  switch (action.type) {
    case 'STORE_CHANGE':
    case 'PAGE_404':
      state = Object.assign({}, state, action.value);
      return state;
    default:
      return state;
  }
}

let searchFilter = function (state = {}, action) {
  switch (action.type) {
    case 'SEARCH_FILTER':
      state = Object.assign({}, state, action.value);
      return state;

    default:
      return state;
  }
}

let updateGridData = function (state = {}, action) {
  switch (action.type) {
    case 'UPDATE_GRID_DATA':
      state = Object.assign({}, state, action.value);
      return state;

    default:
      return state;
  }
}

let selectedTimelineVideo = function (state = {}, action) {
  switch (action.type) {
    case 'SELECTED_TIMELINE_VIDEO':
      state = Object.assign({}, state, action.value);
      return state;
    default:
      return state;
  }
}

let exitFullScreen = function (state = false, action) {
  switch (action.type) {
    case actionType.EXIT_CHANGE:
      state = Object.assign({}, state, action.value);
      return state;
    default:
      return state;
  }
}

let liveVideoClick = function (state = true, action) {
  switch (action.type) {
    case actionType.LIVE_VIDEO:
      state = action.value ? action.value : false;
      return state;
    default:
      return state;
  }
}

let fullScreenVideo = function (state = null, action) {
  switch (action.type) {
    case actionType.VIDEO_CHANGE:
      state = Object.assign({}, state, { value: action.value });
      return state;
    default:
      return state;
  }
}

function scaleReport(state = { data: null }, action) {
  console.log('action sales', action)
  switch (action.type) {
    case actionType.GET_SCALES_DATA_SUCCESS:
      let { json } = action;
      console.log('jsonnnnnnnn', json)
      return Object.assign({}, state, { data: json });
    // case 'ROLE_DATA_ERROR':
    //   let errorMessage = Util.getErrorInfo(action);
    //   return Object.assign({}, state, { data: null, error: errorMessage, isFetching: false });
    default:
      return state;
  }
}

function roleData(state = { data: null }, action) {
  switch (action.type) {
    case actionType.ROLE_DATA_SUCCESS:
      let { json } = action;
      return Object.assign({}, state, { data: json });
    case 'ROLE_DATA_ERROR':
      let errorMessage = Util.getErrorInfo(action);
      return Object.assign({}, state, { data: null, error: errorMessage, isFetching: false });
    default:
      return state;
  }
}

function userDetail(state = { data: null }, action) {
  switch (action.type) {
    case actionType.USER_DETAIL_SUCCESS:
      let { json } = action;
      return Object.assign({}, state, { data: json });
    case 'USER_DETAIL_ERROR':
      let errorMessage = Util.getErrorInfo(action);
      return Object.assign({}, state, { data: null, error: errorMessage, isFetching: false });
    default:
      return state;
  }
}

function reloadGrid(state = { data: null }, action) {
  switch (action.type) {
    case actionType.RELOAD_GRID:
      let { data } = action;

      return Object.assign({}, state, { data: data });
    default:
      return state;
  }
}

function screenDetails(state = { data: null }, action) {
  switch (action.type) {
    case actionType.SCREEN_NAME:
      let { data } = action;

      return Object.assign({}, state, { data: data });
    default:
      return state;
  }
}

let screenResizedReducer = function (state = {}, action) {
  switch (action.type) {
    case actionType.SCREEN_RESIZED:
      state = Object.assign({}, state, action.data);
      return state;
    default:
      return state;
  }
}

let getGridFilter = function (state = null, action) {
  switch (action.type) {
    case actionType.GRID_FILTER:
      state = Object.assign({}, state, { value: action.value });
      return state;
    default:
      return state;
  }
}

let liveCamFullscreenStatus = function (state = {}, action) {
  switch (action.type) {
    case actionType.LIVE_CAM_FULLSCREEN_STATUS:
      state = Object.assign({}, state, action.value);
      return state;

    default:
      return state;
  }
}

let timelinePlayer = function (state = initialState.timelinePlayerInitialState, action) {
  switch (action.type) {
    case actionType.TIMELINE_PLAYER:
      state = Object.assign({}, state, action.value);
      return state;

    default:
      return state;
  }
}

let getGridSearch = function (state = {}, action) {
  switch (action.type) {
    case actionType.GRID_SEARCH:
      if (action.value) {
        return { ...state, ...action.value };
      }
      return {};
    default:
      return state;
  }
}

let sameWindow = function (state = initialState.isSameWindow, action) {
  switch (action.type) {
    case actionType.SAME_WINDOW:
      state = Object.assign({}, state, action.value);
      return state;

    default:
      return state;
  }
}

let selectedCameraData = function (state = initialState.selectedCameraData, action) {
  switch (action.type) {
    case actionType.SELECTED_CAMERA_DATA:
      state = Object.assign({}, state, action.value);
      return state;

    default:
      return state;
  }
}
let getRoleIdData = function (state = initialState.roleIdData, action) {
  console.log(state, action);
  switch (action.type) {
    case actionType.GET_ROLE_ID:
      let { payload } = action
      console.log(action.payload);
      return { ...state, roleIdData: action.payload }
    case actionType.CLEAR_ROLE:
      return { ...state, roleIdData: [] }
    default:
      return state;
  }
}
let createRoleData = function (state = initialState.createRole, action) {
  console.log(state, action);
  switch (action.type) {
    case actionType.CREATE_ROLE:
      let { payload } = action
      console.log(action.payload);
      return { ...state, createRole: action.payload }
    case actionType.CLEAR_CREATE_ROLE:
      return { ...state, createRole: [] }
    default:
      return state;
  }
}
let updateRoleData = function (state = initialState.updateRole, action) {
  console.log(state, action);
  switch (action.type) {
    case actionType.UPDATE_ROLE:
      let { payload } = action
      console.log(action.payload);
      return { ...state, updateRole: action.payload }
    case actionType.CLEAR_UPDATE_ROLE:
      return { ...state, updateRole: [] }
    default:
      return state;
  }
}

let syncplaybackState = function (state = initialState.syncplaybackState, action) {
  switch (action.type) {
    case actionType.SYNC_PLAYBACK_STATE:
      return { ...state, ...action.value }
    default:
      return state;
  }
}
// let createClientProfileData = function (state = initialState.createClientProfile, action) {
//   console.log(state,action);
//   switch (action.type) {
//     case actionType.CREATE_ROLE:
//       let {payload}=action
//       console.log(action.payload);
//        return {...state,createClientProfile:action.payload}
//     case actionType.CLEAR_CREATE_ROLE:
//       return {...state,createClientProfile:[]}
//     default:
//       return state;
//   }
// }





export {
  storeChange,
  searchFilter,
  themeReducer,
  updateGridData,
  selectedTimelineVideo,
  exitFullScreen,
  liveVideoClick,
  roleData,
  userDetail,
  reloadGrid,
  screenDetails,
  screenResizedReducer,
  fullScreenVideo,
  getGridFilter,
  liveCamFullscreenStatus,
  timelinePlayer,
  getGridSearch,
  sameWindow,
  selectedCameraData,
  getRoleIdData,
  createRoleData,
  updateRoleData,
  scaleReport,
  syncplaybackState
  // createClientProfileData
}

