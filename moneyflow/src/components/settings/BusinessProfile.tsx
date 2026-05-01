// src/components/settings/BusinessProfile.tsx
import { logger } from '@/lib/logger';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Building2, Upload, X, Loader2 } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useOrganization } from '@/hooks/useOrganization';
import { Loader } from '@/components/common/Loader';
import { EmptyState } from '@/components/common/EmptyState';
import { z } from 'zod';
import type { Organization } from '@/types';
import { toast } from 'sonner';

const businessProfileSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(255, 'Name is too long'),
  email: z.string().email('Invalid email address').max(255, 'Email is too long'),
  phone: z
    .string()
    .regex(/^[+]?[\d\s-()]+$/, 'Invalid phone number format')
    .max(20, 'Phone number is too long')
    .optional()
    .or(z.literal(''))
    .transform((val) => (val === '' ? undefined : val)),
  address: z.string().max(500, 'Address is too long').optional().or(z.literal('')),
  city: z.string().max(100, 'City is too long').optional().or(z.literal('')),
  country: z.string().max(100, 'Country is too long').optional().or(z.literal('')),
  tax_id: z.string().max(100, 'Tax ID is too long').optional().or(z.literal('')),
  fiscal_year_start: z.string().min(1, 'Fiscal year start is required'),
  currency: z.string().length(3, 'Currency must be 3 characters').default('PKR'),
  timezone: z.string().min(1, 'Timezone is required').default('Asia/Karachi'),
});

type BusinessProfileFormData = z.infer<typeof businessProfileSchema>;

const CURRENCIES = [
  { value: 'PKR', label: 'Pakistani Rupee (PKR)' },
  { value: 'USD', label: 'US Dollar (USD)' },
  { value: 'EUR', label: 'Euro (EUR)' },
  { value: 'GBP', label: 'British Pound (GBP)' },
  { value: 'INR', label: 'Indian Rupee (INR)' },
  { value: 'AED', label: 'UAE Dirham (AED)' },
  { value: 'SAR', label: 'Saudi Riyal (SAR)' },
];

const TIMEZONES = [
  { value: 'Asia/Karachi', label: 'Asia/Karachi (PKT)' },
  { value: 'UTC', label: 'UTC' },
  { value: 'America/New_York', label: 'America/New_York (EST)' },
  { value: 'Europe/London', label: 'Europe/London (GMT)' },
  { value: 'Asia/Dubai', label: 'Asia/Dubai (GST)' },
  { value: 'Asia/Kolkata', label: 'Asia/Kolkata (IST)' },
];

