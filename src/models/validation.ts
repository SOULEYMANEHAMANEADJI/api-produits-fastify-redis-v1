import Joi from 'joi';

/**
 * Schéma de validation pour la création d'un produit
 */
export const createProductSchema = Joi.object({
  name: Joi.string()
    .trim()
    .min(2)
    .max(100)
    .required()
    .messages({
      'string.empty': 'Le nom du produit est requis',
      'string.min': 'Le nom du produit doit contenir au moins 2 caractères',
      'string.max': 'Le nom du produit ne peut pas dépasser 100 caractères',
      'any.required': 'Le nom du produit est requis',
    }),
  
  description: Joi.string()
    .trim()
    .min(10)
    .max(500)
    .required()
    .messages({
      'string.empty': 'La description du produit est requise',
      'string.min': 'La description du produit doit contenir au moins 10 caractères',
      'string.max': 'La description du produit ne peut pas dépasser 500 caractères',
      'any.required': 'La description du produit est requise',
    }),
  
  price: Joi.number()
    .positive()
    .precision(2)
    .max(999999.99)
    .required()
    .messages({
      'number.positive': 'Le prix du produit doit être supérieur à 0',
      'number.precision': 'Le prix du produit ne peut avoir que 2 décimales maximum',
      'number.max': 'Le prix du produit ne peut pas dépasser 999999.99',
      'any.required': 'Le prix du produit est requis',
    }),
  
  qty: Joi.number()
    .integer()
    .min(0)
    .max(999999)
    .required()
    .messages({
      'number.integer': 'La quantité doit être un nombre entier',
      'number.min': 'La quantité ne peut pas être négative',
      'number.max': 'La quantité ne peut pas dépasser 999999',
      'any.required': 'La quantité est requise',
    }),
});

/**
 * Schéma de validation pour la mise à jour complète d'un produit
 */
export const updateProductSchema = Joi.object({
  name: Joi.string()
    .trim()
    .min(2)
    .max(100)
    .required()
    .messages({
      'string.empty': 'Le nom du produit est requis',
      'string.min': 'Le nom du produit doit contenir au moins 2 caractères',
      'string.max': 'Le nom du produit ne peut pas dépasser 100 caractères',
      'any.required': 'Le nom du produit est requis',
    }),
  
  description: Joi.string()
    .trim()
    .min(10)
    .max(500)
    .required()
    .messages({
      'string.empty': 'La description du produit est requise',
      'string.min': 'La description du produit doit contenir au moins 10 caractères',
      'string.max': 'La description du produit ne peut pas dépasser 500 caractères',
      'any.required': 'La description du produit est requise',
    }),
  
  price: Joi.number()
    .positive()
    .precision(2)
    .max(999999.99)
    .required()
    .messages({
      'number.positive': 'Le prix du produit doit être supérieur à 0',
      'number.precision': 'Le prix du produit ne peut avoir que 2 décimales maximum',
      'number.max': 'Le prix du produit ne peut pas dépasser 999999.99',
      'any.required': 'Le prix du produit est requis',
    }),
  
  qty: Joi.number()
    .integer()
    .min(0)
    .max(999999)
    .required()
    .messages({
      'number.integer': 'La quantité doit être un nombre entier',
      'number.min': 'La quantité ne peut pas être négative',
      'number.max': 'La quantité ne peut pas dépasser 999999',
      'any.required': 'La quantité est requise',
    }),
});

/**
 * Schéma de validation pour la mise à jour partielle d'un produit
 */
export const patchProductSchema = Joi.object({
  name: Joi.string()
    .trim()
    .min(2)
    .max(100)
    .optional()
    .messages({
      'string.empty': 'Le nom du produit ne peut pas être vide',
      'string.min': 'Le nom du produit doit contenir au moins 2 caractères',
      'string.max': 'Le nom du produit ne peut pas dépasser 100 caractères',
    }),
  
  description: Joi.string()
    .trim()
    .min(10)
    .max(500)
    .optional()
    .messages({
      'string.empty': 'La description du produit ne peut pas être vide',
      'string.min': 'La description du produit doit contenir au moins 10 caractères',
      'string.max': 'La description du produit ne peut pas dépasser 500 caractères',
    }),
  
  price: Joi.number()
    .positive()
    .precision(2)
    .max(999999.99)
    .optional()
    .messages({
      'number.positive': 'Le prix du produit doit être supérieur à 0',
      'number.precision': 'Le prix du produit ne peut avoir que 2 décimales maximum',
      'number.max': 'Le prix du produit ne peut pas dépasser 999999.99',
    }),
  
  qty: Joi.number()
    .integer()
    .min(0)
    .max(999999)
    .optional()
    .messages({
      'number.integer': 'La quantité doit être un nombre entier',
      'number.min': 'La quantité ne peut pas être négative',
      'number.max': 'La quantité ne peut pas dépasser 999999',
    }),
}).min(1).messages({
  'object.min': 'Au moins un champ doit être fourni pour la mise à jour',
});

