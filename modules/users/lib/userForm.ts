import type { AirtableTableConfig } from '../../../src/config/tables.ts'
import { mapConfigToAirtableFields } from '../../../src/lib/airtable/mapRecordFields.ts'
import { linkedRecordIdsForWrite } from '../../roles/lib/linkedRecords.ts'
import type { UsersAuthProvider } from './usersAuthConfig.ts'
import type { AppUserRecord } from './userFromRecords.ts'
import { hashPassword } from './passwordCrypto.ts'

export interface AppUserFormValues {
  email: string
  displayName: string
  username: string
  airtableUserId: string
  roleId: string
  active: boolean
  notes: string
  /** Plain password; only used when authProvider is custom_table. */
  password: string
}

export function emptyAppUserFormValues(): AppUserFormValues {
  return {
    email: '',
    displayName: '',
    username: '',
    airtableUserId: '',
    roleId: '',
    active: true,
    notes: '',
    password: '',
  }
}

export function appUserToFormValues(user: AppUserRecord): AppUserFormValues {
  return {
    email: user.email,
    displayName: user.displayName,
    username: user.username ?? '',
    airtableUserId: user.airtableUserId ?? '',
    roleId: user.roleIds[0] ?? '',
    active: user.active,
    notes: user.notes ?? '',
    password: '',
  }
}

export async function appUserFormValuesToAirtableFields(
  config: AirtableTableConfig,
  values: AppUserFormValues,
  options: {
    authProvider: UsersAuthProvider
    includePassword: boolean
  },
): Promise<Record<string, unknown>> {
  const fields = mapConfigToAirtableFields(config, {
    email: values.email.trim(),
    displayName: values.displayName.trim() || undefined,
    username: values.username.trim() || undefined,
    airtableUserId: values.airtableUserId.trim() || undefined,
    role: linkedRecordIdsForWrite(values.roleId),
    active: values.active,
    notes: values.notes.trim() || undefined,
  })

  if (
    options.authProvider === 'custom_table' &&
    options.includePassword &&
    values.password
  ) {
    fields[config.fields.passwordHash ?? 'Password hash'] =
      await hashPassword(values.password)
  }

  return fields
}

export function validateAppUserFormValues(
  values: AppUserFormValues,
  options: {
    authProvider: UsersAuthProvider
    isEdit: boolean
  },
): string | null {
  if (!values.email.trim() && !values.username.trim()) {
    return 'Email or username is required.'
  }
  const email = values.email.trim()
  if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return 'Enter a valid email address.'
  }
  if (
    options.authProvider === 'custom_table' &&
    !options.isEdit &&
    !values.password
  ) {
    return 'Password is required for new users in custom table auth mode.'
  }
  if (values.password && values.password.length < 8) {
    return 'Password must be at least 8 characters.'
  }
  return null
}
