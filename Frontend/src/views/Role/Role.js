import React, { PureComponent } from "react";
import PropTypes from "prop-types";
import Grid from "../Grid/GridBase";
import { roleData } from "../../redux/actions/httpRequest";
import { connect } from "react-redux";
import { Col, Row } from "reactstrap";
import { clearCreateRoleData, clearRoleData,clearUpdatedRoleData } from "../../redux/actions";

export class Role extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      columns: [
        { key: "name",
          name: "Name",
          width: 250,
          filter: true,
          sort: true,
          type: "string"
        },
        {
          key: "description",
          name: "Description",
          width: 750,
          filter: true,
          sort: true,
          type: "string",
        },
      ],
      roleData:[],
      page: localStorage.getItem('currentPage')
    };

    this.onRowClick = this.onRowClick.bind(this);
    this.beforeRender = this.beforeRender.bind(this);
    this.alreadyclicked = false;
    this.alreadyclickedTimeout = null;
    this.cleanSavedRolesData()
  }

  onRowClick = (index, record) => {
    console.log(record);
    if (this.alreadyclicked) {
      this.alreadyclicked = false;
      this.alreadyclickedTimeout && clearTimeout(this.alreadyclickedTimeout);
      this.context.router.history.push({pathname:"/admin/role/roleForm/" + record._id,state:this.state.roleData});
    } else {
      this.alreadyclicked = true;
      this.alreadyclickedTimeout = setTimeout(() => {
        this.alreadyclicked = false;
      }, 300);
    }
  };
   cleanSavedRolesData=()=>{
      this.props.dispatch(clearRoleData())  
      this.props.dispatch(clearCreateRoleData())  
      this.props.dispatch(clearUpdatedRoleData())  
  }
 
  addNew = () => {
    this.context.router.history.push('/admin/role/addForm');
  };

  getStoreName(storeData) {
    let name = "";
    storeData.forEach((element) => {
      name += ", " + element.name;
    });
    if (name[0] == ",") {
      name = name.substring(1);
    }
    return name;
  }

  beforeRender(data) {
    console.log(data);
    let customData = [];
    if (data && data.length > 0) {
      data.forEach((item) => {
        let storeData = item.storeId;
        item.storeId =
          storeData instanceof Array ? this.getStoreName(storeData) : storeData;
        customData.push(item);
      });
    }
    console.log(customData);
    if(customData.length>0){
      console.log(this.state.roleData);
      if(this.state.roleData.length==0)
      this.setState({
        roleData:customData
      })
    }
    
    return customData;
  }

  componentWillMount() { 
    localStorage.removeItem("currentPage");
  }

  setPage = (page) => {
    localStorage.setItem('currentPage', page)
    this.setState({
      page: page
    })
  }

  render() {
    const { columns, loadedData, page } = this.state;
    let { listAction, actionName, sortColumn, sortDirection } = this.props;
    return (
      <div className="grid-wrapper-area">
        <Row>
          <Col>
            <Grid
              beforeRender={this.beforeRender}
              loadedData={loadedData}
              listAction={listAction}
              dataProperty={actionName}
              columns={columns}
              filename={"Role"}
              autoHeight={true}
              defaultSort={{
                sortColumn: sortColumn,
                sortDirection: sortDirection,
              }}
              localPaging={this.props.localPaging || false}
              onRowClick={this.onRowClick}
              exportButton={true}
              add={this.addNew}
              screen={"Role"}
              screenPathLocation={this.props.location}
              height={450}
              pageProps={page}
              setPage={this.setPage}
            />
          </Col>
        </Row>
      </div>
    );
  }
}

Role.defaultProps = {
  listAction: roleData,
  actionName: "roleData",
};

Role.contextTypes = {
  router: PropTypes.object.isRequired,
};

function mapStateToProps(state, ownProps) {
  console.log(state,"statetetet");
  return {
    clientData: state.clientData,
  };
}

var RoleModule = connect(mapStateToProps)(Role);
export default RoleModule;
