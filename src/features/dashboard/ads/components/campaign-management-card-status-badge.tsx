'use client'

import { Badge } from '@/shared/ui/badge'

export function CampaignStatusBadge({ status }: { status: string }) {
  const statusLower = status.toLowerCase()
  if (statusLower === 'enabled' || statusLower === 'enable' || statusLower === 'active') {
    return <Badge variant="default" className="bg-success">Active</Badge>
  }
  if (statusLower === 'paused' || statusLower === 'disable') {
    return <Badge variant="secondary">Paused</Badge>
  }
  if (statusLower === 'removed' || statusLower === 'archived' || statusLower === 'delete') {
    return <Badge variant="destructive">Removed</Badge>
  }
  return <Badge variant="outline">{status}</Badge>
}
