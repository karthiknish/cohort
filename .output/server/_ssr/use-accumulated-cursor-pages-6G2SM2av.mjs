import { o as __toESM } from "../_runtime.mjs";
import { x as require_react } from "../_libs/@convex-dev/better-auth+[...].mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/use-accumulated-cursor-pages-6G2SM2av.js
var import_react = /* @__PURE__ */ __toESM(require_react());
/** @internal Exported for unit tests. */
function areCursorsEqual(left, right) {
	if (left === right) return true;
	if (left === null || right === null) return false;
	return JSON.stringify(left) === JSON.stringify(right);
}
function useAccumulatedCursorPages({ scopeKey, queryData, loadCursor, setLoadCursor, enabled = true, getItemKey, parsePage, mergePages }) {
	const [isLoadingMore, setIsLoadingMore] = (0, import_react.useState)(false);
	const [nextPageCursor, setNextPageCursor] = (0, import_react.useState)(null);
	const [olderItems, setOlderItems] = (0, import_react.useState)([]);
	const getItemKeyRef = (0, import_react.useRef)(getItemKey);
	(0, import_react.useEffect)(() => {
		getItemKeyRef.current = getItemKey;
	}, [getItemKey]);
	const reset = () => {
		setLoadCursor(null);
		setIsLoadingMore(false);
		setNextPageCursor(null);
		setOlderItems([]);
	};
	(0, import_react.useEffect)(() => {
		reset();
	}, [reset, scopeKey]);
	const parsedPage = (() => {
		if (!enabled || queryData === void 0) return null;
		return parsePage(queryData);
	})();
	(0, import_react.useEffect)(() => {
		if (!enabled || queryData === void 0 || !parsedPage) return;
		const { items, nextCursor } = parsedPage;
		if (loadCursor === null) {
			setNextPageCursor((previous) => areCursorsEqual(previous, nextCursor) ? previous : nextCursor);
			return;
		}
		const resolveItemKey = getItemKeyRef.current;
		setOlderItems((previous) => {
			const seen = new Set(previous.map(resolveItemKey));
			const appended = [...previous];
			let didAppend = false;
			for (const item of items) {
				const key = resolveItemKey(item);
				if (seen.has(key)) continue;
				seen.add(key);
				appended.push(item);
				didAppend = true;
			}
			return didAppend ? appended : previous;
		});
		setNextPageCursor((previous) => areCursorsEqual(previous, nextCursor) ? previous : nextCursor);
		setLoadCursor(null);
		setIsLoadingMore(false);
	}, [
		enabled,
		loadCursor,
		parsedPage,
		queryData,
		setLoadCursor
	]);
	const mergedItems = mergePages(parsedPage?.items ?? [], olderItems);
	const isInitialLoading = enabled && queryData === void 0 && loadCursor === null;
	const loadMore = () => {
		if (!enabled || !nextPageCursor || isLoadingMore || isInitialLoading) return;
		setIsLoadingMore(true);
		setLoadCursor(nextPageCursor);
	};
	return {
		mergedItems,
		nextCursor: nextPageCursor,
		isInitialLoading,
		isLoadingMore,
		loadMore,
		reset
	};
}
//#endregion
export { useAccumulatedCursorPages as t };
