import type { PendingAttachment } from '@/features/dashboard/collaboration/hooks/types';
import { DEFAULT_MEETING_CHAT_MENTION_STATE, type MeetingChatMentionState } from './in-site-meeting-room-chat.utils';
export type InSiteMeetingRoomChatProps = {
    compact?: boolean;
};
export type MeetingChatState = {
    isOpen: boolean;
    draft: string;
    lastReadAt: number;
    highlightedMentionIndex: number;
    mentionState: MeetingChatMentionState;
    pendingAttachments: PendingAttachment[];
    uploadingFiles: boolean;
};
export type MeetingChatAction = {
    type: 'open';
    latestTimestamp: number;
} | {
    type: 'close';
    latestTimestamp: number;
} | {
    type: 'setDraft';
    value: string;
} | {
    type: 'syncMentionState';
    value: MeetingChatMentionState;
} | {
    type: 'resetMentionState';
} | {
    type: 'setHighlightedMentionIndex';
    value: number | ((current: number) => number);
} | {
    type: 'addAttachments';
    attachments: PendingAttachment[];
} | {
    type: 'removeAttachment';
    attachmentId: string;
} | {
    type: 'clearComposer';
} | {
    type: 'setUploadingFiles';
    value: boolean;
};
export function createInitialMeetingChatState(): MeetingChatState {
    return {
        isOpen: false,
        draft: '',
        lastReadAt: 0,
        highlightedMentionIndex: 0,
        mentionState: DEFAULT_MEETING_CHAT_MENTION_STATE,
        pendingAttachments: [],
        uploadingFiles: false,
    };
}
export function meetingChatReducer(state: MeetingChatState, action: MeetingChatAction): MeetingChatState {
    switch (action.type) {
        case 'open':
            return {
                ...state,
                isOpen: true,
                lastReadAt: action.latestTimestamp > 0 ? action.latestTimestamp : state.lastReadAt,
                mentionState: DEFAULT_MEETING_CHAT_MENTION_STATE,
                highlightedMentionIndex: 0,
            };
        case 'close':
            return {
                ...state,
                isOpen: false,
                lastReadAt: action.latestTimestamp > 0 ? action.latestTimestamp : state.lastReadAt,
                mentionState: DEFAULT_MEETING_CHAT_MENTION_STATE,
                highlightedMentionIndex: 0,
            };
        case 'setDraft':
            return { ...state, draft: action.value };
        case 'syncMentionState':
            return { ...state, mentionState: action.value, highlightedMentionIndex: 0 };
        case 'resetMentionState':
            return {
                ...state,
                mentionState: DEFAULT_MEETING_CHAT_MENTION_STATE,
                highlightedMentionIndex: 0,
            };
        case 'setHighlightedMentionIndex':
            return {
                ...state,
                highlightedMentionIndex: typeof action.value === 'function'
                    ? action.value(state.highlightedMentionIndex)
                    : action.value,
            };
        case 'addAttachments':
            return { ...state, pendingAttachments: [...state.pendingAttachments, ...action.attachments] };
        case 'removeAttachment':
            return {
                ...state,
                pendingAttachments: state.pendingAttachments.filter((attachment) => attachment.id !== action.attachmentId),
            };
        case 'clearComposer':
            return {
                ...state,
                draft: '',
                pendingAttachments: [],
                mentionState: DEFAULT_MEETING_CHAT_MENTION_STATE,
                highlightedMentionIndex: 0,
            };
        case 'setUploadingFiles':
            return { ...state, uploadingFiles: action.value };
        default: {
            const _exhaustive: never = action;
            return _exhaustive;
        }
    }
}
