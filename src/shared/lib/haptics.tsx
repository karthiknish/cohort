'use client';
/**
 * Web haptics layer — thin wrapper around `web-haptics` that adds:
 *  - a process-safe singleton (so non-React code like `notifySuccess` can fire haptics)
 *  - semantic presets mapped to app events (success / error / warning / selection / impact)
 *  - preference gating (localStorage flag) + automatic disable under `prefers-reduced-motion`
 *  - a `useHaptics` hook + `HapticsProvider` for React consumers
 *
 * Import from `@/shared/lib/haptics`. Do not import `web-haptics` directly in app code.
 */
import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode, } from 'react';
import { WebHaptics, type HapticInput, type TriggerOptions, type Vibration, } from 'web-haptics';

const STORAGE_KEY = 'cohorts:haptics-enabled';
const REDUCED_MOTION_QUERY = '(prefers-reduced-motion: reduce)';

// --- Semantic patterns -------------------------------------------------------
// Light selection tick — used for tabs, switches, checkboxes, radio, list taps.
const SELECTION_PATTERN: Vibration[] = [{ duration: 18, intensity: 0.3 }];
// Impact presets — button presses, card taps, drag-release.
const IMPACT_LIGHT: Vibration[] = [{ duration: 12, intensity: 0.4 }];
const IMPACT_MEDIUM: Vibration[] = [{ duration: 22, intensity: 0.6 }];
const IMPACT_HEAVY: Vibration[] = [{ duration: 40, intensity: 0.9 }];
// Soft tick — pull-to-refresh threshold cross, scroll snap.
const TICK_PATTERN: Vibration[] = [{ duration: 10, intensity: 0.25 }];

export type HapticPresetName =
  | 'success'
  | 'error'
  | 'warning'
  | 'selection'
  | 'tick'
  | 'impact-light'
  | 'impact-medium'
  | 'impact-heavy'
  | 'buzz';

const PRESET_INPUT: Record<HapticPresetName, HapticInput> = {
  success: 'success',
  error: 'error',
  warning: 'nudge',
  selection: SELECTION_PATTERN,
  tick: TICK_PATTERN,
  'impact-light': IMPACT_LIGHT,
  'impact-medium': IMPACT_MEDIUM,
  'impact-heavy': IMPACT_HEAVY,
  buzz: 'buzz',
};

// --- Singleton ---------------------------------------------------------------
let instance: WebHaptics | null = null;
let userEnabled = true;
let reducedMotion = false;

function readStoredPreference(): boolean {
  if (typeof window === 'undefined') return true;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (raw === 'false') return false;
    if (raw === 'true') return true;
  } catch {
    // localStorage may be unavailable (private mode) — default to enabled.
  }
  return true;
}

function readReducedMotion(): boolean {
  if (typeof window === 'undefined' || !window.matchMedia) return false;
  return window.matchMedia(REDUCED_MOTION_QUERY).matches;
}

function getInstance(): WebHaptics | null {
  if (typeof window === 'undefined') return null;
  if (!WebHaptics.isSupported) return null;
  if (!instance) instance = new WebHaptics();
  return instance;
}

/** Internal: keep module-level flags in sync. Called by the provider on mount/change. */
export function __setHapticsPreference(enabled: boolean): void {
  userEnabled = enabled;
}

/** Whether haptics can fire right now (supported + enabled + not reduced motion). */
export function isHapticsActive(): boolean {
  if (typeof window === 'undefined') return false;
  if (!WebHaptics.isSupported) return false;
  if (reducedMotion) return false;
  return userEnabled;
}

export function isHapticsSupported(): boolean {
  if (typeof window === 'undefined') return false;
  return WebHaptics.isSupported;
}

/**
 * Fire-and-forget haptic trigger. Safe to call from any context (event handlers,
 * module-level notification helpers, gesture callbacks). No-ops when unsupported,
 * disabled, or under reduced-motion.
 */
export function triggerHaptic(input?: HapticInput, options?: TriggerOptions): void {
  if (!isHapticsActive()) return;
  const haptics = getInstance();
  if (!haptics) return;
  // `trigger` returns a Promise; we intentionally do not await — haptics are
  // fire-and-forget tactile cues and must never block UI or error handlers.
  void haptics.trigger(input, options);
}

/** Trigger a named semantic preset. */
export function triggerHapticPreset(preset: HapticPresetName, options?: TriggerOptions): void {
  triggerHaptic(PRESET_INPUT[preset], options);
}

// --- Semantic helpers (callable from non-React code) -------------------------
export const hapticSuccess = (options?: TriggerOptions) => triggerHapticPreset('success', options);
export const hapticError = (options?: TriggerOptions) => triggerHapticPreset('error', options);
export const hapticWarning = (options?: TriggerOptions) => triggerHapticPreset('warning', options);
export const hapticSelection = (options?: TriggerOptions) => triggerHapticPreset('selection', options);
export const hapticTick = (options?: TriggerOptions) => triggerHapticPreset('tick', options);
export const hapticBuzz = (options?: TriggerOptions) => triggerHapticPreset('buzz', options);
export function hapticImpact(level: 'light' | 'medium' | 'heavy' = 'light', options?: TriggerOptions): void {
  triggerHapticPreset(level === 'light' ? 'impact-light' : level === 'medium' ? 'impact-medium' : 'impact-heavy', options);
}

