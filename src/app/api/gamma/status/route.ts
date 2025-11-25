import { NextRequest, NextResponse } from 'next/server'

import { authenticateRequest, AuthenticationError } from '@/lib/server-auth'
import { gammaService, GAMMA_IMAGE_MODEL_CREDITS, GAMMA_RECOMMENDED_MODELS } from '@/services/gamma'

/**
 * GET /api/gamma/status
 * Check Gamma API configuration status and return available options
 */
export async function GET(request: NextRequest) {
  try {
    const auth = await authenticateRequest(request)
    if (!auth.uid) {
      throw new AuthenticationError('Authentication required', 401)
    }

    const isConfigured = gammaService.isConfigured()
    
    if (!isConfigured) {
      return NextResponse.json({
        configured: false,
        valid: false,
        error: 'GAMMA_API_KEY is not configured',
      })
    }

    // Validate the API key by making a test request
    const isValid = await gammaService.validateApiKey()

    return NextResponse.json({
      configured: true,
      valid: isValid,
      imageModels: GAMMA_IMAGE_MODEL_CREDITS,
      recommendedModels: GAMMA_RECOMMENDED_MODELS,
      formats: ['presentation', 'document', 'social', 'webpage'],
      exportFormats: ['pdf', 'pptx'],
      textModes: ['generate', 'condense', 'preserve'],
      textAmounts: ['brief', 'medium', 'detailed', 'extensive'],
      imageSources: [
        'aiGenerated',
        'pictographic',
        'unsplash',
        'giphy',
        'webAllImages',
        'webFreeToUse',
        'webFreeToUseCommercially',
        'placeholder',
        'noImages',
      ],
      presentationDimensions: ['fluid', '16x9', '4x3'],
      documentDimensions: ['fluid', 'pageless', 'letter', 'a4'],
      socialDimensions: ['1x1', '4x5', '9x16'],
    })
  } catch (error: unknown) {
    if (error instanceof AuthenticationError) {
      return NextResponse.json({ error: error.message }, { status: error.status })
    }

    console.error('[GammaStatus] GET failed', error)
    return NextResponse.json({ error: 'Failed to check Gamma status' }, { status: 500 })
  }
}
