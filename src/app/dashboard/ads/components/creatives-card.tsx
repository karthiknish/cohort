'use client'

import { useCallback, useState } from 'react'
import { RefreshCw, Image, Video, FileText, ExternalLink } from 'lucide-react'

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
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { toast } from '@/components/ui/use-toast'

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
  const [creatives, setCreatives] = useState<Creative[]>([])
  const [loading, setLoading] = useState(false)
  const [summary, setSummary] = useState<{ total: number; byType: Record<string, number> } | null>(null)

  const fetchCreatives = useCallback(async () => {
    if (!isConnected) return
    
    setLoading(true)
    try {
      const response = await fetch(`/api/integrations/creatives?providerId=${providerId}`)
      if (!response.ok) throw new Error('Failed to fetch creatives')
      const data = await response.json()
      setCreatives(data.creatives || [])
      setSummary(data.summary || null)
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to load creatives',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }, [providerId, isConnected])

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
        <Button variant="outline" size="sm" onClick={fetchCreatives} disabled={loading}>
          <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
          Load Creatives
        </Button>
      </CardHeader>
      <CardContent>
        {creatives.length === 0 ? (
          <p className="text-muted-foreground text-sm">
            Click "Load Creatives" to view your ad creatives.
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
                    <TableHead>Type</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Headlines</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Link</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {creatives.map((creative) => (
                    <TableRow key={creative.creativeId}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {getTypeIcon(creative.type)}
                          <span className="text-xs text-muted-foreground capitalize">
                            {creative.type.toLowerCase().replace(/_/g, ' ')}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="font-medium max-w-[200px] truncate">
                        {creative.name || creative.campaignName || creative.creativeId}
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
    </Card>
  )
}
