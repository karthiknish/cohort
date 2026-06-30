'use client';
import { RevealTransition, RevealTransitionFallback } from '@/shared/ui/page-transition';
import { NotificationsPageFallback } from './notifications-page-sections';
export const NOTIFICATIONS_PAGE_FALLBACK = (<RevealTransitionFallback>
    <NotificationsPageFallback />
  </RevealTransitionFallback>);
