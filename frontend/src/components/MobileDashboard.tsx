/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { 
  Briefcase, 
  Users, 
  Car, 
  CreditCard, 
  Fuel, 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  PieChart, 
  Activity, 
  Percent, 
  Clock, 
  HeartHandshake, 
  Home, 
  ArrowUpRight, 
  ArrowDownLeft,
  ChevronDown,
  ChevronUp,
  Phone,
  MapPin,
  BadgeCheck,
  AlertTriangle,
  Wrench,
  Hammer,
  FileText,
  Package,
  PackageCheck,
  Layers
} from "lucide-react";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  ResponsiveContainer, 
  CartesianGrid, 
  Legend 
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
  // Local fallback translations helper if not passed from parent
  const localT = (key: string) => {
    if (t) return t(key);
    // basic inline translations fallback
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
  const [activeChartTab, setActiveChartTab] = useState<"salary" | "fuel" | "finance" | "family">("salary");


  // Calculations for Business Analytics
  const totalDrivers = labours.filter(l => l.skillType === "Driver").length;
  const totalHelpers = labours.filter(l => l.skillType === "Helper").length;
  const totalVehicles = vehicles.length;

  const totalSalaryPaid = salaryPayments
    .filter(p => p.status === "Paid")
    .reduce((sum, p) => sum + (Number(p.netPaid) || 0), 0);

  const totalSalaryPending = salaryPayments
    .filter(p => p.status === "Pending")
    .reduce((sum, p) => sum + (Number(p.netPaid) || 0), 0);

  const totalFuelExpense = fuelEntries.reduce((sum, f) => {
    const val = f.totalAmount !== undefined ? f.totalAmount : f.cost;
    return sum + (Number(val) || 0);
  }, 0);

  const totalFinanceGiven = loansGiven.reduce((sum, l) => {
    const val = l.amountGiven !== undefined ? l.amountGiven : l.loanAmount;
    return sum + (Number(val) || 0);
  }, 0);

  const totalFinanceReceived = loansReceived.reduce((sum, l) => {
    const val = l.amount !== undefined ? l.amount : l.borrowedAmount;
    return sum + (Number(val) || 0);
  }, 0);

  // Business Profit / Loss computation
  const rawProfitLoss = (totalFinanceReceived + 145000) - (totalSalaryPaid + totalFuelExpense + totalFinanceGiven);
  const monthlyProfitLoss = isNaN(rawProfitLoss) ? 0 : rawProfitLoss;

  // Calculations for Finance Analytics
  const totalInterestEarned = loansGiven.reduce((sum, l) => sum + (l.interestAmount ?? 0), 0);
  const totalInterestPaid = loansReceived.reduce((sum, l) => sum + (l.interestAmount ?? 0), 0);
  
  const pendingCollections = loansGiven
    .filter(l => l.collectionStatus === "Pending")
    .reduce((sum, l) => sum + (l.amountGiven ?? l.loanAmount ?? 0) + (l.interestAmount ?? 0), 0);

  const pendingPayments = loansReceived
    .filter(l => l.interestStatus === "Pending")
    .reduce((sum, l) => sum + (l.amount ?? l.borrowedAmount ?? 0) + (l.interestAmount ?? 0), 0);

  // Calculations for Family Analytics
  const totalFamilyExpenses = familyExpenses.reduce((sum, e) => sum + e.amount, 0);
  
  // Expenses Filtered for current month (June 2026)
  const monthlyFamilyExpenses = familyExpenses
    .filter(e => e.date.startsWith("2026-06"))
    .reduce((sum, e) => sum + e.amount, 0);

  const totalPendingBillsAmount = businessBills
    .filter(b => b.status === "Pending")
    .reduce((sum, b) => sum + (b.amount || 0), 0);

  // Group family expenses by category for analytics
  const categoriesList = ["Food", "Medical", "Education", "Shopping", "Travel", "House Rent", "Electricity", "Water Bill", "Internet", "Entertainment", "Other"];
  const categoryExpenses = categoriesList.map(cat => {
    const total = familyExpenses
      .filter(e => e.reason === cat || (e as any).category === cat)
      .reduce((sum, e) => sum + e.amount, 0);
    return { name: cat, amount: total };
  }).filter(c => c.amount > 0);

  return (
    <div id="mobile-dashboard-scroll" className="space-y-4 pb-4">
      {/* KPI WELCOME CARD */}
      <div className="bg-gradient-to-br from-slate-900 via-indigo-950/20 to-slate-950 p-4 rounded-2xl border border-indigo-500/20 relative overflow-hidden shadow-lg shadow-indigo-950/20">
        <div className="absolute -right-8 -top-8 w-24 h-24 bg-indigo-500/10 rounded-full blur-xl" />
        <div className="absolute top-0 right-0 p-3 bg-indigo-500/10 rounded-bl-2xl">
          <Activity className="w-5 h-5 text-indigo-400 animate-pulse" />
        </div>
        <span id="brand-header-label" className="inline-block font-mono font-bold uppercase tracking-widest bg-slate-900/95 px-3 py-1.5 rounded-lg border border-sky-400/30">
          Smart Business & Family ERP
        </span>
        <h2 className="text-base font-black text-slate-100 mt-2 tracking-tight">{localT("operations_analytics")}</h2>
        <p className="text-[10px] text-slate-400 mt-0.5">{localT("ops_subtitle")}</p>
        
        <div className="flex flex-wrap items-center gap-2 mt-3.5">
          <span id="net-cash-flow-badge" className={`text-[10px] font-mono font-extrabold px-2.5 py-1 rounded-xl flex items-center gap-1 border ${
            monthlyProfitLoss >= 0 
              ? "bg-emerald-950/80 text-emerald-400 border-emerald-500/30 shadow-[0_0_8px_rgba(16,185,129,0.1)]" 
              : "bg-rose-950/80 text-rose-400 border-rose-500/30 shadow-[0_0_8px_rgba(244,63,94,0.1)]"
          }`}>
            {monthlyProfitLoss >= 0 ? <TrendingUp className="w-3 h-3 text-emerald-400" /> : <TrendingDown className="w-3 h-3 text-rose-400" />}
            {localT("net_cash_flow")}: ₹{monthlyProfitLoss.toLocaleString()}
          </span>
          <span className="text-[10px] text-slate-400 font-medium bg-slate-950/60 px-2 py-1 rounded-lg border border-slate-800/60">
            {localT("active_roster")}
          </span>
        </div>
      </div>

      {/* Real-time Accumulated Data Metrics Grid with distinct color identities */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
        
        {/* Card 1: Labour Count (Indigo Theme) */}
        <div className="bg-slate-900/40 p-3.5 rounded-2xl border border-indigo-500/20 hover:border-indigo-500/40 transition-all duration-300 shadow-sm relative overflow-hidden group">
          <div className="absolute -right-4 -bottom-4 w-12 h-12 bg-indigo-500/5 rounded-full blur-md group-hover:scale-150 transition-transform duration-500" />
          <div className="flex justify-between items-start">
            <div>
              <span className="text-[9.5px] font-mono text-slate-400 uppercase tracking-wider font-bold">{localT("labour_count")}</span>
              <div className="text-lg font-black font-mono mt-1 text-indigo-300 flex items-baseline gap-1.5">
                <span>{activeLabourCount}</span>
                <span className="text-[10px] text-yellow-400 font-bold bg-yellow-950/40 px-1.5 py-0.5 rounded border border-yellow-900/30">{localT("active")}</span>
              </div>
            </div>
            <div className="p-2 bg-indigo-950/80 rounded-xl text-indigo-400 border border-indigo-800/40">
              <Users className="w-4 h-4" />
            </div>
          </div>
        </div>

        {/* Card 2: Lent Portfolio (Emerald Theme) */}
        <div className="bg-slate-900/40 p-3.5 rounded-2xl border border-emerald-500/20 hover:border-emerald-500/40 transition-all duration-300 shadow-sm relative overflow-hidden group">
          <div className="absolute -right-4 -bottom-4 w-12 h-12 bg-emerald-500/5 rounded-full blur-md group-hover:scale-150 transition-transform duration-500" />
          <div className="flex justify-between items-start">
            <div>
              <span className="text-[9.5px] font-mono text-slate-400 uppercase tracking-wider font-bold">{localT("lent_portfolio")}</span>
              <div className="text-lg font-black font-mono mt-1 text-emerald-400">
                ₹{totalOutstandingLoanAmount.toLocaleString()}
              </div>
            </div>
            <div className="p-2 bg-emerald-950/80 rounded-xl text-emerald-400 border border-emerald-800/40">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
        </div>

        {/* Card 3: Family Expenses (Rose Theme) */}
        <div className="bg-slate-900/40 p-3.5 rounded-2xl border border-rose-500/20 hover:border-rose-500/40 transition-all duration-300 shadow-sm relative overflow-hidden group">
          <div className="absolute -right-4 -bottom-4 w-12 h-12 bg-rose-500/5 rounded-full blur-md group-hover:scale-150 transition-transform duration-500" />
          <div className="flex justify-between items-start">
            <div>
              <span className="text-[9.5px] font-mono text-slate-400 uppercase tracking-wider font-bold">{localT("family_expenses")}</span>
              <div className="text-lg font-black font-mono mt-1 text-rose-400">
                ₹{totalMonthlyExpense.toLocaleString()}
              </div>
            </div>
            <div className="p-2 bg-rose-950/80 rounded-xl text-rose-400 border border-rose-800/40">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
        </div>

        {/* Card 4: Family Savings (Purple Theme) */}
        <div className="bg-slate-900/40 p-3.5 rounded-2xl border border-purple-500/20 hover:border-purple-500/40 transition-all duration-300 shadow-sm relative overflow-hidden group">
          <div className="absolute -right-4 -bottom-4 w-12 h-12 bg-purple-500/5 rounded-full blur-md group-hover:scale-150 transition-transform duration-500" />
          <div className="flex justify-between items-start">
            <div>
              <span className="text-[9.5px] font-mono text-slate-400 uppercase tracking-wider font-bold">{localT("family_savings")}</span>
              <div className="text-lg font-black font-mono mt-1 text-purple-400 flex items-baseline gap-1">
                <span>{familySavingsRate}%</span>
                <span className="text-[9px] text-purple-300 font-bold">{localT("surplus")}</span>
              </div>
            </div>
            <div className="p-2 bg-purple-950/80 rounded-xl text-purple-400 border border-purple-800/40">
              <ArrowUpRight className="w-4 h-4" />
            </div>
          </div>
        </div>

        {/* Card 5: Bit Count (Blue Theme) */}
        <div className="bg-slate-900/40 p-3.5 rounded-2xl border border-blue-500/20 hover:border-blue-500/40 transition-all duration-300 shadow-sm relative overflow-hidden group">
          <div className="absolute -right-4 -bottom-4 w-12 h-12 bg-blue-500/5 rounded-full blur-md group-hover:scale-150 transition-transform duration-500" />
          <div className="flex justify-between items-start">
            <div>
              <span className="text-[9.5px] font-mono text-slate-400 uppercase tracking-wider font-bold">{localT("bit_count")}</span>
              <div className="text-lg font-black font-mono mt-1 text-blue-700">
                {bitEntries.length}
              </div>
            </div>
            <div className="p-2 bg-blue-950/80 rounded-xl text-blue-400 border border-blue-800/40">
              <Wrench className="w-4 h-4" />
            </div>
          </div>
        </div>

        {/* Card 6: Hammer Count (Amber Theme) */}
        <div className="bg-slate-900/40 p-3.5 rounded-2xl border border-amber-500/20 hover:border-amber-500/40 transition-all duration-300 shadow-sm relative overflow-hidden group">
          <div className="absolute -right-4 -bottom-4 w-12 h-12 bg-amber-500/5 rounded-full blur-md group-hover:scale-150 transition-transform duration-500" />
          <div className="flex justify-between items-start">
            <div>
              <span className="text-[9.5px] font-mono text-slate-400 uppercase tracking-wider font-bold">{localT("hammer_count")}</span>
              <div className="text-lg font-black font-mono mt-1 text-amber-700">
                {hammerEntries.length}
              </div>
            </div>
            <div className="p-2 bg-amber-950/80 rounded-xl text-amber-400 border border-amber-800/40">
              <Hammer className="w-4 h-4" />
            </div>
          </div>
        </div>

        {/* Card 7: Number of Bill Count (Teal Theme) */}
        <div className="bg-slate-900/40 p-3.5 rounded-2xl border border-teal-500/20 hover:border-teal-500/40 transition-all duration-300 shadow-sm relative overflow-hidden group">
          <div className="absolute -right-4 -bottom-4 w-12 h-12 bg-teal-500/5 rounded-full blur-md group-hover:scale-150 transition-transform duration-500" />
          <div className="flex justify-between items-start">
            <div>
              <span className="text-[9.5px] font-mono text-slate-400 uppercase tracking-wider font-bold">{localT("bill_count")}</span>
              <div className="text-lg font-black font-mono mt-1" style={{ color: "#3b0764" }}>
                {businessBills.length}
              </div>
            </div>
            <div className="p-2 bg-teal-950/80 rounded-xl text-teal-400 border border-teal-800/40">
              <FileText className="w-4 h-4" />
            </div>
          </div>
        </div>

        {/* Card 8: Pending Amount in Bill (Rose Theme) */}
        <div className="bg-slate-900/40 p-3.5 rounded-2xl border border-rose-500/20 hover:border-rose-500/40 transition-all duration-300 shadow-sm relative overflow-hidden group">
          <div className="absolute -right-4 -bottom-4 w-12 h-12 bg-rose-500/5 rounded-full blur-md group-hover:scale-150 transition-transform duration-500" />
          <div className="flex justify-between items-start">
            <div>
              <span className="text-[9.5px] font-mono text-slate-400 uppercase tracking-wider font-bold">{localT("pending_bills_amount")}</span>
              <div className="text-lg font-black font-mono mt-1 text-rose-700">
                ₹{totalPendingBillsAmount.toLocaleString()}
              </div>
            </div>
            <div className="p-2 bg-rose-950/80 rounded-xl text-rose-400 border border-rose-800/40">
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
        </div>

      </div>

      {/* Stock Availability Section */}
      {(() => {
        // Registered stock counts (from pipe suppliers)
        const reg7High = (pipeEntries as PipeEntry[]).reduce((s, p) => s + Number(p.pipe7HighCount || 0), 0);
        const reg7Medium = (pipeEntries as PipeEntry[]).reduce((s, p) => s + Number(p.pipe7MediumCount || 0), 0);
        const reg10High = (pipeEntries as PipeEntry[]).reduce((s, p) => s + Number(p.pipe10HighCount || 0), 0);
        const reg10Medium = (pipeEntries as PipeEntry[]).reduce((s, p) => s + Number(p.pipe10MediumCount || 0), 0);

        // Used counts from bills (each 20 ft = 1 casing pipe)
        const used7High = (businessBills as BusinessBill[]).reduce((s, b) => s + Number(b.casing7HighFeet || 0), 0) / 20;
        const used7Medium = (businessBills as BusinessBill[]).reduce((s, b) => s + Number(b.casing7MediumFeet || 0), 0) / 20;
        const used10High = (businessBills as BusinessBill[]).reduce((s, b) => s + Number(b.casing10HighFeet || 0), 0) / 20;
        const used10Medium = (businessBills as BusinessBill[]).reduce((s, b) => s + Number(b.casing10MediumFeet || 0), 0) / 20;

        // Available stock
        const avail7High = Math.max(0, reg7High - used7High);
        const avail7Medium = Math.max(0, reg7Medium - used7Medium);
        const avail10High = Math.max(0, reg10High - used10High);
        const avail10Medium = Math.max(0, reg10Medium - used10Medium);
        const totalAvail = avail7High + avail7Medium + avail10High + avail10Medium;

        return (
          <div className="space-y-2">
            {/* Section header */}
            <div className="flex items-center gap-2 px-0.5">
              <div className="p-1.5 bg-cyan-500/10 rounded-lg text-cyan-400 border border-cyan-500/20">
                <Layers className="w-3.5 h-3.5" />
              </div>
              <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider font-mono">Casing Stock Available</h3>
            </div>

            <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">

              {/* Total Stock Available */}
              <div className="col-span-2 lg:col-span-1 bg-slate-900/40 p-3 rounded-2xl border border-cyan-500/25 hover:border-cyan-500/50 transition-all duration-300 shadow-sm relative overflow-hidden group">
                <div className="absolute -right-3 -bottom-3 w-10 h-10 bg-cyan-500/5 rounded-full blur-md group-hover:scale-150 transition-transform duration-500" />
                <div className="flex justify-between items-start">
                  <div>
                    <span className="text-[9px] font-mono text-slate-400 uppercase tracking-wider font-bold block font-bold">Total Stock Available</span>
                    <div className="flex items-baseline gap-1 mt-1">
                      <span className="text-lg font-black font-mono" style={{ color: "#1e3a8a" }}>{Math.round(totalAvail)}</span>
                      <span className="text-[9px] text-slate-500 font-bold font-mono">pipes</span>
                    </div>
                  </div>
                  <div className="p-2 bg-cyan-950/80 rounded-xl text-cyan-400 border border-cyan-800/40">
                    <Package className="w-4 h-4" />
                  </div>
                </div>
              </div>

              {/* 7" High QLT */}
              <div className="bg-slate-900/40 p-3 rounded-2xl border border-emerald-500/25 hover:border-emerald-500/50 transition-all duration-300 shadow-sm relative overflow-hidden group">
                <div className="absolute -right-3 -bottom-3 w-10 h-10 bg-emerald-500/5 rounded-full blur-md group-hover:scale-150 transition-transform duration-500" />
                <div className="flex justify-between items-start">
                  <div>
                    <span className="text-[9px] font-mono text-slate-400 uppercase tracking-wider font-bold block font-bold">7" H QLT</span>
                    <div className="flex items-baseline gap-1 mt-1">
                      <span className="text-lg font-black font-mono" style={{ color: "#10b981" }}>{Math.round(avail7High)}</span>
                      <span className="text-[9px] text-slate-500 font-bold font-mono">pipes</span>
                    </div>
                  </div>
                  <div className="p-2 bg-emerald-950/80 rounded-xl text-emerald-400 border border-emerald-800/40">
                    <PackageCheck className="w-3.5 h-3.5" />
                  </div>
                </div>
              </div>

              {/* 7" Medium QLT */}
              <div className="bg-slate-900/40 p-3 rounded-2xl border border-teal-500/25 hover:border-teal-500/50 transition-all duration-300 shadow-sm relative overflow-hidden group">
                <div className="absolute -right-3 -bottom-3 w-10 h-10 bg-teal-500/5 rounded-full blur-md group-hover:scale-150 transition-transform duration-500" />
                <div className="flex justify-between items-start">
                  <div>
                    <span className="text-[9px] font-mono text-slate-400 uppercase tracking-wider font-bold block font-bold">7" M QLT</span>
                    <div className="flex items-baseline gap-1 mt-1">
                      <span className="text-lg font-black font-mono" style={{ color: "#10b981" }}>{Math.round(avail7Medium)}</span>
                      <span className="text-[9px] text-slate-500 font-bold font-mono">pipes</span>
                    </div>
                  </div>
                  <div className="p-2 bg-teal-950/80 rounded-xl text-teal-400 border border-teal-800/40">
                    <PackageCheck className="w-3.5 h-3.5" />
                  </div>
                </div>
              </div>

              {/* 10" High QLT */}
              <div className="bg-slate-900/40 p-3 rounded-2xl border border-orange-500/25 hover:border-orange-500/50 transition-all duration-300 shadow-sm relative overflow-hidden group">
                <div className="absolute -right-3 -bottom-3 w-10 h-10 bg-orange-500/5 rounded-full blur-md group-hover:scale-150 transition-transform duration-500" />
                <div className="flex justify-between items-start">
                  <div>
                    <span className="text-[9px] font-mono text-slate-400 uppercase tracking-wider font-bold block font-bold">10" H QLT</span>
                    <div className="flex items-baseline gap-1 mt-1">
                      <span className="text-lg font-black font-mono" style={{ color: "#c2410c" }}>{Math.round(avail10High)}</span>
                      <span className="text-[9px] text-slate-500 font-bold font-mono">pipes</span>
                    </div>
                  </div>
                  <div className="p-2 bg-orange-950/80 rounded-xl text-orange-400 border border-orange-800/40">
                    <PackageCheck className="w-3.5 h-3.5" />
                  </div>
                </div>
              </div>

              {/* 10" Medium QLT */}
              <div className="bg-slate-900/40 p-3 rounded-2xl border border-amber-500/25 hover:border-amber-500/50 transition-all duration-300 shadow-sm relative overflow-hidden group">
                <div className="absolute -right-3 -bottom-3 w-10 h-10 bg-amber-500/5 rounded-full blur-md group-hover:scale-150 transition-transform duration-500" />
                <div className="flex justify-between items-start">
                  <div>
                    <span className="text-[9px] font-mono text-slate-400 uppercase tracking-wider font-bold block font-bold">10" M QLT</span>
                    <div className="flex items-baseline gap-1 mt-1">
                      <span className="text-lg font-black font-mono" style={{ color: "#b45309" }}>{Math.round(avail10Medium)}</span>
                      <span className="text-[9px] text-slate-500 font-bold font-mono">pipes</span>
                    </div>
                  </div>
                  <div className="p-2 bg-amber-950/80 rounded-xl text-amber-400 border border-amber-800/40">
                    <PackageCheck className="w-3.5 h-3.5" />
                  </div>
                </div>
              </div>

            </div>
          </div>
        );
      })()}

      {/* 1. BUSINESS METRICS */}
      <div className="bg-indigo-950/40 rounded-2xl border border-indigo-900/50 p-4 space-y-3 shadow-md shadow-indigo-950/20">
        <div className="flex items-center justify-between pb-2.5 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-indigo-500/10 rounded-lg text-indigo-400 border border-indigo-500/20">
              <Briefcase className="w-3.5 h-3.5" />
            </div>
            <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider font-mono">{localT("business_ops")}</h3>
          </div>
          <span className="text-[9px] font-mono text-slate-500">{localT("fleet_workforce")}</span>
        </div>
        
        <div className="grid grid-cols-2 gap-2.5 text-xs">
          {/* Item 1: Drivers & Helpers */}
          <div className="bg-slate-950/80 p-3 rounded-xl border border-indigo-500/10 hover:border-indigo-500/20 transition-colors">
            <div className="text-slate-500 text-[9px] font-mono leading-none tracking-wider">{localT("workforce_roster")}</div>
            <div className="font-extrabold text-slate-200 mt-2 flex items-baseline gap-2">
              <span className="text-indigo-400 text-sm font-mono">{totalDrivers} <span className="text-[9px] font-normal text-slate-500">{localT("drivers")}</span></span>
              <span className="text-slate-700 font-normal text-[10px]">•</span>
              <span className="text-teal-400 text-sm font-mono">{totalHelpers} <span className="text-[9px] font-normal text-slate-500">{localT("helpers")}</span></span>
            </div>
            {/* Visual dual bar representation */}
            <div className="mt-2.5 h-1.5 w-full bg-slate-900 rounded-full overflow-hidden flex">
              <div className="bg-indigo-500 h-full" style={{ width: `${(totalDrivers / (totalDrivers + totalHelpers || 1)) * 100}%` }} />
              <div className="bg-teal-500 h-full" style={{ width: `${(totalHelpers / (totalDrivers + totalHelpers || 1)) * 100}%` }} />
            </div>
          </div>

          {/* Item 2: Active Vehicles */}
          <div className="bg-slate-950/80 p-3 rounded-xl border border-indigo-500/10 hover:border-indigo-500/20 transition-colors">
            <div className="flex justify-between items-start">
              <div className="text-slate-500 text-[9px] font-mono leading-none tracking-wider">{localT("total_vehicles")}</div>
              <Car className="w-3.5 h-3.5 text-indigo-400/50" />
            </div>
            <div className="font-mono font-extrabold text-slate-200 mt-2 text-sm flex items-baseline gap-1">
              <span className="text-indigo-400">{totalVehicles}</span>
              <span className="text-[9.5px] font-normal text-slate-500">{localT("registered")}</span>
            </div>

          </div>

          {/* Item 3: Salary Paid */}
          <div className="bg-slate-950/80 p-3 rounded-xl border border-emerald-500/10 hover:border-emerald-500/20 transition-colors">
            <div className="text-slate-500 text-[9px] font-mono leading-none tracking-wider flex items-center gap-1 text-emerald-400/80">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
              {localT("salary_paid")}
            </div>
            <div className="font-mono font-black text-emerald-400 mt-2 text-sm">₹{totalSalaryPaid.toLocaleString()}</div>
          </div>

          {/* Item 4: Salary Pending */}
          <div className="bg-slate-950/80 p-3 rounded-xl border-rose-500/10 hover:border-rose-500/20 transition-colors">
            <div className="text-slate-500 text-[9px] font-mono leading-none tracking-wider flex items-center gap-1 text-rose-455">
              <span className="w-1.5 h-1.5 rounded-full bg-rose-450" />
              {localT("salary_pending")}
            </div>
            <div className="font-mono font-black text-rose-400 mt-2 text-sm">₹{totalSalaryPending.toLocaleString()}</div>
          </div>

          {/* Item 5: Fuel Expenses */}
          <div className="bg-slate-950/80 p-3 rounded-xl border-amber-500/10 hover:border-amber-500/20 transition-colors">
            <div className="flex justify-between items-start">
              <div className="text-slate-500 text-[9px] font-mono leading-none tracking-wider flex items-center gap-1 text-amber-500/80">
                <Fuel className="w-3 h-3" />
                {localT("fuel_expenses")}
              </div>
            </div>
            <div className="font-mono font-black text-slate-200 mt-2 text-sm">₹{totalFuelExpense.toLocaleString()}</div>
          </div>

          {/* Item 6: Finance Flows */}
          <div className="bg-slate-950/80 p-3 rounded-xl border border-slate-800 hover:border-slate-700 transition-colors">
            <div className="text-slate-500 text-[9px] font-mono leading-none tracking-wider">{localT("finance_flows")}</div>
            <div className="text-[10px] text-slate-300 mt-2 space-y-1 font-mono">
              <div className="flex justify-between items-center bg-slate-900/50 px-1.5 py-0.5 rounded border border-slate-800">
                <span className="text-slate-500 text-[8px] uppercase">{localT("lent")}:</span> 
                <span className="text-emerald-400 font-bold">₹{totalFinanceGiven.toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center bg-slate-900/50 px-1.5 py-0.5 rounded border border-slate-800">
                <span className="text-slate-500 text-[8px] uppercase">{localT("borrowed")}:</span> 
                <span className="text-amber-400 font-bold">₹{totalFinanceReceived.toLocaleString()}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 2. FINANCE ANALYTICS */}
      <div className="bg-emerald-950/30 rounded-2xl border border-emerald-900/40 p-4 space-y-3 shadow-md shadow-emerald-950/10">
        <div className="flex items-center justify-between pb-2.5 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-emerald-500/10 rounded-lg text-emerald-400 border border-emerald-500/20">
              <TrendingUp className="w-3.5 h-3.5" />
            </div>
            <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider font-mono">{localT("lending_credit")}</h3>
          </div>
          <span className="text-[9px] font-mono text-slate-500">{localT("interest_portfolios")}</span>
        </div>

        <div className="grid grid-cols-2 gap-2.5 text-xs">
          {/* Interest Earned (Receivable) */}
          <div className="bg-slate-950/80 p-3 rounded-xl border border-emerald-500/10 hover:border-emerald-500/20 transition-colors">
            <div className="text-slate-500 text-[9px] font-mono leading-none flex items-center gap-1 text-emerald-400">
              <ArrowUpRight className="w-3 h-3" />
              <span>{localT("interest_accrued")}</span>
            </div>
            <div className="font-mono font-black text-emerald-400 mt-2 text-sm">₹{totalInterestEarned.toLocaleString()}</div>
            <div className="mt-2 text-[8px] text-slate-500 font-mono">{localT("earned_lent")}</div>
          </div>

          {/* Interest Paid (Cost of Capital) */}
          <div className="bg-slate-950/80 p-3 rounded-xl border border-rose-500/10 hover:border-rose-500/20 transition-colors">
            <div className="text-slate-500 text-[9px] font-mono leading-none flex items-center gap-1 text-rose-450">
              <ArrowDownLeft className="w-3 h-3" />
              <span>{localT("interest_serviced")}</span>
            </div>
            <div className="font-mono font-black text-rose-400 mt-2 text-sm">₹{totalInterestPaid.toLocaleString()}</div>
            <div className="mt-2 text-[8px] text-slate-500 font-mono">{localT("paid_lenders")}</div>
          </div>

          {/* Pending Collections */}
          <div className="bg-slate-950/80 p-3 rounded-xl border border-teal-500/10 hover:border-teal-500/20 transition-colors">
            <div className="text-slate-500 text-[9px] font-mono leading-none tracking-wider text-blue-800">{localT("pending_collections")}</div>
            <div className="font-mono font-black text-blue-700 pending-collections-value mt-2 text-sm">₹{pendingCollections.toLocaleString()}</div>
            <div className="mt-2 text-[8px] text-slate-500 font-mono">{localT("receivables_interest")}</div>
          </div>

          {/* Pending Payments */}
          <div className="bg-slate-950/80 p-3 rounded-xl border border-amber-500/10 hover:border-amber-500/20 transition-colors">
            <div className="text-slate-500 text-[9px] font-mono leading-none tracking-wider text-amber-500/80">{localT("pending_payments")}</div>
            <div className="font-mono font-black text-amber-400 mt-2 text-sm">₹{pendingPayments.toLocaleString()}</div>
            <div className="mt-2 text-[8px] text-slate-500 font-mono">{localT("payables_interest")}</div>
          </div>
        </div>
      </div>

      {/* 3. FAMILY ANALYTICS */}
      <div className="bg-rose-950/35 rounded-2xl border border-rose-900/45 p-4 space-y-3 shadow-md shadow-rose-950/10">
        <div className="flex items-center justify-between pb-2.5 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-rose-500/10 rounded-lg text-rose-455 border border-rose-500/20">
              <Home className="w-3.5 h-3.5" />
            </div>
            <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider font-mono">{localT("family_budgets")}</h3>
          </div>
          <span className="text-[9px] font-mono text-slate-500">{localT("domestic_expenses")}</span>
        </div>

        <div className="bg-slate-950/80 p-3.5 rounded-xl border border-rose-500/10 space-y-3">
          <div className="grid grid-cols-2 gap-4 text-xs">
            <div>
              <span className="text-slate-500 text-[9.5px] font-mono leading-none block uppercase">{localT("cumulative_outlay")}</span>
              <span className="font-mono font-black text-slate-200 mt-1.5 block text-sm">₹{totalFamilyExpenses.toLocaleString()}</span>
            </div>
            <div>
              <span className="text-slate-400 text-[9.5px] font-mono leading-none block uppercase font-bold">{localT("monthly_budget")}</span>
              <span className="font-mono font-black text-rose-400 mt-1.5 block text-sm">₹{monthlyFamilyExpenses.toLocaleString()}</span>
            </div>
          </div>

          {/* Visual Indicator of June usage */}
          <div className="space-y-1">
            <div className="flex justify-between text-[8px] font-mono text-slate-500">
              <span>{localT("monthly_share")}</span>
              <span className="font-bold text-rose-455">{Math.round((monthlyFamilyExpenses / (totalFamilyExpenses || 1)) * 100)}%</span>
            </div>
            <div className="h-2 w-full bg-slate-900 rounded-full overflow-hidden">
              <div className="bg-gradient-to-r from-rose-500 to-amber-500 h-full rounded-full" style={{ width: `${Math.min(100, (monthlyFamilyExpenses / (totalFamilyExpenses || 1)) * 100)}%` }} />
            </div>
          </div>

          {/* Category-wise loop list with colored indicator dots */}
          {categoryExpenses.length > 0 && (
            <div className="pt-2.5 border-t border-slate-800/80 text-[10px] space-y-2">
              <span className="text-[9px] font-mono text-slate-500 uppercase tracking-tight">{localT("active_categories")}:</span>
              <div className="grid grid-cols-2 gap-x-3 gap-y-1.5">
                {categoryExpenses.slice(0, 6).map((c, idx) => {
                  const categoryColors = [
                    "bg-rose-500", "bg-indigo-500", "bg-teal-500", 
                    "bg-amber-500", "bg-emerald-500", "bg-purple-500",
                    "bg-sky-500", "bg-orange-500", "bg-pink-500"
                  ];
                  return (
                    <div key={idx} className="flex justify-between items-center text-slate-300 bg-slate-900/40 px-2 py-1 rounded border border-slate-850/60">
                      <div className="flex items-center gap-1.5">
                        <span className={`inline-block w-2 h-2 rounded-full ${categoryColors[idx % categoryColors.length]}`} />
                        <span className="text-slate-400 font-medium">{c.name}:</span>
                      </div>
                      <span className="font-mono font-bold text-[10.5px] text-slate-200 font-bold">₹{c.amount.toLocaleString()}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 4. HIGH-FIDELITY CHARTS */}
      <div id="dashboard-charts-layout" className="bg-purple-950/20 rounded-2xl border border-purple-900/40 p-4 space-y-3.5 shadow-md shadow-purple-950/10">
        <div className="flex justify-between items-center pb-1 border-b border-slate-800">
          <span className="text-[10px] uppercase font-mono tracking-wider text-slate-400 font-black flex items-center gap-2">
            <PieChart className="w-3.5 h-3.5 text-indigo-400" />
            {localT("live_analytics")}
          </span>
          <span className="text-[9px] font-mono text-slate-500">{localT("interactive")}</span>
        </div>

        {/* Chart Selector Mini-pill-tabs - scrollable on small screens */}
        <div className="tab-bar-scroll flex gap-1.5 bg-slate-950 p-1 rounded-xl text-[9.5px] font-bold font-mono border border-slate-800/80 min-w-0">
          <button 
            type="button" 
            onClick={() => setActiveChartTab("salary")}
            className={`py-1.5 px-2 rounded-lg text-center transition shrink-0 ${activeChartTab === "salary" ? "bg-indigo-650 text-white shadow-sm shadow-indigo-950/80" : "text-slate-400 hover:text-slate-100"}`}
          >
            {localT("salary")}
          </button>
          <button 
            type="button" 
            onClick={() => setActiveChartTab("fuel")}
            className={`py-1.5 px-2 rounded-lg text-center transition shrink-0 ${activeChartTab === "fuel" ? "bg-amber-600 text-white shadow-sm shadow-amber-950/80" : "text-slate-400 hover:text-slate-100"}`}
          >
            {localT("fuel")}
          </button>
          <button 
            type="button" 
            onClick={() => setActiveChartTab("finance")}
            className={`py-1.5 px-2 rounded-lg text-center transition shrink-0 ${activeChartTab === "finance" ? "bg-teal-600 text-white shadow-sm shadow-teal-950/80" : "text-slate-400 hover:text-slate-100"}`}
          >
            {localT("credit")}
          </button>
          <button 
            type="button" 
            onClick={() => setActiveChartTab("family")}
            className={`py-1.5 px-2 rounded-lg text-center transition shrink-0 ${activeChartTab === "family" ? "bg-rose-600 text-white shadow-sm shadow-rose-950/80" : "text-slate-400 hover:text-slate-100"}`}
          >
            {localT("family")}
          </button>
        </div>

        {/* Dynamic Graphic Chart Box */}
        <div className="min-h-[148px] bg-slate-950/80 rounded-xl border border-slate-850 flex flex-col justify-between p-3.5 text-xs relative overflow-hidden shadow-inner">
          
          {activeChartTab === "salary" && (
            <div className="w-full h-full flex flex-col justify-between">
              <div className="flex justify-between text-[9.5px] text-slate-400">
                <span className="font-bold">Workforce Payroll Ratios</span>
                <span className="text-emerald-400 font-bold bg-emerald-950/40 px-1.5 py-0.5 rounded border border-emerald-900/20">Paid ({Math.round(totalSalaryPaid / (totalSalaryPaid + totalSalaryPending || 1) * 100)}%)</span>
              </div>
              
              {/* Graphic Bar Chart representing Paid vs Pending */}
              <div className="space-y-2 py-1.5">
                <div className="flex items-center gap-3">
                  <span className="w-14 text-[8px] font-mono text-slate-500 uppercase tracking-wider">Paid:</span>
                  <div className="flex-1 h-3.5 bg-slate-900/80 rounded-full overflow-hidden flex border border-slate-800">
                    <div className="bg-gradient-to-r from-emerald-500 to-teal-400 h-full rounded-full" style={{ width: `${totalSalaryPaid > 0 ? 100 : 0}%` }} />
                  </div>
                  <span className="text-[10px] font-mono font-bold text-emerald-400 w-16 text-right">₹{totalSalaryPaid.toLocaleString()}</span>
                </div>

                <div className="flex items-center gap-3">
                  <span className="w-14 text-[8px] font-mono text-slate-500 uppercase tracking-wider">Pending:</span>
                  <div className="flex-1 h-3.5 bg-slate-900/80 rounded-full overflow-hidden flex border border-slate-800">
                    <div className="bg-gradient-to-r from-amber-500 to-rose-400 h-full rounded-full" style={{ width: `${totalSalaryPaid + totalSalaryPending > 0 ? (totalSalaryPending / (totalSalaryPaid + totalSalaryPending || 1)) * 100 : 0}%` }} />
                  </div>
                  <span className="text-[10px] font-mono font-bold text-rose-400 w-16 text-right">₹{totalSalaryPending.toLocaleString()}</span>
                </div>
              </div>
              <div className="text-[8px] text-slate-500 text-center font-mono">Payroll distribution metric across dispatch schedules</div>
            </div>
          )}

          {activeChartTab === "fuel" && (
            <div className="w-full h-full flex flex-col justify-between">
              <div className="flex justify-between text-[9.5px] text-slate-450">
                <span className="font-bold">Weekly Fleet Diesel Outlay</span>
                <span className="text-amber-400 font-bold bg-amber-950/40 px-1.5 py-0.5 rounded border border-amber-900/20">₹{totalFuelExpense.toLocaleString()} Spent</span>
              </div>
              {/* Custom SVG Line graph of fuel history with dynamic background gradient fill */}
              <div className="relative flex-1 flex items-end my-1">
                <svg className="absolute inset-0 w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
                  <defs>
                    <linearGradient id="fuelGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#f59e0b" stopOpacity="0.25" />
                      <stop offset="100%" stopColor="#f59e0b" stopOpacity="0" />
                    </linearGradient>
                  </defs>
                  <path d="M 0 90 L 20 70 L 40 85 L 60 40 L 80 50 L 100 15 L 100 100 L 0 100 Z" fill="url(#fuelGradient)" />
                  <path d="M 0 90 L 20 70 L 40 85 L 60 40 L 80 50 L 100 15" fill="none" stroke="#f59e0b" strokeWidth="2.5" strokeLinecap="round" />
                  <circle cx="20" cy="70" r="2.5" fill="#f59e0b" />
                  <circle cx="60" cy="40" r="2.5" fill="#f59e0b" />
                  <circle cx="100" cy="15" r="2.5" fill="#f59e0b" />
                </svg>
              </div>
              <div className="flex justify-between text-[8px] text-slate-500 font-mono">
                <span>01 Jun</span>
                <span>08 Jun</span>
                <span>15 Jun</span>
                <span>22 Jun</span>
                <span>29 Jun</span>
              </div>
            </div>
          )}

          {activeChartTab === "finance" && (
            <div className="w-full h-full flex flex-col justify-between">
              <div className="flex justify-between text-[9.5px] text-slate-400">
                <span className="font-bold">Lending vs Borrowing Ratio</span>
                <span className="text-teal-400 font-bold bg-teal-950/40 px-1.5 py-0.5 rounded border border-teal-900/20">₹{(totalFinanceGiven + totalFinanceReceived).toLocaleString()} Active</span>
              </div>
              
              {/* Double Comparison Bar Chart */}
              <div className="space-y-2 py-1">
                <div>
                  <div className="flex justify-between text-[8px] text-slate-400 font-mono mb-0.5 uppercase tracking-wide">
                    <span>Lent Portfolio:</span>
                    <span className="text-emerald-400 font-bold font-mono">₹{totalFinanceGiven.toLocaleString()}</span>
                  </div>
                  <div className="h-2 w-full bg-slate-900/80 rounded-full overflow-hidden border border-slate-800">
                    <div className="bg-gradient-to-r from-emerald-500 to-teal-400 h-full" style={{ width: `${(totalFinanceGiven / (totalFinanceGiven + totalFinanceReceived || 1)) * 100}%` }} />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-[8px] text-slate-400 font-mono mb-0.5 uppercase tracking-wide">
                    <span>Borrowed Funds:</span>
                    <span className="text-amber-400 font-bold font-mono">₹{totalFinanceReceived.toLocaleString()}</span>
                  </div>
                  <div className="h-2 w-full bg-slate-900/80 rounded-full overflow-hidden border border-slate-800">
                    <div className="bg-gradient-to-r from-amber-500 to-orange-400 h-full" style={{ width: `${(totalFinanceReceived / (totalFinanceGiven + totalFinanceReceived || 1)) * 100}%` }} />
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeChartTab === "family" && (
            <div className="w-full h-full flex flex-col justify-between">
              <div className="flex justify-between text-[9.5px] text-slate-450">
                <span className="font-bold">Active Domestic Budgets Ratio</span>
                <span className="text-rose-455 font-bold bg-rose-950/40 px-1.5 py-0.5 rounded border border-rose-900/20">₹{totalFamilyExpenses.toLocaleString()} Total</span>
              </div>
              
              {/* Pie Segment Bar Chart Representation with proportional indicators */}
              <div className="flex gap-2.5 items-end py-1.5">
                {categoryExpenses.slice(0, 5).map((c, i) => {
                  const widthPct = Math.max(12, Math.round(c.amount / (totalFamilyExpenses || 1) * 100));
                  const colors = ["bg-rose-500", "bg-indigo-500", "bg-teal-500", "bg-amber-500", "bg-purple-500"];
                  return (
                    <div key={i} className="flex-1 flex flex-col items-center">
                      <div className="w-full bg-slate-900/60 rounded-lg p-1.5 border border-slate-850/80 flex flex-col items-center justify-between">
                        <span className="text-[8px] font-mono text-slate-400 font-bold mb-1">{widthPct}%</span>
                        <div className={`w-full h-2 rounded-sm ${colors[i % colors.length]}`} />
                      </div>
                      <span className="text-[7.5px] text-slate-500 truncate w-12 text-center font-mono mt-1 uppercase tracking-tight">{c.name}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

        </div>
      </div>


    </div>
  );
}
