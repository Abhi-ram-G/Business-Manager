/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo, useEffect, useRef, useCallback } from "react";
import { 
  Briefcase, 
  Car, 
  DollarSign, 
  Home, 
  Users, 
  FileText, 
  Bell, 
  Lock, 
  CheckCircle, 
  AlertTriangle, 
  TrendingUp, 
  ArrowUpRight, 
  ArrowDownLeft, 
  Calendar, 
  Plus, 
  Trash2, 
  Upload, 
  Download, 
  Cloud, 
  Zap, 
  HelpCircle, 
  Search, 
  User, 
  Settings, 
  Eye,
  EyeOff,
  Database, 
  BookOpen,
  PieChart,
  LayoutGrid,
  Smartphone,
  Menu,
  X,
  ChevronLeft,
  ChevronRight
} from "lucide-react";

// Imports of Modular Technical Blueprint components
import MobileDashboard from "./components/MobileDashboard";
import MobileBusiness from "./components/MobileBusiness";
import MobileFinance from "./components/MobileFinance";
import MobileFamily from "./components/MobileFamily";

// Importing types and SQL schemas
import { 
  UserRole, 
  Labour, 
  AttendanceRecord, 
  SalaryPayment, 
  Vehicle, 
  BitEntry,
  HammerEntry,
  PipeEntry,
  BusinessBill,
  FuelEntry, 
  TripRecord, 
  LoanGiven, 
  LoanReceived, 
  FamilyMember, 
  IncomeEntry,
  FamilyExpense, 
  CategoryBudget, 
  ManagedDocument, 
  AppNotification 
} from "./types";
import { sqlSchemas, userStories, developmentRoadmap } from "./data";
import { fetchSharedSnapshot, requestJson } from "./lib/sharedApi";
import srsLogo from "./assets/images/srs_logo.svg";

const SHARED_DATA_REVISION_KEY = "srs_shared_data_revision";

const translations = {
  en: {
    dashboard: "Dashboard Hub",
    business: "Business",
    finance: "Finance",
    expenses: "Family Budgeting",
    vault: "Secure Vault",
    reminders: "Reminders & Alerts",
    settings: "System Settings",
    lock: "Lock",
    unlock: "Unlock App",
    pin: "Passcode PIN",
    enter_pin: "Enter PIN",
    checking_pin: "Checking PIN...",
    
    operations_analytics: "Financial & Operations Analytics",
    ops_subtitle: "Real-time consolidated balance sheet & resource allocation",
    active_roster: "Active June Roster",
    net_cash_flow: "Net Cash Flow",
    labour_count: "Labour Count",
    active: "Active",
    lent_portfolio: "Lent Portfolio",
    family_expenses: "Family Expenses",
    family_savings: "Family Savings",
    surplus: "Surplus",
    bit_count: "Bit Count",
    hammer_count: "Hammer Count",
    bill_count: "Bill Count",
    pending_bills_amount: "Pending Bills Amount",
    
    business_ops: "Business Operations",
    fleet_workforce: "Fleet & Workforce",
    workforce_roster: "WORKFORCE ROSTER",
    drivers: "Drivers",
    helpers: "Helpers",
    total_vehicles: "TOTAL VEHICLES",
    registered: "Registered",
    salary_paid: "SALARY PAID",
    salary_pending: "SALARY PENDING",
    fuel_expenses: "FUEL EXPENSES",
    finance_flows: "FINANCE FLOWS",
    lent: "Lent",
    borrowed: "Borrowed",
    
    lending_credit: "Lending & Credit Desk",
    interest_portfolios: "Interest-Bearing Portfolios",
    interest_accrued: "INTEREST ACCRUED",
    interest_serviced: "INTEREST SERVICED",
    pending_collections: "PENDING COLLECTIONS",
    pending_payments: "PENDING PAYMENTS",
    earned_lent: "Earned from lent funds",
    paid_lenders: "Paid to outside lenders",
    receivables_interest: "Receivables with interest",
    payables_interest: "Payables with interest",
    
    family_budgets: "Family Budgets & Outlays",
    domestic_expenses: "Domestic Expenses",
    cumulative_outlay: "Cumulative Outlay",
    june_budget: "June Monthly Budget",
    monthly_share: "Monthly Share of Cumulative Budget",
    active_categories: "Active Categories",
    analytical_graphics: "Live Analytical Graphics",
    interactive: "Interactive",
    payroll_ratios: "Workforce Payroll Ratios",
    paid_ratio: "Paid",
    pending_ratio: "Pending",
    diesel_outlay: "Weekly Fleet Diesel Outlay",
    lending_borrowing: "Lending vs Borrowing Ratio",
    active_domestic: "Active Domestic Budgets Ratio",
    total: "Total",
    spent: "Spent",
    
    all_details: "Detailed Operational Ledgers",
    view_all_details: "Expand All Records Below",
    hide_details: "Collapse Records",
    workforce_details: "Workforce Directory Details",
    fleet_details: "Fleet Registry & Fuel Logs",
    debt_details: "Debt Portfolio Ledgers",
    family_ledger_details: "Family Outflow & Income Logs",
    name: "Name",
    skill: "Skill/Role",
    wage: "Daily Wage",
    contact: "Contact Cell",
    status: "Status",
    vehicle_no: "Vehicle No",
    driver: "Driver Name",
    fuel_date: "Date",
    liters: "Liters",
    amount: "Amount",
    borrower: "Borrower",
    lender: "Lender",
    rate: "Rate",
    repaid: "Repaid",
    category: "Category",
    member: "Member Name",
    date: "Date",
    source: "Source",
    
    cancel: "Cancel",
    save: "Save",
    delete: "Delete",
    add: "Add New",

    // Ledger section keys
    loans_details: "Loans & Debt Portfolio",
    loans_given: "Loans Given (Lent)",
    loans_received: "Loans Received (Borrowed)",
    family_ledger: "Family Expense Ledger",
    inactive: "Inactive",
    daily_wage: "Daily Wage / Salary",
    fuel_total: "Fuel Spent",
    entries: "entries",
    no_records: "No records found",
    total_expenses: "Total Expenses",
    monthly_budget: "Monthly Budget",
    live_analytics: "Live Analytical Graphics",
    salary: "Salary",
    fuel: "Fuel",
    credit: "Credit",
    family: "Family"
  },
  ta: {
    dashboard: "தகவல் பலகை",
    business: "தொழில்",
    finance: "நிதி நிலை",
    expenses: "குடும்ப வரவு செலவு",
    vault: "பாதுகாப்பான பெட்டகம்",
    reminders: "நினைவூட்டல்கள்",
    settings: "அமைப்பு அமைப்புகள்",
    lock: "பூட்டு",
    unlock: "செயலியைத் திற",
    pin: "கடவுச்சொல் பின்",
    enter_pin: "பின் எண்ணை உள்ளிடவும்",
    checking_pin: "சரிபார்க்கப்படுகிறது...",
    
    operations_analytics: "நிதி மற்றும் செயல்பாட்டு பகுப்பாய்வு",
    ops_subtitle: "உண்மையான நேர ஒருங்கிணைந்த இருப்புநிலை மற்றும் வள ஒதுக்கீடு",
    active_roster: "செயலில் உள்ள ஜூன் பட்டியல்",
    net_cash_flow: "நிகர பணப்புழக்கம்",
    labour_count: "பணியாளர்கள் எண்ணிக்கை",
    active: "செயலில்",
    lent_portfolio: "வழங்கிய கடன்கள்",
    family_expenses: "குடும்ப செலவுகள்",
    family_savings: "குடும்ப சேமிப்பு",
    surplus: "கூடுதல் சேமிப்பு",
    bit_count: "பிட் எண்ணிக்கை",
    hammer_count: "சுத்தியல் எண்ணிக்கை",
    bill_count: "பில் எண்ணிக்கை",
    pending_bills_amount: "நிலுவையில் உள்ள பில் தொகை",
    
    business_ops: "வணிக செயல்பாடுகள்",
    fleet_workforce: "வாகனங்கள் மற்றும் பணியாளர்கள்",
    workforce_roster: "பணியாளர்கள் பட்டியல்",
    drivers: "ஓட்டுநர்கள்",
    helpers: "உதவியாளர்கள்",
    total_vehicles: "மொத்த வாகனங்கள்",
    registered: "பதிவுசெய்யப்பட்டது",
    salary_paid: "வழங்கப்பட்ட சம்பளம்",
    salary_pending: "நிலுவையில் உள்ள சம்பளம்",
    fuel_expenses: "எரிபொருள் செலவுகள்",
    finance_flows: "நிதி ஓட்டங்கள்",
    lent: "வழங்கியது",
    borrowed: "வாங்கியது",
    
    lending_credit: "கடன் மற்றும் வரவு மேசை",
    interest_portfolios: "வட்டி போர்ட்ஃபோலியோக்கள்",
    interest_accrued: "வட்டி வருவாய்",
    interest_serviced: "செலுத்தப்பட்ட வட்டி",
    pending_collections: "நிலுவையில் உள்ள வசூல்",
    pending_payments: "நிலுவையில் உள்ள கொடுப்பனவுகள்",
    earned_lent: "வழங்கப்பட்ட கடன்களில் இருந்து வட்டி",
    paid_lenders: "வெளிப்புற கடனாளிகளுக்கு செலுத்தியது",
    receivables_interest: "வட்டியுடன் கூடிய வரவுகள்",
    payables_interest: "வட்டியுடன் கூடிய செலுத்த வேண்டியவை",
    
    family_budgets: "குடும்ப வரவுசெலவுத் திட்டம்",
    domestic_expenses: "வீட்டு செலவுகள்",
    cumulative_outlay: "ஒட்டுமொத்த செலவு",
    june_budget: "ஜூன் மாத பட்ஜெட்",
    monthly_share: "ஒட்டுமொத்த செலவில் ஜூன் மாத பங்கு",
    active_categories: "செயலில் உள்ள பிரிவுகள்",
    analytical_graphics: "நேரடி பகுப்பாய்வு வரைபடங்கள்",
    interactive: "ஊடாடும்",
    payroll_ratios: "பணியாளர் ஊதிய விகிதங்கள்",
    paid_ratio: "செலுத்தப்பட்டது",
    pending_ratio: "நிலுவையில் உள்ளது",
    diesel_outlay: "வாராந்திர டீசல் செலவு",
    lending_borrowing: "கடன் மற்றும் கடன் வாங்கிய விகிதம்",
    active_domestic: "செயலில் உள்ள வீட்டு பட்ஜெட் விகிதம்",
    total: "மொத்தம்",
    spent: "செலவிடப்பட்டது",
    
    all_details: "விவரமான செயல்பாட்டு பதிவேடுகள்",
    view_all_details: "கீழே உள்ள அனைத்து பதிவுகளையும் விரிவுபடுத்துக",
    hide_details: "விவரங்களை சுருக்கு",
    workforce_details: "பணியாளர் விபரங்கள்",
    fleet_details: "வாகனம் & எரிபொருள் பதிவுகள்",
    debt_details: "கடன் விபரங்கள்",
    family_ledger_details: "குடும்ப செலவு & வருமான பதிவுகள்",
    name: "பெயர்",
    skill: "பணி/பொறுப்பு",
    wage: "தினசரி கூலி",
    contact: "கைபேசி எண்",
    status: "நிலை",
    vehicle_no: "வண்டி எண்",
    driver: "ஓட்டுநர் பெயர்",
    fuel_date: "தேதி",
    liters: "லிட்டர்",
    amount: "தொகை",
    borrower: "கடன் வாங்கியவர்",
    lender: "கடன் கொடுத்தவர்",
    rate: "வட்டி விகிதம்",
    repaid: "திருப்பிச் செலுத்தப்பட்டது",
    category: "வகை",
    member: "உறுப்பினர் பெயர்",
    date: "தேதி",
    source: "ஆதாரம்",
    
    cancel: "ரத்து செய்",
    save: "சேமி",
    delete: "நீக்கு",
    add: "புதிதாக சேர்",

    // Ledger section keys
    loans_details: "கடன் மற்றும் கடன் போர்ட்ஃபோலியோ",
    loans_given: "வழங்கப்பட்ட கடன்கள்",
    loans_received: "பெற்ற கடன்கள்",
    family_ledger: "குடும்ப செலவு பதிவேடு",
    inactive: "செயலற்றது",
    daily_wage: "தினசரி கூலி / சம்பளம்",
    fuel_total: "எரிபொருள் செலவு",
    entries: "பதிவுகள்",
    no_records: "பதிவுகள் எதுவும் இல்லை",
    total_expenses: "மொத்த செலவுகள்",
    monthly_budget: "மாத பட்ஜெட்",
    live_analytics: "நேரடி பகுப்பாய்வு வரைபடங்கள்",
    salary: "சம்பளம்",
    fuel: "எரிபொருள்",
    credit: "கடன்",
    family: "குடும்பம்"
  }
};

const DEFAULT_FAMILY_MEMBERS: FamilyMember[] = [
  { id: "fam-abhiram", name: "Abhiram", relationship: "Self" },
  { id: "fam-praneet", name: "Praneet", relationship: "Brother" },
  { id: "fam-ponmani", name: "Ponmani", relationship: "Mother" },
  { id: "fam-govindarajan", name: "Govindarajan", relationship: "Father" },
  { id: "fam-venkattammal", name: "Venkattammal", relationship: "Family" },
  { id: "fam-palanathal", name: "Palanathal", relationship: "Family" },
];

const isLegacyDemoBusinessBill = (bill: BusinessBill) =>
  bill.id === "bill-1" ||
  bill.id === "bill-2" ||
  bill.invoiceNo === "INV-2026-001" ||
  bill.invoiceNo === "INV-2026-002" ||
  bill.clientName === "Senthil Kumar" ||
  bill.clientName === "Praneeth Heavy Earthmovers";

