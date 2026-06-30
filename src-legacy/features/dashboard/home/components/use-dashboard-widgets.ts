'use client';
import { useState, useCallback } from 'react';
import { DEFAULT_WIDGETS, type DashboardWidget } from './dashboard-customization-types';
/**
 * Hook for managing dashboard widget state
 */
export function useDashboardWidgets(initialWidgets?: DashboardWidget[]) {
    const [widgets, setWidgets] = useState<DashboardWidget[]>(initialWidgets ?? DEFAULT_WIDGETS);
    const toggleWidget = (widgetId: string, visible: boolean) => {
        setWidgets((prev) => {
            const widget = prev.find((w) => w.id === widgetId);
            if (!widget)
                return prev;
            if (visible) {
                if (!prev.some((w) => w.id === widgetId)) {
                    return [...prev, { ...widget, visible: true }];
                }
                return prev.map((w) => (w.id === widgetId ? { ...w, visible: true } : w));
            }
            return prev.map((w) => (w.id === widgetId ? { ...w, visible: false } : w));
        });
    };
    const collapseWidget = (widgetId: string, collapsed: boolean) => {
        setWidgets((prev) => prev.map((w) => (w.id === widgetId ? { ...w, collapsed } : w)));
    };
    const resetWidgets = () => {
        setWidgets(DEFAULT_WIDGETS);
    };
    const moveWidget = (fromIndex: number, toIndex: number) => {
        setWidgets((prev) => {
            const newWidgets = [...prev];
            const [removed] = newWidgets.splice(fromIndex, 1);
            if (removed) {
                newWidgets.splice(toIndex, 0, removed);
            }
            return newWidgets;
        });
    };
    return {
        widgets,
        setWidgets,
        toggleWidget,
        collapseWidget,
        resetWidgets,
        moveWidget,
    };
}
