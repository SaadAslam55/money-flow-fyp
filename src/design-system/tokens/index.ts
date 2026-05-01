/**
 * Design System Tokens - Central Export
 * Modern 2025 design system for MoneyFlow
 */

// Export individual token modules
export * from './colors/primitives';
export * from './colors/semantic';
export * from './typography';
export * from './motion';
export * from './spacing';
export * from './shadows';
export * from './radii';
export * from './breakpoints';

// Import for aggregated object
import { primitiveColors } from './colors/primitives';
import { semanticColors, darkSemanticColors } from './colors/semantic';
import { typography } from './typography';
import { motion } from './motion';
import { spacing } from './spacing';
import { shadows } from './shadows';
import { radii } from './radii';
import { breakpoints, mediaQueries } from './breakpoints';

// Export aggregated design tokens object
export const designTokens = {
  colors: {
    primitives: primitiveColors,
    semantic: semanticColors,
    darkSemantic: darkSemanticColors,
  },
  typography,
  motion,
  spacing,
  shadows,
  radii,
  breakpoints,
  mediaQueries,
} as const;
