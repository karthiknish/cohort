import { asNonEmptyString } from './agentActions/helpers/values'

export type RawExtractedTask = {
  title?: unknown
  description?: unknown
  assignedToNames?: unknown
  priority?: unknown
  dueDate?: unknown
  sourceExcerpt?: unknown
}

export function stripMarkdownFences(text: string): string {
  return text
    .replace(/^```(?:json)?\s*/i, '')
    .replace(/\s*```$/i, '')
    .trim()
}

export function extractJsonArray(text: string): string | null {
  const cleaned = stripMarkdownFences(text)
  const start = cleaned.indexOf('[')
  const end = cleaned.lastIndexOf(']')
  if (start === -1 || end === -1 || end <= start) return null
  return cleaned.slice(start, end + 1)
}

export function parseExtractedTasksResponse(raw: string): RawExtractedTask[] {
  const jsonCandidate = extractJsonArray(raw)
  const payloads = [jsonCandidate, stripMarkdownFences(raw)].filter(
    (value, index, values): value is string => typeof value === 'string' && values.indexOf(value) === index,
  )

  for (const payload of payloads) {
    try {
      const parsed = JSON.parse(payload) as unknown
      if (Array.isArray(parsed)) {
        return parsed.filter((entry) => entry && typeof entry === 'object') as RawExtractedTask[]
      }
      if (parsed && typeof parsed === 'object') {
        const record = parsed as Record<string, unknown>
        const tasks = record.tasks ?? record.items ?? record.proposedTasks
        if (Array.isArray(tasks)) {
          return tasks.filter((entry) => entry && typeof entry === 'object') as RawExtractedTask[]
        }
      }
    } catch {
      // try next payload
    }
  }

  return []
}

export function normalizePriority(value: unknown): 'low' | 'medium' | 'high' {
  const normalized = asNonEmptyString(value)?.toLowerCase()
  if (normalized === 'low' || normalized === 'high') return normalized
  return 'medium'
}
