/**
 * Settings E2E Tests
 *
 * Tests for user settings, organization settings, and preferences
 */
describe('Settings Tests', () => {
    const testUser = {
        email: Cypress.env('testUser').email,
        password: Cypress.env('testUser').password,
    };
    beforeEach(() => {
        cy.login(testUser.email, testUser.password);
        cy.visit('/settings');
    });
    describe('Settings Navigation', () => {
        it('should display settings page', () => {
            cy.get('h1').should('contain', 'Settings');
            cy.get('[data-testid="settings-sidebar"]').should('exist');
        });
        it('should display settings menu', () => {
            cy.get('[data-testid="menu-profile"]').should('exist');
            cy.get('[data-testid="menu-security"]').should('exist');
            cy.get('[data-testid="menu-organization"]').should('exist');
            cy.get('[data-testid="menu-billing"]').should('exist');
            cy.get('[data-testid="menu-notifications"]').should('exist');
        });
    });
    describe('Profile Settings', () => {
        it('should display profile information', () => {
            cy.get('[data-testid="menu-profile"]').click();
            cy.get('[data-testid="profile-form"]').should('be.visible');
            cy.get('input[name="firstName"]').should('exist');
            cy.get('input[name="lastName"]').should('exist');
            cy.get('input[name="email"]').should('exist');
        });
        it('should update profile', () => {
            cy.get('[data-testid="menu-profile"]').click();
            cy.get('input[name="firstName"]').clear().type('Updated');
            cy.get('[data-testid="save-profile-button"]').click();
            cy.get('[data-testid="success-notification"]').should('be.visible');
        });
        it('should upload avatar', () => {
            cy.get('[data-testid="menu-profile"]').click();
            cy.get('[data-testid="upload-avatar"]').attachFile('avatar.png');
            cy.get('[data-testid="save-avatar-button"]').click();
            cy.get('[data-testid="success-notification"]').should('be.visible');
        });
        it('should validate email field', () => {
            cy.get('[data-testid="menu-profile"]').click();
            cy.get('input[name="email"]').clear().type('invalid-email');
            cy.get('[data-testid="save-profile-button"]').click();
            cy.get('[data-testid="error-message"]').should('contain', 'Valid email');
        });
    });
    describe('Security Settings', () => {
        it('should display security options', () => {
            cy.get('[data-testid="menu-security"]').click();
            cy.get('[data-testid="change-password-section"]').should('be.visible');
            cy.get('[data-testid="two-fa-section"]').should('be.visible');
            cy.get('[data-testid="sessions-section"]').should('be.visible');
        });
        it('should change password', () => {
            cy.get('[data-testid="menu-security"]').click();
            cy.get('[data-testid="change-password-button"]').click();
            cy.get('input[name="currentPassword"]').type(testUser.password);
            cy.get('input[name="newPassword"]').type('NewPassword123!');
            cy.get('input[name="confirmPassword"]').type('NewPassword123!');
            cy.get('[data-testid="save-password-button"]').click();
            cy.get('[data-testid="success-notification"]').should('be.visible');
        });
        it('should enable two-factor authentication', () => {
            cy.get('[data-testid="menu-security"]').click();
            cy.get('[data-testid="enable-2fa-button"]').click();
            cy.get('[data-testid="2fa-setup-modal"]').should('be.visible');
            cy.get('[data-testid="2fa-qr-code"]').should('exist');
        });
        it('should manage active sessions', () => {
            cy.get('[data-testid="menu-security"]').click();
            cy.get('[data-testid="sessions-list"]').should('be.visible');
            cy.get('[data-testid="logout-session-button"]').should('exist');
        });
    });
    describe('Organization Settings', () => {
        it('should display organization info', () => {
            cy.get('[data-testid="menu-organization"]').click();
            cy.get('[data-testid="organization-form"]').should('be.visible');
            cy.get('input[name="organizationName"]').should('exist');
            cy.get('input[name="organizationEmail"]').should('exist');
        });
        it('should update organization', () => {
            cy.get('[data-testid="menu-organization"]').click();
            cy.get('input[name="organizationName"]').clear().type('Updated Org');
            cy.get('[data-testid="save-organization-button"]').click();
            cy.get('[data-testid="success-notification"]').should('be.visible');
        });
        it('should upload organization logo', () => {
            cy.get('[data-testid="menu-organization"]').click();
            cy.get('[data-testid="upload-logo"]').attachFile('logo.png');
            cy.get('[data-testid="save-logo-button"]').click();
            cy.get('[data-testid="success-notification"]').should('be.visible');
        });
        it('should display team members', () => {
            cy.get('[data-testid="menu-organization"]').click();
            cy.get('[data-testid="team-members-section"]').should('be.visible');
            cy.get('[data-testid="team-members-table"]').should('exist');
        });
        it('should invite team member', () => {
            cy.get('[data-testid="menu-organization"]').click();
            cy.get('[data-testid="invite-member-button"]').click();
            cy.get('input[name="memberEmail"]').type('member@example.com');
            cy.get('[data-testid="member-role-select"]').click();
            cy.get('[data-testid="role-manager"]').click();
            cy.get('[data-testid="send-invite-button"]').click();
            cy.get('[data-testid="success-notification"]').should('be.visible');
        });
    });
    describe('Billing Settings', () => {
        it('should display billing info', () => {
            cy.get('[data-testid="menu-billing"]').click();
            cy.get('[data-testid="billing-section"]').should('be.visible');
        });
        it('should display subscription status', () => {
            cy.get('[data-testid="menu-billing"]').click();
            cy.get('[data-testid="subscription-status"]').should('be.visible');
            cy.get('[data-testid="subscription-plan"]').should('be.visible');
        });
        it('should display payment methods', () => {
            cy.get('[data-testid="menu-billing"]').click();
            cy.get('[data-testid="payment-methods-section"]').should('be.visible');
        });
        it('should upgrade subscription', () => {
            cy.get('[data-testid="menu-billing"]').click();
            cy.get('[data-testid="upgrade-button"]').click();
            cy.get('[data-testid="billing-modal"]').should('be.visible');
        });
    });
    describe('Notification Settings', () => {
        it('should display notification preferences', () => {
            cy.get('[data-testid="menu-notifications"]').click();
            cy.get('[data-testid="notifications-form"]').should('be.visible');
        });
        it('should toggle notification types', () => {
            cy.get('[data-testid="menu-notifications"]').click();
            cy.get('[data-testid="notify-invoices-toggle"]').click();
            cy.get('[data-testid="notify-payments-toggle"]').click();
            cy.get('[data-testid="save-notifications-button"]').click();
            cy.get('[data-testid="success-notification"]').should('be.visible');
        });
        it('should set notification frequency', () => {
            cy.get('[data-testid="menu-notifications"]').click();
            cy.get('[data-testid="frequency-select"]').click();
            cy.get('[data-testid="frequency-daily"]').click();
            cy.get('[data-testid="save-notifications-button"]').click();
            cy.get('[data-testid="success-notification"]').should('be.visible');
        });
    });
});
