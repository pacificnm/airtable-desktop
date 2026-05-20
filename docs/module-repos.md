# Custom module repos (`module-repos/`)

Keep the **default app** in [`modules/`](../modules/) (`config`, `roles`, `users`, `notifications`). Put **Shared base features** in [`module-repos/`](../module-repos/) — a **single git submodule** pointing at [pacificnm/airtable-shared-base](https://github.com/pacificnm/airtable-shared-base).

The desktop app discovers both locations automatically (`modules/*/index.ts` and `module-repos/*/index.ts`).

## Layout

```
airtable-desktop/
  modules/              ← default app (this repo)
    config/
    roles/
    users/
    notifications/
  module-repos/         ← submodule → github.com/pacificnm/airtable-shared-base
    location/
    space/
    city/
    …
```

## 1. Clone

```bash
git clone --recurse-submodules https://github.com/you/airtable-desktop.git
# or after clone:
git submodule update --init module-repos
```

## 2. Add or change a module

1. Edit or scaffold under `module-repos/<moduleId>/` (see **Developer → Base tables** in the app).
2. Commit and push in the **shared-base** repo:

```bash
cd module-repos
git add .
git commit -m "Add or update module"
git push
```

3. In **airtable-desktop**, commit the new submodule SHA.
4. Enable the module id via **Developer → Modules** or `src/config/enabledModules.ts`.

Each module folder matches the `modules/roles/` layout (`index.ts`, `tables.ts`, `screens/`, …). Imports use the app `@/` alias:

```ts
import type { AppModuleDefinition } from '@/lib/modules/types.ts'
```

### Menu grouping

Declare shared drawer sections in `menuNav.groups` with `scope: 'global'`, then `menuGroupId` on items (e.g. all Location/geo modules use `menuGroupId: 'location'`).

## Day-to-day

| Task | Command |
|------|---------|
| Update modules after pull | `git submodule update --init module-repos` |
| Work on modules | `cd module-repos`, commit/push to shared-base |
| Pin version in app | Commit submodule pointer in airtable-desktop |

## Rules

- Do **not** reuse ids from default modules (`config`, `roles`, `users`, `notifications`) in `module-repos/`.
- Default modules stay in `modules/`; Shared base tables live only in **airtable-shared-base**.

## npm packages

If you need modules outside this tree entirely, see [external-modules.md](./external-modules.md).
