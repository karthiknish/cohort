'use client';
import { useCallback, useEffect, useEffectEvent, useRef } from 'react';
import { usePathname, useRouter } from '@/shared/ui/navigation';
import { useUrlSearchParams } from '@/shared/hooks/use-url-search-params';
import { agentPanelHref, parseAgentPanelUrl, type AgentPanelUrlView, } from '@/lib/agent-panel-url';
type UseAgentPanelUrlOptions = {
    isOpen: boolean;
    setOpen: (open: boolean) => void;
    showHistory: boolean;
    setShowHistory: (show: boolean) => void;
    conversationId: string | null;
    onLoadConversation?: (conversationId: string) => void;
};
export function useAgentPanelUrl({ isOpen, setOpen, showHistory, setShowHistory, conversationId, onLoadConversation, }: UseAgentPanelUrlOptions) {
    const pathname = usePathname();
    const router = useRouter();
    const searchParams = useUrlSearchParams();
    const hydratedFromUrlRef = useRef(false);
    const lastPushedRef = useRef<string | null>(null);
    const replaceUrl = useCallback((patch: {
        open?: boolean;
        view?: AgentPanelUrlView;
        conversationId?: string | null;
    }) => {
        const href = agentPanelHref(pathname, searchParams, {
            open: patch.open ?? isOpen,
            view: patch.view ?? (showHistory ? 'history' : 'chat'),
            conversationId: patch.conversationId !== undefined ? patch.conversationId : conversationId,
        });
        if (lastPushedRef.current === href)
            return;
        lastPushedRef.current = href;
        router.replace(href, { scroll: false });
    }, [conversationId, isOpen, pathname, router, searchParams, showHistory]);
    const hydrateFromUrl = useEffectEvent(() => {
        const parsed = parseAgentPanelUrl(searchParams);
        if (parsed.open) {
            setOpen(true);
        }
        if (parsed.view === 'history') {
            setShowHistory(true);
        }
        if (parsed.conversationId && onLoadConversation) {
            void onLoadConversation(parsed.conversationId);
        }
        lastPushedRef.current = agentPanelHref(pathname, searchParams, {
            open: parsed.open || isOpen,
            view: parsed.view === 'history' ? 'history' : showHistory ? 'history' : 'chat',
            conversationId: parsed.conversationId ?? conversationId,
        });
    });
    const urlSyncKeyRef = useRef<string | null>(null);
    useEffect(() => {
        if (hydratedFromUrlRef.current) {
            return;
        }
        hydratedFromUrlRef.current = true;
        hydrateFromUrl();
    }, [searchParams]);
    const urlSyncKey = `${isOpen}|${showHistory ? 'history' : 'chat'}|${conversationId ?? ''}`;
    useEffect(() => {
        if (!hydratedFromUrlRef.current || urlSyncKeyRef.current === urlSyncKey) {
            return;
        }
        urlSyncKeyRef.current = urlSyncKey;
        replaceUrl({
            open: isOpen,
            view: showHistory ? 'history' : 'chat',
            conversationId,
        });
    }, [conversationId, isOpen, replaceUrl, showHistory, urlSyncKey]);
    const openHistoryView = () => {
        setShowHistory(true);
        replaceUrl({ open: true, view: 'history' });
    };
    const closeHistoryView = () => {
        setShowHistory(false);
        replaceUrl({ open: isOpen, view: 'chat' });
    };
    return { openHistoryView, closeHistoryView, replaceUrl };
}
