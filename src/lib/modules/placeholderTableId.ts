/** Default `tables.ts` placeholder id for a table key (matches provisioning docs). */
export function placeholderTableId(tableKey: string): string {
  const suffix = tableKey
    .replace(/([A-Z])/g, '_$1')
    .toUpperCase()
    .replace(/^_/, '')
  return `tblREPLACE_${suffix || 'TABLE'}`
}
