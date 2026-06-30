import { describe, expect, it } from 'vitest';
import { formatConversationSnippet } from './chat-text';
describe('formatConversationSnippet', () => {
    it('strips markdown and clamps long previews', () => {
        const raw = 'Check this link https://example.com/very/long/path/that/should/not/break/the/sidebar/layout and **bold** text';
        const snippet = formatConversationSnippet(raw, 48);
        expect(snippet.length).toBeLessThanOrEqual(48);
        expect(snippet).not.toContain('**');
        expect(snippet.endsWith('…')).toBe(true);
    });
    it('replaces fenced code blocks with a short label', () => {
        const snippet = formatConversationSnippet('Before ```const x = 1``` after', 80);
        expect(snippet).toContain('[code]');
        expect(snippet).not.toContain('const x');
    });
});
