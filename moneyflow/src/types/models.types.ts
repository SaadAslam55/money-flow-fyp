// src/types/models.types.ts
/**
 * Domain Model Type Definitions
 * 
 * Business domain models that extend database types with computed properties
 * and business logic types
 */

import type { User as DatabaseUser, Organization as DatabaseOrganization } from './database.types';

/**
 * User domain model with computed properties
 */
export interface User extends DatabaseUser {
  displayName: string;
  initials: string;
  isAdmin: boolean;
  isActive: boolean;
  permissions: string[];
}

/**
 * Organization domain model with computed properties
 */
export interface Organization extends DatabaseOrganization {
  displayName: string;
  isActive: boolean;
  isTrial: boolean;
  daysUntilTrialEnd?: number;
  canUpgrade: boolean;
  canDowngrade: boolean;
  usage: {
    users: number;
    customers: number;
    invoices_this_month: number;
  };
}

/**
 * Customer domain model
 */
export interface Customer {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  displayName: string;
  isActive: boolean;
  hasOutstandingBalance: boolean;
  totalPurchases: number;
  lastPurchaseDate?: string;
}

/**
 * Product domain model
 */
export interface Product {
  id: string;
  name: string;
  sku?: string;
  displayName: string;
  isLowStock: boolean;
  isOutOfStock: boolean;
  stockStatus: 'in_stock' | 'low_stock' | 'out_of_stock';
  profitMargin: number;
  totalSold: number;
}

/**
 * Invoice domain model
 */
export interface Invoice {
  id: string;
  invoiceNumber: string;
  displayName: string;
  status: string;
  isOverdue: boolean;
  daysUntilDue: number;
  paymentProgress: number;
  canEdit: boolean;
  canDelete: boolean;
  canRecordPayment: boolean;
}
