// src/components/invoices/InvoiceFilter.tsx
import { Filter, X, Calendar, Search, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { INVOICE_FILTER_OPTIONS } from '@/constants/invoiceStatus';
import { formatDate } from '@/lib/invoiceFormatters';
import type { InvoiceFilters, InvoiceStatus } from '@/types/database.types';

interface InvoiceFilterProps {
  filters: InvoiceFilters;
  onFiltersChange: (filters: InvoiceFilters) => void;
  customers?: Array<{ id: string; name: string }>;
  onReset?: () => void;
}

export function InvoiceFilter({
  filters,
  onFiltersChange,
  customers = [],
  onReset,
}: InvoiceFilterProps) {
  // Removed unused isOpen state

  const updateFilter = <K extends keyof InvoiceFilters>(
    key: K,
    value: InvoiceFilters[K]
  ) => {
    onFiltersChange({ ...filters, [key]: value });
  };

  const handleStatusChange = (status: string) => {
    if (status === 'all') {
      updateFilter('status', undefined);
    } else {
      const currentStatuses = filters.status ?? [];
      const statusValue = status as InvoiceStatus;
      if (currentStatuses.includes(statusValue)) {
        updateFilter(
          'status',
          currentStatuses.filter((s) => s !== statusValue)
        );
      } else {
        updateFilter('status', [...currentStatuses, statusValue]);
      }
    }
  };

  const handleDateRangeChange = (range: string) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    let startDate: string | undefined;
    let endDate: string | undefined;

    switch (range) {
      case 'today':
        startDate = endDate = today.toISOString().split('T')[0];
        break;
      case 'yesterday':
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);
        startDate = endDate = yesterday.toISOString().split('T')[0];
        break;
      case 'this_week':
        const weekStart = new Date(today);
        weekStart.setDate(today.getDate() - today.getDay());
        startDate = weekStart.toISOString().split('T')[0];
        endDate = today.toISOString().split('T')[0];
        break;
      case 'last_week':
        const lastWeekStart = new Date(today);
        lastWeekStart.setDate(today.getDate() - today.getDay() - 7);
        const lastWeekEnd = new Date(lastWeekStart);
        lastWeekEnd.setDate(lastWeekStart.getDate() + 6);
        startDate = lastWeekStart.toISOString().split('T')[0];
        endDate = lastWeekEnd.toISOString().split('T')[0];
        break;
      case 'this_month':
        startDate = new Date(today.getFullYear(), today.getMonth(), 1)
          .toISOString()
          .split('T')[0];
        endDate = today.toISOString().split('T')[0];
        break;
      case 'last_month':
        const lastMonth = new Date(today.getFullYear(), today.getMonth() - 1, 1);
        const lastMonthEnd = new Date(today.getFullYear(), today.getMonth(), 0);
        startDate = lastMonth.toISOString().split('T')[0];
        endDate = lastMonthEnd.toISOString().split('T')[0];
        break;
      case 'this_quarter':
        const quarter = Math.floor(today.getMonth() / 3);
        startDate = new Date(today.getFullYear(), quarter * 3, 1)
          .toISOString()
          .split('T')[0];
        endDate = today.toISOString().split('T')[0];
        break;
      case 'this_year':
        startDate = new Date(today.getFullYear(), 0, 1).toISOString().split('T')[0];
        endDate = today.toISOString().split('T')[0];
        break;
      case 'custom':
        // Custom range handled separately
        return;
      default:
        updateFilter('start_date', undefined);
        updateFilter('end_date', undefined);
        return;
    }

    updateFilter('start_date', startDate);
    updateFilter('end_date', endDate);
  };

  const hasActiveFilters =
    filters.status?.length ||
    filters.customer_id ||
    filters.start_date ||
    filters.end_date ||
    filters.search;

  const activeFilterCount =
    (filters.status?.length ?? 0) +
    (filters.customer_id ? 1 : 0) +
    (filters.start_date ? 1 : 0) +
    (filters.end_date ? 1 : 0) +
    (filters.search ? 1 : 0);

  const handleReset = () => {
    onFiltersChange({});
    if (onReset) {
      onReset();
    }
  };

  return (
    <Card>
      <CardContent className="pt-6">
        <div className="space-y-4">
          {/* Search */}
          <div className="space-y-2">
            <Label htmlFor="search" className="flex items-center gap-2">
              <Search className="h-4 w-4" />
              Search
            </Label>
            <Input
              id="search"
              placeholder="Search by invoice number, customer name..."
              value={filters.search ?? ''}
              onChange={(e) => updateFilter('search', e.target.value || undefined)}
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            {/* Status Filter */}
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <Filter className="h-4 w-4" />
                Status
              </Label>
              <div className="flex flex-wrap gap-2">
                {INVOICE_FILTER_OPTIONS.status.map((status) => {
                  const isSelected = filters.status?.includes(status.value as InvoiceStatus);
                  return (
                    <Badge
                      key={status.value}
                      variant={isSelected ? 'default' : 'outline'}
                      className="cursor-pointer"
                      onClick={() => handleStatusChange(status.value)}
                    >
                      {status.label}
                    </Badge>
                  );
                })}
              </div>
            </div>

            {/* Customer Filter */}
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <User className="h-4 w-4" />
                Customer
              </Label>
              <Select
                value={filters.customer_id ?? 'all'}
                onValueChange={(value) =>
                  updateFilter('customer_id', value === 'all' ? undefined : value)
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="All customers" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Customers</SelectItem>
                  {customers.map((customer) => (
                    <SelectItem key={customer.id} value={customer.id}>
                      {customer.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Date Range */}
          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Date Range
            </Label>
            <div className="grid gap-2 sm:grid-cols-2">
              <Select
                value={
                  filters.start_date && filters.end_date
                    ? 'custom'
                    : filters.start_date
                      ? 'custom'
                      : 'all'
                }
                onValueChange={handleDateRangeChange}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select date range" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Time</SelectItem>
                  {INVOICE_FILTER_OPTIONS.dateRanges.map((range) => (
                    <SelectItem key={range.value} value={range.value}>
                      {range.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {(filters.start_date || filters.end_date) && (
                <div className="grid gap-2 sm:grid-cols-2">
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="outline" className="justify-start text-left font-normal">
                        <Calendar className="mr-2 h-4 w-4" />
                        {filters.start_date ? formatDate(filters.start_date) : 'Start date'}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <CalendarComponent
                        mode="single"
                        value={filters.start_date ?? ''}
                        onSelect={(date) =>
                          updateFilter('start_date', date?.toISOString().split('T')[0] || undefined)
                        }
                      />
                    </PopoverContent>
                  </Popover>

                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="outline" className="justify-start text-left font-normal">
                        <Calendar className="mr-2 h-4 w-4" />
                        {filters.end_date ? formatDate(filters.end_date) : 'End date'}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <CalendarComponent
                        mode="single"
                        value={filters.end_date ?? ''}
                        onSelect={(date) =>
                          updateFilter('end_date', date?.toISOString().split('T')[0] || undefined)
                        }
                      />
                    </PopoverContent>
                  </Popover>
                </div>
              )}
            </div>
          </div>

          {/* Active Filters Summary */}
          {hasActiveFilters && (
            <div className="flex items-center justify-between rounded-lg border bg-muted p-3">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium">Active Filters:</span>
                <Badge variant="secondary">{activeFilterCount}</Badge>
              </div>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={handleReset}
                className="h-8"
              >
                <X className="mr-2 h-4 w-4" />
                Clear All
              </Button>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

