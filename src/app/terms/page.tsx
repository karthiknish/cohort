'use client'

import Link from 'next/link'
import {
  FileText,
  CircleCheck,
  User,
  Key,
  LayoutDashboard,
  CreditCard,
  Copyright,
  LogOut,
  TriangleAlert,
  FileEdit,
  ArrowLeft,
} from 'lucide-react'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { FadeIn, FadeInStagger, FadeInItem } from '@/components/ui/animate-in'

const sections = [
  {
    title: 'Acceptance of Terms',
    icon: CircleCheck,
    description:
      'By accessing or using the Cohorts platform, you agree to be bound by these Terms of Service and our Privacy Policy. If you do not agree, you may not access or use the platform.',
  },
  {
    title: 'Eligibility',
    icon: User,
    description:
      'You must be at least 18 years old and have the authority to bind your organization to these terms in order to use Cohorts. By using the platform, you represent and warrant that you meet these requirements.',
  },
  {
    title: 'Account Responsibilities',
    icon: Key,
    description:
      'You are responsible for maintaining the confidentiality of your account credentials and for all activities that occur under your account. Notify us immediately of any unauthorized use or security breach.',
  },
  {
    title: 'Platform Usage',
    icon: LayoutDashboard,
    description:
      'Cohorts provides tools for analytics, client management, proposals, task tracking, and financial monitoring. You agree to use these tools in compliance with applicable laws and ethical standards.',
  },
  {
    title: 'Subscriptions and Billing',
    icon: CreditCard,
    description:
      'Paid plans are billed on a subscription basis. Fees are non-refundable except as required by law. You are responsible for providing accurate billing information and keeping it current.',
  },
  {
    title: 'Intellectual Property',
    icon: Copyright,
    description:
      'All content, trademarks, and software associated with Cohorts remain our exclusive property or that of our licensors. You receive a limited, non-transferable license to use the platform for your business operations.',
  },
  {
    title: 'Termination',
    icon: LogOut,
    description:
      'We may suspend or terminate your access to Cohorts at any time if you violate these terms or engage in misuse of the platform. You may terminate your account by contacting support.',
  },
  {
    title: 'Limitation of Liability',
    icon: TriangleAlert,
    description:
      'To the fullest extent permitted by law, Cohorts is not liable for any indirect, incidental, or consequential damages arising from your use of the platform. Your sole remedy is to discontinue use.',
  },
  {
    title: 'Changes to Terms',
    icon: FileEdit,
    description:
      'We may update these terms from time to time. Continued use of the platform after changes take effect constitutes acceptance of the revised terms.',
  },
]

export default function TermsPage() {
  return (
    <div className="mx-auto max-w-4xl space-y-8 px-6 py-12 md:py-20">
      <FadeIn>
        <div className="flex flex-col gap-4">
          <Link href="/" className="group flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground w-fit">
            <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
            Back to Home
          </Link>
          <div className="space-y-2">
            <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">Terms of Service</h1>
            <p className="text-sm text-muted-foreground">Last updated: January 6, 2026</p>
          </div>
        </div>
      </FadeIn>

      <FadeIn delay={0.2}>
        <Card className="border-border/60 shadow-xl shadow-primary/5">
          <CardHeader className="border-b bg-muted/30 pb-8 pt-8">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                <FileText className="h-6 w-6" />
              </div>
              <div className="space-y-1">
                <CardTitle className="text-2xl">Welcome to Cohorts</CardTitle>
                <CardDescription className="text-base">
                  These Terms of Service govern your access to and use of the Cohorts platform.
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
              <h2 className="text-xl font-semibold text-foreground mb-4">Legal Inquiries</h2>
              <p className="mb-8 max-w-lg mx-auto">
                For any questions regarding these Terms of Service or other legal matters, please reach out to our legal department.
              </p>
              <Button asChild size="lg">
                <Link href="mailto:legal@cohorts.app">
                  Contact Legal Team
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </FadeIn>
    </div>
  )
}
