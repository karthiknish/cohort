import type { RecurrenceRule } from '@/types/tasks';
export function getNextOccurrence(dueDate: string, rule: RecurrenceRule, endDate?: string | null, referenceDate: Date = new Date()): Date | null {
    if (rule === 'none' || !dueDate)
        return null;
    const baseDate = new Date(dueDate);
    const now = referenceDate;
    const end = endDate ? new Date(endDate) : null;
    const next = new Date(baseDate);
    while (next <= now) {
        switch (rule) {
            case 'daily':
                next.setDate(next.getDate() + 1);
                break;
            case 'weekly':
                next.setDate(next.getDate() + 7);
                break;
            case 'biweekly':
                next.setDate(next.getDate() + 14);
                break;
            case 'monthly':
                next.setMonth(next.getMonth() + 1);
                break;
            case 'quarterly':
                next.setMonth(next.getMonth() + 3);
                break;
            case 'yearly':
                next.setFullYear(next.getFullYear() + 1);
                break;
        }
        if (end && next > end) {
            return null;
        }
    }
    return next;
}
