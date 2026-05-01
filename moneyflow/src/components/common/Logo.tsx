// src/components/common/Logo.tsx
/**
 * Money Flow Logo Component
 * Professional logo with flowing wave design representing money movement
 *
 * Design Philosophy:
 * - Flow: Smooth curves representing seamless money movement
 * - Growth: Upward direction showing business success
 * - Modern: 2025-ready with gradient trends and minimalism
 * - Professional: Trustworthy for financial software
 * - Versatile: Works on dark/light backgrounds, any size
 *
 * Color Palette:
 * - Primary: Electric Blue (#2563eb) - trust, stability, finance
 * - Secondary: Cyan (#06b6d4) - innovation, flow, technology
 * - Accent: Emerald Green (#10b981) - growth, profit, success
 * - Dark Mode: Deep Navy (#1e293b) with cyan highlights
 */

import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

// Color constants based on design spec
const COLORS = {
  primary: '#2563eb', // Electric Blue
  secondary: '#06b6d4', // Cyan
  accent: '#10b981', // Emerald Green
  darkNavy: '#1e293b', // Deep Navy
};

interface LogoProps {
  /** Layout variant */
  variant?: 'horizontal' | 'vertical' | 'icon';
  /** Size preset */
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  /** Show text alongside icon */
  showText?: boolean;
  /** Enable animations */
  animated?: boolean;
  /** Use monochrome version */
  monochrome?: boolean;
  /** Monochrome color (for light/dark backgrounds) */
  monochromeColor?: 'light' | 'dark';
  /** Additional CSS classes */
  className?: string;
  /** Collapsed state (for sidebar) */
  collapsed?: boolean;
}

const sizeConfig = {
  xs: { icon: 20, money: 'text-sm', flow: 'text-[10px]', gap: 'gap-1' },
  sm: { icon: 28, money: 'text-base', flow: 'text-xs', gap: 'gap-1.5' },
  md: { icon: 36, money: 'text-xl', flow: 'text-sm', gap: 'gap-2' },
  lg: { icon: 48, money: 'text-2xl', flow: 'text-base', gap: 'gap-2.5' },
  xl: { icon: 64, money: 'text-4xl', flow: 'text-xl', gap: 'gap-3' },
};

/**
 * Flowing Wave Logo Icon
 * Represents continuous money flow with upward growth
 */
