export type UsersAuthProvider = 'airtable_oauth' | 'custom_table'

export const USERS_AUTH_PROVIDER_CONFIG_KEY = 'module.users.authProvider'
export const USERS_EXTEND_OAUTH_CONFIG_KEY = 'module.users.extendOAuthProfiles'

export function normalizeUsersAuthProvider(raw: unknown): UsersAuthProvider {
  const s = String(raw ?? 'airtable_oauth').toLowerCase().trim()
  if (s === 'custom_table' || s === 'custom' || s === 'table') return 'custom_table'
  return 'airtable_oauth'
}

export const USERS_AUTH_PROVIDER_OPTIONS: readonly {
  value: UsersAuthProvider
  label: string
  description: string
}[] = [
  {
    value: 'airtable_oauth',
    label: 'Airtable OAuth',
    description:
      'Sign-in uses the same Airtable OAuth session as the app connection (whoami). Optionally extend with App Users rows.',
  },
  {
    value: 'custom_table',
    label: 'Custom App Users table',
    description:
      'Email/username + password stored in App Users. Passwords are hashed (PBKDF2) before saving to Airtable.',
  },
]
