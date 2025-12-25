import { Fragment } from 'react'

function escapeRegExp(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

export function highlightText(text: string, terms?: string[]) {
  if (!terms || terms.length === 0 || !text) return text
  const filtered = terms.map((t) => t.trim()).filter(Boolean)
  if (filtered.length === 0) return text

  const pattern = filtered.map((term) => escapeRegExp(term)).join('|')
  const regex = new RegExp(`(${pattern})`, 'gi')

  const segments = text.split(regex)
  return segments.map((segment, index) => {
    if (segment === '') return null
    if (regex.test(segment)) {
      // Reset regex.lastIndex side-effect from test
      regex.lastIndex = 0
      return (
        <mark key={`highlight-${index}`} className="rounded-sm bg-primary/20 px-0.5 py-[1px] text-primary">
          {segment}
        </mark>
      )
    }
    regex.lastIndex = 0
    return <Fragment key={`text-${index}`}>{segment}</Fragment>
  })
}

export function hasHighlightTerms(terms?: string[]) {
  return Array.isArray(terms) && terms.some((term) => term.trim().length > 0)
}
