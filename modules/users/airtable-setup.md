# App Users — Airtable setup

Prefer **Developer → Modules → Enable** on the `users` module (creates **App Users** and patches `tables.ts`).

## Table: App Users

| Field | Type | Notes |
|-------|------|--------|
| Email | Single line text | Login / contact |
| Display name | Single line text | Shown in UI |
| Username | Single line text | Custom auth login |
| Airtable user id | Single line text | OAuth `whoami.id` |
| Password hash | Long text | App-written PBKDF2 only |
| Role | Link to **Roles** | Optional; requires roles module |
| Active | Checkbox | Disable sign-in when unchecked |
| Notes | Long text | Optional |

## App Config rows

| Key | Type | Example |
|-----|------|---------|
| `module.users.enabled` | boolean | `true` |
| `module.users.authProvider` | string | `airtable_oauth` or `custom_table` |
| `module.users.extendOAuthProfiles` | boolean | `true` |

Seeded automatically when the **config** module table is provisioned.
