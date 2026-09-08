# 🌸 IA Beauté

> Application web full-stack dédiée à l'analyse de peau et aux recommandations beauté personnalisées.

IA Beauté est un projet portfolio combinant une interface moderne en **React/Vite**, une API **FastAPI**, une base de données **PostgreSQL** et une infrastructure **Docker Compose**.

L'application permet de simuler une analyse de peau, consulter un historique, générer une routine beauté personnalisée et explorer un catalogue de produits selon le type de peau.

---

## ✨ Fonctionnalités

### 🧴 Analyse de peau

- Upload d'une photo au format JPG, PNG ou WEBP
- Analyse indicative du profil de peau
- Estimation de plusieurs indicateurs :
  - Type de peau
  - Hydratation
  - Éclat
  - Texture
  - Score global
- Enregistrement des résultats dans PostgreSQL

> ⚠️ **Important :** l'analyse d'image actuelle est un **MVP de démonstration**. Elle ne constitue pas une véritable détection dermatologique, ne fournit pas de diagnostic médical et ne remplace pas l'avis d'un professionnel de santé.

### 📊 Historique

- Consultation des analyses précédentes
- Conservation des résultats dans PostgreSQL
- Consultation via l'API FastAPI

### 🌅 Routine beauté

- Génération d'une routine personnalisée
- Routine du matin
- Routine du soir
- Recommandations adaptées au type de peau

### 🛍️ Catalogue de produits

- Catalogue de produits accessible depuis l'API
- Stockage des produits dans PostgreSQL
- Filtrage selon le type de peau
- Consultation du détail d'un produit

### 💬 Assistant beauté

- Interface de conversation
- Communication avec FastAPI
- Réponses orientées vers les besoins beauté

### 💄 Aperçu maquillage

- Prévisualisation maquillage
- Réglage de l'intensité
- Interface interactive côté frontend

### 🔌 Supervision de l'application

- Indicateur de connexion à l'API
- Endpoint de healthcheck
- Healthcheck PostgreSQL avec Docker Compose

---

## 🏗️ Architecture

```text
                    🌸 IA Beauté
                         │
                         ▼
                ┌─────────────────┐
                │  React / Vite   │
                │    Frontend     │
                └────────┬────────┘
                         │ HTTP / REST
                         ▼
                ┌─────────────────┐
                │     FastAPI     │
                │     Backend     │
                └────────┬────────┘
                         │
              ┌──────────┴──────────┐
              ▼                     ▼
      ┌───────────────┐     ┌───────────────┐
      │   PostgreSQL  │     │ API / Routes  │
      │    Database   │     │               │
      └───────────────┘     └───────────────┘

              🐳 Docker Compose
              