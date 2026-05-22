/** Format an Airtable ISO date/time for display in tables and detail views. */
export function formatAirtableDateTime(
  iso: string | undefined,
): string | undefined {
  if (!iso) return undefined
  const date = new Date(iso)
  if (Number.isNaN(date.getTime())) return iso
  return date.toLocaleString(undefined, {
    dateStyle: 'short',
    timeStyle: 'short',
  })
}
