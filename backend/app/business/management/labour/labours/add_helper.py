from fastapi import APIRouter

router = APIRouter(prefix="/api/v1/labours", tags=["labours"])


@router.get("/helpers/info")
def helpers_info():
    return {"message": "Helper profiles are managed under the main labours registry endpoint."}
