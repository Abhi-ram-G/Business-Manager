from datetime import date as dt_date, datetime, timedelta, timezone
from typing import Any, TypeVar

from fastapi import Depends, FastAPI, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import func, select, text
from sqlalchemy.exc import OperationalError
from sqlalchemy.orm import Session

from .core.config import get_settings
from .core.db import Base, engine, get_db
from .core.security import create_access_token, hash_password, verify_password
from .models import (
    AppNotification,
    Attendance,
    BusinessBill,
    CategoryBudget,
    FamilyExpense,
    FamilyMember,
    FuelEntry,
    IncomeEntry,
    Labour,
    LoanGiven,
    LoanReceived,
    ManagedDocument,
    SalaryPayment,
    TripRecord,
    User,
    Vehicle,
)
from .schemas import (
    AttendanceBatch,
    BusinessBillCreate,
    BusinessBillUpdate,
    CategoryBudgetCreate,
    CategoryBudgetUpdate,
    ChangePasswordRequest,
    DocumentCreate,
    DocumentUpdate,
    EMICollectRequest,
    FamilyExpenseCreate,
    FamilyExpenseUpdate,
    FamilyMemberCreate,
    FamilyMemberUpdate,
    FuelEntryCreate,
    IncomeEntryCreate,
    IncomeEntryUpdate,
    LabourCreate,
    LabourUpdate,
    LoanGivenCreate,
    LoanGivenUpdate,
    LoanReceivedCreate,
    LoanReceivedUpdate,
    NotificationCreate,
    NotificationUpdate,
    SalaryPaymentCreate,
    SalaryPaymentUpdate,
    TokenRequest,
    TokenResponse,
    TripCreate,
    VehicleCreate,
    VehicleUpdate,
)


settings = get_settings()


app = FastAPI(title="Smart Business Family Manager API", version="1.0.0")
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.allowed_origin_list,
    allow_origin_regex=settings.allowed_origin_regex,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


def mask_database_url(url: str) -> str:
    if not url:
        return "Not Configured"
    from urllib.parse import urlparse
    try:
        parsed = urlparse(url)
        if parsed.password:
            netloc = parsed.hostname or ""
            if parsed.port:
                netloc = f"{netloc}:{parsed.port}"
            if parsed.username:
                netloc = f"{parsed.username}:******@{netloc}"
            return parsed._replace(netloc=netloc).geturl()
        return url
    except Exception:
        if "@" in url:
            parts = url.split("@", 1)
            prefix, suffix = parts[0], parts[1]
            if ":" in prefix:
                sub_parts = prefix.split(":")
                if len(sub_parts) >= 3:
                    sub_parts[-1] = "******"
                    return ":".join(sub_parts) + "@" + suffix
            return "******@" + suffix
        return "[Masked URL]"


def get_connection_type(url: str) -> str:
    if not url:
        return "None"
    if "pooler" in url or ":6543" in url:
        return "Session Pooler (IPv4)"
    elif "supabase.co" in url:
        return "Direct Connection (IPv6)"
    return "Direct/Other"


@app.on_event("startup")
def initialize_database() -> None:
    db_url = settings.effective_database_url
    masked_url = mask_database_url(db_url)
    conn_type = get_connection_type(db_url)
    selected_var = settings.selected_db_env_var
    
    print("\n" + "="*50)
    print("DATABASE STARTUP CONNECTION DETAILS")
    print(f"Selected Env Var: {selected_var}")
    print(f"Active URL:       {masked_url}")
    print(f"Connection Type:  {conn_type}")
    
    if db_url and "db.vwtjogybncekikjyqgur.supabase.co" in db_url:
        print("\n[WARNING] Direct Supabase connection detected. Render requires the Session Pooler (IPv4).")
        
    print("="*50 + "\n")

    try:
        Base.metadata.create_all(bind=engine)
        print("Database initialized/synchronized successfully.\n")
        
        # Ensure default admin user exists in database
        db = Session(bind=engine)
        try:
            admin_exists = db.query(User).filter(User.username == "admin").first()
            if not admin_exists:
                default_admin = User(
                    username="admin",
                    email="admin@local.app",
                    hashed_password=hash_password("30072005"),
                    role="Admin",
                )
                db.add(default_admin)
                db.commit()
                print("Default admin user created in database successfully.")
        except Exception as err:
            db.rollback()
            print(f"Warning: Failed to ensure default admin user: {err}")
        finally:
            db.close()
    except OperationalError as exc:
        raise RuntimeError(
            "Unable to connect to Supabase from Render. The direct Supabase database endpoint is IPv6-only. "
            "Set SUPABASE_POOLER_URL to the Supabase shared pooler session URL (IPv4) or enable the IPv4 add-on."
        ) from exc




