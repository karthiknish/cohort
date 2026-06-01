#!/usr/bin/env node
/**
 * Remove redundant useCallback / useMemo / memo wrappers (react-doctor/react-compiler-no-manual-memoization).
 * Uses the TypeScript AST so nested calls and TSX are handled safely.
 *
 * Only run after `reactCompiler: true` is enabled in next.config.ts — otherwise stripping memo
 * widens types and breaks tsc. Pass --force to override the guard.
 */
import fs from 'node:fs'
import path from 'node:path'
import ts from 'typescript'

const ROOT = path.resolve(import.meta.dirname, '..')

const nextConfig = fs.readFileSync(path.join(ROOT, 'next.config.ts'), 'utf8')
const compilerEnabled = /reactCompiler:\s*true/.test(nextConfig)
if (!compilerEnabled && !process.argv.includes('--force')) {
  console.error(
    'Abort: reactCompiler is not enabled in next.config.ts.\n' +
      'Stripping useCallback/useMemo without the compiler causes type errors and extra re-renders.\n' +
      'Enable reactCompiler: true first, or pass --force if you know what you are doing.',
  )
  process.exit(1)
}
const TARGET_DIRS = [path.join(ROOT, 'src')]
const SKIP = new Set(['node_modules', '.next', 'dist', 'build', '.git'])
const EXT = new Set(['.ts', '.tsx', '.js', '.jsx'])

function getCalleeName(expression) {
  if (ts.isIdentifier(expression)) return expression.text
  if (ts.isPropertyAccessExpression(expression) && ts.isIdentifier(expression.name)) {
    return expression.name.text
  }
  return null
}

function unwrapMemoCall(node) {
  if (!ts.isCallExpression(node)) return null
  const callee = getCalleeName(node.expression)
  if (!callee || !['useCallback', 'useMemo', 'memo'].includes(callee)) return null
  if (node.arguments.length < 1) return null

  const firstArg = node.arguments[0]
  if (callee === 'useCallback' || callee === 'memo') {
    return firstArg
  }

  if (callee === 'useMemo') {
    if (!ts.isArrowFunction(firstArg) && !ts.isFunctionExpression(firstArg)) return null
    const body = firstArg.body
    if (!ts.isBlock(body)) return body
    if (body.statements.length === 1 && ts.isReturnStatement(body.statements[0])) {
      return body.statements[0].expression ?? null
    }
    // Multi-statement useMemo → IIFE (React Compiler memoizes the result).
    return ts.factory.createCallExpression(
      ts.factory.createParenthesizedExpression(firstArg),
      undefined,
      [],
    )
  }

  return null
}

const transformerFactory = (context) => {
  const visit = (node) => {
    const replacement = unwrapMemoCall(node)
    if (replacement) {
      return ts.visitEachChild(replacement, visit, context)
    }
    return ts.visitEachChild(node, visit, context)
  }

  return (sourceFile) => ts.visitNode(sourceFile, visit)
}

function cleanupReactImports(text) {
  let next = text
  for (const symbol of ['useCallback', 'useMemo', 'memo']) {
    if (new RegExp(`\\b${symbol}\\b`).test(next)) continue

    next = next.replace(
      new RegExp(
        `(import\\s*\\{[^}]*?),\\s*${symbol}\\s*([^}]*\\}\\s*from\\s*['"]react['"])`,
        'g',
      ),
      '$1$2',
    )
    next = next.replace(
      new RegExp(
        `(import\\s*\\{)\\s*${symbol}\\s*,\\s*([^}]*\\}\\s*from\\s*['"]react['"])`,
        'g',
      ),
      '$1$2',
    )
    next = next.replace(
      new RegExp(`import\\s*\\{\\s*${symbol}\\s*\\}\\s*from\\s*['"]react['"];?\\n?`, 'g'),
      '',
    )
    next = next.replace(
      new RegExp(
        `(import\\s*\\{[^}]*),\\s*${symbol}\\s*\\}\\s*from\\s*['"]react\\/jsx-runtime['"]`,
        'g',
      ),
      '$1 } from \'react/jsx-runtime\'',
    )
  }
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

function processFile(filePath) {
  const sourceText = fs.readFileSync(filePath, 'utf8')
  const scriptKind = filePath.endsWith('.tsx') ? ts.ScriptKind.TSX : ts.ScriptKind.TS
  const sourceFile = ts.createSourceFile(filePath, sourceText, ts.ScriptTarget.Latest, true, scriptKind)
  const result = ts.transform(sourceFile, [transformerFactory])
  const transformed = result.transformed[0]
  result.dispose()

  const printer = ts.createPrinter({ newLine: ts.NewLineKind.LineFeed })
  let printed = printer.printFile(transformed)
  printed = cleanupReactImports(printed)

  if (printed === sourceText) return false
  fs.writeFileSync(filePath, printed)
  return true
}

let changedFiles = 0
for (const dir of TARGET_DIRS) {
  for (const file of walk(dir)) {
    if (file.includes(`${path.sep}scripts${path.sep}fix-react-doctor-remove-manual-memo`)) continue
    if (processFile(file)) changedFiles++
  }
}

console.log(`Updated ${changedFiles} files`)
