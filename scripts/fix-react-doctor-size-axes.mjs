#!/usr/bin/env node
/**
 * Collapse matching w-N h-N / h-N w-N Tailwind classes to size-N (react-doctor/design-no-redundant-size-axes).
 */
import fs from 'node:fs'
import path from 'node:path'

const ROOT = path.resolve(import.meta.dirname, '..')
const EXT = new Set(['.tsx', '.ts', '.jsx', '.js'])
const SKIP = new Set(['node_modules', '.next', 'dist', 'build', '.git'])

/** Tailwind dimension token (numeric, arbitrary, named). */
const TOKEN =
  '(?:\\d+(?:\\.\\d+)?|(?:\\[[^\\]]+\\])|(?:[a-z][a-z0-9]*(?:-[a-z0-9]+)*))'

function fixContent(content) {
  let next = content
  let prev
  const TAIL = '(?=\\s|"|\'|`|>|/)'
  const wThenH = new RegExp(`\\bw-(${TOKEN})\\s+h-\\1${TAIL}`, 'g')
  const hThenW = new RegExp(`\\bh-(${TOKEN})\\s+w-\\1${TAIL}`, 'g')
  const pxThenPy = new RegExp(`\\bpx-(${TOKEN})\\s+py-\\1${TAIL}`, 'g')
  const pyThenPx = new RegExp(`\\bpy-(${TOKEN})\\s+px-\\1${TAIL}`, 'g')
  do {
    prev = next
    next = next
      .replace(wThenH, 'size-$1')
      .replace(hThenW, 'size-$1')
      .replace(pxThenPy, 'p-$1')
      .replace(pyThenPx, 'p-$1')
  } while (next !== prev)
  return next
}

function walk(dir, files = []) {
  for (const name of fs.readdirSync(dir)) {
    if (SKIP.has(name)) continue
    const full = path.join(dir, name)
    const stat = fs.statSync(full)
    if (stat.isDirectory()) {
      walk(full, files)
      continue
    }
    if (EXT.has(path.extname(name))) files.push(full)
  }
  return files
}

let changedFiles = 0
let changedReplacements = 0

for (const file of walk(ROOT)) {
  if (file.includes(`${path.sep}scripts${path.sep}fix-react-doctor`)) continue
  const before = fs.readFileSync(file, 'utf8')
  const after = fixContent(before)
  if (after !== before) {
    const count = (before.match(/\bsize-/g) ?? []).length
    const countAfter = (after.match(/\bsize-/g) ?? []).length
    changedReplacements += countAfter - count
    fs.writeFileSync(file, after)
    changedFiles++
  }
}

console.log(`Updated ${changedFiles} files (${changedReplacements} new size-* tokens approx.)`)
