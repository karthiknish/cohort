import { describe, expect, it } from 'vitest';
import { encodePollMessage, parsePollMessage } from './collaboration-poll-message';
describe('collaboration poll message', () => {
    it('round-trips poll payloads in message content', () => {
        const encoded = encodePollMessage({
            question: 'Ship now?',
            options: [
                { id: 'a', text: 'Yes', voters: [] },
                { id: 'b', text: 'No', voters: [] },
            ],
            multipleChoice: false,
            anonymous: false,
            createdBy: 'user-1',
            createdByName: 'Alex',
            endTime: null,
        });
        const parsed = parsePollMessage(encoded);
        expect(parsed?.question).toBe('Ship now?');
        expect(parsed?.options).toHaveLength(2);
    });
});
