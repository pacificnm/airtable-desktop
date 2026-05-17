# Scaffold a screen

The in-app **Scaffold screen** tool generates everything needed for a starter list screen wired to your table hook.

## Where to find it

- **Developer → Tables** — open a table flyout, scroll to **Scaffold screen**
- **Developer → Documentation → Scaffold a screen**

## Before you scaffold

1. Paste **table config** into `src/config/tables.ts`
2. Paste **Zod** + **CRUD hook** (+ optional **Query hooks**)
3. Connect Airtable

## What it generates

| Output | Action |
|--------|--------|
| `src/screens/YourTable.tsx` | Create new file |
| `appView.ts` | Add view id to `AppView` union |
| `screens.ts` | Add title + lazy import |
| `menu.ts` | Add drawer item (`gridView` icon) |
| `tables.ts` | Add `screens: ['yourKey']` on the table entry |

Use **Copy all snippets** or copy each accordion block.

## Options

- **Generic ListScreen** (default) — thin wrapper around `ListScreen`; uses `tables.ts` columns + `useAirtableListQuery` (no CRUD hook required)
- **Inline screen** — full generated component; choose TanStack or `useEffect + list()` (requires CRUD hook)

## After pasting

1. Reload the dev app (or restart Vite) so new routes compile
2. Open the drawer — your screen appears under the **App** menu section
3. Customize columns in the screen file (replace the JSON preview table)
