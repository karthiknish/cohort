import 'dotenv/config'

import { gammaService } from '../src/services/gamma'

type CliOptions = {
  generationId: string
  watch: boolean
  intervalMs: number
  timeoutMs: number
}

type NormalizedFile = {
  fileType: string
  fileUrl: string
}

function parseArgs(argv: string[]): CliOptions {
  const options: CliOptions = {
    generationId: '',
    watch: false,
    intervalMs: 10000,
    timeoutMs: 300000,
  }

  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index]

    switch (arg) {
      case '--generation':
      case '-g': {
        const value = argv[index + 1]
        if (!value || value.startsWith('-')) {
          throw new Error('Missing value for --generation')
        }
        options.generationId = value
        index += 1
        break
      }
      case '--watch':
      case '-w':
        options.watch = true
        break
      case '--interval':
      case '-i': {
        const value = argv[index + 1]
        if (!value || value.startsWith('-')) {
          throw new Error('Missing value for --interval')
        }
        const parsed = Number.parseInt(value, 10)
        if (!Number.isFinite(parsed) || parsed <= 0) {
          throw new Error('Interval must be a positive integer (milliseconds)')
        }
        options.intervalMs = parsed
        index += 1
        break
      }
      case '--timeout':
      case '-t': {
        const value = argv[index + 1]
        if (!value || value.startsWith('-')) {
          throw new Error('Missing value for --timeout')
        }
        const parsed = Number.parseInt(value, 10)
        if (!Number.isFinite(parsed) || parsed <= 0) {
          throw new Error('Timeout must be a positive integer (milliseconds)')
        }
        options.timeoutMs = parsed
        index += 1
        break
      }
      case '--help':
      case '-h':
        printHelp()
        process.exit(0)
        break
      default:
        throw new Error(`Unknown argument: ${arg}`)
    }
  }

  if (!options.generationId) {
    throw new Error('Generation id is required. Pass with --generation <id>.')
  }

  return options
}

function normalizeFileType(value: string | undefined): string {
  if (!value) {
    return ''
  }
  const lower = value.toLowerCase()
  if (lower.includes('ppt')) {
    return 'pptx'
  }
  if (lower.includes('pdf')) {
    return 'pdf'
  }
  return lower
}

function findPptFile(files: NormalizedFile[]): NormalizedFile | undefined {
  return files.find((file) => normalizeFileType(file.fileType) === 'pptx')
}

async function runCheck(options: CliOptions) {
  let attempts = 0
  const startedAt = Date.now()

  while (true) {
    attempts += 1
    console.log(`[GammaCheck] Attempt ${attempts} for generation ${options.generationId}`)

    const status = await gammaService.getGeneration(options.generationId)
    const files = Array.isArray(status.generatedFiles) ? status.generatedFiles : []
    const normalized: NormalizedFile[] = files.map((file) => ({
      fileType: normalizeFileType(file.fileType),
      fileUrl: file.fileUrl,
    }))
    const pptFile = findPptFile(normalized)

    console.log('[GammaCheck] Status snapshot:', {
      status: status.status,
      fileTypes: normalized.map((file) => file.fileType),
      fileCount: normalized.length,
      webAppUrl: status.webAppUrl,
      shareUrl: status.shareUrl,
    })

    if (pptFile) {
      console.log('[GammaCheck] PPT export ready:', {
        generationId: status.generationId,
        pptUrl: pptFile.fileUrl,
      })
      return
    }

    if (!options.watch) {
      console.log('[GammaCheck] PPT export not available yet. Re-run with --watch to poll until it appears.')
      process.exitCode = 1
      return
    }

    const elapsed = Date.now() - startedAt
    if (elapsed >= options.timeoutMs) {
      console.error('[GammaCheck] Timed out waiting for PPT export', {
        timeoutMs: options.timeoutMs,
        attempts,
        lastStatus: status.status,
      })
      process.exitCode = 2
      return
    }

    console.log(`[GammaCheck] Waiting ${options.intervalMs}ms before retry...`)
    await new Promise((resolve) => setTimeout(resolve, options.intervalMs))
  }
}

function printHelp() {
  console.log(`Usage: ts-node scripts/check-gamma-ppt.ts --generation <id> [options]

Options:
  -g, --generation   Gamma generation id to inspect (required)
  -w, --watch        Keep polling until a PPT export is available
  -i, --interval     Polling interval in milliseconds (default: 10000)
  -t, --timeout      Maximum time to wait in milliseconds (default: 300000)
  -h, --help         Show this help message

Examples:
  ts-node scripts/check-gamma-ppt.ts --generation abc123
  ts-node scripts/check-gamma-ppt.ts -g abc123 --watch --interval 15000 --timeout 600000
`)
}

async function main() {
  try {
    const options = parseArgs(process.argv.slice(2))
    if (!process.env.GAMMA_API_KEY) {
      console.warn('[GammaCheck] Warning: GAMMA_API_KEY is not set. Requests may fail.')
    }
    await runCheck(options)
  } catch (error) {
    console.error('[GammaCheck] Failed to check PPT export:', error instanceof Error ? error.message : error)
    console.log('Use --help for usage details.')
    process.exitCode = 1
  }
}

main()
