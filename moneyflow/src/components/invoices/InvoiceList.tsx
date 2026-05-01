// src/components/invoices/InvoiceList.tsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FileText,
  MoreVertical,
  Send,
  Download,
  Copy,
  Trash2,
  Eye,
  DollarSign,
  Filter,
  CheckSquare,
  Square,
  Trash,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { formatDate, calculateDaysUntilDue } from '@/lib/invoiceFormatters';
import { Loader } from '@/components/common/Loader';
import { EmptyState } from '@/components/common/EmptyState';
import { SearchBar } from '@/components/common/SearchBar';
import { CurrencyDisplay } from '@/components/common/CurrencyDisplay';
import { StatusBadge } from '@/components/common/StatusBadge';
import { ConfirmDialog } from '@/components/common/ConfirmDialog';
import type { InvoiceWithDetails } from '@/types/invoice.types';
import type { InvoiceStatus } from '@/types/database.types';

interface InvoiceListProps {
  invoices: InvoiceWithDetails[];
  isLoading: boolean;
  onSend: (invoiceId: string) => void;
  onDownload: (invoiceId: string) => void;
  onDuplicate: (invoiceId: string) => void;
  onDelete: (invoiceId: string) => void;
  onRecordPayment: (invoiceId: string) => void;
  onBulkDelete?: (invoiceIds: string[]) => void;
  onBulkSend?: (invoiceIds: string[]) => void;
}

