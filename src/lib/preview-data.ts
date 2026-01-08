/**
 * Preview Data Module
 *
 * This file re-exports all preview data utilities and generators from the
 * modularized preview-data/ directory. This maintains backward compatibility
 * with existing imports from '@/lib/preview-data'.
 *
 * For new code, prefer importing from '@/lib/preview-data' which resolves
 * to the index.ts barrel export.
 */

// Re-export everything from the modular structure
export * from './preview-data/index'
