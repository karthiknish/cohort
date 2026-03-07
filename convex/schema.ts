import { defineSchema } from 'convex/server'

import { collaborationTables } from './schema/collaborationTables'
import { marketingTables } from './schema/marketingTables'
import { opsTables } from './schema/opsTables'
import { systemTables } from './schema/systemTables'
import { workspaceTables } from './schema/workspaceTables'

export default defineSchema({
  ...systemTables,
  ...workspaceTables,
  ...marketingTables,
  ...collaborationTables,
  ...opsTables,
})
