// src/services/automation/workflowService.ts
/**
 * Workflow Automation Service - Phase 7: Advanced Features
 * Automated workflows for business processes
 */

import { supabase } from '@/services/supabase/client';
import { logger } from '@/lib/logger';

/**
 * Workflow trigger types
 */
export type WorkflowTrigger =
  | 'invoice_created'
  | 'invoice_sent'
  | 'invoice_overdue'
  | 'payment_received'
  | 'customer_created'
  | 'low_stock'
  | 'scheduled';

/**
 * Workflow action types
 */
export type WorkflowAction =
  | 'send_email'
  | 'send_sms'
  | 'create_task'
  | 'update_record'
  | 'notify_user'
  | 'webhook';

/**
 * Workflow definition
 */
export interface Workflow {
  id: string;
  name: string;
  description?: string;
  trigger: WorkflowTrigger;
  triggerConditions?: Record<string, unknown>;
  actions: WorkflowActionConfig[];
  isActive: boolean;
  organizationId: string;
  createdAt: string;
  updatedAt: string;
}

export interface WorkflowActionConfig {
  type: WorkflowAction;
  config: Record<string, unknown>;
  delay?: number; // Delay in minutes
  condition?: string; // JavaScript expression
}

/**
 * Workflow execution log
 */
export interface WorkflowLog {
  id: string;
  workflowId: string;
  trigger: WorkflowTrigger;
  status: 'pending' | 'running' | 'completed' | 'failed';
  startedAt: string;
  completedAt?: string;
  error?: string;
  context: Record<string, unknown>;
}

/**
 * Get all workflows for an organization
 */
