'use client'

import { Component, type ErrorInfo, type ReactNode } from 'react'

import { logError } from '@/lib/convex-errors'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/ui/card'

interface WorkforceWidgetErrorBoundaryProps {
  children: ReactNode
  title: string
  description: string
}

interface WorkforceWidgetErrorBoundaryState {
  hasError: boolean
}

export class WorkforceWidgetErrorBoundary extends Component<
  WorkforceWidgetErrorBoundaryProps,
  WorkforceWidgetErrorBoundaryState
> {
  override state: WorkforceWidgetErrorBoundaryState = {
    hasError: false,
  }

  static getDerivedStateFromError(): WorkforceWidgetErrorBoundaryState {
    return { hasError: true }
  }

  override componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    logError(error, 'WorkforceWidgetErrorBoundary')
    if (errorInfo?.componentStack) {
      console.error('[WorkforceWidgetErrorBoundary] componentStack', errorInfo.componentStack)
    }
  }

  override render() {
    if (this.state.hasError) {
      return (
        <Card className="border-dashed border-muted-foreground/30 bg-muted/20 shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg">{this.props.title}</CardTitle>
            <CardDescription>{this.props.description}</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              The rest of the page is still available while workforce data reconnects.
            </p>
          </CardContent>
        </Card>
      )
    }

    return this.props.children
  }
}