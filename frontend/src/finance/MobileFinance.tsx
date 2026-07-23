/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { 
  TrendingUp, 
  TrendingDown, 
  Plus, 
  Trash2, 
  Edit, 
  ArrowUpRight, 
  ArrowDownLeft, 
  Calendar, 
  Percent, 
  DollarSign, 
  User, 
  Activity,
  Calculator,
  CheckCircle,
  HelpCircle,
  ChevronRight,
  Clock,
  Truck
} from "lucide-react";
import { LoanGiven, LoanReceived, Vehicle } from "../types";
import {
  mapLoanGivenFromApi,
  mapLoanReceivedFromApi,
  requestJson,
  toLoanGivenApiPayload,
  toLoanReceivedApiPayload,
} from "../lib/sharedApi";

interface MobileFinanceProps {
  apiBaseUrl: string;
  loansGiven: LoanGiven[];
  setLoansGiven: React.Dispatch<React.SetStateAction<LoanGiven[]>>;
  loansReceived: LoanReceived[];
  setLoansReceived: React.Dispatch<React.SetStateAction<LoanReceived[]>>;
  vehicles?: Vehicle[];
  triggerOnlineSync: (op: string) => void;
  onSharedDataChanged?: () => Promise<void> | void;
}

export default function MobileFinance({
  apiBaseUrl,
  loansGiven,
  setLoansGiven,
  loansReceived,
  setLoansReceived,
  vehicles = [],
  triggerOnlineSync,
  onSharedDataChanged
}: MobileFinanceProps) {
  // Toggle between LENT (Given) and BORROWED (Got) and VEHICLE LOANS
  const [activeFinanceTab, setActiveFinanceTab] = useState<"lent" | "borrowed" | "vehicle">(() => {
    return (localStorage.getItem("srs_active_finance_tab") as any) || "lent";
  });

  React.useEffect(() => {
    localStorage.setItem("srs_active_finance_tab", activeFinanceTab);
  }, [activeFinanceTab]);

  // Form states for LENT (Given)
  const [isLentFormOpen, setIsLentFormOpen] = useState(false);
  const [editingLentId, setEditingLentId] = useState<string | null>(null);
  
  const [lentPerson, setLentPerson] = useState("");
  const [lentMyName, setLentMyName] = useState("Abhiram Ad");
  const [lentAmount, setLentAmount] = useState(15000);
  const [lentIntType, setLentIntType] = useState<"Monthly" | "Yearly" | "Daily">("Monthly");
  const [lentIntPct, setLentIntPct] = useState(2); // e.g. 2% interest
  const [lentStartDate, setLentStartDate] = useState("2026-06-15");
  const [lentDueDate, setLentDueDate] = useState("2026-12-15");
  const [lentCollectionStatus, setLentCollectionStatus] = useState<"Paid" | "Pending">("Pending");
  const [lentCategory, setLentCategory] = useState<string>("Personal");
  const [lentStatus, setLentStatus] = useState<string>("Active");

  // Per-loan calendar states for interest collections
  const [selectedMonthControl, setSelectedMonthControl] = useState<{ loanId: string; monthKey: string; } | null>(null);
  const [viewedYears, setViewedYears] = useState<{ [loanId: string]: number }>({});
  const [deleteConfirmation, setDeleteConfirmation] = useState<{ id: string; name: string; type: "lent" | "borrowed"; } | null>(null);

  const getMonthNameAndYear = (key: string) => {
    const [yearStr, monthStr] = key.split("-");
    const monthIdx = parseInt(monthStr, 10) - 1;
    const monthNamesFull = [
      "January", "February", "March", "April", "May", "June", 
      "July", "August", "September", "October", "November", "December"
    ];
    return `${monthNamesFull[monthIdx] || ""} ${yearStr}`;
  };

  const formatOnlyDate = (dateStr?: string) => {
    if (!dateStr) return "Not Set";
    const parts = dateStr.split("-");
    if (parts.length === 3) {
      return parts[2];
    }
    try {
      const d = new Date(dateStr);
      if (!isNaN(d.getTime())) {
        return String(d.getDate()).padStart(2, '0');
      }
    } catch (e) {
      // ignore
    }
    return dateStr;
  };

  const handleUpdateMonthStatus = (loanId: string, monthKey: string, status?: "Paid" | "Pending" | "Carry Forward") => {
    const current = loansGiven.find(item => item.id === loanId);
    if (!current) return;
    const updatedInts = { ...(current.monthlyInterests || {}) };
    if (status) {
      updatedInts[monthKey] = status;
    } else {
      delete updatedInts[monthKey];
    }
    const next = { ...current, monthlyInterests: updatedInts };
    setLoansGiven(prev => prev.map(item => item.id === loanId ? next : item));
    void persistLoanGiven(next, "PUT")
      .then(() => onSharedDataChanged?.())
      .catch((error) => console.error(error));
    triggerOnlineSync(`Updated Interest for ${monthKey} to ${status || "Cleared"}`);
    setSelectedMonthControl(null);
  };

  const handleUpdateBorrowedMonthStatus = (loanId: string, monthKey: string, status?: "Paid" | "Pending" | "Carry Forward") => {
    const current = loansReceived.find(item => item.id === loanId);
    if (!current) return;
    const updatedInts = { ...(current.monthlyInterests || {}) };
    if (status) {
      updatedInts[monthKey] = status;
    } else {
      delete updatedInts[monthKey];
    }
    const next = { ...current, monthlyInterests: updatedInts };
    setLoansReceived(prev => prev.map(item => item.id === loanId ? next : item));
    void persistLoanReceived(next, "PUT")
      .then(() => onSharedDataChanged?.())
      .catch((error) => console.error(error));
    triggerOnlineSync(`Updated Borrowed Interest for ${monthKey} to ${status || "Cleared"}`);
    setSelectedMonthControl(null);
  };

  const updateDueDate = (start: string, val: number, type: "Month" | "Year") => {
    if (!start) return;
    try {
      const d = new Date(start);
      if (isNaN(d.getTime())) return;
      if (type === "Month") {
        d.setMonth(d.getMonth() + val);
      } else {
        d.setFullYear(d.getFullYear() + val);
      }
      const yyyy = d.getFullYear();
      const mm = String(d.getMonth() + 1).padStart(2, '0');
      const dd = String(d.getDate()).padStart(2, '0');
      setBorrowedDueDate(`${yyyy}-${mm}-${dd}`);
    } catch (e) {
      // ignore
    }
  };

  const isMonthInLoanRange = (year: number, monthIndex: number, startDateStr?: string, dueDateStr?: string) => {
    if (!startDateStr) return true;
    const start = new Date(startDateStr);
    const startY = start.getFullYear();
    const startM = start.getMonth();
    
    let endY = startY;
    let endM = startM + 12; // default 12 months forward
    if (dueDateStr) {
      const due = new Date(dueDateStr);
      endY = due.getFullYear();
      endM = due.getMonth();
    }
    
    const currentVal = year * 12 + monthIndex;
    const startVal = startY * 12 + startM;
    const endVal = endY * 12 + endM;
    
    return currentVal >= startVal && currentVal <= endVal;
  };

  // Form states for BORROWED (Got)
  const [isBorrowedFormOpen, setIsBorrowedFormOpen] = useState(false);
  const [editingBorrowedId, setEditingBorrowedId] = useState<string | null>(null);

  const [borrowedPerson, setBorrowedPerson] = useState("");
  const [borrowedMyName, setBorrowedMyName] = useState("Abhiram Ad");
  const [borrowedAmount, setBorrowedAmount] = useState(50000);
  const [borrowedIntType, setBorrowedIntType] = useState<"Monthly" | "Yearly" | "Daily">("Monthly");
  const [borrowedIntPct, setBorrowedIntPct] = useState(1.5);
  const [borrowedStartDate, setBorrowedStartDate] = useState("2026-06-15");
  const [borrowedDueDate, setBorrowedDueDate] = useState("2027-06-15");
  const [borrowedInterestStatus, setBorrowedInterestStatus] = useState<"Paid" | "Pending">("Pending");
  const [borrowedCategory, setBorrowedCategory] = useState<string>("Personal");
  const [borrowedStatus, setBorrowedStatus] = useState<string>("Active");

  // Vehicle loan specific states
  const [borrowedVehicleId, setBorrowedVehicleId] = useState("");
  const [borrowedTenureValue, setBorrowedTenureValue] = useState<number>(1);
  const [borrowedTenureType, setBorrowedTenureType] = useState<"Month" | "Year">("Year");
  const [borrowedIntInputMode, setBorrowedIntInputMode] = useState<"Percent" | "Flat">("Percent");
  const [borrowedIntFlatAmt, setBorrowedIntFlatAmt] = useState<number>(1000);
  React.useEffect(() => {
    const isAnyFormOpen = isLentFormOpen || isBorrowedFormOpen;

    if (isAnyFormOpen) {
      window.history.pushState({ modalOpen: true, module: "finance" }, "");

      const handlePopState = () => {
        setIsLentFormOpen(false);
        setEditingLentId(null);
        setIsBorrowedFormOpen(false);
        setEditingBorrowedId(null);
      };

      window.addEventListener("popstate", handlePopState);
      return () => {
        window.removeEventListener("popstate", handlePopState);
      };
    } else {
      if (window.history.state?.modalOpen && window.history.state?.module === "finance") {
        window.history.back();
      }
    }
  }, [isLentFormOpen, isBorrowedFormOpen]);

  // Auto calculate interest amounts for display or save
  const calculateInterestVal = (amount: number, pct: number, type: string) => {
    // Basic calculation model
    const interest = Math.round((amount * pct) / 100);
    return interest;
  };

  const persistLoanGiven = async (record: LoanGiven, method: "POST" | "PUT") => {
    const response = await requestJson(
      apiBaseUrl,
      method === "POST" ? "/api/v1/loans/given" : `/api/v1/loans/given/${record.id}`,
      {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(toLoanGivenApiPayload(record)),
      }
    );
    return mapLoanGivenFromApi(response);
  };

  const persistLoanReceived = async (record: LoanReceived, method: "POST" | "PUT") => {
    const response = await requestJson(
      apiBaseUrl,
      method === "POST" ? "/api/v1/loans/received" : `/api/v1/loans/received/${record.id}`,
      {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(toLoanReceivedApiPayload(record)),
      }
    );
    return mapLoanReceivedFromApi(response);
  };

  // --- LENT CRUD HANDLERS ---
  const handleOpenAddLent = () => {
    setEditingLentId(null);
    setLentPerson("");
    setLentMyName("Abhiram Ad");
    setLentAmount(20000);
    setLentIntType("Monthly");
    setLentIntPct(2);
    setLentStartDate("2026-06-15");
    setLentDueDate("2026-12-15");
    setLentCollectionStatus("Pending");
    setLentCategory("Personal");
    setLentStatus("Active");
    setIsLentFormOpen(true);
  };

  const handleOpenEditLent = (l: LoanGiven) => {
    setEditingLentId(l.id);
    setLentPerson(l.personName);
    setLentMyName(l.myName || "Abhiram Ad");
    setLentAmount(l.amountGiven);
    setLentIntType(l.interestType);
    setLentIntPct(l.interestPercentage);
    setLentStartDate(l.startDate);
    setLentDueDate(l.dueDate);
    setLentCollectionStatus(l.collectionStatus);
    setLentCategory(l.category || "Personal");
    setLentStatus(l.status || "Active");
    setIsLentFormOpen(true);
  };

  const handleSaveLent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!lentPerson || !lentAmount) return;

    const computedInterest = calculateInterestVal(lentAmount, lentIntPct, lentIntType);

    const next: LoanGiven = {
      id: editingLentId || `LENT-${Date.now()}`,
      personName: lentPerson,
      myName: lentMyName,
      amountGiven: Number(lentAmount),
      interestType: lentIntType,
      interestPercentage: Number(lentIntPct),
      interestAmount: computedInterest,
      startDate: lentStartDate,
      dueDate: lentDueDate,
      collectionStatus: lentCollectionStatus,
      category: lentCategory,
      status: lentStatus as any,
    };

    try {
      const saved = await persistLoanGiven(next, editingLentId ? "PUT" : "POST");
      setLoansGiven(prev => editingLentId
        ? prev.map(item => item.id === editingLentId ? saved : item)
        : [saved, ...prev]
      );
      await onSharedDataChanged?.();
      triggerOnlineSync(editingLentId ? `UPDATED LENT LEDGER: LENT TO ${lentPerson}` : `LENT OUT HIGH INTEREST LOAN: TO ${lentPerson}`);
      setIsLentFormOpen(false);
    } catch (error) {
      console.error(error);
    }
  };

  const handleDeleteLent = (id: string, name: string) => {
    setDeleteConfirmation({ id, name, type: "lent" });
  };

  const executeDelete = () => {
    if (!deleteConfirmation) return;
    const { id, name, type } = deleteConfirmation;
    if (type === "lent") {
      requestJson(apiBaseUrl, `/api/v1/loans/given/${id}`, { method: "DELETE" })
        .then(async () => {
          setLoansGiven(prev => prev.filter(item => item.id !== id));
          await onSharedDataChanged?.();
          triggerOnlineSync(`DELETED LENT LEDGER ENTRY: TO ${name}`);
        })
        .catch((error) => console.error(error));
    } else if (type === "borrowed") {
      requestJson(apiBaseUrl, `/api/v1/loans/received/${id}`, { method: "DELETE" })
        .then(async () => {
          setLoansReceived(prev => prev.filter(item => item.id !== id));
          await onSharedDataChanged?.();
          triggerOnlineSync(`DELETED BORROWED ARCHIVE ENTRY: FROM ${name}`);
        })
        .catch((error) => console.error(error));
    }
    setDeleteConfirmation(null);
  };

  // --- BORROWED CRUD HANDLERS ---
  const handleOpenAddBorrowed = () => {
    setEditingBorrowedId(null);
    setBorrowedPerson("");
    setBorrowedMyName("Abhiram Ad");
    setBorrowedAmount(100000);
    setBorrowedIntType("Monthly");
    setBorrowedIntPct(1);
    setBorrowedStartDate("2026-06-15");
    setBorrowedDueDate("2027-06-15");
    setBorrowedInterestStatus("Pending");
    setBorrowedCategory("Personal");
    setBorrowedStatus("Active");
    setBorrowedVehicleId("");
    setBorrowedTenureValue(1);
    setBorrowedTenureType("Year");
    setBorrowedIntInputMode("Percent");
    setBorrowedIntFlatAmt(1000);
    setIsBorrowedFormOpen(true);
  };

  const handleOpenAddVehicleLoan = () => {
    setEditingBorrowedId(null);
    setBorrowedPerson("");
    setBorrowedMyName("Abhiram Ad");
    setBorrowedAmount(150000);
    setBorrowedIntType("Monthly");
    setBorrowedIntPct(1.2);
    setBorrowedStartDate(new Date().toISOString().split('T')[0]);
    
    // Default 1 Year tenure
    setBorrowedTenureValue(1);
    setBorrowedTenureType("Year");
    
    const d = new Date();
    d.setFullYear(d.getFullYear() + 1);
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    setBorrowedDueDate(`${yyyy}-${mm}-${dd}`);

    setBorrowedInterestStatus("Pending");
    setBorrowedCategory("Vehicle"); // Preset to Vehicle
    setBorrowedStatus("Active");
    setBorrowedVehicleId(vehicles[0]?.id || "");
    setBorrowedIntInputMode("Percent");
    setBorrowedIntFlatAmt(1800);
    setIsBorrowedFormOpen(true);
  };

  const handleOpenEditBorrowed = (l: LoanReceived) => {
    setEditingBorrowedId(l.id);
    setBorrowedPerson(l.personName || l.lenderName || "");
    setBorrowedMyName(l.myName || "Abhiram Ad");
    setBorrowedAmount(l.amount ?? l.borrowedAmount ?? 0);
    setBorrowedIntType(l.interestType || "Monthly");
    setBorrowedIntPct(l.interestPercentage ?? l.interestRate ?? 0);
    setBorrowedStartDate(l.startDate || "2026-06-15");
    setBorrowedDueDate(l.dueDate || "2027-06-15");
    setBorrowedInterestStatus(l.interestStatus || "Pending");
    setBorrowedCategory(l.category || "Personal");
    setBorrowedStatus(l.status || "Active");
    
    if (l.vehicleId) {
      setBorrowedVehicleId(l.vehicleId);
      if (l.numberOfMonths) {
        if (l.numberOfMonths % 12 === 0) {
          setBorrowedTenureValue(l.numberOfMonths / 12);
          setBorrowedTenureType("Year");
        } else {
          setBorrowedTenureValue(l.numberOfMonths);
          setBorrowedTenureType("Month");
        }
      } else {
        setBorrowedTenureValue(1);
        setBorrowedTenureType("Year");
      }
    } else {
      setBorrowedVehicleId("");
      setBorrowedTenureValue(1);
      setBorrowedTenureType("Year");
    }
    
    // Determine if it was flat amount or percent
    const calculatedFlat = l.interestAmount || 0;
    const computedFromPct = Math.round(((l.amount ?? l.borrowedAmount ?? 0) * (l.interestPercentage ?? l.interestRate ?? 0)) / 100);
    if (calculatedFlat > 0 && calculatedFlat !== computedFromPct) {
      setBorrowedIntInputMode("Flat");
      setBorrowedIntFlatAmt(calculatedFlat);
    } else {
      setBorrowedIntInputMode("Percent");
      setBorrowedIntFlatAmt(calculatedFlat || 1000);
    }
    setIsBorrowedFormOpen(true);
  };

  const handleSaveBorrowed = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!borrowedPerson || !borrowedAmount) return;

    let computedInterest = 0;
    let pct = borrowedIntPct;
    if (borrowedIntInputMode === "Percent") {
      computedInterest = calculateInterestVal(borrowedAmount, borrowedIntPct, borrowedIntType);
    } else {
      computedInterest = borrowedIntFlatAmt;
      pct = Number(((borrowedIntFlatAmt / borrowedAmount) * 100).toFixed(2));
    }

    const next: LoanReceived = {
      id: editingBorrowedId || `BOR-${Date.now()}`,
      personName: borrowedPerson,
      myName: borrowedMyName,
      amount: Number(borrowedAmount),
      interestType: borrowedIntType,
      interestPercentage: pct,
      interestAmount: computedInterest,
      startDate: borrowedStartDate,
      dueDate: borrowedDueDate,
      interestStatus: borrowedInterestStatus,
      category: borrowedCategory,
      status: borrowedStatus as any,
      vehicleId: borrowedCategory === "Vehicle" ? borrowedVehicleId : undefined,
      numberOfMonths: borrowedCategory === "Vehicle" ? (borrowedTenureType === "Year" ? borrowedTenureValue * 12 : borrowedTenureValue) : undefined,
      monthlyInterests: editingBorrowedId ? loansReceived.find(item => item.id === editingBorrowedId)?.monthlyInterests : {},
    };

    try {
      const saved = await persistLoanReceived(next, editingBorrowedId ? "PUT" : "POST");
      setLoansReceived(prev => editingBorrowedId
        ? prev.map(item => item.id === editingBorrowedId ? saved : item)
        : [saved, ...prev]
      );
      await onSharedDataChanged?.();
      triggerOnlineSync(editingBorrowedId ? `UPDATED BORROWED DETAILS: FROM ${borrowedPerson}` : `BORROWED FUNDS ADDITION: FROM ${borrowedPerson}`);
      setIsBorrowedFormOpen(false);
    } catch (error) {
      console.error(error);
    }
  };

  const handleDeleteBorrowed = (id: string, name: string) => {
    setDeleteConfirmation({ id, name, type: "borrowed" });
  };

  // --- LIVE CONSOLIDATED REPORTS COMPUTATION ---
  const totalLentSum = loansGiven.reduce((sum, item) => sum + (item.amountGiven ?? item.loanAmount ?? 0), 0);
  const totalLentInterestEarned = loansGiven.reduce((sum, item) => {
    if (item.interestAmount !== undefined) return sum + item.interestAmount;
    const amt = item.loanAmount ?? 0;
    const rate = item.interestRate ?? 0;
    return sum + (amt * rate) / 100;
  }, 0);
  const pendingCollectionSum = loansGiven
    .filter(item => item.collectionStatus === "Pending" || item.collectionStatus === undefined)
    .reduce((sum, item) => {
      const amt = item.amountGiven ?? item.loanAmount ?? 0;
      const intAmt = item.interestAmount ?? (((item.loanAmount ?? 0) * (item.interestRate ?? 0)) / 100);
      return sum + amt + intAmt;
    }, 0);

  // Split loans received into vehicle and non-vehicle categories
  const vehicleLoans = loansReceived.filter(item => item.category === "Vehicle");
  const nonVehicleLoans = loansReceived.filter(item => item.category !== "Vehicle");

  const totalBorrowedSum = nonVehicleLoans.reduce((sum, item) => sum + (item.amount ?? item.borrowedAmount ?? 0), 0);
  const totalBorrowedInterestPaid = nonVehicleLoans.reduce((sum, item) => {
    if (item.interestAmount !== undefined) return sum + item.interestAmount;
    const amt = item.borrowedAmount ?? 0;
    const rate = item.interestRate ?? 0;
    return sum + (amt * rate) / 100;
  }, 0);
  const outstandingAmountSum = nonVehicleLoans
    .filter(item => item.interestStatus === "Pending" || item.interestStatus === undefined)
    .reduce((sum, item) => {
      const amt = item.amount ?? item.borrowedAmount ?? 0;
      const intAmt = item.interestAmount ?? (((item.borrowedAmount ?? 0) * (item.interestRate ?? 0)) / 100);
      return sum + amt + intAmt;
    }, 0);

  const totalVehicleLoanSum = vehicleLoans.reduce((sum, item) => sum + (item.amount ?? item.borrowedAmount ?? 0), 0);
  const totalVehicleInterestPaid = vehicleLoans.reduce((sum, item) => {
    if (item.interestAmount !== undefined) return sum + item.interestAmount;
    const amt = item.borrowedAmount ?? 0;
    const rate = item.interestRate ?? 0;
    return sum + (amt * rate) / 100;
  }, 0);
  const outstandingVehicleAmountSum = vehicleLoans
    .filter(item => item.interestStatus === "Pending" || item.interestStatus === undefined)
    .reduce((sum, item) => {
      const amt = item.amount ?? item.borrowedAmount ?? 0;
      const intAmt = item.interestAmount ?? (((item.borrowedAmount ?? 0) * (item.interestRate ?? 0)) / 100);
      return sum + amt + intAmt;
    }, 0);

  const activeLoansReceived = activeFinanceTab === "vehicle" ? vehicleLoans : nonVehicleLoans;

  return (
    <div id="mobile-finance-module-root" className="space-y-4">
      
      {/* SEGMENT SWITCHER */}
      <div className="grid grid-cols-3 gap-1.5 bg-slate-900 p-1.5 rounded-xl border border-slate-850">
        <button
          onClick={() => {
            setActiveFinanceTab("lent");
            setIsBorrowedFormOpen(false);
          }}
          style={{ fontFamily: '"Arial Rounded MT Bold", "Arial Rounded MT", Arial, sans-serif' }}
          className={`py-2 rounded-lg text-[12px] font-extrabold uppercase tracking-wide flex items-center justify-center gap-1.5 transition ${
            activeFinanceTab === "lent" ? "bg-emerald-950 text-emerald-400 border border-emerald-900" : "text-slate-400 hover:text-white"
          }`}
        >
          <ArrowUpRight className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>Amount Lent (Given)</span>
        </button>
        <button
          onClick={() => {
            setActiveFinanceTab("borrowed");
            setIsLentFormOpen(false);
          }}
          style={{ fontFamily: '"Arial Rounded MT Bold", "Arial Rounded MT", Arial, sans-serif' }}
          className={`py-2 rounded-lg text-[12px] font-extrabold uppercase tracking-wide flex items-center justify-center gap-1.5 transition ${
            activeFinanceTab === "borrowed" ? "bg-amber-950 text-amber-500 border border-amber-900" : "text-slate-400 hover:text-white"
          }`}
        >
          <ArrowDownLeft className="w-4 h-4 text-amber-500 shrink-0" />
          <span>Amount Got (Borrowed)</span>
        </button>
        <button
          onClick={() => {
            setActiveFinanceTab("vehicle");
            setIsLentFormOpen(false);
            setIsBorrowedFormOpen(false);
          }}
          style={{ fontFamily: '"Arial Rounded MT Bold", "Arial Rounded MT", Arial, sans-serif' }}
          className={`py-2 rounded-lg text-[12px] font-extrabold uppercase tracking-wide flex items-center justify-center gap-1.5 transition ${
            activeFinanceTab === "vehicle" ? "bg-indigo-950 text-indigo-400 border border-indigo-900" : "text-slate-400 hover:text-white"
          }`}
        >
          <Truck className="w-4 h-4 text-indigo-400 shrink-0" />
          <span>Vehicle Loans</span>
        </button>
      </div>

      {/* ======================= REPORT CARD STRIP ======================= */}
      <div className="bg-slate-900 p-3 rounded-xl border border-slate-850 grid grid-cols-3 gap-2 text-center">
        {activeFinanceTab === "lent" ? (
          <>
            <div>
              <span className="text-[8px] font-mono text-slate-500 block uppercase font-bold">Total Given</span>
              <span className="text-[11.5px] text-slate-300 font-bold block mt-0.5">₹{totalLentSum.toLocaleString()}</span>
            </div>
            <div>
              <span className="text-[8px] font-mono text-slate-500 block uppercase font-bold text-emerald-450">Interest Ret</span>
              <span className="text-[11.5px] text-emerald-400 font-bold block mt-0.5">₹{totalLentInterestEarned.toLocaleString()}</span>
            </div>
            <div>
              <span className="text-[8px] font-mono text-slate-500 block uppercase font-bold text-rose-450">Pending collect</span>
              <span className="text-[11.5px] text-rose-400 font-bold block mt-0.5">₹{pendingCollectionSum.toLocaleString()}</span>
            </div>
          </>
        ) : activeFinanceTab === "borrowed" ? (
          <>
            <div>
              <span className="text-[8px] font-mono text-slate-500 block uppercase font-bold">Total Borrowed</span>
              <span className="text-[11.5px] text-slate-300 font-bold block mt-0.5">₹{totalBorrowedSum.toLocaleString()}</span>
            </div>
            <div>
              <span className="text-[8px] font-mono text-slate-500 block uppercase font-bold text-rose-450">Interest Paid</span>
              <span className="text-[11.5px] text-rose-400 font-black block mt-0.5">₹{totalBorrowedInterestPaid.toLocaleString()}</span>
            </div>
            <div>
              <span className="text-[8px] font-mono text-slate-500 block uppercase font-bold text-amber-450">Outstanding</span>
              <span className="text-[11.5px] text-amber-400 font-bold block mt-0.5">₹{outstandingAmountSum.toLocaleString()}</span>
            </div>
          </>
        ) : (
          <>
            <div>
              <span className="text-[8px] font-mono text-slate-500 block uppercase font-bold">Vehicle Debt</span>
              <span className="text-[11.5px] text-slate-300 font-bold block mt-0.5">₹{totalVehicleLoanSum.toLocaleString()}</span>
            </div>
            <div>
              <span className="text-[8px] font-mono text-slate-500 block uppercase font-bold text-rose-450">Interest Paid</span>
              <span className="text-[11.5px] text-rose-400 font-black block mt-0.5">₹{totalVehicleInterestPaid.toLocaleString()}</span>
            </div>
            <div>
              <span className="text-[8px] font-mono text-slate-500 block uppercase font-bold text-indigo-450">Outstanding</span>
              <span className="text-[11.5px] text-indigo-400 font-bold block mt-0.5">₹{outstandingVehicleAmountSum.toLocaleString()}</span>
            </div>
          </>
        )}
      </div>

      {/* ======================= LENT (AMOUNT I GIVEN) LEDGER ======================= */}
      {activeFinanceTab === "lent" && (
        <div className="space-y-3">
          <div className="flex justify-between items-center px-1">
            <span className="text-xs font-mono font-bold text-slate-400 uppercase">Active Lending List</span>
            <button
              onClick={handleOpenAddLent}
              style={{ fontFamily: '"Arial Rounded MT Bold", "Arial Rounded MT", Arial, sans-serif' }}
              className="bg-emerald-600 hover:bg-emerald-500 py-1.5 px-3.5 rounded-full text-xs font-black text-white uppercase tracking-wider flex items-center gap-1 transition cursor-pointer shadow-md"
            >
              <Plus className="w-4 h-4 font-bold" /> + Lend Out
            </button>
          </div>

          {/* LENT FORM */}
          {isLentFormOpen && (
            <form onSubmit={handleSaveLent} className="fixed inset-0 bg-slate-950 z-[120] overflow-y-auto p-4 sm:p-8 animate-fade-in text-xs">
              <div className="w-full max-w-3xl mx-auto space-y-6 text-slate-200 flex flex-col justify-start pb-16">
                <div className="flex justify-between items-center border-b border-slate-800 pb-3">
                  <span className="text-sm font-mono font-bold text-indigo-400 uppercase tracking-wider">
                    {editingLentId ? "Modify Lending terms" : "Record Funds Given Out (Lel)"}
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      setIsLentFormOpen(false);
                      setEditingLentId(null);
                    }}
                    className="text-slate-400 hover:text-slate-200 p-1.5 rounded-lg bg-slate-800 border border-slate-700/60 transition cursor-pointer text-xs font-bold"
                  >
                    ✕
                  </button>
                </div>

              <div className="space-y-2 font-mono text-slate-350">
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-[9px] text-slate-500 block">BORROWER NAME</label>
                    <input
                      type="text"
                      value={lentPerson}
                      onChange={(e) => setLentPerson(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 p-1.5 rounded focus:outline-none focus:border-indigo-500 text-white"
                      placeholder="e.g. Ramesh Naik"
                      required
                    />
                  </div>
                  <div>
                    <label className="text-[9px] text-slate-500 block">AMOUNT LENT (₹)</label>
                    <input
                      type="number"
                      value={lentAmount}
                      onChange={(e) => setLentAmount(Number(e.target.value))}
                      className="w-full bg-slate-950 border border-slate-800 p-1.5 rounded text-white"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-1 grid-y-2">
                  <div>
                    <label className="text-[9px] text-slate-500 block">INTEREST TYPE</label>
                    <select
                      value={lentIntType}
                      onChange={(e) => setLentIntType(e.target.value as any)}
                      className="w-full bg-slate-950 p-1.5 text-[9.5px] text-white rounded"
                    >
                      <option value="Monthly">Monthly</option>
                      <option value="Yearly">Yearly</option>
                      <option value="Daily">Daily</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-[9px] text-slate-500 block">INTEREST %</label>
                    <input
                      type="number"
                      value={lentIntPct}
                      onChange={(e) => setLentIntPct(Number(e.target.value))}
                      className="w-full bg-slate-950 p-1 rounded font-bold text-slate-200"
                    />
                  </div>
                  <div>
                    <label className="text-[9px] text-slate-500 block">MY NAME</label>
                    <input
                      type="text"
                      value={lentMyName}
                      onChange={(e) => setLentMyName(e.target.value)}
                      className="w-full bg-slate-950 p-1 rounded text-slate-400 text-[10px]"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 text-[10px]">
                  <div>
                    <label className="text-[9px] text-slate-500 block">START DATE</label>
                    <input type="date" value={lentStartDate} onChange={(e) => setLentStartDate(e.target.value)} className="w-full bg-slate-950 p-1 rounded font-mono text-slate-350" />
                  </div>
                  <div>
                    <label className="text-[9px] text-slate-500 block">DUE DATE</label>
                    <input type="date" value={lentDueDate} onChange={(e) => setLentDueDate(e.target.value)} className="w-full bg-slate-950 p-1 rounded font-mono text-slate-350" />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 text-[10px]">
                  <div>
                    <label className="text-[9px] text-slate-500 block">LOAN CATEGORY</label>
                    <select
                      value={lentCategory}
                      onChange={(e) => setLentCategory(e.target.value)}
                      className="w-full bg-slate-950 p-1.5 text-[9.5px] text-white rounded font-bold"
                    >
                      <option value="Personal">Personal</option>
                      <option value="Business">Business</option>
                      <option value="Emergency">Emergency</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-[9px] text-slate-500 block">LOAN STATUS</label>
                    <select
                      value={lentStatus}
                      onChange={(e) => setLentStatus(e.target.value)}
                      className="w-full bg-slate-950 p-1.5 text-[9.5px] text-white rounded font-bold"
                    >
                      <option value="Active">Active</option>
                      <option value="Paid">Paid</option>
                      <option value="Defaulted">Defaulted</option>
                    </select>
                  </div>
                </div>

                <div className="p-2 bg-slate-950 rounded border border-slate-850 flex justify-between items-center text-[9px]">
                  <span className="text-slate-500">Auto Interest Amount:</span>
                  <span className="text-emerald-400 font-extrabold">₹{calculateInterestVal(lentAmount, lentIntPct, lentIntType).toLocaleString()} ({lentIntType})</span>
                </div>
              </div>

              <div className="flex gap-2 justify-end pt-1">
                <button type="button" onClick={() => setIsLentFormOpen(false)} className="px-3 bg-slate-950 text-slate-400 py-1 rounded">Cancel</button>
                <button type="submit" className="px-4 bg-emerald-600 text-white font-bold py-1 rounded">Record Lent Ledger</button>
              </div>
              </div>
            </form>
          )}

          {/* LENT LIST */}
          <div className="space-y-2">
            {loansGiven.map(l => (
              <div key={l.id} className="bg-slate-900 p-3 rounded-2xl border border-slate-850 space-y-2">
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="text-xs font-black text-red-500">{l.personName || l.borrowerName || "Lent Loan"}</h4>
                    <p className="text-[8.5px] font-mono text-slate-500">Lender (My Representative): {l.myName || "Abhiram Ad"}</p>
                    <div className="flex gap-1.5 items-center mt-1">
                      <span className="text-[8px] bg-emerald-950 text-emerald-400 font-mono font-bold px-1.5 py-0.2 rounded-md border border-emerald-900/40">
                        {l.interestPercentage ?? l.interestRate ?? 0}% {l.interestType || "Monthly"}
                      </span>
                      <span className="text-[8px] bg-slate-950 text-indigo-400 font-mono px-1.5 py-0.2 rounded font-bold">
                        Int amount: ₹{l.interestAmount ?? (((l.loanAmount ?? 0) * (l.interestRate ?? 0)) / 100)}
                      </span>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-1 shrink-0">
                    <span className="text-[9px] font-bold text-emerald-400 px-2 py-0.5 rounded bg-slate-950 border border-slate-800">
                      ₹{(l.amountGiven ?? l.loanAmount ?? 0).toLocaleString()}
                    </span>
                    <div className="flex items-center gap-1">
                      <span className={`text-[8px] px-1.5 py-0.5 rounded border font-mono font-extrabold uppercase ${
                        (l.category || "Personal").toUpperCase() === "VEHICLE" 
                          ? "badge-vehicle-category" 
                          : "bg-indigo-950 text-indigo-400 border border-indigo-900/40"
                      }`}>
                        {l.category || "Personal"}
                      </span>
                      <span className={`text-[8px] px-1.5 py-0.5 rounded border font-mono font-black uppercase ${
                        (l.status || "Active") === "Paid" 
                          ? "bg-emerald-950 text-emerald-400 border-emerald-900" 
                          : (l.status || "Active") === "Defaulted"
                            ? "bg-rose-950 text-rose-400 border-rose-900 animate-pulse"
                            : "badge-active-status"
                      }`}>
                        {l.status || "Active"}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="bg-slate-950 p-2 rounded-xl grid grid-cols-2 gap-y-1 text-[8.5px] font-mono text-slate-400">
                  <div><span>Lent Date:</span> <span className="text-slate-300 font-semibold">{l.startDate || "2026-06-14"}</span></div>
                  <div><span>Due Date:</span> <span className="text-rose-400 font-semibold">{formatOnlyDate(l.dueDate)}</span></div>
                </div>

                {/* 12-MONTH SEGMENTED CALENDAR FOR INTERESTS */}
                <div className="p-2 ml-0 bg-slate-950/40 border border-slate-850/60 rounded-xl space-y-1.5">
                  <div className="flex justify-between items-center text-[9px] font-mono">
                    <span className="text-slate-400 font-bold uppercase tracking-wider flex items-center gap-1">
                      <Calendar className="w-3 h-3 text-indigo-400" />
                      Interest Calendar (Months)
                    </span>
                    
                    {/* Compact Year Navigation */}
                    <div className="flex items-center gap-1 bg-slate-900 border border-slate-800 rounded px-1 py-0.5 scale-95">
                      <button
                        type="button"
                        onClick={() => {
                          const activeYear = viewedYears[l.id] || (l.startDate ? new Date(l.startDate).getFullYear() : 2026);
                          setViewedYears(prev => ({ ...prev, [l.id]: activeYear - 1 }));
                        }}
                        className="text-slate-500 hover:text-white px-0.5 font-bold transition cursor-pointer"
                        title="Previous Year"
                      >
                        &lt;
                      </button>
                      <span className="text-slate-200 font-bold px-1 text-[8.5px]">
                        {viewedYears[l.id] || (l.startDate ? new Date(l.startDate).getFullYear() : 2026)}
                      </span>
                      <button
                        type="button"
                        onClick={() => {
                          const activeYear = viewedYears[l.id] || (l.startDate ? new Date(l.startDate).getFullYear() : 2026);
                          setViewedYears(prev => ({ ...prev, [l.id]: activeYear + 1 }));
                        }}
                        className="text-slate-500 hover:text-white px-0.5 font-bold transition cursor-pointer"
                        title="Next Year"
                      >
                        &gt;
                      </button>
                    </div>
                  </div>

                  {/* 4x3 Month Grid representation */}
                  <div className="grid grid-cols-4 gap-1">
                    {["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"].map((mName, mIdx) => {
                      const activeYear = viewedYears[l.id] || (l.startDate ? new Date(l.startDate).getFullYear() : 2026);
                      const monthKey = `${activeYear}-${String(mIdx + 1).padStart(2, '0')}`;
                      const savedStatus = l.monthlyInterests?.[monthKey];
                      
                      // Check if within loan active duration range
                      const inRange = isMonthInLoanRange(activeYear, mIdx, l.startDate, l.dueDate);
                      
                      // Determine visual styles based on status
                      let btnClass = "py-1 px-0.5 rounded text-[8.5px] font-bold text-center transition border flex flex-col items-center justify-center cursor-pointer ";
                      let statusText = "Pending";
                      let statusDotColor = "bg-amber-400";
                      
                      if (savedStatus === "Paid") {
                        btnClass += "bg-emerald-950/80 hover:bg-emerald-900/95 border-emerald-800 text-emerald-400";
                        statusText = "Paid";
                        statusDotColor = "bg-emerald-400";
                      } else if (savedStatus === "Pending") {
                        btnClass += "bg-amber-950/80 hover:bg-amber-900/95 border-amber-900 text-amber-500";
                        statusText = "Pending";
                        statusDotColor = "bg-amber-400";
                      } else if (savedStatus === "Carry Forward") {
                        btnClass += "bg-indigo-950/80 hover:bg-indigo-900/95 border-indigo-900 text-indigo-400";
                        statusText = "Carry Fwd";
                        statusDotColor = "bg-indigo-400";
                      } else {
                        // Not set explicitly
                        if (inRange) {
                          btnClass += "bg-slate-900/60 hover:bg-slate-850 border-slate-800 text-slate-400";
                          statusText = "Pending";
                          statusDotColor = "bg-amber-500/60";
                        } else {
                          btnClass += "bg-slate-950/10 text-slate-650 border-dashed border-slate-900/40 opacity-40 hover:opacity-80";
                          statusText = "-";
                          statusDotColor = "bg-slate-800";
                        }
                      }

                      // Check if currently selected for setting status
                      const isSelected = selectedMonthControl?.loanId === l.id && selectedMonthControl?.monthKey === monthKey;
                      if (isSelected) {
                        btnClass += " ring-1 ring-indigo-500 scale-95";
                      }

                      return (
                        <button
                          key={monthKey}
                          type="button"
                          onClick={() => {
                            setSelectedMonthControl({ loanId: l.id, monthKey });
                          }}
                          className={btnClass}
                          title={`Click to set interest status for ${mName} ${activeYear}`}
                        >
                          <span className="uppercase tracking-wide text-[9px]">{mName}</span>
                          <span className="text-[6.5px] font-mono mt-0.5 truncate max-w-full flex items-center gap-0.5 font-normal">
                            <span className={`w-1 h-1 rounded-full ${statusDotColor}`} />
                            {statusText}
                          </span>
                        </button>
                      );
                    })}
                  </div>

                  {/* Inline month controls */}
                  {selectedMonthControl && selectedMonthControl.loanId === l.id && (
                    <div className="mt-1.5 p-1.5 bg-slate-900 border border-slate-800 rounded-lg space-y-1.5 animate-fade-in text-[9px]">
                      <div className="flex justify-between items-center text-slate-400">
                        <span className="font-mono font-bold uppercase text-[7.5px] tracking-wider text-slate-300">
                          Set Status ({getMonthNameAndYear(selectedMonthControl.monthKey)}):
                        </span>
                        <button 
                          type="button" 
                          onClick={() => setSelectedMonthControl(null)}
                          className="text-slate-500 hover:text-white font-bold text-[7px] uppercase tracking-wider bg-slate-950 px-1 py-0.5 rounded cursor-pointer"
                        >
                          ✕ Close
                        </button>
                      </div>
                      <div className="grid grid-cols-3 gap-1">
                        <button
                          type="button"
                          onClick={() => handleUpdateMonthStatus(l.id, selectedMonthControl.monthKey, "Paid")}
                          className="p-1 rounded font-bold text-[8px] bg-emerald-950/90 hover:bg-emerald-900 text-emerald-400 border border-emerald-800/50 transition flex flex-col items-center justify-center cursor-pointer"
                        >
                          <span className="font-extrabold text-[8.5px]">PAID</span>
                          <span className="text-[5.5px] text-emerald-500 font-normal">Settle Int</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => handleUpdateMonthStatus(l.id, selectedMonthControl.monthKey, "Pending")}
                          className="p-1 rounded font-bold text-[8px] bg-amber-950/90 hover:bg-amber-900 text-amber-500 border border-amber-900/50 transition flex flex-col items-center justify-center cursor-pointer"
                        >
                          <span className="font-extrabold text-[8.5px]">PENDING</span>
                          <span className="text-[5.5px] text-amber-500 font-normal">Awaiting</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => handleUpdateMonthStatus(l.id, selectedMonthControl.monthKey, undefined)}
                          className="p-1 rounded font-bold text-[8px] bg-slate-950 hover:bg-slate-800 text-slate-400 border border-slate-850 transition flex flex-col items-center justify-center cursor-pointer"
                        >
                          <span className="font-extrabold text-[8.5px]">CLEAR</span>
                          <span className="text-[5.5px] text-slate-500 font-normal">Reset</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                <div className="pt-2 border-t border-slate-850/60 mt-1 space-y-2">
                  <div className="flex justify-between items-start text-[9.5px]">
                    <div className="flex flex-col space-y-0.5">
                      <span className="font-bold text-emerald-400">Total interest paid: ₹{((Object.values(l.monthlyInterests || {}).filter(val => val === "Paid").length) * (l.interestAmount ?? (((l.loanAmount ?? 0) * (l.interestRate ?? 0)) / 100))).toLocaleString()}</span>
                      <span className="font-bold text-rose-400 text-[8.5px]">
                        Pending Amount: ₹{(() => {
                          if (!l.startDate) return 0;
                          const start = new Date(l.startDate);
                          const startY = start.getFullYear();
                          const startM = start.getMonth();
                          let endY = startY;
                          let endM = startM + 11;
                          if (l.dueDate) {
                            if (l.dueDate.length < 5) {
                              const dayNum = parseInt(l.dueDate) || 15;
                              const dDate = new Date(startY, startM + 12, dayNum);
                              endY = dDate.getFullYear();
                              endM = dDate.getMonth();
                            } else {
                              const due = new Date(l.dueDate);
                              if (!isNaN(due.getTime())) {
                                endY = due.getFullYear();
                                endM = due.getMonth();
                              }
                            }
                          }
                          let pendingCount = 0;
                          const startVal = startY * 12 + startM;
                          const endVal = endY * 12 + endM;
                          const singleInt = l.interestAmount ?? (((l.loanAmount ?? 0) * (l.interestRate ?? 0)) / 100);
                          for (let val = startVal; val <= endVal; val++) {
                            const y = Math.floor(val / 12);
                            const m = val % 12;
                            const monthKey = `${y}-${String(m + 1).padStart(2, '0')}`;
                            const savedStatus = l.monthlyInterests?.[monthKey];
                            if (savedStatus !== "Paid") {
                              pendingCount++;
                            }
                          }
                          return pendingCount * singleInt;
                        })().toLocaleString()}
                      </span>
                    </div>
                    
                    <div className="flex gap-1.5 self-center">
                      <button onClick={() => handleOpenEditLent(l)} className="p-1 bg-slate-950 hover:bg-slate-850 text-slate-400 hover:text-white rounded border border-slate-850">
                        <Edit className="w-3 h-3" />
                      </button>
                      <button onClick={() => handleDeleteLent(l.id, l.personName || l.borrowerName || "Lent Loan")} className="p-1 bg-rose-950/30 text-rose-450 rounded border border-rose-900/40">
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  </div>

                  {/* Settled Option */}
                  <div className="flex items-center justify-between p-1.5 bg-slate-950/80 rounded-xl border border-slate-850/60 text-[9px]">
                    <span className="text-slate-400 font-bold uppercase tracking-wider">Settled Status:</span>
                    <div className="flex gap-1.5">
                      <button
                        type="button"
                        onClick={() => {
                          setLoansGiven(prev => prev.map(item => {
                            if (item.id === l.id) {
                              return { ...item, collectionStatus: "Paid" };
                            }
                            return item;
                          }));
                          triggerOnlineSync(`Marked Loan to ${l.personName || l.borrowerName} as Settled (Paid)`);
                        }}
                        className={`px-2 py-0.5 rounded text-[8px] font-extrabold transition cursor-pointer ${
                          l.collectionStatus === "Paid"
                            ? "bg-emerald-950 text-emerald-400 border border-emerald-800"
                            : "bg-slate-900 text-slate-400 border border-slate-800 hover:text-slate-200"
                        }`}
                      >
                        Settled
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setLoansGiven(prev => prev.map(item => {
                            if (item.id === l.id) {
                              return { ...item, collectionStatus: "Pending" };
                            }
                            return item;
                          }));
                          triggerOnlineSync(`Marked Loan to ${l.personName || l.borrowerName} as Not Settled`);
                        }}
                        className={`px-2 py-0.5 rounded text-[8px] font-extrabold transition cursor-pointer ${
                          l.collectionStatus === "Pending"
                            ? "bg-rose-950 text-rose-400 border border-rose-900"
                            : "bg-slate-900 text-slate-400 border border-slate-850 hover:text-slate-200"
                        }`}
                      >
                        Not Settled
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setLoansGiven(prev => prev.map(item => {
                            if (item.id === l.id) {
                              const { collectionStatus, ...rest } = item;
                              return { ...rest, collectionStatus: undefined };
                            }
                            return item;
                          }));
                          triggerOnlineSync(`Cleared settled status for Loan to ${l.personName || l.borrowerName}`);
                        }}
                        className={`px-2 py-0.5 rounded text-[8px] font-extrabold transition cursor-pointer ${
                          !l.collectionStatus
                            ? "bg-indigo-950 text-indigo-400 border border-indigo-900"
                            : "bg-slate-900 text-slate-400 border border-slate-850 hover:text-slate-200"
                        }`}
                      >
                        Clear
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ======================= BORROWED (AMOUNT I GOT) LEDGER ======================= */}
      {(activeFinanceTab === "borrowed" || activeFinanceTab === "vehicle") && (
        <div className="space-y-3">
          <div className="flex justify-between items-center px-1">
            <span className="text-xs font-mono font-bold text-slate-400 uppercase">
              {activeFinanceTab === "vehicle" ? "Vehicle Loans registry" : "Private Borrowing registry"}
            </span>
            <div className="flex gap-1.5">
              {activeFinanceTab === "vehicle" ? (
                <button
                  onClick={handleOpenAddVehicleLoan}
                  style={{ fontFamily: '"Arial Rounded MT Bold", "Arial Rounded MT", Arial, sans-serif' }}
                  className="bg-orange-700 hover:bg-orange-600 py-1.5 px-3.5 rounded-full text-xs font-black text-white uppercase tracking-wider flex items-center gap-1 transition cursor-pointer shadow-md"
                >
                  <Plus className="w-4 h-4 font-bold" /> + Vehicle Loan
                </button>
              ) : (
                <button
                  onClick={handleOpenAddBorrowed}
                  style={{ fontFamily: '"Arial Rounded MT Bold", "Arial Rounded MT", Arial, sans-serif' }}
                  className="bg-amber-600 hover:bg-amber-550 py-1.5 px-3.5 rounded-full text-xs font-black text-white uppercase tracking-wider flex items-center gap-1 transition cursor-pointer shadow-md"
                >
                  <Plus className="w-4 h-4 font-bold" /> + Borrow
                </button>
              )}
            </div>
          </div>

          {/* BORROWED FORM */}
          {isBorrowedFormOpen && (
            <form onSubmit={handleSaveBorrowed} className="fixed inset-0 bg-slate-950 z-[120] overflow-y-auto p-4 sm:p-8 animate-fade-in text-xs">
              <div className="w-full max-w-3xl mx-auto space-y-6 text-slate-200 flex flex-col justify-start pb-16">
                <div className="flex justify-between items-center border-b border-slate-800 pb-3">
                  <span className="text-sm font-mono font-bold text-indigo-400 uppercase tracking-wider">
                    {editingBorrowedId ? "Modify Borrowed ledger terms" : "Record Borrowed Funds"}
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      setIsBorrowedFormOpen(false);
                      setEditingBorrowedId(null);
                    }}
                    className="text-slate-400 hover:text-slate-200 p-1.5 rounded-lg bg-slate-800 border border-slate-700/60 transition cursor-pointer text-xs font-bold"
                  >
                    ✕
                  </button>
                </div>

              <div className="space-y-2 font-mono text-slate-350">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <div>
                    <label className="text-[9px] text-slate-500 block">LENDER / DEBT OWNER</label>
                    <input
                      type="text"
                      value={borrowedPerson}
                      onChange={(e) => setBorrowedPerson(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 p-1.5 rounded focus:outline-none focus:border-indigo-500 text-white"
                      placeholder="e.g. Union Bank"
                      required
                    />
                  </div>
                  <div>
                    <label className="text-[9px] text-slate-500 block">AMOUNT ENTRUSTED (₹)</label>
                    <input
                      type="number"
                      value={borrowedAmount}
                      onChange={(e) => setBorrowedAmount(Number(e.target.value))}
                      className="w-full bg-slate-950 border border-slate-800 p-1.5 rounded text-white"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-1.5">
                  <div>
                    <label className="text-[9px] text-slate-500 block">INTEREST TYPE</label>
                    <select
                      value={borrowedIntType}
                      onChange={(e) => setBorrowedIntType(e.target.value as any)}
                      className="w-full bg-slate-950 p-1.5 text-[10px] text-white rounded"
                    >
                      <option value="Monthly">Monthly</option>
                      <option value="Yearly">Yearly</option>
                      <option value="Daily">Daily</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="text-[9px] text-slate-500 block">INTEREST ENTRY TYPE</label>
                    <select
                      value={borrowedIntInputMode}
                      onChange={(e) => setBorrowedIntInputMode(e.target.value as "Percent" | "Flat")}
                      className="w-full bg-slate-950 p-1.5 text-[10px] text-white rounded"
                    >
                      <option value="Percent">Percentage %</option>
                      <option value="Flat">Flat Amount (₹)</option>
                    </select>
                  </div>

                  <div>
                    {borrowedIntInputMode === "Percent" ? (
                      <>
                        <label className="text-[9px] text-slate-500 block">INTEREST RATE %</label>
                        <input
                          type="number"
                          step="0.01"
                          value={borrowedIntPct}
                          onChange={(e) => setBorrowedIntPct(Number(e.target.value))}
                          className="w-full bg-slate-950 p-1.5 rounded font-bold text-slate-250"
                        />
                      </>
                    ) : (
                      <>
                        <label className="text-[9px] text-slate-500 block">FLAT INTEREST AMOUNT (₹)</label>
                        <input
                          type="number"
                          value={borrowedIntFlatAmt}
                          onChange={(e) => setBorrowedIntFlatAmt(Number(e.target.value))}
                          className="w-full bg-slate-950 p-1.5 rounded font-bold text-slate-250"
                        />
                      </>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-1.5">
                  <div>
                    <label className="text-[9px] text-slate-500 block">MY NAME</label>
                    <input
                      type="text"
                      value={borrowedMyName}
                      onChange={(e) => setBorrowedMyName(e.target.value)}
                      className="w-full bg-slate-950 p-1.5 rounded text-slate-400 text-[9px]"
                    />
                  </div>

                  <div>
                    <label className="text-[9px] text-slate-500 block">START DATE</label>
                    <input 
                      type="date" 
                      value={borrowedStartDate} 
                      onChange={(e) => {
                        setBorrowedStartDate(e.target.value);
                        updateDueDate(e.target.value, borrowedTenureValue, borrowedTenureType);
                      }} 
                      className="w-full bg-slate-950 p-1 rounded text-slate-350" 
                    />
                  </div>
                  <div>
                    <label className="text-[9px] text-slate-500 block">DUE DATE</label>
                    <input type="date" value={borrowedDueDate} onChange={(e) => setBorrowedDueDate(e.target.value)} className="w-full bg-slate-950 p-1 rounded text-slate-350" />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-1.5">
                  <div>
                    <label className="text-[9px] text-slate-500 block">PAYMENT STATUS</label>
                    <select
                      value={borrowedInterestStatus}
                      onChange={(e) => setBorrowedInterestStatus(e.target.value as any)}
                      className="w-full bg-slate-950 p-1.5 text-[10px] text-white rounded font-bold"
                    >
                      <option value="Pending">PENDING (Unpaid principal/Interest)</option>
                      <option value="Paid">PAID (Debt Closed)</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-[9px] text-slate-500 block">LOAN CATEGORY</label>
                    <select
                      value={borrowedCategory}
                      onChange={(e) => setBorrowedCategory(e.target.value)}
                      className="w-full bg-slate-950 p-1.5 text-[9.5px] text-white rounded font-bold"
                    >
                      <option value="Personal">Personal</option>
                      <option value="Business">Business</option>
                      <option value="Emergency">Emergency</option>
                      <option value="Vehicle">Vehicle</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-[9px] text-slate-500 block">LOAN STATUS</label>
                    <select
                      value={borrowedStatus}
                      onChange={(e) => setBorrowedStatus(e.target.value)}
                      className="w-full bg-slate-950 p-1.5 text-[9.5px] text-white rounded font-bold"
                    >
                      <option value="Active">Active</option>
                      <option value="Paid">Paid</option>
                      <option value="Defaulted">Defaulted</option>
                    </select>
                  </div>
                </div>

                {/* VEHICLE LOAN SPECIFIC DETAILED INPUTS */}
                {borrowedCategory === "Vehicle" && (
                  <div className="bg-slate-950/60 p-2 rounded-lg border border-slate-850/60 space-y-2 mt-1">
                    <span className="text-[8.5px] font-mono font-bold text-indigo-400 uppercase tracking-widest block">
                      Vehicle Loan Configuration
                    </span>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      <div>
                        <label className="text-[9px] text-slate-400 block">SELECT FLEET VEHICLE</label>
                        <select
                          value={borrowedVehicleId}
                          onChange={(e) => setBorrowedVehicleId(e.target.value)}
                          className="w-full bg-slate-900 border border-slate-800 p-1 text-[9.5px] text-white rounded font-mono"
                          required={borrowedCategory === "Vehicle"}
                        >
                          <option value="">-- Choose Vehicle --</option>
                          {vehicles.map(v => (
                            <option key={v.id} value={v.id}>
                              {v.id} ({v.brand} - {v.vehicleName || v.model})
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="text-[9px] text-slate-400 block">TENURE LENGTH</label>
                        <div className="flex gap-1">
                          <input
                            type="number"
                            min="1"
                            value={borrowedTenureValue}
                            onChange={(e) => {
                              const val = Math.max(1, parseInt(e.target.value) || 1);
                              setBorrowedTenureValue(val);
                              updateDueDate(borrowedStartDate, val, borrowedTenureType);
                            }}
                            className="w-1/2 bg-slate-900 border border-slate-800 p-1 text-[9.5px] text-white rounded font-mono font-bold"
                          />
                          <select
                            value={borrowedTenureType}
                            onChange={(e) => {
                              const type = e.target.value as "Month" | "Year";
                              setBorrowedTenureType(type);
                              updateDueDate(borrowedStartDate, borrowedTenureValue, type);
                            }}
                            className="w-1/2 bg-slate-900 border border-slate-800 p-1 text-[9px] text-slate-300 rounded font-mono"
                          >
                            <option value="Month">Month(s)</option>
                            <option value="Year">Year(s)</option>
                          </select>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <div className="flex gap-2 justify-end pt-1">
                <button type="button" onClick={() => setIsBorrowedFormOpen(false)} className="px-3 bg-slate-950 text-slate-400 py-1 rounded">Cancel</button>
                <button type="submit" className="px-4 bg-amber-650 text-white font-extrabold py-1 rounded">Record Funds Received</button>
              </div>
              </div>
            </form>
          )}

          {/* BORROWED LIST */}
          <div className="space-y-2">
            {activeLoansReceived.map(l => (
              <div key={l.id} className="bg-slate-900 p-3 rounded-2xl border border-slate-850 space-y-2">
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="text-xs font-black text-red-500">{l.personName || l.lenderName || "Received Loan"}</h4>
                    <p className="text-[8.5px] font-mono text-slate-500">Receiver (My Nickname): {l.myName || "Abhiram Ad"}</p>
                    <div className="flex gap-1.5 items-center mt-1">
                      <span className="text-[8px] bg-amber-955 text-amber-500 font-mono font-bold px-1.5 py-0.2 rounded-md border border-amber-900/40">
                        {l.interestPercentage ?? l.interestRate ?? 0}% {l.interestType || "Monthly"}
                      </span>
                      <span className="text-[8px] bg-slate-950 text-rose-400 font-mono px-1.5 py-0.2 rounded font-bold">
                        Calculated Int: ₹{l.interestAmount ?? (((l.borrowedAmount ?? 0) * (l.interestRate ?? 0)) / 100)}
                      </span>
                    </div>
                  </div>

                  <div className="flex flex-col items-end gap-1 shrink-0">
                    <span className="text-[9px] font-bold text-emerald-400 px-2 py-0.5 rounded bg-slate-950 border border-slate-800">
                      ₹{(l.amount ?? l.borrowedAmount ?? 0).toLocaleString()}
                    </span>
                    <div className="flex items-center gap-1">
                      <span className={`text-[8px] px-1.5 py-0.5 rounded border font-mono font-extrabold uppercase ${
                        (l.category || "Personal").toUpperCase() === "VEHICLE" 
                          ? "badge-vehicle-category" 
                          : "bg-amber-950/80 text-amber-500 border border-amber-900/40"
                      }`}>
                        {l.category || "Personal"}
                      </span>
                      <span className={`text-[8px] px-1.5 py-0.5 rounded border font-mono font-black uppercase ${
                        (l.status || "Active") === "Paid" 
                          ? "bg-emerald-950 text-emerald-400 border-emerald-900" 
                          : (l.status || "Active") === "Defaulted"
                            ? "bg-rose-950 text-rose-400 border-rose-900 animate-pulse"
                            : "badge-active-status"
                      }`}>
                        {l.status || "Active"}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="bg-slate-950 p-2 rounded-xl grid grid-cols-2 gap-y-1 text-[8.5px] font-mono text-slate-400">
                  <div><span>Loan Date:</span> <span className="text-slate-300 font-semibold">{l.startDate || "2026-06-14"}</span></div>
                  <div><span>Repayment Due:</span> <span className="text-amber-400 font-semibold">{formatOnlyDate(l.dueDate)}</span></div>
                  {l.numberOfMonths && (
                    <div className="col-span-2 mt-0.5 pt-0.5 border-t border-slate-900 flex justify-between">
                      <span>Loan Tenure:</span>
                      <span className="text-indigo-400 font-bold">
                        {l.numberOfMonths % 12 === 0 ? `${l.numberOfMonths / 12} Year(s)` : `${l.numberOfMonths} Month(s)`}
                      </span>
                    </div>
                  )}
                </div>

                {/* SHOW VEHICLE FROM BUSINESS MODULE IF REGISTERED */}
                {l.vehicleId && (() => {
                  const v = vehicles.find(item => item.id === l.vehicleId);
                  return (
                    <div className="bg-indigo-950/40 border border-indigo-900/40 p-2 rounded-xl mt-1.5 space-y-1">
                      <span className="text-[8.5px] text-indigo-400 font-mono font-bold block uppercase tracking-wider">
                        🚚 Tied Vehicle in Fleet
                      </span>
                      <div className="flex justify-between items-center text-[9px] text-slate-300">
                        <span className="vehicle-number-badge font-extrabold text-white font-mono bg-indigo-900/60 px-1.5 py-0.5 rounded">
                          {l.vehicleId}
                        </span>
                        {v ? (
                          <span className="font-medium text-slate-300">
                            {v.brand} {v.model} ({v.vehicleType})
                          </span>
                        ) : (
                          <span className="text-slate-500 italic">Registered vehicle</span>
                        )}
                      </div>
                    </div>
                  );
                })()}

                {/* 12-MONTH SEGMENTED CALENDAR FOR INTEREST PAID ENTRIES */}
                <div className="p-2 ml-0 bg-slate-950/40 border border-slate-850/60 rounded-xl space-y-1.5 mt-2">
                  <div className="flex justify-between items-center text-[9px] font-mono">
                    <span className="text-slate-400 font-bold uppercase tracking-wider flex items-center gap-1">
                      <Calendar className="w-3 h-3 text-indigo-400" />
                      Interest Paid Entry per Month
                    </span>
                    
                    {/* Compact Year Navigation */}
                    <div className="flex items-center gap-1 bg-slate-900 border border-slate-800 rounded px-1 py-0.5 scale-95">
                      <button
                        type="button"
                        onClick={() => {
                          const activeYear = viewedYears[l.id] || (l.startDate ? new Date(l.startDate).getFullYear() : 2026);
                          setViewedYears(prev => ({ ...prev, [l.id]: activeYear - 1 }));
                        }}
                        className="text-slate-500 hover:text-white px-0.5 font-bold transition cursor-pointer"
                        title="Previous Year"
                      >
                        &lt;
                      </button>
                      <span className="text-slate-200 font-bold px-1 text-[8.5px]">
                        {viewedYears[l.id] || (l.startDate ? new Date(l.startDate).getFullYear() : 2026)}
                      </span>
                      <button
                        type="button"
                        onClick={() => {
                          const activeYear = viewedYears[l.id] || (l.startDate ? new Date(l.startDate).getFullYear() : 2026);
                          setViewedYears(prev => ({ ...prev, [l.id]: activeYear + 1 }));
                        }}
                        className="text-slate-500 hover:text-white px-0.5 font-bold transition cursor-pointer"
                        title="Next Year"
                      >
                        &gt;
                      </button>
                    </div>
                  </div>

                  {/* 4x3 Month Grid representation */}
                  <div className="grid grid-cols-4 gap-1">
                    {["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"].map((mName, mIdx) => {
                      const activeYear = viewedYears[l.id] || (l.startDate ? new Date(l.startDate).getFullYear() : 2026);
                      const monthKey = `${activeYear}-${String(mIdx + 1).padStart(2, '0')}`;
                      const savedStatus = l.monthlyInterests?.[monthKey];
                      
                      // Check if within loan active duration range
                      const inRange = isMonthInLoanRange(activeYear, mIdx, l.startDate, l.dueDate);
                      
                      // Determine visual styles based on status
                      let btnClass = "py-1 px-0.5 rounded text-[8.5px] font-bold text-center transition border flex flex-col items-center justify-center cursor-pointer ";
                      let statusText = "Pending";
                      let statusDotColor = "bg-amber-400";
                      
                      if (savedStatus === "Paid") {
                        btnClass += "bg-emerald-950/80 hover:bg-emerald-900/95 border-emerald-800 text-emerald-400";
                        statusText = "Paid";
                        statusDotColor = "bg-emerald-400";
                      } else if (savedStatus === "Pending") {
                        btnClass += "bg-amber-950/80 hover:bg-amber-900/95 border-amber-900 text-amber-500";
                        statusText = "Pending";
                        statusDotColor = "bg-amber-400";
                      } else if (savedStatus === "Carry Forward") {
                        btnClass += "bg-indigo-950/80 hover:bg-indigo-900/95 border-indigo-900 text-indigo-400";
                        statusText = "Carry Fwd";
                        statusDotColor = "bg-indigo-400";
                      } else {
                        // Not set explicitly
                        if (inRange) {
                          btnClass += "bg-slate-900/60 hover:bg-slate-850 border-slate-800 text-slate-400";
                        } else {
                          btnClass += "bg-slate-950/20 border-transparent text-slate-600 cursor-not-allowed opacity-50";
                          statusText = "Inactive";
                          statusDotColor = "bg-slate-700";
                        }
                      }
                      
                      return (
                        <button
                          key={monthKey}
                          type="button"
                          disabled={!inRange}
                          onClick={() => {
                            if (inRange) {
                              setSelectedMonthControl({ loanId: l.id, monthKey });
                            }
                          }}
                          className={btnClass}
                        >
                          <span className="block text-[8px] tracking-tight">{mName}</span>
                          <span className="text-[6.5px] font-normal font-mono flex items-center gap-0.5 mt-0.5">
                            <span className={`w-1 h-1 rounded-full ${statusDotColor}`} />
                            {statusText}
                          </span>
                        </button>
                      );
                    })}
                  </div>

                  {/* Inline month controls for Borrowed Loan */}
                  {selectedMonthControl && selectedMonthControl.loanId === l.id && (
                    <div className="mt-1.5 p-1.5 bg-slate-900 border border-slate-800 rounded-lg space-y-1.5 animate-fade-in text-[9px]">
                      <div className="flex justify-between items-center text-slate-400">
                        <span className="font-mono font-bold uppercase text-[7.5px] tracking-wider text-slate-300">
                          Set Status ({getMonthNameAndYear(selectedMonthControl.monthKey)}):
                        </span>
                        <button 
                          type="button" 
                          onClick={() => setSelectedMonthControl(null)}
                          className="text-slate-500 hover:text-white font-bold text-[7px] uppercase tracking-wider bg-slate-950 px-1 py-0.5 rounded cursor-pointer"
                        >
                          ✕ Close
                        </button>
                      </div>
                      <div className="grid grid-cols-3 gap-1">
                        <button
                          type="button"
                          onClick={() => handleUpdateBorrowedMonthStatus(l.id, selectedMonthControl.monthKey, "Paid")}
                          className="p-1 rounded font-bold text-[8px] bg-emerald-950/90 hover:bg-emerald-900 text-emerald-400 border border-emerald-800/50 transition flex flex-col items-center justify-center cursor-pointer"
                        >
                          <span className="font-extrabold text-[8.5px]">PAID</span>
                          <span className="text-[5.5px] text-emerald-500 font-normal font-mono">Paid Month</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => handleUpdateBorrowedMonthStatus(l.id, selectedMonthControl.monthKey, "Pending")}
                          className="p-1 rounded font-bold text-[8px] bg-amber-950/90 hover:bg-amber-900 text-amber-500 border border-amber-900/50 transition flex flex-col items-center justify-center cursor-pointer"
                        >
                          <span className="font-extrabold text-[8.5px]">PENDING</span>
                          <span className="text-[5.5px] text-amber-500 font-normal font-mono">Unpaid</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => handleUpdateBorrowedMonthStatus(l.id, selectedMonthControl.monthKey, undefined)}
                          className="p-1 rounded font-bold text-[8px] bg-slate-950 hover:bg-slate-800 text-slate-400 border border-slate-850 transition flex flex-col items-center justify-center cursor-pointer"
                        >
                          <span className="font-extrabold text-[8.5px]">CLEAR</span>
                          <span className="text-[5.5px] text-slate-500 font-normal font-mono">Reset</span>
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Summary of Total Interest Paid on this Borrowed Loan */}
                  <div className="text-[9px] font-mono text-slate-400 flex flex-col space-y-1 bg-slate-950 p-1.5 rounded border border-slate-850/60 mt-1">
                    <div className="flex justify-between">
                      <span className="font-bold text-emerald-400">Total interest paid: ₹{((Object.values(l.monthlyInterests || {}).filter(val => val === "Paid").length) * (l.interestAmount ?? (((l.amount ?? l.borrowedAmount ?? 0) * (l.interestPercentage ?? l.interestRate ?? 0)) / 100))).toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-[8px] text-slate-500 border-t border-slate-900 pt-1">
                      <span>Interest status entries:</span>
                      <span>
                        Paid: <strong className="text-emerald-400">{Object.values(l.monthlyInterests || {}).filter(val => val === "Paid").length}</strong> • 
                        Pending: <strong className="text-amber-500">{Object.values(l.monthlyInterests || {}).filter(val => val === "Pending").length}</strong>
                      </span>
                    </div>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-850/60 mt-1 space-y-2">
                  <div className="flex justify-between items-start text-[9.5px]">
                    <div className="flex flex-col space-y-0.5">
                      <span className="font-bold text-amber-500">Clear Amount: ₹{((l.amount ?? l.borrowedAmount ?? 0) + (l.interestAmount ?? (((l.amount ?? l.borrowedAmount ?? 0) * (l.interestPercentage ?? l.interestRate ?? 0)) / 100))).toLocaleString()}</span>
                      <span className="font-bold text-rose-450 text-[8.5px]">
                        Pending Principal: ₹{l.interestStatus === "Paid" ? "0" : (l.amount ?? l.borrowedAmount ?? 0).toLocaleString()}
                      </span>
                    </div>
                    
                    <div className="flex gap-1.5 self-center">
                      <button onClick={() => handleOpenEditBorrowed(l)} className="p-1 bg-slate-950 hover:bg-slate-950 text-slate-400 hover:text-white rounded border border-slate-850">
                        <Edit className="w-3 h-3" />
                      </button>
                      <button onClick={() => handleDeleteBorrowed(l.id, l.personName || l.lenderName || "Received Loan")} className="p-1 bg-rose-950/30 text-rose-450 rounded border border-rose-900/40">
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  </div>

                  {/* Settled Option */}
                  <div className="flex items-center justify-between p-1.5 bg-slate-950/80 rounded-xl border border-slate-850/60 text-[9px]">
                    <span className="text-slate-400 font-bold uppercase tracking-wider">Settled Status:</span>
                    <div className="flex gap-1.5">
                      <button
                        type="button"
                        onClick={() => {
                          setLoansReceived(prev => prev.map(item => {
                            if (item.id === l.id) {
                              return { ...item, interestStatus: "Paid" };
                            }
                            return item;
                          }));
                          triggerOnlineSync(`Marked Borrowed Loan from ${l.personName || l.lenderName} as Settled (Paid)`);
                        }}
                        className={`px-2.5 py-0.5 rounded text-[8px] font-extrabold transition cursor-pointer ${
                          l.interestStatus === "Paid"
                            ? "bg-emerald-950 text-emerald-400 border border-emerald-800"
                            : "bg-slate-900 text-slate-400 border border-slate-800 hover:text-slate-200"
                        }`}
                      >
                        Settled
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setLoansReceived(prev => prev.map(item => {
                            if (item.id === l.id) {
                              return { ...item, interestStatus: "Pending" };
                            }
                            return item;
                          }));
                          triggerOnlineSync(`Marked Borrowed Loan from ${l.personName || l.lenderName} as Not Settled`);
                        }}
                        className={`px-2.5 py-0.5 rounded text-[8px] font-extrabold transition cursor-pointer ${
                          l.interestStatus === "Pending"
                            ? "bg-rose-950 text-rose-400 border border-rose-900"
                            : "bg-slate-900 text-slate-400 border border-slate-800 hover:text-slate-200"
                        }`}
                      >
                        Not Settled
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setLoansReceived(prev => prev.map(item => {
                            if (item.id === l.id) {
                              const { interestStatus, ...rest } = item;
                              return { ...rest, interestStatus: undefined };
                            }
                            return item;
                          }));
                          triggerOnlineSync(`Cleared settled status for Borrowed Loan from ${l.personName || l.lenderName}`);
                        }}
                        className={`px-2.5 py-0.5 rounded text-[8px] font-extrabold transition cursor-pointer ${
                          !l.interestStatus
                            ? "bg-indigo-950 text-indigo-400 border border-indigo-900"
                            : "bg-slate-900 text-slate-400 border border-slate-850 hover:text-slate-200"
                        }`}
                      >
                        Clear
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {deleteConfirmation && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl max-w-sm w-full space-y-4 shadow-xl">
            <div className="flex items-center gap-3 text-rose-400">
              <div className="p-2 bg-rose-950/50 rounded-xl border border-rose-900/50">
                <Trash2 className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-bold text-slate-100 text-sm">Delete Entry?</h3>
                <p className="text-xs text-slate-400">This action cannot be undone.</p>
              </div>
            </div>
            
            <p className="text-xs text-slate-350 bg-slate-950 p-3 rounded-lg border border-slate-855 font-mono">
              Are you sure you want to delete the {deleteConfirmation.type === "lent" ? "Lent Loan" : "Borrowed Loan"} entry for <strong className="text-white">{deleteConfirmation.name}</strong>?
            </p>

            <div className="flex gap-2.5">
              <button
                type="button"
                onClick={() => setDeleteConfirmation(null)}
                className="flex-1 py-2 bg-slate-800 hover:bg-slate-750 text-slate-250 text-xs font-semibold rounded-xl transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={executeDelete}
                className="flex-1 py-2 bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold rounded-xl transition cursor-pointer"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ===== GLOBAL FLOATING ACTION BUTTON (FAB) ===== */}
      {(() => {
        let fabOnClick: (() => void) | null = null;
        let fabColor = "bg-indigo-600 hover:bg-indigo-500 shadow-indigo-900/60";
        let fabTitle = "Add";

        if (activeFinanceTab === "lent") {
          fabOnClick = handleOpenAddLent;
          fabColor = "bg-emerald-600 hover:bg-emerald-500 shadow-emerald-900/60";
          fabTitle = "Lend Out";
        } else if (activeFinanceTab === "borrowed") {
          fabOnClick = handleOpenAddBorrowed;
          fabColor = "bg-amber-600 hover:bg-amber-500 shadow-amber-900/60";
          fabTitle = "Add Borrow";
        } else if (activeFinanceTab === "vehicle") {
          fabOnClick = handleOpenAddVehicleLoan;
          fabColor = "bg-orange-700 hover:bg-orange-600 shadow-orange-900/60";
          fabTitle = "Add Vehicle Loan";
        }

        if (!fabOnClick) return null;

        return (
          <button
            type="button"
            onClick={fabOnClick}
            title={fabTitle}
            className={`fixed bottom-20 right-4 sm:right-6 z-[60] w-14 h-14 rounded-full ${fabColor} active:scale-95 text-white shadow-xl flex items-center justify-center transition-all duration-200 hover:scale-105 border-2 border-white/20`}
          >
            <Plus className="w-7 h-7 stroke-[2.5]" />
          </button>
        );
      })()}

    </div>
  );
}
