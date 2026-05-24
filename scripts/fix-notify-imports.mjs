#!/usr/bin/env node
import fs from 'node:fs'
import { execSync } from 'node:child_process'

const root = new URL('..', import.meta.url).pathname

const files = execSync(`rg -l "notifyFailure" src --glob '*.{ts,tsx}'`, { cwd: root, encoding: 'utf8' })
  .trim()
  .split('\n')
  .filter((f) => f && f !== 'src/lib/notifications/index.ts')

for (const rel of files) {
  const p = `${root}/${rel}`
  let c = fs.readFileSync(p, 'utf8')
  if (/import\s*\{[^}]*notifyFailure/.test(c)) continue

  if (/from ['"]@\/lib\/notifications['"]/.test(c)) {
    c = c.replace(
      /import\s*\{([^}]*)\}\s*from\s*['"]@\/lib\/notifications['"]/,
      (m, inner) => (inner.includes('notifyFailure') ? m : `import { ${inner.trim()}, notifyFailure } from '@/lib/notifications'`)
    )
  } else {
    const line = "import { notifyFailure } from '@/lib/notifications'\n"
    if (/^['"]use client['"]/.test(c)) {
      c = c.replace(/^((?:'|")use client(?:'|")\s*\n)/, `$1${line}`)
    } else {
      c = `${line}${c}`
    }
  }

  fs.writeFileSync(p, c)
  console.log('fixed', rel)
}
