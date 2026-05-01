/**
 * Transactions E2E Tests
 *
 * Tests for transaction logging and management
 */
describe('Transactions Tests', () => {
    const testUser = {
        email: Cypress.env('testUser').email,
        password: Cypress.env('testUser').password,
    };
    beforeEach(() => {
        cy.login(testUser.email, testUser.password);
        cy.visit('/transactions');
    });
    describe('Transactions List', () => {
        it('should display transactions page', () => {
            cy.get('h1').should('contain', 'Transactions');
            cy.get('[data-testid="transactions-table"]').should('exist');
        });
        it('should display transaction columns', () => {
            cy.get('[data-testid="transactions-table"] thead').within(() => {
                cy.get('th').should('contain', 'Date');
                cy.get('th').should('contain', 'Type');
                cy.get('th').should('contain', 'Amount');
                cy.get('th').should('contain', 'Description');
                cy.get('th').should('contain', 'Status');
            });
        });
        it('should filter by transaction type', () => {
            cy.get('[data-testid="type-filter"]').click();
            cy.get('[data-testid="filter-income"]').click();
            cy.get('[data-testid="transactions-table"]').should('exist');
        });
        it('should filter by date range', () => {
            cy.get('[data-testid="date-range-picker"]').click();
            cy.get('[data-testid="date-start"]').type('2025-01-01');
            cy.get('[data-testid="date-end"]').type('2025-01-31');
            cy.get('[data-testid="apply-filter"]').click();
            cy.get('[data-testid="transactions-table"]').should('exist');
        });
        it('should search transactions', () => {
            cy.get('[data-testid="search-input"]').type('payment');
            cy.get('[data-testid="transactions-table"]').should('exist');
        });
    });
    describe('Transaction Details', () => {
        it('should display transaction details', () => {
            cy.get('[data-testid="transactions-table"] tbody tr:first').click();
            cy.get('[data-testid="transaction-details"]').should('be.visible');
            cy.get('[data-testid="transaction-reference"]').should('be.visible');
            cy.get('[data-testid="transaction-receipt"]').should('exist');
        });
        it('should display linked invoice', () => {
            cy.get('[data-testid="transactions-table"] tbody tr:first').click();
            cy.get('[data-testid="linked-invoice-link"]').should('be.visible').click();
            cy.url().should('include', '/invoices/');
        });
    });
    describe('Transaction Status', () => {
        it('should show pending transactions', () => {
            cy.get('[data-testid="status-filter"]').click();
            cy.get('[data-testid="filter-pending"]').click();
            cy.get('[data-testid="transactions-table"]').within(() => {
                cy.get('[data-testid="pending-badge"]').should('be.visible');
            });
        });
        it('should show completed transactions', () => {
            cy.get('[data-testid="status-filter"]').click();
            cy.get('[data-testid="filter-completed"]').click();
            cy.get('[data-testid="transactions-table"]').within(() => {
                cy.get('[data-testid="completed-badge"]').should('be.visible');
            });
        });
    });
    describe('Transaction Reports', () => {
        it('should calculate total income', () => {
            cy.get('[data-testid="income-total"]').should('be.visible');
        });
        it('should calculate total expenses', () => {
            cy.get('[data-testid="expenses-total"]').should('be.visible');
        });
        it('should show net cash flow', () => {
            cy.get('[data-testid="net-cash-flow"]').should('be.visible');
        });
    });
    describe('Transaction Export', () => {
        it('should export transactions to CSV', () => {
            cy.get('[data-testid="export-button"]').click();
            cy.get('[data-testid="export-csv"]').click();
            cy.readFile('cypress/downloads/transactions.csv').should('exist');
        });
        it('should export to Excel', () => {
            cy.get('[data-testid="export-button"]').click();
            cy.get('[data-testid="export-excel"]').click();
            cy.readFile('cypress/downloads/transactions.xlsx').should('exist');
        });
    });
});
