const Fastify = require('fastify');
const cors = require('@fastify/cors');
const helmet = require('@fastify/helmet');
const envPlugin = require('@fastify/env');
const swagger = require('@fastify/swagger');
const swaggerUi = require('@fastify/swagger-ui');
const Redis = require('ioredis');
const { v4: uuidv4 } = require('uuid');

// Configuration Redis
const redis = new Redis({
  host: process.env.REDIS_HOST || 'localhost',
  port: process.env.REDIS_PORT || 6379,
  password: process.env.REDIS_PASSWORD || undefined,
  db: process.env.REDIS_DB || 0,
  lazyConnect: true,
});

// Configuration de l'environnement
const env = {
  NODE_ENV: process.env.NODE_ENV || 'development',
  PORT: parseInt(process.env.PORT) || 3000,
  HOST: process.env.HOST || '0.0.0.0',
  API_PREFIX: process.env.API_PREFIX || '/api/v1',
  LOG_LEVEL: process.env.LOG_LEVEL || 'info',
};

// Service Product simplifié
class ProductService {
  async createProduct(productData) {
    const product = {
      id: uuidv4(),
      ...productData,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    // Sauvegarder dans Redis
    await redis.hset(`product:${product.id}`, product);
    await redis.sadd('product:ids', product.id);
    await redis.hset('product:names', product.name, product.id);

    return product;
  }

  async getAllProducts() {
    const productIds = await redis.smembers('product:ids');
    const products = [];

    for (const id of productIds) {
      const product = await redis.hgetall(`product:${id}`);
      if (product && product.id) {
        // Convertir les types
        product.price = parseFloat(product.price);
        product.qty = parseInt(product.qty);
        products.push(product);
      }
    }

    return products;
  }

  async getProductById(id) {
    const product = await redis.hgetall(`product:${id}`);
    if (!product || !product.id) {
      return null;
    }
    
    // Convertir les types
    product.price = parseFloat(product.price);
    product.qty = parseInt(product.qty);
    return product;
  }

  async updateProduct(id, updateData) {
    const existingProduct = await this.getProductById(id);
    if (!existingProduct) {
      return null;
    }

    const updatedProduct = {
      ...existingProduct,
      ...updateData,
      updatedAt: new Date().toISOString(),
    };

    await redis.hset(`product:${id}`, updatedProduct);
    return updatedProduct;
  }

  async deleteProduct(id) {
    const product = await this.getProductById(id);
    if (!product) {
      return false;
    }

    await redis.del(`product:${id}`);
    await redis.srem('product:ids', id);
    await redis.hdel('product:names', product.name);
    
    return true;
  }
}

const productService = new ProductService();

async function createServer() {
  const fastify = Fastify({
    logger: {
      level: env.LOG_LEVEL,
      transport: {
        target: 'pino-pretty',
        options: {
          colorize: true,
        },
      },
    },
  });

  // Register plugins
  await fastify.register(cors, { origin: true, credentials: true });
  await fastify.register(helmet, { contentSecurityPolicy: false });

  // Swagger configuration
  await fastify.register(swagger, {
    openapi: {
      info: {
        title: 'API Produits - Fastify Redis',
        description: 'API REST complète pour la gestion de produits avec Fastify et Redis. Cette API permet de gérer un catalogue de produits avec des opérations CRUD complètes, de la pagination, du filtrage et des métriques avancées.',
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
          url: `${env.API_PREFIX}`,
          description: 'Serveur de développement'
        },
        { 
          url: 'https://api-produits.edacy.com/api/v1',
          description: 'Serveur de production'
        }
      ],
      tags: [
        {
          name: 'Health',
          description: 'Endpoints de santé et monitoring de l\'API'
        },
        {
          name: 'Products',
          description: 'Gestion complète des produits (CRUD, pagination, filtrage)'
        },
        {
          name: 'Metrics',
          description: 'Métriques et statistiques de l\'API'
        }
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
                description: 'Identifiant unique du produit (UUID v4)',
              },
              name: {
                type: 'string',
                minLength: 2,
                maxLength: 100,
                description: 'Nom du produit',
                example: 'iPhone 15 Pro'
              },
              description: {
                type: 'string',
                minLength: 10,
                maxLength: 500,
                description: 'Description détaillée du produit',
                example: 'Smartphone Apple avec écran Super Retina XDR de 6.1 pouces'
              },
              price: {
                type: 'number',
                minimum: 0.01,
                description: 'Prix du produit en euros',
                example: 1199.99
              },
              qty: {
                type: 'number',
                minimum: 0,
                description: 'Quantité en stock',
                example: 50
              },
              createdAt: {
                type: 'string',
                format: 'date-time',
                description: 'Date de création',
                example: '2025-09-15T14:59:40.993Z'
              },
              updatedAt: {
                type: 'string',
                format: 'date-time',
                description: 'Date de dernière modification',
                example: '2025-09-15T14:59:40.993Z'
              }
            }
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
                example: 'iPhone 15 Pro'
              },
              description: {
                type: 'string',
                minLength: 10,
                maxLength: 500,
                description: 'Description détaillée du produit',
                example: 'Smartphone Apple avec écran Super Retina XDR de 6.1 pouces'
              },
              price: {
                type: 'number',
                minimum: 0.01,
                description: 'Prix du produit en euros',
                example: 1199.99
              },
              qty: {
                type: 'number',
                minimum: 0,
                description: 'Quantité en stock',
                example: 50
              }
            }
          },
          UpdateProductRequest: {
            type: 'object',
            properties: {
              name: {
                type: 'string',
                minLength: 2,
                maxLength: 100,
                description: 'Nom du produit'
              },
              description: {
                type: 'string',
                minLength: 10,
                maxLength: 500,
                description: 'Description détaillée du produit'
              },
              price: {
                type: 'number',
                minimum: 0.01,
                description: 'Prix du produit en euros'
              },
              qty: {
                type: 'number',
                minimum: 0,
                description: 'Quantité en stock'
              }
            }
          },
          ApiResponse: {
            type: 'object',
            properties: {
              success: {
                type: 'boolean',
                description: 'Indique si la requête a réussi'
              },
              data: {
                type: 'object',
                description: 'Données retournées'
              },
              message: {
                type: 'string',
                description: 'Message descriptif'
              }
            }
          },
          ErrorResponse: {
            type: 'object',
            properties: {
              success: {
                type: 'boolean',
              },
              message: {
                type: 'string',
                description: 'Message d\'erreur'
              },
              error: {
                type: 'string',
                description: 'Détails de l\'erreur'
              }
            }
          }
        }
      }
    },
  });

  await fastify.register(swaggerUi, {
    routePrefix: '/docs',
    uiConfig: {
      docExpansion: 'full',
      deepLinking: true,
    },
    uiHooks: {
      onRequest: function (request, reply, next) { next() },
      preHandler: function (request, reply, next) { next() }
    },
    staticCSP: true,
    transformStaticCSP: (header) => header,
    transformSpecification: (swaggerObject, request, reply) => { return swaggerObject },
    transformSpecificationClone: true
  });

  // Routes
  fastify.get('/', {
    schema: {
      tags: ['Health'],
      description: 'Point d\'entrée de l\'API - Informations générales',
      summary: 'Informations sur l\'API',
      response: {
        200: {
          type: 'object',
          properties: {
            name: { type: 'string' },
            version: { type: 'string' },
            description: { type: 'string' },
            documentation: { type: 'string' },
            healthCheck: { type: 'string' },
            environment: { type: 'string' },
            timestamp: { type: 'string', format: 'date-time' },
          },
        },
      },
    },
  }, async () => {
    return {
      name: 'API Produits - Fastify Redis',
      version: '1.0.0',
      description: 'API REST complète pour la gestion de produits avec Fastify et Redis',
      documentation: `${env.API_PREFIX}/docs`,
      healthCheck: `${env.API_PREFIX}/health`,
      environment: env.NODE_ENV,
      timestamp: new Date().toISOString(),
    };
  });

  fastify.get(`${env.API_PREFIX}/health`, {
    schema: {
      tags: ['Health'],
      description: 'Vérifier l\'état de santé de l\'API et de ses dépendances',
      summary: 'Health Check',
      response: {
        200: {
          type: 'object',
          properties: {
            status: { type: 'string', enum: ['healthy', 'unhealthy'] },
            timestamp: { type: 'string', format: 'date-time' },
            uptime: { type: 'number' },
            memory: { type: 'object' },
            version: { type: 'string' },
            nodeVersion: { type: 'string' },
            environment: { type: 'string' },
          },
        },
      },
    },
  }, async () => {
    return {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      memory: process.memoryUsage(),
      version: '1.0.0',
      nodeVersion: process.version,
      environment: env.NODE_ENV,
    };
  });

  // Routes des produits
  fastify.get(`${env.API_PREFIX}/products`, {
    schema: {
      tags: ['Products'],
      description: 'Récupérer la liste de tous les produits avec pagination et filtrage',
      summary: 'Lister tous les produits',
      querystring: {
        type: 'object',
        properties: {
          page: { type: 'number', minimum: 1, default: 1, description: 'Numéro de page' },
          limit: { type: 'number', minimum: 1, maximum: 100, default: 20, description: 'Nombre d\'éléments par page' },
          search: { type: 'string', description: 'Recherche par nom ou description' },
          minPrice: { type: 'number', minimum: 0, description: 'Prix minimum' },
          maxPrice: { type: 'number', minimum: 0, description: 'Prix maximum' },
          sortBy: { type: 'string', enum: ['name', 'price', 'createdAt', 'updatedAt'], default: 'createdAt', description: 'Champ de tri' },
          sortOrder: { type: 'string', enum: ['asc', 'desc'], default: 'desc', description: 'Ordre de tri' }
        }
      },
      response: {
        200: {
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            data: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  id: { type: 'string' },
                  name: { type: 'string' },
                  description: { type: 'string' },
                  price: { type: 'number' },
                  qty: { type: 'number' },
                  createdAt: { type: 'string' },
                  updatedAt: { type: 'string' }
                }
              }
            },
            pagination: {
              type: 'object',
              properties: {
                page: { type: 'number' },
                limit: { type: 'number' },
                total: { type: 'number' },
                totalPages: { type: 'number' }
              }
            }
          }
        },
        500: {
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            message: { type: 'string' },
            error: { type: 'string' }
          }
        }
      },
    },
  }, async (request, reply) => {
    try {
      const products = await productService.getAllProducts();
      return reply.status(200).send({ success: true, data: products });
    } catch (error) {
      fastify.log.error('Erreur lors de la récupération des produits', error);
      return reply.status(500).send({ 
        success: false, 
        message: 'Erreur interne du serveur',
        error: error.message 
      });
    }
  });

  fastify.get(`${env.API_PREFIX}/products/:id`, {
    schema: {
      tags: ['Products'],
      description: 'Récupérer un produit spécifique par son identifiant unique',
      summary: 'Récupérer un produit par ID',
      params: {
        type: 'object',
        properties: {
          id: { 
            type: 'string',
            format: 'uuid',
            description: 'Identifiant unique du produit (UUID v4)',
          }
        },
        required: ['id']
      },
      response: {
        200: {
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            data: {
              type: 'object',
              properties: {
                id: { type: 'string' },
                name: { type: 'string' },
                description: { type: 'string' },
                price: { type: 'number' },
                qty: { type: 'number' },
                createdAt: { type: 'string' },
                updatedAt: { type: 'string' }
              }
            }
          }
        },
        404: {
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            message: { type: 'string' }
          }
        },
        500: {
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            message: { type: 'string' },
            error: { type: 'string' }
          }
        }
      },
    },
  }, async (request, reply) => {
    try {
      const { id } = request.params;
      const product = await productService.getProductById(id);
      
      if (!product) {
        return reply.status(404).send({ 
          success: false, 
          message: 'Produit non trouvé' 
        });
      }

      return reply.status(200).send({ success: true, data: product });
    } catch (error) {
      fastify.log.error('Erreur lors de la récupération du produit', error);
      return reply.status(500).send({ 
        success: false, 
        message: 'Erreur interne du serveur',
        error: error.message 
      });
    }
  });

  fastify.post(`${env.API_PREFIX}/products`, {
    schema: {
      tags: ['Products'],
      description: 'Créer un nouveau produit dans le catalogue',
      summary: 'Créer un produit',
      body: {
        type: 'object',
        required: ['name', 'description', 'price', 'qty'],
        properties: {
          name: { type: 'string', minLength: 2, maxLength: 100 },
          description: { type: 'string', minLength: 10, maxLength: 500 },
          price: { type: 'number', minimum: 0.01 },
          qty: { type: 'number', minimum: 0 }
        }
      },
      response: {
        201: {
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            data: {
              type: 'object',
              properties: {
                id: { type: 'string' },
                name: { type: 'string' },
                description: { type: 'string' },
                price: { type: 'number' },
                qty: { type: 'number' },
                createdAt: { type: 'string' },
                updatedAt: { type: 'string' }
              }
            },
            message: { type: 'string' }
          }
        },
        400: {
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            message: { type: 'string' }
          }
        },
        500: {
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            message: { type: 'string' },
            error: { type: 'string' }
          }
        }
      },
    },
  }, async (request, reply) => {
    try {
      const productData = request.body;
      const product = await productService.createProduct(productData);
      
      return reply.status(201).send({ 
        success: true, 
        data: product, 
        message: 'Produit créé avec succès' 
      });
    } catch (error) {
      fastify.log.error('Erreur lors de la création du produit', error);
      return reply.status(500).send({ 
        success: false, 
        message: 'Erreur interne du serveur',
        error: error.message 
      });
    }
  });

  fastify.put(`${env.API_PREFIX}/products/:id`, {
    schema: {
      tags: ['Products'],
      description: 'Mettre à jour un produit existant',
      summary: 'Mettre à jour un produit',
      params: {
        type: 'object',
        properties: {
          id: { 
            type: 'string',
            format: 'uuid',
            description: 'Identifiant unique du produit (UUID v4)',
          }
        },
        required: ['id']
      },
      body: {
        type: 'object',
        properties: {
          name: { type: 'string', minLength: 2, maxLength: 100 },
          description: { type: 'string', minLength: 10, maxLength: 500 },
          price: { type: 'number', minimum: 0.01 },
          qty: { type: 'number', minimum: 0 }
        }
      },
      response: {
        200: {
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            data: {
              type: 'object',
              properties: {
                id: { type: 'string' },
                name: { type: 'string' },
                description: { type: 'string' },
                price: { type: 'number' },
                qty: { type: 'number' },
                createdAt: { type: 'string' },
                updatedAt: { type: 'string' }
              }
            },
            message: { type: 'string' }
          }
        },
        404: {
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            message: { type: 'string' }
          }
        },
        400: {
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            message: { type: 'string' }
          }
        },
        500: {
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            message: { type: 'string' },
            error: { type: 'string' }
          }
        }
      },
    },
  }, async (request, reply) => {
    try {
      const { id } = request.params;
      const updateData = request.body;
      
      const product = await productService.updateProduct(id, updateData);
      
      if (!product) {
        return reply.status(404).send({ 
          success: false, 
          message: 'Produit non trouvé' 
        });
      }

      return reply.status(200).send({ 
        success: true, 
        data: product, 
        message: 'Produit mis à jour avec succès' 
      });
    } catch (error) {
      fastify.log.error('Erreur lors de la mise à jour du produit', error);
      return reply.status(500).send({ 
        success: false, 
        message: 'Erreur interne du serveur',
        error: error.message 
      });
    }
  });

  fastify.delete(`${env.API_PREFIX}/products/:id`, {
    schema: {
      tags: ['Products'],
      description: 'Supprimer définitivement un produit du catalogue',
      summary: 'Supprimer un produit',
      params: {
        type: 'object',
        properties: {
          id: { 
            type: 'string',
            format: 'uuid',
            description: 'Identifiant unique du produit (UUID v4)',
          }
        },
        required: ['id']
      },
      response: {
        200: {
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            message: { type: 'string' }
          }
        },
        404: {
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            message: { type: 'string' }
          }
        },
        500: {
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            message: { type: 'string' },
            error: { type: 'string' }
          }
        }
      },
    },
  }, async (request, reply) => {
    try {
      const { id } = request.params;
      const deleted = await productService.deleteProduct(id);
      
      if (!deleted) {
        return reply.status(404).send({ 
          success: false, 
          message: 'Produit non trouvé' 
        });
      }

      return reply.status(200).send({ 
        success: true, 
        message: 'Produit supprimé avec succès' 
      });
    } catch (error) {
      fastify.log.error('Erreur lors de la suppression du produit', error);
      return reply.status(500).send({ 
        success: false, 
        message: 'Erreur interne du serveur',
        error: error.message 
      });
    }
  });

  // Endpoints de métriques
  fastify.get(`${env.API_PREFIX}/metrics/products/stats`, {
    schema: {
      tags: ['Metrics'],
      description: 'Récupérer les statistiques détaillées des produits',
      summary: 'Statistiques des produits',
      response: {
        200: {
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            data: {
              type: 'object',
              properties: {
                totalProducts: { type: 'integer' },
                averagePrice: { type: 'number' },
                totalStock: { type: 'integer' },
                priceRange: {
                  type: 'object',
                  properties: {
                    min: { type: 'number' },
                    max: { type: 'number' }
                  }
                },
                timestamp: { type: 'string', format: 'date-time' }
              }
            }
          }
        },
        500: {
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            message: { type: 'string' },
            error: { type: 'string' }
          }
        }
      },
    },
  }, async (request, reply) => {
    try {
      const products = await productService.getAllProducts();
      
      const totalProducts = products.length;
      const totalStock = products.reduce((sum, product) => sum + (product.qty || 0), 0);
      const averagePrice = totalProducts > 0 ? products.reduce((sum, product) => sum + product.price, 0) / totalProducts : 0;
      
      const prices = products.map(p => p.price);
      const priceRange = {
        min: prices.length > 0 ? Math.min(...prices) : 0,
        max: prices.length > 0 ? Math.max(...prices) : 0
      };

      return reply.status(200).send({
        success: true,
        data: {
          totalProducts,
          averagePrice: Math.round(averagePrice * 100) / 100,
          totalStock,
          priceRange,
          timestamp: new Date().toISOString()
        }
      });
    } catch (error) {
      fastify.log.error('Erreur lors de la récupération des statistiques', error);
      return reply.status(500).send({
        success: false,
        message: 'Erreur interne du serveur',
        error: error.message
      });
    }
  });

  fastify.get(`${env.API_PREFIX}/metrics/system`, {
    schema: {
      tags: ['Metrics'],
      description: 'Récupérer les métriques système et de performance',
      summary: 'Métriques système',
      response: {
        200: {
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            data: {
              type: 'object',
              properties: {
                uptime: { type: 'number' },
                memory: { type: 'object' },
                cpu: { type: 'object' },
                redis: {
                  type: 'object',
                  properties: {
                    connected: { type: 'boolean' },
                    memory: { type: 'string' },
                    keys: { type: 'integer' }
                  }
                },
                timestamp: { type: 'string', format: 'date-time' }
              }
            }
          }
        },
        500: {
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            message: { type: 'string' },
            error: { type: 'string' }
          }
        }
      },
    },
  }, async (request, reply) => {
    try {
      const memoryUsage = process.memoryUsage();
      const redisInfo = await redis.info('memory');
      const redisKeys = await redis.dbsize();
      
      return reply.status(200).send({
        success: true,
        data: {
          uptime: process.uptime(),
          memory: {
            rss: `${Math.round(memoryUsage.rss / 1024 / 1024)} MB`,
            heapTotal: `${Math.round(memoryUsage.heapTotal / 1024 / 1024)} MB`,
            heapUsed: `${Math.round(memoryUsage.heapUsed / 1024 / 1024)} MB`,
            external: `${Math.round(memoryUsage.external / 1024 / 1024)} MB`
          },
          cpu: {
            usage: process.cpuUsage(),
            platform: process.platform,
            arch: process.arch
          },
          redis: {
            connected: redis.status === 'ready',
            memory: redisInfo.split('\n').find(line => line.startsWith('used_memory_human:'))?.split(':')[1]?.trim() || 'N/A',
            keys: redisKeys
          },
          timestamp: new Date().toISOString()
        }
      });
    } catch (error) {
      fastify.log.error('Erreur lors de la récupération des métriques système', error);
      return reply.status(500).send({
        success: false,
        message: 'Erreur interne du serveur',
        error: error.message
      });
    }
  });

  fastify.get(`${env.API_PREFIX}/metrics/health/detailed`, {
    schema: {
      tags: ['Metrics', 'Health'],
      description: 'Vérification de santé détaillée avec métriques avancées',
      summary: 'Health check détaillé',
      response: {
        200: {
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            data: {
              type: 'object',
              properties: {
                status: { type: 'string', enum: ['healthy', 'unhealthy'] },
                timestamp: { type: 'string', format: 'date-time' },
                uptime: { type: 'number' },
                memory: { type: 'object' },
                redis: {
                  type: 'object',
                  properties: {
                    connected: { type: 'boolean' },
                    latency: { type: 'number' }
                  }
                },
                version: { type: 'string' },
                nodeVersion: { type: 'string' },
                environment: { type: 'string' }
              }
            }
          }
        },
        500: {
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            message: { type: 'string' },
            error: { type: 'string' }
          }
        }
      },
    },
  }, async (request, reply) => {
    try {
      const startTime = Date.now();
      
      // Test de latence Redis
      const redisStart = Date.now();
      await redis.ping();
      const redisLatency = Date.now() - redisStart;
      
      const responseTime = Date.now() - startTime;
      
      return reply.status(200).send({
        success: true,
        data: {
          status: 'healthy',
          timestamp: new Date().toISOString(),
          uptime: process.uptime(),
          memory: process.memoryUsage(),
          redis: {
            connected: redis.status === 'ready',
            latency: redisLatency
          },
          version: '1.0.0',
          nodeVersion: process.version,
          environment: env.NODE_ENV,
          responseTime: `${responseTime}ms`
        }
      });
    } catch (error) {
      fastify.log.error('Erreur lors de la vérification de santé détaillée', error);
      return reply.status(500).send({
        success: false,
        data: {
          status: 'unhealthy',
          timestamp: new Date().toISOString(),
          error: error.message
        }
      });
    }
  });

  return fastify;
}

async function startServer() {
  const fastify = await createServer();
  try {
    await fastify.listen({ port: env.PORT, host: env.HOST });
    console.log(`🚀 Serveur démarré sur http://${env.HOST}:${env.PORT}`);
    console.log(`📚 Documentation Swagger: http://${env.HOST}:${env.PORT}/docs`);
    console.log(`🏥 Health Check: http://${env.HOST}:${env.PORT}${env.API_PREFIX}/health`);
    console.log(`🌍 Environnement: ${env.NODE_ENV}`);
  } catch (error) {
    console.error('Erreur lors du démarrage du serveur', error);
    process.exit(1);
  }
}

if (require.main === module) {
  startServer();
}

module.exports = { createServer, startServer };
