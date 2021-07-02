import React, { PureComponent, useEffect, useState } from 'react'
import { Col, Row, Collapse, Card, CardHeader } from 'reactstrap';

import { connect } from 'react-redux';
import HealthMonitor from '../component/HealthMonitor'
import { storeData } from '../redux/actions/httpRequest';
import util from '../Util/Util';
import store from '../redux/store';


const HealthMonitorCollapse = (props) => {
  const [filteredData, setFilteredData] = useState([])

  const { storesData, storeChange } = props;
  const data = storesData && storesData.data && storesData.data.stores;
  const sitesName = data;
  useEffect(() => {

    const { storesData, storeChange } = props;
    const data = storesData && storesData.data && storesData.data.stores;
    const sitesName = data;
    const labelName = storeChange.selectedStore[0].label;
    let sites = [];

    if (labelName != "All") {
      for (var i = 0; i < storeChange.selectedStore.length; i++) {
        let filterData = data && data.length > 0 && data.filter((item) =>
          item._id == storeChange.selectedStore[i].value
        );
        for (let index = 0; index < filterData.length; index++) {
          const element = filterData[index];
          sites.push(element);
        }
      }

      setFilteredData([]);
      setTimeout(() => {
        setFilteredData(sites);
      }, 500);
    }
    else {
      if (sitesName) {
        setFilteredData([]);
        setTimeout(() => {
          setFilteredData(sitesName);
        }, 500);

      }

    }

  }, [storesData, storeChange])
  return (
    <>
      <Card className="ml-3 mr-3 mt-2">
        {
          filteredData && filteredData.length && filteredData.length > 0 && <HealthMonitor sites={filteredData} />
        }
      </Card>

    </>
  )
}

function mapStateToProps(state, ownProps) {
  return {
    storeChange: state.storeChange,
    storesData: state.storesData,


  };
}
export default connect(mapStateToProps)(HealthMonitorCollapse)
