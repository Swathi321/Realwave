import React from "react";
import ReactDOM from "react-dom";
// import "antd/dist/antd.css";
import { Tree, Input } from "antd";
import { storesData } from "../../redux/actions/httpRequest";

const { TreeNode } = Tree;
let parentId = ""
const { Search } = Input;

class TreeStructure extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      data: this.props,
      value: 0,
    }
  }


  componentDidUpdate() {
    console.log(this.props);
    if (this.props && this.props.selectedKeys && this.props.selectedKeys.length > 0) {
      console.log("Hii");
      this.onCheck(this.props.selectedKeys)
    }
  }
  state = {
    expandedKeys: ["", ""],
    autoExpandParent: true,
    checkedKeys: [""],
    selectedKeys: [],


  };


  onExpand = expandedKeys => {
    console.log("onExpand", expandedKeys);
    this.setState({
      expandedKeys,
      autoExpandParent: false,
    });
  };

  onCheck = checkedKeys => {
    console.log("onCheck this.state.value", this.state.value);
    console.log("onCheck checkedKeys", checkedKeys,);

    if (this.state.value !== 1) {
      console.log('onCheck this.state.value !== 1')
      // console.log("onCheck tree this.props.selectedKeys", this.props.selectedKeys);
      // console.log("onCheck tree this.props.selectedKeys boolean - ", !(this.props.selectedKeys));
      // if (!(this.props.selectedKeys)) {
      //   console.log('onCheck inside this.props.selectedKeys')
      // if (!(this.props && this.props.selectedKeys)) {
      this.props.getStoreData(checkedKeys)
      // }
      if (this.state.value < 1)
        console.log('onCheck this.state.value < 1 ')

      this.setState({ checkedKeys: checkedKeys, value: this.state.value + 1 });
    }
  };


  onCheck1 = checkedKeys => {
    console.log("onCheck1", checkedKeys, this.state.value);
    this.props.getStoreData(checkedKeys)

    this.setState({ checkedKeys: checkedKeys });
  };
  onSelect = (selectedKeys, info) => {
    console.log("onSelect", info);
    this.setState({ selectedKeys });
  };

  onChange = e => {
    // let updateList = this.state.oldFilterList;
    // console.log(updateList);
    console.log(e.target.value);
    let searchItem = e.target.value;

  }



  renderTreeNodes = data =>
    data && data.map(item => {
      // console.log(item.storeData);
      if (item.items) {
        return (
          <>
            <TreeNode title={item.name} key={item._id} dataRef={item}>
              {item.storeData &&
                item.storeData.length > 0 &&
                item.storeData.map(store => {
                  return (
                    <TreeNode
                      title={store.storeName}
                      key={store.storeId}
                      dataRef={store}
                    />
                  );
                })}
              {this.renderTreeNodes(item.items)}
            </TreeNode>

          </>
        );
      }
      if (item.storeData) {
        return (
          <TreeNode title={item.storeName} key={item.storeId} dataRef={item}>
            {this.renderTreeNodes(item.storeData)}
          </TreeNode>
        );
      }
      // return <TreeNode key={item._id} {...item} />;
    });


  render() {
    const { searchValue } = this.state;

    let { treeData } = this.props
    let displayTree = treeData;
    console.log(displayTree);
    console.log(treeData);
    console.log(this.state);


    return (
      <div>
        {/* <Search
            style={{ marginBottom: 8 }}
            placeholder="Search"
            // onChange={this.onChange}
             onInput={() => this.onChange()}
          /> */}
        <Tree //tree display
          checkable
          onExpand={this.onExpand}
          expandedKeys={this.state.expandedKeys}
          autoExpandParent={this.state.autoExpandParent}
          onCheck={this.state.value == 1 ? this.onCheck1 : this.onCheck}
          checkedKeys={this.state.checkedKeys}
          onSelect={this.onSelect}
          selectedKeys={this.state.selectedKeys}
        >
          {this.renderTreeNodes(treeData)}
        </Tree>
      </div>
    );
  }
}

export default TreeStructure;



