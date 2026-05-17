import MenuItem from '@mui/material/MenuItem'
import Typography from '@mui/material/Typography'
import {
  FormSelect,
  FormStack,
  FormSwitch,
  FormTextField,
} from '../../../src/components/ui/index.ts'
import type { Role } from '../../roles/lib/roleFromRecords.ts'
import type { AppUserFormValues } from '../lib/userForm.ts'
import type { UsersAuthProvider } from '../lib/usersAuthConfig.ts'

export interface AppUserFormProps {
  values: AppUserFormValues
  onChange: (values: AppUserFormValues) => void
  authProvider: UsersAuthProvider
  roles: readonly Role[]
  isEdit?: boolean
  disabled?: boolean
}

export function AppUserForm({
  values,
  onChange,
  authProvider,
  roles,
  isEdit = false,
  disabled = false,
}: AppUserFormProps) {
  const set = <K extends keyof AppUserFormValues>(
    key: K,
    value: AppUserFormValues[K],
  ) => onChange({ ...values, [key]: value })

  const showPassword = authProvider === 'custom_table'
  const showAirtableId = authProvider === 'airtable_oauth'

  return (
    <FormStack>
      <FormTextField
        label="Email"
        type="email"
        value={values.email}
        onChange={(e) => set('email', e.target.value)}
        disabled={disabled}
      />
      <FormTextField
        label="Display name"
        value={values.displayName}
        onChange={(e) => set('displayName', e.target.value)}
        disabled={disabled}
      />
      <FormTextField
        label="Username"
        value={values.username}
        onChange={(e) => set('username', e.target.value)}
        disabled={disabled}
        helperText={
          showPassword ? 'Used for custom sign-in when email is not set' : undefined
        }
      />
      {showAirtableId ? (
        <FormTextField
          label="Airtable user id"
          value={values.airtableUserId}
          onChange={(e) => set('airtableUserId', e.target.value)}
          disabled={disabled}
          placeholder="usrXXXXXXXX"
          helperText="Links this row to Airtable OAuth whoami id"
        />
      ) : null}
      {roles.length > 0 ? (
        <FormSelect
          labelId="app-user-role-label"
          label="Role"
          value={values.roleId}
          onChange={(value) => set('roleId', value)}
          disabled={disabled}
        >
          <MenuItem value="">
            <em>None</em>
          </MenuItem>
          {roles.map((role) => (
            <MenuItem key={role.id} value={role.id}>
              {role.name}
            </MenuItem>
          ))}
        </FormSelect>
      ) : null}
      {showPassword ? (
        <FormTextField
          label={isEdit ? 'New password (optional)' : 'Password'}
          type="password"
          value={values.password}
          onChange={(e) => set('password', e.target.value)}
          disabled={disabled}
          autoComplete={isEdit ? 'new-password' : 'new-password'}
          helperText="Stored as PBKDF2 hash in Airtable — never plain text"
        />
      ) : null}
      <FormTextField
        label="Notes"
        value={values.notes}
        onChange={(e) => set('notes', e.target.value)}
        disabled={disabled}
        multiline
        minRows={2}
      />
      <FormSwitch
        label="Active"
        checked={values.active}
        onChange={(checked) => set('active', checked)}
        disabled={disabled}
      />
      {showPassword ? (
        <Typography variant="caption" color="text.secondary">
          Password hashes use Web Crypto PBKDF2 (150k iterations, SHA-256).
        </Typography>
      ) : null}
    </FormStack>
  )
}