export function BusinessProfile() {
  const { organization, updateOrganization, isUpdating, isLoading } = useOrganization();
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(
    organization?.logo_url || null
  );

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isDirty },
    reset,
  } = useForm<BusinessProfileFormData>({
    resolver: zodResolver(businessProfileSchema),
    defaultValues: organization
      ? {
          name: organization.name ?? '',
          email: organization.email ?? '',
          phone: organization.phone ?? '',
          address: organization.address ?? '',
          city: organization.city ?? '',
          country: organization.country ?? '',
          tax_id: organization.tax_id ?? '',
          fiscal_year_start: organization.fiscal_year_start ?? '2024-01-01',
          currency: organization.currency ?? 'PKR',
          timezone: organization.timezone ?? 'Asia/Karachi',
        }
      : undefined,
  });

  // Reset form when organization data loads
  const [formInitialized, setFormInitialized] = useState(false);
  if (organization && !formInitialized) {
    reset({
      name: organization.name ?? '',
      email: organization.email ?? '',
      phone: organization.phone ?? '',
      address: organization.address ?? '',
      city: organization.city ?? '',
      country: organization.country ?? '',
      tax_id: organization.tax_id ?? '',
      fiscal_year_start: organization.fiscal_year_start ?? '2024-01-01',
      currency: organization.currency ?? 'PKR',
      timezone: organization.timezone ?? 'Asia/Karachi',
    });
    setLogoPreview(organization.logo_url || null);
    setFormInitialized(true);
  }

  const currency = watch('currency');
  const timezone = watch('timezone');

  // Track if there are any changes (form dirty OR logo changed)
  const hasLogoChange = logoFile !== null;
  const hasChanges = isDirty || hasLogoChange;

  const handleFormSubmit = async (data: BusinessProfileFormData) => {
    try {
      await updateOrganization({
        updates: {
          name: data.name,
          email: data.email,
          phone: data.phone || null,
          address: data.address || null,
          city: data.city || null,
          country: data.country || null,
          tax_id: data.tax_id || null,
          fiscal_year_start: data.fiscal_year_start,
          currency: data.currency,
          timezone: data.timezone,
        },
        logoFile: logoFile || undefined,
      });
      setLogoFile(null);
    } catch (error) {

      logger.error('Error updating business profile:', error instanceof Error ? error.message : String(error));
    }
  };

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Check file size (5MB limit)
      if (file.size > 5 * 1024 * 1024) {
        toast.error('File size must be less than 5MB');
        return;
      }

      // Check file type
      const validTypes = ['image/jpeg', 'image/png', 'image/jpg', 'image/webp'];
      if (!validTypes.includes(file.type)) {
        toast.error('Only JPG, PNG, and WebP images are allowed');
        return;
      }

      setLogoFile(file);

      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setLogoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeLogo = () => {
    setLogoFile(null);
    setLogoPreview(organization?.logo_url || null);
  };

  if (isLoading) {
    return <Loader message="Loading business profile..." />;
  }

  if (!organization) {
    return (
      <EmptyState
        icon={Building2}
        title="Organization not found"
        description="Unable to load organization information. Please try again later."
      />
    );
  }

  return (
    <div className="space-y-6">
      {/* Logo Upload */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building2 className="h-5 w-5" />
            Company Logo
          </CardTitle>
          <CardDescription>Upload your company logo (Max 5MB, JPG/PNG/WebP)</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-start gap-6">
            {logoPreview ? (
              <div className="relative">
                <img
                  src={logoPreview}
                  alt="Company logo"
                  className="h-32 w-32 rounded-lg object-cover border"
                />
                <Button
                  type="button"
                  variant="destructive"
                  size="sm"
                  className="absolute -top-2 -right-2 h-6 w-6 rounded-full p-0"
                  onClick={removeLogo}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ) : (
              <div className="h-32 w-32 rounded-lg border-2 border-dashed flex items-center justify-center bg-muted">
                <Building2 className="h-12 w-12 text-muted-foreground" />
              </div>
            )}

            <div className="flex-1">
              <Input
                type="file"
                accept="image/jpeg,image/png,image/jpg,image/webp"
                onChange={handleLogoChange}
                className="max-w-xs"
                disabled={isUpdating}
              />
              <p className="text-sm text-muted-foreground mt-2">
                Recommended: Square image, at least 200x200px
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Company Information */}
      <Card>
        <CardHeader>
          <CardTitle>Company Information</CardTitle>
          <CardDescription>Update your business details</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="name">
                  Company Name <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="name"
                  {...register('name')}
                  error={!!errors.name}
                  disabled={isUpdating}
                />
                {errors.name && (
                  <p className="text-sm text-destructive">{errors.name.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">
                  Email <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="email"
                  type="email"
                  {...register('email')}
                  error={!!errors.email}
                  disabled={isUpdating}
                />
                {errors.email && (
                  <p className="text-sm text-destructive">{errors.email.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">Phone</Label>
                <Input
                  id="phone"
                  type="tel"
                  {...register('phone')}
                  error={!!errors.phone}
                  disabled={isUpdating}
                  placeholder="+92 300 1234567"
                />
                {errors.phone && (
                  <p className="text-sm text-destructive">{errors.phone.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="tax_id">Tax ID / Registration Number</Label>
                <Input
                  id="tax_id"
                  {...register('tax_id')}
                  error={!!errors.tax_id}
                  disabled={isUpdating}
                />
                {errors.tax_id && (
                  <p className="text-sm text-destructive">{errors.tax_id.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="address">Address</Label>
                <Textarea
                  id="address"
                  {...register('address')}
                  error={!!errors.address}
                  disabled={isUpdating}
                  rows={3}
                />
                {errors.address && (
                  <p className="text-sm text-destructive">{errors.address.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="city">City</Label>
                <Input
                  id="city"
                  {...register('city')}
                  error={!!errors.city}
                  disabled={isUpdating}
                />
                {errors.city && (
                  <p className="text-sm text-destructive">{errors.city.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="country">Country</Label>
                <Input
                  id="country"
                  {...register('country')}
                  error={!!errors.country}
                  disabled={isUpdating}
                />
                {errors.country && (
                  <p className="text-sm text-destructive">{errors.country.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="fiscal_year_start">
                  Fiscal Year Start <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="fiscal_year_start"
                  type="date"
                  {...register('fiscal_year_start')}
                  error={!!errors.fiscal_year_start}
                  disabled={isUpdating}
                />
                {errors.fiscal_year_start && (
                  <p className="text-sm text-destructive">{errors.fiscal_year_start.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="currency">
                  Currency <span className="text-destructive">*</span>
                </Label>
                <Select
                  value={currency}
                  onValueChange={(value) => setValue('currency', value as any)}
                  disabled={isUpdating}
                >
                  <SelectTrigger id="currency" className={errors.currency ? 'border-destructive' : ''}>
                    <SelectValue placeholder="Select currency" />
                  </SelectTrigger>
                  <SelectContent>
                    {CURRENCIES.map((curr) => (
                      <SelectItem key={curr.value} value={curr.value}>
                        {curr.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.currency && (
                  <p className="text-sm text-destructive">{errors.currency.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="timezone">
                  Timezone <span className="text-destructive">*</span>
                </Label>
                <Select
                  value={timezone}
                  onValueChange={(value) => setValue('timezone', value)}
                  disabled={isUpdating}
                >
                  <SelectTrigger id="timezone" className={errors.timezone ? 'border-destructive' : ''}>
                    <SelectValue placeholder="Select timezone" />
                  </SelectTrigger>
                  <SelectContent>
                    {TIMEZONES.map((tz) => (
                      <SelectItem key={tz.value} value={tz.value}>
                        {tz.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.timezone && (
                  <p className="text-sm text-destructive">{errors.timezone.message}</p>
                )}
              </div>
            </div>

            {/* Save Button - Sticky on mobile */}
            <div className="sticky bottom-0 bg-background pt-4 pb-2 border-t -mx-4 px-4 sm:mx-0 sm:px-0 sm:static flex justify-end">
              <Button type="submit" disabled={isUpdating || !hasChanges} className="w-full sm:w-auto">
                {isUpdating ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Upload className="mr-2 h-4 w-4" />
                    Save Changes
                  </>
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

