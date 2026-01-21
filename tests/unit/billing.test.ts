import { describe, it, expect } from 'vitest';
import { calculateJoiningFee, BILLING_CYCLE_START_DAY } from '@/lib/billing';

describe('calculateJoiningFee', () => {
    describe('when joining on the 1st of the month', () => {
        it('should return full monthly fee without conflict', () => {
            const joiningDate = new Date(2026, 0, 1); // January 1st, 2026
            const monthlyFee = 3000;

            const result = calculateJoiningFee(joiningDate, monthlyFee);

            expect(result.isConflict).toBe(false);
            expect(result.suggestedAmount).toBe(3000);
            expect(result.explanation).toContain('Standard billing cycle');
        });
    });

    describe('when joining mid-month', () => {
        it('should calculate pro-rata fee for joining on 15th', () => {
            // January 2026 has 31 days
            const joiningDate = new Date(2026, 0, 15); // January 15th
            const monthlyFee = 3100; // Easy to calculate: 100/day

            const result = calculateJoiningFee(joiningDate, monthlyFee);

            expect(result.isConflict).toBe(true);
            // Days remaining: 15th to 31st = 17 days
            expect(result.remainingDays).toBe(17);
            // Pro-rata: (3100/31) * 17 = 1700
            expect(result.suggestedAmount).toBe(1700);
        });

        it('should calculate pro-rata fee for joining on 20th', () => {
            // January 2026 has 31 days
            const joiningDate = new Date(2026, 0, 20); // January 20th
            const monthlyFee = 3100;

            const result = calculateJoiningFee(joiningDate, monthlyFee);

            expect(result.isConflict).toBe(true);
            // Days remaining: 20th to 31st = 12 days
            expect(result.remainingDays).toBe(12);
            // Pro-rata: (3100/31) * 12 = 1200
            expect(result.suggestedAmount).toBe(1200);
        });

        it('should handle joining on last day of month', () => {
            const joiningDate = new Date(2026, 0, 31); // January 31st
            const monthlyFee = 3100;

            const result = calculateJoiningFee(joiningDate, monthlyFee);

            expect(result.isConflict).toBe(true);
            expect(result.remainingDays).toBe(1);
            // Pro-rata: (3100/31) * 1 = 100
            expect(result.suggestedAmount).toBe(100);
        });

        it('should handle February correctly (28 days)', () => {
            // February 2026 is not a leap year, so 28 days
            const joiningDate = new Date(2026, 1, 14); // February 14th
            const monthlyFee = 2800; // 100/day

            const result = calculateJoiningFee(joiningDate, monthlyFee);

            expect(result.isConflict).toBe(true);
            // Days remaining: 14th to 28th = 15 days
            expect(result.remainingDays).toBe(15);
            // Pro-rata: (2800/28) * 15 = 1500
            expect(result.suggestedAmount).toBe(1500);
        });

        it('should include explanation with join date', () => {
            const joiningDate = new Date(2026, 0, 15);
            const monthlyFee = 3000;

            const result = calculateJoiningFee(joiningDate, monthlyFee);

            expect(result.explanation).toContain('15th');
            expect(result.explanation).toContain('Pro-rata');
        });
    });

    describe('edge cases', () => {
        it('should handle zero monthly fee', () => {
            const joiningDate = new Date(2026, 0, 15);
            const monthlyFee = 0;

            const result = calculateJoiningFee(joiningDate, monthlyFee);

            expect(result.suggestedAmount).toBe(0);
        });

        it('should round pro-rata amount to nearest integer', () => {
            // Create a scenario that would result in non-integer
            const joiningDate = new Date(2026, 0, 10);
            const monthlyFee = 1000;

            const result = calculateJoiningFee(joiningDate, monthlyFee);

            expect(Number.isInteger(result.suggestedAmount)).toBe(true);
        });
    });
});

describe('BILLING_CYCLE_START_DAY', () => {
    it('should be 1 (first of month)', () => {
        expect(BILLING_CYCLE_START_DAY).toBe(1);
    });
});
