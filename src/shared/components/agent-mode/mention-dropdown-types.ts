import type { KeyboardEvent as ReactKeyboardEvent, Ref } from 'react';
export type MentionType = 'client' | 'project' | 'team' | 'user';
export interface MentionItem {
    id: string;
    name: string;
    type: MentionType;
    subtitle?: string;
}
export type MentionDropdownHandle = {
    handleKeyDown: (event: ReactKeyboardEvent) => boolean;
};
export type MentionDropdownProps = {
    ref?: Ref<MentionDropdownHandle>;
    listboxId?: string;
    isOpen: boolean;
    onClose: () => void;
    onSelect: (item: MentionItem) => void;
    searchQuery: string;
    position?: {
        top: number;
        left: number;
    };
    clients?: Array<{
        id: string;
        name: string;
        company?: string;
    }>;
    projects?: Array<{
        id: string;
        name: string;
        status?: string;
    }>;
    teams?: Array<{
        id: string;
        name: string;
        memberCount?: number;
    }>;
    users?: Array<{
        id: string;
        name: string;
        email?: string;
        role?: string;
    }>;
    isLoading?: boolean;
};
