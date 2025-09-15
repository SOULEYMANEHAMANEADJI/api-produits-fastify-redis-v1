import { FastifyRequest, FastifyReply } from 'fastify';
import { redisClient } from '../config/redis';
import { logger } from '../utils/logger';
import { env } from '../config/environment';

/**
 * Controller pour la vérification de l'état du système
 */
export class HealthController {
  /**
   * Vérifie l'état de santé de l'API
   * GET /health
   */
  async getHealth(request: FastifyRequest, reply: FastifyReply): Promise<void> {
    const startTime = Date.now();
    const correlationId = (request as any).correlationId;

    try {
      logger.debug('Vérification de l\'état de santé', {
        correlationId,
      });

      const responseTime = Date.now() - startTime;
      const uptime = process.uptime();
      const memoryUsage = process.memoryUsage();

      reply.status(200).send({
        status: 'healthy',
        timestamp: new Date().toISOString(),
        uptime: {
          seconds: Math.floor(uptime),
          human: this.formatUptime(uptime),
        },
        memory: {
          rss: `${Math.round(memoryUsage.rss / 1024 / 1024)} MB`,
          heapTotal: `${Math.round(memoryUsage.heapTotal / 1024 / 1024)} MB`,
          heapUsed: `${Math.round(memoryUsage.heapUsed / 1024 / 1024)} MB`,
          external: `${Math.round(memoryUsage.external / 1024 / 1024)} MB`,
        },
        responseTime: `${responseTime}ms`,
        version: process.env.npm_package_version || '1.0.0',
        nodeVersion: process.version,
        environment: env.NODE_ENV,
      });
    } catch (error) {
      logger.error('Erreur lors de la vérification de l\'état de santé', error, {
        correlationId,
      });

      reply.status(500).send({
        status: 'unhealthy',
        timestamp: new Date().toISOString(),
        error: 'Internal server error',
        correlationId,
      });
    }
  }

  /**
   * Vérifie l'état de santé détaillé avec Redis
   * GET /health/detailed
   */
  async getDetailedHealth(request: FastifyRequest, reply: FastifyReply): Promise<void> {
    const startTime = Date.now();
    const correlationId = (request as any).correlationId;

    try {
      logger.debug('Vérification détaillée de l\'état de santé', {
        correlationId,
      });

      // Vérifier Redis
      const redisHealthy = await redisClient.healthCheck();
      const redisInfo = redisHealthy ? await this.getRedisInfo() : null;

      const responseTime = Date.now() - startTime;
      const uptime = process.uptime();
      const memoryUsage = process.memoryUsage();

      const health = {
        status: redisHealthy ? 'healthy' : 'degraded',
        timestamp: new Date().toISOString(),
        services: {
          api: {
            status: 'healthy',
            responseTime: `${responseTime}ms`,
            uptime: {
              seconds: Math.floor(uptime),
              human: this.formatUptime(uptime),
            },
            memory: {
              rss: `${Math.round(memoryUsage.rss / 1024 / 1024)} MB`,
              heapTotal: `${Math.round(memoryUsage.heapTotal / 1024 / 1024)} MB`,
              heapUsed: `${Math.round(memoryUsage.heapUsed / 1024 / 1024)} MB`,
              external: `${Math.round(memoryUsage.external / 1024 / 1024)} MB`,
            },
          },
          redis: {
            status: redisHealthy ? 'healthy' : 'unhealthy',
            connected: redisHealthy,
            info: redisInfo,
          },
        },
        version: process.env.npm_package_version || '1.0.0',
        nodeVersion: process.version,
        environment: env.NODE_ENV,
      };

      const statusCode = redisHealthy ? 200 : 503;
      reply.status(statusCode).send(health);
    } catch (error) {
      logger.error('Erreur lors de la vérification détaillée de l\'état de santé', error, {
        correlationId,
      });

      reply.status(500).send({
        status: 'unhealthy',
        timestamp: new Date().toISOString(),
        error: 'Internal server error',
        correlationId,
      });
    }
  }

  /**
   * Vérifie uniquement l'état de Redis
   * GET /health/redis
   */
  async getRedisHealth(request: FastifyRequest, reply: FastifyReply): Promise<void> {
    const startTime = Date.now();
    const correlationId = (request as any).correlationId;

    try {
      logger.debug('Vérification de l\'état de Redis', {
        correlationId,
      });

      const redisHealthy = await redisClient.healthCheck();
      const responseTime = Date.now() - startTime;

      if (redisHealthy) {
        const redisInfo = await this.getRedisInfo();
        
        reply.status(200).send({
          status: 'healthy',
          timestamp: new Date().toISOString(),
          responseTime: `${responseTime}ms`,
          redis: redisInfo,
        });
      } else {
        reply.status(503).send({
          status: 'unhealthy',
          timestamp: new Date().toISOString(),
          responseTime: `${responseTime}ms`,
          error: 'Redis connection failed',
        });
      }
    } catch (error) {
      const responseTime = Date.now() - startTime;
      
      logger.error('Erreur lors de la vérification de Redis', error, {
        correlationId,
        responseTime,
      });

      reply.status(500).send({
        status: 'unhealthy',
        timestamp: new Date().toISOString(),
        responseTime: `${responseTime}ms`,
        error: 'Internal server error',
        correlationId,
      });
    }
  }

  /**
   * Récupère les informations détaillées de Redis
   */
  private async getRedisInfo(): Promise<any> {
    try {
      if (!redisClient.isReady()) {
        return { connected: false };
      }

      const client = redisClient.getClient();
      const info = await client.info();
      
      // Parser les informations Redis
      const redisInfo: any = { connected: true };
      const lines = info.split('\r\n');
      
      for (const line of lines) {
        if (line.includes(':')) {
          const [key, value] = line.split(':');
          redisInfo[key] = value;
        }
      }

      return {
        connected: true,
        version: redisInfo.redis_version,
        uptime: redisInfo.uptime_in_seconds,
        memory: {
          used: redisInfo.used_memory_human,
          peak: redisInfo.used_memory_peak_human,
        },
        clients: {
          connected: redisInfo.connected_clients,
          blocked: redisInfo.blocked_clients,
        },
        keyspace: {
          keys: redisInfo.db0 ? redisInfo.db0.split(',')[0].split('=')[1] : '0',
        },
      };
    } catch (error) {
      logger.error('Erreur lors de la récupération des informations Redis', error);
      return { connected: false, error: 'Failed to get Redis info' };
    }
  }

  /**
   * Formate le temps de fonctionnement en format lisible
   */
  private formatUptime(seconds: number): string {
    const days = Math.floor(seconds / 86400);
    const hours = Math.floor((seconds % 86400) / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);

    const parts = [];
    if (days > 0) parts.push(`${days}j`);
    if (hours > 0) parts.push(`${hours}h`);
    if (minutes > 0) parts.push(`${minutes}m`);
    if (secs > 0 || parts.length === 0) parts.push(`${secs}s`);

    return parts.join(' ');
  }
}
