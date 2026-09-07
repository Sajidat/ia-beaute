from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from app.database import get_db
from app.models import Product

router = APIRouter()

SEED_PRODUCTS = [
    {
        "name": "Sérum Hydra Glow",
        "category": "Sérum",
        "description": "Sérum léger à l'acide hyaluronique pour soutenir l'hydratation et l'éclat.",
        "skin_types": "Sèche,Mixte,Normale",
        "price": 24.90, "image": "/images/product-1.jpg", "rating": 4.7,
    },
    {
        "name": "Crème Barrier Care",
        "category": "Crème",
        "description": "Crème confort pensée pour renforcer la barrière cutanée et limiter la déshydratation.",
        "skin_types": "Sèche,Sensible,Normale",
        "price": 19.90, "image": "/images/product-2.jpg", "rating": 4.6,
    },
    {
        "name": "Daily Shield SPF 50",
        "category": "Protection solaire",
        "description": "Protection solaire quotidienne SPF 50 avec une texture facile à intégrer à une routine.",
        "skin_types": "Sèche,Mixte,Normale,Grasse",
        "price": 17.90, "image": "/images/product-3.jpg", "rating": 4.8,
    },
    {
        "name": "Base Lumière",
        "category": "Maquillage",
        "description": "Base légère pour un fini naturel et lumineux avant le maquillage.",
        "skin_types": "Sèche,Mixte,Normale",
        "price": 22.50, "image": "/images/product-4.jpg", "rating": 4.5,
    },
]

def serialize(p: Product):
    return {
        "id": p.id, "name": p.name, "category": p.category,
        "description": p.description, "skin_types": p.skin_types.split(","),
        "price": p.price, "image": p.image, "rating": p.rating,
    }

def seed_products(db: Session):
    if db.query(Product).count() == 0:
        for item in SEED_PRODUCTS:
            db.add(Product(**item))
        db.commit()

@router.get("/")
def products(skin_type: str | None = Query(default=None), db: Session = Depends(get_db)):
    seed_products(db)
    items = db.query(Product).order_by(Product.id).all()
    if skin_type:
        normalized = skin_type.strip().lower()
        items = [
            p for p in items
            if normalized in [x.strip().lower() for x in p.skin_types.split(",")]
        ]
    return [serialize(p) for p in items]

@router.get("/{product_id}")
def product(product_id: int, db: Session = Depends(get_db)):
    seed_products(db)
    item = db.get(Product, product_id)
    if not item:
        return {"detail": "Produit introuvable"}
    return serialize(item)
