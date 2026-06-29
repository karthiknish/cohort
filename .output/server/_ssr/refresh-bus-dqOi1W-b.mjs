//#region node_modules/.nitro/vite/services/ssr/assets/refresh-bus-dqOi1W-b.js
var PROJECT_STATUSES = [
	"planning",
	"active",
	"on_hold",
	"completed"
];
var EVENT_NAME = "cohorts:dashboard-refresh";
var BC_NAME = "cohorts-dashboard-refresh";
function getEventTarget() {
	if (typeof window === "undefined") return null;
	const anyWindow = window;
	if (!anyWindow.__cohortsRefreshTarget) anyWindow.__cohortsRefreshTarget = new EventTarget();
	return anyWindow.__cohortsRefreshTarget;
}
function emitDashboardRefresh(detail = { reason: "unknown" }) {
	if (typeof window === "undefined") return;
	const payload = {
		at: typeof detail.at === "number" ? detail.at : Date.now(),
		reason: detail.reason ?? "unknown",
		clientId: typeof detail.clientId === "undefined" ? void 0 : detail.clientId
	};
	const target = getEventTarget();
	if (target) target.dispatchEvent(new CustomEvent(EVENT_NAME, { detail: payload }));
	try {
		const bc = new BroadcastChannel(BC_NAME);
		bc.postMessage(payload);
		bc.close();
	} catch {}
}
function onDashboardRefresh(handler) {
	const target = getEventTarget();
	if (!target) return () => {};
	const listener = (event) => {
		const custom = event;
		if (!custom?.detail) return;
		handler(custom.detail);
	};
	target.addEventListener(EVENT_NAME, listener);
	let bc = null;
	try {
		bc = new BroadcastChannel(BC_NAME);
		bc.onmessage = (msg) => {
			const data = msg?.data;
			if (!data) return;
			handler(data);
		};
	} catch {
		bc = null;
	}
	return () => {
		target.removeEventListener(EVENT_NAME, listener);
		try {
			bc?.close();
		} catch {}
	};
}
//#endregion
export { emitDashboardRefresh as n, onDashboardRefresh as r, PROJECT_STATUSES as t };
