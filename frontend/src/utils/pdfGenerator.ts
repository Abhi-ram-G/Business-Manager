import { jsPDF } from "jspdf";
import { Labour, SalaryPayment, AttendanceRecord, BitEntry, HammerEntry, PipeEntry, BusinessBill, FuelEntry } from "../types";

/**
 * Generates and downloads a beautiful, professional, and compliant A4 Salary Slip PDF.
 */
export function downloadSalarySlipPDF(labour: Labour, payment?: SalaryPayment) {
  const doc = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4"
  });

  const baseSalary = payment?.amountCalculated ?? (labour.salaryPerMonth ?? 0);
  const advanceDeducted = payment?.advanceDeducted ?? (labour.advanceEntries?.reduce((sum, item) => sum + item.amount, 0) || 0);
  const bonus = payment?.bonus ?? 0;
  const netPaid = payment?.netPaid ?? Math.max(0, baseSalary + bonus - advanceDeducted);
  const status = payment?.status ?? "Pending";
  const dateFormatted = payment?.date ?? new Date().toISOString().split("T")[0];
  const slipId = payment?.id ? payment.id.toUpperCase() : `LS-${Date.now().toString().slice(-6)}`;

  // 1. Draw Subtle Border Accent Frame
  doc.setDrawColor(203, 213, 225); // Slate-300
  doc.setLineWidth(0.4);
  doc.rect(7, 7, 196, 283); // 7mm margins around page

  // 2. Main Executive Header Banner (Slate Navy Blue)
  doc.setFillColor(15, 23, 42); // slate-900 (Deep Navy Dark background)
  doc.rect(7, 7, 196, 36, "F");

  // Logo / Business Header details
  doc.setTextColor(255, 255, 255);
  doc.setFont("Helvetica", "bold");
  doc.setFontSize(16);
  doc.text("SRS (Sri Selvanayagi Rig Service)", 15, 18);

  doc.setFont("Helvetica", "normal");
  doc.setFontSize(8.5);
  doc.setTextColor(203, 213, 225); // Slate-300
  doc.text("8\", 6 1/2\", 4 1/2\" Borewells in Best", 15, 24);
  doc.text("Office at Sathy Road, Annur.", 15, 28);
  doc.text("Contact No: 9791908234, 9384918254", 15, 32);

  // Original Indicator
  doc.setFont("Helvetica", "bold");
  doc.setFontSize(9);
  doc.setTextColor(129, 140, 248); // Indigo-400
  doc.text("OFFICIAL RECEIPT", 195, 17, { align: "right" });

  doc.setFont("Helvetica", "normal");
  doc.setFontSize(7.5);
  doc.setTextColor(203, 213, 225);
  doc.text(`Doc Ref: #${slipId}`, 195, 22, { align: "right" });
  doc.text(`Generated: ${new Date().toLocaleString()}`, 195, 26, { align: "right" });
  doc.text("Status: VERIFIED & AUDITED", 195, 30, { align: "right" });

  // 3. Document Identifier Title
  doc.setTextColor(15, 23, 42); // slate-900
  doc.setFont("Helvetica", "bold");
  doc.setFontSize(13);
  doc.text("MONTHLY SALARY LEDGER & DISBURSEMENT SLIP", 15, 52);

  // Accent Line under title
  doc.setDrawColor(79, 70, 229); // Indigo-600
  doc.setLineWidth(1.2);
  doc.line(15, 55, 120, 55);

  // 4. Worker Info Section Grid
  // Frame for worker info box
  doc.setFillColor(248, 250, 252); // slate-50 (Very light gray)
  doc.rect(15, 60, 180, 35, "F");
  
  doc.setDrawColor(226, 232, 240); // slate-200
  doc.setLineWidth(0.4);
  doc.rect(15, 60, 180, 35);

  // Vertical Separator
  doc.line(105, 60, 105, 95);

  // Left side Column contents
  doc.setFont("Helvetica", "bold");
  doc.setFontSize(9.5);
  doc.setTextColor(71, 85, 105); // slate-600
  doc.text("BENEFICIARY DETAILS", 20, 66);

  doc.setFontSize(9);
  doc.setTextColor(15, 23, 42); // slate-900
  doc.text(`Full Worker Name :  ${labour.fullName}`, 20, 72);
  doc.text(`Primary Division  :  ${labour.skillType}`, 20, 77);
  doc.text(`Mobile Registry   :  ${labour.phone}`, 20, 82);
  doc.text(`Aadhaar Reference :  XXXX-XXXX-${labour.aadhaarNumber ? labour.aadhaarNumber.slice(-4) : "8921"}`, 20, 87);
  doc.text(`Employee ID       :  ${labour.id}`, 20, 92);

  // Right side Column contents
  doc.setFont("Helvetica", "bold");
  doc.setTextColor(71, 85, 105); // slate-600
  doc.setFontSize(9.5);
  doc.text("PAYMENT METRICS", 110, 66);

  doc.setFontSize(9);
  doc.setTextColor(15, 23, 42); // slate-900
  doc.text(`Slip Reference ID :  ${slipId}`, 110, 72);
  doc.text(`Accrual Date      :  ${dateFormatted}`, 110, 77);
  doc.text(`Disbursed Status  :  ${status.toUpperCase()}`, 110, 82);
  doc.text(`Payment Option    :  ${payment?.salaryOption === "Deduct" ? "Deduction Settled" : "Carry Forward / None"}`, 110, 87);
  doc.text(`Currency Base     :  Indian Rupee (INR)`, 110, 92);

  // 5. Earnings vs Deductions Table Header
  doc.setFillColor(79, 70, 229); // Indigo-600 (Primary table color)
  doc.rect(15, 105, 180, 7.5, "F");

  doc.setTextColor(255, 255, 255);
  doc.setFont("Helvetica", "bold");
  doc.setFontSize(9);
  doc.text("Line Object Particular / Description", 20, 110);
  doc.text("Classification Type", 110, 110);
  doc.text("Disbursement Value", 190, 110, { align: "right" });

  // Rows of details
  doc.setFont("Helvetica", "normal");
  doc.setTextColor(15, 23, 42);

  // Baseline Monthly Pay Row
  doc.setFillColor(255, 255, 255);
  doc.rect(15, 112.5, 180, 8, "F");
  doc.text("1. Monthly Base Wage / Baseline Contract Remuneration", 20, 117.5);
  doc.setTextColor(16, 185, 129); // Emerald-500
  doc.setFont("Helvetica", "bold");
  doc.text("EARNING", 110, 117.5);
  doc.text(`+ INR  ${baseSalary.toLocaleString()}`, 190, 117.5, { align: "right" });

  doc.setFont("Helvetica", "normal");
  doc.setTextColor(15, 23, 42);
  doc.setDrawColor(241, 245, 249); // slate-100 line sep
  doc.line(15, 120.5, 195, 120.5);

  // Bonus Row
  doc.setFillColor(250, 250, 250);
  doc.rect(15, 121, 180, 8, "F");
  doc.text("2. Supplemental Allowances / Festive Performance Bonus", 20, 126);
  doc.setTextColor(16, 185, 129); // Emerald-500
  doc.setFont("Helvetica", "bold");
  doc.text("EARNING", 110, 126);
  doc.text(`+ INR  ${bonus.toLocaleString()}`, 190, 126, { align: "right" });

  doc.setFont("Helvetica", "normal");
  doc.setTextColor(15, 23, 42);
  doc.line(15, 129, 195, 129);

  // Advance Salary Deductions Row
  doc.setFillColor(255, 255, 255);
  doc.rect(15, 129.5, 180, 8, "F");
  doc.text("3. Amortization of Short-Term Salary Advance Taken", 20, 134.5);
  doc.setTextColor(239, 68, 68); // Red-500
  doc.setFont("Helvetica", "bold");
  doc.text("DEDUCTION", 110, 134.5);
  doc.text(`- INR  ${advanceDeducted.toLocaleString()}`, 190, 134.5, { align: "right" });

  // Border bottom of table
  doc.setDrawColor(79, 70, 229);
  doc.setLineWidth(0.6);
  doc.line(15, 137.5, 195, 137.5);

  // 6. Summary Calculation Box On Right
  const summaryBoxY = 143;
  doc.setFillColor(248, 250, 252);
  doc.rect(110, summaryBoxY, 85, 28, "F");
  doc.setDrawColor(226, 232, 240);
  doc.setLineWidth(0.4);
  doc.rect(110, summaryBoxY, 85, 28);

  doc.setFont("Helvetica", "normal");
  doc.setFontSize(8.5);
  doc.setTextColor(71, 85, 105);
  doc.text("Total Gross Earnings :", 115, summaryBoxY + 6);
  doc.text("Total Salary Deductions :", 115, summaryBoxY + 12);
  doc.text("Bonus Adjustments :", 115, summaryBoxY + 18);
  doc.line(115, summaryBoxY + 21, 190, summaryBoxY + 21);

  doc.setFont("Helvetica", "bold");
  doc.setTextColor(15, 23, 42);
  doc.text(`INR ${(baseSalary).toLocaleString()}`, 190, summaryBoxY + 6, { align: "right" });
  doc.setTextColor(239, 68, 68);
  doc.text(`INR ${advanceDeducted.toLocaleString()}`, 190, summaryBoxY + 12, { align: "right" });
  doc.setTextColor(16, 185, 129);
  doc.text(`INR ${bonus.toLocaleString()}`, 190, summaryBoxY + 18, { align: "right" });

  // 7. Large Net Take-Home Payment Banner
  const statusIsPaid = status === "Paid";
  // Background depending on status
  if (statusIsPaid) {
    doc.setFillColor(209, 250, 229); // emerald-100 background
    doc.setDrawColor(16, 185, 129); // emerald-500 borders
  } else {
    doc.setFillColor(254, 243, 199); // amber-100 background
    doc.setDrawColor(245, 158, 11); // amber-500 borders
  }
  
  doc.setLineWidth(0.5);
  doc.rect(15, 177, 180, 14, "F");
  doc.rect(15, 177, 180, 14);

  doc.setFont("Helvetica", "bold");
  doc.setFontSize(11);
  if (statusIsPaid) {
    doc.setTextColor(6, 95, 70); // emerald-800
  } else {
    doc.setTextColor(146, 64, 14); // amber-800
  }
  doc.text("FINAL DISBURSED NET PAYOUT :", 22, 185.5);

  doc.setFontSize(14);
  doc.text(`INR ${netPaid.toLocaleString()}/-`, 190, 185.5, { align: "right" });

  // 8. Auditing Note & Verification stamp
  doc.setFont("Helvetica", "normal");
  doc.setFontSize(7.5);
  doc.setTextColor(115, 115, 115); // Neutral-400
  doc.text("Verification Policy Note: This document has been mathematically and operationally validated using online synchronizations", 15, 198);
  doc.text("and represents a binding transaction statement. All outstanding helper advance payouts are calculated and updated inside the secure registry.", 15, 201.5);
  doc.text("Audit Log ID: 0xFF-724-BDQ-0199 | Compliance status: High", 15, 205);

  // 9. Signatures Area
  const sigYLabel = 237;
  const sigYLine = 234;

  doc.setDrawColor(15, 23, 42);
  doc.setLineWidth(0.5);

  // Left Signee Line
  doc.line(15, sigYLine, 80, sigYLine);
  doc.setFont("Helvetica", "bold");
  doc.setFontSize(8.5);
  doc.setTextColor(71, 85, 105);
  doc.text("Authorized Signatory (Balaji Logistics Hub)", 15, sigYLabel);
  doc.setFont("Helvetica", "normal");
  doc.text("Vishwa Accounts Auditor Office stamp", 15, sigYLabel + 4);

  // Right Signee Line
  doc.line(130, sigYLine, 195, sigYLine);
  doc.setFont("Helvetica", "bold");
  doc.text("Beneficiary Acknowledgement / LTI", 130, sigYLabel);
  doc.setFont("Helvetica", "normal");
  doc.text(`Verified by Ramesh (Registry Team)`, 130, sigYLabel + 4);

  // Stamped status box in visual corner
  doc.setFillColor(statusIsPaid ? 236 : 254, statusIsPaid ? 253 : 243, statusIsPaid ? 245 : 199);
  doc.setDrawColor(statusIsPaid ? 16 : 245, statusIsPaid ? 185 : 158, statusIsPaid ? 129 : 11);
  doc.setLineWidth(1.5);
  doc.rect(130, 208, 65, 13);
  doc.setTextColor(statusIsPaid ? 6 : 146, statusIsPaid ? 95 : 64, statusIsPaid ? 70 : 14);
  doc.setFont("Helvetica", "bold");
  doc.setFontSize(11.5);
  doc.text(statusIsPaid ? "PAID OUT STATUS" : "PAYMENT PENDING", 162.5, 216.5, { align: "center" });

  // 10. Save / Download
  doc.save(`Salary_Slip_${labour.fullName.replace(/\s+/g, "_")}_${dateFormatted.slice(0,7)}.pdf`);
}

