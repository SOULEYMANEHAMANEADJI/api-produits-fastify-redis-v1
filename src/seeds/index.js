const dotenv = require('dotenv');
const { redisClient } = require('../config/redis');
const { ProductSeeder } = require('./productSeeder');
const { logger } = require('../utils/logger');
const { env } = require('../config/environment');

// Charger les variables d'environnement
dotenv.config();

/**
 * Script principal de seeding
 */
async function main() {
  try {
    logger.info('🌱 Démarrage du script de seeding...');
    
    // Vérifier si le seeding est activé
    if (!env.ENABLE_SEEDER) {
      logger.warn('Le seeding est désactivé (ENABLE_SEEDER=false)');
      process.exit(0);
    }

    // Se connecter à Redis
    logger.info('Connexion à Redis...');
    await redisClient.connect();
    logger.info('✅ Connecté à Redis');

    // Créer le seeder
    const seeder = new ProductSeeder();

    // Exécuter le seeding
    await seeder.run();

    logger.info('🎉 Seeding terminé avec succès!');
    
  } catch (error) {
    logger.error('❌ Erreur lors du seeding', error);
    process.exit(1);
  } finally {
    // Se déconnecter de Redis
    try {
      await redisClient.disconnect();
      logger.info('Déconnecté de Redis');
    } catch (error) {
      logger.error('Erreur lors de la déconnexion de Redis', error);
    }
    
    process.exit(0);
  }
}

// Exécuter le script si appelé directement
if (require.main === module) {
  main();
}

module.exports = { main: main };
