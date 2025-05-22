// src/components/TreeView.jsx
import React from "react";
import TreeNode from "./TreeNode";

const TreeView = ({ initialData, onUpdate }) => {
  return (
    <div>
      {initialData.map((node) => (
        <TreeNode key={node.id} node={node} onUpdate={onUpdate} />
      ))}
    </div>
  );
};

export default TreeView;
