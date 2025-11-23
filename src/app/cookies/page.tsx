'use client'

import { Button } from '@/components/ui/button'
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
    title: 'What Are Cookies?',
    description:
      'Cookies are small text files that are placed on your computer or mobile device when you visit a website. They are widely used to make websites work more efficiently and to provide information to the owners of the site.',
  },
  {
    title: 'How We Use Cookies',
    description:
      'We use cookies to understand how you use our website, to personalize your experience, and to improve our services. We may also use cookies for security purposes and to detect fraud.',
  },
  {
    title: 'Types of Cookies We Use',
    description:
      'We use both session cookies (which expire when you close your browser) and persistent cookies (which remain on your device for a set period of time). We also use first-party cookies (set by us) and third-party cookies (set by our partners).',
  },
  {
    title: 'Essential Cookies',
    description:
      'These cookies are necessary for the website to function properly. They enable you to navigate the site and use its features, such as accessing secure areas.',
  },
  {
    title: 'Performance and Analytics Cookies',
    description:
      'These cookies collect information about how you use our website, such as which pages you visit most often. This data helps us improve the performance and usability of our site.',
  },
  {
    title: 'Functionality Cookies',
    description:
      'These cookies allow the website to remember choices you make (such as your username, language, or region) and provide enhanced, more personal features.',
  },
  {
    title: 'Targeting and Advertising Cookies',
    description:
      'These cookies are used to deliver advertisements that are more relevant to you and your interests. They may also be used to limit the number of times you see an advertisement and measure the effectiveness of advertising campaigns.',
  },
  {
    title: 'Changes to This Policy',
    description:
      'We may update this Cookie Policy from time to time. We encourage you to review this policy periodically to stay informed about our use of cookies.',
  },
]

export default function CookiesPage() {
  const resetCookies = () => {
    localStorage.removeItem('cookie-consent')
    window.location.reload()
  }

  return (
    <div className="mx-auto max-w-4xl space-y-8 px-6 py-12">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Cookie Policy</h1>
        <p className="text-sm text-muted-foreground">Last updated: November 24, 2025</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Our Use of Cookies</CardTitle>
          <CardDescription>
            This Cookie Policy explains how Cohorts uses cookies and similar technologies to recognize you when you visit our website.
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
            <h2 className="text-base font-semibold text-foreground">Managing Cookies</h2>
            <p>
              You can control and manage cookies through your browser settings. Please note that disabling cookies may affect the functionality of our website.
            </p>
            <p>
              You can also reset your cookie preferences for this website by clicking the button below. This will bring up the cookie consent banner again.
            </p>
            <Button variant="outline" onClick={resetCookies} className="mt-2">
              Reset Cookie Preferences
            </Button>
            <Separator className="mt-4" />
          </div>

          <div className="space-y-2">
            <h2 className="text-base font-semibold text-foreground">Contact Us</h2>
            <p>
              If you have any questions about our use of cookies, please contact us at{' '}
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
