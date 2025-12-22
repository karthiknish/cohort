'use client'

import Link from 'next/link'
import { Shield } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'

export function PrivacySettingsCard() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Shield className="h-5 w-5" />
          Privacy & Terms
        </CardTitle>
        <CardDescription>
          Review our privacy policies and terms of service.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium">Privacy policy</p>
              <p className="text-sm text-muted-foreground">Learn how we collect, use, and protect your data.</p>
            </div>
            <Button variant="outline" size="sm" asChild>
              <Link href="/privacy">View policy</Link>
            </Button>
          </div>
          <Separator />
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium">Terms of service</p>
              <p className="text-sm text-muted-foreground">Review our terms and conditions of use.</p>
            </div>
            <Button variant="outline" size="sm" asChild>
              <Link href="/terms">View terms</Link>
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
