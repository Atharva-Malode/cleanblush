from fastapi import FastAPI, File
from fastapi.middleware.cors import CORSMiddleware
from ultralytics import YOLO
from osmf import router as osmf_router
from calculus import router as calculus_router
from gingivitis import router as gingi_router
from phenotype import router as pheno_router

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
osmf = YOLO('./best.pt', task="classify")

@app.get("/")
async def main():
    return {"message": "Hello World"}

app.include_router(osmf_router, prefix="/osmf", tags=["Disease"])
app.include_router(calculus_router, prefix="/calculus", tags=["Disease"])
app.include_router(gingi_router, prefix='/gingi', tags=['Disease'])
app.include_router(pheno_router, prefix='/pheno', tags=['Disease'])