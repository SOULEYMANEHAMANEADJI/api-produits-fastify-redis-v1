import Redis, { RedisOptions } from 'ioredis';
import { env } from './environment';
import { logger } from '../utils/logger';

const redisOptions: RedisOptions = {
  host: env.REDIS_HOST,
  port: env.REDIS_PORT,
  ...(env.REDIS_PASSWORD && { password: env.REDIS_PASSWORD }),
  db: env.REDIS_DB,
  maxRetriesPerRequest: env.REDIS_MAX_RETRIES,
  lazyConnect: true,
  keepAlive: 30000,
  connectTimeout: 10000,
  commandTimeout: 5000,
  enableOfflineQueue: false,
};

class RedisClient {
  private client: Redis | null = null;
  private isConnected = false;

  async connect(): Promise<void> {
    try {
      this.client = new Redis(redisOptions);
      
      this.client.on('connect', () => {
        logger.info('Connexion Redis établie');
        this.isConnected = true;
      });

      this.client.on('error', (error) => {
        logger.error('Erreur Redis:', error);
        this.isConnected = false;
      });

      this.client.on('close', () => {
        logger.warn('Connexion Redis fermée');
        this.isConnected = false;
      });

      this.client.on('reconnecting', () => {
        logger.info('Reconnexion Redis en cours...');
      });

      await this.client.connect();
      
      // Test de connexion
      await this.client.ping();
      logger.info('Redis prêt');
    } catch (error) {
      logger.error('Impossible de se connecter à Redis:', error);
      throw error;
    }
  }

  async disconnect(): Promise<void> {
    if (this.client) {
      await this.client.quit();
      this.client = null;
      this.isConnected = false;
      logger.info('Déconnexion Redis');
    }
  }

  getClient(): Redis {
    if (!this.client || !this.isConnected) {
      throw new Error('Redis non connecté');
    }
    return this.client;
  }

  isReady(): boolean {
    return this.isConnected && this.client !== null;
  }

  async healthCheck(): Promise<boolean> {
    try {
      if (!this.client) return false;
      const result = await this.client.ping();
      return result === 'PONG';
    } catch {
      return false;
    }
  }
}

export const redisClient = new RedisClient();

// Clés Redis pour les produits
export const REDIS_KEYS = {
  PRODUCT: (id: string) => `product:${id}`,
  PRODUCT_NAMES: 'product:names',
  PRODUCT_IDS: 'product:ids',
  PRODUCT_COUNTER: 'product:counter',
} as const;
