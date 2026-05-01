// src/pages/LandingPage.tsx
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, BarChart3, FileText, Shield, Package, Users, Globe, CheckCircle2, Menu, X, Star, HelpCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Logo, LogoWithTagline } from '@/components/common/Logo';

const features = [
  { icon: FileText, title: 'Smart Invoicing', desc: 'Create professional invoices in seconds with auto-reminders.' },
  { icon: Package, title: 'Inventory Control', desc: 'Real-time stock tracking with low-stock alerts.' },
  { icon: BarChart3, title: 'Financial Reports', desc: 'Beautiful P&L, balance sheet, and cash flow reports.' },
  { icon: Users, title: 'Customer CRM', desc: 'Manage relationships and purchase history.' },
  { icon: Shield, title: 'Bank-Grade Security', desc: '256-bit encryption and role-based access.' },
  { icon: Globe, title: 'Pakistani Payments', desc: 'JazzCash, EasyPaisa, and Raast integration.' },
];

const testimonials = [
  { name: 'Ahmed Khan', business: 'Karachi Electronics', text: 'MoneyFlow transformed our billing process. We now send invoices in seconds instead of hours.', rating: 5 },
  { name: 'Fatima Rizvi', business: 'Lahore Textiles', text: 'The inventory alerts alone have saved us from stockouts multiple times. Highly recommended!', rating: 5 },
  { name: 'Usman Malik', business: 'Islamabad Trading Co.', text: 'Finally, a financial tool built for Pakistani businesses. JazzCash integration is a game changer.', rating: 4 },
];

const pricingPlans = [
  { name: 'Starter', price: 'Free', period: '', features: ['Up to 25 invoices/month', '5 products', '1 user', 'Basic reports'], cta: 'Get Started', highlight: false },
  { name: 'Professional', price: '₨2,499', period: '/month', features: ['Unlimited invoices', '500 products', '5 team members', 'Advanced reports', 'AI insights', 'JazzCash/EasyPaisa'], cta: 'Start Free Trial', highlight: true },
  { name: 'Enterprise', price: '₨9,999', period: '/month', features: ['Everything in Pro', 'Unlimited products & users', 'Custom integrations', 'Priority support', 'Audit logs', 'Raast payments'], cta: 'Contact Sales', highlight: false },
];

const faqs = [
  { q: 'Is my data secure?', a: 'Yes! We use 256-bit encryption and your data is stored on secure servers with daily backups. We never share your information with third parties.' },
  { q: 'Can I try before paying?', a: 'Absolutely. Our 14-day free trial gives you full access to all Professional features. No credit card required.' },
  { q: 'Do you support Pakistani payment methods?', a: 'Yes! We integrate with JazzCash, EasyPaisa, Raast, and all major Pakistani banks for seamless payment collection.' },
  { q: 'Can I export my data?', a: 'Yes, you can export all your data (invoices, customers, products, transactions) at any time in CSV or PDF format.' },
  { q: 'Is there a mobile app?', a: 'Our web app is fully mobile-responsive. A dedicated mobile app for iOS and Android is coming soon.' },
];

