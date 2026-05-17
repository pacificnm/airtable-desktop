# Notifications — Airtable setup

Create a **Notifications** table (or use **Developer → Modules → Enable** on `notifications`).

| Field | Type | Notes |
|-------|------|--------|
| Title | Single line | Primary field |
| Body | Long text | Optional |
| Severity | Single select | `info`, `success`, `warning`, `error` |
| Source module | Single line | Publisher module id |
| Event type | Single line | Optional event id |
| Read | Checkbox | Unread when unchecked |
| Metadata | Long text | JSON object |
| Link view | Single line | App view id for deep link |

## Config row

| Key | Value type | Example |
|-----|------------|---------|
| `module.notifications.enabled` | boolean | `true` |
