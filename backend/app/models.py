from datetime import datetime
from sqlalchemy import DateTime, Integer, String, Text
from sqlalchemy.orm import Mapped, mapped_column
from app.database import Base

class AnalysisHistory(Base):
    __tablename__ = "analysis_history"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    filename: Mapped[str] = mapped_column(String(255))
    score: Mapped[int] = mapped_column(Integer)
    skin_type: Mapped[str] = mapped_column(String(50))
    hydration: Mapped[int] = mapped_column(Integer)
    radiance: Mapped[int] = mapped_column(Integer)
    texture: Mapped[int] = mapped_column(Integer)
    recommendations: Mapped[str] = mapped_column(Text)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)

class Product(Base):
    __tablename__ = "products"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    name: Mapped[str] = mapped_column(String(120), unique=True)
    category: Mapped[str] = mapped_column(String(80))
    description: Mapped[str] = mapped_column(Text)
    skin_types: Mapped[str] = mapped_column(String(255))
    price: Mapped[float] = mapped_column()
    image: Mapped[str] = mapped_column(String(255))
    rating: Mapped[float] = mapped_column()
