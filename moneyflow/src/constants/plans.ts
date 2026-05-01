// src/constants/plans.ts
/**
 * Subscription Plans Configuration
 * 
 * Note: This file re-exports subscription plans from status.ts
 * to maintain backward compatibility and provide a dedicated plans file.
 * 
 * For the main subscription plans, see: @/constants/status
 */

export { SUBSCRIPTION_PLANS, getSubscriptionPlan, hasFeatureAccess } from './status';
export type { SubscriptionPlan } from './status';

