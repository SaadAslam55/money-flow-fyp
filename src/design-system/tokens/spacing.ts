/**
 * Spacing Design Tokens
 * 4px base unit system for consistent spacing
 */

export const spacing = {
  // Base spacing scale (4px increments)
  0: '0',
  px: '1px',
  0.5: '0.125rem', // 2px
  1: '0.25rem', // 4px
  1.5: '0.375rem', // 6px
  2: '0.5rem', // 8px
  2.5: '0.625rem', // 10px
  3: '0.75rem', // 12px
  3.5: '0.875rem', // 14px
  4: '1rem', // 16px
  5: '1.25rem', // 20px
  6: '1.5rem', // 24px
  7: '1.75rem', // 28px
  8: '2rem', // 32px
  9: '2.25rem', // 36px
  10: '2.5rem', // 40px
  11: '2.75rem', // 44px
  12: '3rem', // 48px
  14: '3.5rem', // 56px
  16: '4rem', // 64px
  18: '4.5rem', // 72px
  20: '5rem', // 80px
  24: '6rem', // 96px
  28: '7rem', // 112px
  32: '8rem', // 128px
  36: '9rem', // 144px
  40: '10rem', // 160px
  44: '11rem', // 176px
  48: '12rem', // 192px
  52: '13rem', // 208px
  56: '14rem', // 224px
  60: '15rem', // 240px
  64: '16rem', // 256px
  72: '18rem', // 288px
  80: '20rem', // 320px
  96: '24rem', // 384px

  // Semantic spacing
  semantic: {
    // Component spacing
    componentXs: '0.25rem', // 4px
    componentSm: '0.5rem', // 8px
    componentMd: '1rem', // 16px
    componentLg: '1.5rem', // 24px
    componentXl: '2rem', // 32px

    // Layout spacing
    layoutXs: '1rem', // 16px
    layoutSm: '1.5rem', // 24px
    layoutMd: '2rem', // 32px
    layoutLg: '3rem', // 48px
    layoutXl: '4rem', // 64px
    layout2xl: '6rem', // 96px
    layout3xl: '8rem', // 128px

    // Section spacing
    sectionXs: '2rem', // 32px
    sectionSm: '3rem', // 48px
    sectionMd: '4rem', // 64px
    sectionLg: '6rem', // 96px
    sectionXl: '8rem', // 128px

    // Container padding
    containerXs: '1rem', // 16px - Mobile
    containerSm: '1.5rem', // 24px - Tablet
    containerMd: '2rem', // 32px - Desktop
    containerLg: '3rem', // 48px - Large desktop
    containerXl: '4rem', // 64px - Extra large
  },

  // Gap spacing (for flex/grid)
  gap: {
    0: '0',
    1: '0.25rem', // 4px
    2: '0.5rem', // 8px
    3: '0.75rem', // 12px
    4: '1rem', // 16px
    5: '1.25rem', // 20px
    6: '1.5rem', // 24px
    8: '2rem', // 32px
    10: '2.5rem', // 40px
    12: '3rem', // 48px
    16: '4rem', // 64px
  },
} as const;

export type Spacing = typeof spacing;
