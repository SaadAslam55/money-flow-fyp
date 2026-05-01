// src/components/invoices/InvoiceStatusBadge.tsx
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { StatusBadge } from '@/components/common/StatusBadge';
import { INVOICE_STATUS } from '@/constants/invoiceStatus';
import type { InvoiceStatus } from '@/types/database.types';

interface InvoiceStatusBadgeProps {
  status: InvoiceStatus;
  showTooltip?: boolean;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

/**
 * InvoiceStatusBadge - Wrapper around common StatusBadge with tooltip support
 * 
 * @example
 * <InvoiceStatusBadge status="paid" />
 * <InvoiceStatusBadge status="overdue" showTooltip size="lg" />
 */
export function InvoiceStatusBadge({ 
  status, 
  showTooltip = false, 
  className,
  size = 'md' 
}: InvoiceStatusBadgeProps) {
  const config = INVOICE_STATUS[status];
  
  const badge = (
    <StatusBadge
      status={status}
      type="invoice"
      size={size}
      className={className}
    />
  );

  if (showTooltip) {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            {badge}
          </TooltipTrigger>
          <TooltipContent>
            <p className="font-medium">{config.label}</p>
            <p className="text-xs text-muted-foreground">{config.description}</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  return badge;
}

