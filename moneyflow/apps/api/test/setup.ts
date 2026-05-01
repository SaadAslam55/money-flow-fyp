/**
 * Test Setup
 * Shared mocks and utilities for testing
 */

import { Test, TestingModule } from '@nestjs/testing';

// ============================================
// Mock Prisma Client
// ============================================

export const mockPrisma = {
  // Invoice operations
  invoice: {
    findMany: jest.fn(),
    findFirst: jest.fn(),
    findUnique: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    count: jest.fn(),
  },

  // Invoice items
  invoiceItem: {
    findMany: jest.fn(),
    create: jest.fn(),
    createMany: jest.fn(),
    update: jest.fn(),
    deleteMany: jest.fn(),
  },

  // Customer operations
  customer: {
    findMany: jest.fn(),
    findFirst: jest.fn(),
    findUnique: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    count: jest.fn(),
  },

  // Product operations
  product: {
    findMany: jest.fn(),
    findFirst: jest.fn(),
    findUnique: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    count: jest.fn(),
  },

  // Transaction operations
  transaction: {
    findMany: jest.fn(),
    findFirst: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    count: jest.fn(),
  },

  // Organization operations
  organization: {
    findFirst: jest.fn(),
    findUnique: jest.fn(),
    update: jest.fn(),
  },

  // User operations
  user: {
    findFirst: jest.fn(),
    findUnique: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
  },

  // Raw query operations
  $transaction: jest.fn((fn) => fn(mockPrisma)),
  $queryRaw: jest.fn(),
  $queryRawUnsafe: jest.fn(),
  $executeRaw: jest.fn(),
  $executeRawUnsafe: jest.fn(),
  $connect: jest.fn(),
  $disconnect: jest.fn(),
};

// ============================================
// Mock Redis Service
// ============================================

export const mockRedis = {
  get: jest.fn(),
  set: jest.fn(),
  del: jest.fn(),
  exists: jest.fn(),
  expire: jest.fn(),
  ttl: jest.fn(),
  incr: jest.fn(),
  incrby: jest.fn(),
  lpush: jest.fn(),
  lrange: jest.fn(),
  hget: jest.fn(),
  hset: jest.fn(),
  hgetall: jest.fn(),
  cache: jest.fn(),
  invalidatePattern: jest.fn(),
  healthCheck: jest.fn().mockResolvedValue(true),
};

// ============================================
// Mock Cache Manager
// ============================================

export const mockCacheManager = {
  get: jest.fn(),
  set: jest.fn(),
  invalidate: jest.fn(),
  invalidateByTag: jest.fn(),
  invalidateNamespace: jest.fn(),
  invalidateOrganization: jest.fn(),
  getOrSet: jest.fn((ns, key, fetcher) => fetcher()),
  getOrSetWithSWR: jest.fn((ns, key, fetcher) => fetcher()),
  getStats: jest.fn().mockReturnValue({ hits: 0, misses: 0, hitRate: '0%' }),
  healthCheck: jest.fn().mockResolvedValue(true),
};

// ============================================
// Mock Auth User
// ============================================

export const mockAuthUser = {
  id: 'user-123',
  email: 'test@example.com',
  organization_id: 'org-123',
  role: 'admin',
};

// ============================================
// Test Module Factory
// ============================================

export async function createTestingModule(metadata: any): Promise<TestingModule> {
  const module = await Test.createTestingModule({
    ...metadata,
  }).compile();

  return module;
}

// ============================================
// Reset All Mocks
// ============================================

