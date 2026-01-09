'use client'

import {
  Check,
  Copy,
  RefreshCw,
  Trash2,
  Plus,
  Sparkles,
  Edit3,
  Info,
  TrendingUp,
  Zap,
  Layout,
  Type,
  Link as LinkIcon,
  MousePointer2,
  FileText,
  AlertCircle, Image as ImageIcon, Video
} from 'lucide-react'

import type { AlgorithmicInsight } from '@/lib/ad-algorithms'
import { formatCurrency, cn } from '@/lib/utils'
import { formatCTALabel } from './helpers'

import type { Creative } from './types'
import type { CreativePerformanceSummary } from './creative-social-preview'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'

export function CreativeEditorTabs(props: {
  providerId: string
  creative: Creative
  copiedField: string | null
  onCopy: (text: string, field: string) => void

  isEditing: boolean
  editedHeadlines: string[]
  editedDescriptions: string[]
  editedCta: string
  editedLandingPage: string
  onAddHeadline: () => void
  onRemoveHeadline: (index: number) => void
  onUpdateHeadline: (index: number, value: string) => void
  onAddDescription: () => void
  onRemoveDescription: (index: number) => void
  onUpdateDescription: (index: number, value: string) => void
  onChangeCta: (value: string) => void
  onChangeLandingPage: (value: string) => void

  generatingHeadlines?: boolean
  generatingDescriptions?: boolean
  onGenerateHeadlines?: () => void
  onGenerateDescriptions?: () => void

  days: string
  onChangeDays: (value: string) => void
  metricsLoading: boolean
  metricsError: string | null
  performanceSummary: CreativePerformanceSummary | null
  efficiencyScore: number | null
  onRefreshPerformance: () => void

  algorithmicInsights: AlgorithmicInsight[]
}) {
  const {
    providerId,
    creative,
    copiedField,
    onCopy,
    isEditing,
    editedHeadlines,
    editedDescriptions,
    editedCta,
    editedLandingPage,
    onAddHeadline,
    onRemoveHeadline,
    onUpdateHeadline,
    onAddDescription,
    onRemoveDescription,
    onUpdateDescription,
    onChangeCta,
    onChangeLandingPage,
    generatingHeadlines,
    generatingDescriptions,
    onGenerateHeadlines,
    onGenerateDescriptions,
    days,
    onChangeDays,
    metricsLoading,
    metricsError,
    performanceSummary,
    efficiencyScore,
    onRefreshPerformance,
    algorithmicInsights,
  } = props

  return (
    <div className="lg:col-span-7 flex flex-col gap-6">
      <Tabs defaultValue="edit" className="w-full">
        <div className="flex items-center justify-between mb-2">
          <TabsList className="bg-muted/40 p-1">
            <TabsTrigger value="edit" className="gap-2">
              <Edit3 className="h-3.5 w-3.5" />
              Content
            </TabsTrigger>
            <TabsTrigger value="performance" className="gap-2">
              <TrendingUp className="h-3.5 w-3.5" />
              Performance
            </TabsTrigger>
            <TabsTrigger value="insights" className="gap-2">
              <Sparkles className="h-3.5 w-3.5 text-primary" />
              AI Insights
            </TabsTrigger>
            <TabsTrigger value="details" className="gap-2">
              <Layout className="h-3.5 w-3.5" />
              Technical
            </TabsTrigger>
          </TabsList>

          {isEditing && (
            <Badge variant="secondary" className="gap-1 animate-pulse">
              <div className="h-1.5 w-1.5 rounded-full bg-primary" />
              Live Editing
            </Badge>
          )}
        </div>

        <TabsContent value="edit" className="mt-0 space-y-6">
          {/* Headlines Section */}
          <Card className="border-none shadow-sm bg-background/50 backdrop-blur-sm">
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-base flex items-center gap-2">
                    <Type className="h-4 w-4 text-primary" />
                    Headlines
                  </CardTitle>
                  <CardDescription className="text-xs">
                    Catch attention with short, punchy titles.
                  </CardDescription>
                </div>
                {isEditing ? (
                  <Button variant="outline" size="sm" onClick={onAddHeadline} className="h-8 gap-1 border-primary/20 hover:bg-primary/5">
                    <Plus className="h-3.5 w-3.5 text-primary" />
                    New Variant
                  </Button>
                ) : (
                  <Badge variant="outline" className="text-[10px] font-bold">
                    {creative.headlines?.length || 0} VARIANTS
                  </Badge>
                )}
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              {isEditing ? (
                editedHeadlines.length > 0 ? (
                  editedHeadlines.map((headline, i) => (
                    <div key={i} className="group relative flex items-center gap-2">
                      <Input
                        value={headline}
                        onChange={(e) => onUpdateHeadline(i, e.target.value)}
                        placeholder="Enter headline..."
                        className="flex-1 bg-background border-muted focus-visible:ring-primary/20"
                      />
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-9 w-9 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-destructive"
                        onClick={() => onRemoveHeadline(i)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                      {i === 0 && (
                        <div className="absolute -left-2 top-1/2 -translate-y-1/2 w-1 h-4 bg-primary rounded-full" />
                      )}
                    </div>
                  ))
                ) : (
                  <div className="border-2 border-dashed rounded-lg p-6 text-center">
                    <p className="text-sm text-muted-foreground mb-3">No headlines configured for this creative.</p>
                    <Button variant="outline" size="sm" onClick={onAddHeadline}>
                      <Plus className="h-4 w-4 mr-1" /> Add Headline
                    </Button>
                  </div>
                )
              ) : creative.headlines && creative.headlines.length > 0 ? (
                creative.headlines.map((headline, i) => (
                  <div key={i} className="group flex items-start justify-between gap-3 p-3 rounded-xl border bg-background hover:border-primary/20 transition-colors">
                    <div className="flex gap-3">
                      <span className="mt-0.5 text-[10px] font-bold text-muted-foreground/50">{i + 1}</span>
                      <p className="text-sm font-medium">{headline}</p>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={() => onCopy(headline, `headline-${i}`)}
                    >
                      {copiedField === `headline-${i}` ? <Check className="h-3.5 w-3.5 text-emerald-500" /> : <Copy className="h-3.5 w-3.5" />}
                    </Button>
                  </div>
                ))
              ) : (
                <p className="text-sm text-muted-foreground py-4 text-center">No headlines available</p>
              )}

              {isEditing && (
                <div className="flex items-center gap-2 pt-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={onGenerateHeadlines}
                    disabled={!onGenerateHeadlines || generatingHeadlines}
                    className="h-7 text-[10px] font-bold gap-1 text-primary hover:text-primary hover:bg-primary/5"
                  >
                    <Sparkles className="h-3 w-3" />
                    {generatingHeadlines ? 'GENERATING…' : 'GENERATE AI ALTERNATIVES'}
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Primary Text Section */}
          <Card className="border-none shadow-sm bg-background/50 backdrop-blur-sm">
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-base flex items-center gap-2">
                    <FileText className="h-4 w-4 text-primary" />
                    Primary Text
                  </CardTitle>
                  <CardDescription className="text-xs">
                    The main copy that appears above or below your media.
                  </CardDescription>
                </div>
                {isEditing ? (
                  <Button variant="outline" size="sm" onClick={onAddDescription} className="h-8 gap-1 border-primary/20 hover:bg-primary/5">
                    <Plus className="h-3.5 w-3.5 text-primary" />
                    New Variant
                  </Button>
                ) : (
                  <Badge variant="outline" className="text-[10px] font-bold">
                    {creative.descriptions?.length || 0} VARIANTS
                  </Badge>
                )}
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {isEditing ? (
                editedDescriptions.length > 0 ? (
                  editedDescriptions.map((desc, i) => (
                    <div key={i} className="group relative flex items-start gap-2">
                      <Textarea
                        value={desc}
                        onChange={(e) => onUpdateDescription(i, e.target.value)}
                        placeholder="Enter primary text..."
                        className="flex-1 min-h-[100px] bg-background border-muted focus-visible:ring-primary/20 resize-none"
                      />
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-9 w-9 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-destructive mt-1"
                        onClick={() => onRemoveDescription(i)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                      <div className="absolute bottom-2 right-12 text-[10px] text-muted-foreground">
                        {desc.length} chars
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="border-2 border-dashed rounded-lg p-6 text-center">
                    <p className="text-sm text-muted-foreground mb-3">No primary text variants yet.</p>
                    <Button variant="outline" size="sm" onClick={onAddDescription}>
                      <Plus className="h-4 w-4 mr-1" /> Add Primary Text
                    </Button>
                  </div>
                )
              ) : creative.descriptions && creative.descriptions.length > 0 ? (
                creative.descriptions.map((desc, i) => (
                  <div key={i} className="group flex items-start justify-between gap-3 p-4 rounded-xl border bg-background hover:border-primary/20 transition-colors">
                    <div className="flex gap-3">
                      <span className="mt-0.5 text-[10px] font-bold text-muted-foreground/50">{i + 1}</span>
                      <p className="text-sm leading-relaxed">{desc}</p>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={() => onCopy(desc, `desc-${i}`)}
                    >
                      {copiedField === `desc-${i}` ? <Check className="h-3.5 w-3.5 text-emerald-500" /> : <Copy className="h-3.5 w-3.5" />}
                    </Button>
                  </div>
                ))
              ) : (
                <p className="text-sm text-muted-foreground py-4 text-center">No primary text available</p>
              )}

              {isEditing && (
                <div className="flex items-center gap-2 pt-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={onGenerateDescriptions}
                    disabled={!onGenerateDescriptions || generatingDescriptions}
                    className="h-7 text-[10px] font-bold gap-1 text-primary hover:text-primary hover:bg-primary/5"
                  >
                    <Sparkles className="h-3 w-3" />
                    {generatingDescriptions ? 'GENERATING…' : 'GENERATE AI ALTERNATIVES'}
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Destination Section */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Card className="border-none shadow-sm bg-background/50 backdrop-blur-sm">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm flex items-center gap-2">
                  <MousePointer2 className="h-4 w-4 text-primary" />
                  Action
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <Label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Call to action</Label>
                  {isEditing ? (
                    <Select value={editedCta} onValueChange={onChangeCta}>
                      <SelectTrigger className="bg-background">
                        <SelectValue placeholder="Select CTA" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="LEARN_MORE">Learn More</SelectItem>
                        <SelectItem value="SHOP_NOW">Shop Now</SelectItem>
                        <SelectItem value="SIGN_UP">Sign Up</SelectItem>
                        <SelectItem value="BOOK_NOW">Book Now</SelectItem>
                        <SelectItem value="DOWNLOAD">Download</SelectItem>
                        <SelectItem value="GET_OFFER">Get Offer</SelectItem>
                      </SelectContent>
                    </Select>
                  ) : creative.callToAction ? (
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary" className="bg-primary/10 text-primary hover:bg-primary/20 border-none px-3 py-1">
                        {formatCTALabel(creative.callToAction)}
                      </Badge>
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground italic">Not specified</p>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card className="border-none shadow-sm bg-background/50 backdrop-blur-sm">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm flex items-center gap-2">
                  <LinkIcon className="h-4 w-4 text-primary" />
                  Destination
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <Label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Landing page URL</Label>
                  {isEditing ? (
                    <Input
                      value={editedLandingPage}
                      onChange={(e) => onChangeLandingPage(e.target.value)}
                      placeholder="https://example.com/landing"
                      type="url"
                      className="bg-background"
                    />
                  ) : creative.landingPageUrl ? (
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-xs truncate text-primary font-medium underline underline-offset-4">{creative.landingPageUrl}</p>
                      <Button variant="ghost" size="icon" className="h-7 w-7 shrink-0" onClick={() => onCopy(creative.landingPageUrl ?? '', 'landing')}>
                        {copiedField === 'landing' ? <Check className="h-3 w-3 text-emerald-500" /> : <Copy className="h-3 w-3" />}
                      </Button>
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground italic">No link configured</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="performance" className="mt-0 space-y-6">
          <Card className="border-none shadow-sm">
            <CardHeader className="pb-4">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <CardTitle className="text-base flex items-center gap-2">
                    <TrendingUp className="h-4 w-4 text-primary" />
                    Detailed Performance
                  </CardTitle>
                  <CardDescription className="text-xs">
                    Metrics for the selected period across all ad instances.
                  </CardDescription>
                </div>
                <div className="flex items-center gap-2">
                  <Select value={days} onValueChange={onChangeDays}>
                    <SelectTrigger className="h-8 w-[140px] text-xs">
                      <SelectValue placeholder="Timeframe" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="7">Last 7 days</SelectItem>
                      <SelectItem value="14">Last 14 days</SelectItem>
                      <SelectItem value="30">Last 30 days</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button variant="ghost" size="icon" className="h-8 w-8" onClick={onRefreshPerformance} disabled={metricsLoading}>
                    <RefreshCw className={cn("h-4 w-4", metricsLoading && "animate-spin")} />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {providerId === 'facebook' ? (
                <div className="flex flex-col items-center justify-center py-10 text-center space-y-3">
                  <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center">
                    <Info className="h-6 w-6 text-muted-foreground" />
                  </div>
                  <div className="max-w-[300px]">
                    <p className="text-sm font-medium">Meta Creative Reporting</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Meta reports performance at the ad level. We aggregate these insights to give you a creative-centric view.
                    </p>
                  </div>
                  <Button variant="outline" size="sm" className="mt-4">
                    View Ad Breakdown
                  </Button>
                </div>
              ) : metricsError ? (
                <div className="p-4 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-sm flex items-center gap-2">
                  <AlertCircle className="h-4 w-4" />
                  {metricsError}
                </div>
              ) : metricsLoading && !performanceSummary ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                  {[1, 2, 3, 4, 5, 6].map(i => <div key={i} className="h-20 rounded-xl bg-muted animate-pulse" />)}
                </div>
              ) : performanceSummary ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                  <div className="p-4 rounded-xl bg-muted/30 border border-muted/20">
                    <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Spend</p>
                    <p className="text-xl font-bold mt-1">
                      {formatCurrency(performanceSummary.totalSpend, 'USD', { maximumFractionDigits: 0 })}
                    </p>
                  </div>
                  <div className="p-4 rounded-xl bg-muted/30 border border-muted/20">
                    <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Revenue</p>
                    <p className="text-xl font-bold mt-1">
                      {formatCurrency(performanceSummary.totalRevenue, 'USD', { maximumFractionDigits: 0 })}
                    </p>
                  </div>
                  <div className="p-4 rounded-xl bg-primary/10 border border-primary/20">
                    <p className="text-[10px] font-bold text-primary uppercase tracking-wider">ROAS</p>
                    <p className="text-xl font-bold mt-1 text-primary">{performanceSummary.roas.toFixed(2)}x</p>
                  </div>
                  <div className="p-4 rounded-xl bg-muted/30 border border-muted/20">
                    <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Impressions</p>
                    <p className="text-xl font-bold mt-1">{performanceSummary.totalImpressions.toLocaleString()}</p>
                  </div>
                  <div className="p-4 rounded-xl bg-muted/30 border border-muted/20">
                    <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Clicks</p>
                    <p className="text-xl font-bold mt-1">{performanceSummary.totalClicks.toLocaleString()}</p>
                  </div>
                  <div className="p-4 rounded-xl bg-muted/30 border border-muted/20">
                    <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">CTR</p>
                    <p className="text-xl font-bold mt-1">{performanceSummary.ctr.toFixed(2)}%</p>
                  </div>
                </div>
              ) : (
                <p className="text-sm text-muted-foreground py-10 text-center">No metrics found for this timeframe.</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="insights" className="mt-0 space-y-4">
          <Card className="border-none shadow-sm">
            <CardHeader className="pb-4">
              <CardTitle className="text-base flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-primary" />
                AI Creative Analysis
              </CardTitle>
              <CardDescription className="text-xs">
                Algorithmic suggestions to improve your creative performance.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {!performanceSummary ? (
                <div className="p-8 text-center border-2 border-dashed rounded-2xl">
                  <Zap className="h-10 w-10 text-muted-foreground/30 mx-auto mb-3" />
                  <p className="text-sm text-muted-foreground">Load performance metrics to generate AI insights.</p>
                  <Button variant="outline" size="sm" className="mt-4" onClick={onRefreshPerformance}>
                    Fetch Data
                  </Button>
                </div>
              ) : algorithmicInsights.length === 0 ? (
                <div className="p-8 text-center border-2 border-dashed rounded-2xl">
                  <p className="text-sm text-muted-foreground">No critical insights identified for this creative.</p>
                  <p className="text-xs text-muted-foreground mt-1">Keep monitoring performance as you scale spend.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-4">
                  {algorithmicInsights.map((insight, idx) => (
                    <div key={idx} className="group relative p-5 rounded-2xl bg-gradient-to-br from-background to-muted/20 border border-muted shadow-sm hover:border-primary/20 transition-all">
                      <div className="flex items-center justify-between gap-4 mb-2">
                        <p className="font-bold text-sm tracking-tight">{insight.title}</p>
                        {typeof insight.score === 'number' ? (
                          <div className="flex items-center gap-2">
                            <div className="h-1.5 w-12 bg-muted rounded-full overflow-hidden">
                              <div className="h-full bg-primary" style={{ width: `${insight.score}%` }} />
                            </div>
                            <span className="text-[10px] font-bold">{Math.round(insight.score)}%</span>
                          </div>
                        ) : (
                          <Badge variant="secondary" className="text-[10px] bg-primary/10 text-primary border-none">TIP</Badge>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground leading-relaxed mb-4">{insight.message}</p>

                      <div className="p-3 rounded-xl bg-primary/5 border border-primary/10">
                        <p className="text-[10px] font-bold text-primary uppercase tracking-widest mb-1 flex items-center gap-1">
                          <Zap className="h-3 w-3" /> Recommendation
                        </p>
                        <p className="text-xs font-medium">{insight.suggestion}</p>
                      </div>

                      <Button variant="ghost" size="icon" className="absolute top-2 right-2 h-7 w-7 opacity-0 group-hover:opacity-100">
                        <Plus className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="details" className="mt-0 space-y-4">
          <Card className="border-none shadow-sm">
            <CardHeader className="pb-4">
              <CardTitle className="text-base flex items-center gap-2">
                <Layout className="h-4 w-4 text-primary" />
                Technical Metadata
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-3 rounded-xl bg-muted/30 border border-muted/20">
                  <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-1">Creative ID</p>
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-xs font-mono truncate">{creative.creativeId}</p>
                    <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => onCopy(creative.creativeId, 'creativeId')}>
                      {copiedField === 'creativeId' ? <Check className="h-3 w-3 text-emerald-500" /> : <Copy className="h-3 w-3" />}
                    </Button>
                  </div>
                </div>
                <div className="p-3 rounded-xl bg-muted/30 border border-muted/20">
                  <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-1">Campaign ID</p>
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-xs font-mono truncate">{creative.campaignId}</p>
                    <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => onCopy(creative.campaignId, 'campaignId')}>
                      {copiedField === 'campaignId' ? <Check className="h-3 w-3 text-emerald-500" /> : <Copy className="h-3 w-3" />}
                    </Button>
                  </div>
                </div>
              </div>

              <Separator className="my-6" />

              <div className="space-y-4">
                {creative.imageUrl && (
                  <div className="p-3 rounded-xl border bg-background flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="h-10 w-10 rounded bg-muted flex items-center justify-center shrink-0">
                        <ImageIcon className="h-5 w-5 text-muted-foreground" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Source Image</p>
                        <p className="text-xs truncate text-primary">{creative.imageUrl}</p>
                      </div>
                    </div>
                    <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => onCopy(creative.imageUrl ?? '', 'imageUrl')}>
                      {copiedField === 'imageUrl' ? <Check className="h-3.5 w-3.5 text-emerald-500" /> : <Copy className="h-3.5 w-3.5" />}
                    </Button>
                  </div>
                )}

                {creative.videoUrl && (
                  <div className="p-3 rounded-xl border bg-background flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="h-10 w-10 rounded bg-muted flex items-center justify-center shrink-0">
                        <Video className="h-5 w-5 text-muted-foreground" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Source Video</p>
                        <p className="text-xs truncate text-primary">{creative.videoUrl}</p>
                      </div>
                    </div>
                    <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => onCopy(creative.videoUrl ?? '', 'videoUrl')}>
                      {copiedField === 'videoUrl' ? <Check className="h-3.5 w-3.5 text-emerald-500" /> : <Copy className="h-3.5 w-3.5" />}
                    </Button>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}