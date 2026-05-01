/**
 * Dashboard E2E Tests
 *
 * Tests for dashboard functionality, widgets, and navigation
 */
describe('Dashboard Tests', () => {
    const testUser = {
        email: Cypress.env('testUser').email,
        password: Cypress.env('testUser').password,
    };
    beforeEach(() => {
        cy.login(testUser.email, testUser.password);
        cy.visit('/dashboard');
    });
    describe('Dashboard Layout', () => {
        it('should display dashboard header', () => {
            cy.get('[data-testid="dashboard-header"]').should('be.visible');
            cy.get('[data-testid="user-greeting"]').should('contain', 'Welcome');
        });
        it('should display sidebar navigation', () => {
            cy.get('[data-testid="sidebar"]').should('be.visible');
            cy.get('[data-testid="nav-link-invoices"]').should('exist');
            cy.get('[data-testid="nav-link-customers"]').should('exist');
            cy.get('[data-testid="nav-link-products"]').should('exist');
            cy.get('[data-testid="nav-link-reports"]').should('exist');
        });
        it('should display user menu', () => {
            cy.get('[data-testid="user-menu-button"]').click();
            cy.get('[data-testid="user-profile-option"]').should('be.visible');
            cy.get('[data-testid="settings-option"]').should('be.visible');
            cy.get('[data-testid="logout-button"]').should('be.visible');
        });
    });
    describe('Dashboard Widgets', () => {
        it('should display key metrics', () => {
            cy.get('[data-testid="total-revenue-widget"]').should('be.visible');
            cy.get('[data-testid="total-customers-widget"]').should('be.visible');
            cy.get('[data-testid="pending-invoices-widget"]').should('be.visible');
            cy.get('[data-testid="cash-balance-widget"]').should('be.visible');
        });
        it('should display revenue chart', () => {
            cy.get('[data-testid="revenue-chart"]').should('be.visible');
            cy.get('svg').should('exist');
        });
        it('should display recent invoices', () => {
            cy.get('[data-testid="recent-invoices-widget"]').should('be.visible');
            cy.get('[data-testid="recent-invoices-list"]').should('exist');
        });
        it('should display recent transactions', () => {
            cy.get('[data-testid="recent-transactions-widget"]').should('be.visible');
            cy.get('[data-testid="transactions-list"]').should('exist');
        });
    });
    describe('Dashboard Navigation', () => {
        it('should navigate to invoices', () => {
            cy.get('[data-testid="nav-link-invoices"]').click();
            cy.url().should('include', '/invoices');
        });
        it('should navigate to customers', () => {
            cy.get('[data-testid="nav-link-customers"]').click();
            cy.url().should('include', '/customers');
        });
        it('should navigate to products', () => {
            cy.get('[data-testid="nav-link-products"]').click();
            cy.url().should('include', '/products');
        });
        it('should navigate to reports', () => {
            cy.get('[data-testid="nav-link-reports"]').click();
            cy.url().should('include', '/reports');
        });
    });
    describe('Quick Actions', () => {
        it('should open new invoice dialog', () => {
            cy.get('[data-testid="new-invoice-button"]').click();
            cy.get('[data-testid="invoice-form"]').should('be.visible');
        });
        it('should open new customer dialog', () => {
            cy.get('[data-testid="new-customer-button"]').click();
            cy.get('[data-testid="customer-form"]').should('be.visible');
        });
    });
    describe('Dashboard Responsiveness', () => {
        it('should be responsive on mobile', () => {
            cy.viewport('iphone-x');
            cy.get('[data-testid="sidebar"]').should('not.be.visible');
            cy.get('[data-testid="menu-toggle"]').click();
            cy.get('[data-testid="sidebar"]').should('be.visible');
        });
        it('should be responsive on tablet', () => {
            cy.viewport('ipad-2');
            cy.get('[data-testid="dashboard-header"]').should('be.visible');
        });
    });
});
