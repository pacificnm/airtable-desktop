/** Canonical Airtable record status labels used across location reference tables. */
export type KnownRecordStatus = 'Active' | 'Deleted'

export function normalizeRecordStatus(
  value: string | undefined | null,
): KnownRecordStatus | undefined {
  const trimmed = value?.trim()
  if (!trimmed) return undefined
  const lower = trimmed.toLowerCase()
  if (lower === 'active') return 'Active'
  if (lower === 'deleted') return 'Deleted'
  return undefined
}
