const Fastify = require('fastify');
const cors = require('@fastify/cors');
const helmet = require('@fastify/helmet');
const envPlugin = require('@fastify/env');
const swagger = require('@fastify/swagger');
const swaggerUi = require('@fastify/swagger-ui');
const dotenv = require('dotenv');

// Charger les variables d'environnement
dotenv.config();

// Configuration par défaut
const config = {
  NODE_ENV: process.env.NODE_ENV || 'development',
  PORT: parseInt(process.env.PORT || '3000', 10),
  HOST: process.env.HOST || '0.0.0.0',
  REDIS_HOST: process.env.REDIS_HOST || 'localhost',
  REDIS_PORT: parseInt(process.env.REDIS_PORT || '6379', 10),
  REDIS_PASSWORD: process.env.REDIS_PASSWORD,
  REDIS_DB: parseInt(process.env.REDIS_DB || '0', 10),
  LOG_LEVEL: process.env.LOG_LEVEL || 'info',
  API_PREFIX: process.env.API_PREFIX || '/api/v1',
  CORS_ORIGIN: process.env.CORS_ORIGIN || '*',
  DEFAULT_PAGE_SIZE: parseInt(process.env.DEFAULT_PAGE_SIZE || '10', 10),
  MAX_PAGE_SIZE: parseInt(process.env.MAX_PAGE_SIZE || '100', 10),
  ENABLE_SEEDER: process.env.ENABLE_SEEDER === 'true',
  SEEDER_PRODUCT_COUNT: parseInt(process.env.SEEDER_PRODUCT_COUNT || '50', 10),
};

// Configuration Swagger
const swaggerOptions = {
  openapi: {
    openapi: '3.0.3',
    info: {
      title: 'API Produits - Fastify Redis',
      description: 'API REST complète pour la gestion de produits avec Fastify et Redis',
      version: '1.0.0',
    },
    servers: [
      {
        url: `http://${config.HOST}:${config.PORT}${config.API_PREFIX}`,
        description: 'Serveur de développement',
      },
    ],
  },
};

const swaggerUiOptions = {
  routePrefix: '/docs',
  uiConfig: {
    docExpansion: 'list',
    deepLinking: true,
  },
};

// Créer le serveur
async function createServer() {
  const fastify = Fastify({
    logger: {
      level: config.LOG_LEVEL,
      transport: {
        target: 'pino-pretty',
        options: {
          colorize: true,
        },
      },
    },
    trustProxy: true,
    bodyLimit: 1048576, // 1MB
    requestTimeout: 30000, // 30 secondes
  });

  // Middleware CORS
  await fastify.register(cors, {
    origin: true,
    credentials: true,
  });

  // Middleware de sécurité
  await fastify.register(helmet, {
    contentSecurityPolicy: false,
  });

  // Configuration des variables d'environnement
  await fastify.register(envPlugin, {
    schema: {
      type: 'object',
      required: ['NODE_ENV', 'PORT', 'HOST'],
      properties: {
        NODE_ENV: { type: 'string' },
        PORT: { type: 'number' },
        HOST: { type: 'string' },
      },
    },
  });

  // Configuration Swagger
  await fastify.register(swagger, swaggerOptions);
  await fastify.register(swaggerUi, swaggerUiOptions);

  // Route racine
  fastify.get('/', {
    schema: {
      description: 'Point d\'entrée de l\'API',
      response: {
        200: {
          type: 'object',
          properties: {
            name: { type: 'string' },
            version: { type: 'string' },
            description: { type: 'string' },
            documentation: { type: 'string' },
            health: { type: 'string' },
            environment: { type: 'string' },
            timestamp: { type: 'string' },
          },
        },
      },
    },
  }, async (request, reply) => {
    return {
      name: 'API Produits - Fastify Redis',
      version: '1.0.0',
      description: 'API REST complète pour la gestion de produits avec Fastify et Redis',
      documentation: `${config.API_PREFIX}/docs`,
      health: `${config.API_PREFIX}/health`,
      environment: config.NODE_ENV,
      timestamp: new Date().toISOString(),
    };
  });

  // Route de santé
  fastify.get(`${config.API_PREFIX}/health`, {
    schema: {
      description: 'Vérifier l\'état de santé de l\'API',
      response: {
        200: {
          type: 'object',
          properties: {
            status: { type: 'string' },
            timestamp: { type: 'string' },
            uptime: { type: 'number' },
            memory: { type: 'object' },
            version: { type: 'string' },
            nodeVersion: { type: 'string' },
            environment: { type: 'string' },
          },
        },
      },
    },
  }, async (request, reply) => {
    const memoryUsage = process.memoryUsage();
    return {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      memory: {
        rss: `${Math.round(memoryUsage.rss / 1024 / 1024)} MB`,
        heapTotal: `${Math.round(memoryUsage.heapTotal / 1024 / 1024)} MB`,
        heapUsed: `${Math.round(memoryUsage.heapUsed / 1024 / 1024)} MB`,
        external: `${Math.round(memoryUsage.external / 1024 / 1024)} MB`,
      },
      version: '1.0.0',
      nodeVersion: process.version,
      environment: config.NODE_ENV,
    };
  });

  // Route de test des produits (simplifiée)
  fastify.get(`${config.API_PREFIX}/products`, {
    schema: {
      description: 'Lister les produits (version simplifiée)',
      response: {
        200: {
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            data: { type: 'array' },
            message: { type: 'string' },
          },
        },
      },
    },
  }, async (request, reply) => {
    return {
      success: true,
      data: [
        {
          id: '1',
          name: 'Produit Test',
          description: 'Description du produit test',
          price: 99.99,
          qty: 10,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        }
      ],
      message: 'API fonctionnelle - Version simplifiée',
    };
  });

  return fastify;
}

// Démarrer le serveur
async function startServer() {
  try {
    const fastify = await createServer();
    
    const address = await fastify.listen({
      port: config.PORT,
      host: config.HOST,
    });

    console.log(`🚀 Serveur démarré sur ${address}`);
    console.log(`📚 Documentation Swagger: http://${config.HOST}:${config.PORT}${config.API_PREFIX}/docs`);
    console.log(`🏥 Health Check: http://${config.HOST}:${config.PORT}${config.API_PREFIX}/health`);
    console.log(`🌍 Environnement: ${config.NODE_ENV}`);

    // Gestionnaire d'arrêt gracieux
    const gracefulShutdown = async (signal) => {
      console.log(`Signal ${signal} reçu, arrêt du serveur...`);
      try {
        await fastify.close();
        console.log('Serveur arrêté avec succès');
        process.exit(0);
      } catch (error) {
        console.error('Erreur lors de l\'arrêt du serveur', error);
        process.exit(1);
      }
    };

    process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
    process.on('SIGINT', () => gracefulShutdown('SIGINT'));

  } catch (error) {
    console.error('Erreur lors du démarrage du serveur', error);
    process.exit(1);
  }
}

// Démarrer le serveur si ce fichier est exécuté directement
if (require.main === module) {
  startServer();
}

module.exports = { createServer, startServer };
