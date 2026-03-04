'use client'

import Link from 'next/link'
import {
  Shield,
  Database,
  Eye,
  Lock,
  Clock,
  UserCheck,
  Globe,
  Share2,
  RefreshCw,
  ArrowLeft,
} from 'lucide-react'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { FadeIn, FadeInStagger, FadeInItem } from '@/components/ui/animate-in'

const sections = [
  {
    title: 'Information We Collect',
    icon: Database,
    description:
      'We collect information you provide directly, including account details, client data, and communications. We also collect usage data such as analytics, device information, and cookies to improve our services.',
  },
  {
    title: 'How We Use Information',
    icon: Eye,
    description:
      'Information is used to deliver and improve the Cohorts platform, personalize user experiences, provide support, and communicate important updates or marketing content (with consent).',
  },
  {
    title: 'Data Sharing and Disclosure',
    icon: Share2,
    description:
      'We do not sell your personal data. We may share information with trusted service providers who assist in delivering the platform, or when required by law or to protect legal rights.',
  },
  {
    title: 'Data Security',
    icon: Lock,
    description:
      'We implement industry-standard security measures to protect your data. While we strive to safeguard information, no method of transmission or storage is fully secure.',
  },
  {
    title: 'Data Retention',
    icon: Clock,
    description:
      'We retain information for as long as your account is active or as needed to provide the platform. You may request deletion of your data subject to legal obligations and legitimate business interests.',
  },
  {
    title: 'Your Rights',
    icon: UserCheck,
    description:
      'Depending on your jurisdiction, you may have rights to access, correct, delete, or restrict the processing of your personal data. Contact us to exercise these rights.',
  },
  {
    title: 'International Transfers',
    icon: Globe,
    description:
      'If data is transferred across borders, we ensure appropriate safeguards are in place, consistent with applicable data protection regulations.',
  },
  {
    title: 'Third-Party Services',
    icon: Shield,
    description:
      'Cohorts may integrate with third-party tools (such as analytics or payment processors). These services have their own privacy policies, which we encourage you to review.',
  },
  {
    title: 'Changes to this Policy',
    icon: RefreshCw,
    description:
      'We may update this Privacy Policy periodically. We will notify you of significant changes through the platform or by email.',
  },
]

export default function PrivacyPage() {
  return (
    <div className="mx-auto max-w-4xl space-y-8 px-6 py-12 md:py-20">
      <FadeIn>
        <div className="flex flex-col gap-4">
          <Link href="/" className="group flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground w-fit">
            <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
            Back to Home
          </Link>
          <div className="space-y-2">
            <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">Privacy Policy</h1>
            <p className="text-sm text-muted-foreground">Last updated: January 6, 2026</p>
          </div>
        </div>
      </FadeIn>

      <FadeIn delay={0.2}>
        <Card className="border-border/60 shadow-xl shadow-primary/5">
          <CardHeader className="border-b bg-muted/30 pb-8 pt-8">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                <Shield className="h-6 w-6" />
              </div>
              <div className="space-y-1">
                <CardTitle className="text-2xl">Your Privacy Matters</CardTitle>
                <CardDescription className="text-base">
                  This Privacy Policy explains how Cohorts collects, uses, and protects your information.
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-0 p-0 text-sm leading-7 text-muted-foreground">
            <FadeInStagger>
              {sections.map((section, index) => (
                <FadeInItem key={section.title} className={cn(
                  "p-8 transition-colors hover:bg-muted/10",
                  index !== sections.length - 1 && "border-b border-border/40"
                )}>
                  <div className="flex flex-col gap-4 sm:flex-row sm:gap-8">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-muted text-muted-foreground group-hover:bg-primary/10 group-hover:text-primary transition-colors">
                      <section.icon className="h-5 w-5" />
                    </div>
                    <div className="space-y-2">
                      <h2 className="text-lg font-semibold text-foreground tracking-tight">{section.title}</h2>
                      <p className="max-w-2xl">{section.description}</p>
                    </div>
                  </div>
                </FadeInItem>
              ))}
            </FadeInStagger>
            
            <div className="border-t border-border bg-muted/30 p-8 sm:p-12 text-center">
              <h2 className="text-xl font-semibold text-foreground mb-4">Have Questions?</h2>
              <p className="mb-8 max-w-lg mx-auto">
                If you have any questions or concerns regarding our privacy practices, please don&apos;t hesitate to reach out to our dedicated privacy team.
              </p>
              <Button asChild size="lg">
                <Link href="mailto:privacy@cohorts.app">
                  Contact Privacy Team
                </Link>
              </Button>
              <p className="mt-4 text-xs">
                Response time is typically within 24-48 business hours.
              </p>
            </div>
          </CardContent>
        </Card>
      </FadeIn>
    </div>
  )
}
