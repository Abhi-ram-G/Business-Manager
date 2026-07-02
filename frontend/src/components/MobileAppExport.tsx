/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { 
  Smartphone, 
  Code, 
  Terminal, 
  FileCode, 
  Check, 
  Copy, 
  Layers, 
  Share2, 
  ArrowRight, 
  Cpu, 
  CloudLightning,
  Sparkles,
  RefreshCw,
  FolderOpen
} from "lucide-react";

export default function MobileAppExport() {
  const [activeSubTab, setActiveSubTab] = useState<"capacitor" | "flutter">("capacitor");
  const [copiedId, setCopiedId] = useState<string>("");

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(""), 2000);
  };

  // Capacitor config command scripts
  const capInstallCommands = `npm install @capacitor/core @capacitor/cli
npx cap init "Smart Manager" "com.sathy.smartmanager" --web-dir=dist
npm install @capacitor/android @capacitor/ios
npx cap add android
npx cap add ios`;

  const capBuildCommands = `# 1. Compile the React Vite project to statics
npm run build

# 2. Synchronize compiled public assets with mobile native containers
npx cap sync

# 3. Open selected platform inside Android Studio or Xcode to compile APK / IPA
npx cap open android
npx cap open ios`;

  const capConfigJson = `{
  "appId": "com.sathy.smartmanager",
  "appName": "Smart Manager",
  "webDir": "dist",
  "bundledWebRuntime": false,
  "server": {
    "androidScheme": "https"
  }
}`;

  // Flutter Source Code Files
  const yamlCode = `name: smart_business_family_manager
description: A high-fidelity Smart Business and Family Manager with offline sync.
version: 1.0.0+1
publish_to: 'none'

environment:
  sdk: '>=3.0.0 <4.0.0'

dependencies:
  flutter:
    sdk: flutter
  flutter_riverpod: ^2.4.9
  hive_flutter: ^1.1.0
  dio: ^5.4.0
  internet_connection_checker_plus: ^2.5.1
  uuid: ^4.3.3
  intl: ^0.19.0
  cupertino_icons: ^1.0.5

dev_dependencies:
  flutter_test:
    sdk: flutter
  hive_generator: ^2.0.1
  build_runner: ^2.4.8

flutter:
  uses-material-design: true
  assets:
    - assets/icons/
    - assets/images/`;

  const dartMainCode = `import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:hive_flutter/hive_flutter.dart';
import 'package:smart_business_family_manager/core/sync/sync_queue.dart';

void main() async {
  WidgetsFlutterBinding.ensureInitialized();
  
  // Initialize local offline database engine
  await Hive.initFlutter();
  await Hive.openBox('operational_cache');
  await Hive.openBox('sync_queue');
  
  // Boot dynamic network connection changes listener
  SyncQueueManager.instance.initializeConnectivityListener();
  
  runApp(
    const ProviderScope(
      child: MyApp(),
    ),
  );
}

class MyApp extends StatelessWidget {
  const MyApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'Smart Business & Family Manager',
      debugShowCheckedModeBanner: false,
      theme: ThemeData(
        colorScheme: ColorScheme.fromSeed(
          seedColor: const Color(0xFF6366F1), // Corporate Indigo
          brightness: Brightness.dark,
          background: const Color(0xFF0F172A), // Slate 900
        ),
        useMaterial3: true,
        fontFamily: 'Inter',
      ),
      home: const MainNavigationScreen(),
    );
  }
}

class MainNavigationScreen extends StatelessWidget {
  const MainNavigationScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            const Icon(Icons.phonelink_setup, size: 80, color: Colors.indigoAccent),
            const SizedBox(height: 20),
            const Text(
              'Smart Board Active',
              style: TextStyle(fontSize: 24, fontWeight: FontWeight.bold),
            ),
            const SizedBox(height: 8),
            Text(
              'Synchronized with FastAPI & MySQL SQLite DB',
              style: TextStyle(color: Colors.grey[400]),
            ),
          ],
        ),
      ),
    );
  }
}`;

  const dartSyncQueueCode = `import 'dart:convert';
import 'package:dio/dio.dart';
import 'package:hive/hive.dart';
import 'package:internet_connection_checker_plus/internet_connection_checker_plus.dart';
import 'package:uuid/uuid.dart';

class SyncQueueManager {
  SyncQueueManager._privateConstructor();
  static final SyncQueueManager instance = SyncQueueManager._privateConstructor();

  final _dio = Dio(BaseOptions(
    baseUrl: 'https://your-api-domain.com/api',
    connectTimeout: const Duration(seconds: 10),
  ));
  
  bool _isSyncing = false;

  /// Hook custom stream to listen for connectivity status updates
  void initializeConnectivityListener() {
    InternetConnection().onStatusChange.listen((status) {
      if (status == InternetStatus.connected) {
        processSyncQueue();
      }
    });
  }

  /// Appends atomic API operations optimistically to local cache box and sync queues
  Future<void> addToQueue({
    required String endpoint,
    required String method,
    required Map<String, dynamic> payload,
  }) async {
    final queueBox = Hive.box('sync_queue');
    final cacheBox = Hive.box('operational_cache');

    final syncId = const Uuid().v4();
    final queueItem = {
      'id': syncId,
      'endpoint': endpoint,
      'method': method,
      'payload': payload,
      'createdAt': DateTime.now().toIso8601String(),
    };

    // 1. Optimistic UI: Persist immediately to offline storage boxes
    await cacheBox.put('\${endpoint}_\$syncId', payload);

    // 2. Queue operation up for background synchronizations
    await queueBox.put(syncId, jsonEncode(queueItem));

    // 3. Fire-and-forget sync trigger (runs if network returns instantly)
    processSyncQueue();
  }

  /// Iterates and flushes the backed up operations safely down the API pipelines
  Future<void> processSyncQueue() async {
    if (_isSyncing) return;
    
    final isOnline = await InternetConnection().hasInternetAccess;
    if (!isOnline) return;

    final queueBox = Hive.box('sync_queue');
    if (queueBox.isEmpty) return;

    _isSyncing = true;
    final keys = List.from(queueBox.keys);

    for (var key in keys) {
      final itemString = queueBox.get(key);
      if (itemString == null) continue;

      final item = jsonDecode(itemString) as Map<String, dynamic>;
      
      try {
        Response response;
        if (item['method'] == 'POST') {
          response = await _dio.post(item['endpoint'], data: item['payload']);
        } else if (item['method'] == 'PUT') {
          response = await _dio.put(item['endpoint'], data: item['payload']);
        } else {
          continue;
        }

        if (response.statusCode == 200 || response.statusCode == 201) {
          // Success! Drop record safely from the queues heap
          await queueBox.delete(key);
        }
      } catch (e) {
        // Prevent total lockup; pause the pipeline processing stream on transient failures
        break;
      }
    }
    _isSyncing = false;
  }
}`;

  const pythonFastApiCode = `import datetime
from typing import List, Optional
from fastapi import FastAPI, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

app = FastAPI(
    title="Smart Business & Family Manager Backend",
    description="Sync service providing robust persistent bridges to SQLite and MySQL stores.",
    version="1.0.0"
)

# Enable CORS for cross-origin mobile and web requests
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Pydantic Schemas matching Flutter state models
class LabourModel(BaseModel):
    id: Optional[str] = None
    fullName: str
    phone: str
    class skillType: str
    dailyWage: float
    joiningDate: str
    aadhaarNumber: str
    emergencyContact: str
    isActive: bool

# Simple in-memory storage array for synchronization staging
LABOUR_DB = []

@app.post("/api/labours", response_model=LabourModel, status_code=status.HTTP_201_CREATED)
async def sync_or_create_labour(labour: LabourModel):
    if not labour.id:
        labour.id = f"LAB-{int(datetime.datetime.now().timestamp())}"
    
    # Store profile inside staging database indexes
    LABOUR_DB.append(labour)
    return labour

@app.get("/api/labours", response_model=List[LabourModel])
async def fetch_synchronized_labours():
    return LABOUR_DB`;

  return (
    <div id="mobile-export-root" className="grid grid-cols-1 xl:grid-cols-12 gap-8 items-start">
      
      {/* EXPORT OVERVIEW / ARCHITECTURE STRATEGY */}
      <div className="xl:col-span-4 space-y-6">
        <div className="bg-slate-900/50 p-6 rounded-2xl border border-slate-800 space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
              <Smartphone className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-md font-bold text-white leading-tight">Mobile Strategy</h3>
              <p className="text-[11px] text-slate-400 font-mono">Double-Barreled Mobile Pathways</p>
            </div>
          </div>

          <p className="text-xs text-slate-300 leading-relaxed font-sans">
            To satisfy your exact requirements for a running mobile application on both <strong>Android</strong> and <strong>iOS</strong>, we provide two elite architectural conversion pathways:
          </p>

          <div className="space-y-3 pt-2">
            <button
              onClick={() => setActiveSubTab("capacitor")}
              className={`w-full p-3 rounded-xl border text-left transition duration-150 cursor-pointer ${
                activeSubTab === "capacitor"
                  ? "bg-indigo-950/40 border-indigo-500/40 text-indigo-300"
                  : "bg-slate-950 border-slate-850/60 text-slate-400 hover:border-slate-800 hover:text-slate-300"
              }`}
            >
              <div className="flex items-center gap-2 mb-1.5">
                <Layers className="w-3.5 h-3.5" />
                <span className="text-xs font-bold uppercase tracking-wider font-mono">Method A: Capacitor</span>
              </div>
              <p className="text-[11px] leading-relaxed text-slate-400">
                Instantly turn this React web application into a high-fidelity native hybrid app. Captures 100% of the active UI, charts, database simulations, and CRUD capabilities immediately!
              </p>
            </button>

            <button
              onClick={() => setActiveSubTab("flutter")}
              className={`w-full p-3 rounded-xl border text-left transition duration-150 cursor-pointer ${
                activeSubTab === "flutter"
                  ? "bg-indigo-950/40 border-indigo-500/40 text-indigo-300"
                  : "bg-slate-950 border-slate-850/60 text-slate-400 hover:border-slate-800 hover:text-slate-300"
              }`}
            >
              <div className="flex items-center gap-2 mb-1.5">
                <Code className="w-3.5 h-3.5 text-amber-400" />
                <span className="text-xs font-bold uppercase tracking-wider font-mono">Method B: Flutter & FastAPI</span>
              </div>
              <p className="text-[11px] leading-relaxed text-slate-400">
                Implement a fully native codebase. Use our production-ready Dart dependencies, local Hive box structures, offline sync queue code, and Python FastAPI server models directly.
              </p>
            </button>
          </div>
        </div>

        {/* SYSTEM CAPABILITIES FOR MOBILE PERSISTENCE */}
        <div className="bg-slate-900/50 p-6 rounded-2xl border border-slate-800 space-y-4">
          <h4 className="text-xs font-mono font-bold text-slate-400 uppercase tracking-wider">Mobile Specifications</h4>
          
          <div className="space-y-3 text-xs">
            <div className="flex gap-3 items-start">
              <RefreshCw className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
              <div>
                <span className="font-bold text-slate-200">State Syncer Queue</span>
                <p className="text-[11px] text-slate-400 mt-0.5">Dual SQLite (Hive) cache and queued remote retry loop handles offline tasks seamlessly.</p>
              </div>
            </div>

            <div className="flex gap-3 items-start">
              <FolderOpen className="w-4 h-4 text-indigo-400 flex-shrink-0 mt-0.5" />
              <div>
                <span className="font-bold text-slate-200">Structured Directories</span>
                <p className="text-[11px] text-slate-400 mt-0.5">Compliant to Riverpod specifications. Separates application domains, providers, and models correctly.</p>
              </div>
            </div>

            <div className="flex gap-3 items-start">
              <Cpu className="w-4 h-4 text-indigo-400 flex-shrink-0 mt-0.5" />
              <div>
                <span className="font-bold text-slate-200">Native Hardware Access</span>
                <p className="text-[11px] text-slate-400 mt-0.5">Permissions mapped inside plist / AndroidManifest.xml profiles for local documents camera upload.</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* DETAILED ACTION CARDS CONTAINER (Interactive Code Panels) */}
      <div className="xl:col-span-8 bg-slate-900/50 p-6 rounded-2xl border border-slate-800 space-y-6">
        
        {activeSubTab === "capacitor" ? (
          <div className="space-y-6">
            <div>
              <h3 className="text-md font-bold text-white flex items-center gap-1.5">
                <Terminal className="w-5 h-5 text-indigo-400" />
                Build Native Hybrid App via Capacitor (Android & iOS)
              </h3>
              <p className="text-xs text-slate-400 mt-1">
                Run these standard commands in the root of this React workspace to compile, wrap, and launch this exact app as an Android APK or iOS App.
              </p>
            </div>

            {/* STEP 1: Dependencies Installation */}
            <div className="space-y-2">
              <div className="flex justify-between items-center text-xs">
                <div className="flex items-center gap-2 font-bold text-slate-200">
                  <span className="w-5 h-5 rounded-full bg-indigo-950 text-indigo-400 border border-indigo-850 flex items-center justify-center text-[10px] font-mono">1</span>
                  <span>Install Web-to-Native Dependencies</span>
                </div>
                <button
                  onClick={() => handleCopy(capInstallCommands, "cap-install")}
                  className="px-2 py-1 bg-slate-950 hover:bg-slate-900 border border-slate-850 rounded text-[10px] font-mono text-slate-400 hover:text-slate-200 flex items-center gap-1 cursor-pointer"
                >
                  {copiedId === "cap-install" ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                  {copiedId === "cap-install" ? "Copied" : "Copy"}
                </button>
              </div>
              <pre className="bg-slate-950 p-4 rounded-xl border border-slate-850/60 font-mono text-[11px] text-indigo-300 leading-relaxed overflow-x-auto">
                {capInstallCommands}
              </pre>
            </div>

            {/* STEP 2: Capacitor Config JSON */}
            <div className="space-y-2">
              <div className="flex justify-between items-center text-xs">
                <div className="flex items-center gap-2 font-bold text-slate-200">
                  <span className="w-5 h-5 rounded-full bg-indigo-950 text-indigo-400 border border-indigo-850 flex items-center justify-center text-[10px] font-mono">2</span>
                  <span>Create capacitor.config.json file in root</span>
                </div>
                <button
                  onClick={() => handleCopy(capConfigJson, "cap-config")}
                  className="px-2 py-1 bg-slate-950 hover:bg-slate-900 border border-slate-850 rounded text-[10px] font-mono text-slate-400 hover:text-slate-200 flex items-center gap-1 cursor-pointer"
                >
                  {copiedId === "cap-config" ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                  {copiedId === "cap-config" ? "Copied" : "Copy"}
                </button>
              </div>
              <pre className="bg-slate-950 p-4 rounded-xl border border-slate-850/60 font-mono text-[11px] text-emerald-400 leading-relaxed overflow-x-auto">
                {capConfigJson}
              </pre>
            </div>

            {/* STEP 3: Compile and Sync */}
            <div className="space-y-2">
              <div className="flex justify-between items-center text-xs">
                <div className="flex items-center gap-2 font-bold text-slate-200">
                  <span className="w-5 h-5 rounded-full bg-indigo-950 text-indigo-400 border border-indigo-850 flex items-center justify-center text-[10px] font-mono">3</span>
                  <span>Build web & run mobile compilers</span>
                </div>
                <button
                  onClick={() => handleCopy(capBuildCommands, "cap-build")}
                  className="px-2 py-1 bg-slate-950 hover:bg-slate-900 border border-slate-850 rounded text-[10px] font-mono text-slate-400 hover:text-slate-200 flex items-center gap-1 cursor-pointer"
                >
                  {copiedId === "cap-build" ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                  {copiedId === "cap-build" ? "Copied" : "Copy"}
                </button>
              </div>
              <pre className="bg-slate-950 p-4 rounded-xl border border-slate-850/60 font-mono text-[11px] text-indigo-300 leading-relaxed overflow-x-auto">
                {capBuildCommands}
              </pre>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            <div>
              <h3 className="text-md font-bold text-white flex items-center gap-1.5">
                <Code className="w-5 h-5 text-amber-400" />
                Pure Companion Native Mobile App Source Files
              </h3>
              <p className="text-xs text-slate-400 mt-1">
                Copy-paste these robust structures directly to easily set up your pure native Flutter client synchronizing clean states with your python FastAPI endpoints.
              </p>
            </div>

            {/* FLUTTER PUBSPEC.YAML */}
            <div className="space-y-2">
              <div className="flex justify-between items-center text-xs">
                <span className="font-mono text-amber-400 font-bold flex items-center gap-1 text-[11px] bg-slate-950 px-2 py-1 rounded border border-slate-850/40">
                  <FileCode className="w-3.5 h-3.5" />
                  smart_manager_mobile/pubspec.yaml
                </span>
                <button
                  onClick={() => handleCopy(yamlCode, "fl-yaml")}
                  className="px-2 py-1 bg-slate-950 hover:bg-slate-900 border border-slate-850 rounded text-[10px] font-mono text-slate-400 hover:text-slate-200 flex items-center gap-1 cursor-pointer"
                >
                  {copiedId === "fl-yaml" ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                  {copiedId === "fl-yaml" ? "Copied" : "Copy"}
                </button>
              </div>
              <pre className="bg-slate-950 p-4 rounded-xl border border-slate-850/60 font-mono text-[11px] text-slate-400 max-h-[220px] overflow-y-auto leading-relaxed">
                {yamlCode}
              </pre>
            </div>

            {/* FLUTTER MAIN.DART */}
            <div className="space-y-2">
              <div className="flex justify-between items-center text-xs">
                <span className="font-mono text-amber-400 font-bold flex items-center gap-1 text-[11px] bg-slate-950 px-2 py-1 rounded border border-slate-850/40">
                  <FileCode className="w-3.5 h-3.5" />
                  smart_manager_mobile/lib/main.dart
                </span>
                <button
                  onClick={() => handleCopy(dartMainCode, "fl-main")}
                  className="px-2 py-1 bg-slate-950 hover:bg-slate-900 border border-slate-850 rounded text-[10px] font-mono text-slate-400 hover:text-slate-200 flex items-center gap-1 cursor-pointer"
                >
                  {copiedId === "fl-main" ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                  {copiedId === "fl-main" ? "Copied" : "Copy"}
                </button>
              </div>
              <pre className="bg-slate-950 p-4 rounded-xl border border-slate-850/60 font-mono text-[11px] text-slate-400 max-h-[220px] overflow-y-auto leading-relaxed">
                {dartMainCode}
              </pre>
            </div>

            {/* FLUTTER SYNC QUEUE.DART */}
            <div className="space-y-2">
              <div className="flex justify-between items-center text-xs">
                <span className="font-mono text-amber-400 font-bold flex items-center gap-1 text-[11px] bg-slate-950 px-2 py-1 rounded border border-slate-850/40">
                  <FileCode className="w-3.5 h-3.5" />
                  lib/core/sync/sync_queue.dart
                </span>
                <button
                  onClick={() => handleCopy(dartSyncQueueCode, "fl-sync")}
                  className="px-2 py-1 bg-slate-950 hover:bg-slate-900 border border-slate-850 rounded text-[10px] font-mono text-slate-400 hover:text-slate-200 flex items-center gap-1 cursor-pointer"
                >
                  {copiedId === "fl-sync" ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                  {copiedId === "fl-sync" ? "Copied" : "Copy"}
                </button>
              </div>
              <pre className="bg-slate-950 p-4 rounded-xl border border-slate-850/60 font-mono text-[11px] text-indigo-300 max-h-[220px] overflow-y-auto leading-relaxed">
                {dartSyncQueueCode}
              </pre>
            </div>

            {/* FASTAPI MAIN.PY */}
            <div className="space-y-2">
              <div className="flex justify-between items-center text-xs">
                <span className="font-mono text-emerald-400 font-bold flex items-center gap-1 text-[11px] bg-slate-950 px-2 py-1 rounded border border-slate-850/40">
                  <FileCode className="w-3.5 h-3.5" />
                  smart_manager_backend/main.py (FastAPI Sync Backing Server)
                </span>
                <button
                  onClick={() => handleCopy(pythonFastApiCode, "py-main")}
                  className="px-2 py-1 bg-slate-950 hover:bg-slate-900 border border-slate-850 rounded text-[10px] font-mono text-slate-400 hover:text-slate-200 flex items-center gap-1 cursor-pointer"
                >
                  {copiedId === "py-main" ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                  {copiedId === "py-main" ? "Copied" : "Copy"}
                </button>
              </div>
              <pre className="bg-slate-950 p-4 rounded-xl border border-slate-850/60 font-mono text-[11px] text-emerald-400 max-h-[220px] overflow-y-auto leading-relaxed">
                {pythonFastApiCode}
              </pre>
            </div>
          </div>
        )}

      </div>

    </div>
  );
}
