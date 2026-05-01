/**
 * Admin E2E Tests
 *
 * Tests for admin panel and administrative functions
 */

describe('Admin Tests', () => {
  const adminUser = {
    email: Cypress.env('testAdmin').email,
    password: Cypress.env('testAdmin').password,
  };

  beforeEach(() => {
    cy.login(adminUser.email, adminUser.password);
    cy.visit('/admin');
  });

  describe('Admin Dashboard', () => {
    it('should display admin panel', () => {
      cy.get('h1').should('contain', 'Admin Panel');
      cy.get('[data-testid="admin-menu"]').should('exist');
    });

    it('should display admin metrics', () => {
      cy.get('[data-testid="total-users-widget"]').should('be.visible');
      cy.get('[data-testid="total-organizations-widget"]').should('be.visible');
      cy.get('[data-testid="system-status-widget"]').should('be.visible');
    });
  });

  describe('User Management', () => {
    it('should display users list', () => {
      cy.get('[data-testid="menu-users"]').click();
      cy.get('[data-testid="users-table"]').should('exist');
    });

    it('should search users', () => {
      cy.get('[data-testid="menu-users"]').click();
      cy.get('[data-testid="search-input"]').type('user@example.com');
      cy.get('[data-testid="users-table"]').should('exist');
    });

    it('should view user details', () => {
      cy.get('[data-testid="menu-users"]').click();
      cy.get('[data-testid="users-table"] tbody tr:first').click();
      cy.get('[data-testid="user-details-modal"]').should('be.visible');
    });

    it('should reset user password', () => {
      cy.get('[data-testid="menu-users"]').click();
      cy.get('[data-testid="users-table"] tbody tr:first').within(() => {
        cy.get('[data-testid="actions-menu"]').click();
        cy.get('[data-testid="reset-password"]').click();
      });
      cy.get('[data-testid="success-notification"]').should('be.visible');
    });

    it('should disable user account', () => {
      cy.get('[data-testid="menu-users"]').click();
      cy.get('[data-testid="users-table"] tbody tr:first').within(() => {
        cy.get('[data-testid="actions-menu"]').click();
        cy.get('[data-testid="disable-user"]').click();
      });
      cy.get('[data-testid="confirm-button"]').click();
      cy.get('[data-testid="success-notification"]').should('be.visible');
    });
  });

  describe('Organization Management', () => {
    it('should display organizations list', () => {
      cy.get('[data-testid="menu-organizations"]').click();
      cy.get('[data-testid="organizations-table"]').should('exist');
    });

    it('should view organization details', () => {
      cy.get('[data-testid="menu-organizations"]').click();
      cy.get('[data-testid="organizations-table"] tbody tr:first').click();
      cy.get('[data-testid="org-details-modal"]').should('be.visible');
    });

    it('should update organization status', () => {
      cy.get('[data-testid="menu-organizations"]').click();
      cy.get('[data-testid="organizations-table"] tbody tr:first').within(() => {
        cy.get('[data-testid="status-badge"]').click();
        cy.get('[data-testid="status-option"]').click();
      });
      cy.get('[data-testid="success-notification"]').should('be.visible');
    });
  });

  describe('System Settings', () => {
    it('should display system settings', () => {
      cy.get('[data-testid="menu-system"]').click();
      cy.get('[data-testid="system-settings-form"]').should('be.visible');
    });

    it('should update email configuration', () => {
      cy.get('[data-testid="menu-system"]').click();
      cy.get('[data-testid="email-settings-section"]').click();
      cy.get('input[name="smtpHost"]').clear().type('smtp.gmail.com');
      cy.get('[data-testid="save-settings-button"]').click();
      cy.get('[data-testid="success-notification"]').should('be.visible');
    });

    it('should update payment configuration', () => {
      cy.get('[data-testid="menu-system"]').click();
      cy.get('[data-testid="payment-settings-section"]').click();
      cy.get('input[name="stripeKey"]').clear().type('pk_test_xxx');
      cy.get('[data-testid="save-settings-button"]').click();
      cy.get('[data-testid="success-notification"]').should('be.visible');
    });
  });

  describe('Audit Logs', () => {
    it('should display audit logs', () => {
      cy.get('[data-testid="menu-audit-logs"]').click();
      cy.get('[data-testid="audit-logs-table"]').should('exist');
    });

    it('should filter audit logs by user', () => {
      cy.get('[data-testid="menu-audit-logs"]').click();
      cy.get('[data-testid="user-filter"]').click();
      cy.get('[data-testid="filter-option"]').click();
      cy.get('[data-testid="audit-logs-table"]').should('exist');
    });

    it('should filter audit logs by action', () => {
      cy.get('[data-testid="menu-audit-logs"]').click();
      cy.get('[data-testid="action-filter"]').click();
      cy.get('[data-testid="action-create"]').click();
      cy.get('[data-testid="audit-logs-table"]').should('exist');
    });

    it('should view audit log details', () => {
      cy.get('[data-testid="menu-audit-logs"]').click();
      cy.get('[data-testid="audit-logs-table"] tbody tr:first').click();
      cy.get('[data-testid="audit-detail-modal"]').should('be.visible');
    });
  });

  describe('Database Maintenance', () => {
    it('should display database stats', () => {
      cy.get('[data-testid="menu-maintenance"]').click();
      cy.get('[data-testid="database-size"]').should('be.visible');
      cy.get('[data-testid="backup-status"]').should('be.visible');
    });

    it('should create database backup', () => {
      cy.get('[data-testid="menu-maintenance"]').click();
      cy.get('[data-testid="backup-button"]').click();
      cy.get('[data-testid="backup-progress"]').should('be.visible');
      cy.get('[data-testid="success-notification"]').should('be.visible');
    });

    it('should clear cache', () => {
      cy.get('[data-testid="menu-maintenance"]').click();
      cy.get('[data-testid="clear-cache-button"]').click();
      cy.get('[data-testid="confirm-button"]').click();
      cy.get('[data-testid="success-notification"]').should('be.visible');
    });
  });

  describe('Feature Flags', () => {
    it('should display feature flags', () => {
      cy.get('[data-testid="menu-features"]').click();
      cy.get('[data-testid="features-list"]').should('exist');
    });

    it('should toggle feature flag', () => {
      cy.get('[data-testid="menu-features"]').click();
      cy.get('[data-testid="feature-toggle-pwa"]').click();
      cy.get('[data-testid="success-notification"]').should('be.visible');
    });
  });
});
