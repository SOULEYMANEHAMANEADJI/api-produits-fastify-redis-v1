import Fastify, { FastifyInstance } from 'fastify';
import cors from '@fastify/cors';
import helmet from '@fastify/helmet';
import envPlugin from '@fastify/env';
import swagger from '@fastify/swagger';
import swaggerUi from '@fastify/swagger-ui';
import { env } from './config/environment';
import { redisClient } from './config/redis';
import { swaggerOptions, swaggerUiOptions } from './config/swagger';
import { CorsMiddleware } from './middleware/cors';
import { ErrorHandler } from './middleware/errorHandler';
import { loggingMiddleware } from './utils/logger';
import { productRoutes } from './routes/products';
import { healthRoutes } from './routes/health';
import { logger } from './utils/logger';

/**
 * Crée et configure l'instance Fastify
 */
async function createServer(): Promise<FastifyInstance> {
  const fastify = Fastify({
    logger: false, // On utilise notre propre logger
    trustProxy: true,
    bodyLimit: 1048576, // 1MB
    requestTimeout: 30000, // 30 secondes
    keepAliveTimeout: 5000, // 5 secondes
    connectionTimeout: 10000, // 10 secondes
    disableRequestLogging: true, // On gère nous-mêmes les logs
  });

  // Middleware de logging
  fastify.addHook('onRequest', loggingMiddleware.request);
  fastify.addHook('onResponse', loggingMiddleware.response);

  // Middleware CORS
  await fastify.register(cors, {
    origin: true,
    credentials: true,
  });

  // Middleware de sécurité
  await fastify.register(helmet, {
    contentSecurityPolicy: false, // Désactivé pour Swagger UI
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
  await fastify.register(swagger, swaggerOptions as any);
  await fastify.register(swaggerUi, swaggerUiOptions as any);

  // Gestionnaire d'erreurs centralisé
  fastify.setErrorHandler((error, request, reply) => {
    // Gérer les erreurs de validation Joi
    if (error.validation) {
      ErrorHandler.handleValidationError(error, request, reply);
      return;
    }

    // Gérer les erreurs de syntaxe JSON
    if (error.statusCode === 400 && error.code === 'FST_ERR_VALIDATION') {
      ErrorHandler.handleJsonSyntaxError(error, request, reply);
      return;
    }

    // Gérer les erreurs de taille de payload
    if (error.statusCode === 413) {
      ErrorHandler.handlePayloadTooLarge(error, request, reply);
      return;
    }

    // Gérer les erreurs de timeout
    if (error.code === 'FST_ERR_REQ_TIMEOUT') {
      ErrorHandler.handleTimeout(error, request, reply);
      return;
    }

    // Gérer les erreurs de rate limiting
    if (error.statusCode === 429) {
      ErrorHandler.handleRateLimit(error, request, reply);
      return;
    }

    // Gérer les erreurs Redis
    if (error.message && error.message.includes('Redis')) {
      ErrorHandler.handleRedisError(error, request, reply);
      return;
    }

    // Gestionnaire d'erreurs générique
    ErrorHandler.handle(error, request, reply);
  });

  // Gestionnaire 404
  fastify.setNotFoundHandler((request, reply) => {
    ErrorHandler.handleNotFound(request, reply);
  });

  // Routes de santé
  await fastify.register(healthRoutes, { prefix: '/health' });

  // Routes des produits
  await fastify.register(productRoutes, { prefix: '/products' });

  // Route racine
  fastify.get('/', {
    schema: {
      description: 'Point d\'entrée de l\'API',
      tags: ['general'],
      response: {
        200: {
          description: 'Informations sur l\'API',
          type: 'object',
          properties: {
            name: { type: 'string' },
            version: { type: 'string' },
            description: { type: 'string' },
            documentation: { type: 'string' },
            health: { type: 'string' },
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
      health: `${env.API_PREFIX}/health`,
      environment: env.NODE_ENV,
      timestamp: new Date().toISOString(),
    };
  });

  return fastify;
}

/**
 * Démarre le serveur
 */
async function startServer(): Promise<void> {
  try {
    // Créer le serveur
    const fastify = await createServer();

    // Se connecter à Redis
    logger.info('Connexion à Redis...');
    await redisClient.connect();

    // Démarrer le serveur
    const address = await fastify.listen({
      port: env.PORT,
      host: env.HOST,
    });

    logger.info(`🚀 Serveur démarré sur ${address}`);
    logger.info(`📚 Documentation Swagger: http://${env.HOST}:${env.PORT}${env.API_PREFIX}/docs`);
    logger.info(`🏥 Health Check: http://${env.HOST}:${env.PORT}${env.API_PREFIX}/health`);
    logger.info(`🌍 Environnement: ${env.NODE_ENV}`);

    // Gestionnaire d'arrêt gracieux
    const gracefulShutdown = async (signal: string) => {
      logger.info(`Signal ${signal} reçu, arrêt du serveur...`);
      
      try {
        await fastify.close();
        await redisClient.disconnect();
        logger.info('Serveur arrêté avec succès');
        process.exit(0);
      } catch (error) {
        logger.error('Erreur lors de l\'arrêt du serveur', error);
        process.exit(1);
      }
    };

    // Écouter les signaux d'arrêt
    process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
    process.on('SIGINT', () => gracefulShutdown('SIGINT'));

    // Gestionnaire d'erreurs non capturées
    process.on('uncaughtException', (error) => {
      logger.error('Exception non capturée', error);
      process.exit(1);
    });

    process.on('unhandledRejection', (reason, promise) => {
      logger.error('Promesse rejetée non gérée', { reason, promise });
      process.exit(1);
    });

  } catch (error) {
    logger.error('Erreur lors du démarrage du serveur', error);
    process.exit(1);
  }
}

// Démarrer le serveur si ce fichier est exécuté directement
if (require.main === module) {
  startServer();
}

export { createServer, startServer };
