import { ProductService } from '../services/ProductService';
import { CreateProductRequest } from '../models/Product';
import { logger } from '../utils/logger';
import { env } from '../config/environment';

/**
 * Données de produits réalistes pour le seeder
 */
const PRODUCT_DATA: CreateProductRequest[] = [
  // Électronique
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
    name: 'Dell XPS 15',
    description: 'Ordinateur portable Dell avec processeur Intel Core i7, écran 15.6 pouces 4K, 16GB RAM, 512GB SSD',
    price: 1899.99,
    qty: 25,
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

  // Vêtements
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

  // Maison et Jardin
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

  // Livres et Médias
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

  // Sports et Loisirs
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

  // Beauté et Santé
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

  // Automobile
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

  // Outils et Bricolage
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

  // Alimentation
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
 * Classe pour le seeding des produits
 */
export class ProductSeeder {
  private productService: ProductService;

  constructor() {
    this.productService = new ProductService();
  }

  /**
   * Vide tous les produits existants
   */
  async clearProducts(): Promise<void> {
    try {
      logger.info('Suppression de tous les produits existants...');
      await this.productService.clearAllProducts();
      logger.info('Tous les produits ont été supprimés');
    } catch (error) {
      logger.error('Erreur lors de la suppression des produits', error);
      throw error;
    }
  }

  /**
   * Crée des produits à partir des données prédéfinies
   */
  async seedProducts(count?: number): Promise<void> {
    try {
      const productsToCreate = count || env.SEEDER_PRODUCT_COUNT;
      const actualCount = Math.min(productsToCreate, PRODUCT_DATA.length);
      
      logger.info(`Création de ${actualCount} produits...`);

      const createdProducts = [];
      const errors = [];

      for (let i = 0; i < actualCount; i++) {
        try {
          const productData = PRODUCT_DATA[i];
          const product = await this.productService.createProduct(productData);
          createdProducts.push(product);
          
          if ((i + 1) % 10 === 0) {
            logger.info(`${i + 1}/${actualCount} produits créés`);
          }
        } catch (error) {
          errors.push({ index: i, error: error instanceof Error ? error.message : String(error) });
          logger.warn(`Erreur lors de la création du produit ${i + 1}`, { error });
        }
      }

      logger.info(`Seeding terminé: ${createdProducts.length} produits créés`);
      
      if (errors.length > 0) {
        logger.warn(`${errors.length} erreurs lors du seeding`, { errors });
      }

      // Afficher quelques statistiques
      const totalValue = createdProducts.reduce((sum, product) => sum + (product.price * product.qty), 0);
      const totalQuantity = createdProducts.reduce((sum, product) => sum + product.qty, 0);
      
      logger.info('Statistiques du seeding:', {
        totalProducts: createdProducts.length,
        totalValue: `€${totalValue.toFixed(2)}`,
        totalQuantity,
        averagePrice: `€${(totalValue / totalQuantity).toFixed(2)}`,
      });

    } catch (error) {
      logger.error('Erreur lors du seeding des produits', error);
      throw error;
    }
  }

  /**
   * Génère des produits aléatoires
   */
  async seedRandomProducts(count: number): Promise<void> {
    try {
      logger.info(`Création de ${count} produits aléatoires...`);

      const categories = [
        'Électronique', 'Vêtements', 'Maison', 'Livre', 'Sport', 'Beauté', 'Auto', 'Outil', 'Alimentation'
      ];
      
      const brands = [
        'Apple', 'Samsung', 'Nike', 'Adidas', 'Sony', 'Bose', 'Dyson', 'Nespresso', 'IKEA', 'Zara'
      ];

      const createdProducts = [];

      for (let i = 0; i < count; i++) {
        try {
          const category = categories[Math.floor(Math.random() * categories.length)];
          const brand = brands[Math.floor(Math.random() * brands.length)];
          const productNumber = Math.floor(Math.random() * 9999) + 1;
          
          const productData: CreateProductRequest = {
            name: `${brand} ${category} ${productNumber}`,
            description: `Produit ${category.toLowerCase()} de marque ${brand}, modèle ${productNumber}. Description détaillée du produit avec ses caractéristiques principales et ses avantages.`,
            price: Math.round((Math.random() * 1000 + 10) * 100) / 100, // Prix entre 10€ et 1010€
            qty: Math.floor(Math.random() * 100) + 1, // Quantité entre 1 et 100
          };

          const product = await this.productService.createProduct(productData);
          createdProducts.push(product);
          
          if ((i + 1) % 50 === 0) {
            logger.info(`${i + 1}/${count} produits aléatoires créés`);
          }
        } catch (error) {
          logger.warn(`Erreur lors de la création du produit aléatoire ${i + 1}`, { error });
        }
      }

      logger.info(`Seeding aléatoire terminé: ${createdProducts.length} produits créés`);

    } catch (error) {
      logger.error('Erreur lors du seeding aléatoire des produits', error);
      throw error;
    }
  }

  /**
   * Exécute le seeding complet
   */
  async run(): Promise<void> {
    try {
      logger.info('Démarrage du seeding des produits...');
      
      // Vider les produits existants
      await this.clearProducts();
      
      // Créer les produits prédéfinis
      await this.seedProducts();
      
      // Optionnel: ajouter des produits aléatoires si demandé
      const additionalRandom = env.SEEDER_PRODUCT_COUNT - PRODUCT_DATA.length;
      if (additionalRandom > 0) {
        await this.seedRandomProducts(additionalRandom);
      }
      
      logger.info('Seeding terminé avec succès');
    } catch (error) {
      logger.error('Erreur lors du seeding', error);
      throw error;
    }
  }
}
