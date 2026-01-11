import { httpAction } from './_generated/server'
import { api } from './_generated/api'

const convexApi = api as any

function jsonResponse(payload: unknown, status = 200): Response {
  return new Response(JSON.stringify(payload), {
    status,
    headers: { 'content-type': 'application/json' },
  })
}

function getHeader(request: Request, name: string): string | null {
  const value = request.headers.get(name)
  return typeof value === 'string' && value.length > 0 ? value : null
}

function coerceNumber(value: unknown): number | null {
  if (typeof value === 'number' && Number.isFinite(value)) return value
  if (typeof value === 'string' && value.trim().length > 0) {
    const parsed = Number(value)
    return Number.isFinite(parsed) ? parsed : null
  }
  return null
}

export const run = httpAction(async (ctx, request) => {
  if (request.method !== 'POST') {
    return jsonResponse({ error: 'Method not allowed' }, 405)
  }

  const cronSecret = process.env.INTEGRATIONS_CRON_SECRET
  if (!cronSecret) {
    return jsonResponse({ error: 'Server configuration error' }, 503)
  }

  const provided = getHeader(request, 'x-cron-key')
  if (provided !== cronSecret) {
    return jsonResponse({ error: 'Unauthorized' }, 401)
  }

  const body = (await request.json().catch(() => null)) as any
  const workspaceId = typeof body?.workspaceId === 'string' ? body.workspaceId : null

  if (!workspaceId) {
    return jsonResponse({ error: 'Missing workspaceId' }, 400)
  }

  const maxJobs = Math.min(coerceNumber(body?.maxJobs) ?? 10, 25)

  let processedJobs = 0
  let successfulJobs = 0
  let failedJobs = 0
  const jobResults: Array<{ jobId: string; providerId: string; status: string; error?: string }> = []

  for (let i = 0; i < maxJobs; i++) {
    const job = await ctx.runMutation(convexApi.adsIntegrations.claimNextSyncJob, {
      workspaceId,
      cronKey: cronSecret,
    })

    if (!job) {
      break
    }

    processedJobs++

    try {
      await ctx.runAction(convexApi.adSyncWorkerActions.processClaimedJob, {
        workspaceId,
        jobId: job.id,
        providerId: job.providerId,
        clientId: job.clientId,
        timeframeDays: job.timeframeDays,
        cronKey: cronSecret,
      })

      successfulJobs++
      jobResults.push({ jobId: job.id, providerId: job.providerId, status: 'success' })

      await ctx.runMutation(convexApi.adsIntegrations.completeSyncJob, {
        jobId: job.id,
        cronKey: cronSecret,
      })

      await ctx.runMutation(convexApi.adsIntegrations.updateIntegrationStatus, {
        workspaceId,
        providerId: job.providerId,
        clientId: job.clientId,
        status: 'success',
        message: null,
        cronKey: cronSecret,
      })
    } catch (err: unknown) {
      failedJobs++
      const message = err instanceof Error ? err.message : 'Unknown error'
      jobResults.push({ jobId: job.id, providerId: job.providerId, status: 'error', error: message })

      await ctx.runMutation(convexApi.adsIntegrations.failSyncJob, {
        jobId: job.id,
        message,
        cronKey: cronSecret,
      })

      await ctx.runMutation(convexApi.adsIntegrations.updateIntegrationStatus, {
        workspaceId,
        providerId: job.providerId,
        clientId: job.clientId,
        status: 'error',
        message,
        cronKey: cronSecret,
      })
    }
  }

  return jsonResponse({
    processedJobs,
    successfulJobs,
    failedJobs,
    jobResults: jobResults.slice(0, 20),
    timestamp: new Date().toISOString(),
  })
})
