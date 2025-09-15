import * as dotenv from 'dotenv';

// Charger les variables d'environnement
dotenv.config();

export interface EnvironmentConfig {
  // Configuration serveur
  NODE_ENV: string;
  PORT: number;
  HOST: string;

  // Configuration Redis
  REDIS_HOST: string;
  REDIS_PORT: number;
  REDIS_PASSWORD?: string;
  REDIS_DB: number;
  REDIS_MAX_RETRIES: number;
  REDIS_RETRY_DELAY: number;

  // Configuration logging
  LOG_LEVEL: string;
  LOG_FILE: string;

  // Configuration API
  API_PREFIX: string;
  CORS_ORIGIN: string;

  // Configuration pagination
  DEFAULT_PAGE_SIZE: number;
  MAX_PAGE_SIZE: number;

  // Configuration seeder
  ENABLE_SEEDER: boolean;
  SEEDER_PRODUCT_COUNT: number;
}

const requiredEnvVars = [
  'NODE_ENV',
  'PORT',
  'HOST',
  'REDIS_HOST',
  'REDIS_PORT',
  'REDIS_DB',
  'LOG_LEVEL',
  'API_PREFIX',
  'CORS_ORIGIN',
  'DEFAULT_PAGE_SIZE',
  'MAX_PAGE_SIZE',
  'ENABLE_SEEDER',
  'SEEDER_PRODUCT_COUNT',
] as const;

function validateEnvironment(): void {
  const missing = requiredEnvVars.filter(envVar => !process.env[envVar]);
  
  if (missing.length > 0) {
    throw new Error(`Variables d'environnement manquantes: ${missing.join(', ')}`);
  }
}

function parseEnvConfig(): EnvironmentConfig {
  validateEnvironment();

  return {
    // Configuration serveur
    NODE_ENV: process.env.NODE_ENV!,
    PORT: parseInt(process.env.PORT!, 10),
    HOST: process.env.HOST!,

    // Configuration Redis
    REDIS_HOST: process.env.REDIS_HOST!,
    REDIS_PORT: parseInt(process.env.REDIS_PORT!, 10),
    REDIS_PASSWORD: process.env.REDIS_PASSWORD,
    REDIS_DB: parseInt(process.env.REDIS_DB!, 10),
    REDIS_MAX_RETRIES: parseInt(process.env.REDIS_MAX_RETRIES || '3', 10),
    REDIS_RETRY_DELAY: parseInt(process.env.REDIS_RETRY_DELAY || '1000', 10),

    // Configuration logging
    LOG_LEVEL: process.env.LOG_LEVEL!,
    LOG_FILE: process.env.LOG_FILE || 'logs/app.log',

    // Configuration API
    API_PREFIX: process.env.API_PREFIX!,
    CORS_ORIGIN: process.env.CORS_ORIGIN!,

    // Configuration pagination
    DEFAULT_PAGE_SIZE: parseInt(process.env.DEFAULT_PAGE_SIZE!, 10),
    MAX_PAGE_SIZE: parseInt(process.env.MAX_PAGE_SIZE!, 10),

    // Configuration seeder
    ENABLE_SEEDER: process.env.ENABLE_SEEDER === 'true',
    SEEDER_PRODUCT_COUNT: parseInt(process.env.SEEDER_PRODUCT_COUNT!, 10),
  };
}

export const env = parseEnvConfig();

export const isDevelopment = env.NODE_ENV === 'development';
export const isProduction = env.NODE_ENV === 'production';
export const isTest = env.NODE_ENV === 'test';
