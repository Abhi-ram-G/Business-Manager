from fastapi import APIRouter

router = APIRouter(prefix="/api/v1/business/reports", tags=["business"])


@router.get("/info")
def reports_info():
    return {"message": "Business reports generation and consolidated auditing metrics."}
