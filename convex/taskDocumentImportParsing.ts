import { asNonEmptyString, asStringArray } from './agentActions/helpers/values'

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

export function parseExplicitDocumentPriority(value: unknown): 'low' | 'medium' | 'high' | null {
  const normalized = asNonEmptyString(value)?.toLowerCase()
  if (!normalized) return null
  if (normalized === 'low') return 'low'
  if (normalized === 'medium' || normalized === 'med') return 'medium'
  if (normalized === 'high' || normalized === 'urgent' || normalized === 'critical') return 'high'
  return null
}

/** @deprecated Prefer resolveDocumentImportPriority for document import. */
export function normalizePriority(value: unknown): 'low' | 'medium' | 'high' {
  return parseExplicitDocumentPriority(value) ?? 'medium'
}

function getLocalDayStamp(value: number): number {
  const date = new Date(value)
  return new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime()
}

export function resolveDocumentImportPriority(args: {
  explicitPriority: unknown
  dueDateMs: number | null
  nowMs: number
}): 'low' | 'medium' | 'high' {
  const explicit = parseExplicitDocumentPriority(args.explicitPriority)
  if (explicit) return explicit

  if (args.dueDateMs === null) return 'low'

  const daysUntilDue = Math.ceil(
    (getLocalDayStamp(args.dueDateMs) - getLocalDayStamp(args.nowMs)) / (24 * 60 * 60 * 1000),
  )

  if (daysUntilDue <= 3) return 'high'
  if (daysUntilDue <= 14) return 'medium'
  return 'low'
}

export type DocumentImportAssignmentStatus = 'resolved' | 'ambiguous' | 'unassigned'

export type DocumentImportWorkspaceMember = {
  id: string
  name: string
  email?: string
}

export function normalizeAssigneeLookup(value: string): string {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim()
}

function nameTokens(value: string): string[] {
  return normalizeAssigneeLookup(value).split(' ').filter(Boolean)
}

function findWorkspaceMemberMatches(
  query: string,
  members: DocumentImportWorkspaceMember[],
): DocumentImportWorkspaceMember[] {
  const normalizedQuery = normalizeAssigneeLookup(query)
  if (!normalizedQuery) return []

  const exactMatches = members.filter(
    (member) => normalizeAssigneeLookup(member.name) === normalizedQuery,
  )
  if (exactMatches.length > 0) return exactMatches

  const emailMatches = members.filter((member) => {
    const localPart = member.email?.split('@')[0]
    return localPart ? normalizeAssigneeLookup(localPart) === normalizedQuery : false
  })
  if (emailMatches.length > 0) return emailMatches

  const firstNameMatches = members.filter((member) => nameTokens(member.name)[0] === normalizedQuery)
  if (firstNameMatches.length > 0) return firstNameMatches

  const lastNameMatches = members.filter((member) => {
    const tokens = nameTokens(member.name)
    return tokens[tokens.length - 1] === normalizedQuery
  })
  if (lastNameMatches.length > 0) return lastNameMatches

  return []
}

function findSimilarMemberSuggestions(
  queries: string[],
  members: DocumentImportWorkspaceMember[],
  limit = 5,
): string[] {
  const suggestions = new Set<string>()

  for (const query of queries) {
    const normalizedQuery = normalizeAssigneeLookup(query)
    if (!normalizedQuery) continue

    const scored: Array<{ member: DocumentImportWorkspaceMember; score: number }> = []
    for (const member of members) {
      const normalizedName = normalizeAssigneeLookup(member.name)
      const firstName = nameTokens(member.name)[0] ?? ''
      let score = 0

      if (normalizedName === normalizedQuery) score = 100
      else if (firstName === normalizedQuery) score = 90
      else if (normalizedName.startsWith(`${normalizedQuery} `)) score = 85
      else if (firstName.startsWith(normalizedQuery) || normalizedQuery.startsWith(firstName)) score = 70

      if (score > 0) scored.push({ member, score })
    }
    scored.sort((a, b) => b.score - a.score)

    for (const entry of scored) {
      suggestions.add(entry.member.name)
      if (suggestions.size >= limit) break
    }
  }

  return [...suggestions].slice(0, limit)
}