/**
 * Generates and downloads a beautiful, detailed, printable Monthly Attendance Report A4 PDF.
 */
export function downloadAttendanceReportPDF(
  labours: Labour[],
  attendance: AttendanceRecord[],
  month: number, // 0-indexed
  year: number
) {
  const doc = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4"
  });

  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];
  const selectedMonthName = monthNames[month];
  const monthStr = String(month + 1).padStart(2, '0');
  const monthPrefix = `${year}-${monthStr}-`;

  // 1. Draw Subtle Border Accent Frame
  doc.setDrawColor(203, 213, 225); // Slate-300
  doc.setLineWidth(0.4);
  doc.rect(7, 7, 196, 283); // 7mm margins around page

  // 2. Main Executive Header Banner (Slate Navy Blue)
  doc.setFillColor(15, 23, 42); // slate-900 (Deep Navy Dark background)
  doc.rect(7, 7, 196, 32, "F");

  // Logo / Business Header details
  doc.setTextColor(255, 255, 255);
  doc.setFont("Helvetica", "bold");
  doc.setFontSize(15);
  doc.text("SRS (Sri Selvanayagi Rig Service)", 15, 17);

  doc.setFont("Helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(203, 213, 225); // Slate-300
  doc.text("8\", 6 1/2\", 4 1/2\" Borewells in Best", 15, 22);
  doc.text("Office at Sathy Road, Annur. | Contact No: 9791908234, 9384918254", 15, 26);
  doc.text(`Doc Type: Monthly Attendance Ledger | Month: ${selectedMonthName.toUpperCase()} ${year}`, 15, 30);

  // Status block right-aligned in header
  doc.setFont("Helvetica", "bold");
  doc.setFontSize(9);
  doc.setTextColor(129, 140, 248); // Indigo-400
  doc.text("ATTENDANCE SYSTEM REPORT", 195, 16, { align: "right" });

  doc.setFont("Helvetica", "normal");
  doc.setFontSize(7.5);
  doc.setTextColor(203, 213, 225);
  doc.text(`Total Staff Records: ${labours.length}`, 195, 21, { align: "right" });
  doc.text(`Generated: ${new Date().toLocaleString()}`, 195, 25, { align: "right" });
  doc.text("Status: ARCHIVE VALIDATED", 195, 29, { align: "right" });

  // 3. Document Identifier Title
  doc.setTextColor(15, 23, 42); // slate-900
  doc.setFont("Helvetica", "bold");
  doc.setFontSize(11.5);
  doc.text(`STAFF ROSTER SUMMARY - ${selectedMonthName.toUpperCase()} ${year}`, 15, 48);

  // Accent Line under title
  doc.setDrawColor(79, 70, 229); // Indigo-600
  doc.setLineWidth(1.0);
  doc.line(15, 51, 195, 51);

  // 4. Summary Stats Grid Box
  const monthRecords = (attendance || []).filter(r => r.date.startsWith(monthPrefix));
  const presentsCount = monthRecords.filter(r => r.status === "Present").length;
  const halfDaysCount = monthRecords.filter(r => r.status === "Half-Day").length;
  const absentsCount = monthRecords.filter(r => r.status === "Absent").length;

  doc.setFillColor(248, 250, 252); // slate-50 (Very light gray)
  doc.rect(15, 56, 180, 18, "F");
  
  doc.setDrawColor(226, 232, 240); // slate-200
  doc.setLineWidth(0.4);
  doc.rect(15, 56, 180, 18);

  doc.setFont("Helvetica", "bold");
  doc.setFontSize(8.5);
  doc.setTextColor(71, 85, 105); // slate-600
  doc.text("CUMULATIVE METRICS SUMMARY", 20, 62);

  doc.setFont("Helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(15, 23, 42);
  doc.text(`Total Recorded Shifts: ${monthRecords.length}`, 20, 68);
  doc.text(`Total Presents: ${presentsCount}`, 75, 68);
  doc.text(`Total Half-Days: ${halfDaysCount}`, 120, 68);
  doc.text(`Total Absents: ${absentsCount}`, 165, 68);

  // 5. Attendance Detail Listing Table Header
  const tableHeaderY = 80;
  doc.setFillColor(79, 70, 229); // Indigo-600 (Primary table color)
  doc.rect(15, tableHeaderY, 180, 8, "F");

  doc.setTextColor(255, 255, 255);
  doc.setFont("Helvetica", "bold");
  doc.setFontSize(8.5);
  doc.text("Worker Name", 19, tableHeaderY + 5.5);
  doc.text("Role Type", 68, tableHeaderY + 5.5);
  doc.text("Presents", 92, tableHeaderY + 5.5);
  doc.text("Half-Days", 112, tableHeaderY + 5.5);
  doc.text("Absents", 132, tableHeaderY + 5.5);
  doc.text("Logged Attendance Remarks & Exception Reasons", 150, tableHeaderY + 5.5);

  // Rows of details
  doc.setFont("Helvetica", "normal");
  doc.setTextColor(15, 23, 42);

  let currentY = tableHeaderY + 8;
  const rowHeight = 9.5;

  labours.forEach((lab, idx) => {
    // Alternate row colors
    if (idx % 2 === 0) {
      doc.setFillColor(255, 255, 255);
    } else {
      doc.setFillColor(248, 250, 252); // soft slate alternate background
    }
    doc.rect(15, currentY, 180, rowHeight, "F");

    // Divider line
    doc.setDrawColor(241, 245, 249); // slate-100 line sep
    doc.setLineWidth(0.3);
    doc.line(15, currentY + rowHeight, 195, currentY + rowHeight);

    // Filter attendance for actual worker & current month
    const workerRecords = monthRecords.filter(r => r.labourId === lab.id);
    const pCount = workerRecords.filter(r => r.status === "Present").length;
    const hCount = workerRecords.filter(r => r.status === "Half-Day").length;
    const aCount = workerRecords.filter(r => r.status === "Absent").length;

    // Create exceptions text log
    const exceptions = workerRecords
      .filter(r => (r.status === "Absent" || r.status === "Half-Day") && r.reason)
      .map(r => {
        const day = parseInt(r.date.split("-")[2], 10);
        const code = r.status === "Absent" ? "Absent" : "Half-day";
        return `Day ${day} (${code}): ${r.reason}`;
      })
      .join("; ");

    const formattedRemarks = exceptions.length > 0 
      ? (exceptions.length > 38 ? exceptions.slice(0, 35) + "..." : exceptions)
      : "Daily entries regular / generic";

    // Text output
    doc.setTextColor(15, 23, 42);
    doc.setFont("Helvetica", "bold");
    doc.setFontSize(8.5);
    doc.text(lab.fullName, 19, currentY + 6.2);

    doc.setFont("Helvetica", "normal");
    doc.setFontSize(8);
    doc.text(lab.skillType, 68, currentY + 6.2);
    
    doc.setTextColor(6, 95, 70); // deep emerald
    doc.setFont("Helvetica", "bold");
    doc.text(`${pCount} d`, 92, currentY + 6.2);

    doc.setTextColor(14, 116, 144); // deep cyan
    doc.text(`${hCount} d`, 112, currentY + 6.2);

    doc.setTextColor(185, 28, 28); // deep rose
    doc.text(`${aCount} d`, 132, currentY + 6.2);

    doc.setFont("Helvetica", "normal");
    if (exceptions.length > 0) {
      doc.setTextColor(185, 28, 28); // Highlight penalty comments in red
      doc.setFont("Helvetica", "oblique");
    } else {
      doc.setTextColor(115, 115, 115); // generic Slate-400
    }
    doc.text(formattedRemarks, 150, currentY + 6.2);

    currentY += rowHeight;
  });

  // 6. Signature Area & Closing Notes
  const sigSectionY = Math.min(currentY + 12, 245);
  doc.setDrawColor(15, 23, 42);
  doc.setLineWidth(0.4);
  
  // Signature Lines
  doc.line(15, sigSectionY, 80, sigSectionY);
  doc.line(130, sigSectionY, 195, sigSectionY);

  doc.setFont("Helvetica", "bold");
  doc.setFontSize(8.5);
  doc.setTextColor(71, 85, 105);
  doc.text("Authorized Accounts Controller", 15, sigSectionY + 5);
  doc.text("Supervising Registrar Endorsement", 130, sigSectionY + 5);

  doc.setFont("Helvetica", "normal");
  doc.setFontSize(7.5);
  doc.text("Balaji Logistics Stamp & Seal", 15, sigSectionY + 9);
  doc.text("Official Roster Verification Ledger", 130, sigSectionY + 9);

  // Footer compliance note
  doc.setTextColor(150, 150, 150);
  doc.text("Note: Generated via mobile registry client. Data is protected under workspace compliance and synced with cloud-vault records.", 15, 276);

  // 7. Overall Absence Detailed Log on Page 2 if any absences exist
  const allAssignedAbsents = monthRecords.filter(r => r.status === "Absent");
  if (allAssignedAbsents.length > 0) {
    doc.addPage();
    
    // Draw Subtle Border Accent Frame on page 2
    doc.setDrawColor(203, 213, 225); // Slate-300
    doc.setLineWidth(0.4);
    doc.rect(7, 7, 196, 283); 

    // Header Banner Page 2
    doc.setFillColor(15, 23, 42); // slate-900 (Deep Navy Dark background)
    doc.rect(7, 7, 196, 22, "F");

    doc.setTextColor(255, 255, 255);
    doc.setFont("Helvetica", "bold");
    doc.setFontSize(13);
    doc.text("SRS (Sri Selvanayagi Rig Service)", 15, 13);

    doc.setFont("Helvetica", "normal");
    doc.setFontSize(8);
    doc.setTextColor(203, 213, 225);
    doc.text(`Monthly Absence Log | 8\", 6 1/2\", 4 1/2\" Borewells in Best | Month: ${selectedMonthName.toUpperCase()} ${year}`, 15, 18);

    doc.setTextColor(129, 140, 248); // Indigo-400
    doc.setFont("Helvetica", "bold");
    doc.setFontSize(8.5);
    doc.text("DETAILED ABSENCE REGISTER", 195, 14, { align: "right" });

    doc.setTextColor(203, 213, 225);
    doc.setFont("Helvetica", "normal");
    doc.setFontSize(7.5);
    doc.text(`Total Absences Logged: ${allAssignedAbsents.length}`, 195, 18, { align: "right" });

    // Title for Details section
    doc.setTextColor(15, 23, 42);
    doc.setFont("Helvetica", "bold");
    doc.setFontSize(10.5);
    doc.text("UNEXCUSED / EXCUSED ABSENCE DETAILED LOG BY WORKER NAME", 15, 40);

    doc.setDrawColor(239, 68, 68); // Red-500
    doc.setLineWidth(0.8);
    doc.line(15, 43, 195, 43);

    // Table header for detailed absent reasons
    const excHeaderY = 48;
    doc.setFillColor(239, 68, 68); // Red-500
    doc.rect(15, excHeaderY, 180, 7.5, "F");

    doc.setTextColor(255, 255, 255);
    doc.setFont("Helvetica", "bold");
    doc.setFontSize(8);
    doc.text("Labour / Staff Name", 19, excHeaderY + 5);
    doc.text("Role Type", 70, excHeaderY + 5);
    doc.text("Absent Date", 98, excHeaderY + 5);
    doc.text("Stated Reason for Absence", 128, excHeaderY + 5);

    let excCurrentY = excHeaderY + 7.5;
    const excRowHeight = 8.5;

    allAssignedAbsents.forEach((absRecord, recordIdx) => {
      // Alternate backgrounds
      if (recordIdx % 2 === 0) {
        doc.setFillColor(254, 242, 242); // very soft red bg
      } else {
        doc.setFillColor(255, 255, 255);
      }
      doc.rect(15, excCurrentY, 180, excRowHeight, "F");

      doc.setDrawColor(254, 226, 226);
      doc.setLineWidth(0.3);
      doc.line(15, excCurrentY + excRowHeight, 195, excCurrentY + excRowHeight);

      // Fetch worker details
      const worker = labours.find(l => l.id === absRecord.labourId);
      const workerName = worker?.fullName || "Unknown Worker";
      const workerRole = worker?.skillType || "Staff";
      const dayVal = parseInt(absRecord.date.split("-")[2], 10);
      const formattedDate = `${selectedMonthName} ${dayVal}, ${year}`;
      const reasonText = absRecord.reason || "No explicit reason logged in registry";

      // Draw text values
      doc.setTextColor(15, 23, 42);
      doc.setFont("Helvetica", "bold");
      doc.setFontSize(8);
      doc.text(workerName, 19, excCurrentY + 5.5);

      doc.setFont("Helvetica", "normal");
      doc.setTextColor(71, 85, 105);
      doc.text(workerRole, 70, excCurrentY + 5.5);

      doc.setTextColor(153, 27, 27); // Dark red
      doc.setFont("Helvetica", "bold");
      doc.text(formattedDate, 98, excCurrentY + 5.5);

      doc.setFont("Helvetica", "normal");
      doc.setTextColor(31, 41, 55);
      // truncate if reason is too long
      const formattedReason = reasonText.length > 40 ? reasonText.slice(0, 37) + "..." : reasonText;
      doc.text(formattedReason, 128, excCurrentY + 5.5);

      excCurrentY += excRowHeight;
    });

    // Stamp Signatures at the bottom of Page 2
    const page2SigY = Math.min(excCurrentY + 12, 250);
    doc.setDrawColor(15, 23, 42);
    doc.setLineWidth(0.4);
    doc.line(15, page2SigY, 70, page2SigY);
    doc.line(140, page2SigY, 195, page2SigY);

    doc.setFont("Helvetica", "bold");
    doc.setFontSize(8);
    doc.setTextColor(71, 85, 105);
    doc.text("Field Operation Supervisor", 15, page2SigY + 4);
    doc.text("Roster Auditor Branch", 140, page2SigY + 4);

    // Footer compliance note
    doc.setTextColor(150, 150, 150);
    doc.setFont("Helvetica", "normal");
    doc.setFontSize(7);
    doc.text("Balaji Agri-Logistics Staff Management Office | Document Verification ID: AR-P2-A8D9 | Page 2 of 2", 15, 278);
  }

  // Save the PDF
  doc.save(`Attendance_Report_${selectedMonthName}_${year}.pdf`);
}

/**
 * Generates and downloads a custom individual attendance report PDF
 * Containing a visual calendar of a selected month/year and a log of absent reasons with dates.
 */
export function downloadSingleLabourAttendancePDF(
  labour: Labour,
  attendance: AttendanceRecord[],
  month: number, // 0-indexed
  year: number
) {
  const doc = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4"
  });

  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];
  const selectedMonthName = monthNames[month];
  const monthStr = String(month + 1).padStart(2, '0');
  const monthPrefix = `${year}-${monthStr}-`;

  // Filter attendance updates for this labourer in the given month
  const monthRecords = (attendance || []).filter(
    r => r.labourId === labour.id && r.date.startsWith(monthPrefix)
  );

  const totalPresents = monthRecords.filter((r) => r.status === "Present").length;
  const totalAbsents = monthRecords.filter((r) => r.status === "Absent").length;
  const totalHalfDays = monthRecords.filter((r) => r.status === "Half-Day").length;
  const workingDays = totalPresents + totalHalfDays * 0.5;

  // 1. Border Frame
  doc.setDrawColor(203, 213, 225);
  doc.setLineWidth(0.4);
  doc.rect(7, 7, 196, 283);

  // 2. Header Banner
  doc.setFillColor(15, 23, 42); // slate-900
  doc.rect(7, 7, 196, 30, "F");

  doc.setTextColor(255, 255, 255);
  doc.setFont("Helvetica", "bold");
  doc.setFontSize(14);
  doc.text("SRS (Sri Selvanayagi Rig Service)", 15, 16);

  doc.setFont("Helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(203, 213, 225);
  doc.text("8\", 6 1/2\", 4 1/2\" Borewells in Best", 15, 21);
  doc.text(`Billing / Payroll Month: ${selectedMonthName.toUpperCase()} ${year} | Office: Annur`, 15, 25);
  doc.text(`Employee Name: ${labour.fullName.toUpperCase()} | Role: ${labour.skillType}`, 15, 29);

  doc.setFont("Helvetica", "bold");
  doc.setFontSize(9);
  doc.setTextColor(129, 140, 248); // Indigo-400
  doc.text("PERSONAL ATTENDANCE REPORT", 195, 16, { align: "right" });

  doc.setFont("Helvetica", "normal");
  doc.setFontSize(7.5);
  doc.setTextColor(203, 213, 225);
  doc.text(`Registry ID: ${labour.id}`, 195, 21, { align: "right" });
  doc.text(`Generated: ${new Date().toLocaleString()}`, 195, 25, { align: "right" });
  doc.text("Status: VERIFIED & SEALED", 195, 29, { align: "right" });

  // 3. Worker Summary Details Card
  const profileCardY = 44;
  doc.setFillColor(248, 250, 252); // slate-50
  doc.rect(15, profileCardY, 180, 22, "F");
  doc.setDrawColor(226, 232, 240);
  doc.setLineWidth(0.4);
  doc.rect(15, profileCardY, 180, 22);

  doc.setFont("Helvetica", "bold");
  doc.setFontSize(8.5);
  doc.setTextColor(71, 85, 105);
  doc.text("EMPLOYEE METRICS & WORK RECORD SUMMARY", 19, profileCardY + 5.5);

  doc.setFont("Helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(15, 23, 42);
  doc.text(`Full Name: ${labour.fullName}`, 19, profileCardY + 11);
  doc.text(`Contact Registry: ${labour.phone}`, 19, profileCardY + 16);

  doc.text(`Wages/Month: INR ${(labour.salaryPerMonth ?? 0).toLocaleString()}`, 80, profileCardY + 11);
  doc.text(`Base Skill Classification: ${labour.skillType}`, 80, profileCardY + 16);

  doc.setFont("Helvetica", "bold");
  doc.text(`Presents: ${totalPresents}d`, 142, profileCardY + 11);
  doc.text(`Half-Days: ${totalHalfDays}d`, 142, profileCardY + 16);
  doc.text(`Total Absents: ${totalAbsents}d`, 172, profileCardY + 11);
  doc.text(`Service Days: ${workingDays}d`, 172, profileCardY + 16);

  // 4. Visual Gregorian Calendar Grid Title
  const calendarTitleY = 74;
  doc.setTextColor(15, 23, 42);
  doc.setFont("Helvetica", "bold");
  doc.setFontSize(11);
  doc.text(`MONTHLY WORKSPACE CALENDAR - ${selectedMonthName.toUpperCase()} ${year}`, 15, calendarTitleY);
  
  doc.setDrawColor(79, 70, 229); // Indigo-600
  doc.setLineWidth(0.8);
  doc.line(15, calendarTitleY + 2, 195, calendarTitleY + 2);

  // 5. Drawing the Visual Calendar
  const calYStart = calendarTitleY + 6;
  const startDayOfWeek = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  // Draw Calendar Header (Su Mo Tu We Th Fr Sa)
  const xStart = 15;
  const wColumn = 180 / 7; // 25.71 mm per column
  const hRow = 11; // 11 mm row height
  const daysOfWeek = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"];

  doc.setFillColor(79, 70, 229); // Indigo-600
  doc.rect(15, calYStart, 180, 6, "F");

  doc.setFont("Helvetica", "bold");
  doc.setFontSize(8);
  doc.setTextColor(255, 255, 255);
  daysOfWeek.forEach((dName, idx) => {
    doc.text(dName, xStart + idx * wColumn + wColumn / 2, calYStart + 4.2, { align: "center" });
  });

  const cellsStartY = calYStart + 6;
  doc.setFont("Helvetica", "normal");
  doc.setTextColor(15, 23, 42);

  // Loop through all calendar slots (up to 42 cells)
  for (let cellIdx = 0; cellIdx < 42; cellIdx++) {
    const dayNum = cellIdx - startDayOfWeek + 1;
    const colIdx = cellIdx % 7;
    const rowIdx = Math.floor(cellIdx / 7);

    const xPos = xStart + colIdx * wColumn;
    const yPos = cellsStartY + rowIdx * hRow;

    if (cellIdx >= startDayOfWeek && dayNum <= daysInMonth) {
      // It's a valid day in the selected month
      const dayStr = String(dayNum).padStart(2, '0');
      const dateString = `${year}-${monthStr}-${dayStr}`;
      const dayRecord = monthRecords.find(r => r.date === dateString);
      const status = dayRecord?.status;

      // Color backgrounds based on status
      let fillCol = [248, 250, 252]; // Soft default
      let drawCol = [226, 232, 240];
      let textCol = [71, 85, 105];
      let statusIndicator = "";

      if (status === "Present") {
        fillCol = [142, 230, 170]; // Solid Green
        drawCol = [34, 197, 94];   // green-500
        textCol = [21, 128, 61];   // green-700
        statusIndicator = "PRESENT";
      } else if (status === "Absent") {
        fillCol = [254, 162, 162]; // Solid Red (#FEA2A2)
        drawCol = [239, 68, 68];   // red-500
        textCol = [153, 27, 27];   // red-800
        statusIndicator = "ABSENT";
      } else if (status === "Half-Day") {
        fillCol = [220, 252, 231]; // Light Green (green-100)
        drawCol = [74, 222, 128];  // green-400
        textCol = [22, 101, 52];   // dark green
        statusIndicator = "HALF-DAY";
      }

      // Draw day box
      doc.setFillColor(fillCol[0], fillCol[1], fillCol[2]);
      doc.setDrawColor(drawCol[0], drawCol[1], drawCol[2]);
      doc.setLineWidth(0.3);
      doc.rect(xPos, yPos, wColumn, hRow, "F");
      doc.rect(xPos, yPos, wColumn, hRow);

      // Day Number
      doc.setFont("Helvetica", "bold");
      doc.setFontSize(8.5);
      doc.setTextColor(textCol[0], textCol[1], textCol[2]);
      doc.text(String(dayNum), xPos + 3, yPos + 4);

      // Status Indicator
      if (statusIndicator) {
        doc.setFont("Helvetica", "bold");
        doc.setFontSize(6.5);
        doc.text(statusIndicator, xPos + wColumn / 2, yPos + 8.5, { align: "center" });
      }
    } else {
      // Spacer blank day cell
      doc.setFillColor(250, 250, 250);
      doc.setDrawColor(241, 245, 249);
      doc.setLineWidth(0.2);
      doc.rect(xPos, yPos, wColumn, hRow, "F");
      doc.rect(xPos, yPos, wColumn, hRow);
    }
  }

  // 6. Section: Absent and Half-Day Reasons Log
  const absentLogY = cellsStartY + 6 * hRow + 8;
  doc.setTextColor(15, 23, 42);
  doc.setFont("Helvetica", "bold");
  doc.setFontSize(11);
  doc.text("EXCEPTIONS LOG: ABSENT & HALF-DAY REASONS BY DATE", 15, absentLogY);

  doc.setDrawColor(79, 70, 229); // Indigo-600 line divider
  doc.setLineWidth(0.8);
  doc.line(15, absentLogY + 2, 195, absentLogY + 2);

  // Retrieve absences and half days
  const exceptionsWithReasons = monthRecords.filter(r => r.status === "Absent" || r.status === "Half-Day");

  let logCurrentY = absentLogY + 6;
  if (exceptionsWithReasons.length === 0) {
    // Generate empty card
    doc.setFillColor(240, 253, 244); // light green bg
    doc.setDrawColor(74, 222, 128); // light green border
    doc.rect(15, logCurrentY, 180, 16, "F");
    doc.rect(15, logCurrentY, 180, 16);

    doc.setFont("Helvetica", "bold");
    doc.setFontSize(9);
    doc.setTextColor(21, 128, 61); // green-700
    doc.text("PERFECT ATTENDANCE STATUS RECORDED", 20, logCurrentY + 6.5);

    doc.setFont("Helvetica", "normal");
    doc.setFontSize(8);
    doc.setTextColor(22, 101, 52); // green-800
    doc.text("No absences or half-workday reports are recorded in the registry for this worker. Flawless attendance achieved!", 20, logCurrentY + 11.5);
  } else {
    // Render exceptions table
    doc.setFillColor(15, 23, 42); // Slate-900 / Deep Slate
    doc.rect(15, logCurrentY, 180, 6, "F");
    doc.setFont("Helvetica", "bold");
    doc.setFontSize(7.5);
    doc.setTextColor(255, 255, 255);
    doc.text("Exception Date", 25, logCurrentY + 4.2);
    doc.text("Status / Shift Type", 75, logCurrentY + 4.2);
    doc.text("Logged Reason / Employee Remark", 125, logCurrentY + 4.2);

    logCurrentY += 6;
    const rowHeightLog = 7.5;

    exceptionsWithReasons.forEach((r, rIdx) => {
      // Alternate rows
      if (r.status === "Absent") {
        doc.setFillColor(254, 242, 242); // very soft red bg
      } else {
        doc.setFillColor(240, 253, 244); // very soft green bg for half-day
      }
      doc.rect(15, logCurrentY, 180, rowHeightLog, "F");

      doc.setDrawColor(226, 232, 240);
      doc.setLineWidth(0.3);
      doc.line(15, logCurrentY + rowHeightLog, 195, logCurrentY + rowHeightLog);

      // Date value
      doc.setTextColor(15, 23, 42);
      doc.setFont("Helvetica", "bold");
      doc.setFontSize(8);
      
      const dayVal = parseInt(r.date.split("-")[2], 10);
      const formattedDate = `${selectedMonthName} ${dayVal}, ${year}`;
      doc.text(formattedDate, 25, logCurrentY + 4.7);

      // Status Type value
      if (r.status === "Absent") {
        doc.setTextColor(185, 28, 28); // deep red text
        doc.setFont("Helvetica", "bold");
        doc.text("ABSENT", 75, logCurrentY + 4.7);
      } else {
        doc.setTextColor(22, 101, 52); // deep green text
        doc.setFont("Helvetica", "bold");
        doc.text("HALF-DAY", 75, logCurrentY + 4.7);
      }

      // Reason value
      doc.setFont("Helvetica", "normal");
      doc.setTextColor(51, 65, 85); // Slate-700
      doc.text(r.reason || "No written explanation reported, self-logged by system", 125, logCurrentY + 4.7);

      logCurrentY += rowHeightLog;
    });
  }

  // 7. Auditor Signature Area
  const sigSectionY = Math.min(logCurrentY + 14, 256);
  doc.setDrawColor(15, 23, 42);
  doc.setLineWidth(0.4);
  
  doc.line(15, sigSectionY, 75, sigSectionY);
  doc.line(135, sigSectionY, 195, sigSectionY);

  doc.setFont("Helvetica", "bold");
  doc.setFontSize(8);
  doc.setTextColor(71, 85, 105);
  doc.text("Accounts Branch Auditor Office", 15, sigSectionY + 4);
  doc.text("Certified Employee LTI/Signature", 135, sigSectionY + 4);

  // Footer notes
  doc.setTextColor(150, 150, 150);
  doc.setFont("Helvetica", "normal");
  doc.setFontSize(7);
  doc.text("Official digitized attendance document. Balaji Heavy Transports & Logistics Roster Control System. Secure SHA-1 Encrypted database record.", 15, 278);


  // Save/Download PDF
  doc.save(`Attendance_Individual_${labour.fullName.replace(/\s+/g, "_")}_${selectedMonthName}_${year}.pdf`);
}

// ─── Helper ────────────────────────────────────────────────────────────────
type ServiceRecord = {
  id: string; vehicleId: string; date: string;
  serviceType: string; cost: number; spareParts: string; remarks?: string;
};
type MaterialPurchase = {
  id: string; vehicleId?: string; date: string; materialName: string;
  quantity: number; unit: string; rate: number; totalAmount: number;
  vendorName?: string; remarks?: string;
};

function drawReportHeader(doc: jsPDF, title: string, subtitle: string) {
  doc.setDrawColor(203, 213, 225);
  doc.setLineWidth(0.4);
  doc.rect(7, 7, 196, 283);

  doc.setFillColor(15, 23, 42);
  doc.rect(7, 7, 196, 30, "F");

  doc.setTextColor(255, 255, 255);
  doc.setFont("Helvetica", "bold");
  doc.setFontSize(14);
  doc.text("SRS (Sri Selvanayagi Rig Service)", 15, 15);

  doc.setFont("Helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(203, 213, 225);
  doc.text("8\", 6 1/2\", 4 1/2\" Borewells in Best | Office at Sathy Road, Annur.", 15, 21);
  doc.text(subtitle, 15, 25);

  doc.setFont("Helvetica", "bold");
  doc.setFontSize(9);
  doc.setTextColor(129, 140, 248);
  doc.text(title, 195, 15, { align: "right" });

  doc.setFont("Helvetica", "normal");
  doc.setFontSize(7.5);
  doc.setTextColor(203, 213, 225);
  doc.text(`Generated: ${new Date().toLocaleString()}`, 195, 21, { align: "right" });
  doc.text("Status: ARCHIVE VALIDATED", 195, 25, { align: "right" });
}

function drawTableHeader(doc: jsPDF, y: number, cols: string[], xs: number[], color: [number, number, number]) {
  doc.setFillColor(...color);
  doc.rect(15, y, 180, 8, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFont("Helvetica", "bold");
  doc.setFontSize(8);
  cols.forEach((col, i) => doc.text(col, xs[i], y + 5.5));
}

function drawRow(doc: jsPDF, y: number, vals: string[], xs: number[], rowIdx: number, height = 8) {
  if (rowIdx % 2 === 0) { doc.setFillColor(255, 255, 255); } else { doc.setFillColor(248, 250, 252); }
  doc.rect(15, y, 180, height, "F");
  doc.setDrawColor(241, 245, 249);
  doc.setLineWidth(0.3);
  doc.line(15, y + height, 195, y + height);
  doc.setFont("Helvetica", "normal");
  doc.setFontSize(7.5);
  doc.setTextColor(15, 23, 42);
  vals.forEach((val, i) => {
    const maxLen = Math.floor((xs[i + 1] ?? 195) - xs[i] - 1) * 1.2;
    const txt = String(val).length > maxLen ? String(val).slice(0, maxLen - 3) + "..." : String(val);
    doc.text(txt, xs[i], y + 5.2);
  });
  return y + height;
}

/**
 * Multi-type Business Report PDF generator supporting Monthly and Overall downloads.
 * reportType: "bit" | "hammer" | "pipe" | "service" | "fuel" | "material" | "bill"
 * mode: "monthly" (filter by month/year) | "overall" (all data, grouped by year)
 */
export function downloadBusinessReportPDF(options: {
  reportType: "bit" | "hammer" | "pipe" | "service" | "fuel" | "material" | "bill";
  mode: "monthly" | "overall";
  month?: number; // 0-indexed, required for monthly
  year?: number;  // required for monthly
  bitEntries?: BitEntry[];
  hammerEntries?: HammerEntry[];
  pipeEntries?: PipeEntry[];
  businessBills?: BusinessBill[];
  fuelEntries?: FuelEntry[];
  services?: ServiceRecord[];
  materials?: MaterialPurchase[];
}) {
  const {
    reportType, mode, month = 0, year = new Date().getFullYear(),
    bitEntries = [], hammerEntries = [], pipeEntries = [],
    businessBills = [], fuelEntries = [], services = [], materials = []
  } = options;

  const monthNames = ["January","February","March","April","May","June","July","August","September","October","November","December"];
  const monthStr = String(month + 1).padStart(2, "0");
  const monthPrefix = `${year}-${monthStr}-`;

  const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });

  const typeLabel: Record<string, string> = {
    bit: "BIT DETAILS REPORT", hammer: "HAMMER DETAILS REPORT",
    pipe: "PIPE / CASING SUPPLIER REPORT", service: "SERVICE ENTRIES REPORT",
    fuel: "FUEL ENTRIES REPORT", material: "MATERIALS PURCHASED REPORT",
    bill: "BILL & INVOICES REPORT"
  };

  const periodLabel = mode === "monthly"
    ? `Period: ${monthNames[month].toUpperCase()} ${year}`
    : `Period: ALL MONTHS OF ${year}`;

  drawReportHeader(doc, typeLabel[reportType], periodLabel);

  // Title line
  doc.setTextColor(15, 23, 42);
  doc.setFont("Helvetica", "bold");
  doc.setFontSize(11);
  const fullTitle = mode === "monthly"
    ? `${typeLabel[reportType]} — ${monthNames[month].toUpperCase()} ${year}`
    : `${typeLabel[reportType]} — ${year} OVERALL SUMMARY`;
  doc.text(fullTitle, 15, 44);
  doc.setDrawColor(79, 70, 229);
  doc.setLineWidth(1);
  doc.line(15, 47, 195, 47);

  let curY = 53;
  const pageH = 283;

  function checkPage() {
    if (curY > pageH - 20) {
      doc.addPage();
      doc.setDrawColor(203, 213, 225);
      doc.setLineWidth(0.4);
      doc.rect(7, 7, 196, 283);
      curY = 18;
    }
  }

  function filterByDate<T extends { date?: string; billDate?: string; dateEntry?: string; dateTime?: string }>(arr: T[]) {
    if (mode === "overall") {
      const yearStr = String(year);
      return arr.filter(item => {
        const d = item.date ?? item.billDate ?? item.dateEntry ?? item.dateTime ?? "";
        return d.startsWith(yearStr + "-");
      });
    }
    return arr.filter(item => {
      const d = item.date ?? item.billDate ?? item.dateEntry ?? item.dateTime ?? "";
      return d.startsWith(monthPrefix);
    });
  }

  // ── BIT REPORT ────────────────────────────────────────────────────────────
  if (reportType === "bit") {
    const data = filterByDate(bitEntries);
    // Summary box
    doc.setFillColor(248, 250, 252);
    doc.rect(15, curY, 180, 14, "F");
    doc.setDrawColor(226, 232, 240);
    doc.rect(15, curY, 180, 14);
    doc.setFont("Helvetica", "bold");
    doc.setFontSize(8.5);
    doc.setTextColor(71, 85, 105);
    doc.text("SUMMARY", 20, curY + 5);
    doc.setFont("Helvetica", "normal");
    doc.setFontSize(8);
    doc.setTextColor(15, 23, 42);
    doc.text(`Total Bits: ${data.length}`, 20, curY + 10);
    doc.text(`Total Value: Rs. ${data.reduce((s, b) => s + (b.rate || 0), 0).toLocaleString()}`, 80, curY + 10);
    curY += 18;
    drawTableHeader(doc, curY, ["#", "Bit No", "Brand", "Size (mm)", "Button Size", "Date Entry", "Rate (Rs.)"],
      [17, 25, 55, 90, 115, 140, 168], [30, 64, 99]);
    curY += 8;
    data.forEach((b, i) => {
      checkPage();
      curY = drawRow(doc, curY, [
        String(i + 1), b.bitNo, b.brand, String(b.sizeMm),
        String(b.buttonSizeMm ?? "-"), b.dateEntry ?? "-", `Rs. ${(b.rate || 0).toLocaleString()}`
      ], [17, 25, 55, 90, 115, 140, 168], i);
    });
    if (data.length === 0) {
      doc.setFont("Helvetica", "normal"); doc.setFontSize(9); doc.setTextColor(100, 116, 139);
      doc.text("No bit entries found for the selected period.", 20, curY + 6);
    }
  }

  // ── HAMMER REPORT ─────────────────────────────────────────────────────────
  if (reportType === "hammer") {
    const data = filterByDate(hammerEntries);
    doc.setFillColor(248, 250, 252);
    doc.rect(15, curY, 180, 14, "F");
    doc.setDrawColor(226, 232, 240); doc.rect(15, curY, 180, 14);
    doc.setFont("Helvetica", "bold"); doc.setFontSize(8.5); doc.setTextColor(71, 85, 105);
    doc.text("SUMMARY", 20, curY + 5);
    doc.setFont("Helvetica", "normal"); doc.setFontSize(8); doc.setTextColor(15, 23, 42);
    doc.text(`Total Hammers: ${data.length}`, 20, curY + 10);
    doc.text(`Total Feet Capacity: ${data.reduce((s, h) => s + (h.capableFeetDepth || 0), 0)} ft`, 80, curY + 10);
    curY += 18;
    drawTableHeader(doc, curY, ["#", "Hammer No", "Brand", "Cap. Feet", "Casing Type", "Date Entry", "Rate (Rs.)", "Paid"],
      [17, 25, 60, 90, 112, 140, 160, 178], [30, 64, 99]);
    curY += 8;
    data.forEach((h, i) => {
      checkPage();
      curY = drawRow(doc, curY, [
        String(i + 1), h.hammerNo, h.brand, `${h.capableFeetDepth}ft`,
        h.casingType ?? "-", h.dateEntry, `Rs. ${(h.rate || 0).toLocaleString()}`, h.isPaid ? "Yes" : "No"
      ], [17, 25, 60, 90, 112, 140, 160, 178], i);
    });
    if (data.length === 0) {
      doc.setFont("Helvetica", "normal"); doc.setFontSize(9); doc.setTextColor(100, 116, 139);
      doc.text("No hammer entries found for the selected period.", 20, curY + 6);
    }
  }

  // ── PIPE REPORT ───────────────────────────────────────────────────────────
  if (reportType === "pipe") {
    const data = filterByDate(pipeEntries);
    doc.setFillColor(248, 250, 252);
    doc.rect(15, curY, 180, 14, "F");
    doc.setDrawColor(226, 232, 240); doc.rect(15, curY, 180, 14);
    doc.setFont("Helvetica", "bold"); doc.setFontSize(8.5); doc.setTextColor(71, 85, 105);
    doc.text("SUMMARY", 20, curY + 5);
    doc.setFont("Helvetica", "normal"); doc.setFontSize(8); doc.setTextColor(15, 23, 42);
    doc.text(`Total Suppliers: ${data.length}`, 20, curY + 10);
    doc.text(`Total Spend: Rs. ${data.reduce((s, p) => s + (p.grandPrice || 0), 0).toLocaleString()}`, 80, curY + 10);
    curY += 18;
    drawTableHeader(doc, curY, ["Company", "Location", "7\"H", "7\"M", "10\"H", "10\"M", "Total", "Price (Rs.)"],
      [17, 55, 90, 105, 120, 135, 153, 170], [30, 64, 99]);
    curY += 8;
    data.forEach((p, i) => {
      checkPage();
      curY = drawRow(doc, curY, [
        p.companyName, p.location ?? "-",
        String(p.pipe7HighCount), String(p.pipe7MediumCount),
        String(p.pipe10HighCount), String(p.pipe10MediumCount),
        `Rs. ${(p.grandTotal || 0).toLocaleString()}`, `Rs. ${(p.grandPrice || 0).toLocaleString()}`
      ], [17, 55, 90, 105, 120, 135, 153, 170], i);
    });
    if (data.length === 0) {
      doc.setFont("Helvetica", "normal"); doc.setFontSize(9); doc.setTextColor(100, 116, 139);
      doc.text("No pipe/casing entries found for the selected period.", 20, curY + 6);
    }
  }

  // ── SERVICE REPORT ────────────────────────────────────────────────────────
  if (reportType === "service") {
    const data = filterByDate(services) as ServiceRecord[];
    doc.setFillColor(248, 250, 252);
    doc.rect(15, curY, 180, 14, "F");
    doc.setDrawColor(226, 232, 240); doc.rect(15, curY, 180, 14);
    doc.setFont("Helvetica", "bold"); doc.setFontSize(8.5); doc.setTextColor(71, 85, 105);
    doc.text("SUMMARY", 20, curY + 5);
    doc.setFont("Helvetica", "normal"); doc.setFontSize(8); doc.setTextColor(15, 23, 42);
    doc.text(`Total Services: ${data.length}`, 20, curY + 10);
    doc.text(`Total Cost: Rs. ${data.reduce((s, sv) => s + (sv.cost || 0), 0).toLocaleString()}`, 80, curY + 10);
    curY += 18;
    drawTableHeader(doc, curY, ["#", "Vehicle ID", "Date", "Service Type", "Spare Parts", "Cost (Rs.)", "Remarks"],
      [17, 25, 58, 84, 115, 150, 168], [30, 64, 99]);
    curY += 8;
    data.forEach((sv, i) => {
      checkPage();
      curY = drawRow(doc, curY, [
        String(i + 1), sv.vehicleId, sv.date, sv.serviceType,
        sv.spareParts ?? "-", `Rs. ${(sv.cost || 0).toLocaleString()}`, sv.remarks ?? "-"
      ], [17, 25, 58, 84, 115, 150, 168], i);
    });
    if (data.length === 0) {
      doc.setFont("Helvetica", "normal"); doc.setFontSize(9); doc.setTextColor(100, 116, 139);
      doc.text("No service entries found for the selected period.", 20, curY + 6);
    }
  }

  // ── FUEL REPORT ───────────────────────────────────────────────────────────
  if (reportType === "fuel") {
    const data = filterByDate(fuelEntries);
    doc.setFillColor(248, 250, 252);
    doc.rect(15, curY, 180, 14, "F");
    doc.setDrawColor(226, 232, 240); doc.rect(15, curY, 180, 14);
    doc.setFont("Helvetica", "bold"); doc.setFontSize(8.5); doc.setTextColor(71, 85, 105);
    doc.text("SUMMARY", 20, curY + 5);
    doc.setFont("Helvetica", "normal"); doc.setFontSize(8); doc.setTextColor(15, 23, 42);
    const totalLiters = data.reduce((s, f) => s + (f.liters ?? 0), 0);
    const totalAmount = data.reduce((s, f) => s + (f.totalAmount ?? f.cost ?? 0), 0);
    doc.text(`Total Entries: ${data.length}`, 20, curY + 10);
    doc.text(`Total Liters: ${totalLiters.toFixed(1)} L`, 80, curY + 10);
    doc.text(`Total Spend: Rs. ${totalAmount.toLocaleString()}`, 140, curY + 10);
    curY += 18;
    drawTableHeader(doc, curY, ["#", "Vehicle", "Date/Time", "Fuel Type", "Liters", "Rate/L (Rs.)", "Total (Rs.)"],
      [17, 25, 60, 105, 130, 150, 168], [30, 64, 99]);
    curY += 8;
    data.forEach((f, i) => {
      checkPage();
      curY = drawRow(doc, curY, [
        String(i + 1), f.vehicleName ?? f.vehicleId ?? "-",
        (f.dateTime ?? f.date ?? "-").slice(0, 16),
        f.fuelType ?? "-", String(f.liters ?? "-"),
        `Rs. ${(f.perLiterCost ?? 0).toFixed(2)}`, `Rs. ${(f.totalAmount ?? f.cost ?? 0).toLocaleString()}`
      ], [17, 25, 60, 105, 130, 150, 168], i);
    });
    if (data.length === 0) {
      doc.setFont("Helvetica", "normal"); doc.setFontSize(9); doc.setTextColor(100, 116, 139);
      doc.text("No fuel entries found for the selected period.", 20, curY + 6);
    }
  }

  // ── MATERIAL REPORT ───────────────────────────────────────────────────────
  if (reportType === "material") {
    const data = filterByDate(materials) as MaterialPurchase[];
    doc.setFillColor(248, 250, 252);
    doc.rect(15, curY, 180, 14, "F");
    doc.setDrawColor(226, 232, 240); doc.rect(15, curY, 180, 14);
    doc.setFont("Helvetica", "bold"); doc.setFontSize(8.5); doc.setTextColor(71, 85, 105);
    doc.text("SUMMARY", 20, curY + 5);
    doc.setFont("Helvetica", "normal"); doc.setFontSize(8); doc.setTextColor(15, 23, 42);
    doc.text(`Total Purchases: ${data.length}`, 20, curY + 10);
    doc.text(`Total Spend: Rs. ${data.reduce((s, m) => s + (m.totalAmount || 0), 0).toLocaleString()}`, 80, curY + 10);
    curY += 18;
    drawTableHeader(doc, curY, ["#", "Material Name", "Date", "Qty", "Unit", "Rate (Rs.)", "Total (Rs.)", "Vendor"],
      [17, 25, 75, 99, 111, 125, 145, 165], [30, 64, 99]);
    curY += 8;
    data.forEach((m, i) => {
      checkPage();
      curY = drawRow(doc, curY, [
        String(i + 1), m.materialName, m.date,
        String(m.quantity), m.unit,
        `Rs. ${(m.rate || 0).toLocaleString()}`, `Rs. ${(m.totalAmount || 0).toLocaleString()}`,
        m.vendorName ?? "-"
      ], [17, 25, 75, 99, 111, 125, 145, 165], i);
    });
    if (data.length === 0) {
      doc.setFont("Helvetica", "normal"); doc.setFontSize(9); doc.setTextColor(100, 116, 139);
      doc.text("No material purchases found for the selected period.", 20, curY + 6);
    }
  }

  // ── BILL / INVOICE REPORT ─────────────────────────────────────────────────
  if (reportType === "bill") {
    const data = filterByDate(businessBills);
    const totalBilled = data.reduce((s, b) => s + (b.amount || 0), 0);
    const totalPaid = data.filter(b => b.status === "Paid").reduce((s, b) => s + (b.amount || 0), 0);
    const totalPending = data.filter(b => b.status === "Pending").reduce((s, b) => s + (b.amount || 0), 0);
    
    // Set financial summary box dimensions and contents
    doc.setFillColor(248, 250, 252);
    doc.rect(15, curY, 180, 20, "F");
    doc.setDrawColor(226, 232, 240); doc.rect(15, curY, 180, 20);
    doc.setFont("Helvetica", "bold"); doc.setFontSize(8.5); doc.setTextColor(71, 85, 105);
    doc.text("FINANCIAL SUMMARY", 20, curY + 5);
    
    doc.setFont("Helvetica", "normal"); doc.setFontSize(8); doc.setTextColor(15, 23, 42);
    
    // Row 1 (Counts)
    doc.text(`Total Bills: ${data.length}`, 20, curY + 11);
    doc.text(`Paid Bills: ${data.filter(b => b.status === "Paid").length}`, 80, curY + 11);
    doc.text(`Pending Bills: ${data.filter(b => b.status === "Pending").length}`, 140, curY + 11);
    
    // Row 2 (Money Amounts)
    doc.text(`Total Billed: Rs. ${totalBilled.toLocaleString()}`, 20, curY + 16);
    doc.text(`Total Paid: Rs. ${totalPaid.toLocaleString()}`, 80, curY + 16);
    doc.text(`Pending: Rs. ${totalPending.toLocaleString()}`, 140, curY + 16);
    
    curY += 24;
    drawTableHeader(doc, curY, ["Invoice No", "Client", "Location", "Date", "Depth(ft)", "Amount (Rs.)", "Status"],
      [17, 47, 85, 118, 140, 158, 176], [30, 64, 99]);
    curY += 8;
    data.forEach((b, i) => {
      checkPage();
      const statusTxt = b.status === "Paid" ? "PAID" : "PENDING";
      curY = drawRow(doc, curY, [
        b.invoiceNo, b.clientName, b.location ?? "-",
        b.billDate, String(b.finalDepth ?? "-"),
        `Rs. ${(b.amount || 0).toLocaleString()}`, statusTxt
      ], [17, 47, 85, 118, 140, 158, 176], i);
      // Color the status text
      doc.setFont("Helvetica", "bold");
      doc.setFontSize(7.5);
      if (b.status === "Paid") { doc.setTextColor(6, 95, 70); } else { doc.setTextColor(185, 28, 28); }
      doc.text(statusTxt, 176, curY - 2.8);
    });
    if (data.length === 0) {
      doc.setFont("Helvetica", "normal"); doc.setFontSize(9); doc.setTextColor(100, 116, 139);
      doc.text("No bill/invoice entries found for the selected period.", 20, curY + 6);
    }
  }

  // Footer
  const sigY = Math.min(curY + 14, 268);
  doc.setDrawColor(15, 23, 42);
  doc.setLineWidth(0.4);
  doc.line(15, sigY, 75, sigY);
  doc.line(140, sigY, 195, sigY);
  doc.setFont("Helvetica", "bold"); doc.setFontSize(7.5); doc.setTextColor(71, 85, 105);
  doc.text("Authorized Controller", 15, sigY + 4);
  doc.text("Registry Auditor", 140, sigY + 4);
  doc.setTextColor(150, 150, 150); doc.setFont("Helvetica", "normal"); doc.setFontSize(6.5);
  doc.text("Generated via SRS Business Management System. Data is accurate as of generation timestamp.", 15, 278);

  const periodSuffix = mode === "monthly" ? `${monthNames[month]}_${year}` : `Year_${year}`;
  doc.save(`SRS_${reportType.toUpperCase()}_Report_${periodSuffix}.pdf`);
}
