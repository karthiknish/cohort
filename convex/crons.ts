import { cronJobs } from 'convex/server'

import { internal } from '/_generated/api'

const crons = cronJobs()

crons.interval('refresh-admin-usage-stats', { minutes: 10 }, internal.adminUsage.refreshStatsCache)

crons.interval('process-ad-sync-jobs', { minutes: 15 }, internal.adSyncWorkerActions.processAllQueuedJobs)

export default crons