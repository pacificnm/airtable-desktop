import type { AirtableTableConfig } from '../../../src/config/tables.ts'
import { getTableConfig } from '../../../src/config/tables.ts'

export const APP_CONFIG_TABLE_KEY = 'appConfig'

export function getAppConfigTableConfig(): AirtableTableConfig | undefined {
  return getTableConfig(APP_CONFIG_TABLE_KEY)
}

/** Config key for runtime module toggle (boolean). */
export function moduleEnabledConfigKey(moduleId: string): string {
  return `module.${moduleId}.enabled`
}
