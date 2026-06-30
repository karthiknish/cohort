import { Outlet, createFileRoute } from '@tanstack/react-router'
import { createServerFn } from '@tanstack/react-start'
import { WorkspaceLayoutInner } from '@/shared/layout/workspace-layout'
import { DashboardError } from '@/shared/ui/route-boundaries/dashboard-error'
import { DashboardLoading } from '@/shared/ui/route-boundaries/dashboard-loading'
import {
  isScreenRecordingAuthBypassEnabled,
  PREVIEW_ROUTE_REQUEST_HEADER,
} from '@/lib/preview-data'

const loadDashboardShell = createServerFn({ method: 'GET' }).handler(async () => {
  const { getRequestHeader } = await import('@tanstack/react-start/server')
  return {
    allowPreviewAccess:
      isScreenRecordingAuthBypassEnabled() ||
      getRequestHeader(PREVIEW_ROUTE_REQUEST_HEADER) === '1',
  }
})

export const Route = createFileRoute('/_authed/dashboard')({
  loader: () => loadDashboardShell(),
  errorComponent: DashboardError,
  pendingComponent: DashboardLoading,
  component: DashboardLayoutRoute,
})

function DashboardLayoutRoute() {
  const { allowPreviewAccess } = Route.useLoaderData()
  return (
    <WorkspaceLayoutInner allowPreviewAccess={allowPreviewAccess}>
      <Outlet />
    </WorkspaceLayoutInner>
  )
}
