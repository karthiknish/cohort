//#region src/lib/notifications/preferences.ts
var NOTIFICATION_CATEGORIES = [
	"tasks",
	"collaboration",
	"ads",
	"digest",
	"projects",
	"meetings"
];
var DEFAULT_CHANNEL_PREFS = {
	inApp: true,
	email: true
};
var DEFAULT_QUIET_HOURS = {
	enabled: false,
	start: "22:00",
	end: "08:00"
};
function createDefaultCategories(overrides) {
	const base = {
		tasks: { ...DEFAULT_CHANNEL_PREFS },
		collaboration: {
			inApp: true,
			email: false
		},
		ads: { ...DEFAULT_CHANNEL_PREFS },
		digest: { ...DEFAULT_CHANNEL_PREFS },
		projects: { ...DEFAULT_CHANNEL_PREFS },
		meetings: { ...DEFAULT_CHANNEL_PREFS }
	};
	if (!overrides) return base;
	for (const category of NOTIFICATION_CATEGORIES) {
		const patch = overrides[category];
		if (patch) base[category] = {
			...base[category],
			...patch
		};
	}
	return base;
}
var DEFAULT_NOTIFICATION_PREFERENCES_V2 = {
	version: 2,
	pauseAll: false,
	quietHours: DEFAULT_QUIET_HOURS,
	categories: createDefaultCategories()
};
function isNotificationPreferencesV2(prefs) {
	return prefs !== null && prefs !== void 0 && typeof prefs === "object" && "version" in prefs && prefs.version === 2;
}
function migrateLegacyPreferences(legacy) {
	return {
		version: 2,
		pauseAll: false,
		quietHours: { ...DEFAULT_QUIET_HOURS },
		categories: createDefaultCategories({
			tasks: { email: legacy?.emailTaskActivity !== false },
			collaboration: { email: legacy?.emailCollaboration === true },
			ads: { email: legacy?.emailAdAlerts !== false },
			digest: { email: legacy?.emailPerformanceDigest !== false },
			projects: {
				inApp: true,
				email: true
			},
			meetings: {
				inApp: true,
				email: true
			}
		})
	};
}
function normalizePreferences(prefs) {
	if (isNotificationPreferencesV2(prefs)) return {
		version: 2,
		pauseAll: prefs.pauseAll ?? false,
		quietHours: {
			enabled: prefs.quietHours?.enabled ?? false,
			start: prefs.quietHours?.start ?? DEFAULT_QUIET_HOURS.start,
			end: prefs.quietHours?.end ?? DEFAULT_QUIET_HOURS.end
		},
		categories: mergeCategories(prefs.categories)
	};
	return migrateLegacyPreferences(prefs);
}
function mergeCategories(input) {
	const defaults = createDefaultCategories();
	if (!input) return defaults;
	const merged = { ...defaults };
	for (const category of NOTIFICATION_CATEGORIES) {
		const patch = input[category];
		if (patch) merged[category] = {
			inApp: patch.inApp ?? defaults[category].inApp,
			email: patch.email ?? defaults[category].email
		};
	}
	return merged;
}
function kindToCategory(kind) {
	if (kind.startsWith("task.")) return "tasks";
	if (kind.startsWith("collaboration.")) return "collaboration";
	if (kind.startsWith("meeting.")) return "meetings";
	if (kind === "project.created" || kind === "proposal.deck.ready") return "projects";
	if (kind === "report.generated") return "ads";
	return "tasks";
}
/** Brevo / server email pref keys mapped to categories. */
var EMAIL_PREF_KEY_TO_CATEGORY = {
	adAlerts: "ads",
	performanceDigest: "digest",
	taskActivity: "tasks",
	collaboration: "collaboration",
	meetings: "meetings"
};
function parseTimeToMinutes(value) {
	const match = /^(\d{1,2}):(\d{2})$/.exec(value.trim());
	if (!match) return null;
	const hoursPart = match[1];
	const minutesPart = match[2];
	if (hoursPart === void 0 || minutesPart === void 0) return null;
	const hours = Number.parseInt(hoursPart, 10);
	const minutes = Number.parseInt(minutesPart, 10);
	if (hours < 0 || hours > 23 || minutes < 0 || minutes > 59) return null;
	return hours * 60 + minutes;
}
function isWithinQuietHours(quietHours, now = /* @__PURE__ */ new Date()) {
	if (!quietHours.enabled) return false;
	const start = parseTimeToMinutes(quietHours.start);
	const end = parseTimeToMinutes(quietHours.end);
	if (start === null || end === null) return false;
	const current = now.getHours() * 60 + now.getMinutes();
	if (start === end) return true;
	if (start < end) return current >= start && current < end;
	return current >= start || current < end;
}
function isChannelEnabled(prefs, category, channel, options) {
	if (prefs.pauseAll) return false;
	const categoryPrefs = prefs.categories[category] ?? DEFAULT_CHANNEL_PREFS;
	if (!(channel === "inApp" ? categoryPrefs.inApp : categoryPrefs.email)) return false;
	if (channel === "email" && isWithinQuietHours(prefs.quietHours, options?.now)) return false;
	return true;
}
function isEmailPrefEnabled(prefs, prefKey, options) {
	const normalized = normalizePreferences(prefs);
	const category = EMAIL_PREF_KEY_TO_CATEGORY[prefKey];
	if (!category) return true;
	return isChannelEnabled(normalized, category, "email", options);
}
function applyPreferencesPatch(current, patch) {
	const base = normalizePreferences(current);
	return {
		version: 2,
		pauseAll: patch.pauseAll ?? base.pauseAll,
		quietHours: {
			enabled: patch.quietHours?.enabled ?? base.quietHours.enabled,
			start: patch.quietHours?.start ?? base.quietHours.start,
			end: patch.quietHours?.end ?? base.quietHours.end
		},
		categories: mergeCategories({
			...base.categories,
			...patch.categories
		})
	};
}
var CATEGORY_LABELS = {
	tasks: {
		title: "Tasks & activity",
		description: "Assignments, updates, comments, and mentions on tasks."
	},
	collaboration: {
		title: "Collaboration",
		description: "Channel messages, threads, and @mentions."
	},
	ads: {
		title: "Ads & alerts",
		description: "ROAS drops, spend spikes, and automated ad performance alerts."
	},
	digest: {
		title: "Weekly digest",
		description: "Summary of workspace performance across platforms."
	},
	projects: {
		title: "Projects",
		description: "New projects and proposal deck readiness."
	},
	meetings: {
		title: "Meetings",
		description: "Scheduled, rescheduled, and cancelled meeting updates."
	}
};
//#endregion
export { isChannelEnabled as a, normalizePreferences as c, applyPreferencesPatch as i, DEFAULT_NOTIFICATION_PREFERENCES_V2 as n, isEmailPrefEnabled as o, NOTIFICATION_CATEGORIES as r, kindToCategory as s, CATEGORY_LABELS as t };
