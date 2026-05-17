# Config module — Airtable setup

Create one table to store app and module settings as key–value pairs.

## App Config

| Field name  | Type          | Notes |
|-------------|---------------|-------|
| Key         | Single line   | Primary field. Unique id, e.g. `app.name`, `module.roles.enabled` |
| Value       | Long text     | Stored as text; parsed using **Value type** |
| Value type  | Single select | Options: `string`, `number`, `boolean`, `json` |
| Label       | Single line   | Optional display name |
| Description | Long text     | Optional help text |
| Module      | Single line   | Optional owner module id (`roles`, `config`, …) |
| Active      | Checkbox      | Default on. Inactive rows are ignored at runtime |

### Suggested starter rows

| Key | Value | Value type | Module | Active |
|-----|-------|------------|--------|--------|
| `module.config.enabled` | `true` | boolean | config | ✓ |
| `module.roles.enabled` | `true` | boolean | roles | ✓ |
| `app.displayName` | `My App` | string | | ✓ |

After creating the table, copy its id into `modules/config/tables.ts` (`tblREPLACE_APP_CONFIG`).
