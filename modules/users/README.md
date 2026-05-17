# Users module

App user directory with two authentication modes (configured in **App Config**):

| Config key | Values |
|------------|--------|
| `module.users.authProvider` | `airtable_oauth` (default) or `custom_table` |
| `module.users.extendOAuthProfiles` | `true` / `false` — when using OAuth, sync/link **App Users** rows by Airtable user id |

Change these under **Users → Authentication mode** or in the App Config table.

## Modes

### Airtable OAuth (`airtable_oauth`)

- Identity comes from the same OAuth session as **menu → Airtable connection** (`whoami`).
- With **Extend OAuth profiles** enabled, the app upserts an **App Users** row keyed by `Airtable user id` so you can attach roles, notes, and other fields.
- No app-specific password; users sign in via Airtable OAuth at connection time.

### Custom table (`custom_table`)

- End users sign in on **Users** with email/username + password.
- Passwords are hashed with **PBKDF2** (150k iterations, SHA-256) before being stored in the `Password hash` field — never plain text.
- Session is kept in `localStorage` on this device.
- The Airtable API connection (PAT/OAuth) is still required for admins to manage data.

## Enable

```ts
// src/config/enabledModules.ts
export const enabledModuleIds = ['config', 'roles', 'users'] as const
```

Provision tables via **Developer → Modules** (requires `roles` table for the Role link field).

## Hooks

| Hook | Purpose |
|------|---------|
| `useUsersAuthConfig()` | Read auth provider + extend OAuth flag |
| `useAppUsers()` | List App Users |
| `useAppUsersCrud()` | Create / update / delete users |
| `useUsersModuleAuth()` | Custom-table sign-in session |
| `useDirectoryUser()` | Unified display user (OAuth + profile row) |

## Security notes

- Custom passwords are **hashed**, not encrypted (one-way). Do not store reversible secrets in Airtable.
- Restrict base access; anyone with full base access can read password hashes.
- For production, consider moving auth to a dedicated backend.
