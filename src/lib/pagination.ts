// IMPORTANT: keep this module usable in the browser.
// Do not import server-only modules here.

type FirestoreTimestamp = {
  toDate(): Date
}

export type PageSizeOptions = {
  defaultValue: number
  max: number
}

export function parsePageSize(raw: string | number | null | undefined, opts: PageSizeOptions): number {
  const parsed = typeof raw === 'number' ? raw : Number(raw)
  const value = Number.isFinite(parsed) ? Math.floor(parsed) : opts.defaultValue
  return Math.min(Math.max(value, 1), Math.max(1, Math.floor(opts.max)))
}

export type TimestampIdCursor = {
  time: Date
  id: string
}

export function encodeTimestampIdCursor(time: FirestoreTimestamp | Date | string, id: string): string {
  const iso =
    typeof time === 'string'
      ? time
      : time instanceof Date
        ? time.toISOString()
        : time.toDate().toISOString()
  return `${iso}|${id}`
}

export function decodeTimestampIdCursor(cursor: string | null | undefined): TimestampIdCursor | null {
  if (!cursor) return null
  const [cursorTime, cursorId] = cursor.split('|')
  if (!cursorTime || !cursorId) return null

  const date = new Date(cursorTime)
  if (Number.isNaN(date.getTime())) return null

  return { time: date, id: cursorId }
}

export type StringIdCursor = {
  value: string
  id: string
}

export function encodeStringIdCursor(value: string, id: string): string {
  return `${value}|${id}`
}

export function decodeStringIdCursor(cursor: string | null | undefined): StringIdCursor | null {
  if (!cursor) return null
  const [value, id] = cursor.split('|')
  if (typeof value !== 'string' || !id) return null
  return { value, id }
}

export function encodeBase64JsonCursor(payload: unknown): string {
  return Buffer.from(JSON.stringify(payload), 'utf8').toString('base64url')
}

export function decodeBase64JsonCursor<T>(cursor: string | null | undefined): T | null {
  if (!cursor) return null
  try {
    return JSON.parse(Buffer.from(cursor, 'base64url').toString('utf8')) as T
  } catch {
    return null
  }
}
