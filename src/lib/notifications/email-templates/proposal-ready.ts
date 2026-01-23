/**
 * Proposal Ready Email Template
 */

import { wrapEmailTemplate } from './utils'

export interface ProposalReadyTemplateParams {
    proposalTitle: string
    clientName: string | null
    downloadUrl: string | null
}

export function proposalReadyTemplate(params: ProposalReadyTemplateParams): string {
    const { proposalTitle, clientName, downloadUrl } = params

    return wrapEmailTemplate(`
    <div class="header">Your Presentation is Ready</div>
    <div class="content">
      <p>Your presentation has been generated and is ready for download.</p>
      <div class="highlight">
        <strong>Title:</strong> ${proposalTitle}<br>
        ${clientName ? `<strong>Client:</strong> ${clientName}<br>` : ''}
      </div>
      ${downloadUrl ? `<a href="${downloadUrl}" class="button">Download Presentation</a>` : '<p>Access it from the Proposals section in your dashboard.</p>'}
    </div>
  `)
}