export function buildAssigneeMemberPool(
  workspaceMembers: DocumentImportWorkspaceMember[],
  clientRosterNames: string[],
): DocumentImportWorkspaceMember[] {
  const pool = new Map<string, DocumentImportWorkspaceMember>()

  for (const member of workspaceMembers) {
    const name = member.name.trim()
    if (!name) continue
    pool.set(normalizeAssigneeLookup(name), member)
  }

  for (const rawName of clientRosterNames) {
    const name = rawName.trim()
    if (!name) continue

    const key = normalizeAssigneeLookup(name)
    if (pool.has(key)) continue

    const linked = findWorkspaceMemberMatches(name, workspaceMembers)
    if (linked.length === 1 && linked[0]?.id) {
      pool.set(key, linked[0])
      continue
    }

    pool.set(key, { id: '', name })
  }

  return [...pool.values()]
}

export function resolveDocumentImportAssignees(
  assignedToNames: string[],
  members: DocumentImportWorkspaceMember[],
): {
  assignedToUserIds: string[]
  assignmentStatus: DocumentImportAssignmentStatus
  suggestions: string[]
} {
  const trimmedNames: string[] = []
  for (const name of assignedToNames) {
    const trimmed = name.trim()
    if (trimmed.length > 0) trimmedNames.push(trimmed)
  }

  if (trimmedNames.length === 0) {
    return { assignedToUserIds: [], assignmentStatus: 'unassigned', suggestions: [] }
  }

  const resolvedUserIds = new Set<string>()
  const ambiguousQueries: string[] = []
  const unmatchedQueries: string[] = []

  for (const name of trimmedNames) {
    const matches = findWorkspaceMemberMatches(name, members)

    if (matches.length === 1) {
      const member = matches[0]
      if (member?.id) {
        resolvedUserIds.add(member.id)
      } else {
        unmatchedQueries.push(name)
      }
      continue
    }

    if (matches.length > 1) {
      ambiguousQueries.push(name)
      continue
    }

    unmatchedQueries.push(name)
  }

  if (ambiguousQueries.length > 0) {
    const suggestions = [
      ...new Set(
        ambiguousQueries.flatMap((query) =>
          findWorkspaceMemberMatches(query, members).map((member) => member.name),
        ),
      ),
    ].slice(0, 5)

    return {
      assignedToUserIds: [...resolvedUserIds],
      assignmentStatus: 'ambiguous',
      suggestions: suggestions.length > 0 ? suggestions : findSimilarMemberSuggestions(ambiguousQueries, members),
    }
  }

  if (unmatchedQueries.length > 0) {
    return {
      assignedToUserIds: [...resolvedUserIds],
      assignmentStatus: resolvedUserIds.size > 0 ? 'ambiguous' : 'unassigned',
      suggestions: findSimilarMemberSuggestions(unmatchedQueries, members),
    }
  }

  return {
    assignedToUserIds: [...resolvedUserIds],
    assignmentStatus: 'resolved',
    suggestions: [],
  }
}

export type DocumentImportDueDateStatus = 'resolved' | 'missing' | 'unclear'

const VAGUE_DUE_DATE_PATTERNS = [
  /^tbd$/i,
  /^asap$/i,
  /^soon$/i,
  /^pending$/i,
  /^unknown$/i,
  /^n\/a$/i,
  /^none$/i,
  /^no deadline$/i,
  /^\?+$/,
  /\btbd\b/i,
  /\basap\b/i,
  /\bnext week\b/i,
  /\bnext month\b/i,
  /\bend of (?:the )?(?:week|month|quarter|year)\b/i,
  /\bsometime\b/i,
  /\blater\b/i,
  /\bongoing\b/i,
  /\bwhen possible\b/i,
  /\bto be decided\b/i,
  /\bno due date\b/i,
]

