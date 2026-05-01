// src/lib/security/auditLogger.ts
/**
 * Security Audit Logger
 * Track security-relevant events for monitoring and compliance
 */

export enum AuditEventType {
  // Authentication events
  LOGIN_SUCCESS = 'LOGIN_SUCCESS',
  LOGIN_FAILURE = 'LOGIN_FAILURE',
  LOGOUT = 'LOGOUT',
  PASSWORD_CHANGE = 'PASSWORD_CHANGE',
  PASSWORD_RESET = 'PASSWORD_RESET',

  // Authorization events
  PERMISSION_DENIED = 'PERMISSION_DENIED',
  ROLE_CHANGE = 'ROLE_CHANGE',

  // Data access events
  DATA_ACCESS = 'DATA_ACCESS',
  DATA_EXPORT = 'DATA_EXPORT',
  DATA_MODIFICATION = 'DATA_MODIFICATION',
  DATA_DELETION = 'DATA_DELETION',

  // Security events
  RATE_LIMIT_EXCEEDED = 'RATE_LIMIT_EXCEEDED',
  SUSPICIOUS_ACTIVITY = 'SUSPICIOUS_ACTIVITY',
  XSS_ATTEMPT = 'XSS_ATTEMPT',
  SQL_INJECTION_ATTEMPT = 'SQL_INJECTION_ATTEMPT',
  CSRF_TOKEN_INVALID = 'CSRF_TOKEN_INVALID',

  // System events
  CONFIGURATION_CHANGE = 'CONFIGURATION_CHANGE',
  API_KEY_CREATED = 'API_KEY_CREATED',
  API_KEY_REVOKED = 'API_KEY_REVOKED',
}

export enum AuditSeverity {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
  CRITICAL = 'CRITICAL',
}

export interface AuditEvent {
  id: string;
  timestamp: Date;
  type: AuditEventType;
  severity: AuditSeverity;
  userId?: string;
  userEmail?: string;
  organizationId?: string;
  ipAddress?: string;
  userAgent?: string;
  resource?: string;
  action?: string;
  details?: Record<string, unknown>;
  metadata?: Record<string, unknown>;
}

/**
 * Audit logger class
 */
class AuditLogger {
  private events: AuditEvent[] = [];
  private maxEvents = 1000;

  /**
   * Log an audit event
   */
  log(event: Omit<AuditEvent, 'id' | 'timestamp'>): void {
    const auditEvent: AuditEvent = {
      ...event,
      id: crypto.randomUUID(),
      timestamp: new Date(),
      ipAddress: event.ipAddress || this.getClientIp(),
      userAgent: event.userAgent || navigator.userAgent,
    };

    this.events.push(auditEvent);

    // Keep only the last maxEvents
    if (this.events.length > this.maxEvents) {
      this.events.shift();
    }

    // Log to console in development
    if (import.meta.env.DEV) {
      console.info('[Audit]', auditEvent);
    }

    // Send to backend in production
    if (import.meta.env.PROD) {
      this.sendToBackend(auditEvent).catch(console.error);
    }
  }

  /**
   * Get client IP (best effort, may not work in all environments)
   */
  private getClientIp(): string | undefined {
    // This would typically be set by a backend API
    return undefined;
  }

  /**
   * Send audit event to backend
   */
  private async sendToBackend(event: AuditEvent): Promise<void> {
    try {
      // Implementation would send to your audit logging endpoint
      // await fetch('/api/audit-logs', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(event),
      // });
    } catch (error) {
      console.error('Failed to send audit event:', error);
    }
  }

