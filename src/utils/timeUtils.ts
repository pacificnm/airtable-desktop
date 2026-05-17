/** Human-readable duration from decimal hours (e.g. SLA targets). */
export function formatServiceLevelHours(hours: number): string {
  if (hours < 1) return `${Math.round(hours * 60)}m`
  if (hours >= 24 && hours % 24 === 0) return `${hours / 24}d`
  if (hours >= 24) {
    const d = Math.floor(hours / 24)
    const h = hours % 24
    return `${d}d ${h}h`
  }
  return `${hours}h`
}
