// src/components/auth/AuthLayout.tsx
import { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FileText, Package, BarChart3, TrendingUp, Shield, Zap } from 'lucide-react';
import { Logo } from '@/components/common/Logo';

interface AuthLayoutProps {
  children: ReactNode;
  title?: string;
  subtitle?: string;
  showFeatures?: boolean;
}

const features = [
  { icon: FileText, title: 'Professional Invoicing', desc: 'Create and send beautiful invoices in minutes', stat: '10x faster' },
  { icon: Package, title: 'Inventory Management', desc: 'Track stock levels and get low stock alerts', stat: 'Zero stockouts' },
  { icon: BarChart3, title: 'Financial Reports', desc: 'Get insights with comprehensive reports', stat: 'Real-time' },
];

const stats = [
  { value: '5,000+', label: 'Businesses' },
  { value: '₨50M+', label: 'Managed' },
  { value: '99.9%', label: 'Uptime' },
];

export function AuthLayout({ children, title, subtitle, showFeatures = true }: AuthLayoutProps) {
  return (
    <div className="flex min-h-screen bg-background">
      {/* Left Side - Premium Branding Panel */}
      <div className="relative hidden flex-col justify-between overflow-hidden lg:flex lg:w-[55%]">
        {/* Deep gradient base */}
        <div className="absolute inset-0 bg-gradient-to-br from-slate-950 via-blue-950 to-slate-900" />

        {/* Mesh gradient overlays */}
        <div className="absolute inset-0">
          <div className="absolute -left-32 -top-32 h-[600px] w-[600px] rounded-full bg-blue-600/20 blur-[120px]" />
          <div className="absolute -bottom-32 -right-32 h-[500px] w-[500px] rounded-full bg-emerald-500/15 blur-[120px]" />
          <div className="absolute left-1/2 top-1/3 h-[400px] w-[400px] -translate-x-1/2 rounded-full bg-cyan-400/10 blur-[100px]" />
        </div>

        {/* Grid pattern overlay */}
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: `linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)`,
            backgroundSize: '60px 60px',
          }}
        />

        {/* Floating orbs */}
        <motion.div
          className="absolute left-[15%] top-[20%] h-3 w-3 rounded-full bg-blue-400/40"
          animate={{ y: [0, -20, 0], opacity: [0.4, 0.8, 0.4] }}
          transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
        />
        <motion.div
          className="absolute left-[70%] top-[60%] h-2 w-2 rounded-full bg-emerald-400/40"
          animate={{ y: [0, -15, 0], opacity: [0.3, 0.7, 0.3] }}
          transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
        />
        <motion.div
          className="absolute left-[40%] top-[80%] h-4 w-4 rounded-full bg-cyan-400/20"
          animate={{ y: [0, -25, 0], opacity: [0.2, 0.5, 0.2] }}
          transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut', delay: 2 }}
        />

        {/* Content */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="relative z-10 p-12"
        >
          <Link to="/" className="inline-block">
            <Logo variant="horizontal" size="lg" showText={true} animated={true} monochrome monochromeColor="light" />
          </Link>
        </motion.div>

        {showFeatures && (
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="relative z-10 flex-1 px-12 text-white"
          >
            <div className="mb-8">
              <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-medium text-blue-300 backdrop-blur-sm">
                <Zap className="h-3 w-3" />
                Trusted by 5,000+ Pakistani businesses
              </div>
            </div>

            <h2 className="mb-4 text-4xl font-bold leading-tight tracking-tight">
              {title ?? (
                <>
                  Manage your business
                  <br />
                  finances with{' '}
                  <span className="bg-gradient-to-r from-blue-400 via-cyan-300 to-emerald-400 bg-clip-text text-transparent">
                    confidence
                  </span>
                </>
              )}
            </h2>
            <p className="mb-10 text-lg text-slate-400">
              {subtitle ?? 'The all-in-one platform for invoicing, inventory, and accounting built for Pakistani businesses.'}
            </p>

            {/* Feature cards */}
            <div className="space-y-4">
              {features.map((feature, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.5, delay: 0.5 + i * 0.12 }}
                  className="group flex items-center gap-4 rounded-xl border border-white/[0.06] bg-white/[0.03] p-4 backdrop-blur-sm transition-all hover:border-white/10 hover:bg-white/[0.06]"
                >
                  <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-blue-500/20 to-cyan-500/20 ring-1 ring-white/10">
                    <feature.icon className="h-5 w-5 text-cyan-400" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-white">{feature.title}</h3>
                    <p className="text-sm text-slate-400">{feature.desc}</p>
                  </div>
                  <span className="rounded-full bg-emerald-500/10 px-2.5 py-1 text-xs font-semibold text-emerald-400 ring-1 ring-emerald-500/20">
                    {feature.stat}
                  </span>
                </motion.div>
              ))}
            </div>

            {/* Stats row */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 1 }}
              className="mt-10 flex gap-8 border-t border-white/[0.06] pt-8"
            >
              {stats.map((stat, i) => (
                <div key={i}>
                  <div className="text-2xl font-bold text-white">{stat.value}</div>
                  <div className="text-xs text-slate-500">{stat.label}</div>
                </div>
              ))}
            </motion.div>
          </motion.div>
        )}

        <div className="relative z-10 flex items-center gap-4 p-12">
          <div className="flex items-center gap-2 text-sm text-slate-500">
            <Shield className="h-4 w-4" />
            <span>256-bit encryption</span>
          </div>
          <span className="text-slate-700">•</span>
          <span className="text-sm text-slate-500">© {new Date().getFullYear()} Money Flow</span>
        </div>
      </div>

      {/* Right Side - Clean Form Area */}
      <div className="relative flex flex-1 items-center justify-center p-6 sm:p-8">
        {/* Subtle dot pattern */}
        <div
          className="absolute inset-0 opacity-[0.015] dark:opacity-[0.03]"
          style={{
            backgroundImage: 'radial-gradient(circle, currentColor 1px, transparent 1px)',
            backgroundSize: '24px 24px',
          }}
        />

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="relative z-10 w-full max-w-[420px]"
        >
          {/* Mobile Logo */}
          <div className="mb-8 flex justify-center lg:hidden">
            <Logo variant="horizontal" size="md" animated={false} />
          </div>

          {children}
        </motion.div>
      </div>
    </div>
  );
}
