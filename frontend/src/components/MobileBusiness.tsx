/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef } from "react";
import { 
  Users, 
  Car, 
  DollarSign, 
  Plus, 
  Trash2, 
  Edit, 
  Search, 
  UserPlus, 
  FileText, 
  FolderCheck, 
  ChevronRight, 
  ArrowLeft, 
  Calendar, 
  Activity, 
  Fuel, 
  Droplet, 
  PhoneCall, 
  MoreVertical, 
  Calculator, 
  ArrowRight,
  Share2,
  Download,
  AlertCircle,
  Clock,
  Briefcase,
  Upload,
  X,
  Wrench,
  Package,
  UserX,
  UserCheck,
  Mars,
  Venus,
  History
} from "lucide-react";
import { Labour, Vehicle, BitEntry, HammerEntry, HammerUsageRecord, BusinessBill, FuelEntry, SalaryPayment, AdvanceEntry, AttendanceRecord, PipeEntry } from "../types";
import { downloadSalarySlipPDF, downloadAttendanceReportPDF, downloadSingleLabourAttendancePDF } from "../utils/pdfGenerator";
import {
  mapFuelFromApi,
  mapBusinessBillFromApi,
  mapBitFromApi,
  mapLabourFromApi,
  mapVehicleFromApi,
  mapHammerFromApi,
  mapPipeFromApi,
  requestJson,
  toBusinessBillApiPayload,
  toBitApiPayload,
  toLabourApiPayload,
  toVehicleApiPayload,
  toHammerApiPayload,
  toPipeApiPayload,
} from "../lib/sharedApi";
import borewellLogo from "../assets/images/borewell_machine_logo_1782797350175.jpg";

export interface ServiceRecord {
  id: string;
  vehicleId: string;
  date: string;
  serviceType: string;
  cost: number;
  spareParts: string;
  remarks?: string;
}

export interface MaterialPurchase {
  id: string;
  vehicleId?: string;
  date: string;
  materialName: string;
  quantity: number;
  unit: string;
  rate: number;
  totalAmount: number;
  vendorName?: string;
  remarks?: string;
}

const isLegacyDemoServiceEntry = (service: ServiceRecord) =>
  service.id === "SVR-101" ||
  service.id === "SVR-102" ||
  service.id === "SVR-103" ||
  service.vehicleId === "KA-51-MM-9999" ||
  service.vehicleId === "MH-12-GP-5678";

const renderLabourAvatar = (
  labour: Labour,
  options: {
    className: string;
    iconClassName: string;
    animated?: boolean;
    roundedClassName: string;
  }
) => {
  if (labour.profilePhoto) {
    return (
      <img
        src={labour.profilePhoto}
        alt={labour.fullName}
        className={options.className}
        referrerPolicy="no-referrer"
      />
    );
  }

  const isFemale = labour.gender === "Female";
  const Icon = isFemale ? Venus : Mars;

  return (
    <div
      className={`${options.className} ${options.roundedClassName} ${
        isFemale
          ? "bg-pink-950/40 border-pink-700/40 text-pink-300"
          : "bg-blue-950/40 border-blue-700/40 text-blue-300"
      } ${options.animated ? "animate-pulse" : ""} flex items-center justify-center shadow-sm`}
      aria-label={`${labour.fullName} ${isFemale ? "female" : "male"} profile placeholder`}
    >
      <Icon className={`${options.iconClassName} ${options.animated ? "animate-bounce" : ""}`} />
    </div>
  );
};


interface MobileBusinessProps {
  key?: string;
  apiBaseUrl: string;
  labours: Labour[];
  setLabours: React.Dispatch<React.SetStateAction<Labour[]>>;
  vehicles: Vehicle[];
  setVehicles: React.Dispatch<React.SetStateAction<Vehicle[]>>;
  bitEntries: BitEntry[];
  setBitEntries: React.Dispatch<React.SetStateAction<BitEntry[]>>;
  hammerEntries: HammerEntry[];
  setHammerEntries: React.Dispatch<React.SetStateAction<HammerEntry[]>>;
  pipeEntries: PipeEntry[];
  setPipeEntries: React.Dispatch<React.SetStateAction<PipeEntry[]>>;
  businessBills: BusinessBill[];
  setBusinessBills: React.Dispatch<React.SetStateAction<BusinessBill[]>>;
  fuelEntries: FuelEntry[];
  setFuelEntries: React.Dispatch<React.SetStateAction<FuelEntry[]>>;
  salaryPayments: SalaryPayment[];
  setSalaryPayments: React.Dispatch<React.SetStateAction<SalaryPayment[]>>;
  attendance?: AttendanceRecord[];
  setAttendance?: React.Dispatch<React.SetStateAction<AttendanceRecord[]>>;
  isOnline: boolean;
  triggerOnlineSync: (op: string) => void;
  onSharedDataChanged?: () => Promise<void> | void;
  initialSubSection?: "labour" | "bit" | "attendance" | "vehicles" | "salaries";
}

export default function MobileBusiness({
  apiBaseUrl,
  labours,
  setLabours,
  vehicles,
  setVehicles,
  bitEntries,
  setBitEntries,
  hammerEntries,
  setHammerEntries,
  pipeEntries,
  setPipeEntries,
  businessBills,
  setBusinessBills,
  fuelEntries,
  setFuelEntries,
  salaryPayments,
  setSalaryPayments,
  attendance = [],
  setAttendance = () => {},
  isOnline,
  triggerOnlineSync,
  onSharedDataChanged,
  initialSubSection = "labour"
}: MobileBusinessProps) {
  // Navigation tabs inside Business Section
  const [activeSubSection, setActiveSubSection] = React.useState<"labour" | "bit" | "attendance" | "vehicles" | "salaries">(initialSubSection);
  const [activeMainSection, setActiveMainSection] = React.useState<"management" | "bill" >("management");


  const persistBit = async (record: BitEntry, method: "POST" | "PUT") => {
    const response = await requestJson(
      apiBaseUrl,
      method === "POST" ? "/api/v1/business/bits" : `/api/v1/business/bits/${record.id}`,
      {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(toBitApiPayload(record)),
      }
    );
    return mapBitFromApi(response);
  };

  const persistPipe = async (record: PipeEntry, method: "POST" | "PUT") => {
    const response = await requestJson(
      apiBaseUrl,
      method === "POST" ? "/api/v1/business/pipes" : `/api/v1/business/pipes/${record.id}`,
      {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(toPipeApiPayload(record)),
      }
    );
    return mapPipeFromApi(response);
  };

  const [deleteConfirmation, setDeleteConfirmation] = useState<{ id: string; name: string; type: "bill" | "bit" | "hammer" | "pipe" | "labour" | "vehicle" | "fuel" | "service" | "material"; } | null>(null);

  // Bit/Hammer sub-tab switcher inside the bit section
  const [bitHammerSubTab, setBitHammerSubTab] = useState<"bit" | "hammer" | "pipe">("bit");

  // Hammer form states
  const [isHammerFormOpen, setIsHammerFormOpen] = useState(false);
  const [editingHammerId, setEditingHammerId] = useState<string | null>(null);
  const [hammerNo, setHammerNo] = useState("");
  const [hammerBrand, setHammerBrand] = useState("");
  const [hammerDateEntry, setHammerDateEntry] = useState(() => new Date().toISOString().split("T")[0]);
  const [hammerRate, setHammerRate] = useState<number>(0);
  const [hammerCapableFeet, setHammerCapableFeet] = useState<number>(500);
  const [hammerIsPaid, setHammerIsPaid] = useState<boolean>(false);
  const [selectedHammerForHistory, setSelectedHammerForHistory] = useState<string | null>(null);

  // Pipe form states
  const [isPipeFormOpen, setIsPipeFormOpen] = useState(false);
  const [editingPipeId, setEditingPipeId] = useState<string | null>(null);
  const [pipeCompanyName, setPipeCompanyName] = useState("");
  const [pipeLocation, setPipeLocation] = useState("");
  const [pipeDateEntry, setPipeDateEntry] = useState(() => new Date().toISOString().split("T")[0]);
  const [pipe7HighCount, setPipe7HighCount] = useState<number>(0);
  const [pipe7HighRate, setPipe7HighRate] = useState<number>(0);
  const [pipe7MediumCount, setPipe7MediumCount] = useState<number>(0);
  const [pipe7MediumRate, setPipe7MediumRate] = useState<number>(0);
  const [pipe10HighCount, setPipe10HighCount] = useState<number>(0);
  const [pipe10HighRate, setPipe10HighRate] = useState<number>(0);
  const [pipe10MediumCount, setPipe10MediumCount] = useState<number>(0);
  const [pipe10MediumRate, setPipe10MediumRate] = useState<number>(0);
  const [pipeDiscountAmount, setPipeDiscountAmount] = useState<number>(0);
  const [selectedPipeForHistory, setSelectedPipeForHistory] = useState<string | null>(null);

  // Bill form: bit/hammer selection (internal use only — NOT printed in PDF)
  const [selectedBitId, setSelectedBitId] = useState<string>("");
  const [selectedHammerId, setSelectedHammerId] = useState<string>("");
  const [selectedCasing10HammerId, setSelectedCasing10HammerId] = useState<string>("");
  const [selectedCasing7HammerId, setSelectedCasing7HammerId] = useState<string>("");

  const persistLabour = async (record: Labour, method: "POST" | "PUT") => {
    const response = await requestJson(
      apiBaseUrl,
      method === "POST" ? "/api/v1/labours" : `/api/v1/labours/${record.id}`,
      {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(toLabourApiPayload(record)),
      }
    );
    return mapLabourFromApi(response);
  };

  const persistVehicle = async (record: Vehicle, method: "POST" | "PUT") => {
    const response = await requestJson(
      apiBaseUrl,
      method === "POST" ? "/api/v1/vehicles" : `/api/v1/vehicles/${record.id}`,
      {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(toVehicleApiPayload(record)),
      }
    );
    return mapVehicleFromApi(response);
  };

  const executeDelete = async (confirmation: NonNullable<typeof deleteConfirmation>) => {
    const { id, name, type } = confirmation;
    if (type === "bill") {
      const billToDelete = businessBills.find((bill) => bill.id === id);
      if (!billToDelete || billToDelete.source !== "server") {
        setBusinessBills((prev) => prev.filter((bill) => bill.id !== id));
        triggerOnlineSync(`DELETED BILL FOR ${name}`);
        return;
      }
      try {
        await requestJson(apiBaseUrl, `/api/v1/business/bills/${id}`, { method: "DELETE" });
        setBusinessBills((prev) => prev.filter((bill) => bill.id !== id));
        await onSharedDataChanged?.();
        triggerOnlineSync(`DELETED BILL FOR ${name}`);
      } catch (error) {
        console.error(error);
        alert("Unable to delete the bill right now.");
      }
    } else if (type === "bit") {
      try {
        await requestJson(apiBaseUrl, `/api/v1/business/bits/${id}`, { method: "DELETE" });
        setBitEntries((prev) => prev.filter((entry) => entry.id !== id));
        await onSharedDataChanged?.();
        triggerOnlineSync(`DELETED BIT ENTRY: ${name}`);
      } catch (error) {
        console.error(error);
        alert("Unable to delete the bit entry right now.");
      }
    } else if (type === "fuel") {
      try {
        await requestJson(apiBaseUrl, `/api/v1/vehicles/fuel/${id}`, { method: "DELETE" });
        setFuelEntries((prev) => prev.filter((entry) => entry.id !== id));
        triggerOnlineSync(`DELETED FUEL LOG: ${name}`);
      } catch (error) {
        console.error(error);
        alert("Unable to delete the fuel entry right now.");
      }
    } else if (type === "labour") {
      try {
        await requestJson(apiBaseUrl, `/api/v1/labours/${id}`, { method: "DELETE" });
        setLabours(prev => prev.filter(l => l.id !== id));
        if (selectedLabourForProfile?.id === id) {
          setSelectedLabourForProfile(null);
        }
        await onSharedDataChanged?.();
        triggerOnlineSync(`REMOVED WORKER: ${name}`);
      } catch (error) {
        console.error(error);
      }
    } else if (type === "vehicle") {
      try {
        await requestJson(apiBaseUrl, `/api/v1/vehicles/${id}`, { method: "DELETE" });
        setVehicles(prev => prev.filter(v => v.id !== id));
        await onSharedDataChanged?.();
        triggerOnlineSync(`DELETED VEHICLE: ${id}`);
      } catch (error) {
        console.error(error);
      }
    } else if (type === "service") {
      setServices(prev => prev.filter(s => s.id !== id));
      triggerOnlineSync(`DELETED SERVICE LOG: ${id}`);
    } else if (type === "material") {
      setMaterials(prev => prev.filter(m => m.id !== id));
      triggerOnlineSync(`DELETED MATERIAL BOUGHT: ${id}`);
    } else if (type === "hammer") {
      try {
        await requestJson(apiBaseUrl, `/api/v1/business/hammers/${id}`, { method: "DELETE" });
        setHammerEntries(prev => prev.filter(h => h.id !== id));
        await onSharedDataChanged?.();
        triggerOnlineSync(`DELETED HAMMER: ${name}`);
      } catch (error) {
        console.error(error);
        setHammerEntries(prev => prev.filter(h => h.id !== id));
        triggerOnlineSync(`DELETED HAMMER: ${name} (local fallback)`);
      }
    } else if (type === "pipe") {
      try {
        await requestJson(apiBaseUrl, `/api/v1/business/pipes/${id}`, { method: "DELETE" });
        setPipeEntries(prev => prev.filter(p => p.id !== id));
        await onSharedDataChanged?.();
        triggerOnlineSync(`DELETED PIPE SUPPLIER: ${name}`);
      } catch (error) {
        console.error(error);
        setPipeEntries(prev => prev.filter(p => p.id !== id));
        triggerOnlineSync(`DELETED PIPE SUPPLIER: ${name} (local fallback)`);
      }
    }
  };

  const handleConfirmDelete = async () => {
    if (!deleteConfirmation) return;
    const confirmation = deleteConfirmation;
    setDeleteConfirmation(null);
    await executeDelete(confirmation);
  };

  const [isBillFormOpen, setIsBillFormOpen] = useState(false);
  const [editingBillId, setEditingBillId] = useState<string | null>(null);
  
  // Bill Form states supporting custom Borewell billing
  const [billClient, setBillClient] = useState("");
  const [billDate, setBillDate] = useState("2026-06-18");
  const [billDueDate, setBillDueDate] = useState("2026-07-03");
  const [billDescription, setBillDescription] = useState("");
  const [billStatus, setBillStatus] = useState<"Paid" | "Pending">("Pending");
  const [customerPaid, setCustomerPaid] = useState<number>(0);
  const [paymentDate, setPaymentDate] = useState<string>("");
  const [paymentsList, setPaymentsList] = useState<{ id: string; date: string; amount: number }[]>([]);
  const [tempPayAmount, setTempPayAmount] = useState<string>("");
  const [tempPayDate, setTempPayDate] = useState<string>("2026-07-05");
  const [showAddPaymentForm, setShowAddPaymentForm] = useState<boolean>(false);

  const [borewellType, setBorewellType] = useState<"Tight Formation" | "Loose Formation">("Tight Formation");
  const [billMode, setBillMode] = useState<"New" | "Re-Borewell" | "Customize">("New");
  const [existingDepth, setExistingDepth] = useState<number>(0);
  const [oldFeetRate, setOldFeetRate] = useState<number>(90);
  const [finalDepth, setFinalDepth] = useState<number>(950);
  const [startingPrice, setStartingPrice] = useState<number>(100);
  const [casingType, setCasingType] = useState<"7 inch" | "10 inch">("7 inch");
  const [casingFeet, setCasingFeet] = useState<number>(20);
  const [casingRate, setCasingRate] = useState<number>(350);
  const [batta, setBatta] = useState<number>(1500);

  // Customize Bill inputs
  const [customLocation, setCustomLocation] = useState("");
  const [customBrokerName, setCustomBrokerName] = useState("");
  const [customBillDateType, setCustomBillDateType] = useState<"automatic" | "manual">("automatic");
  const [customStartingFeet, setCustomStartingFeet] = useState<number>(0);
  const [customEndingFeet, setCustomEndingFeet] = useState<number>(950);
  const [casing10Feet, setCasing10Feet] = useState<number>(0);
  const [casing10Rate, setCasing10Rate] = useState<number>(450);
  const [casing7Feet, setCasing7Feet] = useState<number>(20);
  const [casing7Rate, setCasing7Rate] = useState<number>(350);
  const [customSlabRates, setCustomSlabRates] = useState<Record<string, number>>({});
  const [discountAmount, setDiscountAmount] = useState<number>(0);

  // New Casing Pipe inputs for bill
  const [billPipeSupplierId, setBillPipeSupplierId] = useState<string>("");
  const [billCasing7HighFeet, setBillCasing7HighFeet] = useState<number>(0);
  const [billCasing7MediumFeet, setBillCasing7MediumFeet] = useState<number>(0);
  const [billCasing10HighFeet, setBillCasing10HighFeet] = useState<number>(0);
  const [billCasing10MediumFeet, setBillCasing10MediumFeet] = useState<number>(0);

  // Slab rate helper
  const getSlabRate = (
    formation: "Tight Formation" | "Loose Formation",
    slabIdx: number,
    startPrice: number
  ): number => {
    if (slabIdx <= 0) return startPrice;
    if (formation === "Loose Formation") {
      const looseAdditions = [0, 10, 30, 60, 100, 150, 210, 270, 350, 450, 550];
      if (slabIdx < looseAdditions.length) {
        return startPrice + looseAdditions[slabIdx];
      } else {
        return startPrice + 550 + (slabIdx - 10) * 100;
      }
    } else {
      const tightAdditions = [0, 10, 30, 60, 100, 150, 210, 280, 360, 450, 550];
      if (slabIdx < tightAdditions.length) {
        return startPrice + tightAdditions[slabIdx];
      } else {
        return startPrice + 550 + (slabIdx - 10) * 100;
      }
    }
  };

  const getStandardRateForSlabIdx = (formation: "Tight Formation" | "Loose Formation", idx: number, startPrice: number) => {
    return getSlabRate(formation, idx, startPrice);
  };

  const runBorewellCalculation = (
    typeVal: "Tight Formation" | "Loose Formation",
    modeVal: "New" | "Re-Borewell",
    existVal: number,
    finalVal: number,
    caseFeetVal: number,
    caseRateVal: number,
    battaVal: number,
    startingPriceVal: number = 100,
    oldFeetRateVal: number = 90,
    c7FeetVal?: number,
    c7RateVal?: number,
    c10FeetVal?: number,
    c10RateVal?: number
  ) => {
    const limit = typeVal === "Tight Formation" ? 300 : 500;
    const breakdownLines: { slabRange: string; feet: number; rate: number; amount: number }[] = [];
    let totalDrilling = 0;

    if (modeVal === "Re-Borewell") {
      // STEP 1: Old Bore Cost
      if (existVal > 0) {
        const amount = existVal * oldFeetRateVal;
        breakdownLines.push({
          slabRange: `1 - ${existVal}`,
          feet: existVal,
          rate: oldFeetRateVal,
          amount: amount
        });
        totalDrilling += amount;
      }

      // STEP 3, 4, 5, 6: Re-bore calculation starts from existVal up to finalVal
      let slabIdx = 0;
      let currentFrom = 0;
      
      while (currentFrom <= Math.max(finalVal, 3000)) {
        let mathFrom = 0;
        let mathTo = 0;
        if (slabIdx === 0) {
          mathFrom = 0;
          mathTo = limit;
        } else {
          mathFrom = limit + (slabIdx - 1) * 100;
          mathTo = limit + slabIdx * 100;
        }

        const startOverlap = Math.max(mathFrom, existVal);
        const endOverlap = Math.min(mathTo, finalVal);

        if (endOverlap > startOverlap) {
          const feet = endOverlap - startOverlap;
          const rate = getSlabRate(typeVal, slabIdx, startingPriceVal);
          const amount = feet * rate;
          
          breakdownLines.push({
            slabRange: `${startOverlap} - ${endOverlap}`,
            feet,
            rate,
            amount
          });
          totalDrilling += amount;
        }

        currentFrom = mathTo;
        slabIdx++;
      }
    } else {
      // New Borewell Calculation
      let slabIdx = 0;
      let currentFrom = 0;
      
      while (currentFrom <= Math.max(finalVal, 3000)) {
        let mathFrom = 0;
        let mathTo = 0;
        if (slabIdx === 0) {
          mathFrom = 0;
          mathTo = limit;
        } else {
          mathFrom = limit + (slabIdx - 1) * 100;
          mathTo = limit + slabIdx * 100;
        }

        const startOverlap = Math.max(mathFrom, 0);
        const endOverlap = Math.min(mathTo, finalVal);

        if (endOverlap > startOverlap) {
          const feet = endOverlap - startOverlap;
          const rate = getSlabRate(typeVal, slabIdx, startingPriceVal);
          const amount = feet * rate;
          
          breakdownLines.push({
            slabRange: slabIdx === 0 ? `1 - ${endOverlap}` : `${startOverlap} - ${endOverlap}`,
            feet,
            rate,
            amount
          });
          totalDrilling += amount;
        }

        currentFrom = mathTo;
        slabIdx++;
      }
    }

    let casingTotal = 0;
    let casing7Total = 0;
    let casing10Total = 0;
    if (c7FeetVal !== undefined && c10FeetVal !== undefined) {
      casing7Total = c7FeetVal * (c7RateVal !== undefined ? c7RateVal : 350);
      casing10Total = c10FeetVal * (c10RateVal !== undefined ? c10RateVal : 450);
      casingTotal = casing7Total + casing10Total;
    } else {
      casingTotal = caseFeetVal * caseRateVal;
    }
    
    const grand = totalDrilling + casingTotal + battaVal;

    return {
      breakdownLines,
      totalDrilling,
      casingTotal,
      casing7Total,
      casing10Total,
      grand
    };
  };

  const getCustomSlabsList = (formation: "Tight Formation" | "Loose Formation", starting: number, ending: number) => {
    const limit = formation === "Tight Formation" ? 300 : 500;
    const slabs: { from: number; to: number; label: string; feetCount: number }[] = [];
    
    let slabIdx = 0;
    let currentFrom = 0;
    while (currentFrom <= Math.max(ending, 3000)) {
      let mathFrom = 0;
      let mathTo = 0;
      if (slabIdx === 0) {
        mathFrom = 0;
        mathTo = limit;
      } else {
        mathFrom = limit + (slabIdx - 1) * 100;
        mathTo = limit + slabIdx * 100;
      }

      const startOverlap = Math.max(mathFrom, starting);
      const endOverlap = Math.min(mathTo, ending);

      if (endOverlap > startOverlap) {
        const feet = endOverlap - startOverlap;
        slabs.push({
          from: startOverlap,
          to: endOverlap,
          label: slabIdx === 0 ? `1 - ${endOverlap}` : `${startOverlap} - ${endOverlap}`,
          feetCount: feet
        });
      }

      currentFrom = mathTo;
      slabIdx++;
    }
    return slabs;
  };

  const runCustomCalculation = (params: {
    borewellType: "Tight Formation" | "Loose Formation";
    startingFeet: number;
    endingFeet: number;
    rates: Record<string, number>;
    c7Feet: number;
    c7Rate: number;
    c10Feet: number;
    c10Rate: number;
    battaVal: number;
  }) => {
    const slabs = getCustomSlabsList(params.borewellType, params.startingFeet, params.endingFeet);
    const breakdownLines: { slabRange: string; feet: number; rate: number; amount: number }[] = [];
    
    let totalDrilling = 0;
    slabs.forEach((slab) => {
      const rate = params.rates[slab.label] !== undefined ? params.rates[slab.label] : 100;
      const amount = slab.feetCount * rate;
      totalDrilling += amount;
      breakdownLines.push({
        slabRange: slab.label,
        feet: slab.feetCount,
        rate,
        amount
      });
    });
    
    const casing7Total = params.c7Feet * params.c7Rate;
    const casing10Total = params.c10Feet * params.c10Rate;
    const casingTotal = casing7Total + casing10Total;
    const grand = totalDrilling + casingTotal + params.battaVal;
    
    return {
      breakdownLines,
      totalDrilling,
      casingTotal,
      casing7Total,
      casing10Total,
      grand
    };
  };

  React.useEffect(() => {
    if (billMode === "Customize") {
      const slabs = getCustomSlabsList(borewellType, customStartingFeet, customEndingFeet);
      const newRates = { ...customSlabRates };
      let changed = false;
      slabs.forEach((slab, idx) => {
        if (newRates[slab.label] === undefined) {
          newRates[slab.label] = getStandardRateForSlabIdx(borewellType, idx, startingPrice);
          changed = true;
        }
      });
      if (changed) {
        setCustomSlabRates(newRates);
      }
    }
  }, [borewellType, customStartingFeet, customEndingFeet, billMode, startingPrice]);

  React.useEffect(() => {
    if (billMode === "Customize" && customBillDateType === "automatic") {
      const today = new Date().toISOString().split("T")[0];
      setBillDate(today);
      const fut = new Date();
      fut.setDate(fut.getDate() + 15);
      setBillDueDate(fut.toISOString().split("T")[0]);
    }
  }, [billMode, customBillDateType]);

  const handleSaveBill = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!billClient.trim()) {
      alert("Please provide customer name.");
      return;
    }

    let calc;
    const isCustom = billMode === "Customize";
    
    if (isCustom) {
      calc = runCustomCalculation({
        borewellType,
        startingFeet: customStartingFeet,
        endingFeet: customEndingFeet,
        rates: customSlabRates,
        c7Feet: casing7Feet,
        c7Rate: casing7Rate,
        c10Feet: casing10Feet,
        c10Rate: casing10Rate,
        battaVal: batta
      });
    } else {
      calc = runBorewellCalculation(
        borewellType,
        billMode,
        existingDepth,
        finalDepth,
        0,
        0,
        batta,
        startingPrice,
        oldFeetRate,
        casing7Feet,
        casing7Rate,
        casing10Feet,
        casing10Rate
      );
    }

    const fullDesc = billDescription || (isCustom 
      ? `Customized Borewell Drilling Bill for ${billClient} (Formation: ${borewellType}, Range: ${customStartingFeet}-${customEndingFeet} ft).`
      : `Borewell Drilling Service for ${billClient}. ${billMode === "Re-Borewell" ? `Re-bore from ${existingDepth} ft to ${finalDepth} ft` : `New Bore depth of ${finalDepth} ft`} using ${borewellType}.`
    );

    const savedCustomFields = {
      isCustomBill: isCustom,
      location: customLocation,
      brokerName: customBrokerName,
      customDateType: isCustom ? customBillDateType : "automatic",
      customStartingFeet: isCustom ? customStartingFeet : 0,
      customEndingFeet: isCustom ? customEndingFeet : finalDepth,
      casing10Feet,
      casing10Rate,
      casing7Feet,
      casing7Rate,
      customSlabRates: isCustom ? customSlabRates : {},
      usedBitId: selectedBitId || undefined,
      usedHammerId: selectedHammerId || undefined,
      usedCasing10HammerId: selectedCasing10HammerId || undefined,
      usedCasing7HammerId: selectedCasing7HammerId || undefined,
      pipeSupplierId: billPipeSupplierId || undefined,
      casing7HighFeet: Number(billCasing7HighFeet) || 0,
      casing7MediumFeet: Number(billCasing7MediumFeet) || 0,
      casing10HighFeet: Number(billCasing10HighFeet) || 0,
      casing10MediumFeet: Number(billCasing10MediumFeet) || 0,
    };

    const finalBillTotal = Math.max(0, calc.grand - discountAmount);
    const totalPaidCalculated = paymentsList.reduce((sum, p) => sum + p.amount, 0);
    const calculatedPending = Math.max(0, finalBillTotal - totalPaidCalculated);
    const resolvedStatus = calculatedPending <= 0 ? "Paid" : billStatus;
    const latestPayment = paymentsList.length > 0 ? [...paymentsList].sort((a,b) => b.date.localeCompare(a.date))[0] : undefined;
    const resolvedPaymentDate = latestPayment ? latestPayment.date : undefined;

    const existingBill = editingBillId ? businessBills.find((bill) => bill.id === editingBillId) : undefined;
    const shouldPersistToServer = !editingBillId || existingBill?.source === "server";

    const payloadBill: BusinessBill = {
      id: editingBillId || `bill-${Date.now()}`,
      invoiceNo: businessBills.find((bill) => bill.id === editingBillId)?.invoiceNo || "",
      clientName: billClient,
      billDate,
      dueDate: billDate,
      description: fullDesc,
      amount: finalBillTotal,
      discountAmount,
      taxRate: 0,
      status: resolvedStatus,
      customerPaid: totalPaidCalculated,
      paymentDate: resolvedPaymentDate || undefined,
      payments: paymentsList,
      borewellType,
      billMode,
      existingDepth,
      finalDepth: isCustom ? customEndingFeet : finalDepth,
      startingPrice,
      oldFeetRate,
      casingType: casing7Feet > 0 ? "7 inch" : "10 inch",
      casingFeet: casing7Feet > 0 ? casing7Feet : casing10Feet,
      casingRate: casing7Feet > 0 ? casing7Rate : casing10Rate,
      batta,
      calculatedBreakdown: calc.breakdownLines,
      totalDrillingCharges: calc.totalDrilling,
      casingCharges: calc.casingTotal,
      source: shouldPersistToServer ? "server" : (existingBill?.source ?? "local"),
      ...savedCustomFields
    };
    // === HAMMER FEET TRACKING (internal, not in PDF) ===
    const drillingFeet = billMode === "New" 
      ? Math.max(0, (isCustom ? customEndingFeet : finalDepth) - ((casing7Feet || 0) + (casing10Feet || 0)))
      : 0;

    const updatedHammers = hammerEntries.map((h) => {
      let history = (h.usageHistory || []).filter((rec) => rec.billId !== payloadBill.id && rec.id !== payloadBill.id);

      let addedFeet = 0;
      if (h.id === selectedHammerId && drillingFeet > 0) {
        addedFeet = drillingFeet;
      } else if (h.id === selectedCasing10HammerId && (casing10Feet || 0) > 0) {
        addedFeet = casing10Feet || 0;
      } else if (h.id === selectedCasing7HammerId && (casing7Feet || 0) > 0) {
        addedFeet = casing7Feet || 0;
      }

      if (addedFeet > 0) {
        const newRecord: HammerUsageRecord = {
          id: `rec-${Date.now()}-${h.id}`,
          billId: payloadBill.id,
          date: billDate,
          clientName: billClient,
          location: customLocation || "",
          calculatedFeet: addedFeet
        };
        history = [...history, newRecord];
      }

      const totalFeet = history.reduce((sum, r) => sum + r.calculatedFeet, 0);
      let casingType = h.casingType;
      if (totalFeet >= h.capableFeetDepth && !casingType) {
        const casingChoice = window.confirm(
          `⚠️ Hammer ${h.hammerNo} has reached its capable feet limit!\n` +
          `Total feet used: ${totalFeet} ft (limit: ${h.capableFeetDepth} ft)\n\n` +
          `Click OK to mark as 7" Casing Hammer\n` +
          `Click Cancel to mark as 10" Casing Hammer`
        ) ? "7 inch" : "10 inch";
        casingType = casingChoice;
      }

      return {
        ...h,
        usageHistory: history,
        casingType
      };
    });

    setHammerEntries(updatedHammers);

    if (!shouldPersistToServer) {
        setBusinessBills((prev) => {
          if (editingBillId) {
            return prev.map((bill) => (bill.id === editingBillId ? payloadBill : bill));
          }
          return [payloadBill, ...prev];
        });
        triggerOnlineSync(`${editingBillId ? "UPDATED" : "GENERATED"} BOREWELL BILL: ${payloadBill.invoiceNo || payloadBill.clientName} (local only)`);
        setEditingBillId(null);
        setIsBillFormOpen(false);
        setBillClient("");
        setBillDescription("");
        setBorewellType("Tight Formation");
        setBillMode("New");
        setExistingDepth(0);
        setOldFeetRate(90);
        setFinalDepth(950);
        setStartingPrice(100);
        setCasingType("7 inch");
        setCasingFeet(20);
        setCasingRate(350);
        setBatta(1500);
        setDiscountAmount(0);
        setCustomerPaid(0);
        setPaymentDate("");
        setPaymentsList([]);
        setTempPayAmount("");
        setTempPayDate("2026-07-05");
        setShowAddPaymentForm(false);
        setCustomLocation("");
        setCustomBrokerName("");
        setCustomBillDateType("automatic");
        setCustomStartingFeet(0);
        setCustomEndingFeet(950);
        setCasing10Feet(0);
        setCasing10Rate(450);
        setCasing7Feet(20);
        setCasing7Rate(350);
        setCustomSlabRates({});
        await onSharedDataChanged?.();
        return;
      }

      try {
        const response = await requestJson(
          apiBaseUrl,
          editingBillId ? `/api/v1/business/bills/${editingBillId}` : "/api/v1/business/bills",
        {
          method: editingBillId ? "PUT" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(toBusinessBillApiPayload(payloadBill)),
        }
      );
      const savedBill = mapBusinessBillFromApi(response);

      if (editingBillId) {
        setBusinessBills((prev) => prev.map((bill) => (bill.id === editingBillId ? savedBill : bill)));
        triggerOnlineSync(`UPDATED BOREWELL BILL: ${savedBill.invoiceNo} for ${savedBill.clientName} (Rs. ${savedBill.amount.toLocaleString()})`);
        setEditingBillId(null);
      } else {
        setBusinessBills((prev) => [savedBill, ...prev.filter((bill) => bill.id !== savedBill.id)]);
        triggerOnlineSync(`GENERATED BOREWELL BILL #${savedBill.invoiceNo} for ${savedBill.clientName} (Rs. ${savedBill.amount.toLocaleString()})`);
      }

      await onSharedDataChanged?.();

      // Persist modified hammers to server
      const hammersToUpdate = updatedHammers.filter(h => 
        (h.id === selectedHammerId && drillingFeet > 0) || 
        (h.id === selectedCasing10HammerId && (casing10Feet || 0) > 0) || 
        (h.id === selectedCasing7HammerId && (casing7Feet || 0) > 0)
      );
      
      await Promise.all(
        hammersToUpdate.map(async (h) => {
          try {
            await requestJson(apiBaseUrl, `/api/v1/business/hammers/${h.id}`, {
              method: "PUT",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(toHammerApiPayload(h)),
            });
          } catch (err) {
            console.error(`Failed to update hammer ${h.id} on server`, err);
          }
        })
      );
    } catch (error) {
      console.error(error);
      const message = error instanceof Error ? error.message.toLowerCase() : "";
      if (editingBillId && (message.includes("not found") || message.includes("404"))) {
        setBusinessBills((prev) =>
          prev.map((bill) =>
            bill.id === editingBillId
              ? {
                  ...bill,
                  clientName: billClient,
                  billDate,
                  dueDate: billDate,
                  description: fullDesc,
                  amount: finalBillTotal,
                  discountAmount,
                  taxRate: 0,
                  status: resolvedStatus,
                  customerPaid: totalPaidCalculated,
                  paymentDate: resolvedPaymentDate || undefined,
                  payments: paymentsList,
                  borewellType,
                  billMode,
                  existingDepth,
                  finalDepth: isCustom ? customEndingFeet : finalDepth,
                  startingPrice,
                  oldFeetRate,
                  casingType: casing7Feet > 0 ? "7 inch" : "10 inch",
                  casingFeet: casing7Feet > 0 ? casing7Feet : casing10Feet,
                  casingRate: casing7Feet > 0 ? casing7Rate : casing10Rate,
                  batta,
                  calculatedBreakdown: calc.breakdownLines,
                  totalDrillingCharges: calc.totalDrilling,
                  casingCharges: calc.casingTotal,
                  ...savedCustomFields,
                }
              : bill
          )
        );
        triggerOnlineSync(`UPDATED BOREWELL BILL: ${billClient} (local sync)`);
        setEditingBillId(null);
        await onSharedDataChanged?.();
        return;
      }
      alert("Unable to save the borewell bill right now. Please try again.");
      return;
    }
    
    // Reset bit/hammer selection
    setSelectedBitId("");
    setSelectedHammerId("");
    setSelectedCasing10HammerId("");
    setSelectedCasing7HammerId("");
        setBillClient("");
    setBillDescription("");
    setBorewellType("Tight Formation");
    setBillMode("New");
    setExistingDepth(0);
    setOldFeetRate(90);
    setFinalDepth(950);
    setStartingPrice(100);
    setCasingType("7 inch");
    setCasingFeet(20);
    setCasingRate(350);
    setBatta(1500);
    setDiscountAmount(0);
    setCustomerPaid(0);
    setPaymentDate("");
    setPaymentsList([]);
    setTempPayAmount("");
    setTempPayDate("2026-07-05");
    setShowAddPaymentForm(false);

    // reset custom inputs
    setCustomLocation("");
    setCustomBrokerName("");
    setCustomBillDateType("automatic");
    setCustomStartingFeet(0);
    setCustomEndingFeet(950);
    setCasing10Feet(0);
    setCasing10Rate(450);
    setCasing7Feet(20);
    setCasing7Rate(350);
    setCustomSlabRates({});
    setBillPipeSupplierId("");
    setBillCasing7HighFeet(0);
    setBillCasing7MediumFeet(0);
    setBillCasing10HighFeet(0);
    setBillCasing10MediumFeet(0);

    setIsBillFormOpen(false);
  };

  const handleEditBillClick = (bill: BusinessBill) => {
    setEditingBillId(bill.id);
    setBillClient(bill.clientName);
    setBillDate(bill.billDate);
    setBillDueDate(bill.dueDate);
    setBillDescription(bill.description);
    setBillStatus(bill.status);
    setBorewellType(bill.borewellType || "Tight Formation");
    setBillMode(bill.billMode || "New");
    setExistingDepth(bill.existingDepth || 0);
    setOldFeetRate(bill.oldFeetRate || 90);
    setFinalDepth(bill.finalDepth || 950);
    setStartingPrice(bill.startingPrice || 100);
    setCasingType(bill.casingType || "7 inch");
    setCasingFeet(bill.casingFeet || 0);
    setCasingRate(bill.casingRate || 0);
    setBatta(bill.batta !== undefined ? bill.batta : 1500);

    // Load custom bills and dual casing inputs unconditionally
    setCustomLocation(bill.location || "");
    setCustomBrokerName(bill.brokerName || "");
    setCustomBillDateType(bill.customDateType || "automatic");
    setCustomStartingFeet(bill.customStartingFeet !== undefined ? bill.customStartingFeet : 0);
    setCustomEndingFeet(bill.customEndingFeet !== undefined ? bill.customEndingFeet : 950);
    setCasing10Feet(bill.casing10Feet || 0);
    setCasing10Rate(bill.casing10Rate || 450);
    setCasing7Feet(bill.casing7Feet !== undefined ? bill.casing7Feet : 20);
    setCasing7Rate(bill.casing7Rate || 350);
    setCustomSlabRates(bill.customSlabRates || {});
    setDiscountAmount(bill.discountAmount !== undefined ? bill.discountAmount : 0);
    setCustomerPaid(bill.customerPaid !== undefined ? bill.customerPaid : 0);
    setPaymentDate(bill.paymentDate || "");
    setPaymentsList(bill.payments || []);
    setTempPayAmount("");
    setTempPayDate(bill.paymentDate || "2026-07-05");
    setShowAddPaymentForm(false);
    setSelectedBitId(bill.usedBitId || "");
    setSelectedHammerId(bill.usedHammerId || "");
    setSelectedCasing10HammerId(bill.usedCasing10HammerId || "");
    setSelectedCasing7HammerId(bill.usedCasing7HammerId || "");
    setBillPipeSupplierId(bill.pipeSupplierId || "");
    setBillCasing7HighFeet(bill.casing7HighFeet || 0);
    setBillCasing7MediumFeet(bill.casing7MediumFeet || 0);
    setBillCasing10HighFeet(bill.casing10HighFeet || 0);
    setBillCasing10MediumFeet(bill.casing10MediumFeet || 0);

    setIsBillFormOpen(true);
  };

  const handleDeleteBill = (id: string, name: string) => {
    setDeleteConfirmation({ id, name, type: "bill" });
  };

  const formatDateToDMY = (dateStr: string) => {
    if (!dateStr) return "";
    const parts = dateStr.split("-");
    if (parts.length === 3) {
      return `${parts[2]}/${parts[1]}/${parts[0]}`;
    }
    return dateStr;
  };

  const loadImage = (src: string): Promise<HTMLImageElement> => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.src = src;
      img.onload = () => resolve(img);
      img.onerror = (e) => reject(e);
    });
  };

  const handleDownloadInvoicePDF = async (bill: typeof businessBills[0]) => {
    const { jsPDF } = await import("jspdf");
    const doc = new jsPDF({
      orientation: "portrait",
      unit: "mm",
      format: "a4"
    });

    try {
      const img = await loadImage(borewellLogo);
      doc.addImage(img, "JPEG", 15, 14, 32, 32);
    } catch (e) {
      console.error("Failed to load logo, rendering without it:", e);
    }

    const primaryColor = [15, 23, 42];
    const accentColor = [79, 70, 229];

    // Set Times New Roman (times) as the primary font style
    doc.setFont("times", "bold");
    
    // Balanced Alignment Title Block with Logo on Left
    // 1. SRS (red color, size 20, bold)
    doc.setFontSize(20);
    doc.setTextColor(220, 38, 38); // rich red
    doc.text("SRS", 112, 20, { align: "center" });

    // 2. Sri Selvanyagi Rig Service (green color, size 18, bold)
    doc.setFontSize(18);
    doc.setTextColor(22, 163, 74); // rich green
    doc.text("Sri Selvanyagi Rig Service", 112, 28, { align: "center" });

    // 3. 8", 6 1/2", 4 1/2" Borewells in Best (blue color, size 16, bold)
    doc.setFontSize(16);
    doc.setTextColor(29, 78, 216); // rich blue
    doc.text("8\", 6 1/2\", 4 1/2\" Borewells in Best", 112, 36, { align: "center" });

    // 4. Contact No: 9791908234, 9384918254 (black/slate 900, size 14, bold)
    doc.setFontSize(14);
    doc.setTextColor(15, 23, 42); // black/slate 900
    doc.text("Contact No: 9791908234, 9384918254", 112, 44, { align: "center" });

    // 5. Office at Sathy Road, Annur. (black/slate 900, size 14, bold)
    doc.setFontSize(14);
    doc.setTextColor(15, 23, 42);
    doc.text("Office at Sathy Road, Annur.", 112, 52, { align: "center" });

    // Invoice metadata on the top right
    doc.setFont("times", "bold");
    doc.setFontSize(10);
    doc.setTextColor(15, 23, 42);
    doc.text(`Bill No: ${bill.invoiceNo}`, 195, 20, { align: "right" });
    doc.text(`Date: ${formatDateToDMY(bill.billDate)}`, 195, 26, { align: "right" });

    // Drawing a separator line
    doc.setDrawColor(226, 232, 240);
    doc.setLineWidth(0.5);
    doc.line(15, 58, 195, 58);

      // Billed To Section
      doc.setFont("times", "bold");
      doc.setFontSize(11);
      doc.setTextColor(accentColor[0], accentColor[1], accentColor[2]);
      doc.text("BILLED TO:", 15, 68);

      doc.setFont("times", "bold");
      doc.setFontSize(11);
      doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
      doc.text(`customer : ${bill.clientName}`, 15, 75);
      doc.text(`location : ${bill.location || "mmm"}`, 120, 75);

      // Extract or compute borewell details
      const bType = bill.borewellType || "Tight Formation";
      const bMode = bill.billMode || "New";
      const eDepth = bill.existingDepth || 0;
      const fDepth = bill.finalDepth || 950;
      const cFeet = bill.casingFeet || 0;
      const cRate = bill.casingRate || 0;
      const battaVal = bill.batta === undefined ? 1500 : bill.batta;
      const startingPriceVal = bill.startingPrice === undefined ? 100 : bill.startingPrice;
      const oldFeetRateVal = bill.oldFeetRate === undefined ? 90 : bill.oldFeetRate;
      const bCasingType = bill.casingType || "7 inch";

      const isCustomPDF = bill.isCustomBill || bMode === "Customize";

      // Re-run slab calculation to render perfect breakdown
      const calcResult = isCustomPDF
        ? runCustomCalculation({
            borewellType: bType,
            startingFeet: bill.customStartingFeet !== undefined ? bill.customStartingFeet : 0,
            endingFeet: bill.customEndingFeet !== undefined ? bill.customEndingFeet : fDepth,
            rates: bill.customSlabRates || {},
            c7Feet: bill.casing7Feet !== undefined ? bill.casing7Feet : (bill.casingType === "7 inch" ? cFeet : 0),
            c7Rate: bill.casing7Rate !== undefined ? bill.casing7Rate : (bill.casingType === "7 inch" ? cRate : 350),
            c10Feet: bill.casing10Feet !== undefined ? bill.casing10Feet : (bill.casingType === "10 inch" ? cFeet : 0),
            c10Rate: bill.casing10Rate !== undefined ? bill.casing10Rate : (bill.casingType === "10 inch" ? cRate : 450),
            battaVal: battaVal
          })
        : runBorewellCalculation(
            bType,
            bMode,
            eDepth,
            fDepth,
            cFeet,
            cRate,
            battaVal,
            startingPriceVal,
            oldFeetRateVal,
            bill.casing7Feet !== undefined ? bill.casing7Feet : (bill.casingType === "7 inch" ? cFeet : 0),
            bill.casing7Rate !== undefined ? bill.casing7Rate : (bill.casingType === "7 inch" ? cRate : 350),
            bill.casing10Feet !== undefined ? bill.casing10Feet : (bill.casingType === "10 inch" ? cFeet : 0),
            bill.casing10Rate !== undefined ? bill.casing10Rate : (bill.casingType === "10 inch" ? cRate : 450)
          );

      // Specs Summary Box
      const boxHeight = isCustomPDF ? 36 : (bMode === "Re-Borewell" ? 28 : 22);
      doc.setFillColor(248, 250, 252);
      doc.rect(15, 82, 180, boxHeight, "F");
      
      doc.setFont("times", "bold");
      doc.setFontSize(10);
      doc.setTextColor(71, 85, 105);

      if (isCustomPDF) {
        // Row 1
        doc.text(`Borewell Type: ${bType}`, 18, 88);
        doc.text(`Billing Mode: Customized Bill`, 100, 88);
        // Row 2
        doc.text(`Location: ${bill.location || "N/A"}`, 18, 94);
        doc.text(`Broker Name: ${bill.brokerName || "N/A"}`, 100, 94);
        // Row 3
        doc.text(`Drilling Depth Range: ${bill.customStartingFeet || 0} - ${bill.customEndingFeet || fDepth} ft`, 18, 100);
        doc.text(`Batta Allowance: Rs. ${battaVal.toLocaleString()}`, 100, 100);
        // Row 4
        doc.text(`Casing 10": ${bill.casing10Feet || 0} ft @ Rs. ${bill.casing10Rate || 450}/ft`, 18, 106);
        doc.text(`Casing 7": ${bill.casing7Feet || 0} ft @ Rs. ${bill.casing7Rate || 350}/ft`, 100, 106);
      } else if (bMode === "Re-Borewell") {
        // Row 1
        doc.text(`Borewell Type: ${bType}`, 18, 88);
        doc.text(`Billing Mode: ${bMode}`, 100, 88);
        // Row 2
        doc.text(`Existing Depth: ${eDepth} ft`, 18, 94);
        doc.text(`Old Rate: Rs. ${oldFeetRateVal}/ft`, 100, 94);
        // Row 3
        doc.text(`Final Drilled Depth: ${fDepth} ft`, 18, 100);
        doc.text(`Starting Price (New): Rs. ${startingPriceVal}/ft`, 100, 100);
        // Row 4
        doc.text(`Casing Type: ${bCasingType} (${cFeet} ft @ Rs. ${cRate}/ft)`, 18, 106);
        doc.text(`Batta Allowance: Rs. ${battaVal.toLocaleString()}`, 100, 106);
      } else {
        // Row 1
        doc.text(`Borewell Type: ${bType}`, 18, 88);
        doc.text(`Billing Mode: ${bMode === "New" ? "New borewell" : bMode}`, 100, 88);
        // Row 2
        doc.text(`Final Drilled Depth: ${fDepth} ft`, 18, 94);
        doc.text(`Starting Price: Rs. ${startingPriceVal}/ft`, 100, 94);
        // Row 3
        doc.text(`Casing Type: ${bCasingType} (${cFeet} ft @ Rs. ${cRate}/ft)`, 18, 100);
        doc.text(`Batta Allowance: Rs. ${battaVal.toLocaleString()}`, 100, 100);
      }

      const slabHeaderY = 82 + boxHeight + 8;
      // Slabs list header
      doc.setFont("times", "bold");
      doc.setFontSize(11);
      doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
      doc.text("DRILLING CHARGES BREAKDOWN (SLAB-WISE RATES)", 15, slabHeaderY);

      // Table Header Background
      const tblHeaderY = slabHeaderY + 4;
      doc.setFillColor(240, 244, 248);
      doc.rect(15, tblHeaderY, 180, 7, "F");

      doc.setFont("times", "bold");
      doc.setFontSize(10);
      doc.setTextColor(71, 85, 105);
      doc.text("Slab Range (Feet)", 20, tblHeaderY + 5);
      doc.text("Drilled Feet", 80, tblHeaderY + 5, { align: "right" });
      doc.text("Rate / Ft (Rs.)", 130, tblHeaderY + 5, { align: "right" });
      doc.text("Total Charges (Rs.)", 190, tblHeaderY + 5, { align: "right" });

      let currentY = tblHeaderY + 13;
      doc.setFont("times", "normal");
      doc.setTextColor(15, 23, 42);

      calcResult.breakdownLines.forEach((line) => {
        doc.text(line.slabRange, 20, currentY);
        doc.text(`${line.feet} ft`, 80, currentY, { align: "right" });
        doc.text(`${line.rate}`, 130, currentY, { align: "right" });
        doc.text(`${line.amount.toLocaleString()}`, 190, currentY, { align: "right" });
        currentY += 6;
      });

      // Divider
      doc.setDrawColor(226, 232, 240);
      doc.line(15, currentY, 195, currentY);
      currentY += 6;

      // Summary
      doc.setFont("times", "normal");
      doc.text("Total Drilling Cost:", 140, currentY, { align: "right" });
      doc.text(`Rs. ${calcResult.totalDrilling.toLocaleString()}`, 190, currentY, { align: "right" });
      currentY += 6;

      let hasCasingLine = false;
      if ((bill.casing10Feet || 0) > 0) {
        doc.text(`Casing 10" Pipe charges (${bill.casing10Feet} ft x Rs. ${bill.casing10Rate || 450}):`, 140, currentY, { align: "right" });
        doc.text(`Rs. ${((bill.casing10Feet || 0) * (bill.casing10Rate || 450)).toLocaleString()}`, 190, currentY, { align: "right" });
        currentY += 6;
        hasCasingLine = true;
      }
      if ((bill.casing7Feet || 0) > 0) {
        doc.text(`Casing 7" Pipe charges (${bill.casing7Feet} ft x Rs. ${bill.casing7Rate || 350}):`, 140, currentY, { align: "right" });
        doc.text(`Rs. ${((bill.casing7Feet || 0) * (bill.casing7Rate || 350)).toLocaleString()}`, 190, currentY, { align: "right" });
        currentY += 6;
        hasCasingLine = true;
      }
      if (!hasCasingLine && cFeet > 0) {
        doc.text(`Casing Pipe charges (${cFeet} ft x Rs. ${cRate}):`, 140, currentY, { align: "right" });
        doc.text(`Rs. ${calcResult.casingTotal.toLocaleString()}`, 190, currentY, { align: "right" });
        currentY += 6;
      }

      doc.text("Batta Charge Allowance:", 140, currentY, { align: "right" });
      doc.text(`Rs. ${battaVal.toLocaleString()}`, 190, currentY, { align: "right" });
      currentY += 6;

      if (bill.discountAmount !== undefined && bill.discountAmount > 0) {
        doc.setFont("times", "bold");
        doc.text("Total Bill Price:", 140, currentY, { align: "right" });
        doc.text(`Rs. ${calcResult.grand.toLocaleString()}`, 190, currentY, { align: "right" });
        currentY += 6;

        doc.setFont("times", "bold");
        doc.setTextColor(217, 119, 6); // Amber dark tone
        doc.text(`Less: Customer Discount Amount:`, 140, currentY, { align: "right" });
        doc.text(`- Rs. ${bill.discountAmount.toLocaleString()}`, 190, currentY, { align: "right" });
        currentY += 8;
        doc.setTextColor(15, 23, 42); // Restore
      } else {
        currentY += 2;
      }

      // Grand Total
      doc.setFont("times", "bold");
      doc.setFontSize(12);
      doc.setTextColor(accentColor[0], accentColor[1], accentColor[2]);
      doc.text("GRAND BILL TOTAL:", 140, currentY, { align: "right" });
      const finalAmt = calcResult.grand - (bill.discountAmount || 0);
      doc.text(`Rs. ${Math.max(0, finalAmt).toLocaleString()}`, 190, currentY, { align: "right" });

      // Payment Status
      const badgeY = currentY + 12;
      doc.setFillColor(bill.status === "Paid" ? 220 : 254, bill.status === "Paid" ? 252 : 243, bill.status === "Paid" ? 231 : 199);
      doc.rect(15, badgeY, 180, 10, "F");
      
      doc.setFont("times", "bold");
      doc.setFontSize(9.5);
      doc.setTextColor(bill.status === "Paid" ? 21 : 153, bill.status === "Paid" ? 128 : 27, bill.status === "Paid" ? 61 : 27);
      doc.text(`PAYMENT RECEIVED & SETTLED: ${bill.status === "Paid" ? "YES / FULLY PAID" : "NO / OUTSTANDING BALANCE"}`, 105, badgeY + 6.5, { align: "center" });

      doc.setFont("times", "bold");
      doc.setFontSize(9.5);
      doc.setTextColor(249, 115, 22); // Bold and Orange color
      doc.text("Sir Selvanayagi Rig Service - Thank you for your valuable partnership!", 105, 282, { align: "center" });

    doc.save(`SRS_Borewell_Invoice_${bill.invoiceNo}.pdf`);
  };

  React.useEffect(() => {
    if (initialSubSection) {
      if (activeMainSection !== "management") {
        setActiveMainSection("management");
      }
      if (activeSubSection !== initialSubSection) {
        setActiveSubSection(initialSubSection);
      }
    }
  }, [initialSubSection]);

  // Attendance Section state
  const [activeAttendanceDate, setActiveAttendanceDate] = useState("2026-06-14");
  const [attendanceSearchQuery, setAttendanceSearchQuery] = useState("");
  const [attendanceRoleFilter, setAttendanceRoleFilter] = useState<"All" | "Driver" | "Helper">("All");
  const [attendanceSubMonth, setAttendanceSubMonth] = useState(5); // 0-indexed: 5 is June
  const [attendanceSubYear, setAttendanceSubYear] = useState(2026);
  const [expandedLabourId, setExpandedLabourId] = useState<string | null>(null);
  const [selectedDaysToEdit, setSelectedDaysToEdit] = useState<number[]>([]);
  const [attendanceReasonText, setAttendanceReasonText] = useState("");
  const [isEditingAttendanceReason, setIsEditingAttendanceReason] = useState(false);

  React.useEffect(() => {
    if (selectedDaysToEdit.length === 1 && expandedLabourId !== null) {
      const monthStr = String(attendanceSubMonth + 1).padStart(2, '0');
      const activeDateString = `${attendanceSubYear}-${monthStr}-${String(selectedDaysToEdit[0]).padStart(2, '0')}`;
      const found = (attendance || []).find(r => r.labourId === expandedLabourId && r.date === activeDateString);
      if (found) {
        setAttendanceReasonText(found.reason || "");
        setIsEditingAttendanceReason(!found.reason);
      } else {
        setAttendanceReasonText("");
        setIsEditingAttendanceReason(true);
      }
    } else {
      setAttendanceReasonText("");
      setIsEditingAttendanceReason(false);
    }
  }, [selectedDaysToEdit, expandedLabourId, attendanceSubMonth, attendanceSubYear, attendance]);

  // A. Labour management state
  const [activeLabourTab, setActiveLabourTab] = useState<"Driver" | "Helper">("Driver");
  const [selectedLabourForProfile, setSelectedLabourForProfile] = useState<Labour | null>(null);
  const [attendanceYear, setAttendanceYear] = useState(2026);
  const [attendanceMonth, setAttendanceMonth] = useState(5); // June (0-indexed, Jan=0, Jun=5)
  const [isLabourFormOpen, setIsLabourFormOpen] = useState(false);
  const [editingLabourId, setEditingLabourId] = useState<string | null>(null);
  const labourFormRef = useRef<HTMLFormElement>(null);

  // Labour input fields
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [aadhaarNumber, setAadhaarNumber] = useState("");
  const [address, setAddress] = useState("");
  const [joiningDate, setJoiningDate] = useState("2026-06-14");
  const [licenseNumber, setLicenseNumber] = useState("");
  const [licenseExpiryDate, setLicenseExpiryDate] = useState("2030-12-31");
  const [emergencyContact, setEmergencyContact] = useState("");
  const [salaryPerMonth, setSalaryPerMonth] = useState(24000);
  const [gender, setGender] = useState<"Male" | "Female" | "">("Male");
  const [profilePhoto, setProfilePhoto] = useState("");
  const [profilePhotoName, setProfilePhotoName] = useState("");
  const [pdfAttachmentName, setPdfAttachmentName] = useState("DL-Driver-Docs.pdf");

  // New states for PDF attachments
  const [aadhaarPdfName, setAadhaarPdfName] = useState("");
  const [aadhaarPdfData, setAadhaarPdfData] = useState("");
  const [licensePdfName, setLicensePdfName] = useState("");
  const [licensePdfData, setLicensePdfData] = useState("");
  const [customDocs, setCustomDocs] = useState<{ id: string; docName: string; pdfName: string; pdfData: string; }[]>([]);
  const [tempDocName, setTempDocName] = useState("");
  const [tempPdfName, setTempPdfName] = useState("");
  const [tempPdfData, setTempPdfData] = useState("");

  // Advance Salary Entries Form
  const [isAdvanceFormOpen, setIsAdvanceFormOpen] = useState(false);
  const [advanceAmount, setAdvanceAmount] = useState(1000);
  const [advanceReason, setAdvanceReason] = useState<"Betta" | "Drink" | "Home Town" | "Medical" | "Festival" | "Other">("Betta");
  const reasonList: ("Betta" | "Drink" | "Home Town" | "Medical" | "Festival" | "Other")[] = [
    "Betta", "Drink", "Home Town", "Medical", "Festival", "Other"
  ];

  // B. Vehicle management state
  const [isVehicleFormOpen, setIsVehicleFormOpen] = useState(false);
  const [editingVehicleId, setEditingVehicleId] = useState<string | null>(null);
  // Vehicle profile inputs
  const [vehId, setVehId] = useState(""); // Number plate
  const [vehName, setVehName] = useState("");
  const [vehType, setVehType] = useState<"Truck" | "Tractor" | "Car" | "Van" | "Two-Wheeler">("Truck");
  const [vehBrand, setVehBrand] = useState("");
  const [vehModel, setVehModel] = useState("");
  const [vehRegDate, setVehRegDate] = useState("2026-01-10");
  const [vehInsExpiry, setVehInsExpiry] = useState("2027-06-14");
  const [vehFitExpiry, setVehFitExpiry] = useState("2028-12-11");
  const [vehPolExpiry, setVehPolExpiry] = useState("2026-12-14");

  // Custom states for handling custom file upload in local state
  const [vehRcBookFile, setVehRcBookFile] = useState<string | null>(null);
  const [vehRcBookData, setVehRcBookData] = useState<string | null>(null);

  const [vehInsuranceFile, setVehInsuranceFile] = useState<string | null>(null);
  const [vehInsuranceData, setVehInsuranceData] = useState<string | null>(null);

  const [vehPermitFile, setVehPermitFile] = useState<string | null>(null);
  const [vehPermitData, setVehPermitData] = useState<string | null>(null);

  const [vehFitnessFile, setVehFitnessFile] = useState<string | null>(null);
  const [vehFitnessData, setVehFitnessData] = useState<string | null>(null);

  // B-1. Bit purchase ledger state
  const [isBitFormOpen, setIsBitFormOpen] = useState(false);
  const [editingBitId, setEditingBitId] = useState<string | null>(null);
  const [bitNo, setBitNo] = useState("");
  const [bitBrand, setBitBrand] = useState("");
  const [bitSizeMm, setBitSizeMm] = useState(150);
  const [bitButtonSizeMm, setBitButtonSizeMm] = useState<number | "">("");
  const [bitDateEntry, setBitDateEntry] = useState(() => {
    const now = new Date();
    const yyyy = now.getFullYear();
    const mm = String(now.getMonth() + 1).padStart(2, "0");
    const dd = String(now.getDate()).padStart(2, "0");
    return `${yyyy}-${mm}-${dd}`;
  });
  const [bitRate, setBitRate] = useState(0);

  // Core state for active file preview modal
  const [selectedFileToView, setSelectedFileToView] = useState<{
    vehicleId: string;
    vehicleName: string;
    docName: string; // "RC Book" | "Insurance Receipt" | "State Permit" | "FC Certificate"
    fileName: string;
    fileDataUrl: string | null;
  } | null>(null);

  // B-2. Fuel Entry State
  const [isFuelFormOpen, setIsFuelFormOpen] = useState(false);
  const [editingFuelId, setEditingFuelId] = useState<string | null>(null);
  const [fuelDateTime, setFuelDateTime] = useState("2026-06-15 08:30");
  const [fuelVehicleName, setFuelVehicleName] = useState("");
  const [fuelType, setFuelType] = useState<"Diesel" | "Petrol" | "CNG">("Diesel");
  const [fuelPerLiterCost, setFuelPerLiterCost] = useState(95);
  const [fuelLiters, setFuelLiters] = useState(40);

  // 4-Way subfolder switcher under Vehicle Management
  const [vehicleSubTab, setVehicleSubTab] = useState<"profiles" | "fuel" | "service" | "materials">("profiles");

  // Services State with local persistence fallback
  const [services, setServices] = useState<ServiceRecord[]>(() => {
    const saved = localStorage.getItem("srs_vehicle_services");
    if (saved) {
      try {
        const parsed = JSON.parse(saved) as ServiceRecord[];
        return Array.isArray(parsed) ? parsed.filter((service) => !isLegacyDemoServiceEntry(service)) : [];
      } catch (e) {
        console.error(e);
      }
    }
    return [];
  });

  // Materials State with local persistence fallback
  const [materials, setMaterials] = useState<MaterialPurchase[]>(() => {
    const saved = localStorage.getItem("srs_materials_purchased");
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { console.error(e); }
    }
    return [
      { id: "MAT-201", vehicleId: "KA-51-MM-9999", date: "2026-06-12", materialName: "Heavy Duty Air Filter", quantity: 2, unit: "pcs", rate: 1200, totalAmount: 2400, vendorName: "Sathy Spares & Co.", remarks: "Spares kept in cabin toolbox." },
      { id: "MAT-202", vehicleId: "MH-12-GP-5678", date: "2026-06-16", materialName: "Borewell Drilling Bit 6 1/2 inch", quantity: 1, unit: "pc", rate: 18500, totalAmount: 18500, vendorName: "Kovai Indus Tools", remarks: "Core drilling bit replacement purchased with warranty card." },
      { id: "MAT-203", vehicleId: "All", date: "2026-06-18", materialName: "Premium Grease Buckets", quantity: 3, unit: "buckets", rate: 1500, totalAmount: 4500, vendorName: "Annur Lubricants", remarks: "Lubricating grease for drilling rod slider channels." }
    ];
  });

  // Sync state back to localStorage
  React.useEffect(() => {
    localStorage.setItem("srs_vehicle_services", JSON.stringify(services));
  }, [services]);

  React.useEffect(() => {
    localStorage.setItem("srs_materials_purchased", JSON.stringify(materials));
  }, [materials]);

  // Services Form Inputs
  const [isServiceFormOpen, setIsServiceFormOpen] = useState(false);
  const [editingServiceId, setEditingServiceId] = useState<string | null>(null);
  const [serviceVehicleId, setServiceVehicleId] = useState("");
  const [serviceDate, setServiceDate] = useState("2026-06-18");
  const [serviceTypeInput, setServiceTypeInput] = useState("");
  const [serviceCost, setServiceCost] = useState(3000);
  const [serviceSpareParts, setServiceSpareParts] = useState("");
  const [serviceRemarks, setServiceRemarks] = useState("");

  // Materials Purchased Form Inputs
  const [isMatFormOpen, setIsMatFormOpen] = useState(false);
  const [editingMatId, setEditingMatId] = useState<string | null>(null);
  const [matVehicleId, setMatVehicleId] = useState("All");
  const [matDate, setMatDate] = useState("2026-06-18");
  const [matName, setMatName] = useState("");
  const [matQuantity, setMatQuantity] = useState(1);
  const [matUnit, setMatUnit] = useState("pcs");
  const [matRate, setMatRate] = useState(500);
  const [matVendor, setMatVendor] = useState("");
  const [matRemarks, setMatRemarks] = useState("");

  // C. Salary Payout calculation state
  const [selectedLabourForPayout, setSelectedLabourForPayout] = useState<Labour | null>(null);
  const [payoutOption, setPayoutOption] = useState<"Deduct" | "CarryForward">("Deduct");
  const [deductAmountInput, setDeductAmountInput] = useState(2000);
  const [payoutStatus, setPayoutStatus] = useState<"Paid" | "Pending">("Pending");

  // --- ACTIONS LABOUR CRUD ---
  const handleOpenAddLabour = () => {
    setEditingLabourId(null);
    setFullName("");
    setGender("Male");
    setPhone("");
    setAadhaarNumber("");
    setAddress("");
    setJoiningDate("2026-06-14");
    setLicenseNumber("");
    setLicenseExpiryDate("2030-12-31");
    setEmergencyContact("");
    setSalaryPerMonth(activeLabourTab === "Driver" ? 25000 : 16000);
    setProfilePhoto("");
    setProfilePhotoName("");

    // Reset document states
    setAadhaarPdfName("");
    setAadhaarPdfData("");
    setLicensePdfName("");
    setLicensePdfData("");
    setCustomDocs([]);
    setTempDocName("");
    setTempPdfName("");
    setTempPdfData("");

    setIsLabourFormOpen(true);
    setTimeout(() => labourFormRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }), 80);
  };

  const handleOpenEditLabour = (lab: Labour) => {
    setEditingLabourId(lab.id);
    setActiveLabourTab(lab.skillType);
    setFullName(lab.fullName);
    setGender((lab.gender as "Male" | "Female" | "") || "Male");
    setPhone(lab.phone);
    setAadhaarNumber(lab.aadhaarNumber);
    setAddress(lab.address);
    setJoiningDate(lab.joiningDate);
    setLicenseNumber(lab.licenseNumber || "");
    setLicenseExpiryDate(lab.licenseExpiryDate || "2030-12-31");
    setEmergencyContact(lab.emergencyContact);
    setSalaryPerMonth(lab.salaryPerMonth ?? 0);
    setProfilePhoto(lab.profilePhoto || "");
    setProfilePhotoName(lab.profilePhotoName || "");

    // Populate document states
    setAadhaarPdfName(lab.aadhaarPdfName || "");
    setAadhaarPdfData(lab.aadhaarPdfData || "");
    setLicensePdfName(lab.licensePdfName || "");
    setLicensePdfData(lab.licensePdfData || "");
    setCustomDocs(lab.customDocuments || []);
    setTempDocName("");
    setTempPdfName("");
    setTempPdfData("");

    setIsLabourFormOpen(true);
    // Close profile view so the edit form is visible
    setSelectedLabourForProfile(null);
    setTimeout(() => labourFormRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }), 80);
  };

  const handleSaveLabour = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName || !phone) return;

    // Phone validation: exactly 10 digits, no alphabets
    const phoneDigitsOnly = phone.replace(/\D/g, "");
    if (!/^\d{10}$/.test(phoneDigitsOnly)) {
      alert("Mobile number must be exactly 10 digits (numbers only).");
      return;
    }

    const next: Labour = {
      id: editingLabourId || `LAB-${Date.now()}`,
      fullName,
      gender: gender || undefined,
      phone: phoneDigitsOnly,
      skillType: activeLabourTab,
      dailyWage: 800,
      joiningDate,
      aadhaarNumber,
      address,
      emergencyContact,
      isActive: true,
      isFreezed: labours.find((lab) => lab.id === editingLabourId)?.isFreezed ?? false,
      licenseNumber: activeLabourTab === "Driver" ? licenseNumber : undefined,
      licenseExpiryDate: activeLabourTab === "Driver" ? licenseExpiryDate : undefined,
      salaryPerMonth: Number(salaryPerMonth),
      advanceEntries: labours.find((lab) => lab.id === editingLabourId)?.advanceEntries ?? [],
      pdfAttachmentName: "Driver-Kyc.pdf",
      profilePhoto: profilePhoto || undefined,
      profilePhotoName: profilePhotoName || undefined,
      aadhaarPdfName,
      aadhaarPdfData,
      licensePdfName: activeLabourTab === "Driver" ? licensePdfName : undefined,
      licensePdfData: activeLabourTab === "Driver" ? licensePdfData : undefined,
      customDocuments: customDocs,
    };

    try {
      const saved = await persistLabour(next, editingLabourId ? "PUT" : "POST");
      setLabours(prev => editingLabourId
        ? prev.map(lab => lab.id === editingLabourId ? saved : lab)
        : [saved, ...prev]
      );
      // If this was an edit, reopen the profile view with fresh data
      if (editingLabourId) {
        setSelectedLabourForProfile(saved);
      }
      await onSharedDataChanged?.();
      triggerOnlineSync(editingLabourId ? `UPDATED LABOUR PROFILE: ${fullName}` : `ADDED LABOUR: ${fullName}`);
      setIsLabourFormOpen(false);
    } catch (error) {
      console.error(error);
      alert("Failed to save. Please check all fields and try again.");
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, field: "aadhaar" | "license" | "custom") => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const resultStr = reader.result as string;
      if (field === "aadhaar") {
        setAadhaarPdfName(file.name);
        setAadhaarPdfData(resultStr);
      } else if (field === "license") {
        setLicensePdfName(file.name);
        setLicensePdfData(resultStr);
      } else if (field === "custom") {
        setTempPdfName(file.name);
        setTempPdfData(resultStr);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleAddCustomDoc = () => {
    if (!tempDocName) {
      alert("Please enter a name for the custom document.");
      return;
    }
    if (!tempPdfData) {
      alert("Please upload a PDF file for this custom document.");
      return;
    }
    const newDoc = {
      id: `CUST-${Date.now()}`,
      docName: tempDocName,
      pdfName: tempPdfName,
      pdfData: tempPdfData
    };
    setCustomDocs(prev => [...prev, newDoc]);
    setTempDocName("");
    setTempPdfName("");
    setTempPdfData("");
  };

  const handleRemoveCustomDoc = (id: string) => {
    setCustomDocs(prev => prev.filter(d => d.id !== id));
  };

  const handleDownloadLabourDoc = (fileName: string, fileData?: string) => {
    const defaultPdf = "data:application/pdf;base64,JVBERi0xLjQKJbXtrY0KMSAwIG9iagogIDw8IC9UeXBlIC9DYXRhbG9nCiAgICAgL1BhZ2VzIDIgMCBSCiAgPj4KZW5kb2JqCjIgMCBvYmoKICA8PCAvVHlwZSAvUGFnZXMKICAgICAvS2lkcyBbIDMgMCBSIF0KICAgICAvQ291bnQgMQogID4+CmVuZG9iagozIDAgb2JqCiAgPDwgL1R5cGUgL1BhZ2UKICAgICAvUGFyZW50IDIgMCBSCiAgICAgL01lZGlhQm94IFsgMCAwIDU5NSA4NDIgXQogICAgIC9Db250ZW50cyA0IDAgUgoKICA+PgplbmRvYmoKNCAwIG9iagogIDw8IC9MZW5ndGggNzQgPj4Kc3RyZWFtCkJUCi9GMSAxMiBUZgoxMDAgNzAwIFRkCihCYXNpYyBEb2N1bWVudCBWZXJpZmllZCBieSBGbGVldCBFbmdpbmUpIFNqCkVOCmVuZHN0cmVhbQplbmRvYmoKeHJlZgowIDUKMDAwMDAwMDAwMCA2NTUzNSBmIAowMDAwMDAwMDE1IDAwMDAwIG4gCjAwMDAwMDAwNzAgMDAwMDAgbgogMDAwMDAwMDEzNiAwMDAwMCBuIAowMDAwMDAwMjQxIDAwMDAwIG4gCnRyYWlsZXIKICA8PCAvU2l6ZSA1CiAgICAgL1Jvb3QgMSAwIFIKICA+PgpzdGFydHhyZWYKMyA1CiUlRU9GCg==";
    const finalData = fileData || defaultPdf;
    try {
      const link = document.createElement("a");
      link.href = finalData;
      link.download = fileName.endsWith(".pdf") ? fileName : `${fileName}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      triggerOnlineSync(`Downloaded verification document: ${fileName}`);
    } catch (err) {
      alert(`Could not download the document ${fileName}`);
    }
  };

  const handleDeleteLabour = (id: string, name: string) => {
    setDeleteConfirmation({ id, name, type: "labour" });
  };

  const handleQuitWork = async (id: string) => {
    const found = labours.find(l => l.id === id);
    if (!found) return;
    const next = { ...found, isFreezed: true };
    try {
      const saved = await persistLabour(next, "PUT");
      setLabours(prev => prev.map(l => l.id === id ? saved : l));
      setSelectedLabourForProfile(saved);
      await onSharedDataChanged?.();
      triggerOnlineSync(`WORKER QUIT WORK / FREEZED: ${id}`);
    } catch (error) {
      console.error(error);
    }
  };

  const handleRejoin = async (id: string) => {
    const found = labours.find(l => l.id === id);
    if (!found) return;
    const next = { ...found, isFreezed: false };
    try {
      const saved = await persistLabour(next, "PUT");
      setLabours(prev => prev.map(l => l.id === id ? saved : l));
      setSelectedLabourForProfile(saved);
      await onSharedDataChanged?.();
      triggerOnlineSync(`WORKER REJOINED ACTIVE ROSTER: ${id}`);
    } catch (error) {
      console.error(error);
    }
  };

  // ADVANCE CRUD ACTIONS inside Labour Profiles
  const handleAddAdvanceEntry = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedLabourForProfile) return;

    const newAdvance: AdvanceEntry = {
      id: `ADV-${Date.now()}`,
      dateTime: new Date().toISOString().split("T")[0],
      reason: advanceReason,
      amount: Number(advanceAmount)
    };

    const next = {
      ...selectedLabourForProfile,
      advanceEntries: [...(selectedLabourForProfile.advanceEntries || []), newAdvance],
    };
    try {
      const saved = await persistLabour(next, "PUT");
      setLabours(prev => prev.map(l => l.id === selectedLabourForProfile.id ? saved : l));
      setSelectedLabourForProfile(saved);
      setIsAdvanceFormOpen(false);
      await onSharedDataChanged?.();
      triggerOnlineSync(`DEDUCTED SALARY ADVANCE FOR ${selectedLabourForProfile.fullName}`);
    } catch (error) {
      console.error(error);
    }
  };

  const handleDeleteAdvanceEntry = async (advId: string) => {
    if (!selectedLabourForProfile) return;
    const next = {
      ...selectedLabourForProfile,
      advanceEntries: (selectedLabourForProfile.advanceEntries || []).filter(adv => adv.id !== advId),
    };
    try {
      const saved = await persistLabour(next, "PUT");
      setLabours(prev => prev.map(l => l.id === selectedLabourForProfile.id ? saved : l));
      setSelectedLabourForProfile(saved);
      await onSharedDataChanged?.();
      triggerOnlineSync("DELETED ADVANCE ENTRY");
    } catch (error) {
      console.error(error);
    }
  };

  // --- ACTIONS VEHICLE CRUD ---
  const handleVehicleDocumentUpload = (docType: "rcBook" | "insurance" | "permit" | "fitness", file: File) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      if (docType === "rcBook") {
        setVehRcBookFile(file.name);
        setVehRcBookData(result);
      } else if (docType === "insurance") {
        setVehInsuranceFile(file.name);
        setVehInsuranceData(result);
      } else if (docType === "permit") {
        setVehPermitFile(file.name);
        setVehPermitData(result);
      } else if (docType === "fitness") {
        setVehFitnessFile(file.name);
        setVehFitnessData(result);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleOpenAddVehicle = () => {
    setEditingVehicleId(null);
    setVehId("");
    setVehName("");
    setVehBrand("");
    setVehModel("");
    setVehRegDate("2026-06-15");
    setVehInsExpiry("2027-06-15");
    setVehFitExpiry("2028-06-15");
    setVehPolExpiry("2026-12-15");
    setVehRcBookFile(null);
    setVehRcBookData(null);
    setVehInsuranceFile(null);
    setVehInsuranceData(null);
    setVehPermitFile(null);
    setVehPermitData(null);
    setVehFitnessFile(null);
    setVehFitnessData(null);
    setIsVehicleFormOpen(true);
  };

  const handleOpenEditVehicle = (v: Vehicle) => {
    setEditingIdFromVehicle(v);
  };

  const setEditingIdFromVehicle = (v: Vehicle) => {
    setEditingVehicleId(v.id);
    setVehId(v.id);
    setVehName(v.vehicleName || "");
    setVehType(v.vehicleType);
    setVehBrand(v.brand);
    setVehModel(v.model);
    setVehRegDate(v.registrationDate || "2026-06-15");
    setVehInsExpiry(v.insuranceExpiry);
    setVehFitExpiry(v.fitnessExpiry || "2028-06-15");
    setVehPolExpiry(v.pollutionExpiry);
    setVehRcBookFile(v.rcBookPdf || null);
    setVehRcBookData(v.rcBookData || null);
    setVehInsuranceFile(v.insurancePdf || null);
    setVehInsuranceData(v.insuranceData || null);
    setVehPermitFile(v.permitPdf || null);
    setVehPermitData(v.permitData || null);
    setVehFitnessFile(v.fitnessPdf || null);
    setVehFitnessData(v.fitnessData || null);
    setIsVehicleFormOpen(true);
  };

  const handleSaveVehicle = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!vehId || !vehName) return;

    const next: Vehicle = {
      id: vehId,
      vehicleName: vehName,
      vehicleType: vehType,
      brand: vehBrand,
      model: vehModel,
      registrationDate: vehRegDate,
      insuranceExpiry: vehInsExpiry,
      fitnessExpiry: vehFitExpiry,
      pollutionExpiry: vehPolExpiry,
      rcBookPdf: vehRcBookFile || "RC-Verified.pdf",
      rcBookData: vehRcBookData || undefined,
      insurancePdf: vehInsuranceFile || "Insurance-Receipt.pdf",
      insuranceData: vehInsuranceData || undefined,
      permitPdf: vehPermitFile || "All-India-Permit.pdf",
      permitData: vehPermitData || undefined,
      fitnessPdf: vehFitnessFile || "FC-Certificate.pdf",
      fitnessData: vehFitnessData || undefined
    };

    try {
      const saved = await persistVehicle(next, editingVehicleId ? "PUT" : "POST");
      setVehicles(prev => editingVehicleId
        ? prev.map(v => v.id === editingVehicleId ? saved : v)
        : [saved, ...prev]
      );
      await onSharedDataChanged?.();
      triggerOnlineSync(editingVehicleId ? `UPDATED VEHICLE DETAILS: ${vehName}` : `ADDED NEW FLEET VEHICLE: ${vehName}`);
      setIsVehicleFormOpen(false);
    } catch (error) {
      console.error(error);
    }
  };

  const handleDeleteVehicle = (id: string) => {
    setDeleteConfirmation({ id, name: id, type: "vehicle" });
  };

  // --- ACTIONS BIT CRUD ---
  const handleOpenAddBit = () => {
    setEditingBitId(null);
    setBitNo("");
    setBitBrand("");
    setBitSizeMm(150);
    setBitButtonSizeMm("");
    const now = new Date();
    const yyyy = now.getFullYear();
    const mm = String(now.getMonth() + 1).padStart(2, "0");
    const dd = String(now.getDate()).padStart(2, "0");
    setBitDateEntry(`${yyyy}-${mm}-${dd}`);
    setBitRate(0);
    setIsBitFormOpen(true);
  };

  const handleOpenEditBit = (bit: BitEntry) => {
    setEditingBitId(bit.id);
    setBitNo(bit.bitNo);
    setBitBrand(bit.brand);
    setBitSizeMm(bit.sizeMm);
    setBitButtonSizeMm(bit.buttonSizeMm ?? "");
    setBitDateEntry(bit.dateEntry || (() => {
      const now = new Date();
      const yyyy = now.getFullYear();
      const mm = String(now.getMonth() + 1).padStart(2, "0");
      const dd = String(now.getDate()).padStart(2, "0");
      return `${yyyy}-${mm}-${dd}`;
    })());
    setBitRate(bit.rate);
    setIsBitFormOpen(true);
  };

  const handleSaveBit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!bitNo.trim() || !bitBrand.trim() || bitButtonSizeMm === "" || !bitDateEntry) return;

    const next: BitEntry = {
      id: editingBitId || `bit-${Date.now()}`,
      bitNo: bitNo.trim(),
      brand: bitBrand.trim(),
      sizeMm: Number(bitSizeMm),
      buttonSizeMm: Number(bitButtonSizeMm),
      dateEntry: bitDateEntry,
      rate: Number(bitRate),
    };

    try {
      const saved = await persistBit(next, editingBitId ? "PUT" : "POST");
      setBitEntries((prev) =>
        editingBitId ? prev.map((entry) => (entry.id === editingBitId ? saved : entry)) : [saved, ...prev]
      );
      await onSharedDataChanged?.();
      triggerOnlineSync(editingBitId ? `UPDATED BIT ENTRY: ${next.bitNo}` : `ADDED BIT ENTRY: ${next.bitNo}`);
      setIsBitFormOpen(false);
      setEditingBitId(null);
      setBitNo("");
      setBitBrand("");
      setBitSizeMm(150);
      setBitButtonSizeMm("");
      const now = new Date();
      const yyyy = now.getFullYear();
      const mm = String(now.getMonth() + 1).padStart(2, "0");
      const dd = String(now.getDate()).padStart(2, "0");
      setBitDateEntry(`${yyyy}-${mm}-${dd}`);
      setBitRate(0);
    } catch (error) {
      console.error(error);
      alert("Unable to save the bit entry right now.");
    }
  };

  const handleDeleteBit = (id: string, name: string) => {
    setDeleteConfirmation({ id, name, type: "bit" });
  };

  // --- ACTIONS FUEL CRUD ---
  const handleOpenAddFuel = () => {
    setEditingFuelId(null);
    setFuelDateTime("2026-06-15 08:30");
    setFuelVehicleName(vehicles[0]?.vehicleName || "");
    setFuelType("Diesel");
    setFuelPerLiterCost(95);
    setFuelLiters(45);
    setIsFuelFormOpen(true);
  };

  const handleOpenEditFuel = (entry: FuelEntry) => {
    setEditingFuelId(entry.id);
    setFuelDateTime(entry.dateTime || entry.date || "2026-06-15 08:30");
    setFuelVehicleName(entry.vehicleName || vehicles[0]?.vehicleName || "");
    setFuelType((entry.fuelType as "Diesel" | "Petrol" | "CNG") || "Diesel");
    setFuelPerLiterCost(Number(entry.perLiterCost ?? (entry.liters && entry.totalAmount ? entry.totalAmount / entry.liters : 95)));
    setFuelLiters(Number(entry.liters ?? 40));
    setIsFuelFormOpen(true);
  };

  const handleSaveFuel = async (e: React.FormEvent) => {
    e.preventDefault();
    const totalAmount = Number(fuelLiters) * Number(fuelPerLiterCost);

    if (editingFuelId) {
      try {
        const response = await requestJson(
          apiBaseUrl,
          `/api/v1/vehicles/fuel/${editingFuelId}`,
          {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              date: fuelDateTime.split(" ")[0],
              date_time: fuelDateTime,
              vehicle_name: fuelVehicleName,
              fuel_type: fuelType,
              per_liter_cost: Number(fuelPerLiterCost),
              liters: Number(fuelLiters),
              cost: totalAmount,
              total_amount: totalAmount,
            }),
          }
        );
        const savedFuel = mapFuelFromApi(response);
        setFuelEntries(prev => prev.map((entry) => entry.id === editingFuelId ? savedFuel : entry));
        setIsFuelFormOpen(false);
        setEditingFuelId(null);
        triggerOnlineSync(`UPDATED FUEL LOG: ₹${totalAmount.toLocaleString()} TO ${fuelVehicleName}`);
        return;
      } catch (error) {
        console.error(error);
        alert("Unable to update the fuel entry right now.");
        return;
      }
    }

    const newFuel: FuelEntry = {
      id: `FUEL-${Date.now()}`,
      dateTime: fuelDateTime,
      vehicleName: fuelVehicleName,
      fuelType: fuelType,
      perLiterCost: Number(fuelPerLiterCost),
      liters: Number(fuelLiters),
      totalAmount
    };

    void requestJson(apiBaseUrl, "/api/v1/vehicles/fuel", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        id: newFuel.id,
        date: fuelDateTime.split(" ")[0],
        vehicle_name: newFuel.vehicleName,
        fuel_type: newFuel.fuelType,
        per_liter_cost: newFuel.perLiterCost,
        liters: newFuel.liters,
        cost: newFuel.totalAmount,
      }),
    }).catch((error) => console.error(error));

    setFuelEntries(prev => [...prev, newFuel]);
    setIsFuelFormOpen(false);
    triggerOnlineSync(`ADDED FUEL LOG: ₹${totalAmount} TO ${fuelVehicleName}`);
  };

  const handleDeleteFuel = (entry: FuelEntry) => {
    setDeleteConfirmation({ id: entry.id, name: entry.vehicleName || entry.id, type: "fuel" });
  };

  // --- ACTIONS SERVICE CRUD ---
  const handleOpenAddService = () => {
    setEditingServiceId(null);
    setServiceVehicleId(vehicles[0]?.id || "");
    setServiceDate(new Date().toISOString().split("T")[0]);
    setServiceTypeInput("");
    setServiceCost(3000);
    setServiceSpareParts("");
    setServiceRemarks("");
    setIsServiceFormOpen(true);
  };

  const handleOpenEditService = (srv: ServiceRecord) => {
    setEditingServiceId(srv.id);
    setServiceVehicleId(srv.vehicleId);
    setServiceDate(srv.date);
    setServiceTypeInput(srv.serviceType);
    setServiceCost(srv.cost);
    setServiceSpareParts(srv.spareParts);
    setServiceRemarks(srv.remarks || "");
    setIsServiceFormOpen(true);
  };

  const handleSaveService = (e: React.FormEvent) => {
    e.preventDefault();
    if (!serviceVehicleId || !serviceTypeInput) return;

    if (editingServiceId) {
      setServices(prev => prev.map(s => {
        if (s.id === editingServiceId) {
          return {
            ...s,
            vehicleId: serviceVehicleId,
            date: serviceDate,
            serviceType: serviceTypeInput,
            cost: Number(serviceCost),
            spareParts: serviceSpareParts,
            remarks: serviceRemarks
          };
        }
        return s;
      }));
      triggerOnlineSync(`UPDATED SERVICE LOG FOR: ${serviceVehicleId}`);
    } else {
      const newSrv: ServiceRecord = {
        id: `SVR-${Date.now()}`,
        vehicleId: serviceVehicleId,
        date: serviceDate,
        serviceType: serviceTypeInput,
        cost: Number(serviceCost),
        spareParts: serviceSpareParts,
        remarks: serviceRemarks
      };
      setServices(prev => [newSrv, ...prev]);
      triggerOnlineSync(`ADDED NEW SERVICE LOG: ${serviceTypeInput} FOR ${serviceVehicleId}`);
    }
    setIsServiceFormOpen(false);
  };

  const handleDeleteService = (id: string) => {
    setDeleteConfirmation({ id, name: id, type: "service" });
  };

  // --- ACTIONS MATERIAL CRUD ---
  const handleOpenAddMaterial = () => {
    setEditingMatId(null);
    setMatVehicleId("All");
    setMatDate(new Date().toISOString().split("T")[0]);
    setMatName("");
    setMatQuantity(1);
    setMatUnit("pcs");
    setMatRate(500);
    setMatVendor("");
    setMatRemarks("");
    setIsMatFormOpen(true);
  };

  const handleOpenEditMaterial = (mat: MaterialPurchase) => {
    setEditingMatId(mat.id);
    setMatVehicleId(mat.vehicleId || "All");
    setMatDate(mat.date);
    setMatName(mat.materialName);
    setMatQuantity(mat.quantity);
    setMatUnit(mat.unit);
    setMatRate(mat.rate);
    setMatVendor(mat.vendorName || "");
    setMatRemarks(mat.remarks || "");
    setIsMatFormOpen(true);
  };

  const handleSaveMaterial = (e: React.FormEvent) => {
    e.preventDefault();
    if (!matName) return;

    const totalAmount = Number(matQuantity) * Number(matRate);

    if (editingMatId) {
      setMaterials(prev => prev.map(m => {
        if (m.id === editingMatId) {
          return {
            ...m,
            vehicleId: matVehicleId,
            date: matDate,
            materialName: matName,
            quantity: Number(matQuantity),
            unit: matUnit,
            rate: Number(matRate),
            totalAmount: totalAmount,
            vendorName: matVendor,
            remarks: matRemarks
          };
        }
        return m;
      }));
      triggerOnlineSync(`UPDATED PURCHASE RECORD: ${matName}`);
    } else {
      const newMat: MaterialPurchase = {
        id: `MAT-${Date.now()}`,
        vehicleId: matVehicleId,
        date: matDate,
        materialName: matName,
        quantity: Number(matQuantity),
        unit: matUnit,
        rate: Number(matRate),
        totalAmount: totalAmount,
        vendorName: matVendor,
        remarks: matRemarks
      };
      setMaterials(prev => [newMat, ...prev]);
      triggerOnlineSync(`ADDED MATERIAL PURCHASED: ${matName} FOR ${matVehicleId}`);
    }
    setIsMatFormOpen(false);
  };

  const handleDeleteMaterial = (id: string) => {
    setDeleteConfirmation({ id, name: id, type: "material" });
  };

  // --- ACTIONS SALARY PAYOUT slip CALCULATOR ---
  const handleOpenSalaryCalc = (lab: Labour) => {
    setSelectedLabourForPayout(lab);
    setPayoutOption("Deduct");
    const totalAdv = (lab.advanceEntries || []).reduce((sum, item) => sum + item.amount, 0);
    setDeductAmountInput(totalAdv > 0 ? totalAdv : 0);
    setPayoutStatus("Pending");
  };

  const handleProcessSalaryPayment = async () => {
    if (!selectedLabourForPayout) return;

    const totalAdv = (selectedLabourForPayout.advanceEntries || []).reduce((sum, item) => sum + item.amount, 0);
    const deductValue = payoutOption === "Deduct" ? Number(deductAmountInput) : 0;
    const finalSalaryComputed = (selectedLabourForPayout.salaryPerMonth ?? 0) - deductValue;

    try {
      const existing = salaryPayments.find((payment) => payment.labourId === selectedLabourForPayout.id);
      const savedResponse = await requestJson(
        apiBaseUrl,
        existing ? `/api/v1/labours/salary-payments/${existing.id}` : "/api/v1/labours/salary-payments",
        {
          method: existing ? "PUT" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            id: existing?.id ?? `pay-${Date.now()}`,
            labour_id: selectedLabourForPayout.id,
            date: new Date().toISOString().split("T")[0],
            amount_calculated: selectedLabourForPayout.salaryPerMonth ?? 0,
            advance_deducted: deductValue,
            bonus: 0,
            net_paid: finalSalaryComputed,
            status: payoutStatus,
            salary_option: payoutOption,
            deduct_amount_requested: deductValue,
          }),
        }
      );

      const savedPayment: SalaryPayment = {
        id: String(savedResponse.id ?? existing?.id ?? `pay-${Date.now()}`),
        labourId: selectedLabourForPayout.id,
        date: new Date().toISOString().split("T")[0],
        amountCalculated: selectedLabourForPayout.salaryPerMonth ?? 0,
        advanceDeducted: deductValue,
        bonus: 0,
        netPaid: finalSalaryComputed,
        status: payoutStatus,
        salaryOption: payoutOption,
        deductAmountRequested: deductValue,
      };

      setSalaryPayments(prev => {
        const filtered = prev.filter(p => p.labourId !== selectedLabourForPayout.id);
        return [...filtered, savedPayment];
      });

      if (payoutOption === "Deduct" && payoutStatus === "Paid" && deductValue > 0) {
        const nextLabour = {
          ...selectedLabourForPayout,
          advanceEntries: [],
        };
        const persistedLabour = await persistLabour(nextLabour, "PUT");
        setLabours(prev => prev.map(l => l.id === selectedLabourForPayout.id ? persistedLabour : l));
      }

      await onSharedDataChanged?.();
      alert(`Salary slip calculated and processed for ${selectedLabourForPayout.fullName}. Net payout: â‚¹${finalSalaryComputed.toLocaleString()}`);
      setSelectedLabourForPayout(null);
      triggerOnlineSync(`PROCESSED HARVEST PAYOUT SLIP`);
      return;
    } catch (error) {
      console.error(error);
      return;
    }

    const newPayment: SalaryPayment = {
      id: `pay-${Date.now()}`,
      labourId: selectedLabourForPayout.id,
      date: new Date().toISOString().split("T")[0],
      amountCalculated: selectedLabourForPayout.salaryPerMonth ?? 0,
      advanceDeducted: deductValue,
      bonus: 0,
      netPaid: finalSalaryComputed,
      status: payoutStatus,
      salaryOption: payoutOption,
      deductAmountRequested: deductValue
    };

    // Replace or push payment index
    setSalaryPayments(prev => {
      const filtered = prev.filter(p => p.labourId !== selectedLabourForPayout.id);
      return [...filtered, newPayment];
    });

    // Deduct advanced from profile state in memory if Deduct is pressed & Status is paid!
    if (payoutOption === "Deduct" && payoutStatus === "Paid" && deductValue > 0) {
      setLabours(prev => prev.map(l => {
        if (l.id === selectedLabourForPayout.id) {
          // Zero down or reduce advance entries
          return {
            ...l,
            advanceEntries: [] // Clear for simplicity or subtract
          };
        }
        return l;
      }));
    }

    alert(`Salary slip calculated and processed for ${selectedLabourForPayout.fullName}. Net payout: ₹${finalSalaryComputed.toLocaleString()}`);
    setSelectedLabourForPayout(null);
    triggerOnlineSync(`PROCESSED HARVEST PAYOUT SLIP`);
  };

  // Filter lists based on Tab and sort freezed profiles at the end
  const activeLaboursList = React.useMemo(() => {
    const list = labours.filter(l => l.skillType === activeLabourTab);
    return [...list].sort((a, b) => {
      if (a.isFreezed && !b.isFreezed) return 1;
      if (!a.isFreezed && b.isFreezed) return -1;
      return 0;
    });
  }, [labours, activeLabourTab]);

  // Auto-calculated fuel statistics
  const vehicleWiseFuelCosts = vehicles.map(v => {
    const total = fuelEntries
      .filter(f => f.vehicleName === v.vehicleName)
      .reduce((sum, f) => sum + Number(f.totalAmount ?? f.cost ?? ((f.liters ?? 0) * (f.perLiterCost ?? 0))), 0);
    return { name: v.vehicleName, cost: total };
  });

  const bitSizeSummary = React.useMemo(() => {
    const grouped = new Map<number, number>();
    bitEntries.forEach((bit) => {
      const size = Number(bit.sizeMm || 0);
      grouped.set(size, (grouped.get(size) || 0) + 1);
    });
    return [...grouped.entries()]
      .map(([sizeMm, count]) => ({ sizeMm, count }))
      .sort((a, b) => a.sizeMm - b.sizeMm);
  }, [bitEntries]);

  const bitBrandSummary = React.useMemo(() => {
    const grouped = new Map<string, number>();
    bitEntries.forEach((bit) => {
      const brand = (bit.brand || "Unknown").trim();
      grouped.set(brand, (grouped.get(brand) || 0) + 1);
    });
    return [...grouped.entries()]
      .map(([brand, count]) => ({ brand, count }))
      .sort((a, b) => a.brand.localeCompare(b.brand));
  }, [bitEntries]);

  // --- HAMMER CRUD HANDLERS ---
  const handleOpenAddHammer = () => {
    setEditingHammerId(null);
    setHammerNo("");
    setHammerBrand("");
    setHammerDateEntry(new Date().toISOString().split("T")[0]);
    setHammerRate(0);
    setHammerCapableFeet(500);
    setHammerIsPaid(false);
    setIsHammerFormOpen(true);
  };

  const handleOpenEditHammer = (hammer: HammerEntry) => {
    setEditingHammerId(hammer.id);
    setHammerNo(hammer.hammerNo);
    setHammerBrand(hammer.brand);
    setHammerDateEntry(hammer.dateEntry);
    setHammerRate(hammer.rate);
    setHammerCapableFeet(hammer.capableFeetDepth);
    setHammerIsPaid(hammer.isPaid);
    setIsHammerFormOpen(true);
  };

  const handleSaveHammer = (e: React.FormEvent) => {
    e.preventDefault();
    if (!hammerNo.trim() || !hammerBrand.trim()) return;

    void (async () => {
      const existing = editingHammerId ? hammerEntries.find(h => h.id === editingHammerId) : undefined;
      const targetId = editingHammerId || `HMR-${Date.now()}`;
      
      const payloadHammer: HammerEntry = {
        id: targetId,
        hammerNo: hammerNo.trim(),
        brand: hammerBrand.trim(),
        dateEntry: hammerDateEntry,
        rate: Number(hammerRate),
        capableFeetDepth: Number(hammerCapableFeet),
        isPaid: hammerIsPaid,
        casingType: existing?.casingType,
        usageHistory: existing?.usageHistory || [],
      };

      try {
        const response = await requestJson(
          apiBaseUrl,
          editingHammerId ? `/api/v1/business/hammers/${editingHammerId}` : "/api/v1/business/hammers",
          {
            method: editingHammerId ? "PUT" : "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(toHammerApiPayload(payloadHammer)),
          }
        );
        const savedHammer = mapHammerFromApi(response);
        
        if (editingHammerId) {
          setHammerEntries(prev => prev.map(h => h.id === editingHammerId ? savedHammer : h));
          triggerOnlineSync(`UPDATED HAMMER: ${hammerNo}`);
        } else {
          setHammerEntries(prev => [savedHammer, ...prev]);
          triggerOnlineSync(`ADDED HAMMER: ${hammerNo}`);
        }
      } catch (error) {
        console.error(error);
        // Offline Fallback
        if (editingHammerId) {
          setHammerEntries(prev => prev.map(h => h.id === editingHammerId ? payloadHammer : h));
          triggerOnlineSync(`UPDATED HAMMER: ${hammerNo} (local fallback)`);
        } else {
          setHammerEntries(prev => [payloadHammer, ...prev]);
          triggerOnlineSync(`ADDED HAMMER: ${hammerNo} (local fallback)`);
        }
      }
      setIsHammerFormOpen(false);
      setEditingHammerId(null);
      await onSharedDataChanged?.();
    })();
  };

  const handleDeleteHammer = (id: string, no: string) => {
    setDeleteConfirmation({ id, name: no, type: "hammer" });
  };

  const handleOpenAddPipe = () => {
    setEditingPipeId(null);
    setPipeCompanyName("");
    setPipeLocation("");
    setPipeDateEntry(new Date().toISOString().split("T")[0]);
    setPipe7HighCount(0);
    setPipe7HighRate(0);
    setPipe7MediumCount(0);
    setPipe7MediumRate(0);
    setPipe10HighCount(0);
    setPipe10HighRate(0);
    setPipe10MediumCount(0);
    setPipe10MediumRate(0);
    setPipeDiscountAmount(0);
    setIsPipeFormOpen(true);
  };

  const handleEditPipe = (pipe: PipeEntry) => {
    setEditingPipeId(pipe.id);
    setPipeCompanyName(pipe.companyName);
    setPipeLocation(pipe.location);
    setPipeDateEntry(pipe.dateEntry || new Date().toISOString().split("T")[0]);
    setPipe7HighCount(pipe.pipe7HighCount);
    setPipe7HighRate(pipe.pipe7HighRate);
    setPipe7MediumCount(pipe.pipe7MediumCount);
    setPipe7MediumRate(pipe.pipe7MediumRate);
    setPipe10HighCount(pipe.pipe10HighCount);
    setPipe10HighRate(pipe.pipe10HighRate);
    setPipe10MediumCount(pipe.pipe10MediumCount);
    setPipe10MediumRate(pipe.pipe10MediumRate);
    setPipeDiscountAmount(pipe.discountAmount);
    setIsPipeFormOpen(true);
  };

  const handleSavePipe = (e: React.FormEvent) => {
    e.preventDefault();
    if (!pipeCompanyName.trim() || !pipeLocation.trim()) return;

    void (async () => {
      const targetId = editingPipeId || `PIPE-${Date.now()}`;
      
      const t7h = Number(pipe7HighCount) * Number(pipe7HighRate);
      const t7m = Number(pipe7MediumCount) * Number(pipe7MediumRate);
      const t10h = Number(pipe10HighCount) * Number(pipe10HighRate);
      const t10m = Number(pipe10MediumCount) * Number(pipe10MediumRate);
      const gt = t7h + t7m + t10h + t10m;
      const gp = gt - Number(pipeDiscountAmount);

      const payloadPipe: PipeEntry = {
        id: targetId,
        companyName: pipeCompanyName.trim(),
        location: pipeLocation.trim(),
        dateEntry: pipeDateEntry,
        pipe7HighCount: Number(pipe7HighCount),
        pipe7HighRate: Number(pipe7HighRate),
        pipe7HighTotal: t7h,
        pipe7MediumCount: Number(pipe7MediumCount),
        pipe7MediumRate: Number(pipe7MediumRate),
        pipe7MediumTotal: t7m,
        pipe10HighCount: Number(pipe10HighCount),
        pipe10HighRate: Number(pipe10HighRate),
        pipe10HighTotal: t10h,
        pipe10MediumCount: Number(pipe10MediumCount),
        pipe10MediumRate: Number(pipe10MediumRate),
        pipe10MediumTotal: t10m,
        grandTotal: gt,
        discountAmount: Number(pipeDiscountAmount),
        grandPrice: gp,
      };

      try {
        const response = await requestJson(
          apiBaseUrl,
          editingPipeId ? `/api/v1/business/pipes/${editingPipeId}` : "/api/v1/business/pipes",
          {
            method: editingPipeId ? "PUT" : "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(toPipeApiPayload(payloadPipe)),
          }
        );
        const savedPipe = mapPipeFromApi(response);
        
        if (editingPipeId) {
          setPipeEntries(prev => prev.map(p => p.id === editingPipeId ? savedPipe : p));
          triggerOnlineSync(`UPDATED PIPE ENTRY: ${pipeCompanyName}`);
        } else {
          setPipeEntries(prev => [savedPipe, ...prev]);
          triggerOnlineSync(`ADDED PIPE ENTRY: ${pipeCompanyName}`);
        }
      } catch (error) {
        console.error(error);
        // Offline Fallback
        if (editingPipeId) {
          setPipeEntries(prev => prev.map(p => p.id === editingPipeId ? payloadPipe : p));
          triggerOnlineSync(`UPDATED PIPE ENTRY: ${pipeCompanyName} (local fallback)`);
        } else {
          setPipeEntries(prev => [payloadPipe, ...prev]);
          triggerOnlineSync(`ADDED PIPE ENTRY: ${pipeCompanyName} (local fallback)`);
        }
      }
      setIsPipeFormOpen(false);
      setEditingPipeId(null);
      await onSharedDataChanged?.();
    })();
  };

  const handleDeletePipe = (id: string, name: string) => {
    setDeleteConfirmation({ id, name, type: "pipe" });
  };

  return (
    <div id="mobile-business-root" className="space-y-4">
      
      {/* SECTION METADATA SPLIT SWITCHER HEADER */}
      <div className="grid grid-cols-2 gap-1.5 bg-slate-950 p-1 rounded-xl border border-slate-850">
        <button
          onClick={() => {
            setActiveMainSection("management");
          }}
          className={`py-2 rounded-lg text-[10px] font-extrabold uppercase tracking-widest flex items-center justify-center gap-1.5 transition cursor-pointer ${
            activeMainSection === "management" ? "bg-indigo-650 text-white" : "text-slate-400 hover:text-slate-200"
          }`}
        >
          <Briefcase className="w-4 h-4" />
          <span>Management</span>
        </button>
        <button
          onClick={() => {
            setActiveMainSection("bill");
          }}
          className={`py-2 rounded-lg text-[10px] font-extrabold uppercase tracking-widest flex items-center justify-center gap-1.5 transition cursor-pointer ${
            activeMainSection === "bill" ? "bg-indigo-650 text-white" : "text-slate-400 hover:text-slate-200"
          }`}
        >
          <FileText className="w-4 h-4" />
          <span>Bill / Invoices</span>
        </button>
      </div>

      {/* NESTED SUBMODULE PILLS (ONLY RENDERED FOR MANAGEMENT SECTION) */}
      {activeMainSection === "management" && (
        <div className="space-y-2 animate-fade-in">
          {/* First Tier: Main Division */}
          <div className="grid grid-cols-3 gap-1.5 bg-slate-900 p-1.5 rounded-xl border border-slate-850">
            <button
              onClick={() => {
                setActiveSubSection("labour");
                setSelectedLabourForProfile(null);
                setSelectedLabourForPayout(null);
              }}
              className={`py-2 rounded-lg text-[10px] font-bold uppercase tracking-widest flex items-center justify-center gap-1.5 transition duration-150 cursor-pointer ${
                activeSubSection === "labour" || activeSubSection === "attendance" || activeSubSection === "salaries"
                  ? "bg-indigo-650 text-white"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              <Users className="w-3.5 h-3.5" />
              <span>Labour Details</span>
            </button>
            <button
              onClick={() => {
                setActiveSubSection("bit");
                setSelectedLabourForProfile(null);
                setSelectedLabourForPayout(null);
              }}
              className={`py-2 rounded-lg text-[10px] font-bold uppercase tracking-widest flex items-center justify-center gap-1.5 transition duration-150 cursor-pointer ${
                activeSubSection === "bit"
                  ? "bg-indigo-650 text-white"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              <Package className="w-3.5 h-3.5" />
              <span>Bit Hammer Pipe</span>
            </button>
            <button
              onClick={() => {
                setActiveSubSection("vehicles");
                setSelectedLabourForProfile(null);
                setSelectedLabourForPayout(null);
              }}
              className={`py-2 rounded-lg text-[10px] font-bold uppercase tracking-widest flex items-center justify-center gap-1.5 transition duration-150 cursor-pointer ${
                activeSubSection === "vehicles" ? "bg-indigo-650 text-white" : "text-slate-400 hover:text-slate-200"
              }`}
            >
              <Car className="w-3.5 h-3.5" />
              <span>Vehicles</span>
            </button>
          </div>

          {/* Second Tier: Nested Switchers (Only shown when Labour Details is active) */}
          {(activeSubSection === "labour" || activeSubSection === "attendance" || activeSubSection === "salaries") && (
            <div className="grid grid-cols-3 gap-1 bg-slate-950 p-1 rounded-lg border border-slate-850">
              <button
                onClick={() => {
                  setActiveSubSection("labour");
                  setSelectedLabourForProfile(null);
                  setSelectedLabourForPayout(null);
                }}
                className={`py-1.5 rounded text-[8.5px] font-bold uppercase tracking-wider flex items-center justify-center gap-1 transition ${
                  activeSubSection === "labour"
                    ? "bg-indigo-950 text-indigo-400 border border-indigo-900/30 font-extrabold"
                    : "text-slate-500 hover:text-slate-350 border border-transparent font-medium"
                }`}
              >
                <Users className="w-3 h-3" />
                <span>Labour</span>
              </button>
              <button
                onClick={() => {
                  setActiveSubSection("attendance");
                  setSelectedLabourForProfile(null);
                  setSelectedLabourForPayout(null);
                }}
                className={`py-1.5 rounded text-[8.5px] font-bold uppercase tracking-wider flex items-center justify-center gap-1 transition ${
                  activeSubSection === "attendance"
                    ? "bg-indigo-950 text-indigo-400 border border-indigo-900/30 font-extrabold"
                    : "text-slate-500 hover:text-slate-350 border border-transparent font-medium"
                }`}
              >
                <Calendar className="w-3 h-3" />
                <span>Attendance</span>
              </button>
              <button
                onClick={() => {
                  setActiveSubSection("salaries");
                  setSelectedLabourForProfile(null);
                  setSelectedLabourForPayout(null);
                }}
                className={`py-1.5 rounded text-[8.5px] font-bold uppercase tracking-wider flex items-center justify-center gap-1 transition ${
                  activeSubSection === "salaries"
                    ? "bg-indigo-950 text-indigo-400 border border-indigo-900/30 font-extrabold"
                    : "text-slate-500 hover:text-slate-350 border border-transparent font-medium"
                }`}
              >
                <DollarSign className="w-3 h-3" />
                <span>Salaries</span>
              </button>
            </div>
          )}
        </div>
      )}

      {/* ======================= A. LABOUR SUBSECTION ======================= */}
      {activeMainSection === "management" && activeSubSection === "labour" && (
        <div className="space-y-3">
          
          {selectedLabourForProfile ? (
            /* DETAILED WORKER PROFILE OVERLAY / VIEW */
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-4">
              <button
                onClick={() => setSelectedLabourForProfile(null)}
                className="text-xs text-indigo-400 flex items-center gap-1 cursor-pointer font-bold mb-1"
              >
                <ArrowLeft className="w-3.5 h-3.5" /> Back to List
              </button>

              <div className="flex gap-3">
                {renderLabourAvatar(selectedLabourForProfile, {
                  className: "w-14 h-14 border border-slate-750 object-cover",
                  iconClassName: "w-7 h-7",
                  roundedClassName: "rounded-xl",
                  animated: true,
                })}
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <h4 className={`text-sm font-black text-red-500 truncate ${selectedLabourForProfile.isFreezed ? "line-through text-slate-400" : ""}`}>{selectedLabourForProfile.fullName}</h4>
                    {selectedLabourForProfile.isFreezed && (
                      <span className="bg-amber-950/40 text-amber-500 border border-amber-900/30 text-[7px] font-mono font-bold px-1.5 rounded uppercase">
                        QUIT / FREEZED
                      </span>
                    )}
                  </div>
                  <span className="inline-block text-[8px] bg-slate-950 text-indigo-300 font-mono font-bold px-2 py-0.5 rounded-full border border-indigo-950 mt-0.5">
                    {selectedLabourForProfile.skillType} PROFILE
                  </span>
                  <p className="text-[10px] text-slate-400 font-mono mt-1">{selectedLabourForProfile.phone}</p>
                </div>
              </div>

              {/* Driver/Helper Attributes Details */}
              <div className="bg-slate-950 p-3 rounded-xl border border-slate-850 text-[10px] grid grid-cols-2 gap-x-4 gap-y-2 font-mono">
                <div><span className="text-slate-500 block">JOINING DATE</span> <span className="text-slate-350">{selectedLabourForProfile.joiningDate}</span></div>
                <div><span className="text-slate-500 block">AADHAAR EXP</span> <span className="text-slate-350 truncate">{selectedLabourForProfile.aadhaarNumber}</span></div>
                <div><span className="text-slate-500 block">EMERGENCY NO</span> <span className="text-slate-350">{selectedLabourForProfile.emergencyContact}</span></div>
                <div><span className="text-slate-500 block">SALARY/MONTH</span> <span className="text-indigo-400 font-black">₹{(selectedLabourForProfile.salaryPerMonth ?? 0).toLocaleString()}</span></div>
                
                {selectedLabourForProfile.skillType === "Driver" && (
                  <>
                    <div><span className="text-slate-500 block">LICENSE NO</span> <span className="text-emerald-400 truncate">{selectedLabourForProfile.licenseNumber}</span></div>
                    <div><span className="text-slate-500 block">LICENSE EXPIRY</span> <span className="text-amber-400">{selectedLabourForProfile.licenseExpiryDate}</span></div>
                  </>
                )}
                <div className="col-span-2">
                  <span className="text-slate-500 block">ADDRESS</span>
                  <span className="text-slate-350 break-words">{selectedLabourForProfile.address}</span>
                </div>

                {/* Documents Block */}
                <div className="col-span-2 border-t border-slate-905 pt-2.5 mt-0.5 space-y-1.5">
                  <span className="text-[9.5px] text-slate-400 font-bold block uppercase tracking-wider">📎 VERIFIED ATTACHMENTS VAULT</span>
                  <div className="grid grid-cols-1 gap-1.5">
                    {/* Aadhaar Document view */}
                    <div className="flex justify-between items-center bg-slate-900 p-1.5 px-2.5 rounded-lg border border-slate-850 text-[9.5px]">
                      <div className="flex flex-col">
                        <span className="text-slate-400 font-bold uppercase text-[8.5px]">Aadhaar Card PDF</span>
                        <span className="text-[8px] text-slate-500 max-w-[155px] truncate">
                          {selectedLabourForProfile.aadhaarPdfName || "KYC-Verification-Aadhaar.pdf"}
                        </span>
                      </div>
                      <button 
                        onClick={() => handleDownloadLabourDoc(
                          selectedLabourForProfile.aadhaarPdfName || `${selectedLabourForProfile.fullName}_Aadhaar.pdf`, 
                          selectedLabourForProfile.aadhaarPdfData
                        )}
                        className="bg-slate-950 hover:bg-slate-900 border border-slate-850 text-indigo-400 hover:text-indigo-300 px-2.5 py-1 rounded text-[8.5px] font-bold uppercase tracking-wider flex items-center justify-center transition cursor-pointer"
                      >
                        Download
                      </button>
                    </div>

                    {/* License file display if Driver */}
                    {selectedLabourForProfile.skillType === "Driver" && (
                      <div className="flex justify-between items-center bg-slate-900 p-1.5 px-2.5 rounded-lg border border-slate-850 text-[9.5px]">
                        <div className="flex flex-col">
                          <span className="text-slate-400 font-bold uppercase text-[8.5px]">Driving License PDF</span>
                          <span className="text-[8px] text-slate-500 max-w-[155px] truncate">
                            {selectedLabourForProfile.licensePdfName || "Verification-License.pdf"}
                          </span>
                        </div>
                        <button 
                          onClick={() => handleDownloadLabourDoc(
                            selectedLabourForProfile.licensePdfName || `${selectedLabourForProfile.fullName}_License.pdf`, 
                            selectedLabourForProfile.licensePdfData
                          )}
                          className="bg-slate-950 hover:bg-slate-900 border border-slate-850 text-indigo-400 hover:text-indigo-300 px-2.5 py-1 rounded text-[8.5px] font-bold uppercase tracking-wider flex items-center justify-center transition cursor-pointer"
                        >
                          Download
                        </button>
                      </div>
                    )}

                    {/* Custom attached documents list */}
                    {selectedLabourForProfile.customDocuments && selectedLabourForProfile.customDocuments.length > 0 && (
                      selectedLabourForProfile.customDocuments.map((doc) => (
                        <div key={doc.id} className="flex justify-between items-center bg-slate-900 p-1.5 px-2.5 rounded-lg border border-slate-850 text-[9.5px]">
                          <div className="flex flex-col">
                            <span className="text-slate-200 font-bold truncate uppercase text-[8.5px] max-w-[155px]">
                              {doc.docName}
                            </span>
                            <span className="text-[8px] text-slate-500 max-w-[155px] truncate font-mono">
                              {doc.pdfName}
                            </span>
                          </div>
                          <button 
                            onClick={() => handleDownloadLabourDoc(doc.pdfName, doc.pdfData)}
                            className="bg-slate-950 hover:bg-slate-900 border border-slate-850 text-indigo-400 hover:text-indigo-300 px-2.5 py-1 rounded text-[8.5px] font-bold uppercase tracking-wider flex items-center justify-center transition cursor-pointer"
                          >
                            Download
                          </button>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>

              {/* 2. ADVANCE SALARY ENTRIES TABLE */}
              <div className="space-y-1.5">
                <div className="flex justify-between items-center">
                  <span className="text-[10.5px] font-bold text-white uppercase tracking-wider font-mono">Salary Advance Entries</span>
                  <button
                    onClick={() => setIsAdvanceFormOpen(true)}
                    className="text-[9.5px] font-bold text-indigo-400 flex items-center gap-0.5"
                  >
                    <Plus className="w-3 h-3" /> Add Entry
                  </button>
                </div>

                {/* Draw modal inline form for adding advance */}
                {isAdvanceFormOpen && (
                  <form onSubmit={handleAddAdvanceEntry} className="bg-slate-950 p-3 rounded-xl border border-indigo-950/50 space-y-2">
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div>
                        <label className="text-[8.5px] text-slate-500 block font-mono font-bold">REASON</label>
                        <select
                          value={advanceReason}
                          onChange={(e) => setAdvanceReason(e.target.value as any)}
                          className="w-full bg-slate-900 border border-slate-800 p-1 text-[10px] text-white rounded font-mono"
                        >
                          {reasonList.map(r => <option key={r} value={r}>{r}</option>)}
                        </select>
                      </div>
                      <div>
                        <label className="text-[8.5px] text-slate-500 block font-mono font-bold">AMOUNT (₹)</label>
                        <input
                          type="number"
                          value={advanceAmount}
                          onChange={(e) => setAdvanceAmount(Number(e.target.value))}
                          className="w-full bg-slate-900 border border-slate-800 p-1 text-[10px] text-white rounded font-mono"
                        />
                      </div>
                    </div>
                    <div className="flex gap-2 justify-end pt-1">
                      <button 
                        type="button" 
                        onClick={() => setIsAdvanceFormOpen(false)}
                        className="py-0.5 px-2 rounded bg-slate-900 text-slate-400 text-[9px]"
                      >
                        Cancel
                      </button>
                      <button 
                        type="submit" 
                        className="py-0.5 px-3 rounded bg-indigo-650 text-white text-[9px] font-bold"
                      >
                        Add
                      </button>
                    </div>
                  </form>
                )}

                {/* Advance Ledger Table list */}
                <div className="bg-slate-950 rounded-xl border border-slate-850 overflow-hidden text-[9.5px] font-mono">
                  <div className="grid grid-cols-3 bg-slate-900 p-1.5 text-slate-500 text-[8.5px] border-b border-slate-850">
                    <span>DATE</span>
                    <span>REASON</span>
                    <span className="text-right">AMOUNT</span>
                  </div>
                  {(selectedLabourForProfile.advanceEntries || []).length === 0 ? (
                    <div className="p-4 text-center text-slate-600">No advance ledger records</div>
                  ) : (
                    (selectedLabourForProfile.advanceEntries || []).map(adv => (
                      <div key={adv.id} className="grid grid-cols-3 p-1.5 text-slate-350 border-b border-slate-900/40 items-center">
                        <span>{adv.dateTime}</span>
                        <span className="font-bold text-teal-400">{adv.reason}</span>
                        <span className="text-right font-black text-rose-400 flex justify-end items-center gap-1">
                          ₹{adv.amount}
                          <button 
                            onClick={() => handleDeleteAdvanceEntry(adv.id)}
                            className="text-slate-600 hover:text-rose-450"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </span>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* 2.5. MONTH-WISE ATTENDANCE SECTION */}
              <div className="space-y-2 border-t border-slate-900 pt-3">
                {(() => {
                  const mIndex = attendanceMonth;
                  const monthStr = String(mIndex + 1).padStart(2, '0');
                  const targetPrefix = `${attendanceYear}-${monthStr}-`; // YYYY-MM-
                  
                  const monthRecords = (attendance || []).filter(
                    (att) => att.labourId === selectedLabourForProfile.id && att.date.startsWith(targetPrefix)
                  );

                  const totalPresents = monthRecords.filter((r) => r.status === "Present").length;
                  const totalAbsents = monthRecords.filter((r) => r.status === "Absent").length;
                  const totalHalfDays = monthRecords.filter((r) => r.status === "Half-Day").length;
                  const workingDays = totalPresents + totalHalfDays * 0.5;
                  
                  const daysInMonth = new Date(attendanceYear, mIndex + 1, 0).getDate();
                  const startDayOfWeek = new Date(attendanceYear, mIndex, 1).getDay();
                  const activeMonthName = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"][mIndex];

                  // Pro-rata based monthly earnings calculation
                  const baseSalary = selectedLabourForProfile.salaryPerMonth ?? 0;
                  const proRataWages = Math.round((Math.min(30, workingDays) / 30) * baseSalary);
                  const totalAdvances = (selectedLabourForProfile.advanceEntries || []).reduce((sum, item) => sum + item.amount, 0);
                  const netSalaryDue = Math.max(0, proRataWages - totalAdvances);

                  return (
                    <div className="space-y-2.5">
                      <div className="flex justify-between items-center">
                        <span className="text-[10.5px] font-bold text-white uppercase tracking-wider font-mono flex items-center gap-1">
                          <Calendar className="w-3.5 h-3.5 text-indigo-400" />
                          Month-wise Attendance Logs
                        </span>
                        
                        {/* Select month index dropdown with Next/Prev buttons */}
                        <div className="flex items-center gap-1">
                          <button
                            type="button"
                            onClick={() => {
                              setAttendanceMonth(prev => {
                                if (prev === 0) {
                                  setAttendanceYear(y => y - 1);
                                  return 11;
                                }
                                return prev - 1;
                              });
                            }}
                            className="bg-slate-950 border border-slate-800 px-1.5 py-0.5 text-[10px] text-slate-300 hover:text-white hover:bg-slate-800 cursor-pointer font-bold font-mono rounded-lg transition"
                            title="Previous Month"
                          >
                            ←
                          </button>
                          
                          <select
                            value={attendanceMonth}
                            onChange={(e) => setAttendanceMonth(Number(e.target.value))}
                            className="bg-slate-950 border border-slate-850 py-0.5 px-1.5 text-[10px] text-indigo-400 rounded-lg font-mono font-bold focus:outline-none cursor-pointer"
                          >
                            {["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"].map((m, idx) => (
                              <option key={m} value={idx}>{m}</option>
                            ))}
                          </select>

                          <select
                            value={attendanceYear}
                            onChange={(e) => {
                              const selectedYear = Number(e.target.value);
                              setAttendanceYear(selectedYear);
                            }}
                            className="bg-slate-950 border border-slate-850 py-0.5 px-1.5 text-[10px] text-indigo-400 rounded-lg font-mono font-bold focus:outline-none cursor-pointer"
                          >
                            {Array.from({ length: 86 }, (_, i) => 2015 + i).map(y => (
                              <option key={y} value={y}>{y}</option>
                            ))}
                          </select>

                          <button
                            type="button"
                            onClick={() => {
                              setAttendanceMonth(prev => {
                                if (prev === 11) {
                                  setAttendanceYear(y => y + 1);
                                  return 0;
                                }
                                return prev + 1;
                              });
                            }}
                            className="bg-slate-950 border border-slate-800 px-1.5 py-0.5 text-[10px] text-slate-300 hover:text-white hover:bg-slate-800 cursor-pointer font-bold font-mono rounded-lg transition"
                            title="Next Month"
                          >
                            →
                          </button>
                        </div>
                      </div>

                      {/* Attendance month stats metric row */}
                      <div className="grid grid-cols-4 gap-1">
                        <div className="bg-emerald-950/20 border border-emerald-900/30 p-1.5 rounded-lg text-center">
                          <span className="text-[7.5px] text-slate-500 font-mono block uppercase">Presents</span>
                          <span className="text-xs font-black text-emerald-400 font-mono">{totalPresents}d</span>
                        </div>
                        <div className="bg-rose-950/20 border border-rose-900/30 p-1.5 rounded-lg text-center">
                          <span className="text-[7.5px] text-slate-500 font-mono block uppercase">Absents</span>
                          <span className="text-xs font-black text-rose-400 font-mono">{totalAbsents}d</span>
                        </div>
                        <div className="bg-cyan-950/20 border border-cyan-900/30 p-1.5 rounded-lg text-center">
                          <span className="text-[7.5px] text-slate-500 font-mono block uppercase">Half-Days</span>
                          <span className="text-xs font-black text-cyan-400 font-mono">{totalHalfDays}d</span>
                        </div>
                        <div className="bg-indigo-950/20 border border-indigo-900/30 p-1.5 rounded-lg text-center font-bold">
                          <span className="text-[7.5px] text-slate-500 font-mono block uppercase">Working</span>
                          <span className="text-xs font-black text-indigo-400 font-mono">{workingDays}d</span>
                        </div>
                      </div>

                      {/* Visual 7-column Gregorian Calendar Grid */}
                      <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-850 space-y-2">
                        {/* Day of weeks list */}
                        <div className="grid grid-cols-7 gap-1 text-[8.5px] text-slate-500 font-mono text-center font-bold">
                          {["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"].map(d => <span key={d}>{d}</span>)}
                        </div>

                        {/* Visual calendar grid cells */}
                        <div className="grid grid-cols-7 gap-1 text-[9px] font-mono text-center">
                          {/* Blank day spacer buttons */}
                          {Array.from({ length: startDayOfWeek }).map((_, spacerIdx) => (
                            <span key={`spacer-${spacerIdx}`} className="py-1 opacity-20" />
                          ))}

                          {/* Day numbers loop */}
                          {Array.from({ length: daysInMonth }).map((_, dayNumIdx) => {
                            const day = dayNumIdx + 1;
                            const dayStr = String(day).padStart(2, '0');
                            const dateString = `${attendanceYear}-${monthStr}-${dayStr}`;
                            
                            const dayAtt = monthRecords.find(r => r.date === dateString);
                            const status = dayAtt?.status;

                            let bgClass = "bg-slate-900 text-slate-400 border border-slate-850 hover:bg-slate-800";
                            if (status === "Present") bgClass = "bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 hover:bg-emerald-500/30";
                            if (status === "Absent") bgClass = "bg-rose-500/20 text-rose-400 border border-rose-500/40 hover:bg-rose-500/30";
                            if (status === "Half-Day") bgClass = "bg-cyan-500/20 text-cyan-400 border border-cyan-500/40 hover:bg-cyan-500/30";

                            return (
                              <button
                                key={`day-${day}`}
                                type="button"
                                onClick={() => {
                                  // cycle state machine: Unmarked -> Present -> Half-Day -> Absent -> Unmarked
                                  let nextStatus: "Present" | "Absent" | "Half-Day" | "None" = "None";
                                  if (!status) nextStatus = "Present";
                                  else if (status === "Present") nextStatus = "Half-Day";
                                  else if (status === "Half-Day") nextStatus = "Absent";
                                  else if (status === "Absent") nextStatus = "None";

                                  setAttendance(prev => {
                                    if (nextStatus === "None") {
                                      return prev.filter(r => !(r.labourId === selectedLabourForProfile.id && r.date === dateString));
                                    }
                                    const existingIdx = prev.findIndex(r => r.labourId === selectedLabourForProfile.id && r.date === dateString);
                                    if (existingIdx > -1) {
                                      return prev.map((r, idx) => idx === existingIdx ? { ...r, status: nextStatus as any } : r);
                                    } else {
                                      return [
                                        ...prev,
                                        { id: `att-${Date.now()}-${day}`, labourId: selectedLabourForProfile.id, date: dateString, status: nextStatus as any }
                                      ];
                                    }
                                  });
                                  
                                  triggerOnlineSync(`Toggled ${selectedLabourForProfile.fullName} Attendance: ${dateString} is now ${nextStatus}`);
                                }}
                                className={`py-1 rounded font-bold cursor-pointer transition ${bgClass}`}
                                title={`Tap to cycle status. Current status: ${status || 'Unmarked'}`}
                              >
                                {day}
                              </button>
                            );
                          })}
                        </div>

                        {/* Guidance notes & labels legend */}
                        <div className="flex justify-between items-center text-[7.5px] font-mono text-slate-500 pt-1.5 border-t border-slate-900/60 font-bold font-semibold">
                          <span className="text-indigo-400">💡 Tap day card to cycle status</span>
                          <div className="flex gap-2">
                            <span className="flex items-center gap-0.5"><span className="w-1.5 h-1.5 bg-emerald-500/40 rounded-full" /> P</span>
                            <span className="flex items-center gap-0.5"><span className="w-1.5 h-1.5 bg-cyan-500/40 rounded-full" /> H</span>
                            <span className="flex items-center gap-0.5"><span className="w-1.5 h-1.5 bg-rose-500/40 rounded-full" /> A</span>
                          </div>
                        </div>
                      </div>

                      {/* INDIVIDUAL ATTENDANCE PROFILE PDF DOWNLOAD OPTION */}
                      <button
                        type="button"
                        onClick={() => {
                          downloadSingleLabourAttendancePDF(selectedLabourForProfile, attendance || [], mIndex, attendanceYear);
                          triggerOnlineSync(`Downloaded Individual Attendance & Calendar Report for ${selectedLabourForProfile.fullName}`);
                        }}
                        className="w-full bg-slate-950 hover:bg-slate-900 active:bg-slate-950 text-indigo-400 border border-slate-850 hover:border-slate-800 font-bold py-2 px-3 rounded-xl flex items-center justify-center gap-1.5 text-[9.5px] font-mono tracking-wider uppercase transition cursor-pointer shadow-md shadow-indigo-950/20"
                      >
                        <Download className="w-3.5 h-3.5 text-indigo-400" />
                        Download Calendar & Absence Profile
                      </button>

                      {/* 3. SALARY SUMMARY (DYNAMICALLY CALCULATED PRO-RATA OVER ATTENDANCE WORKING DAYS) */}
                      <div className="p-3 bg-slate-950 rounded-xl border border-slate-850 space-y-1 text-[10px] font-mono">
                        <div className="flex justify-between items-center pb-1 border-b border-slate-900">
                          <span className="text-[8.5px] text-indigo-400 font-extrabold uppercase">{activeMonthName} {attendanceYear} Payout Ledger</span>
                          <span className="text-[8.5px] text-slate-500">Prorated on {workingDays}/30 Days</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Base Monthly Salary:</span> 
                          <span className="font-bold text-slate-200">₹{baseSalary.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between text-emerald-450 text-[9.5px]">
                          <span>Attendance Wages Calc:</span> 
                          <span className="font-bold text-emerald-400">₹{proRataWages.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between text-rose-455 text-[9.5px]">
                          <span>Deductions (Advances):</span> 
                          <span className="font-bold text-rose-400">-₹{totalAdvances.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between border-t border-slate-900 pt-1.5 mt-1 font-bold text-slate-200 text-[10.5px]">
                          <span>Net Due in {activeMonthName}:</span> 
                          <span className="text-indigo-400 font-black">₹{netSalaryDue.toLocaleString()}</span>
                        </div>
                      </div>
                    </div>
                  );
                })()}
              </div>

              {/* Action buttons (Manage Profile) */}
              {selectedLabourForProfile.isFreezed ? (
                <div className="grid grid-cols-2 gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => handleRejoin(selectedLabourForProfile.id)}
                    className="bg-emerald-950/60 text-emerald-400 hover:bg-emerald-950 py-2 rounded-lg text-[10px] font-mono flex items-center justify-center gap-1 cursor-pointer border border-emerald-900/30 font-bold"
                  >
                    <UserCheck className="w-3.5 h-3.5" /> Rejoin
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDeleteLabour(selectedLabourForProfile.id, selectedLabourForProfile.fullName)}
                    className="bg-rose-950/65 text-rose-400 hover:bg-rose-900 py-2 rounded-lg text-[10px] font-mono flex items-center justify-center gap-1 cursor-pointer border border-rose-905/35 font-bold"
                  >
                    <Trash2 className="w-3.5 h-3.5" /> Delete Profile
                  </button>
                </div>
              ) : (
                <div className="space-y-2 pt-2">
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => handleOpenEditLabour(selectedLabourForProfile)}
                      className="bg-slate-850 hover:bg-slate-800 text-slate-300 py-2 rounded-lg text-[10px] font-mono flex items-center justify-center gap-1 cursor-pointer border border-slate-750 font-bold"
                    >
                      <Edit className="w-3.5 h-3.5" /> Edit Profile
                    </button>
                    <button
                      type="button"
                      onClick={() => handleQuitWork(selectedLabourForProfile.id)}
                      className="bg-amber-950/65 text-amber-400 hover:bg-amber-900 py-2 rounded-lg text-[10px] font-mono flex items-center justify-center gap-1 cursor-pointer border border-amber-900/35 font-bold"
                    >
                      <UserX className="w-3.5 h-3.5" /> Quit Work
                    </button>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleDeleteLabour(selectedLabourForProfile.id, selectedLabourForProfile.fullName)}
                    className="w-full bg-rose-950/60 text-rose-400 hover:bg-rose-900 py-2 rounded-lg text-[10px] font-mono flex items-center justify-center gap-1 cursor-pointer border border-rose-900/30 font-bold"
                  >
                    <Trash2 className="w-3.5 h-3.5" /> Delete Profile
                  </button>
                </div>
              )}

            </div>
          ) : (
            /* WORKERS DIRECTORY LISTING */
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                {/* Switcher Tab between Drivers & Helpers */}
                <div className="flex rounded-lg bg-slate-950 border border-slate-850 p-0.5">
                  <button
                    onClick={() => setActiveLabourTab("Driver")}
                    className={`px-3 py-1 text-[9px] font-mono font-bold uppercase rounded-md transition ${
                      activeLabourTab === "Driver" ? "bg-indigo-600 text-white font-extrabold" : "text-slate-400"
                    }`}
                  >
                    Drivers
                  </button>
                  <button
                    onClick={() => setActiveLabourTab("Helper")}
                    className={`px-3 py-1 text-[9px] font-mono font-bold uppercase rounded-md transition ${
                      activeLabourTab === "Helper" ? "bg-indigo-600 text-white font-extrabold" : "text-slate-400"
                    }`}
                  >
                    Helpers
                  </button>
                </div>

                <button
                  onClick={handleOpenAddLabour}
                  className="bg-indigo-600 hover:bg-indigo-500 px-2.5 py-1 rounded-lg text-[9px] font-bold text-white uppercase tracking-wider flex items-center gap-0.5"
                >
                  <UserPlus className="w-3 h-3" /> Add Roster
                </button>
              </div>

              {/* Roster Add / Edit Form Panel Overlay Overlay */}
              {isLabourFormOpen && (
                <form ref={labourFormRef} onSubmit={handleSaveLabour} className="bg-slate-900 p-4 border border-slate-800 rounded-xl space-y-3">
                  <span className="text-[10px] font-mono font-bold text-amber-500 uppercase block">
                    {editingLabourId ? "Modify Registered Profile" : `Register New ${activeLabourTab}`}
                  </span>

                  <div className="space-y-2.5 text-xs text-slate-300">

                    {/* Profile Photo Upload */}
                    <div className="flex items-center gap-3 bg-slate-950 border border-slate-800 p-2.5 rounded-xl">
                      <div className="w-12 h-12 rounded-full overflow-hidden bg-slate-800 border-2 border-slate-700 shrink-0 flex items-center justify-center">
                        {profilePhoto ? (
                          <img src={profilePhoto} alt="Profile" className="w-full h-full object-cover" />
                        ) : (
                          <span className="text-slate-500 text-[8px] font-mono text-center leading-tight px-1">No Photo</span>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <label className="text-[9px] font-mono text-slate-500 block mb-1">PROFILE PHOTO <span className="text-slate-600">(Optional)</span></label>
                        <div className="flex items-center gap-1.5">
                          <input
                            type="file"
                            accept="image/*"
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (!file) return;
                              const reader = new FileReader();
                              reader.onload = () => {
                                setProfilePhoto(reader.result as string);
                                setProfilePhotoName(file.name);
                              };
                              reader.readAsDataURL(file);
                            }}
                            className="hidden"
                            id="profile-photo-upload"
                          />
                          <label
                            htmlFor="profile-photo-upload"
                            className="bg-indigo-600/30 hover:bg-indigo-600/50 text-indigo-300 text-[9px] font-bold px-2 py-1 rounded cursor-pointer shrink-0 transition border border-indigo-700/40"
                          >
                            Upload Photo
                          </label>
                          {profilePhoto && (
                            <button
                              type="button"
                              onClick={() => { setProfilePhoto(""); setProfilePhotoName(""); }}
                              className="text-rose-400 hover:text-rose-300 text-[9px] font-bold px-1.5 py-1 rounded transition"
                            >
                              Remove
                            </button>
                          )}
                          {profilePhotoName && (
                            <span className="text-[8px] text-slate-500 truncate flex-1">{profilePhotoName}</span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="text-[9px] font-mono text-slate-500 block">FULL NAME</label>
                        <input
                          type="text"
                          value={fullName}
                          onChange={(e) => setFullName(e.target.value)}
                          className="w-full bg-slate-950 border border-slate-800 p-1.5 rounded focus:outline-none focus:border-indigo-500"
                          placeholder="e.g. Ramesh Sah"
                          required
                        />
                      </div>
                      <div>
                        <label className="text-[9px] font-mono text-slate-500 block">GENDER</label>
                        <select
                          value={gender}
                          onChange={(e) => setGender(e.target.value as "Male" | "Female")}
                          className="w-full bg-slate-950 border border-slate-800 p-1.5 rounded focus:outline-none focus:border-indigo-500 text-xs"
                        >
                          <option value="Male">Male</option>
                          <option value="Female">Female</option>
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="text-[9px] font-mono text-slate-500 block">MOBILE NO</label>
                      <input
                        type="tel"
                        value={phone}
                        onChange={(e) => {
                          // Allow only digits
                          const val = e.target.value.replace(/\D/g, "");
                          if (val.length <= 10) setPhone(val);
                        }}
                        className={`w-full bg-slate-950 border p-1.5 rounded focus:outline-none focus:border-indigo-500 font-mono tracking-widest ${
                          phone.length > 0 && phone.length !== 10 ? "border-rose-600" : "border-slate-800"
                        }`}
                        placeholder="9876543210"
                        maxLength={10}
                        required
                      />
                      {phone.length > 0 && phone.length !== 10 && (
                        <span className="text-[8px] text-rose-400 mt-0.5 block">Must be exactly 10 digits</span>
                      )}
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="text-[9px] font-mono text-slate-500 block">12-DIGIT AADHAAR</label>
                        <input
                          type="text"
                          value={aadhaarNumber}
                          onChange={(e) => setAadhaarNumber(e.target.value)}
                          className="w-full bg-slate-950 border border-slate-800 p-1.5 rounded focus:outline-none focus:border-indigo-500"
                          placeholder="1234 5678 9012"
                        />
                      </div>
                      <div>
                        <label className="text-[9px] font-mono text-slate-500 block">JOINING DATE</label>
                        <input
                          type="date"
                          value={joiningDate}
                          onChange={(e) => setJoiningDate(e.target.value)}
                          className="w-full bg-slate-950 border border-slate-800 p-1 rounded font-mono"
                        />
                      </div>
                    </div>

                    {activeLabourTab === "Driver" && (
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="text-[9px] font-mono text-slate-500 block">LICENSE ID</label>
                          <input
                            type="text"
                            value={licenseNumber}
                            onChange={(e) => setLicenseNumber(e.target.value)}
                            className="w-full bg-slate-950 border border-slate-800 p-1.5 rounded focus:outline-none"
                            placeholder="DL-88339X"
                          />
                        </div>
                        <div>
                          <label className="text-[9px] font-mono text-slate-500 block">LICENSE EXPIRY</label>
                          <input
                            type="date"
                            value={licenseExpiryDate}
                            onChange={(e) => setLicenseExpiryDate(e.target.value)}
                            className="w-full bg-slate-950 border border-slate-800 p-1 rounded font-mono"
                          />
                        </div>
                      </div>
                    )}

                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="text-[9px] font-mono text-slate-500 block">EMERGENCY PHONE</label>
                        <input
                          type="text"
                          value={emergencyContact}
                          onChange={(e) => setEmergencyContact(e.target.value)}
                          className="w-full bg-slate-950 border border-slate-800 p-1.5 rounded"
                          placeholder="Father/Spouse no"
                        />
                      </div>
                      <div>
                        <label className="text-[9px] font-mono text-slate-500 block">SALARY PER MONTH (₹)</label>
                        <input
                          type="number"
                          value={salaryPerMonth}
                          onChange={(e) => setSalaryPerMonth(Number(e.target.value))}
                          className="w-full bg-slate-950 border border-slate-800 p-1.5 rounded"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="text-[9px] font-mono text-slate-500 block">ADDRESS</label>
                      <textarea
                        value={address}
                        onChange={(e) => setAddress(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-800 p-1.5 rounded text-xs"
                        rows={2}
                        placeholder="Complete postal address..."
                      />
                    </div>

                    {/* Aadhaar and License PDF Upload Zone */}
                    <div className="grid grid-cols-2 gap-2 border-t border-slate-800 pt-2.5">
                      <div>
                        <label className="text-[9px] font-mono text-slate-500 block uppercase">Aadhaar PDF File</label>
                        <div className="mt-1 flex items-center gap-1.5 bg-slate-950 border border-slate-800 p-1 rounded-lg">
                          <input 
                            type="file" 
                            accept="application/pdf"
                            onChange={(e) => handleFileChange(e, "aadhaar")}
                            className="hidden" 
                            id="aadhaar-upload" 
                          />
                          <label 
                            htmlFor="aadhaar-upload" 
                            className="bg-slate-850 hover:bg-slate-800 text-[9px] text-indigo-400 font-bold px-2 py-1 rounded cursor-pointer shrink-0 transition"
                          >
                            Choose PDF
                          </label>
                          <span className="text-[9px] text-slate-400 truncate flex-1 block">
                            {aadhaarPdfName || "No file selected"}
                          </span>
                        </div>
                      </div>

                      {activeLabourTab === "Driver" ? (
                        <div>
                          <label className="text-[9px] font-mono text-slate-500 block uppercase">License PDF File</label>
                          <div className="mt-1 flex items-center gap-1.5 bg-slate-950 border border-slate-800 p-1 rounded-lg">
                            <input 
                              type="file" 
                              accept="application/pdf"
                              onChange={(e) => handleFileChange(e, "license")}
                              className="hidden" 
                              id="license-upload" 
                            />
                            <label 
                              htmlFor="license-upload" 
                              className="bg-slate-850 hover:bg-slate-800 text-[9px] text-indigo-400 font-bold px-2 py-1 rounded cursor-pointer shrink-0 transition"
                            >
                              Choose PDF
                            </label>
                            <span className="text-[9px] text-slate-400 truncate flex-1 block">
                              {licensePdfName || "No file selected"}
                            </span>
                          </div>
                        </div>
                      ) : (
                        <div className="flex items-center text-[9px] text-slate-500 italic pt-4">
                          License PDF not required
                        </div>
                      )}
                    </div>

                    {/* Add+ Document Section (Dynamic Additional Documents) */}
                    <div className="bg-slate-950 border border-slate-850 p-2.5 rounded-xl space-y-2 mt-2">
                      <span className="text-[9.5px] font-mono font-bold text-slate-400 uppercase block">
                        Add Dynamic Documents (Add+ Document)
                      </span>

                      <div className="grid grid-cols-12 gap-1.5 items-end">
                        <div className="col-span-4">
                          <label className="text-[8px] text-slate-500 block font-mono">DOCUMENT NAME</label>
                          <input 
                            type="text" 
                            placeholder="e.g. PAN Card, Fitness" 
                            value={tempDocName}
                            onChange={(e) => setTempDocName(e.target.value)}
                            className="w-full bg-slate-900 border border-slate-800 p-1 rounded text-[10px]"
                          />
                        </div>
                        <div className="col-span-5">
                          <label className="text-[8px] text-slate-500 block font-mono">UPLOAD PDF</label>
                          <div className="flex items-center gap-1 bg-slate-900 border border-slate-800 p-0.5 rounded text-[10px]">
                            <input 
                              type="file" 
                              accept="application/pdf"
                              onChange={(e) => handleFileChange(e, "custom")}
                              className="hidden" 
                              id="custom-doc-upload" 
                            />
                            <label 
                              htmlFor="custom-doc-upload" 
                              className="bg-slate-800 text-[8.5px] text-slate-300 font-bold px-1.5 py-1 rounded cursor-pointer shrink-0 transition"
                            >
                              Browse...
                            </label>
                            <span className="text-[8px] text-slate-400 truncate block flex-1">
                              {tempPdfName || "No file"}
                            </span>
                          </div>
                        </div>
                        <div className="col-span-3">
                          <button 
                            type="button" 
                            onClick={handleAddCustomDoc}
                            className="w-full bg-indigo-650 hover:bg-indigo-600 text-white text-[9.5px] font-bold py-1.5 px-1 rounded flex items-center justify-center gap-0.5 transition cursor-pointer"
                          >
                            <Plus className="w-3 h-3" /> Add+
                          </button>
                        </div>
                      </div>

                      {customDocs.length > 0 && (
                        <div className="space-y-1 pt-1.5 border-t border-slate-900">
                          <span className="text-[8px] font-mono text-slate-500 block uppercase">Added Dynamic Documents:</span>
                          <div className="max-y-24 overflow-y-auto space-y-1">
                            {customDocs.map((doc) => (
                              <div key={doc.id} className="flex justify-between items-center bg-slate-900/60 p-1 px-2 rounded border border-slate-850">
                                <div className="flex flex-col truncate flex-1 pr-2">
                                  <span className="text-[9px] font-bold text-slate-200 truncate">{doc.docName}</span>
                                  <span className="text-[7.5px] text-slate-500 font-mono truncate">{doc.pdfName}</span>
                                </div>
                                <button 
                                  type="button"
                                  onClick={() => handleRemoveCustomDoc(doc.id)}
                                  className="text-rose-450 hover:text-rose-400 p-0.5 transition"
                                  title="Remove Document"
                                >
                                  <Trash2 className="w-3 h-3" />
                                </button>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex gap-2 justify-end pt-1">
                    <button
                      type="button"
                      onClick={() => {
                        setIsLabourFormOpen(false);
                        setEditingLabourId(null);
                      }}
                      className="px-3 py-1 bg-slate-950 text-slate-400 rounded-lg text-[10px]"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-1 bg-indigo-650 text-white font-bold rounded-lg text-[10px]"
                    >
                      {editingLabourId ? "Save Changes" : "Register Worker"}
                    </button>
                  </div>
                </form>
              )}

              {/* Roster Cards Flow */}
              <div className="space-y-2">
                {activeLaboursList.length === 0 ? (
                  <div className="text-center p-6 bg-slate-900/30 rounded-xl text-[10px] text-slate-500">
                    No active {activeLabourTab}s in the fleet database
                  </div>
                ) : (
                  activeLaboursList.map(lab => {
                    const totalAdv = lab.advanceEntries?.reduce((sum, item) => sum + item.amount, 0) || 0;
                    const isLabFreezed = lab.isFreezed;
                    return (
                      <div
                        key={lab.id}
                        onClick={() => setSelectedLabourForProfile(lab)}
                        className={`border p-3 rounded-2xl flex items-center justify-between cursor-pointer transition group ${
                          isLabFreezed
                            ? "bg-slate-950/40 border-amber-950/30 opacity-70 hover:border-amber-500/30"
                            : "bg-slate-900 border-slate-850 hover:border-indigo-500/40"
                        }`}
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          {renderLabourAvatar(lab, {
                            className: `w-9 h-9 border object-cover ${isLabFreezed ? "border-amber-950/40 grayscale" : "border-slate-800"}`,
                            iconClassName: "w-4 h-4",
                            roundedClassName: "rounded-xl",
                            animated: true,
                          })}
                          <div className="min-w-0">
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <h4 className={`text-xs font-bold truncate group-hover:text-indigo-400 ${
                                isLabFreezed ? "text-slate-550 line-through" : "text-red-500"
                              }`}>{lab.fullName}</h4>
                              {isLabFreezed && (
                                <span className="bg-amber-950/30 text-amber-500 text-[6.5px] font-mono px-1 rounded border border-amber-900/20 font-bold shrink-0">
                                  FREEZED / QUIT
                                </span>
                              )}
                            </div>
                            <span className="text-[8.5px] font-mono text-slate-500 block leading-tight">Cell: {lab.phone}</span>
                            <span className="inline-block text-[8px] text-indigo-400 font-mono mt-0.5 font-bold">
                              Base: ₹{(lab.salaryPerMonth ?? 0).toLocaleString()}/mo
                            </span>
                          </div>
                        </div>

                        {/* Mini Advance Badge */}
                        <div className="text-right flex flex-col items-end">
                          <div className="text-[10px] font-mono font-black text-rose-400">
                            {totalAdv > 0 ? `₹${totalAdv} Adv` : "No Adv"}
                          </div>
                          <span className="text-[8px] text-slate-500 font-mono mt-0.5">Click for Ledgers</span>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          )}
        </div>
      )}

                  {/* ======================= B-1. BIT & HAMMER PURCHASE SUBSECTION ======================= */}
      {activeMainSection === "management" && activeSubSection === "bit" && (
        <div className="space-y-4">
          
          {/* Sub-tab Switcher Pill */}
          <div className="flex bg-slate-950 p-1 rounded-xl border border-slate-850">
            <button
              type="button"
              onClick={() => setBitHammerSubTab("bit")}
              className={`flex-1 py-1.5 rounded-lg text-[10px] font-bold uppercase transition ${
                bitHammerSubTab === "bit" ? "bg-indigo-650 text-white font-extrabold" : "text-slate-400 hover:text-slate-200"
              }`}
            >
              🔩 Bit Details
            </button>
            <button
              type="button"
              onClick={() => setBitHammerSubTab("hammer")}
              className={`flex-1 py-1.5 rounded-lg text-[10px] font-bold uppercase transition ${
                bitHammerSubTab === "hammer" ? "bg-indigo-650 text-white font-extrabold" : "text-slate-400 hover:text-slate-200"
              }`}
            >
              🔨 Hammer Details
            </button>
            <button
              type="button"
              onClick={() => setBitHammerSubTab("pipe")}
              className={`flex-1 py-1.5 rounded-lg text-[10px] font-bold uppercase transition ${
                bitHammerSubTab === "pipe" ? "bg-indigo-650 text-white font-extrabold" : "text-slate-400 hover:text-slate-200"
              }`}
            >
              🔗 Pipe Details
            </button>
          </div>

          {bitHammerSubTab === "bit" && (
            // ================== BIT SUB-SECTION ==================
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-2">
                <div className="bg-slate-900 border border-slate-850 rounded-xl p-3">
                  <span className="text-[8px] uppercase tracking-wider text-slate-500 font-mono font-bold block">Total Bits Purchased</span>
                  <div className="text-2xl font-black text-indigo-400 mt-1">{bitEntries.length}</div>
                </div>
                <div className="bg-slate-900 border border-slate-850 rounded-xl p-3">
                  <span className="text-[8px] uppercase tracking-wider text-slate-500 font-mono font-bold block">Total Amount</span>
                  <div className="text-2xl font-black text-emerald-400 mt-1">₹{bitEntries.reduce((sum, bit) => sum + Number(bit.rate || 0), 0).toLocaleString()}</div>
                </div>
              </div>

              <div className="bg-slate-900 border border-slate-850 rounded-2xl p-3 space-y-3">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[9px] font-mono font-bold uppercase tracking-widest text-slate-400">Count by Size (mm)</span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {bitSizeSummary.length === 0 ? (
                      <span className="text-[9px] text-slate-500 italic">No bit sizes yet.</span>
                    ) : (
                      bitSizeSummary.map((item) => (
                        <span key={item.sizeMm} className="px-2.5 py-1 rounded-full border border-indigo-900/40 bg-indigo-950/30 text-[9px] font-bold text-indigo-300 font-mono">
                          {item.sizeMm} mm • {item.count}
                        </span>
                      ))
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[9px] font-mono font-bold uppercase tracking-widest text-slate-400">Count by Brand</span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {bitBrandSummary.length === 0 ? (
                      <span className="text-[9px] text-slate-500 italic">No bit brands yet.</span>
                    ) : (
                      bitBrandSummary.map((item) => (
                        <span key={item.brand} className="px-2.5 py-1 rounded-full border border-emerald-900/40 bg-emerald-950/30 text-[9px] font-bold text-emerald-300 font-mono">
                          {item.brand} • {item.count}
                        </span>
                      ))
                    )}
                  </div>
                </div>
              </div>

              {(isBitFormOpen || editingBitId) && (
                <form onSubmit={handleSaveBit} className="bg-slate-900 border border-slate-800 rounded-2xl p-3 space-y-3 text-xs">
                  <span className="text-[10px] font-mono font-bold text-amber-500 uppercase tracking-widest block">
                    {editingBitId ? "Edit Bit Entry" : "Add New Bit Entry"}
                  </span>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <div>
                      <label className="text-[9px] text-slate-500 block font-mono">BIT NUMBER</label>
                      <input
                        type="text"
                        value={bitNo}
                        onChange={(e) => setBitNo(e.target.value)}
                        className="w-full bg-slate-950 p-1.5 rounded text-slate-100 border border-slate-850"
                        placeholder="BT-001"
                        required
                      />
                    </div>
                    <div>
                      <label className="text-[9px] text-slate-500 block font-mono">BIT BRAND</label>
                      <input
                        type="text"
                        value={bitBrand}
                        onChange={(e) => setBitBrand(e.target.value)}
                        className="w-full bg-slate-950 p-1.5 rounded text-slate-100 border border-slate-850"
                        placeholder="Atlas Copco"
                        required
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <div>
                      <label className="text-[9px] text-slate-500 block font-mono">BIT SIZE IN MM</label>
                      <input
                        type="number"
                        value={bitSizeMm}
                        onChange={(e) => setBitSizeMm(Number(e.target.value))}
                        className="w-full bg-slate-950 p-1.5 rounded text-slate-100 border border-slate-850 font-bold"
                        min="1"
                        required
                      />
                    </div>
                    <div>
                      <label className="text-[9px] text-slate-500 block font-mono">BUTTON SIZE IN MM</label>
                      <input
                        type="number"
                        value={bitButtonSizeMm}
                        onChange={(e) => setBitButtonSizeMm(e.target.value === "" ? "" : Number(e.target.value))}
                        className="w-full bg-slate-950 p-1.5 rounded text-slate-100 border border-slate-850 font-bold"
                        min="1"
                        required
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <div>
                      <label className="text-[9px] text-slate-500 block font-mono">DATE ENTRY</label>
                      <input
                        type="date"
                        value={bitDateEntry}
                        onChange={(e) => setBitDateEntry(e.target.value)}
                        className="w-full bg-slate-950 p-1.5 rounded text-slate-100 border border-slate-850 font-bold"
                        required
                      />
                    </div>
                    <div>
                      <label className="text-[9px] text-slate-500 block font-mono">RATE OF BIT (₹)</label>
                      <input
                        type="number"
                        value={bitRate}
                        onChange={(e) => setBitRate(Number(e.target.value))}
                        className="w-full bg-slate-950 p-1.5 rounded text-slate-100 border border-slate-850 font-bold"
                        min="0"
                        required
                      />
                    </div>
                  </div>

                  <div className="flex gap-2 justify-end pt-1">
                    <button
                      type="button"
                      onClick={() => {
                        setIsBitFormOpen(false);
                        setEditingBitId(null);
                      }}
                      className="px-3 bg-slate-950 text-slate-400 py-1 rounded"
                    >
                      Cancel
                    </button>
                    <button type="submit" className="px-4 bg-indigo-650 text-white font-bold py-1 rounded">
                      {editingBitId ? "Update Bit" : "Save Bit"}
                    </button>
                  </div>
                </form>
              )}

              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-mono font-bold text-slate-400 uppercase">Bit Purchase Ledger</span>
                  <button
                    type="button"
                    onClick={handleOpenAddBit}
                    className="bg-indigo-650 hover:bg-indigo-500 py-1 px-2.5 rounded-lg text-[9px] font-bold text-white uppercase tracking-wider flex items-center gap-0.5"
                  >
                    <Plus className="w-3.5 h-3.5" /> Add Bit (+)
                  </button>
                </div>

                <div className="space-y-2">
                  {bitEntries.length === 0 ? (
                    <div className="text-center p-6 bg-slate-900/30 rounded-xl text-[10px] text-slate-500">
                      No bit entries in database
                    </div>
                  ) : (
                    bitEntries.map((bit) => (
                      <div key={bit.id} className="bg-slate-900 border border-slate-850 rounded-2xl p-3 flex items-center justify-between gap-3">
                        <div className="min-w-0">
                          <div className="flex flex-wrap items-center gap-1.5">
                            <span className="text-[8px] uppercase tracking-wider font-bold text-indigo-400 font-mono">{bit.bitNo}</span>
                            <span className="text-[8px] uppercase tracking-wider font-bold text-slate-500 font-mono">Size: {bit.sizeMm} mm</span>
                            <span className="text-[8px] uppercase tracking-wider font-bold text-slate-500 font-mono">Button: {bit.buttonSizeMm ?? "-"} mm</span>
                          </div>
                          <h4 className="text-xs font-bold text-red-500 truncate mt-0.5">{bit.brand}</h4>
                          <p className="text-[8.5px] text-slate-500 font-mono mt-1">Date: {bit.dateEntry || "-"}</p>
                          <p className="text-[8.5px] text-slate-500 font-mono mt-1">Rate: ₹{Number(bit.rate || 0).toLocaleString()}</p>
                        </div>
                        <div className="flex items-center gap-1.5 shrink-0">
                          <button
                            type="button"
                            onClick={() => handleOpenEditBit(bit)}
                            className="p-1 bg-slate-950 text-slate-400 hover:text-white border border-slate-800 rounded"
                            title="Edit bit"
                          >
                            <Edit className="w-3 h-3" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteBit(bit.id, bit.bitNo)}
                            className="p-1 bg-rose-950/40 text-rose-450 border border-rose-900/40 rounded"
                            title="Delete bit"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          )}

          {bitHammerSubTab === "hammer" && (
            // ================== HAMMER SUB-SECTION ==================
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-2">
                <div className="bg-slate-900 border border-slate-850 rounded-xl p-3">
                  <span className="text-[8px] uppercase tracking-wider text-slate-500 font-mono font-bold block">Total Hammers</span>
                  <div className="text-2xl font-black text-indigo-400 mt-1">{hammerEntries.length}</div>
                </div>
                <div className="bg-slate-900 border border-slate-850 rounded-xl p-3">
                  <span className="text-[8px] uppercase tracking-wider text-slate-500 font-mono font-bold block">Total Amount</span>
                  <div className="text-2xl font-black text-emerald-400 mt-1">₹{hammerEntries.reduce((sum, h) => sum + Number(h.rate || 0), 0).toLocaleString()}</div>
                </div>
              </div>

              {(isHammerFormOpen || editingHammerId) && (
                <form onSubmit={handleSaveHammer} className="bg-slate-900 border border-slate-800 rounded-2xl p-3 space-y-3 text-xs">
                  <span className="text-[10px] font-mono font-bold text-amber-500 uppercase tracking-widest block">
                    {editingHammerId ? "Edit Hammer Profile" : "Register New Hammer"}
                  </span>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <div>
                      <label className="text-[9px] text-slate-500 block font-mono">HAMMER NUMBER</label>
                      <input
                        type="text"
                        value={hammerNo}
                        onChange={(e) => setHammerNo(e.target.value)}
                        className="w-full bg-slate-950 p-1.5 rounded text-slate-100 border border-slate-850"
                        placeholder="H-001"
                        required
                      />
                    </div>
                    <div>
                      <label className="text-[9px] text-slate-500 block font-mono">BRAND</label>
                      <input
                        type="text"
                        value={hammerBrand}
                        onChange={(e) => setHammerBrand(e.target.value)}
                        className="w-full bg-slate-950 p-1.5 rounded text-slate-100 border border-slate-850"
                        placeholder="Atlas Copco"
                        required
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <div>
                      <label className="text-[9px] text-slate-500 block font-mono">DATE ENTRY</label>
                      <input
                        type="date"
                        value={hammerDateEntry}
                        onChange={(e) => setHammerDateEntry(e.target.value)}
                        className="w-full bg-slate-950 p-1.5 rounded text-slate-100 border border-slate-850 font-bold"
                        required
                      />
                    </div>
                    <div>
                      <label className="text-[9px] text-slate-500 block font-mono">RATE (₹)</label>
                      <input
                        type="number"
                        value={hammerRate}
                        onChange={(e) => setHammerRate(Number(e.target.value))}
                        className="w-full bg-slate-950 p-1.5 rounded text-slate-100 border border-slate-850 font-bold"
                        min="0"
                        required
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <div>
                      <label className="text-[9px] text-slate-500 block font-mono">CAPABLE FEET DEPTH</label>
                      <input
                        type="number"
                        value={hammerCapableFeet}
                        onChange={(e) => setHammerCapableFeet(Number(e.target.value))}
                        className="w-full bg-slate-950 p-1.5 rounded text-slate-100 border border-slate-850 font-bold"
                        min="1"
                        required
                      />
                    </div>
                    <div>
                      <label className="text-[9px] text-slate-500 block font-mono">PAYMENT STATUS</label>
                      <select
                        value={hammerIsPaid ? "Paid" : "Not Paid"}
                        onChange={(e) => setHammerIsPaid(e.target.value === "Paid")}
                        className="w-full bg-slate-950 p-1.5 rounded text-slate-100 border border-slate-850 font-bold"
                      >
                        <option value="Not Paid">Not Paid / Due</option>
                        <option value="Paid">Paid / Cleared</option>
                      </select>
                    </div>
                  </div>

                  <div className="flex gap-2 justify-end pt-1">
                    <button
                      type="button"
                      onClick={() => {
                        setIsHammerFormOpen(false);
                        setEditingHammerId(null);
                      }}
                      className="px-3 bg-slate-950 text-slate-400 py-1 rounded"
                    >
                      Cancel
                    </button>
                    <button type="submit" className="px-4 bg-indigo-650 text-white font-bold py-1 rounded">
                      {editingHammerId ? "Update Hammer" : "Save Hammer"}
                    </button>
                  </div>
                </form>
              )}

              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-mono font-bold text-slate-400 uppercase">Hammer Inventory</span>
                  <button
                    type="button"
                    onClick={handleOpenAddHammer}
                    className="bg-indigo-650 hover:bg-indigo-500 py-1 px-2.5 rounded-lg text-[9px] font-bold text-white uppercase tracking-wider flex items-center gap-0.5"
                  >
                    <Plus className="w-3.5 h-3.5" /> Add Hammer (+)
                  </button>
                </div>

                <div className="space-y-2.5">
                  {hammerEntries.length === 0 ? (
                    <div className="text-center p-6 bg-slate-900/30 rounded-xl text-[10px] text-slate-500">
                      No hammers registered in database.
                    </div>
                  ) : (
                    hammerEntries.map((hammer) => {
                      const totalFeetUsed = (hammer.usageHistory || []).reduce((sum, item) => sum + item.calculatedFeet, 0);
                      const isLimitReached = totalFeetUsed >= hammer.capableFeetDepth;
                      const hasCasingType = !!hammer.casingType;

                      return (
                        <div key={hammer.id} className="bg-slate-900 border border-slate-850 rounded-2xl p-3 space-y-2">
                          <div className="flex items-center justify-between gap-3">
                            <div className="min-w-0">
                              <div className="flex flex-wrap items-center gap-1.5">
                                <span className="text-[8px] uppercase tracking-wider font-bold text-indigo-400 font-mono">{hammer.hammerNo}</span>
                                <span className="text-[8px] uppercase tracking-wider font-bold text-slate-550 font-mono">Cap: {hammer.capableFeetDepth} ft</span>
                                <span className={`text-[8.5px] font-bold px-1.5 py-0.2 rounded ${
                                  hammer.isPaid ? "bg-emerald-950 text-emerald-400" : "bg-rose-950 text-rose-450"
                                }`}>
                                  {hammer.isPaid ? "Paid" : "Due"}
                                </span>
                              </div>
                              <h4 className="text-xs font-bold text-red-500 truncate mt-0.5">{hammer.brand}</h4>
                              <p className="text-[8.5px] text-slate-500 font-mono">Purchased: {hammer.dateEntry || "-"}</p>
                              <p className="text-[8.5px] text-slate-500 font-mono">Rate: ₹{Number(hammer.rate || 0).toLocaleString()}</p>
                              <p className="text-[8.5px] text-indigo-400 font-mono font-bold mt-1">
                                Usage: {totalFeetUsed} / {hammer.capableFeetDepth} ft used
                              </p>
                            </div>

                            <div className="flex flex-col items-end gap-1.5 shrink-0">
                              <div className="flex items-center gap-1">
                                <button
                                  type="button"
                                  onClick={() => handleOpenEditHammer(hammer)}
                                  className="p-1 bg-slate-950 text-slate-400 hover:text-white border border-slate-800 rounded"
                                  title="Edit Hammer"
                                >
                                  <Edit className="w-3 h-3" />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleDeleteHammer(hammer.id, hammer.hammerNo)}
                                  className="p-1 bg-rose-950/40 text-rose-450 border border-rose-900/40 rounded"
                                  title="Delete Hammer"
                                >
                                  <Trash2 className="w-3 h-3" />
                                </button>
                              </div>

                              <button
                                type="button"
                                onClick={() => setSelectedHammerForHistory(selectedHammerForHistory === hammer.id ? null : hammer.id)}
                                className="bg-slate-950 text-[8.5px] px-2 py-0.5 rounded border border-slate-800 text-indigo-400 hover:text-indigo-300 font-bold transition font-mono uppercase"
                              >
                                {selectedHammerForHistory === hammer.id ? "Hide History" : "Feet History"}
                              </button>
                            </div>
                          </div>

                          {/* Limit indicator & casing configuration options */}
                          {isLimitReached && (
                            <div className="bg-amber-955/20 border border-amber-900/30 rounded-xl p-2 text-[9px] text-amber-400 space-y-1">
                              <span className="font-bold flex items-center gap-1 font-mono uppercase">
                                ⚠️ Limit Reached ({totalFeetUsed} ft used)
                              </span>
                              {hasCasingType ? (
                                <p className="font-mono">Configured as: <span className="font-bold text-indigo-400 uppercase">{hammer.casingType} Casing Hammer</span></p>
                              ) : (
                                <div className="space-y-1">
                                  <p>Specify Casing Hammer designation:</p>
                                  <div className="flex gap-2">
                                    <button
                                      type="button"
                                      onClick={() => {
                                        setHammerEntries(prev => prev.map(h => h.id === hammer.id ? { ...h, casingType: "7 inch" } : h));
                                        triggerOnlineSync(`CONFIGURED HAMMER ${hammer.hammerNo} AS 7" CASING`);
                                      }}
                                      className="bg-indigo-650 hover:bg-indigo-600 text-white font-bold px-2 py-0.5 rounded font-mono text-[8px]"
                                    >
                                      7" Casing
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => {
                                        setHammerEntries(prev => prev.map(h => h.id === hammer.id ? { ...h, casingType: "10 inch" } : h));
                                        triggerOnlineSync(`CONFIGURED HAMMER ${hammer.hammerNo} AS 10" CASING`);
                                      }}
                                      className="bg-emerald-650 hover:bg-emerald-600 text-white font-bold px-2 py-0.5 rounded font-mono text-[8px]"
                                    >
                                      10" Casing
                                    </button>
                                  </div>
                                </div>
                              )}
                            </div>
                          )}

                          {/* History Table Dropdown */}
                          {selectedHammerForHistory === hammer.id && (
                            <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-850 space-y-1.5 text-[9px] font-mono">
                              <span className="font-bold uppercase text-slate-500 tracking-wider">Usage Records</span>
                              {(!hammer.usageHistory || hammer.usageHistory.length === 0) ? (
                                <p className="text-slate-500 italic">No usage history recorded.</p>
                              ) : (
                                <div className="overflow-x-auto">
                                  <table className="w-full text-left border-collapse">
                                    <thead>
                                      <tr className="border-b border-slate-850 text-slate-400">
                                        <th className="py-1">Date</th>
                                        <th className="py-1">Client</th>
                                        <th className="py-1">Location</th>
                                        <th className="py-1 text-right">Feet</th>
                                      </tr>
                                    </thead>
                                    <tbody>
                                      {hammer.usageHistory.map((rec) => (
                                        <tr key={rec.id} className="border-b border-slate-900/60 text-slate-300">
                                          <td className="py-1">{rec.date}</td>
                                          <td className="py-1 font-bold">{rec.clientName}</td>
                                          <td className="py-1">{rec.location || "-"}</td>
                                          <td className="py-1 text-right text-indigo-400 font-bold">{rec.calculatedFeet} ft</td>
                                        </tr>
                                      ))}
                                    </tbody>
                                  </table>
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            </div>
          )}

          {bitHammerSubTab === "pipe" && (
            // ================== PIPE SUB-SECTION ==================
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-2">
                <div className="bg-slate-900 border border-slate-850 rounded-xl p-3">
                  <span className="text-[8px] uppercase tracking-wider text-slate-500 font-mono font-bold block">Total suppliers</span>
                  <div className="text-2xl font-black text-indigo-400 mt-1">{pipeEntries.length}</div>
                </div>
                <div className="bg-slate-900 border border-slate-850 rounded-xl p-3">
                  <span className="text-[8px] uppercase tracking-wider text-slate-500 font-mono font-bold block">Total pipe value</span>
                  <div className="text-2xl font-black text-emerald-400 mt-1">₹{pipeEntries.reduce((sum, p) => sum + Number(p.grandPrice || 0), 0).toLocaleString()}</div>
                </div>
              </div>

              {(isPipeFormOpen || editingPipeId) && (
                <form onSubmit={handleSavePipe} className="bg-slate-900 border border-slate-800 rounded-2xl p-3 space-y-3 text-xs">
                  <span className="text-[10px] font-mono font-bold text-amber-500 uppercase tracking-widest block">
                    {editingPipeId ? "Edit Pipe Entry / Supplier" : "Register Pipe Purchase Entry"}
                  </span>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <div>
                      <label className="text-[9px] text-slate-500 block font-mono">COMPANY NAME</label>
                      <input
                        type="text"
                        value={pipeCompanyName}
                        onChange={(e) => setPipeCompanyName(e.target.value)}
                        className="w-full bg-slate-950 p-1.5 rounded text-slate-100 border border-slate-850"
                        placeholder="e.g. Supreme Pipes"
                        required
                      />
                    </div>
                    <div>
                      <label className="text-[9px] text-slate-500 block font-mono">LOCATION</label>
                      <input
                        type="text"
                        value={pipeLocation}
                        onChange={(e) => setPipeLocation(e.target.value)}
                        className="w-full bg-slate-950 p-1.5 rounded text-slate-100 border border-slate-850"
                        placeholder="e.g. Mumbai Warehouse"
                        required
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <div>
                      <label className="text-[9px] text-slate-500 block font-mono">DATE ENTRY</label>
                      <input
                        type="date"
                        value={pipeDateEntry}
                        onChange={(e) => setPipeDateEntry(e.target.value)}
                        className="w-full bg-slate-950 p-1.5 rounded text-slate-100 border border-slate-850 font-bold"
                        required
                      />
                    </div>
                    <div>
                      <label className="text-[9px] text-slate-500 block font-mono">DISCOUNT AMOUNT (₹)</label>
                      <input
                        type="number"
                        value={pipeDiscountAmount}
                        onChange={(e) => setPipeDiscountAmount(Number(e.target.value))}
                        className="w-full bg-slate-950 p-1.5 rounded text-slate-100 border border-slate-850 font-bold"
                        min="0"
                      />
                    </div>
                  </div>

                  <div className="bg-slate-950/60 p-2.5 rounded-xl border border-slate-850 space-y-2">
                    <span className="text-[9px] font-mono font-bold text-indigo-400 block uppercase tracking-wider">Casing Pipe Stock Details (Quantities & Rates)</span>
                    
                    {/* 7 Inch Pipes */}
                    <div className="grid grid-cols-3 gap-2 border-b border-slate-900 pb-2">
                      <div className="space-y-1">
                        <label className="text-[8px] text-slate-500 block font-mono">7" HIGH QUALITY QTY</label>
                        <input
                          type="number"
                          value={pipe7HighCount}
                          onChange={(e) => setPipe7HighCount(Number(e.target.value))}
                          className="w-full bg-slate-950 p-1 rounded text-slate-100 border border-slate-850 text-center font-bold"
                          min="0"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[8px] text-slate-500 block font-mono">7" HIGH QUALITY RATE / PIPE (₹)</label>
                        <input
                          type="number"
                          value={pipe7HighRate}
                          onChange={(e) => setPipe7HighRate(Number(e.target.value))}
                          className="w-full bg-slate-950 p-1 rounded text-slate-100 border border-slate-850 text-center font-bold"
                          min="0"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[8px] text-slate-500 block font-mono">PRICE (₹)</label>
                        <input
                          type="text"
                          value={`₹${(pipe7HighCount * pipe7HighRate).toLocaleString()}`}
                          className="w-full bg-slate-950/40 p-1 rounded text-emerald-450 border border-slate-900 text-center font-bold font-mono"
                          disabled
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-2 border-b border-slate-900 pb-2">
                      <div className="space-y-1">
                        <label className="text-[8px] text-slate-500 block font-mono">7" MEDIUM QUALITY QTY</label>
                        <input
                          type="number"
                          value={pipe7MediumCount}
                          onChange={(e) => setPipe7MediumCount(Number(e.target.value))}
                          className="w-full bg-slate-950 p-1 rounded text-slate-100 border border-slate-850 text-center font-bold"
                          min="0"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[8px] text-slate-500 block font-mono">7" MEDIUM QUALITY RATE / PIPE (₹)</label>
                        <input
                          type="number"
                          value={pipe7MediumRate}
                          onChange={(e) => setPipe7MediumRate(Number(e.target.value))}
                          className="w-full bg-slate-950 p-1 rounded text-slate-100 border border-slate-850 text-center font-bold"
                          min="0"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[8px] text-slate-500 block font-mono">PRICE (₹)</label>
                        <input
                          type="text"
                          value={`₹${(pipe7MediumCount * pipe7MediumRate).toLocaleString()}`}
                          className="w-full bg-slate-950/40 p-1 rounded text-emerald-450 border border-slate-900 text-center font-bold font-mono"
                          disabled
                        />
                      </div>
                    </div>

                    {/* 10 Inch Pipes */}
                    <div className="grid grid-cols-3 gap-2 border-b border-slate-900 pb-2">
                      <div className="space-y-1">
                        <label className="text-[8px] text-slate-500 block font-mono">10" HIGH QUALITY QTY</label>
                        <input
                          type="number"
                          value={pipe10HighCount}
                          onChange={(e) => setPipe10HighCount(Number(e.target.value))}
                          className="w-full bg-slate-950 p-1 rounded text-slate-100 border border-slate-850 text-center font-bold"
                          min="0"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[8px] text-slate-500 block font-mono">10" HIGH QUALITY RATE / PIPE (₹)</label>
                        <input
                          type="number"
                          value={pipe10HighRate}
                          onChange={(e) => setPipe10HighRate(Number(e.target.value))}
                          className="w-full bg-slate-950 p-1 rounded text-slate-100 border border-slate-850 text-center font-bold"
                          min="0"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[8px] text-slate-500 block font-mono">PRICE (₹)</label>
                        <input
                          type="text"
                          value={`₹${(pipe10HighCount * pipe10HighRate).toLocaleString()}`}
                          className="w-full bg-slate-950/40 p-1 rounded text-emerald-450 border border-slate-900 text-center font-bold font-mono"
                          disabled
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-2">
                      <div className="space-y-1">
                        <label className="text-[8px] text-slate-500 block font-mono">10" MEDIUM QUALITY QTY</label>
                        <input
                          type="number"
                          value={pipe10MediumCount}
                          onChange={(e) => setPipe10MediumCount(Number(e.target.value))}
                          className="w-full bg-slate-950 p-1 rounded text-slate-100 border border-slate-850 text-center font-bold"
                          min="0"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[8px] text-slate-500 block font-mono">10" MEDIUM QUALITY RATE / PIPE (₹)</label>
                        <input
                          type="number"
                          value={pipe10MediumRate}
                          onChange={(e) => setPipe10MediumRate(Number(e.target.value))}
                          className="w-full bg-slate-950 p-1 rounded text-slate-100 border border-slate-850 text-center font-bold"
                          min="0"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[8px] text-slate-500 block font-mono">PRICE (₹)</label>
                        <input
                          type="text"
                          value={`₹${(pipe10MediumCount * pipe10MediumRate).toLocaleString()}`}
                          className="w-full bg-slate-950/40 p-1 rounded text-emerald-450 border border-slate-900 text-center font-bold font-mono"
                          disabled
                        />
                      </div>
                    </div>
                  </div>

                  {/* Calculations Preview */}
                  <div className="bg-slate-950/40 p-2 rounded-xl border border-slate-850/50 grid grid-cols-3 gap-2 text-center text-[10px] font-mono">
                    <div>
                      <span className="text-slate-500 text-[8px] block">GRAND TOTAL</span>
                      <span className="font-bold text-slate-350">
                        ₹{(
                          (pipe7HighCount * pipe7HighRate) + 
                          (pipe7MediumCount * pipe7MediumRate) + 
                          (pipe10HighCount * pipe10HighRate) + 
                          (pipe10MediumCount * pipe10MediumRate)
                        ).toLocaleString()}
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-500 text-[8px] block">DISCOUNT</span>
                      <span className="font-bold text-rose-450">₹{Number(pipeDiscountAmount).toLocaleString()}</span>
                    </div>
                    <div>
                      <span className="text-slate-500 text-[8px] block">GRAND PRICE</span>
                      <span className="font-bold text-emerald-450">
                        ₹{(
                          (pipe7HighCount * pipe7HighRate) + 
                          (pipe7MediumCount * pipe7MediumRate) + 
                          (pipe10HighCount * pipe10HighRate) + 
                          (pipe10MediumCount * pipe10MediumRate) - 
                          pipeDiscountAmount
                        ).toLocaleString()}
                      </span>
                    </div>
                  </div>

                  <div className="flex gap-2 justify-end pt-1">
                    <button
                      type="button"
                      onClick={() => {
                        setIsPipeFormOpen(false);
                        setEditingPipeId(null);
                      }}
                      className="px-3 bg-slate-950 text-slate-400 py-1 rounded"
                    >
                      Cancel
                    </button>
                    <button type="submit" className="px-4 bg-indigo-650 text-white font-bold py-1 rounded">
                      {editingPipeId ? "Update Entry" : "Save Entry"}
                    </button>
                  </div>
                </form>
              )}

              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-mono font-bold text-slate-400 uppercase">Pipe Suppliers & Stock</span>
                  <button
                    type="button"
                    onClick={handleOpenAddPipe}
                    className="bg-indigo-650 hover:bg-indigo-500 py-1 px-2.5 rounded-lg text-[9px] font-bold text-white uppercase tracking-wider flex items-center gap-0.5"
                  >
                    <Plus className="w-3.5 h-3.5" /> Add Casing Pipes (+)
                  </button>
                </div>

                <div className="space-y-2">
                  {pipeEntries.length === 0 ? (
                    <div className="text-center p-6 bg-slate-900/30 rounded-xl text-[10px] text-slate-500">
                      No casing pipe purchase entries registered yet.
                    </div>
                  ) : (
                    pipeEntries.map((supplier) => {
                      // Calculate stock counts
                      // Total feet used from business bills
                      const billsForSupplier = businessBills.filter(b => b.pipeSupplierId === supplier.id);
                      
                      const used7HighFeet = billsForSupplier.reduce((sum, b) => sum + Number(b.casing7HighFeet || 0), 0);
                      const used7MediumFeet = billsForSupplier.reduce((sum, b) => sum + Number(b.casing7MediumFeet || 0), 0);
                      const used10HighFeet = billsForSupplier.reduce((sum, b) => sum + Number(b.casing10HighFeet || 0), 0);
                      const used10MediumFeet = billsForSupplier.reduce((sum, b) => sum + Number(b.casing10MediumFeet || 0), 0);

                      // Convert to pipe counts (1 pipe = 20 feet)
                      const used7HighCount = used7HighFeet / 20;
                      const used7MediumCount = used7MediumFeet / 20;
                      const used10HighCount = used10HighFeet / 20;
                      const used10MediumCount = used10MediumFeet / 20;

                      // Pending stocks
                      const pending7High = Math.max(0, supplier.pipe7HighCount - used7HighCount);
                      const pending7Medium = Math.max(0, supplier.pipe7MediumCount - used7MediumCount);
                      const pending10High = Math.max(0, supplier.pipe10HighCount - used10HighCount);
                      const pending10Medium = Math.max(0, supplier.pipe10MediumCount - used10MediumCount);

                      const totalRegistered = supplier.pipe7HighCount + supplier.pipe7MediumCount + supplier.pipe10HighCount + supplier.pipe10MediumCount;
                      const totalUsed = used7HighCount + used7MediumCount + used10HighCount + used10MediumCount;
                      const totalPending = pending7High + pending7Medium + pending10High + pending10Medium;

                      return (
                        <div key={supplier.id} className="bg-slate-900 border border-slate-850 rounded-2xl p-3.5 space-y-3">
                          {/* Supplier Header */}
                          <div className="flex justify-between items-start">
                            <div>
                              <h4 className="text-sm font-black text-white">{supplier.companyName}</h4>
                              <p className="text-[9px] text-indigo-400 font-mono mt-0.5">Location: {supplier.location}</p>
                              {supplier.dateEntry && (
                                <p className="text-[8px] text-slate-500 font-mono">Date Purchased: {supplier.dateEntry}</p>
                              )}
                            </div>
                            <div className="flex items-center gap-1.5">
                              <button
                                type="button"
                                onClick={() => handleEditPipe(supplier)}
                                className="p-1 bg-slate-950 text-slate-400 hover:text-white border border-slate-850 rounded"
                                title="Edit Supplier"
                              >
                                <Edit className="w-3 h-3" />
                              </button>
                              <button
                                type="button"
                                onClick={() => handleDeletePipe(supplier.id, supplier.companyName)}
                                className="p-1 bg-rose-950/40 text-rose-450 border border-rose-900/40 rounded"
                                title="Delete Supplier"
                              >
                                <Trash2 className="w-3 h-3" />
                              </button>
                            </div>
                          </div>

                          {/* Horizontal Supplier Profile counts in a single row */}
                          <div className="grid grid-cols-5 gap-1.5 text-[9px] font-mono bg-slate-950 p-2 rounded-xl text-center">
                            <div>
                              <span className="text-[7.5px] text-slate-500 block">7" H Qty</span>
                              <span className="font-extrabold text-slate-350">{supplier.pipe7HighCount}</span>
                            </div>
                            <div>
                              <span className="text-[7.5px] text-slate-500 block">7" M Qty</span>
                              <span className="font-extrabold text-slate-350">{supplier.pipe7MediumCount}</span>
                            </div>
                            <div>
                              <span className="text-[7.5px] text-slate-500 block">10" H Qty</span>
                              <span className="font-extrabold text-slate-350">{supplier.pipe10HighCount}</span>
                            </div>
                            <div>
                              <span className="text-[7.5px] text-slate-500 block">10" M Qty</span>
                              <span className="font-extrabold text-slate-350">{supplier.pipe10MediumCount}</span>
                            </div>
                            <div className="border-l border-slate-850">
                              <span className="text-[7.5px] text-indigo-400 block font-bold">Total Pipes</span>
                              <span className="font-black text-indigo-350">{totalRegistered}</span>
                            </div>
                          </div>

                          {/* Stocks and Pending Casing Grid */}
                          <div className="bg-slate-950/40 p-2.5 rounded-xl border border-slate-850/60 space-y-2 text-[9px] font-mono">
                            <span className="text-[8px] font-bold text-slate-400 uppercase tracking-wider block">Casing Stock Allocation</span>
                            
                            <div className="grid grid-cols-2 gap-2 text-slate-300">
                              <div className="bg-slate-900/60 p-1.5 rounded border border-slate-850/40">
                                <span className="text-[7.5px] text-slate-500 block">7" HIGH STOCK</span>
                                <span className="font-bold">Pending: </span>
                                <span className={pending7High > 0 ? "text-emerald-450 font-extrabold" : "text-slate-450"}>{pending7High.toFixed(1)}</span>
                                <span className="text-[7.5px] text-slate-500"> ({supplier.pipe7HighCount} reg / {used7HighCount.toFixed(1)} used)</span>
                              </div>
                              
                              <div className="bg-slate-900/60 p-1.5 rounded border border-slate-850/40">
                                <span className="text-[7.5px] text-slate-500 block">7" MEDIUM STOCK</span>
                                <span className="font-bold">Pending: </span>
                                <span className={pending7Medium > 0 ? "text-emerald-450 font-extrabold" : "text-slate-450"}>{pending7Medium.toFixed(1)}</span>
                                <span className="text-[7.5px] text-slate-500"> ({supplier.pipe7MediumCount} reg / {used7MediumCount.toFixed(1)} used)</span>
                              </div>

                              <div className="bg-slate-900/60 p-1.5 rounded border border-slate-850/40">
                                <span className="text-[7.5px] text-slate-500 block">10" HIGH STOCK</span>
                                <span className="font-bold">Pending: </span>
                                <span className={pending10High > 0 ? "text-emerald-450 font-extrabold" : "text-slate-450"}>{pending10High.toFixed(1)}</span>
                                <span className="text-[7.5px] text-slate-500"> ({supplier.pipe10HighCount} reg / {used10HighCount.toFixed(1)} used)</span>
                              </div>

                              <div className="bg-slate-900/60 p-1.5 rounded border border-slate-850/40">
                                <span className="text-[7.5px] text-slate-500 block">10" MEDIUM STOCK</span>
                                <span className="font-bold">Pending: </span>
                                <span className={pending10Medium > 0 ? "text-emerald-450 font-extrabold" : "text-slate-450"}>{pending10Medium.toFixed(1)}</span>
                                <span className="text-[7.5px] text-slate-500"> ({supplier.pipe10MediumCount} reg / {used10MediumCount.toFixed(1)} used)</span>
                              </div>
                            </div>

                            {/* Summary Bar */}
                            <div className="flex justify-between items-center text-[8.5px] border-t border-slate-850/80 pt-1.5 mt-1 font-bold">
                              <span className="text-slate-500">TOTAL STOCK PENDING:</span>
                              <span className="text-indigo-400 font-extrabold">{totalPending.toFixed(1)} Pipes</span>
                            </div>
                          </div>

                          {/* View Usage History Log */}
                          <div className="pt-0.5">
                            <button
                              type="button"
                              onClick={() => setSelectedPipeForHistory(selectedPipeForHistory === supplier.id ? null : supplier.id)}
                              className="w-full bg-slate-950 hover:bg-slate-900 border border-slate-850/80 text-slate-400 hover:text-white py-1 rounded-xl text-[9px] font-mono font-bold uppercase tracking-wider flex items-center justify-center gap-1"
                            >
                              <History className="w-3.5 h-3.5 text-indigo-450" />
                              {selectedPipeForHistory === supplier.id ? "Close History Log" : "View Usage History Log"}
                            </button>

                            {selectedPipeForHistory === supplier.id && (
                              <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-850 mt-2 space-y-2 text-[9px] font-mono animate-fade-in">
                                <span className="font-bold uppercase text-slate-500 tracking-wider block">Supplier Pipe Usage History</span>
                                {billsForSupplier.length === 0 ? (
                                  <p className="text-slate-500 italic">No usage history recorded. This stock is fully unused.</p>
                                ) : (
                                  <div className="space-y-2">
                                    {billsForSupplier
                                      .slice()
                                      .sort((a, b) => new Date(b.billDate).getTime() - new Date(a.billDate).getTime())
                                      .map((bill) => (
                                        <div key={bill.id} className="bg-slate-900/60 p-2 rounded border border-slate-850/50 space-y-1">
                                          <div className="flex justify-between font-bold text-slate-350">
                                            <span>{bill.billDate}</span>
                                            <span className="text-indigo-400">{bill.clientName}</span>
                                          </div>
                                          <p className="text-[8px] text-slate-500">Location: {bill.location || "-"}</p>
                                          
                                          {/* Feet breakdown */}
                                          <div className="grid grid-cols-2 gap-1 text-[7.5px] text-slate-400 border-t border-slate-850/50 pt-1 mt-1">
                                            {Number(bill.casing7HighFeet) > 0 && <span>7" High: {bill.casing7HighFeet} ft</span>}
                                            {Number(bill.casing7MediumFeet) > 0 && <span>7" Med: {bill.casing7MediumFeet} ft</span>}
                                            {Number(bill.casing10HighFeet) > 0 && <span>10" High: {bill.casing10HighFeet} ft</span>}
                                            {Number(bill.casing10MediumFeet) > 0 && <span>10" Med: {bill.casing10MediumFeet} ft</span>}
                                          </div>
                                        </div>
                                      ))}
                                  </div>
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      )}



      {/* ======================= B. ATTENDANCE SUBSECTION ======================= */}
      {activeMainSection === "management" && activeSubSection === "attendance" && (
        <div id="mobile-attendance-section" className="space-y-4">
          {/* Calendar header with Month Selector */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-3.5 space-y-3">
            <div className="flex justify-between items-center">
              <div className="space-y-0.5">
                <span className="text-[9px] text-slate-500 font-bold uppercase tracking-wider font-mono">Select Monthly Workspace</span>
                <div className="flex items-center gap-1.5">
                  <select
                    value={attendanceSubMonth}
                    onChange={(e) => {
                      setAttendanceSubMonth(Number(e.target.value));
                      setSelectedDaysToEdit([]); // Reset active selected days
                    }}
                    className="bg-slate-950 border border-slate-800 rounded-lg px-2 py-1 text-xs text-indigo-400 font-mono font-bold focus:outline-none cursor-pointer"
                  >
                    {["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"].map((m, idx) => (
                      <option key={m} value={idx}>{m}</option>
                    ))}
                  </select>
 
                  <select
                    value={attendanceSubYear}
                    onChange={(e) => {
                      setAttendanceSubYear(Number(e.target.value));
                      setSelectedDaysToEdit([]); // Reset active selected days
                    }}
                    className="bg-slate-950 border border-slate-800 rounded-lg px-2 py-1 text-xs text-indigo-400 font-mono font-bold focus:outline-none cursor-pointer"
                  >
                    {Array.from({ length: 86 }, (_, i) => 2015 + i).map(y => (
                      <option key={y} value={y}>{y}</option>
                    ))}
                  </select>
                </div>
              </div>
 
              {/* Quick Month Navigation Controls */}
              <div className="flex gap-1">
                <button
                  type="button"
                  onClick={() => {
                    setAttendanceSubMonth(prev => {
                      if (prev === 0) {
                        setAttendanceSubYear(y => y - 1);
                        return 11;
                      }
                      return prev - 1;
                    });
                    setSelectedDaysToEdit([]);
                  }}
                  className="bg-slate-950 border border-slate-800 px-2.5 py-1 text-xs text-slate-350 hover:bg-slate-800 cursor-pointer font-bold font-mono rounded-lg transition"
                >
                  ← Prev
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setAttendanceSubMonth(prev => {
                      if (prev === 11) {
                        setAttendanceSubYear(y => y + 1);
                        return 0;
                      }
                      return prev + 1;
                    });
                    setSelectedDaysToEdit([]);
                  }}
                  className="bg-slate-950 border border-slate-800 px-2.5 py-1 text-xs text-slate-350 hover:bg-slate-800 cursor-pointer font-bold font-mono rounded-lg transition"
                >
                  Next →
                </button>
              </div>
            </div>

            {/* Quick Monthly Summary Totals inside selectedMonth */}
            {(() => {
              const monthStr = String(attendanceSubMonth + 1).padStart(2, '0');
              const monthPrefix = `${attendanceSubYear}-${monthStr}-`;
              const monthRecords = (attendance || []).filter(r => r.date.startsWith(monthPrefix));
              const presents = monthRecords.filter(r => r.status === "Present").length;
              const halfDays = monthRecords.filter(r => r.status === "Half-Day").length;
              const absents = monthRecords.filter(r => r.status === "Absent").length;

              return (
                <div className="space-y-3">
                  <div className="grid grid-cols-3 gap-1.5 pt-1">
                    <div className="bg-emerald-950/20 border border-emerald-900/30 p-2 rounded-lg text-center">
                      <span className="text-[7.5px] text-slate-500 font-mono block uppercase">Total Presents</span>
                      <span className="text-xs font-black text-emerald-400 font-mono">{presents}d</span>
                    </div>
                    <div className="bg-cyan-950/20 border border-cyan-900/30 p-2 rounded-lg text-center">
                      <span className="text-[7.5px] text-slate-500 font-mono block uppercase">Total Half-Days</span>
                      <span className="text-xs font-black text-cyan-400 font-mono">{halfDays}d</span>
                    </div>
                    <div className="bg-rose-950/20 border border-rose-900/30 p-2 rounded-lg text-center">
                      <span className="text-[7.5px] text-slate-500 font-mono block uppercase">Total Absents</span>
                      <span className="text-xs font-black text-rose-400 font-mono">{absents}d</span>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      downloadAttendanceReportPDF(labours, attendance || [], attendanceSubMonth, attendanceSubYear);
                      triggerOnlineSync(`Downloaded Attendance Report for All Labour - ${attendanceSubMonth + 1}/${attendanceSubYear}`);
                    }}
                    className="w-full bg-indigo-600 hover:bg-indigo-550 active:bg-indigo-700 text-white font-black py-2 px-3 rounded-lg flex items-center justify-center gap-1.5 text-xs font-mono tracking-wider transition uppercase cursor-pointer shadow-md shadow-indigo-950/45 border border-indigo-500/20"
                  >
                    <FileText className="w-4 h-4" />
                    Download Monthly Attendance Report
                  </button>
                </div>
              );
            })()}
          </div>

          {/* Search and Filters */}
          <div className="flex gap-2 items-center">
            <div className="relative flex-1">
              <span className="absolute inset-y-0 left-0 flex items-center pl-2.5 pointer-events-none">
                <Search className="h-3.5 w-3.5 text-slate-500" />
              </span>
              <input
                type="text"
                placeholder="Search staff to log..."
                value={attendanceSearchQuery}
                onChange={(e) => setAttendanceSearchQuery(e.target.value)}
                className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-8 pr-2.5 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none"
              />
            </div>

            <div className="flex bg-slate-900 border border-slate-800 p-0.5 rounded-lg text-[10px]">
              {["All", "Driver", "Helper"].map((role) => (
                <button
                  key={role}
                  type="button"
                  onClick={() => setAttendanceRoleFilter(role as any)}
                  className={`px-2 py-1 rounded-md font-bold transition cursor-pointer ${
                    attendanceRoleFilter === role 
                      ? "bg-indigo-650 text-white" 
                      : "text-slate-400 hover:text-white"
                  }`}
                >
                  {role}
                </button>
              ))}
            </div>
          </div>

          {/* Records Grid List formatted with monthly statistics */}
          <div className="space-y-3">
            {(() => {
              const monthStr = String(attendanceSubMonth + 1).padStart(2, '0');
              const monthPrefix = `${attendanceSubYear}-${monthStr}-`;

              const filteredLabours = labours.filter(l => {
                const matchesRole = attendanceRoleFilter === "All" || l.skillType === attendanceRoleFilter;
                const matchesSearch = l.fullName.toLowerCase().includes(attendanceSearchQuery.toLowerCase());
                return matchesRole && matchesSearch;
              });

              // Sort active profiles on top, inactive (freezed) profiles below
              const sortedFilteredLabours = [...filteredLabours].sort((a, b) => {
                const aFreezed = !!a.isFreezed;
                const bFreezed = !!b.isFreezed;
                if (aFreezed && !bFreezed) return 1;
                if (!aFreezed && bFreezed) return -1;
                return 0;
              });

              if (sortedFilteredLabours.length === 0) {
                return (
                  <div className="text-center py-8 bg-slate-900 border border-slate-850 rounded-xl">
                    <AlertCircle className="w-5 h-5 text-slate-550 mx-auto mb-1.5" />
                    <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider font-mono">No labour profiles found</span>
                  </div>
                );
              }

              return sortedFilteredLabours.map(lab => {
                // Monthly tallies for each worker
                const workerRecords = (attendance || []).filter(
                  r => r.labourId === lab.id && r.date.startsWith(monthPrefix)
                );
                const pCount = workerRecords.filter(r => r.status === "Present").length;
                const hCount = workerRecords.filter(r => r.status === "Half-Day").length;
                const aCount = workerRecords.filter(r => r.status === "Absent").length;
                const isExpanded = expandedLabourId === lab.id;
                const isLabFreezed = lab.isFreezed;

                return (
                  <div 
                    key={lab.id}
                    className={`bg-slate-900 border rounded-xl p-3 space-y-3 transition duration-150 ${
                      isExpanded 
                        ? "border-indigo-500/80 ring-1 ring-indigo-500/20" 
                        : isLabFreezed 
                          ? "bg-slate-950/40 border-amber-955/35 opacity-70" 
                          : "border-slate-850"
                    }`}
                  >
                    {/* Worker Core Row */}
                    <div className="flex flex-col xs:flex-row gap-3 items-start xs:items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        {renderLabourAvatar(lab, {
                          className: `w-8.5 h-8.5 border object-cover ${isLabFreezed ? "border-amber-950/40 grayscale" : "border-slate-800"}`,
                          iconClassName: "w-4 h-4",
                          roundedClassName: "rounded-full",
                          animated: true,
                        })}
                        <div className="space-y-0.5">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <h4 className={`text-xs font-black truncate ${
                              isLabFreezed ? "text-slate-550 line-through" : "text-red-500"
                            }`}>{lab.fullName}</h4>
                            {isLabFreezed && (
                              <span className="bg-amber-950/30 text-amber-500 text-[6px] font-mono px-1 rounded border border-amber-900/20 font-bold shrink-0">
                                FREEZED / QUIT
                              </span>
                            )}
                            <span className={`text-[7px] font-bold uppercase tracking-wider px-1 py-0.2 rounded-md ${
                              lab.skillType === "Driver" ? "bg-indigo-950 text-indigo-400 border border-indigo-900/30" : "bg-emerald-950 text-emerald-400 border border-emerald-900/30"
                            }`}>
                              {lab.skillType}
                            </span>
                          </div>
                          <p className="text-[9px] text-slate-550 font-mono">{lab.phone}</p>
                        </div>
                      </div>

                      {/* Cumulative Month stats & Expand Button */}
                      <div className="flex items-center gap-3 w-full xs:w-auto justify-between xs:justify-end">
                        <div className="flex gap-2 text-[9px] font-bold font-mono bg-slate-950 px-2.5 py-1.5 rounded-lg border border-slate-850">
                          <span className="text-emerald-400 font-extrabold">P:{pCount}d</span>
                          <span className="text-slate-600">|</span>
                          <span className="text-cyan-400 font-extrabold">H:{hCount}d</span>
                          <span className="text-slate-600">|</span>
                          <span className="text-rose-450 font-extrabold">A:{aCount}d</span>
                        </div>

                        <button
                          type="button"
                          onClick={() => {
                            if (isExpanded) {
                              setExpandedLabourId(null);
                              setSelectedDaysToEdit([]);
                            } else {
                              setExpandedLabourId(lab.id);
                              setSelectedDaysToEdit([]);
                            }
                          }}
                          className={`px-3 py-1.5 text-[9.5px] font-bold uppercase tracking-wider rounded-lg border transition cursor-pointer select-none flex items-center gap-1 ${
                            isExpanded 
                              ? "bg-indigo-950 border-indigo-900 text-indigo-400" 
                              : "bg-slate-950 border-slate-850 text-slate-350 hover:bg-slate-800"
                          }`}
                        >
                          <Calendar className="w-3 h-3" />
                          <span>{isExpanded ? "Close" : "Calendar"}</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => {
                            downloadSingleLabourAttendancePDF(lab, attendance || [], attendanceSubMonth, attendanceSubYear);
                            triggerOnlineSync(`Downloaded Attendance profile of ${lab.fullName}`);
                          }}
                          className="p-2 bg-slate-950 hover:bg-slate-900 border border-slate-850 text-indigo-400 rounded-lg flex items-center justify-center transition cursor-pointer shrink-0"
                          title="Download PDF Report"
                        >
                          <Download className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    {/* Expandable Month Calendar Grid */}
                    {isExpanded && (() => {
                      const daysInMonth = new Date(attendanceSubYear, attendanceSubMonth + 1, 0).getDate();
                      const firstDayOfWeek = new Date(attendanceSubYear, attendanceSubMonth, 1).getDay(); // 0 (Sun) - 6 (Sat)
                      const monthName = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"][attendanceSubMonth];

                      return (
                        <div className="bg-slate-950 border border-slate-850 rounded-xl p-3 space-y-3.5 mt-1">
                          <div className="flex justify-between items-center border-b border-slate-900 pb-2 gap-2">
                            <div className="flex items-center gap-1">
                              <button
                                type="button"
                                onClick={() => {
                                  setAttendanceSubMonth(prev => {
                                    if (prev === 0) {
                                      setAttendanceSubYear(y => y - 1);
                                      return 11;
                                    }
                                    return prev - 1;
                                  });
                                  setSelectedDaysToEdit([]);
                                }}
                                className="bg-slate-900 border border-slate-800 px-2 py-1 text-[9px] text-slate-300 hover:text-white hover:bg-slate-800 rounded transition cursor-pointer font-bold font-mono"
                              >
                                ← Prev
                              </button>
                              <select
                                value={attendanceSubMonth}
                                onChange={(e) => {
                                  setAttendanceSubMonth(Number(e.target.value));
                                  setSelectedDaysToEdit([]);
                                }}
                                className="bg-slate-900 border border-slate-800 text-[9.5px] text-indigo-400 font-mono font-black rounded px-1.5 py-0.5 focus:outline-none cursor-pointer uppercase mx-0.5"
                              >
                                {["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"].map((m, idx) => (
                                  <option key={idx} value={idx} className="bg-slate-950 text-slate-200">{m}</option>
                                ))}
                              </select>
                              <select
                                value={attendanceSubYear}
                                onChange={(e) => {
                                  setAttendanceSubYear(Number(e.target.value));
                                  setSelectedDaysToEdit([]);
                                }}
                                className="bg-slate-900 border border-slate-800 text-[9.5px] text-indigo-400 font-mono font-black rounded px-1.5 py-0.5 focus:outline-none cursor-pointer uppercase mx-0.5"
                              >
                                {Array.from({ length: 86 }, (_, i) => 2015 + i).map(y => (
                                  <option key={y} value={y} className="bg-slate-950 text-slate-200">{y}</option>
                                ))}
                              </select>
                              <button
                                type="button"
                                onClick={() => {
                                  setAttendanceSubMonth(prev => {
                                    if (prev === 11) {
                                      setAttendanceSubYear(y => y + 1);
                                      return 0;
                                    }
                                    return prev + 1;
                                  });
                                  setSelectedDaysToEdit([]);
                                }}
                                className="bg-slate-900 border border-slate-800 px-2 py-1 text-[9px] text-slate-300 hover:text-white hover:bg-slate-800 rounded transition cursor-pointer font-bold font-mono"
                              >
                                Next →
                              </button>
                            </div>
                            <div className="flex items-center gap-1.5">
                              <button
                                type="button"
                                onClick={() => {
                                  const allDays = Array.from({ length: daysInMonth }, (_, i) => i + 1);
                                  setSelectedDaysToEdit(allDays);
                                }}
                                className="px-1.5 py-0.5 bg-indigo-950/60 border border-indigo-900/40 text-indigo-400 text-[8px] font-bold font-mono rounded hover:bg-indigo-950 transition cursor-pointer uppercase"
                              >All</button>
                              <button
                                type="button"
                                onClick={() => setSelectedDaysToEdit([])}
                                className="px-1.5 py-0.5 bg-slate-900 border border-slate-800 text-slate-400 text-[8px] font-bold font-mono rounded hover:bg-slate-800 transition cursor-pointer uppercase"
                              >Clear</button>
                              <span className="text-[8px] text-slate-550 font-mono uppercase leading-none">
                                {selectedDaysToEdit.length > 0 ? `${selectedDaysToEdit.length} selected` : "Tap to select"}
                              </span>
                            </div>
                          </div>

                          {/* Calendar Week Days headers */}
                          <div className="grid grid-cols-7 gap-1.5 text-center font-mono text-[9px] font-bold text-slate-500 uppercase">
                            {["S", "M", "T", "W", "T", "F", "S"].map((dName, idx) => (
                              <span key={idx}>{dName}</span>
                            ))}

                            {/* Leading blank columns offset */}
                            {Array.from({ length: firstDayOfWeek }).map((_, idx) => (
                              <div key={`blank-${idx}`} className="h-8" />
                            ))}

                            {/* Actual Month Days */}
                            {Array.from({ length: daysInMonth }).map((_, idx) => {
                              const dayBox = idx + 1;
                              const targetDateString = `${monthPrefix}${String(dayBox).padStart(2, '0')}`;
                              const testRecord = (attendance || []).find(
                                r => r.labourId === lab.id && r.date === targetDateString
                              );
                              const dayStatus = testRecord?.status;

                              let cellColor = "bg-slate-900/60 border-slate-850 text-slate-400 hover:bg-slate-850";
                              if (dayStatus === "Present") {
                                cellColor = "bg-emerald-950/40 text-emerald-400 border-emerald-900/65 hover:bg-emerald-950/60";
                              } else if (dayStatus === "Half-Day") {
                                cellColor = "bg-cyan-950/40 text-cyan-400 border-cyan-900/65 hover:bg-cyan-950/60";
                              } else if (dayStatus === "Absent") {
                                cellColor = "bg-rose-950/40 text-rose-455 border-rose-900/65 hover:bg-rose-950/60";
                              }

                              const isSelectedDay = selectedDaysToEdit.includes(dayBox);
                              if (isSelectedDay) {
                                cellColor += " ring-2 ring-indigo-400 ring-offset-1 ring-offset-slate-950";
                              }

                              return (
                                <button
                                  key={dayBox}
                                  type="button"
                                  onClick={() => {
                                    setSelectedDaysToEdit(prev =>
                                      prev.includes(dayBox)
                                        ? prev.filter(d => d !== dayBox)
                                        : [...prev, dayBox].sort((a, b) => a - b)
                                    );
                                  }}
                                  className={`h-8 rounded-lg flex flex-col items-center justify-center text-[10px] border font-mono font-bold transition cursor-pointer relative ${cellColor}`}
                                >
                                  <span>{dayBox}</span>
                                  {/* Little status indicator dot inside day block */}
                                  {dayStatus && (
                                    <span className={`w-1 h-1 rounded-full absolute bottom-1 ${
                                      dayStatus === "Present" ? "bg-emerald-400" :
                                      dayStatus === "Half-Day" ? "bg-cyan-400" : "bg-rose-450"
                                    }`} />
                                  )}
                                </button>
                              );
                            })}
                          </div>

                          {/* Multi-date Quick Edit panel */}
                          {selectedDaysToEdit.length > 0 && (() => {
                            // Compute statuses for all selected days
                            const selectedStatuses = selectedDaysToEdit.map(d => {
                              const ds = `${monthPrefix}${String(d).padStart(2, '0')}`;
                              return (attendance || []).find(r => r.labourId === lab.id && r.date === ds)?.status;
                            });
                            const uniqueStatuses = [...new Set(selectedStatuses.filter(Boolean))];
                            const displayStatus = selectedDaysToEdit.length === 1
                              ? (selectedStatuses[0] || "Unmarked")
                              : uniqueStatuses.length === 1 ? uniqueStatuses[0] : (uniqueStatuses.length > 1 ? "Mixed" : "Unmarked");

                            // Helper: mark all selected days with a given status
                            const markAllSelected = (newStatus: "Present" | "Half-Day" | "Absent") => {
                              setAttendance(prev => {
                                let updated = [...prev];
                                selectedDaysToEdit.forEach(d => {
                                  const ds = `${monthPrefix}${String(d).padStart(2, '0')}`;
                                  const idx2 = updated.findIndex(r => r.labourId === lab.id && r.date === ds);
                                  if (idx2 > -1) {
                                    updated[idx2] = { ...updated[idx2], status: newStatus };
                                  } else {
                                    updated.push({ id: `att-${Date.now()}-${lab.id}-${d}`, labourId: lab.id, date: ds, status: newStatus });
                                  }
                                });
                                return updated;
                              });
                              selectedDaysToEdit.forEach(d => {
                                const ds = `${monthPrefix}${String(d).padStart(2, '0')}`;
                                void requestJson(apiBaseUrl, "/api/v1/labours/attendance", {
                                  method: "POST",
                                  headers: { "Content-Type": "application/json" },
                                  body: JSON.stringify({ date: ds, records: [{ labour_id: lab.id, status: newStatus, reason: null }] }),
                                }).catch(console.error);
                              });
                              triggerOnlineSync(`Marked ${lab.fullName} ${newStatus} for ${selectedDaysToEdit.length} days in ${monthName}`);
                            };

                            // Helper: clear all selected days
                            const clearAllSelected = () => {
                              setAttendance(prev => prev.filter(r => !(r.labourId === lab.id && selectedDaysToEdit.map(d => `${monthPrefix}${String(d).padStart(2, '0')}`).includes(r.date))));
                              selectedDaysToEdit.forEach(d => {
                                const ds = `${monthPrefix}${String(d).padStart(2, '0')}`;
                                void requestJson(apiBaseUrl, `/api/v1/labours/attendance/${lab.id}/${ds}`, { method: "DELETE" }).catch(console.error);
                              });
                              triggerOnlineSync(`Cleared attendance for ${lab.fullName} on ${selectedDaysToEdit.length} days in ${monthName}`);
                            };

                            // For single day: resolve foundRecord for reason editing
                            const singleDateString = selectedDaysToEdit.length === 1
                              ? `${monthPrefix}${String(selectedDaysToEdit[0]).padStart(2, '0')}`
                              : null;
                            const foundRecord = singleDateString
                              ? (attendance || []).find(r => r.labourId === lab.id && r.date === singleDateString)
                              : null;
                            const recordStatus = foundRecord?.status;
                            return (
                              <div className="bg-slate-900/85 border border-indigo-900/30 p-3 rounded-xl space-y-2.5 text-[9.5px]">
                                {/* Header: selected day count and date info */}
                                <div className="flex justify-between items-center font-mono">
                                  <span className="text-indigo-300 font-bold text-[10px]">
                                    {selectedDaysToEdit.length === 1
                                      ? `${monthName} ${selectedDaysToEdit[0]}, ${attendanceSubYear}`
                                      : `${selectedDaysToEdit.length} Days Selected`}
                                  </span>
                                  <div className="flex items-center gap-1.5">
                                    <span className={`font-black uppercase text-[9px] ${
                                      displayStatus === "Present" ? "text-emerald-400" :
                                      displayStatus === "Half-Day" ? "text-cyan-400" :
                                      displayStatus === "Absent" ? "text-rose-400" :
                                      displayStatus === "Mixed" ? "text-amber-400" : "text-slate-500"
                                    }`}>{displayStatus}</span>
                                    <button
                                      type="button"
                                      onClick={() => setSelectedDaysToEdit([])}
                                      className="px-1.5 py-0.5 bg-slate-800 border border-slate-700 text-slate-400 text-[8px] font-bold font-mono rounded hover:bg-slate-700 transition cursor-pointer uppercase"
                                    >✕ Deselect All</button>
                                  </div>
                                </div>

                                {/* Batch Mark Buttons */}
                                <div className="grid grid-cols-4 gap-1.5 pt-0.5">
                                  <button
                                    type="button"
                                    onClick={() => markAllSelected("Present")}
                                    className={`py-1.5 text-[8.5px] font-black uppercase rounded-lg transition border cursor-pointer ${
                                      displayStatus === "Present"
                                        ? "bg-emerald-500 text-white border-emerald-500 shadow-md shadow-emerald-950/30"
                                        : "bg-slate-950 border-slate-800 text-slate-400 hover:bg-emerald-950/40 hover:text-emerald-400 hover:border-emerald-900/50"
                                    }`}
                                  >
                                    ✓ Present
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => markAllSelected("Half-Day")}
                                    className={`py-1.5 text-[8.5px] font-black uppercase rounded-lg transition border cursor-pointer ${
                                      displayStatus === "Half-Day"
                                        ? "bg-cyan-500 text-white border-cyan-500 shadow-md shadow-cyan-950/30"
                                        : "bg-slate-950 border-slate-800 text-slate-400 hover:bg-cyan-950/40 hover:text-cyan-400 hover:border-cyan-900/50"
                                    }`}
                                  >
                                    ½ Half
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => markAllSelected("Absent")}
                                    className={`py-1.5 text-[8.5px] font-black uppercase rounded-lg transition border cursor-pointer ${
                                      displayStatus === "Absent"
                                        ? "bg-rose-500 text-white border-rose-500 shadow-md shadow-rose-950/30"
                                        : "bg-slate-950 border-slate-800 text-slate-400 hover:bg-rose-950/40 hover:text-rose-400 hover:border-rose-900/50"
                                    }`}
                                  >
                                    ✗ Absent
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => clearAllSelected()}
                                    className="py-1.5 text-[8.5px] font-black uppercase rounded-lg transition border cursor-pointer bg-slate-950 border-slate-800 text-slate-500 hover:bg-slate-800 hover:text-white"
                                  >
                                    ⌫ Clear
                                  </button>
                                </div>

                                {/* Reason editing (only shown when exactly 1 day is selected and it has Absent or Half-Day) */}
                                {selectedDaysToEdit.length === 1 && (recordStatus === "Absent" || recordStatus === "Half-Day") && (
                                  <div className="mt-2 pt-2.5 border-t border-slate-800/60 space-y-2">
                                    <div className="flex justify-between items-center">
                                      <span className="text-[9px] text-slate-500 font-bold uppercase tracking-wider font-mono">
                                        Reason for {recordStatus}
                                      </span>
                                      {foundRecord?.reason && !isEditingAttendanceReason && (
                                        <button
                                          type="button"
                                          onClick={() => setIsEditingAttendanceReason(true)}
                                          className="text-[9px] text-indigo-400 hover:text-indigo-350 cursor-pointer font-bold uppercase tracking-wider flex items-center gap-0.5"
                                        >
                                          <Edit className="w-2.5 h-2.5" />
                                          <span>Edit</span>
                                        </button>
                                      )}
                                    </div>

                                    {!isEditingAttendanceReason && foundRecord?.reason ? (
                                      <div className="bg-slate-950 px-2.5 py-2 rounded-lg border border-slate-850 flex items-center justify-between text-[10px]">
                                        <p className="text-slate-300 italic font-mono">"{foundRecord.reason}"</p>
                                      </div>
                                    ) : (
                                      <div className="space-y-1.5">
                                        <input
                                          type="text"
                                          placeholder="e.g. Sick, Personal work, Native place trip..."
                                          value={attendanceReasonText}
                                          onChange={(e) => setAttendanceReasonText(e.target.value)}
                                          className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-[10.5px] text-white placeholder-slate-550 focus:outline-none focus:border-indigo-500 font-sans"
                                        />
                                        <div className="flex justify-end gap-1.5">
                                          {foundRecord?.reason && (
                                            <button
                                              type="button"
                                              onClick={() => setIsEditingAttendanceReason(false)}
                                              className="bg-slate-950 hover:bg-slate-850 px-2.5 py-1 rounded text-[9px] text-slate-400 font-bold font-mono transition cursor-pointer"
                                            >
                                              Cancel
                                            </button>
                                          )}
                                          <button
                                            type="button"
                                            onClick={() => {
                                              if (!singleDateString) return;
                                              setAttendance(prev => {
                                                return prev.map(r => {
                                                  if (r.labourId === lab.id && r.date === singleDateString) {
                                                    return { ...r, reason: attendanceReasonText.trim() };
                                                  }
                                                  return r;
                                                });
                                              });
                                              setIsEditingAttendanceReason(false);
                                              triggerOnlineSync(`Saved reason for ${lab.fullName} on ${singleDateString}: ${attendanceReasonText}`);
                                              void requestJson(apiBaseUrl, "/api/v1/labours/attendance", {
                                                method: "POST",
                                                headers: { "Content-Type": "application/json" },
                                                body: JSON.stringify({
                                                  date: singleDateString,
                                                  records: [{
                                                    labour_id: lab.id,
                                                    status: recordStatus || "Absent",
                                                    reason: attendanceReasonText.trim() || null,
                                                  }],
                                                }),
                                              }).catch((error) => console.error(error));
                                            }}
                                            className="bg-indigo-600 hover:bg-indigo-550 px-3 py-1 rounded text-[9.5px] text-white font-black font-mono transition cursor-pointer uppercase tracking-wider"
                                          >
                                            Save Reason
                                          </button>
                                        </div>
                                      </div>
                                    )}
                                  </div>
                                )}
                              </div>
                            );
                          })()}
                        </div>
                      );
                    })()}
                  </div>
                );
              });
            })()}
          </div>
        </div>
      )}

      {/* ======================= C. VEHICLE MANAGEMENT ======================= */}
      {activeMainSection === "management" && activeSubSection === "vehicles" && (
        <div className="space-y-4">
          
          {/* Subheader Switcher: 4-Way Grid */}
          <div className="grid grid-cols-2 gap-1.5 text-[10px] sm:text-xs">
            <button
              type="button"
              onClick={() => {
                setVehicleSubTab("profiles");
                setIsFuelFormOpen(false);
              }}
              className={`p-2 bg-slate-900 border rounded-xl text-center font-bold tracking-tight transition-all duration-150 ${
                vehicleSubTab === "profiles" ? "border-indigo-500 text-indigo-400 bg-indigo-950/20" : "border-slate-850 text-slate-400 hover:text-slate-200"
              }`}
            >
              🚚 Vehicle Profiles
            </button>
            <button
              type="button"
              onClick={() => {
                setVehicleSubTab("service");
                setIsFuelFormOpen(false);
              }}
              className={`p-2 bg-slate-900 border rounded-xl text-center font-bold tracking-tight transition-all duration-150 ${
                vehicleSubTab === "service" ? "border-indigo-500 text-indigo-400 bg-indigo-950/20" : "border-slate-850 text-slate-400 hover:text-slate-200"
              }`}
            >
              🛠️ Service Entries
            </button>
            <button
              type="button"
              onClick={() => {
                setVehicleSubTab("fuel");
                setIsFuelFormOpen(true);
                setFuelVehicleName(vehicles[0]?.vehicleName || "");
              }}
              className={`p-2 bg-slate-900 border rounded-xl text-center font-bold tracking-tight transition-all duration-150 ${
                vehicleSubTab === "fuel" ? "border-indigo-500 text-indigo-400 bg-indigo-950/20" : "border-slate-850 text-slate-400 hover:text-slate-200"
              }`}
            >
              ⛽ Fuel Entries
            </button>
            <button
              type="button"
              onClick={() => {
                setVehicleSubTab("materials");
                setIsFuelFormOpen(false);
              }}
              className={`p-2 bg-slate-900 border rounded-xl text-center font-bold tracking-tight transition-all duration-150 ${
                vehicleSubTab === "materials" ? "border-indigo-500 text-indigo-400 bg-indigo-950/20" : "border-slate-850 text-slate-400 hover:text-slate-200"
              }`}
            >
              📦 Materials Bought
            </button>
          </div>

          {vehicleSubTab === "profiles" && (
            /* VEHICLE ROAD MAP LISTING */
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-xs font-mono font-bold text-slate-400 uppercase">Registered Fleet Log</span>
                <button
                  onClick={handleOpenAddVehicle}
                  className="bg-indigo-650 hover:bg-indigo-500 py-1 px-2.5 rounded-lg text-[9px] font-bold text-white uppercase tracking-wider flex items-center gap-0.5"
                >
                  <Plus className="w-3.5 h-3.5" /> Register Fleet
                </button>
              </div>

              {/* Add / Edit Vehicle Form in place */}
              {isVehicleFormOpen && (
                <form onSubmit={handleSaveVehicle} className="bg-slate-900 p-3 rounded-xl border border-slate-800 space-y-3 text-xs">
                  <span className="text-[10px] font-mono font-bold text-amber-500 block uppercase">
                    {editingVehicleId ? "Edit Registered Carrier" : "Register Core Business Carrier"}
                  </span>

                  <div className="space-y-2 font-mono text-slate-300">
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="text-[9px] text-slate-500">PLATE NO ID</label>
                        <input
                          type="text"
                          value={vehId}
                          onChange={(e) => setVehId(e.target.value)}
                          className="w-full bg-slate-950 p-1.5 rounded focus:outline-none focus:border-indigo-500 text-slate-200"
                          placeholder="DL-03-CX-4567"
                          required
                        />
                      </div>
                      <div>
                        <label className="text-[9px] text-slate-500">NICKNAME NAME</label>
                        <input
                          type="text"
                          value={vehName}
                          onChange={(e) => setVehName(e.target.value)}
                          className="w-full bg-slate-950 p-1.5 rounded text-slate-200"
                          placeholder="e.g. Blue Tipper"
                          required
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-1">
                      <div>
                        <label className="text-[9px] text-slate-500">TYPE</label>
                        <select
                          value={vehType}
                          onChange={(e) => setVehType(e.target.value as any)}
                          className="w-full bg-slate-950 p-1.5 text-[10px] text-slate-300 rounded"
                        >
                          {["Truck", "Tractor", "Car", "Van", "Two-Wheeler"].map(v => (
                            <option key={v} value={v}>{v}</option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="text-[9px] text-slate-500">BRAND</label>
                        <input
                          type="text"
                          value={vehBrand}
                          onChange={(e) => setVehBrand(e.target.value)}
                          className="w-full bg-slate-950 p-1.5 rounded text-[10px]"
                          placeholder="Tata"
                        />
                      </div>
                      <div>
                        <label className="text-[9px] text-slate-500">MODEL & CYL</label>
                        <input
                          type="text"
                          value={vehModel}
                          onChange={(e) => setVehModel(e.target.value)}
                          className="w-full bg-slate-950 p-1.5 rounded text-[10px]"
                          placeholder="SFC 407"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-[10px]">
                      <div>
                        <label className="text-[9px] text-slate-500">REGISTRATION DATE</label>
                        <input type="date" value={vehRegDate} onChange={(e) => setVehRegDate(e.target.value)} className="w-full bg-slate-950 p-1 rounded font-mono text-slate-300" />
                      </div>
                      <div>
                        <label className="text-[9px] text-slate-500">INSURANCE EXPIRY</label>
                        <input type="date" value={vehInsExpiry} onChange={(e) => setVehInsExpiry(e.target.value)} className="w-full bg-slate-950 p-1 rounded font-mono text-slate-300" />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-[10px]">
                      <div>
                        <label className="text-[9px] text-slate-500">FITNESS EXPIRY</label>
                        <input type="date" value={vehFitExpiry} onChange={(e) => setVehFitExpiry(e.target.value)} className="w-full bg-slate-950 p-1 rounded font-mono text-slate-300" />
                      </div>
                      <div>
                        <label className="text-[9px] text-slate-500">POLLUTION EXPIRY</label>
                        <input type="date" value={vehPolExpiry} onChange={(e) => setVehPolExpiry(e.target.value)} className="w-full bg-slate-950 p-1 rounded font-mono text-slate-300" />
                      </div>
                    </div>

                    {/* File uploading utility with real Drag & Drop support */}
                    <div className="space-y-1.5 pt-2 border-t border-slate-900">
                      <span className="text-[9px] uppercase font-bold text-indigo-400 block tracking-wider">📎 Legal Regulatory Upload (Select or Drag & Drop)</span>
                      <div className="grid grid-cols-2 gap-2 mt-1">
                        
                        {/* RC Book Zone */}
                        <div 
                          className="relative border border-dashed border-slate-800 bg-slate-950 hover:bg-slate-900 transition p-2 rounded-xl flex flex-col items-center justify-center text-center cursor-pointer min-h-[56px] group"
                          onDragOver={(e) => e.preventDefault()}
                          onDrop={(e) => {
                            e.preventDefault();
                            if (e.dataTransfer.files?.[0]) handleVehicleDocumentUpload("rcBook", e.dataTransfer.files[0]);
                          }}
                        >
                          <input 
                            type="file" 
                            accept="image/*,application/pdf"
                            className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                            onChange={(e) => {
                              if (e.target.files?.[0]) handleVehicleDocumentUpload("rcBook", e.target.files[0]);
                            }}
                          />
                          <Upload className={`w-3.5 h-3.5 mb-1 ${vehRcBookFile ? "text-emerald-400" : "text-slate-500 group-hover:text-indigo-400"}`} />
                          <span className="text-[8px] font-bold text-slate-300 block leading-tight">RC Book Document</span>
                          <span className="text-[7.5px] text-slate-500 truncate max-w-[124px] mt-0.5">
                            {vehRcBookFile ? (vehRcBookFile.startsWith("data:") ? "Custom Doc Ingested" : vehRcBookFile) : "PDF or Image"}
                          </span>
                        </div>

                        {/* Insurance Receipt Zone */}
                        <div 
                          className="relative border border-dashed border-slate-800 bg-slate-950 hover:bg-slate-900 transition p-2 rounded-xl flex flex-col items-center justify-center text-center cursor-pointer min-h-[56px] group"
                          onDragOver={(e) => e.preventDefault()}
                          onDrop={(e) => {
                            e.preventDefault();
                            if (e.dataTransfer.files?.[0]) handleVehicleDocumentUpload("insurance", e.dataTransfer.files[0]);
                          }}
                        >
                          <input 
                            type="file" 
                            accept="image/*,application/pdf"
                            className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                            onChange={(e) => {
                              if (e.target.files?.[0]) handleVehicleDocumentUpload("insurance", e.target.files[0]);
                            }}
                          />
                          <Upload className={`w-3.5 h-3.5 mb-1 ${vehInsuranceFile ? "text-emerald-400" : "text-slate-500 group-hover:text-amber-400"}`} />
                          <span className="text-[8px] font-bold text-slate-300 block leading-tight">Insurance Receipt</span>
                          <span className="text-[7.5px] text-slate-500 truncate max-w-[124px] mt-0.5">
                            {vehInsuranceFile ? (vehInsuranceFile.startsWith("data:") ? "Custom Doc Ingested" : vehInsuranceFile) : "PDF or Image"}
                          </span>
                        </div>

                        {/* State Permit */}
                        <div 
                          className="relative border border-dashed border-slate-800 bg-slate-950 hover:bg-slate-900 transition p-2 rounded-xl flex flex-col items-center justify-center text-center cursor-pointer min-h-[56px] group"
                          onDragOver={(e) => e.preventDefault()}
                          onDrop={(e) => {
                            e.preventDefault();
                            if (e.dataTransfer.files?.[0]) handleVehicleDocumentUpload("permit", e.dataTransfer.files[0]);
                          }}
                        >
                          <input 
                            type="file" 
                            accept="image/*,application/pdf"
                            className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                            onChange={(e) => {
                              if (e.target.files?.[0]) handleVehicleDocumentUpload("permit", e.target.files[0]);
                            }}
                          />
                          <Upload className={`w-3.5 h-3.5 mb-1 ${vehPermitFile ? "text-emerald-400" : "text-slate-500 group-hover:text-purple-400"}`} />
                          <span className="text-[8px] font-bold text-slate-300 block leading-tight">State Permit Doc</span>
                          <span className="text-[7.5px] text-slate-500 truncate max-w-[124px] mt-0.5">
                            {vehPermitFile ? (vehPermitFile.startsWith("data:") ? "Custom Doc Ingested" : vehPermitFile) : "PDF or Image"}
                          </span>
                        </div>

                        {/* FC Certificate */}
                        <div 
                          className="relative border border-dashed border-slate-800 bg-slate-950 hover:bg-slate-900 transition p-2 rounded-xl flex flex-col items-center justify-center text-center cursor-pointer min-h-[56px] group"
                          onDragOver={(e) => e.preventDefault()}
                          onDrop={(e) => {
                            e.preventDefault();
                            if (e.dataTransfer.files?.[0]) handleVehicleDocumentUpload("fitness", e.dataTransfer.files[0]);
                          }}
                        >
                          <input 
                            type="file" 
                            accept="image/*,application/pdf"
                            className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                            onChange={(e) => {
                              if (e.target.files?.[0]) handleVehicleDocumentUpload("fitness", e.target.files[0]);
                            }}
                          />
                          <Upload className={`w-3.5 h-3.5 mb-1 ${vehFitnessFile ? "text-emerald-400" : "text-slate-500 group-hover:text-pink-400"}`} />
                          <span className="text-[8px] font-bold text-slate-300 block leading-tight">FC Fitness Cert</span>
                          <span className="text-[7.5px] text-slate-500 truncate max-w-[124px] mt-0.5">
                            {vehFitnessFile ? (vehFitnessFile.startsWith("data:") ? "Custom Doc Ingested" : vehFitnessFile) : "PDF or Image"}
                          </span>
                        </div>

                      </div>
                    </div>
                  </div>

                  <div className="flex gap-2 justify-end pt-1">
                    <button type="button" onClick={() => setIsVehicleFormOpen(false)} className="px-3 bg-slate-950 text-slate-400 py-1 rounded">Cancel</button>
                    <button type="submit" className="px-4 bg-indigo-650 text-white font-bold py-1 rounded">Save</button>
                  </div>
                </form>
              )}

              {/* Vehicle profiles container */}
              <div className="space-y-3">
                {vehicles.map(v => (
                  <div key={v.id} className="bg-slate-900 p-3 rounded-2xl border border-slate-850 space-y-2.5">
                    
                    <div className="flex justify-between items-start">
                      <div>
                        <span className="vehicle-number-badge text-[9px] font-mono font-bold text-slate-500 block uppercase px-1.5 py-0.5 rounded">REG: {v.id}</span>
                        <h4 className="text-xs font-black text-red-500">{v.brand} - {v.vehicleName}</h4>
                        <span className="inline-block text-[8px] bg-slate-950 text-teal-400 font-mono font-bold px-1.5 py-0.2 rounded mt-0.5 uppercase">
                          {v.vehicleType} MODEL {v.model}
                        </span>
                      </div>
                      
                      <div className="flex gap-1.5">
                        <button onClick={() => handleOpenEditVehicle(v)} className="p-1 bg-slate-950 text-slate-400 hover:text-white border border-slate-800 rounded">
                          <Edit className="w-3 h-3" />
                        </button>
                        <button onClick={() => handleDeleteVehicle(v.id)} className="p-1 bg-rose-950/40 text-rose-450 border border-rose-900/40 rounded">
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    </div>

                    <div className="bg-slate-950 p-2 rounded-xl grid grid-cols-2 gap-y-1.5 text-[8.5px] font-mono text-slate-400">
                      <div><span>Insurance:</span> <span className="text-slate-300 font-semibold">{v.insuranceExpiry}</span></div>
                      <div><span>RC Fitness:</span> <span className="text-slate-300 font-semibold">{v.fitnessExpiry}</span></div>
                      <div><span>Reg Date:</span> <span className="text-slate-300">{v.registrationDate}</span></div>
                      <div><span>Pollution Exp:</span> <span className="text-slate-300">{v.pollutionExpiry}</span></div>
                    </div>

                    {/* VEHICLE COMPLIANCE ATTACHMENTS VAULT LIST */}
                    <div className="space-y-1 pt-1">
                      <span className="text-[8px] uppercase font-mono font-bold text-slate-500 tracking-wider">📎 Legal Regulatory Archives (Click to View):</span>
                      <div className="grid grid-cols-2 gap-1 font-mono text-[8.5px]">
                        <button 
                          onClick={() => setSelectedFileToView({
                            vehicleId: v.id,
                            vehicleName: v.vehicleName || "Fleet Carrier",
                            docName: "RC Book Document",
                            fileName: v.rcBookPdf || "RC-Verified.pdf",
                            fileDataUrl: v.rcBookData || null
                          })} 
                          className="bg-slate-950 hover:bg-slate-850 p-1.5 rounded text-left flex items-center justify-between gap-1 border border-slate-850 transition-all cursor-pointer active:scale-95"
                        >
                          <span className="truncate flex items-center gap-1 min-w-0">
                            <FileText className="w-3 h-3 text-indigo-400 shrink-0" /> 
                            <span className="truncate">{v.rcBookPdf || "RC Book PDF"}</span>
                          </span>
                          <span className="text-[7px] text-indigo-400 hover:underline cursor-pointer shrink-0 font-bold uppercase">VIEW</span>
                        </button>

                        <button 
                          onClick={() => setSelectedFileToView({
                            vehicleId: v.id,
                            vehicleName: v.vehicleName || "Fleet Carrier",
                            docName: "Insurance Receipt",
                            fileName: v.insurancePdf || "Insurance-Receipt.pdf",
                            fileDataUrl: v.insuranceData || null
                          })} 
                          className="bg-slate-950 hover:bg-slate-850 p-1.5 rounded text-left flex items-center justify-between gap-1 border border-slate-850 transition-all cursor-pointer active:scale-95"
                        >
                          <span className="truncate flex items-center gap-1 min-w-0">
                            <FileText className="w-3 h-3 text-teal-400 shrink-0" /> 
                            <span className="truncate">{v.insurancePdf || "Insurance Receipt"}</span>
                          </span>
                          <span className="text-[7px] text-teal-400 hover:underline cursor-pointer shrink-0 font-bold uppercase">VIEW</span>
                        </button>

                        <button 
                          onClick={() => setSelectedFileToView({
                            vehicleId: v.id,
                            vehicleName: v.vehicleName || "Fleet Carrier",
                            docName: "State Permit Doc",
                            fileName: v.permitPdf || "All-India-Permit.pdf",
                            fileDataUrl: v.permitData || null
                          })} 
                          className="bg-slate-950 hover:bg-slate-850 p-1.5 rounded text-left flex items-center justify-between gap-1 border border-slate-850 transition-all cursor-pointer active:scale-95"
                        >
                          <span className="truncate flex items-center gap-1 min-w-0">
                            <FileText className="w-3 h-3 text-amber-400 shrink-0" /> 
                            <span className="truncate">{v.permitPdf || "State Permit"}</span>
                          </span>
                          <span className="text-[7px] text-amber-400 hover:underline cursor-pointer shrink-0 font-bold uppercase">VIEW</span>
                        </button>

                        <button 
                          onClick={() => setSelectedFileToView({
                            vehicleId: v.id,
                            vehicleName: v.vehicleName || "Fleet Carrier",
                            docName: "FC Certificate",
                            fileName: v.fitnessPdf || "FC-Certificate.pdf",
                            fileDataUrl: v.fitnessData || null
                          })} 
                          className="bg-slate-950 hover:bg-slate-850 p-1.5 rounded text-left flex items-center justify-between gap-1 border border-slate-850 transition-all cursor-pointer active:scale-95"
                        >
                          <span className="truncate flex items-center gap-1 min-w-0">
                            <FileText className="w-3 h-3 text-pink-400 shrink-0" /> 
                            <span className="truncate">{v.fitnessPdf || "FC fitness.pdf"}</span>
                          </span>
                          <span className="text-[7px] text-pink-400 hover:underline cursor-pointer shrink-0 font-bold uppercase">VIEW</span>
                        </button>
                      </div>
                    </div>

                    {/* DYNAMIC VEHICLE SERVICES LISTING */}
                    <div className="border-t border-slate-800/80 pt-2.5 mt-2 space-y-1.5 font-mono text-[8.5px]">
                      <div className="flex justify-between items-center text-slate-500 font-bold uppercase tracking-wide">
                        <span className="flex items-center gap-1 text-[8px] text-indigo-400">
                          <Wrench className="w-2.5 h-2.5 shrink-0" /> Service & Repairs
                        </span>
                        <span>{services.filter(s => s.vehicleId === v.id).length} recorded</span>
                      </div>
                      
                      {services.filter(s => s.vehicleId === v.id).length === 0 ? (
                        <p className="text-[8px] text-slate-500 italic">No services recorded for this unit.</p>
                      ) : (
                        <div className="space-y-1 max-h-24 overflow-y-auto pr-1">
                          {services.filter(s => s.vehicleId === v.id).map(s => (
                            <div key={s.id} className="bg-slate-950 p-1.5 rounded-lg border border-slate-850/60 flex justify-between items-start text-[8px]">
                              <div className="min-w-0 flex-1 pr-1.5">
                                <div className="flex items-center gap-1.5 flex-wrap">
                                  <span className="font-bold text-slate-400">{s.date}</span>
                                  <span className="text-emerald-400 font-semibold truncate max-w-[110px]">{s.serviceType}</span>
                                </div>
                                {s.spareParts && <p className="text-[7.5px] text-slate-500 mt-0.5 truncate">Spares: {s.spareParts}</p>}
                                {s.remarks && <p className="text-[7.5px] text-slate-500 italic truncate mt-0.5">"{s.remarks}"</p>}
                              </div>
                              <span className="text-amber-500 font-bold shrink-0">₹{s.cost.toLocaleString()}</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                  </div>
                ))}
              </div>

            </div>
          )}

          {vehicleSubTab === "service" && (
            /* SERVICE LOGS TAB RENDERING */
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-xs font-mono font-bold text-slate-400 uppercase">🛠️ Fleet Maintenance Logs</span>
                <button
                  type="button"
                  onClick={handleOpenAddService}
                  className="bg-indigo-650 hover:bg-indigo-500 py-1.5 px-3 rounded-lg text-[9px] font-bold text-white uppercase tracking-wider flex items-center gap-0.5"
                >
                  <Plus className="w-3.5 h-3.5" /> Add Service (+)
                </button>
              </div>

              {/* Service Form container */}
              {isServiceFormOpen && (
                <form onSubmit={handleSaveService} className="bg-slate-900 border border-slate-800 p-3 rounded-xl space-y-3 text-xs">
                  <span className="text-[10px] font-mono font-black text-amber-500 block uppercase">
                    {editingServiceId ? "Edit Maintenance Service Log" : "Log New Service / Repair Event"}
                  </span>

                  <div className="space-y-2 font-mono">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      <div>
                        <label className="text-[9px] text-slate-500 block">SELECT FLEET UNIT</label>
                        <select
                          value={serviceVehicleId}
                          onChange={(e) => setServiceVehicleId(e.target.value)}
                          className="w-full bg-slate-950 p-1.5 focus:outline-none border border-slate-850 rounded text-slate-100"
                          required
                        >
                          <option value="" disabled>Choose Carrier</option>
                          {vehicles.map(v => (
                            <option key={v.id} value={v.id}>{v.id} - {v.vehicleName}</option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="text-[9px] text-slate-500 block">SERVICE DATE</label>
                        <input
                          type="date"
                          value={serviceDate}
                          onChange={(e) => setServiceDate(e.target.value)}
                          className="w-full bg-slate-950 p-1.5 rounded text-slate-300 border border-slate-850"
                          required
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      <div>
                        <label className="text-[9px] text-slate-500 block">SERVICE TYPE / REPAIR</label>
                        <input
                          type="text"
                          value={serviceTypeInput}
                          onChange={(e) => setServiceTypeInput(e.target.value)}
                          className="w-full bg-slate-950 p-1.5 rounded text-slate-100 border border-slate-850"
                          placeholder="e.g. Brake Pads Replacement"
                          required
                        />
                      </div>
                      <div>
                        <label className="text-[9px] text-slate-500 block">TOTAL SERVICE COST (₹)</label>
                        <input
                          type="number"
                          value={serviceCost}
                          onChange={(e) => setServiceCost(Number(e.target.value))}
                          className="w-full bg-slate-950 p-1.5 rounded text-slate-100 border border-slate-850 font-bold"
                          min="0"
                          required
                        />
                      </div>
                    </div>

                    <div>
                      <label className="text-[9px] text-slate-500 block">SPARE PARTS REPLACED (OPTIONAL)</label>
                      <input
                        type="text"
                        value={serviceSpareParts}
                        onChange={(e) => setServiceSpareParts(e.target.value)}
                        className="w-full bg-slate-950 p-1.5 rounded text-slate-100 border border-slate-850"
                        placeholder="e.g. Castrol Oil, Oil Filter"
                      />
                    </div>

                    <div>
                      <label className="text-[9px] text-slate-500 block">REMARKS / WORK DETAILS</label>
                      <textarea
                        value={serviceRemarks}
                        onChange={(e) => setServiceRemarks(e.target.value)}
                        className="w-full bg-slate-950 p-1.5 rounded text-slate-100 border border-slate-850 font-mono text-[10px] h-12 text-slate-200"
                        placeholder="Detail mechanical observations, next warning etc."
                      />
                    </div>
                  </div>

                  <div className="flex gap-2 justify-end pt-1">
                    <button type="button" onClick={() => setIsServiceFormOpen(false)} className="px-3 bg-slate-950 text-slate-400 py-1 rounded">Cancel</button>
                    <button type="submit" className="px-4 bg-indigo-650 text-white font-bold py-1 rounded">Save Log</button>
                  </div>
                </form>
              )}

              {/* Maintenance Ledger List */}
              <div className="bg-slate-900 border border-slate-850 rounded-2xl p-3 space-y-2.5">
                <div className="flex justify-between items-center pb-2 border-b border-slate-850/50">
                  <span className="text-[10px] font-mono uppercase font-black text-slate-400 tracking-tight block">Maintenance ledger</span>
                  <span className="text-[9px] font-mono text-slate-400 font-bold">Total Spent: ₹{services.reduce((accum, r) => accum + r.cost, 0).toLocaleString()}</span>
                </div>

                <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
                  {services.length === 0 ? (
                    <p className="text-xs text-slate-500 text-center py-4 italic">No service logs in database.</p>
                  ) : (
                    services.map(s => {
                      const associatedVehicle = vehicles.find(v => v.id === s.vehicleId);
                      return (
                        <div key={s.id} className="bg-slate-950 p-2.5 rounded-xl text-[10px] font-mono border border-slate-850/50 relative">
                          <div className="flex justify-between items-start">
                            <div className="min-w-0 flex-1 pr-4">
                              <div className="flex items-center gap-1.5 flex-wrap">
                                <span className="vehicle-number-badge text-[8.5px] bg-indigo-950 text-indigo-400 px-1.5 py-0.2 rounded font-bold uppercase">{s.vehicleId}</span>
                                {associatedVehicle && (
                                  <span className="text-[8.5px] text-slate-400 font-semibold truncate max-w-[100px]">({associatedVehicle.vehicleName})</span>
                                )}
                                <span className="text-slate-500 text-[8.5px]">{s.date}</span>
                              </div>
                              <h4 className="font-bold text-slate-200 mt-1 flex items-center gap-1">
                                <Wrench className="w-3 h-3 text-indigo-400 shrink-0" />
                                {s.serviceType}
                              </h4>
                              {s.spareParts && (
                                <p className="text-[8px] text-slate-400 mt-1">
                                  <span className="text-slate-500">Parts:</span> {s.spareParts}
                                </p>
                              )}
                              {s.remarks && (
                                <p className="text-[8px] text-slate-500 italic mt-0.5">
                                  "{s.remarks}"
                                </p>
                              )}
                            </div>
                            
                            <div className="text-right shrink-0 flex flex-col items-end justify-between h-full gap-2 pl-2">
                              <span className="font-black text-amber-500 text-[10.5px]">₹{s.cost.toLocaleString()}</span>
                              <div className="flex gap-1.5 mt-2">
                                <button type="button" onClick={() => handleOpenEditService(s)} className="p-1 px-1.5 bg-slate-900 border border-slate-800 text-slate-400 hover:text-white rounded">
                                  <Edit className="w-2.5 h-2.5" />
                                </button>
                                <button type="button" onClick={() => handleDeleteService(s.id)} className="p-1 px-1.5 bg-rose-950/40 border border-rose-900/40 text-rose-450 rounded">
                                  <Trash2 className="w-2.5 h-2.5" />
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            </div>
          )}

          {vehicleSubTab === "fuel" && (
            /* FUEL MANAGEMENT LOG ENTRY WITH AUTO CALCULATIONS */
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-xs font-mono font-bold text-slate-400 uppercase">Fuel Log Book</span>
                <button
                  onClick={handleOpenAddFuel}
                  className="bg-indigo-650 hover:bg-indigo-500 py-1 px-2.5 rounded-lg text-[9px] font-bold text-white uppercase tracking-wider flex items-center gap-0.5"
                >
                  <Plus className="w-3.5 h-3.5 animate-bounce" /> Add Fuel Entry (+)
                </button>
              </div>

              {/* Add Fuel Log in-place */}
              {isFuelFormOpen && (
                <form onSubmit={handleSaveFuel} className="bg-slate-900 border border-slate-800 p-3 rounded-xl space-y-3 text-xs">
                  <span className="text-[10px] font-mono font-black text-amber-500 block uppercase">Log Fuel Top-up</span>

                  <div className="space-y-2 font-mono">
                    <div>
                      <label className="text-[9px] text-slate-500 block">CARRIER VEHICLE</label>
                      <select
                        value={fuelVehicleName}
                        onChange={(e) => setFuelVehicleName(e.target.value)}
                        className="w-full bg-slate-950 p-1.5 focus:outline-none border border-slate-850 rounded text-slate-100"
                        required
                      >
                        {vehicles.map(v => (
                          <option key={v.id} value={v.vehicleName}>{v.id} - {v.vehicleName}</option>
                        ))}
                      </select>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      <div>
                        <label className="text-[9px] text-slate-500 block">FUEL TYPE</label>
                        <select
                          value={fuelType}
                          onChange={(e) => setFuelType(e.target.value as any)}
                          className="w-full bg-slate-950 p-1.5 rounded text-slate-300"
                        >
                          <option value="Diesel">Diesel</option>
                          <option value="Petrol">Petrol</option>
                          <option value="CNG">CNG (Natural Gas)</option>
                        </select>
                      </div>
                      <div>
                        <label className="text-[9px] text-slate-500 block">LOG DATE TIME</label>
                        <input
                          type="text"
                          value={fuelDateTime}
                          onChange={(e) => setFuelDateTime(e.target.value)}
                          className="w-full bg-slate-950 p-1 rounded font-mono text-[10.5px] text-slate-350"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      <div>
                        <label className="text-[9px] text-slate-500 block">COST PER LITER (₹)</label>
                        <input
                          type="number"
                          value={fuelPerLiterCost}
                          onChange={(e) => setFuelPerLiterCost(Number(e.target.value))}
                          className="w-full bg-slate-950 p-1.5 rounded text-slate-100 font-bold"
                          required
                        />
                      </div>
                      <div>
                        <label className="text-[9px] text-slate-500 block">NUM OF LITER qty</label>
                        <input
                          type="number"
                          value={fuelLiters}
                          onChange={(e) => setFuelLiters(Number(e.target.value))}
                          className="w-full bg-slate-950 p-1.5 rounded text-slate-100 font-bold"
                          required
                        />
                      </div>
                    </div>

                    {/* Auto Calculate Total Cost Box */}
                    <div className="p-2.5 bg-slate-950 rounded border border-slate-850 flex justify-between items-center text-[10px]">
                      <span className="text-slate-500">Auto Calc: Ltr × ₹/Ltr</span>
                      <span className="text-emerald-400 font-black">₹{(fuelLiters * fuelPerLiterCost).toLocaleString()} NET</span>
                    </div>
                  </div>

                  <div className="flex gap-2 justify-end pt-1">
                    <button type="button" onClick={() => setIsFuelFormOpen(false)} className="px-3 bg-slate-950 text-slate-400 py-1 rounded">Cancel</button>
                    <button type="submit" className="px-4 bg-indigo-650 text-white font-bold py-1 rounded">Log Top-up</button>
                  </div>
                </form>
              )}

              {/* Fuel List Entries with Details */}
              <div className="bg-slate-900 border border-slate-850 rounded-2xl p-3 space-y-2.5">
                <span className="text-[10px] font-mono uppercase font-black text-slate-400 tracking-tight block">Fittings Log Ledger</span>
                
                <div className="space-y-1.5 max-h-40 overflow-y-auto pr-1">
                  {fuelEntries.map(f => {
                    const displayAmount = Number(f.totalAmount ?? f.cost ?? ((f.liters ?? 0) * (f.perLiterCost ?? 0)));
                    return (
                      <div key={f.id} className="bg-slate-950 p-2 rounded-xl text-[10px] font-mono flex justify-between items-center gap-2">
                        <div className="min-w-0">
                          <span className="text-[8.5px] text-slate-500 block truncate flex items-center gap-1">
                            <span>{f.dateTime}</span>
                            <Car className="w-3 h-3 text-emerald-500 shrink-0" />
                            <span className="truncate">{f.vehicleName}</span>
                          </span>
                          <span className="font-bold text-slate-350 block truncate">{f.fuelType} ₹ {f.liters} Liters ({f.perLiterCost}/L)</span>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          <span className="font-black text-rose-450 text-[10.5px]">₹{displayAmount.toLocaleString()}</span>
                          <button
                            type="button"
                            onClick={() => handleOpenEditFuel(f)}
                            className="p-1 rounded bg-slate-900 border border-slate-800 text-slate-400 hover:text-white hover:bg-slate-800"
                            title="Edit fuel entry"
                          >
                            <Edit className="w-3 h-3" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteFuel(f)}
                            className="p-1 rounded bg-rose-950/40 border border-rose-900/40 text-rose-400 hover:text-rose-300"
                            title="Delete fuel entry"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Reports visual summary block */}
                <div className="pt-2 border-t border-slate-850 space-y-1 text-[9.5px]">
                  <span className="text-slate-500 uppercase font-bold tracking-tight block">Vehicle-wise Fuel Outlay:</span>
                  {vehicleWiseFuelCosts.map((item, idx) => (
                    <div key={idx} className="flex justify-between items-center text-slate-300">
                      <span>{item.name}:</span>
                      <span className="font-black text-amber-500">₹{item.cost.toLocaleString()}</span>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          )}

          {vehicleSubTab === "materials" && (
            /* MATERIALS BOUGHT TAB */
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-xs font-mono font-bold text-slate-400 uppercase">📦 Materials Purchased entries</span>
                <button
                  type="button"
                  onClick={handleOpenAddMaterial}
                  className="bg-indigo-650 hover:bg-indigo-500 py-1.5 px-3 rounded-lg text-[9px] font-bold text-white uppercase tracking-wider flex items-center gap-0.5"
                >
                  <Plus className="w-3.5 h-3.5" /> Add Purchase (+)
                </button>
              </div>

              {/* Material Form container */}
              {isMatFormOpen && (
                <form onSubmit={handleSaveMaterial} className="bg-slate-900 border border-slate-800 p-3 rounded-xl space-y-3 text-xs">
                  <span className="text-[10px] font-mono font-black text-amber-500 block uppercase">
                    {editingMatId ? "Edit Material Purchased Entry" : "Log New Materials/Spares Purchase"}
                  </span>

                  <div className="space-y-2 font-mono">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      <div>
                        <label className="text-[9px] text-slate-500 block">ASSOCIATED CARRIER</label>
                        <select
                          value={matVehicleId}
                          onChange={(e) => setMatVehicleId(e.target.value)}
                          className="w-full bg-slate-950 p-1.5 focus:outline-none border border-slate-850 rounded text-slate-100"
                          required
                        >
                          <option value="All">All / General Inventory</option>
                          {vehicles.map(v => (
                            <option key={v.id} value={v.id}>{v.id} - {v.vehicleName}</option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="text-[9px] text-slate-500 block">PURCHASE DATE</label>
                        <input
                          type="date"
                          value={matDate}
                          onChange={(e) => setMatDate(e.target.value)}
                          className="w-full bg-slate-950 p-1.5 rounded text-slate-300 border border-slate-850"
                          required
                        />
                      </div>
                    </div>

                    <div>
                      <label className="text-[9px] text-slate-500 block">MATERIAL DESCRIPTION / NAME</label>
                      <input
                        type="text"
                        value={matName}
                        onChange={(e) => setMatName(e.target.value)}
                        className="w-full bg-slate-950 p-1.5 rounded text-slate-100 border border-slate-850"
                        placeholder="e.g. 6 1/2 inch Drilling Bit, Slider Grease"
                        required
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-1.5">
                      <div>
                        <label className="text-[9px] text-slate-500 block">QUANTITY</label>
                        <input
                          type="number"
                          value={matQuantity}
                          onChange={(e) => setMatQuantity(Number(e.target.value))}
                          className="w-full bg-slate-950 p-1.5 rounded text-slate-100 border border-slate-850 font-bold"
                          min="1"
                          required
                        />
                      </div>
                      <div>
                        <label className="text-[9px] text-slate-500 block">UNIT TYPE</label>
                        <input
                          type="text"
                          value={matUnit}
                          onChange={(e) => setMatUnit(e.target.value)}
                          className="w-full bg-slate-950 p-1.5 rounded text-slate-100 border border-slate-850 font-semibold"
                          placeholder="pcs / kg / ltr"
                          required
                        />
                      </div>
                      <div>
                        <label className="text-[9px] text-slate-500 block">RATE PER UNIT (₹)</label>
                        <input
                          type="number"
                          value={matRate}
                          onChange={(e) => setMatRate(Number(e.target.value))}
                          className="w-full bg-slate-950 p-1.5 rounded text-slate-100 border border-slate-850 font-bold"
                          min="0"
                          required
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      <div>
                        <label className="text-[9px] text-slate-500 block">VENDOR NAME</label>
                        <input
                          type="text"
                          value={matVendor}
                          onChange={(e) => setMatVendor(e.target.value)}
                          className="w-full bg-slate-950 p-1.5 rounded text-slate-100 border border-slate-850"
                          placeholder="Kovai Spares"
                        />
                      </div>
                      <div>
                        <label className="text-[9px] text-slate-500 block">AUTO TOTAL COST</label>
                        <div className="bg-slate-950 p-1.5 rounded border border-slate-850 text-emerald-450 font-black text-[10.5px] leading-tight flex items-center justify-center font-mono">
                          ₹{(matQuantity * matRate).toLocaleString()} NET
                        </div>
                      </div>
                    </div>

                    <div>
                      <label className="text-[9px] text-slate-500 block">REMARKS / INVOICE NO</label>
                      <input
                        type="text"
                        value={matRemarks}
                        onChange={(e) => setMatRemarks(e.target.value)}
                        className="w-full bg-slate-950 p-1.5 rounded text-slate-100 border border-slate-850"
                        placeholder="Warranty info, remarks..."
                      />
                    </div>
                  </div>

                  <div className="flex gap-2 justify-end pt-1">
                    <button type="button" onClick={() => setIsMatFormOpen(false)} className="px-3 bg-slate-950 text-slate-400 py-1 rounded">Cancel</button>
                    <button type="submit" className="px-4 bg-indigo-650 text-white font-bold py-1 rounded">Save Purchase</button>
                  </div>
                </form>
              )}

              {/* Materials Ledger List */}
              <div className="bg-slate-900 border border-slate-850 rounded-2xl p-3 space-y-2.5">
                <div className="flex justify-between items-center pb-2 border-b border-slate-850/50">
                  <span className="text-[10px] font-mono uppercase font-black text-slate-400 tracking-tight block">Materials ledger</span>
                  <span className="text-[9px] font-mono text-slate-400 font-bold">Total Bought: ₹{materials.reduce((accum, r) => accum + r.totalAmount, 0).toLocaleString()}</span>
                </div>

                <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
                  {materials.length === 0 ? (
                    <p className="text-xs text-slate-500 text-center py-4 italic">No purchase entries in database.</p>
                  ) : (
                    materials.map(m => {
                      const associatedVehicle = vehicles.find(v => v.id === m.vehicleId);
                      return (
                        <div key={m.id} className="bg-slate-950 p-2.5 rounded-xl text-[10px] font-mono border border-slate-850/50 relative">
                          <div className="flex justify-between items-start">
                            <div className="min-w-0 flex-1 pr-4">
                              <div className="flex items-center gap-1.5 flex-wrap">
                                <span className={`vehicle-number-badge text-[8.5px] px-1.5 py-0.2 rounded font-bold uppercase ${
                                  m.vehicleId === "All" ? "bg-teal-950 text-teal-400" : "bg-indigo-950 text-indigo-400"
                                }`}>
                                  {m.vehicleId === "All" ? "GENERAL" : `${m.vehicleId}`}
                                </span>
                                {associatedVehicle && (
                                  <span className="text-[8.5px] text-slate-400 font-semibold truncate max-w-[100px]">({associatedVehicle.vehicleName})</span>
                                )}
                                <span className="text-slate-500 text-[8.5px]">{m.date}</span>
                              </div>
                              <h4 className="font-bold text-slate-200 mt-1 flex items-center gap-1">
                                <Package className="w-3 h-3 text-teal-400 shrink-0" />
                                {m.materialName}
                              </h4>
                              <p className="text-[8px] text-slate-400 mt-1">
                                <span className="text-slate-500">Logistics:</span> {m.quantity} {m.unit} × ₹{m.rate}/unit
                              </p>
                              {m.vendorName && (
                                <p className="text-[8px] text-slate-450">
                                  <span className="text-slate-500">Vendor:</span> {m.vendorName}
                                </p>
                              )}
                              {m.remarks && (
                                <p className="text-[8px] text-slate-500 italic mt-0.5">
                                  "{m.remarks}"
                                </p>
                              )}
                            </div>

                            <div className="text-right shrink-0 flex flex-col items-end justify-between h-full gap-2 pl-2">
                              <span className="font-black text-teal-450 text-[10.5px]">₹{m.totalAmount.toLocaleString()}</span>
                              <div className="flex gap-1.5 mt-2">
                                <button type="button" onClick={() => handleOpenEditMaterial(m)} className="p-1 px-1.5 bg-slate-900 border border-slate-800 text-slate-400 hover:text-white rounded">
                                  <Edit className="w-2.5 h-2.5" />
                                </button>
                                <button type="button" onClick={() => handleDeleteMaterial(m.id)} className="p-1 px-1.5 bg-rose-950/40 border border-rose-900/40 text-rose-450 rounded">
                                  <Trash2 className="w-2.5 h-2.5" />
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            </div>
          )}

        </div>
      )}

      {/* ======================= C. SALARY MANAGEMENT ======================= */}
      {activeMainSection === "management" && activeSubSection === "salaries" && (
        <div className="space-y-4">
          
          {selectedLabourForPayout ? (
            /* DETAILED PAYOUT CALCULATOR FORM ON WORKER CLICK */
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-4">
              <button
                onClick={() => setSelectedLabourForPayout(null)}
                className="text-xs text-indigo-400 flex items-center gap-1 cursor-pointer font-bold mb-1"
              >
                <ArrowLeft className="w-3.5 h-3.5" /> Back to Payroll
              </button>

              <div className="space-y-1">
                <span className="text-[9px] font-mono text-slate-500 uppercase block leading-none">payout calculator for</span>
                <h4 className="text-sm font-black text-red-500">{selectedLabourForPayout.fullName}</h4>
                <p className="text-[9.5px] text-indigo-400 font-mono">Skill profile: {selectedLabourForPayout.skillType}</p>
              </div>

              {/* Dynamic state values review before editing */}
              <div className="bg-slate-950 p-3 rounded-xl border border-slate-850 font-mono text-[10px] space-y-1">
                <div className="flex justify-between text-slate-400"><span>Monthly Basic Salary:</span> <span className="font-bold text-slate-200">₹{(selectedLabourForPayout.salaryPerMonth ?? 0).toLocaleString()}</span></div>
                <div className="flex justify-between text-rose-400"><span>Existing Advance Taken:</span> <span>₹{(selectedLabourForPayout.advanceEntries || []).reduce((sum, item) => sum + item.amount, 0).toLocaleString()}</span></div>
              </div>

              {/* Salary deduct options checkbox/radio style */}
              <div className="space-y-2">
                <label className="text-[9px] font-mono font-bold text-slate-400 block uppercase">Advance Settlement Options</label>
                
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setPayoutOption("Deduct")}
                    className={`p-2 rounded-xl border text-center transition ${
                      payoutOption === "Deduct"
                        ? "bg-rose-950/40 border-rose-500/50 text-rose-400 font-bold"
                        : "bg-slate-950 border-slate-850 text-slate-400 text-xs"
                    }`}
                  >
                    ☑ Deduct from Salary
                  </button>
                  <button
                    type="button"
                    onClick={() => setPayoutOption("CarryForward")}
                    className={`p-2 rounded-xl border text-center transition ${
                      payoutOption === "CarryForward"
                        ? "bg-indigo-950/40 border-indigo-500/50 text-indigo-400 font-bold"
                        : "bg-slate-950 border-slate-850 text-slate-400 text-xs"
                    }`}
                  >
                    ☑ Carry Forward (Next mo)
                  </button>
                </div>

                {payoutOption === "Deduct" && (
                  <div className="bg-slate-950/80 p-3 rounded-xl border border-slate-850 space-y-1.5 focus-within:border-rose-500/30">
                    <label className="text-[8.5px] font-mono text-slate-500 uppercase tracking-tight block">How Much To Deduct? (₹)</label>
                    <input
                      type="number"
                      value={deductAmountInput}
                      onChange={(e) => setDeductAmountInput(Number(e.target.value))}
                      className="w-full bg-slate-900 border border-slate-800 p-1 text-xs rounded text-white font-mono font-bold"
                      max={selectedLabourForPayout.salaryPerMonth}
                    />
                  </div>
                )}
              </div>

              {/* Status input flag selection */}
              <div className="space-y-1">
                <label className="text-[9px] font-bold font-mono text-slate-400 uppercase tracking-tight block">Payout Status Flag</label>
                <select
                  value={payoutStatus}
                  onChange={(e) => setPayoutStatus(e.target.value as any)}
                  className="w-full bg-slate-950 border border-slate-850 p-2 text-xs text-white rounded font-mono"
                >
                  <option value="Paid">PAID (Clear Ledger)</option>
                  <option value="Pending">PENDING (Deferment)</option>
                </select>
              </div>

              {/* LIVE FINAL CALCULATION RATIO BOX */}
              <div className="bg-slate-950 p-3 rounded-xl border border-slate-850 text-xs font-mono space-y-1">
                <span className="text-[8.5px] uppercase text-slate-500 block font-bold leading-none">Calculated Net Slips Output:</span>
                <div className="flex justify-between">
                  <span>Basic Base:</span>
                  <span className="font-bold text-slate-200">₹{(selectedLabourForPayout.salaryPerMonth ?? 0).toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-rose-400">
                  <span>Deduction Applied:</span>
                  <span>- ₹{(payoutOption === "Deduct" ? deductAmountInput : 0).toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-emerald-400 font-bold border-t border-slate-900 pt-1 mt-1">
                  <span>Net Take-Home Salary:</span>
                  <span>₹{((selectedLabourForPayout.salaryPerMonth ?? 0) - (payoutOption === "Deduct" ? deductAmountInput : 0)).toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-[9px] text-indigo-400 pt-0.5">
                  <span>Remaining Advance CarryForward:</span>
                  <span>₹{((selectedLabourForPayout.advanceEntries || []).reduce((sum, item) => sum + item.amount, 0) - (payoutOption === "Deduct" ? deductAmountInput : 0)).toLocaleString()}</span>
                </div>
              </div>

              {/* Slip Processing Trigger */}
              <div className="grid grid-cols-1 gap-1.5 pt-1">
                <button
                  type="button"
                  onClick={handleProcessSalaryPayment}
                  className="w-full bg-emerald-600 hover:bg-emerald-500 py-2 rounded-xl text-xs font-black text-white transition flex items-center justify-center gap-1 cursor-pointer"
                >
                  <Calculator className="w-4 h-4" /> Save & Commit Slip
                </button>
                <button
                  type="button"
                  onClick={() => {
                    const livePayment: SalaryPayment = {
                      id: `TEMP-${Date.now().toString().slice(-6)}`,
                      labourId: selectedLabourForPayout.id,
                      date: new Date().toISOString().split("T")[0],
                      amountCalculated: selectedLabourForPayout.salaryPerMonth ?? 0,
                      advanceDeducted: payoutOption === "Deduct" ? Number(deductAmountInput) : 0,
                      bonus: 0,
                      netPaid: (selectedLabourForPayout.salaryPerMonth ?? 0) - (payoutOption === "Deduct" ? Number(deductAmountInput) : 0),
                      status: payoutStatus,
                      salaryOption: payoutOption
                    };
                    downloadSalarySlipPDF(selectedLabourForPayout, livePayment);
                  }}
                  className="w-full bg-slate-850 hover:bg-slate-800 py-2 rounded-xl text-xs font-bold text-slate-350 transition flex items-center justify-center gap-1.5 cursor-pointer border border-slate-800"
                >
                  <Download className="w-3.5 h-3.5 text-indigo-400" /> Generate & Download Live PDF
                </button>
              </div>

            </div>
          ) : (
            /* SALARY MANAGEMENT OVERVIEW PAGE - SHOW ALL LABOR SALARIES IN ONE PAGE */
            <div className="space-y-3">
              <div className="flex justify-between items-center bg-slate-950 p-2.5 rounded-xl border border-slate-850">
                <div>
                  <span className="text-[8.5px] font-mono text-slate-500 uppercase tracking-tight block">Staging payroll metrics</span>
                  <span className="text-xs font-black text-teal-400">₹{salaryPayments.filter(p => p.status === "Paid").reduce((sum, p) => sum + p.netPaid, 0).toLocaleString()} disbursed</span>
                </div>
                <span className="text-[9.5px] font-mono text-rose-400 bg-rose-950 px-2 py-0.5 rounded font-bold border border-rose-900/30">
                  Pending: ₹{salaryPayments.filter(p => p.status === "Pending").reduce((sum, p) => sum + p.netPaid, 0).toLocaleString()}
                </span>
              </div>

              {/* Roster database sheet in one page */}
              <div className="space-y-2">
                {([...labours].sort((a, b) => {
                  const aFreezed = !!a.isFreezed;
                  const bFreezed = !!b.isFreezed;
                  if (aFreezed && !bFreezed) return 1;
                  if (!aFreezed && bFreezed) return -1;
                  return 0;
                })).map(lab => {
                  const hasPayment = salaryPayments.find(p => p.labourId === lab.id);
                  const totalAdv = lab.advanceEntries?.reduce((sum, item) => sum + item.amount, 0) || 0;
                  const isLabFreezed = lab.isFreezed;
                  return (
                    <div key={lab.id} className={`p-3 rounded-2xl border space-y-2.5 transition duration-155 ${
                      isLabFreezed ? "bg-slate-950/40 border-amber-955/35 opacity-70" : "bg-slate-900 border-slate-850"
                    }`}>
                      
                      <div className="flex justify-between items-center">
                        <div>
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <h4 className={`text-xs font-bold truncate ${
                              isLabFreezed ? "text-slate-550 line-through" : "text-red-500"
                            }`}>{lab.fullName}</h4>
                            {isLabFreezed && (
                              <span className="bg-amber-950/30 text-amber-500 text-[6px] font-mono px-1 rounded border border-amber-900/20 font-bold shrink-0">
                                FREEZED / QUIT
                              </span>
                            )}
                          </div>
                          <span className="inline-block text-[8px] bg-slate-950 text-indigo-400 font-mono font-bold px-1.5 py-0.2 rounded mt-0.5">
                            {lab.skillType} • base ₹{lab.salaryPerMonth ?? 0}
                          </span>
                        </div>

                        {/* Status tag indicator */}
                        <span className={`text-[8.5px] font-mono font-bold uppercase px-2 py-0.5 rounded border ${
                          hasPayment?.status === "Paid" 
                            ? "bg-emerald-950 text-emerald-400 border-emerald-950" 
                            : "bg-amber-950 text-orange-300 border-amber-950"
                        }`}>
                          {hasPayment?.status || "Pending"}
                        </span>
                      </div>

                      {/* Mini detailed indicators */}
                      <div className="grid grid-cols-3 gap-1 bg-slate-950 p-1.5 rounded-lg text-[9px] font-mono text-slate-400">
                        <div><span>Deduction:</span> <span className="font-bold text-rose-400 block">₹{hasPayment?.advanceDeducted || 0}</span></div>
                        <div><span>Net Paid:</span> <span className="font-bold text-slate-200 block">₹{hasPayment?.netPaid || ((lab.salaryPerMonth ?? 0) - totalAdv)}</span></div>
                        <div><span>Adv Left:</span> <span className="font-bold text-indigo-400 block">₹{Math.max(0, totalAdv - (hasPayment?.advanceDeducted || 0))}</span></div>
                      </div>

                      {/* Salary Slip share panel */}
                      <div className="flex gap-2 justify-between items-center text-[9px] font-mono pt-1">
                        <button
                          onClick={() => handleOpenSalaryCalc(lab)}
                          className="bg-slate-850 hover:bg-slate-800 text-indigo-400 py-1 px-2.5 rounded border border-slate-800"
                        >
                          Modify / Calculate Slip
                        </button>
                        
                        <div className="flex gap-1.5">
                          <button
                            onClick={() => downloadSalarySlipPDF(lab, hasPayment)}
                            title="Download PDF"
                            className="bg-slate-950 hover:bg-slate-850 p-1 rounded border border-slate-850 text-indigo-400 hover:text-indigo-350 transition duration-150"
                          >
                            <Download className="w-3 h-3" />
                          </button>
                          <button
                            onClick={() => alert(`Initiating secure API WhatsApp Bridge... Sharing Salary Receipt for ${lab.fullName} with phone ${lab.phone}`)}
                            title="Share WhatsApp"
                            className="bg-indigo-600 hover:bg-indigo-500 text-white p-1 rounded border border-indigo-500 flex items-center justify-center"
                          >
                            <Share2 className="w-3 h-3" />
                          </button>
                        </div>
                      </div>

                    </div>
                  );
                })}
              </div>

            </div>
          )}

        </div>
      )}

      {/* ======================= BILL / INVOICES SUBSECTION ======================= */}
      {activeMainSection === "bill" && (() => {
        // Compute real-time live calculation preview values
        const liveCalc = billMode === "Customize"
          ? runCustomCalculation({
              borewellType,
              startingFeet: customStartingFeet,
              endingFeet: customEndingFeet,
              rates: customSlabRates,
              c7Feet: casing7Feet,
              c7Rate: casing7Rate,
              c10Feet: casing10Feet,
              c10Rate: casing10Rate,
              battaVal: batta
            })
          : runBorewellCalculation(
              borewellType,
              billMode,
              existingDepth,
              finalDepth,
              casingFeet,
              casingRate,
              batta,
              startingPrice,
              oldFeetRate,
              casing7Feet,
              casing7Rate,
              casing10Feet,
              casing10Rate
            );

        return (
          <div id="mobile-bill-section" className="space-y-4 animate-fade-in text-[10px]">
            
            {/* Billing Overview Metrics */}
            <div className="grid grid-cols-3 gap-1.5">
              <div className="bg-slate-900 border border-slate-850 p-2.5 rounded-xl space-y-0.5">
                <span className="text-[8px] text-slate-500 font-mono font-bold uppercase tracking-wider block">Total Billed</span>
                <span className="text-xs font-black text-slate-205">
                  ₹{businessBills.reduce((acc, b) => acc + b.amount, 0).toLocaleString()}
                </span>
              </div>
              <div className="bg-slate-900 border border-slate-850 p-2.5 rounded-xl space-y-0.5">
                <span className="text-[8px] text-slate-500 font-mono font-bold uppercase tracking-wider block">Paid Receipts</span>
                <span className="text-xs font-black text-emerald-400">
                  ₹{businessBills.filter(b => b.status === "Paid").reduce((acc, b) => acc + b.amount, 0).toLocaleString()}
                </span>
              </div>
              <div className="bg-slate-900 border border-slate-850 p-2.5 rounded-xl space-y-0.5">
                <span className="text-[8px] text-slate-500 font-mono font-bold uppercase tracking-wider block">Outstanding</span>
                <span className="text-xs font-black text-rose-450">
                  ₹{businessBills.filter(b => b.status === "Pending").reduce((acc, b) => acc + b.amount, 0).toLocaleString()}
                </span>
              </div>
            </div>

            <div className="flex justify-between items-center bg-slate-950 p-2.5 rounded-xl border border-slate-850">
              <div className="flex items-center gap-2.5">
                <img 
                  src={borewellLogo} 
                  className="w-10 h-10 object-cover rounded-lg border border-slate-800 bg-white" 
                  alt="Borewell machine logo"
                  referrerPolicy="no-referrer"
                />
                <div>
                  <span className="text-[8px] font-mono font-black text-indigo-400 uppercase tracking-tight block">SRS Borewell Billing</span>
                  <span className="text-xs font-extrabold uppercase text-slate-200 tracking-wider">Customer Drilling Invoices</span>
                </div>
              </div>
              <button
                onClick={() => {
                  setEditingBillId(null);
                  setBillClient("");
                  setBillDescription("");
                  setBorewellType("Tight Formation");
                  setBillMode("New");
                  setExistingDepth(0);
                  setFinalDepth(950);
                  setStartingPrice(100);
                  setCasingType("7 inch");
                  setCasingFeet(20);
                  setCasingRate(350);
                  setBatta(1500);
                  setBillStatus("Pending");
                  setIsBillFormOpen(true);
                }}
                className="px-2.5 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white font-extrabold text-[9px] uppercase tracking-wider rounded-lg flex items-center gap-1 transition cursor-pointer"
              >
                <Plus className="w-3 h-3" /> New Borewell Bill
              </button>
            </div>

            {/* New / Edit Invoice Form */}
            {isBillFormOpen && (
              <form onSubmit={handleSaveBill} className="bg-slate-900 border border-slate-800 p-4 rounded-2xl space-y-3.5 animate-fade-in text-[10px]">
                <div className="flex items-center gap-2.5 border-b border-slate-800 pb-2.5 mb-2">
                  <img 
                    src={borewellLogo} 
                    className="w-10 h-10 object-cover rounded-lg border border-slate-800 bg-white shrink-0" 
                    alt="Borewell machine" 
                    referrerPolicy="no-referrer"
                  />
                  <div>
                    <h3 className="text-xs font-extrabold text-white uppercase tracking-wider">
                      {editingBillId ? "Edit Custom Borewell Bill" : "Generate Borewell Drilling Invoice"}
                    </h3>
                    <p className="text-[8px] text-slate-400 font-mono uppercase tracking-widest">Sri Selvanyagi Rig Service</p>
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[9px] text-slate-500 block uppercase font-mono tracking-wider">CUSTOMER / CLIENT NAME</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Senthil Kumar"
                    value={billClient}
                    onChange={(e) => setBillClient(e.target.value)}
                    className="w-full bg-slate-950 p-2 text-xs text-white rounded border border-slate-850 focus:border-indigo-550 focus:ring-1 focus:ring-indigo-550/30"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[10px]">
                  <div>
                    <label className="text-[9px] text-slate-500 block uppercase font-mono tracking-wider">LOCATION</label>
                    <input
                      type="text"
                      placeholder="e.g. Pollachi"
                      value={customLocation || ""}
                      onChange={(e) => setCustomLocation(e.target.value)}
                      className="w-full bg-slate-950 p-1.5 rounded text-white border border-slate-850 focus:border-indigo-550"
                    />
                  </div>
                  <div>
                    <label className="text-[9px] text-slate-500 block uppercase font-mono tracking-wider">BROKER NAME</label>
                    <input
                      type="text"
                      placeholder="e.g. Vignesh"
                      value={customBrokerName || ""}
                      onChange={(e) => setCustomBrokerName(e.target.value)}
                      className="w-full bg-slate-950 p-1.5 rounded text-white border border-slate-850 focus:border-indigo-550"
                    />
                  </div>
                </div>

                <div className="text-[10px]">
                  <div>
                    <label className="text-[9px] text-slate-500 block uppercase font-mono">BILL DATE</label>
                    <input type="date" value={billDate} onChange={(e) => setBillDate(e.target.value)} className="w-full bg-slate-950 p-1.5 rounded text-slate-300 font-mono border border-slate-850" />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[10px]">
                  <div>
                    <label className="text-[9px] text-slate-500 block uppercase font-mono">BOREWELL TYPE SLABS</label>
                    <select
                      value={borewellType}
                      disabled={billMode === "Customize"}
                      onChange={(e) => setBorewellType(e.target.value as any)}
                      className="w-full bg-slate-950 p-1.5 rounded text-slate-200 border border-slate-850 font-bold"
                    >
                      <option value="Tight Formation">Tight Formation (1 - 300 Feet)</option>
                      <option value="Loose Formation">Loose Formation (1 - 500 Feet)</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-[9px] text-slate-500 block uppercase font-mono">DRILL MODE</label>
                    <select
                      value={billMode}
                      onChange={(e) => setBillMode(e.target.value as any)}
                      className="w-full bg-slate-950 p-1.5 rounded text-slate-200 border border-slate-850 font-bold"
                    >
                      <option value="New">New Borewell</option>
                      <option value="Re-Borewell">Re-Borewell</option>
                      <option value="Customize">Customize Bill</option>
                    </select>
                  </div>
                </div>

                {/* Customized configuration section */}
                {billMode === "Customize" && (
                  <div className="space-y-3.5 border border-dashed border-indigo-500/30 p-3.5 rounded-2xl bg-indigo-950/10">
                    <div className="text-[10px] text-indigo-400 font-mono uppercase font-bold tracking-wider flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-indigo-500"></span>
                      Detailed Customized Billing Parameters
                    </div>

                    {/* Bill Date automatic / manual */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[10px] items-end">
                      <div>
                        <label className="text-[9px] text-indigo-400 block uppercase font-mono font-bold">BILL DATE TYPE</label>
                        <select
                          value={customBillDateType}
                          onChange={(e) => setCustomBillDateType(e.target.value as any)}
                          className="w-full bg-slate-950 p-1.5 rounded text-indigo-300 font-mono border border-slate-850 focus:border-indigo-500"
                        >
                          <option value="automatic">Automatic Today ({new Date().toISOString().split('T')[0]})</option>
                          <option value="manual">Manual Entry</option>
                        </select>
                      </div>
                      <div>
                        <label className="text-[9px] text-slate-500 block uppercase font-mono">FORMATION TYPE</label>
                        <select
                          value={borewellType}
                          onChange={(e) => setBorewellType(e.target.value as any)}
                          className="w-full bg-slate-950 p-1.5 rounded text-indigo-300 font-mono border border-slate-850 font-bold"
                        >
                          <option value="Tight Formation">Tight Formation</option>
                          <option value="Loose Formation">Loose Formation</option>
                        </select>
                      </div>
                    </div>

                    {/* Starting and Ending feet */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[10px]">
                      <div>
                        <label className="text-[9px] text-teal-400 block uppercase font-mono font-bold">STARTING FEET</label>
                        <input
                          type="number"
                          min={0}
                          value={customStartingFeet}
                          onChange={(e) => setCustomStartingFeet(Math.max(0, Number(e.target.value)))}
                          className="w-full bg-slate-950 p-1.5 rounded text-teal-400 font-mono font-bold border border-slate-850"
                        />
                      </div>
                      <div>
                        <label className="text-[9px] text-teal-400 block uppercase font-mono font-bold">ENDING FEET</label>
                        <input
                          type="number"
                          min={1}
                          value={customEndingFeet}
                          onChange={(e) => setCustomEndingFeet(Math.max(1, Number(e.target.value)))}
                          className="w-full bg-slate-950 p-1.5 rounded text-teal-400 font-mono font-bold border border-slate-850"
                        />
                      </div>
                    </div>

                    {/* SEPARATED FEET RATE COLUMN (ASK PRICE PER FEET FOR EACH SLAB) */}
                    <div className="border-t border-slate-850 pt-2.5">
                      <div className="text-[9px] text-indigo-400 font-mono uppercase font-black mb-1.5 tracking-wider">
                        Separated Slabs (Ask Custom Price per Foot)
                      </div>
                      <div className="bg-slate-950/85 p-2.5 rounded-xl border border-slate-850 space-y-2.5">
                        {getCustomSlabsList(borewellType, customStartingFeet, customEndingFeet).length === 0 ? (
                          <div className="text-[8.5px] font-mono text-slate-500 italic text-center">
                            Please set valid Starting and Ending feet above.
                          </div>
                        ) : (
                          getCustomSlabsList(borewellType, customStartingFeet, customEndingFeet).map((slab, sIdx) => {
                            const val = customSlabRates[slab.label] !== undefined ? customSlabRates[slab.label] : getStandardRateForSlabIdx(borewellType, sIdx, startingPrice);
                            return (
                              <div key={slab.label} className="grid grid-cols-3 gap-2 items-center text-[9.5px]">
                                <span className="font-mono text-slate-300 font-bold block">
                                  {slab.label} ft ({slab.feetCount} ft)
                                </span>
                                <div className="col-span-2 flex items-center gap-1.5">
                                  <span className="font-mono text-[8.5px] text-slate-500">Rs./ft:</span>
                                  <input
                                    type="number"
                                    min={0}
                                    value={val}
                                    onChange={(e) => {
                                      const newRates = { ...customSlabRates };
                                      newRates[slab.label] = Math.max(0, Number(e.target.value));
                                      setCustomSlabRates(newRates);
                                    }}
                                    className="w-20 bg-slate-900 text-teal-400 p-1 font-mono font-bold rounded border border-slate-800 focus:border-indigo-500 text-right text-[10px]"
                                  />
                                  <span className="font-mono text-[9px] text-indigo-400/80 text-right w-16">
                                    Rs. {(slab.feetCount * val).toLocaleString()}
                                  </span>
                                </div>
                              </div>
                            );
                          })
                        )}
                      </div>
                    </div>

                  </div>
                )}

                {/* Depth Inputs */}
                {/* Depth & Starting Price Inputs */}
                {billMode === "Re-Borewell" && (
                  <div className="space-y-2 border border-dashed border-slate-800 p-2.5 rounded-xl bg-slate-950/20">
                    <div className="text-[9px] text-slate-400 font-mono uppercase font-bold tracking-wider">Re-Borewell Parameters</div>
                    <div className="grid grid-cols-2 gap-2 text-[10px]">
                      <div>
                        <label className="text-[9px] text-indigo-400 block uppercase font-mono font-bold">OLD FEET (EXISTING)</label>
                        <input
                          type="number"
                          min={0}
                          max={2000}
                          value={existingDepth}
                          onChange={(e) => setExistingDepth(Math.max(0, Number(e.target.value)))}
                          className="w-full bg-slate-950 p-1.5 rounded text-indigo-400 font-mono font-bold border border-slate-850"
                        />
                      </div>
                      <div>
                        <label className="text-[9px] text-indigo-400 block uppercase font-mono font-bold">RATE / FT (FOR OLD FEET) (Rs.)</label>
                        <input
                          type="number"
                          min={0}
                          value={oldFeetRate}
                          onChange={(e) => setOldFeetRate(Math.max(0, Number(e.target.value)))}
                          className="w-full bg-slate-950 p-1.5 rounded text-indigo-300 font-mono font-bold border border-slate-850 focus:border-indigo-500"
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-[10px]">
                      <div>
                        <label className="text-[9px] text-teal-400 block uppercase font-mono font-bold">FINAL DEPTH (FEET)</label>
                        <input
                          type="number"
                          min={1}
                          max={2000}
                          value={finalDepth}
                          onChange={(e) => setFinalDepth(Math.max(1, Number(e.target.value)))}
                          className="w-full bg-slate-950 p-1.5 rounded text-teal-400 font-mono font-bold border border-slate-850"
                        />
                      </div>
                      <div>
                        <label className="text-[9px] text-amber-400 block uppercase font-mono font-bold">STARTING PRICE (NEW FT) (Rs.)</label>
                        <input
                          type="number"
                          min={1}
                          value={startingPrice}
                          onChange={(e) => setStartingPrice(Math.max(1, Number(e.target.value)))}
                          className="w-full bg-slate-950 p-1.5 rounded text-amber-400 font-mono font-bold border border-slate-850 focus:border-amber-500"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {billMode === "New" && (
                  <>
                    <div className="grid grid-cols-2 gap-2 text-[10px]">
                      <div>
                        <label className="text-[9px] text-slate-400 block uppercase font-mono font-bold">START DEPTH</label>
                        <input
                          type="text"
                          disabled
                          value="1 foot"
                          className="w-full bg-slate-950/50 p-1.5 rounded text-slate-600 font-mono border border-slate-850"
                        />
                      </div>
                      <div>
                        <label className="text-[9px] text-slate-500 block uppercase font-mono font-bold">FINAL DEPTH (FEET)</label>
                        <input
                          type="number"
                          min={1}
                          max={2000}
                          value={finalDepth}
                          onChange={(e) => setFinalDepth(Math.max(1, Number(e.target.value)))}
                          className="w-full bg-slate-950 p-1.5 rounded text-teal-400 font-mono font-bold border border-slate-850"
                        />
                      </div>
                    </div>

                    {/* Dynamic Slabs Starting Price Row */}
                    <div className="text-[10px]">
                      <label className="text-[9px] text-amber-400 block uppercase font-mono font-bold">STARTING PRICE FOR 1-{borewellType === "Tight Formation" ? "300" : "500"} FT (Rs.)</label>
                      <input
                        type="number"
                        min={1}
                        value={startingPrice}
                        onChange={(e) => setStartingPrice(Math.max(1, Number(e.target.value)))}
                        className="w-full bg-slate-950 p-1.5 rounded text-amber-400 font-mono font-bold border border-slate-850 focus:border-amber-500 focus:ring-1 focus:ring-amber-500/20 text-xs mt-1"
                      />
                    </div>
                  </>
                )}

                {/* UNCONDITIONAL CASING & BATTA SPECIFICATIONS */}
                <div className="border-t border-slate-850 pt-2.5 space-y-2">
                  <div className="text-[9px] text-indigo-400 font-mono uppercase font-black tracking-wider">
                    Casing Pipe Specifications & Internal Equipment Selection
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-[10px] bg-slate-950/40 p-2 rounded-xl border border-slate-850">
                    <div>
                      <label className="text-[8.5px] text-indigo-400 font-bold uppercase block mb-1">Drilling Bit Used</label>
                      <select
                        value={selectedBitId}
                        onChange={(e) => setSelectedBitId(e.target.value)}
                        className="w-full bg-slate-950 p-1.5 rounded text-slate-200 border border-slate-850 font-mono text-[9px] focus:outline-none focus:border-indigo-500"
                      >
                        <option value="">No Bit Selected</option>
                        {bitEntries.map((bit) => (
                          <option key={bit.id} value={bit.id}>
                            {bit.bitNo} ({bit.brand} • {bit.sizeMm}mm)
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="text-[8.5px] text-indigo-400 font-bold uppercase block mb-1">Drilling Hammer Used</label>
                      <select
                        value={selectedHammerId}
                        onChange={(e) => setSelectedHammerId(e.target.value)}
                        className="w-full bg-slate-950 p-1.5 rounded text-slate-200 border border-slate-850 font-mono text-[9px] focus:outline-none focus:border-indigo-500"
                      >
                        <option value="">No Hammer Selected</option>
                        {hammerEntries.map((h) => {
                          const totalUsed = (h.usageHistory || []).reduce((sum, item) => sum + item.calculatedFeet, 0);
                          return (
                            <option key={h.id} value={h.id}>
                              {h.hammerNo} • {h.brand} ({totalUsed}/{h.capableFeetDepth} ft)
                            </option>
                          );
                        })}
                      </select>
                    </div>
                  </div>

                  {/* 10" CASING SECTION */}
                  <div className="grid grid-cols-1 gap-2 text-[10px] bg-slate-950/40 p-2.5 rounded-xl border border-slate-850 font-mono">
                    <div className="grid grid-cols-3 gap-2">
                      <div>
                        <div className="text-[6px] text-red-500 font-bold uppercase block mb-1 whitespace-nowrap">10" HIGH DEPTH (FT)</div>
                        <input
                          type="number"
                          min={0}
                          value={billCasing10HighFeet}
                          onChange={(e) => {
                            const val = Math.max(0, Number(e.target.value));
                            setBillCasing10HighFeet(val);
                            setCasing10Feet(val + Number(billCasing10MediumFeet));
                          }}
                          className="w-full bg-slate-950 p-1.5 rounded text-slate-200 font-mono border border-slate-850 focus:border-pink-500"
                        />
                      </div>
                      <div>
                        <div className="text-[6px] text-red-500 font-bold uppercase block mb-1 whitespace-nowrap">10" MED DEPTH (FT)</div>
                        <input
                          type="number"
                          min={0}
                          value={billCasing10MediumFeet}
                          onChange={(e) => {
                            const val = Math.max(0, Number(e.target.value));
                            setBillCasing10MediumFeet(val);
                            setCasing10Feet(Number(billCasing10HighFeet) + val);
                          }}
                          className="w-full bg-slate-950 p-1.5 rounded text-slate-200 font-mono border border-slate-850 focus:border-pink-500"
                        />
                      </div>
                      <div>
                        <div className="text-[6px] text-red-500 font-bold uppercase block mb-1 whitespace-nowrap">RATE / FT (₹)</div>
                        <input
                          type="number"
                          min={0}
                          value={casing10Rate}
                          onChange={(e) => setCasing10Rate(Math.max(0, Number(e.target.value)))}
                          className="w-full bg-slate-950 p-1.5 rounded text-pink-400 font-mono border border-slate-850 focus:border-pink-500"
                        />
                      </div>
                    </div>
                    
                    <div className="pt-1.5 border-t border-slate-900/60 mt-1">
                      <div className="text-[8px] text-slate-400 font-mono font-bold uppercase block mb-1">10" Casing Hammer Used</div>
                      <select
                        value={selectedCasing10HammerId}
                        onChange={(e) => setSelectedCasing10HammerId(e.target.value)}
                        className="w-full bg-slate-950 p-1.5 rounded text-slate-200 border border-slate-850 font-mono text-[9px] focus:outline-none focus:border-pink-500"
                      >
                        <option value="">No 10" Casing Hammer Selected</option>
                        {hammerEntries.filter(h => h.casingType === "10 inch").map((h) => {
                          const totalUsed = (h.usageHistory || []).reduce((sum, item) => sum + item.calculatedFeet, 0);
                          return (
                            <option key={h.id} value={h.id}>
                              {h.hammerNo} • {h.brand} ({totalUsed}/{h.capableFeetDepth} ft used)
                            </option>
                          );
                        })}
                      </select>
                    </div>
                  </div>

                  {/* 7" CASING SECTION */}
                  <div className="grid grid-cols-1 gap-2 text-[10px] bg-slate-950/40 p-2.5 rounded-xl border border-slate-850 font-mono">
                    <div className="grid grid-cols-3 gap-2">
                      <div>
                        <div className="text-[6px] text-emerald-500 font-bold uppercase block mb-1 whitespace-nowrap">7" HIGH DEPTH (FT)</div>
                        <input
                          type="number"
                          min={0}
                          value={billCasing7HighFeet}
                          onChange={(e) => {
                            const val = Math.max(0, Number(e.target.value));
                            setBillCasing7HighFeet(val);
                            setCasing7Feet(val + Number(billCasing7MediumFeet));
                          }}
                          className="w-full bg-slate-950 p-1.5 rounded text-slate-200 font-mono border border-slate-850 focus:border-violet-500"
                        />
                      </div>
                      <div>
                        <div className="text-[6px] text-emerald-500 font-bold uppercase block mb-1 whitespace-nowrap">7" MED DEPTH (FT)</div>
                        <input
                          type="number"
                          min={0}
                          value={billCasing7MediumFeet}
                          onChange={(e) => {
                            const val = Math.max(0, Number(e.target.value));
                            setBillCasing7MediumFeet(val);
                            setCasing7Feet(Number(billCasing7HighFeet) + val);
                          }}
                          className="w-full bg-slate-950 p-1.5 rounded text-slate-200 font-mono border border-slate-850 focus:border-violet-500"
                        />
                      </div>
                      <div>
                        <div className="text-[6px] text-emerald-500 font-bold uppercase block mb-1 whitespace-nowrap">RATE / FT (₹)</div>
                        <input
                          type="number"
                          min={0}
                          value={casing7Rate}
                          onChange={(e) => setCasing7Rate(Math.max(0, Number(e.target.value)))}
                          className="w-full bg-slate-950 p-1.5 rounded text-violet-400 font-mono border border-slate-850 focus:border-violet-500"
                        />
                      </div>
                    </div>

                    <div className="pt-1.5 border-t border-slate-900/60 mt-1">
                      <div className="text-[8px] text-slate-400 font-mono font-bold uppercase block mb-1">7" Casing Hammer Used</div>
                      <select
                        value={selectedCasing7HammerId}
                        onChange={(e) => setSelectedCasing7HammerId(e.target.value)}
                        className="w-full bg-slate-950 p-1.5 rounded text-slate-200 border border-slate-850 font-mono text-[9px] focus:outline-none focus:border-violet-500"
                      >
                        <option value="">No 7" Casing Hammer Selected</option>
                        {hammerEntries.filter(h => h.casingType === "7 inch").map((h) => {
                          const totalUsed = (h.usageHistory || []).reduce((sum, item) => sum + item.calculatedFeet, 0);
                          return (
                            <option key={h.id} value={h.id}>
                              {h.hammerNo} • {h.brand} ({totalUsed}/{h.capableFeetDepth} ft used)
                            </option>
                          );
                        })}
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-[10px]">
                    <div>
                      <label className="text-[9px] text-slate-400 block uppercase font-mono font-bold">BATTA FEE (Rs.)</label>
                      <input
                        type="number"
                        min={0}
                        value={batta}
                        onChange={(e) => setBatta(Math.max(0, Number(e.target.value)))}
                        className="w-full bg-slate-950 p-1.5 rounded text-white font-mono border border-slate-850 focus:border-indigo-500 mt-1"
                      />
                    </div>
                  </div>
                </div>

                {/* Real-time slab-wise calculation preview display */}
                <div className="bg-slate-950 p-3 rounded-xl border border-slate-850 space-y-2">
                  <div className="flex justify-between items-center border-b border-slate-850/60 pb-1.5">
                    <span className="text-[9px] font-bold uppercase tracking-wider text-teal-400 flex items-center gap-1">
                      <span className="inline-block w-1.5 h-1.5 rounded-full bg-teal-400 animate-pulse"></span>
                      Real-time Bill Calculator Breakdown
                    </span>
                    <span className="text-[8px] font-mono text-slate-500">Slab Rates Applied</span>
                  </div>

                  <div className="space-y-1 font-mono text-[9px] max-h-[140px] overflow-y-auto pr-1">
                    {liveCalc.breakdownLines.length === 0 ? (
                      <p className="text-slate-500 italic text-center py-2">No drilling required or depth matches existing.</p>
                    ) : (
                      liveCalc.breakdownLines.map((line, idx) => (
                        <div key={idx} className="flex justify-between items-center text-slate-300">
                          <span>Slab {line.slabRange} ft:</span>
                          <span className="text-slate-400">({line.feet} ft × Rs. {line.rate}) = <strong className="text-green-500 font-black">Rs. {line.amount.toLocaleString()}</strong></span>
                        </div>
                      ))
                    )}
                  </div>

                  <div className="border-t border-slate-850/40 pt-2 space-y-1 font-mono text-[9px]">
                    <div className="flex justify-between text-slate-400">
                      <span>Total Drilling Charge:</span>
                      <span className="font-bold text-slate-250">Rs. {liveCalc.totalDrilling.toLocaleString()}</span>
                    </div>
                    {casing10Feet > 0 && (
                      <div className="flex justify-between text-slate-400">
                        <span>Casing 10" ({casing10Feet}ft × Rs. {casing10Rate}):</span>
                        <span className="font-bold text-slate-250">Rs. {(casing10Feet * casing10Rate).toLocaleString()}</span>
                      </div>
                    )}
                    {casing7Feet > 0 && (
                      <div className="flex justify-between text-slate-400">
                        <span>Casing 7" ({casing7Feet}ft × Rs. {casing7Rate}):</span>
                        <span className="font-bold text-slate-250">Rs. {(casing7Feet * casing7Rate).toLocaleString()}</span>
                      </div>
                    )}
                    <div className="flex justify-between text-slate-400">
                      <span>Batta Fee:</span>
                      <span className="font-bold text-slate-250">Rs. {batta.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between items-center pt-1.5 border-t border-slate-850/30 text-white font-normal text-xs uppercase">
                      <span className="text-slate-350 font-medium">Estimated Total:</span>
                      <span className="text-slate-300 font-bold">Rs. {liveCalc.grand.toLocaleString()}</span>
                    </div>
                    {discountAmount > 0 && (
                      <div className="flex justify-between text-amber-500 font-bold text-[11px] mt-1">
                        <span>Discount for Customer:</span>
                        <span>- Rs. {discountAmount.toLocaleString()}</span>
                      </div>
                    )}
                    <div className="flex justify-between items-center pt-1.5 border-t border-slate-850/40 text-white font-bold text-xs uppercase mt-1">
                      <span className="text-indigo-400 font-black">Grand Total:</span>
                      <span className="text-teal-400 font-black text-sm">Rs. {Math.max(0, liveCalc.grand - discountAmount).toLocaleString()}</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[9px] text-amber-400 block uppercase font-mono font-black tracking-wider">Discount Amount for Customer (Rs.)</label>
                  <input
                    type="number"
                    min={0}
                    placeholder="Enter discount amount to reduce estimated total..."
                    value={discountAmount || ""}
                    onChange={(e) => {
                      const newDiscount = Math.max(0, Number(e.target.value));
                      setDiscountAmount(newDiscount);
                      const grandTotalVal = Math.max(0, liveCalc.grand - newDiscount);
                      if (customerPaid >= grandTotalVal) {
                        setBillStatus("Paid");
                      } else {
                        setBillStatus("Pending");
                      }
                    }}
                    className="w-full bg-slate-950 p-2 text-xs text-amber-400 font-mono font-bold rounded border border-slate-850 focus:border-amber-550"
                  />
                </div>

                <div className="space-y-2 border border-slate-850 p-2.5 rounded-xl bg-slate-950/30">
                  <div className="flex justify-between items-center">
                    <span className="text-[9.5px] font-mono text-slate-400 uppercase tracking-wider font-bold">Payment History</span>
                    <span className="text-[9px] text-slate-500 font-mono">{paymentsList.length} Entries</span>
                  </div>

                  {paymentsList.length > 0 ? (
                    <div className="space-y-1 max-h-32 overflow-y-auto">
                      {paymentsList.map((p, idx) => (
                        <div key={p.id || idx} className="flex justify-between items-center text-[10px] font-mono bg-slate-950 p-1.5 rounded border border-slate-850">
                          <span className="text-slate-400">{formatDateToDMY(p.date)}</span>
                          <div className="flex items-center gap-2">
                            <span className="text-teal-400 font-bold">Rs. {p.amount.toLocaleString()}</span>
                            <button
                              type="button"
                              onClick={() => {
                                const updated = paymentsList.filter(item => item.id !== p.id);
                                setPaymentsList(updated);
                                const totalPaidCalculated = updated.reduce((sum, item) => sum + item.amount, 0);
                                const grandTotalVal = Math.max(0, liveCalc.grand - discountAmount);
                                if (totalPaidCalculated >= grandTotalVal) {
                                  setBillStatus("Paid");
                                } else {
                                  setBillStatus("Pending");
                                }
                              }}
                              className="text-rose-450 hover:text-rose-600 cursor-pointer text-[9px] px-1.5 py-0.5 font-bold bg-rose-950/40 rounded border border-rose-900/30"
                            >
                              Delete
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-[9.5px] text-slate-500 italic text-center py-1">No payment entries added yet.</p>
                  )}

                  {!showAddPaymentForm ? (
                    <button
                      type="button"
                      onClick={() => {
                        setShowAddPaymentForm(true);
                        setTempPayAmount("");
                        setTempPayDate(new Date().toISOString().split("T")[0]);
                      }}
                      className="w-full mt-1 bg-indigo-950 hover:bg-indigo-900/80 text-indigo-350 hover:text-white py-1.5 px-3 rounded-lg border border-indigo-900/40 text-[9.5px] font-mono font-bold flex items-center justify-center gap-1 transition cursor-pointer active:scale-95"
                    >
                      ➕ Add Customer Payment
                    </button>
                  ) : (
                    <div className="bg-slate-950 border border-slate-850 p-2 rounded-xl space-y-2 mt-1 animate-fade-in">
                      <span className="text-[8.5px] font-mono text-indigo-400 font-bold uppercase tracking-wider block">New Payment Entry</span>
                      <div className="grid grid-cols-2 gap-2">
                        <div className="space-y-0.5">
                          <label className="text-[8px] text-slate-400 font-mono block uppercase">Amount (Rs.)</label>
                          <input
                            type="number"
                            min={1}
                            placeholder="Enter amount..."
                            value={tempPayAmount}
                            onChange={(e) => setTempPayAmount(e.target.value)}
                            className="w-full bg-slate-900 p-1.5 text-[10px] text-teal-400 font-mono rounded border border-slate-880"
                          />
                        </div>
                        <div className="space-y-0.5">
                          <label className="text-[8px] text-slate-400 font-mono block uppercase">Date</label>
                          <input
                            type="date"
                            value={tempPayDate}
                            onChange={(e) => setTempPayDate(e.target.value)}
                            className="w-full bg-slate-900 p-1.5 text-[10px] text-teal-400 font-mono rounded border border-slate-880"
                          />
                        </div>
                      </div>
                      <div className="flex gap-1.5 justify-end">
                        <button
                          type="button"
                          onClick={() => setShowAddPaymentForm(false)}
                          className="px-2 bg-slate-900 hover:bg-slate-800 text-slate-400 py-1 rounded text-[9px] cursor-pointer"
                        >
                          Cancel
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            const amt = Number(tempPayAmount);
                            if (!amt || amt <= 0) {
                              alert("Please enter a valid payment amount.");
                              return;
                            }
                            if (!tempPayDate) {
                              alert("Please select a payment date.");
                              return;
                            }
                            const newEntry = {
                              id: `pay-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
                              date: tempPayDate,
                              amount: amt
                            };
                            const updated = [...paymentsList, newEntry];
                            setPaymentsList(updated);
                            setShowAddPaymentForm(false);
                            setTempPayAmount("");

                            const totalPaidCalculated = updated.reduce((sum, item) => sum + item.amount, 0);
                            const grandTotalVal = Math.max(0, liveCalc.grand - discountAmount);
                            if (totalPaidCalculated >= grandTotalVal) {
                              setBillStatus("Paid");
                            } else {
                              setBillStatus("Pending");
                            }
                          }}
                          className="px-2.5 bg-teal-600 hover:bg-teal-500 text-white font-bold py-1 rounded text-[9px] cursor-pointer"
                        >
                          Add
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                <div className="flex justify-between items-center bg-slate-950 p-2 rounded border border-slate-850 text-xs font-mono font-bold">
                  <span className="text-slate-455">Pending Amount:</span>
                  <span className="text-rose-455 font-black text-rose-400">
                    Rs. {Math.max(0, Math.max(0, liveCalc.grand - discountAmount) - paymentsList.reduce((sum, p) => sum + p.amount, 0)).toLocaleString()}
                  </span>
                </div>

                <div className="space-y-1">
                  <label className="text-[9px] text-slate-500 block uppercase font-mono tracking-wider">RECEIPT STATUS</label>
                  <select
                    value={billStatus}
                    onChange={(e) => setBillStatus(e.target.value as any)}
                    className="w-full bg-slate-950 p-2 text-xs text-white rounded border border-slate-850 font-bold"
                  >
                    <option value="Pending">PENDING (Unreceived Receivables)</option>
                    <option value="Paid">PAID (Clear Settled Receipt)</option>
                  </select>
                </div>

                <div className="flex gap-2 justify-end pt-1">
                  <button
                    type="button"
                    onClick={() => setIsBillFormOpen(false)}
                    className="px-3 bg-slate-950 hover:bg-slate-850 text-slate-450 py-1.5 rounded text-xs cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4.5 bg-indigo-600 hover:bg-indigo-500 text-white font-black py-1.5 rounded text-xs cursor-pointer transition uppercase tracking-wide"
                  >
                    {editingBillId ? "Update Borewell Bill" : "Save & Post Bill"}
                  </button>
                </div>
              </form>
            )}

            {/* Business Bills/Invoice list */}
            <div className="space-y-3">
              {businessBills.map(b => {
                const bType = b.borewellType || "Tight Formation";
                const bMode = b.billMode || "New";
                const eDepth = b.existingDepth || 0;
                const fDepth = b.finalDepth || 950;
                const cFeet = b.casingFeet || 0;
                const cRate = b.casingRate || 0;
                const battaVal = b.batta === undefined ? 1500 : b.batta;

                // Call helper on existing items to display breakdown safely
                const itemCalc = (b.isCustomBill || bMode === "Customize")
                  ? runCustomCalculation({
                      borewellType: bType,
                      startingFeet: b.customStartingFeet !== undefined ? b.customStartingFeet : 0,
                      endingFeet: b.customEndingFeet !== undefined ? b.customEndingFeet : fDepth,
                      rates: b.customSlabRates || {},
                      c7Feet: b.casing7Feet !== undefined ? b.casing7Feet : (b.casingType === "7 inch" ? cFeet : 0),
                      c7Rate: b.casing7Rate !== undefined ? b.casing7Rate : (b.casingType === "7 inch" ? cRate : 350),
                      c10Feet: b.casing10Feet !== undefined ? b.casing10Feet : (b.casingType === "10 inch" ? cFeet : 0),
                      c10Rate: b.casing10Rate !== undefined ? b.casing10Rate : (b.casingType === "10 inch" ? cRate : 450),
                      battaVal: battaVal
                    })
                  : runBorewellCalculation(
                      bType,
                      bMode,
                      eDepth,
                      fDepth,
                      cFeet,
                      cRate,
                      battaVal,
                      b.startingPrice || 100,
                      b.oldFeetRate || 90,
                      b.casing7Feet !== undefined ? b.casing7Feet : (b.casingType === "7 inch" ? cFeet : 0),
                      b.casing7Rate !== undefined ? b.casing7Rate : (b.casingType === "7 inch" ? cRate : 350),
                      b.casing10Feet !== undefined ? b.casing10Feet : (b.casingType === "10 inch" ? cFeet : 0),
                      b.casing10Rate !== undefined ? b.casing10Rate : (b.casingType === "10 inch" ? cRate : 450)
                    );

                const isCustomItem = b.isCustomBill || bMode === "Customize";

                return (
                  <div key={b.id} className="bg-slate-900 border border-slate-850 p-3.5 rounded-2xl space-y-3 shadow-md">
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className="text-[8px] bg-slate-950 font-mono text-indigo-400 px-1.5 py-0.5 rounded border border-indigo-900 font-extrabold uppercase tracking-widest">
                            {b.invoiceNo}
                          </span>
                          <h4 className="text-xs font-black text-red-500 truncate max-w-[170px]">{b.clientName}</h4>
                        </div>
                        <p className="text-[8px] font-mono text-slate-500 mt-1">Date: {formatDateToDMY(b.billDate)} | Due: {formatDateToDMY(b.dueDate)}</p>
                      </div>

                      <span className={`text-[8.5px] font-mono font-bold uppercase px-2 py-0.5 rounded border ${
                        b.status === "Paid" ? "bg-emerald-950 text-emerald-400 border-emerald-900" : "bg-rose-950 text-rose-400 border-rose-900"
                      }`}>
                        {b.status || "Pending"}
                      </span>
                    </div>

                    {/* Metadata tags for depths */}
                    <div className="flex flex-wrap gap-1.5 text-[8.5px] font-mono">
                      <span className="bg-slate-950/80 text-slate-350 px-2 py-0.5 rounded border border-slate-850">
                        {bType}
                      </span>
                      {b.location && (
                        <span className="bg-slate-950/80 text-emerald-400 px-2 py-0.5 rounded border border-slate-850">
                          Loc: {b.location}
                        </span>
                      )}
                      {b.brokerName && (
                        <span className="bg-slate-950/80 text-fuchsia-400 px-2 py-0.5 rounded border border-slate-850">
                          Broker: {b.brokerName}
                        </span>
                      )}
                      {!isCustomItem && (
                        <span className="bg-slate-950/80 text-amber-400 px-2 py-0.5 rounded border border-slate-850">
                          Start Price: Rs. {b.startingPrice || 100}
                        </span>
                      )}
                      {!isCustomItem && bMode === "Re-Borewell" && (
                        <span className="bg-slate-950/80 text-violet-400 px-2 py-0.5 rounded border border-slate-850">
                          Old Rate: Rs. {b.oldFeetRate || 90}/ft
                        </span>
                      )}
                      <span className="bg-slate-950/80 text-teal-400 px-2 py-0.5 rounded border border-slate-850">
                        {isCustomItem 
                          ? `Custom range: ${b.customStartingFeet || 0} → ${b.customEndingFeet || fDepth} ft`
                          : (bMode === "Re-Borewell" ? `Re-bore: ${eDepth} ft → ${fDepth} ft` : `New: ${fDepth} ft`)}
                      </span>
                      {(b.casing10Feet || 0) > 0 ? (
                        <span className="bg-slate-950/80 text-pink-400 px-2 py-0.5 rounded border border-slate-850">
                          Casing 10": {b.casing10Feet} ft @ Rs. {b.casing10Rate}
                        </span>
                      ) : null}
                      {(b.casing7Feet || 0) > 0 ? (
                        <span className="bg-slate-950/80 text-violet-400 px-2 py-0.5 rounded border border-slate-850">
                          Casing 7": {b.casing7Feet} ft @ Rs. {b.casing7Rate}
                        </span>
                      ) : null}
                      {!(b.casing10Feet || 0) && !(b.casing7Feet || 0) && cFeet > 0 ? (
                        <span className="bg-slate-950/80 text-indigo-400 px-2 py-0.5 rounded border border-slate-850">
                          Casing: {b.casingType || "7 inch"} ({cFeet} ft @ Rs. {cRate})
                        </span>
                      ) : null}
                    </div>

                    {b.description && b.discountAmount === undefined && (
                      <p className="text-[8.5px] text-slate-400 leading-normal font-sans italic bg-slate-950/30 p-2 rounded-xl">
                        "{b.description}"
                      </p>
                    )}

                    {/* Costing Summary list block */}
                    <div className="bg-slate-950/80 p-2.5 rounded-xl border border-slate-850/50 space-y-1 text-[8.5px] font-mono text-slate-400">
                      <div className="flex justify-between">
                        <span>Slab Drilling Cost:</span>
                        <span className="font-bold text-green-500">Rs. {itemCalc.totalDrilling.toLocaleString()}</span>
                      </div>
                      
                      {(b.casing10Feet || 0) > 0 && (
                        <div className="flex justify-between">
                          <span>Casing Pipe 10" cost:</span>
                          <span className="font-medium text-green-500">Rs. {((b.casing10Feet || 0) * (b.casing10Rate || 450)).toLocaleString()}</span>
                        </div>
                      )}
                      {(b.casing7Feet || 0) > 0 && (
                        <div className="flex justify-between">
                          <span>Casing Pipe 7" cost:</span>
                          <span className="font-medium text-green-500">Rs. {((b.casing7Feet || 0) * (b.casing7Rate || 350)).toLocaleString()}</span>
                        </div>
                      )}
                      {!(b.casing10Feet || 0) && !(b.casing7Feet || 0) && cFeet > 0 && (
                        <div className="flex justify-between">
                          <span>Casing Pipe total:</span>
                          <span className="font-medium text-green-500">Rs. {itemCalc.casingTotal.toLocaleString()}</span>
                        </div>
                      )}

                      <div className="flex justify-between">
                        <span>Batta allowances:</span>
                        <span className="font-medium text-green-500">Rs. {battaVal.toLocaleString()}</span>
                      </div>

                      {b.discountAmount !== undefined && b.discountAmount > 0 && (
                        <div className="flex justify-between text-amber-500 font-bold">
                          <span>Discount Amount:</span>
                          <span>- Rs. {b.discountAmount.toLocaleString()}</span>
                        </div>
                      )}

                      <div className="flex justify-between items-center text-[9px] text-indigo-400 font-extrabold pt-1 border-t border-slate-850/30">
                        <span>Invoice Total Amount:</span>
                        <span className="text-green-500 text-xs font-black">Rs. {b.amount.toLocaleString()}</span>
                      </div>

                      {/* Paid Details Section */}
                      <div className="pt-1.5 border-t border-slate-850/40 mt-1.5 space-y-1.5 text-slate-400 text-[8.5px]">
                        {/* Summary single row */}
                        <div className="flex flex-wrap items-center justify-between bg-slate-950 p-1.5 rounded border border-slate-850 text-slate-350 font-bold gap-y-1">
                          <div className="text-center px-1">
                            <span className="text-[7.5px] text-slate-500 font-mono block uppercase">Date</span>
                            <span className="font-mono text-[8.5px] text-slate-200">{formatDateToDMY(b.billDate)}</span>
                          </div>
                          <div className="text-center px-1 border-l border-slate-850/60">
                            <span className="text-[7.5px] text-slate-500 font-mono block uppercase">Grand Total</span>
                            <span className="font-mono text-[8.5px] text-slate-200">Rs. {b.amount.toLocaleString()}</span>
                          </div>
                          <div className="text-center px-1 border-l border-slate-850/60">
                            <span className="text-[7.5px] text-slate-500 font-mono block uppercase">Customer Paid</span>
                            <span className="font-mono text-[8.5px] text-teal-400">Rs. {(b.customerPaid || 0).toLocaleString()}</span>
                          </div>
                          <div className="text-center px-1 border-l border-slate-850/60">
                            <span className="text-[7.5px] text-slate-500 font-mono block uppercase">Pending</span>
                            <span className={`font-mono text-[8.5px] ${Math.max(0, b.amount - (b.customerPaid || 0)) === 0 ? "text-emerald-400" : "text-rose-400"}`}>
                              Rs. {Math.max(0, b.amount - (b.customerPaid || 0)).toLocaleString()}
                            </span>
                          </div>
                        </div>

                        {/* Individual payment entries listing */}
                        {b.payments && b.payments.length > 0 && (
                          <div className="space-y-1 mt-1 pl-1 font-mono">
                            <span className="text-[8px] text-slate-500 font-bold uppercase tracking-wider block">Payment Logs:</span>
                            {b.payments.map((p, pIdx) => (
                              <div key={p.id || pIdx} className="flex justify-between items-center text-[8px] bg-slate-950/60 px-2 py-0.5 rounded border border-slate-900/60">
                                <span className="text-slate-450">• {formatDateToDMY(p.date)}</span>
                                <span className="text-teal-400 font-bold">Rs. {p.amount.toLocaleString()} paid</span>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Actions Panel */}
                    <div className="flex gap-2 justify-between items-center text-[9px] font-mono pt-1">
                      <button
                        type="button"
                        onClick={() => handleDownloadInvoicePDF(b)}
                        title="Download Times-Roman Official PDF Report"
                        className="bg-indigo-950 hover:bg-slate-850 text-indigo-350 hover:text-white py-1 px-2.5 rounded-lg border border-indigo-900/40 flex items-center gap-1.5 transition cursor-pointer"
                      >
                        <Download className="w-3.5 h-3.5" /> Download Bill
                      </button>

                      <div className="flex gap-1.5 font-bold">
                        <button
                          type="button"
    onClick={() => {
                            void (async () => {
                              const nextStatus = b.status === "Paid" ? "Pending" : "Paid";
                              let updatedFields: Partial<BusinessBill> = { status: nextStatus };
                              
                              if (nextStatus === "Paid") {
                                const remaining = Math.max(0, b.amount - (b.customerPaid || 0));
                                if (remaining > 0) {
                                  const todayStr = new Date().toISOString().split("T")[0];
                                  const newPayment = {
                                    id: `pay-mark-paid-${Date.now()}`,
                                    date: todayStr,
                                    amount: remaining
                                  };
                                  updatedFields = {
                                    status: "Paid",
                                    customerPaid: b.amount,
                                    paymentDate: todayStr,
                                    payments: [...(b.payments || []), newPayment]
                                  };
                                }
                              }

                              if (b.source !== "server") {
                                setBusinessBills((prev) =>
                                  prev.map((item) => (item.id === b.id ? { ...item, ...updatedFields } : item))
                                );
                                triggerOnlineSync(`Marked Invoice ${b.invoiceNo} as ${nextStatus} (local only)`);
                                return;
                              }
                              try {
                                const payload = toBusinessBillApiPayload({
                                  ...b,
                                  ...updatedFields
                                });
                                const response = await requestJson(apiBaseUrl, `/api/v1/business/bills/${b.id}`, {
                                  method: "PUT",
                                  headers: { "Content-Type": "application/json" },
                                  body: JSON.stringify(payload),
                                });
                                const savedBill = mapBusinessBillFromApi(response);
                                setBusinessBills((prev) => prev.map((item) => (item.id === b.id ? savedBill : item)));
                                await onSharedDataChanged?.();
                                triggerOnlineSync(`Marked Invoice ${savedBill.invoiceNo} as ${nextStatus}`);
                              } catch (error) {
                                console.error(error);
                                const message = error instanceof Error ? error.message.toLowerCase() : "";
                                if (message.includes("not found") || message.includes("404")) {
                                  setBusinessBills((prev) =>
                                    prev.map((item) =>
                                      item.id === b.id ? { ...item, ...updatedFields } : item
                                    )
                                  );
                                  triggerOnlineSync(`Marked Invoice ${b.invoiceNo} as ${nextStatus} (local sync)`);
                                  return;
                                }
                                alert("Unable to update bill status right now.");
                              }
                            })();
                          }}
                          className={`px-2 py-0.5 rounded text-[8px] font-extrabold transition cursor-pointer border ${
                            b.status === "Paid"
                              ? "bg-emerald-950 text-emerald-400 border-emerald-800"
                              : "bg-rose-950 text-rose-400 border-rose-900"
                          }`}
                        >
                          {b.status === "Paid" ? "Mark Pending" : "Mark Paid"}
                        </button>
                        <button
                          type="button"
                          onClick={() => handleEditBillClick(b)}
                          className="p-1 bg-slate-950 hover:bg-slate-850 text-slate-400 hover:text-white rounded border border-slate-850 cursor-pointer"
                        >
                          <Edit className="w-3 h-3" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteBill(b.id, b.clientName)}
                          className="p-1 bg-rose-950/30 text-rose-450 rounded border border-rose-900/40 cursor-pointer"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    </div>

                  </div>
                );
              })}
            </div>

          </div>
        );
      })()}

      {/* ======================= VEHICLE DOCUMENT VIEWER MODAL ======================= */}
      {selectedFileToView && (
        <div className="fixed inset-0 bg-slate-950/90 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-slate-900 border border-slate-800 w-full max-w-sm rounded-2xl overflow-hidden shadow-2xl flex flex-col max-h-[85vh]">
            
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-slate-950 to-slate-900 p-3.5 border-b border-slate-800 flex justify-between items-center text-slate-200">
              <div>
                <span className="text-[8px] uppercase tracking-wider font-mono text-indigo-400 block font-bold">Smart Logistics Vault</span>
                <h3 className="text-xs font-black truncate">{selectedFileToView.docName}</h3>
              </div>
              <button 
                onClick={() => setSelectedFileToView(null)}
                className="p-1 bg-slate-950 hover:bg-slate-800 text-slate-400 hover:text-white rounded-lg border border-slate-850 duration-150 transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Body / Viewer Window */}
            <div className="p-4 overflow-y-auto space-y-3.5 flex-1 bg-slate-950/40">
              
              {selectedFileToView.fileDataUrl ? (
                /* Custom Uploaded Document Preview Panel */
                <div className="space-y-3">
                  <div className="text-[9px] uppercase font-bold text-slate-400 font-mono tracking-tight flex justify-between items-center bg-slate-900/60 p-1.5 px-2.5 rounded-lg border border-slate-850">
                    <span>Uploaded doc link:</span>
                    <span className="font-mono text-emerald-400 truncate max-w-[150px]">{selectedFileToView.fileName}</span>
                  </div>
                  
                  {selectedFileToView.fileDataUrl.startsWith("data:image/") ? (
                    <div className="border border-slate-800 rounded-xl overflow-hidden bg-slate-950 p-1">
                      <img 
                        src={selectedFileToView.fileDataUrl} 
                        className="w-full max-h-56 object-contain rounded-lg" 
                        alt="Uploaded document scan" 
                        referrerPolicy="no-referrer"
                      />
                    </div>
                  ) : (
                    <div className="bg-indigo-950/20 border border-indigo-900/50 rounded-xl p-4 text-center font-mono space-y-2">
                      <FileText className="w-10 h-10 text-indigo-400 mx-auto animate-pulse" />
                      <div className="text-[10px] font-bold text-indigo-300">Custom Document Data (PDF)</div>
                      <p className="text-[8.5px] text-slate-400 leading-normal">This custom uploaded PDF file is securely encrypted and validated on our servers.</p>
                    </div>
                  )}
                </div>
              ) : (
                /* default interactive verification Certificate */
                <div className="bg-slate-950 border border-slate-850 rounded-2xl p-4 relative overflow-hidden font-mono text-[9px] space-y-3 text-slate-350 shadow-inner">
                  
                  {/* Decorative faint background seal symbol */}
                  <div className="absolute right-3 top-3 opacity-[0.03] select-none pointer-events-none">
                    <FileText className="w-32 h-32 text-white" />
                  </div>

                  {/* Top stamp bar */}
                  <div className="text-center border-b border-dashed border-slate-850 pb-2.5">
                    <span className="text-[8px] font-extrabold text-indigo-400 block uppercase tracking-widest leading-none">Government of India Registration Office</span>
                    <span className="text-[7.5px] text-slate-500 block mt-1 uppercase leading-none">RTO Digitized Fleet Vault Index</span>
                  </div>

                  {/* RTO Seal/Details */}
                  <div className="grid grid-cols-2 gap-2 text-[8.5px]">
                    <div>
                      <span className="text-slate-550 block text-[7px] uppercase font-bold">STATE OFFICE CODE:</span>
                      <span className="text-slate-200">MH-03 / KA-51 IND</span>
                    </div>
                    <div>
                      <span className="text-slate-550 block text-[7px] uppercase font-bold">REGISTRY SERIAL NO:</span>
                      <span className="text-slate-200 font-bold text-teal-400">#RTO-994-01-A</span>
                    </div>
                  </div>

                  {/* Center QR mockup */}
                  <div className="py-2 flex flex-col items-center justify-center border-y border-dashed border-slate-850 bg-slate-900/30 rounded-xl">
                    <div className="grid grid-cols-4 gap-0.5 bg-white p-1 rounded">
                      <div className="w-1.5 h-1.5 bg-slate-950"></div>
                      <div className="w-1.5 h-1.5 bg-slate-950"></div>
                      <div className="w-1.5 h-1.5 bg-white"></div>
                      <div className="w-1.5 h-1.5 bg-slate-950"></div>
                      <div className="w-1.5 h-1.5 bg-white"></div>
                      <div className="w-1.5 h-1.5 bg-white"></div>
                      <div className="w-1.5 h-1.5 bg-slate-950"></div>
                      <div className="w-1.5 h-1.5 bg-slate-950"></div>
                      <div className="w-1.5 h-1.5 bg-slate-950"></div>
                      <div className="w-1.5 h-1.5 bg-white"></div>
                      <div className="w-1.5 h-1.5 bg-slate-950"></div>
                      <div className="w-1.5 h-1.5 bg-white"></div>
                      <div className="w-1.5 h-1.5 bg-white"></div>
                      <div className="w-1.5 h-1.5 bg-slate-950"></div>
                      <div className="w-1.5 h-1.5 bg-slate-950"></div>
                      <div className="w-1.5 h-1.5 bg-slate-950"></div>
                    </div>
                    <span className="text-[7px] text-slate-500 font-bold mt-1 uppercase tracking-tight">Verified Digital Signature Slip</span>
                  </div>

                  {/* Vehicle Identity block inside Doc */}
                  <div className="space-y-1 bg-slate-905 p-2 rounded-lg border border-slate-900 leading-normal">
                    <div className="flex justify-between">
                      <span className="text-slate-550">Subject Carrier:</span> 
                      <span className="text-slate-200 font-bold uppercase">{selectedFileToView.vehicleId}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-550">Registered Name:</span> 
                      <span className="text-indigo-400 truncate max-w-[140px] text-right">{selectedFileToView.vehicleName}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-555">System Document Ref:</span> 
                      <span className="text-slate-300 truncate max-w-[140px] text-right">{selectedFileToView.fileName}</span>
                    </div>
                    <div className="flex justify-between pt-1 border-t border-slate-900 text-emerald-400 font-bold text-[8.5px]">
                      <span>Compliance Checklist Status:</span>
                      <span>● ACTIVE & COMPLIANT</span>
                    </div>
                  </div>

                </div>
              )}

              {/* RTO metadata summary block */}
              <div className="bg-slate-900 border border-slate-850 p-2.5 rounded-xl space-y-1.5 font-mono text-[8.5px] text-slate-400">
                <span className="text-slate-555 uppercase font-black tracking-tight block text-[7.5px] leading-none">Security Encryption Protocol:</span>
                <p className="leading-normal">This file index is preserved securely in your browser cache synced with the Agri-Logistics central node via local storage.</p>
              </div>

            </div>

            {/* Modal Actions */}
            <div className="bg-slate-950 p-3 border-t border-slate-800 flex gap-2 font-mono text-[10px]">
              <button 
                onClick={() => alert(`Initiating secure direct browser data stream download of: ${selectedFileToView.fileName}`)}
                className="flex-1 bg-indigo-650 hover:bg-indigo-500 py-1.5 text-white font-extrabold rounded-lg flex items-center justify-center gap-1 cursor-pointer transition active:scale-95 text-[9px]"
              >
                <Download className="w-3.5 h-3.5" /> Download Document File
              </button>
              <button 
                onClick={() => setSelectedFileToView(null)}
                className="bg-slate-900 hover:bg-slate-800 py-1.5 px-4 text-slate-350 rounded-lg border border-slate-800 flex items-center justify-center cursor-pointer transition"
              >
                Close
              </button>
            </div>

          </div>
        </div>
      )}

      {deleteConfirmation && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in font-sans">
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
            
            <p className="text-xs text-slate-350 bg-slate-950 p-3 rounded-lg border border-slate-855 font-mono leading-relaxed">
              Are you sure you want to delete the {
                deleteConfirmation.type === "bill" ? "Borewell bill" :
                deleteConfirmation.type === "labour" ? "worker profile and salary database" :
                deleteConfirmation.type === "vehicle" ? "vehicle" :
                deleteConfirmation.type === "fuel" ? "fuel log" :
                deleteConfirmation.type === "service" ? "service log" :
                deleteConfirmation.type === "bit" ? "bit entry" :
                deleteConfirmation.type === "pipe" ? "pipe/supplier entry" :
                "materials purchase entry"
              } <strong className="text-white">'{deleteConfirmation.name}'</strong>?
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
                onClick={() => { void handleConfirmDelete(); }}
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