// --- React context -----------------------------------------------------------
interface HapticsContextValue {
  /** Whether the user has haptics enabled in preferences (independent of support/reduced-motion). */
  enabled: boolean;
  /** Persist and apply a new preference. */
  setEnabled: (enabled: boolean) => void;
  /** Whether the device supports the Vibration API. */
  supported: boolean;
  /** Whether haptics will actually fire (supported + enabled + not reduced motion). */
  active: boolean;
}

const HapticsContext = createContext<HapticsContextValue | null>(null);

export interface HapticsProviderProps {
  children: ReactNode;
}

/**
 * Mounts once near the app root. Reads the stored preference, keeps the
 * module-level flags in sync, and listens for `prefers-reduced-motion` changes
 * and cross-tab storage updates.
 */
export function HapticsProvider({ children }: HapticsProviderProps) {
  const [enabled, setEnabledState] = useState(true);
  const [supported, setSupported] = useState(false);
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    setSupported(isHapticsSupported());
    setReduced(reducedMotion = readReducedMotion());
    const stored = readStoredPreference();
    userEnabled = stored;
    setEnabledState(stored);
    setReduced(reducedMotion);

    const mq = window.matchMedia(REDUCED_MOTION_QUERY);
    const onMotionChange = (e: MediaQueryListEvent) => {
      reducedMotion = e.matches;
      setReduced(e.matches);
    };
    mq.addEventListener('change', onMotionChange);

    const onStorage = (e: StorageEvent) => {
      if (e.key === STORAGE_KEY) {
        const next = readStoredPreference();
        userEnabled = next;
        setEnabledState(next);
      }
    };
    window.addEventListener('storage', onStorage);

    return () => {
      mq.removeEventListener('change', onMotionChange);
      window.removeEventListener('storage', onStorage);
    };
  }, []);

  const setEnabled = useCallback((next: boolean) => {
    userEnabled = next;
    setEnabledState(next);
    try {
      window.localStorage.setItem(STORAGE_KEY, String(next));
    } catch {
      // Ignore persistence failures (private mode).
    }
  }, []);

  const value = useMemo<HapticsContextValue>(
    () => ({
      enabled,
      setEnabled,
      supported,
      active: supported && enabled && !reduced,
    }),
    [enabled, setEnabled, supported, reduced],
  );

  return <HapticsContext.Provider value={value}>{children}</HapticsContext.Provider>;
}

/** Read haptics preference + support state. */
export function useHapticsSettings(): HapticsContextValue {
  const ctx = useContext(HapticsContext);
  if (!ctx) {
    // Safe fallback when used outside the provider (e.g. during SSR / tests).
    return {
      enabled: true,
      setEnabled: () => {},
      supported: false,
      active: false,
    };
  }
  return ctx;
}

// --- React hook --------------------------------------------------------------
/**
 * Stable haptic triggers for use in components. Returns semantic helpers bound
 * to the singleton so identity is stable across renders. All calls no-op when
 * haptics are inactive (unsupported / disabled / reduced motion).
 */
export interface HapticsApi {
  trigger: (input?: HapticInput, options?: TriggerOptions) => void;
  preset: (preset: HapticPresetName, options?: TriggerOptions) => void;
  success: () => void;
  error: () => void;
  warning: () => void;
  selection: () => void;
  tick: () => void;
  buzz: () => void;
  impact: (level?: 'light' | 'medium' | 'heavy') => void;
}

const STABLE_API: HapticsApi = {
  trigger: triggerHaptic,
  preset: triggerHapticPreset,
  success: hapticSuccess,
  error: hapticError,
  warning: hapticWarning,
  selection: hapticSelection,
  tick: hapticTick,
  buzz: hapticBuzz,
  impact: hapticImpact,
};

export function useHaptics(): HapticsApi {
  // The trigger functions read module-level flags (`userEnabled`, `reducedMotion`)
  // at call time, which the provider keeps live via matchMedia + storage listeners.
  // No subscription is needed here — calls always reflect the current preference.
  return STABLE_API;
}

/**
 * Wraps a press handler with a haptic. Returns a stable callback that fires the
 * preset then invokes the original handler. Useful for ad-hoc buttons that don't
 * go through `MotionPressable`.
 */
export function useHapticPress<E extends React.SyntheticEvent>(
  handler: (e: E) => void,
  preset: HapticPresetName = 'impact-light',
): (e: E) => void {
  const haptics = useHaptics();
  return useCallback(
    (e: E) => {
      haptics.preset(preset);
      handler(e);
    },
    [haptics, handler, preset],
  );
}
