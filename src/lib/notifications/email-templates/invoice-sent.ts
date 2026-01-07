/**
 * Invoice Sent Email Template
 */

import { wrapEmailTemplate } from './utils'

export interface InvoiceSentTemplateParams {
    clientName: string
    amount: string
    invoiceNumber: string | null
    dueDate: string | null
    invoiceUrl: string | null
}

export function invoiceSentTemplate(params: InvoiceSentTemplateParams): string {
    const { clientName, amount, invoiceNumber, dueDate, invoiceUrl } = params

    return wrapEmailTemplate(`
    <div class="header">Invoice Sent</div>
    <div class="content">
      <p>An invoice has been successfully sent to ${clientName}.</p>
      <div class="highlight">
        <strong>Client:</strong> ${clientName}<br>
        <strong>Amount:</strong> ${amount}<br>
        ${invoiceNumber ? `<strong>Invoice #:</strong> ${invoiceNumber}<br>` : ''}
        ${dueDate ? `<strong>Due:</strong> ${dueDate}<br>` : ''}
      </div>
      ${invoiceUrl ? `<a href="${invoiceUrl}" class="button">View Invoice</a>` : ''}
    </div>
  `)
}
