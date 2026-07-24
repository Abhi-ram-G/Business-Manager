export const translationsDict: Record<string, Record<string, string>> = {
  en: {},
  ta: {
    // Navigation / Tabs / Modules
    "dashboard": "தகவல் பலகை",
    "business": "தொழில்",
    "finance": "நிதி நிலை",
    "expenses": "குடும்ப வரவு செலவு",
    "vault": "பாதுகாப்பான பெட்டகம்",
    "reminders": "நினைவூட்டல்கள்",
    "settings": "அமைப்பு அமைப்புகள்",
    "lock": "பூட்டு",
    "unlock": "செயலியைத் திற",
    "pin": "கடவுச்சொல் பின்",
    "enter_pin": "பின் எண்ணை உள்ளிடவும்",
    "checking_pin": "சரிபார்க்கப்படுகிறது...",
    
    // Main divisions
    "Management": "நிர்வாகம்",
    "Bill / Invoices": "பில்கள் / இன்வாய்ஸ்கள்",
    "Reports": "அறிக்கைகள்",
    "Labour Details": "பணியாளர்கள் விபரம்",
    "Bit Hammer Pipe": "பிட் சுத்தியல் பைப்",
    "Vehicles": "வாகனங்கள்",

    // Workforce / Labour
    "Labour": "பணியாளர்கள்",
    "Workforce": "பணியாளர்கள்",
    "Attendance": "வருகைப்பதிவு",
    "Salaries": "சம்பளம்",
    "Borewell Bills": "பில் விபரங்கள்",
    "Hammers": "சுத்தியல்",
    "Bits": "பிட்",
    "Pipes": "பைப்",
    "Services": "பராமரிப்பு",
    "Fuel Log": "எரிபொருள்",
    "Materials": "பொருட்கள்",
    "Drivers": "ஓட்டுநர்கள்",
    "Helpers": "உதவியாளர்கள்",
    "Workforce Roster": "பணியாளர்கள் பட்டியல்",
    "Add workforce": "பணியாளரைச் சேர்",
    "Add New Workforce": "புதிய பணியாளரைச் சேர்",
    
    // Core Actions / Buttons
    "Save": "சேமி",
    "Cancel": "ரத்து செய்",
    "Delete": "நீக்கு",
    "Add New": "புதிதாக சேர்",
    "Mark Paid": "பணம் செலுத்தப்பட்டது",
    "Make Unusable": "பயன்படுத்த முடியாதது",
    "Make Unused": "பயன்படுத்தப்படாதது",
    "Sell": "விற்பனை",
    "Sold Out": "விற்கப்பட்டது",
    "Paid": "செலுத்தப்பட்டது",
    "Pending": "நிலுவையில் உள்ளது",
    "Sold": "விற்கப்பட்டது",
    "Unused": "பயன்படுத்தப்படாதது",
    "Unusable": "பயன்படுத்த முடியாதது",
    "Edit": "தொகு",
    "Edit Bill": "பில்லைத் தொகு",
    "Edit Supplier": "சப்ளையரைத் தொகு",
    "Edit Bit": "பிட்டைத் தொகு",
    "Add Entry": "பதிவைச் சேர்",
    "Add Record": "பதிவைச் சேர்",
    "Add Labour": "பணியாளரைச் சேர்",
    "Add Vehicle": "வாகனத்தைச் சேர்",
    "Add Supplier": "சப்ளையரைச் சேர்",
    "Add Bit": "பிட்டைச் சேர்",
    "Add Fuel": "எரிபொருள் பதிவைச் சேர்",
    "Add Service": "பராமரிப்பு பதிவைச் சேர்",
    "Add Material": "பொருளைச் சேர்",
    "Add Bill": "பில்லைச் சேர்",
    "Close": "மூடு",
    "Confirm Delete": "நீக்குவதை உறுதிப்படுத்துக",
    "Add Repayment": "திருப்பிச் செலுத்துதலைச் சேர்",
    "Add Loan": "கடனைச் சேர்",
    "Add Income": "வருமானத்தைச் சேர்",
    "Add Expense": "செலவைச் சேர்",
    "Paid Status": "பணம் செலுத்தப்பட்ட நிலை",
    
    // Fields / Labels
    "Name": "பெயர்",
    "Skill/Role": "பணி/பொறுப்பு",
    "Daily Wage": "தினசரி கூலி",
    "Contact Cell": "கைபேசி எண்",
    "Status": "நிலை",
    "Vehicle No": "வண்டி எண்",
    "Driver Name": "ஓட்டுநர் பெயர்",
    "Date": "தேதி",
    "Liters": "லிட்டர்",
    "Amount": "தொகை",
    "Rate": "விகிதம்",
    "Repaid": "திருப்பிச் செலுத்தப்பட்டது",
    "Category": "வகை",
    "Member Name": "உறுப்பினர் பெயர்",
    "Source": "ஆதாரம்",
    "Total Amount": "மொத்த தொகை",
    "Pending Amount": "நிலுவைத் தொகை",
    "Date Purchased": "வாங்கிய தேதி",
    "Usage": "பயன்பாடு",
    "Size": "அளவு",
    "Button": "பட்டன்",
    "Cap": "அளவுத்திறன்",
    "Brand": "பிராண்ட்",
    "Location": "இடம்",
    "Invoice No": "பில் எண்",
    "Client": "வாடிக்கையாளர்",
    "Due": "தவணைத் தேதி",
    "Usage History": "பயன்பாட்டு வரலாறு",
    "Drilling Usage Records": "துளையிடும் பயன்பாட்டு பதிவுகள்",
    "Casing Usage Records": "கேசிங் பயன்பாட்டு பதிவுகள்",
    "No usage history recorded.": "பயன்பாட்டு வரலாறு எதுவும் இல்லை.",
    "Borewell Bill Details": "போர்வெல் பில் விவரங்கள்",
    "Select Driver": "ஓட்டுநரைத் தேர்ந்தெடுக்கவும்",
    "Select Helper": "உதவியாளரைத் தேர்ந்தெடுக்கவும்",
    "Enter Details": "விவரங்களை உள்ளிடவும்",
    "Select Member": "உறுப்பினரைத் தேர்ந்தெடுக்கவும்",
    "Select Category": "வகையைத் தேர்ந்தெடுக்கவும்",
    "Remarks": "குறிப்புகள்",
    "Expense History": "செலவு வரலாறு",
    "No expense entries in database.": "தரவுத்தளத்தில் செலவு பதிவுகள் எதுவும் இல்லை.",
    "Are you sure you want to delete this expense record?": "இந்த செலவுப் பதிவை நிச்சயமாக நீக்க விரும்புகிறீர்களா?",
    
    // Business Operations & Reports
    "Business Operational & Auditing Reports": "வணிக செயல்பாட்டு மற்றும் தணிக்கை அறிக்கைகள்",
    "This component is integrated inside the main business dashboard workspace registry.": "இந்த கூறு முக்கிய வணிக தகவல் பலகை பணியிட பதிவேட்டில் ஒருங்கிணைக்கப்பட்டுள்ளது.",
    
    // Finance / Debt
    "Loans Given (Lent)": "வழங்கிய கடன்கள்",
    "Loans Received (Borrowed)": "வாங்கிய கடன்கள்",
    "Vehicle Loans": "வாகனக் கடன்கள்",
    "Debt Portfolio Ledgers": "கடன் போர்ட்ஃபோலியோ பதிவேடுகள்",
    "Repayments Log": "திருப்பிச் செலுத்திய பதிவுகள்",
    "Interest Rate": "வட்டி விகிதம்",
    "Principal": "அசல்",
    "Outstanding": "நிலுவையில் உள்ளது",
    "Paid Interest": "செலுத்திய வட்டி",
    "Accrued Interest": "சேர்ந்த வட்டி",
    "Lent Portfolio": "வழங்கிய கடன்கள்",
    "Lending & Credit Desk": "கடன் மற்றும் வரவு மேசை",
    "Interest-Bearing Portfolios": "வட்டி போர்ட்ஃபோலியோக்கள்",
    "INTEREST ACCRUED": "வட்டி வருவாய்",
    "INTEREST SERVICED": "செலுத்தப்பட்ட வட்டி",
    "PENDING COLLECTIONS": "நிலுவையில் உள்ள வசூல்",
    "PENDING PAYMENTS": "நிலுவையில் உள்ள கொடுப்பனவுகள்",
    "Earned from lent funds": "வழங்கப்பட்ட கடன்களில் இருந்து வட்டி",
    "Paid to outside lenders": "வெளிப்புற கடனாளிகளுக்கு செலுத்தியது",
    "Receivables with interest": "வட்டியுடன் கூடிய வரவுகள்",
    "Payables with interest": "வட்டியுடன் கூடிய செலுத்த வேண்டியவை",
    
    // Family / Domestic
    "Family Expense Ledger": "குடும்ப செலவுப் பதிவேடு",
    "Income Ledger": "வருமான பதிவேடு",
    "Spent": "செலவிடப்பட்டது",
    "Earned": "சம்பாதித்தது",
    "Remaining": "மீதமுள்ளது",
    "Budget": "பட்ஜெட்",
    "Monthly Summary": "மாதாந்திர சுருக்கம்",
    "Category Summary": "வகை சுருக்கம்",
    "Family Pot Ledger": "குடும்ப சேமிப்புப் பதிவேடு",
    "TOTAL INCOME SOURCE": "மொத்த வருமான ஆதாரம்",
    "CUMULATIVE SPENT": "ஒட்டுமொத்த செலவு",
    "SAVINGS RATE": "சேமிப்பு விகிதம்",
    "MONTHLY OUTLAY": "மாதாந்திர செலவு",
    "Add Family Expense": "குடும்ப செலவைச் சேர்",
    "Add Income Entry": "வருமானப் பதிவைச் சேர்",
    "Income History": "வருமான வரலாறு",
    "No income entries in database.": "தரவுத்தளத்தில் வருமானப் பதிவுகள் எதுவும் இல்லை.",
    
    // Hammers & Bits Sublabels
    "EXTRA": "கூடுதல்",
    "EXTRA: %s FT": "கூடுதல்: %s அடி",
    "Enter Hammer Sale Record:": "சுத்தியல் விற்பனை பதிவை உள்ளிடவும்:",
    "Enter Bit Sale Record:": "பிட் விற்பனை பதிவை உள்ளிடவும்:",
    "Role: %s casing hammer": "பங்கு: %s கேசிங் சுத்தியல்",
    "Size: %s mm": "அளவு: %s மிமீ",
    "Button: %s mm": "பட்டன்: %s மிமீ",
    "Cap: %s ft": "அளவுத்திறன்: %s அடி",
    "Usage: %s / %s ft used": "பயன்பாடு: %s / %s அடி பயன்படுத்தப்பட்டது",

    // MobileFinance UI Translations
    "Amount Lent (Given)": "வழங்கிய கடன் (கொடுத்தது)",
    "Amount Got (Borrowed)": "வாங்கிய கடன் (பெற்றது)",
    "Total Given": "வழங்கிய மொத்த கடன்",
    "Interest Ret": "வட்டி வருவாய்",
    "Pending collect": "நிலுவை வசூல்",
    "Total Borrowed": "வாங்கிய மொத்த கடன்",
    "Vehicle Debt": "வாகனக் கடன்",
    "Active Lending List": "செயலில் உள்ள கடன் பட்டியல்",
    "Lend Out": "கடன் கொடு",
    "Modify Lending terms": "கடன் விதிமுறைகளை மாற்று",
    "Record Funds Given Out (Lel)": "வழங்கிய கடனைப் பதிவுசெய்",
    "BORROWER NAME": "கடன் வாங்கியவர் பெயர்",
    "AMOUNT LENT": "கடன் தொகை",
    "INTEREST TYPE": "வட்டி வகை",
    "flat amount": "நிலையான தொகை",
    "Percent": "சதவீதம்",
    "Flat": "நிலையான",
    "Daily": "தினசரி",
    "Monthly": "மாதாந்திர",
    "Yearly": "ஆண்டிற்கு",
    "Flat Amount Interest": "நிலையான வட்டித் தொகை",
    "Monthly Percentage Interest": "மாதாந்திர வட்டி சதவீதம்",
    "Interest Percentage (%)": "வட்டி சதவீதம் (%)",
    "INTEREST START DATE": "வட்டி தொடங்கும் தேதி",
    "EXPECTED DUE DATE": "எதிர்பார்க்கப்படும் தவணைத் தேதி",
    "COLLECTION STATUS": "வசூல் நிலை",
    "loan category": "கடன் வகை",
    "Active Borrowing List": "செயலில் உள்ள கடன் வாங்கிய பட்டியல்",
    "Lender Name": "கடன் கொடுத்தவர் பெயர்",
    "AMOUNT BORROWED": "வாங்கிய கடன் தொகை",
    "INTEREST PERCENTAGE (%)": "வட்டி சதவீதம் (%)",
    "PAYMENT STATUS": "கொடுப்பனவு நிலை",
    "INTEREST DUE DATE": "வட்டி தவணைத் தேதி",
    "Borrow Record": "கடன் வாங்கு",
    "Add new Borrowed Funds Record": "புதிய கடன் வாங்கிய பதிவைச் சேர்",
    "Active Vehicle Loan Book": "செயலில் உள்ள வாகனக் கடன் பதிவேடு",
    "Add Vehicle Loan": "வாகனக் கடனைச் சேர்",
    "Select Vehicle": "வாகனத்தைத் தேர்ந்தெடுக்கவும்",
    "LOAN PROVIDER": "கடன் வழங்கியவர்",
    "LOAN PRINCIPAL (₹)": "கடன் அசல் (₹)",
    "EMI INTEREST RATE (%)": "இஎம்ஐ வட்டி சதவீதம் (%)",
    "TENURE VALUE": "கால அளவு",
    "TENURE TYPE": "கால அளவு வகை",
    "Month": "மாதம்",
    "Year": "வருடம்",
    "MONTHLY EMI VALUE": "மாதாந்திர தவணைத் தொகை",
    "Accrued Int": "சேர்ந்த வட்டி",
    "Add Repay": "திரும்பச் செலுத்துதலைச் சேர்",
    "History": "வரலாறு",
    "EMI Details & Repayments Log": "இஎம்ஐ விவரங்கள் & திருப்பிச் செலுத்திய பதிவுகள்",
    "No repayments logged.": "திருப்பிச் செலுத்திய பதிவுகள் எதுவும் இல்லை.",
    "Repayment Date": "செலுத்திய தேதி",
    "Interest Component": "வட்டிப் பகுதி",
    "Principal Component": "அசல் பகுதி",
    "Total Repaid": "மொத்தம் செலுத்தப்பட்டது",
    "Add EMI Repayment Record": "இஎம்ஐ திருப்பிச் செலுத்தல் பதிவைச் சேர்",
  }
};

