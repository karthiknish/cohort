import { motion } from 'framer-motion'
import {
  ArrowLeft,
  RefreshCw,
  Edit2,
  Save,
  X,
  MoreHorizontal,
  Sparkles,
  Share,
  TrendingUp,
  Trash2,
  ChevronRight
} from 'lucide-react'
import Link from 'next/link'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

import type { Creative } from './types'
import { getTypeIcon } from './helpers'
import { cn } from '@/lib/utils'

function getStatusVariant(status: string): string {
  const s = status.toLowerCase()
  if (s === 'enabled' || s === 'enable' || s === 'active') return 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20'
  if (s === 'paused' || s === 'disable') return 'bg-amber-500/10 text-amber-500 border-amber-500/20'
  if (s === 'deleted' || s === 'removed') return 'bg-rose-500/10 text-rose-500 border-rose-500/20'
  return 'bg-muted/50 text-muted-foreground border-muted'
}

export function CreativeHeader(props: {
  creative: Creative
  backUrl: string
  displayName: string
  isEditing: boolean
  isSaving: boolean
  onStartEditing: () => void
  onCancelEditing: () => void
  onSave: () => void
  onRefreshCreative: () => void
  onRefreshPerformance: () => void
}) {
  const {
    creative,
    backUrl,
    displayName,
    isEditing,
    isSaving,
    onStartEditing,
    onCancelEditing,
    onSave,
    onRefreshCreative,
    onRefreshPerformance,
  } = props

  return (
    <motion.div
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between py-6 px-1 border-b bg-background/80 backdrop-blur-md mb-8"
    >
      <div className="flex items-center gap-5">
        <Link href={backUrl} className="group">
          <div className="h-10 w-10 rounded-xl bg-muted/50 flex items-center justify-center border border-muted-foreground/10 group-hover:bg-primary/10 group-hover:border-primary/20 transition-all duration-300">
            <ArrowLeft className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors" />
          </div>
        </Link>

        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <div className="flex items-center text-[10px] font-bold text-muted-foreground/60 tracking-[0.2em] uppercase">
              Ads
              <ChevronRight className="h-3 w-3 mx-1 opacity-50" />
              {creative.providerId}
            </div>
            <div className={cn("text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full border", getStatusVariant(creative.status))}>
              {creative.status}
            </div>
          </div>
          <h1 className="text-xl font-bold tracking-tight flex items-center gap-2.5">
            {displayName}
            <span className="p-1 rounded-lg bg-muted-foreground/5 border border-muted-foreground/10">
              {getTypeIcon(creative.type)}
            </span>
          </h1>
        </div>
      </div>

      <div className="flex items-center gap-2">
        {isEditing ? (
          <div className="flex items-center gap-3 p-1 rounded-2xl bg-muted/30 border border-muted-foreground/10">
            <Button variant="ghost" size="sm" onClick={onCancelEditing} disabled={isSaving} className="h-8 px-4 text-xs font-semibold rounded-xl hover:bg-rose-500/10 hover:text-rose-500">
              <X className="h-3.5 w-3.5 mr-2" />
              Discard
            </Button>
            <Button
              onClick={onSave}
              disabled={isSaving}
              className="h-8 px-5 text-xs font-bold rounded-xl bg-primary hover:bg-primary/90 shadow-lg shadow-primary/20 text-primary-foreground"
            >
              {isSaving ? (
                <RefreshCw className="h-3.5 w-3.5 mr-2 animate-spin" />
              ) : (
                <Save className="h-3.5 w-3.5 mr-2" />
              )}
              {isSaving ? 'Applying...' : 'Apply Changes'}
            </Button>
          </div>
        ) : (
          <div className="flex items-center gap-1.5">
            <div className="hidden lg:flex items-center gap-1.5 mr-2 pr-4 border-r border-muted-foreground/10">
              <Button variant="ghost" size="sm" className="h-9 px-3 text-xs font-medium rounded-xl border border-transparent hover:border-muted-foreground/10 hover:bg-muted/50 text-muted-foreground">
                <Share className="h-4 w-4 mr-2" />
                Export
              </Button>
            </div>

            <Button
              onClick={onStartEditing}
              className="h-9 px-6 rounded-xl bg-primary hover:bg-primary/90 shadow-xl shadow-primary/20 font-bold text-xs tracking-tight"
            >
              <Edit2 className="h-4 w-4 mr-2" />
              Social Editor
            </Button>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-9 w-9 rounded-xl hover:bg-muted/50 border border-transparent hover:border-muted-foreground/10 transition-all">
                  <MoreHorizontal className="h-5 w-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-60 p-2 rounded-2xl shadow-2xl border-muted-foreground/10 animate-in fade-in zoom-in-95 duration-200">
                <DropdownMenuItem onClick={onRefreshCreative} className="gap-3 py-2.5 rounded-xl cursor-pointer">
                  <div className="h-8 w-8 rounded-lg bg-muted/50 flex items-center justify-center">
                    <RefreshCw className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <div className="flex flex-col">
                    <span className="font-semibold text-sm">Sync Platform</span>
                    <span className="text-[10px] text-muted-foreground">Force refresh data</span>
                  </div>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={onRefreshPerformance} className="gap-3 py-2.5 rounded-xl cursor-pointer">
                  <div className="h-8 w-8 rounded-lg bg-muted/50 flex items-center justify-center">
                    <TrendingUp className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <div className="flex flex-col">
                    <span className="font-semibold text-sm">Update Metrics</span>
                    <span className="text-[10px] text-muted-foreground">Real-time stats</span>
                  </div>
                </DropdownMenuItem>
                <DropdownMenuSeparator className="my-2" />
                <DropdownMenuItem className="gap-3 py-2.5 rounded-xl cursor-pointer text-primary focus:bg-primary/10">
                  <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Sparkles className="h-4 w-4 text-primary" />
                  </div>
                  <div className="flex flex-col">
                    <span className="font-semibold text-sm">AI Magic</span>
                    <span className="text-[10px] text-primary/70">Generate variations</span>
                  </div>
                </DropdownMenuItem>
                <DropdownMenuSeparator className="my-2" />
                <DropdownMenuItem className="gap-3 py-2.5 rounded-xl cursor-pointer text-rose-500 focus:bg-rose-500/10 focus:text-rose-600">
                  <div className="h-8 w-8 rounded-lg bg-rose-500/10 flex items-center justify-center">
                    <Trash2 className="h-4 w-4 text-rose-500" />
                  </div>
                  <span className="font-semibold text-sm">Delete Asset</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        )}
      </div>
    </motion.div>
  )
}