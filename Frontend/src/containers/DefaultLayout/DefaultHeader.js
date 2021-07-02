import React, { PureComponent } from 'react';
import { DropdownItem, DropdownMenu, DropdownToggle, Nav, NavItem } from 'reactstrap';
import PropTypes from 'prop-types';
import { AppHeaderDropdown, AppNavbarBrand, AppSidebarToggler } from '@coreui/react';
import minLogo from '../../assets/img/minLogo.png';
import { connect } from 'react-redux';
import Breadcrumbs from '../../component/Breadcrumbs';
import SearchFilter from '../../component/SearchFilter';
import { changeThemeToDark, changeThemeToDark2, changeThemeToLight, changeThemeToBacardi, changeThemeToCocacola, changeThemeToStarbucks, changeThemeToSnowWhite, changeThemeToHanwha, changeThemeToGeutebruck, screenResizedReducer } from '../../redux/actions/index';
import util from './../../Util/Util';
import url from './../../redux/httpUtil/serverApi';
import { userLogOut, getDashboardData, suspiciousTransactions, getTopSelling, getEventFeed, saveActivityLog, updateUser, getCameraClipData } from './../../redux/actions/httpRequest';
import { storeChange } from '../../redux/actions';
import moment from 'moment';
import utils from './../../Util/Util';
import consts from './../../Util/consts';
import Select from 'react-select';
import LoadingDialog from '../../component/LoadingDialog';
import TargetImg from '../../assets/img/target.jpg';
import GeutebruckLogo from '../../assets/img/geutebruck-logo.png';
import io from 'socket.io-client';

const propTypes = {
  children: PropTypes.node,
};

const defaultProps = {};
const customStyles = {
  clearIndicator: styles => ({ ...styles, width: '16', padding: '0px' }),
  control: styles => ({ ...styles, backgroundColor: 'white' }),
  menu: styles => ({ ...styles, textAlign: 'left' })
}

class DefaultHeader extends PureComponent {
  constructor(props) {
    super(props);

    let loggedInUser = utils.getLoggedUser();
    let DefaultThemes = ['Dark', 'Light'];

    let allowedThemes = loggedInUser && loggedInUser.clientId ? loggedInUser.clientId.allowedThemes : [];

    // if no client's allowed themes found then display default themes
    if (!allowedThemes.length) {
      allowedThemes = [...DefaultThemes];
    }

    let Themes = [
      { name: 'Dark', function: 'changeToDark' },
      { name: 'Light', function: 'changeToLight' },
      { name: 'Bacardi', function: 'changeToBacardi' },
      { name: 'Coca Cola', function: 'changeToCocacola' },
      { name: 'Starbucks', function: 'changeToStarbucks' },
      { name: 'Hanwha', function: 'changeToHanwha' },
      { name: 'Geutebruck', function: 'changeThemeToGeutebruck' },
    ];

    let DisplayThemes = [];

    // if logged in user is Admin then display all the themes
    if (loggedInUser && loggedInUser.clientId) {
      allowedThemes.map(theme => {
        let select = Themes.find(item => item.name.toLowerCase() == theme.toLowerCase());
        if (select) DisplayThemes.push(select);
      });
    } else if (loggedInUser && !loggedInUser.clientId) {
      DisplayThemes = [...Themes]
    }


    this.maxAlarmSitesDisplay = 2;

    this.state = {
      searchValue: '',
      isFull: false,
      screenData: null,
      selectedOption: [{ label: "All", value: "All" }],
      storeData: [],
      cameraData: [],
      loggedInUser: loggedInUser,
      disableSelectSite: false,
      showSitesCombo: false,
      themeSelected: localStorage.getItem('ThemeSelected') ? localStorage.getItem('ThemeSelected').toLowerCase() : 'Dark',
      ThemesDropdown: DisplayThemes,
      activatedSites: [],
      firstThreeActSites: [],
    };


    this.onLogout = this.onLogout.bind(this);
    this.onChangeStore = utils.onChangeStore.bind(this);
    // this.alarmChanges = this.alarmChanges.bind(this);
  }

