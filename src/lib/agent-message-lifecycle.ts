export type AgentPendingConfirmation = {
    confirmationId: string;
    operation: string;
    params: Record<string, unknown>;
    agentMessageId?: string;
};
export type AgentMessageMetadata = {
    action?: 'navigate' | 'execute' | 'clarify' | 'response';
    operation?: string;
    success?: boolean;
    data?: Record<string, unknown>;
    requiresConfirmation?: boolean;
    confirmation?: AgentSendResponse['confirmation'];
    pendingConfirmation?: AgentPendingConfirmation;
    usedContext?: {
        attachmentNames?: string[];
    };
    undoHint?: {
        type: 'task' | 'project' | 'message';
        resourceId: string;
        label: string;
    };
};
export type AgentMessageLifecycle = 'queued' | 'sending' | 'sent' | 'failed' | 'executing' | 'completed';
export type AgentExecutionStepStatus = 'pending' | 'active' | 'completed' | 'failed';
export type AgentExecutionStep = {
    id: string;
    label: string;
    status: AgentExecutionStepStatus;
    detail?: string;
};
export type AgentSendResponse = {
    conversationId?: string;
    userMessageId?: string;
    agentMessageId?: string;
    action?: string;
    route?: string | null;
    message?: string;
    operation?: string | null;
    executeResult?: {
        success: boolean;
        data?: Record<string, unknown>;
        route?: string;
        retryable?: boolean;
        userMessage?: string;
    } | null;
    steps?: AgentExecutionStep[];
    requiresConfirmation?: boolean;
    confirmation?: {
        operation: string;
        summary: string;
        fields?: Record<string, unknown>;
        affectedRecords?: string[];
        confidence?: 'low' | 'medium' | 'high';
        missingFields?: string[];
    };
    pendingExecution?: AgentPendingConfirmation;
};
const OPERATION_LABELS: Record<string, string> = {
    createTask: 'Creating task',
    updateTask: 'Updating task',
    createProject: 'Creating project',
    updateProject: 'Updating project',
    createClient: 'Creating client',
    updateClient: 'Updating client',
    sendDirectMessage: 'Sending message',
    createProposalDraft: 'Drafting proposal',
    updateProposalDraft: 'Updating proposal',
    generateProposalFromDraft: 'Generating proposal',
    summarizeAdsPerformance: 'Checking ads performance',
    exportSpreadsheet: 'Building Excel export',
    generatePerformanceReport: 'Building report',
    advanceProposalConversation: 'Gathering proposal details',
};
export function operationProcessingLabel(operation?: string | null): string {
    if (!operation)
        return 'Preparing response…';
    return OPERATION_LABELS[operation] ?? `Running ${operation}…`;
}
export function buildProcessingSteps(operation?: string | null): AgentExecutionStep[] {
    const actionLabel = operation ? operationProcessingLabel(operation) : 'Running action…';
    return [
        { id: 'parse', label: 'Parsed request', status: 'active' },
        { id: 'context', label: 'Resolved context', status: 'pending' },
        { id: 'action', label: actionLabel.replace(/…$/, ''), status: 'pending' },
        { id: 'done', label: 'Done', status: 'pending' },
    ];
}
export function buildCompletedStepsFromResponse(response: AgentSendResponse): AgentExecutionStep[] {
    const action = response.action ?? 'response';
    const operation = response.operation ?? null;
    const executeFailed = response.executeResult?.success === false;
    const actionLabel = action === 'navigate'
        ? 'Navigation'
        : action === 'execute'
            ? operationProcessingLabel(operation).replace(/…$/, '')
            : action === 'clarify'
                ? 'Clarification'
                : 'Response';
    return [
        { id: 'parse', label: 'Parsed request', status: 'completed' },
        { id: 'context', label: 'Resolved context', status: 'completed' },
        {
            id: 'action',
            label: actionLabel,
            status: executeFailed ? 'failed' : 'completed',
            detail: executeFailed ? response.executeResult?.userMessage : undefined,
        },
        {
            id: 'done',
            label: executeFailed ? 'Needs attention' : 'Done',
            status: executeFailed ? 'failed' : 'completed',
        },
    ];
}
export function deriveAgentStatusFromResponse(response: AgentSendResponse): {
    status: 'success' | 'error' | 'info' | 'warning';
    metadata: AgentMessageMetadata;
} {
    const metadata: AgentMessageMetadata = {
        action: response.action as AgentMessageMetadata['action'],
        operation: response.operation ?? undefined,
        requiresConfirmation: response.requiresConfirmation,
        confirmation: response.confirmation,
        pendingConfirmation: response.pendingExecution
            ? {
                ...response.pendingExecution,
                agentMessageId: response.agentMessageId,
            }
            : undefined,
    };
    if (response.requiresConfirmation) {
        metadata.success = false;
        return { status: 'warning', metadata };
    }
    const undoHintRaw = response.executeResult?.data?.undoHint;
    if (undoHintRaw && typeof undoHintRaw === 'object' && !Array.isArray(undoHintRaw)) {
        const hint = undoHintRaw as Record<string, unknown>;
        const resourceId = typeof hint.resourceId === 'string' ? hint.resourceId : null;
        const type = hint.type;
        if (resourceId &&
            (type === 'task' || type === 'project' || type === 'message')) {
            metadata.undoHint = {
                type,
                resourceId,
                label: typeof hint.label === 'string' ? hint.label : 'Created',
            };
        }
    }
    if (response.action === 'navigate' && response.route) {
        metadata.success = true;
        return { status: 'success', metadata };
    }
    if (response.action === 'execute' && response.executeResult) {
        const success = response.executeResult.success;
        const exec = response.executeResult;
        const mergedData: Record<string, unknown> = {
            ...(exec.data && typeof exec.data === 'object' && !Array.isArray(exec.data) ? exec.data : {}),
        };
        if (typeof exec.retryable === 'boolean')
            mergedData.retryable = exec.retryable;
        if (typeof exec.userMessage === 'string' && exec.userMessage.trim()) {
            mergedData.userMessage = exec.userMessage;
        }
        metadata.success = success;
        metadata.data = Object.keys(mergedData).length > 0 ? mergedData : undefined;
        return { status: success ? 'success' : 'error', metadata };
    }
    metadata.success = true;
    return { status: 'info', metadata };
}
export const WRITE_OPERATIONS = new Set([
    'createTask',
    'updateTask',
    'createProject',
    'updateProject',
    'createClient',
    'updateClient',
    'sendDirectMessage',
    'createProposalDraft',
    'updateProposalDraft',
    'generateProposalFromDraft',
    'advanceProposalConversation',
]);
export function isDestructiveOperation(operation?: string | null): boolean {
    if (!operation)
        return false;
    return operation.toLowerCase().includes('delete') || operation.toLowerCase().includes('remove');
}
export function operationRiskLevel(operation?: string | null, action?: string | null): 'read' | 'navigate' | 'write' | 'destructive' {
    if (action === 'navigate')
        return 'navigate';
    if (!operation)
        return 'read';
    if (isDestructiveOperation(operation))
        return 'destructive';
    if (WRITE_OPERATIONS.has(operation))
        return 'write';
    return 'read';
}
export type AgentMessageUpsert = {
    id: string;
    clientId: string;
    lifecycle?: AgentMessageLifecycle;
};
/** Upsert by clientId — retries update the same bubble instead of appending. */
export function upsertAgentMessage<T extends AgentMessageUpsert>(messages: T[], message: T): T[] {
    const index = messages.findIndex((entry) => entry.clientId === message.clientId);
    if (index === -1) {
        return [...messages, message];
    }
    const next = [...messages];
    const existing = next[index];
    next[index] = {
        ...existing,
        ...message,
        id: message.id || existing?.id || message.clientId,
    };
    return next;
}
/** Exclude in-flight / failed optimistic turns from server context payloads. */
export function filterMessagesForAgentContext<T extends {
    lifecycle?: AgentMessageLifecycle;
}>(messages: T[], limit: number): T[] {
    return messages
        .filter((entry) => entry.lifecycle !== 'failed' && entry.lifecycle !== 'sending')
        .slice(-limit);
}
/** Count user rows per clientId — used to guard against duplicate optimistic bubbles. */
export function parsePendingConfirmationFromStored(executeResult: Record<string, unknown> | null | undefined, params: Record<string, unknown> | null | undefined, agentMessageId?: string): AgentPendingConfirmation | null {
    const data = executeResult && typeof executeResult.data === 'object' && !Array.isArray(executeResult.data)
        ? (executeResult.data as Record<string, unknown>)
        : executeResult;
    const pending = data && typeof data.pendingConfirmation === 'object' && !Array.isArray(data.pendingConfirmation)
        ? (data.pendingConfirmation as Record<string, unknown>)
        : null;
    if (pending) {
        const operation = typeof pending.operation === 'string' ? pending.operation : null;
        const confirmationId = typeof pending.confirmationId === 'string' ? pending.confirmationId : null;
        if (operation && confirmationId) {
            let parsedParams: Record<string, unknown> = params ?? {};
            if (typeof pending.paramsJson === 'string') {
                try {
                    parsedParams = JSON.parse(pending.paramsJson) as Record<string, unknown>;
                }
                catch {
                    parsedParams = params ?? {};
                }
            }
            return {
                confirmationId,
                operation,
                params: parsedParams,
                agentMessageId,
            };
        }
    }
    if (params?._pendingConfirmation === true) {
        const operation = typeof params._operation === 'string'
            ? params._operation
            : typeof params.operation === 'string'
                ? params.operation
                : null;
        if (operation) {
            const cleanParams = Object.fromEntries(Object.entries(params).filter(([key]) => !key.startsWith('_')));
            return {
                confirmationId: typeof params._confirmationId === 'string' ? params._confirmationId : (agentMessageId ?? operation),
                operation,
                params: cleanParams,
                agentMessageId,
            };
        }
    }
    return null;
}
export function countUserMessagesByClientId(messages: Array<{
    type: string;
    clientId: string;
}>): Map<string, number> {
    const counts = new Map<string, number>();
    for (const entry of messages) {
        if (entry.type !== 'user')
            continue;
        counts.set(entry.clientId, (counts.get(entry.clientId) ?? 0) + 1);
    }
    return counts;
}
