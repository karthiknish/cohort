import { describe, expect, it } from 'vitest';
import { buildMeetingNotesPdfBytes, isPdfBytes, parseMeetingNotesMarkdown, } from './meeting-notes-pdf';
const SAMPLE_NOTES = `## Summary
- Discussed launch scope

## Decisions
- Ship next week

## Action Items
- Draft plan

## Risks / Blockers
- None noted.`;
describe('meeting-notes-pdf', () => {
    it('parses meeting note markdown blocks', () => {
        const blocks = parseMeetingNotesMarkdown(SAMPLE_NOTES);
        expect(blocks.filter((block) => block.type === 'heading').map((block) => block.text)).toEqual([
            'Summary',
            'Decisions',
            'Action Items',
            'Risks / Blockers',
        ]);
        expect(blocks.some((block) => block.type === 'bullet' && block.text === 'Discussed launch scope')).toBe(true);
    });
    it('builds a valid PDF document', () => {
        const bytes = buildMeetingNotesPdfBytes({
            meetingTitle: 'Weekly sync',
            content: SAMPLE_NOTES,
        });
        expect(isPdfBytes(bytes)).toBe(true);
        expect(bytes.length).toBeGreaterThan(500);
    });
});
