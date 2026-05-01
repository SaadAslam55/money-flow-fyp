// FILE: src/components/reports/CustomReportBuilder.tsx

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { customReportSchema, type CustomReportInput } from '@/schemas/reportSchemas';
import { toast } from 'sonner';

interface CustomReportBuilderProps {
  onSubmit?: (data: CustomReportInput) => void;
  onCancel?: () => void;
}

export function CustomReportBuilder({ onSubmit, onCancel }: CustomReportBuilderProps) {
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<CustomReportInput>({
    resolver: zodResolver(customReportSchema),
    defaultValues: {
      name: '',
      description: '',
      date_range: {
        start: new Date(new Date().getFullYear(), 0, 1).toISOString().split('T')[0],
        end: new Date().toISOString().split('T')[0],
      },
      columns: [],
      group_by: 'none',
      sort_order: 'desc',
    },
  });

  const availableColumns = [
    { id: 'date', label: 'Date' },
    { id: 'customer', label: 'Customer' },
    { id: 'product', label: 'Product' },
    { id: 'category', label: 'Category' },
    { id: 'amount', label: 'Amount' },
    { id: 'quantity', label: 'Quantity' },
    { id: 'status', label: 'Status' },
    { id: 'payment_method', label: 'Payment Method' },
  ];

  const selectedColumns = watch('columns') || [];

  const handleColumnToggle = (columnId: string) => {
    const current = selectedColumns;
    if (current.includes(columnId)) {
      setValue('columns', current.filter((id) => id !== columnId));
    } else {
      setValue('columns', [...current, columnId]);
    }
  };

  const onFormSubmit = (data: CustomReportInput) => {
    if (data.columns.length === 0) {
      toast.error('Please select at least one column');
      return;
    }
    onSubmit?.(data);
    toast.success('Custom report created successfully');
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Build Custom Report</CardTitle>
        <CardDescription>
          Select columns, filters, and grouping options for your custom report
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-6">
          {/* Report Name */}
          <div className="space-y-2">
            <Label htmlFor="name">
              Report Name <span className="text-destructive">*</span>
            </Label>
            <Input
              id="name"
              {...register('name')}
              placeholder="e.g., Monthly Sales by Customer"
            />
            {errors.name && (
              <p className="text-sm text-destructive">{errors.name.message}</p>
            )}
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              {...register('description')}
              placeholder="Optional description for this report"
              rows={3}
            />
          </div>

          {/* Date Range */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="start">
                Start Date <span className="text-destructive">*</span>
              </Label>
              <Input
                id="start"
                type="date"
                {...register('date_range.start')}
              />
              {errors.date_range?.start && (
                <p className="text-sm text-destructive">{errors.date_range.start.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="end">
                End Date <span className="text-destructive">*</span>
              </Label>
              <Input
                id="end"
                type="date"
                {...register('date_range.end')}
              />
              {errors.date_range?.end && (
                <p className="text-sm text-destructive">{errors.date_range.end.message}</p>
              )}
            </div>
          </div>

          {/* Columns */}
          <div className="space-y-2">
            <Label>
              Select Columns <span className="text-destructive">*</span>
            </Label>
            <div className="grid grid-cols-2 gap-3 rounded-lg border p-4">
              {availableColumns.map((column) => (
                <div key={column.id} className="flex items-center space-x-2">
                  <Checkbox
                    id={column.id}
                    checked={selectedColumns.includes(column.id)}
                    onCheckedChange={() => handleColumnToggle(column.id)}
                  />
                  <Label
                    htmlFor={column.id}
                    className="cursor-pointer font-normal"
                  >
                    {column.label}
                  </Label>
                </div>
              ))}
            </div>
            {errors.columns && (
              <p className="text-sm text-destructive">{errors.columns.message}</p>
            )}
          </div>

          {/* Group By */}
          <div className="space-y-2">
            <Label htmlFor="group_by">Group By</Label>
            <Select
              value={watch('group_by') || 'none'}
              onValueChange={(value) => setValue('group_by', value as CustomReportInput['group_by'])}
            >
              <SelectTrigger id="group_by">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">No Grouping</SelectItem>
                <SelectItem value="customer">Customer</SelectItem>
                <SelectItem value="product">Product</SelectItem>
                <SelectItem value="category">Category</SelectItem>
                <SelectItem value="period">Period</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Sort Order */}
          <div className="space-y-2">
            <Label htmlFor="sort_order">Sort Order</Label>
            <Select
              value={watch('sort_order') || 'desc'}
              onValueChange={(value) => setValue('sort_order', value as 'asc' | 'desc')}
            >
              <SelectTrigger id="sort_order">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="asc">Ascending</SelectItem>
                <SelectItem value="desc">Descending</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3">
            {onCancel && (
              <Button type="button" variant="outline" onClick={onCancel}>
                Cancel
              </Button>
            )}
            <Button type="submit">Generate Report</Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}

