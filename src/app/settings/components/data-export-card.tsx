'use client'

import { useState, useCallback } from 'react'
import { LoaderCircle, Download } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { useToast } from '@/components/ui/use-toast'
import { useAuth } from '@/contexts/auth-context'

export function DataExportCard() {
  const { user, getIdToken } = useAuth()
  const { toast } = useToast()
  const [exportingData, setExportingData] = useState(false)
  const [exportError, setExportError] = useState<string | null>(null)

  const handleExportData = useCallback(async () => {
    if (!user) {
      setExportError('You must be signed in to export your data.')
      return
    }

    setExportingData(true)
    setExportError(null)

    try {
      const token = await getIdToken()
      const response = await fetch('/api/auth/export', {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (!response.ok) {
        const payload = (await response.json().catch(() => ({}))) as { error?: string }
        throw new Error(payload.error ?? 'Failed to export data')
      }

      // Get the filename from Content-Disposition header or generate one
      const contentDisposition = response.headers.get('Content-Disposition')
      const filenameMatch = contentDisposition?.match(/filename="(.+)"/)
      const filename = filenameMatch?.[1] ?? `cohort-data-export-${new Date().toISOString().split('T')[0]}.json`

      const blob = await response.blob()
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = filename
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)

      toast({
        title: 'Data exported successfully',
        description: 'Your personal data has been downloaded as a JSON file.',
      })
    } catch (exportErr) {
      const message = exportErr instanceof Error ? exportErr.message : 'Failed to export data'
      setExportError(message)
      toast({ title: 'Export failed', description: message, variant: 'destructive' })
    } finally {
      setExportingData(false)
    }
  }, [getIdToken, toast, user])

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Download className="h-5 w-5" />
          Export your data
        </CardTitle>
        <CardDescription>
          Download a copy of all your personal data in JSON format (GDPR Article 20 - Right to Data Portability).
        </CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground mb-4">
          This export includes your profile information, clients, projects, tasks, proposals, invoices, messages, and activity history. The download will be in machine-readable JSON format.
        </p>
        {exportError && (
          <p className="text-sm text-destructive mb-4">{exportError}</p>
        )}
      </CardContent>
      <CardFooter className="flex justify-end">
        <Button
          variant="outline"
          onClick={() => void handleExportData()}
          disabled={exportingData}
        >
          {exportingData ? (
            <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <Download className="mr-2 h-4 w-4" />
          )}
          {exportingData ? 'Preparing export...' : 'Download my data'}
        </Button>
      </CardFooter>
    </Card>
  )
}
