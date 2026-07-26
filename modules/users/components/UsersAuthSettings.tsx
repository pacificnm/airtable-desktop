import { useState } from 'react'
import Alert from '@mui/material/Alert'
import MenuItem from '@mui/material/MenuItem'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { Action } from '../../../src/components/button/Action.tsx'
import {
  FormSelect,
  FormStack,
  FormSwitch,
  SettingsPanel,
} from '../../../src/components/ui/index.ts'
import { useToast } from '../../../src/hooks/useToast.ts'
import { useAppConfigCrud } from '../../config/hooks/useAppConfigCrud.ts'
import { useConfigValue } from '../../config/hooks/useAppConfig.ts'
import { parseConfigBoolean } from '../../config/lib/parseConfigValue.ts'
import {
  USERS_AUTH_PROVIDER_CONFIG_KEY,
  USERS_AUTH_PROVIDER_OPTIONS,
  USERS_EXTEND_OAUTH_CONFIG_KEY,
  normalizeUsersAuthProvider,
  type UsersAuthProvider,
} from '../lib/usersAuthConfig.ts'

export function UsersAuthSettings() {
  const toast = useToast()
  const crud = useAppConfigCrud()
  const providerConfig = useConfigValue(USERS_AUTH_PROVIDER_CONFIG_KEY, 'airtable_oauth')
  const extendConfig = useConfigValue(USERS_EXTEND_OAUTH_CONFIG_KEY, true)

  const currentProvider = normalizeUsersAuthProvider(providerConfig.value)
  const currentExtend =
    extendConfig.entry == null
      ? true
      : parseConfigBoolean(
          extendConfig.entry.value,
          extendConfig.entry.valueType,
          true,
        )

  const [provider, setProvider] = useState<UsersAuthProvider>(currentProvider)
  const [extendOAuth, setExtendOAuth] = useState(currentExtend)
  const [saving, setSaving] = useState(false)

  const selectedMeta = USERS_AUTH_PROVIDER_OPTIONS.find((o) => o.value === provider)

  const handleSave = async () => {
    setSaving(true)
    try {
      const providerEntry = providerConfig.entry
      const extendEntry = extendConfig.entry

      if (providerEntry) {
        await crud.updateEntry.mutateAsync({
          id: providerEntry.id,
          values: {
            key: USERS_AUTH_PROVIDER_CONFIG_KEY,
            value: provider,
            valueType: 'string',
            label: 'Users auth provider',
            description: selectedMeta?.description ?? '',
            module: 'users',
            active: true,
          },
        })
      }

      if (extendEntry) {
        await crud.updateEntry.mutateAsync({
          id: extendEntry.id,
          values: {
            key: USERS_EXTEND_OAUTH_CONFIG_KEY,
            value: extendOAuth ? 'true' : 'false',
            valueType: 'boolean',
            label: 'Extend OAuth profiles',
            description:
              'When using airtable_oauth, store extra fields in App Users linked by Airtable user id',
            module: 'users',
            active: true,
          },
        })
      }

      toast.success('User auth settings saved. Reload may be needed for sign-in mode.')
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Failed to save auth settings')
    } finally {
      setSaving(false)
    }
  }

  if (!providerConfig.entry || !extendConfig.entry) {
    return (
      <Alert severity="warning" sx={{ mb: 2 }}>
        Add App Config rows <code>{USERS_AUTH_PROVIDER_CONFIG_KEY}</code> and{' '}
        <code>{USERS_EXTEND_OAUTH_CONFIG_KEY}</code> (enable users module provisioning or
        seed config).
      </Alert>
    )
  }

  return (
    <SettingsPanel title="Authentication mode">
      <FormStack
        onSubmit={(event) => {
          event.preventDefault()
          if (saving || !crud.canMutate) return
          void handleSave()
        }}
      >
        <FormSelect
          labelId="users-auth-provider-label"
          label="Auth provider"
          value={provider}
          onChange={(value) => setProvider(value as UsersAuthProvider)}
        >
          {USERS_AUTH_PROVIDER_OPTIONS.map((opt) => (
            <MenuItem key={opt.value} value={opt.value}>
              {opt.label}
            </MenuItem>
          ))}
        </FormSelect>
        {selectedMeta ? (
          <Typography variant="body2" color="text.secondary">
            {selectedMeta.description}
          </Typography>
        ) : null}
        {provider === 'airtable_oauth' ? (
          <FormSwitch
            label="Extend OAuth users with App Users table (roles, notes, etc.)"
            checked={extendOAuth}
            onChange={setExtendOAuth}
          />
        ) : (
          <Alert severity="info" variant="outlined">
            Custom table mode uses email/username + password (PBKDF2 hash stored in
            Airtable). Users sign in from this screen; app connection still uses your
            Airtable PAT/OAuth for API access.
          </Alert>
        )}
        <Stack direction="row">
          <Action onClick={() => void handleSave()} loading={saving} disabled={!crud.canMutate}>
            Save auth settings
          </Action>
        </Stack>
      </FormStack>
    </SettingsPanel>
  )
}
