import { describe, it, expect, vi } from 'vitest';
import {
    AppError,
    AuthenticationError,
    AuthorizationError,
    ValidationError,
    NotFoundError,
    ConflictError,
    BusinessError,
    DatabaseError,
    RateLimitError,
    isAppError,
    isValidationError,
    createErrorResponse,
    createSuccessResponse,
} from '@/lib/errors';

describe('Error Classes', () => {
    describe('AppError', () => {
        it('should create error with default values', () => {
            const error = new AppError('Test error');

            expect(error.message).toBe('Test error');
            expect(error.code).toBe('INTERNAL_ERROR');
            expect(error.statusCode).toBe(500);
            expect(error.isOperational).toBe(true);
        });

        it('should create error with custom values', () => {
            const error = new AppError('Custom error', 'CUSTOM_CODE', 418, false, { key: 'value' });

            expect(error.message).toBe('Custom error');
            expect(error.code).toBe('CUSTOM_CODE');
            expect(error.statusCode).toBe(418);
            expect(error.isOperational).toBe(false);
            expect(error.context).toEqual({ key: 'value' });
        });
    });

    describe('AuthenticationError', () => {
        it('should have correct defaults', () => {
            const error = new AuthenticationError();

            expect(error.message).toBe('Authentication required');
            expect(error.code).toBe('AUTHENTICATION_ERROR');
            expect(error.statusCode).toBe(401);
        });

        it('should accept custom message', () => {
            const error = new AuthenticationError('Custom auth message');

            expect(error.message).toBe('Custom auth message');
        });
    });

    describe('AuthorizationError', () => {
        it('should have correct defaults', () => {
            const error = new AuthorizationError();

            expect(error.message).toBe('Access denied');
            expect(error.code).toBe('AUTHORIZATION_ERROR');
            expect(error.statusCode).toBe(403);
        });
    });

    describe('ValidationError', () => {
        it('should have correct defaults', () => {
            const error = new ValidationError();

            expect(error.message).toBe('Validation failed');
            expect(error.code).toBe('VALIDATION_ERROR');
            expect(error.statusCode).toBe(400);
            expect(error.errors).toEqual({});
        });

        it('should store validation errors', () => {
            const errors = {
                email: ['Invalid email format'],
                password: ['Too short', 'Must contain number'],
            };
            const error = new ValidationError('Validation failed', errors);

            expect(error.errors).toEqual(errors);
        });
    });

    describe('NotFoundError', () => {
        it('should format resource name in message', () => {
            const error = new NotFoundError('User');

            expect(error.message).toBe('User not found');
            expect(error.code).toBe('NOT_FOUND');
            expect(error.statusCode).toBe(404);
        });
    });

    describe('ConflictError', () => {
        it('should have correct defaults', () => {
            const error = new ConflictError();

            expect(error.message).toBe('Resource already exists');
            expect(error.code).toBe('CONFLICT');
            expect(error.statusCode).toBe(409);
        });
    });

    describe('BusinessError', () => {
        it('should have correct code', () => {
            const error = new BusinessError('Insufficient balance');

            expect(error.message).toBe('Insufficient balance');
            expect(error.code).toBe('BUSINESS_ERROR');
            expect(error.statusCode).toBe(422);
        });
    });

    describe('DatabaseError', () => {
        it('should be non-operational by default', () => {
            const error = new DatabaseError();

            expect(error.message).toBe('Database operation failed');
            expect(error.code).toBe('DATABASE_ERROR');
            expect(error.statusCode).toBe(500);
            expect(error.isOperational).toBe(false);
        });
    });

    describe('RateLimitError', () => {
        it('should have correct defaults', () => {
            const error = new RateLimitError();

            expect(error.message).toBe('Too many requests');
            expect(error.code).toBe('RATE_LIMIT');
            expect(error.statusCode).toBe(429);
        });
    });
});

describe('Type Guards', () => {
    describe('isAppError', () => {
        it('should return true for AppError instances', () => {
            expect(isAppError(new AppError('test'))).toBe(true);
            expect(isAppError(new AuthenticationError())).toBe(true);
            expect(isAppError(new ValidationError())).toBe(true);
        });

        it('should return false for non-AppError values', () => {
            expect(isAppError(new Error('test'))).toBe(false);
            expect(isAppError('string')).toBe(false);
            expect(isAppError(null)).toBe(false);
            expect(isAppError(undefined)).toBe(false);
            expect(isAppError({ message: 'fake' })).toBe(false);
        });
    });

    describe('isValidationError', () => {
        it('should return true for ValidationError instances', () => {
            expect(isValidationError(new ValidationError())).toBe(true);
        });

        it('should return false for other AppError types', () => {
            expect(isValidationError(new AppError('test'))).toBe(false);
            expect(isValidationError(new AuthenticationError())).toBe(false);
        });
    });
});

describe('Response Helpers', () => {
    describe('createSuccessResponse', () => {
        it('should create success response with data', () => {
            const data = { id: 1, name: 'Test' };
            const response = createSuccessResponse(data);

            expect(response.success).toBe(true);
            expect(response.data).toEqual(data);
        });

        it('should handle primitive data', () => {
            const response = createSuccessResponse('hello');

            expect(response.success).toBe(true);
            expect(response.data).toBe('hello');
        });
    });

    describe('createErrorResponse', () => {
        it('should format AppError correctly', () => {
            const error = new ValidationError('Bad input', { field: ['error'] }, { extraInfo: true });
            const response = createErrorResponse(error);

            expect(response.success).toBe(false);
            expect(response.error.code).toBe('VALIDATION_ERROR');
            expect(response.error.message).toBe('Bad input');
            expect(response.error.details).toEqual({ extraInfo: true });
        });

        it('should format standard Error with message in development', () => {
            vi.stubEnv('NODE_ENV', 'development');

            const error = new Error('Something broke');
            const response = createErrorResponse(error);

            expect(response.success).toBe(false);
            expect(response.error.code).toBe('INTERNAL_ERROR');
            expect(response.error.message).toBe('Something broke');

            vi.unstubAllEnvs();
        });

        it('should hide message in production for standard Error', () => {
            vi.stubEnv('NODE_ENV', 'production');

            const error = new Error('Sensitive error info');
            const response = createErrorResponse(error);

            expect(response.success).toBe(false);
            expect(response.error.message).toBe('An unexpected error occurred');

            vi.unstubAllEnvs();
        });

        it('should handle unknown error types', () => {
            const response = createErrorResponse('string error');

            expect(response.success).toBe(false);
            expect(response.error.code).toBe('UNKNOWN_ERROR');
        });
    });
});
