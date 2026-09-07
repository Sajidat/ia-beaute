# IA Beauté 🌸 — version complète

Application portfolio full-stack : **React/Vite + FastAPI + PostgreSQL + Docker**.

## Fonctionnalités

- Accueil responsive avec visuels beauté
- Upload d'une photo JPG/PNG/WEBP
- Analyse indicatrice reproductible : type de peau, hydratation, éclat, texture, score
- Historique des analyses enregistré dans PostgreSQL
- Routine personnalisée matin/soir
- Catalogue de produits chargé depuis l'API et stocké en PostgreSQL
- Filtrage des produits selon le type de peau
- Assistant beauté connecté à FastAPI
- Aperçu maquillage avec réglage d'intensité
- Indicateur de connexion à l'API
- Docker Compose avec healthcheck PostgreSQL

> L'analyse d'image actuelle est un **MVP de démonstration** : elle ne constitue pas une vraie détection dermatologique et ne remplace pas un modèle de computer vision ni un avis médical.

## Lancement

Dans PowerShell, depuis `ia-beaute` :

```powershell
docker compose down
docker compose up --build
```

Puis :

- Frontend : http://localhost:5173
- API : http://localhost:8000
- Documentation Swagger : http://localhost:8000/docs
- Healthcheck : http://localhost:8000/health

## Si un ancien conteneur occupe le port 8000 ou 5432

```powershell
docker compose down
docker ps
```

Le compose n'expose pas PostgreSQL sur le PC : il est accessible uniquement par le backend. Cela évite les conflits avec un PostgreSQL déjà installé sur Windows.

## API principale

- `POST /api/analysis/` — analyse et sauvegarde
- `GET /api/analysis/history` — historique
- `GET /api/products/` — catalogue
- `GET /api/products/?skin_type=Sèche` — catalogue filtré
- `GET /api/products/{id}` — produit
- `POST /api/routine/` — routine personnalisée
- `POST /api/chat/` — assistant
- `GET /health` — état de l'API
