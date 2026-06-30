import type { TranscriptActionResult, TranscriptMode } from '../components/in-site-meeting-card.shared';
export type PostMeetingTranscriptArgs = {
    legacyId: string;
    mode: TranscriptMode;
    markCompleted: boolean;
    source?: string;
    transcriptText?: string;
    notesSummary?: string;
    keepalive?: boolean;
};
export async function postMeetingTranscriptAction({ legacyId, mode, markCompleted, source = 'in-site-voice', transcriptText, notesSummary, keepalive, }: PostMeetingTranscriptArgs): Promise<TranscriptActionResult> {
    const response = await fetch('/api/meetings/transcript', {
        method: 'POST',
        keepalive,
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            legacyId,
            mode,
            markCompleted,
            source,
            transcriptText,
            notesSummary,
        }),
    });
    const payload = (await response.json().catch(() => ({}))) as {
        success?: boolean;
        error?: string;
        data?: TranscriptActionResult;
    };
    if (!response.ok || payload.success === false) {
        throw new Error(payload.error || 'Meeting update failed');
    }
    return (payload.data ?? {}) as TranscriptActionResult;
}
