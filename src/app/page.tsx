import Image from 'next/image'
import Link from 'next/link'
import {
  ArrowRight,
  BarChart3,
  CheckCircle2,
  CheckSquare,
  CreditCard,
  FileText,
  MessageSquare,
  Shield,
  Star,
  Users,
  Zap,
} from 'lucide-react'

import {
  SiGmail,
  SiGoogleads,
  SiLinkedin,
  SiMeta,
  SiSlack,
  SiStripe,
  SiTiktok,
  SiWhatsapp,
} from 'react-icons/si'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import Chatbot from '@/components/chatbot'
import { FadeIn, FadeInItem, FadeInStagger } from '@/components/ui/animate-in'
import { HeroBackground } from '@/components/landing/hero-background'
import { SectionGlow } from '@/components/landing/section-glow'

const sellingPoints = [
  {
    title: 'Unified analytics',
    description: 'Aggregate performance from Google, Meta, TikTok, and LinkedIn in one command center.',
    image: '/ads-box.png',
  },
  {
    title: 'AI copilots for agencies',
    description: 'Draft proposals, surface insights, and answer client questions instantly with Cohorts AI.',
    image: '/ais-box.png',
  },
  {
    title: 'Client-ready reporting',
    description: 'Share live dashboards or scheduled PDFs with story-driven commentary and benchmarks.',
    image: '/report-box.png',
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
  { name: 'Google Ads', icon: SiGoogleads },
  { name: 'Meta Ads', icon: SiMeta },
  { name: 'TikTok Ads', icon: SiTiktok },
  { name: 'LinkedIn Ads', icon: SiLinkedin },
  { name: 'Stripe', icon: SiStripe },
  { name: 'Slack', icon: SiSlack },
  { name: 'Gmail', icon: SiGmail },
  { name: 'WhatsApp', icon: SiWhatsapp },
]

const differentiators = [
  'Bring finance, retention, and performance metrics into a single live view.',
  'Automate client status updates and meeting prep with AI summaries.',
  'Template proposals, scopes, and post-launch playbooks to ship faster.',
  'Forecast revenue and workload with pipeline-aware resource planning.',
]

export default function HomePage() {
  return (
    <div className="relative flex flex-col gap-20">
      <section className="relative isolate flex min-h-screen w-full items-center justify-center overflow-hidden bg-slate-950 text-white">
        <Image
          src="/hero-background.jpg"
          alt="Modern agency workspace overlooking a city skyline"
          fill
          priority
          className="absolute inset-0 -z-30 object-cover"
        />
        <div className="absolute inset-0 -z-20 bg-slate-950/70" />
        <HeroBackground />
        <FadeIn
          as="div"
          className="relative z-10 flex max-w-5xl flex-col items-center gap-8 px-6 pb-24 pt-12 text-center sm:pt-20"
        >
          <Image
            src="/logo_white.svg"
            alt="Cohorts logo"
            width={240}
            height={240}
            priority
            className="h-32 w-32 sm:h-40 sm:w-40 drop-shadow-2xl"
          />
          <h1 className="text-5xl font-bold tracking-tight text-white sm:text-6xl lg:text-7xl leading-[1.1]">
            Run every client engagement from one{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-300 via-indigo-300 to-purple-300">
              beautifully orchestrated
            </span>{' '}
            workspace.
          </h1>
          <p className="max-w-2xl text-lg text-slate-300 sm:text-xl leading-relaxed">
            Cohorts unifies analytics, project execution, finance visibility, and AI copilots so your team stays in flow
            and clients stay delighted. Scale retainers without scaling chaos.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4 mt-4">
            <Button asChild size="lg" className="h-14 px-8 text-lg bg-white text-slate-950 hover:bg-slate-200 transition-all hover:scale-105 shadow-xl shadow-white/10">
              <Link href="/auth">
                Launch dashboard
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
            <Button
              asChild
              variant="outline"
              size="lg"
              className="h-14 px-8 text-lg border-white/20 bg-white/5 text-white backdrop-blur-sm hover:bg-white/10 hover:text-white hover:border-white/40 transition-all"
            >
              <Link href="/#contact">Talk to sales</Link>
            </Button>
          </div>
        </FadeIn>
      </section>

      <FadeIn as="section" className="relative mx-auto w-full max-w-6xl space-y-12 text-center px-6">
        <div className="space-y-4">
          <Badge className="mx-auto bg-indigo-600/10 text-indigo-600 hover:bg-indigo-600/20 px-4 py-1.5 text-sm font-medium border-indigo-200">Operate Smarter</Badge>
          <h2 className="text-4xl font-bold tracking-tight text-slate-900 sm:text-5xl">Built for modern agency teams</h2>
          <p className="mx-auto max-w-2xl text-lg text-slate-600">
            Cohorts keeps analytics, AI copilots, and client-ready reporting together so your team can deliver faster
            with less juggling.
          </p>
        </div>
        <FadeInStagger className="grid gap-8 md:grid-cols-3">
          {sellingPoints.map((point) => (
            <FadeInItem key={point.title}>
              <Card className="group h-full overflow-hidden border-slate-200 bg-white shadow-sm transition-all duration-300 hover:-translate-y-2 hover:shadow-xl hover:shadow-indigo-500/10 hover:border-indigo-500/20">
                <CardHeader className="space-y-6 p-8">
                  <div className="relative aspect-[4/3] w-full overflow-hidden rounded-2xl bg-slate-50 p-4 transition-colors group-hover:bg-indigo-50/50">
                    <Image
                      src={point.image}
                      alt={point.title}
                      fill
                      className="object-contain transition-transform duration-500 group-hover:scale-110"
                      sizes="(min-width: 768px) 320px, 100vw"
                    />
                  </div>
                  <div className="space-y-2">
                    <CardTitle className="text-xl font-bold text-slate-900">{point.title}</CardTitle>
                    <CardDescription className="text-base text-slate-600 leading-relaxed">{point.description}</CardDescription>
                  </div>
                </CardHeader>
              </Card>
            </FadeInItem>
          ))}
        </FadeInStagger>
      </FadeIn>

      <FadeIn
        as="section"
        className="relative mx-auto grid w-full max-w-6xl gap-12 overflow-hidden rounded-3xl border border-slate-200 bg-gradient-to-br from-white to-slate-50 p-8 shadow-xl shadow-slate-200/50 sm:grid-cols-[1.25fr_1fr] sm:p-12"
      >
      
        <FadeInItem as="div" className="flex flex-col justify-center space-y-8">
          <div className="space-y-6">
            <h2 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">Why agencies choose Cohorts</h2>
            <ul className="space-y-4">
              {differentiators.map((item) => (
                <li key={item} className="flex items-start gap-3 text-slate-600">
                  <div className="mt-1 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
                    <CheckCircle2 className="h-4 w-4" />
                  </div>
                  <span className="text-base leading-relaxed">{item}</span>
                </li>
              ))}
            </ul>
          </div>
          <Card className="border-indigo-100 bg-indigo-50/50 shadow-none">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg font-semibold text-indigo-950">Ready to see Cohorts in action?</CardTitle>
              <CardDescription className="text-indigo-900/70">
                Sign in with Google to experience the live dashboard, AI assistant, and prebuilt workflows tailored to
                agencies.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 pt-0">
              <Button asChild className="w-full bg-indigo-600 text-white hover:bg-indigo-700 shadow-lg shadow-indigo-200">
                <Link href="/auth">
                  Try the dashboard now
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <p className="text-center text-xs font-medium text-indigo-900/50">
                No credit card required · 14-day free trial · Cancel anytime
              </p>
            </CardContent>
          </Card>
        </FadeInItem>
        <FadeInItem as="div" className="relative hidden min-h-[400px] overflow-hidden rounded-2xl shadow-2xl sm:block">
          <Image
            src="/agency.jpg"
            alt="Agency strategist reviewing campaign plans in a modern office"
            fill
            className="object-cover transition-transform duration-700 hover:scale-105"
            sizes="(min-width: 640px) 320px, 100vw"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-900/20 to-transparent" />
        </FadeInItem>
      </FadeIn>

      <div className="w-full bg-slate-50 py-24">
        <FadeIn as="section" id="features" className="relative mx-auto flex w-full max-w-7xl flex-col gap-16 px-6 lg:px-8">
          <div className="mx-auto max-w-3xl space-y-6 text-center">
            <Badge variant="outline" className="border-indigo-200 bg-indigo-50 px-4 py-1.5 text-sm font-medium text-indigo-700">
              Features
            </Badge>
            <h2 className="text-4xl font-bold tracking-tight text-slate-900 sm:text-5xl">
              Everything your agency needs to run on autopilot
            </h2>
            <p className="text-xl text-slate-600 leading-relaxed">
              Cohorts consolidates the tool stack for high-performing agencies. Automate workflows, wow clients, and keep
              revenue predictable.
            </p>
          </div>
          <FadeInStagger className="grid gap-8 md:grid-cols-2 xl:grid-cols-3">
            {features.map((feature) => (
              <FadeInItem key={feature.title}>
                <Card className="group h-full border-slate-200 bg-white transition-all duration-300 hover:-translate-y-1 hover:border-indigo-200 hover:shadow-xl hover:shadow-indigo-500/5">
                  <CardHeader className="space-y-6 p-8">
                    <div className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600 ring-1 ring-indigo-100 transition-all duration-300 group-hover:bg-indigo-600 group-hover:text-white group-hover:ring-indigo-600 group-hover:shadow-lg group-hover:shadow-indigo-500/30">
                      <feature.icon className="h-7 w-7" />
                    </div>
                    <div className="space-y-3">
                      <CardTitle className="text-xl font-bold text-slate-900">{feature.title}</CardTitle>
                      <CardDescription className="text-base leading-relaxed text-slate-600">
                        {feature.description}
                      </CardDescription>
                    </div>
                  </CardHeader>
                </Card>
              </FadeInItem>
            ))}
          </FadeInStagger>
        </FadeIn>
      </div>

      <div className="w-full bg-white py-24">
        <FadeIn as="section" id="testimonials" className="relative mx-auto flex w-full max-w-7xl flex-col gap-16 px-6 lg:px-8">
          <div className="mx-auto max-w-3xl space-y-6 text-center">
            <Badge variant="outline" className="border-indigo-200 bg-indigo-50 px-4 py-1.5 text-sm font-medium text-indigo-700">
              Testimonials
            </Badge>
            <h2 className="text-4xl font-bold tracking-tight text-slate-900 sm:text-5xl">
              Trusted by agency owners worldwide
            </h2>
            <p className="text-xl text-slate-600 leading-relaxed">
              See how Cohorts is helping agencies scale faster and deliver better results for their clients.
            </p>
          </div>
          <FadeInStagger className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {testimonials.map((testimonial) => (
              <FadeInItem key={testimonial.name}>
                <Card className="h-full border-slate-200 bg-slate-50/50 p-8 transition-all duration-300 hover:border-indigo-200 hover:bg-white hover:shadow-xl hover:shadow-indigo-500/5">
                  <CardContent className="flex h-full flex-col justify-between gap-8 p-0">
                    <div className="space-y-4">
                      <div className="flex gap-1 text-amber-400">
                        {[...Array(5)].map((_, i) => (
                          <Star key={i} className="h-5 w-5 fill-current" />
                        ))}
                      </div>
                      <p className="text-lg leading-relaxed text-slate-700 italic">
                        &quot;{testimonial.quote}&quot;
                      </p>
                    </div>
                    <div className="flex items-center gap-4">
                      <Avatar className="h-12 w-12 ring-2 ring-white shadow-sm">
                        <AvatarFallback className="bg-indigo-100 text-indigo-700 font-semibold">
                          {testimonial.initials}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-semibold text-slate-900">{testimonial.name}</p>
                        <p className="text-sm text-slate-500">{testimonial.role}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </FadeInItem>
            ))}
          </FadeInStagger>
        </FadeIn>
      </div>

      <div className="w-full bg-slate-50 py-24">
        <FadeIn as="section" id="integrations" className="relative mx-auto flex w-full max-w-7xl flex-col gap-16 px-6 lg:px-8">
          <div className="mx-auto max-w-3xl space-y-6 text-center">
            <Badge variant="outline" className="border-indigo-200 bg-indigo-50 px-4 py-1.5 text-sm font-medium text-indigo-700">
              Integrations
            </Badge>
            <h2 className="text-4xl font-bold tracking-tight text-slate-900 sm:text-5xl">
              Connect your entire ecosystem
            </h2>
            <p className="text-xl text-slate-600 leading-relaxed">
              Plug Cohorts into your ad networks, finance stack, and collaboration tools to power richer insights.
            </p>
          </div>
          <FadeInStagger className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {integrations.map((integration) => (
              <FadeInItem key={integration.name}>
                <Card className="group border-slate-200 bg-white transition-all duration-300 hover:-translate-y-1 hover:border-indigo-200 hover:shadow-lg hover:shadow-indigo-500/5">
                  <CardContent className="flex flex-col items-center gap-4 p-8">
                    <integration.icon className="h-12 w-12 text-slate-400 transition-colors group-hover:text-indigo-600" />
                    <h3 className="text-lg font-semibold text-slate-900">{integration.name}</h3>
                  </CardContent>
                </Card>
              </FadeInItem>
            ))}
          </FadeInStagger>
        </FadeIn>
      </div>

      <FadeIn as="section" id="contact" className="relative mx-auto mb-24 w-full max-w-7xl px-6 lg:px-8">
        <div className="relative overflow-hidden rounded-3xl bg-slate-900 shadow-2xl">
          <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/20 via-purple-500/20 to-pink-500/20" />
          <div className="grid gap-12 p-8 md:grid-cols-2 lg:p-16">
            <div className="flex flex-col justify-center space-y-8">
              <div className="space-y-4">
                <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
                  Strategists ready to help every step of the way
                </h2>
                <p className="text-lg text-slate-300 leading-relaxed">
                  Talk with an onboarding specialist, explore best practices, or invite Cohorts AI to audit your existing
                  workflows. We make migrating painless.
                </p>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="rounded-xl bg-white/5 p-4 backdrop-blur-sm ring-1 ring-white/10">
                  <div className="flex items-start gap-3">
                    <Shield className="mt-1 h-5 w-5 text-indigo-400" />
                    <div>
                      <p className="font-semibold text-white">Security-first</p>
                      <p className="text-sm text-slate-400">SOC 2 controls & SSO</p>
                    </div>
                  </div>
                </div>
                <div className="rounded-xl bg-white/5 p-4 backdrop-blur-sm ring-1 ring-white/10">
                  <div className="flex items-start gap-3">
                    <Zap className="mt-1 h-5 w-5 text-indigo-400" />
                    <div>
                      <p className="font-semibold text-white">Concierge onboarding</p>
                      <p className="text-sm text-slate-400">Tailored migration plans</p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="flex flex-col gap-4 sm:flex-row">
                <Button asChild size="lg" className="bg-white text-slate-900 hover:bg-slate-100">
                  <Link href="mailto:hello@cohorts.app">
                    Email us
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
                <Button asChild variant="outline" size="lg" className="border-white/20 bg-white/5 text-white hover:bg-white/10 hover:text-white hover:border-white/40">
                  <Link href="/auth">Book a live demo</Link>
                </Button>
              </div>
            </div>
            <div className="relative min-h-[300px] overflow-hidden rounded-2xl bg-slate-800 lg:min-h-[400px]">
              <Image
                src="/handshakes.png"
                alt="Agency partners shaking hands"
                fill
                className="object-cover opacity-90 mix-blend-overlay"
                sizes="(min-width: 768px) 50vw, 100vw"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-transparent" />
            </div>
          </div>
        </div>
      </FadeIn>

      <Chatbot />
    </div>
  )
}
