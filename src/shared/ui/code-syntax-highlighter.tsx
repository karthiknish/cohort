'use client';

import { dynamic } from '@/shared/ui/dynamic';
import type { CodeSyntaxHighlighterProps } from '@/shared/ui/code-syntax-highlighter-impl';

export type { CodeSyntaxHighlighterProps };

export const CodeSyntaxHighlighter = dynamic(
  () =>
    import('@/shared/ui/code-syntax-highlighter-impl').then((m) => m.CodeSyntaxHighlighterImpl),
  {
    ssr: false,
    loading: () => (
      <pre className="m-0 overflow-auto p-4 font-mono text-[13px] leading-normal text-muted-foreground">
        Loading…
      </pre>
    ),
  },
);