export function resetMocks() {
  // Reset Prisma mocks
  const resetPrismaMocks = (obj: any) => {
    Object.values(obj).forEach((mock) => {
      if (typeof mock === 'object' && mock !== null) {
        Object.values(mock).forEach((m) => {
          if (typeof m === 'function' && 'mockReset' in m) {
            (m as jest.Mock).mockReset();
          }
        });
      } else if (typeof mock === 'function' && 'mockReset' in mock) {
        (mock as jest.Mock).mockReset();
      }
    });
  };

  resetPrismaMocks(mockPrisma);

  // Reset Redis mocks
  Object.values(mockRedis).forEach((mock) => {
    if (typeof mock === 'function' && 'mockReset' in mock) {
      (mock as jest.Mock).mockReset();
    }
  });

  // Reset Cache Manager mocks
  Object.values(mockCacheManager).forEach((mock) => {
    if (typeof mock === 'function' && 'mockReset' in mock) {
      (mock as jest.Mock).mockReset();
    }
  });

  // Restore default mock implementations
  mockRedis.healthCheck.mockResolvedValue(true);
  mockCacheManager.getOrSet.mockImplementation((ns, key, fetcher) => fetcher());
  mockCacheManager.getOrSetWithSWR.mockImplementation((ns, key, fetcher) => fetcher());
  mockCacheManager.getStats.mockReturnValue({ hits: 0, misses: 0, hitRate: '0%' });
}

// ============================================
// Test Data Factories
// ============================================

export const testDataFactory = {
  createInvoice: (overrides = {}) => ({
    id: 'inv-123',
    organization_id: 'org-123',
    customer_id: 'cust-123',
    invoice_number: 'INV-2024-00001',
    status: 'DRAFT',
    payment_status: 'UNPAID',
    subtotal: 1000,
    tax_amount: 100,
    discount_amount: 0,
    total: 1100,
    amount_paid: 0,
    balance_due: 1100,
    issue_date: new Date(),
    due_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    notes: null,
    terms: null,
    created_at: new Date(),
    updated_at: new Date(),
    deleted_at: null,
    created_by: 'user-123',
    ...overrides,
  }),

  createCustomer: (overrides = {}) => ({
    id: 'cust-123',
    organization_id: 'org-123',
    name: 'Test Customer',
    email: 'customer@example.com',
    phone: '+92 300 1234567',
    address: '123 Test Street',
    city: 'Lahore',
    country: 'Pakistan',
    status: 'ACTIVE',
    balance: 0,
    created_at: new Date(),
    updated_at: new Date(),
    deleted_at: null,
    ...overrides,
  }),

  createProduct: (overrides = {}) => ({
    id: 'prod-123',
    organization_id: 'org-123',
    name: 'Test Product',
    sku: 'TEST-001',
    description: 'A test product',
    category: 'Services',
    unit_price: 100,
    cost_price: 50,
    stock_quantity: 100,
    reorder_level: 10,
    status: 'ACTIVE',
    created_at: new Date(),
    updated_at: new Date(),
    deleted_at: null,
    ...overrides,
  }),

  createTransaction: (overrides = {}) => ({
    id: 'txn-123',
    organization_id: 'org-123',
    invoice_id: 'inv-123',
    customer_id: 'cust-123',
    type: 'INCOME',
    amount: 500,
    payment_method: 'CASH',
    reference: null,
    description: 'Payment received',
    transaction_date: new Date(),
    created_at: new Date(),
    created_by: 'user-123',
    ...overrides,
  }),

  createInvoiceItem: (overrides = {}) => ({
    id: 'item-123',
    invoice_id: 'inv-123',
    product_id: 'prod-123',
    description: 'Test Item',
    quantity: 2,
    unit_price: 500,
    tax_rate: 10,
    discount: 0,
    total: 1100,
    created_at: new Date(),
    ...overrides,
  }),
};

// ============================================
// Environment Setup
// ============================================

export function setupTestEnvironment() {
  // Set test environment variables
  process.env.NODE_ENV = 'test';
  process.env.DATABASE_URL = 'mysql://test:test@localhost:4000/test';
  process.env.UPSTASH_REDIS_REST_URL = 'https://test.upstash.io';
  process.env.UPSTASH_REDIS_REST_TOKEN = 'test-token';
}
