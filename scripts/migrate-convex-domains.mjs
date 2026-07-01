#!/usr/bin/env node
import fs from 'node:fs'
import path from 'node:path'

const CONVEX = path.join(process.cwd(), 'convex')

/** Subfolder moved under domains; root barrel .ts stays and is rewritten */
const BARREL_MODULES = [
  { domain: 'marketing', name: 'adsIntegrations' },
  { domain: 'marketing', name: 'socialIntegrations' },
  { domain: 'marketing', name: 'analyticsIntegrations' },
  { domain: 'collaboration', name: 'collaborationMessages' },
  { domain: 'collaboration', name: 'directMessages' },
]

/** Root .ts + sibling folder moved; root becomes export shim */
const ROOT_AND_FOLDER = [
  { domain: 'workspace', name: 'tasks' },
  { domain: 'workspace', name: 'projects' },
]

/** Folder-only moves; root barrel or file updated separately */
const FOLDER_ONLY = [
  { domain: 'marketing', name: 'adsCreativesActions' },
  { domain: 'platform', name: 'agentActions' },
  { domain: 'platform', name: 'migrations' },
  { domain: 'ops', name: 'workforce' },
]

const DOMAIN_FILES = {
  workspace: [
    'clients.ts',
    'projectDocumentImport.ts',
    'projectDocumentImportParsing.ts',
    'projectDocumentImportParsing.test.ts',
    'projectMilestones.ts',
    'taskAssignees.ts',
    'taskAssignees.test.ts',
    'taskComments.ts',
    'taskDocumentImport.ts',
    'taskDocumentImportParsing.ts',
    'taskDocumentImportParsing.test.ts',
    'taskDocumentImportQueries.ts',
  ],
  collaboration: [
    'collaborationChannelAvatars.ts',
    'collaborationChannels.ts',
    'collaborationTyping.ts',
    'conversationRouting.ts',
    'inboxItems.ts',
    'messageAnalytics.ts',
  ],
  marketing: [
    'adSyncWorker.ts',
    'adSyncWorkerActions.ts',
    'adsAdMetrics.ts',
    'adsAdMetrics.test.ts',
    'adsAdSets.ts',
    'adsAudiences.ts',
    'adsAudiencesMeta.ts',
    'adsCampaignGroups.ts',
    'adsCampaignInsights.ts',
    'adsCampaigns.ts',
    'adsCreatives.ts',
    'adsMetaCampaigns.ts',
    'adsMetaEvents.ts',
    'adsMetaTools.ts',
    'adsMetrics.ts',
    'adsTargeting.ts',
    'analyticsInsights.ts',
    'creativesCopy.ts',
    'customFormulas.ts',
    'metaWebhookEvents.ts',
    'socialMetrics.ts',
    'socialSyncWorkerActions.ts',
  ],
  ops: [
    'alertRules.ts',
    'gamma.ts',
    'meetingArchiveActions.ts',
    'meetingArchives.ts',
    'meetingIntegrations.ts',
    'meetings.ts',
    'notificationTargeting.ts',
    'notificationTargeting.test.ts',
    'notifications.ts',
    'presentationDeck.ts',
    'proposalAnalytics.ts',
    'proposalArchiveActions.ts',
    'proposalArchives.ts',
    'proposalGeneration.ts',
    'proposalVersions.ts',
    'proposals.ts',
    'proposals.test.ts',
    'schedulerAlertPreferences.ts',
  ],
  platform: [
    'adminFeatures.ts',
    'adminFeaturesAi.ts',
    'adminInvitations.ts',
    'adminMigrations.ts',
    'adminNotifications.ts',
    'adminUsage.ts',
    'adminUserPage.ts',
    'adminUserPage.test.ts',
    'adminUsers.ts',
    'agent.ts',
    'agentAttachments.ts',
    'agentConversations.ts',
    'agentMessages.ts',
    'apiIdempotency.ts',
    'appProxy.ts',
    'artifactArchiveBackfills.ts',
    'auditLogs.ts',
    'auth.ts',
    'authActions.ts',
    'clientAdminTeamSync.ts',
    'clientAdminTeamSync.test.ts',
    'debug.ts',
    'geminiRateLimit.ts',
    'health.ts',
    'httpActions.ts',
    'onboardingStates.ts',
    'privacyMasks.ts',
    'problemReports.ts',
    'rateLimit.ts',
    'rateLimitApi.ts',
    'schedulerEvents.ts',
    'serverCache.ts',
    'settings.ts',
    'users.ts',
    'users.test.ts',
  ],
}

function depthToConvex(relativeFilePath) {
  return relativeFilePath.split(path.sep).filter(Boolean).length - 1
}

