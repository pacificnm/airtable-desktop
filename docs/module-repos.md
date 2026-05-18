# Custom module repos (`module-repos/`)

Keep the **default app** in [`modules/`](../modules/) (`config`, `roles`, `users`, `notifications`). Put **your features** in [`module-repos/`](../module-repos/) — one **GitHub repository per folder**, usually as a **git submodule**.

The desktop app discovers both locations automatically (`modules/*/index.ts` and `module-repos/*/index.ts`).

## Layout

```
airtable-desktop/
  modules/              ← default app (this repo)
    config/
    roles/
    users/
    notifications/
  module-repos/         ← your features (submodules)
    inventory/          ← github.com/you/atd-module-inventory
```

## 1. Create the module repo on GitHub

1. Create an empty repo, e.g. `you/atd-module-inventory`.
2. Copy the layout from `modules/roles/` into the **root** of the new repo (`index.ts`, `tables.ts`, `screens/`, …).
3. Keep imports like bundled modules:

```ts
import type { AppModuleDefinition } from '../../src/lib/modules/types.ts'
```

4. Commit and push.

## 2. Add submodule under `module-repos/`

```bash
git submodule add https://github.com/you/atd-module-inventory.git module-repos/inventory
git add .gitmodules module-repos/inventory
git commit -m "Add inventory module submodule"
```

The folder name should match the module `id` in `index.ts` (e.g. `inventory`).

## 3. Enable

1. Add `'inventory'` via **Developer → Modules** or `src/config/enabledModules.ts`.
2. Restart dev, connect to Airtable, **Enable** to provision tables.

## Cloning

```bash
git clone --recurse-submodules https://github.com/you/airtable-desktop.git
# or after clone:
git submodule update --init --recursive
```

## Day-to-day

| Task | Command |
|------|---------|
| Update submodules after pull | `git submodule update --init --recursive` |
| Work on a module | `cd module-repos/inventory`, commit/push there |
| Pin version in app | Commit the submodule pointer in the parent repo |

## Rules

- Do **not** reuse ids from default modules (`config`, `roles`, `users`, `notifications`) in `module-repos/`.
- Default modules stay in `modules/`; only **new** features go in `module-repos/`.

## npm packages

If you need modules outside this tree entirely, see [external-modules.md](./external-modules.md).
