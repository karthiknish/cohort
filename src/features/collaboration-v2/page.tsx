'use client';

import { CollaborationDashboardV2 } from '@/features/collaboration-v2/components/collaboration-dashboard-v2';
import { PageMotionShell } from '@/shared/components/page-motion-shell';

export default function CollaborationV2Page() {
  return (
    <PageMotionShell reveal={false}>
      <CollaborationDashboardV2 />
    </PageMotionShell>
  );
}
