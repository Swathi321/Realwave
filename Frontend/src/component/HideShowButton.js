import React, { Component } from 'react';
import { UncontrolledDropdown, DropdownToggle, DropdownMenu, Row, Col, Form, FormGroup, Label, Input, DropdownItem } from 'reactstrap';
import PropTypes from 'prop-types';

class HideShowButton extends Component {
  constructor(props) {
    super(props);
    this.state = {
      columns: this.props.columns,
      oldColumnData: null
    };
  }

  onApplyClick() {
    const { columns } = this.state
    this.setState({ oldColumnData: null })
    this.props.showHideColumns(columns);
  }

  onClickDropdown(item) {
    const { columns, oldColumnData } = this.state;
    if (oldColumnData) {
      oldColumnData.forEach(function (data) {
        let index = columns.findIndex(e => e.name == data.name);
        if (index != -1) {
          columns[index].hidden = data.hidden;
        }
      }, this)
      oldColumnData = null;
    }
  }

  onShowHideCheckUncheck(value, item) {
    const { columns } = this.state;
    for (var i = 0; i < columns.length; i++) {
      if (columns[i].name == item) {
        columns[i].hidden = !columns[i].hidden;
      }
    }
    this.setState({ columns: columns });
  }

  render() {
    var me = this;
    const { columns } = me.state;
    for (var i = 0, len = columns.length; i < len; i++) {
      if (columns[i]) {
        columns[i].hidden = columns[i].hidden || false;
      }
    }
    return (
      <div className="grid-columnSelection">
        <UncontrolledDropdown >
          <DropdownToggle caret>
            Columns
      </DropdownToggle>
          <DropdownMenu>
            <DropdownItem className="dropDownList" toggle={true} onClick={me.onApplyClick.bind(me)}>
              <center>Apply</center>
            </DropdownItem>
            <Form className={columns.length > 6 ? 'column-filter' : ''}>
              {
                columns.map(
                  function (item, index) {
                    return (
                      <Row key={index} className="hide-show-button-row">
                        <Col className="hide-show-button-col ">
                          <FormGroup check>
                            <Label>
                              <Input type="checkbox" checked={!item.hidden} onClick={me.onShowHideCheckUncheck.bind(me, '', item.name)} readOnly id="checkbox2" />{item.name}
                            </Label>
                          </FormGroup>
                        </Col>
                      </Row>
                    )
                  })
              }
            </Form>
          </DropdownMenu>
        </UncontrolledDropdown>
      </div>);
  }
}

HideShowButton.propTypes = {
  columns: PropTypes.array.isRequired
}
export default HideShowButton;