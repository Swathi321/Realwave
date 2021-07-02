import React, { PureComponent, useState } from 'react'
import Grid from '../views/Grid/GridBase'
import { Col, Row } from 'reactstrap';
import LoadingDialog from './LoadingDialog';
import { cameraRecord } from '../redux/actions/httpRequest';
import utils from '../Util/Util';
import swal from 'sweetalert';


const MonitorCameraGrid = (props) => {
  const { StoreData } = props;
  let loggedUser = utils.getLoggedUser();
  let isAdminRole = loggedUser && loggedUser.roleId.isAdminRole
  const [Columns, setColumns] = useState([{ key: 'status', name: 'Status', width: 70, sort: true, filter: true, type: 'string' },
  {
    key: 'Connected', name: 'Connected', width: 70, type: 'String', export: false, sort: true, formatter: (props, record, index, scope) => {
      return (
        <div className="Healthcursor">
          { record && record.isConnected ? (
            <i className="fa fa-circle text-success fa-2x"></i>
          ) :
            <i className="fa fa-circle text-danger fa-2x"></i>
          }
        </div>
      )
    }
  },
  { key: 'name', name: 'Label', width: 130, sort: true, filter: true },
  {
    key: 'abc', name: ' ', width: 100, toggle: true, sort: false, type: 'String', export: false, formatter: (props, record, index, scope) =>
      <div className="Healthcursor">
        <i class="fa fa-pencil fa-2x" onClick={() => sendToEdit(StoreData, record)} style={{ paddingRight: ".5em" }} aria-hidden="true"></i> <i class="fa fa-cog fa-2x" aria-hidden="true" style={{ color: "#0077b7" }}></i>
      </div>

  },
  ])
  const sendToEdit = (stordata, cameraData) => {
    if (!isAdminRole) {
      return swal({ text: "You are not Authorized", icon: "warning" });
    }
    window.location.replace(`#/admin/site/${stordata._id}/addcamera/${cameraData._id}`)
  }
  let CameraFilters = [{ value: StoreData._id, property: "storeId", type: "string" }];

  return (<div>
    <LoadingDialog isOpen={false} />
    <div className="grid-wrapper-area">
      <Row>
        <Col>
          <Grid
            listAction={cameraRecord}
            dataProperty={"cameraRecord"}
            columns={Columns}
            autoHeight={true}
            screen={"Health Monitor"}
            exportButton={false}
            height={450}
            isLoadingdata={true}
            removeHeader={true}
            filters={CameraFilters}
          />
        </Col>
      </Row>
    </div>
  </div>)
}



export default MonitorCameraGrid;
