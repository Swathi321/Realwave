import axios from 'axios'
import api from '../httpUtil/serverApi'
export const instance = axios.create({
  withCredentials: true
})

export let actionType = {
  ROUTE_CHANGE: 'ROUTE_CHANGE',
  EXIT_CHANGE: 'EXIT_CHANGE',
  STORE_CHANGE: 'STORE_CHANGE',
  SEARCH_FILTER: 'SEARCH_FILTER',
  PAGE_404: 'PAGE_404',
  CHANGE_THEME_TO_DARK: 'CHANGE_THEME_TO_DARK',
  CHANGE_THEME_TO_DARK2: 'CHANGE_THEME_TO_DARK2',
  CHANGE_THEME_TO_LIGHT: 'CHANGE_THEME_TO_LIGHT',
  CHANGE_THEME_TO_BACARDI: 'CHANGE_THEME_TO_BACARDI',
  CHANGE_THEME_TO_COCACOLA: 'CHANGE_THEME_TO_COCACOLA',
  CHANGE_THEME_TO_STARBUCKS: 'CHANGE_THEME_TO_STARBUCKS',
  CHANGE_THEME_TO_SNOWWHITE: 'CHANGE_THEME_TO_SNOWWHITE',
  CHANGE_THEME_TO_HANWHA: 'CHANGE_THEME_TO_HANWHA',
  CHANGE_THEME_TO_GEUTEBRUCK: 'CHANGE_THEME_TO_GEUTEBRUCK',
  UPDATE_GRID_DATA: 'UPDATE_GRID_DATA',
  SELECTED_TIMELINE_VIDEO: 'SELECTED_TIMELINE_VIDEO',
  ROLE_DATA_SUCCESS: 'ROLE_DATA_SUCCESS',
  GET_SCALES_DATA_SUCCESS: 'GET_SCALES_DATA_SUCCESS',
  GET_SCALES_DATA_ERROR: 'GET_SCALES_DATA_ERROR',
  ROLE_DATA_ERROR: 'ROLE_DATA_ERROR',
  USER_DETAIL_SUCCESS: 'USER_DETAIL_SUCCESS',
  RELOAD_GRID: 'RELOAD_GRID',
  SCREEN_NAME: 'SCREEN_NAME',
  SCREEN_RESIZED: 'SCREEN_RESIZED',
  VIDEO_CHANGE: 'VIDEO_CHANGE',
  GRID_FILTER: 'GRID_FILTER',
  LIVE_CAM_FULLSCREEN_STATUS: 'LIVE_CAM_FULLSCREEN_STATUS',
  TIMELINE_PLAYER: 'TIMELINE_PLAYER',
  MODAL_OPEN: 'MODAL_OPEN',
  GRID_SEARCH: 'GRID_SEARCH',
  LIVE_VIDEO: 'LIVE_VIDEO',
  SAME_WINDOW: 'SAME_WINDOW',
  SELECTED_CAMERA_DATA: 'SELECTED_CAMERA_DATA',
  CLEAR_ROLE: 'CLEAR_ROLE',
  GET_ROLE_ID: 'GET_ROLE_ID',
  CREATE_ROLE: 'CREATE_ROLE',
  CLEAR_CREATE_ROLE: 'CLEAR_CREATE_ROLE',
  UPDATE_ROLE: 'UPDATE_ROLE',
  CLEAR_UPDATE_ROLE: 'CLEAR_UPDATE_ROLE',
  CREATE_CLIENT_PROFILE: 'CREATE_CLIENT_PROFILE',
  GET_SCALES_DATA: "GET_SCALES_DATA",
  SYNC_PLAYBACK_STATE: "SYNC_PLAYBACK_STATE"
};

export function timelinePlayer(value) {
  return {
    type: actionType.TIMELINE_PLAYER,
    value
  };
}

export function liveCamFullscreenStatus(value) {
  return {
    type: actionType.LIVE_CAM_FULLSCREEN_STATUS,
    value
  };
}

export function changeThemeToDark() {
  return {
    type: actionType.CHANGE_THEME_TO_DARK
  };
}

export function changeThemeToDark2() {
  return {
    type: actionType.CHANGE_THEME_TO_DARK2
  };
}

export function changeThemeToLight() {
  return {
    type: actionType.CHANGE_THEME_TO_LIGHT
  };
}

export function changeThemeToBacardi() {
  return {
    type: actionType.CHANGE_THEME_TO_BACARDI
  };
}

export function changeThemeToCocacola() {
  return {
    type: actionType.CHANGE_THEME_TO_COCACOLA
  };
}

export function changeThemeToStarbucks() {
  return {
    type: actionType.CHANGE_THEME_TO_STARBUCKS
  };
}

export function changeThemeToSnowWhite() {
  return {
    type: actionType.CHANGE_THEME_TO_SNOWWHITE
  };
}

export function changeThemeToHanwha() {
  return {
    type: actionType.CHANGE_THEME_TO_HANWHA
  };
}

export function changeThemeToGeutebruck() {
  return {
    type: actionType.CHANGE_THEME_TO_GEUTEBRUCK
  };
}

export let routeChange = () => {
  return {
    type: actionType.ROUTE_CHANGE
  }
}

