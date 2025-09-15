import { FastifyRequest, FastifyReply, FastifyError } from 'fastify';
import { AppError, ErrorUtils, ErrorResponse } from '../models/Error';
import { logger } from '../utils/logger';
import { env } from '../config/environment';

/**
 * Middleware de gestion d'erreurs centralisée
 */
export class ErrorHandler {
  /**
   * Gestionnaire d'erreurs principal
   */
  static handle(error: FastifyError, request: FastifyRequest, reply: FastifyReply): void {
    const correlationId = (request as any).correlationId || ErrorUtils.generateCorrelationId();
    const path = request.url;
    const method = request.method;

    // Convertir l'erreur en AppError si ce n'est pas déjà le cas
    const appError = ErrorUtils.toAppError(error, correlationId);

    // Ajouter les informations de la requête
    const errorResponse: ErrorResponse = {
      ...appError.toJSON(),
      path,
    };

    // Logger l'erreur
    if (appError.statusCode >= 500) {
      logger.error(
        `Erreur serveur: ${appError.message}`,
        appError,
        {
          correlationId,
          method,
          path,
          statusCode: appError.statusCode,
          userAgent: request.headers['user-agent'],
          ip: request.ip,
        }
      );
    } else {
      logger.warn(
        `Erreur client: ${appError.message}`,
        {
          correlationId,
          method,
          path,
          statusCode: appError.statusCode,
          userAgent: request.headers['user-agent'],
          ip: request.ip,
        }
      );
    }

    // Répondre avec l'erreur
    reply.status(appError.statusCode).send(errorResponse);
  }

  /**
   * Gestionnaire d'erreurs de validation
   */
  static handleValidationError(error: any, request: FastifyRequest, reply: FastifyReply): void {
    const correlationId = (request as any).correlationId || ErrorUtils.generateCorrelationId();
    const path = request.url;
    const method = request.method;

    // Extraire les messages d'erreur de Joi
    const message = ErrorUtils.extractJoiErrorMessage(error);
    const details = ErrorUtils.extractJoiErrorDetails(error);

    const errorResponse: ErrorResponse = {
      error: 'ValidationError',
      message: `Erreur de validation: ${message}`,
      statusCode: 400,
      timestamp: new Date().toISOString(),
      path,
      correlationId,
      details,
    };

    logger.warn(
      `Erreur de validation: ${message}`,
      {
        correlationId,
        method,
        path,
        validationDetails: details,
        userAgent: request.headers['user-agent'],
        ip: request.ip,
      }
    );

    reply.status(400).send(errorResponse);
  }

  /**
   * Gestionnaire d'erreurs 404
   */
  static handleNotFound(request: FastifyRequest, reply: FastifyReply): void {
    const correlationId = (request as any).correlationId || ErrorUtils.generateCorrelationId();
    const path = request.url;
    const method = request.method;

    const errorResponse: ErrorResponse = {
      error: 'NotFoundError',
      message: `Route non trouvée: ${method} ${path}`,
      statusCode: 404,
      timestamp: new Date().toISOString(),
      path,
      correlationId,
    };

    logger.warn(
      `Route non trouvée: ${method} ${path}`,
      {
        correlationId,
        method,
        path,
        userAgent: request.headers['user-agent'],
        ip: request.ip,
      }
    );

    reply.status(404).send(errorResponse);
  }

  /**
   * Gestionnaire d'erreurs de syntaxe JSON
   */
  static handleJsonSyntaxError(error: any, request: FastifyRequest, reply: FastifyReply): void {
    const correlationId = (request as any).correlationId || ErrorUtils.generateCorrelationId();
    const path = request.url;
    const method = request.method;

    const errorResponse: ErrorResponse = {
      error: 'JsonSyntaxError',
      message: 'JSON invalide dans le corps de la requête',
      statusCode: 400,
      timestamp: new Date().toISOString(),
      path,
      correlationId,
      details: {
        originalError: error.message,
      },
    };

    logger.warn(
      `Erreur de syntaxe JSON: ${error.message}`,
      {
        correlationId,
        method,
        path,
        userAgent: request.headers['user-agent'],
        ip: request.ip,
      }
    );

    reply.status(400).send(errorResponse);
  }

