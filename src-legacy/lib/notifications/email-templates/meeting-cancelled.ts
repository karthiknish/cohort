/**
 * Meeting Cancelled Email Template
 */
import { getMeetingEmailDateFormatter, getMeetingEmailTimeFormatter } from '@/lib/intl/meeting-email-formatters';
import { escapeHtml, wrapEmailTemplate } from './utils';
export interface MeetingCancelledTemplateParams {
    meetingTitle: string;
    meetingStartIso: string;
    meetingTimezone: string;
    cancelledBy: string;
    cancellationReason?: string | null;
}
function formatMeetingTime(startIso: string, timezone: string): string {
    try {
        const start = new Date(startIso);
        const dateLabel = getMeetingEmailDateFormatter(timezone).format(start);
        const startLabel = getMeetingEmailTimeFormatter(timezone).format(start);
        return `${dateLabel} at ${startLabel}`;
    }
    catch {
        return startIso;
    }
}
export function meetingCancelledTemplate(params: MeetingCancelledTemplateParams): string {
    const { meetingTitle, meetingStartIso, meetingTimezone, cancelledBy, cancellationReason, } = params;
    const safeTitle = escapeHtml(meetingTitle);
    const safeTimezone = escapeHtml(meetingTimezone);
    const safeCancelledBy = escapeHtml(cancelledBy);
    const formattedTime = formatMeetingTime(meetingStartIso, meetingTimezone);
    const safeReason = typeof cancellationReason === 'string' && cancellationReason.trim().length > 0
        ? escapeHtml(cancellationReason.trim())
        : null;
    return wrapEmailTemplate(`
    <div class="header">Cohorts Meeting Cancelled</div>
    <div class="content">
      <p>This meeting has been cancelled.</p>
      <div class="highlight">
        <strong>Title:</strong> ${safeTitle}<br>
        <strong>Scheduled for:</strong> ${formattedTime}<br>
        <strong>Timezone:</strong> ${safeTimezone}<br>
        <strong>Cancelled by:</strong> ${safeCancelledBy}
      </div>
      ${safeReason ? `<p><strong>Reason:</strong> ${safeReason}</p>` : ''}
      <p class="meta">No action is needed unless a replacement invite is sent.</p>
    </div>
  `);
}
