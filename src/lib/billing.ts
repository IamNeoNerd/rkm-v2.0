
import { getDaysInMonth, differenceInDays, startOfMonth, endOfMonth, addMonths, getDate, format } from "date-fns";

export const BILLING_CYCLE_START_DAY = 1;

/**
 * Calculates the pro-rata fee for a student joining mid-month.
 * @param joiningDate The date the student joins.
 * @param monthlyFee The standard monthly fee for the class.
 * @returns Object containing the calculations and checking for conflict.
 */
export function calculateJoiningFee(joiningDate: Date, monthlyFee: number) {
    const dayOfMonth = getDate(joiningDate);
    const isMidMonth = dayOfMonth !== BILLING_CYCLE_START_DAY;

    if (!isMidMonth) {
        return {
            isConflict: false,
            suggestedAmount: monthlyFee,
            explanation: "Standard billing cycle (1st of month)."
        };
    }

    const daysInCurrentMonth = getDaysInMonth(joiningDate);
    const monthEnd = endOfMonth(joiningDate);

    // Calculate remaining days inclusive of joining date? Usually yes.
    // Example: Join on 20th. Days active: 20, 21, ... end.
    const remainingDays = differenceInDays(monthEnd, joiningDate) + 1;

    // Daily rate
    const dailyRate = monthlyFee / daysInCurrentMonth;
    const proRataAmount = Math.round(dailyRate * remainingDays);

    return {
        isConflict: true,
        suggestedAmount: proRataAmount,
        fullMonthFee: monthlyFee,
        dailyRate: dailyRate.toFixed(2),
        remainingDays,
        explanation: `Joined on ${format(joiningDate, 'do')}. ${remainingDays} days remaining in month. Pro-rata calculated.`
    };
}
