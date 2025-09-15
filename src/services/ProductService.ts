import { Redis } from 'ioredis';
import { redisClient, REDIS_KEYS } from '../config/redis';
import { Product, CreateProductRequest, UpdateProductRequest, PatchProductRequest, ProductFilters, PaginationParams, PaginatedResponse, ProductModel } from '../models/Product';
import { NotFoundError, ConflictError, RedisError, ValidationError } from '../models/Error';
import { logger } from '../utils/logger';

/**
 * Service pour la gestion des produits avec Redis
 */
export class ProductService {
  private redis: Redis;

  constructor() {
    this.redis = redisClient.getClient();
  }

  /**
   * Crée un nouveau produit
   */
  async createProduct(data: CreateProductRequest, correlationId?: string): Promise<Product> {
    try {
      const product = new ProductModel(data);
      
      // Vérifier si un produit avec le même nom existe déjà
      const existingProduct = await this.findProductByName(product.name);
      if (existingProduct) {
        throw new ConflictError(
          `Un produit avec le nom '${product.name}' existe déjà`,
          correlationId,
          { existingProductId: existingProduct.id }
        );
      }

      // Sauvegarder le produit
      const productKey = REDIS_KEYS.PRODUCT(product.id);
      await this.redis.hset(productKey, product.toJSON());
      
      // Ajouter l'ID à la liste des produits
      await this.redis.lpush(REDIS_KEYS.PRODUCT_IDS, product.id);
      
      // Ajouter le nom à l'index des noms
      await this.redis.sadd(REDIS_KEYS.PRODUCT_NAMES, product.name);
      
      // Incrémenter le compteur
      await this.redis.incr(REDIS_KEYS.PRODUCT_COUNTER);

      logger.info(`Produit créé avec succès`, {
        productId: product.id,
        productName: product.name,
        correlationId,
      });

      return product.toJSON();
    } catch (error) {
      if (error instanceof ConflictError) {
        throw error;
      }
      
      logger.logDatabaseError('createProduct', error, { correlationId });
      throw new RedisError(
        'Erreur lors de la création du produit',
        correlationId,
        { originalError: error instanceof Error ? error.message : String(error) }
      );
    }
  }

  /**
   * Récupère un produit par son ID
   */
  async getProductById(id: string, correlationId?: string): Promise<Product> {
    try {
      const productKey = REDIS_KEYS.PRODUCT(id);
      const productData = await this.redis.hgetall(productKey);
      
      if (!productData || Object.keys(productData).length === 0) {
        throw new NotFoundError('Produit', id, correlationId);
      }

      // Convertir les données Redis en objet Product
      const product: Product = {
        id: productData.id,
        name: productData.name,
        description: productData.description,
        price: parseFloat(productData.price),
        qty: parseInt(productData.qty, 10),
        createdAt: productData.createdAt,
        updatedAt: productData.updatedAt,
      };

      logger.debug(`Produit récupéré par ID`, {
        productId: id,
        correlationId,
      });

      return product;
    } catch (error) {
      if (error instanceof NotFoundError) {
        throw error;
      }
      
      logger.logDatabaseError('getProductById', error, { correlationId });
      throw new RedisError(
        'Erreur lors de la récupération du produit',
        correlationId,
        { productId: id, originalError: error instanceof Error ? error.message : String(error) }
      );
    }
  }

  /**
   * Met à jour un produit complètement
   */
  async updateProduct(id: string, data: UpdateProductRequest, correlationId?: string): Promise<Product> {
    try {
      // Vérifier que le produit existe
      const existingProduct = await this.getProductById(id, correlationId);
      
      // Vérifier si le nouveau nom n'est pas déjà utilisé par un autre produit
      if (data.name && data.name !== existingProduct.name) {
        const productWithSameName = await this.findProductByName(data.name);
        if (productWithSameName && productWithSameName.id !== id) {
          throw new ConflictError(
            `Un produit avec le nom '${data.name}' existe déjà`,
            correlationId,
            { existingProductId: productWithSameName.id }
          );
        }
      }

      // Créer un objet ProductModel pour la mise à jour
      const product = ProductModel.fromJSON(existingProduct);
      product.update(data);

      // Sauvegarder les modifications
      const productKey = REDIS_KEYS.PRODUCT(id);
      await this.redis.hset(productKey, product.toJSON());

      // Mettre à jour l'index des noms si le nom a changé
      if (data.name && data.name !== existingProduct.name) {
        await this.redis.srem(REDIS_KEYS.PRODUCT_NAMES, existingProduct.name);
        await this.redis.sadd(REDIS_KEYS.PRODUCT_NAMES, data.name);
      }

      logger.info(`Produit mis à jour avec succès`, {
        productId: id,
        productName: product.name,
        correlationId,
      });

      return product.toJSON();
    } catch (error) {
      if (error instanceof NotFoundError || error instanceof ConflictError) {
        throw error;
      }
      
      logger.logDatabaseError('updateProduct', error, { correlationId });
      throw new RedisError(
        'Erreur lors de la mise à jour du produit',
        correlationId,
        { productId: id, originalError: error instanceof Error ? error.message : String(error) }
      );
    }
  }

