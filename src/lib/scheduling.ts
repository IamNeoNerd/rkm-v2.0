
export function parseTimeRange(timeStr: string) {
    // Expects "HH:MM-HH:MM"
    const [startStr, endStr] = timeStr.split('-');
    if (!startStr || !endStr) return null;

    const parseMinutes = (t: string) => {
        const [h, m] = t.split(':').map(Number);
        return h * 60 + m;
    };

    return { start: parseMinutes(startStr), end: parseMinutes(endStr) };
}

export function parseDays(dayStr: string): string[] {
    // specific patterns
    if (dayStr === 'MWF') return ['Mon', 'Wed', 'Fri'];
    if (dayStr === 'TTS') return ['Tue', 'Thu', 'Sat'];
    if (dayStr === 'Daily') return ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

    // Check for comma separated
    if (dayStr.includes(',')) return dayStr.split(',').map(d => d.trim());

    // Fallback: just return the string as a single day entry or unknown
    return [dayStr];
}

export function checkTimeConflict(newBatchSchedule: string, existingBatchSchedules: string[]) {
    // Format assumption: "DAYS TIME-RANGE" e.g., "MWF 16:00-17:00"

    // 1. Parse New Schedule
    const parts = newBatchSchedule.split(' ');
    if (parts.length < 2) {
        // Fallback to exact match if format is not "Day Time"
        if (existingBatchSchedules.includes(newBatchSchedule)) {
            return { conflict: true, reason: `Exact schedule match: ${newBatchSchedule}` };
        }
        return { conflict: false };
    }

    const newDaysStr = parts[0];
    const newTimeStr = parts[1];

    const newDays = parseDays(newDaysStr);
    const newTime = parseTimeRange(newTimeStr);

    if (!newTime) {
        // Fallback to exact match
        if (existingBatchSchedules.includes(newBatchSchedule)) {
            return { conflict: true, reason: `Exact schedule match (invalid time format)` };
        }
        return { conflict: false };
    }

    // 2. Check against each existing schedule
    for (const existing of existingBatchSchedules) {
        // Exact match check first
        if (existing === newBatchSchedule) {
            return { conflict: true, reason: `Exact schedule match` };
        }

        const eParts = existing.split(' ');
        if (eParts.length < 2) continue; // standardized checking

        const eDaysStr = eParts[0];
        const eTimeStr = eParts[1];

        const eDays = parseDays(eDaysStr);
        const eTime = parseTimeRange(eTimeStr);

        if (!eTime) continue;

        // Check Day Overlap
        const dayOverlap = newDays.some(d => eDays.includes(d));
        if (!dayOverlap) continue;

        // Check Time Overlap
        // (StartA < EndB) and (EndA > StartB)
        if (newTime.start < eTime.end && newTime.end > eTime.start) {
            return {
                conflict: true,
                reason: `Time conflict with ${existing}`
            };
        }
    }

    return { conflict: false };
}
