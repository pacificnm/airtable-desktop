# Generic list screen template

`ListScreen` renders a full-page table from **`tables.ts`** without a generated CRUD hook.

## Quick start

1. Add a table entry in `src/config/tables.ts` (with `columns` from Developer → Tables).
2. Create `src/screens/MyTable.tsx`:

```tsx
import { ListScreen } from '../components/list/ListScreen.tsx'

export default function MyTable() {
  return <ListScreen tableKey="myTable" title="My table" />
}
```

3. Wire routes (use **Scaffold a screen** for `appView`, `screens.ts`, `menu.ts` patches).

Or copy `src/screens/_template/ListScreen.tsx` as a starting point.

## How it works

| Piece | Role |
|-------|------|
| `getListColumns(config)` | Visible columns from `columns` or `fields` |
| `formatCellValue(value)` | Strings, numbers, linked-record arrays, etc. |
| `GenericListTable` | MUI table body; `EmptyState` when no rows |
| `useAirtableListQuery(tableKey)` | Cached fetch + loading/error |
| `InlineError` | Load failures with **Retry** |
| `EmptyState` | Missing table config, empty lists, Home welcome |

## Props

```tsx
<ListScreen
  tableKey="myTable"
  title="Optional header override"
  viewId="myTable" // when registered in screens.ts — uses getScreenTitle
  listQuery={{ filterByFormula: '...' }}
/>
```

## Scaffold default

**Developer → Scaffold a screen** defaults to **Generic ListScreen** (thin wrapper). Choose **Inline screen** for the older self-contained generated table.

## Pagination note

The template shows **one API page** (up to 100 rows). If the response includes an `offset`, a hint is shown. Use `listAll()` or build “load more” for full bases.
