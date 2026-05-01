// src/components/customers/CustomerForm.tsx
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { User, Mail, Phone, MapPin, CreditCard, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { customerSchema, type CustomerFormData } from '@/schemas/customerSchemas';
import { handleError } from '@/lib/errorHandler';

interface CustomerFormProps {
  initialData?: Partial<CustomerFormData>;
  onSubmit: (data: CustomerFormData) => Promise<void>;
  onCancel: () => void;
  submitLabel?: string;
}

export function CustomerForm({
  initialData,
  onSubmit,
  onCancel,
  submitLabel = 'Create Customer',
}: CustomerFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<CustomerFormData>({
    resolver: zodResolver(customerSchema),
    defaultValues: initialData ?? {
      name: '',
      email: '',
      phone: '',
      address: '',
      city: '',
      country: 'Pakistan',
      tax_id: '',
      credit_limit: 0,
      notes: '',
      portal_access: false,
    },
  });

  const portalAccess = watch('portal_access');

  const handleFormSubmit = async (data: CustomerFormData) => {
    setIsSubmitting(true);
    try {
      await onSubmit(data);
    } catch (error) {
      handleError(error, 'CustomerForm');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
      {/* Basic Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Basic Information
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {/* Name */}
            <div className="space-y-2">
              <Label htmlFor="name">Customer Name *</Label>
              <Input
                id="name"
                placeholder="John Doe"
                {...register('name')}
                disabled={isSubmitting}
              />
              {errors.name && <p className="text-destructive text-sm">{errors.name.message}</p>}
            </div>

            {/* Email */}
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <div className="relative">
                <Mail className="text-muted-foreground absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2" />
                <Input
                  id="email"
                  type="email"
                  placeholder="john@example.com"
                  className="pl-9"
                  {...register('email')}
                  disabled={isSubmitting}
                />
              </div>
              {errors.email && <p className="text-destructive text-sm">{errors.email.message}</p>}
            </div>

            {/* Phone */}
            <div className="space-y-2">
              <Label htmlFor="phone">Phone</Label>
              <div className="relative">
                <Phone className="text-muted-foreground absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2" />
                <Input
                  id="phone"
                  type="tel"
                  placeholder="+92-300-1234567"
                  className="pl-9"
                  {...register('phone')}
                  disabled={isSubmitting}
                />
              </div>
              {errors.phone && <p className="text-destructive text-sm">{errors.phone.message}</p>}
            </div>

            {/* Tax ID */}
            <div className="space-y-2">
              <Label htmlFor="tax_id">Tax ID / GST Number</Label>
              <div className="relative">
                <FileText className="text-muted-foreground absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2" />
                <Input
                  id="tax_id"
                  placeholder="GST123456"
                  className="pl-9"
                  {...register('tax_id')}
                  disabled={isSubmitting}
                />
              </div>
              {errors.tax_id && <p className="text-destructive text-sm">{errors.tax_id.message}</p>}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Address Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5" />
            Address Information
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="address">Street Address</Label>
            <Input
              id="address"
              placeholder="123 Main Street"
              {...register('address')}
              disabled={isSubmitting}
            />
            {errors.address && <p className="text-destructive text-sm">{errors.address.message}</p>}
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="city">City</Label>
              <Input id="city" placeholder="Lahore" {...register('city')} disabled={isSubmitting} />
              {errors.city && <p className="text-destructive text-sm">{errors.city.message}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="country">Country</Label>
              <Input
                id="country"
                placeholder="Pakistan"
                {...register('country')}
                disabled={isSubmitting}
              />
              {errors.country && (
                <p className="text-destructive text-sm">{errors.country.message}</p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Financial Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5" />
            Financial Settings
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="credit_limit">Credit Limit</Label>
            <Input
              id="credit_limit"
              type="number"
              step="0.01"
              min="0"
              placeholder="0.00"
              {...register('credit_limit', { valueAsNumber: true })}
              disabled={isSubmitting}
            />
            {errors.credit_limit && (
              <p className="text-destructive text-sm">{errors.credit_limit.message}</p>
            )}
            <p className="text-muted-foreground text-xs">
              Maximum amount this customer can owe at one time
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Additional Information */}
      <Card>
        <CardHeader>
          <CardTitle>Additional Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              placeholder="Add any additional notes about this customer..."
              rows={4}
              {...register('notes')}
              disabled={isSubmitting}
            />
            {errors.notes && <p className="text-destructive text-sm">{errors.notes.message}</p>}
          </div>

          {/* Portal Access */}
          <div className="flex items-start space-x-3 rounded-lg border p-4">
            <Checkbox
              id="portal_access"
              checked={portalAccess}
              onCheckedChange={(checked) => setValue('portal_access', checked as boolean)}
              disabled={isSubmitting}
            />
            <div className="space-y-1 leading-none">
              <Label htmlFor="portal_access" className="cursor-pointer text-sm font-medium">
                Enable Customer Portal Access
              </Label>
              <p className="text-muted-foreground text-sm">
                Allow this customer to login and view their invoices, make payments, and update
                their profile
              </p>
            </div>
          </div>

          {portalAccess && (
            <div className="space-y-2 pl-8">
              <Label htmlFor="portal_password">Portal Password</Label>
              <Input
                id="portal_password"
                type="password"
                placeholder="Set a password for customer portal"
                {...register('portal_password')}
                disabled={isSubmitting}
              />
              {errors.portal_password && (
                <p className="text-destructive text-sm">{errors.portal_password.message}</p>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Action Buttons - Sticky on mobile */}
      <div className="sticky bottom-0 bg-background pt-4 pb-2 border-t -mx-4 px-4 sm:mx-0 sm:px-0 sm:border-0 sm:static flex flex-col-reverse sm:flex-row sm:justify-end gap-3">
        <Button type="button" variant="outline" onClick={onCancel} disabled={isSubmitting} className="w-full sm:w-auto">
          Cancel
        </Button>
        <Button type="submit" disabled={isSubmitting} className="w-full sm:w-auto">
          {isSubmitting ? 'Saving...' : submitLabel}
        </Button>
      </div>
    </form>
  );
}
