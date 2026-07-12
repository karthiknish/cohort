'use client';

import type { ComponentProps } from 'react';
import { dynamic } from '@/shared/ui/dynamic';

/** Local Theme constants so consumers don't pull emoji-picker-react into the entry. */
export const Theme = {
  LIGHT: 'light',
  DARK: 'dark',
  AUTO: 'auto',
} as const;

export type { EmojiClickData } from 'emoji-picker-react';

type LibraryEmojiPickerProps = ComponentProps<typeof import('emoji-picker-react').default>;
type EmojiPickerProps = Omit<LibraryEmojiPickerProps, 'theme'> & {
  theme?: (typeof Theme)[keyof typeof Theme] | LibraryEmojiPickerProps['theme'];
};

const LazyEmojiPicker = dynamic(
  () => import('emoji-picker-react').then((m) => m.default),
  { ssr: false, loading: () => <div className="flex h-[400px] w-[320px] items-center justify-center text-sm text-muted-foreground">Loading emojis…</div> },
);

export default function EmojiPicker({ theme, ...props }: EmojiPickerProps) {
  return <LazyEmojiPicker {...props} theme={theme as LibraryEmojiPickerProps['theme']} />;
}
