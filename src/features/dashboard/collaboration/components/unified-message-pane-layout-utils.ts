import { createElement } from 'react';
import { NoSearchResultsState } from './message-pane-parts';
export function resolveUnifiedMessagePaneEmptyState(isMessageSearchActive: boolean, emptyState?: React.ReactNode) {
    return isMessageSearchActive ? createElement(NoSearchResultsState) : emptyState;
}
type UnifiedMessagePaneDeleteConfirmProps = {
    confirmingDeleteMessageId: string | null;
    activeDeletingMessageId: string | null;
    onOpenChange: (open: boolean) => void;
    onConfirm: () => void;
    onCancel: () => void;
};
