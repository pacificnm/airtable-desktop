# Pagination — `listAllRecords`

Airtable returns at most **100 records per request**. When more rows exist, the response includes an `offset` token for the next page.

## REST client

```ts
const { records, truncated, pagesFetched } = await client.listAllRecords(
  tableId,
  {
    view: 'Grid view',
    filterByFormula: '{Status} = "Open"',
    pageSize: 100,
    maxTotal: 5000, // optional safety cap
    maxPages: 100, // optional page cap (default 1000)
    onPage: ({ pageIndex, records, hasMore }) => {
      console.log(`Page ${pageIndex + 1}: ${records.length} rows, more=${hasMore}`)
    },
  },
)
```

- **`truncated`** — `true` if stopped early (`maxTotal`, `maxPages`, or `maxRecords` from query)
- **`pagesFetched`** — number of API calls made (visible in the debug panel Network tab)

`maxRecords` on `ListRecordsQuery` is treated as a total cap (same as `maxTotal`).

## Table config helper

```ts
import { listAllTableRecords } from '../lib/airtable/listAllTableRecords.ts'
import { getTableConfig } from '../config/tables.ts'

const config = getTableConfig('myTable')!
const { records, truncated } = await listAllTableRecords(client, config)
```

Uses `tables.ts` list defaults (`pageSize`, `sort`, `filterByFormula`, `views.default`) and normalizes field names.

## CRUD hook

Generated hooks expose `listAll(query?, { maxTotal?, maxPages? })` alongside `list()` (single page).

## When to use `list()` vs `listAll()`

| Use | When |
|-----|------|
| `list()` | UI tables with “load more”, or you only need the first page |
| `listAll()` | Exports, sync jobs, bulk transforms, small/medium bases |

For very large tables, prefer `maxTotal` + incremental processing via `onPage`.
