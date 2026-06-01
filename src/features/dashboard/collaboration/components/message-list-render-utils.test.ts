import { describe, expect, it, vi } from 'vitest';
import type { UnifiedMessage } from './message-list-types';
import { mergeMessageListRenderers, toMessageContentComponent } from './message-list-render-utils';
const sampleMessage = {
    id: 'message-1',
    senderId: 'user-1',
    senderName: 'Alex',
    content: 'Hello',
    createdAtMs: Date.now(),
} as UnifiedMessage;
describe('mergeMessageListRenderers', () => {
    it('uses only the renderers bag when no top-level slots are provided', () => {
        const bagExtras = vi.fn(() => 'bag-extras');
        const merged = mergeMessageListRenderers({
            renderers: { renderMessageExtras: bagExtras },
        });
        expect(merged?.renderMessageExtras?.(sampleMessage)).toBe('bag-extras');
    });
    it('uses only top-level slots when no bag is provided', () => {
        const slotExtras = vi.fn(() => 'slot-extras');
        const merged = mergeMessageListRenderers({
            renderMessageExtras: slotExtras,
        });
        expect(merged?.renderMessageExtras?.(sampleMessage)).toBe('slot-extras');
    });
    it('lets top-level slots override the renderers bag', () => {
        const bagExtras = vi.fn(() => 'bag-extras');
        const slotExtras = vi.fn(() => 'slot-extras');
        const merged = mergeMessageListRenderers({
            renderers: { renderMessageExtras: bagExtras },
            renderMessageExtras: slotExtras,
        });
        expect(merged?.renderMessageExtras?.(sampleMessage)).toBe('slot-extras');
        expect(bagExtras).not.toHaveBeenCalled();
    });
    it('merges context then prop with prop winning each slot', () => {
        const contextExtras = vi.fn(() => 'context-extras');
        const propExtras = vi.fn(() => 'prop-extras');
        const merged = {
            ...(mergeMessageListRenderers({ renderMessageExtras: contextExtras }) ?? {}),
            ...(mergeMessageListRenderers({ renderMessageExtras: propExtras }) ?? {}),
        };
        expect(merged.renderMessageExtras?.(sampleMessage)).toBe('prop-extras');
        expect(contextExtras).not.toHaveBeenCalled();
    });
    it('does not re-wrap an already normalized content component', () => {
        const normalized = toMessageContentComponent(() => 'normalized');
        const merged = mergeMessageListRenderers({
            renderMessageContent: normalized,
        });
        expect(merged?.renderMessageContent).toBe(normalized);
    });
});
