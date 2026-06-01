'use client';
import { use } from 'react';
import type { CollaborationMessage } from '@/types/collaboration';
import { SEARCH_THREAD_REPLY_DISPLAY } from '../message-pane-display-state';
import { CollaborationMessageItem } from './message-item-bundle';
import { SearchThreadReplyContext } from './search-thread-reply-context';
export function SearchThreadReplyRenderer({ reply }: {
    reply: CollaborationMessage;
}) {
    const context = use(SearchThreadReplyContext);
    if (!context) {
        throw new Error('SearchThreadReplyRenderer requires SearchThreadReplyContext');
    }
    return (<CollaborationMessageItem {...context} message={reply} display={SEARCH_THREAD_REPLY_DISPLAY}/>);
}
