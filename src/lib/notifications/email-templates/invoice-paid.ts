/**
 * Invoice Paid Email Template
 */

import { wrapEmailTemplate } from './utils'

export interface InvoicePaidTemplateParams {
    clientName: string
    amount: string
    invoiceNumber: string | null
    paidAt: string
}

export function invoicePaidTemplate(params: InvoicePaidTemplateParams): string {
    const { clientName, amount, invoiceNumber, paidAt } = params

    return wrapEmailTemplate(`
    <div class="header">Payment Received</div>
    <div class="content">
      <p>Great news! A payment has been received.</p>
      <div class="highlight">
        <strong>Client:</strong> ${clientName}<br>
        <strong>Amount:</strong> ${amount}<br>
        ${invoiceNumber ? `<strong>Invoice:</strong> #${invoiceNumber}<br>` : ''}
        <strong>Paid:</strong> ${paidAt}
      </div>
      <p>The funds will be deposited according to your Stripe payout schedule.</p>
    </div>
  `)
}
