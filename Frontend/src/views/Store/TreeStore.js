import React from "react";
import ReactDOM from "react-dom";
// import "antd/dist/antd.css";
// import "./index.css";
import { Tree } from "antd";
import { storesData } from "../../redux/actions/httpRequest";

const { TreeNode } = Tree;
let parentId=""

class TreeStore extends React.Component {
constructor(props) {
  super(props)
  this.state = {
     data:[],
     value:1,
  }
  console.log(this.props);

}

componentDidUpdate(){
    // console.log(this.props.treeData);
 if(this.state.data.length==0){
     this.setState({
         data:this.props.treeData ?this.props.treeData :[]
     })
 }
}
  
state = {
    expandedKeys: ["", ""],
    autoExpandParent: true,
    checkedKeys: [""],
    selectedKeys: []
  };

  onExpand = expandedKeys => {
    console.log("onExpand", expandedKeys);
    this.setState({
      expandedKeys,
      autoExpandParent: false
    });
  };

  onCheck = checkedKeys => {
    console.log("onCheck", checkedKeys);
    this.setState({ checkedKeys });
    
  };

  onSelect = (selectedKeys, info) => {
    // console.log("onSelect", info);
    // console.log(info["selectedNodes"][0],info.selectedNodes[0].props.title);
    if(info.selectedNodes && info.selectedNodes.length>0 && info.selectedNodes[0].props &&info.selectedNodes[0].props.dataRef )
    this.props.showReg(info.selectedNodes[0].props.dataRef)
    this.setState({ selectedKeys });
   
  };

  renderTreeNodes = data =>{

    return data.map((item,index) => {
      //  console.log(item);
      if (item.items) {
        // console.log(item.name,item.name?item.name:item.storeName,item.storeName,item);
        // let data=[...item.items,...item.storeData]
        //  console.log(item,item.storeData);
        if(parentId.length==0){
          // console.log("Hii",parentId);
        parentId=item._id
        }
        // console.log("Bye",parentId);




        return (
          <>

          <TreeNode title={item.name} key={item._id} dataRef={item}>
          {this.renderTreeNodes(item.items)}
          </TreeNode>

          {/* {item.storeData.length>0?
        (item._id==item.storeData[0].clientRegionId?
          item.storeData.map(x=>{
            console.log(parentId,item.parentRegionId);
            return <TreeNode title={x.storeName} key={x._id} dataRef={item}>
            {this.renderTreeNodes(item.storeData)}
          </TreeNode>
          }):<></>)

      :<></>} */}


          </>
        );
      }


     return <TreeNode key={item._id} {...item} />;
    });
  }

  render() {
    let {treeData}=this.props
    return (
      <Tree
        
        onExpand={this.onExpand}
        expandedKeys={this.state.expandedKeys}
        autoExpandParent={this.state.autoExpandParent}
        // onCheck={this.onCheck}
        // checkedKeys={this.state.checkedKeys}
        onSelect={this.onSelect}
        selectedKeys={this.state.selectedKeys}
      >
        {this.renderTreeNodes(treeData)}
      </Tree>
    );
  }
}

export default TreeStore;


