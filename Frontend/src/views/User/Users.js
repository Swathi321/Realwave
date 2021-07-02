import React, { PureComponent, Fragment } from 'react'
import PropTypes, { string } from 'prop-types';
import Grid from '../Grid/GridBase';
import { userData } from '../../redux/actions/httpRequest';
import { connect } from 'react-redux';
import { Col, Row } from 'reactstrap';
import util from '../../Util/Util';
import url from './../../redux/httpUtil/serverApi';


export class Users extends PureComponent {
  constructor(props) {
    super(props)
    let str=""
    this.state = {

      columns: [
        {
          key: 'userProfile', name: 'Profile', align: 'center', width: 65, formatter: (props, user, data) => {
            console.log('userdataaa 20000', user)
            return(
            <>
               {user.userProfile ?
                <div className="avatar">
                  {/* <img className="img-avatar" src={`${url.USER_PROFILE}/50/50/${user.userProfile}/${Date.now()}`} alt={user.firstName.charAt(0).toUpperCase()}></img> */}
                  <img className="img-avatar" style={{width: "80%", height: "80%"}} src={`${util.serverImageUrl}/UserProfile/${user.userProfile}`} alt={user.firstName.charAt(0).toUpperCase()}></img> 
                </div> : < i className="fa fa-user-circle-o gridUserAccountLogo" />
              }
            </>
          )}
        },
        { key: 'firstName', name: 'First Name', width: 170, filter: true, sort: true, type: 'string' },
        { key: 'lastName', name: 'Last Name', width: 170, filter: true, sort: true, type: 'string' },
        { key: 'email', name: 'Email', width: 200, filter: true, sort: true, type: 'string' },
        // { key: 'gender', name: 'Gender', width: 140, filter: true, sort: true, type: 'string' },
        //  { key: 'userRole', name: 'User Role', width: 125, filter: true, sort: true },
        { key: 'roleId', name: 'User Role', width: 125 },
        { key: 'storeId', name: 'Sites', width: 250}
        // { key: 'storeId', name: 'Sites', width: 250,formatter: (props, user, data) => (
        // console.log(user,data,props)
        // )}
      ],
      page: localStorage.getItem("currentPage")
    }
  //   <>
  //   {user.storeId.length>0 ?
  //     <div>
  //       {/* {
  //        user.storeId.forEach(x=>{
  //           str=x+","+str
  //           console.log(str);
  //         })
  //       }  */}
  //       <span>hello</span>
  //     </div> : <span>No Data </ span>
  //   }
  // </>
    this.onRowClick = this.onRowClick.bind(this);
    this.beforeRender = this.beforeRender.bind(this);
    this.alreadyclicked = false;
    this.alreadyclickedTimeout = null;
  };

  componentWillMount() {
    localStorage.removeItem("currentPage");
  }
  
  componentWillReceiveProps(nextProps) {
    util.UpdateDataForGrid(this, nextProps);
    util.updateGrid(this, nextProps, 'user');
  }

  onRowClick = (index, record) => {
    if (this.alreadyclicked) {
      this.alreadyclicked = false;
      this.alreadyclickedTimeout && clearTimeout(this.alreadyclickedTimeout);
      this.context.router.history.push('/admin/users/userForm/' + record._id);
    }
    else {
      this.alreadyclicked = true;
      this.alreadyclickedTimeout = setTimeout(() => {
        this.alreadyclicked = false;
      }, 300);
    }
  }

  addNew = () => {
    // this.context.router.history.push('/admin/users/userForm/' + 0);
    console.log(this.context);
    this.context.router.history.push('/admin/users/addUserForm');

  }

  getStoreName(storeData) {
    var loggedUser = util.getLoggedUser();
    var storeids = loggedUser.storeId;
    let name = '', filteredData;

    if (loggedUser.roleId._id !== util.adminRoleId) {
      storeids.forEach(rec => {
        filteredData = storeData.filter(function (obj) {
          return obj.name !== ""
          //return obj.id === rec.id;
        });
      });

      filteredData && filteredData.length && filteredData.forEach(element => {
        name += ", " + element.name;
        if (name[0] == ",") {
          name = name.substring(1);
        }
      });
    } else {
      storeData.forEach(element => {
        name += ", " + element.name;
      });
      if (name[0] == ",") {
        name = name.substring(1);
      }
    }
    return name;
  }

  getRoleName(roleData) {
    return roleData.name || roleData;
  }

  beforeRender(data) {
    let customData = [];
    if (data && data.length > 0) {
      data.forEach(item => {
        let storeData = item.storeId;
        let roleData = item.roleId;
        item.storeId = storeData instanceof Array ? this.getStoreName(storeData) : storeData;
        item.roleId = roleData ? this.getRoleName(roleData) : roleData;
        customData.push(item);
      });
    }
    return customData;
  }

  setPage = (page) => {
    localStorage.setItem('currentPage', page)
    this.setState({
      page: page
    })
  }

  render() {
    const { columns, loadedData, page } = this.state;
    let { listAction, actionName, sortColumn, sortDirection } = this.props
    return (
      <div className="grid-wrapper-area">
        <Row>
          <Col>
            <Grid
              beforeRender={this.beforeRender}
              loadedData={loadedData}
              listAction={listAction}
              dataProperty={actionName}
              filename={"User"}
              screen={"user"}
              populate={'storeId roleId'}
              columns={columns}
              autoHeight={true}
              defaultSort={{ sortColumn: sortColumn, sortDirection: sortDirection }}
              localPaging={this.props.localPaging || false}
              onRowClick={this.onRowClick}
              exportButton={true}
              add={this.addNew}
              screenPathLocation={this.props.location}
              height={450}
              pageProps={page}
              setPage={this.setPage}
            />
          </Col>
        </Row>
      </div>
    )
  }
}

Users.defaultProps = {
  listAction: userData,
  actionName: 'userData',
}
// .request({filters:[],poulate:"roleId storeId"})
Users.contextTypes = {
  router: PropTypes.object.isRequired
};
function mapStateToProps(state, ownProps) {
  console.log(state);
  return {
    userData: state.userData,
    storeChange: state.storeChange
  };
}

var UsersModule = connect(mapStateToProps)(Users);
export default UsersModule;