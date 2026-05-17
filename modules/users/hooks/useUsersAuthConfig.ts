import { useConfigValue } from '../../config/hooks/useAppConfig.ts'
import { parseConfigBoolean } from '../../config/lib/parseConfigValue.ts'
import {
  normalizeUsersAuthProvider,
  USERS_AUTH_PROVIDER_CONFIG_KEY,
  USERS_EXTEND_OAUTH_CONFIG_KEY,
  type UsersAuthProvider,
} from '../lib/usersAuthConfig.ts'

export function useUsersAuthConfig(): {
  authProvider: UsersAuthProvider
  extendOAuthProfiles: boolean
  isLoading: boolean
  isError: boolean
} {
  const providerQuery = useConfigValue<string>(
    USERS_AUTH_PROVIDER_CONFIG_KEY,
    'airtable_oauth',
  )
  const extendQuery = useConfigValue(USERS_EXTEND_OAUTH_CONFIG_KEY, true)

  const authProvider = normalizeUsersAuthProvider(providerQuery.value)

  const extendOAuthProfiles =
    extendQuery.entry == null
      ? true
      : parseConfigBoolean(
          extendQuery.entry.value,
          extendQuery.entry.valueType,
          true,
        )

  return {
    authProvider,
    extendOAuthProfiles,
    isLoading: providerQuery.isLoading || extendQuery.isLoading,
    isError: providerQuery.isError || extendQuery.isError,
  }
}
