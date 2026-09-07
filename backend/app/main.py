from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.database import Base, engine
from app import models
from app.routes import analysis, chat, products, routine

app = FastAPI(
    title="IA Beauté API",
    version="2.0.0",
    description="API de démonstration pour analyse de peau, routines, produits et assistant beauté."
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("startup")
def startup():
    Base.metadata.create_all(bind=engine)


app.include_router(analysis.router, prefix="/api/analysis", tags=["Analyse"])
app.include_router(chat.router, prefix="/api/chat", tags=["Chat"])
app.include_router(products.router, prefix="/api/products", tags=["Produits"])
app.include_router(routine.router, prefix="/api/routine", tags=["Routine"])

@app.get("/")
def home():
    return {"message": "Bienvenue sur IA Beauté API 🌸", "version": "2.0.0", "docs": "/docs"}

@app.get("/health")
def health():
    return {"status": "ok", "service": "ia-beaute-api"}
