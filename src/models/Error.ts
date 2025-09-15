/**
 * Types d'erreurs personnalisées
 */
export enum ErrorType {
  VALIDATION_ERROR = 'ValidationError',
  NOT_FOUND = 'NotFoundError',
  CONFLICT = 'ConflictError',
  INTERNAL_ERROR = 'InternalServerError',
  REDIS_ERROR = 'RedisError',
  UNAUTHORIZED = 'UnauthorizedError',
  FORBIDDEN = 'ForbiddenError',
  BAD_REQUEST = 'BadRequestError',
}

/**
 * Interface pour les erreurs personnalisées
 */
export interface CustomError extends Error {
  type: ErrorType;
  statusCode: number;
  correlationId?: string;
  details?: Record<string, unknown>;
}

/**
 * Classe d'erreur personnalisée
 */
export class AppError extends Error implements CustomError {
  public readonly type: ErrorType;
  public readonly statusCode: number;
  public readonly correlationId?: string;
  public readonly details?: Record<string, unknown>;
  public readonly timestamp: string;

  constructor(
    type: ErrorType,
    message: string,
    statusCode: number,
    correlationId?: string,
    details?: Record<string, unknown>
  ) {
    super(message);
    this.name = this.constructor.name;
    this.type = type;
    this.statusCode = statusCode;
    this.correlationId = correlationId;
    this.details = details;
    this.timestamp = new Date().toISOString();

    // Maintenir la stack trace
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, this.constructor);
    }
  }

  /**
   * Convertit l'erreur en objet de réponse API
   */
  toJSON() {
    return {
      error: this.type,
      message: this.message,
      statusCode: this.statusCode,
      timestamp: this.timestamp,
      correlationId: this.correlationId,
      details: this.details,
    };
  }
}

/**
 * Erreur de validation
 */
export class ValidationError extends AppError {
  constructor(message: string, correlationId?: string, details?: Record<string, unknown>) {
    super(ErrorType.VALIDATION_ERROR, message, 400, correlationId, details);
  }
}

/**
 * Erreur de ressource non trouvée
 */
export class NotFoundError extends AppError {
  constructor(resource: string, id?: string, correlationId?: string) {
    const message = id ? `${resource} avec l'ID '${id}' non trouvé` : `${resource} non trouvé`;
    super(ErrorType.NOT_FOUND, message, 404, correlationId, { resource, id });
  }
}

/**
 * Erreur de conflit (ressource déjà existante)
 */
export class ConflictError extends AppError {
  constructor(message: string, correlationId?: string, details?: Record<string, unknown>) {
    super(ErrorType.CONFLICT, message, 409, correlationId, details);
  }
}

/**
 * Erreur interne du serveur
 */
export class InternalError extends AppError {
  constructor(message: string, correlationId?: string, details?: Record<string, unknown>) {
    super(ErrorType.INTERNAL_ERROR, message, 500, correlationId, details);
  }
}

/**
 * Erreur Redis
 */
export class RedisError extends AppError {
  constructor(message: string, correlationId?: string, details?: Record<string, unknown>) {
    super(ErrorType.REDIS_ERROR, message, 500, correlationId, details);
  }
}

/**
 * Erreur d'autorisation
 */
export class UnauthorizedError extends AppError {
  constructor(message: string = 'Non autorisé', correlationId?: string) {
    super(ErrorType.UNAUTHORIZED, message, 401, correlationId);
  }
}

/**
 * Erreur d'accès interdit
 */
export class ForbiddenError extends AppError {
  constructor(message: string = 'Accès interdit', correlationId?: string) {
    super(ErrorType.FORBIDDEN, message, 403, correlationId);
  }
}

/**
 * Erreur de requête malformée
 */
export class BadRequestError extends AppError {
  constructor(message: string, correlationId?: string, details?: Record<string, unknown>) {
    super(ErrorType.BAD_REQUEST, message, 400, correlationId, details);
  }
}

/**
 * Interface pour la réponse d'erreur API
 */
export interface ErrorResponse {
  error: string;
  message: string;
  statusCode: number;
  timestamp: string;
  path?: string;
  correlationId?: string;
  details?: Record<string, unknown>;
}

/**
 * Utilitaires pour la gestion d'erreurs
 */
export class ErrorUtils {
  /**
   * Génère un ID de corrélation unique
   */
  static generateCorrelationId(): string {
    return `req-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Vérifie si une erreur est une AppError
   */
  static isAppError(error: unknown): error is AppError {
    return error instanceof AppError;
  }

  /**
   * Convertit une erreur en AppError
   */
  static toAppError(error: unknown, correlationId?: string): AppError {
    if (this.isAppError(error)) {
      return error;
    }

    if (error instanceof Error) {
      return new InternalError(
        error.message,
        correlationId,
        { originalError: error.name, stack: error.stack }
      );
    }

    return new InternalError(
      'Une erreur inattendue s\'est produite',
      correlationId,
      { originalError: String(error) }
    );
  }

  /**
   * Extrait le message d'erreur d'une validation Joi
   */
  static extractJoiErrorMessage(error: any): string {
    if (error.details && Array.isArray(error.details)) {
      return error.details.map((detail: any) => detail.message).join(', ');
    }
    return error.message || 'Erreur de validation';
  }

  /**
   * Extrait les détails d'erreur de validation Joi
   */
  static extractJoiErrorDetails(error: any): Record<string, unknown> {
    if (error.details && Array.isArray(error.details)) {
      return {
        validationErrors: error.details.map((detail: any) => ({
          field: detail.path.join('.'),
          message: detail.message,
          value: detail.context?.value,
        })),
      };
    }
    return {};
  }
}
