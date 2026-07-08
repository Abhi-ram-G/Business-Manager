/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from "react";
import { 
  Briefcase, 
  Users, 
  Car, 
  Fuel, 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  PieChart as PieIcon, 
  Activity, 
  Calendar, 
  Home, 
  ArrowUpRight, 
  ArrowDownLeft,
  ChevronRight,
  AlertCircle,
  Wrench,
  Hammer,
  FileText,
  Package,
  Layers,
  Search,
  Filter,
  RefreshCw,
  Wallet
} from "lucide-react";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  ResponsiveContainer, 
  CartesianGrid, 
  Legend,
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell
} from "recharts";
import { Labour, Vehicle, FuelEntry, SalaryPayment, LoanGiven, LoanReceived, FamilyExpense, AttendanceRecord, BitEntry, HammerEntry, BusinessBill, PipeEntry } from "../types";

interface MobileDashboardProps {
  labours: Labour[];
  vehicles: Vehicle[];
  fuelEntries: FuelEntry[];
  salaryPayments: SalaryPayment[];
  loansGiven: LoanGiven[];
  loansReceived: LoanReceived[];
  familyExpenses: FamilyExpense[];
  attendance?: AttendanceRecord[];
  activeLabourCount?: number;
  totalOutstandingLoanAmount?: number;
  totalMonthlyExpense?: number;
  familySavingsRate?: number;
  language?: "en" | "ta";
  t?: (key: any) => string;
  bitEntries?: BitEntry[];
  hammerEntries?: HammerEntry[];
  businessBills?: BusinessBill[];
  pipeEntries?: PipeEntry[];
}

