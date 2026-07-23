import React from "react";

export const LentPortfolio: React.FC = () => {
  return (
    <div className="p-4 bg-slate-900 rounded-xl border border-slate-800">
      <h3 className="text-sm font-bold text-slate-200">Loans Given (Lent Portfolio)</h3>
      <p className="text-xs text-slate-400 mt-1">
        This component is integrated inside the main finance dashboard.
      </p>
    </div>
  );
};

export default LentPortfolio;
