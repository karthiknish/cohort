//#region node_modules/.nitro/vite/services/ssr/assets/meta-datetime-S4MKjvYm.js
/** Convert a browser `datetime-local` value to Meta-compatible ISO 8601 UTC. */
function metaDatetimeLocalToIso(value) {
	const trimmed = value.trim();
	if (!trimmed) return void 0;
	const parsed = new Date(trimmed);
	if (Number.isNaN(parsed.getTime())) return void 0;
	return parsed.toISOString();
}
/** Convert Meta ISO timestamp to `datetime-local` input value (local timezone). */
function metaIsoToDatetimeLocal(value) {
	if (!value?.trim()) return "";
	const parsed = new Date(value);
	if (Number.isNaN(parsed.getTime())) return "";
	const pad = (n) => String(n).padStart(2, "0");
	return `${parsed.getFullYear()}-${pad(parsed.getMonth() + 1)}-${pad(parsed.getDate())}T${pad(parsed.getHours())}:${pad(parsed.getMinutes())}`;
}
//#endregion
export { metaIsoToDatetimeLocal as n, metaDatetimeLocalToIso as t };
