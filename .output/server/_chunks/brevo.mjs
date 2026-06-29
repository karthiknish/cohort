import { o as __toESM, r as __exportAll } from "../_runtime.mjs";
import { h as ConvexHttpClient, x as require_react } from "../_libs/@convex-dev/better-auth+[...].mjs";
import { t as require_api } from "../_libs/@getbrevo/brevo+[...].mjs";
import { t as instantiateDateTimeFormat } from "./create-international-format.mjs";
import { n as internal } from "./api.mjs";
import { c as sleep, n as calculateBackoffDelay$1 } from "./retry-utils.mjs";
import { o as isEmailPrefEnabled } from "./preferences.mjs";
import { n as EMAIL_COLORS } from "./colors.mjs";
//#region src/lib/notifications/config.ts
var import_react = /* @__PURE__ */ __toESM(require_react(), 1);
var import_api = /* @__PURE__ */ __toESM(require_api(), 1);
process.env.CONTACT_EMAIL_WEBHOOK_URL;
var RETRY_CONFIG = {
	maxRetries: 3,
	baseDelayMs: 1e3,
	maxDelayMs: 3e4,
	requestTimeoutMs: 1e4
};
/**
* Calculate exponential backoff delay with decorrelated jitter
*/
function calculateBackoffDelay(attempt) {
	return calculateBackoffDelay$1(attempt, {
		maxRetries: RETRY_CONFIG.maxRetries,
		baseDelayMs: RETRY_CONFIG.baseDelayMs,
		maxDelayMs: RETRY_CONFIG.maxDelayMs,
		jitterFactor: 1
	});
}
//#endregion
//#region src/lib/notifications/email-templates/utils.ts
function wrapEmailTemplate(content) {
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
  `.trim();
}
function escapeHtml(text) {
	return text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#039;");
}
//#endregion
//#region src/lib/intl/meeting-email-formatters.ts
var MEETING_EMAIL_DATE_FORMATTERS = /* @__PURE__ */ new Map();
var MEETING_EMAIL_TIME_FORMATTERS = /* @__PURE__ */ new Map();
function getMeetingEmailDateFormatter(timezone) {
	const existingFormatter = MEETING_EMAIL_DATE_FORMATTERS.get(timezone);
	if (existingFormatter) return existingFormatter;
	const formatter = instantiateDateTimeFormat("en-US", {
		dateStyle: "full",
		timeZone: timezone
	});
	MEETING_EMAIL_DATE_FORMATTERS.set(timezone, formatter);
	return formatter;
}
function getMeetingEmailTimeFormatter(timezone) {
	const existingFormatter = MEETING_EMAIL_TIME_FORMATTERS.get(timezone);
	if (existingFormatter) return existingFormatter;
	const formatter = instantiateDateTimeFormat("en-US", {
		timeStyle: "short",
		timeZone: timezone
	});
	MEETING_EMAIL_TIME_FORMATTERS.set(timezone, formatter);
	return formatter;
}
//#endregion
//#region src/lib/notifications/email-templates/meeting-cancelled.ts
/**
* Meeting Cancelled Email Template
*/
function formatMeetingTime$2(startIso, timezone) {
	try {
		const start = new Date(startIso);
		return `${getMeetingEmailDateFormatter(timezone).format(start)} at ${getMeetingEmailTimeFormatter(timezone).format(start)}`;
	} catch {
		return startIso;
	}
}
function meetingCancelledTemplate(params) {
	const { meetingTitle, meetingStartIso, meetingTimezone, cancelledBy, cancellationReason } = params;
	const safeTitle = escapeHtml(meetingTitle);
	const safeTimezone = escapeHtml(meetingTimezone);
	const safeCancelledBy = escapeHtml(cancelledBy);
	const formattedTime = formatMeetingTime$2(meetingStartIso, meetingTimezone);
	const safeReason = typeof cancellationReason === "string" && cancellationReason.trim().length > 0 ? escapeHtml(cancellationReason.trim()) : null;
	return wrapEmailTemplate(`
    <div class="header">Cohorts Meeting Cancelled</div>
    <div class="content">
      <p>This meeting has been cancelled.</p>
      <div class="highlight">
        <strong>Title:</strong> ${safeTitle}<br>
        <strong>Scheduled for:</strong> ${formattedTime}<br>
        <strong>Timezone:</strong> ${safeTimezone}<br>
        <strong>Cancelled by:</strong> ${safeCancelledBy}
      </div>
      ${safeReason ? `<p><strong>Reason:</strong> ${safeReason}</p>` : ""}
      <p class="meta">No action is needed unless a replacement invite is sent.</p>
    </div>
  `);
}
//#endregion
//#region src/lib/notifications/email-templates/meeting-rescheduled.ts
/**
* Meeting Rescheduled Email Template
*/
function formatMeetingTime$1(startIso, endIso, timezone) {
	try {
		const start = new Date(startIso);
		const dateLabel = getMeetingEmailDateFormatter(timezone).format(start);
		const startLabel = getMeetingEmailTimeFormatter(timezone).format(start);
		if (!endIso) return `${dateLabel} at ${startLabel}`;
		const end = new Date(endIso);
		return `${dateLabel} at ${startLabel} - ${getMeetingEmailTimeFormatter(timezone).format(end)}`;
	} catch {
		return startIso;
	}
}
function meetingRescheduledTemplate(params) {
	const { meetingTitle, previousMeetingStartIso, newMeetingStartIso, newMeetingEndIso, meetingTimezone, organizerName, meetLink, inSiteJoinUrl } = params;
	const safeTitle = escapeHtml(meetingTitle);
	const safeTimezone = escapeHtml(meetingTimezone);
	const safeOrganizer = escapeHtml(organizerName);
	return wrapEmailTemplate(`
    <div class="header">Cohorts Meeting Rescheduled</div>
    <div class="content">
      <p>The meeting schedule has been updated.</p>
      <div class="highlight">
        <strong>Title:</strong> ${safeTitle}<br>
        <strong>Previously:</strong> ${formatMeetingTime$1(previousMeetingStartIso, null, meetingTimezone)}<br>
        <strong>Now:</strong> ${formatMeetingTime$1(newMeetingStartIso, newMeetingEndIso, meetingTimezone)}<br>
        <strong>Timezone:</strong> ${safeTimezone}<br>
        <strong>Updated by:</strong> ${safeOrganizer}
      </div>
      ${meetLink ? `<a class="button" href="${meetLink}">Open Updated Room</a>` : ""}
      ${inSiteJoinUrl ? `<p class="meta">In-app room: <a href="${inSiteJoinUrl}">${inSiteJoinUrl}</a></p>` : ""}
      <p class="meta">Please update your calendar reminders.</p>
    </div>
  `);
}
//#endregion
//#region src/lib/notifications/email-templates/meeting-scheduled.ts
/**
* Meeting Scheduled Email Template
*/
function formatMeetingTime(startIso, endIso, timezone) {
	try {
		const start = new Date(startIso);
		const dateLabel = getMeetingEmailDateFormatter(timezone).format(start);
		const startLabel = getMeetingEmailTimeFormatter(timezone).format(start);
		if (!endIso) return `${dateLabel} at ${startLabel}`;
		const end = new Date(endIso);
		return `${dateLabel} at ${startLabel} - ${getMeetingEmailTimeFormatter(timezone).format(end)}`;
	} catch {
		return startIso;
	}
}
function meetingScheduledTemplate(params) {
	const { meetingTitle, meetingStartIso, meetingEndIso, meetingTimezone, organizerName, meetLink, inSiteJoinUrl } = params;
	const formattedTime = formatMeetingTime(meetingStartIso, meetingEndIso, meetingTimezone);
	return wrapEmailTemplate(`
    <div class="header">Cohorts Meeting Scheduled</div>
    <div class="content">
      <p>Your meeting is confirmed and has been added to the calendar workflow.</p>
      <div class="highlight">
        <strong>Title:</strong> ${escapeHtml(meetingTitle)}<br>
        <strong>When:</strong> ${formattedTime}<br>
        <strong>Timezone:</strong> ${escapeHtml(meetingTimezone)}<br>
        <strong>Organizer:</strong> ${escapeHtml(organizerName)}
      </div>
      ${meetLink ? `<a class="button" href="${meetLink}">Open Meeting Room</a>` : ""}
      ${inSiteJoinUrl ? `<p class="meta">Prefer joining in-app? Use your workspace meeting room: <a href="${inSiteJoinUrl}">${inSiteJoinUrl}</a></p>` : ""}
      <p class="meta">This notification was sent by Cohorts Meetings.</p>
    </div>
  `);
}
//#endregion
//#region src/lib/notifications/brevo.ts
/**
* Brevo (formerly Sendinblue) Email Notification Service
*
* Sends transactional emails for important platform activities.
*/
var brevo_exports = /* @__PURE__ */ __exportAll({
	BREVO_API_KEY: () => BREVO_API_KEY,
	BREVO_SENDER_EMAIL: () => BREVO_SENDER_EMAIL,
	BREVO_SENDER_NAME: () => BREVO_SENDER_NAME,
	checkBrevoHealth: () => checkBrevoHealth,
	notifyMeetingCancelledEmail: () => notifyMeetingCancelledEmail,
	notifyMeetingCancelledEmails: () => notifyMeetingCancelledEmails,
	notifyMeetingRescheduledEmail: () => notifyMeetingRescheduledEmail,
	notifyMeetingRescheduledEmails: () => notifyMeetingRescheduledEmails,
	notifyMeetingScheduledEmail: () => notifyMeetingScheduledEmail,
	notifyMeetingScheduledEmails: () => notifyMeetingScheduledEmails,
	sendTransactionalEmail: () => sendTransactionalEmail
});
var BREVO_API_KEY = process.env.BREVO_API_KEY;
var BREVO_SENDER_EMAIL = process.env.BREVO_SENDER_EMAIL ?? "notifications@cohorts.app";
var BREVO_SENDER_NAME = process.env.BREVO_SENDER_NAME ?? "Cohorts";
var _convexClient = null;
function getConvexClient() {
	if (_convexClient) return _convexClient;
	const url = process.env.CONVEX_URL ?? "https://grand-sparrow-698.convex.cloud";
	const deployKey = process.env.CONVEX_DEPLOY_KEY ?? process.env.CONVEX_DEV_DEPLOY_KEY ?? process.env.CONVEX_PROD_DEPLOY_KEY ?? process.env.CONVEX_ADMIN_KEY ?? process.env.CONVEX_ADMIN_TOKEN;
	if (!url || !deployKey) return null;
	_convexClient = new ConvexHttpClient(url);
	_convexClient.setAdminAuth?.(deployKey, {
		issuer: "system",
		subject: "notification-service"
	});
	return _convexClient;
}
function getBrevoClient() {
	if (!BREVO_API_KEY) {
		console.warn("[brevo] BREVO_API_KEY not configured");
		return null;
	}
	const apiInstance = new import_api.TransactionalEmailsApi();
	apiInstance.setApiKey(import_api.TransactionalEmailsApiApiKeys.apiKey, BREVO_API_KEY);
	return apiInstance;
}
var fetchNotificationPreferences = (0, import_react.cache)(async (convex, email) => {
	return await convex.query(internal.users.getNotificationPreferencesByEmail, { email });
});
/**
* Check if a user has enabled a specific email notification type.
* Returns true if enabled or if no preference is set (defaults to true).
*/
async function isEmailNotificationEnabled(recipientEmail, prefKey) {
	try {
		const convex = getConvexClient();
		if (!convex) return false;
		const result = await fetchNotificationPreferences(convex, recipientEmail);
		if (!result?.notificationPreferences) return true;
		return isEmailPrefEnabled(result.notificationPreferences, prefKey);
	} catch (error) {
		console.error("[brevo] error checking preferences", error);
		return false;
	}
}
async function sendTransactionalEmail(options) {
	const client = getBrevoClient();
	if (!client) return {
		success: false,
		error: /* @__PURE__ */ new Error("Brevo not configured")
	};
	const sendSmtpEmail = new import_api.SendSmtpEmail();
	sendSmtpEmail.sender = {
		email: BREVO_SENDER_EMAIL,
		name: BREVO_SENDER_NAME
	};
	sendSmtpEmail.to = options.to;
	sendSmtpEmail.subject = options.subject;
	sendSmtpEmail.htmlContent = options.htmlContent;
	if (options.textContent) sendSmtpEmail.textContent = options.textContent;
	if (options.replyTo) sendSmtpEmail.replyTo = options.replyTo;
	if (options.tags) sendSmtpEmail.tags = options.tags;
	let lastError = null;
	const attemptSend = async (attempt) => {
		try {
			const result = await client.sendTransacEmail(sendSmtpEmail);
			console.log(`[brevo] email sent successfully: ${options.subject}`);
			return {
				success: true,
				messageId: result.body?.messageId
			};
		} catch (error) {
			lastError = error instanceof Error ? error : /* @__PURE__ */ new Error("Unknown Brevo error");
			const statusCode = error?.status;
			if ((statusCode === 429 || statusCode && statusCode >= 500) && attempt < RETRY_CONFIG.maxRetries - 1) {
				console.warn(`[brevo] send failed (${statusCode}), retrying...`);
				await sleep(calculateBackoffDelay(attempt));
				return attemptSend(attempt + 1);
			}
		}
		console.error("[brevo] failed to send email after all retries", lastError);
		return {
			success: false,
			error: lastError ?? void 0
		};
	};
	return attemptSend(0);
}
var EMAIL_RECIPIENT_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
function normalizeNotificationRecipients(recipientEmails) {
	return Array.from(new Set(recipientEmails.flatMap((recipientEmail) => {
		const normalized = recipientEmail.trim().toLowerCase();
		return EMAIL_RECIPIENT_REGEX.test(normalized) ? [normalized] : [];
	})));
}
async function sendMeetingNotificationBatch(notificationType, recipientEmails, sendEmail) {
	const normalizedRecipients = normalizeNotificationRecipients(recipientEmails);
	const skipped = Math.max(recipientEmails.length - normalizedRecipients.length, 0);
	if (normalizedRecipients.length === 0) return {
		attempted: 0,
		sent: 0,
		failed: 0,
		skipped
	};
	const results = await Promise.all(normalizedRecipients.map(async (recipientEmail) => {
		try {
			const result = await sendEmail(recipientEmail);
			if (!result.success) console.warn(`[brevo] meeting ${notificationType} email failed`, {
				recipientEmail,
				error: result.error?.message
			});
			return result.success;
		} catch (error) {
			console.error(`[brevo] unexpected meeting ${notificationType} email error`, {
				recipientEmail,
				error
			});
			return false;
		}
	}));
	const sent = results.filter(Boolean).length;
	const failed = results.length - sent;
	return {
		attempted: normalizedRecipients.length,
		sent,
		failed,
		skipped
	};
}
async function notifyMeetingScheduledEmail(options) {
	const { recipientEmail, recipientName, ...params } = options;
	if (!await isEmailNotificationEnabled(recipientEmail, "meetings")) return { success: true };
	const subject = `📅 Meeting scheduled: ${params.meetingTitle}`;
	const htmlContent = meetingScheduledTemplate(params);
	return sendTransactionalEmail({
		to: [{
			email: recipientEmail,
			name: recipientName
		}],
		subject,
		htmlContent,
		tags: ["meeting-scheduled"]
	});
}
async function notifyMeetingScheduledEmails(options) {
	const { recipientEmails, ...params } = options;
	return await sendMeetingNotificationBatch("scheduled", recipientEmails, async (recipientEmail) => {
		return await notifyMeetingScheduledEmail({
			recipientEmail,
			...params
		});
	});
}
async function notifyMeetingRescheduledEmail(options) {
	const { recipientEmail, recipientName, ...params } = options;
	if (!await isEmailNotificationEnabled(recipientEmail, "meetings")) return { success: true };
	const subject = `🔄 Meeting rescheduled: ${params.meetingTitle}`;
	const htmlContent = meetingRescheduledTemplate(params);
	return sendTransactionalEmail({
		to: [{
			email: recipientEmail,
			name: recipientName
		}],
		subject,
		htmlContent,
		tags: ["meeting-rescheduled"]
	});
}
async function notifyMeetingRescheduledEmails(options) {
	const { recipientEmails, ...params } = options;
	return await sendMeetingNotificationBatch("rescheduled", recipientEmails, async (recipientEmail) => {
		return await notifyMeetingRescheduledEmail({
			recipientEmail,
			...params
		});
	});
}
async function notifyMeetingCancelledEmail(options) {
	const { recipientEmail, recipientName, ...params } = options;
	if (!await isEmailNotificationEnabled(recipientEmail, "meetings")) return { success: true };
	const subject = `❌ Meeting cancelled: ${params.meetingTitle}`;
	const htmlContent = meetingCancelledTemplate(params);
	return sendTransactionalEmail({
		to: [{
			email: recipientEmail,
			name: recipientName
		}],
		subject,
		htmlContent,
		tags: ["meeting-cancelled"]
	});
}
async function notifyMeetingCancelledEmails(options) {
	const { recipientEmails, ...params } = options;
	return await sendMeetingNotificationBatch("cancelled", recipientEmails, async (recipientEmail) => {
		return await notifyMeetingCancelledEmail({
			recipientEmail,
			...params
		});
	});
}
async function checkBrevoHealth() {
	if (!BREVO_API_KEY) return {
		configured: false,
		healthy: false,
		error: "BREVO_API_KEY not set"
	};
	try {
		if (!getBrevoClient()) return {
			configured: false,
			healthy: false,
			error: "Failed to initialize client"
		};
		const accountApi = new import_api.AccountApi();
		accountApi.setApiKey(import_api.AccountApiApiKeys.apiKey, BREVO_API_KEY);
		await accountApi.getAccount();
		return {
			configured: true,
			healthy: true
		};
	} catch (error) {
		return {
			configured: true,
			healthy: false,
			error: error instanceof Error ? error.message : "Unknown error"
		};
	}
}
//#endregion
export { sendTransactionalEmail as a, notifyMeetingScheduledEmails as i, notifyMeetingCancelledEmails as n, wrapEmailTemplate as o, notifyMeetingRescheduledEmails as r, brevo_exports as t };
