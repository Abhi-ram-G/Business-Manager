from datetime import date, datetime
from typing import Any

from sqlalchemy import Boolean, Date, DateTime, Float, ForeignKey, Integer, JSON, Numeric, String, Text, UniqueConstraint
from sqlalchemy.orm import Mapped, mapped_column, relationship

from .core.db import Base


class TimestampMixin:
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=datetime.utcnow, nullable=False)
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=datetime.utcnow,
        onupdate=datetime.utcnow,
        nullable=False,
    )


class User(Base, TimestampMixin):
    __tablename__ = "users"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    username: Mapped[str] = mapped_column(String(50), unique=True, nullable=False)
    email: Mapped[str] = mapped_column(String(100), unique=True, nullable=False)
    hashed_password: Mapped[str] = mapped_column(String(255), nullable=False)
    role: Mapped[str] = mapped_column(String(20), nullable=False, default="Admin")
    fcm_token: Mapped[str | None] = mapped_column(String(255))


class Labour(Base, TimestampMixin):
    __tablename__ = "labours"

    id: Mapped[str] = mapped_column(String(50), primary_key=True)
    full_name: Mapped[str] = mapped_column(String(100), nullable=False)
    phone: Mapped[str] = mapped_column(String(20), nullable=False)
    skill_type: Mapped[str] = mapped_column(String(20), nullable=False)
    daily_wage: Mapped[float] = mapped_column(Numeric(10, 2), nullable=False)
    joining_date: Mapped[date] = mapped_column(Date, nullable=False)
    aadhaar_number: Mapped[str | None] = mapped_column(String(20), nullable=True)
    address: Mapped[str | None] = mapped_column(Text, nullable=True)
    emergency_contact: Mapped[str | None] = mapped_column(String(20), nullable=True)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)
    is_freezed: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    avatar_url: Mapped[str | None] = mapped_column(String(255))
    license_number: Mapped[str | None] = mapped_column(String(80))
    license_expiry_date: Mapped[date | None] = mapped_column(Date)
    salary_per_month: Mapped[float | None] = mapped_column(Numeric(10, 2))
    advance_entries: Mapped[list[dict[str, Any]] | None] = mapped_column(JSON)
    pdf_attachment_name: Mapped[str | None] = mapped_column(String(255))
    gender: Mapped[str | None] = mapped_column(String(10))
    profile_photo: Mapped[str | None] = mapped_column(Text)
    profile_photo_name: Mapped[str | None] = mapped_column(String(255))
    aadhaar_pdf_name: Mapped[str | None] = mapped_column(String(255))
    aadhaar_pdf_data: Mapped[str | None] = mapped_column(Text)
    license_pdf_name: Mapped[str | None] = mapped_column(String(255))
    license_pdf_data: Mapped[str | None] = mapped_column(Text)
    custom_documents: Mapped[list[dict[str, Any]] | None] = mapped_column(JSON)


class Attendance(Base, TimestampMixin):
    __tablename__ = "attendance"
    __table_args__ = (UniqueConstraint("labour_id", "date", name="uq_attendance_labour_date"),)

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    labour_id: Mapped[str] = mapped_column(ForeignKey("labours.id", ondelete="CASCADE"), nullable=False)
    date: Mapped[date] = mapped_column(Date, nullable=False)
    status: Mapped[str] = mapped_column(String(20), nullable=False)
    reason: Mapped[str | None] = mapped_column(String(255))

    labour: Mapped["Labour"] = relationship()


class SalaryPayment(Base, TimestampMixin):
    __tablename__ = "salary_payments"

    id: Mapped[str] = mapped_column(String(50), primary_key=True)
    labour_id: Mapped[str] = mapped_column(ForeignKey("labours.id", ondelete="CASCADE"), nullable=False)
    date: Mapped[date] = mapped_column(Date, nullable=False)
    amount_calculated: Mapped[float] = mapped_column(Numeric(10, 2), nullable=False)
    advance_deducted: Mapped[float] = mapped_column(Numeric(10, 2), nullable=False, default=0)
    bonus: Mapped[float] = mapped_column(Numeric(10, 2), nullable=False, default=0)
    net_paid: Mapped[float] = mapped_column(Numeric(10, 2), nullable=False)
    status: Mapped[str] = mapped_column(String(20), nullable=False)
    salary_option: Mapped[str] = mapped_column(String(20), nullable=False)
    deduct_amount_requested: Mapped[float | None] = mapped_column(Numeric(10, 2))


