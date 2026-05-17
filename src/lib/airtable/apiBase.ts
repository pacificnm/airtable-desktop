/** Airtable REST API root — proxied in Vite dev to avoid browser CORS. */
export function getAirtableApiRoot(): string {
  if (import.meta.env.DEV && typeof window !== 'undefined') {
    return '/__airtable_api/v0'
  }
  return 'https://api.airtable.com/v0'
}
