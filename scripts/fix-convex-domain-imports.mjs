#!/usr/bin/env node
/**
 * Second pass after migrate-convex-domains.mjs — fix relative import depths and
 * cross-module paths that still assume files live at convex root.
 */
import fs from 'node:fs'
import path from 'node:path'

const CONVEX = path.join(process.cwd(), 'convex')

const CONVEX_ROOT_TARGETS = new Set([
  'errors',
  'functions',
  'lib',
  'schema',
  'r2',
  'files',
  '_generated',
  'src',
])

/**
 * Modules reachable via convex root shims. Do NOT include names that are also
 * local subfolders (e.g. `tasks/` under `domains/workspace/`).
 */
const ROOT_SHIM_IMPORTS = new Set([
  'deepseekRateLimit',
  'notificationTargeting',
  'clientAdminTeamSync',
  'taskDocumentImportParsing',
  'taskAssignees',
  'betterAuth',
  'adsIntegrations',
  'socialIntegrations',
  'analyticsIntegrations',
  'collaborationMessages',
  'directMessages',
  'proposals',
  'notifications',
])

function dirDepthFromConvex(filePath) {
  const rel = path.relative(CONVEX, filePath)
  return path.dirname(rel).split(path.sep).filter(Boolean).length
}

function prefixes(depth) {
  return {
    root: '../'.repeat(depth),
    src: '../'.repeat(depth + 1),
  }
}

function fixImportPath(importPath, depth) {
  if (importPath.startsWith('@/') || importPath.startsWith('/_generated')) {
    return importPath
  }
  if (!importPath.startsWith('.')) return importPath

  const { root, src } = prefixes(depth)

  if (importPath.startsWith('./')) {
    const rest = importPath.slice(2)
    const head = rest.split('/')[0]
    if (ROOT_SHIM_IMPORTS.has(head)) {
      return `${root}${rest}`
    }
    return importPath
  }

  const ups = (importPath.match(/\.\.\//g) || []).length
  const rest = importPath.replace(/^(\.\.\/)+/, '')

  if (rest.startsWith('src/')) {
    return `${src}${rest}`
  }

  if (CONVEX_ROOT_TARGETS.has(rest.split('/')[0])) {
    return `${root}${rest}`
  }

  if (ups !== depth) {
    return `${root}${rest}`
  }

  return importPath
}

function fixFileContent(content, depth) {
  let next = content

  next = next.replace(
    /from\s+(['"])(\.[^'"]+)\1/g,
    (_, quote, spec) => `from ${quote}${fixImportPath(spec, depth)}${quote}`,
  )

  next = next.replace(
    /import\s*\(\s*(['"])(\.[^'"]+)\1\s*\)/g,
    (_, quote, spec) => `import(${quote}${fixImportPath(spec, depth)}${quote})`,
  )

  return next
}

function ensureModuleExports(filePath) {
  const content = fs.readFileSync(filePath, 'utf8')
  if (!content.includes('export ')) {
    fs.writeFileSync(filePath, `${content.trimEnd()}\n\nexport {}\n`)
  }
}

function walk(dir, fn) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name)
    if (entry.isDirectory()) {
      if (entry.name === '_generated') continue
      walk(full, fn)
    } else if (entry.name.endsWith('.ts')) {
      fn(full)
    }
  }
}

function main() {
  const domainsDir = path.join(CONVEX, 'domains')
  if (!fs.existsSync(domainsDir)) {
    console.error('convex/domains not found — run migrate-convex-domains.mjs first')
    process.exit(1)
  }

  walk(domainsDir, (filePath) => {
    const depth = dirDepthFromConvex(filePath)
    const before = fs.readFileSync(filePath, 'utf8')
    const after = fixFileContent(before, depth)
    if (after !== before) {
      fs.writeFileSync(filePath, after)
    }
  })

  for (const rel of [
    'domains/collaboration/conversationRouting.ts',
    'domains/collaboration/inboxItems.ts',
    'domains/collaboration/messageAnalytics.ts',
  ]) {
    ensureModuleExports(path.join(CONVEX, rel))
  }

  console.log('Import fix complete. Run: bun run convex:typecheck')
}

main()
