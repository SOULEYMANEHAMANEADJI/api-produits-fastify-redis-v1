const Redis = require('ioredis');
const { v4: uuidv4 } = require('uuid');

// Configuration Redis
const redis = new Redis({
  host: process.env.REDIS_HOST || 'localhost',
  port: process.env.REDIS_PORT || 6379,
  password: process.env.REDIS_PASSWORD || undefined,
  db: process.env.REDIS_DB || 0,
  lazyConnect: true,
});

// Données de produits réalistes
const PRODUCT_DATA = [
  {
    name: 'iPhone 15 Pro',
    description: 'Smartphone Apple avec écran Super Retina XDR de 6.1 pouces, puce A17 Pro, système de caméra Pro avec objectif principal 48MP',
    price: 1199.99,
    qty: 50,
  },
  {
    name: 'Samsung Galaxy S24 Ultra',
    description: 'Smartphone Android premium avec écran Dynamic AMOLED 2X de 6.8 pouces, processeur Snapdragon 8 Gen 3, caméra 200MP',
    price: 1299.99,
    qty: 30,
  },
  {
    name: 'MacBook Pro 16" M3 Max',
    description: 'Ordinateur portable Apple avec puce M3 Max, écran Liquid Retina XDR de 16.2 pouces, 32GB RAM, 1TB SSD',
    price: 3499.99,
    qty: 15,
  },
  {
    name: 'iPad Air 5ème génération',
    description: 'Tablette Apple avec puce M1, écran Liquid Retina de 10.9 pouces, Wi-Fi, 256GB',
    price: 749.99,
    qty: 40,
  },
  {
    name: 'Sony WH-1000XM5',
    description: 'Casque audio sans fil avec réduction de bruit active, autonomie 30h, charge rapide',
    price: 399.99,
    qty: 60,
  },
  {
    name: 'Apple Watch Series 9',
    description: 'Montre connectée Apple avec écran Always-On Retina, GPS, résistance à l\'eau, autonomie 18h',
    price: 429.99,
    qty: 35,
  },
  {
    name: 'Nintendo Switch OLED',
    description: 'Console de jeu portable avec écran OLED de 7 pouces, 64GB de stockage, manettes Joy-Con',
    price: 349.99,
    qty: 20,
  },
  {
    name: 'T-shirt Nike Dri-FIT',
    description: 'T-shirt de sport en polyester recyclé avec technologie Dri-FIT pour évacuer la transpiration',
    price: 29.99,
    qty: 100,
  },
  {
    name: 'Jean Levis 501 Original',
    description: 'Jean coupe droite en denim 100% coton, coupe classique intemporelle',
    price: 89.99,
    qty: 75,
  },
  {
    name: 'Veste The North Face',
    description: 'Veste imperméable et respirante avec membrane Gore-Tex, idéale pour les activités outdoor',
    price: 199.99,
    qty: 45,
  },
  {
    name: 'Chaussures Adidas Ultraboost 22',
    description: 'Chaussures de running avec technologie Boost pour un retour d\'énergie optimal',
    price: 189.99,
    qty: 80,
  },
  {
    name: 'Sac à dos Fjällräven Kånken',
    description: 'Sac à dos en toile G-1000, compartiment principal spacieux, bretelles réglables',
    price: 79.99,
    qty: 55,
  },
  {
    name: 'Aspirateur Dyson V15 Detect',
    description: 'Aspirateur sans fil avec laser de détection de la poussière, autonomie 60 minutes',
    price: 699.99,
    qty: 25,
  },
  {
    name: 'Machine à café Nespresso Vertuo',
    description: 'Machine à café automatique avec technologie Centrifusion, 4 tailles de boissons',
    price: 199.99,
    qty: 30,
  },
  {
    name: 'Robot tondeuse Husqvarna Automower',
    description: 'Robot tondeuse automatique avec navigation GPS, programmation via smartphone',
    price: 1299.99,
    qty: 10,
  },
  {
    name: 'Matelas Tempur Original',
    description: 'Matelas en mousse à mémoire de forme, fermeté moyenne, dimensions 160x200cm',
    price: 899.99,
    qty: 15,
  },
  {
    name: 'Table de salle à manger en chêne',
    description: 'Table rectangulaire en chêne massif, 6 places, finition naturelle',
    price: 599.99,
    qty: 8,
  },
  {
    name: 'Kindle Paperwhite',
    description: 'Liseuse électronique avec écran 6.8 pouces, éclairage intégré, 8GB de stockage',
    price: 139.99,
    qty: 40,
  },
  {
    name: 'Livre "Le Petit Prince"',
    description: 'Édition illustrée du classique d\'Antoine de Saint-Exupéry, reliure cartonnée',
    price: 12.99,
    qty: 200,
  },
  {
    name: 'Carte SD SanDisk Ultra 128GB',
    description: 'Carte mémoire microSDXC Classe 10, vitesse de lecture jusqu\'à 120MB/s',
    price: 24.99,
    qty: 150,
  },
  {
    name: 'Vélo électrique Trek Powerfly',
    description: 'VTT électrique avec moteur Bosch, batterie 500Wh, autonomie 80km',
    price: 2999.99,
    qty: 5,
  },
  {
    name: 'Raquette de tennis Wilson Pro Staff',
    description: 'Raquette de tennis professionnelle, poids 315g, équilibre tête légère',
    price: 249.99,
    qty: 20,
  },
  {
    name: 'Tapis de yoga Lululemon',
    description: 'Tapis de yoga antidérapant, dimensions 68x188cm, épaisseur 5mm',
    price: 78.99,
    qty: 50,
  },
  {
    name: 'Tente Quechua 2 secondes',
    description: 'Tente 2 places, montage en 2 secondes, imperméable 2000mm',
    price: 89.99,
    qty: 30,
  },
  {
    name: 'Crème hydratante La Mer',
    description: 'Crème hydratante anti-âge, 30ml, formule exclusive Miracle Broth',
    price: 199.99,
    qty: 25,
  },
  {
    name: 'Brosse à dents électrique Oral-B',
    description: 'Brosse à dents électrique avec 3 modes de brossage, autonomie 2 semaines',
    price: 79.99,
    qty: 60,
  },
  {
    name: 'Parfum Chanel N°5',
    description: 'Eau de parfum féminin, flacon 50ml, fragrance florale intemporelle',
    price: 129.99,
    qty: 35,
  },
  {
    name: 'Pneus Michelin Pilot Sport 4',
    description: 'Pneus été haute performance, dimensions 225/45R17, indice de vitesse Y',
    price: 149.99,
    qty: 40,
  },
  {
    name: 'Autoradio Pioneer DMH-WT8600NEX',
    description: 'Autoradio 2DIN avec écran 7 pouces, Apple CarPlay, Android Auto, Bluetooth',
    price: 399.99,
    qty: 15,
  },
  {
    name: 'Batterie de voiture Varta Blue Dynamic',
    description: 'Batterie 12V 74Ah, technologie AGM, garantie 4 ans',
    price: 189.99,
    qty: 20,
  },
  {
    name: 'Perceuse visseuse Bosch GSR 18V-21',
    description: 'Perceuse visseuse sans fil 18V, couple de serrage 65 Nm, batterie 2.0Ah incluse',
    price: 129.99,
    qty: 30,
  },
  {
    name: 'Scie circulaire Makita HS7601',
    description: 'Scie circulaire 1900W, lame 190mm, profondeur de coupe 66mm',
    price: 89.99,
    qty: 25,
  },
  {
    name: 'Échelle télescopique Werner 3.20m',
    description: 'Échelle télescopique aluminium, hauteur maximale 3.20m, charge max 150kg',
    price: 79.99,
    qty: 15,
  },
  {
    name: 'Café en grains Lavazza Qualità Rossa',
    description: 'Café en grains 100% arabica, torréfaction italienne, paquet 1kg',
    price: 12.99,
    qty: 100,
  },
  {
    name: 'Huile d\'olive extra vierge',
    description: 'Huile d\'olive de première pression à froid, bouteille 500ml, origine Grèce',
    price: 8.99,
    qty: 80,
  },
  {
    name: 'Chocolat Lindt Excellence 70%',
    description: 'Tablette de chocolat noir 70% cacao, 100g, origine équitable',
    price: 3.99,
    qty: 200,
  },
];

