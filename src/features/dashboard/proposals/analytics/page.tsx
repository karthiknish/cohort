'use client'

import { PageMotionShell } from '@/shared/components/page-motion-shell'

import { ProposalAnalyticsCard } from '../components/proposal-analytics-card'

export default function ProposalAnalyticsPage() {
  return (
    <PageMotionShell reveal={false}>
      <div className="container mx-auto max-w-6xl py-6 px-4 sm:px-6 lg:px-8">
        <ProposalAnalyticsCard />
      </div>
    </PageMotionShell>
  )
}
