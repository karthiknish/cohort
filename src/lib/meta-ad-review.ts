export type MetaAdReviewStatus = 'approved' | 'pending' | 'disapproved' | 'issues' | 'unknown';
export type MetaAdReviewSummary = {
    status: MetaAdReviewStatus;
    messages: string[];
};
function pushUniqueMessage(messages: string[], text: string) {
    const trimmed = text.trim();
    if (!trimmed || messages.includes(trimmed))
        return;
    messages.push(trimmed);
}
function parseAdReviewFeedback(feedback: unknown, messages: string[]) {
    if (!feedback || typeof feedback !== 'object')
        return;
    const global = (feedback as {
        global?: Record<string, unknown>;
    }).global;
    if (!global || typeof global !== 'object')
        return;
    for (const [key, value] of Object.entries(global)) {
        if (typeof value === 'string') {
            pushUniqueMessage(messages, `${key}: ${value}`);
        }
    }
}
function parseIssuesInfo(issuesInfo: unknown, messages: string[]) {
    if (!Array.isArray(issuesInfo))
        return;
    for (const issue of issuesInfo) {
        if (!issue || typeof issue !== 'object')
            continue;
        const row = issue as {
            error_summary?: string;
            error_message?: string;
        };
        const text = [row.error_summary, row.error_message].filter(Boolean).join(' — ');
        if (text)
            pushUniqueMessage(messages, text);
    }
}
export function summarizeMetaAdReview(effectiveStatus: string, adReviewFeedback?: unknown, issuesInfo?: unknown): MetaAdReviewSummary {
    const messages: string[] = [];
    parseAdReviewFeedback(adReviewFeedback, messages);
    parseIssuesInfo(issuesInfo, messages);
    const statusUpper = effectiveStatus.trim().toUpperCase();
    if (statusUpper === 'DISAPPROVED') {
        return { status: 'disapproved', messages };
    }
    if (statusUpper === 'PENDING_REVIEW' || statusUpper === 'IN_PROCESS') {
        return { status: 'pending', messages };
    }
    if (statusUpper === 'WITH_ISSUES') {
        return { status: 'issues', messages };
    }
    if (statusUpper === 'ACTIVE'
        || statusUpper === 'PREAPPROVED'
        || statusUpper === 'PAUSED'
        || statusUpper === 'ARCHIVED') {
        return { status: messages.length > 0 ? 'issues' : 'approved', messages };
    }
    return { status: messages.length > 0 ? 'issues' : 'unknown', messages };
}
export function metaAdReviewStatusLabel(status: MetaAdReviewStatus): string {
    switch (status) {
        case 'approved':
            return 'Approved';
        case 'pending':
            return 'In review';
        case 'disapproved':
            return 'Disapproved';
        case 'issues':
            return 'Has issues';
        default:
            return 'Review';
    }
}
