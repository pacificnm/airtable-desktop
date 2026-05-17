/** Parse `Retry-After` as seconds or HTTP-date. */
export function parseRetryAfterMs(value: string | null): number | undefined {
  if (!value?.trim()) return undefined
  const trimmed = value.trim()
  const asNum = Number(trimmed)
  if (!Number.isNaN(asNum) && asNum >= 0) return asNum * 1000
  const asDate = Date.parse(trimmed)
  if (!Number.isNaN(asDate)) return Math.max(0, asDate - Date.now())
  return undefined
}
