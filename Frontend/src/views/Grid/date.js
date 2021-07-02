import React from 'react';
import moment from 'moment';
import ReactDatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import util from '../../Util/Util';

export default class DateFilter extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            value: props.myProps.filterValue !== undefined && props.myProps.filterValue || ''
        };
    }
    onChangeDateFilter(columnKey, value) {
        this.setState({ value: value });
        if (this.props.onChange instanceof Function)
            this.props.onChange(columnKey, value);
    }
    render() {
        const { value } = this.state
        var myProps = this.props.myProps,
            className = myProps.className ? myProps.className : "form-control",
            dateFormat = myProps.dateFormat ? myProps.dateFormat : util.dateFormat,
            placeholder = myProps.placeholder ? myProps.placeholder : "Search";

        var options = {
            dateFormat: dateFormat
        };
        if (value !== '') {
            options = { selected: value };
        }

        return (
            <ReactDatePicker isClearable={true} className={className} {...options} onChange={this.onChangeDateFilter.bind(this, myProps.key)}
                showMonthDropdown showYearDropdown dropdownMode="select" placeholderText={placeholder} popperModifiers={{
                    offset: {
                        enabled: true,
                    },
                    preventOverflow: {
                        enabled: true,
                        escapeWithReference: false // force popper to stay in viewport (even when input is scrolled out of view)
                    }
                }} />
        );
    }
}