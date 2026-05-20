'use client'

import { CollaborationDashboard } from '@/features/dashboard/collaboration/components/collaboration-dashboard'
import { PageMotionShell } from '@/shared/components/page-motion-shell'

export default function CollaborationPage() {
  return (
    <PageMotionShell reveal={false}>
      <CollaborationDashboard />
    </PageMotionShell>
  )
}
