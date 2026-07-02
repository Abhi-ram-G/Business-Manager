/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { Folder, FolderOpen, FileText, ChevronRight, ChevronDown, Check, HelpCircle } from "lucide-react";
import { flutterFolderStructure, fastapiFolderStructure, FileNode } from "../data";

export default function FolderExplorer() {
  const [activeTab, setActiveTab] = useState<"flutter" | "fastapi">("flutter");
  const [selectedNode, setSelectedNode] = useState<FileNode | null>(null);

  // Helper component to render recursive tree node
  const TreeNodeComponent = ({ node, depth = 0 }: { node: FileNode; depth: number; key?: any }) => {
    const [isExpanded, setIsExpanded] = useState(true);
    const hasChildren = node.children && node.children.length > 0;

    const handleNodeClick = (e: React.MouseEvent) => {
      e.stopPropagation();
      setSelectedNode(node);
      if (hasChildren) {
        setIsExpanded(!isExpanded);
      }
    };

    return (
      <div className="pl-3.5 select-none font-mono text-xs">
        <div
          onClick={handleNodeClick}
          className={`flex items-center gap-1.5 py-1 px-2 rounded cursor-pointer transition-colors ${
            selectedNode?.name === node.name
              ? "bg-indigo-950/40 text-indigo-300 border-l border-indigo-500 font-medium"
              : "text-slate-300 hover:bg-slate-900 hover:text-slate-100"
          }`}
          style={{ paddingLeft: `${depth * 6 + 8}px` }}
        >
          {hasChildren ? (
            isExpanded ? <ChevronDown className="w-3 h-3 text-slate-500" /> : <ChevronRight className="w-3 h-3 text-slate-500" />
          ) : (
            <span className="w-3 h-3" />
          )}

          {node.type === "folder" ? (
            isExpanded ? (
              <FolderOpen className="w-3.5 h-3.5 text-indigo-400" />
            ) : (
              <Folder className="w-3.5 h-3.5 text-indigo-400" />
            )
          ) : (
            <FileText className="w-3.5 h-3.5 text-slate-400" />
          )}

          <span className={node.type === "folder" ? "font-medium" : "text-slate-300"}>
            {node.name}
          </span>
        </div>

        {hasChildren && isExpanded && (
          <div className="mt-0.5">
            {node.children!.map((child, idx) => (
              <TreeNodeComponent key={idx} node={child} depth={depth + 1} />
            ))}
          </div>
        )}
      </div>
    );
  };

  const rootNode = activeTab === "flutter" ? flutterFolderStructure : fastapiFolderStructure;

  return (
    <div id="folder-explorer-view" className="grid grid-cols-1 md:grid-cols-12 gap-6">
      
      {/* File Tree Panel (Left Side) */}
      <div className="md:col-span-6 bg-slate-950/80 rounded-xl p-4 border border-slate-800 flex flex-col h-[460px]">
        {/* Toggle Controls */}
        <div className="flex gap-2 mb-4 bg-slate-900 p-1 rounded-lg border border-slate-850">
          <button
            onClick={() => {
              setActiveTab("flutter");
              setSelectedNode(null);
            }}
            className={`flex-1 py-1 px-3 text-center rounded text-xs font-semibold cursor-pointer transition ${
              activeTab === "flutter"
                ? "bg-indigo-600 text-slate-100 shadow"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            Flutter Client Tree
          </button>
          <button
            onClick={() => {
              setActiveTab("fastapi");
              setSelectedNode(null);
            }}
            className={`flex-1 py-1 px-3 text-center rounded text-xs font-semibold cursor-pointer transition ${
              activeTab === "fastapi"
                ? "bg-indigo-600 text-slate-100 shadow"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            FastAPI Backend Tree
          </button>
        </div>

        {/* Tree Container */}
        <div className="flex-1 overflow-y-auto space-y-1.5 border border-slate-900 bg-slate-1000 rounded-lg p-2.5">
          <TreeNodeComponent node={rootNode} depth={0} />
        </div>
      </div>

      {/* Node Description Details Card (Right Side) */}
      <div className="md:col-span-6 bg-slate-900/40 border border-slate-800 rounded-xl p-5 flex flex-col justify-between h-[460px]">
        {selectedNode ? (
          <div className="h-full flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2 mb-4 pb-2 border-b border-slate-800">
                {selectedNode.type === "folder" ? (
                  <Folder className="w-5 h-5 text-indigo-400" />
                ) : (
                  <FileText className="w-5 h-5 text-slate-400" />
                )}
                <div>
                  <h3 className="text-sm font-semibold font-mono text-slate-200">{selectedNode.name}</h3>
                  <span className="text-[10px] text-slate-500 uppercase tracking-wider">
                    SYSTEM {selectedNode.type}
                  </span>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <span className="text-xs font-mono text-slate-400 uppercase tracking-widest block mb-1">
                    Architectural Summary
                  </span>
                  <p className="text-xs text-slate-300 leading-relaxed bg-slate-950 p-3 rounded-lg border border-slate-850">
                    {selectedNode.description || "Root controller module coordinating high-level workspace integrations."}
                  </p>
                </div>

                <div>
                  <span className="text-xs font-mono text-slate-400 uppercase tracking-widest block mb-1">
                    Key Implementations
                  </span>
                  <ul className="text-xs text-slate-400 space-y-1.5">
                    {selectedNode.type === "folder" ? (
                      <>
                        <li className="flex items-start gap-1.5">
                          <Check className="w-3.5 h-3.5 text-indigo-400 mt-0.5 flex-shrink-0" />
                          <span>Contains clean module splits following structural design patterns.</span>
                        </li>
                        <li className="flex items-start gap-1.5">
                          <Check className="w-3.5 h-3.5 text-indigo-400 mt-0.5 flex-shrink-0" />
                          <span>Decouples raw network requests from client caching databases.</span>
                        </li>
                      </>
                    ) : (
                      <>
                        <li className="flex items-start gap-1.5">
                          <Check className="w-3.5 h-3.5 text-emerald-400 mt-0.5 flex-shrink-0" />
                          <span>Fully typed schemas mapping variables safely with failover rules.</span>
                        </li>
                        <li className="flex items-start gap-1.5">
                          <Check className="w-3.5 h-3.5 text-emerald-400 mt-0.5 flex-shrink-0" />
                          <span>Includes local caching hooks resolving merging exceptions.</span>
                        </li>
                      </>
                    )}
                  </ul>
                </div>
              </div>
            </div>

            <div className="bg-slate-950 p-3.5 rounded-lg border border-slate-800 text-[11px] text-slate-500 leading-normal flex items-start gap-2">
              <HelpCircle className="w-4 h-4 text-slate-400 mt-0.5 flex-shrink-0" />
              <span>
                {activeTab === "flutter"
                  ? "This standard Riverpod + Hive setup optimizes UI repaints and stores credentials lockkeys securely inside sandboxed offline databases."
                  : "These FastAPI route endpoints serve standard asynchronous IO session handlers yielding rapid SQL thread connection response times."}
              </span>
            </div>
          </div>
        ) : (
          <div className="h-full flex flex-col items-center justify-center text-center p-6 bg-slate-950/20 rounded-lg">
            <Folder className="w-10 h-10 text-slate-600 mb-3 animate-pulse" />
            <h4 className="text-sm font-semibold text-slate-400">Codebase Architecture Browser</h4>
            <p className="text-xs text-slate-500 max-w-xs mt-1 leading-relaxed">
              Click on any file or folder folder-node in the directory tree to inspect its core structural role and technical characteristics.
            </p>
          </div>
        )}
      </div>

    </div>
  );
}
