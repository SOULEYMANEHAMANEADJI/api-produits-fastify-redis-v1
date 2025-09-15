# 🤝 Guide de contribution

Merci de votre intérêt pour contribuer à ce projet ! Ce guide vous aidera à comprendre comment contribuer efficacement.

## 📋 Table des matières

- [🚀 Démarrage rapide](#-démarrage-rapide)
- [🌿 Workflow Git](#-workflow-git)
- [📝 Standards de code](#-standards-de-code)
- [🧪 Tests](#-tests)
- [📚 Documentation](#-documentation)
- [🐛 Signaler un bug](#-signaler-un-bug)
- [✨ Proposer une fonctionnalité](#-proposer-une-fonctionnalité)
- [📋 Checklist Pull Request](#-checklist-pull-request)

## 🚀 Démarrage rapide

### 1. Fork et cloner le projet

```bash
# 1. Fork le projet sur GitHub
# 2. Cloner votre fork
git clone https://github.com/VOTRE-USERNAME/api-produits-fastify-redis.git
cd api-produits-fastify-redis

# 3. Ajouter le repository original comme remote
git remote add upstream https://github.com/EDACY-ONLINE-2025/api-produits-fastify-redis.git
```

### 2. Configuration de l'environnement

```bash
# Installer les dépendances
npm install

# Démarrer Redis
npm run docker:redis

# Configurer l'environnement
cp env.example .env

# Peupler la base de données
npm run seed

# Démarrer en mode développement
npm run dev
```

### 3. Vérifier que tout fonctionne

```bash
# Tester l'API
curl http://localhost:3000/api/v1/health

# Lancer les tests
npm test

# Vérifier la couverture
npm run test:coverage
```

## 🌿 Workflow Git

### Branches

- `main` : Branche principale, toujours stable
- `feature/*` : Nouvelles fonctionnalités
- `fix/*` : Corrections de bugs
- `docs/*` : Documentation uniquement
- `refactor/*` : Refactoring du code

### Convention de nommage des branches

```bash
feature/ajouter-authentification
fix/correction-validation-prix
docs/mise-a-jour-readme
refactor/optimisation-redis
```

### Workflow complet

```bash
# 1. Synchroniser avec upstream
git fetch upstream
git checkout main
git merge upstream/main

# 2. Créer une nouvelle branche
git checkout -b feature/ma-nouvelle-fonctionnalite

# 3. Faire vos modifications
# ... code ...

# 4. Ajouter et commiter
git add .
git commit -m "feat: ajouter authentification JWT"

# 5. Pousser votre branche
git push origin feature/ma-nouvelle-fonctionnalite

# 6. Créer une Pull Request sur GitHub
```

## 📝 Standards de code

### TypeScript

```typescript
// ✅ Bon
interface Product {
  id: string;
  name: string;
  price: number;
  createdAt: Date;
}

// ❌ Éviter
interface Product {
  id: any;
  name: any;
  price: any;
  createdAt: any;
}
```

### Nommage

```typescript
// ✅ Bon
const productService = new ProductService();
const getProductById = async (id: string) => {};

// ❌ Éviter
const ps = new ProductService();
const getProd = async (id: string) => {};
```

### Commentaires

```typescript
// ✅ Bon - Commentaire JSDoc
/**
 * Récupère un produit par son ID
 * @param id - L'identifiant unique du produit
 * @returns Promise<Product | null>
 */
async getProductById(id: string): Promise<Product | null> {
  // Implementation
}

// ❌ Éviter - Commentaires inutiles
// Récupère un produit
async getProductById(id: string) {
  // ...
}
```

## 🧪 Tests

### Structure des tests

```
src/tests/
├── unit/           # Tests unitaires
│   ├── Product.test.ts
│   └── ProductService.test.ts
├── integration/    # Tests d'intégration
│   ├── ProductController.test.ts
│   └── HealthController.test.ts
└── setup.ts        # Configuration Jest
```

### Exemple de test unitaire

```typescript
describe('ProductService', () => {
  let productService: ProductService;

  beforeEach(() => {
    productService = new ProductService();
  });

  describe('createProduct', () => {
    it('devrait créer un produit avec les bonnes propriétés', async () => {
      const productData = {
        name: 'Test Product',
        description: 'Description test',
        price: 99.99,
        qty: 10
      };

      const product = await productService.createProduct(productData);

      expect(product).toMatchObject({
        name: productData.name,
        price: productData.price,
        qty: productData.qty
      });
      expect(product.id).toBeDefined();
      expect(product.createdAt).toBeDefined();
    });
  });
});
```

### Exemple de test d'intégration

```typescript
describe('ProductController Integration', () => {
  let app: FastifyInstance;

  beforeEach(async () => {
    app = await createTestServer();
  });

  afterEach(async () => {
    await app.close();
  });

  it('devrait créer un produit via l\'API', async () => {
    const response = await app.inject({
      method: 'POST',
      url: '/api/v1/products',
      payload: {
        name: 'Test Product',
        description: 'Description test',
        price: 99.99,
        qty: 10
      }
    });

    expect(response.statusCode).toBe(201);
    expect(response.json()).toMatchObject({
      success: true,
      data: {
        name: 'Test Product',
        price: 99.99
      }
    });
  });
});
```

### Exécuter les tests

```bash
# Tous les tests
npm test

# Tests en mode watch
npm run test:watch

# Tests avec couverture
npm run test:coverage

# Tests spécifiques
npm test -- --testNamePattern="ProductService"
```

## 📚 Documentation

### Mise à jour du README

- Ajouter les nouvelles fonctionnalités dans la section appropriée
- Mettre à jour les exemples de code
- Vérifier que tous les liens fonctionnent
- Ajouter des captures d'écran si nécessaire

### Documentation du code

```typescript
/**
 * Service pour la gestion des produits
 * @class ProductService
 */
export class ProductService {
  /**
   * Crée un nouveau produit dans la base de données
   * @param productData - Les données du produit à créer
   * @returns Promise<Product> - Le produit créé avec son ID
   * @throws {ValidationError} Si les données sont invalides
   * @throws {ConflictError} Si un produit avec le même nom existe déjà
   */
  async createProduct(productData: CreateProductRequest): Promise<Product> {
    // Implementation
  }
}
```

## 🐛 Signaler un bug

### Avant de créer une issue

1. Vérifier que le bug n'existe pas déjà
2. Tester avec la dernière version
3. Vérifier la documentation

### Template d'issue pour bug

```markdown
## 🐛 Description du bug

Description claire et concise du problème.

## 🔄 Étapes pour reproduire

1. Aller à '...'
2. Cliquer sur '....'
3. Faire défiler jusqu'à '....'
4. Voir l'erreur

## ✅ Comportement attendu

Description de ce qui devrait se passer.

## ❌ Comportement actuel

Description de ce qui se passe actuellement.

## 🖥️ Environnement

- OS: [ex: Windows 10, macOS 12, Ubuntu 20.04]
- Node.js: [ex: v18.17.0]
- Redis: [ex: v7.0.12]
- Version de l'API: [ex: 1.0.0]

## 📝 Logs d'erreur

```
[Coller les logs d'erreur ici]
```

## 📸 Captures d'écran

Si applicable, ajouter des captures d'écran.
```

## ✨ Proposer une fonctionnalité

### Template d'issue pour fonctionnalité

```markdown
## ✨ Description de la fonctionnalité

Description claire et concise de la fonctionnalité souhaitée.

## 🎯 Problème résolu

Quel problème cette fonctionnalité résoudrait-elle ?

## 💡 Solution proposée

Description de la solution que vous aimeriez voir.

## 🔄 Alternatives considérées

Décrire d'autres solutions alternatives que vous avez considérées.

## 📊 Impact

- [ ] Breaking change
- [ ] Amélioration de performance
- [ ] Nouvelle fonctionnalité
- [ ] Correction de bug
- [ ] Documentation
```

## 📋 Checklist Pull Request

### Avant de soumettre

- [ ] Code compilé sans erreurs TypeScript
- [ ] Tests unitaires et d'intégration passent
- [ ] Couverture de code > 90%
- [ ] Documentation mise à jour (README, JSDoc)
- [ ] Variables d'environnement documentées
- [ ] Respect des conventions de nommage
- [ ] Gestion d'erreurs appropriée
- [ ] Logs structurés ajoutés si nécessaire
- [ ] Messages de commit conformes aux conventions

### Template de Pull Request

```markdown
## 📝 Description

Description détaillée des changements apportés.

## 🔗 Issues liées

Fixes #123
Closes #456

## 🧪 Tests

- [ ] Tests unitaires ajoutés/mis à jour
- [ ] Tests d'intégration ajoutés/mis à jour
- [ ] Tous les tests passent

## 📚 Documentation

- [ ] README mis à jour
- [ ] JSDoc ajouté/mis à jour
- [ ] Documentation API mise à jour

## 🔍 Checklist

- [ ] Code review effectué
- [ ] Tests passent
- [ ] Documentation à jour
- [ ] Pas de breaking changes (ou documentés)
```

## 🏷️ Types de commits

Utilisez [Conventional Commits](https://www.conventionalcommits.org/) :

```bash
feat: ajouter authentification JWT
fix: corriger validation des prix négatifs
docs: mettre à jour la documentation API
test: ajouter tests pour ProductService
refactor: optimiser les requêtes Redis
style: corriger le formatage du code
perf: améliorer les performances de la pagination
chore: mettre à jour les dépendances
```

## 🤝 Code Review

### En tant que contributeur

- Répondre aux commentaires rapidement
- Expliquer votre approche si nécessaire
- Tester les suggestions avant de les appliquer

### En tant que reviewer

- Être constructif et bienveillant
- Expliquer le "pourquoi" pas seulement le "quoi"
- Suggérer des améliorations, pas seulement des corrections

## 📞 Besoin d'aide ?

- 📧 Email: contact@edacy.com
- 💬 Issues GitHub: [Créer une issue](https://github.com/EDACY-ONLINE-2025/api-produits-fastify-redis/issues)
- 📚 Documentation: [Swagger UI](http://localhost:3000/docs)

---

Merci de contribuer à ce projet ! 🚀
