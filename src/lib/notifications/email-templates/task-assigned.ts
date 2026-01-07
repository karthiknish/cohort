/**
 * Task Assigned Email Template
 */

import { wrapEmailTemplate } from './utils'

export interface TaskAssignedTemplateParams {
    taskTitle: string
    priority: string
    dueDate: string | null
    assignedBy: string | null
    clientName: string | null
}

export function taskAssignedTemplate(params: TaskAssignedTemplateParams): string {
    const { taskTitle, priority, dueDate, assignedBy, clientName } = params

    return wrapEmailTemplate(`
    <div class="header">New Task Assigned</div>
    <div class="content">
      <p>You have been assigned a new task.</p>
      <div class="highlight">
        <strong>Task:</strong> ${taskTitle}<br>
        <strong>Priority:</strong> ${priority.charAt(0).toUpperCase() + priority.slice(1)}<br>
        ${dueDate ? `<strong>Due:</strong> ${dueDate}<br>` : ''}
        ${clientName ? `<strong>Client:</strong> ${clientName}<br>` : ''}
        ${assignedBy ? `<strong>Assigned by:</strong> ${assignedBy}<br>` : ''}
      </div>
      <p>Log in to view details and get started.</p>
    </div>
  `)
}
