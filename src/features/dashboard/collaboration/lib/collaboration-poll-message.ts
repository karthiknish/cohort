import type { MessagePoll } from '../components/message-polls';
const POLL_FENCE = '```cohort-poll';
export function encodePollMessage(poll: Omit<MessagePoll, 'id' | 'createdAt'> & {
    id?: string;
    createdAt?: string;
}): string {
    const payload = {
        ...poll,
        id: poll.id ?? crypto.randomUUID(),
        createdAt: poll.createdAt ?? new Date().toISOString(),
    };
    return `${POLL_FENCE}\n${JSON.stringify(payload)}\n\`\`\``;
}
export function parsePollMessage(content: string | null | undefined): MessagePoll | null {
    if (!content || !content.includes(POLL_FENCE)) {
        return null;
    }
    const match = content.match(/```cohort-poll\s*([\s\S]*?)```/i);
    if (!match?.[1]) {
        return null;
    }
    try {
        const parsed = JSON.parse(match[1].trim()) as MessagePoll;
        if (!parsed?.question || !Array.isArray(parsed.options) || parsed.options.length < 2) {
            return null;
        }
        return parsed;
    }
    catch {
        return null;
    }
}
