import React, { useState, useEffect } from "react";
import treeData from "./data.json";
import TreeView from "./component/TreeView";

// Helper to recursively update tree nodes
const updateTree = (nodes, action, id, name, type) => {
  return nodes
    .map((node) => {
      if (node.id === id) {
        if (action === "rename") {
          return { ...node, name };
        }
        if (action === "delete") {
          return null; // Mark for removal
        }
        if (action === "add") {
          const newNode = {
            id: Date.now() + Math.random(), // Simple unique id
            name,
            type,
            ...(type === "folder" ? { children: [] } : {}),
          };
          return {
            ...node,
            children: node.children ? [...node.children, newNode] : [newNode],
          };
        }
      }
      // Recurse into children if it is a folder
      if (node.type === "folder" && node.children) {
        return {
          ...node,
          children: updateTree(node.children, action, id, name, type).filter(
            Boolean
          ),
        };
      }
      return node;
    })
    .filter(Boolean); // Remove deleted nodes
};

function App() {
  // Load from localStorage or fallback to treeData
  const [data, setData] = useState(() => {
    const saved = localStorage.getItem("treeData");
    return saved ? JSON.parse(saved) : treeData;
  });

  // Persist to localStorage on every change
  useEffect(() => {
    localStorage.setItem("treeData", JSON.stringify(data));
  }, [data]);

  const handleUpdate = (action, id, name, type) => {
    setData((prev) => updateTree(prev, action, id, name, type));
  };

  return (
    <div className="bg-gray-900 text-white min-h-screen p-6">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-2xl font-semibold mb-4 text-center">
          📁 File Explorer
        </h1>
        <TreeView initialData={data} onUpdate={handleUpdate} />
      </div>
    </div>
  );
}

export default App;
