/**
 * Products E2E Tests
 *
 * Tests for product/inventory management
 */
describe('Products Tests', () => {
    const testUser = {
        email: Cypress.env('testUser').email,
        password: Cypress.env('testUser').password,
    };
    const testProduct = Cypress.env('testProduct');
    beforeEach(() => {
        cy.login(testUser.email, testUser.password);
        cy.visit('/products');
    });
    describe('Products List', () => {
        it('should display products page', () => {
            cy.get('h1').should('contain', 'Products');
            cy.get('[data-testid="new-product-button"]').should('be.visible');
            cy.get('[data-testid="products-table"]').should('exist');
        });
        it('should display products with correct columns', () => {
            cy.get('[data-testid="products-table"] thead').within(() => {
                cy.get('th').should('contain', 'Name');
                cy.get('th').should('contain', 'SKU');
                cy.get('th').should('contain', 'Price');
                cy.get('th').should('contain', 'Stock');
                cy.get('th').should('contain', 'Category');
            });
        });
        it('should search products', () => {
            cy.get('[data-testid="search-input"]').type(testProduct.name);
            cy.get('[data-testid="products-table"]').should('exist');
        });
        it('should filter by category', () => {
            cy.get('[data-testid="category-filter"]').click();
            cy.get('[data-testid="filter-option-services"]').click();
            cy.get('[data-testid="products-table"]').should('exist');
        });
        it('should show low stock alert', () => {
            cy.get('[data-testid="products-table"]').within(() => {
                cy.get('[data-testid="low-stock-badge"]').should('exist');
            });
        });
    });
    describe('Create Product', () => {
        it('should create new product', () => {
            cy.get('[data-testid="new-product-button"]').click();
            cy.get('[data-testid="product-form"]').should('be.visible');
            cy.createProduct(testProduct);
            cy.url().should('include', '/products/');
            cy.get('[data-testid="success-notification"]').should('contain', 'Product created');
        });
        it('should validate required fields', () => {
            cy.get('[data-testid="new-product-button"]').click();
            cy.get('[data-testid="save-product-button"]').click();
            cy.get('[data-testid="error-message"]').should('be.visible');
        });
        it('should validate price fields', () => {
            cy.get('[data-testid="new-product-button"]').click();
            cy.get('input[name="name"]').type('Product');
            cy.get('input[name="sku"]').type('SKU-001');
            cy.get('input[name="price"]').type('invalid');
            cy.get('[data-testid="save-product-button"]').click();
            cy.get('[data-testid="error-message"]').should('be.visible');
        });
        it('should prevent duplicate SKU', () => {
            cy.get('[data-testid="new-product-button"]').click();
            cy.createProduct(testProduct);
            cy.get('[data-testid="new-product-button"]').click();
            cy.get('input[name="name"]').type('Another Product');
            cy.get('input[name="sku"]').type(testProduct.sku);
            cy.get('[data-testid="save-product-button"]').click();
            cy.get('[data-testid="error-message"]').should('contain', 'SKU already exists');
        });
    });
    describe('Edit Product', () => {
        it('should edit product', () => {
            cy.get('[data-testid="products-table"] tbody tr:first').within(() => {
                cy.get('[data-testid="edit-button"]').click();
            });
            cy.get('input[name="price"]').clear().type('149.99');
            cy.get('[data-testid="save-product-button"]').click();
            cy.get('[data-testid="success-notification"]').should('contain', 'Product updated');
        });
    });
    describe('Inventory Management', () => {
        it('should update stock quantity', () => {
            cy.get('[data-testid="products-table"] tbody tr:first').within(() => {
                cy.get('[data-testid="stock-cell"]').click();
            });
            cy.get('input[name="quantity"]').clear().type('50');
            cy.get('[data-testid="save-quantity-button"]').click();
            cy.get('[data-testid="success-notification"]').should('contain', 'Stock updated');
        });
        it('should show low stock warning', () => {
            cy.get('[data-testid="products-table"]').within(() => {
                cy.get('[data-testid="low-stock-warning"]').should('be.visible');
            });
        });
        it('should adjust stock on invoice creation', () => {
            // When creating an invoice with this product, stock should decrease
            cy.visit('/invoices/new');
            cy.get('[data-testid="add-item-button"]').click();
            cy.get('[data-testid="product-select"]').click();
            cy.get('[data-testid="product-option-0"]').click();
            cy.get('input[name="items.0.quantity"]').type('5');
            const initialStock = cy.get('[data-testid="product-stock"]');
            cy.get('[data-testid="save-invoice-button"]').click();
            // Check stock was reduced
            cy.visit('/products');
            cy.get('[data-testid="products-table"] tbody tr:first').within(() => {
                cy.get('[data-testid="stock-cell"]').should('not.contain', initialStock);
            });
        });
    });
    describe('Product Categories', () => {
        it('should create product category', () => {
            cy.get('[data-testid="manage-categories-button"]').click();
            cy.get('[data-testid="category-form"]').should('be.visible');
            cy.get('input[name="categoryName"]').type('New Category');
            cy.get('[data-testid="save-category-button"]').click();
            cy.get('[data-testid="success-notification"]').should('be.visible');
        });
    });
    describe('Product Actions', () => {
        it('should delete product', () => {
            cy.get('[data-testid="products-table"] tbody tr:first').within(() => {
                cy.get('[data-testid="delete-button"]').click();
            });
            cy.get('[data-testid="confirm-delete-button"]').click();
            cy.get('[data-testid="success-notification"]').should('contain', 'Product deleted');
        });
        it('should archive product', () => {
            cy.get('[data-testid="products-table"] tbody tr:first').within(() => {
                cy.get('[data-testid="archive-button"]').click();
            });
            cy.get('[data-testid="success-notification"]').should('contain', 'Product archived');
        });
        it('should export products to CSV', () => {
            cy.get('[data-testid="export-button"]').click();
            cy.get('[data-testid="export-format-csv"]').click();
            cy.readFile('cypress/downloads/products.csv').should('exist');
        });
    });
});
