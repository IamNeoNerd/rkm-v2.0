/**
 * Test Data Factory
 * 
 * Generates realistic test data for E2E and integration tests.
 * Covers normal flows, edge cases, and boundary conditions.
 */

/**
 * Generate a unique timestamp-based identifier
 */
export function uniqueId(): string {
    return `${Date.now()}_${Math.random().toString(36).substring(7)}`;
}

/**
 * Generate a unique phone number
 */
export function generatePhone(): string {
    const timestamp = Date.now().toString().slice(-8);
    return `98${timestamp}`;
}

/**
 * Generate a unique email
 */
export function generateEmail(prefix = 'test'): string {
    return `${prefix}_${uniqueId()}@test.rkinstitute.com`;
}

/**
 * Family test data generator
 */
export const FamilyData = {
    /** Normal valid family data */
    valid: () => ({
        fatherName: `Test Parent ${uniqueId()}`,
        phone: generatePhone(),
        email: generateEmail('parent'),
    }),

    /** Family with special characters in name */
    specialCharacters: () => ({
        fatherName: `O'Brien-Smith Jr. (${uniqueId()})`,
        phone: generatePhone(),
        email: generateEmail('special'),
    }),

    /** Family with very long name (edge case) */
    longName: () => ({
        fatherName: `${'A'.repeat(100)} ${uniqueId()}`,
        phone: generatePhone(),
        email: generateEmail('long'),
    }),

    /** Family with minimum valid data */
    minimal: () => ({
        fatherName: 'A',
        phone: generatePhone(),
        email: '',
    }),
};

/**
 * Student test data generator
 */
export const StudentData = {
    /** Normal valid student data */
    valid: (classLevel = 'Class 10') => ({
        studentName: `Test Student ${uniqueId()}`,
        studentClass: classLevel,
    }),

    /** Student with special characters */
    specialCharacters: () => ({
        studentName: `María José O'Connor-Smith ${uniqueId()}`,
        studentClass: 'Class 5',
    }),

    /** Multiple students for batch enrollment */
    batch: (count = 5, classLevel = 'Class 8') =>
        Array.from({ length: count }, () => StudentData.valid(classLevel)),

    /** All class levels */
    allClasses: () => [
        'Class 1', 'Class 2', 'Class 3', 'Class 4', 'Class 5',
        'Class 6', 'Class 7', 'Class 8', 'Class 9', 'Class 10',
    ],
};

/**
 * Payment test data generator
 */
export const PaymentData = {
    /** Valid payment amounts */
    valid: (amount = 1000) => ({
        amount,
        mode: 'CASH' as const,
    }),

    /** UPI payment */
    upi: (amount = 1500) => ({
        amount,
        mode: 'UPI' as const,
    }),

    /** Edge case: Minimum payment (₹1) */
    minimum: () => ({
        amount: 1,
        mode: 'CASH' as const,
    }),

    /** Edge case: Large payment */
    large: () => ({
        amount: 100000,
        mode: 'CASH' as const,
    }),

    /** Edge case: Decimal amount (should be handled) */
    decimal: () => ({
        amount: 1500.50,
        mode: 'UPI' as const,
    }),

    /** Invalid: Zero payment */
    zero: () => ({
        amount: 0,
        mode: 'CASH' as const,
    }),

    /** Invalid: Negative payment */
    negative: () => ({
        amount: -500,
        mode: 'CASH' as const,
    }),
};

/**
 * Staff test data generator
 */
export const StaffData = {
    /** Valid staff member */
    valid: (role = 'STAFF') => ({
        name: `Test Staff ${uniqueId()}`,
        phone: generatePhone(),
        email: generateEmail('staff'),
        role,
        salary: 15000,
    }),

    /** Teacher with higher salary */
    teacher: () => ({
        name: `Test Teacher ${uniqueId()}`,
        phone: generatePhone(),
        email: generateEmail('teacher'),
        role: 'STAFF',
        staffType: 'Teacher',
        salary: 25000,
    }),

    /** Admin user */
    admin: () => ({
        name: `Test Admin ${uniqueId()}`,
        phone: generatePhone(),
        email: generateEmail('admin'),
        role: 'ADMIN',
        salary: 30000,
    }),
};

/**
 * Batch test data generator
 */
export const BatchData = {
    /** Valid batch */
    valid: () => ({
        name: `Batch ${uniqueId()}`,
        fee: 1500,
    }),

    /** Batch with zero fee */
    freeClass: () => ({
        name: `Free Batch ${uniqueId()}`,
        fee: 0,
    }),

    /** Premium batch with high fee */
    premium: () => ({
        name: `Premium Batch ${uniqueId()}`,
        fee: 5000,
    }),
};

/**
 * Session test data generator
 */
export const SessionData = {
    /** Future session (safe to create without conflicts) */
    future: () => {
        const year = new Date().getFullYear() + 5 + Math.floor(Math.random() * 10);
        return {
            name: `Session ${year}-${year + 1}`,
            startYear: year,
            endYear: year + 1,
        };
    },

    /** Current year session */
    current: () => {
        const year = new Date().getFullYear();
        return {
            name: `Session ${year}-${year + 1}`,
            startYear: year,
            endYear: year + 1,
        };
    },
};

/**
 * Fee structure test data
 */
export const FeeStructureData = {
    /** Valid fee structure */
    valid: (className = 'Class 10') => ({
        className: `${className}_${uniqueId()}`,
        monthlyFee: 2500,
    }),

    /** Range of fee structures for all classes */
    allClasses: () => StudentData.allClasses().map((className, index) => ({
        className,
        monthlyFee: 1000 + (index * 200), // Increasing fees by class
    })),
};

/**
 * Error scenario data
 */
export const ErrorData = {
    /** Duplicate phone (use with existing family) */
    duplicatePhone: (existingPhone: string) => ({
        fatherName: `Duplicate ${uniqueId()}`,
        phone: existingPhone,
    }),

    /** Invalid email format */
    invalidEmail: () => ({
        email: 'not-an-email',
    }),

    /** SQL injection attempt (should be safely handled) */
    sqlInjection: () => ({
        name: `'; DROP TABLE students; --`,
    }),

    /** XSS attempt (should be escaped) */
    xssAttempt: () => ({
        name: `<script>alert('xss')</script>`,
    }),
};
