/**
 * Semantic Color Tokens - Purpose-based colors
 *
 * These colors should be used in components based on their semantic meaning.
 * They map to primitive colors and support light/dark modes.
 */

import { primitiveColors } from './primitives';

export const semanticColors = {
  // Primary brand colors
  primary: {
    DEFAULT: primitiveColors.blue[500],
    light: primitiveColors.blue[400],
    dark: primitiveColors.blue[600],
    foreground: primitiveColors.white,
  },

  // Secondary colors
  secondary: {
    DEFAULT: primitiveColors.slate[100],
    light: primitiveColors.slate[50],
    dark: primitiveColors.slate[200],
    foreground: primitiveColors.slate[900],
  },

  // Accent colors
  accent: {
    DEFAULT: primitiveColors.purple[500],
    light: primitiveColors.purple[400],
    dark: primitiveColors.purple[600],
    foreground: primitiveColors.white,
  },

  // Success states
  success: {
    DEFAULT: primitiveColors.green[500],
    light: primitiveColors.green[400],
    dark: primitiveColors.green[600],
    foreground: primitiveColors.white,
    background: primitiveColors.green[50],
    border: primitiveColors.green[200],
  },

  // Warning states
  warning: {
    DEFAULT: primitiveColors.amber[500],
    light: primitiveColors.amber[400],
    dark: primitiveColors.amber[600],
    foreground: primitiveColors.white,
    background: primitiveColors.amber[50],
    border: primitiveColors.amber[200],
  },

  // Error/Destructive states
  destructive: {
    DEFAULT: primitiveColors.red[500],
    light: primitiveColors.red[400],
    dark: primitiveColors.red[600],
    foreground: primitiveColors.white,
    background: primitiveColors.red[50],
    border: primitiveColors.red[200],
  },

  // Info states
  info: {
    DEFAULT: primitiveColors.cyan[500],
    light: primitiveColors.cyan[400],
    dark: primitiveColors.cyan[600],
    foreground: primitiveColors.white,
    background: primitiveColors.cyan[50],
    border: primitiveColors.cyan[200],
  },

  // Muted/Subtle
  muted: {
    DEFAULT: primitiveColors.slate[100],
    foreground: primitiveColors.slate[600],
  },

  // Background
  background: {
    DEFAULT: primitiveColors.white,
    subtle: primitiveColors.slate[50],
    muted: primitiveColors.slate[100],
  },

  // Foreground/Text
  foreground: {
    DEFAULT: primitiveColors.slate[900],
    subtle: primitiveColors.slate[600],
    muted: primitiveColors.slate[500],
  },

  // Border
  border: {
    DEFAULT: primitiveColors.slate[200],
    light: primitiveColors.slate[100],
    dark: primitiveColors.slate[300],
  },

  // Input
  input: {
    DEFAULT: primitiveColors.slate[200],
    background: primitiveColors.white,
    foreground: primitiveColors.slate[900],
  },

  // Ring (focus indicator)
  ring: {
    DEFAULT: primitiveColors.blue[500],
    offset: primitiveColors.white,
  },

  // Card
  card: {
    DEFAULT: primitiveColors.white,
    foreground: primitiveColors.slate[900],
    border: primitiveColors.slate[200],
  },

  // Popover
  popover: {
    DEFAULT: primitiveColors.white,
    foreground: primitiveColors.slate[900],
    border: primitiveColors.slate[200],
  },
} as const;

// Dark mode semantic colors
export const darkSemanticColors = {
  primary: {
    DEFAULT: primitiveColors.blue[500],
    light: primitiveColors.blue[400],
    dark: primitiveColors.blue[600],
    foreground: primitiveColors.white,
  },

  secondary: {
    DEFAULT: primitiveColors.slate[800],
    light: primitiveColors.slate[700],
    dark: primitiveColors.slate[900],
    foreground: primitiveColors.white,
  },

  accent: {
    DEFAULT: primitiveColors.purple[500],
    light: primitiveColors.purple[400],
    dark: primitiveColors.purple[600],
    foreground: primitiveColors.white,
  },

  success: {
    DEFAULT: primitiveColors.green[500],
    light: primitiveColors.green[400],
    dark: primitiveColors.green[600],
    foreground: primitiveColors.white,
    background: primitiveColors.green[950],
    border: primitiveColors.green[800],
  },

  warning: {
    DEFAULT: primitiveColors.amber[500],
    light: primitiveColors.amber[400],
    dark: primitiveColors.amber[600],
    foreground: primitiveColors.black,
    background: primitiveColors.amber[950],
    border: primitiveColors.amber[800],
  },

  destructive: {
    DEFAULT: primitiveColors.red[500],
    light: primitiveColors.red[400],
    dark: primitiveColors.red[600],
    foreground: primitiveColors.white,
    background: primitiveColors.red[950],
    border: primitiveColors.red[800],
  },

  info: {
    DEFAULT: primitiveColors.cyan[500],
    light: primitiveColors.cyan[400],
    dark: primitiveColors.cyan[600],
    foreground: primitiveColors.white,
    background: primitiveColors.cyan[950],
    border: primitiveColors.cyan[800],
  },

  muted: {
    DEFAULT: primitiveColors.slate[800],
    foreground: primitiveColors.slate[400],
  },

  background: {
    DEFAULT: primitiveColors.black,
    subtle: primitiveColors.slate[950],
    muted: primitiveColors.slate[900],
  },

  foreground: {
    DEFAULT: primitiveColors.white,
    subtle: primitiveColors.slate[300],
    muted: primitiveColors.slate[400],
  },

  border: {
    DEFAULT: primitiveColors.slate[800],
    light: primitiveColors.slate[900],
    dark: primitiveColors.slate[700],
  },

  input: {
    DEFAULT: primitiveColors.slate[800],
    background: primitiveColors.slate[950],
    foreground: primitiveColors.white,
  },

  ring: {
    DEFAULT: primitiveColors.blue[500],
    offset: primitiveColors.black,
  },

  card: {
    DEFAULT: primitiveColors.slate[950],
    foreground: primitiveColors.white,
    border: primitiveColors.slate[800],
  },

  popover: {
    DEFAULT: primitiveColors.slate[950],
    foreground: primitiveColors.white,
    border: primitiveColors.slate[800],
  },
} as const;

export type SemanticColor = typeof semanticColors;
export type DarkSemanticColor = typeof darkSemanticColors;
