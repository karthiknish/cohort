import { wrapEmailTemplate } from './utils'
import { EMAIL_COLORS } from '@/lib/colors'

export interface WorkspaceInviteTemplateParams {
    invitedByName: string
    workspaceName: string
    inviteUrl: string
    role?: string
}

export function workspaceInviteTemplate(params: WorkspaceInviteTemplateParams): string {
    const { invitedByName, workspaceName, inviteUrl, role } = params

    return wrapEmailTemplate(`
        <div style="margin-bottom: 24px; text-align: center;">
            <div style="font-size: 28px; font-weight: 800; color: ${EMAIL_COLORS.heading}; margin-bottom: 12px;">
                You've been invited!
            </div>
            <div style="font-size: 16px; color: ${EMAIL_COLORS.body}; line-height: 1.6;">
                <strong>${invitedByName}</strong> has invited you to join the <strong>${workspaceName}</strong> workspace on Cohorts.
            </div>
        </div>

        <div style="background: ${EMAIL_COLORS.muted}; border-radius: 16px; padding: 24px; margin-bottom: 32px; text-align: center;">
            <div style="font-size: 14px; color: ${EMAIL_COLORS.subtle}; text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 4px;">
                Workspace
            </div>
            <div style="font-size: 20px; font-weight: 700; color: ${EMAIL_COLORS.heading}; margin-bottom: 16px;">
                ${workspaceName}
            </div>
            ${role ? `
                <div style="display: inline-block; padding: 4px 12px; background: ${EMAIL_COLORS.border}; border-radius: 9999px; font-size: 13px; font-weight: 600; color: ${EMAIL_COLORS.body};">
                    Role: ${role.charAt(0).toUpperCase() + role.slice(1)}
                </div>
            ` : ''}
        </div>

        <div style="text-align: center; margin-bottom: 32px;">
            <p style="font-size: 15px; color: ${EMAIL_COLORS.body}; margin-bottom: 24px;">
                Click the button below to accept your invitation and start collaborating.
            </p>
            <a href="${inviteUrl}" class="button" style="background: ${EMAIL_COLORS.button.primary}; font-size: 16px; padding: 14px 32px; box-shadow: 0 4px 6px -1px rgba(14, 165, 233, 0.2);">
                Accept Invitation
            </a>
        </div>

        <div style="border-top: 1px solid ${EMAIL_COLORS.border}; padding-top: 24px;">
            <p style="font-size: 13px; color: ${EMAIL_COLORS.mutedText}; line-height: 1.5;">
                If you don't want to accept this invitation, you can safely ignore this email. The link will expire in 7 days.
            </p>
            <p style="font-size: 12px; color: ${EMAIL_COLORS.disabled}; margin-top: 12px;">
                Button not working? Copy and paste this link: <br>
                <span style="word-break: break-all; color: ${EMAIL_COLORS.mutedText};">${inviteUrl}</span>
            </p>
        </div>
    `)
}
