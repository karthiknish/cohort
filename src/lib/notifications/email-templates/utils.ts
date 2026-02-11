import { EMAIL_COLORS } from '@/lib/colors'

export function wrapEmailTemplate(content: string): string {
    return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; margin: 0; padding: 0; background: ${EMAIL_COLORS.background}; }
    .container { max-width: 600px; margin: 0 auto; padding: 40px 20px; }
    .card { background: ${EMAIL_COLORS.card}; border-radius: 12px; padding: 32px; box-shadow: 0 2px 8px rgba(0,0,0,0.08); }
    .header { font-size: 24px; font-weight: 600; color: ${EMAIL_COLORS.heading}; margin-bottom: 16px; }
    .content { font-size: 16px; line-height: 1.6; color: ${EMAIL_COLORS.body}; }
    .highlight { background: ${EMAIL_COLORS.highlight}; border-left: 4px solid ${EMAIL_COLORS.button.primary}; padding: 16px; margin: 16px 0; border-radius: 0 8px 8px 0; }
    .footer { margin-top: 32px; padding-top: 16px; border-top: 1px solid ${EMAIL_COLORS.border}; font-size: 14px; color: ${EMAIL_COLORS.subtle}; }
    .button { display: inline-block; background: ${EMAIL_COLORS.button.primary}; color: #ffffff; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: 500; margin-top: 16px; }
    .meta { font-size: 14px; color: ${EMAIL_COLORS.subtle}; margin-top: 8px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="card">
      ${content}
      <div class="footer">
        <p>This is an automated message from Cohorts. Please do not reply directly to this email.</p>
      </div>
    </div>
  </div>
</body>
</html>
  `.trim()
}

export function escapeHtml(text: string): string {
    return text
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;')
}
