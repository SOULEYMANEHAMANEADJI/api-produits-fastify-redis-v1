import { FastifyRequest, FastifyReply } from 'fastify';
import { ValidationUtils } from '../models/validation';
import { ValidationError } from '../models/Error';
import { ErrorUtils } from '../models/Error';

/**
 * Middleware de validation pour les données de requête
 */
export class ValidationMiddleware {
  /**
   * Valide le corps de la requête avec un schéma Joi
   */
  static validateBody<T>(schema: any) {
    return async (request: FastifyRequest, reply: FastifyReply) => {
      try {
        const correlationId = (request as any).correlationId;
        const result = ValidationUtils.validate<T>(schema, request.body);
        
        if (result.error) {
          const messages = ValidationUtils.extractErrorMessages(result.error);
          const details = ValidationUtils.extractErrorDetails(result.error);
          
          throw new ValidationError(
            `Données de requête invalides: ${messages.join(', ')}`,
            correlationId,
            { validationDetails: details }
          );
        }
        
        // Remplacer le body par les données validées
        request.body = result.value;
      } catch (error) {
        if (error instanceof ValidationError) {
          throw error;
        }
        
        const correlationId = (request as any).correlationId;
        throw new ValidationError(
          'Erreur de validation des données de requête',
          correlationId,
          { originalError: error instanceof Error ? error.message : String(error) }
        );
      }
    };
  }

  /**
   * Valide les paramètres de route avec un schéma Joi
   */
  static validateParams<T>(schema: any) {
    return async (request: FastifyRequest, reply: FastifyReply) => {
      try {
        const correlationId = (request as any).correlationId;
        const result = ValidationUtils.validate<T>(schema, request.params);
        
        if (result.error) {
          const messages = ValidationUtils.extractErrorMessages(result.error);
          const details = ValidationUtils.extractErrorDetails(result.error);
          
          throw new ValidationError(
            `Paramètres de route invalides: ${messages.join(', ')}`,
            correlationId,
            { validationDetails: details }
          );
        }
        
        // Remplacer les params par les données validées
        request.params = result.value;
      } catch (error) {
        if (error instanceof ValidationError) {
          throw error;
        }
        
        const correlationId = (request as any).correlationId;
        throw new ValidationError(
          'Erreur de validation des paramètres de route',
          correlationId,
          { originalError: error instanceof Error ? error.message : String(error) }
        );
      }
    };
  }

  /**
   * Valide les paramètres de requête (query) avec un schéma Joi
   */
  static validateQuery<T>(schema: any) {
    return async (request: FastifyRequest, reply: FastifyReply) => {
      try {
        const correlationId = (request as any).correlationId;
        const result = ValidationUtils.validate<T>(schema, request.query);
        
        if (result.error) {
          const messages = ValidationUtils.extractErrorMessages(result.error);
          const details = ValidationUtils.extractErrorDetails(result.error);
          
          throw new ValidationError(
            `Paramètres de requête invalides: ${messages.join(', ')}`,
            correlationId,
            { validationDetails: details }
          );
        }
        
        // Remplacer la query par les données validées
        request.query = result.value;
      } catch (error) {
        if (error instanceof ValidationError) {
          throw error;
        }
        
        const correlationId = (request as any).correlationId;
        throw new ValidationError(
          'Erreur de validation des paramètres de requête',
          correlationId,
          { originalError: error instanceof Error ? error.message : String(error) }
        );
      }
    };
  }

  /**
   * Valide les headers avec un schéma Joi
   */
  static validateHeaders<T>(schema: any) {
    return async (request: FastifyRequest, reply: FastifyReply) => {
      try {
        const correlationId = (request as any).correlationId;
        const result = ValidationUtils.validate<T>(schema, request.headers);
        
        if (result.error) {
          const messages = ValidationUtils.extractErrorMessages(result.error);
          const details = ValidationUtils.extractErrorDetails(result.error);
          
          throw new ValidationError(
            `Headers invalides: ${messages.join(', ')}`,
            correlationId,
            { validationDetails: details }
          );
        }
        
        // Remplacer les headers par les données validées
        request.headers = result.value;
      } catch (error) {
        if (error instanceof ValidationError) {
          throw error;
        }
        
        const correlationId = (request as any).correlationId;
        throw new ValidationError(
          'Erreur de validation des headers',
          correlationId,
          { originalError: error instanceof Error ? error.message : String(error) }
        );
      }
    };
  }

  /**
   * Valide que le corps de la requête n'est pas vide
   */
  static validateBodyNotEmpty() {
    return async (request: FastifyRequest, reply: FastifyReply) => {
      const correlationId = (request as any).correlationId;
      
      if (!request.body || Object.keys(request.body).length === 0) {
        throw new ValidationError(
          'Le corps de la requête ne peut pas être vide',
          correlationId
        );
      }
    };
  }

  /**
   * Valide que les paramètres de requête contiennent au moins un filtre
   */
  static validateAtLeastOneFilter() {
    return async (request: FastifyRequest, reply: FastifyReply) => {
      const correlationId = (request as any).correlationId;
      const query = request.query as any;
      
      const hasFilter = query.name || query.minPrice !== undefined || query.maxPrice !== undefined;
      
      if (!hasFilter) {
        throw new ValidationError(
          'Au moins un filtre doit être fourni (name, minPrice, ou maxPrice)',
          correlationId
        );
      }
    };
  }

  /**
   * Valide que l'ID est un UUID valide
   */
  static validateUuid() {
    return async (request: FastifyRequest, reply: FastifyReply) => {
      const correlationId = (request as any).correlationId;
      const params = request.params as any;
      
      if (!params.id) {
        throw new ValidationError(
          'L\'ID est requis',
          correlationId
        );
      }
      
      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
      
      if (!uuidRegex.test(params.id)) {
        throw new ValidationError(
          'L\'ID doit être un UUID valide',
          correlationId,
          { providedId: params.id }
        );
      }
    };
  }

  /**
   * Valide que la pagination est dans les limites autorisées
   */
  static validatePaginationLimits() {
    return async (request: FastifyRequest, reply: FastifyReply) => {
      const correlationId = (request as any).correlationId;
      const query = request.query as any;
      
      if (query.page && (query.page < 1 || query.page > 10000)) {
        throw new ValidationError(
          'Le numéro de page doit être entre 1 et 10000',
          correlationId,
          { providedPage: query.page }
        );
      }
      
      if (query.limit && (query.limit < 1 || query.limit > 100)) {
        throw new ValidationError(
          'La limite doit être entre 1 et 100',
          correlationId,
          { providedLimit: query.limit }
        );
      }
    };
  }
}
