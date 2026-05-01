/**
 * Vite Configuration
 *
 * Production-ready Vite configuration for Money Flow application.
 * Includes optimized build settings, code splitting, and development server configuration.
 *
 * @module ViteConfig
 *
 * @example
 * ```bash
 * # Development
 * npm run dev
 *
 * # Production build
 * npm run build
 *
 * # Preview production build
 * npm run preview
 * ```
 *
 * @see {@link https://vitejs.dev/config/ | Vite Configuration}
 */

import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';
// PWA plugin (optional - uncomment if you want PWA features)
// import { VitePWA } from 'vite-plugin-pwa';

/**
 * Vite configuration with production optimizations
 */
export default defineConfig({
  plugins: [
    // React plugin with Fast Refresh (enabled by default)
    react({
      // Include all React component files
      include: '**/*.{jsx,tsx}',
      // Babel options for JSX transformation
      babel: {
        plugins: [],
      },
    }),

    // PWA Plugin (optional - uncomment to enable)
    // VitePWA({
    //   registerType: 'autoUpdate',
    //   includeAssets: ['favicon.ico', 'apple-touch-icon.png', 'mask-icon.svg'],
    //   manifest: {
    //     name: 'Money Flow',
    //     short_name: 'MoneyFlow',
    //     description: 'Business Management Platform',
    //     theme_color: '#6366F1',
    //     icons: [
    //       {
    //         src: 'pwa-192x192.png',
    //         sizes: '192x192',
    //         type: 'image/png',
    //       },
    //       {
    //         src: 'pwa-512x512.png',
    //         sizes: '512x512',
    //         type: 'image/png',
    //       },
    //     ],
    //   },
    // }),
  ],

  // Path resolution
  // Matches TypeScript path mappings in tsconfig.json
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

  // Development server configuration
  server: {
    port: 5173,
    host: true, // Listen on all addresses
    strictPort: false, // Try next available port if 5173 is taken
    open: false, // Don't auto-open browser
    cors: true, // Enable CORS
    // Proxy configuration for API calls if needed
    proxy: {
      '/api': {
        target: process.env.VITE_API_URL || 'http://localhost:3000',
        changeOrigin: true,
        secure: false,
      },
    },
  },

  // Preview server configuration (for production preview)
  preview: {
    port: 4173,
    host: true,
    strictPort: false,
  },

  // Build configuration
  build: {
    // Output directory
    outDir: 'dist',
    // Assets directory (relative to outDir)
    assetsDir: 'assets',
    // Generate source maps (set to false in production for smaller builds)
    // Use 'hidden' for source maps without references, or false to disable
    sourcemap: process.env.NODE_ENV === 'production' ? 'hidden' : true,
    // Minification: 'esbuild' (fast) or 'terser' (smaller, slower)
    minify: 'esbuild',
    // Minify CSS
    cssMinify: true,
    // Target modern browsers (ES2020+)
    target: 'es2020',
    // Empty output directory before build
    emptyOutDir: true,
    // Rollup-specific options
    rollupOptions: {
      output: {
        // Disabled manual chunking to fix circular dependency issues
        // Let Vite handle automatic chunking
        // manualChunks: undefined,
        // Optimized file naming with content hashes for cache busting
        chunkFileNames: 'assets/js/[name]-[hash].js',
        entryFileNames: 'assets/js/[name]-[hash].js',
        assetFileNames: (assetInfo) => {
          // Organize assets by type
          if (!assetInfo.name) {
            return `assets/[ext]/[name]-[hash].[ext]`;
          }
          const info = assetInfo.name.split('.');
          const ext = info[info.length - 1] || '';
          if (/png|jpe?g|svg|gif|tiff|bmp|ico/i.test(ext)) {
            return `assets/images/[name]-[hash].[ext]`;
          }
          if (/woff2?|eot|ttf|otf/i.test(ext)) {
            return `assets/fonts/[name]-[hash].[ext]`;
          }
          return `assets/[ext]/[name]-[hash].[ext]`;
        },
        // Compact output for smaller bundle size
        compact: true,
      },
    },
    // Chunk size warning limit (in KB)
    chunkSizeWarningLimit: 1000, // 1MB
    // Report compressed size (gzip)
    reportCompressedSize: true,
    // CSS code splitting
    cssCodeSplit: true,
    // Build library mode (false for app)
    lib: false,
  },

  // Optimize dependencies (pre-bundling)
  // Dependencies listed here will be pre-bundled for faster dev server startup
  optimizeDeps: {
    include: [
      'react',
      'react-dom',
      'react-router-dom',
      '@tanstack/react-query',
      'react-hook-form',
      '@hookform/resolvers',
      'zod',
      '@supabase/supabase-js',
      'zustand',
      'sonner',
      'lucide-react',
      'date-fns',
    ],
    // Exclude dependencies that shouldn't be pre-bundled
    exclude: [],
    // Force optimization of these dependencies
    force: false,
  },

  // Environment variables
  envPrefix: 'VITE_', // Only expose env vars prefixed with VITE_

  // CSS configuration
  css: {
    // Source maps for CSS in development
    devSourcemap: true,
    // PostCSS configuration file
    postcss: './postcss.config.js',
    // CSS modules configuration
    modules: {
      // Generate scoped class names
      localsConvention: 'camelCase',
      // Class name generation
      generateScopedName:
        process.env.NODE_ENV === 'production'
          ? '[hash:base64:5]'
          : '[name]__[local]___[hash:base64:5]',
    },
  },

  // Worker configuration for Web Workers
  worker: {
    // Format for worker files
    format: 'es',
    // Plugins to use for workers
    plugins: () => [react()],
    // Rollup options for workers
    rollupOptions: {
      output: {
        // Worker chunk file naming
        entryFileNames: 'assets/workers/[name]-[hash].js',
        chunkFileNames: 'assets/workers/[name]-[hash].js',
      },
    },
  },

  // Log level: 'info' | 'warn' | 'error' | 'silent'
  logLevel: process.env.NODE_ENV === 'production' ? 'warn' : 'info',

  // Clear screen on startup
  clearScreen: true,
});
