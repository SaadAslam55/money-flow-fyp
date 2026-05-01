/**
 * Base Cypress Configuration
 *
 * Shared configuration for all Cypress test environments
 * Contains core settings, plugins, and environment variables
 */

// @ts-expect-error - cypress package not installed, but types are declared globally
import { defineConfig } from 'cypress';

export default defineConfig({
  projectId: 'moneyflow-e2e',

  // Reporter configuration
  reporter: 'spec',
  reporterOptions: {
    mochaFile: 'cypress/results/junit-[hash].xml',
    toConsole: true,
  },

  // Test files pattern
  e2e: {
    baseUrl: 'http://localhost:5173',
    specPattern: 'cypress/e2e/**/*.cy.{js,jsx,ts,tsx}',
    supportFile: 'cypress/support/e2e.ts',

    // Downloads folder
    downloadsFolder: 'cypress/downloads',

    // Test execution
    testIsolation: true,
    chromeWebSecurity: false,

    // Browser configuration
    browsers: [
      {
        name: 'chrome',
        family: 'chromium',
        channel: 'stable',
        displayName: 'Chrome',
        version: 'stable',
        majorVersion: '120',
        minorVersion: '0',
      },
      {
        name: 'firefox',
        family: 'firefox',
        channel: 'stable',
        displayName: 'Firefox',
        version: 'stable',
        majorVersion: '121',
        minorVersion: '0',
      },
      {
        name: 'edge',
        family: 'chromium',
        channel: 'stable',
        displayName: 'Edge',
        version: 'stable',
        majorVersion: '121',
        minorVersion: '0',
      },
    ],

    // Setup node events
    setupNodeEvents(on: any, config: any) {
      // Load environment variables
      const envConfig = require('./env.json');
      config.env = {
        ...config.env,
        ...envConfig,
      };

      // Task: Login
      on('task', {
        login({ email, password }: { email: any; password: any }) {
          // This would be called from tests
          cy.visit('http://localhost:5173/auth/login');
          cy.get('input[type="email"]').type(email);
          cy.get('input[type="password"]').type(password);
          cy.get('button[type="submit"]').click();
          cy.url().should('include', '/dashboard');
          return null;
        },

        // Task: API Request (for test data setup)
        async apiRequest({
          method,
          path,
          data,
          token,
        }: {
          method: any;
          path: any;
          data: any;
          token: any;
        }) {
          const baseURL = config.baseUrl || 'http://localhost:5173';
          const response = await fetch(`${baseURL}${path}`, {
            method,
            headers: {
              'Content-Type': 'application/json',
              ...(token && { Authorization: `Bearer ${token}` }),
            },
            body: data ? JSON.stringify(data) : undefined,
          });
          return response.json();
        },

        // Task: Database Seed
        async seedDatabase() {
          // Add test data to database
          console.log('Seeding database with test data...');
          return null;
        },

        // Task: Clear Database
        async clearDatabase() {
          // Clear test data from database
          console.log('Clearing database...');
          return null;
        },
      });

      return config;
    },
  },

  // Component testing
  component: {
    specPattern: 'src/**/*.cy.{js,jsx,ts,tsx}',
    supportFile: 'cypress/support/component.ts',
    devServer: {
      framework: 'react',
      bundler: 'vite',
    },
  },

  // Global settings
  trashAssetsBeforeRuns: true,

  // Viewport
  viewportWidth: 1280,
  viewportHeight: 720,

  // Default commands timeout (in ms)
  defaultCommandTimeout: 10000,
  execTimeout: 60000,
  pageLoadTimeout: 60000,
  requestTimeout: 10000,
  responseTimeout: 10000,

  // Animation
  animationDistanceThreshold: 5,

  // Logging
  logLevel: 'info',

  // Node events
  numTestsKeptInMemory: 50,

  // Remote debugging
  remote: true,
});
