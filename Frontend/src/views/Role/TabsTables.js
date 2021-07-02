import React, { useEffect } from 'react'

function TabsTables(props) {
  const headers = [
    "PAGE Name",
    "View",
    "Edit",
    "Notes"


  ]
  console.log(props);
  useEffect(() => {

  }, [props])
  return (
    <div>
      <div className="tab-pane active p-0" id="Page">
        <div className="table-responsive">
          <table className="table table-striped">
            <thead>
              <tr>
                <th scope="col" style={{ width: "25%" }}>{props.currentTab.toUpperCase()} Name</th>
                <th scope="col" style={{ width: "10%" }}>View</th>
                {props.currentTab == "pages" ? <th scope="col" style={{ width: "10%" }}>Edit</th> : <></>}
                <th scope="col" style={{ width: "55%" }}>Notes</th>
              </tr>
            </thead>
            <tbody> 
              {props.pageData.data && props.pageData.data.length > 0 ?
                props.pageData.data.map((x, index) => {
                  return <tr key={index}> 
                    <td scope="row">{x.name}</td>
                    <td >
                      <input disabled={x.name.toLowerCase()=="dashboard" ? true : props.role != "Use Blank Template" ? (props.copy == "save" ? false : true) : false} checked={x.isViewAllowed} onChange={() => props.storeChecked(x, props.currentTab, "view")} type="checkbox" id={x._id} />

                    </td>
                    {props.currentTab == "pages" ? <td >
                      <input disabled= {x.name.toLowerCase()=="dashboard" ? true : props.role != "Use Blank Template" ? (props.copy == "save" ? false : true)  : false} checked={x.isEditAllowed} onChange={() => props.storeChecked(x, props.currentTab, "edit")} type="checkbox" id={x._id} />
                    </td> : <></>}
                    <td>{x.description}</td>
                  </tr>
                })
                : <></>}

            </tbody>
          </table>
        </div>

      </div>
    </div>
  )
}

export default TabsTables