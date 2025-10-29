'use client'

import Link from 'next/link'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'

const sections = [
  {
    title: 'Acceptance of Terms',
    description:
      'By accessing or using the Cohorts platform, you agree to be bound by these Terms of Service and our Privacy Policy. If you do not agree, you may not access or use the platform.',
  },
  {
    title: 'Eligibility',
    description:
      'You must be at least 18 years old and have the authority to bind your organization to these terms in order to use Cohorts. By using the platform, you represent and warrant that you meet these requirements.',
  },
  {
    title: 'Account Responsibilities',
    description:
      'You are responsible for maintaining the confidentiality of your account credentials and for all activities that occur under your account. Notify us immediately of any unauthorized use or security breach.',
  },
  {
    title: 'Platform Usage',
    description:
      'Cohorts provides tools for analytics, client management, proposals, task tracking, and financial monitoring. You agree to use these tools in compliance with applicable laws and ethical standards.',
  },
  {
    title: 'Subscriptions and Billing',
    description:
      'Paid plans are billed on a subscription basis. Fees are non-refundable except as required by law. You are responsible for providing accurate billing information and keeping it current.',
  },
  {
    title: 'Intellectual Property',
    description:
      'All content, trademarks, and software associated with Cohorts remain our exclusive property or that of our licensors. You receive a limited, non-transferable license to use the platform for your business operations.',
  },
  {
    title: 'Termination',
    description:
      'We may suspend or terminate your access to Cohorts at any time if you violate these terms or engage in misuse of the platform. You may terminate your account by contacting support.',
  },
  {
    title: 'Limitation of Liability',
    description:
      'To the fullest extent permitted by law, Cohorts is not liable for any indirect, incidental, or consequential damages arising from your use of the platform. Your sole remedy is to discontinue use.',
  },
  {
    title: 'Changes to Terms',
    description:
      'We may update these terms from time to time. Continued use of the platform after changes take effect constitutes acceptance of the revised terms.',
  },
]

export default function TermsPage() {
  return (
    <div className="mx-auto max-w-4xl space-y-8 px-6 py-12">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Terms of Service</h1>
        <p className="text-sm text-muted-foreground">Last updated: October 28, 2025</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Welcome to Cohorts</CardTitle>
          <CardDescription>
            These Terms of Service govern your access to and use of the Cohorts platform. Please read them
            carefully.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6 text-sm leading-6 text-muted-foreground">
          {sections.map((section) => (
            <div key={section.title} className="space-y-2">
              <h2 className="text-base font-semibold text-foreground">{section.title}</h2>
              <p>{section.description}</p>
              <Separator />
            </div>
          ))}
          <div className="space-y-2">
            <h2 className="text-base font-semibold text-foreground">Contact Us</h2>
            <p>
              If you have any questions about these terms, please reach out to us at{' '}
              <Link href="mailto:legal@cohorts.app" className="text-primary hover:underline">
                legal@cohorts.app
              </Link>
              .
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
