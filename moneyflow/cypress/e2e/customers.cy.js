/**
 * Customers E2E Tests
 *
 * Tests for customer management, creation, editing, and deletion
 */
describe('Customers Tests', () => {
    const testUser = {
        email: Cypress.env('testUser').email,
        password: Cypress.env('testUser').password,
    };
    const testCustomer = Cypress.env('testCustomer');
    beforeEach(() => {
        cy.login(testUser.email, testUser.password);
        cy.visit('/customers');
    });
    describe('Customers List', () => {
        it('should display customers page', () => {
            cy.get('h1').should('contain', 'Customers');
            cy.get('[data-testid="new-customer-button"]').should('be.visible');
            cy.get('[data-testid="customers-table"]').should('exist');
        });
        it('should display customers with correct columns', () => {
            cy.get('[data-testid="customers-table"] thead').within(() => {
                cy.get('th').should('contain', 'Name');
                cy.get('th').should('contain', 'Email');
                cy.get('th').should('contain', 'Phone');
                cy.get('th').should('contain', 'Total Invoices');
            });
        });
        it('should search customers', () => {
            cy.get('[data-testid="search-input"]').type(testCustomer.name);
            cy.get('[data-testid="customers-table"]').should('exist');
        });
        it('should sort customers by name', () => {
            cy.get('[data-testid="sort-name"]').click();
            cy.get('[data-testid="customers-table"]').should('exist');
        });
        it('should filter by status', () => {
            cy.get('[data-testid="status-filter"]').click();
            cy.get('[data-testid="filter-option-active"]').click();
            cy.get('[data-testid="customers-table"]').should('exist');
        });
    });
    describe('Create Customer', () => {
        it('should create new customer', () => {
            cy.get('[data-testid="new-customer-button"]').click();
            cy.get('[data-testid="customer-form"]').should('be.visible');
            cy.createCustomer(testCustomer);
            cy.url().should('include', '/customers/');
            cy.get('[data-testid="success-notification"]').should('contain', 'Customer created');
        });
        it('should validate required fields', () => {
            cy.get('[data-testid="new-customer-button"]').click();
            cy.get('[data-testid="save-customer-button"]').click();
            cy.get('[data-testid="error-message"]').should('be.visible');
        });
        it('should validate email format', () => {
            cy.get('[data-testid="new-customer-button"]').click();
            cy.get('input[name="name"]').type('Test Customer');
            cy.get('input[name="email"]').type('invalid-email');
            cy.get('[data-testid="save-customer-button"]').click();
            cy.get('[data-testid="error-message"]').should('contain', 'Valid email');
        });
        it('should prevent duplicate emails', () => {
            // Create first customer
            cy.get('[data-testid="new-customer-button"]').click();
            cy.createCustomer(testCustomer);
            // Try to create with same email
            cy.get('[data-testid="new-customer-button"]').click();
            cy.get('input[name="name"]').type('Another Customer');
            cy.get('input[name="email"]').type(testCustomer.email);
            cy.get('[data-testid="save-customer-button"]').click();
            cy.get('[data-testid="error-message"]').should('contain', 'already exists');
        });
    });
    describe('Edit Customer', () => {
        it('should edit customer', () => {
            cy.get('[data-testid="customers-table"] tbody tr:first').within(() => {
                cy.get('[data-testid="edit-button"]').click();
            });
            cy.get('input[name="phone"]').clear().type('+1987654321');
            cy.get('[data-testid="save-customer-button"]').click();
            cy.get('[data-testid="success-notification"]').should('contain', 'Customer updated');
        });
    });
    describe('Customer Details', () => {
        it('should display customer details', () => {
            cy.get('[data-testid="customers-table"] tbody tr:first').click();
            cy.get('[data-testid="customer-name"]').should('be.visible');
            cy.get('[data-testid="customer-email"]').should('be.visible');
            cy.get('[data-testid="customer-invoices"]').should('be.visible');
            cy.get('[data-testid="customer-total-spent"]').should('be.visible');
        });
        it('should display customer invoices', () => {
            cy.get('[data-testid="customers-table"] tbody tr:first').click();
            cy.get('[data-testid="customer-invoices-tab"]').click();
            cy.get('[data-testid="customer-invoices-list"]').should('exist');
        });
    });
    describe('Customer Actions', () => {
        it('should create invoice from customer page', () => {
            cy.get('[data-testid="customers-table"] tbody tr:first').click();
            cy.get('[data-testid="new-invoice-button"]').click();
            cy.get('[data-testid="invoice-form"]').should('be.visible');
            cy.get('[data-testid="customer-name-readonly"]').should('be.visible');
        });
        it('should delete customer', () => {
            cy.get('[data-testid="customers-table"] tbody tr:first').within(() => {
                cy.get('[data-testid="delete-button"]').click();
            });
            cy.get('[data-testid="confirm-delete-button"]').click();
            cy.get('[data-testid="success-notification"]').should('contain', 'Customer deleted');
        });
        it('should archive customer', () => {
            cy.get('[data-testid="customers-table"] tbody tr:first').within(() => {
                cy.get('[data-testid="archive-button"]').click();
            });
            cy.get('[data-testid="success-notification"]').should('contain', 'Customer archived');
        });
    });
    describe('Customer Export', () => {
        it('should export customers to CSV', () => {
            cy.get('[data-testid="export-button"]').click();
            cy.get('[data-testid="export-format-csv"]').click();
            cy.readFile('cypress/downloads/customers.csv').should('exist');
        });
    });
});
