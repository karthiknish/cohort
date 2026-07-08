'use client';
import { useEffect, useRef, useReducer } from 'react';
import { logger } from '@/lib/logger';
export interface UseAudioAnalyzerReturn {
    volume: number;
    frequencies: number[];
    isAnalyzing: boolean;
    error: string | null;
}
type AudioAnalyzerState = {
    volume: number;
    frequencies: number[];
    isAnalyzing: boolean;
    error: string | null;
};
type AudioAnalyzerAction = {
    type: 'start';
} | {
    type: 'update';
    volume: number;
    frequencies: number[];
} | {
    type: 'error';
    message: string;
} | {
    type: 'stop';
};
const INITIAL_FREQUENCIES = new Array(12).fill(0);
function createInitialAudioAnalyzerState(): AudioAnalyzerState {
    return {
        volume: 0,
        frequencies: INITIAL_FREQUENCIES,
        isAnalyzing: false,
        error: null,
    };
}
function audioAnalyzerReducer(state: AudioAnalyzerState, action: AudioAnalyzerAction): AudioAnalyzerState {
    switch (action.type) {
        case 'start':
            return { ...state, isAnalyzing: true, error: null };
        case 'update':
            return { ...state, volume: action.volume, frequencies: action.frequencies };
        case 'error':
            return { ...state, isAnalyzing: false, error: action.message };
        case 'stop':
            return {
                volume: 0,
                frequencies: INITIAL_FREQUENCIES,
                isAnalyzing: false,
                error: null,
            };
        default:
            return state;
    }
}
export function useAudioAnalyzer(isActive: boolean): UseAudioAnalyzerReturn {
    const [state, dispatch] = useReducer(audioAnalyzerReducer, undefined, createInitialAudioAnalyzerState);
    const audioContextRef = useRef<AudioContext | null>(null);
    const analyzerRef = useRef<AnalyserNode | null>(null);
    const sourceRef = useRef<MediaStreamAudioSourceNode | null>(null);
    const animationFrameRef = useRef<number | null>(null);
    const streamRef = useRef<MediaStream | null>(null);
    useEffect(() => {
        const stopAnalyzing = () => {
            if (animationFrameRef.current) {
                cancelAnimationFrame(animationFrameRef.current);
                animationFrameRef.current = null;
            }
            if (sourceRef.current) {
                sourceRef.current.disconnect();
                sourceRef.current = null;
            }
            if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
                audioContextRef.current.close();
                audioContextRef.current = null;
            }
            if (streamRef.current) {
                streamRef.current.getTracks().forEach(track => track.stop());
                streamRef.current = null;
            }
            dispatch({ type: 'stop' });
        };
        if (!isActive) {
            stopAnalyzing();
            return;
        }
        async function startAnalyzing() {
            try {
                if (typeof window === 'undefined') {
                    return;
                }
                if (!navigator?.mediaDevices?.getUserMedia) {
                    dispatch({ type: 'error', message: 'Microphone is not supported in this browser' });
                    return;
                }
                const AudioContextCtor = window.AudioContext ||
                    (window as unknown as {
                        webkitAudioContext?: typeof AudioContext;
                    }).webkitAudioContext;
                if (!AudioContextCtor) {
                    dispatch({ type: 'error', message: 'Audio analysis is not supported in this browser' });
                    return;
                }
                const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
                streamRef.current = stream;
                const audioContext = new AudioContextCtor();
                audioContextRef.current = audioContext;
                const analyzer = audioContext.createAnalyser();
                analyzer.fftSize = 128;
                analyzer.smoothingTimeConstant = 0.6;
                analyzerRef.current = analyzer;
                const source = audioContext.createMediaStreamSource(stream);
                source.connect(analyzer);
                sourceRef.current = source;
                dispatch({ type: 'start' });
                const bufferLength = analyzer.frequencyBinCount;
                const dataArray = new Uint8Array(bufferLength);
                const updateVolume = () => {
                    if (!analyzerRef.current)
                        return;
                    analyzerRef.current.getByteFrequencyData(dataArray);
                    const binCount = 12;
                    const bins = new Array(binCount).fill(0);
                    const samplesPerBin = Math.floor(bufferLength * 0.7 / binCount);
                    for (let i = 0; i < binCount; i++) {
                        let sum = 0;
                        for (let j = 0; j < samplesPerBin; j++) {
                            sum += dataArray[i * samplesPerBin + j] || 0;
                        }
                        bins[i] = (sum / samplesPerBin) / 255;
                    }
                    let totalSum = 0;
                    for (let i = 0; i < bufferLength; i++) {
                        totalSum += dataArray[i]!;
                    }
                    const average = totalSum / bufferLength;
                    dispatch({
                        type: 'update',
                        volume: Math.min(1, average / 128),
                        frequencies: bins,
                    });
                    animationFrameRef.current = requestAnimationFrame(updateVolume);
                };
                updateVolume();
            }
            catch (err) {
                logger.error('Error accessing microphone', err);
                dispatch({ type: 'error', message: 'Failed to access microphone for visualization' });
            }
        }
        void startAnalyzing();
        return () => {
            stopAnalyzing();
        };
    }, [isActive]);
    return state;
}
