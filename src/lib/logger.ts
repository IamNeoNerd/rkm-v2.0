/**
 * Logging Service for RK Institute ERP
 * Provides structured logging with different levels and audit trail support
 */

import { db } from '@/db';
import { auditLogs } from '@/db/schema';
import { auth } from '@/auth';

// Log levels
export enum LogLevel {
    DEBUG = 'debug',
    INFO = 'info',
    WARN = 'warn',
    ERROR = 'error',
}

// Audit action types
export enum AuditAction {
    // Auth actions
    LOGIN = 'auth.login',
    LOGOUT = 'auth.logout',
    LOGIN_FAILED = 'auth.login_failed',

    // User management
    USER_CREATE = 'user.create',
    USER_UPDATE = 'user.update',
    USER_DELETE = 'user.delete',
    USER_VERIFY = 'user.verify',
    ROLE_CHANGE = 'user.role_change',

    // Student/Family actions
    ADMISSION_CREATE = 'admission.create',
    STUDENT_UPDATE = 'student.update',
    STUDENT_DELETE = 'student.delete',

    // Financial actions
    PAYMENT_RECEIVE = 'payment.receive',
    PAYMENT_VOID = 'payment.void',
    REFUND_PROCESS = 'refund.process',
    SALARY_PAY = 'salary.pay',

    // Academic actions
    BATCH_CREATE = 'batch.create',
    BATCH_UPDATE = 'batch.update',
    ENROLLMENT_CREATE = 'enrollment.create',
    ENROLLMENT_CANCEL = 'enrollment.cancel',
    ATTENDANCE_MARK = 'attendance.mark',

    // Staff actions
    STAFF_CREATE = 'staff.create',
    STAFF_UPDATE = 'staff.update',
    STAFF_DEACTIVATE = 'staff.deactivate',

    // Settings actions
    SETTINGS_UPDATE = 'settings.update',
    SESSION_CREATE = 'session.create',
    SESSION_ACTIVATE = 'session.activate',
    FEE_STRUCTURE_CREATE = 'fee_structure.create',
    FEE_STRUCTURE_UPDATE = 'fee_structure.update',
    FEE_STRUCTURE_DELETE = 'fee_structure.delete',

    // System actions
    SYSTEM_ERROR = 'system.error',
}

// Log entry interface
interface LogEntry {
    level: LogLevel;
    message: string;
    context?: Record<string, unknown>;
    timestamp: Date;
    userId?: string;
    action?: AuditAction;
}

// Console colors for development
const colors = {
    debug: '\x1b[36m', // Cyan
    info: '\x1b[32m',  // Green
    warn: '\x1b[33m',  // Yellow
    error: '\x1b[31m', // Red
    reset: '\x1b[0m',
};

// Format log for console output
function formatLog(entry: LogEntry): string {
    const color = colors[entry.level] || colors.reset;
    const timestamp = entry.timestamp.toISOString();
    const prefix = `${color}[${entry.level.toUpperCase()}]${colors.reset}`;
    const userInfo = entry.userId ? ` [user:${entry.userId}]` : '';
    const actionInfo = entry.action ? ` [${entry.action}]` : '';

    return `${prefix} ${timestamp}${userInfo}${actionInfo} ${entry.message}`;
}

// Main logger class
class Logger {
    private isDev = process.env.NODE_ENV === 'development';

    private log(level: LogLevel, message: string, context?: Record<string, unknown>) {
        const entry: LogEntry = {
            level,
            message,
            context,
            timestamp: new Date(),
        };

        // Always log to console in development
        if (this.isDev || level === LogLevel.ERROR) {
            console.log(formatLog(entry));
            if (context && this.isDev) {
                console.log('  Context:', JSON.stringify(context, null, 2));
            }
        }

        // In production, you could send to external service here
        // e.g., Sentry, LogRocket, CloudWatch, etc.
    }

    debug(message: string, context?: Record<string, unknown>) {
        this.log(LogLevel.DEBUG, message, context);
    }

    info(message: string, context?: Record<string, unknown>) {
        this.log(LogLevel.INFO, message, context);
    }

    warn(message: string, context?: Record<string, unknown>) {
        this.log(LogLevel.WARN, message, context);
    }

    error(message: string, error?: unknown, context?: Record<string, unknown>) {
        const errorContext = {
            ...context,
            error: error instanceof Error ? {
                name: error.name,
                message: error.message,
                stack: this.isDev ? error.stack : undefined,
            } : error,
        };
        this.log(LogLevel.ERROR, message, errorContext);
    }

    // Audit logging - writes to database
    async audit(
        action: AuditAction,
        details: Record<string, unknown> = {},
        entityType?: string,
        entityId?: string | number
    ) {
        try {
            const session = await auth();
            const userId = session?.user?.email || 'system';
            const userName = session?.user?.name || 'System';

            // Log to console as well
            this.info(`Audit: ${action}`, { userId, entityType, entityId, ...details });

            // Insert into audit_logs table
            await db.insert(auditLogs).values({
                action,
                userId,
                userName,
                entityType: entityType || null,
                entityId: entityId?.toString() || null,
                details: JSON.stringify(details),
                ipAddress: null, // Could be extracted from headers in middleware
                userAgent: null,
                createdAt: new Date(),
            });
        } catch (error) {
            // Don't let audit logging failures break the application
            this.error('Failed to write audit log', error, { action, details });
        }
    }
}

// Export singleton instance
export const logger = new Logger();

// Convenience function for audit logging
export async function audit(
    action: AuditAction,
    details: Record<string, unknown> = {},
    entityType?: string,
    entityId?: string | number
) {
    return logger.audit(action, details, entityType, entityId);
}
