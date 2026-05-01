/**
 * Invoice Service Unit Tests
 */

import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException, BadRequestException } from '@nestjs/common';
import { InvoicesService } from './invoices.service';
import { PrismaService } from '../../database/tidb/prisma.service';
import { CacheManagerService } from '../../common/cache/cache-manager.service';
import {
  mockPrisma,
  mockCacheManager,
  resetMocks,
  testDataFactory,
  mockAuthUser,
} from '../../../test/setup';

describe('InvoicesService', () => {
  let service: InvoicesService;
  let prisma: typeof mockPrisma;
  let cache: typeof mockCacheManager;

  const mockInvoice = testDataFactory.createInvoice();
  const mockCustomer = testDataFactory.createCustomer();

  beforeEach(async () => {
    resetMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        InvoicesService,
        { provide: PrismaService, useValue: mockPrisma },
        { provide: CacheManagerService, useValue: mockCacheManager },
      ],
    }).compile();

    service = module.get<InvoicesService>(InvoicesService);
    prisma = mockPrisma;
    cache = mockCacheManager;
  });

  // ============================================
  // findAll Tests
  // ============================================

  describe('findAll', () => {
    it('should return paginated invoices', async () => {
      prisma.invoice.findMany.mockResolvedValue([mockInvoice]);
      prisma.invoice.count.mockResolvedValue(1);

      const result = await service.findAll('org-123', { page: 1, limit: 20 });

      expect(result.data).toHaveLength(1);
      expect(result.meta.total).toBe(1);
      expect(result.meta.page).toBe(1);
      expect(result.meta.limit).toBe(20);
    });

    it('should apply status filter', async () => {
      prisma.invoice.findMany.mockResolvedValue([]);
      prisma.invoice.count.mockResolvedValue(0);

      await service.findAll('org-123', { status: 'PAID' });

      expect(prisma.invoice.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            status: 'PAID',
          }),
        })
      );
    });

    it('should apply customer filter', async () => {
      prisma.invoice.findMany.mockResolvedValue([]);
      prisma.invoice.count.mockResolvedValue(0);

      await service.findAll('org-123', { customer_id: 'cust-456' });

      expect(prisma.invoice.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            customer_id: 'cust-456',
          }),
        })
      );
    });

    it('should exclude deleted invoices', async () => {
      prisma.invoice.findMany.mockResolvedValue([]);
      prisma.invoice.count.mockResolvedValue(0);

      await service.findAll('org-123', {});

      expect(prisma.invoice.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            deleted_at: null,
          }),
        })
      );
    });

    it('should use cache when available', async () => {
      const cachedData = { data: [mockInvoice], meta: { total: 1 } };
      cache.getOrSet.mockResolvedValue(cachedData);

      const result = await service.findAll('org-123', {});

      expect(cache.getOrSet).toHaveBeenCalled();
    });
  });

  // ============================================
  // findOne Tests
  // ============================================

  describe('findOne', () => {
    it('should return invoice by id', async () => {
      prisma.invoice.findFirst.mockResolvedValue(mockInvoice);

      const result = await service.findOne('org-123', 'inv-123');

      expect(result).toEqual(mockInvoice);
      expect(prisma.invoice.findFirst).toHaveBeenCalledWith(
        expect.objectContaining({
          where: {
            id: 'inv-123',
            organization_id: 'org-123',
            deleted_at: null,
          },
        })
      );
    });

    it('should throw NotFoundException if not found', async () => {
      prisma.invoice.findFirst.mockResolvedValue(null);

      await expect(service.findOne('org-123', 'inv-999')).rejects.toThrow(NotFoundException);
    });

    it('should include relations', async () => {
      prisma.invoice.findFirst.mockResolvedValue({
        ...mockInvoice,
        customer: mockCustomer,
        items: [],
      });

      await service.findOne('org-123', 'inv-123');

      expect(prisma.invoice.findFirst).toHaveBeenCalledWith(
        expect.objectContaining({
          include: expect.objectContaining({
            customer: expect.any(Object),
            items: expect.any(Object),
          }),
        })
      );
    });
  });

  // ============================================
  // create Tests
  // ============================================

  describe('create', () => {
    const createDto = {
      customer_id: 'cust-123',
      due_date: '2024-12-31',
      items: [
        {
          description: 'Test Item',
          quantity: 2,
          unit_price: 500,
          tax_rate: 10,
        },
      ],
    };

    it('should create invoice with calculated totals', async () => {
      prisma.invoice.create.mockResolvedValue(mockInvoice);

      const result = await service.create(mockAuthUser as any, createDto);

      expect(result).toEqual(mockInvoice);
      expect(prisma.invoice.create).toHaveBeenCalled();
    });

    it('should generate invoice number', async () => {
      prisma.invoice.create.mockResolvedValue(mockInvoice);

      await service.create(mockAuthUser as any, createDto);

      expect(prisma.invoice.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            invoice_number: expect.any(String),
          }),
        })
      );
    });

    it('should set default status as DRAFT', async () => {
      prisma.invoice.create.mockResolvedValue(mockInvoice);

      await service.create(mockAuthUser as any, createDto);

      expect(prisma.invoice.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            status: 'DRAFT',
          }),
        })
      );
    });

    it('should invalidate cache after creation', async () => {
      prisma.invoice.create.mockResolvedValue(mockInvoice);

      await service.create(mockAuthUser as any, createDto);

      expect(cache.invalidateByTag).toHaveBeenCalledWith('invoices-list');
    });
  });

  // ============================================
  // update Tests
  // ============================================

  describe('update', () => {
    it('should update draft invoice', async () => {
      prisma.invoice.findFirst.mockResolvedValue({
        ...mockInvoice,
        status: 'DRAFT',
      });
      prisma.invoice.update.mockResolvedValue({
        ...mockInvoice,
        notes: 'Updated notes',
      });

      const result = await service.update('org-123', 'inv-123', {
        notes: 'Updated notes',
      });

      expect(result.notes).toBe('Updated notes');
    });

    it('should throw error when updating non-draft invoice', async () => {
      prisma.invoice.findFirst.mockResolvedValue({
        ...mockInvoice,
        status: 'SENT',
      });

      await expect(service.update('org-123', 'inv-123', { notes: 'Updated' })).rejects.toThrow(
        BadRequestException
      );
    });

    it('should throw NotFoundException if invoice not found', async () => {
      prisma.invoice.findFirst.mockResolvedValue(null);

      await expect(service.update('org-123', 'inv-999', { notes: 'Updated' })).rejects.toThrow(
        NotFoundException
      );
    });

    it('should invalidate cache after update', async () => {
      prisma.invoice.findFirst.mockResolvedValue({
        ...mockInvoice,
        status: 'DRAFT',
      });
      prisma.invoice.update.mockResolvedValue(mockInvoice);

      await service.update('org-123', 'inv-123', { notes: 'Updated' });

      expect(cache.invalidate).toHaveBeenCalled();
      expect(cache.invalidateByTag).toHaveBeenCalled();
    });
  });

  // ============================================
  // delete Tests
  // ============================================

  describe('delete', () => {
    it('should soft delete invoice', async () => {
      prisma.invoice.findFirst.mockResolvedValue(mockInvoice);
      prisma.invoice.update.mockResolvedValue({
        ...mockInvoice,
        deleted_at: new Date(),
      });

      await service.remove('org-123', 'inv-123');

      expect(prisma.invoice.update).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            deleted_at: expect.any(Date),
          }),
        })
      );
    });

    it('should throw NotFoundException if not found', async () => {
      prisma.invoice.findFirst.mockResolvedValue(null);

      await expect(service.remove('org-123', 'inv-999')).rejects.toThrow(NotFoundException);
    });

    it('should invalidate all related caches', async () => {
      prisma.invoice.findFirst.mockResolvedValue(mockInvoice);
      prisma.invoice.update.mockResolvedValue({
        ...mockInvoice,
        deleted_at: new Date(),
      });

      await service.remove('org-123', 'inv-123');

      expect(cache.invalidate).toHaveBeenCalled();
      expect(cache.invalidateByTag).toHaveBeenCalledWith('invoices-list');
    });
  });

  // ============================================
  // recordPayment Tests
  // ============================================

  describe('recordPayment', () => {
    const paymentDto = {
      amount: 500,
      payment_method: 'CASH',
    };

    it('should record payment and update balances', async () => {
      prisma.invoice.findFirst.mockResolvedValue(mockInvoice);
      prisma.$transaction.mockImplementation(async (fn) => fn(prisma));
      prisma.invoice.update.mockResolvedValue({
        ...mockInvoice,
        amount_paid: 500,
        balance_due: 600,
        payment_status: 'PARTIAL',
      });
      prisma.transaction.create.mockResolvedValue(testDataFactory.createTransaction());

      const result = await service.recordPayment(mockAuthUser as any, 'inv-123', paymentDto);

      expect(result.payment_status).toBe('PARTIAL');
      expect(prisma.transaction.create).toHaveBeenCalled();
    });

    it('should mark as PAID when fully paid', async () => {
      const fullPayment = { ...mockInvoice, balance_due: 500 };
      prisma.invoice.findFirst.mockResolvedValue(fullPayment);
      prisma.$transaction.mockImplementation(async (fn) => fn(prisma));
      prisma.invoice.update.mockResolvedValue({
        ...fullPayment,
        amount_paid: 1100,
        balance_due: 0,
        payment_status: 'PAID',
        status: 'PAID',
      });
      prisma.transaction.create.mockResolvedValue(testDataFactory.createTransaction());

      const result = await service.recordPayment(mockAuthUser as any, 'inv-123', {
        amount: 500,
        payment_method: 'CASH',
      });

      expect(result.payment_status).toBe('PAID');
      expect(result.status).toBe('PAID');
    });

    it('should reject payment exceeding balance', async () => {
      prisma.invoice.findFirst.mockResolvedValue(mockInvoice);

      await expect(
        service.recordPayment(mockAuthUser as any, 'inv-123', {
          amount: 5000,
          payment_method: 'CASH',
        })
      ).rejects.toThrow(BadRequestException);
    });

    it('should reject payment for draft invoice', async () => {
      prisma.invoice.findFirst.mockResolvedValue({
        ...mockInvoice,
        status: 'DRAFT',
      });

      await expect(
        service.recordPayment(mockAuthUser as any, 'inv-123', paymentDto)
      ).rejects.toThrow(BadRequestException);
    });
  });

  // ============================================
  // getStats Tests
  // ============================================

  describe('getStats', () => {
    it('should return invoice statistics', async () => {
      const stats = {
        total: 100,
        paid: 60,
        pending: 30,
        overdue: 10,
        totalAmount: 100000,
        paidAmount: 60000,
      };

      prisma.$queryRawUnsafe.mockResolvedValue([stats]);

      const result = await service.getStats('org-123', 'month');

      expect(result).toHaveProperty('total');
      expect(result).toHaveProperty('paid');
      expect(result).toHaveProperty('totalAmount');
    });
  });
});
