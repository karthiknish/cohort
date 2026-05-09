import { mergeProposalForm } from '../../../src/lib/proposals'

export type ProposalConversationPromptId =
  | 'client'
  | 'industry'
  | 'budget'
  | 'objectives'
  | 'services'
  | 'startTime'
  | 'proposalSize'
  | 'engagementType'
  | 'additionalNotes'

const PROMPTS: Record<ProposalConversationPromptId, { label: string; question: string }> = {
  client: {
    label: 'Client',
    question: 'Sure — which client should I build this proposal for?',
  },
  industry: {
    label: 'Industry',
    question: 'Great — what industry or sector should I use?',
  },
  budget: {
    label: 'Marketing Budget',
    question: 'What monthly marketing budget should I include?',
  },
  objectives: {
    label: 'Objectives',
    question: 'What are the primary goals? You can list one or more, like lead generation, sales, or brand awareness.',
  },
  services: {
    label: 'Services',
    question: 'Which services should the proposal cover? You can list one or more.',
  },
  startTime: {
    label: 'Start Time',
    question: 'When should the work start? For example: ASAP, within 1 month, within 3 months, or flexible.',
  },
  proposalSize: {
    label: 'Proposal Size',
    question: 'What proposal value range should I use? For example: £2,000 – £5,000, £5,000 – £10,000, or £10,000+.',
  },
  engagementType: {
    label: 'Engagement Type',
    question: 'Should this be a one-off project or ongoing monthly support?',
  },
  additionalNotes: {
    label: 'Additional Notes',
    question: 'Any extra audience details, challenges, or notes I should add before I generate it? You can say skip.',
  },
}

type ProposalAnswerParseResult = {
  clientName?: string
  formPatch?: Record<string, unknown>
  skip?: boolean
  errorMessage?: string
}

const objectiveAliases: Array<{ value: string; aliases: string[] }> = [
  { value: 'Lead Generation', aliases: ['lead generation', 'leads', 'qualified leads'] },
  { value: 'Sales', aliases: ['sales', 'revenue', 'booked deals'] },
  { value: 'Brand Awareness', aliases: ['brand awareness', 'awareness', 'visibility'] },
  { value: 'Website Traffic', aliases: ['traffic', 'website traffic', 'site traffic'] },
  { value: 'Engagement', aliases: ['engagement', 'engagement rate', 'social engagement'] },
]

const serviceAliases: Array<{ value: string; aliases: string[] }> = [
  { value: 'SEO', aliases: ['seo', 'search engine optimisation', 'search engine optimization'] },
  { value: 'PPC', aliases: ['ppc', 'paid search', 'google ads'] },
  { value: 'Paid Social', aliases: ['paid social', 'meta ads', 'facebook ads', 'instagram ads', 'social ads'] },
  { value: 'Content Marketing', aliases: ['content', 'content marketing', 'content strategy'] },
  { value: 'Email Marketing', aliases: ['email', 'email marketing', 'crm'] },
  { value: 'Web Design', aliases: ['web design', 'website', 'landing page', 'site redesign'] },
  { value: 'Brand Strategy', aliases: ['brand strategy', 'branding', 'positioning'] },
]

function normalize(value?: string | null) {
  return (value ?? '').trim().toLowerCase().replace(/\s+/g, ' ')
}

function isSkipResponse(value: string) {
  return ['skip', 'none', 'n/a', 'na', 'not now', 'no notes'].includes(normalize(value))
}

function splitListValues(value: string) {
  const prepared = value.replace(/[\n;/]+/g, ',').replace(/\s+and\s+/gi, ',')
  return prepared
    .split(',')
    .flatMap((part) => {
      const trimmedPart = part.trim()
      return trimmedPart ? [trimmedPart] : []
    })
}

function dedupe(values: string[]) {
  return Array.from(new Set(values.flatMap((value) => {
    const trimmedValue = value.trim()
    return trimmedValue ? [trimmedValue] : []
  })))
}

function normalizeSelections(value: string, aliases: Array<{ value: string; aliases: string[] }>) {
  const raw = normalize(value)
  const matched = aliases
    .filter((entry) => entry.aliases.some((alias) => raw.includes(alias)))
    .map((entry) => entry.value)

  if (matched.length > 0) return dedupe(matched)

  const split = dedupe(splitListValues(value))
  return split.length > 0 ? split : [value.trim()]
}

function normalizeStartTime(value: string) {
  const raw = normalize(value)
  if (raw.includes('asap') || raw.includes('immediately') || raw.includes('right away')) return 'ASAP'
  if (raw.includes('1 month') || raw.includes('one month') || raw.includes('4 weeks')) return 'Within 1 month'
  if (raw.includes('3 months') || raw.includes('three months') || raw.includes('quarter')) return 'Within 3 months'
  if (raw.includes('flexible') || raw.includes('no rush')) return 'Flexible'
  return value.trim()
}

