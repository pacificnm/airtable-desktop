# External modules (separate repos)

Use a **separate git repo per feature module**, install it into this app as an npm package, and register it in `src/config/installedModules.ts`. Bundled modules under `modules/` remain supported for templates and optional built-ins you want in the starter repo.

## Architecture

```
my-org/atd-module-inventory/     ← its own repo
  package.json                   ← name: @my-org/atd-module-inventory
  src/index.ts                   ← default export: AppModuleDefinition
  src/tables.ts, screens/, …

airtable-desktop/                ← this repo (shell + core)
  package.json                   ← dependency on @my-org/atd-module-inventory
  src/config/installedModules.ts ← static import + registration
```

At runtime the app merges:

1. **Bundled** — `modules/*/index.ts` (Vite `import.meta.glob`)
2. **Installed** — packages you import in `installedModules.ts`

Enable/disable and provisioning work the same as bundled modules (`enabledModuleIds`, **Developer → Modules**).

## 1. Create the module repo

Copy a bundled template (`modules/roles/` or `modules/config/`) into a new repository. Adjust `package.json`:

```json
{
  "name": "@my-org/atd-module-inventory",
  "version": "0.1.0",
  "type": "module",
  "main": "./src/index.ts",
  "exports": {
    ".": "./src/index.ts"
  },
  "peerDependencies": {
    "react": "^19.0.0",
    "react-dom": "^19.0.0",
    "@mui/material": "^9.0.0",
    "@emotion/react": "^11.0.0",
    "@emotion/styled": "^11.0.0",
    "zod": "^4.0.0"
  }
}
```

### Imports from core (SDK)

Bundled modules use relative paths such as `../../src/lib/modules/types.ts`. **External repos cannot** — they need a stable package. Until you publish `@airtable-desktop/sdk` (or your fork), use one of:

| Approach | When |
|----------|------|
| **`file:` dependency on a local SDK package** | Monorepo or sibling clone |
| **Vite alias in the module repo** | `"@airtable-desktop/sdk"` → path to this app’s `src/` (dev only) |
| **Published SDK** | Production / multiple apps |

The SDK should re-export: `AppModuleDefinition`, table/blueprint types, UI components (`RecordListPage`, `FormDrawer`, …), hooks (`useAirtableListQuery`, `useToast`, …), and Airtable helpers used by reference modules.

Match the **same major versions** of React, MUI, and Zod as this app (`package.json`).

### Default export

`src/index.ts` must default-export an `AppModuleDefinition` (same shape as `modules/roles/index.ts`).

## 2. Install into the desktop app

**From a registry**

```bash
npm install @my-org/atd-module-inventory
```

**Local sibling repo (common during development)**

```json
"dependencies": {
  "@my-org/atd-module-inventory": "file:../atd-module-inventory"
}
```

## 3. Register in the app

Edit `src/config/installedModules.ts`:

```ts
import inventory from '@my-org/atd-module-inventory'

export const installedModules = [
  {
    definition: inventory,
    rootPath: 'node_modules/@my-org/atd-module-inventory',
  },
] as const satisfies readonly DiscoveredModule[]
```

Restart the dev server. The module appears in **Developer → Modules** (disabled until you enable it).

If the same `id` exists under `modules/` and as an installed package, the **installed** copy wins.

## 4. Vite / Electron notes

Add linked packages to dependency optimization when screens fail to load:

```ts
// vite.config.ts
export default defineConfig({
  optimizeDeps: {
    include: ['@my-org/atd-module-inventory'],
  },
  resolve: {
    dedupe: ['react', 'react-dom'],
  },
})
```

**Table id patching (dev only):** Electron can rewrite `tableId` placeholders in `modules/<id>/tables.ts` for bundled modules. For installed modules, provisioning still saves ids to **App Config** and **local storage**; file patching only works if the package is a `file:` link to a checkout on disk (optional path override in a future SDK field). Do not rely on patching `node_modules` in CI.

## 5. What stays in this repo

| In `airtable-desktop` | In module repos |
|----------------------|-----------------|
| Shell, routing, module registry | Feature screens, hooks, Airtable tables |
| `src/lib/modules/*` discovery | `index.ts` manifest |
| Optional reference modules (`modules/config`, …) | Your product features |
| `enabledModuleIds` / Developer → Modules | `README.md`, `airtable-setup.md` |

You can remove bundled copies of features you have externalized (delete `modules/<id>/` and stop shipping them in the starter).

## Checklist

1. New repo from `modules/roles/` (or `config/`) template.
2. Replace `../../src/…` imports with `@airtable-desktop/sdk` (or dev alias).
3. Publish or `file:` link the package; `npm install` in this app.
4. Register in `src/config/installedModules.ts`.
5. Add module id to `enabledModuleIds` (or enable in **Developer → Modules**).
6. Connect to Airtable and **Enable** to provision tables.

See also [modules.md](./modules.md) for manifest fields, menu placements, and UI conventions.
