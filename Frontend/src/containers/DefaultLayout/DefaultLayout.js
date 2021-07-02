import React, { Component } from 'react';
import { Redirect, Route, Switch } from 'react-router-dom';
import { Container } from 'reactstrap';
import { saveActivityLog, userDetail, storesData, tagsData, saveTagData, getDashboardData, suspiciousTransactions, getTopSelling, getEventFeed } from './../../redux/actions/httpRequest';
import { storeChange, changeThemeToDark, changeThemeToDark2, changeThemeToLight, changeThemeToBacardi, changeThemeToCocacola, changeThemeToStarbucks, changeThemeToHanwha, screenResizedReducer, changeThemeToSnowWhite, changeThemeToGeutebruck } from './../../redux/actions';
import util from './../../Util/Util';
import PropTypes from 'prop-types';
import { withRouter } from "react-router";
import {
  AppFooter,
  AppHeader,
  AppSidebar,
  AppSidebarFooter,
  AppSidebarForm,
  AppSidebarHeader,
  AppSidebarMinimizer,
  AppSidebarNav,
} from '@coreui/react';
// routes config
import routes from '../../routes';
import DefaultFooter from './DefaultFooter';
import DefaultHeader from './DefaultHeader';
import { exitFullScreen, sameWindow } from './../../redux/actions';
import Select from 'react-select';
import { connect } from 'react-redux';
import _nav from '../../_nav'
import utils from './../../Util/Util';
import moment from 'moment';
import consts from './../../Util/consts';
import EditRoleForm from '../../views/Role/EditRoleForm'
import { Button as AntButton, Modal, Button, Form, Input, Checkbox } from 'antd';
import { AddRoleForm } from '../../views/Role/AddRoleForm';

let screenEvents = [
  'webkitfullscreenchange',
  'mozfullscreenchange',
  'fullscreenchange',
  'MSFullscreenChange'
]

const customStyles = {
  clearIndicator: styles => ({ ...styles, width: '16', padding: '0px' }),
  control: styles => ({ ...styles, backgroundColor: 'white' })
}

class DefaultLayout extends Component {

  static propTypes = {
    match: PropTypes.object.isRequired,
    location: PropTypes.object.isRequired,
    history: PropTypes.object.isRequired
  };

  constructor(props) {
    super(props);
    this.state = {
      selectedOption: [{ label: "All", value: "All" }],
      cameraData: [],
      storeData: [],
      disableSelectSite: false,
      disableSelectTag: false,
      tagName: '',
      visible: false,
      routes1: routes,
      currentPage: ''
    };
    this.exitHandler = this.exitHandler.bind(this);
    this.onChangeStore = utils.onChangeStore.bind(this);
    this.formRef = React.createRef();

  }

  // To add tags
  saveTagData = () => {
    const tag = { tagName: this.state.tagName };
    this.props.dispatch(saveTagData.request({ action: 'save', data: tag }))
      .then(res => {
        this.loadTagData();
        this.handleCancel();
      })
      .catch(err => console.log('saveTagData error', err));
  }

  // To load tags.
  loadTagData = () => {
    let options = { action: 'load' };
    this.props.dispatch(tagsData.request(options));
  }

