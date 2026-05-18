# Custom modules (`module-repos/`)

Product features you own live here — **one GitHub repo per folder**, usually as a **git submodule**.

The default app (`config`, `roles`, `users`, `notifications`) stays in [`modules/`](../modules/).

## Installed modules

| Folder | Repository |
|--------|------------|
| `location/` | https://github.com/pacificnm/airtable-location |

## Add a module

```bash
git submodule add https://github.com/you/atd-module-inventory.git module-repos/inventory
```

Each repo’s root should match the `modules/roles/` layout (`index.ts`, `tables.ts`, `screens/`, …).

Import from the app shell with the `@/` alias (maps to `src/`):

```ts
import type { AppModuleDefinition } from '@/lib/modules/types.ts'
import { FormStack } from '@/components/ui/index.ts'
import { useAirtableListQuery } from '@/hooks/useAirtableTableQuery.ts'
```

Then enable the module id in **Developer → Modules** (or `src/config/enabledModules.ts`).

See [docs/module-repos.md](../docs/module-repos.md).
