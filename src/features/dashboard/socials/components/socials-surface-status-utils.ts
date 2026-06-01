import { AlertCircle, CheckCircle2, CircleDashed, Instagram, LoaderCircle, PlugZap, type LucideIcon } from 'lucide-react';
import { getBadgeClasses } from '@/lib/dashboard-theme';
import type { SocialsSurfaceStatus } from './socials-state';
export type SurfaceTabBadge = {
    label: string;
    className: string;
    icon: typeof CheckCircle2;
};
export function getSurfaceTabBadge(status: SocialsSurfaceStatus): SurfaceTabBadge {
    switch (status) {
        case 'ready':
            return { label: 'Live', className: getBadgeClasses('success'), icon: CheckCircle2 };
        case 'loading':
            return { label: 'Loading', className: getBadgeClasses('primary'), icon: LoaderCircle };
        case 'source_required':
            return { label: 'Setup', className: getBadgeClasses('warning'), icon: CircleDashed };
        case 'empty':
            return { label: 'No IG link', className: getBadgeClasses('secondary'), icon: Instagram };
        case 'error':
            return { label: 'Error', className: getBadgeClasses('destructive'), icon: AlertCircle };
        case 'disconnected':
            return { label: 'Offline', className: getBadgeClasses('secondary'), icon: PlugZap };
        default:
            return { label: 'Pending', className: getBadgeClasses('secondary'), icon: CircleDashed };
    }
}
