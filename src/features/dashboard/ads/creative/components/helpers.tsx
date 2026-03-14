import type { ReactNode } from 'react'
import { Image as ImageIcon, Video, FileText } from 'lucide-react'

export function unwrapApiData(payload: unknown): unknown {
  const record = payload && typeof payload === 'object' ? (payload as Record<string, unknown>) : null
  return record && 'data' in record ? record.data : payload
}

export function getStatusVariant(status: string): 'default' | 'secondary' | 'outline' | 'destructive' {
  const s = status.toLowerCase()
  if (s === 'enabled' || s === 'enable' || s === 'active') return 'default'
  if (s === 'paused' || s === 'disable') return 'secondary'
  if (s === 'deleted' || s === 'removed') return 'destructive'
  return 'outline'
}

export function getTypeIcon(type: string): ReactNode {
  const t = type.toLowerCase()
  if (t.includes('video')) return <Video className="h-5 w-5" />
  if (t.includes('image') || t.includes('display')) return <ImageIcon className="h-5 w-5" />
  return <FileText className="h-5 w-5" />
}

export function isDirectVideoUrl(url: string | undefined): boolean {
  if (!url) return false
  try {
    const parsed = new URL(url)
    const pathname = parsed.pathname.toLowerCase()
    return pathname.endsWith('.mp4') || pathname.endsWith('.webm') || pathname.endsWith('.mov')
  } catch {
    const lower = url.toLowerCase()
    return lower.endsWith('.mp4') || lower.endsWith('.webm') || lower.endsWith('.mov')
  }
}

export function formatCTALabel(cta: string | undefined): string {
  if (!cta) return ''

  const mapping: Record<string, string> = {
    'LEARN_MORE': 'Learn More',
    'SHOP_NOW': 'Shop Now',
    'BOOK_TRAVEL': 'Book Now',
    'BOOK_NOW': 'Book Now',
    'SIGN_UP': 'Sign Up',
    'APPLY_NOW': 'Apply Now',
    'INSTALL_NOW': 'Install Now',
    'GET_OFFER': 'Get Offer',
    'DOWNLOAD': 'Download',
    'WATCH_MORE': 'Watch More',
    'WATCH_VIDEO': 'Watch Video',
    'CONTACT_US': 'Contact Us',
    'SEND_MESSAGE': 'Send Message',
    'LISTEN_NOW': 'Listen Now',
    'SUBSCRIBE': 'Subscribe',
    'GET_QUOTE': 'Get Quote',
    'GET_SHOWTIMES': 'Get Showtimes',
  }

  const upperCta = cta.toUpperCase()
  if (mapping[upperCta]) return mapping[upperCta]

  return cta
    .split('_')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ')
}
