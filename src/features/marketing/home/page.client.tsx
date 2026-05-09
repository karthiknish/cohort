"use client"

import Link from 'next/link'
import { LoaderCircle } from "lucide-react"
import { redirect } from "next/navigation"
import { Suspense } from "react"

import { FeaturesBento } from "@/features/marketing/home/components/features-bento"
import { HOME_HERO_BRAND_ORDER, PlatformLogoStrip } from "@/features/marketing/home/components/platform-brand-logos"
import { FeaturesSection } from "@/features/marketing/home/components/features-section"
import { HERO_HEADLINE, HERO_SUBHEAD } from "@/features/marketing/home/components/home-content"
import { MinifiedSoftwarePreview } from "@/features/marketing/home/components/minified-software-preview"
import { OperationsExpansionSection } from "@/features/marketing/home/components/operations-expansion-section"
import { SupportProofSection } from "@/features/marketing/home/components/support-proof-section"
import { authClient } from "@/lib/auth-client"
import { FadeIn } from "@/shared/ui/animate-in"
import { BoneyardSkeletonBoundary } from '@/shared/ui/boneyard-skeleton-boundary'
import { RevealTransition, RevealTransitionFallback } from '@/shared/ui/page-transition'

const HOME_PAGE_FALLBACK = (
  <RevealTransitionFallback>
    <div className="flex min-h-screen items-center justify-center bg-background px-6 py-12">
      <LoaderCircle className="h-6 w-6 animate-spin text-muted-foreground" />
    </div>
  </RevealTransitionFallback>
)

function resolveDashboardDestination(): string {
  if (typeof window !== 'undefined') {
    const lastTab = window.localStorage.getItem('cohorts_last_tab')
    if (lastTab === '/for-you') {
      return '/dashboard/for-you'
    }
    if (lastTab?.startsWith('/dashboard')) {
      return lastTab
    }
  }

  return '/dashboard'
}

function HomePageContent() {
  const { data: session, isPending: sessionPending } = authClient.useSession()
  const user = session?.user ?? null
  const authenticatedDestination = !sessionPending && user ? resolveDashboardDestination() : null

  if (authenticatedDestination) {
    redirect(authenticatedDestination)
  }

  return (
    <RevealTransition>
      <BoneyardSkeletonBoundary
        name="marketing-home-page"
        loading={sessionPending && !user}
        loadingContent={HOME_PAGE_FALLBACK}
      >
      <div className="w-full bg-background">
      {/* ── Hero: tokens come from .theme-marketing-light under html.dark (layout) ── */}
      <section className="relative overflow-hidden border-b border-border/40 bg-background px-6 pb-16 pt-24 text-center">
        <div className="relative z-10 mx-auto max-w-6xl">
          <div className="mx-auto max-w-4xl">
            <div className="mb-8 inline-flex items-center rounded-full border border-border/60 bg-muted/40 px-4 py-1.5 text-sm font-medium text-foreground backdrop-blur-sm">
              <span className="mr-2 h-2 w-2 rounded-full bg-accent" aria-hidden="true" />
              Now in public beta
            </div>

            <h1 className="text-4xl font-bold leading-tight tracking-tight text-foreground sm:text-5xl lg:text-6xl xl:text-7xl">
              {HERO_HEADLINE}
            </h1>

            <p className="mx-auto mt-6 max-w-2xl text-base leading-relaxed text-muted-foreground sm:text-lg">
              {HERO_SUBHEAD}
            </p>

            <div className="mx-auto mt-10 max-w-xl space-y-3 text-center">
              <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-muted-foreground">
                Native connectors
              </p>
              <PlatformLogoStrip brands={HOME_HERO_BRAND_ORDER} variant="pill" />
            </div>

            <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Link
                href="/auth?tab=signup"
                className="rounded-full bg-accent px-8 py-3 text-sm font-semibold text-accent-foreground shadow-md transition-all duration-200 motion-reduce:transition-none motion-reduce:hover:scale-100 hover:scale-[1.02] hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-background"
              >
                Get started free
              </Link>
              <Link
                href="/auth?tab=signin"
                className="rounded-full border border-border bg-card px-8 py-3 text-sm font-semibold text-foreground shadow-sm transition-colors duration-200 hover:bg-muted/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40"
              >
                Sign in
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="border-t border-border/40 bg-muted/20 px-6 py-14 sm:py-16 dark:bg-muted/15">
        <div className="mx-auto max-w-6xl space-y-4">
          <p className="text-center text-[11px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">
            Interactive preview · sample data
          </p>
          <MinifiedSoftwarePreview />
        </div>
      </section>

      {/* ── Features highlight ── */}
      <FeaturesSection />

      {/* ── Features bento ── */}
      <section className="bg-muted/25 py-16 sm:py-24 dark:bg-muted/20">
        <div className="mx-auto max-w-6xl px-6">
          <FadeIn className="mb-16 text-center">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-muted-foreground">Features</p>
            <h2 className="mt-3 text-3xl font-bold text-foreground sm:text-4xl">
              Everything your agency runs on, now with operational depth
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-muted-foreground">
              One platform. Every workflow. From first proposal to daily operations and internal support.
            </p>
          </FadeIn>
          <FeaturesBento />
        </div>
      </section>

      <OperationsExpansionSection />
      <SupportProofSection />

      {/* ── CTA ── */}
      <section className="border-t border-border/40 bg-muted/15 px-6 py-24 dark:bg-muted/10">
        <div className="mx-auto max-w-4xl rounded-3xl border border-border/60 bg-card p-8 shadow-xl shadow-black/[0.04] sm:p-12">
          <FadeIn className="text-center">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-muted-foreground">Get Started</p>
            <h2 className="mt-3 text-3xl font-bold text-foreground sm:text-4xl">
              Start your free workspace on a dedicated sign-in page
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-muted-foreground">
              Create your account or sign back in without leaving the marketing flow. Teams, clients, and admins all enter through the same focused auth experience.
            </p>
            <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Link
                href="/auth?tab=signup"
                className="rounded-full bg-accent px-8 py-3 text-sm font-semibold text-accent-foreground shadow-md transition-all duration-200 motion-reduce:transition-none motion-reduce:hover:scale-100 hover:scale-[1.02] hover:opacity-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-background"
              >
                Create account
              </Link>
              <Link
                href="/auth?tab=signin"
                className="rounded-full border border-border px-8 py-3 text-sm font-semibold text-foreground transition-colors duration-200 hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40"
              >
                Sign in
              </Link>
            </div>
          </FadeIn>
        </div>
      </section>
      </div>
      </BoneyardSkeletonBoundary>
    </RevealTransition>
  )
}

export default function HomePage() {
  return <Suspense fallback={HOME_PAGE_FALLBACK}><HomePageContent /></Suspense>
}
