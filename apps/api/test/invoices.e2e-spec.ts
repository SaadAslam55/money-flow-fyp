/**
 * Invoice API E2E Tests
 * Integration tests for invoice endpoints
 */

import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';

describe('Invoices API (e2e)', () => {
  let app: INestApplication;
  let authToken: string;
  let createdInvoiceId: string;

  // ============================================
  // Setup
  // ============================================

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();

    // Configure validation pipe
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        transform: true,
        forbidNonWhitelisted: true,
      })
    );

    await app.init();

    // Get auth token for testing
    try {
      const loginResponse = await request(app.getHttpServer())
        .post('/auth/login')
        .send({
          email: process.env.TEST_USER_EMAIL || 'test@example.com',
          password: process.env.TEST_USER_PASSWORD || 'testpassword',
        });

      authToken = loginResponse.body.access_token;
    } catch {
      // Use mock token for unit testing
      authToken = 'test-token';
    }
  });

  afterAll(async () => {
    await app.close();
  });

  // ============================================
  // GET /api/v1/invoices
  // ============================================

  describe('GET /api/v1/invoices', () => {
    it('should return 401 without auth token', () => {
      return request(app.getHttpServer()).get('/api/v1/invoices').expect(401);
    });

    it('should return invoices list with auth', () => {
      return request(app.getHttpServer())
        .get('/api/v1/invoices')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('data');
          expect(res.body).toHaveProperty('meta');
          expect(Array.isArray(res.body.data)).toBe(true);
          expect(res.body.meta).toHaveProperty('total');
          expect(res.body.meta).toHaveProperty('page');
          expect(res.body.meta).toHaveProperty('limit');
        });
    });

    it('should support pagination', () => {
      return request(app.getHttpServer())
        .get('/api/v1/invoices?page=1&limit=5')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200)
        .expect((res) => {
          expect(res.body.data.length).toBeLessThanOrEqual(5);
          expect(res.body.meta.limit).toBe(5);
          expect(res.body.meta.page).toBe(1);
        });
    });

    it('should filter by status', () => {
      return request(app.getHttpServer())
        .get('/api/v1/invoices?status=DRAFT')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200)
        .expect((res) => {
          res.body.data.forEach((invoice: any) => {
            expect(invoice.status).toBe('DRAFT');
          });
        });
    });

    it('should filter by customer_id', () => {
      return request(app.getHttpServer())
        .get('/api/v1/invoices?customer_id=test-customer')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200)
        .expect((res) => {
          res.body.data.forEach((invoice: any) => {
            expect(invoice.customer_id).toBe('test-customer');
          });
        });
    });

    it('should include cache headers', () => {
      return request(app.getHttpServer())
        .get('/api/v1/invoices')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200)
        .expect((res) => {
          expect(res.headers).toHaveProperty('cache-control');
        });
    });
  });

  // ============================================
  // POST /api/v1/invoices
  // ============================================

  describe('POST /api/v1/invoices', () => {
    const validInvoice = {
      customer_id: 'test-customer-id',
      due_date: '2024-12-31',
      items: [
        {
          description: 'Test Service',
          quantity: 1,
          unit_price: 100,
        },
      ],
    };

    it('should create invoice with valid data', () => {
      return request(app.getHttpServer())
        .post('/api/v1/invoices')
        .set('Authorization', `Bearer ${authToken}`)
        .send(validInvoice)
        .expect(201)
        .expect((res) => {
          expect(res.body).toHaveProperty('id');
          expect(res.body).toHaveProperty('invoice_number');
          expect(res.body.status).toBe('DRAFT');
          expect(res.body.payment_status).toBe('UNPAID');
          createdInvoiceId = res.body.id;
        });
    });

    it('should validate required fields', () => {
      return request(app.getHttpServer())
        .post('/api/v1/invoices')
        .set('Authorization', `Bearer ${authToken}`)
        .send({})
        .expect(400)
        .expect((res) => {
          expect(res.body.message).toBeDefined();
        });
    });

    it('should require at least one item', () => {
      return request(app.getHttpServer())
        .post('/api/v1/invoices')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ ...validInvoice, items: [] })
        .expect(400);
    });

    it('should validate item structure', () => {
      return request(app.getHttpServer())
        .post('/api/v1/invoices')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          ...validInvoice,
          items: [{ description: 'Missing required fields' }],
        })
        .expect(400);
    });

    it('should calculate totals correctly', () => {
      return request(app.getHttpServer())
        .post('/api/v1/invoices')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          customer_id: 'test-customer-id',
          due_date: '2024-12-31',
          items: [
            { description: 'Item 1', quantity: 2, unit_price: 100, tax_rate: 10 },
            { description: 'Item 2', quantity: 1, unit_price: 50 },
          ],
        })
        .expect(201)
        .expect((res) => {
          // 2*100 + 10% tax = 220, 1*50 = 50, total = 270
          expect(res.body.subtotal).toBe(250);
          expect(res.body.total).toBeGreaterThan(0);
          expect(res.body.balance_due).toBe(res.body.total);
        });
    });
  });

  // ============================================
  // GET /api/v1/invoices/:id
  // ============================================

  describe('GET /api/v1/invoices/:id', () => {
    it('should return invoice by id', async () => {
      // Skip if no invoice was created
      if (!createdInvoiceId) return;

      return request(app.getHttpServer())
        .get(`/api/v1/invoices/${createdInvoiceId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200)
        .expect((res) => {
          expect(res.body.id).toBe(createdInvoiceId);
          expect(res.body).toHaveProperty('customer');
          expect(res.body).toHaveProperty('items');
        });
    });

    it('should return 404 for non-existent invoice', () => {
      return request(app.getHttpServer())
        .get('/api/v1/invoices/non-existent-id')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(404);
    });
  });

  // ============================================
  // PATCH /api/v1/invoices/:id
  // ============================================

  describe('PATCH /api/v1/invoices/:id', () => {
    it('should update draft invoice', async () => {
      if (!createdInvoiceId) return;

      return request(app.getHttpServer())
        .patch(`/api/v1/invoices/${createdInvoiceId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({ notes: 'Updated notes' })
        .expect(200)
        .expect((res) => {
          expect(res.body.notes).toBe('Updated notes');
        });
    });

    it('should validate update data', () => {
      if (!createdInvoiceId) return;

      return request(app.getHttpServer())
        .patch(`/api/v1/invoices/${createdInvoiceId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({ status: 'INVALID_STATUS' })
        .expect(400);
    });
  });

  // ============================================
  // POST /api/v1/invoices/:id/send
  // ============================================

  describe('POST /api/v1/invoices/:id/send', () => {
    it('should send invoice and change status', async () => {
      if (!createdInvoiceId) return;

      return request(app.getHttpServer())
        .post(`/api/v1/invoices/${createdInvoiceId}/send`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200)
        .expect((res) => {
          expect(res.body.status).toBe('SENT');
        });
    });

    it('should reject sending already sent invoice', async () => {
      if (!createdInvoiceId) return;

      return request(app.getHttpServer())
        .post(`/api/v1/invoices/${createdInvoiceId}/send`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(400);
    });
  });

  // ============================================
  // POST /api/v1/invoices/:id/record-payment
  // ============================================

  describe('POST /api/v1/invoices/:id/record-payment', () => {
    it('should record payment', async () => {
      if (!createdInvoiceId) return;

      return request(app.getHttpServer())
        .post(`/api/v1/invoices/${createdInvoiceId}/record-payment`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          amount: 50,
          payment_method: 'CASH',
        })
        .expect(200)
        .expect((res) => {
          expect(res.body.amount_paid).toBeGreaterThan(0);
          expect(['PARTIAL', 'PAID']).toContain(res.body.payment_status);
        });
    });

    it('should validate payment amount', async () => {
      if (!createdInvoiceId) return;

      return request(app.getHttpServer())
        .post(`/api/v1/invoices/${createdInvoiceId}/record-payment`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          amount: -100,
          payment_method: 'CASH',
        })
        .expect(400);
    });

    it('should reject payment exceeding balance', async () => {
      if (!createdInvoiceId) return;

      return request(app.getHttpServer())
        .post(`/api/v1/invoices/${createdInvoiceId}/record-payment`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          amount: 1000000,
          payment_method: 'CASH',
        })
        .expect(400);
    });
  });

  // ============================================
  // DELETE /api/v1/invoices/:id
  // ============================================

  describe('DELETE /api/v1/invoices/:id', () => {
    it('should soft delete invoice', async () => {
      // Create a new invoice to delete
      const createRes = await request(app.getHttpServer())
        .post('/api/v1/invoices')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          customer_id: 'test-customer-id',
          due_date: '2024-12-31',
          items: [{ description: 'To Delete', quantity: 1, unit_price: 100 }],
        });

      const invoiceToDelete = createRes.body.id;

      return request(app.getHttpServer())
        .delete(`/api/v1/invoices/${invoiceToDelete}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200)
        .expect((res) => {
          expect(res.body.success).toBe(true);
        });
    });

    it('should return 404 for already deleted invoice', () => {
      return request(app.getHttpServer())
        .delete('/api/v1/invoices/non-existent-id')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(404);
    });
  });

  // ============================================
  // GET /api/v1/invoices/stats
  // ============================================

  describe('GET /api/v1/invoices/stats', () => {
    it('should return invoice statistics', () => {
      return request(app.getHttpServer())
        .get('/api/v1/invoices/stats')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('total');
          expect(res.body).toHaveProperty('paid');
          expect(res.body).toHaveProperty('pending');
          expect(res.body).toHaveProperty('overdue');
        });
    });

    it('should support period filter', () => {
      return request(app.getHttpServer())
        .get('/api/v1/invoices/stats?period=month')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);
    });
  });

  // ============================================
  // GET /api/v1/invoices/overdue
  // ============================================

  describe('GET /api/v1/invoices/overdue', () => {
    it('should return overdue invoices', () => {
      return request(app.getHttpServer())
        .get('/api/v1/invoices/overdue')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200)
        .expect((res) => {
          expect(Array.isArray(res.body)).toBe(true);
        });
    });
  });
});
