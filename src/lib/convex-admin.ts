import { ConvexHttpClient } from 'convex/browser'

import type { AuthResult } from '@/lib/server-auth'

export type ConvexAdminClientOptions = {
  auth: AuthResult
}

function getConvexDeploymentUrl(): string | null {
  return process.env.CONVEX_URL ?? process.env.NEXT_PUBLIC_CONVEX_URL ?? null
}

function getConvexDeployKey(): string | null {
  return (
    process.env.CONVEX_DEPLOY_KEY ??
    process.env.CONVEX_ADMIN_KEY ??
    process.env.CONVEX_ADMIN_TOKEN ??
    null
  )
}

export function createConvexAdminClient({ auth }: ConvexAdminClientOptions): ConvexHttpClient | null {
  const url = getConvexDeploymentUrl()
  const deployKey = getConvexDeployKey()

  if (!url || !deployKey) {
    return null
  }

  const client = new ConvexHttpClient(url)

  // Provide an identity so Convex functions can require authentication.
  // Default to 'better-auth' since Firebase has been fully migrated.
  const provider = typeof auth.claims?.provider === 'string' ? auth.claims.provider : 'better-auth'
  const issuer = provider === 'better-auth' ? 'better-auth' : provider
  const subject = auth.uid ?? 'anonymous'

  ;(client as any).setAdminAuth(deployKey, {
    issuer,
    subject,
    email: auth.email ?? undefined,
    name: auth.name ?? undefined,
    // Preserve useful claims for future authorization.
    ...(auth.claims ? auth.claims : {}),
  })

  return client
}

export function isConvexFinanceEnabled(): boolean {
  return process.env.COHORTS_USE_CONVEX_FINANCE === 'true'
}

export function isConvexAdsEnabled(): boolean {
  return process.env.COHORTS_USE_CONVEX_ADS === 'true'
}

export function isConvexUsersEnabled(): boolean {
  return process.env.COHORTS_USE_CONVEX_USERS === 'true'
}

export function isConvexAdminEnabled(): boolean {
  return process.env.COHORTS_USE_CONVEX_ADMIN === 'true'
}

export function isConvexTasksEnabled(): boolean {
  return process.env.COHORTS_USE_CONVEX_TASKS === 'true'
}

export function isConvexClientsEnabled(): boolean {
  return process.env.COHORTS_USE_CONVEX_CLIENTS === 'true'
}

export function isConvexProjectsEnabled(): boolean {
  return process.env.COHORTS_USE_CONVEX_PROJECTS === 'true'
}

export function isConvexProposalsEnabled(): boolean {
  return process.env.COHORTS_USE_CONVEX_PROPOSALS === 'true'
}

export function isConvexAgentEnabled(): boolean {
  return process.env.COHORTS_USE_CONVEX_AGENT === 'true'
}

export function isConvexFormulasEnabled(): boolean {
  return process.env.COHORTS_USE_CONVEX_FORMULAS === 'true'
}

export function isConvexProblemReportsEnabled(): boolean {
  return process.env.COHORTS_USE_CONVEX_PROBLEM_REPORTS === 'true'
}

export function isConvexOnboardingEnabled(): boolean {
  return process.env.COHORTS_USE_CONVEX_ONBOARDING === 'true'
}

export function isConvexCollaborationEnabled(): boolean {
  return process.env.COHORTS_USE_CONVEX_COLLABORATION === 'true'
}
