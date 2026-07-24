import React from "react";
import { translateText } from "../../utils/translate";

interface BusinessReportsProps {
  language?: "en" | "ta";
}

export const BusinessReports: React.FC<BusinessReportsProps> = ({ language }) => {
  const t = (txt: string) => translateText(txt, language);
  return (
    <div className="p-4 bg-slate-900 rounded-xl border border-slate-800">
      <h3 className="text-sm font-bold text-slate-200">
        {t("Business Operational & Auditing Reports")}
      </h3>
      <p className="text-xs text-slate-400 mt-1">
        {t("This component is integrated inside the main business dashboard workspace registry.")}
      </p>
    </div>
  );
};

export default BusinessReports;
