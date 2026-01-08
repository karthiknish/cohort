import { NextRequest, NextResponse } from 'next/server'
import { apiSuccess, createApiHandler } from '@/lib/api-handler'

export const GET = createApiHandler(
    {
        auth: 'required',
        adminOnly: true,
        rateLimit: 'standard'
    },
    async (_request: NextRequest) => {
        const startTime = Date.now()
        const checks: Record<string, { status: 'ok' | 'error'; message?: string; responseTime?: number; metadata?: any }> = {}

        // Check Firebase connectivity & metadata
        try {
            const checkStart = Date.now()
            const { adminDb } = await import('@/lib/firebase-admin')

            const snap = await adminDb.collection('_health').limit(1).get()

            checks.firebase = {
                status: 'ok',
                responseTime: Date.now() - checkStart,
                metadata: {
                    projectId: process.env.FIREBASE_PROJECT_ID,
                    clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
                    lastReadSuccess: !snap.empty
                }
            }
        } catch (error) {
            checks.firebase = {
                status: 'error',
                message: error instanceof Error ? error.message : 'Firebase connection failed'
            }
        }

        // Check Stripe connectivity (if configured)
        try {
            const checkStart = Date.now()
            if (process.env.STRIPE_SECRET_KEY) {
                const { getStripeClient } = await import('@/lib/stripe')
                const stripe = getStripeClient()
                const account = await stripe.accounts.retrieve()

                checks.stripe = {
                    status: 'ok',
                    responseTime: Date.now() - checkStart,
                    metadata: {
                        accountId: account.id,
                        chargesEnabled: account.charges_enabled,
                        payoutsEnabled: account.payouts_enabled,
                        businessType: account.business_type
                    }
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

        // Check Redis (Upstash) connectivity
        try {
            const checkStart = Date.now()
            const { checkDistributedRateLimit } = await import('@/lib/rate-limiter-distributed')

            // We use a small window for the health check
            await checkDistributedRateLimit('admin-health-check', { maxRequests: 10, windowMs: 1000 })

            checks.redis = {
                status: 'ok',
                responseTime: Date.now() - checkStart,
                metadata: {
                    url: process.env.UPSTASH_REDIS_REST_URL ? 'Configured' : 'Missing'
                }
            }
        } catch (error) {
            checks.redis = {
                status: 'error',
                message: error instanceof Error ? error.message : 'Redis connection failed'
            }
        }

        // Check Brevo connectivity
        try {
            const checkStart = Date.now()
            if (process.env.BREVO_API_KEY) {
                const { checkBrevoHealth } = await import('@/lib/notifications/brevo')
                const healthy = await checkBrevoHealth()

                checks.brevo = {
                    status: healthy ? 'ok' : 'error',
                    responseTime: Date.now() - checkStart,
                    message: healthy ? undefined : 'Brevo API health check failed',
                    metadata: {
                        apiKeyPresent: !!process.env.BREVO_API_KEY
                    }
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
            message: process.env.NEXT_PUBLIC_POSTHOG_KEY ? undefined : 'Missing PostHog key',
            metadata: {
                apiHost: process.env.NEXT_PUBLIC_POSTHOG_HOST || 'https://app.posthog.com'
            }
        }

        // Check Notification Health (Firestore backup)
        try {
            const { checkNotificationHealth } = await import('@/lib/notifications/health')
            const notificationHealth = await checkNotificationHealth()
            checks.notifications = {
                status: notificationHealth.firestore.healthy ? 'ok' : 'error',
                metadata: notificationHealth
            }
        } catch (error) {
            checks.notifications = {
                status: 'error',
                message: error instanceof Error ? error.message : 'Notification health check failed'
            }
        }

        // Overall health status
        const hasErrors = Object.values(checks).some(check => check.status === 'error')

        return apiSuccess({
            status: hasErrors ? 'degraded' : 'healthy',
            timestamp: new Date().toISOString(),
            uptime: process.uptime(),
            responseTime: Date.now() - startTime,
            checks,
            environment: {
                nodeEnv: process.env.NODE_ENV,
                version: process.env.npm_package_version || '0.1.0'
            }
        })
    }
)
