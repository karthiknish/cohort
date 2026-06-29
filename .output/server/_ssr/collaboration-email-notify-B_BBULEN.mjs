import { X as isChannelEnabled, st as normalizePreferences } from "./preview-data-CXkRNfsX.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/collaboration-email-notify-B_BBULEN.js
/** Whether collaboration email copy should be sent for stored prefs (V2: pauseAll, quiet hours). */
function shouldSendCollaborationEmailCopy(rawPrefs, options) {
	return isChannelEnabled(normalizePreferences(rawPrefs), "collaboration", "email", options);
}
//#endregion
export { shouldSendCollaborationEmailCopy as t };
