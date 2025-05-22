import React, { useState, useEffect } from "react";
import treeData from "./data.json";
import TreeView from "./component/TreeView";
import { v4 as uuidv4 } from "uuid";
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";

// Helper to find and remove a node by id, returning [node, newTree]
const removeNodeById = (nodes, id) => {
  let removed = null;
  const filtered = nodes
    .map((node) => {
      if (node.id === id) {
        removed = node;
        return null;
      }
      if (node.type === "folder" && node.children) {
        const [childRemoved, newChildren] = removeNodeById(node.children, id);
        if (childRemoved) removed = childRemoved;
        return { ...node, children: newChildren };
      }
      return node;
    })
    .filter(Boolean);
  return [removed, filtered];
};

// Helper to insert a node under a folder by id
const insertNodeById = (nodes, parentId, nodeToInsert) => {
  return nodes.map((node) => {
    if (node.id === parentId && node.type === "folder") {
      return {
        ...node,
        children: node.children
          ? [...node.children, nodeToInsert]
          : [nodeToInsert],
      };
    }
    if (node.type === "folder" && node.children) {
      return {
        ...node,
        children: insertNodeById(node.children, parentId, nodeToInsert),
      };
    }
    return node;
  });
};

// Helper to recursively update tree nodes
const updateTree = (nodes, action, id, name, type, dragInfo) => {
  if (action === "move" && dragInfo) {
    // Remove node from old place
    const [removedNode, treeWithoutNode] = removeNodeById(nodes, id);
    if (!removedNode) return nodes;
    // Insert node under new parent (folder)
    return insertNodeById(treeWithoutNode, dragInfo.overId, removedNode);
  }

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
            id: uuidv4(), // Simple unique id
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
          children: updateTree(
            node.children,
            action,
            id,
            name,
            type,
            dragInfo
          ).filter(Boolean),
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

  // DnD-kit sensors
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5,
      },
    })
  );

  // Handle drag end
  const handleDragEnd = (event) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    // Only allow dropping into folders
    const findNodeById = (nodes, id) => {
      for (const node of nodes) {
        if (node.id === id) return node;
        if (node.type === "folder" && node.children) {
          const found = findNodeById(node.children, id);
          if (found) return found;
        }
      }
      return null;
    };
    const overNode = findNodeById(data, over.id);
    if (overNode && overNode.type === "folder") {
      setData((prev) =>
        updateTree(prev, "move", active.id, null, null, { overId: over.id })
      );
    }
  };

  return (
    <div className="bg-gray-900 text-white min-h-screen p-6">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-2xl font-semibold mb-4 text-center">
          📁 File Explorer
        </h1>
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <TreeView initialData={data} onUpdate={handleUpdate} />
        </DndContext>
      </div>
    </div>
  );
}

export default App;
