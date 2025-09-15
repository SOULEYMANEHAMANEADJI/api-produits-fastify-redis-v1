import { FastifyInstance } from 'fastify';
import { createServer } from '../../server.js';
import { redisClient } from '../../config/redis.js';
import { ProductService } from '../../services/ProductService.js';

describe('ProductController Integration Tests', () => {
  let app: FastifyInstance;
  let productService: ProductService;

  beforeAll(async () => {
    // Créer le serveur
    app = await createServer();
    
    // Se connecter à Redis
    await redisClient.connect();
    
    // Créer le service
    productService = new ProductService();
    
    // Vider la base de données de test
    await productService.clearAllProducts();
  });

  afterAll(async () => {
    // Nettoyer
    await productService.clearAllProducts();
    await redisClient.disconnect();
    await app.close();
  });

  beforeEach(async () => {
    // Vider les produits avant chaque test
    await productService.clearAllProducts();
  });

  describe('POST /api/v1/products', () => {
    it('should create a new product', async () => {
      const productData = {
        name: 'Test Product',
        description: 'This is a test product description',
        price: 99.99,
        qty: 10,
      };

      const response = await app.inject({
        method: 'POST',
        url: '/api/v1/products',
        payload: productData,
      });

      expect(response.statusCode).toBe(201);
      const body = JSON.parse(response.body);
      expect(body.success).toBe(true);
      expect(body.data).toMatchObject({
        name: productData.name,
        description: productData.description,
        price: productData.price,
        qty: productData.qty,
      });
      expect(body.data.id).toBeDefined();
      expect(body.data.createdAt).toBeDefined();
      expect(body.data.updatedAt).toBeDefined();
    });

    it('should return 400 for invalid data', async () => {
      const invalidData = {
        name: '', // Too short
        description: 'Short', // Too short
        price: -10, // Negative
        qty: -5, // Negative
      };

      const response = await app.inject({
        method: 'POST',
        url: '/api/v1/products',
        payload: invalidData,
      });

      expect(response.statusCode).toBe(400);
      const body = JSON.parse(response.body);
      expect(body.success).toBe(false);
      expect(body.error).toBe('ValidationError');
    });

    it('should return 409 for duplicate name', async () => {
      const productData = {
        name: 'Duplicate Product',
        description: 'This is a test product description',
        price: 99.99,
        qty: 10,
      };

      // Créer le premier produit
      await app.inject({
        method: 'POST',
        url: '/api/v1/products',
        payload: productData,
      });

      // Essayer de créer un produit avec le même nom
      const response = await app.inject({
        method: 'POST',
        url: '/api/v1/products',
        payload: productData,
      });

      expect(response.statusCode).toBe(409);
      const body = JSON.parse(response.body);
      expect(body.success).toBe(false);
      expect(body.error).toBe('ConflictError');
    });
  });

  describe('GET /api/v1/products/:id', () => {
    it('should get a product by id', async () => {
      // Créer un produit
      const createResponse = await app.inject({
        method: 'POST',
        url: '/api/v1/products',
        payload: {
          name: 'Test Product',
          description: 'This is a test product description',
          price: 99.99,
          qty: 10,
        },
      });

      const createdProduct = JSON.parse(createResponse.body).data;

      // Récupérer le produit
      const response = await app.inject({
        method: 'GET',
        url: `/api/v1/products/${createdProduct.id}`,
      });

      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.body);
      expect(body.success).toBe(true);
      expect(body.data).toEqual(createdProduct);
    });

    it('should return 404 for non-existent product', async () => {
      const fakeId = '123e4567-e89b-12d3-a456-426614174000';

      const response = await app.inject({
        method: 'GET',
        url: `/api/v1/products/${fakeId}`,
      });

      expect(response.statusCode).toBe(404);
      const body = JSON.parse(response.body);
      expect(body.success).toBe(false);
      expect(body.error).toBe('NotFoundError');
    });

    it('should return 400 for invalid id format', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/api/v1/products/invalid-id',
      });

      expect(response.statusCode).toBe(400);
      const body = JSON.parse(response.body);
      expect(body.success).toBe(false);
      expect(body.error).toBe('ValidationError');
    });
  });

  describe('GET /api/v1/products', () => {
    beforeEach(async () => {
      // Créer plusieurs produits pour les tests de pagination
      const products = [
        { name: 'Product 1', description: 'Description 1', price: 10.99, qty: 5 },
        { name: 'Product 2', description: 'Description 2', price: 20.99, qty: 10 },
        { name: 'Product 3', description: 'Description 3', price: 30.99, qty: 15 },
        { name: 'Product 4', description: 'Description 4', price: 40.99, qty: 20 },
        { name: 'Product 5', description: 'Description 5', price: 50.99, qty: 25 },
      ];

      for (const product of products) {
        await app.inject({
          method: 'POST',
          url: '/api/v1/products',
          payload: product,
        });
      }
    });

    it('should get all products with pagination', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/api/v1/products?page=1&limit=3',
      });

      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.body);
      expect(body.success).toBe(true);
      expect(body.data).toHaveLength(3);
      expect(body.pagination).toEqual({
        page: 1,
        limit: 3,
        total: 5,
        totalPages: 2,
      });
    });

    it('should filter products by name', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/api/v1/products?name=Product 1',
      });

      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.body);
      expect(body.success).toBe(true);
      expect(body.data).toHaveLength(1);
      expect(body.data[0].name).toBe('Product 1');
    });

    it('should filter products by price range', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/api/v1/products?minPrice=20&maxPrice=40',
      });

      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.body);
      expect(body.success).toBe(true);
      expect(body.data).toHaveLength(3);
      body.data.forEach((product: any) => {
        expect(product.price).toBeGreaterThanOrEqual(20);
        expect(product.price).toBeLessThanOrEqual(40);
      });
    });

    it('should return empty list when no products match filters', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/api/v1/products?name=Nonexistent',
      });

      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.body);
      expect(body.success).toBe(true);
      expect(body.data).toHaveLength(0);
    });
  });

  describe('PUT /api/v1/products/:id', () => {
    let productId: string;

    beforeEach(async () => {
      // Créer un produit pour les tests de mise à jour
      const createResponse = await app.inject({
        method: 'POST',
        url: '/api/v1/products',
        payload: {
          name: 'Original Product',
          description: 'Original description',
          price: 99.99,
          qty: 10,
        },
      });

      productId = JSON.parse(createResponse.body).data.id;
    });

    it('should update a product completely', async () => {
      const updateData = {
        name: 'Updated Product',
        description: 'Updated description',
        price: 149.99,
        qty: 20,
      };

      const response = await app.inject({
        method: 'PUT',
        url: `/api/v1/products/${productId}`,
        payload: updateData,
      });

      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.body);
      expect(body.success).toBe(true);
      expect(body.data).toMatchObject(updateData);
      expect(body.data.id).toBe(productId);
    });

    it('should return 404 for non-existent product', async () => {
      const fakeId = '123e4567-e89b-12d3-a456-426614174000';
      const updateData = {
        name: 'Updated Product',
        description: 'Updated description',
        price: 149.99,
        qty: 20,
      };

      const response = await app.inject({
        method: 'PUT',
        url: `/api/v1/products/${fakeId}`,
        payload: updateData,
      });

      expect(response.statusCode).toBe(404);
      const body = JSON.parse(response.body);
      expect(body.success).toBe(false);
      expect(body.error).toBe('NotFoundError');
    });
  });

  describe('PATCH /api/v1/products/:id', () => {
    let productId: string;

    beforeEach(async () => {
      // Créer un produit pour les tests de mise à jour partielle
      const createResponse = await app.inject({
        method: 'POST',
        url: '/api/v1/products',
        payload: {
          name: 'Original Product',
          description: 'Original description',
          price: 99.99,
          qty: 10,
        },
      });

      productId = JSON.parse(createResponse.body).data.id;
    });

    it('should update a product partially', async () => {
      const patchData = {
        name: 'Patched Product',
        price: 149.99,
      };

      const response = await app.inject({
        method: 'PATCH',
        url: `/api/v1/products/${productId}`,
        payload: patchData,
      });

      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.body);
      expect(body.success).toBe(true);
      expect(body.data.name).toBe('Patched Product');
      expect(body.data.price).toBe(149.99);
      expect(body.data.description).toBe('Original description'); // Non modifié
      expect(body.data.qty).toBe(10); // Non modifié
    });

    it('should return 400 for empty patch data', async () => {
      const response = await app.inject({
        method: 'PATCH',
        url: `/api/v1/products/${productId}`,
        payload: {},
      });

      expect(response.statusCode).toBe(400);
      const body = JSON.parse(response.body);
      expect(body.success).toBe(false);
      expect(body.error).toBe('ValidationError');
    });
  });

  describe('DELETE /api/v1/products/:id', () => {
    it('should delete a product', async () => {
      // Créer un produit
      const createResponse = await app.inject({
        method: 'POST',
        url: '/api/v1/products',
        payload: {
          name: 'Product to Delete',
          description: 'This product will be deleted',
          price: 99.99,
          qty: 10,
        },
      });

      const productId = JSON.parse(createResponse.body).data.id;

      // Supprimer le produit
      const response = await app.inject({
        method: 'DELETE',
        url: `/api/v1/products/${productId}`,
      });

      expect(response.statusCode).toBe(204);
      expect(response.body).toBe('');

      // Vérifier que le produit n'existe plus
      const getResponse = await app.inject({
        method: 'GET',
        url: `/api/v1/products/${productId}`,
      });

      expect(getResponse.statusCode).toBe(404);
    });

    it('should return 404 for non-existent product', async () => {
      const fakeId = '123e4567-e89b-12d3-a456-426614174000';

      const response = await app.inject({
        method: 'DELETE',
        url: `/api/v1/products/${fakeId}`,
      });

      expect(response.statusCode).toBe(404);
      const body = JSON.parse(response.body);
      expect(body.success).toBe(false);
      expect(body.error).toBe('NotFoundError');
    });
  });

  describe('GET /api/v1/products/stats', () => {
    it('should get product statistics', async () => {
      // Créer quelques produits
      await app.inject({
        method: 'POST',
        url: '/api/v1/products',
        payload: {
          name: 'Product 1',
          description: 'Description 1',
          price: 10.99,
          qty: 5,
        },
      });

      await app.inject({
        method: 'POST',
        url: '/api/v1/products',
        payload: {
          name: 'Product 2',
          description: 'Description 2',
          price: 20.99,
          qty: 10,
        },
      });

      const response = await app.inject({
        method: 'GET',
        url: '/api/v1/products/stats',
      });

      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.body);
      expect(body.success).toBe(true);
      expect(body.data.totalProducts).toBe(2);
      expect(body.data.timestamp).toBeDefined();
    });
  });
});
