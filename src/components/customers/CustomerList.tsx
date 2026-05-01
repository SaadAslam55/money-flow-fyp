// src/components/customers/CustomerList.tsx
import { logger } from '@/lib/logger';
import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  MoreVertical, 
  Filter, 
  Download, 
  Upload, 
  Plus,
  Edit,
  Trash2,
  Eye,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Users
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { SearchBar } from '@/components/common/SearchBar';
import { EmptyState } from '@/components/common/EmptyState';
import { CurrencyDisplay } from '@/components/common/CurrencyDisplay';
import { ConfirmDialog } from '@/components/common/ConfirmDialog';
import { Loader } from '@/components/common/Loader';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { formatDate } from '@/lib/formatters';
import { useCustomers } from '@/hooks/useCustomers';
import type { Customer } from '@/types/database.types';

interface CustomerListProps {
  onEdit?: (customer: Customer) => void;
  onDelete?: (customer: Customer) => void;
  onView?: (customer: Customer) => void;
  onImport?: () => void;
  onExport?: () => void;
  onCreate?: () => void;
}

export function CustomerList({
  onEdit,
  onDelete,
  onView,
  onImport,
  onExport,
  onCreate,
}: CustomerListProps) {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'name' | 'balance' | 'created_at'>('name');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [hasOutstanding, setHasOutstanding] = useState<boolean | undefined>(undefined);
  const [page, setPage] = useState(1);
  const [deleteConfirm, setDeleteConfirm] = useState<Customer | null>(null);
  const perPage = 20;

  const filters = useMemo(() => ({
    search: searchQuery || undefined,
    hasOutstanding,
    sortBy,
    sortOrder,
  }), [searchQuery, hasOutstanding, sortBy, sortOrder]);

  let { customers, count, isLoading, deleteCustomer, exportCustomers, isDeleting, isExporting,  } = useCustomers(filters, page);

  const totalPages = Math.ceil(count / perPage);

  const handleDelete = async () => {
    if (!deleteConfirm) return;
    
    try {
      await deleteCustomer(deleteConfirm.id);
      if (onDelete) onDelete(deleteConfirm);
      setDeleteConfirm(null);
    } catch (error) {

      logger.error('Failed to delete customer:', error instanceof Error ? error.message : String(error));
    }
  };

  const handleExport = async () => {
    try {
      await exportCustomers();
      if (onExport) onExport();
    } catch (error) {

      logger.error('Failed to export customers:', error instanceof Error ? error.message : String(error));
    }
  };

  const handleSort = (field: 'name' | 'balance' | 'created_at') => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('asc');
    }
  };

  if (isLoading && customers.length === 0) {
    return <Loader size="lg" message="Loading customers..." />;
  }

  if (customers.length === 0 && !isLoading) {
    return (
      <EmptyState
        icon={Users}
        title="No customers found"
        description={searchQuery 
          ? `No customers match your search "${searchQuery}"`
          : "Get started by creating your first customer"}
        action={onCreate ? {
          label: 'Create First Customer',
          onClick: onCreate,
        } : undefined}
      />
    );
  }

  return (
    <div className="space-y-4">
      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <SearchBar
            placeholder="Search customers by name, email, or phone..."
            value={searchQuery}
            onSearch={setSearchQuery}
            debounceMs={300}
          />
        </div>
        <div className="flex gap-2">
          <Select
            value={hasOutstanding === undefined ? 'all' : hasOutstanding ? 'outstanding' : 'none'}
            onValueChange={(value) => {
              setHasOutstanding(
                value === 'all' ? undefined : value === 'outstanding'
              );
            }}
          >
            <SelectTrigger className="w-[180px]">
              <Filter className="mr-2 h-4 w-4" />
              <SelectValue placeholder="Filter" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Customers</SelectItem>
              <SelectItem value="outstanding">With Outstanding</SelectItem>
              <SelectItem value="none">No Outstanding</SelectItem>
            </SelectContent>
          </Select>
          {onImport && (
            <Button variant="outline" onClick={onImport}>
              <Upload className="mr-2 h-4 w-4" />
              Import
            </Button>
          )}
          {onExport && (
            <Button 
              variant="outline" 
              onClick={handleExport}
              disabled={isExporting}
            >
              <Download className="mr-2 h-4 w-4" />
              {isExporting ? 'Exporting...' : 'Export'}
            </Button>
          )}
          {onCreate && (
            <Button onClick={onCreate}>
              <Plus className="mr-2 h-4 w-4" />
              New Customer
            </Button>
          )}
        </div>
      </div>

      {/* Table */}
      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead 
                className="cursor-pointer hover:bg-muted/50"
                onClick={() => handleSort('name')}
              >
                <div className="flex items-center gap-2">
                  Customer
                  {sortBy === 'name' && (
                    <span className="text-xs">
                      {sortOrder === 'asc' ? '↑' : '↓'}
                    </span>
                  )}
                </div>
              </TableHead>
              <TableHead>Contact</TableHead>
              <TableHead>Location</TableHead>
              <TableHead 
                className="cursor-pointer hover:bg-muted/50 text-right"
                onClick={() => handleSort('balance')}
              >
                <div className="flex items-center justify-end gap-2">
                  Outstanding Balance
                  {sortBy === 'balance' && (
                    <span className="text-xs">
                      {sortOrder === 'asc' ? '↑' : '↓'}
                    </span>
                  )}
                </div>
              </TableHead>
              <TableHead 
                className="cursor-pointer hover:bg-muted/50"
                onClick={() => handleSort('created_at')}
              >
                <div className="flex items-center gap-2">
                  Created
                  {sortBy === 'created_at' && (
                    <span className="text-xs">
                      {sortOrder === 'asc' ? '↑' : '↓'}
                    </span>
                  )}
                </div>
              </TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {customers.map((customer) => (
              <TableRow key={customer.id} className="hover:bg-muted/50">
                <TableCell>
                  <div className="space-y-1">
                    <div className="font-medium">{customer.name}</div>
                    {customer.tax_id && (
                      <div className="text-xs text-muted-foreground">
                        Tax ID: {customer.tax_id}
                      </div>
                    )}
                    {customer.portal_access && (
                      <Badge variant="secondary" className="text-xs">
                        Portal Access
                      </Badge>
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  <div className="space-y-1">
                    {customer.email && (
                      <div className="flex items-center gap-2 text-sm">
                        <Mail className="h-3 w-3 text-muted-foreground" />
                        <span className="text-muted-foreground">{customer.email}</span>
                      </div>
                    )}
                    {customer.phone && (
                      <div className="flex items-center gap-2 text-sm">
                        <Phone className="h-3 w-3 text-muted-foreground" />
                        <span className="text-muted-foreground">{customer.phone}</span>
                      </div>
                    )}
                    {!customer.email && !customer.phone && (
                      <span className="text-muted-foreground text-sm">No contact info</span>
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  {customer.city || customer.country ? (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <MapPin className="h-3 w-3" />
                      <span>
                        {[customer.city, customer.country].filter(Boolean).join(', ') || 'N/A'}
                      </span>
                    </div>
                  ) : (
                    <span className="text-muted-foreground text-sm">N/A</span>
                  )}
                </TableCell>
                <TableCell className="text-right">
                  <CurrencyDisplay
                    amount={customer.outstanding_balance}
                    variant={customer.outstanding_balance > 0 ? 'negative' : 'muted'}
                    size="sm"
                  />
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Calendar className="h-3 w-3" />
                    {formatDate(customer.created_at, 'short')}
                  </div>
                </TableCell>
                <TableCell className="text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuLabel>Actions</DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      {onView && (
                        <DropdownMenuItem
                          onClick={() => {
                            navigate(`/customers/${customer.id}`);
                            if (onView) onView(customer);
                          }}
                        >
                          <Eye className="mr-2 h-4 w-4" />
                          View Details
                        </DropdownMenuItem>
                      )}
                      {onEdit && (
                        <DropdownMenuItem
                          onClick={() => {
                            navigate(`/customers/${customer.id}/edit`);
                            if (onEdit) onEdit(customer);
                          }}
                        >
                          <Edit className="mr-2 h-4 w-4" />
                          Edit
                        </DropdownMenuItem>
                      )}
                      <DropdownMenuSeparator />
                      {onDelete && (
                        <DropdownMenuItem
                          onClick={() => setDeleteConfirm(customer)}
                          className="text-destructive"
                          disabled={isDeleting}
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          Delete
                        </DropdownMenuItem>
                      )}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <div className="text-sm text-muted-foreground">
            Showing {((page - 1) * perPage) + 1} to {Math.min(page * perPage, count)} of {count} customers
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
            >
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
            >
              Next
            </Button>
          </div>
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        open={!!deleteConfirm}
        onClose={() => setDeleteConfirm(null)}
        onConfirm={handleDelete}
        title="Delete Customer"
        description={`Are you sure you want to delete ${deleteConfirm?.name}? This action cannot be undone.`}
        confirmText="Delete"
        cancelText="Cancel"
        variant="destructive"
        isLoading={isDeleting}
      />
    </div>
  );
}

