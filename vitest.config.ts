/**
 * Vitest Configuration
 *
 * Production-ready Vitest configuration for unit and integration testing.
 * Includes coverage reporting, test isolation, and performance optimizations.
 *
 * @module VitestConfig
 *
 * @example
 * ```bash
 * # Run all tests
 * npm run test
 *
 * # Run tests in watch mode
 * npm run test:watch
 *
 * # Run tests with coverage
 * npm run test:coverage
 *
 * # Run tests with UI
 * npm run test:ui
 * ```
 *
 * @see {@link https://vitest.dev/config/ | Vitest Configuration}
 */

/// <reference types="vitest" />
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import path from 'path';

/**
 * Vitest configuration with comprehensive test settings
 */
export default defineConfig({
  // Plugins (same as vite.config.ts for consistency)
  plugins: [react()],

  // Path resolution (matches vite.config.ts and tsconfig.json)
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@/components': path.resolve(__dirname, './src/components'),
      '@/pages': path.resolve(__dirname, './src/pages'),
      '@/hooks': path.resolve(__dirname, './src/hooks'),
      '@/lib': path.resolve(__dirname, './src/lib'),
      '@/types': path.resolve(__dirname, './src/types'),
      '@/services': path.resolve(__dirname, './src/services'),
      '@/stores': path.resolve(__dirname, './src/stores'),
      '@/config': path.resolve(__dirname, './src/config'),
      '@/constants': path.resolve(__dirname, './src/constants'),
      '@/schemas': path.resolve(__dirname, './src/schemas'),
      '@/contexts': path.resolve(__dirname, './src/contexts'),
      '@/assets': path.resolve(__dirname, './src/assets'),
    },
    // Resolve extensions in order
    extensions: ['.mjs', '.js', '.mts', '.ts', '.jsx', '.tsx', '.json'],
  },

  test: {
    // Enable global test APIs (describe, it, expect, etc.)
    globals: true,
    // Test environment: 'node' | 'jsdom' | 'happy-dom' | 'edge-runtime'
    environment: 'jsdom',

    // Setup files run before each test file
    setupFiles: ['./tests/setup/setupTests.ts'],

    // Test file patterns (include)
    include: [
      '**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}',
      'tests/unit/**/*.{ts,tsx}',
      'tests/integration/**/*.{ts,tsx}',
    ],
    // Test file patterns (exclude)
    exclude: [
      '**/node_modules/**',
      '**/dist/**',
      '**/build/**',
      '**/.{idea,git,cache,output,temp}/**',
      '**/e2e/**', // E2E tests use Playwright
      '**/coverage/**',
      '**/tests/results/**',
    ],

    // Coverage configuration
    coverage: {
      // Coverage provider: 'v8' (faster) or 'istanbul' (more compatible)
      provider: 'v8',
      // Coverage reporters
      reporter: ['text', 'text-summary', 'json', 'html', 'lcov', 'json-summary'],
      // Files to exclude from coverage
      exclude: [
        'node_modules/',
        'tests/',
        '**/*.test.{ts,tsx}',
        '**/*.spec.{ts,tsx}',
        '**/dist/',
        '**/build/',
        '**/*.config.{ts,js}',
        '**/types/**',
        '**/*.d.ts',
        '**/vite-env.d.ts',
        '**/router/**',
        '**/main.tsx',
        '**/App.tsx',
        '**/workers/**', // Web Workers tested separately
        '**/mocks/**',
        '**/setup/**',
      ],
      // Coverage thresholds (minimum percentages)
      thresholds: {
        lines: 70,
        functions: 70,
        branches: 70,
        statements: 70,
      },
      // Reports directory
      reportsDirectory: './tests/results/coverage',
      // Clean coverage results before running
      clean: true,
      // Clean coverage on watch mode
      cleanOnRerun: true,
    },

    // Test timeout (in milliseconds)
    testTimeout: 10000, // 10 seconds

    // Mock configuration
    mockReset: true, // Reset all mocks before each test
    restoreMocks: true, // Restore original implementation after each test
    clearMocks: true, // Clear all mocks before each test

    // Watch mode (disabled by default, use --watch flag)
    watch: false,

    // Reporter configuration
    // 'verbose' - detailed output
    // 'json' - JSON output for CI
    // 'html' - HTML report
    // 'junit' - JUnit XML for CI
    reporters: ['verbose', 'json', 'html'],

    // Output directory for test results
    outputFile: {
      json: './tests/results/test-results.json',
      html: './tests/results/test-results.html',
      junit: './tests/results/junit.xml', // For CI/CD
    },

    // Test isolation
    // Run tests in isolation (each test in its own process)
    isolate: true,

    // Pool options for test execution
    // Use threads for parallel execution (faster)
    pool: 'threads',
    // Pool options (threads configuration)
    // Note: Some pool options may vary by Vitest version
    // poolOptions: {
    //   threads: {
    //     singleThread: false,
    //     maxThreads: 4,
    //     minThreads: 1,
    //   },
    // },

    // Retry failed tests (useful for flaky tests)
    retry: 0, // Disabled by default, set to 1-3 for CI

    // Bail on first failure (useful for CI)
    bail: 0, // 0 = don't bail, >0 = bail after N failures

    // Sequence configuration
    sequence: {
      // Shuffle tests for better detection of test dependencies
      shuffle: false,
      // Concurrent test execution
      concurrent: true,
    },

    // Type checking (can be slow, enable only when needed)
    typecheck: {
      enabled: false, // Use 'tsc --noEmit' instead for type checking
    },
  },
});
