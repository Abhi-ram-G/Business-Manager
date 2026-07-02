/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from "react";
import { 
  Database, 
  Smartphone, 
  Network, 
  Lock, 
  ArrowLeftRight, 
  Cpu, 
  HardDrive, 
  AlertCircle 
} from "lucide-react";

export default function SystemArchitecture() {
  return (
    <div id="system-architecture-view" className="p-6 bg-slate-900/50 rounded-2xl border border-slate-800">
      <div className="mb-6">
        <h3 className="text-xl font-semibold text-slate-100 flex items-center gap-2">
          <Cpu className="w-5 h-5 text-indigo-400" />
          Smart Manager - High-Fidelity System Architecture
        </h3>
        <p className="text-slate-400 text-sm mt-1">
          Detailed visual architecture of the multi-user, offline-first mobile and cloud application.
        </p>
      </div>

      {/* Visual Diagram */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 relative items-stretch mb-8">
        
        {/* Layer 1: Mobile Client Stack (Flutter) */}
        <div className="bg-slate-950/80 p-5 rounded-xl border border-indigo-500/20 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4 pb-2 border-b border-slate-800">
              <span className="text-xs font-mono text-indigo-400 tracking-wider font-bold">CLIENT LAYER</span>
              <Smartphone className="w-5 h-5 text-indigo-400" />
            </div>
            <h4 className="text-sm font-semibold text-slate-200 mb-2">Flutter Cross-Platform App</h4>
            
            <div className="space-y-3 mt-4">
              <div className="bg-slate-900 p-2.5 rounded border border-slate-800">
                <div className="text-xs font-semibold text-indigo-300">UX / UI Screens (Flutter Widgets)</div>
                <div className="text-[11px] text-slate-400 mt-0.5">Forms, charts (fl_chart), grid analytics dashboards</div>
              </div>
              <div className="bg-slate-900 p-2.5 rounded border border-slate-800">
                <div className="text-xs font-semibold text-indigo-300">Riverpod Providers</div>
                <div className="text-[11px] text-slate-400 mt-0.5">Strict state tracking, inputs validation, RBAC checks</div>
              </div>
              <div className="bg-indigo-950/50 p-2.5 rounded border border-indigo-800/40">
                <div className="text-xs font-semibold text-indigo-200 flex items-center gap-1">
                  <Database className="w-3.5 h-3.5" />
                  Hive Local Cache Boxes
                </div>
                <div className="text-[11px] text-indigo-300/80 mt-0.5">Encrypts credentials, indexes logs local offline CRUD</div>
              </div>
            </div>
          </div>
          
          <div className="mt-4 pt-3 border-t border-slate-800 text-[11px] text-slate-500 font-mono">
            Platform: Android (Kotlin), iOS (Swift)
          </div>
        </div>

        {/* Layer 2: Sync Engine & REST API Conduit (FastAPI) */}
        <div className="bg-slate-950/80 p-5 rounded-xl border border-emerald-500/20 flex flex-col justify-between relative">
          {/* Incoming Arrows */}
          <div className="hidden lg:flex absolute left-[-20px] top-1/2 -translate-y-1/2 z-10 bg-slate-905 p-1 rounded-full border border-indigo-500/30 text-indigo-400">
            <ArrowLeftRight className="w-4 h-4" />
          </div>
          
          <div>
            <div className="flex items-center justify-between mb-4 pb-2 border-b border-slate-800">
              <span className="text-xs font-mono text-emerald-400 tracking-wider font-bold">INTERMEDIARY SYNCHRONIZER</span>
              <Network className="w-5 h-5 text-emerald-400" />
            </div>
            <h4 className="text-sm font-semibold text-slate-200 mb-2">FastAPI Middleware & Services</h4>
            
            <div className="space-y-3 mt-4">
              <div className="bg-slate-900 p-2.5 rounded border border-slate-800">
                <div className="text-xs font-semibold text-emerald-300 flex items-center gap-1">
                  <Lock className="w-3.5 h-3.5 text-emerald-400" />
                  JWT Router Guards
                </div>
                <div className="text-[11px] text-slate-400 mt-0.5">Role Verification (Admin, Accountant), token refresh</div>
              </div>
              <div className="bg-emerald-950/30 p-2.5 rounded border border-emerald-800/30">
                <div className="text-xs font-semibold text-emerald-200">Synchronizer & Queue Merge</div>
                <div className="text-[11px] text-emerald-300/80 mt-0.5">Handles background batch submissions from local SQLite queue</div>
              </div>
              <div className="bg-slate-900 p-2.5 rounded border border-slate-800">
                <div className="text-xs font-semibold text-emerald-300">Firebase Push Conduit</div>
                <div className="text-[11px] text-slate-400 mt-0.5">Dispatches real-time alerts on salary, budget exeed, RC expiry</div>
              </div>
            </div>
          </div>
          
          <div className="mt-4 pt-3 border-t border-slate-800 text-[11px] text-slate-500 font-mono">
            Platform: FastAPI (Python), FCM SDK, JWT
          </div>
        </div>

        {/* Layer 3: Persistent Relational Stack (MySQL) */}
        <div className="bg-slate-950/80 p-5 rounded-xl border border-purple-500/20 flex flex-col justify-between relative">
          {/* Incoming Arrows */}
          <div className="hidden lg:flex absolute left-[-20px] top-1/2 -translate-y-1/2 z-10 bg-slate-905 p-1 rounded-full border border-emerald-500/30 text-emerald-400">
            <ArrowLeftRight className="w-4 h-4" />
          </div>

          <div>
            <div className="flex items-center justify-between mb-4 pb-2 border-b border-slate-800">
              <span className="text-xs font-mono text-purple-400 tracking-wider font-bold">PERSISTENCE LAYER</span>
              <HardDrive className="w-5 h-5 text-purple-400" />
            </div>
            <h4 className="text-sm font-semibold text-slate-200 mb-2">Relational Database Server</h4>
            
            <div className="space-y-3 mt-4">
              <div className="bg-slate-900 p-2.5 rounded border border-slate-800">
                <div className="text-xs font-semibold text-purple-300">MySQL Primary Database</div>
                <div className="text-[11px] text-slate-400 mt-0.5">Enterprise isolation, indexing, structured tables</div>
              </div>
              <div className="bg-slate-900 p-2.5 rounded border border-slate-800">
                <div className="text-xs font-semibold text-purple-300">SQLAlchemy ORM Pool</div>
                <div className="text-[11px] text-slate-400 mt-0.5">Persistent db sessions management, connection scaling</div>
              </div>
              <div className="bg-purple-950/40 p-2.5 rounded border border-purple-800/30">
                <div className="text-xs font-semibold text-purple-200">Security & Backup</div>
                <div className="text-[11px] text-purple-300/80 mt-0.5">Nightly backup rules, AES-256 encrypted fields</div>
              </div>
            </div>
          </div>
          
          <div className="mt-4 pt-3 border-t border-slate-800 text-[11px] text-slate-500 font-mono">
            Platform: MySQL 8.x / Cloud SQL
          </div>
        </div>
      </div>

      {/* Sync Flow Details */}
      <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
        <h4 className="text-sm font-semibold text-amber-400 flex items-center gap-1.5 mb-2">
          <AlertCircle className="w-4 h-4" />
          Offline First Sync & Conflict Resolution Pipeline
        </h4>
        <div className="text-xs text-slate-300 space-y-2 leading-relaxed">
          <p>
            1. <strong>Local Insertion:</strong> When the app registers a CRUD operation (e.g., adding labour Ramesh, marking attendance) but the mobile device is offline, Riverpod commits data immediately to the <strong>Hive Database Box</strong> and schedules a sync item in a <strong>local failure synchronization SQLite queue</strong>.
          </p>
          <p>
            2. <strong>Adaptive Network Watch:</strong> A background daemon listens to device network transitions. When cellular or Wi-Fi becomes active, the Flutter thread bundles cached transaction records into a single sync payload.
          </p>
          <p>
            3. <strong>FastAPI Reconciliation:</strong> The backend verifies JWT credentials, parses the packets, and checks records against physical MySQL tables.
          </p>
          <p>
            4. <strong>Conflict Rules:</strong> If a record has changed on both the server and client, a <em>Last-Write-Wins (LWW)</em> timestamp evaluation is applied. Client-side local IDs are safely replaced by server-generated primary keys, which then update Hive coordinates accordingly.
          </p>
        </div>
      </div>
    </div>
  );
}
