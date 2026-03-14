'use client'

import { useId, useMemo, useState } from 'react'
import { Check, ChevronsUpDown } from 'lucide-react'

import { Button } from '@/shared/ui/button'
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/shared/ui/command'
import { Popover, PopoverContent, PopoverTrigger } from '@/shared/ui/popover'
import { cn } from '@/lib/utils'

import type { AllocationUser } from '../lib/client-allocation'

type UserSearchPickerProps = {
  id?: string
  value: string
  onChange: (value: string) => void
  options: AllocationUser[]
  placeholder: string
  searchPlaceholder: string
  emptyText: string
  disabled?: boolean
  excludeNames?: string[]
}

function normalizeName(value: string) {
  return value.trim().toLowerCase()
}

export function UserSearchPicker({ id, value, onChange, options, placeholder, searchPlaceholder, emptyText, disabled = false, excludeNames = [] }: UserSearchPickerProps) {
  const [open, setOpen] = useState(false)
  const generatedId = useId()
  const triggerId = id ?? `user-search-picker-${generatedId}`
  const listboxId = `${triggerId}-listbox`

  const selectedValue = normalizeName(value)
  const excluded = useMemo(() => new Set(excludeNames.map(normalizeName)), [excludeNames])
  const availableOptions = useMemo(
    () => options.filter((option) => !excluded.has(normalizeName(option.name)) || normalizeName(option.name) === selectedValue),
    [excluded, options, selectedValue]
  )
  const selectedLabel = availableOptions.find((option) => normalizeName(option.name) === selectedValue)?.name ?? value

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          id={triggerId}
          type="button"
          variant="outline"
          role="combobox"
          aria-expanded={open}
          aria-controls={listboxId}
          aria-haspopup="listbox"
          disabled={disabled}
          className={cn('w-full justify-between font-normal', !selectedLabel && 'text-muted-foreground')}
        >
          <span className="truncate">{selectedLabel || placeholder}</span>
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0" align="start">
        <Command>
          <CommandInput placeholder={searchPlaceholder} />
          <CommandList id={listboxId} role="listbox" aria-labelledby={triggerId}>
            <CommandEmpty>{emptyText}</CommandEmpty>
            <CommandGroup>
              {availableOptions.map((option) => {
                const isSelected = normalizeName(option.name) === selectedValue

                return (
                  <CommandItem
                    key={option.id}
                    value={`${option.name} ${option.email ?? ''}`}
                    onSelect={() => {
                      onChange(option.name)
                      setOpen(false)
                    }}
                  >
                    <Check className={cn('mr-2 h-4 w-4', isSelected ? 'opacity-100' : 'opacity-0')} />
                    <div className="flex min-w-0 flex-col">
                      <span className="truncate">{option.name}</span>
                      {option.email ? <span className="text-xs text-muted-foreground">{option.email}</span> : null}
                    </div>
                  </CommandItem>
                )
              })}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}