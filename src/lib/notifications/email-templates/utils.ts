import { EMAIL_COLORS } from '@/lib/colors'

export function wrapEmailTemplate(content: string): string {
    return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; margin: 0; padding: 0; background: linear-gradient(180deg, ${EMAIL_COLORS.canvasGlow} 0%, ${EMAIL_COLORS.background} 160px); }
    a { color: ${EMAIL_COLORS.brand.primary}; }
    .container { max-width: 640px; margin: 0 auto; padding: 32px 18px 40px; }
    .shell { border-radius: 24px; overflow: hidden; box-shadow: 0 24px 60px rgba(15, 23, 42, 0.12); }
    .brandbar { background: linear-gradient(135deg, ${EMAIL_COLORS.brand.primary} 0%, ${EMAIL_COLORS.brand.secondary} 100%); padding: 18px 28px; }
    .brandchip { display: inline-block; padding: 7px 12px; border-radius: 999px; background: rgba(255,255,255,0.12); border: 1px solid rgba(255,255,255,0.16); color: ${EMAIL_COLORS.brand.foreground}; font-size: 11px; font-weight: 700; letter-spacing: 0.24em; text-transform: uppercase; }
    .card { background: ${EMAIL_COLORS.card}; padding: 32px 28px 26px; border: 1px solid ${EMAIL_COLORS.border}; border-top: none; }
    .header { font-size: 28px; font-weight: 800; letter-spacing: -0.03em; color: ${EMAIL_COLORS.heading}; margin-bottom: 14px; }
    .content { font-size: 16px; line-height: 1.6; color: ${EMAIL_COLORS.body}; }
    .content p { margin: 0 0 16px; }
    .highlight { background: linear-gradient(180deg, ${EMAIL_COLORS.highlight} 0%, ${EMAIL_COLORS.muted} 100%); border: 1px solid ${EMAIL_COLORS.border}; border-left: 4px solid ${EMAIL_COLORS.brand.accent}; padding: 18px 18px 18px 16px; margin: 18px 0; border-radius: 18px; box-shadow: inset 0 1px 0 rgba(255,255,255,0.75); }
    .eyebrow { font-size: 11px; font-weight: 700; letter-spacing: 0.24em; text-transform: uppercase; color: ${EMAIL_COLORS.subtle}; margin-bottom: 10px; }
    .footer { margin-top: 30px; padding-top: 18px; border-top: 1px solid ${EMAIL_COLORS.border}; font-size: 13px; line-height: 1.6; color: ${EMAIL_COLORS.subtle}; }
    .button { display: inline-block; background: ${EMAIL_COLORS.button.primary}; color: ${EMAIL_COLORS.heading} !important; padding: 13px 24px; border-radius: 14px; text-decoration: none; font-size: 13px; font-weight: 700; letter-spacing: 0.18em; text-transform: uppercase; margin-top: 16px; box-shadow: 0 10px 24px rgba(15, 23, 42, 0.18); }
    .button.secondary { background: ${EMAIL_COLORS.muted}; color: ${EMAIL_COLORS.heading} !important; border: 1px solid ${EMAIL_COLORS.border}; box-shadow: none; }
    .meta { font-size: 13px; color: ${EMAIL_COLORS.subtle}; margin-top: 8px; line-height: 1.6; }
    .divider { height: 1px; background: ${EMAIL_COLORS.border}; margin: 24px 0; }
  </style>
</head>
<body>
  <div class="container">
    <div class="shell">
      <div class="brandbar">
        <span class="brandchip">Cohorts</span>
      </div>
      <div class="card">
        ${content}
        <div class="footer">
          <p>This is an automated message from Cohorts. Please do not reply directly to this email.</p>
          <p>Open your workspace to continue the action and keep your team in sync.</p>
        </div>
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
