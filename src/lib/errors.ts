/**
 * Centralized Error Types for RK Institute ERP
 * Provides consistent error handling across the application
 */

// Base error class for all application errors
export class AppError extends Error {
    public readonly code: string;
    public readonly statusCode: number;
    public readonly isOperational: boolean;
    public readonly context?: Record<string, unknown>;

    constructor(
        message: string,
        code: string = 'INTERNAL_ERROR',
        statusCode: number = 500,
        isOperational: boolean = true,
        context?: Record<string, unknown>
    ) {
        super(message);
        this.name = this.constructor.name;
        this.code = code;
        this.statusCode = statusCode;
        this.isOperational = isOperational;
        this.context = context;
        Error.captureStackTrace(this, this.constructor);
    }
}

// Authentication & Authorization Errors
export class AuthenticationError extends AppError {
    constructor(message: string = 'Authentication required', context?: Record<string, unknown>) {
        super(message, 'AUTHENTICATION_ERROR', 401, true, context);
    }
}

export class AuthorizationError extends AppError {
    constructor(message: string = 'Access denied', context?: Record<string, unknown>) {
        super(message, 'AUTHORIZATION_ERROR', 403, true, context);
    }
}

// Validation Errors
export class ValidationError extends AppError {
    public readonly errors: Record<string, string[]>;

    constructor(
        message: string = 'Validation failed',
        errors: Record<string, string[]> = {},
        context?: Record<string, unknown>
    ) {
        super(message, 'VALIDATION_ERROR', 400, true, context);
        this.errors = errors;
    }
}

// Not Found Errors
export class NotFoundError extends AppError {
    constructor(resource: string = 'Resource', context?: Record<string, unknown>) {
        super(`${resource} not found`, 'NOT_FOUND', 404, true, context);
    }
}

// Conflict Errors (duplicate entries, etc.)
export class ConflictError extends AppError {
    constructor(message: string = 'Resource already exists', context?: Record<string, unknown>) {
        super(message, 'CONFLICT', 409, true, context);
    }
}

// Business Logic Errors
export class BusinessError extends AppError {
    constructor(message: string, context?: Record<string, unknown>) {
        super(message, 'BUSINESS_ERROR', 422, true, context);
    }
}

// Database Errors
export class DatabaseError extends AppError {
    constructor(message: string = 'Database operation failed', context?: Record<string, unknown>) {
        super(message, 'DATABASE_ERROR', 500, false, context);
    }
}

// Rate Limiting
export class RateLimitError extends AppError {
    constructor(message: string = 'Too many requests', context?: Record<string, unknown>) {
        super(message, 'RATE_LIMIT', 429, true, context);
    }
}

// Error type guards
export function isAppError(error: unknown): error is AppError {
    return error instanceof AppError;
}

export function isValidationError(error: unknown): error is ValidationError {
    return error instanceof ValidationError;
}

// Standard error response type
export interface ErrorResponse {
    success: false;
    error: {
        code: string;
        message: string;
        details?: Record<string, unknown>;
    };
}

// Standard success response type
export interface SuccessResponse<T = unknown> {
    success: true;
    data: T;
}

// Union type for all action responses
export type ActionResponse<T = unknown> = SuccessResponse<T> | ErrorResponse;

// Helper to create error response
export function createErrorResponse(error: unknown): ErrorResponse {
    if (isAppError(error)) {
        return {
            success: false,
            error: {
                code: error.code,
                message: error.message,
                details: error.context,
            },
        };
    }

    if (error instanceof Error) {
        return {
            success: false,
            error: {
                code: 'INTERNAL_ERROR',
                message: process.env.NODE_ENV === 'development'
                    ? error.message
                    : 'An unexpected error occurred',
            },
        };
    }

    return {
        success: false,
        error: {
            code: 'UNKNOWN_ERROR',
            message: 'An unexpected error occurred',
        },
    };
}

// Helper to create success response
export function createSuccessResponse<T>(data: T): SuccessResponse<T> {
    return {
        success: true,
        data,
    };
}
