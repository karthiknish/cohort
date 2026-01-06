'use client'

import { useState } from 'react'
import { Plus, X, Users, MapPin, Tag, Briefcase } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { toast } from '@/components/ui/use-toast'

type Props = {
  isOpen: boolean
  onOpenChange: (open: boolean) => void
  providerId: string
}

export function AudienceBuilderDialog({ isOpen, onOpenChange, providerId }: Props) {
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [segments, setSegments] = useState<string[]>([])
  const [newSegment, setNewSegment] = useState('')
  const [loading, setLoading] = useState(false)

  const handleAddSegment = () => {
    if (!newSegment) return
    setSegments([...segments, newSegment])
    setNewSegment('')
  }

  const handleRemoveSegment = (index: number) => {
    setSegments(segments.filter((_, i) => i !== index))
  }

  const handleCreate = async () => {
    if (!name || segments.length === 0) {
      toast({
        title: 'Missing information',
        description: 'Please provide a name and at least one segment.',
        variant: 'destructive',
      })
      return
    }

    setLoading(true)
    try {
      const response = await fetch('/api/integrations/audiences', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          providerId,
          name,
          description,
          segments,
        }),
      })

      if (!response.ok) throw new Error('Failed to create audience')
      
      const result = await response.json()
      
      toast({
        title: 'Success',
        description: result.message || `Audience "${name}" created successfully.`,
      })
      
      onOpenChange(false)
      setName('')
      setDescription('')
      setSegments([])
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to create audience.',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Build New Audience
          </DialogTitle>
          <DialogDescription>
            Define a custom segment for your {providerId} campaigns.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="aud-name">Audience Name</Label>
            <Input 
              id="aud-name" 
              placeholder="e.g. Website Visitors - Last 30 Days" 
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="aud-desc">Description (Optional)</Label>
            <Input 
              id="aud-desc" 
              placeholder="Target users who visited the pricing page" 
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label>Targeting Segments</Label>
            <div className="flex gap-2">
              <Input 
                placeholder={providerId === 'linkedin' ? 'Enter job title or skill' : 'Enter interest or keyword'} 
                value={newSegment}
                onChange={(e) => setNewSegment(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleAddSegment()}
              />
              <Button type="button" size="sm" onClick={handleAddSegment}>
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            <div className="flex flex-wrap gap-2 pt-2">
              {segments.length === 0 ? (
                <p className="text-xs text-muted-foreground italic">No segments added yet.</p>
              ) : (
                segments.map((s, i) => (
                  <Badge key={i} variant="secondary" className="pl-2 gap-1">
                    {s}
                    <button onClick={() => handleRemoveSegment(i)} className="hover:text-destructive">
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ))
              )}
            </div>
          </div>

          <div className="pt-2">
            <p className="text-[10px] text-muted-foreground flex items-start gap-1">
              <Tag className="h-3 w-3 mt-0.5 shrink-0" />
              Segments will be matched using &quot;OR&quot; logic. More advanced boolean logic is available in the platform editor.
            </p>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={handleCreate} disabled={loading}>
            {loading ? 'Creating...' : 'Create Audience'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
