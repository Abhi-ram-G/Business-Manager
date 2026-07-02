from datetime import date as dt_date
from typing import Any, Literal

from pydantic import BaseModel, EmailStr, Field


class TokenRequest(BaseModel):
    username: str
    password: str


class ChangePasswordRequest(BaseModel):
    old_password: str
    new_password: str
    confirm_new_password: str


class TokenResponse(BaseModel):
    access_token: str
    token_type: Literal["bearer"] = "bearer"
    expires_in: int
    role: str
    name: str


class LabourBase(BaseModel):
    full_name: str
    phone: str
    skill_type: Literal["Driver", "Helper"]
    daily_wage: float
    joining_date: dt_date
    aadhaar_number: str
    address: str
    emergency_contact: str
    is_active: bool = True
    is_freezed: bool = False
    avatar_url: str | None = None
    license_number: str | None = None
    license_expiry_date: dt_date | None = None
    salary_per_month: float | None = None
    advance_entries: list[dict[str, Any]] | None = None
    pdf_attachment_name: str | None = None
    gender: str | None = None
    profile_photo: str | None = None
    profile_photo_name: str | None = None
    aadhaar_pdf_name: str | None = None
    aadhaar_pdf_data: str | None = None
    license_pdf_name: str | None = None
    license_pdf_data: str | None = None
    custom_documents: list[dict[str, Any]] | None = None


class LabourCreate(LabourBase):
    id: str


class LabourUpdate(BaseModel):
    full_name: str | None = None
    phone: str | None = None
    skill_type: Literal["Driver", "Helper"] | None = None
    daily_wage: float | None = None
    joining_date: dt_date | None = None
    aadhaar_number: str | None = None
    address: str | None = None
    emergency_contact: str | None = None
    is_active: bool | None = None
    is_freezed: bool | None = None
    avatar_url: str | None = None
    license_number: str | None = None
    license_expiry_date: dt_date | None = None
    salary_per_month: float | None = None
    advance_entries: list[dict[str, Any]] | None = None
    pdf_attachment_name: str | None = None
    gender: str | None = None
    profile_photo: str | None = None
    profile_photo_name: str | None = None
    aadhaar_pdf_name: str | None = None
    aadhaar_pdf_data: str | None = None
    license_pdf_name: str | None = None
    license_pdf_data: str | None = None
    custom_documents: list[dict[str, Any]] | None = None


class AttendanceItem(BaseModel):
    labour_id: str
    status: Literal["Present", "Absent", "Half-Day"]
    reason: str | None = None


class AttendanceBatch(BaseModel):
    date: dt_date
    records: list[AttendanceItem]


class VehicleBase(BaseModel):
    vehicle_name: str | None = None
    vehicle_type: Literal["Truck", "Tractor", "Car", "Van", "Two-Wheeler"]
    brand: str
    model: str
    registration_date: dt_date | None = None
    insurance_expiry: dt_date
    fitness_expiry: dt_date | None = None
    pollution_expiry: dt_date
    driver_name: str | None = None
    rc_expiry: dt_date | None = None
    insurance_number: str | None = None
    next_service_due: dt_date | None = None
    rc_book_pdf: str | None = None
    insurance_pdf: str | None = None
    permit_pdf: str | None = None
    fitness_pdf: str | None = None
    rc_book_data: str | None = None
    insurance_data: str | None = None
    permit_data: str | None = None
    fitness_data: str | None = None


class VehicleCreate(VehicleBase):
    id: str


class VehicleUpdate(BaseModel):
    vehicle_name: str | None = None
    vehicle_type: Literal["Truck", "Tractor", "Car", "Van", "Two-Wheeler"] | None = None
    brand: str | None = None
    model: str | None = None
    registration_date: dt_date | None = None
    insurance_expiry: dt_date | None = None
    fitness_expiry: dt_date | None = None
    pollution_expiry: dt_date | None = None
    driver_name: str | None = None
    rc_expiry: dt_date | None = None
    insurance_number: str | None = None
    next_service_due: dt_date | None = None
    rc_book_pdf: str | None = None
    insurance_pdf: str | None = None
    permit_pdf: str | None = None
    fitness_pdf: str | None = None
    rc_book_data: str | None = None
    insurance_data: str | None = None
    permit_data: str | None = None
    fitness_data: str | None = None


class FuelEntryCreate(BaseModel):
    id: str
    vehicle_id: str | None = None
    date: dt_date | None = None
    liters: float | None = None
    cost: float | None = None
    current_odometer: int | None = None
    fuel_type: str | None = None
    per_liter_cost: float | None = None
    vehicle_name: str | None = None


class TripCreate(BaseModel):
    id: str
    vehicle_id: str | None = None
    date: dt_date
    start_location: str
    end_location: str
    distance_covered: float
    revenue_earned: float


