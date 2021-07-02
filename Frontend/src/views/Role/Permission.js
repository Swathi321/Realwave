import React, { PureComponent } from 'react'
import PropTypes from 'prop-types';
import Grid from '../Grid/GridBase';
import { permissionData } from '../../redux/actions/httpRequest';
import { connect } from 'react-redux';

export class Permission extends PureComponent {
    constructor(props) {
        super(props)
        this.state = {
            selectedRowKeys: [], // Check here to configure the default column
            columns: [
                { key: 'name', name: 'Name', width: 170, filter: false, sort: false },
                { key: 'description', name: 'Description', width: 170, filter: false, sort: false }
            ],
            data: []
        }
        this.onRowClick = this.onRowClick.bind(this);
        this.beforeRender = this.beforeRender.bind(this);
        this.alreadyclicked = false;
        this.alreadyclickedTimeout = null;
    };

    onRowClick() { }

    beforeRender(data) {
        if (data && data.length > 0) {
            this.setState({
                data: data
            })
        }
        return data;
    }

    onSelectChange = (selectedRowKeys, selectedRows) => {
        console.log('selectedRowKeys changed: ', selectedRowKeys);
        this.setState({ selectedRowKeys });
        let permission = [];
        for (let index = 0; index < selectedRows.length; index++) {
            const element = selectedRows[index];
            permission.push(element._id)
        }
        this.props.onChange("permissions", permission)
        // this.props.onSelectionChange(permission)
        // this.props.scope.state.permissionData = permission
    }

    rowSelection() {
        // rowSelection object indicates the need for row selection
        let selectedRows = [];
        if (this.props.selectedRows) {
            for (let index = 0; index < this.props.selectedRows.length; index++) {
                const element = this.props.selectedRows[index];
                if (this.state.data && this.state.data.length > 0) {
                    let dataIndex = this.state.data.findIndex(e => e._id == element);
                    if (dataIndex != -1) {
                        selectedRows.push(dataIndex)
                    }
                }
            }
        }
        return {
            onChange: this.onSelectChange.bind(this),
            selectedRowKeys: selectedRows,
        };
    }
    
    componentWillMount() {
        localStorage.removeItem("currentPage");
    }
    
    render() {
        const { columns, loadedData } = this.state;
        let { listAction, actionName, sortColumn, sortDirection } = this.props
        return (
            <div>
                <div>
                    <Grid
                        beforeRender={this.beforeRender}
                        loadedData={loadedData}
                        pageSize={50}
                        disablePagination={true}
                        filename={"Permission"}
                        listAction={listAction}
                        dataProperty={actionName}
                        columns={columns}
                        autoHeight={true}
                        defaultSort={{ sortColumn: sortColumn, sortDirection: sortDirection }}
                        localPaging={true}
                        onRowClick={this.onRowClick}
                        rowSelection={this.rowSelection()}
                    />
                </div>
            </div>
        )
    }
}

Permission.defaultProps = {
    listAction: permissionData,
    actionName: 'permissionData'
}

Permission.contextTypes = {
    router: PropTypes.object.isRequired
};

function mapStateToProps(state, ownProps) {
    return {
        clientData: state.clientData
    };
}

var PermissionModule = connect(mapStateToProps)(Permission);
export default PermissionModule;

