/**
 * Project Created Email Template
 */

import { wrapEmailTemplate } from './utils'

export interface ProjectCreatedTemplateParams {
    projectName: string
    clientName: string | null
    createdBy: string | null
}

export function projectCreatedTemplate(params: ProjectCreatedTemplateParams): string {
    const { projectName, clientName, createdBy } = params

    return wrapEmailTemplate(`
    <div class="header">New Project Created</div>
    <div class="content">
      <p>A new project has been created in your workspace.</p>
      <div class="highlight">
        <strong>Project:</strong> ${projectName}<br>
        ${clientName ? `<strong>Client:</strong> ${clientName}<br>` : ''}
        ${createdBy ? `<strong>Created by:</strong> ${createdBy}<br>` : ''}
      </div>
      <p>Head over to the dashboard to view project details and start collaborating.</p>
    </div>
  `)
}
