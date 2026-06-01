'use client';
import { useCallback, useMemo } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useUrlSearchParams } from '@/shared/hooks/use-url-search-params';
type UseUrlDrivenDialogOptions<TValue extends string> = {
    paramName: string;
    allowedValues: readonly TValue[];
};
type UseUrlDrivenDialogResult<TValue extends string> = {
    activeValue: TValue | null;
    isOpen: boolean;
    openValue: (value: TValue) => void;
    close: () => void;
    onOpenChange: (open: boolean) => void;
};
export function useUrlDrivenDialog<TValue extends string>({ paramName, allowedValues, }: UseUrlDrivenDialogOptions<TValue>): UseUrlDrivenDialogResult<TValue> {
    const pathname = usePathname();
    const router = useRouter();
    const searchParams = useUrlSearchParams();
    const allowedValueSet = new Set(allowedValues);
    const searchValue = (() => {
        const value = searchParams.get(paramName);
        return value && allowedValueSet.has(value as TValue) ? (value as TValue) : null;
    })();
    const activeValue = searchValue;
    const syncUrl = (value: TValue | null) => {
        const params = new URLSearchParams(searchParams.toString());
        if (value) {
            params.set(paramName, value);
        }
        else {
            params.delete(paramName);
        }
        router.replace(params.size > 0 ? `${pathname}?${params.toString()}` : pathname, { scroll: false });
    };
    const openValue = (value: TValue) => {
        syncUrl(value);
    };
    const close = () => {
        syncUrl(null);
    };
    const onOpenChange = (open: boolean) => {
        if (!open) {
            close();
        }
    };
    return {
        activeValue,
        isOpen: activeValue !== null,
        openValue,
        close,
        onOpenChange,
    };
}
