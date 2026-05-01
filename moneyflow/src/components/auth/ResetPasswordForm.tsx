// src/components/auth/ResetPasswordForm.tsx
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/hooks/useAuth';
import { resetPasswordSchema, type ResetPasswordFormData } from '@/schemas/authSchemas';

export function ResetPasswordForm() {
  const navigate = useNavigate();
  const { updatePassword, loading } = useAuth();

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<ResetPasswordFormData>({
    resolver: zodResolver(resetPasswordSchema),
  });

  const password = watch('password');

  const onSubmit = async (data: ResetPasswordFormData) => {
    try {
      const { error } = await updatePassword(data.password);

      if (error) {
        toast.error(error.message ?? 'Failed to reset password');
        return;
      }

      toast.success('Password reset successfully!');
      navigate('/auth/login', { replace: true });
    } catch (error: any) {
      toast.error(error.message ?? 'An error occurred');
    }
  };

  return (
    <div className="w-full max-w-md space-y-6">
      <div className="space-y-2 text-center">
        <h1 className="text-3xl font-bold">Reset your password</h1>
        <p className="text-muted-foreground">
          Enter your new password below
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="password">New Password</Label>
          <Input
            id="password"
            type="password"
            placeholder="••••••••"
            {...register('password')}
            disabled={loading}
          />
          {errors.password && (
            <p className="text-sm text-destructive">{errors.password.message}</p>
          )}
          {password && (
            <div className="space-y-1 text-xs">
              <p className={password.length >= 8 ? 'text-green-600' : 'text-muted-foreground'}>
                ✓ At least 8 characters
              </p>
              <p className={/[A-Z]/.test(password) ? 'text-green-600' : 'text-muted-foreground'}>
                ✓ One uppercase letter
              </p>
              <p className={/[0-9]/.test(password) ? 'text-green-600' : 'text-muted-foreground'}>
                ✓ One number
              </p>
              <p className={/[^A-Za-z0-9]/.test(password) ? 'text-green-600' : 'text-muted-foreground'}>
                ✓ One special character
              </p>
            </div>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="confirmPassword">Confirm New Password</Label>
          <Input
            id="confirmPassword"
            type="password"
            placeholder="••••••••"
            {...register('confirmPassword')}
            disabled={loading}
          />
          {errors.confirmPassword && (
            <p className="text-sm text-destructive">{errors.confirmPassword.message}</p>
          )}
        </div>

        <Button type="submit" className="w-full" disabled={loading}>
          {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Reset Password
        </Button>
      </form>
    </div>
  );
}