import { moduleEnabledConfigKey } from '../validation/config.ts'
import { parseConfigBoolean } from '../lib/parseConfigValue.ts'
import { useConfigValue } from './useAppConfig.ts'

/**
 * Runtime on/off for an installed module via Airtable row
 * `module.<moduleId>.enabled` (boolean). Code install is still `enabledModuleIds`.
 */
export function useModuleEnabled(
  moduleId: string,
  defaultEnabled = true,
): {
  enabled: boolean
  isLoading: boolean
  isError: boolean
  configKey: string
} {
  const key = moduleEnabledConfigKey(moduleId)
  const { entry, isLoading, isError } = useConfigValue(key)

  const enabled =
    entry == null
      ? defaultEnabled
      : parseConfigBoolean(
          entry.value,
          entry.valueType,
          defaultEnabled,
        )

  return { enabled, isLoading, isError, configKey: key }
}