  /**
   * Get recent events
   */
  getEvents(filters?: {
    type?: AuditEventType;
    severity?: AuditSeverity;
    userId?: string;
    limit?: number;
  }): AuditEvent[] {
    let filtered = [...this.events];

    if (filters) {
      if (filters.type) {
        filtered = filtered.filter((e) => e.type === filters.type);
      }
      if (filters.severity) {
        filtered = filtered.filter((e) => e.severity === filters.severity);
      }
      if (filters.userId) {
        filtered = filtered.filter((e) => e.userId === filters.userId);
      }
      if (filters.limit) {
        filtered = filtered.slice(-filters.limit);
      }
    }

    return filtered.reverse(); // Most recent first
  }

  /**
   * Clear all events
   */
  clear(): void {
    this.events = [];
  }

  /**
   * Export events as JSON
   */
  export(): string {
    return JSON.stringify(this.events, null, 2);
  }
}

export const auditLogger = new AuditLogger();

/**
 * Helper functions for common audit events
 */
export const auditHelpers = {
  loginSuccess(userId: string, userEmail: string, organizationId?: string) {
    auditLogger.log({
      type: AuditEventType.LOGIN_SUCCESS,
      severity: AuditSeverity.LOW,
      userId,
      userEmail,
      organizationId,
      action: 'login',
    });
  },

  loginFailure(email: string, reason: string) {
    auditLogger.log({
      type: AuditEventType.LOGIN_FAILURE,
      severity: AuditSeverity.MEDIUM,
      userEmail: email,
      action: 'login_attempt',
      details: { reason },
    });
  },

  logout(userId: string) {
    auditLogger.log({
      type: AuditEventType.LOGOUT,
      severity: AuditSeverity.LOW,
      userId,
      action: 'logout',
    });
  },

  permissionDenied(userId: string, resource: string, action: string) {
    auditLogger.log({
      type: AuditEventType.PERMISSION_DENIED,
      severity: AuditSeverity.MEDIUM,
      userId,
      resource,
      action,
    });
  },

  rateLimitExceeded(userId: string | undefined, endpoint: string) {
    auditLogger.log({
      type: AuditEventType.RATE_LIMIT_EXCEEDED,
      severity: AuditSeverity.MEDIUM,
      userId,
      resource: endpoint,
      action: 'rate_limit',
    });
  },

  suspiciousActivity(
    userId: string | undefined,
    description: string,
    details?: Record<string, unknown>
  ) {
    auditLogger.log({
      type: AuditEventType.SUSPICIOUS_ACTIVITY,
      severity: AuditSeverity.HIGH,
      userId,
      action: 'suspicious',
      details: { description, ...details },
    });
  },

  xssAttempt(userId: string | undefined, input: string) {
    auditLogger.log({
      type: AuditEventType.XSS_ATTEMPT,
      severity: AuditSeverity.CRITICAL,
      userId,
      action: 'xss_attempt',
      details: { input: input.substring(0, 200) }, // Truncate for safety
    });
  },

  sqlInjectionAttempt(userId: string | undefined, input: string) {
    auditLogger.log({
      type: AuditEventType.SQL_INJECTION_ATTEMPT,
      severity: AuditSeverity.CRITICAL,
      userId,
      action: 'sql_injection_attempt',
      details: { input: input.substring(0, 200) }, // Truncate for safety
    });
  },

  dataAccess(userId: string, resource: string, recordId: string) {
    auditLogger.log({
      type: AuditEventType.DATA_ACCESS,
      severity: AuditSeverity.LOW,
      userId,
      resource,
      action: 'read',
      details: { recordId },
    });
  },

  dataModification(
    userId: string,
    resource: string,
    recordId: string,
    changes: Record<string, unknown>
  ) {
    auditLogger.log({
      type: AuditEventType.DATA_MODIFICATION,
      severity: AuditSeverity.MEDIUM,
      userId,
      resource,
      action: 'update',
      details: { recordId, changes },
    });
  },

  dataDeletion(userId: string, resource: string, recordId: string) {
    auditLogger.log({
      type: AuditEventType.DATA_DELETION,
      severity: AuditSeverity.HIGH,
      userId,
      resource,
      action: 'delete',
      details: { recordId },
    });
  },
};