class Vehicle(Base, TimestampMixin):
    __tablename__ = "vehicles"

    id: Mapped[str] = mapped_column(String(50), primary_key=True)
    vehicle_name: Mapped[str | None] = mapped_column(String(100))
    vehicle_type: Mapped[str] = mapped_column(String(30), nullable=False)
    brand: Mapped[str] = mapped_column(String(50), nullable=False)
    model: Mapped[str] = mapped_column(String(50), nullable=False)
    registration_date: Mapped[date | None] = mapped_column(Date)
    insurance_expiry: Mapped[date] = mapped_column(Date, nullable=False)
    fitness_expiry: Mapped[date | None] = mapped_column(Date)
    pollution_expiry: Mapped[date] = mapped_column(Date, nullable=False)
    driver_name: Mapped[str | None] = mapped_column(String(100))
    rc_expiry: Mapped[date | None] = mapped_column(Date)
    insurance_number: Mapped[str | None] = mapped_column(String(100))
    next_service_due: Mapped[date | None] = mapped_column(Date)
    rc_book_pdf: Mapped[str | None] = mapped_column(String(255))
    insurance_pdf: Mapped[str | None] = mapped_column(String(255))
    permit_pdf: Mapped[str | None] = mapped_column(String(255))
    fitness_pdf: Mapped[str | None] = mapped_column(String(255))
    rc_book_data: Mapped[str | None] = mapped_column(Text)
    insurance_data: Mapped[str | None] = mapped_column(Text)
    permit_data: Mapped[str | None] = mapped_column(Text)
    fitness_data: Mapped[str | None] = mapped_column(Text)


class BusinessBill(Base, TimestampMixin):
    __tablename__ = "business_bills"

    id: Mapped[str] = mapped_column(String(50), primary_key=True)
    invoice_no: Mapped[str] = mapped_column(String(50), nullable=False, unique=True)
    client_name: Mapped[str] = mapped_column(String(150), nullable=False)
    bill_date: Mapped[date] = mapped_column(Date, nullable=False)
    due_date: Mapped[date] = mapped_column(Date, nullable=False)
    description: Mapped[str] = mapped_column(Text, nullable=False)
    amount: Mapped[float] = mapped_column(Numeric(12, 2), nullable=False)
    tax_rate: Mapped[float] = mapped_column(Numeric(10, 2), nullable=False, default=0)
    status: Mapped[str] = mapped_column(String(20), nullable=False, default="Pending")
    borewell_type: Mapped[str | None] = mapped_column(String(30))
    bill_mode: Mapped[str | None] = mapped_column(String(20))
    existing_depth: Mapped[int | None] = mapped_column(Integer)
    final_depth: Mapped[int | None] = mapped_column(Integer)
    casing_feet: Mapped[int | None] = mapped_column(Integer)
    casing_rate: Mapped[float | None] = mapped_column(Numeric(10, 2))
    batta: Mapped[float | None] = mapped_column(Numeric(10, 2))
    starting_price: Mapped[float | None] = mapped_column(Numeric(10, 2))
    old_feet_rate: Mapped[float | None] = mapped_column(Numeric(10, 2))
    casing_type: Mapped[str | None] = mapped_column(String(20))
    calculated_breakdown: Mapped[list[dict[str, Any]] | None] = mapped_column(JSON)
    total_drilling_charges: Mapped[float | None] = mapped_column(Numeric(12, 2))
    casing_charges: Mapped[float | None] = mapped_column(Numeric(12, 2))
    is_custom_bill: Mapped[bool | None] = mapped_column(Boolean)
    location: Mapped[str | None] = mapped_column(String(150))
    broker_name: Mapped[str | None] = mapped_column(String(150))
    custom_date_type: Mapped[str | None] = mapped_column(String(20))
    custom_starting_feet: Mapped[int | None] = mapped_column(Integer)
    custom_ending_feet: Mapped[int | None] = mapped_column(Integer)
    casing10_feet: Mapped[int | None] = mapped_column(Integer)
    casing10_rate: Mapped[float | None] = mapped_column(Numeric(10, 2))
    casing7_feet: Mapped[int | None] = mapped_column(Integer)
    casing7_rate: Mapped[float | None] = mapped_column(Numeric(10, 2))
    custom_slab_rates: Mapped[dict[str, Any] | None] = mapped_column(JSON)
    discount_amount: Mapped[float | None] = mapped_column(Numeric(10, 2))


