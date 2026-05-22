import type { ProposedImportTask } from './tasks-document-import-types'
import { resolveAssigneeUserIds } from './task-types'

export function taskNeedsAssigneeReview(task: ProposedImportTask): boolean {
  if (task.assignmentStatus === 'ambiguous') return true

  if (task.documentAssigneeNames.length > 0) {
    if (task.assignmentStatus === 'unassigned') return true
    if (task.assignmentStatus === 'resolved' && task.assignedToUserIds.length === 0) return true
  }

  return task.assignmentStatus === 'resolved' &&
    task.assignedToUserIds.length === 0 &&
    task.suggestions.length > 0
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

export function buildAssigneeReviewPrompt(task: ProposedImportTask): string {
  const documentNames = task.documentAssigneeNames.join(', ')

  if (task.assignmentStatus === 'ambiguous') {
    if (task.suggestions.length > 0) {
      return documentNames
        ? `The document assigns this to “${documentNames}”, but that name matches multiple teammates. Did you mean ${task.suggestions.join(', ')}?`
        : `The assignee is unclear — did you mean ${task.suggestions.join(', ')}?`
    }

    return documentNames
      ? `The document assigns this to “${documentNames}”, but we couldn't match that name confidently. Pick the right teammate below.`
      : 'The assignee is unclear. Pick the right teammate below.'
  }

  if (task.documentAssigneeNames.length > 0) {
    if (task.suggestions.length > 0) {
      return `The document assigns this to “${documentNames}”. We found ${task.suggestions.join(', ')} but couldn't link them to a workspace profile automatically — pick the matching admin or teammate below, or leave unassigned.`
    }

    return `The document assigns this to “${documentNames}”, but that name is not linked to a workspace profile yet. Pick a teammate below or leave unassigned.`
  }

  if (task.suggestions.length > 0) {
    return `Pick a workspace teammate — suggestions: ${task.suggestions.join(', ')}.`
  }

  return 'Pick a workspace teammate from the list below.'
}

export function getImportReviewBlocker(tasks: ProposedImportTask[]): string | null {
  const selected = tasks.filter((task) => task.include && task.title.trim())
  if (selected.length === 0) {
    return 'Select at least one task to create.'
  }

  const assigneeReviewTasks = selected.filter((task) => taskNeedsAssigneeReview(task))
  if (assigneeReviewTasks.length > 0) {
    const ambiguousCount = assigneeReviewTasks.filter((task) => task.assignmentStatus === 'ambiguous').length
    const unmatchedCount = assigneeReviewTasks.length - ambiguousCount

    if (ambiguousCount > 0 && unmatchedCount > 0) {
      return `Confirm assignees for ${assigneeReviewTasks.length} tasks — some names were unclear or couldn't be matched.`
    }

    if (ambiguousCount > 0) {
      return `Confirm assignees for ${ambiguousCount} task${ambiguousCount === 1 ? '' : 's'} — the document name matched multiple teammates.`
    }

    return `Pick workspace teammates for ${assigneeReviewTasks.length} task${assigneeReviewTasks.length === 1 ? '' : 's'}.`
  }

  const invalidAssignee = selected.filter((task) => {
    const mentionCount = task.assignedTo.trim().length > 0 ? task.assignedTo.match(/@\[[^\]]+\]/g)?.length ?? 0 : 0
    if (mentionCount === 0) return false
    return task.assignedToUserIds.length !== mentionCount
  })
  if (invalidAssignee.length > 0) {
    return `Use the teammate picker for ${invalidAssignee.length} task${invalidAssignee.length === 1 ? '' : 's'} — free-text assignees are not allowed.`
  }

  const missingDueDate = selected.filter(
    (task) => taskNeedsDueDateReview(task) && !task.dueDate.trim(),
  )
  if (missingDueDate.length > 0) {
    return `Add due dates for ${missingDueDate.length} task${missingDueDate.length === 1 ? '' : 's'}.`
  }

  return null
}

export function buildImportReviewDescription(
  documentSummary: string | null,
  tasks: ProposedImportTask[],
): string {
  if (documentSummary) return documentSummary

  const needsAssignees = tasks.some(taskNeedsAssigneeReview)
  const needsDueDates = tasks.some(taskNeedsDueDateReview)

  if (needsAssignees && needsDueDates) {
    return 'Some assignees and due dates need clarification. Confirm teammates and deadlines below before creating tasks.'
  }

  if (needsDueDates) {
    return 'Some due dates were missing or unclear in the document. Add deadlines before creating tasks.'
  }

  return 'Some assignees were unclear or could not be matched to workspace members. Confirm who each task belongs to below.'
}

export function resolveImportAssigneeUserIds(
  value: string,
  participants: Parameters<typeof resolveAssigneeUserIds>[1],
): string[] {
  return resolveAssigneeUserIds(value, participants)
}
