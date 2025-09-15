import { FastifyInstance } from 'fastify';
import { HealthController } from '../controllers/HealthController';

/**
 * Enregistre les routes de santé
 */
export async function healthRoutes(fastify: FastifyInstance): Promise<void> {
  const healthController = new HealthController();

  // GET /health - Vérification de santé basique
  fastify.get('/', {
    schema: {
      description: 'Vérifier l\'état de santé de l\'API',
      tags: ['health'],
      response: {
        200: {
          description: 'API en bonne santé',
          type: 'object',
          properties: {
            status: { type: 'string', enum: ['healthy', 'unhealthy'] },
            timestamp: { type: 'string', format: 'date-time' },
            uptime: {
              type: 'object',
              properties: {
                seconds: { type: 'integer' },
                human: { type: 'string' },
              },
            },
            memory: {
              type: 'object',
              properties: {
                rss: { type: 'string' },
                heapTotal: { type: 'string' },
                heapUsed: { type: 'string' },
                external: { type: 'string' },
              },
            },
            responseTime: { type: 'string' },
            version: { type: 'string' },
            nodeVersion: { type: 'string' },
            environment: { type: 'string' },
          },
        },
        500: {
          description: 'API en mauvaise santé',
          type: 'object',
          properties: {
            status: { type: 'string' },
            timestamp: { type: 'string', format: 'date-time' },
            error: { type: 'string' },
            correlationId: { type: 'string' },
          },
        },
      },
    },
  }, healthController.getHealth.bind(healthController));

  // GET /health/detailed - Vérification de santé détaillée
  fastify.get('/detailed', {
    schema: {
      description: 'Vérifier l\'état de santé détaillé avec Redis',
      tags: ['health'],
      response: {
        200: {
          description: 'Tous les services en bonne santé',
          type: 'object',
          properties: {
            status: { type: 'string', enum: ['healthy', 'degraded', 'unhealthy'] },
            timestamp: { type: 'string', format: 'date-time' },
            services: {
              type: 'object',
              properties: {
                api: {
                  type: 'object',
                  properties: {
                    status: { type: 'string' },
                    responseTime: { type: 'string' },
                    uptime: {
                      type: 'object',
                      properties: {
                        seconds: { type: 'integer' },
                        human: { type: 'string' },
                      },
                    },
                    memory: {
                      type: 'object',
                      properties: {
                        rss: { type: 'string' },
                        heapTotal: { type: 'string' },
                        heapUsed: { type: 'string' },
                        external: { type: 'string' },
                      },
                    },
                  },
                },
                redis: {
                  type: 'object',
                  properties: {
                    status: { type: 'string' },
                    connected: { type: 'boolean' },
                    info: { type: 'object' },
                  },
                },
              },
            },
            version: { type: 'string' },
            nodeVersion: { type: 'string' },
            environment: { type: 'string' },
          },
        },
        503: {
          description: 'Service dégradé (Redis indisponible)',
          type: 'object',
          properties: {
            status: { type: 'string' },
            timestamp: { type: 'string', format: 'date-time' },
            services: {
              type: 'object',
              properties: {
                api: { type: 'object' },
                redis: {
                  type: 'object',
                  properties: {
                    status: { type: 'string' },
                    connected: { type: 'boolean' },
                  },
                },
              },
            },
          },
        },
        500: {
          description: 'Erreur interne',
          type: 'object',
          properties: {
            status: { type: 'string' },
            timestamp: { type: 'string', format: 'date-time' },
            error: { type: 'string' },
            correlationId: { type: 'string' },
          },
        },
      },
    },
  }, healthController.getDetailedHealth.bind(healthController));

  // GET /health/redis - Vérification spécifique de Redis
  fastify.get('/redis', {
    schema: {
      description: 'Vérifier spécifiquement l\'état de Redis',
      tags: ['health'],
      response: {
        200: {
          description: 'Redis en bonne santé',
          type: 'object',
          properties: {
            status: { type: 'string', enum: ['healthy', 'unhealthy'] },
            timestamp: { type: 'string', format: 'date-time' },
            responseTime: { type: 'string' },
            redis: {
              type: 'object',
              properties: {
                connected: { type: 'boolean' },
                version: { type: 'string' },
                uptime: { type: 'integer' },
                memory: {
                  type: 'object',
                  properties: {
                    used: { type: 'string' },
                    peak: { type: 'string' },
                  },
                },
                clients: {
                  type: 'object',
                  properties: {
                    connected: { type: 'integer' },
                    blocked: { type: 'integer' },
                  },
                },
                keyspace: {
                  type: 'object',
                  properties: {
                    keys: { type: 'string' },
                  },
                },
              },
            },
          },
        },
        503: {
          description: 'Redis indisponible',
          type: 'object',
          properties: {
            status: { type: 'string' },
            timestamp: { type: 'string', format: 'date-time' },
            responseTime: { type: 'string' },
            error: { type: 'string' },
          },
        },
        500: {
          description: 'Erreur interne',
          type: 'object',
          properties: {
            status: { type: 'string' },
            timestamp: { type: 'string', format: 'date-time' },
            responseTime: { type: 'string' },
            error: { type: 'string' },
            correlationId: { type: 'string' },
          },
        },
      },
    },
  }, healthController.getRedisHealth.bind(healthController));
}
