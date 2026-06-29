import { o as __toESM } from "../_runtime.mjs";
import { S as require_jsx_runtime, x as require_react } from "../_libs/@convex-dev/better-auth+[...].mjs";
import { r as motion_exports } from "./motion-DtlbbvFg.mjs";
import { c as cn, h as formatRelativeTime$1 } from "./utils-hh4sibN0.mjs";
import { _ as motionDurationSeconds, p as interactiveTransitionClass, v as motionEasing } from "./motion-Cf6ujF0h.mjs";
import { t as Button } from "./button-BHcJlp0q.mjs";
import { F as Sparkles, It as Mic, Lt as MicOff } from "../_libs/lucide-react.mjs";
import { s as useVoiceInput } from "./use-voice-input-CLPTluum.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/use-client-relative-time-BtAGXTYW.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function TypingDots({ className }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
		className: cn("inline-flex items-center gap-1", className),
		"aria-hidden": true,
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "size-1.5 rounded-full bg-primary animate-subtle-dot-drift [animation-delay:0ms]" }, "typing-dot-0"),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "size-1.5 rounded-full bg-primary animate-subtle-dot-drift [animation-delay:150ms]" }, "typing-dot-150"),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "size-1.5 rounded-full bg-primary animate-subtle-dot-drift [animation-delay:300ms]" }, "typing-dot-300")
		]
	});
}
function ChatTypingIndicator({ label, variant = "bubble", icon, className }) {
	if (variant === "inline") return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("output", {
		className: cn("flex items-center gap-2 text-xs text-muted-foreground", className),
		"aria-live": "polite",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TypingDots, {}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: label })]
	});
	if (variant === "composer") return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("output", {
		className: cn("flex min-h-[1rem] items-center gap-2 text-[11px] leading-snug text-muted-foreground", className),
		"aria-live": "polite",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TypingDots, { className: "scale-90" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
			className: "truncate",
			children: label
		})]
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("output", {
		className: cn("flex items-end gap-2.5 px-1 py-2 motion-reduce:py-1", className),
		"aria-live": "polite",
		"aria-atomic": "true",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "flex size-8 shrink-0 items-center justify-center rounded-full bg-muted/60 ring-1 ring-border/50",
			children: icon ?? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Sparkles, {
				className: "size-4 text-primary",
				"aria-hidden": true
			})
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "max-w-[min(100%,20rem)] rounded-2xl rounded-tl-md border border-border/60 bg-card/95 px-4 py-3 shadow-sm",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex items-center gap-2.5",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TypingDots, {}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "text-sm text-muted-foreground",
					children: label
				})]
			})
		})]
	});
}
var INITIAL_FREQUENCIES = new Array(12).fill(0);
function createInitialAudioAnalyzerState() {
	return {
		volume: 0,
		frequencies: INITIAL_FREQUENCIES,
		isAnalyzing: false,
		error: null
	};
}
function audioAnalyzerReducer(state, action) {
	switch (action.type) {
		case "start": return {
			...state,
			isAnalyzing: true,
			error: null
		};
		case "update": return {
			...state,
			volume: action.volume,
			frequencies: action.frequencies
		};
		case "error": return {
			...state,
			isAnalyzing: false,
			error: action.message
		};
		case "stop": return {
			volume: 0,
			frequencies: INITIAL_FREQUENCIES,
			isAnalyzing: false,
			error: null
		};
		default: return state;
	}
}
function useAudioAnalyzer(isActive) {
	const [state, dispatch] = (0, import_react.useReducer)(audioAnalyzerReducer, void 0, createInitialAudioAnalyzerState);
	const audioContextRef = (0, import_react.useRef)(null);
	const analyzerRef = (0, import_react.useRef)(null);
	const sourceRef = (0, import_react.useRef)(null);
	const animationFrameRef = (0, import_react.useRef)(null);
	const streamRef = (0, import_react.useRef)(null);
	(0, import_react.useEffect)(() => {
		const stopAnalyzing = () => {
			if (animationFrameRef.current) {
				cancelAnimationFrame(animationFrameRef.current);
				animationFrameRef.current = null;
			}
			if (sourceRef.current) {
				sourceRef.current.disconnect();
				sourceRef.current = null;
			}
			if (audioContextRef.current && audioContextRef.current.state !== "closed") {
				audioContextRef.current.close();
				audioContextRef.current = null;
			}
			if (streamRef.current) {
				streamRef.current.getTracks().forEach((track) => track.stop());
				streamRef.current = null;
			}
			dispatch({ type: "stop" });
		};
		if (!isActive) {
			stopAnalyzing();
			return;
		}
		async function startAnalyzing() {
			try {
				if (typeof window === "undefined") return;
				if (!navigator?.mediaDevices?.getUserMedia) {
					dispatch({
						type: "error",
						message: "Microphone is not supported in this browser"
					});
					return;
				}
				const AudioContextCtor = window.AudioContext || window.webkitAudioContext;
				if (!AudioContextCtor) {
					dispatch({
						type: "error",
						message: "Audio analysis is not supported in this browser"
					});
					return;
				}
				const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
				streamRef.current = stream;
				const audioContext = new AudioContextCtor();
				audioContextRef.current = audioContext;
				const analyzer = audioContext.createAnalyser();
				analyzer.fftSize = 128;
				analyzer.smoothingTimeConstant = .6;
				analyzerRef.current = analyzer;
				const source = audioContext.createMediaStreamSource(stream);
				source.connect(analyzer);
				sourceRef.current = source;
				dispatch({ type: "start" });
				const bufferLength = analyzer.frequencyBinCount;
				const dataArray = new Uint8Array(bufferLength);
				const updateVolume = () => {
					if (!analyzerRef.current) return;
					analyzerRef.current.getByteFrequencyData(dataArray);
					const binCount = 12;
					const bins = new Array(binCount).fill(0);
					const samplesPerBin = Math.floor(bufferLength * .7 / binCount);
					for (let i = 0; i < binCount; i++) {
						let sum = 0;
						for (let j = 0; j < samplesPerBin; j++) sum += dataArray[i * samplesPerBin + j] || 0;
						bins[i] = sum / samplesPerBin / 255;
					}
					let totalSum = 0;
					for (let i = 0; i < bufferLength; i++) totalSum += dataArray[i];
					const average = totalSum / bufferLength;
					dispatch({
						type: "update",
						volume: Math.min(1, average / 128),
						frequencies: bins
					});
					animationFrameRef.current = requestAnimationFrame(updateVolume);
				};
				updateVolume();
			} catch (err) {
				console.error("Error accessing microphone:", err);
				dispatch({
					type: "error",
					message: "Failed to access microphone for visualization"
				});
			}
		}
		startAnalyzing();
		return () => {
			stopAnalyzing();
		};
	}, [isActive]);
	return state;
}
var waveformPulseDurationSeconds = motionDurationSeconds.xslow * 2;
function getWaveformAnimateProps(isActive, height) {
	return {
		height: isActive ? height : 8,
		opacity: isActive ? [
			.7,
			1,
			.7
		] : .3,
		backgroundColor: isActive ? "var(--primary)" : "var(--muted-foreground)"
	};
}
function getWaveformTransitionProps(delay) {
	return {
		height: {
			type: "spring",
			stiffness: 400,
			damping: 25,
			mass: .5
		},
		opacity: {
			duration: waveformPulseDurationSeconds,
			ease: motionEasing.inOut,
			repeat: Infinity,
			delay
		}
	};
}
function VoiceWaveform({ isActive, barCount = 12, className }) {
	const { frequencies } = useAudioAnalyzer(isActive);
	const bars = (() => {
		return (!isActive ? new Array(barCount).fill(8) : frequencies.map((freq, index) => {
			const baseHeight = 8;
			const dynamicHeight = Math.pow(freq, .8) * 40;
			const jitter = index % 5 * .75;
			return Math.max(baseHeight, dynamicHeight + jitter);
		})).map((height, index) => ({
			id: `wave-bar-${index}`,
			height,
			delay: index * .15
		}));
	})();
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(motion_exports.LazyMotion, {
		features: motion_exports.domAnimation,
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: `flex items-center justify-center gap-1.5 h-12 ${className || ""}`,
			children: bars.map((bar) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(motion_exports.m.div, {
				className: "w-2 bg-primary rounded-full transition-colors duration-[var(--motion-duration-fast)] ease-[var(--motion-ease-standard)] motion-reduce:transition-none",
				animate: getWaveformAnimateProps(isActive, bar.height),
				transition: getWaveformTransitionProps(bar.delay)
			}, bar.id))
		})
	});
}
function VoiceInputButton({ onTranscript, onInterimTranscript, disabled = false, className, variant = "inline", showWaveform = false }) {
	const onTranscriptRef = (0, import_react.useRef)(onTranscript);
	(0, import_react.useEffect)(() => {
		onTranscriptRef.current = onTranscript;
	}, [onTranscript]);
	const onInterimRef = (0, import_react.useRef)(onInterimTranscript);
	(0, import_react.useEffect)(() => {
		onInterimRef.current = onInterimTranscript;
	}, [onInterimTranscript]);
	const handleResult = (transcript) => {
		onTranscriptRef.current(transcript);
	};
	const { isSupported, isListening, toggleListening, transcript, error: voiceError, timeRemaining, clearError } = useVoiceInput({ onResult: handleResult });
	(0, import_react.useEffect)(() => {
		if (transcript && isListening && onInterimRef.current) onInterimRef.current(transcript);
	}, [transcript, isListening]);
	if (!isSupported) return null;
	if (variant === "inline") return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: cn("flex items-center gap-2", className),
		children: [showWaveform && isListening && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(VoiceWaveform, {
			isActive: isListening,
			barCount: 8,
			className: "h-8"
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
			type: "button",
			size: "sm",
			variant: isListening ? "destructive" : "ghost",
			onClick: toggleListening,
			disabled,
			className: cn("size-7 p-0", interactiveTransitionClass, isListening && "animate-pulse"),
			title: isListening ? `Stop listening (${timeRemaining}s)` : "Start voice input",
			"aria-label": isListening ? `Stop voice input${timeRemaining !== null ? `, ${timeRemaining} seconds left` : ""}` : "Start voice input",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Mic, { className: "size-3.5" })
		})]
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: cn("flex flex-col items-center", className),
		children: [
			showWaveform && isListening && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex flex-col items-center py-3",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(VoiceWaveform, { isActive: isListening }), timeRemaining !== null && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
					className: "mt-1 text-xs text-muted-foreground",
					children: [timeRemaining, "s remaining"]
				})]
			}),
			voiceError && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mb-2 flex items-center gap-2 text-xs",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-destructive flex-1",
					children: voiceError
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					variant: "ghost",
					size: "sm",
					onClick: clearError,
					className: "h-6 px-2 text-xs",
					children: "Dismiss"
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
				type: "button",
				variant: isListening ? "destructive" : "outline",
				size: "icon",
				onClick: toggleListening,
				disabled,
				className: cn("size-10 shrink-0 rounded-full", interactiveTransitionClass, isListening && "animate-pulse ring-2 ring-destructive/50"),
				title: isListening ? `Stop listening (${timeRemaining}s)` : "Start voice input",
				"aria-label": isListening ? `Stop voice input${timeRemaining !== null ? `, ${timeRemaining} seconds left` : ""}` : "Start voice input",
				children: isListening ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(MicOff, { className: "size-4" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Mic, { className: "size-4" })
			})
		]
	});
}
function subscribeClientMounted(onStoreChange) {
	onStoreChange();
	return () => void 0;
}
function getClientMountedSnapshot() {
	return true;
}
function getServerMountedSnapshot() {
	return false;
}
function formatClientRelativeTime(value) {
	if (value === null || value === void 0 || value === "") return null;
	return formatRelativeTime$1(value);
}
/**
* Relative time label safe for SSR — empty until after mount, then formatted client-side.
*/
function useClientRelativeTime(value) {
	if (!(0, import_react.useSyncExternalStore)(subscribeClientMounted, getClientMountedSnapshot, getServerMountedSnapshot)) return null;
	return formatClientRelativeTime(value);
}
function subscribeNow(onStoreChange) {
	const intervalId = window.setInterval(onStoreChange, 6e4);
	return () => window.clearInterval(intervalId);
}
function getNowMsSnapshot() {
	return Date.now();
}
/** Milliseconds since epoch on the client; `0` during SSR. */
function useClientNowMs() {
	const isMounted = (0, import_react.useSyncExternalStore)(subscribeClientMounted, getClientMountedSnapshot, getServerMountedSnapshot);
	const nowMs = (0, import_react.useSyncExternalStore)(subscribeNow, getNowMsSnapshot, () => 0);
	return isMounted ? nowMs : 0;
}
/** Current time, null during SSR and until mount. */
function useClientNow() {
	const nowMs = useClientNowMs();
	if (nowMs === 0) return null;
	return new Date(nowMs);
}
//#endregion
export { useClientRelativeTime as i, VoiceInputButton as n, useClientNow as r, ChatTypingIndicator as t };
