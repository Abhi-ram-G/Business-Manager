import React from "react";

interface AddDriversProps {
  onRegisterDriver?: (data: any) => void;
}

export const AddDrivers: React.FC<AddDriversProps> = () => {
  return (
    <div className="p-4 bg-slate-900 rounded-xl border border-slate-800">
      <h3 className="text-sm font-bold text-slate-200">Register New Driver Form</h3>
      <p className="text-xs text-slate-400 mt-1">
        This component is integrated inside the main business dashboard workspace registry.
      </p>
    </div>
  );
};

export default AddDrivers;
