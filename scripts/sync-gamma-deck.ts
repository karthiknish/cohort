import 'dotenv/config'

import { FieldValue } from 'firebase-admin/firestore'

import { adminDb } from '../src/lib/firebase-admin'
import { mergeProposalForm, type ProposalFormData } from '../src/lib/proposals'
import {
  ensureProposalGammaDeck,
  parseGammaDeckPayload,
} from '../src/app/api/proposals/utils/gamma'

interface CliOptions {
  userId: string
  proposalId: string
  summary?: string
  instructions?: string
  logContext: string
  dryRun: boolean
}

type ProposalRecord = {
  formData?: unknown
  aiInsights?: unknown
  pptUrl?: unknown
  gammaDeck?: unknown
}

function parseArgs(argv: string[]): CliOptions {
  const options: CliOptions = {
    userId: '',
    proposalId: '',
    logContext: '[GammaSync]',
    dryRun: false,
  }

  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index]

    switch (arg) {
      case '--user':
      case '-u': {
        const value = argv[index + 1]
        if (!value || value.startsWith('-')) {
          throw new Error('Missing value for --user')
        }
        options.userId = value
        index += 1
        break
      }
      case '--proposal':
      case '-p': {
        const value = argv[index + 1]
        if (!value || value.startsWith('-')) {
          throw new Error('Missing value for --proposal')
        }
        options.proposalId = value
        index += 1
        break
      }
      case '--summary':
      case '-s': {
        const value = argv[index + 1]
        if (!value || value.startsWith('-')) {
          throw new Error('Missing value for --summary')
        }
        options.summary = value
        index += 1
        break
      }
      case '--instructions':
      case '-i': {
        const value = argv[index + 1]
        if (!value || value.startsWith('-')) {
          throw new Error('Missing value for --instructions')
        }
        options.instructions = value
        index += 1
        break
      }
      case '--log': {
        const value = argv[index + 1]
        if (!value || value.startsWith('-')) {
          throw new Error('Missing value for --log')
        }
        options.logContext = value
        index += 1
        break
      }
      case '--dry-run':
        options.dryRun = true
        break
      case '--help':
      case '-h':
        printHelp()
        process.exit(0)
        break
      default:
        throw new Error(`Unknown argument: ${arg}`)
    }
  }

  if (!options.userId) {
    throw new Error('User id is required. Pass with --user <uid>.')
  }

  if (!options.proposalId) {
    throw new Error('Proposal id is required. Pass with --proposal <id>.')
  }

  return options
}

function extractAiSummary(input: unknown, depth = 0): string | null {
  if (!input || depth > 4) {
    return null
  }

  if (typeof input === 'string') {
    const trimmed = input.trim()
    return trimmed.length > 0 ? trimmed : null
  }

  if (Array.isArray(input)) {
    for (const entry of input) {
      const result = extractAiSummary(entry, depth + 1)
      if (result) {
        return result
      }
    }
    return null
  }

  if (typeof input !== 'object') {
    return null
  }

  const record = input as Record<string, unknown>
  const preferredKeys = ['content', 'summary', 'proposalSummary', 'executiveSummary', 'overview']

  for (const key of preferredKeys) {
    const value = record[key]
    if (typeof value === 'string') {
      const trimmed = value.trim()
      if (trimmed.length > 0) {
        return trimmed
      }
    }
  }

  for (const value of Object.values(record)) {
    const result = extractAiSummary(value, depth + 1)
    if (result) {
      return result
    }
  }

  return null
}

function normalizeFormData(raw: unknown): ProposalFormData {
  const partial = raw && typeof raw === 'object' && !Array.isArray(raw)
    ? (raw as Partial<ProposalFormData>)
    : {}
  return mergeProposalForm(partial)
}

function printHelp(): void {
  console.log(`Usage: ts-node --project tsconfig.json scripts/sync-gamma-deck.ts --user <uid> --proposal <id> [options]

Options:
  -u, --user            Firebase Auth user id that owns the proposal (required)
  -p, --proposal        Proposal document id (required)
  -s, --summary         Override AI summary text if missing in Firestore
  -i, --instructions    Provide custom Gamma instructions to seed generation
      --log             Override log prefix (default: [GammaSync])
      --dry-run         Fetch and print results without updating Firestore
  -h, --help            Show this message
`)
}

async function main() {
  try {
    const options = parseArgs(process.argv.slice(2))

    if (!process.env.GAMMA_API_KEY) {
      throw new Error('GAMMA_API_KEY is not configured in the environment')
    }

    const proposalRef = adminDb
      .collection('users')
      .doc(options.userId)
      .collection('proposals')
      .doc(options.proposalId)

    const snapshot = await proposalRef.get()

    if (!snapshot.exists) {
      throw new Error(`Proposal ${options.proposalId} not found for user ${options.userId}`)
    }

    const data = snapshot.data() as ProposalRecord
    const existingDeck = parseGammaDeckPayload(data.gammaDeck)
    const storedPptUrl = typeof data.pptUrl === 'string' ? data.pptUrl : null
    const existingStorageUrl = storedPptUrl ?? existingDeck?.storageUrl ?? null
    const formData = normalizeFormData(data.formData)
    const summary = options.summary ?? extractAiSummary(data.aiInsights)

    if (!summary) {
      console.warn('[GammaSync] Warning: No AI summary found. Gamma deck may lack high-level context.')
    }

    console.log('[GammaSync] Starting Gamma deck sync', {
      userId: options.userId,
      proposalId: options.proposalId,
      hasExistingDeck: Boolean(existingDeck),
      hasStoredUrl: Boolean(existingStorageUrl),
      dryRun: options.dryRun,
    })

    const result = await ensureProposalGammaDeck({
      userId: options.userId,
      proposalId: options.proposalId,
      formData,
      summary,
      existingDeck,
      existingStorageUrl,
      instructions: options.instructions,
      logContext: options.logContext,
    })

    console.log('[GammaSync] Gamma deck process result', {
      reused: result.reused,
      storageUrl: result.storageUrl,
      hasDeck: Boolean(result.gammaDeck),
      instructionsLength: result.instructions?.length ?? 0,
    })

    if (options.dryRun) {
      console.log('[GammaSync] Dry run complete. No updates written to Firestore.')
      return
    }

    const updates: Record<string, unknown> = {
      updatedAt: FieldValue.serverTimestamp(),
    }

    if (result.storageUrl) {
      updates.pptUrl = result.storageUrl
    }

    if (result.gammaDeck) {
      updates.gammaDeck = {
        ...result.gammaDeck,
        generatedAt: FieldValue.serverTimestamp(),
      }
    }

    await proposalRef.update(updates)

    console.log('[GammaSync] Firestore updated successfully')
  } catch (error) {
    console.error('[GammaSync] Failed to sync Gamma deck:', error instanceof Error ? error.message : error)
    process.exitCode = 1
  }
}

void main()
