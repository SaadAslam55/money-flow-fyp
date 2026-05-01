/// <reference path="../globals.d.ts" />

/**
 * Custom Cypress Commands
 *
 * Define custom commands for common test operations
 * Commands are available globally in all tests
 */

// Login command
Cypress.Commands.add('login', (email: string, password: string) => {
  cy.visit('/auth/login');
  cy.get('input[type="email"]').type(email);
  cy.get('input[type="password"]').type(password);
  cy.get('button[type="submit"]').click();
  cy.url().should('include', '/dashboard');
});

// Logout command
Cypress.Commands.add('logout', () => {
  cy.get('[data-testid="user-menu-button"]').click();
  cy.get('[data-testid="logout-button"]').click();
  cy.url().should('include', '/auth/login');
});

// Register command
Cypress.Commands.add(
  'register',
  (firstName: string, lastName: string, email: string, password: string) => {
    cy.visit('/auth/signup');
    cy.get('input[name="firstName"]').type(firstName);
    cy.get('input[name="lastName"]').type(lastName);
    cy.get('input[name="email"]').type(email);
    cy.get('input[name="password"]').type(password);
    cy.get('input[name="confirmPassword"]').type(password);
    cy.get('button[type="submit"]').click();
    cy.url().should('include', '/dashboard');
  }
);

// Create invoice command
Cypress.Commands.add('createInvoice', (customerId: string, items: any[], notes?: string) => {
  cy.visit('/invoices/new');
  cy.get('[data-testid="customer-select"]').click();
  cy.get(`[data-testid="customer-option-${customerId}"]`).click();

  items.forEach((item, index) => {
    cy.get('[data-testid="add-item-button"]').click();
    cy.get(`input[name="items.${index}.productId"]`).type(item.productId);
    cy.get(`input[name="items.${index}.quantity"]`).clear().type(item.quantity);
    cy.get(`input[name="items.${index}.price"]`).clear().type(item.price);
  });

  if (notes) {
    cy.get('textarea[name="notes"]').type(notes);
  }

  cy.get('[data-testid="save-invoice-button"]').click();
  cy.url().should('include', '/invoices/');
});

// Create customer command
Cypress.Commands.add('createCustomer', (customerData: any) => {
  cy.visit('/customers/new');
  cy.get('input[name="name"]').type(customerData.name);
  cy.get('input[name="email"]').type(customerData.email);
  cy.get('input[name="phone"]').type(customerData.phone);
  cy.get('input[name="address"]').type(customerData.address);
  cy.get('input[name="city"]').type(customerData.city);
  cy.get('input[name="state"]').type(customerData.state);
  cy.get('input[name="postalCode"]').type(customerData.postalCode);
  cy.get('input[name="country"]').type(customerData.country);
  cy.get('[data-testid="save-customer-button"]').click();
  cy.url().should('include', '/customers/');
});

// Create product command
Cypress.Commands.add('createProduct', (productData: any) => {
  cy.visit('/products/new');
  cy.get('input[name="name"]').type(productData.name);
  cy.get('input[name="sku"]').type(productData.sku);
  cy.get('textarea[name="description"]').type(productData.description);
  cy.get('input[name="price"]').type(productData.price);
  cy.get('input[name="costPrice"]').type(productData.costPrice);
  cy.get('input[name="taxRate"]').type(productData.taxRate);
  cy.get('input[name="category"]').type(productData.category);
  cy.get('[data-testid="save-product-button"]').click();
  cy.url().should('include', '/products/');
});

// Check if element contains text
Cypress.Commands.add('containsText', (selector: string, text: string) => {
  cy.get(selector).should('contain', text);
});

// Wait for API call
Cypress.Commands.add('waitForApi', (method: string, url: string) => {
  cy.intercept('POST', url).as('apiCall');
  cy.wait('@apiCall');
});

// Fill form field
Cypress.Commands.add('fillField', (name: string, value: string) => {
  cy.get(`input[name="${name}"], textarea[name="${name}"], select[name="${name}"]`)
    .clear()
    .type(value);
});

// Select dropdown option
Cypress.Commands.add('selectDropdown', (selector: string, option: string) => {
  cy.get(selector).click();
  cy.get(`[data-testid="option-${option}"]`).click();
});

// Toggle switch
Cypress.Commands.add('toggleSwitch', (selector: string) => {
  cy.get(selector).click();
});

// Check notification
Cypress.Commands.add('checkNotification', (type: string, message: string) => {
  cy.get(`[data-testid="notification-${type}"]`).should('contain', message);
});

// Export TypeScript declarations
declare namespace Cypress {
  interface Chainable<Subject = any> {
    login(email: string, password: string): Chainable<void>;
    logout(): Chainable<void>;
    register(firstName: string, lastName: string, email: string, password: string): Chainable<void>;
    createInvoice(customerId: string, items: any[], notes?: string): Chainable<void>;
    createCustomer(customerData: any): Chainable<void>;
    createProduct(productData: any): Chainable<void>;
    containsText(selector: string, text: string): Chainable<void>;
    waitForApi(method: string, url: string): Chainable<void>;
    fillField(name: string, value: string): Chainable<void>;
    selectDropdown(selector: string, option: string): Chainable<void>;
    toggleSwitch(selector: string): Chainable<void>;
    checkNotification(type: string, message: string): Chainable<void>;
  }
}
