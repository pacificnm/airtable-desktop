# App Config

Key–value settings stored in Airtable. Use for feature flags, module on/off toggles, and app-wide options without redeploying.

## Enable the module

**Developer → Modules** → **Enable** while connected to your base. The app creates the **App Config** table and starter rows automatically.

Or edit `enabledModuleIds` manually and follow [airtable-setup.md](./airtable-setup.md).

## Module on/off in Airtable

Each feature module can read a boolean row:

| Key | Example value |
|-----|----------------|
| `module.<moduleId>.enabled` | `true` / `false` |

```ts
import { useModuleEnabled } from '../config/hooks/useModuleEnabled.ts'

function MyFeature() {
  const { enabled, isLoading } = useModuleEnabled('roles')
  if (isLoading) return null
  if (!enabled) return null
  // …
}
```

Install/remove modules still uses `enabledModuleIds` in code. Airtable flags control runtime behavior for installed modules.

## Hooks

| Hook | Purpose |
|------|---------|
| `useAppConfig()` | List all config rows |
| `useConfigValue(key, default)` | One parsed value |
| `useConfigMap()` | `Map` of active keys → parsed values |
| `useModuleEnabled(moduleId)` | `module.{id}.enabled` boolean |

## Paths

- `tables.ts` — field mappings
- `lib/parseConfigValue.ts` — string → typed value
- `hooks/` — data + flags
- `screens/ConfigListScreen.tsx` — manage rows in the app
