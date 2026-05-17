import {
  useQuery,
  type QueryKey,
  type UseQueryOptions,
  type UseQueryResult,
} from '@tanstack/react-query'
import { useAirtable } from './useAirtable.ts'

type AirtableQueryOptions<
  TQueryFnData,
  TError = Error,
  TData = TQueryFnData,
  TQueryKey extends QueryKey = QueryKey,
> = UseQueryOptions<TQueryFnData, TError, TData, TQueryKey> & {
  /** When true (default), the query waits until base id + auth are ready. */
  requiresConnection?: boolean
}

/**
 * `useQuery` that stays disabled until Airtable is connected.
 * Use with {@link airtableKeys} for cache keys shared across screens.
 */
export function useAirtableQuery<
  TQueryFnData,
  TError = Error,
  TData = TQueryFnData,
  TQueryKey extends QueryKey = QueryKey,
>(
  options: AirtableQueryOptions<TQueryFnData, TError, TData, TQueryKey>,
): UseQueryResult<TData, TError> {
  const { isReady } = useAirtable()
  const { requiresConnection = true, enabled, ...rest } = options

  const connectionOk = !requiresConnection || isReady
  const queryEnabled = (enabled ?? true) && connectionOk

  return useQuery({
    ...rest,
    enabled: queryEnabled,
  })
}
