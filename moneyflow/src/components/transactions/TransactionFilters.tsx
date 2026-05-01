import { useState } from 'react';
import { Filter, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { useActiveCategories } from '@/hooks/useExpenseCategories';
import { useActiveBankAccounts } from '@/hooks/useBankAccounts';
import { PAYMENT_METHODS, TRANSACTION_TYPES } from '@/constants/status';
import type { TransactionFilters } from '@/types/database.types';

interface TransactionFiltersComponentProps {
  filters: TransactionFilters;
  onFiltersChange: (filters: TransactionFilters) => void;
  activeFilterCount?: number;
}

export function TransactionFiltersComponent({
  filters,
  onFiltersChange,
  activeFilterCount = 0,
}: TransactionFiltersComponentProps) {
  const [isOpen, setIsOpen] = useState(false);
  const { categories } = useActiveCategories();
  const { bankAccounts } = useActiveBankAccounts();

  const updateFilter = <K extends keyof TransactionFilters>(
    key: K,
    value: TransactionFilters[K]
  ) => {
    onFiltersChange({ ...filters, [key]: value });
  };

  const clearFilter = (key: keyof TransactionFilters) => {
    const newFilters = { ...filters };
    delete newFilters[key];
    onFiltersChange(newFilters);
  };

  const clearAllFilters = () => {
    onFiltersChange({});
  };

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button variant="outline" className="relative">
          <Filter className="mr-2 h-4 w-4" />
          Filters
          {activeFilterCount > 0 && (
            <Badge
              variant="secondary"
              className="ml-2 flex h-5 w-5 items-center justify-center rounded-full p-0 text-xs"
            >
              {activeFilterCount}
            </Badge>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80" align="end">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="font-semibold">Filter Transactions</h4>
            {activeFilterCount > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={clearAllFilters}
                className="h-auto p-0 text-xs"
              >
                Clear all
              </Button>
            )}
          </div>

          {/* Transaction Type */}
          <div className="space-y-2">
            <Label>Transaction Type</Label>
            <Select
              value={filters.type?.[0] ?? 'all'}
              onValueChange={(value) =>
                updateFilter('type', value !== 'all' ? [value as any] : undefined)
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="All types" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All types</SelectItem>
                {TRANSACTION_TYPES.map((type) => (
                  <SelectItem key={type.value} value={type.value}>
                    {type.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {filters.type && filters.type.length > 0 && (
              <div className="flex items-center gap-2">
                <Badge variant="secondary" className="text-xs">
                  {TRANSACTION_TYPES.find((t) => t.value === filters.type?.[0])?.label}
                </Badge>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-5 w-5 p-0"
                  onClick={() => clearFilter('type')}
                >
                  <X className="h-3 w-3" />
                </Button>
              </div>
            )}
          </div>

          {/* Category */}
          <div className="space-y-2">
            <Label>Category</Label>
            <Select
              value={filters.category_id?.[0] ?? 'all'}
              onValueChange={(value) =>
                updateFilter('category_id', value !== 'all' ? [value] : undefined)
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="All categories" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All categories</SelectItem>
                {categories.map((category) => (
                  <SelectItem key={category.id} value={category.id}>
                    <div className="flex items-center gap-2">
                      {(category as any).color && (
                        <div
                          className="h-3 w-3 rounded-full"
                          style={{ backgroundColor: (category as any).color }}
                        />
                      )}
                      {category.name}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {filters.category_id && filters.category_id.length > 0 && (
              <div className="flex items-center gap-2">
                <Badge variant="secondary" className="text-xs">
                  {categories.find((c) => c.id === filters.category_id?.[0])?.name}
                </Badge>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-5 w-5 p-0"
                  onClick={() => clearFilter('category_id')}
                >
                  <X className="h-3 w-3" />
                </Button>
              </div>
            )}
          </div>

          {/* Bank Account */}
          <div className="space-y-2">
            <Label>Bank Account</Label>
            <Select
              value={filters.bank_account_id?.[0] ?? 'all'}
              onValueChange={(value) =>
                updateFilter('bank_account_id', value !== 'all' ? [value] : undefined)
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="All accounts" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All accounts</SelectItem>
                <SelectItem value="cash">Cash</SelectItem>
                {bankAccounts.map((account) => (
                  <SelectItem key={account.id} value={account.id}>
                    {account.account_name} ({account.bank_name})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {filters.bank_account_id && filters.bank_account_id.length > 0 && (
              <div className="flex items-center gap-2">
                <Badge variant="secondary" className="text-xs">
                  {filters.bank_account_id[0] === 'cash'
                    ? 'Cash'
                    : bankAccounts.find((a) => a.id === filters.bank_account_id?.[0])?.account_name}
                </Badge>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-5 w-5 p-0"
                  onClick={() => clearFilter('bank_account_id')}
                >
                  <X className="h-3 w-3" />
                </Button>
              </div>
            )}
          </div>

          {/* Payment Method */}
          <div className="space-y-2">
            <Label>Payment Method</Label>
            <Select
              value={filters.payment_method?.[0] ?? 'all'}
              onValueChange={(value) =>
                updateFilter('payment_method', value !== 'all' ? [value as any] : undefined)
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="All methods" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All methods</SelectItem>
                {PAYMENT_METHODS.map((method) => (
                  <SelectItem key={method.value} value={method.value}>
                    {method.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {filters.payment_method && filters.payment_method.length > 0 && (
              <div className="flex items-center gap-2">
                <Badge variant="secondary" className="text-xs">
                  {PAYMENT_METHODS.find((m) => m.value === filters.payment_method?.[0])?.label}
                </Badge>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-5 w-5 p-0"
                  onClick={() => clearFilter('payment_method')}
                >
                  <X className="h-3 w-3" />
                </Button>
              </div>
            )}
          </div>

          {/* Date Range */}
          <div className="grid grid-cols-2 gap-2">
            <div className="space-y-2">
              <Label>From Date</Label>
              <Input
                type="date"
                value={filters.date_from ?? ''}
                onChange={(e) => updateFilter('date_from', e.target.value || undefined)}
              />
              {filters.date_from && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-5 w-5 p-0"
                  onClick={() => clearFilter('date_from')}
                >
                  <X className="h-3 w-3" />
                </Button>
              )}
            </div>
            <div className="space-y-2">
              <Label>To Date</Label>
              <Input
                type="date"
                value={filters.date_to ?? ''}
                onChange={(e) => updateFilter('date_to', e.target.value || undefined)}
              />
              {filters.date_to && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-5 w-5 p-0"
                  onClick={() => clearFilter('date_to')}
                >
                  <X className="h-3 w-3" />
                </Button>
              )}
            </div>
          </div>

          {/* Amount Range */}
          <div className="grid grid-cols-2 gap-2">
            <div className="space-y-2">
              <Label>Min Amount</Label>
              <Input
                type="number"
                step="0.01"
                placeholder="0.00"
                value={filters.amount_min ?? ''}
                onChange={(e) =>
                  updateFilter('amount_min', e.target.value ? Number(e.target.value) : undefined)
                }
              />
            </div>
            <div className="space-y-2">
              <Label>Max Amount</Label>
              <Input
                type="number"
                step="0.01"
                placeholder="0.00"
                value={filters.amount_max ?? ''}
                onChange={(e) =>
                  updateFilter('amount_max', e.target.value ? Number(e.target.value) : undefined)
                }
              />
            </div>
          </div>

          <div className="border-t pt-2">
            <Button variant="outline" className="w-full" onClick={() => setIsOpen(false)}>
              Apply Filters
            </Button>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
