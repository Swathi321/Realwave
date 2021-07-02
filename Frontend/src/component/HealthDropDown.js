import React, { useState } from 'react';
import { Col, Input } from 'reactstrap';

const Example = (props) => {
    const [dropdownOpen, setDropdownOpen] = useState(false);

    const options = [{
        name: "AllSups ll22 Justin",
        id: "1"
    }, {
        name: "Option 2",
        id: "2"
    }, {
        name: "Option 3",
        id: "3"
    }]

    return (
        <>
            <Col >
                <Input className="PersonInput" type="select" name="locationId">
                    {/* <option value="" selected>Na</option> */}
                    {options.map((item) => {
                        return (
                            <option value={item.id} >{item.name}</option>
                        )
                    })}
                </Input>
            </Col>
            <Col>
                <Input className="PersonInput mb-4" type="select" name="locationId">
                    {/* <option value="" selected>Na</option> */}
                    {options.map((item) => {
                        return (
                            <option value={item.id} >{item.name}</option>
                        )
                    })}
                </Input>
            </Col>
        </>
    );
}

export default Example;