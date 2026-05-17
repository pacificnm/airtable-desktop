import type { MetaTableSchema } from './metaTypes.ts'
import {
  configKeyFromTableName,
  hookNameFromConfigKey,
  pascalFromConfigKey,
} from './tableCodegen.ts'

/**
 * Pasteable TanStack Query wrappers around a generated CRUD hook.
 * Add to the bottom of `src/hooks/useYourTable.ts` (imports at top).
 */
export function generateQueryHooksSnippet(
  table: MetaTableSchema,
  options?: { key?: string },
): string {
  const configKey = configKeyFromTableName(table.name, options?.key)
  const pascal = pascalFromConfigKey(configKey)
  const hookName = hookNameFromConfigKey(configKey)
  const createType = `${pascal}Create`
  const patchType = `${pascal}Patch`

  return `// --- TanStack Query (paste below your CRUD hook in the same file) ---
import { useAirtableQuery } from './useAirtableQuery.ts'
import { useAirtableMutation } from './useAirtableMutation.ts'
import { airtableKeys } from '../lib/query/airtableQueryKeys.ts'
import type { ListRecordsQuery } from '../lib/airtable/types.ts'

/** Cached list — deduped, refetchable (\`refetch()\`, window focus). */
export function ${hookName}ListQuery(query?: ListRecordsQuery) {
  const api = ${hookName}()
  return useAirtableQuery({
    queryKey: airtableKeys.list(TABLE_KEY, query),
    enabled: api.isReady,
    queryFn: () => api.list(query),
  })
}

/** Cached record by id. */
export function ${hookName}RecordQuery(recordId: string | null | undefined) {
  const api = ${hookName}()
  const id = recordId?.trim() ?? ''
  return useAirtableQuery({
    queryKey: airtableKeys.detail(TABLE_KEY, id),
    enabled: api.isReady && !!id,
    queryFn: () => api.get(id),
  })
}

export function ${hookName}CreateMutation() {
  const api = ${hookName}()
  return useAirtableMutation({
    tableKey: TABLE_KEY,
    mutationFn: (values: ${createType}) => api.create(values),
  })
}

export function ${hookName}UpdateMutation() {
  const api = ${hookName}()
  return useAirtableMutation({
    tableKey: TABLE_KEY,
    mutationFn: (input: {
      recordId: string
      values: ${patchType}
      destructive?: boolean
    }) => api.update(input.recordId, input.values, { destructive: input.destructive }),
  })
}

export function ${hookName}RemoveMutation() {
  const api = ${hookName}()
  return useAirtableMutation({
    tableKey: TABLE_KEY,
    mutationFn: (recordId: string) => api.remove(recordId),
  })
}

// Example screen usage:
// const { data, isLoading, isError, error, refetch } = ${hookName}ListQuery()
// const create = ${hookName}CreateMutation()
// await create.mutateAsync({ /* ${createType} */ })
`
}