class FuelEntry(Base, TimestampMixin):
    __tablename__ = "fuel_entries"

    id: Mapped[str] = mapped_column(String(50), primary_key=True)
    vehicle_id: Mapped[str | None] = mapped_column(ForeignKey("vehicles.id", ondelete="SET NULL"))
    date: Mapped[date | None] = mapped_column(Date)
    liters: Mapped[float | None] = mapped_column(Numeric(10, 2))
    cost: Mapped[float | None] = mapped_column(Numeric(10, 2))
    current_odometer: Mapped[int | None] = mapped_column(Integer)
    fuel_type: Mapped[str | None] = mapped_column(String(20))
    per_liter_cost: Mapped[float | None] = mapped_column(Numeric(10, 2))
    date_time: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))
    vehicle_name: Mapped[str | None] = mapped_column(String(100))
    total_amount: Mapped[float | None] = mapped_column(Numeric(10, 2))


class TripRecord(Base, TimestampMixin):
    __tablename__ = "trips"

    id: Mapped[str] = mapped_column(String(50), primary_key=True)
    vehicle_id: Mapped[str | None] = mapped_column(ForeignKey("vehicles.id", ondelete="SET NULL"))
    date: Mapped[date] = mapped_column(Date, nullable=False)
    start_location: Mapped[str] = mapped_column(String(100), nullable=False)
    end_location: Mapped[str] = mapped_column(String(100), nullable=False)
    distance_covered: Mapped[float] = mapped_column(Numeric(10, 2), nullable=False)
    revenue_earned: Mapped[float] = mapped_column(Numeric(10, 2), nullable=False)


class LoanGiven(Base, TimestampMixin):
    __tablename__ = "loans_given"

    id: Mapped[str] = mapped_column(String(50), primary_key=True)
    borrower_name: Mapped[str | None] = mapped_column(String(100))
    person_name: Mapped[str | None] = mapped_column(String(100))
    mobile_number: Mapped[str | None] = mapped_column(String(20))
    address: Mapped[str | None] = mapped_column(Text)
    loan_amount: Mapped[float | None] = mapped_column(Numeric(12, 2))
    amount_given: Mapped[float | None] = mapped_column(Numeric(12, 2))
    interest_rate: Mapped[float | None] = mapped_column(Numeric(5, 2))
    interest_percentage: Mapped[float | None] = mapped_column(Numeric(5, 2))
    start_date: Mapped[date | None] = mapped_column(Date)
    end_date: Mapped[date | None] = mapped_column(Date)
    emi_amount: Mapped[float | None] = mapped_column(Numeric(10, 2))
    due_date: Mapped[str | None] = mapped_column(String(20))
    total_paid: Mapped[float | None] = mapped_column(Numeric(12, 2))
    is_defaulter: Mapped[bool | None] = mapped_column(Boolean)
    interest_type: Mapped[str | None] = mapped_column(String(20))
    category: Mapped[str | None] = mapped_column(String(50))
    status: Mapped[str | None] = mapped_column(String(20))
    monthly_interests: Mapped[dict[str, str] | None] = mapped_column(JSON)


