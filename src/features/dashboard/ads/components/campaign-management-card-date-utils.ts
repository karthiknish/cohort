export function toIsoDateOnly(date: Date): string {
    return date.toISOString().split('T')[0] ?? '';
}
export function formatRelativeDate(date: Date): string {
    const now = new Date();
    const diffTime = date.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    if (diffDays === 0)
        return 'Today';
    if (diffDays === 1)
        return 'Tomorrow';
    if (diffDays === -1)
        return 'Yesterday';
    if (diffDays > 0 && diffDays <= 7)
        return `In ${diffDays} days`;
    if (diffDays < 0 && diffDays >= -7)
        return `${Math.abs(diffDays)} days ago`;
    return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined });
}
export function formatCampaignDateRange(startTime?: string, stopTime?: string): string {
    const now = new Date();
    const start = startTime ? new Date(startTime) : null;
    const stop = stopTime ? new Date(stopTime) : null;
    const hasStart = Boolean(start && !Number.isNaN(start.getTime()));
    const hasStop = Boolean(stop && !Number.isNaN(stop.getTime()));
    if (!hasStart && !hasStop)
        return 'Always running';
    if (hasStart && !hasStop) {
        const validStart = start as Date;
        if (validStart > now) {
            return `Starts ${formatRelativeDate(validStart)}`;
        }
        return `Since ${formatRelativeDate(validStart)}`;
    }
    if (!hasStart && hasStop) {
        const validStop = stop as Date;
        if (validStop > now) {
            return `Until ${formatRelativeDate(validStop)}`;
        }
        return `Ended ${formatRelativeDate(validStop)}`;
    }
    // Both dates present
    const validStart = start as Date;
    const validStop = stop as Date;
    const startStr = validStart.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
    const endStr = validStop.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
    if (validStart > now) {
        return `${startStr} - ${endStr}`;
    }
    if (validStop < now) {
        return `Ended ${formatRelativeDate(validStop)}`;
    }
    return `${startStr} - ${endStr}`;
}
