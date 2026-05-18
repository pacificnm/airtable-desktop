import { useQuery } from '@tanstack/react-query'
import { useAirtable } from './useAirtable.ts'
import type { BaseSchemaResponse, MetaTableSchema } from '../lib/airtable/metaTypes.ts'

export function baseSchemaQueryKey(baseId: string | null | undefined) {
  return ['airtable', 'baseSchema', baseId ?? 'none'] as const
}

/**
 * Cached full base schema from the Meta API (`schema.bases:read`).
 * Includes field `options` (select choice colors, link targets, rating max, etc.).
 */
export function useBaseSchema() {
  const { client, isReady, baseId } = useAirtable()

  return useQuery({
    queryKey: baseSchemaQueryKey(baseId),
    enabled: isReady && !!client && !!baseId,
    queryFn: async (): Promise<BaseSchemaResponse> => {
      if (!client) throw new Error('Connect to Airtable first.')
      return client.getBaseSchema()
    },
    staleTime: 5 * 60 * 1000,
  })
}

export function findTableInSchema(
  schema: BaseSchemaResponse | undefined,
  tableId: string,
): MetaTableSchema | undefined {
  return schema?.tables.find((t) => t.id === tableId)
}
