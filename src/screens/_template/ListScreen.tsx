/**
 * Generic list screen template — copy to `src/screens/YourTable.tsx`, set `tableKey`,
 * then wire `appView`, `screens.ts`, and `menu.ts` (Developer → Scaffold a screen).
 *
 * Requires a `tables.ts` entry with `fields` / `columns`. Uses `useAirtableListQuery`
 * (no generated CRUD hook required for read-only lists).
 */
import { ListScreen } from '../../components/list/ListScreen.tsx'

export default function ExampleTableList() {
  return <ListScreen tableKey="yourTableKey" title="Your table" />
}
