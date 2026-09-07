from fastapi import APIRouter
from pydantic import BaseModel

router = APIRouter()

class Message(BaseModel):
    message: str

def answer_for(text: str) -> str:
    text = text.lower()
    if any(x in text for x in ["sec", "sèche", "deshyd", "déshyd"]):
        return "Pour une peau sèche, partez sur un nettoyant doux, un sérum hydratant, une crème aux céramides et un SPF 50 le matin."
    if any(x in text for x in ["grasse", "brillance", "sébum"]):
        return "Pour une peau grasse, privilégiez des textures légères non comédogènes, la niacinamide et une protection solaire fluide."
    if any(x in text for x in ["mixte", "zone t"]):
        return "Pour une peau mixte, utilisez des textures légères et adaptez l'hydratation : davantage sur les joues et plus légère sur la zone T."
    if any(x in text for x in ["acné", "acne", "bouton", "imperfection"]):
        return "Pour les imperfections, évitez de multiplier les actifs. Une routine douce et progressive est préférable. En cas de problème persistant, demandez conseil à un dermatologue."
    if any(x in text for x in ["spf", "soleil", "uv"]):
        return "Une protection SPF 50 chaque matin est une bonne habitude, particulièrement lorsque vous êtes exposé(e) aux UV."
    if any(x in text for x in ["routine", "matin", "soir"]):
        return "Je peux vous proposer une routine matin/soir selon votre type de peau : sèche, mixte, normale ou grasse."
    return "Je suis votre assistant IA Beauté 🌸. Parlez-moi de votre type de peau, de votre objectif (hydratation, éclat, imperfections) ou demandez-moi une routine."

@router.post("/")
def chat(payload: Message):
    return {"answer": answer_for(payload.message)}
