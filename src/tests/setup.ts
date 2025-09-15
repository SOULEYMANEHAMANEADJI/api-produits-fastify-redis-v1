import { config } from 'dotenv';

// Charger les variables d'environnement pour les tests
config();

// Configuration des variables d'environnement pour les tests
process.env.NODE_ENV = 'test';
process.env.PORT = '3001';
process.env.HOST = 'localhost';
process.env.REDIS_HOST = 'localhost';
process.env.REDIS_PORT = '6379';
process.env.REDIS_DB = '1'; // Base de données de test
process.env.LOG_LEVEL = 'error'; // Réduire les logs pendant les tests
process.env.API_PREFIX = '/api/v1';
process.env.CORS_ORIGIN = '*';
process.env.DEFAULT_PAGE_SIZE = '10';
process.env.MAX_PAGE_SIZE = '100';
process.env.ENABLE_SEEDER = 'false';
process.env.SEEDER_PRODUCT_COUNT = '10';

// Augmenter le timeout pour les tests
jest.setTimeout(30000);

// Mock des logs pour les tests
jest.mock('../utils/logger', () => ({
  logger: {
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
    debug: jest.fn(),
  },
  defaultLogger: {
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
    debug: jest.fn(),
  },
  Logger: jest.fn().mockImplementation(() => ({
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
    debug: jest.fn(),
    logRequest: jest.fn(),
    logResponse: jest.fn(),
    logValidationError: jest.fn(),
    logDatabaseError: jest.fn(),
    logPerformance: jest.fn(),
  })),
  loggingMiddleware: {
    request: jest.fn((request: any, reply: any, done: () => void) => {
      request.correlationId = 'test-correlation-id';
      request.logger = {
        info: jest.fn(),
        warn: jest.fn(),
        error: jest.fn(),
        debug: jest.fn(),
        logRequest: jest.fn(),
        logResponse: jest.fn(),
        logValidationError: jest.fn(),
        logDatabaseError: jest.fn(),
        logPerformance: jest.fn(),
      };
      done();
    }),
    response: jest.fn((request: any, reply: any, done: () => void) => {
      done();
    }),
  },
}));