export const translateText = (text: string, lang?: "en" | "ta"): string => {
  if (!lang || lang !== "ta") return text;
  const cleaned = text.trim();
  
  // Try exact match
  if (translationsDict.ta[cleaned]) {
    return translationsDict.ta[cleaned];
  }
  
  // Try case-insensitive matching
  const lower = cleaned.toLowerCase();
  const foundKey = Object.keys(translationsDict.ta).find(k => k.toLowerCase() === lower);
  if (foundKey) {
    return translationsDict.ta[foundKey];
  }
  
  // String template parsing (e.g. "Size: 152 mm" or "Cap: 950 ft")
  if (cleaned.startsWith("Size: ") && cleaned.endsWith(" mm")) {
    const val = cleaned.replace("Size: ", "").replace(" mm", "");
    return translationsDict.ta["Size: %s mm"].replace("%s", val);
  }
  if (cleaned.startsWith("Button: ") && cleaned.endsWith(" mm")) {
    const val = cleaned.replace("Button: ", "").replace(" mm", "");
    return translationsDict.ta["Button: %s mm"].replace("%s", val);
  }
  if (cleaned.startsWith("Cap: ") && cleaned.endsWith(" ft")) {
    const val = cleaned.replace("Cap: ", "").replace(" ft", "");
    return translationsDict.ta["Cap: %s ft"].replace("%s", val);
  }
  if (cleaned.startsWith("Role: ") && cleaned.endsWith(" casing hammer")) {
    const val = cleaned.replace("Role: ", "").replace(" casing hammer", "");
    return translationsDict.ta["Role: %s casing hammer"].replace("%s", val);
  }
  if (cleaned.startsWith("EXTRA: ") && cleaned.endsWith(" FT")) {
    const val = cleaned.replace("EXTRA: ", "").replace(" FT", "");
    return translationsDict.ta["EXTRA: %s FT"].replace("%s", val);
  }
  if (cleaned.includes(" ft used") && cleaned.includes("Usage: ")) {
    // Usage: X / Y ft used
    const match = cleaned.match(/Usage:\s*(\d+)\s*\/\s*(\d+)\s*ft\s*used/);
    if (match) {
      return translationsDict.ta["Usage: %s / %s ft used"].replace("%s", match[1]).replace("%s", match[2]);
    }
  }

  if (cleaned.startsWith("Are you sure you want to delete the Lent Loan entry for ") && cleaned.endsWith("?")) {
    const val = cleaned.replace("Are you sure you want to delete the Lent Loan entry for ", "").replace("?", "");
    return (translationsDict.ta["Are you sure you want to delete the Lent Loan entry for %s?"] || "நிச்சயமாக %s-க்கான கடன் பதிவை நீக்க விரும்புகிறீர்களா?").replace("%s", val);
  }
  if (cleaned.startsWith("Are you sure you want to delete the Borrowed Loan entry for ") && cleaned.endsWith("?")) {
    const val = cleaned.replace("Are you sure you want to delete the Borrowed Loan entry for ", "").replace("?", "");
    return (translationsDict.ta["Are you sure you want to delete the Borrowed Loan entry for %s?"] || "நிச்சயமாக %s-க்கான கடன் வாங்கிய பதிவை நீக்க விரும்புகிறீர்களா?").replace("%s", val);
  }

  return text;
};

export const makeTranslator = (lang?: "en" | "ta") => {
  return (text: string) => translateText(text, lang);
};
