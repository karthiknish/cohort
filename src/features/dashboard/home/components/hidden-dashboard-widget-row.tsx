'use client';
import { useCallback } from 'react';
import { Eye } from 'lucide-react';
import { Button } from '@/shared/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger, } from '@/shared/ui/tooltip';
import type { DashboardWidget } from './dashboard-customization-types';
export function HiddenDashboardWidgetRow({ widget, onToggleVisibility, }: {
    widget: DashboardWidget;
    onToggleVisibility: (widgetId: string, currentlyVisible: boolean) => void;
}) {
    const handleShow = () => {
        onToggleVisibility(widget.id, false);
    };
    return (<div className="flex items-center justify-between rounded-lg border bg-muted/30 p-2">
      <div>
        <p className="text-sm font-medium">{widget.title}</p>
        <p className="text-xs text-muted-foreground">{widget.category}</p>
      </div>
      <TooltipProvider delayDuration={200}>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button type="button" variant="ghost" size="icon" className="size-7" onClick={handleShow} aria-label={`Show ${widget.title}`}>
              <Eye className="size-3.5" aria-hidden/>
            </Button>
          </TooltipTrigger>
          <TooltipContent>Show widget</TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </div>);
}
