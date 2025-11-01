import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const startTime = Date.now()
  const checks: Record<string, { status: 'ok' | 'error'; message?: string; responseTime?: number }> = {}

  // Check Firebase connectivity
  try {
    const checkStart = Date.now()
    const { adminDb } = await import('@/lib/firebase-admin')
    
    // Simple read to test Firebase connectivity
    await adminDb.collection('_health').limit(1).get()
    
    checks.firebase = {
      status: 'ok',
      responseTime: Date.now() - checkStart
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

  // Check environment variables
  const requiredEnvVars = [
    'NEXT_PUBLIC_FIREBASE_API_KEY',
    'FIREBASE_PROJECT_ID',
    'FIREBASE_CLIENT_EMAIL',
    'FIREBASE_PRIVATE_KEY'
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
  return NextResponse.json(response, { status: statusCode })
}