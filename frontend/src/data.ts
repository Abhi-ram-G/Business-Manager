/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

// Delivery 3: Flutter Folder Structure Data (Interactive tree model)
export interface FileNode {
  name: string;
  type: "file" | "folder";
  description?: string;
  children?: FileNode[];
}

export const flutterFolderStructure: FileNode = {
  name: "smart_manager_mobile",
  type: "folder",
  description: "Flutter App root directory",
  children: [
    {
      name: "android",
      type: "folder",
      description: "Android native configuration, permissions, and Gradle builds"
    },
    {
      name: "ios",
      type: "folder",
      description: "iOS native configuration, CocoaPods, and Info.plist permissions"
    },
    {
      name: "assets",
      type: "folder",
      description: "Static visual resources and document caches",
      children: [
        { name: "icons", type: "folder", description: "Custom UI SVG paths and launcher logos" },
        { name: "images", type: "folder", description: "Placeholder banners and onboarding visuals" },
        { name: "fonts", type: "folder", description: "Local Google Fonts (Inter, JetBrains Mono)" }
      ]
    },
    {
      name: "lib",
      type: "folder",
      description: "Main application source files containing Riverpod providers and presentation screens- structured cleanly by feature",
      children: [
        {
          name: "core",
          type: "folder",
          description: "Global cross-cutting utilities, security layers, and common widgets",
          children: [
            {
              name: "network",
              type: "folder",
              description: "Dio HTTP Client instances with JWT auto-refresh and connection retries",
              children: [
                { name: "dio_client.dart", type: "file", description: "Custom configured Dio with dynamic headers and connection handling" },
                { name: "api_endpoints.dart", type: "file", description: "Centralized backend path registry" }
              ]
            },
            {
              name: "database",
              type: "folder",
              description: "Hive initialized boxes, encryption, and safe backup rules",
              children: [
                { name: "hive_manager.dart", type: "file", description: "Coordinates box openings, TypeAdapters, encryption keys, and cache purges" }
              ]
            },
            {
              name: "sync",
              type: "folder",
              description: "Offline sync logic running in the background",
              children: [
                { name: "sync_queue.dart", type: "file", description: "Stores failed actions in local SQL/Hive and retries when network becomes available" },
                { name: "conflict_resolver.dart", type: "file", description: "Applies 'server-wins' or 'last-write-wins' rules during synchronization merges" }
              ]
            },
            {
              name: "theme",
              type: "folder",
              description: "Consistent branding palette, styled typography, and component decorations",
              children: [
                { name: "app_theme.dart", type: "file", description: "Design definitions for Dark & Light modes matching ERP guidelines" }
              ]
            }
          ]
        },
        {
          name: "features",
          type: "folder",
          description: "Encapsulated business modules containing clean code domain splits",
          children: [
            {
              name: "auth",
              type: "folder",
              description: "Secure login, token storage, and multi-user role assignments",
              children: [
                { name: "controllers", type: "folder", description: "Riverpod state controllers tracking active user roles" },
                { name: "views", type: "folder", description: "Login, lock screen, and registration gates" }
              ]
            },
            {
              name: "labour",
              type: "folder",
              description: "Module 1: Labour Directory, Attendance records, and Salary counters",
              children: [
                { name: "models", type: "folder", description: "Data schema definition and Hive adapter generators" },
                { name: "providers", type: "folder", description: "Business logic manipulating attendance and payments state" },
                { name: "views", type: "folder", description: "Labour lists, attendance sliders, and salary history widgets" }
              ]
            },
            {
              name: "vehicle",
              type: "folder",
              description: "Module 2: Fleet profiles, fuel records, log trips, and reminders",
              children: [
                { name: "models", type: "folder", description: "Vehicle, Trip, and Fuel schemas" },
                { name: "providers", type: "folder", description: "Calculators for fuel economy and logistics profitability" },
                { name: "views", type: "folder", description: "Fleet dashboard, active trip tracker, and log entries" }
              ]
            },
            {
              name: "finance",
              type: "folder",
              description: "Module 3: Debt collection tracking (Give) and Lender repayments (Get)",
              children: [
                { name: "models", type: "folder", description: "Loan, EMI, Lender, and Defaulter shapes" },
                { name: "providers", type: "folder", description: "Daily interest processors and pending alert registers" },
                { name: "views", type: "folder", description: "Borrower roster, loan ledger, and interest calculators" }
              ]
            },
            {
              name: "expenses",
              type: "folder",
              description: "Module 4: Family member directories, dynamic categories, and budgets",
              children: [
                { name: "models", type: "folder", description: "Expense, Budget, and Income sheets" },
                { name: "providers", type: "folder", description: "Category-wise spend analyzers and monthly surplus counts" },
                { name: "views", type: "folder", description: "Bento grid analytics, expense sheets, and budget rings" }
              ]
            }
          ]
        },
        { name: "main.dart", type: "file", description: "App bootstrapper initializing local configs, Hive, and starting ProviderScope" }
      ]
    },
    { name: "pubspec.yaml", type: "file", description: "App package configurations declaring Dio, Riverpod, Hive, fl_chart, and permissions" }
  ]
};

