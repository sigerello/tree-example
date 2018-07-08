import * as React from 'react'
import {Component, createRef, Fragment, RefObject} from 'react'

////////////////////////////////////////////////////////////////////////////////

export type TreeNode = {
  name: string
  children?: TreeNode[]
  parent?: TreeNode
  checked?: boolean
  indeterminate?: boolean
}

export type TreeViewProps = {
  data: TreeNode[]
  debug?: boolean
}

export type TreeViewState = {
  data: TreeNode[]
}

export type TreeNodeViewProps = {
  node: TreeNode
  handleCheck: (event: any, node: TreeNode) => void
}

////////////////////////////////////////////////////////////////////////////////

export class TreeView extends Component<TreeViewProps, TreeViewState> {
  constructor(props) {
    super(props)

    let data = this.prepareInitialData()

    this.state = {data}
    this.handleCheck = this.handleCheck.bind(this)
  }

  render() {
    return (
      <Fragment>
        <div className="tree">
          {this.state.data.map((node, key) => (
            <TreeNodeView key={key}
                          node={node}
                          handleCheck={this.handleCheck}/>
          ))}
        </div>

        {this.props.debug && (
          <div className="debug">
            <span>Checked data:</span>
            {dump(this.getCheckedData())}
          </div>
        )}
      </Fragment>
    )
  }

  prepareInitialData() {
    let build = (nodes: TreeNode[], parent?: TreeNode) => {
      return nodes.map(node => {
        node.parent = parent ? parent : null
        node.indeterminate = false
        node.checked = node.children ? false : !!node.checked

        if (!node.children) {
          this.checkParents(node.parent, node.checked)
        }

        if (node.children) {
          node.children = build(node.children, node)
        }

        return node
      })
    }

    let initialData = (Object as any).assign([], this.props.data)

    return build(initialData)
  }

  getCheckedData() {
    let build = (nodes: TreeNode[]) => {
      return nodes.reduce((nodes: TreeNode[], current: TreeNode) => {
        if (current.checked) {
          let node: TreeNode = {
            name: current.name
          }

          if (current.children) {
            node.children = build(current.children)
          }

          nodes.push(node)
        }

        return nodes
      }, [])
    }

    let data = (Object as any).assign([], this.state.data)

    return build(data)
  }

  handleCheck(event, node: TreeNode) {
    let checked = node.indeterminate ? true : event.target.checked

    this.setChecked(node, checked)
  }

  setChecked(node: TreeNode, checked: boolean) {
    node.checked = checked
    node.indeterminate = false

    this.checkChildren(node.children, checked)
    this.checkParents(node.parent, checked)

    this.setState({
      data: this.state.data
    })
  }

  checkChildren(nodes: TreeNode[], checked: boolean) {
    nodes && nodes.forEach(node => {
      node.checked = checked
      node.indeterminate = false

      this.checkChildren(node.children, checked)
    })
  }

  checkParents(node: TreeNode, checked: boolean) {
    if (!node) {
      return
    }

    let isAllChecked = node.children.every(child => child.checked && !child.indeterminate)
    let isAllUnchecked = node.children.every(child => !child.checked)

    if (isAllChecked) {
      node.checked = true
      node.indeterminate = false
    } else if (isAllUnchecked) {
      node.checked = false
      node.indeterminate = false
    } else {
      node.checked = true
      node.indeterminate = true
    }

    this.checkParents(node.parent, checked)
  }
}

////////////////////////////////////////////////////////////////////////////////

export class TreeNodeView extends Component<TreeNodeViewProps, any> {
  private checkboxRef: RefObject<HTMLInputElement>

  constructor(props) {
    super(props)

    this.checkboxRef = createRef()
  }

  componentDidMount() {
    this.checkboxRef.current.indeterminate = this.props.node.indeterminate
  }

  componentDidUpdate() {
    this.checkboxRef.current.indeterminate = this.props.node.indeterminate
  }

  render() {
    let {node, handleCheck} = this.props

    return (
      <div className="node">
        <label className="node-name">
          <input type="checkbox"
                 ref={this.checkboxRef}
                 checked={node.checked}
                 onChange={e => handleCheck(e, node)}/>
          <span>{node.name}</span>
        </label>

        {node.children && (
          <div className="node-children">
            {node.children.map((child, key) => (
              <TreeNodeView key={key}
                            node={child}
                            handleCheck={handleCheck}/>
            ))}
          </div>
        )}
      </div>
    )
  }
}

////////////////////////////////////////////////////////////////////////////////

export const dump = (data) => {
  return (
    <div className="dump">
      {JSON.stringify(data, null, 4)}
    </div>
  )
}

////////////////////////////////////////////////////////////////////////////////