class LoanReceived(Base, TimestampMixin):
    __tablename__ = "loans_received"

    id: Mapped[str] = mapped_column(String(50), primary_key=True)
    lender_name: Mapped[str | None] = mapped_column(String(100))
    person_name: Mapped[str | None] = mapped_column(String(100))
    my_name: Mapped[str | None] = mapped_column(String(100))
    borrowed_amount: Mapped[float | None] = mapped_column(Numeric(12, 2))
    amount: Mapped[float | None] = mapped_column(Numeric(12, 2))
    interest_rate: Mapped[float | None] = mapped_column(Numeric(5, 2))
    interest_percentage: Mapped[float | None] = mapped_column(Numeric(5, 2))
    start_date: Mapped[date | None] = mapped_column(Date)
    end_date: Mapped[date | None] = mapped_column(Date)
    monthly_emi: Mapped[float | None] = mapped_column(Numeric(10, 2))
    due_date: Mapped[str | None] = mapped_column(String(20))
    total_repaid: Mapped[float | None] = mapped_column(Numeric(12, 2))
    interest_type: Mapped[str | None] = mapped_column(String(20))
    interest_status: Mapped[str | None] = mapped_column(String(20))
    category: Mapped[str | None] = mapped_column(String(50))
    status: Mapped[str | None] = mapped_column(String(20))
    vehicle_id: Mapped[str | None] = mapped_column(String(50))
    number_of_months: Mapped[int | None] = mapped_column(Integer)
    monthly_interests: Mapped[dict[str, str] | None] = mapped_column(JSON)


class FamilyMember(Base, TimestampMixin):
    __tablename__ = "family_members"

    id: Mapped[str] = mapped_column(String(50), primary_key=True)
    name: Mapped[str] = mapped_column(String(100), nullable=False)
    relationship_name: Mapped[str] = mapped_column(String(50), nullable=False)


class IncomeEntry(Base, TimestampMixin):
    __tablename__ = "income_entries"

    id: Mapped[str] = mapped_column(String(50), primary_key=True)
    source: Mapped[str] = mapped_column(String(100), nullable=False)
    amount: Mapped[float] = mapped_column(Numeric(12, 2), nullable=False)
    date: Mapped[date] = mapped_column(Date, nullable=False)


class FamilyExpense(Base, TimestampMixin):
    __tablename__ = "family_expenses"

    id: Mapped[str] = mapped_column(String(50), primary_key=True)
    family_member_name: Mapped[str | None] = mapped_column(String(100))
    member_id: Mapped[str | None] = mapped_column(ForeignKey("family_members.id", ondelete="SET NULL"))
    date: Mapped[date] = mapped_column(Date, nullable=False)
    reason: Mapped[str | None] = mapped_column(String(50))
    category: Mapped[str | None] = mapped_column(String(50))
    amount: Mapped[float] = mapped_column(Numeric(12, 2), nullable=False)
    description: Mapped[str | None] = mapped_column(Text)


class CategoryBudget(Base, TimestampMixin):
    __tablename__ = "category_budgets"

    category: Mapped[str] = mapped_column(String(50), primary_key=True)
    limit: Mapped[float] = mapped_column(Numeric(12, 2), nullable=False)
    spent: Mapped[float] = mapped_column(Numeric(12, 2), nullable=False, default=0)


class ManagedDocument(Base, TimestampMixin):
    __tablename__ = "documents"

    id: Mapped[str] = mapped_column(String(50), primary_key=True)
    name: Mapped[str] = mapped_column(String(150), nullable=False)
    type: Mapped[str] = mapped_column(String(50), nullable=False)
    owner_name: Mapped[str] = mapped_column(String(100), nullable=False)
    upload_date: Mapped[date] = mapped_column(Date, nullable=False)
    file_size: Mapped[str] = mapped_column(String(20), nullable=False)
    expiry_date: Mapped[date | None] = mapped_column(Date)
    status: Mapped[str] = mapped_column(String(20), nullable=False, default="Active")


class AppNotification(Base, TimestampMixin):
    __tablename__ = "notifications"

    id: Mapped[str] = mapped_column(String(50), primary_key=True)
    title: Mapped[str] = mapped_column(String(150), nullable=False)
    body: Mapped[str] = mapped_column(Text, nullable=False)
    date: Mapped[str] = mapped_column(String(50), nullable=False)
    type: Mapped[str] = mapped_column(String(50), nullable=False)
    is_read: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
