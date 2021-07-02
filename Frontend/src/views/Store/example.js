import React, { Component } from 'react';
// import { Collapse, Card, CardHeader, CardBody } from 'reactstrap';
import { Collapse,  } from 'antd';


const { Panel } = Collapse;

  function callback(key) {
    console.log(key);
  }



class Example extends Component {

    render() {

      return (
        <div className="container">

          {/* <Collapse defaultActiveKey={["1"]} onChange={callback} >
              <Panel header="Basic Information" key="1">


              </Panel>
              <Panel header="Media Server" key="2">

              </Panel>
              <Panel header="Recording" key="3">
                <p>bye</p>
              </Panel>
            </Collapse> */}

{/* <Space direction="vertical"> */}

    <Collapse collapsible="header" defaultActiveKey={['1']}>
      <Panel header="Basic Information" key="1">
      <p>hiii</p>
      </Panel>
    </Collapse>
    <Collapse collapsible="disabled">
      <Panel header="Media Server" key="1">
      <p>helo</p>
      </Panel>
    </Collapse>
    {/* </Space> */}

          </div>
      );
    }
}

export default Example;
