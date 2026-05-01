/**
 * Auth API Service Tests
 *
 * Unit tests for authentication API service functions
 * These tests verify that auth API functions exist and have correct signatures.
 * Full integration tests with Supabase should be done separately.
 */

import { describe, it, expect } from 'vitest';
import * as authApi from '@/services/api/authApi';

describe('authApi', () => {
  describe('signIn', () => {
    it('function exists and is callable', () => {
      expect(typeof authApi.signIn).toBe('function');
    });
  });

  describe('signUp', () => {
    it('function exists and is callable', () => {
      expect(typeof authApi.signUp).toBe('function');
    });
  });

  describe('signOut', () => {
    it('function exists and is callable', () => {
      expect(typeof authApi.signOut).toBe('function');
    });
  });

  describe('getCurrentUser', () => {
    it('function exists and is callable', () => {
      expect(typeof authApi.getCurrentUser).toBe('function');
    });
  });

  describe('getCurrentSession', () => {
    it('function exists and is callable', () => {
      expect(typeof authApi.getCurrentSession).toBe('function');
    });
  });

  describe('resetPassword', () => {
    it('function exists and is callable', () => {
      expect(typeof authApi.resetPassword).toBe('function');
    });
  });

  describe('updatePassword', () => {
    it('function exists and is callable', () => {
      expect(typeof authApi.updatePassword).toBe('function');
    });
  });

  describe('refreshSession', () => {
    it('function exists and is callable', () => {
      expect(typeof authApi.refreshSession).toBe('function');
    });
  });
});