export default function MobileDashboard({
  labours,
  vehicles,
  fuelEntries,
  salaryPayments,
  loansGiven,
  loansReceived,
  familyExpenses,
  attendance = [],
  activeLabourCount = 0,
  totalOutstandingLoanAmount = 0,
  totalMonthlyExpense = 0,
  familySavingsRate = 0,
  language = "en",
  t,
  bitEntries = [],
  hammerEntries = [],
  businessBills = [],
  pipeEntries = []
}: MobileDashboardProps) {
  
  // Date Filtering States
  const [timeGrain, setTimeGrain] = useState<"overall" | "year" | "month" | "day">("overall");
  
  // Extract all unique years present in any data records
  const parseDate = (dStr?: string) => {
    if (!dStr) return null;
    const dateOnly = dStr.includes("T") ? dStr.split("T")[0] : dStr;
    const parts = dateOnly.split("-");
    if (parts.length >= 3) {
      return {
        year: parseInt(parts[0], 10),
        month: parseInt(parts[1], 10),
        day: parseInt(parts[2], 10)
      };
    }
    return null;
  };

  const detectedYears = useMemo(() => {
    const years = new Set<number>();
    businessBills.forEach(b => { const y = parseDate(b.billDate)?.year; if (y) years.add(y); });
    fuelEntries.forEach(f => { const y = parseDate(f.date || f.dateTime)?.year; if (y) years.add(y); });
    familyExpenses.forEach(e => { const y = parseDate(e.date)?.year; if (y) years.add(y); });
    salaryPayments.forEach(p => { const y = parseDate(p.date)?.year; if (y) years.add(y); });
    loansGiven.forEach(l => { const y = parseDate(l.startDate)?.year; if (y) years.add(y); });
    loansReceived.forEach(l => { const y = parseDate(l.startDate)?.year; if (y) years.add(y); });
    bitEntries.forEach(b => { const y = parseDate(b.dateEntry)?.year; if (y) years.add(y); });
    hammerEntries.forEach(h => { const y = parseDate(h.dateEntry)?.year; if (y) years.add(y); });
    pipeEntries.forEach(p => { const y = parseDate(p.dateEntry)?.year; if (y) years.add(y); });
    
    const arr = Array.from(years);
    return arr.length > 0 ? arr.sort((a, b) => b - a) : [2026, 2025, 2024];
  }, [businessBills, fuelEntries, familyExpenses, salaryPayments, loansGiven, loansReceived, bitEntries, hammerEntries, pipeEntries]);

  // Selected date points
  const [selectedYear, setSelectedYear] = useState<number>(detectedYears[0] || 2026);
  const [selectedMonth, setSelectedMonth] = useState<number>(6); // Default to June
  const [selectedDay, setSelectedDay] = useState<number>(15); // Default to 15th
  
  // Date Picker String Sync helper for Day-wise selector
  const selectedDateStr = useMemo(() => {
    const mm = String(selectedMonth).padStart(2, "0");
    const dd = String(selectedDay).padStart(2, "0");
    return `${selectedYear}-${mm}-${dd}`;
  }, [selectedYear, selectedMonth, selectedDay]);

  const handleDateChange = (val: string) => {
    if (!val) return;
    const parts = val.split("-");
    if (parts.length === 3) {
      setSelectedYear(parseInt(parts[0], 10));
      setSelectedMonth(parseInt(parts[1], 10));
      setSelectedDay(parseInt(parts[2], 10));
    }
  };

  // Tab selections
  const [activeExplorerTab, setActiveExplorerTab] = useState<"bills" | "payroll" | "fuel" | "family" | "loans">("bills");

  // Local fallbacks translations helper
  const localT = (key: string) => {
    if (t) return t(key);
    const fallbackDict: Record<string, Record<string, string>> = {
      en: {
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
        pending_bills_amount: "Pending Bills Amount"
      },
      ta: {
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
        pending_bills_amount: "நிலுவையில் உள்ள பில் தொகை"
      }
    };
    return fallbackDict[language]?.[key] || key;
  };

  // Master Filter Function
  const filterByPeriod = (dateStr?: string) => {
    if (!dateStr) return false;
    const p = parseDate(dateStr);
    if (!p) return false;

    if (timeGrain === "overall") return true;
    if (timeGrain === "year") return p.year === selectedYear;
    if (timeGrain === "month") return p.year === selectedYear && p.month === selectedMonth;
    if (timeGrain === "day") return p.year === selectedYear && p.month === selectedMonth && p.day === selectedDay;
    return false;
  };

  // Running Stock Check up to End of Selected Period
  const isBeforeOrEqualPeriod = (dateStr?: string) => {
    if (!dateStr) return false;
    const p = parseDate(dateStr);
    if (!p) return false;

    if (timeGrain === "overall") return true;
    if (timeGrain === "year") return p.year <= selectedYear;
    if (timeGrain === "month") {
      if (p.year < selectedYear) return true;
      if (p.year === selectedYear) return p.month <= selectedMonth;
      return false;
    }
    if (timeGrain === "day") {
      if (p.year < selectedYear) return true;
      if (p.year === selectedYear) {
        if (p.month < selectedMonth) return true;
        if (p.month === selectedMonth) return p.day <= selectedDay;
      }
      return false;
    }
    return false;
  };

  // Filtered Datasets
  const filteredBills = useMemo(() => businessBills.filter(b => filterByPeriod(b.billDate)), [businessBills, timeGrain, selectedYear, selectedMonth, selectedDay]);
  const filteredFuel = useMemo(() => fuelEntries.filter(f => filterByPeriod(f.date || f.dateTime)), [fuelEntries, timeGrain, selectedYear, selectedMonth, selectedDay]);
  const filteredSalary = useMemo(() => salaryPayments.filter(s => filterByPeriod(s.date)), [salaryPayments, timeGrain, selectedYear, selectedMonth, selectedDay]);
  const filteredLoansGiven = useMemo(() => loansGiven.filter(l => filterByPeriod(l.startDate)), [loansGiven, timeGrain, selectedYear, selectedMonth, selectedDay]);
  const filteredLoansReceived = useMemo(() => loansReceived.filter(l => filterByPeriod(l.startDate)), [loansReceived, timeGrain, selectedYear, selectedMonth, selectedDay]);
  const filteredFamily = useMemo(() => familyExpenses.filter(e => filterByPeriod(e.date)), [familyExpenses, timeGrain, selectedYear, selectedMonth, selectedDay]);
  const filteredBits = useMemo(() => bitEntries.filter(b => filterByPeriod(b.dateEntry)), [bitEntries, timeGrain, selectedYear, selectedMonth, selectedDay]);
  const filteredHammers = useMemo(() => hammerEntries.filter(h => filterByPeriod(h.dateEntry)), [hammerEntries, timeGrain, selectedYear, selectedMonth, selectedDay]);
  const filteredPipes = useMemo(() => pipeEntries.filter(p => filterByPeriod(p.dateEntry)), [pipeEntries, timeGrain, selectedYear, selectedMonth, selectedDay]);

  // Aggregated Financial Metrics
  const revenueTotal = useMemo(() => filteredBills.reduce((sum, b) => sum + (b.amount || 0), 0), [filteredBills]);
  const revenueReceived = useMemo(() => filteredBills.filter(b => b.status === "Paid").reduce((sum, b) => sum + (b.amount || 0), 0), [filteredBills]);
  const revenuePending = useMemo(() => filteredBills.filter(b => b.status === "Pending").reduce((sum, b) => sum + (b.amount || 0), 0), [filteredBills]);

  const expSalaryPaid = useMemo(() => filteredSalary.filter(s => s.status === "Paid").reduce((sum, s) => sum + (Number(s.netPaid) || 0), 0), [filteredSalary]);
  const expSalaryPending = useMemo(() => filteredSalary.filter(s => s.status === "Pending").reduce((sum, s) => sum + (Number(s.netPaid) || 0), 0), [filteredSalary]);

  const expFuel = useMemo(() => filteredFuel.reduce((sum, f) => sum + (Number(f.totalAmount !== undefined ? f.totalAmount : f.cost) || 0), 0), [filteredFuel]);
  const expFamily = useMemo(() => filteredFamily.reduce((sum, e) => sum + e.amount, 0), [filteredFamily]);
  
  const expTools = useMemo(() => {
    const bits = filteredBits.reduce((sum, b) => sum + (b.rate || 0), 0);
    const hammers = filteredHammers.reduce((sum, h) => sum + (h.rate || 0), 0);
    return bits + hammers;
  }, [filteredBits, filteredHammers]);
  
  const expPipes = useMemo(() => filteredPipes.reduce((sum, p) => sum + (p.grandPrice || p.grandTotal || 0), 0), [filteredPipes]);

  const outLent = useMemo(() => filteredLoansGiven.reduce((sum, l) => sum + (l.amountGiven ?? l.loanAmount ?? 0), 0), [filteredLoansGiven]);
  const incBorrowed = useMemo(() => filteredLoansReceived.reduce((sum, l) => sum + (l.amount ?? l.borrowedAmount ?? 0), 0), [filteredLoansReceived]);

  // Consolidated Inflow & Outflow
  const totalInflow = revenueReceived + incBorrowed;
  const totalOutflow = expSalaryPaid + expFuel + expFamily + expTools + expPipes + outLent;
  const netCashFlow = totalInflow - totalOutflow;

  // Running Stock calculations (based on isBeforeOrEqualPeriod)
  const casingStockData = useMemo(() => {
    const reg7High = pipeEntries.filter(p => isBeforeOrEqualPeriod(p.dateEntry)).reduce((s, p) => s + Number(p.pipe7HighCount || 0), 0);
    const reg7Medium = pipeEntries.filter(p => isBeforeOrEqualPeriod(p.dateEntry)).reduce((s, p) => s + Number(p.pipe7MediumCount || 0), 0);
    const reg10High = pipeEntries.filter(p => isBeforeOrEqualPeriod(p.dateEntry)).reduce((s, p) => s + Number(p.pipe10HighCount || 0), 0);
    const reg10Medium = pipeEntries.filter(p => isBeforeOrEqualPeriod(p.dateEntry)).reduce((s, p) => s + Number(p.pipe10MediumCount || 0), 0);

    const used7High = businessBills.filter(b => isBeforeOrEqualPeriod(b.billDate)).reduce((s, b) => s + Number(b.casing7HighFeet || 0), 0) / 20;
    const used7Medium = businessBills.filter(b => isBeforeOrEqualPeriod(b.billDate)).reduce((s, b) => s + Number(b.casing7MediumFeet || 0), 0) / 20;
    const used10High = businessBills.filter(b => isBeforeOrEqualPeriod(b.billDate)).reduce((s, b) => s + Number(b.casing10HighFeet || 0), 0) / 20;
    const used10Medium = businessBills.filter(b => isBeforeOrEqualPeriod(b.billDate)).reduce((s, b) => s + Number(b.casing10MediumFeet || 0), 0) / 20;

    const avail7High = Math.max(0, reg7High - used7High);
    const avail7Medium = Math.max(0, reg7Medium - used7Medium);
    const avail10High = Math.max(0, reg10High - used10High);
    const avail10Medium = Math.max(0, reg10Medium - used10Medium);
    
    return {
      avail7High: Math.round(avail7High),
      avail7Medium: Math.round(avail7Medium),
      avail10High: Math.round(avail10High),
      avail10Medium: Math.round(avail10Medium),
      totalAvail: Math.round(avail7High + avail7Medium + avail10High + avail10Medium)
    };
  }, [pipeEntries, businessBills, timeGrain, selectedYear, selectedMonth, selectedDay]);

  // Chart 1: Time Series Cash Flow (AreaChart)
  const timeSeriesTrendData = useMemo(() => {
    if (timeGrain === "overall") {
      // Group by year
      const years = [...detectedYears].reverse();
      if (years.length === 0) years.push(2026);
      return years.map(yr => {
        const bills = businessBills.filter(b => parseDate(b.billDate)?.year === yr);
        const loansRec = loansReceived.filter(l => parseDate(l.startDate)?.year === yr);
        const sal = salaryPayments.filter(s => parseDate(s.date)?.year === yr);
        const fuel = fuelEntries.filter(f => parseDate(f.date || f.dateTime)?.year === yr);
        const fam = familyExpenses.filter(e => parseDate(e.date)?.year === yr);
        const lGiven = loansGiven.filter(l => parseDate(l.startDate)?.year === yr);
        const bits = bitEntries.filter(b => parseDate(b.dateEntry)?.year === yr);
        const hams = hammerEntries.filter(h => parseDate(h.dateEntry)?.year === yr);
        const pipes = pipeEntries.filter(p => parseDate(p.dateEntry)?.year === yr);

        const inc = bills.filter(b => b.status === "Paid").reduce((sum, b) => sum + (b.amount || 0), 0) +
                    loansRec.reduce((sum, l) => sum + (l.amount ?? l.borrowedAmount ?? 0), 0);

        const exp = sal.filter(s => s.status === "Paid").reduce((sum, s) => sum + (Number(s.netPaid) || 0), 0) +
                    fuel.reduce((sum, f) => sum + (Number(f.totalAmount !== undefined ? f.totalAmount : f.cost) || 0), 0) +
                    fam.reduce((sum, e) => sum + e.amount, 0) +
                    lGiven.reduce((sum, l) => sum + (l.amountGiven ?? l.loanAmount ?? 0), 0) +
                    bits.reduce((sum, b) => sum + (b.rate || 0), 0) +
                    hams.reduce((sum, h) => sum + (h.rate || 0), 0) +
                    pipes.reduce((sum, p) => sum + (p.grandPrice || p.grandTotal || 0), 0);

        return { name: String(yr), Inflow: inc, Outflow: exp, Net: inc - exp };
      });
    }

    if (timeGrain === "year") {
      // Group by months (Jan - Dec)
      const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
      return months.map((mName, index) => {
        const mNum = index + 1;
        const bills = businessBills.filter(b => { const p = parseDate(b.billDate); return p?.year === selectedYear && p?.month === mNum; });
        const loansRec = loansReceived.filter(l => { const p = parseDate(l.startDate); return p?.year === selectedYear && p?.month === mNum; });
        const sal = salaryPayments.filter(s => { const p = parseDate(s.date); return p?.year === selectedYear && p?.month === mNum; });
        const fuel = fuelEntries.filter(f => { const p = parseDate(f.date || f.dateTime); return p?.year === selectedYear && p?.month === mNum; });
        const fam = familyExpenses.filter(e => { const p = parseDate(e.date); return p?.year === selectedYear && p?.month === mNum; });
        const lGiven = loansGiven.filter(l => { const p = parseDate(l.startDate); return p?.year === selectedYear && p?.month === mNum; });
        const bits = bitEntries.filter(b => { const p = parseDate(b.dateEntry); return p?.year === selectedYear && p?.month === mNum; });
        const hams = hammerEntries.filter(h => { const p = parseDate(h.dateEntry); return p?.year === selectedYear && p?.month === mNum; });
        const pipes = pipeEntries.filter(p => { const pt = parseDate(p.dateEntry); return pt?.year === selectedYear && pt?.month === mNum; });

        const inc = bills.filter(b => b.status === "Paid").reduce((sum, b) => sum + (b.amount || 0), 0) +
                    loansRec.reduce((sum, l) => sum + (l.amount ?? l.borrowedAmount ?? 0), 0);

        const exp = sal.filter(s => s.status === "Paid").reduce((sum, s) => sum + (Number(s.netPaid) || 0), 0) +
                    fuel.reduce((sum, f) => sum + (Number(f.totalAmount !== undefined ? f.totalAmount : f.cost) || 0), 0) +
                    fam.reduce((sum, e) => sum + e.amount, 0) +
                    lGiven.reduce((sum, l) => sum + (l.amountGiven ?? l.loanAmount ?? 0), 0) +
                    bits.reduce((sum, b) => sum + (b.rate || 0), 0) +
                    hams.reduce((sum, h) => sum + (h.rate || 0), 0) +
                    pipes.reduce((sum, p) => sum + (p.grandPrice || p.grandTotal || 0), 0);

        return { name: mName, Inflow: inc, Outflow: exp, Net: inc - exp };
      });
    }

    if (timeGrain === "month") {
      // Group by days in selected month (at 5-day intervals to fit compact mobile view cleanly)
      const daysInMonth = new Date(selectedYear, selectedMonth, 0).getDate();
      const nodes = [];
      for (let i = 1; i <= daysInMonth; i++) {
        const label = i % 5 === 0 || i === 1 || i === daysInMonth ? `${selectedMonth}/${i}` : "";
        const bills = businessBills.filter(b => { const p = parseDate(b.billDate); return p?.year === selectedYear && p?.month === selectedMonth && p?.day === i; });
        const loansRec = loansReceived.filter(l => { const p = parseDate(l.startDate); return p?.year === selectedYear && p?.month === selectedMonth && p?.day === i; });
        const sal = salaryPayments.filter(s => { const p = parseDate(s.date); return p?.year === selectedYear && p?.month === selectedMonth && p?.day === i; });
        const fuel = fuelEntries.filter(f => { const p = parseDate(f.date || f.dateTime); return p?.year === selectedYear && p?.month === selectedMonth && p?.day === i; });
        const fam = familyExpenses.filter(e => { const p = parseDate(e.date); return p?.year === selectedYear && p?.month === selectedMonth && p?.day === i; });
        const lGiven = loansGiven.filter(l => { const p = parseDate(l.startDate); return p?.year === selectedYear && p?.month === selectedMonth && p?.day === i; });
        const bits = bitEntries.filter(b => { const p = parseDate(b.dateEntry); return p?.year === selectedYear && p?.month === selectedMonth && p?.day === i; });
        const hams = hammerEntries.filter(h => { const p = parseDate(h.dateEntry); return p?.year === selectedYear && p?.month === selectedMonth && p?.day === i; });
        const pipes = pipeEntries.filter(p => { const pt = parseDate(p.dateEntry); return pt?.year === selectedYear && pt?.month === selectedMonth && pt?.day === i; });

        const inc = bills.filter(b => b.status === "Paid").reduce((sum, b) => sum + (b.amount || 0), 0) +
                    loansRec.reduce((sum, l) => sum + (l.amount ?? l.borrowedAmount ?? 0), 0);

        const exp = sal.filter(s => s.status === "Paid").reduce((sum, s) => sum + (Number(s.netPaid) || 0), 0) +
                    fuel.reduce((sum, f) => sum + (Number(f.totalAmount !== undefined ? f.totalAmount : f.cost) || 0), 0) +
                    fam.reduce((sum, e) => sum + e.amount, 0) +
                    lGiven.reduce((sum, l) => sum + (l.amountGiven ?? l.loanAmount ?? 0), 0) +
                    bits.reduce((sum, b) => sum + (b.rate || 0), 0) +
                    hams.reduce((sum, h) => sum + (h.rate || 0), 0) +
                    pipes.reduce((sum, p) => sum + (p.grandPrice || p.grandTotal || 0), 0);

        nodes.push({ name: label || String(i), Inflow: inc, Outflow: exp, Net: inc - exp });
      }
      return nodes;
    }

    // Day-wise comparison (shows items breakdown of that day directly)
    return [
      { name: "Bills Rec.", Inflow: revenueReceived, Outflow: 0 },
      { name: "Salary Wages", Inflow: 0, Outflow: expSalaryPaid },
      { name: "Fleet Diesel", Inflow: 0, Outflow: expFuel },
      { name: "Family Expenses", Inflow: 0, Outflow: expFamily },
      { name: "Tools / Spares", Inflow: 0, Outflow: expTools + expPipes },
      { name: "Lent Outflow", Inflow: 0, Outflow: outLent },
      { name: "Borrowed In", Inflow: incBorrowed, Outflow: 0 }
    ];
  }, [timeGrain, detectedYears, selectedYear, selectedMonth, selectedDay, businessBills, fuelEntries, familyExpenses, salaryPayments, loansGiven, loansReceived, bitEntries, hammerEntries, pipeEntries, revenueReceived, expSalaryPaid, expFuel, expFamily, expTools, expPipes, outLent, incBorrowed]);

  // Chart 2: Expense Breakdown Mix (BarChart)
  const expenseBreakdownData = useMemo(() => {
    return [
      { name: "Payroll", Amount: expSalaryPaid, color: "#6366f1" },
      { name: "Fuel", Amount: expFuel, color: "#f59e0b" },
      { name: "Family Exp", Amount: expFamily, color: "#ec4899" },
      { name: "Tools & Spares", Amount: expTools, color: "#3b82f6" },
      { name: "Casing Pipes", Amount: expPipes, color: "#10b981" },
      { name: "Loans Lent", Amount: outLent, color: "#8b5cf6" }
    ].filter(item => item.Amount > 0);
  }, [expSalaryPaid, expFuel, expFamily, expTools, expPipes, outLent]);

  // Chart 3: Pie Chart data for budget allocation
  const pieDistributionData = useMemo(() => {
    return [
      { name: "Business Operations", value: expSalaryPaid + expFuel + expTools + expPipes, color: "#0ea5e9" },
      { name: "Lent Portfolios", value: outLent, color: "#a855f7" },
      { name: "Domestic Expense", value: expFamily, color: "#f43f5e" }
    ].filter(p => p.value > 0);
  }, [expSalaryPaid, expFuel, expFamily, expTools, expPipes, outLent]);

  // Months labels dictionary
  const monthsDict = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

  return (
    <div id="mobile-dashboard-scroll" className="space-y-5 pb-6 text-slate-100 bg-[#0b0f19] min-h-screen">
      
      {/* 1. PREMIUM HEADER SYSTEM */}
      <div className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-slate-950/80 to-[#0e1628] p-5 rounded-3xl border border-slate-800 shadow-xl shadow-[#040810]/50">
        <div className="absolute top-0 right-0 w-24 h-24 bg-sky-500/10 rounded-full blur-2xl" />
        <div className="absolute bottom-0 left-0 w-32 h-32 bg-indigo-500/5 rounded-full blur-3xl" />
        
        {/* Core title badge */}
        <div className="flex justify-between items-start">
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-[10px] font-bold font-mono tracking-widest text-sky-400 bg-sky-950/40 px-2 py-0.5 rounded border border-sky-800/30">
              SMART ERP CORE v3.1
            </span>
          </div>
          <Activity className="w-5 h-5 text-indigo-400/80 animate-pulse" />
        </div>

        <h2 className="text-xl font-extrabold mt-3 tracking-tight bg-gradient-to-r from-slate-100 to-slate-300 bg-clip-text text-transparent">
          Financial Control Desk
        </h2>
        <p className="text-[10.5px] text-slate-400 mt-1 font-mono">
          Consolidated operations, ledger tracking & pipeline analytics
        </p>

        {/* Date Filter & Control System */}
        <div className="mt-5 space-y-3.5 border-t border-slate-800/60 pt-4">
          
          {/* Main Time Grain Pill Selection */}
          <div className="grid grid-cols-4 gap-1 p-1 bg-slate-950/80 rounded-xl border border-slate-800/60">
            {(["overall", "year", "month", "day"] as const).map(grain => (
              <button
                key={grain}
                type="button"
                onClick={() => setTimeGrain(grain)}
                className={`py-2 text-[10px] font-bold font-mono uppercase tracking-wider rounded-lg transition-all duration-300 ${
                  timeGrain === grain
                    ? "bg-gradient-to-r from-sky-500 to-indigo-600 text-white shadow-md shadow-sky-950/50"
                    : "text-slate-400 hover:text-slate-200"
                }`}
              >
                {grain.replace("-wise", "")}
              </button>
            ))}
          </div>

          {/* Conditional Sub-selectors depending on the grain */}
          {timeGrain !== "overall" && (
            <div className="flex flex-wrap items-center gap-2.5 animate-fadeIn">
              
              {/* Year Selector */}
              <div className="flex-1 min-w-[80px]">
                <label className="block text-[8.5px] font-mono text-slate-500 uppercase mb-1">Select Year</label>
                <div className="relative">
                  <select
                    value={selectedYear}
                    onChange={(e) => setSelectedYear(parseInt(e.target.value, 10))}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg py-1.5 px-2.5 text-xs text-slate-200 focus:outline-none focus:border-sky-500 font-mono appearance-none"
                  >
                    {detectedYears.map(yr => (
                      <option key={yr} value={yr}>{yr}</option>
                    ))}
                  </select>
                  <ChevronRight className="w-3.5 h-3.5 text-slate-500 absolute right-2.5 top-2.5 rotate-90 pointer-events-none" />
                </div>
              </div>

              {/* Month Selector */}
              {(timeGrain === "month" || timeGrain === "day") && (
                <div className="flex-1 min-w-[100px]">
                  <label className="block text-[8.5px] font-mono text-slate-500 uppercase mb-1">Select Month</label>
                  <div className="relative">
                    <select
                      value={selectedMonth}
                      onChange={(e) => setSelectedMonth(parseInt(e.target.value, 10))}
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg py-1.5 px-2.5 text-xs text-slate-200 focus:outline-none focus:border-sky-500 font-mono appearance-none"
                    >
                      {monthsDict.map((mName, index) => (
                        <option key={mName} value={index + 1}>{mName}</option>
                      ))}
                    </select>
                    <ChevronRight className="w-3.5 h-3.5 text-slate-500 absolute right-2.5 top-2.5 rotate-90 pointer-events-none" />
                  </div>
                </div>
              )}

              {/* Day Selector (Date Picker representation) */}
              {timeGrain === "day" && (
                <div className="flex-1 min-w-[120px]">
                  <label className="block text-[8.5px] font-mono text-slate-500 uppercase mb-1">Select Day</label>
                  <div className="relative">
                    <input
                      type="date"
                      value={selectedDateStr}
                      onChange={(e) => handleDateChange(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg py-1.5 px-2.5 text-xs text-slate-200 focus:outline-none focus:border-sky-500 font-mono appearance-none"
                    />
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Quick Active Label Display */}
          <div className="flex justify-between items-center text-[10px] text-slate-500 font-mono bg-slate-950/40 p-2 rounded-lg border border-slate-900">
            <span className="flex items-center gap-1">
              <Filter className="w-3 h-3 text-sky-400" />
              Viewing Data Grains:
            </span>
            <span className="text-slate-300 font-bold uppercase tracking-wider">
              {timeGrain === "overall" && "ALL-TIME ACCUMULATED RECORDS"}
              {timeGrain === "year" && `YEAR ${selectedYear}`}
              {timeGrain === "month" && `${monthsDict[selectedMonth - 1]} ${selectedYear}`}
              {timeGrain === "day" && `${selectedDateStr}`}
            </span>
          </div>

        </div>
      </div>

      {/* 2. CONSOLIDATED BALANCE SHEET HERO PANEL */}
      <div className="relative overflow-hidden bg-gradient-to-br from-indigo-950/20 via-slate-900 to-slate-950 p-5 rounded-3xl border border-indigo-500/10 shadow-lg">
        
        {/* Glowing aura */}
        <div className={`absolute -right-16 -top-16 w-36 h-36 rounded-full blur-3xl opacity-20 transition-all ${
          netCashFlow >= 0 ? "bg-emerald-500" : "bg-rose-500"
        }`} />

        <div className="flex justify-between items-start">
          <div>
            <span className="text-[10px] font-mono text-slate-400 uppercase tracking-widest block font-bold">NET PERIODIC SURPLUS</span>
            <h1 className={`text-2xl font-black font-mono mt-1.5 flex items-center gap-1.5 leading-none ${
              netCashFlow >= 0 ? "text-emerald-400" : "text-rose-400"
            }`}>
              ₹{netCashFlow.toLocaleString()}
            </h1>
          </div>
          <span className={`p-2.5 rounded-xl border flex items-center justify-center ${
            netCashFlow >= 0 
              ? "bg-emerald-950/40 text-emerald-400 border-emerald-500/20" 
              : "bg-rose-950/40 text-rose-400 border-rose-500/20"
          }`}>
            {netCashFlow >= 0 ? <TrendingUp className="w-4.5 h-4.5" /> : <TrendingDown className="w-4.5 h-4.5" />}
          </span>
        </div>

        {/* Breakdown bar */}
        <div className="mt-6 space-y-2">
          <div className="flex justify-between text-[9px] font-mono text-slate-400">
            <span>Period Inflow (₹{totalInflow.toLocaleString()})</span>
            <span>Period Outflow (₹{totalOutflow.toLocaleString()})</span>
          </div>
          <div className="h-2 w-full bg-slate-950 rounded-full overflow-hidden flex border border-slate-900">
            <div className="bg-emerald-500 h-full rounded-l" style={{ width: `${(totalInflow / (totalInflow + totalOutflow || 1)) * 100}%` }} />
            <div className="bg-rose-500 h-full rounded-r" style={{ width: `${(totalOutflow / (totalInflow + totalOutflow || 1)) * 100}%` }} />
          </div>
        </div>

        {/* Dynamic subtext helper */}
        <p className="text-[9.5px] text-slate-500 font-mono mt-3 text-center">
          Inflow includes paid bills & loans received. Outflow includes salary, fuel, family expenses, tools, pipes & loans lent.
        </p>
      </div>

      {/* 3. DYNAMIC METRIC KPI CARDS GRID */}
      <div className="grid grid-cols-2 gap-3.5">
        
        {/* KPI Card 1: Total Invoice Billing */}
        <div className="bg-slate-900/60 p-4 rounded-2xl border border-slate-800/80 hover:border-slate-700 transition-all duration-300 shadow-sm relative overflow-hidden group">
          <div className="flex justify-between items-start">
            <div>
              <span className="text-[9px] font-mono text-slate-400 uppercase tracking-wider block font-bold">TOTAL BILLING</span>
              <div className="text-sm font-black font-mono text-slate-200 mt-1.5">
                ₹{revenueTotal.toLocaleString()}
              </div>
            </div>
            <div className="p-2 bg-indigo-950/40 rounded-xl text-indigo-400 border border-indigo-900/20">
              <FileText className="w-4 h-4" />
            </div>
          </div>
          
          <div className="mt-3.5 pt-3.5 border-t border-slate-850 space-y-1.5">
            <div className="flex justify-between text-[8px] font-mono text-slate-400 leading-none">
              <span>Paid: ₹{revenueReceived.toLocaleString()}</span>
              <span className="text-amber-500">Pend: ₹{revenuePending.toLocaleString()}</span>
            </div>
            <div className="h-1 w-full bg-slate-950 rounded-full overflow-hidden flex">
              <div className="bg-emerald-500 h-full" style={{ width: `${(revenueReceived / (revenueTotal || 1)) * 100}%` }} />
              <div className="bg-amber-500 h-full" style={{ width: `${(revenuePending / (revenueTotal || 1)) * 100}%` }} />
            </div>
          </div>
        </div>

        {/* KPI Card 2: Operations Costs */}
        <div className="bg-slate-900/60 p-4 rounded-2xl border border-slate-800/80 hover:border-slate-700 transition-all duration-300 shadow-sm relative overflow-hidden group">
          <div className="flex justify-between items-start">
            <div>
              <span className="text-[9px] font-mono text-slate-400 uppercase tracking-wider block font-bold">OPS COST</span>
              <div className="text-sm font-black font-mono text-slate-200 mt-1.5">
                ₹{(expSalaryPaid + expFuel + expTools + expPipes).toLocaleString()}
              </div>
            </div>
            <div className="p-2 bg-rose-950/40 rounded-xl text-rose-455 border border-rose-900/20">
              <Briefcase className="w-4 h-4" />
            </div>
          </div>

          <div className="mt-3 text-[8.5px] font-mono text-slate-500 space-y-0.5 leading-none pt-2.5">
            <div className="flex justify-between">
              <span>Wages Paid:</span>
              <span className="text-slate-300 font-bold">₹{expSalaryPaid.toLocaleString()}</span>
            </div>
            <div className="flex justify-between">
              <span>Diesel Outlay:</span>
              <span className="text-slate-300 font-bold">₹{expFuel.toLocaleString()}</span>
            </div>
          </div>
        </div>

        {/* KPI Card 3: Finance Ledger (Lending Desk) */}
        <div className="bg-slate-900/60 p-4 rounded-2xl border border-slate-800/80 hover:border-slate-700 transition-all duration-300 shadow-sm relative overflow-hidden group">
          <div className="flex justify-between items-start">
            <div>
              <span className="text-[9px] font-mono text-slate-400 uppercase tracking-wider block font-bold">DEBT PORTFOLIO</span>
              <div className="text-sm font-black font-mono text-slate-200 mt-1.5">
                ₹{(outLent - incBorrowed).toLocaleString()}
              </div>
            </div>
            <div className="p-2 bg-emerald-950/40 rounded-xl text-emerald-400 border border-emerald-900/20">
              <Wallet className="w-4 h-4" />
            </div>
          </div>

          <div className="mt-3 text-[8.5px] font-mono text-slate-500 space-y-0.5 leading-none pt-2.5">
            <div className="flex justify-between">
              <span>Lent Out:</span>
              <span className="text-emerald-400">₹{outLent.toLocaleString()}</span>
            </div>
            <div className="flex justify-between">
              <span>Borrowed In:</span>
              <span className="text-amber-400">₹{incBorrowed.toLocaleString()}</span>
            </div>
          </div>
        </div>

        {/* KPI Card 4: Domestic Outlay */}
        <div className="bg-slate-900/60 p-4 rounded-2xl border border-slate-800/80 hover:border-slate-700 transition-all duration-300 shadow-sm relative overflow-hidden group">
          <div className="flex justify-between items-start">
            <div>
              <span className="text-[9px] font-mono text-slate-400 uppercase tracking-wider block font-bold">FAMILY EXPENSE</span>
              <div className="text-sm font-black font-mono text-slate-200 mt-1.5">
                ₹{expFamily.toLocaleString()}
              </div>
            </div>
            <div className="p-2 bg-purple-950/40 rounded-xl text-purple-400 border border-purple-900/20">
              <Home className="w-4 h-4" />
            </div>
          </div>

          <div className="mt-3 text-[8.5px] font-mono text-slate-500 space-y-0.5 leading-none pt-2.5">
            <div className="flex justify-between">
              <span>Transactions:</span>
              <span className="text-slate-300 font-bold">{filteredFamily.length} logged</span>
            </div>
            <div className="flex justify-between">
              <span>Monthly Budget:</span>
              <span className="text-rose-455 font-bold">₹{totalMonthlyExpense.toLocaleString()}</span>
            </div>
          </div>
        </div>

      </div>

      {/* 4. PREMIUM CASING STOCK TRACKER (Running stock up to select period) */}
      <div className="bg-slate-900/60 p-4 rounded-3xl border border-slate-800/80 shadow-md">
        
        {/* Widget Title */}
        <div className="flex items-center gap-2 pb-3.5 border-b border-slate-800/60">
          <div className="p-1.5 bg-cyan-500/10 rounded-lg text-cyan-400 border border-cyan-500/20">
            <Layers className="w-3.5 h-3.5" />
          </div>
          <div className="flex-1">
            <h3 className="text-xs font-bold text-slate-200 uppercase font-mono leading-none">Casing Pipe Stock</h3>
            <span className="text-[8px] font-mono text-slate-500 mt-0.5 block">Running balance at selected period end</span>
          </div>
          <div className="bg-slate-950 px-2 py-0.5 rounded text-[9.5px] font-mono font-bold text-sky-400 border border-slate-850">
            Total: {casingStockData.totalAvail} pipes
          </div>
        </div>

        {/* Small card lists */}
        <div className="grid grid-cols-4 gap-2.5 mt-3.5 text-center">
          <div className="bg-slate-950/60 p-2.5 rounded-xl border border-slate-850">
            <span className="block text-[8px] text-slate-500 font-mono uppercase tracking-wider leading-none">7" H QLT</span>
            <span className="block text-sm font-black font-mono text-emerald-400 mt-1.5 leading-none">{casingStockData.avail7High}</span>
            <span className="text-[7.5px] text-slate-600 block mt-1">pipes</span>
          </div>
          <div className="bg-slate-950/60 p-2.5 rounded-xl border border-slate-850">
            <span className="block text-[8px] text-slate-500 font-mono uppercase tracking-wider leading-none">7" M QLT</span>
            <span className="block text-sm font-black font-mono text-emerald-400 mt-1.5 leading-none">{casingStockData.avail7Medium}</span>
            <span className="text-[7.5px] text-slate-600 block mt-1">pipes</span>
          </div>
          <div className="bg-slate-950/60 p-2.5 rounded-xl border border-slate-850">
            <span className="block text-[8px] text-slate-500 font-mono uppercase tracking-wider leading-none">10" H QLT</span>
            <span className="block text-sm font-black font-mono text-amber-500 mt-1.5 leading-none">{casingStockData.avail10High}</span>
            <span className="text-[7.5px] text-slate-600 block mt-1">pipes</span>
          </div>
          <div className="bg-slate-950/60 p-2.5 rounded-xl border border-slate-850">
            <span className="block text-[8px] text-slate-500 font-mono uppercase tracking-wider leading-none">10" M QLT</span>
            <span className="block text-sm font-black font-mono text-amber-500 mt-1.5 leading-none">{casingStockData.avail10Medium}</span>
            <span className="text-[7.5px] text-slate-600 block mt-1">pipes</span>
          </div>
        </div>

      </div>

      {/* 5. INTERACTIVE CHARTS HUB (HIGH FIDELITY VISUALIZATIONS) */}
      <div className="bg-slate-900/60 p-4 rounded-3xl border border-slate-800/80 space-y-4">
        
        {/* Section Header */}
        <div className="flex justify-between items-center pb-2.5 border-b border-slate-800/60">
          <div className="flex items-center gap-2">
            <Activity className="w-3.5 h-3.5 text-sky-400" />
            <h3 className="text-xs font-bold text-slate-200 uppercase font-mono tracking-wider">Visual Analytics Desk</h3>
          </div>
          <span className="text-[8px] font-mono text-slate-500">interactive graphics</span>
        </div>

        {/* Primary Chart: Cash Flow Trend over Selected period */}
        <div className="space-y-2">
          <div className="flex justify-between items-center text-[9px] font-mono text-slate-400">
            <span>Period Cash Flow Trend (Inflow vs Outflow)</span>
            <span className="text-[8.5px] text-sky-400">Recharts Engine</span>
          </div>
          <div className="h-44 w-full bg-slate-950/80 p-2.5 rounded-2xl border border-slate-850/80">
            <ResponsiveContainer width="100%" height="100%">
              {timeGrain === "day" ? (
                // BarChart representation for specific days
                <BarChart data={timeSeriesTrendData} margin={{ top: 5, right: 5, left: -25, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                  <XAxis dataKey="name" tick={{ fill: "#64748b", fontSize: 8 }} />
                  <YAxis tick={{ fill: "#64748b", fontSize: 8 }} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: "#ffffff", border: "1px solid #cbd5e1", borderRadius: "8px", fontSize: 10, boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)" }} 
                    labelStyle={{ color: "#0f172a", fontWeight: "bold" }}
                    itemStyle={{ color: "#334155" }}
                  />
                  <Bar dataKey="Inflow" fill="#10b981" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="Outflow" fill="#f43f5e" radius={[4, 4, 0, 0]} />
                </BarChart>
              ) : (
                // AreaChart representation for time series
                <AreaChart data={timeSeriesTrendData} margin={{ top: 5, right: 5, left: -25, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorInflow" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.2}/>
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="colorOutflow" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.2}/>
                      <stop offset="95%" stopColor="#f43f5e" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                  <XAxis dataKey="name" tick={{ fill: "#64748b", fontSize: 8 }} />
                  <YAxis tick={{ fill: "#64748b", fontSize: 8 }} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: "#ffffff", border: "1px solid #cbd5e1", borderRadius: "8px", fontSize: 10, boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)" }} 
                    labelStyle={{ color: "#0f172a", fontWeight: "bold" }}
                    itemStyle={{ color: "#334155" }}
                  />
                  <Area type="monotone" dataKey="Inflow" stroke="#10b981" strokeWidth={2} fillOpacity={1} fill="url(#colorInflow)" />
                  <Area type="monotone" dataKey="Outflow" stroke="#f43f5e" strokeWidth={2} fillOpacity={1} fill="url(#colorOutflow)" />
                </AreaChart>
              )}
            </ResponsiveContainer>
          </div>
        </div>

        {/* Dual Secondary Charts Layout (Expense Bar Chart + Proportional allocations) */}
        {expenseBreakdownData.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            
            {/* Left Box: Expense Breakdown Bar Chart */}
            <div className="space-y-2 bg-slate-950/40 p-3 rounded-2xl border border-slate-850/60">
              <span className="text-[9px] font-mono text-slate-400 block">Expense Breakdown Mix</span>
              <div className="h-40 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={expenseBreakdownData} layout="vertical" margin={{ top: 5, right: 5, left: -20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                    <XAxis type="number" tick={{ fill: "#64748b", fontSize: 8 }} />
                    <YAxis dataKey="name" type="category" tick={{ fill: "#94a3b8", fontSize: 8 }} width={60} />
                    <Tooltip 
                      contentStyle={{ backgroundColor: "#ffffff", border: "1px solid #cbd5e1", borderRadius: "8px", fontSize: 9, boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)" }} 
                      labelStyle={{ color: "#0f172a", fontWeight: "bold" }}
                      itemStyle={{ color: "#334155" }}
                    />
                    <Bar dataKey="Amount" fill="#3b82f6" radius={[0, 4, 4, 0]}>
                      {expenseBreakdownData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Right Box: Budget Allocator Pie Chart */}
            {pieDistributionData.length > 0 && (
              <div className="space-y-2 bg-slate-950/40 p-3 rounded-2xl border border-slate-850/60">
                <span className="text-[9px] font-mono text-slate-400 block">Family vs Business Allocations</span>
                <div className="h-40 w-full flex items-center justify-between">
                  <div className="w-[50%] h-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={pieDistributionData}
                          cx="50%"
                          cy="50%"
                          innerRadius={22}
                          outerRadius={38}
                          paddingAngle={3}
                          dataKey="value"
                        >
                          {pieDistributionData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip 
                          contentStyle={{ backgroundColor: "#ffffff", border: "1px solid #cbd5e1", borderRadius: "8px", fontSize: 9, boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)" }} 
                          labelStyle={{ color: "#0f172a", fontWeight: "bold" }}
                          itemStyle={{ color: "#334155" }}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                  {/* Custom legend grid */}
                  <div className="w-[48%] space-y-2.5 text-[8.5px] font-mono">
                    {pieDistributionData.map((p, idx) => (
                      <div key={idx} className="flex flex-col">
                        <div className="flex items-center gap-1.5 text-slate-300 font-bold">
                          <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ backgroundColor: p.color }} />
                          <span className="truncate">{p.name.split(" ")[0]}</span>
                        </div>
                        <span className="text-slate-500 pl-3">₹{p.value.toLocaleString()}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

          </div>
        )}

      </div>

      {/* 6. DETAILS TRACING EXPLORER (TABULATED LEDGERS) */}
      <div className="bg-slate-900/60 p-4 rounded-3xl border border-slate-800/80 space-y-4">
        
        {/* Section Header */}
        <div className="flex items-center gap-2 pb-3.5 border-b border-slate-800/60">
          <div className="p-1.5 bg-indigo-500/10 rounded-lg text-indigo-400 border border-indigo-500/20">
            <Search className="w-3.5 h-3.5" />
          </div>
          <div className="flex-1">
            <h3 className="text-xs font-bold text-slate-200 uppercase font-mono leading-none">Tracing Details Explorer</h3>
            <span className="text-[8px] font-mono text-slate-500 mt-0.5 block">Audit contribution records for select filters</span>
          </div>
        </div>

        {/* Tab List */}
        <div className="flex gap-1.5 bg-slate-950 p-1 rounded-xl text-[9px] font-bold font-mono border border-slate-850 overflow-x-auto custom-scrollbar">
          {(["bills", "payroll", "fuel", "family", "loans"] as const).map(tab => {
            const countDict = {
              bills: filteredBills.length,
              payroll: filteredSalary.length,
              fuel: filteredFuel.length,
              family: filteredFamily.length,
              loans: filteredLoansGiven.length + filteredLoansReceived.length
            };
            return (
              <button
                key={tab}
                type="button"
                onClick={() => setActiveExplorerTab(tab)}
                className={`py-1.5 px-3 rounded-lg text-center transition whitespace-nowrap ${
                  activeExplorerTab === tab
                    ? "bg-slate-900 text-sky-400 border border-slate-800 shadow"
                    : "text-slate-500 hover:text-slate-300"
                }`}
              >
                {tab.toUpperCase()} ({countDict[tab]})
              </button>
            );
          })}
        </div>

        {/* Ledger logs view */}
        <div className="bg-slate-950 rounded-2xl border border-slate-850 p-3 overflow-hidden shadow-inner">
          <div className="overflow-x-auto max-h-60 overflow-y-auto custom-scrollbar">
            
            {activeExplorerTab === "bills" && (
              <table className="w-full text-left border-collapse text-[10px] font-mono">
                <thead>
                  <tr className="border-b border-slate-800 text-slate-500">
                    <th className="pb-2 font-bold uppercase">Invoice No</th>
                    <th className="pb-2 font-bold uppercase">Client</th>
                    <th className="pb-2 font-bold uppercase">Date</th>
                    <th className="pb-2 font-bold text-right uppercase">Amount</th>
                    <th className="pb-2 font-bold text-center uppercase">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-900">
                  {filteredBills.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="py-8 text-center text-slate-600">No bills logged in this period.</td>
                    </tr>
                  ) : (
                    filteredBills.map((b, i) => (
                      <tr key={i} className="hover:bg-slate-900/30 transition-colors">
                        <td className="py-2.5 text-slate-300 font-bold">{b.invoiceNo}</td>
                        <td className="py-2.5 text-slate-400 truncate max-w-[80px]">{b.clientName}</td>
                        <td className="py-2.5 text-slate-500">{b.billDate}</td>
                        <td className="py-2.5 text-slate-200 text-right font-bold">₹{(b.amount || 0).toLocaleString()}</td>
                        <td className="py-2.5 text-center">
                          <span className={`px-1.5 py-0.5 rounded text-[8px] font-bold border ${
                            b.status === "Paid" 
                              ? "bg-emerald-950/60 text-emerald-400 border-emerald-900/30" 
                              : "bg-amber-950/60 text-amber-400 border-amber-900/30"
                          }`}>
                            {b.status}
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            )}

            {activeExplorerTab === "payroll" && (
              <table className="w-full text-left border-collapse text-[10px] font-mono">
                <thead>
                  <tr className="border-b border-slate-800 text-slate-500">
                    <th className="pb-2 font-bold uppercase">Labour ID</th>
                    <th className="pb-2 font-bold uppercase">Date</th>
                    <th className="pb-2 font-bold text-right uppercase">Salary Paid</th>
                    <th className="pb-2 font-bold text-center uppercase">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-900">
                  {filteredSalary.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="py-8 text-center text-slate-600">No payroll entries in this period.</td>
                    </tr>
                  ) : (
                    filteredSalary.map((s, i) => {
                      const worker = labours.find(l => l.id === s.labourId);
                      return (
                        <tr key={i} className="hover:bg-slate-900/30 transition-colors">
                          <td className="py-2.5 text-slate-300 font-bold truncate max-w-[100px]">{worker?.fullName || s.labourId}</td>
                          <td className="py-2.5 text-slate-500">{s.date}</td>
                          <td className="py-2.5 text-slate-200 text-right font-bold">₹{Number(s.netPaid || 0).toLocaleString()}</td>
                          <td className="py-2.5 text-center">
                            <span className={`px-1.5 py-0.5 rounded text-[8px] font-bold border ${
                              s.status === "Paid"
                                ? "bg-emerald-950/60 text-emerald-400 border-emerald-900/30"
                                : "bg-amber-950/60 text-amber-400 border-amber-900/30"
                            }`}>
                              {s.status}
                            </span>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            )}

            {activeExplorerTab === "fuel" && (
              <table className="w-full text-left border-collapse text-[10px] font-mono">
                <thead>
                  <tr className="border-b border-slate-800 text-slate-500">
                    <th className="pb-2 font-bold uppercase">Vehicle</th>
                    <th className="pb-2 font-bold uppercase">Date</th>
                    <th className="pb-2 font-bold text-right uppercase">Liters</th>
                    <th className="pb-2 font-bold text-right uppercase">Total Cost</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-900">
                  {filteredFuel.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="py-8 text-center text-slate-600">No fuel entries logged in this period.</td>
                    </tr>
                  ) : (
                    filteredFuel.map((f, i) => (
                      <tr key={i} className="hover:bg-slate-900/30 transition-colors">
                        <td className="py-2.5 text-slate-300 font-bold">{f.vehicleName || f.vehicleId || "Generic"}</td>
                        <td className="py-2.5 text-slate-500">{f.date || f.dateTime || "N/A"}</td>
                        <td className="py-2.5 text-slate-400 text-right">{f.liters || 0} L</td>
                        <td className="py-2.5 text-slate-200 text-right font-bold">₹{Number(f.totalAmount ?? f.cost ?? 0).toLocaleString()}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            )}

            {activeExplorerTab === "family" && (
              <table className="w-full text-left border-collapse text-[10px] font-mono">
                <thead>
                  <tr className="border-b border-slate-800 text-slate-500">
                    <th className="pb-2 font-bold uppercase">Category</th>
                    <th className="pb-2 font-bold uppercase">Date</th>
                    <th className="pb-2 font-bold uppercase">Description</th>
                    <th className="pb-2 font-bold text-right uppercase">Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-900">
                  {filteredFamily.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="py-8 text-center text-slate-600">No family expenses logged in this period.</td>
                    </tr>
                  ) : (
                    filteredFamily.map((e, i) => (
                      <tr key={i} className="hover:bg-slate-900/30 transition-colors">
                        <td className="py-2.5 text-slate-300 font-bold">{e.reason || e.category || "Other"}</td>
                        <td className="py-2.5 text-slate-500">{e.date}</td>
                        <td className="py-2.5 text-slate-400 truncate max-w-[100px]">{e.description || "-"}</td>
                        <td className="py-2.5 text-slate-250 text-right font-bold text-rose-455">₹{e.amount.toLocaleString()}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            )}

            {activeExplorerTab === "loans" && (
              <table className="w-full text-left border-collapse text-[10px] font-mono">
                <thead>
                  <tr className="border-b border-slate-800 text-slate-500">
                    <th className="pb-2 font-bold uppercase">Counterparty</th>
                    <th className="pb-2 font-bold uppercase">Date</th>
                    <th className="pb-2 font-bold uppercase">Type</th>
                    <th className="pb-2 font-bold text-right uppercase">Amount</th>
                    <th className="pb-2 font-bold text-center uppercase">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-900">
                  {filteredLoansGiven.length === 0 && filteredLoansReceived.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="py-8 text-center text-slate-600">No loan records in this period.</td>
                    </tr>
                  ) : (
                    [
                      ...filteredLoansGiven.map(l => ({ name: l.personName || l.borrowerName || "Lent Loan", date: l.startDate || "N/A", type: "LENT (Given)", amount: l.amountGiven ?? l.loanAmount ?? 0, status: l.collectionStatus || "Pending" })),
                      ...filteredLoansReceived.map(l => ({ name: l.personName || l.lenderName || "Borrowed Loan", date: l.startDate || "N/A", type: "BORROWED (Got)", amount: l.amount ?? l.borrowedAmount ?? 0, status: l.interestStatus || "Pending" }))
                    ].map((l, i) => (
                      <tr key={i} className="hover:bg-slate-900/30 transition-colors">
                        <td className="py-2.5 text-slate-300 font-bold truncate max-w-[80px]">{l.name}</td>
                        <td className="py-2.5 text-slate-500">{l.date}</td>
                        <td className={`py-2.5 text-[8.5px] font-bold ${l.type.startsWith("LENT") ? "text-purple-400" : "text-amber-400"}`}>{l.type}</td>
                        <td className="py-2.5 text-slate-200 text-right font-bold">₹{l.amount.toLocaleString()}</td>
                        <td className="py-2.5 text-center">
                          <span className={`px-1.5 py-0.5 rounded text-[8px] font-bold border ${
                            l.status === "Paid"
                              ? "bg-emerald-950/60 text-emerald-400 border-emerald-900/30"
                              : "bg-amber-950/60 text-amber-400 border-amber-900/30"
                          }`}>
                            {l.status}
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            )}

          </div>
        </div>

      </div>

    </div>
  );
}