  /**
   * Gestionnaire d'erreurs de limite de taille de requête
   */
  static handlePayloadTooLarge(error: any, request: FastifyRequest, reply: FastifyReply): void {
    const correlationId = (request as any).correlationId || ErrorUtils.generateCorrelationId();
    const path = request.url;
    const method = request.method;

    const errorResponse: ErrorResponse = {
      error: 'PayloadTooLargeError',
      message: 'Le corps de la requête est trop volumineux',
      statusCode: 413,
      timestamp: new Date().toISOString(),
      path,
      correlationId,
      details: {
        limit: error.limit,
        received: error.length,
      },
    };

    logger.warn(
      `Requête trop volumineuse: ${error.message}`,
      {
        correlationId,
        method,
        path,
        limit: error.limit,
        received: error.length,
        userAgent: request.headers['user-agent'],
        ip: request.ip,
      }
    );

    reply.status(413).send(errorResponse);
  }

  /**
   * Gestionnaire d'erreurs de timeout
   */
  static handleTimeout(error: any, request: FastifyRequest, reply: FastifyReply): void {
    const correlationId = (request as any).correlationId || ErrorUtils.generateCorrelationId();
    const path = request.url;
    const method = request.method;

    const errorResponse: ErrorResponse = {
      error: 'TimeoutError',
      message: 'La requête a expiré',
      statusCode: 408,
      timestamp: new Date().toISOString(),
      path,
      correlationId,
      details: {
        timeout: error.timeout,
      },
    };

    logger.warn(
      `Timeout de requête: ${error.message}`,
      {
        correlationId,
        method,
        path,
        timeout: error.timeout,
        userAgent: request.headers['user-agent'],
        ip: request.ip,
      }
    );

    reply.status(408).send(errorResponse);
  }

  /**
   * Gestionnaire d'erreurs de rate limiting
   */
  static handleRateLimit(error: any, request: FastifyRequest, reply: FastifyReply): void {
    const correlationId = (request as any).correlationId || ErrorUtils.generateCorrelationId();
    const path = request.url;
    const method = request.method;

    const errorResponse: ErrorResponse = {
      error: 'RateLimitError',
      message: 'Trop de requêtes, veuillez réessayer plus tard',
      statusCode: 429,
      timestamp: new Date().toISOString(),
      path,
      correlationId,
      details: {
        limit: error.limit,
        remaining: error.remaining,
        resetTime: error.resetTime,
      },
    };

    logger.warn(
      `Rate limit dépassé: ${error.message}`,
      {
        correlationId,
        method,
        path,
        limit: error.limit,
        remaining: error.remaining,
        resetTime: error.resetTime,
        userAgent: request.headers['user-agent'],
        ip: request.ip,
      }
    );

    reply.status(429).send(errorResponse);
  }

  /**
   * Gestionnaire d'erreurs de connexion Redis
   */
  static handleRedisError(error: any, request: FastifyRequest, reply: FastifyReply): void {
    const correlationId = (request as any).correlationId || ErrorUtils.generateCorrelationId();
    const path = request.url;
    const method = request.method;

    const errorResponse: ErrorResponse = {
      error: 'RedisError',
      message: 'Erreur de connexion à la base de données',
      statusCode: 503,
      timestamp: new Date().toISOString(),
      path,
      correlationId,
      details: {
        originalError: error.message,
      },
    };

    logger.error(
      `Erreur Redis: ${error.message}`,
      error,
      {
        correlationId,
        method,
        path,
        userAgent: request.headers['user-agent'],
        ip: request.ip,
      }
    );

    reply.status(503).send(errorResponse);
  }

  /**
   * Gestionnaire d'erreurs générique pour les erreurs non gérées
   */
  static handleGenericError(error: any, request: FastifyRequest, reply: FastifyReply): void {
    const correlationId = (request as any).correlationId || ErrorUtils.generateCorrelationId();
    const path = request.url;
    const method = request.method;

    const errorResponse: ErrorResponse = {
      error: 'InternalServerError',
      message: env.NODE_ENV === 'production' 
        ? 'Une erreur interne s\'est produite' 
        : error.message || 'Erreur inconnue',
      statusCode: 500,
      timestamp: new Date().toISOString(),
      path,
      correlationId,
      details: env.NODE_ENV === 'production' 
        ? undefined 
        : {
            originalError: error.message,
            stack: error.stack,
          },
    };

    logger.error(
      `Erreur non gérée: ${error.message || 'Erreur inconnue'}`,
      error,
      {
        correlationId,
        method,
        path,
        userAgent: request.headers['user-agent'],
        ip: request.ip,
      }
    );

    reply.status(500).send(errorResponse);
  }
}