export function InvoiceList({
  invoices,
  isLoading,
  onSend,
  onDownload,
  onDuplicate,
  onDelete,
  onRecordPayment,
  onBulkDelete,
  onBulkSend,
}: InvoiceListProps) {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('date_desc');
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [bulkDeleteConfirm, setBulkDeleteConfirm] = useState(false);


  const getDueDateBadge = (invoice: InvoiceWithDetails) => {
    if (invoice.status === 'paid' || invoice.status === 'cancelled') {
      return null;
    }

    const { days, isOverdue, label } = calculateDaysUntilDue(invoice.due_date);

    if (isOverdue) {
      return <span className="text-xs font-medium text-red-600">{label}</span>;
    } else if (days <= 3) {
      return <span className="text-xs font-medium text-orange-600">{label}</span>;
    }

    return null;
  };

  // Bulk selection helpers
  const toggleSelect = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };

  const toggleSelectAll = () => {
    if (selectedIds.size === filteredInvoices.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(filteredInvoices.map((i) => i.id)));
    }
  };

  // Filter and sort invoices
  const filteredInvoices = invoices
    .filter((invoice) => {
      // Status filter
      if (statusFilter !== 'all' && invoice.status !== statusFilter) {
        return false;
      }

      // Search filter
      if (searchTerm) {
        const searchLower = searchTerm.toLowerCase();
        return (
          invoice.invoice_number.toLowerCase().includes(searchLower) ||
          invoice.customer.name.toLowerCase().includes(searchLower) ||
          invoice.customer.email?.toLowerCase().includes(searchLower)
        );
      }

      return true;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'date_desc':
          return new Date(b.invoice_date).getTime() - new Date(a.invoice_date).getTime();
        case 'date_asc':
          return new Date(a.invoice_date).getTime() - new Date(b.invoice_date).getTime();
        case 'amount_desc':
          return b.total_amount - a.total_amount;
        case 'amount_asc':
          return a.total_amount - b.total_amount;
        case 'customer_asc':
          return a.customer.name.localeCompare(b.customer.name);
        case 'customer_desc':
          return b.customer.name.localeCompare(a.customer.name);
        default:
          return 0;
      }
    });

  if (isLoading) {
    return <Loader size="lg" message="Loading invoices..." />;
  }

  if (invoices.length === 0) {
    return (
      <EmptyState
        icon={FileText}
        title="No invoices found"
        description="Create your first invoice to get started"
        action={{
          label: 'Create Invoice',
          onClick: () => navigate('/invoices/new'),
        }}
      />
    );
  }

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex flex-col gap-3 sm:flex-row">
        <div className="flex-1">
          <SearchBar
            placeholder="Search invoices..."
            value={searchTerm}
            onSearch={setSearchTerm}
            debounceMs={300}
          />
        </div>

        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-full sm:w-48">
            <Filter className="mr-2 h-4 w-4" />
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="draft">Draft</SelectItem>
            <SelectItem value="sent">Sent</SelectItem>
            <SelectItem value="paid">Paid</SelectItem>
            <SelectItem value="partially_paid">Partially Paid</SelectItem>
            <SelectItem value="overdue">Overdue</SelectItem>
            <SelectItem value="cancelled">Cancelled</SelectItem>
          </SelectContent>
        </Select>

        <Select value={sortBy} onValueChange={setSortBy}>
          <SelectTrigger className="w-full sm:w-48">
            <SelectValue placeholder="Sort by" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="date_desc">Date (Newest)</SelectItem>
            <SelectItem value="date_asc">Date (Oldest)</SelectItem>
            <SelectItem value="amount_desc">Amount (High)</SelectItem>
            <SelectItem value="amount_asc">Amount (Low)</SelectItem>
            <SelectItem value="customer_asc">Customer (A-Z)</SelectItem>
            <SelectItem value="customer_desc">Customer (Z-A)</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Bulk Actions Bar */}
      {selectedIds.size > 0 && (
        <div className="flex items-center gap-3 rounded-lg border bg-muted/50 p-3">
          <span className="text-sm font-medium">{selectedIds.size} selected</span>
          {onBulkSend && (
            <Button variant="outline" size="sm" onClick={() => { onBulkSend(Array.from(selectedIds)); setSelectedIds(new Set()); }}>
              <Send className="mr-2 h-3.5 w-3.5" /> Send Selected
            </Button>
          )}
          {onBulkDelete && (
            <Button variant="destructive" size="sm" onClick={() => setBulkDeleteConfirm(true)}>
              <Trash className="mr-2 h-3.5 w-3.5" /> Delete Selected
            </Button>
          )}
          <Button variant="ghost" size="sm" onClick={() => setSelectedIds(new Set())}>Clear</Button>
        </div>
      )}

      {/* Results count */}
      <div className="text-sm text-muted-foreground">
        Showing {filteredInvoices.length} of {invoices.length} invoices
      </div>

      {/* Desktop Table View */}
      <div className="hidden overflow-hidden rounded-lg border md:block">
        <Table>
          <TableHeader className="sticky top-0 z-10 bg-background">
            <TableRow className="border-b hover:bg-transparent">
              <TableHead className="w-10">
                <button onClick={toggleSelectAll} className="flex items-center justify-center" aria-label="Select all">
                  {selectedIds.size === filteredInvoices.length && filteredInvoices.length > 0 ? (
                    <CheckSquare className="h-4 w-4 text-primary" />
                  ) : (
                    <Square className="h-4 w-4 text-muted-foreground" />
                  )}
                </button>
              </TableHead>
              <TableHead className="font-semibold">Invoice #</TableHead>
              <TableHead className="font-semibold">Customer</TableHead>
              <TableHead className="font-semibold">Date</TableHead>
              <TableHead className="font-semibold">Due Date</TableHead>
              <TableHead className="font-semibold">Amount</TableHead>
              <TableHead className="font-semibold">Status</TableHead>
              <TableHead className="w-12"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredInvoices.map((invoice) => (
              <TableRow
                key={invoice.id}
                className={`cursor-pointer transition-colors hover:bg-muted/50 ${selectedIds.has(invoice.id) ? 'bg-primary/5' : ''}`}
                onClick={() => navigate(`/invoices/${invoice.id}`)}
              >
                <TableCell onClick={(e) => e.stopPropagation()}>
                  <button onClick={() => toggleSelect(invoice.id)} aria-label="Select invoice">
                    {selectedIds.has(invoice.id) ? (
                      <CheckSquare className="h-4 w-4 text-primary" />
                    ) : (
                      <Square className="h-4 w-4 text-muted-foreground" />
                    )}
                  </button>
                </TableCell>
                <TableCell className="font-medium">{invoice.invoice_number}</TableCell>
                <TableCell>
                  <div>
                    <div className="font-medium">{invoice.customer.name}</div>
                    <div className="text-sm text-muted-foreground">{invoice.customer.email}</div>
                  </div>
                </TableCell>
                <TableCell>{formatDate(invoice.invoice_date)}</TableCell>
                <TableCell>
                  <div className="space-y-1">
                    <div
                      className={
                        new Date(invoice.due_date) < new Date() && invoice.status !== 'paid'
                          ? 'font-medium text-destructive'
                          : ''
                      }
                    >
                      {formatDate(invoice.due_date)}
                    </div>
                    {getDueDateBadge(invoice)}
                  </div>
                </TableCell>
                <TableCell>
                  <div>
                    <CurrencyDisplay amount={invoice.total_amount} size="sm" />
                    {invoice.amount_due > 0 && invoice.status !== 'paid' && (
                      <div className="text-sm text-muted-foreground mt-1">
                        Due: <CurrencyDisplay amount={invoice.amount_due} variant="negative" size="sm" />
                      </div>
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  <StatusBadge status={invoice.status} type="invoice" size="sm" />
                </TableCell>
                <TableCell onClick={(e) => e.stopPropagation()}>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-48">
                      <DropdownMenuItem onClick={() => navigate(`/invoices/${invoice.id}`)}>
                        <Eye className="mr-2 h-4 w-4" />
                        View Details
                      </DropdownMenuItem>
                      {invoice.status !== 'paid' && invoice.status !== 'cancelled' && (
                        <DropdownMenuItem onClick={() => onRecordPayment(invoice.id)}>
                          <DollarSign className="mr-2 h-4 w-4" />
                          Record Payment
                        </DropdownMenuItem>
                      )}
                      <DropdownMenuItem onClick={() => onSend(invoice.id)}>
                        <Send className="mr-2 h-4 w-4" />
                        Send Invoice
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => onDownload(invoice.id)}>
                        <Download className="mr-2 h-4 w-4" />
                        Download PDF
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => onDuplicate(invoice.id)}>
                        <Copy className="mr-2 h-4 w-4" />
                        Duplicate
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        onClick={() => setDeleteConfirm(invoice.id)}
                        className="text-destructive focus:text-destructive"
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Mobile Card View */}
      <div className="space-y-3 md:hidden">
        {filteredInvoices.map((invoice) => (
          <Card
            key={invoice.id}
            className="cursor-pointer transition-shadow hover:shadow-md"
            onClick={() => navigate(`/invoices/${invoice.id}`)}
          >
            <CardContent className="space-y-3 p-4">
              <div className="flex items-start justify-between">
                <div>
                  <div className="text-lg font-medium">{invoice.invoice_number}</div>
                  <div className="text-sm text-muted-foreground">{invoice.customer.name}</div>
                </div>
                <div className="flex items-center gap-2">
                  <StatusBadge status={invoice.status} type="invoice" size="sm" />
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-48">
                      <DropdownMenuItem onClick={() => navigate(`/invoices/${invoice.id}`)}>
                        <Eye className="mr-2 h-4 w-4" />
                        View
                      </DropdownMenuItem>
                      {invoice.status !== 'paid' && invoice.status !== 'cancelled' && (
                        <DropdownMenuItem onClick={() => onRecordPayment(invoice.id)}>
                          <DollarSign className="mr-2 h-4 w-4" />
                          Payment
                        </DropdownMenuItem>
                      )}
                      <DropdownMenuItem onClick={() => onSend(invoice.id)}>
                        <Send className="mr-2 h-4 w-4" />
                        Send
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => onDownload(invoice.id)}>
                        <Download className="mr-2 h-4 w-4" />
                        Download
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => onDuplicate(invoice.id)}>
                        <Copy className="mr-2 h-4 w-4" />
                        Duplicate
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        onClick={() => setDeleteConfirm(invoice.id)}
                        className="text-destructive"
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 text-sm">
                <div>
                  <div className="text-muted-foreground">Date</div>
                  <div className="font-medium">{formatDate(invoice.invoice_date, 'short')}</div>
                </div>
                <div>
                  <div className="text-muted-foreground">Due</div>
                  <div
                    className={
                      new Date(invoice.due_date) < new Date() && invoice.status !== 'paid'
                        ? 'font-medium text-destructive'
                        : 'font-medium'
                    }
                  >
                    {formatDate(invoice.due_date, 'short')}
                  </div>
                </div>
              </div>

              {getDueDateBadge(invoice) && <div>{getDueDateBadge(invoice)}</div>}

              <div className="flex items-center justify-between border-t pt-2">
                <div>
                  <div className="text-sm text-muted-foreground">Total Amount</div>
                  <CurrencyDisplay amount={invoice.total_amount} size="lg" />
                  {invoice.amount_due > 0 && invoice.status !== 'paid' && (
                    <div className="text-sm text-muted-foreground mt-1">
                      Due: <CurrencyDisplay amount={invoice.amount_due} variant="negative" size="sm" />
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredInvoices.length === 0 && invoices.length > 0 && (
        <EmptyState
          icon={FileText}
          title="No invoices match your filters"
          description="Try adjusting your search or filter criteria"
          action={{
            label: 'Clear Filters',
            onClick: () => {
              setSearchTerm('');
              setStatusFilter('all');
            },
            variant: 'outline',
          }}
        />
      )}

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        open={!!deleteConfirm}
        onClose={() => setDeleteConfirm(null)}
        onConfirm={async () => {
          if (deleteConfirm) {
            await onDelete(deleteConfirm);
            setDeleteConfirm(null);
          }
        }}
        title="Delete Invoice"
        description="Are you sure you want to delete this invoice? This action cannot be undone."
        confirmText="Delete"
        cancelText="Cancel"
        variant="destructive"
      />

      {/* Bulk Delete Confirmation Dialog */}
      <ConfirmDialog
        open={bulkDeleteConfirm}
        onClose={() => setBulkDeleteConfirm(false)}
        onConfirm={async () => {
          if (onBulkDelete) {
            await onBulkDelete(Array.from(selectedIds));
            setSelectedIds(new Set());
            setBulkDeleteConfirm(false);
          }
        }}
        title="Delete Selected Invoices"
        description={`Are you sure you want to delete ${selectedIds.size} invoices? This action cannot be undone.`}
        confirmText="Delete All"
        cancelText="Cancel"
        variant="destructive"
      />
    </div>
  );
}
