import { NextRequest, NextResponse } from 'next/server'
import { apiError, apiSuccess, createApiHandler } from '@/lib/api-handler'

export const GET = createApiHandler(
  {
    auth: 'none',
    rateLimit: 'standard'
  },
  async (_request: NextRequest) => {
    const startTime = Date.now()
    const checks: Record<string, { status: 'ok' | 'error'; message?: string; responseTime?: number }> = {}

    // Check Convex connectivity
    try {
      const checkStart = Date.now()
      const { createConvexAdminClient } = await import('@/lib/convex-admin')

      const convex = createConvexAdminClient({
        auth: {
          uid: 'healthcheck',
          email: null,
          name: null,
          claims: { provider: 'system', role: 'admin' },
          isCron: true,
        } as any,
      })

      if (!convex) {
        throw new Error('Convex admin client is not configured')
      }

      await convex.query('health:ping' as any, {})

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

    // Check Stripe connectivity (if configured)
    try {
      const checkStart = Date.now()

      if (process.env.STRIPE_SECRET_KEY) {
        const { getStripeClient } = await import('@/lib/stripe')
        const stripe = getStripeClient()

        // Simple account check
        await stripe.accounts.retrieve()

        checks.stripe = {
          status: 'ok',
          responseTime: Date.now() - checkStart
        }
      } else {
        checks.stripe = {
          status: 'ok',
          message: 'Not configured'
        }
      }
    } catch (error) {
      checks.stripe = {
        status: 'error',
        message: error instanceof Error ? error.message : 'Stripe connection failed'
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
      } else {
        checks.brevo = {
          status: 'ok',
          message: 'Not configured'
        }
      }
    } catch (error) {
      checks.brevo = {
        status: 'error',
        message: error instanceof Error ? error.message : 'Brevo connection failed'
      }
    }

    // Check PostHog configuration
    checks.posthog = {
      status: process.env.NEXT_PUBLIC_POSTHOG_KEY ? 'ok' : 'error',
      message: process.env.NEXT_PUBLIC_POSTHOG_KEY ? undefined : 'Missing PostHog key'
    }

    // Check environment variables
    const requiredEnvVars = [
      'NEXT_PUBLIC_CONVEX_URL',
      'CONVEX_URL'
    ]

    const missingEnvVars = requiredEnvVars.filter(varName => !process.env[varName])

    checks.environment = {
      status: missingEnvVars.length === 0 ? 'ok' : 'error',
      message: missingEnvVars.length > 0 ? `Missing: ${missingEnvVars.join(', ')}` : undefined
    }

    // Overall health status
    const hasErrors = Object.values(checks).some(check => check.status === 'error')
    const overallStatus = hasErrors ? 'unhealthy' : 'healthy'

    const response = {
      status: overallStatus,
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      responseTime: Date.now() - startTime,
      checks,
      version: process.env.npm_package_version || '0.1.0'
    }

    const statusCode = overallStatus === 'healthy' ? 200 : 503
    const payload = overallStatus === 'healthy'
      ? apiSuccess(response)
      : { ...apiError('Service health degraded', 'SERVICE_UNAVAILABLE'), data: response }

    return NextResponse.json(payload, { status: statusCode })
  }
)
