import { api } from '/_generated/api'
import {
  asNonEmptyString,
  asRecord,
} from '../../helpers'
import type { OperationHandler } from '../../types'
import {
  resolveDirectMessageRecipient,
  truncateMessagePreview,
} from '../shared'

export const messagingOperationHandlers: Record<string, OperationHandler> = {
  async sendDirectMessage(ctx, input) {
    const recipientQuery = asNonEmptyString(input.params.recipientQuery)
    const content = asNonEmptyString(input.params.content)

    if (!recipientQuery) {
      return {
        success: false,
        data: { error: 'Recipient is required.' },
        userMessage: 'Who would you like me to message?',
      }
    }

    if (!content) {
      return {
        success: false,
        data: { error: 'Message content is required.' },
        userMessage: `What would you like me to send to ${recipientQuery}?`,
      }
    }

    const currentUser = await ctx.runQuery(api.users.getByLegacyId, {
      legacyId: input.userId,
    })

    const recipients = await ctx.runQuery(api.users.listDMParticipants, {
      workspaceId: input.workspaceId,
      currentUserId: input.userId,
      currentUserRole: currentUser.role ?? null,
      limit: 200,
    })

    const { match, matches } = resolveDirectMessageRecipient(recipients, recipientQuery)
    if (!match) {
      const suggestions = matches.slice(0, 5).map((recipient) => recipient.name)
      const noMatches = suggestions.length === 0

      return {
        success: false,
        retryable: false,
        data: {
          recipientQuery,
          suggestions,
        },
        userMessage: noMatches
          ? `I couldn’t find anyone matching “${recipientQuery}” to message.`
          : `I found multiple people matching “${recipientQuery}”: ${suggestions.join(', ')}. Which one should I message?`,
      }
    }

    const conversation = await ctx.runMutation(api.directMessages.getOrCreateConversation, {
      workspaceId: input.workspaceId,
      otherUserId: match.id,
      otherUserName: match.name,
      otherUserRole: match.role ?? null,
    })

    const sendResult = await ctx.runMutation(api.directMessages.sendMessage, {
      workspaceId: input.workspaceId,
      conversationLegacyId: conversation.legacyId,
      content,
    })

    return {
      success: true,
      route: '/dashboard/collaboration',
      data: {
        recipientName: match.name,
        recipientId: match.id,
        conversationLegacyId: conversation.legacyId,
        messageLegacyId: asNonEmptyString(asRecord(sendResult)?.legacyId),
        preview: truncateMessagePreview(content),
        route: '/dashboard/collaboration',
      },
      userMessage: `Sent your message to ${match.name}: “${truncateMessagePreview(content)}”`,
    }
  },
}