/**
 * Script principal de seeding
 */
async function main() {
  try {
    console.log('🌱 Démarrage du script de seeding...');
    
    // Se connecter à Redis
    console.log('Connexion à Redis...');
    await redis.connect();
    console.log('✅ Connecté à Redis');

    // Vider les produits existants
    console.log('Suppression de tous les produits existants...');
    const keys = await redis.keys('product:*');
    if (keys.length > 0) {
      await redis.del(...keys);
    }
    console.log('Tous les produits ont été supprimés');

    // Créer les produits
    const count = parseInt(process.env.SEEDER_PRODUCT_COUNT) || 50;
    const actualCount = Math.min(count, PRODUCT_DATA.length);
    
    console.log(`Création de ${actualCount} produits...`);

    const createdProducts = [];
    const errors = [];

    for (let i = 0; i < actualCount; i++) {
      try {
        const productData = PRODUCT_DATA[i];
        const product = {
          id: uuidv4(),
          ...productData,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };

        // Sauvegarder dans Redis
        await redis.hset(`product:${product.id}`, product);
        await redis.sadd('product:ids', product.id);
        await redis.hset('product:names', product.name, product.id);

        createdProducts.push(product);
        
        if ((i + 1) % 10 === 0) {
          console.log(`${i + 1}/${actualCount} produits créés`);
        }
      } catch (error) {
        errors.push({ index: i, error: error.message });
        console.warn(`Erreur lors de la création du produit ${i + 1}:`, error.message);
      }
    }

    console.log(`Seeding terminé: ${createdProducts.length} produits créés`);
    
    if (errors.length > 0) {
      console.warn(`${errors.length} erreurs lors du seeding`);
    }

    // Afficher quelques statistiques
    const totalValue = createdProducts.reduce((sum, product) => sum + (product.price * product.qty), 0);
    const totalQuantity = createdProducts.reduce((sum, product) => sum + product.qty, 0);
    
    console.log('Statistiques du seeding:');
    console.log(`- totalProducts: ${createdProducts.length}`);
    console.log(`- totalValue: €${totalValue.toFixed(2)}`);
    console.log(`- totalQuantity: ${totalQuantity}`);
    console.log(`- averagePrice: €${(totalValue / totalQuantity).toFixed(2)}`);

    console.log('🎉 Seeding terminé avec succès!');
    
  } catch (error) {
    console.error('❌ Erreur lors du seeding', error);
    process.exit(1);
  } finally {
    // Se déconnecter de Redis
    try {
      await redis.disconnect();
      console.log('Déconnecté de Redis');
    } catch (error) {
      console.error('Erreur lors de la déconnexion de Redis', error);
    }
    
    process.exit(0);
  }
}

// Exécuter le script si appelé directement
if (require.main === module) {
  main();
}

module.exports = { main };
