export type TeamMemberField = {
    key: string;
    name: string;
    role: string;
};
export type ClientRecord = {
    id: string;
    workspaceId?: string | null;
    name: string;
    accountManager: string;
    teamMembers: {
        name: string;
        role: string;
    }[];
};
