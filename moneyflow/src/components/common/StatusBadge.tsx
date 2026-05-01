// src/components/common/StatusBadge.tsx
import { LucideIcon } from 'lucide-react';
import {
  CheckCircle,
  XCircle,
  AlertCircle,
  Clock,
  FileEdit,
  Send,
  Pause,
  Zap,
  Circle,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { getStatusConfig, type StatusConfig } from '@/constants/status';

interface StatusBadgeProps {
  /**
   * Status value (invoice status, subscription status, etc.)
   */
  status: string;
  /**
   * Status type
   */
  type?: 'invoice' | 'subscription' | 'custom';
  /**
   * Custom status configuration
   */
  customConfig?: StatusConfig;
  /**
   * Custom label (used when type is 'custom')
   */
  label?: React.ReactNode;
  /**
   * Show icon
   */
  showIcon?: boolean;
  /**
   * Custom className
   */
  className?: string;
  /**
   * Size variant
   */
  size?: 'sm' | 'md' | 'lg';
}

const iconMap: Record<string, LucideIcon> = {
  CheckCircle,
  XCircle,
  AlertCircle,
  Clock,
  FileEdit,
  Send,
  Pause,
  Zap,
  Circle,
};

const sizeClasses = {
  sm: 'text-xs px-2 py-0.5',
  md: 'text-sm px-2.5 py-0.5',
  lg: 'text-base px-3 py-1',
};

/**
 * Production-ready status badge component
 * Displays status with appropriate colors and icons
 */
export function StatusBadge({
  status,
  type = 'invoice',
  customConfig,
  showIcon = true,
  className,
  size = 'md',
  label,
}: StatusBadgeProps) {
  const config = customConfig ||
    (type === 'custom'
      ? {
          label: label || status,
          color: 'gray',
          bgColor: 'bg-gray-100 dark:bg-gray-800',
          textColor: 'text-gray-700 dark:text-gray-300',
          icon: 'Circle',
        }
      : getStatusConfig(type, status)) || {
      label: label || status,
      color: 'gray',
      bgColor: 'bg-gray-100 dark:bg-gray-800',
      textColor: 'text-gray-700 dark:text-gray-300',
      icon: 'Circle',
    };

  const IconComponent = iconMap[(config as any).icon ?? 'Circle'] || AlertCircle;

  return (
    <Badge
      className={cn(
        config.bgColor,
        config.textColor,
        sizeClasses[size],
        'inline-flex items-center gap-1.5 font-medium',
        className
      )}
    >
      {showIcon && <IconComponent className="h-3 w-3" />}
      <span>{config.label}</span>
    </Badge>
  );
}
