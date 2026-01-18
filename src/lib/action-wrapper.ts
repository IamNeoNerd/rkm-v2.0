/**
 * Server Action Wrapper for consistent error handling
 * Wraps all server actions with standardized error handling and logging
 */

import { auth } from '@/auth';
import { logger, AuditAction, audit } from './logger';
import {
    AppError,
    AuthenticationError,
    AuthorizationError,
    ValidationError,
    createErrorResponse,
    createSuccessResponse,
    ActionResponse,
} from './errors';

// Options for action wrapper
interface ActionOptions {
    // Require authentication
    requireAuth?: boolean;
    // Required roles (any of these roles will be accepted)
    requiredRoles?: string[];
    // Action name for logging
    actionName?: string;
    // Audit action type (if set, will create audit log on success)
    auditAction?: AuditAction;
    // Entity type for audit log
    entityType?: string;
}

// Type for server action function
type ServerAction<TInput, TOutput> = (input: TInput) => Promise<TOutput>;

// Type for wrapped action
type WrappedAction<TInput, TOutput> = (input: TInput) => Promise<ActionResponse<TOutput>>;

/**
 * Wraps a server action with error handling, authentication, and logging
 * 
 * @example
 * export const myAction = wrapAction(
 *   async (input: { id: number }) => {
 *     // Your logic here
 *     return { result: 'success' };
 *   },
 *   { requireAuth: true, actionName: 'myAction', auditAction: AuditAction.USER_UPDATE }
 * );
 */
export function wrapAction<TInput, TOutput>(
    action: ServerAction<TInput, TOutput>,
    options: ActionOptions = {}
): WrappedAction<TInput, TOutput> {
    const {
        requireAuth = true,
        requiredRoles,
        actionName = 'UnnamedAction',
        auditAction,
        entityType,
    } = options;

    return async (input: TInput): Promise<ActionResponse<TOutput>> => {
        const startTime = Date.now();

        try {
            // Authentication check
            if (requireAuth) {
                const session = await auth();

                if (!session?.user) {
                    logger.warn(`Unauthorized access attempt: ${actionName}`);
                    throw new AuthenticationError('You must be logged in to perform this action');
                }

                // Role check
                if (requiredRoles && requiredRoles.length > 0) {
                    const userRole = session.user.role;
                    if (!userRole || !requiredRoles.includes(userRole)) {
                        logger.warn(`Forbidden access attempt: ${actionName}`, {
                            userRole,
                            requiredRoles,
                            userId: session.user.email,
                        });
                        throw new AuthorizationError(
                            `This action requires one of these roles: ${requiredRoles.join(', ')}`
                        );
                    }
                }
            }

            // Execute the action
            const result = await action(input);
            const duration = Date.now() - startTime;

            // Log success
            logger.info(`Action completed: ${actionName}`, {
                duration: `${duration}ms`,
                inputKeys: typeof input === 'object' && input !== null ? Object.keys(input) : [],
            });

            // Audit log if configured
            if (auditAction) {
                const entityId = (input as { id?: string | number })?.id || (result as { id?: string | number })?.id;
                await audit(auditAction, { input, duration }, entityType, entityId?.toString());
            }

            return createSuccessResponse(result);
        } catch (error) {
            const duration = Date.now() - startTime;

            // Log the error
            if (error instanceof AppError && error.isOperational) {
                logger.warn(`Action failed: ${actionName}`, {
                    error: error.message,
                    code: error.code,
                    duration: `${duration}ms`,
                });
            } else {
                logger.error(`Action error: ${actionName}`, error, {
                    duration: `${duration}ms`,
                });
            }

            return createErrorResponse(error);
        }
    };
}

/**
 * Simple wrapper for actions that just need error handling
 * without the full ActionResponse structure
 */
export async function safeAction<T>(
    actionName: string,
    fn: () => Promise<T>
): Promise<{ success: true; data: T } | { success: false; error: string }> {
    try {
        const result = await fn();
        return { success: true, data: result };
    } catch (error) {
        logger.error(`Safe action failed: ${actionName}`, error);
        return {
            success: false,
            error: error instanceof Error ? error.message : 'An unexpected error occurred',
        };
    }
}

/**
 * Validation helper that throws ValidationError
 */
export function validateInput<T>(
    data: unknown,
    validator: (data: unknown) => { success: boolean; data?: T; error?: { errors: { path: string[]; message: string }[] } }
): T {
    const result = validator(data);

    if (!result.success && result.error) {
        const errors: Record<string, string[]> = {};
        for (const err of result.error.errors) {
            const path = err.path.join('.');
            if (!errors[path]) {
                errors[path] = [];
            }
            errors[path].push(err.message);
        }
        throw new ValidationError('Validation failed', errors);
    }

    return result.data as T;
}
