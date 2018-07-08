import './styles.scss'
import * as React from 'react'
import * as ReactDOM from 'react-dom'
import {TreeNode, TreeView} from './Tree'

////////////////////////////////////////////////////////////////////////////////

let initialData: TreeNode[] = [
  {name: 'Node 1', children: [
    {name: 'Node 1.1'},
    {name: 'Node 1.2'},
  ]},
  {name: 'Node 2'},
  {name: 'Node 3', children: [
    {name: 'Node 3.1', children: [
      {name: 'Node 3.1.1', checked: true},
      {name: 'Node 3.1.2', checked: true},
    ]},
    {name: 'Node 3.2', children: [
      {name: 'Node 3.2.1'},
      {name: 'Node 3.2.2', checked: true},
    ]},
    {name: 'Node 3.3', children: [
      {name: 'Node 3.3.1'},
      {name: 'Node 3.3.2', children: [
        {name: 'Node 3.3.2.1'},
        {name: 'Node 3.3.2.2', children: [
          {name: 'Node 3.3.2.2.1'},
          {name: 'Node 3.3.2.2.2', children: [
            {name: 'Node 3.3.2.2.2.1'},
            {name: 'Node 3.3.2.2.2.2'},
          ]},
          {name: 'Node 3.3.2.2.3'},
          {name: 'Node 3.3.2.2.4'},
        ]},
      ]},
    ]},
  ]},
  {name: 'Node 4', children: [
    {name: 'Node 4.1'},
    {name: 'Node 4.2'},
    {name: 'Node 4.3'},
  ]},
]

////////////////////////////////////////////////////////////////////////////////

export function App() {
  return (
    <div className="app">
      <TreeView data={initialData} debug={true}/>
    </div>
  )
}

ReactDOM.render(<App/>, document.getElementById('root'))

////////////////////////////////////////////////////////////////////////////////
