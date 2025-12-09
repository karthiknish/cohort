'use client'

import { ExternalLink, GripVertical, Image, Link2, MoreHorizontal, Pencil, Trash2 } from 'lucide-react'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { cn } from '@/lib/utils'
import type { FeatureItem } from '@/types/features'
import {
  FEATURE_PRIORITY_COLORS,
  FEATURE_PRIORITY_LABELS,
} from '@/types/features'

interface FeatureCardProps {
  feature: FeatureItem
  onEdit: (feature: FeatureItem) => void
  onDelete: (feature: FeatureItem) => void
  isDragging?: boolean
}

export function FeatureCard({
  feature,
  onEdit,
  onDelete,
  isDragging = false,
}: FeatureCardProps) {
  return (
    <div
      className={cn(
        'group relative flex flex-col gap-3 rounded-lg border bg-card p-4 shadow-sm transition-all',
        'hover:border-primary/30 hover:shadow-md',
        isDragging && 'opacity-50 rotate-2 shadow-lg'
      )}
    >
      {/* Drag Handle */}
      <div className="absolute left-1 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity cursor-grab">
        <GripVertical className="h-4 w-4 text-muted-foreground" />
      </div>

      {/* Header */}
      <div className="flex items-start justify-between gap-2 pl-4">
        <h4 className="font-semibold text-foreground line-clamp-2 text-sm">
          {feature.title}
        </h4>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => onEdit(feature)}>
              <Pencil className="mr-2 h-4 w-4" />
              Edit
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={() => onDelete(feature)}
              className="text-destructive focus:text-destructive"
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Image Preview */}
      {feature.imageUrl && (
        <div className="relative aspect-video w-full overflow-hidden rounded-md bg-muted ml-4 mr-0">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={feature.imageUrl}
            alt={feature.title}
            className="h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
        </div>
      )}

      {/* Description */}
      {feature.description && (
        <p className="text-xs text-muted-foreground line-clamp-2 pl-4">
          {feature.description}
        </p>
      )}

      {/* Footer */}
      <div className="flex items-center justify-between gap-2 pl-4 pt-1">
        <Badge
          variant="outline"
          className={cn('text-[10px] px-1.5 py-0 h-5', FEATURE_PRIORITY_COLORS[feature.priority])}
        >
          {FEATURE_PRIORITY_LABELS[feature.priority]}
        </Badge>

        <div className="flex items-center gap-2 text-muted-foreground">
          {feature.imageUrl && (
            <div className="flex items-center gap-0.5" title="Has image">
              <Image className="h-3 w-3" />
            </div>
          )}
          {feature.references.length > 0 && (
            <div className="flex items-center gap-0.5" title={`${feature.references.length} reference(s)`}>
              <Link2 className="h-3 w-3" />
              <span className="text-[10px]">{feature.references.length}</span>
            </div>
          )}
        </div>
      </div>

      {/* Reference Links Preview */}
      {feature.references.length > 0 && (
        <div className="flex flex-wrap gap-1 pl-4 pt-1 border-t border-border/50">
          {feature.references.slice(0, 2).map((ref, index) => (
            <a
              key={index}
              href={ref.url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-[10px] text-primary hover:underline max-w-[120px] truncate"
              onClick={(e) => e.stopPropagation()}
            >
              <ExternalLink className="h-2.5 w-2.5 shrink-0" />
              {ref.label}
            </a>
          ))}
          {feature.references.length > 2 && (
            <span className="text-[10px] text-muted-foreground">
              +{feature.references.length - 2} more
            </span>
          )}
        </div>
      )}
    </div>
  )
}
