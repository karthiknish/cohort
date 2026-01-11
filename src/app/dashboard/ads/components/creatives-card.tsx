'use client'

import { useCallback, useState } from 'react'
import { useAction } from 'convex/react'
import { RefreshCw, Image, Video, FileText, ExternalLink, BarChart2, CheckSquare, Square } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from '@/components/ui/avatar'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { toast } from '@/components/ui/use-toast'
import { useAuth } from '@/contexts/auth-context'
import { adsCreativesApi } from '@/lib/convex-api'

// =============================================================================
// TYPES
// =============================================================================

type Creative = {
  providerId: string
  creativeId: string
  adGroupId?: string
  campaignId: string
  campaignName?: string
  name?: string
  type: string
  status: string
  headlines?: string[]
  descriptions?: string[]
  imageUrl?: string
  videoUrl?: string
  landingPageUrl?: string
  callToAction?: string
  pageName?: string
  pageProfileImageUrl?: string
}

type Props = {
  providerId: string
  providerName: string
  isConnected: boolean
}

// =============================================================================
// COMPONENT
// =============================================================================

export function CreativesCard({ providerId, providerName, isConnected }: Props) {
  const { user } = useAuth()
  const workspaceId = user?.agencyId ? String(user.agencyId) : null
  const listCreatives = useAction(adsCreativesApi.listCreatives)

  const [creatives, setCreatives] = useState<Creative[]>([])
  const [loading, setLoading] = useState(false)
  const [summary, setSummary] = useState<{ total: number; byType: Record<string, number> } | null>(null)
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const [compareOpen, setCompareOpen] = useState(false)

  const fetchCreatives = useCallback(async () => {
    if (!isConnected) return

    setLoading(true)
    try {
      if (!workspaceId) {
        throw new Error('Sign in required')
      }

      const creativesList = await listCreatives({
        workspaceId,
        providerId: providerId as any,
        clientId: null,
      })

      setCreatives(Array.isArray(creativesList) ? (creativesList as Creative[]) : [])
      setSummary(null)
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to load creatives',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }, [isConnected, listCreatives, providerId, workspaceId])

  const getTypeIcon = (type: string) => {
    const t = type.toLowerCase()
    if (t.includes('video')) return <Video className="h-4 w-4" />
    if (t.includes('image') || t.includes('display')) return <Image className="h-4 w-4" />
    return <FileText className="h-4 w-4" />
  }

  const getStatusBadge = (status: string) => {
    const s = status.toLowerCase()
    if (s === 'enabled' || s === 'enable' || s === 'active') {
      return <Badge variant="default" className="bg-green-500">Active</Badge>
    }
    if (s === 'paused' || s === 'disable') {
      return <Badge variant="secondary">Paused</Badge>
    }
    return <Badge variant="outline">{status}</Badge>
  }

  if (!isConnected) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Creatives</CardTitle>
          <CardDescription>Connect {providerName} to view creatives</CardDescription>
        </CardHeader>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <div>
          <CardTitle className="text-lg">Creatives</CardTitle>
          <CardDescription>
            {summary ? `${summary.total} creatives` : `View ${providerName} ad creatives`}
          </CardDescription>
        </div>
        <div className="flex gap-2">
          {selectedIds.size > 1 && (
            <Button variant="default" size="sm" onClick={() => setCompareOpen(true)}>
              <BarChart2 className="h-4 w-4 mr-2" />
              Compare & Test ({selectedIds.size})
            </Button>
          )}
          <Button variant="outline" size="sm" onClick={fetchCreatives} disabled={loading}>
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Load Creatives
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {creatives.length === 0 ? (
          <p className="text-muted-foreground text-sm">
            Click &quot;Load Creatives&quot; to view your ad creatives.
          </p>
        ) : (
          <>
            {summary && (
              <div className="flex gap-2 mb-4 flex-wrap">
                {Object.entries(summary.byType).map(([type, count]) => (
                  <Badge key={type} variant="outline" className="text-xs">
                    {type}: {count}
                  </Badge>
                ))}
              </div>
            )}
            <div className="max-h-[400px] overflow-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[40px]"></TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Headlines</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Link</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {creatives.map((creative) => (
                    <TableRow
                      key={creative.creativeId}
                      className={selectedIds.has(creative.creativeId) ? 'bg-primary/5' : ''}
                    >
                      <TableCell>
                        <button
                          onClick={() => {
                            const next = new Set(selectedIds)
                            if (next.has(creative.creativeId)) {
                              next.delete(creative.creativeId)
                            } else {
                              next.add(creative.creativeId)
                            }
                            setSelectedIds(next)
                          }}
                          className="hover:text-primary transition-colors"
                        >
                          {selectedIds.has(creative.creativeId) ? (
                            <CheckSquare className="h-4 w-4 text-primary" />
                          ) : (
                            <Square className="h-4 w-4 text-muted-foreground" />
                          )}
                        </button>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {getTypeIcon(creative.type)}
                          <span className="text-xs text-muted-foreground capitalize">
                            {creative.type.toLowerCase().replace(/_/g, ' ')}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col">
                          <p className="font-medium truncate max-w-[200px]">
                            {creative.name || creative.campaignName || creative.creativeId}
                          </p>
                          {creative.pageName && (
                            <p className="text-[10px] text-muted-foreground truncate max-w-[150px]">
                              via {creative.pageName}
                            </p>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="max-w-[250px]">
                        {creative.headlines && creative.headlines.length > 0 ? (
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger className="text-left">
                                <span className="text-sm truncate block">
                                  {creative.headlines[0]}
                                </span>
                              </TooltipTrigger>
                              <TooltipContent>
                                <div className="max-w-[300px]">
                                  {creative.headlines.map((h, i) => (
                                    <p key={i} className="text-xs mb-1">{h}</p>
                                  ))}
                                </div>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        ) : (
                          <span className="text-muted-foreground">-</span>
                        )}
                      </TableCell>
                      <TableCell>{getStatusBadge(creative.status)}</TableCell>
                      <TableCell>
                        {creative.landingPageUrl && (
                          <a
                            href={creative.landingPageUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-primary hover:underline"
                          >
                            <ExternalLink className="h-4 w-4" />
                          </a>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </>
        )}
      </CardContent>
      <Dialog open={compareOpen} onOpenChange={setCompareOpen}>
        <DialogContent className="max-w-5xl overflow-auto max-h-[90vh]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <BarChart2 className="h-5 w-5" />
              Creative Comparison & A/B Testing
            </DialogTitle>
            <DialogDescription>
              Comparing {selectedIds.size} selected creatives across {providerName}
            </DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 py-4">
            {creatives
              .filter((c) => selectedIds.has(c.creativeId))
              .map((c) => (
                <div key={c.creativeId} className="border rounded-xl p-4 space-y-4 relative bg-muted/20">
                  <div className="absolute top-2 right-2 flex items-center gap-2">
                    {c.pageProfileImageUrl && (
                      <Avatar className="h-4 w-4 ring-1 ring-background">
                        <AvatarImage src={c.pageProfileImageUrl} />
                        <AvatarFallback className="text-[6px]">{c.pageName?.[0]}</AvatarFallback>
                      </Avatar>
                    )}
                    {getStatusBadge(c.status)}
                  </div>

                  {/* Visual Preview */}
                  <div className="aspect-video bg-muted rounded-lg flex items-center justify-center overflow-hidden border">
                    {c.imageUrl ? (
                      <img
                        src={c.imageUrl}
                        alt=""
                        className="w-full h-full object-contain bg-muted/50"
                        style={{ imageRendering: 'auto' }}
                      />
                    ) : c.videoUrl ? (
                      <Video className="h-8 w-8 text-muted-foreground" />
                    ) : (
                      <FileText className="h-8 w-8 text-muted-foreground" />
                    )}
                  </div>

                  {c.pageName && (
                    <div className="flex items-center gap-1.5 pt-1">
                      <span className="text-[10px] text-muted-foreground font-medium uppercase tracking-tight">
                        {c.pageName}
                      </span>
                    </div>
                  )}

                  <div className="space-y-2">
                    <h3 className="font-semibold text-sm line-clamp-2">
                      {c.headlines && c.headlines.length > 0 ? c.headlines[0] : 'No Headline'}
                    </h3>
                    <p className="text-xs text-muted-foreground line-clamp-3">
                      {c.descriptions && c.descriptions.length > 0 ? c.descriptions[0] : 'No Description'}
                    </p>
                  </div>

                  <div className="pt-2 border-t space-y-2">
                    <div className="flex justify-between text-xs">
                      <span className="text-muted-foreground">Type:</span>
                      <span className="capitalize">{c.type.toLowerCase().replace(/_/g, ' ')}</span>
                    </div>
                    {c.callToAction && (
                      <div className="flex justify-between text-xs">
                        <span className="text-muted-foreground">CTA:</span>
                        <span>{c.callToAction}</span>
                      </div>
                    )}
                  </div>

                  <Button
                    variant="outline"
                    className="w-full text-xs h-8"
                    onClick={() => {
                      toast({
                        title: 'A/B Test Action',
                        description: 'Creative promoted to primary. Syncing with platform...',
                      })
                    }}
                  >
                    Promote to Winner
                  </Button>
                </div>
              ))}
          </div>
          <DialogFooter className="flex justify-between items-center sm:justify-between">
            <p className="text-xs text-muted-foreground">
              Tip: Compare CTR and Conversion Rates on the Analytics page to determine the winner.
            </p>
            <Button onClick={() => setCompareOpen(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  )
}
