export type NotificationsCursor = {
    createdAtMs: number;
    legacyId: string;
    scanCursor?: string | null;
    overflowLegacyIds?: string[];
};
export const MAX_NOTIFICATION_PAGES = 10;
export const VIRTUAL_NOTIFICATIONS_THRESHOLD = 24;
export const FILTER_VALUES = ['all', 'unread', 'mentions', 'tasks', 'collaboration', 'system'] as const;
export type AckAction = 'read' | 'dismiss';
export type FilterType = (typeof FILTER_VALUES)[number];
export const FILTER_EMPTY_LABELS: Partial<Record<FilterType, string>> = {
    unread: 'unread',
    mentions: 'mention',
    tasks: 'task',
    collaboration: 'collaboration',
    system: 'system',
};
