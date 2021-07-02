import React from "react";
import moment from "moment";
import { Button } from "reactstrap";
import { DatePicker } from "antd";
import util from '../../Util/Util';

export default class DateFilter extends React.Component {
  constructor(props) {
    super(props);
    this.onChangeDateFilter = this.onChangeDateFilter.bind(this);
  }

  onChangeDateFilter(columnKey, value) {
    if (this.props.onChange instanceof Function)
      this.props.onChange(value);
  }

  render() {
    const { onChangeDateFilter, props } = this;
    const { column, filterProps } = props;
    const { selectedKeys, confirm, clearFilters } = filterProps;
    const dateFormat = util.dateFormat;
    const value = selectedKeys.length > 0 && selectedKeys[0] != "" ? moment(selectedKeys[0], dateFormat) : null;
    return (
      <div className="custom-filter-dropdown">
        <DatePicker defaultValue={value} format={dateFormat} value={value} onChange={onChangeDateFilter} />
        <Button type="primary" onClick={props.handleSearch(column, selectedKeys, confirm)}>Search</Button>
        <Button onClick={props.handleReset(column, clearFilters)}>Reset</Button>
      </div>
    );
  }
}
