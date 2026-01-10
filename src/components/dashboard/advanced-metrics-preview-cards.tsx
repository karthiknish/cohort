'use client'

import { Info } from 'lucide-react'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { formatCurrency } from '@/lib/utils'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'

type Props = {
  mer: number
  aov: number
  rpc: number
  isLoading: boolean
}

export function AdvancedMetricsPreviewCards({ mer, aov, rpc, isLoading }: Props) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
      <Card className="border-muted/30 bg-muted/5 shadow-sm transition-all hover:bg-muted/10">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1.5">
          <div className="flex items-center gap-2">
            <CardTitle className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60">Blended ROAS (MER)</CardTitle>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger>
                  <Info className="h-3 w-3 text-muted-foreground/40 transition-colors hover:text-primary" />
                </TooltipTrigger>
                <TooltipContent>
                  <p className="text-xs">Marketing Efficiency Ratio: Total Revenue / Total Spend</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? <Skeleton className="h-7 w-16 rounded-lg" /> : <div className="text-xl font-bold tracking-tight text-foreground">{mer.toFixed(2)}x</div>}
        </CardContent>
      </Card>

      <Card className="border-muted/30 bg-muted/5 shadow-sm transition-all hover:bg-muted/10">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1.5">
          <div className="flex items-center gap-2">
            <CardTitle className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60">Avg. Order Value (AOV)</CardTitle>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger>
                  <Info className="h-3 w-3 text-muted-foreground/40 transition-colors hover:text-primary" />
                </TooltipTrigger>
                <TooltipContent>
                  <p className="text-xs">Average revenue generated per conversion</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? <Skeleton className="h-7 w-20 rounded-lg" /> : <div className="text-xl font-bold tracking-tight text-foreground">{formatCurrency(aov)}</div>}
        </CardContent>
      </Card>

      <Card className="border-muted/30 bg-muted/5 shadow-sm transition-all hover:bg-muted/10">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1.5">
          <div className="flex items-center gap-2">
            <CardTitle className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60">Revenue Per Click (RPC)</CardTitle>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger>
                  <Info className="h-3 w-3 text-muted-foreground/40 transition-colors hover:text-primary" />
                </TooltipTrigger>
                <TooltipContent>
                  <p className="text-xs">Average revenue generated for every click</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? <Skeleton className="h-7 w-16 rounded-lg" /> : <div className="text-xl font-bold tracking-tight text-foreground">{formatCurrency(rpc)}</div>}
        </CardContent>
      </Card>
    </div>
  )
}
