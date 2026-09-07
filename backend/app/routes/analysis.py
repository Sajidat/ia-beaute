import hashlib
import json
from datetime import datetime
from fastapi import APIRouter, Depends, File, HTTPException, UploadFile
from sqlalchemy.orm import Session
from app.database import get_db
from app.models import AnalysisHistory

router = APIRouter()
ALLOWED_TYPES = {"image/jpeg", "image/png", "image/webp"}
MAX_SIZE = 10 * 1024 * 1024


def recommendations_for(skin_type: str):
    common = [
        "Utilisez un nettoyant doux matin et soir.",
        "Appliquez une protection solaire SPF 50 chaque matin.",
    ]
    specific = {
        "Sèche": ["Privilégiez un sérum à l'acide hyaluronique.", "Choisissez une crème riche en céramides."],
        "Mixte": ["Hydratez légèrement la zone T et les joues.", "Introduisez la niacinamide progressivement."],
        "Normale": ["Conservez une routine simple et régulière.", "Renforcez la barrière cutanée avec une hydratation quotidienne."],
        "Grasse": ["Préférez des textures légères non comédogènes.", "Évitez de multiplier les actifs exfoliants."],
    }
    return common + specific[skin_type]

@router.post("/")
async def analyze_skin(image: UploadFile = File(...), db: Session = Depends(get_db)):
    if image.content_type not in ALLOWED_TYPES:
        raise HTTPException(400, "Format non pris en charge. Utilisez JPEG, PNG ou WEBP.")

    content = await image.read()
    if not content:
        raise HTTPException(400, "Le fichier est vide.")
    if len(content) > MAX_SIZE:
        raise HTTPException(400, "L'image ne doit pas dépasser 10 Mo.")

    # Analyse MVP déterministe : même image = même résultat.
    digest = hashlib.sha256(content).digest()
    hydration = 60 + digest[0] % 36
    radiance = 58 + digest[1] % 38
    texture = 60 + digest[2] % 34
    score = round((hydration + radiance + texture) / 3)
    skin_types = ["Mixte", "Normale", "Sèche", "Grasse"]
    skin_type = skin_types[digest[3] % len(skin_types)]
    recommendations = recommendations_for(skin_type)

    record = AnalysisHistory(
        filename=image.filename or "image",
        score=score,
        skin_type=skin_type,
        hydration=hydration,
        radiance=radiance,
        texture=texture,
        recommendations=json.dumps(recommendations, ensure_ascii=False),
    )
    db.add(record)
    db.commit()
    db.refresh(record)

    return {
        "id": record.id,
        "filename": record.filename,
        "score": score,
        "skin_type": skin_type,
        "metrics": {"hydration": hydration, "radiance": radiance, "texture": texture},
        "recommendations": recommendations,
        "created_at": record.created_at.isoformat(),
        "disclaimer": "Résultat indicatif de démonstration. Cette application ne fournit pas de diagnostic médical.",
    }

@router.get("/history")
def history(limit: int = 20, db: Session = Depends(get_db)):
    limit = max(1, min(limit, 100))
    records = db.query(AnalysisHistory).order_by(AnalysisHistory.created_at.desc()).limit(limit).all()
    return [
        {
            "id": r.id, "filename": r.filename, "score": r.score,
            "skin_type": r.skin_type,
            "metrics": {"hydration": r.hydration, "radiance": r.radiance, "texture": r.texture},
            "recommendations": json.loads(r.recommendations),
            "created_at": r.created_at.isoformat(),
        }
        for r in records
    ]