export default function LandingPage() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [isYearly, setIsYearly] = useState(false);

  return (
    <div className="min-h-screen bg-background">
      {/* Navbar */}
      <nav className="fixed top-0 z-50 w-full border-b border-border/50 bg-background/80 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <Link to="/"><Logo variant="horizontal" size="md" animated={false} /></Link>
          {/* Desktop nav */}
          <div className="hidden items-center gap-6 md:flex">
            <a href="#features" className="text-sm font-medium text-muted-foreground hover:text-foreground">Features</a>
            <a href="#pricing" className="text-sm font-medium text-muted-foreground hover:text-foreground">Pricing</a>
            <a href="#faq" className="text-sm font-medium text-muted-foreground hover:text-foreground">FAQ</a>
            <Link to="/auth/login" className="text-sm font-medium text-muted-foreground hover:text-foreground">Sign In</Link>
            <Link to="/auth/signup"><Button size="sm">Get Started</Button></Link>
          </div>
          {/* Mobile menu button */}
          <button className="md:hidden" onClick={() => setMobileMenuOpen(!mobileMenuOpen)} aria-label="Toggle menu">
            {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
        {/* Mobile menu */}
        {mobileMenuOpen && (
          <div className="border-t border-border/50 bg-background px-6 py-4 md:hidden">
            <div className="flex flex-col gap-4">
              <a href="#features" onClick={() => setMobileMenuOpen(false)} className="text-sm font-medium text-muted-foreground">Features</a>
              <a href="#pricing" onClick={() => setMobileMenuOpen(false)} className="text-sm font-medium text-muted-foreground">Pricing</a>
              <a href="#faq" onClick={() => setMobileMenuOpen(false)} className="text-sm font-medium text-muted-foreground">FAQ</a>
              <Link to="/auth/login" className="text-sm font-medium text-muted-foreground">Sign In</Link>
              <Link to="/auth/signup"><Button size="sm" className="w-full">Get Started</Button></Link>
            </div>
          </div>
        )}
      </nav>

      {/* Hero */}
      <section className="relative flex min-h-[92vh] items-center overflow-hidden px-6 pt-20">
        {/* Background gradient mesh */}
        <div className="absolute inset-0 -z-10">
          <div className="absolute inset-0 bg-gradient-to-b from-blue-50/50 via-transparent to-transparent dark:from-blue-950/30 dark:via-transparent dark:to-transparent" />
          <div className="absolute left-1/4 top-1/4 h-[500px] w-[500px] rounded-full bg-blue-400/10 blur-[120px] dark:bg-blue-600/10" />
          <div className="absolute right-1/4 bottom-1/4 h-[400px] w-[400px] rounded-full bg-emerald-400/8 blur-[100px] dark:bg-emerald-600/8" />
        </div>

        <div className="mx-auto w-full max-w-7xl">
          <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
            {/* Left - Copy */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="text-center lg:text-left"
            >
              {/* Badge */}
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="mb-6 inline-flex items-center gap-2 rounded-full border border-blue-500/20 bg-blue-500/5 px-4 py-1.5 text-sm font-medium text-blue-700 dark:text-blue-300"
              >
                <span className="relative flex h-2 w-2">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-blue-500 opacity-75" />
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-blue-600" />
                </span>
                Now with JazzCash & EasyPaisa integration
              </motion.div>

              <h1 className="mb-6 text-4xl font-bold leading-[1.1] tracking-tight sm:text-5xl lg:text-6xl">
                Financial Management{' '}
                <span className="bg-gradient-to-r from-blue-600 via-cyan-500 to-emerald-500 bg-clip-text text-transparent">
                  Made Simple
                </span>
              </h1>

              <p className="mx-auto mb-8 max-w-xl text-lg text-muted-foreground lg:mx-0">
                The all-in-one platform for Pakistani businesses. Invoice customers, track inventory, manage payments — all in one beautiful dashboard.
              </p>

              <div className="flex flex-col items-center justify-center gap-3 sm:flex-row lg:justify-start">
                <Link to="/auth/signup">
                  <Button size="lg" className="h-12 gap-2 bg-gradient-to-r from-blue-600 to-blue-500 px-8 shadow-lg shadow-blue-500/25 transition-all hover:from-blue-700 hover:to-blue-600 hover:shadow-blue-500/35 hover:scale-[1.02]">
                    Start Free Trial
                    <ArrowRight className="h-5 w-5" />
                  </Button>
                </Link>
                <Link to="/auth/login">
                  <Button size="lg" variant="outline" className="h-12 px-8">
                    Sign In
                  </Button>
                </Link>
              </div>

              {/* Social proof */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.8 }}
                className="mt-10 flex flex-col items-center gap-4 lg:items-start"
              >
                <div className="flex items-center -space-x-2">
                  {['bg-blue-600', 'bg-emerald-600', 'bg-amber-600', 'bg-purple-600', 'bg-rose-600'].map((color, i) => (
                    <div key={i} className={`flex h-8 w-8 items-center justify-center rounded-full ${color} text-xs font-bold text-white ring-2 ring-background`}>
                      {['AK', 'FR', 'UM', 'SR', 'NK'][i]}
                    </div>
                  ))}
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-muted text-xs font-semibold ring-2 ring-background">
                    +5K
                  </div>
                </div>
                <div className="flex flex-col gap-0.5">
                  <div className="flex gap-0.5">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star key={i} className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                    ))}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Trusted by <span className="font-semibold text-foreground">5,000+</span> Pakistani businesses
                  </p>
                </div>
              </motion.div>
            </motion.div>

            {/* Right - Dashboard Mockup */}
            <motion.div
              initial={{ opacity: 0, x: 40, rotateY: -5 }}
              animate={{ opacity: 1, x: 0, rotateY: 0 }}
              transition={{ duration: 0.8, delay: 0.3 }}
              className="relative hidden lg:block"
            >
              {/* Glow behind */}
              <div className="absolute -inset-4 rounded-3xl bg-gradient-to-r from-blue-500/20 via-cyan-500/15 to-emerald-500/20 blur-2xl" />

              {/* Dashboard card */}
              <div className="relative rounded-2xl border border-border/50 bg-card p-1 shadow-2xl shadow-black/10">
                {/* Browser chrome */}
                <div className="flex items-center gap-2 rounded-t-xl border-b border-border/50 bg-muted/50 px-4 py-2.5">
                  <div className="flex gap-1.5">
                    <div className="h-2.5 w-2.5 rounded-full bg-red-400" />
                    <div className="h-2.5 w-2.5 rounded-full bg-amber-400" />
                    <div className="h-2.5 w-2.5 rounded-full bg-emerald-400" />
                  </div>
                  <div className="ml-3 flex-1 rounded-md bg-background/60 px-3 py-1 text-[11px] text-muted-foreground">
                    app.moneyflow.pk/dashboard
                  </div>
                </div>

                {/* Dashboard content mockup */}
                <div className="space-y-4 p-5">
                  {/* Top bar */}
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs text-muted-foreground">Welcome back, Ahmed</p>
                      <p className="text-sm font-semibold">Dashboard Overview</p>
                    </div>
                    <div className="rounded-md bg-blue-600 px-2.5 py-1 text-[10px] font-medium text-white">This Month</div>
                  </div>

                  {/* Stats cards */}
                  <div className="grid grid-cols-3 gap-3">
                    {[
                      { label: 'Revenue', value: '₨1.2M', change: '+12.5%', color: 'text-emerald-600' },
                      { label: 'Invoices', value: '148', change: '+8.2%', color: 'text-blue-600' },
                      { label: 'Customers', value: '2,340', change: '+5.1%', color: 'text-purple-600' },
                    ].map((stat, i) => (
                      <motion.div
                        key={i}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.6 + i * 0.1 }}
                        className="rounded-lg border border-border/40 bg-background/50 p-3"
                      >
                        <p className="text-[10px] text-muted-foreground">{stat.label}</p>
                        <p className="text-sm font-bold">{stat.value}</p>
                        <p className={`text-[10px] font-medium ${stat.color}`}>{stat.change}</p>
                      </motion.div>
                    ))}
                  </div>

                  {/* Chart placeholder */}
                  <div className="rounded-lg border border-border/40 bg-background/50 p-3">
                    <div className="mb-2 flex items-center justify-between">
                      <p className="text-[10px] font-medium">Revenue Trend</p>
                      <p className="text-[10px] text-muted-foreground">Last 7 days</p>
                    </div>
                    <div className="flex items-end gap-1.5">
                      {[40, 65, 45, 80, 55, 90, 75].map((h, i) => (
                        <motion.div
                          key={i}
                          initial={{ height: 0 }}
                          animate={{ height: `${h}%` }}
                          transition={{ delay: 0.8 + i * 0.05, duration: 0.5, ease: 'easeOut' }}
                          className="flex-1 rounded-sm bg-gradient-to-t from-blue-600 to-cyan-400"
                          style={{ minHeight: 8 }}
                        />
                      ))}
                    </div>
                  </div>

                  {/* Recent invoices */}
                  <div className="rounded-lg border border-border/40 bg-background/50 p-3">
                    <p className="mb-2 text-[10px] font-medium">Recent Invoices</p>
                    {[
                      { id: 'INV-001', client: 'Karachi Electronics', amount: '₨45,000', status: 'Paid', statusColor: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' },
                      { id: 'INV-002', client: 'Lahore Textiles', amount: '₨78,500', status: 'Pending', statusColor: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400' },
                      { id: 'INV-003', client: 'Islamabad Trading', amount: '₨32,000', status: 'Paid', statusColor: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' },
                    ].map((inv, i) => (
                      <div key={i} className="flex items-center justify-between border-b border-border/20 py-1.5 last:border-0">
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-mono text-muted-foreground">{inv.id}</span>
                          <span className="text-[10px]">{inv.client}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-medium">{inv.amount}</span>
                          <span className={`rounded-full px-1.5 py-0.5 text-[8px] font-medium ${inv.statusColor}`}>{inv.status}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Floating payment badge */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 1.2 }}
                className="absolute -right-4 top-20 rounded-xl border border-border/50 bg-card p-3 shadow-lg"
              >
                <div className="flex items-center gap-2">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-500/10">
                    <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                  </div>
                  <div>
                    <p className="text-[10px] font-medium">Payment Received</p>
                    <p className="text-xs font-bold text-emerald-600">₨45,000</p>
                  </div>
                </div>
              </motion.div>

              {/* Floating inventory badge */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 1.4 }}
                className="absolute -left-4 bottom-24 rounded-xl border border-border/50 bg-card p-3 shadow-lg"
              >
                <div className="flex items-center gap-2">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-500/10">
                    <Package className="h-4 w-4 text-amber-600" />
                  </div>
                  <div>
                    <p className="text-[10px] font-medium">Low Stock Alert</p>
                    <p className="text-xs font-medium text-amber-600">3 items</p>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="px-6 py-24">
        <div className="mx-auto max-w-6xl">
          <div className="mb-16 text-center">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-3 py-1 text-xs font-medium text-primary">
              Features
            </div>
            <h2 className="mb-4 text-3xl font-bold tracking-tight sm:text-4xl">Everything you need to grow</h2>
            <p className="mx-auto max-w-xl text-muted-foreground">Powerful tools designed for modern Pakistani businesses — all in one place.</p>
          </div>
          <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {features.map((f, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08 }}
                className="group rounded-2xl border border-border/50 bg-card p-6 transition-all hover:border-border hover:shadow-lg hover:shadow-black/5"
              >
                <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500/10 to-cyan-500/10 transition-colors group-hover:from-blue-500/20 group-hover:to-cyan-500/20">
                  <f.icon className="h-5 w-5 text-blue-600" />
                </div>
                <h3 className="mb-2 font-semibold">{f.title}</h3>
                <p className="text-sm leading-relaxed text-muted-foreground">{f.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="border-y border-border/50 bg-muted/30 px-6 py-24">
        <div className="mx-auto max-w-6xl">
          <div className="mb-16 text-center">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-amber-500/20 bg-amber-500/5 px-3 py-1 text-xs font-medium text-amber-700 dark:text-amber-400">
              Testimonials
            </div>
            <h2 className="mb-4 text-3xl font-bold tracking-tight sm:text-4xl">Trusted by Pakistani Businesses</h2>
            <p className="mx-auto max-w-xl text-muted-foreground">See what our customers have to say about MoneyFlow.</p>
          </div>
          <div className="grid gap-5 md:grid-cols-3">
            {testimonials.map((t, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="flex flex-col rounded-2xl border border-border/50 bg-card p-6"
              >
                <div className="mb-3 flex gap-0.5">
                  {Array.from({ length: t.rating }).map((_, j) => (
                    <Star key={j} className="h-4 w-4 fill-amber-400 text-amber-400" />
                  ))}
                </div>
                <p className="mb-6 flex-1 text-sm leading-relaxed text-muted-foreground">"{t.text}"</p>
                <div className="flex items-center gap-3 border-t border-border/50 pt-4">
                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-blue-600 to-cyan-500 text-xs font-bold text-white">
                    {t.name.split(' ').map(n => n[0]).join('')}
                  </div>
                  <div>
                    <p className="text-sm font-semibold">{t.name}</p>
                    <p className="text-xs text-muted-foreground">{t.business}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="px-6 py-24">
        <div className="mx-auto max-w-6xl">
          <div className="mb-16 text-center">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-emerald-500/20 bg-emerald-500/5 px-3 py-1 text-xs font-medium text-emerald-700 dark:text-emerald-400">
              Pricing
            </div>
            <h2 className="mb-4 text-3xl font-bold tracking-tight sm:text-4xl">Simple, transparent pricing</h2>
            <p className="mx-auto mb-6 max-w-xl text-muted-foreground">Start free, upgrade when you're ready.</p>
            {/* Billing toggle */}
            <div className="inline-flex items-center gap-1 rounded-full border border-border/50 bg-muted/50 p-1">
              <button
                onClick={() => setIsYearly(false)}
                className={`rounded-full px-5 py-2 text-sm font-medium transition-all ${
                  !isYearly ? 'bg-background text-foreground shadow-sm' : 'text-muted-foreground'
                }`}
              >
                Monthly
              </button>
              <button
                onClick={() => setIsYearly(true)}
                className={`rounded-full px-5 py-2 text-sm font-medium transition-all ${
                  isYearly ? 'bg-background text-foreground shadow-sm' : 'text-muted-foreground'
                }`}
              >
                Yearly
                <span className="ml-1.5 rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-bold text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400">
                  Save 20%
                </span>
              </button>
            </div>
          </div>
          <div className="grid gap-5 md:grid-cols-3">
            {pricingPlans.map((plan, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className={`relative rounded-2xl border p-7 ${
                  plan.highlight
                    ? 'border-blue-500/30 bg-blue-500/[0.03] shadow-lg shadow-blue-500/10 ring-1 ring-blue-500/20'
                    : 'border-border/50 bg-card'
                }`}
              >
                {plan.highlight && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-gradient-to-r from-blue-600 to-cyan-500 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-white shadow-lg">
                    Most Popular
                  </div>
                )}
                <h3 className="text-lg font-bold">{plan.name}</h3>
                <div className="mt-3 flex items-baseline gap-1">
                  <motion.span
                    key={isYearly ? 'yearly' : 'monthly'}
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.2 }}
                    className="text-4xl font-bold tracking-tight"
                  >
                    {plan.price === 'Free'
                      ? 'Free'
                      : isYearly
                        ? `₨${Math.round(parseInt(plan.price.replace('₨', '').replace(',', '')) * 12 * 0.8).toLocaleString('en-PK')}`
                        : plan.price}
                  </motion.span>
                  <span className="text-sm text-muted-foreground">
                    {plan.price === 'Free' ? '' : isYearly ? '/year' : plan.period}
                  </span>
                </div>
                {isYearly && plan.price !== 'Free' && (
                  <p className="mt-1 text-xs text-muted-foreground line-through">
                    was ₨{Math.round(parseInt(plan.price.replace('₨', '').replace(',', '')) * 12).toLocaleString('en-PK')}/year
                  </p>
                )}
                <ul className="mt-6 space-y-3">
                  {plan.features.map((f, j) => (
                    <li key={j} className="flex items-center gap-2.5 text-sm">
                      <CheckCircle2 className={`h-4 w-4 shrink-0 ${plan.highlight ? 'text-blue-600' : 'text-primary'}`} />
                      {f}
                    </li>
                  ))}
                </ul>
                <Link to="/auth/signup" className="mt-8 block">
                  <Button
                    variant={plan.highlight ? 'default' : 'outline'}
                    className={`w-full ${plan.highlight ? 'bg-gradient-to-r from-blue-600 to-blue-500 shadow-lg shadow-blue-500/20 hover:from-blue-700 hover:to-blue-600' : ''}`}
                  >
                    {plan.cta}
                  </Button>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="border-y border-border/50 bg-muted/30 px-6 py-24">
        <div className="mx-auto max-w-3xl">
          <div className="mb-16 text-center">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-blue-500/20 bg-blue-500/5 px-3 py-1 text-xs font-medium text-blue-700 dark:text-blue-400">
              FAQ
            </div>
            <h2 className="mb-4 text-3xl font-bold tracking-tight sm:text-4xl">Frequently Asked Questions</h2>
            <p className="text-muted-foreground">Got questions? We've got answers.</p>
          </div>
          <div className="space-y-3">
            {faqs.map((faq, i) => (
              <div key={i} className={`rounded-xl border bg-card transition-colors ${openFaq === i ? 'border-border/80 shadow-sm' : 'border-border/50'}`}>
                <button
                  className="flex w-full items-center justify-between p-5 text-left"
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                >
                  <span className="pr-4 font-medium">{faq.q}</span>
                  <span className={`flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full border border-border/50 text-xs transition-colors ${openFaq === i ? 'bg-primary text-primary-foreground border-primary' : 'text-muted-foreground'}`}>
                    {openFaq === i ? '−' : '+'}
                  </span>
                </button>
                <AnimatePresence initial={false}>
                  {openFaq === i && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2, ease: "easeInOut" }}
                      className="overflow-hidden"
                    >
                      <div className="border-t border-border/50 px-5 pb-5 pt-3 text-sm leading-relaxed text-muted-foreground">
                        {faq.a}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="px-6 py-24">
        <div className="mx-auto max-w-5xl">
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-950 via-blue-950 to-slate-900 px-8 py-16 text-center text-white sm:px-16">
            {/* Mesh gradients */}
            <div className="absolute -left-20 -top-20 h-80 w-80 rounded-full bg-blue-600/20 blur-[100px]" />
            <div className="absolute -bottom-20 -right-20 h-80 w-80 rounded-full bg-emerald-500/15 blur-[100px]" />

            <div className="relative z-10">
              <h2 className="mb-4 text-3xl font-bold tracking-tight sm:text-4xl">Ready to streamline your business?</h2>
              <p className="mx-auto mb-8 max-w-lg text-lg text-slate-300">Join thousands of Pakistani businesses already using MoneyFlow to manage their finances.</p>
              <Link to="/auth/signup">
                <Button size="lg" className="h-12 gap-2 bg-white px-8 font-semibold text-slate-900 shadow-lg transition-all hover:bg-slate-100 hover:scale-[1.02]">
                  Get Started Free
                  <ArrowRight className="h-5 w-5" />
                </Button>
              </Link>
              <div className="mt-8 flex flex-wrap justify-center gap-6 text-sm text-slate-400">
                {['No credit card', '14-day trial', 'Cancel anytime'].map((t, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                    {t}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border/50 px-6 py-16">
        <div className="mx-auto max-w-7xl">
          <div className="grid gap-10 md:grid-cols-4">
            <div>
              <Logo variant="horizontal" size="sm" animated={false} />
              <p className="mt-4 text-sm leading-relaxed text-muted-foreground">Financial management made simple for Pakistani businesses.</p>
            </div>
            <div>
              <h4 className="mb-4 text-sm font-semibold">Product</h4>
              <div className="space-y-3 text-sm text-muted-foreground">
                <a href="#features" className="block transition-colors hover:text-foreground">Features</a>
                <a href="#pricing" className="block transition-colors hover:text-foreground">Pricing</a>
                <a href="#faq" className="block transition-colors hover:text-foreground">FAQ</a>
              </div>
            </div>
            <div>
              <h4 className="mb-4 text-sm font-semibold">Company</h4>
              <div className="space-y-3 text-sm text-muted-foreground">
                <a href="#" className="block transition-colors hover:text-foreground">About</a>
                <a href="#" className="block transition-colors hover:text-foreground">Blog</a>
                <a href="#" className="block transition-colors hover:text-foreground">Contact</a>
              </div>
            </div>
            <div>
              <h4 className="mb-4 text-sm font-semibold">Legal</h4>
              <div className="space-y-3 text-sm text-muted-foreground">
                <a href="#" className="block transition-colors hover:text-foreground">Privacy Policy</a>
                <a href="#" className="block transition-colors hover:text-foreground">Terms of Service</a>
                <a href="#" className="block transition-colors hover:text-foreground">Security</a>
              </div>
            </div>
          </div>
          <div className="mt-12 border-t border-border/50 pt-8 text-center text-sm text-muted-foreground">
            &copy; {new Date().getFullYear()} MoneyFlow. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}
