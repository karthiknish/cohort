import { cronJobs } from 'convex/server'

import { internal } from './_generated/api'

const crons = cronJobs()

crons.interval('refresh-admin-usage-stats', { minutes: 10 }, internal.adminUsage.refreshStatsCache)

export default crons