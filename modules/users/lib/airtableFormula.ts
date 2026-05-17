/** Escape a string for use inside Airtable formula single-quoted literals. */
export function escapeAirtableFormulaString(value: string): string {
  return value.replace(/\\/g, '\\\\').replace(/'/g, "\\'")
}