// FastAPI Backend Folder Structure Data
export const fastapiFolderStructure: FileNode = {
  name: "smart_manager_backend",
  type: "folder",
  description: "FastAPI Python Backend root directory",
  children: [
    {
      name: "app",
      type: "folder",
      description: "Core application directory",
      children: [
        {
          name: "core",
          type: "folder",
          description: "System security, database configurations, and environment initialization",
          children: [
            { name: "config.py", type: "file", description: "Reads env variables (DB credentials, JWT secrets, Firebase details)" },
            { name: "security.py", type: "file", description: "Password hashing using Passlib and JWT claims processing" },
            { name: "db.py", type: "file", description: "SQLAlchemy sessionmaker configured with connection pooling rules" }
          ]
        },
        {
          name: "models",
          type: "folder",
          description: "Database models mirroring physical MySQL tables",
          children: [
            { name: "base.py", type: "file", description: "Shared declarative base class with audit timestamps and IDs" },
            { name: "labour.py", type: "file", description: "Labour, Attendance, and Salary relationship models" },
            { name: "vehicle.py", type: "file", description: "Vehicle, Fuel, Trip, and Maintenance models" },
            { name: "finance.py", type: "file", description: "Loan, Borrower, and Lender schema mappings" },
            { name: "expense.py", type: "file", description: "Family expenses, budgets, and member tracking" },
            { name: "document.py", type: "file", description: "Document records mapped to secure disk storage or S3 metadata" }
          ]
        },
        {
          name: "schemas",
          type: "folder",
          description: "Pydantic validator models for robust input inspection",
          children: [
            { name: "labour_schema.py", type: "file", description: "Inputs validation for active worker profile creations" },
            { name: "vehicle_schema.py", type: "file", description: "Insurance date matching and registration filters" },
            { name: "finance_schema.py", type: "file", description: "Pydantic rules for logical EMIs validation" },
            { name: "expense_schema.py", type: "file", description: "Limits check and spending structures" },
            { name: "auth_schema.py", type: "file", description: "Login credentials formats and JWT payloads validation" }
          ]
        },
        {
          name: "routers",
          type: "folder",
          description: "RESTful route handlers decoupled elegantly by domain",
          children: [
            { name: "auth.py", type: "file", description: "Generates JWT tokens with secure expiration criteria" },
            { name: "labour.py", type: "file", description: "CRUD endpoints for marking attendance and paying worker salaries" },
            { name: "vehicle.py", type: "file", description: "Fleet logistics handler checking insurance dates" },
            { name: "finance.py", type: "file", description: "Handles EMI collections and calculates borrower outstanding lists" },
            { name: "expense.py", type: "file", description: "Exposes category spending streams and tracks daily budgets" },
            { name: "document.py", type: "file", description: "Coordinates file chunking, signature checks, and binary transfers" }
          ]
        },
        {
          name: "services",
          type: "folder",
          description: "Standalone business layers and external API connectors",
          children: [
            { name: "notification_service.py", type: "file", description: "Dispatches push alerts directly to Google Firebase Cloud Messaging APIs" },
            { name: "sync_service.py", type: "file", description: "Performs bulk logs uploads merging, parsing payloads with timestamps" }
          ]
        },
        { name: "main.py", type: "file", description: "FastAPI main launcher registering API paths, CORS, and starting Uvicorn server" }
      ]
    },
    { name: "requirements.txt", type: "file", description: "Python references (fastapi, uvicorn, sqlalchemy, PyMySQL, pydantic, pyjwt)" },
    { name: "Dockerfile", type: "file", description: "Multi-stage Docker builds configured for easy server container deploys" }
  ]
};

