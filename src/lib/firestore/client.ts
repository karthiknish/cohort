/**
 * Firestore Client SDK Wrapper
 * Re-exports from the original firestore-integrations module for backward compatibility
 */

// Re-export all client functions from the original module
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
} from '@/lib/firestore-integrations'
