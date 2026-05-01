/**
 * Dashboard Component Tests
 *
 * Unit tests for the Dashboard component
 * These tests verify the component exists and can be imported.
 */

import { describe, it, expect } from 'vitest';
import DashboardPage from '@/pages/dashboard/DashboardPage';

describe('Dashboard', () => {
  it('component exists and is a function', () => {
    expect(typeof DashboardPage).toBe('function');
  });

  it('component is exported correctly', () => {
    expect(DashboardPage).toBeDefined();
  });
});

