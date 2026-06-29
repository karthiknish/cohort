//#region node_modules/.nitro/vite/services/ssr/assets/pagination-DHcNSy7D.js
function parsePageSize(raw, opts) {
	const parsed = typeof raw === "number" ? raw : Number(raw);
	const value = Number.isFinite(parsed) ? Math.floor(parsed) : opts.defaultValue;
	return Math.min(Math.max(value, 1), Math.max(1, Math.floor(opts.max)));
}
function encodeTimestampIdCursor(time, id) {
	return `${typeof time === "string" ? time : time instanceof Date ? time.toISOString() : time.toDate().toISOString()}|${id}`;
}
function decodeTimestampIdCursor(cursor) {
	if (!cursor) return null;
	const [cursorTime, cursorId] = cursor.split("|");
	if (!cursorTime || !cursorId) return null;
	const date = new Date(cursorTime);
	if (Number.isNaN(date.getTime())) return null;
	return {
		time: date,
		id: cursorId
	};
}
//#endregion
export { encodeTimestampIdCursor as n, parsePageSize as r, decodeTimestampIdCursor as t };
