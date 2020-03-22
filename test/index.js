import './jquery.fancytree/dist/skin-lion/ui.fancytree.less'
import {createTree, version} from 'jquery.fancytree'
import '.   /jquery.fancytree/dist/modules/jquery.fancytree.edit';

const tree = createTree('#tree', {
  extensions: ['edit'],
  source: [
    {title: "Node 1", key: "1"},
    {title: "Folder 2", key: "2", folder: true, children: [
      {title: "Node 2.1", key: "3"},
      {title: "Node 2.2", key: "4"}
    ]}
  ]
});