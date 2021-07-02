import promiseUtils from '../httpUtil/cancelableFetch';
import download from 'downloadjs';
import utils from '../../Util/Util';
import swal from 'sweetalert';
const ACTION_STATUSES = ['START', 'SUCCESS', 'ERROR'];

var noActivityTimer = null;
var timer = null;

var defaultHandlers = {

  START: function (state, action, options) {
    return Object.assign({}, state, { isFetching: true, error: null });
  },

  SUCCESS: function (state, action, options) {
    if (action.options.start && !action.isFetching) {
      var allItems = [];
      allItems = action.options.start > 0 && state.data && action.options.isList ? state.data.records : [];
      action.json.records = allItems.concat(action.json.records);
      action.isFetching = true;
    }
    return Object.assign({}, state, { data: action.json, isFetching: false, type: action.type, error: null });
  },

  ERROR: function (state, action, options) {
    let errorMessage = utils.getErrorInfo(action);
    return Object.assign({}, state, { isFetching: false, error: errorMessage, data: null });
  }
};


export default class AjaxAction {
  constructor(options) {
    Object.assign(this, options);
    let requestType = options.requestType;
    let actionTypes = {};
    let actions = {};
    let statuses = [].concat(ACTION_STATUSES);
    if (options.otherActionTypes) {
      statuses = statuses.concat(options.otherActionTypes)
    }
    for (const status of statuses) {
      var action = requestType + '_' + status
      actionTypes[requestType + '_' + status] = action;
      actions[status] = action;
    }
    this.actionTypes = actionTypes;
    this.actions = actions;
    this.reducer = this._createReducer(options);
  }

  refreshSession(url, fromLogoutButton) {
    let me = this;
    clearTimeout(noActivityTimer);
    fetch(`${url}`, {
      method: url.indexOf("logout") > -1 ? 'POST' : 'GET',
      credentials: 'include', // include, *same-origin, omit
      headers: {
        'Content-Type': 'application/json'
        // 'Content-Type': 'application/x-www-form-urlencoded',
      },
    }).then(response => {
      if (response.status === 200) {
        response.text().then((text) => {
          try {
            var json = JSON.parse(text);
            if (json.message == "Logout success" || json.error == "Session Expired") {
              if (fromLogoutButton === false) {
                localStorage.setItem("sessionExpired", true);
              }
              window.location.replace("/");
            }
            else {
              if (window.location.hash != "#/") {
                noActivityTimer = setTimeout(this.checkActivity.bind(this), utils.SessionExpiryTime);
              }
            }
          }
          catch (er) {
            console.log(`Error while session check ${er}`);
          }
        });
      }
    });
  }

  _createReducer(options) {
    var requestType = options.requestType;

    var actions = options.actions || ACTION_STATUSES;

    var validActions = [];

    actions.forEach((action) => {
      var actionName = requestType + '_' + action;
      validActions.push(actionName);
    });

    for (var o in options.otherHandlers) {
      validActions.push(requestType + '_' + o);
    }

    let parser = this._createDefaultParser(options, actions);

    return function (state = { isFetching: false, data: null }, action) {
      if (validActions.indexOf(action.type) > -1) {
        return Object.assign({}, state, parser(state, action));
      }
      return state;
    }
  }

  _createDefaultParser(options, actions) {

    let customHandlers = Object.assign({}, defaultHandlers, options.handlers, options.otherHandlers);

    let handlerMap = {};

    for (var action in customHandlers) {
      var key = options.requestType + '_' + action;
      handlerMap[key] = customHandlers[action];
    };

    return function (state = { isFetching: false, data: {} }, action) {
      if (typeof handlerMap[action.type] === 'function') {
        return handlerMap[action.type](state, action, options);
      } else {
        return state;
      }
    }
  }

  dispose() {
    return (dispatch) => {
      return dispatch(this._onDispose({}, {}));
    }
  }

  _onDispose(options, json) {
    return {
      type: this.actions.SUCCESS,
      options,
      json,
      receivedAt: Date.now()
    }
  }

  request(options, id, type, cb) {
    console.log(options, id, type, cb);
    return (dispatch, getState) => {
      return dispatch(this._fetch(options, id, type, cb))
    }
  }

  _onStart(options) {
    return {
      type: this.actions.START,
      options
    }
  }

  _onSuccess(options, json) {
    return {
      type: this.actions.SUCCESS,
      options,
      json,
      receivedAt: Date.now()
    }
  }

  _onFailure(options, response) {
    return {
      type: this.actions.ERROR,
      options,
      response,
      receivedAt: Date.now()
    }
  }

  _getFormData(props) {
    var formData = new FormData();
    for (var key in props) {
      if (typeof props[key] === "string") {
        formData.append(key, props[key]);
      }
      else if (typeof props[key] === "object") {
        if (props[key] && props[key].lastModifiedDate) {
          formData.append(key, props[key]);
        } else {
          formData.append(key, JSON.stringify(props[key]));
        }
      } else {
        formData.append(key, JSON.stringify(props[key]));
      }
    }
    return formData;
  }

