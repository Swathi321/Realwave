import React, { useEffect, useState } from 'react'
import Grid from '../views/Grid/GridBase'
import { Col, Row } from 'reactstrap';
import LoadingDialog from './LoadingDialog';
import { instance } from "../redux/actions/index";
import api from "../redux/httpUtil/serverApi";


const MonitorIntegrationGrid = (props) => {
    const { StoreData } = props;
    const [SmartDevices, setSmartdevices] = useState([])
    const [columns, setColumns] = useState([


        { key: 'configuredDevice', name: 'Type', width: 50, type: 'string' },
        { key: 'Name', name: 'Label', width: 50, type: 'string', },
        {
            key: 'abc', name: ' ', width: 60, toggle: true, sort: false, type: 'String', export: false, formatter: (props, record, index, scope) =>
                <div className="Healthcursor">
                    <i class="fa fa-pencil fa-2x" style={{ paddingRight: ".5em" }} aria-hidden="true"></i> <i class="fa fa-cog fa-2x" aria-hidden="true" style={{ color: "#0077b7" }}></i>
                </div>
        },

    ])




    useEffect(() => {
        let reqBody = {
            clientId: StoreData && StoreData.clientId,
            storeId: StoreData && StoreData._id
        }
        var bodyFormdata = new FormData();
        bodyFormdata.append('data', JSON.stringify(reqBody))
        let integrationData = []
        instance
            .post(`${api.SITE_SMART_DEVICE}`, bodyFormdata).then(async (res) => {
                console.log("response", res)
                const data = await res.data.data
                if (data) {
                    for (let i = 0; i < data.length; i++) {
                        integrationData.push({
                            Name: data[i].name,
                            configuredDevice: data[i].device.name
                        })
                    }
                    setSmartdevices(integrationData)
                }

            })

    }, [StoreData])
    return (
        <div>
            <LoadingDialog isOpen={false} />
            <div className="grid-wrapper-area">
                <Row>
                    <Col>


                        <Grid
                            columns={columns}
                            autoHeight={true}
                            smartData={SmartDevices}
                            dataProperty={"smartAcco"}
                            columns={columns}
                            autoHeight={true}
                            screen={"Health Monitor"}
                            exportButton={false}
                            height={450}
                            isLoadingdata={true}
                            removeHeader={true}

                        />


                    </Col>
                </Row>
            </div>
        </div>
    )
}
export default MonitorIntegrationGrid
