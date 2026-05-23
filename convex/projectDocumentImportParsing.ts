import { assessDocumentImportDueDate, stripMarkdownFences } from './taskDocumentImportParsing'
import { asNonEmptyString, asStringArray } from './agentActions/helpers/values'

export type DocumentImportClient = {
  id: string
  name: string
}

export type DocumentImportClientStatus = 'resolved' | 'ambiguous' | 'unassigned' | 'preferred'

export type DocumentImportDateStatus = 'resolved' | 'missing' | 'unclear'

export type RawExtractedProject = {
  name?: unknown
  description?: unknown
  clientName?: unknown
  status?: unknown
  startDate?: unknown
  endDate?: unknown
  tags?: unknown
  sourceExcerpt?: unknown
}

const PROJECT_STATUS_VALUES = ['planning', 'active', 'on_hold', 'completed'] as const
export type ParsedProjectStatus = (typeof PROJECT_STATUS_VALUES)[number]

function normalizeClientLookup(value: string): string {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim()
}

function findClientMatches(query: string, clients: DocumentImportClient[]): DocumentImportClient[] {
  const normalizedQuery = normalizeClientLookup(query)
  if (!normalizedQuery) return []

  const exactMatches = clients.filter(
    (client) => normalizeClientLookup(client.name) === normalizedQuery,
  )
  if (exactMatches.length > 0) return exactMatches

  const partialMatches = clients.filter((client) => {
    const normalizedName = normalizeClientLookup(client.name)
    return (
      normalizedName.includes(normalizedQuery) ||
      normalizedQuery.includes(normalizedName)
    )
  })
  if (partialMatches.length > 0) return partialMatches

  return []
}

function findSimilarClientSuggestions(
  query: string,
  clients: DocumentImportClient[],
  limit = 5,
): string[] {
  const normalizedQuery = normalizeClientLookup(query)
  if (!normalizedQuery) return []

  const queryTokens = normalizedQuery.split(' ').filter(Boolean)
  const queryPattern =
    queryTokens.length > 0
      ? new RegExp(queryTokens.map((token) => token.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|'))
      : null

  const suggestions: string[] = []
  for (const client of clients) {
    const name = client.name.trim()
    const normalizedName = normalizeClientLookup(name)
    if (!normalizedName) continue
    if (queryPattern?.test(normalizedName)) {
      suggestions.push(name)
    }
  }

  return [...new Set(suggestions)].slice(0, limit)
}

export function parseProjectStatus(value: unknown): ParsedProjectStatus | null {
  const raw = asNonEmptyString(value)?.toLowerCase().replace(/\s+/g, '_')
  if (!raw) return null

  if (raw === 'planning' || raw === 'planned' || raw === 'draft') return 'planning'
  if (raw === 'active' || raw === 'in_progress' || raw === 'in-progress' || raw === 'ongoing') {
    return 'active'
  }
  if (raw === 'on_hold' || raw === 'on-hold' || raw === 'paused' || raw === 'hold') {
    return 'on_hold'
  }
  if (raw === 'completed' || raw === 'complete' || raw === 'done' || raw === 'closed') {
    return 'completed'
  }

  if ((PROJECT_STATUS_VALUES as readonly string[]).includes(raw)) {
    return raw as ParsedProjectStatus
  }

  return null
}

export function parseExtractedProjectsResponse(raw: string): RawExtractedProject[] {
  const trimmed = raw.trim()
  if (!trimmed) return []

  const candidates = [trimmed, stripMarkdownFences(trimmed)]
  for (const candidate of candidates) {
    try {
      const parsed = JSON.parse(candidate) as unknown
      if (Array.isArray(parsed)) {
        return parsed.filter((entry): entry is RawExtractedProject => typeof entry === 'object' && entry !== null)
      }

      if (parsed && typeof parsed === 'object' && 'projects' in parsed) {
        const projects = (parsed as { projects?: unknown }).projects
        if (Array.isArray(projects)) {
          return projects.filter(
            (entry): entry is RawExtractedProject => typeof entry === 'object' && entry !== null,
          )
        }
      }
    } catch {
      // try next candidate
    }
  }

  return []
}

export function resolveDocumentImportClient(
  clientName: string | null,
  clients: DocumentImportClient[],
  preferredClientId: string | null,
): {
  clientId: string | null
  documentClientName: string | null
  clientStatus: DocumentImportClientStatus
  suggestions: string[]
} {
  const trimmedName = clientName?.trim() ?? ''

  if (trimmedName) {
    const matches = findClientMatches(trimmedName, clients)

    if (matches.length === 1) {
      return {
        clientId: matches[0]?.id ?? null,
        documentClientName: trimmedName,
        clientStatus: 'resolved',
        suggestions: [],
      }
    }

    if (matches.length > 1) {
      return {
        clientId: null,
        documentClientName: trimmedName,
        clientStatus: 'ambiguous',
        suggestions: matches.map((client) => client.name).slice(0, 5),
      }
    }

    return {
      clientId: null,
      documentClientName: trimmedName,
      clientStatus: 'unassigned',
      suggestions: findSimilarClientSuggestions(trimmedName, clients),
    }
  }

  if (preferredClientId) {
    const preferred = clients.find((client) => client.id === preferredClientId)
    return {
      clientId: preferredClientId,
      documentClientName: preferred?.name ?? null,
      clientStatus: 'preferred',
      suggestions: [],
    }
  }

  return {
    clientId: null,
    documentClientName: null,
    clientStatus: 'unassigned',
    suggestions: clients.slice(0, 5).map((client) => client.name),
  }
}

export function resolveDocumentImportProjectDate(
  value: string | null,
  context: { description?: string | null; sourceExcerpt?: string | null },
): { dateMs: number | null; status: DocumentImportDateStatus; hint: string | null } {
  const assessment = assessDocumentImportDueDate({
    dueDate: value,
    description: context.description ?? null,
    sourceExcerpt: context.sourceExcerpt ?? null,
  })

  if (assessment.status !== 'resolved' || !assessment.candidate) {
    return {
      dateMs: null,
      status: assessment.status,
      hint: assessment.hint,
    }
  }

  const parsed = Date.parse(assessment.candidate)
  if (Number.isNaN(parsed)) {
    return {
      dateMs: null,
      status: 'unclear',
      hint: assessment.hint ?? assessment.candidate,
    }
  }

  return {
    dateMs: parsed,
    status: 'resolved',
    hint: null,
  }
}

export function parseProjectTags(value: unknown): string[] {
  if (Array.isArray(value)) {
    return asStringArray(value)
      .flatMap((tag) => {
        const trimmed = tag.trim()
        return trimmed ? [trimmed] : []
      })
      .slice(0, 12)
  }

  const raw = asNonEmptyString(value)
  if (!raw) return []

  return raw
    .split(/[,;#]+/)
    .flatMap((tag) => {
      const trimmed = tag.trim()
      return trimmed ? [trimmed] : []
    })
    .slice(0, 12)
}
