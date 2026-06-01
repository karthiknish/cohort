import { createContext } from 'react';
import type { CollaborationMessageItemProps } from './collaboration-message-item-props';
export type SearchThreadReplyContextValue = Omit<CollaborationMessageItemProps, 'message'>;
export const SearchThreadReplyContext = createContext<SearchThreadReplyContextValue | null>(null);
