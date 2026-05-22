'use client'

import { useCallback, useEffect, useState } from 'react'
import { useAction } from 'convex/react'
import { CheckCircle, FileText, Loader2, Plus, Users } from 'lucide-react'

import { adsMetaToolsApi } from '@/lib/convex-api'
import { reportConvexFailure } from '@/lib/handle-convex-error'
import { toAdsProviderId } from '@/features/dashboard/ads/components/utils'
import { Alert, AlertDescription } from '@/shared/ui/alert'
import { Button } from '@/shared/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/ui/card'
import { Input } from '@/shared/ui/input'
import { Label } from '@/shared/ui/label'
import { Switch } from '@/shared/ui/switch'
import { toast } from '@/shared/ui/use-toast'

import type { ObjectiveComponentProps } from './types'

type LeadFormRow = {
  id: string
  name: string
  status?: string
  leadsCount?: number
}

export function LeadsObjectiveSection({
  formData,
  onChange,
  disabled,
  providerId,
  metaContext,
}: ObjectiveComponentProps) {
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [newFormName, setNewFormName] = useState('')
  const [privacyPolicyUrl, setPrivacyPolicyUrl] = useState('')
  const [forms, setForms] = useState<LeadFormRow[]>([])
  const [loadingForms, setLoadingForms] = useState(false)
  const [creatingForm, setCreatingForm] = useState(false)

  const listLeadgenForms = useAction(adsMetaToolsApi.listLeadgenForms)
  const createLeadgenForm = useAction(adsMetaToolsApi.createLeadgenForm)

  const isMeta = toAdsProviderId(providerId) === 'facebook'
  const canUseMetaApi = Boolean(
    isMeta && metaContext?.workspaceId && metaContext.pageId,
  )

  useEffect(() => {
    if (!canUseMetaApi || !metaContext?.workspaceId || !metaContext.pageId) {
      setForms([])
      return
    }

    let cancelled = false
    setLoadingForms(true)

    void listLeadgenForms({
      workspaceId: metaContext.workspaceId,
      clientId: metaContext.clientId ?? null,
      pageId: metaContext.pageId,
    })
      .then((rows) => {
        if (cancelled) return
        setForms(
          Array.isArray(rows)
            ? rows.map((row) => ({
                id: String(row.id),
                name: String(row.name),
                status: row.status as string | undefined,
                leadsCount: row.leadsCount as number | undefined,
              }))
            : [],
        )
      })
      .catch((error) => {
        if (cancelled) return
        reportConvexFailure({
          error,
          context: 'LeadsObjectiveSection:listLeadgenForms',
          title: 'Could not load lead forms',
          fallbackMessage: 'Could not load lead forms',
        })
      })
      .finally(() => {
        if (!cancelled) setLoadingForms(false)
      })

    return () => {
      cancelled = true
    }
  }, [canUseMetaApi, listLeadgenForms, metaContext?.clientId, metaContext?.pageId, metaContext?.workspaceId])

  const handleInstantFormToggle = useCallback(
    (checked: boolean | 'indeterminate' | undefined) => onChange({ instantFormEnabled: checked === true }),
    [onChange],
  )

  const handleLeadFormSelect = useCallback(
    (leadFormId: string) => onChange({ leadFormId }),
    [onChange],
  )

  const handleCreateForm = useCallback(async () => {
    if (!canUseMetaApi || !metaContext?.workspaceId || !metaContext.pageId) return
    if (!newFormName.trim() || !privacyPolicyUrl.trim()) {
      toast({
        title: 'Missing fields',
        description: 'Form name and privacy policy URL are required.',
        variant: 'destructive',
      })
      return
    }

    setCreatingForm(true)
    try {
      const result = await createLeadgenForm({
        workspaceId: metaContext.workspaceId,
        clientId: metaContext.clientId ?? null,
        pageId: metaContext.pageId,
        name: newFormName.trim(),
        privacyPolicyUrl: privacyPolicyUrl.trim(),
      })
      if (result.formId) {
        onChange({ leadFormId: result.formId })
        setForms((prev) => [
          { id: result.formId!, name: newFormName.trim(), status: 'ACTIVE' },
          ...prev,
        ])
        toast({ title: 'Lead form created', description: `"${newFormName.trim()}" is ready to use.` })
      }
      setShowCreateForm(false)
      setNewFormName('')
      setPrivacyPolicyUrl('')
    } catch (error) {
      reportConvexFailure({
        error,
        context: 'LeadsObjectiveSection:createLeadgenForm',
        title: 'Could not create lead form',
        fallbackMessage: 'Could not create lead form',
      })
    } finally {
      setCreatingForm(false)
    }
  }, [
    canUseMetaApi,
    createLeadgenForm,
    metaContext?.clientId,
    metaContext?.pageId,
    metaContext?.workspaceId,
    newFormName,
    onChange,
    privacyPolicyUrl,
  ])

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <Users className="h-4 w-4 text-info" aria-hidden />
            Lead Form
          </CardTitle>
          <CardDescription>
            Select an instant form from your connected Facebook Page, or create a new one.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {!isMeta ? (
            <Alert>
              <AlertDescription className="text-xs">
                Lead forms are only available for Meta (Facebook/Instagram) campaigns.
              </AlertDescription>
            </Alert>
          ) : !canUseMetaApi ? (
            <Alert>
              <AlertDescription className="text-xs">
                Connect a Facebook Page with a Page ID to load and create instant lead forms. Until then, configure lead forms in Meta Ads Manager.
              </AlertDescription>
            </Alert>
          ) : null}

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="instant-form">Use Instant Forms</Label>
              <p className="text-xs text-muted-foreground">
                People submit without leaving Facebook or Instagram
              </p>
            </div>
            <Switch
              id="instant-form"
              checked={Boolean(formData.instantFormEnabled)}
              onCheckedChange={handleInstantFormToggle}
              disabled={disabled || !isMeta}
            />
          </div>

          {formData.instantFormEnabled && isMeta ? (
            <>
              <div className="space-y-3 border-t pt-4">
                <Label>Select form</Label>
                {loadingForms ? (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
                    Loading forms…
                  </div>
                ) : forms.length > 0 ? (
                  <div className="grid gap-2">
                    {forms.map((form) => (
                      <LeadFormOptionButton
                        key={form.id}
                        disabled={Boolean(disabled)}
                        form={form}
                        isSelected={formData.leadFormId === form.id}
                        onSelect={handleLeadFormSelect}
                      />
                    ))}
                  </div>
                ) : canUseMetaApi ? (
                  <p className="text-xs text-muted-foreground">No lead forms on this page yet — create one below.</p>
                ) : null}

                {canUseMetaApi ? (
                  <Button
                    type="button"
                    variant="outline"
                    className="w-full"
                    onClick={() => setShowCreateForm((value) => !value)}
                    disabled={disabled}
                  >
                    <Plus className="mr-2 h-4 w-4" aria-hidden />
                    Create new form
                  </Button>
                ) : null}
              </div>

              {showCreateForm && canUseMetaApi ? (
                <div className="space-y-4 rounded-lg border bg-muted/50 p-4">
                  <h4 className="font-medium text-sm">Create lead form</h4>
                  <div className="space-y-2">
                    <Label htmlFor="form-name">Form name</Label>
                    <Input
                      id="form-name"
                      value={newFormName}
                      onChange={(e) => setNewFormName(e.target.value)}
                      placeholder="Free consultation"
                      disabled={disabled || creatingForm}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="privacy-url">Privacy policy URL</Label>
                    <Input
                      id="privacy-url"
                      type="url"
                      value={privacyPolicyUrl}
                      onChange={(e) => setPrivacyPolicyUrl(e.target.value)}
                      placeholder="https://yoursite.com/privacy"
                      disabled={disabled || creatingForm}
                    />
                  </div>
                  <div className="flex gap-2">
                    <Button
                      type="button"
                      size="sm"
                      onClick={() => void handleCreateForm()}
                      disabled={disabled || creatingForm || !newFormName.trim() || !privacyPolicyUrl.trim()}
                    >
                      {creatingForm ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                      Create form
                    </Button>
                    <Button type="button" size="sm" variant="ghost" onClick={() => setShowCreateForm(false)}>
                      Cancel
                    </Button>
                  </div>
                </div>
              ) : null}
            </>
          ) : null}
        </CardContent>
      </Card>
    </div>
  )
}

function LeadFormOptionButton({
  form,
  disabled,
  isSelected,
  onSelect,
}: {
  form: LeadFormRow
  disabled: boolean
  isSelected: boolean
  onSelect: (leadFormId: string) => void
}) {
  return (
    <button
      type="button"
      onClick={() => onSelect(form.id)}
      disabled={disabled}
      className={`flex items-center justify-between rounded-lg border p-3 text-left motion-chromatic ${
        isSelected ? 'border-info/20 bg-info/10' : 'border-border hover:border-info/50'
      }`}
    >
      <div className="flex items-center gap-3">
        <FileText className="h-5 w-5 text-muted-foreground" aria-hidden />
        <div>
          <p className="text-sm font-medium">{form.name}</p>
          <p className="text-xs text-muted-foreground">
            {form.status ?? 'unknown'}
            {form.leadsCount != null ? ` · ${form.leadsCount} leads` : ''}
          </p>
        </div>
      </div>
      {isSelected ? <CheckCircle className="h-5 w-5 text-info" aria-hidden /> : null}
    </button>
  )
}
