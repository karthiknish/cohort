export const AGENT_MAX_MESSAGE_LENGTH = 4000;
const MIN_MESSAGE_LENGTH = 1;
export const PREVIEW_AGENT_CONVERSATION_ID = 'preview-agent-conversation';
export type StoredAgentMessage = {
    id: string;
    type: string;
    content: string;
    timestamp: string;
    route: string | null;
    action: string | null;
    operation: string | null;
    params: Record<string, unknown> | null;
    executeResult: Record<string, unknown> | null;
};
export function asRecord(value: unknown): Record<string, unknown> | null {
    return value && typeof value === 'object' && !Array.isArray(value)
        ? (value as Record<string, unknown>)
        : null;
}
export function parseStoredExecuteResultData(executeResult: Record<string, unknown> | null): Record<string, unknown> | undefined {
    if (!executeResult)
        return undefined;
    let data: Record<string, unknown> = {};
    const directData = asRecord(executeResult.data);
    if (directData) {
        data = { ...directData };
    }
    else {
        const dataJson = typeof executeResult.dataJson === 'string' ? executeResult.dataJson : null;
        if (dataJson) {
            try {
                const parsed = asRecord(JSON.parse(dataJson));
                if (parsed)
                    data = { ...parsed };
            }
            catch {
                // ignore malformed JSON
            }
        }
    }
    if (typeof executeResult.retryable === 'boolean') {
        data = { ...data, retryable: executeResult.retryable };
    }
    if (typeof executeResult.userMessage === 'string' && executeResult.userMessage.trim().length > 0) {
        data = { ...data, userMessage: executeResult.userMessage };
    }
    return Object.keys(data).length > 0 ? data : undefined;
}
export function generateId(): string {
    return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}
/**
 * Validate user input before sending
 */
export function validateInput(text: string): string | null {
    const trimmed = text.trim();
    if (trimmed.length < MIN_MESSAGE_LENGTH) {
        return 'Message is too short';
    }
    if (trimmed.length > AGENT_MAX_MESSAGE_LENGTH) {
        return `Message too long (max ${AGENT_MAX_MESSAGE_LENGTH} characters)`;
    }
    return null;
}
