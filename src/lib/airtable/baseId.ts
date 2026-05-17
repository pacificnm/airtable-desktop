/** Extract `app…` from a base URL, path, or raw id (ignores `/tbl…` segments). */
export function normalizeBaseId(raw: string | undefined): string | undefined {
  const trimmed = raw?.trim()
  if (!trimmed) return undefined
  const match = trimmed.match(/(app[a-zA-Z0-9]+)/)
  return match?.[1] ?? trimmed
}