const DUE_DATE_MENTION_PATTERNS = [
  /\b\d{1,2}\s+[A-Za-z]+\s+(?:19|20)\d{2}\b/,
  /\b(?:19|20)\d{2}-\d{2}-\d{2}\b/,
  /\b\d{1,2}\/\d{1,2}\/(?:19|20)?\d{2}\b/,
  /\b[A-Za-z]+\s+\d{1,2}(?:,\s*(?:19|20)\d{2})?\b/,
  /\bdue\s+(?:on\s+)?([^\n.;]+)/i,
  /\bdeadline\s*(?::|is)?\s*([^\n.;]+)/i,
]

function parseDueDateCandidate(value: string): number | null {
  const parsed = Date.parse(value.trim())
  return Number.isFinite(parsed) ? parsed : null
}

function isVagueDueDateText(value: string): boolean {
  const trimmed = value.trim()
  if (!trimmed) return false
  return VAGUE_DUE_DATE_PATTERNS.some((pattern) => pattern.test(trimmed))
}

function findDueDateMentionInText(text: string): string | null {
  for (const pattern of DUE_DATE_MENTION_PATTERNS) {
    const match = text.match(pattern)
    if (!match) continue

    const captured = (match[1] ?? match[0]).trim()
    if (captured.length > 0) return captured
  }

  return null
}

function classifyDueDateCandidate(candidate: string): DocumentImportDueDateStatus {
  if (isVagueDueDateText(candidate)) return 'unclear'
  if (parseDueDateCandidate(candidate) !== null) return 'resolved'
  return 'unclear'
}

export function assessDocumentImportDueDate(args: {
  dueDate?: string | null
  description?: string | null
  sourceExcerpt?: string | null
}): {
  status: DocumentImportDueDateStatus
  hint: string | null
  candidate: string | null
} {
  const dueDateRaw = args.dueDate?.trim() ?? ''
  if (dueDateRaw) {
    const status = classifyDueDateCandidate(dueDateRaw)
    return {
      status,
      hint: status === 'resolved' ? null : dueDateRaw,
      candidate: dueDateRaw,
    }
  }

  for (const text of [args.sourceExcerpt, args.description]) {
    if (!text?.trim()) continue
    const mention = findDueDateMentionInText(text)
    if (!mention) continue

    const status = classifyDueDateCandidate(mention)
    return {
      status,
      hint: status === 'resolved' ? null : mention,
      candidate: mention,
    }
  }

  return { status: 'missing', hint: null, candidate: null }
}

const TABLE_HEADER_LINES = new Set(['task', 'priority', 'deadline', 'due date', 'assignee', 'owner'])

type AssigneeSection = {
  assignee: string
  start: number
  end: number
}

type DocumentLine = {
  start: number
  end: number
  text: string
}

function normalizeTitleKey(title: string): string {
  return title.toLowerCase().replace(/\s+/g, ' ').trim()
}

function isTableHeaderLine(line: string): boolean {
  return TABLE_HEADER_LINES.has(line.toLowerCase().trim())
}

