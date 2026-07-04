import {
  AttendanceRecord,
  AppNotification,
  CategoryBudget,
  BusinessBill,
  FamilyExpense,
  ManagedDocument,
  FamilyMember,
  IncomeEntry,
  Labour,
  LoanGiven,
  LoanReceived,
  SalaryPayment,
  FuelEntry,
  BitEntry,
  TripRecord,
  Vehicle,
} from "../types";

type ApiRecord = Record<string, unknown>;

const requestJson = async (apiBaseUrl: string, path: string, init?: RequestInit) => {
  const response = await fetch(`${apiBaseUrl}${path}`, init);
  const payload = await response.json().catch(() => null);
  if (!response.ok) {
    throw new Error(payload?.detail || payload?.message || `Request failed: ${response.status}`);
  }
  return payload;
};

const toNumber = (value: unknown, fallback = 0) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
};

export const mapLabourFromApi = (item: ApiRecord): Labour => ({
  id: String(item.id ?? ""),
  fullName: String(item.full_name ?? ""),
  gender: (item.gender as Labour["gender"]) ?? undefined,
  phone: String(item.phone ?? ""),
  skillType: (item.skill_type as Labour["skillType"]) ?? "Helper",
  dailyWage: toNumber(item.daily_wage ?? 0),
  joiningDate: String(item.joining_date ?? ""),
  aadhaarNumber: String(item.aadhaar_number ?? ""),
  address: String(item.address ?? ""),
  emergencyContact: String(item.emergency_contact ?? ""),
  isActive: Boolean(item.is_active ?? true),
  isFreezed: Boolean(item.is_freezed ?? false),
  avatarUrl: item.avatar_url ? String(item.avatar_url) : undefined,
  licenseNumber: item.license_number ? String(item.license_number) : undefined,
  licenseExpiryDate: item.license_expiry_date ? String(item.license_expiry_date) : undefined,
  salaryPerMonth: item.salary_per_month != null ? toNumber(item.salary_per_month) : undefined,
  advanceEntries: Array.isArray(item.advance_entries) ? (item.advance_entries as Labour["advanceEntries"]) : undefined,
  pdfAttachmentName: item.pdf_attachment_name ? String(item.pdf_attachment_name) : undefined,
  profilePhoto: item.profile_photo ? String(item.profile_photo) : undefined,
  profilePhotoName: item.profile_photo_name ? String(item.profile_photo_name) : undefined,
  aadhaarPdfName: item.aadhaar_pdf_name ? String(item.aadhaar_pdf_name) : undefined,
  aadhaarPdfData: item.aadhaar_pdf_data ? String(item.aadhaar_pdf_data) : undefined,
  licensePdfName: item.license_pdf_name ? String(item.license_pdf_name) : undefined,
  licensePdfData: item.license_pdf_data ? String(item.license_pdf_data) : undefined,
  customDocuments: Array.isArray(item.custom_documents) ? (item.custom_documents as Labour["customDocuments"]) : undefined,
});

export const mapVehicleFromApi = (item: ApiRecord): Vehicle => ({
  id: String(item.id ?? ""),
  vehicleName: item.vehicle_name ? String(item.vehicle_name) : undefined,
  vehicleType: (item.vehicle_type as Vehicle["vehicleType"]) ?? "Truck",
  brand: String(item.brand ?? ""),
  model: String(item.model ?? ""),
  registrationDate: item.registration_date ? String(item.registration_date) : undefined,
  insuranceExpiry: String(item.insurance_expiry ?? ""),
  fitnessExpiry: item.fitness_expiry ? String(item.fitness_expiry) : undefined,
  pollutionExpiry: String(item.pollution_expiry ?? ""),
  driverName: item.driver_name ? String(item.driver_name) : undefined,
  rcExpiry: item.rc_expiry ? String(item.rc_expiry) : undefined,
  insuranceNumber: item.insurance_number ? String(item.insurance_number) : undefined,
  nextServiceDue: item.next_service_due ? String(item.next_service_due) : undefined,
  rcBookPdf: item.rc_book_pdf ? String(item.rc_book_pdf) : undefined,
  insurancePdf: item.insurance_pdf ? String(item.insurance_pdf) : undefined,
  permitPdf: item.permit_pdf ? String(item.permit_pdf) : undefined,
  fitnessPdf: item.fitness_pdf ? String(item.fitness_pdf) : undefined,
  rcBookData: item.rc_book_data ? String(item.rc_book_data) : undefined,
  insuranceData: item.insurance_data ? String(item.insurance_data) : undefined,
  permitData: item.permit_data ? String(item.permit_data) : undefined,
  fitnessData: item.fitness_data ? String(item.fitness_data) : undefined,
});