// SQL Schema Specifications
export interface TableSchema {
  tableName: string;
  description: string;
  sql: string;
}

export const sqlSchemas: TableSchema[] = [
  {
    tableName: "users",
    description: "System logins, permissions mapping, hashed pass keys, and FCM notification tokens.",
    sql: `CREATE TABLE users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  username VARCHAR(50) NOT NULL UNIQUE,
  email VARCHAR(100) NOT NULL UNIQUE,
  hashed_password VARCHAR(255) NOT NULL,
  role ENUM('Admin', 'Manager', 'Accountant', 'FamilyMember') NOT NULL,
  fcm_token VARCHAR(255) DEFAULT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);`
  },
  {
    tableName: "labours",
    description: "Module 1: Directory logs detailing individual skills, joining dates, and payroll variables.",
    sql: `CREATE TABLE labours (
  id VARCHAR(50) PRIMARY KEY, -- Generated ID e.g., LAB-2026-001
  full_name VARCHAR(100) NOT NULL,
  phone_number VARCHAR(15) NOT NULL,
  address TEXT NOT NULL,
  skill_type VARCHAR(50) NOT NULL,
  daily_wage DECIMAL(10, 2) NOT NULL,
  joining_date DATE NOT NULL,
  aadhaar_number VARCHAR(12) NOT NULL UNIQUE,
  emergency_contact VARCHAR(15) NOT NULL,
  profile_photo_url VARCHAR(255) DEFAULT NULL,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);`
  },
  {
    tableName: "attendance",
    description: "Module 1: Records daily labor shifts, backing up biometric/manual entries.",
    sql: `CREATE TABLE attendance (
  id INT AUTO_INCREMENT PRIMARY KEY,
  labour_id VARCHAR(50) NOT NULL,
  date DATE NOT NULL,
  status ENUM('Present', 'Absent', 'Half-Day') NOT NULL,
  marked_by INT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (labour_id) REFERENCES labours(id) ON DELETE CASCADE,
  FOREIGN KEY (marked_by) REFERENCES users(id),
  UNIQUE KEY unique_daily_attendance (labour_id, date)
);`
  },
  {
    tableName: "salaries",
    description: "Module 1: Computes individual monthly payroll, calculating dynamic logs for advance subtractions.",
    sql: `CREATE TABLE salaries (
  id INT AUTO_INCREMENT PRIMARY KEY,
  labour_id VARCHAR(50) NOT NULL,
  billing_month VARCHAR(7) NOT NULL, -- Format: YYYY-MM
  days_present INT NOT NULL,
  days_half_day INT NOT NULL,
  gross_calculated DECIMAL(10, 2) NOT NULL,
  advance_deductions DECIMAL(10, 2) DEFAULT 0.00,
  bonus_additions DECIMAL(10, 2) DEFAULT 0.00,
  net_payout DECIMAL(10, 2) NOT NULL,
  payment_status ENUM('Paid', 'Pending') NOT NULL DEFAULT 'Pending',
  paid_date DATE DEFAULT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (labour_id) REFERENCES labours(id) ON DELETE CASCADE
);`
  },
  {
    tableName: "vehicles",
    description: "Module 2: Fleet asset manager containing driver registrations, maintenance schedules, and permit expiries.",
    sql: `CREATE TABLE vehicles (
  vehicle_number VARCHAR(20) PRIMARY KEY, -- e.g., KA-01-MJ-1234
  vehicle_type ENUM('Truck', 'Tractor', 'Car', 'Van', 'Two-Wheeler') NOT NULL,
  brand VARCHAR(50) NOT NULL,
  model VARCHAR(50) NOT NULL,
  driver_name VARCHAR(100) NOT NULL,
  insurance_number VARCHAR(50) NOT NULL,
  insurance_expiry DATE NOT NULL,
  rc_expiry DATE NOT NULL,
  pollution_expiry DATE NOT NULL,
  next_service_due DATE DEFAULT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);`
  },
  {
    tableName: "fuel_entries",
    description: "Module 2: Real-time efficiency indicators registering expenses and mileage variables.",
    sql: `CREATE TABLE fuel_entries (
  id INT AUTO_INCREMENT PRIMARY KEY,
  vehicle_number VARCHAR(20) NOT NULL,
  date DATE NOT NULL,
  liters_filled DECIMAL(8, 2) NOT NULL,
  cost_per_liter DECIMAL(8, 2) NOT NULL,
  total_cost DECIMAL(10, 2) GENERATED ALWAYS AS (liters_filled * cost_per_liter) STORED,
  current_odometer INT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (vehicle_number) REFERENCES vehicles(vehicle_number) ON DELETE CASCADE
);`
  },
  {
    tableName: "trips",
    description: "Module 2: Tracks fleet routes, logistics dispatches, and payload revenue.",
    sql: `CREATE TABLE trips (
  id INT AUTO_INCREMENT PRIMARY KEY,
  vehicle_number VARCHAR(20) NOT NULL,
  date DATE NOT NULL,
  start_location VARCHAR(100) NOT NULL,
  end_location VARCHAR(100) NOT NULL,
  distance_covered DECIMAL(10, 2) NOT NULL,
  revenue_earned DECIMAL(10, 2) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (vehicle_number) REFERENCES vehicles(vehicle_number) ON DELETE CASCADE
);`
  },
  {
    tableName: "loans_given",
    description: "Module 3: Tracks money lent out, automatic compound interest calculations, and due schedules.",
    sql: `CREATE TABLE loans_given (
  id INT AUTO_INCREMENT PRIMARY KEY,
  borrower_name VARCHAR(100) NOT NULL,
  mobile_number VARCHAR(15) NOT NULL,
  address TEXT NOT NULL,
  loan_amount DECIMAL(12, 2) NOT NULL,
  interest_rate_annual DECIMAL(5, 2) NOT NULL, -- Annual Interest Percentage
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  emi_amount DECIMAL(10, 2) NOT NULL,
  due_date_day INT NOT NULL CHECK (due_date_day BETWEEN 1 AND 28),
  total_repaid DECIMAL(12, 2) DEFAULT 0.00,
  is_defaulter BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);`
  },
  {
    tableName: "loans_received",
    description: "Module 3: Formulated logs managing borrowed capitals, interest rates, and outgoing repayments.",
    sql: `CREATE TABLE loans_received (
  id INT AUTO_INCREMENT PRIMARY KEY,
  lender_name VARCHAR(100) NOT NULL,
  mobile_number VARCHAR(15) NOT NULL,
  address TEXT NOT NULL,
  borrowed_amount DECIMAL(12, 2) NOT NULL,
  interest_rate_annual DECIMAL(5, 2) NOT NULL,
  start_date DATE NOT NULL,
  repayment_schedule ENUM('Monthly', 'Quarterly', 'One-time') NOT NULL,
  total_repaid DECIMAL(12, 2) DEFAULT 0.00,
  due_date DATE NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);`
  },
  {
    tableName: "family_members",
    description: "Module 4: Identifies family group profiles for aggregated budget tracking.",
    sql: `CREATE TABLE family_members (
  id INT AUTO_INCREMENT PRIMARY KEY,
  full_name VARCHAR(100) NOT NULL,
  relationship VARCHAR(50) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);`
  },
  {
    tableName: "family_expenses",
    description: "Module 4: Ledger system logging precise outlays categorized across household categories.",
    sql: `CREATE TABLE family_expenses (
  id INT AUTO_INCREMENT PRIMARY KEY,
  family_member_id INT NOT NULL,
  category ENUM('Food', 'Medical', 'Education', 'Shopping', 'Transport', 'Travel', 'Entertainment', 'Utilities') NOT NULL,
  amount DECIMAL(10, 2) NOT NULL,
  date DATE NOT NULL,
  description VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (family_member_id) REFERENCES family_members(id) ON DELETE CASCADE
);`
  },
  {
    tableName: "documents",
    description: "Module 6: Digitized folder of file uploads, storing path tags, access permissions, and renewal alerts.",
    sql: `CREATE TABLE documents (
  id INT AUTO_INCREMENT PRIMARY KEY,
  file_name VARCHAR(150) NOT NULL,
  document_type ENUM('Aadhaar', 'PAN', 'RC Book', 'Insurance', 'Loan Agreement', 'Salary Record') NOT NULL,
  owner_name VARCHAR(100) NOT NULL,
  storage_path VARCHAR(255) NOT NULL,
  file_size_kb INT NOT NULL,
  expiry_date DATE DEFAULT NULL,
  status ENUM('Active', 'Expired', 'Pending Review') DEFAULT 'Active',
  uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);`
  }
];

