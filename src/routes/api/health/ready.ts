import { createFileRoute } from '@tanstack/react-router'
import { adaptApiHandler } from '@/lib/api-handler-start'
import { ForbiddenError } from '@/lib/api-errors'
import {
  buildConfiguredServiceChecks,
  probeGoogleAdsLiveHealth,
} from '@/lib/health/service-checks'
import type { AuthResult } from '@/lib/server-auth'
import { api as convexApi } from '/_generated/api'

function isReadyProbeAuthorized(req: Request, auth: AuthResult | null): boolean {
  const secret = process.env.HEALTH_CHECK_SECRET?.trim()
  if (secret) {
    const header = req.headers.get('authorization')?.trim()
    const bearer = header?.startsWith('Bearer ') ? header.slice(7).trim() : null
    if (bearer === secret) {
      return true
    }
  }
  return auth?.claims?.role === 'admin'
}

const handlers = adaptApiHandler(
  { auth: 'optional', rateLimit: 'standard' },
  async (req, { auth }) => {
    if (!isReadyProbeAuthorized(req, auth)) {
      throw new ForbiddenError('Forbidden')
    }

    const startTime = Date.now()
    const checks: Record<string, { status: string; responseTime?: number; message?: string }> =
      buildConfiguredServiceChecks()

    try {
      const checkStart = Date.now()
      const { createConvexAdminClient } = await import('@/lib/convex-admin')
      const healthAuth: AuthResult = {
        uid: 'healthcheck',
        email: null,
        name: null,
        claims: { provider: 'system', role: 'admin' },
        isCron: true,
      }
      const convex = createConvexAdminClient({ auth: healthAuth })
      if (!convex) {
        throw new Error('Convex admin client is not configured')
      }
      await convex.query(convexApi.health.ping, {})
      checks.convex = {
        status: 'ok',
        responseTime: Date.now() - checkStart,
      }
    } catch (error) {
      checks.convex = {
        status: 'error',
        message: error instanceof Error ? error.message : 'Convex connection failed',
      }
    }

    try {
      checks.googleAdsLive = await probeGoogleAdsLiveHealth()
    } catch (error) {
      checks.googleAdsLive = {
        status: 'error',
        message: error instanceof Error ? error.message : 'Google Ads live health probe failed',
      }
    }

    try {
      const checkStart = Date.now()
      if (process.env.BREVO_API_KEY) {
        const { checkBrevoHealth } = await import('@/lib/notifications/brevo')
        const healthy = await checkBrevoHealth()
        checks.brevo = {
          status: healthy ? 'ok' : 'error',
          responseTime: Date.now() - checkStart,
          message: healthy ? undefined : 'Brevo API health check failed',
        }
      }
    } catch (error) {
      checks.brevo = {
        status: 'error',
        message: error instanceof Error ? error.message : 'Brevo connection failed',
      }
    }

    const hasErrors = Object.values(checks).some((check) => check.status === 'error')
    const hasWarnings = Object.values(checks).some((check) => check.status === 'warning')
    const overallStatus = hasErrors ? 'unhealthy' : hasWarnings ? 'degraded' : 'healthy'

    const response = {
      status: overallStatus,
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      responseTime: Date.now() - startTime,
      checks,
      version: process.env.npm_package_version || '0.1.0',
    }

    const statusCode = overallStatus === 'unhealthy' ? 503 : 200
    const { NextResponse } = await import('next/server')
    const payload =
      overallStatus === 'healthy'
        ? { success: true, data: response }
        : {
            success: false,
            error:
              overallStatus === 'degraded'
                ? 'Service health degraded'
                : 'Service unavailable',
            code: 'SERVICE_UNAVAILABLE',
            data: response,
          }
    return NextResponse.json(payload, { status: statusCode })
  },
)

export const Route = createFileRoute('/api/health/ready')({
  server: { handlers },
})
