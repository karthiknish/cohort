/**
 * Task Activity Email Template
 */

import { wrapEmailTemplate } from './utils'

export interface TaskActivityTemplateParams {
    taskTitle: string
    actorName: string
    action: 'commented' | 'completed' | 'updated'
    snippet?: string
    priority?: string
    status?: string
    taskUrl: string
}

export function taskActivityTemplate(params: TaskActivityTemplateParams): string {
    const { taskTitle, actorName, action, snippet, priority, status, taskUrl } = params

    const actionText = action === 'commented' ? 'added a comment to' :
        action === 'completed' ? 'marked as complete' : 'updated'

    const priorityEmoji = priority === 'high' ? '🔴' : priority === 'medium' ? '🟡' : '🟢'

    return wrapEmailTemplate(`
        <div style="margin-bottom: 24px;">
            <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 12px;">
                <div style="width: 32px; height: 32px; background: #e5e7eb; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: 700; color: #4b5563;">
                    ${actorName.charAt(0)}
                </div>
                <div style="font-size: 16px; color: #111827;">
                    <strong>${actorName}</strong> ${actionText} a task
                </div>
            </div>
            <div style="font-size: 20px; font-weight: 700; color: #111827; margin-bottom: 8px;">
                ${taskTitle}
            </div>
        </div>

        <div class="content">
            ${snippet ? `
                <div style="padding: 20px; background: #f9fafb; border-radius: 12px; border: 1px solid #f3f4f6; position: relative; font-style: italic; color: #374151; margin-bottom: 20px;">
                    "${snippet}"
                </div>
            ` : ''}

            <div style="display: flex; gap: 24px; margin-bottom: 24px; font-size: 14px;">
                ${status ? `
                    <div>
                        <div style="color: #6b7280; font-size: 12px; text-transform: uppercase;">Status</div>
                        <div style="font-weight: 600; color: #111827;">${status.charAt(0).toUpperCase() + status.slice(1)}</div>
                    </div>
                ` : ''}
                ${priority ? `
                    <div>
                        <div style="color: #6b7280; font-size: 12px; text-transform: uppercase;">Priority</div>
                        <div style="font-weight: 600; color: #111827;">${priorityEmoji} ${priority.charAt(0).toUpperCase() + priority.slice(1)}</div>
                    </div>
                ` : ''}
            </div>
        </div>

        <div style="text-align: center; margin-top: 32px;">
            <a href="${taskUrl}" class="button" style="background: #111827;">
                View Task
            </a>
        </div>
    `)
}
