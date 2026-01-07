/**
 * Firestore Module Barrel File
 * Unified access to Firestore integration helpers
 */

// Client SDK (for browser/client-side)
export * from './client'

// Admin SDK (for server-side) - namespace import to avoid conflicts
export * as admin from './admin'
