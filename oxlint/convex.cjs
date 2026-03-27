const { readdirSync, readFileSync } = require('node:fs')
const { extname, join, relative } = require('node:path')

function normalizePath(filePath) {
  return String(filePath || '').replace(/\\/g, '/')
}

function isIgnored(key, patterns) {
  return patterns.some((pattern) => {
    if (key === pattern) return true

    if (pattern.endsWith('.*') && !pattern.includes('*', 0)) {
      return key.startsWith(pattern.slice(0, -1))
    }

    if (pattern.includes('*') || pattern.includes('?')) {
      const regex = new RegExp(
        '^' +
          pattern
            .replace(/[.+^${}()|[\]\\]/g, '\\$&')
            .replace(/\*/g, '.*')
            .replace(/\?/g, '.') +
          '$'
      )
      return regex.test(key)
    }

    return false
  })
}

function globToRegExp(pattern) {
  const normalized = normalizePath(pattern)
  const regexSpecialChars = /[\\^$.*+?()[\]{}|]/
  let regex = '^'

  for (let i = 0; i < normalized.length; i++) {
    const char = normalized[i]
    if (char === '*') {
      if (normalized[i + 1] === '*') {
        while (normalized[i + 1] === '*') i++
        regex += '.*'
      } else {
        regex += '[^/]*'
      }
      continue
    }
    if (char === '?') {
      regex += '[^/]'
      continue
    }
    if (regexSpecialChars.test(char)) {
      regex += `\\${char}`
      continue
    }
    regex += char
  }

  regex += '$'
  return new RegExp(regex)
}

function buildGlobMatchers(patterns) {
  return patterns.map((pattern) => ({
    pattern,
    regex: globToRegExp(pattern),
    hasSlash: normalizePath(pattern).includes('/'),
  }))
}

function matchesAnyGlob(filePath, matchers) {
  if (matchers.length === 0) return false
  const normalizedPath = normalizePath(filePath)
  const baseName = normalizedPath.split('/').pop() ?? normalizedPath
  for (const matcher of matchers) {
    const target = matcher.hasSlash ? normalizedPath : baseName
    if (matcher.regex.test(target)) {
      return true
    }
  }
  return false
}

const DEFAULT_EXTENSIONS = ['.ts', '.tsx', '.js', '.jsx']
const DEFAULT_SKIP_DIRS = ['node_modules', '.git', 'dist', 'build', '.next', '.convex', '_generated']
const USAGE_ROOTS = ['api', 'internal', 'looseApi', 'generatedApi', 'convexApi']
const ROUTE_NAME_PATTERN = /\b([A-Za-z][\w.-]*):([A-Za-z_][\w]*)\b/g

function getProjectFiles(dir, extensions = DEFAULT_EXTENSIONS, skipDirs = DEFAULT_SKIP_DIRS) {
  try {
    return readdirSync(dir, { withFileTypes: true, recursive: true })
      .filter((entry) => {
        if (!entry.isFile()) return false
        if (!extensions.includes(extname(entry.name))) return false
        const fullPath = join(entry.parentPath, entry.name)
        return !skipDirs.some((skipDir) => fullPath.includes(`/${skipDir}/`))
      })
      .map((entry) => join(entry.parentPath, entry.name))
  } catch {
    return []
  }
}

function extractApiUsages(content) {
  const usages = new Set()
  for (const root of USAGE_ROOTS) {
    const pattern = new RegExp(`\\b${root.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\.([\\w.]+)`, 'g')
    let match = null
    while ((match = pattern.exec(content)) !== null) {
      usages.add(match[1])
      const parts = match[1].split('.')
      if (parts.length >= 2) {
        usages.add(`__ns__:${parts[0]}:${parts[parts.length - 1]}`)
      }
    }
  }

  let routeMatch = null
  ROUTE_NAME_PATTERN.lastIndex = 0
  while ((routeMatch = ROUTE_NAME_PATTERN.exec(content)) !== null) {
    const moduleName = routeMatch[1]
    const functionName = routeMatch[2]
    if (moduleName.includes('://')) continue
    usages.add(`${moduleName}:${functionName}`)
  }

  return usages
}

