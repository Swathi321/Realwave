import React from 'react';
import PropType from 'prop-types';
import { UncontrolledDropdown, DropdownToggle, DropdownMenu, DropdownItem } from 'reactstrap';

class Dropdown extends React.Component {
  renderOption(item, index) {
    return (
      <DropdownItem key={index} disabled={item.disabled} onClick={() => this.props.onSelect(item)} >{item.label}</DropdownItem>
    )
  }

  render() {
    const { options, title } = this.props;
    return (
      <UncontrolledDropdown>
        <DropdownToggle caret>{title}</DropdownToggle>
        <DropdownMenu>
          {options && options.length > 0 && options.map(this.renderOption, this)}
        </DropdownMenu>
      </UncontrolledDropdown>
    )
  }
}

Dropdown.propTypes = {
  onSelect: PropType.func.isRequired,
  options: PropType.array.isRequired,
  title: PropType.string.isRequired
}

export default Dropdown;