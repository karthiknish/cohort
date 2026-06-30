import type { CollaborationMessage } from '@/types/collaboration';
export const MESSAGE_PANE_MAX_PREVIEW_LENGTH = 80;
export type MessagePaneState = {
    editingMessageId: string | null;
    editingValue: string;
    replyingToMessage: CollaborationMessage | null;
    expandedThreadIds: Record<string, boolean>;
    confirmingDeleteMessageId: string | null;
    taskCreationModalOpen: boolean;
    selectedMessageForTask: CollaborationMessage | null;
};
export type MessagePaneAction = {
    type: 'start-edit';
    message: CollaborationMessage;
} | {
    type: 'set-editing-value';
    value: string;
} | {
    type: 'clear-edit';
} | {
    type: 'set-reply-target';
    message: CollaborationMessage | null;
} | {
    type: 'toggle-thread';
    threadRootId: string;
} | {
    type: 'reset-threads';
} | {
    type: 'open-delete-confirmation';
    messageId: string;
} | {
    type: 'close-delete-confirmation';
} | {
    type: 'open-task-modal';
    message: CollaborationMessage;
} | {
    type: 'close-task-modal';
};
export const INITIAL_MESSAGE_PANE_STATE: MessagePaneState = {
    editingMessageId: null,
    editingValue: '',
    replyingToMessage: null,
    expandedThreadIds: {},
    confirmingDeleteMessageId: null,
    taskCreationModalOpen: false,
    selectedMessageForTask: null,
};
function toggleExpandedThreadIds(expandedThreadIds: Record<string, boolean>, threadRootId: string) {
    const next = { ...expandedThreadIds };
    if (next[threadRootId]) {
        delete next[threadRootId];
        return next;
    }
    next[threadRootId] = true;
    return next;
}
export function messagePaneReducer(state: MessagePaneState, action: MessagePaneAction): MessagePaneState {
    switch (action.type) {
        case 'start-edit':
            return {
                ...state,
                editingMessageId: action.message.id,
                editingValue: action.message.content ?? '',
            };
        case 'set-editing-value':
            return {
                ...state,
                editingValue: action.value,
            };
        case 'clear-edit':
            return {
                ...state,
                editingMessageId: null,
                editingValue: '',
            };
        case 'set-reply-target':
            return {
                ...state,
                replyingToMessage: action.message,
            };
        case 'toggle-thread':
            return {
                ...state,
                expandedThreadIds: toggleExpandedThreadIds(state.expandedThreadIds, action.threadRootId),
            };
        case 'reset-threads':
            return {
                ...state,
                expandedThreadIds: {},
            };
        case 'open-delete-confirmation':
            return {
                ...state,
                confirmingDeleteMessageId: action.messageId,
                editingMessageId: state.editingMessageId === action.messageId ? null : state.editingMessageId,
                editingValue: state.editingMessageId === action.messageId ? '' : state.editingValue,
            };
        case 'close-delete-confirmation':
            return {
                ...state,
                confirmingDeleteMessageId: null,
            };
        case 'open-task-modal':
            return {
                ...state,
                taskCreationModalOpen: true,
                selectedMessageForTask: action.message,
            };
        case 'close-task-modal':
            return {
                ...state,
                taskCreationModalOpen: false,
                selectedMessageForTask: null,
            };
        default: {
            const _exhaustive: never = action;
            return _exhaustive;
        }
    }
}
