import { describe, expect, it } from 'vitest';
import { slugifyMeetingTitle } from './slugify';
import { buildMeetingArtifactFilename } from './meeting-artifact-download';
describe('meeting-artifact-download', () => {
    it('builds stable artifact filenames', () => {
        expect(buildMeetingArtifactFilename('Q2 Launch Review', 'notes-pdf')).toBe('q2-launch-review-notes.pdf');
        expect(buildMeetingArtifactFilename('Q2 Launch Review', 'transcript')).toBe('q2-launch-review-transcript.md');
        expect(slugifyMeetingTitle('!!!')).toBe('meeting');
    });
});
