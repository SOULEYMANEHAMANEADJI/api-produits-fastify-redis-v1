# 🚀 API Produits - Fastify Redis

[![Node.js](https://img.shields.io/badge/Node.js-18+-green.svg)](https://nodejs.org/)
[![Fastify](https://img.shields.io/badge/Fastify-4.24+-red.svg)](https://www.fastify.io/)
[![Redis](https://img.shields.io/badge/Redis-7.0+-red.svg)](https://redis.io/)

> **API REST simple** pour la gestion de produits avec **Fastify** et **Redis**. CRUD complet, documentation Swagger, et données de test incluses.

## 📋 Table des matières

- [✨ Fonctionnalités](#-fonctionnalités)
- [🏗️ Architecture](#️-architecture)
- [🚀 Installation rapide](#-installation-rapide)
- [📖 Guide d'utilisation](#-guide-dutilisation)
- [🔧 Configuration](#-configuration)
- [📚 Documentation API](#-documentation-api)
- [🧪 Tests](#-tests)
- [🐳 Docker](#-docker)
- [📊 Monitoring](#-monitoring)
- [🤝 Contribution](#-contribution)
- [📄 Licence](#-licence)

## ✨ Fonctionnalités

### 🎯 **Fonctionnalités principales**
- ✅ **CRUD complet** : Créer, lire, modifier, supprimer des produits
- ✅ **Pagination** : Navigation par pages
- ✅ **Filtrage** : Recherche par nom, prix
- ✅ **Documentation Swagger** : Interface interactive
- ✅ **Données de test** : 37 produits pré-chargés
- ✅ **Métriques** : Statistiques et monitoring

### 🛠️ **Technologies**
- **Backend** : Fastify (haute performance)
- **Base de données** : Redis (stockage en mémoire)
- **Documentation** : Swagger UI
- **Containerisation** : Docker

## 🏗️ Architecture

```
src/
├── config/          # Configuration
├── controllers/     # API Controllers
├── routes/          # Routes
├── services/        # Business Logic
├── seeds/           # Test Data
└── server.js        # Main Entry Point
```

## 🚀 Installation rapide

### Prérequis
- **Node.js** 18.0+ 
- **Redis** (ou Docker)

### 1️⃣ **Cloner et installer**
```bash
git clone https://github.com/SOULEYMANEHAMANEADJI/api-produits-fastify-redis-v1.git
cd api-produits-fastify-redis-v1
npm install
```

### 2️⃣ **Démarrer Redis**
```bash
# Avec Docker (recommandé)
npm run docker:redis

# Ou installation locale
redis-server
```

### 3️⃣ **Configurer et démarrer**
```bash
# Copier la configuration
cp env.example .env

# Démarrer l'API
npm run dev

# Peupler avec des données de test
npm run seed
```

## 📖 Guide d'utilisation

### 🌐 **Accès aux services**

| Service | URL | Description |
|---------|-----|-------------|
| **API** | `http://localhost:3000` | Point d'entrée principal |
| **Documentation** | `http://localhost:3000/docs` | Swagger UI |
| **Health Check** | `http://localhost:3000/api/v1/health` | État de l'API |
| **Métriques** | `http://localhost:3000/api/v1/metrics/products/stats` | Statistiques |

### 📝 **Exemples d'utilisation**

#### **Lister les produits**
```bash
curl http://localhost:3000/api/v1/products
```

#### **Créer un produit**
```bash
curl -X POST http://localhost:3000/api/v1/products \
  -H "Content-Type: application/json" \
  -d '{
    "name": "iPhone 15 Pro",
    "description": "Smartphone Apple avec écran Super Retina XDR",
    "price": 1199.99,
    "qty": 50
  }'
```

#### **Rechercher par nom**
```bash
curl "http://localhost:3000/api/v1/products?search=iPhone"
```

#### **Voir les statistiques**
```bash
curl http://localhost:3000/api/v1/metrics/products/stats
```

## 🔧 Configuration

Copiez `env.example` vers `.env` et ajustez selon vos besoins :

```bash
NODE_ENV=development
PORT=3000
REDIS_HOST=localhost
REDIS_PORT=6379
API_PREFIX=/api/v1
```

## 📚 Documentation API

La documentation complète est disponible sur : **http://localhost:3000/docs**

### **Endpoints principaux :**
- `GET /api/v1/products` - Lister les produits
- `POST /api/v1/products` - Créer un produit
- `GET /api/v1/products/:id` - Récupérer un produit
- `PUT /api/v1/products/:id` - Modifier un produit
- `DELETE /api/v1/products/:id` - Supprimer un produit
- `GET /api/v1/metrics/products/stats` - Statistiques

## 🧪 Tests

```bash
# Lancer les tests
npm test
```

## 🐳 Docker

```bash
# Démarrer Redis avec Docker
docker-compose up -d redis

# Arrêter
docker-compose down
```

## 📊 Monitoring

```bash
# Vérifier l'état de l'API
curl http://localhost:3000/api/v1/health

# Voir les statistiques
curl http://localhost:3000/api/v1/metrics/products/stats
```

## 🎯 **Données de test**

Le projet inclut **37 produits** de test dans différentes catégories :
- 📱 Électronique (iPhone, MacBook, etc.)
- 👕 Vêtements (Nike, Levis, etc.)  
- 🏠 Maison (Dyson, Nespresso, etc.)
- ⚽ Sports (Vélo, raquettes, etc.)

Pour les charger : `npm run seed`

## 🤝 Contribution

1. Fork le projet
2. Créer une branche : `git checkout -b feature/nouvelle-fonctionnalite`
3. Commiter : `git commit -m "feat: ajouter fonctionnalité"`
4. Pousser : `git push origin feature/nouvelle-fonctionnalite`
5. Créer une Pull Request

---

<div align="center">

**🚀 Développé par EDACY-ONLINE-2025**

[![GitHub](https://img.shields.io/badge/GitHub-Repository-black?logo=github)](https://github.com/SOULEYMANEHAMANEADJI/api-produits-fastify-redis-v1)

</div>