import Link from 'next/link'
import {
  ArrowRight,
  BarChart3,
  CheckCircle2,
  CheckSquare,
  CreditCard,
  Facebook,
  FileText,
  Linkedin,
  Mail,
  MessageSquare,
  Music,
  Search,
  Shield,
  Slack,
  Sparkles,
  Star,
  Users,
  Zap,
  PhoneCall,
} from 'lucide-react'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { cn } from '@/lib/utils'
import Chatbot from '@/components/chatbot'
import { FadeIn, FadeInItem, FadeInStagger } from '@/components/ui/animate-in'
import { HeroBackground } from '@/components/landing/hero-background'
import { SectionGlow } from '@/components/landing/section-glow'

const sellingPoints = [
  {
    title: 'Unified analytics',
    description: 'Aggregate performance from Google, Meta, TikTok, and LinkedIn in one command center.',
    icon: BarChart3,
  },
  {
    title: 'AI copilots for agencies',
    description: 'Draft proposals, surface insights, and answer client questions instantly with Cohorts AI.',
    icon: Sparkles,
  },
  {
    title: 'Client-ready reporting',
    description: 'Share live dashboards or scheduled PDFs with story-driven commentary and benchmarks.',
    icon: CheckCircle2,
  },
]

const features = [
  {
    icon: BarChart3,
    title: 'Advanced Analytics',
    description:
      'Real-time insights across all ad platforms with AI-powered optimizations and trend forecasting.',
  },
  {
    icon: Users,
    title: 'Client Management',
    description:
      'Centralize client profiles, campaign history, and reporting in one organized command center.',
  },
  {
    icon: CheckSquare,
    title: 'Workflow Automation',
    description:
      'Assign tasks, automate approvals, and keep teams aligned with shared playbooks and automations.',
  },
  {
    icon: CreditCard,
    title: 'Finance Visibility',
    description: 'Monitor retainers, track invoices, and forecast revenue without bouncing between tools.',
  },
  {
    icon: FileText,
    title: 'Proposal Generator',
    description: 'Ship polished proposals and scopes in minutes with AI-driven templates and reusable sections.',
  },
  {
    icon: MessageSquare,
    title: 'Collaboration Hub',
    description: 'Keep chat, files, and project updates flowing in one place with context-aware AI assistance.',
  },
]

const testimonials = [
  {
    name: 'Sarah Johnson',
    role: 'CEO · Digital Agency Pro',
    quote:
      'Cohorts transformed how we manage clients. The AI insights alone boosted our ROAS by 35% in a quarter.',
    initials: 'SJ',
  },
  {
    name: 'Michael Chen',
    role: 'Marketing Director · GrowthCo',
    quote:
      'Everything we need is finally in one workspace—projects, finance, and reporting. Our team saves hours daily.',
    initials: 'MC',
  },
  {
    name: 'Emily Rodriguez',
    role: 'Founder · Creative Solutions',
    quote:
      'The proposal generator and client-ready dashboards help us win more retainers and keep clients in the loop.',
    initials: 'ER',
  },
]

const integrations = [
  { name: 'Google Ads', icon: Search, badgeClass: 'bg-blue-50 text-blue-700' },
  { name: 'Meta Ads', icon: Facebook, badgeClass: 'bg-sky-50 text-sky-700' },
  { name: 'TikTok Ads', icon: Music, badgeClass: 'bg-zinc-900 text-white' },
  { name: 'LinkedIn Ads', icon: Linkedin, badgeClass: 'bg-sky-50 text-sky-700' },
  { name: 'Stripe', icon: CreditCard, badgeClass: 'bg-purple-50 text-purple-700' },
  { name: 'Slack', icon: Slack, badgeClass: 'bg-fuchsia-50 text-fuchsia-700' },
  { name: 'Gmail', icon: Mail, badgeClass: 'bg-red-50 text-red-700' },
  { name: 'WhatsApp', icon: PhoneCall, badgeClass: 'bg-green-50 text-green-700' },
]

const differentiators = [
  'Bring finance, retention, and performance metrics into a single live view.',
  'Automate client status updates and meeting prep with AI summaries.',
  'Template proposals, scopes, and post-launch playbooks to ship faster.',
  'Forecast revenue and workload with pipeline-aware resource planning.',
]

