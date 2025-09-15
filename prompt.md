# Prompt Expert : CRUD Fastify-Redis pour Product

## Contexte

Créer une API REST complète avec Fastify et Redis pour gérer des produits avec toutes les bonnes pratiques.

## Spécifications Techniques

### Modèle Product

```typescript
interface Product {
  id: string;        // UUID v4
  name: string;      // 2-100 caractères, requis
  description: string; // 10-500 caractères, requis  
  price: number;     // > 0, max 2 décimales
  qty: number;       // >= 0, entier
  createdAt: string; // ISO timestamp
  updatedAt: string; // ISO timestamp
}
```

### Stack Technique

- **Fastify** (dernière version)
- **Redis** comme base de données
- **TypeScript** strict
- **Validation** avec Joi ou Ajv
- **UUID** v4 pour les IDs
- **Logging** structuré
- **Tests** Jest + Supertest
- **Docker** pour Redis

### Fonctionnalités Requises

#### 1. Routes CRUD

- `POST /products` - Créer un produit
- `GET /products` - Lister tous (pagination)
- `GET /products/:id` - Récupérer par ID
- `PUT /products/:id` - Modifier complet
- `PATCH /products/:id` - Modification partielle
- `DELETE /products/:id` - Supprimer

#### 2. Validation des Données

- **Name** : string, 2-100 chars, trim, required
- **Description** : string, 10-500 chars, trim, required
- **Price** : number, > 0, max 2 décimales, required
- **Qty** : integer, >= 0, required
- **ID** : UUID v4 valide pour les routes paramétrées

#### 3. Gestion des Erreurs

- 400 : Données invalides
- 404 : Produit non trouvé
- 409 : Conflit (nom déjà existant)
- 500 : Erreur serveur
- Format d'erreur standardisé

#### 4. Fonctionnalités Avancées

- **Pagination** : limit/offset pour GET /products
- **Filtrage** : par nom, prix min/max
- **Logging** : Winston avec corrélation ID
- **Middleware** : validation, auth basique, CORS
- **Métriques** : temps de réponse, compteurs
- **Cache** : stratégie Redis optimisée
- **Tests** : couverture > 90%

### Structure Redis

- Clé produit : `product:{uuid}`
- Index noms : `product:names` (SET)
- Liste IDs : `product:ids` (LIST)
- Compteur : `product:counter`

### Exigences Qualité

1. **Code TypeScript** strict avec types complets
2. **Validation** robuste entrées/sorties avec messages personnalisés
3. **Gestion erreurs** complète et cohérente
4. **Documentation Swagger** complète et interactive
5. **Logging** structuré avec contexte et corrélation
6. **Tests unitaires** et d'intégration (>90% couverture)
7. **Optimisation** : requêtes, connexions, cache
8. **Configuration** par variables d'environnement
9. **Middleware** réutilisables et modulaires
10. **Performance** : pagination, index, compression

### Livrable Attendu

- **Architecture modulaire** claire (controllers, services, models)
- **Configuration Fastify** complète avec plugins
- **Connexion DB** sécurisée avec pool
- **Validation schémas** Joi/Ajv avec messages français
- **Gestionnaire d'erreurs** centralisé
- **Service Product** avec logique métier
- **Controllers REST** standards avec pagination
- **Documentation Swagger** complète et exemples
- **Tests complets** avec mocks et fixtures
- **Seeder** avec données réalistes
- **Script de démarrage** avec options

### Structure Fichiers

```text
src/
├── config/          # Configuration DB, Swagger
├── controllers/     # Endpoints REST
├── services/        # Logique métier
├── models/          # Schémas et types
├── middleware/      # Validations, auth, logging
├── utils/           # Helpers, constants
├── seeds/           # Données de test
├── tests/           # Tests unitaires/intégration
└── docs/            # Documentation technique
```

### Contraintes

- **Performance** : <100ms pour CRUD simples
- **Mémoire** : optimisation requêtes/cache
- **Sécurité** : validation stricte, sanitisation
- **Maintenabilité** : code documenté et modulaire
- **Production-ready** : logs, monitoring, erreurs
- **Seed désactivable** : via ENV variable

Produis un code complet, optimisé et professionnel avec documentation Swagger interactive.