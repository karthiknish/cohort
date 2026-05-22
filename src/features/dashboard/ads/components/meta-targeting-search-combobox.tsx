'use client'

import { useCallback, useId, useState } from 'react'
import { Loader2, Search } from 'lucide-react'

import { useMetaTargetingSearch, type MetaTargetingSearchResult } from '@/features/dashboard/ads/hooks/use-meta-targeting-search'
import { Button } from '@/shared/ui/button'
import { Input } from '@/shared/ui/input'
import { cn } from '@/lib/utils'

type MetaTargetingSearchComboboxProps = {
  workspaceId: string | null
  clientId?: string | null
  mode: 'interests' | 'geolocations'
  placeholder?: string
  disabled?: boolean
  onSelect: (item: MetaTargetingSearchResult) => void
  className?: string
}

export function MetaTargetingSearchCombobox({
  workspaceId,
  clientId,
  mode,
  placeholder,
  disabled,
  onSelect,
  className,
}: MetaTargetingSearchComboboxProps) {
  const listId = useId()
  const [open, setOpen] = useState(false)
  const { query, setQuery, results, loading, error, clear } = useMetaTargetingSearch({
    workspaceId,
    clientId,
    mode,
    enabled: !disabled,
  })

  const handleSelect = useCallback(
    (item: MetaTargetingSearchResult) => {
      onSelect(item)
      clear()
      setOpen(false)
    },
    [clear, onSelect],
  )

  const handleFocus = useCallback(() => setOpen(true), [])
  const handleBlur = useCallback(() => {
    window.setTimeout(() => setOpen(false), 150)
  }, [])

  return (
    <div className={cn('relative', className)}>
      <div className="relative">
        <Search className="pointer-events-none absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" aria-hidden />
        <Input
          value={query}
          onChange={(event) => {
            setQuery(event.target.value)
            setOpen(true)
          }}
          onFocus={handleFocus}
          onBlur={handleBlur}
          disabled={disabled || !workspaceId}
          placeholder={placeholder ?? (mode === 'interests' ? 'Search Meta interests…' : 'Search countries, regions, cities…')}
          className="h-9 pl-9 text-sm"
          role="combobox"
          aria-expanded={open}
          aria-controls={listId}
          autoComplete="off"
        />
        {loading ? (
          <Loader2 className="absolute right-2.5 top-1/2 h-4 w-4 -translate-y-1/2 animate-spin text-muted-foreground" aria-hidden />
        ) : null}
      </div>

      {open && (results.length > 0 || error || (query.trim().length >= 2 && !loading)) ? (
        <ul
          id={listId}
          role="listbox"
          className="absolute z-50 mt-1 max-h-48 w-full overflow-auto rounded-lg border border-border bg-popover py-1 shadow-md"
        >
          {error ? (
            <li className="px-3 py-2 text-xs text-destructive">{error}</li>
          ) : null}
          {results.map((item) => (
            <li key={`${item.type}-${item.id}`} role="option">
              <Button
                type="button"
                variant="ghost"
                className="h-auto w-full justify-start rounded-none px-3 py-2 text-left font-normal"
                onMouseDown={(event) => event.preventDefault()}
                onClick={() => handleSelect(item)}
              >
                <span className="block text-sm font-medium">{item.name}</span>
                {item.path?.length ? (
                  <span className="block text-[10px] text-muted-foreground">{item.path.join(' › ')}</span>
                ) : null}
                {item.audienceSize ? (
                  <span className="block text-[10px] text-muted-foreground">
                    ~{item.audienceSize.toLocaleString()} people
                  </span>
                ) : null}
              </Button>
            </li>
          ))}
          {!error && results.length === 0 && query.trim().length >= 2 && !loading ? (
            <li className="px-3 py-2 text-xs text-muted-foreground">No matches — try a different term</li>
          ) : null}
        </ul>
      ) : null}
    </div>
  )
}