  /**
   * Met à jour un produit partiellement
   */
  async patchProduct(id: string, data: PatchProductRequest, correlationId?: string): Promise<Product> {
    try {
      // Vérifier que le produit existe
      const existingProduct = await this.getProductById(id, correlationId);
      
      // Vérifier si le nouveau nom n'est pas déjà utilisé par un autre produit
      if (data.name && data.name !== existingProduct.name) {
        const productWithSameName = await this.findProductByName(data.name);
        if (productWithSameName && productWithSameName.id !== id) {
          throw new ConflictError(
            `Un produit avec le nom '${data.name}' existe déjà`,
            correlationId,
            { existingProductId: productWithSameName.id }
          );
        }
      }

      // Créer un objet ProductModel pour la mise à jour
      const product = ProductModel.fromJSON(existingProduct);
      product.update(data);

      // Sauvegarder les modifications
      const productKey = REDIS_KEYS.PRODUCT(id);
      await this.redis.hset(productKey, product.toJSON());

      // Mettre à jour l'index des noms si le nom a changé
      if (data.name && data.name !== existingProduct.name) {
        await this.redis.srem(REDIS_KEYS.PRODUCT_NAMES, existingProduct.name);
        await this.redis.sadd(REDIS_KEYS.PRODUCT_NAMES, data.name);
      }

      logger.info(`Produit mis à jour partiellement avec succès`, {
        productId: id,
        productName: product.name,
        correlationId,
      });

      return product.toJSON();
    } catch (error) {
      if (error instanceof NotFoundError || error instanceof ConflictError) {
        throw error;
      }
      
      logger.logDatabaseError('patchProduct', error, { correlationId });
      throw new RedisError(
        'Erreur lors de la mise à jour partielle du produit',
        correlationId,
        { productId: id, originalError: error instanceof Error ? error.message : String(error) }
      );
    }
  }

  /**
   * Supprime un produit
   */
  async deleteProduct(id: string, correlationId?: string): Promise<void> {
    try {
      // Vérifier que le produit existe
      const existingProduct = await this.getProductById(id, correlationId);

      // Supprimer le produit
      const productKey = REDIS_KEYS.PRODUCT(id);
      await this.redis.del(productKey);
      
      // Retirer l'ID de la liste des produits
      await this.redis.lrem(REDIS_KEYS.PRODUCT_IDS, 0, id);
      
      // Retirer le nom de l'index des noms
      await this.redis.srem(REDIS_KEYS.PRODUCT_NAMES, existingProduct.name);
      
      // Décrémenter le compteur
      await this.redis.decr(REDIS_KEYS.PRODUCT_COUNTER);

      logger.info(`Produit supprimé avec succès`, {
        productId: id,
        productName: existingProduct.name,
        correlationId,
      });
    } catch (error) {
      if (error instanceof NotFoundError) {
        throw error;
      }
      
      logger.logDatabaseError('deleteProduct', error, { correlationId });
      throw new RedisError(
        'Erreur lors de la suppression du produit',
        correlationId,
        { productId: id, originalError: error instanceof Error ? error.message : String(error) }
      );
    }
  }