// Delivery 6: Rest API Endpoints Registry for Interactive Playground
export interface ApiEndpoint {
  id: string;
  method: "GET" | "POST" | "PUT" | "DELETE";
  path: string;
  module: string;
  description: string;
  requestBody?: string;
  responsePayload: string;
}

export const apiEndpoints: ApiEndpoint[] = [
  {
    id: "auth-login",
    method: "POST",
    path: "/api/v1/auth/token",
    module: "Security",
    description: "Authenticates an enterprise user or family member and yields a secure JWT token.",
    requestBody: `{
  "username": "admin_master",
  "password": "SecurePassword123"
}`,
    responsePayload: `{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.ey...",
  "token_type": "bearer",
  "expires_in": 86400,
  "role": "Admin",
  "name": "Abhiram Ad"
}`
  },
  {
    id: "labour-create",
    method: "POST",
    path: "/api/v1/labours/",
    module: "Labour Management",
    description: "Adds a new worker to the active employee file. Syncs with Hive local cache.",
    requestBody: `{
  "full_name": "Rmesh Kumar",
  "phone_number": "+919876543210",
  "address": "12-A, Metro Street, Chennai",
  "skill_type": "Masonry",
  "daily_wage": 750.00,
  "joining_date": "2026-04-10",
  "aadhaar_number": "123456789012",
  "emergency_contact": "+919876543219"
}`,
    responsePayload: `{
  "status": "success",
  "id": "LAB-2210-91",
  "message": "Labour card successfully created and indexed",
  "labour": {
    "full_name": "Rmesh Kumar",
    "skill_type": "Masonry",
    "daily_wage": 750.00,
    "is_active": true
  }
}`
  },
  {
    id: "attendance-mark",
    method: "POST",
    path: "/api/v1/labours/attendance",
    module: "Labour Management",
    description: "Bulk marks attendance for labour list on a specific business date.",
    requestBody: `{
  "date": "2026-06-14",
  "records": [
    { "labour_id": "LAB-2210-91", "status": "Present" },
    { "labour_id": "LAB-1102-86", "status": "Half-Day" }
  ]
}`,
    responsePayload: `{
  "message": "Attendance marked successfully",
  "total_records": 2,
  "updated_at": "2026-06-14T11:05:00Z"
}`
  },
  {
    id: "salary-calculate",
    method: "GET",
    path: "/api/v1/labours/salary-pending",
    module: "Labour Management",
    description: "Computes active salaries owed, calculating deductions for advance loans.",
    responsePayload: `[
  {
    "labour_id": "LAB-2210-91",
    "name": "Rmesh Kumar",
    "present_days": 24,
    "wage_rate": 750.00,
    "base_payout": 18000.00,
    "advance_deductions": 1500.00,
    "net_outstanding": 16500.00
  }
]`
  },
  {
    id: "vehicle-create",
    method: "POST",
    path: "/api/v1/vehicles/",
    module: "Vehicle Fleet",
    description: "Indexes a high-capacity logistics vehicle or personal family car.",
    requestBody: `{
  "vehicle_number": "KA-51-MM-9999",
  "vehicle_type": "Truck",
  "brand": "Tata Motors",
  "model": "Prima 2825.K",
  "driver_name": "Suresh Singh",
  "insurance_number": "INS-9080-X92",
  "insurance_expiry": "2026-12-31",
  "rc_expiry": "2031-06-15",
  "pollution_expiry": "2026-09-14"
}`,
    responsePayload: `{
  "vehicle_number": "KA-51-MM-9999",
  "status": "Registered",
  "next_mandatory_service": "2026-08-15"
}`
  },
  {
    id: "fuel-log",
    method: "POST",
    path: "/api/v1/vehicles/fuel",
    module: "Vehicle Fleet",
    description: "Logs fuel transaction to analyze fleet fuel economy and route expense metrics.",
    requestBody: `{
  "vehicle_number": "KA-51-MM-9999",
  "date": "2026-06-14",
  "liters_filled": 80.00,
  "cost_per_liter": 94.50,
  "current_odometer": 45220
}`,
    responsePayload: `{
  "id": 401,
  "vehicle_number": "KA-51-MM-9999",
  "total_cost": 7560.00,
  "calculated_efficiency_mpg": "11.4 L/100km"
}`
  },
  {
    id: "loan-give-emi",
    method: "POST",
    path: "/api/v1/loans/given/collect-emi",
    module: "Finance Management",
    description: "Registers receipt of monthly EMI repayment from borrower and cuts principal debt.",
    requestBody: `{
  "borrower_id": 12,
  "amount_paid": 5000.00,
  "received_date": "2026-06-14"
}`,
    responsePayload: `{
  "borrower_name": "Kartik Shah",
  "emi_amount": 5000.00,
  "remaining_loan_balance": 35000.00,
  "repayment_status": "Paid-On-Time",
  "defaulter_flag_cleared": true
}`
  },
  {
    id: "expense-add",
    method: "POST",
    path: "/api/v1/expenses/",
    module: "Family Expenses",
    description: "Logs house expense, checking if the category allocation has crossed warning threshold.",
    requestBody: `{
  "family_member_id": 3,
  "category": "Medical",
  "amount": 4200.00,
  "date": "2026-06-13",
  "description": "Annual general health checkup and medicine purchase"
}`,
    responsePayload: `{
  "id": 9802,
  "category": "Medical",
  "allocated_budget": 10000.00,
  "spent_to_date_this_month": 8200.00,
  "budget_remaining": 18000.00,
  "alert_trigger": {
    "triggered": false,
    "fcm_payload": null
  }
}`
  }
];

