/**
 * Invoice Payment Failed Email Template
 */

import { wrapEmailTemplate } from './utils'

export interface InvoicePaymentFailedTemplateParams {
    clientName: string
    amount: string
    invoiceNumber: string | null
    retryUrl?: string
}

export function invoicePaymentFailedTemplate(params: InvoicePaymentFailedTemplateParams): string {
    const { clientName, amount, invoiceNumber, retryUrl } = params

    return wrapEmailTemplate(`
        <div style="margin-bottom: 24px;">
            <div style="font-size: 24px; font-weight: 700; color: #dc2626; margin-bottom: 8px;">
                Payment Failed
            </div>
            <div style="font-size: 16px; color: #4b5563; line-height: 1.5;">
                We were unable to process the payment for <strong>${clientName}</strong>. 
            </div>
        </div>

        <div class="content">
            <div style="padding: 20px; background: #fef2f2; border-radius: 12px; border: 1px solid #fee2e2; margin-bottom: 24px;">
                <div style="font-size: 14px; color: #991b1b; text-transform: uppercase, letter-spacing: 0.05em; margin-bottom: 4px;">
                    Invoice Detail
                </div>
                <div style="font-size: 18px; font-weight: 700; color: #b91c1c;">
                    ${amount} ${invoiceNumber ? `· #${invoiceNumber}` : ''}
                </div>
                <div style="margin-top: 8px; font-size: 14px; color: #dc2626;">
                    The payment attempt was declined by the card issuer or failed during processing.
                </div>
            </div>

            <p style="font-size: 15px; color: #4b5563; line-height: 1.6; margin-bottom: 24px;">
                You may want to contact the client or check your Stripe dashboard for more details. If a hosted invoice page is available, you can share the link below with your client to retry the payment.
            </p>
        </div>

        <div style="text-align: center; margin-top: 32px;">
            ${retryUrl ? `
                <a href="${retryUrl}" class="button" style="background: #111827; padding: 14px 28px;">
                    View Invoice Page
                </a>
            ` : `
                <a href="https://cohorts.app/dashboard/finance" class="button" style="background: #111827; padding: 14px 28px;">
                    Go to Finance Settings
                </a>
            `}
        </div>
    `)
}