function isLikelyAssigneeNameLine(line: string): boolean {
  const trimmed = line.trim()
  if (!trimmed || trimmed.length > 48) return false
  if (isTableHeaderLine(trimmed)) return false

  const lower = trimmed.toLowerCase()
  if (lower.includes('allocation') || lower.includes('marketing task')) return false
  if (/^(high|medium|low)$/i.test(trimmed)) return false
  if (/^\d{1,2}\s+[A-Za-z]+\s+\d{4}$/.test(trimmed)) return false

  const words = trimmed.split(/\s+/).filter(Boolean)
  if (words.length === 0 || words.length > 3) return false

  return words.every((word) => /^[A-Za-z][A-Za-z'.-]*$/.test(word))
}

function buildDocumentLines(extractedText: string): DocumentLine[] {
  const lines = extractedText.split(/\r?\n/)
  const result: DocumentLine[] = []
  let offset = 0

  for (const line of lines) {
    const start = offset
    const end = offset + line.length
    result.push({ start, end, text: line.trim() })
    offset = end + 1
  }

  return result
}

function buildAssigneeSections(extractedText: string): AssigneeSection[] {
  const lines = buildDocumentLines(extractedText)
  const assigneeLines = lines.filter((line) => isLikelyAssigneeNameLine(line.text))
  const tableBlockStarts = lines.filter((line) => line.text.toLowerCase() === 'task')

  if (assigneeLines.length === 0) return []

  if (assigneeLines.length === 1 && tableBlockStarts.length <= 1) {
    const assignee = assigneeLines[0]
    if (!assignee) return []
    return [{ assignee: assignee.text, start: assignee.end, end: extractedText.length }]
  }

  if (tableBlockStarts.length >= 2) {
    const secondTableStart = tableBlockStarts[1]
    if (!secondTableStart) return []

    const leadingAssignee = assigneeLines.find((line) => line.start < secondTableStart.start)
    const trailingAssignee =
      [...assigneeLines].reverse().find((line) => line.start >= secondTableStart.start) ??
      assigneeLines[assigneeLines.length - 1]

    if (leadingAssignee && trailingAssignee && leadingAssignee.text !== trailingAssignee.text) {
      const firstTableStart = tableBlockStarts[0]
      if (!firstTableStart) return []

      return [
        {
          assignee: leadingAssignee.text,
          start: firstTableStart.start,
          end: secondTableStart.start,
        },
        {
          assignee: trailingAssignee.text,
          start: secondTableStart.start,
          end: extractedText.length,
        },
      ]
    }
  }

  const sections: AssigneeSection[] = []
  for (let index = 0; index < assigneeLines.length; index += 1) {
    const current = assigneeLines[index]
    const next = assigneeLines[index + 1]
    if (!current) continue

    sections.push({
      assignee: current.text,
      start: current.end,
      end: next?.start ?? extractedText.length,
    })
  }

  return sections
}

function findTitlePosition(extractedText: string, title: string): number {
  const trimmedTitle = title.trim()
  if (!trimmedTitle) return -1

  const lowerText = extractedText.toLowerCase()
  const lowerTitle = trimmedTitle.toLowerCase()
  const directMatch = lowerText.indexOf(lowerTitle)
  if (directMatch !== -1) return directMatch

  const normalizedTitle = normalizeTitleKey(trimmedTitle)
  for (const line of extractedText.split(/\r?\n/)) {
    const trimmedLine = line.trim()
    if (!trimmedLine) continue
    const normalizedLine = normalizeTitleKey(trimmedLine)
    if (
      normalizedLine === normalizedTitle ||
      normalizedLine.startsWith(normalizedTitle) ||
      normalizedTitle.startsWith(normalizedLine)
    ) {
      return lowerText.indexOf(trimmedLine.toLowerCase())
    }
  }

  return -1
}

function findAssigneeForTitle(
  extractedText: string,
  title: string,
  sections: AssigneeSection[],
): string | null {
  const position = findTitlePosition(extractedText, title)
  if (position === -1) return null

  for (const section of sections) {
    if (position >= section.start && position < section.end) {
      return section.assignee
    }
  }

  return null
}

export function enrichExtractedTasksWithDocumentAssignees(
  extractedText: string,
  rawTasks: RawExtractedTask[],
): RawExtractedTask[] {
  const trimmedText = extractedText.trim()
  if (!trimmedText || rawTasks.length === 0) return rawTasks

  const sections = buildAssigneeSections(trimmedText)
  if (sections.length === 0) return rawTasks

  return rawTasks.map((task) => {
    const existingAssignees = asStringArray(task.assignedToNames)
    if (existingAssignees.length > 0) return task

    const title = asNonEmptyString(task.title)
    if (!title) return task

    const assignee = findAssigneeForTitle(trimmedText, title, sections)
    if (!assignee) return task

    return { ...task, assignedToNames: [assignee] }
  })
}