export const mapBitFromApi = (item: ApiRecord): BitEntry => ({
  id: String(item.id ?? ""),
  bitNo: String(item.bit_no ?? ""),
  brand: String(item.brand ?? ""),
  sizeMm: toNumber(item.size_mm ?? 0),
  buttonSizeMm: item.button_size_mm != null ? toNumber(item.button_size_mm) : undefined,
  dateEntry: item.date_entry ? String(item.date_entry) : undefined,
  rate: toNumber(item.rate ?? 0),
});

export const mapBusinessBillFromApi = (item: ApiRecord): BusinessBill => ({
  id: String(item.id ?? ""),
  invoiceNo: String(item.invoice_no ?? ""),
  clientName: String(item.client_name ?? ""),
  billDate: String(item.bill_date ?? ""),
  dueDate: String(item.due_date ?? ""),
  description: String(item.description ?? ""),
  amount: toNumber(item.amount ?? 0),
  taxRate: toNumber(item.tax_rate ?? 0),
  status: (item.status as BusinessBill["status"]) ?? "Pending",
  borewellType: item.borewell_type ? (String(item.borewell_type) as BusinessBill["borewellType"]) : undefined,
  billMode: item.bill_mode ? (String(item.bill_mode) as BusinessBill["billMode"]) : undefined,
  existingDepth: item.existing_depth != null ? toNumber(item.existing_depth) : undefined,
  finalDepth: item.final_depth != null ? toNumber(item.final_depth) : undefined,
  casingFeet: item.casing_feet != null ? toNumber(item.casing_feet) : undefined,
  casingRate: item.casing_rate != null ? toNumber(item.casing_rate) : undefined,
  batta: item.batta != null ? toNumber(item.batta) : undefined,
  startingPrice: item.starting_price != null ? toNumber(item.starting_price) : undefined,
  oldFeetRate: item.old_feet_rate != null ? toNumber(item.old_feet_rate) : undefined,
  casingType: item.casing_type ? (String(item.casing_type) as BusinessBill["casingType"]) : undefined,
  calculatedBreakdown: Array.isArray(item.calculated_breakdown) ? (item.calculated_breakdown as BusinessBill["calculatedBreakdown"]) : undefined,
  totalDrillingCharges: item.total_drilling_charges != null ? toNumber(item.total_drilling_charges) : undefined,
  casingCharges: item.casing_charges != null ? toNumber(item.casing_charges) : undefined,
  isCustomBill: item.is_custom_bill != null ? Boolean(item.is_custom_bill) : undefined,
  location: item.location ? String(item.location) : undefined,
  brokerName: item.broker_name ? String(item.broker_name) : undefined,
  customDateType: item.custom_date_type ? (String(item.custom_date_type) as BusinessBill["customDateType"]) : undefined,
  customStartingFeet: item.custom_starting_feet != null ? toNumber(item.custom_starting_feet) : undefined,
  customEndingFeet: item.custom_ending_feet != null ? toNumber(item.custom_ending_feet) : undefined,
  casing10Feet: item.casing10_feet != null ? toNumber(item.casing10_feet) : undefined,
  casing10Rate: item.casing10_rate != null ? toNumber(item.casing10_rate) : undefined,
  casing7Feet: item.casing7_feet != null ? toNumber(item.casing7_feet) : undefined,
  casing7Rate: item.casing7_rate != null ? toNumber(item.casing7_rate) : undefined,
  customSlabRates: (item.custom_slab_rates as BusinessBill["customSlabRates"]) ?? undefined,
  discountAmount: item.discount_amount != null ? toNumber(item.discount_amount) : undefined,
  usedBitId: item.bit_id ? String(item.bit_id) : undefined,
  usedHammerId: item.hammer_id ? String(item.hammer_id) : undefined,
  source: "server",
});

