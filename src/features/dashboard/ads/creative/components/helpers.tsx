import type { ReactNode } from 'react';
import { Image as ImageIcon, Video, FileText, GalleryHorizontal, Layers, Link2, ShoppingBag } from 'lucide-react';
import { formatMetaCallToActionLabel, normalizeMetaCallToActionType, } from '@/services/integrations/meta-ads/meta-call-to-action';
export function unwrapApiData(payload: unknown): unknown {
    const record = payload && typeof payload === 'object' ? (payload as Record<string, unknown>) : null;
    return record && 'data' in record ? record.data : payload;
}
export function getStatusVariant(status: string): 'default' | 'secondary' | 'outline' | 'destructive' {
    const s = status.toLowerCase();
    if (s === 'enabled' || s === 'enable' || s === 'active')
        return 'default';
    if (s === 'paused' || s === 'disable')
        return 'secondary';
    if (s === 'deleted' || s === 'removed')
        return 'destructive';
    return 'outline';
}
export function getTypeIcon(type: string): ReactNode {
    const t = type.toLowerCase();
    if (t.includes('lead'))
        return <span className="text-[10px] font-bold tracking-tight">LG</span>;
    if (t.includes('carousel'))
        return <GalleryHorizontal className="size-5"/>;
    if (t.includes('dynamic_product'))
        return <ShoppingBag className="size-5"/>;
    if (t.includes('dynamic_creative'))
        return <Layers className="size-5"/>;
    if (t.includes('boosted') || t.includes('page_post'))
        return <Link2 className="size-5"/>;
    if (t.includes('video'))
        return <Video className="size-5"/>;
    if (t.includes('image') || t.includes('display'))
        return <ImageIcon className="size-5"/>;
    return <FileText className="size-5"/>;
}
export function isDirectVideoUrl(url: string | undefined): boolean {
    if (!url)
        return false;
    try {
        const parsed = new URL(url);
        const pathname = parsed.pathname.toLowerCase();
        return pathname.endsWith('.mp4') || pathname.endsWith('.webm') || pathname.endsWith('.mov');
    }
    catch {
        const lower = url.toLowerCase();
        return lower.endsWith('.mp4') || lower.endsWith('.webm') || lower.endsWith('.mov');
    }
}
/** Human-readable CTA for previews; accepts Meta enum or legacy stored strings. */
export function formatCTALabel(cta: string | undefined): string {
    if (!cta)
        return '';
    const label = formatMetaCallToActionLabel(cta);
    if (label)
        return label;
    const normalized = normalizeMetaCallToActionType(cta);
    if (normalized) {
        return formatMetaCallToActionLabel(normalized) ?? normalized;
    }
    return cta
        .split('_')
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
        .join(' ');
}
/** Canonical Meta CTA enum for selects and API payloads. */
export function normalizeCreativeCtaValue(cta: string | undefined | null): string {
    return normalizeMetaCallToActionType(cta) ?? (typeof cta === 'string' ? cta.trim() : '');
}