  componentWillReceiveProps(nextProps) {

    if (this.props.location.CheckPrevLoc) {
      nextProps.location.prevPath = this.props.location.pathname;
    }

    if (this.props.location.smartDeviceType) {
      nextProps.location.smartDeviceType = this.props.location.smartDeviceType;
    }

    if ((nextProps['storesData'] && nextProps['storesData'] !== this.props['storesData'])) {
      const { data, isFetching } = nextProps['storesData'];
      if (!isFetching) {
        if (data) {
          console.log('datadatadata', data)
          let storeChangeValues = this.props.storeChange;
          let selectedStoreLocal = localStorage.getItem('SelectedStore');
          let storeSelected = [{ value: "All", label: "All" }];
          if (JSON.parse(selectedStoreLocal) && JSON.parse(selectedStoreLocal).length > 0) {
            storeSelected = JSON.parse(selectedStoreLocal)
          }
          this.setState({ storeData: data.stores, cameraData: data.data });
          this.props.dispatch(storeChange({ data: storeChangeValues && storeChangeValues.data && storeChangeValues.data.length > 0 ? storeChangeValues.data : data.data, selectedStore: storeSelected }));
        }
      }
    }

    if ((nextProps['userDetail'] && nextProps['userDetail'] !== this.props['userDetail'])) {
      this.loadStores();
      let { data: userData } = nextProps.userDetail;
      if (userData) {
        if (!userData.success) {
          // this.props.history.replace({
          //   pathname: '/login',
          //   search: window.location.hash.replace('#/', '')
          // })
        } else {
          var data = nextProps.userDetail.data && nextProps.userDetail.data.data;
          if (data.roleId && data.roleId.permissions.length) {
            let selectedTheme = localStorage.getItem('ThemeSelected'),
              theme = data.theme && data.theme || data.clientId && data.clientId.theme || selectedTheme;
            if (theme) {
              localStorage.setItem('ThemeSelected', theme);
              let Obj = {
                'theme-dark': changeThemeToDark,
                'theme-dark2': changeThemeToDark2,
                'theme-light': changeThemeToLight,
                'theme-bacardi': changeThemeToBacardi,
                'theme-cocacola': changeThemeToCocacola,
                'theme-starbucks': changeThemeToStarbucks,
                'theme-snowwhite': changeThemeToSnowWhite,
                'theme-hanwha': changeThemeToHanwha,
                'theme-geutebruck': changeThemeToGeutebruck
              };

              util.addThemetoBody(`theme-${theme.toLowerCase()}`);
              this.props.dispatch(Obj[`theme-${theme.toLowerCase()}`]());
            }

            this.urlPermitted(data.roleId.permissions, true);
          }
        }
      }
    }
  }

  exitHandler(event) {
    var fullscreenElement = document.fullscreenElement || document.mozFullScreenElement || document.webkitFullscreenElement;
    if (!fullscreenElement) {
      this.props.dispatch(exitFullScreen(false));
      this.props.dispatch(sameWindow({ isSame: false }));
    }
  }

  onRouteChanged() {
    let loggedData = utils.getScreenDetails(utils.getLoggedUser(), this.props.location, null);
    this.props.dispatch(saveActivityLog.request({ action: 'save', data: loggedData }));
  }

  urlPermitted(userData, reload) {
    if (userData && userData) {
      let urlParam = window.location.hash.substr(2).split('/');

      let index = userData.findIndex((d) => {
        let nav = _nav.navigation().items;
        let url = '/' + urlParam[0];
        let navIndex = nav.findIndex((e) => {
          let isExists = e.permission.indexOf(d.name) != -1 && e.url == url;

          if (!isExists && e.children && e.children.length > 0) {
            let childIndex = e.children.findIndex((c) => {
              return c.permission.indexOf(d.name) != -1 && c.url == url;
            });
            isExists = childIndex != -1;
          }
          return isExists;
        });
        return navIndex != -1 ? true : false;
      })

      if (index === -1) {
        // let defaultMenu = util.getMenu(true);
        // if (defaultMenu != '/login' && urlParam[0] != '404' && urlParam[0] != 'search' && urlParam[0] != 'transaction' && urlParam[0] != 'promotions' && (userData != null && urlParam[0] != 'changePassword')) {
        //   this.context.router.history.push(reload ? defaultMenu : urlParam[index] ? urlParam[index] : defaultMenu);
        // }
      }
    }
  }

  componentDidUpdate(prevProps) {



    if (this.props.location.pathname != prevProps.location.pathname) {
      let userData = prevProps.userDetail;
      if (userData && userData.data && userData.data.success && userData.data.data && userData.data.data.roleId && userData.data.data.roleId.permissions.length) {
        this.urlPermitted(userData.data.data.roleId.permissions, false);
        //this.onRouteChanged();
        return;
      }
    }
  }

  loadStores() {
    this.props.dispatch(storesData.request({ stores: [] }));
  }

  componentDidMount() {
    window.scrollTo(0, 0);
    let navArea = document.getElementsByClassName('sidebar-nav')[0];
    if (navArea) {
      navArea.classList.remove("ps");
    }
    if (!this.props.userDetail.data) {
      this.props.dispatch(userDetail.request({}));
    } else if (!this.props.storesData.data) {
      this.loadStores();
    }

    screenEvents.forEach(evt => {
      document.addEventListener(evt, this.exitHandler, false);
    });

    //this.loadTagData()

  }

