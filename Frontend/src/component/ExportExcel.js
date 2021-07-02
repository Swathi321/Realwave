import React, { Component } from 'react'
import ReactExport from 'react-data-export';
import { Button } from 'reactstrap';
const ExcelFile = ReactExport.ExcelFile;
const ExcelSheet = ReactExport.ExcelFile.ExcelSheet;
const ExcelColumn = ReactExport.ExcelFile.ExcelColumn;

class ExportExcel extends Component {
    constructor(props) {
        super(props)
        this.state = {
            removeCol: ['EDIT', 'VIDEO']
        }
    }

    render() {
        const { getColumnsName, getColumnsData, props, state } = this;
        const { removeCol } = state;
        const { columns, data } = props;
        let columnsData = [];
        columns.map((val, index) => {
            let findIndex = removeCol.findIndex(x => x == val.title);
            if (findIndex == -1) {
                columnsData.push(val);
            }
        })

        return (
            <div>
                <ExcelFile element={<Button outline color="primary" title="Download" className="no-sales-header-button">Export <i className="fa fa-download" /></Button>}>
                    <ExcelSheet data={data} name="Data">
                        {
                            columnsData && columnsData.map((val, index) => {
                                return <ExcelColumn label={val.title} value={val.key} />
                            })
                        }
                    </ExcelSheet>
                </ExcelFile>
            </div>
        )
    }
}

export default ExportExcel;