import { cronJobs } from 'convex/server'

import { internal } from './_generated/api'

const crons = cronJobs()

// Every 5 minutes, recover proposals stuck in 'in_progress' for more than 10 minutes.
crons.interval('recoverStuckProposals', { minutes: 5 }, internal.proposals.recoverStuckGenerations)

export default crons
