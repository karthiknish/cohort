/**
 * Admin migration entry points (re-exported for internal.adminMigrations.* paths).
 */
export { backfillAdMetricsCurrency } from './migrations/adMetricsCurrency'
export {
  backfillClientAdminTeamMembers,
  backfillClientAdminTeamMembersInternal,
  auditClientAdminTeamMembersInternal,
  seedAdminClientTeamRolesInternal,
} from './migrations/clientAdminTeam'
export { auditTaskAssigneePoolsInternal } from './migrations/taskAssigneePools'
export { runAdminDiagnosticsInternal } from './migrations/adminDiagnostics'
