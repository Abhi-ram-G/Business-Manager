/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { apiEndpoints, ApiEndpoint } from "../data";
import { Play, Terminal, HelpCircle, CheckCircle, AlertTriangle, Send } from "lucide-react";

export default function ApiPlayground() {
  const [selectedEndpointId, setSelectedEndpointId] = useState<string>(apiEndpoints[0].id);
  const [requestBodyJson, setRequestBodyJson] = useState<string>(apiEndpoints[0].requestBody || "");
  const [terminalLogs, setTerminalLogs] = useState<string[]>([]);
  const [serverResponse, setServerResponse] = useState<string | null>(null);
  const [isExecuting, setIsExecuting] = useState(false);

  const activeEndpoint = apiEndpoints.find((e) => e.id === selectedEndpointId) || apiEndpoints[0];

  const handleEndpointChange = (id: string) => {
    setSelectedEndpointId(id);
    const selected = apiEndpoints.find((e) => e.id === id);
    if (selected) {
      setRequestBodyJson(selected.requestBody || "");
      setServerResponse(null);
      setTerminalLogs([]);
    }
  };

  const handleExecute = () => {
    setIsExecuting(true);
    setServerResponse(null);
    setTerminalLogs([
      `[LOG 11:05:01] INCOMING CALL: ${activeEndpoint.method} ${activeEndpoint.path}`,
      `[LOG 11:05:01] Parsing authorization metadata ... JWT token validated.`,
      `[LOG 11:05:02] Injecting transaction session into MySQL pool.`,
    ]);

    setTimeout(() => {
      setTerminalLogs((prev) => [
        ...prev,
        `[LOG 11:05:02] Payload validation successful: Pydantic checking passed.`,
        `[LOG 11:05:03] DB transaction verified. Commit finalized. Dispatching to web client response framework.`
      ]);
      setServerResponse(activeEndpoint.responsePayload);
      setIsExecuting(false);
    }, 1200);
  };

  return (
    <div id="api-playground-view" className="grid grid-cols-1 lg:grid-cols-12 gap-6 pb-6">
      
      {/* Route Directory (Left Pane) */}
      <div className="lg:col-span-4 bg-slate-950 p-4 rounded-xl border border-slate-800 flex flex-col justify-between">
        <div>
          <h3 className="text-sm font-semibold text-slate-300 uppercase tracking-wider mb-3 flex items-center gap-1.5">
            <Terminal className="w-4 h-4 text-emerald-400" />
            API Router Registry
          </h3>
          <p className="text-xs text-slate-500 mb-4 leading-relaxed">
            Select any API Endpoint to inspect its signature, schema parameters, and trigger real-time simulated responses.
          </p>
          
          <div className="space-y-1 overflow-y-auto max-h-[420px] pr-1">
            {apiEndpoints.map((ep) => {
              const isSelected = ep.id === selectedEndpointId;
              const methodColors = 
                ep.method === "GET" ? "bg-blue-950/40 text-blue-400 border-blue-800/40" :
                ep.method === "POST" ? "bg-emerald-950/40 text-emerald-400 border-emerald-800/40" :
                ep.method === "PUT" ? "bg-amber-950/40 text-amber-400 border-amber-800/40" :
                "bg-rose-950/40 text-rose-400 border-rose-800/40";

              return (
                <button
                  key={ep.id}
                  onClick={() => handleEndpointChange(ep.id)}
                  className={`w-full text-left p-2.5 rounded-lg border transition duration-150 flex flex-col gap-1 ${
                    isSelected 
                      ? "bg-slate-900 border-slate-700 shadow-lg text-emerald-400" 
                      : "bg-slate-950/60 border-slate-900/60 hover:border-slate-800 text-slate-400 hover:bg-slate-900/40"
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span className={`text-[9px] font-mono font-bold px-2 py-0.5 rounded border ${methodColors}`}>
                      {ep.method}
                    </span>
                    <span className="text-xs font-mono text-slate-300 font-medium truncate">
                      {ep.path}
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-500 truncate pl-1">
                    {ep.description}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        <div className="mt-4 pt-3 border-t border-slate-900 text-[10px] text-slate-600 flex items-center gap-1">
          <HelpCircle className="w-3.5 h-3.5" />
          <span>Supports persistent HTTPS & offline batch sync</span>
        </div>
      </div>

      {/* Editor & Console Pane (Center/Right) */}
      <div className="lg:col-span-8 flex flex-col gap-5">
        
        {/* Selected Details & Execution Trigger */}
        <div className="bg-slate-900/70 p-4 rounded-xl border border-slate-800">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-3 border-b border-slate-800/80 mb-4">
            <div>
              <span className="text-[10px] font-mono text-indigo-400 uppercase tracking-widest block mb-0.5">
                ACTIVE ENDPOINT - {activeEndpoint.module}
              </span>
              <h2 className="text-sm font-semibold text-slate-200">
                {activeEndpoint.description}
              </h2>
            </div>
            
            <button
              onClick={handleExecute}
              disabled={isExecuting}
              className={`px-4 py-2.5 rounded-lg flex items-center justify-center gap-2 font-medium text-xs shadow-lg transition duration-150 ${
                isExecuting
                  ? "bg-indigo-950 text-indigo-400 border border-indigo-850 cursor-not-allowed"
                  : "bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold hover:shadow-xl cursor-pointer"
              }`}
            >
              {isExecuting ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-indigo-400 border-t-transparent rounded-full animate-spin"></div>
                  <span>Transmitting...</span>
                </>
              ) : (
                <>
                  <Send className="w-3.5 h-3.5" />
                  <span>Execute API Request</span>
                </>
              )}
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            
            {/* Request Body Payload Editor */}
            <div>
              <label className="text-[11px] font-mono text-slate-400 block mb-1.5 font-bold">
                REQUEST BODY (JSON)
              </label>
              {activeEndpoint.requestBody ? (
                <textarea
                  value={requestBodyJson}
                  onChange={(e) => setRequestBodyJson(e.target.value)}
                  className="w-full h-44 bg-slate-950 text-slate-300 font-mono text-xs p-3 rounded-lg border border-slate-800 focus:outline-none focus:border-indigo-500 transition focus:ring-1 focus:ring-indigo-500"
                  spellCheck="false"
                />
              ) : (
                <div className="w-full h-44 bg-slate-950/40 text-slate-500 font-mono text-xs p-4 rounded-lg border border-slate-800/50 flex flex-col justify-center items-center text-center">
                  <CheckCircle className="w-6 h-6 text-slate-700 mb-2" />
                  <span>No Request Body required</span>
                  <span className="text-[10px] text-slate-600 mt-1">This GET query collects direct server feeds</span>
                </div>
              )}
            </div>

            {/* Simulated Server Console */}
            <div>
              <label className="text-[11px] font-mono text-slate-400 block mb-1.5 font-bold">
                UVICORN & FASTAPI LOGS
              </label>
              <div className="w-full h-44 bg-slate-950 text-slate-400 font-mono text-[10px] p-3 rounded-lg border border-slate-800 overflow-y-auto space-y-1">
                {terminalLogs.length === 0 ? (
                  <span className="text-slate-600 block">Console dormant. Hit 'Execute Request' to trigger server processing.</span>
                ) : (
                  terminalLogs.map((log, index) => (
                    <div key={index} className="leading-normal">
                      {log.startsWith("[LOG") && (
                        <span className="text-emerald-500 mr-1">✔</span>
                      )}
                      {log}
                    </div>
                  ))
                )}
                {isExecuting && (
                  <div className="text-indigo-400 animate-pulse mt-1">▊ Processing request stream...</div>
                )}
              </div>
            </div>

          </div>
        </div>

        {/* Server Response Terminal Output */}
        <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-mono text-slate-400 uppercase tracking-widest font-bold">HTTP RESPONSE SCHEMA</span>
            {serverResponse && (
              <span className="text-[10px] bg-emerald-950/60 text-emerald-400 border border-emerald-800/40 px-2 py-0.5 rounded font-mono">
                Status: 200 OK
              </span>
            )}
          </div>
          
          <pre className="w-full overflow-x-auto bg-slate-1000 p-4 rounded-lg border border-slate-900 text-slate-300 font-mono text-[11px] leading-relaxed max-h-56">
            {serverResponse ? serverResponse : (
              <span className="text-slate-600">Response payload will generate here upon execution.</span>
            )}
          </pre>
        </div>

      </div>

    </div>
  );
}
