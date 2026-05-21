'use client'

import { useConvexAuth } from 'convex/react'

import { useAuth } from '@/shared/contexts/auth-context'
import { usePreview } from '@/shared/contexts/preview-context'
import { BoneyardSkeletonBoundary } from '@/shared/ui/boneyard-skeleton-boundary'
import { getWorkspaceId } from '@/lib/utils'

import { ForYouClients } from './components/for-you-clients'
import { ForYouGreeting } from './components/for-you-greeting'
import { ForYouQuickLinks } from './components/for-you-quick-links'
import { ForYouWhatsNext } from './components/for-you-whats-next'
import { PageMotionShell } from '@/shared/components/page-motion-shell'

export default function ForYouPage() {
  const { user } = useAuth()
  const { isAuthenticated: isConvexAuthenticated, isLoading: isConvexLoading } = useConvexAuth()
  const { isPreviewMode } = usePreview()
  const workspaceId = getWorkspaceId(user)
  const canQueryConvex = isConvexAuthenticated && !isConvexLoading && !!user?.id && !!workspaceId
  const isInitialLoading = !isPreviewMode && !canQueryConvex
  return (
    <BoneyardSkeletonBoundary
      name="for-you-page"
      loading={isInitialLoading}
    >
      <PageMotionShell reveal={false} className="w-full">
        <main id="for-you-page" className="w-full">
          <ForYouGreeting />
          <ForYouClients />
          <ForYouQuickLinks />
          <ForYouWhatsNext />
        </main>
      </PageMotionShell>
    </BoneyardSkeletonBoundary>
  )
}
