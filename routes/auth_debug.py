from fastapi import APIRouter

router = APIRouter()

@router.post("/login")
async def debug_login():
    return {"message": "Auth router is alive!"}

@router.get("/me")
async def debug_me():
    return {"message": "Auth me is alive!"}
