import React, { PureComponent } from 'react'
import PropTypes from 'prop-types';
import Grid from '../Grid/GridBase';
import { clientData } from '../../redux/actions/httpRequest';
import { connect } from 'react-redux';
import { Col, Row } from 'reactstrap';
import utils from './../../Util/Util';

export class Clients extends PureComponent {
  constructor(props) {
    super(props)

    let ShowAddBtn = utils.ifPermissionAssigned('functionId', 'Add Clients');
   
    this.state = {
      ShowAddBtn: ShowAddBtn,
      columns: [
        { key: 'name', name: 'Name', width: 350, filter: true, sort: true, type: 'string' },
        { key: 'clientType', name: 'Client Type', width: 450, filter: true, sort: true, type: 'string',
        formatter: ( props, record ) => record.clientType == 'thirdparty' ?  <div>{record.clientType} {record.installerId ? "- " + record.installerId.name : ''}</div> : <div>{record.clientType}</div>},
        { key: 'status', name: 'Status', width: 250, filter: true, sort: true }
      ],
      page: localStorage.getItem("currentPage")
    }

    localStorage.removeItem('ClientID');
    localStorage.removeItem('ClientDetails');
    
    this.onRowClick = this.onRowClick.bind(this);
    this.beforeRender = this.beforeRender.bind(this);
    this.alreadyclicked = false;
    this.alreadyclickedTimeout = null;
  }

  onRowClick = (index, record) => {
    if (this.alreadyclicked) {
      this.alreadyclicked = false;
      localStorage.setItem('ClientID', record._id);
      localStorage.setItem('ClientDetails', JSON.stringify(record));

      this.alreadyclickedTimeout && clearTimeout(this.alreadyclickedTimeout);
      utils.onNavigate({
        props: this.props,
        type: "push",
        route: '/admin/clients/Profile/' + record._id
      })
      //this.context.router.history.push('/admin/clients/clientForm/' + record._id);
    }
    else {
      this.alreadyclicked = true;
      this.alreadyclickedTimeout = setTimeout(() => {
        this.alreadyclicked = false;
      }, 300);
    }
  }

  addNew = () => {
    utils.onNavigate({
      props: this.props,
      type: "push",
      route: '/admin/clients/Profile/' + 0
    })
    //this.context.router.history.push('/admin/clients/clientForm/' + 0);
  }

  getStoreName(storeData) {
    let name = '';
    storeData.forEach(element => {
      name += ", " + element.name;
    });
    if (name[0] == ",") {
      name = name.substring(1);
    }
    return name;
  }

  beforeRender(data) {
    let customData = [];
    if (data && data.length > 0) {
      data.forEach(item => {
        let storeData = item.storeId;
        item.storeId = storeData instanceof Array ? this.getStoreName(storeData) : storeData;
        customData.push(item);
      });
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
    const { columns, loadedData, ShowAddBtn, page } = this.state;
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
              columns={columns}
              autoHeight={true}
              filename={"Client"}
              populate='installerId'
              defaultSort={{ sortColumn: sortColumn, sortDirection: sortDirection }}
              localPaging={this.props.localPaging || false}
              onRowClick={this.onRowClick}
              exportButton={true}
              add={ShowAddBtn ? this.addNew : false}
              screen={"Client"}
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

Clients.defaultProps = {
  listAction: clientData,
  actionName: 'clientData'
}

Clients.contextTypes = {
  router: PropTypes.object.isRequired
};

function mapStateToProps(state, ownProps) {
  return {
    clientData: state.clientData
  };
}

var ClientsModule = connect(mapStateToProps)(Clients);
export default ClientsModule;
