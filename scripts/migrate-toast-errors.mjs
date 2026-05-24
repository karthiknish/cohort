#!/usr/bin/env node
/**
 * Migrates logError + destructive useToast patterns to reportConvexFailure.
 */
import fs from 'node:fs'
import path from 'node:path'
import { execSync } from 'node:child_process'

const root = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..')
const srcDir = path.join(root, 'src')

const files = execSync(
  `rg -l "variant: ['\\"]destructive['\\"]" src --glob '*.{ts,tsx}'`,
  { cwd: root, encoding: 'utf8' }
)
  .trim()
  .split('\n')
  .filter(Boolean)
  .map((f) => path.join(root, f))

const logErrorToastPattern =
  /logError\(\s*(\w+)\s*,\s*(['"`])([^'"`]+)\2\s*\)\s*\n\s*toast\(\s*\{([^}]*?)variant:\s*['"]destructive['"][^}]*?\}\s*\)/gs

const toastOnlyPattern =
  /toast\(\s*\{([^}]*?)description:\s*asErrorMessage\(\s*(\w+)\s*\)([^}]*?)variant:\s*['"]destructive['"]([^}]*?)\}\s*\)/gs

const toastDestructivePattern =
  /toast\(\s*\{([^{}]*(?:\{[^{}]*\}[^{}]*)*)\}\s*\)/g

function ensureImports(content, filePath) {
  let next = content
  const needsReport = next.includes('reportConvexFailure')
  const needsAsError = next.includes('asErrorMessage') && !next.includes("from '@/lib/convex-errors'")
  const hasReportImport = /from ['"]@\/lib\/handle-convex-error['"]/.test(next)
  const hasNotificationsReport = /reportConvexFailure/.test(next) && /from ['"]@\/lib\/notifications['"]/.test(next)

  if (needsReport && !hasReportImport && !hasNotificationsReport) {
    if (next.includes("from '@/lib/notifications'")) {
      next = next.replace(
        /(import\s*\{[^}]*)(}\s*from\s*['"]@\/lib\/notifications['"])/,
        (m, a, b) => (a.includes('reportConvexFailure') ? m : `${a}, reportConvexFailure${b}`)
      )
    } else {
      const importLine = "import { reportConvexFailure } from '@/lib/handle-convex-error'\n"
      const useClient = next.startsWith("'use client'") || next.startsWith('"use client"')
      if (useClient) {
        next = next.replace(/^(['"]use client['"]\s*\n)/, `$1${importLine}`)
      } else {
        next = `${importLine}${next}`
      }
    }
  }

  if (needsAsError && !next.includes("from '@/lib/convex-errors'")) {
    // only if still using asErrorMessage elsewhere
  }

  // Remove duplicate logError import usage when only used in migrated blocks - skip for safety

  // Remove logError from import if no longer used
  if (next.includes('logError') === false && next.includes("logError,")) {
    next = next.replace(/\s*logError,?\s*/g, ' ')
  }

  return next
}

function extractTitle(block) {
  const titleMatch = block.match(/title:\s*(['"`])([^'"`]+)\1/)
  return titleMatch ? titleMatch[2] : undefined
}

let changedFiles = 0

for (const filePath of files) {
  if (filePath.includes('use-toast.ts') || filePath.includes('toaster.tsx')) continue

  let content = fs.readFileSync(filePath, 'utf8')
  const original = content

  content = content.replace(logErrorToastPattern, (match, errVar, _q, context, toastBody) => {
    const title = extractTitle(toastBody)
    const titlePart = title ? `title: '${title.replace(/'/g, "\\'")}',\n        ` : ''
    const fallback = title ? `fallbackMessage: '${title.replace(/'/g, "\\'")}',\n        ` : ''
    return `reportConvexFailure({
        error: ${errVar},
        context: '${context}',
        ${titlePart}${fallback}})`
  })

  content = content.replace(toastOnlyPattern, (match, before, errVar, middle, after) => {
    const body = before + middle + after
    const title = extractTitle(body)
    const titlePart = title ? `title: '${title.replace(/'/g, "\\'")}',\n        ` : ''
    const fallback = title ? `fallbackMessage: '${title.replace(/'/g, "\\'")}',\n        ` : ''
    const context = `${path.basename(filePath)}:catch`
    return `reportConvexFailure({
        error: ${errVar},
        context: '${context}',
        ${titlePart}${fallback}})`
  })

  content = content.replace(toastDestructivePattern, (match, body) => {
    if (!body.includes("variant: 'destructive'") && !body.includes('variant: "destructive"')) {
      return match
    }
    if (body.includes('asErrorMessage')) return match
    const title = extractTitle(body)
    const descString = body.match(/description:\s*(['"`])([^'"`]+)\1/)
    const descVar = body.match(/description:\s*(\w+)/)
    const titlePart = title ? `title: '${title.replace(/'/g, "\\'")}',\n        ` : ''
    if (descString) {
      return `notifyFailure({
        ${titlePart}message: '${descString[2].replace(/'/g, "\\'")}',
      })`
    }
    if (descVar && descVar[1] !== 'asErrorMessage') {
      const v = descVar[1]
      return `notifyFailure({
        ${titlePart}message: ${v},
      })`
    }
    if (title) {
      return `notifyFailure({
        title: '${title.replace(/'/g, "\\'")}',
        message: '${title.replace(/'/g, "\\'")}',
      })`
    }
    return match
  })

  if (content !== original) {
    content = ensureImports(content, filePath)
    // Also add notifyFailure import if we used notifyFailure directly
    if (content.includes('notifyFailure') && !content.includes("from '@/lib/notifications'") && !content.includes("from '@/lib/handle-convex-error'")) {
      const importLine = "import { notifyFailure } from '@/lib/notifications'\n"
      if (content.startsWith("'use client'")) {
        content = content.replace(/^(['"]use client['"]\s*\n)/, `$1${importLine}`)
      } else {
        content = `${importLine}${content}`
      }
    }
    fs.writeFileSync(filePath, content)
    changedFiles++
  }
}

console.log(`Migrated ${changedFiles} files`)
