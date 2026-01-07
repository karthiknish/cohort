/**
 * Mention Email Template
 */

import { wrapEmailTemplate, escapeHtml } from './utils'

export interface MentionTemplateParams {
    mentionedBy: string
    messageSnippet: string
    channelType: string
    clientName: string | null
}

export function mentionTemplate(params: MentionTemplateParams): string {
    const { mentionedBy, messageSnippet, channelType, clientName } = params

    const channelLabel = channelType === 'client' ? 'client channel' : channelType === 'project' ? 'project channel' : 'team chat'

    return wrapEmailTemplate(`
    <div class="header">You Were Mentioned</div>
    <div class="content">
      <p><strong>${escapeHtml(mentionedBy)}</strong> mentioned you in a ${channelLabel}${clientName ? ` (${escapeHtml(clientName)})` : ''}:</p>
      <div class="highlight">
        "${escapeHtml(messageSnippet)}"
      </div>
      <p>Reply in the collaboration hub to continue the conversation.</p>
    </div>
  `)
}
