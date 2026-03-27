// =============================================================================
// LEADS OBJECTIVE SECTION - Lead generation with instant forms
// =============================================================================

'use client'

import { useCallback, useState } from 'react'
import { Label } from '@/shared/ui/label'
import { Switch } from '@/shared/ui/switch'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/ui/card'
import { Button } from '@/shared/ui/button'
import { Input } from '@/shared/ui/input'
import { Textarea } from '@/shared/ui/textarea'
import { Users, Plus, FileText, CheckCircle } from 'lucide-react'
import type { ObjectiveComponentProps } from './types'

// Mock lead forms - in real implementation, these would be fetched from the API
const MOCK_LEAD_FORMS = [
  { id: 'form_1', name: 'General Contact Form', fields: 4, leads: 156 },
  { id: 'form_2', name: 'Quote Request Form', fields: 6, leads: 89 },
  { id: 'form_3', name: 'Newsletter Signup', fields: 2, leads: 423 },
]

export function LeadsObjectiveSection({ formData, onChange, disabled }: ObjectiveComponentProps) {
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [newFormName, setNewFormName] = useState('')
  const [newFormFields, setNewFormFields] = useState('')

  const handleInstantFormToggle = useCallback(
    (checked: boolean | 'indeterminate' | undefined) => onChange({ instantFormEnabled: checked === true }),
    [onChange]
  )

  const handleLeadFormSelect = useCallback(
    (leadFormId: string) => onChange({ leadFormId }),
    [onChange]
  )

  const handleOpenCreateForm = useCallback(() => {
    setShowCreateForm(true)
  }, [])

  const handleCloseCreateForm = useCallback(() => {
    setShowCreateForm(false)
  }, [])

  const handleCreateFormNameChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    setNewFormName(event.target.value)
  }, [])

  const handleCreateFormFieldsChange = useCallback((event: React.ChangeEvent<HTMLTextAreaElement>) => {
    setNewFormFields(event.target.value)
  }, [])

  const handleCreateForm = useCallback(() => {
    // In real implementation, this would create a lead form via API
    console.log('Creating lead form:', { name: newFormName, fields: newFormFields })
    setShowCreateForm(false)
    setNewFormName('')
    setNewFormFields('')
  }, [newFormFields, newFormName])

  return (
    <div className="space-y-6">
      {/* Instant Form Selection */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <Users className="w-4 h-4 text-info" />
            Lead Form
          </CardTitle>
          <CardDescription>
            Select an existing instant form or create a new one to collect leads.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Enable Instant Forms */}
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="instant-form">Use Instant Forms</Label>
              <p className="text-xs text-muted-foreground">
                People can submit their info without leaving Facebook/Instagram
              </p>
            </div>
            <Switch
              id="instant-form"
              checked={Boolean(formData.instantFormEnabled)}
              onCheckedChange={handleInstantFormToggle}
              disabled={disabled}
            />
          </div>

          {formData.instantFormEnabled && (
            <>
              <div className="border-t pt-4 space-y-3">
                <Label>Select Form</Label>
                <div className="grid gap-2">
                  {MOCK_LEAD_FORMS.map((form) => (
                    <LeadFormOptionButton
                      key={form.id}
                      disabled={Boolean(disabled)}
                      form={form}
                      isSelected={formData.leadFormId === form.id}
                      onSelect={handleLeadFormSelect}
                    />
                  ))}
                </div>

                <Button
                  type="button"
                  variant="outline"
                  className="w-full"
                    onClick={handleOpenCreateForm}
                  disabled={disabled}
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Create New Form
                </Button>
              </div>

              {/* Create Form Dialog */}
              {showCreateForm && (
                <div className="border rounded-lg p-4 space-y-4 bg-muted/50">
                  <h4 className="font-medium">Create New Lead Form</h4>
                  <div className="space-y-2">
                    <Label htmlFor="form-name">Form Name</Label>
                    <Input
                      id="form-name"
                      placeholder="e.g., Free Consultation Request"
                      value={newFormName}
                      onChange={handleCreateFormNameChange}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="form-fields">Fields (one per line)</Label>
                    <Textarea
                      id="form-fields"
                      placeholder="Full Name&#10;Email&#10;Phone Number&#10;Company"
                      value={newFormFields}
                      onChange={handleCreateFormFieldsChange}
                      rows={4}
                    />
                  </div>
                  <div className="flex gap-2">
                    <Button
                      type="button"
                      size="sm"
                      onClick={handleCreateForm}
                      disabled={!newFormName.trim()}
                    >
                      Create Form
                    </Button>
                    <Button
                      type="button"
                      size="sm"
                      variant="ghost"
                      onClick={handleCloseCreateForm}
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>

      {/* Lead Quality Settings */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Lead Quality Optimization</CardTitle>
          <CardDescription>
            Higher quality leads may cost more but convert better.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="higher-intent">Higher Intent Leads</Label>
              <p className="text-xs text-muted-foreground">
                Optimize for people more likely to become customers
              </p>
            </div>
            <Switch
              id="higher-intent"
              defaultChecked
              disabled={disabled}
            />
          </div>
        </CardContent>
      </Card>

      {/* Lead Gen Tips */}
      <Card className="border-info/20 bg-info/10">
        <CardContent className="pt-6">
          <div className="flex gap-3">
            <CheckCircle className="w-5 h-5 text-info flex-shrink-0 mt-0.5" />
            <div className="space-y-2">
              <h4 className="font-medium text-sm">Lead Generation Best Practices</h4>
              <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
                <li>Keep forms short - ask only essential questions</li>
                <li>Offer something valuable (ebook, discount, free consultation)</li>
                <li>Use clear, compelling call-to-action buttons</li>
                <li>Set up automated email responses</li>
                <li>Follow up with leads within 24 hours</li>
              </ul>
            </div>
          </div>
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
  form: (typeof MOCK_LEAD_FORMS)[number]
  disabled: boolean
  isSelected: boolean
  onSelect: (leadFormId: string) => void
}) {
  const handleClick = useCallback(() => {
    onSelect(form.id)
  }, [form.id, onSelect])

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={disabled}
      className={`flex items-center justify-between rounded-lg border p-3 text-left transition-[color,background-color,border-color,text-decoration-color,fill,stroke,opacity,box-shadow,transform,filter,backdrop-filter] ${
        isSelected ? 'border-info/20 bg-info/10' : 'border-border hover:border-info/50'
      }`}
    >
      <div className="flex items-center gap-3">
        <FileText className="h-5 w-5 text-muted-foreground" />
        <div>
          <p className="text-sm font-medium">{form.name}</p>
          <p className="text-xs text-muted-foreground">
            {form.fields} fields • {form.leads} leads collected
          </p>
        </div>
      </div>
      {isSelected && <CheckCircle className="h-5 w-5 text-info" />}
    </button>
  )
}
