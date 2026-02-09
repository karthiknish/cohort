/**
 * Microsoft Teams API Client
 * Handles sending messages to Teams channels via incoming webhooks and Graph API
 */

import { UnifiedError } from '@/lib/errors/unified-error'

export interface TeamsMessagePayload {
  type?: 'message'
  attachments?: TeamsAttachment[]
}

export interface TeamsAttachment {
  contentType: 'application/vnd.microsoft.card.adaptive'
  contentUrl?: string
  content: AdaptiveCard
}

export interface AdaptiveCard {
  type: 'AdaptiveCard'
  version: '1.4'
  body: Array<AdaptiveCardElement>
  actions?: Array<AdaptiveCardAction>
  $schema?: string
}

export interface AdaptiveCardElement {
  type: 'TextBlock' | 'ColumnSet' | 'Container' | 'FactSet' | 'Image'
  text?: string
  weight?: 'default' | 'lighter' | 'bolder'
  size?: 'default' | 'small' | 'medium' | 'large' | 'extraLarge'
  color?: 'default' | 'dark' | 'light' | 'accent' | 'good' | 'warning' | 'attention'
  wrap?: boolean
  columns?: Array<{
    width: string
    items: Array<AdaptiveCardElement>
  }>
  items?: Array<AdaptiveCardElement>
  facts?: Array<{
    title: string
    value: string
  }>
  spacing?: 'default' | 'none' | 'small' | 'medium' | 'large' | 'extraLarge' | 'padding'
  separator?: boolean
  url?: string
  altText?: string
  size2?: 'auto' | 'stretch' | 'small' | 'medium' | 'large'
  style?: 'default' | 'emphasis' | 'good' | 'attention' | 'warning' | 'accent'
}

export interface AdaptiveCardAction {
  type: 'Action.OpenUrl' | 'Action.Submit'
  title: string
  url?: string
  style?: 'default' | 'positive' | 'destructive'
}

export class TeamsClient {
  private webhookUrl?: string
  private accessToken?: string

  constructor(config: { webhookUrl?: string; accessToken?: string }) {
    this.webhookUrl = config.webhookUrl
    this.accessToken = config.accessToken
  }

  /**
   * Send a message using incoming webhook
   */
  async sendWebhookMessage(payload: TeamsMessagePayload): Promise<void> {
    if (!this.webhookUrl) {
      throw new UnifiedError({
        message: 'Teams webhook URL not configured',
        status: 400,
        code: 'TEAMS_WEBHOOK_MISSING',
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
        message: `Teams webhook failed: ${errorText}`,
        status: response.status,
        code: 'TEAMS_WEBHOOK_ERROR',
      })
    }
  }

  /**
   * Send a message using Graph API (requires access token)
   */
  async sendMessage(params: {
    teamId: string
    channelId: string
    message: string
  }): Promise<{ id: string }> {
    if (!this.accessToken) {
      throw new UnifiedError({
        message: 'Teams access token not configured',
        status: 400,
        code: 'TEAMS_TOKEN_MISSING',
      })
    }

    const url = `https://graph.microsoft.com/v1.0/teams/${params.teamId}/channels/${params.channelId}/messages`

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.accessToken}`,
      },
      body: JSON.stringify({
        body: {
          contentType: 'text',
          content: params.message,
        },
      }),
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      throw new UnifiedError({
        message: `Teams Graph API error: ${errorData.error?.message || response.statusText}`,
        status: response.status,
        code: 'TEAMS_API_ERROR',
        details: errorData,
      })
    }

    return response.json()
  }

  /**
   * Send a notification about a new task
   */
  async sendTaskNotification(params: {
    taskTitle: string
    taskDescription?: string
    assignedTo?: string
    dueDate?: string
    taskUrl?: string
  }): Promise<void> {
    const body: AdaptiveCardElement[] = [
      {
        type: 'TextBlock',
        text: 'New Task Created',
        weight: 'bolder',
        size: 'large',
        color: 'accent',
        wrap: true,
      },
      {
        type: 'TextBlock',
        text: params.taskTitle,
        weight: 'bolder',
        size: 'medium',
        wrap: true,
        spacing: 'medium',
      },
    ]

    if (params.taskDescription) {
      body.push({
        type: 'TextBlock',
        text: params.taskDescription,
        wrap: true,
        spacing: 'medium',
      })
    }

    const facts: Array<{ title: string; value: string }> = []
    
    if (params.assignedTo) {
      facts.push({ title: 'Assigned to:', value: params.assignedTo })
    }
    
    if (params.dueDate) {
      facts.push({ title: 'Due date:', value: params.dueDate })
    }

    if (facts.length > 0) {
      body.push({
        type: 'FactSet',
        facts,
        spacing: 'medium',
      })
    }

    const actions: AdaptiveCardAction[] = []
    
    if (params.taskUrl) {
      actions.push({
        type: 'Action.OpenUrl',
        title: 'View Task',
        url: params.taskUrl,
        style: 'positive',
      })
    }

    const card: AdaptiveCard = {
      type: 'AdaptiveCard',
      version: '1.4',
      $schema: 'http://adaptivecards.io/schemas/adaptive-card.json',
      body,
      actions: actions.length > 0 ? actions : undefined,
    }

    await this.sendWebhookMessage({
      attachments: [
        {
          contentType: 'application/vnd.microsoft.card.adaptive',
          content: card,
        },
      ],
    })
  }

  /**
   * Send a collaboration message notification
   */
  async sendCollaborationNotification(params: {
    senderName: string
    message: string
    conversationUrl?: string
  }): Promise<void> {
    const body: AdaptiveCardElement[] = [
      {
        type: 'TextBlock',
        text: `${params.senderName} sent a message:`,
        weight: 'bolder',
        size: 'medium',
        wrap: true,
      },
      {
        type: 'Container',
        items: [
          {
            type: 'TextBlock',
            text: params.message,
            wrap: true,
          },
        ],
        spacing: 'medium',
        style: 'emphasis',
      },
    ]

    const actions: AdaptiveCardAction[] = []
    
    if (params.conversationUrl) {
      actions.push({
        type: 'Action.OpenUrl',
        title: 'Reply',
        url: params.conversationUrl,
        style: 'positive',
      })
    }

    const card: AdaptiveCard = {
      type: 'AdaptiveCard',
      version: '1.4',
      $schema: 'http://adaptivecards.io/schemas/adaptive-card.json',
      body,
      actions: actions.length > 0 ? actions : undefined,
    }

    await this.sendWebhookMessage({
      attachments: [
        {
          contentType: 'application/vnd.microsoft.card.adaptive',
          content: card,
        },
      ],
    })
  }
}

export const teamsClient = new TeamsClient({})
