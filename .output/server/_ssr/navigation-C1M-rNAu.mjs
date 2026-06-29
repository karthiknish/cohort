import { o as __toESM } from "../_runtime.mjs";
import { x as require_react } from "../_libs/@convex-dev/better-auth+[...].mjs";
import { b as useParams, u as useRouterState, x as useRouter, y as useNavigate } from "../_libs/@tanstack/react-router+[...].mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/navigation-C1M-rNAu.js
var import_react = /* @__PURE__ */ __toESM(require_react());
/**
* Navigation hooks backed by TanStack Router, exposing the Next.js
* `next/navigation` API shape (`useRouter`, `usePathname`, `useSearchParams`,
* `useParams`, `redirect`, `permanentRedirect`) so existing call sites keep
* working under the TanStack Start build.
*/
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
function useRouter$1() {
	const navigate = useNavigate();
	const router = useRouter();
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
function useParams$1() {
	return useParams({ strict: false });
}
//#endregion
export { useSearchParams as i, usePathname as n, useRouter$1 as r, useParams$1 as t };
