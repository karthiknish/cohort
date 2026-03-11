/**
 * Feature service (legacy)
 *
 * This module previously used the Firebase client SDK (Firestore + Storage).
 * Admin features have moved to API routes + server-side storage.
 */

import { ServiceUnavailableError } from '@/lib/api-errors'
import type { FeatureItem, CreateFeatureInput, UpdateFeatureInput } from '@/types/features'

export async function getFeatures(): Promise<FeatureItem[]> {
  throw new ServiceUnavailableError('Feature list must be loaded via server API')
}

export async function createFeature(input: CreateFeatureInput): Promise<FeatureItem> {
  void input
  throw new ServiceUnavailableError('Feature creation must be done via server API')
}

export async function updateFeature(id: string, input: UpdateFeatureInput): Promise<void> {
  void id
  void input
  throw new ServiceUnavailableError('Feature updates must be done via server API')
}

export async function deleteFeature(id: string): Promise<void> {
  void id
  throw new ServiceUnavailableError('Feature deletion must be done via server API')
}

export async function uploadFeatureImage(): Promise<string> {
  throw new ServiceUnavailableError('Feature image upload must be done via server API')
}

export async function deleteFeatureImage(): Promise<void> {
  throw new ServiceUnavailableError('Feature image deletion must be done via server API')
}