// Delivery 9: Detailed User Stories
export interface UserStory {
  id: string;
  title: string;
  role: string;
  action: string;
  benefit: string;
  criteria: string[];
  status: "To Do" | "In Progress" | "Done";
  priority: "High" | "Medium" | "Low";
}

export const userStories: UserStory[] = [
  {
    id: "US-001",
    title: "Biometric & Attendance Offline Capture",
    role: "Manager",
    action: "mark daily labour attendance with quick-swipe checkboxes offline without cell signal",
    benefit: "save active minutes while at isolated warehouse facilities and sync changes once connected",
    status: "Done",
    priority: "High",
    criteria: [
      "Must show list of all active labour entries grouped alphabetically",
      "Should allow toggling attendance to 'Present', 'Absent', or 'Half-Day' with a single tap",
      "Must commit change immediately to local Hive cache",
      "Must flag un-synced attendance markers with a red status icon, modifying to green once HTTP 201 is returned"
    ]
  },
  {
    id: "US-002",
    title: "Active Permit & Expiry Dynamic Reminders",
    role: "Admin",
    action: "view active warning colors or get automated FCM alerts of Vehicle Insurance/RC expiry",
    benefit: "avoid heavy legal fines and pre-schedule safety inspections seamlessly",
    status: "Done",
    priority: "High",
    criteria: [
      "Must highlight vehicle cards expiring in 30 days with a yellow visual banner",
      "Must label expired documents in bold crimson and lock trip logging for that asset",
      "Must dispatch push notifications at 9:00 AM exactly 14, 7, and 1 day prior to expiries"
    ]
  },
  {
    id: "US-003",
    title: "Auto-Calculated Compound Loans & Outstanding",
    role: "Accountant",
    action: "input lending details and see interest rates and monthly EMIs calculated in real time",
    benefit: "track total cash outstanding and prevent losses to borrower default",
    status: "In Progress",
    priority: "High",
    criteria: [
      "Must support adding borrowers with fields for interest rates, due dates, and initial amount",
      "Must display compound interest yield graphs",
      "Must flag user as 'Defaulter' automatically if payment is missed past grace period duration"
    ]
  },
  {
    id: "US-004",
    title: "Category-Wise Spending Cap Alerts",
    role: "Family Member",
    action: "insert daily grocery, tuition or medical transactions and see active budget progress limits",
    benefit: "plan monthly investments and keep expenses aligned with savings rate goals",
    status: "To Do",
    priority: "Medium",
    criteria: [
      "Must allow configuring limits for Food, Utilities, Shopping, Travel, and Entertainment",
      "Must render a colorful dynamic progress ring that fills as category entries are added",
      "Must dispatch a background warnings FCM token message when spending exceeds 90% of capacity"
    ]
  }
];

