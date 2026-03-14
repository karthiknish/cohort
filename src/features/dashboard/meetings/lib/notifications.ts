export type MeetingNotificationSummary = {
  attempted: number
  sent: number
  failed: number
  skipped: number
}

export function pluralize(count: number, singular: string, plural = `${singular}s`): string {
  return `${count} ${count === 1 ? singular : plural}`
}

export function describeNotificationSummary(
  summary: MeetingNotificationSummary | undefined,
  builder: {
    none: string
    allSent: (sent: number, skipped: number) => string
    partial: (sent: number, failed: number, skipped: number) => string
    failed: (failed: number, skipped: number) => string
  }
): string {
  if (!summary || summary.attempted === 0) return builder.none
  if (summary.failed === 0) return builder.allSent(summary.sent, summary.skipped)
  if (summary.sent === 0) return builder.failed(summary.failed, summary.skipped)
  return builder.partial(summary.sent, summary.failed, summary.skipped)
}