from fastapi import APIRouter
from pydantic import BaseModel

router = APIRouter()

class RoutineRequest(BaseModel):
    skin_type: str = "Mixte"

ROUTINES = {
    "sèche": {
        "morning": ["Nettoyant doux sans sulfates", "Sérum acide hyaluronique", "Crème riche aux céramides", "SPF 50"],
        "evening": ["Démaquillant doux", "Nettoyant crémeux", "Sérum hydratant", "Crème réparatrice"],
        "tip": "Privilégiez les textures nourrissantes et évitez de multiplier les exfoliants."
    },
    "mixte": {
        "morning": ["Nettoyant doux", "Sérum niacinamide", "Hydratant léger", "SPF 50"],
        "evening": ["Nettoyant doux", "Sérum hydratant", "Hydratant léger", "Soin ciblé si nécessaire"],
        "tip": "Hydratez les joues tout en gardant une texture légère sur la zone T."
    },
    "normale": {
        "morning": ["Nettoyant doux", "Sérum antioxydant", "Crème hydratante", "SPF 50"],
        "evening": ["Nettoyant doux", "Sérum hydratant", "Crème barrière"],
        "tip": "Gardez une routine simple et régulière pour préserver l'équilibre cutané."
    },
    "grasse": {
        "morning": ["Nettoyant gel doux", "Sérum niacinamide", "Hydratant non comédogène", "SPF 50 fluide"],
        "evening": ["Nettoyant gel doux", "Sérum léger", "Hydratant non comédogène"],
        "tip": "Une peau grasse a aussi besoin d'hydratation : préférez les textures légères."
    }
}

@router.post("/")
def routine(data: RoutineRequest):
    key = data.skin_type.strip().lower()
    selected = ROUTINES.get(key, ROUTINES["mixte"])
    return {"skin_type": data.skin_type.title(), **selected}
