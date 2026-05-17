# Airtable data fetching (TanStack Query)

The shell uses [@tanstack/react-query](https://tanstack.com/query) for reads and mutations against Airtable. Benefits:

- **Caching** — navigate away and back without refetching immediately (`staleTime` defaults to 30s)
- **Deduping** — two components calling the same query share one request
- **Loading / error** — `isLoading`, `isError`, `error`, `refetch()` without local `useState`
- **Mutations** — after create/update/delete, table queries invalidate automatically

`QueryProvider` wraps the app in `src/main.tsx`. Default client: `src/lib/query/queryClient.ts`.

## Query keys

```ts
import { airtableKeys } from '../lib/query/airtableQueryKeys.ts'

airtableKeys.list('myTable', { pageSize: 50 })
airtableKeys.detail('myTable', recordId)
```

Invalidate everything for a table:

```ts
import { useQueryClient } from '@tanstack/react-query'
import { invalidateAirtableTable } from '../lib/query/invalidateAirtableTable.ts'

await invalidateAirtableTable(queryClient, 'myTable')
```

## Generated hooks (recommended)

From **Developer → Tables**, paste **CRUD hook** then **Query hooks** into `src/hooks/useMyTable.ts`.

```ts
const { data, isLoading, isError, error, refetch } = useMyTableListQuery()
const create = useMyTableCreateMutation()

await create.mutateAsync({ /* fields */ })
```

## Table-key helpers (no CRUD hook)

When you only have `tables.ts` configured:

```ts
import { useAirtableListQuery } from '../hooks/useAirtableTableQuery.ts'

const { data, isLoading } = useAirtableListQuery('myTable')
const records = data?.records ?? []
```

## Primitives

- `useAirtableQuery(options)` — `useQuery` disabled until `useAirtable().isReady`
- `useAirtableMutation({ tableKey, mutationFn })` — invalidates table cache on success

## Pagination

`list()` returns one page (max 100 rows). For full tables, use `client.listAllRecords()` or the hook’s `listAll()` — see **`docs/pagination.md`**.

## Debug panel

Each query `queryFn` uses `fetch` (via `AirtableRestClient`), so requests appear under **Network** in the debug panel.