function rewriteImports(content, depth) {
  const prefix = '../'.repeat(depth)
  let next = content
  const replacements = [
    [/from '\.\/_generated\//g, `from '${prefix}_generated/`],
    [/from "\.\/_generated\//g, `from "${prefix}_generated/`],
    [/from '\.\/functions'/g, `from '${prefix}functions'`],
    [/from "\.\/functions"/g, `from "${prefix}functions"`],
    [/from '\.\/errors'/g, `from '${prefix}errors'`],
    [/from "\.\/errors"/g, `from "${prefix}errors"`],
    [/from '\.\/lib\//g, `from '${prefix}lib/`],
    [/from "\.\/lib\//g, `from "${prefix}lib/`],
    [/from '\.\/schema'/g, `from '${prefix}schema'`],
    [/from "\.\/schema"/g, `from "${prefix}schema"`],
    [/from '\.\/r2'/g, `from '${prefix}r2'`],
    [/from "\.\/r2"/g, `from "${prefix}r2"`],
    [/from '\.\/files'/g, `from '${prefix}files'`],
    [/from "\.\/files"/g, `from "${prefix}files"`],
  ]
  for (const [pattern, replacement] of replacements) {
    next = next.replace(pattern, replacement)
  }
  return next
}

function rewriteFile(filePath) {
  const rel = path.relative(CONVEX, filePath)
  const updated = rewriteImports(fs.readFileSync(filePath, 'utf8'), depthToConvex(rel))
  fs.writeFileSync(filePath, updated)
}

function rewriteTree(dir) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name)
    if (entry.isDirectory()) {
      if (entry.name === '_generated') continue
      rewriteTree(full)
    } else if (entry.name.endsWith('.ts')) {
      rewriteFile(full)
    }
  }
}

function ensureDir(dir) {
  fs.mkdirSync(dir, { recursive: true })
}

function movePath(src, dest) {
  ensureDir(path.dirname(dest))
  fs.renameSync(src, dest)
}

function writeRootShim(baseName, domain) {
  const shimPath = path.join(CONVEX, `${baseName}.ts`)
  fs.writeFileSync(
    shimPath,
    `/** Root API shim — implementation in \`convex/domains/${domain}/${baseName}.ts\` */\nexport * from './domains/${domain}/${baseName}'\n`,
  )
}

function rewriteBarrelExports(barrelPath, domain, moduleName) {
  let content = fs.readFileSync(barrelPath, 'utf8')
  content = content.replaceAll(`'./${moduleName}/`, `'./domains/${domain}/${moduleName}/`)
  content = content.replaceAll(`"./${moduleName}/`, `"./domains/${domain}/${moduleName}/`)
  fs.writeFileSync(barrelPath, content)
}

function main() {
  ensureDir(path.join(CONVEX, 'domains'))

  for (const { domain, name } of BARREL_MODULES) {
    const srcDir = path.join(CONVEX, name)
    const destDir = path.join(CONVEX, 'domains', domain, name)
    if (fs.existsSync(srcDir)) {
      movePath(srcDir, destDir)
      rewriteTree(destDir)
    }
    const barrel = path.join(CONVEX, `${name}.ts`)
    if (fs.existsSync(barrel)) {
      rewriteBarrelExports(barrel, domain, name)
    }
  }

  for (const { domain, name } of FOLDER_ONLY) {
    const srcDir = path.join(CONVEX, name)
    const destDir = path.join(CONVEX, 'domains', domain, name)
    if (fs.existsSync(srcDir)) {
      movePath(srcDir, destDir)
      rewriteTree(destDir)
    }
    const rootFile = path.join(CONVEX, `${name}.ts`)
    if (fs.existsSync(rootFile) && name !== 'agentActions') {
      const content = fs.readFileSync(rootFile, 'utf8')
      const exportOnly = content
        .split('\n')
        .filter((line) => line.trim() && !line.trim().startsWith('//') && !line.trim().startsWith('/**'))
        .every((line) => line.trim().startsWith('export '))
      if (exportOnly && content.includes(`'./${name}/`)) {
        rewriteBarrelExports(rootFile, domain, name)
      }
    }
  }

  {
    const agentRoot = path.join(CONVEX, 'agentActions.ts')
    if (fs.existsSync(agentRoot)) {
      movePath(agentRoot, path.join(CONVEX, 'domains', 'platform', 'agentActions.ts'))
      rewriteFile(path.join(CONVEX, 'domains', 'platform', 'agentActions.ts'))
      writeRootShim('agentActions', 'platform')
    }
  }

  for (const { domain, name } of ROOT_AND_FOLDER) {
    const srcDir = path.join(CONVEX, name)
    const destDir = path.join(CONVEX, 'domains', domain, name)
    if (fs.existsSync(srcDir) && fs.statSync(srcDir).isDirectory()) {
      movePath(srcDir, destDir)
      rewriteTree(destDir)
    }
    const rootFile = path.join(CONVEX, `${name}.ts`)
    if (fs.existsSync(rootFile)) {
      movePath(rootFile, path.join(CONVEX, 'domains', domain, `${name}.ts`))
      rewriteFile(path.join(CONVEX, 'domains', domain, `${name}.ts`))
      writeRootShim(name, domain)
    }
  }

  for (const [domain, files] of Object.entries(DOMAIN_FILES)) {
    for (const file of files) {
      const src = path.join(CONVEX, file)
      if (!fs.existsSync(src)) continue
      const dest = path.join(CONVEX, 'domains', domain, file)
      movePath(src, dest)
      rewriteFile(dest)
      if (!file.includes('.test.')) {
        const base = file.replace(/\.ts$/, '')
        writeRootShim(base, domain)
      }
    }
  }

  console.log('Done. Run: bun run convex:typecheck && bun run convex:codegen (local)')
}

main()
