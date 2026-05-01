/**
 * Authentication E2E Tests
 *
 * Tests for login, logout, signup, and password reset functionality
 */
describe('Authentication Tests', () => {
    const testUser = {
        email: Cypress.env('testUser').email,
        password: Cypress.env('testUser').password,
        firstName: Cypress.env('testUser').firstName,
        lastName: Cypress.env('testUser').lastName,
    };
    beforeEach(() => {
        cy.visit('/auth/login');
    });
    describe('Login', () => {
        it('should display login page', () => {
            cy.get('h1').should('contain', 'Login');
            cy.get('input[type="email"]').should('exist');
            cy.get('input[type="password"]').should('exist');
            cy.get('button[type="submit"]').should('exist');
        });
        it('should login with valid credentials', () => {
            cy.login(testUser.email, testUser.password);
            cy.url().should('include', '/dashboard');
        });
        it('should show error with invalid email', () => {
            cy.get('input[type="email"]').type('invalid-email');
            cy.get('input[type="password"]').type('password123');
            cy.get('button[type="submit"]').click();
            cy.get('[data-testid="error-message"]').should('contain', 'Invalid email');
        });
        it('should show error with wrong password', () => {
            cy.get('input[type="email"]').type(testUser.email);
            cy.get('input[type="password"]').type('wrongpassword');
            cy.get('button[type="submit"]').click();
            cy.get('[data-testid="error-message"]').should('contain', 'Invalid credentials');
        });
        it('should show error with empty fields', () => {
            cy.get('button[type="submit"]').click();
            cy.get('[data-testid="error-message"]').should('be.visible');
        });
        it('should redirect to login if not authenticated', () => {
            cy.visit('/dashboard');
            cy.url().should('include', '/auth/login');
        });
    });
    describe('Signup', () => {
        beforeEach(() => {
            cy.visit('/auth/signup');
        });
        it('should display signup page', () => {
            cy.get('h1').should('contain', 'Sign Up');
            cy.get('input[name="firstName"]').should('exist');
            cy.get('input[name="lastName"]').should('exist');
            cy.get('input[name="email"]').should('exist');
            cy.get('input[name="password"]').should('exist');
        });
        it('should signup with valid credentials', () => {
            const newUser = {
                firstName: 'New',
                lastName: 'User',
                email: `newuser-${Date.now()}@example.com`,
                password: 'NewPassword123!',
            };
            cy.register(newUser.firstName, newUser.lastName, newUser.email, newUser.password);
            cy.url().should('include', '/dashboard');
        });
        it('should show validation error for weak password', () => {
            cy.get('input[name="firstName"]').type('Test');
            cy.get('input[name="lastName"]').type('User');
            cy.get('input[name="email"]').type('test@example.com');
            cy.get('input[name="password"]').type('weak');
            cy.get('input[name="confirmPassword"]').type('weak');
            cy.get('button[type="submit"]').click();
            cy.get('[data-testid="error-message"]').should('be.visible');
        });
        it('should show error if passwords do not match', () => {
            cy.get('input[name="firstName"]').type('Test');
            cy.get('input[name="lastName"]').type('User');
            cy.get('input[name="email"]').type(`test-${Date.now()}@example.com`);
            cy.get('input[name="password"]').type('Password123!');
            cy.get('input[name="confirmPassword"]').type('DifferentPassword123!');
            cy.get('button[type="submit"]').click();
            cy.get('[data-testid="error-message"]').should('contain', 'Passwords do not match');
        });
    });
    describe('Logout', () => {
        it('should logout successfully', () => {
            cy.login(testUser.email, testUser.password);
            cy.logout();
            cy.url().should('include', '/auth/login');
        });
    });
    describe('Password Reset', () => {
        it('should display forgot password page', () => {
            cy.get('a[href="/auth/forgot-password"]').click();
            cy.get('h1').should('contain', 'Forgot Password');
        });
        it('should send password reset email', () => {
            cy.visit('/auth/forgot-password');
            cy.get('input[type="email"]').type(testUser.email);
            cy.get('button[type="submit"]').click();
            cy.get('[data-testid="success-message"]').should('contain', 'Check your email');
        });
    });
    describe('Two-Factor Authentication', () => {
        it('should enable 2FA in settings', () => {
            cy.login(testUser.email, testUser.password);
            cy.visit('/settings/security');
            cy.get('[data-testid="enable-2fa-button"]').click();
            cy.get('[data-testid="2fa-setup-modal"]').should('be.visible');
        });
    });
});
