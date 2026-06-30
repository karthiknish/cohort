'use client';
import { Suspense } from 'react';
import { PageMotionShell } from '@/shared/components/page-motion-shell';
import { NOTIFICATIONS_PAGE_FALLBACK } from './notifications-page-fallback';
import { NotificationsPageContent } from './notifications-page-sections';
export default function NotificationsPage() {
    return (<PageMotionShell reveal={false}>
      <Suspense fallback={NOTIFICATIONS_PAGE_FALLBACK}>
        <NotificationsPageContent />
      </Suspense>
    </PageMotionShell>);
}
