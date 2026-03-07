import { NextResponse } from 'next/server'

import { apiError, apiSuccess, createApiHandler } from '@/lib/api-handler'
import { buildConfiguredServiceChecks, type ServiceCheck } from '@/lib/health/service-checks'
import type { AuthResult } from '@/lib/server-auth'
import { api as convexApi } from '../../../../convex/_generated/api'

export const GET = createApiHandler(
  {
    auth: 'none',
    rateLimit: 'standard'
  },
  async () => {
    const startTime = Date.now()
    const checks: Record<string, ServiceCheck> = buildConfiguredServiceChecks()

    // Check Convex connectivity
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

      const convex = createConvexAdminClient({
        auth: healthAuth,
      })

      if (!convex) {
        throw new Error('Convex admin client is not configured')
      }

      await convex.query(convexApi.health.ping, {})

      checks.convex = {
        status: 'ok',
        responseTime: Date.now() - checkStart
      }
    } catch (error) {
      checks.convex = {
        status: 'error',
        message: error instanceof Error ? error.message : 'Convex connection failed'
      }
    }

    // Note: Rate limiting is enforced via Convex; we don't separately health-check it here.

    // Check Brevo connectivity
    try {
      const checkStart = Date.now()
      if (process.env.BREVO_API_KEY) {
        const { checkBrevoHealth } = await import('@/lib/notifications/brevo')
        const healthy = await checkBrevoHealth()

        checks.brevo = {
          status: healthy ? 'ok' : 'error',
          responseTime: Date.now() - checkStart,
          message: healthy ? undefined : 'Brevo API health check failed'
        }
      }
    } catch (error) {
      checks.brevo = {
        status: 'error',
        message: error instanceof Error ? error.message : 'Brevo connection failed'
      }
    }

    // Overall health status
    const hasErrors = Object.values(checks).some(check => check.status === 'error')
    const hasWarnings = Object.values(checks).some(check => check.status === 'warning')
    const overallStatus = hasErrors ? 'unhealthy' : hasWarnings ? 'degraded' : 'healthy'

    const response = {
      status: overallStatus,
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      responseTime: Date.now() - startTime,
      checks,
      version: process.env.npm_package_version || '0.1.0'
    }

    const statusCode = overallStatus === 'unhealthy' ? 503 : 200
    const payload = overallStatus === 'healthy'
      ? apiSuccess(response)
      : { ...apiError(overallStatus === 'degraded' ? 'Service health degraded' : 'Service unavailable', 'SERVICE_UNAVAILABLE'), data: response }

    return NextResponse.json(payload, { status: statusCode })
  }
)
