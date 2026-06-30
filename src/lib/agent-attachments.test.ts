import { describe, expect, it } from 'vitest';
import { parseAgentAttachmentsFromStored, serializeAgentAttachmentsForStorage, type AgentAttachmentContext, } from './agent-attachments';
describe('agent-attachments storage', () => {
    it('round-trips attachment metadata without extracting placeholders', () => {
        const attachments: AgentAttachmentContext[] = [
            {
                id: 'a1',
                name: 'brief.md',
                mimeType: 'text/markdown',
                sizeLabel: '2 KB',
                excerpt: 'Project goals',
                extractedText: 'Project goals for Q2',
                extractionStatus: 'ready',
                storageId: 'r2:agent/brief.md',
                url: 'https://example.com/brief.md',
            },
            {
                id: 'a2',
                name: 'scan.pdf',
                mimeType: 'application/pdf',
                sizeLabel: '120 KB',
                excerpt: 'Limited PDF',
                extractionStatus: 'extracting',
            },
        ];
        const stored = serializeAgentAttachmentsForStorage(attachments);
        expect(stored).toHaveLength(1);
        expect(stored[0]?.name).toBe('brief.md');
        const parsed = parseAgentAttachmentsFromStored(stored);
        expect(parsed).toHaveLength(1);
        expect(parsed?.[0]?.extractionStatus).toBe('ready');
        expect(parsed?.[0]?.storageId).toBe('r2:agent/brief.md');
        expect(parsed?.[0]?.url).toBe('https://example.com/brief.md');
    });
});