function LogoSymbol({
  size = 36,
  animated = true,
  monochrome = false,
  monochromeColor = 'light',
}: {
  size?: number;
  animated?: boolean;
  monochrome?: boolean;
  monochromeColor?: 'light' | 'dark';
}) {
  const gradientId = `logo-gradient-${Math.random().toString(36).substr(2, 9)}`;

  // Animation for the flowing wave
  const waveAnimation = {
    initial: { pathLength: 0, opacity: 0 },
    animate: {
      pathLength: 1,
      opacity: 1,
      transition: { duration: 1.2, ease: 'easeOut' },
    },
  };

  // Floating currency symbols animation
  const floatAnimation = {
    animate: {
      y: [-2, -8, -2],
      opacity: [0.4, 1, 0.4],
      transition: {
        duration: 2.5,
        repeat: Infinity,
        ease: 'easeInOut',
      },
    },
  };

  const monoColor = monochromeColor === 'light' ? '#ffffff' : '#1e293b';

  return (
    <motion.div
      className="relative flex-shrink-0"
      style={{ width: size, height: size }}
      whileHover={animated ? { scale: 1.05 } : undefined}
      transition={{ duration: 0.2 }}
    >
      {/* Glow effect */}
      {animated && !monochrome && (
        <motion.div
          className="absolute inset-0 rounded-xl"
          style={{
            background: `linear-gradient(135deg, ${COLORS.primary}40, ${COLORS.secondary}40)`,
            filter: 'blur(8px)',
          }}
          animate={{
            opacity: [0.5, 0.8, 0.5],
            scale: [1, 1.1, 1],
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
      )}

      <svg
        viewBox="0 0 48 48"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="relative z-10"
        style={{ width: size, height: size }}
      >
        {/* Gradient definitions */}
        <defs>
          <linearGradient id={gradientId} x1="0%" y1="100%" x2="100%" y2="0%">
            <stop offset="0%" stopColor={COLORS.primary} />
            <stop offset="50%" stopColor={COLORS.secondary} />
            <stop offset="100%" stopColor={COLORS.accent} />
          </linearGradient>
        </defs>

        {/* Background circle */}
        <circle
          cx="24"
          cy="24"
          r="22"
          fill={monochrome ? 'transparent' : `url(#${gradientId})`}
          stroke={monochrome ? monoColor : 'none'}
          strokeWidth={monochrome ? 2 : 0}
        />

        {/* Inner highlight */}
        {!monochrome && (
          <circle
            cx="24"
            cy="24"
            r="20"
            fill="none"
            stroke="white"
            strokeWidth="0.5"
            opacity="0.3"
          />
        )}

        {/* Main flowing wave - represents money flow */}
        <motion.path
          d="M10 32 C14 32, 16 24, 20 24 C24 24, 24 28, 28 28 C32 28, 34 20, 38 20"
          stroke={monochrome ? monoColor : 'white'}
          strokeWidth="3"
          strokeLinecap="round"
          fill="none"
          variants={animated ? waveAnimation : undefined}
          initial={animated ? 'initial' : undefined}
          animate={animated ? 'animate' : undefined}
        />

        {/* Secondary wave - adds depth */}
        <motion.path
          d="M10 26 C14 26, 16 18, 20 18 C24 18, 24 22, 28 22 C32 22, 34 14, 38 14"
          stroke={monochrome ? monoColor : 'white'}
          strokeWidth="2"
          strokeLinecap="round"
          fill="none"
          opacity="0.6"
          variants={animated ? waveAnimation : undefined}
          initial={animated ? 'initial' : undefined}
          animate={animated ? 'animate' : undefined}
        />

        {/* Upward arrow/growth indicator */}
        <motion.path
          d="M36 18 L38 14 L40 18"
          stroke={monochrome ? monoColor : 'white'}
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
          variants={animated ? waveAnimation : undefined}
          initial={animated ? 'initial' : undefined}
          animate={animated ? 'animate' : undefined}
        />

        {/* Currency symbol (₨) - floating */}
        {animated && !monochrome && (
          <motion.text
            x="18"
            y="38"
            fill="white"
            fontSize="8"
            fontWeight="bold"
            opacity="0.8"
            variants={floatAnimation}
            animate="animate"
          >
            ₨
          </motion.text>
        )}
      </svg>
    </motion.div>
  );
}

/**
 * Logo Text Component
 * "MONEY" bold, "FLOW" lighter with italic slant
 */
function LogoText({
  size = 'md',
  monochrome = false,
  monochromeColor = 'light',
  vertical = false,
}: {
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  monochrome?: boolean;
  monochromeColor?: 'light' | 'dark';
  vertical?: boolean;
}) {
  const config = sizeConfig[size];
  const monoColor = monochromeColor === 'light' ? 'text-white' : 'text-slate-800';

  return (
    <div className={cn('flex', vertical ? 'flex-col items-center' : 'flex-col items-start')}>
      {/* MONEY - Bold */}
      <span
        className={cn(
          config.money,
          'font-bold leading-none tracking-tight',
          monochrome
            ? monoColor
            : 'bg-gradient-to-r from-blue-500 via-cyan-400 to-emerald-400 bg-clip-text text-transparent'
        )}
      >
        MONEY
      </span>
      {/* FLOW - Lighter with italic */}
      <span
        className={cn(
          config.flow,
          'mt-0.5 font-medium italic leading-none tracking-widest',
          monochrome
            ? cn(monoColor, 'opacity-80')
            : 'bg-gradient-to-r from-cyan-400 to-emerald-400 bg-clip-text text-transparent'
        )}
      >
        FLOW
      </span>
    </div>
  );
}

/**
 * Main Logo Component
 * Supports horizontal, vertical, and icon-only layouts
 */
export function Logo({
  variant = 'horizontal',
  size = 'md',
  showText = true,
  animated = true,
  monochrome = false,
  monochromeColor = 'light',
  className,
  collapsed = false,
}: LogoProps) {
  const config = sizeConfig[size];
  const effectiveShowText = showText && !collapsed && variant !== 'icon';

  // Animation variants
  const containerVariants = {
    initial: { opacity: 0 },
    animate: {
      opacity: 1,
      transition: { duration: 0.3 },
    },
  };

  const textVariants = {
    initial: { opacity: 0, x: -10 },
    animate: {
      opacity: 1,
      x: 0,
      transition: { duration: 0.3, delay: 0.1 },
    },
  };

  if (variant === 'icon' || collapsed) {
    return (
      <motion.div
        className={cn('inline-flex', className)}
        variants={containerVariants}
        initial="initial"
        animate="animate"
      >
        <LogoSymbol
          size={config.icon}
          animated={animated}
          monochrome={monochrome}
          monochromeColor={monochromeColor}
        />
      </motion.div>
    );
  }

  if (variant === 'vertical') {
    return (
      <motion.div
        className={cn('inline-flex flex-col items-center', config.gap, className)}
        variants={containerVariants}
        initial="initial"
        animate="animate"
      >
        <LogoSymbol
          size={config.icon}
          animated={animated}
          monochrome={monochrome}
          monochromeColor={monochromeColor}
        />
        {effectiveShowText && (
          <motion.div variants={textVariants}>
            <LogoText
              size={size}
              monochrome={monochrome}
              monochromeColor={monochromeColor}
              vertical
            />
          </motion.div>
        )}
      </motion.div>
    );
  }

  // Horizontal (default)
  return (
    <motion.div
      className={cn('inline-flex items-center', config.gap, className)}
      variants={containerVariants}
      initial="initial"
      animate="animate"
    >
      <LogoSymbol
        size={config.icon}
        animated={animated}
        monochrome={monochrome}
        monochromeColor={monochromeColor}
      />
      {effectiveShowText && (
        <motion.div variants={textVariants} initial="initial" animate="animate">
          <LogoText size={size} monochrome={monochrome} monochromeColor={monochromeColor} />
        </motion.div>
      )}
    </motion.div>
  );
}

/**
 * Logo Loader - For splash screens and loading states
 */
export function LogoLoader({ size = 'lg' }: { size?: 'md' | 'lg' | 'xl' }) {
  return (
    <div className="flex flex-col items-center justify-center gap-6">
      <Logo variant="vertical" size={size} animated={true} />

      {/* Loading dots */}
      <motion.div
        className="flex gap-1.5"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
      >
        {[0, 1, 2].map((i) => (
          <motion.div
            key={i}
            className="h-2 w-2 rounded-full"
            style={{ backgroundColor: COLORS.secondary }}
            animate={{
              scale: [1, 1.3, 1],
              opacity: [0.4, 1, 0.4],
            }}
            transition={{
              duration: 1,
              repeat: Infinity,
              delay: i * 0.15,
              ease: 'easeInOut',
            }}
          />
        ))}
      </motion.div>
    </div>
  );
}

/**
 * Logo Icon - Compact version for favicons and small spaces
 */
export function LogoIcon({
  size = 32,
  animated = false,
  monochrome = false,
  monochromeColor = 'light',
}: {
  size?: number;
  animated?: boolean;
  monochrome?: boolean;
  monochromeColor?: 'light' | 'dark';
}) {
  return (
    <LogoSymbol
      size={size}
      animated={animated}
      monochrome={monochrome}
      monochromeColor={monochromeColor}
    />
  );
}

/**
 * Logo with Tagline - For marketing and about pages
 */
export function LogoWithTagline({
  size = 'lg',
  tagline = 'Financial Management Made Simple',
}: {
  size?: 'md' | 'lg' | 'xl';
  tagline?: string;
}) {
  return (
    <div className="flex flex-col items-center gap-4">
      <Logo variant="vertical" size={size} animated={true} />
      <motion.p
        className="text-center text-sm tracking-wide text-slate-400"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
      >
        {tagline}
      </motion.p>
    </div>
  );
}
