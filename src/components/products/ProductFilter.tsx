// src/components/products/ProductFilter.tsx
import { Filter, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { SearchBar } from '@/components/common/SearchBar';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useProductCategories } from '@/hooks/useProducts';

interface ProductFilters {
  search: string;
  category: string;
  lowStock: boolean;
  isActive: boolean;
  sortBy: 'name' | 'price' | 'stock';
  sortOrder: 'asc' | 'desc';
}

interface ProductFilterProps {
  filters: ProductFilters;
  onFiltersChange: (filters: ProductFilters) => void;
}

export function ProductFilter({ filters, onFiltersChange }: ProductFilterProps) {
  const { categories } = useProductCategories();

  const updateFilter = (key: keyof ProductFilters, value: any) => {
    onFiltersChange({ ...filters, [key]: value });
  };

  const clearFilters = () => {
    onFiltersChange({
      search: '',
      category: '',
      lowStock: false,
      isActive: true,
      sortBy: 'name',
      sortOrder: 'asc',
    });
  };

  const hasActiveFilters =
    filters.search !== '' ||
    filters.category !== '' ||
    filters.lowStock ||
    !filters.isActive ||
    filters.sortBy !== 'name' ||
    filters.sortOrder !== 'asc';

  return (
    <Card>
      <CardContent className="pt-6">
        <div className="space-y-4">
          {/* Search and Quick Filters */}
          <div className="flex flex-col gap-4 sm:flex-row">
            <div className="flex-1">
              <SearchBar
                placeholder="Search products..."
                value={filters.search}
                onSearch={(value) => updateFilter('search', value)}
                debounceMs={300}
              />
            </div>
            <div className="flex gap-2">
              <Select
                value={filters.category || 'all'}
                onValueChange={(value) => updateFilter('category', value === 'all' ? '' : value)}
              >
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="All Categories" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {(categories ?? []).map((category) => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select
                value={filters.sortBy}
                onValueChange={(value) => updateFilter('sortBy', value as any)}
              >
                <SelectTrigger className="w-[150px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="name">Sort by Name</SelectItem>
                  <SelectItem value="price">Sort by Price</SelectItem>
                  <SelectItem value="stock">Sort by Stock</SelectItem>
                </SelectContent>
              </Select>
              <Select
                value={filters.sortOrder}
                onValueChange={(value) => updateFilter('sortOrder', value as any)}
              >
                <SelectTrigger className="w-[120px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="asc">Ascending</SelectItem>
                  <SelectItem value="desc">Descending</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Additional Filters */}
          <div className="flex flex-wrap items-center gap-2">
            <Button
              variant={filters.lowStock ? 'default' : 'outline'}
              size="sm"
              onClick={() => updateFilter('lowStock', !filters.lowStock)}
            >
              <Filter className="mr-2 h-4 w-4" />
              Low Stock
            </Button>
            <Button
              variant={filters.isActive ? 'default' : 'outline'}
              size="sm"
              onClick={() => updateFilter('isActive', !filters.isActive)}
            >
              {filters.isActive ? 'Active Only' : 'All Products'}
            </Button>
            {hasActiveFilters && (
              <Button variant="ghost" size="sm" onClick={clearFilters}>
                <X className="mr-2 h-4 w-4" />
                Clear Filters
              </Button>
            )}
          </div>

          {/* Active Filters Badges */}
          {hasActiveFilters && (
            <div className="flex flex-wrap gap-2">
              {filters.search && (
                <Badge variant="secondary" className="gap-1">
                  Search: {filters.search}
                  <button
                    type="button"
                    onClick={() => updateFilter('search', '')}
                    className="ml-1 hover:text-destructive"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              )}
              {filters.category && (
                <Badge variant="secondary" className="gap-1">
                  Category: {filters.category}
                  <button
                    type="button"
                    onClick={() => updateFilter('category', '')}
                    className="ml-1 hover:text-destructive"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              )}
              {filters.lowStock && (
                <Badge variant="secondary" className="gap-1">
                  Low Stock
                  <button
                    type="button"
                    onClick={() => updateFilter('lowStock', false)}
                    className="ml-1 hover:text-destructive"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              )}
              {!filters.isActive && (
                <Badge variant="secondary" className="gap-1">
                  Including Inactive
                  <button
                    type="button"
                    onClick={() => updateFilter('isActive', true)}
                    className="ml-1 hover:text-destructive"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              )}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