function hasRouteUsage(modulePath, functionName, usages) {
  if (usages.has(`${modulePath}.${functionName}`)) return true

  for (const usage of usages) {
    if (usage.startsWith('__ns__:')) {
      const [, namespace, usedFunctionName] = usage.split(':', 3)
      if (usedFunctionName === functionName && (modulePath === namespace || modulePath.startsWith(`${namespace}.`))) {
        return true
      }
      continue
    }

    if (!usage.includes(':')) continue
    const [prefix, usedFunctionName] = usage.split(':', 2)
    if (usedFunctionName !== functionName) continue
    if (modulePath === prefix || modulePath.startsWith(`${prefix}.`)) return true
  }

  return false
}

function getConvexModulePath(filePath) {
  const normalized = normalizePath(filePath)
  const isConvexFile =
    normalized.includes('/convex/') &&
    !normalized.includes('/convex/_generated/') &&
    !normalized.includes('node_modules')
  if (!isConvexFile) return null
  const match = normalized.match(/\/convex\/(.+)\.(ts|js|tsx|jsx)$/)
  return match ? match[1].replace(/\//g, '.') : null
}

function isConvexFunctionCall(callExpr) {
  const callArgs = callExpr.arguments
  if (callArgs.length === 0) return false

  const firstArg = callArgs[0]
  if (!firstArg || firstArg.type !== 'ObjectExpression') return false

  const properties = firstArg.properties || []
  const propertyNames = new Set()
  for (const prop of properties) {
    const p = prop
    if (p.key?.type === 'Identifier' && p.key.name) {
      propertyNames.add(p.key.name)
    }
  }

  return propertyNames.has('args') && propertyNames.has('handler')
}

let cachedUsageKey = null
let cachedUsages = null

function loadUsages(context, ignoreUsageFiles, skipDirs) {
  const nextUsageKey = JSON.stringify({ ignoreUsageFiles, skipDirs })
  if (cachedUsages && cachedUsageKey === nextUsageKey) {
    return cachedUsages
  }

  cachedUsageKey = nextUsageKey
  const ignoreUsageMatchers = buildGlobMatchers(ignoreUsageFiles)
  const nextUsages = new Set()

  for (const file of getProjectFiles(context.cwd, DEFAULT_EXTENSIONS, skipDirs)) {
    const relativePath = normalizePath(relative(context.cwd, file))
    if (matchesAnyGlob(relativePath, ignoreUsageMatchers)) continue
    try {
      const content = readFileSync(file, 'utf-8')
      extractApiUsages(content).forEach((usage) => nextUsages.add(usage))
    } catch {
      // Skip unreadable files
    }
  }

  cachedUsages = nextUsages
  return nextUsages
}

const noUnusedFunctionsRule = {
  meta: {
    type: 'problem',
    docs: {
      description: 'Disallow unused Convex functions',
    },
    messages: {
      unusedFunction:
        "Convex function '{{name}}' is defined but never used. Expected usage: api.{{moduleName}}.{{name}}",
    },
  },
  create(context) {
    const modulePath = getConvexModulePath(context.filename)
    if (!modulePath) {
      return {}
    }

    const options = (context.options && context.options[0]) || {}
    const ignorePatterns = options.ignorePatterns || []
    const ignoreUsageFiles = options.ignoreUsageFiles || []
    const skipDirs = [...DEFAULT_SKIP_DIRS, ...(options.skipDirs || [])]
    const usages = loadUsages(context, ignoreUsageFiles, skipDirs)

    if (ignorePatterns.some((pattern) => pattern === `${modulePath}.*`)) {
      return {}
    }

    return {
      ExportNamedDeclaration(node) {
        const declaration = node.declaration
        if (!declaration || declaration.type !== 'VariableDeclaration') return

        for (const declarator of declaration.declarations) {
          if (declarator.type !== 'VariableDeclarator') continue
          if (declarator.id.type !== 'Identifier') continue
          if (!declarator.init || declarator.init.type !== 'CallExpression') continue
          if (!isConvexFunctionCall(declarator.init)) continue

          const key = `${modulePath}.${declarator.id.name}`
          if (isIgnored(key, ignorePatterns)) continue

          if (!usages.has(key) && !hasRouteUsage(modulePath, declarator.id.name, usages)) {
            context.report({
              node: declarator.id,
              messageId: 'unusedFunction',
              data: { name: declarator.id.name, moduleName: modulePath },
            })
          }
        }
      },
    }
  },
}

module.exports = {
  meta: {
    name: 'convex-unused',
    version: '0.1.1',
  },
  rules: {
    'no-unused-functions': noUnusedFunctionsRule,
  },
}
