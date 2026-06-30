'use client';
import * as React from 'react';
import {
    dismissToast,
    notifyFailure,
    notifyInfo,
    notifySuccess,
    notifyWarning,
} from '@/lib/notifications';
import { toast as sonnerToast } from '@/shared/ui/sonner-toast';
import type { ToastProps, ToastVariantProps } from '@/shared/ui/toast';

type ToastVariant = ToastVariantProps['variant'] | 'loading' | 'info';

type Toast = ToastProps & {
    id: string;
    title?: React.ReactNode;
    description?: React.ReactNode;
    action?: React.ReactNode;
    variant?: ToastVariant;
    duration?: number;
    persistent?: boolean;
    undoLabel?: string;
    onUndo?: () => void;
    href?: string;
    onNavigate?: () => void;
    onMarkRead?: () => void;
};

type ToastInput = Omit<Toast, 'id'> & {
    id?: string;
};

type ToastHandle = {
    id: string;
    dismiss: () => void;
    update: (updateProps: ToastInput) => void;
};

type ToastState = {
    toasts: Toast[];
};

type BridgedToastVariant = 'loading' | 'success' | 'destructive' | 'warning' | 'info';

function asString(value: React.ReactNode | undefined): string | undefined {
    return typeof value === 'string' ? value : undefined;
}

function createToastHandle(id: string | number, updateFn?: (props: ToastInput) => void): ToastHandle {
    const toastId = String(id);
    return {
        id: toastId,
        dismiss: () => dismissToast(id),
        update: (updateProps) => {
            if (updateFn) {
                updateFn(updateProps);
                return;
            }
            dismissToast(id);
            toast({ ...updateProps, id: toastId });
        },
    };
}

function showBridgedToast(props: Toast & { variant: BridgedToastVariant }): ToastHandle {
    const { id, variant } = props;
    const title = asString(props.title);
    const description = asString(props.description);
    const message = description ?? title ?? '';
    const duration = props.persistent ? 0 : props.duration;
    const baseOptions = {
        id,
        duration,
    };

    switch (variant) {
        case 'loading': {
            sonnerToast.loading(title ?? 'Loading…', {
                id,
                description,
            });
            return createToastHandle(id, (updateProps) => {
                showBridgedToast({ ...props, ...updateProps, id, variant: updateProps.variant as BridgedToastVariant ?? variant });
            });
        }
        case 'success': {
            const sonnerId = notifySuccess({
                ...baseOptions,
                title,
                message: message || 'Success',
            });
            return createToastHandle(sonnerId, (updateProps) => {
                showBridgedToast({ ...props, ...updateProps, id: String(sonnerId), variant: updateProps.variant as BridgedToastVariant ?? 'success' });
            });
        }
        case 'destructive': {
            const sonnerId = notifyFailure({
                ...baseOptions,
                title,
                message: message || undefined,
                fallbackMessage: message || 'An unexpected error occurred',
            });
            return createToastHandle(sonnerId, (updateProps) => {
                showBridgedToast({ ...props, ...updateProps, id: String(sonnerId), variant: updateProps.variant as BridgedToastVariant ?? 'destructive' });
            });
        }
        case 'warning': {
            const sonnerId = notifyWarning({
                ...baseOptions,
                title,
                message: message || 'Please review and try again',
            });
            return createToastHandle(sonnerId, (updateProps) => {
                showBridgedToast({ ...props, ...updateProps, id: String(sonnerId), variant: updateProps.variant as BridgedToastVariant ?? 'warning' });
            });
        }
        case 'info': {
            const sonnerId = notifyInfo({
                ...baseOptions,
                title,
                message: message || '',
            });
            return createToastHandle(sonnerId, (updateProps) => {
                showBridgedToast({ ...props, ...updateProps, id: String(sonnerId), variant: updateProps.variant as BridgedToastVariant ?? 'info' });
            });
        }
    }
}

function isBridgedVariant(variant: ToastVariant | undefined): variant is BridgedToastVariant {
    return variant === 'loading'
        || variant === 'success'
        || variant === 'destructive'
        || variant === 'warning'
        || variant === 'info';
}

/**
 * Legacy toast API — routes standard variants through `@/lib/notifications`.
 *
 * Prefer `useNotifications()` / `notifySuccess`, `notifyFailure`, and
 * `reportConvexFailure` for new code. Use inline `Alert` for persistent
 * query/load failures.
 */
export const toast = ({ ...props }: ToastInput): ToastHandle => {
    const id = props.id ?? Math.random().toString(36).slice(2, 9);

    if (props.onUndo && props.undoLabel) {
        sonnerToast.message(asString(props.title) ?? '', {
            id,
            description: asString(props.description),
            duration: props.persistent ? 0 : (props.duration ?? 5000),
            action: {
                label: props.undoLabel,
                onClick: () => {
                    props.onUndo?.();
                    sonnerToast.dismiss(id);
                },
            },
        });
    }
    else if (props.href && props.onNavigate) {
        sonnerToast.message(asString(props.title) ?? '', {
            id,
            description: asString(props.description),
            duration: props.persistent ? 0 : (props.duration ?? 5000),
            action: {
                label: 'Open',
                onClick: () => {
                    props.onNavigate?.();
                },
            },
        });
    }
    else if (props.action) {
        sonnerToast.message(asString(props.title) ?? '', {
            id,
            description: asString(props.description),
            duration: props.persistent ? 0 : (props.duration ?? 5000),
        });
    }
    else if (isBridgedVariant(props.variant)) {
        return showBridgedToast({ ...props, id, variant: props.variant });
    }
    else {
        sonnerToast.message(asString(props.title) ?? '', {
            id,
            description: asString(props.description),
            duration: props.persistent ? 0 : (props.duration ?? 5000),
        });
    }

    return createToastHandle(id);
};

/**
 * @deprecated Prefer `useNotifications()` from `@/lib/notifications` for new code.
 */
export const useToast = () => {
    const [state] = React.useState<ToastState>({ toasts: [] });
    return {
        ...state,
        toast,
        dismiss: (toastId?: string) => sonnerToast.dismiss(toastId),
    };
};
