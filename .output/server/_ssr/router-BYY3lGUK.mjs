import { o as __toESM } from "../_runtime.mjs";
import { S as require_jsx_runtime, a as ConvexProvider, f as getToken, h as ConvexHttpClient, o as ConvexReactClient, r as useConvexAuth, t as ConvexBetterAuthProvider, x as require_react } from "../_libs/@convex-dev/better-auth+[...].mjs";
import { r as motion_exports } from "./motion-DtlbbvFg.mjs";
import { P as redirect, _ as createRootRoute, c as HeadContent, g as createFileRoute, h as lazyRouteComponent, m as Outlet, p as createRouter, s as Scripts } from "../_libs/@tanstack/react-router+[...].mjs";
import { a as getRequest, r as createServerFn } from "./ssr.mjs";
import { At as object, Ct as array, Ft as unknown, It as ZodError, Nt as strictObject, Pt as string, kt as number, wt as boolean, xt as _enum } from "../_libs/@better-auth/core+[...].mjs";
import { Z as isEmailPrefEnabled, et as isScreenRecordingAuthBypassEnabled } from "./preview-data-CXkRNfsX.mjs";
import { C as instantiateDateTimeFormat, _ as isValidRedirectUrl, b as sanitizeInput, c as cn, d as formatDate, x as toISO } from "./utils-hh4sibN0.mjs";
import { A as differenceInMinutes } from "../_libs/date-fns.mjs";
import { t as Button } from "./button-BHcJlp0q.mjs";
import { a as CardHeader, n as CardContent, o as CardTitle, r as CardDescription, t as Card } from "./card-CDBnK3ba.mjs";
import { t as Skeleton } from "./skeleton-CQ4LJS0E.mjs";
import { l as resolveConvexApiErrorResponse } from "./convex-errors-sHK0JmZ7.mjs";
import { t as Toaster } from "../_libs/sonner.mjs";
import { n as usePathname } from "./navigation-C1M-rNAu.mjs";
import { c as getSystemConvexClient, i as checkConvexRateLimit, l as internal, n as api, o as createRateLimitKey, r as buildRateLimitHeaders, s as getClientIdentifier, t as RATE_LIMITS } from "./rate-limiter-convex-Dr72h9nD.mjs";
import { i as getPublicEnv, n as getToken$1, r as getConvexSiteUrl } from "./auth-server-DbIghuG9.mjs";
import { _ as parseJsonBodySafely, a as ForbiddenError, c as ServiceUnavailableError, f as authClient, g as useAuth, i as BadRequestError, l as UnauthorizedError, n as ApiError, o as NotFoundError, p as decodeJwtSubject, r as AuthProvider, s as RateLimitError, u as ValidationError } from "./auth-context-fSvbzOPB.mjs";
import { l as sleep, n as DEFAULT_RETRY_CONFIG, r as calculateBackoffDelay$5, t as UnifiedError } from "./unified-error-C0L-fxgu.mjs";
import { T as debugApi } from "./convex-api-msEHRhRb.mjs";
import { Yt as LoaderCircle, b as TriangleAlert, mn as House, or as CircleCheck, rt as RefreshCw, un as Info, wt as OctagonX } from "../_libs/lucide-react.mjs";
import { n as EMAIL_COLORS } from "./colors-DH3BrJD1.mjs";
import { i as calculateAlgorithmicInsights, s as enrichSummaryWithMetrics } from "./insights-D9NfALlV.mjs";
import { t as Separator } from "./separator-DGLaDYU_.mjs";
import { r as safeEvaluateFormula } from "./formula-engine-CImA3GkM.mjs";
import { t as Image } from "./image-Dd8IQpGx.mjs";
import { a as GOOGLE_API_BASE, c as META_OAUTH_DIALOG_BASE, d as googleAdsClient, f as linkedinAdsClient, l as META_OAUTH_TOKEN_ENDPOINT, m as tiktokAdsClient, s as META_API_VERSION, u as executeIntegrationRequest } from "./async-insights-B6eys-H6.mjs";
import { t as logger } from "./logger-0qFO0GgU.mjs";
import { d as fetchMetaAdsMetrics } from "./meta-ads-B-Zv4_78.mjs";
import { t as Link$1 } from "./link-D4Easb0H.mjs";
import { t as QueryClient } from "../_libs/tanstack__query-core.mjs";
import { a as QueryClientProvider, r as useIsFetching } from "../_libs/tanstack__react-query.mjs";
import { n as logRouteError } from "./log-route-error-DOW40EZM.mjs";
import { t as createSsrRpc } from "./createSsrRpc-Cbx5Q3_U.mjs";
import { t as Route$66 } from "./admin-CkvbzYqW.mjs";
import { n as UrlSearchParamsProvider, r as useUrlSearchParamsContext } from "./use-url-search-params-CvniTNfQ.mjs";
import { n as Route$67, t as AuthPageSkeleton } from "./reset-Dx6vkhkr.mjs";
import { n as Route$68, t as DashboardLoading } from "./dashboard-Db68lNqx.mjs";
import { t as Route$69 } from "./settings-b3y4-9SV.mjs";
import { t as Route$70 } from "./for-you-BXzSOpc_.mjs";
import { d as sanitizeMeetingParticipantEmails, i as generateConciseMeetingNotes$1, l as resolveGeminiApiKey, s as normalizeNotesSummary, t as GeminiAIService, u as resolveGeminiModel } from "./attendees-DnubeZTD.mjs";
import { t as Route$71 } from "./tasks-DaMprSCd.mjs";
import { t as shouldSendCollaborationEmailCopy } from "./collaboration-email-notify-B_BBULEN.mjs";
import { t as Route$72 } from "./viewer-RuFWxFAn.mjs";
import { n as da, t as PostHogProvider } from "../_libs/posthog-js.mjs";
import { t as require_api } from "../_libs/@getbrevo/brevo+[...].mjs";
import { n as z, t as J } from "../_libs/next-themes.mjs";
import { t as v4 } from "../_libs/uuid.mjs";
import { t as AccessToken } from "../_libs/livekit-server-sdk.mjs";
import { createCipheriv, createDecipheriv, createHash, randomBytes } from "node:crypto";
import { URLSearchParams as URLSearchParams$1 } from "node:url";
import { createHash as createHash$1 } from "crypto";
//#region node_modules/.nitro/vite/services/ssr/assets/router-BYY3lGUK.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var import_api = /* @__PURE__ */ __toESM(require_api());
function getGtag() {
	if (typeof window === "undefined") return null;
	if (!process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID) return null;
	return typeof window.gtag === "function" ? window.gtag : null;
}
async function logAnalyticsEvent(eventName, parameters) {
	if (typeof window === "undefined") return;
	da.capture(eventName, parameters);
	const gtag = getGtag();
	if (gtag) gtag("event", eventName, parameters);
}
async function logPageView(path, parameters) {
	if (typeof window === "undefined") return;
	const location = window.location.href;
	const defaultParams = {
		page_path: path,
		page_location: location
	};
	da.capture("$pageview", {
		...defaultParams,
		...parameters
	});
	const gtag = getGtag();
	const measurementId = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID;
	if (gtag && measurementId) gtag("config", measurementId, {
		page_path: path,
		page_location: location,
		...parameters
	});
}
async function setAnalyticsUserId(userId) {
	if (typeof window === "undefined") return;
	if (userId) da.identify(userId);
	else da.reset();
	const gtag = getGtag();
	if (gtag) gtag("set", "user_id", { user_id: userId ?? void 0 });
}
function getConvexDeploymentUrl() {
	return "https://grand-sparrow-698.convex.cloud";
}
function getConvexDeployKey() {
	return process.env.CONVEX_DEPLOY_KEY ?? process.env.CONVEX_DEV_DEPLOY_KEY ?? process.env.CONVEX_PROD_DEPLOY_KEY ?? process.env.CONVEX_ADMIN_KEY ?? process.env.CONVEX_ADMIN_TOKEN ?? null;
}
function createConvexAdminClient({ auth }) {
	const url = getConvexDeploymentUrl();
	const deployKey = getConvexDeployKey();
	if (!url || !deployKey) return null;
	const client = new ConvexHttpClient(url);
	const provider = typeof auth.claims?.provider === "string" ? auth.claims.provider : "better-auth";
	const issuer = provider === "better-auth" ? "better-auth" : provider;
	const subject = auth.uid ?? "anonymous";
	client.setAdminAuth(deployKey, {
		issuer,
		subject,
		email: auth.email ?? void 0,
		name: auth.name ?? void 0,
		...auth.claims ? auth.claims : {}
	});
	return client;
}
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
function calculateBackoffDelay$4(attempt) {
	return calculateBackoffDelay$5(attempt, {
		maxRetries: RETRY_CONFIG.maxRetries,
		baseDelayMs: RETRY_CONFIG.baseDelayMs,
		maxDelayMs: RETRY_CONFIG.maxDelayMs,
		jitterFactor: 1
	});
}
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
/**
* Brevo (formerly Sendinblue) Email Notification Service
*
* Sends transactional emails for important platform activities.
*/
var BREVO_API_KEY = process.env.BREVO_API_KEY;
var BREVO_SENDER_EMAIL = process.env.BREVO_SENDER_EMAIL ?? "notifications@cohorts.app";
var BREVO_SENDER_NAME = process.env.BREVO_SENDER_NAME ?? "Cohorts";
var _convexClient$5 = null;
function getConvexClient$5() {
	if (_convexClient$5) return _convexClient$5;
	const url = process.env.CONVEX_URL ?? "https://grand-sparrow-698.convex.cloud";
	const deployKey = process.env.CONVEX_DEPLOY_KEY ?? process.env.CONVEX_DEV_DEPLOY_KEY ?? process.env.CONVEX_PROD_DEPLOY_KEY ?? process.env.CONVEX_ADMIN_KEY ?? process.env.CONVEX_ADMIN_TOKEN;
	if (!url || !deployKey) return null;
	_convexClient$5 = new ConvexHttpClient(url);
	_convexClient$5.setAdminAuth?.(deployKey, {
		issuer: "system",
		subject: "notification-service"
	});
	return _convexClient$5;
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
var fetchNotificationPreferences$1 = (0, import_react.cache)(async (convex, email) => {
	return await convex.query(internal.users.getNotificationPreferencesByEmail, { email });
});
/**
* Check if a user has enabled a specific email notification type.
* Returns true if enabled or if no preference is set (defaults to true).
*/
async function isEmailNotificationEnabled(recipientEmail, prefKey) {
	try {
		const convex = getConvexClient$5();
		if (!convex) return false;
		const result = await fetchNotificationPreferences$1(convex, recipientEmail);
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
				await sleep(calculateBackoffDelay$4(attempt));
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
var SITE_HEADER_TRANSITION_STYLE = { viewTransitionName: "site-header" };
function SiteHeader() {
	const pathname = usePathname();
	if (pathname.startsWith("/dashboard") || pathname.startsWith("/for-you") || pathname.startsWith("/admin") || pathname.startsWith("/settings") || pathname.startsWith("/auth")) return null;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("header", {
		className: "sticky top-0 z-40 border-b border-border/40 bg-background/95 shadow-sm backdrop-blur supports-[backdrop-filter]:bg-background/80",
		style: SITE_HEADER_TRANSITION_STYLE,
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "mx-auto flex h-16 w-full max-w-6xl items-center justify-between px-4 sm:px-6",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link$1, {
				href: "/",
				className: "flex items-center gap-2 text-lg font-semibold text-foreground",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Image, {
					src: "/logo.svg",
					alt: "Cohorts",
					width: 80,
					height: 80,
					className: "size-20",
					priority: true
				})
			})
		})
	});
}
var SITE_FOOTER_TRANSITION_STYLE = { viewTransitionName: "site-footer" };
function SiteFooter() {
	const currentYear = (/* @__PURE__ */ new Date()).getFullYear();
	const pathname = usePathname();
	if (pathname.startsWith("/dashboard") || pathname.startsWith("/admin") || pathname.startsWith("/settings") || pathname.startsWith("/auth") || pathname.startsWith("/for-you") || pathname.startsWith("/pending-approval")) return null;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("footer", {
		className: "border-t border-border/40 bg-background",
		style: SITE_FOOTER_TRANSITION_STYLE,
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "mx-auto w-full max-w-6xl px-4 py-10 sm:px-6",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "grid gap-10 sm:grid-cols-2",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "space-y-3",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link$1, {
							href: "/",
							className: "flex items-center gap-2 text-lg font-semibold text-foreground",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Image, {
								src: "/logo.svg",
								alt: "Cohorts",
								width: 50,
								height: 50,
								className: "size-20",
								priority: true
							})
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-sm text-muted-foreground",
							children: "The unified command center for high-performing marketing agencies. Streamline campaigns, track revenue, and keep clients delighted."
						})]
					})
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Separator, { className: "my-8" }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex flex-col gap-3 text-xs text-muted-foreground sm:flex-row sm:items-center sm:justify-between",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [
						"© ",
						currentYear,
						" Cohorts. All rights reserved."
					] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex items-center gap-4",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link$1, {
							href: "/terms",
							className: "transition hover:text-foreground hover:underline underline-offset-4",
							children: "Terms"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link$1, {
							href: "/privacy",
							className: "transition hover:text-foreground hover:underline underline-offset-4",
							children: "Privacy"
						})]
					})]
				})
			]
		})
	});
}
/**
* Wraps all pages to ensure consistent light theme layout.
*/
function MarketingThemeScope({ children }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "flex min-h-screen flex-col bg-background text-foreground",
		children
	});
}
async function registerServiceWorkerWhenAvailable(signal) {
	if (!(await fetch("/sw.js", {
		method: "HEAD",
		cache: "no-store"
	})).ok || signal.cancelled) return;
	const registration = await navigator.serviceWorker.register("/sw.js", { scope: "/" });
	if (registration.waiting) registration.waiting.postMessage({ type: "SKIP_WAITING" });
	const updateFoundHandler = () => {
		const newWorker = registration.installing;
		if (!newWorker) return;
		const stateChangeHandler = () => {
			if (newWorker.state === "installed" && navigator.serviceWorker.controller) newWorker.postMessage({ type: "SKIP_WAITING" });
		};
		newWorker.addEventListener("statechange", stateChangeHandler);
	};
	registration.addEventListener("updatefound", updateFoundHandler);
}
function PWAProvider() {
	(0, import_react.useEffect)(() => {
		if (typeof window === "undefined") return;
		if (!("serviceWorker" in navigator)) return;
		const signal = { cancelled: false };
		registerServiceWorkerWhenAvailable(signal).catch((error) => {
			console.warn("[pwa] service worker registration failed", error);
		});
		return () => {
			signal.cancelled = true;
		};
	}, []);
	return null;
}
var PAGE_VIEW_DEBOUNCE_MS = 300;
function AnalyticsProvider({ children }) {
	const pathname = usePathname();
	const searchParams = useUrlSearchParamsContext();
	const { user } = useAuth();
	const serializedSearch = searchParams?.toString() ?? "";
	(0, import_react.useEffect)(() => {
		let isMounted = true;
		const nextUserId = user?.id ?? null;
		(async () => {
			if (!isMounted) return;
			await setAnalyticsUserId(nextUserId);
		})();
		return () => {
			isMounted = false;
		};
	}, [user?.id]);
	(0, import_react.useEffect)(() => {
		if (!pathname) return;
		const timeout = setTimeout(() => {
			logPageView(serializedSearch.length > 0 ? `${pathname}?${serializedSearch}` : pathname);
		}, PAGE_VIEW_DEBOUNCE_MS);
		return () => {
			clearTimeout(timeout);
		};
	}, [pathname, serializedSearch]);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_jsx_runtime.Fragment, { children });
}
function PostHogProvider$1({ children }) {
	(0, import_react.useEffect)(() => {
		if (typeof window === "undefined") return;
		if (globalThis.__cohortsPostHogInitialized) return;
		da.init("phc_Bfc54JpHYkzbyCpvNzxFIwawD6qLgrKsaCrqZD2MDTz", {
			api_host: "/ingest",
			person_profiles: "always",
			capture_pageview: false,
			capture_pageleave: true
		});
		globalThis.__cohortsPostHogInitialized = true;
	}, []);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PostHogProvider, {
		client: da,
		children
	});
}
function AuthDebug() {
	const { isLoading, isAuthenticated } = useConvexAuth();
	(0, import_react.useEffect)(() => {}, [isLoading, isAuthenticated]);
	return null;
}
function ConvexClientProvider({ children, initialToken }) {
	const convexUrl = getPublicEnv("NEXT_PUBLIC_CONVEX_URL");
	const useBetterAuth = getPublicEnv("NEXT_PUBLIC_USE_BETTER_AUTH") !== "false";
	const client = (() => {
		if (!convexUrl) return null;
		return new ConvexReactClient(convexUrl);
	})();
	if (!client) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "flex min-h-screen items-center justify-center bg-background px-6 py-10",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			role: "alert",
			"aria-live": "assertive",
			className: "w-full max-w-xl rounded-2xl border border-destructive/40 bg-card p-8 text-center shadow-sm",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "mx-auto flex size-14 items-center justify-center rounded-full bg-destructive/10",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TriangleAlert, {
						className: "size-7 text-destructive",
						"aria-hidden": true
					})
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
					className: "mt-5 text-xl font-semibold text-foreground",
					children: "Convex is not configured"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-2 text-sm leading-6 text-muted-foreground",
					children: "Core data, authentication, and real-time features are unavailable because NEXT_PUBLIC_CONVEX_URL is missing from this deployment."
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-4 text-xs uppercase tracking-[0.2em] text-muted-foreground/80",
					children: "Application unavailable until the data layer is configured"
				})
			]
		})
	});
	if (useBetterAuth) return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(ConvexBetterAuthProvider, {
		client,
		authClient,
		initialToken: initialToken ?? void 0,
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(AuthDebug, {}), children]
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ConvexProvider, {
		client,
		children
	});
}
function QueryFetchingIndicator() {
	if (useIsFetching() === 0) return null;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("output", {
		className: "pointer-events-none fixed top-0 right-0 left-0 z-[200] block h-0.5 overflow-hidden bg-accent/15 motion-safe:animate-pulse",
		"aria-live": "polite",
		"aria-label": "Refreshing data in the background"
	});
}
function QueryProvider({ children }) {
	const [queryClient] = (0, import_react.useState)(() => new QueryClient({ defaultOptions: { queries: {
		staleTime: 60 * 1e3,
		gcTime: 300 * 1e3,
		retry: 1,
		refetchOnWindowFocus: false,
		refetchOnMount: false,
		refetchOnReconnect: false
	} } }));
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(QueryClientProvider, {
		client: queryClient,
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(QueryFetchingIndicator, {}), children]
	});
}
var TOASTER_ICONS = {
	success: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CircleCheck, { className: "size-4" }),
	info: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Info, { className: "size-4" }),
	warning: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TriangleAlert, { className: "size-4" }),
	error: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(OctagonX, { className: "size-4" }),
	loading: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, { className: "size-4 animate-spin" })
};
var TOASTER_STYLE = { "--border-radius": "var(--radius)" };
var DEFAULT_TOAST_OPTIONS = { closeButtonAriaLabel: "Dismiss notification" };
var Toaster$1 = ({ toastOptions, ...props }) => {
	const { theme = "system" } = z();
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Toaster, {
		theme,
		className: "toaster group",
		containerAriaLabel: "Notifications",
		icons: TOASTER_ICONS,
		style: TOASTER_STYLE,
		toastOptions: {
			...DEFAULT_TOAST_OPTIONS,
			...toastOptions
		},
		...props
	});
};
function AppProviders({ children, initialToken }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(J, {
		attribute: "class",
		defaultTheme: "system",
		enableSystem: true,
		disableTransitionOnChange: true,
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ConvexClientProvider, {
			initialToken,
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AuthProvider, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(QueryProvider, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_react.Suspense, {
				fallback: null,
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(UrlSearchParamsProvider, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AnalyticsProvider, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(PostHogProvider$1, { children: [children, /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Toaster$1, {})] }) }) })
			}) }) })
		})
	});
}
function MotionProvider({ children }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(motion_exports.MotionConfig, {
		reducedMotion: "user",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(motion_exports.LazyMotion, {
			features: motion_exports.domAnimation,
			children
		})
	});
}
/**
* Google Analytics loader — replaces `next/script` (`strategy="afterInteractive"`).
* Injects the gtag script + init snippet after hydration on the client.
*/
function GoogleAnalyticsScript() {
	const measurementId = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID;
	(0, import_react.useEffect)(() => {
		if (!measurementId) return;
		window.dataLayer = window.dataLayer || [];
		function gtag(...args) {
			window.dataLayer?.push(args);
		}
		window.gtag = window.gtag || gtag;
		gtag("js", /* @__PURE__ */ new Date());
		gtag("config", measurementId, { send_page_view: false });
		const script = document.createElement("script");
		script.async = true;
		script.src = `https://www.googletagmanager.com/gtag/js?id=${measurementId}`;
		document.head.appendChild(script);
		return () => {
			script.remove();
		};
	}, [measurementId]);
	if (!measurementId) return null;
	return null;
}
function RootNotFound() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("main", {
		className: "flex min-h-screen flex-col items-center justify-center gap-8 bg-gradient-to-br from-background via-muted/40 to-background px-6 py-24 text-center",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "space-y-4",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "inline-flex items-center rounded-full bg-muted px-3 py-1 text-xs font-medium uppercase tracking-wide text-muted-foreground",
					children: "404: Not Found"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
					className: "text-3xl font-semibold tracking-tight sm:text-4xl",
					children: "We couldn't find that page"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "max-w-xl text-sm text-muted-foreground sm:text-base",
					children: "The link you followed may be broken, or the page may have been moved. Double-check the URL or head back to the home page."
				})
			]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "flex flex-wrap items-center justify-center gap-3",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					asChild: true,
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link$1, {
						href: "/",
						children: "Go home"
					})
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					asChild: true,
					variant: "outline",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link$1, {
						href: "/dashboard",
						children: "Dashboard"
					})
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					asChild: true,
					variant: "outline",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link$1, {
						href: "/auth",
						children: "Sign in"
					})
				})
			]
		})]
	});
}
/**
* Root segment error boundary (marketing and other top-level routes).
*/
function RootAppError({ error, reset }) {
	(0, import_react.useEffect)(() => {
		logRouteError(error, "root");
	}, [error]);
	const handleRetry = () => {
		if (typeof reset === "function") reset();
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "flex min-h-[60vh] items-center justify-center bg-muted/20 p-4",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, {
			className: "max-w-lg border-muted/60",
			role: "alert",
			"aria-live": "assertive",
			"aria-atomic": "true",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardHeader, {
				className: "text-center",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "mx-auto mb-4 flex size-16 items-center justify-center rounded-full bg-destructive/10",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TriangleAlert, {
							className: "size-8 text-destructive",
							"aria-hidden": true
						})
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardTitle, {
						className: "text-xl",
						children: "Something went wrong"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardDescription, { children: "This page could not be displayed. You can try again or return home." })
				]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardContent, {
				className: "space-y-3",
				children: [
					null,
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
						className: "w-full",
						onClick: handleRetry,
						type: "button",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(RefreshCw, { className: "mr-2 size-4" }), "Try again"]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						variant: "outline",
						asChild: true,
						className: "w-full",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link$1, {
							href: "/",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(House, { className: "mr-2 size-4" }), "Go to home"]
						})
					}),
					"digest" in error && error.digest ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						className: "pt-2 text-center text-xs text-muted-foreground",
						children: ["Error ID: ", String(error.digest)]
					}) : null
				]
			})]
		})
	});
}
function NeutralPendingSkeleton() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "flex min-h-screen items-center justify-center bg-background px-6",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "w-full max-w-md space-y-4",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Skeleton, { className: "h-8 w-48" }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Skeleton, { className: "h-4 w-full" }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Skeleton, { className: "h-4 w-3/4" }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex gap-3 pt-4",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Skeleton, { className: "h-10 w-24 rounded-md" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Skeleton, { className: "h-10 w-24 rounded-md" })]
				})
			]
		})
	});
}
var fontVariables = {
	"--font-geist-sans": "'Geist Variable', sans-serif",
	"--font-geist-mono": "'Geist Mono Variable', monospace",
	"--font-anybody": "'Anybody Variable', sans-serif"
};
var resolveInitialToken = createServerFn({ method: "GET" }).handler(createSsrRpc("147e084cc4b3274e23b3e2724a7d12bfa1a7de0a4e43ecfe7441e753319cd616"));
var Route$65 = createRootRoute({
	loader: () => resolveInitialToken(),
	head: () => ({
		meta: [
			{ charSet: "utf-8" },
			{
				name: "viewport",
				content: "width=device-width, initial-scale=1"
			},
			{
				name: "theme-color",
				content: "var(--color-primary, #2563eb)"
			},
			{ title: "Cohorts - Marketing Agency Dashboard" },
			{
				name: "description",
				content: "Unified client management & analytics dashboard for marketing agencies"
			}
		],
		links: [{
			rel: "icon",
			href: "/favicon.ico"
		}]
	}),
	component: RootComponent,
	notFoundComponent: RootNotFound,
	errorComponent: RootAppError,
	pendingComponent: () => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(NeutralPendingSkeleton, {})
});
function RootComponent() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(RootDocument, {
		initialToken: Route$65.useLoaderData(),
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Outlet, {})
	});
}
function RootDocument({ children, initialToken }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("html", {
		lang: "en",
		suppressHydrationWarning: true,
		style: fontVariables,
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("head", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(HeadContent, {}) }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("body", {
			className: cn("min-h-screen bg-background font-sans antialiased text-foreground"),
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_react.Suspense, {
					fallback: null,
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(GoogleAnalyticsScript, {})
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(AppProviders, {
					initialToken,
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("a", {
							href: "#main-content",
							className: "sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[1200] focus:rounded-md focus:bg-background focus:px-3 focus:py-2 focus:text-sm focus:font-medium focus:text-foreground focus:shadow-md",
							children: "Skip to main content"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(MarketingThemeScope, { children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SiteHeader, {}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("main", {
								id: "main-content",
								className: "flex-1",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(MotionProvider, { children }), null]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SiteFooter, {})
						] }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_react.Suspense, {
							fallback: null,
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PWAProvider, {})
						})
					]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Scripts, {})
			]
		})]
	});
}
var $$splitComponentImporter$28 = () => import("./terms-D4AyLiSm.mjs");
var Route$64 = createFileRoute("/terms")({
	head: () => ({ meta: [{ title: "Terms of Service | Cohorts" }, {
		name: "description",
		content: "Terms of service for the Cohort platform."
	}] }),
	component: lazyRouteComponent($$splitComponentImporter$28, "component")
});
var $$splitComponentImporter$27 = () => import("./privacy-CsGOeUia.mjs");
var Route$63 = createFileRoute("/privacy")({
	head: () => ({ meta: [{ title: "Privacy Policy | Cohorts" }, {
		name: "description",
		content: "Learn how Cohorts collects, uses, and protects your information."
	}] }),
	component: lazyRouteComponent($$splitComponentImporter$27, "component")
});
var $$splitComponentImporter$26 = () => import("./pending-approval-BuxltLtB.mjs");
var Route$62 = createFileRoute("/pending-approval")({
	head: () => ({ meta: [{ title: "Account Status | Cohorts" }] }),
	component: lazyRouteComponent($$splitComponentImporter$26, "component")
});
function AuthLoading() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AuthPageSkeleton, {});
}
var $$splitErrorComponentImporter$1 = () => import("./auth-3nEDzXCY.mjs");
var $$splitComponentImporter$25 = () => import("./auth-CGwJ9iLr.mjs");
var Route$61 = createFileRoute("/auth")({
	component: lazyRouteComponent($$splitComponentImporter$25, "component"),
	errorComponent: lazyRouteComponent($$splitErrorComponentImporter$1, "errorComponent"),
	pendingComponent: AuthLoading
});
/**
* Auth gating ported from `proxy.ts` for TanStack Router `beforeLoad`.
*/
function parseCookieValue(cookieHeader, name) {
	for (const part of cookieHeader.split(";")) {
		const idx = part.indexOf("=");
		if (idx === -1) continue;
		if (part.slice(0, idx).trim() === name) return part.slice(idx + 1).trim();
	}
}
async function hasValidSession(request) {
	try {
		return !!(await getToken(getConvexSiteUrl(), request.headers))?.token;
	} catch (err) {
		return false;
	}
}
function accountStatusRedirect(request, pathname) {
	const status = parseCookieValue(request.headers.get("cookie") ?? "", "cohorts_status");
	if (!status) return null;
	if (status === "pending" || status === "invited") {
		if (pathname.startsWith("/pending-approval") || pathname.startsWith("/auth")) return null;
		return { to: "/pending-approval" };
	}
	if (status === "disabled" || status === "suspended") {
		if (pathname.startsWith("/auth")) return null;
		return {
			to: "/auth",
			search: { error: status === "disabled" ? "account_disabled" : "account_suspended" }
		};
	}
	return null;
}
function shouldBypassAuthForDemo(pathname) {
	return isScreenRecordingAuthBypassEnabled() && (pathname === "/dashboard" || pathname.startsWith("/dashboard/") || pathname.startsWith("/for-you") || pathname.startsWith("/admin"));
}
/**
* Returns the current server Request in route `beforeLoad`.
* Safe to import from any route file — TanStack Start automatically
* excludes `.server.ts` modules from the client bundle.
*/
function getServerRequest() {
	return getRequest();
}
var $$splitErrorComponentImporter = () => import("../_authed-CeL9RPxI.mjs");
var $$splitComponentImporter$24 = () => import("../_authed-_n6sKdoR.mjs");
/**
* Pathless layout — auth gate for workspace routes (replaces proxy.ts
* matcher for /dashboard, /for-you, /admin, /settings).
*/
var Route$60 = createFileRoute("/_authed")({
	beforeLoad: async ({ location }) => {
		const pathname = location.pathname;
		let request;
		try {
			request = getServerRequest();
		} catch {}
		if (!request) return;
		if (shouldBypassAuthForDemo(pathname)) return;
		if (!await hasValidSession(request)) throw redirect({
			to: "/auth",
			search: { redirect: `${pathname}${location.searchStr}` }
		});
		const statusTarget = accountStatusRedirect(request, pathname);
		if (statusTarget) throw redirect(statusTarget);
	},
	component: lazyRouteComponent($$splitComponentImporter$24, "component"),
	errorComponent: lazyRouteComponent($$splitErrorComponentImporter, "errorComponent"),
	pendingComponent: DashboardLoading
});
function metadataBase() {
	const raw = "http://localhost:3000";
	if (!raw.trim());
	try {
		const normalized = raw.trim().replace(/\/$/, "");
		return new URL(normalized);
	} catch {
		return;
	}
}
var SHORT_DESCRIPTION = "Agency hub: Meta Marketing API (Facebook & Instagram)—accounts, OAuth, performance sync, campaigns, ad sets, ads, creatives, Pages, audiences, targeting—plus Google Ads, LinkedIn, and TikTok.";
var LONG_DESCRIPTION = "Cohorts is an AI-native agency workspace. Paid media includes Meta Marketing API coverage used in production: secure OAuth and token refresh, ad account discovery and selection, insights-backed metric sync, campaign status and budget/bidding updates, ad set and ad lifecycle controls, creative workflows (image/video, CTAs, optional Advantage+ style asset feeds), Facebook Page and Instagram Business actor selection, custom audience creation and listing, campaign-level targeting breakdowns, integration health checks, and derived performance signals (e.g. reach, frequency, CPM, CTR, video thruplays). Google Ads, LinkedIn Ads, and TikTok connectors share the same hub with clients, tasks, collaboration, and analytics.";
var KEYWORDS = [
	"Cohorts",
	"marketing agency platform",
	"agency operations",
	"Meta Marketing API",
	"Facebook Ads API",
	"Instagram Ads",
	"ad account management",
	"campaign management",
	"ad set management",
	"ad creatives",
	"Marketing API insights",
	"audience targeting",
	"custom audiences",
	"Facebook Page ads",
	"Instagram Business ads",
	"Google Ads",
	"LinkedIn Ads",
	"TikTok Ads",
	"marketing analytics",
	"client workspace"
];
var DEFAULT_TITLE = "Cohorts | Agency Operations Platform";
var marketingHomeMetadata = {
	metadataBase: metadataBase(),
	title: DEFAULT_TITLE,
	description: SHORT_DESCRIPTION,
	keywords: KEYWORDS,
	openGraph: {
		title: DEFAULT_TITLE,
		description: LONG_DESCRIPTION,
		type: "website",
		siteName: "Cohorts"
	},
	twitter: {
		card: "summary_large_image",
		title: DEFAULT_TITLE,
		description: LONG_DESCRIPTION
	}
};
var $$splitComponentImporter$23 = () => import("./routes-C56hVplk.mjs");
var Route$59 = createFileRoute("/")({
	beforeLoad: async () => {
		let request;
		try {
			request = getServerRequest();
		} catch {
			return;
		}
		if (await hasValidSession(request)) throw redirect({ to: "/for-you" });
	},
	head: () => ({ meta: [{ title: marketingHomeMetadata.title }, {
		name: "description",
		content: marketingHomeMetadata.description
	}] }),
	component: lazyRouteComponent($$splitComponentImporter$23, "component")
});
var $$splitComponentImporter$22 = () => import("./auth-BpZ4WyIw.mjs");
var Route$58 = createFileRoute("/auth/")({
	head: () => ({ meta: [{ title: "Sign In | Cohorts" }, {
		name: "description",
		content: "Sign in or create your Cohorts workspace to manage campaigns, proposals, collaboration, and analytics."
	}] }),
	component: lazyRouteComponent($$splitComponentImporter$22, "component")
});
var manifest = {
	name: "Cohorts - Marketing Agency Dashboard",
	short_name: "Cohorts",
	description: "Offline-capable client management and analytics for marketing agencies.",
	start_url: "/",
	display: "standalone",
	orientation: "portrait",
	background_color: "#ffffff",
	theme_color: "#ffffff",
	icons: [
		{
			src: "/cohorts-logo.png",
			sizes: "192x192",
			type: "image/png"
		},
		{
			src: "/cohorts-logo.png",
			sizes: "512x512",
			type: "image/png"
		},
		{
			src: "/logo_white.svg",
			sizes: "any",
			type: "image/svg+xml",
			purpose: "maskable"
		}
	]
};
var Route$57 = createFileRoute("/manifest/webmanifest")({ server: { handlers: { GET: async () => new Response(JSON.stringify(manifest), { headers: { "content-type": "application/manifest+json" } }) } } });
var $$splitComponentImporter$21 = () => import("./forgot-CxQkFPPr.mjs");
var Route$56 = createFileRoute("/auth/forgot")({
	head: () => ({ meta: [{ title: "Forgot Password | Cohorts" }, {
		name: "description",
		content: "Reset your Cohorts account password."
	}] }),
	component: lazyRouteComponent($$splitComponentImporter$21, "component")
});
function parseCookieHeader(cookieHeader) {
	if (!cookieHeader) return [];
	return cookieHeader.split(";").flatMap((part) => {
		const idx = part.indexOf("=");
		if (idx === -1) return [];
		const name = part.slice(0, idx).trim();
		const value = part.slice(idx + 1).trim();
		return name ? [{
			name,
			value
		}] : [];
	});
}
function createCookieStore(request) {
	const all = parseCookieHeader(request.headers.get("cookie") ?? "");
	return {
		get: (name) => all.find((c) => c.name === name),
		getAll: () => all,
		has: (name) => all.some((c) => c.name === name)
	};
}
function toNextRequest(request) {
	const url = new URL(request.url);
	return Object.assign(request, {
		nextUrl: url,
		cookies: createCookieStore(request)
	});
}
var NextResponse = class NextResponse extends Response {
	constructor(..._args) {
		super(..._args);
		this.cookies = {
			set: (name, value, options) => {
				let cookie = `${encodeURIComponent(name)}=${encodeURIComponent(value)}`;
				if (options?.maxAge && typeof options.maxAge === "number") cookie += `; Max-Age=${options.maxAge}`;
				if (options?.path && typeof options.path === "string") cookie += `; Path=${options.path}`;
				if (options?.domain && typeof options.domain === "string") cookie += `; Domain=${options.domain}`;
				if (options?.secure || options?.secure === void 0) cookie += "; Secure";
				if (options?.httpOnly) cookie += "; HttpOnly";
				if (options?.sameSite === "strict") cookie += "; SameSite=Strict";
				else if (options?.sameSite === "lax") cookie += "; SameSite=Lax";
				else if (options?.sameSite === "none") cookie += "; SameSite=None";
				this.headers.append("Set-Cookie", cookie);
			},
			get: (name) => {
				return parseCookieHeader(this.headers.get("Set-Cookie") ?? "").find((c) => c.name === name);
			},
			delete: (name) => {
				this.headers.append("Set-Cookie", `${encodeURIComponent(name)}=; Max-Age=0; Path=/`);
			},
			getAll: () => {
				return parseCookieHeader(this.headers.get("Set-Cookie") ?? "");
			},
			has: (name) => {
				return parseCookieHeader(this.headers.get("Set-Cookie") ?? "").some((c) => c.name === name);
			}
		};
	}
	static json(data, init) {
		const headers = new Headers(init?.headers);
		if (!headers.has("content-type")) headers.set("content-type", "application/json");
		return new NextResponse(JSON.stringify(data), {
			...init,
			headers
		});
	}
	static redirect(url, status = 307) {
		return NextResponse.json(null, {
			status,
			headers: { Location: String(url) }
		});
	}
	static next(init) {
		return new NextResponse(null, {
			status: 200,
			headers: new Headers(init?.request?.headers)
		});
	}
};
/** Fire-and-forget async work. */
function after(callback) {
	Promise.resolve().then(callback);
}
var AuthenticationError = class extends ApiError {
	constructor(message, status = 401) {
		super(message, status, "UNAUTHORIZED");
	}
};
var fetchCurrentUser = (0, import_react.cache)(async (convex) => {
	return await convex.query(api.auth.getCurrentUser, {});
});
var fetchUserByEmail = (0, import_react.cache)(async (convex, email) => {
	return await convex.query(api.users.getByEmail, { email });
});
async function fetchBetterAuthSession(request) {
	const cookieHeader = request.headers.get("cookie");
	if (!cookieHeader) return null;
	const origin = request.nextUrl.origin || "http://localhost:3000";
	try {
		const headers = new Headers({
			accept: "application/json",
			cookie: cookieHeader
		});
		const userAgent = request.headers.get("user-agent");
		if (typeof userAgent === "string" && userAgent.length > 0) headers.set("user-agent", userAgent);
		const response = await fetch(new URL("/api/auth/get-session?disableCookieCache=true", origin), {
			method: "GET",
			headers,
			cache: "no-store"
		});
		if (!response.ok) return null;
		const payload = await response.json().catch(() => null);
		if (!payload || typeof payload !== "object") return null;
		const record = payload;
		return {
			user: record.user && typeof record.user === "object" ? record.user : null,
			session: record.session && typeof record.session === "object" ? record.session : null
		};
	} catch {
		return null;
	}
}
async function fetchConvexTokenFromBetterAuthRoute(request) {
	const cookieHeader = request.headers.get("cookie");
	if (!cookieHeader) return null;
	const origin = request.nextUrl.origin || "http://localhost:3000";
	try {
		const headers = new Headers({
			accept: "application/json",
			cookie: cookieHeader
		});
		const userAgent = request.headers.get("user-agent");
		if (typeof userAgent === "string" && userAgent.length > 0) headers.set("user-agent", userAgent);
		const response = await fetch(new URL("/api/auth/convex/token", origin), {
			method: "GET",
			headers,
			cache: "no-store"
		});
		if (!response.ok) return null;
		const token = (await response.json().catch(() => null))?.token;
		return typeof token === "string" && token.length > 0 ? token : null;
	} catch {
		return null;
	}
}
function buildAuthResultFromBetterAuthSession(sessionPayload) {
	const user = sessionPayload.user;
	if (!user || typeof user !== "object") return null;
	const uid = user.id ?? user._id ?? user.userId ?? user.sub ?? null;
	if (!uid) return null;
	return {
		uid,
		email: typeof user.email === "string" ? user.email.toLowerCase() : null,
		name: typeof user.name === "string" ? user.name : null,
		claims: {
			provider: "better-auth",
			photoURL: typeof user.image === "string" && user.image.trim().length > 0 ? user.image.trim() : null,
			role: (typeof user.role === "string" && user.role.length > 0 ? user.role : void 0) ?? "client",
			status: (typeof user.status === "string" && user.status.length > 0 ? user.status : void 0) ?? "pending",
			agencyId: (typeof user.agencyId === "string" && user.agencyId.length > 0 ? user.agencyId : void 0) ?? (typeof sessionPayload.session?.activeOrganizationId === "string" && sessionPayload.session.activeOrganizationId.length > 0 ? sessionPayload.session.activeOrganizationId : void 0) ?? uid
		},
		isCron: false
	};
}
async function resolveBetterAuthToken(request) {
	try {
		const nextJsToken = await getToken$1();
		if (typeof nextJsToken === "string" && nextJsToken.length > 0) return nextJsToken;
	} catch {}
	try {
		const token = (await getToken(getConvexSiteUrl(), request.headers))?.token;
		if (typeof token === "string" && token.length > 0) return token;
	} catch {}
	return await fetchConvexTokenFromBetterAuthRoute(request);
}
function readBearerToken(request) {
	const authorization = request.headers.get("authorization");
	if (!authorization) return null;
	const [scheme, token] = authorization.split(" ");
	if (scheme?.toLowerCase() !== "bearer") return null;
	if (typeof token !== "string") return null;
	const normalized = token.trim();
	return normalized.length > 0 ? normalized : null;
}
async function buildAuthResultFromConvexToken(token) {
	const convexUrl = "https://grand-sparrow-698.convex.cloud";
	try {
		const convex = new ConvexHttpClient(convexUrl, { auth: token });
		const user = await fetchCurrentUser(convex);
		if (!user) return null;
		const email = user.email ? String(user.email) : null;
		const name = user.name ? String(user.name) : null;
		if (!email) return null;
		const normalizedEmail = email.toLowerCase();
		let resolvedUid = null;
		let role;
		let status;
		let agencyId;
		const betterAuthUserId = user.id ?? user._id ?? user.userId ?? user.sub ?? null;
		try {
			const convexUser = await fetchUserByEmail(convex, normalizedEmail);
			if (convexUser?.legacyId) {
				resolvedUid = String(convexUser.legacyId);
				role = typeof convexUser.role === "string" ? convexUser.role : void 0;
				status = typeof convexUser.status === "string" ? convexUser.status : void 0;
				agencyId = typeof convexUser.agencyId === "string" ? convexUser.agencyId : void 0;
			}
		} catch {}
		if (!resolvedUid) {
			const legacyId = decodeJwtSubject(token) ?? betterAuthUserId;
			if (legacyId) resolvedUid = legacyId;
		}
		const uid = resolvedUid ?? betterAuthUserId;
		if (!uid) return null;
		if (!role) role = "client";
		if (!status) status = "pending";
		return {
			uid,
			email,
			name,
			claims: {
				provider: "better-auth",
				role,
				status,
				agencyId
			},
			isCron: false
		};
	} catch {
		return null;
	}
}
async function tryVerifyBetterAuthSession(request) {
	const token = await resolveBetterAuthToken(request);
	if (token) {
		const authFromToken = await buildAuthResultFromConvexToken(token);
		if (authFromToken) return authFromToken;
	}
	const sessionPayload = await fetchBetterAuthSession(request);
	if (!sessionPayload) return null;
	return buildAuthResultFromBetterAuthSession(sessionPayload);
}
/**
* Authenticates an incoming request.
* Priority:
* 1. System Cron Key (header)
* 2. Better Auth session (cookies)
*/
async function authenticateRequest(request) {
	const cronSecret = process.env.INTEGRATIONS_CRON_SECRET;
	const cronKey = request.headers.get("x-cron-key");
	if (cronSecret && cronKey && cronKey === cronSecret) return {
		uid: null,
		email: null,
		name: "System Cron",
		claims: {},
		isCron: true
	};
	const bearerToken = readBearerToken(request);
	if (bearerToken) {
		const bearerAuthResult = await buildAuthResultFromConvexToken(bearerToken);
		if (bearerAuthResult) return bearerAuthResult;
	}
	const betterAuthResult = await tryVerifyBetterAuthSession(request);
	if (betterAuthResult) return betterAuthResult;
	throw new AuthenticationError("Authentication required", 401);
}
function assertAdmin(auth) {
	if (auth.isCron) return;
	if (auth.claims?.role === "admin") return;
	throw new AuthenticationError("Admin access required", 403);
}
function normalizeCandidate(value) {
	if (typeof value !== "string") return null;
	const trimmed = value.trim();
	return trimmed.length > 0 ? trimmed : null;
}
function getConvexClient$4() {
	const url = process.env.CONVEX_URL ?? "https://grand-sparrow-698.convex.cloud";
	const deployKey = process.env.CONVEX_DEPLOY_KEY ?? process.env.CONVEX_DEV_DEPLOY_KEY ?? process.env.CONVEX_PROD_DEPLOY_KEY ?? process.env.CONVEX_ADMIN_KEY;
	if (!url || !deployKey) return null;
	const client = new ConvexHttpClient(url);
	client.setAdminAuth?.(deployKey, {
		issuer: "system",
		subject: "workspace-resolver"
	});
	return client;
}
/**
* Resolve workspace ID for a given user ID.
* Uses Convex to look up the user's agencyId, falling back to userId if not found.
*/
var resolveWorkspaceIdForUser = (0, import_react.cache)(async (userId) => {
	if (!userId) throw new ValidationError("User id is required to resolve workspace id");
	const convex = getConvexClient$4();
	if (!convex) {
		console.warn("[workspace] Convex not configured, falling back to userId as workspaceId");
		return userId;
	}
	try {
		return (await convex.query(internal.users.getWorkspaceIdForUser, { userId }))?.workspaceId ?? userId;
	} catch (error) {
		console.error("[workspace] Failed to resolve workspace ID from Convex:", error);
		return userId;
	}
});
/**
* Resolve workspace context from auth claims.
* This is a simplified version that only returns workspaceId.
*/
async function resolveWorkspaceContext(auth) {
	if (!auth.uid) throw new ValidationError("Authentication required");
	const claimAgency = normalizeCandidate(auth.claims?.agencyId);
	if (claimAgency) return { workspaceId: claimAgency };
	return { workspaceId: await resolveWorkspaceIdForUser(auth.uid) };
}
var _convexClient$4 = null;
function getConvexIdempotencyClient() {
	if (_convexClient$4) return _convexClient$4;
	const url = process.env.CONVEX_URL ?? "https://grand-sparrow-698.convex.cloud";
	if (!url) return null;
	_convexClient$4 = new ConvexHttpClient(url);
	return _convexClient$4;
}
function getConvexIdempotencySecret() {
	const s = process.env.COHORTS_API_IDEMPOTENCY_SECRET;
	return typeof s === "string" && s.length > 0 ? s : null;
}
async function runBestEffortIdempotencyCleanup(options) {
	const convex = getConvexIdempotencyClient();
	const serverSecret = getConvexIdempotencySecret();
	if (!convex || !serverSecret) return;
	try {
		if (options.operation === "release") {
			await convex.mutation(api.apiIdempotency.release, {
				serverSecret,
				key: options.key
			});
			return;
		}
		await convex.mutation(api.apiIdempotency.complete, {
			serverSecret,
			key: options.key,
			response: options.response,
			httpStatus: options.httpStatus
		});
	} catch (error) {
		logger.error("Idempotency cleanup failed", error, {
			operation: options.operation,
			path: options.path,
			requestId: options.requestId,
			key: options.key
		});
	}
}
function toIdempotencyScalar(value) {
	if (value === null) return null;
	if (typeof value === "string" || typeof value === "number" || typeof value === "boolean") return value;
	return String(value);
}
function toIdempotencyLayer1(value) {
	if (value === null || typeof value === "string" || typeof value === "number" || typeof value === "boolean") return value;
	if (Array.isArray(value)) return value.map((item) => toIdempotencyScalar(item));
	if (typeof value === "object") {
		const normalized = {};
		for (const [key, entry] of Object.entries(value)) normalized[key] = toIdempotencyScalar(entry);
		return normalized;
	}
	return String(value);
}
function toIdempotencyLayer2(value) {
	if (value === null || typeof value === "string" || typeof value === "number" || typeof value === "boolean") return value;
	if (Array.isArray(value)) return value.map((item) => toIdempotencyLayer1(item));
	if (typeof value === "object") {
		const normalized = {};
		for (const [key, entry] of Object.entries(value)) normalized[key] = toIdempotencyLayer1(entry);
		return normalized;
	}
	return String(value);
}
function isApiResponseLike(value) {
	if (!value || typeof value !== "object") return false;
	const record = value;
	if (typeof record.success !== "boolean") return false;
	return "data" in record || "error" in record || "code" in record || "details" in record;
}
/**
* Recursively normalizes string values in request data.
* This does not make HTML safe to render.
*/
function sanitizeBody(data) {
	if (typeof data === "string") return sanitizeInput(data);
	if (Array.isArray(data)) return data.map(sanitizeBody);
	if (typeof data === "object" && data !== null) {
		const sanitized = {};
		for (const [key, value] of Object.entries(data)) sanitized[key] = sanitizeBody(value);
		return sanitized;
	}
	return data;
}
/**
* Creates a standardized API handler with built-in authentication,
* workspace resolution, and validation.
*/
function createApiHandler(options, handler) {
	return async (req, context) => {
		const requestId = req.headers.get("x-request-id") || v4();
		const startTime = Date.now();
		let idempotencyKey = null;
		let auth = {
			uid: null,
			email: null,
			name: null,
			claims: {},
			isCron: false
		};
		let workspace;
		try {
			const params = await (context?.params || Promise.resolve({}));
			const authOption = options.auth ?? "required";
			const workspaceOption = options.workspace ?? "none";
			logger.info(`API Request: ${req.method} ${req.nextUrl.pathname}`, {
				type: "request_start",
				requestId,
				method: req.method,
				path: req.nextUrl.pathname
			});
			if (options.rateLimit) {
				const config = typeof options.rateLimit === "string" ? RATE_LIMITS[options.rateLimit] : options.rateLimit;
				const identifier = getClientIdentifier(req);
				const result = await checkConvexRateLimit(createRateLimitKey(req.nextUrl.pathname, identifier), config);
				if (!result.allowed) return NextResponse.json({
					success: false,
					error: "Too many requests. Please try again later.",
					code: "RATE_LIMIT_EXCEEDED",
					requestId
				}, {
					status: 429,
					headers: {
						...Object.fromEntries(buildRateLimitHeaders(result).entries()),
						"X-Request-ID": requestId
					}
				});
			}
			if (authOption !== "none") try {
				auth = await authenticateRequest(req);
			} catch (error) {
				if (authOption === "required") throw error;
			}
			if (options.adminOnly) assertAdmin(auth);
			if (workspaceOption !== "none") {
				if (!auth.uid && !auth.isCron && workspaceOption === "required") throw new AuthenticationError("Authentication required for workspace access", 401);
				try {
					workspace = await resolveWorkspaceContext(auth);
				} catch (error) {
					if (workspaceOption === "required") throw error;
				}
			}
			let body = {};
			let rawBody = null;
			if (options.bodySchema) {
				let json;
				try {
					json = await req.json();
					rawBody = JSON.stringify(json);
				} catch {
					return NextResponse.json({
						success: false,
						error: "Invalid JSON body"
					}, { status: 400 });
				}
				const result = options.bodySchema.safeParse(json);
				if (!result.success) return NextResponse.json({
					success: false,
					error: "Validation failed",
					details: result.error.flatten().fieldErrors
				}, { status: 400 });
				body = sanitizeBody(result.data);
			}
			if (["POST", "PATCH"].includes(req.method) && !options.skipIdempotency) {
				const headerIdempotencyKey = req.headers.get("x-idempotency-key");
				if (options.requireIdempotency && !headerIdempotencyKey) return NextResponse.json({
					success: false,
					error: "Idempotency key required for this operation",
					code: "IDEMPOTENCY_KEY_REQUIRED",
					requestId
				}, { status: 400 });
				let effectiveKey = null;
				if (headerIdempotencyKey) {
					const safeKey = headerIdempotencyKey.replace(/[^a-zA-Z0-9_-]/g, "_");
					effectiveKey = `key_${auth.uid || "anon"}_${safeKey}`;
				} else if (rawBody) {
					const bodyHash = createHash$1("sha256").update(rawBody).digest("hex");
					const safePath = req.nextUrl.pathname.replace(/[^a-zA-Z0-9_-]/g, "_");
					effectiveKey = `auto_${auth.uid || "anon"}_${req.method}_${safePath}_${bodyHash}`;
				}
				if (effectiveKey) {
					const convex = getConvexIdempotencyClient();
					const serverSecret = getConvexIdempotencySecret();
					if (convex && serverSecret) try {
						const result = await convex.mutation(api.apiIdempotency.checkAndClaim, {
							serverSecret,
							key: effectiveKey,
							requestId,
							method: req.method,
							path: req.nextUrl.pathname
						});
						if (result.type === "completed") {
							const statusCode = typeof result.httpStatus === "number" && Number.isFinite(result.httpStatus) ? result.httpStatus : 200;
							return NextResponse.json(result.response, {
								status: statusCode,
								headers: {
									"X-Idempotency-Hit": "true",
									"X-Idempotency-Key": effectiveKey,
									"X-Request-ID": requestId
								}
							});
						}
						if (result.type === "pending") return NextResponse.json({
							success: false,
							error: "Request already in progress",
							code: "IDEMPOTENCY_CONFLICT",
							requestId
						}, {
							status: 409,
							headers: {
								"X-Request-ID": requestId,
								"Retry-After": "1"
							}
						});
						idempotencyKey = effectiveKey;
					} catch (err) {
						logger.warn("Idempotency check failed, proceeding without", { error: err });
					}
					else if (convex && !serverSecret) logger.warn("COHORTS_API_IDEMPOTENCY_SECRET unset; idempotency disabled for this request");
				}
			}
			let query = {};
			if (options.querySchema) {
				const searchParams = Object.fromEntries(req.nextUrl.searchParams.entries());
				const result = options.querySchema.safeParse(searchParams);
				if (!result.success) return NextResponse.json({
					success: false,
					error: "Invalid query parameters",
					details: result.error.flatten().fieldErrors
				}, { status: 400 });
				query = sanitizeBody(result.data);
			}
			const sanitizedParams = sanitizeBody(params || {});
			const result = await handler(req, {
				auth,
				workspace,
				body,
				query,
				params: sanitizedParams
			});
			if (result instanceof Response) {
				result.headers.set("X-Request-ID", requestId);
				return result;
			}
			if (isApiResponseLike(result)) {
				const payload = {
					...result,
					requestId
				};
				const status = payload.success ? 200 : 400;
				const duration = Date.now() - startTime;
				after(async () => {
					logger.info(`API ${payload.success ? "Success" : "Handled Error"}: ${req.method} ${req.nextUrl.pathname}`, {
						type: "request_end",
						requestId,
						duration,
						status,
						userId: auth.uid,
						workspaceId: workspace?.workspaceId
					});
					if (!payload.success && idempotencyKey) await runBestEffortIdempotencyCleanup({
						operation: "release",
						key: idempotencyKey,
						requestId,
						path: req.nextUrl.pathname
					});
					if (payload.success && idempotencyKey) await runBestEffortIdempotencyCleanup({
						operation: "complete",
						key: idempotencyKey,
						response: toIdempotencyLayer2(payload),
						httpStatus: status,
						requestId,
						path: req.nextUrl.pathname
					});
				});
				return NextResponse.json(payload, {
					status,
					headers: { "X-Request-ID": requestId }
				});
			}
			const successResponse = {
				...apiSuccess(result),
				requestId
			};
			const duration = Date.now() - startTime;
			after(async () => {
				logger.info(`API Success: ${req.method} ${req.nextUrl.pathname}`, {
					type: "request_end",
					requestId,
					duration,
					status: 200,
					userId: auth.uid,
					workspaceId: workspace?.workspaceId
				});
				if (idempotencyKey) await runBestEffortIdempotencyCleanup({
					operation: "complete",
					key: idempotencyKey,
					response: toIdempotencyLayer2(successResponse),
					httpStatus: 200,
					requestId,
					path: req.nextUrl.pathname
				});
			});
			return NextResponse.json(successResponse, { headers: { "X-Request-ID": requestId } });
		} catch (error) {
			const logContext = {
				requestId,
				duration: Date.now() - startTime,
				userId: auth.uid,
				workspaceId: workspace?.workspaceId
			};
			if (error instanceof UnifiedError) {
				after(async () => {
					logApiError(error, req, { ...logContext });
					if (idempotencyKey) await runBestEffortIdempotencyCleanup({
						operation: "release",
						key: idempotencyKey,
						requestId,
						path: req.nextUrl.pathname
					});
				});
				const status = typeof error.status === "number" ? error.status : 500;
				const payload = {
					success: false,
					...error.toJSON(),
					requestId
				};
				return NextResponse.json(payload, {
					status,
					headers: { "X-Request-ID": requestId }
				});
			}
			if (error instanceof ApiError) {
				after(async () => {
					logApiError(error, req, { ...logContext });
					if (idempotencyKey) await runBestEffortIdempotencyCleanup({
						operation: "release",
						key: idempotencyKey,
						requestId,
						path: req.nextUrl.pathname
					});
				});
				return NextResponse.json({
					success: false,
					error: error.message,
					code: error.code,
					details: error.details,
					requestId
				}, {
					status: error.status,
					headers: { "X-Request-ID": requestId }
				});
			}
			if (error instanceof ZodError) {
				after(async () => {
					logApiError(error, req, { ...logContext });
					if (idempotencyKey) await runBestEffortIdempotencyCleanup({
						operation: "release",
						key: idempotencyKey,
						requestId,
						path: req.nextUrl.pathname
					});
				});
				return NextResponse.json({
					success: false,
					error: "Validation failed",
					details: error.flatten().fieldErrors,
					code: "VALIDATION_ERROR",
					requestId
				}, {
					status: 400,
					headers: { "X-Request-ID": requestId }
				});
			}
			const convexApiError = resolveConvexApiErrorResponse(error);
			if (convexApiError) {
				after(async () => {
					logApiError(error, req, {
						...logContext,
						includeStack: false
					});
					if (idempotencyKey) await runBestEffortIdempotencyCleanup({
						operation: "release",
						key: idempotencyKey,
						requestId,
						path: req.nextUrl.pathname
					});
				});
				return NextResponse.json({
					success: false,
					error: convexApiError.message,
					code: convexApiError.code,
					requestId
				}, {
					status: convexApiError.status,
					headers: { "X-Request-ID": requestId }
				});
			}
			const isDev = false;
			after(async () => {
				logApiError(error, req, {
					...logContext,
					includeStack: isDev
				});
				if (idempotencyKey) await runBestEffortIdempotencyCleanup({
					operation: "release",
					key: idempotencyKey,
					requestId,
					path: req.nextUrl.pathname
				});
			});
			return NextResponse.json({
				success: false,
				error: options.errorMessage || "Internal server error",
				code: "INTERNAL_ERROR",
				requestId
			}, {
				status: 500,
				headers: { "X-Request-ID": requestId }
			});
		}
	};
}
/**
* Helper to create a success response
*/
function apiSuccess(data) {
	return {
		success: true,
		data
	};
}
function logApiError(error, req, opts) {
	try {
		const requestId = opts?.requestId || req.headers.get("x-request-id") || void 0;
		const asApiError = error instanceof ApiError ? error : void 0;
		const context = {
			type: "api_error",
			path: req.nextUrl.pathname,
			method: req.method,
			status: asApiError?.status || (error instanceof ZodError ? 400 : 500),
			code: asApiError?.code || (error instanceof ZodError ? "VALIDATION_ERROR" : "INTERNAL_ERROR"),
			requestId,
			duration: opts?.duration,
			userId: opts?.userId,
			workspaceId: opts?.workspaceId
		};
		const message = error instanceof Error ? error.message : String(error);
		if (asApiError && asApiError.status < 500) logger.warn(`API Error: ${message}`, context);
		else logger.error(`API Error: ${message}`, error, context);
	} catch (loggingError) {
		console.error("[api-handler] failed to log error", loggingError);
	}
}
async function runHandler(handler, ctx) {
	const response = await handler(toNextRequest(ctx.request), { params: Promise.resolve(ctx.params) });
	return response instanceof Response ? response : Response.json(response);
}
/**
* Wrap a `createApiHandler` definition for TanStack Start `server.handlers`.
*
* @example
* ```ts
* export const Route = createFileRoute('/api/health')({
*   server: {
*     handlers: adaptApiHandler({ auth: 'none', rateLimit: 'standard' }, async () => ({
*       status: 'ok',
*       timestamp: new Date().toISOString(),
*     })),
*   },
* })
* ```
*/
function adaptApiHandler(options, handler) {
	const nextHandler = createApiHandler(options, handler);
	const invoke = (ctx) => runHandler(nextHandler, ctx);
	return {
		GET: invoke,
		POST: invoke,
		PUT: invoke,
		PATCH: invoke,
		DELETE: invoke,
		HEAD: invoke,
		OPTIONS: invoke
	};
}
var handlers$30 = adaptApiHandler({
	auth: "none",
	rateLimit: "standard"
}, async () => ({
	status: "ok",
	timestamp: (/* @__PURE__ */ new Date()).toISOString()
}));
var Route$55 = createFileRoute("/api/health")({ server: { handlers: handlers$30 } });
var $$splitComponentImporter$20 = () => import("./dashboard-BcYcgwat.mjs");
var Route$54 = createFileRoute("/_authed/dashboard/")({
	head: () => ({ meta: [{ title: "Dashboard | Cohorts" }] }),
	component: lazyRouteComponent($$splitComponentImporter$20, "component")
});
var $$splitComponentImporter$19 = () => import("./admin-C2_-4viB.mjs");
var Route$53 = createFileRoute("/_authed/admin/")({
	head: () => ({ meta: [{ title: "Admin | Cohorts" }] }),
	component: lazyRouteComponent($$splitComponentImporter$19, "component")
});
var ALLOWED_DOMAINS$1 = new Set(["storage.googleapis.com", "storage.cloud.google.com"]);
function isAllowedR2PublicHost(hostname) {
	return hostname.endsWith(".r2.dev") || hostname.endsWith(".r2.cloudflarestorage.com");
}
function sanitizeFilename(value) {
	const sanitized = value.replace(/[\r\n]/g, "").replace(/["\\/;:]/g, "_").split("").filter((char) => {
		const code = char.charCodeAt(0);
		return code > 31 && code !== 127;
	}).join("").trim();
	return sanitized.length > 0 ? sanitized : "file";
}
function encodeContentDispositionFilename(value) {
	return encodeURIComponent(value).replace(/['()*]/g, (char) => `%${char.charCodeAt(0).toString(16).toUpperCase()}`);
}
function isAllowedHostname(hostname) {
	if (isAllowedR2PublicHost(hostname)) return true;
	for (const domain of ALLOWED_DOMAINS$1) {
		if (hostname === domain) return true;
		if (hostname.endsWith(`.${domain}`)) return true;
	}
	return false;
}
var handlers$29 = adaptApiHandler({
	auth: "required",
	querySchema: object({ url: string().url("Invalid URL format") })
}, async (req, { query }) => {
	const { url: fileUrl } = query;
	const parsedUrl = new URL(fileUrl);
	if (!isAllowedHostname(parsedUrl.hostname)) throw new ForbiddenError("URL domain not allowed");
	const upstream = await fetch(fileUrl, {
		cache: "no-store",
		headers: { Accept: "application/vnd.openxmlformats-officedocument.presentationml.presentation,application/octet-stream,*/*" }
	});
	if (!upstream.ok) throw new ServiceUnavailableError(`Failed to fetch file: ${upstream.status}`);
	const contentType = upstream.headers.get("content-type") || "application/octet-stream";
	const contentLength = upstream.headers.get("content-length");
	const filename = sanitizeFilename(decodeURIComponent(parsedUrl.pathname.split("/").pop() || "file"));
	const headers = {
		"Content-Type": contentType,
		"Cache-Control": "private, max-age=3600",
		"Content-Disposition": `inline; filename="${filename}"; filename*=UTF-8''${encodeContentDispositionFilename(filename)}`
	};
	if (contentLength) headers["Content-Length"] = contentLength;
	return new Response(upstream.body, {
		status: 200,
		headers
	});
});
var Route$52 = createFileRoute("/api/proxy/file")({ server: { handlers: handlers$29 } });
var GEMINI_RATE_LIMITS = {
	clientSummary: {
		maxRequests: 8,
		windowMs: 10 * 6e4
	},
	meetingNotes: {
		maxRequests: 6,
		windowMs: 30 * 6e4
	},
	meetingWebhookNotes: {
		maxRequests: 12,
		windowMs: 30 * 6e4
	},
	creativeCopy: {
		maxRequests: 12,
		windowMs: 10 * 6e4
	},
	analyticsInsights: {
		maxRequests: 24,
		windowMs: 10 * 6e4
	},
	proposalGeneration: {
		maxRequests: 6,
		windowMs: 30 * 6e4
	},
	adminFeatureAssist: {
		maxRequests: 12,
		windowMs: 10 * 6e4
	},
	agentMessage: {
		maxRequests: 30,
		windowMs: 10 * 6e4
	},
	taskDocumentImport: {
		maxRequests: 10,
		windowMs: 10 * 6e4
	},
	projectDocumentImport: {
		maxRequests: 10,
		windowMs: 10 * 6e4
	}
};
function sanitizeKeyPart(value, fallback) {
	if (typeof value !== "string") return fallback;
	const trimmed = value.trim();
	if (!trimmed) return fallback;
	return trimmed.replace(/[^a-zA-Z0-9._:-]+/g, "_").slice(0, 120);
}
function buildGeminiRateLimitKey(args) {
	return [
		"gemini",
		sanitizeKeyPart(args.name, "unknown"),
		sanitizeKeyPart(args.userId, "anonymous"),
		sanitizeKeyPart(args.workspaceId, "global"),
		sanitizeKeyPart(args.scope, "default"),
		sanitizeKeyPart(args.resourceId, "all")
	].join(":");
}
function formatGeminiRateLimitMessage(resetMs) {
	return `Gemini request limit exceeded. Please try again in ${Math.max(1, Math.ceil(resetMs / 1e3))} seconds.`;
}
function getConvexClientForUser$3(userId, email, name) {
	return createConvexAdminClient({ auth: {
		uid: userId,
		email: email ?? null,
		name: name ?? null,
		claims: { provider: "better-auth" },
		isCron: false
	} });
}
async function executeMutation$3(convex, name, args) {
	return await convex.mutation(name, args);
}
async function executeQuery$2(convex, name, args) {
	return await convex.query(name, args);
}
async function upsertGoogleWorkspaceTokens(options) {
	const workspaceId = await resolveWorkspaceIdForUser(options.userId);
	const convex = getConvexClientForUser$3(options.userId, options.userEmail ?? null, null);
	if (!convex) throw new Error("Convex admin client is not configured");
	return {
		workspaceId,
		updatedAtMs: (await executeMutation$3(convex, "meetingIntegrations:upsertGoogleWorkspaceTokens", {
			workspaceId,
			userEmail: options.userEmail ?? null,
			accessToken: options.accessToken,
			refreshToken: options.refreshToken ?? void 0,
			idToken: options.idToken ?? void 0,
			scopes: options.scopes ?? void 0,
			accessTokenExpiresAtMs: options.accessTokenExpiresAtMs ?? void 0,
			refreshTokenExpiresAtMs: options.refreshTokenExpiresAtMs ?? void 0
		})).updatedAtMs
	};
}
async function getGoogleWorkspaceTokens(options) {
	const workspaceId = await resolveWorkspaceIdForUser(options.userId);
	const convex = getConvexClientForUser$3(options.userId, null, null);
	if (!convex) throw new Error("Convex admin client is not configured");
	return {
		workspaceId,
		tokens: await executeQuery$2(convex, "meetingIntegrations:getGoogleWorkspaceTokensInternal", {
			workspaceId,
			userId: options.userId
		})
	};
}
async function createMeetingRecord(options) {
	const workspaceId = await resolveWorkspaceIdForUser(options.userId);
	const convex = getConvexClientForUser$3(options.userId, options.userEmail ?? null, null);
	if (!convex) throw new Error("Convex admin client is not configured");
	return await executeMutation$3(convex, "meetings:create", {
		workspaceId,
		title: options.title,
		description: options.description ?? null,
		startTimeMs: options.startTimeMs,
		endTimeMs: options.endTimeMs,
		timezone: options.timezone,
		meetLink: options.meetLink ?? null,
		roomName: options.roomName ?? null,
		calendarEventId: options.calendarEventId ?? null,
		attendeeEmails: options.attendeeEmails,
		clientId: options.clientId ?? null,
		integrationUserId: options.integrationUserId ?? null,
		providerId: options.providerId ?? "google-workspace"
	});
}
async function getMeetingRecord(options) {
	const workspaceId = options.workspaceId ?? await resolveWorkspaceIdForUser(options.userId);
	const convex = getConvexClientForUser$3(options.userId, options.userEmail ?? null, null);
	if (!convex) throw new Error("Convex admin client is not configured");
	return {
		workspaceId,
		meeting: await executeQuery$2(convex, "meetings:getByLegacyId", {
			workspaceId,
			legacyId: options.legacyId
		})
	};
}
async function getMeetingRecordByCalendarEventId(options) {
	const workspaceId = options.workspaceId ?? await resolveWorkspaceIdForUser(options.userId);
	const convex = getConvexClientForUser$3(options.userId, options.userEmail ?? null, null);
	if (!convex) throw new Error("Convex admin client is not configured");
	return {
		workspaceId,
		meeting: await executeQuery$2(convex, "meetings:getByCalendarEventId", {
			workspaceId,
			calendarEventId: options.calendarEventId
		})
	};
}
async function getMeetingRecordByRoomName(options) {
	const workspaceId = options.workspaceId ?? await resolveWorkspaceIdForUser(options.userId);
	const convex = getConvexClientForUser$3(options.userId, options.userEmail ?? null, null);
	if (!convex) throw new Error("Convex admin client is not configured");
	return {
		workspaceId,
		meeting: await executeQuery$2(convex, "meetings:getByRoomName", {
			workspaceId,
			roomName: options.roomName
		})
	};
}
async function updateMeetingRecord(options) {
	const workspaceId = options.workspaceId ?? await resolveWorkspaceIdForUser(options.userId);
	const convex = getConvexClientForUser$3(options.userId, options.userEmail ?? null, null);
	if (!convex) throw new Error("Convex admin client is not configured");
	return {
		workspaceId,
		meeting: await executeMutation$3(convex, "meetings:updateDetails", {
			workspaceId,
			legacyId: options.legacyId,
			title: options.title,
			description: options.description,
			startTimeMs: options.startTimeMs,
			endTimeMs: options.endTimeMs,
			timezone: options.timezone,
			attendeeEmails: options.attendeeEmails,
			meetLink: options.meetLink,
			roomName: options.roomName,
			status: options.status
		})
	};
}
async function setMeetingProcessingState(options) {
	const workspaceId = options.workspaceId ?? await resolveWorkspaceIdForUser(options.userId);
	const convex = getConvexClientForUser$3(options.userId, options.userEmail ?? null, null);
	if (!convex) throw new Error("Convex admin client is not configured");
	return {
		workspaceId,
		meeting: await executeMutation$3(convex, "meetings:setProcessingState", {
			workspaceId,
			legacyId: options.legacyId,
			status: options.status,
			transcriptProcessingState: options.transcriptProcessingState,
			transcriptProcessingError: options.transcriptProcessingError,
			notesProcessingState: options.notesProcessingState,
			notesProcessingError: options.notesProcessingError
		})
	};
}
async function ensureMeetingNativeRoom(options) {
	const workspaceId = options.workspaceId ?? await resolveWorkspaceIdForUser(options.userId);
	const convex = getConvexClientForUser$3(options.userId, options.userEmail ?? null, null);
	if (!convex) throw new Error("Convex admin client is not configured");
	return {
		workspaceId,
		meeting: await executeMutation$3(convex, "meetings:ensureNativeRoom", {
			workspaceId,
			legacyId: options.legacyId,
			roomName: options.roomName,
			meetLink: options.meetLink
		})
	};
}
async function saveMeetingTranscript(options) {
	const convex = getConvexClientForUser$3(options.userId, null, null);
	if (!convex) throw new Error("Convex admin client is not configured");
	if (options.meetingLegacyId) return await executeMutation$3(convex, "meetings:attachTranscript", {
		workspaceId: options.workspaceId,
		legacyId: options.meetingLegacyId,
		transcriptText: options.transcriptText,
		source: options.source,
		status: options.status,
		eventType: options.eventType,
		rawPayload: options.rawPayload
	});
	if (options.calendarEventId) return await executeMutation$3(convex, "meetings:attachTranscriptByCalendarEventId", {
		workspaceId: options.workspaceId,
		calendarEventId: options.calendarEventId,
		transcriptText: options.transcriptText,
		source: options.source,
		status: options.status,
		eventType: options.eventType,
		rawPayload: options.rawPayload
	});
	throw new Error("Either meetingLegacyId or calendarEventId is required to save a transcript");
}
async function saveMeetingNotes(options) {
	const convex = getConvexClientForUser$3(options.userId, null, null);
	if (!convex) throw new Error("Convex admin client is not configured");
	return await executeMutation$3(convex, "meetings:saveNotes", {
		workspaceId: options.workspaceId,
		legacyId: options.legacyId,
		summary: options.summary,
		model: options.model,
		eventType: options.eventType
	});
}
var transcriptModeZ = _enum([
	"save-transcript",
	"save-transcript-and-generate-notes",
	"save-notes",
	"finalize-post-meeting"
]);
var saveTranscriptSchema = object({
	legacyId: string().min(1),
	transcriptText: string().optional(),
	notesSummary: string().optional(),
	source: string().optional(),
	markCompleted: boolean().optional(),
	mode: transcriptModeZ.optional()
});
function normalizeTranscriptText(value) {
	return value.replace(/\r\n?/g, "\n").split("\n").map((line) => line.trimEnd()).join("\n").replace(/\n{3,}/g, "\n\n").trim();
}
var handlers$28 = adaptApiHandler({
	workspace: "required",
	bodySchema: saveTranscriptSchema,
	rateLimit: "sensitive"
}, async (_req, { auth, workspace, body }) => {
	if (!auth.uid) throw new UnauthorizedError("Authentication required");
	const role = typeof auth.claims?.role === "string" ? auth.claims.role : null;
	if (role !== "admin" && role !== "team") throw new ForbiddenError("Client users cannot save meeting transcripts");
	if (!workspace?.workspaceId) throw new BadRequestError("Workspace context is required for transcript processing");
	const mode = body.mode ?? "save-transcript-and-generate-notes";
	const shouldFinalizeAfterMeeting = mode === "finalize-post-meeting";
	const shouldSaveTranscript = mode === "save-transcript" || mode === "save-transcript-and-generate-notes" || shouldFinalizeAfterMeeting;
	const shouldGenerateNotes = mode === "save-transcript-and-generate-notes" || shouldFinalizeAfterMeeting;
	const currentMeeting = (await getMeetingRecord({
		userId: auth.uid,
		legacyId: body.legacyId,
		workspaceId: workspace.workspaceId,
		userEmail: auth.email
	})).meeting;
	const incomingTranscript = typeof body.transcriptText === "string" ? normalizeTranscriptText(body.transcriptText) : "";
	const incomingNotes = typeof body.notesSummary === "string" ? normalizeNotesSummary(body.notesSummary) : "";
	const effectiveTranscript = incomingTranscript || normalizeTranscriptText(currentMeeting.transcriptText ?? "");
	let transcriptSaved = false;
	let notesGenerated = false;
	let notesSaved = false;
	let summary = currentMeeting.notesSummary;
	let model = currentMeeting.notesModel;
	let notesReason = null;
	let transcriptTruncatedForNotes = false;
	if (shouldFinalizeAfterMeeting) await setMeetingProcessingState({
		userId: auth.uid,
		workspaceId: workspace.workspaceId,
		legacyId: body.legacyId,
		userEmail: auth.email,
		status: "completed",
		transcriptProcessingState: effectiveTranscript.length >= 20 ? "processing" : "idle",
		transcriptProcessingError: null,
		notesProcessingState: effectiveTranscript.length >= 20 ? "processing" : "idle",
		notesProcessingError: null
	});
	else if (shouldGenerateNotes && effectiveTranscript.length >= 20) await setMeetingProcessingState({
		userId: auth.uid,
		workspaceId: workspace.workspaceId,
		legacyId: body.legacyId,
		userEmail: auth.email,
		transcriptProcessingState: shouldSaveTranscript ? "processing" : currentMeeting.transcriptProcessingState ?? "idle",
		transcriptProcessingError: null,
		notesProcessingState: "processing",
		notesProcessingError: null
	});
	if (shouldSaveTranscript) {
		if (effectiveTranscript.length < 20 && !shouldFinalizeAfterMeeting) throw new BadRequestError("Transcript is too short. Record at least a few sentences before saving.");
		if (effectiveTranscript.length >= 20) try {
			await saveMeetingTranscript({
				userId: auth.uid,
				workspaceId: workspace.workspaceId,
				meetingLegacyId: body.legacyId,
				transcriptText: effectiveTranscript,
				source: body.source ?? currentMeeting.transcriptSource ?? "in-site-voice",
				status: body.markCompleted || shouldFinalizeAfterMeeting ? "completed" : "in_progress",
				eventType: shouldFinalizeAfterMeeting ? "transcript.finalized" : "transcript.manual",
				rawPayload: {
					mode,
					meetingLegacyId: body.legacyId
				}
			});
			transcriptSaved = true;
		} catch (error) {
			const message = error instanceof Error ? error.message : "Transcript finalization failed";
			await setMeetingProcessingState({
				userId: auth.uid,
				workspaceId: workspace.workspaceId,
				legacyId: body.legacyId,
				userEmail: auth.email,
				status: body.markCompleted || shouldFinalizeAfterMeeting ? "completed" : void 0,
				transcriptProcessingState: "failed",
				transcriptProcessingError: message,
				notesProcessingState: shouldGenerateNotes ? "failed" : void 0,
				notesProcessingError: shouldGenerateNotes ? "Transcript could not be finalized, so notes were not generated." : void 0
			});
			throw error;
		}
		else if (shouldFinalizeAfterMeeting && currentMeeting.status !== "completed") await updateMeetingRecord({
			userId: auth.uid,
			userEmail: auth.email,
			workspaceId: workspace.workspaceId,
			legacyId: body.legacyId,
			status: "completed"
		});
	}
	if (shouldGenerateNotes && effectiveTranscript.length >= 20) try {
		const rateLimit = await checkConvexRateLimit(buildGeminiRateLimitKey({
			name: "meetingNotes",
			userId: auth.uid,
			workspaceId: workspace.workspaceId,
			resourceId: body.legacyId,
			scope: mode
		}), GEMINI_RATE_LIMITS.meetingNotes);
		if (!rateLimit.allowed) throw new Error(formatGeminiRateLimitMessage(rateLimit.resetMs));
		const notes = await generateConciseMeetingNotes$1(effectiveTranscript);
		if (notes) {
			await saveMeetingNotes({
				userId: auth.uid,
				workspaceId: workspace.workspaceId,
				legacyId: body.legacyId,
				summary: notes.summary,
				model: notes.model,
				eventType: "notes.generated"
			});
			notesGenerated = true;
			notesSaved = true;
			summary = notes.summary;
			model = notes.model;
			transcriptTruncatedForNotes = notes.truncated;
		} else {
			notesReason = "ai_not_configured";
			await setMeetingProcessingState({
				userId: auth.uid,
				workspaceId: workspace.workspaceId,
				legacyId: body.legacyId,
				userEmail: auth.email,
				notesProcessingState: "failed",
				notesProcessingError: "AI notes generation is unavailable in this environment."
			});
		}
	} catch (error) {
		notesReason = "generation_failed";
		console.error("[meetings/transcript] Failed to generate notes", error);
		await setMeetingProcessingState({
			userId: auth.uid,
			workspaceId: workspace.workspaceId,
			legacyId: body.legacyId,
			userEmail: auth.email,
			notesProcessingState: "failed",
			notesProcessingError: error instanceof Error ? error.message : "AI note generation failed"
		});
	}
	if (mode === "save-notes") {
		if (incomingNotes.length < 10) throw new BadRequestError("Meeting notes are too short. Add a more complete summary before saving.");
		await saveMeetingNotes({
			userId: auth.uid,
			workspaceId: workspace.workspaceId,
			legacyId: body.legacyId,
			summary: incomingNotes,
			eventType: "notes.manual_saved"
		});
		notesSaved = true;
		summary = incomingNotes;
		model = null;
		if (body.markCompleted && currentMeeting.status !== "completed") await updateMeetingRecord({
			userId: auth.uid,
			userEmail: auth.email,
			workspaceId: workspace.workspaceId,
			legacyId: body.legacyId,
			status: "completed"
		});
	}
	const updatedMeetingRecord = await getMeetingRecord({
		userId: auth.uid,
		legacyId: body.legacyId,
		workspaceId: workspace.workspaceId,
		userEmail: auth.email
	});
	return {
		meetingLegacyId: body.legacyId,
		meeting: updatedMeetingRecord.meeting,
		transcriptSaved,
		notesGenerated,
		notesSaved,
		summary,
		model,
		notesReason,
		transcriptTruncatedForNotes,
		mode
	};
});
var Route$51 = createFileRoute("/api/meetings/transcript")({ server: { handlers: handlers$28 } });
var ALGORITHM = "aes-256-gcm";
var IV_LENGTH = 12;
var AUTH_TAG_LENGTH = 16;
function ensureSecret(stage) {
	const secret = process.env.METRIC_SECRET || process.env.JWT_SECRET || process.env.NEXTAUTH_SECRET;
	if (!secret) throw new ServiceUnavailableError(`Missing encryption secret (${stage}). Set METRIC_SECRET (recommended) or JWT_SECRET or NEXTAUTH_SECRET.`);
	return createHash("sha256").update(secret).digest();
}
function encrypt(value) {
	const key = ensureSecret("encrypt");
	const iv = randomBytes(IV_LENGTH);
	const cipher = createCipheriv(ALGORITHM, key, iv, { authTagLength: AUTH_TAG_LENGTH });
	const encrypted = Buffer.concat([cipher.update(value, "utf8"), cipher.final()]);
	const authTag = cipher.getAuthTag();
	return Buffer.concat([
		iv,
		authTag,
		encrypted
	]).toString("base64");
}
function decrypt(payload) {
	const raw = Buffer.from(payload, "base64");
	const iv = raw.subarray(0, IV_LENGTH);
	const authTag = raw.subarray(IV_LENGTH, 28);
	const encrypted = raw.subarray(28);
	const decipher = createDecipheriv(ALGORITHM, ensureSecret("decrypt"), iv, { authTagLength: AUTH_TAG_LENGTH });
	decipher.setAuthTag(authTag);
	return Buffer.concat([decipher.update(encrypted), decipher.final()]).toString("utf8");
}
/**
* Generates a random code verifier for PKCE.
* A high-entropy cryptographic random string.
*/
function generateCodeVerifier(length = 64) {
	const charset = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-._~";
	const bytes = randomBytes(length);
	let result = "";
	for (let i = 0; i < length; i++) result += charset[bytes[i] % 66];
	return result;
}
var GOOGLE_AUTH_ENDPOINT$1 = process.env.GOOGLE_AUTH_ENDPOINT ?? "https://accounts.google.com/o/oauth2/v2/auth";
var GOOGLE_TOKEN_ENDPOINT$2 = process.env.GOOGLE_TOKEN_ENDPOINT ?? "https://oauth2.googleapis.com/token";
var GOOGLE_CALENDAR_EVENTS_ENDPOINT = "https://www.googleapis.com/calendar/v3/calendars/primary/events";
var GOOGLE_WORKSPACE_SCOPES = [
	"https://www.googleapis.com/auth/calendar.events",
	"https://www.googleapis.com/auth/meetings.space.settings",
	"openid",
	"email",
	"profile"
];
var STATE_TTL_MS$4 = 300 * 1e3;
function readEnvValue$3(key) {
	const value = process.env[key];
	if (typeof value !== "string") return null;
	const normalized = value.trim();
	return normalized.length > 0 ? normalized : null;
}
function firstEnvValue$2(keys) {
	for (const key of keys) {
		const value = readEnvValue$3(key);
		if (value) return value;
	}
	return null;
}
function resolveGoogleWorkspaceOAuthCredentials() {
	return {
		clientId: firstEnvValue$2([
			"GOOGLE_WORKSPACE_CLIENT_ID",
			"GOOGLE_CLIENT_ID",
			"GOOGLE_ADS_CLIENT_ID"
		]),
		clientSecret: firstEnvValue$2([
			"GOOGLE_WORKSPACE_CLIENT_SECRET",
			"GOOGLE_CLIENT_SECRET",
			"GOOGLE_ADS_CLIENT_SECRET"
		])
	};
}
function resolveGoogleWorkspaceOAuthRedirectUri(appUrl) {
	const explicit = firstEnvValue$2([
		"GOOGLE_WORKSPACE_OAUTH_REDIRECT_URI",
		"GOOGLE_OAUTH_REDIRECT_URI",
		"GOOGLE_ADS_OAUTH_REDIRECT_URI"
	]);
	if (explicit) return explicit;
	const normalizedAppUrl = typeof appUrl === "string" ? appUrl.trim().replace(/\/+$/, "") : "";
	if (!normalizedAppUrl) return null;
	return `${normalizedAppUrl}/api/integrations/google-workspace/oauth/callback`;
}
function parseCalendarEventResponse(raw) {
	try {
		return JSON.parse(raw);
	} catch {
		throw new GoogleWorkspaceOAuthError({ message: `Unexpected Google Calendar response: ${raw.slice(0, 200)}` });
	}
}
function mapCalendarEventResponse(parsed) {
	const eventId = typeof parsed?.id === "string" ? parsed.id : "";
	if (!eventId) throw new GoogleWorkspaceOAuthError({ message: "Google Calendar did not return an event id" });
	const videoEntry = (Array.isArray(parsed?.conferenceData?.entryPoints) ? parsed.conferenceData.entryPoints : []).find((entry) => entry?.entryPointType === "video");
	return {
		eventId,
		eventLink: typeof parsed?.htmlLink === "string" ? parsed.htmlLink : null,
		meetLink: typeof parsed?.hangoutLink === "string" ? parsed.hangoutLink : typeof videoEntry?.uri === "string" ? videoEntry.uri : null,
		startTimeIso: typeof parsed?.start?.dateTime === "string" ? parsed.start.dateTime : null,
		endTimeIso: typeof parsed?.end?.dateTime === "string" ? parsed.end.dateTime : null
	};
}
function buildCalendarEventDescription(description, meetingUrl) {
	const normalizedDescription = typeof description === "string" ? description.trim() : "";
	const normalizedMeetingUrl = typeof meetingUrl === "string" ? meetingUrl.trim() : "";
	if (normalizedDescription && normalizedMeetingUrl) return `${normalizedDescription}\n\nJoin in Cohorts: ${normalizedMeetingUrl}`;
	if (normalizedDescription) return normalizedDescription;
	if (normalizedMeetingUrl) return `Join in Cohorts: ${normalizedMeetingUrl}`;
	return "";
}
var GoogleWorkspaceOAuthError = class extends Error {
	constructor(options) {
		super(options.message);
		this.name = "GoogleWorkspaceOAuthError";
		this.code = options.code;
		this.description = options.description;
	}
};
function createGoogleWorkspaceOAuthState(payload) {
	const context = {
		state: payload.state,
		redirect: payload.redirect,
		createdAt: payload.createdAt ?? Date.now()
	};
	return encodeURIComponent(encrypt(JSON.stringify(context)));
}
function validateGoogleWorkspaceOAuthState(state) {
	if (!state) throw new GoogleWorkspaceOAuthError({ message: "Missing OAuth state" });
	let parsed;
	try {
		parsed = JSON.parse(decrypt(decodeURIComponent(state)));
	} catch {
		throw new GoogleWorkspaceOAuthError({ message: "Invalid OAuth state payload" });
	}
	if (!parsed.state || !parsed.createdAt) throw new GoogleWorkspaceOAuthError({ message: "Malformed OAuth state payload" });
	if (Date.now() - parsed.createdAt > STATE_TTL_MS$4) throw new GoogleWorkspaceOAuthError({ message: "OAuth state has expired" });
	return parsed;
}
function buildGoogleWorkspaceOAuthUrl(options) {
	const scopes = options.scopes ?? GOOGLE_WORKSPACE_SCOPES;
	if (!options.clientId) throw new GoogleWorkspaceOAuthError({ message: "Google Workspace client ID is required" });
	if (!options.redirectUri) throw new GoogleWorkspaceOAuthError({ message: "Google Workspace redirect URI is required" });
	return `${GOOGLE_AUTH_ENDPOINT$1}?${new URLSearchParams({
		client_id: options.clientId,
		redirect_uri: options.redirectUri,
		response_type: "code",
		scope: scopes.join(" "),
		access_type: options.accessType ?? "offline",
		prompt: options.prompt ?? "consent",
		state: options.state
	}).toString()}`;
}
function parseGoogleTokenResponse(raw) {
	try {
		return JSON.parse(raw);
	} catch {
		throw new GoogleWorkspaceOAuthError({ message: `Invalid response from Google token endpoint: ${raw.slice(0, 200)}` });
	}
}
async function exchangeGoogleWorkspaceCodeForTokens(options) {
	if (!options.code) throw new GoogleWorkspaceOAuthError({ message: "Authorization code is required" });
	const body = new URLSearchParams({
		client_id: options.clientId,
		client_secret: options.clientSecret,
		redirect_uri: options.redirectUri,
		code: options.code,
		grant_type: "authorization_code"
	});
	const response = await fetch(GOOGLE_TOKEN_ENDPOINT$2, {
		method: "POST",
		headers: { "Content-Type": "application/x-www-form-urlencoded" },
		body: body.toString()
	});
	const parsed = parseGoogleTokenResponse(await response.text());
	if (!response.ok) {
		const error = parsed;
		throw new GoogleWorkspaceOAuthError({
			message: error.error_description ?? `Google token exchange failed (${response.status})`,
			code: error.error,
			description: error.error_description
		});
	}
	const data = parsed;
	if (!data.access_token) throw new GoogleWorkspaceOAuthError({ message: "Google token response did not include access_token" });
	return data;
}
async function refreshGoogleWorkspaceAccessToken(options) {
	if (!options.refreshToken) throw new GoogleWorkspaceOAuthError({ message: "Refresh token is required to refresh access" });
	const body = new URLSearchParams({
		client_id: options.clientId,
		client_secret: options.clientSecret,
		refresh_token: options.refreshToken,
		grant_type: "refresh_token"
	});
	const response = await fetch(GOOGLE_TOKEN_ENDPOINT$2, {
		method: "POST",
		headers: { "Content-Type": "application/x-www-form-urlencoded" },
		body: body.toString()
	});
	const parsed = parseGoogleTokenResponse(await response.text());
	if (!response.ok) {
		const error = parsed;
		throw new GoogleWorkspaceOAuthError({
			message: error.error_description ?? `Google token refresh failed (${response.status})`,
			code: error.error,
			description: error.error_description
		});
	}
	const data = parsed;
	if (!data.access_token) throw new GoogleWorkspaceOAuthError({ message: "Google refresh response did not include access_token" });
	return data;
}
async function createGoogleCalendarEvent(options) {
	if (!options.accessToken) throw new GoogleWorkspaceOAuthError({ message: "Access token is required to schedule a meeting" });
	const response = await fetch(`${GOOGLE_CALENDAR_EVENTS_ENDPOINT}?sendUpdates=all`, {
		method: "POST",
		headers: {
			Authorization: `Bearer ${options.accessToken}`,
			"Content-Type": "application/json"
		},
		body: JSON.stringify({
			summary: options.title,
			description: buildCalendarEventDescription(options.description, options.meetingUrl),
			location: options.meetingUrl ?? void 0,
			start: {
				dateTime: new Date(options.startTimeMs).toISOString(),
				timeZone: options.timezone
			},
			end: {
				dateTime: new Date(options.endTimeMs).toISOString(),
				timeZone: options.timezone
			},
			attendees: options.attendeeEmails.map((email) => ({ email }))
		})
	});
	const parsed = parseCalendarEventResponse(await response.text());
	if (!response.ok) throw new GoogleWorkspaceOAuthError({
		message: parsed?.error?.message || `Google Calendar event creation failed (${response.status})`,
		code: parsed?.error?.status,
		description: parsed?.error?.message
	});
	const event = mapCalendarEventResponse(parsed);
	return {
		...event,
		meetLink: options.meetingUrl ?? event.meetLink
	};
}
async function updateGoogleCalendarEvent(options) {
	if (!options.accessToken) throw new GoogleWorkspaceOAuthError({ message: "Access token is required to update a meeting" });
	if (!options.eventId) throw new GoogleWorkspaceOAuthError({ message: "Google Calendar event id is required" });
	const endpoint = `${GOOGLE_CALENDAR_EVENTS_ENDPOINT}/${encodeURIComponent(options.eventId)}?sendUpdates=all`;
	const response = await fetch(endpoint, {
		method: "PATCH",
		headers: {
			Authorization: `Bearer ${options.accessToken}`,
			"Content-Type": "application/json"
		},
		body: JSON.stringify({
			summary: options.title,
			description: buildCalendarEventDescription(options.description, options.meetingUrl),
			location: options.meetingUrl ?? void 0,
			start: {
				dateTime: new Date(options.startTimeMs).toISOString(),
				timeZone: options.timezone
			},
			end: {
				dateTime: new Date(options.endTimeMs).toISOString(),
				timeZone: options.timezone
			},
			attendees: options.attendeeEmails.map((email) => ({ email }))
		})
	});
	const parsed = parseCalendarEventResponse(await response.text());
	if (!response.ok) throw new GoogleWorkspaceOAuthError({
		message: parsed?.error?.message || `Google Calendar event update failed (${response.status})`,
		code: parsed?.error?.status,
		description: parsed?.error?.message
	});
	const event = mapCalendarEventResponse(parsed);
	return {
		...event,
		meetLink: options.meetingUrl ?? event.meetLink
	};
}
async function cancelGoogleCalendarEvent(options) {
	if (!options.accessToken) throw new GoogleWorkspaceOAuthError({ message: "Access token is required to cancel a meeting" });
	if (!options.eventId) throw new GoogleWorkspaceOAuthError({ message: "Google Calendar event id is required" });
	const endpoint = `${GOOGLE_CALENDAR_EVENTS_ENDPOINT}/${encodeURIComponent(options.eventId)}?sendUpdates=all`;
	const response = await fetch(endpoint, {
		method: "PATCH",
		headers: {
			Authorization: `Bearer ${options.accessToken}`,
			"Content-Type": "application/json"
		},
		body: JSON.stringify({ status: "cancelled" })
	});
	if (!response.ok) {
		const raw = await response.text().catch(() => "");
		let parsed = null;
		try {
			parsed = JSON.parse(raw);
		} catch {
			parsed = null;
		}
		throw new GoogleWorkspaceOAuthError({
			message: parsed?.error?.message || `Google Calendar event cancellation failed (${response.status})`,
			code: parsed?.error?.status,
			description: parsed?.error?.message
		});
	}
}
function parseGoogleScopeList$1(scopeValue) {
	if (!scopeValue) return [];
	return scopeValue.split(" ").flatMap((scope) => {
		const trimmed = scope.trim();
		return trimmed.length > 0 ? [trimmed] : [];
	});
}
function readEnvValue$2(key) {
	const value = process.env[key];
	if (typeof value !== "string") return null;
	const normalized = value.trim();
	return normalized.length > 0 ? normalized : null;
}
function sanitizeSegment(value) {
	const base = value.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 20);
	return base.length > 0 ? base : "room";
}
function resolveLiveKitServerUrl() {
	return readEnvValue$2("NEXT_PUBLIC_LIVEKIT_URL") ?? readEnvValue$2("LIVEKIT_URL");
}
function resolveLiveKitCredentials() {
	return {
		apiKey: readEnvValue$2("LIVEKIT_API_KEY"),
		apiSecret: readEnvValue$2("LIVEKIT_API_SECRET"),
		serverUrl: resolveLiveKitServerUrl()
	};
}
function createLiveKitRoomName(seed) {
	return `cohorts-${sanitizeSegment(seed ?? "meeting")}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}
function buildCohortsMeetingUrl(options) {
	return `${options.appUrl.replace(/\/+$/, "")}/dashboard/meetings?room=${encodeURIComponent(options.roomName)}`;
}
async function createLiveKitParticipantToken(options) {
	const { apiKey, apiSecret } = resolveLiveKitCredentials();
	if (!apiKey || !apiSecret) throw new Error("LiveKit credentials are not configured");
	const token = new AccessToken(apiKey, apiSecret, {
		identity: options.participantIdentity,
		name: options.participantName ?? void 0,
		metadata: options.metadata ? JSON.stringify(options.metadata) : void 0,
		ttl: options.ttl ?? "8h"
	});
	token.addGrant({
		room: options.roomName,
		roomJoin: true,
		canPublish: true,
		canPublishData: true,
		canSubscribe: true
	});
	return await token.toJwt();
}
var scheduleMeetingSchema = object({
	title: string().min(1),
	description: string().nullable().optional(),
	startTimeMs: number(),
	endTimeMs: number(),
	timezone: string().min(1),
	attendeeEmails: array(string().email()),
	clientId: string().nullable().optional()
});
var MIN_MEETING_DURATION_MS$1 = 600 * 1e3;
var MAX_MEETING_DURATION_MS$1 = 480 * 60 * 1e3;
var MIN_SCHEDULE_LEAD_MS$1 = 300 * 1e3;
var MAX_SCHEDULE_AHEAD_MS$1 = 365 * 24 * 60 * 60 * 1e3;
function normalizeMeetingText$1(value) {
	return value.replace(/\s+/g, " ").trim();
}
var handlers$27 = adaptApiHandler({
	workspace: "required",
	bodySchema: scheduleMeetingSchema,
	rateLimit: "sensitive"
}, async (req, { auth, workspace, body }) => {
	if (!auth.uid) throw new UnauthorizedError("Authentication required");
	const role = typeof auth.claims?.role === "string" ? auth.claims.role : null;
	if (role !== "admin" && role !== "team") throw new ForbiddenError("Client users cannot schedule meetings");
	if (!workspace?.workspaceId) throw new BadRequestError("Workspace resolution failed for meeting scheduling");
	if (body.endTimeMs <= body.startTimeMs) throw new BadRequestError("Meeting end time must be after start time");
	const normalizedTitle = normalizeMeetingText$1(body.title);
	const normalizedDescription = typeof body.description === "string" ? body.description.trim() : null;
	const durationMs = body.endTimeMs - body.startTimeMs;
	const now = Date.now();
	if (normalizedTitle.length < 3) throw new BadRequestError("Meeting title must be at least 3 characters long");
	if (normalizedTitle.length > 120) throw new BadRequestError("Meeting title must be 120 characters or fewer");
	if (body.startTimeMs < now + MIN_SCHEDULE_LEAD_MS$1) throw new BadRequestError("Meetings must be scheduled at least 5 minutes in advance");
	if (body.startTimeMs > now + MAX_SCHEDULE_AHEAD_MS$1) throw new BadRequestError("Meetings cannot be scheduled more than 12 months ahead");
	if (durationMs < MIN_MEETING_DURATION_MS$1 || durationMs > MAX_MEETING_DURATION_MS$1) throw new BadRequestError("Meetings must be between 10 minutes and 8 hours long");
	const { tokens } = await getGoogleWorkspaceTokens({ userId: auth.uid });
	if (!tokens?.accessToken) throw new BadRequestError("Connect Google Workspace before scheduling a meeting");
	const { clientId: googleClientId, clientSecret: googleClientSecret } = resolveGoogleWorkspaceOAuthCredentials();
	let accessToken = tokens.accessToken;
	if (typeof tokens.accessTokenExpiresAtMs === "number" && tokens.accessTokenExpiresAtMs <= now + 6e4) {
		if (!tokens.refreshToken) throw new BadRequestError("Google Workspace access has expired. Reconnect your account.");
		if (!googleClientId || !googleClientSecret) throw new ServiceUnavailableError("Google Workspace refresh credentials are not configured");
		const refreshed = await refreshGoogleWorkspaceAccessToken({
			clientId: googleClientId,
			clientSecret: googleClientSecret,
			refreshToken: tokens.refreshToken
		});
		accessToken = refreshed.access_token;
		await upsertGoogleWorkspaceTokens({
			userId: auth.uid,
			userEmail: tokens.userEmail,
			accessToken: refreshed.access_token,
			refreshToken: refreshed.refresh_token ?? tokens.refreshToken,
			idToken: refreshed.id_token ?? tokens.idToken,
			scopes: typeof refreshed.scope === "string" ? refreshed.scope.split(" ").filter(Boolean) : tokens.scopes,
			accessTokenExpiresAtMs: typeof refreshed.expires_in === "number" ? Date.now() + refreshed.expires_in * 1e3 : tokens.accessTokenExpiresAtMs
		});
	}
	const attendeeEmails = sanitizeMeetingParticipantEmails(body.attendeeEmails, auth.email);
	if (attendeeEmails.length === 0) throw new BadRequestError("Add at least one participant before scheduling a meeting");
	const roomName = createLiveKitRoomName(normalizedTitle);
	const appUrl = new URL(req.url).origin;
	const roomUrl = buildCohortsMeetingUrl({
		appUrl,
		roomName
	});
	const calendarEvent = await createGoogleCalendarEvent({
		accessToken,
		title: normalizedTitle,
		description: normalizedDescription,
		startTimeMs: body.startTimeMs,
		endTimeMs: body.endTimeMs,
		timezone: body.timezone,
		attendeeEmails,
		meetingUrl: roomUrl
	});
	return {
		meeting: await createMeetingRecord({
			userId: auth.uid,
			userEmail: auth.email,
			title: normalizedTitle,
			description: normalizedDescription,
			startTimeMs: body.startTimeMs,
			endTimeMs: body.endTimeMs,
			timezone: body.timezone,
			attendeeEmails,
			clientId: body.clientId ?? null,
			integrationUserId: auth.uid,
			providerId: "livekit",
			meetLink: roomUrl,
			roomName,
			calendarEventId: calendarEvent.eventId
		}),
		calendarEvent,
		notificationSummary: await notifyMeetingScheduledEmails({
			recipientEmails: attendeeEmails,
			meetingTitle: normalizedTitle,
			meetingStartIso: new Date(body.startTimeMs).toISOString(),
			meetingEndIso: new Date(body.endTimeMs).toISOString(),
			meetingTimezone: body.timezone,
			organizerName: auth.name ?? tokens.userEmail ?? "Cohorts",
			meetLink: roomUrl,
			inSiteJoinUrl: roomUrl
		})
	};
});
var Route$50 = createFileRoute("/api/meetings/schedule")({ server: { handlers: handlers$27 } });
var rescheduleMeetingSchema = object({
	legacyId: string().min(1),
	title: string().min(1),
	description: string().nullable().optional(),
	startTimeMs: number(),
	endTimeMs: number(),
	timezone: string().min(1),
	attendeeEmails: array(string().email())
});
var MIN_MEETING_DURATION_MS = 600 * 1e3;
var MAX_MEETING_DURATION_MS = 480 * 60 * 1e3;
var MIN_SCHEDULE_LEAD_MS = 300 * 1e3;
var MAX_SCHEDULE_AHEAD_MS = 365 * 24 * 60 * 60 * 1e3;
function normalizeMeetingText(value) {
	return value.replace(/\s+/g, " ").trim();
}
var handlers$26 = adaptApiHandler({
	workspace: "required",
	bodySchema: rescheduleMeetingSchema,
	rateLimit: "sensitive"
}, async (req, { auth, workspace, body }) => {
	if (!auth.uid) throw new UnauthorizedError("Authentication required");
	const role = typeof auth.claims?.role === "string" ? auth.claims.role : null;
	if (role !== "admin" && role !== "team") throw new ForbiddenError("Client users cannot reschedule meetings");
	if (!workspace?.workspaceId) throw new BadRequestError("Workspace resolution failed for meeting rescheduling");
	if (body.endTimeMs <= body.startTimeMs) throw new BadRequestError("Meeting end time must be after start time");
	const normalizedTitle = normalizeMeetingText(body.title);
	const normalizedDescription = typeof body.description === "string" ? body.description.trim() : null;
	const durationMs = body.endTimeMs - body.startTimeMs;
	const now = Date.now();
	if (normalizedTitle.length < 3) throw new BadRequestError("Meeting title must be at least 3 characters long");
	if (normalizedTitle.length > 120) throw new BadRequestError("Meeting title must be 120 characters or fewer");
	if (body.startTimeMs < now + MIN_SCHEDULE_LEAD_MS) throw new BadRequestError("Rescheduled meetings must start at least 5 minutes in the future");
	if (body.startTimeMs > now + MAX_SCHEDULE_AHEAD_MS) throw new BadRequestError("Meetings cannot be rescheduled more than 12 months ahead");
	if (durationMs < MIN_MEETING_DURATION_MS || durationMs > MAX_MEETING_DURATION_MS) throw new BadRequestError("Meetings must be between 10 minutes and 8 hours long");
	const { meeting } = await getMeetingRecord({
		userId: auth.uid,
		legacyId: body.legacyId,
		workspaceId: workspace.workspaceId,
		userEmail: auth.email
	});
	if (meeting.status === "cancelled") throw new BadRequestError("Cancelled meetings cannot be rescheduled");
	const attendeeEmails = sanitizeMeetingParticipantEmails(body.attendeeEmails, auth.email);
	if (attendeeEmails.length === 0) throw new BadRequestError("Add at least one participant before scheduling a meeting");
	const roomName = meeting.roomName?.trim() || createLiveKitRoomName(normalizedTitle);
	const nextMeetLink = roomName ? buildCohortsMeetingUrl({
		appUrl: new URL(req.url).origin,
		roomName
	}) : meeting.meetLink;
	if (meeting.calendarEventId) {
		const integrationUserId = meeting.integrationUserId ?? auth.uid;
		const { tokens } = await getGoogleWorkspaceTokens({ userId: integrationUserId });
		if (!tokens?.accessToken) throw new BadRequestError("Google Workspace connection is required to reschedule this meeting");
		const { clientId: googleClientId, clientSecret: googleClientSecret } = resolveGoogleWorkspaceOAuthCredentials();
		let accessToken = tokens.accessToken;
		if (typeof tokens.accessTokenExpiresAtMs === "number" && tokens.accessTokenExpiresAtMs <= Date.now() + 6e4) {
			if (!tokens.refreshToken) throw new BadRequestError("Google Workspace access has expired. Reconnect your account.");
			if (!googleClientId || !googleClientSecret) throw new ServiceUnavailableError("Google Workspace refresh credentials are not configured");
			const refreshed = await refreshGoogleWorkspaceAccessToken({
				clientId: googleClientId,
				clientSecret: googleClientSecret,
				refreshToken: tokens.refreshToken
			});
			accessToken = refreshed.access_token;
			await upsertGoogleWorkspaceTokens({
				userId: integrationUserId,
				userEmail: tokens.userEmail,
				accessToken: refreshed.access_token,
				refreshToken: refreshed.refresh_token ?? tokens.refreshToken,
				idToken: refreshed.id_token ?? tokens.idToken,
				scopes: typeof refreshed.scope === "string" ? refreshed.scope.split(" ").filter(Boolean) : tokens.scopes,
				accessTokenExpiresAtMs: typeof refreshed.expires_in === "number" ? Date.now() + refreshed.expires_in * 1e3 : tokens.accessTokenExpiresAtMs
			});
		}
		await updateGoogleCalendarEvent({
			accessToken,
			eventId: meeting.calendarEventId,
			title: normalizedTitle,
			description: normalizedDescription,
			startTimeMs: body.startTimeMs,
			endTimeMs: body.endTimeMs,
			timezone: body.timezone,
			attendeeEmails,
			meetingUrl: nextMeetLink
		});
	}
	const { meeting: updatedMeeting } = await updateMeetingRecord({
		userId: auth.uid,
		userEmail: auth.email,
		workspaceId: workspace.workspaceId,
		legacyId: body.legacyId,
		title: normalizedTitle,
		description: normalizedDescription,
		startTimeMs: body.startTimeMs,
		endTimeMs: body.endTimeMs,
		timezone: body.timezone,
		attendeeEmails,
		meetLink: nextMeetLink,
		roomName,
		status: "scheduled"
	});
	return {
		meeting: updatedMeeting,
		notificationSummary: await notifyMeetingRescheduledEmails({
			recipientEmails: attendeeEmails,
			meetingTitle: normalizedTitle,
			previousMeetingStartIso: new Date(meeting.startTimeMs).toISOString(),
			newMeetingStartIso: new Date(body.startTimeMs).toISOString(),
			newMeetingEndIso: new Date(body.endTimeMs).toISOString(),
			meetingTimezone: body.timezone,
			organizerName: auth.name ?? auth.email ?? "Cohorts",
			meetLink: nextMeetLink,
			inSiteJoinUrl: nextMeetLink
		})
	};
});
var Route$49 = createFileRoute("/api/meetings/reschedule")({ server: { handlers: handlers$26 } });
var handlers$25 = adaptApiHandler({
	workspace: "required",
	bodySchema: object({
		title: string().min(1).optional(),
		description: string().nullable().optional(),
		durationMinutes: number().min(10).max(240).optional(),
		attendeeEmails: array(string().email()).optional(),
		timezone: string().min(1).optional(),
		clientId: string().nullable().optional()
	}),
	rateLimit: "sensitive"
}, async (req, { auth, workspace, body }) => {
	if (!auth.uid) throw new UnauthorizedError("Authentication required");
	const role = typeof auth.claims?.role === "string" ? auth.claims.role : null;
	if (role !== "admin" && role !== "team") throw new ForbiddenError("Client users cannot start meetings");
	if (!workspace?.workspaceId) throw new ForbiddenError("Workspace context is required for meetings");
	const durationMinutes = Number.isFinite(body.durationMinutes) ? Math.floor(body.durationMinutes) : 30;
	const now = Date.now();
	const startTimeMs = now + 6e4;
	const endTimeMs = now + Math.max(10, durationMinutes) * 6e4;
	const timezone = body.timezone ?? "UTC";
	const title = body.title?.trim() && body.title.trim().length > 0 ? body.title.trim() : "Instant Cohorts Room";
	const description = body.description?.trim() ? body.description.trim() : "Native Cohorts meeting launched from the dashboard";
	const { tokens } = await getGoogleWorkspaceTokens({ userId: auth.uid });
	if (!tokens?.accessToken) throw new BadRequestError("Connect Google Workspace before starting a meeting");
	const { clientId: googleClientId, clientSecret: googleClientSecret } = resolveGoogleWorkspaceOAuthCredentials();
	let accessToken = tokens.accessToken;
	if (typeof tokens.accessTokenExpiresAtMs === "number" && tokens.accessTokenExpiresAtMs <= now + 6e4) {
		if (!tokens.refreshToken) throw new BadRequestError("Google Workspace access has expired. Reconnect your account.");
		if (!googleClientId || !googleClientSecret) throw new ServiceUnavailableError("Google Workspace refresh credentials are not configured");
		const refreshed = await refreshGoogleWorkspaceAccessToken({
			clientId: googleClientId,
			clientSecret: googleClientSecret,
			refreshToken: tokens.refreshToken
		});
		accessToken = refreshed.access_token;
		await upsertGoogleWorkspaceTokens({
			userId: auth.uid,
			userEmail: tokens.userEmail,
			accessToken: refreshed.access_token,
			refreshToken: refreshed.refresh_token ?? tokens.refreshToken,
			idToken: refreshed.id_token ?? tokens.idToken,
			scopes: typeof refreshed.scope === "string" ? refreshed.scope.split(" ").filter(Boolean) : tokens.scopes,
			accessTokenExpiresAtMs: typeof refreshed.expires_in === "number" ? Date.now() + refreshed.expires_in * 1e3 : tokens.accessTokenExpiresAtMs
		});
	}
	const attendeeEmails = sanitizeMeetingParticipantEmails(body.attendeeEmails ?? [], auth.email);
	if (attendeeEmails.length === 0) throw new BadRequestError("Add at least one participant before starting a meeting");
	const roomName = createLiveKitRoomName(title);
	const appUrl = new URL(req.url).origin;
	const roomUrl = buildCohortsMeetingUrl({
		appUrl,
		roomName
	});
	const calendarEvent = await createGoogleCalendarEvent({
		accessToken,
		title,
		description,
		startTimeMs,
		endTimeMs,
		timezone,
		attendeeEmails,
		meetingUrl: roomUrl
	});
	return {
		meeting: await createMeetingRecord({
			userId: auth.uid,
			userEmail: auth.email,
			title,
			description,
			startTimeMs,
			endTimeMs,
			timezone,
			attendeeEmails,
			clientId: body.clientId ?? null,
			integrationUserId: auth.uid,
			providerId: "livekit",
			meetLink: roomUrl,
			roomName,
			calendarEventId: calendarEvent.eventId
		}),
		calendarEvent,
		notificationSummary: await notifyMeetingScheduledEmails({
			recipientEmails: attendeeEmails,
			meetingTitle: title,
			meetingStartIso: new Date(startTimeMs).toISOString(),
			meetingEndIso: new Date(endTimeMs).toISOString(),
			meetingTimezone: timezone,
			organizerName: auth.name ?? auth.email ?? "Cohorts",
			meetLink: roomUrl,
			inSiteJoinUrl: roomUrl
		})
	};
});
var Route$48 = createFileRoute("/api/meetings/quick")({ server: { handlers: handlers$25 } });
var handlers$24 = adaptApiHandler({
	workspace: "required",
	bodySchema: object({
		legacyId: string().min(1),
		reason: string().optional()
	}),
	rateLimit: "sensitive"
}, async (_req, { auth, workspace, body }) => {
	if (!auth.uid) throw new UnauthorizedError("Authentication required");
	const role = typeof auth.claims?.role === "string" ? auth.claims.role : null;
	if (role !== "admin" && role !== "team") throw new ForbiddenError("Client users cannot cancel meetings");
	if (!workspace?.workspaceId) throw new BadRequestError("Workspace resolution failed for meeting cancellation");
	const { meeting } = await getMeetingRecord({
		userId: auth.uid,
		legacyId: body.legacyId,
		workspaceId: workspace.workspaceId,
		userEmail: auth.email
	});
	if (meeting.status === "cancelled") return { meeting };
	if (meeting.calendarEventId) {
		const integrationUserId = meeting.integrationUserId ?? auth.uid;
		const { tokens } = await getGoogleWorkspaceTokens({ userId: integrationUserId });
		if (!tokens?.accessToken) throw new BadRequestError("Google Workspace connection is required to cancel this meeting");
		const { clientId: googleClientId, clientSecret: googleClientSecret } = resolveGoogleWorkspaceOAuthCredentials();
		let accessToken = tokens.accessToken;
		if (typeof tokens.accessTokenExpiresAtMs === "number" && tokens.accessTokenExpiresAtMs <= Date.now() + 6e4) {
			if (!tokens.refreshToken) throw new BadRequestError("Google Workspace access has expired. Reconnect your account.");
			if (!googleClientId || !googleClientSecret) throw new ServiceUnavailableError("Google Workspace refresh credentials are not configured");
			const refreshed = await refreshGoogleWorkspaceAccessToken({
				clientId: googleClientId,
				clientSecret: googleClientSecret,
				refreshToken: tokens.refreshToken
			});
			accessToken = refreshed.access_token;
			await upsertGoogleWorkspaceTokens({
				userId: integrationUserId,
				userEmail: tokens.userEmail,
				accessToken: refreshed.access_token,
				refreshToken: refreshed.refresh_token ?? tokens.refreshToken,
				idToken: refreshed.id_token ?? tokens.idToken,
				scopes: typeof refreshed.scope === "string" ? refreshed.scope.split(" ").filter(Boolean) : tokens.scopes,
				accessTokenExpiresAtMs: typeof refreshed.expires_in === "number" ? Date.now() + refreshed.expires_in * 1e3 : tokens.accessTokenExpiresAtMs
			});
		}
		await cancelGoogleCalendarEvent({
			accessToken,
			eventId: meeting.calendarEventId
		});
	}
	const { meeting: updatedMeeting } = await updateMeetingRecord({
		userId: auth.uid,
		userEmail: auth.email,
		workspaceId: workspace.workspaceId,
		legacyId: body.legacyId,
		status: "cancelled"
	});
	const attendeeEmails = sanitizeMeetingParticipantEmails(meeting.attendeeEmails, auth.email);
	const meetingStartIso = new Date(meeting.startTimeMs).toISOString();
	return {
		meeting: updatedMeeting,
		notificationSummary: await notifyMeetingCancelledEmails({
			recipientEmails: attendeeEmails,
			meetingTitle: meeting.title,
			meetingStartIso,
			meetingTimezone: meeting.timezone,
			cancelledBy: auth.name ?? auth.email ?? "Cohorts",
			cancellationReason: body.reason ?? null
		})
	};
});
var Route$47 = createFileRoute("/api/meetings/cancel")({ server: { handlers: handlers$24 } });
var ALERT_WEBHOOK_URL = process.env.SCHEDULER_ALERT_WEBHOOK_URL;
var DEFAULT_FAILURE_THRESHOLD = Number(process.env.SCHEDULER_ALERT_FAILURE_THRESHOLD ?? "3");
function resolveThreshold(input) {
	if (typeof input.failureThresholdOverride === "number" && Number.isFinite(input.failureThresholdOverride) && input.failureThresholdOverride >= 1) return input.failureThresholdOverride;
	return Math.max(1, DEFAULT_FAILURE_THRESHOLD);
}
function determineSeverity(input) {
	const providerThresholds = (Array.isArray(input.providerFailureThresholds) ? input.providerFailureThresholds : []).map((entry) => ({
		providerId: entry.providerId,
		failedJobs: entry.failedJobs,
		threshold: typeof entry.threshold === "number" && Number.isFinite(entry.threshold) && entry.threshold >= 1 ? entry.threshold : Math.max(1, DEFAULT_FAILURE_THRESHOLD)
	}));
	if (providerThresholds.length > 0) {
		if (providerThresholds.some((entry) => {
			const threshold = entry.threshold;
			return entry.failedJobs >= threshold;
		})) return "critical";
		if (providerThresholds.some((entry) => entry.failedJobs > 0)) return "warning";
	}
	const threshold = resolveThreshold(input);
	if (input.failedJobs >= threshold) return "critical";
	if (input.failedJobs > 0 || input.hadQueuedJobs && input.processedJobs === 0) return "warning";
	return "info";
}
function buildAlertMessage(input, severity) {
	const segments = [
		`Scheduler ${input.source} run reported ${severity.toUpperCase()}.`,
		`Processed: ${input.processedJobs}`,
		`Succeeded: ${input.successfulJobs}`,
		`Failed: ${input.failedJobs}`
	];
	const threshold = resolveThreshold(input);
	if (threshold !== DEFAULT_FAILURE_THRESHOLD) segments.push(`Failure threshold: ${threshold}`);
	if (input.providerFailureThresholds?.length) {
		const details = input.providerFailureThresholds.map((entry) => `${entry.providerId}:${entry.failedJobs}/${entry.threshold ?? "default"}`).join(", ");
		segments.push(`Per-provider: ${details}`);
	}
	if (input.hadQueuedJobs) segments.push(`Queued observed: ${input.inspectedQueuedJobs ?? "unknown"}`);
	if (typeof input.durationMs === "number") segments.push(`Duration: ${Math.round(input.durationMs)}ms`);
	if (input.operation) segments.push(`Operation: ${input.operation}`);
	if (input.notes) segments.push(`Notes: ${input.notes}`);
	if (input.errors?.length) segments.push(`Errors: ${input.errors.slice(0, 3).join(" | ")}`);
	return segments.join(" \n ");
}
async function sendAlert(message, severity) {
	if (!ALERT_WEBHOOK_URL) return;
	try {
		await fetch(ALERT_WEBHOOK_URL, {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({
				severity,
				message,
				source: "scheduler",
				timestamp: (/* @__PURE__ */ new Date()).toISOString()
			})
		});
	} catch (error) {
		console.error("[scheduler-monitor] failed to dispatch webhook alert", error);
	}
}
async function recordSchedulerEvent(input) {
	const severity = determineSeverity(input);
	const safeErrors = Array.isArray(input.errors) ? input.errors.filter((item) => typeof item === "string" && item.trim().length > 0).slice(0, 10) : [];
	const payload = {
		authSecret: process.env.SCHEDULER_EVENTS_SECRET,
		source: input.source,
		operation: input.operation ?? null,
		processedJobs: input.processedJobs,
		successfulJobs: input.successfulJobs,
		failedJobs: input.failedJobs,
		hadQueuedJobs: Boolean(input.hadQueuedJobs),
		inspectedQueuedJobs: typeof input.inspectedQueuedJobs === "number" ? input.inspectedQueuedJobs : null,
		durationMs: typeof input.durationMs === "number" ? input.durationMs : null,
		notes: input.notes ?? null,
		errors: safeErrors,
		failureThreshold: resolveThreshold(input),
		providerFailureThresholds: (input.providerFailureThresholds ?? []).map((entry) => ({
			providerId: entry.providerId,
			failedJobs: entry.failedJobs,
			threshold: typeof entry.threshold === "number" && Number.isFinite(entry.threshold) && entry.threshold >= 0 ? entry.threshold : null
		})),
		severity
	};
	try {
		const convex = getSystemConvexClient();
		if (convex) await convex.mutation(internal.schedulerEvents.insert, payload);
	} catch (error) {
		console.error("[scheduler-monitor] failed to persist event", error);
	}
	if (severity === "warning" || severity === "critical") await sendAlert(buildAlertMessage(input, severity), severity);
}
var CACHE_TTL_MS = 300 * 1e3;
var preferenceCache = /* @__PURE__ */ new Map();
var _convexClient$3 = null;
function getConvexClient$3() {
	if (_convexClient$3) return _convexClient$3;
	const url = process.env.CONVEX_URL ?? "https://grand-sparrow-698.convex.cloud";
	if (!url) return null;
	_convexClient$3 = new ConvexHttpClient(url);
	return _convexClient$3;
}
function isValidThreshold(value) {
	return typeof value === "number" && Number.isFinite(value) && value >= 0;
}
function toSchedulerAlertPreference(value) {
	if (!value || typeof value !== "object" || Array.isArray(value)) return null;
	const threshold = value.failureThreshold;
	if (threshold === null || isValidThreshold(threshold)) return { failureThreshold: threshold };
	return null;
}
async function getSchedulerAlertPreference(providerId) {
	const cached = preferenceCache.get(providerId);
	if (cached && cached.expiresAt > Date.now()) return cached.value;
	const convex = getConvexClient$3();
	if (!convex) {
		preferenceCache.delete(providerId);
		return null;
	}
	const preference = toSchedulerAlertPreference(await convex.query(internal.schedulerAlertPreferences.get, { providerId }));
	if (!preference) {
		preferenceCache.delete(providerId);
		return null;
	}
	preferenceCache.set(providerId, {
		value: preference,
		expiresAt: Date.now() + CACHE_TTL_MS
	});
	return preference;
}
var workerSchema = object({
	maxJobs: number().optional(),
	maxWorkspaces: number().optional()
});
function resolveConvexHttpUrl() {
	return "https://grand-sparrow-698.convex.site".replace(/\/$/, "");
}
var handlers$23 = adaptApiHandler({
	bodySchema: workerSchema,
	rateLimit: "sensitive"
}, async (_req, { auth, body }) => {
	if (!auth.isCron) throw new UnauthorizedError("Worker authentication required");
	const startedAt = Date.now();
	const cronSecret = process.env.INTEGRATIONS_CRON_SECRET;
	if (!cronSecret) throw new Error("INTEGRATIONS_CRON_SECRET is not configured");
	const convexHttpUrl = resolveConvexHttpUrl();
	const processResponse = await fetch(`${convexHttpUrl}/cron/ad-sync-worker`, {
		method: "POST",
		cache: "no-store",
		headers: {
			"Content-Type": "application/json",
			"x-cron-key": cronSecret
		},
		body: JSON.stringify({
			mode: "all",
			maxJobs: body.maxJobs
		})
	});
	const result = await processResponse.json().catch(() => ({ error: "Invalid response from Convex ad sync worker" }));
	const processedJobs = result.processedJobs ?? 0;
	const successfulJobs = result.successfulJobs ?? processedJobs;
	const failedJobs = result.failedJobs ?? 0;
	const hadQueuedJobs = processedJobs > 0 || failedJobs > 0;
	const summary = {
		processedJobs,
		successfulJobs,
		failedJobs,
		inspectedQueuedJobs: processedJobs + failedJobs,
		hadQueuedJobs,
		mode: result.mode ?? "all",
		jobResults: [],
		timestamp: (/* @__PURE__ */ new Date()).toISOString()
	};
	if (!processResponse.ok) {
		console.error("[integrations/worker] Convex ad sync worker failed:", result);
		await recordSchedulerEvent({
			source: "worker",
			processedJobs,
			successfulJobs,
			failedJobs: failedJobs + 1,
			hadQueuedJobs,
			inspectedQueuedJobs: summary.inspectedQueuedJobs,
			durationMs: Date.now() - startedAt,
			errors: [result.error ?? `Convex worker HTTP ${processResponse.status}`],
			notes: "Convex /cron/ad-sync-worker returned an error"
		});
		throw new Error(result.error ?? `Convex ad sync worker failed (${processResponse.status})`);
	}
	console.log("[integrations/worker] Completed batch processing via Convex:", summary);
	const providerFailureThresholds = await Promise.all([
		"google",
		"facebook",
		"google-analytics"
	].map(async (providerId) => {
		try {
			return {
				providerId,
				failedJobs: 0,
				threshold: (await getSchedulerAlertPreference(providerId))?.failureThreshold ?? null
			};
		} catch (error) {
			console.error("[integrations/worker] failed to load alert preference", providerId, error);
			return {
				providerId,
				failedJobs: 0,
				threshold: null
			};
		}
	}));
	await recordSchedulerEvent({
		source: "worker",
		processedJobs,
		successfulJobs,
		failedJobs,
		hadQueuedJobs,
		inspectedQueuedJobs: summary.inspectedQueuedJobs,
		durationMs: Date.now() - startedAt,
		errors: failedJobs > 0 ? [`${failedJobs} job(s) failed in Convex processor`] : [],
		providerFailureThresholds,
		notes: "Delegated to Convex processAllQueuedJobs"
	});
	return summary;
});
var Route$46 = createFileRoute("/api/integrations/worker")({ server: { handlers: handlers$23 } });
function toMillis$2(value) {
	if (value === null || value === void 0) return null;
	if (value instanceof Date) {
		const ms = value.getTime();
		return Number.isNaN(ms) ? null : ms;
	}
	if (typeof value === "number") {
		if (!Number.isFinite(value)) return null;
		return value;
	}
	if (typeof value === "string") {
		const parsed = Date.parse(value);
		return Number.isNaN(parsed) ? null : parsed;
	}
	const maybeToMillis = value;
	if (typeof maybeToMillis.toMillis === "function") try {
		const ms = maybeToMillis.toMillis();
		return Number.isFinite(ms) ? ms : null;
	} catch {
		return null;
	}
	const maybeToDate = value;
	if (typeof maybeToDate.toDate === "function") try {
		const date = maybeToDate.toDate();
		const ms = date instanceof Date ? date.getTime() : NaN;
		return Number.isNaN(ms) ? null : ms;
	} catch {
		return null;
	}
	return null;
}
function getConvexClientForUser$2(userId) {
	return createConvexAdminClient({ auth: {
		uid: userId,
		email: null,
		name: null,
		claims: { provider: "convex" },
		isCron: false
	} });
}
function normalizeClientId$2(value) {
	if (typeof value !== "string") return null;
	const trimmed = value.trim();
	return trimmed.length > 0 ? trimmed : null;
}
function shouldUseConvexAds() {
	return Boolean(process.env.CONVEX_URL ?? "https://grand-sparrow-698.convex.cloud");
}
/**
* Executes a Convex mutation with error handling and logging.
*/
async function executeMutation$2(convex, name, args, context = {}) {
	try {
		return await convex.mutation(name, args);
	} catch (error) {
		logger.error(`Convex Mutation Error: ${name}`, error, {
			type: "convex_error",
			method: "mutation",
			name,
			...context
		});
		throw error;
	}
}
/**
* Executes a Convex query with error handling and logging.
*/
var executeQuery$1 = (0, import_react.cache)(async (convex, name, args, context = {}) => {
	try {
		return await convex.query(name, args);
	} catch (error) {
		logger.error(`Convex Query Error: ${name}`, error, {
			type: "convex_error",
			method: "query",
			name,
			...context
		});
		throw error;
	}
});
async function persistIntegrationTokens(options) {
	const workspaceId = await resolveWorkspaceIdForUser(options.userId);
	const convex = getConvexClientForUser$2(options.userId);
	if (!convex) throw new Error("Convex admin client is not configured");
	await executeMutation$2(convex, "adsIntegrations:persistIntegrationTokens", {
		workspaceId,
		providerId: options.providerId,
		clientId: normalizeClientId$2(options.clientId),
		accessToken: options.accessToken,
		refreshToken: options.refreshToken,
		idToken: options.idToken,
		scopes: options.scopes,
		status: options.status,
		accessTokenExpiresAtMs: options.accessTokenExpiresAt === void 0 ? void 0 : toMillis$2(options.accessTokenExpiresAt),
		refreshTokenExpiresAtMs: options.refreshTokenExpiresAt === void 0 ? void 0 : toMillis$2(options.refreshTokenExpiresAt),
		developerToken: options.developerToken,
		loginCustomerId: options.loginCustomerId,
		managerCustomerId: options.managerCustomerId,
		accountId: options.accountId,
		accountName: options.accountName
	}, {
		userId: options.userId,
		providerId: options.providerId
	});
}
async function updateIntegrationCredentials(options) {
	const workspaceId = await resolveWorkspaceIdForUser(options.userId);
	const convex = getConvexClientForUser$2(options.userId);
	if (!convex) throw new Error("Convex admin client is not configured");
	await executeMutation$2(convex, "adsIntegrations:updateIntegrationCredentials", {
		workspaceId,
		providerId: options.providerId,
		clientId: normalizeClientId$2(options.clientId),
		accessToken: options.accessToken,
		refreshToken: options.refreshToken,
		idToken: options.idToken,
		accessTokenExpiresAtMs: options.accessTokenExpiresAt === void 0 ? void 0 : toMillis$2(options.accessTokenExpiresAt),
		refreshTokenExpiresAtMs: options.refreshTokenExpiresAt === void 0 ? void 0 : toMillis$2(options.refreshTokenExpiresAt),
		developerToken: options.developerToken,
		loginCustomerId: options.loginCustomerId,
		managerCustomerId: options.managerCustomerId,
		accountId: options.accountId,
		accountName: options.accountName
	}, {
		userId: options.userId,
		providerId: options.providerId
	});
}
async function enqueueSyncJob(options) {
	const workspaceId = await resolveWorkspaceIdForUser(options.userId);
	const convex = getConvexClientForUser$2(options.userId);
	if (!convex) throw new Error("Convex admin client is not configured");
	await executeMutation$2(convex, "adsIntegrations:enqueueSyncJob", {
		workspaceId,
		providerId: options.providerId,
		clientId: normalizeClientId$2(options.clientId),
		jobType: options.jobType ?? "initial-backfill",
		timeframeDays: options.timeframeDays ?? 90,
		cronKey: process.env.INTEGRATIONS_CRON_SECRET
	}, {
		userId: options.userId,
		providerId: options.providerId
	});
}
async function getAdIntegration(options) {
	const workspaceId = await resolveWorkspaceIdForUser(options.userId);
	const convex = getConvexClientForUser$2(options.userId);
	if (!convex) return null;
	const row = await executeQuery$1(convex, "adsIntegrations:getAdIntegration", {
		workspaceId,
		providerId: options.providerId,
		clientId: normalizeClientId$2(options.clientId)
	}, {
		userId: options.userId,
		providerId: options.providerId
	});
	if (!row) return null;
	return {
		id: options.providerId,
		providerId: row.providerId,
		accessToken: row.accessToken,
		idToken: row.idToken,
		refreshToken: row.refreshToken,
		scopes: row.scopes,
		accountId: row.accountId,
		accountName: row.accountName,
		currency: row.currency,
		developerToken: row.developerToken,
		loginCustomerId: row.loginCustomerId,
		managerCustomerId: row.managerCustomerId,
		accessTokenExpiresAt: row.accessTokenExpiresAtMs ?? null,
		refreshTokenExpiresAt: row.refreshTokenExpiresAtMs ?? null,
		lastSyncStatus: row.lastSyncStatus,
		lastSyncMessage: row.lastSyncMessage,
		lastSyncedAt: row.lastSyncedAtMs ?? null,
		lastSyncRequestedAt: row.lastSyncRequestedAtMs ?? null,
		linkedAt: row.linkedAtMs ?? null,
		autoSyncEnabled: row.autoSyncEnabled,
		syncFrequencyMinutes: row.syncFrequencyMinutes,
		scheduledTimeframeDays: row.scheduledTimeframeDays
	};
}
async function claimNextSyncJob(options) {
	const workspaceId = await resolveWorkspaceIdForUser(options.userId);
	const convex = getConvexClientForUser$2(options.userId);
	if (!convex) return null;
	const job = await executeMutation$2(convex, "adsIntegrations:claimNextSyncJob", { workspaceId }, { userId: options.userId });
	if (!job) return null;
	return {
		id: job.id,
		providerId: job.providerId,
		clientId: job.clientId ?? null,
		jobType: job.jobType,
		timeframeDays: job.timeframeDays,
		status: job.status,
		createdAt: job.createdAtMs ?? null,
		startedAt: job.startedAtMs ?? null,
		processedAt: job.processedAtMs ?? null,
		errorMessage: job.errorMessage
	};
}
async function completeSyncJob(options) {
	const convex = getConvexClientForUser$2(options.userId);
	if (!convex) throw new Error("Convex admin client is not configured");
	await executeMutation$2(convex, "adsIntegrations:completeSyncJob", { jobId: options.jobId }, {
		userId: options.userId,
		jobId: options.jobId
	});
}
async function failSyncJob(options) {
	const convex = getConvexClientForUser$2(options.userId);
	if (!convex) throw new Error("Convex admin client is not configured");
	await executeMutation$2(convex, "adsIntegrations:failSyncJob", {
		jobId: options.jobId,
		message: options.message
	}, {
		userId: options.userId,
		jobId: options.jobId
	});
}
async function updateIntegrationStatus(options) {
	const workspaceId = await resolveWorkspaceIdForUser(options.userId);
	const convex = getConvexClientForUser$2(options.userId);
	if (!convex) throw new Error("Convex admin client is not configured");
	await executeMutation$2(convex, "adsIntegrations:updateIntegrationStatus", {
		workspaceId,
		providerId: options.providerId,
		clientId: normalizeClientId$2(options.clientId),
		status: options.status,
		message: options.message ?? null
	}, {
		userId: options.userId,
		providerId: options.providerId
	});
}
async function writeMetricsBatch(options) {
	if (!shouldUseConvexAds()) throw new Error("Convex ads are not enabled");
	const workspaceId = await resolveWorkspaceIdForUser(options.userId);
	const convex = getConvexClientForUser$2(options.userId);
	if (!convex) throw new Error("Convex admin client is not configured");
	const metrics = options.metrics;
	if (!metrics.length) return;
	const chunkSize = 100;
	const chunks = [];
	for (let i = 0; i < metrics.length; i += chunkSize) chunks.push(metrics.slice(i, i + chunkSize));
	await Promise.all(chunks.map((chunk) => executeMutation$2(convex, "adsIntegrations:writeMetricsBatch", {
		workspaceId,
		metrics: chunk.map((metric) => ({
			providerId: metric.providerId,
			clientId: normalizeClientId$2(metric.clientId ?? null),
			accountId: normalizeClientId$2(metric.accountId ?? null),
			date: metric.date,
			spend: metric.spend,
			impressions: metric.impressions,
			clicks: metric.clicks,
			conversions: metric.conversions,
			revenue: metric.revenue ?? null,
			currency: metric.currency ?? null,
			currencySource: metric.currencySource ?? null,
			campaignId: metric.campaignId,
			campaignName: metric.campaignName,
			creatives: metric.creatives,
			rawPayload: metric.rawPayload
		}))
	}, {
		userId: options.userId,
		metricsCount: chunk.length
	})));
}
async function hasPendingSyncJob(options) {
	const workspaceId = await resolveWorkspaceIdForUser(options.userId);
	const convex = getConvexClientForUser$2(options.userId);
	if (!convex) return false;
	return await executeQuery$1(convex, "adsIntegrations:hasPendingSyncJob", {
		workspaceId,
		providerId: options.providerId,
		clientId: normalizeClientId$2(options.clientId)
	}, {
		userId: options.userId,
		providerId: options.providerId
	});
}
async function markIntegrationSyncRequested(options) {
	const workspaceId = await resolveWorkspaceIdForUser(options.userId);
	const convex = getConvexClientForUser$2(options.userId);
	if (!convex) throw new Error("Convex admin client is not configured");
	await executeMutation$2(convex, "adsIntegrations:markIntegrationSyncRequested", {
		workspaceId,
		providerId: options.providerId,
		clientId: normalizeClientId$2(options.clientId),
		status: options.status ?? "pending"
	}, {
		userId: options.userId,
		providerId: options.providerId
	});
}
function toMillis$1(value) {
	if (value == null) return null;
	if (value instanceof Date) return Number.isNaN(value.getTime()) ? null : value.getTime();
	if (typeof value === "number") return Number.isFinite(value) ? value : null;
	if (typeof value === "string") {
		const parsed = Date.parse(value);
		return Number.isNaN(parsed) ? null : parsed;
	}
	if (typeof value.toMillis === "function") return value.toMillis();
	if (typeof value.toDate === "function") return toMillis$1(value.toDate());
	return null;
}
function getConvexClientForUser$1(userId) {
	return createConvexAdminClient({ auth: {
		uid: userId,
		email: null,
		name: null,
		claims: { provider: "convex" },
		isCron: false
	} });
}
function normalizeClientId$1(value) {
	return typeof value === "string" && value.trim().length > 0 ? value.trim() : null;
}
async function executeMutation$1(convex, name, args) {
	return await convex.mutation(name, args);
}
async function executeQuery(convex, name, args) {
	return await convex.query(name, args);
}
async function persistGoogleAnalyticsTokens(options) {
	const workspaceId = await resolveWorkspaceIdForUser(options.userId);
	const convex = getConvexClientForUser$1(options.userId);
	if (!convex) throw new Error("Convex admin client is not configured");
	await executeMutation$1(convex, "analyticsIntegrations:persistGoogleAnalyticsTokens", {
		workspaceId,
		clientId: normalizeClientId$1(options.clientId),
		accessToken: options.accessToken,
		refreshToken: options.refreshToken,
		idToken: options.idToken,
		scopes: options.scopes,
		status: options.status,
		accessTokenExpiresAtMs: toMillis$1(options.accessTokenExpiresAt),
		refreshTokenExpiresAtMs: toMillis$1(options.refreshTokenExpiresAt),
		accountId: options.accountId,
		accountName: options.accountName
	});
}
async function updateGoogleAnalyticsCredentials(options) {
	const workspaceId = await resolveWorkspaceIdForUser(options.userId);
	const convex = getConvexClientForUser$1(options.userId);
	if (!convex) throw new Error("Convex admin client is not configured");
	await executeMutation$1(convex, "analyticsIntegrations:updateGoogleAnalyticsCredentialsInternal", {
		workspaceId,
		clientId: normalizeClientId$1(options.clientId),
		accessToken: options.accessToken,
		refreshToken: options.refreshToken,
		idToken: options.idToken,
		accessTokenExpiresAtMs: options.accessTokenExpiresAt === void 0 ? void 0 : toMillis$1(options.accessTokenExpiresAt),
		refreshTokenExpiresAtMs: options.refreshTokenExpiresAt === void 0 ? void 0 : toMillis$1(options.refreshTokenExpiresAt),
		accountId: options.accountId,
		accountName: options.accountName,
		currency: options.currency
	});
}
async function getGoogleAnalyticsIntegration(options) {
	const workspaceId = await resolveWorkspaceIdForUser(options.userId);
	const convex = getConvexClientForUser$1(options.userId);
	if (!convex) return null;
	try {
		return await executeQuery(convex, "analyticsIntegrations:getGoogleAnalyticsIntegration", {
			workspaceId,
			clientId: normalizeClientId$1(options.clientId)
		});
	} catch (error) {
		logger.error("Convex Query Error: analyticsIntegrations:getGoogleAnalyticsIntegration", error, { userId: options.userId });
		throw error;
	}
}
async function updateGoogleAnalyticsStatus(options) {
	const workspaceId = await resolveWorkspaceIdForUser(options.userId);
	const convex = getConvexClientForUser$1(options.userId);
	if (!convex) throw new Error("Convex admin client is not configured");
	await executeMutation$1(convex, "analyticsIntegrations:updateGoogleAnalyticsStatus", {
		workspaceId,
		clientId: normalizeClientId$1(options.clientId),
		status: options.status,
		message: options.message ?? null
	});
}
async function hasPendingGoogleAnalyticsSyncJob(options) {
	const workspaceId = await resolveWorkspaceIdForUser(options.userId);
	const convex = getConvexClientForUser$1(options.userId);
	if (!convex) return false;
	return await executeQuery(convex, "analyticsIntegrations:hasPendingGoogleAnalyticsSyncJob", {
		workspaceId,
		clientId: normalizeClientId$1(options.clientId)
	});
}
async function markGoogleAnalyticsSyncRequested(options) {
	const workspaceId = await resolveWorkspaceIdForUser(options.userId);
	const convex = getConvexClientForUser$1(options.userId);
	if (!convex) throw new Error("Convex admin client is not configured");
	await executeMutation$1(convex, "analyticsIntegrations:markGoogleAnalyticsSyncRequested", {
		workspaceId,
		clientId: normalizeClientId$1(options.clientId),
		status: options.status ?? "pending"
	});
}
async function writeAnalyticsMetricsBatch(options) {
	const workspaceId = await resolveWorkspaceIdForUser(options.userId);
	const convex = getConvexClientForUser$1(options.userId);
	if (!convex) throw new Error("Convex admin client is not configured");
	return await executeMutation$1(convex, "analyticsIntegrations:writeAnalyticsMetricsBatchInternal", {
		workspaceId,
		clientId: normalizeClientId$1(options.clientId),
		propertyId: options.propertyId,
		currency: options.currency ?? null,
		daily: options.daily,
		breakdowns: options.breakdowns ?? []
	});
}
var DEFAULT_SYNC_FREQUENCY_MINUTES = 360;
var DEFAULT_TIMEFRAME_DAYS = 90;
var _convexClient$2 = null;
function getConvexClient$2() {
	if (_convexClient$2) return _convexClient$2;
	const url = process.env.CONVEX_URL ?? "https://grand-sparrow-698.convex.cloud";
	if (!url) return null;
	_convexClient$2 = new ConvexHttpClient(url);
	return _convexClient$2;
}
var listWorkspaceIntegrationIds = (0, import_react.cache)(async (convex, workspaceId) => {
	const [adsProviderIds, analyticsProviderIds] = await Promise.all([convex.query(internal.adsIntegrations.listWorkspaceIntegrationIds, { workspaceId }), convex.query(internal.analyticsIntegrations.listWorkspaceIntegrationIds, { workspaceId })]);
	return Array.from(new Set([...adsProviderIds ?? [], ...analyticsProviderIds ?? []]));
});
var listAllWorkspacesWithIntegrations = (0, import_react.cache)(async (convex, limit) => {
	const [adsWorkspaceIds, analyticsWorkspaceIds] = await Promise.all([convex.query(internal.adsIntegrations.listAllWorkspacesWithIntegrations, { limit }), convex.query(internal.analyticsIntegrations.listAllWorkspacesWithIntegrations, { limit })]);
	return Array.from(new Set([...adsWorkspaceIds ?? [], ...analyticsWorkspaceIds ?? []]));
});
async function getIntegrationForProvider(userId, providerId) {
	if (providerId === "google-analytics") return await getGoogleAnalyticsIntegration({ userId });
	return await getAdIntegration({
		userId,
		providerId
	});
}
async function hasPendingJobForProvider(userId, providerId) {
	if (providerId === "google-analytics") return await hasPendingGoogleAnalyticsSyncJob({ userId });
	return await hasPendingSyncJob({
		userId,
		providerId
	});
}
async function markSyncRequestedForProvider(userId, providerId) {
	if (providerId === "google-analytics") {
		await markGoogleAnalyticsSyncRequested({ userId });
		return;
	}
	await markIntegrationSyncRequested({
		userId,
		providerId
	});
}
function minutesSince(date) {
	if (!date || !(date instanceof Date) || Number.isNaN(date.getTime())) return null;
	const now = /* @__PURE__ */ new Date();
	if (date.getTime() > now.getTime()) return 0;
	return differenceInMinutes(now, date);
}
function resolveTimestamp(value) {
	if (!value) return null;
	if (value instanceof Date) return value;
	if (typeof value === "object" && value !== null && "toDate" in value && typeof value.toDate === "function") try {
		return value.toDate();
	} catch (error) {
		console.warn("[integration-auto-sync] failed to convert timestamp via toDate", error);
		return null;
	}
	if (typeof value === "object" && value !== null && "toMillis" in value && typeof value.toMillis === "function") try {
		const millis = value.toMillis();
		return Number.isFinite(millis) ? new Date(millis) : null;
	} catch (error) {
		console.warn("[integration-auto-sync] failed to convert timestamp via toMillis", error);
		return null;
	}
	if (typeof value === "string") {
		const parsed = Date.parse(value);
		return Number.isNaN(parsed) ? null : new Date(parsed);
	}
	if (typeof value === "number" && Number.isFinite(value)) return new Date(value);
	return null;
}
async function scheduleIntegrationSync(options) {
	const { userId, providerId, force = false, timeframeDays } = options;
	const integration = await getIntegrationForProvider(userId, providerId);
	if (!integration) {
		console.warn("[integration-auto-sync] integration not found", {
			userId,
			providerId
		});
		return false;
	}
	if (integration.autoSyncEnabled === false && !force) return false;
	const frequencyMinutes = integration.syncFrequencyMinutes ?? DEFAULT_SYNC_FREQUENCY_MINUTES;
	const resolvedTimeframeDays = typeof timeframeDays === "number" && Number.isFinite(timeframeDays) ? Math.max(1, Math.floor(timeframeDays)) : integration.scheduledTimeframeDays ?? DEFAULT_TIMEFRAME_DAYS;
	const lastSyncedAt = resolveTimestamp(integration.lastSyncedAt);
	const lastRequestedAt = resolveTimestamp(integration.lastSyncRequestedAt);
	const sinceLastSync = minutesSince(lastSyncedAt);
	const sinceLastRequest = minutesSince(lastRequestedAt);
	if (!force) {
		if (sinceLastRequest !== null && sinceLastRequest < frequencyMinutes / 2) return false;
		if (sinceLastSync !== null && sinceLastSync < frequencyMinutes) return false;
		if (await hasPendingJobForProvider(userId, providerId)) return false;
	}
	await enqueueSyncJob({
		userId,
		providerId,
		jobType: force ? "manual-sync" : "scheduled-sync",
		timeframeDays: resolvedTimeframeDays
	});
	await markSyncRequestedForProvider(userId, providerId);
	return true;
}
async function scheduleSyncsForUser(options) {
	const { userId, providerIds, force = false, timeframeDays } = options;
	if (providerIds && providerIds.length > 0) {
		const results = await Promise.all(providerIds.map(async (providerId) => {
			return {
				providerId,
				scheduled: await scheduleIntegrationSync({
					userId,
					providerId,
					force,
					timeframeDays
				})
			};
		}));
		return {
			scheduled: results.flatMap((result) => result.scheduled ? [result.providerId] : []),
			skipped: results.flatMap((result) => !result.scheduled ? [result.providerId] : [])
		};
	}
	const integrationsSnapshot = await getUserIntegrationIds(userId);
	if (!integrationsSnapshot.length) return {
		scheduled: [],
		skipped: []
	};
	const results = await Promise.all(integrationsSnapshot.map(async (providerId) => {
		return {
			providerId,
			scheduled: await scheduleIntegrationSync({
				userId,
				providerId,
				force,
				timeframeDays
			})
		};
	}));
	return {
		scheduled: results.flatMap((result) => result.scheduled ? [result.providerId] : []),
		skipped: results.flatMap((result) => !result.scheduled ? [result.providerId] : [])
	};
}
async function getUserIntegrationIds(userId) {
	const convex = getConvexClient$2();
	if (!convex) {
		console.warn("[integration-auto-sync] convex client not available");
		return [];
	}
	return await listWorkspaceIntegrationIds(convex, await resolveWorkspaceIdForUser(userId));
}
async function scheduleSyncsForAllUsers(options = {}) {
	const { force = false, providerIds, maxUsers, timeframeDays } = options;
	const convex = getConvexClient$2();
	if (!convex) {
		console.warn("[integration-auto-sync] convex client not available");
		return {
			scheduled: [],
			skipped: []
		};
	}
	const workspaceIdsResult = await listAllWorkspacesWithIntegrations(convex, typeof maxUsers === "number" && Number.isFinite(maxUsers) && maxUsers > 0 ? Math.max(1, Math.floor(maxUsers)) : 1e3);
	const workspaceIds = Array.isArray(workspaceIdsResult) ? workspaceIdsResult.filter((id) => typeof id === "string" && id.length > 0) : [];
	const scheduled = [];
	const skipped = [];
	await Promise.all(workspaceIds.map(async (workspaceId) => {
		const result = await scheduleSyncsForUser({
			userId: workspaceId,
			providerIds,
			force,
			timeframeDays
		});
		if (result.scheduled.length > 0) scheduled.push({
			userId: workspaceId,
			providerIds: result.scheduled
		});
		if (result.skipped.length > 0) skipped.push({
			userId: workspaceId,
			providerIds: result.skipped
		});
	}));
	return {
		scheduled,
		skipped
	};
}
var handlers$22 = adaptApiHandler({
	bodySchema: object({
		force: boolean().optional(),
		providerIds: array(string()).optional(),
		providerId: string().optional(),
		allUsers: boolean().optional(),
		userId: string().optional()
	}),
	querySchema: object({ userId: string().optional() }),
	rateLimit: "sensitive"
}, async (_req, { auth, body, query }) => {
	const force = Boolean(body.force);
	let sanitizedProviderIds = body.providerIds;
	if (body.providerId && !sanitizedProviderIds) sanitizedProviderIds = [body.providerId];
	if (body.allUsers) {
		if (!auth.isCron) throw new ForbiddenError("Global scheduling restricted to cron requests");
		return {
			scope: "all-users",
			...await scheduleSyncsForAllUsers({
				force,
				providerIds: sanitizedProviderIds
			})
		};
	}
	let targetUserId = body.userId ?? query.userId ?? null;
	if (!auth.isCron) {
		const isAdmin = auth.claims?.role === "admin";
		if (targetUserId && targetUserId !== auth.uid && !isAdmin) throw new ForbiddenError("Admin access required");
		targetUserId = targetUserId ?? auth.uid ?? null;
	}
	if (!targetUserId) throw new UnauthorizedError("Missing userId");
	if (sanitizedProviderIds && sanitizedProviderIds.length === 1) {
		const providerId = sanitizedProviderIds[0];
		const scheduled = await scheduleIntegrationSync({
			userId: targetUserId,
			providerId,
			force
		});
		return {
			userId: targetUserId,
			providerId,
			scheduled
		};
	}
	const result = await scheduleSyncsForUser({
		userId: targetUserId,
		providerIds: sanitizedProviderIds,
		force
	});
	return {
		userId: targetUserId,
		...result
	};
});
var Route$45 = createFileRoute("/api/integrations/schedule")({ server: { handlers: handlers$22 } });
function normalizeCost(costMicros) {
	if (costMicros == null) return 0;
	const value = typeof costMicros === "string" ? parseFloat(costMicros) : costMicros;
	return Number.isFinite(value) ? value / 1e6 : 0;
}
async function executeGoogleAdsApiRequest(options) {
	return executeIntegrationRequest(googleAdsClient, options);
}
async function googleAdsSearch(options) {
	const { accessToken, developerToken, customerId, query, loginCustomerId, pageSize = 1e3, maxPages = 1, maxRetries = DEFAULT_RETRY_CONFIG.maxRetries, onAuthError, onRateLimitHit } = options;
	let currentAccessToken = accessToken;
	const fetchPage = async (page, pageToken) => {
		const url = `${GOOGLE_API_BASE}/customers/${customerId}/googleAds:search`;
		const headers = {
			Authorization: `Bearer ${currentAccessToken}`,
			"developer-token": developerToken,
			"Content-Type": "application/json"
		};
		if (loginCustomerId) headers["login-customer-id"] = loginCustomerId;
		const { payload } = await executeGoogleAdsApiRequest({
			url,
			method: "POST",
			headers,
			body: JSON.stringify({
				query,
				pageSize,
				pageToken,
				returnTotalResultsCount: false
			}),
			operation: `search:page${page}`,
			maxRetries,
			onAuthError: async () => {
				if (onAuthError) {
					const result = await onAuthError();
					if (result.newToken) currentAccessToken = result.newToken;
					return result;
				}
				return { retry: false };
			},
			onRateLimitHit
		});
		const pageResults = Array.isArray(payload.results) ? payload.results : [];
		const nextPageToken = payload.nextPageToken ?? void 0;
		if (!nextPageToken || page + 1 >= maxPages) return pageResults;
		const nextPageResults = await fetchPage(page + 1, nextPageToken);
		return [...pageResults, ...nextPageResults];
	};
	return fetchPage(0);
}
function buildGaqlQuery(timeframeDays) {
	return `
    SELECT
      segments.date,
      campaign.id,
      campaign.name,
      metrics.impressions,
      metrics.clicks,
      metrics.cost_micros,
      metrics.conversions,
      metrics.conversions_value
    FROM campaign
    WHERE segments.date DURING LAST_${timeframeDays > 0 ? timeframeDays : 7}_DAYS
  `.replace(/\n/g, " ").replace(/\s+/g, " ").trim();
}
function resolveDeveloperToken(token) {
	const resolved = token ?? process.env.GOOGLE_ADS_DEVELOPER_TOKEN;
	if (!resolved) throw new Error("Google Ads developer token is required via integration data or GOOGLE_ADS_DEVELOPER_TOKEN env");
	return resolved;
}
async function fetchGoogleAdsMetrics(options) {
	const { accessToken, developerToken, customerId, loginCustomerId, managerCustomerId, timeframeDays, pageSize = 1e3, maxPages = 5, maxRetries = DEFAULT_RETRY_CONFIG.maxRetries, refreshAccessToken, onRateLimitHit, onTokenRefresh } = options;
	const resolvedDeveloperToken = resolveDeveloperToken(developerToken);
	const query = buildGaqlQuery(timeframeDays);
	const effectiveLoginCustomerId = loginCustomerId ?? managerCustomerId ?? null;
	let activeAccessToken = accessToken;
	let tokenRefreshAttempted = false;
	return (await googleAdsSearch({
		accessToken: activeAccessToken,
		developerToken: resolvedDeveloperToken,
		customerId,
		loginCustomerId: effectiveLoginCustomerId,
		query,
		pageSize,
		maxPages,
		maxRetries,
		onAuthError: async () => {
			if (refreshAccessToken && !tokenRefreshAttempted) {
				tokenRefreshAttempted = true;
				activeAccessToken = await refreshAccessToken();
				onTokenRefresh?.();
				return {
					retry: true,
					newToken: activeAccessToken
				};
			}
			return { retry: false };
		},
		onRateLimitHit
	})).map((row) => {
		const segments = row?.segments ?? {};
		const metricsBlock = row?.metrics ?? {};
		const campaign = row?.campaign;
		const date = segments?.date ?? "";
		const spend = normalizeCost(metricsBlock?.costMicros ?? metricsBlock?.cost_micros);
		const impressions = Number(metricsBlock?.impressions) || 0;
		const clicks = Number(metricsBlock?.clicks) || 0;
		const conversions = Number(metricsBlock?.conversions) || 0;
		const convValue = metricsBlock?.conversionsValue ?? metricsBlock?.conversions_value;
		const revenue = typeof convValue === "number" ? convValue : parseFloat(String(convValue)) || 0;
		return {
			providerId: "google",
			accountId: customerId,
			date,
			spend,
			impressions,
			clicks,
			conversions,
			revenue: revenue > 0 ? revenue : void 0,
			campaignId: typeof campaign?.id === "string" ? campaign.id : void 0,
			campaignName: typeof campaign?.name === "string" ? campaign.name : void 0,
			rawPayload: row
		};
	});
}
async function checkGoogleAdsIntegrationHealth(options) {
	const { accessToken, developerToken, customerId, loginCustomerId } = options;
	try {
		const resolvedDeveloperToken = resolveDeveloperToken(developerToken);
		const listUrl = `${GOOGLE_API_BASE}/customers:listAccessibleCustomers`;
		const listResponse = await fetch(listUrl, {
			method: "GET",
			headers: {
				Authorization: `Bearer ${accessToken}`,
				"developer-token": resolvedDeveloperToken
			}
		});
		if (!listResponse.ok) {
			const errorData = await parseJsonBodySafely(listResponse, {
				context: "Google Ads health accessible customers error",
				allowEmpty: true
			});
			const isDeveloperTokenError = listResponse.status === 401 && (errorData?.error?.message?.toLowerCase().includes("developer") ?? false);
			return {
				healthy: false,
				tokenValid: !isDeveloperTokenError,
				developerTokenValid: !isDeveloperTokenError,
				accountAccessible: false,
				error: errorData?.error?.message ?? "Token validation failed"
			};
		}
		if (customerId) {
			const query = "SELECT customer.id FROM customer LIMIT 1";
			const searchHeaders = {
				Authorization: `Bearer ${accessToken}`,
				"developer-token": resolvedDeveloperToken,
				"Content-Type": "application/json"
			};
			if (loginCustomerId) searchHeaders["login-customer-id"] = loginCustomerId;
			const searchUrl = `${GOOGLE_API_BASE}/customers/${customerId}/googleAds:search`;
			const searchResponse = await fetch(searchUrl, {
				method: "POST",
				headers: searchHeaders,
				body: JSON.stringify({
					query,
					pageSize: 1
				})
			});
			if (!searchResponse.ok) return {
				healthy: false,
				tokenValid: true,
				developerTokenValid: true,
				accountAccessible: false,
				error: (await parseJsonBodySafely(searchResponse, {
					context: "Google Ads health account search error",
					allowEmpty: true
				}))?.error?.message ?? "Account not accessible"
			};
		}
		return {
			healthy: true,
			tokenValid: true,
			developerTokenValid: true,
			accountAccessible: true
		};
	} catch (error) {
		return {
			healthy: false,
			tokenValid: false,
			developerTokenValid: false,
			accountAccessible: false,
			error: error instanceof Error ? error.message : "Health check failed"
		};
	}
}
function buildTimeRange(timeframeDays) {
	const now = /* @__PURE__ */ new Date();
	const start = new Date(now);
	start.setUTCDate(start.getUTCDate() - Math.max(0, timeframeDays - 1));
	return {
		start: toISO(start).split("T")[0],
		end: toISO(now).split("T")[0]
	};
}
function normalizeCurrency(value) {
	if (value === null || value === void 0) return 0;
	if (typeof value === "object" && value !== null) {
		const currencyObj = value;
		if (currencyObj.amount !== void 0) {
			const amount = typeof currencyObj.amount === "string" ? parseFloat(currencyObj.amount) : Number(currencyObj.amount);
			return Number.isFinite(amount) ? amount : 0;
		}
	}
	if (typeof value === "number") return Number.isFinite(value) ? value : 0;
	if (typeof value === "string") {
		const parsed = parseFloat(value);
		return Number.isFinite(parsed) ? parsed : 0;
	}
	return 0;
}
function coerceNumber$1(value) {
	if (value === null || value === void 0) return 0;
	if (typeof value === "number") return Number.isFinite(value) ? value : 0;
	if (typeof value === "string") {
		const parsed = parseFloat(value);
		return Number.isFinite(parsed) ? parsed : 0;
	}
	return 0;
}
async function fetchLinkedInAdAccounts(options) {
	const { accessToken, maxRetries = DEFAULT_RETRY_CONFIG.maxRetries } = options;
	if (!accessToken) throw new Error("LinkedIn access token is required to load ad accounts");
	const { payload } = await linkedinAdsClient.executeRequest({
		url: "https://api.linkedin.com/v2/adAccountsV2?q=search&sort.field=ID&sort.order=DESCENDING&count=100",
		method: "GET",
		headers: {
			Authorization: `Bearer ${accessToken}`,
			"X-Restli-Protocol-Version": "2.0.0"
		},
		operation: "fetchAdAccounts",
		maxRetries
	});
	return (Array.isArray(payload?.elements) ? payload.elements : []).flatMap((account) => {
		const id = typeof account.id === "string" ? account.id.replace("urn:li:sponsoredAccount:", "") : null;
		if (!id) return [];
		return [{
			id,
			name: account.name ?? `LinkedIn Account ${id}`,
			status: account.status,
			currency: account.currency
		}];
	});
}
async function fetchLinkedInAdsMetrics(options) {
	const { accessToken, accountId, timeframeDays, maxRetries = DEFAULT_RETRY_CONFIG.maxRetries, refreshAccessToken, onRateLimitHit, onTokenRefresh } = options;
	if (!accessToken) throw new Error("LinkedIn access token is required to fetch metrics");
	if (!accountId) throw new Error("Missing LinkedIn ad account ID on integration");
	let activeAccessToken = accessToken;
	let tokenRefreshAttempted = false;
	const timeRange = buildTimeRange(timeframeDays);
	const url = `https://api.linkedin.com/v2/adAnalytics?${new URLSearchParams({
		q: "statistics",
		accounts: `urn:li:sponsoredAccount:${accountId}`,
		timeGranularity: "DAILY",
		start: timeRange.start,
		end: timeRange.end
	}).toString()}`;
	const { payload } = await linkedinAdsClient.executeRequest({
		url,
		method: "GET",
		headers: {
			Authorization: `Bearer ${activeAccessToken}`,
			"X-Restli-Protocol-Version": "2.0.0"
		},
		operation: "fetchMetrics",
		maxRetries,
		onAuthError: async () => {
			if (refreshAccessToken && !tokenRefreshAttempted) {
				tokenRefreshAttempted = true;
				activeAccessToken = await refreshAccessToken();
				onTokenRefresh?.();
				return {
					retry: true,
					newToken: activeAccessToken
				};
			}
			return { retry: false };
		},
		onRateLimitHit
	});
	return (Array.isArray(payload?.elements) ? payload.elements : []).map((row) => {
		const date = row?.timeRange?.start ? formatDate(row.timeRange.start, "yyyy-MM-dd") : formatDate(/* @__PURE__ */ new Date(), "yyyy-MM-dd");
		const spend = normalizeCurrency(row?.costInLocalCurrency);
		const impressions = coerceNumber$1(row?.impressions);
		const clicks = coerceNumber$1(row?.clicks);
		const conversions = coerceNumber$1(row?.conversions);
		const revenue = normalizeCurrency(row?.externalWebsiteConversionsValue);
		return {
			providerId: "linkedin",
			accountId,
			date,
			spend,
			impressions,
			clicks,
			conversions,
			revenue: revenue > 0 ? revenue : void 0,
			creatives: void 0,
			rawPayload: row
		};
	});
}
function coerceNumber(value) {
	if (value === null || value === void 0) return 0;
	if (typeof value === "number") return Number.isFinite(value) ? value : 0;
	if (typeof value === "string") {
		const parsed = parseFloat(value);
		return Number.isFinite(parsed) ? parsed : 0;
	}
	return 0;
}
async function fetchTikTokAdAccounts(options) {
	const { accessToken, advertiserIds, maxRetries = DEFAULT_RETRY_CONFIG.maxRetries } = options;
	if (!accessToken) throw new Error("TikTok access token is required to load advertisers");
	const { payload } = await tiktokAdsClient.executeRequest({
		url: "https://business-api.tiktok.com/open_api/v1.3/advertiser/info/",
		method: "POST",
		headers: {
			"Content-Type": "application/json",
			"Access-Token": accessToken
		},
		body: JSON.stringify({
			advertiser_ids: advertiserIds,
			page_size: 50
		}),
		operation: "fetchAdAccounts",
		maxRetries
	});
	const accounts = (Array.isArray(payload?.data?.list) ? payload.data?.list ?? [] : []).flatMap((candidate) => {
		const id = typeof candidate?.advertiser_id === "string" ? candidate.advertiser_id : null;
		if (!id) return [];
		return [{
			id,
			name: typeof candidate?.name === "string" && candidate.name.length > 0 ? candidate.name : `TikTok advertiser ${id}`,
			status: typeof candidate?.status === "string" ? candidate.status : void 0,
			currency: typeof candidate?.currency === "string" ? candidate.currency : void 0,
			timezone: typeof candidate?.timezone === "string" ? candidate.timezone : void 0
		}];
	});
	if (!accounts.length && Array.isArray(advertiserIds)) return advertiserIds.flatMap((id) => typeof id === "string" && id.length > 0 ? [{
		id,
		name: `TikTok advertiser ${id}`
	}] : []);
	return accounts;
}
async function fetchTikTokAdsMetrics(options) {
	const { accessToken, advertiserId, timeframeDays, maxPages = 20, maxRetries = DEFAULT_RETRY_CONFIG.maxRetries, refreshAccessToken, onRateLimitHit, onTokenRefresh } = options;
	if (!accessToken) throw new Error("TikTok access token is required to fetch metrics");
	if (!advertiserId) throw new Error("TikTok advertiser ID is required");
	const metrics = [];
	const today = /* @__PURE__ */ new Date();
	const start = new Date(today);
	start.setUTCDate(start.getUTCDate() - Math.max(0, timeframeDays - 1));
	let cursor;
	let page = 0;
	let activeToken = accessToken;
	let tokenRefreshAttempted = false;
	while (page < maxPages) {
		page += 1;
		const requestPayload = {
			advertiser_id: advertiserId,
			data_level: "AUCTION_CAMPAIGN",
			dimensions: [
				"campaign_id",
				"campaign_name",
				"stat_time_day"
			],
			metrics: [
				"spend",
				"impressions",
				"clicks",
				"conversion",
				"total_complete_payment"
			],
			start_date: formatDate(start, "yyyy-MM-dd"),
			end_date: formatDate(today, "yyyy-MM-dd"),
			page_size: 200,
			time_granularity: "STAT_TIME_DAY",
			cursor,
			order_field: "spend",
			order_type: "DESC"
		};
		const { payload: body } = await tiktokAdsClient.executeRequest({
			url: "https://business-api.tiktok.com/open_api/v1.3/report/integrated/get/",
			method: "POST",
			headers: {
				"Content-Type": "application/json",
				"Access-Token": activeToken
			},
			body: JSON.stringify(requestPayload),
			operation: `fetchMetrics:page${page}`,
			maxRetries,
			onAuthError: async () => {
				if (refreshAccessToken && !tokenRefreshAttempted) {
					tokenRefreshAttempted = true;
					activeToken = await refreshAccessToken();
					onTokenRefresh?.();
					return {
						retry: true,
						newToken: activeToken
					};
				}
				return { retry: false };
			},
			onRateLimitHit
		});
		(Array.isArray(body?.data?.list) ? body.data?.list ?? [] : []).forEach((row) => {
			const dimensions = row?.dimensions ?? {};
			const metricsBlock = row?.metrics ?? {};
			const date = typeof dimensions?.stat_time_day === "string" ? dimensions.stat_time_day : formatDate(today, "yyyy-MM-dd");
			const campaignId = typeof dimensions?.campaign_id === "string" ? dimensions.campaign_id : void 0;
			const campaignName = typeof dimensions?.campaign_name === "string" ? dimensions.campaign_name : void 0;
			const spend = coerceNumber(metricsBlock?.spend);
			const impressions = coerceNumber(metricsBlock?.impressions);
			const clicks = coerceNumber(metricsBlock?.clicks);
			const conversions = coerceNumber(metricsBlock?.conversion);
			const revenue = coerceNumber(metricsBlock?.total_complete_payment);
			metrics.push({
				providerId: "tiktok",
				accountId: advertiserId,
				date,
				spend,
				impressions,
				clicks,
				conversions,
				revenue: revenue || null,
				campaignId,
				campaignName,
				rawPayload: row
			});
		});
		const responseData = body?.data;
		const nextCursor = typeof responseData?.cursor === "string" && responseData.cursor.length > 0 ? responseData.cursor : void 0;
		const hasMore = Boolean(responseData?.page_info?.has_more) || Boolean(responseData?.cursor);
		cursor = nextCursor;
		if (!hasMore || !cursor) break;
	}
	return metrics;
}
function parseGoogleApiErrorBody(text) {
	if (!text || text.trim().length === 0) return null;
	try {
		return JSON.parse(text);
	} catch {
		return null;
	}
}
function getGoogleApiErrorReasons(payload) {
	const reasons = [];
	if (!payload?.error) return reasons;
	const status = payload.error.status;
	if (typeof status === "string") reasons.push(status);
	for (const detail of payload.error.details ?? []) if (typeof detail.reason === "string") reasons.push(detail.reason);
	return reasons;
}
function isGoogleInsufficientScopeError(payload, message) {
	const combined = [
		...getGoogleApiErrorReasons(payload),
		payload?.error?.message ?? "",
		message ?? ""
	].join(" ").toLowerCase();
	return combined.includes("access_token_scope_insufficient") || combined.includes("insufficient authentication scopes") || combined.includes("insufficient permission");
}
function isGoogleRateLimitError(payload, httpStatus) {
	if (httpStatus === 429) return true;
	return getGoogleApiErrorReasons(payload).some((reason) => reason === "RATE_LIMIT_EXCEEDED" || reason === "RESOURCE_EXHAUSTED" || reason.includes("QUOTA"));
}
async function readGoogleApiError(response) {
	const text = await response.text().catch(() => "");
	return {
		payload: parseGoogleApiErrorBody(text),
		text
	};
}
function formatGoogleApiErrorMessage(context, httpStatus, payload, fallbackText) {
	const apiMessage = payload?.error?.message;
	if (typeof apiMessage === "string" && apiMessage.length > 0) return `${context} (${httpStatus}): ${apiMessage}`;
	if (fallbackText.length > 0) return `${context} (${httpStatus}): ${fallbackText}`;
	return `${context} (${httpStatus})`;
}
async function assertGoogleApiOk(response, context) {
	if (response.ok) return;
	const { payload, text } = await readGoogleApiError(response);
	if (isGoogleInsufficientScopeError(payload, text)) {
		const err = new Error(formatGoogleApiErrorMessage(context, response.status, payload, text));
		err.code = "ACCESS_TOKEN_SCOPE_INSUFFICIENT";
		throw err;
	}
	if (isGoogleRateLimitError(payload, response.status)) {
		const err = new Error(formatGoogleApiErrorMessage(context, response.status, payload, text));
		err.code = "RESOURCE_EXHAUSTED";
		throw err;
	}
	throw new Error(formatGoogleApiErrorMessage(context, response.status, payload, text));
}
var BREAKDOWN_CONFIG = {
	channel: {
		gaDimension: "sessionDefaultChannelGroup",
		label: "channel"
	},
	source: {
		gaDimension: "sessionSource",
		label: "source"
	},
	device: {
		gaDimension: "deviceCategory",
		label: "device"
	}
};
function formatGaDate$1(raw) {
	if (!raw || raw.length !== 8) return raw;
	return `${raw.slice(0, 4)}-${raw.slice(4, 6)}-${raw.slice(6, 8)}`;
}
async function runBreakdownReport(options) {
	const config = BREAKDOWN_CONFIG[options.dimension];
	const rows = [];
	let offset = 0;
	let rowCount = null;
	for (let page = 0; page < 20; page += 1) {
		const response = await fetch(`https://analyticsdata.googleapis.com/v1beta/properties/${options.propertyId}:runReport`, {
			method: "POST",
			headers: {
				Authorization: `Bearer ${options.accessToken}`,
				"Content-Type": "application/json"
			},
			body: JSON.stringify({
				dateRanges: [{
					startDate: `${Math.max(options.days, 1)}daysAgo`,
					endDate: "today"
				}],
				dimensions: [{ name: "date" }, { name: config.gaDimension }],
				metrics: [
					{ name: "totalUsers" },
					{ name: "sessions" },
					{ name: "conversions" },
					{ name: "totalRevenue" }
				],
				limit: 1e4,
				offset
			})
		});
		await assertGoogleApiOk(response, `Failed to fetch Google Analytics ${config.label} breakdown`);
		const payload = await response.json();
		if (typeof payload.rowCount === "number") rowCount = payload.rowCount;
		const pageRows = (payload.rows ?? []).flatMap((row) => {
			const rawDate = row.dimensionValues?.[0]?.value ?? "";
			const dimensionValue = row.dimensionValues?.[1]?.value?.trim() || "(not set)";
			const metricValues = row.metricValues ?? [];
			const users = Number(metricValues[0]?.value ?? 0);
			const sessions = Number(metricValues[1]?.value ?? 0);
			const conversions = Number(metricValues[2]?.value ?? 0);
			const revenue = Number(metricValues[3]?.value ?? 0);
			const date = formatGaDate$1(rawDate);
			if (!date) return [];
			return [{
				date,
				dimension: options.dimension,
				dimensionValue,
				users: Number.isFinite(users) ? users : 0,
				sessions: Number.isFinite(sessions) ? sessions : 0,
				conversions: Number.isFinite(conversions) ? conversions : 0,
				revenue: Number.isFinite(revenue) ? revenue : 0
			}];
		});
		rows.push(...pageRows);
		if (pageRows.length === 0) break;
		offset += pageRows.length;
		if (rowCount !== null && offset >= rowCount) break;
		if (rowCount === null && pageRows.length < 1e4) break;
	}
	return rows;
}
async function fetchGoogleAnalyticsBreakdowns(options) {
	return (await Promise.all([
		"channel",
		"source",
		"device"
	].map((dimension) => runBreakdownReport({
		accessToken: options.accessToken,
		propertyId: options.propertyId,
		days: options.days,
		dimension
	})))).flat();
}
var IntegrationTokenError = class extends Error {
	constructor(message, providerId, userId, options) {
		super(message);
		this.name = "IntegrationTokenError";
		this.providerId = providerId;
		this.userId = userId;
		this.isRetryable = options?.isRetryable ?? false;
		this.httpStatus = options?.httpStatus;
	}
};
/**
* Meta-only token refresh — kept separate from integration-token-refresh.ts so
* Convex node actions do not bundle google-oauth → @/lib/crypto (node:crypto).
*/
var TOKEN_REFRESH_CONFIG$2 = {
	maxRetries: 3,
	baseDelayMs: 1e3,
	maxDelayMs: 1e4
};
function computeExpiry$2(expiresInSeconds) {
	if (!expiresInSeconds || !Number.isFinite(expiresInSeconds)) return null;
	return /* @__PURE__ */ new Date(Date.now() + expiresInSeconds * 1e3 - 30 * 1e3);
}
function calculateBackoffDelay$3(attempt) {
	return calculateBackoffDelay$5(attempt, {
		maxRetries: TOKEN_REFRESH_CONFIG$2.maxRetries,
		baseDelayMs: TOKEN_REFRESH_CONFIG$2.baseDelayMs,
		maxDelayMs: TOKEN_REFRESH_CONFIG$2.maxDelayMs,
		jitterFactor: .3
	});
}
async function refreshMetaAccessToken({ userId, clientId }) {
	logger.info("[Meta Token Refresh] Starting token refresh", {
		userId,
		clientId,
		apiVersion: META_API_VERSION
	});
	const integration = await getAdIntegration({
		userId,
		providerId: "facebook",
		clientId
	});
	if (!integration?.accessToken) {
		logger.error("[Meta Token Refresh] No access token available", {
			userId,
			clientId
		});
		throw new IntegrationTokenError("No Meta Ads access token available", "facebook", userId);
	}
	const appId = process.env.META_APP_ID;
	const appSecret = process.env.META_APP_SECRET;
	if (!appId || !appSecret) {
		logger.error("[Meta Token Refresh] App credentials not configured");
		throw new IntegrationTokenError("Meta app credentials are not configured", "facebook", userId);
	}
	const params = new URLSearchParams({
		grant_type: "fb_exchange_token",
		client_id: appId,
		client_secret: appSecret,
		fb_exchange_token: integration.accessToken
	});
	let lastError = null;
	const attemptRefresh = async (attempt) => {
		try {
			const response = await fetch(`${META_OAUTH_TOKEN_ENDPOINT}?${params.toString()}`);
			if (!response.ok) {
				const errorPayload = await response.text();
				let parsedError = {};
				try {
					parsedError = JSON.parse(errorPayload);
				} catch {}
				const errorMessage = parsedError?.error?.message ?? errorPayload;
				if ((response.status >= 500 || response.status === 429) && attempt < TOKEN_REFRESH_CONFIG$2.maxRetries - 1) {
					lastError = new IntegrationTokenError(`Failed to refresh Meta Ads token (${response.status}): ${errorMessage}`, "facebook", userId, {
						isRetryable: true,
						httpStatus: response.status
					});
					await sleep(calculateBackoffDelay$3(attempt));
					return attemptRefresh(attempt + 1);
				}
				throw new IntegrationTokenError(`Failed to refresh Meta Ads token (${response.status}): ${errorMessage}`, "facebook", userId, {
					isRetryable: false,
					httpStatus: response.status
				});
			}
			const tokenPayload = await response.json();
			if (!tokenPayload.access_token) throw new IntegrationTokenError("Meta token response missing access_token", "facebook", userId);
			const expiresAt = computeExpiry$2(tokenPayload.expires_in);
			await updateIntegrationCredentials({
				userId,
				providerId: "facebook",
				clientId,
				accessToken: tokenPayload.access_token,
				accessTokenExpiresAt: expiresAt ?? void 0
			});
			return tokenPayload.access_token;
		} catch (error) {
			if (error instanceof IntegrationTokenError) throw error;
			lastError = error instanceof Error ? error : /* @__PURE__ */ new Error("Unknown error");
			if (attempt < TOKEN_REFRESH_CONFIG$2.maxRetries - 1) {
				await sleep(calculateBackoffDelay$3(attempt));
				return attemptRefresh(attempt + 1);
			}
		}
		throw lastError ?? new IntegrationTokenError("Meta token refresh failed after all retries", "facebook", userId);
	};
	return attemptRefresh(0);
}
/**
* Google Ads / Analytics token refresh without importing `@/services/google-oauth`
* (which pulls in `@/lib/crypto`). Used from Convex `"use node"` actions.
*/
var GOOGLE_TOKEN_ENDPOINT$1 = process.env.GOOGLE_TOKEN_ENDPOINT ?? "https://oauth2.googleapis.com/token";
var TOKEN_REFRESH_CONFIG$1 = {
	maxRetries: 3,
	baseDelayMs: 1e3,
	maxDelayMs: 1e4
};
function readEnvValue$1(key) {
	const value = process.env[key];
	if (typeof value !== "string") return null;
	const normalized = value.trim();
	return normalized.length > 0 ? normalized : null;
}
function firstEnvValue$1(keys) {
	for (const key of keys) {
		const value = readEnvValue$1(key);
		if (value) return value;
	}
	return null;
}
function resolveGoogleAdsOAuthCredentials$1() {
	return {
		clientId: firstEnvValue$1(["GOOGLE_ADS_CLIENT_ID", "GOOGLE_CLIENT_ID"]),
		clientSecret: firstEnvValue$1(["GOOGLE_ADS_CLIENT_SECRET", "GOOGLE_CLIENT_SECRET"])
	};
}
function resolveGoogleAnalyticsOAuthCredentials$1() {
	return {
		clientId: firstEnvValue$1(["GOOGLE_ANALYTICS_CLIENT_ID", "GOOGLE_CLIENT_ID"]),
		clientSecret: firstEnvValue$1(["GOOGLE_ANALYTICS_CLIENT_SECRET", "GOOGLE_CLIENT_SECRET"])
	};
}
function computeExpiry$1(expiresInSeconds) {
	if (!expiresInSeconds || !Number.isFinite(expiresInSeconds)) return null;
	return /* @__PURE__ */ new Date(Date.now() + expiresInSeconds * 1e3 - 30 * 1e3);
}
function calculateBackoffDelay$2(attempt) {
	return calculateBackoffDelay$5(attempt, {
		maxRetries: TOKEN_REFRESH_CONFIG$1.maxRetries,
		baseDelayMs: TOKEN_REFRESH_CONFIG$1.baseDelayMs,
		maxDelayMs: TOKEN_REFRESH_CONFIG$1.maxDelayMs,
		jitterFactor: .3
	});
}
function resolveGoogleProvider(providerId) {
	return providerId === "google-analytics" ? "google-analytics" : "google";
}
function formatGoogleProviderName(providerId) {
	return providerId === "google-analytics" ? "Google Analytics" : "Google Ads";
}
async function refreshGoogleAccessToken({ userId, clientId, providerId }) {
	const resolvedProviderId = resolveGoogleProvider(providerId);
	const providerName = formatGoogleProviderName(resolvedProviderId);
	const integration = resolvedProviderId === "google-analytics" ? await getGoogleAnalyticsIntegration({
		userId,
		clientId
	}) : await getAdIntegration({
		userId,
		providerId: resolvedProviderId,
		clientId
	});
	if (!integration?.refreshToken) throw new IntegrationTokenError(`No ${providerName} refresh token available`, resolvedProviderId, userId);
	const credentials = resolvedProviderId === "google-analytics" ? resolveGoogleAnalyticsOAuthCredentials$1() : resolveGoogleAdsOAuthCredentials$1();
	const googleClientId = credentials.clientId;
	const googleClientSecret = credentials.clientSecret;
	if (!googleClientId || !googleClientSecret) throw new IntegrationTokenError(`${providerName} client credentials are not configured`, resolvedProviderId, userId);
	const params = new URLSearchParams({
		client_id: googleClientId,
		client_secret: googleClientSecret,
		grant_type: "refresh_token",
		refresh_token: integration.refreshToken
	});
	let lastError = null;
	const attemptRefresh = async (attempt) => {
		try {
			const response = await fetch(GOOGLE_TOKEN_ENDPOINT$1, {
				method: "POST",
				headers: { "Content-Type": "application/x-www-form-urlencoded" },
				body: params.toString()
			});
			if (!response.ok) {
				const errorPayload = await response.text();
				let parsedError = {};
				try {
					parsedError = JSON.parse(errorPayload);
				} catch {}
				const errorMessage = parsedError.error_description ?? parsedError.error ?? errorPayload;
				if ((response.status >= 500 || response.status === 429) && attempt < TOKEN_REFRESH_CONFIG$1.maxRetries - 1) {
					logger.warn(`[Google Token Refresh] Attempt ${attempt + 1} failed (${response.status}), retrying...`, { userId });
					lastError = new IntegrationTokenError(`Failed to refresh ${providerName} token (${response.status}): ${errorMessage}`, resolvedProviderId, userId, {
						isRetryable: true,
						httpStatus: response.status
					});
					await sleep(calculateBackoffDelay$2(attempt));
					return attemptRefresh(attempt + 1);
				}
				if (parsedError.error === "invalid_grant") throw new IntegrationTokenError(`${providerName} refresh token has been revoked or expired. Please reconnect your account.`, resolvedProviderId, userId, {
					isRetryable: false,
					httpStatus: response.status
				});
				throw new IntegrationTokenError(`Failed to refresh ${providerName} token (${response.status}): ${errorMessage}`, resolvedProviderId, userId, {
					isRetryable: false,
					httpStatus: response.status
				});
			}
			const tokenPayload = await response.json();
			if (!tokenPayload.access_token) throw new IntegrationTokenError(`${providerName} token response missing access_token`, resolvedProviderId, userId);
			const expiresAt = computeExpiry$1(tokenPayload.expires_in);
			if (resolvedProviderId === "google-analytics") await updateGoogleAnalyticsCredentials({
				userId,
				clientId,
				accessToken: tokenPayload.access_token,
				accessTokenExpiresAt: expiresAt ?? void 0,
				refreshToken: tokenPayload.refresh_token ?? void 0,
				idToken: tokenPayload.id_token ?? void 0
			});
			else await updateIntegrationCredentials({
				userId,
				providerId: resolvedProviderId,
				clientId,
				accessToken: tokenPayload.access_token,
				accessTokenExpiresAt: expiresAt ?? void 0,
				refreshToken: tokenPayload.refresh_token ?? void 0,
				idToken: tokenPayload.id_token ?? void 0
			});
			logger.info(`[Google Token Refresh] Successfully refreshed token for user ${userId}`, { expiresIn: tokenPayload.expires_in });
			return tokenPayload.access_token;
		} catch (error) {
			if (error instanceof IntegrationTokenError) throw error;
			lastError = error instanceof Error ? error : /* @__PURE__ */ new Error("Unknown error");
			if (attempt < TOKEN_REFRESH_CONFIG$1.maxRetries - 1) {
				console.warn(`[Google Token Refresh] Network error on attempt ${attempt + 1}, retrying...`, lastError.message);
				await sleep(calculateBackoffDelay$2(attempt));
				return attemptRefresh(attempt + 1);
			}
		}
		throw lastError ?? new IntegrationTokenError("Google token refresh failed after all retries", resolvedProviderId, userId);
	};
	return attemptRefresh(0);
}
process.env.GOOGLE_TOKEN_ENDPOINT;
var TIKTOK_REFRESH_ENDPOINT = "https://business-api.tiktok.com/open_api/v1.3/oauth2/refresh_token/";
var LINKEDIN_TOKEN_ENDPOINT$1 = process.env.LINKEDIN_TOKEN_ENDPOINT ?? "https://www.linkedin.com/oauth/v2/accessToken";
var refreshPromises = /* @__PURE__ */ new Map();
var refreshPromiseTimestamps = /* @__PURE__ */ new Map();
var TOKEN_REFRESH_CONFIG = {
	maxRetries: 3,
	baseDelayMs: 1e3,
	maxDelayMs: 1e4
};
var PROMISE_TTL_MS = 300 * 1e3;
/**
* Clean up stale promise entries that may have been orphaned due to
* network hangs or other issues preventing the finally block from running.
*/
function cleanupStalePromises() {
	const now = Date.now();
	for (const [key, timestamp] of refreshPromiseTimestamps.entries()) if (now - timestamp > PROMISE_TTL_MS) {
		refreshPromises.delete(key);
		refreshPromiseTimestamps.delete(key);
		console.warn(`[Token Refresh] Cleaned up stale promise for ${key}`);
	}
}
function computeExpiry(expiresInSeconds) {
	if (!expiresInSeconds || !Number.isFinite(expiresInSeconds)) return null;
	return /* @__PURE__ */ new Date(Date.now() + expiresInSeconds * 1e3 - 30 * 1e3);
}
function calculateBackoffDelay$1(attempt) {
	return calculateBackoffDelay$5(attempt, {
		maxRetries: TOKEN_REFRESH_CONFIG.maxRetries,
		baseDelayMs: TOKEN_REFRESH_CONFIG.baseDelayMs,
		maxDelayMs: TOKEN_REFRESH_CONFIG.maxDelayMs,
		jitterFactor: .3
	});
}
function isTokenExpiringSoon(expiresAt, bufferMs = 300 * 1e3) {
	if (!expiresAt) return true;
	let expiryMs = null;
	if (expiresAt instanceof Date) expiryMs = expiresAt.getTime();
	else if (typeof expiresAt.toMillis === "function") try {
		expiryMs = expiresAt.toMillis();
	} catch {
		expiryMs = null;
	}
	else if (typeof expiresAt.toDate === "function") try {
		const date = expiresAt.toDate();
		expiryMs = date instanceof Date ? date.getTime() : null;
	} catch {
		expiryMs = null;
	}
	else if (typeof expiresAt === "number") expiryMs = expiresAt < 0xe8d4a51000 ? expiresAt * 1e3 : expiresAt;
	else if (typeof expiresAt === "string") {
		const parsed = Date.parse(expiresAt);
		expiryMs = Number.isNaN(parsed) ? null : parsed;
	}
	if (!expiryMs) return true;
	return Date.now() + bufferMs >= expiryMs;
}
async function refreshTikTokAccessToken({ userId, clientId }) {
	const integration = await getAdIntegration({
		userId,
		providerId: "tiktok",
		clientId
	});
	if (!integration?.refreshToken) throw new IntegrationTokenError("No TikTok refresh token available", "tiktok", userId);
	const clientKey = process.env.TIKTOK_CLIENT_KEY;
	const clientSecret = process.env.TIKTOK_CLIENT_SECRET;
	if (!clientKey || !clientSecret) throw new IntegrationTokenError("TikTok client credentials are not configured", "tiktok", userId);
	let lastError = null;
	for (let attempt = 0; attempt < TOKEN_REFRESH_CONFIG.maxRetries; attempt++) try {
		console.log(`[TikTok Token Refresh] Attempt ${attempt + 1}/${TOKEN_REFRESH_CONFIG.maxRetries} for user ${userId}`);
		const response = await fetch(TIKTOK_REFRESH_ENDPOINT, {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({
				app_id: clientKey,
				secret: clientSecret,
				refresh_token: integration.refreshToken,
				grant_type: "refresh_token"
			})
		});
		if (!response.ok) {
			const errorPayload = await response.text();
			let parsedError = {};
			try {
				parsedError = JSON.parse(errorPayload);
			} catch {}
			if ((response.status >= 500 || response.status === 429) && attempt < TOKEN_REFRESH_CONFIG.maxRetries - 1) {
				const retryAfter = response.headers.get("Retry-After");
				let delayMs = calculateBackoffDelay$1(attempt);
				if (retryAfter) {
					const retryAfterSeconds = parseInt(retryAfter, 10);
					if (!isNaN(retryAfterSeconds)) delayMs = Math.max(delayMs, retryAfterSeconds * 1e3);
				}
				console.warn(`[TikTok Token Refresh] Server error ${response.status} on attempt ${attempt + 1}, retrying in ${delayMs}ms...`);
				await sleep(delayMs);
				continue;
			}
			if (parsedError.code === 40001) throw new IntegrationTokenError("TikTok refresh token has been revoked or expired. Please reconnect your TikTok Ads account.", "tiktok", userId, {
				isRetryable: false,
				httpStatus: response.status
			});
			throw new IntegrationTokenError(`Failed to refresh TikTok access token (${response.status}): ${parsedError.message || errorPayload}`, "tiktok", userId, {
				isRetryable: false,
				httpStatus: response.status
			});
		}
		const payload = await response.json();
		if (payload.code && payload.code !== 0) {
			if (payload.code === 40100 && attempt < TOKEN_REFRESH_CONFIG.maxRetries - 1) {
				console.warn(`[TikTok Token Refresh] TikTok error code ${payload.code} on attempt ${attempt + 1}, retrying...`);
				await sleep(calculateBackoffDelay$1(attempt));
				continue;
			}
			throw new IntegrationTokenError(payload.message || `TikTok refresh token response returned code ${payload.code}`, "tiktok", userId, { isRetryable: false });
		}
		const data = payload.data ?? {};
		if (!data.access_token) throw new IntegrationTokenError("TikTok refresh response missing access_token", "tiktok", userId);
		const accessTokenExpiresAt = computeExpiry(data.expires_in);
		const refreshTokenExpiresAt = computeExpiry(data.refresh_token_expires_in);
		await updateIntegrationCredentials({
			userId,
			providerId: "tiktok",
			clientId,
			accessToken: data.access_token,
			refreshToken: data.refresh_token ?? void 0,
			accessTokenExpiresAt: accessTokenExpiresAt ?? void 0,
			refreshTokenExpiresAt: refreshTokenExpiresAt ?? void 0
		});
		console.log(`[TikTok Token Refresh] Successfully refreshed token for user ${userId}, expires in ${data.expires_in ?? "unknown"} seconds`);
		return data.access_token;
	} catch (error) {
		if (error instanceof IntegrationTokenError) throw error;
		lastError = error instanceof Error ? error : /* @__PURE__ */ new Error("Unknown error");
		if (attempt < TOKEN_REFRESH_CONFIG.maxRetries - 1) {
			console.warn(`[TikTok Token Refresh] Network error on attempt ${attempt + 1}, retrying...`, lastError.message);
			await sleep(calculateBackoffDelay$1(attempt));
			continue;
		}
	}
	throw lastError ?? new IntegrationTokenError("TikTok token refresh failed after all retries", "tiktok", userId);
}
async function ensureGoogleAccessTokenInternal({ userId, clientId, forceRefresh }) {
	cleanupStalePromises();
	const promiseKey = `google:${userId}:${clientId ?? "workspace"}`;
	const existingPromise = refreshPromises.get(promiseKey);
	if (existingPromise) return existingPromise;
	const refreshPromise = (async () => {
		try {
			const integration = await getAdIntegration({
				userId,
				providerId: "google",
				clientId
			});
			if (!integration?.accessToken) throw new IntegrationTokenError("Google Ads integration missing access token", "google", userId);
			if (forceRefresh || isTokenExpiringSoon(integration.accessTokenExpiresAt, 600 * 1e3)) {
				console.log(`[Google Token] Token expiring soon or force refresh requested for user ${userId}, refreshing...`);
				return await refreshGoogleAccessToken({
					userId,
					clientId
				});
			}
			return integration.accessToken;
		} finally {
			refreshPromises.delete(promiseKey);
			refreshPromiseTimestamps.delete(promiseKey);
		}
	})();
	refreshPromises.set(promiseKey, refreshPromise);
	refreshPromiseTimestamps.set(promiseKey, Date.now());
	return refreshPromise;
}
(0, import_react.cache)(ensureGoogleAccessTokenInternal);
async function refreshLinkedInAccessToken({ userId, clientId }) {
	const integration = await getAdIntegration({
		userId,
		providerId: "linkedin",
		clientId
	});
	if (!integration?.refreshToken) throw new IntegrationTokenError("No LinkedIn refresh token available. LinkedIn tokens expire after 60 days - please reconnect your account.", "linkedin", userId, { isRetryable: false });
	const linkedInClientId = process.env.LINKEDIN_CLIENT_ID;
	const linkedInClientSecret = process.env.LINKEDIN_CLIENT_SECRET;
	if (!linkedInClientId || !linkedInClientSecret) throw new IntegrationTokenError("LinkedIn client credentials are not configured", "linkedin", userId);
	const params = new URLSearchParams({
		grant_type: "refresh_token",
		refresh_token: integration.refreshToken,
		client_id: linkedInClientId,
		client_secret: linkedInClientSecret
	});
	let lastError = null;
	const attemptRefresh = async (attempt) => {
		try {
			console.log(`[LinkedIn Token Refresh] Attempt ${attempt + 1}/${TOKEN_REFRESH_CONFIG.maxRetries} for user ${userId}`);
			const response = await fetch(LINKEDIN_TOKEN_ENDPOINT$1, {
				method: "POST",
				headers: { "Content-Type": "application/x-www-form-urlencoded" },
				body: params.toString()
			});
			if (!response.ok) {
				const errorPayload = await response.text();
				let parsedError = {};
				try {
					parsedError = JSON.parse(errorPayload);
				} catch {}
				const errorMessage = parsedError.error_description ?? parsedError.error ?? errorPayload;
				if ((response.status >= 500 || response.status === 429) && attempt < TOKEN_REFRESH_CONFIG.maxRetries - 1) {
					logger.warn(`[LinkedIn Token Refresh] Attempt ${attempt + 1} failed (${response.status}), retrying...`, { userId });
					lastError = new IntegrationTokenError(`Failed to refresh LinkedIn token (${response.status}): ${errorMessage}`, "linkedin", userId, {
						isRetryable: true,
						httpStatus: response.status
					});
					await sleep(calculateBackoffDelay$1(attempt));
					return attemptRefresh(attempt + 1);
				}
				if (parsedError.error === "invalid_grant") throw new IntegrationTokenError("LinkedIn refresh token has expired or been revoked. Please reconnect your LinkedIn Ads account.", "linkedin", userId, {
					isRetryable: false,
					httpStatus: response.status
				});
				throw new IntegrationTokenError(`Failed to refresh LinkedIn token (${response.status}): ${errorMessage}`, "linkedin", userId, {
					isRetryable: false,
					httpStatus: response.status
				});
			}
			const tokenPayload = await response.json();
			if (!tokenPayload.access_token) throw new IntegrationTokenError("LinkedIn token response missing access_token", "linkedin", userId);
			const accessTokenExpiresAt = computeExpiry(tokenPayload.expires_in);
			const refreshTokenExpiresAt = computeExpiry(tokenPayload.refresh_token_expires_in);
			await updateIntegrationCredentials({
				userId,
				providerId: "linkedin",
				clientId,
				accessToken: tokenPayload.access_token,
				refreshToken: tokenPayload.refresh_token ?? void 0,
				accessTokenExpiresAt: accessTokenExpiresAt ?? void 0,
				refreshTokenExpiresAt: refreshTokenExpiresAt ?? void 0
			});
			logger.info(`[LinkedIn Token Refresh] Successfully refreshed token for user ${userId}`, { expiresIn: tokenPayload.expires_in });
			return tokenPayload.access_token;
		} catch (error) {
			if (error instanceof IntegrationTokenError) throw error;
			lastError = error instanceof Error ? error : /* @__PURE__ */ new Error("Unknown error");
			if (attempt < TOKEN_REFRESH_CONFIG.maxRetries - 1) {
				console.warn(`[LinkedIn Token Refresh] Network error on attempt ${attempt + 1}, retrying...`, lastError.message);
				await sleep(calculateBackoffDelay$1(attempt));
				return attemptRefresh(attempt + 1);
			}
		}
		throw lastError ?? new IntegrationTokenError("LinkedIn token refresh failed after all retries", "linkedin", userId);
	};
	return attemptRefresh(0);
}
/** ISO 4217 code from GA4 Admin API `properties/{id}.currencyCode`. */
function normalizeGoogleAnalyticsCurrencyCode(raw) {
	if (typeof raw !== "string") return null;
	const code = raw.trim().toUpperCase();
	return /^[A-Z]{3}$/.test(code) ? code : null;
}
/**
* Fetch the reporting currency configured on the GA4 property.
* @see https://developers.google.com/analytics/devguides/config/admin/v1/rest/v1beta/properties
*/
async function fetchGoogleAnalyticsPropertyCurrency(options) {
	const propertyId = options.propertyId.trim();
	if (!propertyId) return null;
	const response = await fetch(`https://analyticsadmin.googleapis.com/v1beta/properties/${encodeURIComponent(propertyId)}`, { headers: { Authorization: `Bearer ${options.accessToken}` } });
	await assertGoogleApiOk(response, "Failed to fetch Google Analytics property");
	return normalizeGoogleAnalyticsCurrencyCode((await response.json()).currencyCode);
}
var DEFAULT_PAGE_SIZE = 200;
var MAX_PROPERTY_LIST_PAGES = 50;
function normalizePropertyId(resourceName) {
	const trimmed = resourceName.trim();
	if (trimmed.startsWith("properties/")) {
		const extracted = trimmed.split("/")[1];
		return typeof extracted === "string" && extracted.length > 0 ? extracted : trimmed;
	}
	return trimmed;
}
async function fetchGoogleAnalyticsProperties(options) {
	const { accessToken, pageSize = DEFAULT_PAGE_SIZE, maxPages = MAX_PROPERTY_LIST_PAGES } = options;
	const unique = /* @__PURE__ */ new Map();
	const fetchPage = async (page, nextPageToken) => {
		const url = new URL("https://analyticsadmin.googleapis.com/v1beta/accountSummaries");
		url.searchParams.set("pageSize", String(pageSize));
		if (typeof nextPageToken === "string" && nextPageToken.length > 0) url.searchParams.set("pageToken", nextPageToken);
		const response = await fetch(url.toString(), { headers: { Authorization: `Bearer ${accessToken}` } });
		await assertGoogleApiOk(response, "Failed to list Google Analytics properties");
		const payload = await response.json();
		for (const accountSummary of payload.accountSummaries ?? []) for (const property of accountSummary.propertySummaries ?? []) {
			if (typeof property.property !== "string" || property.property.length === 0) continue;
			const id = normalizePropertyId(property.property);
			const name = typeof property.displayName === "string" && property.displayName.length > 0 ? property.displayName : property.property;
			unique.set(id, {
				id,
				name,
				resourceName: property.property
			});
		}
		const token = payload.nextPageToken;
		if (token && page + 1 < maxPages) await fetchPage(page + 1, token);
	};
	await fetchPage(0);
	return Array.from(unique.values()).toSorted((a, b) => a.name.localeCompare(b.name));
}
var RUN_REPORT_PAGE_LIMIT = 1e4;
var RUN_REPORT_MAX_PAGES = 20;
function formatGaDate(raw) {
	if (!raw || raw.length !== 8) return raw;
	return `${raw.slice(0, 4)}-${raw.slice(4, 6)}-${raw.slice(6, 8)}`;
}
async function runGaReport(options) {
	const { accessToken, propertyId, days } = options;
	const allRows = [];
	let offset = 0;
	let rowCount = null;
	for (let page = 0; page < RUN_REPORT_MAX_PAGES; page += 1) {
		const response = await fetch(`https://analyticsdata.googleapis.com/v1beta/properties/${propertyId}:runReport`, {
			method: "POST",
			headers: {
				Authorization: `Bearer ${accessToken}`,
				"Content-Type": "application/json"
			},
			body: JSON.stringify({
				dateRanges: [{
					startDate: `${Math.max(days, 1)}daysAgo`,
					endDate: "today"
				}],
				dimensions: [{ name: "date" }],
				metrics: [
					{ name: "totalUsers" },
					{ name: "sessions" },
					{ name: "conversions" },
					{ name: "totalRevenue" }
				],
				limit: RUN_REPORT_PAGE_LIMIT,
				offset
			})
		});
		await assertGoogleApiOk(response, "Failed to fetch Google Analytics report");
		const payload = await response.json();
		if (typeof payload.rowCount === "number" && Number.isFinite(payload.rowCount)) rowCount = payload.rowCount;
		const pageRows = (payload.rows ?? []).flatMap((row) => {
			const rawDate = row.dimensionValues?.[0]?.value ?? "";
			const metricValues = row.metricValues ?? [];
			const totalUsers = Number(metricValues[0]?.value ?? 0);
			const sessions = Number(metricValues[1]?.value ?? 0);
			const conversions = Number(metricValues[2]?.value ?? 0);
			const totalRevenue = Number(metricValues[3]?.value ?? 0);
			const date = formatGaDate(rawDate);
			if (typeof date !== "string" || date.length < 8) return [];
			return [{
				date,
				totalUsers: Number.isFinite(totalUsers) ? totalUsers : 0,
				sessions: Number.isFinite(sessions) ? sessions : 0,
				conversions: Number.isFinite(conversions) ? conversions : 0,
				totalRevenue: Number.isFinite(totalRevenue) ? totalRevenue : 0
			}];
		});
		allRows.push(...pageRows);
		if (pageRows.length === 0) break;
		offset += pageRows.length;
		if (rowCount !== null && offset >= rowCount) break;
		if (rowCount === null && pageRows.length < RUN_REPORT_PAGE_LIMIT) break;
	}
	return allRows;
}
async function syncGoogleAnalyticsMetrics(options) {
	const normalizedClientId = typeof options.clientId === "string" && options.clientId.trim().length > 0 ? options.clientId.trim() : null;
	const days = Number.isFinite(options.days) && options.days > 0 ? Math.max(1, Math.floor(options.days)) : 30;
	const integration = await getGoogleAnalyticsIntegration({
		userId: options.userId,
		clientId: normalizedClientId
	});
	if (!integration?.accessToken) throw new IntegrationTokenError("Google Analytics is not connected", "google-analytics", options.userId);
	let accessToken = integration.accessToken;
	if (integration.refreshToken && isTokenExpiringSoon(integration.accessTokenExpiresAt, 600 * 1e3)) accessToken = await refreshGoogleAccessToken({
		userId: options.userId,
		clientId: normalizedClientId,
		providerId: "google-analytics"
	});
	const propertyId = typeof integration.accountId === "string" && integration.accountId.length > 0 ? integration.accountId : null;
	const propertyName = typeof integration.accountName === "string" && integration.accountName.length > 0 ? integration.accountName : null;
	if (!propertyId) {
		if ((await fetchGoogleAnalyticsProperties({ accessToken })).length === 0) throw new IntegrationTokenError("No Google Analytics properties found for this Google account", "google-analytics", options.userId);
		throw new IntegrationTokenError("Google Analytics property not configured. Select a property in Analytics setup before syncing.", "google-analytics", options.userId);
	}
	let reportingCurrency = typeof integration.currency === "string" && integration.currency.trim().length > 0 ? integration.currency.trim().toUpperCase() : null;
	if (!reportingCurrency) {
		reportingCurrency = await fetchGoogleAnalyticsPropertyCurrency({
			accessToken,
			propertyId
		});
		if (reportingCurrency) await updateGoogleAnalyticsCredentials({
			userId: options.userId,
			clientId: normalizedClientId,
			currency: reportingCurrency
		});
	}
	const reportRows = await runGaReport({
		accessToken,
		propertyId,
		days
	});
	const metrics = reportRows.map((row) => ({
		providerId: "google-analytics",
		clientId: normalizedClientId,
		accountId: propertyId,
		date: row.date,
		spend: 0,
		impressions: row.totalUsers,
		clicks: row.sessions,
		conversions: row.conversions,
		revenue: row.totalRevenue,
		currency: reportingCurrency,
		currencySource: reportingCurrency ? "integration" : "unknown"
	}));
	const breakdownRows = await fetchGoogleAnalyticsBreakdowns({
		accessToken,
		propertyId,
		days
	});
	await Promise.all([writeMetricsBatch({
		userId: options.userId,
		clientId: normalizedClientId,
		metrics
	}), writeAnalyticsMetricsBatch({
		userId: options.userId,
		clientId: normalizedClientId,
		propertyId,
		currency: reportingCurrency,
		daily: reportRows.map((row) => ({
			propertyId,
			date: row.date,
			users: row.totalUsers,
			sessions: row.sessions,
			conversions: row.conversions,
			revenue: row.totalRevenue,
			currency: reportingCurrency
		})),
		breakdowns: breakdownRows.map((row) => ({
			propertyId,
			date: row.date,
			dimension: row.dimension,
			dimensionValue: row.dimensionValue,
			users: row.users,
			sessions: row.sessions,
			conversions: row.conversions,
			revenue: row.revenue
		}))
	})]);
	const written = reportRows.length;
	logger.info("[Google Analytics Sync] Completed", {
		userId: options.userId,
		clientId: normalizedClientId,
		propertyId,
		syncedDays: days,
		written,
		breakdownRows: breakdownRows.length,
		requestId: options.requestId ?? void 0
	});
	return {
		providerId: "google-analytics",
		propertyId,
		propertyName,
		syncedDays: days,
		written
	};
}
/**
* Get metric value from daily data
*/
function getMetricValue(data, metric) {
	switch (metric) {
		case "spend": return data.spend;
		case "impressions": return data.impressions;
		case "clicks": return data.clicks;
		case "conversions": return data.conversions;
		case "revenue": return data.revenue;
		case "cpc": return data.cpc;
		case "ctr": return data.ctr;
		case "roas": return data.roas;
		case "cpa": return data.cpa;
		default: return 0;
	}
}
/**
* Compare two values using an operator
*/
function compareValues(value, operator, threshold) {
	switch (operator) {
		case "gt": return value > threshold;
		case "lt": return value < threshold;
		case "gte": return value >= threshold;
		case "lte": return value <= threshold;
		case "eq": return value === threshold;
		default: return false;
	}
}
/**
* Get human-readable operator text
*/
function getOperatorText(operator) {
	switch (operator) {
		case "gt": return "greater than";
		case "lt": return "less than";
		case "gte": return "greater than or equal to";
		case "lte": return "less than or equal to";
		case "eq": return "equal to";
		default: return operator;
	}
}
/**
* Calculate average of metric values
*/
function calculateAverage(history, metric) {
	if (history.length === 0) return 0;
	return history.reduce((acc, data) => acc + getMetricValue(data, metric), 0) / history.length;
}
/**
* Format metric value for display
*/
function formatMetricValue(metric, value) {
	switch (metric) {
		case "spend":
		case "revenue":
		case "cpc":
		case "cpa": return `$${value.toFixed(2)}`;
		case "ctr":
		case "roas": return value.toFixed(2);
		default: return Math.round(value).toString();
	}
}
/**
* Evaluate a threshold rule
*/
function evaluateThresholdRule(rule, current, formula) {
	const condition = rule.condition;
	let currentValue = getMetricValue(current, rule.metric);
	if (rule.metric === "custom_formula" && formula) {
		const inputValues = {};
		formula.inputs.forEach((input) => {
			inputValues[input] = getMetricValue(current, input);
		});
		currentValue = safeEvaluateFormula(formula.formula, inputValues) ?? 0;
	}
	const triggered = compareValues(currentValue, condition.operator, condition.value);
	return {
		ruleId: rule.id,
		ruleName: rule.name,
		triggered,
		severity: rule.severity,
		metric: rule.metric,
		message: triggered ? `${rule.metric === "custom_formula" ? rule.name : rule.metric.toUpperCase()} (${formatMetricValue(rule.metric, currentValue)}) is ${getOperatorText(condition.operator)} ${formatMetricValue(rule.metric, condition.value)}` : `${rule.metric === "custom_formula" ? rule.name : rule.metric.toUpperCase()} is within threshold`,
		currentValue,
		threshold: condition.value,
		formulaId: rule.formulaId,
		timestamp: (/* @__PURE__ */ new Date()).toISOString()
	};
}
/**
* Evaluate an anomaly rule
*/
function evaluateAnomalyRule(rule, current, history) {
	const condition = rule.condition;
	const currentValue = getMetricValue(current, rule.metric);
	const average = calculateAverage(history.slice(-condition.baselineDays), rule.metric);
	if (average === 0) return {
		ruleId: rule.id,
		ruleName: rule.name,
		triggered: false,
		severity: rule.severity,
		metric: rule.metric,
		message: `Insufficient baseline data for anomaly detection`,
		currentValue,
		average: 0,
		timestamp: (/* @__PURE__ */ new Date()).toISOString()
	};
	const deviationThreshold = average * condition.deviationMultiplier;
	const deviationPercent = (currentValue - average) / average * 100;
	let triggered = false;
	if (condition.direction === "above") triggered = currentValue > deviationThreshold;
	else if (condition.direction === "below") triggered = currentValue < average / condition.deviationMultiplier;
	else triggered = currentValue > deviationThreshold || currentValue < average / condition.deviationMultiplier;
	return {
		ruleId: rule.id,
		ruleName: rule.name,
		triggered,
		severity: rule.severity,
		metric: rule.metric,
		message: triggered ? `${rule.metric.toUpperCase()} (${formatMetricValue(rule.metric, currentValue)}) is ${Math.abs(deviationPercent).toFixed(1)}% ${deviationPercent > 0 ? "above" : "below"} the ${condition.baselineDays}-day average (${formatMetricValue(rule.metric, average)})` : `${rule.metric.toUpperCase()} is within normal range`,
		currentValue,
		average,
		deviationPercent,
		timestamp: (/* @__PURE__ */ new Date()).toISOString()
	};
}
/**
* Evaluate a trend rule
*/
function evaluateTrendRule(rule, history) {
	const condition = rule.condition;
	const metric = rule.metric;
	if (history.length < condition.consecutivePeriods + 1) return {
		ruleId: rule.id,
		ruleName: rule.name,
		triggered: false,
		severity: rule.severity,
		metric: rule.metric,
		message: `Insufficient data for trend detection (need ${condition.consecutivePeriods + 1} days)`,
		currentValue: history.length > 0 ? getMetricValue(history[history.length - 1], metric) : 0,
		timestamp: (/* @__PURE__ */ new Date()).toISOString()
	};
	const recentData = history.slice(-(condition.consecutivePeriods + 1));
	const minChangePercent = condition.minChangePercent ?? 0;
	let consecutiveCount = 0;
	for (let i = 1; i < recentData.length; i++) {
		const prevValue = getMetricValue(recentData[i - 1], metric);
		const currValue = getMetricValue(recentData[i], metric);
		if (prevValue === 0) continue;
		const changePercent = (currValue - prevValue) / prevValue * 100;
		if (condition.direction === "increasing") if (changePercent >= minChangePercent) consecutiveCount++;
		else consecutiveCount = 0;
		else if (changePercent <= -minChangePercent) consecutiveCount++;
		else consecutiveCount = 0;
	}
	const triggered = consecutiveCount >= condition.consecutivePeriods;
	const currentValue = getMetricValue(recentData[recentData.length - 1], metric);
	return {
		ruleId: rule.id,
		ruleName: rule.name,
		triggered,
		severity: rule.severity,
		metric: rule.metric,
		message: triggered ? `${rule.metric.toUpperCase()} has been ${condition.direction} for ${consecutiveCount} consecutive days` : `No significant ${condition.direction} trend detected`,
		currentValue,
		trendDays: consecutiveCount,
		timestamp: (/* @__PURE__ */ new Date()).toISOString()
	};
}
/**
* Evaluate a single rule against metric data
*/
function evaluateRule(rule, current, history, formula) {
	if (rule.type === "algorithmic") return {
		ruleId: rule.id,
		ruleName: rule.name,
		triggered: false,
		severity: rule.severity,
		metric: rule.metric,
		message: "Algorithmic rule evaluation not supported in single-rule mode",
		currentValue: 0,
		timestamp: (/* @__PURE__ */ new Date()).toISOString()
	};
	switch (rule.condition.type) {
		case "threshold": return evaluateThresholdRule(rule, current, formula);
		case "anomaly": return evaluateAnomalyRule(rule, current, history);
		case "trend": return evaluateTrendRule(rule, history);
		default: return {
			ruleId: rule.id,
			ruleName: rule.name,
			triggered: false,
			severity: "info",
			metric: rule.metric,
			message: "Unknown rule type",
			currentValue: 0,
			timestamp: (/* @__PURE__ */ new Date()).toISOString()
		};
	}
}
function adAlertsTemplate(params) {
	const { alerts, providerId } = params;
	const criticalCount = alerts.filter((a) => a.severity === "critical").length;
	const alertItems = alerts.map((alert) => {
		const severityColor = alert.severity === "critical" ? EMAIL_COLORS.error.text : alert.severity === "warning" ? EMAIL_COLORS.warning.text : EMAIL_COLORS.info.text;
		return `
            <div style="padding: 20px; margin: 16px 0; background: ${alert.severity === "critical" ? EMAIL_COLORS.error.bg : alert.severity === "warning" ? EMAIL_COLORS.warning.bg : EMAIL_COLORS.info.bg}; border-left: 4px solid ${alert.severity === "critical" ? EMAIL_COLORS.error.border : alert.severity === "warning" ? EMAIL_COLORS.warning.border : EMAIL_COLORS.info.border}; border-radius: 8px;">
                <div style="display: flex; align-items: center; margin-bottom: 8px;">
                    <span style="font-weight: 700; color: ${severityColor}; text-transform: uppercase; font-size: 12px; letter-spacing: 0.05em;">
                        ${alert.severity} ${alert.metric !== "spend" ? `• ${alert.metric.toUpperCase()}` : ""}
                    </span>
                </div>
                <div style="font-size: 18px; font-weight: 600; color: ${EMAIL_COLORS.heading}; margin-bottom: 4px;">
                    ${alert.ruleName}
                </div>
                <div style="font-size: 15px; color: ${EMAIL_COLORS.body}; line-height: 1.5;">
                    ${alert.message}
                </div>
                ${alert.suggestion ? `
                    <div style="margin-top: 12px; padding-top: 12px; border-top: 1px solid rgba(0,0,0,0.05);">
                        <div style="display: flex; align-items: start;">
                            <span style="margin-right: 8px;">💡</span>
                            <div style="font-size: 14px; color: ${EMAIL_COLORS.body}; font-style: italic;">
                                <strong>Suggestion:</strong> ${alert.suggestion}
                            </div>
                        </div>
                    </div>
                ` : ""}
            </div>
        `;
	}).join("");
	const headerTitle = criticalCount > 0 ? `<span style="color: ${EMAIL_COLORS.error.text};">🚨 Critical Ad Alert</span>` : `<span style="color: ${EMAIL_COLORS.warning.text};">⚠️ Ad Metrics Alert</span>`;
	return wrapEmailTemplate(`
        <div style="margin-bottom: 24px;">
            <div style="font-size: 28px; font-weight: 800; color: ${EMAIL_COLORS.heading}; margin-bottom: 8px;">
                ${headerTitle}
            </div>
            <div style="font-size: 16px; color: ${EMAIL_COLORS.subtle};">
                ${providerId ? `Source: <strong>${providerId}</strong> • ` : ""}Detected ${alerts.length} issue${alerts.length === 1 ? "" : "s"} requiring your attention.
            </div>
        </div>

        <div class="content">
            ${alertItems}
        </div>

        <div style="margin-top: 32px; padding: 20px; background: ${EMAIL_COLORS.muted}; border-radius: 12px; text-align: center;">
            <div style="font-size: 14px; color: ${EMAIL_COLORS.body}; margin-bottom: 16px;">
                View your performance dashboard for detailed analysis and real-time metrics.
            </div>
            <a href="https://cohorts.app/dashboard/ads" class="button" style="margin-top: 0;">
                View Dashboard
            </a>
        </div>

        <div class="meta" style="text-align: center; margin-top: 24px;">
            Triggered at ${(/* @__PURE__ */ new Date()).toLocaleString()} (UTC)
        </div>
    `);
}
/**
* Evaluate multiple rules against metric data
*/
function evaluateAlerts(rules, input, formulas) {
	const activeRules = rules.filter((rule) => {
		if (!rule.enabled) return false;
		if (rule.type === "algorithmic") return false;
		if (rule.providerId && input.providerId && rule.providerId !== input.providerId) return false;
		if (rule.campaignId && input.campaignId && rule.campaignId !== input.campaignId) return false;
		return true;
	});
	const results = activeRules.map((rule) => evaluateRule(rule, input.current, input.history, rule.formulaId && formulas ? formulas[rule.formulaId] : void 0));
	const algorithmicResults = evaluateAlgorithmicAlerts(input, rules);
	results.push(...algorithmicResults);
	const triggered = results.filter((r) => r.triggered);
	return {
		evaluated: activeRules.length + rules.filter((r) => r.type === "algorithmic" && r.enabled).length,
		triggered: triggered.length,
		results,
		evaluatedAt: (/* @__PURE__ */ new Date()).toISOString()
	};
}
/**
* Evaluate algorithmic rules against current summary
*/
function evaluateAlgorithmicAlerts(input, rules) {
	const algorithmicRules = rules.filter((r) => r.type === "algorithmic" && r.enabled);
	if (algorithmicRules.length === 0) return [];
	const insights = calculateAlgorithmicInsights(enrichSummaryWithMetrics({
		providerId: input.providerId || "unknown",
		totalSpend: input.current.spend,
		totalRevenue: input.current.revenue,
		totalClicks: input.current.clicks,
		totalConversions: input.current.conversions,
		totalImpressions: input.current.impressions,
		averageRoaS: input.current.roas,
		averageCpc: input.current.cpc,
		averageCtr: input.current.impressions > 0 ? input.current.clicks / input.current.impressions * 100 : input.current.ctr,
		averageConvRate: input.current.clicks > 0 ? input.current.conversions / input.current.clicks * 100 : 0,
		period: "1d",
		dayCount: 1
	}));
	const results = [];
	for (const rule of algorithmicRules) {
		const matchingInsights = insights.filter((i) => (rule.insightType === "all" || !rule.insightType || i.type === rule.insightType) && (i.level === "critical" || i.level === "warning"));
		for (const insight of matchingInsights) results.push({
			ruleId: rule.id,
			ruleName: rule.name,
			triggered: true,
			severity: insight.level === "critical" ? "critical" : "warning",
			metric: "spend",
			message: `${insight.title}: ${insight.message}`,
			currentValue: 0,
			insightType: insight.type,
			suggestion: insight.suggestion,
			timestamp: (/* @__PURE__ */ new Date()).toISOString()
		});
	}
	return results;
}
/**
* Format alerts for email notification
*/
function formatAlertsForEmail(alerts, providerId) {
	const criticalCount = alerts.filter((a) => a.severity === "critical").length;
	const warningCount = alerts.filter((a) => a.severity === "warning").length;
	return {
		subject: criticalCount > 0 ? `🚨 Critical Ad Alert: ${criticalCount} issue(s) detected` : `⚠️ Ad Metrics Alert: ${warningCount} warning(s)`,
		htmlContent: adAlertsTemplate({
			alerts,
			providerId
		})
	};
}
var _convexClient$1 = null;
function getConvexClient$1() {
	if (_convexClient$1) return _convexClient$1;
	const url = process.env.CONVEX_URL ?? "https://grand-sparrow-698.convex.cloud";
	const deployKey = process.env.CONVEX_DEPLOY_KEY ?? process.env.CONVEX_DEV_DEPLOY_KEY ?? process.env.CONVEX_PROD_DEPLOY_KEY ?? process.env.CONVEX_ADMIN_KEY ?? process.env.CONVEX_ADMIN_TOKEN;
	if (!url || !deployKey) {
		console.error("[AlertProcessor] CONVEX_URL or admin key not configured");
		return null;
	}
	_convexClient$1 = new ConvexHttpClient(url);
	_convexClient$1.setAdminAuth?.(deployKey, {
		issuer: "system",
		subject: "alert-processor"
	});
	return _convexClient$1;
}
var fetchAlertRules = (0, import_react.cache)(async (convex, workspaceId) => {
	return await convex.query(internal.alertRules.listEnabled, { workspaceId });
});
var fetchCustomFormulas = (0, import_react.cache)(async (convex, workspaceId) => {
	return await convex.query(internal.customFormulas.listActiveForAlerts, { workspaceId });
});
var fetchRecentMetrics = (0, import_react.cache)(async (convex, workspaceId, clientId, limit) => {
	return await convex.query(internal.adsMetrics.listRecentForAlerts, {
		workspaceId,
		clientId,
		limit
	});
});
var fetchNotificationPreferences = (0, import_react.cache)(async (convex, email) => {
	return await convex.query(internal.users.getNotificationPreferencesByEmail, { email });
});
/**
* Process all alert rules for a specific workspace/client and send notifications
*/
async function processWorkspaceAlerts(options) {
	const { userId, workspaceId, clientId = null, recipientEmail } = options;
	const convex = getConvexClient$1();
	if (!convex) {
		console.error("[AlertProcessor] Convex client not available");
		return {
			evaluated: 0,
			triggered: 0,
			results: []
		};
	}
	try {
		const rules = await fetchAlertRules(convex, workspaceId);
		if (rules.length === 0) return {
			evaluated: 0,
			triggered: 0,
			results: []
		};
		const formulaRules = rules.filter((r) => r.metric === "custom_formula");
		let formulas = {};
		if (formulaRules.length > 0) formulas = await fetchCustomFormulas(convex, workspaceId);
		const metricsData = await fetchRecentMetrics(convex, workspaceId, clientId, Math.max(...rules.map((r) => {
			if (r.condition.type === "anomaly") return r.condition.baselineDays;
			if (r.condition.type === "trend") return r.condition.consecutivePeriods;
			return 0;
		}), 7) + 1);
		if (metricsData.length === 0) return {
			evaluated: rules.length,
			triggered: 0,
			results: []
		};
		const evaluation = evaluateAlerts(rules, {
			current: metricsData[metricsData.length - 1],
			history: metricsData.slice(0, -1),
			providerId: "blended"
		}, formulas);
		const triggeredAlerts = evaluation.results.filter((r) => r.triggered);
		if (triggeredAlerts.length > 0 && recipientEmail) {
			const prefs = (await fetchNotificationPreferences(convex, recipientEmail))?.notificationPreferences;
			if (isEmailPrefEnabled(prefs, "adAlerts")) {
				const { subject, htmlContent } = formatAlertsForEmail(triggeredAlerts, workspaceId);
				await sendTransactionalEmail({
					to: [{ email: recipientEmail }],
					subject,
					htmlContent,
					tags: ["ad-alerts"]
				});
			} else console.log(`[AlertProcessor] Skipping email notification for user ${userId} due to preference.`);
		}
		return evaluation;
	} catch (error) {
		console.error(`[AlertProcessor] Failed to process alerts for workspace ${workspaceId}:`, error);
		throw error;
	}
}
async function getIntegrationForJob(options) {
	if (options.providerId === "google-analytics") return await getGoogleAnalyticsIntegration({
		userId: options.userId,
		clientId: options.clientId ?? null
	});
	return await getAdIntegration(options);
}
async function updateProviderStatus(options) {
	if (options.providerId === "google-analytics") {
		await updateGoogleAnalyticsStatus({
			userId: options.userId,
			clientId: options.clientId ?? null,
			status: options.status,
			message: options.message ?? null
		});
		return;
	}
	await updateIntegrationStatus(options);
}
var handlers$21 = adaptApiHandler({
	bodySchema: object({
		userId: string().optional(),
		workspaceId: string().optional()
	}),
	querySchema: object({
		userId: string().optional(),
		workspaceId: string().optional()
	}),
	rateLimit: "sensitive"
}, async (req, { auth, body, query }) => {
	let resolvedUserId = null;
	let activeJob = null;
	let jobFailed = false;
	try {
		let targetUserId = body.userId || query.userId || body.workspaceId || query.workspaceId || null;
		if (!auth.isCron) targetUserId = auth.uid ?? null;
		if (!targetUserId) throw new ValidationError("Missing userId");
		resolvedUserId = targetUserId;
		const job = await claimNextSyncJob({ userId: targetUserId });
		if (!job) throw new NotFoundError("No queued jobs available");
		activeJob = job;
		const clientId = typeof job.clientId === "string" && job.clientId.trim().length > 0 ? job.clientId.trim() : null;
		const integration = await getIntegrationForJob({
			userId: targetUserId,
			providerId: job.providerId,
			clientId
		});
		if (!integration || !integration.accessToken) {
			await Promise.all([failSyncJob({
				userId: targetUserId,
				jobId: job.id,
				message: "Integration or access token not found"
			}), integration ? updateProviderStatus({
				userId: targetUserId,
				providerId: job.providerId,
				clientId,
				status: "error",
				message: "Missing credentials"
			}) : Promise.resolve()]);
			throw new ValidationError("Integration credentials missing");
		}
		let metrics = [];
		let metricsCount = 0;
		let metricsPersistedInProvider = false;
		switch (job.providerId) {
			case "google": {
				const accountId = integration.accountId;
				if (typeof accountId !== "string" || accountId.trim().length === 0) {
					await failSyncJob({
						userId: targetUserId,
						jobId: job.id,
						message: "Google Ads account not configured. Please reconnect your Google Ads integration."
					});
					await updateProviderStatus({
						userId: targetUserId,
						providerId: job.providerId,
						clientId,
						status: "error",
						message: "Account ID missing. Please reconnect integration."
					});
					return {
						jobId: job.id,
						providerId: job.providerId,
						metricsCount: 0,
						skipped: true,
						reason: "missing_account_id"
					};
				}
				const developerToken = typeof integration.developerToken === "string" && integration.developerToken.trim().length > 0 ? integration.developerToken.trim() : typeof process.env.GOOGLE_ADS_DEVELOPER_TOKEN === "string" ? process.env.GOOGLE_ADS_DEVELOPER_TOKEN.trim() : "";
				if (developerToken.length === 0) {
					await failSyncJob({
						userId: targetUserId,
						jobId: job.id,
						message: "Google Ads developer token is missing. Set GOOGLE_ADS_DEVELOPER_TOKEN and reconnect Google Ads."
					});
					await updateProviderStatus({
						userId: targetUserId,
						providerId: job.providerId,
						clientId,
						status: "error",
						message: "Google Ads developer token is missing."
					});
					return {
						jobId: job.id,
						providerId: job.providerId,
						metricsCount: 0,
						skipped: true,
						reason: "missing_developer_token"
					};
				}
				const loginCustomerId = typeof integration.loginCustomerId === "string" && integration.loginCustomerId.length > 0 ? integration.loginCustomerId : null;
				const managerCustomerId = typeof integration.managerCustomerId === "string" && integration.managerCustomerId.length > 0 ? integration.managerCustomerId : null;
				let googleAccessToken = integration.accessToken;
				if (isTokenExpiringSoon(integration.accessTokenExpiresAt)) googleAccessToken = await refreshGoogleAccessToken({
					userId: targetUserId,
					clientId
				});
				metrics = await fetchGoogleAdsMetrics({
					accessToken: googleAccessToken,
					developerToken,
					customerId: accountId,
					loginCustomerId,
					managerCustomerId,
					timeframeDays: job.timeframeDays,
					refreshAccessToken: async () => {
						googleAccessToken = await refreshGoogleAccessToken({
							userId: targetUserId,
							clientId
						});
						return googleAccessToken;
					}
				});
				break;
			}
			case "facebook": {
				const accountId = integration.accountId;
				if (typeof accountId !== "string" || accountId.trim().length === 0) {
					await failSyncJob({
						userId: targetUserId,
						jobId: job.id,
						message: "Meta Ads account not configured. Please reconnect your Meta Ads integration."
					});
					await updateIntegrationStatus({
						userId: targetUserId,
						providerId: job.providerId,
						clientId,
						status: "error",
						message: "Account ID missing. Please reconnect integration."
					});
					return {
						jobId: job.id,
						providerId: job.providerId,
						metricsCount: 0,
						skipped: true,
						reason: "missing_account_id"
					};
				}
				let metaAccessToken = integration.accessToken;
				if (isTokenExpiringSoon(integration.accessTokenExpiresAt)) metaAccessToken = await refreshMetaAccessToken({
					userId: targetUserId,
					clientId
				});
				metrics = await fetchMetaAdsMetrics({
					accessToken: metaAccessToken,
					adAccountId: accountId,
					timeframeDays: job.timeframeDays,
					refreshAccessToken: async () => {
						metaAccessToken = await refreshMetaAccessToken({
							userId: targetUserId,
							clientId
						});
						return metaAccessToken;
					}
				});
				break;
			}
			case "linkedin": {
				const accountId = integration.accountId;
				if (typeof accountId !== "string" || accountId.trim().length === 0) {
					await failSyncJob({
						userId: targetUserId,
						jobId: job.id,
						message: "LinkedIn Ads account not configured. Please reconnect your LinkedIn Ads integration."
					});
					await updateIntegrationStatus({
						userId: targetUserId,
						providerId: job.providerId,
						clientId,
						status: "error",
						message: "Account ID missing. Please reconnect integration."
					});
					return {
						jobId: job.id,
						providerId: job.providerId,
						metricsCount: 0,
						skipped: true,
						reason: "missing_account_id"
					};
				}
				const LINKEDIN_REFRESH_BUFFER_MS = 1440 * 60 * 1e3;
				let linkedInAccessToken = integration.accessToken;
				if (isTokenExpiringSoon(integration.accessTokenExpiresAt, LINKEDIN_REFRESH_BUFFER_MS)) linkedInAccessToken = await refreshLinkedInAccessToken({
					userId: targetUserId,
					clientId
				});
				metrics = await fetchLinkedInAdsMetrics({
					accessToken: linkedInAccessToken,
					accountId,
					timeframeDays: job.timeframeDays,
					maxRetries: 3,
					refreshAccessToken: async () => {
						linkedInAccessToken = await refreshLinkedInAccessToken({
							userId: targetUserId,
							clientId
						});
						return linkedInAccessToken;
					}
				});
				break;
			}
			case "tiktok": {
				const advertiserId = integration.accountId;
				if (typeof advertiserId !== "string" || advertiserId.trim().length === 0) {
					await failSyncJob({
						userId: targetUserId,
						jobId: job.id,
						message: "TikTok Ads account not configured. Please reconnect your TikTok Ads integration."
					});
					await updateIntegrationStatus({
						userId: targetUserId,
						providerId: job.providerId,
						clientId,
						status: "error",
						message: "Account ID missing. Please reconnect integration."
					});
					return {
						jobId: job.id,
						providerId: job.providerId,
						metricsCount: 0,
						skipped: true,
						reason: "missing_account_id"
					};
				}
				let tiktokAccessToken = integration.accessToken;
				if (isTokenExpiringSoon(integration.accessTokenExpiresAt)) tiktokAccessToken = await refreshTikTokAccessToken({
					userId: targetUserId,
					clientId
				});
				metrics = await fetchTikTokAdsMetrics({
					accessToken: tiktokAccessToken,
					advertiserId,
					timeframeDays: job.timeframeDays,
					refreshAccessToken: async () => {
						tiktokAccessToken = await refreshTikTokAccessToken({
							userId: targetUserId,
							clientId
						});
						return tiktokAccessToken;
					}
				});
				break;
			}
			case "google-analytics": {
				const result = await syncGoogleAnalyticsMetrics({
					userId: targetUserId,
					clientId,
					days: job.timeframeDays,
					requestId: req.headers.get("x-request-id")
				});
				metricsPersistedInProvider = true;
				metricsCount = result.written;
				break;
			}
			default:
				await failSyncJob({
					userId: targetUserId,
					jobId: job.id,
					message: `Unsupported provider: ${job.providerId}`
				});
				throw new ValidationError(`Unsupported provider ${job.providerId}`);
		}
		if (!metricsPersistedInProvider) {
			await writeMetricsBatch({
				userId: targetUserId,
				clientId,
				metrics
			});
			metricsCount = metrics.length;
		}
		await Promise.all([completeSyncJob({
			userId: targetUserId,
			jobId: job.id
		}), updateProviderStatus({
			userId: targetUserId,
			providerId: job.providerId,
			clientId,
			status: "success",
			message: null
		})]);
		if (clientId) try {
			let recipientEmail = null;
			const convex = createConvexAdminClient({ auth: {
				uid: targetUserId,
				email: null,
				name: null,
				claims: { provider: "better-auth" },
				isCron: false
			} });
			if (convex) try {
				recipientEmail = (await convex.query(api.users.getByLegacyId, { legacyId: targetUserId }))?.email ?? null;
			} catch (queryError) {
				logger.error("[integrations/process] failed to fetch recipient email", queryError, {
					userId: targetUserId,
					requestId: req.headers.get("x-request-id")
				});
			}
			if (recipientEmail) {
				const workspaceId = await resolveWorkspaceIdForUser(targetUserId);
				await processWorkspaceAlerts({
					userId: targetUserId,
					workspaceId,
					clientId,
					recipientEmail
				});
			}
		} catch (alertError) {
			logger.error("[integrations/process] alert evaluation failed", alertError, {
				userId: targetUserId,
				requestId: req.headers.get("x-request-id")
			});
		}
		return {
			jobId: job.id,
			providerId: job.providerId,
			metricsCount
		};
	} catch (error) {
		logger.error("[integrations/process] error", error, {
			requestId: req.headers.get("x-request-id"),
			userId: resolvedUserId,
			jobId: activeJob?.id
		});
		if (error instanceof IntegrationTokenError) {
			const { userId, providerId, message } = error;
			if (resolvedUserId && activeJob && !jobFailed) {
				await failSyncJob({
					userId: resolvedUserId,
					jobId: activeJob.id,
					message: message ?? "Token refresh failed"
				});
				jobFailed = true;
			}
			if (userId && providerId) await updateProviderStatus({
				userId,
				providerId,
				clientId: activeJob?.clientId ?? null,
				status: "error",
				message: message ?? "Token refresh failed"
			});
			throw new ValidationError(message ?? "Token refresh failed");
		}
		const { userId, jobId, providerId, message } = extractSyncErrorDetails(error);
		if (userId && jobId && providerId) {
			await Promise.all([failSyncJob({
				userId,
				jobId,
				message: message ?? "Unknown error"
			}), updateProviderStatus({
				userId,
				providerId,
				clientId: activeJob?.clientId ?? null,
				status: "error",
				message: message ?? "Sync failed"
			})]);
			jobFailed = true;
		} else if (userId && jobId) {
			await failSyncJob({
				userId,
				jobId,
				message: message ?? "Unknown error"
			});
			jobFailed = true;
		} else if (userId && providerId) await updateProviderStatus({
			userId,
			providerId,
			clientId: activeJob?.clientId ?? null,
			status: "error",
			message: message ?? "Sync failed"
		});
		if (resolvedUserId && activeJob && !jobFailed) {
			await Promise.all([failSyncJob({
				userId: resolvedUserId,
				jobId: activeJob.id,
				message: message ?? "Unknown error"
			}), updateProviderStatus({
				userId: resolvedUserId,
				providerId: activeJob.providerId,
				clientId: activeJob.clientId ?? null,
				status: "error",
				message: message ?? "Sync failed"
			})]);
			jobFailed = true;
		}
		throw new ApiError(message ?? "Failed to process sync job", 500);
	}
});
function extractSyncErrorDetails(error) {
	if (typeof error === "object" && error !== null) {
		const candidate = error;
		return {
			message: typeof candidate.message === "string" ? candidate.message : void 0,
			userId: typeof candidate.userId === "string" ? candidate.userId : void 0,
			jobId: typeof candidate.jobId === "string" ? candidate.jobId : void 0,
			providerId: typeof candidate.providerId === "string" ? candidate.providerId : void 0
		};
	}
	if (error instanceof Error) return { message: error.message };
	return {};
}
var Route$44 = createFileRoute("/api/integrations/process")({ server: { handlers: handlers$21 } });
var handlers$20 = adaptApiHandler({
	bodySchema: object({
		providerId: string().min(1),
		timeframeDays: number().finite().min(1).optional()
	}),
	rateLimit: "sensitive"
}, async (_req, { auth, body }) => {
	if (!auth.uid) throw new UnauthorizedError("Authentication required");
	if (!await scheduleIntegrationSync({
		userId: auth.uid,
		providerId: body.providerId,
		force: true,
		timeframeDays: body.timeframeDays
	})) return {
		scheduled: false,
		message: "Sync already running or provider unavailable."
	};
	return { scheduled: true };
});
var Route$43 = createFileRoute("/api/integrations/manual-sync")({ server: { handlers: handlers$20 } });
var _convexClient = null;
function getConvexClient() {
	if (_convexClient) return _convexClient;
	const url = process.env.CONVEX_URL ?? "https://grand-sparrow-698.convex.cloud";
	if (!url) throw new Error("CONVEX_URL is not configured");
	_convexClient = new ConvexHttpClient(url);
	return _convexClient;
}
var handlers$19 = adaptApiHandler({
	bodySchema: object({
		operation: string().optional(),
		maxUsers: number().optional(),
		timeframeDays: number().optional(),
		force: boolean().optional(),
		providerIds: array(string()).optional(),
		providerId: string().optional(),
		userId: string().optional()
	}),
	rateLimit: "sensitive"
}, async (_req, { auth, body }) => {
	const startedAt = Date.now();
	if (!auth.isCron) throw new UnauthorizedError("Cron authentication required");
	const operation = body.operation ?? "schedule_all_users";
	const maxUsers = Math.min(body.maxUsers ?? 50, 500);
	const timeframeDays = body.timeframeDays;
	const force = Boolean(body.force);
	const resolvedProviderIds = body.providerIds ?? (body.providerId ? [body.providerId] : void 0);
	const resolvedUserId = body.userId;
	let processedCount = 0;
	let enqueuedJobs = 0;
	let errors = [];
	switch (operation) {
		case "schedule_all_users":
		case "process_all_users": {
			const { scheduled, skipped } = await scheduleSyncsForAllUsers({
				force,
				providerIds: resolvedProviderIds,
				maxUsers,
				timeframeDays
			});
			processedCount = scheduled.length;
			enqueuedJobs = scheduled.reduce((total, entry) => total + entry.providerIds.length, 0);
			if (skipped.length > 0) errors = skipped.map((entry) => `User ${entry.userId} skipped providers: ${entry.providerIds.join(", ")}`).slice(0, 10);
			break;
		}
		case "cleanup_old_jobs": {
			const cutoffDate = /* @__PURE__ */ new Date();
			cutoffDate.setDate(cutoffDate.getDate() - 7);
			const cutoffMs = cutoffDate.getTime();
			const convex = getConvexClient();
			const cronKey = process.env.INTEGRATIONS_CRON_SECRET;
			try {
				enqueuedJobs = (await convex.mutation(api.adsIntegrations.cleanupOldJobsServer, {
					cutoffMs,
					cronKey
				})).deleted;
				processedCount = 1;
			} catch (error) {
				const message = error instanceof Error ? error.message : "Unknown error";
				errors.push(`Cleanup failed: ${message}`);
			}
			break;
		}
		case "reset_stale_jobs": {
			const staleThreshold = /* @__PURE__ */ new Date();
			staleThreshold.setMinutes(staleThreshold.getMinutes() - 30);
			const startedBeforeMs = staleThreshold.getTime();
			const convex = getConvexClient();
			const cronKey = process.env.INTEGRATIONS_CRON_SECRET;
			try {
				enqueuedJobs = (await convex.mutation(api.adsIntegrations.resetStaleJobsServer, {
					startedBeforeMs,
					cronKey
				})).reset;
				processedCount = 1;
			} catch (error) {
				const message = error instanceof Error ? error.message : "Unknown error";
				errors.push(`Reset stale jobs failed: ${message}`);
			}
			break;
		}
		case "schedule_user":
			if (!resolvedUserId) throw new ValidationError("userId is required for schedule_user");
			if (resolvedProviderIds && resolvedProviderIds.length === 1) {
				const scheduled = await scheduleIntegrationSync({
					userId: resolvedUserId,
					providerId: resolvedProviderIds[0],
					force,
					timeframeDays
				});
				processedCount = scheduled ? 1 : 0;
				enqueuedJobs = scheduled ? 1 : 0;
			} else {
				const result = await scheduleSyncsForUser({
					userId: resolvedUserId,
					providerIds: resolvedProviderIds,
					force,
					timeframeDays
				});
				processedCount = result.scheduled.length;
				enqueuedJobs = result.scheduled.length;
				if (result.skipped.length > 0) errors = result.skipped.map((providerId) => `Skipped provider ${providerId}`);
			}
			break;
		default: throw new ValidationError(`Unknown operation: ${operation}`);
	}
	const durationMs = Date.now() - startedAt;
	const result = {
		operation,
		processedCount,
		enqueuedJobs,
		errors: errors.length > 0 ? errors.slice(0, 10) : [],
		timestamp: (/* @__PURE__ */ new Date()).toISOString()
	};
	console.log("[integrations/cron] Completed operation:", result);
	await recordSchedulerEvent({
		source: "cron",
		operation,
		processedJobs: processedCount,
		successfulJobs: enqueuedJobs,
		failedJobs: errors.length,
		durationMs,
		errors,
		failureThresholdOverride: errors.length,
		notes: operation === "schedule_all_users" && processedCount === 0 ? "No users processed during schedule run" : void 0
	});
	return result;
});
var Route$42 = createFileRoute("/api/integrations/cron")({ server: { handlers: handlers$19 } });
var GOOGLE_AUTH_ENDPOINT = process.env.GOOGLE_AUTH_ENDPOINT ?? "https://accounts.google.com/o/oauth2/v2/auth";
var GOOGLE_TOKEN_ENDPOINT = process.env.GOOGLE_TOKEN_ENDPOINT ?? "https://oauth2.googleapis.com/token";
var GOOGLE_ADS_SCOPES = [
	"https://www.googleapis.com/auth/adwords",
	"openid",
	"email"
];
var GOOGLE_ANALYTICS_SCOPES = [
	"https://www.googleapis.com/auth/analytics.readonly",
	"openid",
	"email"
];
function readEnvValue(key) {
	const value = process.env[key];
	if (typeof value !== "string") return null;
	const normalized = value.trim();
	return normalized.length > 0 ? normalized : null;
}
function firstEnvValue(keys) {
	for (const key of keys) {
		const value = readEnvValue(key);
		if (value) return value;
	}
	return null;
}
function normalizeAppUrl(appUrl) {
	if (typeof appUrl !== "string") return null;
	const normalized = appUrl.trim().replace(/\/+$/, "");
	return normalized.length > 0 ? normalized : null;
}
function resolveGoogleAdsOAuthCredentials() {
	return {
		clientId: firstEnvValue(["GOOGLE_ADS_CLIENT_ID", "GOOGLE_CLIENT_ID"]),
		clientSecret: firstEnvValue(["GOOGLE_ADS_CLIENT_SECRET", "GOOGLE_CLIENT_SECRET"])
	};
}
function resolveGoogleAnalyticsOAuthCredentials() {
	return {
		clientId: firstEnvValue(["GOOGLE_ANALYTICS_CLIENT_ID", "GOOGLE_CLIENT_ID"]),
		clientSecret: firstEnvValue(["GOOGLE_ANALYTICS_CLIENT_SECRET", "GOOGLE_CLIENT_SECRET"])
	};
}
function resolveGoogleAdsOAuthRedirectUri(appUrl) {
	const explicit = firstEnvValue(["GOOGLE_ADS_OAUTH_REDIRECT_URI", "GOOGLE_OAUTH_REDIRECT_URI"]);
	if (explicit) return explicit;
	const normalizedAppUrl = normalizeAppUrl(appUrl);
	if (!normalizedAppUrl) return null;
	return `${normalizedAppUrl}/api/integrations/google/oauth/callback`;
}
function resolveGoogleAnalyticsOAuthRedirectUri(appUrl) {
	const explicit = firstEnvValue(["GOOGLE_ANALYTICS_OAUTH_REDIRECT_URI"]);
	if (explicit) return explicit;
	const normalizedAppUrl = normalizeAppUrl(appUrl);
	if (!normalizedAppUrl) return null;
	return `${normalizedAppUrl}/api/integrations/google-analytics/oauth/callback`;
}
function parseGoogleScopeList(scopeValue, fallback = []) {
	const scopes = typeof scopeValue === "string" ? scopeValue.split(" ").flatMap((scope) => {
		const normalizedScope = scope.trim();
		return normalizedScope ? [normalizedScope] : [];
	}) : [];
	if (scopes.length > 0) return scopes;
	return fallback;
}
var STATE_TTL_MS$3 = 300 * 1e3;
var GoogleTokenExchangeError = class extends Error {
	constructor(options) {
		super(options.message);
		this.name = "GoogleTokenExchangeError";
		this.code = options.code;
		this.description = options.description;
	}
};
var GoogleOAuthError = class extends Error {
	constructor(message, code, isRetryable = false) {
		super(message);
		this.name = "GoogleOAuthError";
		this.code = code;
		this.isRetryable = isRetryable;
	}
};
function createGoogleOAuthState(payload) {
	const data = {
		...payload,
		codeVerifier: payload.codeVerifier ?? generateCodeVerifier(),
		createdAt: payload.createdAt ?? Date.now()
	};
	return encodeURIComponent(encrypt(JSON.stringify(data)));
}
function validateGoogleOAuthState(state) {
	if (!state) throw new Error("Missing OAuth state");
	const decoded = decodeURIComponent(state);
	let parsed;
	try {
		parsed = JSON.parse(decrypt(decoded));
	} catch {
		throw new Error("Invalid state payload");
	}
	if (!parsed?.state || !parsed.createdAt) throw new Error("Malformed state payload");
	if (Date.now() - parsed.createdAt > STATE_TTL_MS$3) throw new Error("OAuth state has expired");
	return parsed;
}
function buildGoogleOAuthUrl(options) {
	const { clientId, redirectUri, state, scopes = GOOGLE_ADS_SCOPES, accessType = "offline", prompt = "consent" } = options;
	if (!clientId) throw new Error("Google client ID is required");
	if (!redirectUri) throw new Error("Google redirect URI is required");
	const params = new URLSearchParams({
		client_id: clientId,
		redirect_uri: redirectUri,
		response_type: "code",
		scope: scopes.join(" "),
		access_type: accessType,
		prompt
	});
	if (state) params.set("state", state);
	return `${GOOGLE_AUTH_ENDPOINT}?${params.toString()}`;
}
function buildGoogleAnalyticsOAuthUrl(options) {
	return buildGoogleOAuthUrl({
		...options,
		scopes: options.scopes ?? [...GOOGLE_ANALYTICS_SCOPES]
	});
}
async function exchangeGoogleCodeForTokens(options) {
	const { clientId, clientSecret, redirectUri, code } = options;
	if (!clientId || !clientSecret) throw new GoogleTokenExchangeError({ message: "Google OAuth credentials are required" });
	if (!code) throw new GoogleTokenExchangeError({ message: "Authorization code is required" });
	const body = new URLSearchParams({
		client_id: clientId,
		client_secret: clientSecret,
		redirect_uri: redirectUri,
		code,
		grant_type: "authorization_code"
	});
	let response;
	try {
		response = await fetch(GOOGLE_TOKEN_ENDPOINT, {
			method: "POST",
			headers: { "Content-Type": "application/x-www-form-urlencoded" },
			body: body.toString()
		});
	} catch (networkError) {
		throw new GoogleTokenExchangeError({ message: `Network error during Google token exchange: ${networkError instanceof Error ? networkError.message : "Network error"}` });
	}
	const responseText = await response.text();
	let responseData;
	try {
		responseData = JSON.parse(responseText);
	} catch {
		throw new GoogleTokenExchangeError({ message: `Invalid response from Google: ${responseText.substring(0, 200)}` });
	}
	if (!response.ok) {
		const errorData = responseData;
		throw new GoogleTokenExchangeError({
			message: errorData?.error_description ?? `Google token exchange failed (${response.status})`,
			code: errorData?.error,
			description: errorData?.error_description
		});
	}
	const tokenData = responseData;
	if (!tokenData.access_token) throw new GoogleTokenExchangeError({ message: "Google token response missing access_token" });
	return tokenData;
}
async function completeGoogleOAuthFlow(options) {
	const { code, userId, clientId: integrationClientId, redirectUri } = options;
	const { clientId: googleClientId, clientSecret: googleClientSecret } = resolveGoogleAdsOAuthCredentials();
	if (!googleClientId || !googleClientSecret) throw new GoogleOAuthError("Google OAuth credentials are not configured");
	let tokenResponse;
	try {
		tokenResponse = await exchangeGoogleCodeForTokens({
			clientId: googleClientId,
			clientSecret: googleClientSecret,
			redirectUri,
			code
		});
	} catch (error) {
		const message = error instanceof Error ? error.message : "Token exchange failed";
		console.error("[Google OAuth] Code exchange failed:", message);
		throw new GoogleOAuthError(`Failed to exchange authorization code: ${message}`);
	}
	if (!tokenResponse.access_token) throw new GoogleOAuthError("No access token received from Google");
	const existingIntegration = await getAdIntegration({
		userId,
		providerId: "google",
		clientId: integrationClientId ?? null
	});
	const developerToken = (typeof process.env.GOOGLE_ADS_DEVELOPER_TOKEN === "string" ? process.env.GOOGLE_ADS_DEVELOPER_TOKEN.trim() : "") || existingIntegration?.developerToken || null;
	await persistIntegrationTokens({
		userId,
		providerId: "google",
		clientId: integrationClientId ?? null,
		accessToken: tokenResponse.access_token,
		idToken: tokenResponse.id_token ?? null,
		refreshToken: tokenResponse.refresh_token ?? null,
		scopes: parseGoogleScopeList(tokenResponse.scope, [...GOOGLE_ADS_SCOPES]),
		accountId: existingIntegration?.accountId ?? null,
		accountName: existingIntegration?.accountName ?? null,
		developerToken,
		loginCustomerId: existingIntegration?.loginCustomerId ?? null,
		managerCustomerId: existingIntegration?.managerCustomerId ?? null,
		accessTokenExpiresAt: tokenResponse.expires_in ? new Date(Date.now() + tokenResponse.expires_in * 1e3) : null
	});
	console.log(`[Google OAuth] Successfully persisted integration for user ${userId}`);
	if (existingIntegration?.accountId) await enqueueSyncJob({
		userId,
		providerId: "google",
		jobType: "initial-backfill",
		clientId: integrationClientId ?? null
	});
}
async function completeGoogleAnalyticsOAuthFlow(options) {
	const { code, userId, clientId: integrationClientId, redirectUri } = options;
	const { clientId: googleClientId, clientSecret: googleClientSecret } = resolveGoogleAnalyticsOAuthCredentials();
	if (!googleClientId || !googleClientSecret) throw new GoogleOAuthError("Google Analytics OAuth credentials are not configured");
	let tokenResponse;
	try {
		tokenResponse = await exchangeGoogleCodeForTokens({
			clientId: googleClientId,
			clientSecret: googleClientSecret,
			redirectUri,
			code
		});
	} catch (error) {
		const message = error instanceof Error ? error.message : "Token exchange failed";
		console.error("[Google Analytics OAuth] Code exchange failed:", message);
		throw new GoogleOAuthError(`Failed to exchange authorization code: ${message}`);
	}
	if (!tokenResponse.access_token) throw new GoogleOAuthError("No access token received from Google Analytics OAuth");
	const existingIntegration = await getGoogleAnalyticsIntegration({
		userId,
		clientId: integrationClientId ?? null
	});
	await persistGoogleAnalyticsTokens({
		userId,
		clientId: integrationClientId ?? null,
		accessToken: tokenResponse.access_token,
		idToken: tokenResponse.id_token ?? null,
		refreshToken: tokenResponse.refresh_token ?? null,
		scopes: parseGoogleScopeList(tokenResponse.scope, [...GOOGLE_ANALYTICS_SCOPES]),
		accountId: existingIntegration?.accountId ?? null,
		accountName: existingIntegration?.accountName ?? null,
		accessTokenExpiresAt: tokenResponse.expires_in ? new Date(Date.now() + tokenResponse.expires_in * 1e3) : null
	});
	console.log(`[Google Analytics OAuth] Successfully persisted integration for user ${userId}`);
	if (existingIntegration?.accountId) await enqueueSyncJob({
		userId,
		providerId: "google-analytics",
		jobType: "initial-backfill",
		clientId: integrationClientId ?? null
	});
}
function readEnv(name) {
	const value = process.env[name];
	return typeof value === "string" && value.trim().length > 0 ? value.trim() : null;
}
function configuredCheck(isConfigured, message, metadata) {
	return isConfigured ? {
		status: "ok",
		metadata
	} : {
		status: "warning",
		message,
		metadata
	};
}
async function probeGoogleAdsLiveHealth() {
	const developerToken = readEnv("GOOGLE_ADS_DEVELOPER_TOKEN");
	const probeToken = readEnv("GOOGLE_ADS_HEALTH_PROBE_ACCESS_TOKEN");
	const probeCustomerId = readEnv("GOOGLE_ADS_HEALTH_PROBE_CUSTOMER_ID");
	if (!developerToken) return {
		status: "warning",
		message: "GOOGLE_ADS_DEVELOPER_TOKEN is not configured",
		metadata: { liveProbe: false }
	};
	if (!probeToken) return {
		status: "ok",
		message: "Configured (set GOOGLE_ADS_HEALTH_PROBE_ACCESS_TOKEN for live probe)",
		metadata: {
			liveProbe: false,
			hasDeveloperToken: true
		}
	};
	const startedAt = Date.now();
	const { checkGoogleAdsIntegrationHealth } = await import("./google-ads-CYR7JaLd.mjs");
	const result = await checkGoogleAdsIntegrationHealth({
		accessToken: probeToken,
		developerToken,
		customerId: probeCustomerId ?? void 0,
		loginCustomerId: readEnv("GOOGLE_ADS_HEALTH_PROBE_LOGIN_CUSTOMER_ID")
	});
	return {
		status: result.healthy ? "ok" : "error",
		message: result.healthy ? void 0 : result.error ?? "Google Ads live health probe failed",
		responseTime: Date.now() - startedAt,
		metadata: {
			liveProbe: true,
			tokenValid: result.tokenValid,
			developerTokenValid: result.developerTokenValid,
			accountAccessible: result.accountAccessible
		}
	};
}
function buildConfiguredServiceChecks() {
	const appUrl = readEnv("NEXT_PUBLIC_APP_URL");
	const googleAdsCredentials = resolveGoogleAdsOAuthCredentials();
	const googleAnalyticsCredentials = resolveGoogleAnalyticsOAuthCredentials();
	const googleWorkspaceCredentials = resolveGoogleWorkspaceOAuthCredentials();
	const livekit = resolveLiveKitCredentials();
	return {
		betterAuth: configuredCheck(Boolean(readEnv("BETTER_AUTH_SECRET") && (readEnv("NEXT_PUBLIC_CONVEX_SITE_URL") || readEnv("NEXT_PUBLIC_CONVEX_HTTP_URL"))), "Missing Better Auth secret or Convex site URL", {
			hasSecret: Boolean(readEnv("BETTER_AUTH_SECRET")),
			hasConvexSiteUrl: Boolean(readEnv("NEXT_PUBLIC_CONVEX_SITE_URL") || readEnv("NEXT_PUBLIC_CONVEX_HTTP_URL"))
		}),
		gemini: configuredCheck(Boolean(resolveGeminiApiKey()), "Missing GEMINI_API_KEY or GOOGLE_API_KEY"),
		posthog: configuredCheck(Boolean(readEnv("NEXT_PUBLIC_POSTHOG_KEY") && readEnv("NEXT_PUBLIC_POSTHOG_HOST")), "Missing NEXT_PUBLIC_POSTHOG_KEY or NEXT_PUBLIC_POSTHOG_HOST"),
		brevo: configuredCheck(Boolean(readEnv("BREVO_API_KEY")), "BREVO_API_KEY is not configured"),
		googleAds: configuredCheck(Boolean(googleAdsCredentials.clientId && googleAdsCredentials.clientSecret && resolveGoogleAdsOAuthRedirectUri(appUrl) && readEnv("GOOGLE_ADS_DEVELOPER_TOKEN")), "Missing Google Ads OAuth credentials, redirect URI, or GOOGLE_ADS_DEVELOPER_TOKEN", { hasDeveloperToken: Boolean(readEnv("GOOGLE_ADS_DEVELOPER_TOKEN")) }),
		googleAnalytics: configuredCheck(Boolean(googleAnalyticsCredentials.clientId && googleAnalyticsCredentials.clientSecret && resolveGoogleAnalyticsOAuthRedirectUri(appUrl)), "Missing Google Analytics OAuth credentials or redirect URI"),
		metaAds: configuredCheck(Boolean(readEnv("META_APP_ID") && readEnv("META_APP_SECRET")), "Missing META_APP_ID or META_APP_SECRET"),
		linkedInAds: configuredCheck(Boolean(readEnv("LINKEDIN_CLIENT_ID") && readEnv("LINKEDIN_CLIENT_SECRET")), "Missing LINKEDIN_CLIENT_ID or LINKEDIN_CLIENT_SECRET"),
		tikTokAds: configuredCheck(Boolean(readEnv("TIKTOK_CLIENT_KEY") && readEnv("TIKTOK_CLIENT_SECRET")), "Missing TIKTOK_CLIENT_KEY or TIKTOK_CLIENT_SECRET"),
		googleWorkspace: configuredCheck(Boolean(googleWorkspaceCredentials.clientId && googleWorkspaceCredentials.clientSecret && resolveGoogleWorkspaceOAuthRedirectUri(appUrl)), "Missing Google Workspace OAuth credentials or redirect URI"),
		livekit: configuredCheck(Boolean(livekit.apiKey && livekit.apiSecret && livekit.serverUrl), "Missing LIVEKIT_API_KEY, LIVEKIT_API_SECRET, or LIVEKIT_URL"),
		environment: configuredCheck(Boolean(readEnv("NEXT_PUBLIC_CONVEX_URL")), "Missing NEXT_PUBLIC_CONVEX_URL")
	};
}
function isReadyProbeAuthorized(req, auth) {
	const secret = process.env.HEALTH_CHECK_SECRET?.trim();
	if (secret) {
		const header = req.headers.get("authorization")?.trim();
		if ((header?.startsWith("Bearer ") ? header.slice(7).trim() : null) === secret) return true;
	}
	return auth?.claims?.role === "admin";
}
var handlers$18 = adaptApiHandler({
	auth: "optional",
	rateLimit: "standard"
}, async (req, { auth }) => {
	if (!isReadyProbeAuthorized(req, auth)) throw new ForbiddenError("Forbidden");
	const startTime = Date.now();
	const checks = buildConfiguredServiceChecks();
	try {
		const checkStart = Date.now();
		const { createConvexAdminClient } = await import("./convex-admin-BaGa9jt0.mjs");
		const convex = createConvexAdminClient({ auth: {
			uid: "healthcheck",
			email: null,
			name: null,
			claims: {
				provider: "system",
				role: "admin"
			},
			isCron: true
		} });
		if (!convex) throw new Error("Convex admin client is not configured");
		await convex.query(api.health.ping, {});
		checks.convex = {
			status: "ok",
			responseTime: Date.now() - checkStart
		};
	} catch (error) {
		checks.convex = {
			status: "error",
			message: error instanceof Error ? error.message : "Convex connection failed"
		};
	}
	try {
		checks.googleAdsLive = await probeGoogleAdsLiveHealth();
	} catch (error) {
		checks.googleAdsLive = {
			status: "error",
			message: error instanceof Error ? error.message : "Google Ads live health probe failed"
		};
	}
	try {
		const checkStart = Date.now();
		if (process.env.BREVO_API_KEY) {
			const { checkBrevoHealth } = await import("./brevo-mms8k3_e.mjs");
			const healthy = await checkBrevoHealth();
			checks.brevo = {
				status: healthy ? "ok" : "error",
				responseTime: Date.now() - checkStart,
				message: healthy ? void 0 : "Brevo API health check failed"
			};
		}
	} catch (error) {
		checks.brevo = {
			status: "error",
			message: error instanceof Error ? error.message : "Brevo connection failed"
		};
	}
	const hasErrors = Object.values(checks).some((check) => check.status === "error");
	const hasWarnings = Object.values(checks).some((check) => check.status === "warning");
	const overallStatus = hasErrors ? "unhealthy" : hasWarnings ? "degraded" : "healthy";
	const response = {
		status: overallStatus,
		timestamp: (/* @__PURE__ */ new Date()).toISOString(),
		uptime: process.uptime(),
		responseTime: Date.now() - startTime,
		checks,
		version: process.env.npm_package_version || "0.1.0"
	};
	const statusCode = overallStatus === "unhealthy" ? 503 : 200;
	const { NextResponse } = await import("../_libs/next.mjs").then((n) => /* @__PURE__ */ __toESM(n.t()));
	const payload = overallStatus === "healthy" ? {
		success: true,
		data: response
	} : {
		success: false,
		error: overallStatus === "degraded" ? "Service health degraded" : "Service unavailable",
		code: "SERVICE_UNAVAILABLE",
		data: response
	};
	return NextResponse.json(payload, { status: statusCode });
});
var Route$41 = createFileRoute("/api/health/ready")({ server: { handlers: handlers$18 } });
var ALLOWED_DOMAINS = [
	"storage.googleapis.com",
	"public-api.gamma.app",
	"gamma.app"
];
function validateProxiedHost(hostname) {
	if (hostname.endsWith(".r2.dev") || hostname.endsWith(".r2.cloudflarestorage.com")) return true;
	return ALLOWED_DOMAINS.some((domain) => hostname === domain || hostname.endsWith(`.${domain}`));
}
var querySchema = object({ url: string().url("Invalid URL format") });
var HEAD = adaptApiHandler({
	auth: "required",
	querySchema
}, async (req, { query }) => {
	const { url } = query;
	if (!validateProxiedHost(new URL(url).hostname)) throw new ForbiddenError("URL domain not allowed");
	const response = await fetch(url, {
		method: "HEAD",
		cache: "no-store",
		headers: { Accept: "application/octet-stream,application/vnd.openxmlformats-officedocument.presentationml.presentation,*/*" }
	});
	if (!response.ok) throw new ServiceUnavailableError(`Failed to fetch file: ${response.status}`);
	const contentType = response.headers.get("content-type") || "application/vnd.openxmlformats-officedocument.presentationml.presentation";
	const contentLength = response.headers.get("content-length");
	const headers = {
		"Content-Type": contentType,
		"Cache-Control": "private, no-store"
	};
	if (contentLength) headers["Content-Length"] = contentLength;
	return new Response(null, {
		status: 200,
		headers
	});
});
var GET$1 = adaptApiHandler({
	auth: "required",
	querySchema
}, async (req, { query }) => {
	const { url } = query;
	if (!validateProxiedHost(new URL(url).hostname)) throw new ForbiddenError("URL domain not allowed");
	const response = await fetch(url, {
		cache: "no-store",
		headers: { Accept: "application/octet-stream,application/vnd.openxmlformats-officedocument.presentationml.presentation,*/*" }
	});
	if (!response.ok) throw new ServiceUnavailableError(`Failed to fetch file: ${response.status}`);
	const contentType = response.headers.get("content-type") || "application/vnd.openxmlformats-officedocument.presentationml.presentation";
	return new Response(response.body, {
		status: 200,
		headers: {
			"Content-Type": contentType,
			"Content-Disposition": "inline; filename=\"presentation.pptx\"",
			"Cache-Control": "private, no-store"
		}
	});
});
var Route$40 = createFileRoute("/api/files/proxy")({ server: { handlers: {
	GET: GET$1.GET,
	HEAD: HEAD.HEAD
} } });
/**
* Whether admin debug introspection routes/queries are available.
* Off in production unless ENABLE_DEBUG_INTROSPECTION=true.
*/
function isDebugIntrospectionEnabled() {
	const flag = process.env.ENABLE_DEBUG_INTROSPECTION;
	if (flag === "true") return true;
	if (flag === "false") return false;
	return false;
}
function assertDebugIntrospectionEnabled() {
	if (!isDebugIntrospectionEnabled()) throw new NotFoundError("Not found");
}
var handlers$17 = adaptApiHandler({
	auth: "required",
	adminOnly: true,
	querySchema: object({
		mode: _enum([
			"count",
			"list",
			"whoami"
		]).default("count"),
		limit: string().optional().default("200").transform((val) => {
			const num = parseInt(val, 10);
			if (!Number.isFinite(num) || num < 1) return 200;
			return Math.min(num, 1e3);
		})
	}),
	rateLimit: "standard"
}, async (_req, { query }) => {
	assertDebugIntrospectionEnabled();
	const { mode, limit } = query;
	const convexUrl = process.env.CONVEX_URL ?? "https://grand-sparrow-698.convex.cloud";
	if (!convexUrl) return {
		success: false,
		error: "Convex not configured",
		code: "CONFIG_ERROR"
	};
	const { getToken } = await import("./auth-server-DbIghuG9.mjs").then((n) => n.t);
	const convexToken = await getToken();
	if (!convexToken) return {
		success: false,
		error: "No Convex token available",
		code: "AUTH_ERROR"
	};
	const convex = new ConvexHttpClient(convexUrl);
	convex.setAuth(convexToken);
	const whoami = await convex.query(debugApi.whoami, {});
	if (mode === "whoami") return { whoami };
	if (mode === "list") {
		const rows = await convex.query(debugApi.listAnyClients, { limit });
		return {
			whoami,
			rows,
			count: rows.length
		};
	}
	return {
		whoami,
		result: await convex.query(debugApi.countClientsByWorkspace, { limit })
	};
});
var Route$39 = createFileRoute("/api/debug/clients")({ server: { handlers: handlers$17 } });
var USD_SUMMARY_FORMATTER = new Intl.NumberFormat("en-US", {
	style: "currency",
	currency: "USD",
	maximumFractionDigits: 0
});
function formatMoney(value) {
	return USD_SUMMARY_FORMATTER.format(value);
}
function formatRoasValue(value) {
	if (value === null) return "n/a";
	if (!Number.isFinite(value)) return "very high";
	return `${value.toFixed(2)}x`;
}
function formatProviderLabel(providerId) {
	return providerId.split(/[-_]/).flatMap((part) => part ? [part.charAt(0).toUpperCase() + part.slice(1)] : []).join(" ");
}
function buildClientSummaryPrompt(snapshot) {
	const channelLines = snapshot.providerSnapshots.length > 0 ? snapshot.providerSnapshots.map((provider) => `- ${formatProviderLabel(provider.providerId)}: spend ${formatMoney(provider.spend)}, revenue ${formatMoney(provider.revenue)}, conversions ${provider.conversions}, ROAS ${formatRoasValue(provider.roas)}`).join("\n") : "- No paid-media channel data is available yet.";
	return [
		"You are a senior client strategist writing an executive dashboard snapshot for an agency team.",
		"Return exactly 1 headline line and exactly 3 bullet lines.",
		"Format:",
		"Headline: <8 to 12 words>",
		"- <performance bullet>",
		"- <delivery or risk bullet>",
		"- <recommended next step bullet>",
		"Rules:",
		"- Keep each bullet under 24 words.",
		"- Be specific, direct, and factual.",
		"- Do not mention AI, the model, or that this was generated.",
		"- If data is thin, say that clearly instead of inventing context.",
		"",
		`Client: ${snapshot.clientName}`,
		snapshot.accountManager ? `Account manager: ${snapshot.accountManager}` : null,
		snapshot.teamHighlights.length > 0 ? `Team: ${snapshot.teamHighlights.join(", ")}` : "Team: Not specified",
		snapshot.lastRefreshedIso ? `Snapshot timestamp: ${snapshot.lastRefreshedIso}` : null,
		`Paid media totals: spend ${formatMoney(snapshot.totalSpend)}, revenue ${formatMoney(snapshot.totalRevenue)}, clicks ${snapshot.totalClicks}, conversions ${snapshot.totalConversions}, ROAS ${formatRoasValue(snapshot.roas)}, active channels ${snapshot.activeChannels}, top channel ${snapshot.topProvider ?? "none"}.`,
		`Task load: ${snapshot.taskSummary.total} open, ${snapshot.taskSummary.overdue} overdue, ${snapshot.taskSummary.dueSoon} due soon, ${snapshot.taskSummary.highPriority} high priority.`,
		`Proposals: total ${snapshot.proposalSummary.total}, ready ${snapshot.proposalSummary.ready}, sent ${snapshot.proposalSummary.sent}, in progress ${snapshot.proposalSummary.in_progress}, draft ${snapshot.proposalSummary.draft}, failed ${snapshot.proposalSummary.failed}.`,
		`Integrations: total ${snapshot.integrationSummary.totalIntegrations}, failed ${snapshot.integrationSummary.failedCount}, pending ${snapshot.integrationSummary.pendingCount}, never synced ${snapshot.integrationSummary.neverCount}.`,
		"Channel detail:",
		channelLines
	].filter((line) => Boolean(line)).join("\n");
}
function parseClientSummaryResponse(options) {
	const { raw, generatedAt, model } = options;
	const lines = raw.split(/\r?\n/g).flatMap((line) => {
		const trimmedLine = line.trim();
		return trimmedLine ? [trimmedLine] : [];
	});
	if (lines.length === 0) return null;
	const headline = (lines.find((line) => /^headline:/i.test(line)) ?? lines.find((line) => !line.startsWith("-")))?.replace(/^headline:\s*/i, "").trim() ?? "";
	const bullets = lines.flatMap((line) => {
		if (!line.startsWith("-")) return [];
		const trimmedLine = line.replace(/^-+\s*/, "").trim();
		return trimmedLine ? [trimmedLine] : [];
	}).slice(0, 3);
	if (!headline || bullets.length < 2) return null;
	return {
		headline,
		bullets,
		model,
		usedFallback: false,
		generatedAt
	};
}
function buildFallbackClientSummary(snapshot, generatedAt) {
	const performanceBullet = snapshot.totalSpend > 0 || snapshot.totalRevenue > 0 ? `${snapshot.clientName} is at ${formatMoney(snapshot.totalRevenue)} revenue on ${formatMoney(snapshot.totalSpend)} spend with ${formatRoasValue(snapshot.roas)} ROAS across ${snapshot.activeChannels} channel${snapshot.activeChannels === 1 ? "" : "s"}.` : `Paid-media data for ${snapshot.clientName} is still thin, so performance momentum is not established yet.`;
	const operationsBullet = `Delivery shows ${snapshot.taskSummary.total} open tasks, ${snapshot.taskSummary.overdue} overdue, and ${snapshot.proposalSummary.total} proposal${snapshot.proposalSummary.total === 1 ? "" : "s"} in motion.`;
	let focusBullet = "Next focus: tighten the next reporting cycle and define one clear growth experiment.";
	if (snapshot.integrationSummary.failedCount > 0) focusBullet = `Next focus: resolve ${snapshot.integrationSummary.failedCount} failed integration${snapshot.integrationSummary.failedCount === 1 ? "" : "s"} before expanding optimizations.`;
	else if (snapshot.taskSummary.overdue > 0) focusBullet = `Next focus: clear ${snapshot.taskSummary.overdue} overdue task${snapshot.taskSummary.overdue === 1 ? "" : "s"} so delivery risk does not compound.`;
	else if (snapshot.topProvider) focusBullet = `Next focus: turn ${snapshot.topProvider} learnings into the next client-ready recommendation and budget move.`;
	return {
		headline: `${snapshot.clientName} dashboard snapshot`,
		bullets: [
			performanceBullet,
			operationsBullet,
			focusBullet
		],
		model: null,
		usedFallback: true,
		generatedAt
	};
}
var providerSnapshotSchema = object({
	providerId: string().min(1),
	spend: number(),
	revenue: number(),
	conversions: number(),
	roas: number().nullable()
});
var proposalSummarySchema = object({
	total: number(),
	draft: number(),
	in_progress: number(),
	ready: number(),
	partial_success: number(),
	sent: number(),
	failed: number()
});
var handlers$16 = adaptApiHandler({
	auth: "required",
	workspace: "optional",
	bodySchema: object({ snapshot: object({
		clientId: string().min(1),
		clientName: string().min(1),
		accountManager: string().nullable(),
		teamHighlights: array(string()),
		lastRefreshedIso: string().nullable(),
		totalSpend: number(),
		totalRevenue: number(),
		totalClicks: number(),
		totalConversions: number(),
		roas: number().nullable(),
		activeChannels: number(),
		topProvider: string().nullable(),
		providerSnapshots: array(providerSnapshotSchema),
		taskSummary: object({
			total: number(),
			overdue: number(),
			dueSoon: number(),
			highPriority: number()
		}),
		proposalSummary: proposalSummarySchema,
		integrationSummary: object({
			totalIntegrations: number(),
			failedCount: number(),
			pendingCount: number(),
			neverCount: number()
		})
	}) }),
	rateLimit: "sensitive"
}, async (_req, { auth, body }) => {
	if (!auth.uid) throw new UnauthorizedError("Authentication required");
	const generatedAt = (/* @__PURE__ */ new Date()).toISOString();
	const snapshot = body.snapshot;
	const model = resolveGeminiModel();
	try {
		const rateLimit = await checkConvexRateLimit(buildGeminiRateLimitKey({
			name: "clientSummary",
			userId: auth.uid,
			workspaceId: auth.claims?.agencyId ? String(auth.claims.agencyId) : null,
			resourceId: snapshot.clientId
		}), GEMINI_RATE_LIMITS.clientSummary);
		if (!rateLimit.allowed) throw new RateLimitError(formatGeminiRateLimitMessage(rateLimit.resetMs));
		const apiKey = resolveGeminiApiKey();
		if (!apiKey) return { summary: buildFallbackClientSummary(snapshot, generatedAt) };
		return { summary: parseClientSummaryResponse({
			raw: await new GeminiAIService(apiKey).generateContent(buildClientSummaryPrompt(snapshot)),
			generatedAt,
			model
		}) ?? buildFallbackClientSummary(snapshot, generatedAt) };
	} catch (error) {
		console.error("[dashboard/client-summary] Failed to generate AI summary", error);
		return { summary: buildFallbackClientSummary(snapshot, generatedAt) };
	}
});
var Route$38 = createFileRoute("/api/dashboard/client-summary")({ server: { handlers: handlers$16 } });
/** Align with Better Auth session length (7 days) so cohorts_* cookies do not expire early. */
var SESSION_COOKIE_MAX_AGE_SEC = 10080 * 60;
var CSRF_COOKIE = "cohorts_csrf";
var CSRF_HEADER = "x-csrf-token";
var SESSION_COOKIE_OPTIONS = {
	maxAge: SESSION_COOKIE_MAX_AGE_SEC,
	path: "/",
	httpOnly: true,
	secure: true,
	sameSite: "strict"
};
function generateCsrfToken() {
	const array = new Uint8Array(32);
	crypto.getRandomValues(array);
	return Array.from(array, (byte) => byte.toString(16).padStart(2, "0")).join("");
}
function clearSessionCookies(response) {
	response.cookies.delete("cohorts_role");
	response.cookies.delete("cohorts_status");
	response.cookies.delete("cohorts_agency_id");
	response.cookies.delete("cohorts_session_expires");
	response.cookies.delete(CSRF_COOKIE);
}
function appendSessionCookies(response, profile) {
	const csrfToken = generateCsrfToken();
	response.cookies.set("cohorts_role", profile.role, SESSION_COOKIE_OPTIONS);
	response.cookies.set("cohorts_status", profile.status, SESSION_COOKIE_OPTIONS);
	response.cookies.set("cohorts_agency_id", profile.agencyId, SESSION_COOKIE_OPTIONS);
	const expiresAt = Date.now() + SESSION_COOKIE_MAX_AGE_SEC * 1e3;
	response.cookies.set("cohorts_session_expires", expiresAt.toString(), SESSION_COOKIE_OPTIONS);
	response.cookies.set(CSRF_COOKIE, csrfToken, {
		maxAge: SESSION_COOKIE_MAX_AGE_SEC,
		path: "/",
		httpOnly: false,
		secure: true,
		sameSite: "strict"
	});
	return csrfToken;
}
async function validateCsrfToken(request) {
	const { cookies } = await import("../_libs/next.mjs").then((n) => /* @__PURE__ */ __toESM(n.n()));
	const cookieStore = await cookies();
	const headerToken = request.headers.get(CSRF_HEADER);
	const cookieToken = cookieStore.get(CSRF_COOKIE)?.value;
	return Boolean(headerToken && cookieToken && headerToken === cookieToken);
}
var GET = adaptApiHandler({
	auth: "optional",
	rateLimit: "standard",
	skipIdempotency: true
}, async () => {
	const { cookies } = await import("../_libs/next.mjs").then((n) => /* @__PURE__ */ __toESM(n.n()));
	const cookieStore = await cookies();
	const role = cookieStore.get("cohorts_role")?.value ?? null;
	const status = cookieStore.get("cohorts_status")?.value ?? null;
	const agencyId = cookieStore.get("cohorts_agency_id")?.value ?? null;
	const expiresAt = cookieStore.get("cohorts_session_expires")?.value ?? null;
	const csrfToken = generateCsrfToken();
	const hasSession = Boolean(expiresAt && parseInt(expiresAt, 10) > Date.now());
	const { NextResponse } = await import("../_libs/next.mjs").then((n) => /* @__PURE__ */ __toESM(n.t()));
	const response = NextResponse.json({
		success: true,
		hasSession,
		role,
		status,
		agencyId,
		expiresAt: expiresAt ? parseInt(expiresAt, 10) : null,
		csrfToken
	}, { headers: { "Cache-Control": "no-store, max-age=0" } });
	response.cookies.set(CSRF_COOKIE, csrfToken, {
		maxAge: SESSION_COOKIE_MAX_AGE_SEC,
		path: "/",
		httpOnly: false,
		secure: true,
		sameSite: "strict"
	});
	return response;
});
var POST = adaptApiHandler({
	auth: "optional",
	bodySchema: strictObject({}),
	rateLimit: "standard",
	skipIdempotency: true
}, async (req, { auth }) => {
	if (!await validateCsrfToken(req)) throw new ForbiddenError("Security validation failed. Please refresh and try again.");
	const { NextResponse } = await import("../_libs/next.mjs").then((n) => /* @__PURE__ */ __toESM(n.t()));
	const response = NextResponse.json({ success: true }, { headers: { "Cache-Control": "no-store, max-age=0" } });
	if (!auth.uid) {
		clearSessionCookies(response);
		throw new UnauthorizedError("No active session");
	}
	const role = typeof auth.claims?.role === "string" ? auth.claims.role : null;
	const status = typeof auth.claims?.status === "string" ? auth.claims.status : null;
	const agencyId = typeof auth.claims?.agencyId === "string" && auth.claims.agencyId.length > 0 ? auth.claims.agencyId : auth.uid;
	if (!role || !status) throw new UnauthorizedError("Profile not synced. Complete sign-in bootstrap before syncing the session.");
	appendSessionCookies(response, {
		role,
		status,
		agencyId
	});
	return response;
});
var DELETE = adaptApiHandler({
	auth: "optional",
	rateLimit: "standard",
	skipIdempotency: true
}, async (req) => {
	if (!await validateCsrfToken(req)) throw new ForbiddenError("Security validation failed. Please refresh and try again.");
	const { NextResponse } = await import("../_libs/next.mjs").then((n) => /* @__PURE__ */ __toESM(n.t()));
	const response = NextResponse.json({ success: true }, { headers: { "Cache-Control": "no-store, max-age=0" } });
	clearSessionCookies(response);
	return response;
});
var Route$37 = createFileRoute("/api/auth/session")({ server: { handlers: {
	GET: GET.GET,
	POST: POST.POST,
	DELETE: DELETE.DELETE
} } });
var bodySchema = strictObject({});
function getAppProxySecret() {
	const secret = process.env.COHORTS_API_IDEMPOTENCY_SECRET;
	if (!secret) throw new ServiceUnavailableError("Sign-in setup is incomplete on the server. Ensure COHORTS_API_IDEMPOTENCY_SECRET is set in .env.local and in the Convex dashboard (same value).");
	return secret;
}
var handlers$15 = adaptApiHandler({
	auth: "required",
	bodySchema,
	rateLimit: "standard",
	skipIdempotency: true
}, async (_req, { auth }) => {
	if (!auth.uid) throw new UnauthorizedError("Not authenticated");
	const email = auth.email?.toLowerCase();
	const name = auth.name ?? auth.email ?? "User";
	const legacyId = auth.uid;
	if (!email) throw new NotFoundError("User email is required to bootstrap profile");
	const profileResult = await new ConvexHttpClient("https://grand-sparrow-698.convex.cloud").mutation(api.users.ensureProfileOnSignInFromApp, {
		serverSecret: getAppProxySecret(),
		legacyId,
		email,
		name
	});
	const { NextResponse } = await import("../_libs/next.mjs").then((n) => /* @__PURE__ */ __toESM(n.t()));
	const response = NextResponse.json({
		success: true,
		ok: true,
		legacyId: profileResult.legacyId,
		role: profileResult.role,
		status: profileResult.status,
		agencyId: profileResult.agencyId,
		created: profileResult.created
	}, { headers: { "Cache-Control": "no-store, max-age=0" } });
	appendSessionCookies(response, {
		role: String(profileResult.role),
		status: String(profileResult.status),
		agencyId: String(profileResult.agencyId)
	});
	return response;
});
var Route$36 = createFileRoute("/api/auth/bootstrap")({ server: { handlers: handlers$15 } });
var Route$35 = createFileRoute("/api/auth/$")({ server: { handlers: {
	GET: async ({ request }) => {
		const { proxyAuthToConvex } = await import("./auth-server-DbIghuG9.mjs").then((n) => n.t);
		return proxyAuthToConvex(request);
	},
	POST: async ({ request }) => {
		const { proxyAuthToConvex } = await import("./auth-server-DbIghuG9.mjs").then((n) => n.t);
		return proxyAuthToConvex(request);
	}
} } });
var $$splitComponentImporter$18 = () => import("./socials-QVXR2lC5.mjs");
var Route$34 = createFileRoute("/_authed/dashboard/socials")({
	head: () => ({ meta: [{ title: "Socials | Cohorts" }] }),
	component: lazyRouteComponent($$splitComponentImporter$18, "component")
});
var $$splitComponentImporter$17 = () => import("./projects-DQgnhepy.mjs");
var Route$33 = createFileRoute("/_authed/dashboard/projects")({
	validateSearch: (search) => ({
		projectId: typeof search.projectId === "string" ? search.projectId : void 0,
		projectName: typeof search.projectName === "string" ? search.projectName : void 0
	}),
	head: () => ({ meta: [{ title: "Projects | Cohorts" }] }),
	component: lazyRouteComponent($$splitComponentImporter$17, "component")
});
var $$splitComponentImporter$16 = () => import("./notifications-CzLoK-ay.mjs");
var Route$32 = createFileRoute("/_authed/dashboard/notifications")({
	head: () => ({ meta: [{ title: "Notifications | Cohorts" }] }),
	component: lazyRouteComponent($$splitComponentImporter$16, "component")
});
var $$splitComponentImporter$15 = () => import("./meetings-BYxQKzUA.mjs");
var Route$31 = createFileRoute("/_authed/dashboard/meetings")({
	validateSearch: (search) => ({
		room: typeof search.room === "string" ? search.room : void 0,
		oauth_success: typeof search.oauth_success === "string" ? search.oauth_success : void 0,
		oauth_error: typeof search.oauth_error === "string" ? search.oauth_error : void 0,
		provider: typeof search.provider === "string" ? search.provider : void 0,
		message: typeof search.message === "string" ? search.message : void 0
	}),
	head: () => ({ meta: [{ title: "Meetings | Cohorts" }] }),
	component: lazyRouteComponent($$splitComponentImporter$15, "component")
});
var $$splitComponentImporter$14 = () => import("./collaboration-CeWLXzDv.mjs");
var Route$30 = createFileRoute("/_authed/dashboard/collaboration")({
	validateSearch: (search) => ({
		channelId: typeof search.channelId === "string" ? search.channelId : void 0,
		channelType: typeof search.channelType === "string" ? search.channelType : void 0,
		conversationId: typeof search.conversationId === "string" ? search.conversationId : void 0,
		clientId: typeof search.clientId === "string" ? search.clientId : void 0,
		projectId: typeof search.projectId === "string" ? search.projectId : void 0,
		projectName: typeof search.projectName === "string" ? search.projectName : void 0,
		messageId: typeof search.messageId === "string" ? search.messageId : void 0,
		threadId: typeof search.threadId === "string" ? search.threadId : void 0
	}),
	head: () => ({ meta: [{ title: "Collaboration | Cohorts" }] }),
	component: lazyRouteComponent($$splitComponentImporter$14, "component")
});
var $$splitComponentImporter$13 = () => import("./clients-Dcuou95h.mjs");
var Route$29 = createFileRoute("/_authed/dashboard/clients")({ component: lazyRouteComponent($$splitComponentImporter$13, "component") });
var $$splitComponentImporter$12 = () => import("./analytics-DV2TK0wS.mjs");
var Route$28 = createFileRoute("/_authed/dashboard/analytics")({
	head: () => ({ meta: [{ title: "Analytics | Cohorts" }] }),
	component: lazyRouteComponent($$splitComponentImporter$12, "component")
});
var $$splitComponentImporter$11 = () => import("./users-BLc8rIWN.mjs");
var Route$27 = createFileRoute("/_authed/admin/users")({
	head: () => ({ meta: [{ title: "Admin Users | Cohorts" }] }),
	component: lazyRouteComponent($$splitComponentImporter$11, "component")
});
var $$splitComponentImporter$10 = () => import("./team-CWcd36l1.mjs");
var Route$26 = createFileRoute("/_authed/admin/team")({
	head: () => ({ meta: [{ title: "Admin Team | Cohorts" }] }),
	component: lazyRouteComponent($$splitComponentImporter$10, "component")
});
var $$splitComponentImporter$9 = () => import("./issues-4I7246Hg.mjs");
var Route$25 = createFileRoute("/_authed/admin/issues")({
	head: () => ({ meta: [{ title: "Admin Issues | Cohorts" }] }),
	component: lazyRouteComponent($$splitComponentImporter$9, "component")
});
var $$splitComponentImporter$8 = () => import("./health-CXuSMHw1.mjs");
var Route$24 = createFileRoute("/_authed/admin/health")({
	head: () => ({ meta: [{ title: "Admin Health | Cohorts" }] }),
	component: lazyRouteComponent($$splitComponentImporter$8, "component")
});
var $$splitComponentImporter$7 = () => import("./features-Cwgk83OJ.mjs");
var Route$23 = createFileRoute("/_authed/admin/features")({
	head: () => ({ meta: [{ title: "Admin Features | Cohorts" }] }),
	component: lazyRouteComponent($$splitComponentImporter$7, "component")
});
var $$splitComponentImporter$6 = () => import("./clients-D7dQZaP_.mjs");
var Route$22 = createFileRoute("/_authed/admin/clients")({
	head: () => ({ meta: [{ title: "Admin Clients | Cohorts" }] }),
	component: lazyRouteComponent($$splitComponentImporter$6, "component")
});
var $$splitComponentImporter$5 = () => import("./proposals-DpoYM7i9.mjs");
var Route$21 = createFileRoute("/_authed/dashboard/proposals/")({
	head: () => ({ meta: [{ title: "Proposals | Cohorts" }] }),
	component: lazyRouteComponent($$splitComponentImporter$5, "component")
});
var $$splitComponentImporter$4 = () => import("./ads-D5yr225Y.mjs");
var Route$20 = createFileRoute("/_authed/dashboard/ads/")({
	head: () => ({ meta: [{ title: "Ads | Cohorts" }] }),
	component: lazyRouteComponent($$splitComponentImporter$4, "component")
});
var handlers$14 = adaptApiHandler({
	workspace: "required",
	bodySchema: object({
		legacyId: string().trim().min(1).optional(),
		calendarEventId: string().trim().min(1).optional(),
		roomName: string().trim().min(1).optional()
	}).refine((value) => Boolean(value.legacyId || value.calendarEventId || value.roomName), { message: "Meeting identifier is required" }),
	rateLimit: "sensitive"
}, async (req, { auth, workspace, body }) => {
	if (!auth.uid) throw new UnauthorizedError("Authentication required");
	if (!workspace?.workspaceId) throw new ForbiddenError("Workspace context is required to join a meeting");
	const serverUrl = resolveLiveKitServerUrl();
	if (!serverUrl) throw new ServiceUnavailableError("LiveKit server URL is not configured");
	let resolvedMeeting = null;
	let migration;
	if (body.legacyId) resolvedMeeting = (await getMeetingRecord({
		userId: auth.uid,
		legacyId: body.legacyId,
		workspaceId: workspace.workspaceId,
		userEmail: auth.email
	})).meeting;
	else if (body.calendarEventId) resolvedMeeting = (await getMeetingRecordByCalendarEventId({
		userId: auth.uid,
		calendarEventId: body.calendarEventId,
		workspaceId: workspace.workspaceId,
		userEmail: auth.email
	})).meeting;
	else if (body.roomName) try {
		resolvedMeeting = (await getMeetingRecordByRoomName({
			userId: auth.uid,
			roomName: body.roomName,
			workspaceId: workspace.workspaceId,
			userEmail: auth.email
		})).meeting;
	} catch {
		resolvedMeeting = null;
	}
	if (resolvedMeeting && resolvedMeeting.status === "cancelled") throw new BadRequestError("Cancelled meetings cannot be joined");
	if (resolvedMeeting && !resolvedMeeting.roomName) {
		const roomName = createLiveKitRoomName(resolvedMeeting.title);
		const roomUrl = buildCohortsMeetingUrl({
			appUrl: new URL(req.url).origin,
			roomName
		});
		let calendarSyncWarning = null;
		if (resolvedMeeting.calendarEventId) try {
			const integrationUserId = resolvedMeeting.integrationUserId ?? auth.uid;
			const { tokens } = await getGoogleWorkspaceTokens({ userId: integrationUserId });
			if (tokens?.accessToken) {
				const { clientId: googleClientId, clientSecret: googleClientSecret } = resolveGoogleWorkspaceOAuthCredentials();
				let accessToken = tokens.accessToken;
				if (typeof tokens.accessTokenExpiresAtMs === "number" && tokens.accessTokenExpiresAtMs <= Date.now() + 6e4) {
					if (!tokens.refreshToken) throw new Error("Google Workspace access has expired. Reconnect your account to update invite links.");
					if (!googleClientId || !googleClientSecret) throw new Error("Google Workspace refresh credentials are not configured.");
					const refreshed = await refreshGoogleWorkspaceAccessToken({
						clientId: googleClientId,
						clientSecret: googleClientSecret,
						refreshToken: tokens.refreshToken
					});
					accessToken = refreshed.access_token;
					await upsertGoogleWorkspaceTokens({
						userId: integrationUserId,
						userEmail: tokens.userEmail,
						accessToken: refreshed.access_token,
						refreshToken: refreshed.refresh_token ?? tokens.refreshToken,
						idToken: refreshed.id_token ?? tokens.idToken,
						scopes: typeof refreshed.scope === "string" ? refreshed.scope.split(" ").filter(Boolean) : tokens.scopes,
						accessTokenExpiresAtMs: typeof refreshed.expires_in === "number" ? Date.now() + refreshed.expires_in * 1e3 : tokens.accessTokenExpiresAtMs
					});
				}
				await updateGoogleCalendarEvent({
					accessToken,
					eventId: resolvedMeeting.calendarEventId,
					title: resolvedMeeting.title,
					description: resolvedMeeting.description,
					startTimeMs: resolvedMeeting.startTimeMs,
					endTimeMs: resolvedMeeting.endTimeMs,
					timezone: resolvedMeeting.timezone,
					attendeeEmails: resolvedMeeting.attendeeEmails,
					meetingUrl: roomUrl
				});
			} else calendarSyncWarning = "Google Calendar invite could not be updated because no Google Workspace connection was found.";
		} catch (error) {
			calendarSyncWarning = error instanceof Error ? error.message : "Google Calendar invite could not be updated.";
		}
		resolvedMeeting = (await ensureMeetingNativeRoom({
			userId: auth.uid,
			userEmail: auth.email,
			workspaceId: workspace.workspaceId,
			legacyId: resolvedMeeting.legacyId,
			roomName,
			meetLink: roomUrl
		})).meeting;
		migration = {
			created: true,
			calendarSyncWarning
		};
	}
	const resolvedRoomName = resolvedMeeting?.roomName ?? body.roomName;
	if (!resolvedRoomName) throw new ServiceUnavailableError("Meeting room is not configured");
	const resolvedMeetLink = resolvedMeeting?.meetLink ?? buildCohortsMeetingUrl({
		appUrl: new URL(req.url).origin,
		roomName: resolvedRoomName
	});
	return {
		token: await createLiveKitParticipantToken({
			roomName: resolvedRoomName,
			participantIdentity: `${auth.uid}:${Date.now().toString(36)}`,
			participantName: auth.name ?? auth.email ?? "Cohorts participant",
			metadata: {
				email: auth.email ?? null,
				meetingLegacyId: resolvedMeeting?.legacyId ?? null,
				photoURL: typeof auth.claims?.photoURL === "string" ? auth.claims.photoURL : null,
				role: typeof auth.claims?.role === "string" ? auth.claims.role : null,
				workspaceId: workspace.workspaceId
			}
		}),
		serverUrl,
		roomName: resolvedRoomName,
		meetLink: resolvedMeetLink,
		meeting: resolvedMeeting ?? void 0,
		migration
	};
});
var Route$19 = createFileRoute("/api/meetings/livekit/token")({ server: { handlers: handlers$14 } });
function asRecord(value) {
	if (!value || typeof value !== "object" || Array.isArray(value)) return null;
	return value;
}
function asString(value) {
	if (typeof value !== "string") return null;
	const normalized = value.trim();
	return normalized.length > 0 ? normalized : null;
}
function firstString(...values) {
	for (const value of values) {
		const normalized = asString(value);
		if (normalized) return normalized;
	}
	return null;
}
function parseAttributeMap(value) {
	const record = asRecord(value);
	if (!record) return {};
	const normalized = {};
	for (const [key, rawValue] of Object.entries(record)) {
		const stringValue = asString(rawValue);
		if (stringValue) normalized[key] = stringValue;
	}
	return normalized;
}
function parseDeliveryAttempt(value) {
	if (typeof value === "number" && Number.isFinite(value)) return value;
	const parsedFromString = Number(firstString(value));
	if (Number.isFinite(parsedFromString)) return parsedFromString;
	return null;
}
function decodePubSubData(value) {
	const encoded = asString(value);
	if (!encoded) return null;
	try {
		const decoded = Buffer.from(encoded, "base64").toString("utf8");
		return asRecord(JSON.parse(decoded));
	} catch {
		return null;
	}
}
function parsePubSubContext(body) {
	const message = asRecord(body?.message);
	const attributes = parseAttributeMap(message?.attributes);
	return {
		subscription: firstString(body?.subscription),
		messageId: firstString(message?.messageId, message?.message_id),
		publishTime: firstString(message?.publishTime, message?.publish_time),
		deliveryAttempt: parseDeliveryAttempt(body?.deliveryAttempt),
		attributes,
		decodedData: decodePubSubData(message?.data)
	};
}
function extractTranscriptTextFromEntries(value) {
	if (!Array.isArray(value)) return null;
	const lines = [];
	for (const entry of value) {
		const row = asRecord(entry);
		const text = firstString(row?.text, row?.content, row?.transcriptText, asRecord(row?.segment)?.text, asRecord(row?.entry)?.text);
		if (text) lines.push(text);
	}
	return lines.length > 0 ? lines.join("\n") : null;
}
function normalizeStatus(status) {
	if (status === "scheduled" || status === "in_progress" || status === "completed" || status === "cancelled") return status;
	if (status === "ended" || status === "done") return "completed";
}
function statusFromEventType(eventType) {
	if (!eventType) return void 0;
	if (eventType === "google.workspace.meet.conference.v2.started") return "in_progress";
	if (eventType === "google.workspace.meet.conference.v2.ended") return "completed";
}
function normalizeTranscriptWebhookPayload(body, request) {
	const envelope = asRecord(body);
	const pubsub = parsePubSubContext(envelope);
	const primary = pubsub.decodedData ?? envelope;
	const cloudEvent = asRecord(primary);
	const eventPayload = Boolean(asString(cloudEvent?.specversion)) ? asRecord(cloudEvent?.data) ?? {} : asRecord(primary) ?? {};
	const context = asRecord(eventPayload.context);
	const metadata = asRecord(eventPayload.metadata);
	const meeting = asRecord(eventPayload.meeting);
	const transcript = asRecord(eventPayload.transcript);
	const calendarEvent = asRecord(eventPayload.calendarEvent);
	const conferenceRecord = asRecord(eventPayload.conferenceRecord);
	const headerEventType = asString(request.headers.get("ce-type"));
	const headerEventSource = asString(request.headers.get("ce-source"));
	const headerEventSubject = asString(request.headers.get("ce-subject"));
	const cloudEventSubject = firstString(pubsub.attributes["ce-subject"], headerEventSubject, cloudEvent?.subject, eventPayload.subject);
	const eventType = firstString(pubsub.attributes["ce-type"], headerEventType, cloudEvent?.type, eventPayload.eventType, eventPayload.event_type, eventPayload.type);
	const source = firstString(pubsub.attributes["ce-source"], headerEventSource, cloudEvent?.source, eventPayload.source, eventPayload.provider) ?? "google-workspace";
	const transcriptResourceName = firstString(transcript?.name, eventPayload.transcriptName, eventPayload.transcript_resource_name, eventPayload.resourceName, cloudEventSubject);
	const conferenceRecordName = firstString(conferenceRecord?.name, eventPayload.conferenceRecordName, eventPayload.conference_record_name, asRecord(eventPayload.conferenceRecord)?.name) ?? transcriptResourceName?.match(/conferenceRecords\/[^/]+\/?/)?.[0]?.replace(/\/$/, "") ?? null;
	const transcriptText = firstString(eventPayload.transcriptText, eventPayload.transcript_text, eventPayload.fullTranscript, eventPayload.transcript, transcript?.text, transcript?.content, transcript?.transcriptText, asRecord(eventPayload.resource)?.transcriptText, asRecord(eventPayload.resourceData)?.transcriptText, metadata?.transcriptText) ?? extractTranscriptTextFromEntries(eventPayload.entries) ?? extractTranscriptTextFromEntries(eventPayload.transcriptEntries);
	const status = normalizeStatus(firstString(eventPayload.status, eventPayload.meetingStatus, metadata?.status, pubsub.attributes["status"])) ?? statusFromEventType(eventType);
	return {
		workspaceId: firstString(eventPayload.workspaceId, eventPayload.workspace_id, context?.workspaceId, context?.workspace_id, metadata?.workspaceId, metadata?.workspace_id, meeting?.workspaceId, pubsub.attributes["workspaceId"], pubsub.attributes["workspace_id"], pubsub.attributes["workspaceid"], pubsub.attributes["x-workspace-id"]),
		userId: firstString(eventPayload.userId, eventPayload.user_id, context?.userId, context?.user_id, metadata?.userId, metadata?.user_id, meeting?.userId, pubsub.attributes["userId"], pubsub.attributes["user_id"], pubsub.attributes["userid"], pubsub.attributes["x-user-id"]),
		meetingLegacyId: firstString(eventPayload.meetingLegacyId, eventPayload.meeting_legacy_id, eventPayload.legacyId, meeting?.legacyId, meeting?.meetingLegacyId, metadata?.meetingLegacyId, pubsub.attributes["meetingLegacyId"], pubsub.attributes["meeting_legacy_id"], pubsub.attributes["meetinglegacyid"], pubsub.attributes["x-meeting-legacy-id"]),
		calendarEventId: firstString(eventPayload.calendarEventId, eventPayload.calendar_event_id, calendarEvent?.eventId, calendarEvent?.id, meeting?.calendarEventId, metadata?.calendarEventId, pubsub.attributes["calendarEventId"], pubsub.attributes["calendar_event_id"], pubsub.attributes["calendareventid"], pubsub.attributes["x-calendar-event-id"]),
		transcriptText,
		status,
		source,
		eventType,
		cloudEventSubject,
		transcriptResourceName,
		conferenceRecordName,
		pubsub,
		rawEnvelope: envelope
	};
}
function getMissingFields(payload) {
	const missing = [];
	if (!payload.workspaceId) missing.push("workspaceId");
	if (!payload.userId) missing.push("userId");
	if (!payload.meetingLegacyId && !payload.calendarEventId) missing.push("meetingLegacyId/calendarEventId");
	if (!payload.transcriptText) missing.push("transcriptText");
	return missing;
}
async function generateConciseMeetingNotes(transcriptText) {
	const apiKey = resolveGeminiApiKey();
	if (!apiKey) return null;
	const gemini = new GeminiAIService(apiKey);
	const prompt = [
		"You are an expert meeting note taker.",
		"Read the transcript and return concise markdown notes with these sections:",
		"1. Summary (3-5 bullets)",
		"2. Decisions",
		"3. Action Items (owner + due date if available)",
		"4. Risks/Blockers",
		"Keep output under 220 words, factual, and avoid speculation.",
		"",
		"Transcript:",
		transcriptText
	].join("\n");
	return {
		summary: await gemini.generateContent(prompt),
		model: gemini.getModel()
	};
}
var handlers$13 = adaptApiHandler({
	auth: "none",
	bodySchema: unknown(),
	rateLimit: "sensitive"
}, async (req, { body }) => {
	const configuredSecret = process.env.GOOGLE_WORKSPACE_EVENTS_SECRET || process.env.EXTERNAL_WEBHOOK_SECRET;
	const providedSecret = req.headers.get("x-webhook-secret");
	if (!configuredSecret) throw new UnauthorizedError("Webhook secret is not configured");
	if (configuredSecret && providedSecret !== configuredSecret) throw new UnauthorizedError("Invalid webhook signature");
	const normalized = normalizeTranscriptWebhookPayload(body, req);
	const missingFields = getMissingFields(normalized);
	if (missingFields.length > 0) {
		if (normalized.eventType?.startsWith("google.workspace.") || Boolean(normalized.pubsub.messageId) || Boolean(normalized.pubsub.subscription)) return {
			received: true,
			accepted: false,
			reason: `missing_required_fields:${missingFields.join(",")}`,
			eventType: normalized.eventType,
			source: normalized.source,
			transcriptResourceName: normalized.transcriptResourceName,
			conferenceRecordName: normalized.conferenceRecordName,
			pubsub: {
				subscription: normalized.pubsub.subscription,
				messageId: normalized.pubsub.messageId,
				publishTime: normalized.pubsub.publishTime,
				deliveryAttempt: normalized.pubsub.deliveryAttempt
			}
		};
		throw new BadRequestError(`Missing required webhook fields: ${missingFields.join(", ")}`);
	}
	const updatedMeetingLegacyId = await saveMeetingTranscript({
		userId: normalized.userId,
		workspaceId: normalized.workspaceId,
		meetingLegacyId: normalized.meetingLegacyId ?? void 0,
		calendarEventId: normalized.calendarEventId ?? void 0,
		transcriptText: normalized.transcriptText,
		source: normalized.source,
		status: normalized.status,
		eventType: normalized.eventType ?? "transcript.received",
		rawPayload: {
			envelope: normalized.rawEnvelope,
			decodedData: normalized.pubsub.decodedData,
			attributes: normalized.pubsub.attributes,
			cloudEvent: {
				type: normalized.eventType,
				subject: normalized.cloudEventSubject,
				source: normalized.source
			},
			transcriptResourceName: normalized.transcriptResourceName,
			conferenceRecordName: normalized.conferenceRecordName
		}
	});
	let notesGenerated = false;
	try {
		const rateLimit = await checkConvexRateLimit(buildGeminiRateLimitKey({
			name: "meetingWebhookNotes",
			userId: normalized.userId,
			workspaceId: normalized.workspaceId,
			resourceId: normalized.meetingLegacyId ?? normalized.calendarEventId,
			scope: normalized.eventType
		}), GEMINI_RATE_LIMITS.meetingWebhookNotes);
		if (!rateLimit.allowed) throw new Error(formatGeminiRateLimitMessage(rateLimit.resetMs));
		const notes = await generateConciseMeetingNotes(normalized.transcriptText);
		if (notes) {
			await saveMeetingNotes({
				userId: normalized.userId,
				workspaceId: normalized.workspaceId,
				legacyId: updatedMeetingLegacyId,
				summary: notes.summary,
				model: notes.model
			});
			notesGenerated = true;
		}
	} catch (error) {
		console.error("[google-workspace/events] failed to generate meeting notes", error);
	}
	return {
		received: true,
		accepted: true,
		meetingLegacyId: updatedMeetingLegacyId,
		eventType: normalized.eventType,
		source: normalized.source,
		notesGenerated
	};
});
var Route$18 = createFileRoute("/api/integrations/google-workspace/events")({ server: { handlers: handlers$13 } });
/** Server-side V2 gate for collaboration email copy (pauseAll, quiet hours, category email). */
async function isCollaborationEmailEnabledForRecipient(email) {
	const convex = getSystemConvexClient();
	if (!convex) return false;
	const prefs = (await convex.query(internal.users.getNotificationPreferencesByEmail, { email }))?.notificationPreferences;
	if (!prefs) return true;
	return shouldSendCollaborationEmailCopy(prefs);
}
var handlers$12 = adaptApiHandler({
	auth: "required",
	bodySchema: object({
		messageType: _enum([
			"task",
			"collaboration",
			"custom"
		]).default("custom"),
		text: string().min(1),
		metadata: object({
			taskTitle: string().optional(),
			taskDescription: string().optional(),
			assignedTo: string().optional(),
			dueDate: string().optional(),
			senderName: string().optional(),
			conversationUrl: string().optional()
		}).optional()
	}),
	rateLimit: "sensitive",
	skipIdempotency: true
}, async (_request, { auth, body }) => {
	const validated = body;
	if (validated.messageType === "collaboration") {
		const recipientEmail = auth.email?.trim();
		if (!recipientEmail) throw new ForbiddenError("Collaboration email requires an account email");
		if (!await isCollaborationEmailEnabledForRecipient(recipientEmail)) return {
			success: true,
			data: {
				sent: false,
				skipped: "notification_preferences"
			}
		};
	}
	const emailWebhookUrl = process.env.EMAIL_WEBHOOK_URL;
	if (!emailWebhookUrl) throw new ServiceUnavailableError("Email delivery is not configured");
	let emailSubject;
	let emailBody;
	switch (validated.messageType) {
		case "task":
			emailSubject = `New Task: ${validated.metadata?.taskTitle || "Assigned to You"}`;
			emailBody = `
          <h2>New Task Assigned</h2>
          <p><strong>Title:</strong> ${validated.metadata?.taskTitle || "N/A"}</p>
          <p><strong>Description:</strong> ${validated.metadata?.taskDescription || "N/A"}</p>
          <p><strong>Assigned To:</strong> ${validated.metadata?.assignedTo || "N/A"}</p>
          <p><strong>Due Date:</strong> ${validated.metadata?.dueDate || "N/A"}</p>
        `;
			break;
		case "collaboration":
			emailSubject = `New Collaboration Message from ${validated.metadata?.senderName || "Team Member"}`;
			emailBody = `
          <h2>New Collaboration Message</h2>
          <p><strong>From:</strong> ${validated.metadata?.senderName || "Someone"}</p>
          <p><strong>Message:</strong></p>
          <blockquote style="border-left: 3px solid #ccc; padding-left: 10px; margin-left: 0;">
            ${validated.text}
          </blockquote>
          ${validated.metadata?.conversationUrl ? `<p><a href="${validated.metadata.conversationUrl}">View in Dashboard</a></p>` : ""}
        `;
			break;
		default:
			emailSubject = "Notification from Cohorts";
			emailBody = `<p>${validated.text}</p>`;
	}
	const response = await fetch(emailWebhookUrl, {
		method: "POST",
		cache: "no-store",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify({
			type: "email.notification",
			payload: {
				subject: emailSubject,
				body: emailBody,
				text: validated.text
			}
		})
	});
	if (!response.ok) throw new ServiceUnavailableError(`Email webhook failed: ${await response.text()}`);
	return {
		success: true,
		data: { sent: true }
	};
});
var Route$17 = createFileRoute("/api/integrations/email/send")({ server: { handlers: handlers$12 } });
var Route$16 = createFileRoute("/api/analytics/google-analytics/sync")({ server: { handlers: adaptApiHandler({
	workspace: "required",
	rateLimit: "sensitive"
}, async (_req, { auth, workspace }) => {
	if (!auth.uid) throw new ValidationError("User context is required");
	if (!workspace) throw new ValidationError("Workspace context is required");
	return await syncGoogleAnalyticsMetrics({
		userId: auth.uid,
		clientId: null,
		days: 30,
		requestId: _req.headers.get("x-request-id")
	});
}) } });
var $$splitComponentImporter$3 = () => import("./analytics-DrYgbmCQ.mjs");
var Route$15 = createFileRoute("/_authed/dashboard/proposals/analytics")({
	head: () => ({ meta: [{ title: "Proposals Analytics | Cohorts" }] }),
	component: lazyRouteComponent($$splitComponentImporter$3, "component")
});
var STATE_TTL_MS$2 = 300 * 1e3;
function createTikTokOAuthState(payload) {
	const data = {
		...payload,
		codeVerifier: payload.codeVerifier ?? generateCodeVerifier(),
		createdAt: payload.createdAt ?? Date.now()
	};
	return encodeURIComponent(encrypt(JSON.stringify(data)));
}
function validateTikTokOAuthState(state) {
	if (!state) throw new Error("Missing OAuth state");
	const decoded = decodeURIComponent(state);
	let parsed;
	try {
		parsed = JSON.parse(decrypt(decoded));
	} catch {
		throw new Error("Invalid state payload");
	}
	if (!parsed?.state || !parsed.createdAt) throw new Error("Malformed state payload");
	if (Date.now() - parsed.createdAt > STATE_TTL_MS$2) throw new Error("OAuth state has expired");
	return parsed;
}
async function exchangeTikTokCodeForToken(options) {
	const { clientKey, clientSecret, code, redirectUri } = options;
	if (!clientKey || !clientSecret) throw new Error("TikTok client credentials are not configured");
	const response = await fetch("https://business-api.tiktok.com/open_api/v1.3/oauth2/access_token/", {
		method: "POST",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify({
			app_id: clientKey,
			secret: clientSecret,
			auth_code: code,
			grant_type: "authorization_code",
			redirect_uri: redirectUri
		})
	});
	if (!response.ok) {
		const errorPayload = await response.text();
		throw new Error(`TikTok token exchange failed (${response.status}): ${errorPayload}`);
	}
	const payload = await response.json();
	if (payload.code && payload.code !== 0) throw new Error(payload.message || `TikTok token exchange returned code ${payload.code}`);
	const data = payload.data ?? {};
	if (!data.access_token) throw new Error("TikTok token response missing access_token");
	const scopesArray = Array.isArray(data.scope) ? data.scope : typeof data.scope === "string" ? data.scope.split(",").flatMap((scope) => {
		const normalizedScope = scope.trim();
		return normalizedScope ? [normalizedScope] : [];
	}) : [];
	return {
		accessToken: data.access_token,
		refreshToken: data.refresh_token ?? null,
		expiresIn: data.expires_in ?? null,
		refreshTokenExpiresIn: data.refresh_token_expires_in ?? null,
		scopes: scopesArray,
		advertiserIds: Array.isArray(data.advertiser_ids) ? data.advertiser_ids : void 0
	};
}
function computeExpiryDate(seconds) {
	if (!seconds || !Number.isFinite(seconds)) return null;
	const durationMs = Math.max(0, seconds * 1e3 - 30 * 1e3);
	return new Date(Date.now() + durationMs);
}
async function completeTikTokOAuthFlow(options) {
	const { code, userId, redirectUri, clientId } = options;
	const clientKey = process.env.TIKTOK_CLIENT_KEY;
	const clientSecret = process.env.TIKTOK_CLIENT_SECRET;
	if (!clientKey || !clientSecret) throw new Error("TikTok OAuth credentials are not configured");
	const tokenResult = await exchangeTikTokCodeForToken({
		clientKey,
		clientSecret,
		code,
		redirectUri
	});
	const accessTokenExpiresAt = computeExpiryDate(tokenResult.expiresIn);
	const refreshTokenExpiresAt = computeExpiryDate(tokenResult.refreshTokenExpiresIn);
	let selectedAccount = null;
	const advertiserIds = tokenResult.advertiserIds ?? [];
	if (tokenResult.accessToken && advertiserIds.length > 0) try {
		const accounts = await fetchTikTokAdAccounts({
			accessToken: tokenResult.accessToken,
			advertiserIds
		});
		selectedAccount = accounts.find((account) => account.status?.toUpperCase() === "ENABLE") ?? accounts[0] ?? null;
	} catch (error) {
		console.error("[tiktok.oauth] failed to load advertiser accounts", error);
		selectedAccount = null;
	}
	await persistIntegrationTokens({
		userId,
		providerId: "tiktok",
		clientId: clientId ?? null,
		accessToken: tokenResult.accessToken,
		refreshToken: tokenResult.refreshToken ?? null,
		scopes: tokenResult.scopes ?? [],
		accountId: selectedAccount?.id ?? null,
		accountName: selectedAccount?.name ?? null,
		accessTokenExpiresAt,
		refreshTokenExpiresAt
	});
	await enqueueSyncJob({
		userId,
		providerId: "tiktok",
		jobType: "initial-backfill",
		clientId: clientId ?? null
	});
	return { account: selectedAccount };
}
function buildTikTokOAuthUrl(options) {
	const { clientKey, redirectUri, state, scopes } = options;
	if (!clientKey) throw new Error("TikTok client key is required");
	if (!redirectUri) throw new Error("TikTok redirect URI is required");
	const scopeList = scopes && scopes.length > 0 ? scopes : getDefaultTikTokScopes();
	return `https://ads.tiktok.com/marketing_api/auth?${new URLSearchParams({
		app_id: clientKey,
		redirect_uri: redirectUri,
		state,
		response_type: "code",
		scope: scopeList.join(",")
	}).toString()}`;
}
function getDefaultTikTokScopes() {
	const envScopes = process.env.TIKTOK_OAUTH_SCOPES;
	if (typeof envScopes === "string" && envScopes.trim().length > 0) return envScopes.split(",").flatMap((scope) => {
		const normalizedScope = scope.trim();
		return normalizedScope ? [normalizedScope] : [];
	});
	return [
		"ad.manage",
		"ad.read",
		"report.advertiser"
	];
}
var handlers$11 = adaptApiHandler({
	auth: "required",
	querySchema: object({
		redirect: string().optional(),
		clientId: string().optional()
	}),
	rateLimit: "standard"
}, async (_req, { auth, query }) => {
	if (!auth.uid) throw new UnauthorizedError("Authentication required");
	const clientKey = process.env.TIKTOK_CLIENT_KEY;
	const redirectUri = process.env.TIKTOK_OAUTH_REDIRECT_URI;
	const appUrl = "http://localhost:3000";
	if (!clientKey || !redirectUri) throw new ServiceUnavailableError("TikTok OAuth is not configured");
	const redirect = query.redirect ?? `${appUrl}/dashboard/ads`;
	if (!isValidRedirectUrl(redirect)) throw new BadRequestError("Invalid redirect URL");
	const state = createTikTokOAuthState({
		state: auth.uid,
		redirect,
		clientId: query.clientId ?? null
	});
	const scopes = process.env.TIKTOK_OAUTH_SCOPES?.split(",").flatMap((scope) => {
		const normalizedScope = scope.trim();
		return normalizedScope ? [normalizedScope] : [];
	});
	return { url: buildTikTokOAuthUrl({
		clientKey,
		redirectUri,
		state,
		scopes
	}) };
});
var Route$14 = createFileRoute("/api/integrations/tiktok/oauth/url")({ server: { handlers: handlers$11 } });
var handlers$10 = adaptApiHandler({
	auth: "none",
	querySchema: object({
		code: string().optional(),
		state: string().optional()
	}),
	rateLimit: "sensitive"
}, async (req, { query }) => {
	const { code, state } = query;
	const appUrl = "http://localhost:3000";
	try {
		if (!code) throw new ValidationError("Missing authorization code");
		const redirectUri = process.env.TIKTOK_OAUTH_REDIRECT_URI;
		if (!redirectUri) throw new ServiceUnavailableError("TikTok OAuth not configured");
		const context = validateTikTokOAuthState(state ?? "");
		if (!context.state) throw new ValidationError("Invalid OAuth state");
		await completeTikTokOAuthFlow({
			code,
			userId: context.state,
			redirectUri,
			clientId: context.clientId ?? null
		});
		let redirectTarget = context.redirect ?? "/dashboard";
		const url = new URL(redirectTarget, appUrl);
		url.searchParams.set("oauth_success", "true");
		url.searchParams.set("provider", "tiktok");
		if (context.clientId) url.searchParams.set("clientId", context.clientId);
		redirectTarget = url.toString();
		if (!isValidRedirectUrl(redirectTarget)) {
			const { NextResponse } = await import("../_libs/next.mjs").then((n) => /* @__PURE__ */ __toESM(n.t()));
			return NextResponse.redirect(new URL("/dashboard?oauth_success=true&provider=tiktok", req.url));
		}
		const { NextResponse } = await import("../_libs/next.mjs").then((n) => /* @__PURE__ */ __toESM(n.t()));
		return NextResponse.redirect(new URL(redirectTarget, req.url));
	} catch (error) {
		const errorMessage = error instanceof Error ? error.message : "Unknown error";
		console.error("[tiktok.oauth.callback] Error completing OAuth flow:", errorMessage);
		const { NextResponse } = await import("../_libs/next.mjs").then((n) => /* @__PURE__ */ __toESM(n.t()));
		const errorUrl = new URL("/dashboard/ads", appUrl);
		errorUrl.searchParams.set("oauth_error", "oauth_failed");
		errorUrl.searchParams.set("provider", "tiktok");
		errorUrl.searchParams.set("message", errorMessage);
		return NextResponse.redirect(errorUrl.toString());
	}
});
var Route$13 = createFileRoute("/api/integrations/tiktok/oauth/callback")({ server: { handlers: handlers$10 } });
var DEFAULT_SCOPES = [
	"ads_management",
	"ads_read",
	"business_management"
];
/** Organic social (Pages + IG insights) — separate from Ads scopes. */
var SOCIAL_META_SCOPES = [
	"pages_show_list",
	"pages_read_engagement",
	"read_insights",
	"instagram_basic",
	"instagram_manage_insights"
];
function buildMetaBusinessLoginUrl(options) {
	const { businessConfigId, appId, redirectUri, state, scopes = DEFAULT_SCOPES } = options;
	if (!businessConfigId) throw new Error("Meta business configuration ID is required");
	if (!appId) throw new Error("Meta app ID is required");
	if (!redirectUri) throw new Error("Meta redirect URI is required");
	const params = new URLSearchParams$1({
		config_id: businessConfigId,
		client_id: appId,
		redirect_uri: redirectUri,
		response_type: "code",
		scope: scopes.join(",")
	});
	if (state) params.set("state", state);
	const finalUrl = `${META_OAUTH_DIALOG_BASE}/dialog/oauth?${params.toString()}`;
	logger.debug("[Meta OAuth] Generated login URL", {
		config_id: businessConfigId,
		client_id: appId,
		redirect_uri: redirectUri,
		response_type: "code",
		scopes: scopes.join(","),
		state_present: !!state,
		api_version: META_API_VERSION
	});
	return finalUrl;
}
var MetaTokenExchangeError = class extends Error {
	constructor(options) {
		super(options.message);
		this.name = "MetaTokenExchangeError";
		this.code = options.code;
		this.subcode = options.subcode;
		this.type = options.type;
		this.fbTraceId = options.fbTraceId;
	}
};
async function exchangeMetaCodeForToken(options) {
	const { appId, appSecret, redirectUri, code } = options;
	logger.info("[Meta OAuth] Starting code exchange", { apiVersion: META_API_VERSION });
	if (!appId || !appSecret) {
		logger.error("[Meta OAuth] Missing app credentials");
		throw new MetaTokenExchangeError({ message: "Meta app credentials are required to exchange the code" });
	}
	if (!code) {
		logger.error("[Meta OAuth] Missing authorization code");
		throw new MetaTokenExchangeError({ message: "Authorization code is required" });
	}
	const url = `${META_OAUTH_TOKEN_ENDPOINT}?${new URLSearchParams$1({
		client_id: appId,
		client_secret: appSecret,
		redirect_uri: redirectUri,
		code
	}).toString()}`;
	logger.debug("[Meta OAuth] Token exchange request", {
		apiVersion: META_API_VERSION,
		redirectUri
	});
	let response;
	try {
		response = await fetch(url);
	} catch (networkError) {
		const message = networkError instanceof Error ? networkError.message : "Network error";
		logger.error("[Meta OAuth] Network error during token exchange", { error: message });
		throw new MetaTokenExchangeError({ message: `Network error during Meta token exchange: ${message}` });
	}
	const responseText = await response.text();
	let responseData;
	try {
		responseData = JSON.parse(responseText);
	} catch {
		throw new MetaTokenExchangeError({ message: `Invalid response from Meta: ${responseText.substring(0, 200)}` });
	}
	if (!response.ok) {
		const error = responseData?.error ?? {};
		throw new MetaTokenExchangeError({
			message: error.message ?? `Meta token exchange failed (${response.status})`,
			code: error.code ?? response.status,
			subcode: error.error_subcode,
			type: error.type,
			fbTraceId: error.fbtrace_id
		});
	}
	const tokenData = responseData;
	if (!tokenData.access_token) {
		logger.error("[Meta OAuth] Token response missing access_token");
		throw new MetaTokenExchangeError({ message: "Meta token response missing access_token" });
	}
	logger.info("[Meta OAuth] Token exchange successful", {
		hasToken: true,
		expiresIn: tokenData.expires_in,
		tokenType: tokenData.token_type
	});
	return tokenData;
}
function toMillis(value) {
	if (value === null || value === void 0) return null;
	if (value instanceof Date) {
		const ms = value.getTime();
		return Number.isNaN(ms) ? null : ms;
	}
	if (typeof value === "number") return Number.isFinite(value) ? value : null;
	if (typeof value === "string") {
		const parsed = Date.parse(value);
		return Number.isNaN(parsed) ? null : parsed;
	}
	return null;
}
function normalizeClientId(value) {
	if (typeof value !== "string") return null;
	const trimmed = value.trim();
	return trimmed.length > 0 ? trimmed : null;
}
function getConvexClientForUser(userId) {
	return createConvexAdminClient({ auth: {
		uid: userId,
		email: null,
		name: null,
		claims: { provider: "convex" },
		isCron: false
	} });
}
async function executeMutation(convex, name, args) {
	try {
		return await convex.mutation(name, args);
	} catch (error) {
		logger.error(`Convex Mutation Error: ${name}`, error, {
			type: "convex_error",
			method: "mutation",
			name
		});
		throw error;
	}
}
async function persistSocialIntegrationTokens(options) {
	const workspaceId = await resolveWorkspaceIdForUser(options.userId);
	const convex = getConvexClientForUser(options.userId);
	if (!convex) throw new Error("Convex admin client is not configured");
	await executeMutation(convex, "socialIntegrations:persistIntegrationTokens", {
		workspaceId,
		clientId: normalizeClientId(options.clientId),
		accessToken: options.accessToken,
		refreshToken: options.refreshToken,
		scopes: options.scopes ?? SOCIAL_META_SCOPES,
		status: options.status,
		metaUserId: options.metaUserId,
		metaUserName: options.metaUserName,
		accessTokenExpiresAtMs: options.accessTokenExpiresAt === void 0 ? void 0 : toMillis(options.accessTokenExpiresAt),
		refreshTokenExpiresAtMs: options.refreshTokenExpiresAt === void 0 ? void 0 : toMillis(options.refreshTokenExpiresAt)
	});
}
var STATE_TTL_MS$1 = 300 * 1e3;
var OAUTH_RETRY_CONFIG = {
	maxRetries: 3,
	baseDelayMs: 500,
	maxDelayMs: 5e3,
	jitterFactor: .2
};
function calculateBackoffDelay(attempt) {
	return calculateBackoffDelay$5(attempt, OAUTH_RETRY_CONFIG);
}
/**
* Create an encrypted OAuth state for Meta Business Login.
* Note: Meta Business Login does NOT support PKCE, so we don't generate a code verifier.
*/
function createMetaOAuthState(payload) {
	const data = {
		...payload,
		createdAt: payload.createdAt ?? Date.now()
	};
	return encodeURIComponent(encrypt(JSON.stringify(data)));
}
function validateMetaOAuthState(state) {
	if (!state) throw new Error("Missing OAuth state");
	const decoded = decodeURIComponent(state);
	let parsed;
	try {
		parsed = JSON.parse(decrypt(decoded));
	} catch {
		throw new Error("Invalid state payload");
	}
	if (!parsed?.state || !parsed.createdAt) throw new Error("Malformed state payload");
	if (Date.now() - parsed.createdAt > STATE_TTL_MS$1) throw new Error("OAuth state has expired");
	return parsed;
}
var MetaOAuthError = class extends Error {
	constructor(message, code, isRetryable = false) {
		super(message);
		this.name = "MetaOAuthError";
		this.code = code;
		this.isRetryable = isRetryable;
	}
};
async function completeMetaOAuthFlow(options) {
	const { code, userId, clientId, redirectUri, entryPoint = "ads" } = options;
	const appId = process.env.META_APP_ID;
	const appSecret = process.env.META_APP_SECRET;
	logger.info("[Meta OAuth Flow] Starting OAuth completion", {
		userId,
		clientId,
		apiVersion: META_API_VERSION
	});
	if (!appId || !appSecret) {
		logger.error("[Meta OAuth Flow] App credentials not configured");
		throw new MetaOAuthError("Meta app credentials are not configured");
	}
	let tokenResponse;
	try {
		logger.debug("[Meta OAuth Flow] Exchanging code for short-lived token", { userId });
		tokenResponse = await exchangeMetaCodeForToken({
			appId,
			appSecret,
			redirectUri,
			code
		});
	} catch (error) {
		const message = error instanceof Error ? error.message : "Token exchange failed";
		logger.error("[Meta OAuth Flow] Code exchange failed", {
			userId,
			error: message
		});
		throw new MetaOAuthError(`Failed to exchange authorization code: ${message}`);
	}
	if (!tokenResponse.access_token) {
		logger.error("[Meta OAuth Flow] No access token received", { userId });
		throw new MetaOAuthError("No access token received from Meta");
	}
	logger.info("[Meta OAuth Flow] Short-lived token obtained", {
		userId,
		expiresIn: tokenResponse.expires_in
	});
	let longLivedToken = null;
	let expiresIn = tokenResponse.expires_in;
	const attemptExchange = async (attempt) => {
		try {
			logger.debug("[Meta OAuth Flow] Attempting long-lived token exchange", {
				userId,
				attempt: attempt + 1
			});
			const longLivedResponse = await fetch(`${META_OAUTH_TOKEN_ENDPOINT}?grant_type=fb_exchange_token&client_id=${encodeURIComponent(appId)}&client_secret=${encodeURIComponent(appSecret)}&fb_exchange_token=${encodeURIComponent(tokenResponse.access_token)}`);
			if (!longLivedResponse.ok) {
				const errorPayload = await longLivedResponse.text();
				let parsedError = {};
				try {
					parsedError = JSON.parse(errorPayload);
				} catch {}
				const errorMessage = parsedError?.error?.message ?? errorPayload;
				const isRetryable = longLivedResponse.status >= 500 || longLivedResponse.status === 429;
				logger.warn("[Meta OAuth Flow] Long-lived token exchange failed", {
					userId,
					attempt: attempt + 1,
					status: longLivedResponse.status,
					isRetryable,
					errorMessage: errorMessage.substring(0, 200)
				});
				if (isRetryable && attempt < OAUTH_RETRY_CONFIG.maxRetries - 1) {
					const delayMs = calculateBackoffDelay(attempt);
					logger.info("[Meta OAuth Flow] Retrying long-lived token exchange", {
						userId,
						delayMs
					});
					await sleep(delayMs);
					return attemptExchange(attempt + 1);
				}
				throw new MetaOAuthError(`Failed to exchange long-lived Meta token: ${errorMessage.substring(0, 200)}`, parsedError?.error?.code ?? longLivedResponse.status, isRetryable);
			}
			const extended = await longLivedResponse.json();
			if (!extended.access_token) throw new MetaOAuthError("Meta did not return a long-lived access token");
			longLivedToken = extended.access_token;
			expiresIn = extended.expires_in;
			logger.info("[Meta OAuth Flow] Long-lived token obtained successfully", {
				userId,
				expiresIn
			});
			return {
				accessToken: extended.access_token,
				expiresIn: extended.expires_in
			};
		} catch (exchangeError) {
			const message = exchangeError instanceof Error ? exchangeError.message : "Long-lived token exchange failed";
			const isRetryable = exchangeError instanceof MetaOAuthError ? exchangeError.isRetryable : true;
			logger.warn("[Meta OAuth Flow] Long-lived token exchange error", {
				userId,
				attempt: attempt + 1,
				error: message,
				isRetryable
			});
			if (isRetryable && attempt < OAUTH_RETRY_CONFIG.maxRetries - 1) {
				await sleep(calculateBackoffDelay(attempt));
				return attemptExchange(attempt + 1);
			}
			throw exchangeError instanceof MetaOAuthError ? exchangeError : new MetaOAuthError(message);
		}
	};
	const ensureLongLivedToken = async () => {
		const exchange = await attemptExchange(0);
		longLivedToken = exchange.accessToken;
		expiresIn = exchange.expiresIn;
		return exchange.expiresIn ? new Date(Date.now() + exchange.expiresIn * 1e3) : null;
	};
	if (entryPoint === "socials") {
		const expiresAt = await ensureLongLivedToken();
		await persistSocialIntegrationTokens({
			userId,
			clientId: clientId ?? null,
			accessToken: longLivedToken,
			scopes: SOCIAL_META_SCOPES,
			status: "pending",
			accessTokenExpiresAt: expiresAt
		});
		logger.info("[Meta OAuth Flow] Social integration persisted; awaiting Page selection", {
			userId,
			clientId
		});
		return;
	}
	const adsExpiresAt = await ensureLongLivedToken();
	await persistIntegrationTokens({
		userId,
		providerId: "facebook",
		clientId: clientId ?? null,
		accessToken: longLivedToken,
		scopes: [
			"ads_management",
			"ads_read",
			"business_management"
		],
		accountId: null,
		accountName: null,
		status: "never",
		accessTokenExpiresAt: adsExpiresAt
	});
	logger.info("[Meta OAuth Flow] Ads integration persisted successfully; awaiting account selection", {
		userId,
		clientId
	});
}
var handlers$9 = adaptApiHandler({
	auth: "required",
	querySchema: object({
		redirect: string().optional(),
		clientId: string().optional(),
		surface: _enum(["facebook", "instagram"]).optional(),
		entryPoint: _enum(["socials", "ads"]).optional()
	}),
	rateLimit: "standard"
}, async (_req, { auth, query }) => {
	if (!auth.uid) throw new UnauthorizedError("Authentication required");
	const appId = process.env.META_APP_ID;
	const businessConfigId = process.env.META_BUSINESS_CONFIG_ID;
	const redirectUri = process.env.META_OAUTH_REDIRECT_URI;
	const appUrl = "http://localhost:3000";
	if (!appId || !businessConfigId || !redirectUri) throw new ServiceUnavailableError("Meta business login is not configured");
	const defaultRedirectPath = query.entryPoint === "socials" ? "/dashboard/socials" : "/dashboard/ads";
	const redirect = query.redirect ?? `${appUrl}${defaultRedirectPath}`;
	if (!isValidRedirectUrl(redirect)) throw new BadRequestError("Invalid redirect URL");
	const clientId = typeof query.clientId === "string" && query.clientId.trim().length > 0 ? query.clientId.trim() : null;
	return { url: buildMetaBusinessLoginUrl({
		businessConfigId,
		appId,
		redirectUri,
		state: createMetaOAuthState({
			state: auth.uid,
			redirect,
			clientId,
			surface: query.surface,
			entryPoint: query.entryPoint
		}),
		scopes: query.entryPoint === "socials" ? SOCIAL_META_SCOPES : void 0
	}) };
});
var Route$12 = createFileRoute("/api/integrations/meta/oauth/url")({ server: { handlers: handlers$9 } });
var handlers$8 = adaptApiHandler({
	auth: "none",
	querySchema: object({
		code: string().optional(),
		state: string().optional(),
		error: string().optional(),
		error_reason: string().optional(),
		error_description: string().optional()
	}),
	rateLimit: "sensitive"
}, async (req, { query }) => {
	const appUrl = "http://localhost:3000";
	try {
		const { error, error_reason: errorReason, error_description: errorDescription, code, state } = query;
		if (error) {
			console.error("[meta.oauth.callback] OAuth error from Meta:", {
				error,
				errorReason,
				errorDescription
			});
			let errorEntryPoint = "ads";
			try {
				if (validateMetaOAuthState(state ?? "").entryPoint === "socials") errorEntryPoint = "socials";
			} catch {}
			const errorPath = errorEntryPoint === "socials" ? "/dashboard/socials" : "/dashboard/ads";
			const { NextResponse } = await import("../_libs/next.mjs").then((n) => /* @__PURE__ */ __toESM(n.t()));
			const errorUrl = new URL(errorPath, appUrl);
			errorUrl.searchParams.set("oauth_error", "meta_error");
			errorUrl.searchParams.set("provider", "facebook");
			errorUrl.searchParams.set("message", errorDescription || error);
			return NextResponse.redirect(errorUrl.toString());
		}
		if (!code) {
			const { NextResponse } = await import("../_libs/next.mjs").then((n) => /* @__PURE__ */ __toESM(n.t()));
			return NextResponse.redirect(`${appUrl}/dashboard/ads?oauth_error=missing_code&provider=facebook`);
		}
		const redirectUri = process.env.META_OAUTH_REDIRECT_URI;
		if (!redirectUri) {
			const { NextResponse } = await import("../_libs/next.mjs").then((n) => /* @__PURE__ */ __toESM(n.t()));
			return NextResponse.redirect(`${appUrl}/dashboard/ads?oauth_error=config_error&provider=facebook`);
		}
		let context;
		try {
			context = validateMetaOAuthState(state ?? "");
		} catch (stateError) {
			console.error("[meta.oauth.callback] State validation failed:", stateError);
			const { NextResponse } = await import("../_libs/next.mjs").then((n) => /* @__PURE__ */ __toESM(n.t()));
			return NextResponse.redirect(`${appUrl}/dashboard/ads?error=invalid_state`);
		}
		if (!context.state) {
			const { NextResponse } = await import("../_libs/next.mjs").then((n) => /* @__PURE__ */ __toESM(n.t()));
			return NextResponse.redirect(`${appUrl}/dashboard/ads?error=invalid_state`);
		}
		await completeMetaOAuthFlow({
			code,
			userId: context.state,
			clientId: context.clientId ?? null,
			redirectUri,
			entryPoint: context.entryPoint
		});
		const defaultSuccessPath = context.entryPoint === "socials" ? "/dashboard/socials" : "/dashboard/ads";
		let redirectTarget = context.redirect ?? `${appUrl}${defaultSuccessPath}`;
		const url = new URL(redirectTarget, appUrl);
		url.searchParams.set("oauth_success", "true");
		url.searchParams.set("provider", "facebook");
		if (context.clientId) url.searchParams.set("clientId", context.clientId);
		if (context.surface) url.searchParams.set("surface", context.surface);
		redirectTarget = url.toString();
		if (!isValidRedirectUrl(redirectTarget)) {
			const fallbackPath = context.entryPoint === "socials" ? "/dashboard/socials" : "/dashboard/ads";
			const { NextResponse } = await import("../_libs/next.mjs").then((n) => /* @__PURE__ */ __toESM(n.t()));
			return NextResponse.redirect(new URL(`${fallbackPath}?oauth_success=true&provider=facebook`, req.url));
		}
		const { NextResponse } = await import("../_libs/next.mjs").then((n) => /* @__PURE__ */ __toESM(n.t()));
		return NextResponse.redirect(new URL(redirectTarget, req.url));
	} catch (error) {
		const rawMessage = error instanceof Error ? error.message : "Unknown error";
		const messageLower = rawMessage.toLowerCase();
		const userFacingMessage = (() => {
			if (messageLower.includes("convex admin client is not configured")) return "Ads integration is not configured on this environment.";
			if (messageLower.includes("authentication required") || messageLower.includes("unauthorized")) return "Your session expired. Please sign in again and retry connecting Meta.";
			if (messageLower.includes("invalid state")) return "Login session expired. Please try connecting again.";
			return rawMessage;
		})();
		console.error("[meta.oauth.callback] Error completing OAuth flow:", {
			error: rawMessage,
			stack: error instanceof Error ? error.stack : void 0
		});
		let errorPath = "/dashboard/ads";
		try {
			if (validateMetaOAuthState(query.state ?? "").entryPoint === "socials") errorPath = "/dashboard/socials";
		} catch {}
		const { NextResponse } = await import("../_libs/next.mjs").then((n) => /* @__PURE__ */ __toESM(n.t()));
		const errorUrl = new URL(errorPath, appUrl);
		errorUrl.searchParams.set("oauth_error", "oauth_failed");
		errorUrl.searchParams.set("provider", "facebook");
		errorUrl.searchParams.set("message", userFacingMessage);
		return NextResponse.redirect(errorUrl.toString());
	}
});
var Route$11 = createFileRoute("/api/integrations/meta/oauth/callback")({ server: { handlers: handlers$8 } });
var LINKEDIN_AUTH_ENDPOINT = process.env.LINKEDIN_AUTH_ENDPOINT ?? "https://www.linkedin.com/oauth/v2/authorization";
var LINKEDIN_TOKEN_ENDPOINT = process.env.LINKEDIN_TOKEN_ENDPOINT ?? "https://www.linkedin.com/oauth/v2/accessToken";
var LINKEDIN_ADS_SCOPES = [
	"r_ads",
	"r_ads_reporting",
	"r_organization_admin"
];
var STATE_TTL_MS = 300 * 1e3;
var LinkedInTokenExchangeError = class extends Error {
	constructor(options) {
		super(options.message);
		this.name = "LinkedInTokenExchangeError";
		this.code = options.code;
		this.description = options.description;
	}
};
var LinkedInOAuthError = class extends Error {
	constructor(message, code, isRetryable = false) {
		super(message);
		this.name = "LinkedInOAuthError";
		this.code = code;
		this.isRetryable = isRetryable;
	}
};
function createLinkedInOAuthState(payload) {
	const data = {
		...payload,
		codeVerifier: payload.codeVerifier ?? generateCodeVerifier(),
		createdAt: payload.createdAt ?? Date.now()
	};
	return encodeURIComponent(encrypt(JSON.stringify(data)));
}
function validateLinkedInOAuthState(state) {
	if (!state) throw new Error("Missing OAuth state");
	const decoded = decodeURIComponent(state);
	let parsed;
	try {
		parsed = JSON.parse(decrypt(decoded));
	} catch {
		throw new Error("Invalid state payload");
	}
	if (!parsed?.state || !parsed.createdAt) throw new Error("Malformed state payload");
	if (Date.now() - parsed.createdAt > STATE_TTL_MS) throw new Error("OAuth state has expired");
	return parsed;
}
function buildLinkedInOAuthUrl(options) {
	const { clientId, redirectUri, state, scopes = LINKEDIN_ADS_SCOPES } = options;
	if (!clientId) throw new Error("LinkedIn client ID is required");
	if (!redirectUri) throw new Error("LinkedIn redirect URI is required");
	const params = new URLSearchParams({
		response_type: "code",
		client_id: clientId,
		redirect_uri: redirectUri,
		scope: scopes.join(" ")
	});
	if (state) params.set("state", state);
	return `${LINKEDIN_AUTH_ENDPOINT}?${params.toString()}`;
}
async function exchangeLinkedInCodeForTokens(options) {
	const { clientId, clientSecret, redirectUri, code } = options;
	if (!clientId || !clientSecret) throw new LinkedInTokenExchangeError({ message: "LinkedIn OAuth credentials are required" });
	if (!code) throw new LinkedInTokenExchangeError({ message: "Authorization code is required" });
	const body = new URLSearchParams({
		grant_type: "authorization_code",
		code,
		client_id: clientId,
		client_secret: clientSecret,
		redirect_uri: redirectUri
	});
	let response;
	try {
		response = await fetch(LINKEDIN_TOKEN_ENDPOINT, {
			method: "POST",
			headers: { "Content-Type": "application/x-www-form-urlencoded" },
			body: body.toString()
		});
	} catch (networkError) {
		throw new LinkedInTokenExchangeError({ message: `Network error during LinkedIn token exchange: ${networkError instanceof Error ? networkError.message : "Network error"}` });
	}
	const responseText = await response.text();
	let responseData;
	try {
		responseData = JSON.parse(responseText);
	} catch {
		throw new LinkedInTokenExchangeError({ message: `Invalid response from LinkedIn: ${responseText.substring(0, 200)}` });
	}
	if (!response.ok) {
		const errorData = responseData;
		throw new LinkedInTokenExchangeError({
			message: errorData?.error_description ?? `LinkedIn token exchange failed (${response.status})`,
			code: errorData?.error,
			description: errorData?.error_description
		});
	}
	const tokenData = responseData;
	if (!tokenData.access_token) throw new LinkedInTokenExchangeError({ message: "LinkedIn token response missing access_token" });
	return tokenData;
}
async function completeLinkedInOAuthFlow(options) {
	const { code, userId, clientId: integrationClientId, redirectUri } = options;
	const linkedInClientId = process.env.LINKEDIN_CLIENT_ID;
	const linkedInClientSecret = process.env.LINKEDIN_CLIENT_SECRET;
	if (!linkedInClientId || !linkedInClientSecret) throw new LinkedInOAuthError("LinkedIn OAuth credentials are not configured");
	let tokenResponse;
	try {
		tokenResponse = await exchangeLinkedInCodeForTokens({
			clientId: linkedInClientId,
			clientSecret: linkedInClientSecret,
			redirectUri,
			code
		});
	} catch (error) {
		const message = error instanceof Error ? error.message : "Token exchange failed";
		console.error("[LinkedIn OAuth] Code exchange failed:", message);
		throw new LinkedInOAuthError(`Failed to exchange authorization code: ${message}`);
	}
	if (!tokenResponse.access_token) throw new LinkedInOAuthError("No access token received from LinkedIn");
	const expiresAt = tokenResponse.expires_in ? new Date(Date.now() + tokenResponse.expires_in * 1e3) : null;
	const refreshTokenExpiresAt = tokenResponse.refresh_token_expires_in ? new Date(Date.now() + tokenResponse.refresh_token_expires_in * 1e3) : null;
	let accountId = null;
	let accountName = null;
	try {
		const accounts = await fetchLinkedInAdAccounts({ accessToken: tokenResponse.access_token });
		const preferredAccount = accounts.find((account) => account.status?.toUpperCase() === "ACTIVE") ?? accounts[0];
		accountId = preferredAccount?.id ?? null;
		accountName = preferredAccount?.name ?? null;
	} catch (error) {
		console.warn("[LinkedIn OAuth] Failed to resolve account name during OAuth completion:", error);
	}
	await persistIntegrationTokens({
		userId,
		providerId: "linkedin",
		clientId: integrationClientId ?? null,
		accessToken: tokenResponse.access_token,
		refreshToken: tokenResponse.refresh_token ?? null,
		scopes: LINKEDIN_ADS_SCOPES,
		accountId,
		accountName,
		accessTokenExpiresAt: expiresAt,
		refreshTokenExpiresAt
	});
	console.log(`[LinkedIn OAuth] Successfully persisted integration for user ${userId}`);
	await enqueueSyncJob({
		userId,
		providerId: "linkedin",
		jobType: "initial-backfill",
		clientId: integrationClientId ?? null
	});
}
var handlers$7 = adaptApiHandler({
	auth: "required",
	querySchema: object({
		redirect: string().optional(),
		clientId: string().optional()
	}),
	rateLimit: "standard"
}, async (_req, { auth, query }) => {
	if (!auth.uid) throw new UnauthorizedError("Authentication required");
	const linkedInClientId = process.env.LINKEDIN_CLIENT_ID;
	const redirectUri = process.env.LINKEDIN_OAUTH_REDIRECT_URI;
	const appUrl = "http://localhost:3000";
	if (!linkedInClientId || !redirectUri) throw new ServiceUnavailableError("LinkedIn Ads OAuth is not configured");
	const redirect = query.redirect ?? `${appUrl}/dashboard/ads`;
	if (!isValidRedirectUrl(redirect)) throw new BadRequestError("Invalid redirect URL");
	const integrationClientId = typeof query.clientId === "string" && query.clientId.trim().length > 0 ? query.clientId.trim() : null;
	return { url: buildLinkedInOAuthUrl({
		clientId: linkedInClientId,
		redirectUri,
		state: createLinkedInOAuthState({
			state: auth.uid,
			redirect,
			clientId: integrationClientId
		})
	}) };
});
var Route$10 = createFileRoute("/api/integrations/linkedin/oauth/url")({ server: { handlers: handlers$7 } });
var handlers$6 = adaptApiHandler({
	auth: "none",
	querySchema: object({
		code: string().optional(),
		state: string().optional(),
		error: string().optional(),
		error_description: string().optional()
	}),
	rateLimit: "sensitive"
}, async (req, { query }) => {
	const appUrl = "http://localhost:3000";
	try {
		const { error, error_description: errorDescription, code, state } = query;
		if (error) {
			console.error("[linkedin.oauth.callback] OAuth error from LinkedIn:", {
				error,
				errorDescription
			});
			const { NextResponse } = await import("../_libs/next.mjs").then((n) => /* @__PURE__ */ __toESM(n.t()));
			const errorUrl = new URL("/dashboard/ads", appUrl);
			errorUrl.searchParams.set("oauth_error", "linkedin_error");
			errorUrl.searchParams.set("provider", "linkedin");
			errorUrl.searchParams.set("message", errorDescription || error);
			return NextResponse.redirect(errorUrl.toString());
		}
		if (!code) {
			const { NextResponse } = await import("../_libs/next.mjs").then((n) => /* @__PURE__ */ __toESM(n.t()));
			return NextResponse.redirect(`${appUrl}/dashboard/ads?oauth_error=missing_code&provider=linkedin`);
		}
		const redirectUri = process.env.LINKEDIN_OAUTH_REDIRECT_URI;
		if (!redirectUri) {
			const { NextResponse } = await import("../_libs/next.mjs").then((n) => /* @__PURE__ */ __toESM(n.t()));
			return NextResponse.redirect(`${appUrl}/dashboard/ads?oauth_error=config_error&provider=linkedin`);
		}
		let context;
		try {
			context = validateLinkedInOAuthState(state ?? "");
		} catch (stateError) {
			console.error("[linkedin.oauth.callback] State validation failed:", stateError);
			const { NextResponse } = await import("../_libs/next.mjs").then((n) => /* @__PURE__ */ __toESM(n.t()));
			return NextResponse.redirect(`${appUrl}/dashboard/ads?error=invalid_state`);
		}
		if (!context.state) {
			const { NextResponse } = await import("../_libs/next.mjs").then((n) => /* @__PURE__ */ __toESM(n.t()));
			return NextResponse.redirect(`${appUrl}/dashboard/ads?error=invalid_state`);
		}
		await completeLinkedInOAuthFlow({
			code,
			userId: context.state,
			redirectUri,
			clientId: context.clientId ?? null
		});
		let redirectTarget = context.redirect ?? `${appUrl}/dashboard/ads`;
		const url = new URL(redirectTarget, appUrl);
		url.searchParams.set("oauth_success", "true");
		url.searchParams.set("provider", "linkedin");
		if (context.clientId) url.searchParams.set("clientId", context.clientId);
		redirectTarget = url.toString();
		if (!isValidRedirectUrl(redirectTarget)) {
			const { NextResponse } = await import("../_libs/next.mjs").then((n) => /* @__PURE__ */ __toESM(n.t()));
			return NextResponse.redirect(new URL("/dashboard/ads?oauth_success=true&provider=linkedin", req.url));
		}
		const { NextResponse } = await import("../_libs/next.mjs").then((n) => /* @__PURE__ */ __toESM(n.t()));
		return NextResponse.redirect(new URL(redirectTarget, req.url));
	} catch (error) {
		const errorMessage = error instanceof Error ? error.message : "Unknown error";
		console.error("[linkedin.oauth.callback] Error completing OAuth flow:", {
			error: errorMessage,
			stack: error instanceof Error ? error.stack : void 0
		});
		const { NextResponse } = await import("../_libs/next.mjs").then((n) => /* @__PURE__ */ __toESM(n.t()));
		const errorUrl = new URL("/dashboard/ads", appUrl);
		errorUrl.searchParams.set("oauth_error", "oauth_failed");
		errorUrl.searchParams.set("provider", "linkedin");
		errorUrl.searchParams.set("message", errorMessage);
		return NextResponse.redirect(errorUrl.toString());
	}
});
var Route$9 = createFileRoute("/api/integrations/linkedin/oauth/callback")({ server: { handlers: handlers$6 } });
var handlers$5 = adaptApiHandler({
	auth: "required",
	querySchema: object({
		redirect: string().optional(),
		clientId: string().optional()
	}),
	rateLimit: "standard"
}, async (_req, { auth, query }) => {
	if (!auth.uid) throw new UnauthorizedError("Authentication required");
	const appUrl = "http://localhost:3000";
	const { clientId: googleClientId } = resolveGoogleAdsOAuthCredentials();
	const redirectUri = resolveGoogleAdsOAuthRedirectUri(appUrl);
	if (!googleClientId || !redirectUri) throw new ServiceUnavailableError("Google Ads OAuth is not configured");
	const redirect = query.redirect ?? `${appUrl}/dashboard/ads`;
	if (!isValidRedirectUrl(redirect)) throw new BadRequestError("Invalid redirect URL");
	const integrationClientId = typeof query.clientId === "string" && query.clientId.trim().length > 0 ? query.clientId.trim() : null;
	return { url: buildGoogleOAuthUrl({
		clientId: googleClientId,
		redirectUri,
		state: createGoogleOAuthState({
			state: auth.uid,
			redirect,
			clientId: integrationClientId
		})
	}) };
});
var Route$8 = createFileRoute("/api/integrations/google/oauth/url")({ server: { handlers: handlers$5 } });
var handlers$4 = adaptApiHandler({
	auth: "none",
	querySchema: object({
		code: string().optional(),
		state: string().optional(),
		error: string().optional(),
		error_description: string().optional()
	}),
	rateLimit: "sensitive"
}, async (req, { query }) => {
	const appUrl = "http://localhost:3000";
	try {
		const { error, error_description: errorDescription, code, state } = query;
		if (error) {
			console.error("[google.oauth.callback] OAuth error from Google:", {
				error,
				errorDescription
			});
			const { NextResponse } = await import("../_libs/next.mjs").then((n) => /* @__PURE__ */ __toESM(n.t()));
			const errorUrl = new URL("/dashboard/ads", appUrl);
			errorUrl.searchParams.set("oauth_error", "google_error");
			errorUrl.searchParams.set("provider", "google");
			errorUrl.searchParams.set("message", errorDescription || error);
			return NextResponse.redirect(errorUrl.toString());
		}
		if (!code) {
			const { NextResponse } = await import("../_libs/next.mjs").then((n) => /* @__PURE__ */ __toESM(n.t()));
			return NextResponse.redirect(`${appUrl}/dashboard/ads?oauth_error=missing_code&provider=google`);
		}
		const redirectUri = resolveGoogleAdsOAuthRedirectUri(appUrl);
		if (!redirectUri) {
			const { NextResponse } = await import("../_libs/next.mjs").then((n) => /* @__PURE__ */ __toESM(n.t()));
			return NextResponse.redirect(`${appUrl}/dashboard/ads?oauth_error=config_error&provider=google`);
		}
		let context;
		try {
			context = validateGoogleOAuthState(state ?? "");
		} catch (stateError) {
			console.error("[google.oauth.callback] State validation failed:", stateError);
			const { NextResponse } = await import("../_libs/next.mjs").then((n) => /* @__PURE__ */ __toESM(n.t()));
			return NextResponse.redirect(`${appUrl}/dashboard/ads?oauth_error=invalid_state&provider=google`);
		}
		if (!context.state) {
			const { NextResponse } = await import("../_libs/next.mjs").then((n) => /* @__PURE__ */ __toESM(n.t()));
			return NextResponse.redirect(`${appUrl}/dashboard/ads?oauth_error=invalid_state&provider=google`);
		}
		await completeGoogleOAuthFlow({
			code,
			userId: context.state,
			redirectUri,
			clientId: context.clientId ?? null
		});
		let redirectTarget = context.redirect ?? `${appUrl}/dashboard/ads`;
		const url = new URL(redirectTarget, appUrl);
		url.searchParams.set("oauth_success", "true");
		url.searchParams.set("provider", "google");
		if (context.clientId) url.searchParams.set("clientId", context.clientId);
		redirectTarget = url.toString();
		if (!isValidRedirectUrl(redirectTarget)) {
			const { NextResponse } = await import("../_libs/next.mjs").then((n) => /* @__PURE__ */ __toESM(n.t()));
			return NextResponse.redirect(new URL("/dashboard/ads?oauth_success=true&provider=google", req.url));
		}
		const { NextResponse } = await import("../_libs/next.mjs").then((n) => /* @__PURE__ */ __toESM(n.t()));
		return NextResponse.redirect(new URL(redirectTarget, req.url));
	} catch (error) {
		const rawMessage = error instanceof Error ? error.message : "Unknown error";
		const messageLower = rawMessage.toLowerCase();
		const userFacingMessage = (() => {
			if (messageLower.includes("convex admin client is not configured")) return "Google Ads integration is not configured on this environment.";
			if (messageLower.includes("authentication required") || messageLower.includes("unauthorized")) return "Your session expired. Please sign in again and retry connecting Google Ads.";
			if (messageLower.includes("invalid state")) return "Login session expired. Please try connecting again.";
			return rawMessage;
		})();
		console.error("[google.oauth.callback] Error completing OAuth flow:", {
			error: rawMessage,
			stack: error instanceof Error ? error.stack : void 0
		});
		const { NextResponse } = await import("../_libs/next.mjs").then((n) => /* @__PURE__ */ __toESM(n.t()));
		const errorUrl = new URL("/dashboard/ads", appUrl);
		errorUrl.searchParams.set("oauth_error", "oauth_failed");
		errorUrl.searchParams.set("provider", "google");
		errorUrl.searchParams.set("message", userFacingMessage);
		return NextResponse.redirect(errorUrl.toString());
	}
});
var Route$7 = createFileRoute("/api/integrations/google/oauth/callback")({ server: { handlers: handlers$4 } });
var handlers$3 = adaptApiHandler({
	querySchema: object({ redirect: string().optional() }),
	rateLimit: "standard"
}, async (_req, { auth, query }) => {
	if (!auth.uid) throw new UnauthorizedError("Authentication required");
	const role = typeof auth.claims?.role === "string" ? auth.claims.role : null;
	if (role !== "admin" && role !== "team") throw new ForbiddenError("Client users cannot connect Google Workspace for meetings");
	const appUrl = "http://localhost:3000";
	const { clientId: googleClientId } = resolveGoogleWorkspaceOAuthCredentials();
	const redirectUri = resolveGoogleWorkspaceOAuthRedirectUri(appUrl);
	if (!googleClientId || !redirectUri) throw new ServiceUnavailableError("Google Workspace OAuth is not configured");
	const redirect = query.redirect ?? `${appUrl}/dashboard/meetings`;
	if (!isValidRedirectUrl(redirect)) throw new BadRequestError("Invalid redirect URL");
	return { url: buildGoogleWorkspaceOAuthUrl({
		clientId: googleClientId,
		redirectUri,
		state: createGoogleWorkspaceOAuthState({
			state: auth.uid,
			redirect
		})
	}) };
});
var Route$6 = createFileRoute("/api/integrations/google-workspace/oauth/url")({ server: { handlers: handlers$3 } });
var callbackQuerySchema = object({
	code: string().optional(),
	state: string().optional(),
	error: string().optional(),
	error_description: string().optional()
});
function decodeEmailFromIdToken(idToken) {
	if (!idToken) return null;
	try {
		const parts = idToken.split(".");
		if (parts.length < 2) return null;
		const payload = parts[1];
		if (typeof payload !== "string" || payload.length === 0) return null;
		const decoded = JSON.parse(Buffer.from(payload.replace(/-/g, "+").replace(/_/g, "/"), "base64").toString("utf8"));
		return typeof decoded.email === "string" ? decoded.email : null;
	} catch {
		return null;
	}
}
async function fetchGoogleUserEmail(accessToken) {
	try {
		const response = await fetch("https://www.googleapis.com/oauth2/v3/userinfo", {
			cache: "no-store",
			headers: { Authorization: `Bearer ${accessToken}` }
		});
		if (!response.ok) return null;
		const payload = await response.json();
		return typeof payload.email === "string" ? payload.email : null;
	} catch {
		return null;
	}
}
var handlers$2 = adaptApiHandler({
	auth: "none",
	querySchema: callbackQuerySchema,
	rateLimit: "sensitive"
}, async (_req, { query }) => {
	const appUrl = "http://localhost:3000";
	const fallbackSuccess = `${appUrl}/dashboard/meetings?oauth_success=true&provider=google-workspace`;
	try {
		if (query.error) {
			const { NextResponse } = await import("../_libs/next.mjs").then((n) => /* @__PURE__ */ __toESM(n.t()));
			const errorUrl = new URL("/dashboard/meetings", appUrl);
			errorUrl.searchParams.set("oauth_error", "google_workspace_error");
			errorUrl.searchParams.set("provider", "google-workspace");
			errorUrl.searchParams.set("message", query.error_description || query.error);
			return NextResponse.redirect(errorUrl.toString());
		}
		if (!query.code) {
			const { NextResponse } = await import("../_libs/next.mjs").then((n) => /* @__PURE__ */ __toESM(n.t()));
			return NextResponse.redirect(`${appUrl}/dashboard/meetings?oauth_error=missing_code&provider=google-workspace`);
		}
		const redirectUri = resolveGoogleWorkspaceOAuthRedirectUri(appUrl);
		const { clientId: googleClientId, clientSecret: googleClientSecret } = resolveGoogleWorkspaceOAuthCredentials();
		if (!redirectUri || !googleClientId || !googleClientSecret) {
			const { NextResponse } = await import("../_libs/next.mjs").then((n) => /* @__PURE__ */ __toESM(n.t()));
			return NextResponse.redirect(`${appUrl}/dashboard/meetings?oauth_error=config_error&provider=google-workspace`);
		}
		const context = validateGoogleWorkspaceOAuthState(query.state ?? "");
		const tokenResponse = await exchangeGoogleWorkspaceCodeForTokens({
			clientId: googleClientId,
			clientSecret: googleClientSecret,
			redirectUri,
			code: query.code
		});
		const expiresInMs = typeof tokenResponse.expires_in === "number" ? tokenResponse.expires_in * 1e3 : null;
		const accessTokenExpiresAtMs = expiresInMs ? Date.now() + expiresInMs : null;
		const scopes = parseGoogleScopeList$1(tokenResponse.scope);
		const userEmail = await fetchGoogleUserEmail(tokenResponse.access_token) ?? decodeEmailFromIdToken(tokenResponse.id_token);
		await upsertGoogleWorkspaceTokens({
			userId: context.state,
			userEmail,
			accessToken: tokenResponse.access_token,
			refreshToken: tokenResponse.refresh_token,
			idToken: tokenResponse.id_token,
			scopes,
			accessTokenExpiresAtMs
		});
		const redirectTarget = context.redirect ?? `${appUrl}/dashboard/meetings`;
		const successUrl = new URL(redirectTarget, appUrl);
		successUrl.searchParams.set("oauth_success", "true");
		successUrl.searchParams.set("provider", "google-workspace");
		if (!isValidRedirectUrl(successUrl.toString())) {
			const { NextResponse } = await import("../_libs/next.mjs").then((n) => /* @__PURE__ */ __toESM(n.t()));
			return NextResponse.redirect(fallbackSuccess);
		}
		const { NextResponse } = await import("../_libs/next.mjs").then((n) => /* @__PURE__ */ __toESM(n.t()));
		return NextResponse.redirect(successUrl.toString());
	} catch (error) {
		const rawMessage = error instanceof Error ? error.message : "OAuth callback failed";
		const messageLower = rawMessage.toLowerCase();
		const message = (() => {
			if (messageLower.includes("convex admin client is not configured")) return "Google Workspace meetings integration is not configured on this environment.";
			if (messageLower.includes("authentication required") || messageLower.includes("unauthorized")) return "Your session expired. Please sign in again and retry connecting Google Workspace.";
			if (messageLower.includes("invalid state")) return "Login session expired. Please try connecting again.";
			return rawMessage;
		})();
		const { NextResponse } = await import("../_libs/next.mjs").then((n) => /* @__PURE__ */ __toESM(n.t()));
		const errorUrl = new URL("/dashboard/meetings", appUrl);
		errorUrl.searchParams.set("oauth_error", "oauth_failed");
		errorUrl.searchParams.set("provider", "google-workspace");
		errorUrl.searchParams.set("message", message);
		return NextResponse.redirect(errorUrl.toString());
	}
});
var Route$5 = createFileRoute("/api/integrations/google-workspace/oauth/callback")({ server: { handlers: handlers$2 } });
var handlers$1 = adaptApiHandler({
	querySchema: object({
		redirect: string().optional(),
		clientId: string().optional()
	}),
	rateLimit: "standard"
}, async (_req, { auth, query }) => {
	if (!auth.uid) throw new UnauthorizedError("Authentication required");
	const appUrl = "http://localhost:3000";
	const { clientId: googleClientId } = resolveGoogleAnalyticsOAuthCredentials();
	const redirectUri = resolveGoogleAnalyticsOAuthRedirectUri(appUrl);
	if (!googleClientId || !redirectUri) throw new ServiceUnavailableError("Google Analytics OAuth is not configured");
	const redirect = query.redirect ?? `${appUrl}/dashboard/analytics`;
	if (!isValidRedirectUrl(redirect)) throw new BadRequestError("Invalid redirect URL");
	const integrationClientId = typeof query.clientId === "string" && query.clientId.trim().length > 0 ? query.clientId.trim() : null;
	return { url: buildGoogleAnalyticsOAuthUrl({
		clientId: googleClientId,
		redirectUri,
		state: createGoogleOAuthState({
			state: auth.uid,
			redirect,
			clientId: integrationClientId
		})
	}) };
});
var Route$4 = createFileRoute("/api/integrations/google-analytics/oauth/start")({ server: { handlers: handlers$1 } });
var handlers = adaptApiHandler({
	auth: "none",
	querySchema: object({
		code: string().optional(),
		state: string().optional(),
		error: string().optional(),
		error_description: string().optional()
	}),
	rateLimit: "sensitive"
}, async (req, { query }) => {
	const appUrl = "http://localhost:3000";
	try {
		const { error, error_description: errorDescription, code, state } = query;
		if (error) {
			const { NextResponse } = await import("../_libs/next.mjs").then((n) => /* @__PURE__ */ __toESM(n.t()));
			const errorUrl = new URL("/dashboard/analytics", appUrl);
			errorUrl.searchParams.set("oauth_error", "google_analytics_error");
			errorUrl.searchParams.set("provider", "google-analytics");
			errorUrl.searchParams.set("message", errorDescription || error);
			return NextResponse.redirect(errorUrl.toString());
		}
		if (!code) {
			const { NextResponse } = await import("../_libs/next.mjs").then((n) => /* @__PURE__ */ __toESM(n.t()));
			return NextResponse.redirect(`${appUrl}/dashboard/analytics?oauth_error=missing_code&provider=google-analytics`);
		}
		const redirectUri = resolveGoogleAnalyticsOAuthRedirectUri(appUrl);
		if (!redirectUri) {
			const { NextResponse } = await import("../_libs/next.mjs").then((n) => /* @__PURE__ */ __toESM(n.t()));
			return NextResponse.redirect(`${appUrl}/dashboard/analytics?oauth_error=config_error&provider=google-analytics`);
		}
		let context;
		try {
			context = validateGoogleOAuthState(state ?? "");
		} catch (stateError) {
			console.error("[google-analytics.oauth.callback] State validation failed:", stateError);
			const { NextResponse } = await import("../_libs/next.mjs").then((n) => /* @__PURE__ */ __toESM(n.t()));
			return NextResponse.redirect(`${appUrl}/dashboard/analytics?oauth_error=invalid_state&provider=google-analytics`);
		}
		if (!context.state) {
			const { NextResponse } = await import("../_libs/next.mjs").then((n) => /* @__PURE__ */ __toESM(n.t()));
			return NextResponse.redirect(`${appUrl}/dashboard/analytics?oauth_error=invalid_state&provider=google-analytics`);
		}
		await completeGoogleAnalyticsOAuthFlow({
			code,
			userId: context.state,
			redirectUri,
			clientId: context.clientId ?? null
		});
		let redirectTarget = context.redirect ?? `${appUrl}/dashboard/analytics`;
		const url = new URL(redirectTarget, appUrl);
		url.searchParams.set("oauth_success", "true");
		url.searchParams.set("provider", "google-analytics");
		if (context.clientId) url.searchParams.set("clientId", context.clientId);
		redirectTarget = url.toString();
		if (!isValidRedirectUrl(redirectTarget)) {
			const { NextResponse } = await import("../_libs/next.mjs").then((n) => /* @__PURE__ */ __toESM(n.t()));
			return NextResponse.redirect(new URL("/dashboard/analytics?oauth_success=true&provider=google-analytics", req.url));
		}
		const { NextResponse } = await import("../_libs/next.mjs").then((n) => /* @__PURE__ */ __toESM(n.t()));
		return NextResponse.redirect(new URL(redirectTarget, req.url));
	} catch (error) {
		const errorMessage = error instanceof Error ? error.message : "Unknown error";
		console.error("[google-analytics.oauth.callback] Error completing OAuth flow:", {
			error: errorMessage,
			stack: error instanceof Error ? error.stack : void 0
		});
		const { NextResponse } = await import("../_libs/next.mjs").then((n) => /* @__PURE__ */ __toESM(n.t()));
		const errorUrl = new URL("/dashboard/analytics", appUrl);
		errorUrl.searchParams.set("oauth_error", "oauth_failed");
		errorUrl.searchParams.set("provider", "google-analytics");
		errorUrl.searchParams.set("message", errorMessage);
		return NextResponse.redirect(errorUrl.toString());
	}
});
var Route$3 = createFileRoute("/api/integrations/google-analytics/oauth/callback")({ server: { handlers } });
var $$splitComponentImporter$2 = () => import("./deck-C9NZPqxu.mjs");
var Route$2 = createFileRoute("/_authed/dashboard/proposals/$proposalId/deck")({
	head: () => ({ meta: [{ title: "Proposal Deck | Cohorts" }] }),
	component: lazyRouteComponent($$splitComponentImporter$2, "component")
});
var $$splitComponentImporter$1 = () => import("../_campaignId-CdW1pnJW.mjs");
var Route$1 = createFileRoute("/_authed/dashboard/ads/campaigns/$providerId/$campaignId")({ component: lazyRouteComponent($$splitComponentImporter$1, "component") });
var $$splitComponentImporter = () => import("../_creativeId-CqaotAXN.mjs");
var Route = createFileRoute("/_authed/dashboard/ads/campaigns/$providerId/$campaignId/creative/$creativeId")({ component: lazyRouteComponent($$splitComponentImporter, "component") });
var TermsRoute = Route$64.update({
	id: "/terms",
	path: "/terms",
	getParentRoute: () => Route$65
});
var PrivacyRoute = Route$63.update({
	id: "/privacy",
	path: "/privacy",
	getParentRoute: () => Route$65
});
var PendingApprovalRoute = Route$62.update({
	id: "/pending-approval",
	path: "/pending-approval",
	getParentRoute: () => Route$65
});
var AuthRoute = Route$61.update({
	id: "/auth",
	path: "/auth",
	getParentRoute: () => Route$65
});
var AuthedRoute = Route$60.update({
	id: "/_authed",
	getParentRoute: () => Route$65
});
var IndexRoute = Route$59.update({
	id: "/",
	path: "/",
	getParentRoute: () => Route$65
});
var AuthIndexRoute = Route$58.update({
	id: "/",
	path: "/",
	getParentRoute: () => AuthRoute
});
var ManifestWebmanifestRoute = Route$57.update({
	id: "/manifest/webmanifest",
	path: "/manifest/webmanifest",
	getParentRoute: () => Route$65
});
var AuthResetRoute = Route$67.update({
	id: "/reset",
	path: "/reset",
	getParentRoute: () => AuthRoute
});
var AuthForgotRoute = Route$56.update({
	id: "/forgot",
	path: "/forgot",
	getParentRoute: () => AuthRoute
});
var ApiHealthRoute = Route$55.update({
	id: "/api/health",
	path: "/api/health",
	getParentRoute: () => Route$65
});
var AuthedSettingsRoute = Route$69.update({
	id: "/settings",
	path: "/settings",
	getParentRoute: () => AuthedRoute
});
var AuthedForYouRoute = Route$70.update({
	id: "/for-you",
	path: "/for-you",
	getParentRoute: () => AuthedRoute
});
var AuthedDashboardRoute = Route$68.update({
	id: "/dashboard",
	path: "/dashboard",
	getParentRoute: () => AuthedRoute
});
var AuthedAdminRoute = Route$66.update({
	id: "/admin",
	path: "/admin",
	getParentRoute: () => AuthedRoute
});
var AuthedDashboardIndexRoute = Route$54.update({
	id: "/",
	path: "/",
	getParentRoute: () => AuthedDashboardRoute
});
var AuthedAdminIndexRoute = Route$53.update({
	id: "/",
	path: "/",
	getParentRoute: () => AuthedAdminRoute
});
var ApiProxyFileRoute = Route$52.update({
	id: "/api/proxy/file",
	path: "/api/proxy/file",
	getParentRoute: () => Route$65
});
var ApiMeetingsTranscriptRoute = Route$51.update({
	id: "/api/meetings/transcript",
	path: "/api/meetings/transcript",
	getParentRoute: () => Route$65
});
var ApiMeetingsScheduleRoute = Route$50.update({
	id: "/api/meetings/schedule",
	path: "/api/meetings/schedule",
	getParentRoute: () => Route$65
});
var ApiMeetingsRescheduleRoute = Route$49.update({
	id: "/api/meetings/reschedule",
	path: "/api/meetings/reschedule",
	getParentRoute: () => Route$65
});
var ApiMeetingsQuickRoute = Route$48.update({
	id: "/api/meetings/quick",
	path: "/api/meetings/quick",
	getParentRoute: () => Route$65
});
var ApiMeetingsCancelRoute = Route$47.update({
	id: "/api/meetings/cancel",
	path: "/api/meetings/cancel",
	getParentRoute: () => Route$65
});
var ApiIntegrationsWorkerRoute = Route$46.update({
	id: "/api/integrations/worker",
	path: "/api/integrations/worker",
	getParentRoute: () => Route$65
});
var ApiIntegrationsScheduleRoute = Route$45.update({
	id: "/api/integrations/schedule",
	path: "/api/integrations/schedule",
	getParentRoute: () => Route$65
});
var ApiIntegrationsProcessRoute = Route$44.update({
	id: "/api/integrations/process",
	path: "/api/integrations/process",
	getParentRoute: () => Route$65
});
var ApiIntegrationsManualSyncRoute = Route$43.update({
	id: "/api/integrations/manual-sync",
	path: "/api/integrations/manual-sync",
	getParentRoute: () => Route$65
});
var ApiIntegrationsCronRoute = Route$42.update({
	id: "/api/integrations/cron",
	path: "/api/integrations/cron",
	getParentRoute: () => Route$65
});
var ApiHealthReadyRoute = Route$41.update({
	id: "/ready",
	path: "/ready",
	getParentRoute: () => ApiHealthRoute
});
var ApiFilesProxyRoute = Route$40.update({
	id: "/api/files/proxy",
	path: "/api/files/proxy",
	getParentRoute: () => Route$65
});
var ApiDebugClientsRoute = Route$39.update({
	id: "/api/debug/clients",
	path: "/api/debug/clients",
	getParentRoute: () => Route$65
});
var ApiDashboardClientSummaryRoute = Route$38.update({
	id: "/api/dashboard/client-summary",
	path: "/api/dashboard/client-summary",
	getParentRoute: () => Route$65
});
var ApiAuthSessionRoute = Route$37.update({
	id: "/api/auth/session",
	path: "/api/auth/session",
	getParentRoute: () => Route$65
});
var ApiAuthBootstrapRoute = Route$36.update({
	id: "/api/auth/bootstrap",
	path: "/api/auth/bootstrap",
	getParentRoute: () => Route$65
});
var ApiAuthSplatRoute = Route$35.update({
	id: "/api/auth/$",
	path: "/api/auth/$",
	getParentRoute: () => Route$65
});
var AuthedDashboardTasksRoute = Route$71.update({
	id: "/tasks",
	path: "/tasks",
	getParentRoute: () => AuthedDashboardRoute
});
var AuthedDashboardSocialsRoute = Route$34.update({
	id: "/socials",
	path: "/socials",
	getParentRoute: () => AuthedDashboardRoute
});
var AuthedDashboardProjectsRoute = Route$33.update({
	id: "/projects",
	path: "/projects",
	getParentRoute: () => AuthedDashboardRoute
});
var AuthedDashboardNotificationsRoute = Route$32.update({
	id: "/notifications",
	path: "/notifications",
	getParentRoute: () => AuthedDashboardRoute
});
var AuthedDashboardMeetingsRoute = Route$31.update({
	id: "/meetings",
	path: "/meetings",
	getParentRoute: () => AuthedDashboardRoute
});
var AuthedDashboardCollaborationRoute = Route$30.update({
	id: "/collaboration",
	path: "/collaboration",
	getParentRoute: () => AuthedDashboardRoute
});
var AuthedDashboardClientsRoute = Route$29.update({
	id: "/clients",
	path: "/clients",
	getParentRoute: () => AuthedDashboardRoute
});
var AuthedDashboardAnalyticsRoute = Route$28.update({
	id: "/analytics",
	path: "/analytics",
	getParentRoute: () => AuthedDashboardRoute
});
var AuthedAdminUsersRoute = Route$27.update({
	id: "/users",
	path: "/users",
	getParentRoute: () => AuthedAdminRoute
});
var AuthedAdminTeamRoute = Route$26.update({
	id: "/team",
	path: "/team",
	getParentRoute: () => AuthedAdminRoute
});
var AuthedAdminIssuesRoute = Route$25.update({
	id: "/issues",
	path: "/issues",
	getParentRoute: () => AuthedAdminRoute
});
var AuthedAdminHealthRoute = Route$24.update({
	id: "/health",
	path: "/health",
	getParentRoute: () => AuthedAdminRoute
});
var AuthedAdminFeaturesRoute = Route$23.update({
	id: "/features",
	path: "/features",
	getParentRoute: () => AuthedAdminRoute
});
var AuthedAdminClientsRoute = Route$22.update({
	id: "/clients",
	path: "/clients",
	getParentRoute: () => AuthedAdminRoute
});
var AuthedDashboardProposalsIndexRoute = Route$21.update({
	id: "/proposals/",
	path: "/proposals/",
	getParentRoute: () => AuthedDashboardRoute
});
var AuthedDashboardAdsIndexRoute = Route$20.update({
	id: "/ads/",
	path: "/ads/",
	getParentRoute: () => AuthedDashboardRoute
});
var ApiMeetingsLivekitTokenRoute = Route$19.update({
	id: "/api/meetings/livekit/token",
	path: "/api/meetings/livekit/token",
	getParentRoute: () => Route$65
});
var ApiIntegrationsGoogleWorkspaceEventsRoute = Route$18.update({
	id: "/api/integrations/google-workspace/events",
	path: "/api/integrations/google-workspace/events",
	getParentRoute: () => Route$65
});
var ApiIntegrationsEmailSendRoute = Route$17.update({
	id: "/api/integrations/email/send",
	path: "/api/integrations/email/send",
	getParentRoute: () => Route$65
});
var ApiAnalyticsGoogleAnalyticsSyncRoute = Route$16.update({
	id: "/api/analytics/google-analytics/sync",
	path: "/api/analytics/google-analytics/sync",
	getParentRoute: () => Route$65
});
var AuthedDashboardProposalsViewerRoute = Route$72.update({
	id: "/proposals/viewer",
	path: "/proposals/viewer",
	getParentRoute: () => AuthedDashboardRoute
});
var AuthedDashboardProposalsAnalyticsRoute = Route$15.update({
	id: "/proposals/analytics",
	path: "/proposals/analytics",
	getParentRoute: () => AuthedDashboardRoute
});
var ApiIntegrationsTiktokOauthUrlRoute = Route$14.update({
	id: "/api/integrations/tiktok/oauth/url",
	path: "/api/integrations/tiktok/oauth/url",
	getParentRoute: () => Route$65
});
var ApiIntegrationsTiktokOauthCallbackRoute = Route$13.update({
	id: "/api/integrations/tiktok/oauth/callback",
	path: "/api/integrations/tiktok/oauth/callback",
	getParentRoute: () => Route$65
});
var ApiIntegrationsMetaOauthUrlRoute = Route$12.update({
	id: "/api/integrations/meta/oauth/url",
	path: "/api/integrations/meta/oauth/url",
	getParentRoute: () => Route$65
});
var ApiIntegrationsMetaOauthCallbackRoute = Route$11.update({
	id: "/api/integrations/meta/oauth/callback",
	path: "/api/integrations/meta/oauth/callback",
	getParentRoute: () => Route$65
});
var ApiIntegrationsLinkedinOauthUrlRoute = Route$10.update({
	id: "/api/integrations/linkedin/oauth/url",
	path: "/api/integrations/linkedin/oauth/url",
	getParentRoute: () => Route$65
});
var ApiIntegrationsLinkedinOauthCallbackRoute = Route$9.update({
	id: "/api/integrations/linkedin/oauth/callback",
	path: "/api/integrations/linkedin/oauth/callback",
	getParentRoute: () => Route$65
});
var ApiIntegrationsGoogleOauthUrlRoute = Route$8.update({
	id: "/api/integrations/google/oauth/url",
	path: "/api/integrations/google/oauth/url",
	getParentRoute: () => Route$65
});
var ApiIntegrationsGoogleOauthCallbackRoute = Route$7.update({
	id: "/api/integrations/google/oauth/callback",
	path: "/api/integrations/google/oauth/callback",
	getParentRoute: () => Route$65
});
var ApiIntegrationsGoogleWorkspaceOauthUrlRoute = Route$6.update({
	id: "/api/integrations/google-workspace/oauth/url",
	path: "/api/integrations/google-workspace/oauth/url",
	getParentRoute: () => Route$65
});
var ApiIntegrationsGoogleWorkspaceOauthCallbackRoute = Route$5.update({
	id: "/api/integrations/google-workspace/oauth/callback",
	path: "/api/integrations/google-workspace/oauth/callback",
	getParentRoute: () => Route$65
});
var ApiIntegrationsGoogleAnalyticsOauthStartRoute = Route$4.update({
	id: "/api/integrations/google-analytics/oauth/start",
	path: "/api/integrations/google-analytics/oauth/start",
	getParentRoute: () => Route$65
});
var ApiIntegrationsGoogleAnalyticsOauthCallbackRoute = Route$3.update({
	id: "/api/integrations/google-analytics/oauth/callback",
	path: "/api/integrations/google-analytics/oauth/callback",
	getParentRoute: () => Route$65
});
var AuthedDashboardProposalsProposalIdDeckRoute = Route$2.update({
	id: "/proposals/$proposalId/deck",
	path: "/proposals/$proposalId/deck",
	getParentRoute: () => AuthedDashboardRoute
});
var AuthedDashboardAdsCampaignsProviderIdCampaignIdRoute = Route$1.update({
	id: "/ads/campaigns/$providerId/$campaignId",
	path: "/ads/campaigns/$providerId/$campaignId",
	getParentRoute: () => AuthedDashboardRoute
});
var AuthedDashboardAdsCampaignsProviderIdCampaignIdCreativeCreativeIdRoute = Route.update({
	id: "/creative/$creativeId",
	path: "/creative/$creativeId",
	getParentRoute: () => AuthedDashboardAdsCampaignsProviderIdCampaignIdRoute
});
var AuthedAdminRouteChildren = {
	AuthedAdminClientsRoute,
	AuthedAdminFeaturesRoute,
	AuthedAdminHealthRoute,
	AuthedAdminIssuesRoute,
	AuthedAdminTeamRoute,
	AuthedAdminUsersRoute,
	AuthedAdminIndexRoute
};
var AuthedAdminRouteWithChildren = AuthedAdminRoute._addFileChildren(AuthedAdminRouteChildren);
var AuthedDashboardAdsCampaignsProviderIdCampaignIdRouteChildren = { AuthedDashboardAdsCampaignsProviderIdCampaignIdCreativeCreativeIdRoute };
var AuthedDashboardRouteChildren = {
	AuthedDashboardAnalyticsRoute,
	AuthedDashboardClientsRoute,
	AuthedDashboardCollaborationRoute,
	AuthedDashboardMeetingsRoute,
	AuthedDashboardNotificationsRoute,
	AuthedDashboardProjectsRoute,
	AuthedDashboardSocialsRoute,
	AuthedDashboardTasksRoute,
	AuthedDashboardIndexRoute,
	AuthedDashboardProposalsAnalyticsRoute,
	AuthedDashboardProposalsViewerRoute,
	AuthedDashboardAdsIndexRoute,
	AuthedDashboardProposalsIndexRoute,
	AuthedDashboardProposalsProposalIdDeckRoute,
	AuthedDashboardAdsCampaignsProviderIdCampaignIdRoute: AuthedDashboardAdsCampaignsProviderIdCampaignIdRoute._addFileChildren(AuthedDashboardAdsCampaignsProviderIdCampaignIdRouteChildren)
};
var AuthedRouteChildren = {
	AuthedAdminRoute: AuthedAdminRouteWithChildren,
	AuthedDashboardRoute: AuthedDashboardRoute._addFileChildren(AuthedDashboardRouteChildren),
	AuthedForYouRoute,
	AuthedSettingsRoute
};
var AuthedRouteWithChildren = AuthedRoute._addFileChildren(AuthedRouteChildren);
var AuthRouteChildren = {
	AuthForgotRoute,
	AuthResetRoute,
	AuthIndexRoute
};
var AuthRouteWithChildren = AuthRoute._addFileChildren(AuthRouteChildren);
var ApiHealthRouteChildren = { ApiHealthReadyRoute };
var rootRouteChildren = {
	IndexRoute,
	AuthedRoute: AuthedRouteWithChildren,
	AuthRoute: AuthRouteWithChildren,
	PendingApprovalRoute,
	PrivacyRoute,
	TermsRoute,
	ApiHealthRoute: ApiHealthRoute._addFileChildren(ApiHealthRouteChildren),
	ManifestWebmanifestRoute,
	ApiAuthSplatRoute,
	ApiAuthBootstrapRoute,
	ApiAuthSessionRoute,
	ApiDashboardClientSummaryRoute,
	ApiDebugClientsRoute,
	ApiFilesProxyRoute,
	ApiIntegrationsCronRoute,
	ApiIntegrationsManualSyncRoute,
	ApiIntegrationsProcessRoute,
	ApiIntegrationsScheduleRoute,
	ApiIntegrationsWorkerRoute,
	ApiMeetingsCancelRoute,
	ApiMeetingsQuickRoute,
	ApiMeetingsRescheduleRoute,
	ApiMeetingsScheduleRoute,
	ApiMeetingsTranscriptRoute,
	ApiProxyFileRoute,
	ApiAnalyticsGoogleAnalyticsSyncRoute,
	ApiIntegrationsEmailSendRoute,
	ApiIntegrationsGoogleWorkspaceEventsRoute,
	ApiMeetingsLivekitTokenRoute,
	ApiIntegrationsGoogleAnalyticsOauthCallbackRoute,
	ApiIntegrationsGoogleAnalyticsOauthStartRoute,
	ApiIntegrationsGoogleWorkspaceOauthCallbackRoute,
	ApiIntegrationsGoogleWorkspaceOauthUrlRoute,
	ApiIntegrationsGoogleOauthCallbackRoute,
	ApiIntegrationsGoogleOauthUrlRoute,
	ApiIntegrationsLinkedinOauthCallbackRoute,
	ApiIntegrationsLinkedinOauthUrlRoute,
	ApiIntegrationsMetaOauthCallbackRoute,
	ApiIntegrationsMetaOauthUrlRoute,
	ApiIntegrationsTiktokOauthCallbackRoute,
	ApiIntegrationsTiktokOauthUrlRoute
};
var routeTree = Route$65._addFileChildren(rootRouteChildren)._addFileTypes();
function getRouter() {
	return createRouter({
		routeTree,
		defaultPreload: "intent",
		scrollRestoration: true,
		defaultPendingComponent: () => null
	});
}
//#endregion
export { createConvexAdminClient as _, normalizeCost as a, setAnalyticsUserId as b, BREVO_SENDER_NAME as c, notifyMeetingCancelledEmails as d, notifyMeetingRescheduledEmail as f, sendTransactionalEmail as g, getRouter, notifyMeetingScheduledEmails as h, googleAdsSearch as i, checkBrevoHealth as l, notifyMeetingScheduledEmail as m, fetchGoogleAdsMetrics as n, BREVO_API_KEY as o, notifyMeetingRescheduledEmails as p, executeGoogleAdsApiRequest as r, BREVO_SENDER_EMAIL as s, checkGoogleAdsIntegrationHealth as t, notifyMeetingCancelledEmail as u, logAnalyticsEvent as v, logPageView as y };