export async function getWorkflows(organizationId: string): Promise<Workflow[]> {
  // In production, this would fetch from database
  // For now, return sample workflows
  return [
    {
      id: '1',
      name: 'Invoice Payment Reminder',
      description: 'Send reminder email when invoice is overdue',
      trigger: 'invoice_overdue',
      triggerConditions: { daysOverdue: 7 },
      actions: [
        {
          type: 'send_email',
          config: {
            template: 'payment_reminder',
            to: '{{customer.email}}',
            subject: 'Payment Reminder: Invoice #{{invoice.number}}',
          },
        },
      ],
      isActive: true,
      organizationId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: '2',
      name: 'Low Stock Alert',
      description: 'Notify admin when product stock is low',
      trigger: 'low_stock',
      triggerConditions: { threshold: 10 },
      actions: [
        {
          type: 'notify_user',
          config: {
            role: 'admin',
            message: 'Product {{product.name}} is running low ({{product.stock}} remaining)',
          },
        },
      ],
      isActive: true,
      organizationId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: '3',
      name: 'Welcome New Customer',
      description: 'Send welcome email to new customers',
      trigger: 'customer_created',
      actions: [
        {
          type: 'send_email',
          config: {
            template: 'welcome_customer',
            to: '{{customer.email}}',
            subject: 'Welcome to {{organization.name}}!',
          },
        },
      ],
      isActive: true,
      organizationId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
  ];
}

/**
 * Create a new workflow
 */
export async function createWorkflow(
  workflow: Omit<Workflow, 'id' | 'createdAt' | 'updatedAt'>
): Promise<Workflow> {
  // In production, save to database
  return {
    ...workflow,
    id: crypto.randomUUID(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
}

/**
 * Update a workflow
 */
export async function updateWorkflow(
  id: string,
  updates: Partial<Workflow>
): Promise<Workflow | null> {
  // In production, update in database
  return null;
}

/**
 * Delete a workflow
 */
export async function deleteWorkflow(id: string): Promise<boolean> {
  // In production, delete from database
  return true;
}

/**
 * Toggle workflow active status
 */
export async function toggleWorkflow(id: string, isActive: boolean): Promise<boolean> {
  // In production, update in database
  return true;
}

/**
 * Execute a workflow
 */
export async function executeWorkflow(
  workflow: Workflow,
  context: Record<string, unknown>
): Promise<WorkflowLog> {
  const log: WorkflowLog = {
    id: crypto.randomUUID(),
    workflowId: workflow.id,
    trigger: workflow.trigger,
    status: 'running',
    startedAt: new Date().toISOString(),
    context,
  };

  try {
    // Execute each action
    for (const action of workflow.actions) {
      // Check condition if present
      if (action.condition) {
        const conditionMet = evaluateCondition(action.condition, context);
        if (!conditionMet) continue;
      }

      // Apply delay if present
      if (action.delay && action.delay > 0) {
        await new Promise((resolve) => setTimeout(resolve, (action.delay ?? 0) * 60 * 1000));
      }

      // Execute action
      await executeAction(action, context);
    }

    log.status = 'completed';
    log.completedAt = new Date().toISOString();
  } catch (error) {
    log.status = 'failed';
    log.error = error instanceof Error ? error.message : 'Unknown error';
    log.completedAt = new Date().toISOString();
  }

  return log;
}

/**
 * Evaluate a simple condition expression safely
 * Supports basic comparisons and logical operators without eval/Function
 */
function evaluateCondition(condition: string, context: Record<string, unknown>): boolean {
  try {
    // Whitelist allowed characters to prevent code injection
    const safeCondition = condition.replace(/[^\w\s=<>!&|_.\-+*/%()'"]/g, '');
    if (safeCondition !== condition) {
      logger.warn('[Workflow] Condition contained unsafe characters:', condition);
      return false;
    }

    // Replace variable names with their values from context
    let expression = safeCondition;
    for (const [key, value] of Object.entries(context)) {
      const placeholder = new RegExp(`\\b${key}\\b`, 'g');
      const serialized =
        typeof value === 'string' ? `"${value.replace(/"/g, '\\"')}"`
        : typeof value === 'number' || typeof value === 'boolean' ? String(value)
        : value === null ? 'null'
        : 'undefined';
      expression = expression.replace(placeholder, serialized);
    }

    // Only allow specific safe expression patterns
    const safePattern = /^(\s*(null|undefined|true|false|\d+(\.\d+)?|"[^"]*"|\[[^\]]*\])\s*([=<>!]+|&&|\|\|)\s*)*(null|undefined|true|false|\d+(\.\d+)?|"[^"]*"|\[[^\]]*\])\s*$/;
    if (!safePattern.test(expression)) {
      return false;
    }

    // Use a minimal safe evaluator for whitelisted operators
    const ops: Record<string, (a: unknown, b: unknown) => boolean> = {
      '==': (a, b) => a == b,
      '===': (a, b) => a === b,
      '!=': (a, b) => a != b,
      '!==': (a, b) => a !== b,
      '>': (a, b) => (a as number) > (b as number),
      '>=': (a, b) => (a as number) >= (b as number),
      '<': (a, b) => (a as number) < (b as number),
      '<=': (a, b) => (a as number) <= (b as number),
    };

    // Split by logical operators and evaluate each part
    const parts = expression.split(/\s*&&\s*|\s*\|\|\s*/);
    const results = parts.map((part) => {
      for (const [op, fn] of Object.entries(ops)) {
        const sides = part.split(op);
        if (sides.length === 2 && sides[0] && sides[1]) {
          const left = sides[0].trim();
          const right = sides[1].trim();
          const parse = (val: string) => {
            val = val.trim();
            if (val === 'true') return true;
            if (val === 'false') return false;
            if (val === 'null') return null;
            if (val === 'undefined') return undefined;
            if (val.startsWith('"') && val.endsWith('"')) return val.slice(1, -1);
            const num = Number(val);
            if (!Number.isNaN(num)) return num;
            return val;
          };
          return fn(parse(left), parse(right));
        }
      }
      // Single literal
      const val = part.trim();
      if (val === 'true') return true;
      if (val === 'false') return false;
      return Boolean(val);
    });

    // Combine with logical AND/OR
    if (expression.includes('||')) {
      return results.some(Boolean);
    }
    return results.every(Boolean);
  } catch {
    return false;
  }
}

/**
 * Execute a single action
 */
async function executeAction(
  action: WorkflowActionConfig,
  context: Record<string, unknown>
): Promise<void> {
  const config = interpolateConfig(action.config, context);

  switch (action.type) {
    case 'send_email':
      await sendEmailAction(config);
      break;
    case 'send_sms':
      await sendSmsAction(config);
      break;
    case 'notify_user':
      await notifyUserAction(config);
      break;
    case 'create_task':
      await createTaskAction(config);
      break;
    case 'webhook':
      await webhookAction(config);
      break;
    case 'update_record':
      await updateRecordAction(config);
      break;
  }
}

/**
 * Interpolate template variables in config
 */
function interpolateConfig(
  config: Record<string, unknown>,
  context: Record<string, unknown>
): Record<string, unknown> {
  const result: Record<string, unknown> = {};

  for (const [key, value] of Object.entries(config)) {
    if (typeof value === 'string') {
      result[key] = value.replace(/\{\{(\w+(?:\.\w+)*)\}\}/g, (_, path) => {
        const parts = path.split('.');
        let current: unknown = context;
        for (const part of parts) {
          if (current && typeof current === 'object' && part in current) {
            current = (current as Record<string, unknown>)[part];
          } else {
            return '';
          }
        }
        return String(current ?? '');
      });
    } else {
      result[key] = value;
    }
  }

  return result;
}

// Action implementations (stubs - implement with actual services)
async function sendEmailAction(config: Record<string, unknown>): Promise<void> {
  logger.info('Sending email:', config);
  // Integrate with email service (Resend, SendGrid, etc.)
}

async function sendSmsAction(config: Record<string, unknown>): Promise<void> {
  logger.info('Sending SMS:', config);
  // Integrate with SMS service (Twilio, etc.)
}

async function notifyUserAction(config: Record<string, unknown>): Promise<void> {
  logger.info('Notifying user:', config);
  // Create in-app notification
}

async function createTaskAction(config: Record<string, unknown>): Promise<void> {
  logger.info('Creating task:', config);
  // Create task in task management system
}

async function webhookAction(config: Record<string, unknown>): Promise<void> {
  const url = config.url as string;
  const method = (config.method as string) || 'POST';
  const body = config.body as Record<string, unknown>;

  await fetch(url, {
    method,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
}

async function updateRecordAction(config: Record<string, unknown>): Promise<void> {
  const table = config.table as string;
  const id = config.id as string;
  const updates = config.updates as Record<string, unknown>;

  await supabase.from(table).update(updates).eq('id', id);
}

/**
 * Schedule recurring workflows
 */
export function scheduleWorkflow(
  workflow: Workflow,
  schedule: { cron?: string; interval?: number }
): void {
  // In production, use a job scheduler (Bull, Agenda, etc.)
  logger.info('Scheduling workflow:', workflow.name, schedule);
}
