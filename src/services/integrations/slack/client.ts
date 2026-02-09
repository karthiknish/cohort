/**
 * Slack API Client
 * Handles sending messages to Slack channels via incoming webhooks and chat.postMessage API
 */

import { UnifiedError } from '@/lib/errors/unified-error'

export interface SlackMessagePayload {
  channel?: string
  text: string
  blocks?: SlackBlock[]
  attachments?: SlackAttachment[]
  thread_ts?: string
  unfurl_links?: boolean
  unfurl_media?: boolean
}

export interface SlackBlock {
  type: 'header' | 'section' | 'divider' | 'image' | 'actions' | 'context'
  text?: {
    type: 'plain_text' | 'mrkdwn'
    text: string
    emoji?: boolean
  }
  fields?: Array<{
    type: 'plain_text' | 'mrkdwn'
    text: string
  }>
  accessory?: Record<string, unknown>
  elements?: Array<Record<string, unknown>>
  image_url?: string
  alt_text?: string
  title?: {
    type: 'plain_text'
    text: string
  }
}

export interface SlackAttachment {
  color?: string
  pretext?: string
  author_name?: string
  author_link?: string
  author_icon?: string
  title?: string
  title_link?: string
  text?: string
  fields?: Array<{
    title: string
    value: string
    short?: boolean
  }>
  footer?: string
  footer_icon?: string
  ts?: number
}

export interface SlackWebhookResponse {
  ok: boolean
  error?: string
}

export class SlackClient {
  private botToken?: string
  private webhookUrl?: string

  constructor(config: { botToken?: string; webhookUrl?: string }) {
    this.botToken = config.botToken
    this.webhookUrl = config.webhookUrl
  }

  /**
   * Send a message using incoming webhook (simpler, no bot needed)
   */
  async sendWebhookMessage(payload: Omit<SlackMessagePayload, 'channel'>): Promise<void> {
    if (!this.webhookUrl) {
      throw new UnifiedError({
        message: 'Slack webhook URL not configured',
        status: 400,
        code: 'SLACK_WEBHOOK_MISSING',
      })
    }

    const response = await fetch(this.webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    })

    if (!response.ok) {
      const errorText = await response.text()
      throw new UnifiedError({
        message: `Slack webhook failed: ${errorText}`,
        status: response.status,
        code: 'SLACK_WEBHOOK_ERROR',
      })
    }
  }

  /**
   * Send a message using Bot API (requires bot token)
   */
  async sendMessage(payload: SlackMessagePayload): Promise<{ ts: string; channel: string }> {
    if (!this.botToken) {
      throw new UnifiedError({
        message: 'Slack bot token not configured',
        status: 400,
        code: 'SLACK_TOKEN_MISSING',
      })
    }

    const response = await fetch('https://slack.com/api/chat.postMessage', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.botToken}`,
      },
      body: JSON.stringify(payload),
    })

    const data = await response.json()

    if (!data.ok) {
      throw new UnifiedError({
        message: `Slack API error: ${data.error}`,
        status: 400,
        code: 'SLACK_API_ERROR',
        details: { slackError: data.error },
      })
    }

    return { ts: data.ts, channel: data.channel }
  }

  /**
   * Send a notification about a new task
   */
  async sendTaskNotification(params: {
    channel: string
    taskTitle: string
    taskDescription?: string
    assignedTo?: string
    dueDate?: string
    taskUrl?: string
  }): Promise<void> {
    const blocks: SlackBlock[] = [
      {
        type: 'header',
        text: {
          type: 'plain_text',
          text: 'New Task Created',
          emoji: true,
        },
      },
      {
        type: 'section',
        text: {
          type: 'mrkdwn',
          text: `*${params.taskTitle}*`,
        },
      },
    ]

    if (params.taskDescription) {
      blocks.push({
        type: 'section',
        text: {
          type: 'mrkdwn',
          text: params.taskDescription,
        },
      })
    }

    const fields: Array<{ type: 'mrkdwn'; text: string }> = []
    
    if (params.assignedTo) {
      fields.push({
        type: 'mrkdwn',
        text: `*Assigned to:*\n${params.assignedTo}`,
      })
    }
    
    if (params.dueDate) {
      fields.push({
        type: 'mrkdwn',
        text: `*Due date:*\n${params.dueDate}`,
      })
    }

    if (fields.length > 0) {
      blocks.push({
        type: 'section',
        fields,
      })
    }

    if (params.taskUrl) {
      blocks.push({
        type: 'actions',
        elements: [
          {
            type: 'button',
            text: {
              type: 'plain_text',
              text: 'View Task',
              emoji: true,
            },
            url: params.taskUrl,
            action_id: 'view_task',
          },
        ],
      })
    }

    await this.sendMessage({
      channel: params.channel,
      text: `New task: ${params.taskTitle}`,
      blocks,
    })
  }

  /**
   * Send a collaboration message notification
   */
  async sendCollaborationNotification(params: {
    channel: string
    senderName: string
    message: string
    conversationUrl?: string
  }): Promise<void> {
    const blocks: SlackBlock[] = [
      {
        type: 'section',
        text: {
          type: 'mrkdwn',
          text: `*${params.senderName}* sent a message:`,
        },
      },
      {
        type: 'section',
        text: {
          type: 'mrkdwn',
          text: `> ${params.message}`,
        },
      },
    ]

    if (params.conversationUrl) {
      blocks.push({
        type: 'actions',
        elements: [
          {
            type: 'button',
            text: {
              type: 'plain_text',
              text: 'Reply',
              emoji: true,
            },
            url: params.conversationUrl,
            action_id: 'reply_to_message',
          },
        ],
      })
    }

    await this.sendMessage({
      channel: params.channel,
      text: `${params.senderName}: ${params.message}`,
      blocks,
    })
  }
}

export const slackClient = new SlackClient({})
