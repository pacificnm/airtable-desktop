# Module system

The starter separates **core** (`src/`) from **modules** (`modules/`). You can pull core updates without touching your feature folders, as long as you keep modules on stable extension APIs.

**Your features (separate GitHub repos):** git submodules under `module-repos/<id>/`. Default app modules stay in `modules/`. See [module-repos.md](./module-repos.md). For npm packages, see [external-modules.md](./external-modules.md).

## When to use a module

| Approach | Use for |
|----------|---------|
| **Module** (`modules/<id>/`) | Product features you may enable/disable, provision in Airtable, or ship as a bundle |
| **Core screen** (`src/screens/`) | Shell-only or experimental pages not tied to a plugin lifecycle |

Modules register routes, tables, and menus via `index.ts` — no edits to `src/config/screens.ts` or `src/config/menu.ts`.

## Layout

```
modules/                 # default app only
  config/
  roles/
module-repos/            # your GitHub submodules
  my-feature/
    index.ts           # manifest (default export)
    README.md
    airtable-setup.md
    tables.ts
    blueprints.ts
    validation/
    hooks/
    lib/               # *FromRecords.ts, *ListColumns.tsx, *CardLayout.tsx
    components/
    screens/
src/
  config/
    enabledModules.ts  # which modules load at startup
  lib/modules/         # discovery + registry (core — do not edit in apps)
```

## Create a module (checklist)

1. Copy `modules/config/` or `modules/roles/` as a template; rename folder to your id (e.g. `inventory`).
2. Edit `index.ts`: `id`, `name`, `version`, `dependsOn`, `screens`, `menuItems`, `tables`, `tableBlueprints`.
3. Define `tables.ts` (stable `key`, `fields`, `columns`, `validation`).
4. Add `blueprints.ts` for **Developer → Modules → Enable** (Meta API `schema.bases:write`).
5. Implement hooks, record mappers, and list screens with `src/components/ui/` (see below).
6. Write `airtable-setup.md` for operators.
7. Add id to `enabledModuleIds`, restart, then **Enable** in Developer → Modules.

## Enable / disable

**Recommended:** **Developer → Modules** → **Enable** (while connected). The app:

1. Provisions `dependsOn` modules first
2. Creates tables from `tableBlueprints`
3. Seeds config rows (config module)
4. Saves table ids to App Config, `modules/*/tables.ts` (Electron dev), and local storage
5. Reloads and updates `enabledModuleIds`

**Uninstall** disables the module and clears provisioning state; it does **not** delete Airtable tables.

Or edit `src/config/enabledModules.ts` manually and restart.

## Module manifest

Each `index.ts` default-exports `AppModuleDefinition`:

| Field | Purpose |
|-------|---------|
| `id`, `name`, `version` | Identity |
| `dependsOn` | Required module ids before enable (e.g. `['config']`) |
| `description`, `readmePath`, `airtableSetupPath` | Developer → Modules UI |
| `tables` | Merged into app table config |
| `tableBlueprints` | Schema for Airtable provisioning |
| `screens` | Route id, title, lazy `importScreen` |
| `menuItems` | Nav with `placements` (drawer and/or Electron menu) |
| `menuSections` | *(deprecated)* Drawer-only shorthand |
| `headerSlots` | Lazy components before user avatar |

### Menu placements

```ts
menuItems: [
  {
    id: 'inventory-list',
    label: 'Inventory',
    icon: 'gridView',
    viewId: 'inventoryList',
    placements: [
      { surface: 'appDrawer', section: { id: 'inventory', label: 'Inventory' } },
      { surface: 'electron', menu: 'developer', order: 40 },
    ],
  },
],
```

| Placement | Effect |
|-----------|--------|
| `appDrawer` + `section` | Hamburger menu |
| `electron` + `menu: 'view' \| 'developer'` | Native menu bar |

Legacy `menuSections` → app drawer only. Core dev tools (Tables, Modules, docs, tokens) are Electron-only via `src/lib/menu/coreMenuContributions.ts`.

### Header slots

```ts
headerSlots: [
  { id: 'bell', order: 10, importSlot: () => import('./components/MySlot.tsx') },
]
```

Use `useHeaderSlotContext()` for `onNavigate`. See `modules/notifications/`.

### Notifications (pub/sub)

```ts
import { publishNotification } from '../src/lib/notifications/index.ts'

publishNotification({
  title: 'Something happened',
  sourceModule: 'inventory',
  severity: 'warning',
  linkView: 'inventoryList',
})
```

Requires `notifications` module enabled + Airtable connected for persistence and bell UI.

## Module UI (required)

Use `src/components/ui/` — **no custom table/drawer/dialog components under `modules/`.**

| Concern | Use |
|---------|-----|
| List page | `RecordListPage` + `useRecordViewMode(screenId)` |
| Grid / cards | `RecordCollectionView` + `*ListColumns.tsx` + `*CardLayout.tsx` |
| Create / edit | `FormDrawer` + `*Form.tsx` |
| Delete | `ConfirmDeleteDialog` |
| Feedback | `useToast()` |

Reference: `modules/roles/screens/RolesListScreen.tsx`.

## Reference modules

| Module | Purpose |
|--------|---------|
| `config` | Key–value settings + `module.<id>.enabled` |
| `roles` | Roles & permissions |
| `users` | App users (OAuth or custom auth) |
| `notifications` | Pub/sub + header bell |

### Dependencies

| Module | Depends on |
|--------|------------|
| `config` | — |
| `roles` | `config` |
| `users` | `config`, `roles` |
| `notifications` | `config` |

Runtime toggle: `useModuleEnabled('roles')` from `modules/config/hooks/useModuleEnabled.ts` (requires config module + App Config row `module.roles.enabled`).

## Authoring tips

- Import shared APIs from `src/`; keep domain code under `modules/<id>/`.
- Use stable table `key`s in hooks and validation.
- Document schema in `airtable-setup.md`.
- In-app guide: **Documentation → Modules** in the app.
