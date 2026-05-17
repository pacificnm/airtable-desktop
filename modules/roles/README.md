# Roles & Role Permissions

Access-control module: **Roles** and **Role Permissions** tables, list screens, validators, and hooks.

## Enable

```ts
// src/config/enabledModules.ts
export const enabledModuleIds = ['config', 'roles'] as const
```

Optional: add Airtable row `module.roles.enabled` = `true` (boolean) and use
`useModuleEnabled('roles')` from the **config** module to hide UI at runtime.

Then restart the app and complete [airtable-setup.md](./airtable-setup.md).

## Contents

| Path | Purpose |
|------|---------|
| `tables.ts` | Airtable table IDs and field mappings |
| `validation/` | Zod / validation overrides |
| `hooks/` | Data hooks (`useRoles`, etc.) |
| `screens/` | List UI wired to core `ListScreen` |
| `airtable-setup.md` | Base schema instructions |
