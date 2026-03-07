export function buildProviderIdsKey(providerIds?: string[]): string {
  if (!providerIds || providerIds.length === 0) return ''
  return [...providerIds].sort().join('|')
}

export function normalizeProviderIds(providerIds?: string[]): string[] | undefined {
  const key = buildProviderIdsKey(providerIds)
  return key ? key.split('|') : undefined
}

export function normalizeInsightMarkdown(text: string): string {
  const trimmed = text.trim()
  if (!trimmed) return ''

  const withoutMarkdownFence = trimmed
    .replace(/^```markdown\s*/i, '')
    .replace(/^```md\s*/i, '')
    .replace(/^```\s*/i, '')
    .replace(/```\s*$/i, '')

  return withoutMarkdownFence
    .replace(/\r\n/g, '\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim()
}