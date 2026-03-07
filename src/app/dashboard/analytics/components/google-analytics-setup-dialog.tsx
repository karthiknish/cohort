'use client'

import { AlertTriangle, BarChart3, Loader2 } from 'lucide-react'

import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

type GoogleAnalyticsPropertyOption = {
  id: string
  name: string
  resourceName: string
}

type GoogleAnalyticsSetupDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  setupMessage: string | null
  properties: GoogleAnalyticsPropertyOption[]
  selectedPropertyId: string
  onPropertySelectionChange: (propertyId: string) => void
  loadingProperties: boolean
  initializing: boolean
  onReloadProperties: () => void
  onInitialize: () => void
}

export function GoogleAnalyticsSetupDialog({
  open,
  onOpenChange,
  setupMessage,
  properties,
  selectedPropertyId,
  onPropertySelectionChange,
  loadingProperties,
  initializing,
  onReloadProperties,
  onInitialize,
}: GoogleAnalyticsSetupDialogProps) {
  const noProperties = !loadingProperties && properties.length === 0

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-xl">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-full bg-[#F9AB00]/10 text-[#E37400]">
              <BarChart3 className="h-5 w-5" />
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
          {setupMessage ? (
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertTitle>Setup issue</AlertTitle>
              <AlertDescription>{setupMessage}</AlertDescription>
            </Alert>
          ) : null}

          <div className="space-y-2">
            <p className="text-sm font-medium">Property</p>
            <Select
              value={selectedPropertyId || undefined}
              onValueChange={onPropertySelectionChange}
              disabled={loadingProperties || initializing || properties.length === 0}
            >
              <SelectTrigger className="h-auto min-h-10 items-start py-3 text-left">
                <SelectValue placeholder={loadingProperties ? 'Loading properties...' : 'Select Google Analytics property'} />
              </SelectTrigger>
              <SelectContent className="max-h-[min(24rem,var(--radix-select-content-available-height))] w-[var(--radix-select-trigger-width)]">
                {properties.map((property) => (
                  <SelectItem key={property.id} value={property.id} className="items-start py-2.5">
                    <div className="flex min-w-0 flex-col">
                      <span className="truncate font-medium">{property.name}</span>
                      <span className="truncate text-xs text-muted-foreground">{property.resourceName}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {noProperties ? (
              <p className="text-xs text-amber-700">
                No properties were found for this Google account. Verify Analytics access, then reload.
              </p>
            ) : null}
          </div>
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button
            type="button"
            variant="outline"
            onClick={onReloadProperties}
            disabled={loadingProperties || initializing}
          >
            {loadingProperties ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Loading...
              </>
            ) : (
              'Reload properties'
            )}
          </Button>
          <Button
            type="button"
            onClick={onInitialize}
            disabled={initializing || loadingProperties || !selectedPropertyId}
          >
            {initializing ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              'Use property'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