export default function HomePage() {
  return (
    <div className="relative flex flex-col gap-20 px-6 py-12">
      <HeroBackground />
      <FadeIn as="section" className="mx-auto flex w-full max-w-5xl flex-col items-center gap-6 text-center pt-12 sm:pt-16">
        <Badge variant="secondary" className="border border-primary/20 bg-primary/5 text-primary">
          Marketing agency growth OS
        </Badge>
        <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
          Run every client engagement from one beautifully orchestrated workspace.
        </h1>
        <p className="max-w-2xl text-sm text-muted-foreground sm:text-base">
          Cohorts unifies analytics, project execution, finance visibility, and AI copilots so your team stays in flow
          and clients stay delighted. Scale retainers without scaling chaos.
        </p>
        <div className="flex flex-wrap items-center justify-center gap-3">
          <Button asChild size="lg">
            <Link href="/auth">
              Launch dashboard
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
          <Button asChild variant="outline" size="lg">
            <Link href="/#contact">Talk to sales</Link>
          </Button>
        </div>
      </FadeIn>

      <FadeInStagger as="section" className="relative mx-auto grid w-full max-w-5xl gap-6 md:grid-cols-3">
        <SectionGlow variant="features" className="-inset-x-20 -top-12 h-[22rem]" />
        {sellingPoints.map((point) => (
          <FadeInItem key={point.title}>
            <Card className="shadow-sm transition hover:shadow-md">
              <CardHeader>
                <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                  <point.icon className="h-5 w-5 text-primary" />
                </span>
                <CardTitle className="text-lg">{point.title}</CardTitle>
                <CardDescription>{point.description}</CardDescription>
              </CardHeader>
            </Card>
          </FadeInItem>
        ))}
      </FadeInStagger>

      <FadeIn as="section" className="relative mx-auto grid w-full max-w-5xl gap-6 overflow-hidden rounded-2xl border bg-white/80 p-8 shadow-sm sm:grid-cols-[1.2fr_1fr]">
        <SectionGlow variant="features" className="-left-40 -top-32 h-[26rem] opacity-80" />
        <FadeInItem as="div" className="space-y-4">
          <h2 className="text-2xl font-semibold tracking-tight">Why agencies choose Cohorts</h2>
          <ul className="space-y-3 text-sm text-muted-foreground">
            {differentiators.map((item) => (
              <li key={item} className="flex items-start gap-2">
                <CheckCircle2 className="mt-0.5 h-4 w-4 text-primary" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </FadeInItem>
        <FadeInItem as="div">
          <Card className="border-primary/20 bg-primary/5">
            <CardHeader>
              <CardTitle className="text-lg">Ready to see Cohorts in action?</CardTitle>
              <CardDescription>
                Sign in with Google to experience the live dashboard, AI assistant, and prebuilt workflows tailored to
                agencies.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button asChild className="w-full">
                <Link href="/auth">
                  Try the dashboard now
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <p className="text-xs text-muted-foreground">
                No credit card required · 14-day free trial · Cancel anytime
              </p>
            </CardContent>
          </Card>
        </FadeInItem>
      </FadeIn>

      <FadeIn as="section" id="features" className="relative mx-auto flex w-full max-w-6xl flex-col gap-10 overflow-hidden">
        <SectionGlow variant="features" className="-inset-x-32 -top-24 h-[26rem]" />
        <div className="space-y-3 text-center">
          <Badge className="bg-primary text-primary-foreground">Features</Badge>
          <h2 className="text-3xl font-semibold tracking-tight">Everything your agency needs to run on autopilot</h2>
          <p className="text-sm text-muted-foreground sm:text-base">
            Cohorts consolidates the tool stack for high-performing agencies. Automate workflows, wow clients, and keep
            revenue predictable.
          </p>
        </div>
        <FadeInStagger className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {features.map((feature) => (
            <FadeInItem key={feature.title}>
              <Card className="h-full border-muted/60">
                <CardHeader className="space-y-3">
                  <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary">
                    <feature.icon className="h-5 w-5" />
                  </span>
                  <CardTitle className="text-lg">{feature.title}</CardTitle>
                  <CardDescription>{feature.description}</CardDescription>
                </CardHeader>
              </Card>
            </FadeInItem>
          ))}
        </FadeInStagger>
      </FadeIn>

      <FadeIn as="section" id="testimonials" className="relative mx-auto w-full max-w-6xl space-y-8 overflow-hidden">
        <SectionGlow variant="testimonials" className="-left-32 -top-10 h-[28rem]" />
        <div className="flex flex-col gap-3 text-center">
          <Badge variant="outline" className="mx-auto border-primary/40 text-primary">
            Proven by agencies
          </Badge>
          <h2 className="text-3xl font-semibold tracking-tight">Teams trust Cohorts to deliver results</h2>
          <p className="text-sm text-muted-foreground sm:text-base">
            From boutique shops to global teams, agencies rely on Cohorts to keep clients informed and operations sharp.
          </p>
        </div>
        <FadeInStagger className="grid gap-6 md:grid-cols-3">
          {testimonials.map((testimonial) => (
            <FadeInItem key={testimonial.name}>
              <Card className="h-full border-muted/60">
                <CardHeader className="space-y-4">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-10 w-10 border">
                      <AvatarFallback>{testimonial.initials}</AvatarFallback>
                    </Avatar>
                    <div className="text-left">
                      <p className="text-sm font-semibold">{testimonial.name}</p>
                      <p className="text-xs text-muted-foreground">{testimonial.role}</p>
                    </div>
                  </div>
                  <CardDescription className="text-sm leading-relaxed text-foreground/80">
                    “{testimonial.quote}”
                  </CardDescription>
                  <div className="flex items-center gap-1 text-amber-500">
                    {Array.from({ length: 5 }).map((_, index) => (
                      <Star key={index} className="h-4 w-4 fill-current" />
                    ))}
                  </div>
                </CardHeader>
              </Card>
            </FadeInItem>
          ))}
        </FadeInStagger>
      </FadeIn>

      <FadeIn as="section" id="integrations" className="relative mx-auto flex w-full max-w-6xl flex-col gap-10 overflow-hidden">
        <SectionGlow variant="integrations" className="-right-32 -top-16 h-[26rem]" />
        <div className="space-y-3 text-center">
          <Badge variant="outline" className="mx-auto border-primary/40 text-primary">
            Integrations
          </Badge>
          <h2 className="text-3xl font-semibold tracking-tight">Connect your entire ecosystem in minutes</h2>
          <p className="text-sm text-muted-foreground sm:text-base">
            Plug Cohorts into your ad networks, finance stack, and collaboration tools to power richer insights.
          </p>
        </div>
        <FadeInStagger className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {integrations.map((integration) => (
            <FadeInItem key={integration.name}>
              <Card className="border-muted/60 bg-background">
                <CardContent className="flex flex-col items-center gap-3 p-6">
                  <span className={cn('flex h-12 w-12 items-center justify-center rounded-full', integration.badgeClass)}>
                    <integration.icon className="h-6 w-6" />
                  </span>
                  <h3 className="text-sm font-semibold">{integration.name}</h3>
                </CardContent>
              </Card>
            </FadeInItem>
          ))}
        </FadeInStagger>
      </FadeIn>

      <FadeIn as="section" id="contact" className="relative mx-auto w-full max-w-5xl overflow-hidden rounded-2xl border bg-white/90 shadow-sm">
        <SectionGlow variant="contact" className="-right-24 -top-16 h-[30rem]" />
        <div className="grid gap-8 p-8 md:grid-cols-[1.4fr_1fr]">
          <FadeInItem as="div" className="space-y-4">
            <Badge variant="outline" className="border-primary/40 text-primary">
              Support
            </Badge>
            <h2 className="text-3xl font-semibold tracking-tight">Strategists ready to help every step of the way</h2>
            <p className="text-sm text-muted-foreground sm:text-base">
              Talk with an onboarding specialist, explore best practices, or invite Cohorts AI to audit your existing
              workflows. We make migrating painless.
            </p>
            <div className="grid gap-3 sm:grid-cols-2">
              <Card className="border-muted/60 bg-background">
                <CardContent className="flex items-start gap-3 p-4">
                  <Shield className="mt-1 h-5 w-5 text-primary" />
                  <div>
                    <p className="text-sm font-semibold">Security-first by design</p>
                    <p className="text-xs text-muted-foreground">SOC 2 controls, SSO, and data residency options.</p>
                  </div>
                </CardContent>
              </Card>
              <Card className="border-muted/60 bg-background">
                <CardContent className="flex items-start gap-3 p-4">
                  <Zap className="mt-1 h-5 w-5 text-primary" />
                  <div>
                    <p className="text-sm font-semibold">Concierge onboarding</p>
                    <p className="text-xs text-muted-foreground">Migration playbooks tailored to your client roster.</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </FadeInItem>
          <FadeInItem as="div">
            <Card className="border-primary/20 bg-primary/5">
              <CardHeader className="space-y-3">
                <CardTitle className="text-xl">Talk to our team</CardTitle>
                <CardDescription>
                  Get a guided walkthrough or have Cohorts AI audit your current workflows to map a roll-out plan.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button asChild className="w-full">
                  <Link href="mailto:hello@cohorts.app">
                    Email us at hello@cohorts.app
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
                <Button asChild variant="outline" className="w-full">
                  <Link href="/auth">Book a live demo</Link>
                </Button>
              </CardContent>
            </Card>
          </FadeInItem>
        </div>
      </FadeIn>

      <Chatbot />
    </div>
  )
}
