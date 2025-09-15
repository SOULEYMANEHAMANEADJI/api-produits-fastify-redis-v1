import { FastifySwaggerOptions } from '@fastify/swagger';
import { FastifySwaggerUiOptions } from '@fastify/swagger-ui';
import { env } from './environment';

export const swaggerOptions: FastifySwaggerOptions = {
  openapi: {
    openapi: '3.0.3',
    info: {
      title: 'API Produits - Fastify Redis',
      description: 'API REST complète pour la gestion de produits avec Fastify et Redis',
      version: '1.0.0',
      contact: {
        name: 'EDACY-ONLINE-2025',
        email: 'contact@edacy.com',
      },
      license: {
        name: 'MIT',
        url: 'https://opensource.org/licenses/MIT',
      },
    },
    servers: [
      {
        url: `http://${env.HOST}:${env.PORT}${env.API_PREFIX}`,
        description: 'Serveur de développement',
      },
    ],
    tags: [
      {
        name: 'products',
        description: 'Opérations sur les produits',
      },
      {
        name: 'health',
        description: 'Vérification de l\'état du système',
      },
    ],
    components: {
      schemas: {
        Product: {
          type: 'object',
          required: ['id', 'name', 'description', 'price', 'qty', 'createdAt', 'updatedAt'],
          properties: {
            id: {
              type: 'string',
              format: 'uuid',
              description: 'Identifiant unique du produit',
              example: '123e4567-e89b-12d3-a456-426614174000',
            },
            name: {
              type: 'string',
              minLength: 2,
              maxLength: 100,
              description: 'Nom du produit',
              example: 'iPhone 15 Pro',
            },
            description: {
              type: 'string',
              minLength: 10,
              maxLength: 500,
              description: 'Description détaillée du produit',
              example: 'Smartphone Apple avec écran Super Retina XDR de 6.1 pouces',
            },
            price: {
              type: 'number',
              minimum: 0.01,
              multipleOf: 0.01,
              description: 'Prix du produit en euros',
              example: 1199.99,
            },
            qty: {
              type: 'integer',
              minimum: 0,
              description: 'Quantité en stock',
              example: 50,
            },
            createdAt: {
              type: 'string',
              format: 'date-time',
              description: 'Date de création',
              example: '2024-01-15T10:30:00.000Z',
            },
            updatedAt: {
              type: 'string',
              format: 'date-time',
              description: 'Date de dernière modification',
              example: '2024-01-15T10:30:00.000Z',
            },
          },
        },
        CreateProductRequest: {
          type: 'object',
          required: ['name', 'description', 'price', 'qty'],
          properties: {
            name: {
              type: 'string',
              minLength: 2,
              maxLength: 100,
              description: 'Nom du produit',
              example: 'iPhone 15 Pro',
            },
            description: {
              type: 'string',
              minLength: 10,
              maxLength: 500,
              description: 'Description détaillée du produit',
              example: 'Smartphone Apple avec écran Super Retina XDR de 6.1 pouces',
            },
            price: {
              type: 'number',
              minimum: 0.01,
              multipleOf: 0.01,
              description: 'Prix du produit en euros',
              example: 1199.99,
            },
            qty: {
              type: 'integer',
              minimum: 0,
              description: 'Quantité en stock',
              example: 50,
            },
          },
        },
        UpdateProductRequest: {
          type: 'object',
          properties: {
            name: {
              type: 'string',
              minLength: 2,
              maxLength: 100,
              description: 'Nom du produit',
              example: 'iPhone 15 Pro Max',
            },
            description: {
              type: 'string',
              minLength: 10,
              maxLength: 500,
              description: 'Description détaillée du produit',
              example: 'Smartphone Apple avec écran Super Retina XDR de 6.7 pouces',
            },
            price: {
              type: 'number',
              minimum: 0.01,
              multipleOf: 0.01,
              description: 'Prix du produit en euros',
              example: 1299.99,
            },
            qty: {
              type: 'integer',
              minimum: 0,
              description: 'Quantité en stock',
              example: 75,
            },
          },
        },
        ProductListResponse: {
          type: 'object',
          properties: {
            products: {
              type: 'array',
              items: { $ref: '#/components/schemas/Product' },
            },
            pagination: {
              type: 'object',
              properties: {
                page: { type: 'integer', minimum: 1 },
                limit: { type: 'integer', minimum: 1 },
                total: { type: 'integer', minimum: 0 },
                totalPages: { type: 'integer', minimum: 0 },
              },
            },
            filters: {
              type: 'object',
              properties: {
                name: { type: 'string' },
                minPrice: { type: 'number' },
                maxPrice: { type: 'number' },
              },
            },
          },
        },
        ErrorResponse: {
          type: 'object',
          required: ['error', 'message', 'statusCode', 'timestamp'],
          properties: {
            error: {
              type: 'string',
              description: 'Type d\'erreur',
              example: 'ValidationError',
            },
            message: {
              type: 'string',
              description: 'Message d\'erreur détaillé',
              example: 'Le nom du produit est requis',
            },
            statusCode: {
              type: 'integer',
              description: 'Code de statut HTTP',
              example: 400,
            },
            timestamp: {
              type: 'string',
              format: 'date-time',
              description: 'Horodatage de l\'erreur',
              example: '2024-01-15T10:30:00.000Z',
            },
            path: {
              type: 'string',
              description: 'Chemin de la requête',
              example: '/api/v1/products',
            },
            correlationId: {
              type: 'string',
              description: 'ID de corrélation pour le debugging',
              example: 'req-123456',
            },
          },
        },
      },
    },
  },
};

export const swaggerUiOptions: FastifySwaggerUiOptions = {
  routePrefix: '/docs',
  uiConfig: {
    docExpansion: 'list',
    deepLinking: true,
    defaultModelsExpandDepth: 2,
    defaultModelExpandDepth: 2,
  },
  uiHooks: {
    onRequest: function (request, reply, next) {
      next();
    },
    preHandler: function (request, reply, next) {
      next();
    },
  },
  staticCSP: true,
  transformStaticCSP: (header) => header,
  transformSpecification: (swaggerObject, request, reply) => {
    return swaggerObject;
  },
  transformSpecificationClone: true,
};