export default function App() {
  const apiBaseUrl = useMemo(() => {
    const envUrl = import.meta.env.VITE_API_BASE_URL || import.meta.env.VITE_API_URL;
    if (envUrl) return envUrl;
    if (typeof window !== "undefined" && window.location.hostname !== "localhost" && window.location.hostname !== "127.0.0.1") {
      return "https://business-manager-1.onrender.com";
    }
    return "http://localhost:8000";
  }, []);
  const loadStoredArray = <T,>(key: string, fallback: T[]): T[] => {
    const saved = localStorage.getItem(key);
    if (!saved) return fallback;
    try {
      const parsed = JSON.parse(saved) as T[];
      return Array.isArray(parsed) ? parsed : fallback;
    } catch (error) {
      console.error(`Unable to parse ${key} from localStorage`, error);
      return fallback;
    }
  };

  // Current user role in simulated app (multi-user simulator)
  const currentUserRole: UserRole = "Admin";
  const [isMobileLoggedIn, setIsMobileLoggedIn] = useState<boolean>(() => sessionStorage.getItem("srs_session_active") === "true");
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState<boolean>(false);
  // Mobile nav drawer (hamburger on small screens)
  const [isMobileNavOpen, setIsMobileNavOpen] = useState<boolean>(false);
  const [language, setLanguage] = useState<"en" | "ta">(() => {
    return (localStorage.getItem("srs_language") as "en" | "ta") || "en";
  });

  const toggleLanguage = () => {
    setLanguage(prev => {
      const next = prev === "en" ? "ta" : "en";
      localStorage.setItem("srs_language", next);
      return next;
    });
  };

  const t = useCallback((key: keyof typeof translations.en) => {
    return translations[language][key] || translations.en[key] || key;
  }, [language]);
  const [loginPin, setLoginPin] = useState<string>("");
  const [showLoginPin, setShowLoginPin] = useState<boolean>(false);
  const [loginMessage, setLoginMessage] = useState<string>("");
  const [loginLoading, setLoginLoading] = useState<boolean>(false);
  const loginPinLength = 8;
  const loginPinRefs = useRef<Array<HTMLInputElement | null>>([]);

  const [oldPassword, setOldPassword] = useState<string>("");
  const [newPassword, setNewPassword] = useState<string>("");
  const [confirmNewPassword, setConfirmNewPassword] = useState<string>("");
  const [showOldPassword, setShowOldPassword] = useState<boolean>(false);
  const [showNewPassword, setShowNewPassword] = useState<boolean>(false);
  const [showConfirmNewPassword, setShowConfirmNewPassword] = useState<boolean>(false);
  const [passwordMessage, setPasswordMessage] = useState<string>("");
  const [passwordLoading, setPasswordLoading] = useState<boolean>(false);
  
  // Global Biometric Authentication Toggle state
  const [isBiometricEnabled, setIsBiometricEnabled] = useState<boolean>(() => {
    const saved = localStorage.getItem("global_biometrics_requirement");
    return saved !== "false";
  });

  const toggleBiometricsGlobal = (val: boolean) => {
    setIsBiometricEnabled(val);
    localStorage.setItem("global_biometrics_requirement", String(val));
  };

  useEffect(() => {
    sessionStorage.setItem("srs_session_active", String(isMobileLoggedIn));
  }, [isMobileLoggedIn]);

  const handleLogin = async (event: React.FormEvent) => {
    event.preventDefault();
    setLoginLoading(true);
    setLoginMessage("");
    try {
      const response = await fetch(`${apiBaseUrl}/api/v1/auth/token`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: "admin",
          password: loginPin,
        }),
      });

      const payload = await response.json();
      if (!response.ok) {
        throw new Error("you entered wrong pin number,please check it");
      }

      sessionStorage.setItem("srs_access_token", payload.access_token);
      setIsMobileLoggedIn(true);
      setLoginPin("");
      setLoginMessage("Login successful.");
    } catch (error) {
      setLoginMessage(error instanceof Error ? error.message : "you entered wrong pin number,please check it");
    } finally {
      setLoginLoading(false);
    }
  };

  const handleLockScreen = () => {
    setIsMobileLoggedIn(false);
    setIsMobileMenuOpen(false);
    setLoginPin("");
    setLoginMessage("");
    sessionStorage.removeItem("srs_access_token");
    sessionStorage.removeItem("srs_session_active");
  };

  const handleLoginPinChange = (index: number, rawValue: string) => {
    const digits = rawValue.replace(/\D/g, "");

    if (digits.length === 0) {
      setLoginPin((prev) => {
        const next = prev.padEnd(loginPinLength, "").slice(0, loginPinLength).split("");
        next[index] = "";
        return next.join("");
      });
      return;
    }

    if (digits.length > 1) {
      setLoginPin((prev) => {
        const next = prev.padEnd(loginPinLength, "").slice(0, loginPinLength).split("");
        let cursor = index;
        for (const digit of digits) {
          if (cursor >= loginPinLength) break;
          next[cursor] = digit;
          cursor += 1;
        }
        return next.join("");
      });
      const nextFocus = Math.min(index + digits.length, loginPinLength - 1);
      loginPinRefs.current[nextFocus]?.focus();
      return;
    }

    setLoginPin((prev) => {
      const next = prev.padEnd(loginPinLength, "").slice(0, loginPinLength).split("");
      next[index] = digits[0];
      return next.join("");
    });

    if (index < loginPinLength - 1) {
      loginPinRefs.current[index + 1]?.focus();
    }
  };

  const handleLoginPinKeyDown = (index: number, event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Backspace" && !loginPin[index] && index > 0) {
      loginPinRefs.current[index - 1]?.focus();
    }
  };

  const loginPinDigits = Array.from({ length: loginPinLength }, (_, index) => loginPin[index] ?? "");

  const handleChangePassword = async (event: React.FormEvent) => {
    event.preventDefault();
    setPasswordLoading(true);
    setPasswordMessage("");
    try {
      if (newPassword !== confirmNewPassword) {
        throw new Error("New PIN and confirmation PIN do not match.");
      }

      const response = await fetch(`${apiBaseUrl}/api/v1/auth/change-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          old_password: oldPassword,
          new_password: newPassword,
          confirm_new_password: confirmNewPassword,
        }),
      });

      const payload = await response.json();
      if (!response.ok) {
        if (response.status === 400 || (payload && payload.detail && payload.detail.includes("Old password"))) {
          throw new Error("Please enter correct pin");
        }
        throw new Error(payload.detail || "Unable to update PIN");
      }

      setOldPassword("");
      setNewPassword("");
      setConfirmNewPassword("");
      setPasswordMessage(payload.message || "PIN updated successfully.");
    } catch (error) {
      setPasswordMessage(error instanceof Error ? error.message : "Unable to update PIN");
    } finally {
      setPasswordLoading(false);
    }
  };

  // User custom phone themes & styles state
  const [phoneTheme, setPhoneTheme] = useState<string>(() => localStorage.getItem("phone_theme") || "sapphire");
  const [phoneFont, setPhoneFont] = useState<string>(() => localStorage.getItem("phone_font") || "Inter");
  const [phoneBgColor, setPhoneBgColor] = useState<string>(() => localStorage.getItem("phone_bg_color") || "#030712");
  const [phoneContainerColor, setPhoneContainerColor] = useState<string>(() => localStorage.getItem("phone_container_color") || "#0f172a");
  const [phoneAccentColor, setPhoneAccentColor] = useState<string>(() => localStorage.getItem("phone_accent_color") || "#6366f1");

  // Advanced Custom Themes Colors state
  const [customBg, setCustomBg] = useState<string>(() => localStorage.getItem("custom_bg") || "#030712");
  const [customOuterContainer, setCustomOuterContainer] = useState<string>(() => localStorage.getItem("custom_outer_container") || "#0f172a");
  const [customInnerContainer, setCustomInnerContainer] = useState<string>(() => localStorage.getItem("custom_inner_container") || "#1e293b");
  const [customNestedContainer, setCustomNestedContainer] = useState<string>(() => localStorage.getItem("custom_nested_container") || "#334155");
  const [customTitleFont, setCustomTitleFont] = useState<string>(() => localStorage.getItem("custom_title_font") || "#f8fafc");
  const [customSubtitleFont, setCustomSubtitleFont] = useState<string>(() => localStorage.getItem("custom_subtitle_font") || "#e2e8f0");
  const [customMiniSubtitleFont, setCustomMiniSubtitleFont] = useState<string>(() => localStorage.getItem("custom_mini_subtitle_font") || "#cbd5e1");
  const [customTextSentenceFont, setCustomTextSentenceFont] = useState<string>(() => localStorage.getItem("custom_text_sentence_font") || "#94a3b8");
  const [customMenuBarBg, setCustomMenuBarBg] = useState<string>(() => localStorage.getItem("custom_menu_bar_bg") || "#0f172a");
  const [customMenuBarTitle, setCustomMenuBarTitle] = useState<string>(() => localStorage.getItem("custom_menu_bar_title") || "#ffffff");
  const [customWebAppName, setCustomWebAppName] = useState<string>(() => localStorage.getItem("custom_web_app_name") || "#6366f1");

  const saveCustomThemeConfig = (key: string, value: string) => {
    localStorage.setItem(`custom_${key}`, value);
    if (key === "bg") {
      setCustomBg(value);
      setPhoneBgColor(value);
    } else if (key === "outer_container") {
      setCustomOuterContainer(value);
      setPhoneContainerColor(value);
    } else if (key === "inner_container") {
      setCustomInnerContainer(value);
    } else if (key === "nested_container") {
      setCustomNestedContainer(value);
    } else if (key === "title_font") {
      setCustomTitleFont(value);
    } else if (key === "subtitle_font") {
      setCustomSubtitleFont(value);
    } else if (key === "mini_subtitle_font") {
      setCustomMiniSubtitleFont(value);
    } else if (key === "text_sentence_font") {
      setCustomTextSentenceFont(value);
    } else if (key === "menu_bar_bg") {
      setCustomMenuBarBg(value);
    } else if (key === "menu_bar_title") {
      setCustomMenuBarTitle(value);
    } else if (key === "web_app_name") {
      setCustomWebAppName(value);
    }
  };

  const applyBulkCustomTheme = (themeObj: Record<string, string>) => {
    Object.entries(themeObj).forEach(([key, value]) => {
      localStorage.setItem(`custom_${key}`, value);
    });
    if (themeObj.bg) {
      setCustomBg(themeObj.bg);
      setPhoneBgColor(themeObj.bg);
    }
    if (themeObj.outer_container) {
      setCustomOuterContainer(themeObj.outer_container);
      setPhoneContainerColor(themeObj.outer_container);
    }
    if (themeObj.inner_container) setCustomInnerContainer(themeObj.inner_container);
    if (themeObj.nested_container) setCustomNestedContainer(themeObj.nested_container);
    if (themeObj.title_font) setCustomTitleFont(themeObj.title_font);
    if (themeObj.subtitle_font) setCustomSubtitleFont(themeObj.subtitle_font);
    if (themeObj.mini_subtitle_font) setCustomMiniSubtitleFont(themeObj.mini_subtitle_font);
    if (themeObj.text_sentence_font) setCustomTextSentenceFont(themeObj.text_sentence_font);
    if (themeObj.menu_bar_bg) setCustomMenuBarBg(themeObj.menu_bar_bg);
    if (themeObj.menu_bar_title) setCustomMenuBarTitle(themeObj.menu_bar_title);
    if (themeObj.web_app_name) setCustomWebAppName(themeObj.web_app_name);
  };

  const saveThemeConfig = (theme: string, font: string, bg: string, card: string, accent: string) => {
    setPhoneTheme(theme);
    setPhoneFont(font);
    setPhoneBgColor(bg);
    setPhoneContainerColor(card);
    setPhoneAccentColor(accent);
    localStorage.setItem("phone_theme", theme);
    localStorage.setItem("phone_font", font);
    localStorage.setItem("phone_bg_color", bg);
    localStorage.setItem("phone_container_color", card);
    localStorage.setItem("phone_accent_color", accent);

    // Also update advanced states to match the preset where appropriate
    setCustomBg(bg);
    localStorage.setItem("custom_bg", bg);
    setCustomOuterContainer(card);
    localStorage.setItem("custom_outer_container", card);
    setCustomInnerContainer(card);
    localStorage.setItem("custom_inner_container", card);
  };

  const themePresets = [
    { id: "sapphire", name: "Sapphire Dark", font: "Inter", bg: "#030712", card: "#0f172a", accent: "#6366f1" },
    { id: "teal", name: "Teal Oasis", font: "Outfit", bg: "#042f2e", card: "#115e59", accent: "#2dd4bf" },
    { id: "emerald", name: "Cyber Emerald", font: "JetBrains Mono", bg: "#022c22", card: "#064e3b", accent: "#10b981" },
    { id: "solar", name: "Solar Gold", font: "Space Grotesk", bg: "#1c1917", card: "#292524", accent: "#f59e0b" },
    { id: "lavender", name: "Cosmic Lavender", font: "Outfit", bg: "#1e1b4b", card: "#312e81", accent: "#c084fc" },
    { id: "obsidian", name: "Classic Obsidian", font: "Inter", bg: "#09090b", card: "#18181b", accent: "#3b82f6" },
  ];

  
  // Connection state simulator
  const [isOnline, setIsOnline] = useState<boolean>(true);
  const [offlineSyncQueue, setOfflineSyncQueue] = useState<number>(0);



  // Phone view sub-screen state
  const [selectedMobileModule, setSelectedMobileModule] = useState<"dashboard" | "business" | "finance" | "expenses" | "documents" | "notifications" | "labour" | "vehicle" | "settings">("dashboard");

  // View Mode: Widescreen Web App vs Mobile Simulator
  const [viewMode, setViewMode] = useState<"web" | "mobile">("web");

  // Left Sidebar Collapsed state
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState<boolean>(() => {
    return localStorage.getItem("srs_sidebar_collapsed") === "true";
  });

  // Notifications drawer open status
  const [showNotificationDrawer, setShowNotificationDrawer] = useState<boolean>(false);

  // --- MOCK PERSISTENT LIST STATE ENGINE ---
  
  // 1. LABOUR MODULE
  const [labours, setLabours] = useState<Labour[]>(() => {
    return loadStoredArray<Labour>("srs_labours", []);
  });

  const [attendance, setAttendance] = useState<AttendanceRecord[]>(() => {
    return loadStoredArray<AttendanceRecord>("srs_attendance", []);
  });

  const [salaryPayments, setSalaryPayments] = useState<SalaryPayment[]>(() => {
    return loadStoredArray<SalaryPayment>("srs_salary_payments", []);
  });

  // 2. VEHICLE MODULE
  const [vehicles, setVehicles] = useState<Vehicle[]>(() => {
    return loadStoredArray<Vehicle>("srs_vehicles", []);
  });

  const [bitEntries, setBitEntries] = useState<BitEntry[]>(() => {
    return loadStoredArray<BitEntry>("srs_bit_entries", []);
  });

  const [hammerEntries, setHammerEntries] = useState<HammerEntry[]>([]);
  const [pipeEntries, setPipeEntries] = useState<PipeEntry[]>([]);

  const [businessBills, setBusinessBills] = useState<BusinessBill[]>(() => {
    const stored = loadStoredArray<BusinessBill>("srs_business_bills", []);
    if (stored.length > 0) {
      return stored
        .filter((bill) => !isLegacyDemoBusinessBill(bill))
        .map((bill) => ({ ...bill, source: bill.source ?? "local" }));
    }
    return [];
  });

  const [fuelEntries, setFuelEntries] = useState<FuelEntry[]>(() => {
    return loadStoredArray<FuelEntry>("srs_fuel_entries", []);
  });

  const [trips, setTrips] = useState<TripRecord[]>(() => {
    return loadStoredArray<TripRecord>("srs_trips", []);
  });

  // 3. FINANCE MODULE (Given & Received)
  const [loansGiven, setLoansGiven] = useState<LoanGiven[]>(() => {
    return loadStoredArray<LoanGiven>("srs_loans_given", []);
  });

  const [loansReceived, setLoansReceived] = useState<LoanReceived[]>(() => {
    return loadStoredArray<LoanReceived>("srs_loans_received", []);
  });

  // 4. FAMILY EXPENSE MODULE
  const [familyMembers, setFamilyMembers] = useState<FamilyMember[]>(() => {
    const saved = localStorage.getItem("srs_family_members");
    if (saved) {
      try {
        const parsed = JSON.parse(saved) as FamilyMember[];
        return parsed.length > 0 ? parsed : DEFAULT_FAMILY_MEMBERS;
      } catch (error) {
        console.error(error);
      }
    }
    return DEFAULT_FAMILY_MEMBERS;
  });

  const [incomeEntries, setIncomeEntries] = useState<IncomeEntry[]>(() => {
    return loadStoredArray<IncomeEntry>("srs_income_entries", []);
  });

  const [familyExpenses, setFamilyExpenses] = useState<FamilyExpense[]>(() => {
    return loadStoredArray<FamilyExpense>("srs_family_expenses", []);
  });

  const [categoryBudgets, setCategoryBudgets] = useState<CategoryBudget[]>(() => {
    return loadStoredArray<CategoryBudget>("srs_category_budgets", []);
  });

  // 6. DOCUMENTS VAULT
  const [documents, setDocuments] = useState<ManagedDocument[]>(() => {
    return loadStoredArray<ManagedDocument>("srs_documents", []);
  });

  // 7. SYSTEM LEVEL REMINDERS
  const [notifications, setNotifications] = useState<AppNotification[]>(() => {
    const saved = localStorage.getItem("srs_notifications");
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { console.error(e); }
    }
    return [
      { id: "not-1", title: "Insurance Expiry", body: "Mahindra Tractor insurance expires in 15 days.", date: "Today", type: "insurance", isRead: false },
      { id: "not-2", title: "HDFC bank EMI Pending", body: "₹14,600 bank loan EMI is payable on the 15th.", date: "Yesterday", type: "emi", isRead: false },
    ];
  });

  const refreshSharedData = useCallback(async () => {
    try {
      const snapshot = await fetchSharedSnapshot(apiBaseUrl);
      setLabours(snapshot.labours);
      setAttendance(snapshot.attendance);
      setSalaryPayments(snapshot.salaryPayments);
      setVehicles(snapshot.vehicles);
      setBitEntries(snapshot.bitEntries);
      setBusinessBills((prev) => {
        const localBills = prev.filter((bill) => bill.source !== "server");
        const serverBills = snapshot.businessBills.map((bill) => ({ ...bill, source: "server" as const }));
        return [...serverBills, ...localBills];
      });
      setFuelEntries(snapshot.fuelEntries);
      setTrips(snapshot.trips);
      setLoansGiven(snapshot.loansGiven);
      setLoansReceived(snapshot.loansReceived);
      setFamilyMembers(snapshot.familyMembers.length > 0 ? snapshot.familyMembers : DEFAULT_FAMILY_MEMBERS);
      setIncomeEntries(snapshot.incomeEntries);
      setFamilyExpenses(snapshot.familyExpenses);
      setHammerEntries(snapshot.hammerEntries || []);
      setPipeEntries(snapshot.pipeEntries || []);
      setCategoryBudgets((prev) => (snapshot.categoryBudgets.length > 0 ? snapshot.categoryBudgets : prev));
      setDocuments((prev) => (snapshot.documents.length > 0 ? snapshot.documents : prev));
      setNotifications((prev) => (snapshot.notifications.length > 0 ? snapshot.notifications : prev));
    } catch (error) {
      console.error("Unable to refresh shared records", error);
    }
  }, [apiBaseUrl]);

  const announceSharedDataChange = useCallback(async () => {
    try {
      localStorage.setItem(SHARED_DATA_REVISION_KEY, String(Date.now()));
    } catch (error) {
      console.error("Unable to announce shared data change", error);
    }
    await refreshSharedData();
  }, [refreshSharedData]);

  // Save states to localStorage on state changes
  useEffect(() => {
    localStorage.setItem("srs_labours", JSON.stringify(labours));
  }, [labours]);

  useEffect(() => {
    localStorage.setItem("srs_attendance", JSON.stringify(attendance));
  }, [attendance]);

  useEffect(() => {
    localStorage.setItem("srs_salary_payments", JSON.stringify(salaryPayments));
  }, [salaryPayments]);

  useEffect(() => {
    localStorage.setItem("srs_vehicles", JSON.stringify(vehicles));
  }, [vehicles]);

  useEffect(() => {
    localStorage.setItem("srs_bit_entries", JSON.stringify(bitEntries));
  }, [bitEntries]);

  useEffect(() => {
    localStorage.setItem("srs_business_bills", JSON.stringify(businessBills));
  }, [businessBills]);

  useEffect(() => {
    localStorage.setItem("srs_fuel_entries", JSON.stringify(fuelEntries));
  }, [fuelEntries]);

  useEffect(() => {
    localStorage.setItem("srs_trips", JSON.stringify(trips));
  }, [trips]);

  useEffect(() => {
    localStorage.setItem("srs_loans_given", JSON.stringify(loansGiven));
  }, [loansGiven]);

  useEffect(() => {
    localStorage.setItem("srs_loans_received", JSON.stringify(loansReceived));
  }, [loansReceived]);

  useEffect(() => {
    localStorage.setItem("srs_family_members", JSON.stringify(familyMembers));
  }, [familyMembers]);

  useEffect(() => {
    localStorage.setItem("srs_income_entries", JSON.stringify(incomeEntries));
  }, [incomeEntries]);

  useEffect(() => {
    localStorage.setItem("srs_family_expenses", JSON.stringify(familyExpenses));
  }, [familyExpenses]);

  useEffect(() => {
    localStorage.setItem("srs_category_budgets", JSON.stringify(categoryBudgets));
  }, [categoryBudgets]);

  useEffect(() => {
    localStorage.setItem("srs_documents", JSON.stringify(documents));
  }, [documents]);

  useEffect(() => {
    localStorage.setItem("srs_notifications", JSON.stringify(notifications));
  }, [notifications]);

  useEffect(() => {
    void refreshSharedData();
    const interval = window.setInterval(() => {
      void refreshSharedData();
    }, 15000);
    return () => window.clearInterval(interval);
  }, [refreshSharedData]);

  useEffect(() => {
    const handleSharedDataRevision = (event: StorageEvent) => {
      if (event.key === SHARED_DATA_REVISION_KEY) {
        void refreshSharedData();
      }
    };

    window.addEventListener("storage", handleSharedDataRevision);
    return () => window.removeEventListener("storage", handleSharedDataRevision);
  }, [refreshSharedData]);

  // --- FORM STATE ENGINE FOR ADD NEW ITEMS (CRUD) ---
  const [searchQuery, setSearchQuery] = useState("");

  // Labour inputs
  const [newLabourName, setNewLabourName] = useState("");
  const [newLabourPhone, setNewLabourPhone] = useState("");
  const [newLabourSkill, setNewLabourSkill] = useState("Mason");
  const [newLabourWage, setNewLabourWage] = useState(700);
  const [newLabourAadhaar, setNewLabourAadhaar] = useState("");

  // Vehicle inputs
  const [newVehicleNo, setNewVehicleNo] = useState("");
  const [newVehicleBrand, setNewVehicleBrand] = useState("");
  const [newVehicleDriver, setNewVehicleDriver] = useState("");
  const [newVehicleType, setNewVehicleType] = useState<"Truck" | "Tractor" | "Car" | "Van" | "Two-Wheeler">("Truck");

  // Fuel inputs
  const [newFuelVehicle, setNewFuelVehicle] = useState("");
  const [newFuelLiters, setNewFuelLiters] = useState(50);
  const [newFuelCost, setNewFuelCost] = useState(4800);

  // Loan inputs
  const [newBorrowerName, setNewBorrowerName] = useState("");
  const [newBorrowerPhone, setNewBorrowerPhone] = useState("");
  const [newLoanAmount, setNewLoanAmount] = useState(50000);
  const [newLoanRate, setNewLoanRate] = useState(12);

  // Expense inputs
  const [newExpAmount, setNewExpAmount] = useState(1500);
  const [newExpReason, setNewExpReason] = useState<"Food" | "Medical" | "Education" | "Shopping" | "Transport" | "Travel" | "Entertainment" | "Utilities" | "Other">("Food");
  const [newExpOtherReason, setNewExpOtherReason] = useState("");
  const [newExpMemberName, setNewExpMemberName] = useState("");
  const [newExpDate, setNewExpDate] = useState("2026-06-15");

  // Document inputs
  const [newDocName, setNewDocName] = useState("");
  const [newDocType, setNewDocType] = useState<"Aadhaar" | "PAN" | "RC Book" | "Insurance" | "Loan Agreement" | "Salary Record">("Aadhaar");
  const [newDocOwner, setNewDocOwner] = useState("");

  // --- DERIVED LIVE METRICS COMPUTATION (KPI STRIP) ---
  const activeLabourCount = useMemo(() => labours.filter(l => l.isActive).length, [labours]);
  
  const totalOutstandingLoanAmount = useMemo(() => {
    return loansGiven.reduce((acc, l) => {
      const loanAmt = l.loanAmount ?? l.amountGiven ?? 0;
      const repaid = l.totalRepaid ?? l.totalPaid ?? 0;
      return acc + (loanAmt - repaid);
    }, 0);
  }, [loansGiven]);

  const totalMonthlyIncome = useMemo(() => {
    return incomeEntries.reduce((acc, i) => acc + i.amount, 0);
  }, [incomeEntries]);

  const totalMonthlyExpense = useMemo(() => {
    return familyExpenses.reduce((acc, e) => acc + e.amount, 0);
  }, [familyExpenses]);

  const familySavingsRate = useMemo(() => {
    if (totalMonthlyIncome === 0) return 0;
    const savings = totalMonthlyIncome - totalMonthlyExpense;
    return Math.max(0, Math.round((savings / totalMonthlyIncome) * 100));
  }, [totalMonthlyIncome, totalMonthlyExpense]);

  const vehicleCostSum = useMemo(() => {
    return fuelEntries.reduce((acc, f) => acc + f.cost, 0);
  }, [fuelEntries]);

  // Read status notifications count
  const unreadNotificationCount = useMemo(() => {
    return notifications.filter(n => !n.isRead).length;
  }, [notifications]);

  // --- SYNCHRONIZATION HELPERS (OFFLINE-FIRST SIMULATION) ---
  const triggerLocalAction = (actionName: string, commitCallback: () => void) => {
    if (isOnline) {
      commitCallback();
      // Simulate slight green message or server notice
      alertNotification(`Synchronized: ${actionName} uploaded to FastAPI & MySQL successfully. STATUS: 200 OK.`);
    } else {
      // Offline mode! Save in local storage (Hive) first, queue the rest
      commitCallback();
      setOfflineSyncQueue(prev => prev + 1);
      // Trigger local notice
      setNotifications(prev => [
        {
          id: `not-offline-${Date.now()}`,
          title: `Offline Action Saved (Local Hive)`,
          body: `The action '${actionName}' was committed to local Hive database. It will auto-synchronize to MySQL once internet state recovers.`,
          date: "Just Now",
          type: "budget",
          isRead: false
        },
        ...prev
      ]);
    }
  };

  const alertNotification = (txt: string) => {
    // Temporary helper
  };

  const recoverNetworkSync = () => {
    if (offlineSyncQueue === 0) return;
    setIsOnline(true);
    setNotifications(prev => [
      {
        id: `not-sync-${Date.now()}`,
        title: "Network Refreshed: Background Sync final",
        body: `Triggered background synchronizer. Flushed ${offlineSyncQueue} queued transactions cleanly to Remote Database endpoints! No concurrency conflicts encountered.`,
        date: "Just Now",
        type: "service",
        isRead: false
      },
      ...prev
    ]);
    setOfflineSyncQueue(0);
  };

  // --- DISMISS / MARK NOTIFICATIONS HELPERS ---
  const toggleReadNotification = (id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: !n.isRead } : n));
  };

  const deleteNotification = async (id: string) => {
    try {
      await requestJson(apiBaseUrl, `/api/v1/notifications/${id}`, { method: "DELETE" });
      setNotifications(prev => prev.filter(n => n.id !== id));
      void announceSharedDataChange();
    } catch (error) {
      console.error(error);
    }
  };

  // --- CRUD ACTIONS ---
  const handleAddLabour = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newLabourName.trim()) return;

    const newId = `LAB-2026-0${labours.length + 1}`;
    const entry: Labour = {
      id: newId,
      fullName: newLabourName,
      phone: newLabourPhone || "+91 99999 88888",
      address: "India",
      skillType: newLabourSkill,
      dailyWage: Number(newLabourWage),
      joiningDate: "2026-06-14",
      aadhaarNumber: newLabourAadhaar || "000000000000",
      emergencyContact: "+91 99999 88880",
      isActive: true
    };

    try {
      await requestJson(apiBaseUrl, "/api/v1/labours", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: entry.id,
          full_name: entry.fullName,
          phone: entry.phone,
          skill_type: entry.skillType,
          daily_wage: entry.dailyWage,
          joining_date: entry.joiningDate,
          aadhaar_number: entry.aadhaarNumber,
          address: entry.address,
          emergency_contact: entry.emergencyContact,
          is_active: entry.isActive,
          is_freezed: entry.isFreezed ?? false,
          avatar_url: entry.avatarUrl ?? null,
          license_number: entry.licenseNumber ?? null,
          license_expiry_date: entry.licenseExpiryDate ?? null,
          salary_per_month: entry.salaryPerMonth ?? null,
          advance_entries: entry.advanceEntries ?? null,
          pdf_attachment_name: entry.pdfAttachmentName ?? null,
          profile_photo: entry.profilePhoto ?? null,
          aadhaar_pdf_name: entry.aadhaarPdfName ?? null,
          aadhaar_pdf_data: entry.aadhaarPdfData ?? null,
          license_pdf_name: entry.licensePdfName ?? null,
          license_pdf_data: entry.licensePdfData ?? null,
          custom_documents: entry.customDocuments ?? null,
        }),
      });
      setLabours(prev => [entry, ...prev]);
      void announceSharedDataChange();
    } catch (error) {
      console.error(error);
    }

    // Reset inputs
    setNewLabourName("");
    setNewLabourPhone("");
    setNewLabourAadhaar("");
  };

  const handleAddVehicle = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newVehicleNo.trim()) return;

    const entry: Vehicle = {
      id: newVehicleNo.toUpperCase(),
      vehicleType: newVehicleType,
      brand: newVehicleBrand || "Tata",
      model: "Premium Cruiser",
      driverName: newVehicleDriver || "Chanchal Singh",
      insuranceNumber: "INS-VOLVO-X9",
      insuranceExpiry: "2026-11-20",
      rcExpiry: "2036-12-31",
      pollutionExpiry: "2026-12-15",
      nextServiceDue: "2026-09-10"
    };

    try {
      await requestJson(apiBaseUrl, "/api/v1/vehicles", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: entry.id,
          vehicle_name: entry.vehicleName ?? null,
          vehicle_type: entry.vehicleType,
          brand: entry.brand,
          model: entry.model,
          registration_date: entry.registrationDate ?? null,
          insurance_expiry: entry.insuranceExpiry,
          fitness_expiry: entry.fitnessExpiry ?? null,
          pollution_expiry: entry.pollutionExpiry,
          driver_name: entry.driverName ?? null,
          rc_expiry: entry.rcExpiry ?? null,
          insurance_number: entry.insuranceNumber ?? null,
          next_service_due: entry.nextServiceDue ?? null,
          rc_book_pdf: entry.rcBookPdf ?? null,
          insurance_pdf: entry.insurancePdf ?? null,
          permit_pdf: entry.permitPdf ?? null,
          fitness_pdf: entry.fitnessPdf ?? null,
          rc_book_data: entry.rcBookData ?? null,
          insurance_data: entry.insuranceData ?? null,
          permit_data: entry.permitData ?? null,
          fitness_data: entry.fitnessData ?? null,
        }),
      });
      setVehicles(prev => [entry, ...prev]);
      void announceSharedDataChange();
    } catch (error) {
      console.error(error);
    }

    setNewVehicleNo("");
    setNewVehicleBrand("");
    setNewVehicleDriver("");
  };

  const handleAddFuel = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFuelVehicle) return;

    const entry: FuelEntry = {
      id: `fuel-${Date.now()}`,
      vehicleId: newFuelVehicle,
      date: "2026-06-14",
      liters: Number(newFuelLiters),
      cost: Number(newFuelCost),
      currentOdometer: 146000
    };

    try {
      await requestJson(apiBaseUrl, "/api/v1/vehicles/fuel", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: entry.id,
          vehicle_id: entry.vehicleId ?? null,
          date: entry.date ?? null,
          liters: entry.liters ?? null,
          cost: entry.cost ?? null,
          current_odometer: entry.currentOdometer ?? null,
          fuel_type: entry.fuelType ?? null,
          per_liter_cost: null,
          vehicle_name: entry.vehicleId ?? null,
        }),
      });
      setFuelEntries(prev => [entry, ...prev]);
      void announceSharedDataChange();
    } catch (error) {
      console.error(error);
    }
  };

  const handleGiveLoan = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newBorrowerName.trim()) return;

    const entry: LoanGiven = {
      id: `loan-g-${Date.now()}`,
      borrowerName: newBorrowerName,
      mobileNumber: newBorrowerPhone || "+91 99911 33344",
      address: "Local area center",
      loanAmount: Number(newLoanAmount),
      interestRate: Number(newLoanRate),
      startDate: "2026-06-14",
      endDate: "2027-06-14",
      emiAmount: Math.round((Number(newLoanAmount) * 1.1) / 12),
      dueDate: "15th",
      totalPaid: 0,
      isDefaulter: false
    };

    try {
      await requestJson(apiBaseUrl, "/api/v1/loans/given", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: entry.id,
          borrower_name: entry.borrowerName ?? null,
          person_name: entry.personName ?? null,
          mobile_number: entry.mobileNumber ?? null,
          address: entry.address ?? null,
          loan_amount: entry.loanAmount ?? null,
          amount_given: entry.amountGiven ?? null,
          interest_rate: entry.interestRate ?? null,
          interest_percentage: entry.interestPercentage ?? null,
          start_date: entry.startDate ?? null,
          end_date: entry.endDate ?? null,
          emi_amount: entry.emiAmount ?? null,
          due_date: entry.dueDate ?? null,
          total_paid: entry.totalPaid ?? null,
          is_defaulter: entry.isDefaulter ?? null,
          interest_type: entry.interestType ?? null,
          category: entry.category ?? null,
          status: entry.status ?? null,
          monthly_interests: entry.monthlyInterests ?? null,
        }),
      });
      setLoansGiven(prev => [entry, ...prev]);
      void announceSharedDataChange();
    } catch (error) {
      console.error(error);
    }

    setNewBorrowerName("");
    setNewBorrowerPhone("");
  };

  const handleAddExpense = async (e: React.FormEvent) => {
    e.preventDefault();
    const resolvedReason = newExpReason === "Other"
      ? newExpOtherReason.trim() || "Other"
      : newExpReason;
    
    const entry: FamilyExpense = {
      id: `exp-${Date.now()}`,
      familyMemberName: newExpMemberName.trim() || "Self",
      category: resolvedReason,
      reason: resolvedReason,
      amount: Number(newExpAmount),
      date: newExpDate,
      description: resolvedReason
    };

    void requestJson(apiBaseUrl, "/api/v1/expenses", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        id: entry.id,
        family_member_name: entry.familyMemberName ?? null,
        member_id: entry.memberId ?? null,
        date: entry.date,
        reason: entry.reason ?? null,
        category: entry.category ?? null,
        amount: entry.amount,
        description: entry.description ?? null,
      }),
    }).catch((error) => console.error(error));

    const matchedBudget = categoryBudgets.find((item) => item.category === resolvedReason);
    if (matchedBudget) {
      const nextSpent = matchedBudget.spent + Number(newExpAmount);
      void requestJson(apiBaseUrl, `/api/v1/category-budgets/${encodeURIComponent(matchedBudget.category)}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ spent: nextSpent }),
      }).catch((error) => console.error(error));
      if (nextSpent > matchedBudget.limit) {
        const warning = {
          id: `budget-not-${Date.now()}`,
          title: "Budget Warning: Limit Exceeded!",
          body: `Attention: Absolute spending for ${matchedBudget.category} reached ₹${nextSpent} out of ₹${matchedBudget.limit} maximum limit!`,
          date: "Just Now",
          type: "budget" as const,
          isRead: false,
        };
        void requestJson(apiBaseUrl, "/api/v1/notifications", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            id: warning.id,
            title: warning.title,
            body: warning.body,
            date: warning.date,
            type: warning.type,
            is_read: warning.isRead,
          }),
        }).catch((error) => console.error(error));
      }
    }

    triggerLocalAction(`Expense Added: ${resolvedReason}`, () => {
      setFamilyExpenses(prev => [entry, ...prev]);
      
      // Update spent budgets
      setCategoryBudgets(prevBudgets => prevBudgets.map(b => {
        if (b.category === resolvedReason) {
          const updatedSpent = b.spent + Number(newExpAmount);
          
          // Check limits exeeded inside local simulation
          if (updatedSpent > b.limit) {
            setNotifications(prevNoti => [
              {
                id: `budget-not-${Date.now()}`,
                title: "Budget Warning: Limit Exceeded!",
                body: `Attention: Absolute spending for ${b.category} reached ₹${updatedSpent} out of ₹${b.limit} maximum limit!`,
                date: "Just Now",
                type: "budget",
                isRead: false
              },
              ...prevNoti
            ]);
          }
          return { ...b, spent: updatedSpent };
        }
        return b;
      }));
    });

    void announceSharedDataChange();

    setNewExpMemberName("");
    setNewExpDate("2026-06-15");
    setNewExpOtherReason("");
    setNewExpReason("Food");
  };

  const handleUploadDocument = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDocName.trim()) return;

    const entry: ManagedDocument = {
      id: `doc-${Date.now()}`,
      name: newDocName.endsWith(".pdf") ? newDocName : `${newDocName}.pdf`,
      type: newDocType,
      ownerName: newDocOwner || "Self",
      uploadDate: "2026-06-14",
      fileSize: "1.5 MB",
      status: "Active"
    };

    void requestJson(apiBaseUrl, "/api/v1/documents", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        id: entry.id,
        name: entry.name,
        type: entry.type,
        owner_name: entry.ownerName,
        upload_date: entry.uploadDate,
        file_size: entry.fileSize,
        expiry_date: entry.expiryDate ?? null,
        status: entry.status,
      }),
    }).catch((error) => console.error(error));

    triggerLocalAction(`Upload Document: ${newDocName}`, () => {
      setDocuments(prev => [entry, ...prev]);
    });
    void announceSharedDataChange();

    setNewDocName("");
    setNewDocOwner("");
  };

  const handleDeleteLabour = async (id: string) => {
    try {
      await requestJson(apiBaseUrl, `/api/v1/labours/${id}`, { method: "DELETE" });
      setLabours(prev => prev.filter(l => l.id !== id));
      void announceSharedDataChange();
    } catch (error) {
      console.error(error);
    }
  };

  const handleDeleteVehicle = async (id: string) => {
    try {
      await requestJson(apiBaseUrl, `/api/v1/vehicles/${id}`, { method: "DELETE" });
      setVehicles(prev => prev.filter(v => v.id !== id));
      void announceSharedDataChange();
    } catch (error) {
      console.error(error);
    }
  };

  const handleToggleLabourStatus = async (id: string) => {
    const current = labours.find((lab) => lab.id === id);
    if (!current) return;
    const next = { ...current, isActive: !current.isActive };
    try {
      await requestJson(apiBaseUrl, `/api/v1/labours/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          full_name: next.fullName,
          phone: next.phone,
          skill_type: next.skillType,
          daily_wage: next.dailyWage,
          joining_date: next.joiningDate,
          aadhaar_number: next.aadhaarNumber,
          address: next.address,
          emergency_contact: next.emergencyContact,
          is_active: next.isActive,
          is_freezed: next.isFreezed ?? false,
          avatar_url: next.avatarUrl ?? null,
          license_number: next.licenseNumber ?? null,
          license_expiry_date: next.licenseExpiryDate ?? null,
          salary_per_month: next.salaryPerMonth ?? null,
          advance_entries: next.advanceEntries ?? null,
          pdf_attachment_name: next.pdfAttachmentName ?? null,
          profile_photo: next.profilePhoto ?? null,
          aadhaar_pdf_name: next.aadhaarPdfName ?? null,
          aadhaar_pdf_data: next.aadhaarPdfData ?? null,
          license_pdf_name: next.licensePdfName ?? null,
          license_pdf_data: next.licensePdfData ?? null,
          custom_documents: next.customDocuments ?? null,
        }),
      });
      setLabours(prev => prev.map(l => l.id === id ? next : l));
      void announceSharedDataChange();
    } catch (error) {
      console.error(error);
    }
  };

  // Mark Daily Attendance Today
  const handleMarkAttendance = async (labourId: string, status: "Present" | "Absent" | "Half-Day") => {
    const activeDate = "2026-06-14";
    const existingIdx = attendance.findIndex(a => a.labourId === labourId && a.date === activeDate);
    try {
      await requestJson(apiBaseUrl, "/api/v1/labours/attendance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          date: activeDate,
          records: [{
            labour_id: labourId,
            status,
            reason: existingIdx > -1 ? attendance[existingIdx].reason ?? null : null,
          }],
        }),
      });
      if (existingIdx > -1) {
        setAttendance(prev => prev.map((a, idx) => idx === existingIdx ? { ...a, status } : a));
      } else {
        setAttendance(prev => [
          ...prev,
          { id: `att-${Date.now()}`, labourId, date: activeDate, status }
        ]);
      }
      void announceSharedDataChange();
    } catch (error) {
      console.error(error);
    }
  };

  // --- ROLE BASED ACCESS CONTROL (RBAC) BLOCKED PANELS CHECKER ---
  const isModuleBlockedForRole = (module: string) => {
    return false;
  };

  // Filter lists based on search
  const filteredLabours = labours.filter(l => (l.fullName || "").toLowerCase().includes(searchQuery.toLowerCase()) || (l.skillType || "").toLowerCase().includes(searchQuery.toLowerCase()));
  const filteredVehicles = vehicles.filter(v => (v.id || "").toLowerCase().includes(searchQuery.toLowerCase()) || (v.driverName || "").toLowerCase().includes(searchQuery.toLowerCase()));
  const filteredLoans = loansGiven.filter(l => {
    const name = l.personName || l.borrowerName || "";
    return name.toLowerCase().includes(searchQuery.toLowerCase());
  });
  const filteredDocs = documents.filter(d => (d.name || "").toLowerCase().includes(searchQuery.toLowerCase()) || (d.type || "").toLowerCase().includes(searchQuery.toLowerCase()));

  const dynamicGlobalStyles = useMemo(() => {
    return `
      /* Global Background Overrides - Fixed Elegant Light Orange Theme & Proportional Font Reduction */
      html {
        font-size: 14px !important; /* Uniformly scales all Tailwind rem font sizes down by exactly 2px */
      }
      html, body, #erp-applet-root, .app-root-bg {
        background: #FFF9F6 !important; /* Elegant Warm Alabaster Ivory Peach Base - Very soft, bright, high-contrast, beautiful! */
        transition: background 0.3s ease;
      }
      #virtual-phone-screen {
        background: #FFF0E6 !important; /* Rich Creamy Peach base for the mobile screen */
      }

      /* 1. Master Top Header - Professional Warm Deep Dark Chocolate/Charcoal for ultimate premium visual identity */
      #master-header,
      .app-header-bar,
      .app-footer-bar,
      .app-drawer-menu,
      .menu-bar-bg {
        background: #1C0D02 !important; /* Stunning Deep Cocoa Obsidian Brown - highly premium */
        border-bottom: 3px solid #EA580C !important; /* Vibrant Orange accent border line */
        box-shadow: 0 4px 20px 0 rgba(28, 13, 2, 0.15) !important;
      }

      /* Header Elements Contrast & Legibility - Crisp white or vibrant orange */
      #master-header *,
      .app-header-bar *,
      .app-footer-bar *,
      .app-drawer-menu * {
        color: #FFF9F6 !important;
      }
      #master-header svg,
      .app-header-bar svg,
      .app-footer-bar svg,
      .app-drawer-menu svg {
        stroke: #FFF9F6 !important;
        color: #FFF9F6 !important;
      }
      #master-header .web-app-name,
      .app-header-bar .web-app-name {
        color: #FF782D !important; /* Bright Juicy Orange for Brand text */
        font-weight: 900 !important;
      }

      /* 2. Web App Sidebar - Crisp Off-White Cream */
      #erp-applet-root > main > div:first-child,
      #erp-applet-root [class*="w-full lg:w-72"],
      #erp-applet-root [class*="w-full lg:w-20"],
      .sidebar-container {
        background: #FFF2EB !important; /* Very soft peach-cream */
        border: 1.5px solid #FFDEC9 !important;
        box-shadow: 4px 0 15px rgba(124, 45, 18, 0.03) !important;
      }

      /* 3. Outer Workspace Board - Clean Modern Pearlescent */
      #primary-content-grid {
        background: #FFFBF9 !important;
        border-radius: 1.5rem !important;
      }

      /* 4. Core Module Right Board Wrapper - Pure Crisp White for maximum readability */
      #right-content-board > div {
        background: #FFFFFF !important;
        border: 1.5px solid #FFE4D6 !important;
        box-shadow: 0 4px 20px rgba(124, 45, 18, 0.02) !important;
      }

      /* 5. STATS CARDS (KPIs) - Highly polished distinct warm/orange shades */
      /* Card 1: Soft Peach Glow */
      #erp-applet-root .grid-cols-2 > div:nth-child(1),
      #virtual-phone-screen .grid-cols-2 > div:nth-child(1) {
        background: #FFF2EA !important;
        border: 1.5px solid #FFDEC9 !important;
        box-shadow: 0 4px 12px rgba(124, 45, 18, 0.02) !important;
      }
      /* Card 2: Warm Shell Cream */
      #erp-applet-root .grid-cols-2 > div:nth-child(2),
      #virtual-phone-screen .grid-cols-2 > div:nth-child(2) {
        background: #FFF8F2 !important;
        border: 1.5px solid #FFE4D6 !important;
        box-shadow: 0 4px 12px rgba(124, 45, 18, 0.02) !important;
      }
      /* Card 3: Soft Apricot Pastry */
      #erp-applet-root .grid-cols-2 > div:nth-child(3),
      #virtual-phone-screen .grid-cols-2 > div:nth-child(3) {
        background: #FFF1E6 !important;
        border: 1.5px solid #FED7AA !important;
        box-shadow: 0 4px 12px rgba(124, 45, 18, 0.02) !important;
      }
      /* Card 4: Bright Peach Puff */
      #erp-applet-root .grid-cols-2 > div:nth-child(4),
      #virtual-phone-screen .grid-cols-2 > div:nth-child(4) {
        background: #FFEBD6 !important;
        border: 1.5px solid #FDBA74 !important;
        box-shadow: 0 4px 12px rgba(124, 45, 18, 0.02) !important;
      }

      /* 6. DASHBOARD MAIN OVERVIEWS */
      /* Welcome Banner Card - Vibrant Warm Papaya */
      #mobile-dashboard-scroll > div:first-child {
        background: #FFF5EE !important;
        border: 1.5px solid #FFDEC9 !important;
      }
      /* Chart Containers - Pure elegant white */
      #mobile-dashboard-scroll .bg-indigo-950\/40,
      #mobile-dashboard-scroll [class*="bg-indigo-950/40"],
      #erp-applet-root .bg-slate-900,
      #virtual-phone-screen .bg-slate-900,
      .outer-container,
      .bg-slate-900 {
        background: #FFFFFF !important;
        border: 1.5px solid #FFE4D6 !important;
        box-shadow: 0 6px 18px rgba(124, 45, 18, 0.03) !important;
        border-radius: 1rem !important;
      }

      /* Forms and details containers - Soft warm orange-tinted base */
      #erp-applet-root form,
      #virtual-phone-screen form {
        background: #FFF8F5 !important;
        border: 1.5px solid #FFDEC9 !important;
        border-radius: 1rem !important;
        padding: 1.5rem !important;
      }

      /* List Row & Detail Cards - Clean, high contrast with orange border accent */
      .labour-card-item,
      .vehicle-card-item,
      .loan-item-card,
      .doc-item-row,
      #erp-applet-root .grid-cols-1 > div.bg-slate-950,
      #virtual-phone-screen .grid-cols-1 > div.bg-slate-950,
      #erp-applet-root [class*="grid-cols-1 md:grid-cols-2"] > div,
      #virtual-phone-screen [class*="grid-cols-1 md:grid-cols-2"] > div {
        background: #FFFFFF !important;
        border: 1.5px solid #FFEFE6 !important;
        border-left: 4px solid #F97316 !important; /* Thick orange accent on left side */
        box-shadow: 0 2px 8px rgba(124, 45, 18, 0.02) !important;
        border-radius: 0.5rem !important;
      }

      /* Inner lists register containers */
      .labour-list-container,
      .fuel-logs-panel,
      .doc-upload-panel,
      #erp-applet-root .space-y-4 > div.bg-slate-950,
      #virtual-phone-screen .space-y-4 > div.bg-slate-950 {
        background: #FFFBF9 !important;
        border: 1.5px solid #FFDEC9 !important;
        border-radius: 0.75rem !important;
      }

      /* Inner Cards & Nesting */
      #erp-applet-root .bg-slate-950,
      #erp-applet-root [class*="bg-slate-950"],
      #virtual-phone-screen .bg-slate-950,
      #virtual-phone-screen [class*="bg-slate-950"],
      .inner-container,
      .bg-slate-950,
      [class*="bg-slate-900/60"] {
        background: #FFF6F0 !important;
        border: 1px solid #FFDEC9 !important;
        border-radius: 0.75rem !important;
      }

      /* Typography Hierarchy - EXACTLY mapping to User Guidelines */

      /* 1. Heading 1 (heading1) -> Orange, 18px */
      #erp-applet-root h1, #virtual-phone-screen h1,
      #erp-applet-root .heading1, #virtual-phone-screen .heading1,
      #erp-applet-root .main-heading, #virtual-phone-screen .main-heading {
        font-size: 18px !important;
        color: #C2410C !important; /* Deep highly readable orange */
        font-weight: 800 !important;
      }
      #erp-applet-root h1 *, #virtual-phone-screen h1 * {
        color: #C2410C !important;
      }

      /* 2. Heading 2 (subheading) -> Blue, 14px */
      #erp-applet-root h2, #virtual-phone-screen h2,
      #erp-applet-root h3, #virtual-phone-screen h3,
      #erp-applet-root .title, #virtual-phone-screen .title,
      #erp-applet-root .card-title, #virtual-phone-screen .card-title,
      #erp-applet-root .heading2, #virtual-phone-screen .heading2 {
        font-size: 14px !important;
        color: #1E40AF !important; /* Rich legible Deep Royal Blue */
        font-weight: 700 !important;
      }
      #erp-applet-root h2 *, #virtual-phone-screen h2 *,
      #erp-applet-root h3 *, #virtual-phone-screen h3 *,
      #erp-applet-root .title *, #virtual-phone-screen .title *,
      #erp-applet-root .card-title *, #virtual-phone-screen .card-title * {
        color: #1E40AF !important;
      }

      /* 3. Other subheadings (other sub heading) -> Yellow, 12px */
      #erp-applet-root h4, #virtual-phone-screen h4,
      #erp-applet-root h5, #virtual-phone-screen h5,
      #erp-applet-root h6, #virtual-phone-screen h6,
      #erp-applet-root .subtitle, #virtual-phone-screen .subtitle,
      #erp-applet-root .card-subtitle, #virtual-phone-screen .card-subtitle,
      #erp-applet-root .mini-subtitle, #virtual-phone-screen .mini-subtitle,
      #erp-applet-root .other-subheading, #virtual-phone-screen .other-subheading {
        font-size: 12px !important;
        color: #B45309 !important; /* Deep Yellow/Amber - highly visible on light cream */
        font-weight: 600 !important;
      }
      #erp-applet-root h4 *, #virtual-phone-screen h4 *,
      #erp-applet-root h5 *, #virtual-phone-screen h5 *,
      #erp-applet-root h6 *, #virtual-phone-screen h6 *,
      #erp-applet-root .subtitle *, #virtual-phone-screen .subtitle *,
      #erp-applet-root .card-subtitle *, #virtual-phone-screen .card-subtitle *,
      #erp-applet-root .mini-subtitle *, #virtual-phone-screen .mini-subtitle * {
        color: #B45309 !important;
      }

      /* 4. Others -> Black, 12px (All body text, lists, table cells, labels, inputs, selects) */
      #erp-applet-root, #virtual-phone-screen,
      #erp-applet-root p, #erp-applet-root li, #erp-applet-root td, #erp-applet-root th, #erp-applet-root label,
      #virtual-phone-screen p, #virtual-phone-screen li, #virtual-phone-screen td, #virtual-phone-screen th, #virtual-phone-screen label,
      #erp-applet-root .normal-text, #virtual-phone-screen .normal-text,
      #erp-applet-root span, #virtual-phone-screen span,
      #erp-applet-root div:not([class*="bg-"]):not([class*="text-"]):not([class*="border"]):not([id="master-header"]),
      #virtual-phone-screen div:not([class*="bg-"]):not([class*="text-"]):not([class*="border"]) {
        font-size: 12px !important;
        color: #000000 !important; /* Maximum Contrast solid Black */
        line-height: 1.4 !important;
      }

      /* 5. Income amount -> Green */
      .income-amount, [class*="income"], [class*="salary"], [class*="surplus"],
      #erp-applet-root .text-emerald-300, #erp-applet-root .text-emerald-400, #erp-applet-root .text-emerald-500, #erp-applet-root .text-emerald-600,
      #erp-applet-root .text-green-300, #erp-applet-root .text-green-400, #erp-applet-root .text-green-500, #erp-applet-root .text-green-600,
      #virtual-phone-screen .text-emerald-300, #virtual-phone-screen .text-emerald-400, #virtual-phone-screen .text-emerald-500, #virtual-phone-screen .text-emerald-600,
      #virtual-phone-screen .text-green-300, #virtual-phone-screen .text-green-400, #virtual-phone-screen .text-green-500, #virtual-phone-screen .text-green-600 {
        color: #16A34A !important; /* Bold Legible Green */
        font-weight: 700 !important;
      }

      /* 6. Expenses -> Red */
      .expense-amount, [class*="expense"], [class*="spent"], [class*="debt"], [class*="borrowed"],
      #erp-applet-root .text-rose-300, #erp-applet-root .text-rose-400, #erp-applet-root .text-rose-450, #erp-applet-root .text-rose-500, #erp-applet-root .text-rose-600,
      #erp-applet-root .text-red-300, #erp-applet-root .text-red-400, #erp-applet-root .text-red-500, #erp-applet-root .text-red-600,
      #virtual-phone-screen .text-rose-300, #virtual-phone-screen .text-rose-400, #virtual-phone-screen .text-rose-455, #virtual-phone-screen .text-rose-500, #virtual-phone-screen .text-rose-600,
      #virtual-phone-screen .text-red-300, #virtual-phone-screen .text-red-400, #virtual-phone-screen .text-red-500, #virtual-phone-screen .text-red-600 {
        color: #DC2626 !important; /* Bold Legible Red */
        font-weight: 700 !important;
      }

      /* 7. Pending / Outstanding -> Pink */
      .pending-amount, [class*="pending"], [class*="outstanding"], [class*="due"], [class*="unpaid"],
      #erp-applet-root .text-pink-300, #erp-applet-root .text-pink-400, #erp-applet-root .text-pink-500, #erp-applet-root .text-pink-600,
      #virtual-phone-screen .text-pink-300, #virtual-phone-screen .text-pink-400, #virtual-phone-screen .text-pink-500, #virtual-phone-screen .text-pink-600 {
        color: #DB2777 !important; /* Bold Legible Pink */
        font-weight: 700 !important;
      }

      /* Inputs, dropdowns & select box fields */
      #erp-applet-root input, #erp-applet-root select, #erp-applet-root textarea,
      #virtual-phone-screen input, #virtual-phone-screen select, #virtual-phone-screen textarea {
        background-color: #FFFFFF !important;
        color: #000000 !important; /* Text is black for perfect visibility inside white fields */
        border: 1.5px solid #FFDEC9 !important;
        border-radius: 0.5rem !important;
        padding: 0.5rem 0.75rem !important;
      }
      #erp-applet-root input:focus, #erp-applet-root select:focus, #erp-applet-root textarea:focus,
      #virtual-phone-screen input:focus, #virtual-phone-screen select:focus, #virtual-phone-screen textarea:focus {
        border-color: #EA580C !important;
        outline: none !important;
        box-shadow: 0 0 0 3px rgba(234, 88, 12, 0.15) !important;
      }

      /* Buttons: Action Elements MUST have white text on vibrant backgrounds for visibility! */
      #erp-applet-root button, #virtual-phone-screen button {
        font-size: 12px !important;
        border-radius: 0.5rem !important;
        transition: all 0.2s ease !important;
      }

      /* Override primary action buttons and background highlights to be a beautiful high-contrast vibrant Orange theme */
      #erp-applet-root .bg-indigo-600,
      #erp-applet-root .bg-indigo-650,
      #erp-applet-root .bg-indigo-700,
      #erp-applet-root .bg-amber-600,
      #erp-applet-root .bg-teal-600,
      #erp-applet-root .bg-rose-600,
      #erp-applet-root .bg-indigo-950,
      #virtual-phone-screen .bg-indigo-600,
      #virtual-phone-screen .bg-indigo-650,
      #virtual-phone-screen .bg-amber-600,
      #virtual-phone-screen .bg-teal-600,
      #virtual-phone-screen .bg-rose-600,
      #virtual-phone-screen .bg-indigo-950 {
        background-color: #EA580C !important; /* Warm vibrant Sunset Orange */
        color: #FFFFFF !important; /* White text for perfect visibility! */
        font-weight: 700 !important;
      }

      /* Ensure white text is properly shown on all primary elements and tags */
      #erp-applet-root .bg-indigo-600 *,
      #erp-applet-root .bg-indigo-650 *,
      #erp-applet-root .bg-indigo-700 *,
      #erp-applet-root .bg-amber-600 *,
      #erp-applet-root .bg-teal-600 *,
      #erp-applet-root .bg-rose-600 *,
      #erp-applet-root .bg-indigo-950 *,
      #virtual-phone-screen .bg-indigo-600 *,
      #virtual-phone-screen .bg-indigo-650 *,
      #virtual-phone-screen .bg-amber-600 *,
      #virtual-phone-screen .bg-teal-600 *,
      #virtual-phone-screen .bg-rose-600 *,
      #virtual-phone-screen .bg-indigo-950 * {
        color: #FFFFFF !important;
      }

      /* Navigation menus: Selected item gets warm sunset orange & white text */
      #erp-applet-root .nav-item-selected,
      #virtual-phone-screen .nav-item-selected {
        background-color: #EA580C !important;
        color: #FFFFFF !important;
        font-weight: 800 !important;
        border-radius: 0.5rem !important;
      }
      #erp-applet-root .nav-item-selected *,
      #erp-applet-root .nav-item-selected svg,
      #virtual-phone-screen .nav-item-selected *,
      #virtual-phone-screen .nav-item-selected svg {
        color: #FFFFFF !important;
        stroke: #FFFFFF !important;
      }

      /* Navigation menus: Unselected item gets soft warm peach on hover, readable dark brown text */
      #erp-applet-root .nav-item-unselected,
      #virtual-phone-screen .nav-item-unselected {
        color: #7C2D12 !important;
        background-color: transparent !important;
        opacity: 0.85 !important;
      }
      #erp-applet-root .nav-item-unselected *,
      #erp-applet-root .nav-item-unselected svg,
      #virtual-phone-screen .nav-item-unselected *,
      #virtual-phone-screen .nav-item-unselected svg {
        color: #7C2D12 !important;
        stroke: #7C2D12 !important;
      }
      #erp-applet-root .nav-item-unselected:hover,
      #virtual-phone-screen .nav-item-unselected:hover {
        background-color: #FFDEC9 !important;
        color: #431407 !important;
        opacity: 1 !important;
      }
      #erp-applet-root .nav-item-unselected:hover *,
      #erp-applet-root .nav-item-unselected:hover svg,
      #virtual-phone-screen .nav-item-unselected:hover *,
      #virtual-phone-screen .nav-item-unselected:hover svg {
        color: #431407 !important;
        stroke: #431407 !important;
      }

      /* 8. Light-theme high contrast utility overrides for slate, indigo & white text classes */
      #erp-applet-root .text-slate-50, #erp-applet-root .text-slate-100, #erp-applet-root .text-slate-200, #erp-applet-root .text-slate-300, #erp-applet-root .text-slate-400,
      #virtual-phone-screen .text-slate-50, #virtual-phone-screen .text-slate-100, #virtual-phone-screen .text-slate-200, #virtual-phone-screen .text-slate-300, #virtual-phone-screen .text-slate-400,
      #erp-applet-root .text-white, #virtual-phone-screen .text-white,
      #erp-applet-root .text-slate-450, #virtual-phone-screen .text-slate-450,
      #erp-applet-root .text-slate-455, #virtual-phone-screen .text-slate-455,
      #erp-applet-root [class*="text-slate-400"], #virtual-phone-screen [class*="text-slate-400"],
      #erp-applet-root [class*="text-slate-300"], #virtual-phone-screen [class*="text-slate-300"] {
        color: #1A0D05 !important; /* Elegant Espresso Black for optimal contrast on white/cream backgrounds */
      }

      #erp-applet-root .text-slate-500, #virtual-phone-screen .text-slate-500,
      #erp-applet-root [class*="text-slate-500"], #virtual-phone-screen [class*="text-slate-500"] {
        color: #5C4334 !important; /* Readable dark chocolate for secondary details */
      }

      #erp-applet-root [class*="text-white/"], #virtual-phone-screen [class*="text-white/"] {
        color: #332115 !important; /* Solid brown instead of transparent white */
      }

      /* Indigo & Blue utilities originally styled for dark layouts */
      #erp-applet-root .text-indigo-50, #erp-applet-root .text-indigo-100, #erp-applet-root .text-indigo-200, #erp-applet-root .text-indigo-300,
      #virtual-phone-screen .text-indigo-50, #virtual-phone-screen .text-indigo-100, #virtual-phone-screen .text-indigo-200, #virtual-phone-screen .text-indigo-300,
      #erp-applet-root [class*="text-indigo-50"], #erp-applet-root [class*="text-indigo-100"], #erp-applet-root [class*="text-indigo-200"], #erp-applet-root [class*="text-indigo-300"],
      #virtual-phone-screen [class*="text-indigo-50"], #virtual-phone-screen [class*="text-indigo-100"], #virtual-phone-screen [class*="text-indigo-200"], #virtual-phone-screen [class*="text-indigo-300"] {
        color: #1E3A8A !important; /* Legible deep royal blue */
      }

      #erp-applet-root .text-indigo-400, #virtual-phone-screen .text-indigo-400,
      #erp-applet-root [class*="text-indigo-400"], #virtual-phone-screen [class*="text-indigo-400"] {
        color: #2563EB !important; /* Bold legible blue */
      }

      /* Inactive button text classes specifically within dashboards/segments */
      #erp-applet-root button.text-slate-400, #virtual-phone-screen button.text-slate-400,
      #erp-applet-root button.text-slate-500, #virtual-phone-screen button.text-slate-500,
      #erp-applet-root .text-slate-400:hover, #virtual-phone-screen .text-slate-400:hover {
        color: #5C4334 !important;
      }

      /* Specific deep royal blue for pending collections amount */
      #erp-applet-root .pending-collections-value,
      #virtual-phone-screen .pending-collections-value {
        color: #1E40AF !important;
        font-weight: 800 !important;
      }

      /* Custom sky blue color and font size 20 for brand header label */
      #brand-header-label,
      #erp-applet-root #brand-header-label,
      #virtual-phone-screen #brand-header-label {
        color: #38bdf8 !important; /* Sky Blue */
        font-size: 20px !important; /* Font size 20px */
        line-height: 1.2 !important;
        font-weight: 800 !important;
      }

      /* Custom light green style for Net Cash Flow badge */
      #net-cash-flow-badge,
      #erp-applet-root #net-cash-flow-badge,
      #virtual-phone-screen #net-cash-flow-badge {
        background-color: #e8f5e9 !important; /* Elegant light green bg */
        color: #1b5e20 !important; /* Clear deep green text */
        border: 1.5px solid #81c784 !important; /* Clear light green border */
        font-weight: 800 !important;
      }
      #net-cash-flow-badge svg,
      #erp-applet-root #net-cash-flow-badge svg,
      #virtual-phone-screen #net-cash-flow-badge svg {
        color: #1b5e20 !important;
        stroke: #1b5e20 !important;
      }

      /* Global high contrast black text and black icons */
      #erp-applet-root button,
      #virtual-phone-screen button,
      #erp-applet-root select,
      #virtual-phone-screen select,
      #erp-applet-root input,
      #virtual-phone-screen input,
      #erp-applet-root .text-white,
      #virtual-phone-screen .text-white,
      #erp-applet-root .text-slate-50,
      #virtual-phone-screen .text-slate-50,
      #erp-applet-root .text-slate-100,
      #virtual-phone-screen .text-slate-100,
      #erp-applet-root .text-slate-200,
      #virtual-phone-screen .text-slate-200,
      #erp-applet-root .text-slate-300,
      #virtual-phone-screen .text-slate-300,
      #erp-applet-root .text-slate-350,
      #virtual-phone-screen .text-slate-350,
      #erp-applet-root .text-slate-400,
      #virtual-phone-screen .text-slate-400 {
        color: #1A0D05 !important;
      }

      #erp-applet-root button svg,
      #virtual-phone-screen button svg {
        stroke: #1A0D05 !important;
        color: #1A0D05 !important;
      }

      /* Select options styling for maximum legibility (black text on white bg) */
      #erp-applet-root select option,
      #virtual-phone-screen select option {
        background-color: #FFFFFF !important;
        color: #1A0D05 !important;
      }

      /* Vehicle number/registration badges: light green bg, dark green text */
      .vehicle-number-badge,
      #erp-applet-root .vehicle-number-badge,
      #virtual-phone-screen .vehicle-number-badge,
      #erp-applet-root [class*="vehicle-number-badge"],
      #virtual-phone-screen [class*="vehicle-number-badge"] {
        background-color: #e8f5e9 !important; /* Light Green */
        color: #1b5e20 !important; /* Dark Green */
        border: 1.5px solid #a5d6a7 !important;
        font-weight: 800 !important;
        text-shadow: none !important;
      }
      .vehicle-number-badge *,
      #erp-applet-root .vehicle-number-badge * {
        color: #1b5e20 !important;
        stroke: #1b5e20 !important;
      }

      /* Pending badges / containers: light orange bg, dark orange/brown text */
      .pending-container,
      #erp-applet-root .pending-container,
      #virtual-phone-screen .pending-container,
      #erp-applet-root [class*="bg-amber-955"],
      #virtual-phone-screen [class*="bg-amber-955"],
      #erp-applet-root [class*="bg-amber-950"],
      #virtual-phone-screen [class*="bg-amber-950"],
      #erp-applet-root .bg-amber-950\/80,
      #virtual-phone-screen .bg-amber-950\/80 {
        background-color: #ffe0b2 !important; /* Light Orange */
        color: #e65100 !important; /* Dark Orange */
        border: 1.5px solid #ffb74d !important;
        font-weight: 800 !important;
      }
      .pending-container *,
      #erp-applet-root [class*="bg-amber-950"] * {
        color: #e65100 !important;
      }

      /* Vehicle category container: light pink bg, dark pink text */
      .badge-vehicle-category,
      #erp-applet-root .badge-vehicle-category,
      #virtual-phone-screen .badge-vehicle-category {
        background-color: #fce4ec !important; /* Light Pink */
        color: #c2185b !important; /* Dark Pink/Magenta */
        border: 1.5px solid #f8bbd0 !important;
        font-weight: 800 !important;
      }
      .badge-vehicle-category *,
      #erp-applet-root .badge-vehicle-category * {
        color: #c2185b !important;
      }

      /* Active status container: light green bg, dark green text */
      .badge-active-status,
      #erp-applet-root .badge-active-status,
      #virtual-phone-screen .badge-active-status,
      #erp-applet-root .status-active,
      #virtual-phone-screen .status-active {
        background-color: #e8f5e9 !important; /* Light Green */
        color: #1b5e20 !important; /* Dark Green */
        border: 1.5px solid #a5d6a7 !important;
        font-weight: 800 !important;
      }
      .badge-active-status *,
      #erp-applet-root .badge-active-status * {
        color: #1b5e20 !important;
      }

      /* SVGs & Icons stroke color */
      #erp-applet-root svg, #virtual-phone-screen svg {
        stroke: currentColor !important;
        color: inherit !important;
      }
    `;
  }, []);

  return (
    <div id="erp-applet-root" className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans select-none antialiased">
      <style dangerouslySetInnerHTML={{ __html: dynamicGlobalStyles }} />

      {!isMobileLoggedIn && (
        <main className="fixed inset-0 z-50 flex items-center justify-center px-3 sm:px-6 py-8 sm:py-10 bg-[radial-gradient(circle_at_top,_rgba(249,115,22,0.18),_transparent_35%),linear-gradient(180deg,_#fff7ed_0%,_#fef3c7_100%)] text-slate-950 overflow-y-auto">
          <div className="w-full max-w-md rounded-3xl border border-amber-200/70 bg-white/90 shadow-[0_30px_80px_-30px_rgba(124,45,18,0.35)] backdrop-blur p-4 sm:p-6 md:p-8 space-y-5">
            <div className="space-y-2 text-center">
              <div className="mx-auto w-40 sm:w-48 md:w-56 h-auto rounded-2xl overflow-hidden">
                <img src={srsLogo} alt="SRS Logo" className="w-full h-auto object-contain" />
              </div>
              <h1 className="text-xl sm:text-2xl md:text-3xl font-black tracking-tight">Login</h1>
            </div>

            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between gap-3">
                  <label className="text-xs font-bold uppercase tracking-widest text-slate-500">PIN</label>
                  <button
                    type="button"
                    onClick={() => setShowLoginPin((prev) => !prev)}
                    className="inline-flex items-center gap-1.5 rounded-full border border-amber-200 bg-amber-50 px-3 py-1.5 text-[10px] font-bold text-amber-800 hover:bg-amber-100 transition cursor-pointer"
                    aria-label={showLoginPin ? "Hide PIN" : "Show PIN"}
                    title={showLoginPin ? "Hide PIN" : "Show PIN"}
                  >
                    {showLoginPin ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                    <span>{showLoginPin ? "Hide" : "View"}</span>
                  </button>
                </div>
                <div className="rounded-2xl border border-slate-900 bg-white overflow-hidden shadow-sm">
                  <div className="flex">
                  {loginPinDigits.map((digit, index) => (
                    <input
                      key={index}
                      ref={(node) => {
                        loginPinRefs.current[index] = node;
                      }}
                      type={showLoginPin ? "text" : "password"}
                      inputMode="numeric"
                      maxLength={1}
                      value={digit}
                      onChange={(e) => handleLoginPinChange(index, e.target.value)}
                      onKeyDown={(e) => handleLoginPinKeyDown(index, e)}
                      onPaste={(e) => {
                        e.preventDefault();
                        handleLoginPinChange(index, e.clipboardData.getData("text"));
                      }}
                      className={`h-11 sm:h-14 md:h-[4.5rem] w-full min-w-0 flex-1 border-0 border-r border-slate-900/20 bg-white text-center text-xl sm:text-3xl md:text-4xl font-black font-mono tracking-[0.02em] outline-none focus:bg-amber-50 ${index === 0 ? "rounded-l-2xl" : ""} ${index === loginPinLength - 1 ? "rounded-r-2xl border-r-0" : ""}`}
                      aria-label={`PIN digit ${index + 1}`}
                    />
                  ))}
                  </div>
                </div>
              </div>

              {loginMessage && (
                <div className={`rounded-2xl px-4 py-3 text-sm font-medium ${loginMessage === "Login successful." ? "bg-emerald-50 text-emerald-700 border border-emerald-200" : "bg-rose-50 text-rose-700 border border-rose-200"}`}>
                  {loginMessage}
                </div>
              )}

              <button
                type="submit"
                disabled={loginLoading || loginPin.replace(/\D/g, "").length !== loginPinLength}
                className="w-full rounded-2xl bg-slate-950 text-white py-3.5 font-bold tracking-wide shadow-lg shadow-slate-900/20 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loginLoading ? "Checking PIN..." : "Unlock App"}
              </button>
            </form>
          </div>
        </main>
      )}
      
      {/* Web Application Left Navigation Sidebar — Desktop only (hidden on < lg) */}
      <div className={`hidden lg:block transition-all duration-300 ease-in-out bg-slate-900 py-4 px-4 rounded-none border-r border-slate-800 space-y-4 lg:fixed lg:left-0 lg:top-[65px] lg:bottom-0 lg:h-[calc(100vh-65px)] lg:z-30 shrink-0 ${isSidebarCollapsed ? 'lg:w-20' : 'lg:w-72'}`}>
        <div className={`flex items-center pb-3 border-b border-slate-800 ${isSidebarCollapsed ? 'justify-center' : 'justify-between'}`}>
          <div className="flex items-center gap-2 min-w-0">
            <LayoutGrid className="w-5 h-5 text-indigo-400 shrink-0" />
            {!isSidebarCollapsed && (
              <span className="text-xs font-black tracking-wider text-slate-100 font-mono uppercase truncate">Control Console</span>
            )}
          </div>
          <button 
            onClick={() => {
              setIsSidebarCollapsed(!isSidebarCollapsed);
              localStorage.setItem("srs_sidebar_collapsed", String(!isSidebarCollapsed));
            }}
            title={isSidebarCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
            className="p-1 rounded bg-slate-950 border border-slate-850 hover:border-indigo-500 text-slate-400 hover:text-white transition duration-150 cursor-pointer ml-1"
          >
            {isSidebarCollapsed ? <ChevronRight className="w-3.5 h-3.5" /> : <ChevronLeft className="w-3.5 h-3.5" />}
          </button>
        </div>

        <div className="space-y-1.5">
          {[
            { id: "dashboard", label: "Dashboard Hub", desc: "Overview & Analytics Graphs", icon: Home },
            { id: "business", label: "Business", desc: "Labour Pool, Fleet & Logistics", icon: Briefcase },
            { id: "finance", label: "Finance", desc: "Debit & Lending Account Books", icon: DollarSign },
            { id: "expenses", label: "Family Budgeting", desc: "Category Budgets & Income", icon: Users },
            { id: "legacy-documents", label: "Secure Vault", desc: "Aadhaar, PAN & RC Book PDFs", icon: FileText },
            { id: "legacy-notifications", label: "Reminders & Alerts", desc: "Automated Compliance Auditing", icon: Bell },
            { id: "settings", label: "System Settings", desc: "Biometrics & Console Seeds", icon: Settings },
          ].map((item) => {
            const isSelected = selectedMobileModule === item.id || 
              (item.id === "business" && (selectedMobileModule === "labour" || selectedMobileModule === "vehicle" || selectedMobileModule === "legacy-labour" || selectedMobileModule === "legacy-vehicle"));

            return (
              <button
                key={item.id}
                onClick={() => {
                  setSelectedMobileModule(item.id as any);
                }}
                title={isSidebarCollapsed ? item.label : undefined}
                className={`w-full rounded-xl flex items-center transition cursor-pointer ${
                  isSidebarCollapsed ? 'justify-center p-3' : 'text-left p-3 gap-3'
                } ${
                  isSelected 
                    ? "nav-item-selected shadow-md shadow-indigo-950/30" 
                    : "nav-item-unselected border border-transparent"
                }`}
              >
                <item.icon className="w-4 h-4 shrink-0" />
                {!isSidebarCollapsed && (
                  <div className="flex-1 min-w-0">
                    <div className="text-xs font-bold truncate">{item.label}</div>
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* 1. TOP MASTER ENTERPRISE HEADER BAR */}
      <header id="master-header" className="bg-slate-900 border-b border-slate-800 px-3 sm:px-4 md:px-6 py-3 fixed top-0 left-0 right-0 z-40 shadow-xl backdrop-blur-md bg-opacity-95">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-2">
          
          {/* Left: Hamburger (mobile only) + Logo */}
          <div className="flex items-center gap-2 sm:gap-3 min-w-0">
            {/* Hamburger menu — only on < lg */}
            <button
              type="button"
              aria-label="Open navigation"
              onClick={() => setIsMobileNavOpen(true)}
              className="lg:hidden p-2 rounded-lg bg-slate-950 border border-slate-800 text-slate-300 hover:text-white hover:bg-slate-800 transition cursor-pointer shrink-0"
            >
              <Menu className="w-4 h-4" />
            </button>

            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-indigo-400 flex items-center justify-center text-slate-100 shadow-md shadow-indigo-900/30 shrink-0">
              <LayoutGrid className="w-4 h-4 sm:w-5 sm:h-5 text-slate-50" />
            </div>
            <div className="min-w-0">
              <h1 className="text-sm sm:text-base lg:text-lg font-bold tracking-tight text-orange-300 truncate">
                Manager
              </h1>
            </div>
          </div>

          {/* Right: Notifications & Lock */}
          <div className="flex items-center gap-1.5 sm:gap-3 shrink-0">
            
            {/* Language Switcher */}
            <button
              type="button"
              onClick={toggleLanguage}
              className="px-2 py-1.5 rounded-lg bg-slate-950 border border-slate-800 text-[10px] sm:text-xs font-bold text-orange-450 hover:bg-slate-905 hover:text-orange-400 hover:border-orange-500/40 transition duration-150 cursor-pointer shrink-0"
              title={language === "en" ? "தமிழ் மொழிக்கு மாற்றவும்" : "Switch to English"}
            >
              {language === "en" ? "தமிழ்" : "EN"}
            </button>

            {/* Notifications Alert Center Toggle */}
            <div className="relative">
              <button 
                onClick={() => setShowNotificationDrawer(!showNotificationDrawer)}
                className="p-2 rounded-lg bg-slate-950 border border-slate-800 hover:border-indigo-500/50 hover:bg-slate-900 text-slate-300 hover:text-white transition duration-150 relative cursor-pointer"
              >
                <Bell className="w-4 h-4" />
                {unreadNotificationCount > 0 && (
                  <span className="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full bg-rose-600 text-[10px] font-bold flex items-center justify-center text-white font-mono shadow-md animate-bounce">
                    {unreadNotificationCount}
                  </span>
                )}
              </button>
              
              {/* Dropdown Notification Box */}
              {showNotificationDrawer && (
                <div id="notification-dropdown" className="absolute right-0 mt-2 w-80 bg-slate-900 border border-slate-800 rounded-xl shadow-2xl z-50 p-4">
                  <div className="flex items-center justify-between pb-2 border-b border-slate-800 mb-3">
                    <span className="text-xs font-bold text-slate-300">Live FCM Push Notifications</span>
                    <button 
                      onClick={() => setNotifications(prev => prev.map(n => ({ ...n, isRead: true })))}
                      className="text-[10px] text-indigo-400 hover:underline"
                    >
                      Clear all
                    </button>
                  </div>
                  <div className="space-y-2 max-h-60 overflow-y-auto">
                    {notifications.length === 0 ? (
                      <p className="text-[11px] text-slate-500 text-center py-4">No active reminders listed.</p>
                    ) : (
                      notifications.map(n => (
                        <div key={n.id} className={`p-2 rounded border text-xs relative ${n.isRead ? "bg-slate-950/40 border-slate-900 text-slate-400" : "bg-indigo-950/20 border-indigo-900/40 text-slate-200"}`}>
                          <div className="font-semibold text-[11px] pr-4 flex items-center gap-1">
                            {!n.isRead && <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 flex-shrink-0" />}
                            {n.title}
                          </div>
                          <div className="text-[10px] text-slate-400 mt-1">{n.body}</div>
                          <div className="text-[9px] font-mono text-slate-500 mt-1 flex justify-between items-center">
                            <span>{n.date}</span>
                            <div className="flex gap-2">
                              <button onClick={() => toggleReadNotification(n.id)} className="text-indigo-400 hover:underline">
                                {n.isRead ? "Mark New" : "Read"}
                              </button>
                              <button onClick={() => deleteNotification(n.id)} className="text-rose-400 hover:underline">Remove</button>
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>

            <button
              type="button"
              onClick={handleLockScreen}
              className="flex items-center gap-1.5 bg-slate-950 px-2 sm:px-3 py-1.5 rounded-lg border border-slate-800 text-xs text-slate-200 hover:bg-slate-900 hover:border-slate-700 transition cursor-pointer"
              aria-label="Lock screen"
              title="Lock screen"
            >
              <Lock className="w-3.5 h-3.5 text-amber-400" />
              <span className="font-mono font-bold tracking-wide hidden sm:inline">Lock</span>
            </button>

          </div>
        </div>
      </header>

      {/* MOBILE SIDEBAR DRAWER BACKDROP (< lg) */}
      {isMobileNavOpen && (
        <div
          className="sidebar-backdrop"
          onClick={() => setIsMobileNavOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* MOBILE SIDEBAR DRAWER PANEL (< lg) */}
      <div
        className={`sidebar-drawer bg-slate-900 border-r border-slate-800 flex flex-col p-4 lg:hidden ${
          isMobileNavOpen ? "" : "hidden-drawer"
        }`}
        role="dialog"
        aria-modal="true"
        aria-label="Navigation menu"
      >
        <div className="flex items-center justify-between pb-4 border-b border-slate-800 mb-4">
          <div className="flex items-center gap-2">
            <LayoutGrid className="w-5 h-5 text-indigo-400" />
            <span className="text-xs font-black tracking-wider text-slate-100 font-mono uppercase">Navigation</span>
          </div>
          <button
            onClick={() => setIsMobileNavOpen(false)}
            className="p-1.5 rounded-lg bg-slate-950 border border-slate-800 text-slate-400 hover:text-white transition cursor-pointer"
            aria-label="Close navigation"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="flex-1 space-y-1.5 overflow-y-auto">
          {[
            { id: "dashboard", label: "Dashboard Hub", desc: "Overview & Analytics", icon: Home },
            { id: "business", label: "Business", desc: "Labour, Fleet & Logistics", icon: Briefcase },
            { id: "finance", label: "Finance", desc: "Debit & Lending Books", icon: DollarSign },
            { id: "expenses", label: "Family Budgeting", desc: "Budgets & Income", icon: Users },
            { id: "legacy-documents", label: "Secure Vault", desc: "Aadhaar, PAN & RC Book", icon: FileText },
            { id: "legacy-notifications", label: "Reminders & Alerts", desc: "Compliance Auditing", icon: Bell },
            { id: "settings", label: "System Settings", desc: "Biometrics & Seeds", icon: Settings },
          ].map((item) => {
            const isSelected = selectedMobileModule === item.id ||
              (item.id === "business" && (selectedMobileModule === "labour" || selectedMobileModule === "vehicle"));
            return (
              <button
                key={item.id}
                onClick={() => {
                  setSelectedMobileModule(item.id as any);
                  setIsMobileNavOpen(false);
                }}
                className={`w-full text-left p-3 rounded-xl flex items-center gap-3 transition cursor-pointer ${
                  isSelected ? "nav-item-selected" : "nav-item-unselected border border-transparent"
                }`}
              >
                <item.icon className="w-4 h-4 shrink-0" />
                <div className="flex-1 min-w-0">
                  <div className="text-xs font-bold truncate">{item.label}</div>
                  <div className="text-[10px] opacity-70 truncate">{item.desc}</div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* 3. PRIMARY CONTENT PANEL - DESKTOP LAYOUT SHIFT CONTROLS */}
      <main id="primary-content-grid" className={`flex-1 w-full max-w-7xl mx-auto px-0 sm:px-4 md:px-6 py-2 sm:py-4 md:py-6 flex flex-col gap-4 md:gap-6 transition-all duration-300 mt-[65px] ${isSidebarCollapsed ? 'lg:pl-20' : 'lg:pl-72'}`}>
        
        {/* WORKSPACE CONTENT BODY */}
        <section id="workspace-container" className="flex-1 w-full">
          <div className="space-y-4 md:space-y-6 animate-fade-in w-full">
              
              {/* Widescreen Desktop Web Application View Block */}
              <div className="flex flex-col items-stretch lg:items-start animate-fade-in w-full min-h-0">



                  {/* Web Application Right Content Board */}
                  <div id="right-content-board" className="flex-1 w-full min-w-0 space-y-4 md:space-y-6">

                    {isModuleBlockedForRole(selectedMobileModule) ? (
                      <div className="bg-slate-900 p-8 rounded-2xl border border-slate-800 text-center flex flex-col justify-center items-center">
                        <Lock className="w-12 h-12 text-amber-500 mb-4 animate-bounce" />
                        <h3 className="text-md font-bold text-slate-200">Security Clearance Access Denied</h3>
                        <p className="text-xs text-slate-400 mt-2 leading-relaxed max-w-md">
                          This module is unavailable in the current view.
                        </p>
                        <button
                          onClick={() => setSelectedMobileModule("dashboard")}
                          className="mt-6 bg-indigo-600 hover:bg-indigo-700 text-white py-2 px-6 rounded-lg font-semibold text-xs transition active:scale-95 cursor-pointer"
                        >
                          Return to Dashboard
                        </button>
                      </div>
                    ) : (
                      <div className="bg-slate-900 p-3 sm:p-4 md:p-6 rounded-none sm:rounded-2xl border-y sm:border border-slate-800 space-y-4 md:space-y-6">
                        <div className="w-full">
                          {selectedMobileModule === "dashboard" && (
                            <MobileDashboard
                              labours={labours}
                              salaryPayments={salaryPayments}
                              vehicles={vehicles}
                              fuelEntries={fuelEntries}
                              loansGiven={loansGiven}
                              loansReceived={loansReceived}
                              familyExpenses={familyExpenses}
                              attendance={attendance}
                              activeLabourCount={activeLabourCount}
                              totalOutstandingLoanAmount={totalOutstandingLoanAmount}
                              totalMonthlyExpense={totalMonthlyExpense}
                              familySavingsRate={familySavingsRate}
                              language={language}
                              t={t}
                              bitEntries={bitEntries}
                              hammerEntries={hammerEntries}
                              businessBills={businessBills}
                              pipeEntries={pipeEntries}
                            />
                          )}

                          {selectedMobileModule === "business" && (
                            <MobileBusiness
                            apiBaseUrl={apiBaseUrl}
                            labours={labours}
                            setLabours={setLabours}
                            vehicles={vehicles}
                            setVehicles={setVehicles}
                            bitEntries={bitEntries}
                            setBitEntries={setBitEntries}
                            hammerEntries={hammerEntries}
                            setHammerEntries={setHammerEntries}
                            pipeEntries={pipeEntries}
                            setPipeEntries={setPipeEntries}
                            businessBills={businessBills}
                              setBusinessBills={setBusinessBills}
                              fuelEntries={fuelEntries}
                              setFuelEntries={setFuelEntries}
                              salaryPayments={salaryPayments}
                              setSalaryPayments={setSalaryPayments}
                              attendance={attendance}
                              setAttendance={setAttendance}
                              isOnline={isOnline}
                              triggerOnlineSync={(op) => triggerLocalAction(op, () => {})}
                              onSharedDataChanged={announceSharedDataChange}
                              initialSubSection="labour"
                            />
                          )}

                          {selectedMobileModule === "finance" && (
                            <MobileFinance
                              apiBaseUrl={apiBaseUrl}
                              loansGiven={loansGiven}
                              setLoansGiven={setLoansGiven}
                              loansReceived={loansReceived}
                              setLoansReceived={setLoansReceived}
                              vehicles={vehicles}
                              triggerOnlineSync={(op) => triggerLocalAction(op, () => {})}
                              onSharedDataChanged={announceSharedDataChange}
                            />
                          )}

                          {selectedMobileModule === "expenses" && (
                            <MobileFamily
                              apiBaseUrl={apiBaseUrl}
                              familyExpenses={familyExpenses}
                              setFamilyExpenses={setFamilyExpenses}
                              familyMembers={familyMembers}
                              incomeEntries={incomeEntries}
                              onSharedDataChanged={announceSharedDataChange}
                            />
                          )}

                          {selectedMobileModule === "legacy-documents" && (
                            <div className="space-y-4">
                              <div className="bg-slate-950 p-4 rounded-xl border border-dashed border-slate-800 text-center space-y-2">
                                <Upload className="w-8 h-8 text-indigo-400 mx-auto" />
                                <div className="text-xs font-bold text-slate-200">Drag & Drop Documents Here to Securely Encrypt</div>
                                <p className="text-[10px] text-slate-500">Aadhaar Card, PAN Card, RC Book, Insurance Policy, or Loan Agreements. Max size: 10MB.</p>
                              </div>

                              <form onSubmit={handleUploadDocument} className="bg-slate-950 p-4 rounded-xl border border-slate-850 space-y-3">
                                <span className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-widest block">Add New Document Registry</span>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                                  <input
                                    type="text"
                                    placeholder="Document Name (e.g. Abhiram PAN)"
                                    value={newDocName}
                                    onChange={(e) => setNewDocName(e.target.value)}
                                    className="bg-slate-900 border border-slate-800 p-2 text-xs rounded-xl text-slate-300 focus:outline-none focus:border-indigo-500"
                                  />
                                  <select 
                                    value={newDocType}
                                    onChange={(e) => setNewDocType(e.target.value as any)}
                                    className="bg-slate-900 border border-slate-800 p-2 text-xs rounded-xl text-slate-300 focus:outline-none focus:border-indigo-500"
                                  >
                                    <option value="Aadhaar">Aadhaar Card</option>
                                    <option value="PAN">PAN Tax Card</option>
                                    <option value="RC Book">Vehicle RC Book</option>
                                    <option value="Insurance">Insurance Policy</option>
                                    <option value="Loan Agreement">Loan Contract</option>
                                  </select>
                                  <input
                                    type="text"
                                    placeholder="Owner Name"
                                    value={newDocOwner}
                                    onChange={(e) => setNewDocOwner(e.target.value)}
                                    className="bg-slate-900 border border-slate-800 p-2 text-xs rounded-xl text-slate-300 focus:outline-none focus:border-indigo-500"
                                  />
                                </div>
                                <button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs py-2 rounded-xl transition cursor-pointer">
                                  Upload Secure Document Metas
                                </button>
                              </form>

                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {filteredDocs.map((d) => (
                                  <div key={d.id} className="bg-slate-950 p-4 rounded-xl border border-slate-855 flex items-center justify-between text-xs">
                                    <div className="min-w-0 pr-4">
                                      <h4 className="font-bold text-slate-200 truncate leading-snug">{d.name}</h4>
                                      <p className="text-[10px] font-mono text-slate-400 mt-1">Type: {d.type} • Owner: {d.ownerName} • Size: {d.fileSize}</p>
                                    </div>
                                    <button 
                                      onClick={() => alert(`Simulated downloading secure binary document for '${d.name}' over authorized FastAPI pathways.`)}
                                      className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-indigo-400 hover:text-white cursor-pointer transition"
                                    >
                                      <Download className="w-4 h-4" />
                                    </button>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}

                          {selectedMobileModule === "legacy-notifications" && (
                            <div className="space-y-4">
                              <span className="text-xs font-mono text-slate-400 uppercase font-bold">FCM Reminders Registry</span>
                              <div className="space-y-3">
                                {notifications.map(n => (
                                  <div key={n.id} className="p-4 bg-slate-950 rounded-xl border border-slate-855 text-xs space-y-2">
                                    <div className="font-extrabold text-slate-200 flex items-center gap-1.5 text-sm">
                                      <AlertTriangle className="w-4 h-4 text-indigo-400" />
                                      {n.title}
                                    </div>
                                    <p className="text-slate-400 leading-normal text-xs">{n.body}</p>
                                    <span className="text-[10px] text-slate-500 font-mono italic block">{n.date}</span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}

                          {selectedMobileModule === "settings" && (
                            <div className="space-y-6">
                              <div className="bg-slate-950 p-4 rounded-xl border border-slate-850 space-y-4">
                                <h3 className="text-xs font-mono font-bold text-indigo-400 uppercase tracking-widest flex items-center gap-1.5">
                                  <Lock className="w-3.5 h-3.5" />
                                  Authentication Preferences
                                </h3>
                              <div className="flex items-center justify-between p-3 bg-slate-900 rounded-lg border border-slate-800">
                                <div className="space-y-0.5">
                                  <span className="text-xs font-bold text-slate-200">Global Biometric Lock</span>
                                  <p className="text-[10px] text-slate-500 font-mono">Require face/fingerprint authorization challenges before letting active roles inspect vaults.</p>
                                </div>
                                  <button
                                    type="button"
                                    onClick={() => toggleBiometricsGlobal(!isBiometricEnabled)}
                                    className={`w-10 h-5.5 rounded-full p-0.5 transition-colors duration-200 focus:outline-none cursor-pointer relative ${
                                      isBiometricEnabled ? "bg-indigo-600" : "bg-slate-700"
                                    }`}
                                  >
                                    <div className={`w-4.5 h-4.5 rounded-full bg-white transition-transform duration-200 ${
                                      isBiometricEnabled ? "translate-x-4.5" : "translate-x-0"
                                    }`} />
                                  </button>
                                </div>
                              </div>

                              <div className="bg-slate-900 p-4 rounded-xl border border-slate-800 space-y-4">
                                <div className="space-y-0.5">
                                  <h3 className="text-xs font-mono font-bold text-indigo-400 uppercase tracking-widest">Change Login PIN</h3>
                                  <p className="text-[10px] text-slate-400 leading-normal">
                                    Verify your current PIN, then enter and confirm the new PIN before saving.
                                  </p>
                                </div>

                                <form onSubmit={handleChangePassword} className="space-y-2.5">
                                  <div className="space-y-1.5">
                                    <label className="text-[8px] uppercase tracking-wider font-bold text-slate-500">Old PIN</label>
                                    <div className="flex items-center gap-2 bg-slate-950 border border-slate-850 rounded-lg px-2.5 py-2">
                                      <input
                                        type={showOldPassword ? "text" : "password"}
                                        value={oldPassword}
                                        onChange={(e) => setOldPassword(e.target.value)}
                                        placeholder="Enter old PIN"
                                        className="flex-1 bg-transparent text-[11px] text-slate-200 outline-none"
                                      />
                                      <button type="button" onClick={() => setShowOldPassword((prev) => !prev)} className="text-slate-400 hover:text-white">
                                        {showOldPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                                      </button>
                                    </div>
                                  </div>

                                  <div className="space-y-1.5">
                                    <label className="text-[8px] uppercase tracking-wider font-bold text-slate-500">New PIN</label>
                                    <div className="flex items-center gap-2 bg-slate-950 border border-slate-850 rounded-lg px-2.5 py-2">
                                      <input
                                        type={showNewPassword ? "text" : "password"}
                                        value={newPassword}
                                        onChange={(e) => setNewPassword(e.target.value)}
                                        placeholder="Enter new PIN"
                                        className="flex-1 bg-transparent text-[11px] text-slate-200 outline-none"
                                      />
                                      <button type="button" onClick={() => setShowNewPassword((prev) => !prev)} className="text-slate-400 hover:text-white">
                                        {showNewPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                                      </button>
                                    </div>
                                  </div>

                                  <div className="space-y-1.5">
                                    <label className="text-[8px] uppercase tracking-wider font-bold text-slate-500">Confirm New PIN</label>
                                    <div className="flex items-center gap-2 bg-slate-950 border border-slate-850 rounded-lg px-2.5 py-2">
                                      <input
                                        type={showConfirmNewPassword ? "text" : "password"}
                                        value={confirmNewPassword}
                                        onChange={(e) => setConfirmNewPassword(e.target.value)}
                                        placeholder="Re-enter new PIN"
                                        className="flex-1 bg-transparent text-[11px] text-slate-200 outline-none"
                                      />
                                      <button type="button" onClick={() => setShowConfirmNewPassword((prev) => !prev)} className="text-slate-400 hover:text-white">
                                        {showConfirmNewPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                                      </button>
                                    </div>
                                  </div>

                                  {passwordMessage && (
                                    <div className={`text-[10px] rounded-lg px-3 py-2 border ${passwordMessage.toLowerCase().includes("success") ? "bg-emerald-950/40 text-emerald-300 border-emerald-900/40" : "bg-rose-950/40 text-rose-300 border-rose-900/40"}`}>
                                      {passwordMessage}
                                    </div>
                                  )}

                                  <button
                                    type="submit"
                                    disabled={passwordLoading || !oldPassword || !newPassword || !confirmNewPassword}
                                    className="w-full bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed text-white py-2 rounded-lg text-[10px] font-bold cursor-pointer"
                                  >
                                    {passwordLoading ? "Saving..." : "Save PIN"}
                                  </button>
                                </form>
                              </div>

                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>

                </div>




              {/* SIMULATOR_BYPASS_OLD_MOBILE_FRAME */}
              {false && (
            <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 items-start">
              
              {/* SMARTPHONE DEVICE FRAMER (VIRTUAL APP PREVIEW) */}
              <div className="xl:col-span-5 flex justify-center">
                <div id="virtual-phone-device" className="w-[370px] h-[760px] rounded-[50px] bg-slate-900 border-[12px] border-slate-800 shadow-[0_25px_60px_-15px_rgba(3,7,18,0.9)] flex flex-col overflow-hidden relative border-t-[14px]">
                  
                  {/* Speaker Grill / Dynamic Island camera notch */}
                  <div className="absolute top-2 left-1/2 -translate-x-1/2 w-28 h-5 rounded-full bg-black z-30 flex items-center justify-center">
                    <div className="w-10 h-1 bg-zinc-900 rounded-full" />
                    <div className="w-2.5 h-2.5 rounded-full bg-zinc-950 ml-2 border border-zinc-900 border-opacity-40" />
                  </div>

                  {/* Phone Screen body */}
                  <div id="virtual-phone-screen" className="flex-1 min-h-0 bg-slate-950 flex flex-col text-slate-100 select-none relative pt-4" style={{ fontFamily: phoneFont }}>
                    
                    {/* Dynamic Theme Customization CSS Rules */}
                    <style>{`
                      #virtual-phone-device {
                        box-shadow: 0 25px 60px -15px rgba(3,7,18,0.95), 0 0 50px -5px ${phoneAccentColor}44 !important;
                        border-color: ${phoneContainerColor}dd !important;
                        background-color: ${phoneBgColor} !important;
                      }
                      #virtual-phone-screen {
                        font-family: ${phoneFont === 'Inter' ? '"Inter", sans-serif' : phoneFont === 'JetBrains Mono' ? '"JetBrains Mono", monospace' : phoneFont === 'Space Grotesk' ? '"Space Grotesk", sans-serif' : phoneFont === 'Outfit' ? '"Outfit", sans-serif' : '"Playfair Display", serif'} !important;
                      }
                      #virtual-phone-screen, 
                      #virtual-phone-screen .bg-slate-950, 
                      #virtual-phone-screen [class*="bg-slate-950"] {
                        background-color: ${phoneBgColor} !important;
                      }
                      #virtual-phone-screen .bg-slate-900, 
                      #virtual-phone-screen [class*="bg-slate-900"], 
                      #virtual-phone-screen [class*="bg-slate-900/60"], 
                      #virtual-phone-screen [class*="bg-slate-900/40"],
                      #virtual-phone-screen [class*="bg-slate-900/80"] {
                        background-color: ${phoneContainerColor} !important;
                      }
                      #virtual-phone-screen .border-slate-800, 
                      #virtual-phone-screen .border-slate-850, 
                      #virtual-phone-screen .border-slate-855,
                      #virtual-phone-screen .border-slate-900 {
                        border-color: rgba(255, 255, 255, 0.08) !important;
                      }
                      #virtual-phone-screen .text-indigo-400 {
                         color: ${phoneAccentColor} !important;
                      }
                      #virtual-phone-screen .bg-indigo-600, 
                      #virtual-phone-screen .bg-indigo-650 {
                         background-color: ${phoneAccentColor} !important;
                         color: #ffffff !important;
                      }
                      #virtual-phone-screen .border-indigo-500 {
                         border-color: ${phoneAccentColor} !important;
                      }
                    `}</style>
                    
                    {/* Simulated Mobile Status bar */}
                    <div className="px-5 py-1.5 flex justify-between items-center text-[10px] font-mono text-slate-400 z-20 bg-slate-950">
                      <span>11:05 AM</span>
                      <div className="flex items-center gap-1.5">
                        <span className="text-[9px]">LTE</span>
                        <div className="w-4 h-2.5 border border-slate-500 rounded-sm flex items-center p-0.5">
                          <div className="bg-emerald-400 flex-1 h-full rounded-2xs" />
                        </div>
                      </div>
                    </div>

                    {/* SLIDING MOBILE MENU BAR / DRAWER */}
                    {isMobileLoggedIn && isMobileMenuOpen && (
                      <div className="absolute inset-y-0 left-0 w-3/4 bg-slate-900 border-r border-slate-800 z-40 shadow-2xl flex flex-col p-4">
                        {/* Drawer Header */}
                        <div className="flex items-center justify-between pb-4 border-b border-slate-800 mb-4">
                          <div className="flex items-center gap-2">
                            <LayoutGrid className="w-5 h-5 text-indigo-400" />
                            <span className="text-xs font-extrabold tracking-wider text-white font-mono uppercase">Menu Hub</span>
                          </div>
                          <button 
                            onClick={() => setIsMobileMenuOpen(false)}
                            className="p-1 rounded bg-slate-950 border border-slate-800 text-slate-400 hover:text-white cursor-pointer transition active:scale-95"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </div>

                        {/* List of Menu Options */}
                        <div className="flex-1 space-y-1.5 overflow-y-auto">
                          {[
                            { id: "dashboard", label: "Dashboard Hub", desc: "Overview & Analytics Graphs", icon: Home },
                            { id: "business", label: "Business", desc: "Labour Pool, Fleet & Logistics", icon: Briefcase },
                            { id: "finance", label: "Finance", desc: "Debit & Lending Account Books", icon: DollarSign },
                            { id: "expenses", label: "Family Budgeting", desc: "Category Budgets & Shared Income", icon: Users },
                            { id: "documents", label: "Secure Vault", desc: "Aadhaar, PAN & RC Book PDFs", icon: FileText },
                            { id: "notifications", label: "Reminders & Alerts", desc: "Automated Compliance Auditing", icon: Bell },
                            { id: "settings", label: "System Settings", desc: "Biometrics & Device Locks", icon: Settings },
                          ].map((item) => {
                            const isSelected = selectedMobileModule === item.id || 
                              (item.id === "business" && (selectedMobileModule === "labour" || selectedMobileModule === "vehicle")) ||
                              (item.id === "finance" && selectedMobileModule === "legacy-finance") ||
                              (item.id === "expenses" && selectedMobileModule === "legacy-expenses") ||
                              (item.id === "documents" && selectedMobileModule === "legacy-documents") ||
                              (item.id === "notifications" && selectedMobileModule === "legacy-notifications");

                            return (
                              <button
                                key={item.id}
                                onClick={() => {
                                  // Map appropriately to the legacy or standard views
                                  if (item.id === "documents") setSelectedMobileModule("legacy-documents");
                                  else if (item.id === "notifications") setSelectedMobileModule("legacy-notifications");
                                  else setSelectedMobileModule(item.id as any);
                                  
                                  setIsMobileMenuOpen(false);
                                }}
                                className={`w-full text-left p-2 rounded-xl flex items-center gap-3 transition ${
                                  isSelected 
                                    ? "nav-item-selected border border-transparent" 
                                    : "nav-item-unselected border border-transparent"
                                }`}
                              >
                                <item.icon className="w-4 h-4" />
                                <div className="flex-1 min-w-0">
                                  <div className="text-[11px] font-bold truncate">{item.label}</div>
                                </div>
                              </button>
                            );
                          })}
                        </div>

                        {/* Drawer Footer Status */}
                        <div className="pt-3 border-t border-slate-800 space-y-2 mt-auto">
                          <div className="flex items-center justify-between text-[9px] text-slate-400">
                            <span>Status:</span>
                            <span className="font-mono text-emerald-400 font-bold">MUTUAL DECOUPLED</span>
                          </div>
                          <div className="text-[8.5px] text-slate-500 leading-normal font-mono">
                            Mode: Admin
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Backdrop cover for Drawer menu */}
                    {isMobileLoggedIn && isMobileMenuOpen && (
                      <div 
                        onClick={() => setIsMobileMenuOpen(false)}
                        className="absolute inset-0 bg-black/60 z-30 cursor-pointer backdrop-blur-[1px]" 
                      />
                    )}

                    {/* App Header (Internal back bar & switchers) */}
                    <div className="px-4 py-3 bg-slate-900 border-b border-slate-850 flex items-center justify-between z-20">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => setIsMobileMenuOpen(true)}
                          aria-label="Open menu"
                          className="w-7 h-7 rounded bg-indigo-600 hover:bg-indigo-700 flex items-center justify-center text-white cursor-pointer transition active:scale-95"
                        >
                          <Menu className="w-4 h-4" />
                        </button>
                        <div>
                          <h4 className="text-xs font-bold tracking-tight text-white">Smart Manager</h4>
                        </div>
                      </div>
                      
                      {/* Live controls (notifications badge, settings & security lock) */}
                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={handleLockScreen}
                          title="Lock screen"
                          aria-label="Lock screen"
                          className="p-1 rounded bg-slate-950 border border-slate-800 text-amber-400 hover:text-amber-300 hover:border-amber-500/60 cursor-pointer"
                        >
                          <Lock className="w-3.5 h-3.5" />
                        </button>

                        <button 
                          onClick={() => setSelectedMobileModule("notifications")}
                          className="p-1 rounded bg-slate-950 border border-slate-800 text-slate-300 relative cursor-pointer"
                        >
                          <Bell className="w-3.5 h-3.5" />
                          {unreadNotificationCount > 0 && (
                            <div className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-rose-500 animate-ping" />
                          )}
                        </button>

                        <button 
                          onClick={() => setSelectedMobileModule("settings")}
                          title="System Settings"
                          className={`p-1 rounded bg-slate-950 border border-slate-800 flex items-center justify-center transition cursor-pointer ${
                            selectedMobileModule === "settings" ? "text-indigo-400" : "text-slate-350 hover:text-white"
                          }`}
                        >
                          <Settings className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    {/* Admin-only app: no role-based access restrictions remain. */}

                    {/* COMPONENT BODY SELECTOR */}
                    {!isModuleBlockedForRole(selectedMobileModule) && (
                      <div className="flex-1 min-h-0 overflow-y-auto pb-16 z-10 px-4 pt-3 flex flex-col">
                        
                        {selectedMobileModule === "dashboard" && (
                          <MobileDashboard
                            labours={labours}
                            salaryPayments={salaryPayments}
                            vehicles={vehicles}
                            fuelEntries={fuelEntries}
                            loansGiven={loansGiven}
                            loansReceived={loansReceived}
                            familyExpenses={familyExpenses}
                            attendance={attendance}
                            language={language}
                            t={t}
                            bitEntries={bitEntries}
                            hammerEntries={hammerEntries}
                            businessBills={businessBills}
                            pipeEntries={pipeEntries}
                          />
                        )}

                        {(selectedMobileModule === "business" || selectedMobileModule === "labour" || selectedMobileModule === "vehicle") && (
                          <MobileBusiness
                            key={selectedMobileModule}
                            apiBaseUrl={apiBaseUrl}
                            labours={labours}
                            setLabours={setLabours}
                            vehicles={vehicles}
                            setVehicles={setVehicles}
                            bitEntries={bitEntries}
                            setBitEntries={setBitEntries}
                            hammerEntries={hammerEntries}
                            setHammerEntries={setHammerEntries}
                            pipeEntries={pipeEntries}
                            setPipeEntries={setPipeEntries}
                            fuelEntries={fuelEntries}
                            setFuelEntries={setFuelEntries}
                            salaryPayments={salaryPayments}
                            setSalaryPayments={setSalaryPayments}
                            attendance={attendance}
                            setAttendance={setAttendance}
                            businessBills={businessBills}
                            setBusinessBills={setBusinessBills}
                            isOnline={true}
                            triggerOnlineSync={(op) => triggerLocalAction(op, () => {})}
                            onSharedDataChanged={announceSharedDataChange}
                            initialSubSection={selectedMobileModule === "vehicle" ? "vehicles" : "labour"}
                          />
                        )}

                        {selectedMobileModule === "finance" && (
                          <MobileFinance
                            apiBaseUrl={apiBaseUrl}
                            loansGiven={loansGiven}
                            setLoansGiven={setLoansGiven}
                            loansReceived={loansReceived}
                            setLoansReceived={setLoansReceived}
                            vehicles={vehicles}
                            triggerOnlineSync={(op) => triggerLocalAction(op, () => {})}
                          />
                        )}

                        {selectedMobileModule === "expenses" && (
                          <MobileFamily
                            apiBaseUrl={apiBaseUrl}
                            familyExpenses={familyExpenses}
                            setFamilyExpenses={setFamilyExpenses}
                            familyMembers={familyMembers}
                            incomeEntries={incomeEntries}
                          />
                        )}

                        {false && (
                          <div className="space-y-4">
                            
                            {/* Dashboard Segment Welcomer with local date */}
                            <div className="flex justify-between items-center bg-slate-900/40 p-3 rounded-xl border border-slate-850">
                              <div>
                                <span className="text-[9px] font-mono text-slate-500 uppercase tracking-widest font-bold">Good morning,</span>
                                <h3 className="text-xs font-bold text-slate-200">Abhiram Ad</h3>
                              </div>
                              <Calendar className="w-4 h-4 text-slate-500" />
                            </div>

                            {/* Applet Quick Search Area */}
                            <div className="relative">
                              <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-2.5" />
                              <input
                                type="text"
                                placeholder="Search active profiles..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full bg-slate-900 border border-slate-850 text-xs py-2 pl-9 pr-4 rounded-xl text-slate-300 focus:outline-none focus:border-indigo-500 transition-colors"
                              />
                            </div>

                            {/* Custom SVG Curved Profit Analytics Chart */}
                            <div className="bg-slate-900 p-3 rounded-xl border border-slate-850">
                              <div className="flex items-center justify-between mb-2">
                                <span className="text-[10px] uppercase font-mono tracking-wider text-slate-400 font-bold">Monthly Profit Target</span>
                                <span className="text-[10px] text-emerald-400 font-mono font-bold">+18.4%</span>
                              </div>
                              
                              {/* Glowing custom SVG line graph */}
                              <div className="relative h-20 bg-slate-950 rounded border border-slate-900 overflow-hidden flex items-end">
                                <svg className="absolute inset-0 w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
                                  <defs>
                                    <linearGradient id="chartGrad" x1="0" y1="0" x2="0" y2="1">
                                      <stop offset="0%" stopColor="#6366f1" stopOpacity="0.4" />
                                      <stop offset="100%" stopColor="#6366f1" stopOpacity="0" />
                                    </linearGradient>
                                  </defs>
                                  {/* Grid lines */}
                                  <line x1="0" y1="25" x2="100" y2="25" stroke="#1e293b" strokeWidth="0.5" strokeDasharray="1 1" />
                                  <line x1="0" y1="50" x2="100" y2="50" stroke="#1e293b" strokeWidth="0.5" strokeDasharray="1 1" />
                                  <line x1="0" y1="75" x2="100" y2="75" stroke="#1e293b" strokeWidth="0.5" strokeDasharray="1 1" />
                                  
                                  {/* Area */}
                                  <path d="M 0 85 Q 15 50 30 65 T 60 30 T 90 20 T 100 15 L 100 100 L 0 100 Z" fill="url(#chartGrad)" />
                                  {/* Stroke line */}
                                  <path d="M 0 85 Q 15 50 30 65 T 60 30 T 90 20 T 100 15" fill="none" stroke="#6366f1" strokeWidth="2" strokeLinecap="round" />
                                </svg>
                                
                                <div className="absolute right-2 bottom-1.5 text-[9px] font-mono text-slate-400">₹88K Surplus</div>
                              </div>
                            </div>

                            {/* Dynamic Grid Quick Shortcuts */}
                            <div className="grid grid-cols-2 gap-3">
                              
                              <button 
                                onClick={() => setSelectedMobileModule("business")}
                                className="col-span-2 p-3 bg-indigo-950/30 rounded-xl border border-indigo-900/40 hover:border-indigo-500/50 transition-colors cursor-pointer text-left focus:outline-none"
                              >
                                <Briefcase className="w-5 h-5 text-indigo-400 mb-1" />
                                <h4 className="text-[11px] font-semibold text-slate-200">Business</h4>
                                <span className="text-[9px] text-slate-500 font-mono">{labours.length} Workers • {vehicles.length} Vehicles</span>
                              </button>

                              <button 
                                onClick={() => setSelectedMobileModule("finance")}
                                className="p-3 bg-amber-950/30 rounded-xl border border-amber-900/40 hover:border-amber-500/50 transition-colors cursor-pointer text-left focus:outline-none"
                              >
                                <TrendingUp className="w-5 h-5 text-amber-400 mb-1" />
                                <h4 className="text-[11px] font-semibold text-slate-200">Debt Ledger</h4>
                                <span className="text-[9px] text-slate-500 font-mono">₹{totalOutstandingLoanAmount.toLocaleString()} active</span>
                              </button>

                              <button 
                                onClick={() => setSelectedMobileModule("expenses")}
                                className="p-3 bg-rose-950/30 rounded-xl border border-rose-900/40 hover:border-rose-500/50 transition-colors cursor-pointer text-left focus:outline-none"
                              >
                                <DollarSign className="w-5 h-5 text-rose-400 mb-1" />
                                <h4 className="text-[11px] font-semibold text-slate-200">Family Budgets</h4>
                                <span className="text-[9px] text-slate-500 font-mono">₹{totalMonthlyExpense.toLocaleString()} Spent</span>
                              </button>

                            </div>

                            {/* Module Expiry Exceed Notifications feed directly inside home dashboard */}
                            {notifications.length > 0 && (
                              <div className="bg-slate-900/55 p-3 rounded-xl border border-slate-850/60">
                                <span className="text-[9px] font-mono tracking-widest text-slate-400 uppercase block mb-2 font-bold">Actionable Alerts</span>
                                <div className="space-y-1.5">
                                  {notifications.slice(0, 2).map((n) => (
                                    <div key={n.id} className="text-[10px] text-slate-300 flex items-start gap-1.5 leading-relaxed">
                                      <AlertTriangle className="w-3 h-3 text-amber-400 flex-shrink-0 mt-0.5" />
                                      <span>
                                        <strong>{n.title.split(":")[0]}</strong>: {n.body.slice(0, 60)}...
                                      </span>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}

                          </div>
                        )}

                        {/* PHONE PANEL - LABOUR DIRECTORY VIEW */}
                        {selectedMobileModule === "legacy-labour" && (
                          <div className="space-y-4">
                            <div className="flex justify-between items-center">
                              <span className="text-xs font-mono text-slate-400 uppercase font-bold">Labour List</span>
                              <span className="text-[9px] bg-slate-900 px-2 py-0.5 rounded font-mono text-slate-400">₹750/Day Base</span>
                            </div>

                            {/* Swipeable List of Roster workers */}
                            <div className="space-y-2">
                              {filteredLabours.map((l) => (
                                <div key={l.id} className="bg-slate-900 p-2.5 rounded-xl border border-slate-850 flex flex-col gap-2">
                                  <div className="flex items-center justify-between">
                                    <div>
                                      <div className="text-xs font-semibold text-slate-200">{l.fullName}</div>
                                      <span className="text-[9.5px] text-slate-400 font-mono bg-slate-950 px-1.5 py-0.2 rounded border border-slate-900/60 mr-1.5">{l.skillType}</span>
                                      <span className="text-[9.5px] font-mono text-indigo-400">₹{l.dailyWage}/Day</span>
                                    </div>
                                    <button 
                                      onClick={() => handleToggleLabourStatus(l.id)}
                                      className={`text-[9px] px-2 py-0.5 rounded font-semibold cursor-pointer ${
                                        l.isActive ? "bg-yellow-950/80 text-yellow-400" : "bg-slate-950 text-slate-500"
                                      }`}
                                    >
                                      {l.isActive ? "Active" : "Inactive"}
                                    </button>
                                  </div>

                                  {/* Quick Daily Attendance markers for Today inside each card */}
                                  {l.isActive && (
                                    <div className="pt-2 border-t border-slate-850 flex items-center justify-between text-[10px] text-slate-400">
                                      <span>Attendance Today:</span>
                                      <div className="flex gap-1">
                                        {(["Present", "Absent", "Half-Day"] as const).map((status) => {
                                          const activeAtt = attendance.find(a => a.labourId === l.id && a.date === "2026-06-14");
                                          const isCurrent = activeAtt?.status === status;
                                          return (
                                            <button
                                              key={status}
                                              onClick={() => handleMarkAttendance(l.id, status)}
                                              className={`px-1.5 py-0.5 rounded text-[8px] font-semibold cursor-pointer ${
                                                isCurrent 
                                                  ? status === "Present" ? "bg-emerald-500 text-slate-950 font-bold" : status === "Absent" ? "bg-rose-600 text-white" : "bg-cyan-500 text-slate-950"
                                                  : "bg-slate-950 text-slate-400"
                                              }`}
                                            >
                                              {status}
                                            </button>
                                          );
                                        })}
                                      </div>
                                    </div>
                                  )}

                                  {/* Delete option */}
                                  <div className="flex justify-end pt-1">
                                    <button 
                                      onClick={() => handleDeleteLabour(l.id)}
                                      className="text-[9px] text-rose-400 hover:underline flex items-center gap-0.5 cursor-pointer"
                                    >
                                      <Trash2 className="w-2.5 h-2.5" /> Remove
                                    </button>
                                  </div>
                                </div>
                              ))}
                            </div>

                            {/* Create new Labour card form */}
                            <form onSubmit={handleAddLabour} className="bg-slate-900/60 p-3 rounded-xl border border-dashed border-slate-800 space-y-2.5">
                              <span className="text-[10px] font-mono text-slate-400 uppercase tracking-widest block font-bold">Add Worker</span>
                              <input
                                type="text"
                                placeholder="Full Name"
                                value={newLabourName}
                                onChange={(e) => setNewLabourName(e.target.value)}
                                className="w-full bg-slate-950 border border-slate-850 p-1.5 text-xs rounded text-slate-300 focus:outline-none"
                              />
                              <input
                                type="text"
                                placeholder="Aadhaar 12-Digit (Check constraints)"
                                value={newLabourAadhaar}
                                onChange={(e) => setNewLabourAadhaar(e.target.value)}
                                className="w-full bg-slate-950 border border-slate-850 p-1.5 text-xs rounded text-slate-300 focus:outline-none"
                              />
                              <div className="grid grid-cols-2 gap-2">
                                <select 
                                  value={newLabourSkill}
                                  onChange={(e) => setNewLabourSkill(e.target.value)}
                                  className="bg-slate-950 border border-slate-850 p-1.5 text-xs rounded text-slate-300 focus:outline-none"
                                >
                                  <option value="Mason">Mason</option>
                                  <option value="Supervisor">Supervisor</option>
                                  <option value="Driver">Driver</option>
                                  <option value="Operator">Operator</option>
                                </select>
                                <input
                                  type="number"
                                  placeholder="Wage ₹"
                                  value={newLabourWage}
                                  onChange={(e) => setNewLabourWage(Number(e.target.value))}
                                  className="bg-slate-950 border border-slate-850 p-1.5 text-xs rounded text-slate-300 focus:outline-none"
                                />
                              </div>
                              <button
                                type="submit"
                                className="w-full bg-indigo-600 hover:bg-slate-700 hover:text-white py-1.5 rounded text-xs font-bold text-slate-100 cursor-pointer"
                              >
                                Create Worker Profile
                              </button>
                            </form>
                          </div>
                        )}

                        {/* PHONE PANEL - VEHICLES FLEET VIEW */}
                        {selectedMobileModule === "legacy-vehicle" && (
                          <div className="space-y-4">
                            <div className="flex justify-between items-center text-xs text-slate-400 font-mono">
                              <span>Logistics Fleet Directory</span>
                              <span>{vehicles.length} Units</span>
                            </div>

                            <div className="space-y-2">
                              {filteredVehicles.map((v) => {
                                // Expiry flags checks
                                const insuranceExpDate = new Date(v.insuranceExpiry);
                                const todayDate = new Date("2026-06-14");
                                const isExpiringSoon = (insuranceExpDate.getTime() - todayDate.getTime()) / (1000 * 3600 * 24) <= 10;

                                return (
                                  <div key={v.id} className="bg-slate-900 p-3 rounded-xl border border-slate-850">
                                    <div className="flex items-start justify-between">
                                      <div>
                                        <h4 className="text-xs font-bold text-slate-200">{v.id}</h4>
                                        <p className="text-[10px] text-slate-400 font-mono">{v.brand} {v.model}</p>
                                      </div>
                                      
                                      {/* Alert status dots */}
                                      {isExpiringSoon && (
                                        <div className="flex items-center gap-1 bg-amber-950 text-amber-400 border border-amber-900/60 px-1.5 py-0.2 rounded font-mono text-[8px] font-bold">
                                          <AlertTriangle className="w-2.5 h-2.5" /> Expiring Soon
                                        </div>
                                      )}
                                    </div>

                                    <div className="grid grid-cols-2 gap-2 mt-2 pt-2 border-t border-slate-850/60 text-[9.5px] text-slate-400">
                                      <div>Driver: <strong>{v.driverName}</strong></div>
                                      <div>Type: <strong>{v.vehicleType}</strong></div>
                                      <div>Insurance Expiry: <strong className={isExpiringSoon ? "text-amber-400 font-bold" : "text-slate-400"}>{v.insuranceExpiry}</strong></div>
                                      <div>RC Expiry: <strong>{v.rcExpiry}</strong></div>
                                    </div>

                                    {/* Action links */}
                                    <div className="flex justify-end gap-3 pt-2 mt-2 border-t border-slate-855/35">
                                      <button 
                                        onClick={() => handleDeleteVehicle(v.id)}
                                        className="text-[9px] text-rose-400 hover:underline flex items-center gap-0.5 cursor-pointer"
                                      >
                                        <Trash2 className="w-2.5 h-2.5" /> Decommission
                                      </button>
                                    </div>
                                  </div>
                                );
                              })}
                            </div>

                            {/* Log Fuel Card */}
                            <div className="bg-slate-900 p-3 rounded-xl border border-slate-850 space-y-2">
                              <span className="text-[10px] font-mono text-slate-400 uppercase tracking-widest block font-bold">Log Fuel Transaction</span>
                              <div className="grid grid-cols-2 gap-2">
                                <select 
                                  value={newFuelVehicle}
                                  onChange={(e) => setNewFuelVehicle(e.target.value)}
                                  className="bg-slate-950 border border-slate-850 p-1.5 text-xs rounded text-slate-300 focus:outline-none"
                                >
                                  <option value="">Select Fleet</option>
                                  {vehicles.map(v => <option key={v.id} value={v.id}>{v.id}</option>)}
                                </select>
                                <input
                                  type="number"
                                  placeholder="Liters"
                                  value={newFuelLiters}
                                  onChange={(e) => setNewFuelLiters(Number(e.target.value))}
                                  className="bg-slate-950 border border-slate-850 p-1.5 text-xs rounded text-slate-300 focus:outline-none"
                                />
                              </div>
                              <input
                                type="number"
                                placeholder="Total Cost ₹"
                                value={newFuelCost}
                                onChange={(e) => setNewFuelCost(Number(e.target.value))}
                                className="w-full bg-slate-950 border border-slate-850 p-1.5 text-xs rounded text-slate-300 focus:outline-none"
                              />
                              <button
                                onClick={handleAddFuel}
                                className="w-full bg-indigo-600 hover:bg-zinc-700 py-1 rounded text-xs font-bold text-slate-100 cursor-pointer"
                              >
                                Log Transaction (Sync with DB)
                              </button>
                            </div>

                            {/* Create Vehicle Form */}
                            <form onSubmit={handleAddVehicle} className="bg-slate-900/60 p-3 rounded-xl border border-dashed border-slate-800 space-y-2.5">
                              <span className="text-[10px] font-mono text-slate-400 uppercase tracking-widest block font-bold">Add Fleet Vehicle</span>
                              <input
                                type="text"
                                placeholder="Vehicle Number (e.g. KA-51-MJ-1234)"
                                value={newVehicleNo}
                                onChange={(e) => setNewVehicleNo(e.target.value)}
                                className="w-full bg-slate-950 border border-slate-850 p-1.5 text-xs rounded text-slate-300 focus:outline-none"
                              />
                              <div className="grid grid-cols-2 gap-2">
                                <input
                                  type="text"
                                  placeholder="Brand Model"
                                  value={newVehicleBrand}
                                  onChange={(e) => setNewVehicleBrand(e.target.value)}
                                  className="bg-slate-950 border border-slate-850 p-1.5 text-xs rounded text-slate-300 focus:outline-none"
                                />
                                <input
                                  type="text"
                                  placeholder="Driver Name"
                                  value={newVehicleDriver}
                                  onChange={(e) => setNewVehicleDriver(e.target.value)}
                                  className="bg-slate-950 border border-slate-850 p-1.5 text-xs rounded text-slate-300 focus:outline-none"
                                />
                              </div>
                              <select 
                                value={newVehicleType}
                                onChange={(e) => setNewVehicleType(e.target.value as any)}
                                className="w-full bg-slate-950 border border-slate-850 p-1.5 text-xs rounded text-slate-300 focus:outline-none"
                              >
                                <option value="Truck">Truck</option>
                                <option value="Tractor">Tractor</option>
                                <option value="Car">Car</option>
                                <option value="Van">Van</option>
                                <option value="Two-Wheeler">Two-Wheeler</option>
                              </select>
                              <button
                                type="submit"
                                className="w-full bg-emerald-600 hover:bg-slate-700 py-1.5 rounded text-xs font-bold text-slate-100 cursor-pointer text-slate-950 font-bold"
                              >
                                Register Vehicle
                              </button>
                            </form>
                          </div>
                        )}

                        {/* PHONE PANEL - FINANCE LEDGERS (GIVE / GET) */}
                        {selectedMobileModule === "legacy-finance" && (
                          <div className="space-y-4">
                            <span className="text-[10px] uppercase font-mono tracking-wider text-slate-400 block font-bold">Outstanding Given (Debt Collections)</span>
                            
                            <div className="space-y-2">
                              {filteredLoans.map((l) => (
                                <div key={l.id} className={`p-3 rounded-xl border ${l.isDefaulter ? "bg-red-950/20 border-red-900/60" : "bg-slate-900 border-slate-850"}`}>
                                  <div className="flex items-start justify-between">
                                    <div>
                                      <h4 className="text-xs font-bold text-slate-200">{l.borrowerName || l.personName || "Lent Loan"}</h4>
                                      <p className="text-[10px] text-indigo-400 font-mono">₹{(l.loanAmount ?? l.amountGiven ?? 0).toLocaleString()} Lent at {l.interestRate ?? l.interestPercentage ?? 0}%</p>
                                    </div>
                                    
                                    {l.isDefaulter && (
                                      <span className="text-[9px] bg-red-950 text-red-400 border border-red-900/60 px-1.5 py-0.2 rounded font-bold uppercase font-mono">
                                        Defaulter
                                      </span>
                                    )}
                                  </div>

                                  <div className="text-[10px] text-slate-400 mt-2 flex justify-between">
                                    <span>Collected: <strong className="text-emerald-400">₹{(l.totalPaid ?? l.totalRepaid ?? 0).toLocaleString()}</strong></span>
                                    <span>Remaining: <strong className="text-slate-300">₹{((l.loanAmount ?? l.amountGiven ?? 0) - (l.totalPaid ?? l.totalRepaid ?? 0)).toLocaleString()}</strong></span>
                                  </div>
                                </div>
                              ))}
                            </div>

                            {/* Lender Borrowed Card */}
                            <span className="text-[10px] uppercase font-mono tracking-wider text-indigo-400 block pt-1 font-bold">Borrowed Ledger (Lenders)</span>
                            <div className="bg-slate-900 p-2.5 rounded-xl border border-slate-850/60 text-xs text-slate-300 space-y-1">
                              {loansReceived.map(lr => (
                                <div key={lr.id} className="flex justify-between items-center text-[11px]">
                                  <span>{lr.personName || lr.lenderName || "Received Loan"}</span>
                                  <span className="font-semibold text-rose-400">₹{((lr.amount ?? lr.borrowedAmount ?? 0) - (lr.totalRepaid ?? lr.totalPaid ?? 0)).toLocaleString()} Balance</span>
                                </div>
                              ))}
                            </div>

                            {/* Give Loan form */}
                            <form onSubmit={handleGiveLoan} className="bg-slate-900/60 p-3 rounded-xl border border-dashed border-slate-800 space-y-2.5">
                              <span className="text-[10px] font-mono text-slate-400 uppercase tracking-widest block font-bold font-bold">Lend Out Capital</span>
                              <input
                                type="text"
                                placeholder="Borrower Name"
                                value={newBorrowerName}
                                onChange={(e) => setNewBorrowerName(e.target.value)}
                                className="w-full bg-slate-950 border border-slate-850 p-1.5 text-xs rounded text-slate-300 focus:outline-none"
                              />
                              <input
                                type="text"
                                placeholder="Mobile Number"
                                value={newBorrowerPhone}
                                onChange={(e) => setNewBorrowerPhone(e.target.value)}
                                className="w-full bg-slate-950 border border-slate-850 p-1.5 text-xs rounded text-slate-300 focus:outline-none"
                              />
                              <div className="grid grid-cols-2 gap-2">
                                <input
                                  type="number"
                                  placeholder="Amount ₹"
                                  value={newLoanAmount}
                                  onChange={(e) => setNewLoanAmount(Number(e.target.value))}
                                  className="bg-slate-950 border border-slate-850 p-1.5 text-xs rounded text-slate-300 focus:outline-none"
                                />
                                <input
                                  type="number"
                                  placeholder="Rate %"
                                  value={newLoanRate}
                                  onChange={(e) => setNewLoanRate(Number(e.target.value))}
                                  className="bg-slate-950 border border-slate-850 p-1.5 text-xs rounded text-slate-300 focus:outline-none"
                                />
                              </div>
                              <button
                                type="submit"
                                className="w-full bg-amber-500 hover:bg-slate-705 py-1.5 rounded text-xs font-bold text-slate-950 cursor-pointer font-bold"
                              >
                                Create Loan Record
                              </button>
                            </form>
                          </div>
                        )}

                        {/* PHONE PANEL - FAMILY EXPENSE ENGINE */}
                        {selectedMobileModule === "legacy-expenses" && (
                          <div className="space-y-4">
                            <span className="text-xs font-mono text-slate-400 uppercase font-bold block">Spending Limits & Categories</span>
                            
                            {/* Budget Progress limits list progress lines */}
                            <div className="space-y-2 bg-slate-900 duration-100 p-2.5 rounded-xl border border-slate-850">
                              {categoryBudgets.slice(0, 5).map((b) => {
                                const fillPercentage = Math.round((b.spent / b.limit) * 100);
                                return (
                                  <div key={b.category} className="text-[10px] text-slate-300 space-y-1">
                                    <div className="flex justify-between items-center text-[10.5px]">
                                      <span>{b.category}</span>
                                      <span className="font-mono">{b.spent}/{b.limit} ₹</span>
                                    </div>
                                    <div className="w-full h-1.5 bg-slate-950 rounded-full overflow-hidden">
                                      <div 
                                        className={`h-full ${fillPercentage > 80 ? "bg-rose-500" : "bg-indigo-400"}`}
                                        style={{ width: `${Math.min(100, fillPercentage)}%` }}
                                      />
                                    </div>
                                  </div>
                                );
                              })}
                            </div>

                            {/* Add Expense form */}
                            <form onSubmit={handleAddExpense} className="bg-slate-900/60 p-3 rounded-xl border border-dashed border-slate-850 space-y-3">
                              <span className="text-[10px] font-mono text-slate-400 uppercase tracking-widest block font-bold">Add Family Expense Outflow</span>

                              <div className="grid grid-cols-1 lg:grid-cols-2 gap-2.5">
                                <div className="space-y-1">
                                  <label className="text-[9px] font-bold text-slate-400 uppercase tracking-widest block">
                                    Family Member
                                  </label>
                                  <input
                                    type="text"
                                    value={newExpMemberName}
                                    onChange={(e) => setNewExpMemberName(e.target.value)}
                                    placeholder="Enter name"
                                    className="w-full h-12 bg-slate-950 border border-slate-850 px-3 text-sm rounded-xl text-slate-200 focus:outline-none focus:border-orange-400"
                                  />
                                </div>

                                <div className="space-y-1">
                                  <label className="text-[9px] font-bold text-slate-400 uppercase tracking-widest block">
                                    Amount Value (₹)
                                  </label>
                                  <input
                                    type="number"
                                    placeholder="1200"
                                    value={newExpAmount}
                                    onChange={(e) => setNewExpAmount(Number(e.target.value))}
                                    className="w-full h-12 bg-slate-950 border border-slate-850 px-3 text-sm rounded-xl text-slate-200 focus:outline-none focus:border-orange-400"
                                  />
                                </div>
                              </div>

                              <div className="grid grid-cols-1 lg:grid-cols-2 gap-2.5">
                                <div className="space-y-1">
                                  <label className="text-[9px] font-bold text-slate-400 uppercase tracking-widest block">
                                    Reason Spent Category
                                  </label>
                                  <select
                                    value={newExpReason}
                                    onChange={(e) => setNewExpReason(e.target.value as any)}
                                    className="w-full h-12 bg-slate-950 border border-slate-850 px-3 text-sm rounded-xl text-slate-200 focus:outline-none focus:border-orange-400"
                                  >
                                    <option value="Food">Food</option>
                                    <option value="Medical">Medical</option>
                                    <option value="Education">Education</option>
                                    <option value="Shopping">Shopping</option>
                                    <option value="Transport">Transport</option>
                                    <option value="Travel">Travel</option>
                                    <option value="Entertainment">Entertainment</option>
                                    <option value="Utilities">Utilities</option>
                                    <option value="Other">Other</option>
                                  </select>
                                </div>

                                <div className="space-y-1">
                                  <label className="text-[9px] font-bold text-slate-400 uppercase tracking-widest block">
                                    Date of Pay
                                  </label>
                                  <input
                                    type="date"
                                    value={newExpDate}
                                    onChange={(e) => setNewExpDate(e.target.value)}
                                    className="w-full h-12 bg-slate-950 border border-slate-850 px-3 text-sm rounded-xl text-slate-200 focus:outline-none focus:border-orange-400"
                                  />
                                </div>
                              </div>

                              {newExpReason === "Other" && (
                                <div className="space-y-1">
                                  <label className="text-[9px] font-bold text-slate-400 uppercase tracking-widest block">
                                    Other Reason
                                  </label>
                                  <input
                                    type="text"
                                    value={newExpOtherReason}
                                    onChange={(e) => setNewExpOtherReason(e.target.value)}
                                    placeholder="Enter reason"
                                    className="w-full h-12 bg-slate-950 border border-slate-850 px-3 text-sm rounded-xl text-slate-200 focus:outline-none focus:border-orange-400"
                                  />
                                </div>
                              )}

                              <div className="flex items-center justify-end gap-3 pt-2">
                                <button
                                  type="button"
                                  className="px-4 py-2 rounded-xl border border-orange-200 text-slate-700 bg-transparent hover:bg-orange-50 text-sm font-medium"
                                  onClick={() => {
                                    setNewExpMemberName("");
                                    setNewExpAmount(1500);
                                    setNewExpReason("Food");
                                    setNewExpOtherReason("");
                                    setNewExpDate("2026-06-15");
                                  }}
                                >
                                  Cancel
                                </button>
                                <button
                                  type="submit"
                                  className="px-4 py-2 rounded-xl bg-orange-600 hover:bg-orange-500 text-white text-sm font-semibold shadow-sm active:scale-95 cursor-pointer"
                                >
                                  Save Expense
                                </button>
                              </div>
                            </form>
                          </div>
                        )}

                        {/* PHONE PANEL - DOCUMENTS VAULT */}
                        {selectedMobileModule === "legacy-documents" && (
                          <div className="space-y-4">
                            <div className="bg-slate-900 border border-dashed border-slate-850 p-3 rounded-xl text-center space-y-1.5">
                              <Upload className="w-6 h-6 text-slate-500 mx-auto" />
                              <div className="text-[10px] font-bold text-slate-300">Drag & Drop Documents Here</div>
                              <p className="text-[8.5px] text-slate-500">Aadhaar, RC Book, PAN, Loan Contract. Max 10MB.</p>
                            </div>

                            <form onSubmit={handleUploadDocument} className="bg-slate-900/40 p-2.5 rounded-xl border border-slate-850 space-y-2">
                              <input
                                type="text"
                                placeholder="Document Name (e.g. Abhiram PAN)"
                                value={newDocName}
                                onChange={(e) => setNewDocName(e.target.value)}
                                className="w-full bg-slate-950 border border-slate-850 p-1.5 text-xs rounded text-slate-300 focus:outline-none"
                              />
                              <div className="grid grid-cols-2 gap-2">
                                <select 
                                  value={newDocType}
                                  onChange={(e) => setNewDocType(e.target.value as any)}
                                  className="bg-slate-950 border border-slate-850 p-1.5 text-[10.5px] rounded text-slate-300 focus:outline-none"
                                >
                                  <option value="Aadhaar">Aadhaar</option>
                                  <option value="PAN">PAN</option>
                                  <option value="RC Book">RC Book</option>
                                  <option value="Insurance">Insurance</option>
                                  <option value="Loan Agreement">Loan Contract</option>
                                </select>
                                <input
                                  type="text"
                                  placeholder="Owner Name"
                                  value={newDocOwner}
                                  onChange={(e) => setNewDocOwner(e.target.value)}
                                  className="bg-slate-950 border border-slate-850 p-1.5 text-[10.5px] rounded text-slate-300 focus:outline-none"
                                />
                              </div>
                              <button type="submit" className="w-full bg-slate-800 hover:bg-slate-700 py-1 rounded text-[10px] font-bold text-white cursor-pointer">
                                Upload Document Metas
                              </button>
                            </form>

                            <div className="space-y-1.5">
                              {filteredDocs.map((d) => (
                                <div key={d.id} className="bg-slate-900 p-2 rounded-lg border border-slate-850 flex items-center justify-between text-xs">
                                  <div className="min-w-0 pr-2">
                                    <h4 className="font-semibold text-slate-200 truncate leading-snug">{d.name}</h4>
                                    <p className="text-[8.5px] font-mono text-slate-500">{d.type} • {d.fileSize}</p>
                                  </div>
                                  <button 
                                    onClick={() => alert(`Simulated downloading secure binary document for '${d.name}' over authorized FastAPI pathways.`)}
                                    className="p-1 px-1.5 rounded bg-slate-950 border border-slate-850 text-indigo-400 hover:text-white cursor-pointer"
                                  >
                                    <Download className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* PHONE PANEL - NOTIFICATIONS LIST */}
                        {selectedMobileModule === "legacy-notifications" && (
                          <div className="space-y-3">
                            <span className="text-xs font-mono text-slate-400 uppercase font-bold">FCM Reminders Registry</span>
                            <div className="space-y-2">
                              {notifications.map(n => (
                                <div key={n.id} className="p-3 bg-slate-900 rounded-xl border border-slate-850 text-[10.5px] space-y-1.5">
                                  <div className="font-bold flex items-center gap-1">
                                    <AlertTriangle className="w-3.5 h-3.5 text-indigo-400" />
                                    {n.title}
                                  </div>
                                  <p className="text-slate-400 leading-normal">{n.body}</p>
                                  <span className="text-[9px] text-slate-500 font-mono italic block">{n.date}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* PHONE PANEL - SYSTEM SETTINGS */}
                        {selectedMobileModule === "settings" && (
                          <div className="space-y-3.5 animate-fade-in text-slate-300 pb-12 overflow-y-auto max-h-[580px] pr-1">
                            <div className="flex items-center gap-1.5 pb-2 border-b border-slate-850">
                              <Settings className="w-4 h-4 text-indigo-400" />
                              <span className="text-xs font-bold font-mono uppercase tracking-wider">Device Settings</span>
                            </div>

                            {/* BIOMETRIC TOGGLE SECURITY BLOCK */}
                            <div className="bg-slate-900/60 p-3 rounded-xl border border-slate-850 space-y-2.5">
                              <div className="flex items-center justify-between">
                                <div className="space-y-0.5 max-w-[180px] text-left">
                                  <h4 className="text-[10px] font-bold text-slate-200">Biometric Login Check</h4>
                                  <p className="text-[8px] text-slate-400 leading-normal">
                                    Enforce biometric authentication globally before entering dashboard.
                                  </p>
                                </div>
                                <button
                                  type="button"
                                  onClick={() => toggleBiometricsGlobal(!isBiometricEnabled)}
                                  className={`w-9 h-5 rounded-full p-0.5 transition-colors duration-200 focus:outline-none cursor-pointer ${
                                    isBiometricEnabled ? "bg-indigo-600" : "bg-slate-750"
                                  }`}
                                >
                                  <div className={`w-4 h-4 rounded-full bg-white transition-transform duration-200 ${
                                    isBiometricEnabled ? "translate-x-4" : "translate-x-0"
                                  }`} />
                                </button>
                              </div>
                            </div>

                            {/* Role access control removed; app now runs as Admin only. */}

                            {false && (
                            <div className="bg-slate-900/60 p-3 rounded-xl border border-slate-850 space-y-3">
                              <div className="space-y-0.5">
                                <h4 className="text-[10px] font-bold text-slate-200">Change Password</h4>
                                <p className="text-[8px] text-slate-400 leading-normal">
                                  Verify your old password, then set and confirm a new one.
                                </p>
                              </div>

                              <form onSubmit={handleChangePassword} className="space-y-2.5">
                                <div className="space-y-1.5">
                                  <label className="text-[8px] uppercase tracking-wider font-bold text-slate-500">Old Password</label>
                                  <div className="flex items-center gap-2 bg-slate-950 border border-slate-850 rounded-lg px-2.5 py-2">
                                    <input
                                      type={showOldPassword ? "text" : "password"}
                                      value={oldPassword}
                                      onChange={(e) => setOldPassword(e.target.value)}
                                      placeholder="Enter old password"
                                      className="flex-1 bg-transparent text-[11px] text-slate-200 outline-none"
                                    />
                                    <button type="button" onClick={() => setShowOldPassword((prev) => !prev)} className="text-slate-400 hover:text-white">
                                      {showOldPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                                    </button>
                                  </div>
                                </div>

                                <div className="space-y-1.5">
                                  <label className="text-[8px] uppercase tracking-wider font-bold text-slate-500">New Password</label>
                                  <div className="flex items-center gap-2 bg-slate-950 border border-slate-850 rounded-lg px-2.5 py-2">
                                    <input
                                      type={showNewPassword ? "text" : "password"}
                                      value={newPassword}
                                      onChange={(e) => setNewPassword(e.target.value)}
                                      placeholder="Enter new password"
                                      className="flex-1 bg-transparent text-[11px] text-slate-200 outline-none"
                                    />
                                    <button type="button" onClick={() => setShowNewPassword((prev) => !prev)} className="text-slate-400 hover:text-white">
                                      {showNewPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                                    </button>
                                  </div>
                                </div>

                                <div className="space-y-1.5">
                                  <label className="text-[8px] uppercase tracking-wider font-bold text-slate-500">Confirm New Password</label>
                                  <div className="flex items-center gap-2 bg-slate-950 border border-slate-850 rounded-lg px-2.5 py-2">
                                    <input
                                      type={showConfirmNewPassword ? "text" : "password"}
                                      value={confirmNewPassword}
                                      onChange={(e) => setConfirmNewPassword(e.target.value)}
                                      placeholder="Re-enter new password"
                                      className="flex-1 bg-transparent text-[11px] text-slate-200 outline-none"
                                    />
                                    <button type="button" onClick={() => setShowConfirmNewPassword((prev) => !prev)} className="text-slate-400 hover:text-white">
                                      {showConfirmNewPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                                    </button>
                                  </div>
                                </div>

                                {passwordMessage && (
                                  <div className={`text-[10px] rounded-lg px-3 py-2 border ${passwordMessage.toLowerCase().includes("success") ? "bg-emerald-950/40 text-emerald-300 border-emerald-900/40" : "bg-rose-950/40 text-rose-300 border-rose-900/40"}`}>
                                    {passwordMessage}
                                  </div>
                                )}

                                <button
                                  type="submit"
                                  disabled={passwordLoading || !oldPassword || !newPassword || !confirmNewPassword}
                                  className="w-full bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed text-white py-2 rounded-lg text-[10px] font-bold cursor-pointer"
                                >
                                  {passwordLoading ? "Saving..." : "Save Password"}
                                </button>
                              </form>
                            </div>
                            )}
                          </div>
                        )}


                      </div>
                    )}

                    {/* PHONE NAVIGATION SYSTEM FOOTER */}
                    <div className="absolute bottom-0 inset-x-0 h-16 bg-slate-900 border-t border-slate-850 flex items-center justify-around z-20 px-2 pb-2">
                      <button 
                        onClick={() => setSelectedMobileModule("dashboard")}
                        className={`flex flex-col items-center gap-1 px-2.5 py-1.5 text-[8.5px] font-semibold cursor-pointer ${
                          selectedMobileModule === "dashboard" ? "text-indigo-400" : "text-slate-400 hover:text-white"
                        }`}
                      >
                        <Home className="w-4 h-4" />
                        <span>Home</span>
                      </button>

                      <button 
                        onClick={() => setSelectedMobileModule("business")}
                        className={`flex flex-col items-center gap-1 px-2.5 py-1.5 text-[8.5px] font-semibold cursor-pointer ${
                          selectedMobileModule === "business" || selectedMobileModule === "labour" || selectedMobileModule === "vehicle" ? "text-indigo-400" : "text-slate-400 hover:text-white"
                        }`}
                      >
                        <Briefcase className="w-4 h-4" />
                        <span>Business</span>
                      </button>

                      <button 
                        onClick={() => setSelectedMobileModule("finance")}
                        className={`flex flex-col items-center gap-1 px-2.5 py-1.5 text-[8.5px] font-semibold cursor-pointer ${
                          selectedMobileModule === "finance" ? "text-indigo-400" : "text-slate-400 hover:text-white"
                        }`}
                      >
                        <DollarSign className="w-4 h-4" />
                        <span>Finance</span>
                      </button>

                      <button 
                        onClick={() => setSelectedMobileModule("expenses")}
                        className={`flex flex-col items-center gap-1 px-2.5 py-1.5 text-[8.5px] font-semibold cursor-pointer ${
                          selectedMobileModule === "expenses" ? "text-indigo-400" : "text-slate-400 hover:text-white"
                        }`}
                      >
                        <LayoutGrid className="w-4 h-4" />
                        <span>Control Console</span>
                      </button>

                      <button 
                        onClick={() => setSelectedMobileModule("legacy-documents")}
                        className={`flex flex-col items-center gap-1 px-2.5 py-1.5 text-[8.5px] font-semibold cursor-pointer ${
                          selectedMobileModule === "legacy-documents" ? "text-indigo-400" : "text-slate-400 hover:text-white"
                        }`}
                      >
                        <FileText className="w-4 h-4" />
                        <span>Vault</span>
                      </button>
                    </div>

                    {/* Virtual Home Bar Notch */}
                    <div className="absolute bottom-1 left-1/2 -translate-x-1/2 w-28 h-1 bg-zinc-700/60 rounded-full z-20" />

                  </div>
                </div>
              </div>

              {/* LIVE INDUSTRIAL DESKTOP SIMULATOR CONTROL CORE PANEL (Right Side) */}
              <div className="xl:col-span-7 flex flex-col gap-6">
                
                {/* Active control panel explaining local synchronization & simulated back-end */}
                <div className="glass-panel rounded-2xl p-6 shadow-xl space-y-4 animate-fade-in">
                  <div className="flex items-center justify-between pb-3 border-b border-white/5">
                    <div className="flex items-center gap-2">
                      <Zap className="w-5 h-5 text-amber-400 animate-float" />
                      <h3 className="text-md font-bold text-white tracking-tight">Live Simulator Control Terminal</h3>
                    </div>
                    <span className="text-[10px] bg-emerald-950/80 text-emerald-400 border border-emerald-900/40 px-2 py-0.5 rounded font-mono font-bold uppercase tracking-wider">
                      MySQL Backend Synced
                    </span>
                  </div>

                  <p className="text-xs text-slate-300 leading-relaxed font-sans">
                    Welcome to the premium interactive interface for **Smart Business & Family Manager**! 
                    We are simulating a **cross-platform Flutter client app** hosted on the left device, linked with an offline-first **Hive DB synchronization cache**. 
                    Feel free to execute high-value real-world actions in any tab.
                  </p>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                    
                    <div className="bg-slate-900/60 p-4 rounded-xl border border-white/5 space-y-2 interactive-hover">
                      <h4 className="text-xs font-semibold text-indigo-400 uppercase tracking-widest font-bold flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-indigo-500" />
                        1. Network State Switcher
                      </h4>
                      <p className="text-[11px] text-slate-400 leading-relaxed">
                        Simulate isolated warehouse hubs with zero network towers. Set the status switch to <strong className="text-amber-400 font-bold">"Local Hive Mode"</strong> at the header. 
                        Add records, mark attendance or expenses on the virtual phone. They will instantly cash into local Hive memory bags. 
                        Re-enable <strong className="text-emerald-400 font-bold">"Cloud Connected"</strong> to trigger standard background uploads to remote tables!
                      </p>
                    </div>

                    <div className="bg-slate-900/60 p-4 rounded-xl border border-white/5 space-y-2 interactive-hover">
                      <h4 className="text-xs font-semibold text-indigo-400 uppercase tracking-widest font-bold flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-indigo-500" />
                        2. Security & RBAC Guards
                      </h4>
                      <p className="text-[11px] text-slate-400 leading-relaxed">
                        The app now runs in a single Admin mode, so every module is available without role switching or permission guards.
                      </p>
                    </div>

                  </div>

                  {/* CENTRAL SECURITY AND BIOMETRIC REQUIREMENT CONFIGURATION */}
                  <div className="bg-slate-900/40 p-4 rounded-xl border border-white/5 space-y-3">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div className="space-y-1">
                        <h4 className="text-xs font-semibold text-indigo-400 uppercase tracking-widest font-bold flex items-center gap-1.5 font-mono">
                          <Lock className="w-4 h-4 text-indigo-500 animate-pulse" />
                          3. Global Biometric Lock Override
                        </h4>
                        <p className="text-[11px] text-slate-400 leading-relaxed max-w-[580px]">
                          Toggle the required biometric lockscreen challenge globally. When disabled, the simulated phone will automatically bypass touch/face verification overlays and enable standard numeric keypad passcode input for testing.
                        </p>
                      </div>
                      <div className="flex items-center gap-3 self-end sm:self-center bg-slate-950 px-3 py-2 rounded-lg border border-white/5">
                        <span className={`text-[10px] font-mono font-bold ${isBiometricEnabled ? "text-indigo-400" : "text-amber-500"}`}>
                          {isBiometricEnabled ? "ENFORCED" : "BYPASSED"}
                        </span>
                        <button
                          type="button"
                          onClick={() => toggleBiometricsGlobal(!isBiometricEnabled)}
                          className={`w-10 h-5.5 rounded-full p-0.5 transition-colors duration-200 focus:outline-none cursor-pointer relative ${
                            isBiometricEnabled ? "bg-indigo-600" : "bg-slate-705"
                          }`}
                        >
                          <div className={`w-4.5 h-4.5 rounded-full bg-white transition-transform duration-200 ${
                            isBiometricEnabled ? "translate-x-4.5" : "translate-x-0"
                          }`} />
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Purge / Reseed button widgets */}
                </div>

                {/* Simulated Logs Terminal (Prints instant feedback for clicks) */}
                <div className="bg-slate-950 rounded-2xl border border-slate-800 p-4 font-mono text-[10.5px]">
                  <div className="pb-2 border-b border-slate-900 mb-2.5 text-slate-500 uppercase font-bold pb-2 flex justify-between">
                    <span>LIVE UVICORN FASTAPI EVENT FEED</span>
                    <span className="text-slate-600">Port 3000 TCP</span>
                  </div>
                  
                  <div className="h-32 overflow-y-auto space-y-1 text-slate-400">
                    <div className="text-indigo-400">⚡ Uvicorn running on http://127.0.0.1:3000 (Press CTRL+C to quit)</div>
                    <div>[API RUNNER 11:05:01] SQLAlchemy relational pool mounted successfully. Connected to MySQL schema "smart_manager_prod"</div>
                    <div>[SYNC DAEMON 11:05:02] Background sync listener active. Watching connection sockets.</div>
                    
                    {/* Append feedback based on quantities */}
                    <div>[INFO] Labour directory count: {labours.length} profiles index.</div>
                    <div>[INFO] Vehicle active count: {vehicles.length} fleet units loaded.</div>
                    <div>[INFO] Current pending cashgiven: ₹{totalOutstandingLoanAmount.toLocaleString()}.</div>
                    <div>[INFO] Spend registry: ₹{totalMonthlyExpense.toLocaleString()} allocated.</div>
                    
                    {offlineSyncQueue > 0 && (
                      <div className="text-amber-500 font-bold animate-pulse">
                        [SYNC EXCEPTION] detected offline connection. Flushed {offlineSyncQueue} transactions to secondary SQLite sync heap.
                      </div>
                    )}
                  </div>
                </div>

              </div>
            </div>
          )}

            </div>
      </section>

      </main>



      {/* 5. MOBILE BOTTOM NAVIGATION BAR (only visible on < lg screens) */}
      {isMobileLoggedIn && (
      <nav
        className="mobile-bottom-nav lg:hidden bg-slate-900 border-t border-slate-800 shadow-[0_-4px_20px_rgba(0,0,0,0.3)] fixed bottom-0 left-0 right-0 z-50"
        aria-label="Mobile navigation"
      >
        <div className="flex items-stretch">
          {[
            { id: "dashboard", label: "Home", icon: Home },
            { id: "business", label: "Business", icon: Briefcase },
            { id: "finance", label: "Finance", icon: DollarSign },
            { id: "expenses", label: "Family", icon: Users },
            { id: "settings", label: "Settings", icon: Settings },
          ].map((item) => {
            const isActive =
              selectedMobileModule === item.id ||
              (item.id === "business" &&
                (selectedMobileModule === "labour" ||
                  selectedMobileModule === "vehicle" ||
                  selectedMobileModule === "legacy-labour" ||
                  selectedMobileModule === "legacy-vehicle"));
            return (
              <button
                key={item.id}
                onClick={() => {
                  setSelectedMobileModule(item.id as any);
                  setIsMobileNavOpen(false);
                }}
                className={`flex-1 flex flex-col items-center justify-center gap-0.5 py-2.5 px-1 transition-colors duration-150 cursor-pointer border-0 outline-none ${
                  isActive
                    ? "text-orange-500 bg-orange-950/20"
                    : "text-slate-500 hover:text-slate-300 hover:bg-slate-800/50"
                }`}
                aria-label={item.label}
                aria-current={isActive ? "page" : undefined}
              >
                <item.icon
                  className={`w-5 h-5 transition-transform duration-150 ${isActive ? "scale-110" : ""}`}
                />
                <span
                  className={`text-[9px] font-bold tracking-wide leading-none ${
                    isActive ? "text-orange-500" : ""
                  }`}
                >
                  {item.label}
                </span>
                {isActive && (
                  <span className="absolute bottom-0 w-8 h-0.5 rounded-full bg-orange-500" />
                )}
              </button>
            );
          })}
        </div>
      </nav>
      )}

    </div>
  );
}
