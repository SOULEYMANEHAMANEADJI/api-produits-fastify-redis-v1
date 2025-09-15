import { v4 as uuidv4 } from 'uuid';

/**
 * Interface principale du produit selon les spécifications
 */
export interface Product {
  id: string;        // UUID v4
  name: string;      // 2-100 caractères, requis
  description: string; // 10-500 caractères, requis  
  price: number;     // > 0, max 2 décimales
  qty: number;       // >= 0, entier
  createdAt: string; // ISO timestamp
  updatedAt: string; // ISO timestamp
}

/**
 * Interface pour la création d'un produit (sans id et timestamps)
 */
export interface CreateProductRequest {
  name: string;
  description: string;
  price: number;
  qty: number;
}

/**
 * Interface pour la mise à jour d'un produit (tous les champs optionnels)
 */
export interface UpdateProductRequest {
  name?: string;
  description?: string;
  price?: number;
  qty?: number;
}

/**
 * Interface pour la mise à jour partielle d'un produit
 */
export interface PatchProductRequest {
  name?: string;
  description?: string;
  price?: number;
  qty?: number;
}

/**
 * Interface pour les filtres de recherche
 */
export interface ProductFilters {
  name?: string;
  minPrice?: number;
  maxPrice?: number;
}

/**
 * Interface pour la pagination
 */
export interface PaginationParams {
  page: number;
  limit: number;
}

/**
 * Interface pour la réponse paginée
 */
export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  filters?: ProductFilters;
}

/**
 * Interface pour les métadonnées de pagination
 */
export interface PaginationMetadata {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

/**
 * Classe Product avec méthodes utilitaires
 */
export class ProductModel implements Product {
  public readonly id: string;
  public name: string;
  public description: string;
  public price: number;
  public qty: number;
  public readonly createdAt: string;
  public updatedAt: string;

  constructor(data: CreateProductRequest) {
    this.id = uuidv4();
    this.name = data.name.trim();
    this.description = data.description.trim();
    this.price = Math.round(data.price * 100) / 100; // Arrondir à 2 décimales
    this.qty = Math.floor(data.qty); // S'assurer que c'est un entier
    this.createdAt = new Date().toISOString();
    this.updatedAt = this.createdAt;
  }

  /**
   * Met à jour le produit avec de nouvelles données
   */
  update(data: UpdateProductRequest | PatchProductRequest): void {
    const now = new Date().toISOString();
    
    if (data.name !== undefined) {
      this.name = data.name.trim();
    }
    
    if (data.description !== undefined) {
      this.description = data.description.trim();
    }
    
    if (data.price !== undefined) {
      this.price = Math.round(data.price * 100) / 100;
    }
    
    if (data.qty !== undefined) {
      this.qty = Math.floor(data.qty);
    }
    
    this.updatedAt = now;
  }

  /**
   * Convertit le produit en objet plain
   */
  toJSON(): Product {
    return {
      id: this.id,
      name: this.name,
      description: this.description,
      price: this.price,
      qty: this.qty,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    };
  }

  /**
   * Crée un produit à partir d'un objet plain
   */
  static fromJSON(data: Product): ProductModel {
    const product = new ProductModel({
      name: data.name,
      description: data.description,
      price: data.price,
      qty: data.qty,
    });
    
    // Remplacer les propriétés générées par celles du JSON
    (product as any).id = data.id;
    (product as any).createdAt = data.createdAt;
    (product as any).updatedAt = data.updatedAt;
    
    return product;
  }

  /**
   * Valide les données d'un produit
   */
  static validate(data: CreateProductRequest): string[] {
    const errors: string[] = [];

    if (!data.name || typeof data.name !== 'string') {
      errors.push('Le nom est requis');
    } else if (data.name.trim().length < 2) {
      errors.push('Le nom doit contenir au moins 2 caractères');
    } else if (data.name.trim().length > 100) {
      errors.push('Le nom ne peut pas dépasser 100 caractères');
    }

    if (!data.description || typeof data.description !== 'string') {
      errors.push('La description est requise');
    } else if (data.description.trim().length < 10) {
      errors.push('La description doit contenir au moins 10 caractères');
    } else if (data.description.trim().length > 500) {
      errors.push('La description ne peut pas dépasser 500 caractères');
    }

    if (typeof data.price !== 'number' || isNaN(data.price)) {
      errors.push('Le prix est requis et doit être un nombre');
    } else if (data.price <= 0) {
      errors.push('Le prix doit être supérieur à 0');
    } else if (data.price > 999999.99) {
      errors.push('Le prix ne peut pas dépasser 999999.99');
    }

    if (typeof data.qty !== 'number' || isNaN(data.qty)) {
      errors.push('La quantité est requise et doit être un nombre');
    } else if (!Number.isInteger(data.qty)) {
      errors.push('La quantité doit être un nombre entier');
    } else if (data.qty < 0) {
      errors.push('La quantité ne peut pas être négative');
    } else if (data.qty > 999999) {
      errors.push('La quantité ne peut pas dépasser 999999');
    }

    return errors;
  }

  /**
   * Valide les données de mise à jour
   */
  static validateUpdate(data: UpdateProductRequest | PatchProductRequest): string[] {
    const errors: string[] = [];

    if (data.name !== undefined) {
      if (typeof data.name !== 'string') {
        errors.push('Le nom doit être une chaîne de caractères');
      } else if (data.name.trim().length < 2) {
        errors.push('Le nom doit contenir au moins 2 caractères');
      } else if (data.name.trim().length > 100) {
        errors.push('Le nom ne peut pas dépasser 100 caractères');
      }
    }

    if (data.description !== undefined) {
      if (typeof data.description !== 'string') {
        errors.push('La description doit être une chaîne de caractères');
      } else if (data.description.trim().length < 10) {
        errors.push('La description doit contenir au moins 10 caractères');
      } else if (data.description.trim().length > 500) {
        errors.push('La description ne peut pas dépasser 500 caractères');
      }
    }

    if (data.price !== undefined) {
      if (typeof data.price !== 'number' || isNaN(data.price)) {
        errors.push('Le prix doit être un nombre');
      } else if (data.price <= 0) {
        errors.push('Le prix doit être supérieur à 0');
      } else if (data.price > 999999.99) {
        errors.push('Le prix ne peut pas dépasser 999999.99');
      }
    }

    if (data.qty !== undefined) {
      if (typeof data.qty !== 'number' || isNaN(data.qty)) {
        errors.push('La quantité doit être un nombre');
      } else if (!Number.isInteger(data.qty)) {
        errors.push('La quantité doit être un nombre entier');
      } else if (data.qty < 0) {
        errors.push('La quantité ne peut pas être négative');
      } else if (data.qty > 999999) {
        errors.push('La quantité ne peut pas dépasser 999999');
      }
    }

    return errors;
  }
}