  /**
   * Liste les produits avec pagination et filtres
   */
  async getProducts(
    pagination: PaginationParams,
    filters?: ProductFilters,
    correlationId?: string
  ): Promise<PaginatedResponse<Product>> {
    try {
      // Récupérer tous les IDs de produits
      const allProductIds = await this.redis.lrange(REDIS_KEYS.PRODUCT_IDS, 0, -1);
      
      if (allProductIds.length === 0) {
        return {
          data: [],
          pagination: {
            page: pagination.page,
            limit: pagination.limit,
            total: 0,
            totalPages: 0,
          },
          filters,
        };
      }

      // Récupérer tous les produits
      const products: Product[] = [];
      for (const id of allProductIds) {
        try {
          const product = await this.getProductById(id, correlationId);
          products.push(product);
        } catch (error) {
          // Ignorer les produits qui n'existent plus (incohérence de données)
          logger.warn(`Produit incohérent trouvé dans l'index`, {
            productId: id,
            correlationId,
          });
        }
      }

      // Appliquer les filtres
      let filteredProducts = products;
      if (filters) {
        filteredProducts = this.applyFilters(products, filters);
      }

      // Appliquer la pagination
      const total = filteredProducts.length;
      const totalPages = Math.ceil(total / pagination.limit);
      const startIndex = (pagination.page - 1) * pagination.limit;
      const endIndex = startIndex + pagination.limit;
      const paginatedProducts = filteredProducts.slice(startIndex, endIndex);

      logger.debug(`Produits récupérés avec pagination`, {
        total,
        page: pagination.page,
        limit: pagination.limit,
        returned: paginatedProducts.length,
        correlationId,
      });

      return {
        data: paginatedProducts,
        pagination: {
          page: pagination.page,
          limit: pagination.limit,
          total,
          totalPages,
        },
        filters,
      };
    } catch (error) {
      logger.logDatabaseError('getProducts', error, { correlationId });
      throw new RedisError(
        'Erreur lors de la récupération des produits',
        correlationId,
        { originalError: error instanceof Error ? error.message : String(error) }
      );
    }
  }

  /**
   * Trouve un produit par son nom
   */
  private async findProductByName(name: string): Promise<Product | null> {
    try {
      // Vérifier si le nom existe dans l'index
      const exists = await this.redis.sismember(REDIS_KEYS.PRODUCT_NAMES, name);
      if (!exists) {
        return null;
      }

      // Chercher le produit avec ce nom
      const allProductIds = await this.redis.lrange(REDIS_KEYS.PRODUCT_IDS, 0, -1);
      
      for (const id of allProductIds) {
        try {
          const product = await this.getProductById(id);
          if (product.name === name) {
            return product;
          }
        } catch (error) {
          // Ignorer les erreurs et continuer
          continue;
        }
      }

      return null;
    } catch (error) {
      logger.error('Erreur lors de la recherche par nom', error);
      return null;
    }
  }

  /**
   * Applique les filtres aux produits
   */
  private applyFilters(products: Product[], filters: ProductFilters): Product[] {
    return products.filter(product => {
      // Filtre par nom
      if (filters.name && !product.name.toLowerCase().includes(filters.name.toLowerCase())) {
        return false;
      }

      // Filtre par prix minimum
      if (filters.minPrice !== undefined && product.price < filters.minPrice) {
        return false;
      }

      // Filtre par prix maximum
      if (filters.maxPrice !== undefined && product.price > filters.maxPrice) {
        return false;
      }

      return true;
    });
  }

  /**
   * Récupère le nombre total de produits
   */
  async getProductCount(correlationId?: string): Promise<number> {
    try {
      const count = await this.redis.get(REDIS_KEYS.PRODUCT_COUNTER);
      return parseInt(count || '0', 10);
    } catch (error) {
      logger.logDatabaseError('getProductCount', error, { correlationId });
      throw new RedisError(
        'Erreur lors de la récupération du nombre de produits',
        correlationId,
        { originalError: error instanceof Error ? error.message : String(error) }
      );
    }
  }

  /**
   * Vide tous les produits (pour les tests)
   */
  async clearAllProducts(correlationId?: string): Promise<void> {
    try {
      const keys = await this.redis.keys('product:*');
      if (keys.length > 0) {
        await this.redis.del(...keys);
      }
      
      logger.info(`Tous les produits ont été supprimés`, { correlationId });
    } catch (error) {
      logger.logDatabaseError('clearAllProducts', error, { correlationId });
      throw new RedisError(
        'Erreur lors de la suppression de tous les produits',
        correlationId,
        { originalError: error instanceof Error ? error.message : String(error) }
      );
    }
  }
}
