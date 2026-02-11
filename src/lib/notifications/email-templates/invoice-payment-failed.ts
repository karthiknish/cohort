import { wrapEmailTemplate } from './utils'
import { EMAIL_COLORS } from '@/lib/colors'

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
            <div style="font-size: 24px; font-weight: 700; color: ${EMAIL_COLORS.error.text}; margin-bottom: 8px;">
                Payment Failed
            </div>
            <div style="font-size: 16px; color: ${EMAIL_COLORS.body}; line-height: 1.5;">
                We were unable to process the payment for <strong>${clientName}</strong>. 
            </div>
        </div>

        <div class="content">
            <div style="padding: 20px; background: ${EMAIL_COLORS.error.bg}; border-radius: 12px; border: 1px solid ${EMAIL_COLORS.error.border}; margin-bottom: 24px;">
                <div style="font-size: 14px; color: ${EMAIL_COLORS.error.darkText}; text-transform: uppercase, letter-spacing: 0.05em; margin-bottom: 4px;">
                    Invoice Detail
                </div>
                <div style="font-size: 18px; font-weight: 700; color: ${EMAIL_COLORS.error.text};">
                    ${amount} ${invoiceNumber ? `· #${invoiceNumber}` : ''}
                </div>
                <div style="margin-top: 8px; font-size: 14px; color: ${EMAIL_COLORS.error.text};">
                    The payment attempt was declined by the card issuer or failed during processing.
                </div>
            </div>

            <p style="font-size: 15px; color: ${EMAIL_COLORS.body}; line-height: 1.6; margin-bottom: 24px;">
                You may want to contact the client or check your Stripe dashboard for more details. If a hosted invoice page is available, you can share the link below with your client to retry the payment.
            </p>
        </div>

        <div style="text-align: center; margin-top: 32px;">
            ${retryUrl ? `
                <a href="${retryUrl}" class="button" style="background: ${EMAIL_COLORS.button.dark}; padding: 14px 28px;">
                    View Invoice Page
                </a>
            ` : `
                <a href="https://cohorts.app/dashboard/finance" class="button" style="background: ${EMAIL_COLORS.button.dark}; padding: 14px 28px;">
                    Go to Finance Settings
                </a>
            `}
        </div>
    `)
}
