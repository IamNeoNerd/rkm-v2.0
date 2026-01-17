import { describe, it, expect } from 'vitest';
import { parseTimeRange, parseDays, checkTimeConflict } from '@/lib/scheduling';

describe('parseTimeRange', () => {
    it('should parse valid time range', () => {
        const result = parseTimeRange('16:00-17:00');
        expect(result).toEqual({ start: 960, end: 1020 }); // 16*60=960, 17*60=1020
    });

    it('should parse time range with minutes', () => {
        const result = parseTimeRange('09:30-10:45');
        expect(result).toEqual({ start: 570, end: 645 }); // 9*60+30=570, 10*60+45=645
    });

    it('should return null for invalid format', () => {
        expect(parseTimeRange('invalid')).toBeNull();
        expect(parseTimeRange('16:00')).toBeNull();
    });
});

describe('parseDays', () => {
    it('should parse MWF shorthand', () => {
        expect(parseDays('MWF')).toEqual(['Mon', 'Wed', 'Fri']);
    });

    it('should parse TTS shorthand', () => {
        expect(parseDays('TTS')).toEqual(['Tue', 'Thu', 'Sat']);
    });

    it('should parse Daily shorthand', () => {
        expect(parseDays('Daily')).toEqual(['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']);
    });

    it('should parse comma-separated days', () => {
        expect(parseDays('Mon,Wed')).toEqual(['Mon', 'Wed']);
        expect(parseDays('Mon, Wed, Fri')).toEqual(['Mon', 'Wed', 'Fri']);
    });

    it('should return single day for unknown format', () => {
        expect(parseDays('Saturday')).toEqual(['Saturday']);
    });
});

describe('checkTimeConflict', () => {
    describe('exact match detection', () => {
        it('should detect exact schedule match', () => {
            const result = checkTimeConflict(
                'MWF 16:00-17:00',
                ['MWF 16:00-17:00']
            );
            expect(result.conflict).toBe(true);
        });

        it('should detect exact match for non-standard format', () => {
            const result = checkTimeConflict(
                'Mon/Wed 4-5pm',
                ['Mon/Wed 4-5pm']
            );
            expect(result.conflict).toBe(true);
        });
    });

    describe('time overlap detection', () => {
        it('should detect overlapping times on same days', () => {
            const result = checkTimeConflict(
                'MWF 16:00-17:00',
                ['MWF 16:30-17:30'] // Overlaps 16:30-17:00
            );
            expect(result.conflict).toBe(true);
        });

        it('should detect contained time range', () => {
            const result = checkTimeConflict(
                'MWF 15:00-18:00', // Larger range
                ['MWF 16:00-17:00'] // Contained within
            );
            expect(result.conflict).toBe(true);
        });

        it('should allow adjacent non-overlapping times', () => {
            const result = checkTimeConflict(
                'MWF 17:00-18:00',
                ['MWF 16:00-17:00'] // Ends right when new one starts
            );
            expect(result.conflict).toBe(false);
        });
    });

    describe('day overlap detection', () => {
        it('should detect conflict when days overlap', () => {
            const result = checkTimeConflict(
                'MWF 16:00-17:00',
                ['Mon 16:00-17:00'] // Mon is in MWF
            );
            expect(result.conflict).toBe(true);
        });

        it('should allow same time on different days', () => {
            const result = checkTimeConflict(
                'MWF 16:00-17:00',
                ['TTS 16:00-17:00'] // Different days
            );
            expect(result.conflict).toBe(false);
        });
    });

    describe('no conflict scenarios', () => {
        it('should allow different times on same days', () => {
            const result = checkTimeConflict(
                'MWF 16:00-17:00',
                ['MWF 10:00-11:00', 'MWF 18:00-19:00']
            );
            expect(result.conflict).toBe(false);
        });

        it('should allow empty existing schedules', () => {
            const result = checkTimeConflict(
                'MWF 16:00-17:00',
                []
            );
            expect(result.conflict).toBe(false);
        });
    });

    describe('edge cases', () => {
        it('should handle partial day overlap in composite schedules', () => {
            const result = checkTimeConflict(
                'Mon,Wed 16:00-17:00',
                ['Wed,Fri 16:00-17:00'] // Wed overlaps
            );
            expect(result.conflict).toBe(true);
        });
    });
});