export const mapLoanGivenFromApi = (item: ApiRecord): LoanGiven => ({
  id: String(item.id ?? ""),
  borrowerName: item.borrower_name ? String(item.borrower_name) : undefined,
  personName: item.person_name ? String(item.person_name) : undefined,
  mobileNumber: item.mobile_number ? String(item.mobile_number) : undefined,
  address: item.address ? String(item.address) : undefined,
  loanAmount: item.loan_amount != null ? toNumber(item.loan_amount) : undefined,
  amountGiven: item.amount_given != null ? toNumber(item.amount_given) : undefined,
  interestRate: item.interest_rate != null ? toNumber(item.interest_rate) : undefined,
  interestPercentage: item.interest_percentage != null ? toNumber(item.interest_percentage) : undefined,
  startDate: item.start_date ? String(item.start_date) : undefined,
  endDate: item.end_date ? String(item.end_date) : undefined,
  emiAmount: item.emi_amount != null ? toNumber(item.emi_amount) : undefined,
  dueDate: item.due_date ? String(item.due_date) : undefined,
  totalPaid: item.total_paid != null ? toNumber(item.total_paid) : undefined,
  isDefaulter: item.is_defaulter != null ? Boolean(item.is_defaulter) : undefined,
  interestType: item.interest_type ? String(item.interest_type) as LoanGiven["interestType"] : undefined,
  category: item.category ? String(item.category) : undefined,
  status: item.status ? String(item.status) as LoanGiven["status"] : undefined,
  monthlyInterests: (item.monthly_interests as LoanGiven["monthlyInterests"]) ?? undefined,
});

export const mapLoanReceivedFromApi = (item: ApiRecord): LoanReceived => ({
  id: String(item.id ?? ""),
  lenderName: item.lender_name ? String(item.lender_name) : undefined,
  personName: item.person_name ? String(item.person_name) : undefined,
  myName: item.my_name ? String(item.my_name) : undefined,
  borrowedAmount: item.borrowed_amount != null ? toNumber(item.borrowed_amount) : undefined,
  amount: item.amount != null ? toNumber(item.amount) : undefined,
  interestRate: item.interest_rate != null ? toNumber(item.interest_rate) : undefined,
  interestPercentage: item.interest_percentage != null ? toNumber(item.interest_percentage) : undefined,
  startDate: item.start_date ? String(item.start_date) : undefined,
  endDate: item.end_date ? String(item.end_date) : undefined,
  monthlyEMI: item.monthly_emi != null ? toNumber(item.monthly_emi) : undefined,
  dueDate: item.due_date ? String(item.due_date) : undefined,
  totalRepaid: item.total_repaid != null ? toNumber(item.total_repaid) : undefined,
  interestType: item.interest_type ? String(item.interest_type) as LoanReceived["interestType"] : undefined,
  interestStatus: item.interest_status ? String(item.interest_status) as LoanReceived["interestStatus"] : undefined,
  category: item.category ? String(item.category) : undefined,
  status: item.status ? String(item.status) as LoanReceived["status"] : undefined,
  vehicleId: item.vehicle_id ? String(item.vehicle_id) : undefined,
  numberOfMonths: item.number_of_months != null ? toNumber(item.number_of_months) : undefined,
  monthlyInterests: (item.monthly_interests as LoanReceived["monthlyInterests"]) ?? undefined,
});

export const mapFamilyMemberFromApi = (item: ApiRecord): FamilyMember => ({
  id: String(item.id ?? ""),
  name: String(item.name ?? ""),
  relationship: String(item.relationship_name ?? item.relationship ?? "Family"),
});