class LoanGivenCreate(BaseModel):
    id: str
    borrower_name: str | None = None
    person_name: str | None = None
    mobile_number: str | None = None
    address: str | None = None
    loan_amount: float | None = None
    amount_given: float | None = None
    interest_rate: float | None = None
    interest_percentage: float | None = None
    start_date: dt_date | None = None
    end_date: dt_date | None = None
    emi_amount: float | None = None
    due_date: str | None = None
    total_paid: float | None = None
    is_defaulter: bool | None = None
    interest_type: str | None = None
    category: str | None = None
    status: str | None = None
    monthly_interests: dict[str, str] | None = None


class LoanGivenUpdate(BaseModel):
    borrower_name: str | None = None
    person_name: str | None = None
    mobile_number: str | None = None
    address: str | None = None
    loan_amount: float | None = None
    amount_given: float | None = None
    interest_rate: float | None = None
    interest_percentage: float | None = None
    start_date: dt_date | None = None
    end_date: dt_date | None = None
    emi_amount: float | None = None
    due_date: str | None = None
    total_paid: float | None = None
    is_defaulter: bool | None = None
    interest_type: str | None = None
    category: str | None = None
    status: str | None = None
    monthly_interests: dict[str, str] | None = None


class LoanReceivedCreate(BaseModel):
    id: str
    lender_name: str | None = None
    person_name: str | None = None
    my_name: str | None = None
    borrowed_amount: float | None = None
    amount: float | None = None
    interest_rate: float | None = None
    interest_percentage: float | None = None
    start_date: dt_date | None = None
    end_date: dt_date | None = None
    monthly_emi: float | None = None
    due_date: str | None = None
    total_repaid: float | None = None
    interest_type: str | None = None
    interest_status: str | None = None
    category: str | None = None
    status: str | None = None
    vehicle_id: str | None = None
    number_of_months: int | None = None
    monthly_interests: dict[str, str] | None = None


class LoanReceivedUpdate(BaseModel):
    lender_name: str | None = None
    person_name: str | None = None
    my_name: str | None = None
    borrowed_amount: float | None = None
    amount: float | None = None
    interest_rate: float | None = None
    interest_percentage: float | None = None
    start_date: dt_date | None = None
    end_date: dt_date | None = None
    monthly_emi: float | None = None
    due_date: str | None = None
    total_repaid: float | None = None
    interest_type: str | None = None
    interest_status: str | None = None
    category: str | None = None
    status: str | None = None
    vehicle_id: str | None = None
    number_of_months: int | None = None
    monthly_interests: dict[str, str] | None = None


class EMICollectRequest(BaseModel):
    borrower_id: str
    amount_paid: float
    received_date: dt_date


class FamilyMemberCreate(BaseModel):
    id: str
    name: str
    relationship_name: str = Field(alias="relationship")


class FamilyMemberUpdate(BaseModel):
    name: str | None = None
    relationship_name: str | None = Field(default=None, alias="relationship")


class IncomeEntryCreate(BaseModel):
    id: str
    source: str
    amount: float
    date: dt_date


class IncomeEntryUpdate(BaseModel):
    source: str | None = None
    amount: float | None = None
    date: dt_date | None = None


class FamilyExpenseCreate(BaseModel):
    id: str
    family_member_name: str | None = None
    member_id: str | None = None
    date: dt_date
    reason: str | None = None
    category: str | None = None
    amount: float
    description: str | None = None


class FamilyExpenseUpdate(BaseModel):
    family_member_name: str | None = None
    member_id: str | None = None
    date: dt_date | None = None
    reason: str | None = None
    category: str | None = None
    amount: float | None = None
    description: str | None = None


class CategoryBudgetCreate(BaseModel):
    category: str
    limit: float
    spent: float = 0


class CategoryBudgetUpdate(BaseModel):
    limit: float | None = None
    spent: float | None = None


class DocumentCreate(BaseModel):
    id: str
    name: str
    type: str
    owner_name: str
    upload_date: dt_date
    file_size: str
    expiry_date: dt_date | None = None
    status: str = "Active"


class DocumentUpdate(BaseModel):
    name: str | None = None
    type: str | None = None
    owner_name: str | None = None
    upload_date: dt_date | None = None
    file_size: str | None = None
    expiry_date: dt_date | None = None
    status: str | None = None


class NotificationCreate(BaseModel):
    id: str
    title: str
    body: str
    date: str
    type: str
    is_read: bool = False


class NotificationUpdate(BaseModel):
    title: str | None = None
    body: str | None = None
    date: str | None = None
    type: str | None = None
    is_read: bool | None = None


class SalaryPaymentCreate(BaseModel):
    id: str
    labour_id: str
    date: dt_date
    amount_calculated: float
    advance_deducted: float = 0
    bonus: float = 0
    net_paid: float
    status: str
    salary_option: str
    deduct_amount_requested: float | None = None


class SalaryPaymentUpdate(BaseModel):
    labour_id: str | None = None
    date: dt_date | None = None
    amount_calculated: float | None = None
    advance_deducted: float | None = None
    bonus: float | None = None
    net_paid: float | None = None
    status: str | None = None
    salary_option: str | None = None
    deduct_amount_requested: float | None = None
