import Fastify from 'fastify';
import cors from '@fastify/cors';
import helmet from '@fastify/helmet';
import { env } from './config/environment';
import { redisClient } from './config/redis';
import { logger } from './utils/logger';

async function startSimpleServer(): Promise<void> {
  try {
    // Créer le serveur
    const fastify = Fastify({
      logger: false,
      trustProxy: true,
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

    // Route de test simple
    fastify.get('/', async (request, reply) => {
      return {
        message: 'API Produits - Fastify Redis',
        status: 'running',
        timestamp: new Date().toISOString(),
      };
    });

    // Route de santé
    fastify.get('/health', async (request, reply) => {
      return {
        status: 'healthy',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
      };
    });

    // Se connecter à Redis
    logger.info('Connexion à Redis...');
    await redisClient.connect();

    // Démarrer le serveur
    const address = await fastify.listen({
      port: env.PORT,
      host: env.HOST,
    });

    logger.info(`🚀 Serveur démarré sur ${address}`);
    logger.info(`🏥 Health Check: http://${env.HOST}:${env.PORT}/health`);

  } catch (error) {
    logger.error('Erreur lors du démarrage du serveur', error);
    process.exit(1);
  }
}

// Démarrer le serveur
startSimpleServer();
