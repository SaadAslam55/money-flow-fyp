/**
 * Subscription E2E Tests
 *
 * Tests for subscription management and payment processing
 */

describe('Subscription Tests', () => {
  const testUser = {
    email: Cypress.env('testUser').email,
    password: Cypress.env('testUser').password,
  };

  beforeEach(() => {
    cy.login(testUser.email, testUser.password);
  });

  describe('Subscription Plans', () => {
    it('should display pricing page', () => {
      cy.visit('/pricing');
      cy.get('h1').should('contain', 'Pricing');
      cy.get('[data-testid="plan-free"]').should('be.visible');
      cy.get('[data-testid="plan-pro"]').should('be.visible');
      cy.get('[data-testid="plan-enterprise"]').should('be.visible');
    });

    it('should display plan features', () => {
      cy.visit('/pricing');
      cy.get('[data-testid="plan-pro"]').within(() => {
        cy.get('[data-testid="feature-list"]').should('be.visible');
        cy.get('[data-testid="price"]').should('contain', '$');
      });
    });
  });

  describe('Upgrade Subscription', () => {
    it('should upgrade to Pro plan', () => {
      cy.visit('/pricing');
      cy.get('[data-testid="plan-pro"] [data-testid="select-plan-button"]').click();
      cy.url().should('include', '/payment');
      cy.get('[data-testid="payment-form"]').should('be.visible');
    });

    it('should process payment', () => {
      cy.visit('/pricing');
      cy.get('[data-testid="plan-pro"] [data-testid="select-plan-button"]').click();

      // Fill card details
      cy.get('[data-testid="card-number"]').type('4242424242424242');
      cy.get('[data-testid="card-expiry"]').type('12/25');
      cy.get('[data-testid="card-cvc"]').type('123');

      cy.get('[data-testid="process-payment-button"]').click();
      cy.get('[data-testid="success-notification"]').should('contain', 'Payment successful');
      cy.url().should('include', '/dashboard');
    });

    it('should handle payment failure', () => {
      cy.visit('/pricing');
      cy.get('[data-testid="plan-pro"] [data-testid="select-plan-button"]').click();

      // Use declining card
      cy.get('[data-testid="card-number"]').type('4000000000000002');
      cy.get('[data-testid="card-expiry"]').type('12/25');
      cy.get('[data-testid="card-cvc"]').type('123');

      cy.get('[data-testid="process-payment-button"]').click();
      cy.get('[data-testid="error-notification"]').should('be.visible');
    });
  });

  describe('Subscription Management', () => {
    beforeEach(() => {
      cy.visit('/settings/billing');
    });

    it('should display current subscription', () => {
      cy.get('[data-testid="current-plan"]').should('be.visible');
      cy.get('[data-testid="plan-name"]').should('exist');
      cy.get('[data-testid="next-billing-date"]').should('exist');
    });

    it('should display payment history', () => {
      cy.get('[data-testid="payment-history-section"]').should('be.visible');
      cy.get('[data-testid="payment-history-table"]').should('exist');
    });

    it('should update payment method', () => {
      cy.get('[data-testid="update-payment-method"]').click();
      cy.get('[data-testid="payment-form"]').should('be.visible');
      cy.get('[data-testid="card-number"]').type('4242424242424242');
      cy.get('[data-testid="save-payment-button"]').click();
      cy.get('[data-testid="success-notification"]').should('be.visible');
    });

    it('should cancel subscription', () => {
      cy.get('[data-testid="cancel-subscription-button"]').click();
      cy.get('[data-testid="cancel-modal"]').should('be.visible');
      cy.get('[data-testid="reason-select"]').click();
      cy.get('[data-testid="reason-option"]').click();
      cy.get('[data-testid="confirm-cancel-button"]').click();
      cy.get('[data-testid="success-notification"]').should('be.visible');
    });

    it('should reactivate subscription', () => {
      // First cancel
      cy.get('[data-testid="cancel-subscription-button"]').click();
      cy.get('[data-testid="confirm-cancel-button"]').click();

      // Then reactivate
      cy.get('[data-testid="reactivate-button"]').click();
      cy.get('[data-testid="success-notification"]').should('contain', 'Reactivated');
    });
  });

  describe('Invoice Download', () => {
    it('should download invoice', () => {
      cy.visit('/settings/billing');
      cy.get('[data-testid="payment-history-table"] tbody tr:first').within(() => {
        cy.get('[data-testid="download-invoice"]').click();
      });
      cy.readFile('cypress/downloads/invoice.pdf').should('exist');
    });
  });

  describe('Trial Period', () => {
    it('should display trial status', () => {
      cy.visit('/settings/billing');
      cy.get('[data-testid="trial-badge"]').should('be.visible');
      cy.get('[data-testid="trial-days-remaining"]').should('exist');
    });

    it('should upgrade before trial ends', () => {
      cy.visit('/settings/billing');
      cy.get('[data-testid="upgrade-before-trial-button"]').click();
      cy.url().should('include', '/pricing');
    });
  });

  describe('Usage Limits', () => {
    it('should display usage metrics', () => {
      cy.visit('/settings/billing');
      cy.get('[data-testid="usage-section"]').should('be.visible');
      cy.get('[data-testid="invoices-used"]').should('exist');
      cy.get('[data-testid="users-limit"]').should('exist');
    });

    it('should show upgrade prompt at limit', () => {
      cy.visit('/dashboard');
      // Assuming user has hit a limit
      cy.get('[data-testid="usage-limit-notification"]').should('be.visible');
      cy.get('[data-testid="upgrade-link"]').click();
      cy.url().should('include', '/pricing');
    });
  });
});
