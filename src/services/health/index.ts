// src/services/health/index.ts
/**
 * Health Services Index
 * Export all health monitoring services
 */

export {
  checkSystemHealth,
  checkServiceHealth,
  checkEmailVerification,
  type SystemHealthStatus,
  type ServiceHealth,
} from './systemHealth';

// Re-export from aiEdgeService for convenience
export {
  checkAIEdgeHealth,
  checkAuthHealth,
} from '@/services/ai/aiEdgeService';
