#!/usr/bin/env node
import fs from 'node:fs'
import path from 'node:path'
import { execSync } from 'node:child_process'

const root = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..')

const files = execSync(
  `rg -l "variant: ['\\"]warning['\\"]" src --glob '*.{ts,tsx}'`,
  { cwd: root, encoding: 'utf8' }
)
  .trim()
  .split('\n')
  .filter(Boolean)
  .map((f) => path.join(root, f))

const warningPattern =
  /toast\(\s*\{([^}]*?)variant:\s*['"]warning['"]([^}]*?)\}\s*\)/gs

function extractField(block, field) {
  const m = block.match(new RegExp(`${field}:\\s*(['"\`])([^'"\`]+)\\1`))
  return m ? m[2] : undefined
}

let changedFiles = 0

for (const filePath of files) {
  if (filePath.includes('use-toast.ts')) continue
  let content = fs.readFileSync(filePath, 'utf8')
  const original = content

  content = content.replace(warningPattern, (match, before, after) => {
    const body = before + after
    const title = extractField(body, 'title')
    const description = extractField(body, 'description')
    const message = description ?? title ?? 'Warning'
    const titlePart = title && description ? `title: '${title.replace(/'/g, "\\'")}',\n      ` : title && !description ? `title: '${title.replace(/'/g, "\\'")}',\n      ` : ''
    const msg = (description ?? title ?? 'Warning').replace(/'/g, "\\'")
    return `notifyWarning({
      ${titlePart}message: '${msg}',
    })`
  })

  if (content !== original) {
    if (!content.includes("from '@/lib/notifications'")) {
      const importLine = "import { notifyWarning } from '@/lib/notifications'\n"
      if (content.startsWith("'use client'")) {
        content = content.replace(/^(['"]use client['"]\s*\n)/, `$1${importLine}`)
      } else {
        content = `${importLine}${content}`
      }
    } else if (!content.includes('notifyWarning')) {
      content = content.replace(
        /(import\s*\{[^}]*)(}\s*from\s*['"]@\/lib\/notifications['"])/,
        (m, a, b) => `${a}, notifyWarning${b}`
      )
    }
    fs.writeFileSync(filePath, content)
    changedFiles++
  }
}

console.log(`Migrated ${changedFiles} warning files`)
