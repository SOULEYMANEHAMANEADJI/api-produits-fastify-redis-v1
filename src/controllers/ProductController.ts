import { FastifyRequest, FastifyReply } from 'fastify';
import { ProductService } from '../services/ProductService';
import { CreateProductRequest, UpdateProductRequest, PatchProductRequest, ProductFilters, PaginationParams } from '../models/Product';
import { NotFoundError, ConflictError, ValidationError, InternalError } from '../models/Error';
import { logger } from '../utils/logger';
import { env } from '../config/environment';

/**
 * Controller pour la gestion des produits
 */
export class ProductController {
  private productService: ProductService;

  constructor() {
    this.productService = new ProductService();
  }

  /**
   * Crée un nouveau produit
   * POST /products
   */
  async createProduct(request: FastifyRequest, reply: FastifyReply): Promise<void> {
    const startTime = Date.now();
    const correlationId = (request as any).correlationId;
    const data = request.body as CreateProductRequest;

    try {
      logger.info('Création d\'un nouveau produit', {
        productName: data.name,
        correlationId,
      });

      const product = await this.productService.createProduct(data, correlationId);
      const responseTime = Date.now() - startTime;

      logger.logPerformance('createProduct', responseTime, {
        productId: product.id,
        correlationId,
      });

      reply.status(201).send({
        success: true,
        data: product,
        message: 'Produit créé avec succès',
      });
    } catch (error) {
      const responseTime = Date.now() - startTime;
      
      if (error instanceof ConflictError) {
        logger.warn('Conflit lors de la création du produit', {
          productName: data.name,
          correlationId,
          responseTime,
        });
        
        reply.status(409).send({
          success: false,
          error: error.type,
          message: error.message,
          correlationId,
        });
        return;
      }

      if (error instanceof ValidationError) {
        logger.logValidationError('Erreur de validation lors de la création', error.message.split(', '), {
          productName: data.name,
          correlationId,
          responseTime,
        });
        
        reply.status(400).send({
          success: false,
          error: error.type,
          message: error.message,
          correlationId,
          details: error.details,
        });
        return;
      }

      logger.error('Erreur lors de la création du produit', error, {
        productName: data.name,
        correlationId,
        responseTime,
      });

      reply.status(500).send({
        success: false,
        error: 'InternalServerError',
        message: 'Erreur interne lors de la création du produit',
        correlationId,
      });
    }
  }

  /**
   * Récupère un produit par son ID
   * GET /products/:id
   */
  async getProductById(request: FastifyRequest, reply: FastifyReply): Promise<void> {
    const startTime = Date.now();
    const correlationId = (request as any).correlationId;
    const { id } = request.params as { id: string };

    try {
      logger.debug('Récupération du produit par ID', {
        productId: id,
        correlationId,
      });

      const product = await this.productService.getProductById(id, correlationId);
      const responseTime = Date.now() - startTime;

      logger.logPerformance('getProductById', responseTime, {
        productId: id,
        correlationId,
      });

      reply.status(200).send({
        success: true,
        data: product,
      });
    } catch (error) {
      const responseTime = Date.now() - startTime;
      
      if (error instanceof NotFoundError) {
        logger.warn('Produit non trouvé', {
          productId: id,
          correlationId,
          responseTime,
        });
        
        reply.status(404).send({
          success: false,
          error: error.type,
          message: error.message,
          correlationId,
        });
        return;
      }

      logger.error('Erreur lors de la récupération du produit', error, {
        productId: id,
        correlationId,
        responseTime,
      });

      reply.status(500).send({
        success: false,
        error: 'InternalServerError',
        message: 'Erreur interne lors de la récupération du produit',
        correlationId,
      });
    }
  }