// Delivery 11: Deployment Roadmap
export interface Milestone {
  id: string;
  title: string;
  duration: string;
  tasks: string[];
}

export const developmentRoadmap: Milestone[] = [
  {
    id: "Phase 1: Foundations",
    title: "Secure Local Storage & JWT Handshakes",
    duration: "Weeks 1 - 2",
    tasks: [
      "Configure Flutter Riverpod providers and local Hive adapters",
      "Publish basic FastAPI skeleton with passlib password encryption",
      "Perform secure token authorization validations against local MySQL pools"
    ]
  },
  {
    id: "Phase 2: Labour & Vehicles",
    title: "Labour Rosters & Logistics Loggers",
    duration: "Weeks 3 - 5",
    tasks: [
      "Implement bidirectional offline sync pipeline using SQLite sync queues",
      "Build Labour biometric indicators and monthly salary calculation routes",
      "Deliver fuel receipt image uploading alongside insurance renewal schedules"
    ]
  },
  {
    id: "Phase 3: Financial Ledgers",
    title: "Loan Interest Engines & Category Budgets",
    duration: "Weeks 6 - 8",
    tasks: [
      "Assemble EMI payment scheduler utilizing automatic interest processors",
      "Design family members custom budget graphs using fl_chart bindings",
      "Install Firebase Cloud Messaging (FCM) push notification controllers"
    ]
  }
];
