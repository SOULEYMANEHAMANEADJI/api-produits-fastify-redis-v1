import { ProductModel, CreateProductRequest, UpdateProductRequest, PatchProductRequest } from '../../models/Product.js';

describe('ProductModel', () => {
  describe('Constructor', () => {
    it('should create a product with valid data', () => {
      const data: CreateProductRequest = {
        name: 'Test Product',
        description: 'This is a test product description',
        price: 99.99,
        qty: 10,
      };

      const product = new ProductModel(data);

      expect(product.id).toBeDefined();
      expect(product.name).toBe('Test Product');
      expect(product.description).toBe('This is a test product description');
      expect(product.price).toBe(99.99);
      expect(product.qty).toBe(10);
      expect(product.createdAt).toBeDefined();
      expect(product.updatedAt).toBeDefined();
      expect(product.createdAt).toBe(product.updatedAt);
    });

    it('should trim whitespace from name and description', () => {
      const data: CreateProductRequest = {
        name: '  Test Product  ',
        description: '  This is a test product description  ',
        price: 99.99,
        qty: 10,
      };

      const product = new ProductModel(data);

      expect(product.name).toBe('Test Product');
      expect(product.description).toBe('This is a test product description');
    });

    it('should round price to 2 decimal places', () => {
      const data: CreateProductRequest = {
        name: 'Test Product',
        description: 'This is a test product description',
        price: 99.999,
        qty: 10,
      };

      const product = new ProductModel(data);

      expect(product.price).toBe(100.00);
    });

    it('should ensure qty is an integer', () => {
      const data: CreateProductRequest = {
        name: 'Test Product',
        description: 'This is a test product description',
        price: 99.99,
        qty: 10.7,
      };

      const product = new ProductModel(data);

      expect(product.qty).toBe(10);
    });
  });

  describe('update', () => {
    let product: ProductModel;

    beforeEach(() => {
      const data: CreateProductRequest = {
        name: 'Original Product',
        description: 'Original description',
        price: 50.00,
        qty: 5,
      };
      product = new ProductModel(data);
    });

    it('should update all fields', () => {
      const updateData: UpdateProductRequest = {
        name: 'Updated Product',
        description: 'Updated description',
        price: 75.50,
        qty: 15,
      };

      const originalUpdatedAt = product.updatedAt;
      
      // Attendre un peu pour s'assurer que updatedAt change
      setTimeout(() => {
        product.update(updateData);

        expect(product.name).toBe('Updated Product');
        expect(product.description).toBe('Updated description');
        expect(product.price).toBe(75.50);
        expect(product.qty).toBe(15);
        expect(product.updatedAt).not.toBe(originalUpdatedAt);
      }, 10);
    });

    it('should update only provided fields in patch', () => {
      const patchData: PatchProductRequest = {
        name: 'Patched Product',
        price: 60.00,
      };

      const originalDescription = product.description;
      const originalQty = product.qty;

      product.update(patchData);

      expect(product.name).toBe('Patched Product');
      expect(product.description).toBe(originalDescription);
      expect(product.price).toBe(60.00);
      expect(product.qty).toBe(originalQty);
    });

    it('should trim whitespace in updates', () => {
      const updateData: UpdateProductRequest = {
        name: '  Updated Product  ',
        description: '  Updated description  ',
        price: 75.50,
        qty: 15,
      };

      product.update(updateData);

      expect(product.name).toBe('Updated Product');
      expect(product.description).toBe('Updated description');
    });
  });

  describe('toJSON', () => {
    it('should return a plain object', () => {
      const data: CreateProductRequest = {
        name: 'Test Product',
        description: 'This is a test product description',
        price: 99.99,
        qty: 10,
      };

      const product = new ProductModel(data);
      const json = product.toJSON();

      expect(json).toEqual({
        id: product.id,
        name: product.name,
        description: product.description,
        price: product.price,
        qty: product.qty,
        createdAt: product.createdAt,
        updatedAt: product.updatedAt,
      });
    });
  });

  describe('fromJSON', () => {
    it('should create a product from JSON data', () => {
      const jsonData = {
        id: '123e4567-e89b-12d3-a456-426614174000',
        name: 'Test Product',
        description: 'This is a test product description',
        price: 99.99,
        qty: 10,
        createdAt: '2024-01-01T00:00:00.000Z',
        updatedAt: '2024-01-01T00:00:00.000Z',
      };

      const product = ProductModel.fromJSON(jsonData);

      expect(product.id).toBe(jsonData.id);
      expect(product.name).toBe(jsonData.name);
      expect(product.description).toBe(jsonData.description);
      expect(product.price).toBe(jsonData.price);
      expect(product.qty).toBe(jsonData.qty);
      expect(product.createdAt).toBe(jsonData.createdAt);
      expect(product.updatedAt).toBe(jsonData.updatedAt);
    });
  });

  describe('validate', () => {
    it('should validate correct data', () => {
      const data: CreateProductRequest = {
        name: 'Test Product',
        description: 'This is a test product description that is long enough',
        price: 99.99,
        qty: 10,
      };

      const errors = ProductModel.validate(data);
      expect(errors).toHaveLength(0);
    });

    it('should return errors for invalid data', () => {
      const data: CreateProductRequest = {
        name: '', // Too short
        description: 'Short', // Too short
        price: -10, // Negative
        qty: -5, // Negative
      };

      const errors = ProductModel.validate(data);
      expect(errors.length).toBeGreaterThan(0);
      expect(errors).toContain('Le nom doit contenir au moins 2 caractères');
      expect(errors).toContain('La description doit contenir au moins 10 caractères');
      expect(errors).toContain('Le prix doit être supérieur à 0');
      expect(errors).toContain('La quantité ne peut pas être négative');
    });

    it('should validate name length', () => {
      const tooShort: CreateProductRequest = {
        name: 'A',
        description: 'This is a test product description',
        price: 99.99,
        qty: 10,
      };

      const tooLong: CreateProductRequest = {
        name: 'A'.repeat(101),
        description: 'This is a test product description',
        price: 99.99,
        qty: 10,
      };

      expect(ProductModel.validate(tooShort)).toContain('Le nom doit contenir au moins 2 caractères');
      expect(ProductModel.validate(tooLong)).toContain('Le nom ne peut pas dépasser 100 caractères');
    });

    it('should validate description length', () => {
      const tooShort: CreateProductRequest = {
        name: 'Test Product',
        description: 'Short',
        price: 99.99,
        qty: 10,
      };

      const tooLong: CreateProductRequest = {
        name: 'Test Product',
        description: 'A'.repeat(501),
        price: 99.99,
        qty: 10,
      };

      expect(ProductModel.validate(tooShort)).toContain('La description doit contenir au moins 10 caractères');
      expect(ProductModel.validate(tooLong)).toContain('La description ne peut pas dépasser 500 caractères');
    });

    it('should validate price', () => {
      const negativePrice: CreateProductRequest = {
        name: 'Test Product',
        description: 'This is a test product description',
        price: -10,
        qty: 10,
      };

      const tooHighPrice: CreateProductRequest = {
        name: 'Test Product',
        description: 'This is a test product description',
        price: 1000000,
        qty: 10,
      };

      expect(ProductModel.validate(negativePrice)).toContain('Le prix doit être supérieur à 0');
      expect(ProductModel.validate(tooHighPrice)).toContain('Le prix ne peut pas dépasser 999999.99');
    });

    it('should validate quantity', () => {
      const negativeQty: CreateProductRequest = {
        name: 'Test Product',
        description: 'This is a test product description',
        price: 99.99,
        qty: -5,
      };

      const tooHighQty: CreateProductRequest = {
        name: 'Test Product',
        description: 'This is a test product description',
        price: 99.99,
        qty: 1000000,
      };

      const decimalQty: CreateProductRequest = {
        name: 'Test Product',
        description: 'This is a test product description',
        price: 99.99,
        qty: 10.5,
      };

      expect(ProductModel.validate(negativeQty)).toContain('La quantité ne peut pas être négative');
      expect(ProductModel.validate(tooHighQty)).toContain('La quantité ne peut pas dépasser 999999');
      expect(ProductModel.validate(decimalQty)).toContain('La quantité doit être un nombre entier');
    });
  });

  describe('validateUpdate', () => {
    it('should validate correct update data', () => {
      const data: UpdateProductRequest = {
        name: 'Updated Product',
        description: 'This is an updated product description',
        price: 149.99,
        qty: 20,
      };

      const errors = ProductModel.validateUpdate(data);
      expect(errors).toHaveLength(0);
    });

    it('should validate partial update data', () => {
      const data: PatchProductRequest = {
        name: 'Updated Product',
      };

      const errors = ProductModel.validateUpdate(data);
      expect(errors).toHaveLength(0);
    });

    it('should return errors for invalid update data', () => {
      const data: UpdateProductRequest = {
        name: '', // Too short
        description: 'Short', // Too short
        price: -10, // Negative
        qty: -5, // Negative
      };

      const errors = ProductModel.validateUpdate(data);
      expect(errors.length).toBeGreaterThan(0);
    });

    it('should allow empty update for patch', () => {
      const data: PatchProductRequest = {};

      const errors = ProductModel.validateUpdate(data);
      expect(errors).toHaveLength(0);
    });
  });
});
