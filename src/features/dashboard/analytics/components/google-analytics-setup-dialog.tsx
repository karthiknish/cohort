'use client';
import { AlertTriangle, Loader2 } from 'lucide-react';
import { getIconContainerClasses } from '@/lib/dashboard-theme';
import { cn } from '@/lib/utils';
import { SvglBrandLogo } from '@/shared/components/svgl-brand-logo';
import { Alert, AlertDescription, AlertTitle } from '@/shared/ui/alert';
import { Button } from '@/shared/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, } from '@/shared/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/ui/select';
type GoogleAnalyticsPropertyOption = {
    id: string;
    name: string;
    resourceName: string;
};
type GoogleAnalyticsSetupDialogProps = {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    setupMessage: string | null;
    properties: GoogleAnalyticsPropertyOption[];
    selectedPropertyId: string;
    onPropertySelectionChange: (propertyId: string) => void;
    loadingProperties: boolean;
    initializing: boolean;
    onReloadProperties: () => void;
    onInitialize: () => void;
};
export function GoogleAnalyticsSetupDialog({ open, onOpenChange, setupMessage, properties, selectedPropertyId, onPropertySelectionChange, loadingProperties, initializing, onReloadProperties, onInitialize, }: GoogleAnalyticsSetupDialogProps) {
    const noProperties = !loadingProperties && properties.length === 0;
    return (<Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-xl">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <span className={cn(getIconContainerClasses('small'), 'flex size-10 items-center justify-center rounded-full')}>
              <SvglBrandLogo brand="google" className="size-5" labeled={false}/>
            </span>
            <div>
              <DialogTitle>Select Google Analytics property</DialogTitle>
              <DialogDescription>
                Pick the property that Cohorts should sync for reporting.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-4 py-2">
          {setupMessage ? (<Alert variant="destructive">
              <AlertTriangle className="size-4"/>
              <AlertTitle>Setup issue</AlertTitle>
              <AlertDescription>{setupMessage}</AlertDescription>
            </Alert>) : null}

          <div className="space-y-2">
            <p className="text-sm font-medium">Property</p>
            <Select value={selectedPropertyId || undefined} onValueChange={onPropertySelectionChange} disabled={loadingProperties || initializing || properties.length === 0}>
              <SelectTrigger className="h-auto min-h-10 items-start py-3 text-left">
                <SelectValue placeholder={loadingProperties ? 'Loading properties...' : 'Select Google Analytics property'}>
                  {(value: string | null) => {
                    if (!value) return null;
                    const selected = properties.find((p) => p.id === value);
                    if (!selected) return value;
                    return (<span className="flex flex-col gap-0.5">
                      <span className="font-medium text-foreground">{selected.name}</span>
                      <span className="text-xs text-muted-foreground">{selected.id}</span>
                    </span>);
                  }}
                </SelectValue>
              </SelectTrigger>
              <SelectContent className="max-h-[24rem]">
                {properties.map((property) => (<SelectItem key={property.id} value={property.id} className="py-2.5">
                    <span className="flex flex-col gap-0.5">
                      <span className="font-medium text-foreground">{property.name}</span>
                      <span className="text-xs text-muted-foreground">{property.id}</span>
                    </span>
                  </SelectItem>))}
              </SelectContent>
            </Select>

            {selectedPropertyId ? (() => {
              const selected = properties.find((p) => p.id === selectedPropertyId);
              return selected ? (<p className="text-xs text-muted-foreground">{selected.resourceName}</p>) : null;
            })() : null}

            {noProperties ? (<p className="text-xs text-warning">
                No properties were found for this Google account. Verify Analytics access, then reload.
              </p>) : null}
          </div>
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button type="button" variant="outline" onClick={onReloadProperties} disabled={loadingProperties || initializing}>
            {loadingProperties ? (<>
                <Loader2 className="mr-2 size-4 animate-spin"/>
                Loading…
              </>) : ('Reload properties')}
          </Button>
          <Button type="button" onClick={onInitialize} disabled={initializing || loadingProperties || !selectedPropertyId}>
            {initializing ? (<>
                <Loader2 className="mr-2 size-4 animate-spin"/>
                Saving…
              </>) : ('Use property')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>);
}
