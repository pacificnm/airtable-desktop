import { useEffect } from 'react'
import { useAppConfig } from '../../../modules/config/hooks/useAppConfig.ts'
import { parseModuleTableConfigKey } from './moduleTableConfig.ts'
import { mergeModuleTableIdCache } from './moduleTableIdCache.ts'

/** Loads `module.*.table.*` keys from App Config into the module table id cache. */
export function ModuleTableIdHydrator() {
  const { entries } = useAppConfig()

  useEffect(() => {
    const partial: Record<string, string> = {}
    for (const entry of entries) {
      const parsed = parseModuleTableConfigKey(entry.key)
      if (!parsed) continue
      const tableId = String(entry.value ?? '').trim()
      if (tableId.startsWith('tbl')) {
        partial[parsed.tableKey] = tableId
      }
    }
    if (Object.keys(partial).length > 0) {
      mergeModuleTableIdCache(partial)
    }
  }, [entries])

  return null
}
