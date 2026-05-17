/** Config `key` from an Airtable table name (matches `generateTableConfigSnippet`). */
export function configKeyFromTableName(name: string, override?: string): string {
  if (override) return override
  const base = name
    .trim()
    .replace(/[^a-zA-Z0-9]+(.)/g, (_, c: string) => c.toUpperCase())
    .replace(/[^a-zA-Z0-9]/g, '')
  if (!base) return 'table'
  return base.charAt(0).toLowerCase() + base.slice(1)
}

export function pascalFromConfigKey(configKey: string): string {
  return configKey.charAt(0).toUpperCase() + configKey.slice(1)
}

export function hookNameFromConfigKey(configKey: string): string {
  return `use${pascalFromConfigKey(configKey)}`
}
