// =============================================================================
// CONVERSIONS API (CAPI) — server-side and offline events
// =============================================================================
import type { MetaCapiHashedUserData } from '@/lib/meta-capi-events';
import type { MetaCapiActionSource } from '@/lib/meta-capi-events';
import { appendMetaAuthParams, executeMetaApiRequest, META_API_BASE } from './client';
export type MetaCapiEventInput = {
    eventName: string;
    /** Unix timestamp in seconds. Defaults to now. */
    eventTime?: number;
    eventId?: string;
    actionSource: MetaCapiActionSource;
    eventSourceUrl?: string;
    /** Pre-hashed user_data (set in Convex / server before calling). */
    hashedUserData?: MetaCapiHashedUserData;
    customData?: {
        value?: number;
        currency?: string;
        orderId?: string;
        contentIds?: string[];
        contentType?: string;
    };
};
export type MetaCapiSendResult = {
    success: boolean;
    eventsReceived?: number;
    messages?: string[];
    fbtraceId?: string;
    error?: string;
};
function serializeCapiEvent(event: MetaCapiEventInput): Record<string, unknown> {
    const payload: Record<string, unknown> = {
        event_name: event.eventName,
        event_time: event.eventTime ?? Math.floor(Date.now() / 1000),
        action_source: event.actionSource,
    };
    if (event.eventId)
        payload.event_id = event.eventId;
    if (event.eventSourceUrl)
        payload.event_source_url = event.eventSourceUrl;
    if (event.hashedUserData && Object.keys(event.hashedUserData).length > 0) {
        payload.user_data = event.hashedUserData;
    }
    if (event.customData) {
        const custom: Record<string, unknown> = {};
        if (event.customData.value != null)
            custom.value = event.customData.value;
        if (event.customData.currency)
            custom.currency = event.customData.currency;
        if (event.customData.orderId)
            custom.order_id = event.customData.orderId;
        if (event.customData.contentIds?.length)
            custom.content_ids = event.customData.contentIds;
        if (event.customData.contentType)
            custom.content_type = event.customData.contentType;
        if (Object.keys(custom).length > 0)
            payload.custom_data = custom;
    }
    return payload;
}
export async function sendMetaCapiEvents(options: {
    accessToken: string;
    pixelId: string;
    events: MetaCapiEventInput[];
    testEventCode?: string;
    maxRetries?: number;
}): Promise<MetaCapiSendResult> {
    const { accessToken, pixelId, events, testEventCode, maxRetries = 3 } = options;
    if (events.length === 0) {
        return { success: false, error: 'No events to send' };
    }
    const params = new URLSearchParams();
    await appendMetaAuthParams({ params, accessToken, appSecret: process.env.META_APP_SECRET });
    const body: Record<string, unknown> = {
        data: events.map(serializeCapiEvent),
    };
    if (testEventCode?.trim()) {
        body.test_event_code = testEventCode.trim();
    }
    const url = `${META_API_BASE}/${pixelId}/events?${params.toString()}`;
    try {
        const { payload } = await executeMetaApiRequest<{
            events_received?: number;
            messages?: string[];
            fbtrace_id?: string;
            error?: {
                message?: string;
            };
        }>({
            url,
            accessToken,
            operation: 'sendCapiEvents',
            method: 'POST',
            body: JSON.stringify(body),
            maxRetries,
        });
        if (payload?.error?.message) {
            return { success: false, error: payload.error.message };
        }
        return {
            success: true,
            eventsReceived: payload?.events_received ?? events.length,
            messages: payload?.messages,
            fbtraceId: payload?.fbtrace_id,
        };
    }
    catch (error) {
        const message = error instanceof Error ? error.message : 'CAPI request failed';
        return { success: false, error: message };
    }
}
/** Offline store conversions via CAPI (`action_source: physical_store`). */
export async function sendMetaOfflineEvents(options: Omit<Parameters<typeof sendMetaCapiEvents>[0], 'events'> & {
    events: Array<Omit<MetaCapiEventInput, 'actionSource'> & {
        actionSource?: MetaCapiActionSource;
    }>;
}): Promise<MetaCapiSendResult> {
    const events = options.events.map((event) => ({
        ...event,
        actionSource: event.actionSource ?? 'physical_store',
    }));
    return sendMetaCapiEvents({ ...options, events });
}