export const mapIncomeFromApi = (item: ApiRecord): IncomeEntry => ({
  id: String(item.id ?? ""),
  source: String(item.source ?? ""),
  amount: toNumber(item.amount ?? 0),
  date: String(item.date ?? ""),
});

export const mapAttendanceFromApi = (item: ApiRecord): AttendanceRecord => ({
  id: String(item.id ?? ""),
  labourId: String(item.labour_id ?? ""),
  date: String(item.date ?? ""),
  status: (item.status as AttendanceRecord["status"]) ?? "Present",
  reason: item.reason ? String(item.reason) : undefined,
});

export const mapSalaryPaymentFromApi = (item: ApiRecord): SalaryPayment => ({
  id: String(item.id ?? ""),
  labourId: String(item.labour_id ?? ""),
  date: String(item.date ?? ""),
  amountCalculated: toNumber(item.amount_calculated ?? 0),
  advanceDeducted: toNumber(item.advance_deducted ?? 0),
  bonus: toNumber(item.bonus ?? 0),
  netPaid: toNumber(item.net_paid ?? 0),
  status: (item.status as SalaryPayment["status"]) ?? "Pending",
  salaryOption: (item.salary_option as SalaryPayment["salaryOption"]) ?? "Deduct",
  deductAmountRequested: item.deduct_amount_requested != null ? toNumber(item.deduct_amount_requested) : undefined,
});

export const mapFuelFromApi = (item: ApiRecord): FuelEntry => ({
  id: String(item.id ?? ""),
  dateTime: item.date_time ? String(item.date_time) : undefined,
  vehicleName: item.vehicle_name ? String(item.vehicle_name) : undefined,
  fuelType: item.fuel_type ? String(item.fuel_type) : undefined,
  perLiterCost: item.per_liter_cost != null ? toNumber(item.per_liter_cost) : undefined,
  liters: item.liters != null ? toNumber(item.liters) : undefined,
  totalAmount: item.total_amount != null ? toNumber(item.total_amount) : undefined,
  vehicleId: item.vehicle_id ? String(item.vehicle_id) : undefined,
  date: item.date ? String(item.date) : undefined,
  cost: item.cost != null ? toNumber(item.cost) : undefined,
  currentOdometer: item.current_odometer != null ? toNumber(item.current_odometer) : undefined,
});

export const mapTripFromApi = (item: ApiRecord): TripRecord => ({
  id: String(item.id ?? ""),
  vehicleId: String(item.vehicle_id ?? ""),
  date: String(item.date ?? ""),
  startLocation: String(item.start_location ?? ""),
  endLocation: String(item.end_location ?? ""),
  distanceCovered: toNumber(item.distance_covered ?? 0),
  revenueEarned: toNumber(item.revenue_earned ?? 0),
});

export const mapExpenseFromApi = (item: ApiRecord): FamilyExpense => ({
  id: String(item.id ?? ""),
  familyMemberName: item.family_member_name ? String(item.family_member_name) : undefined,
  memberId: item.member_id ? String(item.member_id) : undefined,
  date: String(item.date ?? ""),
  reason: item.reason ? String(item.reason) : undefined,
  category: item.category ? String(item.category) : undefined,
  amount: toNumber(item.amount ?? 0),
  description: item.description ? String(item.description) : undefined,
});

export const mapCategoryBudgetFromApi = (item: ApiRecord): CategoryBudget => ({
  category: String(item.category ?? ""),
  limit: toNumber(item.limit ?? 0),
  spent: toNumber(item.spent ?? 0),
});

export const mapDocumentFromApi = (item: ApiRecord): ManagedDocument => ({
  id: String(item.id ?? ""),
  name: String(item.name ?? ""),
  type: String(item.type ?? "Salary Record") as ManagedDocument["type"],
  ownerName: String(item.owner_name ?? ""),
  uploadDate: String(item.upload_date ?? ""),
  fileSize: String(item.file_size ?? ""),
  expiryDate: item.expiry_date ? String(item.expiry_date) : undefined,
  status: (item.status as ManagedDocument["status"]) ?? "Active",
});

