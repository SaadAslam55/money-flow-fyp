// src/components/ui/responsive-table.tsx
/**
 * Responsive Table Component
 * Automatically adapts table layout for mobile devices
 */

import { cn } from '@/lib/utils';
import { useIsMobile } from '@/hooks/useBreakpoint';

interface Column<T> {
  key: string;
  header: string;
  render: (item: T) => React.ReactNode;
  className?: string;
  mobileLabel?: string;
}

interface ResponsiveTableProps<T> {
  data: T[];
  columns: Column<T>[];
  getRowKey: (item: T) => string;
  emptyMessage?: string;
  className?: string;
  onRowClick?: (item: T) => void;
  loading?: boolean;
}

/**
 * Table that switches to card layout on mobile
 */
export function ResponsiveTable<T>({
  data,
  columns,
  getRowKey,
  emptyMessage = 'No data available',
  className,
  onRowClick,
  loading = false,
}: ResponsiveTableProps<T>) {
  const isMobile = useIsMobile();

  if (loading) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="h-16 animate-pulse rounded-lg bg-muted" />
        ))}
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className="flex min-h-[200px] items-center justify-center rounded-lg border border-dashed">
        <p className="text-sm text-muted-foreground">{emptyMessage}</p>
      </div>
    );
  }

  if (isMobile) {
    return (
      <div className={cn('space-y-4', className)}>
        {data.map((item) => (
          <div
            key={getRowKey(item)}
            onClick={() => onRowClick?.(item)}
            className={cn(
              'rounded-lg border bg-card p-4 shadow-sm',
              onRowClick && 'cursor-pointer transition-colors hover:bg-accent'
            )}
          >
            <div className="space-y-3">
              {columns.map((column) => (
                <div key={column.key} className="flex justify-between gap-4">
                  <span className="text-sm font-medium text-muted-foreground">
                    {column.mobileLabel || column.header}:
                  </span>
                  <span className="text-sm">{column.render(item)}</span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className={cn('overflow-x-auto rounded-lg border', className)}>
      <table className="w-full">
        <thead>
          <tr className="border-b bg-muted/50">
            {columns.map((column) => (
              <th
                key={column.key}
                className={cn(
                  'px-4 py-3 text-left text-sm font-medium text-muted-foreground',
                  column.className
                )}
              >
                {column.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((item) => (
            <tr
              key={getRowKey(item)}
              onClick={() => onRowClick?.(item)}
              className={cn(
                'border-b transition-colors last:border-0',
                onRowClick && 'cursor-pointer hover:bg-muted/50'
              )}
            >
              {columns.map((column) => (
                <td key={column.key} className={cn('px-4 py-3 text-sm', column.className)}>
                  {column.render(item)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/**
 * Responsive data list (simple card-based layout)
 */
interface ResponsiveDataListProps<T> {
  data: T[];
  renderItem: (item: T) => React.ReactNode;
  getItemKey: (item: T) => string;
  emptyMessage?: string;
  className?: string;
  grid?: boolean;
}

export function ResponsiveDataList<T>({
  data,
  renderItem,
  getItemKey,
  emptyMessage = 'No items found',
  className,
  grid = false,
}: ResponsiveDataListProps<T>) {
  if (data.length === 0) {
    return (
      <div className="flex min-h-[200px] items-center justify-center rounded-lg border border-dashed">
        <p className="text-sm text-muted-foreground">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className={cn(grid ? 'grid gap-4 sm:grid-cols-2 lg:grid-cols-3' : 'space-y-4', className)}>
      {data.map((item) => (
        <div key={getItemKey(item)}>{renderItem(item)}</div>
      ))}
    </div>
  );
}
