import winston from 'winston';
import { env } from '../config/environment';
import { ErrorUtils } from '../models/Error';

/**
 * Configuration des formats de log
 */
const logFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss.SSS' }),
  winston.format.errors({ stack: true }),
  winston.format.json(),
  winston.format.printf(({ timestamp, level, message, correlationId, ...meta }) => {
    const logEntry = {
      timestamp,
      level,
      message,
      correlationId,
      ...meta,
    };
    return JSON.stringify(logEntry);
  })
);

/**
 * Configuration des transports
 */
const transports: winston.transport[] = [
  // Console transport
  new winston.transports.Console({
    level: env.LOG_LEVEL,
    format: winston.format.combine(
      winston.format.colorize(),
      winston.format.simple(),
      winston.format.printf(({ timestamp, level, message, correlationId, ...meta }) => {
        const metaStr = Object.keys(meta).length > 0 ? ` ${JSON.stringify(meta)}` : '';
        const corrId = correlationId ? ` [${correlationId}]` : '';
        return `${timestamp} ${level}: ${message}${corrId}${metaStr}`;
      })
    ),
  }),
];

// Ajouter le transport fichier en production
if (env.NODE_ENV === 'production') {
  transports.push(
    new winston.transports.File({
      filename: env.LOG_FILE,
      level: env.LOG_LEVEL,
      format: logFormat,
      maxsize: 10 * 1024 * 1024, // 10MB
      maxFiles: 5,
      tailable: true,
    })
  );
}

/**
 * Instance du logger Winston
 */
export const logger = winston.createLogger({
  level: env.LOG_LEVEL,
  format: logFormat,
  transports,
  exitOnError: false,
  silent: env.NODE_ENV === 'test',
});

/**
 * Interface pour les métadonnées de log
 */
export interface LogMetadata {
  correlationId?: string;
  userId?: string;
  requestId?: string;
  method?: string;
  url?: string;
  statusCode?: number;
  responseTime?: number;
  userAgent?: string;
  ip?: string;
  [key: string]: unknown;
}

/**
 * Classe utilitaire pour le logging structuré
 */
export class Logger {
  private correlationId?: string;

  constructor(correlationId?: string) {
    this.correlationId = correlationId;
  }

  /**
   * Log d'information
   */
  info(message: string, meta?: LogMetadata): void {
    logger.info(message, { ...meta, correlationId: this.correlationId });
  }

  /**
   * Log d'avertissement
   */
  warn(message: string, meta?: LogMetadata): void {
    logger.warn(message, { ...meta, correlationId: this.correlationId });
  }

  /**
   * Log d'erreur
   */
  error(message: string, error?: Error | unknown, meta?: LogMetadata): void {
    const errorMeta = this.extractErrorMeta(error);
    logger.error(message, { ...meta, ...errorMeta, correlationId: this.correlationId });
  }

  /**
   * Log de debug
   */
  debug(message: string, meta?: LogMetadata): void {
    logger.debug(message, { ...meta, correlationId: this.correlationId });
  }

  /**
   * Log de requête HTTP
   */
  logRequest(method: string, url: string, meta?: LogMetadata): void {
    this.info(`Incoming ${method} ${url}`, {
      method,
      url,
      ...meta,
    });
  }

  /**
   * Log de réponse HTTP
   */
  logResponse(method: string, url: string, statusCode: number, responseTime: number, meta?: LogMetadata): void {
    const level = statusCode >= 400 ? 'error' : 'info';
    logger[level](`${method} ${url} ${statusCode} - ${responseTime}ms`, {
      method,
      url,
      statusCode,
      responseTime,
      ...meta,
      correlationId: this.correlationId,
    });
  }

  /**
   * Log d'erreur de validation
   */
  logValidationError(message: string, errors: string[], meta?: LogMetadata): void {
    this.error(message, undefined, {
      ...meta,
      validationErrors: errors,
    });
  }

  /**
   * Log d'erreur de base de données
   */
  logDatabaseError(operation: string, error: Error | unknown, meta?: LogMetadata): void {
    this.error(`Database error during ${operation}`, error, {
      ...meta,
      operation,
    });
  }

  /**
   * Log de performance
   */
  logPerformance(operation: string, duration: number, meta?: LogMetadata): void {
    this.info(`Performance: ${operation} completed in ${duration}ms`, {
      ...meta,
      operation,
      duration,
    });
  }

  /**
   * Extrait les métadonnées d'une erreur
   */
  private extractErrorMeta(error?: Error | unknown): LogMetadata {
    if (!error) return {};

    if (error instanceof Error) {
      return {
        errorName: error.name,
        errorMessage: error.message,
        errorStack: error.stack,
      };
    }

    return {
      error: String(error),
    };
  }

  /**
   * Crée un nouveau logger avec un ID de corrélation
   */
  withCorrelationId(correlationId: string): Logger {
    return new Logger(correlationId);
  }
}

/**
 * Instance par défaut du logger
 */
export const defaultLogger = new Logger();

/**
 * Middleware de logging pour Fastify
 */
export const loggingMiddleware = {
  request: (request: any, reply: any, done: () => void) => {
    const correlationId = ErrorUtils.generateCorrelationId();
    request.correlationId = correlationId;
    request.logger = new Logger(correlationId);
    
    request.logger.logRequest(request.method, request.url, {
      userAgent: request.headers['user-agent'],
      ip: request.ip,
    });
    
    done();
  },
  
  response: (request: any, reply: any, done: () => void) => {
    const responseTime = Date.now() - request.startTime;
    request.logger?.logResponse(
      request.method,
      request.url,
      reply.statusCode,
      responseTime
    );
    
    done();
  },
};
