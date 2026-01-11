import 'dotenv/config'

import { access, mkdir, writeFile } from 'node:fs/promises'
import { dirname, resolve as resolvePath } from 'node:path'

import { gammaService } from '../src/services/gamma'
import { downloadGammaPresentation, findGammaFile } from '../src/services/gamma-utils'

type SupportedFormat = 'pptx' | 'pdf'

type CliOptions = {
  generationId: string
  format: SupportedFormat
  outputPath?: string
  watch: boolean
  intervalMs: number
  timeoutMs: number
  overwrite: boolean
}

type NormalizedFile = {
  fileType: string
  fileUrl: string
}

function parseArgs(argv: string[]): CliOptions {
  const options: CliOptions = {
    generationId: '',
    format: 'pptx',
    watch: true,
    intervalMs: 10000,
    timeoutMs: 300000,
    overwrite: false,
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
      case '--format':
      case '-f': {
        const value = argv[index + 1]
        if (!value || value.startsWith('-')) {
          throw new Error('Missing value for --format')
        }
        const normalized = value.toLowerCase()
        if (normalized !== 'pptx' && normalized !== 'pdf') {
          throw new Error('Format must be pptx or pdf')
        }
        options.format = normalized as SupportedFormat
        index += 1
        break
      }
      case '--output':
      case '-o': {
        const value = argv[index + 1]
        if (!value || value.startsWith('-')) {
          throw new Error('Missing value for --output')
        }
        options.outputPath = value
        index += 1
        break
      }
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
      case '--no-watch':
        options.watch = false
        break
      case '--overwrite':
        options.overwrite = true
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

  if (!options.generationId) {
    throw new Error('Generation id is required. Pass with --generation <id>.')
  }

  return options
}

function normalizeFiles(files: Array<{ fileType: string; fileUrl: string }>): NormalizedFile[] {
  return files.map((file) => ({
    fileType: typeof file.fileType === 'string' ? file.fileType.toLowerCase() : '',
    fileUrl: file.fileUrl,
  }))
}

async function pollForExport(options: CliOptions): Promise<NormalizedFile> {
  const startedAt = Date.now()
  let attempt = 0

  while (true) {
    attempt += 1
    console.log(`[GammaExport] Poll attempt ${attempt} for generation ${options.generationId}`)

    const status = await gammaService.getGeneration(options.generationId)
    const files = normalizeFiles(status.generatedFiles)
    const desired = await findGammaFile({ generationId: options.generationId, fileType: options.format })

    console.log('[GammaExport] Status snapshot:', {
      status: status.status,
      fileTypes: files.map((file) => file.fileType),
      webUrl: status.webAppUrl,
      shareUrl: status.shareUrl,
    })

    if (desired) {
      return { fileType: options.format, fileUrl: desired.fileUrl }
    }

    if (!options.watch) {
      throw new Error('Requested export is not available yet. Re-run with --watch to keep polling.')
    }

    const elapsed = Date.now() - startedAt
    if (elapsed >= options.timeoutMs) {
      throw new Error(`Timed out after ${attempt} polls (${elapsed}ms) waiting for ${options.format} export.`)
    }

    console.log(`[GammaExport] Waiting ${options.intervalMs}ms before retry...`)
    await new Promise((resolve) => setTimeout(resolve, options.intervalMs))
  }
}

async function ensureOutputDirectory(filePath: string): Promise<void> {
  const dir = dirname(filePath)
  await mkdir(dir, { recursive: true })
}

async function fileExists(path: string): Promise<boolean> {
  try {
    await access(path)
    return true
  } catch {
    return false
  }
}

function resolveOutputPath(options: CliOptions): string {
  const baseName = `gamma-${options.generationId}.${options.format}`
  const target = options.outputPath ?? baseName
  return resolvePath(process.cwd(), target)
}

function printHelp(): void {
  console.log(`Usage: ts-node scripts/export-gamma-generation.ts --generation <id> [options]

Options:
  -g, --generation   Gamma generation id to export (required)
  -f, --format       Export format to download (pptx|pdf, default: pptx)
  -o, --output       Output file path (default: ./gamma-<id>.<format>)
      --no-watch     Fetch status once without polling for missing exports
  -i, --interval     Polling interval in milliseconds (default: 10000)
  -t, --timeout      Maximum wait in milliseconds (default: 300000)
      --overwrite    Overwrite the output file if it already exists
  -h, --help         Show this help message
`)
}

async function main() {
  try {
    const options = parseArgs(process.argv.slice(2))

    if (!process.env.GAMMA_API_KEY) {
      throw new Error('GAMMA_API_KEY is not configured in the environment')
    }

    const exportFile = await pollForExport(options)
    const outputPath = resolveOutputPath(options)

    if (!options.overwrite && (await fileExists(outputPath))) {
      throw new Error(`Output file already exists: ${outputPath}. Pass --overwrite to replace it.`)
    }

    await ensureOutputDirectory(outputPath)

    console.log('[GammaExport] Downloading export from Gamma:', exportFile.fileUrl)
    const buffer = await downloadGammaPresentation(exportFile.fileUrl)

    await writeFile(outputPath, buffer)

    console.log('[GammaExport] Export saved to:', outputPath)
  } catch (error) {
    console.error('[GammaExport] Failed to export Gamma generation:', error instanceof Error ? error.message : error)
    console.log('Use --help for usage details.')
    process.exitCode = 1
  }
}

void main()
