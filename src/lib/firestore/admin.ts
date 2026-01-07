/**
 * Firestore Admin SDK Wrapper
 * Re-exports from the original firestore-integrations-admin module for backward compatibility
 */

// Re-export all admin functions from the original module
export {
    persistIntegrationTokens,
    updateIntegrationCredentials,
    enqueueSyncJob,
    getAdIntegration,
    claimNextSyncJob,
    completeSyncJob,
    failSyncJob,
    updateIntegrationStatus,
    writeMetricsBatch,
    hasPendingSyncJob,
    markIntegrationSyncRequested,
    updateIntegrationPreferences,
    deleteAdIntegration,
} from '@/lib/firestore-integrations-admin'
