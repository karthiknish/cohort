'use client'

import { useState, useCallback, useEffect } from 'react'
import {
  CalendarClock,
  Plus,
  Pause,
  Play,
  Trash2,
  ChevronDown,
  Loader2,
  RefreshCw,
  DollarSign,
  Calendar,
  Receipt,
} from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Textarea } from '@/components/ui/textarea'
import { useToast } from '@/components/ui/use-toast'
import { useAuth } from '@/contexts/auth-context'
import { useClientContext } from '@/contexts/client-context'
import type { RecurringInvoiceSchedule, RecurringFrequency } from '@/types/recurring-invoices'
import {
  fetchRecurringSchedules,
  createRecurringSchedule,
  updateRecurringSchedule,
  deleteRecurringSchedule,
  triggerRecurringInvoice,
} from '@/services/recurring-invoices'

const FREQUENCY_LABELS: Record<RecurringFrequency, string> = {
  weekly: 'Weekly',
  monthly: 'Monthly',
  quarterly: 'Quarterly',
  annually: 'Annually',
}

const DAY_OF_WEEK_LABELS = [
  'Sunday',
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
]

function formatCurrency(amount: number, currency: string = 'USD'): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
  }).format(amount)
}

function formatDate(dateString: string | null): string {
  if (!dateString) return 'N/A'
  return new Date(dateString).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

export function RecurringInvoicesCard() {
  const { getIdToken } = useAuth()
  const { clients } = useClientContext()
  const { toast } = useToast()

  const [schedules, setSchedules] = useState<RecurringInvoiceSchedule[]>([])
  const [loading, setLoading] = useState(true)
  const [createDialogOpen, setCreateDialogOpen] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [scheduleToDelete, setScheduleToDelete] = useState<RecurringInvoiceSchedule | null>(null)
  const [creating, setCreating] = useState(false)
  const [generatingId, setGeneratingId] = useState<string | null>(null)

  // Form state
  const [selectedClientId, setSelectedClientId] = useState('')
  const [amount, setAmount] = useState('')
  const [currency, setCurrency] = useState('USD')
  const [description, setDescription] = useState('')
  const [frequency, setFrequency] = useState<RecurringFrequency>('monthly')
  const [dayOfMonth, setDayOfMonth] = useState('1')
  const [dayOfWeek, setDayOfWeek] = useState('1')
  const [startDate, setStartDate] = useState('')

  const loadSchedules = useCallback(async () => {
    try {
      setLoading(true)
      await getIdToken()
      const data = await fetchRecurringSchedules()
      setSchedules(data)
    } catch (error) {
      console.error('Failed to load schedules:', error)
      toast({
        title: 'Failed to load recurring invoices',
        description: error instanceof Error ? error.message : 'An error occurred',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }, [getIdToken, toast])

  useEffect(() => {
    loadSchedules()
  }, [loadSchedules])

  const resetForm = () => {
    setSelectedClientId('')
    setAmount('')
    setCurrency('USD')
    setDescription('')
    setFrequency('monthly')
    setDayOfMonth('1')
    setDayOfWeek('1')
    setStartDate('')
  }

  const handleCreate = useCallback(async () => {
    if (!selectedClientId || !amount || !startDate) {
      toast({
        title: 'Missing fields',
        description: 'Please fill in all required fields.',
        variant: 'destructive',
      })
      return
    }

    const selectedClient = clients.find((c) => c.id === selectedClientId)

    try {
      setCreating(true)
      await getIdToken()
      const schedule = await createRecurringSchedule({
        clientId: selectedClientId,
        clientName: selectedClient?.name,
        amount: parseFloat(amount),
        currency,
        description: description || null,
        frequency,
        dayOfMonth: frequency !== 'weekly' ? parseInt(dayOfMonth) : null,
        dayOfWeek: frequency === 'weekly' ? parseInt(dayOfWeek) : null,
        startDate,
      })

      setSchedules((prev) => [schedule, ...prev])
      setCreateDialogOpen(false)
      resetForm()

      toast({
        title: 'Schedule created',
        description: `Recurring invoice schedule for ${selectedClient?.name} has been created.`,
      })
    } catch (error) {
      console.error('Failed to create schedule:', error)
      toast({
        title: 'Failed to create schedule',
        description: error instanceof Error ? error.message : 'An error occurred',
        variant: 'destructive',
      })
    } finally {
      setCreating(false)
    }
  }, [selectedClientId, amount, startDate, clients, currency, description, frequency, dayOfMonth, dayOfWeek, getIdToken, toast])

  const handleToggleActive = useCallback(async (schedule: RecurringInvoiceSchedule) => {
    try {
      await getIdToken()
      const updated = await updateRecurringSchedule(schedule.id, {
        isActive: !schedule.isActive,
      })

      setSchedules((prev) =>
        prev.map((s) => (s.id === schedule.id ? updated : s))
      )

      toast({
        title: schedule.isActive ? 'Schedule paused' : 'Schedule activated',
        description: `Recurring invoice for ${schedule.clientName} has been ${schedule.isActive ? 'paused' : 'activated'}.`,
      })
    } catch (error) {
      console.error('Failed to update schedule:', error)
      toast({
        title: 'Failed to update schedule',
        description: error instanceof Error ? error.message : 'An error occurred',
        variant: 'destructive',
      })
    }
  }, [getIdToken, toast])

  const handleDelete = useCallback(async () => {
    if (!scheduleToDelete) return

    try {
      await getIdToken()
      await deleteRecurringSchedule(scheduleToDelete.id)

      setSchedules((prev) => prev.filter((s) => s.id !== scheduleToDelete.id))
      setDeleteDialogOpen(false)
      setScheduleToDelete(null)

      toast({
        title: 'Schedule deleted',
        description: `Recurring invoice for ${scheduleToDelete.clientName} has been deleted.`,
      })
    } catch (error) {
      console.error('Failed to delete schedule:', error)
      toast({
        title: 'Failed to delete schedule',
        description: error instanceof Error ? error.message : 'An error occurred',
        variant: 'destructive',
      })
    }
  }, [scheduleToDelete, getIdToken, toast])

  const handleGenerateNow = useCallback(async (schedule: RecurringInvoiceSchedule) => {
    try {
      setGeneratingId(schedule.id)
      await getIdToken()
      const result = await triggerRecurringInvoice(schedule.id)

      setSchedules((prev) =>
        prev.map((s) =>
          s.id === schedule.id
            ? {
                ...s,
                lastRunDate: new Date().toISOString(),
                lastInvoiceId: result.invoiceId,
                nextRunDate: result.nextRunDate,
                totalInvoicesGenerated: s.totalInvoicesGenerated + 1,
              }
            : s
        )
      )

      toast({
        title: 'Invoice generated',
        description: `A new invoice has been created for ${schedule.clientName}.`,
      })
    } catch (error) {
      console.error('Failed to generate invoice:', error)
      toast({
        title: 'Failed to generate invoice',
        description: error instanceof Error ? error.message : 'An error occurred',
        variant: 'destructive',
      })
    } finally {
      setGeneratingId(null)
    }
  }, [getIdToken, toast])

  const activeCount = schedules.filter((s) => s.isActive).length

  return (
    <>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <div>
            <CardTitle className="flex items-center gap-2 text-base">
              <CalendarClock className="h-4 w-4" />
              Recurring Invoices
            </CardTitle>
            <CardDescription>
              {activeCount} active schedule{activeCount !== 1 ? 's' : ''}
            </CardDescription>
          </div>
          <Button size="sm" onClick={() => setCreateDialogOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Add Schedule
          </Button>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : schedules.length === 0 ? (
            <div className="rounded-md border border-dashed border-muted/50 bg-muted/10 p-6 text-center">
              <CalendarClock className="mx-auto h-8 w-8 text-muted-foreground" />
              <p className="mt-2 text-sm text-muted-foreground">
                No recurring invoices set up yet.
              </p>
              <Button
                variant="outline"
                size="sm"
                className="mt-4"
                onClick={() => setCreateDialogOpen(true)}
              >
                <Plus className="mr-2 h-4 w-4" />
                Create First Schedule
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              {schedules.map((schedule) => (
                <div
                  key={schedule.id}
                  className="flex items-center justify-between rounded-md border border-muted/50 p-3"
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-medium truncate">{schedule.clientName}</span>
                      <Badge variant={schedule.isActive ? 'default' : 'secondary'}>
                        {schedule.isActive ? 'Active' : 'Paused'}
                      </Badge>
                    </div>
                    <div className="mt-1 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <DollarSign className="h-3 w-3" />
                        {formatCurrency(schedule.amount, schedule.currency)}
                      </span>
                      <span>{FREQUENCY_LABELS[schedule.frequency]}</span>
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        Next: {formatDate(schedule.nextRunDate)}
                      </span>
                      <span className="flex items-center gap-1">
                        <Receipt className="h-3 w-3" />
                        {schedule.totalInvoicesGenerated} generated
                      </span>
                    </div>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm">
                        <ChevronDown className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem
                        onClick={() => handleGenerateNow(schedule)}
                        disabled={!schedule.isActive || generatingId === schedule.id}
                      >
                        {generatingId === schedule.id ? (
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        ) : (
                          <RefreshCw className="mr-2 h-4 w-4" />
                        )}
                        Generate Now
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleToggleActive(schedule)}>
                        {schedule.isActive ? (
                          <>
                            <Pause className="mr-2 h-4 w-4" />
                            Pause Schedule
                          </>
                        ) : (
                          <>
                            <Play className="mr-2 h-4 w-4" />
                            Activate Schedule
                          </>
                        )}
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        className="text-destructive"
                        onClick={() => {
                          setScheduleToDelete(schedule)
                          setDeleteDialogOpen(true)
                        }}
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        Delete Schedule
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Create Dialog */}
      <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Create Recurring Invoice</DialogTitle>
            <DialogDescription>
              Set up an automatic invoice schedule for a client.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="client">Client *</Label>
              <Select value={selectedClientId} onValueChange={setSelectedClientId}>
                <SelectTrigger id="client">
                  <SelectValue placeholder="Select a client" />
                </SelectTrigger>
                <SelectContent>
                  {clients.map((client) => (
                    <SelectItem key={client.id} value={client.id}>
                      {client.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="amount">Amount *</Label>
                <Input
                  id="amount"
                  type="number"
                  min="0"
                  step="0.01"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="0.00"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="currency">Currency</Label>
                <Select value={currency} onValueChange={setCurrency}>
                  <SelectTrigger id="currency">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="USD">USD</SelectItem>
                    <SelectItem value="EUR">EUR</SelectItem>
                    <SelectItem value="GBP">GBP</SelectItem>
                    <SelectItem value="INR">INR</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="frequency">Frequency *</Label>
              <Select value={frequency} onValueChange={(v) => setFrequency(v as RecurringFrequency)}>
                <SelectTrigger id="frequency">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="weekly">Weekly</SelectItem>
                  <SelectItem value="monthly">Monthly</SelectItem>
                  <SelectItem value="quarterly">Quarterly</SelectItem>
                  <SelectItem value="annually">Annually</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {frequency === 'weekly' ? (
              <div className="space-y-2">
                <Label htmlFor="dayOfWeek">Day of Week</Label>
                <Select value={dayOfWeek} onValueChange={setDayOfWeek}>
                  <SelectTrigger id="dayOfWeek">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {DAY_OF_WEEK_LABELS.map((label, index) => (
                      <SelectItem key={index} value={index.toString()}>
                        {label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            ) : (
              <div className="space-y-2">
                <Label htmlFor="dayOfMonth">Day of Month</Label>
                <Select value={dayOfMonth} onValueChange={setDayOfMonth}>
                  <SelectTrigger id="dayOfMonth">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Array.from({ length: 28 }, (_, i) => i + 1).map((day) => (
                      <SelectItem key={day} value={day.toString()}>
                        {day}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="startDate">Start Date *</Label>
              <Input
                id="startDate"
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Optional description for the invoice"
                rows={2}
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setCreateDialogOpen(false)
                resetForm()
              }}
              disabled={creating}
            >
              Cancel
            </Button>
            <Button onClick={handleCreate} disabled={creating}>
              {creating ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating...
                </>
              ) : (
                'Create Schedule'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Recurring Invoice?</DialogTitle>
            <DialogDescription>
              This will permanently delete the recurring invoice schedule for{' '}
              <strong>{scheduleToDelete?.clientName}</strong>. This action cannot be undone.
              Previously generated invoices will not be affected.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setDeleteDialogOpen(false)
                setScheduleToDelete(null)
              }}
            >
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDelete}>
              Delete Schedule
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
