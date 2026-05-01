// src/components/auth/SignupForm.tsx
import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { motion } from 'framer-motion';
import { Loader2, Eye, EyeOff, User, Building2, Mail, Lock, ArrowRight, CheckCircle2 } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { useAuth } from '@/hooks/useAuth';
import { signupSchema, type SignupFormData } from '@/schemas/authSchemas';
import { OAuthButtons } from './OAuthButtons';

function calculatePasswordStrength(password: string): number {
  let score = 0;
  if (password.length >= 8) score++;
  if (password.length >= 12) score++;
  if (/[A-Z]/.test(password)) score++;
  if (/[0-9]/.test(password)) score++;
  if (/[^A-Za-z0-9]/.test(password)) score++;
  return Math.min(score, 5);
}

function RequirementCheck({ pass, label }: { pass: boolean; label: string }) {
  return (
    <div className={`flex items-center gap-1.5 transition-colors duration-200 ${pass ? 'text-emerald-600 dark:text-emerald-400' : 'text-muted-foreground/60'}`}>
      <CheckCircle2 className={`h-3 w-3 transition-all duration-200 ${pass ? 'scale-100 opacity-100' : 'scale-90 opacity-40'}`} />
      <span className="text-xs">{label}</span>
    </div>
  );
}

export function SignupForm() {
  const navigate = useNavigate();
  const { signUp, loading } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<SignupFormData>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      acceptTerms: false,
    },
  });

  const password = watch('password');

  const onSubmit = async (data: SignupFormData) => {
    try {
      const fullName = `${data.firstName} ${data.lastName}`.trim();
      const { error } = await signUp(data.email, data.password, data.businessName, fullName);

      if (error) {
        toast.error(error.message ?? 'Failed to create account');
        return;
      }

      toast.success('Account created successfully! Please check your email to verify.');
      navigate('/auth/verify-email', { state: { email: data.email } });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'An error occurred';
      toast.error(errorMessage);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="w-full space-y-5"
    >
      {/* Header */}
      <div className="space-y-1">
        <h1 className="text-2xl font-bold tracking-tight">Create your account</h1>
        <p className="text-sm text-muted-foreground">Start managing your business in minutes</p>
      </div>

      {/* Free trial badge */}
      <div className="flex items-center gap-2 rounded-lg border border-blue-500/20 bg-blue-500/5 px-3 py-2">
        <CheckCircle2 className="h-4 w-4 flex-shrink-0 text-blue-600 dark:text-blue-400" />
        <span className="text-xs font-medium text-blue-700 dark:text-blue-300">
          14-day free trial — No credit card required
        </span>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {/* Name Fields */}
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <Label htmlFor="firstName" className="text-sm font-medium">First name</Label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground/60" />
              <Input
                id="firstName"
                placeholder="Malik"
                className="h-11 pl-10 transition-colors focus-visible:ring-blue-500/30"
                {...register('firstName')}
                disabled={loading}
              />
            </div>
            {errors.firstName && (
              <p className="text-xs text-destructive">{errors.firstName.message}</p>
            )}
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="lastName" className="text-sm font-medium">Last name</Label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground/60" />
              <Input
                id="lastName"
                placeholder="Kashif"
                className="h-11 pl-10 transition-colors focus-visible:ring-blue-500/30"
                {...register('lastName')}
                disabled={loading}
              />
            </div>
            {errors.lastName && (
              <p className="text-xs text-destructive">{errors.lastName.message}</p>
            )}
          </div>
        </div>

        {/* Business Name */}
        <div className="space-y-1.5">
          <Label htmlFor="businessName" className="text-sm font-medium">Business name</Label>
          <div className="relative">
            <Building2 className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground/60" />
            <Input
              id="businessName"
              placeholder="MTK Inc."
              className="h-11 pl-10 transition-colors focus-visible:ring-blue-500/30"
              {...register('businessName')}
              disabled={loading}
            />
          </div>
          {errors.businessName && (
            <p className="text-xs text-destructive">{errors.businessName.message}</p>
          )}
        </div>

        {/* Email */}
        <div className="space-y-1.5">
          <Label htmlFor="email" className="text-sm font-medium">Work email</Label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground/60" />
            <Input
              id="email"
              type="email"
              placeholder="you@company.com"
              className="h-11 pl-10 transition-colors focus-visible:ring-blue-500/30"
              {...register('email')}
              disabled={loading}
            />
          </div>
          {errors.email && <p className="text-xs text-destructive">{errors.email.message}</p>}
        </div>

        {/* Password */}
        <div className="space-y-1.5">
          <Label htmlFor="password" className="text-sm font-medium">Password</Label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground/60" />
            <Input
              id="password"
              type={showPassword ? 'text' : 'password'}
              placeholder="Create a strong password"
              className="h-11 pl-10 pr-10 transition-colors focus-visible:ring-blue-500/30"
              {...register('password')}
              disabled={loading}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground/60 hover:text-foreground transition-colors"
              tabIndex={-1}
            >
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
          {errors.password && <p className="text-xs text-destructive">{errors.password.message}</p>}
          {password && (
            <div className="space-y-2 pt-1">
              {/* Strength bar */}
              <div className="flex gap-1">
                {[0, 1, 2, 3, 4].map((i) => {
                  const strength = calculatePasswordStrength(password);
                  const colors = ['bg-red-500', 'bg-orange-500', 'bg-yellow-500', 'bg-lime-500', 'bg-emerald-500'];
                  return (
                    <div
                      key={i}
                      className={`h-1 flex-1 rounded-full transition-colors duration-300 ${
                        i < strength ? colors[strength - 1] : 'bg-muted'
                      }`}
                    />
                  );
                })}
              </div>
              {/* Requirements */}
              <div className="grid grid-cols-2 gap-x-3 gap-y-1">
                <RequirementCheck pass={password.length >= 8} label="8+ characters" />
                <RequirementCheck pass={/[A-Z]/.test(password)} label="Uppercase letter" />
                <RequirementCheck pass={/[0-9]/.test(password)} label="Number" />
                <RequirementCheck pass={/[^A-Za-z0-9]/.test(password)} label="Special character" />
              </div>
            </div>
          )}
        </div>

        {/* Confirm Password */}
        <div className="space-y-1.5">
          <Label htmlFor="confirmPassword" className="text-sm font-medium">Confirm password</Label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground/60" />
            <Input
              id="confirmPassword"
              type={showConfirmPassword ? 'text' : 'password'}
              placeholder="Repeat your password"
              className="h-11 pl-10 pr-10 transition-colors focus-visible:ring-blue-500/30"
              {...register('confirmPassword')}
              disabled={loading}
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground/60 hover:text-foreground transition-colors"
              tabIndex={-1}
            >
              {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
          {errors.confirmPassword && (
            <p className="text-xs text-destructive">{errors.confirmPassword.message}</p>
          )}
        </div>

        {/* Terms */}
        <div className="flex items-start gap-2 rounded-lg border border-border/50 p-3 bg-muted/30">
          <Checkbox
            id="acceptTerms"
            checked={watch('acceptTerms')}
            onCheckedChange={(checked) => setValue('acceptTerms', checked as boolean)}
            disabled={loading}
            className="mt-0.5 data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600"
          />
          <Label htmlFor="acceptTerms" className="text-xs font-normal leading-relaxed cursor-pointer">
            I agree to the{' '}
            <Link to="/terms" className="text-foreground font-medium hover:text-primary underline underline-offset-2">Terms of Service</Link>
            {' '}and{' '}
            <Link to="/privacy" className="text-foreground font-medium hover:text-primary underline underline-offset-2">Privacy Policy</Link>
          </Label>
        </div>
        {errors.acceptTerms && (
          <p className="text-xs text-destructive">{errors.acceptTerms.message}</p>
        )}

        {/* Submit */}
        <Button
          type="submit"
          className="h-11 w-full gap-2 bg-gradient-to-r from-blue-600 to-blue-500 shadow-lg shadow-blue-500/20 transition-all hover:from-blue-700 hover:to-blue-600 hover:shadow-blue-500/30"
          disabled={loading}
        >
          {loading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <>
              Create Account
              <ArrowRight className="h-4 w-4" />
            </>
          )}
        </Button>
      </form>

      <OAuthButtons />

      <p className="text-center text-sm text-muted-foreground">
        Already have an account?{' '}
        <Link to="/auth/login" className="font-semibold text-foreground hover:text-primary transition-colors">
          Sign in
        </Link>
      </p>
    </motion.div>
  );
}