export const mapNotificationFromApi = (item: ApiRecord): AppNotification => ({
  id: String(item.id ?? ""),
  title: String(item.title ?? ""),
  body: String(item.body ?? ""),
  date: String(item.date ?? ""),
  type: (item.type as AppNotification["type"]) ?? "budget",
  isRead: Boolean(item.is_read ?? false),
});

export const toLabourApiPayload = (labour: Labour) => ({
  id: labour.id,
  full_name: labour.fullName,
  gender: labour.gender ?? null,
  phone: labour.phone,
  skill_type: labour.skillType,
  daily_wage: labour.dailyWage,
  joining_date: labour.joiningDate,
  aadhaar_number: labour.aadhaarNumber,
  address: labour.address,
  emergency_contact: labour.emergencyContact,
  is_active: labour.isActive,
  is_freezed: labour.isFreezed ?? false,
  avatar_url: labour.avatarUrl ?? null,
  license_number: labour.licenseNumber ?? null,
  license_expiry_date: labour.licenseExpiryDate ?? null,
  salary_per_month: labour.salaryPerMonth ?? null,
  advance_entries: labour.advanceEntries ?? null,
  pdf_attachment_name: labour.pdfAttachmentName ?? null,
  profile_photo: labour.profilePhoto ?? null,
  profile_photo_name: labour.profilePhotoName ?? null,
  aadhaar_pdf_name: labour.aadhaarPdfName ?? null,
  aadhaar_pdf_data: labour.aadhaarPdfData ?? null,
  license_pdf_name: labour.licensePdfName ?? null,
  license_pdf_data: labour.licensePdfData ?? null,
  custom_documents: labour.customDocuments ?? null,
});

export const toVehicleApiPayload = (vehicle: Vehicle) => ({
  id: vehicle.id,
  vehicle_name: vehicle.vehicleName ?? null,
  vehicle_type: vehicle.vehicleType,
  brand: vehicle.brand,
  model: vehicle.model,
  registration_date: vehicle.registrationDate ?? null,
  insurance_expiry: vehicle.insuranceExpiry,
  fitness_expiry: vehicle.fitnessExpiry ?? null,
  pollution_expiry: vehicle.pollutionExpiry,
  driver_name: vehicle.driverName ?? null,
  rc_expiry: vehicle.rcExpiry ?? null,
  insurance_number: vehicle.insuranceNumber ?? null,
  next_service_due: vehicle.nextServiceDue ?? null,
  rc_book_pdf: vehicle.rcBookPdf ?? null,
  insurance_pdf: vehicle.insurancePdf ?? null,
  permit_pdf: vehicle.permitPdf ?? null,
  fitness_pdf: vehicle.fitnessPdf ?? null,
  rc_book_data: vehicle.rcBookData ?? null,
  insurance_data: vehicle.insuranceData ?? null,
  permit_data: vehicle.permitData ?? null,
  fitness_data: vehicle.fitnessData ?? null,
});

export const toBitApiPayload = (bit: BitEntry) => ({
  id: bit.id,
  bit_no: bit.bitNo,
  brand: bit.brand,
  size_mm: bit.sizeMm,
  button_size_mm: bit.buttonSizeMm ?? null,
  date_entry: bit.dateEntry ?? null,
  rate: bit.rate,
});

