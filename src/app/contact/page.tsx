'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Mail, MessageCircle, Phone } from 'lucide-react'

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { FadeIn, FadeInItem, FadeInStagger } from '@/components/ui/animate-in'
import { useToast } from '@/components/ui/use-toast'

const formSchema = z.object({
  name: z.string().min(2, { message: 'Please enter your name.' }).max(80),
  email: z.string().email({ message: 'Enter a valid email address.' }),
  company: z.string().max(120).optional(),
  message: z.string().min(10, { message: 'Share a bit more detail so we can help you.' }).max(2000),
})

type ContactFormValues = z.infer<typeof formSchema>

export default function ContactPage() {
  const [status, setStatus] = useState<'idle' | 'loading'>('idle')
  const { toast } = useToast()

  const form = useForm<ContactFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      email: '',
      company: '',
      message: '',
    },
  })

  const onSubmit = async (values: ContactFormValues) => {
    setStatus('loading')

    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(values),
      })

      if (!response.ok) {
        const data = await response.json().catch(() => null)
        throw new Error(data?.error ?? 'Failed to submit your request.')
      }

      toast({ title: 'Message sent', description: 'Our team will reach out within one business day.' })
      setStatus('idle')
      form.reset()
    } catch (error: unknown) {
      toast({
        title: 'Submission failed',
        description: getErrorMessage(error, 'We were unable to send your message. Please try again.'),
        variant: 'destructive',
      })
      setStatus('idle')
    }
  }

  const { register, handleSubmit, formState } = form
  const { errors } = formState

  return (
    <div className="bg-muted/40">
      <div className="mx-auto flex min-h-screen max-w-5xl flex-col gap-10 px-4 py-16 md:flex-row md:items-stretch">
        <div className="flex-1 space-y-6">
          <FadeIn as="div">
            <p className="text-sm font-semibold uppercase tracking-wider text-primary">Contact</p>
            <h1 className="mt-2 text-3xl font-bold tracking-tight sm:text-4xl">Let&apos;s build your next campaign together</h1>
            <p className="mt-4 text-base text-muted-foreground">
              Tell us what you&apos;re working on and our team will reach out within one business day. We&apos;ll learn about your
              goals, walk through the Cohorts demo, and tailor a rollout plan for your clients.
            </p>
          </FadeIn>

          <FadeIn as="div" delay={0.1}>
            <Card className="border-muted/70 bg-background/70">
              <CardHeader>
                <CardTitle className="text-lg">Prefer talking to someone?</CardTitle>
                <CardDescription>Reach us directly using the channels below.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4 text-sm text-muted-foreground">
                <FadeInStagger className="space-y-4">
                  <FadeInItem as="div" className="flex items-start gap-3">
                    <span className="rounded-md bg-primary/10 p-2 text-primary">
                      <Mail className="h-4 w-4" />
                    </span>
                    <div>
                      <p className="font-medium text-foreground">Email</p>
                      <a href="mailto:hello@cohorts.ai" className="text-primary hover:underline">
                        hello@cohorts.ai
                      </a>
                    </div>
                  </FadeInItem>
                  <FadeInItem as="div" className="flex items-start gap-3">
                    <span className="rounded-md bg-primary/10 p-2 text-primary">
                      <Phone className="h-4 w-4" />
                    </span>
                    <div>
                      <p className="font-medium text-foreground">Phone</p>
                      <p>+1 (415) 555-0134</p>
                    </div>
                  </FadeInItem>
                  <FadeInItem as="div" className="flex items-start gap-3">
                    <span className="rounded-md bg-primary/10 p-2 text-primary">
                      <MessageCircle className="h-4 w-4" />
                    </span>
                    <div>
                      <p className="font-medium text-foreground">Slack Connect</p>
                      <p>Already a customer? Ping us in your shared channel.</p>
                    </div>
                  </FadeInItem>
                </FadeInStagger>
              </CardContent>
            </Card>
          </FadeIn>
        </div>

        <FadeIn as="div" delay={0.15} className="flex-1">
          <Card className="border-muted/70 bg-background/80 backdrop-blur">
          <CardHeader>
            <CardTitle className="text-xl">Send us a message</CardTitle>
            <CardDescription>Share a few details and we&apos;ll follow up shortly.</CardDescription>
          </CardHeader>
          <CardContent>
            <form className="space-y-5" onSubmit={handleSubmit(onSubmit)}>
              <div className="space-y-2">
                <Label htmlFor="name">Name</Label>
                <Input id="name" autoComplete="name" placeholder="Jane Doe" {...register('name')} />
                {errors.name && <p className="text-sm text-destructive">{errors.name.message}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Work email</Label>
                <Input id="email" type="email" autoComplete="email" placeholder="you@agency.com" {...register('email')} />
                {errors.email && <p className="text-sm text-destructive">{errors.email.message}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="company">Company</Label>
                <Input id="company" autoComplete="organization" placeholder="Cohorts Agency" {...register('company')} />
                {errors.company && <p className="text-sm text-destructive">{errors.company.message}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="message">How can we help?</Label>
                <Textarea id="message" rows={6} placeholder="Tell us about your goals..." {...register('message')} />
                {errors.message && <p className="text-sm text-destructive">{errors.message.message}</p>}
              </div>

              <Button type="submit" className="w-full" disabled={status === 'loading'}>
                {status === 'loading' ? 'Sending…' : 'Send message'}
              </Button>

              <p className="text-center text-xs text-muted-foreground">
                We respect your privacy and will never share your information. Read our{' '}
                <Link href="/privacy" className="font-medium text-primary hover:underline">
                  privacy policy
                </Link>{' '}
                for details.
              </p>
            </form>
          </CardContent>
          </Card>
        </FadeIn>
      </div>
    </div>
  )
}

function getErrorMessage(error: unknown, fallback: string): string {
  if (typeof error === 'string') {
    return error
  }

  if (error && typeof error === 'object' && 'message' in error) {
    const message = (error as { message?: unknown }).message
    if (typeof message === 'string' && message.trim().length > 0) {
      return message
    }
  }

  return fallback
}
