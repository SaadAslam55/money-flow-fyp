/**
 * Cypress Configuration
 *
 * Main configuration file for E2E and integration testing
 * Extends base configuration with environment-specific settings
 */

// @ts-expect-error - cypress package not installed, but types are declared globally
import { defineConfig } from 'cypress';
import baseConfig from './config/cypress.config';

export default defineConfig({
  ...baseConfig,

  // Test execution configuration
  e2e: {
    ...baseConfig.e2e,
    baseUrl: process.env.CYPRESS_BASE_URL || 'http://localhost:5173',
    viewportWidth: 1280,
    viewportHeight: 720,

    // Video recording
    video: !process.env.CI,
    videoCompression: 32,
    videoUploadOnPasses: false,
    videosFolder: 'cypress/videos',

    // Screenshots
    screenshotOnRunFailure: true,
    screenshotsFolder: 'cypress/screenshots',

    // Timeouts
    defaultCommandTimeout: 10000,
    requestTimeout: 10000,
    responseTimeout: 10000,
    taskTimeout: 10000,

    // Retries (for CI only)
    retries: process.env.CI ? 2 : 0,
  },

  component: {
    devServer: {
      framework: 'react',
      bundler: 'vite',
    },
  },
});