  /**
   * Liste les produits avec pagination et filtres
   * GET /products
   */
  async getProducts(request: FastifyRequest, reply: FastifyReply): Promise<void> {
    const startTime = Date.now();
    const correlationId = (request as any).correlationId;
    const query = request.query as any;

    try {
      const pagination: PaginationParams = {
        page: query.page || 1,
        limit: query.limit || env.DEFAULT_PAGE_SIZE,
      };

      const filters: ProductFilters = {};
      if (query.name) filters.name = query.name;
      if (query.minPrice !== undefined) filters.minPrice = parseFloat(query.minPrice);
      if (query.maxPrice !== undefined) filters.maxPrice = parseFloat(query.maxPrice);

      logger.debug('Récupération des produits avec pagination', {
        pagination,
        filters,
        correlationId,
      });

      const result = await this.productService.getProducts(pagination, filters, correlationId);
      const responseTime = Date.now() - startTime;

      logger.logPerformance('getProducts', responseTime, {
        total: result.pagination.total,
        page: pagination.page,
        limit: pagination.limit,
        correlationId,
      });

      // Ajouter les headers de pagination
      reply.header('X-Total-Count', result.pagination.total.toString());
      reply.header('X-Page', result.pagination.page.toString());
      reply.header('X-Total-Pages', result.pagination.totalPages.toString());

      reply.status(200).send({
        success: true,
        data: result.data,
        pagination: result.pagination,
        filters: result.filters,
      });
    } catch (error) {
      const responseTime = Date.now() - startTime;
      
      logger.error('Erreur lors de la récupération des produits', error, {
        pagination: query,
        correlationId,
        responseTime,
      });

      reply.status(500).send({
        success: false,
        error: 'InternalServerError',
        message: 'Erreur interne lors de la récupération des produits',
        correlationId,
      });
    }
  }

  /**
   * Met à jour un produit complètement
   * PUT /products/:id
   */
  async updateProduct(request: FastifyRequest, reply: FastifyReply): Promise<void> {
    const startTime = Date.now();
    const correlationId = (request as any).correlationId;
    const { id } = request.params as { id: string };
    const data = request.body as UpdateProductRequest;

    try {
      logger.info('Mise à jour complète du produit', {
        productId: id,
        productName: data.name,
        correlationId,
      });

      const product = await this.productService.updateProduct(id, data, correlationId);
      const responseTime = Date.now() - startTime;

      logger.logPerformance('updateProduct', responseTime, {
        productId: id,
        correlationId,
      });

      reply.status(200).send({
        success: true,
        data: product,
        message: 'Produit mis à jour avec succès',
      });
    } catch (error) {
      const responseTime = Date.now() - startTime;
      
      if (error instanceof NotFoundError) {
        logger.warn('Produit non trouvé pour mise à jour', {
          productId: id,
          correlationId,
          responseTime,
        });
        
        reply.status(404).send({
          success: false,
          error: error.type,
          message: error.message,
          correlationId,
        });
        return;
      }

      if (error instanceof ConflictError) {
        logger.warn('Conflit lors de la mise à jour du produit', {
          productId: id,
          productName: data.name,
          correlationId,
          responseTime,
        });
        
        reply.status(409).send({
          success: false,
          error: error.type,
          message: error.message,
          correlationId,
        });
        return;
      }

      if (error instanceof ValidationError) {
        logger.logValidationError('Erreur de validation lors de la mise à jour', error.message.split(', '), {
          productId: id,
          correlationId,
          responseTime,
        });
        
        reply.status(400).send({
          success: false,
          error: error.type,
          message: error.message,
          correlationId,
          details: error.details,
        });
        return;
      }

      logger.error('Erreur lors de la mise à jour du produit', error, {
        productId: id,
        correlationId,
        responseTime,
      });

      reply.status(500).send({
        success: false,
        error: 'InternalServerError',
        message: 'Erreur interne lors de la mise à jour du produit',
        correlationId,
      });
    }
  }

