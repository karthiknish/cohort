import { describe, it, expect } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import { MessageContent } from './message-content';

const markdown = `Here's a list:

- First item
- Second item
  - Nested
- Third item

1. Ordered one
2. Ordered two

A paragraph after.`;

describe('MessageContent', () => {
    it('renders unordered and ordered lists with marker classes', () => {
        const markup = renderToStaticMarkup(<MessageContent content={markdown} />);
        expect(markup).toContain('list-disc');
        expect(markup).toContain('list-decimal');
        expect(markup).toContain('list-outside');
        expect(markup).toContain('First item');
        expect(markup).toContain('Ordered one');
        expect(markup).toContain('Nested');
    });

    it('inherits text color via text-current so lists match bubble color in DM and channel messages', () => {
        const markup = renderToStaticMarkup(<MessageContent content={markdown} />);
        expect(markup).not.toContain('text-foreground');
        expect(markup).toContain('text-current');
    });
});
