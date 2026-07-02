/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { 
  Home, 
  Plus, 
  Trash2, 
  Edit, 
  DollarSign, 
  Calendar, 
  PieChart, 
  User, 
  TrendingUp, 
  Heart, 
  Bookmark, 
  HelpCircle,
  FileCheck2,
  Wallet
} from "lucide-react";
import { FamilyExpense, FamilyMember, IncomeEntry } from "../types";
import { mapExpenseFromApi, requestJson, toExpenseApiPayload } from "../lib/sharedApi";

interface MobileFamilyProps {
  apiBaseUrl: string;
  familyExpenses: FamilyExpense[];
  setFamilyExpenses: React.Dispatch<React.SetStateAction<FamilyExpense[]>>;
  familyMembers: FamilyMember[];
  incomeEntries: IncomeEntry[];
  onSharedDataChanged?: () => Promise<void> | void;
}

export default function MobileFamily({
  apiBaseUrl,
  familyExpenses,
  setFamilyExpenses,
  familyMembers,
  incomeEntries,
  onSharedDataChanged
}: MobileFamilyProps) {
  // Form display and editing states
  const [isExpenseFormOpen, setIsExpenseFormOpen] = useState(false);
  const [editingExpenseId, setEditingExpenseId] = useState<string | null>(null);
  const [deleteConfirmation, setDeleteConfirmation] = useState<{ id: string; name: string } | null>(null);

  const executeDeleteExpense = async () => {
    if (!deleteConfirmation) return;
    try {
      await requestJson(apiBaseUrl, `/api/v1/expenses/${deleteConfirmation.id}`, { method: "DELETE" });
      setFamilyExpenses(prev => prev.filter(item => item.id !== deleteConfirmation.id));
      await onSharedDataChanged?.();
      setDeleteConfirmation(null);
    } catch (error) {
      alert(error instanceof Error ? error.message : "Unable to delete expense");
    }
  };

  // Form input states
  const [memberValue, setMemberValue] = useState("");
  const [expDate, setExpDate] = useState("2026-06-15");
  const [expReason, setExpReason] = useState<FamilyExpense["reason"]>("Food");
  const [expOtherReason, setExpOtherReason] = useState("");
  const [expAmount, setExpAmount] = useState(1500);

  const reasonDropdownOptions: FamilyExpense["reason"][] = [
    "Food", "Education", "Medical", "Shopping", "Travel", "House Rent", 
    "Electricity", "Water Bill", "Internet", "Entertainment", "Other"
  ];

  // --- FAMILY EXPENSES CRUD HANDLERS ---
  const handleOpenAddExpense = () => {
    setEditingExpenseId(null);
    setMemberValue(familyMembers[0]?.name || "Abhiram");
    setExpDate("2026-06-15");
    setExpReason("Food");
    setExpOtherReason("");
    setExpAmount(1200);
    setIsExpenseFormOpen(true);
  };

  const handleOpenEditExpense = (e: FamilyExpense) => {
    setEditingExpenseId(e.id);
    setMemberValue(e.familyMemberName);
    setExpDate(e.date);
    setExpReason(e.reason);
    setExpOtherReason(typeof e.reason === "string" && !reasonDropdownOptions.includes(e.reason as FamilyExpense["reason"]) ? String(e.reason) : "");
    setExpAmount(e.amount);
    setIsExpenseFormOpen(true);
  };

  const handleSaveExpense = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!memberValue || !expAmount) return;
    const resolvedReason = expReason === "Other" ? expOtherReason.trim() || "Other" : expReason;
    const payload: FamilyExpense = editingExpenseId
      ? {
          id: editingExpenseId,
          familyMemberName: memberValue,
          date: expDate,
          reason: resolvedReason,
          amount: Number(expAmount),
        }
      : {
          id: `EXP-${Date.now()}`,
          familyMemberName: memberValue,
          date: expDate,
          reason: resolvedReason,
          amount: Number(expAmount),
        };

    try {
      const response = await requestJson(
        apiBaseUrl,
        editingExpenseId ? `/api/v1/expenses/${editingExpenseId}` : "/api/v1/expenses",
        {
          method: editingExpenseId ? "PUT" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(toExpenseApiPayload(payload)),
        }
      );
      const saved = mapExpenseFromApi(response);
      setFamilyExpenses(prev => editingExpenseId
        ? prev.map(item => item.id === editingExpenseId ? saved : item)
        : [saved, ...prev]
      );
      await onSharedDataChanged?.();
      setIsExpenseFormOpen(false);
    } catch (error) {
      alert(error instanceof Error ? error.message : "Unable to save expense");
    }
  };

  const handleDeleteExpense = (id: string, name: string) => {
    setDeleteConfirmation({ id, name });
  };

  // --- COMPUTE THE DYNAMIC FAMILY REPORTS ---
  const totalIncome = incomeEntries.reduce((sum, i) => sum + i.amount, 0); // ~₹220K
  const totalExpenses = familyExpenses.reduce((sum, e) => sum + e.amount, 0);
  const remainingSavings = totalIncome - totalExpenses;
  const savingsRate = totalIncome > 0 ? Math.round((remainingSavings / totalIncome) * 100) : 0;

  // Monthly Expenses (June 2026)
  const monthlyExpensesTotal = familyExpenses
    .filter(e => e.date.startsWith("2026-06"))
    .reduce((sum, e) => sum + e.amount, 0);

  // Member-wise Expenses
  const uniqueNames = Array.from(new Set(familyExpenses.map(e => e.familyMemberName)));
  const memberExpenses = uniqueNames.map(name => {
    const total = familyExpenses
      .filter(e => e.familyMemberName === name)
      .reduce((sum, e) => sum + e.amount, 0);
    return { name, total };
  });

  // Category-wise Expenses
  const categorySummary = reasonDropdownOptions.map(cat => {
    const total = familyExpenses
      .filter(e => e.reason === cat)
      .reduce((sum, e) => sum + e.amount, 0);
    return { category: cat, total };
  }).filter(c => c.total > 0);

  return (
    <div id="family-expense-module-root" className="space-y-4">
      
      {/* 1. KEY VALUES STRIP */}
      <div className="bg-gradient-to-br from-rose-950/20 to-slate-900 border border-slate-850 p-3 rounded-xl">
        <div className="flex items-center gap-1.5 mb-1.5">
          <Wallet className="w-4 h-4 text-rose-450" />
          <span className="text-[9px] uppercase font-mono tracking-wider font-bold text-slate-500">Family Pot Ledger</span>
        </div>
        
        <div className="grid grid-cols-2 gap-3 text-xs">
          <div>
            <span className="text-slate-500 text-[8px] font-mono leading-none block">TOTAL INCOME SOURCE</span>
            <span className="text-emerald-400 font-extrabold mt-0.5 block">₹{totalIncome.toLocaleString()}</span>
          </div>
          <div>
            <span className="text-slate-500 text-[8px] font-mono leading-none block">TOTAL OUTGOINGS</span>
            <span className="text-rose-400 font-extrabold mt-0.5 block">₹{totalExpenses.toLocaleString()}</span>
          </div>
        </div>

        {/* Savings Analysis Bar */}
        <div className="mt-3 pt-2.5 border-t border-slate-850/60 text-[9px] font-mono space-y-1">
          <div className="flex justify-between text-slate-400">
            <span>SAVINGS RATIO ANALYSIS:</span>
            <span className="text-teal-400 font-bold">₹{remainingSavings.toLocaleString()} ({savingsRate}% Left)</span>
          </div>
          <div className="h-2 bg-slate-950 rounded-full overflow-hidden">
            <div 
              className="bg-gradient-to-r from-emerald-500 to-teal-400 h-full rounded-full" 
              style={{ width: `${Math.max(10, Math.min(100, savingsRate))}%` }} 
            />
          </div>
        </div>
      </div>

      {/* 2. REASON AND DETAILS ENTRY FORM */}
      <div className="space-y-3">
        <div className="flex justify-between items-center px-1">
          <span className="text-xs font-mono font-bold text-slate-400 uppercase">Expense Logbook</span>
          <button
            onClick={handleOpenAddExpense}
            className="bg-rose-600 hover:bg-rose-500 py-1 px-2.5 rounded-lg text-[9px] font-bold text-white uppercase tracking-wider flex items-center gap-0.5 animate-pulse"
          >
            <Plus className="w-3.5 h-3.5" /> Add Expense (+)
          </button>
        </div>

        {isExpenseFormOpen && (
          <form onSubmit={handleSaveExpense} className="bg-slate-900 border border-slate-800 p-3 rounded-xl space-y-3 text-xs">
            <span className="text-[10px] font-mono font-black text-rose-400 block uppercase">
              {editingExpenseId ? "Edit Outflow entry" : "Add Family Expense Outflow"}
            </span>

            <div className="space-y-2 font-mono">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[9px] text-slate-500 block">FAMILY MEMBER</label>
                  <input
                    value={memberValue}
                    onChange={(e) => setMemberValue(e.target.value)}
                    placeholder="Enter name"
                    className="w-full bg-slate-950 border border-slate-800 p-1 text-[10px] text-white rounded"
                  />
                </div>
                <div>
                  <label className="text-[9px] text-slate-500 block">AMOUNT VALUE (₹)</label>
                  <input
                    type="number"
                    value={expAmount}
                    onChange={(e) => setExpAmount(Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-800 p-1 text-[10px] text-white rounded font-bold"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[9px] text-slate-500 block">REASON SPENT Category</label>
                  <select
                    value={expReason}
                    onChange={(e) => setExpReason(e.target.value as any)}
                    className="w-full bg-slate-950 border border-slate-800 p-1 text-[10px] text-white rounded"
                  >
                    {reasonDropdownOptions.map(r => (
                      <option key={r} value={r}>{r}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-[9px] text-slate-500 block">DATE OF PAY</label>
                  <input
                    type="date"
                    value={expDate}
                    onChange={(e) => setExpDate(e.target.value)}
                    className="w-full bg-slate-950 p-1 text-[10px] rounded text-slate-300"
                  />
                </div>
              </div>

              {expReason === "Other" && (
                <div>
                  <label className="text-[9px] text-slate-500 block">OTHER REASON</label>
                  <input
                    type="text"
                    value={expOtherReason}
                    onChange={(e) => setExpOtherReason(e.target.value)}
                    placeholder="Enter reason"
                    className="w-full bg-slate-950 border border-slate-800 p-1 text-[10px] text-white rounded"
                  />
                </div>
              )}
            </div>

            <div className="flex gap-2 justify-end pt-1">
              <button type="button" onClick={() => setIsExpenseFormOpen(false)} className="px-3 bg-slate-950 text-slate-400 py-1 rounded">Cancel</button>
              <button type="submit" className="px-4 bg-rose-650 text-white font-bold py-1 rounded">Save Expense</button>
            </div>
          </form>
        )}

        {/* 3. LIST FLUID OUTFLOW ENTRIES */}
        <div className="space-y-2">
          {familyExpenses.map(e => (
            <div key={e.id} className="bg-slate-900 border border-slate-850 p-2.5 rounded-xl flex items-center justify-between text-xs transition hover:border-rose-900/40">
              <div className="min-w-0 pr-2">
                <span className="text-[8.5px] font-mono text-slate-500 block">Member: {e.familyMemberName} • {e.date}</span>
                <span className="font-bold text-slate-200 block">{e.reason}</span>
              </div>

              <div className="flex items-center gap-3">
                <span className="font-black text-rose-400 font-mono">₹{e.amount}</span>
                
                <div className="flex gap-1">
                  <button onClick={() => handleOpenEditExpense(e)} className="p-1 bg-slate-950 text-slate-500 hover:text-white rounded">
                    <Edit className="w-3 h-3" />
                  </button>
                  <button onClick={() => handleDeleteExpense(e.id, `${e.reason} (₹${e.amount})`)} className="p-1 bg-rose-950/20 text-rose-450 rounded">
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 4. ANALYTICS REPORTS ACCORDION BOXES */}
      <div className="bg-slate-900 border border-slate-850 rounded-2xl p-3.5 space-y-3">
        <span className="text-[10px] uppercase font-mono font-black text-slate-400 block tracking-tight">Analytical Outflow Reports</span>
        
        {/* A. Member Wise Expenses */}
        <div className="space-y-1.5 pt-1 text-[9.5px]">
          <span className="text-[8.5px] text-slate-500 font-mono font-bold block uppercase tracking-wider">A. MEMBER-WISE EXPENSES:</span>
          <div className="grid grid-cols-2 gap-2 text-slate-350">
            {memberExpenses.map((m, idx) => (
              <div key={idx} className="bg-slate-950 p-1.5 rounded flex justify-between">
                <span className="truncate w-14 text-slate-500 font-sans">{m.name}:</span>
                <span className="font-bold font-mono text-rose-400/90">₹{m.total}</span>
              </div>
            ))}
          </div>
        </div>

        {/* B. Monthly Expenses */}
        <div className="space-y-1 text-[9.5px] border-t border-slate-850/60 pt-2.5">
          <span className="text-[8.5px] text-slate-500 font-mono font-bold block uppercase">B. MONTHLY EXPENSES:</span>
          <div className="flex justify-between items-center bg-slate-950 p-2 rounded">
            <span className="font-semibold text-slate-400">Total Spent (June 2026):</span>
            <span className="text-rose-450 font-black font-mono">₹{monthlyExpensesTotal.toLocaleString()}</span>
          </div>
        </div>

        {/* C. Category Wise Expenses */}
        <div className="space-y-1.5 border-t border-slate-850/60 pt-2.5 text-[9.5px]">
          <span className="text-[8.5px] text-slate-500 font-mono font-bold block uppercase">C. CATEGORY-WISE EXPENSES:</span>
          <div className="grid grid-cols-2 gap-2 font-mono">
            {categorySummary.map((c, idx) => (
              <div key={idx} className="flex justify-between text-slate-350 bg-slate-950 p-1 rounded">
                <span className="text-slate-500 text-[8.5px]">{c.category}:</span>
                <span className="font-bold">₹{c.total.toLocaleString()}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {deleteConfirmation && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in font-sans">
          <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl max-w-sm w-full space-y-4 shadow-xl">
            <div className="flex items-center gap-3 text-rose-400">
              <div className="p-2 bg-rose-950/50 rounded-xl border border-rose-900/50">
                <Trash2 className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-bold text-slate-100 text-sm">Delete Expense?</h3>
                <p className="text-xs text-slate-400">This action cannot be undone.</p>
              </div>
            </div>
            
            <p className="text-xs text-slate-355 bg-slate-950 p-3 rounded-lg border border-slate-855 font-mono leading-relaxed">
              Are you sure you want to delete the expense entry <strong className="text-white">'{deleteConfirmation.name}'</strong>?
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
                onClick={() => void executeDeleteExpense()}
                className="flex-1 py-2 bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold rounded-xl transition cursor-pointer"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
