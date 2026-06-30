export type AgentExportMessage = {
    id: string;
    type: 'user' | 'agent';
    content: string;
    timestamp: string;
    route?: string | null;
    operation?: string | null;
};
export type AgentExportConversation = {
    id: string;
    title: string | null;
    startedAt: string | null;
    lastMessageAt: string | null;
    messages: AgentExportMessage[];
};
export function formatAgentConversationMarkdown(conversation: AgentExportConversation): string {
    const title = conversation.title?.trim() || 'Agent chat';
    const lines: string[] = [`# ${title}`, ''];
    if (conversation.startedAt) {
        lines.push(`Started: ${conversation.startedAt}`);
    }
    if (conversation.lastMessageAt) {
        lines.push(`Last message: ${conversation.lastMessageAt}`);
    }
    lines.push('');
    for (const message of conversation.messages) {
        const speaker = message.type === 'user' ? 'You' : 'Agent';
        lines.push(`## ${speaker} · ${message.timestamp}`);
        lines.push('');
        lines.push(message.content.trim());
        if (message.route) {
            lines.push('');
            lines.push(`Route: ${message.route}`);
        }
        lines.push('');
    }
    return lines.join('\n').trim();
}
export function formatAgentConversationJson(conversation: AgentExportConversation): string {
    return JSON.stringify(conversation, null, 2);
}
export function buildAgentConversationShareLink(conversationId: string): string {
    if (typeof window === 'undefined') {
        return `/dashboard?agentConversation=${encodeURIComponent(conversationId)}`;
    }
    const url = new URL(window.location.href);
    url.searchParams.set('agentConversation', conversationId);
    return url.toString();
}
