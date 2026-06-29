"use client";
import { Link } from '@/shared/ui/link';
import { Suspense } from "react";
import { FeaturesBento } from "@/features/marketing/home/components/features-bento";
import { HeroBackground } from "@/features/marketing/home/components/hero-background";
import { SectionGlow } from "@/features/marketing/home/components/section-glow";
import { HOME_HERO_BRAND_ORDER, PlatformLogoStrip } from "@/features/marketing/home/components/platform-brand-logos";
import { FeaturesSection } from "@/features/marketing/home/components/features-section";
import { HERO_HEADLINE, HERO_SUBHEAD } from "@/features/marketing/home/components/home-content";
import { MinifiedSoftwarePreview } from "@/features/marketing/home/components/minified-software-preview";
import { OperationsExpansionSection } from "@/features/marketing/home/components/operations-expansion-section";
import { SupportProofSection } from "@/features/marketing/home/components/support-proof-section";
import { authClient } from "@/lib/auth-client";
import { FadeIn } from "@/shared/ui/animate-in";
import { PageSkeletonBoundary } from '@/shared/ui/page-skeleton-boundary';
import { RevealTransition, RevealTransitionFallback } from '@/shared/ui/page-transition';
import { MarketingHomePageSkeleton } from '@/features/marketing/home/components/marketing-home-page-skeleton';
const HOME_PAGE_FALLBACK = (<RevealTransitionFallback>
    <MarketingHomePageSkeleton />
  </RevealTransitionFallback>);
function resolveDashboardDestination(): string {
    if (typeof window !== 'undefined') {
        const lastTab = window.localStorage.getItem('cohorts_last_tab');
        if (lastTab === '/for-you' || lastTab?.startsWith('/for-you')) {
            return '/for-you';
        }
        if (lastTab?.startsWith('/dashboard')) {
            return lastTab;
        }
    }
    return '/for-you';
}
function HomePageContent() {
    const { data: session, isPending: sessionPending } = authClient.useSession();
    const user = session?.user ?? null;
    // Server-side beforeLoad on / handles redirecting authenticated users.
    // Client-side redirect is intentionally omitted to avoid cookie-cache loops.
    return (<RevealTransition>
      <PageSkeletonBoundary loading={sessionPending && !user} loadingContent={<MarketingHomePageSkeleton />}>
      <div className="w-full bg-background">
      {/* ── Hero section ── */}
      <section className="relative overflow-hidden border-b border-primary/10 px-6 pb-16 pt-24 text-center">
        <HeroBackground />
        <div className="relative z-10 mx-auto max-w-6xl">
          <div className="mx-auto max-w-4xl">
            <div className="mb-8 inline-flex items-center rounded-full border border-primary/20 bg-primary/[0.08] px-4 py-1.5 text-sm font-medium text-foreground shadow-sm shadow-primary/5 backdrop-blur-md">
              <span className="mr-2 size-2 rounded-full bg-primary shadow-[0_0_8px_rgb(from_var(--primary)_r_g_b_/_0.45)]" aria-hidden="true"/>
              Now in public beta
            </div>

            <h1 className="text-4xl leading-tight tracking-tight text-foreground sm:text-5xl lg:text-6xl xl:text-7xl">
              {HERO_HEADLINE}
            </h1>

            <p className="mx-auto mt-6 max-w-2xl text-base leading-relaxed text-muted-foreground sm:text-lg">
              {HERO_SUBHEAD}
            </p>

            <div className="mx-auto mt-10 max-w-xl space-y-3 rounded-2xl border border-primary/10 bg-primary/[0.04] px-5 py-4">
              <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-primary/70">
                Native connectors
              </p>
              <PlatformLogoStrip brands={HOME_HERO_BRAND_ORDER} variant="pill"/>
            </div>

            <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Link href="/auth?tab=signup" className="rounded-full bg-primary px-8 py-3 text-sm font-semibold text-primary-foreground shadow-lg shadow-primary/25 transition-all duration-200 motion-reduce:transition-none motion-reduce:hover:scale-100 hover:scale-[1.02] hover:shadow-xl hover:shadow-primary/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background">
                Get started free
              </Link>
              <Link href="/auth?tab=signin" className="rounded-full border border-primary/20 bg-background/70 px-8 py-3 text-sm font-semibold text-foreground shadow-sm backdrop-blur-sm transition-colors duration-200 hover:border-primary/30 hover:bg-primary/[0.06] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 focus-visible:ring-offset-2 focus-visible:ring-offset-background">
                Sign in
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="relative overflow-hidden border-t border-border/40 bg-gradient-to-b from-background via-primary/[0.03] to-background px-6 py-14 sm:py-16">
        <SectionGlow variant="features"/>
        <div className="mx-auto max-w-6xl space-y-5">
          <div className="text-center">
            <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">
              Interactive preview
            </p>
            <p className="mx-auto mt-2 max-w-lg text-sm text-muted-foreground">
              Explore a live sample of the workspace - switch sections, inspect metrics, and hover to pause the tour.
            </p>
          </div>
          <MinifiedSoftwarePreview />
        </div>
      </section>

      {/* ── Features highlight ── */}
      <FeaturesSection />

      {/* ── Features bento ── */}
      <section className="relative overflow-hidden bg-gradient-to-b from-primary/[0.04] via-muted/30 to-background py-16 sm:py-24">
        <SectionGlow variant="integrations"/>
        <div className="mx-auto max-w-6xl px-6">
          <FadeIn className="mb-16 text-center">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-muted-foreground">Features</p>
            <h2 className="mt-3 text-3xl text-foreground sm:text-4xl">
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
      <section className="relative overflow-hidden border-t border-border/40 bg-gradient-to-b from-background via-secondary/[0.04] to-primary/[0.06] px-6 py-24">
        <SectionGlow variant="contact"/>
        <div className="relative mx-auto max-w-4xl rounded-3xl border border-primary/15 bg-card p-8 shadow-xl shadow-primary/[0.08] sm:p-12">
          <FadeIn className="text-center">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-muted-foreground">Get Started</p>
            <h2 className="mt-3 text-3xl text-foreground sm:text-4xl">
              Start your free workspace on a dedicated sign-in page
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-muted-foreground">
              Create your account or sign back in without leaving the marketing flow. Teams, clients, and admins all enter through the same focused auth experience.
            </p>
            <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Link href="/auth?tab=signup" className="rounded-full bg-primary px-8 py-3 text-sm font-semibold text-primary-foreground shadow-md transition-all duration-200 motion-reduce:transition-none motion-reduce:hover:scale-100 hover:scale-[1.02] hover:opacity-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background">
                Create account
              </Link>
              <Link href="/auth?tab=signin" className="rounded-full border border-border px-8 py-3 text-sm font-semibold text-foreground transition-colors duration-200 hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40">
                Sign in
              </Link>
            </div>
          </FadeIn>
        </div>
      </section>
      </div>
      </PageSkeletonBoundary>
    </RevealTransition>);
}
export default function HomePage() {
    return <Suspense fallback={HOME_PAGE_FALLBACK}><HomePageContent /></Suspense>;
}
