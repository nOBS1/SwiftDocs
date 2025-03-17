from fastapi import APIRouter
from .translation import router as translation_router
from .ocr import router as ocr_router
from .pdfmath import router as pdfmath_router

api_router = APIRouter()

api_router.include_router(translation_router, prefix="/translation", tags=["translation"])
api_router.include_router(ocr_router, prefix="/ocr", tags=["ocr"])
api_router.include_router(pdfmath_router, prefix="/pdfmath", tags=["pdfmath"]) 