import React, { useState } from "react";
import {
  FaFolder,
  FaFolderOpen,
  FaPlus,
  FaTrash,
  FaEdit,
  FaFile,
} from "react-icons/fa";
import { DiJavascript1, DiCss3, DiHtml5, DiReact } from "react-icons/di";
import { VscJson, VscMarkdown } from "react-icons/vsc";
import { SiGit, SiTypescript } from "react-icons/si";
import { BsFileEarmarkTextFill } from "react-icons/bs";

// File icon helper
const getFileIcon = (filename) => {
  const ext = filename.split(".").pop();

  switch (ext) {
    case "js":
      return <DiJavascript1 className="text-yellow-400" />;
    case "ts":
      return <SiTypescript className="text-cyan-400" />;
    case "jsx":
    case "tsx":
      return <DiReact className="text-cyan-400" />;
    case "css":
      return <DiCss3 className="text-blue-400" />;
    case "html":
      return <DiHtml5 className="text-orange-500" />;
    case "json":
      return <VscJson className="text-green-400" />;
    case "md":
      return <VscMarkdown className="text-purple-400" />;
    case "png":
    case "jpg":
    case "jpeg":
    case "gif":
    case "ico":
      return <FaFile className="text-pink-400" />;
    case "gitignore":
      return <SiGit className="text-red-500" />;
    default:
      return <BsFileEarmarkTextFill className="text-gray-300" />;
  }
};

const TreeNode = ({ node, depth = 0, onUpdate }) => {
  const [isOpen, setIsOpen] = useState(false);

  const hasChildren = node.type === "folder" && node.children?.length > 0;

  const toggleOpen = () => {
    if (node.type === "folder") {
      setIsOpen(!isOpen);
    }
  };

  const handleRename = () => {
    const newName = prompt("Enter new name", node.name);
    if (newName) onUpdate("rename", node.id, newName);
  };

  const handleDelete = () => {
    if (window.confirm("Are you sure you want to delete this?")) {
      onUpdate("delete", node.id);
    }
  };

  const handleAdd = (type) => {
    const name = prompt(`Enter ${type} name`);
    if (name) onUpdate("add", node.id, name, type);
  };

  return (
    <div>
      <div
        className="flex items-center justify-between hover:bg-gray-700 rounded px-2 py-1 "
        style={{ paddingLeft: `${depth * 16}px` }}
      >
        {/* Left: Icon + Name */}
        <div
          className="flex items-center gap-2 cursor-pointer pl-2"
          onClick={toggleOpen}
        >
          {node.type === "folder" ? (
            isOpen ? (
              <FaFolderOpen className="text-yellow-400" />
            ) : (
              <FaFolder className="text-yellow-400" />
            )
          ) : (
            getFileIcon(node.name)
          )}
          <span>{node.name}</span>
        </div>

        {/* Right: Action buttons */}
        <div className="flex gap-2 text-sm">
          {node.type === "folder" && (
            <>
              <button
                className="text-green-400 hover:text-green-300"
                title="Add File"
                onClick={() => handleAdd("file")}
              >
                <FaPlus />
              </button>
              <button
                className="text-blue-400 hover:text-blue-300"
                title="Add Folder"
                onClick={() => handleAdd("folder")}
              >
                <FaFolder />
              </button>
            </>
          )}
          <button
            className="text-yellow-400 hover:text-yellow-300"
            title="Rename"
            onClick={handleRename}
          >
            <FaEdit />
          </button>
          <button
            className="text-red-400 hover:text-red-300"
            title="Delete"
            onClick={handleDelete}
          >
            <FaTrash />
          </button>
        </div>
      </div>

      {/* Children */}
      {hasChildren && isOpen && (
        <div>
          {node.children.map((child) => (
            <TreeNode
              key={child.id}
              node={child}
              depth={depth + 1}
              onUpdate={onUpdate}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default TreeNode;