function normalizeProposalSize(value: string) {
  const raw = normalize(value)
  if (raw.includes('10,000') || raw.includes('10000') || raw.includes('10k') || raw.includes('high')) return '£10,000+'
  if ((raw.includes('5,000') || raw.includes('5000') || raw.includes('5k')) && (raw.includes('10,000') || raw.includes('10000') || raw.includes('10k'))) {
    return '£5,000 – £10,000'
  }
  if ((raw.includes('2,000') || raw.includes('2000') || raw.includes('2k')) && (raw.includes('5,000') || raw.includes('5000') || raw.includes('5k'))) {
    return '£2,000 – £5,000'
  }
  return value.trim()
}

function normalizeEngagementType(value: string) {
  const raw = normalize(value)
  if (raw.includes('ongoing') || raw.includes('monthly') || raw.includes('retainer')) return 'Ongoing monthly support'
  if (raw.includes('one-off') || raw.includes('one off') || raw.includes('project')) return 'One-off project'
  return value.trim()
}

export function isProposalConversationRequest(message: string) {
  const raw = normalize(message)
  if (!raw.includes('proposal')) return false
  if (raw.includes('generate this proposal') || raw.includes('generate proposal from draft')) return false

  return [
    'make a proposal',
    'create a proposal',
    'build a proposal',
    'new proposal',
    'proposal for',
    'put together a proposal',
  ].some((phrase) => raw.includes(phrase))
}

export function extractClientNameFromProposalRequest(message: string) {
  const trimmed = message.trim()
  const match = trimmed.match(/(?:proposal\s+for|for\s+client)\s+(.+)$/i)
  return match?.[1]?.trim() || null
}

export function getProposalConversationPrompt(promptId: ProposalConversationPromptId) {
  return PROMPTS[promptId].question
}

export function getProposalConversationPromptLabel(promptId: ProposalConversationPromptId) {
  return PROMPTS[promptId].label
}

export function getProposalConversationPromptIdFromAssistantMessage(content?: string | null) {
  const raw = normalize(content)
  if (!raw) return null

  return (Object.entries(PROMPTS).find(([, prompt]) => raw.includes(normalize(prompt.question)))?.[0] ?? null) as ProposalConversationPromptId | null
}

export function getNextRequiredProposalPrompt(args: {
  clientId?: string | null
  clientName?: string | null
  formData?: Record<string, unknown> | null
}) {
  const form = mergeProposalForm(args.formData ?? {})

  if (!normalize(args.clientId) && !normalize(args.clientName)) return 'client'
  if (!normalize(form.company.industry)) return 'industry'
  if (!normalize(form.marketing.budget)) return 'budget'
  if (form.goals.objectives.length === 0) return 'objectives'
  if (form.scope.services.length === 0) return 'services'
  if (!normalize(form.timelines.startTime)) return 'startTime'
  if (!normalize(form.value.proposalSize)) return 'proposalSize'
  if (!normalize(form.value.engagementType)) return 'engagementType'

  return null
}

export function getProposalConversationStepProgress(args: {
  clientId?: string | null
  clientName?: string | null
  formData?: Record<string, unknown> | null
}) {
  const form = mergeProposalForm(args.formData ?? {})
  let completed = 0

  if (normalize(args.clientId) || normalize(args.clientName)) completed += 1
  if (normalize(form.company.name) && normalize(form.company.industry)) completed += 1
  if (normalize(form.marketing.budget)) completed += 1
  if (form.goals.objectives.length > 0) completed += 1
  if (form.scope.services.length > 0) completed += 1
  if (normalize(form.timelines.startTime)) completed += 1
  if (normalize(form.value.proposalSize) && normalize(form.value.engagementType)) completed += 1

  return completed
}

export function parseProposalConversationAnswer(promptId: ProposalConversationPromptId, message: string): ProposalAnswerParseResult {
  const trimmed = message.trim()
  if (!trimmed) return { errorMessage: getProposalConversationPrompt(promptId) }

  if (promptId === 'additionalNotes' && isSkipResponse(trimmed)) return { skip: true }
  if (promptId !== 'additionalNotes' && isSkipResponse(trimmed)) {
    return { errorMessage: `I still need that before I can generate the proposal. ${getProposalConversationPrompt(promptId)}` }
  }

  switch (promptId) {
    case 'client':
      return { clientName: trimmed }
    case 'industry':
      return { formPatch: { company: { industry: trimmed } } }
    case 'budget':
      return { formPatch: { marketing: { budget: trimmed } } }
    case 'objectives':
      return { formPatch: { goals: { objectives: normalizeSelections(trimmed, objectiveAliases) } } }
    case 'services':
      return { formPatch: { scope: { services: normalizeSelections(trimmed, serviceAliases) } } }
    case 'startTime':
      return { formPatch: { timelines: { startTime: normalizeStartTime(trimmed) } } }
    case 'proposalSize':
      return { formPatch: { value: { proposalSize: normalizeProposalSize(trimmed) } } }
    case 'engagementType':
      return { formPatch: { value: { engagementType: normalizeEngagementType(trimmed) } } }
    case 'additionalNotes':
      return { formPatch: { value: { additionalNotes: trimmed } } }
    default:
      return { errorMessage: getProposalConversationPrompt(promptId) }
  }
}