export const toBusinessBillApiPayload = (bill: BusinessBill) => ({
  id: bill.id,
  invoice_no: bill.invoiceNo,
  client_name: bill.clientName,
  bill_date: bill.billDate,
  due_date: bill.dueDate,
  description: bill.description,
  amount: bill.amount,
  tax_rate: bill.taxRate,
  status: bill.status,
  borewell_type: bill.borewellType ?? null,
  bill_mode: bill.billMode ?? null,
  existing_depth: bill.existingDepth ?? null,
  final_depth: bill.finalDepth ?? null,
  casing_feet: bill.casingFeet ?? null,
  casing_rate: bill.casingRate ?? null,
  batta: bill.batta ?? null,
  starting_price: bill.startingPrice ?? null,
  old_feet_rate: bill.oldFeetRate ?? null,
  casing_type: bill.casingType ?? null,
  calculated_breakdown: bill.calculatedBreakdown ?? null,
  total_drilling_charges: bill.totalDrillingCharges ?? null,
  casing_charges: bill.casingCharges ?? null,
  is_custom_bill: bill.isCustomBill ?? null,
  location: bill.location ?? null,
  broker_name: bill.brokerName ?? null,
  custom_date_type: bill.customDateType ?? null,
  custom_starting_feet: bill.customStartingFeet ?? null,
  custom_ending_feet: bill.customEndingFeet ?? null,
  casing10_feet: bill.casing10Feet ?? null,
  casing10_rate: bill.casing10Rate ?? null,
  casing7_feet: bill.casing7Feet ?? null,
  casing7_rate: bill.casing7Rate ?? null,
  custom_slab_rates: bill.customSlabRates ?? null,
  discount_amount: bill.discountAmount ?? null,
  bit_id: bill.usedBitId ?? null,
  hammer_id: bill.usedHammerId ?? null,
});

export const toLoanGivenApiPayload = (loan: LoanGiven) => ({
  id: loan.id,
  borrower_name: loan.borrowerName ?? null,
  person_name: loan.personName ?? null,
  mobile_number: loan.mobileNumber ?? null,
  address: loan.address ?? null,
  loan_amount: loan.loanAmount ?? loan.amountGiven ?? null,
  amount_given: loan.amountGiven ?? loan.loanAmount ?? null,
  interest_rate: loan.interestRate ?? null,
  interest_percentage: loan.interestPercentage ?? null,
  start_date: loan.startDate ?? null,
  end_date: loan.endDate ?? null,
  emi_amount: loan.emiAmount ?? null,
  due_date: loan.dueDate ?? null,
  total_paid: loan.totalPaid ?? null,
  is_defaulter: loan.isDefaulter ?? null,
  interest_type: loan.interestType ?? null,
  category: loan.category ?? null,
  status: loan.status ?? null,
  monthly_interests: loan.monthlyInterests ?? null,
});

export const toLoanReceivedApiPayload = (loan: LoanReceived) => ({
  id: loan.id,
  lender_name: loan.lenderName ?? null,
  person_name: loan.personName ?? null,
  my_name: loan.myName ?? null,
  borrowed_amount: loan.borrowedAmount ?? loan.amount ?? null,
  amount: loan.amount ?? loan.borrowedAmount ?? null,
  interest_rate: loan.interestRate ?? null,
  interest_percentage: loan.interestPercentage ?? null,
  start_date: loan.startDate ?? null,
  end_date: loan.endDate ?? null,
  monthly_emi: loan.monthlyEMI ?? null,
  due_date: loan.dueDate ?? null,
  total_repaid: loan.totalRepaid ?? null,
  interest_type: loan.interestType ?? null,
  interest_status: loan.interestStatus ?? null,
  category: loan.category ?? null,
  status: loan.status ?? null,
  vehicle_id: loan.vehicleId ?? null,
  number_of_months: loan.numberOfMonths ?? null,
  monthly_interests: loan.monthlyInterests ?? null,
});

export const toExpenseApiPayload = (expense: FamilyExpense) => ({
  id: expense.id,
  family_member_name: expense.familyMemberName ?? null,
  member_id: expense.memberId ?? null,
  date: expense.date,
  reason: expense.reason ?? null,
  category: expense.category ?? null,
  amount: expense.amount,
  description: expense.description ?? null,
});

export const toCategoryBudgetApiPayload = (budget: CategoryBudget) => ({
  category: budget.category,
  limit: budget.limit,
  spent: budget.spent,
});

export const toDocumentApiPayload = (document: ManagedDocument) => ({
  id: document.id,
  name: document.name,
  type: document.type,
  owner_name: document.ownerName,
  upload_date: document.uploadDate,
  file_size: document.fileSize,
  expiry_date: document.expiryDate ?? null,
  status: document.status,
});