/**
 * Schéma de validation pour l'ID de produit (UUID v4)
 */
export const productIdSchema = Joi.string()
  .uuid({ version: 'uuidv4' })
  .required()
  .messages({
    'string.guid': 'L\'ID du produit doit être un UUID valide',
    'any.required': 'L\'ID du produit est requis',
  });

/**
 * Schéma de validation pour les paramètres de pagination
 */
export const paginationSchema = Joi.object({
  page: Joi.number()
    .integer()
    .min(1)
    .default(1)
    .messages({
      'number.integer': 'Le numéro de page doit être un entier',
      'number.min': 'Le numéro de page doit être supérieur ou égal à 1',
    }),
  
  limit: Joi.number()
    .integer()
    .min(1)
    .max(100)
    .default(10)
    .messages({
      'number.integer': 'La limite doit être un entier',
      'number.min': 'La limite doit être supérieure ou égale à 1',
      'number.max': 'La limite ne peut pas dépasser 100',
    }),
});

/**
 * Schéma de validation pour les filtres de recherche
 */
export const productFiltersSchema = Joi.object({
  name: Joi.string()
    .trim()
    .min(1)
    .max(100)
    .optional()
    .messages({
      'string.min': 'Le filtre de nom doit contenir au moins 1 caractère',
      'string.max': 'Le filtre de nom ne peut pas dépasser 100 caractères',
    }),
  
  minPrice: Joi.number()
    .positive()
    .precision(2)
    .max(999999.99)
    .optional()
    .messages({
      'number.positive': 'Le prix minimum doit être supérieur à 0',
      'number.precision': 'Le prix minimum ne peut avoir que 2 décimales maximum',
      'number.max': 'Le prix minimum ne peut pas dépasser 999999.99',
    }),
  
  maxPrice: Joi.number()
    .positive()
    .precision(2)
    .max(999999.99)
    .optional()
    .messages({
      'number.positive': 'Le prix maximum doit être supérieur à 0',
      'number.precision': 'Le prix maximum ne peut avoir que 2 décimales maximum',
      'number.max': 'Le prix maximum ne peut pas dépasser 999999.99',
    }),
}).custom((value, helpers) => {
  // Validation croisée : minPrice doit être inférieur à maxPrice
  if (value.minPrice && value.maxPrice && value.minPrice >= value.maxPrice) {
    return helpers.error('custom.minMaxPrice');
  }
  return value;
}).messages({
  'custom.minMaxPrice': 'Le prix minimum doit être inférieur au prix maximum',
});

/**
 * Schéma de validation pour les paramètres de requête (pagination + filtres)
 */
export const queryParamsSchema = paginationSchema.concat(productFiltersSchema);

/**
 * Schéma de validation pour les paramètres de route
 */
export const routeParamsSchema = Joi.object({
  id: productIdSchema,
});

/**
 * Utilitaires de validation
 */
export class ValidationUtils {
  /**
   * Valide les données avec un schéma Joi
   */
  static validate<T>(schema: Joi.Schema, data: unknown): { value: T; error?: never } | { value?: never; error: Joi.ValidationError } {
    const { error, value } = schema.validate(data, {
      abortEarly: false,
      stripUnknown: true,
      convert: true,
    });

    if (error) {
      return { error };
    }

    return { value: value as T };
  }

  /**
   * Valide les données et lance une erreur si invalide
   */
  static validateOrThrow<T>(schema: Joi.Schema, data: unknown): T {
    const result = this.validate<T>(schema, data);
    
    if (result.error) {
      throw result.error;
    }
    
    return result.value;
  }

  /**
   * Extrait les messages d'erreur d'une ValidationError
   */
  static extractErrorMessages(error: Joi.ValidationError): string[] {
    return error.details.map(detail => detail.message);
  }

  /**
   * Extrait les détails d'erreur structurés
   */
  static extractErrorDetails(error: Joi.ValidationError): Array<{
    field: string;
    message: string;
    value: unknown;
  }> {
    return error.details.map(detail => ({
      field: detail.path.join('.'),
      message: detail.message,
      value: detail.context?.value,
    }));
  }
}