export let exitFullScreen = (value) => {
  return {
    type: actionType.EXIT_CHANGE,
    value
  }
}

export let liveVideoClick = (value) => {
  return {
    type: actionType.LIVE_VIDEO,
    value
  }
}

export let storeChange = (value) => {
  return {
    type: actionType.STORE_CHANGE,
    value
  }
}

export function searchFilter(value) {
  return {
    type: actionType.SEARCH_FILTER,
    value
  }
}

export let page404 = (value) => {
  return {
    type: actionType.PAGE_404,
    value
  }
}

export function updateGridData(value) {
  return {
    type: actionType.UPDATE_GRID_DATA,
    value
  }
}


export let selectedTimelineVideo = (value) => {
  return {
    type: actionType.SELECTED_TIMELINE_VIDEO,
    value
  }
}

export let roleUpdate = (json) => {
  return {
    type: actionType.ROLE_DATA_SUCCESS,
    json
  }
}

export function reloadGrid(data) {
  return (dispatch, getState) => {
    return dispatch({
      type: actionType.RELOAD_GRID,
      data
    });
  };
};

export function screenDetails(data) {
  return (dispatch, getState) => {
    return dispatch({
      type: actionType.SCREEN_NAME,
      data
    });
  };
};

export function screenResizedReducer(data) {
  return {
    type: actionType.SCREEN_RESIZED,
    data
  }
};

export let fullScreenVideo = (value) => {
  return {
    type: actionType.VIDEO_CHANGE,
    value
  }
}

export let getGridFilter = (value) => {
  return {
    type: actionType.GRID_FILTER,
    value
  }
}

export let getGridSearch = (value) => {
  return {
    type: actionType.GRID_SEARCH,
    value
  }
}
export let getspiritData = (value) => {
  console.log("aa", value)
  return {
    type: actionType.SPIRIT_DATA,
    value
  }
}

export function sameWindow(value) {
  return {
    type: actionType.SAME_WINDOW,
    value
  };
}

export function selectedCameraData(value) {
  return {
    type: actionType.SELECTED_CAMERA_DATA,
    value
  };
}
export function clearRoleData(value) {
  return {
    type: actionType.CLEAR_ROLE,
    value
  };
}
export const roleIdSuccess = (data) => {
  console.log(data);
  return {
    type: actionType.GET_ROLE_ID,
    payload: data
  }
}
export const syncplaybackState = (value) => {
  return {
    type: actionType.SYNC_PLAYBACK_STATE,
    value
  }
}
export function getroleIds(value) {
  console.log(value);
  return (dispatch) => {
    let { id, populate } = value
    console.log(id, populate);
    let options = { populate: populate }
    instance.post(`${api.ROLE_LIST}/${id}`, options)
      .then(res => {
        console.log(res.data)
        dispatch(roleIdSuccess(res.data))
      }).catch(err => {
        console.log(err);
      })
  }
}

export function clearCreateRoleData(value) {
  return {
    type: actionType.CLEAR_CREATE_ROLE,
    value
  };
}
export const createRoleSuccess = (data) => {
  console.log(data);
  return {
    type: actionType.CREATE_ROLE,
    payload: data
  }
}
// export const createClientProfileSuccess = (data) => {
//   console.log(data);
//   return {
//     type: actionType.CREATE_CLIENT_PROFILE,
//     payload: data
//   }
// }
export const updateRoleSuccess = (data) => {
  console.log(data);
  return {
    type: actionType.UPDATE_ROLE,
    payload: data
  }
}
export const clearUpdatedRoleData = (data) => {
  console.log(data);
  return {
    type: actionType.CLEAR_UPDATE_ROLE,
    payload: data
  }
}


export function createRoleAction(value) {
  console.log(value);
  let { action, data } = value
  var bodyFormData = new FormData();
  bodyFormData.append('action', action);
  bodyFormData.append('data', JSON.stringify(data));
  return (dispatch) => {
    instance.post(`${api.ROLE_LIST}/0`, bodyFormData)
      .then(res => {
        console.log(res.data)
        dispatch(createRoleSuccess(res.data))
      }).catch(err => {
        console.log(err);
      })
  }
}
export function updateRoleAction(value, id) {
  console.log(value);
  let { action, data } = value
  var bodyFormData = new FormData();
  bodyFormData.append('action', action);
  bodyFormData.append('data', JSON.stringify(data));
  return (dispatch) => {
    instance.post(`${api.ROLE_LIST}/${id}`, bodyFormData)
      .then(res => {
        console.log(res.data)
        dispatch(updateRoleSuccess(res.data))
      }).catch(err => {
        // dispatch(updateRoleFail(err))
        console.log(err);
      })
  }
}


// export function createClientProfileAction(value) {
//   console.log(value);
//   let { action, data } = value
//   var bodyFormData = new FormData();
//   bodyFormData.append('action', action);
//   bodyFormData.append('data', JSON.stringify(data));
//   return (dispatch) => {
//     instance.post(`${api.CLIENT_LIST}/0`, bodyFormData)
//       .then(res => {
//         console.log(res.data)
//         dispatch(createClientProfileSuccess(res.data))
//       }).catch(err => {
//         console.log(err);
//       })
//   }
// }

