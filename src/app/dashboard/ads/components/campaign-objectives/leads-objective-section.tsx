// =============================================================================
// LEADS OBJECTIVE SECTION - Lead generation with instant forms
// =============================================================================

'use client'

import { useState } from 'react'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Users, Plus, FileText, CheckCircle } from 'lucide-react'
import { ObjectiveComponentProps } from './types'

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

  const handleCreateForm = () => {
    // In real implementation, this would create a lead form via API
    console.log('Creating lead form:', { name: newFormName, fields: newFormFields })
    setShowCreateForm(false)
    setNewFormName('')
    setNewFormFields('')
  }

  return (
    <div className="space-y-6">
      {/* Instant Form Selection */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <Users className="w-4 h-4 text-blue-500" />
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
              checked={formData.instantFormEnabled}
              onCheckedChange={(checked) => onChange({ instantFormEnabled: checked })}
              disabled={disabled}
            />
          </div>

          {formData.instantFormEnabled && (
            <>
              <div className="border-t pt-4 space-y-3">
                <Label>Select Form</Label>
                <div className="grid gap-2">
                  {MOCK_LEAD_FORMS.map((form) => (
                    <button
                      key={form.id}
                      type="button"
                      onClick={() => onChange({ leadFormId: form.id })}
                      disabled={disabled}
                      className={`flex items-center justify-between p-3 rounded-lg border text-left transition-all ${
                        formData.leadFormId === form.id
                          ? 'border-blue-500 bg-blue-500/5'
                          : 'border-border hover:border-blue-500/50'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <FileText className="w-5 h-5 text-muted-foreground" />
                        <div>
                          <p className="font-medium text-sm">{form.name}</p>
                          <p className="text-xs text-muted-foreground">
                            {form.fields} fields • {form.leads} leads collected
                          </p>
                        </div>
                      </div>
                      {formData.leadFormId === form.id && (
                        <CheckCircle className="w-5 h-5 text-blue-500" />
                      )}
                    </button>
                  ))}
                </div>

                <Button
                  type="button"
                  variant="outline"
                  className="w-full"
                  onClick={() => setShowCreateForm(true)}
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
                      onChange={(e) => setNewFormName(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="form-fields">Fields (one per line)</Label>
                    <Textarea
                      id="form-fields"
                      placeholder="Full Name&#10;Email&#10;Phone Number&#10;Company"
                      value={newFormFields}
                      onChange={(e) => setNewFormFields(e.target.value)}
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
                      onClick={() => setShowCreateForm(false)}
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
      <Card className="border-blue-500/20 bg-blue-500/5">
        <CardContent className="pt-6">
          <div className="flex gap-3">
            <CheckCircle className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" />
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