@app.get("/health")
def health(db: Session = Depends(get_db)) -> dict[str, Any]:
    db_status = "connected"
    try:
        db.execute(text("SELECT 1"))
    except Exception as exc:
        db_status = f"error: {exc.__class__.__name__}"
    return {
        "status": "ok",
        "service": "smart-business-family-manager-backend",
        "database_configured": bool(settings.database_url),
        "database_status": db_status,
    }


def serialize_model(obj: Any) -> dict[str, Any]:
    return {key: value for key, value in obj.__dict__.items() if key != "_sa_instance_state"}


ModelT = TypeVar("ModelT")


def create_or_400(db: Session, model_cls: type[ModelT], obj: ModelT, message: str):
    db.add(obj)
    try:
        db.commit()
    except Exception as exc:
        db.rollback()
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=message) from exc
    db.refresh(obj)
    return obj


def update_instance(db: Session, instance: Any, payload: dict[str, Any]):
    for key, value in payload.items():
        if value is not None:
            setattr(instance, key, value)
    db.commit()
    db.refresh(instance)
    return instance


def generate_bill_invoice_no() -> str:
    return f"INV-SRS-{datetime.now(timezone.utc).strftime('%Y%m%d%H%M%S%f')[:-3]}"


@app.post("/api/v1/auth/token", response_model=TokenResponse)
def login(payload: TokenRequest, db: Session = Depends(get_db)) -> TokenResponse:
    try:
        user = db.execute(select(User).where(User.username == payload.username)).scalar_one_or_none()
    except Exception:
        user = None

    if user is None:
        if payload.username == "admin" and payload.password == "30072005":
            token = create_access_token("admin", "Admin")
            return TokenResponse(
                access_token=token,
                expires_in=settings.access_token_expire_minutes * 60,
                role="Admin",
                name="Admin",
            )
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid credentials")

    try:
        password_ok = verify_password(payload.password, user.hashed_password)
    except Exception:
        password_ok = payload.username == "admin" and payload.password == "30072005"

    if not password_ok:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid credentials")

    token = create_access_token(user.username, user.role)
    return TokenResponse(
        access_token=token,
        expires_in=settings.access_token_expire_minutes * 60,
        role=user.role,
        name=user.username,
    )


@app.post("/api/v1/auth/change-password")
def change_password(payload: ChangePasswordRequest, db: Session = Depends(get_db)) -> dict[str, str]:
    if payload.new_password != payload.confirm_new_password:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="New passwords do not match")

    try:
        admin = db.execute(select(User).where(User.username == "admin")).scalar_one_or_none()
    except Exception as exc:
        raise HTTPException(status_code=status.HTTP_503_SERVICE_UNAVAILABLE, detail="Database is unavailable") from exc

    if admin is None:
        admin = User(
            username="admin",
            email="admin@local.app",
            hashed_password=hash_password("30072005"),
            role="Admin",
        )
        db.add(admin)
        db.commit()
        db.refresh(admin)

    if not verify_password(payload.old_password, admin.hashed_password):
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Old password is incorrect")

    admin.hashed_password = hash_password(payload.new_password)
    db.commit()
    return {"message": "Password updated successfully"}


