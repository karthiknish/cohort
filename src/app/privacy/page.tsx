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
    title: 'Information We Collect',
    description:
      'We collect information you provide directly, including account details, client data, and communications. We also collect usage data such as analytics, device information, and cookies to improve our services.',
  },
  {
    title: 'How We Use Information',
    description:
      'Information is used to deliver and improve the Cohorts platform, personalize user experiences, provide support, and communicate important updates or marketing content (with consent).',
  },
  {
    title: 'Data Sharing and Disclosure',
    description:
      'We do not sell your personal data. We may share information with trusted service providers who assist in delivering the platform, or when required by law or to protect legal rights.',
  },
  {
    title: 'Data Security',
    description:
      'We implement industry-standard security measures to protect your data. While we strive to safeguard information, no method of transmission or storage is fully secure.',
  },
  {
    title: 'Data Retention',
    description:
      'We retain information for as long as your account is active or as needed to provide the platform. You may request deletion of your data subject to legal obligations and legitimate business interests.',
  },
  {
    title: 'Your Rights',
    description:
      'Depending on your jurisdiction, you may have rights to access, correct, delete, or restrict the processing of your personal data. Contact us to exercise these rights.',
  },
  {
    title: 'International Transfers',
    description:
      'If data is transferred across borders, we ensure appropriate safeguards are in place, consistent with applicable data protection regulations.',
  },
  {
    title: 'Third-Party Services',
    description:
      'Cohorts may integrate with third-party tools (such as analytics or payment processors). These services have their own privacy policies, which we encourage you to review.',
  },
  {
    title: 'Changes to this Policy',
    description:
      'We may update this Privacy Policy periodically. We will notify you of significant changes through the platform or by email.',
  },
]

export default function PrivacyPage() {
  return (
    <div className="mx-auto max-w-4xl space-y-8 px-6 py-12">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Privacy Policy</h1>
        <p className="text-sm text-muted-foreground">Last updated: October 28, 2025</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Your Privacy Matters</CardTitle>
          <CardDescription>
            This Privacy Policy explains how Cohorts collects, uses, and protects your information when you use
            our platform.
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
              For privacy inquiries, please contact us at{' '}
              <Link href="mailto:privacy@cohorts.app" className="text-primary hover:underline">
                privacy@cohorts.app
              </Link>
              .
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
