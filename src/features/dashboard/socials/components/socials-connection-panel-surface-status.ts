import type { SocialsSurfaceStatus } from './socials-state'

export function getSurfaceStatusLabel(status: SocialsSurfaceStatus, count: number) {
  if (status === 'ready') return `${count} ready`
  if (status === 'loading') return 'Loading…'
  if (status === 'source_required') return 'Source needed'
  if (status === 'error') return 'Retry needed'
  if (status === 'disconnected') return 'Not connected'
  return 'Waiting'
}

export function getSurfaceStatusVariant(status: SocialsSurfaceStatus): 'outline' | 'secondary' | 'info' {
  if (status === 'ready') return 'secondary'
  if (status === 'loading') return 'info'
  return 'outline'
}
