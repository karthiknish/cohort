import type { Ref } from 'react';
export interface MentionableUser {
    id: string;
    name: string;
    email?: string;
    role?: string;
    avatar?: string;
}
export interface MentionInputProps {
    value: string;
    onChange: (value: string, mentions: MentionableUser[]) => void;
    users: MentionableUser[];
    placeholder?: string;
    disabled?: boolean;
    className?: string;
    inputClassName?: string;
    label?: string;
    maxMentions?: number;
    allowMultiple?: boolean;
    singleSelect?: boolean;
}
export interface MentionState {
    active: boolean;
    startIndex: number;
    query: string;
}
export type MentionInputComponentProps = MentionInputProps & {
    ref?: Ref<HTMLInputElement>;
};
