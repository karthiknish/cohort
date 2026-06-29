import { o as __toESM } from "../_runtime.mjs";
import { x as require_react } from "../_libs/@convex-dev/better-auth+[...].mjs";
import { n as usePathname, r as useRouter$1 } from "./navigation-C1M-rNAu.mjs";
import { r as useUrlSearchParamsContext } from "./use-url-search-params-CvniTNfQ.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/use-persisted-tab-DQyLv5Zj.js
var import_react = /* @__PURE__ */ __toESM(require_react());
function isAllowed(allowed, candidate) {
	if (!candidate) return false;
	return allowed.includes(candidate);
}
function subscribeClientMounted(onStoreChange) {
	onStoreChange();
	return () => void 0;
}
function usePersistedTab(options) {
	const { param = "tab", defaultValue, allowedValues, storageNamespace, syncToUrl = true } = options;
	const router = useRouter$1();
	const pathname = usePathname();
	const searchParams = useUrlSearchParamsContext();
	const storageKey = (() => {
		return `${storageNamespace ? `${storageNamespace}:` : ""}${pathname}:${param}`;
	})();
	const [pickedValue, setPickedValue] = (0, import_react.useState)(null);
	const hasMounted = (0, import_react.useSyncExternalStore)(() => () => {}, () => true, () => false);
	const allowedValuesRef = (0, import_react.useRef)(allowedValues);
	const defaultValueRef = (0, import_react.useRef)(defaultValue);
	(0, import_react.useEffect)(() => {
		allowedValuesRef.current = allowedValues;
		defaultValueRef.current = defaultValue;
	}, [allowedValues, defaultValue]);
	const hydratedValue = (0, import_react.useSyncExternalStore)(subscribeClientMounted, () => {
		const fromUrl = searchParams.get(param);
		if (isAllowed(allowedValuesRef.current, fromUrl)) return fromUrl;
		try {
			const fromStorage = window.localStorage.getItem(storageKey);
			if (isAllowed(allowedValuesRef.current, fromStorage)) return fromStorage;
		} catch {}
		return defaultValueRef.current;
	}, () => defaultValueRef.current);
	const value = (() => {
		const candidate = hasMounted ? pickedValue ?? hydratedValue : defaultValue;
		return isAllowed(allowedValues, candidate) ? candidate : defaultValue;
	})();
	const isSyncingToUrlRef = (0, import_react.useRef)(false);
	const setValue = (next) => {
		const currentAllowed = allowedValuesRef.current;
		const currentDefault = defaultValueRef.current;
		if (!isAllowed(currentAllowed, next)) {
			setPickedValue(currentDefault);
			return;
		}
		setPickedValue((prev) => {
			if (prev === next) return prev;
			return next;
		});
		try {
			window.localStorage.setItem(storageKey, next);
		} catch {}
		if (!syncToUrl) return;
		if (isSyncingToUrlRef.current) return;
		if (searchParams.get(param) === next) return;
		isSyncingToUrlRef.current = true;
		const params = new URLSearchParams(searchParams.toString());
		params.set(param, next);
		const queryString = params.toString();
		setTimeout(() => {
			router.replace(queryString ? `${pathname}?${queryString}` : pathname, { scroll: false });
			isSyncingToUrlRef.current = false;
		}, 0);
	};
	return {
		value,
		setValue
	};
}
//#endregion
export { usePersistedTab as t };