export const toNotificationApiPayload = (notification: AppNotification) => ({
  id: notification.id,
  title: notification.title,
  body: notification.body,
  date: notification.date,
  type: notification.type,
  is_read: notification.isRead,
});

export const toSalaryPaymentApiPayload = (payment: SalaryPayment) => ({
  id: payment.id,
  labour_id: payment.labourId,
  date: payment.date,
  amount_calculated: payment.amountCalculated,
  advance_deducted: payment.advanceDeducted,
  bonus: payment.bonus,
  net_paid: payment.netPaid,
  status: payment.status,
  salary_option: payment.salaryOption,
  deduct_amount_requested: payment.deductAmountRequested ?? null,
});

export const fetchSharedSnapshot = async (apiBaseUrl: string) => {
  const [labours, attendance, salaryPayments, vehicles, bitEntries, businessBills, fuelEntries, trips, loansGiven, loansReceived, familyMembers, incomeEntries, familyExpenses, categoryBudgets, documents, notifications] = await Promise.all([
    requestJson(apiBaseUrl, "/api/v1/labours"),
    requestJson(apiBaseUrl, "/api/v1/labours/attendance"),
    requestJson(apiBaseUrl, "/api/v1/labours/salary-payments"),
    requestJson(apiBaseUrl, "/api/v1/vehicles"),
    requestJson(apiBaseUrl, "/api/v1/business/bits"),
    requestJson(apiBaseUrl, "/api/v1/business/bills"),
    requestJson(apiBaseUrl, "/api/v1/vehicles/fuel"),
    requestJson(apiBaseUrl, "/api/v1/vehicles/trips"),
    requestJson(apiBaseUrl, "/api/v1/loans/given"),
    requestJson(apiBaseUrl, "/api/v1/loans/received"),
    requestJson(apiBaseUrl, "/api/v1/family-members"),
    requestJson(apiBaseUrl, "/api/v1/income"),
    requestJson(apiBaseUrl, "/api/v1/expenses"),
    requestJson(apiBaseUrl, "/api/v1/category-budgets"),
    requestJson(apiBaseUrl, "/api/v1/documents"),
    requestJson(apiBaseUrl, "/api/v1/notifications"),
  ]);

  return {
    labours: Array.isArray(labours) ? labours.map(mapLabourFromApi) : [],
    attendance: Array.isArray(attendance) ? attendance.map(mapAttendanceFromApi) : [],
    salaryPayments: Array.isArray(salaryPayments) ? salaryPayments.map(mapSalaryPaymentFromApi) : [],
    vehicles: Array.isArray(vehicles) ? vehicles.map(mapVehicleFromApi) : [],
    bitEntries: Array.isArray(bitEntries) ? bitEntries.map(mapBitFromApi) : [],
    businessBills: Array.isArray(businessBills) ? businessBills.map(mapBusinessBillFromApi) : [],
    fuelEntries: Array.isArray(fuelEntries) ? fuelEntries.map(mapFuelFromApi) : [],
    trips: Array.isArray(trips) ? trips.map(mapTripFromApi) : [],
    loansGiven: Array.isArray(loansGiven) ? loansGiven.map(mapLoanGivenFromApi) : [],
    loansReceived: Array.isArray(loansReceived) ? loansReceived.map(mapLoanReceivedFromApi) : [],
    familyMembers: Array.isArray(familyMembers) ? familyMembers.map(mapFamilyMemberFromApi) : [],
    incomeEntries: Array.isArray(incomeEntries) ? incomeEntries.map(mapIncomeFromApi) : [],
    familyExpenses: Array.isArray(familyExpenses) ? familyExpenses.map(mapExpenseFromApi) : [],
    categoryBudgets: Array.isArray(categoryBudgets) ? categoryBudgets.map(mapCategoryBudgetFromApi) : [],
    documents: Array.isArray(documents) ? documents.map(mapDocumentFromApi) : [],
    notifications: Array.isArray(notifications) ? notifications.map(mapNotificationFromApi) : [],
  };
};

export { requestJson };
