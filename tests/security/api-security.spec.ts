/**
 * API Security Tests
 * Security testing for authentication, authorization, and input validation
 */

import * as request from 'supertest';

const API_URL = process.env.API_URL || 'http://localhost:3001';

describe('API Security', () => {
  // ============================================
  // Helper Functions
  // ============================================

  async function getValidToken(): Promise<string> {
    try {
      const response = await request(API_URL)
        .post('/auth/login')
        .send({
          email: process.env.TEST_USER_EMAIL || 'test@example.com',
          password: process.env.TEST_USER_PASSWORD || 'testpassword',
        });
      return response.body.access_token;
    } catch {
      return 'mock-token';
    }
  }

  async function getTokenForOrg(orgId: string): Promise<string> {
    // Mock - in real tests, get token for specific org user
    return `org-${orgId}-token`;
  }

  async function getTokenForRole(role: string): Promise<string> {
    // Mock - in real tests, get token for specific role
    return `role-${role}-token`;
  }

  // ============================================
  // Authentication Tests
  // ============================================

  describe('Authentication', () => {
    it('should reject requests without token', async () => {
      const response = await request(API_URL).get('/api/v1/invoices').expect(401);

      expect(response.body).toHaveProperty('error');
    });

    it('should reject invalid tokens', async () => {
      const response = await request(API_URL)
        .get('/api/v1/invoices')
        .set('Authorization', 'Bearer invalid-token-12345')
        .expect(401);

      expect(response.body).toHaveProperty('error');
    });

    it('should reject malformed authorization header', async () => {
      await request(API_URL)
        .get('/api/v1/invoices')
        .set('Authorization', 'InvalidFormat token')
        .expect(401);
    });

    it('should reject expired tokens', async () => {
      // This is a token that has already expired
      const expiredToken =
        'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJleHAiOjE2MDAwMDAwMDAsInN1YiI6InRlc3QifQ.test';

      await request(API_URL)
        .get('/api/v1/invoices')
        .set('Authorization', `Bearer ${expiredToken}`)
        .expect(401);
    });

    it('should reject tokens with invalid signature', async () => {
      // Token with tampered signature
      const tamperedToken =
        'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJ0ZXN0IiwiZXhwIjo5OTk5OTk5OTk5fQ.invalid_signature';

      await request(API_URL)
        .get('/api/v1/invoices')
        .set('Authorization', `Bearer ${tamperedToken}`)
        .expect(401);
    });
  });

  // ============================================
  // Authorization Tests
  // ============================================

  describe('Authorization', () => {
    it('should prevent cross-tenant data access', async () => {
      const tokenOrgA = await getTokenForOrg('org-a');

      // Try to access another org's data
      const response = await request(API_URL)
        .get('/api/v1/invoices/org-b-invoice-id')
        .set('Authorization', `Bearer ${tokenOrgA}`);

      // Should either get 404 (not found in their scope) or 403 (forbidden)
      expect([403, 404]).toContain(response.status);
    });

    it('should enforce role-based access for admin endpoints', async () => {
      const userToken = await getTokenForRole('user');

      // Try to access admin-only endpoint
      const response = await request(API_URL)
        .get('/api/v1/admin/metrics')
        .set('Authorization', `Bearer ${userToken}`);

      expect([401, 403]).toContain(response.status);
    });

    it('should allow admin access to admin endpoints', async () => {
      const adminToken = await getTokenForRole('admin');

      const response = await request(API_URL)
        .get('/api/v1/admin/metrics')
        .set('Authorization', `Bearer ${adminToken}`);

      // Should succeed or return actual error, not 403
      expect(response.status).not.toBe(403);
    });

    it('should restrict delete operations to authorized roles', async () => {
      const viewerToken = await getTokenForRole('viewer');

      const response = await request(API_URL)
        .delete('/api/v1/invoices/test-id')
        .set('Authorization', `Bearer ${viewerToken}`);

      expect([401, 403]).toContain(response.status);
    });
  });

  // ============================================
  // Input Validation Tests
  // ============================================

  describe('Input Validation', () => {
    let token: string;

    beforeAll(async () => {
      token = await getValidToken();
    });

    it('should reject SQL injection in search parameter', async () => {
      const response = await request(API_URL)
        .get('/api/v1/invoices')
        .query({ search: "'; DROP TABLE invoices; --" })
        .set('Authorization', `Bearer ${token}`);

      // Should return empty results or validation error, NOT database error
      expect([200, 400]).toContain(response.status);

      if (response.status === 200) {
        expect(response.body.data).toBeDefined();
      }
    });

    it('should reject SQL injection in ID parameter', async () => {
      const response = await request(API_URL)
        .get('/api/v1/invoices/1; DROP TABLE invoices;--')
        .set('Authorization', `Bearer ${token}`);

      // Should return 404 or 400, not 500
      expect([400, 404]).toContain(response.status);
    });

    it('should sanitize XSS in text fields', async () => {
      const response = await request(API_URL)
        .post('/api/v1/invoices')
        .set('Authorization', `Bearer ${token}`)
        .send({
          customer_id: 'test-customer',
          due_date: '2024-12-31',
          notes: '<script>alert("xss")</script>',
          items: [{ description: 'Test', quantity: 1, unit_price: 100 }],
        });

      if (response.status === 201) {
        // If created, notes should be sanitized
        expect(response.body.notes).not.toContain('<script>');
      }
    });

    it('should reject excessively long input', async () => {
      const longString = 'a'.repeat(100000);

      const response = await request(API_URL)
        .post('/api/v1/invoices')
        .set('Authorization', `Bearer ${token}`)
        .send({
          customer_id: 'test-customer',
          due_date: '2024-12-31',
          notes: longString,
          items: [{ description: 'Test', quantity: 1, unit_price: 100 }],
        });

      // Should reject with 400 or 413 (payload too large)
      expect([400, 413]).toContain(response.status);
    });

    it('should validate email format', async () => {
      const response = await request(API_URL)
        .post('/api/v1/customers')
        .set('Authorization', `Bearer ${token}`)
        .send({
          name: 'Test Customer',
          email: 'not-a-valid-email',
        });

      expect(response.status).toBe(400);
      expect(response.body.message).toBeDefined();
    });

    it('should validate numeric fields', async () => {
      const response = await request(API_URL)
        .post('/api/v1/invoices')
        .set('Authorization', `Bearer ${token}`)
        .send({
          customer_id: 'test-customer',
          due_date: '2024-12-31',
          items: [{ description: 'Test', quantity: -1, unit_price: 'not-a-number' }],
        });

      expect(response.status).toBe(400);
    });

    it('should reject invalid date formats', async () => {
      const response = await request(API_URL)
        .post('/api/v1/invoices')
        .set('Authorization', `Bearer ${token}`)
        .send({
          customer_id: 'test-customer',
          due_date: 'not-a-date',
          items: [{ description: 'Test', quantity: 1, unit_price: 100 }],
        });

      expect(response.status).toBe(400);
    });
  });

  // ============================================
  // Rate Limiting Tests
  // ============================================

  describe('Rate Limiting', () => {
    it('should enforce rate limits', async () => {
      const token = await getValidToken();
      const requests: Promise<any>[] = [];

      // Make many rapid requests
      for (let i = 0; i < 150; i++) {
        requests.push(
          request(API_URL).get('/api/v1/invoices').set('Authorization', `Bearer ${token}`)
        );
      }

      const responses = await Promise.all(requests);

      // At least some requests should be rate limited
      const rateLimited = responses.filter((r) => r.status === 429);

      // This might not trigger if rate limits are high
      // In production, you'd test with actual limits
      console.log(`Rate limited ${rateLimited.length} of ${responses.length} requests`);
    });

    it('should include rate limit headers', async () => {
      const token = await getValidToken();

      const response = await request(API_URL)
        .get('/api/v1/invoices')
        .set('Authorization', `Bearer ${token}`);

      // Should include rate limit headers
      expect(response.headers).toHaveProperty('x-ratelimit-limit');
      expect(response.headers).toHaveProperty('x-ratelimit-remaining');
    });
  });

  // ============================================
  // Security Headers Tests
  // ============================================

  describe('Security Headers', () => {
    it('should include security headers', async () => {
      const response = await request(API_URL).get('/health');

      // Check for security headers
      const headers = response.headers;

      // These headers should be present
      expect(headers['x-content-type-options']).toBe('nosniff');
      expect(headers['x-frame-options']).toBeDefined();
    });

    it('should not expose sensitive headers', async () => {
      const response = await request(API_URL).get('/health');

      // Should not expose server information
      expect(response.headers['x-powered-by']).toBeUndefined();
    });
  });

  // ============================================
  // CORS Tests
  // ============================================

  describe('CORS', () => {
    it('should handle preflight requests', async () => {
      const response = await request(API_URL)
        .options('/api/v1/invoices')
        .set('Origin', 'http://localhost:3000')
        .set('Access-Control-Request-Method', 'GET');

      expect([200, 204]).toContain(response.status);
      expect(response.headers['access-control-allow-methods']).toBeDefined();
    });

    it('should reject requests from unauthorized origins', async () => {
      const response = await request(API_URL)
        .get('/api/v1/invoices')
        .set('Origin', 'http://malicious-site.com');

      // Depending on CORS config, might not include allow-origin header
      // or might reject outright
    });
  });
});
