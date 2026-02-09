/**
 * WhatsApp Business API Client
 * Handles sending messages via WhatsApp Business API (Meta)
 */

import { UnifiedError } from '@/lib/errors/unified-error'

export interface WhatsAppTemplateComponent {
  type: 'header' | 'body' | 'button'
  parameters: Array<{
    type: 'text' | 'currency' | 'date_time' | 'image' | 'document'
    text?: string
    currency?: {
      fallback_value: string
      code: string
      amount_1000: number
    }
    date_time?: {
      fallback_value: string
    }
    image?: {
      link: string
    }
    document?: {
      link: string
      filename: string
    }
  }>
}

export interface WhatsAppMessagePayload {
  messaging_product: 'whatsapp'
  recipient_type: 'individual'
  to: string
  type: 'text' | 'template' | 'image' | 'document'
  text?: {
    body: string
    preview_url?: boolean
  }
  template?: {
    name: string
    language: {
      code: string
    }
    components?: WhatsAppTemplateComponent[]
  }
}

export interface WhatsAppMessageResponse {
  messaging_product: 'whatsapp'
  contacts: Array<{
    input: string
    wa_id: string
  }>
  messages: Array<{
    id: string
  }>
}

export class WhatsAppClient {
  private accessToken?: string
  private phoneNumberId?: string
  private apiVersion: string

  constructor(config: {
    accessToken?: string
    phoneNumberId?: string
    apiVersion?: string
  }) {
    this.accessToken = config.accessToken
    this.phoneNumberId = config.phoneNumberId
    this.apiVersion = config.apiVersion || 'v18.0'
  }

  /**
   * Send a text message
   */
  async sendMessage(params: {
    to: string
    text: string
    previewUrl?: boolean
  }): Promise<WhatsAppMessageResponse> {
    if (!this.accessToken || !this.phoneNumberId) {
      throw new UnifiedError({
        message: 'WhatsApp credentials not configured',
        status: 400,
        code: 'WHATSAPP_CREDENTIALS_MISSING',
      })
    }

    // Format phone number (remove + and spaces)
    const formattedPhone = params.to.replace(/[\s+]/g, '')

    const url = `https://graph.facebook.com/${this.apiVersion}/${this.phoneNumberId}/messages`

    const payload: WhatsAppMessagePayload = {
      messaging_product: 'whatsapp',
      recipient_type: 'individual',
      to: formattedPhone,
      type: 'text',
      text: {
        body: params.text,
        preview_url: params.previewUrl ?? true,
      },
    }

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.accessToken}`,
      },
      body: JSON.stringify(payload),
    })

    const data = await response.json()

    if (!response.ok) {
      throw new UnifiedError({
        message: `WhatsApp API error: ${data.error?.message || response.statusText}`,
        status: response.status,
        code: 'WHATSAPP_API_ERROR',
        details: data.error,
      })
    }

    return data
  }

  /**
   * Send a template message (for pre-approved templates)
   */
  async sendTemplateMessage(params: {
    to: string
    templateName: string
    languageCode?: string
    components?: WhatsAppTemplateComponent[]
  }): Promise<WhatsAppMessageResponse> {
    if (!this.accessToken || !this.phoneNumberId) {
      throw new UnifiedError({
        message: 'WhatsApp credentials not configured',
        status: 400,
        code: 'WHATSAPP_CREDENTIALS_MISSING',
      })
    }

    const formattedPhone = params.to.replace(/[\s+]/g, '')
    const url = `https://graph.facebook.com/${this.apiVersion}/${this.phoneNumberId}/messages`

    const payload: WhatsAppMessagePayload = {
      messaging_product: 'whatsapp',
      recipient_type: 'individual',
      to: formattedPhone,
      type: 'template',
      template: {
        name: params.templateName,
        language: {
          code: params.languageCode || 'en',
        },
        components: params.components,
      },
    }

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.accessToken}`,
      },
      body: JSON.stringify(payload),
    })

    const data = await response.json()

    if (!response.ok) {
      throw new UnifiedError({
        message: `WhatsApp API error: ${data.error?.message || response.statusText}`,
        status: response.status,
        code: 'WHATSAPP_API_ERROR',
        details: data.error,
      })
    }

    return data
  }

  /**
   * Send a task notification
   */
  async sendTaskNotification(params: {
    to: string
    taskTitle: string
    taskDescription?: string
    assignedTo?: string
    dueDate?: string
  }): Promise<WhatsAppMessageResponse> {
    let message = `📋 *New Task: ${params.taskTitle}*`

    if (params.taskDescription) {
      message += `\n\n${params.taskDescription}`
    }

    const details: string[] = []
    
    if (params.assignedTo) {
      details.push(`👤 Assigned to: ${params.assignedTo}`)
    }
    
    if (params.dueDate) {
      details.push(`📅 Due: ${params.dueDate}`)
    }

    if (details.length > 0) {
      message += `\n\n${details.join('\n')}`
    }

    return this.sendMessage({
      to: params.to,
      text: message,
    })
  }

  /**
   * Send a collaboration message notification
   */
  async sendCollaborationNotification(params: {
    to: string
    senderName: string
    message: string
  }): Promise<WhatsAppMessageResponse> {
    const text = `💬 *${params.senderName}* sent a message:\n\n${params.message}`

    return this.sendMessage({
      to: params.to,
      text,
    })
  }
}

export const whatsappClient = new WhatsAppClient({})
