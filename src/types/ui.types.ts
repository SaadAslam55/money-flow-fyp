// src/types/ui.types.ts
/**
 * UI Component Type Definitions
 * 
 * Types for UI components, form controls, and user interface elements
 */

import type React from 'react';

// ============================================
// FORM TYPES
// ============================================

/**
 * Form field state
 */
export interface FormFieldState {
  value: unknown;
  error?: string;
  touched: boolean;
  dirty: boolean;
}

/**
 * Form state
 */
export interface FormState<T = Record<string, unknown>> {
  values: T;
  errors: Partial<Record<keyof T, string>>;
  touched: Partial<Record<keyof T, boolean>>;
  dirty: boolean;
  isValid: boolean;
  isSubmitting: boolean;
  submitCount: number;
}

/**
 * Form validation result
 */
export interface ValidationResult {
  isValid: boolean;
  errors: Record<string, string>;
}

// ============================================
// TABLE TYPES
// ============================================

/**
 * Table column definition
 */
export interface TableColumn<T = unknown> {
  id: string;
  header: string;
  accessor?: keyof T | ((row: T) => React.ReactNode);
  sortable?: boolean;
  filterable?: boolean;
  width?: string | number;
  align?: 'left' | 'center' | 'right';
  cell?: (value: unknown, row: T) => React.ReactNode;
}

/**
 * Table sort state
 */
export interface TableSort {
  column: string;
  direction: 'asc' | 'desc';
}

/**
 * Table filter
 */
export interface TableFilter {
  column: string;
  operator: 'equals' | 'contains' | 'startsWith' | 'endsWith' | 'greaterThan' | 'lessThan';
  value: unknown;
}

/**
 * Table pagination
 */
export interface TablePagination {
  page: number;
  perPage: number;
  total: number;
  totalPages: number;
}

/**
 * Table state
 */
export interface TableState<T = unknown> {
  data: T[];
  columns: TableColumn<T>[];
  sort?: TableSort;
  filters: TableFilter[];
  pagination: TablePagination;
  selectedRows: string[];
  isLoading: boolean;
}

// ============================================
// MODAL/DIALOG TYPES
// ============================================

/**
 * Dialog state
 */
export interface DialogState {
  isOpen: boolean;
  title?: string;
  content?: React.ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
  onClose?: () => void;
}

/**
 * Confirm dialog options
 */
export interface ConfirmDialogOptions {
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  variant?: 'default' | 'destructive';
  onConfirm: () => void | Promise<void>;
  onCancel?: () => void;
}

// ============================================
// TOAST/NOTIFICATION TYPES
// ============================================

/**
 * Toast type
 */
export type ToastType = 'success' | 'error' | 'warning' | 'info';

/**
 * Toast options
 */
export interface ToastOptions {
  title?: string;
  description?: string;
  duration?: number;
  action?: {
    label: string;
    onClick: () => void;
  };
  cancel?: {
    label: string;
    onClick: () => void;
  };
}

/**
 * Notification
 */
export interface Notification {
  id: string;
  type: ToastType;
  title: string;
  description?: string;
  timestamp: number;
  read: boolean;
  actionUrl?: string;
}

// ============================================
// LOADING STATES
// ============================================

/**
 * Loading state
 */
export interface LoadingState {
  isLoading: boolean;
  message?: string;
  progress?: number;
}

/**
 * Async operation state
 */
export interface AsyncState<T = unknown> {
  data: T | null;
  isLoading: boolean;
  error: Error | null;
  isSuccess: boolean;
  isError: boolean;
}

// ============================================
// SEARCH/FILTER TYPES
// ============================================

/**
 * Search state
 */
export interface SearchState {
  query: string;
  isActive: boolean;
  results?: unknown[];
  isLoading: boolean;
}

/**
 * Filter option
 */
export interface FilterOption {
  value: string;
  label: string;
  count?: number;
  disabled?: boolean;
}

/**
 * Filter group
 */
export interface FilterGroup {
  id: string;
  label: string;
  type: 'select' | 'multiselect' | 'date' | 'daterange' | 'number' | 'numberrange';
  options?: FilterOption[];
  value?: unknown;
}

// ============================================
// PAGINATION TYPES
// ============================================

/**
 * Pagination state
 */
export interface PaginationState {
  page: number;
  perPage: number;
  total: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

/**
 * Pagination controls
 */
export interface PaginationControls {
  goToPage: (page: number) => void;
  nextPage: () => void;
  previousPage: () => void;
  setPerPage: (perPage: number) => void;
}

// ============================================
// FILE UPLOAD TYPES
// ============================================

/**
 * File upload state
 */
export interface FileUploadState {
  file: File | null;
  progress: number;
  status: 'idle' | 'uploading' | 'success' | 'error';
  error?: string;
  url?: string;
}

/**
 * File upload options
 */
export interface FileUploadOptions {
  accept?: string;
  maxSize?: number; // in bytes
  multiple?: boolean;
  onProgress?: (progress: number) => void;
  onSuccess?: (url: string) => void;
  onError?: (error: Error) => void;
}

// ============================================
// CHART TYPES
// ============================================

/**
 * Chart data point
 */
export interface ChartDataPoint {
  label: string;
  value: number;
  color?: string;
  metadata?: Record<string, unknown>;
}

/**
 * Chart series
 */
export interface ChartSeries {
  name: string;
  data: ChartDataPoint[];
  color?: string;
}

/**
 * Chart configuration
 */
export interface ChartConfig {
  type: 'line' | 'bar' | 'pie' | 'area' | 'scatter';
  title?: string;
  xAxisLabel?: string;
  yAxisLabel?: string;
  showLegend?: boolean;
  showGrid?: boolean;
  responsive?: boolean;
}

// ============================================
// THEME TYPES
// ============================================

/**
 * Theme mode
 */
export type ThemeMode = 'light' | 'dark' | 'system';

/**
 * Theme configuration
 */
export interface ThemeConfig {
  mode: ThemeMode;
  primaryColor?: string;
  fontFamily?: string;
  borderRadius?: number;
}

// ============================================
// LAYOUT TYPES
// ============================================

/**
 * Sidebar state
 */
export interface SidebarState {
  isOpen: boolean;
  isCollapsed: boolean;
  width: number;
}

/**
 * Layout breakpoint
 */
export type Breakpoint = 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';

/**
 * Responsive value
 */
export type ResponsiveValue<T> = T | Partial<Record<Breakpoint, T>>;

// ============================================
// NAVIGATION TYPES
// ============================================

/**
 * Navigation item
 */
export interface NavItem {
  id: string;
  label: string;
  href: string;
  icon?: React.ComponentType;
  badge?: string | number;
  children?: NavItem[];
  disabled?: boolean;
  external?: boolean;
}

/**
 * Breadcrumb item
 */
export interface BreadcrumbItem {
  label: string;
  href?: string;
  icon?: React.ComponentType;
}

// ============================================
// DROPZONE TYPES
// ============================================

/**
 * Dropzone state
 */
export interface DropzoneState {
  isDragActive: boolean;
  isDragAccept: boolean;
  isDragReject: boolean;
  files: File[];
}

// ============================================
// DATE PICKER TYPES
// ============================================

/**
 * Date range
 */
export interface DateRange {
  start: Date | null;
  end: Date | null;
}

/**
 * Date picker mode
 */
export type DatePickerMode = 'single' | 'range' | 'multiple';

