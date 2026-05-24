'use client'

import { useConvexAuth, useQuery } from 'convex/react'

import { useAuth } from '@/shared/contexts/auth-context'
import { useClientContext } from '@/shared/contexts/client-context'
import { usePreview } from '@/shared/contexts/preview-context'
import { notificationsApi, tasksApi } from '@/lib/convex-api'
import { PageSkeletonBoundary } from '@/shared/ui/page-skeleton-boundary'
import { getWorkspaceId } from '@/lib/utils'

import { ForYouClients } from './components/for-you-clients'
import { ForYouGreeting } from './components/for-you-greeting'
import { ForYouPageSkeleton } from './components/for-you-page-skeleton'
import { ForYouQuickLinks } from './components/for-you-quick-links'
import { ForYouWhatsNext } from './components/for-you-whats-next'
import { PageMotionShell } from '@/shared/components/page-motion-shell'

const forYouLoadingContent = <ForYouPageSkeleton />

export default function ForYouPage() {
  const { user } = useAuth()
  const { isAuthenticated: isConvexAuthenticated, isLoading: isConvexLoading } = useConvexAuth()
  const { isPreviewMode } = usePreview()
  const { loading: clientsLoading } = useClientContext()
  const workspaceId = getWorkspaceId(user)
  const canQueryConvex = isConvexAuthenticated && !isConvexLoading && !!user?.id && !!workspaceId

  const rawTasks = useQuery(
    tasksApi.listForUser,
    canQueryConvex ? { workspaceId: workspaceId ?? '', userId: user?.id ?? '' } : 'skip',
  )

  const liveNotifications = useQuery(
    notificationsApi.list,
    canQueryConvex && !isPreviewMode
      ? { workspaceId: workspaceId ?? '', pageSize: 15, role: user?.role ?? undefined }
      : 'skip',
  )

  const isInitialLoading =
    !isPreviewMode &&
    (isConvexLoading ||
      (!!user?.id && !canQueryConvex) ||
      (canQueryConvex &&
        (clientsLoading || rawTasks === undefined || liveNotifications === undefined)))

  return (
    <PageSkeletonBoundary
      loading={isInitialLoading}
      loadingContent={forYouLoadingContent}
    >
      <PageMotionShell reveal={false} className="w-full">
        <main id="for-you-page" className="w-full">
          <ForYouGreeting />
          <ForYouClients />
          <ForYouQuickLinks />
          <ForYouWhatsNext />
        </main>
      </PageMotionShell>
    </PageSkeletonBoundary>
  )
}
