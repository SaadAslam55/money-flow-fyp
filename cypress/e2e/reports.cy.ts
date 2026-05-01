/**
 * Reports E2E Tests
 *
 * Tests for reporting features and analytics
 */

describe('Reports Tests', () => {
  const testUser = {
    email: Cypress.env('testUser').email,
    password: Cypress.env('testUser').password,
  };

  beforeEach(() => {
    cy.login(testUser.email, testUser.password);
    cy.visit('/reports');
  });

  describe('Reports Page', () => {
    it('should display reports page', () => {
      cy.get('h1').should('contain', 'Reports');
      cy.get('[data-testid="report-categories"]').should('exist');
    });

    it('should display available reports', () => {
      cy.get('[data-testid="report-card-sales"]').should('exist');
      cy.get('[data-testid="report-card-expenses"]').should('exist');
      cy.get('[data-testid="report-card-profit-loss"]').should('exist');
      cy.get('[data-testid="report-card-balance-sheet"]').should('exist');
      cy.get('[data-testid="report-card-cash-flow"]').should('exist');
    });
  });

  describe('Sales Report', () => {
    it('should generate sales report', () => {
      cy.get('[data-testid="report-card-sales"]').click();
      cy.url().should('include', '/reports/sales');
      cy.get('[data-testid="report-content"]').should('be.visible');
    });

    it('should filter sales by date range', () => {
      cy.get('[data-testid="report-card-sales"]').click();
      cy.get('[data-testid="date-range-picker"]').click();
      cy.get('[data-testid="date-start"]').type('2025-01-01');
      cy.get('[data-testid="date-end"]').type('2025-01-31');
      cy.get('[data-testid="apply-filter"]').click();
      cy.get('[data-testid="report-content"]').should('exist');
    });

    it('should display sales chart', () => {
      cy.get('[data-testid="report-card-sales"]').click();
      cy.get('[data-testid="sales-chart"]').should('be.visible');
      cy.get('svg').should('exist');
    });

    it('should export sales report', () => {
      cy.get('[data-testid="report-card-sales"]').click();
      cy.get('[data-testid="export-button"]').click();
      cy.get('[data-testid="export-pdf"]').click();
      cy.readFile('cypress/downloads/sales-report.pdf').should('exist');
    });
  });

  describe('Profit & Loss Report', () => {
    it('should generate P&L report', () => {
      cy.get('[data-testid="report-card-profit-loss"]').click();
      cy.url().should('include', '/reports/profit-loss');
      cy.get('[data-testid="report-content"]').should('be.visible');
    });

    it('should show income section', () => {
      cy.get('[data-testid="report-card-profit-loss"]').click();
      cy.get('[data-testid="income-section"]').should('be.visible');
      cy.get('[data-testid="total-income"]').should('be.visible');
    });

    it('should show expenses section', () => {
      cy.get('[data-testid="report-card-profit-loss"]').click();
      cy.get('[data-testid="expenses-section"]').should('be.visible');
      cy.get('[data-testid="total-expenses"]').should('be.visible');
    });

    it('should show net profit', () => {
      cy.get('[data-testid="report-card-profit-loss"]').click();
      cy.get('[data-testid="net-profit"]').should('be.visible');
    });
  });

  describe('Cash Flow Report', () => {
    it('should generate cash flow report', () => {
      cy.get('[data-testid="report-card-cash-flow"]').click();
      cy.url().should('include', '/reports/cash-flow');
      cy.get('[data-testid="report-content"]').should('be.visible');
    });

    it('should display cash flow chart', () => {
      cy.get('[data-testid="report-card-cash-flow"]').click();
      cy.get('[data-testid="cash-flow-chart"]').should('be.visible');
    });
  });

  describe('Custom Report', () => {
    it('should create custom report', () => {
      cy.get('[data-testid="custom-report-button"]').click();
      cy.get('[data-testid="report-builder"]').should('be.visible');
    });

    it('should select report type', () => {
      cy.get('[data-testid="custom-report-button"]').click();
      cy.get('[data-testid="report-type-select"]').click();
      cy.get('[data-testid="report-type-invoice"]').click();
      cy.get('[data-testid="report-type-select"]').should('contain', 'Invoice');
    });

    it('should select report fields', () => {
      cy.get('[data-testid="custom-report-button"]').click();
      cy.get('[data-testid="select-fields"]').click();
      cy.get('[data-testid="field-checkbox-amount"]').click();
      cy.get('[data-testid="field-checkbox-date"]').click();
      cy.get('[data-testid="apply-fields"]').click();
    });

    it('should save custom report', () => {
      cy.get('[data-testid="custom-report-button"]').click();
      cy.get('[data-testid="report-type-select"]').click();
      cy.get('[data-testid="report-type-invoice"]').click();
      cy.get('input[name="reportName"]').type('My Custom Report');
      cy.get('[data-testid="save-custom-report"]').click();
      cy.get('[data-testid="success-notification"]').should('be.visible');
    });
  });

  describe('Report Scheduling', () => {
    it('should schedule report delivery', () => {
      cy.get('[data-testid="report-card-sales"]').click();
      cy.get('[data-testid="schedule-button"]').click();
      cy.get('[data-testid="schedule-modal"]').should('be.visible');
    });

    it('should set schedule frequency', () => {
      cy.get('[data-testid="report-card-sales"]').click();
      cy.get('[data-testid="schedule-button"]').click();
      cy.get('[data-testid="frequency-select"]').click();
      cy.get('[data-testid="frequency-weekly"]').click();
      cy.get('[data-testid="save-schedule"]').click();
      cy.get('[data-testid="success-notification"]').should('be.visible');
    });
  });

  describe('Report Export', () => {
    it('should export report as PDF', () => {
      cy.get('[data-testid="report-card-sales"]').click();
      cy.get('[data-testid="export-button"]').click();
      cy.get('[data-testid="export-pdf"]').click();
      cy.readFile('cypress/downloads/report.pdf').should('exist');
    });

    it('should export report as CSV', () => {
      cy.get('[data-testid="report-card-sales"]').click();
      cy.get('[data-testid="export-button"]').click();
      cy.get('[data-testid="export-csv"]').click();
      cy.readFile('cypress/downloads/report.csv').should('exist');
    });

    it('should export report as Excel', () => {
      cy.get('[data-testid="report-card-sales"]').click();
      cy.get('[data-testid="export-button"]').click();
      cy.get('[data-testid="export-excel"]').click();
      cy.readFile('cypress/downloads/report.xlsx').should('exist');
    });
  });

  describe('Report Analytics', () => {
    it('should display key metrics', () => {
      cy.get('[data-testid="report-card-sales"]').click();
      cy.get('[data-testid="total-sales-metric"]').should('be.visible');
      cy.get('[data-testid="average-invoice-metric"]').should('be.visible');
    });

    it('should display comparison data', () => {
      cy.get('[data-testid="report-card-profit-loss"]').click();
      cy.get('[data-testid="comparison-toggle"]').click();
      cy.get('[data-testid="comparison-period"]').should('contain', 'vs');
    });
  });
});
