import { describe, expect, it, vi } from 'vitest';
import { describeEarliestMeetingStart, MIN_MEETING_SCHEDULE_LEAD_MS } from './utils';

describe('describeEarliestMeetingStart', () => {
    it('formats the earliest allowed start in the provided timezone', () => {
        const nowMs = Date.parse('2026-07-10T10:00:00Z');
        const formatter = new Intl.DateTimeFormat('en-US', {
            dateStyle: 'medium',
            timeStyle: 'short',
            timeZone: 'UTC',
        });
        const expected = formatter.format(new Date(nowMs + MIN_MEETING_SCHEDULE_LEAD_MS));
        vi.spyOn(Intl, 'DateTimeFormat').mockImplementation((locale, options) => new Intl.DateTimeFormat(locale, options));
        expect(describeEarliestMeetingStart('UTC', nowMs)).toBe(expected);
    });
});
