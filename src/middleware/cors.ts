import { FastifyRequest, FastifyReply } from 'fastify';
import { env } from '../config/environment';
import { logger } from '../utils/logger';

/**
 * Configuration CORS personnalisée
 */
export class CorsMiddleware {
  /**
   * Vérifie si l'origine est autorisée
   */
  private static isOriginAllowed(origin: string): boolean {
    if (env.CORS_ORIGIN === '*') {
      return true;
    }

    if (env.CORS_ORIGIN === 'false') {
      return false;
    }

    // Support des origines multiples séparées par des virgules
    const allowedOrigins = env.CORS_ORIGIN.split(',').map(o => o.trim());
    return allowedOrigins.includes(origin);
  }

  /**
   * Middleware CORS pour les requêtes preflight
   */
  static handlePreflight(request: FastifyRequest, reply: FastifyReply): void {
    const origin = request.headers.origin;
    const method = request.headers['access-control-request-method'];
    const headers = request.headers['access-control-request-headers'];

    // Vérifier l'origine
    if (origin && !this.isOriginAllowed(origin)) {
      logger.warn(`Origine CORS non autorisée: ${origin}`, {
        origin,
        method,
        headers,
        correlationId: (request as any).correlationId,
      });
      
      reply.status(403).send({
        error: 'CorsError',
        message: 'Origine non autorisée',
        statusCode: 403,
        timestamp: new Date().toISOString(),
      });
      return;
    }

    // Définir les headers CORS
    if (origin) {
      reply.header('Access-Control-Allow-Origin', origin);
    }

    reply.header('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS');
    reply.header('Access-Control-Allow-Headers', [
      'Origin',
      'X-Requested-With',
      'Content-Type',
      'Accept',
      'Authorization',
      'X-Correlation-ID',
    ].join(', '));
    reply.header('Access-Control-Allow-Credentials', 'true');
    reply.header('Access-Control-Max-Age', '86400'); // 24 heures

    // Répondre à la requête preflight
    reply.status(204).send();
  }

  /**
   * Middleware CORS pour les requêtes normales
   */
  static handleRequest(request: FastifyRequest, reply: FastifyReply): void {
    const origin = request.headers.origin;

    // Vérifier l'origine
    if (origin && !this.isOriginAllowed(origin)) {
      logger.warn(`Origine CORS non autorisée: ${origin}`, {
        origin,
        method: request.method,
        url: request.url,
        correlationId: (request as any).correlationId,
      });
      
      reply.status(403).send({
        error: 'CorsError',
        message: 'Origine non autorisée',
        statusCode: 403,
        timestamp: new Date().toISOString(),
      });
      return;
    }

    // Définir les headers CORS
    if (origin) {
      reply.header('Access-Control-Allow-Origin', origin);
    }

    reply.header('Access-Control-Allow-Credentials', 'true');
    reply.header('Access-Control-Expose-Headers', [
      'X-Correlation-ID',
      'X-Response-Time',
      'X-Total-Count',
    ].join(', '));
  }

  /**
   * Middleware CORS complet
   */
  static middleware() {
    return async (request: FastifyRequest, reply: FastifyReply) => {
      // Gérer les requêtes OPTIONS (preflight)
      if (request.method === 'OPTIONS') {
        this.handlePreflight(request, reply);
        return;
      }

      // Gérer les requêtes normales
      this.handleRequest(request, reply);
    };
  }

  /**
   * Configuration CORS pour Fastify
   */
  static getFastifyCorsConfig() {
    return {
      origin: (origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) => {
        if (!origin) {
          // Autoriser les requêtes sans origine (ex: Postman, curl)
          callback(null, true);
          return;
        }

        if (this.isOriginAllowed(origin)) {
          callback(null, true);
        } else {
          logger.warn(`Origine CORS rejetée: ${origin}`);
          callback(new Error('Origine non autorisée'), false);
        }
      },
      methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
      allowedHeaders: [
        'Origin',
        'X-Requested-With',
        'Content-Type',
        'Accept',
        'Authorization',
        'X-Correlation-ID',
      ],
      exposedHeaders: [
        'X-Correlation-ID',
        'X-Response-Time',
        'X-Total-Count',
      ],
      credentials: true,
      maxAge: 86400, // 24 heures
      preflightContinue: false,
      optionsSuccessStatus: 204,
    };
  }
}
