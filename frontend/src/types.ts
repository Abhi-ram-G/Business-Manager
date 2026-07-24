/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type UserRole = "Admin";

// Advance entries model inside Drivers & Helpers
export interface AdvanceEntry {
  id: string;
  dateTime: string;
  reason: "Betta" | "Drink" | "Home Town" | "Medical" | "Festival" | "Other";
  amount: number;
}

// Module 1: Labour Management (Drivers & Helpers)
export interface Labour {
  id: string;
  fullName: string;
  gender?: "Male" | "Female";
  phone: string;
  skillType: "Driver" | "Helper"; // Distinguished types
  dailyWage: number;              // For historical backward compat
  joiningDate: string;            // YYYY-MM-DD
  aadhaarNumber: string;
  address: string;
  emergencyContact: string;
  isActive: boolean;
  isFreezed?: boolean;
  avatarUrl?: string;

  // Driver/Helper Rich Fields
  licenseNumber?: string;         // Optional for helpers, mandatory for drivers
  licenseExpiryDate?: string;
  salaryPerMonth?: number;
  advanceEntries?: AdvanceEntry[];
  pdfAttachmentName?: string;
  profilePhoto?: string;           // base64 data URL or external URL
  profilePhotoName?: string;        // original uploaded file name

  // New Document Attachments
  aadhaarPdfName?: string;
  aadhaarPdfData?: string;
  licensePdfName?: string;
  licensePdfData?: string;
  customDocuments?: {
    id: string;
    docName: string; // e.g. "Fitness Cert", "Pan Card"
    pdfName: string; // e.g. "pan.pdf"
    pdfData: string; // Base64 data URL
  }[];
}

export interface AttendanceRecord {
  id: string;
  labourId: string;
  date: string; // YYYY-MM-DD
  status: "Present" | "Absent" | "Half-Day";
  reason?: string;
}

export interface SalaryPayment {
  id: string;
  labourId: string;
  date: string;
  amountCalculated: number; // Month salary
  advanceDeducted: number;
  bonus: number;
  netPaid: number;
  status: "Paid" | "Pending";
  salaryOption: "Deduct" | "CarryForward";
  deductAmountRequested?: number;
}

// Module 2: Vehicle Management & Fuel management
export interface Vehicle {
  id: string; // Vehicle Number (e.g. KA-51-MJ-1234)
  vehicleName?: string;
  vehicleType: "Truck" | "Tractor" | "Car" | "Van" | "Two-Wheeler";
  brand: string;
  model: string;
  registrationDate?: string; // YYYY-MM-DD
  insuranceExpiry: string; // YYYY-MM-DD
  fitnessExpiry?: string; // YYYY-MM-DD
  pollutionExpiry: string; // YYYY-MM-DD
  
  // legacy compatibility
  driverName?: string;
  rcExpiry?: string;
  insuranceNumber?: string;
  nextServiceDue?: string;

  // Attachments indicator
  rcBookPdf?: string;
  insurancePdf?: string;
  permitPdf?: string;
  fitnessPdf?: string;

  // Custom uploaded file data URLs for direct visualization
  rcBookData?: string;
  insuranceData?: string;
  permitData?: string;
  fitnessData?: string;
}

export interface BitEntry {
  id: string;
  bitNo: string;
  brand: string;
  sizeMm: number;
  buttonSizeMm?: number;
  dateEntry?: string;
  rate: number;
  isPaid?: boolean;
  payments?: { id: string; date: string; amount: number }[];
  capableFeetDepth?: number;
  status?: "active" | "unusable" | "sold";
  soldDate?: string;
  soldRate?: number;
  usageHistory?: HammerUsageRecord[];
}

export interface HammerUsageRecord {
  id: string;
  date: string;             // YYYY-MM-DD
  clientName: string;
  location: string;
  calculatedFeet: number;   // finalDepth - (casing7Feet + casing10Feet)
  billId?: string;
}

export interface HammerEntry {
  id: string;
  hammerNo: string;          // e.g. H-001
  brand: string;
  dateEntry: string;         // YYYY-MM-DD
  rate: number;
  capableFeetDepth: number;  // max drilling capacity in feet
  isPaid: boolean;
  casingType?: "7 inch" | "10 inch"; // set after limit is reached — drilling hammer becomes casing hammer
  status?: "active" | "unusable" | "sold"; // lifecycle status
  soldDate?: string;          // date when hammer was sold
  soldRate?: number;          // rate at which it was sold
  casingUsageHistory?: HammerUsageRecord[]; // separate usage history after becoming a casing hammer
  usageHistory: HammerUsageRecord[];
  payments?: { id: string; date: string; amount: number }[];
}

export interface PipeEntry {
  id: string;
  companyName: string;
  location: string;
  dateEntry?: string;
  
  // 7 inch High Quality
  pipe7HighCount: number;
  pipe7HighRate: number;
  pipe7HighTotal: number;

  // 7 inch Medium Quality
  pipe7MediumCount: number;
  pipe7MediumRate: number;
  pipe7MediumTotal: number;

  // 10 inch High Quality
  pipe10HighCount: number;
  pipe10HighRate: number;
  pipe10HighTotal: number;

  // 10 inch Medium Quality
  pipe10MediumCount: number;
  pipe10MediumRate: number;
  pipe10MediumTotal: number;

  grandTotal: number;
  discountAmount: number;
  grandPrice: number;
  isPaid?: boolean;
  payments?: { id: string; date: string; amount: number }[];
}