@app.get("/api/v1/labours")
def list_labours(db: Session = Depends(get_db)):
    return [serialize_model(item) for item in db.execute(select(Labour).order_by(Labour.created_at.desc())).scalars()]


@app.post("/api/v1/labours", status_code=status.HTTP_201_CREATED)
def create_labour(payload: LabourCreate, db: Session = Depends(get_db)):
    labour = Labour(**payload.model_dump())
    return serialize_model(create_or_400(db, Labour, labour, "Unable to create labour record"))


@app.put("/api/v1/labours/{labour_id}")
def update_labour(labour_id: str, payload: LabourUpdate, db: Session = Depends(get_db)):
    labour = db.get(Labour, labour_id)
    if not labour:
        raise HTTPException(status_code=404, detail="Labour not found")
    return serialize_model(update_instance(db, labour, payload.model_dump(exclude_unset=True)))


@app.delete("/api/v1/labours/{labour_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_labour(labour_id: str, db: Session = Depends(get_db)):
    labour = db.get(Labour, labour_id)
    if not labour:
        raise HTTPException(status_code=404, detail="Labour not found")
    db.delete(labour)
    db.commit()


@app.post("/api/v1/labours/attendance")
def mark_attendance(payload: AttendanceBatch, db: Session = Depends(get_db)):
    saved = []
    for record in payload.records:
        existing = db.execute(
            select(Attendance).where(Attendance.labour_id == record.labour_id, Attendance.date == payload.date)
        ).scalar_one_or_none()
        if existing:
            existing.status = record.status
            existing.reason = record.reason
            saved.append(existing)
        else:
            saved.append(Attendance(labour_id=record.labour_id, date=payload.date, status=record.status, reason=record.reason))
            db.add(saved[-1])
    db.commit()
    return {"message": "Attendance marked successfully", "total_records": len(saved), "date": payload.date}


@app.get("/api/v1/labours/attendance")
def list_attendance(db: Session = Depends(get_db)):
    return [serialize_model(item) for item in db.execute(select(Attendance).order_by(Attendance.date.desc())).scalars()]


@app.delete("/api/v1/labours/attendance/{labour_id}/{attendance_date}", status_code=status.HTTP_204_NO_CONTENT)
def delete_attendance(labour_id: str, attendance_date: dt_date, db: Session = Depends(get_db)):
    attendance = db.execute(
        select(Attendance).where(Attendance.labour_id == labour_id, Attendance.date == attendance_date)
    ).scalar_one_or_none()
    if not attendance:
        raise HTTPException(status_code=404, detail="Attendance record not found")
    db.delete(attendance)
    db.commit()


@app.get("/api/v1/labours/salary-payments")
def list_salary_payments(db: Session = Depends(get_db)):
    return [serialize_model(item) for item in db.execute(select(SalaryPayment).order_by(SalaryPayment.created_at.desc())).scalars()]


@app.post("/api/v1/labours/salary-payments", status_code=status.HTTP_201_CREATED)
def create_salary_payment(payload: SalaryPaymentCreate, db: Session = Depends(get_db)):
    payment = SalaryPayment(**payload.model_dump())
    db.add(payment)
    db.commit()
    db.refresh(payment)
    return serialize_model(payment)


@app.put("/api/v1/labours/salary-payments/{payment_id}")
def update_salary_payment(payment_id: str, payload: SalaryPaymentUpdate, db: Session = Depends(get_db)):
    payment = db.get(SalaryPayment, payment_id)
    if not payment:
        raise HTTPException(status_code=404, detail="Salary payment not found")
    return serialize_model(update_instance(db, payment, payload.model_dump(exclude_unset=True)))


@app.delete("/api/v1/labours/salary-payments/{payment_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_salary_payment(payment_id: str, db: Session = Depends(get_db)):
    payment = db.get(SalaryPayment, payment_id)
    if not payment:
        raise HTTPException(status_code=404, detail="Salary payment not found")
    db.delete(payment)
    db.commit()


@app.get("/api/v1/labours/salary-pending")
def salary_pending(db: Session = Depends(get_db)):
    rows = db.execute(
        select(Labour.id, Labour.full_name, Labour.salary_per_month).where(Labour.is_active.is_(True))
    ).all()
    result = []
    for labour_id, full_name, salary_per_month in rows:
        present_days = db.execute(
            select(func.count()).select_from(Attendance).where(Attendance.labour_id == labour_id, Attendance.status == "Present")
        ).scalar_one()
        half_days = db.execute(
            select(func.count()).select_from(Attendance).where(Attendance.labour_id == labour_id, Attendance.status == "Half-Day")
        ).scalar_one()
        wage = float(salary_per_month or 0)
        base_payout = wage
        result.append(
            {
                "labour_id": labour_id,
                "name": full_name,
                "present_days": present_days,
                "half_days": half_days,
                "wage_rate": wage,
                "base_payout": base_payout,
                "advance_deductions": 0.0,
                "net_outstanding": base_payout,
            }
        )
    return result


@app.get("/api/v1/vehicles")
def list_vehicles(db: Session = Depends(get_db)):
    return [serialize_model(item) for item in db.execute(select(Vehicle).order_by(Vehicle.created_at.desc())).scalars()]


@app.post("/api/v1/vehicles", status_code=status.HTTP_201_CREATED)
def create_vehicle(payload: VehicleCreate, db: Session = Depends(get_db)):
    vehicle = Vehicle(**payload.model_dump())
    return serialize_model(create_or_400(db, Vehicle, vehicle, "Unable to create vehicle"))


@app.put("/api/v1/vehicles/{vehicle_id}")
def update_vehicle(vehicle_id: str, payload: VehicleUpdate, db: Session = Depends(get_db)):
    vehicle = db.get(Vehicle, vehicle_id)
    if not vehicle:
        raise HTTPException(status_code=404, detail="Vehicle not found")
    return serialize_model(update_instance(db, vehicle, payload.model_dump(exclude_unset=True)))


@app.delete("/api/v1/vehicles/{vehicle_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_vehicle(vehicle_id: str, db: Session = Depends(get_db)):
    vehicle = db.get(Vehicle, vehicle_id)
    if not vehicle:
        raise HTTPException(status_code=404, detail="Vehicle not found")
    db.delete(vehicle)
    db.commit()


@app.post("/api/v1/vehicles/fuel", status_code=status.HTTP_201_CREATED)
def create_fuel_entry(payload: FuelEntryCreate, db: Session = Depends(get_db)):
    entry = FuelEntry(**payload.model_dump())
    if entry.liters is not None and entry.per_liter_cost is not None and entry.cost is None:
        entry.cost = float(entry.liters) * float(entry.per_liter_cost)
    if entry.cost is not None and entry.liters is not None and entry.per_liter_cost is None and entry.liters != 0:
        entry.per_liter_cost = float(entry.cost) / float(entry.liters)
    db.add(entry)
    db.commit()
    db.refresh(entry)
    return serialize_model(entry)


@app.get("/api/v1/vehicles/fuel")
def list_fuel_entries(db: Session = Depends(get_db)):
    return [serialize_model(item) for item in db.execute(select(FuelEntry).order_by(FuelEntry.created_at.desc())).scalars()]


@app.post("/api/v1/vehicles/trips", status_code=status.HTTP_201_CREATED)
def create_trip(payload: TripCreate, db: Session = Depends(get_db)):
    trip = TripRecord(**payload.model_dump())
    db.add(trip)
    db.commit()
    db.refresh(trip)
    return serialize_model(trip)


@app.get("/api/v1/vehicles/trips")
def list_trips(db: Session = Depends(get_db)):
    return [serialize_model(item) for item in db.execute(select(TripRecord).order_by(TripRecord.created_at.desc())).scalars()]


@app.get("/api/v1/business/bills")
def list_business_bills(db: Session = Depends(get_db)):
    return [serialize_model(item) for item in db.execute(select(BusinessBill).order_by(BusinessBill.created_at.desc())).scalars()]


@app.post("/api/v1/business/bills", status_code=status.HTTP_201_CREATED)
def create_business_bill(payload: BusinessBillCreate, db: Session = Depends(get_db)):
    payload_data = payload.model_dump()
    if not payload_data.get("invoice_no"):
        payload_data["invoice_no"] = generate_bill_invoice_no()
    bill = BusinessBill(**payload_data)
    return serialize_model(create_or_400(db, BusinessBill, bill, "Unable to create business bill"))


@app.put("/api/v1/business/bills/{bill_id}")
def update_business_bill(bill_id: str, payload: BusinessBillUpdate, db: Session = Depends(get_db)):
    bill = db.get(BusinessBill, bill_id)
    if not bill:
        raise HTTPException(status_code=404, detail="Business bill not found")
    return serialize_model(update_instance(db, bill, payload.model_dump(exclude_unset=True)))


@app.delete("/api/v1/business/bills/{bill_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_business_bill(bill_id: str, db: Session = Depends(get_db)):
    bill = db.get(BusinessBill, bill_id)
    if not bill:
        raise HTTPException(status_code=404, detail="Business bill not found")
    db.delete(bill)
    db.commit()


@app.get("/api/v1/loans/given")
def list_loans_given(db: Session = Depends(get_db)):
    return [serialize_model(item) for item in db.execute(select(LoanGiven).order_by(LoanGiven.created_at.desc())).scalars()]


@app.post("/api/v1/loans/given", status_code=status.HTTP_201_CREATED)
def create_loan_given(payload: LoanGivenCreate, db: Session = Depends(get_db)):
    loan = LoanGiven(**payload.model_dump())
    db.add(loan)
    db.commit()
    db.refresh(loan)
    return serialize_model(loan)


@app.put("/api/v1/loans/given/{loan_id}")
def update_loan_given(loan_id: str, payload: LoanGivenUpdate, db: Session = Depends(get_db)):
    loan = db.get(LoanGiven, loan_id)
    if not loan:
        raise HTTPException(status_code=404, detail="Loan not found")
    return serialize_model(update_instance(db, loan, payload.model_dump(exclude_unset=True)))


@app.delete("/api/v1/loans/given/{loan_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_loan_given(loan_id: str, db: Session = Depends(get_db)):
    loan = db.get(LoanGiven, loan_id)
    if not loan:
        raise HTTPException(status_code=404, detail="Loan not found")
    db.delete(loan)
    db.commit()


@app.post("/api/v1/loans/given/collect-emi")
def collect_emi(payload: EMICollectRequest, db: Session = Depends(get_db)):
    loan = db.get(LoanGiven, payload.borrower_id)
    if not loan:
        raise HTTPException(status_code=404, detail="Loan not found")
    loan.total_paid = float(loan.total_paid or 0) + float(payload.amount_paid)
    loan.is_defaulter = False
    db.commit()
    db.refresh(loan)
    return {
        "borrower_name": loan.borrower_name or loan.person_name,
        "emi_amount": payload.amount_paid,
        "remaining_loan_balance": max(float(loan.loan_amount or loan.amount_given or 0) - float(loan.total_paid or 0), 0),
        "repayment_status": "Paid-On-Time",
        "defaulter_flag_cleared": True,
    }


@app.get("/api/v1/loans/received")
def list_loans_received(db: Session = Depends(get_db)):
    return [serialize_model(item) for item in db.execute(select(LoanReceived).order_by(LoanReceived.created_at.desc())).scalars()]


@app.post("/api/v1/loans/received", status_code=status.HTTP_201_CREATED)
def create_loan_received(payload: LoanReceivedCreate, db: Session = Depends(get_db)):
    loan = LoanReceived(**payload.model_dump())
    db.add(loan)
    db.commit()
    db.refresh(loan)
    return serialize_model(loan)


@app.put("/api/v1/loans/received/{loan_id}")
def update_loan_received(loan_id: str, payload: LoanReceivedUpdate, db: Session = Depends(get_db)):
    loan = db.get(LoanReceived, loan_id)
    if not loan:
        raise HTTPException(status_code=404, detail="Loan not found")
    return serialize_model(update_instance(db, loan, payload.model_dump(exclude_unset=True)))


@app.delete("/api/v1/loans/received/{loan_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_loan_received(loan_id: str, db: Session = Depends(get_db)):
    loan = db.get(LoanReceived, loan_id)
    if not loan:
        raise HTTPException(status_code=404, detail="Loan not found")
    db.delete(loan)
    db.commit()


@app.get("/api/v1/family-members")
def list_family_members(db: Session = Depends(get_db)):
    return [serialize_model(item) for item in db.execute(select(FamilyMember).order_by(FamilyMember.created_at.desc())).scalars()]


@app.post("/api/v1/family-members", status_code=status.HTTP_201_CREATED)
def create_family_member(payload: FamilyMemberCreate, db: Session = Depends(get_db)):
    member = FamilyMember(id=payload.id, name=payload.name, relationship_name=payload.relationship_name)
    db.add(member)
    db.commit()
    db.refresh(member)
    return serialize_model(member)


@app.put("/api/v1/family-members/{member_id}")
def update_family_member(member_id: str, payload: FamilyMemberUpdate, db: Session = Depends(get_db)):
    member = db.get(FamilyMember, member_id)
    if not member:
        raise HTTPException(status_code=404, detail="Family member not found")
    return serialize_model(update_instance(db, member, payload.model_dump(exclude_unset=True)))


@app.delete("/api/v1/family-members/{member_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_family_member(member_id: str, db: Session = Depends(get_db)):
    member = db.get(FamilyMember, member_id)
    if not member:
        raise HTTPException(status_code=404, detail="Family member not found")
    db.delete(member)
    db.commit()


@app.get("/api/v1/income")
def list_income(db: Session = Depends(get_db)):
    return [serialize_model(item) for item in db.execute(select(IncomeEntry).order_by(IncomeEntry.created_at.desc())).scalars()]


@app.post("/api/v1/income", status_code=status.HTTP_201_CREATED)
def create_income(payload: IncomeEntryCreate, db: Session = Depends(get_db)):
    income = IncomeEntry(**payload.model_dump())
    db.add(income)
    db.commit()
    db.refresh(income)
    return serialize_model(income)


@app.put("/api/v1/income/{income_id}")
def update_income(income_id: str, payload: IncomeEntryUpdate, db: Session = Depends(get_db)):
    income = db.get(IncomeEntry, income_id)
    if not income:
        raise HTTPException(status_code=404, detail="Income entry not found")
    return serialize_model(update_instance(db, income, payload.model_dump(exclude_unset=True)))


@app.delete("/api/v1/income/{income_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_income(income_id: str, db: Session = Depends(get_db)):
    income = db.get(IncomeEntry, income_id)
    if not income:
        raise HTTPException(status_code=404, detail="Income entry not found")
    db.delete(income)
    db.commit()


@app.get("/api/v1/expenses")
def list_expenses(db: Session = Depends(get_db)):
    return [serialize_model(item) for item in db.execute(select(FamilyExpense).order_by(FamilyExpense.created_at.desc())).scalars()]


@app.post("/api/v1/expenses", status_code=status.HTTP_201_CREATED)
def create_expense(payload: FamilyExpenseCreate, db: Session = Depends(get_db)):
    expense = FamilyExpense(**payload.model_dump())
    db.add(expense)
    db.commit()
    db.refresh(expense)
    return serialize_model(expense)


@app.put("/api/v1/expenses/{expense_id}")
def update_expense(expense_id: str, payload: FamilyExpenseUpdate, db: Session = Depends(get_db)):
    expense = db.get(FamilyExpense, expense_id)
    if not expense:
        raise HTTPException(status_code=404, detail="Expense not found")
    return serialize_model(update_instance(db, expense, payload.model_dump(exclude_unset=True)))


@app.delete("/api/v1/expenses/{expense_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_expense(expense_id: str, db: Session = Depends(get_db)):
    expense = db.get(FamilyExpense, expense_id)
    if not expense:
        raise HTTPException(status_code=404, detail="Expense not found")
    db.delete(expense)
    db.commit()


@app.get("/api/v1/category-budgets")
def list_category_budgets(db: Session = Depends(get_db)):
    return [serialize_model(item) for item in db.execute(select(CategoryBudget)).scalars()]


@app.post("/api/v1/category-budgets", status_code=status.HTTP_201_CREATED)
def create_category_budget(payload: CategoryBudgetCreate, db: Session = Depends(get_db)):
    budget = CategoryBudget(**payload.model_dump())
    db.add(budget)
    db.commit()
    db.refresh(budget)
    return serialize_model(budget)


@app.put("/api/v1/category-budgets/{category}")
def update_category_budget(category: str, payload: CategoryBudgetUpdate, db: Session = Depends(get_db)):
    budget = db.get(CategoryBudget, category)
    if not budget:
        raise HTTPException(status_code=404, detail="Category budget not found")
    return serialize_model(update_instance(db, budget, payload.model_dump(exclude_unset=True)))


@app.delete("/api/v1/category-budgets/{category}", status_code=status.HTTP_204_NO_CONTENT)
def delete_category_budget(category: str, db: Session = Depends(get_db)):
    budget = db.get(CategoryBudget, category)
    if not budget:
        raise HTTPException(status_code=404, detail="Category budget not found")
    db.delete(budget)
    db.commit()


@app.get("/api/v1/documents")
def list_documents(db: Session = Depends(get_db)):
    return [serialize_model(item) for item in db.execute(select(ManagedDocument).order_by(ManagedDocument.created_at.desc())).scalars()]


@app.post("/api/v1/documents", status_code=status.HTTP_201_CREATED)
def create_document(payload: DocumentCreate, db: Session = Depends(get_db)):
    document = ManagedDocument(**payload.model_dump())
    db.add(document)
    db.commit()
    db.refresh(document)
    return serialize_model(document)


@app.put("/api/v1/documents/{document_id}")
def update_document(document_id: str, payload: DocumentUpdate, db: Session = Depends(get_db)):
    document = db.get(ManagedDocument, document_id)
    if not document:
        raise HTTPException(status_code=404, detail="Document not found")
    return serialize_model(update_instance(db, document, payload.model_dump(exclude_unset=True)))


@app.delete("/api/v1/documents/{document_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_document(document_id: str, db: Session = Depends(get_db)):
    document = db.get(ManagedDocument, document_id)
    if not document:
        raise HTTPException(status_code=404, detail="Document not found")
    db.delete(document)
    db.commit()


@app.get("/api/v1/notifications")
def list_notifications(db: Session = Depends(get_db)):
    return [serialize_model(item) for item in db.execute(select(AppNotification).order_by(AppNotification.created_at.desc())).scalars()]


@app.post("/api/v1/notifications", status_code=status.HTTP_201_CREATED)
def create_notification(payload: NotificationCreate, db: Session = Depends(get_db)):
    notification = AppNotification(**payload.model_dump())
    db.add(notification)
    db.commit()
    db.refresh(notification)
    return serialize_model(notification)


@app.put("/api/v1/notifications/{notification_id}")
def update_notification(notification_id: str, payload: NotificationUpdate, db: Session = Depends(get_db)):
    notification = db.get(AppNotification, notification_id)
    if not notification:
        raise HTTPException(status_code=404, detail="Notification not found")
    return serialize_model(update_instance(db, notification, payload.model_dump(exclude_unset=True)))


@app.delete("/api/v1/notifications/{notification_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_notification(notification_id: str, db: Session = Depends(get_db)):
    notification = db.get(AppNotification, notification_id)
    if not notification:
        raise HTTPException(status_code=404, detail="Notification not found")
    db.delete(notification)
    db.commit()