  componentWillUnmount() {
    screenEvents.forEach(evt => {
      document.removeEventListener(evt, null, false);
    });
  }
  async componentDidUpdate() {
    //   console.log(this.state.routes1,this.props);
    //   let h=this.props.location.pathname
    //   console.log(h.length);
    //   let str=h.search("roleForm")
    //   console.log(str);
    //   if(str>0){
    //   this.state.routes1=await this.state.routes1.map(x=>{
    //     if(x.name=="Role Form"){
    //              if(h.length>40){
    //                console.log("HII");
    //                x.component=EditRoleForm
    //                return x
    //              }else if(h.length==22){
    //                x.component=AddRoleForm
    //                return x
    //              }else
    //              return x
    //             }else
    //             return x
    //   })
    // }
    // console.log(this.state.routes1);
    // this.setState({routes1:this.state.routes1})

  }
  onChangeTag(selectedValue) {
    let cameraData = this.state.cameraData;
    let filterData = [];
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
              storeIds.push(data._id);
              break;
            }
          }
        }
      });
      storeIds.forEach(function (data) {
        let filteredCameraData = cameraData.filter(function (e) { return e.storeId._id === data });
        filteredCameraData.forEach(function (data) {
          filterData.push(data);
        });

      });
      this.props.dispatch(storeChange({ data: filterData, selectedTag: selectedValue, selectedStore: '' }));
    } else {
      this.props.dispatch(storeChange({ data: cameraData, selectedTag: selectedValue, selectedStore: '' }));
    }

    this.setState({
      selectedTag: selectedValue,
      selectedOption: '',
      disableSelectSite: selectedMultipleTagsLength > 0 ? true : false
    });
    this.updateDashboardData(selectedValue, true, '');

  }

  updateDashboardData(selectedValue, fromTags, fromSites) {
    let filterData = [];
    selectedValue.forEach(function (data) {
      filterData.push(data.value);
    })
    let timezoneOffset = new Date().getTimezoneOffset();
    let startDate = moment.utc(moment().startOf('day')).format(utils.dateTimeFormatSecond);
    let endDate = moment.utc(moment().endOf('day')).format(utils.dateTimeFormatSecond);
    this.props.dispatch(getDashboardData.request({ selectedValue: filterData, fromTags: fromTags, fromSites: fromSites, timezoneOffset: timezoneOffset, startDate: startDate, endDate: endDate }));
    this.props.dispatch(suspiciousTransactions.request({ selectedValue: filterData, fromTags: fromTags, fromSites: fromSites, page: 1, pageSize: 5, sort: 'EventTime', sortDir: 'DESC' }));
    this.props.dispatch(getTopSelling.request({ selectedValue: filterData, fromTags: fromTags, fromSites: fromSites, page: 1, pageSize: 5, sort: 'count', sortDir: 'DESC' }));
    this.props.dispatch(getEventFeed.request({ selectedValue: filterData, fromTags: fromTags, fromSites: fromSites, page: 0, pageSize: 5, populate: "", sort: undefined, sortDir: undefined, filter: {}, Category: [], NoCategory: [], combos: '', selectedOptionVal: {}, isFromEventFeed: true }));

  }

  /***
   * Update main layout
   */
  updateMainLayout = (e) => {
    // alwaye run om toggle
    utils.toggleMenu(false);
    setTimeout(() => {
      this.props.dispatch(screenResizedReducer({ updateDiv: consts.UpdateDivVal }));
    }, 500);

  }

  resetPage = () => {
    localStorage.setItem('currentPage', 1);
    localStorage.setItem('currentPageSize', 20);
  }

  shouldUseConditionalDashBoard = (props) => {
    let { data } = props.userDetail && props.userDetail.data || {};
    let { clientId } = data || {};
    if (!clientId) {
      return false;
    }
    return clientId.name === "Spirit-ATL";
  }

  getTagOptions = () => {
    const { isFetching, data } = this.props.tagsData;
    let options = []
    if (!isFetching && data) {
      options = data.data.map(tag => ({ value: tag.name, label: tag.name }))
    }
    return options
  }

  render() {
    const { selectedOption, storeData, selectedTag, disableSelectSite, disableSelectTag, routes1 } = this.state,
      { selectedStore } = this.props.storeChange,
      { userDetail, screenResizedReducer } = this.props;
    if (!userDetail || !userDetail.data) {
      return <></>;
    }
    let selectedStoreLocal = localStorage.getItem('SelectedStore');
    let storeSelected = [];
    if (JSON.parse(selectedStoreLocal) && JSON.parse(selectedStoreLocal).length > 0) {
      storeSelected = JSON.parse(selectedStoreLocal)
    }
    let storeCombo = [{ value: "All", label: "All" }];
    let tagsCombo = [];
    let tags = [];
    let conditionalDashboard = this.shouldUseConditionalDashBoard(this.props);
    storeData && storeData.forEach(function (data) {
      let storeName = data && data.name || '';
      let currentStoreTags = data.tags;
      storeCombo.push({ value: data._id, label: storeName });
      if (currentStoreTags && currentStoreTags.length > 0) {
        currentStoreTags.forEach(function (data) {
          tags.push(data);
        });
      }
    });

    storeCombo = storeCombo.sort(function (site1, site2) {
      return site1.label > site2.label ? 1 : -1;
    });

    if (tags && tags.length > 0) {
      tags = tags.sort();
      tags = tags.filter(function (item, pos, self) {
        return self.indexOf(item) == pos;
      });
      tags && tags.forEach(function (data) {
        tagsCombo.push({ value: data, label: data });
      });
    }

    let navigationNew = util.getMenu();
    let isDashboard = window.location.hash.substr(2) == 'dashboard';
    let isMultiplePlayback = window.location.href.indexOf('timelineWindow') > -1;
    return (
      <div className="app">
        <AppHeader fixed>
          <DefaultHeader />
        </AppHeader>
        <div className="app-body">
          {!isMultiplePlayback &&
            <AppSidebar fixed display="lg">
              {/* <Select className="siteDropdown"
                isDisabled={disableSelectSite}
                isMulti={true}
                isClearable={true}
                styles={customStyles}
                onChange={(val) => this.onChangeStore(val)}
                required={true}
                options={storeCombo}
                value={storeSelected || selectedStore || selectedOption}
                placeholder="Select Site"
              />
              <Select className="siteDropdown"
                isClearable={true}
                isMulti={true}
                styles={customStyles}
                isDisabled={selectedStore && selectedStore.length > 0}
                onChange={(val) => this.onChangeTag(val)}
                required={true}
                options={tagsCombo}
                value={selectedTag}
                placeholder="Select"
              /> */}
              <AppSidebarHeader />
              <AppSidebarForm />
              <AppSidebarNav navConfig={navigationNew} {...this.props} onClick={this.resetPage} />
              <AppSidebarFooter />
              <div onClick={(e) => this.updateMainLayout(e)} style={{ display: "contents" }}>
                <AppSidebarMinimizer />
              </div>
            </AppSidebar>
          }
          <div className={!isMultiplePlayback ? "main" : "playback_main"}>
            <Container fluid className={isDashboard ? `site-video-div dashbord-container` : `site-video-div`}>
              <Switch>
                {routes1.map((route, idx) => {
                  return route.component ? (<Route key={idx} path={route.path} exact={route.exact} name={route.name} render={props => (
                    conditionalDashboard && route.name.toLowerCase() === 'dashboard' ? <route.conditionalComponent {...props} />
                      : <route.component {...props} />
                  )} />)
                    : (null);
                },
                )}
                <Redirect from="/" to="/404" />
              </Switch>
            </Container>
          </div>
          {/* <AppAside fixed>
            <DefaultAside />
          </AppAside> */}
        </div>
        <AppFooter className={isMultiplePlayback && "multiplePlayback"}>
          <DefaultFooter screenResizedReducer={screenResizedReducer} />
        </AppFooter>
      </div>
    );
  }
}

DefaultLayout.contextTypes = {
  router: PropTypes.object.isRequired
};

function mapStateToProps(state, ownProps) {
  return {
    exitFullScreen: state.exitFullScreen,
    storeChange: state.storeChange,
    storesData: state.storesData,
    userDetail: state.userDetail,
    screenResizedReducer: state.screenResizedReducer,
    tagsData: state.tagsData,
  };
}

var DefaultLayoutModule = connect(mapStateToProps)(withRouter(DefaultLayout));
export default DefaultLayoutModule;

