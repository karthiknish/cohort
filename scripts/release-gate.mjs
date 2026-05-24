#!/usr/bin/env node
/**
 * Full pre-release gate — mirrors CI static checks, tests, and production build.
 *
 * Usage:
 *   bun run release:gate
 *   bun run release:gate -- --skip-build   # faster local dry-run
 */

import { spawnSync } from 'node:child_process'

const skipBuild = process.argv.includes('--skip-build')

const steps = [
  { name: 'ci:check', command: ['bun', 'run', 'ci:check'] },
  { name: 'ci:test', command: ['bun', 'run', 'ci:test'] },
]

if (!skipBuild) {
  steps.push({ name: 'ci:build', command: ['bun', 'run', 'ci:build'] })
}

console.log('\n  Release gate')
console.log('  ────────────────────────────────────────\n')

let failed = false

for (const step of steps) {
  process.stdout.write(`  → ${step.name}\n`)
  const result = spawnSync(step.command[0], step.command.slice(1), {
    stdio: 'inherit',
    env: process.env,
  })

  if (result.status !== 0) {
    failed = true
    process.stderr.write(`\n  ✗ ${step.name} failed\n`)
    break
  }

  process.stdout.write(`  ✓ ${step.name}\n\n`)
}

if (failed) {
  process.exit(1)
}

console.log('  ✓ Release gate passed\n')
