'use client'

import { RectangleVertical, Square } from 'lucide-react'

import { SvglBrandLogo } from '@/shared/components/svgl-brand-logo'
import { cn } from '@/lib/utils'
import { Tabs, TabsList, TabsTrigger } from '@/shared/ui/tabs'

import type { Platform } from './creative-social-preview-state'

export function CreativeSocialPreviewToolbar({
  aspectRatio,
  activePlatform,
  availablePlatforms,
  onSetFeed,
  onSetReel,
  onPlatformChange,
}: {
  aspectRatio: 'feed' | 'reel'
  activePlatform: Platform
  availablePlatforms: Platform[]
  onSetFeed: () => void
  onSetReel: () => void
  onPlatformChange: (value: string) => void
}) {
  return (
    <div className="flex items-center justify-between px-1">
      <div className="flex flex-col">
        <span className="text-[10px] font-black text-primary tracking-[0.2em] uppercase mb-0.5">Preview</span>
        <h3 className="text-lg tracking-tight">Social Mockup</h3>
      </div>
      <div className="flex items-center gap-2">
        <div className="flex items-center gap-1 p-1 rounded-lg bg-muted/30 border border-muted-foreground/10">
          <button
            type="button"
            onClick={onSetFeed}
            className={cn(
              'size-8 rounded-md flex items-center justify-center motion-chromatic',
              aspectRatio === 'feed' ? 'bg-background shadow-sm' : 'hover:bg-muted/50',
            )}
            title="Feed (1:1)"
          >
            <Square className="size-4" />
          </button>
          <button
            type="button"
            onClick={onSetReel}
            className={cn(
              'size-8 rounded-md flex items-center justify-center motion-chromatic',
              aspectRatio === 'reel' ? 'bg-background shadow-sm' : 'hover:bg-muted/50',
            )}
            title="Reel (9:16)"
          >
            <RectangleVertical className="size-4" />
          </button>
        </div>

        {availablePlatforms.length > 1 ? (
          <Tabs value={activePlatform} onValueChange={onPlatformChange} className="w-auto">
            <TabsList className="h-10 bg-muted/30 p-1 rounded-lg border border-muted-foreground/10">
              {availablePlatforms.includes('facebook') ? (
                <TabsTrigger value="facebook" className="size-8 p-0 rounded-md">
                  <SvglBrandLogo brand="facebook" className="size-4" labeled={false} />
                </TabsTrigger>
              ) : null}
              {availablePlatforms.includes('instagram') ? (
                <TabsTrigger value="instagram" className="size-8 p-0 rounded-md">
                  <SvglBrandLogo brand="instagram" className="size-4" labeled={false} />
                </TabsTrigger>
              ) : null}
              {availablePlatforms.includes('linkedin') ? (
                <TabsTrigger value="linkedin" className="size-8 p-0 rounded-md">
                  <SvglBrandLogo brand="linkedin" className="size-4" labeled={false} />
                </TabsTrigger>
              ) : null}
            </TabsList>
          </Tabs>
        ) : null}
      </div>
    </div>
  )
}
