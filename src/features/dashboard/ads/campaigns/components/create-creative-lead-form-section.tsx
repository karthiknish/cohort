'use client'

import { useAction } from 'convex/react'
import { useCallback, useEffect, useReducer } from 'react'
import { CheckCircle, FileText, Loader2 } from 'lucide-react'

import { adsMetaToolsApi } from '@/lib/convex-api'
import { reportConvexFailure } from '@/lib/handle-convex-error'
import { normalizeMetaCampaignObjective } from '@/lib/meta-ad-set-objective'
import { Alert, AlertDescription } from '@/shared/ui/alert'
import { Label } from '@/shared/ui/label'

type LeadFormRow = {
  id: string
  name: string
}

type LeadFormPickerState = {
  forms: LeadFormRow[]
  loading: boolean
}

type LeadFormPickerAction =
  | { type: 'setForms'; value: { forms: LeadFormRow[]; loading: boolean } }
  | { type: 'setLoading'; value: boolean }

function leadFormPickerReducer(state: LeadFormPickerState, action: LeadFormPickerAction): LeadFormPickerState {
  switch (action.type) {
    case 'setForms':
      return { forms: action.value.forms, loading: action.value.loading }
    case 'setLoading':
      return { ...state, loading: action.value }
    default:
      return state
  }
}

type Props = {
  workspaceId: string | null
  clientId?: string | null
  campaignObjective?: string | null
  pageId: string
  leadFormId: string
  disabled?: boolean
  onLeadFormIdChange: (leadFormId: string) => void
}

export function CreateCreativeLeadFormSection({
  workspaceId,
  clientId,
  campaignObjective,
  pageId,
  leadFormId,
  disabled,
  onLeadFormIdChange,
}: Props) {
  const [state, dispatch] = useReducer(leadFormPickerReducer, { forms: [], loading: false })
  const listLeadgenForms = useAction(adsMetaToolsApi.listLeadgenForms)

  const isLeadsCampaign = normalizeMetaCampaignObjective(campaignObjective) === 'OUTCOME_LEADS'
  const canLoad = Boolean(isLeadsCampaign && workspaceId && pageId)

  useEffect(() => {
    if (!canLoad) {
      dispatch({ type: 'setForms', value: { forms: [], loading: false } })
      return
    }

    let cancelled = false
    dispatch({ type: 'setLoading', value: true })

    void listLeadgenForms({
      workspaceId: workspaceId!,
      clientId: clientId ?? null,
      pageId,
    })
      .then((rows) => {
        if (cancelled) return
        dispatch({
          type: 'setForms',
          value: {
            forms: Array.isArray(rows)
              ? rows.map((row) => ({ id: String(row.id), name: String(row.name) }))
              : [],
            loading: false,
          },
        })
      })
      .catch((error) => {
        if (cancelled) return
        reportConvexFailure({
          error,
          context: 'CreateCreativeLeadFormSection:listLeadgenForms',
          title: 'Could not load lead forms',
          fallbackMessage: 'Could not load lead forms',
        })
        dispatch({ type: 'setLoading', value: false })
      })

    return () => {
      cancelled = true
    }
  }, [canLoad, clientId, listLeadgenForms, pageId, workspaceId])

  const handleSelect = useCallback(
    (formId: string) => {
      onLeadFormIdChange(formId)
    },
    [onLeadFormIdChange],
  )

  if (!isLeadsCampaign) return null

  return (
    <div className="space-y-3 rounded-lg border border-border/60 bg-muted/20 p-4">
      <div>
        <Label>Instant lead form</Label>
        <p className="text-xs text-muted-foreground mt-1">
          Required for lead ads, attached to the creative call-to-action in Meta.
        </p>
      </div>

      {!pageId ? (
        <Alert>
          <AlertDescription className="text-xs">Select a Facebook Page to load lead forms.</AlertDescription>
        </Alert>
      ) : state.loading ? (
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Loader2 className="size-4 animate-spin" aria-hidden />
          Loading forms…
        </div>
      ) : state.forms.length > 0 ? (
        <div className="grid gap-2 max-h-40 overflow-y-auto">
          {state.forms.map((form) => (
            <LeadFormOption
              key={form.id}
              form={form}
              disabled={Boolean(disabled)}
              isSelected={leadFormId === form.id}
              onSelect={handleSelect}
            />
          ))}
        </div>
      ) : (
        <p className="text-xs text-muted-foreground">
          No forms on this page. Create one when setting up the ad set, then return here.
        </p>
      )}
    </div>
  )
}

function LeadFormOption({
  form,
  disabled,
  isSelected,
  onSelect,
}: {
  form: LeadFormRow
  disabled: boolean
  isSelected: boolean
  onSelect: (id: string) => void
}) {
  const handleSelectLeadForm = useCallback(() => {
    onSelect(form.id)
  }, [form.id, onSelect])

  return (
    <button
      type="button"
      onClick={handleSelectLeadForm}
      disabled={disabled}
      className={`flex items-center justify-between rounded-lg border p-3 text-left text-sm motion-chromatic ${
        isSelected ? 'border-info/30 bg-info/10' : 'border-border hover:border-info/50'
      }`}
    >
      <span className="flex items-center gap-2 min-w-0">
        <FileText className="size-4 shrink-0 text-muted-foreground" aria-hidden />
        <span className="truncate font-medium">{form.name}</span>
      </span>
      {isSelected ? <CheckCircle className="size-4 shrink-0 text-info" aria-hidden /> : null}
    </button>
  )
}