export interface BusinessBill {
  id: string;
  invoiceNo: string;
  clientName: string;
  billDate: string;
  dueDate: string;
  description: string;
  amount: number;
  taxRate: number;
  status: "Paid" | "Pending";
  borewellType?: "Tight Formation" | "Loose Formation";
  billMode?: "New" | "Re-Borewell" | "Customize";
  existingDepth?: number;
  finalDepth?: number;
  casingFeet?: number;
  casingRate?: number;
  batta?: number;
  startingPrice?: number;
  oldFeetRate?: number;
  casingType?: "7 inch" | "10 inch";
  calculatedBreakdown?: { slabRange: string; feet: number; rate: number; amount: number }[];
  totalDrillingCharges?: number;
  casingCharges?: number;
  isCustomBill?: boolean;
  location?: string;
  brokerName?: string;
  customDateType?: "automatic" | "manual";
  customStartingFeet?: number;
  customEndingFeet?: number;
  casing10Feet?: number;
  casing10Rate?: number;
  casing7Feet?: number;
  casing7Rate?: number;
  customSlabRates?: Record<string, number>;
  discountAmount?: number;
  source?: "local" | "server";
  customerPaid?: number;
  paymentDate?: string;
  payments?: { id: string; date: string; amount: number }[];
  // Internal tracking only — NOT printed in invoice PDF
  usedBitId?: string;
  usedHammerId?: string;
  usedCasing10HammerId?: string;
  usedCasing7HammerId?: string;
  hammerFeetUsed?: number;
  pipeSupplierId?: string;
  casing7HighFeet?: number;
  casing7MediumFeet?: number;
  casing10HighFeet?: number;
  casing10MediumFeet?: number;
}

export interface FuelEntry {
  id: string;
  dateTime?: string;
  vehicleName?: string; // From Vehicle List
  fuelType?: "Diesel" | "Petrol" | "CNG" | string;
  perLiterCost?: number;
  liters?: number;
  totalAmount?: number; // Auto computed Total Amount = liters * perLiterCost
  vehicleId?: string;
  date?: string;
  cost?: number;
  currentOdometer?: number;
  isPaid?: boolean;
  payments?: { id: string; date: string; amount: number }[];
}

export interface MaintenanceRecord {
  id: string;
  vehicleId: string;
  date: string;
  serviceType: string;
  spareParts: string[];
  cost: number;
}

export interface TripRecord {
  id: string;
  vehicleId: string;
  date: string;
  startLocation: string;
  endLocation: string;
  distanceCovered: number;
  revenueEarned: number;
}

// Module 3: Finance Management (Give & Get)
// A. Borrowed Loan (Amount I Got)
export interface LoanReceived {
  id: string;
  personName?: string;
  myName?: string;
  amount?: number;
  interestType?: "Monthly" | "Yearly" | "Daily";
  interestPercentage?: number;
  interestAmount?: number; // calculated or inputted
  startDate?: string;
  dueDate?: string;
  interestStatus?: "Paid" | "Pending";
  category?: "Personal" | "Business" | "Emergency" | string;
  status?: "Active" | "Paid" | "Defaulted";

  // New fields for vehicle loan integration
  vehicleId?: string;
  numberOfMonths?: number;
  monthlyInterests?: { [monthKey: string]: "Paid" | "Pending" | "Carry Forward" };

  // legacy compatibility
  lenderName?: string;
  borrowedAmount?: number;
  interestRate?: number;
  totalRepaid?: number;
  endDate?: string;
  monthlyEMI?: number;
}

// B. Lent Loan (Amount I Given)
export interface LoanGiven {
  id: string;
  personName?: string;
  myName?: string;
  amountGiven?: number;
  interestType?: "Monthly" | "Yearly" | "Daily";
  interestPercentage?: number;
  interestAmount?: number;
  startDate?: string;
  dueDate?: string;
  collectionStatus?: "Paid" | "Pending";
  category?: "Personal" | "Business" | "Emergency" | string;
  status?: "Active" | "Paid" | "Defaulted";
  monthlyInterests?: {
    [monthKey: string]: "Paid" | "Pending" | "Carry Forward";
  };

  // legacy compatibility
  borrowerName?: string;
  mobileNumber?: string;
  address?: string;
  loanAmount?: number;
  interestRate?: number;
  endDate?: string;
  emiAmount?: number;
  totalPaid?: number;
  isDefaulter?: boolean;
}

// Module 4: Family Expense Management
export interface FamilyMember {
  id: string;
  name: string;
  relationship: string;
}

export interface IncomeEntry {
  id: string;
  source: string; // "Salary", "Business", "Investments", etc.
  amount: number;
  date: string;
}

export interface FamilyExpense {
  id: string;
  familyMemberName?: string; // name of family member for new UI
  memberId?: string; // legay id of family member
  date: string;
  reason?: "Food" | "Education" | "Medical" | "Shopping" | "Travel" | "House Rent" | "Electricity" | "Water Bill" | "Internet" | "Entertainment" | "Other" | string;
  category?: string; // mapped from reason in legacy UI
  amount: number;
  description?: string;
}

export interface CategoryBudget {
  category: string;
  limit: number;
  spent: number;
}

// Module 6: Document Management
export interface ManagedDocument {
  id: string;
  name: string;
  type: "Aadhaar" | "PAN" | "RC Book" | "Insurance" | "Loan Agreement" | "Salary Record";
  ownerName: string;
  uploadDate: string;
  fileSize: string;
  expiryDate?: string;
  status: "Active" | "Expired" | "Pending Review";
}

// Module 7: Notifications
export interface AppNotification {
  id: string;
  title: string;
  body: string;
  date: string;
  type: "salary" | "emi" | "loan" | "insurance" | "service" | "budget";
  isRead: boolean;
}
