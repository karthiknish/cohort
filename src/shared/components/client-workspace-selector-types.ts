import type { ClientTeamMember } from '@/types/clients';
export type ClientWorkspaceSelectorProps = {
    className?: string;
};
export type ClientWorkspaceFormState = {
    isSheetOpen: boolean;
    newClientName: string;
    accountManagerInput: string;
    teamInput: string;
    saving: boolean;
    removingId: string | null;
    errorMessage: string | null;
};
export type ClientWorkspaceFormAction = {
    type: 'setSheetOpen';
    value: boolean;
} | {
    type: 'resetForm';
} | {
    type: 'setNewClientName';
    value: string;
} | {
    type: 'setAccountManagerInput';
    value: string;
} | {
    type: 'setTeamInput';
    value: string;
} | {
    type: 'setSaving';
    value: boolean;
} | {
    type: 'setRemovingId';
    value: string | null;
} | {
    type: 'setErrorMessage';
    value: string | null;
};
export function createInitialWorkspaceFormState(): ClientWorkspaceFormState {
    return {
        isSheetOpen: false,
        newClientName: '',
        accountManagerInput: '',
        teamInput: '',
        saving: false,
        removingId: null,
        errorMessage: null,
    };
}
export function clientWorkspaceFormReducer(state: ClientWorkspaceFormState, action: ClientWorkspaceFormAction): ClientWorkspaceFormState {
    switch (action.type) {
        case 'setSheetOpen':
            return action.value ? { ...state, isSheetOpen: true } : { ...createInitialWorkspaceFormState() };
        case 'resetForm':
            return { ...createInitialWorkspaceFormState(), isSheetOpen: state.isSheetOpen };
        case 'setNewClientName':
            return { ...state, newClientName: action.value };
        case 'setAccountManagerInput':
            return { ...state, accountManagerInput: action.value };
        case 'setTeamInput':
            return { ...state, teamInput: action.value };
        case 'setSaving':
            return { ...state, saving: action.value };
        case 'setRemovingId':
            return { ...state, removingId: action.value };
        case 'setErrorMessage':
            return { ...state, errorMessage: action.value };
        default:
            return state;
    }
}
export function normalizeMentionInputValue(input: string): string {
    return input.replace(/@\[(.*?)\]/g, '$1').trim();
}
export function parseSinglePerson(input: string): string {
    return normalizeMentionInputValue(input)
        .split(',')
        .map((value) => value.trim())
        .find((value) => value.length > 0) ?? '';
}
export function parseTeamMembers(input: string): ClientTeamMember[] {
    return normalizeMentionInputValue(input)
        .split(',')
        .flatMap((member) => {
        const entry = member.trim();
        if (!entry)
            return [];
        const parts = entry.split(':');
        const name = parts[0]?.trim() ?? '';
        if (!name.length)
            return [];
        const role = parts[1];
        return [{
                name,
                role: role ? role.trim() : 'Contributor',
            }];
    });
}
