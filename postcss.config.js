/**
 * PostCSS Configuration
 *
 * Production-ready PostCSS configuration for processing CSS.
 * Handles Tailwind CSS processing and autoprefixing for browser compatibility.
 *
 * @module PostCSSConfig
 *
 * @example
 * ```javascript
 * // PostCSS processes CSS in this order:
 * // 1. Tailwind CSS - converts Tailwind directives to CSS
 * // 2. Autoprefixer - adds vendor prefixes for browser compatibility
 * ```
 *
 * @see {@link https://postcss.org/ | PostCSS Documentation}
 * @see {@link https://github.com/tailwindlabs/tailwindcss | Tailwind CSS}
 * @see {@link https://github.com/postcss/autoprefixer | Autoprefixer}
 */

export default {
  plugins: {
    // Tailwind CSS plugin
    // Processes @tailwind directives and generates utility classes
    tailwindcss: {
      // Tailwind config path (defaults to tailwind.config.js)
      config: './tailwind.config.js',
    },

    // Autoprefixer plugin
    // Automatically adds vendor prefixes based on browser support
    autoprefixer: {
      // Browser support configuration
      // Uses browserslist from package.json or .browserslistrc
      // Override if needed:
      // overrideBrowserslist: ['> 1%', 'last 2 versions', 'not dead'],
    },
  },

  // Source maps configuration
  // Enable source maps for better debugging in development
  // In production, source maps are controlled by Vite build config
  map: process.env.NODE_ENV === 'development' ? { inline: false } : false,
};
