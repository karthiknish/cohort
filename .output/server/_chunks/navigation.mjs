import { o as __toESM } from "../_runtime.mjs";
import { x as require_react } from "../_libs/@convex-dev/better-auth+[...].mjs";
import { P as redirect$1, b as useParams$1, u as useRouterState, x as useRouter$1, y as useNavigate } from "../_libs/@tanstack/react-router+[...].mjs";
//#region src/shared/ui/navigation.ts
var import_react = /* @__PURE__ */ __toESM(require_react(), 1);
function usePathname() {
	return useRouterState({ select: (s) => s.location.pathname });
}
function useSearchParams() {
	const search = useRouterState({ select: (s) => s.location.search });
	return (0, import_react.useMemo)(() => {
		const params = new URLSearchParams();
		for (const [key, value] of Object.entries(search ?? {})) {
			if (value == null) continue;
			if (Array.isArray(value)) for (const v of value) params.append(key, String(v));
			else params.set(key, String(value));
		}
		return params;
	}, [search]);
}
function useRouter() {
	const navigate = useNavigate();
	const router = useRouter$1();
	return {
		push: (href, opts) => void navigate({
			to: href,
			...opts
		}),
		replace: (href, opts) => void navigate({
			to: href,
			replace: true,
			...opts
		}),
		back: () => router.history.back(),
		forward: () => router.history.forward(),
		refresh: () => void router.invalidate(),
		prefetch: (href) => {
			if (href) router.preloadRoute({ to: href });
		}
	};
}
function redirect(url, _type) {
	throw redirect$1({ to: typeof url === "string" ? url : url.href });
}
function useParams() {
	return useParams$1({ strict: false });
}
//#endregion
export { useSearchParams as a, useRouter as i, useParams as n, usePathname as r, redirect as t };