  componentWillMount() {
    let user = this.state.loggedInUser;
    if (!user) {
      localStorage.setItem("previousHash", window.location.hash.substr(2));
      console.log('reached here.. Default Header 1');
      window.location = '/';
      //this.context.router.history.replace('/login');
    }

    // let me = this;
    // const { clientId,_id } = user;

    // if (user) {
    //     console.log(_id,'@@@@@@@@@');
    //     me.clientId = utils.guid();
    //     this.socketUri = `${utils.serverImageUrl}?type=alarm&userId=${_id}&clientId=${clientId}`;
    //     me.socketClient = io(this.socketUri);
    //     me.socketClient.on('connect', () => console.log("alarm socket connected"));
    //     me.socketClient.on('disconnect', () => console.log("alarm socket disconnected"));
    //     me.socketClient.on('alarm', (data)=>{
    //       this.setState({ 
    //         activatedSites : data,
    //         firstThreeActSites: data.length > this.maxAlarmSitesDisplay ? data.slice(0, this.maxAlarmSitesDisplay) : data
    //       });
    //       console.log('alarm socket data ', data);
    //     });
    // }
  }


  componentDidMount() {
    let user = this.state.loggedInUser;
    let theme = localStorage.getItem('ThemeSelected');

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

    if (theme) {
      console.log("addThemetoBody", theme)
      util.addThemetoBody(`theme-${theme.toLowerCase()}`);
      this.props.dispatch(Obj[`theme-${theme.toLowerCase()}`]());
    }
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.userLogOut !== this.props.userLogOut) {
      const { data, isFetching } = nextProps.userLogOut;
      if (!isFetching) {
        if (data && data.success) {
          if (data.message == 'Logout success') {
            console.log('Logging out... redirecting to login page');
            localStorage.clear();
            window.location = '/';
            return;
          }
        }
      }
    }
    if (nextProps.screenDetails !== this.props.screenDetails) {
      const { data } = nextProps.screenDetails;
      this.state.screenData = data;
    }
    if ((nextProps['storesData'] && nextProps['storesData'] !== this.props['storesData'])) {
      const { data, isFetching } = nextProps['storesData'];
      if (!isFetching && data) {
        let storeChangeValues = this.props.storeChange;
        this.setState({ storeData: data.stores, cameraData: data.data });
        this.props.dispatch(storeChange({ data: storeChangeValues && storeChangeValues.data && storeChangeValues.data.length > 0 ? storeChangeValues.data : data.data }));
      }
    }
  }

  deleteCookie = (cname, value, days) => {
    if (days) {
      var date = new Date();
      date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
      var expires = "; expires=" + date.toGMTString();
    }
    else var expires = "";
    document.cookie = cname + "=" + value + expires + "; path=/";
  }

  onLogout() {
    let loggedData = utils.getScreenDetails(this.state.loggedInUser, '', consts.LoggedOut);
    this.props.dispatch(saveActivityLog.request({ action: 'save', data: loggedData }));
    localStorage.clear();
    this.deleteCookie('user_sid', "", -1);
    this.props.dispatch(userLogOut.request({}))
    localStorage.removeItem('user_client')
  }

  onChangePassword() {
    this.context.router.history.replace('/changePassword');
  }

  onFullScreen = () => {
    const { isFull } = this.state;
    if (isFull) {
      util.exitFullScreen(document);
    } else {
      util.requestFullscreen(document.documentElement);
    }
    this.setState({ isFull: !this.state.isFull });
  }

  handleChange = (selectedOption) => {
    this.setState({ selectedOption });
  }

  changeToDark = () => {
    let user = util.getLoggedUser();
    util.addThemetoBody('theme-dark');
    let loggedData = utils.getScreenDetails(this.state.loggedInUser, '', consts.ThemeText + consts.Theme["Dark"]);
    this.props.dispatch(saveActivityLog.request({ action: 'save', data: loggedData }));
    this.props.dispatch(changeThemeToDark());
    localStorage.setItem('ThemeSelected', 'Dark');
    let values = { theme: 'Dark' }
    this.props.dispatch(updateUser.request({ action: 'update', data: values, userForm: "true" }, user._id));
  };

  changeToDark2 = () => {
    let user = util.getLoggedUser();
    util.addThemetoBody('theme-dark2');
    let loggedData = utils.getScreenDetails(this.state.loggedInUser, '', consts.ThemeText + consts.Theme["Dark2"]);
    this.props.dispatch(saveActivityLog.request({ action: 'save', data: loggedData }));
    this.props.dispatch(changeThemeToDark2());
    localStorage.setItem('ThemeSelected', 'Dark2');
    let values = { theme: 'Dark2' }
    this.props.dispatch(updateUser.request({ action: 'update', data: values, userForm: "true" }, user._id));
  };

  changeToLight = () => {
    let user = util.getLoggedUser();
    util.addThemetoBody('theme-light');
    let loggedData = utils.getScreenDetails(this.state.loggedInUser, '', consts.ThemeText + consts.Theme["Light"]);
    this.props.dispatch(saveActivityLog.request({ action: 'save', data: loggedData }));
    this.props.dispatch(changeThemeToLight());
    localStorage.setItem('ThemeSelected', 'Light');
    let values = { theme: 'Light' }
    this.props.dispatch(updateUser.request({ action: 'update', data: values, userForm: "true" }, user._id));
  };

  changeToBacardi = () => {
    let user = util.getLoggedUser();
    util.addThemetoBody('theme-bacardi');
    let loggedData = utils.getScreenDetails(this.state.loggedInUser, '', consts.ThemeText + consts.Theme["Bacardi"]);
    this.props.dispatch(saveActivityLog.request({ action: 'save', data: loggedData }));
    this.props.dispatch(changeThemeToBacardi());
    localStorage.setItem('ThemeSelected', 'Bacardi');
    let values = { theme: 'Bacardi' }
    this.props.dispatch(updateUser.request({ action: 'update', data: values, userForm: "true" }, user._id));
  };

  changeToCocacola = () => {
    let user = util.getLoggedUser();
    util.addThemetoBody('theme-cocacola');
    let loggedData = utils.getScreenDetails(this.state.loggedInUser, '', consts.ThemeText + consts.Theme["Coca-Cola"]);
    this.props.dispatch(saveActivityLog.request({ action: 'save', data: loggedData }));
    this.props.dispatch(changeThemeToCocacola());
    localStorage.setItem('ThemeSelected', 'CocaCola');
    let values = { theme: 'CocaCola' }
    this.props.dispatch(updateUser.request({ action: 'update', data: values, userForm: "true" }, user._id));
  };

  changeToStarbucks = () => {
    let user = util.getLoggedUser();
    util.addThemetoBody('theme-starbucks');
    let loggedData = utils.getScreenDetails(this.state.loggedInUser, '', consts.ThemeText + consts.Theme["Starbucks"]);
    this.props.dispatch(saveActivityLog.request({ action: 'save', data: loggedData }));
    this.props.dispatch(changeThemeToStarbucks());
    localStorage.setItem('ThemeSelected', 'Starbucks');
    let values = { theme: 'Starbucks' }
    this.props.dispatch(updateUser.request({ action: 'update', data: values, userForm: "true" }, user._id));
  };

  changeToHanwha = () => {
    let user = util.getLoggedUser();
    util.addThemetoBody('theme-hanwha');
    let loggedData = utils.getScreenDetails(this.state.loggedInUser, '', consts.ThemeText + consts.Theme["Hanwha"]);
    this.props.dispatch(saveActivityLog.request({ action: 'save', data: loggedData }));
    this.props.dispatch(changeThemeToHanwha());
    localStorage.setItem('ThemeSelected', 'Hanwha');
    let values = { theme: 'Hanwha' }
    this.props.dispatch(updateUser.request({ action: 'update', data: values, userForm: "true" }, user._id));
  };

  changeThemeToGeutebruck = () => {
    this.setState({ themeSelected: 'geutebruck' });
    let user = util.getLoggedUser();
    util.addThemetoBody('theme-geutebruck');
    let loggedData = utils.getScreenDetails(this.state.loggedInUser, '', consts.ThemeText + consts.Theme["Geutebruck"]);
    this.props.dispatch(saveActivityLog.request({ action: 'save', data: loggedData }));
    this.props.dispatch(changeThemeToGeutebruck());
    localStorage.setItem('ThemeSelected', 'Geutebruck');
    let values = { theme: 'Geutebruck' }
    this.props.dispatch(updateUser.request({ action: 'update', data: values, userForm: "true" }, user._id));
  };

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
    this.props.dispatch(getTopSelling.request({ selectedValue: filterData, fromTags: fromTags, fromSites: fromSites, page: 1, pageSize: 5, sort: 'count', sortDir: 'DESC', timezoneOffset: timezoneOffset }));
    this.props.dispatch(getEventFeed.request({ selectedValue: filterData, fromTags: fromTags, fromSites: fromSites, page: 0, pageSize: 5, populate: "", sort: undefined, sortDir: undefined, filter: {}, Category: [], NoCategory: [], combos: '', selectedOptionVal: {}, isFromEventFeed: true }));
    this.props.dispatch(getCameraClipData.request({ selectedValue: filterData, fromTags: fromTags, fromSites: fromSites, page: 0, pageSize: 5, populate: "", sort: undefined, sortDir: undefined, filter: {}, Category: [], NoCategory: [], combos: '', selectedOptionVal: {}, isFromEventFeed: true }));
  }

  truncate = (input) => input && input.length > 15 ? `${input.substring(0, 15)}...` : input;

  ActivatedSiteString = () => {
    const { activatedSites, firstThreeActSites } = this.state;
    if (activatedSites.length && activatedSites.length > this.maxAlarmSitesDisplay) {
      let sites = firstThreeActSites.join(", ");
      let count = activatedSites.length - this.maxAlarmSitesDisplay;
      return firstThreeActSites.join(", ") + ' and ' + count + ' more ';
    } else return firstThreeActSites.join(", ") + ' ';
  }


  render() {
    let path = window.location.href;
    let separatewindow = path.split("/")[4];

    // eslint-disable-next-line
    const { isFull, selectedOption, storeData, disableSelectSite, loggedInUser, ThemesDropdown, activatedSites, firstThreeActSites } = this.state,
      { selectedStore, selectedTag } = this.props.storeChange;
    const { theme, userLogOut, storesData } = this.props;
    let user = loggedInUser, clientLogo = null;
    let selectedStoreStorage = localStorage.getItem('SelectedStore');
    if (selectedStoreStorage && JSON.parse(selectedStoreStorage).length == 0) {
      let val = [{ label: 'All', value: 'All' }]
      localStorage.setItem('SelectedStore', JSON.stringify(val))
    }
    let userName = user && user.firstName.toUpperCase() + " " + user.lastName.toUpperCase();
    let version = "/?v=" + moment().format(util.dateTimeFormat);
    let desktopLogo = url.CLIENT_THUMBNAIL + "/100/logo.png" + version;
    // let desktopLogo = url.CLIENT_THUMBNAIL + (theme.mobileLogo == 'Hanwha.jpg' ? "/130/" : "/100/") + theme.mobileLogo + version;
    //let desktopLogo = TargetImg
    let smallLogo = desktopLogo;
    let userProfileImage;
    if (user && user.clientId && user.clientId.logo) {
      clientLogo = user.clientId.logo;
      desktopLogo = url.CLIENT_THUMBNAIL + (user.clientId.logo == 'Hanwha.jpg' ? "/130/" : "/100/") + user.clientId.logo;
      smallLogo = desktopLogo;
    // } else {
    //   desktopLogo = require('./../../assets/img/realwave_logo.png');
    //   smallLogo = desktopLogo;
    }

    // let ActivatedSiteString =  ;
    // let ActivatedSiteString =  activatedSites.length && activatedSites.length > this.maxAlarmSitesDisplay ? firstThreeActSites.join(", ") + 'and ' + activatedSites.length-this.maxAlarmSitesDisplay + ' more' : firstThreeActSites.join(", ") ;
    // console.log('ActivatedSiteString', ActivatedSiteString)

    if (user && user.userProfile) {
      console.log('userProfileuserProfileuserProfile', user)
      userProfileImage = `${utils.serverUrl}/UserProfile/${user.userProfile}`;
    }

    console.log('userrrrrrprofileimage', user, userProfileImage)

    let storeCombo = [{ value: "All", label: "All" }], tags = [];
    storeData && storeData.forEach(function (data) {
      let storeName = data && data.name || '',
        currentStoreTags = data.tags;

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
    let isMultiplePlayback = window.location.href.indexOf('timelineWindow') > -1;
    let isIpad = utils.isIpad;
    let isPortrait = window.innerHeight > window.innerWidth;
    return (
      <React.Fragment>
        {!isMultiplePlayback && <><LoadingDialog isOpen={userLogOut && userLogOut.isFetching} />
          <div className="mobile-logo">
            <img src={theme.className == "" ? minLogo : smallLogo} />
          </div>
          <span onClick={(e) => {
            utils.toggleMenu(false);
            setTimeout(() => {
              this.props.dispatch(screenResizedReducer({ updateDiv: consts.UpdateDivVal, isOpen: false }));
            }, 700);

          }}><AppSidebarToggler className="d-md-down-none" display="lg" /></span>


          <AppNavbarBrand href={"#/dashboard"}
            full={{ src: desktopLogo, width: (clientLogo == 'Starbucks.png' ? 60 : clientLogo == 'Hanwha.jpg' ? 130 : 100), height: 40, alt: 'Realwave' }}
            minimized={{ src: smallLogo, width: (clientLogo == 'Starbucks.png' ? 60 : clientLogo == 'Hanwha.jpg' ? 130 : 105), height: 40, alt: 'Realwave' }}
          />
        </>
        }
        {!isIpad && <Nav className="ml-auto cameracardText textConvert app-Breadcrumb mr-auto" navbar>
          <NavItem className="px-3 align-middle breadcrumb-Content">
            <Breadcrumbs screenData={this.state.screenData} />
          </NavItem>
        </Nav>
        }

        {/* diplaying sites with activated alarm starts */}

        { activatedSites.length ? <span title={activatedSites.join("\n")} style={{ backgroundColor: "#ffa500f0", padding: "10px", color: "#fff" }}>
          {this.ActivatedSiteString()}
          <i class="fa fa-bell"></i></span> : ''}

        {/* diplaying sites with activated alarm ends */}

        <Nav className="ml-auto app-header-Right-Panel" navbar>
          {!isMultiplePlayback && <div className="customSeparator">
            <div onClick={(e) => {
              utils.toggleMenu(true);
              setTimeout(() => {
                this.props.dispatch(screenResizedReducer({ updateDiv: consts.UpdateDivVal, isOpen: true }));
              }, 700);

            }} >
              <AppSidebarToggler className="d-lg-none" display="md" mobile />
            </div>
            <div onClick={(e) => {
              utils.toggleMenu(false);
              setTimeout(() => {
                this.props.dispatch(screenResizedReducer({ updateDiv: consts.UpdateDivVal, isOpen: true }));
              }, 700);
            }} >
            </div>
          </div>
          }
          {!isMultiplePlayback && <i className="fa icon2-location-icon cameracardText headerMarker" aria-hidden="true" />}
          {!isMultiplePlayback && <Select className="headerSiteDropdown siteSeparator"
            isDisabled={selectedTag && selectedTag.length > 0}
            isMulti={true}
            styles={customStyles}
            isClearable={true}
            onChange={(val) => this.onChangeStore(val, storesData)}
            required={true}
            options={storeCombo}
            value={JSON.parse(selectedStoreStorage) || selectedStore || selectedOption}
            placeholder="Select Site"
          />}
          {/* <div className="customLeftSeparator customSeparator">
            <SearchFilter />
          </div> */}
          {!isMultiplePlayback && <SearchFilter />}


          <AppHeaderDropdown direction="down">
            {separatewindow != 'timelineWindow' &&

              <DropdownToggle nav className="userLogo">
                {
                  (userProfileImage && separatewindow != 'timelineWindow') ? (
                    <div className="avatar">
                      <img className="img-avatar" src={userProfileImage} alt={userName.charAt(0)}></img>
                    </div>
                  ) : (separatewindow != 'timelineWindow') ? <i className="fa fa-user-circle-o userAccountLogo" /> : ""
                }
              </DropdownToggle>}
            <DropdownMenu >
              {utils.isIOS() && <DropdownItem header><i>{userName}</i></DropdownItem>}
              {!utils.isIOS() && <DropdownItem className={`dropdown-header-${this.state.themeSelected}`}>{`Hi, ${this.truncate(userName)}`}</DropdownItem>}
              <DropdownItem><i className="fa fa-user"></i> Profile*</DropdownItem>
              <DropdownItem onClick={() => this.onChangePassword()}><i className="fa fa-key"></i> Change Password</DropdownItem>
              <DropdownItem onClick={this.onLogout}><i className="fa fa-lock"></i> Logout</DropdownItem>
              <DropdownItem className={`dropdown-header-${this.state.themeSelected}`}><b>Themes</b></DropdownItem>
              {ThemesDropdown.length ? ThemesDropdown.map(theme1 => {
                return (
                  <DropdownItem onClick={() => this[theme1.function]()}>{theme1.name}</DropdownItem>
                );
              }) : null}
              {/* <DropdownItem onClick={() => this.changeToDark()}>Dark</DropdownItem>
              {/* <DropdownItem onClick={() => this.changeToDark2()}>Dark 2</DropdownItem> */}
              {/*<DropdownItem onClick={() => this.changeToLight()}>Light</DropdownItem>
              <DropdownItem onClick={() => this.changeToBacardi()}>Bacardi</DropdownItem>
              <DropdownItem onClick={() => this.changeToCocacola()}>Coca Cola</DropdownItem>
              <DropdownItem onClick={() => this.changeToStarbucks()}>Starbucks</DropdownItem>
              <DropdownItem onClick={() => this.changeToHanwha()}>Hanwha</DropdownItem>
              <DropdownItem onClick={() => this.changeThemeToGeutebruck()}>Geutebruck</DropdownItem> */}
            </DropdownMenu>
          </AppHeaderDropdown>
          {/* <div className="app-header-username">
            {!utils.isIOS() && userName}
          </div> */}

          <NavItem className="cursor" onClick={() => this.onFullScreen()}>
            <i title={isFull ? "Exit Full Screen" : "Full Screen"} className={"fa " + (isFull ? "fa-compress" : "icon2-full_screen-icon")} />
          </NavItem>
        </Nav>
        {isIpad && <Nav className="ml-auto cameracardText textConvert app-Breadcrumb mr-auto" navbar>
          <NavItem className="px-3 align-middle breadcrumb-Content">
            <Breadcrumbs screenData={this.state.screenData} />
          </NavItem>
        </Nav>
        }
      </React.Fragment>
    );
  }
}
DefaultHeader.contextTypes = {
  router: PropTypes.object.isRequired
};
DefaultHeader.propTypes = propTypes;
DefaultHeader.defaultProps = defaultProps;

function mapStateToProps(state, ownProps) {
  return {
    universalSearch: state.universalSearch,
    routeChange: state.routeChange,
    theme: state.theme,
    userLogOut: state.userLogOut,
    screenDetails: state.screenDetails,
    storesData: state.storesData,
    storeChange: state.storeChange,
    screenResizedReducer: state.screenResizedReducer,
    updateUser: state.updateUser,
    userData: state.userData
  };
}
var DefaultHeaderModule = connect(mapStateToProps)(DefaultHeader);
export default DefaultHeaderModule;

