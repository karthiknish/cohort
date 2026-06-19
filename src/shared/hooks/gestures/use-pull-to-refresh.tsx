import { useRef, useReducer, useEffect, useEffectEvent } from 'react';
export interface PullToRefreshOptions {
    threshold?: number;
    onRefresh: () => Promise<void> | void;
    disabled?: boolean;
}
export interface PullToRefreshState {
    isPulling: boolean;
    isRefreshing: boolean;
    pullDistance: number;
    progress: number;
}
type PullToRefreshAction = {
    type: 'start-pull';
    pullDistance: number;
    progress: number;
} | {
    type: 'reset-pull';
} | {
    type: 'start-refresh';
} | {
    type: 'finish-refresh';
};
const DEFAULT_THRESHOLD = 80;
const INITIAL_PULL_TO_REFRESH_STATE: PullToRefreshState = {
    isPulling: false,
    isRefreshing: false,
    pullDistance: 0,
    progress: 0,
};
function pullToRefreshReducer(state: PullToRefreshState, action: PullToRefreshAction): PullToRefreshState {
    switch (action.type) {
        case 'start-pull':
            return {
                isPulling: true,
                isRefreshing: false,
                pullDistance: action.pullDistance,
                progress: action.progress,
            };
        case 'reset-pull':
            return {
                ...state,
                isPulling: false,
                pullDistance: 0,
                progress: 0,
            };
        case 'start-refresh':
            return {
                ...state,
                isPulling: false,
                isRefreshing: true,
            };
        case 'finish-refresh':
            return {
                ...state,
                isRefreshing: false,
                pullDistance: 0,
                progress: 0,
            };
        default:
            return state;
    }
}
function getPullToRefreshContainerStyle(pullDistance: number, threshold: number, progress: number) {
    return {
        height: Math.min(pullDistance, threshold),
        opacity: Math.min(progress * 2, 1),
    };
}
function getPullToRefreshSpinnerStyle(progress: number) {
    return {
        transform: `rotate(${progress * 360}deg)`,
    };
}
export function usePullToRefresh(ref: React.RefObject<HTMLElement | null>, options: PullToRefreshOptions) {
    const threshold = options.threshold ?? DEFAULT_THRESHOLD;
    const onRefresh = options.onRefresh;
    const disabled = options.disabled ?? false;
    const [state, dispatch] = useReducer(pullToRefreshReducer, INITIAL_PULL_TO_REFRESH_STATE);
    const stateRef = useRef(state);
    useEffect(() => {
        stateRef.current = state;
    });
    const startYRef = useRef<number>(0);
    const pullingRef = useRef<boolean>(false);
    const handleRefresh = useEffectEvent(() => {
        if (stateRef.current.isRefreshing)
            return;
        dispatch({ type: 'start-refresh' });
        void Promise.resolve(onRefresh())
            .finally(() => {
            dispatch({ type: 'finish-refresh' });
        });
    });
    useEffect(() => {
        if (disabled)
            return;
        const element = ref.current;
        if (!element)
            return;
        const previousCssText = element.style.cssText;
        element.style.cssText = `${previousCssText};touch-action:pan-x;overscroll-behavior-y:contain`;
        const handleTouchStart = (e: TouchEvent) => {
            if (element.scrollTop <= 0 && e.touches.length === 1) {
                startYRef.current = e.touches[0]!.clientY;
                pullingRef.current = true;
            }
        };
        const handleTouchMove = (e: TouchEvent) => {
            if (!pullingRef.current || stateRef.current.isRefreshing)
                return;
            const currentY = e.touches[0]!.clientY;
            const deltaY = currentY - startYRef.current;
            if (deltaY > 0 && element.scrollTop <= 0) {
                const pullDistance = Math.min(deltaY * 0.5, threshold * 1.5);
                const progress = Math.min(pullDistance / threshold, 1);
                dispatch({ type: 'start-pull', pullDistance, progress });
            }
            else {
                pullingRef.current = false;
                dispatch({ type: 'reset-pull' });
            }
        };
        const handleTouchEnd = () => {
            pullingRef.current = false;
            if (stateRef.current.progress >= 1 && !stateRef.current.isRefreshing) {
                handleRefresh();
            }
            else {
                dispatch({ type: 'reset-pull' });
            }
        };
        element.addEventListener('touchstart', handleTouchStart, { passive: true });
        element.addEventListener('touchmove', handleTouchMove, { passive: true });
        element.addEventListener('touchend', handleTouchEnd, { passive: true });
        return () => {
            element.style.cssText = previousCssText;
            element.removeEventListener('touchstart', handleTouchStart);
            element.removeEventListener('touchmove', handleTouchMove);
            element.removeEventListener('touchend', handleTouchEnd);
        };
    }, [disabled, ref, threshold]);
    return state;
}
export interface PullToRefreshIndicatorProps {
    state: PullToRefreshState;
    threshold?: number;
}
export function PullToRefreshIndicator({ state, threshold = DEFAULT_THRESHOLD }: PullToRefreshIndicatorProps) {
    const { isPulling, isRefreshing, pullDistance, progress } = state;
    if (!isPulling && !isRefreshing)
        return null;
    return (<div className="absolute top-0 left-0 right-0 flex justify-center items-center overflow-hidden pointer-events-none z-10" style={getPullToRefreshContainerStyle(pullDistance, threshold, progress)}>
      <div className={`transition-transform duration-200 ${isRefreshing ? 'animate-spin' : ''}`} style={getPullToRefreshSpinnerStyle(progress)}>
        <svg className="size-6 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/>
        </svg>
      </div>
    </div>);
}
