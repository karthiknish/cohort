import { o as __toESM } from "../_runtime.mjs";
import { S as require_jsx_runtime, x as require_react } from "../_libs/@convex-dev/better-auth+[...].mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/use-keyboard-shortcuts-CjHWs-Qm.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var SEQUENCE_TIMEOUT_MS = 1200;
function parseCombo(combo) {
	const parts = combo.toLowerCase().split("+").map((p) => p.trim());
	const key = parts.pop() || "";
	const modifiers = new Set(parts);
	const isMac = typeof navigator !== "undefined" && /Mac|iPod|iPhone|iPad/.test(navigator.platform);
	if (modifiers.has("mod")) {
		modifiers.delete("mod");
		modifiers.add(isMac ? "meta" : "ctrl");
	}
	if (modifiers.has("cmd") || modifiers.has("meta")) {
		modifiers.delete("cmd");
		modifiers.delete("meta");
		modifiers.add("meta");
	}
	return {
		modifiers,
		key
	};
}
function matchesCombo(event, combo) {
	const { modifiers, key } = parseCombo(combo);
	const eventKey = event.key.toLowerCase();
	const eventModifiers = /* @__PURE__ */ new Set();
	if (event.ctrlKey) eventModifiers.add("ctrl");
	if (event.metaKey) eventModifiers.add("meta");
	if (event.shiftKey) eventModifiers.add("shift");
	if (event.altKey) eventModifiers.add("alt");
	const keyMatches = eventKey === key || event.code.toLowerCase() === key || event.code.toLowerCase() === `key${key}`;
	const modifiersMatch = modifiers.size === eventModifiers.size && [...modifiers].every((m) => eventModifiers.has(m));
	return keyMatches && modifiersMatch;
}
function getSequenceSteps(combo) {
	return combo.trim().split(/\s+/).filter(Boolean);
}
function matchesShortcutCombo(event, combo, sequenceStates, stateKey) {
	const steps = getSequenceSteps(combo);
	const firstStep = steps[0];
	if (!firstStep) {
		sequenceStates.delete(stateKey);
		return "none";
	}
	const state = sequenceStates.get(stateKey);
	const now = Date.now();
	const resetProgress = !state || now - state.lastMatchedAt > SEQUENCE_TIMEOUT_MS ? 0 : state.progress;
	if (matchesCombo(event, steps[resetProgress] ?? firstStep)) {
		if (steps.length === 1 || resetProgress === steps.length - 1) {
			sequenceStates.delete(stateKey);
			return "complete";
		}
		sequenceStates.set(stateKey, {
			progress: resetProgress + 1,
			lastMatchedAt: now
		});
		return "partial";
	}
	if (resetProgress > 0 && matchesCombo(event, firstStep)) {
		if (steps.length === 1) {
			sequenceStates.delete(stateKey);
			return "complete";
		}
		sequenceStates.set(stateKey, {
			progress: 1,
			lastMatchedAt: now
		});
		return "partial";
	}
	if (resetProgress > 0) sequenceStates.delete(stateKey);
	return "none";
}
function useKeyboardShortcut(shortcut, options = {}) {
	const { enabled = true, targetRef, allowInInput = false } = options;
	const callbackRef = (0, import_react.useRef)(shortcut.callback);
	const sequenceStatesRef = (0, import_react.useRef)(null);
	if (sequenceStatesRef.current === null) sequenceStatesRef.current = /* @__PURE__ */ new Map();
	(0, import_react.useEffect)(() => {
		callbackRef.current = shortcut.callback;
	}, [shortcut.callback]);
	const handleKeyDown = (0, import_react.useEffectEvent)((event) => {
		if (!enabled || shortcut.enabled === false) return;
		const target = event.target;
		const isInput = [
			"INPUT",
			"TEXTAREA",
			"SELECT"
		].includes(target.tagName) || target.isContentEditable;
		const combos = Array.isArray(shortcut.combo) ? shortcut.combo : [shortcut.combo];
		const isEscape = combos.some((c) => c.toLowerCase() === "escape");
		if (isInput && !isEscape && !allowInInput) return;
		for (const [comboIndex, combo] of combos.entries()) {
			const matchState = matchesShortcutCombo(event, combo, sequenceStatesRef.current, `${comboIndex}:${combo}`);
			if (matchState === "partial") {
				if (shortcut.preventDefault !== false) event.preventDefault();
				return;
			}
			if (matchState === "complete") {
				if (shortcut.preventDefault !== false) event.preventDefault();
				callbackRef.current(event);
				return;
			}
		}
	});
	(0, import_react.useEffect)(() => {
		const target = targetRef?.current || document;
		const listener = (event) => handleKeyDown(event);
		target.addEventListener("keydown", listener);
		return () => {
			target.removeEventListener("keydown", listener);
		};
	}, [
		allowInInput,
		enabled,
		shortcut.combo,
		shortcut.enabled,
		targetRef
	]);
}
function useKeyboardShortcuts(shortcuts, options = {}) {
	const { enabled = true, targetRef, allowInInput = false } = options;
	const sequenceStatesRef = (0, import_react.useRef)(null);
	if (sequenceStatesRef.current === null) sequenceStatesRef.current = /* @__PURE__ */ new Map();
	const shortcutsRef = (0, import_react.useRef)(shortcuts);
	(0, import_react.useEffect)(() => {
		shortcutsRef.current = shortcuts;
	}, [shortcuts]);
	const handleKeyDown = (0, import_react.useEffectEvent)((event) => {
		if (!enabled) return;
		const target = event.target;
		const isInput = [
			"INPUT",
			"TEXTAREA",
			"SELECT"
		].includes(target.tagName) || target.isContentEditable;
		for (const shortcut of shortcutsRef.current) {
			if (shortcut.enabled === false) continue;
			const combos = Array.isArray(shortcut.combo) ? shortcut.combo : [shortcut.combo];
			const isEscape = combos.some((c) => c.toLowerCase() === "escape");
			if (isInput && !isEscape && !allowInInput) continue;
			for (const [comboIndex, combo] of combos.entries()) {
				const matchState = matchesShortcutCombo(event, combo, sequenceStatesRef.current, `${shortcut.description ?? shortcut.callback.name ?? "shortcut"}:${comboIndex}:${combo}`);
				if (matchState === "partial") {
					if (shortcut.preventDefault !== false) event.preventDefault();
					return;
				}
				if (matchState === "complete") {
					if (shortcut.preventDefault !== false) event.preventDefault();
					shortcut.callback(event);
					return;
				}
			}
		}
	});
	(0, import_react.useEffect)(() => {
		const target = targetRef?.current || document;
		const listener = (event) => handleKeyDown(event);
		target.addEventListener("keydown", listener);
		return () => {
			target.removeEventListener("keydown", listener);
		};
	}, [
		allowInInput,
		enabled,
		targetRef
	]);
}
function KeyboardShortcutBadge({ combo, className }) {
	const isMac = typeof navigator !== "undefined" && /Mac|iPod|iPhone|iPad/.test(navigator.platform);
	const parts = combo.split("+");
	const tokenCounts = /* @__PURE__ */ new Map();
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("kbd", {
		className: `inline-flex items-center gap-0.5 ${className || ""}`,
		children: parts.map((part) => {
			const p = part.toLowerCase().trim();
			const occurrence = (tokenCounts.get(p) ?? 0) + 1;
			tokenCounts.set(p, occurrence);
			let display = p.toUpperCase();
			if (p === "mod") display = isMac ? "⌘" : "Ctrl";
			else if (p === "cmd" || p === "meta") display = isMac ? "⌘" : "Ctrl";
			else if (p === "ctrl") display = isMac ? "⌃" : "Ctrl";
			else if (p === "alt") display = isMac ? "⌥" : "Alt";
			else if (p === "shift") display = isMac ? "⇧" : "Shift";
			return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "inline-flex h-5 min-w-5 items-center justify-center rounded border border-muted-foreground/30 bg-muted px-1 text-[10px] font-medium text-muted-foreground",
				children: display
			}, `${p}-${occurrence}`);
		})
	});
}
//#endregion
export { useKeyboardShortcut as n, useKeyboardShortcuts as r, KeyboardShortcutBadge as t };
