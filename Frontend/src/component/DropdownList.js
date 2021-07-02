import React, { PureComponent } from 'react';
import { Dropdown, DropdownMenu, DropdownItem, DropdownToggle } from 'reactstrap';
import utils from '../Util/Util';
class DropdownList extends PureComponent {
    constructor(props) {
        super(props);
    }

    renderDropdownOption = (options, index) => {
        return options.map((val, i) => {
            return <DropdownItem key={i} onClick={() => val.onClick ? val.onClick(this.props.row) : null}><i className={val.icon}></i>{val.name}</DropdownItem>
        })
    }

    render() {
        const { renderDropdownOption } = this;
        const { isDropdownOpen, Dropdownoggle, index, options, className, value } = this.props;
        let { iconClass } = this.props;
        iconClass = !iconClass ? "fa fa-ellipsis-v dropdown-list" : iconClass;
        let statusValue = !value ? "No Review" : value;
        return (
            <Dropdown isOpen={isDropdownOpen == index} toggle={() => Dropdownoggle(index)} className={className}>
                <DropdownToggle tag="a">
                    {utils.clipStatusText(statusValue)}
                </DropdownToggle>
                <DropdownMenu>
                    {
                        renderDropdownOption(options, index)
                    }
                </DropdownMenu>
            </Dropdown>
        );
    }

}
export default DropdownList;