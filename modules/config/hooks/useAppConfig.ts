import { useMemo } from 'react'
import { useAirtableListQuery } from '../../../src/hooks/useAirtableTableQuery.ts'
import {
  configEntriesFromRecords,
  configMapFromEntries,
  getConfigValueFromEntries,
  type ConfigEntry,
} from '../lib/configFromRecords.ts'
import { APP_CONFIG_TABLE_KEY } from '../validation/config.ts'

/** All config rows from the App Config table. */
export function useAppConfig() {
  const query = useAirtableListQuery(APP_CONFIG_TABLE_KEY)

  const entries = useMemo((): ConfigEntry[] => {
    const records = query.data?.records ?? []
    return configEntriesFromRecords(records)
  }, [query.data?.records])

  return { ...query, entries }
}

/** Active config keys → parsed values. */
export function useConfigMap(options?: { activeOnly?: boolean }) {
  const { entries, ...rest } = useAppConfig()
  const activeOnly = options?.activeOnly
  const map = useMemo(
    () => configMapFromEntries(entries, { activeOnly }),
    [entries, activeOnly],
  )
  return { map, entries, ...rest }
}

/** Single config value by key (undefined if missing or inactive). */
export function useConfigValue<T = unknown>(
  key: string,
  defaultValue?: T,
): {
  value: T | undefined
  entry: ConfigEntry | undefined
  isLoading: boolean
  isError: boolean
  error: Error | null
} {
  const { entries, isLoading, isError, error } = useAppConfig()

  const entry = entries.find((e) => e.key === key && e.active)
  const raw = getConfigValueFromEntries(entries, key)
  const value = (raw !== undefined ? (raw as T) : defaultValue) as T | undefined

  return {
    value,
    entry,
    isLoading,
    isError,
    error: error as Error | null,
  }
}
