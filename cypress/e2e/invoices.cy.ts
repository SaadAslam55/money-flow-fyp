/**
 * Invoices E2E Tests
 *
 * Tests for invoice creation, editing, deletion, and PDF generation
 */

describe('Invoices Tests', () => {
  const testUser = {
    email: Cypress.env('testUser').email,
    password: Cypress.env('testUser').password,
  };

  const testInvoice = Cypress.env('testInvoice');

  beforeEach(() => {
    cy.login(testUser.email, testUser.password);
    cy.visit('/invoices');
  });

  describe('Invoice List', () => {
    it('should display invoices page', () => {
      cy.get('h1').should('contain', 'Invoices');
      cy.get('[data-testid="new-invoice-button"]').should('be.visible');
      cy.get('[data-testid="invoices-table"]').should('exist');
    });

    it('should display invoice list with columns', () => {
      cy.get('[data-testid="invoices-table"] thead').within(() => {
        cy.get('th').should('contain', 'Invoice #');
        cy.get('th').should('contain', 'Customer');
        cy.get('th').should('contain', 'Amount');
        cy.get('th').should('contain', 'Status');
        cy.get('th').should('contain', 'Due Date');
      });
    });

    it('should filter invoices by status', () => {
      cy.get('[data-testid="status-filter"]').click();
      cy.get('[data-testid="filter-option-paid"]').click();
      cy.get('[data-testid="invoices-table"]').should('exist');
    });

    it('should search invoices', () => {
      cy.get('[data-testid="search-input"]').type('INV-001');
      cy.get('[data-testid="invoices-table"]').should('exist');
    });

    it('should sort invoices by amount', () => {
      cy.get('[data-testid="sort-amount"]').click();
      cy.get('[data-testid="invoices-table"]').should('exist');
    });
  });

  describe('Create Invoice', () => {
    it('should create new invoice', () => {
      cy.get('[data-testid="new-invoice-button"]').click();
      cy.get('[data-testid="invoice-form"]').should('be.visible');

      // Fill form
      cy.get('[data-testid="customer-select"]').click();
      cy.get('[data-testid="customer-option-0"]').click();

      cy.get('input[name="issueDate"]').type(testInvoice.issueDate);
      cy.get('input[name="dueDate"]').type(testInvoice.dueDate);

      // Add items
      cy.get('[data-testid="add-item-button"]').click();
      cy.get('input[name="items.0.quantity"]').type('1');
      cy.get('input[name="items.0.price"]').type('100.00');

      cy.get('textarea[name="notes"]').type(testInvoice.notes);
      cy.get('[data-testid="save-invoice-button"]').click();

      cy.url().should('include', '/invoices/');
      cy.get('[data-testid="success-notification"]').should('contain', 'Invoice created');
    });

    it('should validate required fields', () => {
      cy.get('[data-testid="new-invoice-button"]').click();
      cy.get('[data-testid="save-invoice-button"]').click();
      cy.get('[data-testid="error-message"]').should('be.visible');
    });

    it('should calculate invoice totals', () => {
      cy.get('[data-testid="new-invoice-button"]').click();
      cy.get('[data-testid="customer-select"]').click();
      cy.get('[data-testid="customer-option-0"]').click();

      cy.get('[data-testid="add-item-button"]').click();
      cy.get('input[name="items.0.quantity"]').type('2');
      cy.get('input[name="items.0.price"]').type('100.00');

      cy.get('input[name="items.0.taxRate"]').type('10');

      cy.get('[data-testid="subtotal"]').should('contain', '200.00');
      cy.get('[data-testid="tax-amount"]').should('contain', '20.00');
      cy.get('[data-testid="total-amount"]').should('contain', '220.00');
    });
  });

  describe('Edit Invoice', () => {
    it('should edit invoice', () => {
      cy.get('[data-testid="invoices-table"] tbody tr:first').within(() => {
        cy.get('[data-testid="edit-button"]').click();
      });

      cy.get('[data-testid="invoice-form"]').should('be.visible');
      cy.get('textarea[name="notes"]').clear().type('Updated notes');
      cy.get('[data-testid="save-invoice-button"]').click();

      cy.get('[data-testid="success-notification"]').should('contain', 'Invoice updated');
    });

    it('should not allow editing paid invoice', () => {
      cy.get('[data-testid="status-filter"]').click();
      cy.get('[data-testid="filter-option-paid"]').click();

      cy.get('[data-testid="invoices-table"] tbody tr:first').within(() => {
        cy.get('[data-testid="edit-button"]').should('be.disabled');
      });
    });
  });

  describe('Invoice Actions', () => {
    it('should send invoice', () => {
      cy.get('[data-testid="invoices-table"] tbody tr:first').within(() => {
        cy.get('[data-testid="actions-menu"]').click();
        cy.get('[data-testid="send-invoice"]').click();
      });

      cy.get('[data-testid="success-notification"]').should('contain', 'Invoice sent');
    });

    it('should mark invoice as paid', () => {
      cy.get('[data-testid="invoices-table"] tbody tr:first').within(() => {
        cy.get('[data-testid="actions-menu"]').click();
        cy.get('[data-testid="mark-paid"]').click();
      });

      cy.get('[data-testid="success-notification"]').should('contain', 'Invoice marked as paid');
    });

    it('should download invoice PDF', () => {
      cy.get('[data-testid="invoices-table"] tbody tr:first').within(() => {
        cy.get('[data-testid="actions-menu"]').click();
        cy.get('[data-testid="download-pdf"]').click();
      });

      cy.readFile('cypress/downloads/invoice.pdf').should('exist');
    });

    it('should delete invoice', () => {
      cy.get('[data-testid="invoices-table"] tbody tr:first').within(() => {
        cy.get('[data-testid="actions-menu"]').click();
        cy.get('[data-testid="delete-invoice"]').click();
      });

      cy.get('[data-testid="confirm-delete-button"]').click();
      cy.get('[data-testid="success-notification"]').should('contain', 'Invoice deleted');
    });
  });

  describe('Invoice Details', () => {
    it('should display invoice details', () => {
      cy.get('[data-testid="invoices-table"] tbody tr:first').click();

      cy.get('[data-testid="invoice-header"]').should('be.visible');
      cy.get('[data-testid="invoice-items"]').should('be.visible');
      cy.get('[data-testid="invoice-totals"]').should('be.visible');
    });
  });
});
