/** Meta Marketing API `special_ad_categories` values (v25+). */
export const META_SPECIAL_AD_CATEGORIES = [
  { value: 'NONE', label: 'None (standard ads)' },
  { value: 'HOUSING', label: 'Housing' },
  { value: 'EMPLOYMENT', label: 'Employment' },
  { value: 'CREDIT', label: 'Credit' },
  { value: 'ISSUES_ELECTIONS_POLITICS', label: 'Social issues, elections, or politics' },
] as const

export type MetaSpecialAdCategory = (typeof META_SPECIAL_AD_CATEGORIES)[number]['value']

export function normalizeMetaSpecialAdCategoriesForApi(
  selected: MetaSpecialAdCategory[],
): string[] {
  const withoutNone = selected.filter((value) => value !== 'NONE')
  return withoutNone.length > 0 ? withoutNone : []
}
