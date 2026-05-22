import type { ProposedImportTask } from './tasks-document-import-types'

export function taskNeedsAssigneeReview(task: ProposedImportTask): boolean {
  return (
    task.assignmentStatus === 'ambiguous' ||
    (task.assignmentStatus === 'unassigned' && task.suggestions.length > 0)
  )
}

export function taskNeedsDueDateReview(task: ProposedImportTask): boolean {
  return task.dueDateStatus === 'missing' || task.dueDateStatus === 'unclear'
}

export function taskNeedsImportReview(task: ProposedImportTask): boolean {
  return taskNeedsAssigneeReview(task) || taskNeedsDueDateReview(task)
}

export function needsImportReview(tasks: ProposedImportTask[]): boolean {
  return tasks.some(taskNeedsImportReview)
}

export function getImportReviewBlocker(tasks: ProposedImportTask[]): string | null {
  const selected = tasks.filter((task) => task.include && task.title.trim())
  if (selected.length === 0) {
    return 'Select at least one task to create.'
  }

  const missingAssignee = selected.filter(
    (task) => taskNeedsAssigneeReview(task) && parseAssigneeDraft(task.assignedTo).length === 0,
  )
  if (missingAssignee.length > 0) {
    return `Pick assignees for ${missingAssignee.length} task${missingAssignee.length === 1 ? '' : 's'}.`
  }

  const missingDueDate = selected.filter(
    (task) => taskNeedsDueDateReview(task) && !task.dueDate.trim(),
  )
  if (missingDueDate.length > 0) {
    return `Add due dates for ${missingDueDate.length} task${missingDueDate.length === 1 ? '' : 's'}.`
  }

  return null
}

function parseAssigneeDraft(value: string): string[] {
  const mentionRegex = /@\[([^\]]+)\]/g
  const names: string[] = []
  let match = mentionRegex.exec(value)

  while (match !== null) {
    const name = match[1]?.trim()
    if (name) names.push(name)
    match = mentionRegex.exec(value)
  }

  if (names.length === 0) {
    return value
      .split(',')
      .flatMap((entry) => {
        const trimmed = entry.trim()
        return trimmed.length > 0 ? [trimmed] : []
      })
  }

  return names
}

export function buildImportReviewDescription(
  documentSummary: string | null,
  tasks: ProposedImportTask[],
): string {
  if (documentSummary) return documentSummary

  const needsAssignees = tasks.some(taskNeedsAssigneeReview)
  const needsDueDates = tasks.some(taskNeedsDueDateReview)

  if (needsAssignees && needsDueDates) {
    return 'Some assignees and due dates need your input. Review the highlighted tasks below.'
  }

  if (needsDueDates) {
    return 'Some due dates were missing or unclear in the document. Add deadlines before creating tasks.'
  }

  return 'Some assignees need your input. Edit tasks below, then create the ones you want to keep.'
}