  checkActivity() {
    let me = this;
    var
      closeInSeconds = 30,
      displayText = "You will be logged out in #1 seconds";
    swal({
      title: "Your session is about to expire",
      text: displayText.replace(/#1/, closeInSeconds),
      // timer: closeInSeconds * 1000,
      icon: "warning",
      showConfirmButton: false,
      buttons: {
        confirm: {
          text: "Log Out",
          value: true,
          visible: true,
          className: "sessionBtn",
          closeModal: true
        },
        cancel: {
          text: "Continue Session",
          value: false,
          visible: true,
          className: "logoutBtn",
          closeModal: true,
        },

      }
    }).then(value => {
      clearInterval(timer);
      if (window.location.hash != "#/") {
        if (value === true) {
          me.refreshSession(`${utils.serverUrl}/logout`);
          return;
        }
        else if (value === false) {
          me.refreshSession(`${utils.serverUrl}/api2/refreshSession`);
          return;
        }
      }
    });

    timer = setInterval(function () {
      closeInSeconds--;
      if (closeInSeconds <= 0) {
        clearInterval(timer);
        if (window.location.hash != "#/") {
          me.refreshSession(`${utils.serverUrl}/logout`, false);
        }
      }
      let sessionPopup = document.getElementsByClassName("swal-text");
      if (sessionPopup && sessionPopup.length > 0) {
        sessionPopup[0].textContent = displayText.replace("#1", closeInSeconds);
      }
    }, 1000);

  }

  _fetch(options, id, type, cb) {
    var me = this;
    if (me.lastFetch) {
      me.lastFetch.cancel();
    }
    var url = this.url;
    // if(id){
    //console.log(id);
    // }
    if (id || id === 0) {
      url = url + '/' + id;
    }
    url = new URL(url)
    console.log(url);
    return dispatch => {
      dispatch(me._onStart(options))
      if (options)
        var timeout = options.timeout || 60000;
      console.log(options);
      let data = {}
      if (options && options.actionType && options.actionType == "siteNotify") {
        data = {
          // action: "load",
          id: options.id,
          populate: options.populate,
        }
      }
      let fetchOption = {
        method: type ? type : 'POST',
        ...Object.assign({}, type && type === "GET" ? {} :
          { body: options && options.actionType && options.actionType == "siteNotify" ? JSON.stringify(data) : this._getFormData(options, false) })
      };

      if (type == "GET") {
        Object.keys(options).forEach(key => url.searchParams.append(key, options[key]))
      }
      if (options) {
        if (!options.ignoreCredential) {
          fetchOption.credentials = 'include';
        }
      } else {
        fetchOption.credentials = 'include';
      }

      //cancelable token source
      if (options.signal) {
        fetchOption.signal = options.signal;
      }

      console.log(fetchOption, url);
      clearTimeout(noActivityTimer);
      if (window.location.hash != "#/") {
        console.log("SessionExpiryTime: " + utils.SessionExpiryTime);
        noActivityTimer = setTimeout(this.checkActivity.bind(this), utils.SessionExpiryTime);
      }
      var p = fetch(url, fetchOption);
      p = promiseUtils.makeCancelable(p, timeout);
      me.lastFetch = p;
      if (options) {
        if (options.action == "export") {
          //console.log("hhh");
          let fileName = options.fileName ? options.fileName.replace(/get/g, '') + '.xlsx' : 'Report.xlsx'
          return p.then(response => response.arrayBuffer())
            .then(function (response) {
              //console.log(response);

              let blob = new Blob([response], { type: 'application/vnd.openxmlformats' });
              download(blob, fileName);
              dispatch(me._onSuccess(options, false));
            })
            .catch(function (error) {
              ////console.log(error);
              dispatch(me._onFailure(options, error));
            });
        }
        else {
          //console.log("11");
          return p.then(response => {
            me.lastFetch = null;
            //console.log(response);
            if (response.status === 200) {
              response.text().then(function (text) {
                try {
                  var json = JSON.parse(text);
                  //console.log(json);
                  if (((!json.success && json.error === "Session Expired") || json.message === utils.SessionExpired) && window.location.hash != "#/" && !window.location.hash.includes("login")) {
                    swal({
                      title: "Session Timeout",
                      icon: "error",
                      text: "Please Re-Login to continue"
                    }).then(function () {
                      if (window.location.hash != "#/") {
                        window.location.replace("/");
                      }
                    });

                  } else {
                    dispatch(me._onSuccess(options, json));
                    cb && cb(json);
                  }
                }
                catch (e) {
                  dispatch(me._onFailure(options, e.message));
                }
              })
            } else {
              {
                response.text().then(function (text) {
                  try {
                    var json = JSON.parse(text);
                    ////console.log(json);
                    dispatch(me._onSuccess(options, json));
                    cb && cb(json);
                  }
                  catch (e) {
                    dispatch(me._onFailure(options, e.message));
                  }
                })
              }
            }
          }, function (err) {
            me.lastFetch = null;
            dispatch(me._onFailure(options, err));
            cb && cb(err);
          });
        }
      }
    };
  }
}
