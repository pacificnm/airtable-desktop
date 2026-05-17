import { useCallback, useState } from 'react'
import { useAirtable } from './useAirtable.ts'
import type { MetaTableSchema } from '../lib/airtable/metaTypes.ts'
import { AirtableApiError } from '../lib/airtable/errors.ts'

export function useTableSchemaLookup() {
  const { client, isReady, baseId } = useAirtable()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const lookupByTableId = useCallback(
    async (tableId: string): Promise<MetaTableSchema> => {
      const id = tableId.trim()
      if (!id) {
        throw new AirtableApiError('Enter a table id (e.g. tblXXXXXXXXXXXXXX).', {
          status: 400,
        })
      }
      if (!client || !isReady) {
        throw new AirtableApiError(
          'Connect Airtable first (base id + PAT or OAuth). Token needs schema.bases:read.',
          { status: 401 },
        )
      }

      setLoading(true)
      setError(null)
      try {
        return await client.findTableById(id)
      } catch (err) {
        const message =
          err instanceof AirtableApiError
            ? err.message
            : err instanceof Error
              ? err.message
              : 'Lookup failed'
        setError(message)
        throw err
      } finally {
        setLoading(false)
      }
    },
    [client, isReady],
  )

  return { lookupByTableId, loading, error, baseId, isReady }
}
