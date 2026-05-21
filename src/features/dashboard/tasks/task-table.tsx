/** Display key for a task row (Jira-style). */
export function formatTaskKey(taskId: string): string {
  const compact = taskId.replace(/[^a-zA-Z0-9]/g, '')
  if (compact.length <= 6) return `TASK-${compact.toUpperCase() || '1'}`
  const tail = compact.slice(-5).toUpperCase()
  const head = compact.slice(0, 2).toUpperCase()
  return `TASK-${head}${tail}`
}
