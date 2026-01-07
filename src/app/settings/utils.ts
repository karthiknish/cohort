import { DATE_FORMATS, formatDate as formatDateLib } from '@/lib/dates'

export function formatDate(value: string | null | undefined): string {
  return formatDateLib(value, DATE_FORMATS.SHORT, undefined, 'Date unavailable')
}