  /**
   * Met à jour un produit partiellement
   * PATCH /products/:id
   */
  async patchProduct(request: FastifyRequest, reply: FastifyReply): Promise<void> {
    const startTime = Date.now();
    const correlationId = (request as any).correlationId;
    const { id } = request.params as { id: string };
    const data = request.body as PatchProductRequest;

    try {
      logger.info('Mise à jour partielle du produit', {
        productId: id,
        updatedFields: Object.keys(data),
        correlationId,
      });

      const product = await this.productService.patchProduct(id, data, correlationId);
      const responseTime = Date.now() - startTime;

      logger.logPerformance('patchProduct', responseTime, {
        productId: id,
        correlationId,
      });

      reply.status(200).send({
        success: true,
        data: product,
        message: 'Produit mis à jour avec succès',
      });
    } catch (error) {
      const responseTime = Date.now() - startTime;
      
      if (error instanceof NotFoundError) {
        logger.warn('Produit non trouvé pour mise à jour partielle', {
          productId: id,
          correlationId,
          responseTime,
        });
        
        reply.status(404).send({
          success: false,
          error: error.type,
          message: error.message,
          correlationId,
        });
        return;
      }

      if (error instanceof ConflictError) {
        logger.warn('Conflit lors de la mise à jour partielle du produit', {
          productId: id,
          productName: data.name,
          correlationId,
          responseTime,
        });
        
        reply.status(409).send({
          success: false,
          error: error.type,
          message: error.message,
          correlationId,
        });
        return;
      }

      if (error instanceof ValidationError) {
        logger.logValidationError('Erreur de validation lors de la mise à jour partielle', error.message.split(', '), {
          productId: id,
          correlationId,
          responseTime,
        });
        
        reply.status(400).send({
          success: false,
          error: error.type,
          message: error.message,
          correlationId,
          details: error.details,
        });
        return;
      }

      logger.error('Erreur lors de la mise à jour partielle du produit', error, {
        productId: id,
        correlationId,
        responseTime,
      });

      reply.status(500).send({
        success: false,
        error: 'InternalServerError',
        message: 'Erreur interne lors de la mise à jour du produit',
        correlationId,
      });
    }
  }

  /**
   * Supprime un produit
   * DELETE /products/:id
   */
  async deleteProduct(request: FastifyRequest, reply: FastifyReply): Promise<void> {
    const startTime = Date.now();
    const correlationId = (request as any).correlationId;
    const { id } = request.params as { id: string };

    try {
      logger.info('Suppression du produit', {
        productId: id,
        correlationId,
      });

      await this.productService.deleteProduct(id, correlationId);
      const responseTime = Date.now() - startTime;

      logger.logPerformance('deleteProduct', responseTime, {
        productId: id,
        correlationId,
      });

      reply.status(204).send();
    } catch (error) {
      const responseTime = Date.now() - startTime;
      
      if (error instanceof NotFoundError) {
        logger.warn('Produit non trouvé pour suppression', {
          productId: id,
          correlationId,
          responseTime,
        });
        
        reply.status(404).send({
          success: false,
          error: error.type,
          message: error.message,
          correlationId,
        });
        return;
      }

      logger.error('Erreur lors de la suppression du produit', error, {
        productId: id,
        correlationId,
        responseTime,
      });

      reply.status(500).send({
        success: false,
        error: 'InternalServerError',
        message: 'Erreur interne lors de la suppression du produit',
        correlationId,
      });
    }
  }

  /**
   * Récupère les statistiques des produits
   * GET /products/stats
   */
  async getProductStats(request: FastifyRequest, reply: FastifyReply): Promise<void> {
    const startTime = Date.now();
    const correlationId = (request as any).correlationId;

    try {
      logger.debug('Récupération des statistiques des produits', {
        correlationId,
      });

      const totalCount = await this.productService.getProductCount(correlationId);
      const responseTime = Date.now() - startTime;

      logger.logPerformance('getProductStats', responseTime, {
        totalCount,
        correlationId,
      });

      reply.status(200).send({
        success: true,
        data: {
          totalProducts: totalCount,
          timestamp: new Date().toISOString(),
        },
      });
    } catch (error) {
      const responseTime = Date.now() - startTime;
      
      logger.error('Erreur lors de la récupération des statistiques', error, {
        correlationId,
        responseTime,
      });

      reply.status(500).send({
        success: false,
        error: 'InternalServerError',
        message: 'Erreur interne lors de la récupération des statistiques',
        correlationId,
      });
    }
  }
}
