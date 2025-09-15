import { FastifyInstance } from 'fastify';
import { ProductController } from '../controllers/ProductController';
import { ValidationMiddleware } from '../middleware/validation';
import { 
  createProductSchema, 
  updateProductSchema, 
  patchProductSchema, 
  productIdSchema, 
  queryParamsSchema 
} from '../models/validation';

/**
 * Enregistre les routes des produits
 */
export async function productRoutes(fastify: FastifyInstance): Promise<void> {
  const productController = new ProductController();

  // POST /products - Créer un produit
  fastify.post('/', {
    preHandler: [
      ValidationMiddleware.validateBody(createProductSchema),
    ],
    schema: {
      description: 'Créer un nouveau produit',
      tags: ['products'],
      body: {
        $ref: '#/components/schemas/CreateProductRequest',
      },
      response: {
        201: {
          description: 'Produit créé avec succès',
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            data: { $ref: '#/components/schemas/Product' },
            message: { type: 'string' },
          },
        },
        400: {
          description: 'Données invalides',
          $ref: '#/components/schemas/ErrorResponse',
        },
        409: {
          description: 'Conflit - nom déjà existant',
          $ref: '#/components/schemas/ErrorResponse',
        },
        500: {
          description: 'Erreur serveur',
          $ref: '#/components/schemas/ErrorResponse',
        },
      },
    },
  }, productController.createProduct.bind(productController));

  // GET /products - Lister les produits avec pagination et filtres
  fastify.get('/', {
    preHandler: [
      ValidationMiddleware.validateQuery(queryParamsSchema),
    ],
    schema: {
      description: 'Lister les produits avec pagination et filtres',
      tags: ['products'],
      querystring: {
        type: 'object',
        properties: {
          page: {
            type: 'integer',
            minimum: 1,
            default: 1,
            description: 'Numéro de page',
          },
          limit: {
            type: 'integer',
            minimum: 1,
            maximum: 100,
            default: 10,
            description: 'Nombre d\'éléments par page',
          },
          name: {
            type: 'string',
            minLength: 1,
            maxLength: 100,
            description: 'Filtrer par nom (recherche partielle)',
          },
          minPrice: {
            type: 'number',
            minimum: 0.01,
            description: 'Prix minimum',
          },
          maxPrice: {
            type: 'number',
            minimum: 0.01,
            description: 'Prix maximum',
          },
        },
      },
      response: {
        200: {
          description: 'Liste des produits récupérée avec succès',
          $ref: '#/components/schemas/ProductListResponse',
        },
        400: {
          description: 'Paramètres de requête invalides',
          $ref: '#/components/schemas/ErrorResponse',
        },
        500: {
          description: 'Erreur serveur',
          $ref: '#/components/schemas/ErrorResponse',
        },
      },
    },
  }, productController.getProducts.bind(productController));

  // GET /products/stats - Statistiques des produits
  fastify.get('/stats', {
    schema: {
      description: 'Récupérer les statistiques des produits',
      tags: ['products'],
      response: {
        200: {
          description: 'Statistiques récupérées avec succès',
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            data: {
              type: 'object',
              properties: {
                totalProducts: { type: 'integer' },
                timestamp: { type: 'string', format: 'date-time' },
              },
            },
          },
        },
        500: {
          description: 'Erreur serveur',
          $ref: '#/components/schemas/ErrorResponse',
        },
      },
    },
  }, productController.getProductStats.bind(productController));

  // GET /products/:id - Récupérer un produit par ID
  fastify.get('/:id', {
    preHandler: [
      ValidationMiddleware.validateParams(productIdSchema),
    ],
    schema: {
      description: 'Récupérer un produit par son ID',
      tags: ['products'],
      params: {
        type: 'object',
        properties: {
          id: {
            type: 'string',
            format: 'uuid',
            description: 'ID du produit',
          },
        },
        required: ['id'],
      },
      response: {
        200: {
          description: 'Produit récupéré avec succès',
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            data: { $ref: '#/components/schemas/Product' },
          },
        },
        400: {
          description: 'ID invalide',
          $ref: '#/components/schemas/ErrorResponse',
        },
        404: {
          description: 'Produit non trouvé',
          $ref: '#/components/schemas/ErrorResponse',
        },
        500: {
          description: 'Erreur serveur',
          $ref: '#/components/schemas/ErrorResponse',
        },
      },
    },
  }, productController.getProductById.bind(productController));

  // PUT /products/:id - Mettre à jour un produit complètement
  fastify.put('/:id', {
    preHandler: [
      ValidationMiddleware.validateParams(productIdSchema),
      ValidationMiddleware.validateBody(updateProductSchema),
    ],
    schema: {
      description: 'Mettre à jour un produit complètement',
      tags: ['products'],
      params: {
        type: 'object',
        properties: {
          id: {
            type: 'string',
            format: 'uuid',
            description: 'ID du produit',
          },
        },
        required: ['id'],
      },
      body: {
        $ref: '#/components/schemas/UpdateProductRequest',
      },
      response: {
        200: {
          description: 'Produit mis à jour avec succès',
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            data: { $ref: '#/components/schemas/Product' },
            message: { type: 'string' },
          },
        },
        400: {
          description: 'Données invalides',
          $ref: '#/components/schemas/ErrorResponse',
        },
        404: {
          description: 'Produit non trouvé',
          $ref: '#/components/schemas/ErrorResponse',
        },
        409: {
          description: 'Conflit - nom déjà existant',
          $ref: '#/components/schemas/ErrorResponse',
        },
        500: {
          description: 'Erreur serveur',
          $ref: '#/components/schemas/ErrorResponse',
        },
      },
    },
  }, productController.updateProduct.bind(productController));

  // PATCH /products/:id - Mettre à jour un produit partiellement
  fastify.patch('/:id', {
    preHandler: [
      ValidationMiddleware.validateParams(productIdSchema),
      ValidationMiddleware.validateBody(patchProductSchema),
    ],
    schema: {
      description: 'Mettre à jour un produit partiellement',
      tags: ['products'],
      params: {
        type: 'object',
        properties: {
          id: {
            type: 'string',
            format: 'uuid',
            description: 'ID du produit',
          },
        },
        required: ['id'],
      },
      body: {
        $ref: '#/components/schemas/UpdateProductRequest',
      },
      response: {
        200: {
          description: 'Produit mis à jour avec succès',
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            data: { $ref: '#/components/schemas/Product' },
            message: { type: 'string' },
          },
        },
        400: {
          description: 'Données invalides',
          $ref: '#/components/schemas/ErrorResponse',
        },
        404: {
          description: 'Produit non trouvé',
          $ref: '#/components/schemas/ErrorResponse',
        },
        409: {
          description: 'Conflit - nom déjà existant',
          $ref: '#/components/schemas/ErrorResponse',
        },
        500: {
          description: 'Erreur serveur',
          $ref: '#/components/schemas/ErrorResponse',
        },
      },
    },
  }, productController.patchProduct.bind(productController));

  // DELETE /products/:id - Supprimer un produit
  fastify.delete('/:id', {
    preHandler: [
      ValidationMiddleware.validateParams(productIdSchema),
    ],
    schema: {
      description: 'Supprimer un produit',
      tags: ['products'],
      params: {
        type: 'object',
        properties: {
          id: {
            type: 'string',
            format: 'uuid',
            description: 'ID du produit',
          },
        },
        required: ['id'],
      },
      response: {
        204: {
          description: 'Produit supprimé avec succès',
          type: 'null',
        },
        400: {
          description: 'ID invalide',
          $ref: '#/components/schemas/ErrorResponse',
        },
        404: {
          description: 'Produit non trouvé',
          $ref: '#/components/schemas/ErrorResponse',
        },
        500: {
          description: 'Erreur serveur',
          $ref: '#/components/schemas/ErrorResponse',
        },
      },
    },
  }, productController.deleteProduct.bind(productController));
}
